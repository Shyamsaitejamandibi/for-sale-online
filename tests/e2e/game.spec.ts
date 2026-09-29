import { test, expect, type APIRequestContext } from "@playwright/test";
import type { View } from "../../src/lib/game";
test("practice, private hand, reaction, rules, and persistent seat on phone", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "A little bluff. A lot of possibility.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "A quick refresher" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Your memory is part of the game",
  );
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Play a practice round" }).click();
  await expect(page.getByRole("button", { name: "Place bid" })).toBeEnabled();
  await page.getByRole("button", { name: "Pass", exact: true }).click();
  await expect(page.locator(".hand-cards .property-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Say it without saying it" }).click();
  await page.getByRole("button", { name: "React 🔥" }).click();
  await expect(page.locator(".my-seat .emoji-bubble")).toHaveText("🔥");
  const url = page.url();
  await page.reload();
  await expect(page.locator(".hand-cards .property-card")).toHaveCount(1);
  expect(page.url()).toBe(url);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Only you can see" }).click();
  await expect(page.locator(".hidden-hand")).toBeVisible();
  expect(errors).toEqual([]);
});
test("three browsers share a room, show bids, and keep hands private", async ({
  browser,
}) => {
  const contexts = await Promise.all([
    browser.newContext(),
    browser.newContext(),
    browser.newContext(),
  ]);
  const pages = await Promise.all(contexts.map((c) => c.newPage()));
  await pages[0].goto("/");
  await pages[0]
    .getByRole("button", { name: "Create a table", exact: true })
    .click();
  await pages[0].getByLabel("Your name").fill("Alice");
  await pages[0]
    .getByRole("dialog")
    .getByRole("button", { name: "Create a table" })
    .click();
  await expect(pages[0].locator(".room-code")).toBeVisible();
  const url = pages[0].url();
  for (let i = 1; i < 3; i++) {
    await pages[i].goto(url);
    await pages[i].getByLabel("Your name").fill(i === 1 ? "Ben" : "Cora");
    await pages[i]
      .getByRole("dialog")
      .getByRole("button", { name: "Join the table" })
      .click();
    await expect(pages[i].locator(".lobby-center")).toContainText(
      `${i + 1} of 6`,
    );
  }
  await expect(pages[0].locator(".lobby-center")).toContainText("3 of 6");
  await pages[0].getByRole("button", { name: "Start the game" }).click();
  await expect(
    pages[0].getByRole("heading", { name: "Going once, going twice…" }),
  ).toBeVisible();
  for (const p of pages)
    await expect(p.locator(".market-cards .property-card")).toHaveCount(3);
  const responses = await Promise.all(
    pages.map((p) =>
      p.evaluate(async () => {
        const s = JSON.parse(localStorage.getItem("for-sale:active")!);
        return (
          await (
            await fetch(`/api/rooms/${s.code}`, {
              headers: { Authorization: `Bearer ${s.token}` },
            })
          ).json()
        ).game;
      }),
    ),
  );
  const turn = responses.findIndex((r) => r.me === r.players[r.turn].id);
  await pages[turn].getByRole("button", { name: "Place bid" }).click();
  for (let i = 0; i < 3; i++)
    await expect(
      pages[i].locator(".bid-bubble").filter({ hasText: "$1,000" }),
    ).toBeVisible();
  for (const response of responses)
    for (const p of response.players) {
      expect(p).not.toHaveProperty("token");
      expect(p).not.toHaveProperty("hand");
      expect(p).not.toHaveProperty("coins");
    }
  await Promise.all(contexts.map((c) => c.close()));
});
async function create(request: APIRequestContext) {
  const res = await request.post("/api/rooms", {
    data: { name: "Host", practice: false },
  });
  expect(res.ok()).toBeTruthy();
  return res.json() as Promise<{ token: string; game: View }>;
}
test("a complete live 3-player game: valid turns, secret simultaneous sales, score and rematch", async ({
  request,
}) => {
  const host = await create(request);
  const code = host.game.code;
  const seats = [host];
  for (const name of ["Maya", "Leo"]) {
    const r = await request.post(`/api/rooms/${code}`, {
      data: { type: "join", name },
    });
    seats.push(await r.json());
  }
  const tokens = new Map(seats.map((s) => [s.game.me, s.token]));
  const get = async () => {
    const r = await request.get(`/api/rooms/${code}`, {
      headers: { Authorization: `Bearer ${host.token}` },
    });
    expect(r.ok()).toBeTruthy();
    return (await r.json()).game as View;
  };
  const move = async (id: string, body: object) => {
    const r = await request.post(`/api/rooms/${code}`, {
      headers: { Authorization: `Bearer ${tokens.get(id)}` },
      data: body,
    });
    expect(r.ok(), await r.text()).toBeTruthy();
    return (await r.json()).game as View;
  };
  await move(host.game.me, { type: "start" });
  let game = await get();
  const first = game.players[game.turn];
  const wrong = game.players.find((p) => p.id !== first.id)!;
  const denied = await request.post(`/api/rooms/${code}`, {
    headers: { Authorization: `Bearer ${tokens.get(wrong.id)}` },
    data: { type: "bid", amount: 1 },
  });
  expect(denied.ok()).toBeFalsy();
  let iterations = 0;
  while (game.phase !== "finished" && iterations++ < 500) {
    if (game.pauseUntil) {
      await new Promise((r) =>
        setTimeout(r, Math.max(50, game.pauseUntil - Date.now() + 40)),
      );
      game = await get();
      continue;
    }
    if (game.phase === "buying") {
      game = await move(game.players[game.turn].id, { type: "pass" });
    } else {
      const views = await Promise.all(
        seats.map(async (seat) => {
          const r = await request.get(`/api/rooms/${code}`, {
            headers: { Authorization: `Bearer ${seat.token}` },
          });
          return (await r.json()).game as View;
        }),
      );
      const firstSale = await move(views[0].me, {
        type: "sell",
        card: views[0].hand[0],
      });
      expect(firstSale.reveal).toHaveLength(0);
      const hidden = await get();
      for (const p of hidden.players) expect(p).not.toHaveProperty("selected");
      await Promise.all(
        views
          .slice(1)
          .map((v) =>
            move(v.me, { type: "sell", card: v.hand[0], revision: v.revision }),
          ),
      );
      game = await get();
      expect(game.reveal).toHaveLength(3);
    }
  }
  expect(game.phase).toBe("finished");
  expect(game.players.reduce((sum, p) => sum + p.earnings!, 0)).toBe(238);
  for (const p of game.players) {
    expect(p.score).toBe(p.coins! + p.earnings!);
    expect(p.coins).toBe(28);
    expect(p.count).toBe(0);
  }
  game = await move(host.game.me, { type: "restart" });
  expect(game.phase).toBe("buying");
  expect(game.round).toBe(1);
  expect(game.hand).toHaveLength(0);
});
test("bad room errors and closing invitation forms", async ({ page }) => {
  await page.goto("/?room=XXXXXX");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Join a table", exact: true }).click();
  await page.getByLabel("Your name").fill("Test");
  await page.getByLabel("Table code").fill("XXXXXX");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Join the table" })
    .click();
  await expect(page.getByRole("alert")).toContainText("Table not found");
});

