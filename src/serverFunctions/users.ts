import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  HOSTED_PASSWORD_MAX_LENGTH,
  HOSTED_PASSWORD_MIN_LENGTH,
} from "@/lib/auth-options";
import { UserAdminService } from "@/server/auth/services/UserAdminService";
import { requireAuthenticatedContext } from "@/serverFunctions/middleware";

const managedRoleSchema = z.enum(["admin", "member"]);

const createUserSchema = z.object({
  email: z.string().trim().email(),
  password: z
    .string()
    .min(HOSTED_PASSWORD_MIN_LENGTH)
    .max(HOSTED_PASSWORD_MAX_LENGTH),
  name: z.string().trim().optional(),
  role: managedRoleSchema,
});

const userIdSchema = z.object({
  userId: z.string().min(1),
});

const resetPasswordSchema = userIdSchema.extend({
  password: z
    .string()
    .min(HOSTED_PASSWORD_MIN_LENGTH)
    .max(HOSTED_PASSWORD_MAX_LENGTH),
});

const setDisabledSchema = userIdSchema.extend({
  disabled: z.boolean(),
});

export const getUserAdminAccess = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) =>
    UserAdminService.getAdminAccess(context.userId),
  );

export const listManagedUsers = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .handler(async ({ context }) =>
    UserAdminService.listUsers(context.userId),
  );

export const createManagedUser = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(createUserSchema)
  .handler(async ({ data, context }) => {
    await UserAdminService.createUser(context.userId, data);
  });

export const setManagedUserDisabled = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(setDisabledSchema)
  .handler(async ({ data, context }) => {
    await UserAdminService.setUserDisabled(
      context.userId,
      data.userId,
      data.disabled,
    );
  });

export const resetManagedUserPassword = createServerFn({ method: "POST" })
  .middleware(requireAuthenticatedContext)
  .validator(resetPasswordSchema)
  .handler(async ({ data, context }) => {
    await UserAdminService.resetUserPassword(
      context.userId,
      data.userId,
      data.password,
    );
  });
