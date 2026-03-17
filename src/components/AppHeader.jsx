import { headerLogo } from '../utils/sprites.js';

export default function AppHeader({ lang, onToggleLang }) {
  return (
    <header className="app-header">
      <img src={headerLogo} alt="Dead God Tracker" className="header-logo" draggable="false" />
      <button className="lang-btn" onClick={onToggleLang}>
        {lang === 'en' ? '🇫🇷' : '🇬🇧'}
      </button>
    </header>
  );
}
