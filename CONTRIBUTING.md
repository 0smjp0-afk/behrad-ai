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
5. **Keep the single-file deployment.** After changing anything in `web/`, run `node tools/build.mjs` so `APP_ASSETS` in `src/worker.js` is refreshed; CI rejects stale bundles.

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
5. **استقرارِ تک‌فایلی حفظ شود.** بعد از هر تغییر در `web/` دستور `node tools/build.mjs` را بزنید تا `APP_ASSETS` تازه شود؛ CI بستهٔ کهنه را رد می‌کند.

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
