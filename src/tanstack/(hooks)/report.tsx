import { Report } from "@/db/schema";
import { fetcher } from "@/utils/utils";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { queryClient } from "..";

const KEY = "REPORT";

type UseReportOptions = Omit<
  UseQueryOptions<Report[], Error>,
  "queryKey" | "queryFn"
>;

export const useReport = (options?: UseReportOptions) => {
  return useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const { reports } = await fetcher<{ reports: Report[] }>("/api/reports");
      return reports;
    },
    ...options,
  });
};

type MutateUploadReportOptions = Omit<
  UseMutationOptions<Report, Error, string>,
  "mutationKey" | "mutationFn"
>;

export const useGenerateReport = (options?: MutateUploadReportOptions) => {
  return useMutation({
    mutationKey: [KEY],
    mutationFn: async (title: string) => {
      const { report } = await fetcher<{ report: Report; success: boolean }>(
        "/api/reports/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description: "Custom Programme Evaluation Report",
          }),
        },
      );
      return report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      alert("Programme Report generated successfully!");
    },
    onError: (error) => {
      alert(error.message || "Report generation failed");
    },
    ...options,
  });
};

type MutateDeleteReportOptions = Omit<
  UseMutationOptions<{ success: boolean }, Error, string>,
  "mutationKey" | "mutationFn"
>;

export const useDeleteReport = (options?: MutateDeleteReportOptions) => {
  return useMutation({
    mutationKey: [KEY],
    mutationFn: async (id: string) => {
      return fetcher<{ success: boolean }>("/api/reports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      alert("Programme Report deleted successfully!");
    },
    onError: (error) => {
      alert(error.message || "Report deletion failed");
    },
    ...options,
  });
};
