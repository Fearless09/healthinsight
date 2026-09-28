import { fetcher } from "@/utils/utils";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

const KEY = "SEED_DATA";

type MutateSeedOptions = Omit<
  UseMutationOptions<{ success: boolean; message: string }, Error>,
  "mutationKey" | "mutationFn"
>;

export const useMutateSeed = (options?: MutateSeedOptions) => {
  return useMutation({
    mutationKey: [KEY],
    mutationFn: () => {
      return fetcher<{ success: boolean; message: string }>("/api/seed", {
        method: "POST",
      });
    },
    onSuccess: () => {
      alert(
        "Synthetic health programme reports and datasets have been re-seeded!",
      );
      window.location.reload();
    },
    onError: () => {
      alert("Seeding failed.");
    },
    ...options,
  });
};
