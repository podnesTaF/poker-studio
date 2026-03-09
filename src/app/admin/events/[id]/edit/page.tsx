import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/admin/EventForm";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      videos: { orderBy: { order: "asc" } },
    },
  });

  if (!event) notFound();

  return (
    <EventForm
      event={{
        id: event.id,
        title: event.title,
        slug: event.slug,
        category: event.category,
        description: event.description,
        date: event.date.toISOString(),
        location: event.location,
        priceInCents: event.priceInCents,
        maxSeats: event.maxSeats,
        published: event.published,
        images: event.images.map((img) => ({
          id: img.id,
          url: img.url,
          gcsPath: img.gcsPath,
          order: img.order,
        })),
        videos: event.videos.map((vid) => ({
          id: vid.id,
          url: vid.url,
          gcsPath: vid.gcsPath,
          order: vid.order,
          isCover: vid.isCover,
        })),
      }}
    />
  );
}
