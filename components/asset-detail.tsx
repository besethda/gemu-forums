"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Action } from "./site-shell";
import { AssetCollection } from "./asset-collection";
import {
  assetImageSize,
  formatAssetPrice,
  sampleAssets,
  type Asset,
} from "@/lib/demo-data";

const informationTabs = ["Overview", "Technical details", "Reviews"] as const;
export function AssetDetail({ asset }: { asset: Asset }) {
  const [slide, setSlide] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const lightbox = useRef<HTMLDialogElement>(null);
  const lightboxClose = useRef<HTMLButtonElement>(null);
  const contextImage =
    asset.image === "voxel-world.webp" ? "voxel-cabin.webp" : "voxel-world.webp";
  const slides = [
    { image: asset.image, alt: asset.alt, label: "Asset concept" },
    {
      image: contextImage,
      alt:
        contextImage === "voxel-world.webp"
          ? "Related voxel forest and riverside world concept"
          : "Related modular voxel cabin concept",
      label: "Related world concept",
    },
  ];
  const current = slides[slide];
  return (
    <div className="container product-page">
      <nav className="asset-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/assets">Assets</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/assets?category=${asset.category}`}>
          {asset.category}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{asset.name}</span>
      </nav>
      <div className="product-layout">
        <div className="product-media">
          <div className="product-gallery">
            <div className="gallery-stage">
              <Image
                key={current.image}
                src={`/gemu/${current.image}`}
                alt={current.alt}
                {...assetImageSize(current.image)}
                sizes="(max-width: 500px) calc(100vw - 32px), (max-width: 800px) calc(100vw - 48px), (max-width: 1000px) calc(58.33vw - 52px), (max-width: 1100px) calc(63.64vw - 61px), (max-width: 1296px) calc(63.64vw - 82px), 743px"
                preload
              />
              <button
                className="gallery-expand"
                aria-label="Expand image preview"
                onClick={() => lightbox.current?.showModal()}
              >
                <span aria-hidden="true">⛶</span>
              </button>
            </div>
            <div className="gallery-caption">
              <span>{current.label} · AI illustration</span>
              <div>
                <button
                  aria-label="Previous preview"
                  onClick={() =>
                    setSlide(
                      (current) =>
                        (current + slides.length - 1) % slides.length,
                    )
                  }
                >
                  ←
                </button>
                <span>
                  {slide + 1} / {slides.length}
                </span>
                <button
                  aria-label="Next preview"
                  onClick={() =>
                    setSlide((current) => (current + 1) % slides.length)
                  }
                >
                  →
                </button>
              </div>
            </div>
          </div>
          <div className="gallery-thumbnails" aria-label="Preview images">
            {slides.map((image, index) => (
              <button
                key={image.image}
                aria-label={`Show ${image.label.toLowerCase()}`}
                aria-pressed={slide === index}
                onClick={() => setSlide(index)}
              >
                <Image
                  src={`/gemu/${image.image}`}
                  alt=""
                  {...assetImageSize(image.image)}
                  sizes="120px"
                />
                <span>{image.label}</span>
              </button>
            ))}
          </div>
        </div>
        <aside className="product-summary" aria-labelledby="asset-title">
          <h1 id="asset-title">{asset.name}</h1>
          <div className="product-creator">
            <span className="creator-avatar" aria-hidden="true">
              ◇
            </span>
            <span>{asset.creator}</span>
            <span className="market-category">{asset.category}</span>
          </div>
          <div className="product-rating">
            <span aria-hidden="true">☆☆☆☆☆</span>
            <Action info="assetReviews" className="text-button">
              Reviews unavailable
            </Action>
          </div>
          <div className="product-price">
            <strong>{formatAssetPrice(asset.price)}</strong>
            <p>Placeholder price · Acquisition unavailable</p>
          </div>
          <div className="product-policies">
            <details>
              <summary>License type</summary>
              <p>
                No license has been supplied. Creator rights and permitted uses
                must be established before an asset can be offered.
              </p>
            </details>
            <details>
              <summary>Compatibility</summary>
              <p>
                Supported Gemu versions, asset formats and import steps have not
                been verified. These previews contain no engine-ready files.
              </p>
            </details>
            <details>
              <summary>Purchase & refund policy</summary>
              <p>
                This preview has no checkout or transaction. Purchase terms and
                any applicable refund policy remain to be supplied.
              </p>
            </details>
          </div>
          <div className="product-acquisition">
            <Action info="acquire" subject={asset.name}>
              Get asset — preview <span aria-hidden="true">↗</span>
            </Action>
            <Action
              info="assetCart"
              subject={asset.name}
              className="product-icon-button"
            >
              <span className="sr-only">Cart placeholder</span>
              <span aria-hidden="true">⊞</span>
            </Action>
            <Action
              info="assetSave"
              subject={asset.name}
              className="product-icon-button"
            >
              <span className="sr-only">Save asset placeholder</span>
              <span aria-hidden="true">♡</span>
            </Action>
          </div>
          <p className="product-transaction-note">
            No purchase or download is available in this draft.
          </p>
          <dl className="product-facts">
            <div>
              <dt>License agreement</dt>
              <dd>Not established</dd>
            </div>
            <div>
              <dt>File size</dt>
              <dd>Not supplied</dd>
            </div>
            <div>
              <dt>Latest version</dt>
              <dd>Not supplied</dd>
            </div>
            <div>
              <dt>Release date</dt>
              <dd>Not supplied</dd>
            </div>
            <div>
              <dt>Gemu compatibility</dt>
              <dd>Unverified</dd>
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
                  <p>{asset.description}</p>
                  <div className="product-tags">
                    <span>Voxel concept</span>
                    <span>{asset.category}</span>
                  </div>
                  <p className="small">
                    The preview gallery includes an asset concept and a separate
                    world concept for context. These are AI illustrations, not
                    screenshots of an actual asset running in Gemu.
                  </p>
                </>
              ) : index === 1 ? (
                <>
                  <h2>Technical details</h2>
                  <dl className="product-facts">
                    <div>
                      <dt>Available content</dt>
                      <dd>Concept artwork only</dd>
                    </div>
                    <div>
                      <dt>Asset files</dt>
                      <dd>Not supplied</dd>
                    </div>
                    <div>
                      <dt>File format</dt>
                      <dd>To be confirmed</dd>
                    </div>
                    <div>
                      <dt>Engine compatibility</dt>
                      <dd>Not verified</dd>
                    </div>
                    <div>
                      <dt>Dependencies</dt>
                      <dd>Not established</dd>
                    </div>
                  </dl>
                </>
              ) : (
                <div className="product-review-empty">
                  <h2>No reviews to show.</h2>
                  <p>
                    Ratings and reviews will appear here when real listings and
                    review features are available.
                  </p>
                  <Action info="assetReviews" className="text-button">
                    About reviews <span aria-hidden="true">↗</span>
                  </Action>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
      <AssetCollection
        title="You might also explore"
        assets={sampleAssets.filter((a) => a.id !== asset.id).slice(0, 5)}
        action={
          <Link href="/assets" className="text-link">
            Browse all <span aria-hidden="true">→</span>
          </Link>
        }
      />
      <dialog
        ref={lightbox}
        className="asset-lightbox"
        aria-label={`${asset.name} image preview`}
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
        <Image
          src={`/gemu/${current.image}`}
          alt={current.alt}
          {...assetImageSize(current.image)}
          sizes="(max-width: 600px) calc(100vw - 64px), (max-width: 1232px) calc(100vw - 80px), 1150px"
        />
        <p className="small">{current.label} · AI concept illustration</p>
      </dialog>
    </div>
  );
}
