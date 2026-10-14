import { NextResponse } from "next/server";
import {
  DISCORD_API,
  cleanName,
  discordConfig,
  randomName,
  toMessage,
  withAuthor,
  type DiscordMessage,
} from "@/lib/discord";

type Tag = { id: string; name: string; moderated?: boolean };
type Thread = {
  id: string;
  name: string;
  parent_id: string;
  applied_tags?: string[];
  message_count?: number;
};

export async function GET() {
  const cfg = discordConfig();
  if (!cfg) {
    return NextResponse.json(
      { error: "Missing Discord environment variables" },
      { status: 500 },
    );
  }

  const headers = { Authorization: `Bot ${cfg.token}` };

  const [forumRes, activeRes, archivedRes] = await Promise.all([
    fetch(`${DISCORD_API}/channels/${cfg.forumId}`, {
      headers,
      cache: "no-store",
    }),
    fetch(`${DISCORD_API}/guilds/${cfg.guildId}/threads/active`, {
      headers,
      cache: "no-store",
    }),
    fetch(
      `${DISCORD_API}/channels/${cfg.forumId}/threads/archived/public?limit=100`,
      { headers, cache: "no-store" },
    ),
  ]);

  if (!forumRes.ok || !activeRes.ok || !archivedRes.ok) {
    console.error(
      "Discord API error:",
      forumRes.status,
      activeRes.status,
      archivedRes.status,
    );
    return NextResponse.json(
      { error: "Failed to fetch Discord threads" },
      { status: 502 },
    );
  }

  const forum = await forumRes.json();
  const active = await activeRes.json();
  const archived = await archivedRes.json();

  const tags: Tag[] = forum.available_tags ?? [];
  const tagNames = new Map(tags.map((t) => [t.id, t.name]));
  const topics = tags
    .filter((t) => t.id !== cfg.solvedTagId)
    .map((t) => t.name);

  const unique = new Map<string, Thread>();
  for (const thread of [...active.threads, ...archived.threads] as Thread[]) {
    if (thread.parent_id === cfg.forumId) unique.set(thread.id, thread);
  }

  const threads = [...unique.values()]
    .sort((a, b) => (BigInt(b.id) > BigInt(a.id) ? 1 : -1))
    .slice(0, 50);

  const starters = await Promise.all(
    threads.map(async (thread) => {
      const res = await fetch(
        `${DISCORD_API}/channels/${thread.id}/messages/${thread.id}`,
        { headers, next: { revalidate: 30 } },
      );
      return res.ok ? toMessage((await res.json()) as DiscordMessage) : null;
    }),
  );

  const questions = threads.map((thread, i) => {
    const starter = starters[i];
    const topicTag = (thread.applied_tags ?? []).find(
      (id) => id !== cfg.solvedTagId,
    );
    return {
      id: thread.id,
      title: thread.name,
      body: starter?.body ?? "",
      topic: (topicTag && tagNames.get(topicTag)) || "General",
      name: starter?.name ?? "Unknown",
      time: starter?.time ?? new Date().toISOString(),
      url: `https://discord.com/channels/${cfg.guildId}/${thread.id}`,
      solved: cfg.solvedTagId
        ? (thread.applied_tags ?? []).includes(cfg.solvedTagId)
        : false,
      replyCount: thread.message_count ?? 0,
    };
  });

  return NextResponse.json(
    { questions, topics },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  try {
    const cfg = discordConfig();
    if (!cfg) {
      return NextResponse.json(
        { error: "Missing Discord environment variables" },
        { status: 500 },
      );
    }

    const { title, question, topic } = await request.json();

    if (
      typeof title !== "string" ||
      typeof question !== "string" ||
      !title.trim() ||
      !question.trim() ||
      title.length > 100 ||
      question.length > 1900
    ) {
      return NextResponse.json(
        { error: "Enter a title and a question (max 100 and 1900 characters)." },
        { status: 400 },
      );
    }

    const headers = { Authorization: `Bot ${cfg.token}` };

    const channelRes = await fetch(`${DISCORD_API}/channels/${cfg.forumId}`, {
      headers,
      cache: "no-store",
    });
    const channel = channelRes.ok ? await channelRes.json() : null;
    const usable: Tag[] = (channel?.available_tags ?? []).filter(
      (t: Tag) => !t.moderated && t.id !== cfg.solvedTagId,
    );

    let appliedTags: string[] = [];
    if (typeof topic === "string" && topic) {
      const tag = usable.find(
        (t) => t.name.toLowerCase() === topic.toLowerCase(),
      );
      if (tag) appliedTags = [tag.id];
    }

    if (!appliedTags.length && channel && (channel.flags & 16) && usable[0]) {
      appliedTags = [usable[0].id];
    }

    const response = await fetch(
      `${DISCORD_API}/channels/${cfg.forumId}/threads`,
      {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title.trim(),
          applied_tags: appliedTags,
          message: {
            content: withAuthor(randomName(), question),
            allowed_mentions: { parse: [] },
          },
        }),
      },
    );

    if (!response.ok) {
      console.error("Discord API error:", response.status, await response.text());
      return NextResponse.json(
        { error: "Could not create the Discord post." },
        { status: response.status === 429 ? 429 : 502 },
      );
    }

    const post = await response.json();
    return NextResponse.json({
      success: true,
      url: `https://discord.com/channels/${cfg.guildId}/${post.id}`,
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}