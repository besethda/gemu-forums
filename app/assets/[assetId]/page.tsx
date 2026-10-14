import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AssetDetail } from "@/components/asset-detail";
import { getStoreAsset, getStoreAssets } from "@/lib/store-data";

export async function generateMetadata({
  params,
}: PageProps<"/assets/[assetId]">): Promise<Metadata> {
  const { assetId } = await params;
  const asset = await getStoreAsset(assetId);
  return {
    title: asset?.title ?? "Asset not found",
    description: asset?.description.slice(0, 160),
  };
}

export default function AssetPage({ params }: PageProps<"/assets/[assetId]">) {
  return (
    <Suspense
      fallback={
        <div className="container section">
          <p>Loading asset…</p>
        </div>
      }
    >
      <AssetContent params={params} />
    </Suspense>
  );
}

async function AssetContent({
  params,
}: {
  params: PageProps<"/assets/[assetId]">["params"];
}) {
  const { assetId } = await params;
  const [asset, all] = await Promise.all([
    getStoreAsset(assetId),
    getStoreAssets(),
  ]);
  if (!asset) notFound();
  const related = all
    .filter((a) => a.id !== asset.id)
    .sort(
      (a, b) =>
        Number(b.category === asset.category) -
        Number(a.category === asset.category),
    )
    .slice(0, 5);
  return <AssetDetail key={asset.id} asset={asset} related={related} />;
}
