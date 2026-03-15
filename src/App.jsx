import { useState, useRef, useMemo, useCallback, createContext, useContext } from 'react';
import IsaacSavefileParserV2 from './parsers/IsaacSavefileParser_v2.js';
import achievementsData from './data/achievements.json';
import { CHARACTERS, BOSS_LABELS, NORMAL_MARK_KEYS, TAINTED_MARK_KEYS } from './data/characterMarks.js';
import collectiblesData from './data/collectibles.json';
import itemsDB from './data/items_db.json';
import achievementWikiLinks from './data/achievementWikiLinks.json';
import { CHALLENGE_DATA } from './data/challengeData.js';
import bossesData from './data/bosses.json';
import { translations } from './data/translations.js';
import headerLogo from './assets/sprites/headerlogo.png';
import iconBoss         from './assets/sprites/icon/boss.webp';
import iconAchievement  from './assets/sprites/icon/achievement.webp';
import iconChallenges   from './assets/sprites/icon/challenges.webp';
import iconCollectables from './assets/sprites/icon/collectables.webp';
import iconCharacter    from './assets/sprites/icon/character.webp';
import iconOverview     from './assets/sprites/icon/overview.webp';
import iconTainted      from './assets/sprites/icon/tainted.webp';
import iconLocked       from './assets/sprites/icon/locked.png';
import iconSteam        from './assets/sprites/icon/steam.png';
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

const WIKI_BASE = 'https://bindingofisaacrebirth.wiki.gg';
const wikiUrl = name =>
  WIKI_BASE + (achievementWikiLinks[name] ?? `/wiki/${encodeURIComponent(name.replace(/ /g, '_'))}`);
const challengeWikiUrl = (id, name) =>
  WIKI_BASE + (CHALLENGE_DATA[id]?.wikiPath ?? `/wiki/${encodeURIComponent(name.replace(/ /g, '_'))}`);

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
  'DELETE THIS',
];

const DEAD_GOD_ACHIEVEMENT_ID = 637;
const TOTAL_ACHIEVEMENTS = 641; // 638-641 added in Repentance+

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

// ─── Steam API helpers ────────────────────────────────────────────────────────

const STEAM_APP_ID = '250900';
const STEAM_API_KEY = import.meta.env.VITE_STEAM_API_KEY ?? '';

function fetchJsonp(url) {
  const cb = 'jsonp_' + Math.round(1e6 * Math.random());
  return new Promise((resolve, reject) => {
    window[cb] = data => { delete window[cb]; document.body.removeChild(s); resolve(data); };
    const s = document.createElement('script');
    s.onerror = () => { delete window[cb]; document.body.removeChild(s); reject(new Error('network')); };
    s.src = url + (url.includes('?') ? '&' : '?') + 'jsonp=' + cb;
    document.body.appendChild(s);
  });
}

