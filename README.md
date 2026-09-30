# For Sale — Good company. Great deals.

A playable, social web adaptation of Stefan Dorra’s **For Sale**, built with Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui (Base UI). Original SVG characters and property illustrations; no external image service or artwork downloads.

## Run locally

Use **Node.js 24 LTS** (the room store uses built-in `node:sqlite`).

```sh
npm install
npm run dev
```

Open the URL printed by Next.js. Choose **Play a practice round**, or **Create a table** and share the invitation with friends. Rooms support 3–6 seats. Hosts can add and remove bots before starting. No account or API key is required.

For friends on the same Wi-Fi, run `npm run dev -- --hostname 0.0.0.0` and open the computer’s LAN IP address in every browser. An invitation containing `localhost` works only on that computer. For remote friends, deploy the server at a shared public URL.

## What works

- Both complete game phases, automatic dealing, winner-led next auctions, ranked check payouts, cash tie-breaks, shared victories, and rematches.
- Server-authoritative room state and action validation. Simultaneous selling decisions are accepted independently; selections are never returned to opponents before the reveal.
- 3–6 real players, mixed human/bot tables, and one-click four-player practice.
- Seated characters, current bids, turn indicators, locked-card indicators, brief emoji reactions, and optional turn sounds.
- Your own property hand, hide-hand control, spending balance, contextual pass cost, and bid stepper.
- A hands-on, three-step lesson for first-time players, available from the welcome screen and rules reference.
- A two-phase progress tracker, explicit turn guidance, optional table tips, and an off-screen move shortcut on phones.
- Quick bid amounts and separate win/pass previews showing the payment, remaining cash, and pass property before committing.
- Hand sorting, a private portfolio with earned checks and saved cash, selected-property previews, and named selling readiness.
- Personal sale highlights and payout summaries, with subtle optional cues for buying turns, selling rounds, reveals, and the final result. Sound and table-tip preferences survive reloads.
- Responsive phone and desktop layouts, keyboard-operable dialogs and controls, live status announcements, and reduced-motion support.
- Rejoining the same invitation in the original browser restores the seat. Room state survives server restarts.

## Fair information

An authenticated player receives only their own hand, remaining cash, earned checks, and selected sale card. Other seats expose names, bids, hand counts, readiness, and connection status. Deck order and seat tokens never enter a public snapshot. Buying activity never records which property went to which player. Only the current selling reveal is visible, then it is cleared. Remembering prior acquisitions is intentionally part of the game.

## Rules edition

Implements the [IELLO 2020 rulebook](https://iellogames.com/wp-content/uploads/2020/07/For-Sale_Rulebook_EN_V2.pdf), including that edition’s starting cash and deck setup. See **How to play** for the interactive rules reference. Other editions use different starting cash, so don’t mix rulebooks.

Fan-made adaptation; not affiliated with or endorsed by the publisher. For Sale was designed by Stefan Dorra. The illustrations and interface in this repository are original.

## Server and persistence

The client polls every 750 ms. Each update is validated and committed in an SQLite transaction; bots and between-round transitions advance during room updates. A disconnected human’s turn waits for their return rather than spending their money automatically.

SQLite lives in `.data/rooms.sqlite`. Set `DATA_DIR` to change its location. Keep that directory private and on durable storage. Browser local storage holds each player’s unguessable seat credential; clearing it loses that seat. Sharing a room URL never shares the credential.

**Deployment target: one persistent Node server.** This is not a stateless/serverless deployment: multiple replicas would need a shared database and coordinated room updates. There are no accounts, voice chat, public matchmaking, or automatic substitution for disconnected players. Reactions provide lightweight social presence.

## Production

```sh
npm run build
npm start
```

Or use Docker with persistent storage:

```sh
docker compose up --build
```

The container serves port 3000. Put HTTPS in front of it for public deployment. Rooms persist in the named `for-sale-data` volume.

## Checks

```sh
npm test                 # rules, authorization, privacy, complete simulated games
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e         # browser journeys + a complete live multiplayer game
```

End-to-end tests use a separate Next.js build directory, port 3100, and `.data/e2e`. The full game deliberately waits for the real reveal and round transitions, so the suite takes about two minutes.

## Code map

- `src/lib/game.ts`: game rules, bots, public/private state boundary.
- `src/lib/store.ts`: transactional persistent room store.
- `src/app/api/rooms/`: room creation, authenticated snapshots, joining, and actions.
- `src/hooks/use-game.ts`: reconnects, polling, actions, and stale-response protection.
- `src/components/table-board.tsx`: table, seats, market, and reveal.
- `src/components/game-table.tsx`: game screen, private hand, and controls.
- `src/components/player-dock.tsx`: private hand, portfolio, bid previews, and selling decisions.
- `src/components/game-experience.tsx`: lesson entry, round guidance, and mobile move shortcut.
- `src/components/game-lesson.tsx`: interactive learning examples without changing a live table.
- `src/lib/game-presentation.ts`: visible move costs and turn prompts, derived only from the authenticated view.
- `src/components/game-art.tsx`: original vector artwork.
- `src/components/game-dialogs.tsx`: setup, invitations, rules, and leaving.
- `src/components/game-results.tsx`: final scores and rematch.
- `src/components/ui/`: shadcn primitives.

## Experience references

The experience upgrades draw on [Board Game Arena’s UX guidelines](https://en.doc.boardgamearena.com/images/5/57/Guidelines_UX_new_compressed.pdf) for clear available actions, meaningful feedback, and mobile navigation; its [interactive tutorial approach](https://en.boardgamearena.com/news?id=572) for learning through decisions; and [NN/g’s usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) for visible status, recognition, and error prevention.

The bid/pass comparison, private portfolio, contextual phone shortcut, and personal sale highlight apply those principles to For Sale. They preserve the existing rules and information boundary: there is no opponent ownership log, automatic move, or revealed selling choice before everyone locks in.
