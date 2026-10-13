"use client";

import { useState } from "react";
import { sendEmail } from "@/lib/email";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await sendEmail({
        toEmail: email,
        subject: "Welcome to Gemu updates",
        message: "Thanks for subscribing! This is a test email from our hackathon website.",
      });
      setSubscribed(true);
    } catch {
      setError("The email could not be sent. Please try again.");
    }
  }

  if (subscribed) {
    return <p>Thanks! You are subscribed with {email}.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="newsletter-email">Email</label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <button type="submit">Subscribe</button>
            {error && <p>{error}</p>}
    </form>
  );
}