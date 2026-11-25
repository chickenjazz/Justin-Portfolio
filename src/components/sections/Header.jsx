import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { navSections } from "../../content/site.js";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// Sections the active-section observer tracks, in page order. `description` is a state of the
// hero, not a section of its own, so it never becomes active.
const tracked = navSections.filter((s) => s.id !== "description").map((s) => s.id);
// Sections on a dark ground, where the dots rail switches to light ink.
const DARK = new Set(["work"]);
// Downward travel (px) before the header hides; upward travel that brings it back.
const HIDE_AFTER = 12;
const SHOW_AFTER = 4;
// Within this distance of the top the header always shows.
const TOP_ZONE = 40;

export default function Header() {
  const headerRef = useRef(null);
  const linksRef = useRef(null);
  const [active, setActive] = useState(null);
  const [contactLit, setContactLit] = useState(false);

  // Direction-of-travel auto-hide. Reads only scrollY, once per frame, and writes a class: no
  // React state per scroll event and no layout reads.
  useEffect(() => {
    const header = headerRef.current;
    let last = window.scrollY;
    let travel = 0;
    let frame = 0;
    const setHidden = (hidden) => header.classList.toggle("is-hidden", hidden);
    function update() {
      frame = 0;
      const y = window.scrollY;
      const dy = y - last;
      last = y;
      if (y < TOP_ZONE) {
        travel = 0;
        setHidden(false);
      } else if (dy > 0) {
        travel = Math.max(0, travel) + dy;
        // Keyboard focus inside the header keeps it in view.
        if (travel > HIDE_AFTER && !header.contains(document.activeElement)) setHidden(true);
      } else if (dy < 0) {
        travel = Math.min(0, travel) + dy;
        if (travel < -SHOW_AFTER) setHidden(false);
      }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const focusIn = () => setHidden(false);
    window.addEventListener("scroll", schedule, { passive: true });
    header.addEventListener("focusin", focusIn);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      header.removeEventListener("focusin", focusIn);
    };
  }, []);

  // Active section: whichever tracked section crosses a line 40% down the viewport. Sticky tracks
  // overlap their neighbours, so the latest section in page order wins.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const crossing = new Set();
    const contact = document.getElementById("contact");
    // The CTA stage slides up under Milestones while still white and see-through, so it only
    // counts once its scene has committed to the dark state; until then Milestones holds.
    const choose = () => {
      const lit = contact?.dataset.state === "1";
      setContactLit(lit);
      const current = tracked.filter((id) => crossing.has(id) && (id !== "contact" || lit)).pop()
        ?? (crossing.has("contact") ? "milestones" : null);
      if (current) setActive(current);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        choose();
      },
      { rootMargin: "-40% 0px -59% 0px" },
    );
    tracked.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    const states = new MutationObserver(choose);
    if (contact) states.observe(contact, { attributes: true, attributeFilter: ["data-state"] });
    return () => {
      observer.disconnect();
      states.disconnect();
    };
  }, []);

  // The lozenge is one highlight behind the links, shaped with clip-path so its corners stay round
  // while it glides. Measured only when the active link or the nav's size changes.
  useIsoLayoutEffect(() => {
    const links = linksRef.current;
    if (!links) return;
    const loz = links.querySelector(".nav-lozenge");
    const place = () => {
      const link = links.querySelector('a[aria-current="location"]');
      if (!link) {
        loz.classList.remove("is-on");
        return;
      }
      const w = links.clientWidth;
      const h = links.clientHeight;
      loz.style.setProperty("--lz-l", `${link.offsetLeft}px`);
      loz.style.setProperty("--lz-r", `${w - link.offsetLeft - link.offsetWidth}px`);
      loz.style.setProperty("--lz-t", `${link.offsetTop}px`);
      loz.style.setProperty("--lz-b", `${h - link.offsetTop - link.offsetHeight}px`);
      // The first placement lands without gliding in from the left edge.
      if (!loz.classList.contains("is-on")) {
        loz.style.transition = "none";
        loz.classList.add("is-on");
        void loz.offsetWidth;
        loz.style.transition = "";
      }
    };
    place();
    const resize = new ResizeObserver(place);
    resize.observe(links);
    return () => resize.disconnect();
  }, [active]);

  const dark = DARK.has(active) || (active === "contact" && contactLit);

  return (
    <>
      <header className="header" ref={headerRef}>
        <a href="#top" className="brand">
          JM<span>✳</span>
        </a>
        <nav aria-label="Main navigation" className="header-links" ref={linksRef}>
          <span className="nav-lozenge" aria-hidden="true" />
          {navSections
            .filter((s) => s.inHeader)
            .map((s) => (
              <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? "location" : undefined}>
                {s.label}
              </a>
            ))}
        </nav>
        <a className="header-resume" href={`${import.meta.env.BASE_URL}resume.pdf`} target="_blank" rel="noopener">
          Résumé ↗
        </a>
      </header>
      <nav
        className={`section-dots${dark ? " is-dark" : ""}${active === "work" ? " is-away" : ""}`}
        aria-label="Section navigation"
      >
        {navSections
          .filter((s) => s.inRail)
          .map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="section-dot"
              aria-label={s.label}
              aria-current={active === s.id ? "location" : undefined}
            >
              <i aria-hidden="true" />
              <b aria-hidden="true">{s.label}</b>
            </a>
          ))}
      </nav>
    </>
  );
}
