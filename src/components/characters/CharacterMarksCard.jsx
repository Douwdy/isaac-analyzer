import { BOSS_LABELS, NORMAL_MARK_KEYS, TAINTED_MARK_KEYS } from '../../data/characterMarks.js';
import { getCharSprite, getTaintedCharSprite, getMarkSprite, iconTainted, iconLocked } from '../../utils/sprites.js';

export default function CharacterMarksCard({ char, unlockedIds }) {
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
    <div className={cls}>
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
          <span className={`char-card-score${isComplete ? ' complete' : ''}`}>
            {isComplete ? '★' : `${doneCount}/${totalCount}`}
          </span>
        </div>

        <div className={`char-marks-row${isLocked ? ' char-marks-row--locked' : ''}`}>
          {markKeys.map(k => {
            const achId = char.marks[k];
            if (achId == null) return null;
            const done       = unlockedIds.has(achId);
            const label      = BOSS_LABELS[k] ?? k;
            const markSprite = getMarkSprite(k);
            return (
              <div key={k} className={`mark-pip${done ? ' mark-pip--done' : ''}`}
                   data-label={label.replace('\n', ' ')}>
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
  );
}
