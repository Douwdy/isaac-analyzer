import { useState } from 'react';
import { useLang } from '../context/LangContext.jsx';
import DeadGodProgress from './DeadGodProgress.jsx';
import OverviewTab from './overview/OverviewTab.jsx';
import AchievementsTab from './achievements/AchievementsTab.jsx';
import ChallengesTab from './challenges/ChallengesTab.jsx';
import CharactersTab from './characters/CharactersTab.jsx';
import CollectiblesTab from './collectibles/CollectiblesTab.jsx';
import {
  iconOverview, iconAchievement, iconChallenges, iconCharacter, iconCollectables,
} from '../utils/sprites.js';

const B62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function encodeShare(unlockedIds) {
  const bytes = new Uint8Array(Math.ceil(641 / 8));
  for (let id = 1; id <= 641; id++) {
    if (unlockedIds.has(id)) bytes[(id - 1) >> 3] |= 1 << ((id - 1) & 7);
  }
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  let result = '';
  while (n > 0n) { result = B62[Number(n % 62n)] + result; n /= 62n; }
  return result.padStart(109, '0');
}

export default function Dashboard({ derived, activeTab, setActiveTab, onReset }) {
  const t = useLang();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const encoded = encodeShare(derived.unlockedIds);
    const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
    history.replaceState(null, '', `#share=${encoded}`);
    try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'overview',     icon: iconOverview,     label: t.tabOverview },
    { id: 'achievements', icon: iconAchievement,  label: t.tabAchievements },
    { id: 'challenges',   icon: iconChallenges,   label: t.tabChallenges },
    { id: 'characters',   icon: iconCharacter,    label: t.tabCharacters },
    derived.source !== 'shared' && { id: 'collectibles', icon: iconCollectables, label: t.tabCollectibles },
  ].filter(Boolean);

  return (
    <>
      {derived.source === 'steam' && (
        <div className="steam-source-badge">
          {t.steamBadge(derived.displayId ?? derived.steamId)}
        </div>
      )}
      {derived.source === 'shared' && (
        <div className="steam-source-badge steam-source-badge--shared">
          {t.sharedSaveBadge}
        </div>
      )}
      <DeadGodProgress derived={derived} />

      <nav className="tab-nav">
        {tabs.map(tab => (
          <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.icon && <img src={tab.icon} className="tab-icon" draggable="false" />}
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="tab-content" key={activeTab}>
        {activeTab === 'overview'     && <OverviewTab derived={derived} />}
        {activeTab === 'achievements' && <AchievementsTab derived={derived} />}
        {activeTab === 'challenges'   && <ChallengesTab derived={derived} />}
        {activeTab === 'characters'   && <CharactersTab derived={derived} />}
        {activeTab === 'collectibles' && <CollectiblesTab derived={derived} />}
      </div>

      <div className="reset-row">
        <button className="btn-secondary" onClick={onReset}>{t.loadAnother}</button>
        <button className={`btn-secondary btn-share${copied ? ' btn-share--copied' : ''}`} onClick={handleShare}>
          {copied ? t.shareCopied : t.shareBtn}
        </button>
      </div>
    </>
  );
}
