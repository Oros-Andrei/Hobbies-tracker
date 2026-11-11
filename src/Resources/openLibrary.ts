export interface BookSearchResult {
  key: string;
  title: string;
  author: string;
  coverUrl?: string;
  editionKey?: string;
}

let requestQueue: Promise<unknown> = Promise.resolve();
let nextRequestAt = 0;

// Pace a search followed by edition lookup within Open Library's public limit.
function pacedFetch(url: string | URL, options?: RequestInit): Promise<Response> {
  const result = requestQueue.then(async () => {
    const delay = Math.max(0, nextRequestAt - Date.now());
    if (delay) await new Promise(resolve => window.setTimeout(resolve, delay));
    nextRequestAt = Date.now() + 1100;
    return fetch(url, options);
  });
  requestQueue = result.catch(() => undefined);
  return result;
}

// Search only on submit so a personal library does not make requests per keystroke.
export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  if (!query.trim()) return [];
  const url = new URL('https://openlibrary.org/search.json');
  url.searchParams.set('title', query.trim());
  url.searchParams.set('fields', 'key,title,author_name,cover_i,edition_key');
  url.searchParams.set('limit', '8');
  const response = await pacedFetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Book search is unavailable. You can add the book manually.');
  const body = await response.json() as { docs?: unknown[] };
  if (!Array.isArray(body.docs)) throw new Error('Book search returned an unexpected result.');
  return body.docs.flatMap((raw): BookSearchResult[] => {
    if (!raw || typeof raw !== 'object') return [];
    const doc = raw as Record<string, unknown>;
    if (typeof doc.key !== 'string' || typeof doc.title !== 'string') return [];
    return [{
      key: doc.key, title: doc.title,
      author: Array.isArray(doc.author_name) && typeof doc.author_name[0] === 'string' ? doc.author_name[0] : '',
      ...(typeof doc.cover_i === 'number' ? { coverUrl: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` } : {}),
      ...(Array.isArray(doc.edition_key) && typeof doc.edition_key[0] === 'string' ? { editionKey: doc.edition_key[0] } : {}),
    }];
  });
}

// Page counts belong to editions; let the user fill or correct a missing count.
export async function getEditionPages(editionKey?: string): Promise<number | undefined> {
  if (!editionKey || !/^OL\d+M$/.test(editionKey)) return undefined;
  const response = await pacedFetch(`https://openlibrary.org/books/${editionKey}.json`);
  if (!response.ok) return undefined;
  const body = await response.json() as { number_of_pages?: unknown };
  return Number.isInteger(body.number_of_pages) && (body.number_of_pages as number) > 0 ? body.number_of_pages as number : undefined;
}
