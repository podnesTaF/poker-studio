import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PaymentStatusView } from "./PaymentStatusView";

export default async function PaymentStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ registration_id?: string; payment_intent?: string; redirect_status?: string }>;
}) {
  const { slug } = await params;
  const { registration_id, redirect_status } = await searchParams;

  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) notFound();

  let registration = null;
  if (registration_id) {
    registration = await prisma.registration.findUnique({
      where: { id: registration_id },
      include: { guests: true },
    });
  }

  return (
    <PaymentStatusView
      event={{ title: event.title, slug: event.slug }}
      registration={
        registration
          ? {
              id: registration.id,
              fullName: registration.fullName,
              email: registration.email,
              totalAmountInCents: registration.totalAmountInCents,
              paymentStatus: registration.paymentStatus,
              guestCount: registration.guests.length,
            }
          : null
      }
      redirectStatus={redirect_status ?? null}
    />
  );
}
