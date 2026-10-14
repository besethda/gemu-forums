"use client";

import { useState } from "react";
import { flows, type Flow, type FlowKey } from "@/lib/flows";
import { sendEmail } from "@/lib/email";

type Status = "idle" | "sending" | "sent" | "error";

export default function FlowForm({ flowKey }: { flowKey: FlowKey }) {
  const flow: Flow = flows[flowKey];
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");

  function update(name: string, value: string) {
    setValues({ ...values, [name]: value });
  }

  const name = values.name || "there";
  const email = values.email || "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const teamEmail = process.env.NEXT_PUBLIC_GEMU_TEAM_EMAIL!;
    const summary = flow.fields
      .map((field) => `${field.label}: ${values[field.name] || "-"}`)
      .join("\n");

    try {
      await sendEmail({
        toEmail: teamEmail,
        subject: `${flow.title}: ${name}`,
        message: `A new "${flow.title}" form came in through the website.\n\n${summary}`,
        replyTo: email || teamEmail,
      });

    
      if (email) {
        await sendEmail({
          toEmail: email,
          subject: `We received your message: ${flow.title}`,
          message: `Hi ${name},\n\nThanks for getting in touch. The Gemu team will read your message and reply to this email address.\n\nYour answers:\n${summary}\n\nThe Gemu team`,
          replyTo: teamEmail,
        });
      }

      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div>
        <h2>Sent</h2>
        <p className="lead">
          {email
            ? `Thanks, ${name}. We sent a confirmation to ${email}.`
            : `Thanks, ${name}. Your message has been sent to the Gemu team.`}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-fields">
        {flow.fields.map((field) => (
          <div
            key={field.name}
            className={field.type === "textarea" ? "field field-wide" : "field"}
          >
            <label htmlFor={`field-${field.name}`}>{field.label}</label>

            {field.type === "select" ? (
              <select
                id={`field-${field.name}`}
                value={values[field.name] ?? ""}
                onChange={(e) => update(field.name, e.target.value)}
                required={field.required}
              >
                <option value="">Choose an option</option>
                {field.options?.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                id={`field-${field.name}`}
                rows={3}
                value={values[field.name] ?? ""}
                onChange={(e) => update(field.name, e.target.value)}
                required={field.required}
              />
            ) : (
              <input
                id={`field-${field.name}`}
                type={field.type ?? "text"}
                value={values[field.name] ?? ""}
                onChange={(e) => update(field.name, e.target.value)}
                required={field.required}
              />
            )}
          </div>
        ))}
      </div>

      <div className="actions">
        <button type="submit" className="button" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send"}
        </button>
      </div>

      {status === "error" && (
        <p className="disclosure">The form could not be sent. Please try again.</p>
      )}
    </form>
  );
}