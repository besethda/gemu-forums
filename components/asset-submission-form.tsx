"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createAsset, type MediaRef } from "@/app/assets/actions";
import { categoryIcon } from "@/components/asset-card";
import { ProductAcquisition, ProductPolicies } from "@/components/asset-detail";
import { formatFileSize, formatPrice } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

// The asset is uploaded as one zip: the .fbx/.glb model plus its textures.
const MODEL_EXTENSIONS = [".zip"];
const TITLE_MAX = 80;
const DESCRIPTION_MAX = 2000;
const PRICE_MAX = 10000;
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

export type Category = { id: number; title: string };

type Field = "media" | "title" | "category" | "price" | "model" | "description";
type Errors = Partial<Record<Field, string>>;
type MediaItem = { id: number; file: File; url: string };
type Status = "idle" | "uploading" | "saving" | "done";

// Listed in page order, so the error summary reads top to bottom.
const FIELD_LABELS: Record<Field, string> = {
  media: "Photos & videos",
  title: "Asset name",
  category: "Category",
  price: "Price",
  model: "Asset files",
  description: "Description",
};
const FIELDS = Object.keys(FIELD_LABELS) as Field[];
const informationTabs = ["Overview", "Technical details", "Ratings"] as const;

function extensionOf(name: string) {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

function isModelFile(file: File) {
  return MODEL_EXTENSIONS.includes(extensionOf(file.name));
}

function isMediaFile(file: File) {
  return file.type.startsWith("image/") || file.type.startsWith("video/");
}

function normalisePrice(price: string) {
  return price.trim().replace(",", ".");
}

function uploadErrorMessage(error: unknown) {
  const { message = "", statusCode = "" } = (error ?? {}) as {
    message?: string;
    statusCode?: string;
  };
  if (statusCode === "413" || /exceeded the maximum/i.test(message))
    return "A file is too large. Files can be up to 50 MB.";
  if (statusCode === "403" || /row-level security|unauthorized/i.test(message))
    return "Your link has expired or was already used. Request a new one from the assets page.";
  return "An upload failed. Check your connection and try again.";
}

/** Storage path inside the user's own folder, as the storage policy requires. */
function storagePath(userId: string, file: File) {
  return `${userId}/${crypto.randomUUID()}${extensionOf(file.name)}`;
}

function validate(
  values: {
    title: string;
    category: string;
    price: string;
    description: string;
    model: File | null;
    media: MediaItem[];
  },
  categories: Category[],
): Errors {
  const errors: Errors = {};
  if (values.media.length === 0)
    errors.media = "Add at least one photo or video.";
  if (!values.title.trim()) errors.title = "Give your asset a name.";
  if (!categories.some((c) => String(c.id) === values.category))
    errors.category = "Choose a category.";
  const price = normalisePrice(values.price);
  if (!PRICE_PATTERN.test(price) || Number(price) > PRICE_MAX)
    errors.price = `Enter a price from 0 to ${PRICE_MAX}, e.g. 4.99. Use 0 for free.`;
  if (!values.model) errors.model = "Upload your asset as a .zip file.";
  if (!values.description.trim()) errors.description = "Describe your asset.";
  return errors;
}

/** Milliseconds left until `deadline`, ticking every second. */
function useTimeLeft(deadline: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return Math.max(0, deadline - now);
}

/**
 * Asset submission laid out exactly like the public asset page, with the
 * creator's parts (media, name, category, price, files, description)
 * editable in place. Files upload straight from the browser to Supabase
 * Storage; the server action then publishes the listing.
 */
export function AssetSubmissionForm({
  userId,
  deadline,
  categories,
}: {
  userId: string;
  /** When the 30-minute window closes, in ms since epoch. */
  deadline: number;
  categories: Category[];
}) {
  const uid = useId();
  const ids: Record<Field, string> = {
    media: `${uid}-media`,
    title: `${uid}-title`,
    category: `${uid}-category`,
    price: `${uid}-price`,
    model: `${uid}-model`,
    description: `${uid}-description`,
  };

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState<File | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [slide, setSlide] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [rejected, setRejected] = useState<
    Partial<Record<"model" | "media", string>>
  >({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [publishedId, setPublishedId] = useState("");
  const [progress, setProgress] = useState("");
  const [submitError, setSubmitError] = useState("");

  const timeLeft = useTimeLeft(deadline);
  const expired = timeLeft === 0;
  const minutesLeft = Math.ceil(timeLeft / 60000);

  const nextMediaId = useRef(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);

  // Revoke any preview URLs still alive when the form unmounts.
  const liveUrls = useRef(new Set<string>());
  useEffect(() => {
    const urls = liveUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const values = { title, category, price, description, model, media };
  const errors = attempted ? validate(values, categories) : {};
  const errorFor = (field: Field) =>
    field === "model" || field === "media"
      ? (rejected[field] ?? errors[field])
      : errors[field];
  const invalidFields = FIELDS.filter((f) => errorFor(f));
  const busy = status === "uploading" || status === "saving";

  const categoryTitle =
    categories.find((c) => String(c.id) === category)?.title ?? "";
  const priceValue = normalisePrice(price);
  const pricePreview =
    PRICE_PATTERN.test(priceValue) && Number(priceValue) <= PRICE_MAX
      ? formatPrice(Number(priceValue))
      : null;
  const current = media[Math.min(slide, media.length - 1)] ?? null;
  const shownSlide = current ? media.indexOf(current) : 0;
  const slideLabel = (item: MediaItem, index: number) =>
    `${item.file.type.startsWith("video/") ? "Video" : "Photo"} ${index + 1}`;

  function addModel(files: File[]) {
    const file = files[0];
    if (!file) return;
    if (!isModelFile(file)) {
      setRejected((r) => ({
        ...r,
        model: `${file.name} isn't a .zip file. Zip your model and textures first.`,
      }));
      return;
    }
    setRejected((r) => ({ ...r, model: undefined }));
    setModel(file);
  }

  function addMedia(files: File[]) {
    const accepted = files.filter(isMediaFile);
    const skipped = files.filter((f) => !isMediaFile(f));
    setRejected((r) => ({
      ...r,
      media: skipped.length
        ? `Skipped ${skipped.map((f) => f.name).join(", ")}. Only photos and videos can be added.`
        : undefined,
    }));
    if (accepted.length === 0) return;
    // Show the first newly added file on the stage.
    setSlide(media.length);
    setMedia((existing) => [
      ...existing,
      ...accepted.map((file) => {
        const url = URL.createObjectURL(file);
        liveUrls.current.add(url);
        return { id: nextMediaId.current++, file, url };
      }),
    ]);
  }

  function removeMedia(item: MediaItem) {
    URL.revokeObjectURL(item.url);
    liveUrls.current.delete(item.url);
    const index = media.indexOf(item);
    setMedia((existing) => existing.filter((m) => m.id !== item.id));
    setSlide((s) => (s > index ? s - 1 : Math.max(0, Math.min(s, media.length - 2))));
    mediaInputRef.current?.focus();
  }

  function moveSlide(step: number) {
    if (media.length) setSlide((shownSlide + step + media.length) % media.length);
  }

  function jumpTo(field: Field) {
    if (field === "description") setActiveTab(0);
    requestAnimationFrame(() => {
      const target = document.getElementById(ids[field]);
      target?.closest("[data-editable]")?.scrollIntoView({ block: "center" });
      target?.focus({ preventScroll: true });
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || expired) return;
    setAttempted(true);
    setRejected({});
    setSubmitError("");
    const found = validate(values, categories);
    if (Object.keys(found).length > 0 || !model) {
      // The description lives in the Overview tab; make sure it's visible.
      if (found.description) setActiveTab(0);
      requestAnimationFrame(() => {
        summaryRef.current?.scrollIntoView({ block: "center" });
        summaryRef.current?.focus({ preventScroll: true });
      });
      return;
    }

    const supabase = createClient();
    const total = media.length + 1;
    try {
      setStatus("uploading");
      setProgress(`Uploading file 1 of ${total}…`);
      const modelPath = storagePath(userId, model);
      const modelUpload = await supabase.storage
        .from("asset-files")
        .upload(modelPath, model, { contentType: "application/zip" });
      if (modelUpload.error) throw modelUpload.error;

      const mediaRefs: MediaRef[] = [];
      for (const [index, item] of media.entries()) {
        setProgress(`Uploading file ${index + 2} of ${total}…`);
        const path = storagePath(userId, item.file);
        const upload = await supabase.storage
          .from("asset-media")
          .upload(path, item.file, { contentType: item.file.type });
        if (upload.error) throw upload.error;
        mediaRefs.push({
          path,
          type: item.file.type.startsWith("video/") ? "video" : "image",
        });
      }

      setStatus("saving");
      setProgress("Publishing your asset…");
      const result = await createAsset({
        title,
        description,
        categoryId: Number(category),
        price: Number(priceValue),
        modelPath,
        media: mediaRefs,
      });
      if (!result.ok) {
        setSubmitError(result.error);
        setStatus("idle");
        return;
      }
      setPublishedId(result.id);
      setStatus("done");
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0 });
        doneRef.current?.focus({ preventScroll: true });
      });
    } catch (error) {
      setSubmitError(uploadErrorMessage(error));
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="container section submit-page">
        <div ref={doneRef} tabIndex={-1} role="status" className="asset-form-done">
          <p className="eyebrow">Published</p>
          <h1>Your asset is live</h1>
          <p>
            &ldquo;{title.trim()}&rdquo; is now listed in the store. This link
            has been used; request a new one to share another asset.
          </p>
          <div className="actions">
            <Link href={`/assets/${publishedId}`} className="button">
              View your listing
            </Link>
            <Link href="/assets" className="text-button">
              Back to assets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="listing-editor">
      <div className="listing-editor-intro">
        <div className="container">
          <p className="eyebrow">Submit an asset</p>
          <p>
            This is how your listing will look in the store. Fill in the areas
            with dashed outlines, then publish it.
          </p>
        </div>
      </div>

      <div className="container product-page">
        {attempted && invalidFields.length > 0 && (
          <div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            className="asset-form-summary listing-editor-summary"
          >
            <strong>
              {invalidFields.length === 1
                ? "1 field needs attention"
                : `${invalidFields.length} fields need attention`}
            </strong>
            <ul>
              {invalidFields.map((f) => (
                <li key={f}>
                  <a
                    href={`#${ids[f]}`}
                    onClick={(e) => {
                      e.preventDefault();
                      jumpTo(f);
                    }}
                  >
                    {FIELD_LABELS[f]}: {errorFor(f)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <fieldset disabled={busy || expired} className="listing-editor-fieldset">
          <nav className="asset-breadcrumbs" aria-label="Breadcrumb preview">
            <span>Assets</span>
            <span aria-hidden="true">/</span>
            <span>{categoryTitle || "Category"}</span>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{title.trim() || "Your asset"}</span>
          </nav>

          <div className="product-layout">
            {/* ── Gallery: photos and videos ─────────────────────────── */}
            <div className="product-media" data-editable>
              <div className="product-gallery">
                <div className="gallery-stage listing-editor-stage">
                  {current ? (
                    <>
                      <MediaPreview item={current} controls />
                      <button
                        type="button"
                        className="listing-editor-remove"
                        onClick={() => removeMedia(current)}
                      >
                        Remove {slideLabel(current, shownSlide).toLowerCase()}
                      </button>
                    </>
                  ) : (
                    <DropZone
                      id={ids.media}
                      inputRef={mediaInputRef}
                      accept="image/*,video/*"
                      multiple
                      variant="stage"
                      label={FIELD_LABELS.media}
                      error={errorFor("media")}
                      onFiles={addMedia}
                      prompt="Add photos and videos"
                      detail="Drop files here or choose them · at least one"
                    />
                  )}
                </div>
                {media.length > 0 && (
                  <div className="gallery-caption">
                    <span>{current && slideLabel(current, shownSlide)}</span>
                    <div>
                      <button
                        type="button"
                        aria-label="Previous preview"
                        onClick={() => moveSlide(-1)}
                      >
                        ←
                      </button>
                      <span>
                        {shownSlide + 1} / {media.length}
                      </span>
                      <button
                        type="button"
                        aria-label="Next preview"
                        onClick={() => moveSlide(1)}
                      >
                        →
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {media.length > 0 && (
                <div className="gallery-thumbnails" aria-label="Preview images">
                  {media.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-label={`Show ${slideLabel(item, index).toLowerCase()}`}
                      aria-pressed={shownSlide === index}
                      onClick={() => setSlide(index)}
                    >
                      <MediaPreview item={item} />
                      <span>{slideLabel(item, index)}</span>
                    </button>
                  ))}
                  <DropZone
                    id={ids.media}
                    inputRef={mediaInputRef}
                    accept="image/*,video/*"
                    multiple
                    variant="tile"
                    label={FIELD_LABELS.media}
                    error={errorFor("media")}
                    onFiles={addMedia}
                    prompt="Add photo or video"
                    detail="Add more photos or videos to the gallery"
                  />
                </div>
              )}
              <FieldError id={`${ids.media}-error`} message={errorFor("media")} />
            </div>

            {/* ── Summary: name, category, price, files ─────────────── */}
            <aside className="product-summary" aria-label="Listing details">
              <div data-editable>
                <label htmlFor={ids.title} className="sr-only">
                  {FIELD_LABELS.title}
                </label>
                <input
                  id={ids.title}
                  name="title"
                  className="listing-editable listing-editable-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={TITLE_MAX}
                  placeholder="Name your asset"
                  autoComplete="off"
                  required
                  aria-invalid={!!errorFor("title")}
                  aria-describedby={`${ids.title}-count${errorFor("title") ? ` ${ids.title}-error` : ""}`}
                />
                <p id={`${ids.title}-count`} className="listing-editor-count">
                  {title.length}/{TITLE_MAX}
                </p>
                <FieldError id={`${ids.title}-error`} message={errorFor("title")} />
              </div>

              <div className="product-creator">
                <span className="creator-avatar" aria-hidden="true">
                  ◇
                </span>
                <span>Community creator</span>
                <span className="listing-editable-category" data-editable>
                  <label htmlFor={ids.category} className="sr-only">
                    {FIELD_LABELS.category}
                  </label>
                  {categoryTitle && (
                    <span aria-hidden="true">{categoryIcon(categoryTitle)}</span>
                  )}
                  <select
                    id={ids.category}
                    name="category"
                    className="listing-editable"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    aria-invalid={!!errorFor("category")}
                    aria-describedby={
                      errorFor("category") ? `${ids.category}-error` : undefined
                    }
                  >
                    <option value="">Choose a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </span>
              </div>
              <FieldError
                id={`${ids.category}-error`}
                message={errorFor("category")}
              />

              <div className="product-rating">
                <span aria-hidden="true">☆☆☆☆☆</span>
                <p className="listing-editor-static">No ratings yet</p>
              </div>

              <div className="product-price" data-editable>
                <label htmlFor={ids.price} className="sr-only">
                  {FIELD_LABELS.price} in euros
                </label>
                <span className="listing-editable-price">
                  <span aria-hidden="true">€</span>
                  <input
                    id={ids.price}
                    name="price"
                    className="listing-editable"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    aria-invalid={!!errorFor("price")}
                    aria-describedby={`${ids.price}-hint${errorFor("price") ? ` ${ids.price}-error` : ""}`}
                  />
                </span>
                <p id={`${ids.price}-hint`}>
                  {pricePreview === "Free"
                    ? "Shown as Free in the store."
                    : pricePreview
                      ? `Shown as ${pricePreview} in the store. Enter 0 to offer it for free.`
                      : "Price in euros. Enter 0 to offer it for free."}
                </p>
                <FieldError id={`${ids.price}-error`} message={errorFor("price")} />
              </div>

              <ProductPolicies />
              <ProductAcquisition title={title.trim() || "Your asset"} />

              <div className="listing-editor-files" data-editable>
                <p className="listing-editor-label" id={`${ids.model}-label`}>
                  {FIELD_LABELS.model}
                </p>
                {model ? (
                  <div className="asset-form-file">
                    <span className="asset-form-drop-icon">
                      <ZipIcon />
                    </span>
                    <div className="asset-form-file-info">
                      <p className="asset-form-file-name" title={model.name}>
                        {model.name}
                      </p>
                      <p className="asset-form-file-meta">
                        zip · {formatFileSize(model.size)}
                      </p>
                    </div>
                    <div className="asset-form-file-actions">
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => modelInputRef.current?.click()}
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => {
                          setModel(null);
                          requestAnimationFrame(() =>
                            modelInputRef.current?.focus(),
                          );
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : null}
                <DropZone
                  id={ids.model}
                  inputRef={modelInputRef}
                  accept={MODEL_EXTENSIONS.join(",")}
                  variant="block"
                  hidden={!!model}
                  label={FIELD_LABELS.model}
                  error={errorFor("model")}
                  onFiles={addModel}
                  prompt="Add your .zip"
                  detail="Model (.fbx or .glb) and textures · up to 50 MB · buyers can download it once purchasing opens"
                />
                <FieldError id={`${ids.model}-error`} message={errorFor("model")} />
              </div>

              <dl className="product-facts">
                <div>
                  <dt>File size</dt>
                  <dd>{model ? formatFileSize(model.size) : "From your .zip"}</dd>
                </div>
                <div>
                  <dt>Release date</dt>
                  <dd>When you publish</dd>
                </div>
                <div>
                  <dt>File format</dt>
                  <dd>ZIP (model and textures)</dd>
                </div>
                <div>
                  <dt>Support</dt>
                  <dd>Support information</dd>
                </div>
              </dl>
            </aside>

            {/* ── Tabs: description lives in Overview ───────────────── */}
            <div className="product-information">
              <div
                className="product-tabs"
                role="tablist"
                aria-label="Asset information"
              >
                {informationTabs.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    ref={(node) => {
                      tabButtons.current[index] = node;
                    }}
                    id={`${uid}-tab-${index}`}
                    role="tab"
                    aria-selected={activeTab === index}
                    aria-controls={`${uid}-panel-${index}`}
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
                  id={`${uid}-panel-${index}`}
                  role="tabpanel"
                  aria-labelledby={`${uid}-tab-${index}`}
                  hidden={activeTab !== index}
                  className="product-tab-panel"
                >
                  {index === 0 ? (
                    <>
                      <h2>About this asset</h2>
                      <div data-editable>
                        <label htmlFor={ids.description} className="sr-only">
                          {FIELD_LABELS.description}
                        </label>
                        <textarea
                          id={ids.description}
                          name="description"
                          className="listing-editable listing-editable-description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          maxLength={DESCRIPTION_MAX}
                          rows={7}
                          required
                          placeholder="Describe your asset: what's included, polycount, rig or animation details, and how it's meant to be used."
                          aria-invalid={!!errorFor("description")}
                          aria-describedby={`${ids.description}-count${errorFor("description") ? ` ${ids.description}-error` : ""}`}
                        />
                        <p
                          id={`${ids.description}-count`}
                          className="listing-editor-count"
                        >
                          {description.length}/{DESCRIPTION_MAX}
                        </p>
                        <FieldError
                          id={`${ids.description}-error`}
                          message={errorFor("description")}
                        />
                      </div>
                      {categoryTitle && (
                        <div className="product-tags">
                          <span>{categoryTitle}</span>
                        </div>
                      )}
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
                          <dd>{model ? formatFileSize(model.size) : "From your .zip"}</dd>
                        </div>
                        <div>
                          <dt>Released</dt>
                          <dd>When you publish</dd>
                        </div>
                        <div>
                          <dt>Previews</dt>
                          <dd>
                            {media.filter((m) => !m.file.type.startsWith("video/")).length}{" "}
                            photos ·{" "}
                            {media.filter((m) => m.file.type.startsWith("video/")).length}{" "}
                            videos
                          </dd>
                        </div>
                      </dl>
                    </>
                  ) : (
                    <>
                      <h2>Ratings</h2>
                      <p>
                        <span aria-hidden="true">☆☆☆☆☆</span> No ratings yet.
                        Anyone can rate your asset once it&apos;s published.
                      </p>
                    </>
                  )}
                </section>
              ))}
            </div>
          </div>
        </fieldset>
      </div>

      <div className="listing-editor-bar">
        <div className="container listing-editor-bar-inner">
          <p
            className={expired ? "listing-editor-timer is-expired" : "listing-editor-timer"}
            aria-live="polite"
          >
            {busy
              ? progress
              : expired
                ? "Your 30 minutes are up. Request a new link from the assets page."
                : `${minutesLeft} ${minutesLeft === 1 ? "minute" : "minutes"} left with this link`}
          </p>
          {submitError && (
            <p role="alert" className="asset-form-error">
              <AlertIcon />
              {submitError}
            </p>
          )}
          <button type="submit" className="button" disabled={busy || expired}>
            {busy ? "Publishing…" : "Publish asset"}
          </button>
        </div>
      </div>
    </form>
  );
}

function MediaPreview({ item, controls }: { item: MediaItem; controls?: boolean }) {
  return item.file.type.startsWith("video/") ? (
    <video
      src={item.url}
      controls={controls}
      muted={!controls}
      playsInline
      preload="metadata"
    />
  ) : (
    // Local blob previews can't go through next/image.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.url} alt="" />
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="asset-form-error">
      <AlertIcon />
      {message}
    </p>
  );
}

function DropZone({
  id,
  inputRef,
  accept,
  multiple,
  variant,
  hidden,
  label,
  error,
  onFiles,
  prompt,
  detail,
}: {
  id: string;
  inputRef: RefObject<HTMLInputElement | null>;
  accept: string;
  multiple?: boolean;
  variant: "stage" | "tile" | "block";
  hidden?: boolean;
  label: string;
  error?: string;
  onFiles: (files: File[]) => void;
  prompt: ReactNode;
  detail: string;
}) {
  const [dragging, setDragging] = useState(false);

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }
  function onDragLeave(e: DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null))
      setDragging(false);
  }
  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    onFiles(Array.from(e.dataTransfer.files));
  }

  const className = [
    "listing-drop",
    `is-${variant}`,
    hidden && "sr-only",
    dragging && "is-dragging",
    error && "is-invalid",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        tabIndex={hidden ? -1 : undefined}
        aria-label={`${label}: ${typeof prompt === "string" ? prompt : ""}`}
        aria-describedby={`${id}-detail${error ? ` ${id}-error` : ""}`}
        aria-invalid={!!error}
        className="sr-only"
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      {variant === "tile" ? (
        // Same shape as a gallery thumbnail: a 16:10 picture area and a caption.
        <label htmlFor={id}>
          <span className="listing-drop-tile-art" aria-hidden="true">
            <UploadIcon />
          </span>
          <span className="listing-drop-tile-caption">
            {dragging ? "Drop to add" : prompt}
          </span>
          <span id={`${id}-detail`} className="sr-only">
            {detail}
          </span>
        </label>
      ) : (
        <label htmlFor={id}>
          <span className="asset-form-drop-icon">
            <UploadIcon />
          </span>
          <span className="listing-drop-text">
            <span className="asset-form-drop-prompt">
              {dragging ? "Drop to add" : prompt}
            </span>
            <span id={`${id}-detail`} className="asset-form-drop-detail">
              {detail}
            </span>
          </span>
        </label>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 16V4m0 0-5 5m5-5 5 5M4 16v4h16v-4" strokeLinecap="square" />
    </svg>
  );
}

function ZipIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M6 2h9l5 5v15H6V2Zm9 0v5h5M11 4h2M11 7h2M11 10h2M11 13h2v4h-2v-4Z" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6m0 3v.5" strokeLinecap="square" />
    </svg>
  );
}
