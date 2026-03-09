import { useState, useRef, useMemo, createContext, useContext } from 'react';
import IsaacSavefileParserV2 from './parsers/IsaacSavefileParser_v2.js';
import achievementsData from './data/achievements.json';
import { CHARACTERS, BOSS_LABELS, NORMAL_MARK_KEYS, TAINTED_MARK_KEYS } from './data/characterMarks.js';
import collectiblesData from './data/collectibles.json';
import { translations } from './data/translations.js';
import headerLogo from './assets/sprites/headerlogo.png';
import iconBoss         from './assets/sprites/icon/boss.webp';
import iconAchievement  from './assets/sprites/icon/achievement.webp';
import iconChallenges   from './assets/sprites/icon/challenges.webp';
import iconCollectables from './assets/sprites/icon/collectables.webp';
import iconEasterEggs   from './assets/sprites/icon/eastereggs.webp';
import iconCharacter    from './assets/sprites/icon/character.webp';
import iconOverview     from './assets/sprites/icon/overview.webp';
import iconTainted      from './assets/sprites/icon/tainted.webp';
import './styles/App.css';

// ─── Sprite assets (loaded eagerly via Vite glob) ─────────────────────────────
const charSpriteModules      = import.meta.glob('./assets/sprites/characters/*.png',  { eager: true });
const completionSpriteModules = import.meta.glob('./assets/sprites/completion/*.webp', { eager: true });

// character key → filename
const CHAR_SPRITE_FILE = {
  isaac:         'isaac.png',
  magdalene:     'magdalene.png',
  cain:          'cain.png',
  judas:         'judas.png',
  blue_baby:     'bluebaby.png',
  eve:           'eve.png',
  samson:        'samson.png',
  azazel:        'azazel.png',
  lazarus:       'lazarus.png',
  eden:          'eden.png',
  lost:          'thelost.png',
  lilith:        'lilith.png',
  keeper:        'keeper.png',
  apollyon:      'apollyon.png',
  the_forgotten: 'forgotten.png',
  bethany:       'bethany.png',
  jacob_esau:    'jacob.png',
};

// character key => filename
const CHAR_T_SPRITE_FILE = {
  isaac:         'isaac_V2.png',
  magdalene:     'magdalene_V2.png',
  cain:          'cain_V2.png',
  judas:         'judas_V2.png',
  blue_baby:     'bluebaby_V2.png',
  eve:           'eve_V2.png',
  samson:        'samson_V2.png',
  azazel:        'azazel_V2.png',
  lazarus:       'lazarus_V2.png',
  eden:          'eden_V2.png',
  lost:          'thelost_V2.png',
  lilith:        'lilith_V2.png',
  keeper:        'keeper_V2.png',
  apollyon:      'apollyon_V2.png',
  the_forgotten: 'forgotten_V2.png',
  forgotten:     'forgotten_V2.png',  // t_forgotten → slice(2) → forgotten
  bethany:       'bethany_V2.png',
  jacob_esau:    'jacob_V2.png',
  jacob:         'jacob_V2.png',      // t_jacob → slice(2) → jacob
}

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

function getCharSprite(key) {
  const file = CHAR_SPRITE_FILE[key];
  return file ? charSpriteModules[`./assets/sprites/characters/${file}`]?.default ?? null : null;
}
function getTaintedCharSprite(key) {
  const baseKey = key.startsWith('t_') ? key.slice(2) : key;
  const file = CHAR_T_SPRITE_FILE[baseKey];
  return file ? charSpriteModules[`./assets/sprites/characters/${file}`]?.default ?? null : null;
}
function getMarkSprite(markKey) {
  const file = MARK_SPRITE_FILE[markKey];
  return file ? completionSpriteModules[`./assets/sprites/completion/${file}`]?.default ?? null : null;
}

// ─── i18n ─────────────────────────────────────────────────────────────────────

const LangContext = createContext('en');
function useLang() { return translations[useContext(LangContext)]; }

// ─── Données statiques ────────────────────────────────────────────────────────

