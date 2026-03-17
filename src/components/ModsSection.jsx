import { useLang } from '../context/LangContext.jsx';
import { MODS } from '../constants/mods.js';

export default function ModsSection() {
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
