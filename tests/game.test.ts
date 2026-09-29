import { test } from "node:test";
import assert from "node:assert/strict";
import {
  act,
  addBot,
  makePlayer,
  makeRoom,
  start,
  tick,
  view,
  type Room,
} from "../src/lib/game";
function table(n = 4) {
  const p = makePlayer("Host", 0);
  const r = makeRoom("TEST", p, false);
  for (let i = 1; i < n; i++) r.players.push(makePlayer(`Player ${i}`, i));
  start(r);
  return r;
}
function advance(r: Room) {
  tick(r, r.pauseUntil + 1);
}
test("IELLO setup for every player count", () => {
  for (const n of [3, 4, 5, 6]) {
    const r = table(n);
    assert.equal(
      r.players[0].coins,
      ({ 3: 28, 4: 21, 5: 16, 6: 14 } as Record<number, number>)[n],
    );
    assert.equal(r.rounds, Math.floor(30 / n));
    assert.equal(r.market.length, n);
    assert.equal(r.deck.length + r.market.length, r.rounds * n);
    assert.equal(r.checks.length, r.rounds * n);
    assert(!r.checks.includes(1));
  }
});
test("passing costs half rounded UP; final bidder pays full", () => {
  const r = table(3);
  r.turn = 0;
  r.market = [2, 15, 29];
  act(r, r.players[0], { type: "bid", amount: 3 });
  act(r, r.players[1], { type: "bid", amount: 4 });
  act(r, r.players[2], { type: "pass" });
  assert.deepEqual(r.players[2].hand, [2]);
  assert.equal(r.players[2].coins, 28);
  act(r, r.players[0], { type: "pass" });
  assert.equal(r.players[0].coins, 26);
  assert.deepEqual(r.players[0].hand, [15]);
  assert.equal(r.players[1].coins, 24);
  assert.deepEqual(r.players[1].hand, [29]);
  assert.equal(r.turn, 1);
  assert(r.pauseUntil > 0);
  advance(r);
  assert.equal(r.round, 2);
  assert.equal(r.turn, 1);
});
test("invalid and out-of-turn moves do not mutate the game", () => {
  const r = table();
  r.turn = 0;
  const snapshot = JSON.stringify(r);
  assert.throws(() => act(r, r.players[1], { type: "bid", amount: 1 }));
  assert.throws(() => act(r, r.players[0], { type: "bid", amount: 100 }));
  assert.throws(() => act(r, r.players[0], { type: "bid", amount: 1.5 }));
  assert.throws(() => act(r, r.players[0], { type: "bid", amount: 0 }));
  assert.throws(() => act(r, r.players[0], { type: "sell", card: 1 }));
  assert.throws(() => act(r, r.players[0], { type: "pass", revision: 99 }));
  assert.equal(JSON.stringify(r), snapshot);
});
test("private cards, tokens, cash, checks and selections never reach opponents", () => {
  const r = table();
  r.players[1].hand = [3, 24];
  r.players[1].selected = 24;
  r.players[1].earnings = 12;
  const v = view(r, r.players[0]);
  assert(!("deck" in v));
  assert(!("checks" in v));
  assert(!("nextBotAt" in v));
  for (const p of v.players) {
    for (const field of [
      "hand",
      "token",
      "coins",
      "earnings",
      "selected",
      "score",
    ])
      assert(!(field in p), field);
  }
  assert.equal(v.players[1].locked, true);
  assert.equal(v.players[1].count, 2);
  assert.equal(v.reveal.length, 0);
});
test("secret sales only reveal once all players commit and pay checks by rank", () => {
  const r = table(3);
  r.phase = "selling";
  r.pauseUntil = 0;
  r.market = [0, 5, 15];
  r.players.forEach((p, i) => (p.hand = [[18], [3], [29]][i]));
  act(r, r.players[0], { type: "sell", card: 18 });
  assert.equal(r.reveal.length, 0);
  assert.throws(() => act(r, r.players[0], { type: "sell", card: 18 }));
  act(r, r.players[1], { type: "sell", card: 3 });
  assert.equal(r.reveal.length, 0);
  act(r, r.players[2], { type: "sell", card: 29 });
  assert.equal(r.reveal.length, 3);
  assert.deepEqual(
    r.players.map((p) => p.earnings),
    [5, 0, 15],
  );
  assert(r.players.every((p) => p.hand.length === 0));
  assert(r.pauseUntil > 0);
});
test("host-only lifecycle actions and player limits", () => {
  const p = makePlayer("Host", 0);
  const r = makeRoom("TEST", p, false);
  assert.throws(() => start(r));
  addBot(r);
  assert.throws(() => act(r, r.players[1], { type: "start" }));
  for (let i = 0; i < 4; i++) addBot(r);
  assert.throws(() => addBot(r));
  act(r, p, { type: "start" });
  assert.throws(() => act(r, p, { type: "start" }));
  assert.throws(() => act(r, p, { type: "restart" }));
});
test("complete games conserve property cards, never create negative cash, and score correctly", () => {
  for (const n of [3, 4, 5, 6])
    for (let run = 0; run < 10; run++) {
      const r = table(n);
      const checkTotal = r.checks.reduce((sum, check) => sum + check, 0);
      let moves = 0;
      while (r.phase !== "finished" && moves++ < 1500) {
        if (r.pauseUntil) {
          advance(r);
          continue;
        }
        if (r.phase === "buying") {
          const p = r.players[r.turn];
          act(
            r,
            p,
            r.highBid < p.coins && Math.random() > 0.55
              ? { type: "bid", amount: r.highBid + 1 }
              : { type: "pass" },
          );
        } else if (r.phase === "selling") {
          const p = r.players.find((p) => p.selected === null)!;
          act(r, p, {
            type: "sell",
            card: p.hand[Math.floor(Math.random() * p.hand.length)],
          });
        }
        for (const p of r.players) assert(p.coins >= 0);
        const cards = [
          ...r.deck,
          ...r.market.filter(() => r.phase === "buying"),
          ...r.players.flatMap((p) => p.hand),
        ];
        assert.equal(new Set(cards).size, cards.length);
      }
      assert.equal(r.phase, "finished");
      assert(r.players.every((p) => p.hand.length === 0));
      const v = view(r, r.players[0]);
      assert(v.players.every((p) => p.score === p.coins! + p.earnings!));
      assert.equal(
        r.players.reduce((sum, p) => sum + p.earnings, 0),
        checkTotal,
      );
    }
});
test("zero-cash tables still finish the buying phase", () => {
  const r = table(3);
  r.players.forEach((p) => (p.coins = 0));
  while (r.phase === "buying") {
    if (r.pauseUntil) advance(r);
    else act(r, r.players[r.turn], { type: "pass" });
  }
  assert.equal(r.phase, "selling");
  assert(r.players.every((p) => p.hand.length === 10));
});
