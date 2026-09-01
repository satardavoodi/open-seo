/**
 * Bootstrap the first admin for Docker self-hosted AUTH_MODE=hosted.
 * Creates ADMIN_EMAIL / ADMIN_PASSWORD when the user does not exist yet.
 *
 * Run automatically from docker-entrypoint.sh after migrations.
 */
import process from "node:process";
import { getPlatformProxy } from "wrangler";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { account, member, organization, user } from "../src/db/better-auth-schema";
import {
  SHARED_WORKSPACE_ORGANIZATION_ID,
} from "../src/server/auth/delegated-organization";

const schema = { user, organization, member, account };

const CREDENTIAL_PROVIDER_ID = "credential";

async function main() {
  if (process.env.AUTH_MODE !== "hosted") {
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log(
      "[bootstrap] ADMIN_EMAIL and ADMIN_PASSWORD not set — skipping first-admin bootstrap.",
    );
    return;
  }

  if (adminPassword.length < 8) {
    console.error(
      "[bootstrap] ADMIN_PASSWORD must be at least 8 characters.",
    );
    process.exit(1);
  }

  const { env, dispose } = await getPlatformProxy<{ DB: D1Database }>();
  const db = drizzle(env.DB, { schema });

  try {
    const existing = await db.query.user.findFirst({
      columns: { id: true },
      where: eq(user.email, adminEmail),
    });

    if (existing) {
      console.log("[bootstrap] Admin user already exists — skipping.");
      return;
    }

    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(adminPassword);
    const name = adminEmail.split("@")[0] || "Admin";

    await db
      .insert(organization)
      .values({
        id: SHARED_WORKSPACE_ORGANIZATION_ID,
        name: "Shared workspace",
        slug: SHARED_WORKSPACE_ORGANIZATION_ID,
        createdAt: new Date(),
      })
      .onConflictDoNothing({ target: organization.id });

    await db.insert(user).values({
      id: userId,
      name,
      email: adminEmail,
      emailVerified: true,
      disabled: false,
    });

    await db.insert(account).values({
      id: crypto.randomUUID(),
      accountId: adminEmail,
      providerId: CREDENTIAL_PROVIDER_ID,
      userId,
      password: hashedPassword,
    });

    await db.insert(member).values({
      id: crypto.randomUUID(),
      organizationId: SHARED_WORKSPACE_ORGANIZATION_ID,
      userId,
      role: "owner",
      createdAt: new Date(),
    });

    console.log(`[bootstrap] Created admin user ${adminEmail}.`);
  } finally {
    await dispose();
  }
}

main().catch((error) => {
  console.error("[bootstrap] Failed:", error);
  process.exit(1);
});
