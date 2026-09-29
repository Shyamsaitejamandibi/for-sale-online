import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Room } from "./game";
const globalDb = globalThis as unknown as { forSaleDb?: DatabaseSync };
function database() {
  if (!globalDb.forSaleDb) {
    const dir = process.env.DATA_DIR || join(process.cwd(), ".data");
    mkdirSync(dir, { recursive: true });
    const db = new DatabaseSync(join(dir, "rooms.sqlite"));
    db.exec(
      "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS rooms (code TEXT PRIMARY KEY, state TEXT NOT NULL, updated INTEGER NOT NULL)",
    );
    globalDb.forSaleDb = db;
  }
  return globalDb.forSaleDb;
}
// Creation must never replace an existing table, even in a code collision.
export function insert(room: Room) {
  database()
    .prepare("INSERT INTO rooms VALUES (?, ?, ?)")
    .run(room.code, JSON.stringify(room), room.updatedAt);
}
export function save(room: Room) {
  room.updatedAt = Date.now();
  database()
    .prepare(
      "INSERT INTO rooms VALUES (?, ?, ?) ON CONFLICT(code) DO UPDATE SET state=excluded.state, updated=excluded.updated",
    )
    .run(room.code, JSON.stringify(room), room.updatedAt);
}
export function read(code: string): Room {
  const row = database()
    .prepare("SELECT state FROM rooms WHERE code=?")
    .get(code) as { state: string } | undefined;
  if (!row) throw Error("Table not found. Check your room code.");
  return JSON.parse(row.state);
}
export function transaction<T>(fn: () => T): T {
  const db = database();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
