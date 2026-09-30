import type { View } from "./game";

export const money = (value: number) =>
  `$${(value * 1000).toLocaleString("en-US")}`;

export function buyingDecision(game: View, proposedBid: number) {
  const player = game.players.find((p) => p.id === game.me);
  const minimum = game.highBid + 1;
  const canAfford = game.coins >= minimum;
  const bid = canAfford
    ? Math.min(game.coins, Math.max(minimum, proposedBid))
    : minimum;
  const passCost = Math.ceil((player?.bid ?? 0) / 2);
  return {
    minimum,
    bid,
    canAfford,
    passCost,
    cashAfterPass: game.coins - passCost,
    cashAfterWin: canAfford ? game.coins - bid : null,
    lowest: game.market[0],
    highest: game.market.at(-1),
    roundsLeft: game.rounds - game.round + 1,
  };
}

export function turnPrompt(game: View) {
  const player = game.players.find((p) => p.id === game.me);
  if (game.pauseUntil)
    return game.phase === "selling"
      ? "Cards down. Here’s your deal."
      : "Deal closed. A fresh neighborhood next.";
  if (game.phase === "selling") {
    if (game.selected === null) return "Your move: choose a property to sell.";
    const waiting = game.players.filter((p) => !p.locked).length;
    return `Your card is safe. Waiting for ${waiting} ${waiting === 1 ? "player" : "players"}.`;
  }
  if (player?.passed) return "Property collected. Sit back and read the room.";
  if (game.players[game.turn]?.id === game.me)
    return "Your move: raise the bid or take a property.";
  return `${game.players[game.turn]?.name ?? "Another player"} is making a move.`;
}
