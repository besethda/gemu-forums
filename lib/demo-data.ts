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
export type Asset = {
  id: string;
  name: string;
  category: string;
  image: string;
  alt: string;
  description: string;
};
export const categories = ["Models", "Environments", "Tools"];
export const sampleAssets: Asset[] = [
  {
    id: "cabin",
    name: "Timber cabin kit",
    category: "Models",
    image: "voxel-cabin.png",
    alt: "Voxel timber cabin and separate modular building pieces",
    description:
      "A modular timber cabin concept, with building pieces for imagining your own voxel outpost.",
  },
  {
    id: "forest",
    name: "Forest environment",
    category: "Environments",
    image: "voxel-world.png",
    alt: "Voxel pine forest, river and timber outpost",
    description:
      "A landscape concept combining pine forest, terrain and water. An example of how an environment listing could look.",
  },
  {
    id: "robot",
    name: "Utility robot",
    category: "Models",
    image: "voxel-robot.png",
    alt: "Block-based utility robot with a complete silhouette",
    description:
      "A voxel character concept with a clear, block-based silhouette. A starting point for imagining inhabitants of your world.",
  },
  {
    id: "world-kit",
    name: "World-building toolkit",
    category: "Tools",
    image: "voxel-cabin.png",
    alt: "Cabin concept and modular building pieces used as a tool listing placeholder",
    description:
      "An example of a creator tool listing. The cabin illustration is a placeholder; no tool or software is included.",
  },
];
