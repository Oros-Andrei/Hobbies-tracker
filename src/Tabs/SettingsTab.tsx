import { useRef, useState, type ChangeEvent } from 'react';
import { Capacitor } from '@capacitor/core';
import Button from '../Components/Button';
import { createBackup, parseBackup } from '../Resources/backup';
import { localDateKey } from '../Resources/mediaLogic';
import type { Snapshot } from '../Resources/types';

interface Props { snapshot: Snapshot; onImport: (snapshot: Snapshot) => Promise<void> }

// JSON backups remain portable even though browser and Android use different stores.
export default function SettingsTab({ snapshot, onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function exportData() {
    setBusy(true); setMessage('');
    try {
      const text = `${JSON.stringify(createBackup(snapshot), null, 2)}\n`;
      const filename = `hobbies-tracker-${localDateKey()}.json`;
      if (Capacitor.getPlatform() === 'android') {
        const [{ Directory, Encoding, Filesystem }, { Share }] = await Promise.all([
          import('@capacitor/filesystem'), import('@capacitor/share'),
        ]);
        const file = await Filesystem.writeFile({ path: filename, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
        await Share.share({ title: 'Hobbies Tracker backup', url: file.uri, dialogTitle: 'Save or share backup' });
      } else {
        const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
        const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setMessage('Backup ready. Keep the JSON file somewhere safe.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Export failed.'); }
    finally { setBusy(false); }
  }

  async function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    setBusy(true); setMessage('');
    try {
      const incoming = parseBackup(JSON.parse(await file.text()) as unknown);
      if (!window.confirm(`Replace this device's ${snapshot.items.length} items with ${incoming.items.length} items from the backup? This also replaces progress history.`)) return;
      await onImport(incoming);
      setMessage(`Imported ${incoming.items.length} items and ${incoming.events.length} progress updates.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Import failed. Your data was not changed.'); }
    finally { setBusy(false); }
  }

  return <>
    <div className="page-header"><div><span className="eyebrow">SYSTEM // LOCAL DATA</span><h1>Settings</h1><p>Your library stays on this device.</p></div></div>
    <section className="settings-panel"><div><span className="eyebrow">BACKUP</span><h2>Move or protect your library</h2><p>Export a JSON file to save your items and dated progress. Importing a file replaces this device's library after confirmation.</p></div>
      <div className="settings-panel__actions"><Button variant="primary" onClick={() => void exportData()} disabled={busy}>Export JSON</Button><Button onClick={() => inputRef.current?.click()} disabled={busy}>Import JSON</Button></div>
      <input ref={inputRef} className="visually-hidden" type="file" accept=".json,application/json" onChange={event => void importData(event)} />
      {message && <p className="settings-panel__message" role="status">{message}</p>}
    </section>
    <section className="settings-panel"><div><span className="eyebrow">DATA SOURCES</span><h2>Book lookup</h2><p>Book search uses Open Library when you ask for it. Movies and shows are added manually.</p></div></section>
  </>;
}
