import type { Metadata } from "next";
import AccessForm from "@/components/access/AccessForm";

export const metadata: Metadata = {
  title: "Apply to Gemu",
};

export default function AccessPage() {
  return (
    <main>
      <h1>Apply to Gemu</h1>
      <AccessForm />
    </main>
  );
}


