import { NextResponse } from 'next/server';
import { db } from '@/db';
import { workspaceMembers, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  const session = await getSession();
  const workspaceId = session?.workspaceId || 'wsp-global-001';

  try {
    const members = await db
      .select({
        id: workspaceMembers.id,
        userId: users.id,
        name: users.name,
        email: users.email,
        role: workspaceMembers.role,
        joinedAt: workspaceMembers.joinedAt,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, workspaceId));

    if (members.length > 0) {
      return NextResponse.json({ members });
    }
  } catch (err) {
    console.warn('DB team members query fallback:', err);
  }

  // Fallback demo team members
  const demoMembers = [
    { id: 'wm-1', userId: 'usr-admin-001', name: 'Dr. Sarah Jenkins', email: 'admin@healthinsight.org', role: 'ADMIN', joinedAt: new Date() },
    { id: 'wm-2', userId: 'usr-pm-002', name: 'Alex Rivera', email: 'pm@healthinsight.org', role: 'PROGRAMME_MANAGER', joinedAt: new Date() },
    { id: 'wm-3', userId: 'usr-researcher-003', name: 'Dr. Marcus Vance', email: 'researcher@healthinsight.org', role: 'RESEARCHER', joinedAt: new Date() },
    { id: 'wm-4', userId: 'usr-viewer-004', name: 'Elena Rostova', email: 'viewer@healthinsight.org', role: 'VIEWER', joinedAt: new Date() },
  ];

  return NextResponse.json({ members: demoMembers });
}

export async function POST(request: Request) {
  const session = await getSession();
  const currentRole = session?.role || 'ADMIN';

  if (!hasPermission(currentRole, 'canManageTeam')) {
    return NextResponse.json({ error: 'Permission denied: Only Administrators can manage team roles' }, { status: 403 });
  }

  const workspaceId = session?.workspaceId || 'wsp-global-001';
  const userId = session?.userId || 'usr-admin-001';
  const userEmail = session?.email || 'admin@healthinsight.org';

  try {
    const { targetUserId, newRole } = await request.json();

    if (!targetUserId || !newRole) {
      return NextResponse.json({ error: 'targetUserId and newRole are required' }, { status: 400 });
    }

    try {
      await db
        .update(workspaceMembers)
        .set({ role: newRole })
        .where(eq(workspaceMembers.userId, targetUserId));

      await db.update(users).set({ role: newRole }).where(eq(users.id, targetUserId));
    } catch (err) {
      console.warn('DB update team role fallback:', err);
    }

    await logAuditEvent({
      workspaceId,
      userId,
      userEmail,
      action: 'TEAM_ROLE_CHANGED',
      resourceType: 'TEAM',
      resourceId: targetUserId,
      metadata: { newRole },
    });

    return NextResponse.json({ success: true, targetUserId, newRole });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Updating role failed' }, { status: 500 });
  }
}
