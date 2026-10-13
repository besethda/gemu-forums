import type { Metadata } from "next";
import { Suspense } from "react";
import { Community } from "@/components/community";
export const metadata: Metadata = {
  title: "Community",
  description:
    "Explore Gemu developer questions and conversations in a standalone community forum preview.",
};
export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="container section">
          <h1>Community</h1>
          <p>Loading discussions…</p>
        </div>
      }
    >
      <Community />
    </Suspense>
  );
}
