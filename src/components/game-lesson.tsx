"use client";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Coins,
  Gavel,
  Landmark,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import { PropertyCard } from "./game-art";
import { money } from "@/lib/game-presentation";
import { cn } from "@/lib/utils";
import styles from "./game-experience.module.css";

export function GameLesson({
  atTable,
  busy,
  error,
  onPractice,
  onClose,
}: {
  atTable: boolean;
  busy: boolean;
  error: string;
  onPractice: () => Promise<boolean | undefined>;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [card, setCard] = useState<number | null>(null);
  const correct = answer === 3;
  const check = card === 6 ? 0 : card === 18 ? 8 : 15;
  return (
    <div className={styles.lesson}>
      <div
        className={styles.lessonSteps}
        aria-label={`Lesson step ${step + 1} of 3`}
      >
        {["Buy", "Sell", "You’re ready"].map((label, i) => (
          <span
            className={cn(
              i === step && styles.lessonCurrent,
              i < step && styles.lessonComplete,
            )}
            key={label}
          >
            <i>{i < step ? <Check size={12} /> : i + 1}</i>
            {label}
          </span>
        ))}
      </div>
      {step === 0 ? (
        <>
          <div className={styles.lessonHeading}>
            <Gavel size={20} />
            <h3>A bid is a promise. Passing is a bargain.</h3>
          </div>
          <p>
            You’ve already bid <strong>$5,000</strong>. Pass now and you take
            the lowest property. Stay in and win to take the highest.
          </p>
          <div className={styles.lessonCards}>
            {[6, 18, 28].map((value) => (
              <PropertyCard key={value} value={value} compact />
            ))}
          </div>
          <fieldset className={styles.lessonQuiz}>
            <legend>If you pass, how much do you pay?</legend>
            <div>
              {[2, 3, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setAnswer(value)}
                  aria-pressed={answer === value}
                >
                  {money(value)}
                  {answer === value && correct && <Check size={15} />}
                </button>
              ))}
            </div>
          </fieldset>
          {answer !== null && (
            <div
              className={cn(
                styles.lessonFeedback,
                correct && styles.correctAnswer,
              )}
              role="status"
            >
              {correct ? (
                <>
                  <Check size={18} />
                  <p>
                    <strong>Exactly. Half, rounded up.</strong>$5,000 ÷ 2 rounds
                    up to $3,000. You get property #6. If you win instead, you
                    pay the full $5,000.
                  </p>
                </>
              ) : (
                <>
                  <Coins size={18} />
                  <p>
                    <strong>Almost. Try half, rounded up.</strong>Half of $5,000
                    is $2,500. Round up to the next $1,000.
                  </p>
                </>
              )}
            </div>
          )}
        </>
      ) : step === 1 ? (
        <>
          <div className={styles.lessonHeading}>
            <Landmark size={20} />
            <h3>It’s the ranking that makes the deal.</h3>
          </div>
          <p>
            In this example, the other players reveal{" "}
            <strong>#12 and #24</strong>. Available checks are{" "}
            <strong>$0, $8,000, and $15,000</strong>. Try a property and see
            where it lands.
          </p>
          <div className={styles.lessonCards}>
            {[6, 18, 28].map((value) => (
              <PropertyCard
                key={value}
                value={value}
                compact
                onClick={() => setCard(value)}
                selected={card === value}
              />
            ))}
          </div>
          {card !== null ? (
            <div
              className={cn(styles.lessonFeedback, styles.correctAnswer)}
              role="status"
            >
              <Check size={18} />
              <p>
                <strong>
                  Property #{card} earns {money(check)}.
                </strong>
                {card === 6
                  ? "6 < 12 < 24: lowest property, lowest check."
                  : card === 18
                    ? "12 < 18 < 24: middle property, middle check."
                    : "12 < 24 < 28: highest property, highest check."}{" "}
                In a real game, everyone chooses secretly and reveals together.
              </p>
            </div>
          ) : (
            <p className={styles.lessonInstruction}>
              Tap any property to try a sale. This is just an example.
            </p>
          )}
        </>
      ) : (
        <>
          <div className={styles.lessonReady}>
            <span>
              <Check size={32} />
            </span>
            <h3>You’ve got the keys.</h3>
            <p>
              A little nerve. A little timing. You’re ready for your first
              neighborhood.
            </p>
          </div>
          <div className={styles.lessonRecap}>
            <p>
              <Gavel size={18} />
              <span>
                <strong>Buy</strong>Raise or pass. Everyone collects one
                property.
              </span>
            </p>
            <p>
              <Landmark size={18} />
              <span>
                <strong>Sell</strong>Choose secretly. Higher properties get
                higher checks.
              </span>
            </p>
            <p>
              <Coins size={18} />
              <span>
                <strong>Win</strong>Collected checks + saved cash. Most money
                wins.
              </span>
            </p>
          </div>
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className={styles.lessonNavigation}>
        {step > 0 ? (
          <button
            className={styles.lessonBack}
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft size={15} />
            Back
          </button>
        ) : (
          <span className={styles.lessonFootnote}>
            Example only · no real moves
          </span>
        )}
        {step < 2 ? (
          <Button
            className="primary-button"
            disabled={step === 0 ? !correct : card === null}
            onClick={() => setStep(step + 1)}
          >
            {step === 0 ? "Try selling" : "Got it"}
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button
            className="primary-button"
            disabled={busy}
            onClick={async () => {
              if (atTable || (await onPractice())) onClose();
            }}
          >
            {busy ? <Loader2 className="animate-spin" /> : <Gavel size={16} />}
            {atTable ? "Back to my table" : "Let’s play a practice game"}
            <ArrowRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
