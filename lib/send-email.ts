import "server-only";

type Email = { toEmail: string; subject: string; message: string };

/**
 * Sends through EmailJS's REST API from the server, using the same template
 * parameters as the newsletter (to_email, subject, message, reply_to).
 * Requires "Allow EmailJS API for non-browser applications" and a private key
 * in the EmailJS account's security settings.
 */
export async function sendEmail({ toEmail, subject, message }: Email) {
  const {
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: serviceId,
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: templateId,
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: publicKey,
    EMAILJS_PRIVATE_KEY: privateKey,
  } = process.env;
  if (!serviceId || !templateId || !publicKey || !privateKey) {
    const missing = Object.entries({
      NEXT_PUBLIC_EMAILJS_SERVICE_ID: serviceId,
      NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: templateId,
      NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: publicKey,
      EMAILJS_PRIVATE_KEY: privateKey,
    })
      .filter(([, value]) => !value)
      .map(([name]) => name);
    throw new Error(
      `EmailJS isn't configured: missing ${missing.join(", ")}. See .env.example.`,
    );
  }

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        to_email: toEmail,
        subject,
        message,
        reply_to: toEmail,
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`EmailJS ${response.status}: ${await response.text()}`);
  }
}
