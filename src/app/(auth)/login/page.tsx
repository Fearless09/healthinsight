"use client";

import React, { useState } from "react";
import { HeartPulse, ShieldCheck, LoaderCircle } from "lucide-react";
import { cn, getRoleBadgeColor } from "@/utils/utils";
import { InputGroup } from "@/components/ui/Input";
import { demoUsers } from "@/data/user";
import { useLogin } from "@/tanstack/(hooks)/auth";

export default function LoginPage() {
  const { mutateAsync: loginAsync, isPending: loading } = useLogin();

  const [details, setDetails] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginAsync(details);
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <section
      aria-label="Authentication page"
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#070a12] p-4 text-slate-100"
    >
      {/* Glow Effects */}
      <span className="pointer-events-none absolute top-1/4 left-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-3xl" />
      <span className="pointer-events-none absolute right-10 bottom-10 size-72 rounded-full bg-cyan-500/10 blur-3xl" />

      <section className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <header className="mb-8 text-center">
          <span className="mx-auto mb-4 flex size-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-teal-500 to-cyan-400 font-bold text-slate-950 shadow-xl shadow-teal-500/20">
            <HeartPulse className="size-8 text-slate-950" />
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white">
            HEALTHINSIGHT
          </h1>
          <p className="mt-1 text-xs font-medium text-teal-400">
            "Turn health programme data into actionable insight."
          </p>
        </header>

        {/* Login Card */}
        <section className="rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="mb-1 text-lg font-bold text-slate-100">
            Welcome Back
          </h2>
          <p className="mb-6 text-xs text-slate-400">
            Access your workspace documents, RAG assistant, and dataset
            analytics.
          </p>

          {!!error && (
            <code className="mb-4 block rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-xs text-red-300">
              {error}
            </code>
          )}

          <form
            aria-label="auth_form"
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <InputGroup
              id="email"
              label="Email Address"
              type="email"
              value={details.email}
              onChange={(e) =>
                setDetails((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="admin@healthinsight.org"
              disabled={loading}
              required
              icon
            />
            <InputGroup
              id="password"
              label="Password"
              type="password"
              value={details.password}
              onChange={(e) =>
                setDetails((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="••••••••"
              disabled={loading}
              required
              icon
            />

            <button
              type="submit"
              disabled={loading}
              className="transition-300 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-600/20 hover:bg-teal-500 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In to Workspace"
              )}
            </button>
          </form>

          {/* One-Click Demo Role Accounts */}
          <main className="mt-6 border-t border-slate-800 pt-5">
            <h6 className="mb-2 text-center text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Instant Demo Accounts (Click to Select)
            </h6>

            <div className="grid grid-cols-2 gap-2">
              {demoUsers.map((user, index) => (
                <button
                  key={index}
                  disabled={loading}
                  type="button"
                  onClick={() => {
                    setDetails({ email: user.email, password: user.password });
                  }}
                  className={cn(
                    "transition-300 cursor-pointer rounded-lg border border-slate-800 bg-slate-900 p-2 text-left text-xs disabled:pointer-events-none",
                    getRoleBadgeColor(user.role),
                  )}
                >
                  <div className={cn("font-semibold")}>
                    {user.role
                      .split("_")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase(),
                      )
                      .join(" ")}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {user.description}
                  </div>
                </button>
              ))}
            </div>
          </main>
        </section>

        {/* Disclaimer Note */}
        <footer className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-1.5 text-center text-[11px] text-slate-500">
          <ShieldCheck className="size-3.5 shrink-0 text-teal-400" />
          <span>
            HealthInsight is a research tool. It does not provide medical
            advice.
          </span>
        </footer>
      </section>
    </section>
  );
}
