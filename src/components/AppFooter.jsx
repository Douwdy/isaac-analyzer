import { useLang } from '../context/LangContext.jsx';

export default function AppFooter() {
  const t = useLang();
  return (
    <footer className="app-footer">
      <a className="feedback-btn" href="https://forms.gle/JWKjpy9N7GYkptPGA" target="_blank" rel="noopener noreferrer">
        {t.feedback}
      </a>
      <span className="version-badge">Dead God Tracker - v1.3.5</span>
      <span className="footer-copy">
        © {new Date().getFullYear()} Dead God Tracker — not affiliated with Nicalis or Edmund McMillen
      </span>
    </footer>
  );
}
