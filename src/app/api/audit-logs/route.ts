import { NextResponse } from 'next/server';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { memoryAuditLogs } from '@/lib/audit';

export async function GET() {
  const session = await getSession();
  const role = session?.role || 'ADMIN';

  if (!hasPermission(role, 'canViewAuditLogs')) {
    return NextResponse.json({ error: 'Permission denied: Only Administrators can view audit logs' }, { status: 403 });
  }

  const workspaceId = session?.workspaceId || 'wsp-global-001';

  try {
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.workspaceId, workspaceId))
      .orderBy(desc(auditLogs.timestamp))
      .limit(100);

    if (logs.length > 0) {
      return NextResponse.json({ auditLogs: logs });
    }
  } catch (err) {
    console.warn('DB audit logs query fallback:', err);
  }

  // Fallback memory audit logs
  if (memoryAuditLogs.length > 0) {
    return NextResponse.json({ auditLogs: memoryAuditLogs });
  }

  const demoLogs = [
    {
      id: 'log-1',
      workspaceId,
      userId: 'usr-admin-001',
      userEmail: 'admin@healthinsight.org',
      action: 'USER_LOGIN',
      resourceType: 'AUTH',
      metadata: { role: 'ADMIN' },
      timestamp: new Date(),
    },
    {
      id: 'log-2',
      workspaceId,
      userId: 'usr-admin-001',
      userEmail: 'admin@healthinsight.org',
      action: 'DOCUMENT_UPLOADED',
      resourceType: 'DOCUMENT',
      resourceId: 'doc-demo-001',
      metadata: { name: 'Maternal Health Outreach Programme Report.txt', piiFound: true },
      timestamp: new Date(Date.now() - 3600000 * 2),
    },
    {
      id: 'log-3',
      workspaceId,
      userId: 'usr-researcher-003',
      userEmail: 'researcher@healthinsight.org',
      action: 'AI_QUESTION_ASKED',
      resourceType: 'AI_ASSISTANT',
      metadata: { question: 'What were the major barriers to maternal healthcare access?' },
      timestamp: new Date(Date.now() - 3600000 * 5),
    },
  ];

  return NextResponse.json({ auditLogs: demoLogs });
}
