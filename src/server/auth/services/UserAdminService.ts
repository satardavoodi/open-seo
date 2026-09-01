import { AppError } from "@/server/lib/errors";
import { UserAdminRepository } from "@/server/auth/repositories/UserAdminRepository";
import {
  isSelfHostedWorkspaceAdmin,
  type SelfHostedManagedRole,
} from "@/server/auth/self-hosted-workspace";
import { isSelfHostedHostedAuthMode } from "@/lib/self-hosted-deployment";
import { env } from "cloudflare:workers";

async function requireSelfHostedUserAdmin(userId: string) {
  if (
    !isSelfHostedHostedAuthMode(env.AUTH_MODE, {
      CLOUDFLARE_INCLUDE_PROCESS_ENV: env.CLOUDFLARE_INCLUDE_PROCESS_ENV,
    })
  ) {
    throw new AppError("NOT_FOUND");
  }

  if (!(await isSelfHostedWorkspaceAdmin(userId))) {
    throw new AppError("FORBIDDEN", "Admin access required");
  }
}

async function listUsers(actorUserId: string) {
  await requireSelfHostedUserAdmin(actorUserId);
  return UserAdminRepository.listManagedUsers();
}

async function createUser(
  actorUserId: string,
  input: {
    email: string;
    password: string;
    name?: string;
    role: SelfHostedManagedRole;
  },
) {
  await requireSelfHostedUserAdmin(actorUserId);

  try {
    await UserAdminRepository.createManagedUser(input);
  } catch (error) {
    if (error instanceof Error && error.message === "USER_EXISTS") {
      throw new AppError("CONFLICT", "A user with this email already exists.");
    }
    throw error;
  }
}

async function setUserDisabled(
  actorUserId: string,
  targetUserId: string,
  disabled: boolean,
) {
  await requireSelfHostedUserAdmin(actorUserId);

  if (actorUserId === targetUserId && disabled) {
    throw new AppError("VALIDATION_ERROR", "You cannot disable your own account.");
  }

  if (disabled) {
    const admins = await UserAdminRepository.countOwnerAdmins(targetUserId);
    const target = await UserAdminRepository.listManagedUsers();
    const targetUser = target.find((user) => user.id === targetUserId);
    if (
      targetUser &&
      (targetUser.role === "owner" || targetUser.role === "admin") &&
      admins === 0
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        "At least one admin must remain enabled.",
      );
    }
  }

  await UserAdminRepository.setManagedUserDisabled(targetUserId, disabled);
}

async function resetUserPassword(
  actorUserId: string,
  targetUserId: string,
  password: string,
) {
  await requireSelfHostedUserAdmin(actorUserId);

  try {
    await UserAdminRepository.resetManagedUserPassword(targetUserId, password);
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      throw new AppError("NOT_FOUND");
    }
    throw error;
  }
}

async function getAdminAccess(userId: string) {
  if (
    !isSelfHostedHostedAuthMode(env.AUTH_MODE, {
      CLOUDFLARE_INCLUDE_PROCESS_ENV: env.CLOUDFLARE_INCLUDE_PROCESS_ENV,
    })
  ) {
    return { canManageUsers: false };
  }

  return {
    canManageUsers: await isSelfHostedWorkspaceAdmin(userId),
  };
}

export const UserAdminService = {
  listUsers,
  createUser,
  setUserDisabled,
  resetUserPassword,
  getAdminAccess,
} as const;
