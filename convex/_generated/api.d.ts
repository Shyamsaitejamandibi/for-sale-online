/* eslint-disable */
import type * as rooms from "../rooms.js";
import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";

declare const fullApi: ApiFromModules<{ rooms: typeof rooms }>;
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
