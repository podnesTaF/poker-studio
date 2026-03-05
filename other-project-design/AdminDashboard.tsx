"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  Search,
  LogOut,
  ChevronDown,
  ChevronUp,
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  ExternalLink,
  FileDown,
} from "lucide-react";

type Person = {
  id: string;
  isPrimary: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  church: string;
  age: number;
  country: string;
  city: string;
  tShirtSize: string;
  travellingWith?: string;
  specialNeeds?: string;
};

type Payment = {
  id: string;
  paymentIntentId: string;
  paymentStatus: string;
  paymentType: string;
  amount?: number;
  currency?: string;
  createdAt: string;
};

type Registration = {
  id: string;
  email: string;
  phone: string;
  paymentOption: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  personCount: number;
  createdAt: string;
  people: Person[];
  payments: Payment[];
};

type Stats = {
  totalRegistrations: number;
  totalPeople: number;
  totalRevenueCents: number;
  statusCounts: Record<string, number>;
};

type ApiResponse = {
  registrations: Registration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: Stats;
};

const STATUS_LABELS: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: "Pending", color: "#b5604a", bg: "rgba(181,96,74,0.10)" },
  DEPOSIT_PAID: {
    label: "Deposit Paid",
    color: "#6a8a5a",
    bg: "rgba(106,138,90,0.10)",
  },
  FULLY_PAID: {
    label: "Fully Paid",
    color: "#4a7a6a",
    bg: "rgba(74,122,106,0.12)",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#8c7f6e",
    bg: "rgba(140,127,110,0.10)",
  },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] ?? {
    label: status,
    color: "#8c7f6e",
    bg: "rgba(140,127,110,0.10)",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "3px 10px",
        borderRadius: 100,
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.color}30`,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: s.color,
          flexShrink: 0,
        }}
      />
      {s.label}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        background: "#fdfaf5",
        border: "1px solid #e0d6c8",
        borderRadius: 10,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "#b5604a",
        }}
      >
        {icon}
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#8c7f6e",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 300,
          color: "#2a231a",
          lineHeight: 1,
          fontFamily: "var(--font-playfair),'Playfair Display',Georgia,serif",
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "#8c7f6e" }}>{sub}</div>}
    </div>
  );
}

function RegistrationRow({ reg }: { reg: Registration }) {
  const [open, setOpen] = useState(false);
  const primary = reg.people.find((p) => p.isPrimary) ?? reg.people[0];

  return (
    <>
      <tr
        onClick={() => setOpen((v) => !v)}
        style={{
          cursor: "pointer",
          borderBottom: open ? "none" : "1px solid #e0d6c8",
          background: open ? "#fdfaf5" : "transparent",
          transition: "background 0.15s",
        }}
        className="hover:bg-[#fdfaf5]"
      >
        <td style={{ padding: "14px 16px", fontSize: 13 }}>
          <div style={{ fontWeight: 600, color: "#2a231a" }}>
            {primary ? `${primary.firstName} ${primary.lastName}` : reg.email}
          </div>
          <div style={{ fontSize: 11, color: "#8c7f6e", marginTop: 2 }}>
            {reg.email}
          </div>
        </td>
        <td style={{ padding: "14px 16px" }}>
          <StatusBadge status={reg.status} />
        </td>
        <td style={{ padding: "14px 16px", fontSize: 13, color: "#2a231a" }}>
          {reg.paymentOption === "full" ? "Full" : "Deposit"}
        </td>
        <td
          style={{
            padding: "14px 16px",
            fontSize: 13,
            color: "#2a231a",
            textAlign: "right",
          }}
        >
          <span style={{ color: "#4a7a6a", fontWeight: 600 }}>
            €{(reg.paidAmount / 100).toFixed(0)}
          </span>
          <span style={{ color: "#8c7f6e", fontSize: 11, marginLeft: 4 }}>
            / €{(reg.totalAmount / 100).toFixed(0)}
          </span>
        </td>
        <td
          style={{
            padding: "14px 16px",
            fontSize: 13,
            color: "#8c7f6e",
            textAlign: "center",
          }}
        >
          {reg.personCount}
        </td>
        <td style={{ padding: "14px 16px", fontSize: 11, color: "#8c7f6e" }}>
          {new Date(reg.createdAt).toLocaleDateString("uk-UA", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </td>
        <td style={{ padding: "14px 16px", textAlign: "right" }}>
          {open ? (
            <ChevronUp size={15} color="#8c7f6e" />
          ) : (
            <ChevronDown size={15} color="#8c7f6e" />
          )}
        </td>
      </tr>

      {open && (
        <tr style={{ borderBottom: "1px solid #e0d6c8" }}>
          <td colSpan={7} style={{ padding: "0 0 16px 0" }}>
            <div
              style={{
                background: "#f7f1e8",
                borderTop: "1px dashed #e0d6c8",
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* People */}
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#8c7f6e",
                    marginBottom: 10,
                  }}
                >
                  People ({reg.people.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {reg.people.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        background: "#fdfaf5",
                        border: "1px solid #e0d6c8",
                        borderRadius: 8,
                        padding: "12px 16px",
                        minWidth: 220,
                        flex: "1 1 220px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: "#2a231a",
                          }}
                        >
                          {p.firstName} {p.lastName}
                        </span>
                        {p.isPrimary && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: "0.14em",
                              textTransform: "uppercase",
                              color: "#b5604a",
                              background: "rgba(181,96,74,0.10)",
                              padding: "2px 7px",
                              borderRadius: 100,
                            }}
                          >
                            Primary
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#8c7f6e",
                          lineHeight: 1.7,
                        }}
                      >
                        <div>{p.email}</div>
                        <div>{p.phone}</div>
                        <div>{p.church}</div>
                        <div>
                          {p.city}, {p.country} · Age {p.age}
                        </div>
                        <div>
                          T-shirt:{" "}
                          <strong style={{ color: "#2a231a" }}>
                            {p.tShirtSize}
                          </strong>
                        </div>
                        {p.travellingWith && (
                          <div>With: {p.travellingWith}</div>
                        )}
                        {p.specialNeeds && (
                          <div style={{ color: "#b5604a" }}>
                            Needs: {p.specialNeeds}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payments */}
              {reg.payments.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#8c7f6e",
                      marginBottom: 10,
                    }}
                  >
                    Payments
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {reg.payments.map((pay) => (
                      <div
                        key={pay.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "#fdfaf5",
                          border: "1px solid #e0d6c8",
                          borderRadius: 6,
                          padding: "10px 14px",
                          fontSize: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <span
                            style={{
                              color: "#8c7f6e",
                              fontFamily: "monospace",
                              fontSize: 11,
                            }}
                          >
                            {pay.paymentIntentId.slice(0, 20)}…
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              padding: "2px 8px",
                              borderRadius: 100,
                              color:
                                pay.paymentType === "deposit"
                                  ? "#b5604a"
                                  : "#4a7a6a",
                              background:
                                pay.paymentType === "deposit"
                                  ? "rgba(181,96,74,0.10)"
                                  : "rgba(74,122,106,0.12)",
                            }}
                          >
                            {pay.paymentType}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                          }}
                        >
                          <span style={{ color: "#4a7a6a", fontWeight: 600 }}>
                            {pay.amount
                              ? `€${(pay.amount / 100).toFixed(0)}`
                              : "—"}
                          </span>
                          <span style={{ color: "#8c7f6e", fontSize: 11 }}>
                            {new Date(pay.createdAt).toLocaleDateString(
                              "uk-UA",
                            )}
                          </span>
                          <StatusBadge status={pay.paymentStatus} />
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <a
                              href={`/api/admin/redirect-stripe?payment_intent=${encodeURIComponent(pay.paymentIntentId)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 11,
                                color: "#b5604a",
                                textDecoration: "none",
                                fontWeight: 600,
                              }}
                            >
                              <ExternalLink
                                style={{ width: 12, height: 12 }}
                              />
                              Stripe
                            </a>
                            <a
                              href={`/api/admin/redirect-receipt?payment_intent=${encodeURIComponent(pay.paymentIntentId)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 11,
                                color: "#4a7a6a",
                                textDecoration: "none",
                                fontWeight: 600,
                              }}
                            >
                              <FileDown
                                style={{ width: 12, height: 12 }}
                              />
                              Receipt
                            </a>
                          </span>
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

export function AdminDashboard({ userEmail }: { userEmail: string }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/registrations?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [page, debouncedSearch, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = data?.stats;

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
        .admin-search {
          height: 36px;
          padding: 0 12px 0 36px;
          font-size: 13px;
          border: 1px solid #e0d6c8;
          border-radius: 6px;
          background: #fdfaf5;
          color: #2a231a;
          width: 260px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .admin-search:focus {
          outline: none;
          border-color: #b5604a;
          box-shadow: 0 0 0 3px rgba(181,96,74,0.12);
        }
        .admin-select {
          height: 36px;
          padding: 0 10px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          border: 1px solid #e0d6c8;
          border-radius: 6px;
          background: #fdfaf5;
          color: #8c7f6e;
        }
        .admin-select:focus { outline: none; border-color: #b5604a; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table thead tr { border-bottom: 2px solid #e0d6c8; }
        .admin-table thead th {
          padding: 10px 16px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8c7f6e;
          text-align: left;
        }
        .admin-table tbody tr:hover { background: rgba(253,250,245,0.8); }
        .pg-btn {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 32px; height: 32px; padding: 0 8px;
          font-size: 12px; font-weight: 600;
          border: 1px solid #e0d6c8; border-radius: 5px;
          background: #fdfaf5; color: #8c7f6e;
          cursor: pointer; transition: all 0.15s;
        }
        .pg-btn:hover { border-color: #b5604a; color: #b5604a; }
        .pg-btn.active { background: #b5604a; color: #fff; border-color: #b5604a; }
        .pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="min-h-screen bg-[#f0e9db] relative">
        <div className="line-grid-admin" />

        {/* Header */}
        <header
          style={{
            position: "relative",
            borderBottom: "1px solid #e0d6c8",
            background: "rgba(253,250,245,0.9)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Image
                src="/images/logo.png"
                alt="AWAKENING 2026"
                width={160}
                height={40}
                style={{ height: 36, width: "auto" }}
                priority
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#b5604a",
                  background: "rgba(181,96,74,0.08)",
                  border: "1px solid #e8b4a4",
                  padding: "3px 12px",
                  borderRadius: 100,
                }}
              >
                Admin
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 12, color: "#8c7f6e" }}>
                {userEmail}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#8c7f6e",
                  background: "none",
                  border: "1px solid #e0d6c8",
                  borderRadius: 6,
                  padding: "6px 12px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#b5604a";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "#e8b4a4";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#8c7f6e";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "#e0d6c8";
                }}
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main
          style={{
            position: "relative",
            maxWidth: 1200,
            margin: "0 auto",
            padding: "40px 24px",
          }}
        >
          {/* Title */}
          <div style={{ marginBottom: 32 }}>
            <h1
              style={{
                fontFamily:
                  "var(--font-playfair),'Playfair Display',Georgia,serif",
                fontSize: "clamp(28px,4vw,40px)",
                fontWeight: 300,
                color: "#2a231a",
                marginBottom: 6,
              }}
            >
              Dashboard
            </h1>
            <p style={{ fontSize: 14, color: "#8c7f6e" }}>
              Registration overview & management
            </p>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
              marginBottom: 40,
            }}
          >
            <StatCard
              icon={<Users size={14} />}
              label="Registrations"
              value={String(stats?.totalRegistrations ?? "—")}
            />
            <StatCard
              icon={<Users size={14} />}
              label="Total People"
              value={String(stats?.totalPeople ?? "—")}
            />
            <StatCard
              icon={<CreditCard size={14} />}
              label="Revenue"
              value={
                stats ? `€${(stats.totalRevenueCents / 100).toFixed(0)}` : "—"
              }
            />
            <StatCard
              icon={<CheckCircle size={14} />}
              label="Fully Paid"
              value={String(stats?.statusCounts?.FULLY_PAID ?? 0)}
            />
            <StatCard
              icon={<Clock size={14} />}
              label="Deposit Paid"
              value={String(stats?.statusCounts?.DEPOSIT_PAID ?? 0)}
            />
            <StatCard
              icon={<XCircle size={14} />}
              label="Pending"
              value={String(stats?.statusCounts?.PENDING ?? 0)}
            />
          </div>

          {/* Table card */}
          <div
            style={{
              background: "#fdfaf5",
              border: "1px solid #e0d6c8",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Toolbar */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e0d6c8",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#8c7f6e",
                }}
              >
                Registrations
                {data && (
                  <span style={{ marginLeft: 8, color: "#b5604a" }}>
                    ({data.pagination.total})
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ position: "relative" }}>
                  <Search
                    size={13}
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#8c7f6e",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    className="admin-search"
                    placeholder="Search name, email…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <select
                  className="admin-select"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="DEPOSIT_PAID">Deposit Paid</option>
                  <option value="FULLY_PAID">Fully Paid</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <button
                  onClick={fetchData}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    height: 36,
                    padding: "0 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    border: "1px solid #e0d6c8",
                    borderRadius: 6,
                    background: "#fdfaf5",
                    color: "#8c7f6e",
                    cursor: "pointer",
                  }}
                >
                  <RefreshCw
                    size={12}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              {loading ? (
                <div
                  style={{
                    padding: "60px 20px",
                    textAlign: "center",
                    color: "#8c7f6e",
                    fontSize: 13,
                  }}
                >
                  Loading…
                </div>
              ) : !data || data.registrations.length === 0 ? (
                <div
                  style={{
                    padding: "60px 20px",
                    textAlign: "center",
                    color: "#8c7f6e",
                    fontSize: 13,
                  }}
                >
                  No registrations found.
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name / Email</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                      <th style={{ textAlign: "center" }}>People</th>
                      <th>Date</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {data.registrations.map((reg) => (
                      <RegistrationRow key={reg.id} reg={reg} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid #e0d6c8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 12, color: "#8c7f6e" }}>
                  Showing {(page - 1) * data.pagination.limit + 1}–
                  {Math.min(
                    page * data.pagination.limit,
                    data.pagination.total,
                  )}{" "}
                  of {data.pagination.total}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className="pg-btn"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ←
                  </button>
                  {Array.from(
                    { length: Math.min(data.pagination.totalPages, 7) },
                    (_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          className={`pg-btn${p === page ? " active" : ""}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      );
                    },
                  )}
                  <button
                    className="pg-btn"
                    disabled={page === data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
