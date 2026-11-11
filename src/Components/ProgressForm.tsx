import { useState, type FormEvent } from 'react';
import Button from './Button';
import { formatDuration, localDateKey, progressUnit } from '../Resources/mediaLogic';
import type { MediaItem } from '../Resources/types';

interface Props { item: MediaItem; onSave: (to: number, date: string, minutes: number) => Promise<void>; onClose: () => void }

// Keep current position separate from actual watch time when they differ.
export default function ProgressForm({ item, onSave, onClose }: Props) {
  const [to, setTo] = useState(String(item.progress));
  const [date, setDate] = useState(localDateKey());
  const [minutes, setMinutes] = useState('0');
  const [minutesEdited, setMinutesEdited] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function changeProgress(value: string) {
    setTo(value);
    if (item.kind === 'movie' && !minutesEdited) setMinutes(String(Math.max(0, Number(value) - item.progress)));
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setBusy(true);
    try { await onSave(Number(to), date, item.kind === 'book' ? 0 : Number(minutes)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Progress could not be saved.'); }
    finally { setBusy(false); }
  }

  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="progress-title">
      <div className="modal__header"><div><span className="eyebrow">PROGRESS UPDATE</span><h2 id="progress-title">{item.title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div>
      <form className="field-form" onSubmit={submit}>
        <p className="field-form__hint">Currently {item.kind === 'movie' ? `${formatDuration(item.progress)} / ${formatDuration(item.total)}` : `${item.progress} / ${item.total} ${progressUnit(item.kind)}`}. Reaching the total marks this item Completed.</p>
        <label>{item.kind === 'book' ? 'Page reached' : item.kind === 'movie' ? 'Minute reached' : 'Total episodes watched'}
          <input type="number" min={item.progress} max={item.total} step="1" value={to} onChange={event => changeProgress(event.target.value)} required /></label>
        {item.kind !== 'book' && <label>Actual minutes watched this update<input type="number" min="0" step="1" value={minutes} onChange={event => { setMinutes(event.target.value); setMinutesEdited(true); }} required /></label>}
        <label>Date<input type="date" value={date} onChange={event => setDate(event.target.value)} required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal__actions"><Button type="button" variant="quiet" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" disabled={busy}>{busy ? 'Saving…' : 'Save progress'}</Button></div>
      </form>
    </section>
  </div>;
}
