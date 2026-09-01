---
title: "Docker Self-Hosting"
description: "Run OpenSEO locally with Docker Compose using the published GHCR image."
---

Run OpenSEO locally with Docker.

By default, Docker uses `AUTH_MODE=local_noauth` (no in-app auth). For a public VPS with real sign-in, set **`AUTH_MODE=hosted`** — see [Hosted auth on Docker](#hosted-auth-on-docker). For internet-facing self-hosting with Cloudflare Access, use [Cloudflare](/docs/self-hosting/cloudflare) instead.

The default `compose.yaml` uses the published GHCR image:

- `ghcr.io/every-app/open-seo:latest`

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Docker Compose)
- A [DataForSEO API key](/docs/self-hosting#dataforseo-api-key-setup)

## Quickstart

Clone the repo, then:

```bash
git clone https://github.com/every-app/open-seo.git
cd open-seo
cp .env.example .env
```

Set `DATAFORSEO_API_KEY` in `.env` using the [DataForSEO setup guide](/docs/self-hosting#dataforseo-api-key-setup), then start OpenSEO:

```bash
docker compose up -d
```

Open `http://localhost:<PORT>` (default `3001`). Each container start builds the app and may take 1-2 minutes; follow progress with `docker compose logs -f`.

Optional env values:

- `PORT` (defaults to `3001`)
- `ALLOWED_HOST` (single reverse-proxy hostname to allow in Vite preview)
- `AUTH_MODE` (defaults to `local_noauth`; set to `hosted` for email/password auth)
- `OPEN_SEO_IMAGE` (defaults to `ghcr.io/every-app/open-seo:latest`)

If you are putting Docker behind a reverse proxy or a temporary tunnel, set the public hostname before restarting:

```bash
ALLOWED_HOST=yourdomain.com docker compose up -d
```

You can also persist it in `.env`.

## Hosted auth on Docker

Use Better Auth email/password sign-in on Docker (no Loops API keys required).

Add to `.env` (never commit real secrets):

```bash
AUTH_MODE=hosted
BETTER_AUTH_URL=https://your-domain.example.com
BETTER_AUTH_SECRET=replace-with-a-long-random-secret-at-least-32-characters
BYPASS_EMAIL_VERIFICATION=true
ALLOWED_HOST=your-domain.example.com
ADMIN_EMAIL=admin@your-domain.example.com
ADMIN_PASSWORD=choose-a-strong-password-at-least-8-characters
```

Recreate the container after changing auth env:

```bash
docker compose up -d --force-recreate open-seo
```

The first admin is bootstrapped from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Sign in at `/sign-in`, then manage users from **Users / کاربران** in the account menu.

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

Restart service after env changes:

```bash
docker compose up -d open-seo
```

Pull latest published image and restart:

```bash
docker compose pull && docker compose up -d
```

Stop:

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

Check that `AUTH_MODE` matches your intent (`local_noauth` by default, or `hosted` for email/password auth), and that `DATAFORSEO_API_KEY` is the base64 encoded value of your DataForSEO email and API password in this format: `email:password`.

If you changed `.env`, recreate the container so Compose reapplies it:

```bash
docker compose up -d --force-recreate open-seo
```
