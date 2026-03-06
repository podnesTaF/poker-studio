"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getCategoryTheme, CATEGORY_OPTIONS } from "@/lib/categories";

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

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const FILTER_GROUPS = [
  "All",
  ...Array.from(new Set(CATEGORY_OPTIONS.map((o) => o.group))),
];

function formatEventDate(iso: string) {
  const d = new Date(iso);
  return {
    day: new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(d),
    date: new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
    }).format(d),
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d),
  };
}

export default function EventsPage() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);
  const LIMIT = 9;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      limit: String(LIMIT),
      page: String(page),
    });
    if (activeFilter !== "All") params.set("category", activeFilter);

    try {
      const res = await fetch(`/api/events?${params}`);
      const data = await res.json();
      setEvents(data.events ?? []);
      setPagination(data.pagination ?? null);
    } catch {
      setEvents([]);
    }
    setLoading(false);
  }, [page, activeFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  function handleFilterChange(filter: string) {
    setActiveFilter(filter);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-[#09090b] relative">
      <div className="grid-overlay" />

      {/* Header */}
      <header
        style={{
          position: "relative",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "linear-gradient(180deg, rgba(15,15,15,1) 0%, #09090b 100%)",
          padding: "100px 0 60px",
          overflow: "hidden",
        }}
      >
        <div className="dot-grid" style={{ opacity: 0.2 }} />
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,30,58,0.05) 0%, transparent 65%)",
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
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
              textDecoration: "none",
              marginBottom: 24,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a96e")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
            }
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
          <h1
            className="font-heading"
            style={{
              fontSize: "clamp(36px, 5vw, 60px)",
              fontWeight: 400,
              color: "#f5f5f0",
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            All{" "}
            <em style={{ fontStyle: "italic", color: "#c9a96e" }}>Events</em>
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.45)",
              maxWidth: 480,
              lineHeight: 1.7,
            }}
          >
            Browse upcoming experiences across all event types.
            Filter by category to find your perfect evening.
          </p>
        </div>
      </header>

      {/* Filters */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(9,9,11,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "12px 24px",
            display: "flex",
            gap: 8,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {FILTER_GROUPS.map((filter) => {
            const isActive = activeFilter === filter;
            const theme =
              filter === "All" ? null : getCategoryTheme(filter);
            return (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                style={{
                  flexShrink: 0,
                  padding: "8px 18px",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  borderRadius: 100,
                  border: isActive
                    ? `1px solid ${theme?.primary ?? "#c9a96e"}`
                    : "1px solid rgba(255,255,255,0.1)",
                  background: isActive
                    ? (theme?.bgSubtle ?? "rgba(201,169,110,0.06)")
                    : "transparent",
                  color: isActive
                    ? (theme?.primary ?? "#c9a96e")
                    : "rgba(255,255,255,0.45)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Grid */}
      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px 24px 80px",
          position: "relative",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "80px 0",
            }}
          >
            <Loader2
              size={24}
              className="animate-spin"
              style={{ color: "#c9a96e" }}
            />
          </div>
        ) : events.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 24px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p
              className="font-heading"
              style={{ fontSize: 22, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}
            >
              No events found
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.25)" }}>
              {activeFilter !== "All"
                ? `No upcoming ${activeFilter} events. Try a different filter.`
                : "Check back soon — new experiences are always being crafted."}
            </p>
          </div>
        ) : (
          <>
            {/* Count */}
            <div
              style={{
                marginBottom: 24,
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.08em",
              }}
            >
              {pagination?.total ?? 0} event
              {(pagination?.total ?? 0) !== 1 ? "s" : ""} found
              {activeFilter !== "All" && (
                <span style={{ color: getCategoryTheme(activeFilter).primary }}>
                  {" "}
                  · {activeFilter}
                </span>
              )}
            </div>

            <div
              className="events-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 20,
              }}
            >
              {events.map((ev) => {
                const { day, date, time } = formatEventDate(ev.date);
                const price = `£${(ev.priceInCents / 100).toFixed(2)}`;
                const plainDesc = ev.description
                  ?.replace(/<[^>]*>/g, "")
                  .slice(0, 100);
                const theme = getCategoryTheme(ev.category);

                return (
                  <Link
                    key={ev.id}
                    href={`/events/${ev.slug}`}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <article
                      className="event-card"
                      style={
                        {
                          "--cat-gradient": theme.gradient,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        } as React.CSSProperties
                      }
                    >
                      <div
                        className="event-card-glow"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: `radial-gradient(circle at 90% 10%, ${theme.glow}, transparent 50%)`,
                          pointerEvents: "none",
                          opacity: 0,
                          transition: "opacity 0.4s",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 16,
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
                            {day} · {time}
                          </p>
                          <p
                            className="font-heading"
                            style={{
                              fontSize: 24,
                              fontWeight: 400,
                              color: theme.secondary,
                              lineHeight: 1.2,
                            }}
                          >
                            {date}
                          </p>
                        </div>
                        {ev.category && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: "0.14em",
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
                          marginBottom: 16,
                        }}
                      />

                      <h3
                        className="font-heading"
                        style={{
                          fontSize: 20,
                          fontWeight: 500,
                          color: "#f5f5f0",
                          marginBottom: 8,
                          lineHeight: 1.3,
                          position: "relative",
                        }}
                      >
                        {ev.title}
                      </h3>
                      {plainDesc && (
                        <p
                          style={{
                            fontSize: 13,
                            color: "rgba(255,255,255,0.4)",
                            lineHeight: 1.7,
                            marginBottom: 20,
                            flex: 1,
                          }}
                        >
                          {plainDesc}
                          {(ev.description?.replace(/<[^>]*>/g, "").length ?? 0) >
                          100
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
                          marginTop: "auto",
                        }}
                      >
                        <span
                          className="font-heading"
                          style={{ fontSize: 22, fontWeight: 500, color: theme.secondary }}
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
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 48,
                }}
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                    color: page === 1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.6)",
                    cursor: page === 1 ? "not-allowed" : "pointer",
                    borderRadius: 8,
                    transition: "all 0.2s",
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from(
                  { length: Math.min(pagination.totalPages, 7) },
                  (_, i) => {
                    let p: number;
                    if (pagination.totalPages <= 7) {
                      p = i + 1;
                    } else if (page <= 4) {
                      p = i + 1;
                    } else if (page >= pagination.totalPages - 3) {
                      p = pagination.totalPages - 6 + i;
                    } else {
                      p = page - 3 + i;
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 600,
                          borderRadius: 8,
                          border:
                            p === page
                              ? "1px solid #c9a96e"
                              : "1px solid rgba(255,255,255,0.1)",
                          background:
                            p === page
                              ? "rgba(201,169,110,0.1)"
                              : "transparent",
                          color:
                            p === page
                              ? "#c9a96e"
                              : "rgba(255,255,255,0.5)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {p}
                      </button>
                    );
                  },
                )}

                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                  style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                    color:
                      page === pagination.totalPages
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(255,255,255,0.6)",
                    cursor:
                      page === pagination.totalPages
                        ? "not-allowed"
                        : "pointer",
                    borderRadius: 8,
                    transition: "all 0.2s",
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
