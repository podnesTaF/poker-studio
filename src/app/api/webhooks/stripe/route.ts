import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { resend, FROM_EMAIL } from "@/lib/resend";
import RegistrationConfirmation from "@/emails/RegistrationConfirmation";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const registrationId = pi.metadata.registrationId;
      if (registrationId) {
        await prisma.registration.update({
          where: { id: registrationId },
          data: { paymentStatus: "PAID" },
        });

        try {
          const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
            include: {
              event: true,
              guests: true,
            },
          });

          if (registration) {
            const eventDate = new Date(registration.event.date);

            let receiptUrl: string | null = null;
            try {
              const charges = await stripe.charges.list({
                payment_intent: pi.id,
                limit: 1,
              });
              receiptUrl = charges.data[0]?.receipt_url ?? null;
            } catch {
              // Receipt URL is optional
            }

            await resend.emails.send({
              from: FROM_EMAIL,
              to: registration.email,
              subject: `Booking Confirmed — ${registration.event.title}`,
              react: RegistrationConfirmation({
                fullName: registration.fullName,
                eventTitle: registration.event.title,
                eventDate: eventDate.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
                eventTime: eventDate.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                eventLocation: registration.event.location,
                guestCount: registration.guests.length,
                totalAmountCents: registration.totalAmountInCents,
                registrationId: registration.id,
                stripeReceiptUrl: receiptUrl,
              }),
            });
          }
        } catch (emailErr) {
          console.error("Failed to send confirmation email:", emailErr);
        }
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const registrationId = pi.metadata.registrationId;
      if (registrationId) {
        await prisma.registration.update({
          where: { id: registrationId },
          data: { paymentStatus: "FAILED" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
