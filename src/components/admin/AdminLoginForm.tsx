"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: LoginFormValues) {
    setAuthError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (result?.error) {
      setAuthError("Invalid email or password.");
      return;
    }
    if (result?.ok) {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <>
      <style>{`
        .line-grid-admin {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(#e0d6c8 1px, transparent 1px),
            linear-gradient(90deg, #e0d6c8 1px, transparent 1px);
          background-size: 64px 64px;
          opacity: 0.38;
        }
      `}</style>

      <div className="min-h-screen bg-[#f0e9db] relative flex items-center justify-center p-6">
        <div className="line-grid-admin" />
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(196,147,63,0.08) 0%, transparent 65%)",
          }}
        />

        <div className="relative flex flex-col items-center gap-8 w-full max-w-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#b5604a] flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <span
              className="text-[22px] font-light text-[#2a231a]"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}
            >
              Poker Studio
            </span>
          </div>

          <div className="bg-[#fdfaf5] border border-[#e0d6c8] rounded-xl p-10 w-full shadow-[0_4px_32px_rgba(42,35,26,0.08)]">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.22em] uppercase border border-[#e8b4a4] px-3.5 py-1.5 rounded-full text-[#b5604a] bg-[rgba(181,96,74,0.06)] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b5604a]" />
              Admin Access
            </div>

            <h1
              className="text-[28px] font-light text-[#2a231a] mb-2 leading-tight"
              style={{ fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif" }}
            >
              Sign in
            </h1>
            <p className="text-[13px] text-[#8c7f6e] mb-8 leading-relaxed">
              Admin-only area. Not linked from the main site.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {authError && (
                <div className="text-[13px] text-[#b5604a] bg-[rgba(181,96,74,0.08)] border border-[#e8b4a4] rounded-md px-4 py-3">
                  {authError}
                </div>
              )}

              <div>
                <label className="block text-[12px] font-semibold text-[#2a231a] uppercase tracking-[0.1em] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className="w-full h-10 px-3 text-sm border border-[#e0d6c8] rounded-md bg-white text-[#2a231a] transition-all focus:outline-none focus:border-[#b5604a] focus:ring-2 focus:ring-[rgba(181,96,74,0.15)]"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-[12px] text-[#b5604a] mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#2a231a] uppercase tracking-[0.1em] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  className="w-full h-10 px-3 text-sm border border-[#e0d6c8] rounded-md bg-white text-[#2a231a] transition-all focus:outline-none focus:border-[#b5604a] focus:ring-2 focus:ring-[rgba(181,96,74,0.15)]"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-[12px] text-[#b5604a] mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#b5604a] text-white text-[12px] font-bold tracking-[0.16em] uppercase py-3.5 px-7 border-none cursor-pointer transition-all duration-200 hover:bg-[#9a4e3b] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  }}
                >
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
