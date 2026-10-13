import Link from "next/link";
export default function AssetNotFound() {
  return (
    <div className="container section">
      <h1>Asset not found.</h1>
      <p>This listing is not in the sample catalogue.</p>
      <Link href="/assets" className="text-link">
        Browse voxel assets →
      </Link>
    </div>
  );
}
