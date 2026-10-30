<div align="center">

# ✨ Behrad AI — بهراد AI

**A bilingual (Persian/English) self-hosted AI assistant for Telegram, running entirely on Cloudflare Workers + D1.**

**دستیار هوشمند دوزبانه (فارسی/انگلیسی) برای تلگرام — کاملاً روی Cloudflare Workers با دیتابیس D1.**

[![CI](https://img.shields.io/badge/CI-checks-blue)](.github/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-5.4.0-orange)](CHANGELOG.md)
[![Platform](https://img.shields.io/badge/Cloudflare-Workers%20%2B%20D1-F38020)](https://developers.cloudflare.com/workers/)
[![i18n](https://img.shields.io/badge/i18n-fa%20%7C%20en-9cf)](docs/FEATURES.md)

**English** · [فارسی](#فارسی)

</div>

---

## English

### What is this?

A complete AI assistant that lives in your Telegram — chat, images, voice, memory, reminders, web search and more — deployed as **one JavaScript file** on Cloudflare's free tier. No server, no database to manage, no API keys in the code. You bring your own model access:

- **Zero-config path:** Cloudflare Workers AI models work out of the box (free tier included).
- **Bring-your-own:** any OpenAI-compatible service (OpenRouter, Groq, DeepSeek, vLLM, Ollama, …) plugs in with a base URL + key.

### Highlights

| | |
|---|---|
| 💬 **Chat** | Streaming replies, 9 built-in Cloudflare models + custom services, per-persona system prompts, separate chats with independent memory |
| 🎨 **Images** | Generate with Gemini or a free fallback, edit photos with a caption, analyze any photo (vision) |
| 🎙 **Voice** | Speech-to-text and text-to-speech (Google models, free Cloudflare fallback), voice replies |
| 🧠 **Memory** | Long-term memory extracted automatically from conversations; searchable |
| ⏰ **Time** | Natural-language reminders ("remind me tomorrow at 5…"), scheduled AI tasks, to-do lists |
| 🌐 **Web** | Search (Tavily), read any link, YouTube summaries, morning briefing |
| ⚙️ **Control** | Per-user settings, daily token limits, model fallback rules, usage stats |
| 🔒 **Privacy** | Allow-list access, keys masked everywhere and excluded from backups, D1-only storage, no telemetry |
| 🌍 **Bilingual** | Full Persian & English — bot replies and the web dashboard, per-user language, RTL/LTR aware |
| 📱 **Apps** | Built-in web dashboard + Android app shell over a versioned JSON API |

### Quick start

Never deployed anything before? Start with the **[Absolute Beginner's Guide](docs/BEGINNER.md)**.
Otherwise, the full walkthrough is in the **[Deployment Guide](docs/DEPLOYMENT.md)** — the short version:

1. **Create the bot:** talk to [@BotFather](https://t.me/BotFather) → `/newbot` → copy the token.
2. **Get a Cloudflare account** (free).
3. **Deploy the worker:** paste `src/worker.js` into the Cloudflare dashboard's Worker editor.
4. **Create a D1 database** and bind it as `DB` (step-by-step in the guide).
5. **Set the secrets** (Worker → Settings → Variables):

   | Secret | Required | Purpose |
   |---|---|---|
   | `TELEGRAM_BOT_TOKEN` | ✅ | Bot identity |
   | `ADMIN_ID` | ✅ | Your numeric Telegram user ID — only you can use the bot |
   | `OWNER_NAME` | recommended | The bot's persona name (never lives in code) |
   | `OWNER_NAME_EN` | optional | Latin rendering for English mode |
   | `WEBHOOK_SECRET` | optional | Random string; verifies Telegram webhook calls |
   | `DASHBOARD_PASSWORD` | recommended | Web dashboard login |
   | `GEMINI_API_KEY` | optional | Quality images, TTS/STT, translation |
   | `SEARCH_API_KEY` | optional | Web search via Tavily |
   | `FEATURES` | optional | Turn tools off deployment-wide (e.g. `search,img`) |
6. **Point BotFather at the worker:** set the webhook to `https://YOUR-WORKER.workers.dev/webhook`.
7. Message your bot — done. Switch language anytime in ⚙️ Settings.

### Repository layout

```
behrad-ai/
├── src/
│   ├── modules/           ← readable source, one file per area (24 modules + header)
│   └── worker.js          ← GENERATED deployable single file (npm run build)
├── web/                   ← dashboard sources, bundled into APP_ASSETS
├── scripts/               ← build.mjs (bundler), check-split.mjs (AST guard)
├── tools/                 ← check_syntax.mjs, diff_symbols.mjs
├── test/                  ← i18n + real integration tests (npm test)
├── docs/                  ← BEGINNER.md, DEPLOYMENT.md, FEATURES.md, INTERFACE.md
└── .github/               ← CI, dependabot, issue templates
```

### Development

```bash
npm install
npm run verify     # build:check + syntax + tests
npm run build      # re-bundle web/ into src/worker.js after editing web/
```

- Editing the bot's code: edit the modules in **`src/modules/`** (one file per area), then run `npm run build` to regenerate the deployable `src/worker.js`. User-facing strings must exist in both languages (`L(env, 'id')` + a `CAT` entry; web strings wrapped in `W('…')` + a `WEB_I18N` entry). See [CONTRIBUTING.md](CONTRIBUTING.md).
- Every configurable value has a Persian comment next to its definition in `CFG` / `SETTINGS_DEFAULT`.

### Security

Secrets live only as Cloudflare Worker secrets; the owner's name arrives via `OWNER_NAME`, never the code; keys are masked in every UI and excluded from backups; access is allow-list only; storage is D1-only. See [SECURITY.md](SECURITY.md) to report a vulnerability privately.

### License

[MIT](LICENSE) — free to use, modify and self-host, including commercially.
The only condition is keeping the copyright notice. No warranty is provided;
the full text is in [LICENSE](LICENSE).

---

<div align="center" id="فارسی">

## فارسی

</div>

### این چیست؟

یک دستیار هوشمند کامل که داخل تلگرام زندگی می‌کند — چت، عکس، ویس، حافظه، یادآور، سرچ وب و… — که به‌صورت **یک فایل جاوااسکریپت** روی Cloudflare مستقر می‌شود. بدون سرور، بدون دیتابیسِ مدیریتی، بدون کلید داخل کد:

- **مسیرِ بدون‌تنظیم:** مدل‌های Workers AI خودِ کلادفلر از همان اول کار می‌کنند (پلن رایگان هم کافی است).
- **سرویس دلخواه:** هر سرویس سازگار با OpenAI (OpenRouter، Groq، DeepSeek، vLLM، Ollama و…) با آدرس پایه + کلید وصل می‌شود.

### ویژگی‌ها

| | |
|---|---|
| 💬 **چت** | پاسخ زندهٔ حرف‌به‌حرف، ۹ مدل آمادهٔ کلادفلر + سرویس‌های کاستوم، شخصیت‌های آماده، گفتگوهای جدا با حافظهٔ مستقل |
| 🎨 **تصویر** | تولید با گوگل یا فالبک رایگان، ویرایش عکس با کپشن، فهم هر عکس (ویژن) |
| 🎙 **صدا** | فهم ویس و تولید صدا (مدل‌های گوگل، فالبک رایگان کلادفلر)، پاسخ صوتی |
| 🧠 **حافظه** | حافظهٔ بلندمدت که خودکار از گفتگو استخراج می‌شود؛ قابل جستجو |
| ⏰ **زمان** | یادآور از متن آزاد («فردا ساعت ۵ یادم بنداز…»)، تسک زمان‌بندی‌شده با AI، تودولیست |
| 🌐 **وب** | سرچ (Tavily)، خواندن هر لینک، خلاصهٔ یوتیوب، خلاصهٔ صبحگاهی |
| ⚙️ **کنترل** | تنظیمات هر کاربر، سقف توکن روزانه، قوانین فالبک مدل، آمار مصرف |
| 🔒 **حریم** | دسترسی فقط با اجازه، کلیدها همه‌جا ماسک و از بکاپ خارج، فقط D1، بدون تلمتری |
| 🌍 **دوزبانه** | فارسی و انگلیسی کامل — جواب‌های ربات و داشبورد وب؛ زبانِ هر کاربر جدا؛ راست‌چین/چپ‌چین خودکار |
| 📱 **اپ** | داشبورد وبِ داخلی + پوستهٔ اپ اندروید روی API نسخه‌دار |

### شروع سریع

اگر تا حالا هیچ استقراری انجام نداده‌اید، از **[راهنمای مبتدی مطلق](docs/BEGINNER.md)** شروع کنید.
وگرنه راهنمای کامل در **[راهنمای استقرار](docs/DEPLOYMENT.md)** است — نسخهٔ کوتاه:

1. **ساخت ربات:** از [@BotFather](https://t.me/BotFather) با `/newbot` ربات بسازید و توکن را کپی کنید.
2. **حساب کلادفلر** (رایگان) بسازید.
3. **استقرار ورکر:** محتوای `src/worker.js` را در ادیتور Worker داشبورد کلادفلر بچسبانید.
4. **ساخت دیتابیس D1** و اتصالش با نام `DB` (مرحله‌به‌مرحله در راهنما).
5. **ست‌کردن رازها** (Worker ← Settings ← Variables):

   | راز | اجباری؟ | کاربرد |
   |---|---|---|
   | `TELEGRAM_BOT_TOKEN` | ✅ | شناسهٔ ربات |
   | `ADMIN_ID` | ✅ | آیدی عددی تلگرام شما — فقط شما می‌توانید استفاده کنید |
   | `OWNER_NAME` | پیشنهادی | نامِ شخصیت ربات (هرگز در کد نیست) |
   | `OWNER_NAME_EN` | اختیاری | معادل لاتین برای حالت انگلیسی |
   | `WEBHOOK_SECRET` | اختیاری | رشتهٔ تصادفی؛ صحتِ درخواست‌های وبهوک تلگرام را می‌سنجد |
   | `DASHBOARD_PASSWORD` | پیشنهادی | رمز ورود داشبورد |
   | `GEMINI_API_KEY` | اختیاری | تصویر باکیفیت، TTS/STT، ترجمه |
   | `SEARCH_API_KEY` | اختیاری | سرچ وب با Tavily |
   | `FEATURES` | اختیاری | خاموش‌کردن ابزارها در کل استقرار (مثل `search,img`) |
6. **وصل‌کردن BotFather به ورکر:** آدرس webhook را روی `https://YOUR-WORKER.workers.dev/webhook` بگذارید.
7. به ربات پیام بدهید — تمام. زبان را هر وقت خواستید از ⚙️ تغییر دهید.

### ساختار مخزن

```
behrad-ai/
├── src/
│   ├── modules/           ← سورس خوانا؛ هر بخش یک فایل (۲۴ ماژول + سرصفحه)
│   └── worker.js          ← فایلِ تک‌قابلِ استقرار (ساختهٔ npm run build)
├── web/                   ← سورس داشبورد، بسته‌بندی‌شده در APP_ASSETS
├── scripts/               ← build.mjs (بسته‌بند)، check-split.mjs (نگهبانِ AST)
├── tools/                 ← check_syntax.mjs، diff_symbols.mjs
├── test/                  ← تست‌های i18n + یکپارچگیِ واقعی (npm test)
├── docs/                  ← BEGINNER.md، DEPLOYMENT.md، FEATURES.md، INTERFACE.md
└── .github/               ← CI، dependabot، قالب ایشو
```

### توسعه

```bash
npm install
npm run verify     # بررسی بسته + نحو + تست‌ها
npm run build      # بعد از تغییر web/ دوباره بسته‌بندی کن
```

- تغییر کد ربات: ماژول‌ها را در **`src/modules/`** ویرایش کنید (هر بخش یک فایل)، بعد `npm run build` بزنید تا `src/worker.js` تازه شود. هر متنِ کاربر باید در هر دو زبان باشد (`L(env, 'id')` + مدخل `CAT`؛ متن‌های وب داخل `W('…')` + مدخل `WEB_I18N`). جزئیات در [CONTRIBUTING.md](CONTRIBUTING.md).
- هر مقدارِ تنظیم‌پذیر، توضیح فارسی کنارِ خودش در `CFG` / `SETTINGS_DEFAULT` دارد.

### امنیت

رازها فقط Worker Secret اند؛ نام مالک از `OWNER_NAME` می‌آید، نه کد؛ کلیدها در همهٔ رابط‌ها ماسک‌اند و از بکاپ حذف می‌شوند؛ دسترسی فقط با اجازه؛ ذخیره‌سازی فقط D1. برای گزارشِ آسیب‌پذیری [SECURITY.md](SECURITY.md) را ببینید.

### مجوز

[MIT](LICENSE) — آزاد برای استفاده، تغییر و میزبانی شخصی، حتی تجاری.
تنها شرط، نگه‌داشتنِ اعلانِ کپی‌رایت است. هیچ ضمانتی ارائه نمی‌شود؛ متنِ
کامل در [LICENSE](LICENSE) است.
