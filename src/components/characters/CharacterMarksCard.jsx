import { useState } from 'react';
import { createPortal } from 'react-dom';
import { BOSS_LABELS, NORMAL_MARK_KEYS, TAINTED_MARK_KEYS } from '../../data/characterMarks.js';
import { getCharSprite, getTaintedCharSprite, getMarkSprite, iconTainted, iconLocked } from '../../utils/sprites.js';
import achievementsData from '../../data/achievements.json';
import { achIconUrl } from '../../utils/urls.js';
import completeIcon from '../../assets/complete.webp';
import uncompleteIcon from '../../assets/uncomplete.webp';

export default function CharacterMarksCard({ char, unlockedIds }) {
  const [tooltip, setTooltip] = useState(null);
  const markKeys   = char.tainted ? TAINTED_MARK_KEYS : NORMAL_MARK_KEYS;
  const doneCount  = markKeys.filter(k => char.marks[k] != null && unlockedIds.has(char.marks[k])).length;
  const totalCount = markKeys.filter(k => char.marks[k] != null).length;
  const isComplete = doneCount === totalCount;
  const sprite     = char.tainted ? getTaintedCharSprite(char.key) : getCharSprite(char.key);
  const hasSomeMarks = markKeys.some(k => char.marks[k] != null && unlockedIds.has(char.marks[k]));
  const isLocked   = char.unlockAchId != null && !unlockedIds.has(char.unlockAchId) && !hasSomeMarks;

  const cls = ['char-card', isComplete && 'char-card--complete', char.tainted && 'char-card--tainted', isLocked && 'char-card--locked']
    .filter(Boolean).join(' ');

  return (
    <>
      <div className={cls}>
        <img src={isComplete ? completeIcon : uncompleteIcon} className="char-card-status-icon" draggable="false" />
        {isLocked && (
          <div className="char-locked-overlay">
            <img src={iconLocked} className="char-lock-icon" draggable="false" />
          </div>
        )}
        <div className="char-card-portrait">
          {sprite
            ? <img src={sprite} alt={char.name} className="char-portrait-img" draggable="false" />
            : <div className="char-portrait-placeholder" />
          }
          {char.tainted && <img src={iconTainted} className="tainted-badge" draggable="false" />}
        </div>

        <div className="char-card-body">
          <div className="char-card-title">
            <span className="char-card-name">{char.name}</span>
            {!isComplete && (
              <span className="char-card-score">{doneCount}/{totalCount}</span>
            )}
          </div>

          <div className={`char-marks-row${isLocked ? ' char-marks-row--locked' : ''}`}>
            {markKeys.map(k => {
              const achId = char.marks[k];
              if (achId == null) return null;
              const done       = unlockedIds.has(achId);
              const label      = BOSS_LABELS[k] ?? k;
              const markSprite = getMarkSprite(k);
              const ach = achievementsData[String(achId)];
              return (
                <div key={k}
                     className={`mark-pip${done ? ' mark-pip--done' : ''}`}
                     onMouseEnter={e => {
                       if (!ach) return;
                       const r = e.currentTarget.getBoundingClientRect();
                       setTooltip({ label, cx: r.left + r.width / 2, top: r.bottom + 7, ach });
                     }}
                     onMouseLeave={() => setTooltip(null)}>
                  <div className="mark-badge">
                    {markSprite
                      ? <img src={markSprite} alt={label}
                             className={`mark-pip-icon${done ? '' : ' mark-pip-icon--locked'}`}
                             draggable="false" />
                      : <span className="mark-pip-fallback">{done ? '✓' : '✗'}</span>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {tooltip && createPortal(
        <div className="mark-item-tooltip" style={{ top: tooltip.top, left: tooltip.cx }}>
          <img
            src={achIconUrl(tooltip.ach.name)}
            alt=""
            className="mark-item-tooltip-icon"
            loading="lazy"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="mark-item-tooltip-info">
            <span className="mark-item-tooltip-boss">{tooltip.label}</span>
            <span className="mark-item-tooltip-name">{tooltip.ach.name}</span>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
