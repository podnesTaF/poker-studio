import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users, CreditCard } from "lucide-react";

const SERIF = "var(--font-playfair), 'Playfair Display', Georgia, serif";

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
          registrations: { where: { paymentStatus: { in: ["PAID", "PENDING"] } } },
        },
      },
    },
  });

  if (!event || !event.published) notFound();

  const seatsLeft =
    event.maxSeats != null
      ? event.maxSeats - event._count.registrations
      : null;

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();

  return (
    <div className="min-h-screen bg-[#09090b] relative">
      <div className="grid-overlay" />

      {/* Hero image */}
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[rgba(9,9,11,0.4)] to-transparent" />
        </div>
      )}

      <main className="relative max-w-[900px] mx-auto px-6 -mt-20 pb-20">
        {/* Title */}
        <div className="mb-8">
          <span className="tag tag-gold mb-4 inline-block">
            {event.category ?? "Event"}
          </span>
          <h1
            className="text-[clamp(28px,5vw,48px)] font-light text-[#f5f5f0] leading-tight mb-4"
            style={{ fontFamily: SERIF }}
          >
            {event.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-10 event-layout items-start">
          {/* Left: Description */}
          <div>
            {event.description && (
              <div
                className="event-prose"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            )}

            {/* Additional images */}
            {event.images.length > 1 && (
              <div className="mt-10 grid grid-cols-2 gap-3">
                {event.images.slice(1).map((img) => (
                  <div key={img.id} className="relative aspect-[4/3] rounded-lg overflow-hidden gallery-item">
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

          {/* Right: Booking card */}
          <div className="md:sticky md:top-24">
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 space-y-5">
              {/* Meta */}
              <div className="space-y-3 text-[13px] text-[rgba(255,255,255,0.55)]">
                <div className="flex items-center gap-3">
                  <Calendar size={15} className="text-[#c9a96e] shrink-0" />
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
                    <MapPin size={15} className="text-[#c9a96e] shrink-0" />
                    <span>{event.location}</span>
                  </div>
                )}
                {seatsLeft != null && (
                  <div className="flex items-center gap-3">
                    <Users size={15} className="text-[#c9a96e] shrink-0" />
                    <span>
                      {seatsLeft > 0
                        ? `${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} left`
                        : "Sold out"}
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
                <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-[rgba(255,255,255,0.35)] mb-1">
                  Price per person
                </div>
                <div
                  className="text-2xl text-[#c9a96e] font-light"
                  style={{ fontFamily: SERIF }}
                >
                  €{(event.priceInCents / 100).toFixed(2)}
                </div>
              </div>

              {/* CTA */}
              {!isPast && (seatsLeft === null || seatsLeft > 0) ? (
                <Link
                  href={`/events/${event.slug}/register`}
                  className="btn-primary w-full justify-center py-4 text-[12px]"
                >
                  <CreditCard size={15} />
                  Register Now
                </Link>
              ) : isPast ? (
                <div className="text-center text-sm text-[rgba(255,255,255,0.35)] py-3">
                  This event has ended.
                </div>
              ) : (
                <div className="text-center text-sm text-[#c41e3a] py-3 font-semibold">
                  Sold Out
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
