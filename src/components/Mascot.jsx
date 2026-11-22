export default function Mascot({ className = "hero-art" }) {
  return (
    <span className={`mascot ${className}`} aria-hidden="true">
      <span className="orb">
        <span className="eye eye-a" />
        <span className="eye eye-b" />
        <span className="mouth" />
        <span className="chick-feet" />
      </span>
      <span className="shape cube">✳</span>
      <span className="shape ring" />
      <span className="shape square" />
    </span>
  );
}
