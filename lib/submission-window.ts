// A verified email link gives the creator this long to post one asset.
// Keep in sync with can_submit_asset() in supabase/migrations.
export const SUBMISSION_WINDOW_MS = 30 * 60 * 1000;

type Claims = { amr?: Array<{ method: string; timestamp: number } | string> };

/** When the email link behind this session was clicked, in ms, or null. */
export function emailLinkSignedInAt(claims: Claims | undefined) {
  const times = (claims?.amr ?? [])
    .filter(
      (entry): entry is { method: string; timestamp: number } =>
        typeof entry === "object" &&
        (entry.method === "otp" || entry.method === "magiclink"),
    )
    .map((entry) => entry.timestamp * 1000);
  return times.length ? Math.max(...times) : null;
}

/** Deadline for posting, in ms since epoch, or null when not signed in by email link. */
export function submissionDeadline(claims: Claims | undefined) {
  const signedInAt = emailLinkSignedInAt(claims);
  return signedInAt === null ? null : signedInAt + SUBMISSION_WINDOW_MS;
}
