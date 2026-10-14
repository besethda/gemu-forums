"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, Suspense, useContext, useRef, useState } from "react";
import type { FlowKey, InfoKey } from "@/lib/flows";
import type { ModalRequest } from "./preview-dialog";

const PreviewDialog = dynamic(() => import("./preview-dialog"));

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
      src="/gemu/logo-white.webp"
      alt="Gemu Engine"
      width={1600}
      height={327}
      className="logo"
      unoptimized
    />
  );
}

const NAV_LINKS = [
  ["/", "Home"],
  ["/community", "Community"],
  ["/assets", "Assets"],
] as const;

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname?: string;
  onNavigate: () => void;
}) {
  return NAV_LINKS.map(([href, label]) => (
    <Link
      key={href}
      href={href}
      aria-current={
        pathname === href ||
        (pathname && href !== "/" && pathname.startsWith(`${href}/`))
          ? "page"
          : undefined
      }
      onClick={onNavigate}
    >
      {label}
    </Link>
  ));
}

function ActiveNavLinks({ onNavigate }: { onNavigate: () => void }) {
  return <NavLinks pathname={usePathname()} onNavigate={onNavigate} />;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
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
            {/* Pages like /assets/[assetId] only know their path at request
                time, so the active-link highlight streams in. */}
            <Suspense fallback={<NavLinks onNavigate={() => setMenu(false)} />}>
              <ActiveNavLinks onNavigate={() => setMenu(false)} />
            </Suspense>
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
            <span>Concept imagery · Hackathon prototype</span>
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
