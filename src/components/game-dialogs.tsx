"use client";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  House,
  Landmark,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar } from "./game-art";
import { GameLesson } from "./game-lesson";
export type Modal =
  "create" | "join" | "rules" | "invite" | "leave" | "tutorial" | null;
export function GameDialogs({
  modal,
  setModal,
  code,
  initialCode,
  enter,
  busy,
  error,
  leave,
}: {
  modal: Modal;
  setModal: (m: Modal) => void;
  code?: string;
  initialCode: string;
  enter: (
    name: string,
    practice: boolean,
    code?: string,
  ) => Promise<boolean | undefined>;
  busy: boolean;
  error: string;
  leave: () => void;
}) {
  const [name, setName] = useState("");
  const [room, setRoom] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${location.origin}/?room=${code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }
  return (
    <Dialog
      open={modal !== null}
      onOpenChange={(open) => {
        if (!open) setModal(null);
      }}
    >
      <DialogContent
        className={`game-modal ${modal === "rules" || modal === "tutorial" ? "rules-modal" : ""}`}
      >
        <DialogHeader>
          <div className="modal-symbol">
            {modal === "rules" ? (
              <House />
            ) : modal === "invite" ? (
              <Users />
            ) : (
              <Sparkles />
            )}
          </div>
          <DialogTitle>
            {modal === "create"
              ? "Good times start here."
              : modal === "join"
                ? "Your seat is waiting."
                : modal === "tutorial"
                  ? "Your first deal starts here."
                  : modal === "rules"
                    ? "Small rules. Big decisions."
                    : modal === "invite"
                      ? "Make room for your people."
                      : "Step away from the table?"}
          </DialogTitle>
          <DialogDescription>
            {modal === "create"
              ? "Open a private table. Invite 2–5 friends, or add a few friendly bots."
              : modal === "join"
                ? "Bring your poker face. Enter your name and the six-character table code."
                : modal === "tutorial"
                  ? "A hands-on lesson. Two little decisions. About a minute."
                  : modal === "rules"
                    ? "Buy low. Sell high. Read your friends."
                    : modal === "invite"
                      ? "Send this link to your friends. No accounts, no fuss."
                      : "Your seat is saved in this browser. Other players will wait for your turn."}
          </DialogDescription>
        </DialogHeader>
        {(modal === "create" || modal === "join") && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await enter(
                  name,
                  false,
                  modal === "join" ? room || initialCode : undefined,
                )
              )
                setModal(null);
            }}
            className="room-form"
          >
            <label>
              Your name
              <input
                autoFocus
                maxLength={20}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                required
              />
            </label>
            {modal === "join" && (
              <label>
                Table code
                <input
                  maxLength={6}
                  minLength={6}
                  value={room || initialCode}
                  onChange={(e) => setRoom(e.target.value.toUpperCase())}
                  placeholder="ABCDEF"
                  required
                  className="code-input"
                />
              </label>
            )}
            <div className="your-character">
              <Avatar color={0} small />
              <div>
                <strong>A little character. A lot of personality.</strong>
                <p>Your color follows you around the table.</p>
              </div>
            </div>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <Button className="primary-button" type="submit" disabled={busy}>
              {busy
                ? "Finding your seat…"
                : modal === "create"
                  ? "Create a table"
                  : "Join the table"}
              <ArrowRight size={17} />
            </Button>
          </form>
        )}
        {modal === "invite" && (
          <>
            <div className="invite-code">
              <span>YOUR PRIVATE TABLE</span>
              <strong>{code}</strong>
            </div>
            <Button className="primary-button" onClick={copy}>
              {copied ? <Check /> : <Copy />}
              {copied ? "Link copied!" : "Copy invite link"}
            </Button>
            <p className="fine-print">
              Or ask your friends to enter this code on the home screen.
            </p>
          </>
        )}
        {modal === "tutorial" && (
          <GameLesson
            atTable={!!code}
            busy={busy}
            error={error}
            onPractice={() => enter("You", true)}
            onClose={() => setModal(null)}
          />
        )}
        {modal === "rules" && (
          <div className="rules-content">
            <Button variant="outline" onClick={() => setModal("tutorial")}>
              Try the 60-second interactive lesson <ArrowRight size={16} />
            </Button>
            <article>
              <div className="rule-icon">
                <House />
              </div>
              <div>
                <h3>01. Buy the neighborhood</h3>
                <p>
                  Take turns clockwise. Raise the highest bid or pass. Passing
                  takes the lowest available property: you pay half your bid,
                  rounded up. The last bidder gets the highest property and pays
                  their full bid.
                </p>
              </div>
            </article>
            <article>
              <div className="rule-icon">
                <Landmark />
              </div>
              <div>
                <h3>02. Sell with a poker face</h3>
                <p>
                  Choose one property secretly. When everyone locks in, all
                  cards reveal together. The highest property earns the highest
                  check, and so on. The most check money plus leftover cash
                  wins; leftover cash breaks ties.
                </p>
              </div>
            </article>
            <div className="memory-note">
              <Sparkles size={20} />
              <p>
                <strong>Your memory is part of the game.</strong> Hands, bank
                balances, and collected checks are private. We don’t keep a
                property ownership history. Watch the table and remember who
                passed.
              </p>
            </div>
            <p className="fine-print">
              3–6 players · 15–25 minutes · IELLO 2020 rules
              <br />
              Starting cash: $28k / $21k / $16k / $14k for 3 / 4 / 5 / 6
              players. With 4 players, two cards from each deck are set aside.
            </p>
            <a
              href="https://iellogames.com/wp-content/uploads/2020/07/For-Sale_Rulebook_EN_V2.pdf"
              target="_blank"
              rel="noreferrer"
              className="rules-link"
            >
              Read the original rulebook ↗
            </a>
          </div>
        )}
        {modal === "leave" && (
          <div className="leave-actions">
            <Button variant="outline" onClick={() => setModal(null)}>
              Stay at the table
            </Button>
            <Button
              className="primary-button"
              onClick={() => {
                leave();
                setModal(null);
              }}
            >
              Back to the lounge
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
