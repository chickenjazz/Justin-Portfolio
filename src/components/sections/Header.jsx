import { navSections } from "../../content/site.js";

export default function Header() {
  return (
    <header className="header">
      <a href="#top" className="brand">
        JM<span>✳</span>
      </a>
      <nav aria-label="Main navigation">
        {navSections
          .filter((s) => s.inHeader)
          .map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.label}
            </a>
          ))}
        <a href={`${import.meta.env.BASE_URL}resume.pdf`} target="_blank" rel="noopener">
          Résumé ↗
        </a>
      </nav>
    </header>
  );
}
