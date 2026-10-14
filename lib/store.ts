// Shapes and formatting for store assets, shared by server and client code.

export type StoreMedia = { url: string; type: "image" | "video" };

export type StoreAsset = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  /** Size of the uploaded zip in bytes, if known. */
  fileSize: number | null;
  /** Submission time (ISO string), shown as the release date. */
  releasedAt: string;
  ratingCount: number;
  /** Average stars (1–5), or null when there are no ratings yet. */
  ratingAverage: number | null;
  media: StoreMedia[];
};

export function formatPrice(price: number) {
  return price === 0 ? "Free" : `€${price.toFixed(2)}`;
}

export function formatFileSize(bytes: number | null) {
  if (bytes === null) return "Unknown";
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

export function formatReleaseDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatRating(average: number | null, count: number) {
  if (average === null || count === 0) return "No ratings yet";
  return `${average.toFixed(1)} out of 5 · ${count} ${count === 1 ? "rating" : "ratings"}`;
}

/** Five characters of ★/☆ for an average, rounded to the nearest star. */
export function starString(average: number | null) {
  const filled = average === null ? 0 : Math.round(average);
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

/** The image to show on cards: the first photo, else the first video. */
export function coverMedia(asset: StoreAsset) {
  return asset.media.find((m) => m.type === "image") ?? asset.media[0] ?? null;
}