async function resolveVanityUrl(vanity, t) {
  const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/`
            + `?key=${STEAM_API_KEY}&vanityurl=${encodeURIComponent(vanity)}`;
  let data;
  try { data = await fetchJsonp(url); } catch { throw new Error(t.steamErrorNetwork); }
  if (data?.response?.success !== 1) throw new Error(t.steamErrorInvalid);
  return data.response.steamid;
}

async function loadFromSteam(input, t) {
  if (!STEAM_API_KEY) throw new Error(t.steamErrorNoKey);
  if (!input || input.length < 2) throw new Error(t.steamErrorInvalid);

  // Resolve vanity URL if not a 17-digit SteamID64
  let steamId = input;
  if (!/^\d{17}$/.test(input)) {
    steamId = await resolveVanityUrl(input, t);
  }

  const url = `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/`
            + `?key=${STEAM_API_KEY}&steamid=${steamId}&appid=${STEAM_APP_ID}`;
  let data;
  try { data = await fetchJsonp(url); } catch { throw new Error(t.steamErrorNetwork); }
  if (!data?.playerstats?.achievements) throw new Error(t.steamErrorPrivate);
  const unlockedIds = new Set();
  for (const a of data.playerstats.achievements) {
    const m = a.name.match(/(\d+)$/);
    if (m && a.achieved) unlockedIds.add(parseInt(m[1]));
  }
  return { unlockedIds, steamId, displayId: input };
}

// ─── Composant principal ──────────────────────────────────────────────────────

function App() {
  const [saveData, setSaveData]   = useState(null);
  const [steamData, setSteamData] = useState(null);
  const [error, setError]         = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [lang, setLang]           = useState(() => localStorage.getItem('lang') || 'en');
  const fileInputRef = useRef(null);
  const t = translations[lang];

  const toggleLang = useCallback(() => setLang(l => {
    const next = l === 'en' ? 'fr' : 'en';
    localStorage.setItem('lang', next);
    return next;
  }), []);

  const derived = useMemo(() => {
    if (steamData) return computeSteamDerived(steamData);
    if (saveData)  return computeDerived(saveData);
    return null;
  }, [saveData, steamData]);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.dat')) {
      setError(t.errorInvalidFile);
      return;
    }
    setIsLoading(true);
    setLoadingMsg(t.loading);
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const parsed = IsaacSavefileParserV2.parse(buf);
      if (!parsed.header.isValid) throw new Error(t.errorInvalidFormat);
      setSteamData(null);
      setSaveData(parsed);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSteamLoad = async (steamId) => {
    setIsLoading(true);
    setLoadingMsg(t.steamLoading);
    setError(null);
    try {
      const data = await loadFromSteam(steamId, t);
      setSaveData(null);
      setSteamData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => { setSaveData(null); setSteamData(null); setError(null); };

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
          <button className="lang-btn" onClick={toggleLang}>
            {lang === 'en' ? '🇫🇷' : '🇬🇧'}
          </button>
        </header>

        {error && <div className="error-box">{error}</div>}

        {!derived && !isLoading && (
          <DropZone fileInputRef={fileInputRef} onFile={handleFile} onSteamLoad={handleSteamLoad} />
        )}

        {isLoading && (
          <div className="loading-box">
            <div className="spinner" />
            <span>{loadingMsg}</span>
          </div>
        )}

        {derived && (
          <Dashboard
            derived={derived}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onReset={handleReset}
          />
        )}

        {!derived && !isLoading && <ModsSection />}

        <footer className="app-footer">
          <a className="feedback-btn" href="https://forms.gle/JWKjpy9N7GYkptPGA" target="_blank" rel="noopener noreferrer">{t.feedback}</a>
          <span className="version-badge">Dead God Tracker - v1.3.2</span>
          <span className="footer-copy">© {new Date().getFullYear()} Dead God Tracker — not affiliated with Nicalis or Edmund McMillen</span>
        </footer>
      </div>
    </LangContext.Provider>
  );
}

// ─── Drop zone ────────────────────────────────────────────────────────────────

function DropZone({ fileInputRef, onFile, onSteamLoad }) {
  const t = useLang();
  const [steamId, setSteamId] = useState('');
  const [steamErr, setSteamErr] = useState('');
  const valid = steamId.trim().length >= 2;
  const hasKey = !!STEAM_API_KEY;

  const handleSteam = async (e) => {
    e.stopPropagation();
    setSteamErr('');
    try { await onSteamLoad(steamId.trim()); }
    catch (err) { setSteamErr(err.message); }
  };

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

      <div className="steam-loader" onClick={e => e.stopPropagation()}>
        <div className="steam-loader-divider"><span>{t.steamOr}</span></div>
        {!hasKey ? (
          <p className="steam-no-key">
            {t.steamErrorNoKey}
          </p>
        ) : (
          <>
            <div className="steam-loader-form">
              <input
                className="steam-id-input"
                placeholder={t.steamIdPlaceholder}
                value={steamId}
                onChange={e => { setSteamId(e.target.value); setSteamErr(''); }}
                onKeyDown={e => e.key === 'Enter' && valid && handleSteam(e)}
              />
              <button className="btn-steam" disabled={!valid} onClick={handleSteam}>
                <img src={iconSteam} alt="" className="btn-steam-icon" />
                {t.steamLoadBtn}
              </button>
            </div>
            {steamErr && <p className="steam-error">{steamErr}</p>}
            <p className="steam-hint">{t.steamHint}</p>
          </>
        )}
      </div>
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

function Dashboard({ derived, activeTab, setActiveTab, onReset }) {
  const t = useLang();

  const tabs = [
    { id: 'overview',     icon: iconOverview,     label: t.tabOverview },
    { id: 'achievements', icon: iconAchievement,  label: t.tabAchievements },
    { id: 'challenges',   icon: iconChallenges,   label: t.tabChallenges },
    { id: 'characters',   icon: iconCharacter,    label: t.tabCharacters },
    { id: 'collectibles', icon: iconCollectables, label: t.tabCollectibles },
    // { id: 'bosses',       icon: iconBoss,         label: t.tabBosses }, // WIP
  ];

  return (
    <>
      {derived.source === 'steam' && (
        <div className="steam-source-badge">
          {t.steamBadge(derived.displayId ?? derived.steamId)}
        </div>
      )}
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
        {activeTab === 'bosses'       && <BossesTab derived={derived} />}
      </div>

      <div className="reset-row">
        <button className="btn-secondary" onClick={onReset}>{t.loadAnother}</button>
      </div>
    </>
  );
}

// ─── Derived data computation ─────────────────────────────────────────────────

const DLC_RANGES = [
  { key: 'rebirth',     label: 'Rebirth',     min: 1,   max: 178 },
  { key: 'afterbirth',  label: 'Afterbirth',  min: 179, max: 276 },
  { key: 'afterbirth+', label: 'Afterbirth+', min: 277, max: 403 },
  { key: 'repentance',  label: 'Repentance',  min: 404, max: 641 },
];

// Shared helpers — used by both computeDerived and computeSteamDerived
function buildAchievementData(unlockedIds) {
  const achievementsList = Object.entries(achievementsData)
    .map(([id, a]) => ({ id: parseInt(id), ...a, unlocked: unlockedIds.has(parseInt(id)) }))
    .filter(a => a.id >= 1 && a.id <= TOTAL_ACHIEVEMENTS);
  const lockedAchievements = achievementsList.filter(a => !a.unlocked && a.id !== DEAD_GOD_ACHIEVEMENT_ID);
  const dlcProgress = DLC_RANGES.map(({ key, label, min, max }) => {
    let unlocked = 0;
    for (let i = min; i <= max; i++) { if (unlockedIds.has(i)) unlocked++; }
    const total = max - min + 1;
    return { key, label, unlocked, total, pct: unlocked / total };
  });
  return { achievementsList, lockedAchievements, dlcProgress };
}

function computeDerived(saveData) {
  const chunks = saveData.chunks;

  // Achievements (chunk 1)
  const achValues  = chunks[1]?.data?.values ?? [];
  const unlockedIds = new Set();
  for (let i = 1; i < achValues.length; i++) {
    if (achValues[i] !== 0) unlockedIds.add(i);
  }
  const totalAch = TOTAL_ACHIEVEMENTS;
  const deadGodUnlocked = unlockedIds.has(DEAD_GOD_ACHIEVEMENT_ID);

  const { achievementsList, lockedAchievements, dlcProgress } = buildAchievementData(unlockedIds);

  // Challenges (chunk 7) — données 1-indexées, index 0 ignoré
  const challValues = chunks[7]?.data?.values ?? [];
  const challenges = challValues.slice(1, CHALLENGE_NAMES.length + 1).map((done, idx) => ({
    id: idx + 1,
    name: CHALLENGE_NAMES[idx],
    done: done !== 0,
  }));

  // Collectibles (chunk 4) — skip unassigned IDs (no entry in collectiblesData)
  const collValues = chunks[4]?.data?.values ?? [];
  let seenCount = 0;
  const missedCollectibles = [];
  for (let i = 1; i < collValues.length; i++) {
    if (!collectiblesData[String(i)]) continue; // unassigned slot
    if (collValues[i] !== 0) seenCount++;
    else missedCollectibles.push(i);
  }

  // Bosses (chunk 6) — 1-indexed, position in bossesData matches save file order
  const bossValues  = chunks[6]?.data?.values ?? [];
  const bossesList  = bossesData.map((boss, idx) => ({
    ...boss,
    seen: bossValues.length > idx + 1 ? bossValues[idx + 1] !== 0 : false,
  }));
  const bossesDefeated = bossesList.filter(b => b.seen).length;
  const bossesTotal    = bossValues.length > 1 ? bossValues.length - 1 : bossesData.length;

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
    dlcProgress,
    challenges,
    challengesDone: challenges.filter(c => c.done).length,
    missedCollectibles,
    seenCount,
    collTotal: Object.keys(collectiblesData).filter(k => parseInt(k) >= 1).length,
    source: 'file',
    bossesList, bossesDefeated, bossesTotal,
    seedsActive, seedsTotal,
  };
}

function computeSteamDerived({ unlockedIds, steamId, displayId }) {
  const totalAch = TOTAL_ACHIEVEMENTS;
  const deadGodUnlocked = unlockedIds.has(DEAD_GOD_ACHIEVEMENT_ID);
  const { achievementsList, lockedAchievements, dlcProgress } = buildAchievementData(unlockedIds);
  const collTotal = Object.keys(collectiblesData).filter(k => parseInt(k) >= 1).length;
  const challenges = CHALLENGE_NAMES.map((name, idx) => {
    const id = idx + 1;
    const achId = CHALLENGE_DATA[id]?.achievementId;
    return { id, name, done: achId != null ? unlockedIds.has(achId) : false };
  });
  return {
    source: 'steam',
    steamId,
    displayId: displayId ?? steamId,
    unlockedIds,
    achievementsList,
    lockedAchievements,
    unlockedCount: unlockedIds.size,
    totalAch,
    deadGodUnlocked,
    percent: Math.floor((unlockedIds.size / totalAch) * 100),
    dlcProgress,
    challenges,
    challengesDone: challenges.filter(c => c.done).length,
    missedCollectibles: [],
    seenCount: 0,
    collTotal,
    bossesList: bossesData.map(b => ({ ...b, seen: false })),
    bossesDefeated: 0,
    bossesTotal: bossesData.length,
    seedsActive: 0,
    seedsTotal: 69,
  };
}

// ─── Dead God Progress bar ────────────────────────────────────────────────────

function DeadGodProgress({ derived }) {
  const t = useLang();
  const { unlockedCount, totalAch, percent, deadGodUnlocked, dlcProgress } = derived;
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
      <div className="dlc-progress-grid">
        {dlcProgress.map(dlc => (
          <div key={dlc.key} className={`dlc-bar${dlc.pct === 1 ? ' complete' : ''}`}>
            <div className="dlc-bar-header">
              <span className="dlc-name">{dlc.label}</span>
              <span className="dlc-count">{dlc.unlocked}/{dlc.total}</span>
            </div>
            <div className="mini-progress-track">
              <div className="mini-progress-fill" style={{ width: `${Math.round(dlc.pct * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SteamPartialNotice() {
  const t = useLang();
  return (
    <div className="steam-partial-notice">
      <span className="steam-partial-icon">⚠</span>
      <div>
        <strong>{t.steamPartialTitle}</strong>
        <span>{t.steamPartialNotice}</span>
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
    unlockedIds,
  } = derived;

  const { totalMarks, doneMarks } = computeMarksProgress(unlockedIds);

  const stats = [
    { label: t.statAchievements, value: `${unlockedCount} / ${totalAch}`,           pct: totalAch       > 0 ? unlockedCount  / totalAch           : 0, icon: iconAchievement },
    { label: t.statChallenges,   value: `${challengesDone} / ${challenges.length}`, pct: challenges.length > 0 ? challengesDone / challenges.length : 0, icon: iconChallenges },
    { label: t.statMarks,        value: `${doneMarks} / ${totalMarks}`,              pct: totalMarks     > 0 ? doneMarks      / totalMarks           : 0, icon: iconCharacter },
    ...(derived.source !== 'steam' ? [{ label: t.statCollectibles, value: `${seenCount} / ${collTotal}`, pct: collTotal > 0 ? seenCount / collTotal : 0, icon: iconCollectables }] : []),
  ];

  return (
    <div>
      <div className="stats-grid">
        {stats.map(s => (
          <div className={`stat-card${s.pct >= 1 ? ' stat-card--complete' : ''}`} key={s.label}>
            <div className="stat-icon"><img src={s.icon} className="stat-icon-img" draggable="false" /></div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-pct">{Math.round(s.pct * 100)}%</div>
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

// Pre-computed sets for accurate achievement categorization
const MARK_ACH_IDS = new Set(
  CHARACTERS.flatMap(char => Object.values(char.marks).filter(id => id != null))
);
const CHALLENGE_ACH_IDS = new Set(Object.values(CHALLENGE_DATA).map(d => d.achievementId).filter(Boolean));
// Achievement ID → item kind (pour badge d'affichage + bucket Items dans MissingHighlights)
const ITEM_KIND_BY_ACH = new Map(
  itemsDB.filter(i => i.achievement_id != null).map(i => [i.achievement_id, i.kind])
);

function MissingHighlights({ derived }) {
  const t = useLang();
  const { lockedAchievements, challenges } = derived;
  const missingChallenges = challenges.filter(c => !c.done);

  const buckets = { Marks: [], Challenges: [], Items: [], Other: [] };
  for (const a of lockedAchievements) {
    if (MARK_ACH_IDS.has(a.id))        buckets.Marks.push(a);
    else if (CHALLENGE_ACH_IDS.has(a.id)) buckets.Challenges.push(a);
    else if (ITEM_KIND_BY_ACH.has(a.id)) buckets.Items.push(a);
    else buckets.Other.push(a);
  }

  return (
    <div className="missing-grid">
      <MissingBucket title={t.bucketChallenges(missingChallenges.length)} color="var(--color-red)">
        {missingChallenges.length === 0
          ? <li className="bucket-all-done">{t.bucketAllDone}</li>
          : missingChallenges.map(c => <li key={c.id}><a href={challengeWikiUrl(c.id, c.name)} target="_blank" rel="noopener noreferrer">#{c.id} {c.name}</a></li>)}
      </MissingBucket>
      <MissingBucket title={t.bucketMarks(buckets.Marks.length)} color="var(--color-teal)">
        {buckets.Marks.length === 0
          ? <li className="bucket-all-done">{t.bucketAllDone}</li>
          : buckets.Marks.map(a => <li key={a.id} title={a.unlockDescription}><a href={wikiUrl(a.name)} target="_blank" rel="noopener noreferrer">{a.unlockDescription || a.name}</a></li>)
        }
      </MissingBucket>
      <MissingBucket title={t.bucketItems(buckets.Items.length)} color="var(--color-purple)">
        {buckets.Items.length === 0
          ? <li className="bucket-all-done">{t.bucketAllDone}</li>
          : buckets.Items.map(a => {
            const kind = ITEM_KIND_BY_ACH.get(a.id);
            return (
              <li key={a.id} title={a.unlockDescription}>
                <a href={wikiUrl(a.name)} target="_blank" rel="noopener noreferrer">{a.name}</a>
                {kind && <span className="item-kind-tag">{kind}</span>}
              </li>
            );
          })}
      </MissingBucket>
      <MissingBucket title={t.bucketOther(buckets.Other.length)} color="var(--color-gold)">
        {buckets.Other.length === 0
          ? <li className="bucket-all-done">{t.bucketAllDone}</li>
          : buckets.Other.map(a => <li key={a.id} title={a.unlockDescription}><a href={wikiUrl(a.name)} target="_blank" rel="noopener noreferrer">#{a.id} {a.name}</a></li>)}
      </MissingBucket>
    </div>
  );
}

function MissingBucket({ title, color, children }) {
  return (
    <div className="missing-bucket" style={{ '--bucket-color': color }}>
      <div className="bucket-header">{title}</div>
      <ul className="bucket-list">{children}</ul>
    </div>
  );
}

// ─── Achievements tab ─────────────────────────────────────────────────────────

// Some achievement names differ from their wiki image filename
const ACH_ICON_FILENAME = {
  '???':                                '%3F%3F%3F',
  "???'s Soul":                         "%3F%3F%3F's_Soul",
  "???'s Only Friend":                  "%3F%3F%3F's_Only_Friend",
  'Soul of&#160;???':                   'Soul_of_%3F%3F%3F',
  'Platinum God!':                      '%21Platinum_God%21',
  '1001%':                              '1001%25',
  'D Infinity':                         'D_infinity',
  'Options?':                           'Options%3F',
  'Something wicked this way comes+!':  'Something_wicked_this_way_comes%2B%21',
};

function achIconUrl(name) {
  const override = ACH_ICON_FILENAME[name];
  const filename = override ?? name.replace(/ /g, '_').replace(/\?/g, '%3F').replace(/%/g, '%25').replace(/\+/g, '%2B').replace(/!/g, '%21');
  return `https://bindingofisaacrebirth.wiki.gg/images/Achievement_${filename}_icon.png`;
}

function AchievementsTab({ derived }) {
  const t = useLang();
  const { achievementsList } = derived;
  const [filter, setFilter] = useState('locked');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return achievementsList.filter(a => {
      if (filter === 'locked'   && a.unlocked)  return false;
      if (filter === 'unlocked' && !a.unlocked) return false;
      if (!q) return true;
      return a.name.toLowerCase().includes(q) || a.unlockDescription?.toLowerCase().includes(q);
    });
  }, [achievementsList, filter, search]);

  return (
    <div>
      <div className="filter-row">
        {[['all', t.filterAll], ['locked', t.filterLocked], ['unlocked', t.filterUnlocked]].map(([f, label]) => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {label}
          </button>
        ))}
        <input
          className="coll-search-input"
          placeholder={t.collSearch}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="filter-count">{t.achievementCount(filtered.length)}</span>
        <a className="tips-btn" href="https://bindingofisaacrebirth.wiki.gg/wiki/Achievement_Tips" target="_blank" rel="noopener noreferrer">{t.achievementTips}</a>
      </div>
      <div className="achievement-list">
        {filtered.map(a => (
          <a key={a.id} className={`achievement-row ${a.unlocked ? 'unlocked' : 'locked'}`}
             href={wikiUrl(a.name)} target="_blank" rel="noopener noreferrer">
            <div className="ach-icon">
              <img
                src={achIconUrl(a.name)}
                alt=""
                loading="lazy"
                onError={e => { e.currentTarget.style.visibility = 'hidden'; }}
              />
            </div>
            <span className="ach-status">{a.unlocked ? '✓' : '✗'}</span>
            <span className="ach-id">#{a.id}</span>
            <div className="ach-info">
              <span className="ach-name">{a.name}</span>
              <span className="ach-desc">{a.unlockDescription}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Challenges tab ───────────────────────────────────────────────────────────

const IconEyeOpen = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 3C4.5 3 1.5 8 1.5 8S4.5 13 8 13s6.5-5 6.5-5S11.5 3 8 3zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
    <circle cx="8" cy="8" r="1.5"/>
  </svg>
);
const IconEyeClosed = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 3C4.5 3 1.5 8 1.5 8S4.5 13 8 13s6.5-5 6.5-5S11.5 3 8 3zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
    <circle cx="8" cy="8" r="1.5"/>
    <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

function ChallengesTab({ derived }) {
  const t = useLang();
  const { challenges } = derived;
  const done  = challenges.filter(c => c.done).length;
  const total = challenges.length;
  const [revealed, setRevealed] = useState(new Set());

  const toggle = useCallback((id) => setRevealed(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  }), []);

  return (
    <div>
      <div className="section-summary">
        {t.challengesSummary(done, total)}
        <div className="mini-progress-track" style={{ marginTop: 8 }}>
          <div className="mini-progress-fill" style={{ width: `${total > 0 ? Math.round(done / total * 100) : 0}%` }} />
        </div>
      </div>
      <div className="challenge-list">
        {challenges.map(c => {
          const rwd = CHALLENGE_DATA[c.id];
          const revealReward = c.done || revealed.has(c.id);
          return (
            <div key={c.id} className={`challenge-row ${c.done ? 'done' : 'todo'}`}>
              <div className={`chall-reward-icon${revealReward ? '' : ' hidden'}`}>
                {rwd?.icon
                  ? <img src={rwd.icon} alt={rwd.reward} loading="lazy"
                         onError={e => { e.currentTarget.style.display = 'none'; }} />
                  : <span className="chall-reward-mystery">?</span>
                }
              </div>
              <div className="chall-info">
                <a className="chall-main-link" href={challengeWikiUrl(c.id, c.name)} target="_blank" rel="noopener noreferrer">
                  <span className="chall-status-icon">{c.done ? '✓' : '✗'}</span>
                  <span className="chall-id">#{c.id}</span>
                  <span className="chall-name">{c.name}</span>
                </a>
                {rwd && (
                  <span className={`chall-reward-name${revealReward ? ' visible' : ''}`}>
                    {revealReward ? rwd.reward : '???'}
                  </span>
                )}
              </div>
              {!c.done && rwd && (
                <button className="chall-eye-btn" onClick={() => toggle(c.id)}
                        title={revealReward ? t.hideRewardTooltip : t.revealRewardTooltip}
                        aria-label={revealReward ? t.hideRewardTooltip : t.revealRewardTooltip}>
                  {revealReward ? <IconEyeOpen /> : <IconEyeClosed />}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Characters tab ───────────────────────────────────────────────────────────

// Shared helper — avoids duplicating the marks-counting loop in OverviewTab and CharactersTab
function computeMarksProgress(unlockedIds) {
  let totalMarks = 0, doneMarks = 0;
  for (const char of CHARACTERS) {
    const keys = char.tainted ? TAINTED_MARK_KEYS : NORMAL_MARK_KEYS;
    for (const k of keys) {
      if (char.marks[k] == null) continue;
      totalMarks++;
      if (unlockedIds.has(char.marks[k])) doneMarks++;
    }
  }
  return { totalMarks, doneMarks };
}

function CharactersTab({ derived }) {
  const t = useLang();
  const { unlockedIds } = derived;
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => CHARACTERS.filter(char => {
    if (filter === 'normal')     return !char.tainted;
    if (filter === 'tainted')    return char.tainted;
    if (filter === 'incomplete') {
      const keys = char.tainted ? TAINTED_MARK_KEYS : NORMAL_MARK_KEYS;
      return keys.some(k => char.marks[k] != null && !unlockedIds.has(char.marks[k]));
    }
    return true;
  }), [filter, unlockedIds]);

  const { totalMarks, doneMarks } = useMemo(() => computeMarksProgress(unlockedIds), [unlockedIds]);

  return (
    <div>
      <div className="section-summary">
        {t.marksSummary(doneMarks, totalMarks)}
        <div className="mini-progress-track" style={{ marginTop: 8 }}>
          <div className="mini-progress-fill" style={{ width: `${totalMarks > 0 ? Math.round(doneMarks / totalMarks * 100) : 0}%` }} />
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
  const hasSomeMarks = markKeys.some(k => char.marks[k] != null && unlockedIds.has(char.marks[k]));
  const isLocked   = char.unlockAchId != null && !unlockedIds.has(char.unlockAchId) && !hasSomeMarks;

  const cls = ['char-card', isComplete && 'char-card--complete', char.tainted && 'char-card--tainted', isLocked && 'char-card--locked']
    .filter(Boolean).join(' ');

  return (
    <div className={cls}>
      {isLocked && <div className="char-locked-overlay"><img src={iconLocked} className="char-lock-icon" draggable="false" /></div>}
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

        <div className={`char-marks-row${isLocked ? ' char-marks-row--locked' : ''}`}>
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

// item_id → kind (passifs/actifs uniquement) + item_id → unlock info — single pass
// (trinkets/consommables ont des item_id qui se chevauchent avec passifs/actifs, donc filtre par kind pour COLL_KIND_BY_ID)
const COLL_KIND_BY_ID = new Map();
const ITEM_UNLOCK_BY_ID = new Map();
for (const i of itemsDB) {
  if (i.item_id == null || (i.kind !== 'passive' && i.kind !== 'active')) continue;
  ITEM_UNLOCK_BY_ID.set(i.item_id, { unlockCondition: i.unlock_condition, achievementId: i.achievement_id });
  COLL_KIND_BY_ID.set(i.item_id, i.kind);
}


// Items where collectibles.json name ≠ wiki image filename
const COLL_ICON_FILENAME = {
  // Wrong names / different casing in collectibles.json vs wiki filenames
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
  // Wiki uses different name entirely
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
  // Wiki spellings differ
  'D Infinity':                   'D_infinity',
  'Glowing Hour Glass':           'Glowing_Hourglass',
};

function encodeItemName(name) {
  // "Lil' X" → "Lil_X": wiki drops the apostrophe for all Lil' family items
  return name
    .replace(/^Lil' /, 'Lil_')
    .replace(/ /g, '_')
    .replace(/\$/g, '%24')
    .replace(/#/g,  '%23')
    .replace(/\//g, '%2F')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\?/g, '%3F')
    .replace(/!/g,  '%21')
    .replace(/\+/g, '%2B');
  // Apostrophes are kept literal — the wiki uses them as-is in filenames
}

function collIconUrl(name) {
  const override = COLL_ICON_FILENAME[name];
  if (override) return `https://bindingofisaacrebirth.wiki.gg/images/Collectible_${override}_icon.png`;
  return `https://bindingofisaacrebirth.wiki.gg/images/Collectible_${encodeItemName(name)}_icon.png`;
}


function collWikiUrl(id, name) {
  // 1. Same name correction map used for icons (wiki page names match icon filenames)
  const override = COLL_ICON_FILENAME[name];
  if (override) {
    const pageName = override.replace(/'/g, '%27').replace(/!/g, '%21');
    return `${WIKI_BASE}/wiki/${pageName}`;
  }
  // 3. Build from collectible name directly
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

function CollectiblesTab({ derived }) {
  const t = useLang();
  const { seenCount, collTotal } = derived;
  const [filter, setFilter] = useState('missing');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (derived.source === 'steam') return [];
    const missedSet = new Set(derived.missedCollectibles);
    const { unlockedIds } = derived;
    return Object.entries(collectiblesData)
      .filter(([id]) => parseInt(id) >= 1)
      .map(([id, name]) => {
        const numId = parseInt(id);
        const seen = !missedSet.has(numId);
        const dbItem = ITEM_UNLOCK_BY_ID.get(numId);
        const unlocked = dbItem == null
          || dbItem.unlockCondition === null
          || (dbItem.achievementId != null && unlockedIds.has(dbItem.achievementId));
        return { id: numId, name, seen, unlocked };
      })
      .sort((a, b) => a.id - b.id)
      .filter(c => {
        if (filter === 'missing')          return !c.seen;
        if (filter === 'found')            return c.seen;
        if (filter === 'unlocked_missing') return !c.seen && c.unlocked;
        return true;
      })
      .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || String(c.id).includes(search));
  }, [derived, filter, search]);

  if (derived.source === 'steam') return <SteamPartialNotice />;

  const pct = collTotal > 0 ? Math.round(seenCount / collTotal * 100) : 0;

  return (
    <div>
      <div className="section-summary">
        {t.collectiblesSummary(seenCount, collTotal)}
        <div className="mini-progress-track" style={{ marginTop: 8 }}>
          <div className="mini-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="filter-row">
        {[
          ['all',              t.filterAll],
          ['missing',          t.filterMissing],
          ['found',            t.filterFound],
          ['unlocked_missing', t.filterUnlockedMissing],
        ].map(([f, label]) => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {label}
          </button>
        ))}
        <input
          className="coll-search-input"
          placeholder={t.collSearch}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="filter-count">{t.collItemCount(filtered.length)}</span>
      </div>

      <div className="coll-list">
        {filtered.map(c => {
          const kind = COLL_KIND_BY_ID.get(c.id);
          return (
            <a key={c.id} className={`coll-row ${c.seen ? 'seen' : 'missing'}`}
               href={collWikiUrl(c.id, c.name)} target="_blank" rel="noopener noreferrer">
              <div className="coll-row-icon">
                <img src={collIconUrl(c.name)} alt="" loading="lazy"
                     onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />
              </div>
              <span className="coll-row-id">#{c.id}</span>
              <span className="coll-row-name">{c.name}</span>
              {kind && <span className="item-kind-tag">{kind}</span>}
              <span className="coll-row-status">{c.seen ? '✓' : '✗'}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ─── Bosses tab ───────────────────────────────────────────────────────────────

const WIKI_BOSS_BASE = 'https://bindingofisaacrebirth.wiki.gg';

function BossesTab({ derived }) {
  const t = useLang();
  const { bossesList, bossesDefeated, bossesTotal } = derived;
  const pct = bossesTotal > 0 ? bossesDefeated / bossesTotal : 0;

  return (
    <div>
      <div className="section-summary">
        {t.bossesSummary(bossesDefeated, bossesTotal)}
        <div className="mini-progress-track" style={{ marginTop: 8 }}>
          <div className="mini-progress-fill" style={{ width: `${Math.round(pct * 100)}%` }} />
        </div>
      </div>
      <div className="boss-grid">
        {bossesList.map(boss => (
          <a key={boss.name} className={`boss-card ${boss.seen ? 'seen' : 'unseen'}`}
             href={WIKI_BOSS_BASE + boss.path} target="_blank" rel="noopener noreferrer">
            <div className="boss-portrait">
              <img
                src={boss.sprite}
                alt={boss.name}
                className="boss-portrait-img"
                draggable="false"
                loading="lazy"
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <span className="boss-name">{boss.name}</span>
          </a>
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
