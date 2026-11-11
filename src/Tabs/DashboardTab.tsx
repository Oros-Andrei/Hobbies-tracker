import ItemCard from '../Components/ItemCard';
import MediaIcon from '../Components/MediaIcon';
import { KIND_LABELS, MEDIA_KINDS, type MediaItem, type MediaKind, type MediaStatus, type Snapshot } from '../Resources/types';

interface Props {
  snapshot: Snapshot;
  onCategory: (kind: MediaKind) => void;
  onProgress: (item: MediaItem) => void;
  onEdit: (item: MediaItem) => void;
  onStatus: (item: MediaItem, status: Exclude<MediaStatus, 'completed'>) => void;
  onRemove: (item: MediaItem) => void;
}

// The front page shows only actively tracked items, as requested.
export default function DashboardTab({ snapshot, onCategory, onProgress, onEdit, onStatus, onRemove }: Props) {
  const active = snapshot.items.filter(item => item.status === 'in-progress');
  return <>
    <div className="page-header"><div><span className="eyebrow">OVERVIEW // LIVE</span><h1>Dashboard</h1><p>Your current stories, all in one place.</p></div><div className="page-header__metric"><strong>{active.length}</strong><span>in progress</span></div></div>
    <section className="section"><div className="section-heading"><h2>Continue</h2><span>ACTIVE ITEMS</span></div>
      {/* Choose a category before creating an item. */}
      {active.length ? <div className="item-grid">{active.map(item => <ItemCard key={item.id} item={item} compact onProgress={onProgress} onEdit={onEdit} onStatus={onStatus} onRemove={onRemove} />)}</div> :
        <div className="empty-state"><MediaIcon name="dashboard" size={56} /><h3>Nothing in progress yet</h3><p>Choose a library category below to add your first item.</p></div>}
    </section>
    <section className="section"><div className="section-heading"><h2>Library</h2><span>CATEGORIES</span></div><div className="category-grid">
      {MEDIA_KINDS.map(kind => <button className={`category-tile category-tile--${kind}`} key={kind} onClick={() => onCategory(kind)}>
        {/* Category tiles identify each medium with its matching generated icon. */}
        <MediaIcon name={kind} size={60} className="category-tile__icon" /><strong>{KIND_LABELS[kind]}</strong><small>{snapshot.items.filter(item => item.kind === kind).length} items</small>
      </button>)}
    </div></section>
  </>;
}
