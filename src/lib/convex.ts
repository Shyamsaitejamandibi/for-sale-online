import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const deploymentUrl = () =>
  process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;

export function convexClient() {
  const url = deploymentUrl();
  if (!url) {
    throw new Error(
      "Convex is not configured. Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL.",
    );
  }
  return new ConvexHttpClient(url);
}

export { api };
