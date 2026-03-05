"use client";

import { useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Plus,
  Trash2,
  CreditCard,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

const SERIF = "var(--font-playfair), 'Playfair Display', Georgia, serif";

type EventInfo = {
  id: string;
  title: string;
  slug: string;
  date: string;
  location: string | null;
  priceInCents: number;
  maxSeats: number | null;
  coverImage: string | null;
};

type Guest = { fullName: string; email: string; phone: string };

// ─── Stripe Payment Form (inside Elements) ─────────────────────────────────────

function PaymentForm({
  registrationId,
  slug,
  amount,
}: {
  registrationId: string;
  slug: string;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Payment failed");
      setPaying(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/events/${slug}/payment-status?registration_id=${registrationId}`,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed");
      setPaying(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg p-5">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <div className="text-[13px] text-[#c41e3a] bg-[rgba(196,30,58,0.08)] border border-[rgba(196,30,58,0.2)] rounded-md px-4 py-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={paying || !stripe}
        className="btn-primary w-full justify-center py-4 text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {paying ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <CreditCard size={16} />
            Pay €{(amount / 100).toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
}

// ─── Main Registration Form ─────────────────────────────────────────────────────

export function RegistrationForm({ event }: { event: EventInfo }) {
  const [step, setStep] = useState<"details" | "payment">("details");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);

  // Payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(event.priceInCents);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPeople = 1 + guests.length;
  const computedTotal = event.priceInCents * totalPeople;

  const addGuest = useCallback(() => {
    setGuests((g) => [...g, { fullName: "", email: "", phone: "" }]);
  }, []);

  const removeGuest = useCallback((idx: number) => {
    setGuests((g) => g.filter((_, i) => i !== idx));
  }, []);

  const updateGuest = useCallback(
    (idx: number, field: keyof Guest, value: string) => {
      setGuests((g) =>
        g.map((guest, i) => (i === idx ? { ...guest, [field]: value } : guest)),
      );
    },
    [],
  );

  async function handleContinueToPayment(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          fullName,
          email,
          phone,
          guests: guests.filter((g) => g.fullName.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setCreating(false);
        return;
      }

      setClientSecret(data.clientSecret);
      setRegistrationId(data.registrationId);
      setTotalAmount(data.totalAmountInCents);
      setStep("payment");
    } catch {
      setError("Network error. Please try again.");
    }
    setCreating(false);
  }

  const inputClass =
    "w-full h-11 px-4 text-sm bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-lg text-[#f5f5f0] placeholder-[rgba(255,255,255,0.25)] transition-all focus:outline-none focus:border-[#c9a96e] focus:ring-1 focus:ring-[rgba(201,169,110,0.3)]";
  const labelClass =
    "block text-[11px] font-bold uppercase tracking-[0.14em] text-[rgba(255,255,255,0.45)] mb-1.5";

  return (
    <div className="min-h-screen bg-[#09090b] relative">
      <div className="grid-overlay" />

      {/* Header */}
      <header className="relative border-b border-[rgba(255,255,255,0.06)] bg-[rgba(9,9,11,0.9)] backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href={`/events/${event.slug}`}
            className="flex items-center gap-2 text-[12px] font-semibold text-[rgba(255,255,255,0.5)] hover:text-[#f5f5f0] transition-colors no-underline"
          >
            <ArrowLeft size={16} />
            Back to Event
          </Link>
          <span className="tag tag-gold">Registration</span>
        </div>
      </header>

      <main className="relative max-w-[900px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Left: Form */}
          <div>
            <h1
              className="text-[clamp(24px,3.5vw,32px)] font-light text-[#f5f5f0] mb-2"
              style={{ fontFamily: SERIF }}
            >
              Register for{" "}
              <em className="italic text-[#c9a96e]">{event.title}</em>
            </h1>
            <p className="text-sm text-[rgba(255,255,255,0.45)] mb-8">
              Fill in your details and complete payment to secure your spot.
            </p>

            {step === "details" && (
              <form onSubmit={handleContinueToPayment} className="space-y-6">
                {error && (
                  <div className="text-[13px] text-[#c41e3a] bg-[rgba(196,30,58,0.08)] border border-[rgba(196,30,58,0.2)] rounded-md px-4 py-3">
                    {error}
                  </div>
                )}

                {/* Primary registrant */}
                <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 space-y-4">
                  <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#c9a96e] mb-1">
                    Your Details
                  </div>

                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input
                      className={inputClass}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        className={inputClass}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input
                        type="tel"
                        className={inputClass}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+31 6 1234 5678"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Guests */}
                {guests.map((guest, idx) => (
                  <div
                    key={idx}
                    className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[rgba(255,255,255,0.4)]">
                        Guest {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeGuest(idx)}
                        className="text-[rgba(255,255,255,0.3)] hover:text-[#c41e3a] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div>
                      <label className={labelClass}>Full Name</label>
                      <input
                        className={inputClass}
                        value={guest.fullName}
                        onChange={(e) =>
                          updateGuest(idx, "fullName", e.target.value)
                        }
                        placeholder="Guest name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Email (optional)</label>
                        <input
                          type="email"
                          className={inputClass}
                          value={guest.email}
                          onChange={(e) =>
                            updateGuest(idx, "email", e.target.value)
                          }
                          placeholder="guest@example.com"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Phone (optional)</label>
                        <input
                          type="tel"
                          className={inputClass}
                          value={guest.phone}
                          onChange={(e) =>
                            updateGuest(idx, "phone", e.target.value)
                          }
                          placeholder="+31 ..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addGuest}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[rgba(255,255,255,0.1)] rounded-lg text-[12px] font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-[0.12em] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all"
                >
                  <Plus size={14} />
                  Add Another Person
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary w-full justify-center py-4 text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating booking…
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      Continue to Payment — €{(computedTotal / 100).toFixed(2)}
                    </>
                  )}
                </button>
              </form>
            )}

            {step === "payment" && clientSecret && registrationId && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "night",
                    variables: {
                      colorPrimary: "#c9a96e",
                      colorBackground: "#111113",
                      colorText: "#f5f5f0",
                      colorTextSecondary: "rgba(255,255,255,0.5)",
                      colorDanger: "#c41e3a",
                      borderRadius: "8px",
                      fontFamily: "system-ui, -apple-system, sans-serif",
                    },
                    rules: {
                      ".Input": {
                        border: "1px solid rgba(255,255,255,0.1)",
                        backgroundColor: "rgba(255,255,255,0.04)",
                      },
                      ".Input:focus": {
                        border: "1px solid #c9a96e",
                        boxShadow: "0 0 0 1px rgba(201,169,110,0.3)",
                      },
                    },
                  },
                }}
              >
                <PaymentForm
                  registrationId={registrationId}
                  slug={event.slug}
                  amount={totalAmount}
                />
              </Elements>
            )}
          </div>

          {/* Right: Order summary */}
          <div className="md:sticky md:top-24">
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
              {event.coverImage && (
                <div className="relative aspect-[16/9]">
                  <Image
                    src={event.coverImage}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent" />
                </div>
              )}

              <div className="p-5 space-y-4">
                <h3
                  className="text-lg font-light text-[#f5f5f0]"
                  style={{ fontFamily: SERIF }}
                >
                  {event.title}
                </h3>

                <div className="space-y-2 text-[13px] text-[rgba(255,255,255,0.5)]">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-[#c9a96e]" />
                    {new Date(event.date).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-[#c9a96e]" />
                      {event.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users size={13} className="text-[#c9a96e]" />
                    {totalPeople} {totalPeople === 1 ? "person" : "people"}
                  </div>
                </div>

                <div className="border-t border-[rgba(255,255,255,0.06)] pt-4 space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[rgba(255,255,255,0.45)]">
                      €{(event.priceInCents / 100).toFixed(2)} × {totalPeople}
                    </span>
                    <span className="text-[#f5f5f0]">
                      €{(computedTotal / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[15px] font-semibold pt-2 border-t border-[rgba(255,255,255,0.06)]">
                    <span className="text-[#f5f5f0]">Total</span>
                    <span
                      className="text-[#c9a96e]"
                      style={{ fontFamily: SERIF }}
                    >
                      €{(computedTotal / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
