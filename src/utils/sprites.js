// ─── Sprite URL helpers (served from /public/sprites/ — no bundling overhead) ─

export const S = {
  icon:        f => `/sprites/icon/${f}`,
  char:        f => `/sprites/characters/${f}`,
  completion:  f => `/sprites/completion/${f}`,
  achievement: f => `/sprites/achievements/${f}`,
  item:        f => `/sprites/items/${f}`,
  challenge:   f => `/sprites/challenges/${f}`,
};

export const headerLogo      = '/sprites/headerlogo.webp';
export const iconBoss         = S.icon('boss.webp');
export const iconAchievement  = S.icon('achievement.webp');
export const iconChallenges   = S.icon('challenges.webp');
export const iconCollectables = S.icon('collectables.webp');
export const iconCharacter    = S.icon('character.webp');
export const iconOverview     = S.icon('overview.webp');
export const iconTainted      = S.icon('tainted.webp');
export const iconLocked       = S.icon('locked.webp');
export const iconSteam        = S.icon('steam.webp');

// character key → filename
const CHAR_SPRITE_FILE = {
  isaac:         'isaac.webp',
  magdalene:     'magdalene.webp',
  cain:          'cain.webp',
  judas:         'judas.webp',
  blue_baby:     'bluebaby.webp',
  eve:           'eve.webp',
  samson:        'samson.webp',
  azazel:        'azazel.webp',
  lazarus:       'lazarus.webp',
  eden:          'eden.webp',
  lost:          'thelost.webp',
  lilith:        'lilith.webp',
  keeper:        'keeper.webp',
  apollyon:      'apollyon.webp',
  the_forgotten: 'forgotten.webp',
  bethany:       'bethany.webp',
  jacob_esau:    'jacob.webp',
};

// character key → filename (tainted variants)
const CHAR_T_SPRITE_FILE = {
  isaac:         'isaac_V2.webp',
  magdalene:     'magdalene_V2.webp',
  cain:          'cain_V2.webp',
  judas:         'judas_V2.webp',
  blue_baby:     'bluebaby_V2.webp',
  eve:           'eve_V2.webp',
  samson:        'samson_V2.webp',
  azazel:        'azazel_V2.webp',
  lazarus:       'lazarus_V2.webp',
  eden:          'eden_V2.webp',
  lost:          'thelost_V2.webp',
  lilith:        'lilith_V2.webp',
  keeper:        'keeper_V2.webp',
  apollyon:      'apollyon_V2.webp',
  the_forgotten: 'forgotten_V2.webp',
  forgotten:     'forgotten_V2.webp',  // t_forgotten → slice(2) → forgotten
  bethany:       'bethany_V2.webp',
  jacob_esau:    'jacob_V2.webp',
  jacob:         'jacob_V2.webp',      // t_jacob → slice(2) → jacob
};

// mark key → filename
const MARK_SPRITE_FILE = {
  hard_moms_heart: 'Completion_Heart_Hard.webp',
  satan:           'Completion_Sheol_Hard.webp',
  '???_mark':      'Completion_Cathedral_Hard.webp',
  the_lamb:        'Completion_DarkRoom_Hard.webp',
  mega_satan:      'Completion_Brimstone_Hard.webp',
  boss_rush:       'Completion_BossRush_Hard.webp',
  hush:            'Completion_BlueWomb_Hard.webp',
  ultra_greedier:  'Completion_Greed_Hard.webp',
  delirium:        'Repentance_Completion_Void_Hard.webp',
  mother:          'Completion_Mother_Hard.webp',
  beast:           'Completion_Beast_Hard.webp',
  // Tainted-specific
  four_bosses:     'Completion_DarkRoom_Hard.webp',
  hush_boss_rush:  'Completion_BlueWomb_Hard.webp',
};

export function getCharSprite(key) {
  const file = CHAR_SPRITE_FILE[key];
  return file ? S.char(file) : null;
}

export function getTaintedCharSprite(key) {
  const baseKey = key.startsWith('t_') ? key.slice(2) : key;
  const file = CHAR_T_SPRITE_FILE[baseKey];
  return file ? S.char(file) : null;
}

export function getMarkSprite(markKey) {
  const file = MARK_SPRITE_FILE[markKey];
  return file ? S.completion(file) : null;
}
