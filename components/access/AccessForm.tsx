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

export default function AccessForm({ initialPath = "" }: { initialPath?: string }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({ ...emptyForm, path: initialPath });
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
      <div className="section">
        <h2>Application sent</h2>
        <p className="lead">
          Thanks, {form.name}. We sent a confirmation to {form.email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 48, maxWidth: 720 }}>
      <p className="eyebrow">Step {step} of 4</p>

      {step === 1 && (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="lead">What would you like to do?</legend>
          <div className="actions">
            <label className="button secondary">
              <input
                type="radio"
                name="path"
                checked={form.path === "engine"}
                onChange={() => update("path", "engine")}
                required
                style={{ width: "auto", minHeight: "auto" }}
              />
              Request engine access
            </label>
            <label className="button secondary">
              <input
                type="radio"
                name="path"
                checked={form.path === "publishing"}
                onChange={() => update("path", "publishing")}
                style={{ width: "auto", minHeight: "auto" }}
              />
              Submit a game for publishing
            </label>
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <div className="form-fields">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          </div>
          <div className="field field-wide">
            <label htmlFor="role">Which describes you best?</label>
            <select id="role" value={form.role} onChange={(e) => update("role", e.target.value)} required>
              <option value="">Choose one</option>
              <option>Student</option>
              <option>Solo developer</option>
              <option>Indie studio</option>
              <option>Industry veteran starting a studio</option>
            </select>
          </div>
        </div>
      )}

      {step === 3 && isEngine && (
        <div className="form-fields">
          <div className="field field-wide">
            <label htmlFor="project">What do you want to build?</label>
            <textarea id="project" rows={4} value={form.project} onChange={(e) => update("project", e.target.value)} required />
          </div>
          <div className="field field-wide">
            <label htmlFor="experience">Game development experience</label>
            <select id="experience" value={form.experience} onChange={(e) => update("experience", e.target.value)} required>
              <option value="">Choose one</option>
              <option>None yet</option>
              <option>Hobby projects</option>
              <option>Shipped a game</option>
            </select>
          </div>
        </div>
      )}

      {step === 3 && !isEngine && (
        <div className="form-fields">
          <div className="field">
            <label htmlFor="gameTitle">Game title</label>
            <input id="gameTitle" value={form.gameTitle} onChange={(e) => update("gameTitle", e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="stage">How far along is it?</label>
            <select id="stage" value={form.stage} onChange={(e) => update("stage", e.target.value)} required>
              <option value="">Choose one</option>
              <option>Idea</option>
              <option>Prototype</option>
              <option>Vertical slice</option>
              <option>Alpha or beta</option>
            </select>
          </div>
          <div className="field field-wide">
            <label htmlFor="support">What support are you looking for?</label>
            <textarea id="support" rows={4} value={form.support} onChange={(e) => update("support", e.target.value)} required />
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2>Check your answers</h2>
          <dl className="request-summary">
            {answers.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <label style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 24, fontSize: 14 }}>
            <input type="checkbox" required style={{ width: "auto", minHeight: "auto" }} />
            Gemu can contact me about this application.
          </label>
        </div>
      )}

      <div className="actions">
        {step > 1 && (
          <button type="button" className="button secondary" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        <button type="submit" className="button" disabled={status === "sending"}>
          {step < 4 ? "Continue" : status === "sending" ? "Sending…" : "Send application"}
        </button>
      </div>

      {status === "error" && (
        <p className="disclosure">The application could not be sent. Please try again.</p>
      )}
    </form>
  );
}