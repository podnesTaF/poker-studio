import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  const where: Prisma.RegistrationWhereInput = {};
  if (eventId) where.eventId = eventId;
  if (status) where.paymentStatus = status as Prisma.EnumPaymentStatusFilter;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [registrations, total, stats] = await Promise.all([
    prisma.registration.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        event: { select: { title: true, slug: true } },
        guests: true,
      },
    }),
    prisma.registration.count({ where }),
    prisma.registration.aggregate({
      _sum: { totalAmountInCents: true },
      _count: true,
    }),
  ]);

  return NextResponse.json({
    registrations,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    stats: {
      totalRegistrations: stats._count,
      totalRevenueCents: stats._sum.totalAmountInCents ?? 0,
    },
  });
}
