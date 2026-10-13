import Image from "next/image";
import Link from "next/link";
import { assetImageSize, formatAssetPrice, type Asset } from "@/lib/demo-data";

export function AssetCard({ asset }: { asset: Asset }) {
  return (
    <article className="market-card">
      <Link
        href={`/assets/${asset.id}`}
        className="market-card-link"
        aria-label={`View ${asset.name}`}
      >
        <div className="market-card-image">
          <Image
            src={`/gemu/${asset.image}`}
            alt={asset.alt}
            {...assetImageSize(asset.image)}
            sizes="(max-width: 359px) 100vw, (max-width: 600px) 50vw, (max-width: 1000px) 33vw, 20vw"
          />
        </div>
        <div className="market-card-copy">
          <span className="market-category">
            <span aria-hidden="true">
              {asset.category === "Models"
                ? "◇"
                : asset.category === "Environments"
                  ? "⊞"
                  : "⌘"}
            </span>{" "}
            {asset.category}
          </span>
          <h3>{asset.name}</h3>
          <p className="market-review">No ratings</p>
          <p className="market-creator">{asset.creator}</p>
          <strong className="market-price">
            {formatAssetPrice(asset.price)}
          </strong>
        </div>
      </Link>
    </article>
  );
}
