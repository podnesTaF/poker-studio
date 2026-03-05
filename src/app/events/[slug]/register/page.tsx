import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RegistrationForm } from "./RegistrationForm";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });

  if (!event || !event.published) notFound();

  return (
    <RegistrationForm
      event={{
        id: event.id,
        title: event.title,
        slug: event.slug,
        date: event.date.toISOString(),
        location: event.location,
        priceInCents: event.priceInCents,
        maxSeats: event.maxSeats,
        coverImage: event.images[0]?.url ?? null,
      }}
    />
  );
}
