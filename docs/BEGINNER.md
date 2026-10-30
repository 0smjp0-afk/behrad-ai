# راهنمای مبتدی مطلق · Absolute Beginner's Guide

این راهنما برای کسی است که **هیچ چیزی** از برنامه‌نویسی، کلادفلر یا تلگرام‌بات نمی‌داند.
هر مرحله فقط «کجا کلیک کن» و «چه چیزی را کجا بچسبان» است. نیازی به نصب هیچ برنامه‌ای
روی کامپیوتر نیست — همه‌چیز داخل مرورگر انجام می‌شود.

> English version: [Absolute Beginner's Guide (EN)](#english-version)

---

## فهرست

1. [قبل از شروع — چه چیزهایی لازم داری؟](#۱)
2. [ساخت ربات در تلگرام (۵ دقیقه)](#۲)
3. [پیدا کردن آیدی عددی خودت](#۳)
4. [ساخت حساب کلادفلر](#۴)
5. [ساخت «Worker»](#۵)
6. [چسباندن کد](#۶)
7. [ساخت دیتابیس D1](#۷)
8. [وصل کردن دیتابیس و موتور AI به Worker](#۸)
9. [گذاشتن رمزها (Secrets)](#۹)
10. [روشن کردن وبهوک (تا ربات جواب بدهد)](#۱۰)
11. [تنظیم Cron برای یادآورها](#۱۱)
12. [تست نهایی](#۱۲)
13. [مشکلات رایج و راه‌حل واقعی](#۱۳)
14. [محدودیت‌های پلن رایگان کلادفلر (مهم!)](#۱۴)
15. [هزینه](#۱۵)

---

<a id="۱"></a>
## ۱) قبل از شروع — چه چیزهایی لازم داری؟

| لازم داری | چرا | هزینه |
|---|---|---|
| یک حساب تلگرام | برای ساخت ربات | رایگان |
| یک حساب کلادفلر | جایی که ربات اجرا می‌شود | رایگان |
| یک مرورگر (کروم/فایرفاکس) | همهٔ کارها در مرورگر است | رایگان |
| (اختیاری) کلید گوگل | برای عکس و صدا | رایگان |

**نکتهٔ مهم:** این ربات روی سرورِ کلادفلر اجرا می‌شود، نه روی کامپیوتر تو. پس
کامپیوترت می‌تواند خاموش باشد و ربات کار کند.

---

<a id="۲"></a>
## ۲) ساخت ربات در تلگرام (۵ دقیقه)

1. تلگرام را باز کن. در **جستجو** بنویس: `@BotFather` — روی حسابِ آبیِ تیک‌دار کلیک کن.
2. دکمهٔ **START** را بزن.
3. پیام بفرست: `/newbot`
4. BotFather می‌پرسد «اسم رباتت چیست؟» — هر اسمی که دوست داری بنویس. مثال: `دستیار من`
5. بعد می‌پرسد «یوزرنیم رباتت چیست؟» — باید **انگلیسی** باشد و به `bot` ختم شود.
   مثال: `my_helper_2026_bot` (اگر گفت تکراری است، یک عدد آخرش اضافه کن)
6. حالا یک پیام می‌فرستد که وسطش یک متن شبیه این است:

   ```
   7123456789:AAF3xYz9KlmNoPQRsTuVwXyZ1234567890
   ```

   **این همان `TELEGRAM_BOT_TOKEN` است.** روی آن بزن تا کامل کپی شود و یک جای
   امن نگه دار (مثلاً در «پیام‌های ذخیره‌شده»ی خودت). **به هیچ‌کس نده** — هر کس
   این را داشته باشد می‌تواند رباتت را کنترل کند.

✅ **تمام!** ربات ساخته شد ولی هنوز هیچ‌جا وصل نیست.

---

<a id="۳"></a>
## ۳) پیدا کردن آیدی عددی خودت

ربات برای اینکه بداند «مالک» کیست، به یک **عدد** نیاز دارد (نه یوزرنیم).

1. در تلگرام جستجو کن: `@userinfobot`
2. START بزن.
3. یک پیام می‌فرستد که وسطش نوشته `Id: 123456789`
4. **همان عدد** را کپی کن. (مثلاً `123456789`)

این می‌شود `ADMIN_ID` — یعنی «فقط این آدم اجازه دارد با ربات حرف بزند».

---

<a id="۴"></a>
## ۴) ساخت حساب کلادفلر

1. برو به: https://dash.cloudflare.com/sign-up
2. ایمیل و یک رمز بگذار، ثبت‌نام کن.
3. ایمیلت را باز کن و روی لینکِ تأیید کلیک کن.
4. وارد داشبورد شو.

هیچ کارت بانکی لازم نیست. پلن رایگان برای این ربات کافی است.

---

<a id="۵"></a>
## ۵) ساخت «Worker»

«Worker» یعنی همان برنامه‌ای که ربات را اجرا می‌کند.

1. در داشبورد کلادفلر، از منوی **چپ** روی **Workers & Pages** کلیک کن.
2. دکمهٔ آبی **Create** را بزن.
3. روی **Create Worker** کلیک کن (نه Pages).
4. یک اسم بده، مثلاً: `my-ai-bot`
5. **Deploy** را بزن.
6. حالا صفحه‌ای می‌بینی با دکمهٔ **Edit code** — فعلاً دست نزن، برمی‌گردیم.

**آدرسی که ساختی را یادداشت کن:** بالای صفحه چیزی شبیه این می‌بینی:
`https://my-ai-bot.YOUR-NAME.workers.dev`
این آدرس را کپی کن و یک جا نگه دار — بعداً لازم می‌شود.

> **اگر بارِ اول است:** کلادفلر از شما می‌خواهد یک «زیردامنهٔ» `workers.dev` انتخاب کنید
> (مثلاً `ali-dev`). بعد از انتخاب، آدرسِ ورکرت می‌شود
> `https://my-ai-bot.ali-dev.workers.dev`. اگر قبلاً ساخته‌اید، همان قبلی می‌ماند.

---

<a id="۶"></a>
## ۶) چسباندن کد

1. روی **Edit code** کلیک کن.
2. در ویرایشگر، **کل کدِ پیش‌فرض** را انتخاب کن و **پاک کن**
   (میانبر: `Ctrl+A` بعد `Delete`).
3. فایل **[`src/worker.js`](../src/worker.js)** را از این مخزن باز کن، کل محتوایش را
   کپی کن و در ویرایشگر **Paste** کن.
   (در گیت‌هاب، دکمهٔ «Copy raw contents» یا کپیِ سادهٔ همهٔ متن کافی است.)
4. دکمهٔ **Deploy** (بالا راست) را بزن. اگر خطایی داد نگران نباش — مرحلهٔ ۷ را
   اول انجام بده، چون کد به دیتابیس نیاز دارد.

---

<a id="۷"></a>
## ۷) ساخت دیتابیس D1

ربات همه‌چیز را (کاربرها، گفتگوها، حافظه، یادآور) در D1 نگه می‌دارد.

1. در داشبورد کلادفلر، از منوی چپ: **Storage & Databases**
2. روی **D1 SQL Database** کلیک کن.
3. **Create database** را بزن.
4. اسم بده: `my-bot-data`
5. **Create** را بزن.

جدول‌ها را خودِ ربات می‌سازد — تو کاری نداری.

> **چرا D1 و نه KV؟** در پلن رایگان، KV فقط ۱٬۰۰۰ نوشتن در روز می‌دهد ولی
> D1 روزی ۱۰۰٬۰۰۰ سطر. با KV ربات سریع به سقف می‌خورد.

---

<a id="۸"></a>
## ۸) وصل کردن دیتابیس و موتور هوش مصنوعی به Worker

**اول موتور هوش مصنوعی** (بدون این، ربات به هیچ سؤالی جواب نمی‌دهد):

1. برگرد به **Workers & Pages** → روی اسم ورکرت (`my-ai-bot`) کلیک کن.
2. تب **Settings** را بزن.
3. بخش **Bindings** → **Add** → **Workers AI** را انتخاب کن.
4. **Variable name** را دقیقاً بنویس: `AI`
   (بدون هیچ کلید API — مدل‌ها مال خود کلادفلر هستند.)
5. **Save** / **Deploy**.

**حالا دیتابیس:**

6. همان بخش **Bindings** → **Add** → **D1 database** را انتخاب کن.
7. **Variable name** را دقیقاً بنویس: `DB`
   (حروف بزرگ. مهم است! اگر چیز دیگری بنویسی ربات کار نمی‌کند.)
8. از لیست، `my-bot-data` را انتخاب کن.
9. **Deploy** / **Save** را بزن.

---

<a id="۹"></a>
## ۹) گذاشتن رمزها (Secrets)

همان‌جا در **Settings** → بخش **Variables and Secrets** → **Add**.

هر ردیف را جدا اضافه کن. **نوع همه را روی Secret بگذار (نه Text)**.

| نام (دقیقاً همین) | مقدارش |
|---|---|
| `TELEGRAM_BOT_TOKEN` | توکنی که در مرحلهٔ ۲ کپی کردی |
| `ADMIN_ID` | عددی که در مرحلهٔ ۳ پیدا کردی |
| `DASHBOARD_PASSWORD` | یک رمز دلخواه برای داشبورد (مثلاً `MyPass123`) |
| `OWNER_NAME` | اسم خودت (مثلاً `رضا`) — ربات با این اسم معرفی می‌شود |

**اختیاری‌ها (می‌توانی بعداً اضافه کنی):**

| نام | چه می‌کند | از کجا بگیرم |
|---|---|---|
| `OWNER_NAME_EN` | معادل لاتین اسمت برای حالت انگلیسی | مثل `Reza` |
| `GEMINI_API_KEY` | عکس‌سازی + صدا + ترجمه | https://aistudio.google.com |
| `SEARCH_API_KEY` | جستجوی وب | https://tavily.com |
| `WEBHOOK_SECRET` | امنیتِ بیشتر: جلوی درخواست جعلی را می‌گیرد | یک متن تصادفی خودت بساز |
| `FEATURES` | خاموش‌کردن بعضی ابزارها | مثل `search,sum` |

بعد از همه، **Deploy** را بزن.

> ✅ **نکتهٔ امنیتی:** رازها فقط در کلادفلر می‌مانند. تو کد (که همه می‌بینند) هیچ
> کلیدی نیست.

---

<a id="۱۰"></a>
## ۱۰) روشن کردن وبهوک (تا ربات جواب بدهد)

تا این کار را نکنی، ربات ساکت می‌ماند. این آدرس را در مرورگر باز کن (فقط یک بار):

```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=<WORKER_URL>/webhook
```

جای `<TOKEN>` توکنِ مرحلهٔ ۲ را بگذار، و جای `<WORKER_URL>` آدرسِ مرحلهٔ ۵.
اگر `WEBHOOK_SECRET` گذاشتی، این را هم آخرش اضافه کن:
`&secret_token=<مقدارِ همان راز>`

**مثال واقعی:**

```
https://api.telegram.org/bot7123456789:AAF3xYz.../setWebhook?url=https://my-ai-bot.behrad.workers.dev/webhook
```

اگر مرورگر نوشت `{"ok":true,"result":true,"description":"Webhook was set"}` یعنی
موفق شد. ✅

> **اگر `{"ok":false...}` دیدی:** آدرس را دوباره چک کن (بدون فاصله، بدون `/` اضافه).

---

<a id="۱۱"></a>
## ۱۱) تنظیم Cron برای یادآورها

بدون این، یادآور و خلاصهٔ صبحگاهی کار نمی‌کند.

1. برو به ورکرت → **Settings** → **Triggers** (یا Cron Triggers).
2. **Add Cron Trigger** را بزن.
3. این را بنویس: `* * * * *`
   (یعنی «هر دقیقه یک بار بررسی کن». هزینه ندارد.)
4. **Save**.

---

<a id="۱۲"></a>
## ۱۲) تست نهایی

1. در تلگرام به رباتت برو (همان یوزرنیمِ مرحلهٔ ۲).
2. پیام بفرست: `/start`
3. باید پنل اصلی بیاید. حالا `/ping` بفرست تا سلامت سرویس‌ها را ببینی.
4. داشبورد: آدرس ورکرت + `/dashboard` را در مرورگر باز کن و با رمزی که در
   مرحلهٔ ۹ گذاشتی وارد شو.

🎉 **تمام! رباتت آماده است.**

---

<a id="۱۳"></a>
## ۱۳) مشکلات رایج و راه‌حل واقعی

| چه می‌بینی | یعنی چه | راه‌حل |
|---|---|---|
| ربات هیچ جوابی نمی‌دهد | وبهوک ست نشده یا آدرس غلط است | مرحلهٔ ۱۰ را دوباره انجام بده. آدرسِ getWebhookInfo را باز کن: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo` — اگر `last_error_message` داشت، همان خطا را بخوان |
| ربات می‌گوید «دسترسی ندارید» | `ADMIN_ID` غلط است | `ADMIN_ID` باید **عدد** باشد (از @userinfobot)، نه یوزرنیم مثل `@ali` |
| خطای `Binding "DB" is not set` | دیتابیس وصل نیست | مرحلهٔ ۸ را دقیقاً با اسمِ `DB` انجام بده |
| خطای `Binding "AI"` | موتور هوش مصنوعی وصل نیست | ورکر → Settings → Bindings → Add → **Workers AI** → variable name = `AI` |
| عکس می‌سازد ولی `429` می‌دهد | سقف Neurons پلن رایگان پر شده | چند دقیقه صبر کن، یا `GEMINI_API_KEY` بگذار، یا پلن ۵ دلاری |
| پاسخ‌های بلند وسطشان قطع می‌شود | محدودیت زمانِ پلن رایگان (~۳۰ ثانیه) | سؤال کوتاه‌تر بپرس، یا پلن ۵ دلاری بگیر |
| یادآور کار نمی‌کند | Cron ست نشده | مرحلهٔ ۱۱ |
| داشبورد دائم به صفحهٔ ورود برمی‌گردد | رمز یا کوکی | `DASHBOARD_PASSWORD` را چک کن؛ در حالت ناشناس (Incognito) تست کن |
| جستجو می‌گوید «غیرفعال» | `SEARCH_API_KEY` نیست | از tavily.com کلید بگیر یا `FEATURES` را چک کن |
| زبان ربات عوض نمی‌شود | زبان هر کاربر جداست | در تلگرام: ⚙️ تنظیمات → 🇮🇷/🇬🇧 |

---

<a id="۱۴"></a>
## ۱۴) محدودیت‌های پلن رایگان کلادفلر (مهم!)

پلن رایگان عالی است ولی محدودیت‌هایی دارد که باید بدانی:

| محدودیت | عددِ واقعیِ پلن رایگان | یعنی چه برای تو |
|---|---|---|
| **زمان پردازش (CPU)** | **۱۰ میلی‌ثانیه** برای هر درخواست | سخاوتمندانه نیست: پاسخِ خیلی سنگین یا پردازشِ محلیِ زیاد ممکن است خطا بدهد. کارِ مدل روی سرورِ خودش انجام می‌شود و جزوِ CPU تو نیست، ولی پردازشِ سنگین (مثلاً PDFِ بزرگ) به این سقف نزدیک می‌شود |
| **مدّت کلِ درخواست** | تا وقتی کاربر وصل است سقفِ ثابتی ندارد؛ `waitUntil` تا ۳۰ ثانیه بعد از پاسخ | در عمل، پاسخ‌های خیلی بلند ممکن است وسطشان قطع شوند |
| **Neurons (مصرف مدل)** | **۱۰٬۰۰۰ در روز** (نیمه‌شب UTC ریست) | حدوداً چند ده سؤالِ ساده در روز؛ بعدش مدل خطا می‌دهد تا فردا |
| **خواندن از D1** | **۵٬۰۰۰٬۰۰۰ سطر در روز** | بسیار زیاد؛ عملاً هرگز نمی‌رسی |
| **نوشتن در D1** | **۱۰۰٬۰۰۰ سطر در روز** | بسیار زیاد؛ عملاً هرگز نمی‌رسی |
| **حجم D1** | ۵۰۰ مگابایت برای هر دیتابیس / ۵ گیگابایت برای کل حساب | برای استفادهٔ شخصی سال‌ها کافی است |
| **درخواست‌های Worker** | **۱۰۰٬۰۰۰ در روز** | کافی برای استفادهٔ شخصی |
| **استقرار (Deploy)** | حجمِ اسکریپت تا ۶۴ مگابایت | این ربات ~۰٫۷ مگابایت است — مشکلی نیست |
| **Cron** | هر دقیقه (۵ تریگر در حساب) | یادآورها دقیق کار می‌کنند |

**اگر مدل رایگان جواب نداد:** ربات خودکار (`autoFallback`) به یک مدل مطمئن
می‌رود تا کارت راه بیفتد.

**اگر زیاد استفاده می‌کنی:** ارتقا به پلن Workers (۵ دلار در ماه) همهٔ این
محدودیت‌ها را تقریباً حل می‌کند.

---

<a id="۱۵"></a>
## ۱۵) هزینه

| سرویس | پلن رایگان | کِی باید پول بدهی |
|---|---|---|
| کلادفلر Workers | ✅ کافی | فقط اگر خیلی زیاد استفاده کنی |
| کلادفلر D1 | ✅ کافی | تقریباً هرگز (برای استفادهٔ شخصی) |
| Google AI Studio | ✅ سهمیهٔ روزانه | فقط اگر سهمیه تمام شود |
| Tavily | ✅ سهمیهٔ ماهانه | فقط اگر بیش از سهمیه سرچ کنی |
| تلگرام | ✅ همیشه رایگان | هرگز |

**نتیجه:** برای استفادهٔ شخصی، این ربات **کاملاً رایگان** می‌ماند.

---

<div align="center">

# English Version

</div>

## What is this?

A step-by-step guide for someone who has **never** programmed or made a Telegram
bot. Everything happens in your browser — nothing to install.

> The English guide covers the same 15 steps as the Persian one above. Follow
> the numbered headings in the Persian section; below is the same content in
> English.

### 1. What you need
A Telegram account, a Cloudflare account, a browser, and (optionally) a Google
API key. The bot runs on Cloudflare's servers, so your computer can be off.

### 2. Make a Telegram bot
Search `@BotFather` → START → send `/newbot` → pick a display name and a
username ending in `bot` → copy the long token it returns. **That token is
`TELEGRAM_BOT_TOKEN`.** Keep it secret.

### 3. Find your numeric ID
Search `@userinfobot` → START → copy the number it shows (`Id: 123456789`).
That is your `ADMIN_ID`.

### 4. Cloudflare account
Sign up at https://dash.cloudflare.com/sign-up — no credit card required.

### 5. Create a Worker
Workers & Pages → Create → Create Worker → name it → Deploy. Note the URL
(`https://NAME.YOUR-NAME.workers.dev`).

### 6. Paste the code
Edit code → select all → delete → paste the entire contents of
[`src/worker.js`](../src/worker.js) → Deploy.

### 7. Create the D1 database
Storage & Databases → D1 SQL Database → Create database → name it. The bot
creates its own tables.

### 8. Bind it
First **Workers AI** (no key needed): Settings → Bindings → Add → Workers AI →
variable name exactly `AI`. Without it, chat fails with “The AI binding is not set”.
Then **D1**: Bindings → Add → D1 database → variable name exactly `DB`.

### 9. Set the secrets
Worker → Settings → Variables and Secrets → Add. Set `TELEGRAM_BOT_TOKEN`,
`ADMIN_ID`, `DASHBOARD_PASSWORD`, `OWNER_NAME` (all type **Secret**). Optional:
`OWNER_NAME_EN`, `GEMINI_API_KEY`, `SEARCH_API_KEY`, `WEBHOOK_SECRET`,
`FEATURES`. Deploy.

### 10. Set the webhook (so the bot replies)
Open this once in your browser:

```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=<WORKER_URL>/webhook
```

You should see `{"ok":true,...}`.

### 11. Set the Cron trigger
Worker → Settings → Triggers → Add Cron Trigger → `* * * * *` → Save.

### 12. Test
Message your bot: `/start`, then `/ping`. Open `<WORKER_URL>/dashboard` and log
in with `DASHBOARD_PASSWORD`. Done!

### 13. Common problems
Same table as the Persian section above: no reply (webhook), "access denied"
(`ADMIN_ID` must be a number), missing `Binding "AI"`/`"DB"` (step 8), `429` (free-tier
Neurons), long replies cut off (free-tier time limit), reminders not firing
(Cron), dashboard login loop (password/cookies).

### 14. Free-tier limits (important)
- **CPU time: 10 ms per request.** This is the tight one. Model inference runs on
  the provider's servers and does *not* count, but heavy local processing (a very
  large PDF, big history trimming) can approach the cap and fail.
- **Total request duration:** no fixed cap while the client stays connected;
  `waitUntil` may run up to 30 s after the response. In practice, very long
  replies can still be cut off.
- **Workers AI: 10,000 Neurons/day** (resets at 00:00 UTC, shared by Free and
  Paid as the free allowance) → roughly a few dozen simple questions a day; after
  that model calls fail until the next reset.
- **D1: 5,000,000 rows read/day, 100,000 rows written/day**, 500 MB per database
  (5 GB per account). Plenty for personal use.
- **100,000 Worker requests/day**; script size up to 64 MiB (this bot is ~0.7 MiB).
- **Cron:** every minute is fine (5 triggers per account).

The $5/month Workers plan lifts essentially all of these.

### 15. Cost
For personal use this bot stays **completely free**.
