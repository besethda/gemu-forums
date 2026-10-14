"use server";

import { headers } from "next/headers";
import { sendEmail } from "@/lib/send-email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { submissionDeadline } from "@/lib/submission-window";

export type LinkRequestState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string; email: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINKS_PER_HOUR = 3;

/**
 * Step 1: email a one-time sign-in link that leads to /assets/new.
 * The link is generated and sent here on the server; it must never reach the
 * browser that asked for it, or anyone could sign in as any address.
 */
export async function requestSubmissionLink(
  _previous: LinkRequestState,
  formData: FormData,
): Promise<LinkRequestState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", email, message: "Enter a valid email address." };
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (configError) {
    console.error(configError);
    return {
      status: "error",
      email,
      message: "Submissions aren't available right now. Try again later.",
    };
  }
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("submission_link_requests")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", hourAgo);
  if ((count ?? 0) >= LINKS_PER_HOUR) {
    return {
      status: "error",
      email,
      message: "Too many links requested for this address. Try again in an hour.",
    };
  }
  await admin.from("submission_link_requests").insert({ email });

  // Creates the (hidden) user on first use. Nothing is emailed by Supabase.
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (error || !data.properties?.hashed_token) {
    return {
      status: "error",
      email,
      message: "We couldn't create a link for that address. Try again.",
    };
  }

  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ??
    `${requestHeaders.get("x-forwarded-proto") ?? "https"}://${requestHeaders.get("host")}`;
  const link = `${origin}/auth/confirm?token_hash=${encodeURIComponent(
    data.properties.hashed_token,
  )}&type=email&next=/assets/new`;

  try {
    await sendEmail({
      toEmail: email,
      subject: "Your Gemu asset submission link",
      message: [
        "Use this link to submit your asset to the Gemu store:",
        link,
        "The link works once and expires in 30 minutes. After opening it you have 30 minutes to post one asset.",
        "If you didn't ask for this, you can ignore this email.",
      ].join("\n\n"),
    });
  } catch (sendError) {
    console.error("Submission link email failed", sendError);
    return {
      status: "error",
      email,
      message: "We couldn't send the email. Try again in a moment.",
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
