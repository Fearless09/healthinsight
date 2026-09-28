import { Dataset } from "@/db/schema";
import { fetcher } from "@/utils/utils";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";

const KEY = "DATASETS";

type UseDatasetOptions = Omit<
  UseQueryOptions<Dataset[], Error>,
  "queryKey" | "queryFn"
>;

export const useDatasets = (options?: UseDatasetOptions) => {
  return useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const { datasets } = await fetcher<{ datasets: Dataset[] }>(
        "/api/datasets",
      );
      return datasets;
    },
    ...options,
  });
};

type Res = { success: boolean; dataset: Dataset };
type MutateUploadDatasetsOptions = Omit<
  UseMutationOptions<Res, Error, File>,
  "mutationKey" | "mutationFn"
>;

export const useUploadDatasets = (options?: MutateUploadDatasetsOptions) => {
  return useMutation({
    mutationKey: [KEY],
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      return await fetcher<Res>("/api/datasets/upload", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (_res, file) => {
      alert(
        `Dataset "${file.name}" uploaded & analyzed with deterministic TS metrics!`,
      );
    },
    onError: (error) => {
      alert(error.message || "Dataset processing failed");
    },
    ...options,
  });
};
