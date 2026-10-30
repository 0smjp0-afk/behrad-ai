# Contributing / مشارکت

**English** · [فارسی](#فارسی)

---

## English

Thanks for considering a contribution! This project is a single-file Cloudflare Worker with a bundled web dashboard, kept intentionally dependency-light.

### Ground rules

1. **No secrets, ever.** Never commit tokens, keys, passwords, chat logs, or real user data — including in tests, fixtures and screenshots. CI runs secret scanning; pushes containing credentials will be rejected.
2. **D1 only.** Storage design is D1-key/value-only. PRs introducing KV, external databases or extra platform bindings will be declined.
3. **Bilingual by default.** Every user-facing string must exist in both Persian (`fa`) and English (`en`):
   - Worker strings go through `L(env, 'id', …)` with an entry in the `CAT` catalog.
   - Web-app strings are wrapped in `W('…')` with a `WEB_I18N` entry.
4. **Every setting has a Persian comment** next to its definition in `CFG` / `SETTINGS_DEFAULT`.
5. **Keep the single-file deployment.** Edit the readable modules in `src/modules/`, then run `npm run build` — it regenerates the deployable `src/worker.js` (and refreshes `APP_ASSETS` from `web/`). CI rejects a stale build, so always commit the regenerated `src/worker.js` alongside your change.

### Which module do I touch?

| Area | File |
|---|---|
| Telegram API, send/edit messages | `src/modules/07-telegram.js` |
| Models & chat engine (Workers AI + OpenAI-compatible) | `src/modules/08-llm.js` |
| Storage / D1 / long-term memory | `src/modules/05-storage-d1.js` |
| Reminders, to-do, scheduled AI tasks | `src/modules/12-reminders.js`, `20-cron.js` |
| i18n catalog & `L()` runtime | `src/modules/02-i18n-runtime.js` |
| Defaults, personas, system prompts | `src/modules/03-settings.js` |
| Web dashboard / app API | `src/modules/19-dashboard.js`, `21-webapp-api.js` |
| Optional tools (image, voice, search) | `src/modules/10-voice.js`, `11-tools.js`, `06-vision.js` |
| Bot entry point, handlers, commands | `src/modules/22-handlers.js` |

All modules share one global scope (they are concatenated in the order in
`src/modules/manifest.json`), so a function defined in one file is visible in
the others — exactly as in the old single file.

### Workflow

```bash
git clone <your fork>
cd behrad-ai
npm install
npm run verify        # build:check + syntax + tests
```

- Create a feature branch (`feat/…`, `fix/…`).
- Keep PRs small and focused; describe *what* and *why*.
- Run `npm run verify` before pushing. CI must be green.
- Commit messages: imperative mood, e.g. `fix: thread env into widget generators`.

### Adding a new user-facing string (worker)

1. Add the Persian text at the call site wrapped in `L(env, …)`, or add a new `CAT` entry `{ id: { fa, en } }` with `%1…%N` placeholders.
2. Add the English translation in the same entry.
3. Run `node test/run.mjs` — the i18n tests will verify placeholder parity.

### Adding a new setting

1. Add it to `SETTINGS_DEFAULT` with a Persian comment.
2. Add a toggle/menu row if user-facing (Telegram settings menu and web settings screen).
3. Cover it in the settings test.

### Reporting bugs

Open an issue with the bug template: what you did, what you expected, what happened, deployment details (Worker region is irrelevant; do NOT include your `ADMIN_ID` or any key).

---

## فارسی

ممنون که می‌خواهید در پروژه مشارکت کنید! این پروژه یک ورکرِ تک‌فایلیِ کلادفلر است با داشبوردِ وبِ داخلِ همان فایل — عمداً کم‌وابستگی.

### قواعدِ اصلی

1. **هرگز هیچ رازی کامیت نشود.** توکن، کلید، رمز، لاگِ گفتگو یا دادهٔ واقعیِ کاربر — حتی در تست‌ها و اسکرین‌شات‌ها. اسکنِ راز در CI فعال است.
2. **فقط D1.** طرحِ ذخیره‌سازی فقط D1 است؛ PRهایی که KV یا دیتابیسِ بیرونی اضافه کنند پذیرفته نمی‌شوند.
3. **دوزبانه بودنِ اجباری.** هر متنی که کاربر می‌بیند باید هم فارسی باشد هم انگلیسی:
   - متن‌های ورکر با `L(env, 'id', …)` و مدخل در کاتالوگ `CAT`.
   - متن‌های وب‌اپ با `W('…')` و مدخل در `WEB_I18N`.
4. **هر تنظیم‌پذیر باید توضیح فارسی کنارِ خودش** در `CFG` / `SETTINGS_DEFAULT` داشته باشد.
5. **استقرارِ تک‌فایلی حفظ شود.** ماژول‌های خوانا را در `src/modules/` ویرایش کنید و بعد `npm run build` بزنید — همان دستور `src/worker.js` قابلِ استقرار را از نو می‌سازد (و `APP_ASSETS` را از `web/` تازه می‌کند). CI بستهٔ کهنه را رد می‌کند، پس همیشه `src/worker.js` ساخته‌شده را همراهِ تغییرتان کامیت کنید.

### کدام فایل را دست بزنم؟

| بخش | فایل |
|---|---|
| API تلگرام، ارسال/ویرایش پیام | `src/modules/07-telegram.js` |
| مدل‌ها و موتور چت (Workers AI + سازگار با OpenAI) | `src/modules/08-llm.js` |
| ذخیره‌سازی / D1 / حافظهٔ بلندمدت | `src/modules/05-storage-d1.js` |
| یادآور، تودو، تسک زمان‌بندی‌شده | `src/modules/12-reminders.js`، `20-cron.js` |
| کاتالوگِ i18n و زمان‌اجرای `L()` | `src/modules/02-i18n-runtime.js` |
| پیش‌فرض‌ها، شخصیت‌ها، پرامپت‌ها | `src/modules/03-settings.js` |
| داشبورد وب / API اپ | `src/modules/19-dashboard.js`، `21-webapp-api.js` |
| ابزارهای اختیاری (تصویر، صدا، سرچ) | `src/modules/10-voice.js`، `11-tools.js`، `06-vision.js` |
| نقطهٔ ورود، هندلرها، دستورات | `src/modules/22-handlers.js` |

همهٔ ماژول‌ها یک دامنهٔ سراسریِ مشترک دارند (به ترتیبِ
`src/modules/manifest.json` به هم می‌چسبند)، پس تابعی که در یک فایل تعریف
شده در بقیه هم دیده می‌شود — دقیقاً مثل فایل تک‌تکهٔ قبلی.

### مراحلِ کار

```bash
git clone <your fork>
cd behrad-ai
npm install
npm run verify        # بررسیِ بسته + نحو + تست‌ها
```

- برای هر تغییر یک برنچ بسازید (`feat/…`، `fix/…`).
- PRها کوچک و متمرکز باشند؛ بنویسید *چه چیزی* و *چرا*.
- قبل از push آزمون‌ها را بگذرانید؛ CI باید سبز شود.
- پیامِ کامیت: وجهِ امری، مثل `fix: thread env into widget generators`.

### افزودنِ متنِ جدید (ورکر)

1. متنِ فارسی را در محلِ استفاده داخل `L(env, …)` بگذارید و مدخلِ `{ id: { fa, en } }` با جای‌نگهدارهای `%1…%N` به `CAT` اضافه کنید.
2. ترجمهٔ انگلیسی را در همان مدخل بنویسید.
3. `node test/run.mjs` را اجرا کنید — تست‌های i18n توازنِ جای‌نگهدارها را می‌سنجند.

### افزودنِ تنظیمِ جدید

1. به `SETTINGS_DEFAULT` اضافه کنید با کامنتِ فارسی.
2. اگر برای کاربر است، سطرِ منو را در هر دو رابط (تلگرام و وب) اضافه کنید.
3. در تستِ تنظیمات پوششش بدهید.

### گزارشِ باگ

با قالبِ «گزارش باگ» ایشو باز کنید: چه کردید، چه انتظار داشتید، چه شد، و مشخصاتِ استقرار. لطفاً `ADMIN_ID` یا هیچ کلیدی را ننویسید.
