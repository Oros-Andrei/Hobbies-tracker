import { Capacitor } from '@capacitor/core';
import type { Snapshot } from './types';

// Android loads its native SQLite adapter; browsers load IndexedDB only.
const adapter = Capacitor.getPlatform() === 'android'
  ? import('./storage.android') : import('./storage.web');

export async function readSnapshot(): Promise<Snapshot> { return (await adapter).readSnapshot(); }
export async function writeSnapshot(snapshot: Snapshot): Promise<void> { return (await adapter).writeSnapshot(snapshot); }
