"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";

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
        .admin-login-card {
          background: #fdfaf5;
          border: 1px solid #e0d6c8;
          border-radius: 12px;
          padding: 40px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 32px rgba(42,35,26,0.08);
        }
        .btn-admin {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #b5604a;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 14px 28px;
          width: 100%;
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
          transition: background 0.25s, transform 0.25s;
          border: none;
          cursor: pointer;
        }
        .btn-admin:hover:not(:disabled) {
          background: #9a4e3b;
          transform: translateY(-2px);
        }
        .btn-admin:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .admin-input {
          height: 2.5rem;
          padding: 0 12px;
          font-size: 14px;
          border: 1px solid #e0d6c8;
          border-radius: 6px;
          background: white;
          color: #2a231a;
          width: 100%;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .admin-input:focus {
          outline: none;
          border-color: #b5604a;
          box-shadow: 0 0 0 3px rgba(181,96,74,0.15);
        }
        .admin-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          border: 1px solid #e8b4a4;
          padding: 5px 14px;
          border-radius: 100px;
          color: #b5604a;
          background: rgba(181,96,74,0.06);
          margin-bottom: 20px;
        }
        .admin-tag::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #b5604a;
          flex-shrink: 0;
        }
      `}</style>

      <div className="min-h-screen bg-[#f0e9db] relative flex items-center justify-center p-6">
        <div className="line-grid-admin" />
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(196,147,63,0.08) 0%, transparent 65%)",
          }}
        />

        <div className="relative flex flex-col items-center gap-8 w-full max-w-md">
          <Image
            src="/images/logo.png"
            alt="AWAKENING 2026"
            width={200}
            height={50}
            style={{ height: 44, width: "auto" }}
            priority
          />

          <div className="admin-login-card">
            <div className="admin-tag">Admin Access</div>
            <h1
              className="text-[28px] font-light text-[#2a231a] mb-2 leading-tight"
              style={{
                fontFamily:
                  "var(--font-playfair), 'Playfair Display', Georgia, serif",
              }}
            >
              Sign in
            </h1>
            <p className="text-[13px] text-[#8c7f6e] mb-8 leading-relaxed">
              Admin-only area. Not linked from the main site.
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {authError && (
                  <div className="text-[13px] text-[#b5604a] bg-[rgba(181,96,74,0.08)] border border-[#e8b4a4] rounded-md px-4 py-3">
                    {authError}
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px] font-semibold text-[#2a231a] uppercase tracking-[0.1em]">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@example.com"
                          autoComplete="email"
                          className="h-10 border-[#e0d6c8] bg-white focus-visible:ring-[#b5604a]/30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px] font-semibold text-[#2a231a] uppercase tracking-[0.1em]">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          className="h-10 border-[#e0d6c8] bg-white focus-visible:ring-[#b5604a]/30"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-admin"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
                  </button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
