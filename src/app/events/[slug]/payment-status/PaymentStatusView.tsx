"use client";

import Link from "next/link";
import { CheckCircle, XCircle, Clock, ArrowLeft, Home } from "lucide-react";

const SERIF = "var(--font-playfair), 'Playfair Display', Georgia, serif";

type Props = {
  event: { title: string; slug: string };
  registration: {
    id: string;
    fullName: string;
    email: string;
    totalAmountInCents: number;
    paymentStatus: string;
    guestCount: number;
  } | null;
  redirectStatus: string | null;
};

export function PaymentStatusView({ event, registration, redirectStatus }: Props) {
  const status = redirectStatus ?? registration?.paymentStatus?.toLowerCase() ?? "unknown";

  const isSuccess = status === "succeeded" || registration?.paymentStatus === "PAID";
  const isFailed = status === "failed" || registration?.paymentStatus === "FAILED";
  const isPending = !isSuccess && !isFailed;

  return (
    <div className="min-h-screen bg-[#09090b] relative flex items-center justify-center">
      <div className="grid-overlay" />

      <div className="relative max-w-[480px] w-full mx-6 text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          {isSuccess && (
            <div className="w-20 h-20 rounded-full bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] flex items-center justify-center">
              <CheckCircle size={36} className="text-emerald-500" />
            </div>
          )}
          {isFailed && (
            <div className="w-20 h-20 rounded-full bg-[rgba(196,30,58,0.1)] border border-[rgba(196,30,58,0.2)] flex items-center justify-center">
              <XCircle size={36} className="text-[#c41e3a]" />
            </div>
          )}
          {isPending && (
            <div className="w-20 h-20 rounded-full bg-[rgba(201,169,110,0.1)] border border-[rgba(201,169,110,0.2)] flex items-center justify-center">
              <Clock size={36} className="text-[#c9a96e]" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1
          className="text-[clamp(24px,4vw,32px)] font-light text-[#f5f5f0] mb-2"
          style={{ fontFamily: SERIF }}
        >
          {isSuccess && "Payment Confirmed!"}
          {isFailed && "Payment Failed"}
          {isPending && "Processing Payment…"}
        </h1>

        <p className="text-sm text-[rgba(255,255,255,0.45)] mb-8 max-w-sm mx-auto">
          {isSuccess &&
            `Thank you, ${registration?.fullName ?? ""}! Your registration for ${event.title} has been confirmed. A confirmation email has been sent to ${registration?.email ?? "your inbox"}.`}
          {isFailed &&
            `Your payment could not be processed. Please try again or contact us for assistance.`}
          {isPending &&
            `Your payment is being processed. You'll receive a confirmation email shortly.`}
        </p>

        {/* Summary card */}
        {registration && isSuccess && (
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 mb-8 text-left space-y-3">
            <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#c9a96e] mb-3">
              Booking Summary
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[rgba(255,255,255,0.45)]">Event</span>
              <span className="text-[#f5f5f0]">{event.title}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[rgba(255,255,255,0.45)]">Name</span>
              <span className="text-[#f5f5f0]">{registration.fullName}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[rgba(255,255,255,0.45)]">People</span>
              <span className="text-[#f5f5f0]">
                {1 + registration.guestCount}
              </span>
            </div>
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 flex justify-between text-[15px] font-semibold">
              <span className="text-[#f5f5f0]">Total Paid</span>
              <span className="text-[#c9a96e]" style={{ fontFamily: SERIF }}>
                €{(registration.totalAmountInCents / 100).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isFailed && (
            <Link
              href={`/events/${event.slug}/register`}
              className="btn-primary text-[12px]"
            >
              <ArrowLeft size={14} />
              Try Again
            </Link>
          )}
          <Link
            href="/"
            className="btn-ghost text-[12px]"
          >
            <Home size={14} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
