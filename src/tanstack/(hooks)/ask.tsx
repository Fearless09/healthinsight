import { fetcher } from "@/utils/utils";
import { UseMutationOptions, useMutation } from "@tanstack/react-query";

const KEY = "ASK";
type Res = {
  answer: string;
  citations: {
    documentId: string;
    documentName: string;
    pageNumber: number;
    snippet: string;
  }[];
  groundingScore: number;
  isContextInsufficient: boolean;
  disclaimer: string;
};

type MutateAskOptions = Omit<
  UseMutationOptions<Res, Error, string>,
  "queryKey" | "mutationFn"
>;
export const useAsk = (options?: MutateAskOptions) => {
  return useMutation({
    mutationKey: [KEY],
    mutationFn: (q: string) => {
      return fetcher<Res>("/api/ai/ask", {
        method: "POST",
        body: JSON.stringify({ question: q.trim() }),
      });
    },
    ...options,
  });
};
