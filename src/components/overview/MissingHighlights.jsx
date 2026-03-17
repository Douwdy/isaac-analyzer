import { useLang } from '../../context/LangContext.jsx';
import MissingBucket from '../ui/MissingBucket.jsx';
import { MARK_ACH_IDS, CHALLENGE_ACH_IDS, ITEM_KIND_BY_ACH } from '../../utils/itemMaps.js';
import { wikiUrl, challengeWikiUrl } from '../../utils/urls.js';

export default function MissingHighlights({ derived }) {
  const t = useLang();
  const { lockedAchievements, challenges } = derived;
  const missingChallenges = challenges.filter(c => !c.done);

  const buckets = { Marks: [], Challenges: [], Items: [], Other: [] };
  for (const a of lockedAchievements) {
    if (MARK_ACH_IDS.has(a.id))           buckets.Marks.push(a);
    else if (CHALLENGE_ACH_IDS.has(a.id)) buckets.Challenges.push(a);
    else if (ITEM_KIND_BY_ACH.has(a.id))  buckets.Items.push(a);
    else                                   buckets.Other.push(a);
  }

  return (
    <div className="missing-grid">
      <MissingBucket title={t.bucketChallenges(missingChallenges.length)} color="var(--color-red)">
        {missingChallenges.length === 0
          ? <li className="bucket-all-done">{t.bucketAllDone}</li>
          : missingChallenges.map(c => (
              <li key={c.id}>
                <a href={challengeWikiUrl(c.id, c.name)} target="_blank" rel="noopener noreferrer">
                  #{c.id} {c.name}
                </a>
              </li>
            ))}
      </MissingBucket>

      <MissingBucket title={t.bucketMarks(buckets.Marks.length)} color="var(--color-teal)">
        {buckets.Marks.length === 0
          ? <li className="bucket-all-done">{t.bucketAllDone}</li>
          : buckets.Marks.map(a => (
              <li key={a.id} title={a.unlockDescription}>
                <a href={wikiUrl(a.name)} target="_blank" rel="noopener noreferrer">
                  {a.unlockDescription || a.name}
                </a>
              </li>
            ))}
      </MissingBucket>

      <MissingBucket title={t.bucketItems(buckets.Items.length)} color="var(--color-purple)">
        {buckets.Items.length === 0
          ? <li className="bucket-all-done">{t.bucketAllDone}</li>
          : buckets.Items.map(a => {
              const kind = ITEM_KIND_BY_ACH.get(a.id);
              return (
                <li key={a.id} title={a.unlockDescription}>
                  <a href={wikiUrl(a.name)} target="_blank" rel="noopener noreferrer">{a.name}</a>
                  {kind && <span className="item-kind-tag">{kind}</span>}
                </li>
              );
            })}
      </MissingBucket>

      <MissingBucket title={t.bucketOther(buckets.Other.length)} color="var(--color-gold)">
        {buckets.Other.length === 0
          ? <li className="bucket-all-done">{t.bucketAllDone}</li>
          : buckets.Other.map(a => (
              <li key={a.id} title={a.unlockDescription}>
                <a href={wikiUrl(a.name)} target="_blank" rel="noopener noreferrer">#{a.id} {a.name}</a>
              </li>
            ))}
      </MissingBucket>
    </div>
  );
}
