import { useState } from 'react';
import Button from '../Components/Button';
import ItemCard from '../Components/ItemCard';
import MediaIcon from '../Components/MediaIcon';
import Select from '../Components/Select';
import { KIND_LABELS, MEDIA_KINDS, STATUS_LABELS, type MediaItem, type MediaKind, type MediaStatus, type Snapshot } from '../Resources/types';

interface Props {
  snapshot: Snapshot; kind: MediaKind; onKind: (kind: MediaKind) => void; onAdd: () => void;
  onProgress: (item: MediaItem) => void; onEdit: (item: MediaItem) => void;
  onStatus: (item: MediaItem, status: Exclude<MediaStatus, 'completed'>) => void; onRemove: (item: MediaItem) => void;
}

// Each category keeps all four statuses while the dashboard stays focused.
export default function LibraryTab({ snapshot, kind, onKind, onAdd, onProgress, onEdit, onStatus, onRemove }: Props) {
  const [status, setStatus] = useState<MediaStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const items = snapshot.items.filter(item => item.kind === kind && (status === 'all' || item.status === status) && item.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.title.localeCompare(b.title));
  // The page-level Add action always uses the category selected here.
  return <>
    {/* Keep the selected medium visible in the library heading and empty state. */}
    <div className="page-header"><div><span className="eyebrow">LIBRARY</span><div className="library-title"><MediaIcon name={kind} size={58} /><h1>{KIND_LABELS[kind]}</h1></div><p>Track progress and revisit everything you have saved.</p></div><Button variant="primary" onClick={onAdd}>＋ Add item</Button></div>
    <div className="filter-row" role="group" aria-label="Media category">{MEDIA_KINDS.map(value => <button key={value} className={kind === value ? 'selected' : ''} onClick={() => onKind(value)}>{KIND_LABELS[value]}</button>)}</div>
    <div className="library-controls"><input aria-label="Search saved items" placeholder="Search your library…" value={query} onChange={event => setQuery(event.target.value)} />
      {/* Match the library filter to the shared custom dropdown. */}
      <Select ariaLabel="Filter by status" value={status} onChange={setStatus}
        options={[{ value: 'all', label: 'All statuses' },
          ...(['planned', 'in-progress', 'completed', 'dropped'] as const).map(value => ({ value, label: STATUS_LABELS[value] }))]} /></div>
    {items.length ? <div className="item-grid">{items.map(item => <ItemCard key={item.id} item={item} onProgress={onProgress} onEdit={onEdit} onStatus={onStatus} onRemove={onRemove} />)}</div> :
      <div className="empty-state"><MediaIcon name={kind} size={56} /><h3>No matching items</h3><p>Try another filter or use Add item to add to {KIND_LABELS[kind].toLowerCase()}.</p></div>}
  </>;
}
