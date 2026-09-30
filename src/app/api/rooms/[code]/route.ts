import { NextResponse } from "next/server";
import { api, convexClient } from "@/lib/convex";
import type { Action } from "@/lib/game";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ code: string }> };

function errorResponse(error: unknown) {
  const missingConfig =
    error instanceof Error && error.message.includes("Convex is not configured");
  return NextResponse.json(
    {
      error: missingConfig
        ? "This app is not connected to Convex yet. Configure its deployment URL and try again."
        : error instanceof Error
          ? error.message
          : "Something went wrong.",
    },
    { status: missingConfig ? 503 : 400 },
  );
}

export async function GET(request: Request, context: Context) {
  try {
    const { code } = await context.params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Please join this table first.");
    if (process.env.E2E === "1") {
      const { tick, view } = await import("@/lib/game");
      const { read, save, transaction } = await import("@/lib/store");
      return NextResponse.json(
        transaction(() => {
          const room = read(code.toUpperCase());
          const player = room.players.find((candidate) => candidate.token === token);
          if (!player) throw new Error("Please join this table first.");
          player.seen = Date.now();
          tick(room);
          save(room);
          return { game: view(room, player) };
        }),
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const result = await convexClient().mutation(api.rooms.poll, {
      code: code.toUpperCase(),
      token,
    });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const { code } = await context.params;
    const body = await request.json();
    const type = typeof body.type === "string" ? body.type : "";
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (process.env.E2E === "1") {
      const { act, makePlayer, view } = await import("@/lib/game");
      const { read, save, transaction } = await import("@/lib/store");
      return NextResponse.json(
        transaction(() => {
          const room = read(code.toUpperCase());
          if (type === "join") {
            if (room.phase !== "lobby")
              throw new Error(
                "This game has already started. Rejoin using your original browser.",
              );
            if (room.players.length >= 6) throw new Error("This table is full.");
            const color = [0, 1, 2, 3, 4, 5].find(
              (candidate) => !room.players.some((player) => player.color === candidate),
            )!;
            const player = makePlayer(
              typeof body.name === "string" ? body.name : "Guest",
              color,
            );
            room.players.push(player);
            room.revision++;
            save(room);
            return { token: player.token, game: view(room, player) };
          }
          const player = room.players.find((candidate) => candidate.token === token);
          if (!player) throw new Error("Your seat could not be verified.");
          act(room, player, body as Action);
          player.seen = Date.now();
          room.revision++;
          save(room);
          return { game: view(room, player) };
        }),
      );
    }
    const result = await convexClient().mutation(api.rooms.joinOrAct, {
      code: code.toUpperCase(),
      token,
      type,
      name: typeof body.name === "string" ? body.name : undefined,
      action: type === "join" ? undefined : (body as Action),
    });
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
