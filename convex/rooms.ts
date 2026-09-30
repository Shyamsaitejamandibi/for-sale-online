import { v } from "convex/values";
import { mutation, type MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import {
  act,
  addBot,
  makePlayer,
  makeRoom,
  start,
  tick,
  view,
  type Action,
  type Room,
} from "../src/lib/game";

function findRoom(ctx: MutationCtx, code: string): Promise<Doc<"rooms"> | null> {
  return ctx.db
    .query("rooms")
    .withIndex("by_code", (q) => q.eq("code", code))
    .first();
}

async function saveRoom(
  ctx: MutationCtx,
  document: Doc<"rooms">,
  room: Room,
) {
  room.updatedAt = Date.now();
  await ctx.db.patch(document._id, { state: room, updated: room.updatedAt });
}

export const create = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    practice: v.boolean(),
  },
  handler: async (ctx, { code, name, practice }) => {
    if (await findRoom(ctx, code)) throw new Error("Room code already exists.");
    const player = makePlayer(name, 0);
    const room = makeRoom(code, player, practice);
    if (practice) {
      for (let i = 0; i < 3; i++) addBot(room);
      start(room);
    }
    await ctx.db.insert("rooms", {
      code,
      state: room,
      updated: room.updatedAt,
    });
    return { token: player.token, game: view(room, player) };
  },
});

export const poll = mutation({
  args: { code: v.string(), token: v.string() },
  handler: async (ctx, { code, token }) => {
    const document = await findRoom(ctx, code);
    if (!document) throw new Error("Table not found. Check your room code.");
    const room = document.state as Room;
    const player = room.players.find((candidate) => candidate.token === token);
    if (!player) throw new Error("Please join this table first.");
    player.seen = Date.now();
    tick(room);
    await saveRoom(ctx, document, room);
    return { game: view(room, player) };
  },
});

export const joinOrAct = mutation({
  args: {
    code: v.string(),
    token: v.optional(v.string()),
    type: v.string(),
    name: v.optional(v.string()),
    action: v.optional(v.any()),
  },
  handler: async (ctx, { code, token, type, name, action }) => {
    const document = await findRoom(ctx, code);
    if (!document) throw new Error("Table not found. Check your room code.");
    const room = document.state as Room;

    if (type === "join") {
      if (room.phase !== "lobby")
        throw new Error(
          "This game has already started. Rejoin using your original browser.",
        );
      if (room.players.length >= 6) throw new Error("This table is full.");
      const color = [0, 1, 2, 3, 4, 5].find(
        (candidate) => !room.players.some((player) => player.color === candidate),
      )!;
      const player = makePlayer(name ?? "Guest", color);
      room.players.push(player);
      room.revision++;
      await saveRoom(ctx, document, room);
      return { token: player.token, game: view(room, player) };
    }

    const player = room.players.find((candidate) => candidate.token === token);
    if (!player) throw new Error("Your seat could not be verified.");
    act(room, player, action as Action);
    player.seen = Date.now();
    room.revision++;
    await saveRoom(ctx, document, room);
    return { game: view(room, player) };
  },
});
