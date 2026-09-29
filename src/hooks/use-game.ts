"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Action, View } from "@/lib/game";
type Session = { code: string; token: string };
export function useGame() {
  const [game, setGame] = useState<View | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [loaded, setLoaded] = useState(false);
  const pending = useRef(false);
  const current = useRef<Session | null>(null);
  const accept = useCallback(
    (next: View) =>
      setGame((old) =>
        !old || old.code !== next.code || next.revision >= old.revision
          ? next
          : old,
      ),
    [],
  );
  useEffect(() => {
    const requested = new URLSearchParams(location.search)
      .get("room")
      ?.toUpperCase();
    try {
      const saved = JSON.parse(
        localStorage.getItem(
          requested ? `for-sale:${requested}` : "for-sale:active",
        ) || "null",
      ) as Session | null;
      if (saved?.token && saved?.code) {
        current.current = saved;
        setSession(saved);
      } else if (requested) setJoinCode(requested);
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      if (!pending.current) {
        try {
          const res = await fetch(`/api/rooms/${session!.code}`, {
            headers: { Authorization: `Bearer ${session!.token}` },
            cache: "no-store",
          });
          const data = await res.json();
          if (!res.ok) throw Error(data.error);
          if (!cancelled && current.current?.code === session!.code) {
            accept(data.game);
            setOffline(false);
          }
        } catch {
          if (!cancelled) setOffline(true);
        }
      }
      if (!cancelled) timer = setTimeout(poll, 750);
    }
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [session, accept]);
  function saveSession(next: Session) {
    current.current = next;
    localStorage.setItem("for-sale:active", JSON.stringify(next));
    localStorage.setItem(`for-sale:${next.code}`, JSON.stringify(next));
    setSession(next);
    history.replaceState(null, "", `?room=${next.code}`);
  }
  async function enter(name: string, practice: boolean, code?: string) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        code ? `/api/rooms/${code.toUpperCase()}` : "/api/rooms",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            code ? { type: "join", name } : { name, practice },
          ),
        },
      );
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      saveSession({ code: data.game.code, token: data.token });
      setGame(data.game);
      setJoinCode("");
      setOffline(false);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect.");
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  async function action(action: Action) {
    if (!session || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/rooms/${session.code}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          ...action,
          ...(["bid", "pass", "sell"].includes(action.type)
            ? { revision: game?.revision }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      accept(data.game);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Move failed. Try again.");
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  function leave() {
    current.current = null;
    setSession(null);
    setGame(null);
    setOffline(false);
    setError("");
    localStorage.removeItem("for-sale:active");
    history.replaceState(null, "", "/");
  }
  return {
    game,
    busy,
    error,
    offline,
    joinCode,
    loaded,
    enter,
    action,
    leave,
    setError,
    dismissJoin: () => setJoinCode(""),
  };
}
