import BarChart from '../Components/BarChart';
import { formatDuration } from '../Resources/mediaLogic';
import { categoryStats, monthlyActivity } from '../Resources/stats';
import { KIND_LABELS, type MediaKind, type Snapshot } from '../Resources/types';

interface Props { snapshot: Snapshot }
const VIDEO_KINDS: MediaKind[] = ['movie', 'series', 'anime', 'animation'];

// Show category totals independently so pages and watch minutes never mix.
export default function StatisticsTab({ snapshot }: Props) {
  const books = categoryStats(snapshot, 'book');
  const movies = categoryStats(snapshot, 'movie');
  return <>
    <div className="page-header"><div><span className="eyebrow">ACTIVITY // INSIGHTS</span><h1>Statistics</h1><p>What you read and watched, measured over time.</p></div></div>
    <div className="stat-grid"><div className="stat-card"><span>BOOKS</span><strong>{books.pages.toLocaleString()}</strong><small>pages read</small></div>
      <div className="stat-card stat-card--magenta"><span>MOVIES</span><strong>{movies.completed}</strong><small>completed</small></div>
      <div className="stat-card"><span>MOVIE WATCH TIME</span><strong>{formatDuration(movies.minutes)}</strong><small>actual time logged</small></div></div>
    <div className="chart-grid"><BarChart title="Pages read" points={monthlyActivity(snapshot, 'book')} unit="pages" /><BarChart title="Movie watch time" points={monthlyActivity(snapshot, 'movie')} unit="minutes" /></div>
    <section className="section"><div className="section-heading"><h2>Shows</h2><span>BY CATEGORY</span></div><div className="stat-grid">
      {VIDEO_KINDS.filter(kind => kind !== 'movie').map(kind => {
        const data = categoryStats(snapshot, kind);
        return <div className="stat-card" key={kind}><span>{KIND_LABELS[kind].toUpperCase()}</span><strong>{data.completed} completed</strong><small>{formatDuration(data.minutes)} watched</small></div>;
      })}
    </div></section>
    <p className="statistics-note">Time totals use the actual minutes you enter with each progress update.</p>
  </>;
}
