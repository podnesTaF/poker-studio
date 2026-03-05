import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, Clock, Users, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) return {};
  const plainDesc = event.description
    ?.replace(/<[^>]*>/g, "")
    .slice(0, 160);
  return {
    title: `${event.title} | Poker Studio`,
    description: plainDesc || `${event.title} at Poker Studio`,
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug, published: true },
    include: {
      images: { orderBy: { order: "asc" } },
      _count: { select: { registrations: true } },
    },
  });

  if (!event) notFound();

  const coverImage = event.images[0] ?? null;
  const additionalImages = event.images.slice(1);
  const price = `£${(event.priceInCents / 100).toFixed(2)}`;
  const eventDate = new Date(event.date);

  const dateStr = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(eventDate);

  const timeStr = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(eventDate);

  const seatsLeft = event.maxSeats
    ? Math.max(0, event.maxSeats - event._count.registrations)
    : null;
  const seatsText = event.maxSeats
    ? `${seatsLeft} of ${event.maxSeats} seats left`
    : "Unlimited seats";

  const isPast = eventDate < new Date();

  return (
    <>
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(9,9,11,0.95)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.06)",
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
            className="font-heading"
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#f5f5f0",
              textDecoration: "none",
              letterSpacing: "0.04em",
            }}
          >
            POKER <span style={{ color: "#c9a96e" }}>STUDIO</span>
          </Link>
          <Link
            href="/#events"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
              color: "rgba(255,255,255,0.55)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "color 0.2s",
            }}
          >
            <ArrowLeft size={14} />
            All Events
          </Link>
        </div>
      </nav>

      <main style={{ paddingTop: 64, background: "#09090b" }}>
        {/* ── Cover ───────────────────────────────────────────────── */}
        <section
          style={{
            position: "relative",
            height: "clamp(300px, 45vh, 520px)",
            overflow: "hidden",
          }}
        >
          {coverImage && (
            <Image
              src={coverImage.url}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: coverImage
                ? "linear-gradient(180deg, rgba(9,9,11,0.35) 0%, rgba(9,9,11,0.55) 50%, rgba(9,9,11,0.97) 100%)"
                : "linear-gradient(135deg, #151515 0%, #09090b 100%)",
            }}
          />
          <div className="grid-overlay" />

          {/* Glow */}
          <div
            style={{
              position: "absolute",
              top: "10%",
              right: "5%",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
              filter: "blur(60px)",
            }}
          />

          {/* Content */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <div
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "0 24px 48px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                {event.category && (
                  <span className="tag">{event.category}</span>
                )}
                {isPast && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      padding: "5px 14px",
                      borderRadius: 100,
                      color: "rgba(255,255,255,0.4)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    Past Event
                  </span>
                )}
              </div>

              <h1
                className="font-heading"
                style={{
                  fontSize: "clamp(32px, 5vw, 64px)",
                  fontWeight: 400,
                  color: "#fff",
                  lineHeight: 1.1,
                  marginBottom: 16,
                }}
              >
                {event.title}
              </h1>

              <div
                style={{
                  display: "flex",
                  gap: 24,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 14,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <Calendar size={14} style={{ color: "#c9a96e" }} />
                  {dateStr}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 14,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <Clock size={14} style={{ color: "#c9a96e" }} />
                  {timeStr}
                </span>
                {event.location && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 14,
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    <MapPin size={14} style={{ color: "#c9a96e" }} />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Content ─────────────────────────────────────────────── */}
        <section
          style={{
            padding: "64px 0 120px",
            position: "relative",
          }}
        >
          <div className="dot-grid" style={{ opacity: 0.25 }} />

          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 24px",
              position: "relative",
            }}
          >
            <div
              className="event-layout"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 380px",
                gap: 48,
                alignItems: "start",
              }}
            >
              {/* Left — Description */}
              <div>
                <h2
                  className="font-heading"
                  style={{
                    fontSize: 28,
                    fontWeight: 400,
                    color: "#f5f5f0",
                    marginBottom: 32,
                  }}
                >
                  About This Event
                </h2>

                {event.description ? (
                  <div
                    className="event-prose"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                ) : (
                  <p
                    style={{
                      fontSize: 15,
                      color: "rgba(255,255,255,0.45)",
                      lineHeight: 1.8,
                    }}
                  >
                    Details coming soon.
                  </p>
                )}

                {/* Additional images */}
                {additionalImages.length > 0 && (
                  <div style={{ marginTop: 48 }}>
                    <div className="hr-gold" style={{ marginBottom: 32 }} />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 8,
                      }}
                    >
                      {additionalImages.map((img) => (
                        <div
                          key={img.id}
                          className="gallery-item"
                          style={{
                            aspectRatio: "4/3",
                          }}
                        >
                          <Image
                            src={img.url}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right — Booking card */}
              <div style={{ position: "sticky", top: 88 }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: 32,
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                  }}
                >
                  {/* Price */}
                  <div>
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
                      Price per person
                    </p>
                    <p
                      className="font-heading"
                      style={{
                        fontSize: 40,
                        fontWeight: 400,
                        color: "#c9a96e",
                      }}
                    >
                      {price}
                    </p>
                  </div>

                  <div className="hr-gold" />

                  {/* Details */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {[
                      {
                        icon: <Calendar size={16} />,
                        label: "Date",
                        value: dateStr,
                      },
                      {
                        icon: <Clock size={16} />,
                        label: "Time",
                        value: timeStr,
                      },
                      ...(event.location
                        ? [
                            {
                              icon: <MapPin size={16} />,
                              label: "Location",
                              value: event.location,
                            },
                          ]
                        : []),
                      {
                        icon: <Users size={16} />,
                        label: "Availability",
                        value: seatsText,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div style={{ color: "#c9a96e", flexShrink: 0 }}>
                          {row.icon}
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.16em",
                              textTransform: "uppercase",
                              color: "rgba(255,255,255,0.3)",
                              marginBottom: 2,
                            }}
                          >
                            {row.label}
                          </p>
                          <p style={{ fontSize: 14, color: "#f5f5f0" }}>
                            {row.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {!isPast && (
                    <>
                      <Link
                        href={`/events/${event.slug}/register`}
                        className="btn-primary"
                        style={{
                          justifyContent: "center",
                          padding: "18px 32px",
                          fontSize: 13,
                          width: "100%",
                          textAlign: "center",
                        }}
                      >
                        Reserve Your Seat
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
                      <p
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.2)",
                          textAlign: "center",
                          lineHeight: 1.6,
                        }}
                      >
                        Secure payment · Instant confirmation
                      </p>
                    </>
                  )}

                  {isPast && (
                    <div
                      style={{
                        padding: "14px 20px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        textAlign: "center",
                        fontSize: 13,
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      This event has ended
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
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
          <Link
            href="/"
            className="font-heading"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#f5f5f0",
              letterSpacing: "0.04em",
              textDecoration: "none",
            }}
          >
            POKER <span style={{ color: "#c9a96e" }}>STUDIO</span>
          </Link>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
            Private Events · Canary Wharf, London
          </p>
        </div>
      </footer>
    </>
  );
}
