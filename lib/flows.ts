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
      "Introduce a model, environment or tool. The Gemu team reviews every submission before it's listed.",
    // Rendered by components/asset-submission-form.tsx, not these placeholder fields.
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
    title: "Get asset — preview",
    copy: "This listing uses concept imagery and placeholder pricing, not a downloadable product. A real acquisition would require verified creator rights, a license, engine compatibility and a delivery service, plus payments for paid assets. Nothing is purchased, downloaded or added to an engine project here.",
  },
  assetCart: {
    title: "Cart — placeholder",
    copy: "A cart would hold assets before checkout. The preview catalogue has fictional creators and placeholder prices, with no payment service, so no item is added and no transaction takes place.",
  },
  assetSave: {
    title: "Saved assets — placeholder",
    copy: "Saved collections would help you return to assets you like. Account and collection features will be added later. Nothing is saved by this placeholder.",
  },
  assetReviews: {
    title: "Asset reviews",
    copy: "The catalogue contains preview assets, with no real ratings or reviews. Verified reviews and their moderation are future features.",
  },
  assetSupport: {
    title: "Asset support",
    copy: "A real listing would provide a verified creator support destination. No creator contact or support service is available for these sample assets.",
  },
};
export type InfoKey = keyof typeof infoContent;
