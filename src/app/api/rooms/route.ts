import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { api, convexClient } from "@/lib/convex";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name : "You";
    if (process.env.E2E === "1") {
      const { makePlayer, makeRoom, addBot, start, view } = await import(
        "@/lib/game"
      );
      const { insert, transaction } = await import("@/lib/store");
      const code = Array.from({ length: 6 }, () =>
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[randomInt(31)],
      ).join("");
      return NextResponse.json(
        transaction(() => {
          const player = makePlayer(name, 0);
          const room = makeRoom(code, player, body.practice === true);
          if (room.practice) {
            for (let i = 0; i < 3; i++) addBot(room);
            start(room);
          }
          insert(room);
          return { token: player.token, game: view(room, player) };
        }),
      );
    }
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = Array.from({ length: 6 }, () =>
        alphabet[randomInt(alphabet.length)],
      ).join("");
      try {
        const result = await convexClient().mutation(api.rooms.create, {
          code,
          name,
          practice: body.practice === true,
        });
        return NextResponse.json(result);
      } catch (error) {
        if (
          !(error instanceof Error) ||
          !error.message.includes("Room code already exists.")
        )
          throw error;
      }
    }
    throw new Error("Could not create a unique table code. Please try again.");
  } catch (error) {
    const missingConfig =
      error instanceof Error && error.message.includes("Convex is not configured");
    return NextResponse.json(
      {
        error: missingConfig
          ? "This app is not connected to Convex yet. Configure its deployment URL and try again."
          : "Could not create a table. Please try again.",
      },
      { status: missingConfig ? 503 : 400 },
    );
  }
}
