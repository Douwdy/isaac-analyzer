import { useState, useRef, useMemo, useCallback } from 'react';
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

export default function App() {
  const [saveData, setSaveData]     = useState(null);
  const [steamData, setSteamData]   = useState(null);
  const [error, setError]           = useState(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [activeTab, setActiveTab]   = useState('overview');
  const [lang, setLang]             = useState(() => localStorage.getItem('lang') || 'en');
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
    if (!file.name.toLowerCase().endsWith('.dat')) { setError(t.errorInvalidFile); return; }
    setIsLoading(true); setLoadingMsg(t.loading); setError(null);
    try {
      const buf = await file.arrayBuffer();
      const parsed = IsaacSavefileParserV2.parse(buf);
      if (!parsed.header.isValid) throw new Error(t.errorInvalidFormat);
      setSteamData(null); setSaveData(parsed);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleSteamLoad = async (steamId) => {
    setIsLoading(true); setLoadingMsg(t.steamLoading); setError(null);
    try {
      const data = await loadFromSteam(steamId, t);
      setSaveData(null); setSteamData(data);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleReset = () => { setSaveData(null); setSteamData(null); setError(null); };
  const handleDrop  = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };

  return (
    <LangContext.Provider value={lang}>
      <div className="app-container" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
        <AppHeader lang={lang} onToggleLang={toggleLang} />

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

        <AppFooter />
      </div>
    </LangContext.Provider>
  );
}
