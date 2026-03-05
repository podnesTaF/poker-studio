import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: {
      _count: { select: { registrations: true, images: true } },
    },
  });

  return NextResponse.json({ events });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, slug, description, date, location, category, priceInCents, maxSeats, published, images } =
    body;

  if (!title || !slug || !date || priceInCents == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.event.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const event = await prisma.event.create({
    data: {
      title,
      slug,
      description: description ?? null,
      date: new Date(date),
      location: location ?? null,
      category: category ?? null,
      priceInCents,
      maxSeats: maxSeats ?? null,
      published: published ?? false,
      images:
        images && images.length > 0
          ? {
              create: images.map(
                (img: { url: string; gcsPath: string; order: number }) => ({
                  url: img.url,
                  gcsPath: img.gcsPath,
                  order: img.order,
                })
              ),
            }
          : undefined,
    },
    include: { images: true },
  });

  return NextResponse.json({ event }, { status: 201 });
}
