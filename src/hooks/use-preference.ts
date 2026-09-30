"use client";
import { useCallback, useSyncExternalStore } from "react";

const event = "for-sale:preferences";
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(event, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(event, listener);
  };
}
// Keep preferences usable even when browser storage is unavailable.
const memory = new Map<string, boolean>();
export function usePreference(name: string, fallback: boolean) {
  const key = `for-sale:preference:${name}`;
  const read = useCallback(() => {
    if (memory.has(key)) return memory.get(key)!;
    try {
      const saved = localStorage.getItem(key);
      return saved === null ? fallback : saved === "true";
    } catch {
      return fallback;
    }
  }, [key, fallback]);
  const value = useSyncExternalStore(subscribe, read, () => fallback);
  const set = (next: boolean) => {
    try {
      localStorage.setItem(key, String(next));
      memory.delete(key);
    } catch {
      memory.set(key, next);
    }
    window.dispatchEvent(new Event(event));
  };
  return [value, set] as const;
}
