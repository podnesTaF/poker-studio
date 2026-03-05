import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminLoginForm } from "./admin-login-form";

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AdminLoginForm />
    </div>
  );
}
