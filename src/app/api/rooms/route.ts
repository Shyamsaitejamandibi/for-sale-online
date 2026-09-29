import { NextResponse } from "next/server";
import { makePlayer, makeRoom, addBot, start, view } from "@/lib/game";
import { insert, transaction } from "@/lib/store";
import { randomInt } from "node:crypto";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name : "You";
    const result = transaction(() => {
      const code = Array.from(
        { length: 6 },
        () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[randomInt(31)],
      ).join("");
      const p = makePlayer(name, 0);
      const room = makeRoom(code, p, body.practice === true);
      if (room.practice) {
        for (let i = 0; i < 3; i++) addBot(room);
        start(room);
      }
      insert(room);
      return { token: p.token, game: view(room, p) };
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Could not create a table. Please try again." },
      { status: 400 },
    );
  }
}
