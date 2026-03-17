import achievementWikiLinks from '../data/achievementWikiLinks.json';
import { CHALLENGE_DATA } from '../data/challengeData.js';
import { S } from './sprites.js';

export const WIKI_BASE = 'https://bindingofisaacrebirth.wiki.gg';

export const wikiUrl = name =>
  WIKI_BASE + (achievementWikiLinks[name] ?? `/wiki/${encodeURIComponent(name.replace(/ /g, '_'))}`);

export const challengeWikiUrl = (id, name) =>
  WIKI_BASE + (CHALLENGE_DATA[id]?.wikiPath ?? `/wiki/${encodeURIComponent(name.replace(/ /g, '_'))}`);

// Some achievement names differ from their wiki image filename
export const ACH_ICON_FILENAME = {
  '???':                                '%3F%3F%3F',
  "???'s Soul":                         "%3F%3F%3F's_Soul",
  "???'s Only Friend":                  "%3F%3F%3F's_Only_Friend",
  'Soul of&#160;???':                   'Soul_of_%3F%3F%3F',
  'Platinum God!':                      '!Platinum_God!',
  '1001%':                              '1001pct',
  '1000000%':                           '1000000pct',
  'D Infinity':                         'D_infinity',
  'Options?':                           'Options%3F',
};

export function achIconUrl(name) {
  const override = ACH_ICON_FILENAME[name];
  const filename = override ?? name.replace(/ /g, '_').replace(/\?/g, '%3F');
  return S.achievement(`Achievement_${filename}_icon.webp`);
}

// Items where collectibles.json name ≠ wiki image filename
export const COLL_ICON_FILENAME = {
  'Blue Box':                     "Pandora's_Box",
  'The Pony':                     'A_Pony',
  'Pay to Play':                  'Pay_To_Play',
  'The Book of Belial (Passive)': 'The_Book_of_Belial',
  'Damocles (Passive)':           'Damocles',
  'Broken Shovel':                'Broken_Shovel_1',
  'Broken Shovel (2)':            'Broken_Shovel_2',
  'Necronomicon':                 'The_Necronomicon',
  'Shoop Da Whoop!':              'Shoop_da_Whoop!',
  'We Need to Go Deeper!':        'We_Need_To_Go_Deeper!',
  'Small Rock':                   'The_Small_Rock',
  'Gamekid':                      'The_Gamekid',
  'Little Chad':                  'Little_C.H.A.D.',
  'Book of Sin':                  'The_Book_of_Sin',
  'Forever Alone':                'Forever_alone',
  'Daddy Long Legs':              'Daddy_Longlegs',
  '$3 Dollar Bill':               '3_Dollar_Bill',
  'Telepathy Book':               'Telepathy_For_Dummies',
  'Meat!':                        'MEAT!',
  'Key Piece #1':                 'Key_Piece_1',
  'Key Piece #2':                 'Key_Piece_2',
  'Contract from Below':          'Contract_From_Below',
  '20/20':                        '20_20',
  "???'s Only Friend":            "Blue_Baby's_Only_Friend",
  'Wait What?':                   'Wait_What',
  'Friend Ball':                  'Friendly_Ball',
  'Heart':                        'Less_Than_Three',
  'Dollar Bill':                  'A_Dollar',
  'Bogo Bombs':                   'BOGO_Bombs',
  'Snack':                        'A_Snack',
  'Maw of the Void':              'Maw_Of_The_Void',
  'Spear of Destiny':             'Spear_Of_Destiny',
  'Crown of Light':               'Crown_Of_Light',
  'Socks':                        'Orphan_Socks',
  'Scooper':                      'The_Scooper',
  'Straw Man':                    'Strawman',
  'Pound of Flesh':               'A_Pound_of_Flesh',
  'Jelly Belly':                  'Belly_Jelly',
  'Swarm':                        'The_Swarm',
  'D Infinity':                   'D_infinity',
  'Glowing Hour Glass':           'Glowing_Hourglass',
};

export function encodeItemName(name) {
  // "Lil' X" → "Lil_X": wiki drops the apostrophe for all Lil' family items
  return name
    .replace(/^Lil' /, 'Lil_')
    .replace(/ /g, '_')
    .replace(/\$/g, '%24')
    .replace(/#/g,  '%23')
    .replace(/\//g, '%2F')
    .replace(/\?/g, '%3F');
  // Apostrophes, !, (, ) are kept literal — local files use actual chars
}

export function collIconUrl(name) {
  const override = COLL_ICON_FILENAME[name];
  const filename = override ?? encodeItemName(name);
  return S.item(`Collectible_${filename}_icon.webp`);
}

export function collWikiUrl(id, name) {
  const override = COLL_ICON_FILENAME[name];
  if (override) {
    const pageName = override.replace(/'/g, '%27').replace(/!/g, '%21');
    return `${WIKI_BASE}/wiki/${pageName}`;
  }
  const filename = name
    .replace(/^Lil' /, 'Lil_')
    .replace(/ /g, '_')
    .replace(/'/g, '%27')
    .replace(/\$/g, '%24')
    .replace(/#/g,  '%23')
    .replace(/\//g, '%2F')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\?/g, '%3F')
    .replace(/!/g,  '%21')
    .replace(/\+/g, '%2B');
  return `${WIKI_BASE}/wiki/${filename}`;
}
