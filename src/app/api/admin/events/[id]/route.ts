import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/gcs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      _count: { select: { registrations: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ event });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.description !== undefined) data.description = body.description;
  if (body.date !== undefined) data.date = new Date(body.date);
  if (body.location !== undefined) data.location = body.location;
  if (body.priceInCents !== undefined) data.priceInCents = body.priceInCents;
  if (body.maxSeats !== undefined) data.maxSeats = body.maxSeats;
  if (body.published !== undefined) data.published = body.published;

  const event = await prisma.event.update({
    where: { id },
    data,
  });

  if (body.images) {
    const incoming: {
      id?: string;
      url: string;
      gcsPath: string;
      order: number;
      isNew?: boolean;
    }[] = body.images;

    const existingImages = await prisma.eventImage.findMany({
      where: { eventId: id },
    });

    const incomingIds = new Set(incoming.filter((i) => i.id).map((i) => i.id));
    const toDelete = existingImages.filter((img) => !incomingIds.has(img.id));

    for (const img of toDelete) {
      try {
        await deleteFile(img.gcsPath);
      } catch {
        // GCS deletion is best-effort
      }
      await prisma.eventImage.delete({ where: { id: img.id } });
    }

    for (const img of incoming) {
      if (img.isNew || !img.id) {
        await prisma.eventImage.create({
          data: {
            eventId: id,
            url: img.url,
            gcsPath: img.gcsPath,
            order: img.order,
          },
        });
      } else {
        await prisma.eventImage.update({
          where: { id: img.id },
          data: { order: img.order },
        });
      }
    }
  }

  const updated = await prisma.event.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ event: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const images = await prisma.eventImage.findMany({ where: { eventId: id } });
  for (const img of images) {
    try {
      await deleteFile(img.gcsPath);
    } catch {
      // best-effort
    }
  }

  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
