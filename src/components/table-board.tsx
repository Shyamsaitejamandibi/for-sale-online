"use client";
import {
  ArrowDownLeft,
  ArrowRight,
  Check,
  Gavel,
  House,
  Landmark,
  Leaf,
  Loader2,
  LockKeyhole,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, palette, PropertyCard } from "./game-art";
import type { PublicPlayer, View } from "@/lib/game";
import { cn } from "@/lib/utils";
const money = (n: number) => `$${(n * 1000).toLocaleString("en-US")}`;
const demoPlayers = [
  { id: "demo0", name: "You", color: 0, bot: false, bid: 0 },
  { id: "demo1", name: "Cleo", color: 1, bot: true, bid: 2 },
  { id: "demo2", name: "Oliver", color: 2, bot: true, bid: 3 },
  { id: "demo3", name: "Jun", color: 3, bot: true, bid: 0 },
] as PublicPlayer[];
function PlayerSeat({
  player,
  position,
  me,
  active,
  phase,
  pause,
  now,
}: {
  player: PublicPlayer;
  position: number;
  me: boolean;
  active: boolean;
  phase: string;
  pause: boolean;
  now: number;
}) {
  const reaction = player.reaction && now - player.reactionAt < 4500;
  const away = !player.bot && now - player.seen > 12000;
  return (
    <div
      className={cn(
        "player-seat",
        `seat-${position}`,
        me && "my-seat",
        active && "active-seat",
        player.passed && "passed-seat",
      )}
    >
      <div className="seat-bubble">
        {reaction ? (
          <span className="emoji-bubble">{player.reaction}</span>
        ) : phase === "lobby" ? (
          <span className="bid-bubble ready-bubble">
            <Check size={12} />
            Seated
          </span>
        ) : phase === "selling" && pause ? null : phase === "selling" ? (
          <span className="bid-bubble">
            {player.locked ? (
              <>
                <LockKeyhole size={12} />
                Locked in
              </>
            ) : (
              <>
                Thinking<span className="thinking-dots">…</span>
              </>
            )}
          </span>
        ) : player.passed ? (
          <span className="bid-bubble passed-bubble">Passed</span>
        ) : player.bid > 0 ? (
          <span className="bid-bubble">
            <span className="tiny-coin">$</span>
            {money(player.bid)}
          </span>
        ) : active && !pause ? (
          <span className="bid-bubble turn-bubble">
            {me ? "Your turn" : "Thinking…"}
          </span>
        ) : null}
      </div>
      <div className="avatar-wrap">
        <Avatar color={player.color} />
        {active && !pause && <span className="turn-ring" />}
      </div>
      <div className="seat-name">
        <i style={{ background: palette[player.color] }} />
        {player.name}
        {me && <span>you</span>}
        {player.bot && <span>bot</span>}
      </div>
      {away && !me && <span className="away-label">Reconnecting…</span>}
      {!me && player.count > 0 && (
        <div className="mini-hand" aria-label={`${player.count} private cards`}>
          {Array.from({ length: Math.min(player.count, 5) }, (_, i) => (
            <i key={i} style={{ rotate: `${(i - 2) * 8}deg` }} />
          ))}{" "}
        </div>
      )}
    </div>
  );
}
function CheckCard({ value }: { value: number }) {
  return (
    <div className="check-card">
      <div>THE NEIGHBORHOOD BANK</div>
      <Landmark />
      <strong>{money(value)}</strong>
      <span>
        {value ? "Pay to the cleverest bidder" : "Better luck next time"}
      </span>
      <div className="check-signature">For Sale & co.</div>
    </div>
  );
}
export function GameBoard({
  game,
  onStart,
  busy,
}: {
  game: View | null;
  onStart: () => void;
  busy: boolean;
}) {
  const players = game?.players ?? demoPlayers;
  const me = game?.me ?? "demo0";
  const own = players.find((p) => p.id === me)!;
  const ownIndex = players.findIndex((p) => p.id === me);
  const ordered = [
    ...players.slice(ownIndex + 1),
    ...players.slice(0, ownIndex),
  ];
  const seats =
    ordered.length === 2
      ? [1, 3]
      : ordered.length === 3
        ? [1, 2, 3]
        : ordered.length === 4
          ? [1, 2, 3, 4]
          : [1, 2, 3, 4, 5];
  const market = game?.market ?? [4, 12, 19, 27];
  const lobby = game?.phase === "lobby";
  return (
    <div
      className={cn(
        "board-stage",
        players.length > 4 && "large-party",
        !game && "preview-board",
      )}
    >
      <div className="ambient ambient-one">
        <Leaf />
      </div>
      <div className="ambient ambient-two">✦</div>
      <div className="coffee">
        <div />
      </div>
      <div className="table-shadow" />
      <div className="wood-table">
        <div className="felt-table">
          <div className="table-stitch" />
          <div className="table-brand">
            FOR SALE<span>THE NEIGHBORHOOD IS YOURS</span>
          </div>
          <div className="market-area">
            {lobby ? (
              <div className="lobby-center">
                <div className="lobby-icon">
                  <Users size={28} />
                </div>
                <h2>The best seat is with friends.</h2>
                <p>{players.length} of 6 seats filled · 3 players to start</p>
                <span>Invite your people. We’ll keep the table warm.</span>
              </div>
            ) : game?.phase === "finished" ? (
              <div className="lobby-center">
                <Trophy size={44} />
                <h2>Well played, everyone.</h2>
                <p>A few good deals. A great time together.</p>
              </div>
            ) : (
              <>
                <div className="market-label">
                  {game?.pauseUntil
                    ? game.phase === "selling"
                      ? "THE BIG REVEAL"
                      : "DEAL CLOSED"
                    : game?.phase === "selling"
                      ? "ON THE MARKET · CHECKS"
                      : "ON THE MARKET · PROPERTIES"}
                </div>
                <div
                  className={cn(
                    "market-cards",
                    market.length > 4 && "many-cards",
                  )}
                  key={`${game?.phase}-${game?.round}`}
                >
                  {game?.pauseUntil && game.phase === "buying" ? (
                    <div className="round-interlude">
                      <Check size={34} />
                      <strong>Another neighborhood, sold.</strong>
                      <span>The next properties are on their way…</span>
                    </div>
                  ) : game?.reveal.length ? (
                    game.reveal.map((r) => (
                      <div className="reveal-card" key={r.id}>
                        <strong>
                          {players.find((p) => p.id === r.id)?.name}
                        </strong>
                        <span className="reveal-property">{r.card}</span>
                        <ArrowDownLeft size={16} />
                        <span>{money(r.check)}</span>
                      </div>
                    ))
                  ) : (
                    market.map((value, i) =>
                      game?.phase === "selling" ? (
                        <CheckCard key={`${value}-${i}`} value={value} />
                      ) : (
                        <div
                          className="market-card-wrap"
                          style={{ animationDelay: `${i * 65}ms` }}
                          key={value}
                        >
                          <PropertyCard value={value} />
                        </div>
                      ),
                    )
                  )}
                </div>
                <div className="market-caption">
                  {game?.phase === "selling" ? (
                    "One secret choice. Everyone reveals together."
                  ) : (
                    <>
                      Low property <span className="caption-line" />
                      <span>High property</span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="table-footer">
            <span>EST. 1997</span>
            <span>GOOD COMPANY. GREAT DEALS.</span>
          </div>
        </div>
      </div>
      {ordered.map((p, i) => (
        <PlayerSeat
          key={p.id}
          player={p}
          position={seats[i]}
          me={false}
          active={
            !!game && game.phase === "buying" && players[game.turn]?.id === p.id
          }
          phase={game?.phase ?? "buying"}
          pause={!!game?.pauseUntil}
          now={game?.updatedAt ?? 0}
        />
      ))}
      <PlayerSeat
        player={own}
        position={0}
        me
        active={
          !!game && game.phase === "buying" && players[game.turn]?.id === me
        }
        phase={game?.phase ?? "buying"}
        pause={!!game?.pauseUntil}
        now={game?.updatedAt ?? 0}
      />
      <div className="deck-prop">
        <div />
        <div />
        <div>
          <House size={23} />
          <span>FOR SALE</span>
        </div>
      </div>
      {!game && (
        <div className="preview-cta">
          <Button className="primary-button" disabled={busy} onClick={onStart}>
            {busy ? <Loader2 className="animate-spin" /> : <Gavel size={17} />}
            Play a practice round
            <ArrowRight size={16} />
          </Button>
          <span>Your first deal is on the house. Learn as you play.</span>
        </div>
      )}
    </div>
  );
}
