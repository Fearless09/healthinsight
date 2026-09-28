"use client";

import { Users, Shield, Loader } from "lucide-react";
import { cn, getRole, getRoleBadgeColor } from "@/utils/utils";
import { UserRole, userRoles } from "@/db/schema";
import { useChangeMemberRole, useTeam } from "@/tanstack/(hooks)/team";
import { useMemo, useState } from "react";
import { SelectGroup } from "@/components/ui/Select";
import { Member } from "@/types/type";
import { InputGroup } from "@/components/ui/Input";
import Image from "next/image";

export default function TeamPage() {
  const [search, setSearch] = useState("");
  const { data: membersData, isLoading: loading } = useTeam();

  const members = useMemo(() => {
    const data = membersData || [];

    if (search.trim() === "") return data;
    return data.filter((m) => {
      const s = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(s) ||
        m.email.toLowerCase().includes(s) ||
        m.role.toLowerCase().includes(s)
      );
    });
  }, [membersData, search]);

  return (
    <section aria-label="team" className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Team Management & Role-Based Access Control (RBAC)
        </h1>
        <p className="mt-0.5 text-xs text-slate-400">
          Manage workspace members, assign RBAC roles (ADMIN, PROGRAMME_MANAGER,
          RESEARCHER, VIEWER), and enforce data access isolation.
        </p>
      </header>

      {/* Permissions Matrix Reference */}
      <main
        aria-label="role permissions matrix"
        className="space-y-3 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-4"
      >
        <h2 className="flex items-center gap-2 text-xs font-bold tracking-wider text-white uppercase">
          <Shield className="size-4 shrink-0 fill-teal-400 text-teal-400" />
          Workspace Role Permissions Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-[10px] text-slate-400 uppercase">
              <tr>
                <Th name="Role" />
                <Th name="Upload Docs / Datasets" />
                <Th name="Query AI RAG Assistant" />
                <Th name="Generate Reports" />
                <Th name="Delete Docs" />
                <Th name="Manage Team & Logs" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 border-t border-slate-800/80">
              <tr>
                <TDRole role="ADMIN" />
                <TdPermission permission="Allowed" />
                <TdPermission permission="Allowed" />
                <TdPermission permission="Allowed" />
                <TdPermission permission="Allowed" />
                <TdPermission permission="Allowed" />
              </tr>
              <tr>
                <TDRole role="PROGRAMME_MANAGER" />
                <TdPermission permission="Allowed" />
                <TdPermission permission="Allowed" />
                <TdPermission permission="Allowed" />
                <TdPermission permission="Allowed" />
                <TdPermission permission="Restricted" />
              </tr>
              <tr>
                <TDRole role="RESEARCHER" />
                <TdPermission permission="Allowed" />
                <TdPermission permission="Allowed" />
                <TdPermission permission="Allowed" />
                <TdPermission permission="Restricted" />
                <TdPermission permission="Restricted" />
              </tr>
              <tr>
                <TDRole role="VIEWER" />
                <TdPermission permission="Read Only" />
                <TdPermission permission="Allowed" />
                <TdPermission permission="Restricted" />
                <TdPermission permission="Restricted" />
                <TdPermission permission="Restricted" />
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      {/* Team Member List */}
      <section
        aria-label="team member list"
        className="space-y-4 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            <Users className="size-4 shrink-0 text-teal-400" />
            Active Workspace Members ({members.length})
          </h2>

          <div className="w-full max-w-xs">
            <InputGroup
              id="member_search"
              type="search"
              icon
              size="sm"
              placeholder="Search for members by name, email or role"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading && members.length === 0 && (
          <div className="flex items-center gap-2">
            <Loader className="size-4 shrink-0 animate-spin stroke-3 text-teal-400" />
            <span className="text-sm font-bold text-white">
              Loading members...
            </span>
          </div>
        )}
        <main className="space-y-3">
          {members.map((m) => (
            <TeamMember key={m.id} m={m} />
          ))}
        </main>
      </section>
    </section>
  );
}

const TeamMember = ({ m }: { m: Member }) => {
  const { mutateAsync: changeRoleAsync, isPending: changingRole } =
    useChangeMemberRole();

  const handleRoleChange = async (userId: string, newRole: string) => {
    changeRoleAsync({ userId, newRole: newRole as UserRole });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="flex items-center gap-3">
        <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-800 text-sm font-bold text-teal-300">
          {m.avatarUrl ? (
            <Image
              alt={m.name}
              src={m.avatarUrl}
              fill
              sizes="100%"
              className="object-cover object-center"
            />
          ) : (
            m.name.charAt(0)
          )}
        </span>
        <div>
          <h6 className="text-sm font-bold text-slate-100">{m.name}</h6>
          <p className="text-xs text-slate-400">{m.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${getRoleBadgeColor(m.role)}`}
        >
          {getRole(m.role)}
        </span>

        {/* Role Switcher */}
        <div>
          {changingRole ? (
            <Loader className="size-4 shrink-0 animate-spin stroke-3 text-teal-400" />
          ) : (
            <SelectGroup
              id="user-role"
              variant="secondary"
              value={m.role}
              onChange={(e) => handleRoleChange(m.userId, e.target.value)}
              options={userRoles.map((r) => ({
                value: r,
                name: r.replaceAll("_", " "),
              }))}
              size="sm"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const Th = ({ name }: { name: string }) => {
  return (
    <th className="p-2.5 text-center first:rounded-l-lg first:text-left last:rounded-r-lg">
      {name}
    </th>
  );
};

const TDRole = ({ role }: { role: UserRole }) => {
  const colors = useMemo(() => {
    const colors = getRoleBadgeColor(role).split(" ");
    const text = colors.find((c) => c.startsWith("text-")) || "";
    return { text };
  }, [role, getRoleBadgeColor]);

  return (
    <td className={cn("p-2.5 font-bold", colors.text)}>
      {role.replaceAll("_", " ")}
    </td>
  );
};

const TdPermission = ({
  permission,
}: {
  permission: "Allowed" | "Restricted" | "Read Only";
}) => {
  return (
    <td
      className={cn("p-2.5 text-center text-slate-500", {
        "text-teal-400": permission === "Allowed",
      })}
    >
      {permission === "Allowed" ? "✓" : "✕"}
      {` ${permission}`}
    </td>
  );
};
