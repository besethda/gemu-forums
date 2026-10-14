import type { Metadata } from "next";
import AccessForm from "@/components/access/AccessForm";

export const metadata: Metadata = {
  title: "Apply to Gemu",
};

export default function AccessPage() {
  return (
    <div className="container section">
      <p className="eyebrow">Gemu Engine</p>
      <h1>Apply to Gemu</h1>
      <p className="lead">
        Request engine access or submit your game for publishing. It takes about two minutes.
      </p>
      <AccessForm />
    </div>
  );
}