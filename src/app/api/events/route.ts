import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") ?? "12", 10);

  const events = await prisma.event.findMany({
    where: {
      published: true,
      date: { gte: new Date() },
    },
    orderBy: { date: "asc" },
    take: limit,
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      _count: { select: { registrations: true } },
    },
  });

  return NextResponse.json({ events });
}
