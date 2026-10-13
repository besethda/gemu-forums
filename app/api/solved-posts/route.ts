
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
      next: { revalidate: 300 },
    }),
    fetch(
      `${base}/channels/${DISCORD_FORUM_ID}/threads/archived/public?limit=100`,
      {
        headers,
        next: { revalidate: 300 },
      }
    ),
  ]);

  if (!activeResponse.ok || !archivedResponse.ok) {
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

  const solvedPosts = threads
    .filter(
      (thread) =>
        thread.parent_id === DISCORD_FORUM_ID &&
        thread.applied_tags?.includes(DISCORD_SOLVED_TAG_ID)
    )
    .map((thread) => ({
      id: thread.id,
      title: thread.name,
      url: `https://discord.com/channels/${DISCORD_GUILD_ID}/${thread.id}`,
    }));

  const uniquePosts = Array.from(
    new Map(solvedPosts.map((post) => [post.id, post])).values()
  );

  return NextResponse.json(uniquePosts);
}