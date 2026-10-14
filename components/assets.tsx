"use client";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Action } from "./site-shell";
import { AssetCollection } from "./asset-collection";
import { AssetCard } from "./asset-card";
import { sampleAssets, categories } from "@/lib/demo-data";

const AssetDetail = dynamic(() =>
  import("./asset-detail").then((module) => module.AssetDetail),
);

export function Assets() {
  const params = useSearchParams();
  const legacyAsset = sampleAssets.find(
    (asset) => asset.id === params.get("asset"),
  );
  const categoryFromUrl = params.get("category");
  const initialCategory =
    categoryFromUrl && categories.includes(categoryFromUrl)
      ? categoryFromUrl
      : "all";
  return legacyAsset ? (
    <AssetDetail key={legacyAsset.id} asset={legacyAsset} />
  ) : (
    <AssetCatalogue key={initialCategory} initialCategory={initialCategory} />
  );
}
function AssetCatalogue({ initialCategory }: { initialCategory: string }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("recommended");
  const [showAll, setShowAll] = useState(false);
  const browseHeading = useRef<HTMLHeadingElement>(null);
  const query = search.trim().toLowerCase();
  const filtered = sampleAssets.filter(
    (asset) =>
      (category === "all" || asset.category === category) &&
      `${asset.name} ${asset.category} ${asset.creator} ${asset.description}`
        .toLowerCase()
        .includes(query),
  );
  const sorted = [...filtered].sort((a, b) =>
    sort === "name"
      ? a.name.localeCompare(b.name)
      : sort === "category"
        ? a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
        : 0,
  );
  const browsingAll =
    showAll || !!query || category !== "all" || sort !== "recommended";
  function reset() {
    setSearch("");
    setCategory("all");
    setSort("recommended");
    setShowAll(false);
  }
  function seeAll() {
    setShowAll(true);
    requestAnimationFrame(() => browseHeading.current?.focus());
  }
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
              <option value="recommended">Featured order</option>
              <option value="name">Name: A–Z</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
        <div className="catalogue-note">
          <p>
            Preview catalogue · Fictional creators and placeholder prices.
            Reviews and downloads are unavailable.
          </p>
          <span role="status">
            {filtered.length} sample assets
            {query || category !== "all" ? " found" : " to explore"}
          </span>
        </div>
        {browsingAll ? (
          <section className="asset-collection" aria-labelledby="browse-title">
            <div className="collection-heading">
              <h2 id="browse-title" ref={browseHeading} tabIndex={-1}>
                {query || category !== "all" ? "Search results" : "All assets"}
              </h2>
              <button className="text-button" onClick={reset}>
                Reset catalogue
              </button>
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
                <p>
                  Try another search or category to explore the sample
                  catalogue.
                </p>
                <button className="button" onClick={reset}>
                  Clear filters
                </button>
              </div>
            )}
          </section>
        ) : (
          <>
            <AssetCollection
              title="Featured assets"
              assets={sampleAssets.filter((a) => a.featured)}
              action={
                <button className="text-button" onClick={seeAll}>
                  See all <span aria-hidden="true">→</span>
                </button>
              }
            />
            <AssetCollection
              title="More to explore"
              assets={sampleAssets.filter((a) => !a.featured)}
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