const CHALLENGE_NAMES = [
  'Pitch Black', 'High Brow', 'Head Trauma', 'Darkness Falls', 'The Tank',
  'Solar System', 'Suicide King', "Cat Got Your Tongue", 'Demo Man', 'Cursed!',
  'Glass Cannon', 'When Life Gives You Lemons', 'Beans!', "It's in the Cards",
  'Slow Roll', 'Computer Savvy', 'Waka Waka', 'The Host', 'The Family Man',
  'Purist', 'XXXXXXXXL', 'SPEED!', 'Blue Bomber', 'PAY TO PLAY', 'Have a Heart',
  'I RULE!', 'BRAINS!', 'PRIDE DAY!', "Onan's Streak", 'The Guardian',
  'Backasswards', 'Aprils fool', 'Pokey Mans', 'Ultra Hard', 'Pong',
  'Scat Man', 'Bloody Mary', 'Baptism by Fire', "Isaac's Awakening",
  'Seeing Double', 'Pica Run', 'Hot Potato', 'Cantripped!', 'Red Redemption',
  'DELETE THIS', '???',
];

const DEAD_GOD_ACHIEVEMENT_ID = 637;

// ─── Mods Steam Workshop ──────────────────────────────────────────────────────
// Édite ce tableau pour mettre à jour la vitrine de mods

const MODS = [
  {
    id: 1,
    name: 'More Gifts',
    description: 'Introduces various single-use gift items, each spawning random collectibles from specific pools — Angel, Devil, Boss, and Secret rooms.',
    url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3393586594',
    image: 'https://images.steamusercontent.com/ugc/11919673124655618/87E287EED2A280BFC38872BC8521B6CA95970BF2/?imw=637&imh=358',
  },
  {
    id: 2,
    name: 'Elevation Dice',
    description: 'An active item that lets you roll the dice to receive a random damage multiplier buff — high risk, high reward.',
    url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3386916234',
    image: 'https://images.steamusercontent.com/ugc/11919508627993492/85DEBE89AF1E350FDAC45D16C09DBDD083D2F312/?imw=637&imh=358',
  },
  {
    id: 3,
    name: 'Empowering Chip',
    description: 'A single-use item that rerolls one random item pedestal in the room, upgrading it to a superior quality item from a random pool.',
    url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3388652643',
    image: 'https://images.steamusercontent.com/ugc/11919673106065268/7DA49F74030DC39E4A364CB7F1E2E727CCBE1794/?imw=637&imh=358',
  },
];

// ─── Composant principal ──────────────────────────────────────────────────────

function App() {
  const [saveData, setSaveData]   = useState(null);
  const [error, setError]         = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [lang, setLang]           = useState(() => localStorage.getItem('lang') || 'en');
  const fileInputRef = useRef(null);
  const t = translations[lang];

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.dat')) {
      setError(t.errorInvalidFile);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const parsed = IsaacSavefileParserV2.parse(buf);
      if (!parsed.header.isValid) throw new Error(t.errorInvalidFormat);
      setSaveData(parsed);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <LangContext.Provider value={lang}>
      <div className="app-container" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
        <header className="app-header">
          <img src={headerLogo} alt="Dead God Tracker" className="header-logo" draggable="false" />
          <button className="lang-btn" onClick={() => setLang(l => { const next = l === 'en' ? 'fr' : 'en'; localStorage.setItem('lang', next); return next; })}>
            {lang === 'en' ? '🇫🇷' : '🇬🇧'}
          </button>
        </header>

        {error && <div className="error-box">{error}</div>}

        {!saveData && !isLoading && (
          <DropZone fileInputRef={fileInputRef} onFile={handleFile} />
        )}

        {isLoading && (
          <div className="loading-box">
            <div className="spinner" />
            <span>{t.loading}</span>
          </div>
        )}

        {saveData && (
          <Dashboard
            saveData={saveData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onReset={() => { setSaveData(null); setError(null); }}
          />
        )}

        {!saveData && !isLoading && <ModsSection />}

        <footer className="app-footer">
          <a className="feedback-btn" href="https://forms.gle/JWKjpy9N7GYkptPGA" target="_blank" rel="noopener noreferrer">{t.feedback}</a>
          <span className="footer-copy">© {new Date().getFullYear()} Dead God Tracker — not affiliated with Nicalis or Edmund McMillen</span>
        </footer>
      </div>
    </LangContext.Provider>
  );
}

// ─── Drop zone ────────────────────────────────────────────────────────────────

