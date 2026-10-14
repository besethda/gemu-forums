type Field = {
  name: string;
  label: string;
  type?: "email" | "url" | "select" | "textarea";
  required?: boolean;
  options?: string[];
};
export type Flow = { title: string; intro: string; fields: Field[] };
const person: Field[] = [
  { name: "name", label: "Your name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
];
const stage: Field = {
  name: "stage",
  label: "Project stage",
  type: "select",
  required: true,
  options: [
    "Exploring an idea",
    "Building a prototype",
    "Developing a game",
    "Preparing to release",
  ],
};
export const flows = {
  engine: {
    title: "Request engine access",
    intro: "Introduce yourself and the world you want to build.",
    fields: [
      ...person,
      { name: "studio", label: "Studio or project (optional)" },
      stage,
      {
        name: "summary",
        label: "What would you like to build?",
        type: "textarea",
        required: true,
      },
    ],
  },
  publishing: {
    title: "Submit a game",
    intro: "Tell us about your game and the support you are looking for.",
    fields: [
      ...person,
      { name: "studio", label: "Studio or project (optional)" },
      stage,
      {
        name: "summary",
        label: "Tell us about your game",
        type: "textarea",
        required: true,
      },
      { name: "link", label: "Game or pitch link (optional)", type: "url" },
      {
        name: "support",
        label: "What support are you looking for?",
        type: "textarea",
        required: true,
      },
    ],
  },
  bootcamp: {
    title: "Register Bootcamp interest",
    intro: "Tell us where you are starting and what you want to learn.",
    fields: [
      ...person,
      {
        name: "experience",
        label: "Experience level",
        type: "select",
        required: true,
        options: [
          "New to game development",
          "Student / learning",
          "Independent developer",
          "Working in a studio",
        ],
      },
      {
        name: "interest",
        label: "Your interest",
        type: "select",
        required: true,
        options: [
          "Learning voxel development",
          "Developing my first game",
          "Starting a studio",
        ],
      },
      {
        name: "summary",
        label: "What would you like to learn?",
        type: "textarea",
        required: true,
      },
    ],
  },
  investment: {
    title: "Investment or game funding enquiry",
    intro:
      "Introduce your organisation and the conversation you would like to start.",
    fields: [
      ...person,
      { name: "organization", label: "Organisation (optional)" },
      {
        name: "summary",
        label: "What would you like to discuss?",
        type: "textarea",
        required: true,
      },
    ],
  },
  licensing: {
    title: "Technology licensing enquiry",
    intro: "Tell us how you would like to use Gemu technology.",
    fields: [
      ...person,
      { name: "organization", label: "Organisation (optional)" },
      {
        name: "summary",
        label: "Your intended use",
        type: "textarea",
        required: true,
      },
    ],
  },
  creator: {
    title: "Share or sell your work",
    intro:
      "Enter your email and we'll send you a link to the submission page. Your asset goes live as soon as you publish it.",
    // The real email step is components/submission-link-form.tsx.
    fields: [],
  },
  question: {
    title: "Ask a question",
    intro:
      "Describe what you are trying to do and what you have already tried.",
    fields: [
      { name: "name", label: "Display name", required: true },
      { name: "title", label: "Question title", required: true },
      {
        name: "topic",
        label: "Topic",
        type: "select",
        required: true,
        options: ["Getting started", "Multiplayer", "Assets"],
      },
      {
        name: "summary",
        label: "Question details",
        type: "textarea",
        required: true,
      },
    ],
  },
  reply: {
    title: "Reply on website",
    intro: "A placeholder for adding your answer to a discussion.",
    fields: [
      { name: "name", label: "Display name", required: true },
      {
        name: "summary",
        label: "Your reply",
        type: "textarea",
        required: true,
      },
    ],
  },
} satisfies Record<string, Flow>;
export type FlowKey = keyof typeof flows;
export const infoContent = {
  docs: {
    title: "Documentation",
    copy: "Getting-started guides and the technical reference would live here. A verified documentation destination and its access rules have not been supplied yet. You can explore the sample developer questions in Community.",
  },
  privacy: {
    title: "Privacy and terms — preview",
    copy: "Gemu's actual privacy, community and asset terms are still to be supplied. Forms in this draft are inactive placeholders. Sample questions and replies illustrate the forum. No personal information can be entered or submitted.",
  },
  updates: {
    title: "News and updates",
    copy: "Engine news, studio stories and Bootcamp updates would appear here when verified content is available. Newsletter subscriptions are not connected in this draft.",
  },
  acquire: {
    title: "Get asset",
    copy: "Purchasing and downloads aren't available yet. Checkout and delivery are coming soon.",
  },
  assetSupport: {
    title: "Asset support",
    copy: "Creator support contacts aren't shown yet. For questions about a listing, contact the Gemu team.",
  },
};
export type InfoKey = keyof typeof infoContent;
