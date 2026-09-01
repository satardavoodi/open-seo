import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { member } from "@/db/schema";
import {
  ensureSharedWorkspaceOrganization,
  SHARED_WORKSPACE_ORGANIZATION_ID,
} from "@/server/auth/delegated-organization";

export const SELF_HOSTED_ADMIN_ROLES = ["owner", "admin"] as const;

export type SelfHostedManagedRole = "admin" | "member";

export function toMemberRole(role: SelfHostedManagedRole): string {
  return role === "admin" ? "admin" : "member";
}

export async function ensureSelfHostedWorkspaceMembership(
  userId: string,
  role = "member",
) {
  await ensureSharedWorkspaceOrganization();

  const existing = await db.query.member.findFirst({
    columns: { id: true },
    where: and(
      eq(member.userId, userId),
      eq(member.organizationId, SHARED_WORKSPACE_ORGANIZATION_ID),
    ),
  });

  if (!existing) {
    await db.insert(member).values({
      id: crypto.randomUUID(),
      organizationId: SHARED_WORKSPACE_ORGANIZATION_ID,
      userId,
      role,
      createdAt: new Date(),
    });
  }

  return SHARED_WORKSPACE_ORGANIZATION_ID;
}

export async function getSelfHostedMemberRole(userId: string) {
  const membership = await db.query.member.findFirst({
    columns: { role: true },
    where: and(
      eq(member.userId, userId),
      eq(member.organizationId, SHARED_WORKSPACE_ORGANIZATION_ID),
    ),
  });

  return membership?.role ?? null;
}

export async function isSelfHostedWorkspaceAdmin(userId: string) {
  const role = await getSelfHostedMemberRole(userId);
  return (
    role !== null &&
    (SELF_HOSTED_ADMIN_ROLES as readonly string[]).includes(role)
  );
}
