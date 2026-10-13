"use client";

import { useState } from "react";
import { sendEmail } from "@/lib/email";

type Status = "idle" | "sending" | "sent" | "error";

const emptyForm = {
  path: "",
  name: "",
  email: "",
  role: "",
  project: "",
  experience: "",
  gameTitle: "",
  stage: "",
  support: "",
};

type FormData = typeof emptyForm;

export default function AccessForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [status, setStatus] = useState<Status>("idle");

  function update(field: keyof FormData, value: string) {
    setForm({ ...form, [field]: value });
  }

  const isEngine = form.path === "engine";


  const answers = [
    ["Type", isEngine ? "Engine access" : "Game for publishing"],
    ["Name", form.name],
    ["Email", form.email],
    ["Role", form.role],
    ...(isEngine
      ? [
          ["What they want to build", form.project],
          ["Experience", form.experience],
        ]
      : [
          ["Game title", form.gameTitle],
          ["Stage", form.stage],
          ["Support needed", form.support],
        ]),
  ];

  async function send() {
    setStatus("sending");
    const teamEmail = process.env.NEXT_PUBLIC_GEMU_TEAM_EMAIL!;
    const summary = answers.map(([label, value]) => `${label}: ${value}`).join("\n");

    try {
      await sendEmail({
        toEmail: teamEmail,
        subject: isEngine
          ? `New engine access request from ${form.name}`
          : `New game submission: ${form.gameTitle}`,
        message: `A new application came in through the website.\n\n${summary}`,
        replyTo: form.email,
      });

      await sendEmail({
        toEmail: form.email,
        subject: "We received your Gemu application",
        message: `Hi ${form.name},\n\nThanks for your application. The Gemu team will review it soon and reply to this email address.\n\nYour answers:\n${summary}\n\nThe Gemu team`,
        replyTo: teamEmail,
      });

      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      send();
    }
  }

  if (status === "sent") {
    return (
      <div>
        <h2>Application sent</h2>
        <p>Thanks, {form.name}. We sent a confirmation to {form.email}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>Step {step} of 4</p>

      {step === 1 && (
        <fieldset>
          <legend>What would you like to do?</legend>
          <label>
            <input
              type="radio"
              name="path"
              checked={form.path === "engine"}
              onChange={() => update("path", "engine")}
              required
            />
            Request engine access
          </label>
          <label>
            <input
              type="radio"
              name="path"
              checked={form.path === "publishing"}
              onChange={() => update("path", "publishing")}
            />
            Submit a game for publishing
          </label>
        </fieldset>
      )}

      {step === 2 && (
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required />

          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />

          <label htmlFor="role">Which describes you best?</label>
          <select id="role" value={form.role} onChange={(e) => update("role", e.target.value)} required>
            <option value="">Choose one</option>
            <option>Student</option>
            <option>Solo developer</option>
            <option>Indie studio</option>
            <option>Industry veteran starting a studio</option>
          </select>
        </div>
      )}

      {step === 3 && isEngine && (
        <div>
          <label htmlFor="project">What do you want to build?</label>
          <textarea id="project" value={form.project} onChange={(e) => update("project", e.target.value)} required />

          <label htmlFor="experience">Game development experience</label>
          <select id="experience" value={form.experience} onChange={(e) => update("experience", e.target.value)} required>
            <option value="">Choose one</option>
            <option>None yet</option>
            <option>Hobby projects</option>
            <option>Shipped a game</option>
          </select>
        </div>
      )}

      {step === 3 && !isEngine && (
        <div>
          <label htmlFor="gameTitle">Game title</label>
          <input id="gameTitle" value={form.gameTitle} onChange={(e) => update("gameTitle", e.target.value)} required />

          <label htmlFor="stage">How far along is it?</label>
          <select id="stage" value={form.stage} onChange={(e) => update("stage", e.target.value)} required>
            <option value="">Choose one</option>
            <option>Idea</option>
            <option>Prototype</option>
            <option>Vertical slice</option>
            <option>Alpha or beta</option>
          </select>

          <label htmlFor="support">What support are you looking for?</label>
          <textarea id="support" value={form.support} onChange={(e) => update("support", e.target.value)} required />
        </div>
      )}

      {step === 4 && (
        <div>
          <h2>Check your answers</h2>
          <ul>
            {answers.map(([label, value]) => (
              <li key={label}>
                {label}: {value}
              </li>
            ))}
          </ul>
          <label>
            <input type="checkbox" required />
            Gemu can contact me about this application.
          </label>
        </div>
      )}

      <div>
        {step > 1 && (
          <button type="button" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        <button type="submit" disabled={status === "sending"}>
          {step < 4 ? "Continue" : status === "sending" ? "Sending…" : "Send application"}
        </button>
      </div>

      {status === "error" && <p>The application could not be sent. Please try again.</p>}
    </form>
  );
}