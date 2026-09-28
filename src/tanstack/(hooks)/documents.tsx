import { Document } from "@/db/schema";
import { Compare } from "@/types/type";
import { fetcher } from "@/utils/utils";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";

const KEY = "DOCUMENT";

type UseDocumentOptions = Omit<
  UseQueryOptions<Document[], Error>,
  "queryKey" | "queryFn"
>;

export const useDocuments = (options?: UseDocumentOptions) => {
  return useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const { documents } = await fetcher<{ documents: Document[] }>(
        "/api/documents",
      );
      return documents;
    },
    ...options,
  });
};

type UploadRes = { success: boolean; document: Document; chunksCount: number };
type MutateDocumentOptions = Omit<
  UseMutationOptions<UploadRes, Error, File>,
  "mutationKey" | "mutationFn"
>;

export const useUploadDocuments = (options?: MutateDocumentOptions) => {
  return useMutation({
    mutationKey: [KEY],
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      return fetcher<UploadRes>("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (_res, file) => {
      alert(
        `Document "${file.name}" uploaded, PII scrubbed, and pgvector indexed successfully!`,
      );
    },
    onError: (err) => {
      alert(err.message || "File processing failed");
    },
    ...options,
  });
};

type ComparePayload = { doc1Name: string; doc2Name: string };
type MutateCompareOptions = Omit<
  UseMutationOptions<Compare, Error, ComparePayload>,
  "mutationKey" | "mutationFn"
>;

export const useCompareDocuments = (options?: MutateCompareOptions) => {
  return useMutation({
    mutationKey: [KEY + "_COMPARE"],
    mutationFn: async ({ doc1Name, doc2Name }: ComparePayload) => {
      const { comparison } = await fetcher<{ comparison: Compare }>(
        "/api/ai/compare",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doc1Name, doc2Name }),
        },
      );
      return comparison;
    },
    onError: (err) => {
      alert(err.message || "Comparison failed");
    },
    ...options,
  });
};
