"use client";

import { useState } from "react";
import { sendEmail } from "@/lib/email";

type Status = "idle" | "sending" | "sent" | "error";

export default function AccessForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [project, setProject] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const teamEmail = process.env.NEXT_PUBLIC_GEMU_TEAM_EMAIL!;

    try {
      await sendEmail({
        toEmail: teamEmail,
        subject: `New engine access request from ${name}`,
        message: `New engine access request

Name: ${name}
Email: ${email}

What they want to build:
${project}`,
        replyTo: email,
      });

      await sendEmail({
        toEmail: email,
        subject: "We received your Gemu application",
        message: `Hi ${name},

Thanks for applying for Gemu engine access. We have received your application and the team will review it soon. We will reply to this email address.

The Gemu team`,
        replyTo: teamEmail,
      });

      setStatus("sent");
    } catch (error) {
      console.error("Email error", error);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div>
        <h2>Application sent</h2>
        <p>
          Thanks, {name}. We sent a confirmation to {email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="access-name">Name</label>
        <input
          id="access-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="access-email">Email</label>
        <input
          id="access-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="access-project">What do you want to build?</label>
        <textarea
          id="access-project"
          value={project}
          onChange={(event) => setProject(event.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Request engine access"}
      </button>

      {status === "error" && (
        <p>The application could not be sent. Please try again.</p>
      )}
    </form>
  );
}
