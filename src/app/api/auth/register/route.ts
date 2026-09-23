import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, workspaces, workspaceMembers } from '@/db/schema';
import { hashPassword, setSessionCookie } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { email, password, name, role = 'RESEARCHER' } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: role as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await db.insert(users).values(newUser);
    } catch (err) {
      console.warn('DB insert fallback during register:', err);
    }

    const sessionPayload = {
      userId,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      workspaceId: 'wsp-global-001',
      workspaceName: 'Global Health Outreach Workspace',
      workspaceSlug: 'global-health-outreach',
    };

    await setSessionCookie(sessionPayload);

    await logAuditEvent({
      workspaceId: sessionPayload.workspaceId,
      userId,
      userEmail: sessionPayload.email,
      action: 'USER_REGISTERED',
      resourceType: 'USER',
      resourceId: userId,
    });

    return NextResponse.json({ success: true, user: sessionPayload });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
