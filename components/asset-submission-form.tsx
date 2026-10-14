"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type RefObject,
} from "react";
import { createAsset, type MediaRef } from "@/app/assets/actions";
import { createClient } from "@/lib/supabase/client";

// The asset is uploaded as one zip: the .fbx/.glb model plus its textures.
const MODEL_EXTENSIONS = [".zip"];
const TITLE_MAX = 80;
const DESCRIPTION_MAX = 2000;

export type Category = { id: number; title: string };

type Field =
  | "title"
  | "category"
  | "price"
  | "description"
  | "model"
  | "media";
type Errors = Partial<Record<Field, string>>;
type MediaItem = { id: number; file: File; url: string };
type Status = "idle" | "uploading" | "saving" | "done";

const FIELD_LABELS: Record<Field, string> = {
  title: "Asset name",
  category: "Category",
  price: "Price",
  description: "Description",
  model: "Asset files",
  media: "Photos & videos",
};
const FIELDS = Object.keys(FIELD_LABELS) as Field[];

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

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
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

const PRICE_MAX = 10000;
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

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
  if (!values.title.trim()) errors.title = "Give your asset a name.";
  if (!categories.some((c) => String(c.id) === values.category))
    errors.category = "Choose a category.";
  const price = values.price.trim().replace(",", ".");
  if (!PRICE_PATTERN.test(price) || Number(price) > PRICE_MAX)
    errors.price = `Enter a price from 0 to ${PRICE_MAX}, e.g. 4.99. Use 0 for free.`;
  if (!values.description.trim()) errors.description = "Describe your asset.";
  if (!values.model) errors.model = "Upload your asset as a .zip file.";
  if (values.media.length === 0)
    errors.media = "Add at least one photo or video.";
  return errors;
}

/** Minutes and seconds left until `deadline`, ticking every second. */
function useTimeLeft(deadline: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return Math.max(0, deadline - now);
}

