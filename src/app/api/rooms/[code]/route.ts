import { NextResponse } from "next/server";
import { act, makePlayer, tick, view, type Action } from "@/lib/game";
import { read, save, transaction } from "@/lib/store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ code: string }> };
function errorResponse(error: unknown) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Something went wrong." },
    { status: 400 },
  );
}
export async function GET(request: Request, context: Context) {
  try {
    const { code } = await context.params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    return NextResponse.json(
      transaction(() => {
        const room = read(code.toUpperCase());
        const player = room.players.find((p) => p.token === token);
        if (!player) throw Error("Please join this table first.");
        player.seen = Date.now();
        tick(room);
        save(room);
        return { game: view(room, player) };
      }),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
export async function POST(request: Request, context: Context) {
  try {
    const { code } = await context.params;
    const body = await request.json();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    return NextResponse.json(
      transaction(() => {
        const room = read(code.toUpperCase());
        if (body.type === "join") {
          if (room.phase !== "lobby")
            throw Error(
              "This game has already started. Rejoin using your original browser.",
            );
          if (room.players.length >= 6) throw Error("This table is full.");
          const color = [0, 1, 2, 3, 4, 5].find(
            (c) => !room.players.some((p) => p.color === c),
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
        const player = room.players.find((p) => p.token === token);
        if (!player) throw Error("Your seat could not be verified.");
        act(room, player, body as Action);
        player.seen = Date.now();
        room.revision++;
        save(room);
        return { game: view(room, player) };
      }),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
