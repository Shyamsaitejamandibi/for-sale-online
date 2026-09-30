"use client";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Gavel,
  GraduationCap,
  House,
  Landmark,
  Lightbulb,
} from "lucide-react";
import type { View } from "@/lib/game";
import { turnPrompt } from "@/lib/game-presentation";
import { cn } from "@/lib/utils";
import styles from "./game-experience.module.css";

export function MoveShortcut({ game }: { game: View }) {
  const [visible, setVisible] = useState(true);
  const actionable =
    !game.pauseUntil &&
    (game.phase === "buying"
      ? game.players[game.turn]?.id === game.me
      : game.phase === "selling" && game.selected === null);
  useEffect(() => {
    const controls = document.getElementById("move-controls");
    if (!controls) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.intersectionRatio >= 0.8),
      { threshold: [0, 0.8, 1] },
    );
    observer.observe(controls);
    return () => observer.disconnect();
  }, [game.code, game.phase]);
  if (visible || !actionable) return null;
  return (
    <a
      className={styles.moveShortcut}
      href={game.phase === "selling" ? "#your-move" : "#move-controls"}
      aria-label="Jump to your controls"
    >
      {game.phase === "buying" ? <Gavel size={20} /> : <House size={20} />}
      <span>
        <strong>It’s your move</strong>
        <span>
          {game.phase === "buying"
            ? "Raise the bid or take a property"
            : "Choose a property from your hand"}
        </span>
      </span>
      <ArrowDown size={19} />
    </a>
  );
}

export function LearningEntry({ onLearn }: { onLearn: () => void }) {
  return (
    <button className={styles.learningEntry} onClick={onLearn}>
      <span className={styles.lessonIcon}>
        <GraduationCap size={21} />
      </span>
      <span>
        <strong>A first deal, without the guesswork.</strong>
        <span>Learn by doing · about 60 seconds</span>
      </span>
      <span className={styles.lessonAction}>
        Show me how <ArrowRight size={16} />
      </span>
    </button>
  );
}

export function RoundGuide({
  game,
  tips,
  onToggleTips,
}: {
  game: View;
  tips: boolean;
  onToggleTips: () => void;
}) {
  const buying = game.phase === "buying";
  const actionable =
    !game.pauseUntil &&
    (buying ? game.players[game.turn]?.id === game.me : game.selected === null);
  return (
    <section className={styles.roundGuide} aria-label="Game progress">
      <div className={styles.progressHeading}>
        <div className={styles.phaseSteps}>
          <span className={cn(styles.phaseStep, buying && styles.currentPhase)}>
            {buying ? <House size={15} /> : <Check size={15} />}
            <span>
              01 <b>Buy</b>
            </span>
          </span>
          <ArrowRight size={13} />
          <span
            className={cn(styles.phaseStep, !buying && styles.currentPhase)}
          >
            <Landmark size={15} />
            <span>
              02 <b>Sell</b>
            </span>
          </span>
        </div>
        <div className={styles.roundMeter}>
          <span>
            {buying ? "Auction" : "Sale"}{" "}
            <strong>
              {game.round} <span>/ {game.rounds}</span>
            </strong>
          </span>
          <div
            className={styles.roundSegments}
            role="progressbar"
            aria-label={`${buying ? "Buying" : "Selling"} rounds`}
            aria-valuemin={0}
            aria-valuemax={game.rounds}
            aria-valuenow={game.round - (game.pauseUntil ? 0 : 1)}
          >
            {Array.from({ length: game.rounds }, (_, i) => (
              <i
                key={i}
                className={cn(
                  i < game.round - 1 && styles.completedRound,
                  i === game.round - 1 && styles.currentRound,
                )}
              />
            ))}
          </div>
        </div>
        <button
          className={cn(styles.tipsToggle, tips && styles.tipsActive)}
          onClick={onToggleTips}
          aria-label="Table tips"
          aria-pressed={tips}
        >
          <Lightbulb size={15} />
          <span>Table tips</span>
        </button>
      </div>
      <div
        className={cn(styles.turnPrompt, actionable && styles.yourMove)}
        role="status"
      >
        {buying ? <Gavel size={17} /> : <Landmark size={17} />}
        <strong>{turnPrompt(game)}</strong>
        {actionable && (
          <a href="#your-move" className={styles.jumpToMove}>
            Your controls <ArrowDown size={14} />
          </a>
        )}
      </div>
    </section>
  );
}
