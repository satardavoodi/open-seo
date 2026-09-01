type EnvRecord = Record<string, string | undefined>;

export function isSelfHostedDeployment(envRecord?: EnvRecord): boolean {
  const value =
    envRecord?.CLOUDFLARE_INCLUDE_PROCESS_ENV ??
    (typeof process !== "undefined"
      ? process.env.CLOUDFLARE_INCLUDE_PROCESS_ENV
      : undefined);

  return value === "true";
}

export function isSelfHostedHostedAuthMode(
  authMode: string | null | undefined,
  envRecord?: EnvRecord,
): boolean {
  return authMode === "hosted" && isSelfHostedDeployment(envRecord);
}

export function isSaaSHostedAuthMode(
  authMode: string | null | undefined,
  envRecord?: EnvRecord,
): boolean {
  return authMode === "hosted" && !isSelfHostedDeployment(envRecord);
}
