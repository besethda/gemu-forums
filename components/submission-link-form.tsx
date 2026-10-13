"use client";

import { useActionState, useId } from "react";
import {
  requestSubmissionLink,
  type LinkRequestState,
} from "@/app/assets/actions";

const initialState: LinkRequestState = { status: "idle" };

/** Asks for an email and sends a one-time link to the submission page. */
export function SubmissionLinkForm() {
  const id = useId();
  const [state, formAction, pending] = useActionState(
    requestSubmissionLink,
    initialState,
  );

  if (state.status === "sent") {
    return (
      <div role="status" className="link-form-sent">
        <p className="eyebrow">Check your inbox</p>
        <p>
          We sent a link to <strong>{state.email}</strong>. Open it within 30
          minutes; you&apos;ll then have 30 minutes to post one asset.
        </p>
        <p className="small">
          No email? Check your spam folder, or wait a minute and request
          another.
        </p>
      </div>
    );
  }

  const error = state.status === "error" ? state.message : "";
  return (
    <form action={formAction} className="link-form" noValidate>
      <label htmlFor={`${id}-email`}>Email</label>
      <div className="link-form-row">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          defaultValue={state.status === "error" ? state.email : ""}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
        />
        <button type="submit" className="button" disabled={pending}>
          {pending ? "Sending…" : "Send link"}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="asset-form-error">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className="small">
          No account needed. We only use your email to verify the submission
          and contact you about its review.
        </p>
      )}
    </form>
  );
}
