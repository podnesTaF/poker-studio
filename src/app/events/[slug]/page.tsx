import { prisma } from "@/lib/prisma";
import { getCategoryTheme } from "@/lib/categories";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Spade,
  ChefHat,
  Gamepad2,
  Mic,
  Lightbulb,
  Star,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, typeof Spade> = {
  poker: Spade,
  kitchen: ChefHat,
  wine: Star,
  games: Gamepad2,
  karaoke: Mic,
  business: Lightbulb,
  workshop: Star,
  default: Star,
};

type CategoryDesign = {
  bgPattern: "dots" | "lines" | "grid" | "none";
  bgPatternColor: string;
  heroOverlay: string;
  accentShape: "corner-cut" | "rounded" | "sharp" | "pill" | "neon";
  cardBg: string;
  cardBorder: string;
  titleDecoration: "underline" | "side-bar" | "glow" | "bracket" | "none";
  floatingElements: { top: string; left: string; size: number; color: string; blur: number }[];
};

function getCategoryDesign(key: string, primary: string, secondary: string, glow: string): CategoryDesign {
  switch (key) {
    case "poker":
      return {
        bgPattern: "dots",
        bgPatternColor: "rgba(196,30,58,0.08)",
        heroOverlay: `linear-gradient(to top, #09090b 0%, rgba(9,9,11,0.6) 40%, rgba(20,10,10,0.85) 100%)`,
        accentShape: "corner-cut",
        cardBg: "rgba(196,30,58,0.03)",
        cardBorder: "rgba(196,30,58,0.12)",
        titleDecoration: "underline",
        floatingElements: [
          { top: "15%", left: "85%", size: 350, color: "rgba(201,169,110,0.06)", blur: 100 },
          { top: "60%", left: "5%", size: 250, color: "rgba(196,30,58,0.05)", blur: 80 },
        ],
      };
    case "kitchen":
      return {
        bgPattern: "none",
        bgPatternColor: "",
        heroOverlay: `linear-gradient(to top, #09090b 0%, rgba(9,9,11,0.5) 40%, rgba(30,18,12,0.8) 100%)`,
        accentShape: "rounded",
        cardBg: "rgba(224,122,95,0.03)",
        cardBorder: "rgba(224,122,95,0.12)",
        titleDecoration: "side-bar",
        floatingElements: [
          { top: "10%", left: "80%", size: 400, color: "rgba(224,122,95,0.05)", blur: 120 },
          { top: "70%", left: "10%", size: 300, color: "rgba(242,204,143,0.04)", blur: 100 },
        ],
      };
    case "wine":
      return {
        bgPattern: "dots",
        bgPatternColor: "rgba(212,160,86,0.06)",
        heroOverlay: `linear-gradient(to top, #09090b 0%, rgba(9,9,11,0.5) 40%, rgba(25,15,10,0.85) 100%)`,
        accentShape: "rounded",
        cardBg: "rgba(212,160,86,0.03)",
        cardBorder: "rgba(212,160,86,0.12)",
        titleDecoration: "underline",
        floatingElements: [
          { top: "20%", left: "75%", size: 380, color: "rgba(212,160,86,0.05)", blur: 110 },
        ],
      };
    case "games":
      return {
        bgPattern: "grid",
        bgPatternColor: "rgba(59,130,246,0.03)",
        heroOverlay: `linear-gradient(to top, #09090b 0%, rgba(9,9,11,0.5) 45%, rgba(10,15,30,0.85) 100%)`,
        accentShape: "sharp",
        cardBg: "rgba(59,130,246,0.03)",
        cardBorder: "rgba(59,130,246,0.12)",
        titleDecoration: "bracket",
        floatingElements: [
          { top: "12%", left: "82%", size: 320, color: "rgba(59,130,246,0.06)", blur: 90 },
          { top: "55%", left: "8%", size: 280, color: "rgba(96,165,250,0.04)", blur: 80 },
        ],
      };
    case "karaoke":
      return {
        bgPattern: "none",
        bgPatternColor: "",
        heroOverlay: `linear-gradient(to top, #09090b 0%, rgba(9,9,11,0.4) 35%, rgba(20,10,25,0.85) 100%)`,
        accentShape: "neon",
        cardBg: "rgba(168,85,247,0.03)",
        cardBorder: "rgba(168,85,247,0.15)",
        titleDecoration: "glow",
        floatingElements: [
          { top: "8%", left: "78%", size: 400, color: "rgba(168,85,247,0.07)", blur: 120 },
          { top: "50%", left: "3%", size: 300, color: "rgba(244,114,182,0.05)", blur: 100 },
          { top: "30%", left: "50%", size: 200, color: "rgba(168,85,247,0.04)", blur: 80 },
        ],
      };
    case "business":
      return {
        bgPattern: "lines",
        bgPatternColor: "rgba(16,185,129,0.025)",
        heroOverlay: `linear-gradient(to top, #09090b 0%, rgba(9,9,11,0.5) 45%, rgba(8,18,14,0.85) 100%)`,
        accentShape: "sharp",
        cardBg: "rgba(16,185,129,0.03)",
        cardBorder: "rgba(16,185,129,0.12)",
        titleDecoration: "side-bar",
        floatingElements: [
          { top: "15%", left: "80%", size: 350, color: "rgba(16,185,129,0.05)", blur: 100 },
          { top: "65%", left: "5%", size: 250, color: "rgba(52,211,153,0.04)", blur: 80 },
        ],
      };
    default:
      return {
        bgPattern: "dots",
        bgPatternColor: "rgba(201,169,110,0.06)",
        heroOverlay: `linear-gradient(to top, #09090b 0%, rgba(9,9,11,0.5) 50%, ${glow} 100%)`,
        accentShape: "rounded",
        cardBg: "rgba(201,169,110,0.02)",
        cardBorder: "rgba(201,169,110,0.12)",
        titleDecoration: "underline",
        floatingElements: [
          { top: "15%", left: "80%", size: 350, color: glow, blur: 100 },
        ],
      };
  }
}

