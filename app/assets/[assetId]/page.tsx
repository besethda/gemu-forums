import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AssetDetail } from "@/components/asset-detail";
import { sampleAssets } from "@/lib/demo-data";

export function generateStaticParams() {
  return sampleAssets.map((asset) => ({ assetId: asset.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ assetId: string }>;
}): Promise<Metadata> {
  const { assetId } = await params;
  const asset = sampleAssets.find((item) => item.id === assetId);
  return {
    title: asset?.name ?? "Asset not found",
    description: asset?.description,
  };
}
export default async function AssetPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const { assetId } = await params;
  const asset = sampleAssets.find((item) => item.id === assetId);
  if (!asset) notFound();
  return <AssetDetail key={asset.id} asset={asset} />;
}
