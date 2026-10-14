"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Action } from "./site-shell";
import { AssetCollection } from "./asset-collection";
import { StarRating } from "./star-rating";
import {
  formatFileSize,
  formatPrice,
  formatRating,
  formatReleaseDate,
  starString,
  type StoreAsset,
  type StoreMedia,
} from "@/lib/store";

const informationTabs = ["Overview", "Technical details", "Ratings"] as const;
const RATINGS_TAB = 2;

function MediaView({
  media,
  alt,
  sizes,
  controls,
}: {
  media: StoreMedia;
  alt: string;
  sizes?: string;
  controls?: boolean;
}) {
  return media.type === "video" ? (
    <video
      src={media.url}
      controls={controls}
      muted={!controls}
      playsInline
      preload="metadata"
    />
  ) : (
    <Image
      src={media.url}
      alt={alt}
      width={1600}
      height={1000}
      sizes={sizes}
      unoptimized
    />
  );
}

/** Policy panels shown on every listing (also previewed in the submission editor). */
export function ProductPolicies() {
  return (
    <div className="product-policies">
      <details>
        <summary>License type</summary>
        <p>
          License terms aren&apos;t shown yet. Contact the Gemu team before
          using this asset in a project.
        </p>
      </details>
      <details>
        <summary>Compatibility</summary>
        <p>
          Supported Gemu versions will be listed here as they are confirmed.
        </p>
      </details>
      <details>
        <summary>Purchase & refund policy</summary>
        <p>
          Checkout isn&apos;t available yet. Purchase terms will appear here
          when it is.
        </p>
      </details>
    </div>
  );
}

/** Get asset button (also previewed in the submission editor). */
export function ProductAcquisition({ title }: { title: string }) {
  return (
    <div className="product-acquisition">
      <Action info="acquire" subject={title}>
        Get asset <span aria-hidden="true">↗</span>
      </Action>
    </div>
  );
}

