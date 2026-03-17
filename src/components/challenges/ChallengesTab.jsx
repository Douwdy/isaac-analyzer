import { useState, useCallback } from 'react';
import { useLang } from '../../context/LangContext.jsx';
import { IconEyeOpen, IconEyeClosed } from '../ui/IconEye.jsx';
import { challengeWikiUrl } from '../../utils/urls.js';
import { S } from '../../utils/sprites.js';
import { CHALLENGE_DATA } from '../../data/challengeData.js';

export default function ChallengesTab({ derived }) {
  const t = useLang();
  const { challenges } = derived;
  const done  = challenges.filter(c => c.done).length;
  const total = challenges.length;
  const [revealed, setRevealed] = useState(new Set());

  const toggle = useCallback((id) => setRevealed(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  }), []);

  return (
    <div>
      <div className="section-summary">
        {t.challengesSummary(done, total)}
        <div className="mini-progress-track" style={{ marginTop: 8 }}>
          <div className="mini-progress-fill" style={{ width: `${total > 0 ? Math.round(done / total * 100) : 0}%` }} />
        </div>
      </div>
      <div className="challenge-list">
        {challenges.map((c, i) => {
          const rwd = CHALLENGE_DATA[c.id];
          const revealReward = c.done || revealed.has(c.id);
          return (
            <div key={c.id} className={`challenge-row ${c.done ? 'done' : 'todo'}`}
                 style={{ animationDelay: `${Math.min(i, 14) * 30}ms` }}>
              <div className={`chall-reward-icon${revealReward ? '' : ' hidden'}`}>
                {rwd?.icon
                  ? <img src={S.challenge(rwd.icon)} alt={rwd.reward} loading="lazy"
                         onError={e => { e.currentTarget.style.display = 'none'; }} />
                  : <span className="chall-reward-mystery">?</span>
                }
              </div>
              <div className="chall-info">
                <a className="chall-main-link" href={challengeWikiUrl(c.id, c.name)} target="_blank" rel="noopener noreferrer">
                  <span className="chall-status-icon">{c.done ? '✓' : '✗'}</span>
                  <span className="chall-id">#{c.id}</span>
                  <span className="chall-name">{c.name}</span>
                </a>
                {rwd && (
                  <span className={`chall-reward-name${revealReward ? ' visible' : ''}`}>
                    {revealReward ? rwd.reward : '???'}
                  </span>
                )}
              </div>
              {!c.done && rwd && (
                <button className="chall-eye-btn" onClick={() => toggle(c.id)}
                        title={revealReward ? t.hideRewardTooltip : t.revealRewardTooltip}
                        aria-label={revealReward ? t.hideRewardTooltip : t.revealRewardTooltip}>
                  {revealReward ? <IconEyeOpen /> : <IconEyeClosed />}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