function DropZone({ fileInputRef, onFile }) {
  const t = useLang();
  return (
    <div className="dropzone" onClick={() => fileInputRef.current?.click()}>
      <div className="dropzone-icon"><img src={iconBoss} className="dropzone-sprite" draggable="false" /></div>
      <div className="dropzone-title">{t.dropTitle}</div>
      <div className="dropzone-sub">{t.dropSub}</div>
      <div className="dropzone-path-hint">
        <span className="dropzone-path-label">{t.dropPathLabel}</span>
        <code className="dropzone-path">{t.dropPath}</code>
      </div>
      <button className="btn-primary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
        {t.chooseFile}
      </button>
      <input ref={fileInputRef} type="file" accept=".dat" style={{ display: 'none' }}
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
    </div>
  );
}

// ─── Mods section ────────────────────────────────────────────────────────────

function ModsSection() {
  const t = useLang();
  return (
    <section className="mods-section">
      <h2 className="mods-title">{t.modsTitle}</h2>
      <div className="mods-grid">
        {MODS.map(mod => (
          <a
            key={mod.id}
            className="mod-card"
            href={mod.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {mod.image && (
              <div className="mod-card-img">
                <img src={mod.image} alt={mod.name} draggable="false" />
              </div>
            )}
            <div className="mod-card-body">
              <span className="mod-card-name">{mod.name}</span>
              <span className="mod-card-desc">{mod.description}</span>
              <span className="mod-card-cta">{t.modsCta}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ saveData, activeTab, setActiveTab, onReset }) {
  const t = useLang();
  const derived = useMemo(() => computeDerived(saveData), [saveData]);

  const tabs = [
    { id: 'overview',     icon: iconOverview,     label: t.tabOverview },
    { id: 'achievements', icon: iconAchievement,  label: t.tabAchievements },
    { id: 'challenges',   icon: iconChallenges,   label: t.tabChallenges },
    { id: 'characters',   icon: iconCharacter,    label: t.tabCharacters },
    { id: 'collectibles', icon: iconCollectables, label: t.tabCollectibles },
  ];

  return (
    <>
      <DeadGodProgress derived={derived} />

      <nav className="tab-nav">
        {tabs.map(tab => (
          <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.icon && <img src={tab.icon} className="tab-icon" draggable="false" />}
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="tab-content">
        {activeTab === 'overview'     && <OverviewTab derived={derived} />}
        {activeTab === 'achievements' && <AchievementsTab derived={derived} />}
        {activeTab === 'challenges'   && <ChallengesTab derived={derived} />}
        {activeTab === 'characters'   && <CharactersTab derived={derived} />}
        {activeTab === 'collectibles' && <CollectiblesTab derived={derived} />}
      </div>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button className="btn-secondary" onClick={onReset}>{t.loadAnother}</button>
      </div>
    </>
  );
}

// ─── Derived data computation ─────────────────────────────────────────────────

function computeDerived(saveData) {
  const chunks = saveData.chunks;

  // Achievements (chunk 1)
  const achValues  = chunks[1]?.data?.values ?? [];
  const unlockedIds = new Set();
  for (let i = 1; i < achValues.length; i++) {
    if (achValues[i] !== 0) unlockedIds.add(i);
  }
  const totalAch = DEAD_GOD_ACHIEVEMENT_ID; // 637 real achievements
  const deadGodUnlocked = unlockedIds.has(DEAD_GOD_ACHIEVEMENT_ID);

  // Build achievement details with locked/unlocked info
  const achievementsList = Object.entries(achievementsData)
    .map(([id, a]) => ({ id: parseInt(id), ...a, unlocked: unlockedIds.has(parseInt(id)) }))
    .filter(a => a.id >= 1 && a.id <= DEAD_GOD_ACHIEVEMENT_ID);

  const lockedAchievements = achievementsList.filter(a => !a.unlocked && a.id !== DEAD_GOD_ACHIEVEMENT_ID);

  // Challenges (chunk 7) — données 1-indexées, index 0 ignoré
  const challValues = chunks[7]?.data?.values ?? [];
  const challenges = challValues.slice(1).map((done, idx) => ({
    id: idx + 1,
    name: CHALLENGE_NAMES[idx] ?? `Challenge ${idx + 1}`,
    done: done !== 0,
  }));

  // Collectibles (chunk 4)
  const collValues = chunks[4]?.data?.values ?? [];
  let seenCount = 0;
  const missedCollectibles = [];
  for (let i = 1; i < collValues.length; i++) {
    if (collValues[i] !== 0) seenCount++;
    else missedCollectibles.push(i);
  }

  // Bosses (chunk 6)
  const bossValues     = chunks[6]?.data?.values ?? [];
  const bossesDefeated = bossValues.filter(v => v !== 0).length;
  const bossesTotal    = bossValues.length;

  // Special seeds (chunk 10) — 69 easter eggs in Repentance
  const seedValues    = chunks[10]?.data?.values ?? [];
  const seedsActive   = seedValues.filter(v => v !== 0).length;
  const seedsTotal    = 69;

  return {
    unlockedIds,
    achievementsList,
    lockedAchievements,
    unlockedCount: unlockedIds.size,
    totalAch,
    deadGodUnlocked,
    percent: Math.floor((unlockedIds.size / totalAch) * 100),
    challenges,
    challengesDone: challenges.filter(c => c.done).length,
    missedCollectibles,
    seenCount,
    collTotal: collValues.length - 1,
    bossesDefeated, bossesTotal,
    seedsActive, seedsTotal,
  };
}

// ─── Dead God Progress bar ────────────────────────────────────────────────────

function DeadGodProgress({ derived }) {
  const t = useLang();
  const { unlockedCount, totalAch, percent, deadGodUnlocked } = derived;
  return (
    <div className="dead-god-bar-card">
      <div className="dead-god-bar-header">
        <span className="dead-god-title">{t.deadGodTitle}</span>
        <span className={`dead-god-status ${deadGodUnlocked ? 'done' : 'pending'}`}>
          {deadGodUnlocked ? t.deadGodUnlocked : `${unlockedCount} / ${totalAch} (${percent}%)`}
        </span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="progress-label">
        {t.deadGodRemaining(totalAch - unlockedCount)}
      </div>
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ derived }) {
  const t = useLang();
  const {
    unlockedCount, totalAch,
    challengesDone, challenges,
    seenCount, collTotal,
    bossesDefeated, bossesTotal,
    seedsActive, seedsTotal,
  } = derived;

  const stats = [
    { label: t.statAchievements, value: `${unlockedCount} / ${totalAch}`, pct: unlockedCount / totalAch, icon: iconAchievement },
    { label: t.statChallenges,   value: `${challengesDone} / ${challenges.length}`, pct: challengesDone / challenges.length, icon: iconChallenges },
    { label: t.statCollectibles, value: `${seenCount} / ${collTotal}`, pct: seenCount / collTotal, icon: iconCollectables },
    { label: t.statBosses,       value: `${bossesDefeated} / ${bossesTotal}`, pct: bossesDefeated / bossesTotal, icon: iconBoss },
    { label: t.statEasterEggs,   value: `${seedsActive} / ${seedsTotal}`, pct: seedsActive / seedsTotal, icon: iconEasterEggs },
  ];

  return (
    <div>
      <div className="stats-grid">
        {stats.map(s => (
          <div className={`stat-card${s.pct >= 1 ? ' stat-card--complete' : ''}`} key={s.label}>
            <div className="stat-icon"><img src={s.icon} className="stat-icon-img" draggable="false" /></div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="mini-progress-track">
              <div className="mini-progress-fill" style={{ width: `${Math.round(s.pct * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>{t.whatsNeeded}</SectionTitle>
      <MissingHighlights derived={derived} />
    </div>
  );
}

function MissingHighlights({ derived }) {
  const t = useLang();
  const { lockedAchievements, challenges } = derived;
  const missingChallenges = challenges.filter(c => !c.done);
  // Group locked achievements by keyword
  const buckets = { Challenges: [], Characters: [], Items: [], Other: [] };
  for (const a of lockedAchievements) {
    const ingame = (a.inGameDescription || '').toLowerCase();
    const unlock = (a.unlockDescription || '').toLowerCase();
    if (unlock.includes('challenge') || ingame.includes('challenge')) buckets.Challenges.push(a);
    else if (ingame.includes('new character')) buckets.Characters.push(a);
    else if (ingame.includes('new item') || ingame.includes('new card') || ingame.includes('new trinket') || ingame.includes('new pill') || ingame.includes('new rune')) buckets.Items.push(a);
    else buckets.Other.push(a);
  }

  return (
    <div className="missing-grid">
      <MissingBucket title={t.bucketChallenges(missingChallenges.length)} color="var(--color-red)">
        {missingChallenges.map(c => <li key={c.id}>#{c.id} {c.name}</li>)}
      </MissingBucket>
      <MissingBucket title={t.bucketCharacters(buckets.Characters.length)} color="var(--color-teal)">
        {buckets.Characters.slice(0, 30).map(a => <li key={a.id} title={a.unlockDescription}>#{a.id} {a.name}</li>)}
      </MissingBucket>
      <MissingBucket title={t.bucketItems(buckets.Items.length)} color="var(--color-purple)">
        {buckets.Items.slice(0, 30).map(a => <li key={a.id} title={a.unlockDescription}>#{a.id} {a.name}</li>)}
      </MissingBucket>
      <MissingBucket title={t.bucketOther(buckets.Other.length)} color="var(--color-gold)">
        {buckets.Other.slice(0, 30).map(a => <li key={a.id} title={a.unlockDescription}>#{a.id} {a.name}</li>)}
      </MissingBucket>
    </div>
  );
}

function MissingBucket({ title, color, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="missing-bucket" style={{ '--bucket-color': color }}>
      <button className="bucket-toggle" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && <ul className="bucket-list">{children}</ul>}
    </div>
  );
}

// ─── Achievements tab ─────────────────────────────────────────────────────────

function AchievementsTab({ derived }) {
  const t = useLang();
  const { achievementsList } = derived;
  const [filter, setFilter] = useState('locked');

  const filtered = achievementsList.filter(a => {
    if (filter === 'locked')   return !a.unlocked;
    if (filter === 'unlocked') return a.unlocked;
    return true;
  });

  return (
    <div>
      <div className="filter-row">
        {[['all', t.filterAll], ['locked', t.filterLocked], ['unlocked', t.filterUnlocked]].map(([f, label]) => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {label}
          </button>
        ))}
        <span className="filter-count">{t.achievementCount(filtered.length)}</span>
      </div>
      <div className="achievement-list">
        {filtered.map(a => (
          <div key={a.id} className={`achievement-row ${a.unlocked ? 'unlocked' : 'locked'}`}>
            <span className="ach-status">{a.unlocked ? '✓' : '✗'}</span>
            <span className="ach-id">#{a.id}</span>
            <div className="ach-info">
              <span className="ach-name">{a.name}</span>
              <span className="ach-desc">{a.unlockDescription}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Challenges tab ───────────────────────────────────────────────────────────

function ChallengesTab({ derived }) {
  const t = useLang();
  const { challenges } = derived;
  const done  = challenges.filter(c => c.done).length;
  const total = challenges.length;

  return (
    <div>
      <div className="section-summary">
        {t.challengesSummary(done, total)}
        <div className="mini-progress-track" style={{ marginTop: 8 }}>
          <div className="mini-progress-fill" style={{ width: `${Math.round(done / total * 100)}%` }} />
        </div>
      </div>
      <div className="challenge-grid">
        {challenges.map(c => (
          <div key={c.id} className={`challenge-card ${c.done ? 'done' : 'todo'}`}>
            <span className="chall-id">#{c.id}</span>
            <span className="chall-status">{c.done ? '✓' : '✗'}</span>
            <span className="chall-name">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Characters tab ───────────────────────────────────────────────────────────

function CharactersTab({ derived }) {
  const t = useLang();
  const { unlockedIds } = derived;
  const [filter, setFilter] = useState('all');

  const filtered = CHARACTERS.filter(char => {
    if (filter === 'normal')     return !char.tainted;
    if (filter === 'tainted')    return char.tainted;
    if (filter === 'incomplete') {
      const keys = char.tainted ? TAINTED_MARK_KEYS : NORMAL_MARK_KEYS;
      return keys.some(k => char.marks[k] != null && !unlockedIds.has(char.marks[k]));
    }
    return true;
  });

  let totalMarks = 0, doneMarks = 0;
  for (const char of CHARACTERS) {
    const keys = char.tainted ? TAINTED_MARK_KEYS : NORMAL_MARK_KEYS;
    for (const k of keys) {
      if (char.marks[k] == null) continue;
      totalMarks++;
      if (unlockedIds.has(char.marks[k])) doneMarks++;
    }
  }

  return (
    <div>
      <div className="section-summary">
        {t.marksSummary(doneMarks, totalMarks)}
        <div className="mini-progress-track" style={{ marginTop: 8 }}>
          <div className="mini-progress-fill" style={{ width: `${Math.round(doneMarks / totalMarks * 100)}%` }} />
        </div>
      </div>

      <div className="filter-row">
        {[['all', t.filterAll], ['normal', t.filterNormal], ['tainted', t.filterTainted], ['incomplete', t.filterIncomplete]].map(([v, l]) => (
          <button key={v} className={`filter-btn ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>
            {l}
          </button>
        ))}
        <span className="filter-count">{t.characterCount(filtered.length)}</span>
      </div>

      <div className="char-marks-grid-outer">
        {filtered.map(char => (
          <CharacterMarksCard key={char.id} char={char} unlockedIds={unlockedIds} />
        ))}
      </div>
    </div>
  );
}

function CharacterMarksCard({ char, unlockedIds }) {
  const markKeys   = char.tainted ? TAINTED_MARK_KEYS : NORMAL_MARK_KEYS;
  const doneCount  = markKeys.filter(k => char.marks[k] != null && unlockedIds.has(char.marks[k])).length;
  const totalCount = markKeys.filter(k => char.marks[k] != null).length;
  const isComplete = doneCount === totalCount;
  const sprite     = char.tainted ? getTaintedCharSprite(char.key) : getCharSprite(char.key);

  const cls = ['char-card', isComplete && 'char-card--complete', char.tainted && 'char-card--tainted']
    .filter(Boolean).join(' ');

  return (
    <div className={cls}>
      <div className="char-card-portrait">
        {sprite
          ? <img src={sprite} alt={char.name} className="char-portrait-img" draggable="false" />
          : <div className="char-portrait-placeholder" />
        }
        {char.tainted && <img src={iconTainted} className="tainted-badge" draggable="false" />}
      </div>

      <div className="char-card-body">
        <div className="char-card-title">
          <span className="char-card-name">{char.name}</span>
          <span className={`char-card-score${isComplete ? ' complete' : ''}`}>
            {isComplete ? '★' : `${doneCount}/${totalCount}`}
          </span>
        </div>

        <div className="char-marks-row">
          {markKeys.map(k => {
            const achId = char.marks[k];
            if (achId == null) return null;
            const done       = unlockedIds.has(achId);
            const label      = BOSS_LABELS[k] ?? k;
            const markSprite = getMarkSprite(k);
            return (
              <div key={k} className={`mark-pip${done ? ' mark-pip--done' : ''}`}
                   data-label={label.replace('\n', ' ')}>
                <div className="mark-badge">
                  {markSprite
                    ? <img src={markSprite} alt={label}
                           className={`mark-pip-icon${done ? '' : ' mark-pip-icon--locked'}`}
                           draggable="false" />
                    : <span className="mark-pip-fallback">{done ? '✓' : '✗'}</span>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Collectibles tab ─────────────────────────────────────────────────────────

function CollectiblesTab({ derived }) {
  const t = useLang();
  const { seenCount, collTotal, missedCollectibles } = derived;

  return (
    <div>
      <div className="section-summary">
        {t.collectiblesSummary(seenCount, collTotal)}
        <div className="mini-progress-track" style={{ marginTop: 8 }}>
          <div className="mini-progress-fill" style={{ width: `${Math.round(seenCount / collTotal * 100)}%` }} />
        </div>
      </div>
      <SectionTitle>{t.missingCollectibles(missedCollectibles.length)}</SectionTitle>
      <div className="collectible-grid">
        {missedCollectibles.map(id => (
          <div key={id} className="collectible-chip">
            <span className="coll-id">#{id}</span>
            <span className="coll-name">{collectiblesData[String(id)] ?? `Item ${id}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return <h3 className="section-title">{children}</h3>;
}

export default App;
