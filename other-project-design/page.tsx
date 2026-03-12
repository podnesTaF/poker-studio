"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Animated counter ────────────────────────────────────────────────────────
function CountUp({
  to,
  suffix = "",
  duration = 1600,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(eased * to));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

// ─── Reveal wrapper ───────────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right" | "fade";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const transforms: Record<string, string> = {
    up: "translateY(36px)",
    left: "translateX(-36px)",
    right: "translateX(36px)",
    fade: "scale(0.97)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[direction],
        transition: `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [menuOpen]);

  const links = [
    { href: "#mission", label: "Місія" },
    { href: "#speakers", label: "Спікери" },
    { href: "#info", label: "Інформація" },
    { href: "#organizations", label: "Організатори" },
    { href: "/registration", label: "Реєстрація" },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "background 0.4s ease, box-shadow 0.4s ease",
        background: scrolled ? "rgba(252,248,242,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        boxShadow: scrolled ? "0 1px 0 rgba(180,155,120,0.18)" : "none",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            transition: "opacity 0.4s",
          }}
        >
          <Image
            src={scrolled ? "/images/logo.png" : "/images/logo-white.png"}
            alt="AWAKENING 2026"
            width={240}
            height={60}
            style={{ height: 50, width: "auto" }}
            priority
          />
        </Link>
        <ul
          className="nav-desktop"
          style={{
            display: "flex",
            gap: 32,
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: scrolled ? "#8c7f6e" : "rgba(255,255,255,0.78)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = scrolled
                    ? "#2a231a"
                    : "#fff")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = scrolled
                    ? "#8c7f6e"
                    : "rgba(255,255,255,0.78)")
                }
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/registration"
          className="nav-cta"
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#fff",
            background: "#b5604a",
            padding: "10px 22px",
            textDecoration: "none",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLElement).style.background = "#9a4e3b")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLElement).style.background = "#b5604a")
          }
        >
          Записатися
        </Link>
        <button
          type="button"
          className="nav-burger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: scrolled ? "#2a231a" : "#fff",
          }}
        >
          {menuOpen ? (
            <X size={22} strokeWidth={2} />
          ) : (
            <Menu size={22} strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`nav-mobile-menu ${menuOpen ? "nav-mobile-menu-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="nav-mobile-backdrop" onClick={closeMenu} />
        <div className="nav-mobile-panel">
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={closeMenu}
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#2a231a",
                    textDecoration: "none",
                    padding: "14px 0",
                    borderBottom: "1px solid #e0d6c8",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#b5604a";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#2a231a";
                  }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/registration"
            onClick={closeMenu}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 24,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#fff",
              background: "#b5604a",
              padding: "14px 28px",
              textDecoration: "none",
              width: "100%",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#9a4e3b")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#b5604a")}
          >
            Записатися
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function Marquee() {
  const base = [
    "Пробудження",
    "Єдність",
    "Молитва",
    "Україна",
    "Awakening",
    "Unity",
  ];
  const items = [...base, ...base, ...base, ...base];
  return (
    <div
      style={{
        overflow: "hidden",
        padding: "10px 0",
        borderTop: "1px solid #e0d6c8",
        borderBottom: "1px solid #e0d6c8",
        background: "#f7f2e9",
      }}
    >
      <div
        className="marquee-track"
        style={{ display: "flex", gap: 40, whiteSpace: "nowrap" }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#8c7f6e",
              flexShrink: 0,
            }}
          >
            {item}
            <span style={{ marginLeft: 40, color: "#b5604a", opacity: 0.45 }}>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        body {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #fdfaf5;
          color: #2a231a;
          overflow-x: hidden;
        }

        .serif { font-family: 'Cormorant Garamond', Georgia, serif; }

        /* ── GRID OVERLAY (hero, dark) ── */
        .grid-overlay {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px);
          background-size: 72px 72px;
        }

        /* ── DOT GRID (light sections) ── */
        .dot-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle, #d4c8b4 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.45;
        }

        /* ── LINE GRID (light sections) ── */
        .line-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(#e0d6c8 1px, transparent 1px),
            linear-gradient(90deg, #e0d6c8 1px, transparent 1px);
          background-size: 64px 64px;
          opacity: 0.38;
        }

        /* ── MARQUEE ── */
        .marquee-track { animation: marquee 32s linear infinite; }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ── FLOAT ── */
        @keyframes float {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%     { transform: translateX(-50%) translateY(-6px); }
        }
        .float-badge {
          position: absolute; top: 88px; left: 50%;
          animation: float 4.5s ease-in-out infinite;
          z-index: 10;
        }

        /* ── HERO GLOW ── */
        .hero-glow {
          position: absolute; pointer-events: none; border-radius: 50%;
          filter: blur(90px);
          animation: glow-pulse 7s ease-in-out infinite alternate;
        }
        @keyframes glow-pulse {
          from { opacity: 0.45; }
          to   { opacity: 0.85; }
        }

        /* ── TAG ── */
        .tag {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.22em;
          text-transform: uppercase;
          border: 1px solid #e8b4a4;
          padding: 5px 14px; border-radius: 100px;
          color: #b5604a;
          background: rgba(181,96,74,0.06);
        }
        .tag::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%;
          background: #b5604a; flex-shrink: 0;
        }

        /* ── DIVIDERS ── */
        .hr-warm {
          height: 1px;
          background: linear-gradient(90deg, transparent, #d4c8b4 40%, transparent);
          border: none; margin: 0;
        }
        .hr-terracotta {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e8b4a4 40%, transparent);
          border: none; margin: 0;
        }

        /* ── STAT CARD ── */
        .stat-card {
          padding: 28px 24px; position: relative; overflow: hidden;
          background: #fdfaf5;
          transition: background 0.3s;
        }
        .stat-card::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #b5604a, transparent);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.4s ease;
        }
        .stat-card:hover { background: #f7f2e9; }
        .stat-card:hover::after { transform: scaleX(1); }

        /* ── SPEAKER CARD ── */
        .speaker-card { position: relative; overflow: hidden; }
        .speaker-card .card-img { transition: transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .speaker-card:hover .card-img { transform: scale(1.05); }

        /* ── ORG CARD ── */
        .org-card {
          background: #fdfaf5; border: 1px solid #e0d6c8; overflow: hidden;
          transition: box-shadow 0.35s ease, transform 0.35s ease, border-color 0.35s;
        }
        .org-card:hover {
          box-shadow: 0 12px 48px rgba(180,140,100,0.14);
          transform: translateY(-4px);
          border-color: #d4c8b4;
        }
        .org-card .org-img { transition: transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .org-card:hover .org-img { transform: scale(1.05); }

        /* ── BUTTONS ── */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          background: #b5604a; color: #fff;
          font-size: 12px; font-weight: 700; letter-spacing: 0.16em;
          text-transform: uppercase; text-decoration: none;
          padding: 16px 32px;
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
          transition: background 0.25s, transform 0.25s;
        }
        .btn-primary:hover { background: #9a4e3b; transform: translateY(-2px); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 10px;
          border: 1.5px solid #d4c8b4; color: #4a3f32;
          font-size: 12px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; text-decoration: none; padding: 14px 28px;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .btn-ghost:hover { border-color: #e8b4a4; color: #b5604a; background: rgba(181,96,74,0.04); }

        /* ── AMENITY ── */
        .amenity {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 13px 0; border-bottom: 1px solid #e0d6c8;
          font-size: 14px; color: #4a3f32; transition: color 0.2s;
        }
        .amenity:last-child { border-bottom: none; }
        .amenity:hover { color: #2a231a; }
        .amenity-dot { width: 6px; height: 6px; border-radius: 50%; background: #b5604a; flex-shrink: 0; margin-top: 5px; }

        /* ── FACILITY PILL ── */
        .facility-pill {
          background: rgba(255,255,255,0.78); border: 1px solid rgba(255,255,255,0.55);
          backdrop-filter: blur(8px); padding: 8px 16px; font-size: 12px; color: #2a231a;
          display: flex; align-items: center; gap: 8px; transition: background 0.2s;
        }
        .facility-pill:hover { background: rgba(255,255,255,0.96); }

        /* ── LOCATION INNER: column on mobile ── */
        @media (max-width: 767px) {
          .location-inner {
            flex-direction: column !important;
            flex-wrap: nowrap !important;
            align-items: flex-start !important;
            justify-content: flex-start !important;
            padding: 24px 20px !important;
            gap: 20px !important;
          }
        }
        @media (min-width: 768px) {
          .location-inner {
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
        }

        /* ── NAV BURGER & MOBILE MENU ── */
        .nav-burger { display: none !important; }
        .nav-mobile-menu {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          z-index: 99; pointer-events: none; opacity: 0;
          transition: opacity 0.3s ease, pointer-events 0.3s;
        }
        .nav-mobile-menu-open {
          pointer-events: auto; opacity: 1;
        }
        .nav-mobile-backdrop {
          position: absolute; inset: 0;
          background: rgba(42,26,16,0.4);
          backdrop-filter: blur(6px);
        }
        .nav-mobile-panel {
          position: absolute; top: 64px; left: 0; right: 0;
          background: #fdfaf5; border-bottom: 1px solid #e0d6c8;
          padding: 24px 24px 32px;
          box-shadow: 0 12px 40px rgba(42,26,16,0.12);
        }
        @media (max-width: 767px) {
          .nav-desktop { display: none !important; }
          .nav-cta { display: none !important; }
          .nav-burger { display: flex !important; }
          .hero-meta { display: none !important; }
          .mission-grid { grid-template-columns: 1fr !important; }
          .speakers-grid { grid-template-columns: 1fr !important; }
          .info-grid { grid-template-columns: 1fr !important; }
          .org-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .location-section { padding: 48px 0 !important; overflow: hidden; }
          .location-wrapper { width: 100%; max-width: 100%; overflow: hidden; }
          .location-banner {
            width: 100% !important;
            max-width: 100% !important;
            aspect-ratio: auto !important;
            min-height: 520px !important;
          }
          .location-overlay { background: linear-gradient(180deg, rgba(42,26,16,0.85) 0%, rgba(42,26,16,0.75) 50%, rgba(42,26,16,0.9) 100%) !important; }
          .facility-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .facility-pill { padding: 8px 12px !important; font-size: 11px !important; }
        }
      `}</style>

      <Nav />

      <main>
        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section
          style={{
            position: "relative",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0 }}>
            <video
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/videos/hero-video.mp4" type="video/mp4" />
            </video>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(20,12,6,0.55) 0%, rgba(15,10,5,0.28) 35%, rgba(20,12,6,0.75) 70%, rgba(32,20,10,0.97) 100%)",
              }}
            />
            <div className="grid-overlay" />
            <div
              className="hero-glow"
              style={{
                top: "10%",
                right: "8%",
                width: 480,
                height: 480,
                background:
                  "radial-gradient(circle, rgba(196,147,63,0.15) 0%, transparent 70%)",
              }}
            />
            <div
              className="hero-glow"
              style={{
                bottom: "28%",
                left: "4%",
                width: 320,
                height: 320,
                background:
                  "radial-gradient(circle, rgba(181,96,74,0.12) 0%, transparent 70%)",
                animationDelay: "3.5s",
              }}
            />
          </div>

          {/* Date badge */}
          <div className="float-badge">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                background: "rgba(252,248,242,0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(232,212,168,0.4)",
                color: "#e8d4a8",
                padding: "6px 16px",
                borderRadius: 100,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#c4933f",
                  display: "inline-block",
                }}
              />
              04–08.08.2026 · Stadskanaal, NL
            </span>
          </div>

          {/* Content */}
          <div
            style={{
              position: "relative",
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 24px 80px",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 48,
                alignItems: "flex-end",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "#e8d4a8",
                    marginBottom: 20,
                  }}
                >
                  Християнський табір для української молоді
                </p>
                <h1
                  className="serif"
                  style={{
                    fontSize: "clamp(52px, 8vw, 100px)",
                    fontWeight: 300,
                    lineHeight: 1.0,
                    letterSpacing: "-0.02em",
                    color: "#fff",
                    marginBottom: 32,
                  }}
                >
                  Об'єднані
                  <br />
                  <em style={{ fontStyle: "italic", color: "#e8d4a8" }}>
                    пробудженням
                  </em>
                </h1>
                <div
                  style={{
                    borderLeft: "2px solid #c4933f",
                    paddingLeft: 20,
                    marginBottom: 40,
                    maxWidth: 480,
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.24em",
                      textTransform: "uppercase",
                      color: "#e8d4a8",
                      marginBottom: 6,
                    }}
                  >
                    Івана 17:21
                  </p>
                  <p
                    className="serif"
                    style={{
                      fontSize: 17,
                      fontWeight: 300,
                      fontStyle: "italic",
                      color: "rgba(255,255,255,0.82)",
                      lineHeight: 1.65,
                    }}
                  >
                    «Щоб були всі одно... щоб увірував світ,
                    <br />
                    що Мене Ти послав»
                  </p>
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <Link href="/registration" className="btn-primary">
                    Записатися на табір
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="#mission"
                    className="btn-ghost"
                    style={{
                      borderColor: "rgba(255,255,255,0.25)",
                      color: "rgba(255,255,255,0.75)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "#e8d4a8";
                      (e.currentTarget as HTMLElement).style.color = "#e8d4a8";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "rgba(255,255,255,0.25)";
                      (e.currentTarget as HTMLElement).style.color =
                        "rgba(255,255,255,0.75)";
                    }}
                  >
                    Дізнатися більше
                  </Link>
                </div>
              </div>
              <div
                className="hero-meta"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  minWidth: 160,
                  alignItems: "flex-end",
                }}
              >
                {[
                  { label: "Вік", value: "16 – 30" },
                  { label: "Країни", value: "EU · USA" },
                  { label: "Місто", value: "Stadskanaal" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      textAlign: "right",
                      borderRight: "1px solid rgba(232,212,168,0.3)",
                      paddingRight: 16,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.38)",
                        marginBottom: 2,
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.88)",
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ MARQUEE ═══════════════════════════════════════════════════════ */}
        <Marquee />

        {/* ══ STATS ═════════════════════════════════════════════════════════ */}
        <section
          style={{ background: "#f0e9db", borderBottom: "1px solid #e0d6c8" }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <Reveal>
              <div
                className="stats-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  borderLeft: "1px solid #e0d6c8",
                }}
              >
                {[
                  { num: 7, suffix: " днів", label: "Тривалість табору" },
                  {
                    num: 126,
                    suffix: "+",
                    label: "Українських церков в Європі",
                  },
                  { num: 20, suffix: " країн", label: "Присутність громад" },
                  { num: 3, suffix: " церкви", label: "Організатори" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="stat-card"
                    style={{
                      borderRight: "1px solid #e0d6c8",
                      borderTop: "1px solid #e0d6c8",
                      borderBottom: "1px solid #e0d6c8",
                    }}
                  >
                    <p
                      className="serif"
                      style={{
                        fontSize: "clamp(38px, 4vw, 54px)",
                        fontWeight: 300,
                        color: "#b5604a",
                        lineHeight: 1,
                        marginBottom: 8,
                      }}
                    >
                      <CountUp to={s.num} suffix={s.suffix} />
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#8c7f6e",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ MISSION ═══════════════════════════════════════════════════════ */}
        <section
          id="mission"
          style={{
            background: "#fdfaf5",
            padding: "100px 0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="dot-grid" />
          <div
            style={{
              position: "absolute",
              top: -120,
              right: -180,
              width: 600,
              height: 600,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(196,147,63,0.08) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 24px",
              position: "relative",
            }}
          >
            <div
              className="mission-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 80,
                alignItems: "center",
              }}
            >
              <div>
                <Reveal>
                  <span
                    className="tag"
                    style={{ marginBottom: 24, display: "inline-flex" }}
                  >
                    Місія табору
                  </span>
                  <h2
                    className="serif"
                    style={{
                      fontSize: "clamp(36px, 4vw, 58px)",
                      fontWeight: 300,
                      lineHeight: 1.1,
                      marginBottom: 32,
                      color: "#2a231a",
                    }}
                  >
                    Збираємо молодь
                    <br />
                    <em style={{ fontStyle: "italic", color: "#b5604a" }}>
                      заради пробудження
                    </em>
                  </h2>
                </Reveal>
                <Reveal delay={100}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                      marginBottom: 40,
                    }}
                  >
                    {[
                      "«Об'єднані пробудженням» – табір для української молоді з Європи та Америки, організований церквами з Бельгії, Нідерландів та США.",
                      "Сьогодні в Європі діє близько 126 українських церков у 20 країнах, 80 з яких відкрилися після 2022 року. Та навіть при цьому молодь часто залишається роз'єднаною.",
                      "Наша мета – зібрати молодих людей разом для духовного пробудження, глибокого спілкування та оновлення покликання слідувати за Христом.",
                    ].map((p, i) => (
                      <p
                        key={i}
                        style={{
                          fontSize: 15,
                          lineHeight: 1.8,
                          color: "#4a3f32",
                        }}
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                </Reveal>
                <Reveal delay={180}>
                  <div>
                    {[
                      {
                        label: "Молитва і Слово",
                        desc: "Щоденні зібрання, поклоніння, малі групи",
                      },
                      {
                        label: "Єдність церков",
                        desc: "Спільна праця громад з різних країн",
                      },
                      {
                        label: "Жива спільнота",
                        desc: "Нові друзі, щирі розмови, підтримка",
                      },
                    ].map((item) => (
                      <div key={item.label} className="amenity">
                        <div className="amenity-dot" />
                        <div>
                          <span style={{ fontWeight: 600, color: "#2a231a" }}>
                            {item.label}
                          </span>
                          <span
                            style={{
                              marginLeft: 8,
                              fontSize: 13,
                              color: "#8c7f6e",
                            }}
                          >
                            — {item.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>

              <Reveal delay={120} direction="left">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      gridColumn: "1 / span 2",
                      position: "relative",
                      aspectRatio: "16/9",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src="/images/location/green-zone.jpg"
                      alt="Територія"
                      fill
                      className="object-cover"
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(135deg, rgba(42,35,26,0.22) 0%, transparent 55%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        background: "rgba(252,248,242,0.9)",
                        backdropFilter: "blur(8px)",
                        padding: "5px 12px",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#b5604a",
                      }}
                    >
                      Stadskanaal, NL
                    </div>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "4/3",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src="/images/location/lake.jpg"
                      alt="Озеро"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "4/3",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src="/images/location/bedrooms.jpg"
                      alt="Кімнати"
                      fill
                      className="object-cover"
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        background: "rgba(252,248,242,0.92)",
                        backdropFilter: "blur(8px)",
                        padding: "5px 12px",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#4a3f32",
                      }}
                    >
                      Проживання
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══ LOCATION ══════════════════════════════════════════════════════ */}
        <section
          className="location-section"
          style={{
            background: "#f7f2e9",
            padding: "80px 0",
            borderTop: "1px solid #e0d6c8",
          }}
        >
          <div
            className="location-wrapper"
            style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}
          >
            <Reveal direction="fade">
              <div
                className="location-banner"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  aspectRatio: "21/8",
                  minHeight: 260,
                }}
              >
                <Image
                  src="/images/location/location-main.jpg"
                  alt="Локація"
                  fill
                  className="object-cover"
                />
                <div
                  className="location-overlay"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(90deg, rgba(42,26,16,0.9) 0%, rgba(42,26,16,0.52) 45%, rgba(42,26,16,0.72) 100%)",
                  }}
                />
                <div
                  className="location-inner"
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 32,
                    padding: "0 56px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.26em",
                        textTransform: "uppercase",
                        color: "#e8d4a8",
                        marginBottom: 8,
                      }}
                    >
                      Локація
                    </p>
                    <h3
                      className="serif"
                      style={{
                        fontSize: "clamp(26px, 3.5vw, 46px)",
                        fontWeight: 300,
                        color: "#fff",
                        lineHeight: 1.1,
                      }}
                    >
                      Hoveniersweg 3<br />
                      <em
                        style={{
                          fontStyle: "italic",
                          color: "rgba(255,255,255,0.55)",
                        }}
                      >
                        Stadskanaal, Netherlands
                      </em>
                    </h3>
                    <a
                      href="https://maps.google.com/?q=Hoveniersweg+3,+9502+BW+Stadskanaal,+Netherlands"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#e8d4a8",
                        textDecoration: "none",
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Відкрити на карті
                    </a>
                  </div>
                  <div
                    className="facility-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    {[
                      "Басейн",
                      "Пляжний волейбол",
                      "Баскетбольний майданчик",
                      "Тенісний корт",
                      "Ігрове поле",
                      "Триразове харчування",
                    ].map((f) => (
                      <div key={f} className="facility-pill">
                        <span style={{ color: "#b5604a", fontSize: 8 }}>●</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ SPEAKERS ══════════════════════════════════════════════════════ */}
        <section
          id="speakers"
          style={{ background: "#fdfaf5", padding: "100px 0" }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <Reveal>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  marginBottom: 64,
                }}
              >
                <span className="tag" style={{ marginBottom: 20 }}>
                  Спікери
                </span>
                <h2
                  className="serif"
                  style={{
                    fontSize: "clamp(36px, 5vw, 66px)",
                    fontWeight: 300,
                    color: "#2a231a",
                    lineHeight: 1.05,
                  }}
                >
                  Голос{" "}
                  <em style={{ fontStyle: "italic", color: "#b5604a" }}>
                    пробудження
                  </em>
                </h2>
                <p
                  style={{
                    marginTop: 16,
                    maxWidth: 500,
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: "#8c7f6e",
                  }}
                >
                  Пастори та служителі з різних країн ділитимуться словом та
                  баченням того, як Бог піднімає молоде покоління.
                </p>
              </div>
            </Reveal>

            <div
              className="speakers-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 24,
              }}
            >
              {[
                {
                  name: "Ярослав Ярошенко",
                  country: "UA",
                  role: "Пастор церкви «Ковчег спасіння» Сумська область",
                  image: "/images/speakers/yaroslav.jpg",
                },
                {
                  name: "Валентин Ярошенко",
                  country: "UA",
                  role: "Пастор церкви «Revival» Суми",
                  image: "/images/speakers/valentin.jpg",
                },
                {
                  name: "Богдан Коновалов",
                  country: "UA",
                  role: "Пастор церкви «SkyDoor» Дніпро",
                  image: "/images/speakers/bohdan.jpg",
                },
              ].map((speaker, i) => (
                <Reveal key={speaker.name} delay={i * 100}>
                  <article
                    className="speaker-card"
                    style={{ aspectRatio: "3/4", position: "relative" }}
                  >
                    <div
                      className="card-img"
                      style={{ position: "absolute", inset: 0 }}
                    >
                      <Image
                        src={speaker.image}
                        alt={speaker.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, transparent 20%, rgba(30,20,12,0.62) 60%, rgba(30,20,12,0.95) 100%)",
                        zIndex: 1,
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 2,
                        padding: 28,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: "0.22em",
                          textTransform: "uppercase",
                          background: "#f0e9db",
                          color: "#b5604a",
                          padding: "4px 10px",
                          marginBottom: 10,
                        }}
                      >
                        {speaker.country}
                      </span>
                      <h3
                        className="serif"
                        style={{
                          fontSize: 22,
                          fontWeight: 400,
                          color: "#fff",
                          lineHeight: 1.2,
                          marginBottom: 4,
                        }}
                      >
                        {speaker.name}
                      </h3>
                      <p
                        style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}
                      >
                        {speaker.role}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ INFO ══════════════════════════════════════════════════════════ */}
        <section
          id="info"
          style={{
            background: "#f0e9db",
            padding: "100px 0",
            borderTop: "1px solid #e0d6c8",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="line-grid" />
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 24px",
              position: "relative",
            }}
          >
            <Reveal>
              <div style={{ marginBottom: 64, maxWidth: 520 }}>
                <span
                  className="tag"
                  style={{ marginBottom: 20, display: "inline-flex" }}
                >
                  Інформація
                </span>
                <h2
                  className="serif"
                  style={{
                    fontSize: "clamp(32px, 4vw, 54px)",
                    fontWeight: 300,
                    color: "#2a231a",
                    lineHeight: 1.1,
                  }}
                >
                  Все, що потрібно{" "}
                  <em style={{ fontStyle: "italic", color: "#b5604a" }}>
                    знати
                  </em>
                </h2>
              </div>
            </Reveal>

            <div
              className="info-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 32,
              }}
            >
              <Reveal direction="left">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 24 }}
                >
                  {[
                    { label: "Дати", value: "04.08.2026 – 08.08.2026" },
                    { label: "Тривалість", value: "5 повних днів" },
                    {
                      label: "Адреса",
                      value:
                        "Hoveniersweg 3, 9502 BW\nStadskanaal, Netherlands",
                    },
                    { label: "Вік учасників", value: "16–30 років" },
                    {
                      label: "Мова",
                      value: "Українська (з перекладом на англійську)",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      style={{
                        borderBottom: "1px solid #e0d6c8",
                        paddingBottom: 24,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "#8c7f6e",
                          paddingTop: 3,
                          minWidth: 120,
                        }}
                      >
                        {row.label}
                      </p>
                      <p
                        style={{
                          fontSize: 15,
                          color: "#2a231a",
                          textAlign: "right",
                          lineHeight: 1.55,
                          whiteSpace: "pre-line",
                          flex: 1,
                        }}
                      >
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={120} direction="right">
                <div
                  style={{
                    background: "#fdfaf5",
                    border: "1px solid #e0d6c8",
                    padding: 40,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "#b5604a",
                        marginBottom: 12,
                      }}
                    >
                      Проживання та харчування
                    </p>
                    <p
                      style={{
                        fontSize: 15,
                        lineHeight: 1.8,
                        color: "#4a3f32",
                      }}
                    >
                      Учасники проживають у кімнатах по 3–6 осіб з урахуванням
                      віку, статі та, по можливості, країни проживання.
                      Харчування тричі на день. Постільну білизну треба взяти з
                      собою, або можна доплатити 10£ з людини, щоб взяти у них.
                    </p>
                  </div>
                  <div className="hr-terracotta" />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    {[
                      "Окремі ліжка",
                      "Триразове харчування",
                      "Спортивні зони",
                      "Вечірні зустрічі",
                      "Малі групи",
                      "Кавo-брейки",
                    ].map((item) => (
                      <div
                        key={item}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          fontSize: 13,
                          color: "#4a3f32",
                        }}
                      >
                        <span style={{ color: "#b5604a", fontSize: 8 }}>✦</span>
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="hr-warm" />
                  <p
                    style={{ fontSize: 13, color: "#8c7f6e", lineHeight: 1.75 }}
                  >
                    Для кого: Для української молоді 16–30 років з Європи та
                    США, що прагне глибших стосунків з Богом та єдності з
                    однолітками.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══ ORGANIZATIONS ═════════════════════════════════════════════════ */}
        <section
          id="organizations"
          style={{
            background: "#fdfaf5",
            padding: "100px 0",
            borderTop: "1px solid #e0d6c8",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <Reveal>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  marginBottom: 56,
                }}
              >
                <span className="tag" style={{ marginBottom: 20 }}>
                  Організатори
                </span>
                <h2
                  className="serif"
                  style={{
                    fontSize: "clamp(28px, 3.5vw, 46px)",
                    fontWeight: 300,
                    color: "#2a231a",
                    lineHeight: 1.1,
                    marginBottom: 12,
                  }}
                >
                  Табір організований{" "}
                  <em style={{ fontStyle: "italic", color: "#b5604a" }}>
                    спільно
                  </em>
                </h2>
                <p
                  style={{
                    maxWidth: 480,
                    fontSize: 14,
                    lineHeight: 1.75,
                    color: "#8c7f6e",
                  }}
                >
                  Три церкви з різних країн об'єднались заради однієї мети —
                  зібрати українську молодь і запалити серця пробудженням.
                </p>
              </div>
            </Reveal>

            <div
              className="org-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 20,
              }}
            >
              {[
                {
                  fullName: "Українська церква в Нідерландах",
                  country: "NL",
                  city: "Amsterdam",
                  image: "/images/organizations/emanuil-amsterdam.png",
                  index: "01",
                },
                {
                  fullName: "Українська церква в Бельгії",
                  country: "BE",
                  city: "Brussels",
                  image: "/images/organizations/emanuil-brussels.jpg",
                  index: "02",
                },

                {
                  fullName: "TLOT Mission",
                  country: "USA",
                  city: "United States",
                  image: "/images/organizations/tlot.jpg",
                  index: "03",
                },
              ].map((org, i) => (
                <Reveal key={org.country} delay={i * 90}>
                  <article className="org-card">
                    <div
                      style={{
                        position: "relative",
                        aspectRatio: "4/3",
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src={org.image}
                        alt={org.fullName}
                        fill
                        className="object-cover org-img"
                        sizes="(max-width:640px) 100vw, 33vw"
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(to bottom, rgba(42,35,26,0.05) 0%, rgba(42,35,26,0.32) 55%, rgba(42,35,26,0.8) 100%)",
                          pointerEvents: "none",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          background: "rgba(252,248,242,0.92)",
                          backdropFilter: "blur(8px)",
                          padding: "4px 10px",
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "#8c7f6e",
                        }}
                      >
                        {org.index}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "20px 24px 24px",
                        borderTop: "1px solid #e0d6c8",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            color: "#8c7f6e",
                          }}
                        >
                          {org.city}
                        </p>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            padding: "3px 8px",
                            background: "rgba(181,96,74,0.07)",
                            color: "#b5604a",
                            border: "1px solid #e8b4a4",
                          }}
                        >
                          {org.country}
                        </span>
                      </div>
                      <h3
                        className="serif"
                        style={{
                          fontSize: 18,
                          fontWeight: 400,
                          color: "#2a231a",
                          lineHeight: 1.3,
                        }}
                      >
                        {org.fullName}
                      </h3>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal delay={180}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 20,
                  marginTop: 56,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#8c7f6e",
                }}
              >
                <div style={{ height: 1, width: 56, background: "#d4c8b4" }} />
                Нідерланди · Бельгія · США
                <div style={{ height: 1, width: 56, background: "#d4c8b4" }} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ CTA / CONTACT ═════════════════════════════════════════════════ */}
        <section
          id="contact"
          style={{
            background: "#e8dece",
            padding: "120px 0",
            position: "relative",
            overflow: "hidden",
            borderTop: "1px solid #d4c8b4",
          }}
        >
          <div className="line-grid" style={{ opacity: 0.25 }} />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 800,
              height: 800,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(196,147,63,0.1) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              maxWidth: 680,
              margin: "0 auto",
              padding: "0 24px",
              textAlign: "center",
              position: "relative",
            }}
          >
            <Reveal>
              <span
                className="tag"
                style={{ marginBottom: 24, display: "inline-flex" }}
              >
                Реєстрація
              </span>
              <h2
                className="serif"
                style={{
                  fontSize: "clamp(40px, 6vw, 76px)",
                  fontWeight: 300,
                  color: "#2a231a",
                  lineHeight: 1.05,
                  marginBottom: 24,
                }}
              >
                Готовий приєднатись
                <br />
                <em style={{ fontStyle: "italic", color: "#b5604a" }}>
                  до пробудження?
                </em>
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: "#8c7f6e",
                  lineHeight: 1.8,
                  marginBottom: 32,
                }}
              >
                Зареєструйся онлайн або звʼяжись з нами, якщо є питання.
                <br />
                Місця обмежені.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginBottom: 48,
                }}
              >
                <Link
                  href="/registration"
                  className="btn-primary"
                  style={{ padding: "18px 44px", fontSize: 13 }}
                >
                  Зареєструватись
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 20,
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginBottom: 48,
                }}
              >
                {[
                  {
                    name: "Євчева Лариса (Лора)",
                    location: "Амстердам",
                    phone: "+380963877332",
                    note: null,
                  },
                  {
                    name: "Банар Вікторія",
                    location: "Бельгія",
                    phone: "+32 465 10 02 89",
                    note: null,
                  },
                  {
                    name: "Avelina Kondar",
                    location: "USA",
                    phone: "+1 (423) 504-7424",
                    note: null,
                  },
                ].map((c) => (
                  <div
                    key={c.phone}
                    style={{
                      textAlign: "center",
                      padding: "12px 20px",
                      background: "rgba(255,255,255,0.4)",
                      border: "1px solid #e0d6c8",
                      borderRadius: 8,
                      minWidth: 260,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#2a231a",
                        marginBottom: 2,
                      }}
                    >
                      {c.name}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "#8c7f6e",
                        marginBottom: 4,
                      }}
                    >
                      {c.location}
                    </p>
                    <a
                      href={`tel:${c.phone.replace(/\s/g, "")}`}
                      style={{
                        fontSize: 14,
                        color: "#b5604a",
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      {c.phone}
                    </a>
                    {c.note && (
                      <p
                        style={{ fontSize: 11, color: "#8c7f6e", marginTop: 4 }}
                      >
                        {c.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div
                style={{
                  paddingTop: 40,
                  borderTop: "1px solid #d4c8b4",
                  display: "flex",
                  justifyContent: "center",
                  gap: 48,
                  flexWrap: "wrap",
                }}
              >
                {[
                  { label: "Дата", value: "04–08.08.2026" },
                  { label: "Вік", value: "16–30 років" },
                  { label: "Місце", value: "Stadskanaal, NL" },
                ].map((item) => (
                  <div key={item.label} style={{ textAlign: "center" }}>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "#8c7f6e",
                        marginBottom: 4,
                      }}
                    >
                      {item.label}
                    </p>
                    <p style={{ fontSize: 15, color: "#2a231a" }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
        <footer
          style={{
            background: "#f0e9db",
            borderTop: "1px solid #e0d6c8",
            padding: "28px 24px",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                transition: "opacity 0.4s",
              }}
            >
              <Image
                src={"/images/logo.png"}
                alt="AWAKENING 2026"
                width={240}
                height={60}
                style={{ height: 50, width: "auto" }}
                priority
              />
            </Link>{" "}
            <p style={{ fontSize: 11, color: "#8c7f6e", opacity: 0.8 }}>
              Християнський табір · Stadskanaal, Netherlands · 04–08.08.2026
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
