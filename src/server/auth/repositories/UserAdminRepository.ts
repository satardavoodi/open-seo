import { and, asc, eq, inArray } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/db";
import { account, member, session, user as authUser } from "@/db/schema";
import {
  SHARED_WORKSPACE_ORGANIZATION_ID,
  ensureSharedWorkspaceOrganization,
} from "@/server/auth/delegated-organization";
import {
  type SelfHostedManagedRole,
  toMemberRole,
} from "@/server/auth/self-hosted-workspace";

export type ManagedUserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  disabled: boolean;
  createdAt: Date;
};

const CREDENTIAL_PROVIDER_ID = "credential";

async function listManagedUsers(): Promise<ManagedUserRow[]> {
  const rows = await db
    .select({
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      disabled: authUser.disabled,
      createdAt: authUser.createdAt,
      role: member.role,
    })
    .from(authUser)
    .innerJoin(
      member,
      and(
        eq(member.userId, authUser.id),
        eq(member.organizationId, SHARED_WORKSPACE_ORGANIZATION_ID),
      ),
    )
    .orderBy(asc(authUser.createdAt));

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    disabled: row.disabled === true,
    createdAt: row.createdAt,
  }));
}

async function findManagedUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const rows = await db
    .select({ id: authUser.id })
    .from(authUser)
    .where(eq(authUser.email, normalized))
    .limit(1);

  return rows[0]?.id ?? null;
}

async function createManagedUser(input: {
  email: string;
  password: string;
  name?: string;
  role: SelfHostedManagedRole;
}) {
  const email = input.email.trim().toLowerCase();
  const existingId = await findManagedUserByEmail(email);
  if (existingId) {
    throw new Error("USER_EXISTS");
  }

  const userId = crypto.randomUUID();
  const accountId = crypto.randomUUID();
  const name = input.name?.trim() || email.split("@")[0] || "OpenSEO User";
  const hashedPassword = await hashPassword(input.password);

  await ensureSharedWorkspaceOrganization();

  await db.insert(authUser).values({
    id: userId,
    name,
    email,
    emailVerified: true,
    disabled: false,
  });

  await db.insert(account).values({
    id: accountId,
    accountId: email,
    providerId: CREDENTIAL_PROVIDER_ID,
    userId,
    password: hashedPassword,
  });

  await db.insert(member).values({
    id: crypto.randomUUID(),
    organizationId: SHARED_WORKSPACE_ORGANIZATION_ID,
    userId,
    role: toMemberRole(input.role),
    createdAt: new Date(),
  });

  return userId;
}

async function setManagedUserDisabled(userId: string, disabled: boolean) {
  await db
    .update(authUser)
    .set({ disabled })
    .where(eq(authUser.id, userId));

  if (disabled) {
    await db.delete(session).where(eq(session.userId, userId));
  }
}

async function resetManagedUserPassword(userId: string, password: string) {
  const hashedPassword = await hashPassword(password);
  const rows = await db
    .select({ email: authUser.email })
    .from(authUser)
    .where(eq(authUser.id, userId))
    .limit(1);
  const email = rows[0]?.email;
  if (!email) {
    throw new Error("USER_NOT_FOUND");
  }

  const credentialAccount = await db.query.account.findFirst({
    columns: { id: true },
    where: and(
      eq(account.userId, userId),
      eq(account.providerId, CREDENTIAL_PROVIDER_ID),
    ),
  });

  if (credentialAccount) {
    await db
      .update(account)
      .set({ password: hashedPassword })
      .where(eq(account.id, credentialAccount.id));
  } else {
    await db.insert(account).values({
      id: crypto.randomUUID(),
      accountId: email,
      providerId: CREDENTIAL_PROVIDER_ID,
      userId,
      password: hashedPassword,
    });
  }

  await db.delete(session).where(eq(session.userId, userId));
}

async function updateManagedUserRole(
  userId: string,
  role: SelfHostedManagedRole,
) {
  await db
    .update(member)
    .set({ role: toMemberRole(role) })
    .where(
      and(
        eq(member.userId, userId),
        eq(member.organizationId, SHARED_WORKSPACE_ORGANIZATION_ID),
      ),
    );
}

async function countOwnerAdmins(excludeUserId?: string) {
  const rows = await db
    .select({ userId: member.userId })
    .from(member)
    .where(
      and(
        eq(member.organizationId, SHARED_WORKSPACE_ORGANIZATION_ID),
        inArray(member.role, ["owner", "admin"]),
      ),
    );

  if (!excludeUserId) {
    return rows.length;
  }

  return rows.filter((row) => row.userId !== excludeUserId).length;
}

async function isUserDisabled(userId: string) {
  const row = await db.query.user.findFirst({
    columns: { disabled: true },
    where: eq(authUser.id, userId),
  });

  return row?.disabled === true;
}

export const UserAdminRepository = {
  listManagedUsers,
  findManagedUserByEmail,
  createManagedUser,
  setManagedUserDisabled,
  resetManagedUserPassword,
  updateManagedUserRole,
  countOwnerAdmins,
  isUserDisabled,
} as const;
