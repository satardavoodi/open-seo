# Docker Self-Hosting

Run OpenSEO locally with Docker.

By default, Docker uses `AUTH_MODE=local_noauth` (no in-app auth, synthetic admin user `admin@localhost`). For a public VPS with real sign-in, use **`AUTH_MODE=hosted`** instead (see [Hosted auth on Docker](#hosted-auth-on-docker) below).

The default `compose.yaml` uses the published GHCR image:

- `ghcr.io/every-app/open-seo:latest`

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- A DataForSEO API key (see [`DATAFORSEO_API_KEY.md`](./DATAFORSEO_API_KEY.md))

## Quickstart

```bash
cp .env.example .env
```

Set `DATAFORSEO_API_KEY` in `.env` using the [DataForSEO setup guide](./DATAFORSEO_API_KEY.md), then start OpenSEO:

```bash
docker compose up -d
```

Open `http://localhost:<PORT>` (default `3001`). The first start builds the app and may take 1-2 minutes; follow progress with `docker compose logs -f`.

Optional env values:

- `PORT` (defaults to `3001`)
- `ALLOWED_HOST` (single reverse-proxy hostname to allow in Vite preview)
- `AUTH_MODE` (defaults to `local_noauth`; set to `hosted` for email/password auth)
- `OPEN_SEO_IMAGE` (defaults to `ghcr.io/every-app/open-seo:latest`)
- `OPENROUTER_API_KEY` (required for AI features such as SAM; see [OpenRouter](https://openrouter.ai/settings/keys))

If you are putting Docker behind a reverse proxy or a temporary tunnel with `local_noauth`, only expose it on a private network or add your own auth in front. With `AUTH_MODE=hosted`, OpenSEO handles sign-in itself.

```bash
ALLOWED_HOST=yourdomain.com docker compose up -d
```

You can also persist it in `.env`.

## Hosted auth on Docker

Use Better Auth email/password sign-in on a self-hosted Docker install (no Loops email required).

Set these in `.env` (never commit real secrets):

```bash
AUTH_MODE=hosted
BETTER_AUTH_URL=https://your-domain.example.com
BETTER_AUTH_SECRET=replace-with-a-long-random-secret-at-least-32-characters
BYPASS_EMAIL_VERIFICATION=true
ALLOWED_HOST=your-domain.example.com
ADMIN_EMAIL=admin@your-domain.example.com
ADMIN_PASSWORD=choose-a-strong-password-at-least-8-characters
```

Then recreate the container:

```bash
docker compose up -d --force-recreate open-seo
```

On first start, the container bootstraps the admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` if that user does not exist yet. Sign in at `/sign-in`. Admins manage additional users under **Users / کاربران** in the account menu (create, disable, reset password). All users share one workspace; members see the same projects.

Public self-registration is disabled — only admins create accounts. `cloudflare_access` and `local_noauth` remain available if you set `AUTH_MODE` accordingly.

Google OAuth (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`) is optional on Docker hosted auth and only needed for Google sign-in or Search Console integration.

## Telemetry

OpenSEO collects anonymized telemetry for core usage events: heartbeats with aggregate counts (installs, users, projects, feature usage) tied to a random install ID, sent every 5 minutes during the first two hours after install, then at most once daily. Telemetry also includes failed setup check names and statuses, never values or error messages. No URLs, keywords, prompts, emails, or IP-derived location are collected, and idle installs send nothing.

To disable it, set `OPENSEO_TELEMETRY_DISABLED=1` (or `DO_NOT_TRACK=1`) in `.env`, then run `docker compose up -d --force-recreate open-seo`.

## Pin to a specific image tag

Set `OPEN_SEO_IMAGE` in `.env` and restart:

```bash
OPEN_SEO_IMAGE=ghcr.io/every-app/open-seo:v1.2.3
docker compose up -d
```

## Build your own image locally

If you are testing local code changes, build and run a local tag:

```bash
docker build -f Dockerfile.selfhost -t open-seo:local .
OPEN_SEO_IMAGE=open-seo:local docker compose up -d
```

## Common commands

- Restart service after env changes:

```bash
docker compose up -d open-seo
```

- Pull latest published image and restart:

```bash
docker compose pull && docker compose up -d
```

- Stop:

```bash
docker compose down
```

## Health and troubleshooting

Startup checks appear in `docker compose logs` before the build. Once running, `/api/health` reports configuration and database status, and `docker compose ps` reports container health.

## Troubleshooting environment variables

To confirm Docker Compose is using the expected environment variables:

```bash
docker compose config
```

Check that `AUTH_MODE` matches your intent (`local_noauth` by default, or `hosted` for email/password auth), and that `DATAFORSEO_API_KEY` is the base64
encoded value of your DataForSEO email and API password in this format:
`email:password`.

If you changed `.env`, recreate the container so Compose reapplies it:

```bash
docker compose up -d --force-recreate open-seo
```
