"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  X,
  MapPin,
  Mail,
  Phone,
  CheckCircle,
  Loader2,
  Spade,
  ChefHat,
  Gamepad2,
  Mic,
  Lightbulb,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCategoryTheme, SHOWCASE_CATEGORIES } from "@/lib/categories";
import type { LucideIcon } from "lucide-react";

const galleryImages = [
  { src: "/images/poker-table.jpg", horizontal: true, alt: "Poker table setup" },
  { src: "/images/cards-glasses.jpg", horizontal: false, alt: "Poker evening" },
  { src: "/images/cards-poker.jpg", horizontal: false, alt: "At the table" },
  { src: "/images/table-tv.jpg", horizontal: true, alt: "Lounge with screens" },
  { src: "/images/wine-table.jpg", horizontal: false, alt: "Wine & table" },
  { src: "/images/fruit-wine-table.jpg", horizontal: true, alt: "Wine & refreshments" },
  { src: "/images/table-light.jpg", horizontal: false, alt: "Studio interior" },
  { src: "/images/cards-table.jpg", horizontal: false, alt: "Cards on the table" },
];

const ICON_MAP: Record<string, LucideIcon> = {
  Spade,
  ChefHat,
  Gamepad2,
  Mic,
  Lightbulb,
  Sparkles,
};

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

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const links = [
    { href: "#events", label: "Events" },
    { href: "#about", label: "About" },
    { href: "#gallery", label: "Gallery" },
    { href: "#contact", label: "Contact" },
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
        background: scrolled ? "rgba(9,9,11,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        boxShadow: scrolled ? "0 1px 0 rgba(255,255,255,0.06)" : "none",
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
          className="font-display"
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#f5f5f0",
            textDecoration: "none",
            letterSpacing: "0.02em",
          }}
        >
          KITCHEN
          <span
            className="brand-gradient-text"
            style={{ fontWeight: 700 }}
          >
            VERSE
          </span>{" "}
          <span
            className="font-heading"
            style={{
              fontStyle: "italic",
              color: "#c9a96e",
              fontWeight: 400,
              fontSize: 16,
            }}
          >
            Studio
          </span>
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
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "#c9a96e")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color =
                    "rgba(255,255,255,0.55)")
                }
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/events"
          className="nav-cta"
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#fff",
            background: "#c41e3a",
            padding: "10px 22px",
            textDecoration: "none",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLElement).style.background = "#a01830")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLElement).style.background = "#c41e3a")
          }
        >
          Explore Events
        </Link>

        <button
          type="button"
          className="nav-burger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#f5f5f0",
          }}
        >
          {menuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>
      </div>

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
                    color: "#f5f5f0",
                    textDecoration: "none",
                    padding: "14px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#c9a96e")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#f5f5f0")
                  }
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/events"
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
              background: "#c41e3a",
              padding: "14px 28px",
              textDecoration: "none",
              width: "100%",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#a01830")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#c41e3a")}
          >
            Explore Events
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Marquee() {
  const base = [
    "Poker Nights",
    "Cooking Classes",
    "Business Games",
    "Karaoke",
    "Startup Pitches",
    "Wine Tasting",
    "Canary Wharf",
    "Private Events",
  ];
  const items = [...base, ...base, ...base, ...base];

  const colors = ["#c41e3a", "#e07a5f", "#3b82f6", "#a855f7", "#10b981", "#c9a96e", "#c9a96e", "#c41e3a"];
  const allColors = [...colors, ...colors, ...colors, ...colors];

  return (
    <div
      style={{
        overflow: "hidden",
        padding: "12px 0",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "#0f0f0f",
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
              color: "rgba(255,255,255,0.3)",
              flexShrink: 0,
            }}
          >
            {item}
            <span style={{ marginLeft: 40, color: allColors[i], opacity: 0.5 }}>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function SubscribeSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong");
        return;
      }
      setStatus("success");
      setMessage(data.message ?? "Subscribed!");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <section
      style={{
        background: "#0f0f0f",
        padding: "100px 0",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="dot-grid" style={{ opacity: 0.3 }} />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.05) 0%, rgba(196,30,58,0.03) 40%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: "0 24px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <Reveal>
          <span className="tag" style={{ marginBottom: 24, display: "inline-flex" }}>
            Stay Updated
          </span>
          <h2
            className="font-heading"
            style={{
              fontSize: "clamp(36px, 5vw, 60px)",
              fontWeight: 400,
              color: "#f5f5f0",
              lineHeight: 1.05,
              marginBottom: 16,
            }}
          >
            Never miss an{" "}
            <em style={{ fontStyle: "italic", color: "#c9a96e" }}>experience</em>
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.75,
              marginBottom: 36,
              maxWidth: 440,
              margin: "0 auto 36px",
            }}
          >
            Subscribe to get notified about new events across all our worlds
            — poker, cooking, karaoke, and more.
          </p>

          {status === "success" ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                padding: "14px 28px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                color: "#22c55e",
              }}
            >
              <CheckCircle size={18} />
              {message}
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              style={{
                display: "flex",
                gap: 8,
                maxWidth: 440,
                margin: "0 auto",
              }}
              className="subscribe-form"
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                style={{
                  flex: 1,
                  height: 48,
                  padding: "0 16px",
                  fontSize: 14,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  color: "#f5f5f0",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(201,169,110,0.5)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                }
              />
              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  height: 48,
                  padding: "0 24px",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase" as const,
                  color: "#fff",
                  background: "#c41e3a",
                  border: "none",
                  borderRadius: 6,
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                  opacity: status === "loading" ? 0.7 : 1,
                  transition: "background 0.2s, opacity 0.2s",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap" as const,
                }}
                onMouseEnter={(e) =>
                  status !== "loading" &&
                  ((e.target as HTMLElement).style.background = "#a01830")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.background = "#c41e3a")
                }
              >
                {status === "loading" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Mail size={14} />
                )}
                Subscribe
              </button>
            </form>
          )}

          {status === "error" && (
            <p style={{ marginTop: 12, fontSize: 13, color: "#c41e3a" }}>
              {message}
            </p>
          )}

          <p
            style={{
              marginTop: 20,
              fontSize: 11,
              color: "rgba(255,255,255,0.2)",
            }}
          >
            No spam, ever. Unsubscribe anytime.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

