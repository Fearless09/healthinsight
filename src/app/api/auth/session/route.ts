import { NextResponse } from 'next/server';
import { getSession, clearSessionCookie } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    // Return default Programme Manager session for smooth initial demo preview if not logged in
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }
  return NextResponse.json({ authenticated: true, user: session });
}

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