function TitleDecoration({
  type,
  primary,
  gradient,
}: {
  type: string;
  primary: string;
  gradient: string;
}) {
  switch (type) {
    case "underline":
      return (
        <div
          style={{
            width: 60,
            height: 2,
            background: gradient,
            borderRadius: 1,
            marginTop: 16,
          }}
        />
      );
    case "side-bar":
      return null; // handled by parent wrapper
    case "glow":
      return (
        <div
          style={{
            width: 80,
            height: 4,
            borderRadius: 2,
            marginTop: 16,
            background: gradient,
            boxShadow: `0 0 20px ${primary}44, 0 0 40px ${primary}22`,
          }}
        />
      );
    case "bracket":
      return (
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 16,
            alignItems: "center",
          }}
        >
          <div style={{ width: 20, height: 2, background: primary }} />
          <div style={{ width: 8, height: 8, border: `2px solid ${primary}`, transform: "rotate(45deg)" }} />
          <div style={{ width: 20, height: 2, background: primary }} />
        </div>
      );
    default:
      return null;
  }
}

function BookingCardWrapper({
  shape,
  primary,
  gradient,
  cardBg,
  cardBorder,
  children,
}: {
  shape: string;
  primary: string;
  gradient: string;
  cardBg: string;
  cardBorder: string;
  children: React.ReactNode;
}) {
  const baseStyle: React.CSSProperties = {
    padding: 24,
    position: "relative",
    overflow: "hidden",
    background: cardBg,
    border: `1px solid ${cardBorder}`,
  };

  switch (shape) {
    case "corner-cut":
      return (
        <div
          style={{
            ...baseStyle,
            clipPath:
              "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
            borderRadius: 0,
            border: "none",
            background: cardBg,
            outline: `1px solid ${cardBorder}`,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: gradient }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{ background: gradient }}
          />
          {children}
        </div>
      );
    case "neon":
      return (
        <div
          style={{
            ...baseStyle,
            borderRadius: 16,
            boxShadow: `0 0 24px ${primary}15, inset 0 0 24px ${primary}08`,
            border: `1px solid ${primary}30`,
          }}
        >
          {children}
        </div>
      );
    case "sharp":
      return (
        <div style={{ ...baseStyle, borderRadius: 2 }}>
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: gradient }}
          />
          {children}
        </div>
      );
    case "pill":
      return (
        <div style={{ ...baseStyle, borderRadius: 20 }}>
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: gradient }}
          />
          {children}
        </div>
      );
    default: // rounded
      return (
        <div style={{ ...baseStyle, borderRadius: 16 }}>
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: gradient }}
          />
          {children}
        </div>
      );
  }
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      _count: {
        select: {
          registrations: {
            where: { paymentStatus: { in: ["PAID", "PENDING"] } },
          },
        },
      },
    },
  });

  if (!event || !event.published) notFound();

  const theme = getCategoryTheme(event.category);
  const design = getCategoryDesign(theme.key, theme.primary, theme.secondary, theme.glow);
  const CatIcon = CATEGORY_ICONS[theme.key] ?? Star;

  const seatsLeft =
    event.maxSeats != null
      ? event.maxSeats - event._count.registrations
      : null;

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();

  const bgPatternClass =
    design.bgPattern === "dots"
      ? "dot-grid"
      : design.bgPattern === "lines"
        ? "line-grid"
        : design.bgPattern === "grid"
          ? "grid-overlay"
          : "";

  return (
    <div className="min-h-screen bg-[#09090b] relative">
      {/* Background pattern per category */}
      {bgPatternClass && (
        <div
          className={`${bgPatternClass} fixed inset-0 z-0`}
          style={{ opacity: 0.35 }}
        />
      )}

      {/* Floating decorative glows */}
      {design.floatingElements.map((el, i) => (
        <div
          key={i}
          className="pointer-events-none fixed z-0"
          style={{
            top: el.top,
            left: el.left,
            width: el.size,
            height: el.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${el.color} 0%, transparent 70%)`,
            filter: `blur(${el.blur}px)`,
          }}
        />
      ))}

      {/* Hero image with category-specific overlay */}
      {event.images.length > 0 && (
        <div className="relative w-full h-[50vh] max-h-[520px]">
          <Image
            src={event.images[0].url}
            alt={event.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0" style={{ background: design.heroOverlay }} />

          {/* Category-specific decorative corners */}
          {design.accentShape === "corner-cut" && (
            <>
              <div
                className="absolute top-0 left-0 w-16 h-[2px]"
                style={{ background: theme.gradient }}
              />
              <div
                className="absolute top-0 left-0 w-[2px] h-16"
                style={{ background: theme.gradient }}
              />
              <div
                className="absolute bottom-0 right-0 w-16 h-[2px]"
                style={{ background: theme.gradient }}
              />
              <div
                className="absolute bottom-0 right-0 w-[2px] h-16"
                style={{ background: theme.gradient }}
              />
            </>
          )}

          {design.accentShape === "neon" && (
            <div
              className="absolute bottom-0 left-0 right-0 h-[3px]"
              style={{
                background: theme.gradient,
                boxShadow: `0 0 16px ${theme.primary}44`,
              }}
            />
          )}

          {(design.accentShape === "sharp" || design.accentShape === "rounded") && (
            <div
              className="absolute bottom-0 left-0 w-1 h-32"
              style={{ background: `linear-gradient(to top, ${theme.primary}, transparent)` }}
            />
          )}
        </div>
      )}

      <main className="relative max-w-[900px] mx-auto px-6 -mt-20 pb-20 z-10">
        <header className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            <ArrowLeft size={16} />
            <span>All Events</span>
          </Link>

          {/* Category icon badge */}
          <div
            className="inline-flex items-center gap-2"
            style={{
              background: theme.bgSubtle,
              border: `1px solid ${theme.borderSubtle}`,
              borderRadius: design.accentShape === "sharp" ? 4 : 100,
              padding: "6px 14px",
            }}
          >
            <CatIcon size={14} style={{ color: theme.primary }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: theme.primary,
              }}
            >
              {event.category ?? "Event"}
            </span>
          </div>
        </header>

        {/* Title section — varies by category */}
        <div className="mb-10">
          {design.titleDecoration === "side-bar" ? (
            <div
              style={{
                borderLeft: `3px solid ${theme.primary}`,
                paddingLeft: 20,
              }}
            >
              <h1 className="font-heading text-[clamp(28px,5vw,48px)] font-light text-[#f5f5f0] leading-tight">
                {event.title}
              </h1>
            </div>
          ) : (
            <>
              <h1 className="font-heading text-[clamp(28px,5vw,48px)] font-light text-[#f5f5f0] leading-tight">
                {event.title}
              </h1>
              <TitleDecoration
                type={design.titleDecoration}
                primary={theme.primary}
                gradient={theme.gradient}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-10 event-layout items-start">
          {/* Left: Description */}
          <div>
            {event.description && (
              <div
                className="event-prose"
                dangerouslySetInnerHTML={{ __html: event.description }}
                style={{ "--cat-primary": theme.primary } as React.CSSProperties}
              />
            )}

            {event.images.length > 1 && (
              <div className="mt-10 grid grid-cols-2 gap-3">
                {event.images.slice(1).map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-[4/3] overflow-hidden gallery-item"
                    style={{
                      borderRadius: design.accentShape === "sharp" ? 4 : 12,
                    }}
                  >
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Booking card — unique per category */}
          <div className="md:sticky md:top-24">
            <BookingCardWrapper
              shape={design.accentShape}
              primary={theme.primary}
              gradient={theme.gradient}
              cardBg={design.cardBg}
              cardBorder={design.cardBorder}
            >
              <div className="space-y-5">
                <div
                  className="space-y-3 text-[13px]"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  <div className="flex items-center gap-3">
                    <Calendar
                      size={15}
                      className="shrink-0"
                      style={{ color: theme.secondary }}
                    />
                    <span>
                      {eventDate.toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {" · "}
                      {eventDate.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-3">
                      <MapPin
                        size={15}
                        className="shrink-0"
                        style={{ color: theme.secondary }}
                      />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {seatsLeft != null && (
                    <div className="flex items-center gap-3">
                      <Users
                        size={15}
                        className="shrink-0"
                        style={{ color: theme.secondary }}
                      />
                      <span>
                        {seatsLeft > 0
                          ? `${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} left`
                          : "Sold out"}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    borderTop: `1px solid ${design.cardBorder}`,
                    paddingTop: 16,
                  }}
                >
                  <div
                    className="text-[10px] font-bold tracking-[0.22em] uppercase mb-1"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Price per person
                  </div>
                  <div
                    className="font-heading text-2xl font-light"
                    style={{ color: theme.secondary }}
                  >
                    £{(event.priceInCents / 100).toFixed(2)}
                  </div>
                </div>

                {!isPast && (seatsLeft === null || seatsLeft > 0) ? (
                  <Link
                    href={`/events/${event.slug}/register`}
                    className="btn-category w-full justify-center py-4 text-[12px]"
                    style={
                      {
                        "--cat-primary": theme.primary,
                        borderRadius:
                          design.accentShape === "neon"
                            ? 12
                            : design.accentShape === "rounded"
                              ? 12
                              : design.accentShape === "sharp"
                                ? 2
                                : 0,
                        ...(design.accentShape === "neon"
                          ? { boxShadow: `0 0 16px ${theme.primary}33` }
                          : {}),
                      } as React.CSSProperties
                    }
                  >
                    <CreditCard size={15} />
                    Register Now
                  </Link>
                ) : isPast ? (
                  <div
                    className="text-center text-sm py-3"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    This event has ended.
                  </div>
                ) : (
                  <div
                    className="text-center text-sm py-3 font-semibold"
                    style={{ color: theme.primary }}
                  >
                    Sold Out
                  </div>
                )}
              </div>
            </BookingCardWrapper>

            <div
              className="mt-4 text-center text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ color: "rgba(255,255,255,0.15)" }}
            >
              A{" "}
              <span style={{ color: theme.primary }}>{theme.label}</span>{" "}
              experience
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
