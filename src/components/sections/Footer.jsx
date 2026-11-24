import { navSections, profile } from "../../content/site.js";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="site-footer-brand">
          <a href="#top" className="brand">
            JM<span>✳</span>
          </a>
          <p>Building thoughtful software, one problem at a time.</p>
        </div>
        <nav aria-label="Sections">
          <h3>Sections</h3>
          <ul>
            {navSections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Elsewhere">
          <h3>Elsewhere</h3>
          <ul>
            {profile.links.map((l) => (
              <li key={l.label}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
            <li>
              <a href={`${import.meta.env.BASE_URL}resume.pdf`} target="_blank" rel="noopener">
                Résumé ↗
              </a>
            </li>
          </ul>
        </nav>
        <div>
          <h3>Contact</h3>
          <ul>
            <li>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </li>
            <li>
              <a href={profile.phone.href}>{profile.phone.label}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>© 2026 Justin Manuzon</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
