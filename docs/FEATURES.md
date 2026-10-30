# Features / قابلیت‌ها

**English** · [فارسی](#فارسی)

A complete reference of what the bot does, how each feature is configured, and which secrets each one needs.

---

## English

### Core

#### Chat
- Any text message goes to the active model. Links are read automatically (`readLinks`).
- **Models:** 9 known Cloudflare Workers AI models out of the box, plus **any OpenAI-compatible custom service** (OpenRouter, Groq, DeepSeek, vLLM, Ollama, …) via `/provideradd` — models are discovered automatically.
- **Personas:** 6 built-in (assistant, translator, software engineer, tutor, creative writer, business advisor) + your own custom system prompt.
- **Live streaming** of replies (editable message), or one-shot delivery.
- **Separate chats** with independent histories and memory.
- **Fallback:** if the active model errors, the bot automatically retries on a free Cloudflare model (custom services never fall back to other paid services).
- **Compare:** one prompt to two models side by side.

#### Files & media
- **Photos** → analyzed by a vision model (auto-switch if the active model can't see).
- **PDFs** → text extracted and understood (up to 6 MB).
- **Any file** → read as context.
- **YouTube links** → subtitle download + summary (`ytSum`).

#### Voice
- **Speech-to-text:** send a voice message, it is transcribed (Google STT, or Cloudflare Whisper fallback). Persian is handled natively.
- **Text-to-speech:** `/tts متن` and optional voice replies (30 voices, 4 TTS models).
- Requires `GEMINI_API_KEY` for Google quality; free fallback without a key. Gated by `FEATURES=tts` / `stt`.

#### Images
- `/image description` — Gemini image models, or a free Pollinations fallback (`imgFree`).
- **Photo edit:** send a photo with caption `edit: …` or reply with `/edit`.
- **Vision:** every photo you send is understood by the active model, or auto-switched to a vision model (`autoVision`).
- Daily image quota per user. Gallery of everything generated (30 days) with `/gallery`.

#### Language & translation
- **Instant translation:** `/translate متن` or reply to any message — Persian↔English (`translate`).
- **Summaries:** `/sum` — chunked summarization of long text (`sum`).
- Both need `GEMINI_API_KEY` (or are disabled via `FEATURES`).

#### Memory
- `/remember …` to store a fact; memory is **auto-extracted** from conversations (`memAuto`).
- `/memory`, `/memfind`, `/forget 2`, `/forget all`.
- Injected into system prompts as "{{owner}}'s memory".

#### Time
- **Reminders:** `/remind 18:30 چای`, `/remind 45m استراحت`, daily repeats.
- **Natural language:** "remind me tomorrow at 5 to pay the bill" (`nlRemind`).
- **Scheduled AI tasks:** `/task every day 08:00 AI news` — the bot runs the prompt itself on a cron.
- **To-do list:** `/todo buy bread` · `/todo done 1` · `/todo del 1`.

#### Web
- `/web query` — Tavily search with model synthesis (`search` tool / `SEARCH_API_KEY`).
- **Link reading** — paste a URL and the model sees the page.
- `/weather`, `/crypto` — quick lookups.
- `/brief` — morning briefing at a fixed Tehran-time hour (`briefing`).

#### Chats & prompts
- **Threads:** separate conversations with independent memory (`/new`).
- **Prompt library:** `/pladd` saves reusable prompts, run with a tap.
- **Export:** `/export` downloads the current chat as text.
- **Weekly backup:** every Friday a JSON backup lands in Saved Messages (`weeklyBackup`). API keys are excluded.

### Interfaces

| Interface | URL | Auth |
|---|---|---|
| Telegram | the bot itself | allow-list |
| Web dashboard | `/dashboard` | `DASHBOARD_PASSWORD` + HttpOnly cookie |
| App / PWA | `/app` | token via dashboard |
| JSON API | `/api/v1/*` | bearer token |

### Settings (per user)

`model, temperature, maxTokens, dailyLimit, autoFallback, liveStream, readLinks, persona, autoVision, sysCustom, voiceReply, voiceProv, ttsModel, voiceName, sttModel, imgGen, imgFree, imgModel, imgEdit, briefing, searchAuto, nlRemind, cbBreaker, memAuto, ytSum, weeklyBackup, lang`

Every one of these has a Persian comment next to its definition in `SETTINGS_DEFAULT` (per the project's own rule). `lang` picks the interface + reply language (`fa` default).

### Secrets reference

| Secret | Tool(s) it enables |
|---|---|
| `TELEGRAM_BOT_TOKEN` | the bot itself |
| `ADMIN_ID` | admin identity |
| `OWNER_NAME` / `OWNER_NAME_EN` | bot persona name |
| `WEBHOOK_SECRET` | verifies Telegram webhook requests |
| `DASHBOARD_PASSWORD` | dashboard |
| `GEMINI_API_KEY` | images, TTS/STT, translation, summaries |
| `SEARCH_API_KEY` | web search |
| `FEATURES` | deployment-wide tool gate (`img,search,tts,stt,translate,sum,yt,crypto,weather`; `none` = off) |

### Architecture

- **One deployable file, many source files:** the readable source is `src/modules/` (27 modules); `npm run build` bundles them + the web dashboard (`APP_ASSETS`, built from `web/`) into the single deployable `src/worker.js`.
- **Storage:** Cloudflare D1 only, key/value tables, all keys namespaced per user (`u:<id>`, `us:<uid>`, `uq:<uid>:<date>`, …).
- **i18n:** every string has an id in the `CAT` catalog (`{fa, en}`, `%1..%N` placeholders); `L(env, id, …)` resolves per-request language. Web app mirrors this with `W('…')` + `WEB_I18N`.
- **No trace of removed features:** the legacy GitHub/Codespaces integration was fully excised from code and storage.

---

<div align="center" id="فارسی">

## فارسی

</div>

### هسته

#### چت
- هر پیام متنی به مدلِ فعال می‌رود؛ لینک‌ها خودکار خوانده می‌شوند (`readLinks`).
- ۹ مدل آمادهٔ Workers AI + هر سرویس سازگار با OpenAI (`/provideradd`) با کشف خودکار مدل‌ها.
- ۶ شخصیت آماده + پرامپت سیستمی دلخواه؛ گفتگوهای جدا (`/new`) با حافظهٔ مستقل.
- پاسخ زندهٔ حرف‌به‌حرف (`liveStream`) و فالبک خودکار به مدل رایگان کلادفلر (`autoFallback`).
- مقایسهٔ دو مدل کنارِ هم.

#### فایل و رسانه
- عکس → فهمیدن با ویژن (`autoVision`)؛ PDF تا ۶ مگابایت؛ هر فایل متنی.
- لینک یوتیوب ← خواندن زیرنویس و خلاصه (`ytSum`).

#### صدا
- فهم ویس با Google STT (فالبک Whisper کلادفلر) و تولید صدا با ۳۰ وویس و ۴ مدل (`ttsModel`، `voiceName`).
- پاسخ صوتی به ویس‌ها و دستور `/tts متن` (تا ۴۰۰ نویسه). گیتِ ابزار: `tts`/`stt`.

#### تصویر
- `/image توصیف` با مدل‌های گوگل یا فالبک رایگان Pollinations (`imgFree`).
- ویرایش عکس با کپشن «ویرایش: …» (`imgEdit`)؛ گالری ۳۰ روزه با `/gallery`.
- سهمیهٔ روزانهٔ تصویر برای هر کاربر (`imgFree` و سقف روزانه).

#### حافظه
- `/remember متن` سپردن، `/memory` دیدن، `/forget 2` حذف؛ استخراجِ خودکار از گفتگو (`memAuto`).
- جستجو با `/memfind`.

#### زمان
- یادآور: `/remind 18:30 چای`، `/remind 45m استراحت`، «هر روز 08:00».
- یادآور از متن آزاد: «فردا ساعت ۵ یادم بنداز قبض بدم» (`nlRemind`).
- تسک زمان‌بندی‌شده با AI: `/task هر روز 08:00 اخبار AI`.
- تودولیست: `/todo خرید نان` · `/todo done 1` · `/todo del 1`.

#### وب و ابزار
- `/web عبارت` — سرچ Tavily (`searchAuto` سرچ خودکار هم دارد).
- خواندن لینک، `/weather`، `/crypto`، خلاصهٔ صبحگاهی `/brief`.
- ترجمهٔ فوری `/translate متن`؛ خلاصهٔ هوشمند `/sum متن`.

#### گفتگوها و پرامپت‌ها
- رشته‌گفتگوهای جدا با حافظهٔ مستقل؛ کتابخانهٔ پرامپت؛ خروجی تاریخچه؛ بکاپ JSON هفتگی در Saved Messages (بدون کلیدها).

### رابط‌ها

| رابط | آدرس | ورود |
|---|---|---|
| تلگرام | خود ربات | لیست مجاز |
| داشبورد وب | `/dashboard` | رمز داشبورد + کوکی HttpOnly |
| اپ / PWA | `/app` | توکن از داشبورد |
| API | `/api/v1/*` | توکن |

### تنظیمات (هر کاربر)

`model, temperature, maxTokens, dailyLimit, autoFallback, liveStream, readLinks, persona, autoVision, sysCustom, voiceReply, voiceProv, ttsModel, voiceName, sttModel, imgGen, imgFree, imgModel, imgEdit, briefing, searchAuto, nlRemind, cbBreaker, memAuto, ytSum, weeklyBackup, lang`

هر یک، کنارِ تعریفش در `SETTINGS_DEFAULT` توضیح فارسی دارد. `lang` زبانِ رابط و پاسخ را تعیین می‌کند (پیش‌فرض `fa`).

### فهرست رازها

| راز | ابزاری که روشن می‌کند |
|---|---|
| `TELEGRAM_BOT_TOKEN` | خود ربات |
| `ADMIN_ID` | شناسهٔ ادمین |
| `OWNER_NAME` / `OWNER_NAME_EN` | نامِ شخصیت ربات |
| `DASHBOARD_PASSWORD` | داشبورد وب |
| `WEBHOOK_SECRET` | صحتِ درخواست‌های وبهوک تلگرام |
| `GEMINI_API_KEY` | تصویر، صدا، ترجمه |
| `SEARCH_API_KEY` | سرچ وب |
| `FEATURES` | کلیدِ خاموش/روشنِ ابزارهای اختیاری در کل استقرار |

### معماری

- **یک فایلِ قابل استقرار، چند فایلِ سورس:** سورسِ خوانا در `src/modules/` است (۲۷ ماژول)؛ `npm run build` آن‌ها را همراهِ داشبورد وب (‏`APP_ASSETS` که از `web/` ساخته می‌شود) در یک `src/worker.js` قابل استقرار می‌بندد.
- **ذخیره‌سازی:** فقط D1؛ کلیدها فضای‌نام‌بندی‌شده (`u:<uid>`, `us:<uid>`, …).
- **i18n:** هر متن شناسه‌ای در کاتالوگ `CAT` دارد (`{fa, en}` با جای‌نگهدار `%1…%N`)؛ `L(env, id, …)` زبانِ هر درخواست را برمی‌گرداند. وب‌اپ با `W('…')` و `WEB_I18N` همان کار را می‌کند و RTL/LTR خودکار است.
