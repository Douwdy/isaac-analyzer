import achievementsData from '../data/achievements.json';
import collectiblesData from '../data/collectibles.json';
import { CHARACTERS, NORMAL_MARK_KEYS, TAINTED_MARK_KEYS } from '../data/characterMarks.js';
import { CHALLENGE_DATA } from '../data/challengeData.js';
import { CHALLENGE_NAMES } from '../constants/mods.js';

export const DEAD_GOD_ACHIEVEMENT_ID = 637;
export const TOTAL_ACHIEVEMENTS = 641; // 638-641 added in Repentance+

export const DLC_RANGES = [
  { key: 'rebirth',     label: 'Rebirth',     min: 1,   max: 178 },
  { key: 'afterbirth',  label: 'Afterbirth',  min: 179, max: 276 },
  { key: 'afterbirth+', label: 'Afterbirth+', min: 277, max: 403 },
  { key: 'repentance',  label: 'Repentance',  min: 404, max: 641 },
];

// Shared helper — used by both computeDerived and computeSteamDerived
export function buildAchievementData(unlockedIds) {
  const achievementsList = Object.entries(achievementsData)
    .map(([id, a]) => ({ id: parseInt(id), ...a, unlocked: unlockedIds.has(parseInt(id)) }))
    .filter(a => a.id >= 1 && a.id <= TOTAL_ACHIEVEMENTS);
  const lockedAchievements = achievementsList.filter(a => !a.unlocked && a.id !== DEAD_GOD_ACHIEVEMENT_ID);
  const dlcProgress = DLC_RANGES.map(({ key, label, min, max }) => {
    let unlocked = 0;
    for (let i = min; i <= max; i++) { if (unlockedIds.has(i)) unlocked++; }
    const total = max - min + 1;
    return { key, label, unlocked, total, pct: unlocked / total };
  });
  return { achievementsList, lockedAchievements, dlcProgress };
}

export function computeMarksProgress(unlockedIds) {
  let totalMarks = 0, doneMarks = 0;
  for (const char of CHARACTERS) {
    const keys = char.tainted ? TAINTED_MARK_KEYS : NORMAL_MARK_KEYS;
    for (const k of keys) {
      if (char.marks[k] == null) continue;
      totalMarks++;
      if (unlockedIds.has(char.marks[k])) doneMarks++;
    }
  }
  return { totalMarks, doneMarks };
}

export function computeDerived(saveData) {
  const chunks = saveData.chunks;

  // Achievements (chunk 1)
  const achValues  = chunks[1]?.data?.values ?? [];
  const unlockedIds = new Set();
  for (let i = 1; i < achValues.length; i++) {
    if (achValues[i] !== 0) unlockedIds.add(i);
  }
  const totalAch = TOTAL_ACHIEVEMENTS;
  const deadGodUnlocked = unlockedIds.has(DEAD_GOD_ACHIEVEMENT_ID);

  const { achievementsList, lockedAchievements, dlcProgress } = buildAchievementData(unlockedIds);

  // Challenges (chunk 7) — données 1-indexées, index 0 ignoré
  const challValues = chunks[7]?.data?.values ?? [];
  const challenges = challValues.slice(1, CHALLENGE_NAMES.length + 1).map((done, idx) => ({
    id: idx + 1,
    name: CHALLENGE_NAMES[idx],
    done: done !== 0,
  }));

  // Collectibles (chunk 4) — skip unassigned IDs (no entry in collectiblesData)
  const collValues = chunks[4]?.data?.values ?? [];
  let seenCount = 0;
  const missedCollectibles = [];
  for (let i = 1; i < collValues.length; i++) {
    if (!collectiblesData[String(i)]) continue;
    if (collValues[i] !== 0) seenCount++;
    else missedCollectibles.push(i);
  }

  // Special seeds (chunk 10) — 69 easter eggs in Repentance
  const seedValues  = chunks[10]?.data?.values ?? [];
  const seedsActive = seedValues.filter(v => v !== 0).length;
  const seedsTotal  = 69;

  return {
    source: 'file',
    unlockedIds,
    achievementsList,
    lockedAchievements,
    unlockedCount: unlockedIds.size,
    totalAch,
    deadGodUnlocked,
    percent: Math.floor((unlockedIds.size / totalAch) * 100),
    dlcProgress,
    challenges,
    challengesDone: challenges.filter(c => c.done).length,
    missedCollectibles,
    seenCount,
    collTotal: Object.keys(collectiblesData).filter(k => parseInt(k) >= 1).length,
    seedsActive,
    seedsTotal,
  };
}

export function computeSteamDerived({ unlockedIds, steamId, displayId }) {
  const totalAch = TOTAL_ACHIEVEMENTS;
  const deadGodUnlocked = unlockedIds.has(DEAD_GOD_ACHIEVEMENT_ID);
  const { achievementsList, lockedAchievements, dlcProgress } = buildAchievementData(unlockedIds);
  const collTotal = Object.keys(collectiblesData).filter(k => parseInt(k) >= 1).length;
  const challenges = CHALLENGE_NAMES.map((name, idx) => {
    const id = idx + 1;
    const achId = CHALLENGE_DATA[id]?.achievementId;
    return { id, name, done: achId != null ? unlockedIds.has(achId) : false };
  });
  return {
    source: 'steam',
    steamId,
    displayId: displayId ?? steamId,
    unlockedIds,
    achievementsList,
    lockedAchievements,
    unlockedCount: unlockedIds.size,
    totalAch,
    deadGodUnlocked,
    percent: Math.floor((unlockedIds.size / totalAch) * 100),
    dlcProgress,
    challenges,
    challengesDone: challenges.filter(c => c.done).length,
    missedCollectibles: [],
    seenCount: 0,
    collTotal,
    seedsActive: 0,
    seedsTotal: 69,
  };
}
