import { useState, type FormEvent } from 'react';
import Button from './Button';
import Select from './Select';
import { getEditionPages, searchBooks, type BookSearchResult } from '../Resources/openLibrary';
import { localDateKey } from '../Resources/mediaLogic';
import { KIND_SINGULAR, STATUS_LABELS, type MediaItem, type MediaKind, type MediaStatus } from '../Resources/types';

export interface ItemDraft {
  kind: MediaKind; title: string; author?: string; total: number;
  status: MediaStatus; coverUrl?: string; openLibraryKey?: string;
  completionDate?: string; minutesSpent?: number;
}

interface Props {
  initialKind: MediaKind;
  item?: MediaItem;
  onSave: (draft: ItemDraft) => Promise<void>;
  onClose: () => void;
}

const statusOptions = (['planned', 'in-progress', 'completed', 'dropped'] as const)
  .map(value => ({ value, label: STATUS_LABELS[value] }));

// Keep manual entry available even when book lookup is offline or incomplete.
export default function ItemForm({ initialKind, item, onSave, onClose }: Props) {
  // A new entry stays in the library category from which it was opened.
  const kind = item?.kind ?? initialKind;
  const [title, setTitle] = useState(item?.title ?? '');
  const [author, setAuthor] = useState(item?.author ?? '');
  const [total, setTotal] = useState(String(item?.total ?? ''));
  const [status, setStatus] = useState<MediaStatus>(item?.status ?? 'planned');
  const [completionDate, setCompletionDate] = useState(localDateKey());
  const [minutesSpent, setMinutesSpent] = useState('');
  const [coverUrl, setCoverUrl] = useState(item?.coverUrl);
  const [openLibraryKey, setOpenLibraryKey] = useState(item?.openLibraryKey);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function search(event: FormEvent) {
    event.preventDefault(); setError(''); setBusy(true);
    try { setResults(await searchBooks(query)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Book search failed.'); }
    finally { setBusy(false); }
  }

  async function selectBook(result: BookSearchResult) {
    setTitle(result.title); setAuthor(result.author); setCoverUrl(result.coverUrl); setOpenLibraryKey(result.key);
    setResults([]);
    try {
      const pages = await getEditionPages(result.editionKey);
      if (pages) setTotal(String(pages));
    } catch { /* Missing edition details can always be entered manually. */ }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setBusy(true);
    try { await onSave({ kind, title, author, total: Number(total), status, coverUrl, openLibraryKey,
      ...(status === 'completed' && !item ? { completionDate, minutesSpent: kind === 'book' ? 0 : Number(minutesSpent) } : {}),
    }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'The item could not be saved.'); }
    finally { setBusy(false); }
  }

  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="item-form-title">
      <div className="modal__header"><div><span className="eyebrow">LIBRARY ENTRY</span><h2 id="item-form-title">{item ? 'Edit item' : `Add ${KIND_SINGULAR[kind].toLowerCase()}`}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div>
      {!item && kind === 'book' && <form className="lookup" onSubmit={search}>
        <label htmlFor="book-query">Find a book on Open Library</label>
        <div className="lookup__row"><input id="book-query" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by title" /><Button type="submit" disabled={busy || !query.trim()}>Search</Button></div>
        {/* Use the cover already supplied by Open Library to identify editions in search. */}
        {results.length > 0 && <div className="lookup__results">{results.map(result => <button type="button" key={result.key} onClick={() => void selectBook(result)}>
          {result.coverUrl ? <img src={result.coverUrl} alt="" loading="lazy" /> : <span className="lookup__cover-placeholder" aria-hidden="true">▤</span>}
          <span className="lookup__result-copy"><strong>{result.title}</strong><span>{result.author || 'Unknown author'}</span></span>
        </button>)}</div>}
      </form>}
      <form className="field-form" onSubmit={submit}>
        {/* Status remains editable while the library controls the entry category. */}
        <label>Title<input value={title} onChange={event => setTitle(event.target.value)} required maxLength={160} placeholder={kind === 'book' ? 'Book title' : 'Title'} /></label>
        {kind === 'book' && <label>Author<input value={author} onChange={event => setAuthor(event.target.value)} maxLength={120} placeholder="Author" /></label>}
        <label>{kind === 'book' ? 'Total pages' : kind === 'movie' ? 'Runtime in minutes' : 'Total episodes'}
          <input type="number" min="1" step="1" value={total} onChange={event => setTotal(event.target.value)} required /></label>
        {!item && <div className="field-form__field"><span>Starting status</span><Select ariaLabel="Starting status" value={status}
          onChange={setStatus} options={statusOptions} /></div>}
        {!item && status === 'completed' && <label>Completion date<input type="date" value={completionDate} onChange={event => setCompletionDate(event.target.value)} required /></label>}
        {!item && status === 'completed' && kind !== 'book' && <label>Actual minutes watched<input type="number" min="0" step="1" value={minutesSpent} onChange={event => setMinutesSpent(event.target.value)} required /></label>}
        <p className="field-form__hint">{kind === 'book' ? 'Confirm the page count for your edition.' : 'Video details are entered manually for now.'}</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal__actions"><Button type="button" variant="quiet" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" disabled={busy}>{busy ? 'Saving…' : 'Save item'}</Button></div>
      </form>
    </section>
  </div>;
}
