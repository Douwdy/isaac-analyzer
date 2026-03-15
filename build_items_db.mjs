import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const isaacDB         = JSON.parse(readFileSync(join(__dirname, 'src/data/isaac_database.json'), 'utf8'));
const collectibleUnlocks = JSON.parse(readFileSync(join(__dirname, 'src/data/collectibleUnlocks.json'), 'utf8'));

// collectibleUnlocks : { item_id (1-721) → achievement_id }
const unlockMap = new Map(Object.entries(collectibleUnlocks).map(([itemId, ach]) => [parseInt(itemId), ach]));

// Only passive/active items use the collectible ID space (1-721)
// Trinkets and consumables have their own ID spaces — no overlap risk but we exclude them anyway
const COLLECTIBLE_KINDS = new Set(['passive', 'active']);

const items = isaacDB.items_collectibles.map(item => ({
  id:              item.id,
  cid:             item.cid,
  name:            item.name,
  kind:            item.kind,
  item_id:         item.item_id,
  quality:         item.quality ?? null,
  requires_unlock: item.requires_unlock,
  unlock_condition: item.unlock_condition ?? null,
  // achievement_id renseigné uniquement pour passifs/actifs (clé = item_id 1-721)
  achievement_id:  COLLECTIBLE_KINDS.has(item.kind) ? (unlockMap.get(item.item_id) ?? null) : null,
}));

const outPath = join(__dirname, 'src/data/items_db.json');
writeFileSync(outPath, JSON.stringify(items, null, 2));

const withAch = items.filter(i => i.achievement_id != null).length;
console.log(`✓ Generated ${items.length} entries (${withAch} with achievement_id) → src/data/items_db.json`);
