import { db } from "@/db";
import { Audit, auditLogs } from "@/db/schema";
import { AuditEvent } from "@/types/type";

export const memoryAuditLogs: Array<Audit> = [];

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  const entry = {
    id: crypto.randomUUID(),
    workspaceId: event.workspaceId,
    userId: event.userId,
    userEmail: event.userEmail,
    action: event.action,
    resourceType: event.resourceType,
    resourceId: event.resourceId ?? null,
    metadata: event.metadata || {},
    timestamp: new Date(),
  };

  memoryAuditLogs.unshift(entry);
  if (memoryAuditLogs.length > 500) memoryAuditLogs.pop();

  try {
    await db.insert(auditLogs).values(entry);
  } catch (err) {
    console.warn("Audit log saved to memory fallback:", entry.action);
  }
}
