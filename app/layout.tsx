import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

const inter = localFont({
  src: "./fonts/Inter-variable.ttf",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Gemu — Build games. Grow studios.",
    template: "%s | Gemu",
  },
  description:
    "Discover Gemu's voxel engine, publishing, developer community and creator ecosystem. A first-draft local preview.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
