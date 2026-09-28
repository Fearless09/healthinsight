"use client";

import { Building2, User, RefreshCw, LogOut } from "lucide-react";
import { cn, getRole, getRoleBadgeColor } from "@/utils/utils";
import { useMutateSeed } from "@/tanstack/(hooks)/seed";
import { useLogout, useSession } from "@/tanstack/(hooks)/auth";
import { UserSession } from "@/types/type";

interface HeaderProps {
  userSession?: UserSession | null;
}

export function Header({ userSession }: HeaderProps) {
  const { data: currentSession } = useSession({ enabled: !userSession });
  const { isPending: loadingSeed, mutateAsync: mutateSeedAsync } =
    useMutateSeed();
  const { mutateAsync: mutateLogoutAsync } = useLogout();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800/80 bg-[#0c101c]/90 px-6 py-2 backdrop-blur-md">
      {/* Workspace Switcher */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 shadow-inner">
        <Building2 className="size-3.5 shrink-0 text-teal-400" />
        <span>{currentSession?.workspaceName}</span>
      </div>

      {/* User Actions & Role Indicator */}
      <main className="flex items-center gap-3">
        {/* Seed Data Action Button */}
        <button
          onClick={() => mutateSeedAsync()}
          disabled={loadingSeed}
          className="transition-300 flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          title="Reset demo synthetic health reports and datasets"
        >
          <RefreshCw
            className={cn(`size-3.5 shrink-0 text-teal-400`, {
              "animate-spin": loadingSeed,
            })}
          />
          <span>{loadingSeed ? "Seeding..." : "Seed Demo Data"}</span>
        </button>

        {/* User Info Card */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
          {currentSession?.avatarUrl ? (
            <img
              src={currentSession.avatarUrl}
              alt={currentSession.name || "User Avatar"}
              className="size-8 shrink-0 rounded-full border border-teal-500/50 object-cover shadow-sm"
            />
          ) : (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300">
              <User className="size-4" />
            </span>
          )}

          <div className="hidden text-left sm:block">
            <h6 className="text-xs font-semibold text-slate-200">
              {currentSession?.name}
            </h6>
            <p className="text-[10px] text-slate-400">
              {currentSession?.email}
            </p>
          </div>

          {/* Role Badge */}
          <span
            className={cn(
              `rounded border px-2 py-0.5 text-[10px] font-semibold capitalize`,
              getRoleBadgeColor(currentSession?.role),
            )}
          >
            {getRole(currentSession?.role)}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => mutateLogoutAsync()}
          className="transition-300 ml-1 cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-800/50 hover:text-red-400"
          title="Log out"
        >
          <LogOut className="size-4 shrink-0" />
        </button>
      </main>
    </header>
  );
}
