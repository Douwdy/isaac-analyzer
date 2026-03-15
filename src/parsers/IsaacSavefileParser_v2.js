/**
 * Isaac Savefile Parser v2 - Fixed
 *
 * Format binaire réel (persistentgamedata*.dat Repentance) :
 *   [0x00-0x0F] Header ASCII "ISAACNGSAVE09R  " (16 bytes)
 *   [0x10-0x13] Unknown / padding (4 bytes, toujours 0)
 *   [0x14+    ] Chunks séquentiels :
 *     - type  : uint32 LE (ChunkType 1-11)
 *     - f1    : uint32 LE (= count × 4 pour tous les types)
 *     - count : uint32 LE (nombre d'items)
 *     - data  : count items
 *
 * Types counter (items uint32, 4 bytes) : COUNTERS(2), LEVEL_COUNTERS(3), CUTSCENE_COUNTERS(8), GAME_SETTINGS(9)
 * Types flag    (items uint8,  1 byte)  : ACHIEVEMENTS(1), COLLECTIBLES(4), MINIBOSSES(5), BOSSES(6),
 *                                         CHALLENGE_COUNTERS(7), SPECIAL_SEED_COUNTERS(10)
 * Type BESTIARY (11) : structure imbriquée complexe
 *
 * Avancement par chunk : 12 + (count × item_size)
 *   - counter : 12 + count × 4 = 12 + f1
 *   - flag    : 12 + count × 1 = 12 + count
 */

// Types dont les données sont stockées en uint32 (4 bytes/item) → avancer de f1 bytes
const COUNTER_TYPES = new Set([2, 3, 8, 9]);
// Type Bestiary a aussi f1 comme taille totale (structure imbriquée)
const F1_ADVANCE_TYPES = new Set([2, 3, 8, 9, 11]);

class IsaacSavefileParserV2 {
  static parse(buffer) {
    const view = new DataView(buffer);
    let offset = 0;

    try {
      const header = this.parseHeader(view, offset);
      offset += 20; // 16 (magic) + 4 (unknown)

      const chunks = {};

      while (offset + 12 <= buffer.byteLength) {

        const type = view.getUint32(offset, true);
        if (type < 1 || type > 11) break;

        const f1    = view.getUint32(offset + 4, true); // = count × 4 (toujours)
        const count = view.getUint32(offset + 8, true); // nombre d'items
        const dataOffset = offset + 12;

        // Taille réelle des données en bytes
        const isCounter = COUNTER_TYPES.has(type);
        const dataBytes = F1_ADVANCE_TYPES.has(type) ? f1 : count;

        if (!chunks[type]) {
          chunks[type] = {
            type,
            count,
            data: this.parseChunkData(view, type, dataOffset, count, dataBytes, buffer.byteLength),
          };
        }

        offset += 12 + dataBytes;
      }

      return {
        header,
        chunks,
        stats: this.extractStats(chunks),
      };
    } catch (error) {
      console.error('Erreur parsing:', error);
      throw new Error(`Erreur lors du parsing: ${error.message}`);
    }
  }

  static parseHeader(view, offset) {
    const magic = new Uint8Array(view.buffer, offset, 16);
    const magicStr = new TextDecoder().decode(magic).replace(/[\0\s]+$/, '');
    return {
      magic: magicStr,
      isValid: magicStr === 'ISAACNGSAVE09R',
    };
  }

  static parseChunkData(view, type, dataOffset, count, dataBytes, bufferLength) {
    // Protéger contre les lectures hors limites
    const safeEnd = Math.min(dataOffset + dataBytes, bufferLength);

    try {
      if (COUNTER_TYPES.has(type)) {
        // Items uint32 (4 bytes chacun)
        const values = [];
        for (let i = 0; i < count; i++) {
          const pos = dataOffset + i * 4;
          if (pos + 4 > safeEnd) break;
          values.push(view.getUint32(pos, true));
        }
        return { count, values };
      } else if (type === 11) {
        // BESTIARY : structure imbriquée, on stocke brut pour l'instant
        return this.parseBestiaryData(view, dataOffset, count, safeEnd);
      } else {
        // Items uint8 (1 byte chacun) — types flag
        const values = [];
        for (let i = 0; i < count; i++) {
          const pos = dataOffset + i;
          if (pos >= safeEnd) break;
          values.push(view.getUint8(pos));
        }
        const seenCount = values.filter(v => v !== 0).length;
        return { count, values, seenCount };
      }
    } catch (e) {
      console.warn(`Erreur parsing chunk type ${type}:`, e);
      return { count, values: [], error: e.message };
    }
  }

  static parseBestiaryData(view, dataOffset, subChunkCount, safeEnd) {
    // BESTIARY : array de sub-chunks, chacun avec count + entity-value pairs
    const subChunks = [];
    let pos = dataOffset;

    for (let i = 0; i < subChunkCount && pos + 8 <= safeEnd; i++) {
      const subType  = view.getUint32(pos, true);
      const subBytes = view.getUint32(pos + 4, true);
      pos += 8;

      // Guard against malformed subBytes that would read past the buffer
      if (subBytes > safeEnd - pos) break;

      const entries = [];
      const subEnd = Math.min(pos + subBytes, safeEnd);
      while (pos + 8 <= subEnd) {
        entries.push({
          entity: view.getUint32(pos, true),
          value:  view.getUint32(pos + 4, true),
        });
        pos += 8;
      }
      subChunks.push({ subType, entries });
    }

    return { count: subChunkCount, subChunks };
  }

  static extractStats(chunks) {
    const get = (chunkId) => chunks[chunkId]?.data;

    return {
      achievements:  get(1)?.seenCount  ?? 0,
      collectibles:  get(4)?.seenCount  ?? 0,
      minibosses:    get(5)?.seenCount  ?? 0,
      bosses:        get(6)?.seenCount  ?? 0,
      challenges:    get(7)?.seenCount  ?? 0,
    };
  }
}

export default IsaacSavefileParserV2;
