export type Message = { name: string; origin: "Website"; body: string };
export type Question = Message & {
  id: string;
  title: string;
  topic: string;
  replies: Message[];
};
export const topics = ["Getting started", "Multiplayer", "Assets"];
export const sampleQuestions: Question[] = [
  {
    id: "multiplayer",
    title: "How would I start a multiplayer project?",
    topic: "Multiplayer",
    name: "Sample creator",
    origin: "Website",
    body: "I'm planning a small co-op prototype. Which starting resources should I look for?",
    replies: [
      {
        name: "Sample responder",
        origin: "Website",
        body: "Which engine version and target platform are you using? Share the steps you've tried so the community can help.",
      },
    ],
  },
  {
    id: "voxel-import",
    title: "How would I bring a voxel model into my project?",
    topic: "Assets",
    name: "Sample creator",
    origin: "Website",
    body: "What compatibility information should I check before choosing an asset?",
    replies: [
      {
        name: "Sample responder",
        origin: "Website",
        body: "Check the file format, license and supported engine version. This is where a verified import guide would appear once documentation is available.",
      },
    ],
  },
  {
    id: "access",
    title: "What should I include when requesting engine access?",
    topic: "Getting started",
    name: "Sample creator",
    origin: "Website",
    body: "I have a prototype idea and would like to introduce it to the Gemu team.",
    replies: [
      {
        name: "Sample responder",
        origin: "Website",
        body: "Introduce yourself, your project and its stage. The access form demonstrates that introduction; actual qualification and review are still to confirm.",
      },
    ],
  },
];
