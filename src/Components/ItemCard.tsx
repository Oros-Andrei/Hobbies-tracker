import Button from './Button';
import MediaIcon from './MediaIcon';
import Select from './Select';
import { formatDuration, progressUnit } from '../Resources/mediaLogic';
import { KIND_SINGULAR, STATUS_LABELS, type MediaItem, type MediaStatus } from '../Resources/types';

interface Props {
  item: MediaItem;
  onProgress: (item: MediaItem) => void;
  onEdit: (item: MediaItem) => void;
  onStatus: (item: MediaItem, status: Exclude<MediaStatus, 'completed'>) => void;
  onRemove: (item: MediaItem) => void;
  compact?: boolean;
}

const statusOptions = (['planned', 'in-progress', 'dropped'] as const)
  .map(value => ({ value, label: STATUS_LABELS[value] }));

// Keep item art readable even when no catalog image exists.
export default function ItemCard({ item, onProgress, onEdit, onStatus, onRemove, compact = false }: Props) {
  const percent = Math.round(item.progress / item.total * 100);
  return <article className={`item-card item-card--${item.kind} ${compact ? 'item-card--compact' : ''}`}>
    <div className="item-card__art">
      {/* Real book covers win; category artwork fills entries without a cover. */}
      {item.kind === 'book' && item.coverUrl ? <img src={item.coverUrl} alt="" loading="lazy" /> :
        <MediaIcon name={item.kind} size={88} className="item-card__fallback-icon" />}
    </div>
    <div className="item-card__body">
      <div className="item-card__topline"><span>{KIND_SINGULAR[item.kind]}</span><span>{STATUS_LABELS[item.status]}</span></div>
      <h3>{item.title}</h3>
      {item.author && <p className="item-card__author">{item.author}</p>}
      <p className="item-card__count">{item.kind === 'movie'
        ? `${formatDuration(item.progress)} / ${formatDuration(item.total)}`
        : `${item.progress} / ${item.total} ${progressUnit(item.kind)}`}</p>
      <div className="progress-track" role="progressbar" aria-label={`${item.title} progress`} aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={item.total}>
        <span style={{ width: `${percent}%` }} />
      </div>
      <div className="item-card__actions">
        {item.status !== 'completed' && <Button variant="primary" onClick={() => onProgress(item)}>Update</Button>}
        <Button variant="quiet" onClick={() => onEdit(item)}>Edit</Button>
        {/* Keep status options proportional to the compact card control. */}
        {item.status === 'completed' ? <span className="item-card__finished">Completed</span> : <Select compact
          ariaLabel={`Change status for ${item.title}`} value={item.status} options={statusOptions}
          onChange={status => onStatus(item, status)} />}
        <Button variant="quiet" className="item-card__remove" onClick={() => onRemove(item)} aria-label={`Remove ${item.title}`}>Remove</Button>
      </div>
    </div>
  </article>;
}
