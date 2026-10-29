# Security Policy / سیاست امنیتی

**English** · [فارسی](#فارسی)

---

## English

### Supported versions

| Version | Supported |
|---------|-----------|
| 5.4.x   | ✅        |
| < 5.4   | ❌        |

### Reporting a vulnerability

**Do not open a public issue for security problems.**

Report privately via GitHub **Private vulnerability reporting** (Security tab → Report a vulnerability) or contact the repository owner directly. Include:

1. A description of the issue and its impact.
2. Steps to reproduce (or a minimal proof of concept).
3. Affected version/commit.

You will get an acknowledgement within **72 hours** and a fix timeline within **7 days**. Please do not disclose the issue publicly until a fix is released and you are given the go-ahead.

We credit reporters in the release notes by default — tell us if you prefer to stay anonymous.

### Security model of this bot

- **Deployment-scope secrets only.** All credentials (`TELEGRAM_BOT_TOKEN`, `ADMIN_ID`, `GEMINI_API_KEY`, `SEARCH_API_KEY`, `DASHBOARD_PASSWORD`, `OWNER_NAME`, …) live as [Cloudflare Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/). Nothing is hardcoded; nothing is ever written to the database or to backups.
- **Database.** Cloudflare **D1 only** — no KV, no external database. All state is namespaced per user.
- **Allow-list access.** Only `ADMIN_ID` and users the admin explicitly allow-lists can talk to the bot. Everyone else gets an access-denied message.
- **API keys are masked** everywhere they are displayed (`sk-…abcd` style) and are **excluded from backups**.
- **Dashboard** is protected by `DASHBOARD_PASSWORD` with an HttpOnly cookie session and login rate-limiting.
- **Owner name from a secret.** The bot's persona name comes from the `OWNER_NAME` secret — the real name is never in the code or this repository.
- **Optional tool gating.** Tools such as image generation and web search can be turned off deployment-wide with the `FEATURES` secret (see the deployment guide).
- **No telemetry.** The worker talks only to the Telegram API, the model providers you configure, and optional services you enable (Tavily, Gemini).

### Scope

The following are considered part of this project's security surface: the Worker source (`src/worker.js`), the bundled web dashboard (`web/` + `APP_ASSETS`), and the repository build tooling. The Cloudflare platform itself, Telegram, and third-party model providers are out of scope.

---

## فارسی

### نسخه‌های پشتیبانی‌شده

| نسخه | پشتیبانی |
|------|----------|
| 5.4.x | ✅ |
| قدیمی‌تر | ❌ |

### گزارش‌دادنِ آسیب‌پذیری

**لطفاً برای مشکل امنیتی ایشوی عمومی باز نکنید.**

از گزارشِ اختصاصیِ گیت‌هاب (Security ← Report a vulnerability) استفاده کنید یا مستقیم با مالکِ مخزن در تماس باشید. در گزارش بنویسید:

1. مشکل چیست و چه اثری دارد.
2. چطور بازتولید می‌شود (یا یک نمونهٔ کوچک).
3. کدام نسخه را درگیر می‌کند.

تا **۷۲ ساعت** رسیدگی می‌شود و تا **۷ روز** برنامهٔ رفع اعلام می‌شود. لطفاً تا زمانِ انتشارِ رفع و موافقتِ ما، مشکل را علنی نکنید. به‌پیش‌فرض نامتان در یادداشتِ انتشار می‌آید — اگر می‌خواهید ناشناس بمانید بگویید.

### مدلِ امنیتیِ این ربات

- **همهٔ اعتبارها رازِ استقرار هستند:** `TELEGRAM_BOT_TOKEN`، `ADMIN_ID`، `GEMINI_API_KEY`، `SEARCH_API_KEY`، `DASHBOARD_PASSWORD` و `OWNER_NAME` به‌صورت Worker Secret ست می‌شوند — هیچ‌کدام در کد یا مخزن نیست.
- **فقط D1** — هیچ KV و هیچ دیتابیسِ بیرونی؛ همهٔ داده‌ها در فضای‌نامِ خودِ کاربر.
- **دسترسی فقط با اجازه:** فقط ادمین و کاربرانی که خودش اجازه داده می‌توانند با ربات حرف بزنند.
- **کلیدها همه‌جا ماسک‌اند** (`sk-…abcd`) و **از بکاپ حذف می‌شوند**.
- **نامِ مالک فقط از راز** (`OWNER_NAME`) می‌آید — در هیچ فایلی از پروژه ذخیره نمی‌شود.
- **ابزارهای اختیاری:** تصویرساز و سرچ وب و… با رازِ `FEATURES` می‌توانند در کل استقرار خاموش شوند.
- **هیچ تلمتری‌ای نیست** — ربات فقط به تلگرام، سرویس‌های مدلی که خودتان اضافه می‌کنید و سرویس‌های اختیاریِ فعال‌شده وصل می‌شود.

### محدوده

سطحِ امنیتیِ این پروژه شامل کدِ ورکر (`src/worker.js`)، داشبوردِ وبِ بسته‌بندی‌شده (`web/` و `APP_ASSETS`) و اسکریپت‌های ساخت (`tools/`) است؛ خودِ پلتفرم Cloudflare، تلگرام و سرویس‌های مدل بیرون از محدوده‌اند.
