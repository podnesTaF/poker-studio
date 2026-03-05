"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  Search,
  LogOut,
  ChevronDown,
  ChevronUp,
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  RefreshCw,
  Plus,
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  CalendarDays,
  ImageIcon,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────

type EventRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  date: string;
  location: string | null;
  priceInCents: number;
  maxSeats: number | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { registrations: number; images: number };
};

type RegistrationGuest = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
};

type RegistrationRow = {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  stripePaymentIntentId: string | null;
  paymentStatus: string;
  totalAmountInCents: number;
  createdAt: string;
  event: { title: string; slug: string };
  guests: RegistrationGuest[];
};

// ─── Constants ──────────────────────────────────────────────────────────────────

const SERIF_FONT = "var(--font-playfair), 'Playfair Display', Georgia, serif";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending", color: "#b5604a", bg: "rgba(181,96,74,0.10)" },
  PAID: { label: "Paid", color: "#4a7a6a", bg: "rgba(74,122,106,0.12)" },
  FAILED: { label: "Failed", color: "#8c7f6e", bg: "rgba(140,127,110,0.10)" },
  REFUNDED: { label: "Refunded", color: "#8c7f6e", bg: "rgba(140,127,110,0.10)" },
};

// ─── Shared components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_CONFIG[status] ?? { label: status, color: "#8c7f6e", bg: "rgba(140,127,110,0.10)" };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-0.5 rounded-full"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[#fdfaf5] border border-[#e0d6c8] rounded-[10px] p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[#b5604a]">
        {icon}
        <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#8c7f6e]">
          {label}
        </span>
      </div>
      <div className="text-[28px] font-light text-[#2a231a] leading-none" style={{ fontFamily: SERIF_FONT }}>
        {value}
      </div>
    </div>
  );
}

// ─── Event Row ──────────────────────────────────────────────────────────────────

