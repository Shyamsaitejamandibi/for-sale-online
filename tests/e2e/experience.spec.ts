import { test, expect, type Page } from "@playwright/test";
import { makePlayer, makeRoom, start, act, tick } from "../../src/lib/game";
import type { Room } from "../../src/lib/game";

async function openTable(page: Page, room: Room) {
  process.env.DATA_DIR = ".data/e2e";
  const { save, transaction } = await import("../../src/lib/store");
  transaction(() => save(room));
  await page.addInitScript(
    ({ code, token }) => {
      localStorage.setItem(`for-sale:${code}`, JSON.stringify({ code, token }));
    },
    { code: room.code, token: room.players[0].token },
  );
  await page.goto(`/?room=${room.code}`);
}
function table() {
  const host = makePlayer("You", 0);
  const code = `U${crypto.randomUUID().replaceAll("-", "").slice(0, 5).toUpperCase()}`;
  const room = makeRoom(code, host, false);
  room.players.push(makePlayer("Maya", 1), makePlayer("Leo", 2));
  start(room);
  room.turn = 0;
  return room;
}

async function screenshot(page: Page, name: string) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {})),
    ),
  );
  await page.screenshot({ path: `artifacts/${name}.png`, fullPage: true });
}

test("the interactive lesson explains rounding and ranks without making live moves", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: /A first deal, without the guesswork/ })
    .click();
  const lesson = page.getByRole("dialog");
  await expect(
    lesson.getByRole("button", { name: "Try selling" }),
  ).toBeDisabled();
  await lesson.getByRole("button", { name: "$2,000", exact: true }).click();
  await expect(lesson.getByRole("status")).toContainText("Almost");
  await lesson.getByRole("button", { name: "$3,000", exact: true }).click();
  await expect(lesson.getByRole("status")).toContainText("Half, rounded up");
  await lesson.getByRole("button", { name: "Try selling" }).click();
  await lesson.getByRole("button", { name: /value 6$/ }).click();
  await expect(lesson.getByRole("status")).toContainText(
    "Property #6 earns $0",
  );
  await lesson.getByRole("button", { name: /value 28$/ }).click();
  await expect(lesson.getByRole("status")).toContainText(
    "Property #28 earns $15,000",
  );
  await lesson.getByRole("button", { name: "Got it" }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("for-sale:active")),
  ).toBeNull();
  await screenshot(page, "lesson-mobile");
  await lesson
    .getByRole("button", { name: "Let’s play a practice game" })
    .click();
  await expect(page.getByRole("button", { name: "Place bid" })).toBeEnabled();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("bid previews distinguish a proposed winning bid from the committed pass cost", async ({
  page,
}) => {
  const room = table();
  act(room, room.players[0], { type: "bid", amount: 5 });
  act(room, room.players[1], { type: "bid", amount: 6 });
  act(room, room.players[2], { type: "bid", amount: 7 });
  const lowest = room.market[0];
  await openTable(page, room);
  const preview = page.getByLabel("Move preview");
  await expect(preview).toContainText("Pay $8,000");
  await expect(preview).toContainText(`Pay $3,000 · take #${lowest}`);
  await page.getByRole("button", { name: "$12,000", exact: true }).click();
  await expect(preview).toContainText("Pay $12,000");
  await expect(preview).toContainText("$16,000 left");
  await expect(preview).toContainText(`Pay $3,000 · take #${lowest}`);
  await expect(preview).toContainText("$25,000 left");
  await page.getByRole("button", { name: "Table tips" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Table tips" }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Pass", exact: true }).click();
  await expect(page.locator(".hand-cards .property-card")).toHaveCount(1);
  await expect(page.locator(".wallet")).toContainText("$25,000");
  await expect(page.getByLabel("Move preview")).toHaveCount(0);
  await screenshot(page, "buying-desktop");
});

test("selling keeps the selected card stable when sorting, hides it, and resets after a reveal", async ({
  page,
  request,
}) => {
  const room = table();
  while (room.phase === "buying") {
    if (room.pauseUntil) tick(room, room.pauseUntil + 1);
    else act(room, room.players[room.turn], { type: "pass" });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await openTable(page, room);
  await expect(
    page.getByRole("link", { name: "Jump to your controls" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Jump to your controls" }).click();
  await expect(
    page.getByRole("button", { name: "Select a card from your hand" }),
  ).toBeInViewport();
  await expect(
    page.getByRole("link", { name: "Jump to your controls" }),
  ).toHaveCount(0);
  const value = room.players[0].hand[0];
  await page
    .getByRole("button", { name: new RegExp(`value ${value}$`) })
    .click();
  await expect(
    page.getByRole("button", {
      name: `Lock in property ${value}`,
      exact: true,
    }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Sort properties highest first" })
    .click();
  await expect(
    page.locator(".hand-cards .property-card").first(),
  ).toHaveAttribute(
    "aria-label",
    new RegExp(`value ${room.players[0].hand.at(-1)}$`),
  );
  await expect(
    page.getByRole("button", { name: new RegExp(`value ${value}$`) }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Only you can see" }).click();
  await expect(page.getByText("Your choice is tucked away.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Lock in selected property" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Show hand" }).click();
  await screenshot(page, "sale-preview-mobile");
  await page
    .getByRole("button", { name: `Lock in property ${value}`, exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Property locked in" }),
  ).toBeDisabled();
  await Promise.all(
    room.players.slice(1).map((p) =>
      request.post(`/api/rooms/${room.code}`, {
        headers: { Authorization: `Bearer ${p.token}` },
        data: { type: "sell", card: p.hand[0] },
      }),
    ),
  );
  await expect(page.locator(".reveal-card")).toHaveCount(3);
  await expect(page.getByText("Your deal this round")).toBeVisible();
  await screenshot(page, "new-reveal-mobile");
  await expect(
    page.getByRole("button", { name: "Select a card from your hand" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Select a card from your hand" }),
  ).toBeVisible();
  await expect(
    page.locator(".hand-cards .property-card[aria-pressed=true]"),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
