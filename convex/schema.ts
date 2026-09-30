import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    code: v.string(),
    state: v.any(),
    updated: v.number(),
  }).index("by_code", ["code"]),
});
