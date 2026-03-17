import itemsDB from '../data/items_db.json';
import { CHARACTERS } from '../data/characterMarks.js';
import { CHALLENGE_DATA } from '../data/challengeData.js';

// item_id → kind (passifs/actifs uniquement) + item_id → unlock info — single pass
// (trinkets/consommables ont des item_id qui se chevauchent avec passifs/actifs, donc filtre par kind pour COLL_KIND_BY_ID)
export const COLL_KIND_BY_ID = new Map();
export const ITEM_UNLOCK_BY_ID = new Map();
for (const i of itemsDB) {
  if (i.item_id == null || (i.kind !== 'passive' && i.kind !== 'active')) continue;
  ITEM_UNLOCK_BY_ID.set(i.item_id, { unlockCondition: i.unlock_condition, achievementId: i.achievement_id });
  COLL_KIND_BY_ID.set(i.item_id, i.kind);
}

// Achievement ID → item kind (pour badge d'affichage + bucket Items dans MissingHighlights)
export const ITEM_KIND_BY_ACH = new Map(
  itemsDB.filter(i => i.achievement_id != null).map(i => [i.achievement_id, i.kind])
);

// Pre-computed sets for accurate achievement categorization
export const MARK_ACH_IDS = new Set(
  CHARACTERS.flatMap(char => Object.values(char.marks).filter(id => id != null))
);
export const CHALLENGE_ACH_IDS = new Set(
  Object.values(CHALLENGE_DATA).map(d => d.achievementId).filter(Boolean)
);
