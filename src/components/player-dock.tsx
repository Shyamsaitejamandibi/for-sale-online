"use client";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Check,
  Coins,
  Eye,
  EyeOff,
  Gavel,
  House,
  Lightbulb,
  Loader2,
  LockKeyhole,
  Minus,
  Plus,
} from "lucide-react";
import type { Action, View } from "@/lib/game";
import { buyingDecision, money, turnPrompt } from "@/lib/game-presentation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { PropertyCard, propertyNames } from "./game-art";
import styles from "./game-experience.module.css";

export function PlayerDock({
  game,
  busy,
  offline,
  tips,
  action,
}: {
  game: View;
  busy: boolean;
  offline: boolean;
  tips: boolean;
  action: (action: Action) => Promise<boolean | undefined>;
}) {
  const [handOpen, setHandOpen] = useState(true);
  const [descending, setDescending] = useState(false);
  const [proposal, setProposal] = useState({ round: "", amount: 1 });
  const [selection, setSelection] = useState<{
    round: string;
    card: number;
  } | null>(null);
  const roundKey = `${game.code}-${game.phase}-${game.round}`;
  const chosen =
    selection?.round === roundKey && game.hand.includes(selection.card)
      ? selection.card
      : null;
  const decision = buyingDecision(
    game,
    proposal.round === roundKey ? proposal.amount : 1,
  );
  const myTurn =
    game.phase === "buying" &&
    game.players[game.turn]?.id === game.me &&
    !game.pauseUntil;
  const canBid = myTurn && decision.canAfford;
  const player = game.players.find((p) => p.id === game.me);
  const buying = game.phase === "buying";
  const hand = [...game.hand].sort((a, b) => (descending ? b - a : a - b));
  const locked = game.selected !== null;
  const displayedCard = game.selected ?? chosen;
  const ownReveal = game.reveal.find((r) => r.id === game.me);
  const setBid = (amount: number) => setProposal({ round: roundKey, amount });
  const cardPosition =
    displayedCard === Math.max(...game.hand)
      ? "Your strongest remaining property"
      : displayedCard === Math.min(...game.hand)
        ? "Your lowest remaining property"
        : "A middle property in your hand";
  return (
    <section
      className={cn("player-dock", styles.dock, myTurn && styles.activeDock)}
      id="your-move"
      aria-label="Your hand and controls"
      tabIndex={-1}
    >
      <div className="hand-panel">
        <div className="hand-heading">
          <h2>
            Your little empire <span>{game.hand.length}</span>
          </h2>
          <div className={styles.handTools}>
            {game.hand.length > 1 && handOpen && (
              <button
                onClick={() => setDescending(!descending)}
                aria-label={
                  descending
                    ? "Sort properties lowest first"
                    : "Sort properties highest first"
                }
                title={descending ? "Highest first" : "Lowest first"}
              >
                {descending ? (
                  <ArrowDownWideNarrow size={16} />
                ) : (
                  <ArrowUpWideNarrow size={16} />
                )}
              </button>
            )}
            <button
              onClick={() => setHandOpen(!handOpen)}
              aria-expanded={handOpen}
            >
              {handOpen ? <EyeOff size={14} /> : <Eye size={14} />}
              {handOpen ? "Only you can see" : "Show hand"}
            </button>
          </div>
        </div>
        {handOpen ? (
          <div className="hand-cards">
            {hand.length ? (
              hand.map((value) => (
                <PropertyCard
                  key={value}
                  value={value}
                  compact
                  selected={displayedCard === value}
                  onClick={
                    !buying
                      ? () => setSelection({ round: roundKey, card: value })
                      : undefined
                  }
                  disabled={busy || offline || !!game.pauseUntil || locked}
                />
              ))
            ) : (
              <div className="empty-hand">
                <div className="empty-card">
                  <House size={22} />
                </div>
                <div>
                  <strong>Every empire starts somewhere.</strong>
                  <span>Your first property is just a bid away.</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden-hand">
            <LockKeyhole size={20} />
            Your {game.hand.length} properties are tucked away.
          </div>
        )}
        <div className={styles.portfolio} aria-label="Your private portfolio">
          <div>
            <span>{buying ? "Properties collected" : "Checks earned"}</span>
            <strong>
              {buying
                ? `${game.hand.length} / ${game.rounds}`
                : money(game.earnings)}
            </strong>
          </div>
          <div>
            <span>
              {buying ? "Auctions after this" : "Checks + saved cash"}
            </span>
            <strong>
              {buying
                ? Math.max(0, decision.roundsLeft - 1)
                : money(game.earnings + game.coins)}
            </strong>
          </div>
          <LockKeyhole size={13} aria-label="Private to you" />
        </div>
      </div>
      <div className="action-panel">
        <div className="wallet">
          <span>
            <Coins size={17} />
            {buying ? "Your buying power" : "Your saved cash"}
          </span>
          <strong>{money(game.coins)}</strong>
        </div>
        <div className="action-title">
          <span className={cn("live-dot", !myTurn && "waiting-dot")} />
          <strong>{turnPrompt(game)}</strong>
        </div>
        {buying ? (
          <>
            <div className="bid-controls" id="move-controls">
              <div className="bid-stepper">
                <button
                  aria-label="Decrease bid"
                  disabled={
                    !canBid ||
                    decision.bid <= decision.minimum ||
                    busy ||
                    offline
                  }
                  onClick={() => setBid(decision.bid - 1)}
                >
                  <Minus size={17} />
                </button>
                <span>{money(decision.bid)}</span>
                <button
                  aria-label="Increase bid"
                  disabled={
                    !canBid || decision.bid >= game.coins || busy || offline
                  }
                  onClick={() => setBid(decision.bid + 1)}
                >
                  <Plus size={17} />
                </button>
              </div>
              <Button
                className="primary-button bid-button"
                disabled={!canBid || busy || offline}
                onClick={() => action({ type: "bid", amount: decision.bid })}
              >
                {busy ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Gavel size={16} />
                )}
                Place bid
              </Button>
              <Button
                variant="outline"
                className="pass-button"
                disabled={!myTurn || busy || offline}
                onClick={() => action({ type: "pass" })}
              >
                Pass
                <ArrowDownLeft size={16} />
              </Button>
            </div>
            {myTurn && (
              <>
                {canBid && (
                  <div
                    className={styles.bidPresets}
                    aria-label="Quick bid amounts"
                  >
                    <span>Quick raise</span>
                    {[0, 2, 4]
                      .filter(
                        (offset) => decision.minimum + offset <= game.coins,
                      )
                      .map((offset) => (
                        <button
                          key={offset}
                          onClick={() => setBid(decision.minimum + offset)}
                          aria-pressed={
                            decision.bid === decision.minimum + offset
                          }
                          disabled={busy || offline}
                        >
                          {money(decision.minimum + offset)}
                        </button>
                      ))}
                  </div>
                )}
                <div
                  className={styles.decisionPreview}
                  aria-label="Move preview"
                >
                  <div>
                    <span>
                      <Gavel size={13} />
                      If you win
                    </span>
                    <strong>
                      {decision.canAfford
                        ? `Pay ${money(decision.bid)}`
                        : "Next bid exceeds cash"}
                    </strong>
                    <small>
                      {decision.cashAfterWin !== null
                        ? `${money(decision.cashAfterWin)} left · highest property`
                        : `You need ${money(decision.minimum)} to raise`}
                    </small>
                  </div>
                  <div>
                    <span>
                      <ArrowDownLeft size={13} />
                      If you pass
                    </span>
                    <strong>
                      Pay {money(decision.passCost)} · take #{decision.lowest}
                    </strong>
                    <small>
                      {money(decision.cashAfterPass)} left ·{" "}
                      {propertyNames[(decision.lowest ?? 1) - 1]}
                    </small>
                  </div>
                </div>
              </>
            )}
            {!myTurn && (
              <p className="action-hint">
                {player?.passed
                  ? "Your new property is in your private hand. You’re back in next auction."
                  : "Watch the bids. Your controls light up when it’s your turn."}
              </p>
            )}
            {myTurn && !canBid && (
              <p className="action-hint">
                Your cash is below the next bid. Pass to collect the lowest
                property.
              </p>
            )}
          </>
        ) : (
          <>
            {ownReveal ? (
              <div className={styles.saleResult} role="status">
                <Check size={22} />
                <div>
                  <span>Your deal this round</span>
                  <strong>
                    Property #{ownReveal.card} earned {money(ownReveal.check)}
                  </strong>
                </div>
              </div>
            ) : displayedCard !== null && !handOpen ? (
              <div className={styles.salePlaceholder}>
                <LockKeyhole size={19} />
                <span>
                  Your choice is tucked away.
                  <br />
                  <strong>Show your hand to see it again.</strong>
                </span>
              </div>
            ) : displayedCard !== null ? (
              <div className={styles.salePreview} aria-live="polite">
                <span className={styles.selectedNumber}>
                  {String(displayedCard).padStart(2, "0")}
                </span>
                <div>
                  <strong>{propertyNames[displayedCard - 1]}</strong>
                  <span>
                    {locked
                      ? "Locked in. Only you know your choice."
                      : cardPosition}
                  </span>
                </div>
                {locked && <LockKeyhole size={17} />}
              </div>
            ) : (
              <div className={styles.salePlaceholder}>
                <House size={19} />
                <span>
                  Tap a property in your hand.
                  <br />
                  <strong>Highest property → highest check.</strong>
                </span>
              </div>
            )}
            <Button
              className="primary-button sell-button"
              id="move-controls"
              disabled={
                chosen === null ||
                busy ||
                locked ||
                !!game.pauseUntil ||
                offline
              }
              onClick={() => action({ type: "sell", card: chosen! })}
            >
              {busy ? (
                <Loader2 className="animate-spin" />
              ) : locked ? (
                <Check />
              ) : (
                <LockKeyhole />
              )}
              {locked
                ? "Property locked in"
                : chosen !== null
                  ? handOpen
                    ? `Lock in property ${chosen}`
                    : "Lock in selected property"
                  : "Select a card from your hand"}
            </Button>
            <div className={styles.readiness} aria-label="Selling readiness">
              {game.players.map((p) => (
                <span
                  key={p.id}
                  className={cn(p.locked && styles.readyPlayer)}
                  title={`${p.name}: ${p.locked ? "locked in" : "choosing"}`}
                >
                  <i>{p.locked ? <Check size={10} /> : null}</i>
                  {p.id === game.me ? "You" : p.name}
                </span>
              ))}
            </div>
            <p className="action-hint">
              {game.players.filter((p) => p.locked).length} /{" "}
              {game.players.length} locked in · Revealed together, never early.
            </p>
          </>
        )}
        {tips && (
          <div className={styles.tableTip}>
            <Lightbulb size={17} />
            <p>
              {buying ? (
                myTurn ? (
                  <>
                    Passing costs half your <strong>last placed bid</strong>,
                    rounded up. Winning costs your full bid. Cash you save still
                    scores at the end.
                  </>
                ) : (
                  <>
                    A bigger gap between the lowest and highest property makes
                    this auction more interesting. Every player gets one
                    property.
                  </>
                )
              ) : (
                <>
                  Checks this round:{" "}
                  <strong>
                    {money(game.market[0] ?? 0)}–
                    {money(game.market.at(-1) ?? 0)}
                  </strong>
                  . Your payout depends on everyone’s cards, not just yours.
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
