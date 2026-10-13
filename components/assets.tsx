"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Action } from "./site-shell";
import { sampleAssets, categories } from "@/lib/demo-data";

export function Assets() {
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<string | null>(params.get("asset"));
  const detail = useRef<HTMLElement>(null);
  const cards = useRef<Record<string, HTMLButtonElement | null>>({});
  const query = search.trim().toLowerCase();
  const filtered = sampleAssets.filter(
    (asset) =>
      (category === "all" || asset.category === category) &&
      `${asset.name} ${asset.category} ${asset.description}`
        .toLowerCase()
        .includes(query),
  );
  const asset = filtered.find((a) => a.id === selected);
  function reset() {
    setSearch("");
    setCategory("all");
    setSelected(null);
  }
  return (
    <>
      <section className="page-intro dark grid-surface">
        <div className="container page-intro-layout">
          <div>
            <p className="eyebrow">Voxel creator marketplace</p>
            <h1>
              Build on what
              <br />
              others make.
            </h1>
            <p className="lead">
              Explore models, environments and tools.
              <br />
              Find a place for your own creations.
            </p>
            <Action flow="creator">
              Share or sell your work <span aria-hidden="true">↗</span>
            </Action>
          </div>
          <figure className="intro-visual asset-intro">
            <Image
              src="/gemu/voxel-robot.png"
              alt="Friendly voxel utility robot concept with complete silhouette"
              width={1448}
              height={1086}
              sizes="(max-width: 800px) 100vw, 35vw"
              preload
            />
            <figcaption>AI concept illustration · Sample asset</figcaption>
          </figure>
        </div>
      </section>
      <section
        className="section container browse-section"
        aria-labelledby="assets-heading"
      >
        <div className="section-heading">
          <h2 id="assets-heading">Explore voxel assets</h2>
          <span className="tag">Sample catalogue · No real products</span>
        </div>
        <div className="filter-row">
          <div className="search-field">
            <label htmlFor="asset-search">Search assets</label>
            <input
              id="asset-search"
              type="search"
              placeholder="Try cabin, forest or robot"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelected(null);
              }}
            />
          </div>
          <div>
            <label htmlFor="asset-category">Category</label>
            <select
              id="asset-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSelected(null);
              }}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="result-count" role="status">
          {filtered.length} sample listing{filtered.length !== 1 && "s"}
          {query || category !== "all"
            ? " matching your filters"
            : " to explore"}
        </p>
        <div className={`assets-layout ${asset ? "has-detail" : ""}`}>
          <div className="asset-grid">
            {filtered.map((a) => (
              <article
                key={a.id}
                className={`asset-card ${selected === a.id ? "selected" : ""}`}
              >
                <button
                  ref={(node) => {
                    cards.current[a.id] = node;
                  }}
                  className="asset-select"
                  aria-label={`View ${a.name}`}
                  aria-pressed={selected === a.id}
                  aria-controls={asset ? "asset-detail" : undefined}
                  onClick={() => {
                    setSelected(a.id);
                    requestAnimationFrame(() => detail.current?.focus());
                  }}
                >
                  <div className="asset-image">
                    <Image
                      src={`/gemu/${a.image}`}
                      alt={a.alt}
                      width={a.image === "voxel-world.png" ? 1672 : 1448}
                      height={a.image === "voxel-world.png" ? 941 : 1086}
                      sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                    />
                  </div>
                  <div className="asset-card-copy">
                    <span className="eyebrow">{a.category}</span>
                    <h3>
                      {a.name} <span aria-hidden="true">↗</span>
                    </h3>
                    <p className="small">Concept image · Sample listing</p>
                  </div>
                </button>
              </article>
            ))}
            {!filtered.length && (
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
          </div>
          {asset && (
            <section
              ref={detail}
              tabIndex={-1}
              className="detail-panel asset-detail"
              id="asset-detail"
              aria-labelledby="asset-title"
            >
              <button
                className="text-button close-detail"
                onClick={() => {
                  setSelected(null);
                  cards.current[asset.id]?.focus();
                }}
              >
                Close detail <span aria-hidden="true">×</span>
              </button>
              <p className="eyebrow">{asset.category} · Sample listing</p>
              <h2 id="asset-title">{asset.name}</h2>
              <Image
                src={`/gemu/${asset.image}`}
                alt={asset.alt}
                width={asset.image === "voxel-world.png" ? 1672 : 1448}
                height={asset.image === "voxel-world.png" ? 941 : 1086}
                className="detail-image"
                sizes="(max-width: 800px) 100vw, 40vw"
              />
              <p>{asset.description}</p>
              <dl className="asset-facts">
                <div>
                  <dt>Creator</dt>
                  <dd>Sample creator · Identity unverified</dd>
                </div>
                <div>
                  <dt>License</dt>
                  <dd>Not established · Preview only</dd>
                </div>
                <div>
                  <dt>Compatibility</dt>
                  <dd>Gemu version and file format unconfirmed</dd>
                </div>
                <div>
                  <dt>Availability</dt>
                  <dd>No model, tool, price or download supplied</dd>
                </div>
              </dl>
              <Action info="acquire" subject={asset.name}>
                Get asset — preview <span aria-hidden="true">↗</span>
              </Action>
              <p className="small panel-note">
                AI concept illustration. This listing is not a real product.
              </p>
            </section>
          )}
        </div>
      </section>
      <section className="creator-section">
        <div className="container two-column">
          <div>
            <p className="eyebrow">Made for voxel creators</p>
            <h2>
              Your work could be
              <br />
              someone&apos;s starting point.
            </h2>
          </div>
          <div>
            <p>
              Have a model, environment or tool to share? Introduce your work
              and how you would like others to use it.
            </p>
            <Action flow="creator">
              Share or sell your work <span aria-hidden="true">↗</span>
            </Action>
            <p className="small">
              Submission preview only. Rights, compatibility and review would be
              checked before a real listing.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
