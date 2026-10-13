"use client";

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

const MODEL_EXTENSIONS = [".fbx", ".glb"];
const TITLE_MAX = 80;
const DESCRIPTION_MAX = 2000;

export type AssetSubmission = {
  title: string;
  description: string;
  model: File;
  media: File[];
};

type Field = "title" | "description" | "model" | "media";
type Errors = Partial<Record<Field, string>>;
type MediaItem = { id: number; file: File; url: string };

type Props = {
  /** Called with the validated submission. Wire this to a Server Action later. */
  onSubmit?: (submission: AssetSubmission) => void | Promise<void>;
};

const FIELD_LABELS: Record<Field, string> = {
  title: "Title",
  description: "Description",
  model: "3D model",
  media: "Photos & videos",
};

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

function validate(
  title: string,
  description: string,
  model: File | null,
  media: MediaItem[],
): Errors {
  const errors: Errors = {};
  if (!title.trim()) errors.title = "Give your asset a title.";
  if (!description.trim()) errors.description = "Describe your asset.";
  if (!model) errors.model = "Upload the asset as an .fbx or .glb file.";
  if (media.length === 0) errors.media = "Add at least one photo or video.";
  return errors;
}

export function AssetSubmissionForm({ onSubmit }: Props) {
  const uid = useId();
  const ids = {
    title: `${uid}-title`,
    description: `${uid}-description`,
    model: `${uid}-model`,
    media: `${uid}-media`,
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState<File | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [rejected, setRejected] = useState<Partial<Record<"model" | "media", string>>>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");

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

  function revoke(url: string) {
    URL.revokeObjectURL(url);
    liveUrls.current.delete(url);
  }

  const errors = attempted ? validate(title, description, model, media) : {};
  const errorFor = (field: Field) =>
    field === "model" || field === "media" ? rejected[field] ?? errors[field] : errors[field];
  const errorCount = (Object.keys(FIELD_LABELS) as Field[]).filter((f) => errorFor(f)).length;

  function addModel(files: File[]) {
    const file = files[0];
    if (!file) return;
    if (!isModelFile(file)) {
      setRejected((r) => ({ ...r, model: `${file.name} isn't an .fbx or .glb file.` }));
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
        ? `Skipped ${skipped.map((f) => f.name).join(", ")} — only photos and videos can be added.`
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
    revoke(item.url);
    setMedia((current) => current.filter((m) => m.id !== item.id));
    mediaInputRef.current?.focus();
  }

  function reset() {
    media.forEach((m) => revoke(m.url));
    setTitle("");
    setDescription("");
    setModel(null);
    setMedia([]);
    setRejected({});
    setAttempted(false);
    setStatus("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    setRejected({});
    const found = validate(title, description, model, media);
    if (Object.keys(found).length > 0 || !model) {
      // Let the summary render, then move focus to it.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus("submitting");
    try {
      await onSubmit?.({
        title: title.trim(),
        description: description.trim(),
        model,
        media: media.map((m) => m.file),
      });
      setStatus("done");
      requestAnimationFrame(() => {
        doneRef.current?.scrollIntoView({ block: "start" });
        doneRef.current?.focus({ preventScroll: true });
      });
    } catch {
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div
        ref={doneRef}
        tabIndex={-1}
        role="status"
        className="h-fit w-full max-w-2xl scroll-mt-12 rounded-gemu bg-paper p-6 text-charcoal outline-none sm:p-10"
      >
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-success">Submitted</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink">Your asset is in review</h2>
        <p className="mt-3 max-w-prose leading-relaxed text-muted">
          The Gemu team reviews every submission before it&apos;s listed in the store. We&apos;ll
          let you know when it&apos;s live or if anything needs changing.
        </p>
        <button type="button" onClick={reset} className={`${buttonPrimary} mt-8`}>
          Submit another asset
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby={`${uid}-heading`}
      className="flex w-full max-w-2xl flex-col gap-8 rounded-gemu bg-paper p-6 text-charcoal sm:p-10"
    >
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">Share your work</p>
        <h2 id={`${uid}-heading`} className="mt-3 text-3xl font-extrabold tracking-tight text-ink">
          Submit an asset
        </h2>
        <p className="mt-2 max-w-prose leading-relaxed text-muted">
          Introduce your asset to the store. Every field is required, and the Gemu team reviews each
          submission before it&apos;s listed.
        </p>
      </header>

      {attempted && errorCount > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-gemu border border-error bg-field p-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-charcoal"
        >
          <p className="font-semibold text-error">
            {errorCount === 1 ? "1 field needs attention" : `${errorCount} fields need attention`}
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {(Object.keys(FIELD_LABELS) as Field[])
              .filter((f) => errorFor(f))
              .map((f) => (
                <li key={f}>
                  <a
                    href={`#${ids[f]}`}
                    onClick={(e) => {
                      const target = document.getElementById(ids[f]);
                      if (!target) return;
                      e.preventDefault();
                      target.closest("section, div")?.scrollIntoView({ block: "center" });
                      target.focus({ preventScroll: true });
                    }}
                    className="text-charcoal underline underline-offset-2"
                  >
                    {FIELD_LABELS[f]}: {errorFor(f)}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}

      <TextField
        id={ids.title}
        label="Title"
        value={title}
        onChange={setTitle}
        max={TITLE_MAX}
        error={errorFor("title")}
        placeholder="e.g. Modular voxel cabin"
      />

      <TextField
        id={ids.description}
        label="Description"
        hint="What's included, polycount, rig or animation details, and how it's meant to be used."
        value={description}
        onChange={setDescription}
        max={DESCRIPTION_MAX}
        error={errorFor("description")}
        multiline
      />

      <FileSection
        id={ids.model}
        label="3D model"
        hint="One .fbx or .glb file."
        error={errorFor("model")}
      >
        {model ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-gemu border border-line bg-field p-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-gemu bg-ink text-paper">
              <CubeIcon />
            </span>
            <div className="min-w-0 flex-1 basis-40">
              <p className="truncate font-medium text-ink" title={model.name}>
                {model.name}
              </p>
              <p className="font-mono text-xs whitespace-nowrap uppercase text-muted">
                {extensionOf(model.name).slice(1)} · {formatBytes(model.size)}
              </p>
            </div>
            <div className="ml-auto flex">
              <button
                type="button"
                onClick={() => modelInputRef.current?.click()}
                className={buttonQuiet}
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => {
                  setModel(null);
                  requestAnimationFrame(() => modelInputRef.current?.focus());
                }}
                className={buttonQuiet}
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
          labelledBy={`${ids.model}-label`}
          error={errorFor("model")}
          onFiles={addModel}
          hidden={!!model}
          prompt="Drop your model here or choose a file"
          detail=".fbx or .glb"
        />
      </FileSection>

      <FileSection
        id={ids.media}
        label="Photos & videos"
        hint="Add at least one. Show the asset from a few angles, in use, or animated."
        error={errorFor("media")}
        aside={
          media.length > 0 ? (
            <span className="font-mono text-xs text-muted">
              {media.length} {media.length === 1 ? "file" : "files"}
            </span>
          ) : null
        }
      >
        {media.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((item) => (
              <MediaTile key={item.id} item={item} onRemove={() => removeMedia(item)} />
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
          prompt={media.length > 0 ? "Add more photos or videos" : "Drop photos and videos here or choose files"}
          detail="Images and videos · add as many as you like"
        />
      </FileSection>

      <footer className="flex flex-col-reverse gap-4 border-t border-line/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">You can edit the listing after review.</p>
        <button type="submit" disabled={status === "submitting"} className={buttonPrimary}>
          {status === "submitting" ? "Submitting…" : "Submit for review"}
        </button>
      </footer>
    </form>
  );
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-charcoal";

const buttonPrimary = `inline-flex min-h-11 items-center justify-center rounded-gemu border border-ink bg-ink px-5 py-3 text-sm font-semibold text-paper transition-colors hover:bg-raised disabled:cursor-progress disabled:opacity-70 ${focusRing}`;

const buttonQuiet = `min-h-11 rounded-gemu px-3 text-sm font-semibold text-charcoal underline-offset-2 hover:underline ${focusRing}`;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm font-medium text-error">
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
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`, `${id}-count`]
    .filter(Boolean)
    .join(" ");
  const className = `w-full rounded-gemu border bg-field px-3 py-3 text-base leading-relaxed text-charcoal placeholder:text-muted/70 ${focusRing} ${
    error ? "border-error" : "border-line"
  }`;
  const shared = {
    id,
    name: id,
    value,
    maxLength: max,
    required: true,
    placeholder,
    "aria-invalid": !!error,
    "aria-describedby": describedBy,
    className,
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="font-semibold text-ink">
          {label}
        </label>
        <span id={`${id}-count`} className="font-mono text-xs text-muted">
          {value.length}/{max}
        </span>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="-mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
      {multiline ? (
        <textarea {...shared} rows={6} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...shared} type="text" className={`${className} min-h-12`} onChange={(e) => onChange(e.target.value)} />
      )}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function FileSection({
  id,
  label,
  hint,
  error,
  aside,
  children,
}: {
  id: string;
  label: string;
  hint: string;
  error?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3" aria-labelledby={`${id}-label`}>
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h3 id={`${id}-label`} className="font-semibold text-ink">
            {label}
          </h3>
          {aside}
        </div>
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      </div>
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </section>
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
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
  }
  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    onFiles(Array.from(e.dataTransfer.files));
  }

  return (
    <div
      className={hidden ? "sr-only" : undefined}
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
        className="peer sr-only"
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      <label
        htmlFor={id}
        className={`flex cursor-pointer items-center gap-4 rounded-gemu border border-dashed transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-charcoal ${
          compact ? "px-4 py-3" : "flex-col justify-center px-6 py-10 text-center"
        } ${
          dragging
            ? "border-ink bg-sand"
            : error
              ? "border-error bg-field hover:bg-sand"
              : "border-line bg-field hover:bg-sand"
        }`}
      >
        <span
          className={`grid shrink-0 place-items-center rounded-gemu bg-ink text-paper ${compact ? "size-9" : "size-12"}`}
        >
          <UploadIcon />
        </span>
        <span className="flex flex-col gap-1">
          <span id={`${id}-prompt`} className="font-semibold text-ink">
            {dragging ? "Drop to add" : prompt}
          </span>
          {!compact && <span className="font-mono text-xs text-muted">{detail}</span>}
        </span>
      </label>
    </div>
  );
}

function MediaTile({ item, onRemove }: { item: MediaItem; onRemove: () => void }) {
  const isVideo = item.file.type.startsWith("video/");
  return (
    <li className="group relative overflow-hidden rounded-gemu border border-line bg-ink">
      <div className="aspect-video">
        {isVideo ? (
          <video src={item.url} muted playsInline preload="metadata" className="size-full object-cover" />
        ) : (
          // Local blob previews can't go through next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt="" className="size-full object-cover" />
        )}
      </div>
      <div className="flex items-center gap-2 bg-ink px-2 py-1.5 text-paper">
        <span className="shrink-0 rounded-gemu bg-raised px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-fog">
          {isVideo ? "Video" : "Photo"}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs" title={item.file.name}>
          {item.file.name}
        </span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.file.name}`}
        className="absolute top-1.5 right-1.5 grid size-8 place-items-center rounded-gemu bg-ink/85 text-paper transition-colors hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
      >
        <CloseIcon />
      </button>
    </li>
  );
}

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 16V4m0 0-5 5m5-5 5 5M4 16v4h16v-4" strokeLinecap="square" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 0v0M3 7l9 5 9-5M12 12v10" strokeLinejoin="round" />
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="mt-0.5 shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6m0 3v.5" strokeLinecap="square" />
    </svg>
  );
}
