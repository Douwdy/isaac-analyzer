import { useState, useMemo } from 'react';
import { useLang } from '../../context/LangContext.jsx';
import { CHARACTERS, NORMAL_MARK_KEYS, TAINTED_MARK_KEYS } from '../../data/characterMarks.js';
import { computeMarksProgress } from '../../utils/derived.js';
import CharacterMarksCard from './CharacterMarksCard.jsx';

export default function CharactersTab({ derived }) {
  const t = useLang();
  const { unlockedIds } = derived;
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => CHARACTERS.filter(char => {
    if (filter === 'normal')     return !char.tainted;
    if (filter === 'tainted')    return char.tainted;
    if (filter === 'incomplete') {
      const keys = char.tainted ? TAINTED_MARK_KEYS : NORMAL_MARK_KEYS;
      return keys.some(k => char.marks[k] != null && !unlockedIds.has(char.marks[k]));
    }
    return true;
  }), [filter, unlockedIds]);

  const { totalMarks, doneMarks } = useMemo(() => computeMarksProgress(unlockedIds), [unlockedIds]);

  return (
    <div>
      <div className="section-summary">
        {t.marksSummary(doneMarks, totalMarks)}
        <div className="mini-progress-track" style={{ marginTop: 8 }}>
          <div className="mini-progress-fill" style={{ width: `${totalMarks > 0 ? Math.round(doneMarks / totalMarks * 100) : 0}%` }} />
        </div>
      </div>

      <div className="filter-row">
        {[['all', t.filterAll], ['normal', t.filterNormal], ['tainted', t.filterTainted], ['incomplete', t.filterIncomplete]].map(([v, l]) => (
          <button key={v} className={`filter-btn ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>
            {l}
          </button>
        ))}
        <span className="filter-count">{t.characterCount(filtered.length)}</span>
      </div>

      <div className="char-marks-grid-outer">
        {filtered.map(char => (
          <CharacterMarksCard key={char.id} char={char} unlockedIds={unlockedIds} />
        ))}
      </div>
    </div>
  );
}
