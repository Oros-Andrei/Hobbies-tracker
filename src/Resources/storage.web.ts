import { parseSnapshot } from './backup';
import { emptySnapshot } from './mediaLogic';
import type { Snapshot } from './types';

const DATABASE = 'hobbies-tracker';
const STORE = 'snapshots';

// Store the complete personal snapshot in one IndexedDB transaction.
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readSnapshot(): Promise<Snapshot> {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE, 'readonly').objectStore(STORE).get('current');
      request.onsuccess = () => {
        try { resolve(request.result === undefined ? emptySnapshot() : parseSnapshot(request.result)); }
        catch (error) { reject(error); }
      };
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

export async function writeSnapshot(snapshot: Snapshot): Promise<void> {
  const valid = parseSnapshot(snapshot);
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readwrite');
      transaction.objectStore(STORE).put(valid, 'current');
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { db.close(); }
}
