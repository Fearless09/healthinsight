import { UserRole } from "@/db/schema";
import { Member } from "@/types/type";
import { fetcher } from "@/utils/utils";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { queryClient } from "..";

const KEY = "TEAM";

type UseTeamOptions = Omit<
  UseQueryOptions<Member[], Error>,
  "queryKey" | "queryFn"
>;

export const useTeam = (options?: UseTeamOptions) => {
  return useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const { members } = await fetcher<{ members: Member[] }>(`/api/team`);
      return members;
    },
    ...options,
  });
};

type ChangeMemberRoleRes = {
  success: boolean;
  targetUserId: string;
  newRole: UserRole;
};
type ChangeMemberRolePayload = { userId: string; newRole: UserRole };
type MutateChangeMemberRoleOptions = Omit<
  UseMutationOptions<ChangeMemberRoleRes, Error, ChangeMemberRolePayload>,
  "mutationKey" | "mutationFn"
>;

export const useChangeMemberRole = (
  options?: MutateChangeMemberRoleOptions,
) => {
  return useMutation({
    mutationKey: [KEY],
    mutationFn: async ({ newRole, userId }: ChangeMemberRolePayload) => {
      return await fetcher<ChangeMemberRoleRes>("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, newRole }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      alert(`Role updated to ${data.newRole}`);
    },
    onError: (error) => {
      alert(error.message || "Updating role failed");
    },
    ...options,
  });
};
