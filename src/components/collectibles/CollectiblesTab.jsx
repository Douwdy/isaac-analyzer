import { useState, useMemo } from 'react';
import { useLang } from '../../context/LangContext.jsx';
import SteamPartialNotice from '../SteamPartialNotice.jsx';
import { COLL_KIND_BY_ID, ITEM_UNLOCK_BY_ID } from '../../utils/itemMaps.js';
import { collIconUrl, collWikiUrl } from '../../utils/urls.js';
import collectiblesData from '../../data/collectibles.json';

export default function CollectiblesTab({ derived }) {
  const t = useLang();
  const { seenCount, collTotal } = derived;
  const [filter, setFilter] = useState('missing');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (derived.source === 'steam') return [];
    const missedSet = new Set(derived.missedCollectibles);
    const { unlockedIds } = derived;
    return Object.entries(collectiblesData)
      .filter(([id]) => parseInt(id) >= 1)
      .map(([id, name]) => {
        const numId = parseInt(id);
        const seen = !missedSet.has(numId);
        const dbItem = ITEM_UNLOCK_BY_ID.get(numId);
        const unlocked = dbItem == null
          || dbItem.unlockCondition === null
          || (dbItem.achievementId != null && unlockedIds.has(dbItem.achievementId));
        return { id: numId, name, seen, unlocked };
      })
      .sort((a, b) => a.id - b.id)
      .filter(c => {
        if (filter === 'missing')          return !c.seen;
        if (filter === 'found')            return c.seen;
        if (filter === 'unlocked_missing') return !c.seen && c.unlocked;
        return true;
      })
      .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || String(c.id).includes(search));
  }, [derived, filter, search]);

  if (derived.source === 'steam') return <SteamPartialNotice />;

  const pct = collTotal > 0 ? Math.round(seenCount / collTotal * 100) : 0;

  return (
    <div>
      <div className="section-summary">
        {t.collectiblesSummary(seenCount, collTotal)}
        <div className="mini-progress-track" style={{ marginTop: 8 }}>
          <div className="mini-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="filter-row">
        {[
          ['all',              t.filterAll],
          ['missing',          t.filterMissing],
          ['found',            t.filterFound],
          ['unlocked_missing', t.filterUnlockedMissing],
        ].map(([f, label]) => (
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
        <span className="filter-count">{t.collItemCount(filtered.length)}</span>
      </div>

      <div className="coll-list" key={filter + '|' + search}>
        {filtered.map((c, i) => {
          const kind = COLL_KIND_BY_ID.get(c.id);
          return (
            <a key={c.id} className={`coll-row ${c.seen ? 'seen' : 'missing'}`}
               style={{ animationDelay: `${Math.min(i, 14) * 30}ms` }}
               href={collWikiUrl(c.id, c.name)} target="_blank" rel="noopener noreferrer">
              <div className="coll-row-icon">
                <img src={collIconUrl(c.name)} alt="" loading="lazy"
                     onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />
              </div>
              <span className="coll-row-id">#{c.id}</span>
              <span className="coll-row-name">{c.name}</span>
              {kind && <span className="item-kind-tag">{kind}</span>}
              <span className="coll-row-status">{c.seen ? '✓' : '✗'}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
