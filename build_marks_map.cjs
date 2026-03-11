const data = JSON.parse(require('fs').readFileSync('./src/data/achievements.json','utf8'));
// ORDER MATTERS: longer/specific matches must come before substrings
const BOSS_TO_MARK = [
  ['mega satan',     'mega_satan'],
  ['ultra greedier', 'ultra_greedier'],
  ['moms heart',     'hard_moms_heart'],
  ['it lives',       'hard_moms_heart'],
  ['the beast',      'the_beast'],
  ['the lamb',       'the_lamb'],
  ['boss rush',      'boss_rush'],
  ['delirium',       'delirium'],
  ['mother',         'mother'],
  ['satan',          'satan'],
  ['hush',           'hush'],
];
const QQQ_BOSSES = ['defeat ???', 'kill ???'];

const CHAR_PATTERNS = [
  [/as tainted isaac/,       't_isaac'],
  [/as tainted magdalene/,   't_magdalene'],
  [/as tainted cain/,        't_cain'],
  [/as tainted judas/,       't_judas'],
  [/as tainted&#160;\?+/,    't_blue_baby'],
  [/as tainted eve/,         't_eve'],
  [/as tainted samson/,      't_samson'],
  [/as tainted azazel/,      't_azazel'],
  [/as tainted lazarus/,     't_lazarus'],
  [/as tainted eden/,        't_eden'],
  [/as tainted lost/,        't_lost'],
  [/as tainted lilith/,      't_lilith'],
  [/as tainted keeper/,      't_keeper'],
  [/as tainted apollyon/,    't_apollyon'],
  [/as tainted forgotten/,   't_forgotten'],
  [/as tainted bethany/,     't_bethany'],
  [/as tainted jacob/,       't_jacob'],
  [/as \?{2,}/,              'blue_baby'],
  [/as isaac/,               'isaac'],
  [/as magdalene/,           'magdalene'],
  [/as cain/,                'cain'],
  [/as judas/,               'judas'],
  [/as eve\b/,               'eve'],
  [/as samson/,              'samson'],
  [/as azazel/,              'azazel'],
  [/as lazarus/,             'lazarus'],
  [/as eden/,                'eden'],
  [/as (?:the )?lost/,       'lost'],
  [/as lilith/,              'lilith'],
  [/as keeper/,              'keeper'],
  [/as apollyon/,            'apollyon'],
  [/as (?:the )?forgotten/,  'the_forgotten'],
  [/as bethany/,             'bethany'],
  [/as jacob/,               'jacob_esau'],
];

const map = {};
Object.entries(data).forEach(function([id, v]) {
  const raw = (v.unlockDescription || '');
  const desc = raw.toLowerCase().replace(/['\u2019]/g,'').replace("mom's",'moms');

  var charKey = null;
  for (var i=0; i<CHAR_PATTERNS.length; i++) {
    if (CHAR_PATTERNS[i][0].test(desc)) { charKey = CHAR_PATTERNS[i][1]; break; }
  }
  if (!charKey) return;

  var markKey = null;
  if (QQQ_BOSSES.some(function(b){ return desc.includes(b); })) {
    markKey = '???_mark';
  } else {
    for (var j=0; j<BOSS_TO_MARK.length; j++) {
      if (desc.includes(BOSS_TO_MARK[j][0])) { markKey = BOSS_TO_MARK[j][1]; break; }
    }
  }
  if (!markKey) return;
  if (!map[charKey]) map[charKey] = {};
  if (!map[charKey][markKey]) map[charKey][markKey] = parseInt(id);
});

// Sort marks canonically in each entry
var ORDER = ['hard_moms_heart','satan','???_mark','the_lamb','mega_satan','boss_rush','hush','ultra_greedier','delirium','the_beast','mother'];
var result = {};
Object.keys(map).sort().forEach(function(c) {
  result[c] = {};
  ORDER.forEach(function(m) { if (map[c][m]) result[c][m] = map[c][m]; });
});

console.log('Characters mapped:', Object.keys(result).length);
Object.entries(result).forEach(function([c, marks]) { console.log(c + ': ' + JSON.stringify(marks)); });
console.log('\nJS export:\nexport const CHAR_MARK_ACH = ' + JSON.stringify(result, null, 2) + ';');
