import type { Metadata } from "next";
import { AssetSubmissionForm } from "@/app/_components/asset-submission-form";

export const metadata: Metadata = {
  title: "Submit an asset · Gemu Forums",
};

export default function SubmitAssetPage() {
  return (
    <main className="gemu-grid flex flex-1 justify-center bg-ink px-4 py-12 sm:py-20">
      <AssetSubmissionForm />
    </main>
  );
}
