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

type Ctx = { params: Promise<{ id: string }> };

async function isForumThread(id: string, token: string, forumId: string) {
  if (!/^\d{15,25}$/.test(id)) return false;
  const res = await fetch(`${DISCORD_API}/channels/${id}`, {
    headers: { Authorization: `Bot ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return false;
  const thread = await res.json();
  return thread.parent_id === forumId;
}

export async function GET(_request: Request, { params }: Ctx) {
  const cfg = discordConfig();
  if (!cfg) {
    return NextResponse.json(
      { error: "Missing Discord environment variables" },
      { status: 500 },
    );
  }

  const { id } = await params;
  if (!(await isForumThread(id, cfg.token, cfg.forumId))) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const res = await fetch(`${DISCORD_API}/channels/${id}/messages?limit=100`, {
    headers: { Authorization: `Bot ${cfg.token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Discord API error:", res.status, await res.text());
    return NextResponse.json(
      { error: "Failed to fetch messages." },
      { status: 502 },
    );
  }

  const raw = (await res.json()) as DiscordMessage[];
  const messages = raw
    .reverse()
    .filter((m) => m.type === 0 || m.type === 19)
    .map(toMessage);

  return NextResponse.json({ messages });
}

export async function POST(request: Request, { params }: Ctx) {
  try {
    const cfg = discordConfig();
    if (!cfg) {
      return NextResponse.json(
        { error: "Missing Discord environment variables" },
        { status: 500 },
      );
    }

    const { id } = await params;
    const { reply } = await request.json();

    if (typeof reply !== "string" || !reply.trim() || reply.length > 1900) {
      return NextResponse.json(
        { error: "Enter a reply (max 1900 characters)." },
        { status: 400 },
      );
    }

    if (!(await isForumThread(id, cfg.token, cfg.forumId))) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const res = await fetch(`${DISCORD_API}/channels/${id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: withAuthor(randomName(), reply),
        allowed_mentions: { parse: [] },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Discord API error:", res.status, detail);
      return NextResponse.json(
        {
          error: "Could not post your reply.",
          ...(process.env.NODE_ENV !== "production" && {
            detail: `${res.status} ${detail}`,
          }),
        },
        { status: res.status === 429 ? 429 : 502 },
      );
    }

    return NextResponse.json({
      success: true,
      message: toMessage((await res.json()) as DiscordMessage),
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}