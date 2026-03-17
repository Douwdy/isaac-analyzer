import { useLang } from '../context/LangContext.jsx';

export default function SteamPartialNotice() {
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
