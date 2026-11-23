import { profile } from "../../content/site.js";

export default function Footer() {
  return (
    <footer className="footer wrap">
      <a href="#top" className="brand">
        JM<span>✳</span>
      </a>
      <p>
        JUSTIN MANUZON
        <br />
        <span>© 2026 · Portfolio in progress</span>
      </p>
      <div className="footer-contact">
        <nav className="social-links" aria-label="Footer social links">
          {profile.links.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <a href={profile.phone.href}>{profile.phone.label}</a>
      </div>
      <a href="#top">BACK TO TOP ↑</a>
    </footer>
  );
}
