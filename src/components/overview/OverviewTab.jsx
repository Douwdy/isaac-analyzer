import { useLang } from '../../context/LangContext.jsx';
import SectionTitle from '../ui/SectionTitle.jsx';
import MissingHighlights from './MissingHighlights.jsx';
import { computeMarksProgress } from '../../utils/derived.js';
import {
  iconAchievement, iconChallenges, iconCharacter, iconCollectables,
} from '../../utils/sprites.js';

export default function OverviewTab({ derived }) {
  const t = useLang();
  const {
    unlockedCount, totalAch,
    challengesDone, challenges,
    seenCount, collTotal,
    unlockedIds,
  } = derived;

  const { totalMarks, doneMarks } = computeMarksProgress(unlockedIds);

  const stats = [
    { label: t.statAchievements, value: `${unlockedCount} / ${totalAch}`,           pct: totalAch       > 0 ? unlockedCount  / totalAch           : 0, icon: iconAchievement },
    { label: t.statChallenges,   value: `${challengesDone} / ${challenges.length}`, pct: challenges.length > 0 ? challengesDone / challenges.length : 0, icon: iconChallenges },
    { label: t.statMarks,        value: `${doneMarks} / ${totalMarks}`,             pct: totalMarks     > 0 ? doneMarks      / totalMarks           : 0, icon: iconCharacter },
    ...(derived.source !== 'steam' ? [{ label: t.statCollectibles, value: `${seenCount} / ${collTotal}`, pct: collTotal > 0 ? seenCount / collTotal : 0, icon: iconCollectables }] : []),
  ];

  return (
    <div>
      <div className="stats-grid">
        {stats.map(s => (
          <div className={`stat-card${s.pct >= 1 ? ' stat-card--complete' : ''}`} key={s.label}>
            <div className="stat-icon"><img src={s.icon} className="stat-icon-img" draggable="false" /></div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-pct">{Math.round(s.pct * 100)}%</div>
            <div className="mini-progress-track">
              <div className="mini-progress-fill" style={{ width: `${Math.round(s.pct * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>{t.whatsNeeded}</SectionTitle>
      <MissingHighlights derived={derived} />
    </div>
  );
}
