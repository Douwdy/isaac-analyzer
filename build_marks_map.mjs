import data from './src/data/achievements.json' assert { type: 'json' };

const BOSS_TO_MARK = {
  "mom's heart": 'hard_moms_heart', "it lives": 'hard_moms_heart',
  'satan': 'satan', 'the lamb': 'the_lamb', 'mega satan': 'mega_satan',
  'boss rush': 'boss_rush', 'hush': 'hush',
  'ultra greedier': 'ultra_greedier', 'delirium': 'delirium',
  'the beast': 'the_beast', 'mother': 'mother',
  '???': '???_mark',
};
const CHAR_NAMES = {
  'isaac': 'isaac', 'magdalene': 'magdalene', 'cain': 'cain', 'judas': 'judas',
  'blue baby': 'blue_baby', 'eve': 'eve', 'samson': 'samson', 'azazel': 'azazel',
  'lazarus': 'lazarus', 'eden': 'eden', 'the lost': 'lost', 'lost': 'lost',
  'lilith': 'lilith', 'keeper': 'keeper', 'apollyon': 'apollyon',
  'the forgotten': 'the_forgotten', 'forgotten': 'the_forgotten',
  'bethany': 'bethany', 'jacob': 'jacob_esau',
  'tainted isaac': 't_isaac', 'tainted magdalene': 't_magdalene',
  'tainted cain': 't_cain', 'tainted judas': 't_judas',
  'tainted ???': 't_blue_baby', 'tainted eve': 't_eve', 'tainted samson': 't_samson',
  'tainted azazel': 't_azazel', 'tainted lazarus': 't_lazarus', 'tainted eden': 't_eden',
  'tainted lost': 't_lost', 'tainted lilith': 't_lilith', 'tainted keeper': 't_keeper',
  'tainted apollyon': 't_apollyon', 'tainted forgotten': 't_forgotten',
  'tainted bethany': 't_bethany', 'tainted jacob': 't_jacob'
};

const map = {};
Object.entries(data).forEach(([id, v]) => {
  const desc = (v.unlockDescription || '').toLowerCase();
  const charMatch = desc.match(/as (tainted (?:isaac|magdalene|cain|judas|\?\?\?|eve|samson|azazel|lazarus|eden|lost|lilith|keeper|apollyon|forgotten|bethany|jacob)|(?:the )?(?:lost|forgotten)|isaac|magdalene|cain|judas|blue baby|eve|samson|azazel|lazarus|eden|lilith|keeper|apollyon|bethany|jacob)/);
  if (!charMatch) return;
  const charKey = CHAR_NAMES[charMatch[1]];
  if (!charKey) return;
  let markKey = null;
  for (const [boss, mark] of Object.entries(BOSS_TO_MARK)) {
    if (desc.includes(boss)) { markKey = mark; break; }
  }
  if (!markKey) return;
  if (!map[charKey]) map[charKey] = {};
  if (!map[charKey][markKey]) map[charKey][markKey] = parseInt(id);
});

console.log('Characters mapped:', Object.keys(map).length);
Object.entries(map).forEach(([c, marks]) => console.log(c, JSON.stringify(marks)));
