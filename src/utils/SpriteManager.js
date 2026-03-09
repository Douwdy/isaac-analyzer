/**
 * Sprite Manager pour Isaac Save Analyzer
 * Gère l'extraction et l'affichage des sprites depuis les spritesheets
 */

class SpriteManager {
  static SPRITE_SIZE = 32; // Taille des icônes de personnages
  static GRID_WIDTH = 8; // 8 personnages par ligne (512 / 64)

  // Mapping des personnages dans l'ordre du spritesheet
  static CHARACTER_POSITIONS = {
    // Row 0
    isaac: { row: 0, col: 0 },
    magdalene: { row: 0, col: 1 },
    cain: { row: 0, col: 2 },
    judas: { row: 0, col: 3 },
    eve: { row: 0, col: 4 },
    samson: { row: 0, col: 5 },
    azazel: { row: 0, col: 6 },
    lazarus: { row: 0, col: 7 },
    
    // Row 1 (Afterbirth)
    eden: { row: 1, col: 0 },
    lost: { row: 1, col: 1 },
    keeper: { row: 1, col: 2 },
    apollyon: { row: 1, col: 3 },
    lilith: { row: 1, col: 4 },
    blue_baby: { row: 1, col: 5 },
    the_forgotten: { row: 1, col: 6 },
    void: { row: 1, col: 7 },
    
    // Row 2 (Repentance)
    bethany: { row: 2, col: 0 },
    jacob_esau: { row: 2, col: 1 },
    // ... autres personnages repentance
  };

  // Mapping des noms localisés
  static CHARACTER_NAMES = {
    isaac: 'Isaac',
    magdalene: 'Magdalene',
    cain: 'Cain',
    judas: 'Judas',
    eve: 'Eve',
    samson: 'Samson',
    azazel: 'Azazel',
    lazarus: 'Lazarus',
    eden: 'Eden',
    lost: 'The Lost',
    keeper: 'Keeper',
    apollyon: 'Apollyon',
    lilith: 'Lilith',
    blue_baby: 'Blue Baby',
    the_forgotten: 'The Forgotten',
    void: 'The Void',
    bethany: 'Bethany',
    jacob_esau: 'Jacob & Esau',
  };

  // Index des personnages pour mapper avec les données de sauvegarde
  static CHARACTER_INDEX = [
    'isaac',       // 0
    'magdalene',   // 1
    'cain',        // 2
    'judas',       // 3
    'eve',         // 4
    'samson',      // 5
    'azazel',      // 6
    'lazarus',     // 7
    'eden',        // 8
    'lost',        // 9
    'keeper',      // 10
    'apollyon',    // 11
    'blue_baby',   // 12
    'lilith',      // 13
    'the_forgotten', // 14
    'void',        // 15
    'bethany',     // 16
    'jacob_esau',  // 17
  ];

  /**
   * Obtenir les coordonnées canvas pour un personnage
   */
  static getCharacterCoordinates(characterId) {
    const charName = this.CHARACTER_INDEX[characterId];
    if (!charName) return null;

    const pos = this.CHARACTER_POSITIONS[charName];
    if (!pos) return null;

    return {
      x: pos.col * 64, // 64 pixels par colonne
      y: pos.row * 32, // 32 pixels par ligne
      width: 32,
      height: 32,
    };
  }

  /**
   * Obtenir le nom du personnage
   */
  static getCharacterName(characterId) {
    const charName = this.CHARACTER_INDEX[characterId];
    return this.CHARACTER_NAMES[charName] || `Character ${characterId}`;
  }

  /**
   * Créer un canvas avec le sprite d'un personnage
   */
  static createCharacterCanvas(characterId, spritesheet) {
    const coords = this.getCharacterCoordinates(characterId);
    if (!coords) return null;

    const canvas = document.createElement('canvas');
    canvas.width = coords.width;
    canvas.height = coords.height;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false; // Pixel art

    ctx.drawImage(
      spritesheet,
      coords.x,
      coords.y,
      coords.width,
      coords.height,
      0,
      0,
      coords.width,
      coords.height
    );

    return canvas;
  }

  /**
   * Créer une URL blob pour afficher le sprite
   */
  static getCharacterSpriteDataUrl(characterId, spritesheet) {
    const canvas = this.createCharacterCanvas(characterId, spritesheet);
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  }

  /**
   * Extraction des completion marks depuis le spritesheet
   * Format: Grille de completion widgets avec icônes
   */
  static COMPLETION_MARKS = [
    { id: 0, name: 'Mom', color: 'blue' },
    { id: 1, name: 'Heart', color: 'blue' },
    { id: 2, name: 'Leviathan', color: 'red' },
    { id: 3, name: 'Satan', color: 'teal' },
    { id: 4, name: 'Isaac', color: 'red' },
    { id: 5, name: 'Mega Satan', color: 'teal' },
    { id: 6, name: 'The Lamb', color: 'purple' },
    { id: 7, name: 'Blue Baby', color: 'purple' },
    { id: 8, name: 'Monstro II', color: 'red' },
  ];

  /**
   * Obtenir les coordonnées d'un completion mark
   * Les widgets sont dans une grille 6x2 (384x384)
   */
  static getCompletionMarkCoordinates(markId) {
    const WIDGET_SIZE = 64; // Chaque widget fait ~60x60 pixels
    const COLS = 6; // 6 colonnes

    const row = Math.floor(markId / COLS);
    const col = markId % COLS;

    return {
      x: col * WIDGET_SIZE,
      y: row * WIDGET_SIZE,
      width: 60,
      height: 60,
    };
  }

  /**
   * Créer un canvas pour un completion mark
   */
  static createCompletionMarkCanvas(markId, spritesheet) {
    const coords = this.getCompletionMarkCoordinates(markId);
    const canvas = document.createElement('canvas');
    canvas.width = 60;
    canvas.height = 60;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      spritesheet,
      coords.x,
      coords.y,
      coords.width,
      coords.height,
      0,
      0,
      60,
      60
    );

    return canvas;
  }

  /**
   * Obtenir l'URL data pour un completion mark
   */
  static getCompletionMarkDataUrl(markId, spritesheet) {
    const canvas = this.createCompletionMarkCanvas(markId, spritesheet);
    return canvas.toDataURL('image/png');
  }
}

export default SpriteManager;
