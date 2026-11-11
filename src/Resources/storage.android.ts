import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite';
import { parseSnapshot } from './backup';
import type { MediaItem, ProgressEvent, Snapshot } from './types';

const NAME = 'hobbies_tracker';
const connection = new SQLiteConnection(CapacitorSQLite);
let database: Promise<SQLiteDBConnection> | undefined;
let pending: Promise<unknown> = Promise.resolve();

// Serialize native reads and writes so exports never catch a partial update.
function enqueue<T>(action: () => Promise<T>): Promise<T> {
  const result = pending.then(action);
  pending = result.catch(() => undefined);
  return result;
}

async function getDatabase(): Promise<SQLiteDBConnection> {
  if (!database) database = (async () => {
    const db = await connection.createConnection(NAME, false, 'no-encryption', 1, false);
    await db.open();
    await db.execute(`CREATE TABLE IF NOT EXISTS items (id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS progress_events (id TEXT PRIMARY KEY NOT NULL, item_id TEXT NOT NULL, payload TEXT NOT NULL);`);
    return db;
  })().catch(error => { database = undefined; throw error; });
  return database;
}

export function readSnapshot(): Promise<Snapshot> {
  return enqueue(async () => {
    const db = await getDatabase();
    const items = (await db.query('SELECT payload FROM items ORDER BY rowid')).values ?? [];
    const events = (await db.query('SELECT payload FROM progress_events ORDER BY rowid')).values ?? [];
    return parseSnapshot({
      items: items.map(row => JSON.parse(String(row.payload)) as MediaItem),
      events: events.map(row => JSON.parse(String(row.payload)) as ProgressEvent),
    });
  });
}

// Replace items and their dated history together or roll back both on failure.
export function writeSnapshot(snapshot: Snapshot): Promise<void> {
  const valid = parseSnapshot(snapshot);
  return enqueue(async () => {
    const db = await getDatabase();
    await db.beginTransaction();
    try {
      await db.execute('DELETE FROM progress_events; DELETE FROM items;', false);
      if (valid.items.length) await db.executeSet(valid.items.map(item => ({
        statement: 'INSERT INTO items (id, payload) VALUES (?, ?)', values: [item.id, JSON.stringify(item)],
      })), false);
      if (valid.events.length) await db.executeSet(valid.events.map(event => ({
        statement: 'INSERT INTO progress_events (id, item_id, payload) VALUES (?, ?, ?)',
        values: [event.id, event.itemId, JSON.stringify(event)],
      })), false);
      await db.commitTransaction();
    } catch (error) { await db.rollbackTransaction(); throw error; }
  });
}
