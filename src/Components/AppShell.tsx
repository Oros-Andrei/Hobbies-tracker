import type { ReactNode } from 'react';
import MediaIcon from './MediaIcon';
import { KIND_LABELS, MEDIA_KINDS, type MediaKind } from '../Resources/types';
import desktopLitFrame from '../Resources/backgrounds/cyberpunk-city-desktop-lit.png';
import mobileLitFrame from '../Resources/backgrounds/cyberpunk-city-mobile-lit.png';

export type View = 'home' | 'library' | 'stats' | 'settings';

interface Props {
  view: View;
  selectedKind: MediaKind;
  onNavigate: (view: View, kind?: MediaKind) => void;
  children: ReactNode;
}

// A sidebar on wide screens and a bottom bar on phones share the same views.
export default function AppShell({ view, selectedKind, onNavigate, children }: Props) {
  return <div className="app-shell">
    {/* Fade only motorcycle and city lights over the still artwork. */}
    <div className="app-ambience" aria-hidden="true">
      <div className="app-ambience__scene">
        <svg className="app-ambience__details app-ambience__details--desktop"
          viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="desktop-detail-feather" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="24" />
            </filter>
            <mask id="desktop-detail-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"
              x="0" y="0" width="1672" height="941">
              <ellipse cx="1565" cy="543" rx="84" ry="28" fill="white" filter="url(#desktop-detail-feather)" />
              <ellipse cx="1560" cy="653" rx="85" ry="91" fill="white" filter="url(#desktop-detail-feather)" />
              <ellipse cx="1445" cy="562" rx="40" ry="49" fill="white" filter="url(#desktop-detail-feather)" />
              <ellipse cx="600" cy="480" rx="120" ry="95" fill="white" filter="url(#desktop-detail-feather)" />
              <ellipse cx="900" cy="360" rx="160" ry="125" fill="white" filter="url(#desktop-detail-feather)" />
              <ellipse cx="1190" cy="150" rx="130" ry="120" fill="white" filter="url(#desktop-detail-feather)" />
              <ellipse cx="1110" cy="500" rx="140" ry="110" fill="white" filter="url(#desktop-detail-feather)" />
              <ellipse cx="1575" cy="290" rx="55" ry="85" fill="white" filter="url(#desktop-detail-feather)" />
            </mask>
          </defs>
          <image href={desktopLitFrame} width="1672" height="941" mask="url(#desktop-detail-mask)" />
        </svg>
        <svg className="app-ambience__details app-ambience__details--mobile"
          viewBox="0 0 1024 1536" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="mobile-detail-feather" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="24" />
            </filter>
            <mask id="mobile-detail-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"
              x="0" y="0" width="1024" height="1536">
              <ellipse cx="100" cy="1066" rx="90" ry="40" fill="white" filter="url(#mobile-detail-feather)" />
              <ellipse cx="150" cy="1225" rx="75" ry="110" fill="white" filter="url(#mobile-detail-feather)" />
              <ellipse cx="440" cy="1210" rx="70" ry="100" fill="white" filter="url(#mobile-detail-feather)" />
              <ellipse cx="840" cy="560" rx="100" ry="140" fill="white" filter="url(#mobile-detail-feather)" />
              <ellipse cx="625" cy="830" rx="140" ry="125" fill="white" filter="url(#mobile-detail-feather)" />
              <ellipse cx="890" cy="905" rx="115" ry="110" fill="white" filter="url(#mobile-detail-feather)" />
              <ellipse cx="480" cy="960" rx="110" ry="90" fill="white" filter="url(#mobile-detail-feather)" />
            </mask>
          </defs>
          <image href={mobileLitFrame} width="1024" height="1536" mask="url(#mobile-detail-mask)" />
        </svg>
      </div>
    </div>
    <aside className="sidebar">
      <div className="brand"><span className="brand__mark">╱╱</span><span>Hobbies Tracker</span></div>
      <nav aria-label="Main navigation">
        {/* Reuse the same category artwork in desktop and mobile navigation. */}
        <button className={view === 'home' ? 'active' : ''} onClick={() => onNavigate('home')}><MediaIcon name="dashboard" /><span>Dashboard</span></button>
        <div className="sidebar__caption">LIBRARY</div>
        {MEDIA_KINDS.map(kind => <button key={kind} className={view === 'library' && selectedKind === kind ? 'active' : ''}
          onClick={() => onNavigate('library', kind)}><MediaIcon name={kind} /><span>{KIND_LABELS[kind]}</span></button>)}
        <div className="sidebar__caption">TOOLS</div>
        <button className={view === 'stats' ? 'active' : ''} onClick={() => onNavigate('stats')}><MediaIcon name="statistics" /><span>Statistics</span></button>
        <button className={view === 'settings' ? 'active' : ''} onClick={() => onNavigate('settings')}><MediaIcon name="settings" /><span>Settings</span></button>
      </nav>
      <p className="sidebar__footer">YOUR PRIVATE MEDIA LOG</p>
    </aside>
    <div className="app-shell__main">
      {/* Add actions now live inside the selected library section. */}
      <main className="content">{children}</main>
    </div>
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <button className={view === 'home' ? 'active' : ''} onClick={() => onNavigate('home')}><MediaIcon name="dashboard" size={34} />Home</button>
      <button className={view === 'library' ? 'active' : ''} onClick={() => onNavigate('library')}><MediaIcon name={selectedKind} size={34} />Library</button>
      <button className={view === 'stats' ? 'active' : ''} onClick={() => onNavigate('stats')}><MediaIcon name="statistics" size={34} />Stats</button>
      <button className={view === 'settings' ? 'active' : ''} onClick={() => onNavigate('settings')}><MediaIcon name="settings" size={34} />Settings</button>
    </nav>
  </div>;
}