type ApiEvent = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  date: string;
  location: string | null;
  category: string | null;
  priceInCents: number;
  maxSeats: number | null;
  published: boolean;
  images: { id: string; url: string; order: number }[];
  _count: { registrations: number };
};

function formatEventDate(iso: string) {
  const d = new Date(iso);
  return {
    day: new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(d),
    short: new Intl.DateTimeFormat("en-GB", {
      month: "short",
      day: "numeric",
    }).format(d),
  };
}

export default function Home() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events?limit=3")
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .catch(() => {})
      .finally(() => setEventsLoading(false));
  }, []);

  return (
    <>
      <Nav />

      <main>
        {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
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
              <source src="/videos/hero.mp4" type="video/mp4" />
            </video>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.7) 70%, rgba(9,9,11,0.98) 100%)",
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
                  "radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)",
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
                  "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
                animationDelay: "3.5s",
              }}
            />
            <div
              className="hero-glow"
              style={{
                top: "40%",
                left: "50%",
                width: 400,
                height: 400,
                background:
                  "radial-gradient(circle, rgba(224,122,95,0.06) 0%, transparent 70%)",
                animationDelay: "6s",
              }}
            />
          </div>

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
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(201,169,110,0.3)",
                color: "#c9a96e",
                padding: "6px 16px",
                borderRadius: 100,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#c9a96e",
                  display: "inline-block",
                }}
              />
              Canary Wharf · London
            </span>
          </div>

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
                  className="font-display"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.45)",
                    marginBottom: 20,
                  }}
                >
                  A Universe of Experiences
                </p>
                <h1 style={{ marginBottom: 28, lineHeight: 0.95 }}>
                  <span
                    className="font-display brand-gradient-text"
                    style={{
                      fontSize: "clamp(48px, 8vw, 110px)",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      display: "block",
                    }}
                  >
                    KitchenVerse
                  </span>
                  <span
                    className="font-heading"
                    style={{
                      fontSize: "clamp(40px, 6vw, 88px)",
                      fontWeight: 400,
                      fontStyle: "italic",
                      color: "#c9a96e",
                      display: "block",
                      marginTop: -4,
                    }}
                  >
                    Studio
                  </span>
                </h1>
                <div
                  style={{
                    borderLeft: "2px solid #c9a96e",
                    paddingLeft: 20,
                    marginBottom: 28,
                    maxWidth: 520,
                  }}
                >
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 300,
                      color: "rgba(255,255,255,0.7)",
                      lineHeight: 1.75,
                    }}
                  >
                    Poker nights, cooking classes, business games, karaoke
                    evenings, and startup pitches — all under one roof in the
                    heart of Canary Wharf.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <Link href="/events" className="btn-primary">
                    View Events
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </Link>
                  <Link href="#about" className="btn-ghost">
                    Learn More
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
                  { label: "Format", value: "Private Events" },
                  { label: "Events", value: "Private" },
                  { label: "Dress", value: "Smart Casual" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      textAlign: "right",
                      borderRight: "1px solid rgba(201,169,110,0.2)",
                      paddingRight: 16,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.3)",
                        marginBottom: 2,
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.8)",
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

        <Marquee />

        {/* ══ EVENT TYPES ══════════════════════════════════════════════════ */}
        <section
          id="events"
          style={{
            background: "#0f0f0f",
            padding: "100px 0",
            position: "relative",
            overflow: "hidden",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="dot-grid" style={{ opacity: 0.3 }} />
          <div
            style={{
              position: "absolute",
              bottom: -200,
              right: -200,
              width: 600,
              height: 600,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 65%)",
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
                <span className="tag tag-gold" style={{ marginBottom: 20 }}>
                  What We Do
                </span>
                <h2
                  className="font-heading"
                  style={{
                    fontSize: "clamp(36px, 5vw, 66px)",
                    fontWeight: 400,
                    color: "#f5f5f0",
                    lineHeight: 1.05,
                  }}
                >
                  Pick your{" "}
                  <em
                    className="brand-gradient-text font-heading"
                    style={{ fontStyle: "italic" }}
                  >
                    evening
                  </em>
                </h2>
                <p
                  style={{
                    marginTop: 16,
                    maxWidth: 500,
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  From poker to pitches, every event is crafted for a unique
                  experience. Find the one that speaks to you.
                </p>
              </div>
            </Reveal>

            <div className="bento-grid">
              {SHOWCASE_CATEGORIES.map((cat, i) => {
                const theme = getCategoryTheme(cat.key);
                const Icon = ICON_MAP[cat.iconName] ?? Sparkles;
                return (
                  <Reveal key={cat.key} delay={i * 60}>
                    <div
                      className="bento-card"
                      style={
                        {
                          "--cat-gradient": theme.gradient,
                          height: "100%",
                        } as React.CSSProperties
                      }
                    >
                      <div
                        className="bento-card-glow"
                        style={{
                          background: `radial-gradient(circle at 20% 20%, ${theme.glow}, transparent 60%)`,
                        }}
                      />
                      <div style={{ position: "relative" }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: theme.bgSubtle,
                            border: `1px solid ${theme.borderSubtle}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 20,
                          }}
                        >
                          <Icon size={20} style={{ color: theme.primary }} />
                        </div>
                        <h3
                          className="font-heading"
                          style={{
                            fontSize: 20,
                            fontWeight: 500,
                            color: "#f5f5f0",
                            marginBottom: 4,
                            lineHeight: 1.2,
                          }}
                        >
                          {cat.label}
                        </h3>
                        <p
                          style={{
                            fontSize: 12,
                            fontStyle: "italic",
                            color: theme.secondary,
                            marginBottom: 12,
                            lineHeight: 1.4,
                          }}
                        >
                          {cat.tagline}
                        </p>
                        <p
                          style={{
                            fontSize: 13,
                            color: "rgba(255,255,255,0.4)",
                            lineHeight: 1.7,
                          }}
                        >
                          {cat.description}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ UPCOMING EVENTS ════════════════════════════════════════════════ */}
        <section
          id="upcoming"
          style={{
            background: "#09090b",
            padding: "100px 0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="line-grid" />
          <div
            style={{
              position: "absolute",
              top: -120,
              left: -180,
              width: 600,
              height: 600,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 65%)",
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
                  Upcoming Events
                </span>
                <h2
                  className="font-heading"
                  style={{
                    fontSize: "clamp(36px, 5vw, 66px)",
                    fontWeight: 400,
                    color: "#f5f5f0",
                    lineHeight: 1.05,
                  }}
                >
                  What&apos;s{" "}
                  <em style={{ fontStyle: "italic", color: "#c41e3a" }}>
                    next
                  </em>
                </h2>
                <p
                  style={{
                    marginTop: 16,
                    maxWidth: 500,
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  Secure your spot at our upcoming experiences.
                  Limited availability across all worlds.
                </p>
              </div>
            </Reveal>

            {eventsLoading ? (
              <div
                className="events-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 20,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      padding: 32,
                      height: 280,
                      animation: "pulse 2s ease-in-out infinite",
                      opacity: 0.5,
                    }}
                  />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p
                  className="font-heading"
                  style={{
                    fontSize: 22,
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: 8,
                  }}
                >
                  No upcoming events
                </p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.25)" }}>
                  Check back soon — new experiences are always being crafted.
                </p>
              </div>
            ) : (
              <div
                className="events-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.min(events.length, 3)}, 1fr)`,
                  gap: 20,
                }}
              >
                {events.map((ev, i) => {
                  const { day, short } = formatEventDate(ev.date);
                  const price = `£${(ev.priceInCents / 100).toFixed(2)}`;
                  const plainDesc = ev.description
                    ?.replace(/<[^>]*>/g, "")
                    .slice(0, 120);
                  const theme = getCategoryTheme(ev.category);

                  return (
                    <Reveal key={ev.id} delay={i * 100}>
                      <Link
                        href={`/events/${ev.slug}`}
                        style={{ textDecoration: "none", display: "block" }}
                      >
                        <article
                          className="event-card"
                          style={
                            {
                              "--cat-gradient": theme.gradient,
                            } as React.CSSProperties
                          }
                        >
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: `radial-gradient(circle at 90% 10%, ${theme.glow}, transparent 50%)`,
                              pointerEvents: "none",
                              opacity: 0,
                              transition: "opacity 0.4s",
                            }}
                            className="event-card-glow"
                          />
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 20,
                              position: "relative",
                            }}
                          >
                            <div>
                              <p
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  letterSpacing: "0.22em",
                                  textTransform: "uppercase",
                                  color: "rgba(255,255,255,0.3)",
                                }}
                              >
                                {day}
                              </p>
                              <p
                                className="font-heading"
                                style={{
                                  fontSize: 28,
                                  fontWeight: 400,
                                  color: theme.secondary,
                                  lineHeight: 1.2,
                                }}
                              >
                                {short}
                              </p>
                            </div>
                            {ev.category && (
                              <span
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  letterSpacing: "0.16em",
                                  textTransform: "uppercase",
                                  padding: "4px 10px",
                                  background: theme.bgSubtle,
                                  color: theme.primary,
                                  border: `1px solid ${theme.borderSubtle}`,
                                  borderRadius: 100,
                                }}
                              >
                                {ev.category}
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              height: 1,
                              background: `linear-gradient(90deg, transparent, ${theme.borderSubtle} 40%, transparent)`,
                              marginBottom: 20,
                            }}
                          />

                          <h3
                            className="font-heading"
                            style={{
                              fontSize: 22,
                              fontWeight: 500,
                              color: "#f5f5f0",
                              marginBottom: 10,
                              lineHeight: 1.3,
                              position: "relative",
                            }}
                          >
                            {ev.title}
                          </h3>
                          {plainDesc && (
                            <p
                              style={{
                                fontSize: 14,
                                color: "rgba(255,255,255,0.45)",
                                lineHeight: 1.7,
                                marginBottom: 24,
                              }}
                            >
                              {plainDesc}
                              {(ev.description?.replace(/<[^>]*>/g, "").length ??
                                0) > 120
                                ? "…"
                                : ""}
                            </p>
                          )}

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              position: "relative",
                            }}
                          >
                            <span
                              className="font-heading"
                              style={{
                                fontSize: 24,
                                fontWeight: 500,
                                color: theme.secondary,
                              }}
                            >
                              {price}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.14em",
                                textTransform: "uppercase",
                                color: theme.primary,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              View
                              <ArrowRight size={14} strokeWidth={2.5} />
                            </span>
                          </div>
                        </article>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            )}

            {/* View All link */}
            {!eventsLoading && (
              <Reveal delay={300}>
                <div style={{ textAlign: "center", marginTop: 48 }}>
                  <Link
                    href="/events"
                    className="btn-ghost"
                    style={{ display: "inline-flex", gap: 10 }}
                  >
                    View All Events
                    <ArrowRight size={14} strokeWidth={2} />
                  </Link>
                </div>
              </Reveal>
            )}
          </div>
        </section>

        {/* ══ ABOUT ══════════════════════════════════════════════════════════ */}
        <section
          id="about"
          style={{
            background: "#0f0f0f",
            padding: "100px 0",
            position: "relative",
            overflow: "hidden",
            borderTop: "1px solid rgba(255,255,255,0.06)",
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
                "radial-gradient(circle, rgba(224,122,95,0.05) 0%, transparent 65%)",
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
              className="about-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 80,
                alignItems: "start",
              }}
            >
              <div>
                <Reveal>
                  <span
                    className="tag tag-gold"
                    style={{ marginBottom: 24, display: "inline-flex" }}
                  >
                    The Studio
                  </span>
                  <h2
                    className="font-heading"
                    style={{
                      fontSize: "clamp(36px, 4vw, 58px)",
                      fontWeight: 400,
                      lineHeight: 1.1,
                      marginBottom: 32,
                      color: "#f5f5f0",
                    }}
                  >
                    One studio,
                    <br />
                    <em style={{ fontStyle: "italic", color: "#c41e3a" }}>
                      every kind of evening
                    </em>
                  </h2>
                </Reveal>
                <Reveal delay={100}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 15,
                        lineHeight: 1.8,
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      KitchenVerse Studio is a multi-experience venue in Canary
                      Wharf where creativity, strategy, and connection come
                      together. Many event categories live under one roof — each
                      crafted to deliver an unforgettable evening.
                    </p>
                    <p
                      style={{
                        fontSize: 15,
                        lineHeight: 1.8,
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      Whether you&apos;re here to test your poker face, learn a
                      new recipe, pitch your next big idea, or simply sing your
                      heart out — every visit is a new chapter.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={200}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 20,
                      marginTop: 40,
                    }}
                  >
                    {[
                      { number: 5, suffix: "+", label: "Event Types" },
                      { number: 50, suffix: "+", label: "Events Hosted" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="stat-card"
                        style={{
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <p
                          className="font-heading"
                          style={{
                            fontSize: 36,
                            fontWeight: 400,
                            color: "#c9a96e",
                            lineHeight: 1,
                            marginBottom: 6,
                          }}
                        >
                          <CountUp to={stat.number} suffix={stat.suffix} />
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.35)",
                          }}
                        >
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>

              <Reveal delay={120} direction="left">
                <div>
                  {SHOWCASE_CATEGORIES.map((cat) => {
                    const theme = getCategoryTheme(cat.key);
                    return (
                      <div key={cat.key} className="activity-item">
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: theme.primary,
                            flexShrink: 0,
                            marginTop: 7,
                          }}
                        />
                        <div>
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#f5f5f0",
                              fontSize: 15,
                            }}
                          >
                            {cat.label}
                          </span>
                          <p
                            style={{
                              marginTop: 4,
                              fontSize: 13,
                              color: "rgba(255,255,255,0.4)",
                              lineHeight: 1.6,
                            }}
                          >
                            {cat.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══ GALLERY ════════════════════════════════════════════════════════ */}
        <section
          id="gallery"
          style={{
            background: "#09090b",
            padding: "100px 0",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 24px",
            }}
          >
            <Reveal>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  marginBottom: 48,
                }}
              >
                <span className="tag tag-gold" style={{ marginBottom: 20 }}>
                  Gallery
                </span>
                <h2
                  className="font-heading"
                  style={{
                    fontSize: "clamp(36px, 5vw, 66px)",
                    fontWeight: 400,
                    color: "#f5f5f0",
                    lineHeight: 1.05,
                  }}
                >
                  Moments{" "}
                  <em style={{ fontStyle: "italic", color: "#c9a96e" }}>
                    captured
                  </em>
                </h2>
              </div>
            </Reveal>

            <Reveal delay={100} direction="fade">
              <div
                className="gallery-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gridAutoRows: 220,
                  gridAutoFlow: "dense",
                  gap: 4,
                }}
              >
                {galleryImages.map((img, i) => (
                  <div
                    key={i}
                    className={`gallery-item ${img.horizontal ? "gallery-span-2" : ""}`}
                    style={{
                      gridColumn: img.horizontal ? "span 2" : "span 1",
                      gridRow: img.horizontal ? "span 1" : "span 2",
                    }}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover"
                      sizes={img.horizontal ? "50vw" : "25vw"}
                    />
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <SubscribeSection />

        {/* ══ LOCATION ═══════════════════════════════════════════════════════ */}
        <section
          id="location"
          style={{
            background: "#0f0f0f",
            padding: "100px 0",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="line-grid" style={{ opacity: 0.5 }} />

          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 24px",
              position: "relative",
            }}
          >
            <Reveal>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  marginBottom: 48,
                }}
              >
                <span className="tag tag-gold" style={{ marginBottom: 20 }}>
                  Location
                </span>
                <h2
                  className="font-heading"
                  style={{
                    fontSize: "clamp(36px, 5vw, 66px)",
                    fontWeight: 400,
                    color: "#f5f5f0",
                    lineHeight: 1.05,
                    marginBottom: 16,
                  }}
                >
                  Find{" "}
                  <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Us</em>
                </h2>
                <p
                  style={{
                    maxWidth: 500,
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  Located in the heart of Canary Wharf — London&apos;s premier
                  business and entertainment district.
                </p>
              </div>
            </Reveal>

            <Reveal delay={100} direction="fade">
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: 48,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 32,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "rgba(201,169,110,0.1)",
                    border: "1px solid rgba(201,169,110,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MapPin size={20} style={{ color: "#c9a96e" }} />
                </div>

                <div>
                  <h3
                    className="font-heading"
                    style={{
                      fontSize: "clamp(24px, 3vw, 38px)",
                      fontWeight: 400,
                      color: "#f5f5f0",
                      lineHeight: 1.2,
                      marginBottom: 8,
                    }}
                  >
                    Canary Wharf
                  </h3>
                  <p
                    style={{
                      fontSize: 15,
                      color: "rgba(255,255,255,0.4)",
                      lineHeight: 1.6,
                    }}
                  >
                    London, United Kingdom
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {[
                    { label: "Private Venue", color: "#c41e3a" },
                    { label: "Full Kitchen", color: "#e07a5f" },
                    { label: "Sound System", color: "#a855f7" },
                    { label: "VIP Lounge", color: "#c9a96e" },
                  ].map((f) => (
                    <div
                      key={f.label}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        padding: "8px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.55)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        letterSpacing: "0.04em",
                      }}
                    >
                      <span style={{ color: f.color, fontSize: 8 }}>●</span>
                      {f.label}
                    </div>
                  ))}
                </div>

                <a
                  href="https://maps.google.com/?q=Canary+Wharf,+London"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#c9a96e",
                    textDecoration: "none",
                    transition: "opacity 0.2s",
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
                  Open in Maps
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ CONTACT ════════════════════════════════════════════════════════ */}
        <section
          id="contact"
          style={{
            background: "#09090b",
            padding: "120px 0",
            position: "relative",
            overflow: "hidden",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="dot-grid" style={{ opacity: 0.3 }} />
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
                "radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 60%)",
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
                Get in Touch
              </span>
              <h2
                className="font-heading"
                style={{
                  fontSize: "clamp(40px, 6vw, 76px)",
                  fontWeight: 400,
                  color: "#f5f5f0",
                  lineHeight: 1.05,
                  marginBottom: 24,
                }}
              >
                Ready to
                <br />
                <em style={{ fontStyle: "italic", color: "#c9a96e" }}>
                  join?
                </em>
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.8,
                  marginBottom: 40,
                }}
              >
                Book your seat at our next experience or reach out with questions.
                <br />
                Private events and corporate bookings available.
              </p>

              <div
                className="contact-cards"
                style={{
                  display: "flex",
                  gap: 16,
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginBottom: 48,
                }}
              >
                <a
                  href="mailto:info@pokerstudio.co.uk"
                  className="contact-card"
                >
                  <Mail
                    size={18}
                    style={{ color: "#c9a96e", margin: "0 auto 8px" }}
                  />
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.3)",
                      marginBottom: 4,
                    }}
                  >
                    Email
                  </p>
                  <p style={{ fontSize: 14, color: "#c9a96e" }}>
                    info@pokerstudio.co.uk
                  </p>
                </a>

                <a href="tel:+442012345678" className="contact-card">
                  <Phone
                    size={18}
                    style={{ color: "#c9a96e", margin: "0 auto 8px" }}
                  />
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.3)",
                      marginBottom: 4,
                    }}
                  >
                    Phone
                  </p>
                  <p style={{ fontSize: 14, color: "#c9a96e" }}>
                    +44 20 1234 5678
                  </p>
                </a>
              </div>

              <div className="hr-gold" style={{ marginBottom: 40 }} />

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 48,
                  flexWrap: "wrap",
                }}
              >
                {[
                  { label: "Hours", value: "Fri – Sat, 7 PM – Late" },
                  { label: "Dress Code", value: "Smart Casual" },
                  { label: "Area", value: "Canary Wharf, London" },
                ].map((item) => (
                  <div key={item.label} style={{ textAlign: "center" }}>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.3)",
                        marginBottom: 4,
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontSize: 15,
                        color: "rgba(255,255,255,0.65)",
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer
        style={{
          background: "#09090b",
          borderTop: "1px solid rgba(255,255,255,0.06)",
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
          <span
            className="font-display"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#f5f5f0",
              letterSpacing: "0.02em",
            }}
          >
            KITCHEN
            <span className="brand-gradient-text" style={{ fontWeight: 700 }}>
              VERSE
            </span>{" "}
            <span
              className="font-heading"
              style={{
                fontStyle: "italic",
                color: "#c9a96e",
                fontWeight: 400,
                fontSize: 13,
              }}
            >
              Studio
            </span>
          </span>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
            Experiences · Canary Wharf, London · © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </>
  );
}
