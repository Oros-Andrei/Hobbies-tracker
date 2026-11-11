import { useEffect, useRef, useState } from 'react';
import AppShell, { type View } from './Components/AppShell';
import ItemForm, { type ItemDraft } from './Components/ItemForm';
import ProgressForm from './Components/ProgressForm';
import DashboardTab from './Tabs/DashboardTab';
import LibraryTab from './Tabs/LibraryTab';
import SettingsTab from './Tabs/SettingsTab';
import StatisticsTab from './Tabs/StatisticsTab';
import { addItem, editItem, emptySnapshot, recordProgress, removeItem, setItemStatus } from './Resources/mediaLogic';
import { readSnapshot, writeSnapshot } from './Resources/storage';
import type { MediaItem, MediaKind, MediaStatus, Snapshot } from './Resources/types';

export default function App() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loadError, setLoadError] = useState('');
  const [view, setView] = useState<View>('home');
  const [kind, setKind] = useState<MediaKind>('book');
  const [itemForm, setItemForm] = useState<{ kind: MediaKind; item?: MediaItem } | null>(null);
  const [progressItem, setProgressItem] = useState<MediaItem | null>(null);
  const snapshotRef = useRef(emptySnapshot());
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    let live = true;
    readSnapshot().then(value => { if (live) { snapshotRef.current = value; setSnapshot(value); } })
      .catch(error => { if (live) setLoadError(error instanceof Error ? error.message : 'Saved data could not be loaded.'); });
    return () => { live = false; };
  }, []);

  // Serialize UI changes through storage before displaying them as saved.
  function commit(change: (current: Snapshot) => Snapshot): Promise<void> {
    const result = queueRef.current.then(async () => {
      const next = change(snapshotRef.current);
      await writeSnapshot(next);
      snapshotRef.current = next;
      setSnapshot(next);
    });
    queueRef.current = result.catch(() => undefined);
    return result;
  }

  function navigate(next: View, selected?: MediaKind) {
    setView(next);
    if (selected) setKind(selected);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveItem(draft: ItemDraft) {
    await commit(current => itemForm?.item
      ? editItem(current, itemForm.item.id, draft)
      : addItem(current, draft));
    setItemForm(null);
    navigate('library', draft.kind);
  }

  async function saveProgress(to: number, date: string, minutes: number) {
    if (!progressItem) return;
    await commit(current => recordProgress(current, progressItem.id, to, date, minutes));
    setProgressItem(null);
  }

  function changeStatus(item: MediaItem, status: Exclude<MediaStatus, 'completed'>) {
    void commit(current => setItemStatus(current, item.id, status)).catch(error => window.alert(error instanceof Error ? error.message : 'Status could not be saved.'));
  }

  function deleteItem(item: MediaItem) {
    if (!window.confirm(`Remove ${item.title} and all its progress history?`)) return;
    void commit(current => removeItem(current, item.id)).catch(error => window.alert(error instanceof Error ? error.message : 'Item could not be removed.'));
  }

  if (loadError) return <div className="startup-message"><h1>Saved data could not be opened</h1><p>{loadError}</p><button onClick={() => window.location.reload()}>Retry</button></div>;
  if (!snapshot) return <div className="startup-message"><span className="eyebrow">HOBBIES TRACKER</span><h1>Loading your library…</h1></div>;

  const cardActions = {
    onProgress: setProgressItem, onEdit: (item: MediaItem) => setItemForm({ kind: item.kind, item }),
    onStatus: changeStatus, onRemove: deleteItem,
  };

  // New entries are created only from the category currently open in the library.
  return <AppShell view={view} selectedKind={kind} onNavigate={navigate}>
    {view === 'home' && <DashboardTab snapshot={snapshot} onCategory={selected => navigate('library', selected)} {...cardActions} />}
    {view === 'library' && <LibraryTab snapshot={snapshot} kind={kind} onKind={setKind} onAdd={() => setItemForm({ kind })} {...cardActions} />}
    {view === 'stats' && <StatisticsTab snapshot={snapshot} />}
    {view === 'settings' && <SettingsTab snapshot={snapshot} onImport={incoming => commit(() => incoming)} />}
    {itemForm && <ItemForm key={itemForm.item?.id ?? `new-${itemForm.kind}`} initialKind={itemForm.kind} item={itemForm.item} onSave={saveItem} onClose={() => setItemForm(null)} />}
    {progressItem && <ProgressForm key={progressItem.id} item={progressItem} onSave={saveProgress} onClose={() => setProgressItem(null)} />}
  </AppShell>;
}
