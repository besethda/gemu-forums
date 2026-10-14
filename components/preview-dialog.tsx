"use client";

import { useEffect, useRef } from "react";
import { flows, infoContent, type Flow, type FlowKey, type InfoKey } from "@/lib/flows";

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
        {config ? "Form placeholder" : "Preview information"}
      </p>
      <h2 id="dialog-title">{config?.title ?? info?.title}</h2>
      <p id="dialog-intro">{config?.intro ?? info?.copy}</p>
      {request.kind === "info" && request.subject && (
        <p className="disclosure">
          <strong>Selected asset:</strong> {request.subject}
        </p>
      )}
      {config && (
        <>
          <p className="disclosure">
            This form is a visual placeholder. Fields and submission are
            unavailable in this first draft. Nothing is sent, saved or emailed.
          </p>
          <fieldset disabled className="placeholder-fields">
            <legend className="sr-only">
              Planned fields — unavailable in this draft
            </legend>
            <div className="form-fields">
              {config.fields.map((field) => (
                <div
                  key={field.name}
                  className={
                    field.type === "textarea" ? "field field-wide" : "field"
                  }
                >
                  <label htmlFor={`field-${field.name}`}>{field.label}</label>
                  {field.type === "select" ? (
                    <select id={`field-${field.name}`} defaultValue="">
                      <option value="">Choose an option</option>
                      {field.options?.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      id={`field-${field.name}`}
                      rows={3}
                      placeholder="Details will go here"
                    />
                  ) : (
                    <input
                      id={`field-${field.name}`}
                      type={field.type ?? "text"}
                      placeholder={
                        field.type === "email"
                          ? "you@example.com"
                          : field.type === "url"
                            ? "https://…"
                            : field.label
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </fieldset>
          {request.kind === "form" &&
            (request.key === "engine" || request.key === "publishing") && (
              <button
                type="button"
                className="text-button form-switch"
                onClick={() =>
                  switchFlow(request.key === "engine" ? "publishing" : "engine")
                }
              >
                {request.key === "engine"
                  ? "View publishing placeholder"
                  : "View engine access placeholder"}
              </button>
            )}
        </>
      )}
      <button className="button placeholder-done" onClick={close}>
        Done
      </button>
    </dialog>
  );
}
