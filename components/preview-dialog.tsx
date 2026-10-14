"use client";

import { useEffect, useRef } from "react";
import { flows, infoContent, type Flow, type FlowKey, type InfoKey } from "@/lib/flows";
import AccessForm from "@/components/access/AccessForm";
import FlowForm from "@/components/flow/FlowForm";
import Newsletter from "@/components/newsletter/Newsletter";
import { SubmissionLinkForm } from "@/components/submission-link-form";

export type ModalRequest =
  | { kind: "form"; key: FlowKey }
  | { kind: "info"; key: InfoKey; subject?: string };

export default function PreviewDialog({
  request,
  close,
  switchFlow,
}: {
  request: ModalRequest;
  close: () => void;
  switchFlow: (key: FlowKey) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const config: Flow | null =
    request.kind === "form" ? flows[request.key] : null;
  const info = request.kind === "info" ? infoContent[request.key] : null;
    const applicationPath =
    request.kind === "form" && (request.key === "engine" || request.key === "publishing")
      ? request.key
      : null;
  const isNewsletter = request.kind === "info" && request.key === "updates";


  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      element.close();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="preview-dialog"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-intro"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:enabled, a[href], input:enabled, select:enabled, textarea:enabled, [tabindex="0"]',
          ),
        );
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const box = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            close();
        }
      }}
    >
      <button
        className="dialog-close"
        aria-label="Close dialog"
        onClick={close}
      >
        ×
      </button>
      <p className="eyebrow">
        {applicationPath ? "Application" : request.kind === "form" && request.key === "creator" ? "Share your work" : config ? "Form" : isNewsletter ? "Newsletter" : "Preview information"}
        
      </p>
      <h2 id="dialog-title">{config?.title ?? info?.title}</h2>
      <p id="dialog-intro">{config?.intro ?? info?.copy}</p>
      {request.kind === "info" && request.subject && (
        <p className="disclosure">
          <strong>Selected asset:</strong> {request.subject}
        </p>
      )}
            {applicationPath && <AccessForm initialPath={applicationPath} />}
      {request.kind === "form" && !applicationPath && request.key !== "creator" && (
        <FlowForm flowKey={request.key} />
      )}
      {/* Sharing an asset starts with an email link to /assets/new. */}
      {request.kind === "form" && request.key === "creator" && (
        <SubmissionLinkForm />
      )}
      {isNewsletter && <Newsletter />}
      {!config && !isNewsletter && (
        <button className="button placeholder-done" onClick={close}>
          Done
        </button>
      )}
    </dialog>
  );
}
