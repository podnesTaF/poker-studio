import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resend, FROM_EMAIL } from "@/lib/resend";
import EventAnnouncement from "@/emails/EventAnnouncement";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const subscribers = await prisma.subscriber.findMany();
  if (subscribers.length === 0) {
    return NextResponse.json({ message: "No subscribers to notify", sent: 0 });
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const emails = subscribers.map((sub) => ({
    from: FROM_EMAIL,
    to: sub.email,
    subject: `New Event: ${event.title} — ${formattedDate}`,
    react: EventAnnouncement({
      eventTitle: event.title,
      eventDate: formattedDate,
      eventTime: formattedTime,
      eventLocation: event.location,
      eventDescription: event.description,
      eventCategory: event.category,
      priceInCents: event.priceInCents,
      eventSlug: event.slug,
      baseUrl,
    }),
  }));

  let sentCount = 0;
  const batchSize = 50;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    try {
      await resend.batch.send(batch);
      sentCount += batch.length;
    } catch (error) {
      console.error(`Batch send error (offset ${i}):`, error);
    }
  }

  return NextResponse.json({
    message: `Announcement sent to ${sentCount} subscriber(s)`,
    sent: sentCount,
  });
}
