"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  flows,
  infoContent,
  type Flow,
  type FlowKey,
  type InfoKey,
} from "@/lib/flows";

import AccessForm from "@/components/access/AccessForm";

type ModalRequest =
  | { kind: "form"; key: FlowKey }
  | { kind: "info"; key: InfoKey; subject?: string };
const DialogContext = createContext<(request: ModalRequest) => void>(() => {});
export function useDialog() {
  return useContext(DialogContext);
}
export function Action({
  flow,
  info,
  children,
  className = "button",
  subject,
}: {
  flow?: FlowKey;
  info?: InfoKey;
  children: React.ReactNode;
  className?: string;
  subject?: string;
}) {
  const open = useDialog();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (flow) open({ kind: "form", key: flow });
        else if (info) open({ kind: "info", key: info, subject });
      }}
    >
      {children}
    </button>
  );
}
function Logo() {
  return (
    <Image
      src="/gemu/logo-white.png"
      alt="Gemu Engine"
      width={1600}
      height={327}
      className="logo"
      unoptimized
    />
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [request, setRequest] = useState<ModalRequest | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  function open(next: ModalRequest) {
    if (!request)
      opener.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    setRequest(next);
  }
  function close() {
    setRequest(null);
    requestAnimationFrame(() => opener.current?.focus());
  }
  return (
    <DialogContext.Provider value={open}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header dark">
        <div className="container header-inner">
          <Link href="/" aria-label="Gemu home" onClick={() => setMenu(false)}>
            <Logo />
          </Link>
          <button
            className="menu-toggle"
            aria-expanded={menu}
            aria-controls="main-navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? "Close" : "Menu"}{" "}
            <span aria-hidden="true">{menu ? "×" : "+"}</span>
          </button>
          <nav
            id="main-navigation"
            aria-label="Main navigation"
            className={menu ? "is-open" : ""}
          >
            {[
              ["/", "Home"],
              ["/community", "Community"],
              ["/assets", "Assets"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  pathname === href ||
                  (href !== "/" && pathname.startsWith(`${href}/`))
                    ? "page"
                    : undefined
                }
                onClick={() => setMenu(false)}
              >
                {label}
              </Link>
            ))}
            <Action flow="engine" className="button mobile-action">
              Request engine access <span aria-hidden="true">↗</span>
            </Action>
          </nav>
          <Action flow="engine" className="button header-action">
            Request engine access <span aria-hidden="true">↗</span>
          </Action>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer dark">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Link href="/" aria-label="Gemu home">
                <Logo />
              </Link>
              <p>Build games. Grow studios.</p>
            </div>
            <div className="footer-group">
              <h2>Build</h2>
              <Link href="/#engine">Gemu Engine</Link>
              <Link href="/community">Developer community</Link>
              <Link href="/assets">Voxel assets</Link>
            </div>
            <div className="footer-group">
              <h2>Get involved</h2>
              <Link href="/#publishing">Publishing</Link>
              <Link href="/#bootcamp">Bootcamp</Link>
              <Link href="/#partners">Investors & licensing</Link>
            </div>
            <div className="footer-group">
              <h2>Stay connected</h2>
              <Action info="docs" className="text-button">
                Documentation
              </Action>
              <Link href="/community">Community forum</Link>
              <Action info="updates" className="text-button">
                News & updates
              </Action>
            </div>
          </div>
          <div className="footer-bottom">
            <span>Gemu · Website draft 2026</span>
            <span>Concept imagery · No live submissions</span>
            <Action info="privacy" className="text-button">
              Privacy & terms
            </Action>
          </div>
        </div>
      </footer>
      {request && (
        <PreviewDialog
          key={`${request.kind}-${request.key}`}
          request={request}
          close={close}
          switchFlow={(key) => open({ kind: "form", key })}
        />
      )}
    </DialogContext.Provider>
  );
}

function PreviewDialog({
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
  const info = request.kind === "info" ? 
  infoContent[request.key] : null;
  const applicationPath =
    request.kind === "form" && (request.key   === "engine" || request.key === "publishing")
      ? request.key
      : null;
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
                {applicationPath ? "Application" : config ? "Form placeholder" : "Preview information"}
      </p>
      <h2 id="dialog-title">{config?.title ?? info?.title}</h2>
      <p id="dialog-intro">{config?.intro ?? info?.copy}</p>
      {request.kind === "info" && request.subject && (
        <p className="disclosure">
          <strong>Selected asset:</strong> {request.subject}
        </p>
      )}
            {applicationPath && <AccessForm initialPath={applicationPath} />}
      {config && !applicationPath && (
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
            {!applicationPath && (
        <button className="button placeholder-done" onClick={close}>
          Done
        </button>
      )}
    </dialog>
  );
}
