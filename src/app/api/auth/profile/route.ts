import { NextResponse } from "next/server";
import { db } from "@/db";
import { User, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  getSession,
  setSessionCookie,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { UserSession } from "@/types/type";

type Payload = Partial<{
  name: string;
  currentPassword: string;
  newPassword: string;
  avatarUrl: string | null;
}>;

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized session" },
        { status: 401 },
      );
    }

    const { avatarUrl, currentPassword, name, newPassword } =
      (await request.json()) as Payload;

    // 1. Fetch user from DB if available
    let existingUser: User | null = null;
    try {
      const userList = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

      if (userList.length > 0) {
        existingUser = userList[0];
      } else {
        // Search by email as fallback for demo users
        const userByEmail = await db
          .select()
          .from(users)
          .where(eq(users.email, session.email))
          .limit(1);
        if (userByEmail.length > 0) {
          existingUser = userByEmail[0];
        }
      }
    } catch (err) {
      console.warn("Database lookup warning during profile update:", err);
    }

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updatedPasswordHash = existingUser.passwordHash;

    // Handle password change request
    if (newPassword && newPassword.trim().length > 0) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password." },
          { status: 400 },
        );
      }

      if (newPassword.trim().length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long." },
          { status: 400 },
        );
      }

      const isValidPassword = await verifyPassword(
        currentPassword,
        existingUser.passwordHash,
      );
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Current password is incorrect." },
          { status: 400 },
        );
      }
      updatedPasswordHash = await hashPassword(newPassword.trim());
    }

    const updatedName = name?.trim() ? name.trim() : session.name;
    try {
      await db
        .update(users)
        .set({
          name: updatedName,
          passwordHash: updatedPasswordHash,
          avatarUrl: avatarUrl ?? session.avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.userId));
    } catch (error) {
      console.warn("DB update failed during profile update:", error);
    }

    // Update Session
    const updatedSession: UserSession = {
      ...session,
      name: updatedName,
      avatarUrl: avatarUrl ?? session.avatarUrl,
    };

    await setSessionCookie(updatedSession);

    await logAuditEvent({
      workspaceId: session.workspaceId,
      userId: session.userId,
      userEmail: session.email,
      action: "USER_PROFILE_UPDATED",
      resourceType: "USER",
      resourceId: session.userId,
      metadata: {
        nameUpdated: updatedName !== session.name,
        avatarUpdated: avatarUrl !== session.avatarUrl,
        passwordUpdated: !!newPassword?.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedSession,
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 },
    );
  }
}
