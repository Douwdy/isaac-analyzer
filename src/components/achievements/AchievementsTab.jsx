import { useState, useMemo } from 'react';
import { useLang } from '../../context/LangContext.jsx';
import { wikiUrl, achIconUrl } from '../../utils/urls.js';
import { CHARACTERS } from '../../data/characterMarks.js';
import { CHAR_ACH_MAP } from '../../utils/itemMaps.js';
import { DLC_RANGES } from '../../utils/derived.js';

const NORMAL_CHARS  = CHARACTERS.filter(c => !c.tainted);
const TAINTED_CHARS = CHARACTERS.filter(c =>  c.tainted);

export default function AchievementsTab({ derived }) {
  const t = useLang();
  const { achievementsList, dlcProgress } = derived;
  const [filter, setFilter] = useState('locked');
  const [dlcFilter, setDlcFilter] = useState('all');
  const [search, setSearch] = useState('');
  // charFilter stores char.key (e.g. 'blue_baby'), never char.name ('???'), to avoid ambiguity
  const [charFilter, setCharFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return achievementsList.filter(a => {
      if (filter === 'locked'   && a.unlocked)  return false;
      if (filter === 'unlocked' && !a.unlocked) return false;
      if (dlcFilter !== 'all') {
        const range = DLC_RANGES.find(d => d.key === dlcFilter);
        if (range && (a.id < range.min || a.id > range.max)) return false;
      }
      if (charFilter) {
        const charIds = CHAR_ACH_MAP.get(charFilter);
        if (!charIds?.has(a.id)) return false;
      }
      if (!q) return true;
      return a.name.toLowerCase().includes(q) || a.unlockDescription?.toLowerCase().includes(q);
    });
  }, [achievementsList, filter, dlcFilter, search, charFilter]);

  return (
    <div>
      <div className="filter-row">
        {[['all', t.filterAll], ['locked', t.filterLocked], ['unlocked', t.filterUnlocked]].map(([f, label]) => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {label}
          </button>
        ))}
        <select
          className="ach-char-select"
          value={charFilter}
          onChange={e => setCharFilter(e.target.value)}
        >
          <option value="">{t.filterAllChars}</option>
          <optgroup label="Normal">
            {NORMAL_CHARS.map(c => (
              <option key={c.key} value={c.key}>{c.name}</option>
            ))}
          </optgroup>
          <optgroup label="Tainted">
            {TAINTED_CHARS.map(c => (
              <option key={c.key} value={c.key}>{c.name}</option>
            ))}
          </optgroup>
        </select>
        <input
          className="coll-search-input"
          placeholder={t.collSearch}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="filter-count">{t.achievementCount(filtered.length)}</span>
        <a className="tips-btn" href="https://bindingofisaacrebirth.wiki.gg/wiki/Achievement_Tips" target="_blank" rel="noopener noreferrer">{t.achievementTips}</a>
      </div>
      <div className="filter-row filter-row--dlc">
        <button className={`filter-btn ${dlcFilter === 'all' ? 'active' : ''}`} onClick={() => setDlcFilter('all')}>
          {t.filterAll}
        </button>
        {DLC_RANGES.map(({ key, label }) => {
          const progress = dlcProgress.find(d => d.key === key);
          return (
            <button key={key} className={`filter-btn ${dlcFilter === key ? 'active' : ''}`}
              onClick={() => setDlcFilter(key)}>
              {label}
              {progress && <span className="dlc-pct">{Math.round(progress.pct * 100)}%</span>}
            </button>
          );
        })}
      </div>
      <div className="achievement-list" key={filter + '|' + dlcFilter + '|' + search + '|' + charFilter}>
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
