import { NextResponse } from "next/server";

export async function GET() {
  const {
    DISCORD_BOT_TOKEN,
    DISCORD_GUILD_ID,
    DISCORD_FORUM_ID,
    DISCORD_SOLVED_TAG_ID,
  } = process.env;

  if (
    !DISCORD_BOT_TOKEN ||
    !DISCORD_GUILD_ID ||
    !DISCORD_FORUM_ID ||
    !DISCORD_SOLVED_TAG_ID
  ) {
    return NextResponse.json(
      { error: "Missing Discord environment variables" },
      { status: 500 }
    );
  }

  const headers = {
    Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
  };

  const base = "https://discord.com/api/v10";

  const [activeResponse, archivedResponse] = await Promise.all([
    fetch(`${base}/guilds/${DISCORD_GUILD_ID}/threads/active`, {
      headers,
      cache: "no-store",
    }),
    fetch(
      `${base}/channels/${DISCORD_FORUM_ID}/threads/archived/public?limit=100`,
      {
        headers,
        cache: "no-store",
      }
    ),
  ]);

  if (!activeResponse.ok || !archivedResponse.ok) {
    console.error(
      "Discord API error:",
      activeResponse.status,
      archivedResponse.status
    );

    return NextResponse.json(
      { error: "Failed to fetch Discord threads" },
      { status: 502 }
    );
  }

  const activeData = await activeResponse.json();
  const archivedData = await archivedResponse.json();

  const threads = [
    ...activeData.threads,
    ...archivedData.threads,
  ];

  const posts = threads
    .filter((thread) => thread.parent_id === DISCORD_FORUM_ID)
    .map((thread) => ({
      id: thread.id,
      title: thread.name,
      url: `https://discord.com/channels/${DISCORD_GUILD_ID}/${thread.id}`,
      solved:
        thread.applied_tags?.includes(DISCORD_SOLVED_TAG_ID) ?? false,
    }));

  const uniquePosts = Array.from(
    new Map(posts.map((post) => [post.id, post])).values()
  );

  return NextResponse.json(uniquePosts, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}