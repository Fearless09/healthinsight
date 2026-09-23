import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, workspaceMembers, workspaces } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, setSessionCookie } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Default Seed Users Fallback for Demo
    const demoAccounts: Record<string, { name: string; role: 'ADMIN' | 'PROGRAMME_MANAGER' | 'RESEARCHER' | 'VIEWER' }> = {
      'admin@healthinsight.org': { name: 'Dr. Sarah Jenkins (Admin)', role: 'ADMIN' },
      'pm@healthinsight.org': { name: 'Alex Rivera (Programme Manager)', role: 'PROGRAMME_MANAGER' },
      'researcher@healthinsight.org': { name: 'Dr. Marcus Vance (Researcher)', role: 'RESEARCHER' },
      'viewer@healthinsight.org': { name: 'Elena Rostova (Viewer)', role: 'VIEWER' },
    };

    let targetUser = null;

    try {
      const foundUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (foundUsers.length > 0) {
        targetUser = foundUsers[0];
      }
    } catch (err) {
      console.warn('DB query fallback during login:', err);
    }

    // Check password if user found in DB
    if (targetUser) {
      const valid = await verifyPassword(password, targetUser.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    } else if (demoAccounts[email.toLowerCase()]) {
      // Demo Account instant login support
      const demo = demoAccounts[email.toLowerCase()];
      targetUser = {
        id: `usr-${demo.role.toLowerCase()}-demo`,
        email: email.toLowerCase(),
        name: demo.name,
        role: demo.role,
        passwordHash: '',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      return NextResponse.json({ error: 'User not found. Please register or use a demo account.' }, { status: 401 });
    }

    const sessionPayload = {
      userId: targetUser.id,
      email: targetUser.email,
      name: targetUser.name,
      role: targetUser.role as any,
      workspaceId: 'wsp-global-001',
      workspaceName: 'Global Health Outreach Workspace',
      workspaceSlug: 'global-health-outreach',
    };

    await setSessionCookie(sessionPayload);

    await logAuditEvent({
      workspaceId: sessionPayload.workspaceId,
      userId: sessionPayload.userId,
      userEmail: sessionPayload.email,
      action: 'USER_LOGIN',
      resourceType: 'AUTH',
      metadata: { role: sessionPayload.role },
    });

    return NextResponse.json({ success: true, user: sessionPayload });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: err.message || 'Authentication failed' }, { status: 500 });
  }
}
