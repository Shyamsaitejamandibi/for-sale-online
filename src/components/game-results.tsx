"use client";
import { ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "./game-art";
import type { View } from "@/lib/game";
const money = (n: number) => `$${(n * 1000).toLocaleString("en-US")}`;
export function Results({
  game,
  onRestart,
  busy,
}: {
  game: View;
  onRestart: () => void;
  busy: boolean;
}) {
  const ranked = [...game.players].sort(
    (a, b) =>
      (b.score ?? 0) - (a.score ?? 0) || (b.coins ?? 0) - (a.coins ?? 0),
  );
  return (
    <div className="results">
      <div className="result-heading">
        <Trophy />
        <div>
          <span>THE NEIGHBORHOOD’S FINEST</span>
          <h2>
            {ranked
              .filter(
                (p) =>
                  p.score === ranked[0].score && p.coins === ranked[0].coins,
              )
              .map((p) => p.name)
              .join(" & ")}{" "}
            takes the crown.
          </h2>
        </div>
      </div>
      <div className="result-list">
        {ranked.map((p, i) => (
          <div key={p.id}>
            <span>{i + 1}</span>
            <Avatar color={p.color} small />
            <strong>{p.name}</strong>
            <span>
              {money(p.earnings ?? 0)} + {money(p.coins ?? 0)} cash
            </span>
            <b>{money(p.score ?? 0)}</b>
          </div>
        ))}
      </div>
      {game.me === game.host && (
        <Button className="primary-button" disabled={busy} onClick={onRestart}>
          One more game?
          <ArrowRight />
        </Button>
      )}
    </div>
  );
}
