import type { Metadata } from "next";
import { Suspense } from "react";
import { Community } from "@/components/community";
export const metadata: Metadata = {
  title: "Community",
  description:
    "Explore Gemu developer questions and sample discussions in a standalone forum preview.",
};
export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="container section">
          <h1>Developer community</h1>
          <p>Loading sample discussions…</p>
        </div>
      }
    >
      <Community />
    </Suspense>
  );
}
