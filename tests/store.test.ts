import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { makePlayer, makeRoom } from "../src/lib/game";
import { insert, read, save, transaction } from "../src/lib/store";
const dir = mkdtempSync(join(tmpdir(), "for-sale-test-"));
process.env.DATA_DIR = dir;
after(() => rmSync(dir, { recursive: true, force: true }));
test("rooms persist on disk and a code collision cannot overwrite another table", () => {
  const host = makePlayer("Host", 0);
  const room = makeRoom("ABCDEF", host, false);
  transaction(() => insert(room));
  const other = makeRoom("ABCDEF", makePlayer("Intruder", 0), false);
  assert.throws(() => transaction(() => insert(other)));
  assert.equal(read("ABCDEF").host, host.id);
  const independent = new DatabaseSync(join(dir, "rooms.sqlite"));
  const row = independent
    .prepare("SELECT state FROM rooms WHERE code=?")
    .get("ABCDEF") as { state: string };
  assert.equal(JSON.parse(row.state).host, host.id);
  independent.close();
});
test("failed transactions roll back all room changes", () => {
  const room = read("ABCDEF");
  const old = room.message;
  assert.throws(() =>
    transaction(() => {
      room.message = "Never committed";
      save(room);
      throw Error("simulate failure");
    }),
  );
  assert.equal(read("ABCDEF").message, old);
});