/**
 * Asset submission for a creator who has verified their email. Files upload
 * straight from the browser to Supabase Storage; the server action then saves
 * the listing as pending review.
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
    title: `${uid}-title`,
    category: `${uid}-category`,
    price: `${uid}-price`,
    description: `${uid}-description`,
    model: `${uid}-model`,
    media: `${uid}-media`,
  };

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState<File | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [rejected, setRejected] = useState<
    Partial<Record<"model" | "media", string>>
  >({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
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
    setMedia((current) => [
      ...current,
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
    setMedia((current) => current.filter((m) => m.id !== item.id));
    mediaInputRef.current?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || expired) return;
    setAttempted(true);
    setRejected({});
    setSubmitError("");
    const found = validate(values, categories);
    if (Object.keys(found).length > 0 || !model) {
      // Let the summary render, then move focus to it.
      requestAnimationFrame(() => {
        summaryRef.current?.scrollIntoView({ block: "nearest" });
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
        .upload(modelPath, model, {
          contentType: "application/zip",
        });
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
      setProgress("Saving your submission…");
      const result = await createAsset({
        title,
        description,
        categoryId: Number(category),
        price: Number(price.trim().replace(",", ".")),
        modelPath,
        media: mediaRefs,
      });
      if (!result.ok) {
        setSubmitError(result.error);
        setStatus("idle");
        return;
      }
      setStatus("done");
      requestAnimationFrame(() => {
        doneRef.current?.scrollIntoView({ block: "nearest" });
        doneRef.current?.focus({ preventScroll: true });
      });
    } catch (error) {
      setSubmitError(uploadErrorMessage(error));
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="asset-form-done">
        <p className="eyebrow">Submitted</p>
        <h2>Your asset is in review</h2>
        <p>
          The Gemu team reviews every submission before it&apos;s listed in the
          store. We&apos;ll email you when it&apos;s live or if anything needs
          changing. This link has now been used; request a new one to submit
          another asset.
        </p>
        <div className="actions">
          <Link href="/assets" className="button">
            Back to assets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="asset-form">
      <p
        className={expired ? "asset-form-timer is-expired" : "asset-form-timer"}
        aria-live="polite"
      >
        {expired
          ? "Your 30 minutes are up. Request a new link from the assets page to submit."
          : `${minutesLeft} ${minutesLeft === 1 ? "minute" : "minutes"} left to submit with this link.`}
      </p>

      {attempted && invalidFields.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="asset-form-summary"
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
                    const target = document.getElementById(ids[f]);
                    if (!target) return;
                    e.preventDefault();
                    target.parentElement?.scrollIntoView({ block: "center" });
                    target.focus({ preventScroll: true });
                  }}
                >
                  {FIELD_LABELS[f]}: {errorFor(f)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <fieldset disabled={busy || expired} className="asset-form-fieldset">
        <div className="form-fields asset-form-row">
          <TextField
            id={ids.title}
            label={FIELD_LABELS.title}
            value={title}
            onChange={setTitle}
            max={TITLE_MAX}
            error={errorFor("title")}
            placeholder="e.g. Modular voxel cabin"
          />
          <div>
            <div className="asset-form-label-row">
              <label htmlFor={ids.category}>{FIELD_LABELS.category}</label>
            </div>
            <select
              id={ids.category}
              name="category"
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
            <FieldError
              id={`${ids.category}-error`}
              message={errorFor("category")}
            />
          </div>
        </div>

        <div className="asset-form-price">
          <div className="asset-form-label-row">
            <label htmlFor={ids.price}>{FIELD_LABELS.price} (EUR)</label>
          </div>
          <p id={`${ids.price}-hint`} className="asset-form-hint">
            Enter 0 to offer it for free.
          </p>
          <div className="asset-form-price-input">
            <span aria-hidden="true">€</span>
            <input
              id={ids.price}
              name="price"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              aria-invalid={!!errorFor("price")}
              aria-describedby={`${ids.price}-hint${errorFor("price") ? ` ${ids.price}-error` : ""}`}
            />
          </div>
          <FieldError id={`${ids.price}-error`} message={errorFor("price")} />
        </div>

        <TextField
          id={ids.description}
          label={FIELD_LABELS.description}
          hint="What's included, polycount, rig or animation details, and how it's meant to be used."
          value={description}
          onChange={setDescription}
          max={DESCRIPTION_MAX}
          error={errorFor("description")}
          multiline
        />

        <fieldset className="asset-form-group">
          <legend id={`${ids.model}-label`} className="asset-form-legend">
            {FIELD_LABELS.model}
          </legend>
          <p id={`${ids.model}-hint`} className="asset-form-hint">
            One .zip containing your .fbx or .glb model and its textures, up
            to 50 MB.
          </p>
          {model && (
            <div className="asset-form-file">
              <span className="asset-form-drop-icon">
                <CubeIcon />
              </span>
              <div className="asset-form-file-info">
                <p className="asset-form-file-name" title={model.name}>
                  {model.name}
                </p>
                <p className="asset-form-file-meta">
                  {extensionOf(model.name).slice(1)} ·{" "}
                  {formatBytes(model.size)}
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
          )}
          <DropZone
            id={ids.model}
            inputRef={modelInputRef}
            accept={MODEL_EXTENSIONS.join(",")}
            labelledBy={`${ids.model}-label`}
            error={errorFor("model")}
            onFiles={addModel}
            hidden={!!model}
            prompt="Drop your .zip here or choose a file"
            detail=".zip with your model and textures"
          />
          <FieldError id={`${ids.model}-error`} message={errorFor("model")} />
        </fieldset>

        <fieldset className="asset-form-group">
          <legend className="asset-form-legend asset-form-label-row">
            <span id={`${ids.media}-label`}>{FIELD_LABELS.media}</span>
            {media.length > 0 && (
              <span className="asset-form-count">
                {media.length} {media.length === 1 ? "file" : "files"}
              </span>
            )}
          </legend>
          <p id={`${ids.media}-hint`} className="asset-form-hint">
            Add at least one. Show the asset from a few angles, in use, or
            animated.
          </p>
          {media.length > 0 && (
            <ul className="asset-form-media">
              {media.map((item) => (
                <MediaTile
                  key={item.id}
                  item={item}
                  onRemove={() => removeMedia(item)}
                />
              ))}
            </ul>
          )}
          <DropZone
            id={ids.media}
            inputRef={mediaInputRef}
            accept="image/*,video/*"
            multiple
            compact={media.length > 0}
            labelledBy={`${ids.media}-label`}
            error={errorFor("media")}
            onFiles={addMedia}
            prompt={
              media.length > 0
                ? "Add more photos or videos"
                : "Drop photos and videos here or choose files"
            }
            detail="Images and videos · add as many as you like"
          />
          <FieldError id={`${ids.media}-error`} message={errorFor("media")} />
        </fieldset>
      </fieldset>

      <div className="asset-form-footer">
        <p className="small" aria-live="polite">
          {busy
            ? progress
            : "The Gemu team reviews every submission before it's listed."}
        </p>
        <button type="submit" className="button" disabled={busy || expired}>
          {busy ? "Submitting…" : "Submit for review"}
        </button>
        {submitError && (
          <p role="alert" className="asset-form-error">
            <AlertIcon />
            {submitError}
          </p>
        )}
      </div>
    </form>
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

function TextField({
  id,
  label,
  hint,
  value,
  onChange,
  max,
  error,
  placeholder,
  multiline,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  error?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const describedBy = [
    hint && `${id}-hint`,
    error && `${id}-error`,
    `${id}-count`,
  ]
    .filter(Boolean)
    .join(" ");
  const shared = {
    id,
    name: id,
    value,
    maxLength: max,
    required: true,
    placeholder,
    "aria-invalid": !!error,
    "aria-describedby": describedBy,
  };

  return (
    <div className={multiline ? "field-wide" : undefined}>
      <div className="asset-form-label-row">
        <label htmlFor={id}>{label}</label>
        <span id={`${id}-count`} className="asset-form-count">
          {value.length}/{max}
        </span>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="asset-form-hint">
          {hint}
        </p>
      )}
      {multiline ? (
        <textarea
          {...shared}
          rows={5}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          {...shared}
          type="text"
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function DropZone({
  id,
  inputRef,
  accept,
  multiple,
  compact,
  hidden,
  labelledBy,
  error,
  onFiles,
  prompt,
  detail,
}: {
  id: string;
  inputRef: RefObject<HTMLInputElement | null>;
  accept: string;
  multiple?: boolean;
  compact?: boolean;
  hidden?: boolean;
  labelledBy: string;
  error?: string;
  onFiles: (files: File[]) => void;
  prompt: string;
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
    "asset-form-drop",
    hidden && "sr-only",
    compact && "is-compact",
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
        aria-labelledby={`${labelledBy} ${id}-prompt`}
        aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
        aria-invalid={!!error}
        className="sr-only"
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      <label htmlFor={id}>
        <span className="asset-form-drop-icon">
          <UploadIcon />
        </span>
        <span>
          <span id={`${id}-prompt`} className="asset-form-drop-prompt">
            {dragging ? "Drop to add" : prompt}
          </span>
          {!compact && (
            <span className="asset-form-drop-detail">{detail}</span>
          )}
        </span>
      </label>
    </div>
  );
}

function MediaTile({
  item,
  onRemove,
}: {
  item: MediaItem;
  onRemove: () => void;
}) {
  const isVideo = item.file.type.startsWith("video/");
  return (
    <li className="asset-form-tile">
      {isVideo ? (
        <video src={item.url} muted playsInline preload="metadata" />
      ) : (
        // Local blob previews can't go through next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.url} alt="" />
      )}
      <div className="asset-form-tile-meta">
        <span className="asset-form-badge">{isVideo ? "Video" : "Photo"}</span>
        <span title={item.file.name}>{item.file.name}</span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.file.name}`}
        className="asset-form-tile-remove"
      >
        <CloseIcon />
      </button>
    </li>
  );
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 16V4m0 0-5 5m5-5 5 5M4 16v4h16v-4" strokeLinecap="square" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M12 2 3 7v10l9 5 9-5V7l-9-5ZM3 7l9 5 9-5M12 12v10" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="square" />
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
