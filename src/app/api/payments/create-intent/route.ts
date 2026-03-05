import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, fullName, email, phone, guests } = body;

    if (!eventId || !fullName || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (!event.published) {
      return NextResponse.json({ error: "Event is not available" }, { status: 400 });
    }

    const guestList: { fullName: string; email?: string; phone?: string }[] = guests ?? [];
    const totalPeople = 1 + guestList.length;
    const totalAmountInCents = event.priceInCents * totalPeople;

    if (event.maxSeats) {
      const existingCount = await prisma.registration.count({
        where: { eventId, paymentStatus: { in: ["PAID", "PENDING"] } },
      });
      const existingGuests = await prisma.registrationGuest.count({
        where: {
          registration: { eventId, paymentStatus: { in: ["PAID", "PENDING"] } },
        },
      });
      const takenSeats = existingCount + existingGuests;
      if (takenSeats + totalPeople > event.maxSeats) {
        return NextResponse.json({ error: "Not enough seats available" }, { status: 409 });
      }
    }

    const registration = await prisma.registration.create({
      data: {
        eventId,
        fullName,
        email,
        phone,
        totalAmountInCents,
        paymentStatus: "PENDING",
        guests:
          guestList.length > 0
            ? {
                create: guestList.map((g) => ({
                  fullName: g.fullName,
                  email: g.email ?? null,
                  phone: g.phone ?? null,
                })),
              }
            : undefined,
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents,
      currency: "eur",
      metadata: {
        registrationId: registration.id,
        eventId: event.id,
        eventTitle: event.title,
      },
      receipt_email: email,
      description: `${event.title} — ${totalPeople} ${totalPeople === 1 ? "person" : "people"}`,
    });

    await prisma.registration.update({
      where: { id: registration.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      registrationId: registration.id,
      totalAmountInCents,
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
