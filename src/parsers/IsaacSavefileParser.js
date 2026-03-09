/**
 * Isaac Savefile Parser
 * Décode les fichiers de sauvegarde .dat de The Binding of Isaac: Rebirth
 */

class IsaacSavefileParser {
  constructor() {
    // Constantes de parsing
    this.CHARACTER_COUNT = 20;
    this.STATS_OFFSET = 0;
    this.PLAYABLE_CHARACTERS_FLAG = 1;
  }

  /**
   * Parse un fichier .dat brut
   * @param {ArrayBuffer} buffer - Le contenu du fichier .dat
   * @returns {Object} Les données parsées
   */
  parseSaveFile(buffer) {
    const view = new DataView(buffer);
    const data = {
      version: 0,
      characters: [],
      unlocks: [],
      stats: {
        totalRuns: 0,
        totalVictories: 0,
        totalDeaths: 0,
        playtime: 0
      }
    };

    try {
      // Lire la version (4 bytes)
      data.version = view.getUint32(0, true);

      // Parser les données de chaque personnage
      let offset = 4;
      for (let i = 0; i < this.CHARACTER_COUNT; i++) {
        const charData = this.parseCharacterData(view, offset);
        data.characters.push(charData);
        offset += charData.bytesRead;
      }

      // Parser les statistiques générales
      data.stats = this.parseStats(view, offset);

      return data;
    } catch (error) {
      throw new Error(`Erreur lors du parsing: ${error.message}`);
    }
  }

  /**
   * Parse les données d'un personnage
   * @param {DataView} view - La vue du buffer
   * @param {number} offset - L'offset de départ
   * @returns {Object} Les données du personnage
   */
  parseCharacterData(view, offset) {
    const data = {
      bytesRead: 0,
      completed: false,
      bossRush: false,
      megaSatan: false,
      ultraGreed: false,
      hush: false,
      mother: false,
      motherQueen: false,
      runs: 0,
      victories: 0,
      deaths: 0
    };

    try {
      // Byte de statut (0 = verrouillé, 1+ = déverrouillé)
      const status = view.getUint8(offset);
      data.completed = status > 0;

      // Bits pour les déverrouillages
      const flags = view.getUint8(offset + 1);
      data.bossRush = (flags & 0x01) !== 0;
      data.megaSatan = (flags & 0x02) !== 0;
      data.ultraGreed = (flags & 0x04) !== 0;
      data.hush = (flags & 0x08) !== 0;
      data.mother = (flags & 0x10) !== 0;
      data.motherQueen = (flags & 0x20) !== 0;

      // Statistiques (2 bytes chacun)
      data.runs = view.getUint16(offset + 2, true);
      data.victories = view.getUint16(offset + 4, true);
      data.deaths = view.getUint16(offset + 6, true);

      data.bytesRead = 8;
      return data;
    } catch (error) {
      console.warn(`Erreur parsing personnage à offset ${offset}:`, error);
      return { ...data, bytesRead: 8 };
    }
  }

  /**
   * Parse les statistiques générales
   * @param {DataView} view - La vue du buffer
   * @param {number} offset - L'offset de départ
   * @returns {Object} Les statistiques
   */
  parseStats(view, offset) {
    try {
      return {
        totalRuns: view.getUint32(offset, true),
        totalVictories: view.getUint32(offset + 4, true),
        totalDeaths: view.getUint32(offset + 8, true),
        playtime: view.getUint32(offset + 12, true) // en secondes
      };
    } catch (error) {
      console.warn(`Erreur parsing stats:`, error);
      return {
        totalRuns: 0,
        totalVictories: 0,
        totalDeaths: 0,
        playtime: 0
      };
    }
  }

  /**
   * Formate le temps de jeu
   * @param {number} seconds - Nombre de secondes
   * @returns {string} Temps formaté
   */
  formatPlaytime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Calcule le taux de victoire
   * @param {number} runs - Nombre de runs
   * @param {number} victories - Nombre de victoires
   * @returns {string} Pourcentage formaté
   */
  getWinRate(runs, victories) {
    if (runs === 0) return '0%';
    const rate = (victories / runs * 100).toFixed(1);
    return `${rate}%`;
  }

  /**
   * Détermine le DLC basé sur l'ID du personnage
   * @param {number} id - L'ID du personnage
   * @returns {string} Le nom du DLC
   */
  getDLCForCharacter(id) {
    if (id < 10) return 'Rebirth';
    if (id < 16) return 'Afterbirth';
    if (id < 19) return 'Repentance';
    return 'Repentance+';
  }
}

export default IsaacSavefileParser;
