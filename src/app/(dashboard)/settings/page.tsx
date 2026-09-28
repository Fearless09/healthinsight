"use client";

import React, { useState, useEffect, useRef, SubmitEvent } from "react";
import {
  Cpu,
  Database,
  ShieldCheck,
  Save,
  User,
  Camera,
  Trash2,
  KeyRound,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { InputGroup } from "@/components/ui/Input";
import { cn, getRole, getRoleBadgeColor } from "@/utils/utils";
import { useSession, useUpdateProfile } from "@/tanstack/(hooks)/auth";

export default function SettingsPage() {
  const { data: session, isLoading: sessionLoading } = useSession();
  const { mutateAsync: updateProfileAsync, isPending: updatingProfile } =
    useUpdateProfile();

  // Profile Form States
  const [profile, setProfile] = useState({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    avatarUrl: "" as string | null | undefined,
  });

  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatarFlag, setRemoveAvatarFlag] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Status feedback
  const [status, setStatus] = useState({
    error: null as string | null,
    success: null as string | null,
  });

  const [profileError, setProfileError] = useState<string | null>(null);

  // AI settings state
  const [aiState, setAiState] = useState({
    apiKey: "hf_••••••••••••••••••••••••••••••••",
    textModel: "mistralai/Mistral-7B-Instruct-v0.3",
    embeddingModel: "sentence-transformers/all-MiniLM-L6-v2",
    saved: false,
  });

  const handleChangeAiState = (data: Partial<typeof aiState>) => {
    setAiState((prev) => ({ ...prev, ...data }));
  };

  const handleSaveAiSettings = (e: SubmitEvent) => {
    e.preventDefault();
    handleChangeAiState({ saved: true });
    setTimeout(() => handleChangeAiState({ saved: false }), 4000);
  };

  const handleChangeProfile = (data: Partial<typeof profile>) => {
    setProfile((prev) => ({ ...prev, ...data }));
  };

  const handleChangeStatus = (data: Partial<typeof status>) => {
    setStatus((prev) => ({ ...prev, ...data }));
  };

  // Sync state when session loads
  useEffect(() => {
    if (!session) return;
    setProfile((prev) => ({ ...prev, name: session.name || "" }));

    if (!session.avatarUrl) return;
    setProfile((prev) => ({ ...prev, avatarUrl: session.avatarUrl }));
  }, [session]);

  const handleAvatarChange = (file?: File) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        handleChangeStatus({
          error: "Profile picture must be smaller than 5MB.",
        });
        return;
      }
      setAvatarFile(file);
      handleChangeStatus({ error: null });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      handleSaveProfile({ avatarUrl: null });
    }
  };

  const handleSaveProfile = async (details: Partial<typeof profile>) => {
    handleChangeStatus({ error: null, success: null });

    const { confirmPassword, currentPassword, newPassword } = details;
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        handleChangeStatus({
          error: "Please enter your current password to set a new password.",
        });
        return;
      }
      if (newPassword !== confirmPassword) {
        handleChangeStatus({
          error: "New password and confirm password do not match.",
        });
        return;
      }
      if (newPassword && newPassword.length < 6) {
        handleChangeStatus({
          error: "New password must be at least 6 characters long.",
        });
        return;
      }
    }

    try {
      const { message } = await updateProfileAsync(details);
      handleChangeStatus({
        success: message || "Profile updated successfully",
      });
      handleChangeProfile({
        confirmPassword: "",
        currentPassword: "",
        name: "",
      });

      setTimeout(() => handleChangeStatus({ success: null }), 4000);
    } catch (err: any) {
      handleChangeStatus({ error: err.message || "Failed to update profile." });
    }
  };

  return (
    <section aria-label="settings" className="max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Account & System Settings
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Manage your user profile, authentication credentials, Hugging Face AI
          parameters, and storage configurations.
        </p>
      </header>

      {/* User Profile Section */}
      <div className="space-y-6 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-6 shadow-xl">
        <h2 className="flex items-center gap-2 border-b border-slate-800 pb-3 text-sm font-bold text-white">
          <User className="size-4.5 shrink-0 text-teal-400" />
          User Profile & Security Settings
        </h2>

        {(!!status.error || !!status.success) && (
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-xl border p-3.5 text-xs",
              "[&>svg]:size-4 [&>svg]:shrink-0",
              {
                "border-rose-500/30 bg-rose-950/40 text-rose-300": status.error,
                "border-teal-500/30 bg-teal-950/40 text-teal-300":
                  status.success,
              },
            )}
          >
            {status.success ? (
              <>
                <CheckCircle2 className="text-teal-400" />
                <span>{status.success}</span>
              </>
            ) : (
              <>
                <AlertCircle className="text-rose-400" />
                <span>{status.error}</span>
              </>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveProfile(profile);
          }}
          className="space-y-6"
        >
          {/* Avatar Upload Sub-section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="group relative size-20 shrink-0">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile Avatar"
                  className="size-20 rounded-2xl border border-teal-500/40 object-cover shadow-md"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/80 text-slate-300">
                  <User className="size-9" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-200">
                Profile Photo
              </h3>
              <p className="text-[11px] text-slate-400">
                Upload a picture to personalize your account. Max 5MB (JPG, PNG,
                WEBP).
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    handleAvatarChange(file);
                  }}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  id="avatar-input"
                />
                <label
                  htmlFor="avatar-input"
                  className="transition-300 flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-700/80"
                >
                  <Camera className="size-3.5 text-teal-400" />
                  <span>Upload Picture</span>
                </label>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => handleAvatarChange()}
                    className="transition-300 flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-900/50 bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-900/40"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <main className="grid grid-cols-1 gap-5 border-t border-slate-800/80 pt-4 sm:grid-cols-2">
            {/* Full Name */}
            <InputGroup
              id="user-name"
              label="Full Name"
              type="text"
              value={profile.name}
              onChange={(e) => handleChangeProfile({ name: e.target.value })}
              placeholder="Enter your full name"
              icon
            />

            {/* Email Address (Fixed / Non-editable) */}
            <InputGroup
              label="Email Address"
              id="user-email"
              type="email"
              value={session?.email || ""}
              readOnly
              icon
            />
          </main>

          {/* User Role Banner */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs">
            <span className="font-medium text-slate-400">
              Assigned System Role:
            </span>
            <span
              className={cn(
                "rounded border px-2.5 py-1 text-[11px] font-semibold capitalize",
                getRoleBadgeColor(session?.role),
              )}
            >
              {getRole(session?.role)}
            </span>
          </div>

          {/* Password Change Sub-section */}
          <main className="space-y-4 border-t border-slate-800/80 pt-5">
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-300 uppercase">
              <KeyRound className="size-3.5 shrink-0 text-teal-400" />
              Change Password (Optional)
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <InputGroup
                id="current-password"
                label="Current Password"
                type="password"
                value={profile.currentPassword}
                onChange={(e) =>
                  handleChangeProfile({ currentPassword: e.target.value })
                }
                placeholder="••••••••"
                icon
              />
              <InputGroup
                id="new-password"
                label="New Password"
                type="password"
                value={profile.newPassword}
                onChange={(e) =>
                  handleChangeProfile({ newPassword: e.target.value })
                }
                placeholder="At least 6 chars"
                icon
              />
              <InputGroup
                id="confirm-password"
                label="Confirm New Password"
                type="password"
                value={profile.confirmPassword}
                onChange={(e) =>
                  handleChangeProfile({ confirmPassword: e.target.value })
                }
                placeholder="Re-enter new password"
                icon
              />
            </div>
          </main>

          {/* Submit Profile Button */}
          <div className="flex justify-end border-t border-slate-800 pt-4">
            <button
              type="submit"
              disabled={updatingProfile}
              className={cn(
                "transition-300 flex cursor-pointer items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-teal-600/20 hover:bg-teal-400 disabled:opacity-75",
                "[&>svg]:size-4 [&>svg]:shrink-0",
              )}
            >
              {updatingProfile ? (
                <>
                  <Loader2 className="animate-spin stroke-3" />
                  Updating Profile...
                </>
              ) : (
                <>
                  <Save />
                  Save Profile Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Hugging Face AI Configuration */}
      <form
        onSubmit={handleSaveAiSettings}
        className="space-y-5 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-6 shadow-xl"
      >
        <h2 className="flex items-center gap-2 border-b border-slate-800 pb-3 text-sm font-bold text-white">
          <Cpu className="size-4.5 shrink-0 text-teal-400" />
          Hugging Face Model Abstraction Service
        </h2>

        {aiState.saved && (
          <div className="flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-950/40 p-3 text-xs text-teal-300">
            <ShieldCheck className="size-4 shrink-0 text-teal-400" />
            <span>Hugging Face AI Provider settings updated successfully.</span>
          </div>
        )}

        <div>
          <InputGroup
            id="hf-api-token"
            label="Hugging Face API Token (HF_API_KEY)"
            type="password"
            value={aiState.apiKey}
            onChange={(e) => handleChangeAiState({ apiKey: e.target.value })}
            icon
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Never exposed to the browser. Server-side environment variable.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputGroup
            id="hf-text-model"
            label="HF Text Generation Model (HF_TEXT_MODEL)"
            value={aiState.textModel}
            onChange={(e) => handleChangeAiState({ textModel: e.target.value })}
          />

          <InputGroup
            id="hf-embedding-model"
            label="HF Embedding Model (HF_EMBEDDING_MODEL)"
            value={aiState.embeddingModel}
            onChange={(e) =>
              handleChangeAiState({ embeddingModel: e.target.value })
            }
          />
        </div>

        <div className="flex justify-end border-t border-slate-800 pt-3">
          <button
            type="submit"
            className="transition-300 flex cursor-pointer items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-teal-600/20 hover:bg-teal-500"
          >
            <Save className="size-3.5 shrink-0" />
            <span>Save Model Settings</span>
          </button>
        </div>
      </form>

      {/* Vector Database & Storage Status */}
      <main className="space-y-4 rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-6 shadow-xl">
        <h2 className="flex items-center gap-2 border-b border-slate-800 pb-3 text-sm font-bold text-white">
          <Database className="size-4.5 shrink-0 text-cyan-400" />
          Vector Storage & Database Configuration
        </h2>

        <ul className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
          {config.map(({ name, value, textColor }, index) => (
            <li
              key={index}
              className="space-y-1 rounded-xl border border-slate-800 bg-slate-900 p-3"
            >
              <h6 className="text-[11px] text-slate-400">{name}</h6>
              <p className={cn("font-bold text-white", textColor)}>{value}</p>
            </li>
          ))}
        </ul>
      </main>
    </section>
  );
}

const config = [
  {
    name: "Database Provider",
    value: "PostgreSQL + pgvector",
    textColor: "text-white",
  },
  { name: "ORM & Schema", value: "Drizzle ORM", textColor: "text-teal-400" },
  {
    name: "Object Storage",
    value: "Vercel Blob / Local Storage",
    textColor: "text-blue-400",
  },
];
