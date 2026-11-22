export default function Header() {
  return (
    <header className="header">
      <a href="#top" className="brand">
        JM<span>✳</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="#about">About</a>
        <a href="#work">Work</a>
        <a href="#credentials">Credentials</a>
        <a href="#resume">Resume ↗</a>
      </nav>
    </header>
  );
}
