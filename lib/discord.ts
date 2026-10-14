export const DISCORD_API = "https://discord.com/api/v10";

const ANIMALS = [
  "frog", "fox", "owl", "otter", "badger", "heron", "lynx", "panda",
  "koala", "gecko", "moose", "bison", "falcon", "walrus", "penguin",
  "hedgehog", "raccoon", "beaver", "dolphin", "turtle", "llama", "yak",
  "newt", "crane", "seal", "wombat", "sloth", "ferret", "marmot",
  "magpie", "puffin", "tapir", "quokka", "lemur", "stoat", "finch",
  "toad", "mole", "crow", "hare",
];

function nameFromId(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return `anonymous-${ANIMALS[hash % ANIMALS.length]}`;
}

export function randomName() {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `anonymous-${animal}`;
}

export function discordConfig() {
  const {
    DISCORD_BOT_TOKEN,
    DISCORD_GUILD_ID,
    DISCORD_FORUM_ID,
    DISCORD_SOLVED_TAG_ID,
  } = process.env;

  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID || !DISCORD_FORUM_ID) return null;

  return {
    token: DISCORD_BOT_TOKEN,
    guildId: DISCORD_GUILD_ID,
    forumId: DISCORD_FORUM_ID,
    solvedTagId: DISCORD_SOLVED_TAG_ID,
  };
}

export type DiscordMessage = {
  id: string;
  type: number;
  content: string;
  timestamp: string;
  author: { username: string; global_name?: string | null; bot?: boolean };
};

export function cleanName(value: unknown) {
  const name =
    typeof value === "string"
      ? value.replace(/[*_`~|<>@#\n\r]/g, "").trim().slice(0, 40)
      : "";
  return name || "Anonymous";
}

export function withAuthor(name: string, text: string) {
  return `**${name}**\n\n${text.trim()}`;
}

export function toMessage(m: DiscordMessage) {
  const match = m.author.bot ? m.content.match(/^\*\*(.{1,40}?)\*\*\n\n/) : null;
  return {
    id: m.id,
    name: match ? match[1] : nameFromId(m.id),
    body: match ? m.content.slice(match[0].length) : m.content,
    time: m.timestamp,
  };
}