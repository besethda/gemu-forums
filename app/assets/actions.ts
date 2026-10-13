"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { submissionDeadline } from "@/lib/submission-window";

export type LinkRequestState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string; email: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Step 1: email a one-time sign-in link that leads to /assets/new. */
export async function requestSubmissionLink(
  _previous: LinkRequestState,
  formData: FormData,
): Promise<LinkRequestState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", email, message: "Enter a valid email address." };
  }

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/assets/new`,
    },
  });

  if (error) {
    return {
      status: "error",
      email,
      message:
        error.status === 429
          ? "Too many links requested. Wait a few minutes and try again."
          : "We couldn't send the link. Check the address and try again.",
    };
  }
  return { status: "sent", email };
}

export type MediaRef = { path: string; type: "image" | "video" };

export type NewAsset = {
  title: string;
  description: string;
  categoryId: number;
  modelPath: string;
  media: MediaRef[];
};

/**
 * Step 2: save a submission whose files the browser has already uploaded to
 * storage. Row level security repeats every check here, so this is the
 * friendly path, not the only line of defence.
 */
export async function createAsset(
  input: NewAsset,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const deadline = submissionDeadline(claims);
  if (!claims?.sub || deadline === null) {
    return { ok: false, error: "Your link isn't valid. Request a new one." };
  }
  if (Date.now() > deadline) {
    return { ok: false, error: "Your 30 minutes are up. Request a new link." };
  }

  const userId = claims.sub;
  const title = input.title.trim();
  const description = input.description.trim();
  const ownPath = (path: string) =>
    typeof path === "string" && path.startsWith(`${userId}/`);
  if (
    !title ||
    title.length > 80 ||
    !description ||
    description.length > 2000 ||
    !Number.isInteger(input.categoryId) ||
    !ownPath(input.modelPath) ||
    input.media.length === 0 ||
    !input.media.every(
      (m) => ownPath(m.path) && (m.type === "image" || m.type === "video"),
    )
  ) {
    return { ok: false, error: "Some details are missing or invalid." };
  }

  const { data: allowed } = await supabase.rpc("can_submit_asset");
  if (!allowed) {
    return {
      ok: false,
      error: "This link has already been used to post. Request a new one.",
    };
  }

  let { data: creator } = await supabase
    .from("creators")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!creator) {
    const inserted = await supabase
      .from("creators")
      .insert({ user_id: userId, email: claims.email ?? null })
      .select("id")
      .single();
    if (inserted.error) {
      return { ok: false, error: "We couldn't save your submission. Try again." };
    }
    creator = inserted.data;
  }

  // No .select(): pending assets aren't readable, so returning the row would fail.
  const { error } = await supabase.from("assets").insert({
    title,
    description,
    category: input.categoryId,
    creator: creator.id,
    asset: input.modelPath,
    media: input.media,
  });
  if (error) {
    return { ok: false, error: "We couldn't save your submission. Try again." };
  }

  // One post per link: end the session so the link can't be reused.
  await supabase.auth.signOut();
  return { ok: true };
}