test("six-seat selling screen, secret hand choice and lock-in on mobile", async ({
  page,
}) => {
  // Set up the second act with the real rules engine; skip only its timed pauses.
  process.env.DATA_DIR = ".data/e2e";
  const { makeRoom, makePlayer, addBot, start, act, tick } =
    await import("../../src/lib/game");
  const { save, transaction } = await import("../../src/lib/store");
  const host = makePlayer("Visual test", 0);
  const code = `V${Date.now().toString(36).slice(-5).toUpperCase()}`;
  const room = makeRoom(code, host, false);
  for (let i = 0; i < 5; i++) addBot(room);
  start(room);
  while (room.phase === "buying") {
    if (room.pauseUntil) tick(room, room.pauseUntil + 1);
    else act(room, room.players[room.turn], { type: "pass" });
  }
  transaction(() => save(room));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(
    ({ code, token }) => {
      const session = JSON.stringify({ code, token });
      localStorage.setItem("for-sale:active", session);
      localStorage.setItem(`for-sale:${code}`, session);
    },
    { code, token: host.token },
  );
  await page.goto(`/?room=${code}`);
  await expect(
    page.getByRole("heading", { name: "Time to play your hand." }),
  ).toBeVisible();
  await expect(page.locator(".market-cards .check-card")).toHaveCount(6);
  await expect(page.locator(".hand-cards .property-card")).toHaveCount(5);
  await page.locator(".hand-cards .property-card").first().click();
  await expect(
    page.getByRole("button", { name: /Lock in property/ }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "artifacts/selling-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /Lock in property/ }).click();
  await expect(
    page.getByRole("button", { name: "Property locked in" }),
  ).toBeDisabled();
  await expect(page.locator(".reveal-card")).toHaveCount(6);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "artifacts/reveal-mobile.png",
    fullPage: true,
  });
});
