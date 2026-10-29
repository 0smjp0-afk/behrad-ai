# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [SemVer](https://semver.org/).

## [5.4.0] — 2026-10

### Added
- **Bilingual bot** — every user-facing string (menus, help, errors, settings, system prompts) exists in Persian and English; users pick 🇮🇷/🇬🇧 in ⚙️ Settings, stored per-user (`lang` setting), with `fa` as default.
- **Owner name as a secret** — the bot's identity name comes from the `OWNER_NAME` Worker secret (with optional `OWNER_NAME_EN` for Latin rendering); never hardcoded.
- **Optional tools gate** — `FEATURES` secret disables image generation, web search, TTS/STT, translation, summarization or YouTube summaries deployment-wide.
- **Bilingual web dashboard** — full Persian/English interface with automatic RTL↔LTR switching, language picker in Settings.
- **Professional repository** — SECURITY policy, MIT license, contributing guide, CI (build-check + syntax + tests), dependabot, issue templates, secret scanning config.
- **Build pipeline** — `tools/build.mjs` bundles `web/` into the worker's `APP_ASSETS` so deployment stays a single file; `--check` mode used by CI.
- Test suite: i18n runtime tests (843+ entries, placeholder parity), bilingual module-constant tests, web dictionary completeness.

### Features carried from the 5.x line
- Multi-model chat: Cloudflare Workers AI out of the box + any OpenAI-compatible custom service (OpenRouter, Groq, DeepSeek, vLLM, Ollama…).
- Live streaming replies, automatic fallback to free Cloudflare models, per-user daily token limits.
- Image generation & editing (Gemini or free Pollinations fallback), vision on photos, PDF reading, voice in/out (TTS/STT), instant translation, smart summaries.
- Web search (Tavily), weather, crypto prices, morning briefing, YouTube summaries.
- Reminders & scheduled AI tasks, to-do lists, long-term memory (auto-extracted), prompt library, separate chats/threads, weekly JSON backup.
- Web dashboard + Android app shell (`/app`) over a versioned JSON API.
- Security model: allow-list access, masked keys excluded from backups, D1-only storage, HttpOnly cookie dashboard auth with rate-limiting.

### Security
- Removed the legacy GitHub/Codespaces integration entirely; no trace remains in code or storage.
- Owner name and all credentials are secrets-only; keys are masked in every UI surface and excluded from backups.

## [5.3.0] — internal
- v5.3 hardening pass: callback breaker, quota system for images, model-hash cache with D1 persistence.

## [5.1.0] — internal
- Baseline single-file worker: chat, personas, threads, memory, reminders, dashboard, Android app shell.
