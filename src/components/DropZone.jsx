import { useState } from 'react';
import { useLang } from '../context/LangContext.jsx';
import { iconBoss, iconSteam } from '../utils/sprites.js';
import { STEAM_API_KEY } from '../utils/steam.js';

export default function DropZone({ fileInputRef, onFile, onSteamLoad }) {
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
          <p className="steam-no-key">{t.steamErrorNoKey}</p>
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
