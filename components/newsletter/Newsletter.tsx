"use client";

import { useState } from "react";
import { sendEmail } from "@/lib/email";

type Status = "idle" | "sending" | "sent" | "error";

const topics = [
  "Engine releases",
  "Bootcamp intakes",
  "New voxel assets",
  "Studio spotlights",
  "Investor updates",
];

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>(["Engine releases"]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  function toggle(topic: string) {
    setSelected(
      selected.includes(topic)
        ? selected.filter((item) => item !== topic)
        : [...selected, topic],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selected.length === 0) {
      setError("Choose at least one topic.");
      return;
    }
    setError("");
    setStatus("sending");

    const teamEmail = process.env.NEXT_PUBLIC_GEMU_TEAM_EMAIL!;
    const topicList = selected.map((topic) => `- ${topic}`).join("\n");

    try {
      
      await sendEmail({
        toEmail: teamEmail,
        subject: `New newsletter subscriber: ${email}`,
        message: `Someone subscribed to updates on the website.\n\nEmail: ${email}\nCRM tags: Newsletter, ${selected.join(", ")}`,
        replyTo: email,
      });

    
      await sendEmail({
        toEmail: email,
        subject: "Welcome to Gemu updates",
        message: `Hi,\n\nThanks for subscribing to Gemu updates. We will only send you news about the topics you chose:\n${topicList}\n\nThe Gemu team`,
        replyTo: teamEmail,
      });

      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div>
        <h2>You&apos;re subscribed</h2>
        <p className="lead">
          We sent a welcome email to {email}. You&apos;ll get: {selected.join(", ")}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset style={{ border: 0, padding: 0, margin: "24px 0 0" }}>
        <legend className="lead">What would you like to hear about?</legend>
        <div className="actions">
          {topics.map((topic) => (
            <label key={topic} className="button secondary">
              <input
                type="checkbox"
                checked={selected.includes(topic)}
                onChange={() => toggle(topic)}
                style={{ width: "auto", minHeight: "auto" }}
              />
              {topic}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="form-fields">
        <div className="field field-wide">
          <label htmlFor="newsletter-email">Email</label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="actions">
        <button type="submit" className="button" disabled={status === "sending"}>
          {status === "sending" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>

      {error && <p className="disclosure">{error}</p>}
      {status === "error" && (
        <p className="disclosure">The subscription could not be sent. Please try again.</p>
      )}
    </form>
  );
}