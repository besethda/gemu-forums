import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import type { Database } from "./supabase/database.types";
import { supabaseEnv } from "./supabase/env";
import type { StoreAsset, StoreMedia } from "./store";

/** Cache tag for everything listed in the store; expire it after a change. */
export const ASSETS_TAG = "assets";

const ASSET_COLUMNS =
  "id, title, description, creator_name, price, file_size, created_at, rating_count, rating_total, media, category_info:categories(title)";

// Public reads need no cookies, so this client can be used inside "use cache".
function publicClient() {
  const { url, key } = supabaseEnv();
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type AssetRow = {
  id: number;
  title: string;
  description: string;
  creator_name: string;
  price: number;
  file_size: number | null;
  created_at: string;
  rating_count: number;
  rating_total: number;
  media: unknown;
  category_info: { title: string } | null;
};

function toStoreAsset(
  row: AssetRow,
  supabase: ReturnType<typeof publicClient>,
): StoreAsset {
  const media = (Array.isArray(row.media) ? row.media : []).flatMap(
    (item): StoreMedia[] => {
      const { path, type } = (item ?? {}) as { path?: unknown; type?: unknown };
      if (typeof path !== "string" || (type !== "image" && type !== "video"))
        return [];
      const { publicUrl } = supabase.storage
        .from("asset-media")
        .getPublicUrl(path).data;
      return [{ url: publicUrl, type }];
    },
  );
  return {
    id: String(row.id),
    title: row.title,
    description: row.description,
    creatorName: row.creator_name.trim() || "Community creator",
    category: row.category_info?.title ?? "Uncategorised",
    price: Number(row.price),
    fileSize: row.file_size,
    releasedAt: row.created_at,
    ratingCount: row.rating_count,
    ratingAverage:
      row.rating_count > 0 ? row.rating_total / row.rating_count : null,
    media,
  };
}

/** Approved assets, newest first. */
export async function getStoreAssets(): Promise<StoreAsset[]> {
  "use cache";
  cacheTag(ASSETS_TAG);
  cacheLife("minutes");
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("assets")
    .select(ASSET_COLUMNS)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Loading assets failed: ${error.message}`);
  return (data as AssetRow[]).map((row) => toStoreAsset(row, supabase));
}

/** One approved asset by id, or null if it doesn't exist or isn't approved. */
export async function getStoreAsset(id: string): Promise<StoreAsset | null> {
  "use cache";
  cacheTag(ASSETS_TAG);
  cacheLife("minutes");
  if (!/^\d+$/.test(id)) return null;
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("assets")
    .select(ASSET_COLUMNS)
    .eq("status", "approved")
    .eq("id", Number(id))
    .maybeSingle();
  if (error) throw new Error(`Loading asset ${id} failed: ${error.message}`);
  return data ? toStoreAsset(data as AssetRow, supabase) : null;
}

/** Category names for filters. */
export async function getCategoryTitles(): Promise<string[]> {
  "use cache";
  cacheTag("categories");
  cacheLife("hours");
  const { data, error } = await publicClient()
    .from("categories")
    .select("title")
    .order("title");
  if (error) throw new Error(`Loading categories failed: ${error.message}`);
  return data.map((c) => c.title);
}
