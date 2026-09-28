import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";
import { UserRole } from "@/db/schema";

export const cn = (...classes: ClassValue[]) => {
  return twMerge(clsx(...classes));
};

export const getRoleBadgeColor = (
  role: UserRole = "PROGRAMME_MANAGER",
): string => {
  switch (role) {
    case "ADMIN":
      return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    case "PROGRAMME_MANAGER":
      return "bg-teal-500/10 text-teal-300 border-teal-500/30";
    case "RESEARCHER":
      return "bg-blue-500/10 text-blue-300 border-blue-500/30";
    case "VIEWER":
      return "bg-slate-800 text-slate-300 border-slate-700";
    default:
      return "";
  }
};

export const getRole = (role?: UserRole): string => {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "PROGRAMME_MANAGER":
      return "Programme Manager";
    case "RESEARCHER":
      return "Lead Researcher";
    case "VIEWER":
      return "Stakeholder Viewer";
    default:
      return "";
  }
};

export const fetcher = async <T>(url: string, init?: RequestInit) => {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      let errorMsg = `Failed to fetch ${url}`;
      try {
        const body = await res.json();
        if (body && body.error) {
          errorMsg = body.error;
        }
      } catch {
        // fallback to status text or default
      }
      throw new Error(errorMsg);
    }
    return (await res.json()) as T;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown Error";
    throw new Error(`${url}: ${msg}`);
  }
};
