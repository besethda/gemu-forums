import Link from "next/link";
export default function AssetNotFound() {
  return (
    <div className="container section">
      <h1>Asset not found.</h1>
      <p>This listing isn&apos;t in the store, or hasn&apos;t been approved yet.</p>
      <Link href="/assets" className="text-link">
        Browse voxel assets →
      </Link>
    </div>
  );
}
