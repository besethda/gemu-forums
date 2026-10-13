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
  creator: string;
  price: number;
  featured?: boolean;
};
export const categories = ["Models", "Environments", "Tools"];
export const sampleAssets: Asset[] = [
  {
    id: "cabin",
    creator: "Timberbyte Studio",
    price: 14.99,
    name: "Timber cabin kit",
    category: "Models",
    image: "voxel-cabin.png",
    alt: "Voxel timber cabin and modular building pieces",
    description:
      "A modular timber cabin concept with walls, roofing and smaller building pieces. Imagine a starting point for an outpost in your voxel world. This listing contains concept artwork only; no model files are supplied.",
    featured: true,
  },
  {
    id: "forest",
    creator: "Northblock Worlds",
    price: 24.99,
    name: "Forest environment",
    category: "Environments",
    image: "voxel-world.png",
    alt: "Voxel pine forest, river and timber outpost",
    description:
      "A landscape concept combining pine forest, terrain and water. Explore an imagined world and its atmosphere. This is illustrative artwork, not an environment package or Gemu gameplay capture.",
    featured: true,
  },
  {
    id: "robot",
    creator: "Little Gear Studio",
    price: 9.99,
    name: "Utility robot",
    category: "Models",
    image: "voxel-robot.png",
    alt: "Block-based utility robot with a complete silhouette",
    description:
      "An imagined voxel character with a clear block-based silhouette and expressive details. A concept for one of the inhabitants of your next world. No rig, animations or model files are included.",
    featured: true,
  },
  {
    id: "world-kit",
    creator: "Voxel Foundry",
    price: 19.99,
    name: "World-building toolkit",
    category: "Tools",
    image: "feature-connected-tools.png",
    alt: "Voxel workbench with modular blocks, a wrench and connectors",
    description:
      "A concept for a modular creator workflow. The workbench illustration suggests how tools and building blocks could come together; no editor extension or software is included.",
    featured: true,
  },
  {
    id: "outpost",
    creator: "Riverbend Workshop",
    price: 12.99,
    name: "Riverside outpost",
    category: "Environments",
    image: "voxel-world.png",
    alt: "Riverside voxel settlement in a pine forest",
    description:
      "An environment concept using the forest illustration. Timber buildings and water suggest a place to start an adventure. No terrain or scene files are supplied.",
    featured: true,
  },
  {
    id: "building-blocks",
    creator: "Brick & Beam",
    price: 0,
    name: "Modular building pieces",
    category: "Models",
    image: "voxel-cabin.png",
    alt: "Cabin concept with modular walls, roof and doors",
    description:
      "A catalogue concept for reusable voxel building pieces, illustrated by the timber cabin artwork. Actual piece counts, dimensions and file formats have not been supplied.",
  },
  {
    id: "co-op",
    creator: "Play Together Labs",
    price: 29.99,
    name: "Co-op prototype kit",
    category: "Tools",
    image: "feature-multiplayer-physics.png",
    alt: "Two voxel robot players balancing and moving cubes",
    description:
      "A concept showing how a multiplayer prototype resource could be presented. The robots and cubes are concept imagery. No gameplay code, networking system or project files are included.",
  },
  {
    id: "light-sound",
    creator: "Quiet Light Studio",
    price: 8.99,
    name: "Lighting & sound kit",
    category: "Tools",
    image: "feature-lighting-audio.png",
    alt: "Voxel room with light, shadows and a speaker",
    description:
      "A creator-resource concept with a lighting and audio illustration. No lights, audio recordings, effects or tool files are supplied.",
  },
  {
    id: "platform",
    creator: "Patchwork Tools",
    price: 0,
    name: "Platform connector",
    category: "Tools",
    image: "feature-steam-integration.png",
    alt: "Voxel controller and connected platforms",
    description:
      "A concept for presenting a platform integration resource. The connected blocks are an illustration; no platform SDK, credentials or integration software is included.",
  },
  {
    id: "workshop",
    creator: "Blocksmith Collective",
    price: 6.99,
    name: "Creator workbench",
    category: "Models",
    image: "feature-connected-tools.png",
    alt: "Block-built workbench and modular tools",
    description:
      "A voxel workshop prop concept with a bench, tools and modular pieces. This preview contains artwork only, not a downloadable prop set.",
  },
];
export function assetImageSize(image: string) {
  if (image === "voxel-world.png") return { width: 1672, height: 941 };
  if (image.startsWith("feature-")) return { width: 1536, height: 1024 };
  return { width: 1448, height: 1086 };
}

export function formatAssetPrice(price: number) {
  return price === 0 ? "Free" : `€${price.toFixed(2)}`;
}
