import { AssetCard } from "./asset-card";
import type { StoreAsset } from "@/lib/store";

export function AssetCollection({
  title,
  assets,
  action,
}: {
  title: string;
  assets: StoreAsset[];
  action?: React.ReactNode;
}) {
  return (
    <section className="asset-collection" aria-label={title}>
      <div className="collection-heading">
        <h2>{title}</h2>
        {action}
      </div>
      <div className="market-grid">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </section>
  );
}
