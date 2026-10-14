
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { title, question } = await request.json();

    if (
      typeof title !== "string" ||
      typeof question !== "string" ||
      !title.trim() ||
      !question.trim() ||
      title.length > 100 ||
      question.length > 2000
    ) {
      return NextResponse.json(
        { error: "Enter a title and a question (max 100 and 2000 characters)." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://discord.com/api/v10/channels/${process.env.DISCORD_FORUM_ID}/threads`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: title.trim(),
          message: {
            content: question.trim(),
            allowed_mentions: { parse: [] },
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Discord API error:", response.status, await response.text());

      return NextResponse.json(
        { error: "Could not create the Discord post." },
        { status: 502 }
      );
    }

    const post = await response.json();

    return NextResponse.json({
      success: true,
      url: `https://discord.com/channels/${process.env.DISCORD_GUILD_ID}/${post.id}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
