import { fetcher } from "@/utils/utils";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

const KEY = "UPLOAD";

type UploadPayload = { bucket: string; title: string; file: File };
type MutateUploadOptions = Omit<
  UseMutationOptions<string, Error, UploadPayload>,
  "mutationKey" | "mutationFn"
>;

export const useUploadStorage = (options?: MutateUploadOptions) => {
  return useMutation({
    mutationKey: [KEY],
    mutationFn: async ({ bucket, file, title }: UploadPayload) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title);
      fd.append("bucket", bucket);

      const { url } = await fetcher<{ url: string }>("/api/storage", {
        method: "POST",
        body: fd,
      });
      return url;
    },
    ...options,
  });
};

type MutateDeleteOptions = Omit<
  UseMutationOptions<{ success: boolean }, Error, { url: string }>,
  "mutationKey" | "mutationFn"
>;

export const useDeleteStorage = (options?: MutateDeleteOptions) => {
  return useMutation({
    mutationKey: [KEY],
    mutationFn: async ({ url }: { url: string }) => {
      return await fetcher<{ success: boolean }>("/api/storage", {
        method: "DELETE",
        body: JSON.stringify({ url }),
      });
    },
    ...options,
  });
};
