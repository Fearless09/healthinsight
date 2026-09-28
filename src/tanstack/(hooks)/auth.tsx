import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetcher } from "@/utils/utils";
import { queryClient } from "..";
import { UserSession } from "@/types/type";

const SESSION_KEY = "SESSION";

type LoginPayload = { email: string; password: string };
type LoginRes = { success: boolean; user: UserSession };
type UseLoginOptions = Omit<
  UseMutationOptions<LoginRes, Error, LoginPayload>,
  "mutationKey" | "mutationFn"
>;

export const useLogin = (options?: UseLoginOptions) => {
  const router = useRouter();

  return useMutation({
    mutationKey: [SESSION_KEY],
    mutationFn: (details: LoginPayload) => {
      return fetcher<LoginRes>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SESSION_KEY] });
      router.push("/dashboard");
    },
    ...options,
  });
};

type MutateLogoutOptions = Omit<
  UseMutationOptions<{ success: boolean }, Error>,
  "mutationKey" | "mutationFn"
>;

export const useLogout = (options?: MutateLogoutOptions) => {
  const router = useRouter();

  return useMutation({
    mutationKey: [SESSION_KEY],
    mutationFn: () => {
      return fetcher<{ success: boolean }>("/api/auth/session", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SESSION_KEY] });
      router.push("/login");
    },
    ...options,
  });
};

type UpdateProfileRes = {
  success: boolean;
  user: UserSession;
  message: string;
};
type UpdatePayload = Partial<{
  name: string;
  currentPassword: string;
  newPassword: string;
  avatarUrl: string | null;
}>;

type UseUpdateProfileOptions = Omit<
  UseMutationOptions<UpdateProfileRes, Error, UpdatePayload>,
  "mutationKey" | "mutationFn"
>;

export const useUpdateProfile = (options?: UseUpdateProfileOptions) => {
  return useMutation({
    mutationKey: [SESSION_KEY],
    mutationFn: (payload: UpdatePayload) => {
      return fetcher<UpdateProfileRes>("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SESSION_KEY] });
    },
    ...options,
  });
};

const demoData: UserSession = {
  name: "Alex Rivera",
  email: "pm@healthinsight.org",
  role: "PROGRAMME_MANAGER",
  workspaceName: "Global Health Outreach Workspace",
  avatarUrl: "",
  userId: "",
  workspaceId: "",
  workspaceSlug: "",
};

type UseSessionOptions = Omit<
  UseQueryOptions<UserSession, Error>,
  "queryKey" | "queryFn"
>;
export const useSession = (props: UseSessionOptions = {}) => {
  return useQuery({
    queryKey: [SESSION_KEY],
    queryFn: async () => {
      const { user } = await fetcher<{
        authenticated: boolean;
        user: UserSession | null;
      }>("/api/auth/session");

      return user ?? demoData;
    },
    ...props,
  });
};
