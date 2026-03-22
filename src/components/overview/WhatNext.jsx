import { useMemo } from 'react';
import { useLang } from '../../context/LangContext.jsx';
import { CHARACTERS, NORMAL_MARK_KEYS, TAINTED_MARK_KEYS, BOSS_LABELS } from '../../data/characterMarks.js';
import { getCharSprite, getTaintedCharSprite, getMarkSprite } from '../../utils/sprites.js';

const QUICK_WIN_THRESHOLD = 3;

export default function WhatNext({ derived }) {
  const t = useLang();
  const { unlockedIds } = derived;

  const quickWins = useMemo(() => {
    return CHARACTERS
      .map(char => {
        const markKeys = (char.tainted ? TAINTED_MARK_KEYS : NORMAL_MARK_KEYS)
          .filter(k => char.marks[k] != null);
        const missing = markKeys.filter(k => !unlockedIds.has(char.marks[k]));
        const isUnlocked = !char.tainted || char.unlockAchId == null || unlockedIds.has(char.unlockAchId);
        return { char, total: markKeys.length, done: markKeys.length - missing.length, missing, isUnlocked };
      })
      .filter(p => p.isUnlocked && p.missing.length > 0 && p.missing.length <= QUICK_WIN_THRESHOLD)
      .sort((a, b) => a.missing.length - b.missing.length);
  }, [unlockedIds]);

  if (quickWins.length === 0) return null;

  return (
    <div className="whatsnext-section">
      <div className="whatsnext-subtitle">{t.nextQuickWins(quickWins.length)}</div>
      <div className="quick-wins-grid">
        {quickWins.map(({ char, total, done, missing }) => {
          const portrait = char.tainted ? getTaintedCharSprite(char.key) : getCharSprite(char.key);
          return (
            <div key={char.key} className="quick-win-card">
              {portrait && (
                <img src={portrait} className="qw-portrait" alt={char.name} draggable="false"
                  onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />
              )}
              <div className="qw-body">
                <div className="qw-name">{char.name}</div>
                <div className="mini-progress-track">
                  <div className="mini-progress-fill" style={{ width: `${Math.round(done / total * 100)}%` }} />
                </div>
                <div className="qw-marks-left">{t.nextMarksLeft(missing.length)}</div>
                <div className="qw-missing-marks">
                  {missing.map(k => {
                    const sprite = getMarkSprite(k);
                    return sprite ? (
                      <img key={k} src={sprite} className="qw-mark-icon"
                        title={BOSS_LABELS[k] ?? k} alt={BOSS_LABELS[k] ?? k}
                        onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
