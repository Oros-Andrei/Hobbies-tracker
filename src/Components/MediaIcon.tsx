import type { MediaKind } from '../Resources/types';
import animationIcon from '../Resources/icons/animation.png';
import animeIcon from '../Resources/icons/anime.png';
import bookIcon from '../Resources/icons/book.png';
import dashboardIcon from '../Resources/icons/dashboard.png';
import movieIcon from '../Resources/icons/movie.png';
import seriesIcon from '../Resources/icons/series.png';
import settingsIcon from '../Resources/icons/settings.png';
import statisticsIcon from '../Resources/icons/statistics.png';

export type MediaIconName = MediaKind | 'dashboard' | 'settings' | 'statistics';

interface Props {
  name: MediaIconName;
  size?: number;
  className?: string;
}

// One icon map keeps the approved neon artwork consistent across navigation and cards.
const ICONS: Record<MediaIconName, string> = {
  book: bookIcon,
  movie: movieIcon,
  series: seriesIcon,
  anime: animeIcon,
  animation: animationIcon,
  dashboard: dashboardIcon,
  settings: settingsIcon,
  statistics: statisticsIcon,
};

export default function MediaIcon({ name, size = 30, className = '' }: Props) {
  return <img src={ICONS[name]} alt="" aria-hidden="true" draggable={false}
    className={`media-icon ${className}`.trim()} style={{ width: size, height: size }} />;
}
