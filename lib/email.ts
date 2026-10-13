import emailjs from "@emailjs/browser";

type EmailInput = {
  toEmail: string;
  subject: string;
  message: string;
  replyTo?: string;
};

export async function sendEmail({ toEmail, subject, message, replyTo }: EmailInput) {
  await emailjs.send(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
    {
      to_email: toEmail,
      subject: subject,
      message: message,
      reply_to: replyTo ?? toEmail,
    },
    { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY! },
  );
}