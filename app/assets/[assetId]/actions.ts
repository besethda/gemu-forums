"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { ASSETS_TAG } from "@/lib/store-data";

const RATED_COOKIE = "gemu_rated";
const MAX_REMEMBERED = 200;

export type RateResult =
  | { ok: true; ratingCount: number; ratingAverage: number }
  | { ok: false; reason: "already-rated" | "invalid" | "failed" };

/**
 * Adds an anonymous 1–5 star rating. One rating per asset per browser,
 * remembered in an httpOnly cookie (a light guard, not proof of identity).
 */
export async function rateAsset(
  assetId: string,
  stars: number,
): Promise<RateResult> {
  if (!/^\d+$/.test(assetId) || !Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { ok: false, reason: "invalid" };
  }

  const cookieStore = await cookies();
  const rated = (cookieStore.get(RATED_COOKIE)?.value ?? "")
    .split(".")
    .filter(Boolean);
  if (rated.includes(assetId)) return { ok: false, reason: "already-rated" };

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, reason: "failed" };
  }
  const { data: applied, error } = await admin.rpc("rate_asset", {
    target_asset: Number(assetId),
    stars,
  });
  if (error || !applied) return { ok: false, reason: "failed" };

  cookieStore.set(
    RATED_COOKIE,
    [...rated, assetId].slice(-MAX_REMEMBERED).join("."),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    },
  );
  updateTag(ASSETS_TAG);

  const { data } = await admin
    .from("assets")
    .select("rating_count, rating_total")
    .eq("id", Number(assetId))
    .single();
  const count = data?.rating_count ?? 0;
  return {
    ok: true,
    ratingCount: count,
    ratingAverage: count ? (data?.rating_total ?? 0) / count : stars,
  };
}