function EventRow({
  event,
  onTogglePublish,
  onDelete,
}: {
  event: EventRow;
  onTogglePublish: (id: string, published: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <tr className="border-b border-[#e0d6c8] hover:bg-[#fdfaf5] transition-colors">
      <td className="p-3.5 text-[13px]">
        <div className="font-semibold text-[#2a231a]">{event.title}</div>
        <div className="text-[11px] text-[#8c7f6e] mt-0.5">/{event.slug}</div>
      </td>
      <td className="p-3.5 text-[13px] text-[#2a231a]">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-[#8c7f6e]" />
          {new Date(event.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
        <div className="text-[11px] text-[#8c7f6e] mt-0.5">
          {new Date(event.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </td>
      <td className="p-3.5 text-[13px] text-[#2a231a]">
        {event.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-[#8c7f6e]" />
            {event.location}
          </div>
        )}
      </td>
      <td className="p-3.5 text-[13px] text-right">
        <span className="font-semibold text-[#4a7a6a]">€{(event.priceInCents / 100).toFixed(0)}</span>
      </td>
      <td className="p-3.5 text-[13px] text-center text-[#8c7f6e]">
        {event.maxSeats ?? "∞"}
      </td>
      <td className="p-3.5 text-[13px] text-center font-semibold text-[#b5604a]">
        {event._count.registrations}
      </td>
      <td className="p-3.5">
        {event.published ? (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-0.5 rounded-full text-[#4a7a6a] bg-[rgba(74,122,106,0.12)] border border-[rgba(74,122,106,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4a7a6a]" />
            Live
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-0.5 rounded-full text-[#8c7f6e] bg-[rgba(140,127,110,0.10)] border border-[rgba(140,127,110,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8c7f6e]" />
            Draft
          </span>
        )}
      </td>
      <td className="p-3.5">
        <div className="flex items-center gap-1.5 text-[11px] text-[#8c7f6e]">
          <ImageIcon size={12} />
          {event._count.images}
        </div>
      </td>
      <td className="p-3.5">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/events/${event.id}/edit`}
            className="p-1.5 rounded-md border border-[#e0d6c8] text-[#8c7f6e] hover:text-[#b5604a] hover:border-[#e8b4a4] transition-all"
            title="Edit"
          >
            <Pencil size={14} />
          </Link>
          <button
            onClick={() => onTogglePublish(event.id, !event.published)}
            className="p-1.5 rounded-md border border-[#e0d6c8] text-[#8c7f6e] hover:text-[#b5604a] hover:border-[#e8b4a4] transition-all"
            title={event.published ? "Unpublish" : "Publish"}
          >
            {event.published ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="p-1.5 rounded-md border border-[#e0d6c8] text-[#8c7f6e] hover:text-[#b5604a] hover:border-[#e8b4a4] transition-all"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Registration Row ───────────────────────────────────────────────────────────

function RegistrationRowItem({ reg }: { reg: RegistrationRow }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        onClick={() => setOpen((v) => !v)}
        className={`cursor-pointer border-b border-[#e0d6c8] hover:bg-[#fdfaf5] transition-colors ${
          open ? "bg-[#fdfaf5] border-b-0" : ""
        }`}
      >
        <td className="p-3.5 text-[13px]">
          <div className="font-semibold text-[#2a231a]">{reg.fullName}</div>
          <div className="text-[11px] text-[#8c7f6e] mt-0.5">{reg.email}</div>
        </td>
        <td className="p-3.5 text-[13px] text-[#2a231a]">{reg.event.title}</td>
        <td className="p-3.5">
          <StatusBadge status={reg.paymentStatus} />
        </td>
        <td className="p-3.5 text-[13px] text-right">
          <span className="font-semibold text-[#4a7a6a]">
            €{(reg.totalAmountInCents / 100).toFixed(0)}
          </span>
        </td>
        <td className="p-3.5 text-[13px] text-center text-[#8c7f6e]">
          {reg.guests.length > 0 ? reg.guests.length + 1 : 1}
        </td>
        <td className="p-3.5 text-[11px] text-[#8c7f6e]">
          {new Date(reg.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </td>
        <td className="p-3.5 text-right">
          {open ? <ChevronUp size={15} className="text-[#8c7f6e]" /> : <ChevronDown size={15} className="text-[#8c7f6e]" />}
        </td>
      </tr>

      {open && (
        <tr className="border-b border-[#e0d6c8]">
          <td colSpan={7} className="p-0">
            <div className="bg-[#f7f1e8] border-t border-dashed border-[#e0d6c8] p-5 flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4 text-[13px]">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#8c7f6e]">Phone</span>
                  <div className="text-[#2a231a] mt-1">{reg.phone}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#8c7f6e]">Payment ID</span>
                  <div className="text-[#2a231a] mt-1 font-mono text-[11px]">
                    {reg.stripePaymentIntentId ? `${reg.stripePaymentIntentId.slice(0, 24)}…` : "—"}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#8c7f6e]">Event</span>
                  <div className="text-[#2a231a] mt-1">{reg.event.title}</div>
                </div>
              </div>

              {reg.guests.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#8c7f6e] mb-2.5">
                    Additional Guests ({reg.guests.length})
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {reg.guests.map((g) => (
                      <div
                        key={g.id}
                        className="bg-[#fdfaf5] border border-[#e0d6c8] rounded-lg px-4 py-3 min-w-[200px] flex-1"
                      >
                        <div className="font-semibold text-sm text-[#2a231a]">{g.fullName}</div>
                        <div className="text-[12px] text-[#8c7f6e] leading-relaxed mt-1">
                          {g.email && <div>{g.email}</div>}
                          {g.phone && <div>{g.phone}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────────

export function AdminDashboard({ userEmail }: { userEmail: string }) {
  const [tab, setTab] = useState<"events" | "registrations">("events");

  // Events state
  const [events, setEvents] = useState<EventRow[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Registrations state
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [regLoading, setRegLoading] = useState(true);
  const [regSearch, setRegSearch] = useState("");
  const [regEventFilter, setRegEventFilter] = useState("");
  const [regStatusFilter, setRegStatusFilter] = useState("");
  const [regPage, setRegPage] = useState(1);
  const [regTotal, setRegTotal] = useState(0);
  const [regTotalPages, setRegTotalPages] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Stats
  const [regStats, setRegStats] = useState({ totalRegistrations: 0, totalRevenueCents: 0 });

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(regSearch), 350);
    return () => clearTimeout(t);
  }, [regSearch]);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    const res = await fetch("/api/admin/events");
    const json = await res.json();
    setEvents(json.events ?? []);
    setEventsLoading(false);
  }, []);

  // Fetch registrations
  const fetchRegistrations = useCallback(async () => {
    setRegLoading(true);
    const params = new URLSearchParams({ page: String(regPage), limit: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (regEventFilter) params.set("eventId", regEventFilter);
    if (regStatusFilter) params.set("status", regStatusFilter);
    const res = await fetch(`/api/admin/registrations?${params}`);
    const json = await res.json();
    setRegistrations(json.registrations ?? []);
    setRegTotal(json.pagination?.total ?? 0);
    setRegTotalPages(json.pagination?.totalPages ?? 0);
    setRegStats(json.stats ?? { totalRegistrations: 0, totalRevenueCents: 0 });
    setRegLoading(false);
  }, [regPage, debouncedSearch, regEventFilter, regStatusFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (tab === "registrations") fetchRegistrations();
  }, [tab, fetchRegistrations]);

  // Event actions
  async function togglePublish(id: string, published: boolean) {
    await fetch(`/api/admin/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published }),
    });
    fetchEvents();
  }

  async function deleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    fetchEvents();
  }

  const publishedEvents = events.filter((e) => e.published).length;
  const totalRegCount = events.reduce((sum, e) => sum + e._count.registrations, 0);

  return (
    <>
      <style>{`
        .line-grid-admin {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(#e0d6c8 1px, transparent 1px),
            linear-gradient(90deg, #e0d6c8 1px, transparent 1px);
          background-size: 64px 64px;
          opacity: 0.28;
        }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table thead tr { border-bottom: 2px solid #e0d6c8; }
        .admin-table thead th {
          padding: 10px 14px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8c7f6e;
          text-align: left;
        }
      `}</style>

      <div className="min-h-screen bg-[#f0e9db] relative">
        <div className="line-grid-admin" />

        {/* Header */}
        <header className="relative border-b border-[#e0d6c8] bg-[rgba(253,250,245,0.9)] backdrop-blur-lg">
          <div className="max-w-[1200px] mx-auto px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-[#b5604a] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
                <span className="text-[16px] font-light text-[#2a231a]" style={{ fontFamily: SERIF_FONT }}>
                  Poker Studio
                </span>
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b5604a] bg-[rgba(181,96,74,0.08)] border border-[#e8b4a4] px-3 py-0.5 rounded-full">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[12px] text-[#8c7f6e]">{userEmail}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] uppercase text-[#8c7f6e] bg-transparent border border-[#e0d6c8] rounded-md px-3 py-1.5 cursor-pointer transition-all hover:text-[#b5604a] hover:border-[#e8b4a4]"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="relative max-w-[1200px] mx-auto px-6 py-10">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-[clamp(28px,4vw,40px)] font-light text-[#2a231a] mb-1.5" style={{ fontFamily: SERIF_FONT }}>
              Dashboard
            </h1>
            <p className="text-sm text-[#8c7f6e]">Event management & registrations</p>
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-1 mb-8 bg-[#fdfaf5] border border-[#e0d6c8] rounded-lg p-1 w-fit">
            {(["events", "registrations"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase px-5 py-2.5 rounded-md transition-all cursor-pointer border-none ${
                  tab === t
                    ? "bg-[#b5604a] text-white"
                    : "bg-transparent text-[#8c7f6e] hover:text-[#2a231a]"
                }`}
              >
                {t === "events" ? <CalendarDays size={14} /> : <Users size={14} />}
                {t === "events" ? "Events" : "Registrations"}
              </button>
            ))}
          </div>

          {/* ─── EVENTS TAB ─── */}
          {tab === "events" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-8 max-md:grid-cols-2">
                <StatCard icon={<CalendarDays size={14} />} label="Total Events" value={String(events.length)} />
                <StatCard icon={<Eye size={14} />} label="Published" value={String(publishedEvents)} />
                <StatCard icon={<Users size={14} />} label="Total Registrations" value={String(totalRegCount)} />
                <StatCard
                  icon={<CreditCard size={14} />}
                  label="Revenue"
                  value={`€${(regStats.totalRevenueCents / 100).toFixed(0)}`}
                />
              </div>

              {/* Events table card */}
              <div className="bg-[#fdfaf5] border border-[#e0d6c8] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e0d6c8] flex items-center justify-between flex-wrap gap-3">
                  <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#8c7f6e]">
                    Events
                    <span className="ml-2 text-[#b5604a]">({events.length})</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={fetchEvents}
                      className="flex items-center gap-1.5 h-9 px-3 text-[11px] font-bold tracking-[0.12em] uppercase border border-[#e0d6c8] rounded-md bg-[#fdfaf5] text-[#8c7f6e] cursor-pointer transition-all hover:border-[#b5604a] hover:text-[#b5604a]"
                    >
                      <RefreshCw size={12} className={eventsLoading ? "animate-spin" : ""} />
                      Refresh
                    </button>
                    <Link
                      href="/admin/events/new"
                      className="flex items-center gap-1.5 h-9 px-4 text-[11px] font-bold tracking-[0.12em] uppercase bg-[#b5604a] text-white rounded-md transition-all hover:bg-[#9a4e3b] no-underline"
                    >
                      <Plus size={14} />
                      Create Event
                    </Link>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {eventsLoading ? (
                    <div className="p-16 text-center text-[#8c7f6e] text-[13px]">Loading…</div>
                  ) : events.length === 0 ? (
                    <div className="p-16 text-center text-[#8c7f6e] text-[13px]">
                      No events yet. Create your first event to get started.
                    </div>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Event</th>
                          <th>Date</th>
                          <th>Location</th>
                          <th style={{ textAlign: "right" }}>Price</th>
                          <th style={{ textAlign: "center" }}>Seats</th>
                          <th style={{ textAlign: "center" }}>Regs</th>
                          <th>Status</th>
                          <th>Images</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((event) => (
                          <EventRow
                            key={event.id}
                            event={event}
                            onTogglePublish={togglePublish}
                            onDelete={deleteEvent}
                          />
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ─── REGISTRATIONS TAB ─── */}
          {tab === "registrations" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-8 max-md:grid-cols-2">
                <StatCard
                  icon={<Users size={14} />}
                  label="Total Registrations"
                  value={String(regStats.totalRegistrations)}
                />
                <StatCard
                  icon={<CreditCard size={14} />}
                  label="Revenue"
                  value={`€${(regStats.totalRevenueCents / 100).toFixed(0)}`}
                />
                <StatCard icon={<CheckCircle size={14} />} label="Paid" value="—" />
                <StatCard icon={<Clock size={14} />} label="Pending" value="—" />
              </div>

              {/* Registrations table card */}
              <div className="bg-[#fdfaf5] border border-[#e0d6c8] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e0d6c8] flex items-center justify-between flex-wrap gap-3">
                  <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#8c7f6e]">
                    Registrations
                    <span className="ml-2 text-[#b5604a]">({regTotal})</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <Search
                        size={13}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8c7f6e] pointer-events-none"
                      />
                      <input
                        className="h-9 pl-8 pr-3 text-[13px] border border-[#e0d6c8] rounded-md bg-[#fdfaf5] text-[#2a231a] w-[240px] transition-all focus:outline-none focus:border-[#b5604a] focus:ring-2 focus:ring-[rgba(181,96,74,0.12)]"
                        placeholder="Search name, email…"
                        value={regSearch}
                        onChange={(e) => {
                          setRegSearch(e.target.value);
                          setRegPage(1);
                        }}
                      />
                    </div>
                    <select
                      className="h-9 px-2.5 text-[12px] font-semibold tracking-[0.06em] border border-[#e0d6c8] rounded-md bg-[#fdfaf5] text-[#8c7f6e] cursor-pointer focus:outline-none focus:border-[#b5604a]"
                      value={regEventFilter}
                      onChange={(e) => {
                        setRegEventFilter(e.target.value);
                        setRegPage(1);
                      }}
                    >
                      <option value="">All events</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title}
                        </option>
                      ))}
                    </select>
                    <select
                      className="h-9 px-2.5 text-[12px] font-semibold tracking-[0.06em] border border-[#e0d6c8] rounded-md bg-[#fdfaf5] text-[#8c7f6e] cursor-pointer focus:outline-none focus:border-[#b5604a]"
                      value={regStatusFilter}
                      onChange={(e) => {
                        setRegStatusFilter(e.target.value);
                        setRegPage(1);
                      }}
                    >
                      <option value="">All statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="FAILED">Failed</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                    <button
                      onClick={fetchRegistrations}
                      className="flex items-center gap-1.5 h-9 px-3 text-[11px] font-bold tracking-[0.12em] uppercase border border-[#e0d6c8] rounded-md bg-[#fdfaf5] text-[#8c7f6e] cursor-pointer transition-all hover:border-[#b5604a] hover:text-[#b5604a]"
                    >
                      <RefreshCw size={12} className={regLoading ? "animate-spin" : ""} />
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {regLoading ? (
                    <div className="p-16 text-center text-[#8c7f6e] text-[13px]">Loading…</div>
                  ) : registrations.length === 0 ? (
                    <div className="p-16 text-center text-[#8c7f6e] text-[13px]">No registrations found.</div>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name / Email</th>
                          <th>Event</th>
                          <th>Status</th>
                          <th style={{ textAlign: "right" }}>Amount</th>
                          <th style={{ textAlign: "center" }}>People</th>
                          <th>Date</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((reg) => (
                          <RegistrationRowItem key={reg.id} reg={reg} />
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Pagination */}
                {regTotalPages > 1 && (
                  <div className="px-5 py-4 border-t border-[#e0d6c8] flex items-center justify-between">
                    <span className="text-[12px] text-[#8c7f6e]">
                      Showing {(regPage - 1) * 20 + 1}–{Math.min(regPage * 20, regTotal)} of {regTotal}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 text-[12px] font-semibold border border-[#e0d6c8] rounded bg-[#fdfaf5] text-[#8c7f6e] cursor-pointer transition-all hover:border-[#b5604a] hover:text-[#b5604a] disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={regPage === 1}
                        onClick={() => setRegPage((p) => p - 1)}
                      >
                        ←
                      </button>
                      {Array.from({ length: Math.min(regTotalPages, 7) }, (_, i) => {
                        const p = i + 1;
                        return (
                          <button
                            key={p}
                            className={`inline-flex items-center justify-center min-w-[32px] h-8 px-2 text-[12px] font-semibold border rounded cursor-pointer transition-all ${
                              p === regPage
                                ? "bg-[#b5604a] text-white border-[#b5604a]"
                                : "border-[#e0d6c8] bg-[#fdfaf5] text-[#8c7f6e] hover:border-[#b5604a] hover:text-[#b5604a]"
                            }`}
                            onClick={() => setRegPage(p)}
                          >
                            {p}
                          </button>
                        );
                      })}
                      <button
                        className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 text-[12px] font-semibold border border-[#e0d6c8] rounded bg-[#fdfaf5] text-[#8c7f6e] cursor-pointer transition-all hover:border-[#b5604a] hover:text-[#b5604a] disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={regPage === regTotalPages}
                        onClick={() => setRegPage((p) => p + 1)}
                      >
                        →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
