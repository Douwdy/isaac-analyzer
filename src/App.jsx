import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import IsaacSavefileParserV2 from './parsers/IsaacSavefileParser_v2.js';
import { translations } from './data/translations.js';
import { LangContext } from './context/LangContext.jsx';
import { computeDerived, computeSteamDerived } from './utils/derived.js';
import { loadFromSteam } from './utils/steam.js';
import AppHeader from './components/AppHeader.jsx';
import AppFooter from './components/AppFooter.jsx';
import DropZone from './components/DropZone.jsx';
import ModsSection from './components/ModsSection.jsx';
import Dashboard from './components/Dashboard.jsx';
import './styles/App.css';

const CACHE_KEY = 'isaac_tracker_cache';

const B62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function decodeShare(encoded) {
  let n = 0n;
  for (const c of encoded) {
    const v = B62.indexOf(c);
    if (v < 0) throw new Error('invalid');
    n = n * 62n + BigInt(v);
  }
  const bytes = new Uint8Array(81);
  for (let i = 80; i >= 0; i--) { bytes[i] = Number(n & 0xFFn); n >>= 8n; }
  const ids = new Set();
  for (let i = 0; i < bytes.length; i++) {
    for (let bit = 0; bit < 8; bit++) {
      if (bytes[i] & (1 << bit)) {
        const id = i * 8 + bit + 1;
        if (id >= 1 && id <= 641) ids.add(id);
      }
    }
  }
  return ids;
}

function formatCacheAge(t, timestamp) {
  const mins = Math.round((Date.now() - timestamp) / 60000);
  if (mins < 60)              return t.cacheAgoMins(mins);
  const hours = Math.round(mins / 60);
  if (hours < 24)             return t.cacheAgoHours(hours);
  return t.cacheAgoDays(Math.round(hours / 24));
}

export default function App() {
  const [saveData, setSaveData]     = useState(null);
  const [steamData, setSteamData]   = useState(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#share=')) return null;
    try { return { unlockedIds: decodeShare(hash.slice(7)), source: 'shared' }; }
    catch { return null; }
  });
  const [error, setError]           = useState(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [activeTab, setActiveTab]   = useState('overview');
  const [lang, setLang]             = useState(() => localStorage.getItem('lang') || 'en');
  const [cacheInfo, setCacheInfo]   = useState(null);
  const fileInputRef = useRef(null);
  const t = translations[lang];

  const toggleLang = useCallback(() => setLang(l => {
    const next = l === 'en' ? 'fr' : 'en';
    localStorage.setItem('lang', next);
    return next;
  }), []);

  // Read cache metadata on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const cached = JSON.parse(raw);
      if (cached?.source && cached?.timestamp) {
        setCacheInfo({ source: cached.source, timestamp: cached.timestamp, displayId: cached.displayId });
      }
    } catch { /* ignore */ }
  }, []);

  // Persist file save to cache
  useEffect(() => {
    if (!saveData) return;
    try {
      const payload = {
        source: 'file',
        chunks: {
          1:  saveData.chunks[1]?.data?.values  ?? [],
          4:  saveData.chunks[4]?.data?.values  ?? [],
          7:  saveData.chunks[7]?.data?.values  ?? [],
          10: saveData.chunks[10]?.data?.values ?? [],
        },
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      setCacheInfo({ source: 'file', timestamp: payload.timestamp });
    } catch { /* ignore quota errors */ }
  }, [saveData]);

  // Persist Steam session to cache
  useEffect(() => {
    if (!steamData) return;
    if (steamData.source === 'shared') return;
    try {
      const payload = {
        source: 'steam',
        unlockedIds: [...steamData.unlockedIds],
        steamId: steamData.steamId,
        displayId: steamData.displayId,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      setCacheInfo({ source: 'steam', timestamp: payload.timestamp, displayId: steamData.displayId });
    } catch { /* ignore */ }
  }, [steamData]);

  const handleRestoreCache = useCallback(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const cached = JSON.parse(raw);
      if (cached.source === 'file') {
        setSteamData(null);
        setSaveData({
          chunks: {
            1:  { data: { values: cached.chunks[1]  } },
            4:  { data: { values: cached.chunks[4]  } },
            7:  { data: { values: cached.chunks[7]  } },
            10: { data: { values: cached.chunks[10] } },
          },
        });
      } else if (cached.source === 'steam') {
        setSaveData(null);
        setSteamData({
          unlockedIds: new Set(cached.unlockedIds),
          steamId: cached.steamId,
          displayId: cached.displayId,
        });
      }
    } catch { setError(t.errorInvalidFormat); }
  }, [t]);

  const handleClearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setCacheInfo(null);
  }, []);

  const derived = useMemo(() => {
    if (steamData) return computeSteamDerived(steamData);
    if (saveData)  return computeDerived(saveData);
    return null;
  }, [saveData, steamData]);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.dat')) { setError(t.errorInvalidFile); return; }
    setIsLoading(true); setLoadingMsg(t.loading); setError(null);
    try {
      const buf = await file.arrayBuffer();
      const parsed = IsaacSavefileParserV2.parse(buf);
      if (!parsed.header.isValid) throw new Error(t.errorInvalidFormat);
      history.replaceState(null, '', window.location.pathname);
      setSteamData(null); setSaveData(parsed);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleSteamLoad = async (steamId) => {
    setIsLoading(true); setLoadingMsg(t.steamLoading); setError(null);
    try {
      const data = await loadFromSteam(steamId, t);
      history.replaceState(null, '', window.location.pathname);
      setSaveData(null); setSteamData(data);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleReset = () => {
    setSaveData(null); setSteamData(null); setError(null);
    history.replaceState(null, '', window.location.pathname);
  };
  const handleDrop  = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };

  return (
    <LangContext.Provider value={lang}>
      <div className="app-container" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
        <AppHeader lang={lang} onToggleLang={toggleLang} />

        {error && <div className="error-box">{error}</div>}

        {!derived && !isLoading && cacheInfo && (
          <div className="cache-banner">
            <div className="cache-banner-text">
              <span className="cache-banner-title">
                {cacheInfo.source === 'steam' ? t.cacheRestoreSteam : t.cacheRestoreFile}
                {cacheInfo.source === 'steam' && cacheInfo.displayId && ` · ${cacheInfo.displayId}`}
              </span>
              <span className="cache-banner-age">{formatCacheAge(t, cacheInfo.timestamp)}</span>
            </div>
            <div className="cache-banner-actions">
              <button className="btn-primary" onClick={handleRestoreCache}>{t.cacheRestoreBtn}</button>
              <button className="btn-cache-clear" onClick={handleClearCache}>{t.cacheClearBtn}</button>
            </div>
          </div>
        )}

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

        <AppFooter />
      </div>
    </LangContext.Provider>
  );
}
