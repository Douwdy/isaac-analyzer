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

export default function Dashboard({ derived, activeTab, setActiveTab, onReset }) {
  const t = useLang();

  const tabs = [
    { id: 'overview',     icon: iconOverview,     label: t.tabOverview },
    { id: 'achievements', icon: iconAchievement,  label: t.tabAchievements },
    { id: 'challenges',   icon: iconChallenges,   label: t.tabChallenges },
    { id: 'characters',   icon: iconCharacter,    label: t.tabCharacters },
    { id: 'collectibles', icon: iconCollectables, label: t.tabCollectibles },
  ];

  return (
    <>
      {derived.source === 'steam' && (
        <div className="steam-source-badge">
          {t.steamBadge(derived.displayId ?? derived.steamId)}
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
      </div>
    </>
  );
}
