import type { Metadata } from "next";
import AccessForm from "@/components/access/AccessForm";

export const metadata: Metadata = {
  title: "Request engine access · Gemu",
};

export default function AccessPage() {
  return (
    <main>
      <h1>Request engine access</h1>
      <AccessForm />
    </main>
  );
}


