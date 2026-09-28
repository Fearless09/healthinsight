import { Audit } from "@/db/schema";
import { fetcher } from "@/utils/utils";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

const KEY = "AUDIT";

type UseAuditOptions = Omit<
  UseQueryOptions<Audit[], Error>,
  "queryKey" | "queryFn"
>;

export const useAudit = (options?: UseAuditOptions) => {
  return useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const { auditLogs } = await fetcher<{ auditLogs: Audit[] }>(
        "/api/audit-logs",
      );
      return auditLogs;
    },
    ...options,
  });
};
