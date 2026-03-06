import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "12", 10), 50);
  const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10), 1);
  const category = searchParams.get("category") ?? "";
  const includePast = searchParams.get("includePast") === "true";

  const where: Record<string, unknown> = { published: true };
  if (!includePast) where.date = { gte: new Date() };
  if (category) where.category = { contains: category, mode: "insensitive" };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { date: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        _count: { select: { registrations: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
