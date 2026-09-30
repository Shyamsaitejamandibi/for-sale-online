/* eslint-disable */
import type { GenericActionCtx, GenericMutationCtx, GenericQueryCtx } from "convex/server";
import type { DataModel } from "./dataModel.js";

export declare const query: import("convex/server").QueryBuilder<DataModel, "public">;
export declare const mutation: import("convex/server").MutationBuilder<DataModel, "public">;
export declare const action: import("convex/server").ActionBuilder<DataModel, "public">;
export type QueryCtx = GenericQueryCtx<DataModel>;
export type MutationCtx = GenericMutationCtx<DataModel>;
export type ActionCtx = GenericActionCtx<DataModel>;
