import { useLang } from '../context/LangContext.jsx';

export default function DeadGodProgress({ derived }) {
  const t = useLang();
  const { unlockedCount, totalAch, percent, deadGodUnlocked, dlcProgress } = derived;
  return (
    <div className="dead-god-bar-card">
      <div className="dead-god-bar-header">
        <span className="dead-god-title">{t.deadGodTitle}</span>
        <span className={`dead-god-status ${deadGodUnlocked ? 'done' : 'pending'}`}>
          {deadGodUnlocked ? t.deadGodUnlocked : `${unlockedCount} / ${totalAch} (${percent}%)`}
        </span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="progress-label">
        {t.deadGodRemaining(totalAch - unlockedCount)}
      </div>
      <div className="dlc-progress-grid">
        {dlcProgress.map(dlc => (
          <div key={dlc.key} className={`dlc-bar${dlc.pct === 1 ? ' complete' : ''}`}>
            <div className="dlc-bar-header">
              <span className="dlc-name">{dlc.label}</span>
              <span className="dlc-count">{dlc.unlocked}/{dlc.total}</span>
            </div>
            <div className="mini-progress-track">
              <div className="mini-progress-fill" style={{ width: `${Math.round(dlc.pct * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
