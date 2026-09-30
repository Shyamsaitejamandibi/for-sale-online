"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  DoorOpen,
  EyeOff,
  Flag,
  HelpCircle,
  House,
  Landmark,
  Link2,
  LockKeyhole,
  Plus,
  Smile,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
  WifiOff,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HouseArt } from "./game-art";
import { PlayerDock } from "./player-dock";
import { LearningEntry, MoveShortcut, RoundGuide } from "./game-experience";
import { usePreference } from "@/hooks/use-preference";
import { useGameAudio } from "@/hooks/use-game-audio";
import { GameDialogs, type Modal } from "./game-dialogs";
import { useGame } from "@/hooks/use-game";
import { GameBoard } from "./table-board";
import { Results } from "./game-results";
import { cn } from "@/lib/utils";
export default function GameTable() {
  const {
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
    dismissJoin,
  } = useGame();
  const [modal, setModal] = useState<Modal>(null);
  const [sound, setSound] = usePreference("sound", false);
  const [tips, setTips] = usePreference("table-tips", true);
  const [reactions, setReactions] = useState(false);
  const unlockAudio = useGameAudio(game, sound);
  function toggleSound() {
    unlockAudio();
    setSound(!sound);
  }
  const phase = game?.phase ?? "buying";
  const lobby = phase === "lobby";
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link
          href="/"
          className="brand"
          onClick={(e) => {
            if (game) {
              e.preventDefault();
              setModal("leave");
            }
          }}
        >
          <div className="brand-icon">
            <House strokeWidth={2.3} />
          </div>
          <div>
            for sale<span>A LITTLE FRIENDLY COMPETITION</span>
          </div>
          <span className="brand-spark">✦</span>
        </Link>
        <div className="sidebar-divider" />
        <div className="sidebar-label">YOUR GAME NIGHT</div>
        <nav>
          <button
            className="nav-item active"
            onClick={() =>
              document
                .getElementById("table")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <div>
              <House size={18} />
              The table
            </div>
            <span className="nav-dot" />
          </button>
          <button className="nav-item" onClick={() => setModal("rules")}>
            <div>
              <HelpCircle size={18} />
              How to play
            </div>
            <ArrowUpRight size={15} />
          </button>
        </nav>
        <div className="room-card">
          <div className="room-card-top">
            <span className="live-dot" />
            {game
              ? game.practice
                ? "PRACTICE TABLE"
                : "PRIVATE TABLE"
              : "ALWAYS ROOM FOR ONE MORE"}
          </div>
          <h3>
            {game
              ? game.practice
                ? "The practice club"
                : "The good company club"
              : "Your table. Your people."}
          </h3>
          <p>
            {game
              ? game.practice
                ? "A friendly table to find your feet."
                : "Same table. Wherever you are."
              : "A game night, without the logistics."}
          </p>
          {game && !game.practice ? (
            <button className="room-code" onClick={() => setModal("invite")}>
              {game.code}
              <Link2 size={15} />
            </button>
          ) : (
            <button className="text-button" onClick={() => setModal("create")}>
              Bring your friends
              <ArrowRight size={15} />
            </button>
          )}
        </div>
        <div className="journey">
          <div className="sidebar-label">TWO ACTS. ONE BIG WIN.</div>
          <div
            className={cn(
              "journey-step",
              (phase === "buying" || lobby) && "current",
            )}
          >
            <div className="step-icon">
              <House size={17} />
            </div>
            <div>
              <strong>Buy a little possibility</strong>
              <span>Outbid. Bluff. Build your hand.</span>
            </div>
            {phase === "selling" && <Check size={14} />}
          </div>
          <div className={cn("journey-step", phase === "selling" && "current")}>
            <div className="step-icon">
              <Landmark size={17} />
            </div>
            <div>
              <strong>Sell it for a little more</strong>
              <span>Pick a card. Make your fortune.</span>
            </div>
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="company-illustration">
            <HouseArt value={10} />
          </div>
          <h3>Better around a table.</h3>
          <p>
            A few clever bids.
            <br />A lot of “I knew you’d do that.”
          </p>
          <div className="sidebar-tools">
            <button
              onClick={toggleSound}
              aria-label={sound ? "Mute game sounds" : "Enable game sounds"}
            >
              {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}Sound{" "}
              {sound ? "on" : "off"}
            </button>
            <button aria-label="Game rules" onClick={() => setModal("rules")}>
              <HelpCircle size={17} />
            </button>
          </div>
          <span className="credit">
            A game by Stefan Dorra · Fan-made edition
          </span>
        </div>
      </aside>
      <main className="main-content" id="table">
        <header className="topbar">
          <div className="breadcrumb">
            <span>The living room</span>
            <ChevronRight size={14} />
            <strong>{game ? "Your table" : "Welcome in"}</strong>
          </div>
          <div className="topbar-actions">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-sound"
              aria-label={sound ? "Mute game sounds" : "Enable game sounds"}
              onClick={toggleSound}
            >
              {sound ? <Volume2 /> : <VolumeX />}
            </Button>
            {game ? (
              <>
                <span className="connection">
                  <i className={offline ? "offline-dot" : ""} />
                  {offline ? "Reconnecting" : "At the table"}
                </span>
                {!game.practice && (
                  <Button
                    variant="outline"
                    className="invite-button"
                    onClick={() => setModal("invite")}
                  >
                    <Link2 />
                    Invite friends
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Leave table"
                  onClick={() => setModal("leave")}
                >
                  <DoorOpen />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="join-button"
                  onClick={() => setModal("join")}
                >
                  Join a table
                </Button>
                <Button
                  className="create-button"
                  onClick={() => setModal("create")}
                >
                  <Plus size={16} />
                  Create a table
                </Button>
              </>
            )}
          </div>
        </header>
        <div className="game-content">
          <section className="game-heading">
            <div>
              <div className="eyebrow">
                <span />
                {!game
                  ? "THE MOST VALUABLE THING HERE? GOOD COMPANY."
                  : lobby
                    ? "PULL UP A CHAIR"
                    : phase === "finished"
                      ? "THAT WAS A GOOD GAME"
                      : phase === "buying"
                        ? "PHASE 01 · THE BUYING BUSINESS"
                        : "PHASE 02 · THE ART OF THE DEAL"}
              </div>
              <h1>
                {!game
                  ? "A little bluff. A lot of possibility."
                  : lobby
                    ? "The gang’s almost all here."
                    : phase === "finished"
                      ? "Good deals. Better company."
                      : phase === "buying"
                        ? "Going once, going twice…"
                        : "Time to play your hand."}
              </h1>
              <p>
                {!game
                  ? "Buy charming properties. Sell for a fortune. Try to stay friends."
                  : lobby
                    ? "Share your table code and let the friendly rivalry begin."
                    : phase === "buying"
                      ? "Keep your eye on the properties. And an even closer eye on your friends."
                      : phase === "selling"
                        ? "The best property isn’t always the best play. Read the room."
                        : "Every great game deserves a little celebration."}
              </p>
            </div>
            <div className="game-meta">
              <span>
                <Users size={15} />
                {game ? game.players.length : "3–6"} players
              </span>
              <span>
                {game && !lobby && phase !== "finished" ? (
                  <>
                    <span className="round-pip" />
                    Round {game.round}
                    <span className="of-rounds">/ {game.rounds}</span>
                  </>
                ) : (
                  <>
                    <span className="round-pip" />
                    15–25 min
                  </>
                )}
              </span>
            </div>
          </section>
          {!game && <LearningEntry onLearn={() => setModal("tutorial")} />}
          {game && (phase === "buying" || phase === "selling") && (
            <RoundGuide
              game={game}
              tips={tips}
              onToggleTips={() => setTips(!tips)}
            />
          )}
          {offline && (
            <div className="offline-banner" role="status">
              <WifiOff size={16} />
              Connection interrupted. Your seat is saved; reconnecting
              automatically.
            </div>
          )}
          <div className="table-topline">
            <span>
              <span className="live-dot" />
              {!game
                ? "A PEEK AT THE TABLE"
                : game.practice
                  ? "PRACTICE · YOU + FRIENDLY BOTS"
                  : lobby
                    ? "WAITING FOR GOOD COMPANY"
                    : "GAME NIGHT IS LIVE"}
            </span>
            <button onClick={() => setModal("rules")}>
              <HelpCircle size={14} />A quick refresher
            </button>
          </div>
          <GameBoard
            game={game}
            onStart={() => enter("You", true)}
            busy={busy || !loaded}
          />
          {game && (
            <div className="live-message" role="status" aria-live="polite">
              <span className="message-dot" />
              {game.message}
            </div>
          )}
          {!game && (
            <div className="welcome-footer">
              <div>
                <Users />
                <span>
                  Same table.
                  <br />
                  <strong>Different couches.</strong>
                </span>
              </div>
              <div>
                <EyeOff />
                <span>
                  Private hands.
                  <br />
                  <strong>Public poker faces.</strong>
                </span>
              </div>
              <div>
                <Sparkles />
                <span>
                  All the game.
                  <br />
                  <strong>None of the cleanup.</strong>
                </span>
              </div>
            </div>
          )}
          {game && lobby && (
            <div className="lobby-controls">
              <div>
                <strong>
                  {game.players.length < 3
                    ? `${3 - game.players.length} more ${game.players.length === 2 ? "player" : "players"} and you’re ready.`
                    : "Everyone’s here? Let’s make some deals."}
                </strong>
                <span>Fill empty seats with friends or friendly bots.</span>
              </div>
              {game.host === game.me ? (
                <div className="lobby-buttons">
                  {game.players.some((p) => p.bot) && (
                    <Button
                      variant="ghost"
                      disabled={busy}
                      onClick={() => action({ type: "remove-bot" })}
                    >
                      Remove bot
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    disabled={busy || game.players.length === 6}
                    onClick={() => action({ type: "add-bot" })}
                  >
                    <Plus />
                    Add a bot
                  </Button>
                  <Button
                    className="primary-button"
                    disabled={busy || game.players.length < 3}
                    onClick={() => action({ type: "start" })}
                  >
                    Start the game
                    <ArrowRight />
                  </Button>
                </div>
              ) : (
                <p>Waiting for the host to start…</p>
              )}
            </div>
          )}
          {game && phase === "finished" && (
            <Results
              game={game}
              onRestart={() => action({ type: "restart" })}
              busy={busy}
            />
          )}{" "}
          {game && (phase === "buying" || phase === "selling") && (
            <PlayerDock
              game={game}
              busy={busy}
              offline={offline}
              tips={tips}
              action={action}
            />
          )}
          <footer className="game-footer">
            <span>
              <LockKeyhole size={12} />
              {game
                ? "What’s in your hand stays in your hand."
                : "No downloads. No accounts. Just one more round."}
            </span>
            {game && (
              <div className="reactions-wrap">
                {reactions && (
                  <div className="reaction-picker">
                    {["👋", "😂", "😮", "🤔", "🔥", "👏"].map((emoji) => (
                      <button
                        key={emoji}
                        aria-label={`React ${emoji}`}
                        onClick={() => {
                          action({ type: "react", emoji });
                          setReactions(false);
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  className="reaction-trigger"
                  onClick={() => setReactions(!reactions)}
                >
                  <Smile size={17} />
                  Say it without saying it
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
            <span className="footer-note">
              A little luck. A little nerve. A really good time.
            </span>
          </footer>
        </div>
      </main>
      {game && (phase === "buying" || phase === "selling") && (
        <MoveShortcut game={game} />
      )}
      {error && modal !== "create" && modal !== "join" && (
        <div className="error-toast" role="alert">
          <Flag size={16} />
          {error}
          <button aria-label="Dismiss error" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
      <GameDialogs
        modal={modal ?? (joinCode ? "join" : null)}
        setModal={(next) => {
          setModal(next);
          if (next === null) dismissJoin();
        }}
        code={game?.code}
        initialCode={joinCode}
        enter={enter}
        busy={busy}
        error={error}
        leave={leave}
      />
    </div>
  );
}
