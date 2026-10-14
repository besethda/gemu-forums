export type Message = { name: string; time: string; body: string };
export type Question = Message & {
  id: string;
  title: string;
  topic: string;
  replies: Message[];
};
export const topics = ["Getting started", "Multiplayer", "Assets"];
export const communityQuestions: Question[] = [
  {
    id: "multiplayer",
    title: "How would I start a multiplayer project?",
    topic: "Multiplayer",
    name: "Elin Söder",
    time: "09:12",
    body: "I'm planning a small co-op prototype with a friend. Would you start with one shared test scene or build the core interaction first? We're trying to keep the first milestone small.",
    replies: [
      {
        name: "Ari Lind",
        time: "09:18",
        body: "I'd pick one interaction that needs both players. A shared test scene makes it easier to see whether you're both seeing the same result.",
      },
      {
        name: "Sofia Chen",
        time: "09:24",
        body: "We usually write down the expected behaviour before adding more systems. It helps separate gameplay decisions from connection problems.",
      },
      {
        name: "Elin Söder",
        time: "09:31",
        body: "That makes sense. We'll try moving a single object together and keep the rest of the scene simple.",
      },
    ],
  },
  {
    id: "voxel-import",
    title: "What should I check before choosing a voxel asset?",
    topic: "Assets",
    name: "Milo Berg",
    time: "10:03",
    body: "I'm looking for a small environment kit. Apart from its visual style, which details would you check before bringing it into a project?",
    replies: [
      {
        name: "Nora Ek",
        time: "10:11",
        body: "License, file format and supported engine version would be my first checks. I'd also want to know whether the files are editable.",
      },
      {
        name: "Oskar Lund",
        time: "10:17",
        body: "Scale matters too. Ask whether the pieces follow one consistent grid, especially if you want to combine more than one kit.",
      },
      {
        name: "Milo Berg",
        time: "10:22",
        body: "Good point about the grid. I was only looking at the thumbnails, so I'll make a checklist before picking anything.",
      },
    ],
  },
  {
    id: "access",
    title: "What should I include when requesting engine access?",
    topic: "Getting started",
    name: "Lena Anders",
    time: "11:06",
    body: "I have a prototype idea and would like to introduce it to the Gemu team. How much detail would you put into the project description at this stage?",
    replies: [
      {
        name: "Jules Martin",
        time: "11:13",
        body: "I'd describe the core idea, your current stage and what you want to explore with the engine. A short, clear introduction is easier to understand than a full design document.",
      },
      {
        name: "Lena Anders",
        time: "11:21",
        body: "Thanks. I'll focus on the player interaction and include a link to the concept rather than the whole document.",
      },
    ],
  },
  {
    id: "collision",
    title: "How do you keep a physics test scene manageable?",
    topic: "Multiplayer",
    name: "Oskar Lund",
    time: "12:08",
    body: "Our prototype scene is getting crowded with test objects. How do you organise small experiments without making the main scene harder to work in?",
    replies: [
      {
        name: "Elin Söder",
        time: "12:14",
        body: "We keep a separate scene for each interaction and write down what each one is supposed to demonstrate.",
      },
      {
        name: "Ari Lind",
        time: "12:23",
        body: "A naming convention helps as well. We keep the starting conditions consistent so two people can reproduce the same experiment.",
      },
    ],
  },
  {
    id: "modular",
    title: "Any tips for keeping modular pieces on the same grid?",
    topic: "Assets",
    name: "Nora Ek",
    time: "13:02",
    body: "I'm sketching a cabin kit with walls, doors and roof pieces. I'd like the pieces to fit together without lots of manual adjustment.",
    replies: [
      {
        name: "Milo Berg",
        time: "13:09",
        body: "I'd settle on one base unit before making the individual pieces. A few simple reference blocks can make scale differences easier to spot.",
      },
      {
        name: "Sofia Chen",
        time: "13:16",
        body: "Try combining the rough pieces early. It catches awkward corners before you spend time on surface details.",
      },
    ],
  },
  {
    id: "first-prototype",
    title: "What belongs in a first playable prototype?",
    topic: "Getting started",
    name: "Jules Martin",
    time: "14:10",
    body: "I'm working on an exploration idea and keep adding things to the plan. What would you consider enough for a first playtest?",
    replies: [
      {
        name: "Lena Anders",
        time: "14:18",
        body: "One short loop that lets someone make a choice and see a result. I'd leave out anything that doesn't help test that loop.",
      },
      {
        name: "Jules Martin",
        time: "14:26",
        body: "I'll cut it down to finding one item and returning to the starting point. That should give us something useful to test.",
      },
    ],
  },
  {
    id: "sound",
    title: "How do you plan sound for an early voxel scene?",
    topic: "Getting started",
    name: "Sofia Chen",
    time: "15:04",
    body: "The visuals are still rough, but we'd like to start thinking about sound. Do you begin with atmosphere or with feedback for the main interaction?",
    replies: [
      {
        name: "Oskar Lund",
        time: "15:12",
        body: "I'd start with the interaction. Clear feedback makes early playtests easier to interpret, even if the atmosphere is still temporary.",
      },
    ],
  },
  {
    id: "co-op-tests",
    title: "What do you write down after a co-op playtest?",
    topic: "Multiplayer",
    name: "Ari Lind",
    time: "16:07",
    body: "We're doing our first two-player test this week. I'd like a short list of observations that will help us decide what to change next.",
    replies: [
      {
        name: "Elin Söder",
        time: "16:15",
        body: "Note where players needed an explanation, where they lost track of each other and whether both understood the shared goal.",
      },
      {
        name: "Nora Ek",
        time: "16:22",
        body: "Keep their exact words when you can. It's easier to come back to a specific comment than a general note like 'confusing'.",
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
    image: "voxel-cabin.webp",
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
    image: "voxel-world.webp",
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
    image: "voxel-robot.webp",
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
    image: "feature-connected-tools.webp",
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
    image: "voxel-world.webp",
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
    image: "voxel-cabin.webp",
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
    image: "feature-multiplayer-physics.webp",
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
    image: "feature-lighting-audio.webp",
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
    image: "feature-steam-integration.webp",
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
    image: "feature-connected-tools.webp",
    alt: "Block-built workbench and modular tools",
    description:
      "A voxel workshop prop concept with a bench, tools and modular pieces. This preview contains artwork only, not a downloadable prop set.",
  },
];
export function assetImageSize(image: string) {
  if (image === "voxel-world.webp") return { width: 1672, height: 941 };
  if (image.startsWith("feature-")) return { width: 1536, height: 1024 };
  return { width: 1448, height: 1086 };
}

export function formatAssetPrice(price: number) {
  return price === 0 ? "Free" : `€${price.toFixed(2)}`;
}