export function AssetDetail({
  asset,
  related,
}: {
  asset: StoreAsset;
  related: StoreAsset[];
}) {
  const [slide, setSlide] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [rating, setRating] = useState({
    count: asset.ratingCount,
    average: asset.ratingAverage,
  });
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const lightbox = useRef<HTMLDialogElement>(null);
  const lightboxClose = useRef<HTMLButtonElement>(null);
  const slides = asset.media;
  const current = slides[slide] ?? null;
  const slideLabel = (media: StoreMedia, index: number) =>
    `${media.type === "video" ? "Video" : "Photo"} ${index + 1}`;

  function showRatings() {
    setActiveTab(RATINGS_TAB);
    requestAnimationFrame(() => tabButtons.current[RATINGS_TAB]?.focus());
  }

  return (
    <div className="container product-page">
      <nav className="asset-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/assets">Assets</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/assets?category=${encodeURIComponent(asset.category)}`}>
          {asset.category}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{asset.title}</span>
      </nav>
      <div className="product-layout">
        <div className="product-media">
          <div className="product-gallery">
            <div className="gallery-stage">
              {current && (
                <MediaView
                  key={current.url}
                  media={current}
                  alt={`${asset.title}, ${slideLabel(current, slide).toLowerCase()}`}
                  sizes="(max-width: 800px) 100vw, 65vw"
                  controls
                />
              )}
              {current?.type === "image" && (
                <button
                  className="gallery-expand"
                  aria-label="Expand image preview"
                  onClick={() => lightbox.current?.showModal()}
                >
                  <span aria-hidden="true">⛶</span>
                </button>
              )}
            </div>
            {slides.length > 1 && (
              <div className="gallery-caption">
                <span>{current && slideLabel(current, slide)}</span>
                <div>
                  <button
                    aria-label="Previous preview"
                    onClick={() =>
                      setSlide((s) => (s + slides.length - 1) % slides.length)
                    }
                  >
                    ←
                  </button>
                  <span>
                    {slide + 1} / {slides.length}
                  </span>
                  <button
                    aria-label="Next preview"
                    onClick={() => setSlide((s) => (s + 1) % slides.length)}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
          {slides.length > 1 && (
            <div className="gallery-thumbnails" aria-label="Preview images">
              {slides.map((media, index) => (
                <button
                  key={media.url}
                  aria-label={`Show ${slideLabel(media, index).toLowerCase()}`}
                  aria-pressed={slide === index}
                  onClick={() => setSlide(index)}
                >
                  <MediaView media={media} alt="" sizes="120px" />
                  <span>{slideLabel(media, index)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <aside className="product-summary" aria-labelledby="asset-title">
          <h1 id="asset-title">{asset.title}</h1>
          <div className="product-creator">
            <span className="creator-avatar" aria-hidden="true">
              ◇
            </span>
            <span>{asset.creatorName}</span>
            <span className="market-category">{asset.category}</span>
          </div>
          <div className="product-rating">
            <span aria-hidden="true">{starString(rating.average)}</span>
            <button className="text-button" onClick={showRatings}>
              {formatRating(rating.average, rating.count)}
            </button>
          </div>
          <div className="product-price">
            <strong>{formatPrice(asset.price)}</strong>
            <p>Purchasing and downloads are coming soon.</p>
          </div>
          <ProductPolicies />
          <ProductAcquisition title={asset.title} />
          <dl className="product-facts">
            <div>
              <dt>File size</dt>
              <dd>{formatFileSize(asset.fileSize)}</dd>
            </div>
            <div>
              <dt>Release date</dt>
              <dd>
                <time dateTime={asset.releasedAt}>
                  {formatReleaseDate(asset.releasedAt)}
                </time>
              </dd>
            </div>
            <div>
              <dt>File format</dt>
              <dd>ZIP (model and textures)</dd>
            </div>
            <div>
              <dt>Support</dt>
              <dd>
                <Action info="assetSupport" className="text-button">
                  Support information
                </Action>
              </dd>
            </div>
          </dl>
        </aside>
        <div className="product-information">
          <div
            className="product-tabs"
            role="tablist"
            aria-label="Asset information"
          >
            {informationTabs.map((label, index) => (
              <button
                key={label}
                ref={(node) => {
                  tabButtons.current[index] = node;
                }}
                id={`asset-tab-${index}`}
                role="tab"
                aria-selected={activeTab === index}
                aria-controls={`asset-panel-${index}`}
                tabIndex={activeTab === index ? 0 : -1}
                onClick={() => setActiveTab(index)}
                onKeyDown={(event) => {
                  let next = index;
                  if (event.key === "ArrowRight")
                    next = (index + 1) % informationTabs.length;
                  else if (event.key === "ArrowLeft")
                    next =
                      (index + informationTabs.length - 1) %
                      informationTabs.length;
                  else if (event.key === "Home") next = 0;
                  else if (event.key === "End")
                    next = informationTabs.length - 1;
                  else return;
                  event.preventDefault();
                  setActiveTab(next);
                  tabButtons.current[next]?.focus();
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {informationTabs.map((label, index) => (
            <section
              key={label}
              id={`asset-panel-${index}`}
              role="tabpanel"
              aria-labelledby={`asset-tab-${index}`}
              tabIndex={0}
              hidden={activeTab !== index}
              className="product-tab-panel"
            >
              {index === 0 ? (
                <>
                  <h2>About this asset</h2>
                  <p className="product-description">{asset.description}</p>
                  <div className="product-tags">
                    <span>{asset.category}</span>
                  </div>
                </>
              ) : index === 1 ? (
                <>
                  <h2>Technical details</h2>
                  <dl className="product-facts">
                    <div>
                      <dt>Download</dt>
                      <dd>One ZIP with the model and its textures</dd>
                    </div>
                    <div>
                      <dt>File size</dt>
                      <dd>{formatFileSize(asset.fileSize)}</dd>
                    </div>
                    <div>
                      <dt>Released</dt>
                      <dd>{formatReleaseDate(asset.releasedAt)}</dd>
                    </div>
                    <div>
                      <dt>Previews</dt>
                      <dd>
                        {slides.filter((m) => m.type === "image").length} photos
                        · {slides.filter((m) => m.type === "video").length}{" "}
                        videos
                      </dd>
                    </div>
                  </dl>
                </>
              ) : (
                <>
                  <h2>Ratings</h2>
                  <p className="product-rating-summary">
                    <span aria-hidden="true">{starString(rating.average)}</span>{" "}
                    {formatRating(rating.average, rating.count)}
                  </p>
                  <StarRating
                    assetId={asset.id}
                    onRated={(count, average) => setRating({ count, average })}
                  />
                </>
              )}
            </section>
          ))}
        </div>
      </div>
      {related.length > 0 && (
        <AssetCollection
          title="You might also explore"
          assets={related}
          action={
            <Link href="/assets" className="text-link">
              Browse all <span aria-hidden="true">→</span>
            </Link>
          }
        />
      )}
      <dialog
        ref={lightbox}
        className="asset-lightbox"
        aria-label={`${asset.title} image preview`}
        onKeyDown={(event) => {
          if (event.key === "Tab") {
            event.preventDefault();
            lightboxClose.current?.focus();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              lightbox.current?.close();
          }
        }}
      >
        <button
          ref={lightboxClose}
          className="dialog-close"
          aria-label="Close image preview"
          onClick={() => lightbox.current?.close()}
        >
          ×
        </button>
        {current?.type === "image" && (
          <MediaView
            media={current}
            alt={`${asset.title}, ${slideLabel(current, slide).toLowerCase()}`}
            sizes="90vw"
          />
        )}
      </dialog>
    </div>
  );
}
