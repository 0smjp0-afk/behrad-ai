# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased] — 5.5.0 (in progress)

### Changed — repository structure (breaking for contributors only)
- **The monolith is gone.** `src/worker.js` used to be a single ~7,600-line file.
  It is now built from **26 readable module files** in `src/modules/` (27 files
  counting the file header):
  `01-core-constants`, `02-i18n-runtime`, `03-settings`, `04-utils`,
  `05-storage-d1`, `06-vision`, `07-telegram`, `08-llm`, `09-link-reader`,
  `10-voice`, `11-tools`, `12-reminders`, `13-circuit-breaker`, `14-users`,
  `15-markdown-typing`, `16-chat-core`, `17-menus`, `18-export-backup`,
  `19-dashboard`, `20-cron`, `21-webapp-api`, `22-handlers`,
  `21b-widgets`, `22b-messages`, `23-reminder-intent`, `24-inline-mode`
  (plus `00-header`).
  Deployment is unchanged: `npm run build` still emits **one** file to paste
  into Cloudflare.

### Fixed
- **Secret name mismatch.** The in-code header told you to set `BOT_TOKEN`, while
  every document said `TELEGRAM_BOT_TOKEN`. The Worker now reads
  `TELEGRAM_BOT_TOKEN` everywhere, and the built-in install guide matches the
  docs. `BOT_TOKEN` is no longer referenced anywhere.
- **Secrets list completed.** `OWNER_NAME`, `OWNER_NAME_EN`, `FEATURES` and
  `WEBHOOK_SECRET` are now listed consistently in the in-code guide, README,
  DEPLOYMENT, FEATURES and SECURITY.
- **LICENSE not detected on GitHub.** The file had a Persian appendix that broke
  GitHub's licensee parser (it showed `NOASSERTION`). The canonical MIT text is
  now the whole file; the Persian note moved into the README.

### Added
- `docs/BEGINNER.md` — an absolute-beginner deployment guide (Persian + English)
  that assumes zero prior knowledge, with the real free-tier limits spelled out.
- `docs/INTERFACE.md` — text mockups of every screen (main panel, model picker,
  settings, dashboard, app) and the common flows.
- `scripts/build.mjs` — bundles `src/modules/` + `src/generated/app-assets.js`
  into the deployable `src/worker.js`; `--check` and `--assets` modes.
- `scripts/check-split.mjs` — proves the bundle's AST is identical to the source.
- Real integration tests (`test/integration.mjs`, 55 checks) that boot the
  actual Worker with an in-memory D1 and a mocked Telegram API and exercise
  access control, storage, memory, models, reminders, i18n, secrets, the webhook
  and cron.

## [5.4.0] — 2026-10-29

### Added
- **Bilingual bot (Persian/English).** Every user-facing string lives in the
  `CAT` catalog (848 entries, `{fa, en}`); `L(env, id, …)` resolves the language
  per request. A user picks 🇮🇷/🇬🇧 in ⚙️ Settings; the choice is stored per user
  (`lang`, default `fa`).
- **Owner name from a secret.** The persona name comes from `OWNER_NAME`
  (optional `OWNER_NAME_EN` for a Latin rendering) and is never hardcoded.
- **Optional tools.** The `FEATURES` secret turns image generation, web search,
  TTS/STT, translation, summarization and YouTube summaries off deployment-wide.
- **Bilingual web dashboard** (`web/`) with an automatic RTL↔LTR switch.
- **Repository packaging:** SECURITY policy, MIT license, contributing guide,
  CI workflow, dependabot, issue/PR templates.
- Build pipeline that bundles `web/` into the Worker's `APP_ASSETS`, so
  deployment stays a single file.

### Removed
- The legacy GitHub/Codespaces integration, removed entirely from code and
  storage — no trace remains.

## [5.3.0] — internal (not published)
- Circuit breaker for failing custom providers; per-user image quotas; model-hash
  cache persisted in D1; D1-only storage decision (KV dropped).

## [5.1.0] — internal (not published)
- Baseline single-file Worker: chat with Workers AI + OpenAI-compatible custom
  services, personas, threads, long-term memory, reminders, web dashboard and an
  Android app shell.
