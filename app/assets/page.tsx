import type { Metadata } from "next";
import { Suspense } from "react";
import { Assets } from "@/components/assets";
import { getCategoryTitles, getStoreAssets } from "@/lib/store-data";

export const metadata: Metadata = {
  title: "Voxel assets",
  description:
    "Browse voxel models, environments and tools shared by Gemu creators.",
};

export default async function AssetsPage() {
  const [assets, categories] = await Promise.all([
    getStoreAssets(),
    getCategoryTitles(),
  ]);
  return (
    // Assets reads the ?category= search param on the client.
    <Suspense
      fallback={
        <div className="container section">
          <h1>Voxel assets</h1>
          <p>Loading the catalogue…</p>
        </div>
      }
    >
      <Assets assets={assets} categories={categories} />
    </Suspense>
  );
}
