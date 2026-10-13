import type { Metadata } from "next";
import { Suspense } from "react";
import { Assets } from "@/components/assets";
export const metadata: Metadata = {
  title: "Voxel assets",
  description:
    "Browse sample voxel models, environments and tools. Explore the Gemu creator catalogue concept.",
};
export default function AssetsPage() {
  return (
    <Suspense
      fallback={
        <div className="container section">
          <h1>Voxel assets</h1>
          <p>Loading sample catalogue…</p>
        </div>
      }
    >
      <Assets />
    </Suspense>
  );
}
