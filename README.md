# OpenSEO

## راه‌اندازی این فورک (satardavoodi/open-seo) / Running this fork

**فارسی:** این فورک همان کد رسمی [every-app/open-seo](https://github.com/every-app/open-seo) است. برای اجرا:

1. Node.js **22.6+** و `corepack enable` → `pnpm install --frozen-lockfile`
2. `cp .env.example .env.local` — `AUTH_MODE=local_noauth` (بدون احراز هویت محلی)
3. `pnpm run db:migrate:local` (یک‌بار)
4. `pnpm dev` → UI روی `http://localhost:3001` (بدون `DATAFORSEO_API_KEY` هم بالا می‌آید؛ فقط دادهٔ SEO غیرفعال است)
5. **اختیاری:** `DATAFORSEO_API_KEY` = base64 از `login:password` — ر.ک. [`docs/DATAFORSEO_API_KEY.md`](./docs/DATAFORSEO_API_KEY.md)
6. **اختیاری:** `OPENROUTER_API_KEY` برای عامل هوش مصنوعی SAM
7. **Docker:** [`docs/SELF_HOSTING_DOCKER.md`](./docs/SELF_HOSTING_DOCKER.md) — `AUTH_MODE=local_noauth`، پورت پیش‌فرض `3001`
8. **Cloudflare (پیشنهادی برای production):** [`docs/SELF_HOSTING_CLOUDFLARE.md`](./docs/SELF_HOSTING_CLOUDFLARE.md)

**English:** Same upstream codebase. Quick local start: steps 1–4 above. SEO data needs `DATAFORSEO_API_KEY` (base64 of `login:password`). AI agent (SAM) needs optional `OPENROUTER_API_KEY`. Behind a tunnel or reverse proxy, set `ALLOWED_HOST` to the public hostname. Do not commit secrets.

---

> Open source alternative to Semrush and Ahrefs

OpenSEO is an SEO tool for _the people_. If tools like Semrush or Ahrefs are too expensive or bloated, OpenSEO is a pay-as-you-go alternative that you actually control.

> All-in-one SEO tool for you and your AI agent.

Connect with any agent like Claude Code, OpenClaw or Hermes. We have pre-built skills, but you can build your own to tailor OpenSEO to your needs.

<img width="1385" height="794" alt="Image" src="https://github.com/user-attachments/assets/fd208249-44ea-4849-bb4b-5fc896aeab73" />

## Hosted Version

Try OpenSEO for free on our website. If you want to support the project, a hosted subscription is $10/month.

[openseo.so](https://openseo.so)

## Why use OpenSEO?

- Best in class MCP and AI Skills.
- Modern, simple UI.
  - Focused workflows instead of a bloated, complex SEO suite.
- No subscriptions.
  - Bring your own DataForSEO API key and pay only for what you use.
- Fork and vibe code your own custom tool.

## Main SEO Workflows

- Keyword research
- Rank tracking
- Competitor Insights
- Backlinks
- Site Audits
- AI Visibility

## OpenSEO MCP & Agent Skills

OpenSEO exposes an MCP server so AI agents like Claude Code, OpenClaw, and Hermes can use your SEO data directly. Agent Skills are reusable workflows that guide your agent through SEO tasks using the MCP.

- [Set up OpenSEO MCP](https://openseo.so/docs/mcp)
- [Set up OpenSEO Agent Skills](https://openseo.so/docs/skills/setup)

## Self-Hosting

OpenSEO supports two self-hosting paths:

- **Simple: Docker (Best for testing it out)** - For personal use on your own machine. See [`docs/SELF_HOSTING_DOCKER.md`](./docs/SELF_HOSTING_DOCKER.md).
  - Unless you already are self-hosting other apps and are confident doing so, we recommend self-hosting with Cloudflare as opposed to Railway, Coolify or Dokploy.
  - We plan to make it simpler to host on those platforms in the next few months.
- **Recommended: Cloudflare** - For internet-facing self-hosting across multiple devices or with your team (works on the free plan). See [`docs/SELF_HOSTING_CLOUDFLARE.md`](./docs/SELF_HOSTING_CLOUDFLARE.md).

Either way, you need a DataForSEO API key to get SEO data. See [`docs/DATAFORSEO_API_KEY.md`](./docs/DATAFORSEO_API_KEY.md).

## Costs

OpenSEO needs a [DataForSEO](https://dataforseo.com/?aff=255379) API key so that you can get SEO data. You pay them directly when self hosting.

See [openseo.so/pricing](https://openseo.so/pricing)

When you self host, your costs will be slightly lower than the estimates on our website. The way the hosted service makes money is by charging 28% extra for every request we make to DataForSEO.

## Local Development

See [`docs/LOCAL_DEVELOPMENT.md`](./docs/LOCAL_DEVELOPMENT.md).

## Contributing

Creating clear issues is the best way to contribute.

Read more here: [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md)

We have this skill: `/simple-issue-description` which helps.

```sh
npx skills add every-app/open-seo --skill simple-issue-description
```

## Community

Join Discord to chat: [Discord](https://discord.gg/c9uGs3cFXr)

Follow along for updates:

- Follow on X: https://x.com/bensenescu
- Sign up for the mailing list on our website: [openseo.so](https://openseo.so)
