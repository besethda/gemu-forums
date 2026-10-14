"use client";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Action } from "./site-shell";
import { AssetCollection } from "./asset-collection";
import { AssetCard } from "./asset-card";
import type { StoreAsset } from "@/lib/store";

const NEWEST_COUNT = 5;

export function Assets({
  assets,
  categories,
}: {
  assets: StoreAsset[];
  categories: string[];
}) {
  const params = useSearchParams();
  const categoryFromUrl = params.get("category");
  const initialCategory =
    categoryFromUrl && categories.includes(categoryFromUrl)
      ? categoryFromUrl
      : "all";
  return (
    <AssetCatalogue
      key={initialCategory}
      initialCategory={initialCategory}
      assets={assets}
      categories={categories}
    />
  );
}

function AssetCatalogue({
  initialCategory,
  assets,
  categories,
}: {
  initialCategory: string;
  assets: StoreAsset[];
  categories: string[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("newest");
  const [showAll, setShowAll] = useState(false);
  const browseHeading = useRef<HTMLHeadingElement>(null);
  const query = search.trim().toLowerCase();
  const filtered = assets.filter(
    (asset) =>
      (category === "all" || asset.category === category) &&
      `${asset.title} ${asset.category} ${asset.description}`
        .toLowerCase()
        .includes(query),
  );
  const sorted = [...filtered].sort((a, b) =>
    sort === "name"
      ? a.title.localeCompare(b.title)
      : sort === "price"
        ? a.price - b.price
        : sort === "rating"
          ? (b.ratingAverage ?? 0) - (a.ratingAverage ?? 0) ||
            b.ratingCount - a.ratingCount
          : b.releasedAt.localeCompare(a.releasedAt),
  );
  const browsingAll =
    showAll ||
    !!query ||
    category !== "all" ||
    sort !== "newest" ||
    assets.length <= NEWEST_COUNT;
  function reset() {
    setSearch("");
    setCategory("all");
    setSort("newest");
    setShowAll(false);
  }
  function seeAll() {
    setShowAll(true);
    requestAnimationFrame(() => browseHeading.current?.focus());
  }
  const filtering = !!query || category !== "all";
  return (
    <>
      <section className="market-intro dark">
        <div className="container market-intro-inner">
          <div>
            <h1>Voxel assets</h1>
            <p>Building blocks for your next world.</p>
          </div>
          <Action flow="creator" className="button secondary">
            Share or sell your work <span aria-hidden="true">↗</span>
          </Action>
        </div>
      </section>
      <div className="container market-main">
        <div className="market-toolbar">
          <div className="search-field">
            <label htmlFor="asset-search">Search assets</label>
            <input
              id="asset-search"
              type="search"
              placeholder="Search models, environments and tools"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="asset-category">Category</label>
            <select
              id="asset-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="asset-sort">Sort by</label>
            <select
              id="asset-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="rating">Top rated</option>
              <option value="price">Price: low to high</option>
              <option value="name">Name: A–Z</option>
            </select>
          </div>
        </div>
        <div className="catalogue-note">
          <p>Every asset is reviewed by the Gemu team before it&apos;s listed.</p>
          <span role="status">
            {filtered.length} {filtered.length === 1 ? "asset" : "assets"}
            {filtering ? " found" : " to explore"}
          </span>
        </div>
        {assets.length === 0 ? (
          <div className="empty-state">
            <h3>No assets yet.</h3>
            <p>Be the first to share a model, environment or tool.</p>
            <Action flow="creator">
              Share your work <span aria-hidden="true">↗</span>
            </Action>
          </div>
        ) : browsingAll ? (
          <section className="asset-collection" aria-labelledby="browse-title">
            <div className="collection-heading">
              <h2 id="browse-title" ref={browseHeading} tabIndex={-1}>
                {filtering ? "Search results" : "All assets"}
              </h2>
              {(filtering || sort !== "newest" || showAll) && (
                <button className="text-button" onClick={reset}>
                  Reset catalogue
                </button>
              )}
            </div>
            {sorted.length ? (
              <div className="market-grid">
                {sorted.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No matching assets.</h3>
                <p>Try another search or category.</p>
                <button className="button" onClick={reset}>
                  Clear filters
                </button>
              </div>
            )}
          </section>
        ) : (
          <>
            <AssetCollection
              title="Newest assets"
              assets={sorted.slice(0, NEWEST_COUNT)}
              action={
                <button className="text-button" onClick={seeAll}>
                  See all <span aria-hidden="true">→</span>
                </button>
              }
            />
            <AssetCollection
              title="More to explore"
              assets={sorted.slice(NEWEST_COUNT)}
              action={
                <button className="text-button" onClick={seeAll}>
                  See all <span aria-hidden="true">→</span>
                </button>
              }
            />
          </>
        )}
      </div>
      <section className="market-creator-strip">
        <div className="container">
          <div>
            <h2>Made something worth sharing?</h2>
            <p>Introduce a model, environment or tool of your own.</p>
          </div>
          <Action flow="creator">
            Share or sell your work <span aria-hidden="true">↗</span>
          </Action>
        </div>
      </section>
    </>
  );
}
