import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { AssetSubmissionForm } from "@/components/asset-submission-form";
import { SubmissionLinkForm } from "@/components/submission-link-form";
import { createClient } from "@/lib/supabase/server";
import { submissionDeadline } from "@/lib/submission-window";

export const metadata: Metadata = {
  title: "Submit an asset",
  robots: { index: false },
};

export default function NewAssetPage({
  searchParams,
}: PageProps<"/assets/new">) {
  return (
    <div className="container section submit-page">
      <p className="eyebrow">Share your work</p>
      <h1>Submit an asset</h1>
      <Suspense fallback={<p>Checking your link…</p>}>
        <SubmissionGate searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

type Gate =
  | { kind: "no-session" }
  | { kind: "expired" }
  | { kind: "used" }
  | {
      kind: "open";
      userId: string;
      deadline: number;
      categories: { id: number; title: string }[];
    };

/** Whether this request may submit: an email-link session under 30 minutes old that hasn't posted yet. */
async function checkSubmissionGate(): Promise<Gate> {
  // Everything below depends on the current time, so it must run per request.
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const deadline = submissionDeadline(claims);
  if (!claims?.sub || deadline === null) return { kind: "no-session" };
  if (Date.now() > deadline) return { kind: "expired" };

  const { data: allowed } = await supabase.rpc("can_submit_asset");
  if (!allowed) return { kind: "used" };

  const { data: categories } = await supabase
    .from("categories")
    .select("id, title")
    .order("title");
  return {
    kind: "open",
    userId: claims.sub,
    deadline,
    categories: categories ?? [],
  };
}

async function SubmissionGate({
  searchParams,
}: {
  searchParams: PageProps<"/assets/new">["searchParams"];
}) {
  const [{ link }, gate] = await Promise.all([
    searchParams,
    checkSubmissionGate(),
  ]);

  switch (gate.kind) {
    case "no-session":
      return (
        <RequestLink
          message={
            link === "invalid"
              ? "That link has expired or was already used. Request a new one below."
              : "Submitting an asset starts with your email. We'll send you a link that's valid for 30 minutes."
          }
        />
      );
    case "expired":
      return (
        <RequestLink message="Your 30 minutes with this link are up. Request a new one to submit." />
      );
    case "used":
      return (
        <RequestLink message="This link has already been used to submit an asset. Request a new one to submit another." />
      );
    case "open":
      return (
        <>
          <p>
            Introduce your model, environment or tool. The Gemu team reviews
            every submission before it&apos;s listed.
          </p>
          <AssetSubmissionForm
            userId={gate.userId}
            deadline={gate.deadline}
            categories={gate.categories}
          />
        </>
      );
  }
}

function RequestLink({ message }: { message: string }) {
  return (
    <>
      <p>{message}</p>
      <SubmissionLinkForm />
    </>
  );
}
