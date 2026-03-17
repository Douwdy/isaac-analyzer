import { useState, useMemo } from 'react';
import { useLang } from '../../context/LangContext.jsx';
import { wikiUrl, achIconUrl } from '../../utils/urls.js';

export default function AchievementsTab({ derived }) {
  const t = useLang();
  const { achievementsList } = derived;
  const [filter, setFilter] = useState('locked');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return achievementsList.filter(a => {
      if (filter === 'locked'   && a.unlocked)  return false;
      if (filter === 'unlocked' && !a.unlocked) return false;
      if (!q) return true;
      return a.name.toLowerCase().includes(q) || a.unlockDescription?.toLowerCase().includes(q);
    });
  }, [achievementsList, filter, search]);

  return (
    <div>
      <div className="filter-row">
        {[['all', t.filterAll], ['locked', t.filterLocked], ['unlocked', t.filterUnlocked]].map(([f, label]) => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {label}
          </button>
        ))}
        <input
          className="coll-search-input"
          placeholder={t.collSearch}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="filter-count">{t.achievementCount(filtered.length)}</span>
        <a className="tips-btn" href="https://bindingofisaacrebirth.wiki.gg/wiki/Achievement_Tips" target="_blank" rel="noopener noreferrer">{t.achievementTips}</a>
      </div>
      <div className="achievement-list" key={filter + '|' + search}>
        {filtered.map((a, i) => (
          <a key={a.id} className={`achievement-row ${a.unlocked ? 'unlocked' : 'locked'}`}
             style={{ animationDelay: `${Math.min(i, 14) * 30}ms` }}
             href={wikiUrl(a.name)} target="_blank" rel="noopener noreferrer">
            <div className="ach-icon">
              <img
                src={achIconUrl(a.name)}
                alt=""
                loading="lazy"
                onError={e => { e.currentTarget.style.visibility = 'hidden'; }}
              />
            </div>
            <span className="ach-status">{a.unlocked ? '✓' : '✗'}</span>
            <span className="ach-id">#{a.id}</span>
            <div className="ach-info">
              <span className="ach-name">{a.name}</span>
              <span className="ach-desc">{a.unlockDescription}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
