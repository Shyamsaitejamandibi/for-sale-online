export type Phase = "lobby" | "buying" | "selling" | "finished";
export type Player = {
  id: string;
  token: string;
  name: string;
  color: number;
  bot: boolean;
  coins: number;
  hand: number[];
  earnings: number;
  bid: number;
  passed: boolean;
  selected: number | null;
  reaction: string;
  reactionAt: number;
  seen: number;
};
export type Room = {
  code: string;
  host: string;
  practice: boolean;
  phase: Phase;
  players: Player[];
  deck: number[];
  checks: number[];
  market: number[];
  round: number;
  rounds: number;
  turn: number;
  highBid: number;
  pauseUntil: number;
  nextBotAt: number;
  revision: number;
  updatedAt: number;
  message: string;
  reveal: { id: string; card: number; check: number }[];
};
export type Action = {
  type:
    | "bid"
    | "pass"
    | "sell"
    | "start"
    | "react"
    | "add-bot"
    | "restart"
    | "remove-bot";
  amount?: number;
  card?: number;
  emoji?: string;
  revision?: number;
};
export type PublicPlayer = Omit<
  Player,
  "token" | "hand" | "coins" | "earnings" | "selected"
> & {
  count: number;
  locked: boolean;
  coins?: number;
  earnings?: number;
  score?: number;
};
export type View = Omit<Room, "players" | "deck" | "checks" | "nextBotAt"> & {
  players: PublicPlayer[];
  me: string;
  hand: number[];
  selected: number | null;
  coins: number;
  earnings: number;
};
const ascending = (a: number, b: number) => a - b;
export function shuffle<T>(items: T[], random = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function makePlayer(name: string, color: number, bot = false): Player {
  return {
    id: crypto.randomUUID(),
    token: crypto.randomUUID(),
    name: name.trim().slice(0, 20) || "Guest",
    color,
    bot,
    coins: 0,
    hand: [],
    earnings: 0,
    bid: 0,
    passed: false,
    selected: null,
    reaction: "",
    reactionAt: 0,
    seen: Date.now(),
  };
}
export function makeRoom(code: string, host: Player, practice: boolean): Room {
  return {
    code,
    host: host.id,
    practice,
    phase: "lobby",
    players: [host],
    deck: [],
    checks: [],
    market: [],
    round: 0,
    rounds: 0,
    turn: 0,
    highBid: 0,
    pauseUntil: 0,
    nextBotAt: 0,
    revision: 0,
    updatedAt: Date.now(),
    message: "Good company. A little friendly competition.",
    reveal: [],
  };
}
export function addBot(room: Room) {
  if (room.phase !== "lobby" || room.players.length >= 6)
    throw Error("The table is full or already playing.");
  const names = ["Cleo", "Oliver", "Jun", "Luna", "Theo"];
  const color = [0, 1, 2, 3, 4, 5].find(
    (c) => !room.players.some((p) => p.color === c),
  )!;
  room.players.push(makePlayer(names[color - 1] ?? "Theo", color, true));
}
export function start(room: Room) {
  const n = room.players.length;
  if (n < 3 || n > 6)
    throw Error("You need 3–6 players. Add a friend or a bot.");
  room.rounds = Math.floor(30 / n);
  const count = room.rounds * n;
  room.deck = shuffle(Array.from({ length: 30 }, (_, i) => i + 1)).slice(
    0,
    count,
  );
  room.checks = shuffle([
    0,
    0,
    ...Array.from({ length: 14 }, (_, i) => [i + 2, i + 2]).flat(),
  ]).slice(0, count);
  room.players.forEach((p) =>
    Object.assign(p, {
      coins: ({ 3: 28, 4: 21, 5: 16, 6: 14 } as Record<number, number>)[n],
      hand: [],
      earnings: 0,
      bid: 0,
      passed: false,
      selected: null,
    }),
  );
  room.phase = "buying";
  room.round = 0;
  room.turn = room.practice ? 0 : Math.floor(Math.random() * n);
  nextRound(room);
}
function nextRound(room: Room) {
  room.pauseUntil = 0;
  room.reveal = [];
  room.highBid = 0;
  room.players.forEach((p) => {
    p.bid = 0;
    p.passed = false;
    p.selected = null;
  });
  if (room.phase === "buying" && !room.deck.length) {
    room.phase = "selling";
    room.round = 0;
  }
  if (room.phase === "selling" && !room.checks.length) {
    room.phase = "finished";
    room.message = "That’s a wrap. Let’s see who bought brilliantly.";
    room.market = [];
    return;
  }
  room.round++;
  room.market = (room.phase === "buying" ? room.deck : room.checks)
    .splice(0, room.players.length)
    .sort(ascending);
  room.message =
    room.phase === "buying"
      ? "A new neighborhood. A fresh opportunity."
      : "Choose a property. Read the room.";
  room.nextBotAt = Date.now() + 1600;
}
function advanceTurn(room: Room) {
  do {
    room.turn = (room.turn + 1) % room.players.length;
  } while (room.players[room.turn].passed);
  room.nextBotAt = Date.now() + 1400 + Math.random() * 700;
}
function revealSales(room: Room) {
  const ordered = [...room.players].sort((a, b) => a.selected! - b.selected!);
  room.reveal = ordered.map((p, i) => {
    const card = p.selected!;
    const check = room.market[i];
    p.hand = p.hand.filter((c) => c !== card);
    p.earnings += check;
    return { id: p.id, card, check };
  });
  room.message = "Cards on the table! Here’s how the deals landed.";
  room.pauseUntil = Date.now() + 6500;
}
export function act(room: Room, player: Player, action: Action) {
  if (action.type === "react") {
    if (!["👋", "😂", "😮", "🤔", "🔥", "👏"].includes(action.emoji ?? ""))
      throw Error("Unknown reaction.");
    player.reaction = action.emoji!;
    player.reactionAt = Date.now();
    return;
  }
  if (["start", "restart", "add-bot", "remove-bot"].includes(action.type)) {
    if (player.id !== room.host) throw Error("Only the host can do that.");
    if (action.type === "restart") {
      if (room.phase !== "finished") throw Error("Finish this game first.");
      room.phase = "lobby";
      start(room);
      return;
    }
    if (action.type === "add-bot") {
      addBot(room);
      return;
    }
    if (action.type === "remove-bot") {
      if (room.phase !== "lobby") throw Error("The game has started.");
      const i = room.players.findLastIndex((p) => p.bot);
      if (i >= 0) room.players.splice(i, 1);
      return;
    }
    if (room.phase !== "lobby") throw Error("The game has already started.");
    start(room);
    return;
  }
  if (
    room.phase !== "selling" &&
    action.revision !== undefined &&
    action.revision !== room.revision
  )
    throw Error("The table changed. Try your move again.");
  if (room.pauseUntil) throw Error("The next round is about to begin.");
  if (room.phase === "buying") {
    if (room.players[room.turn].id !== player.id || player.passed)
      throw Error("It’s not your turn yet.");
    if (action.type === "bid") {
      const bid = action.amount;
      if (!Number.isInteger(bid) || bid! <= room.highBid || bid! > player.coins)
        throw Error("Raise the highest bid, within your budget.");
      player.bid = bid!;
      room.highBid = bid!;
      room.message = `${player.name} raised to $${bid},000.`;
      advanceTurn(room);
    } else if (action.type === "pass") {
      player.coins -= Math.ceil(player.bid / 2);
      player.hand.push(room.market.shift()!);
      player.hand.sort(ascending);
      player.passed = true;
      room.message = `${player.name} passed and collected a property.`;
      const remaining = room.players.filter((p) => !p.passed);
      if (remaining.length === 1) {
        const winner = remaining[0];
        winner.coins -= winner.bid;
        winner.hand.push(room.market.shift()!);
        winner.hand.sort(ascending);
        room.turn = room.players.indexOf(winner);
        room.message = `${winner.name} wins the auction. Next round coming up…`;
        room.pauseUntil = Date.now() + 3000;
      } else advanceTurn(room);
    } else throw Error("Choose a bid or pass.");
  } else if (room.phase === "selling") {
    if (
      action.type !== "sell" ||
      !player.hand.includes(action.card!) ||
      player.selected !== null
    )
      throw Error("Choose an available property from your hand.");
    player.selected = action.card!;
    room.message = `${player.name} has locked in a property.`;
    if (room.players.every((p) => p.selected !== null)) revealSales(room);
  } else throw Error("This table is not in a playing phase.");
}
export function tick(room: Room, now = Date.now()) {
  if (room.pauseUntil) {
    if (now >= room.pauseUntil) {
      nextRound(room);
      room.revision++;
    }
    return;
  }
  if (now < room.nextBotAt) return;
  let bot: Player | undefined;
  if (room.phase === "buying") {
    bot = room.players[room.turn];
    if (!bot?.bot) return;
    const roundsLeft = room.rounds - room.round + 1;
    const budget = Math.min(
      bot.coins,
      Math.max(1, Math.round((bot.coins / roundsLeft) * 1.7)),
    );
    const spread = (room.market.at(-1) ?? 0) - (room.market[0] ?? 0);
    const wants =
      room.highBid < budget &&
      (spread > 6 || room.highBid < 2) &&
      Math.random() > 0.2;
    act(
      room,
      bot,
      wants ? { type: "bid", amount: room.highBid + 1 } : { type: "pass" },
    );
  } else if (room.phase === "selling") {
    bot = room.players.find((p) => p.bot && p.selected === null);
    if (!bot) return;
    const ratio =
      room.market.reduce((a, b) => a + b, 0) / room.market.length / 15;
    const index = Math.min(
      bot.hand.length - 1,
      Math.floor(ratio * bot.hand.length),
    );
    act(room, bot, { type: "sell", card: bot.hand[index] });
    room.nextBotAt = now + 1100;
  } else return;
  room.revision++;
}
export function view(room: Room, player: Player): View {
  const { deck, checks, nextBotAt, players, ...publicRoom } = room;
  void deck;
  void checks;
  void nextBotAt;
  return {
    ...publicRoom,
    me: player.id,
    hand: [...player.hand],
    selected: player.selected,
    coins: player.coins,
    earnings: player.earnings,
    players: players.map((p) => {
      const { token, hand, coins, earnings, selected, ...safe } = p;
      void token;
      return {
        ...safe,
        count: hand.length,
        locked: selected !== null,
        ...(room.phase === "finished"
          ? { coins, earnings, score: coins + earnings }
          : {}),
      };
    }),
  };
}
