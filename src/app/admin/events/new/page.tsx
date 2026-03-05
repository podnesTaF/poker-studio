import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { EventForm } from "@/components/admin/EventForm";

export default async function NewEventPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  return <EventForm />;
}
