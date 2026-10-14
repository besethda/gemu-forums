import Image from "next/image";
import Link from "next/link";
import {
  coverMedia,
  formatPrice,
  starString,
  type StoreAsset,
} from "@/lib/store";

export function categoryIcon(category: string) {
  return category === "Models" ? "◇" : category === "Environments" ? "⊞" : "⌘";
}

export function AssetCard({ asset }: { asset: StoreAsset }) {
  const cover = coverMedia(asset);
  return (
    <article className="market-card">
      <Link
        href={`/assets/${asset.id}`}
        className="market-card-link"
        aria-label={`View ${asset.title}`}
      >
        <div className="market-card-image">
          {cover?.type === "video" ? (
            <video src={cover.url} muted playsInline preload="metadata" />
          ) : cover ? (
            <Image
              src={cover.url}
              alt=""
              width={1200}
              height={800}
              unoptimized
            />
          ) : null}
        </div>
        <div className="market-card-copy">
          <span className="market-category">
            <span aria-hidden="true">{categoryIcon(asset.category)}</span>{" "}
            {asset.category}
          </span>
          <h3>{asset.title}</h3>
          <p className="market-review">
            {asset.ratingAverage === null ? (
              "No ratings"
            ) : (
              <>
                <span aria-hidden="true">{starString(asset.ratingAverage)}</span>{" "}
                <span className="sr-only">
                  Rated {asset.ratingAverage.toFixed(1)} out of 5,
                </span>
                ({asset.ratingCount})
              </>
            )}
          </p>
          <p className="market-creator">{asset.creatorName}</p>
          <strong className="market-price">{formatPrice(asset.price)}</strong>
        </div>
      </Link>
    </article>
  );
}
