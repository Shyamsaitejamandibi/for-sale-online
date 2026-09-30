"use client";
import { useEffect, useRef } from "react";
import type { View } from "@/lib/game";

// Short, synthesized cues need no asset downloads. Playback only starts after
// a user gesture and every cue has a corresponding on-screen status.
export function useGameAudio(game: View | null, enabled: boolean) {
  const context = useRef<AudioContext | null>(null);
  const previous = useRef("");
  useEffect(() => {
    if (!enabled) return;
    const unlock = () => {
      try {
        context.current ??= new AudioContext();
        void context.current.resume().catch(() => {});
      } catch {
        // The game remains fully usable without Web Audio.
      }
    };
    document.addEventListener("pointerdown", unlock);
    document.addEventListener("keydown", unlock);
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, [enabled]);
  useEffect(
    () => () => {
      void context.current?.close().catch(() => {});
    },
    [],
  );
  let cue = "";
  let notes = [660, 880];
  if (game) {
    if (game.phase === "finished") {
      cue = `${game.code}-finished`;
      notes = [523, 659, 784];
    } else if (game.phase === "selling" && game.pauseUntil) {
      cue = `${game.code}-reveal-${game.round}`;
      notes = [587, 784];
    } else if (game.phase === "selling" && game.selected === null) {
      cue = `${game.code}-sell-${game.round}`;
    } else if (
      game.phase === "buying" &&
      !game.pauseUntil &&
      game.players[game.turn]?.id === game.me
    ) {
      cue = `${game.code}-buy-${game.round}-${game.highBid}`;
    }
  }
  const frequencies = notes.join(",");
  useEffect(() => {
    const ctx = context.current;
    if (
      cue &&
      cue !== previous.current &&
      enabled &&
      ctx?.state === "running"
    ) {
      frequencies
        .split(",")
        .map(Number)
        .forEach((frequency, i) => {
          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();
          const at = ctx.currentTime + i * 0.09;
          oscillator.type = "sine";
          oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0, at);
          gain.gain.linearRampToValueAtTime(0.045, at + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, at + 0.2);
          oscillator.connect(gain);
          gain.connect(ctx.destination);
          oscillator.start(at);
          oscillator.stop(at + 0.22);
          oscillator.onended = () => {
            oscillator.disconnect();
            gain.disconnect();
          };
        });
    }
    previous.current = cue;
  }, [cue, enabled, frequencies]);
  return () => {
    if (!enabled) {
      try {
        context.current ??= new AudioContext();
        void context.current.resume().catch(() => {});
      } catch {}
    }
  };
}
