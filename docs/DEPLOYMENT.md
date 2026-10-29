# Deployment Guide / راهنمای استقرار

**English** · [فارسی](#فارسی-راهنمای-استقرار)

This guide takes you from zero to a working bot in ~20 minutes, entirely on Cloudflare's free plan.

---

## English

### 0. What you need

| Item | Cost | Notes |
|---|---|---|
| Cloudflare account | Free | [dash.cloudflare.com](https://dash.cloudflare.com) — free plan is enough |
| Telegram account | Free | To create the bot with @BotFather |
| Optional: [Google AI Studio](https://aistudio.google.com) key | Free tier | Better images, voice, translation |
| Optional: [Tavily](https://tavily.com) key | Free tier | Web search |

### 1. Create the Telegram bot

1. Open Telegram, message [@BotFather](https://t.me/BotFather).
2. Send `/newbot`, choose a display name and a username (must end in `bot`).
3. Copy the **token** it gives you (`123456:ABC-DEF…`). Keep it secret.
4. *(Recommended)* `/setprivacy` → **Disable**, so the bot can be mentioned in groups.

### 2. Create the Worker

1. In the Cloudflare dashboard: **Workers & Pages → Create → Worker → Deploy** (any hello-world template).
2. Click **Edit code**, select all in the editor, delete it, and paste the entire contents of [`src/worker.js`](../src/worker.js).
3. **Deploy.** Note your URL: `https://NAME.YOUR-SUBDOMAIN.workers.dev`.

### 3. Create and bind the D1 database

The bot stores everything (users, chats, memory, reminders) in a D1 database.

1. Dashboard → **Storage & Databases → D1 → Create database** — name it e.g. `behrad-ai`, choose a region.
2. Open your Worker → **Settings → Bindings → Add**:
   - Type: **D1 database**
   - Variable name: `DB` (exactly this)
   - Database: pick the one you just created.
3. Redeploy if asked. The bot creates its own tables on first run — there is no SQL to run by hand.

### 4. Set the secrets

Worker → **Settings → Variables and Secrets → Add**. Type: **Secret** (not plaintext) for anything sensitive.

| Secret | Required | Value |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | ✅ | The token from BotFather |
| `ADMIN_ID` | ✅ | Your numeric Telegram ID (get it from [@userinfobot](https://t.me/userinfobot)) |
| `OWNER_NAME` | recommended | The name the bot identifies with — e.g. `رضا` |
| `OWNER_NAME_EN` | optional | Latin version for English mode — e.g. `Reza` |
| `DASHBOARD_PASSWORD` | recommended | Password for the web dashboard |
| `GEMINI_API_KEY` | optional | From Google AI Studio — images, TTS/STT, translation |
| `SEARCH_API_KEY` | optional | From Tavily — web search |
| `FEATURES` | optional | Comma list of enabled tools; **omit** = all on; `none` = all off; e.g. `search,sum` |

> **Why `OWNER_NAME`?** The bot's personality ("your personal AI, <name>") is built from this secret at runtime. This keeps your name out of the source code and out of this repository entirely. Without it, the bot says "Owner".

> **Optional tools:** image generation (`/image`) works even without `GEMINI_API_KEY` (a free fallback service). Web search needs `SEARCH_API_KEY`. `FEATURES` is an extra kill-switch: with `FEATURES=search`, only search and everything non-optional stays on; image generation, TTS/STT, translation, summarization and YouTube are off for **all** users.

### 5. Connect Telegram

1. Worker → **Settings → Triggers → Add Cron Trigger** → `*/5 * * * * *` if your plan allows, otherwise `*/5 * * * *` (runs reminders/backup).
2. Visit `https://YOUR-WORKER.workers.dev/webhook-set?secret=TELEGRAM_TOKEN_VALUE` **once** — or set the webhook with BotFather-less one-liner:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://YOUR-WORKER.workers.dev/webhook"
```

3. **Message your bot on Telegram.** First message → access denied (correct — you haven't been added yet as anything but admin; admin works immediately).

### 6. Verify

- `/start` in Telegram → main panel appears.
- `/ping` → service health.
- `/stats` → your usage.
- `https://YOUR-WORKER.workers.dev/dashboard` → enter `DASHBOARD_PASSWORD`.
- `https://YOUR-WORKER.workers.dev/app` → the Android app shell / PWA.

### 7. Language

- **Per user:** ⚙️ Settings → 🇮🇷 فارسی / 🇬🇧 English. Stored per user; default `fa`.
- **Dashboard & app** follow the admin's language.
- The bot's *replies* follow the persona and the user's language choice; system prompts are fully bilingual.

### 8. Adding users

Only `ADMIN_ID` works at first. As admin: open the bot's user panel (👥) and add Telegram user IDs to the allow-list. Users can then pick their own language, model and settings — within the limits you set (`dailyLimit`, image quotas).

### 9. Updating

The whole app is `src/worker.js` (including the dashboard — `web/` is bundled into it by `tools/build.mjs`). To update: paste the new `src/worker.js` and deploy. User data survives — the schema is migrated lazily.

### Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Bot silent | Webhook not set (step 5.2), or wrong token. Check Worker logs (dashboard → Worker → Logs). |
| `Binding "DB" not set` | Step 3 missed, or the variable isn't exactly `DB`. |
| Bot replies "access denied" to you | `ADMIN_ID` isn't your numeric ID (not the @username). |
| Images/voice fail | No/invalid `GEMINI_API_KEY` — or the tool is off via `FEATURES`. |
| Search says disabled | No `SEARCH_API_KEY`, or blocked by `FEATURES`. |
| Dashboard loops to login | Wrong `DASHBOARD_PASSWORD`, or cookies blocked. |
| Persian shows instead of English (or vice versa) | Per-user language in ⚙️ — it's a setting, not a bug. |

### Cost

Everything above runs on the Cloudflare free tier (100k requests/day, D1 included). Gemini/Tavily free tiers cover personal use. There is no paid dependency anywhere.

---

<div align="center" id="فارسی-راهنمای-استقرار">

## فارسی — راهنمای استقرار

</div>

### ۰. چه چیزهایی لازم دارید

| مورد | هزینه | توضیح |
|---|---|---|
| حساب کلادفلر | رایگان | [dash.cloudflare.com](https://dash.cloudflare.com) — پلن رایگان کافی است |
| حساب تلگرام | رایگان | برای ساخت ربات با @BotFather |
| اختیاری: کلید [Google AI Studio](https://aistudio.google.com) | رایگان | تصویر بهتر، صدا، ترجمه |
| اختیاری: کلید [Tavily](https://tavily.com) | رایگان | سرچ وب |

### ۱. ساخت ربات تلگرام

1. در تلگرام به [@BotFather](https://t.me/BotFather) پیام بدهید.
2. `/newbot` بفرستید، نام نمایشی و یوزرنیم (با پایان `bot`) انتخاب کنید.
3. **توکن** را کپی کنید (`123456:ABC-DEF…`) و محفوظ نگه دارید.
4. *(پیشنهادی)* `/setprivacy` ← **Disable** تا ربات در گروه‌ها با منشن کار کند.

### ۲. ساخت ورکر

1. داشبورد کلادفلر ← **Workers & Pages ← Create ← Worker ← Deploy** (هر قالب hello-world).
2. **Edit code** را بزنید، همهٔ محتوای ادیتور را پاک کنید و کلِ فایل [`src/worker.js`](../src/worker.js) را بچسبانید.
3. **Deploy.** آدرس را یادداشت کنید: `https://NAME.YOUR-SUBDOMAIN.workers.dev`.

### ۳. ساخت و اتصال D1

ربات همه‌چیز (کاربران، گفتگوها، حافظه، یادآورها) را در D1 می‌گذارد.

1. داشبورد ← **Storage & Databases ← D1 ← Create database** — اسم مثلاً `behrad-ai`.
2. ورکر خود را باز کنید ← **Settings ← Bindings ← Add**:
   - نوع: **D1 database**
   - نام متغیر: `DB` (دقیقاً همین)
   - دیتابیس: همان که ساختید.
3. اگر خواست، دوباره Deploy کنید. جدول‌ها را خود ربات دفعهٔ اول می‌سازد — هیچ SQL دستی لازم نیست.

### ۴. ست‌کردن رازها

ورکر ← **Settings ← Variables and Secrets ← Add**. برای هر چیز حساس نوع را **Secret** بگذارید (نه Plaintext).

| راز | اجباری؟ | مقدار |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | ✅ | توکن BotFather |
| `ADMIN_ID` | ✅ | آیدی عددی شما (از [@userinfobot](https://t.me/userinfobot)) |
| `OWNER_NAME` | پیشنهادی | نامی که ربات با خودش معرفی می‌کند — مثل `رضا` |
| `OWNER_NAME_EN` | اختیاری | معادل لاتین برای حالت انگلیسی — مثل `Reza` |
| `DASHBOARD_PASSWORD` | پیشنهادی | رمز داشبورد وب |
| `GEMINI_API_KEY` | اختیاری | از Google AI Studio — تصویر، صدا، ترجمه |
| `SEARCH_API_KEY` | اختیاری | از Tavily — سرچ وب |
| `FEATURES` | اختیاری | فهرست ابزارهای روشن؛ **نبودن** = همه روشن؛ `none` = همه خاموش؛ مثل `search,sum` |

> **چرا `OWNER_NAME`؟** شخصیت ربات («هوش مصنوعی شخصیِ …») در زمان اجرا از همین راز ساخته می‌شود؛ نام شما هرگز وارد سورس‌کد یا این مخزن نمی‌شود. بدون آن ربات می‌گوید «Owner».

> **ابزارهای اختیاری:** تولید تصویر (`/image`) حتی بدون `GEMINI_API_KEY` هم کار می‌کند (فالبک رایگان). سرچ وب به `SEARCH_API_KEY` نیاز دارد. `FEATURES` کلیدِ قطعِ کلی است: با `FEATURES=search` فقط سرچ و بقیهٔ امکاناتِ غیرِ اختیاری روشن می‌ماند؛ تصویر، صدا، ترجمه، خلاصه‌سازی و یوتیوب برای **همهٔ** کاربران خاموش است.

### ۵. وصل‌کردن تلگرام

1. ورکر ← **Settings ← Triggers ← Add Cron Trigger** ← اگر پلن اجازه می‌دهد `*/5 * * * * *` وگرنه `*/5 * * * *` (برای یادآورها و بکاپ هفتگی).
2. یک‌بار آدرس `https://YOUR-WORKER.workers.dev/webhook-set?secret=TELEGRAM_TOKEN` را باز کنید — یا با یک خط:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://YOUR-WORKER.workers.dev/webhook"
```

3. **به ربات پیام بدهید.** اولین پیام → «دسترسی ندارید» طبیعی است؛ ادمین بلافاصله دسترسی دارد.

### ۶. بررسی

- `/start` در تلگرام ← پنل اصلی باز شود.
- `/ping` ← سلامت سرویس‌ها.
- `/stats` ← آمار.
- `https://YOUR-WORKER.workers.dev/dashboard` ← ورود با `DASHBOARD_PASSWORD`.
- `https://YOUR-WORKER.workers.dev/app` ← اپ اندروید / PWA.

### ۷. زبان

- **هر کاربر:** ⚙️ تنظیمات ← 🇮🇷 فارسی / 🇬🇧 English. برای هر کاربر جدا ذخیره می‌شود؛ پیش‌فرض `fa`.
- داشبورد و اپ از زبانِ ادمین پیروی می‌کنند؛ پرامپت‌های سیستمی هم در هر دو زبان کامل‌اند.

### ۸. افزودن کاربر

اول فقط `ADMIN_ID` کار می‌کند. به‌عنوان ادمین، پنل «کاربران مجاز» (👥) را باز کنید و آیدی عددی بدهید. کاربرها بعدش زبان، مدل و تنظیماتِ خودشان را دارند — در محدودهٔ سقف‌هایی که شما می‌گذارید (`dailyLimit` و سهمیهٔ عکس).

### ۹. به‌روزرسانی

همه‌چیز داخل `src/worker.js` است (داشبورد هم — `web/` با `tools/build.mjs` داخلش بسته‌بندی می‌شود). برای به‌روزرسانی فقط فایل جدید را بچسبانید و Deploy کنید. دادهٔ کاربرها می‌ماند — مهاجرتِ اسکیمای خودکار است.

### رفع اشکال

| علامت | علت / راه‌حل |
|---|---|
| ربات ساکت است | webhook ست نشده یا توکن غلط. لاگ ورکر را ببینید. |
| `Binding "DB" not set` | مرحلهٔ ۳ جا افتاده یا نام متغیر دقیقاً `DB` نیست. |
| «دسترسی ندارید» برای خودتان | `ADMIN_ID` باید آیدی عددی باشد، نه یوزرنیم. |
| عکس/صدا کار نمی‌کند | `GEMINI_API_KEY` نیست یا ابزار با `FEATURES` خاموش شده. |
| سرچ می‌گوید غیرفعال | `SEARCH_API_KEY` نیست یا با `FEATURES` بسته شده. |
| داشبورد به ورود برمی‌گردد | رمز غلط است یا کوکی بلاک است. |
| فارسی/انگلیسی عوض نمی‌شود | زبان هر کاربر جدا است — از ⚙️ تنظیمات عوض کنید. |

### هزینه

همه‌چیز روی پلن رایگان کلادفلر جواب می‌دهد (۱۰۰هزار درخواست در روز، D1 رایگان). گوگل و Tavily سهمیهٔ رایگان برای استفادهٔ شخصی دارند. هیچ وابستگی پولی‌ای لازم نیست.
