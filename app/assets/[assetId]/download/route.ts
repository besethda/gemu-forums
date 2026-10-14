import { createAdminClient } from "@/lib/supabase/admin";

/** How long the signed link works. It's only needed for the redirect. */
const LINK_SECONDS = 60;

/**
 * The checkout form posts here (in a new tab). Payment is fake for now, so
 * any submission gets a short-lived signed link to the private ZIP and is
 * redirected to it, which starts the download.
 */
export async function POST(
  _request: Request,
  ctx: RouteContext<"/assets/[assetId]/download">,
) {
  const { assetId } = await ctx.params;
  if (!/^\d+$/.test(assetId)) {
    return new Response("Asset not found.", { status: 404 });
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch (configError) {
    console.error(configError);
    return new Response("Downloads aren't available right now.", { status: 503 });
  }

  const { data: asset } = await admin
    .from("assets")
    .select("title, asset")
    .eq("id", Number(assetId))
    .eq("status", "approved")
    .maybeSingle();
  if (!asset) return new Response("Asset not found.", { status: 404 });

  const { data, error } = await admin.storage
    .from("asset-files")
    .createSignedUrl(asset.asset, LINK_SECONDS, {
      download: `${fileName(asset.title)}.zip`,
    });
  if (error) {
    console.error("Signing download failed", error);
    return new Response("This download isn't available right now.", { status: 502 });
  }

  // 303 so the browser follows with a GET to the storage URL.
  return Response.redirect(data.signedUrl, 303);
}

/** "Stone Golem (v2)" → "stone-golem-v2". */
function fileName(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "asset"
  );
}
