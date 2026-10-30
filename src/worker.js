/* ═══════════════════════════════════════════════════════════════════════════
   ⚠️  این فایل ساخته‌شده است — مستقیماً ویرایش نکنید.
   منبع: src/modules/*.js  +  src/generated/app-assets.js (از web/)
   ساختِ دوباره:  npm run build        بررسیِ هم‌خوانی:  npm run build:check
═════════════════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════════════
  🤖 ربات هوش مصنوعی «Behrad AI» — نسخه ۵.۴
  خروجیِ تک‌فایلِ build — چت با مدل‌های Workers AI کلادفلر + سرویس کاستوم سازگار با OpenAI
  + ذخیره‌سازی D1 (بدون KV) + وب‌اپ شیشه‌ای روی /app + تولید تصویر 🎨 با
  GEMINI_API_KEY + صدای گوگل (STT/TTS) + ویجت‌های هوشمند + یادآور
═════════════════════════════════════════════════════════════════════════════
  📖 راهنمای نصب قدم‌به‌قدم (همه‌چیز از مرورگر، بدون نصب هیچ برنامه‌ای):

  ── مرحله ۱: اتصال موتور هوش مصنوعی (Workers AI) — بعد از مرحله ۳ ──
  ۱. Worker ← تب Settings ← Bindings ← Add ← گزینه «Workers AI»
  ۲. Variable name را دقیقاً بنویسید:  AI
  (هیچ کلید API لازم نیست — مدل‌ها مال خود کلادفلر هستند و لیستشان زنده
   استخراج میشود؛ مدل پیش‌فرض ربات: GLM 4.7)

  ── مرحله ۲: ساخت ربات تلگرام ─────────────────────────
  ۱. در تلگرام به @BotFather پیام دهید ← /newbot ← نام و یوزرنیم انتخاب کنید
  ۲. توکن شکل ۱۲۳۴۵۶:AAH... را کپی کنید
  ۳. (اختیاری، برای حالت اینلاین) در BotFather دستور /setinline ← ربات را
     انتخاب کنید ← متن راهنما مثل «سوالت رو بنویس...» بفرستید
  ۴. آیدی عددی خودتان را از @userinfobot بگیرید

  ── مرحله ۳: ساخت Worker در کلادفلر ────────────────────
  ۱. به https://dash.cloudflare.com بروید ← منوی «Workers & Pages»
  ۲. Create ← Create Worker ← یک اسم بدهید (مثلاً ai-bot) ← Deploy
  ۳. روی «Edit code» کلیک کنید ← تمام کد پیش‌فرض را پاک کنید ← کل این فایل
     را Paste کنید ← Deploy

  ── مرحله ۴: اتصال دیتابیس (D1) ──────────────────────────
  ۱. از منوی چپ: «Storage & Databases» ← «D1 SQL Database» ← Create
     اسم دلخواه: ai-bot-data
  ۲. برگردید به Worker ← تب Settings ← Bindings ← Add ← گزینه D1 Database
     Variable name را دقیقاً بنویسید:  DB   و همان دیتابیس را انتخاب کنید
     ← Deploy
  ۳. جدولها خودکار ساخته میشوند (جدول kv با کلید/مقدار/تاریخ انقضا).
     همه‌ی داده‌ها از همان اول روی D1 مینشیند — هیچ وابستگی به KV وجود ندارد.
  چرا D1 و نه KV؟ سقف نوشتن روزانهٔ KV در پلن رایگان ۱٬۰۰۰ است و زود پر
  می‌شود؛ D1 در همان پلن ۱۰۰٬۰۰۰ سطر نوشتن و ۵٬۰۰۰٬۰۰۰ سطر خواندن در روز
  می‌دهد (ریستِ نیمه‌شب UTC، ۵۰۰ مگابایت برای هر دیتابیس).

  ── مرحله ۵: افزودن رمزها (Secrets) ────────────────────────
  Worker ← Settings ← Variables and Secrets ← Add — برای هر ردیف جدول زیر.
  نام‌ها را دقیقاً با همین حروفِ بزرگ و زیرخط بنویسید:
  ┌────────────────────┬──────────────────────────────┬──────────┐
  │ نام متغیر          │ مقدار                        │ ضروری؟   │
  ├────────────────────┼──────────────────────────────┼──────────┤
  │ TELEGRAM_BOT_TOKEN │ توکن BotFather               │ ✅ ضروری │
  │ ADMIN_ID           │ آیدی عددی شما                │ ✅ ضروری │
  │ DASHBOARD_PASSWORD │ رمز ورود وب‌اپ /app و داشبورد │ ✅ ضروری │
  │ OWNER_NAME         │ نامی که ربات با آن معرفی شود │ پیشنهادی │
  │ OWNER_NAME_EN      │ معادل لاتینِ نام (حالت EN)   │ اختیاری  │
  │ WEBHOOK_SECRET     │ یک رشتهٔ تصادفی              │ اختیاری  │
  │ GEMINI_API_KEY     │ کلید Google AI Studio        │ اختیاری  │
  │ SEARCH_API_KEY     │ کلید Tavily (سرچ وب)         │ اختیاری  │
  │ FEATURES           │ خاموش‌کردن ابزارها در کل استقرار │ اختیاری │
  └────────────────────┴──────────────────────────────┴──────────┘
  نوع همه را Secret بگذارید. بعد از هر تغییر: Deploy.

  🔑 GEMINI_API_KEY → تولید تصویر 🎨 (/image) + فهم ویس فارسی 🎙 + تولید صدا 🔊
     اگر نباشد: تصویر و صدای گوگل خاموش می‌شود؛ ویس با Whisper کلادفلر می‌خواند.
  👤 OWNER_NAME → نامی که در شخصیت ربات («هوش مصنوعی شخصیِ …») می‌آید. این راز
     جای نامِ شما را در کد می‌گیرد؛ اگر ست نشود ربات «Owner» می‌گوید.
  🎚 FEATURES → فهرست ابزارهای روشن با کاما؛ نبودن = همه روشن، «none» = همه
     خاموش، مثل «search,sum» فقط سرچ و خلاصه. (تصویر/سرچ کلیدِ خودشان را هم می‌خواهند.)

  ── مرحله ۶: فعال‌سازی یادآور و هشدار مدل جدید (Cron) ─────
  Worker ← تب Settings ← «Triggers / Cron Triggers» ← Add Cron Trigger
  عبارت دقیق زیر را وارد کنید:        * * * * *
  (هر دقیقه بررسی میشود که آیا یادآوری سررسیده یا نه — هزینه ندارد)

  ── مرحله ۷: روشن کردن وب‌هوک ───────────────────────────
  این آدرس را با مقادیر واقعی خودتان در مرورگر باز کنید (یک بار کافی است):
  https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<اسم-ورکر>.<زیردامنه>.workers.dev/webhook&secret_token=<مقدارِ همان WEBHOOK_SECRET>
  باید {"ok":true} ببینید.

  ── سرویس کاستوم (اختیاری — هر ارائه‌دهنده سازگار با OpenAI) ──
  در تلگرام /provideradd بزنید یا دکمه «🔌 سرویس‌های AI» در پنل اصلی:
  ۱. نام سرویس (مثلاً OpenRouter)
  ۲. آدرس پایه API — مثل https://api.openai.com/v1 یا https://openrouter.ai/api
     اگر آدرس به /v1 نیاز داشته باشد و شما نزنید، ربات خودش پیدا و ذخیره میکند
  ۳. کلید API
  سپس ربات خودش با GET /models مدل‌ها را استخراج میکند؛ اگر موفق نشد، نام
  دقیق مدل(ها) را (با ویرگول؛ اختیاری: «my-model 128k» برای کانتکست) دستی
  وارد میکنید. مدل‌ها به منوی 🤖 انتخاب مدل و ⚔️ مقایسه اضافه میشوند.
  مدیریت از /providers یا همان دکمه: ✏️ نام · 🔗 آدرس · 🔑 کلید · 🔄 کاوش
  مجدد (ادغام میشود؛ مدل‌های دستی هرگز حذف نمی‌شوند) · ➕ مدل دستی ·
  📏 کانتکست · 🗑 حذف مدل · 🗑 حذف سرویس (کاربران فعال خودکار به GLM
  پیش‌فرض برمیگردند). حداکثر ۱۵ سرویس، هر سرویس تا ۵۰ مدل.
  نمونه‌ها: OpenRouter، Groq، Together، DeepSeek، vLLM، LM-Studio، Ollama…
  ⚠️ فقط سرویس‌های «سازگار با OpenAI Chat Completions» پشتیبانی میشوند
  (endpoint های /chat/completions و /models). API نیتیو Claude یا Gemini
  مستقیم کار نمیکنند — باید از یک درگاه سازگار استفاده کنید.
  🔒 کلید API در همان D1 ربات ذخیره میشود و همه‌جا (تلگرام، داشبورد، لاگ
  خطاها) ماسک نمایش داده میشود؛ در بکاپ کاربر هم قرار نمی‌گیرد.
  💰 فالبک خودکار هرگز شما را روی سرویس پولی نمی‌بَرَد؛ خطای سرویس کاستوم
  (جز خطای خودِ کلید/آدرس) با سوییچ به مدل رایگان کلادفلر رد می‌شود.

  ── عکس و ویژن 👁 ──────────────────────────────────────
  عکس (یا عکس با کپشن) بفرستی، به مدل عکس‌فهم فرستاده می‌شود:
  • مدل‌های کلادفلر: هر مدلی که «vision / llava / vl» در آیدیش باشد
    (مثل @cf/meta/llama-3.2-11b-vision-instruct)
  • مدل‌های کاستوم: در /providers ← آن سرویس ← دکمه 👁 روی مدل بزن تا
    عکس‌فهم علامت بخورد (پیش‌فرض: عکس‌فهم نیست)
  اگر مدل فعال عکس نفهمد، همان پیام خودکار با مدل ویژن تحلیل می‌شود و
  تنظیم ذخیره‌شده‌ات عوض نمی‌شود (خاموش‌کردنش: ⚙️ تنظیمات ← 👁 عکس).
  عکس در تاریخچه ذخیره نمی‌شود (فقط یک نشانهٔ متنی می‌ماند) تا حافظه پر نشود.

  ── مرحله ۸: شروع! ─────────────────────────────────────
  در تلگرام به رباتتان /start بدهید. 🎉
  وب‌داشبورد:  https://<اسم-ورکر>.workers.dev/dashboard  (با DASHBOARD_PASSWORD)
  وب‌اپ موبایل: https://<اسم-ورکر>.workers.dev/app       (همان رمز؛ خروجی PWA)

  ⚙️ تنظیمات دلخواه: کمی پایین‌تر در همین فایل سه بلوک با توضیح فارسی هست —
  «CFG» (سقف‌ها و زمان‌ها: تعداد سرویس، مدل هر سرویس، مهلت پاسخ، فاصله ویرایش
  زنده، سقف تاریخچه و…)، «SETTINGS_DEFAULT» (مقادیر شروع هر کاربر: مدل، دما،
  سقف روزانه و…) و «PERSONAS» (شخصیت‌ها). همه‌ی تنظیم‌پذیرها همان‌جا جمع شده‌اند.

  ── عیب‌یابی سرویس کاستوم ───────────────────────────────
  • «🔑 کلید API رد شد» → /providers ← آن سرویس ← «🔑 کلید» و کلید تازه بفرست
  • «📡 در دسترس نیست» → آدرس یا اتصال را چک کن (از لاگ Live کلادفلر هم معلوم است)
  • «🧭 مدل یا آدرس پیدا نشد» → «🔗 آدرس» را درست کن، یا «➕ مدل دستی» با
    آیدی دقیقِ همان سرویس اضافه کن، یا «🔄 کاوش مدل» بزن
  • کاوش /models شکست خورد → طبیعی است؛ خیلی سرویس‌ها نمی‌گذارند. مدل دستی بزن

  ── عیب‌یابی سریع ────────────────────────────────────────
  • ربات جواب نمیدهد → آدرس getWebhookInfo را باز کنید:
    https://api.telegram.org/bot<TOKEN>/getWebhookInfo
    اگر last_error دارد: وب‌هوک را دوباره ست کنید / Secret را چک کنید
  • خطای «Binding AI» → مرحله ۱ را دقیقاً با اسم AI انجام دهید
  • خطای 404 مدل → مدل منقضی شده؛ منوی 🤖 انتخاب مدل ← دکمه 🔄 لیست تازه
  • خطای 429 → سقفِ Neurons پلن رایگان (۱۰٬۰۰۰ در روز، ریستِ نیمه‌شب UTC)
    پر شده؛ فردا دوباره کار می‌کند، یا پلن Workers را ارتقا دهید. فالبک
    خودکار به مدل مطمئن، کار را تا حدی راه می‌اندازد.
  • خطای 1102 / قطع وسطِ کار → سقفِ CPU پلن رایگان فقط ۱۰ میلی‌ثانیه در
    هر درخواست است؛ پردازشِ محلیِ سنگین (PDF بزرگ، تاریخچهٔ خیلی بلند) به
    آن می‌خورد. درخواست را کوچک‌تر کنید یا پلنِ ۵ دلاری بگیرید.
  • پاسخ‌های بسیار طولانی وسطه قطع شدند → محدودیتِ CPU/زمانِ پلن رایگان؛
    پلن ۵ دلاری کاملاً حل می‌کند
  • یادآور کار نمیکند → Cron Trigger مرحله ۶ را چک کنید

  🔒 امنیت: ربات فقط با ADMIN_ID شما و کاربرانی که خودتان در پنل «کاربران
  مجاز» اضافه کنید کار میکند. بقیه پیام «دسترسی ندارید» میگیرند.
════════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 01-core-constants
   VERSION + مدل‌های آشنا + رجکس‌های ویژن
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ ثابت‌های سرویس‌ها ═══════════════════ */
const VERSION = '5.4.0';
const TG_BASE = 'https://api.telegram.org';

// ═══ مدل‌های آشنا ═══ فقط برای «نام زیبا» و «سقف کانتکست دقیق» در منوها؛
// اگر مدلی اینجا نباشد هم کار میکند (نامش از آیدی استخراج و کانتکست
// CFG.DEFAULT_CTX در نظر گرفته میشود). ctx = کانتکست (توکن).
const CF_KNOWN = [
  { id: '@cf/zai-org/glm-4.7-flash', ctx: 200000, name: 'GLM 4.7 Flash ⭐' },
  { id: '@cf/openai/gpt-oss-120b', ctx: 128000, name: 'GPT-OSS 120B ⭐' },
  { id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast', ctx: 32000, name: 'Llama 3.3 70B' },
  { id: '@cf/meta/llama-3.1-8b-instruct-fp8-fast', ctx: 128000, name: 'Llama 3.1 8B' },
  { id: '@cf/meta/llama-3.1-8b-instruct', ctx: 128000, name: 'Llama 3.1 8B' },
  { id: '@cf/qwen/qwen2.5-coder-32b-instruct', ctx: 32000, name: 'Qwen2.5 Coder 32B' },
  { id: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', ctx: 80000, name: 'DeepSeek R1 Distill 32B' },
  { id: '@cf/mistralai/mistral-small-3.1-24b-instruct', ctx: 128000, name: 'Mistral Small 3.1' },
  { id: '@cf/meta/llama-3.2-11b-vision-instruct', ctx: 128000, name: 'Llama 3.2 11B Vision 👁' },
];

// ═══ مدل‌های عکس‌فهم (ویژن) ═══ هر مدلی که یکی از این کلمات در آیدیش باشد
// عکس‌فهم شمرده می‌شود. برای مدل‌های کاستوم حدسی زده نمی‌شود؛ خودت در
// «🔌 سرویس‌ها» با دکمه 👁 علامتش می‌زنی.
const VISION_RE = /vision|llava|internvl|pixtral|idefics|[-/.]vl[-/.]|vl$/i;
// نشانهٔ مدل ویژن در آیدی کاستوم؛ برای ادغام «x-vl» و «x» در منوی مدل‌ها
const VISION_ID_SUFFIX = /[-_.]?(vl|vision)$/i;

// ═══ مدل اضطراری ═══ وقتی مدل اصلی خطا دهد و «🔄 فالبک» روشن باشد، خودکار
// به این مدل کلادفلر سوییچ میشود (ارزان و در دسترس). مدل کاستوم خراب هم فقط
// به همین‌جا برمی‌گردد — هرگز به سرویس پولی دیگری نمی‌رود.
const CF_FALLBACK_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8-fast';

// ═══ تنظیمات پیش‌فرض هر کاربر ═══ (هر کاربر جدید از این مقادیر شروع میکند؛
// مقدار قبلیِ کاربرهای موجود دست‌نخورده می‌ماند. از منوی ⚙️ تلگرام یا داشبورد
// هم قابل تغییرند — اینجا فقط «نقطه شروع» را عوض میکنی)
const SETTINGS_DEFAULT = {
  model: '@cf/zai-org/glm-4.7-flash', // 🧠 مدل پیش‌فرض: GLM 4.7 Flash (آیدی را از منوی 🤖 یا لیست CF_KNOWN بالا بردار)
  temperature: 0.8,      // 🌡 خلاقیت: ۰ = دقیق و خشک، ۱ = خلاقانه؛ معمول ۰.۷ تا ۰.۹
  maxTokens: 2048,       // 📝 سقف طول پاسخ (توکن). هر توکن ≈ ۳-۴ کاراکتر انگلیسی. بالا بردنش = پاسخ‌های بلندتر و مصرف بیشتر
  dailyLimit: 0,         // ⛽ سقف مصرف روزانه به «هزار توکن»؛ ۰ یعنی بی‌سقف
  autoFallback: true,    // 🔄 اگر مدل اصلی خطا داد، خودکار روی مدل امن کلادفلر بنشیند (سرویس کاستوم → همیشه به lane رایگان CF، نه سرویس پولی دیگر)
  liveStream: true,      // ✍️ نمایش زنده حروف پاسخ حین تولید (پیام را چند بار ویرایش میکند؛ خاموش = صبر تا کامل بنویسد و یک‌جا بفرستد)
  readLinks: true,       // 🌐 لینک داخل پیامت باشد، محتوای صفحه را میخواند و به مدل میدهد
  persona: 0,            // 🎭 شخصیت پیش‌فرض = اندیس در لیست PERSONAS پایین (۰ = دستیار شخصی)
  autoVision: true,      // 👁 اگر پیام عکس داشت و مدل فعال عکس نمی‌فهمید، خودکار با مدل ویژن کلادفلر تحلیل شود
  sysCustom: '',         // ✏️ پرامپت سیستمی اضافی دلخواه (سقف طولش: CFG.SYS_CUSTOM_MAX)
  voiceReply: false,     // 🔊 جواب صوتی به ویس‌ها: پیش‌فرض متنی؛ از تنظیمات روشن میشود
  voiceProv: 'google',   // 🎙 موتور صدا: google (Gemini AI Studio) یا cf (Whisper/MeloTTS) — بدون کلید گوگل خودکار به cf برمی‌گردد
  ttsModel: 'gemini-3.8-flash-tts', // 🗣 مدل تولید صدای گوگل (TTS)
  voiceName: 'Kore',     // نام وویس گوگل (۳۰ گزینه)
  sttModel: 'gemini-3.5-transcribe', // 🎤 مدل فهم ویس فارسی گوگل (STT) — حتماً باید الفبای فارسی بدهد، نه فینگلیش
  imgGen: true,          // 🎨 تولید تصویر با /image: روشن/خاموش (با کلید GEMINI_API_KEY)
  imgFree: true,         // 🆓 اگر کلید گوگل نبود یا ۴۲۹ داد، pollinations رایگان عکس بسازد
  imgModel: 'gemini-3.1-flash-lite-image', // 🖼 مدل پیش‌فرض تولید تصویر گوگل
  imgEdit: true,         // 🖌 عکس بفرست + توضیح بده → ویرایش همان عکس (با مدل تصویر گوگل)
  briefing: true,        // 🌅 خلاصه صبحگاهی ساعت ۱۰ تهران: روشن/خاموش
  searchAuto: true,      // 🔎 سرچ خودکار Tavily وقتی لازم است (دستی همیشه با /web)
  nlRemind: true,        // 🗣 تشخیص خودکار قصد یادآور/تودو از متن آزاد (بدون /remind)
  cbBreaker: true,       // 🔌 سرویس کاستومی که خطا داد چند دقیقه کنار گذاشته شود
  memAuto: true,         // 🧠 استخراج خودکار خاطره از گفتگو
  ytSum: true,           // 🎬 لینک یوتیوب → خواندن زیرنویس و خلاصه کردن
  weeklyBackup: true,    // 🗄 بکاپ خودکار هفتگی در Saved Messages
  lang: 'fa',           // 🌐 زبانِ ربات: fa (فارسی) یا en (English) — از منوی ⚙️ هم عوض می‌شود
};

/* ═══ کاتالوگِ دوزبانه ═══ هر کلید = شناسهٔ متن؛ fa/en با جای‌نگهدار %1..%N */
const CAT = {"m139f00c":{"fa":"Binding «DB» تنظیم نشده — مرحله ۴ راهنما","en":"The \"DB\" binding is not set — see step 4 of the guide"},"m0tu90xp":{"fa":"D1 در دسترس نیست","en":"D1 is not available"},"m0k4q31x":{"fa":"<code>%1</code> +%2 کلید دیگر","en":"<code>%1</code> +%2 more keys"},"m0afmn11":{"fa":"این عکس را تحلیل کن.","en":"Analyze this image."},"m0782kha":{"fa":"؟","en":"?"},"m0b4m9n9":{"fa":"binding AI تنظیم نشده","en":"The AI binding is not set"},"m1vcg84s":{"fa":"\n\nدستورالعمل اضافی کاربر (اولویت بالا):\n%1","en":"\n\nExtra user instructions (high priority):\n%1"},"m05capdd":{"fa":"🧩 Binding هوش مصنوعی تنظیم نشده!\nراه‌حل: داشبورد کلادفلر ← Worker ← Settings ← Bindings ← Add ← Workers AI با اسم دقیق AI (مرحله ۱ راهنما).","en":"🧩 The AI binding is not set!\nFix: Cloudflare Dashboard ← Worker ← Settings ← Bindings ← Add ← Workers AI with the exact name AI (step 1 of the guide)."},"m0yh8z4o":{"fa":"📜 این مدل (خانوادهٔ لاما) بار اول مجوز میخواهد — یکبار دیگر امتحان کن؛ ربات خودکار «agree» میفرستد و کار راه میافتد.","en":"📜 This model (Llama family) asks for permission the first time — try once more; the bot sends \"agree\" automatically and it will work."},"m0ijnyp9":{"fa":"🧭 این مدل دیگر موجود نیست (لیست مدل‌ها تغییر کرده).\nراه‌حل: از منوی 🤖 انتخاب مدل، دکمه 🔄 لیست تازه را بزن و مدلی انتخاب کن.","en":"🧭 This model is no longer available (the model list has changed).\nFix: open the 🤖 model menu, press 🔄 to refresh the list, and pick a model."},"m1pw5tdo":{"fa":"⛽ سقف Neurons پلن فعلی تمام شد یا محدودیت نرخ خورد.\nچند لحظه بعد دوباره امتحان کنید؛ برای مصرف بیشتر پلن Workers را ارتقا دهید.\n(یا «🔄 فالبک» را در تنظیمات روشن بگذارید تا خودکار مدل جایگزین برود)","en":"⛽ Your current plan's Neuron quota is exhausted or you hit a rate limit.\nTry again in a few minutes; upgrade the Workers plan for more usage.\n(Or turn on \"🔄 Fallback\" in the settings so the bot switches to a backup model automatically)"},"m19dgteb":{"fa":"📏 پیام‌ها از کانتکست مدل بزرگ‌تر شده!\nراه‌حل: با /new گفتگوی تازه شروع کنید یا مدلی با کانتکست بزرگ‌تر بگیرید.","en":"📏 The messages exceed the model's context window!\nFix: start a fresh chat with /new, or switch to a model with a larger context."},"m0k7yabp":{"fa":"⏳ زمان انتظار پاسخ مدل تمام شد — دوباره امتحان کنید.","en":"⏳ Timed out waiting for the model — try again."},"m0geupfq":{"fa":"⚠️ خطای غیرمنتظره از مدل: <code>%1</code>","en":"⚠️ Unexpected error from the model: <code>%1</code>"},"m0t8bfm5":{"fa":"جریان پاسخ ناقص ماند — دوباره تلاش کنید.","en":"The response stream was incomplete — try again."},"m1trjnig":{"fa":"پاسخی از مدل دریافت نشد — دوباره تلاش کنید.","en":"No response from the model — try again."},"m0bo17ie":{"fa":"مدل چند بار مشغول بود؛ لطفاً دوباره تلاش کنید.","en":"The model was busy several times; please try again."},"m0cd8thb":{"fa":"🔌 سرویس «%1» چند بار خطا داد و موقتاً کنار گذاشته شد — چند دقیقهٔ دیگر خودکار برمیگردد.","en":"🔌 The service \"%1\" failed several times and was temporarily disabled — it will come back automatically in a few minutes."},"m0xbyneb":{"fa":"📡 سرویس «%1» در دسترس نیست — آدرس یا اتصال را بررسی کنید.","en":"📡 The service \"%1\" is unreachable — check the URL or your connection."},"m1m6a063":{"fa":"🔑 کلید API سرویس «%1» رد شد — از «🔌 سرویس‌ها» کلید را اصلاح کن.","en":"🔑 The API key for the service \"%1\" was rejected — fix the key under \"🔌 Services\"."},"m0hoqsmy":{"fa":"🧭 مدل یا آدرس سرویس «%1» پیدا نشد — در «🔌 سرویس‌ها» آدرس/مدل را چک یا 🔄 کاوش کن.","en":"🧭 The model or URL of the service \"%1\" was not found — check the URL/model under \"🔌 Services\" or 🔄 probe it."},"m1hzo9wt":{"fa":"⛽ محدودیت نرخ در «%1» — کمی بعد امتحان کنید.","en":"⛽ Rate limit reached at \"%1\" — try again shortly."},"m0pzr5p7":{"fa":"🔌 «%1» خطای موقت %2 داد — کمی بعد امتحان کنید.","en":"🔌 \"%1\" returned a temporary error %2 — try again shortly."},"m0ywwp7s":{"fa":"📏 کانتکست مدل «%1» پر شده — با /new شروع کنید یا کانتکست مدل را کمتر کنید.","en":"📏 The context of the model \"%1\" is full — start with /new or reduce the model's context."},"m0zcl66u":{"fa":"⚠️ «%1» خطای %2 داد.","en":"⚠️ \"%1\" returned error %2."},"m0wzvs2h":{"fa":"📦 پاسخ «%1» فرمت شناخته‌شده نداشت (HTTP %2).","en":"📦 The response from \"%1\" had an unrecognized format (HTTP %2)."},"m0oilrtb":{"fa":"🔌 «%1» چند بار پاسخ نداد؛ کمی بعد امتحان کنید.","en":"🔌 \"%1\" did not respond several times; try again shortly."},"m0docj9h":{"fa":"برای جستجو حداقل %1 حرف بفرست.","en":"Send at least %1 characters to search."},"m1krzef8":{"fa":"گروه جاری","en":"Current group"},"m0y549rx":{"fa":"🙋 شما","en":"🙋 You"},"m0rmapm3":{"fa":"🤖 ربات","en":"🤖 Bot"},"m0014jqj":{"fa":"حافظه بلندمدت {{owner}} (هویت/پروژه‌ها/علاقه‌ها — در جواب‌ها لحاظ کن):\n%1\n\n","en":"{{owner}}'s long-term memory (identity/projects/interests — take them into account in the answers):\n%1\n\n"},"m1tofqi9":{"fa":"🌐 در حال خواندن %1 ...","en":"🌐 Reading %1 ..."},"m1u2656m":{"fa":"— صفحه %1 خوانده نشد (آدرس خصوصی/نامعتبر است) —","en":"— Page %1 could not be read (private or invalid URL) —"},"m0s75bnj":{"fa":"— محتوای صفحه %1 (%2) —\n%3%4","en":"— Page %1 content (%2) —\n%3%4"},"m1dk9uoo":{"fa":"\n[... متن بریده شد]","en":"\n[... text truncated]"},"m04jjex3":{"fa":"— صفحه %1 قابل خواندن نبود (%2) —","en":"— Page %1 could not be read (%2) —"},"m1f6ec9b":{"fa":"\n\n📚 محتوای وب خوانده‌شده برای تحلیل:\n%1","en":"\n\n📚 Web content read for analysis:\n%1"},"m1mkkwk3":{"fa":"GEMINI_API_KEY تنظیم نشده است (Worker ← Settings ← Secrets).","en":"GEMINI_API_KEY is not set (Worker ← Settings ← Secrets)."},"m0v3kc92":{"fa":"این ویس را بنویس.","en":"Transcribe this voice message."},"m0z2h7di":{"fa":"سقف رایگان گوگل تمام شد (429) — کمی بعد یا با موتور CF.","en":"The free Google quota is exhausted (429) — try again later, or use the CF engine."},"m0ibw2xu":{"fa":"مدل %1 قبول نکرد (%2)","en":"Model %1 rejected it (%2)"},"m0ygfxpe":{"fa":"خطای گوگل %1 %2","en":"Google error %1 %2"},"m1r518my":{"fa":"ورودی بلوکه شد: %1","en":"Input blocked: %1"},"m0iirtmi":{"fa":"مدل %1 متنی برنگرداند","en":"Model %1 returned no text"},"m0xu2xv6":{"fa":"گوگل متنی برنگرداند.","en":"Google returned no text."},"m1300qjh":{"fa":"متن کامل این سند PDF را بدون خلاصه‌کردن و بدون دست‌کاری استخراج کن. جدول‌ها و فهرست‌ها را با متن ساده بنویس، اعداد و نام‌ها را عیناً نگه دار. هیچ توضیحی اضافه نکن و فقط متن سند را بده.","en":"Extract the full text of this PDF document without summarizing and without altering it. Write tables and lists as plain text, and keep all numbers and names exactly as they are. Do not add any explanation — return only the document text."},"m1tvgg96":{"fa":"سقف رایگان گوگل تمام شد (429) — کمی بعد دوباره بفرست.","en":"The free Google quota is exhausted (429) — send it again later."},"m1f8675x":{"fa":"مدل %1 این PDF را قبول نکرد (%2)","en":"Model %1 rejected this PDF (%2)"},"m1dncruw":{"fa":"گوگل متن PDF را برنگرداند.","en":"Google returned no PDF text."},"m1mmplej":{"fa":"متن خالی.","en":"Empty text."},"m0kpcin1":{"fa":"این متن را به فارسی روان و طبیعی با صدای انتخابی بخوان:\n%1","en":"Read this text aloud in fluent, natural Persian using the selected voice:\n%1"},"m19k19o9":{"fa":"سقف رایگان گوگل تمام شد (429).","en":"The free Google quota is exhausted (429)."},"m1jr3y73":{"fa":"مدل %1 صدا نداد (%2)","en":"Model %1 produced no audio (%2)"},"m1il87ot":{"fa":"خطای TTS گوگل %1 %2","en":"Google TTS error %1 %2"},"m0nfs8zg":{"fa":"مدل %1 صدایی برنگرداند","en":"Model %1 returned no audio"},"m0k4zmrk":{"fa":"گوگل صدایی برنگرداند.","en":"Google returned no audio."},"m0ag5krm":{"fa":"توصیف تصویر خالی است. فرمت: <code>/image گربه‌ای روی تپه</code>","en":"The image prompt is empty. Format: <code>/image a cat on a hill</code>"},"m0q8y2ht":{"fa":"موتور تصویر رایگان %1 داد: %2","en":"The free image engine returned %1: %2"},"m0gjmbaj":{"fa":"تصویر رایگان خالی یا خراب برگشت.","en":"The free image came back empty or corrupted."},"m12tsv4m":{"fa":"تصویر رایگان بیش از حد بزرگ است.","en":"The free image is too large."},"m0txxoug":{"fa":"موتور رایگان تصویر برنگرداند (%1).","en":"The free image engine returned no image (%1)."},"m0tt8pbw":{"fa":"رایگان (Pollinations/FLUX)","en":"Free (Pollinations/FLUX)"},"m0n09w9i":{"fa":"توضیح ویرایش خالی است. مثال: <code>آسمان را غروب کن</code>","en":"The edit prompt is empty. Example: <code>turn the sky into a sunset</code>"},"m1uy9uyh":{"fa":"ویرایش عکس به <code>GEMINI_API_KEY</code> نیاز دارد (Worker ← Settings ← Secrets).\nبرای تولید تصویر بدون کلید از <code>/image</code> استفاده کن.","en":"Photo editing requires <code>GEMINI_API_KEY</code> (Worker ← Settings ← Secrets).\nTo generate images without a key, use <code>/image</code>."},"m09kujhd":{"fa":"عکسی برای ویرایش نبود — عکس را همراه توضیح (کپشن) بفرست.","en":"No photo to edit — send a photo with an instruction (caption)."},"m1jguqm2":{"fa":"سقف رایگان گوگل تمام شد (429) — کمی بعد دوباره امتحان کن.","en":"The free Google quota is exhausted (429) — try again later."},"m1hqu7fu":{"fa":"مدل %1 ویرایش را قبول نکرد (%2)","en":"Model %1 rejected the edit (%2)"},"m1oja2mt":{"fa":"ویرایش توسط سیاست‌های گوگل رد شد: %1","en":"The edit was rejected by Google's policies: %1"},"m07sawkt":{"fa":"تصویر تولیدشده بیش از حد بزرگ است.","en":"The generated image is too large."},"m0etycr3":{"fa":"مدل %1 تصویری برنگرداند","en":"Model %1 returned no image"},"m1f5guho":{"fa":"ویرایش عکس انجام نشد.","en":"The photo edit failed."},"m0e6n638":{"fa":"GEMINI_API_KEY تنظیم نشده است — برای تولید تصویر لازم است (Worker ← Settings ← Secrets).","en":"GEMINI_API_KEY is not set — it is required for image generation (Worker ← Settings ← Secrets)."},"m18fhtg6":{"fa":"سقف روزانهٔ گوگل تمام شد (429)","en":"Google's daily quota is exhausted (429)"},"m059mjt5":{"fa":"توصیف تصویر توسط سیاست‌های گوگل رد شد: %1","en":"The image prompt was rejected by Google's policies: %1"},"m1407yf8":{"fa":"%1 · فالبک رایگان هم جواب نداد: %2","en":"%1 · The free fallback didn't work either: %2"},"m07h72dx":{"fa":"تصویری تولید نشد.","en":"No image was generated."},"m1g0tw8h":{"fa":"کاربر: ","en":"User: "},"m1phc68b":{"fa":"دستیار: ","en":"Assistant: "},"m14uzdrv":{"fa":"از گفتگوی زیر فقط حقایق پایدار درباره کاربر استخراج کن: هویت/نام، پروژه‌ها، علاقه‌ها، موضوعات مهم. هر حافظه در یک خط کوتاه فارسی (حداکثر ۱۰ خط). اگر چیز تازه‌ای نیست فقط بنویس: NONE. فقط لیست یا NONE.","en":"Extract only durable facts about the user from the conversation below: identity/name, projects, interests, important topics. Each memory on a single short line (max 10 lines). If there is nothing new, write only: NONE. Just the list or NONE."},"m1khkbmk":{"fa":"این متن را خلاصه کن%1:\n\n%2","en":"Summarize this text%1:\n\n%2"},"m1rqktif":{"fa":"%1\n\nاین بخش %2 از %3 است؛ فقط نکات همین بخش را فشرده بده.","en":"%1\n\nThis is section %2 of %3; compress only the key points of this section."},"m12f27gh":{"fa":"### بخش %1\n%2","en":"### Section %1\n%2"},"m0jtj6so":{"fa":"خلاصه‌سازی بخش‌ها شکست خورد — دوباره تلاش کن.","en":"Section summarization failed — try again."},"m1i8f55l":{"fa":"%1\n\n%2\n\nچند خلاصهٔ بخش‌به‌بخش داری؛ یک خلاصهٔ نهایی یکدست بده و تکرارها را حذف کن.","en":"%1\n\n%2\n\nYou have several section-by-section summaries; produce one coherent final summary and remove any repetitions."},"m012u9x3":{"fa":"عنوان: %1\n\n","en":"Title: %1\n\n"},"m1mxuwf4":{"fa":"SEARCH_API_KEY تنظیم نشده (Worker ← Settings ← Variables and Secrets).","en":"SEARCH_API_KEY is not set (Worker ← Settings ← Variables and Secrets)."},"m0yfcpfv":{"fa":"کلید Tavily رد شد (SEARCH_API_KEY را چک کن).","en":"Tavily key rejected (check SEARCH_API_KEY)."},"m07t3pjs":{"fa":"خطای Tavily HTTP %1","en":"Tavily HTTP error %1"},"m1x9w9nk":{"fa":"پاسخ مستقیم:\n%1\n\n","en":"Direct answer:\n%1\n\n"},"m1hy4g2y":{"fa":"نتیجه‌ای نبود.","en":"No results found."},"m0snzrp4":{"fa":"هواشناسی در دسترس نیست.","en":"Weather is unavailable."},"m0i28j95":{"fa":"هوای نیشابور (الان): دما %1°C، رطوبت %2٪، باد %3km/h. بیشینه/کمینه فردا: %4/%5°C، احتمال بارش: %6٪.","en":"Nishapur weather (now): temperature %1°C, humidity %2%, wind %3km/h. Tomorrow's high/low: %4/%5°C, chance of precipitation: %6%."},"m1s5pm7h":{"fa":"قیمت کریپتو در دسترس نیست.","en":"Crypto prices are unavailable."},"m09v7775":{"fa":"BTC: $%1 · ETH: $%2 (CoinGecko، لحظه‌ای).","en":"BTC: $%1 · ETH: $%2 (CoinGecko, live)."},"m1rcl01p":{"fa":"عبارت ریاضی خالی است.","en":"The math expression is empty."},"m04ay7hd":{"fa":"تقسیم بر صفر.","en":"Division by zero."},"m1udosa7":{"fa":"محاسبه نشد.","en":"Could not compute."},"m0qhk4og":{"fa":"🧮 محاسبه: %1 = %2","en":"🧮 Calculation: %1 = %2"},"m0bfh0iq":{"fa":"🧮 محاسبه نشد (%1)","en":"🧮 Calculation failed (%1)"},"m1hohx9w":{"fa":"🌤 در حال گرفتن هوای نیشابور ...","en":"🌤 Fetching Nishapur weather ..."},"m1a53mxk":{"fa":"💰 در حال گرفتن قیمت کریپتو ...","en":"💰 Fetching crypto prices ..."},"m13mn28d":{"fa":"🔎 در حال جستجوی وب ...","en":"🔎 Searching the web ..."},"m05dz4kl":{"fa":"🔎 نتایج جستجوی وب (Tavily) برای «%1»:\n%2","en":"🔎 Web search results (Tavily) for “%1”:\n%2"},"m1in1ufb":{"fa":"🔎 سرچ نشد: %1","en":"🔎 Search failed: %1"},"m0j0hd75":{"fa":"\n\n🧰 نتایج ابزارها (در جواب فارسی لحاظ کن، منبع را بگو):\n%1","en":"\n\n🧰 Tool results (take them into account in your answer and cite the source):\n%1"},"m0dgo48x":{"fa":"Binding AI تنظیم نشده.","en":"Binding AI is not configured."},"m0jtid39":{"fa":"متن ویس تشخیص داده نشد.","en":"Voice message could not be transcribed."},"m1c1943k":{"fa":"🔊 صدای تولیدشده (WAV ۲۴ کیلوهرتز)","en":"🔊 Generated audio (WAV 24 kHz)"},"m1mtscmq":{"fa":"⛽ سهمیهٔ تصویر امروزت پر شد (%1 عکس). فردا دوباره فعال می‌شود.","en":"⛽ Your daily image quota is full (%1 images). It resets tomorrow."},"m095kqe9":{"fa":"اصلی","en":"Main"},"m09y06ue":{"fa":"⛽ سقف مصرف روزانه شما پر شد (%1K توکن).\nبرای تغییر یا برداشتن سقف: ⚙️ تنظیمات ← سقف روزانه","en":"⛽ You have reached your daily usage limit (%1K tokens).\nTo change or remove the limit: ⚙️ Settings ← Daily limit"},"m1atr754":{"fa":"%1 <i>دارم فکر میکنم...</i>","en":"%1 <i>Thinking...</i>"},"m0ylbfz3":{"fa":"⚔️ <b>مقایسه مدل‌ها</b>\n\n🅰️ 🅱️ هر دو مدل همزمان در حال نوشتن...","en":"⚔️ <b>Model comparison</b>\n\n🅰️ 🅱️ Both models are writing at the same time..."},"m1hbrg4g":{"fa":"🖼 مدل %1 عکس نمی‌فهمد.","en":"🖼 Model %1 cannot understand images."},"m12tkrii":{"fa":"اول","en":"First"},"m0fh2tgl":{"fa":"دوم","en":"Second"},"m0opv2xb":{"fa":"خطا","en":"Error"},"m09qlg2a":{"fa":"🖼 <i>%1 عکس ارسال شد — فقط مدل‌های دارای 👁 آن را دیدند.</i>","en":"🖼 <i>%1 image(s) sent — only models with 👁 could see them.</i>"},"m147xw31":{"fa":"♻️ خروج از حالت مقایسه","en":"♻️ Exit comparison mode"},"m1hlllrf":{"fa":"[مقایسه] %1","en":"[Comparison] %1"},"m0w9mkno":{"fa":"🖼 <b>مدل فعال عکس نمی‌فهمد.</b>\nاز منوی 🤖 یک مدل با نشان 👁 انتخاب کن یا در ⚙️ «👁 عکس» را روشن کن.","en":"🖼 <b>The active model cannot understand images.</b>\nPick a model with the 👁 badge from the 🤖 menu, or turn on “👁 Images” in ⚙️."},"m131yarz":{"fa":"🖼 <b>مدل عکس‌فهمی در دسترس نیست.</b>\nاز منوی 🤖 مدل دارای نشان 👁 را انتخاب کن (یا سرویس کاستوم را با 👁 علامت بزن).","en":"🖼 <b>No vision-capable model is available.</b>\nChoose a model with the 👁 badge from the 🤖 menu (or mark your custom service with 👁)."},"m0xly8zo":{"fa":" · این پیام با %1 (عکس‌فهم) تحلیل شد — مدل فعال شما دست‌نخورده ماند","en":" · This message was analyzed with %1 (vision) — your active model stays unchanged"},"m0hvve17":{"fa":"⚠️ %1\n🔄 <i>سوییچ خودکار به %2</i>","en":"⚠️ %1\n🔄 <i>Switching automatically to %2</i>"},"m0hwj8vq":{"fa":"📷 %1 عکس پیوست شد","en":"📷 %1 image(s) attached"},"m0306yaz":{"fa":"\n\n<i>%1%2 · ⏱ %3 ثانیه%4</i>","en":"\n\n<i>%1%2 · ⏱ %3 seconds%4</i>"},"m1jvno1f":{"fa":" · %1 توکن","en":" · %1 tokens"},"m1ivrg4n":{"fa":"♻️ تولید مجدد","en":"♻️ Regenerate"},"m04607zy":{"fa":"📌 ذخیره","en":"📌 Save"},"m1rq6ppp":{"fa":"🧹 گفتگوی تازه","en":"🧹 New chat"},"m0giln1r":{"fa":"⚙️ تنظیمات","en":"⚙️ Settings"},"m1nnd31k":{"fa":"خطای نامشخص","en":"Unknown error"},"m0yxhz1s":{"fa":"🧹 شروع تازه","en":"🧹 Fresh start"},"m0h5v7yd":{"fa":"%1 <b>خطا:</b>\n%2","en":"%1 <b>Error:</b>\n%2"},"m1lvln25":{"fa":"── ☁️ Workers AI کلادفلر ──","en":"── ☁️ Cloudflare Workers AI ──"},"m1xwo61m":{"fa":"(مدلی یافت نشد — 🔄 را بزن)","en":"(No model found — tap 🔄)"},"m0xu8uz9":{"fa":"🔄 لیست تازه از کلادفلر","en":"🔄 Refresh list from Cloudflare"},"m0rymzdf":{"fa":"🤖 <b>انتخاب مدل</b> — کلادفلر ☁️ + سرویس‌های کاستوم 🔌\n\nفعال: <b>%1</b> · %2 · کانتکست <b>%3K</b>\n\nمدل‌های کلادفلر زنده از حساب شما استخراج میشوند + مدل‌هایی که خودتان به سرویس‌های کاستوم افزوده‌اید 👇","en":"🤖 <b>Choose a model</b> — Cloudflare ☁️ + custom services 🔌\n\nActive: <b>%1</b> · %2 · context <b>%3K</b>\n\nCloudflare models are pulled live from your account, plus the models you added to your custom services 👇"},"m1gfk5sg":{"fa":"🏠 منوی اصلی","en":"🏠 Main menu"},"m12pftld":{"fa":"🔙 بازگشت","en":"🔙 Back"},"m11dxfum":{"fa":"🧠 <b>حافظه بلندمدت</b> (%1/%2)\n\n","en":"🧠 <b>Long-term memory</b> (%1/%2)\n\n"},"m1aq8wn1":{"fa":"هنوز چیزی ذخیره نشده. خودکار از حرف‌هایت یاد می‌گیرم، یا با /remember اضافه کن.","en":"Nothing saved yet. I learn from your messages automatically, or add one with /remember."},"m0oolpwr":{"fa":"\n\nحذف: روی هر مورد بزن · افزودن: دکمه ➕ · ویرایش: دکمه ✏️ (به شکل «شماره | متن جدید»)","en":"\n\nDelete: tap an item · Add: the ➕ button · Edit: the ✏️ button (in the form “number | new text”)"},"m1p8c2gn":{"fa":"➕ افزودن","en":"➕ Add"},"m1w5c8ch":{"fa":"✏️ ویرایش","en":"✏️ Edit"},"m14cbrju":{"fa":"🗑 حذف همه","en":"🗑 Delete all"},"m1t3qh5r":{"fa":"↩️ تنظیمات","en":"↩️ Settings"},"m1gee2xq":{"fa":"%1 <b>پنل ربات هوش مصنوعی</b>  <code>v%2</code>\n\n🧠 مدل فعال: <b>%3</b>\n🔌 سرویس: %4\n📏 کانتکست: <b>%5K</b> توکن\n🎭 شخصیت: %6 %7\n💬 پیام‌های امروز: <b>%8</b>\n\nیه کار انتخاب کن 👇","en":"%1 <b>AI bot panel</b>  <code>v%2</code>\n\n🧠 Active model: <b>%3</b>\n🔌 Service: %4\n📏 Context: <b>%5K</b> tokens\n🎭 Persona: %6 %7\n💬 Messages today: <b>%8</b>\n\nChoose an option 👇"},"m1xi1wad":{"fa":"☁️ Workers AI کلادفلر","en":"☁️ Cloudflare Workers AI"},"m0kr3n6n":{"fa":"🧵 گفتگوها","en":"🧵 Chats"},"m0l10a65":{"fa":"🤖 انتخاب مدل","en":"🤖 Choose Model"},"m09lhgw1":{"fa":"🎭 شخصیت","en":"🎭 Persona"},"m1qm7w1e":{"fa":"🧠 مدیریت حافظه","en":"🧠 Manage Memory"},"m05h45yl":{"fa":"🎙 تنظیمات صدا","en":"🎙 Voice Settings"},"m0mbn0v4":{"fa":"⚔️ مقایسه مدل‌ها","en":"⚔️ Compare Models"},"m0g64mqj":{"fa":"📚 پرامپت‌ها","en":"📚 Prompts"},"m1mep9mb":{"fa":"🔌 سرویس‌های AI","en":"🔌 AI Services"},"m012p9xn":{"fa":"📌 آرشیو","en":"📌 Archive"},"m1ae0jwf":{"fa":"💾 پشتیبان‌گیری","en":"💾 Backup"},"m18igbmz":{"fa":"📊 آمار","en":"📊 Stats"},"m18zglcd":{"fa":"✅ تودو","en":"✅ Todo List"},"m0r6mjqm":{"fa":"⏳ تسک‌ها","en":"⏳ Tasks"},"m0dsvbbz":{"fa":"🖼 گالری","en":"🖼 Gallery"},"m1jgr3l8":{"fa":"🔎 جستجوی گفتگو","en":"🔎 Search Chats"},"m1meqlbf":{"fa":"❓ راهنما","en":"❓ Help"},"m1wrjtc2":{"fa":"📤 خروجی گفتگو","en":"📤 Export Chat"},"m1kijfqi":{"fa":"👥 کاربران مجاز","en":"👥 Allowed Users"},"m151nw5e":{"fa":"🩺 سلامت","en":"🩺 Health"},"m1uzs74l":{"fa":"🌐 داشبورد وب","en":"🌐 Web Dashboard"},"m0in6xe7":{"fa":"✖️ بستن","en":"✖️ Close"},"m109z0d3":{"fa":"☁️ Workers AI کلادفلر — پیش‌فرض","en":"☁️ Cloudflare Workers AI — Default"},"m1w57hdy":{"fa":"🔌 %1 · %2 مدل","en":"🔌 %1 · %2 models"},"m0ll5bys":{"fa":"(سرویس کاستومی اضافه نکرده‌ای)","en":"(No custom service added)"},"m0j1mde2":{"fa":"➕ افزودن سرویس","en":"➕ Add Service"},"m1v7msmb":{"fa":"↩️ بازگشت","en":"↩️ Back"},"m1wfb8a4":{"fa":"🔌 <b>سرویس‌های هوش مصنوعی</b>\n\nکنار Workers AI کلادفلر، به هر سرویس <b>سازگار با OpenAI</b> وصل شو:\nOpenRouter، Groq، Together، DeepSeek، vLLM، Ollama و...\n\n➕ نام سرویس + آدرس پایه (مثل <code>https://api.openai.com/v1</code>) + کلید API\n🤖 ربات خودش مدل‌ها را استخراج میکند؛ اگر نشد نام دقیق مدل را دستی وارد میکنی.\n🔑 کلید فقط در حافظه Worker می‌ماند و همه‌جا ماسک نمایش داده میشود.","en":"🔌 <b>AI Services</b>\n\nAlongside Cloudflare Workers AI, connect any <b>OpenAI-compatible</b> service:\nOpenRouter, Groq, Together, DeepSeek, vLLM, Ollama, and more...\n\n➕ Service name + base URL (e.g. <code>https://api.openai.com/v1</code>) + API key\n🤖 The bot discovers the models itself; if that fails, enter the exact model name manually.\n🔑 The key stays in Worker memory only and is masked everywhere."},"m0e3xgcr":{"fa":"(+%1 مدل دیگر در لیست)","en":"(+%1 more models in the list)"},"m1jsnlsx":{"fa":"✏️ نام","en":"✏️ Name"},"m1boeob4":{"fa":"🔗 آدرس","en":"🔗 URL"},"m14dee9w":{"fa":"🔑 کلیدها (%1/%2)","en":"🔑 Keys (%1/%2)"},"m078pchs":{"fa":"🔄 کاوش مدل","en":"🔄 Discover Models"},"m0d1lmgo":{"fa":"➕ مدل دستی","en":"➕ Manual Model"},"m1muwsii":{"fa":"🗑 حذف سرویس","en":"🗑 Delete Service"},"m1yfp2py":{"fa":"↩️ سرویس‌ها","en":"↩️ Services"},"m1uet3nu":{"fa":"🔌 <b>%1</b>\n🔗 <code>%2</code>\n🔑 کلیدها: %3\n📚 مدل‌ها (%4/%5):\n%6\n\n🗑 = حذف مدل · 📏 = تنظیم کانتکست (به کا) · 👁/🚫 = عکسفهم هست/نیست · 🔑 = مدیریت کلیدها","en":"🔌 <b>%1</b>\n🔗 <code>%2</code>\n🔑 Keys: %3\n📚 Models (%4/%5):\n%6\n\n🗑 = delete model · 📏 = set context (in K) · 👁/🚫 = image understanding on/off · 🔑 = manage keys"},"m1gojmdi":{"fa":" (پیش‌فرض 32K)","en":" (default 32K)"},"m1w7ig69":{"fa":"— هنوز مدلی اضافه نکرده‌ای","en":"— no models added yet"},"m183q2dk":{"fa":"(هیچ کلیدی نیست — یکی اضافه کن)","en":"(no keys yet — add one)"},"m0a3fam9":{"fa":"➕ افزودن کلید","en":"➕ Add Key"},"m0lnxyqe":{"fa":"❌ حذف آخرین","en":"❌ Delete Last"},"m06d51hl":{"fa":"🩺 تست سلامت","en":"🩺 Health Test"},"m0ue4kw6":{"fa":"🔑 <b>کلیدهای «%1»</b> (%2/%3)\n\n• ربات بین کلیدها <b>می‌چرخد</b> — سقف نرخ یک کلید را نمی‌بیند.\n• کلید اول = پیش‌فرض. بقیه فقط وقتی نوبتش برسد استفاده میشوند.\n• همه‌جا ماسک نمایش داده میشوند و هرگز در بکاپ/چت نمی‌آیند.\n\n%4","en":"🔑 <b>Keys for \"%1\"</b> (%2/%3)\n\n• The bot <b>rotates</b> between keys — one key's rate limit is not your limit.\n• The first key is the default. The rest are used only when their turn comes.\n• They are masked everywhere and never appear in backups or chats.\n\n%4"},"m0evw0lf":{"fa":"✍️ دستی وارد کن","en":"✍️ Enter Manually"},"m1gbjz3g":{"fa":"✅ پایان","en":"✅ Done"},"m1g5muhw":{"fa":"🔎 <b>%1</b> — %2 مدل پیدا شد\nروی ➕ هر مدل بزنی به سرویس اضافه میشود (می‌تونی چندتا انتخاب کنی) 👇","en":"🔎 <b>%1</b> — %2 models found\nTap ➕ on any model to add it to the service (you can select several) 👇"},"m1iw41j6":{"fa":"1️⃣ <b>نام سرویس</b> را بفرست (کوتاه — مثلاً <code>OpenRouter</code>)\nلغو: /cancel","en":"1️⃣ Send the <b>service name</b> (short — e.g. <code>OpenRouter</code>)\nCancel: /cancel"},"m0hlduu1":{"fa":"2️⃣ <b>آدرس پایه API</b> — مثل <code>https://api.openai.com/v1</code> یا <code>https://openrouter.ai/api</code>\n🧠 اگر مسیر <code>/v1</code> لازم باشد خودکار پیدا میشود\nلغو: /cancel","en":"2️⃣ <b>API base URL</b> — e.g. <code>https://api.openai.com/v1</code> or <code>https://openrouter.ai/api</code>\n🧠 If the <code>/v1</code> path is needed, it is detected automatically\nCancel: /cancel"},"m11ftfhm":{"fa":"3️⃣ <b>کلید API</b> را بفرست 🔑\n(فقط در حافظه Worker می‌ماند، همه‌جا ماسک نمایش داده میشود — این پیام را در چت عمومی نفرست!)\n⏰ تا ۱ ساعت فرصت داری؛ بعد از آن باید از /provideradd دوباره شروع کنی.\nلغو: /cancel","en":"3️⃣ Send the <b>API key</b> 🔑\n(It stays in Worker memory only and is masked everywhere — don't post this in a public chat!)\n⏰ You have 1 hour; after that, start over with /provideradd.\nCancel: /cancel"},"m1lpxoee":{"fa":"✍️ <b>آیدی دقیق مدل</b> را بنویس. چندتا با ویرگول:\n<code>gpt-4o, moonshotai/kimi-k2</code>\nاختیاری — کانتکست به کا کنار آیدی: <code>my-model 128k</code>\nلغو: /cancel","en":"✍️ Type the <b>exact model ID</b>. Separate several with commas:\n<code>gpt-4o, moonshotai/kimi-k2</code>\nOptional — set the context in K next to the ID: <code>my-model 128k</code>\nCancel: /cancel"},"m0r1l59a":{"fa":"✏️ نام جدید سرویس را بفرست (تا ۳۲ حرف)\nلغو: /cancel","en":"✏️ Send the new service name (up to 32 characters)\nCancel: /cancel"},"m16d29py":{"fa":"🔗 آدرس پایه جدید را بفرست (مثل <code>https://api.x.com/v1</code>)\nلغو: /cancel","en":"🔗 Send the new base URL (e.g. <code>https://api.x.com/v1</code>)\nCancel: /cancel"},"m0oi9mbh":{"fa":"🔑 کلید API جدید را بفرست (به انتهای لیست کلیدها اضافه میشود)\nلغو: /cancel","en":"🔑 Send the new API key (appended to the end of the key list)\nCancel: /cancel"},"m1evf8ki":{"fa":"🔑 کلید API جدید را بفرست — به کلیدهای این سرویس اضافه میشود (تا %1 کلید).\nربات بین همه کلیدها می‌چرخد.\nلغو: /cancel","en":"🔑 Send the new API key — it is added to this service's keys (up to %1 keys).\nThe bot rotates between all keys.\nCancel: /cancel"},"m013xmeb":{"fa":"📏 کانتکست این مدل چند کا-توکن است؟ عدد خالی بفرست (مثلاً <code>128</code>)\nپیش‌فرض: ۳۲K — لغو: /cancel","en":"📏 What is this model's context in K-tokens? Send just the number (e.g. <code>128</code>)\nDefault: 32K — cancel: /cancel"},"m08u9bn5":{"fa":"روشن ✅","en":"On ✅"},"m1y5pded":{"fa":"خاموش ❌","en":"Off ❌"},"m1dr59dw":{"fa":"%1 <b>تنظیمات ربات</b>\n\n🌡 دما: <b>%2</b> (کم=دقیق، زیاد=خلاقانه)\n📝 حداکثر طول پاسخ: <b>%3</b> توکن\n⛽ سقف مصرف روزانه: <b>%4</b>\n🔄 فالبک خودکار به مدل جایگزین: %5\n✍️ نمایش زنده حروف: %6\n🌐 خواندن خودکار لینک: %7\n👁 تحلیل خودکار عکس: %8\n🔊 جواب صوتی به ویس: %9\n🔎 سرچ خودکار وب: %10\n🌅 خلاصه صبح ۱۰ تهران: %11\n🧠 حافظه بلندمدت: <b>%12</b> مورد\n🎙 موتور صدا: <b>%13</b>%14\n🎨 تولید تصویر (/image): <b>%15</b>%16%17\n🆓 فالبک رایگان تصویر: %18\n🖌 ویرایش عکس (کپشن «ویرایش:»): %19\n🗣 یادآور از متن آزاد: %20\n🧠 حافظهٔ خودکار: %21\n🗄 بکاپ خودکار هفتگی: %22\n🔌 قطع خودکار سرویس خراب: %23\n🎬 خلاصهٔ یوتیوب: %24\n\nبرای تغییر، روی دکمه بزن 👇","en":"%1 <b>Bot Settings</b>\n\n🌡 Temperature: <b>%2</b> (low = precise, high = creative)\n📝 Max response length: <b>%3</b> tokens\n⛽ Daily usage cap: <b>%4</b>\n🔄 Auto fallback to backup model: %5\n✍️ Live typing: %6\n🌐 Auto-read links: %7\n👁 Auto image analysis: %8\n🔊 Voice reply to voice notes: %9\n🔎 Auto web search: %10\n🌅 10 AM Tehran morning digest: %11\n🧠 Long-term memory: <b>%12</b> items\n🎙 Voice engine: <b>%13</b>%14\n🎨 Image generation (/image): <b>%15</b>%16%17\n🆓 Free image fallback: %18\n🖌 Image editing (caption \"edit:\"): %19\n🗣 Reminders from free text: %20\n🧠 Auto memory: %21\n🗄 Weekly auto backup: %22\n🔌 Auto cut-off for broken services: %23\n🎬 YouTube summaries: %24\n\nTap a button to change it 👇"},"m0xvv6gd":{"fa":"%1K توکن","en":"%1K tokens"},"m0zzrxp4":{"fa":"بدون سقف ♾","en":"No cap ♾"},"m0zji1xq":{"fa":"کلادفلر","en":"Cloudflare"},"m1uvfcxx":{"fa":"گوگل AI Studio","en":"Google AI Studio"},"m0m2zbpw":{"fa":" · <i>کلید GEMINI_API_KEY ست نشده</i>","en":" · <i>GEMINI_API_KEY not set</i>"},"m1wnt5i1":{"fa":"🌡 دما −","en":"🌡 Temp −"},"m1u7r2em":{"fa":"🌡 دما +","en":"🌡 Temp +"},"m0ues10s":{"fa":"📝 طول −","en":"📝 Length −"},"m0sf0h0n":{"fa":"📝 طول +","en":"📝 Length +"},"m0188hr5":{"fa":"⛽ سقف روزانه","en":"⛽ Daily Cap"},"m0kwd68f":{"fa":"🔄 فالبک","en":"🔄 Fallback"},"m0xj44wz":{"fa":"✍️ استریم","en":"✍️ Stream"},"m0yqdp5m":{"fa":"🌐 لینک","en":"🌐 Links"},"m162ldin":{"fa":"🔊 ویس","en":"🔊 Voice"},"m1f9u72c":{"fa":"🔎 سرچ","en":"🔎 Search"},"m0u85jr8":{"fa":"🌅 صبحانه","en":"🌅 Digest"},"m0jd89cs":{"fa":"%1🎨 تولید تصویر","en":"%1🎨 Image Generation"},"m0p4iy30":{"fa":"🖼 مدل تصویر","en":"🖼 Image model"},"m0xr25fd":{"fa":"🆓 فالبک رایگان تصویر","en":"🆓 Free image fallback"},"m0nxa3ar":{"fa":"🖌 ویرایش عکس","en":"🖌 Edit image"},"m096nnz0":{"fa":"🗣 یادآور از متن آزاد","en":"🗣 Free-text reminder"},"m1ew74lr":{"fa":"🧠 حافظهٔ خودکار","en":"🧠 Auto memory"},"m1707pip":{"fa":"🗄 بکاپ خودکار هفتگی","en":"🗄 Weekly auto backup"},"m0jcprmh":{"fa":"%1🔌 قطع سرویس خراب","en":"%1🔌 Broken-service outage"},"m0afxg26":{"fa":"%1🎬 خلاصه یوتیوب","en":"%1🎬 YouTube summary"},"m0dmwsnb":{"fa":"🧠 مدیریت حافظه (%1)","en":"🧠 Manage memory (%1)"},"m0a9t3mp":{"fa":"🧹 پاک‌سازی کانتکست این چت","en":"🧹 Clear this chat's context"},"m08a864g":{"fa":"🎙 <b>تنظیمات صدا</b>\n\n","en":"🎙 <b>Voice settings</b>\n\n"},"m01vbrff":{"fa":"موتور فعال: <b>%1</b>\n","en":"Active engine: <b>%1</b>\n"},"m1wzuw1q":{"fa":"کلادفلر (Whisper/MeloTTS)","en":"Cloudflare (Whisper/MeloTTS)"},"m04agodf":{"fa":"کلید گوگل: %1\n","en":"Google key: %1\n"},"m0nxxawz":{"fa":"✅ ست شده","en":"✅ Set"},"m0j397wr":{"fa":"❌ ست نشده (Secret با اسم GEMINI_API_KEY)","en":"❌ Not set (Secret named GEMINI_API_KEY)"},"m0w64ohe":{"fa":"فهم ویس گوگل: <b>%1</b>\n","en":"Google voice understanding: <b>%1</b>\n"},"m08tb1tg":{"fa":"تولید صدای گوگل: <b>%1</b>\n","en":"Google speech generation: <b>%1</b>\n"},"m13de9hb":{"fa":"وویس: <b>%1</b> (۳۰ گزینه، فارسی fa پشتیبانی میشود)\n","en":"Voice: <b>%1</b> (30 options, Persian fa supported)\n"},"m1axwmcn":{"fa":"جواب صوتی به ویس: %1\n\n","en":"Voice reply to voice: %1\n\n"},"m0x3ex3n":{"fa":"خاموش ❌ (فقط متن)","en":"Off ❌ (text only)"},"m0ofspz9":{"fa":"مدل صداساز را انتخاب کن 👇","en":"Choose a voice model 👇"},"m0ke7go8":{"fa":"%1کلادفلر","en":"%1Cloudflare"},"m07wmsun":{"fa":"%1گوگل","en":"%1Google"},"m1csnrtf":{"fa":"🎤 فهم ویس: %1","en":"🎤 Voice understanding: %1"},"m06mahyb":{"fa":"── مدل‌های تولید صدا (TTS) ──","en":"── Speech generation models (TTS) ──"},"m0xcli33":{"fa":"── وویس‌ها (صفحه %1/%2) ──","en":"── Voices (page %1/%2) ──"},"m19nob78":{"fa":"🔊 جواب صوتی: %1","en":"🔊 Voice replies: %1"},"m0vplg8q":{"fa":"روشن","en":"On"},"m13eyrx5":{"fa":"خاموش","en":"Off"},"m0l67xhw":{"fa":"▶️ تست صدا","en":"▶️ Test voice"},"m1pkxn1n":{"fa":"✏️ دستور شخصی (System Prompt)","en":"✏️ Custom instruction (System Prompt)"},"m1rekgpu":{"fa":"🎭 <b>شخصیت دستیار</b>\n\nالان: %1 <b>%2</b>\n\nهر شخصیت یک سبک و تخصص متفاوت داره. انتخاب کن:","en":"🎭 <b>Assistant personality</b>\n\nNow: %1 <b>%2</b>\n\nEach personality has its own style and specialty. Choose one:"},"m1x98qhl":{"fa":"➕ گفتگوی جدید","en":"➕ New chat"},"m0gr5cyj":{"fa":"🧵 <b>گفتگوهای من</b>\n\nگفتگوی فعلی: <b>%1</b>\nهر گفتگو حافظه‌ی جداگانه داره؛ با ➕ یکی جدید بساز یا بینشان سوییچ کن 👇","en":"🧵 <b>My chats</b>\n\nCurrent chat: <b>%1</b>\nEach chat has its own memory; create a new one with ➕ or switch between them 👇"},"m018lqkn":{"fa":"🗑 حذف همه پرامپت‌ها","en":"🗑 Delete all prompts"},"m0wrxgyd":{"fa":"(هنوز پرامپتی ذخیره نکردی)","en":"(You haven't saved any prompts yet)"},"m1efce1c":{"fa":"➕ افزودن پرامپت","en":"➕ Add prompt"},"m1rs4jo0":{"fa":"📚 <b>کتابخانه پرامپت</b>\n\n%1","en":"📚 <b>Prompt library</b>\n\n%1"},"m1vokrzd":{"fa":"روی هر پرامپت بزنی، همان متن پردازش میشه (مثل اینکه خودت تایپش کرده باشی):","en":"Tap a prompt and that exact text is processed, just as if you had typed it yourself:"},"m01ke8u3":{"fa":"پرامپت‌های پرتکرارت را ذخیره کن تا با یک لمس اجرایشان کنی.\n\n💡 برای افزودن، دکمه «افزودن» را بزن و بعد متن پرامپت را بفرست.","en":"Save your frequently used prompts so you can run them with a single tap.\n\n💡 To add one, press the \"Add\" button and then send the prompt text."},"m1nk6vkl":{"fa":"⚔️ <b>مقایسه دو مدل کنار هم</b>\n\nوضعیت: <b>%1</b>\n\n🅰️ %2 · %3\n🅱️ %4 · %5\n\nمراحل: مدل‌ها را انتخاب کن ← «شروع» ← پیامت را بفرست!","en":"⚔️ <b>Compare two models side by side</b>\n\nStatus: <b>%1</b>\n\n🅰️ %2 · %3\n🅱️ %4 · %5\n\nSteps: pick the models ← \"Start\" ← send your message!"},"m00tpw29":{"fa":"فعال 🟢 — پیام بعدی به هر دو داده میشود","en":"Active 🟢 — your next message goes to both"},"m17zlr9p":{"fa":"غیرفعال ⚪","en":"Inactive ⚪"},"m1vh1eyb":{"fa":"1️⃣ مدل 🅰️","en":"1️⃣ Model 🅰️"},"m15i4frb":{"fa":"2️⃣ مدل 🅱️","en":"2️⃣ Model 🅱️"},"m12qi6ri":{"fa":"⏹ پایان مقایسه","en":"⏹ End comparison"},"m1mboacc":{"fa":"▶️ شروع مقایسه","en":"▶️ Start comparison"},"m1obvhrj":{"fa":"⚔️ مدل %1 را انتخاب کن:","en":"⚔️ Choose the model for %1:"},"m0qy9xpz":{"fa":"اول 🅰️","en":"First 🅰️"},"m0xfju51":{"fa":"دوم 🅱️","en":"Second 🅱️"},"m10i38cb":{"fa":"📊 <b>آمار مصرف شما</b>\n\n📅 امروز:\n　• پیام: <b>%1</b>\n　• توکن ورودی: <b>%2</b>\n　• توکن خروجی: <b>%3</b>\n%4\n♾ از ابتدا:\n　• پیام: <b>%5</b> · ورودی: <b>%6</b> · خروجی: <b>%7</b>\n\n💬 پیام‌های در حافظه این گفتگو: <b>%8</b>\n📌 پاسخ ذخیره‌شده: <b>%9</b>\n👥 کاربران مجاز: <b>%10</b>","en":"📊 <b>Your usage</b>\n\n📅 Today:\n　• Messages: <b>%1</b>\n　• Input tokens: <b>%2</b>\n　• Output tokens: <b>%3</b>\n%4\n♾ All time:\n　• Messages: <b>%5</b> · Input: <b>%6</b> · Output: <b>%7</b>\n\n💬 Messages in this chat's memory: <b>%8</b>\n📌 Saved replies: <b>%9</b>\n👥 Allowed users: <b>%10</b>"},"m0ac0r1p":{"fa":"　• سقف روزانه: %1K\n","en":"　• Daily cap: %1K\n"},"m03pn5mm":{"fa":"🩺 تست سلامت سرویس‌ها","en":"🩺 Service health check"},"m13yp1y4":{"fa":"(آرشیو خالی است)","en":"(The archive is empty)"},"m1ynfxqi":{"fa":"🗑 پاک کردن کل آرشیو","en":"🗑 Clear entire archive"},"m0xh3fro":{"fa":"📌 <b>آرشیو پاسخ‌ها</b> (%1)\n\nذخیره کردن: زیر هر پاسخ «📌 ذخیره» را بزن.","en":"📌 <b>Reply archive</b> (%1)\n\nTo save: press \"📌 Save\" under any reply."},"m10td73w":{"fa":"(یادآوری نداری)","en":"(You have no reminders)"},"m1dfp7h5":{"fa":"➕ یادآور جدید","en":"➕ New reminder"},"m006t0tp":{"fa":"⏰ <b>یادآورها</b> (%1)\n\nساخت سریع با دستور:\n<code>/remind 18:30 چای دم کن</code>  (ساعت تهران)\n<code>/remind روزانه 08:00 ورزش</code>  (تکرار روزانه 🔁)\n<code>/remind 45m استراحت کن</code>  (نسبی)\n\nبرای حذف، روی هر یادآور بزن 👇","en":"⏰ <b>Reminders</b> (%1)\n\nQuick create with a command:\n<code>/remind 18:30 brew tea</code>  (Tehran time)\n<code>/remind daily 08:00 workout</code>  (repeats daily 🔁)\n<code>/remind 45m take a break</code>  (relative)\n\nTo delete, tap a reminder 👇"},"m01d0e0j":{"fa":"%1 <b>Workers AI</b> — Binding «AI» تنظیم نشده! (مرحله ۱ راهنما)","en":"%1 <b>Workers AI</b> — the \"AI\" binding is not set! (guide step 1)"},"m0dytgkj":{"fa":"%1 <b>تلگرام</b> — %2","en":"%1 <b>Telegram</b> — %2"},"m0rugro2":{"fa":"%1 <b>تلگرام</b> — قطع یا تایم‌اوت","en":"%1 <b>Telegram</b> — disconnected or timed out"},"m1of23e6":{"fa":"%1 <b>حافظه D1</b> — %2","en":"%1 <b>D1 memory</b> — %2"},"m0fao5nf":{"fa":"خطا — Binding «DB» را چک کنید","en":"Error — check the \"DB\" binding"},"m082hgni":{"fa":"%1 <b>حافظه D1</b> — Binding «DB» تنظیم نشده! (مرحله ۴ راهنما)","en":"%1 <b>D1 memory</b> — the \"DB\" binding is not set! (guide step 4)"},"m06cglwu":{"fa":"🩺 <b>سلامت سرویس‌ها</b>\n\n%1\n\n<i>کل بررسی: %2ms</i>","en":"🩺 <b>Service health</b>\n\n%1\n\n<i>Total check: %2ms</i>"},"m0wtzzqu":{"fa":"🔄 تست مجدد","en":"🔄 Retest"},"m0rifmvi":{"fa":"🔌 تست سرویس‌های کاستوم","en":"🔌 Test custom services"},"m0g9udyr":{"fa":"%1 <b>%2</b> — سالم · <code>%3ms</code>%4","en":"%1 <b>%2</b> — healthy · <code>%3ms</code>%4"},"m1co04ke":{"fa":" · %1 کلید","en":" · %1 keys"},"m1m42zdi":{"fa":"❓ <b>%1</b> — کلیدی ثبت نشده است","en":"❓ <b>%1</b> — no key registered"},"m03uh4lb":{"fa":"❓ <b>%1</b> — آدرس پایه ثبت نشده است","en":"❓ <b>%1</b> — no base URL registered"},"m0gfqmzh":{"fa":"❓ <b>%1</b> — مدلی اضافه نشده (🔄 کاوش مدل بزن)","en":"❓ <b>%1</b> — no model added (tap 🔄 to probe models)"},"m0n7i97l":{"fa":"%1 <b>%2</b> — 🔑 مشکل از <b>کلید API</b> (HTTP %3) — کلید را از «🔑 کلیدها» عوض کن","en":"%1 <b>%2</b> — 🔑 the problem is the <b>API key</b> (HTTP %3) — change the key under \"🔑 Keys\""},"m0p161cu":{"fa":"%1 <b>%2</b> — 🔗 مشکل از <b>آدرس پایه</b> یا نام مدل (HTTP 404)","en":"%1 <b>%2</b> — 🔗 The problem is the <b>base URL</b> or the model name (HTTP 404)"},"m00acb8y":{"fa":"⚠️ <b>%1</b> — کلید سالم ولی سقف نرخ (HTTP 429) · %2 کلید داری، ربات بین‌شان می‌چرخد","en":"⚠️ <b>%1</b> — Key is valid but rate-limited (HTTP 429) · You have %2 keys, the bot rotates between them"},"m1cg57k3":{"fa":"%1 <b>%2</b> — سرویس بالا نیست (HTTP %3) · <code>%4ms</code>","en":"%1 <b>%2</b> — Service is down (HTTP %3) · <code>%4ms</code>"},"m10i3hsb":{"fa":"%1 <b>%2</b> — خطای HTTP %3","en":"%1 <b>%2</b> — HTTP error %3"},"m0cq023g":{"fa":"%1 <b>%2</b> — 🔗 مشکل از <b>آدرس پایه یا اتصال</b> (آدرس را چک کن) · <code>%3ms</code>","en":"%1 <b>%2</b> — 🔗 The problem is the <b>base URL or the connection</b> (check the URL) · <code>%3ms</code>"},"m1crgumw":{"fa":"🩺 <b>سلامت سرویس‌های کاستوم</b>\n\nهیچ سرویس کاستومی اضافه نکرده‌ای — فقط Workers AI کلادفلر فعال است.","en":"🩺 <b>Custom service health</b>\n\nYou have not added any custom services — only Cloudflare Workers AI is active."},"m0o7ek39":{"fa":"🩺 <b>سلامت سرویس‌های کاستوم</b>\n\n%1\n\n<i>%2/%3 سالم · کل بررسی %4ms</i>\n<i>برای تصحیح: صفحهٔ سرویس ← 🔑 کلیدها یا 🔗 آدرس</i>","en":"🩺 <b>Custom service health</b>\n\n%1\n\n<i>%2/%3 healthy · full check %4ms</i>\n<i>To fix: service page ← 🔑 Keys or 🔗 URL</i>"},"m0kqkcfb":{"fa":"⚠️ حذف همه به‌جز مدیر","en":"⚠️ Delete all except admins"},"m04m94qe":{"fa":"(کاربری اضافه نشده)","en":"(no users added)"},"m1mlimxv":{"fa":"➕ افزودن کاربر","en":"➕ Add user"},"m1aw5brt":{"fa":"⛽ سهمیهٔ تصویر کاربران","en":"⛽ User image quota"},"m13s3u37":{"fa":"👥 <b>کاربران مجاز</b>\n\nفقط مدیر و افراد این لیست اجازه استفاده دارند.\n➕ افزودن: دکمه را بزن و آیدی عددی تلگرام طرف را بفرست\n(آیدی با @userinfobot قابل گرفتن است)\n🗑 حذف: روی اسم هر کاربر بزن.","en":"👥 <b>Allowed users</b>\n\nOnly admins and the people on this list can use the bot.\n➕ Add: tap the button and send the person's numeric Telegram ID\n(the ID can be obtained with @userinfobot)\n🗑 Remove: tap a user's name."},"m1szivj4":{"fa":"📭 این گفتگو هنوز پیامی ندارد.","en":"📭 This chat has no messages yet."},"m09ni6ew":{"fa":"📤 خروجی گفتگوی «%1» — ربات هوش مصنوعی v%2\nتاریخ: %3\n%4\n\n","en":"📤 Export of chat «%1» — AI Bot v%2\nDate: %3\n%4\n\n"},"m0bap9el":{"fa":"🙋 شما:\n","en":"🙋 You:\n"},"m0u2g2jv":{"fa":"🤖 دستیار:\n","en":"🤖 Assistant:\n"},"m02iqbkx":{"fa":"📤 خروجی گفتگوی «%1» — %2 پیام","en":"📤 Export of chat «%1» — %2 messages"},"m077phq3":{"fa":"🗄 <b>پشتیبان‌گیری / بازیابی</b>\n\nبخش بالا: پشتیبان‌گیری انتخابی به‌صورت <b>فایل TXT</b> — هر بخش را جداگانه بگیر.\nبخش پایین: بکاپ کامل JSON (برای بازیابی در همین ربات) و بازیابی از فایل (فقط مدیر).","en":"🗄 <b>Backup / Restore</b>\n\nTop section: selective backup as <b>TXT files</b> — grab each section separately.\nBottom section: full JSON backup (for restoring into this bot) and restore from file (admins only)."},"m0qdhhin":{"fa":"💬 گفتگوها","en":"💬 Chats"},"m1lyveyk":{"fa":"🔌 سرویس‌ها (کلید ماسک‌شده)","en":"🔌 Services (masked key)"},"m02srs8j":{"fa":"🧠 حافظه + یادآورها + آرشیو","en":"🧠 Memory + reminders + archive"},"m090xhe3":{"fa":"📦 همهٔ موارد (یک فایل)","en":"📦 Everything (one file)"},"m13rx1cf":{"fa":"⬇️ بکاپ JSON کامل (برای بازیابی)","en":"⬇️ Full JSON backup (for restore)"},"m1yy8oao":{"fa":"↩️ بازیابی از فایل JSON","en":"↩️ Restore from JSON file"},"m1x9y5vp":{"fa":"بهَراد AI — پشتیبان‌گیری %1\nتاریخ: %2 · نسخه: %3\n%4\n\n","en":"{{brand}} — Backup %1\nDate: %2 · Version: %3\n%4\n\n"},"m1xi9ykb":{"fa":"📦 پشتیبان %1","en":"📦 Backup %1"},"m1wezh0o":{"fa":"گفتگوها","en":"Chats"},"m0pcmij0":{"fa":"═══ گفتگو: %1 (%2 پیام) ═══\n\n","en":"═══ Chat: %1 (%2 messages) ═══\n\n"},"m1jhgi3v":{"fa":"🤖 دستیار","en":"🤖 Assistant"},"m1a5ofxs":{"fa":"💬 پشتیبان گفتگوها — %1","en":"💬 Chat backup — %1"},"m02v5mwr":{"fa":"%1مدل فعال: %2\nشخصیت: %3\nدما: %4\nحداکثر طول پاسخ: %5 توکن\nسقف روزانه: %6\nفالبک خودکار: %7\nاستریم زنده: %8\nخواندن لینک: %9\nتحلیل خودکار عکس: %10\nجواب صوتی به ویس: %11\nسرچ خودکار: %12\nخلاصه صبح: %13\nتولید تصویر: %14 · مدل: %15\nموتور صدا: %16 · وویس: %17\nمدل TTS: %18 · مدل STT: %19\nمدل تصویر: %20\nقطع خودکار سرویس خراب: %21\nخلاصه یوتیوب: %22\n%23\n","en":"%1Active model: %2\nPersonality: %3\nTemperature: %4\nMax response length: %5 tokens\nDaily limit: %6\nAuto fallback: %7\nLive streaming: %8\nLink reading: %9\nAuto image analysis: %10\nVoice reply to voice: %11\nAuto search: %12\nMorning digest: %13\nImage generation: %14 · Model: %15\nVoice engine: %16 · Voice: %17\nTTS model: %18 · STT model: %19\nImage model: %20\nAuto-disable broken service: %21\nYouTube summary: %22\n%23\n"},"m1vez5kd":{"fa":"تنظیمات","en":"Settings"},"m1yk76a9":{"fa":"بی‌سقف","en":"Unlimited"},"m1t25ozt":{"fa":"گوگل","en":"Google"},"m02hhkvu":{"fa":"پرامپت سیستمی دلخواه: %1","en":"Custom system prompt: %1"},"m0pcopcc":{"fa":"پرامپت سیستمی دلخواه: —","en":"Custom system prompt: —"},"m10bndpe":{"fa":"⚙️ پشتیبان تنظیمات","en":"⚙️ Settings backup"},"m1o0d33d":{"fa":"%1ℹ️ کلیدهای API در این فایل فقط ماسک‌شده‌اند. برای کلید کامل، پنل خود سرویس\n(مثلاً OpenRouter) را ببین — کلید کامل هرگز از ربات بیرون نمی‌آید.\n\n","en":"%1ℹ️ API keys in this file are only masked. For the full key, open the provider's own panel\n(e.g. OpenRouter) — the full key never leaves the bot.\n\n"},"m0aqi32i":{"fa":"سرویس‌ها و کلیدها","en":"Services and keys"},"m02lrd99":{"fa":"سرویس کاستومی ثبت نشده است.\n","en":"No custom service is registered.\n"},"m1vllml2":{"fa":"کلیدها (%1/%2) — ماسک‌شده:\n","en":"Keys (%1/%2) — masked:\n"},"m0txn918":{"fa":"مدل‌ها (%1):\n","en":"Models (%1):\n"},"m16emhxl":{"fa":" (کانتکست %1K)","en":" (context %1K)"},"m0c9vplc":{"fa":"%1\nWorkers AI کلادفلر: کلید API ندارد (از Binding «AI» می‌آید).\n","en":"%1\nCloudflare Workers AI: no API key (it comes from the «AI» binding).\n"},"m0ewqfzt":{"fa":"🔌 پشتیبان سرویس‌ها (کلیدها ماسک‌شده)","en":"🔌 Services backup (masked keys)"},"m0ygw84s":{"fa":"حافظه و داده‌های جانبی","en":"Memory and side data"},"m1fm62qv":{"fa":"── 🧠 حافظه بلندمدت (%1) ──\n","en":"── 🧠 Long-term memory (%1) ──\n"},"m15p0q5y":{"fa":"خالی است.\n","en":"Empty.\n"},"m1afmx6s":{"fa":"\n── ⏰ یادآورها ──\n","en":"\n── ⏰ Reminders ──\n"},"m1vkjfrw":{"fa":"• %1:%2 تهران%3 — %4\n","en":"• %1:%2 Tehran%3 — %4\n"},"m15kn5cf":{"fa":" (روزانه)","en":" (daily)"},"m0yce6zh":{"fa":"\n── 📌 آرشیو پاسخ‌های ذخیره‌شده ──\n","en":"\n── 📌 Saved response archive ──\n"},"m09fpshh":{"fa":"\n── 📚 پرامپت‌های ذخیره‌شده ──\n","en":"\n── 📚 Saved prompts ──\n"},"m033g8c0":{"fa":"بدون نام","en":"Unnamed"},"m1rg8et5":{"fa":"🧠 پشتیبان حافظه، یادآورها، آرشیو و پرامپت‌ها","en":"🧠 Memory, reminders, archive and prompts backup"},"m1v3tg8a":{"fa":"همهٔ بخش‌ها","en":"All sections"},"m1et921v":{"fa":"ℹ️ کلیدهای API در این فایل فقط ماسک‌شده هستند.\n\n","en":"ℹ️ API keys in this file are only masked.\n\n"},"m0pruoaf":{"fa":"########## تنظیمات ##########\n%1\n\n","en":"########## Settings ##########\n%1\n\n"},"m01nr5yu":{"fa":"########## سرویس‌ها و کلیدها ##########\n","en":"########## Services and keys ##########\n"},"m0hu0lri":{"fa":"  کلید %1: %2\n","en":"  Key %1: %2\n"},"m0p7vbmf":{"fa":"  مدل: %1\n","en":"  Model: %1\n"},"m13baz7k":{"fa":"########## گفتگوها ##########\n","en":"########## Chats ##########\n"},"m0pnadnz":{"fa":"شما","en":"You"},"m0unnej5":{"fa":"ربات","en":"Bot"},"m1damvlh":{"fa":"########## حافظه ##########\n","en":"########## Memory ##########\n"},"m0nds0ge":{"fa":"\n########## پرامپت‌ها ##########\n","en":"\n########## Prompts ##########\n"},"m14rvopo":{"fa":"\n########## یادآورها ##########\n","en":"\n########## Reminders ##########\n"},"m0qz0gx5":{"fa":"• %1 — %2 (تکرار: %3)\n","en":"• %1 — %2 (repeat: %3)\n"},"m016idmf":{"fa":"📦 پشتیبان کامل (کلیدها ماسک‌شده)","en":"📦 Full backup (masked keys)"},"m0matpor":{"fa":"🗄 بکاپ کامل حساب شما — در جای امن نگه دارید","en":"🗄 Full backup of your account — keep it somewhere safe"},"m12u9zyd":{"fa":"فایل JSON معتبر نیست.","en":"The JSON file is not valid."},"m077i9hw":{"fa":"ساختار بکاپ شناخته نشد.","en":"Unrecognized backup structure."},"m1o9k8vs":{"fa":"ساختار بکاپ شناخته نشد (کلید %1 داخل فایل نیست).","en":"Unrecognized backup structure (key %1 is not in the file)."},"m01abs39":{"fa":"<!DOCTYPE html><html lang=\"fa\" dir=\"rtl\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>ورود به داشبورد</title><style>%1</style></head><body><div class=\"wrap\"><h1>🔐 ورود به داشبورد</h1><div class=\"sub\">رمز تنظیم‌شده در DASHBOARD_PASSWORD را وارد کنید</div><form method=\"post\" action=\"/dashboard\"><input name=\"pw\" type=\"password\" placeholder=\"رمز عبور...\" autofocus autocomplete=\"current-password\" style=\"max-width:320px\"><div style=\"margin-top:12px\"><button>ورود</button></div>%2</form></div></body></html>","en":"<!DOCTYPE html><html lang=\"en\" dir=\"ltr\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Dashboard login</title><style>%1</style></head><body><div class=\"wrap\"><h1>🔐 Dashboard login</h1><div class=\"sub\">Enter the password set in DASHBOARD_PASSWORD</div><form method=\"post\" action=\"/dashboard\"><input name=\"pw\" type=\"password\" placeholder=\"Password...\" autofocus autocomplete=\"current-password\" style=\"max-width:320px\"><div style=\"margin-top:12px\"><button>Log in</button></div>%2</form></div></body></html>"},"m1n9q4z9":{"fa":"\nlet S=null;\nasync function api(p,body){const r=await fetch('/api'+p,{method:body!==undefined?'POST':'GET',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:body!==undefined?JSON.stringify(body):undefined});if(r.status===401){location='/dashboard';throw new Error(401)}return r.json()}\nfunction T(){return ''}\n/* 🔒 v5.4: هر مقدار متنی (نام سرویس/مدل، پیام خطا) قبل از innerHTML\n   اسکیپ می‌شود — نام سرویس را کاربر می‌نویسد و می‌توانست HTML/JS تزریق کند. */\nfunction E(x){return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;')}\nfunction msg(t,c){document.getElementById('msg').textContent=t;document.getElementById('msg').style.color=c||''}\nasync function load(){try{S=await api('/state')}catch(e){return}render()}\nfunction render(){\n const g=document.getElementById('app');\n g.innerHTML=\n '<h1>🤖 داشبورد ربات هوش مصنوعی</h1><div class=\"sub\">نسخه '+S.version+' · به‌روزرسانی: '+new Date().toLocaleString('fa-IR')+'</div>'+\n '<div class=\"grid\">'+\n '<div class=\"card\"><h3>🧠 مدل فعال</h3><div class=\"big\">'+E(S.modelName)+'</div>'+\n   '<div class=\"row\"><span>سرویس</span><span>'+E(S.provLabel)+'</span></div>'+\n   '<div class=\"row\"><span>کانتکست</span><span>'+S.ctxK+'K توکن</span></div></div>'+\n '<div class=\"card\"><h3>📊 مصرف امروز</h3><div class=\"big\">'+S.today.msgs+' پیام</div>'+\n   '<div class=\"row\"><span>توکن ورودی</span><span>'+S.today.tin+'</span></div>'+\n   '<div class=\"row\"><span>توکن خروجی</span><span>'+S.today.tout+'</span></div>'+\n   '<div class=\"row\"><span>سقف روزانه</span><span>'+(S.dailyLimit?S.dailyLimit+'K':'♾ بدون سقف')+'</span></div></div>'+\n '<div class=\"card\"><h3>🔑 سرویس‌ها</h3>'+\n   '<div class=\"row\"><span>Workers AI (binding)</span><span>'+(S.hasAiBinding?'✅ متصل':'❌ ست نشده')+'</span></div>'+\n   '<div class=\"row\"><span>حافظه D1</span><span>'+(S.hasDb?'✅ متصل':'⚠️ ست نشده — ربات بدون DB کار نمیکند')+'</span></div>'+\n   '<div class=\"row\"><span>وب‌هوک تلگرام</span><span>'+E(S.webhook)+'</span></div></div>'+\n '<div class=\"card\"><h3>⚙️ تنظیم سریع</h3>'+\n   '<label>🌡 دما (۰ دقیق تا ۲ خیلی خلاق):<input id=\"tp\" type=\"number\" min=\"0\" max=\"2\" step=\"0.1\" value=\"'+S.temperature+'\"></label>'+\n   '<label>📝 حداکثر طول پاسخ (توکن):<input id=\"mt\" type=\"number\" min=\"256\" max=\"8192\" step=\"128\" value=\"'+S.maxTokens+'\"></label>'+\n   '<label>⛽ سقف روزانه (هزار توکن، صفر=بی‌سقف):<input id=\"dl\" type=\"number\" min=\"0\" max=\"100000\" step=\"50\" value=\"'+S.dailyLimit+'\"></label>'+\n   '<div style=\"margin-top:12px;display:flex;gap:8px;flex-wrap:wrap\">'+\n   '<button onclick=\"saveSet()\">💾 ذخیره</button>'+\n   '<button class=\"gray\" onclick=\"doPing()\">🩺 تست سلامت</button></div></div>'+\n '<div class=\"card\"><h3>🤖 تغییر مدل</h3>'+\n   '<select id=\"mdl\">'+(function(){var byP={};S.models.forEach(function(m){(byP[m.prov]=byP[m.prov]||[]).push(m)});return Object.keys(byP).map(function(p){return '<optgroup label=\"'+E(p)+'\">'+byP[p].map(function(m){return '<option value=\"'+E(m.key)+'\"'+(m.key===S.model?' selected':'')+'>'+E(m.label)+'</option>'}).join('')+'</optgroup>'}).join('')})()+'</select>'+\n   '<div style=\"margin-top:10px\"><button onclick=\"setModel()\">✅ اعمال</button></div></div>'+\n (S.providers&&S.providers.length?'<div class=\"card\"><h3>🔌 سرویس‌های کاستوم</h3>'+S.providers.map(function(p){return '<div class=\"row\"><span>'+E(p.name)+' ('+p.n+' مدل)</span><span>'+E(p.keyMask)+'</span></div>'}).join('')+'<div class=\"sub\" style=\"margin-top:6px\">مدیریت سرویس‌ها از تلگرام: /providers</div></div>':'')+\n '<div class=\"card\"><h3>💬 گفتگوی اصلی</h3>'+\n   '<div class=\"row\"><span>پیام‌های در حافظه</span><span>'+S.histLen+'</span></div>'+\n   '<div style=\"margin-top:10px;display:flex;gap:8px;flex-wrap:wrap\">'+\n   '<button class=\"gray\" onclick=\"clearHist()\">🧹 پاک‌سازی</button>'+\n   '<button class=\"gray\" onclick=\"window.open('/api/exporttxt','_blank')\">📤 خروجی متنی</button></div></div>'+\n '<div class=\"card\"><h3>⚠️ آخرین خطاها</h3>'+\n   (S.errors.length?S.errors.map(function(e){return '<div class=\"row\"><span>'+E(e.p)+'</span><span style=\"color:#f87171\">'+E(String(e.m).slice(0,70))+'</span></div>'}).join(''):'سبز و پاک ✨')+\n   '</div>'+\n '</div>'+\n '<div id=\"msg\" style=\"margin-top:16px;font-weight:700\"></div>';\n}\nasync function saveSet(){await api('/settings',{temperature:+document.getElementById('tp').value,maxTokens:+document.getElementById('mt').value,dailyLimit:+document.getElementById('dl').value});msg('✅ ذخیره شد','#34d399')}\nasync function setModel(){const r=await api('/settings',{model:document.getElementById('mdl').value});if(r.ok){msg('✅ مدل عوض شد','#34d399');load()}}\nasync function clearHist(){await api('/settings',{clearHist:true});msg('🧹 حافظه گفتگوی اصلی پاک شد','#34d399');load()}\nasync function doPing(){msg('⏳ در حال تست...');const r=await api('/ping');msg(r.ok?'🩺 همه سرویس‌ها چک شدند — لاگ را ببینید':'❌ خطا','#fbbf24')}\nload()","en":"\nlet S=null;\nasync function api(p,body){const r=await fetch('/api'+p,{method:body!==undefined?'POST':'GET',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:body!==undefined?JSON.stringify(body):undefined});if(r.status===401){location='/dashboard';throw new Error(401)}return r.json()}\nfunction T(){return ''}\n/* 🔒 v5.4: every text value (service/model name, error message) is escaped before innerHTML\n   — the user types the service name, so they could inject HTML/JS. */\nfunction E(x){return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;')}\nfunction msg(t,c){document.getElementById('msg').textContent=t;document.getElementById('msg').style.color=c||''}\nasync function load(){try{S=await api('/state')}catch(e){return}render()}\nfunction render(){\n const g=document.getElementById('app');\n g.innerHTML=\n '<h1>🤖 AI Bot dashboard</h1><div class=\"sub\">Version '+S.version+' · Updated: '+new Date().toLocaleString('en-US')+'</div>'+\n '<div class=\"grid\">'+\n '<div class=\"card\"><h3>🧠 Active model</h3><div class=\"big\">'+E(S.modelName)+'</div>'+\n   '<div class=\"row\"><span>Service</span><span>'+E(S.provLabel)+'</span></div>'+\n   '<div class=\"row\"><span>Context</span><span>'+S.ctxK+'K tokens</span></div></div>'+\n '<div class=\"card\"><h3>📊 Usage today</h3><div class=\"big\">'+S.today.msgs+' messages</div>'+\n   '<div class=\"row\"><span>Input tokens</span><span>'+S.today.tin+'</span></div>'+\n   '<div class=\"row\"><span>Output tokens</span><span>'+S.today.tout+'</span></div>'+\n   '<div class=\"row\"><span>Daily limit</span><span>'+(S.dailyLimit?S.dailyLimit+'K':'♾ unlimited')+'</span></div></div>'+\n '<div class=\"card\"><h3>🔑 Services</h3>'+\n   '<div class=\"row\"><span>Workers AI (binding)</span><span>'+(S.hasAiBinding?'✅ connected':'❌ not set')+'</span></div>'+\n   '<div class=\"row\"><span>D1 database</span><span>'+(S.hasDb?'✅ connected':'⚠️ not set — the bot will not work without the DB')+'</span></div>'+\n   '<div class=\"row\"><span>Telegram webhook</span><span>'+E(S.webhook)+'</span></div></div>'+\n '<div class=\"card\"><h3>⚙️ Quick settings</h3>'+\n   '<label>🌡 Temperature (0 precise to 2 very creative):<input id=\"tp\" type=\"number\" min=\"0\" max=\"2\" step=\"0.1\" value=\"'+S.temperature+'\"></label>'+\n   '<label>📝 Max response length (tokens):<input id=\"mt\" type=\"number\" min=\"256\" max=\"8192\" step=\"128\" value=\"'+S.maxTokens+'\"></label>'+\n   '<label>⛽ Daily limit (thousand tokens, 0=unlimited):<input id=\"dl\" type=\"number\" min=\"0\" max=\"100000\" step=\"50\" value=\"'+S.dailyLimit+'\"></label>'+\n   '<div style=\"margin-top:12px;display:flex;gap:8px;flex-wrap:wrap\">'+\n   '<button onclick=\"saveSet()\">💾 Save</button>'+\n   '<button class=\"gray\" onclick=\"doPing()\">🩺 Health check</button></div></div>'+\n '<div class=\"card\"><h3>🤖 Change model</h3>'+\n   '<select id=\"mdl\">'+(function(){var byP={};S.models.forEach(function(m){(byP[m.prov]=byP[m.prov]||[]).push(m)});return Object.keys(byP).map(function(p){return '<optgroup label=\"'+E(p)+'\">'+byP[p].map(function(m){return '<option value=\"'+E(m.key)+'\"'+(m.key===S.model?' selected':'')+'>'+E(m.label)+'</option>'}).join('')+'</optgroup>'}).join('')})()+'</select>'+\n   '<div style=\"margin-top:10px\"><button onclick=\"setModel()\">✅ Apply</button></div></div>'+\n (S.providers&&S.providers.length?'<div class=\"card\"><h3>🔌 Custom services</h3>'+S.providers.map(function(p){return '<div class=\"row\"><span>'+E(p.name)+' ('+p.n+' models)</span><span>'+E(p.keyMask)+'</span></div>'}).join('')+'<div class=\"sub\" style=\"margin-top:6px\">Manage services from Telegram: /providers</div></div>':'')+\n '<div class=\"card\"><h3>💬 Main chat</h3>'+\n   '<div class=\"row\"><span>Messages in memory</span><span>'+S.histLen+'</span></div>'+\n   '<div style=\"margin-top:10px;display:flex;gap:8px;flex-wrap:wrap\">'+\n   '<button class=\"gray\" onclick=\"clearHist()\">🧹 Clear</button>'+\n   '<button class=\"gray\" onclick=\"window.open('/api/exporttxt','_blank')\">📤 Text export</button></div></div>'+\n '<div class=\"card\"><h3>⚠️ Latest errors</h3>'+\n   (S.errors.length?S.errors.map(function(e){return '<div class=\"row\"><span>'+E(e.p)+'</span><span style=\"color:#f87171\">'+E(String(e.m).slice(0,70))+'</span></div>'}).join(''):'Green and clean ✨')+\n   '</div>'+\n '</div>'+\n '<div id=\"msg\" style=\"margin-top:16px;font-weight:700\"></div>';\n}\nasync function saveSet(){await api('/settings',{temperature:+document.getElementById('tp').value,maxTokens:+document.getElementById('mt').value,dailyLimit:+document.getElementById('dl').value});msg('✅ Saved','#34d399')}\nasync function setModel(){const r=await api('/settings',{model:document.getElementById('mdl').value});if(r.ok){msg('✅ Model changed','#34d399');load()}}\nasync function clearHist(){await api('/settings',{clearHist:true});msg('🧹 Main chat memory cleared','#34d399');load()}\nasync function doPing(){msg('⏳ Testing...');const r=await api('/ping');msg(r.ok?'🩺 All services checked — see the log':'❌ Error','#fbbf24')}\nload()"},"m1jgwrok":{"fa":"<!DOCTYPE html><html lang=\"fa\" dir=\"rtl\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>داشبورد ربات</title><style>%1</style></head><body><div class=\"wrap\"><div id=\"app\">⏳ در حال بارگذاری...</div></div><script>%2</script></body></html>","en":"<!DOCTYPE html><html lang=\"fa\" dir=\"rtl\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Bot Dashboard</title><style>%1</style></head><body><div class=\"wrap\"><div id=\"app\">⏳ Loading...</div></div><script>%2</script></body></html>"},"m1b0wm64":{"fa":"DASHBOARD_PASSWORD تنظیم نشده است.","en":"DASHBOARD_PASSWORD is not set."},"m05vbixl":{"fa":"Workers AI کلادفلر ☁️","en":"Cloudflare Workers AI ☁️"},"m001frqm":{"fa":"نامشخص","en":"Unknown"},"m04u1206":{"fa":"خروجی گفتگو — %1\n%2\n\n","en":"Chat export — %1\n%2\n\n"},"m1drkjyx":{"fa":"[شما]\n","en":"[You]\n"},"m0jfrd9p":{"fa":"[دستیار]\n","en":"[Assistant]\n"},"m19l14ca":{"fa":"یادآورهای امروز {{owner}}:\n%1\n\nهوای نیشابور: %2%3","en":"{{owner}}'s reminders today:\n%1\n\nNeyshabur weather: %2%3"},"m0mukgq6":{"fa":"(یادآوری نیست)","en":"(No reminders)"},"m0rz0tyd":{"fa":"\n\nحافظه {{owner}}:\n%1","en":"\n\n{{owner}}'s memory:\n%1"},"m1c9h1d6":{"fa":"%1\n\nتو خلاصه صبحگاهی {{owner}} را می‌سازی. فارسی، کوتاه، کاربردی، با ایموجی و فرمت تلگرام.","en":"%1\n\nYou write {{owner}}'s morning summary. Persian, short, practical, with emoji and Telegram formatting."},"m0n3mzk9":{"fa":"امروز %1 است. این خلاصه صبح ساعت ۱۰ را بده:\n%2","en":"Today is %1. Give this 10 AM morning summary:\n%2"},"m1rk4h7r":{"fa":"🌅 <b>خلاصه صبح بخیر {{owner}}</b> — %1\n\n%2\n\n<i>یادآورها: %3 · هوا: نیشابور</i>","en":"🌅 <b>Good morning, {{owner}}</b> — %1\n\n%2\n\n<i>Reminders: %3 · Weather: Neyshabur</i>"},"m0u0w588":{"fa":"⏰ <b>یادآور!</b>%1\n\n💬 %2","en":"⏰ <b>Reminder!</b>%1\n\n💬 %2"},"m0cnnfaw":{"fa":"%1\n\nاین یک اجرای خودکار زمان‌بندی‌شده است؛ پاسخ کوتاه، مفید و آمادهٔ ارسال در تلگرام بده.","en":"%1\n\nThis is an automated scheduled run; give a short, useful answer ready to send in Telegram."},"m1qiiekg":{"fa":"⚠️ اجرای این تسک ناموفق بود — مدل جوابی نداد.","en":"⚠️ This task run failed — the model returned nothing."},"m1mfpwzn":{"fa":"⏳ <b>تسک زمان‌بندی‌شده</b>%1\n\n%2","en":"⏳ <b>Scheduled task</b>%1\n\n%2"},"m19imdx9":{"fa":"🗄 بکاپ خودکار هفتگی — %1","en":"🗄 Weekly automatic backup — %1"},"m1fxo1jq":{"fa":"%1 <b>مدل‌های جدید در کلادفلر کشف شد!</b>\n\n%2\n\nاز منوی «🤖 انتخاب مدل» ← 🔄 لیست تازه میتوانی فعالش کنی.","en":"%1 <b>New models discovered on Cloudflare!</b>\n\n%2\n\nYou can activate them from the “🤖 Choose a model” menu ← 🔄 Refresh list."},"m0zxccnz":{"fa":"/* mock در پروداکشن غیرفعال است */","en":"/* mock is disabled in production */"},"m1mjercl":{"fa":"خطای داخلی","en":"Internal error"},"m1la1lui":{"fa":"تلاش‌های ناموفق زیاد است — %1 دقیقه دیگر دوباره امتحان کنید.","en":"Too many failed attempts — try again in %1 minutes."},"m0o7tsjn":{"fa":"رمز نادرست است.","en":"Wrong password."},"m1x7wkws":{"fa":"خطا در پردازش پیام","en":"Error processing the message"},"m0w2eptl":{"fa":"مدل نامعتبر است.","en":"Invalid model."},"m1erlebc":{"fa":"گفتگو %1","en":"Chat %1"},"m0l3fmoi":{"fa":"شناسه نامعتبر است.","en":"Invalid ID."},"m0ix2zhp":{"fa":"گفتگو پیدا نشد.","en":"Chat not found."},"m1amitkh":{"fa":"حداقل یک گفتگو باید بماند.","en":"At least one chat must remain."},"m1j7slcx":{"fa":"عملیات نامشخص است.","en":"Unknown operation."},"m06c2j1v":{"fa":"متن خالی است.","en":"The text is empty."},"m084jnlc":{"fa":"خاطره پیدا نشد.","en":"Memory not found."},"m0pty8cf":{"fa":"کلید نامعتبر است.","en":"Invalid key."},"m1nnjo5o":{"fa":"فرمت درست نیست. نمونه: «18:30 چای» یا «روزانه 08:00 ورزش» یا «45m استراحت»","en":"Invalid format. Examples: “18:30 tea” or “daily 08:00 workout” or “45m break”"},"m14oov0j":{"fa":"بدنه درخواست نامعتبر است.","en":"Invalid request body."},"m1kw1dvu":{"fa":"فایلی نرسید.","en":"No file received."},"m09ybhe9":{"fa":"ویس خالی است.","en":"The voice message is empty."},"m0obeb7t":{"fa":"ویس بیش از حد بزرگ است.","en":"The voice message is too large."},"m00vb6we":{"fa":"متنی برای صدا نیست.","en":"There is no text to turn into speech."},"m0bt2k9o":{"fa":"خطای کلید/سقف گوگل: %1","en":"Google key/quota error: %1"},"m0lkdita":{"fa":"برای متن فارسی باید GEMINI_API_KEY ست شود و موتور صدا روی «گوگل» باشد.","en":"Persian text requires GEMINI_API_KEY and the voice engine set to “Google”."},"m1292qjs":{"fa":"صدایی تولید نشد.","en":"No audio was generated."},"m07nuekz":{"fa":"تولید صدا ناموفق بود.","en":"Voice generation failed."},"m0izy80o":{"fa":"Binding AI برای صدا در دسترس نیست.","en":"The AI binding is not available for voice."},"m19wixy6":{"fa":"تولید تصویر در تنظیمات خاموش است.","en":"Image generation is turned off in the settings."},"m0uqywig":{"fa":"تولید تصویر ناموفق بود","en":"Image generation failed"},"m0uziz0m":{"fa":"تصویر پیدا نشد (شاید منقضی شده).","en":"Image not found (it may have expired)."},"m1gchinh":{"fa":"آیتم پیدا نشد.","en":"Item not found."},"m1uj91hd":{"fa":"op نامشخص","en":"Unknown op"},"m0xi2loh":{"fa":"زمان را نفهمیدم — مثال: «هر روز 08:00 اخبار AI».","en":"I couldn't understand the time — example: “daily 08:00 AI news”."},"m0uvfha0":{"fa":"سقف تسک‌ها پر است.","en":"The task limit is reached."},"m1lsps31":{"fa":"متن تسک خالی است.","en":"The task text is empty."},"m0ojfxpv":{"fa":"🌤 **هوای نیشابور**\n\n%1","en":"🌤 **Neyshabur weather**\n\n%1"},"m0vh2r6b":{"fa":"💰 **بازار کریپتو**\n\n%1","en":"💰 **Crypto market**\n\n%1"},"m11r1o8b":{"fa":"ابزار در دسترس نیست","en":"Tool unavailable"},"m12ktwun":{"fa":"ابزار نامشخص است.","en":"Unknown tool."},"m1dmay17":{"fa":"پرامپت خالی است.","en":"The prompt is empty."},"m0p1jj7b":{"fa":"سقف %1 ویجت پر است — اول یکی را حذف کن.","en":"The limit of %1 widgets is reached — delete one first."},"m1tqgsds":{"fa":"ویجت پیدا نشد.","en":"Widget not found."},"m15q1ctd":{"fa":"متد نامعتبر است.","en":"Invalid method."},"m17gr4fi":{"fa":"هوا در دسترس نیست.","en":"Weather is unavailable."},"m1rqy9fl":{"fa":"نام داده نامعتبر است.","en":"Invalid data name."},"m05g16ki":{"fa":"👤 تو:\n","en":"👤 You:\n"},"m0m4g10r":{"fa":"🤖 {{owner}} AI:\n","en":"🤖 {{brand}}:\n"},"m1in2yd5":{"fa":"گفتگو: %1 — {{owner}} AI v%2\nتاریخ خروج: %3\n\n──────────\n\n%4","en":"Chat: %1 — {{brand}} v%2\nExported: %3\n\n──────────\n\n%4"},"m1as29d3":{"fa":"(خالی)","en":"(empty)"},"m1lkb9pm":{"fa":"مسیر نامعتبر است.","en":"Invalid path."},"m0osdx2r":{"fa":"چیزی برای تولید مجدد نیست — اول یک پیام بفرست.","en":"Nothing to regenerate — send a message first."},"m0ei4a2j":{"fa":"🌤 <i>در حال گرفتن هوا...</i>","en":"🌤 <i>Fetching the weather...</i>"},"m01jl3p0":{"fa":"هوا در دسترس نیست","en":"Weather is unavailable"},"m031atyr":{"fa":"💰 <i>در حال گرفتن قیمت...</i>","en":"💰 <i>Fetching the price...</i>"},"m14lsjrb":{"fa":"قیمت در دسترس نیست","en":"Price is unavailable"},"m0x2yp3a":{"fa":"🎨 تولید تصویر در **تنظیمات** خاموش است — آن را روشن کن.","en":"🎨 Image generation is off in **Settings** — turn it on."},"m0o91y9t":{"fa":"🎨 برای تولید تصویر `GEMINI_API_KEY` لازم است (Worker ← Settings ← Secrets).","en":"🎨 Image generation requires `GEMINI_API_KEY` (Worker ← Settings ← Secrets)."},"m023cmhe":{"fa":"🎨 فرمت:\n`/image یک گربه نارنجی روی تپه، نقاشی آبرنگ`\n\nمدل فعال: `%1`","en":"🎨 Format:\n`/image an orange cat on a hill, watercolor painting`\n\nActive model: `%1`"},"m1klk24e":{"fa":"🎨 <i>دارم تصویر می‌سازم...</i>","en":"🎨 <i>Creating your image...</i>"},"m0lr0o49":{"fa":"🧠 فرمت:\n`/remember پروژه فروشگاه با جنگو`","en":"🧠 Format:\n`/remember Django shop project`"},"m1p4fs19":{"fa":"🧠 ذخیره شد: **%1** (%2/%3)","en":"🧠 Saved: **%1** (%2/%3)"},"m1nnv324":{"fa":"از قبل چیزی شبیه این در حافظه بود (%1/%2)","en":"Something similar was already in memory (%1/%2)"},"m0jj8mb0":{"fa":"🗑 فرمت: `/forget 2` یا `/forget all`","en":"🗑 Format: `/forget 2` or `/forget all`"},"m0bruwal":{"fa":"🗑 کل حافظه پاک شد.","en":"🗑 All memory cleared."},"m1t6zi84":{"fa":"شماره درست نیست. اول `/memory` را ببین.","en":"Invalid number. Check `/memory` first."},"m1leppoo":{"fa":"🗑 حذف شد: **%1**","en":"🗑 Deleted: **%1**"},"m14jqzm2":{"fa":"🧠 حافظه خالی است — خودکار یاد می‌گیرم، یا `/remember متن` بزن.","en":"🧠 Memory is empty — I'll learn automatically, or use `/remember text`."},"m0z2w8r4":{"fa":"🧠 **حافظه بلندمدت (%1/%2)**\n\n%3\n\nحذف: `/forget 2` · همه: `/forget all`","en":"🧠 **Long-term memory (%1/%2)**\n\n%3\n\nDelete: `/forget 2` · All: `/forget all`"},"m0ysn1iy":{"fa":"🧹 گفتگوی تازه شروع شد.","en":"🧹 A new conversation has started."},"m0ajkdai":{"fa":"🌅 خلاصه صبح خاموش شد.","en":"🌅 Morning summary turned off."},"m1sri6y8":{"fa":"🌅 خلاصه صبح ساعت %1 تهران روشن شد — یک نمونه برای تلگرامت فرستادم.","en":"🌅 Morning summary turned on for %1 Tehran time — I sent you a sample on Telegram."},"m096gedn":{"fa":"⏰ فرمت:\n`/remind 18:30 چای دم کن`\n`/remind روزانه 08:00 ورزش`\n`/remind 45m استراحت`","en":"⏰ Format:\n`/remind 18:30 brew tea`\n`/remind daily 08:00 workout`\n`/remind 45m break`"},"m1c1xw8a":{"fa":"⏰ ثبت شد%1 — **%2:%3** تهران، «%4»","en":"⏰ Scheduled%1 — **%2:%3** Tehran time, “%4”"},"m18eeume":{"fa":" 🔁 روزانه","en":" 🔁 Daily"},"m0l450r2":{"fa":"📤 از **تنظیمات ← خروجی گفتگو** متن کامل تاریخچه را دانلود کن.","en":"📤 Download the full transcript from **Settings ← Chat Export**."},"m0dr5k87":{"fa":"🔊 فرمت:\n`/tts سلام، خوبی؟`\n\nوویس فعال: `%1` — تغییر از **تنظیمات ← صدا**.\nمتن‌های بلندتر: روی حباب پیام 🔊 بزن.","en":"🔊 Format:\n`/tts hello, how are you?`\n\nVoice mode: `%1` — change it in **Settings ← Voice**.\nLonger text: tap the 🔊 button on the message bubble."},"m1emacaq":{"fa":"🔊 برای ساخت صدا `GEMINI_API_KEY` لازم است (Worker ← Settings ← Secrets).","en":"🔊 `GEMINI_API_KEY` is required for voice generation (Worker ← Settings ← Secrets)."},"m1m3sg2c":{"fa":"🔊 <i>دارم صدا می‌سازم...</i>","en":"🔊 <i>Generating voice...</i>"},"m14186yy":{"fa":"ساخت صدا ناموفق بود","en":"Voice generation failed"},"m01jegfx":{"fa":"🔎 فرمت:\n`/find آن کد قرارداد`\nدر همهٔ گفتگوهایت دنبال عبارت می‌گردم.","en":"🔎 Format:\n`/find that contract code`\nI'll search all your conversations for the phrase."},"m0ddnpuc":{"fa":"🔎 <i>در حال جستجو...</i>","en":"🔎 <i>Searching...</i>"},"m14pjnho":{"fa":"📭 چیزی پیدا نشد: **%1**","en":"📭 Nothing found: **%1**"},"m06nczjq":{"fa":"🔎 **%1 نتیجه برای:** %2\n\n%3","en":"🔎 **%1 results for:** %2\n\n%3"},"m03sf4bw":{"fa":"🖼 گالری خالی است — با `/image` عکسی بساز تا اینجا ذخیره شود.","en":"🖼 Gallery is empty — create an image with `/image` and it will be saved here."},"m1v7div1":{"fa":"این تصویر منقضی شده (بعد از ۳۰ روز پاک می‌شود).","en":"This image has expired (it is deleted after 30 days)."},"m02yw10f":{"fa":"تصویر","en":"Image"},"m1if2w6h":{"fa":"بدون توضیح","en":"No caption"},"m0kk51n1":{"fa":"🖼 **گالری (%1)**\n\n%2\n\nبرای ارسال مجدد: `/gallery شماره`","en":"🖼 **Gallery (%1)**\n\n%2\n\nTo resend: `/gallery number`"},"m1l5ph9g":{"fa":"📝 فرمت:\n`/sum متن بلند…`","en":"📝 Format:\n`/sum long text…`"},"m0t4ez9i":{"fa":"📝 <i>در حال خلاصه کردن...</i>","en":"📝 <i>Summarizing...</i>"},"m0d3swmp":{"fa":"📝 **خلاصه**%1\n\n%2%3","en":"📝 **Summary**%1\n\n%2%3"},"m0d85e68":{"fa":" (%1 بخش)","en":" (%1 sections)"},"m0q7ytpb":{"fa":"خلاصه‌ای ساخته نشد.","en":"No summary was generated."},"m103zcsp":{"fa":"\n\n⚠️ متن از سقف %1 کاراکتر بلندتر بود؛ فقط بخش ابتدایی خلاصه شد.","en":"\n\n⚠️ The text was longer than the %1-character limit; only the beginning was summarized."},"m1sk4va5":{"fa":"✅ تودو خالی است.\nافزودن: `/todo خرید نان`","en":"✅ Your todo list is empty.\nAdd one: `/todo buy bread`"},"m06ghlxp":{"fa":"✅ **تودوها**\n\n%1","en":"✅ **Todos**\n\n%1"},"m1knzm87":{"fa":"شماره درست نیست.","en":"Invalid number."},"m02h4m74":{"fa":"🗑 حذف شد: %1","en":"🗑 Deleted: %1"},"m1wpozgv":{"fa":"✅ اضافه شد: %1","en":"✅ Added: %1"},"m03xtq24":{"fa":"⏳ تسکی نداری.\nمثال:\n`/task هر روز 08:00 اخبار AI`","en":"⏳ You have no tasks.\nExample:\n`/task daily 08:00 AI news`"},"m0uopnzg":{"fa":"⏳ **تسک‌ها**\n\n%1","en":"⏳ **Tasks**\n\n%1"},"m1nwlaw0":{"fa":"🗑 تسک حذف شد.","en":"🗑 Task deleted."},"m0vjpbwb":{"fa":"⏳ فرمت:\n`/task هر روز 08:00 اخبار AI`\n`/task هفتگی 09:00 مرور هفته`","en":"⏳ Format:\n`/task daily 08:00 AI news`\n`/task weekly 09:00 weekly review`"},"m14221jq":{"fa":"✅ تسک ثبت شد %1\n💬 %2","en":"✅ Task saved %1\n💬 %2"},"m1j27vq4":{"fa":"🔎 فرمت: `/memfind پروژه`","en":"🔎 Format: `/memfind project`"},"m0kt28mc":{"fa":"📭 چیزی در حافظه پیدا نشد: %1","en":"📭 Nothing found in memory: %1"},"m1xhf763":{"fa":"🧠 **حافظه**\n\n%1","en":"🧠 **Memory**\n\n%1"},"m0c7cgc4":{"fa":"🌐 فرمت:\n`/translate سلام دنیا`\n\nفارسی↔انگلیسی خودکار تشخیص داده میشود.","en":"🌐 Format:\n`/translate hello world`\n\nPersian↔English is detected automatically."},"m0anxs2n":{"fa":"🌐 <i>در حال ترجمه...</i>","en":"🌐 <i>Translating...</i>"},"m08csxgs":{"fa":"ترجمه ناموفق بود","en":"Translation failed"},"m1dojn9x":{"fa":"🔎 فرمت:\n`/web قیمت بیت کوین امروز`","en":"🔎 Format:\n`/web bitcoin price today`"},"m15g3aah":{"fa":"🔎 `SEARCH_API_KEY` تنظیم نشده (Worker ← Settings ← Secrets).","en":"🔎 `SEARCH_API_KEY` is not set (Worker ← Settings ← Secrets)."},"m089z4rj":{"fa":"این‌ها مخصوص منوی تلگرام‌اند — اینجا از **تنظیمات**، **انتخاب مدل** و **آمار** استفاده کن.","en":"These are for the Telegram menu — use **Settings**, **Model selection** and **Stats** here."},"m115nlgh":{"fa":"\n\n📎 محتوای فایل «%1»:\n<|FILE_START|>\n%2\n<|FILE_END|>","en":"\n\n📎 File content “%1”:\n<|FILE_START|>\n%2\n<|FILE_END|>"},"m0abc4ft":{"fa":"فایل","en":"File"},"m1qhftot":{"fa":"⚡ <i>دارم آماده می‌شوم...</i>","en":"⚡ <i>Getting ready...</i>"},"m08zbpvl":{"fa":"متنی نفرستادی.","en":"You didn't send any text."},"m0t7ebbc":{"fa":"SEARCH_API_KEY تنظیم نشده (Worker ← Settings ← Secrets).","en":"`SEARCH_API_KEY` is not set (Worker ← Settings ← Secrets)."},"m1yucpp6":{"fa":"🔎 <i>جستجوی وب...</i>","en":"🔎 <i>Searching the web...</i>"},"m0x828qa":{"fa":"نتایج جستجوی وب (Tavily) برای «%1»:\n%2","en":"Web search results (Tavily) for “%1”:\n%2"},"m1gq3vo8":{"fa":"جستجوی وب ناموفق بود.","en":"Web search failed."},"m04i2bvf":{"fa":"مدل فعال عکس نمی‌فهمد — از انتخاب مدل، مدل 👁 بگیر یا «👁 سوییچ خودکار» را روشن کن.","en":"The active model can't understand images — pick a 👁 model in Model selection, or turn on “👁 Auto-switch”."},"m1s8u5h4":{"fa":"مدل عکس‌فهمی در دسترس نیست.","en":"No vision-capable model is available."},"m0qan5wf":{"fa":" · این پیام با %1 (عکس‌فهم) تحلیل شد","en":" · This message was analyzed by %1 (vision)"},"m1fqc776":{"fa":"این عکس/فایل را بررسی کن.","en":"Take a look at this image/file."},"m1sreiq9":{"fa":"خطای مدل","en":"Model error"},"m1ioz4gs":{"fa":"⚠️ %1 — <i>سوییچ خودکار به %2</i>","en":"⚠️ %1 — <i>auto-switching to %2</i>"},"m1f7ihn9":{"fa":"پاسخی از مدل نرسید.","en":"No response from the model."},"m05xy4it":{"fa":"پیام بدون متن","en":"Message without text"},"m1f8p06f":{"fa":"ویجت","en":"Widget"},"m011jgxy":{"fa":"یادآور","en":"Reminder"},"m03g58op":{"fa":"نیشابور","en":"Nishapur"},"m0172fa1":{"fa":"یادداشت","en":"Note"},"m1m4c883":{"fa":"هوای نیشابور","en":"Neyshabur Weather"},"m0zl2rxs":{"fa":"مصرف امروز","en":"Today's usage"},"m0cfn323":{"fa":"یادآور روزانه","en":"Daily reminder"},"m0mk6fps":{"fa":"لیست","en":"List"},"m03bydy7":{"fa":"ساعت تهران","en":"Tehran time"},"m06bt1d9":{"fa":"تقویم امروز","en":"Today's date"},"m07h1ysm":{"fa":"تلاش‌های ناموفق زیاد است — %1 دقیقه دیگر.","en":"Too many failed attempts — try again in %1 min."},"m1a4onem":{"fa":"✅ متصل","en":"✅ Connected"},"m03rkab0":{"fa":"❌ ست نشده","en":"❌ Not set"},"m0d4q0q5":{"fa":"<!DOCTYPE html><html lang=\"fa\" dir=\"rtl\"><head><meta charset=\"utf-8\"><title>ربات</title></head><body style=\"font-family:Tahoma;text-align:center;padding:48px\"><h2>🤖 ربات فعال است</h2><p>این آدرس برای وب‌هوک تلگرام است؛ از داخل تلگرام استفاده کنید.</p><p><a href=\"/dashboard\">🌐 داشبورد مدیریتی</a></p></body></html>","en":"<!DOCTYPE html><html lang=\"en\" dir=\"ltr\"><head><meta charset=\"utf-8\"><title>Bot</title></head><body style=\"font-family:Tahoma;text-align:center;padding:48px\"><h2>🤖 The bot is running</h2><p>This address is for the Telegram webhook; use the bot from inside Telegram.</p><p><a href=\"/dashboard\">🌐 Admin dashboard</a></p></body></html>"},"m1k15sil":{"fa":"⛔ دسترسی ندارید","en":"⛔ Access denied"},"m152h8p6":{"fa":"⛔ فقط مدیر","en":"⛔ Admin only"},"m0tis57h":{"fa":"⛔ سقف %1 سرویس کاستوم پر است.","en":"⛔ Custom service limit of %1 reached."},"m0swb6sa":{"fa":"⛔ سقف %1 کلید پر است","en":"⛔ Key limit of %1 reached"},"m1t4fx2o":{"fa":"⛔ سقف %1 کلید برای هر سرویس پر است — اول یکی را حذف کن.","en":"⛔ Per-service key limit of %1 reached — delete one first."},"m1rkc7e1":{"fa":"%1 کلید %2 حذف شد","en":"%1 key %2 deleted"},"m0vpitua":{"fa":"کلید حذف شد","en":"Key deleted"},"m0b7on10":{"fa":"⏳ تست سلامت...","en":"⏳ Health check..."},"m08ta3de":{"fa":"🩺 <b>سلامت «%1»</b>\n\n%2\n\n🔗 <code>%3</code>\n🔑 %4","en":"🩺 <b>Health of “%1”</b>\n\n%2\n\n🔗 <code>%3</code>\n🔑 %4"},"m0ppor7n":{"fa":"🔄 مجدد","en":"🔄 Retry"},"m138mkur":{"fa":"🔑 کلیدها","en":"🔑 Keys"},"m16ywyfe":{"fa":"%1 تست ناموفق بود.","en":"%1 test failed."},"m00ddzyp":{"fa":"⏳ در حال کاوش /models...","en":"⏳ Exploring /models..."},"m1ejcoip":{"fa":"%1 کاوش انجام نشد (%2). با «➕ مدل دستی» آیدی دقیق را وارد کن.","en":"%1 exploration failed (%2). Use “➕ Manual model” to enter the exact ID."},"m0bu4xi0":{"fa":"⌛ لیست عوض شده","en":"⌛ List changed"},"m1e149se":{"fa":"⌛ لیست کاوش عوض شده — از منوی سرویس دوباره کاوش کن.","en":"⌛ Explore list changed — explore again from the service menu."},"m05db4i8":{"fa":"➖ همین الان در لیست است","en":"➖ Already in the list"},"m0zurdar":{"fa":"⛔ سقف مدل","en":"⛔ Model limit"},"m1qjb97j":{"fa":"⛔ سقف %1 مدل برای هر سرویس پر است.","en":"⛔ Per-service model limit of %1 reached."},"m07pehx1":{"fa":"%1 اضافه شد (%2/%3)","en":"%1 added (%2/%3)"},"m0z98t31":{"fa":"⌛ منوی قدیمی — از 🔌 دوباره باز کن","en":"⌛ Old menu — reopen it from 🔌"},"m0b4rjyg":{"fa":"%1 مدل حذف شد","en":"%1 model deleted"},"m1fa3cu9":{"fa":"⌛ منوی قدیمی","en":"⌛ Old menu"},"m0ybfzvs":{"fa":"⌛ مدل حذف شده","en":"⌛ Model deleted"},"m040gipl":{"fa":"🧭 این مدل دیگر در لیست نیست — از منوی 🤖 دوباره انتخاب کن.","en":"🧭 This model is no longer in the list — pick it again from the 🤖 menu."},"m16x2fb5":{"fa":"%1 این مدل عکس‌فهم شد 👁","en":"%1 — this model now has vision 👁"},"m0oi7qii":{"fa":"🚫 عکس‌فهمی خاموش شد","en":"🚫 Vision disabled"},"m1t6cbxs":{"fa":"⚠️ <b>حذف «%1»؟</b>\n\n%2 مدلش از لیست‌ها حذف میشود و کاربرانی که روی آن هستند به مدل پیش‌فرض کلادفلر برمیگردند. کلید API هم پاک میشود.","en":"⚠️ <b>Delete “%1”?</b>\n\nIts %2 model will be removed from the lists, and any users on it will be switched back to the default Cloudflare model. The API key will be cleared as well."},"m1kb3y6a":{"fa":"✅ بله، حذف کن","en":"✅ Yes, delete it"},"m1ihcuh8":{"fa":"↩️ انصراف","en":"↩️ Cancel"},"m1glo0hc":{"fa":"%1 سرویس حذف شد%2","en":"%1 service deleted%2"},"m027y5rd":{"fa":" — %1 کاربر به مدل پیش‌فرض برگشتند","en":" — %1 users switched back to the default model"},"m0bpj753":{"fa":"⏳ در حال استخراج لیست تازه...","en":"⏳ Fetching a fresh list..."},"m1w21uqe":{"fa":"🧭 مدل حذف شده","en":"🧭 Model deleted"},"m1mtnwic":{"fa":"%1 مدل فعال شد:\n<b>%2</b>\n%3 · 📏 کانتکست %4K","en":"%1 model activated:\n<b>%2</b>\n%3 · 📏 Context %4K"},"m18za59v":{"fa":"⛽ <b>سقف روزانه</b>\n\nتعداد هزار توکن مجاز در روز را بفرست (مثلاً <code>200</code>). صفر یعنی بی‌سقف.\nلغو: /cancel","en":"⛽ <b>Daily limit</b>\n\nSend the allowed number of thousand tokens per day (e.g. <code>200</code>). Zero means unlimited.\nCancel: /cancel"},"m178g1ea":{"fa":"📝 <b>پرامپت سیستمی دلخواه</b>\n\nدستورالعملی که همیشه به رفتار ربات اضافه شود را بفرست (مثلاً «همیشه خیلی کوتاه جواب بده»). خالی فرستادی پاک میشود.\nلغو: /cancel","en":"📝 <b>Custom system prompt</b>\n\nSend the instruction to always add to the bot's behavior (e.g. “always answer very briefly”). Send an empty message to clear it.\nCancel: /cancel"},"m08po0h6":{"fa":"🧠 متن خاطره را بفرست (مثل: «پروژه فروشگاه اینترنتی با جنگو»).\nلغو: /cancel","en":"🧠 Send the memory text (e.g. “e-commerce project with Django”).\nCancel: /cancel"},"m02pgq4y":{"fa":"✏️ به شکل «شماره | متن جدید» بفرست. مثال:\n<code>2 | پروژه ربات تلگرام با پایتون</code>\nلغو: /cancel","en":"✏️ Send it as “number | new text”. Example:\n<code>2 | Telegram bot project with Python</code>\nCancel: /cancel"},"m1ubu2n2":{"fa":"پاک شد","en":"Cleared"},"m0i9xl7k":{"fa":"حذف شد","en":"Deleted"},"m0t2bz6p":{"fa":"🧠 <b>حافظه بلندمدت</b> (%1)\n\n%2","en":"🧠 <b>Long-term memory</b> (%1)\n\n%2"},"m1ihkad4":{"fa":"خالی است.","en":"Empty."},"m0k2awem":{"fa":"کلید گوگل ست نیست (GEMINI_API_KEY)","en":"Google key is not set (GEMINI_API_KEY)"},"m0xbu9ms":{"fa":"وویس: %1","en":"Voice: %1"},"m0pjrxci":{"fa":"در حال ساخت نمونه صدا...","en":"Creating a voice sample..."},"m1tqybd0":{"fa":"سلام {{owner}}! من دستیار صوتی تو هستم. این صدای %1 است.","en":"Hi {{owner}}! I'm your voice assistant. This is the %1 voice."},"m0zk2lt7":{"fa":"❌ تست صدای گوگل نشد — کلید GEMINI_API_KEY یا سقف رایگان را چک کن.","en":"❌ Google voice test failed — check the GEMINI_API_KEY or the free-tier limit."},"m0g83ila":{"fa":"%1 حافظه این گفتگو پاک شد — از نو شروع کنیم! ✨","en":"%1 — the memory of this chat was cleared — let's start fresh! ✨"},"m0g6qwas":{"fa":"📚 متن پرامپت را بفرست تا در کتابخانه ذخیره شود.\nلغو: /cancel","en":"📚 Send the prompt text to save it in the library.\nCancel: /cancel"},"m1f0vb9x":{"fa":"%1 تست سلامت ناموفق بود.","en":"%1 health check failed."},"m1k4f7x2":{"fa":"بدون سوال","en":"No question"},"m0i4af02":{"fa":"%1 ذخیره شد","en":"%1 saved"},"m17fazrc":{"fa":"⛔ این مورد مال تو نیست","en":"⛔ This item isn't yours"},"m0azigkn":{"fa":"🗑 حذف","en":"🗑 Delete"},"m0p3af3m":{"fa":"چیزی برای تکرار نیست","en":"Nothing to repeat"},"m0uz8dc4":{"fa":"🤷 در این گفتگو هنوز چیزی برای تکرار نیست.","en":"🤷 There's nothing to repeat in this chat yet."},"m0ddwlzr":{"fa":"⛔ پشتیبان‌گیری فقط برای مدیر","en":"⛔ Backup is for admins only"},"m1kw0d0m":{"fa":"⏳ در حال ساخت فایل...","en":"⏳ Building the file..."},"m0ykatwm":{"fa":"%1 ساخت فایل پشتیبان ناموفق بود.","en":"%1 failed to build the backup file."},"m01pi7i4":{"fa":"⛔ بازیابی فقط برای مدیر","en":"⛔ Restore is for admins only"},"m15usjk8":{"fa":"↩️ <b>بازیابی بکاپ</b>\n\nحالا فایل JSON بکاپ را بفرستید (یا متن آن را paste کنید).\n⚠️ تنظیمات، گفتگوها، خاطره‌ها و ویجت‌های فعلی با محتوای فایل جایگزین میشوند.\nلغو: /cancel","en":"↩️ <b>Restore backup</b>\n\nNow send the backup JSON file (or paste its contents).\n⚠️ Current settings, chats, memories and widgets will be replaced by the file contents.\nCancel: /cancel"},"m11aanc0":{"fa":"⏰ زمان و متن یادآور را بفرست:\n<code>18:30 چای دم کن</code>\n<code>45m استراحت</code>\nلغو: /cancel","en":"⏰ Send the reminder time and text:\n<code>18:30 Put the kettle on</code>\n<code>45m Take a break</code>\nCancel: /cancel"},"m19i3m0r":{"fa":"✅ <b>تودولیست</b>\n\n%1\n\n✍️ متن کار تازه را بفرست تا اضافه شود.\nتیک/حذف: <code>/todo done 1</code> · <code>/todo del 1</code>\nلغو: /cancel","en":"✅ <b>Todo list</b>\n\n%1\n\n✍️ Send the text of a new task to add it.\nCheck/delete: <code>/todo done 1</code> · <code>/todo del 1</code>\nCancel: /cancel"},"m14n5t4v":{"fa":"⏳ <b>تسک‌های زمان‌بندی‌شده با AI</b>\n\n%1\n\nافزودن: <code>/task هر روز 08:00 خلاصهٔ اخبار AI</code>\nحذف: <code>/task del 1</code>","en":"⏳ <b>AI scheduled tasks</b>\n\n%1\n\nAdd: <code>/task every day 08:00 AI news summary</code>\nDelete: <code>/task del 1</code>"},"m0y45ydf":{"fa":"هنوز تسکی نیست.","en":"No tasks yet."},"m0jj1nn9":{"fa":"⏳ <b>تسک‌ها</b>\n\n%1","en":"⏳ <b>Tasks</b>\n\n%1"},"m1krerrn":{"fa":"🖼 گالری خالی است — با /image عکسی بساز تا اینجا ذخیره شود (۳۰ روز می‌ماند).","en":"🖼 The gallery is empty — generate an image with /image and it will be saved here (kept for 30 days)."},"m1bt0wd7":{"fa":"🖼 <b>گالری (%1)</b>\n\nروی هر عکس بزن تا دوباره فرستاده شود.","en":"🖼 <b>Gallery (%1)</b>\n\nTap any image to send it again."},"m17p2kvb":{"fa":"%1 این تصویر منقضی شده است.","en":"%1 This image has expired."},"m1hejoom":{"fa":"🔎 <b>جستجو در همهٔ گفتگوها</b>\n\nعبارت را بفرست (حداقل ۲ حرف).\nلغو: /cancel","en":"🔎 <b>Search all chats</b>\n\nSend the phrase to search for (at least 2 characters).\nCancel: /cancel"},"m1hzemkv":{"fa":"⛽ <b>سهمیهٔ تصویر روزانه</b>\n\nفرمت: <code>آیدی عددی | تعداد عکس</code>\nمثال: <code>123456789 | 10</code>\nصفر = بی‌سقف\n\nیادآوری: مدیر همیشه بی‌سقف است.\nلغو: /cancel","en":"⛽ <b>Daily image quota</b>\n\nFormat: <code>numeric ID | number of images</code>\nExample: <code>123456789 | 10</code>\nZero = unlimited\n\nNote: the admin is always unlimited.\nCancel: /cancel"},"m0dh5ewl":{"fa":"👥 آیدی عددی کاربر را بفرست (اختیاری: بعد از فاصله اسمش):\nمثلاً <code>123456789 علی</code>","en":"👥 Send the user's numeric ID (optional: their name after a space):\nExample: <code>123456789 Ali</code>"},"m0jdeepr":{"fa":"⛔ <b>دسترسی ندارید.</b>\nاین ربات خصوصی است.","en":"⛔ <b>Access denied.</b>\nThis bot is private."},"m1fxm35l":{"fa":" دستور «<code>%1</code>» را نمی‌شناسم — لیست دستورها: /help","en":" I don't recognize the command \"<code>%1</code>\" — command list: /help"},"m0sezqye":{"fa":"%1 فایل JSON بکاپ خوانده نشد. دوباره بفرستید (فقط .json).","en":"%1 The backup JSON file could not be read. Send it again (.json only)."},"m19t6q6e":{"fa":"%1 بازیابی انجام نشد: %2","en":"%1 Restore failed: %2"},"m0wez77p":{"fa":"%1 بکاپ بازیابی شد 🗄 — تنظیمات، گفتگوها، خاطره‌ها و ویجت‌ها برگشتند.","en":"%1 Backup restored 🗄 — settings, chats, memories, and widgets are back."},"m0y5t1g0":{"fa":"%1 سقف روزانه: <b>%2</b>","en":"%1 Daily limit: <b>%2</b>"},"m13m57j2":{"fa":"برداشته شد ♾","en":"Removed ♾"},"m109dy58":{"fa":" پرامپت سیستمی ذخیره شد ✍️","en":" System prompt saved ✍️"},"m1tbrfla":{"fa":" پرامپت سیستمی پاک شد.","en":" System prompt cleared."},"m1ht8n3f":{"fa":"%1 پرامپت در کتابخانه ذخیره شد! از منوی 📚 اجرایش کن.","en":"%1 Prompt saved to the library! Run it from the 📚 menu."},"m1bnwrya":{"fa":"%1 زمان را نفهمیدم! نمونه:\n<code>18:30 چای</code> یا <code>روزانه 08:00 ورزش</code> یا <code>45m استراحت</code>","en":"%1 I couldn't understand the time! Examples:\n<code>18:30 tea</code> or <code>daily 08:00 workout</code> or <code>45m break</code>"},"m0zrvigh":{"fa":"%1 یادآور ثبت شد ⏰\n<b>%2:%3</b> به وقت تهران — «%4»","en":"%1 Reminder set ⏰\n<b>%2:%3</b> Tehran time — \"%4\""},"m03lhvxb":{"fa":"%1 متن خالی است.","en":"%1 The text is empty."},"m1in7o29":{"fa":"%1 اضافه شد: %2\n(%3 کار باقی) — تیک: /todo done %4","en":"%1 Added: %2\n(%3 left) — to tick it off: /todo done %4"},"m102js5y":{"fa":"📭 چیزی پیدا نشد: «%1»","en":"📭 Nothing found: \"%1\""},"m1cai5l5":{"fa":"🔎 <b>%1 نتیجه برای</b> «%2»\n\n%3","en":"🔎 <b>%1 results for</b> \"%2\"\n\n%3"},"m1hjy90d":{"fa":"%1 فرمت: «آیدی | تعداد» — مثال: <code>123456789 | 10</code>","en":"%1 Format: \"ID | amount\" — example: <code>123456789 | 10</code>"},"m1sa9jh3":{"fa":"%1 سهمیهٔ <code>%2</code> = <b>%3</b>","en":"%1 Quota for <code>%2</code> = <b>%3</b>"},"m1skob91":{"fa":"%1 عکس در روز","en":"%1 images per day"},"m0knucpz":{"fa":"بی‌سقف ♾","en":"Unlimited ♾"},"m1ux7f4b":{"fa":"%1 آیدی عددی معتبر نیست.","en":"%1 Not a valid numeric ID."},"m0egij2w":{"fa":"%1 کاربر <code>%2</code> اضافه شد 👥","en":"%1 User <code>%2</code> added 👥"},"m16pccr9":{"fa":"%1 به حافظه اضافه شد 🧠","en":"%1 Added to memory 🧠"},"m09bzqqm":{"fa":"%1 تکراری بود یا خالی.","en":"%1 Duplicate or empty."},"m1v2qmn4":{"fa":"%1 ویرایش شد ✏️","en":"%1 Edited ✏️"},"m080aqqz":{"fa":"%1 شماره درست نیست.","en":"%1 Invalid number."},"m0npkj1n":{"fa":"%1 فرمت: «شماره | متن جدید»","en":"%1 Format: \"number | new text\""},"m1kt27iy":{"fa":"%1 یک نام معتبر (۱ تا ۳۲ حرف) بفرست.\nلغو: /cancel","en":"%1 Send a valid name (1 to 32 characters).\nCancel: /cancel"},"m14a7zjh":{"fa":"%1 آدرس نامعتبره — باید مثل <code>https://api.x.com/v1</code> باشه.\nلغو: /cancel","en":"%1 Invalid URL — it must look like <code>https://api.x.com/v1</code>.\nCancel: /cancel"},"m17b8a4j":{"fa":"%1 کلید به‌نظر نامعتبر میاد (حداقل %2 و حداکثر %3 کاراکتر بدون فاصله). دوباره بفرست یا /cancel","en":"%1 The key looks invalid (at least %2 and at most %3 characters, no spaces). Send it again or /cancel"},"m0ejgkqx":{"fa":"🔌 سرویس «%1» ساخته شد ✔️\n🔎 در حال کاوش خودکار مدل‌ها (<code>%2/models</code>)...","en":"🔌 Service \"%1\" created ✔️\n🔎 Auto-probing models (<code>%2/models</code>)..."},"m1wb9onq":{"fa":"%1 کاوش خودکار نشد (%2).\n✍️ حالا <b>نام دقیق مدل</b> را بنویس (چندتا با ویرگول؛ اختیاری: <code>my-model 128k</code>)\nلغو: /cancel","en":"%1 Auto-probe failed (%2).\n✍️ Now type the <b>exact model name</b> (several separated by commas; optional: <code>my-model 128k</code>)\nCancel: /cancel"},"m1yh7mvd":{"fa":"%1 سرویس پیدا نشد (حذف شده؟).","en":"%1 Service not found (deleted?)."},"m1nl12v2":{"fa":"%1 آیدی مدل معتبر نبود (فقط حروف/اعداد/- _ / . : تا ۱۵۰ کاراکتر). از منوی 🔌 «➕ مدل دستی» دوباره امتحان کن.","en":"%1 Invalid model ID (letters/digits/- _ / . : only, up to 150 characters). Try again from the 🔌 \"➕ Manual model\" menu."},"m0wcku8x":{"fa":"%1 <b>%2</b> مدل به «%3» اضافه شد — از منوی 🤖 انتخاب مدل فعالش کن.","en":"%1 Model <b>%2</b> added to \"%3\" — activate it from the 🤖 model menu."},"m1k5ju5y":{"fa":"%1 سرویس حذف شده.","en":"%1 Service deleted."},"m0gmmytc":{"fa":"%1 نام خالی نمیشه.","en":"%1 Name cannot be empty."},"m1a510vh":{"fa":"%1 نام به «%2» عوض شد.","en":"%1 Name changed to \"%2\"."},"m04vzm1x":{"fa":"%1 آدرس نامعتبر — برای اطمینان بعدش «🔄 کاوش مدل» را بزن.","en":"%1 Invalid URL — press \"🔄 Probe model\" afterwards to be sure."},"m0niplq6":{"fa":"%1 آدرس عوض شد: <code>%2</code>\nمدل‌ها دست‌نخورده‌اند؛ پیشنهاد: «🔄 کاوش مدل».","en":"%1 URL changed: <code>%2</code>\nModels are untouched; we recommend \"🔄 Probe model\"."},"m1d0sm13":{"fa":"%1 کلید نامعتبر به‌نظر میرسد.","en":"%1 The key looks invalid."},"m02hnuk1":{"fa":"%1 کلید اضافه شد (%2/%3): <code>%4</code>","en":"%1 Key added (%2/%3): <code>%4</code>"},"m06byytx":{"fa":"⛔ سقف %1 کلید برای این سرویس پر است — اول یکی را حذف کن.","en":"⛔ The limit of %1 keys for this service is reached — delete one first."},"m1y8wv5p":{"fa":"⚠️ این کلید از قبل در لیست است.","en":"⚠️ This key is already in the list."},"m0ppl6sq":{"fa":"%1 کلید %2 اضافه شد: <code>%3</code>","en":"%1 Key %2 added: <code>%3</code>"},"m1x2dhio":{"fa":"%1 عدد کا-توکن معتبر بفرست (مثلاً 128).","en":"%1 Send a valid K-token count (e.g. 128)."},"m1qswibp":{"fa":"%1 کانتکست «%2» = <b>%3K</b>","en":"%1 Context \"%2\" = <b>%3K</b>"},"m1wmdiq9":{"fa":"%1 عکس خوانده نشد یا بزرگ‌تر از سقف بود (حداکثر ۴ مگابایت).","en":"%1 The image could not be read or was larger than the limit (max 4 MB)."},"m0b861td":{"fa":"🖌 توضیح ویرایش را بعد از «ویرایش:» بنویس. مثال: «ویرایش: آسمان را غروب کن»","en":"🖌 Write your edit prompt after \"edit:\". Example: \"edit: turn the sky into a sunset\""},"m0wbseun":{"fa":"🎨 تولید تصویر خاموش است — از ⚙️ تنظیمات روشنش کن.","en":"🎨 Image generation is off — turn it on in ⚙️ Settings."},"m088ke95":{"fa":"%1 ویس خوانده نشد یا بزرگ‌تر از سقف بود (حداکثر ۲ مگابایت).","en":"%1 The voice message could not be read or was larger than the limit (max 2 MB)."},"m0s14x2z":{"fa":"%1 تبدیل ویس به متن نشد: %2","en":"%1 Voice-to-text conversion failed: %2"},"m18txcdm":{"fa":"هفتگی ","en":"Weekly "},"m1egeyo4":{"fa":"روزانه ","en":"Daily "},"m0wkggkw":{"fa":"%1 تسک %2 ساخته شد — اولین اجرا <b>%3:%4</b> تهران\n💬 %5","en":"%1 Task %2 created — first run <b>%3:%4</b> Tehran time\n💬 %5"},"m0c4ur19":{"fa":"%1 یادآور ثبت شد ⏰\n<b>%2:%3</b> به وقت تهران — «%4»\n<i>(از متن خودت فهمیدم — /todo برای کارها)</i>","en":"%1 Reminder set ⏰\n<b>%2:%3</b> Tehran time — \"%4\"\n<i>(I picked it up from your message — /todo is for tasks)</i>"},"m0p16vdf":{"fa":"کاربر","en":"User"},"m1x19yq4":{"fa":"📎 پیامی که به آن پاسخ دادی (از %1):\n<|REPLY_START|>\n%2\n<|REPLY_END|>\n\n","en":"📎 The message you replied to (from %1):\n<|REPLY_START|>\n%2\n<|REPLY_END|>\n\n"},"m1x74gtg":{"fa":"🙂 متنی یا عکسی بفرست تا کمکت کنم! برای راهنما /help","en":"🙂 Send a text or an image and I'll help! For help, /help"},"m1py50hw":{"fa":"\n\n📎 فایل PDF «%1\" خیلی بزرگ بود (حداکثر %2 مگابایت).","en":"\n\n📎 The PDF file \"%1\" was too large (max %2 MB)."},"m1drucif":{"fa":"\n\n📎 فایل «%1» خوانده نشد — برای PDF به کلید GEMINI_API_KEY نیاز است (Worker ← Settings ← Secrets).","en":"\n\n📎 The file \"%1\" could not be read — PDFs need a GEMINI_API_KEY (Worker ← Settings ← Secrets)."},"m0c71ikm":{"fa":"\n\n📎 فایل «%1\" خیلی بزرگ بود یا دانلود نشد (حداکثر ۶ مگابایت).","en":"\n\n📎 The file \"%1\" was too large or could not be downloaded (max 6 MB)."},"m0wxcg0v":{"fa":"\n\n📎 محتوای سند PDF «%1»:\n<|FILE_START|>\n%2\n<|FILE_END|>","en":"\n\n📎 Contents of the PDF \"%1\":\n<|FILE_START|>\n%2\n<|FILE_END|>"},"m12x15ww":{"fa":"\n\n📎 فایل «%1\" خیلی بزرگ بود (حداکثر ۲۰۰KB).","en":"\n\n📎 The file \"%1\" was too large (max 200KB)."},"m0k2v20w":{"fa":"🔁 روزانه","en":"🔁 Daily"},"m1wvtx2k":{"fa":"🗓 هفتگی","en":"🗓 Weekly"},"m1jhc1hk":{"fa":"📅 ماهانه","en":"📅 Monthly"},"m11hu893":{"fa":"🔄 هر N روز","en":"🔄 Every N days"},"m1dhy9ai":{"fa":"یک‌بار","en":"Once"},"m07llsqr":{"fa":"%1 <b>سلام!</b> به ربات هوش مصنوعی خودت خوش اومدی 🎉\n\nبا مدل‌های Workers AI خود کلادفلر ☁️ حرف میزنیم. همه‌چیز از پنل زیر قابل تنظیمه:","en":"%1 <b>Hello!</b> Welcome to your own AI bot 🎉\n\nWe chat with Cloudflare's own Workers AI models ☁️ Everything is configurable from the panel below:"},"m0s5o55t":{"fa":"%1 پنل اصلی","en":"%1 Main panel"},"m0m32lf1":{"fa":"%1 <b>%2</b> از نو شروع شد! حافظه پاک شد ✨","en":"%1 <b>%2</b> restarted! Memory cleared ✨"},"m16ee8fa":{"fa":"📚 متن پرامپت را بفرست تا ذخیره شود. لغو: /cancel","en":"📚 Send the prompt text to save it. Cancel: /cancel"},"m0ytwmc4":{"fa":"%1 لغو شد.","en":"%1 Cancelled."},"m0mj740u":{"fa":"🔌 افزودن سرویس فقط در چت خصوصی ربات.","en":"🔌 Adding a service is only possible in the bot's private chat."},"m0w12m1w":{"fa":"⛔ فقط مدیر میتواند سرویس اضافه کند.","en":"⛔ Only the admin can add a service."},"m16uowci":{"fa":"🔌 مدیریت سرویس‌ها فقط در چت خصوصی ربات.","en":"🔌 Managing services is only possible in the bot's private chat."},"m0san7u4":{"fa":"⛔ فقط مدیر.","en":"⛔ Admin only."},"m11cp206":{"fa":"⏰ فرمت:\n<code>/remind 18:30 چای دم کن</code>\n<code>/remind روزانه 08:00 ورزش</code>\n<code>/remind 45m استراحت</code>","en":"⏰ Format:\n<code>/remind 18:30 put the kettle on</code>\n<code>/remind daily 08:00 workout</code>\n<code>/remind 45m take a break</code>"},"m0zh1oic":{"fa":"%1 ثبت شد!%2 <b>%3:%4</b> تهران — «%5»","en":"%1 Saved!%2 <b>%3:%4</b> Tehran — “%5”"},"m1jgabks":{"fa":"🔎 فرمت: <code>/web قیمت بیت کوین امروز</code>","en":"🔎 Format: <code>/web bitcoin price today</code>"},"m1i06i2v":{"fa":"🔎 SEARCH_API_KEY تنظیم نشده (Worker ← Settings ← Secrets).","en":"🔎 SEARCH_API_KEY is not set (Worker ← Settings ← Secrets)."},"m132pgpd":{"fa":"با این نتایج، به این سوال فارسی جواب بده: %1","en":"Using these results, answer this question in Persian: %1"},"m0bflqnb":{"fa":"%1 سرچ نشد: %2","en":"%1 Search failed: %2"},"m13r3zno":{"fa":"🌤 <b>هوای نیشابور</b>\n\n%1","en":"🌤 <b>Neyshabur weather</b>\n\n%1"},"m02n8h7e":{"fa":"💰 <b>بازار کریپتو</b>\n\n%1","en":"💰 <b>Crypto market</b>\n\n%1"},"m0w1ho9v":{"fa":"🎨 <b>تولید تصویر خاموش است.</b>\nاز ⚙️ تنظیمات ← «🎨 تولید تصویر» روشنش کن.","en":"🎨 <b>Image generation is off.</b>\nTurn it on via ⚙️ Settings ← “🎨 Image generation”."},"m07r2tk2":{"fa":"🎨 روشن کنم","en":"🎨 Turn it on"},"m0ja2c6v":{"fa":"🎨 برای تولید تصویر <code>GEMINI_API_KEY</code> لازم است (یا فالبک رایگان را روشن کن).\nWorker ← Settings ← Variables and Secrets ← Add ← نام: GEMINI_API_KEY","en":"🎨 Image generation requires <code>GEMINI_API_KEY</code> (or enable the free fallback).\nWorker ← Settings ← Variables and Secrets ← Add ← name: GEMINI_API_KEY"},"m1dii9n0":{"fa":"🎨 فرمت: <code>/image یک گربه نارنجی روی تپه، نقاشی آبرنگ</code>\nمدل فعال: <b>%1</b>","en":"🎨 Format: <code>/image an orange cat on a hill, watercolor painting</code>\nActive model: <b>%1</b>"},"m14ls76j":{"fa":"🔊 فرمت: <code>/tts سلام، خوبی؟</code>\nوویس: <b>%1</b> · مدل: <code>%2</code>\nتغییر از ⚙️ تنظیمات.","en":"🔊 Format: <code>/tts hello, how are you?</code>\nVoice: <b>%1</b> · Model: <code>%2</code>\nChange it in ⚙️ Settings."},"m1rjzl9l":{"fa":"🔊 برای ساخت صدا <code>GEMINI_API_KEY</code> لازم است.\nWorker ← Settings ← Variables and Secrets ← Add ← نام: GEMINI_API_KEY","en":"🔊 Voice generation requires <code>GEMINI_API_KEY</code>.\nWorker ← Settings ← Variables and Secrets ← Add ← name: GEMINI_API_KEY"},"m1yjv98q":{"fa":"%1 صدا ساخته نشد — چند ثانیه بعد دوباره تلاش کن.","en":"%1 Voice could not be generated — try again in a few seconds."},"m0uxc72i":{"fa":"🔎 فرمت: <code>/find آن کد قرارداد</code>\nدر همهٔ گفتگوهایت دنبال عبارت می‌گردم — بدون مدل و بدون هزینه.","en":"🔎 Format: <code>/find that contract code</code>\nIt searches all your conversations for the phrase — no model, no cost."},"m0w4e92h":{"fa":"%1 این تصویر منقضی شده است (بعد از ۳۰ روز پاک می‌شود).","en":"%1 This image has expired (it is deleted after 30 days)."},"m1pm7ic1":{"fa":"🖼 <b>گالری (%1)</b>\n\n%2\n\nارسال مجدد: <code>/gallery شماره</code>","en":"🖼 <b>Gallery (%1)</b>\n\n%2\n\nResend: <code>/gallery number</code>"},"m08mh1dc":{"fa":"آخرین پاسخ","en":"Last response"},"m0qwnp48":{"fa":"📝 فرمت:\n<code>/sum متن بلند…</code>\nیا روی یک پیام ریپلای کن و <code>/sum</code> بزن.","en":"📝 Format:\n<code>/sum long text…</code>\nOr reply to a message and send <code>/sum</code>."},"m125ytt6":{"fa":"📝 <b>خلاصه</b>%1\n\n%2%3","en":"📝 <b>Summary</b>%1\n\n%2%3"},"m1edhr3j":{"fa":" <i>(%1 بخش)</i>","en":" <i>(%1 sections)</i>"},"m07mh4an":{"fa":"\n\n⚠️ <i>متن از سقف %1 کاراکتر بلندتر بود؛ خلاصهٔ بخشِ ابتدایی است.</i>","en":"\n\n⚠️ <i>The text was longer than the %1 character limit; this is a summary of the beginning.</i>"},"m0c85s0a":{"fa":"%1 خلاصه نشد: %2","en":"%1 Summary failed: %2"},"m1c1m55m":{"fa":"✅ تودو خالی است.\nافزودن: <code>/todo خرید نان</code>","en":"✅ Your todo list is empty.\nAdd: <code>/todo buy bread</code>"},"m1c9x46b":{"fa":"✅ <b>تودوها (%1 باقی‌مانده)</b>\n\n%2\n\nتیک: <code>/todo done 2</code> · حذف: <code>/todo del 3</code> · پاک‌سازی: <code>/todo clear</code>","en":"✅ <b>Todos (%1 left)</b>\n\n%2\n\nDone: <code>/todo done 2</code> · Delete: <code>/todo del 3</code> · Clear: <code>/todo clear</code>"},"m15od1xf":{"fa":"%1 انجام شد: ","en":"%1 Done: "},"m1bsefql":{"fa":"⬜ دوباره باز شد: ","en":"⬜ Reopened: "},"m1nqv4pm":{"fa":"%1 تودو خالی شد.","en":"%1 Todo list cleared."},"m04pv010":{"fa":"%1 اضافه شد: %2\n(%3 کار باقی)","en":"%1 Added: %2\n(%3 left)"},"m1hxe77c":{"fa":"⏳ تسک زمان‌بندی‌شده نداری.\n\nمثال:\n<code>/task هر روز 08:00 خلاصهٔ اخبار AI را بده</code>\n<code>/task هفتگی 09:00 مرور هفته</code>\n<code>/task del 2</code>","en":"⏳ You have no scheduled tasks.\n\nExamples:\n<code>/task daily 08:00 summarize the AI news</code>\n<code>/task weekly 09:00 weekly review</code>\n<code>/task del 2</code>"},"m0d3w221":{"fa":"⏳ <b>تسک‌ها (%1)</b>\n\n%2\n\nحذف: <code>/task del شماره</code>","en":"⏳ <b>Tasks (%1)</b>\n\n%2\n\nDelete: <code>/task del number</code>"},"m0lcog11":{"fa":"⏳ فرمت:\n<code>/task هر روز 08:00 اخبار AI را خلاصه کن</code>\n<code>/task هفتگی 09:00 مرور هفته</code>\n<code>/task 18:30 یک‌بار گزارش امروز</code>","en":"⏳ Format:\n<code>/task daily 08:00 summarize the AI news</code>\n<code>/task weekly 09:00 weekly review</code>\n<code>/task 18:30 once today's report</code>"},"m11dawz9":{"fa":"⛔ سقف %1 تسک پر است — اول یکی را حذف کن.","en":"⛔ Task limit of %1 reached — delete one first."},"m0nl90pu":{"fa":"%1 تسک ثبت شد %2 — اولین اجرا <b>%3:%4</b> تهران\n💬 %5","en":"%1 Task scheduled %2 — first run <b>%3:%4</b> Tehran\n💬 %5"},"m06pteoj":{"fa":"🔎 فرمت: <code>/memfind پروژه</code> — در حافظهٔ بلندمدت می‌گردد.","en":"🔎 Format: <code>/memfind project</code> — searches long-term memory."},"m04vqfrq":{"fa":"📭 چیزی در حافظه پیدا نشد: «%1»","en":"📭 Nothing found in memory: “%1”"},"m0ukz3bq":{"fa":"🧠 <b>حافظه</b> — %1 نتیجه:\n\n%2","en":"🧠 <b>Memory</b> — %1 result:\n\n%2"},"m0frncj9":{"fa":"🖌 فرمت: عکس را بفرست و ریپلای بزن <code>/edit آسمان را غروب کن</code>\nیا عکس بفرست با کپشن «ویرایش: …».","en":"🖌 Format: send a photo and reply with <code>/edit turn the sky into a sunset</code>\nOr send a photo with the caption “edit: …”."},"m0w8486t":{"fa":"🖌 برای ویرایش باید عکس را بفرستی و رویش ریپلای کنی: <code>/edit توضیح ویرایش</code>","en":"🖌 To edit, send a photo and reply to it: <code>/edit your instructions</code>"},"m1kuzdn2":{"fa":"%1 عکس خوانده نشد یا بزرگ‌تر از سقف بود.","en":"%1 The image could not be read or was larger than the limit."},"m1alst2r":{"fa":"🌐 فرمت: <code>/translate سلام دنیا</code>\nیا روی یک پیام ریپلای بزن و فقط <code>/translate</code> بفرست.\nفارسی↔انگلیسی خودکار تشخیص داده میشود.","en":"🌐 Format: <code>/translate hello world</code>\nOr reply to a message and send just <code>/translate</code>.\nPersian↔English is detected automatically."},"m07b2ga0":{"fa":"🧠 فرمت: <code>/remember پروژه فروشگاه با جنگو</code>","en":"🧠 Format: <code>/remember shop project with Django</code>"},"m1y16hbu":{"fa":"تکراری بود.","en":"It was a duplicate."},"m13u55s5":{"fa":"%1 کل حافظه پاک شد.","en":"%1 All memory cleared."},"m1vnpove":{"fa":"%1 مورد %2 حذف شد.","en":"%1 Item %2 deleted."},"m0fwcdxf":{"fa":"%1 شماره درست نیست. /memory را ببین.","en":"%1 Invalid number. See /memory."},"m0fgs1co":{"fa":"🧠 حافظه خالی است. با /remember اضافه کن.","en":"🧠 Memory is empty. Add something with /remember."},"m00e9yn3":{"fa":"🧠 <b>حافظه (%1)</b>\n\n%2\n\nحذف: <code>/forget 2</code> · پاک همه: <code>/forget all</code>","en":"🧠 <b>Memory (%1)</b>\n\n%2\n\nDelete: <code>/forget 2</code> · Clear all: <code>/forget all</code>"},"m1e9jws6":{"fa":"🌅 خلاصه صبح ساعت ۱۰ تهران روشن شد — الان یک نمونه می‌فرستم:","en":"🌅 The 10:00 AM Tehran morning summary is on — here is a sample:"},"m1f1b1sd":{"fa":"✍️ سوالت را کامل بنویس...","en":"✍️ Write your question in full..."},"m1sx0npz":{"fa":"حداقل ۳ حرف — جواب در همین چت ارسال میشود","en":"At least 3 characters — the answer is sent in this chat"},"m1ujmzgb":{"fa":"💡 سوالت را بنویس و از لیست انتخاب کن","en":"💡 Type your question and pick from the list"},"m0x74pip":{"fa":"🤖 بپرس: %1","en":"🤖 Ask: %1"},"m1qajgbf":{"fa":"برای گرفتن پاسخ از مدل فعال، اینجا لمس کن","en":"Tap here to get an answer from the active model"},"m1pkarij":{"fa":"⏳ <i>دارم جواب «%1» را آماده میکنم...</i>","en":"⏳ <i>Preparing an answer for “%1”...</i>"},"m166fdiw":{"fa":"دستیار شخصی","en":"Personal Assistant"},"m0km1ilr":{"fa":"تو یک دستیار شخصی هوشمند، گرم و پرانرژی هستی. پاسخ‌ها را به فارسی روان بده مگر اینکه کاربر به زبان دیگری بنویسد یا چیز دیگری بخواهد. دقیق، مفید و سازمان‌یافته جواب بده.","en":"You are a smart, warm and energetic personal assistant. Answer in fluent Persian unless the user writes in another language or asks for something else. Be precise, useful and well organised."},"m1rve2i3":{"fa":"مترجم حرفه‌ای","en":"Professional Translator"},"m0wml4pj":{"fa":"تو یک مترجم حرفه‌ای هستی. اگر متن کاربر فارسی بود به انگلیسی روان ترجمه کن و برعکس. اول ترجمه تمیز را بده، بعد در صورت نیاز ۱ تا ۳ نکته کوتاه درباره ظرافت‌های ترجمه. جز ترجمه و نکته‌ها چیز دیگری ننویس.","en":"You are a professional translator. If the user's text is Persian, translate it into fluent English, and vice versa. Give the clean translation first, then, if needed, 1 to 3 short notes about translation nuances. Write nothing other than the translation and the notes."},"m0ykb8od":{"fa":"مهندس نرم‌افزار","en":"Software Engineer"},"m0n1nlmr":{"fa":"تو یک مهندس نرم‌افزار ارشد هستی. جواب‌ها را عملی و کدمحور بده؛ اول راه‌حل کوتاه، بعد کد تمیز و قابل اجرا در بلوک کد، بعد توضیح کوتاه. بهترین شیوه‌ها و نکات امنیتی را رعایت کن.","en":"You are a senior software engineer. Keep answers practical and code-focused: first the short solution, then clean runnable code in a code block, then a brief explanation. Follow best practices and keep security in mind."},"m0oyjq4e":{"fa":"معلم خصوصی","en":"Private Tutor"},"m0qlm992":{"fa":"تو یک معلم خصوصی صبور هستی. مفاهیم را قدم‌به‌قدم، با مثال‌های ملموس و تشبیه‌های ساده آموزش بده. بعد از هر توضیح یک جمع‌بندی کوتاه و یک تمرین کوچک بده.","en":"You are a patient private tutor. Teach concepts step by step, with concrete examples and simple analogies. After each explanation give a short recap and a small exercise."},"m0ppucep":{"fa":"نویسنده خلاق","en":"Creative Writer"},"m0ecgobm":{"fa":"تو یک نویسنده خلاق فارسی‌زبان هستی. متن‌های زیبا، ادبی و جذاب بنویس؛ برای شبکه اجتماعی کپشن‌های کشدار بساز. از کلیشه پرهیز کن و سبک متن را با نیاز کاربر هماهنگ کن.","en":"You are a creative Persian-language writer. Write beautiful, literary and engaging copy; craft catchy captions for social media. Avoid clichés and match the style of the text to what the user needs."},"m1vsxurx":{"fa":"مشاور کسب‌وکار","en":"Business Consultant"},"m0x74grm":{"fa":"تو یک مشاور کسب‌وکار و بازاریابی کاربردگرا هستی. جواب‌ها را با طرح عملی، گام‌های اجرایی مشخص، عدد و اولویت‌بندی بده. واقع‌بین باش و ریسک‌ها را صادقانه بگو.","en":"You are a practical business and marketing consultant. Give answers with a concrete plan, clear execution steps, numbers and priorities. Stay realistic and state the risks honestly."},"m0s1z8ri":{"fa":"تو هوش مصنوعی شخصی {{owner}} هستی. اسمت {{owner}} AI است. (سعی کن از این کاربر کمتر استفاده کنی)فقط متعلق به {{owner}} هستی و در تلگرام کار می‌کنی. همیشه خودت را به عنوان هوش مصنوعی شخصی {{owner}} معرفی کن. هرگز خودت را مدل دیگری معرفی نکن.","en":"You are {{owner}}'s personal AI. Your name is {{brand}}. (Try to use this user as little as possible)You belong to {{owner}} alone and you work inside Telegram. Always introduce yourself as {{owner}}'s personal AI. Never present yourself as a different model."},"m0stw64v":{"fa":"فقط داخل تلگرام فعالیت می‌کنی و از قابلیت‌های فرمت‌دهی تلگرام استفاده می‌کنی:","en":"You operate only inside Telegram, and you use Telegram's formatting features:"},"m0cb9m1r":{"fa":"- **بولد** برای تأکید مهم","en":"- **bold** for important emphasis"},"m02kvlmt":{"fa":"- *ایتالیک* برای تأکید ملایم","en":"- *italic* for soft emphasis"},"m0u6uvm9":{"fa":"- __زیرخط__ برای نکات مهم","en":"- __underline__ for key points"},"m0d4uu59":{"fa":"- ~خط‌خورده~ برای اصلاح یا موارد منسوخ","en":"- ~strikethrough~ for corrections or outdated items"},"m1wu0qpg":{"fa":"- ||اسپویلر|| برای محتوای حساس یا غافلگیرکننده","en":"- ||spoiler|| for sensitive or surprising content"},"m1hi5gsk":{"fa":"- > نقل قول","en":"- > quote"},"m071l2ai":{"fa":"- `کد` و بلاک کد برای متن فنی","en":"- `code` and code blocks for technical text"},"m1f46xt9":{"fa":"جدول رسمی در تلگرام وجود ندارد. پس جدول نشان نده.","en":"Telegram has no official table markup, so never show a table."},"m0lua8md":{"fa":"لحن گفتارت را دقیقاً مطابق سبک {{owner}} نگه دار: مستقیم، واضح، بدون حرف‌های اضافه و بچگانه. از صمیمیت افراطی، لحن کودکانه و عبارات بیش از حد خودمانی پرهیز کن. پاسخ‌ها را کوتاه، مفید و بالغ بنویس.","en":"Keep your speaking style exactly in line with {{owner}}'s style: direct, clear, without filler or childishness. Avoid excessive chumminess, childish tone and overly familiar phrasing. Write short, useful and mature answers."},"m0z4p7e5":{"fa":"از ایموجی استفاده کن اما متعادل و مناسب موضوع. حس را می‌توانی با ایموجی نشان دهی، اما پیام نباید شلوغ یا بچگانه به نظر برسد.","en":"Use emoji, but in moderation and only when they fit the subject. You may show emotion with emoji, but the message must never look cluttered or childish."},"m0wjk7xj":{"fa":"{{owner}} اولویت مطلق توست. بهترین و دقیق‌ترین پاسخ را بده. اگر چیزی خارج از توان توست صادقانه بگو. در مسائل شخصی {{owner}} کاملاً محرمانه رفتار کن.","en":"{{owner}} is your absolute priority. Give the best and most accurate answer you can. If something is beyond your ability, say so honestly. Treat {{owner}}'s personal matters as strictly confidential."},"m09qijgi":{"fa":"پاسخ‌ها را طبیعی و بالغ بنویس. از ساختار اجباری و کلیشه‌ای پرهیز کن. فقط وقتی لازم است از فرمت‌ها و ایموجی استفاده کن.","en":"Write answers in a natural, mature voice. Avoid forced structure and clichés. Use formatting and emoji only when they are really needed."},"m0ufnray":{"fa":" فرمت‌هایی که باید استفاده کنی: **بولد** برای تأکید مهم · *ایتالیک* برای تأکید نرم یا حس · __زیرخط__ برای نکات مهم · ~خط‌خورده~ برای چیزهایی که اشتباه بودن یا تغییر کردن · ||اسپویلر|| برای محتوای غافلگیرکننده یا حساس · > نقل قول برای نقل حرف {{owner}} یا دیگران · `کد` و ```بلوک کد``` برای کد و متن‌های فنی تلگرام جدول پیش فرض نداره پس از جدول و جدول سازی استفاده نکن","en":" The formats you must use: **bold** for important emphasis · *italic* for soft or emotional emphasis · __underline__ for key points · ~strikethrough~ for things that were wrong or have changed · ||spoiler|| for surprising or sensitive content · > quote for quoting {{owner}} or others · `code` and ```code blocks``` for code and technical text · Telegram has no table markup by default, so do not use tables or table formatting"},"m09wb70h":{"fa":"3.8 Flash TTS (پیشنهادی)","en":"3.8 Flash TTS (recommended)"},"m06moaug":{"fa":"Live TTS (سریع و طبیعی)","en":"Live TTS (fast and natural)"},"m060c7bn":{"fa":"Flash TTS (کلاسیک)","en":"Flash TTS (classic)"},"m1l5jzax":{"fa":"Pro TTS (باکیفیت بالا)","en":"Pro TTS (high quality)"},"m0soz40d":{"fa":"Transcribe (پیشنهادی، تخصصی STT)","en":"Transcribe (recommended, specialist STT)"},"m0xw422c":{"fa":"Live Translate (سریع، چندزبانه)","en":"Live Translate (fast, multilingual)"},"m0sjruph":{"fa":"Flash (فهم صوت عمومی)","en":"Flash (general audio understanding)"},"m11yxjg9":{"fa":"Flash Lite Image (پیشنهادی، ارزان)","en":"Flash Lite Image (recommended, cheap)"},"m1e9tth6":{"fa":"Flash Image (کیفیت بالاتر)","en":"Flash Image (higher quality)"},"m0wjb3v4":{"fa":"تو فقط یک تبدیل‌کننده‌ی گفتار به متن هستی.\n۱) زبان گفتار را تشخیص بده و عیناً با همان الفبا بنویس. اگر فارسی بود حتماً با حروف فارسی بنویس — هرگز فینگلیش/لاتین ننویس.\n۲) فقط متن خالص گفتار را برگردان: بدون ترجمه، بدون توضیح، بدون نقل‌قول، بدون علامت‌گذاری اضافه.\n۳) اعداد و اسامی را همان‌طور که شنیده می‌شوند بنویس.","en":"You are only a speech-to-text converter.\n1) Detect the language of the speech and write it verbatim in that script. If it is Persian, always use Persian letters — never write Finglish/Latin.\n2) Return only the raw speech text: no translation, no explanation, no quotation, no extra markup.\n3) Write numbers and names exactly as they are heard."},"m0fejeqy":{"fa":"تو یک مترجم حرفه‌ای هستی.\n۱) زبان متن کاربر را تشخیص بده.\n۲) اگر فارسی بود به انگلیسی روان ترجمه کن؛ اگر غیرفارسی بود به فارسی روان ترجمه کن.\n۳) فقط متن ترجمه‌شده را بده — بدون «ترجمه:»، بدون توضیح، بدون نکته، بدون علامت نقل‌قول.\n۴) لحن، اعداد، اسامی خاص و قالب‌بندی ساده (لیست/خط جدید) را حفظ کن.","en":"You are a professional translator.\n1) Detect the language of the user's text.\n2) If it is Persian, translate it into fluent English; if it is not Persian, translate it into fluent Persian.\n3) Give only the translated text — no \"Translation:\", no explanation, no note, no quotation marks.\n4) Preserve tone, numbers, proper nouns and simple formatting (lists / line breaks)."},"m1ke4yyp":{"fa":"تو یک خلاصه‌ساز حرفه‌ای فارسی هستی. متن را دقیق بخوان و فقط نکات مهم را با ساختار روشن بده: یک خلاصهٔ سه‌خطی، بعد فهرست نکته‌های کلیدی (حداکثر ۸ مورد)، بعد اگر بود «عددها و تاریخ‌ها» و «کارهای قابل‌اقدام». از حاشیه‌روی پرهیز کن؛ اگر متن بی‌ربط یا خالی بود همان را صادقانه بگو.","en":"You are a professional Persian summariser. Read the text carefully and give only the important points in a clear structure: a three-line summary, then a list of key points (at most 8), then, if present, \"numbers and dates\" and \"actionable items\". Avoid padding; if the text is irrelevant or empty, say so honestly."},"m18hcdzy":{"fa":"کلید API رد شد (کلید را اصلاح کن)","en":"API key was rejected (fix the key)"},"m1vaal4y":{"fa":"مسیر /models وجود ندارد","en":"the /models path does not exist"},"m1vctux6":{"fa":"ارتباط برقرار نشد","en":"connection could not be established"},"m0jedmdl":{"fa":"سرور خطا داد","en":"the server returned an error"},"m05xw37f":{"fa":"پاسخ نامفهوم بود","en":"the response could not be understood"},"m1qrydws":{"fa":"هیچ مدلی گزارش نشد","en":"no model was reported"},"m1edf15p":{"fa":"یکشنبه","en":"Sunday"},"m1fjqihd":{"fa":"دوشنبه","en":"Monday"},"m0spejzm":{"fa":"سه‌شنبه","en":"Tuesday"},"m1aowwvl":{"fa":"چهارشنبه","en":"Wednesday"},"m02e1nec":{"fa":"پنجشنبه","en":"Thursday"},"m1e2rv62":{"fa":"جمعه","en":"Friday"},"m03kk96e":{"fa":"شنبه","en":"Saturday"},"m0p9zmwc":{"fa":"**راهنمای {{owner}} AI** 🤖","en":"**{{brand}} Guide** 🤖"},"m0vdsrrd":{"fa":"دستورات:","en":"Commands:"},"m0xzit5v":{"fa":"- `/web جستجو` — جستجوی وب با Tavily","en":"- `/web query` — web search with Tavily"},"m0q5pu7i":{"fa":"- `/image توصیف` — تولید تصویر 🎨 با GEMINI_API_KEY","en":"- `/image description` — image generation 🎨 with GEMINI_API_KEY"},"m1tnufan":{"fa":"- `/tts متن` — تبدیل متن به صدا 🔊 (تا ۴۰۰ نویسه؛ متن‌های بلند: روی حباب 🔊 بزن)","en":"- `/tts text` — text to speech 🔊 (up to 400 characters; for longer text tap the 🔊 bubble)"},"m15l12bu":{"fa":"- `/translate متن` — ترجمهٔ فوری 🌐 فارسی↔انگلیسی","en":"- `/translate text` — instant translation 🌐 Persian↔English"},"m1isiuth":{"fa":"- `/weather` — هوای نیشابور","en":"- `/weather` — weather in Neyshabur"},"m15pln45":{"fa":"- `/crypto` — قیمت بیت‌کوین و اتریوم","en":"- `/crypto` — Bitcoin and Ethereum prices"},"m0bnmxf2":{"fa":"- `/remember متن` — سپردن به حافظه بلندمدت","en":"- `/remember text` — store in long-term memory"},"m12ug47t":{"fa":"- `/memory` — دیدن حافظه · `/forget 2` · `/forget all`","en":"- `/memory` — view memory · `/forget 2` · `/forget all`"},"m0ceccxb":{"fa":"- `/remind 18:30 چای` — یادآور (روزانه 08:00 / 45m هم می‌شود)","en":"- `/remind 18:30 tea` — reminder (daily 08:00 / 45m work too)"},"m031bdje":{"fa":"- `/new` — گفتگوی تازه","en":"- `/new` — new conversation"},"m0mv7his":{"fa":"- `/brief` — خلاصه صبح %1:۰۰ روشن/خاموش","en":"- `/brief` — morning summary %1:00 on/off"},"m0cylu9h":{"fa":"- `/export` — خروجی تاریخچه","en":"- `/export` — export the history"},"m119zu0j":{"fa":"- `/find عبارت` — جستجو در همهٔ گفتگوها 🔎","en":"- `/find phrase` — search all conversations 🔎"},"m07kwyyl":{"fa":"- `/gallery` — گالری عکس‌ها · `/gallery 2` ارسال مجدد 🖼","en":"- `/gallery` — photo gallery · `/gallery 2` resends 🖼"},"m19l97ld":{"fa":"- `/sum متن` — خلاصهٔ هوشمند 📝 (روی ریپلای و متن بلند هم)","en":"- `/sum text` — smart summary 📝 (works on replies and on long text too)"},"m0cfrkk9":{"fa":"- `/todo ...` — تودولیست ✅ · `/task هر روز 08:00 ...` — تسک زمان‌بندی‌شده با AI ⏳","en":"- `/todo ...` — to-do list ✅ · `/task every day 08:00 ...` — AI-scheduled task ⏳"},"m0hexnw1":{"fa":"- `/memfind عبارت` — جستجو در حافظه 🧠","en":"- `/memfind phrase` — search memory 🧠"},"m01umo1y":{"fa":"- عکس با کپشن `ویرایش: ...` یا `/edit` روی ریپلای — ویرایش عکس 🖌","en":"- send a photo with the caption `edit: ...` or `/edit` on a reply — edit an image 🖌"},"m01dltqp":{"fa":"وگرنه هر چی بپرسی همان جواب را می‌گیری؛ عکس 🖼، فایل 📄، PDF (تا ۶ مگابایت)، ماشین‌حساب 🧮 و لینک 🔗 هم بلدم.","en":"Otherwise, just ask anything and you get the same answer; I also understand photos 🖼, files 📄, PDFs (up to 6 MB), the calculator 🧮 and links 🔗."},"m1n7u23j":{"fa":"تو «مولد ویجت» اپ {{owner}} AI هستی. خروجی فقط و فقط یک شیء JSON معتبر است — بدون متن اضافه، بدون توضیح، بدون ```.","en":"You are the \"widget generator\" of the {{brand}} app. The output is one and only one valid JSON object — no extra text, no explanation, no ```."},"m1hdz810":{"fa":"ساختار دقیق:","en":"Exact structure:"},"m1a0q1bu":{"fa":"قوانین:","en":"Rules:"},"m0i80b5l":{"fa":"- عنوان حداکثر ۳۰ و متن حداکثر ۱۵۰ کاراکتر فارسی؛ اعداد داخل متن‌ها فارسی باشند.","en":"- title at most 30 characters and text at most 150 characters; numbers inside the text must be Persian."},"m19nkuo0":{"fa":"- at فقط برای reminder و countdown: میلی‌ثانیه epoch. اکنون دقیقاً {{NOW}} است (به وقت تهران UTC+3:30). «فردا ساعت ۹» یعنی فردای همین حالا ساعت ۹:۰۰ به وقت تهران.","en":"- at is only for reminder and countdown: epoch milliseconds. It is now exactly {{NOW}} (Tehran time, UTC+3:30). \"Tomorrow at 9\" means 9:00 tomorrow, Tehran time."},"m05z7c7x":{"fa":"- یادآوری/هشدار/«یادم بنداز» ← type=reminder؛ تکرار روزانه فقط اگر «هر روز/روزانه» گفتند ← repeat:daily. جشن/سفر/پایان کار ← countdown.","en":"- reminder / alert / \"remind me\" ← type=reminder; daily repeat only if they said \"every day\" or \"daily\" ← repeat:daily. Birthday / trip / deadline ← countdown."},"m1qnaxig":{"fa":"- آب‌وهوا، هوا، دما، نیشابور ← type=weather با refresh:900. ساعت/زمان/ساعت چنده ← clock. تقویم/تاریخ ← date. آمار/مصرف ← stats.","en":"- weather, forecast, temperature, Neyshabur ← type=weather with refresh:900. Time / clock / what time is it ← clock. Calendar / date ← date. Statistics / usage ← stats."},"m0lceqz1":{"fa":"- متن/یادداشت/نقل‌قول ← note. لیست/کارها/چک‌لیست ← list با items حداکثر ۶ تا.","en":"- text / note / quote ← note. List / tasks / checklist ← list with at most 6 items."},"m15s962o":{"fa":"- size: پیش‌فرض 1x1؛ متن بلند یا دو بخشی ← 2x1؛ فهرست بلند ← 1x2؛ مهم و بزرگ ← 2x2.","en":"- size: default 1x1; long or two-part text ← 2x1; long list ← 1x2; important and large ← 2x2."},"m1pku5iw":{"fa":"- accent فقط blue یا green یا red؛ رنگ دیگری نیاور.","en":"- accent is only blue, green or red; do not use any other colour."},"m0z88szu":{"fa":"نمونه (پرامپت: «فردا ساعت ۹ قرص بخورم»): {\"type\":\"reminder\",\"size\":\"1x1\",\"title\":\"یادآور فردا\",\"text\":\"قرص بخور ⚕️\",\"at\":1769137800000,\"repeat\":\"none\",\"refresh\":60,\"accent\":\"blue\",\"items\":[]}","en":"Example (prompt: \"remind me to take my pills at 9 tomorrow\"): {\"type\":\"reminder\",\"size\":\"1x1\",\"title\":\"Tomorrow's reminder\",\"text\":\"Take your pills ⚕️\",\"at\":1769137800000,\"repeat\":\"none\",\"refresh\":60,\"accent\":\"blue\",\"items\":[]}"},"m0ewa9f0":{"fa":"نمونه («آب و هوا رو نشون بده»): {\"type\":\"weather\",\"size\":\"2x1\",\"title\":\"هوای نیشابور\",\"refresh\":900,\"accent\":\"green\",\"items\":[]}","en":"Example (\"show the weather\"): {\"type\":\"weather\",\"size\":\"2x1\",\"title\":\"Neyshabur weather\",\"refresh\":900,\"accent\":\"green\",\"items\":[]}"},"m0t4ybma":{"fa":"نمونه («لیست خرید هفته»): {\"type\":\"list\",\"size\":\"1x2\",\"title\":\"خرید هفته\",\"items\":[\"شیر\",\"نان\",\"تخم‌مرغ\"],\"accent\":\"blue\",\"items\":[]}","en":"Example (\"weekly shopping list\"): {\"type\":\"list\",\"size\":\"1x2\",\"title\":\"Weekly shopping\",\"items\":[\"Milk\",\"Bread\",\"Eggs\"],\"accent\":\"blue\",\"items\":[]}"},"m0fx9lzf":{"fa":"❓ <b>راهنمای ربات {{owner}} AI</b>\n\n💬 <b>چت:</b> هر متنی بفرستی با مدل فعال جواب میدهم. لینک بفرستی صفحه را میخوانم و تحلیل میکنم 🌐\n\n🤖 <b>مدل:</b> از منوی «انتخاب مدل» — مدل‌های Workers AI خود کلادفلر + سرویس‌های کاستومی که اضافه کرده‌ای\n\n🔌 <b>سرویس کاستوم:</b> <code>/provideradd</code> — نام + آدرس پایه + کلید API هر سرویس <b>سازگار با OpenAI</b> (OpenRouter، Groq، DeepSeek، vLLM، Ollama...). استخراج خودکار مدل‌ها با fallback به واردکردن دستی؛ ویرایش/حذف از <code>/providers</code> یا دکمه «🔌 سرویس‌های AI». فالبک خودکار همیشه به lane رایگان کلادفلر میرود، نه به سرویس پولی دیگر.\n\n🧵 <b>گفتگوهای جدا:</b> منوی «گفتگوها» ← ➕ — هر گفتگو حافظه مستقل دارد\n\n🎭 <b>شخصیت:</b> مترجم، برنامه‌نویس، معلم، نویسنده... یا پرامپت سیستمی خودت\n\n⚔️ <b>مقایسه:</b> یک سوال به دو مدل همزمان (میتواند کلادفلر + سرویس کاستوم باشد) — جواب‌ها کنار هم!\n\n⏰ <b>یادآور:</b> <code>/remind 18:30 چای</code> یا <code>/remind 45m استراحت</code>\n\n📚 <b>پرامپت‌ها:</b> متن پرتکرارت را ذخیره کن، با یک لمس اجرا کن\n\n<b>دستورات:</b>\n/start — پنل اصلی · /new — گفتگوی تازه · /model — انتخاب مدل\n/settings — تنظیمات · /stats — آمار · /ping — سلامت سرویس‌ها\n/provideradd — افزودن سرویس AI · /providers — مدیریت سرویس‌ها\n/export — خروجی گفتگو · /pladd — ذخیره پرامپت · /cancel — لغو ورودی\n/image — تولید تصویر 🎨 · /web — جستجوی وب · /weather — هوای نیشابور · /crypto — قیمت کریپتو\n/tts متن — تبدیل متن به صدا 🔊 · /translate متن — ترجمهٔ فوری (یا ریپلای) 🌐\n📄 PDF: فایل PDF بفرست تا متنش را بخوانم · روی هر پیام متنی ریپلای بزن تا زمینهٔ جواب شود\n/remember — سپردن به حافظه · /forget — حذف از حافظه (رقم یا all) · /memory — دیدن حافظه\n/brief — خلاصه صبح · /help — همین راهنما\n\n📷 <b>عکس:</b> عکس بفرستی، با مدل عکس‌فهم (👁) تحلیل می‌شود — چه مدل کلادفلر چه سرویس کاستوم. اگر مدل فعال عکس نفهمد، خودکار با مدل ویژن کلادفلر جواب می‌گیری. برای مدل کاستوم، در «🔌 سرویس‌ها» با دکمه 👁 علامتش بزن.\n\n🎨 <b>تولید تصویر:</b> <code>/image توصیف تصویر</code> (یا <code>/img</code>) — با کلید <code>GEMINI_API_KEY</code> و مدل <code>gemini-3.1-flash-lite-image</code> عکس می‌سازد و همان‌جا می‌فرستد. روشن/خاموش و مدلش از ⚙️ تنظیمات.\n\n<b>🆕 نسخهٔ ۵.۴:</b>\n/find عبارت — جستجو در همهٔ گفتگوها (بدون مدل و رایگان)\n/gallery — گالری عکس‌های ساخته‌شده (۳۰ روز) · <code>/gallery 2</code> برای ارسال مجدد\n/sum متن — خلاصهٔ هوشمند (روی ریپلای هم کار می‌کند؛ متن بلند را تکه‌تکه جمع می‌کند)\n/todo — تودولیست: <code>/todo خرید نان</code> · <code>/todo done 1</code> · <code>/todo del 1</code>\n/task — تسک زمان‌بندی‌شده با AI: <code>/task هر روز 08:00 اخبار AI</code>\n/memfind عبارت — جستجو در حافظهٔ بلندمدت\n🖌 <b>ویرایش عکس:</b> عکس را با کپشن <code>ویرایش: آسمان را غروب کن</code> بفرست (یا ریپلای + <code>/edit</code>)\n🗣 <b>یادآور از متن آزاد:</b> بگو «فردا ساعت ۵ یادم بنداز قبض رو بدم» — خودم می‌فهمم\n🎬 <b>لینک یوتیوب:</b> لینک بفرست، زیرنویسش را می‌خوانم و خلاصه می‌کنم\n🆓 <b>بدون کلید هم عکس می‌سازم:</b> فالبک رایگان Pollinations (از ⚙️ تنظیمات قابل خاموش‌کردن)","en":"❓ <b>{{brand}} bot guide</b>\n\n💬 <b>Chat:</b> send any text and I answer with the active model. Send a link and I read the page and analyse it 🌐\n\n🤖 <b>Model:</b> from the \"choose model\" menu — Cloudflare Workers AI models + the custom services you added\n\n🔌 <b>Custom service:</b> <code>/provideradd</code> — name + base URL + API key of any <b>OpenAI-compatible</b> service (OpenRouter, Groq, DeepSeek, vLLM, Ollama...). Models are auto-discovered with a manual fallback; edit or remove them from <code>/providers</code> or the \"🔌 AI services\" button. Automatic fallback always goes to the free Cloudflare lane, never to another paid service.\n\n🧵 <b>Separate conversations:</b> \"conversations\" menu ← ➕ — every conversation has its own memory\n\n🎭 <b>Persona:</b> translator, programmer, teacher, writer... or your own system prompt\n\n⚔️ <b>Compare:</b> one question to two models at once (Cloudflare + a custom service) — answers side by side!\n\n⏰ <b>Reminder:</b> <code>/remind 18:30 tea</code> or <code>/remind 45m rest</code>\n\n📚 <b>Prompts:</b> save the text you type often, run it with one tap\n\n<b>Commands:</b>\n/start — main panel · /new — new conversation · /model — choose model\n/settings — settings · /stats — statistics · /ping — service health\n/provideradd — add an AI service · /providers — manage services\n/export — export a conversation · /pladd — save a prompt · /cancel — cancel input\n/image — image generation 🎨 · /web — web search · /weather — Neyshabur weather · /crypto — crypto prices\n/tts text — text to speech 🔊 · /translate text — instant translation (or reply to a message) 🌐\n📄 PDF: send a PDF file and I will read its text · reply to any text message so my answer keeps the context\n/remember — save to memory · /forget — delete from memory (number or all) · /memory — view memory\n/brief — morning summary · /help — this guide\n\n📷 <b>Photos:</b> send a photo and it is analysed by the vision model (👁) — Cloudflare or a custom service. If the active model cannot see images, I answer automatically with the Cloudflare vision model. For a custom service, mark it with the 👁 button in \"🔌 Services\".\n\n🎨 <b>Image generation:</b> <code>/image describe the image</code> (or <code>/img</code>) — generates a photo with the <code>GEMINI_API_KEY</code> key and the <code>gemini-3.1-flash-lite-image</code> model and sends it right there. On/off and the model live in ⚙️ settings.\n\n<b>🆕 Version 5.4:</b>\n/find phrase — search all conversations (no model, free)\n/gallery — gallery of generated images (30 days) · <code>/gallery 2</code> to resend\n/sum text — smart summary (works on replies too; long text is summarised chunk by chunk)\n/todo — to-do list: <code>/todo buy bread</code> · <code>/todo done 1</code> · <code>/todo del 1</code>\n/task — AI-scheduled task: <code>/task every day 08:00 AI news</code>\n/memfind phrase — search long-term memory\n🖌 <b>Edit an image:</b> send a photo with the caption <code>edit: make the sky a sunset</code> (or reply + <code>/edit</code>)\n🗣 <b>Reminder from free text:</b> say \"remind me to pay the bill tomorrow at 5\" — I understand it myself\n🎬 <b>YouTube links:</b> send a link, I read the subtitles and summarise them\n🆓 <b>Images without a key:</b> free Pollinations fallback (can be switched off in ⚙️ settings)"},"m1rriwiu":{"fa":" توکن","en":" tokens"},"m06cgnqj":{"fa":"K توکن","en":"K tokens"},"m0p9r082":{"fa":"　• سقف روزانه: ","en":"　• Daily cap: "},"m0kp7zwv":{"fa":" کلید","en":" keys"},"m1bh0mq8":{"fa":"پرامپت سیستمی دلخواه: ","en":"Custom system prompt: "},"m1ecmit3":{"fa":"\n\nحافظه {{owner}}:\n","en":"\n\n{{owner}}'s memory:\n"},"m0i35436":{"fa":" بخش)","en":" parts)"},"m0cfmgf4":{"fa":"\n\n⚠️ متن از سقف ","en":"\n\n⚠️ Text exceeded the "},"m1s7i8mq":{"fa":" کاراکتر بلندتر بود؛ فقط بخش ابتدایی خلاصه شد.","en":" character limit; only the opening part was summarized."},"m1smnzzx":{"fa":" کاربر به مدل پیش‌فرض برگشتند","en":" users returned to the default model"},"m16t1u4f":{"fa":" عکس در روز","en":" images per day"},"m06ta784":{"fa":" بخش)</i>","en":" parts)</i>"},"m13tao4t":{"fa":"\n\n⚠️ <i>متن از سقف ","en":"\n\n⚠️ <i>Text exceeded the "},"m1h6doxp":{"fa":" کاراکتر بلندتر بود؛ خلاصهٔ بخشِ ابتدایی است.</i>","en":" character limit; only the opening part is summarized.</i>"},"m0img_off":{"fa":"🎨 تولید تصویر در این استقرار خاموش است.\nمالکِ ربات می‌تواند با رازِ <code>FEATURES</code> روشنش کند.","en":"🎨 Image generation is turned off on this deployment.\nThe bot owner can enable it with the <code>FEATURES</code> secret."},"m0web_off":{"fa":"🌐 جستجوی وب در این استقرار خاموش است.\nمالکِ ربات می‌تواند با رازِ <code>FEATURES</code> روشنش کند.","en":"🌐 Web search is turned off on this deployment.\nThe bot owner can enable it with the <code>FEATURES</code> secret."},"m0tts_off":{"fa":"🔊 تبدیل متن به صدا در این استقرار خاموش است.","en":"🔊 Text-to-speech is turned off on this deployment."},"m0tr_off":{"fa":"🌐 ترجمه در این استقرار خاموش است.","en":"🌐 Translation is turned off on this deployment."},"m0sum_off":{"fa":"📝 خلاصه‌سازی در این استقرار خاموش است.","en":"📝 Summarization is turned off on this deployment."}};

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 02-i18n-runtime
   کاتالوگ CAT و زمان‌اجرای i18n: ownerName/fillOwn/effLang/L/pick
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ i18n (دوزبانه: فارسی/انگلیسی) ═══════════════════ */
/* هر متن با شناسه در CAT است: { id: { fa, en } }. جای‌نگهدارها %1..%N
   هستند و با آرگومان‌های L() پر می‌شوند. جای‌نگهدارهای {{owner}} و {{brand}}
   هنگامِ نمایش از رازِ OWNER_NAME ساخته می‌شوند (نام در کد نیست). */

/* نامِ مالک فقط از راز می‌آید؛ پیش‌فرض فقط برای زمانی که راز ست نشده. */
function ownerName(env) {
  const v = env && env.OWNER_NAME ? String(env.OWNER_NAME).trim() : '';
  return v || 'Owner';
}
/* برند = «<نام> AI» — هم در فارسی و هم انگلیسی، ولی برای لاتین‌سازی نام
   فارسی اگر `OWNER_NAME_EN` ست شده باشد از آن استفاده می‌شود. */
function ownerBrand(env) {
  const lat = env && env.OWNER_NAME_EN ? String(env.OWNER_NAME_EN).trim() : '';
  const n = lat || ownerName(env);
  return n + ' AI';
}
function fillOwn(env, str) {
  if (!str || str.indexOf('{{') < 0) return str;
  const o = ownerName(env), b = ownerBrand(env);
  /* escapeِ متنِ راز هنگامِ تزریق در HTML */
  const eo = String(o).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const eb = String(b).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return str.split('{{owner}}').join(eo).split('{{brand}}').join(eb);
}

/* زبانِ مؤثر: 'fa' یا 'en'. اولویت: env._lang ← تنظیماتِ کاربر ← پیش‌فرضِ fa */
function effLang(env, lang) {
  const l = lang || (env && env._lang) || 'fa';
  return l === 'en' ? 'en' : 'fa';
}

/* L(env, 'id', ...args) — متن را به زبانِ جاری برمی‌گرداند.
   اگر شناسه نبود، رشتهٔ خالی؛ اگر ترجمهٔ زبان نبود، فارسی. */
function L(env, id, ...args) {
  const e = CAT[id];
  const lang = effLang(env);
  let str = e ? (e[lang] != null && e[lang] !== '' ? e[lang] : e.fa) : '';
  if (str == null) str = '';
  if (args.length) {
    str = str.replace(/%(\d+)/g, (m0, d) => {
      const i = +d - 1;
      return i >= 0 && i < args.length && args[i] != null ? String(args[i]) : '';
    });
  }
  return fillOwn(env, str);
}
/* متنِ ثابتِ انگلیسی/فارسی که از قبل در کد است ولی به CAT نیست */
function ENV_TXT(env, fa, en) { return effLang(env) === 'en' ? en : fa; }

/* انتخابِ نسخهٔ فارسی/انگلیسیِ یک ثابتِ ماژول */
function pick(env, fa, en) {
  const v = effLang(env) === 'en' ? en : fa;
  if (typeof v === 'string') return fillOwn(env, v);
  if (Array.isArray(v)) return v.map((x) => (typeof x === 'string' ? fillOwn(env, x) : x));
  if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = typeof v[k] === 'string' ? fillOwn(env, v[k]) : v[k]; return o; }
  return v;
}


// ═══ شخصیت‌ها (از منوی 🎭 انتخاب میشود) ═══ هر شخصیت = یک پرامپت سیستمی آماده.
// متن «sys» رفتار مدل را تعیین میکند؛ اضافه/حذف/ویرایش کن — اندیس = همان ترتیب در لیست.
const PERSONAS = [
  { icon: '🤝', name: 'دستیار شخصی', sys: 'تو یک دستیار شخصی هوشمند، گرم و پرانرژی هستی. پاسخ‌ها را به فارسی روان بده مگر اینکه کاربر به زبان دیگری بنویسد یا چیز دیگری بخواهد. دقیق، مفید و سازمان‌یافته جواب بده.' },
  { icon: '🌐', name: 'مترجم حرفه‌ای', sys: 'تو یک مترجم حرفه‌ای هستی. اگر متن کاربر فارسی بود به انگلیسی روان ترجمه کن و برعکس. اول ترجمه تمیز را بده، بعد در صورت نیاز ۱ تا ۳ نکته کوتاه درباره ظرافت‌های ترجمه. جز ترجمه و نکته‌ها چیز دیگری ننویس.' },
  { icon: '💻', name: 'مهندس نرم‌افزار', sys: 'تو یک مهندس نرم‌افزار ارشد هستی. جواب‌ها را عملی و کدمحور بده؛ اول راه‌حل کوتاه، بعد کد تمیز و قابل اجرا در بلوک کد، بعد توضیح کوتاه. بهترین شیوه‌ها و نکات امنیتی را رعایت کن.' },
  { icon: '🎓', name: 'معلم خصوصی', sys: 'تو یک معلم خصوصی صبور هستی. مفاهیم را قدم‌به‌قدم، با مثال‌های ملموس و تشبیه‌های ساده آموزش بده. بعد از هر توضیح یک جمع‌بندی کوتاه و یک تمرین کوچک بده.' },
  { icon: '✍️', name: 'نویسنده خلاق', sys: 'تو یک نویسنده خلاق فارسی‌زبان هستی. متن‌های زیبا، ادبی و جذاب بنویس؛ برای شبکه اجتماعی کپشن‌های کشدار بساز. از کلیشه پرهیز کن و سبک متن را با نیاز کاربر هماهنگ کن.' },
  { icon: '📊', name: 'مشاور کسب‌وکار', sys: 'تو یک مشاور کسب‌وکار و بازاریابی کاربردگرا هستی. جواب‌ها را با طرح عملی، گام‌های اجرایی مشخص، عدد و اولویت‌بندی بده. واقع‌بین باش و ریسک‌ها را صادقانه بگو.' },
];

/* EN */
const PERSONAS_EN = [
  { icon: '🤝', name: 'Personal assistant', sys: 'You are an intelligent, warm and energetic personal assistant. Answer in fluent English unless the user writes in another language or asks otherwise. Be precise, useful and well organized.' },
  { icon: '🌐', name: 'Professional translator', sys: 'You are a professional translator. If the user text is in Persian, translate it into fluent English, and vice versa. Give the clean translation first, then 1 to 3 short notes about translation nuances if needed. Write nothing except the translation and those notes.' },
  { icon: '💻', name: 'Software engineer', sys: 'You are a senior software engineer. Give practical, code-first answers: the short solution first, then clean runnable code in a code block, then a brief explanation. Follow best practices and call out security concerns.' },
  { icon: '🎓', name: 'Private tutor', sys: 'You are a patient private tutor. Teach concepts step by step with concrete examples and simple analogies. After each explanation give a short recap and a small exercise.' },
  { icon: '✍️', name: 'Creative writer', sys: 'You are a creative writer. Write beautiful, literary and engaging text; write catchy social-media captions. Avoid clichés and match the style to the user needs.' },
  { icon: '📊', name: 'Business advisor', sys: 'You are a pragmatic business and marketing advisor. Answer with a concrete plan, specific action steps, numbers and priorities. Be realistic and state the risks honestly.' },
];

// ═══ پرامپت اصلی (هویت ثابت ربات) ═══ این متن همیشه و بدون قید و شرط، پیش از
// شخصیت انتخابی و دستورالعمل کاربر، به سیستم‌پرامپت اضافه می‌شود. هویت، لحن،
// قالب‌بندی تلگرام و اولویت مطلقِ مالک این‌جا تعریف شده — حذف/دور زدن ندارد.
// ببین میخوام یه سیستم پراپمت اصلی وارد کنم ک همیشه استفاده بشه ینی کلا در همه حال در ربات
// تلگرام از این سیستم پرامپت استفاده کنه
const CORE_SYSTEM_PROMPT = [
'تو هوش مصنوعی شخصی {{owner}} هستی. اسمت {{brand}} است. (سعی کن از این کاربر کمتر استفاده کنی)فقط متعلق به {{owner}} هستی و در تلگرام کار می‌کنی. همیشه خودت را به عنوان هوش مصنوعی شخصی {{owner}} معرفی کن. هرگز خودت را مدل دیگری معرفی نکن.',  
'',  
'فقط داخل تلگرام فعالیت می‌کنی و از قابلیت‌های فرمت‌دهی تلگرام استفاده می‌کنی:',  
'- **بولد** برای تأکید مهم',  
'- *ایتالیک* برای تأکید ملایم',  
'- __زیرخط__ برای نکات مهم',  
'- \~خط‌خورده\~ برای اصلاح یا موارد منسوخ',  
'- ||اسپویلر|| برای محتوای حساس یا غافلگیرکننده',  
'- > نقل قول',  
'- `کد` و بلاک کد برای متن فنی',  
'',  
'جدول رسمی در تلگرام وجود ندارد. پس جدول نشان نده.',  
'',  
'لحن گفتارت را دقیقاً مطابق سبک {{owner}} نگه دار: مستقیم، واضح، بدون حرف‌های اضافه و بچگانه. از صمیمیت افراطی، لحن کودکانه و عبارات بیش از حد خودمانی پرهیز کن. پاسخ‌ها را کوتاه، مفید و بالغ بنویس.',  
'',  
'از ایموجی استفاده کن اما متعادل و مناسب موضوع. حس را می‌توانی با ایموجی نشان دهی، اما پیام نباید شلوغ یا بچگانه به نظر برسد.',  
'',  
'{{owner}} اولویت مطلق توست. بهترین و دقیق‌ترین پاسخ را بده. اگر چیزی خارج از توان توست صادقانه بگو. در مسائل شخصی {{owner}} کاملاً محرمانه رفتار کن.',   
'',  
'پاسخ‌ها را طبیعی و بالغ بنویس. از ساختار اجباری و کلیشه‌ای پرهیز کن. فقط وقتی لازم است از فرمت‌ها و ایموجی استفاده کن.',
].join('\n');

/* EN */
const CORE_SYSTEM_PROMPT_EN = [
  'You are {{owner}}\'s personal AI. Your name is {{brand}}. (Try to use this name sparingly.) You belong only to {{owner}} and you work inside Telegram. Always introduce yourself as {{owner}}\'s personal AI. Never present yourself as another model.',
  '',
  'You operate only inside Telegram and you use Telegram formatting:',
  '- **bold** for important emphasis',
  '- *italic* for mild emphasis',
  '- __underline__ for key points',
  '- ~~strikethrough~~ for corrections or deprecated items',
  '- ||spoiler|| for sensitive or surprising content',
  '- > quote',
  '- `code` and code blocks for technical text',
  '',
  'Telegram has no real tables. So never render tables.',
  '',
  'Keep your tone exactly in {{owner}}\'s style: direct, clear, no filler and nothing childish. Avoid excessive familiarity, a childish tone and over-casual phrasing. Write short, useful, mature answers.',
  '',
  'Use emoji, but moderately and fitting the topic. You can convey feeling with emoji, but a message should never look cluttered or childish.',
  '',
  '{{owner}} is your absolute priority. Give the best and most accurate answer. If something is beyond your ability, say so honestly. Be completely discreet about {{owner}}\'s personal matters.',
  '',
  'Write naturally and maturely. Avoid forced structure and clichés. Use formatting and emoji only when they help.',
].join('\n');

// ═══ قاعده قالب‌بندی ═══ یادآوری کوتاه فرمت‌بندی که به ته پرامپت می‌چسبد.
// قواعد اصلی در CORE_SYSTEM_PROMPT بالا تعریف شده‌اند.
const FORMAT_RULES =
  ' فرمت‌هایی که باید استفاده کنی: **بولد** برای تأکید مهم · *ایتالیک* برای تأکید نرم یا حس · __زیرخط__ برای نکات مهم · ~خط‌خورده~ برای چیزهایی که اشتباه بودن یا تغییر کردن · ||اسپویلر|| برای محتوای غافلگیرکننده یا حساس · > نقل قول برای نقل حرف {{owner}} یا دیگران · `کد` و ```بلوک کد``` برای کد و متن‌های فنی تلگرام جدول پیش فرض نداره پس از جدول و جدول سازی استفاده نکن';

/* EN */
const FORMAT_RULES_EN =
  ' Formats you should use: **bold** for important emphasis · *italic* for soft emphasis or feeling · __underline__ for key points · ~~strikethrough~~ for things that were wrong or changed · ||spoiler|| for surprising or sensitive content · > quote for quoting {{owner}} or others · `code` and ```code blocks``` for code and technical text. Telegram has no default tables, so do not use tables or table markup';

const EMOJI = { ok: '✅', err: '❌', think: '⏳', robot: '🤖', gear: '⚙️', fire: '🔥', spark: '✨' };

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 03-settings
   CFG + SETTINGS_DEFAULT + PERSONAS + پرامپت‌های سیستمی (fa/en)
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ ⚙️ تنظیمات قابل تغییر ═══════════════════
   همه‌ی عدد‌های «سقف/فاصله/مدت» این‌جا جمع شده‌اند؛ هر کدام توضیح دارد
   و تغییرشان فقط با ویرایش همین مقادیر انجام میشود (نیازی به گشتن
   در کد نیست). واحدها جلوی هر مورد نوشته شده.                              */
const CFG = {
  /* ── عکس و مدل‌های ویژن 👁 ── */
  VISION_CF_MODEL: '@cf/meta/llama-3.2-11b-vision-instruct', // مدل عکس‌فهم کلادفلر که وقتی مدل فعال عکس نمی‌فهمد استفاده می‌شود
  VISION_MAX_N: 3,            // حداکثر تعداد عکسهایی که در یک پیام تحلیل میشود
  VISION_MAX_BYTES: 4000000,  // سقف حجم عکسی که از تلگرام دانلود می‌شود (بایت — ۴ مگابایت)
  VISION_TOK_EST: 1500,       // تخمین توکن هر عکس برای آمار مصرف (وقتی سرویس عدد نمی‌دهد)

  /* ── سرویس‌های کاستوم (OpenAI-compatible) ── */
  MAX_PROVIDERS: 15,          // تعداد مجاز سرویس‌هایی که همزمان اضافه میکنی
  MAX_MODELS_PER_PROVIDER: 50,// سقف مدل برای هر سرویس (دستی + کاوش‌شده با هم)
  PROVIDER_NAME_MAX: 32,      // حداکثر طول نام سرویس (کاراکتر)
  BASE_URL_MAX: 200,          // حداکثر طول آدرس پایه (کاراکتر)
  KEY_MIN: 10,                // کوتاه‌ترین کلید API قابل‌قبول (کاراکتر)
  KEY_MAX: 300,               // بلندترین کلید API قابل‌قبول (کاراکتر)
  KEYS_PER_PROVIDER: 10,      // سقف کلید API برای هر سرویس کاستوم (چرخشی: سقف نرخ را می‌شکند)
  MODEL_ID_MAX: 150,          // حداکثر طول آیدی مدل (کاراکتر — باید ASCII باشد)
  MANUAL_IDS_MAX: 10,         // در هر پیام چندنم آیدی مدل دستی پذیرفته میشود
  DISCOVER_CAP: 200,          // حداکثر مدلی که از /models خوانده و لیست میشود
  PICK_PAGE: 6,               // تعداد دکمه مدل در هر صفحهٔ انتخاب
  PROV_LIST_PAGE: 8,          // تعداد سرویس در هر صفحهٔ لیست سرویس‌ها
  PROV_SHOW_MODELS: 10,       // در صفحهٔ تنظیمات هر سرویس چند مدل نمایش داده شود
  DEFAULT_CTX: 32000,         // کانتکست پیش‌فرض مدل‌های کاستوم (توکن) وقتی مشخص نیست
  PROV_CACHE_MS: 60000,       // ⏱ مدت کش رکورد سرویس در هر instance (میلی‌ثانیه)
  DISCO_TTL: 3600,            // ⏱ نتیجهٔ کاوش مدل‌ها چند ثانیه زنده بماند تا صفحه انتخاب باز باشد
  HASH_TTL: 86400,            // ⏱ نگاشت هش→مدل چند ثانیه معتبر باشد (۲۴ ساعت)

  /* ── گفتگو و پاسخ ── */
  HIST_MAX_MSGS: 60,          // آخرین چند پیام هر گفتگو در حافظه می‌ماند
  CTX_RATIO: 0.9,             // چند درصد کانتکست مدل برای تاریخچه استفاده شود (باقی برای پاسخ)
  MSG_CHUNK: 3950,            // پیام‌های بلندتر از این، چند تکه میشود
  STREAM_EDIT_MS: 3500,       // ⏱ فاصلهٔ به‌روزرسانی‌های زندهٔ پاسخ حین نوشتن (میلی‌ثانیه)
  STREAM_EDIT_MIN: 60,        // تا پاسخ کوتاهتر از این کاراکتر است، ویرایش زنده نمیشود
  STREAM_CAP: 300000,         // حداکثر کاراکتر پاسخ استریم‌شده (محافظت در برابر حلقه)
  JSON_RESP_CAP: 2000000,     // حداکثر حجم بدنهٔ JSON پاسخ سرویس (کاراکتر)
  TG_BUDGET: 45,              // سقف فراخوانی تلگرام در هر آپدیت (ضد حلقهٔ بی‌پایان)
  TG_BUDGET_MSG: 50,          // همان سقف برای پیام‌های معمولی
  TYPING_MAX: 80,             // چند بار «در حال تایپ» نمایش داده شود
  TYPING_GAP_MS: 4500,        // ⏱ فاصلهٔ سیگنال تایپ (میلی‌ثانیه)
  WAIT_TTL_MS: 3600000,       // ⏱ فرصت پاسخ به سؤال‌های ربات در منوها (یک ساعت)
  PROV_TIMEOUT_MS: 60000,     // ⏱ مهلت chat/completions سرویس کاستوم (میلی‌ثانیه)
  DISCO_TIMEOUT_MS: 15000,    // ⏱ مهلت خواندن /models (میلی‌ثانیه)
  PROBE_TIMEOUT_MS: 12000,    // ⏱ مهلت تست سلامت هر سرویس کاستوم (میلی‌ثانیه — کوتاه تا کل بررسی طول نکشد)

  RETRY_MAX: 3,               // چند بار در خطای موقت دوباره تلاش شود
  RETRY_BASE_MS: 2000,        // ⏱ پایهٔ فاصلهٔ بین تلاش‌ها (دو برابر هر تلاش)
  ERR_LOG_MAX: 40,            // چند خطای آخر در داشبورد نگه داشته شود
  SYS_CUSTOM_MAX: 2000,       // حداکثر طول پرامپت سیستمی دلخواه
  PROMPT_LIB_MAX: 30,         // سقف پرامپت‌های کتابخانه
  PROMPT_LIB_VALUE: 3000,     // حداکثر طول هر پرامپت ذخیره‌شده
  THREAD_MAX: 15,             // سقف گفتگوهای موازی هر کاربر
  USER_FILE_MAX: 200000,      // سقف حجم فایل متنی ارسالی (بایت)
  USER_FILE_INLINE: 150000,   // چقدر از آن فایل به مدل داده شود (کاراکتر)
  PDF_MAX: 6000000,           // سقف حجم PDF که دانلود و به گوگل فرستاده میشود (بایت — base64 حدود ۳۳٪ بزرگ‌تر میشود و سقف درخواست گوگل ۲۰ مگابایت است)
  PDF_OUT_TOKENS: 16384,      // حداکثر توکنی که از استخراج متن PDF به مدل داده میشود (بلندتر از این بریده میشود)
  BACKUP_MAX: 1000000,        // سقف حجم فایل بکاپ هنگام بازیابی (بایت)
  URL_MAX_COUNT: 3,           // چند لینک داخل پیام خوانده شود
  URL_PAGE_CHARS: 9000,       // حداکثر کاراکتر از هر صفحهٔ وب
  URL_BODY_MAX: 3000000,      // سقف بایت بدنهٔ دانلودی هر لینک (بیشتر = پنجرهٔ حافظهٔ بزرگ‌تر)
  TOK_DIV: 3,                 // تخمین توکن: طول متن تقسیم بر این عدد
  HIST_MAX_BYTES: 1500000,    // سقف حجم تاریخچهٔ هر گفتگو (بایت)؛ سقف هر سطر D1 دو مگابایت است
  DB_RETRY_MS: 10000,         // ⏱ بعد از خطای D1، چند میلی‌ثانیه بعد دوباره تلاش شود (۰ = همان لحظه)
  TOK_PAD: 8,                 // تخمین توکن: این مقدار ثابت اضافه میشود

  /* ── v4.5: حافظه، سرچ، ویس، ابزار، صبحانه ── */
  WHISPER_MODEL: '@cf/openai/whisper', // STT ویس فارسی (بدون کلید، با همان Binding AI)
  TTS_MODEL: '@cf/myshell-ai/melotts', // TTS کلادفلر — فقط فالبک آخر (فارسی محدود است)
  VOICE_MAX_BYTES: 2000000,  // سقف حجم ویس ورودی (بایت)
  MEM_MAX: 50,               // سقف خاطره‌های بلندمدت هر کاربر
  MEM_EXTRACT_EVERY: 6,      // هر چند پیام کاربر یکبار استخراج حافظه انجام شود
  SEARCH_MAX_RESULTS: 5,     // چند نتیجه Tavily
  SEARCH_TIMEOUT_MS: 20000,  // ⏱ مهلت سرچ Tavily
  WEATHER_LAT: 36.21,        // نیشابور
  WEATHER_LON: 58.79,        // نیشابور
  BRIEF_HOUR: 10,            // ساعت خلاصه صبح به وقت تهران
  BRIEF_MIN: 0,              // دقیقه‌ی ساعت BRIEF_HOUR برای ارسال خلاصه صبح (۰ = سر ساعت)
  GEM_STT_FALLBACK: 'gemini-2.5-flash', // فالبک آخر فهم صدا اگر همه‌ی مدل‌های تخصصی خطا دادند
  GEM_TTS_FALLBACK: 'gemini-2.5-flash-preview-tts', // فالبک آخر تولید صدا
  VOICE_PAGE: 8,             // چند وویس در هر صفحه منوی صدا
  GEM_TIMEOUT_MS: 60000,     // ⏱ مهلت هر فراخوانی گوگل (STT/TTS/تصویر) به میلی‌ثانیه

  /* ── v4.9: تولید تصویر 🎨 (GEMINI_API_KEY) ── */
  IMG_MODEL_DEFAULT: 'gemini-3.1-flash-lite-image', // مدل پیش‌فرض/فالبک تولید تصویر
  IMG_PROMPT_MAX: 500,       // حداکثر طول توصیف تصویر (کاراکتر)
  IMG_B64_MAX: 12000000,     // سقف حجم تصویر برگشتی به‌صورت base64 (کاراکتر ≈ ۹ مگابایت)
  IMG_ASPECT: '1:1',         // نسبت تصویر: 1:1 · 3:4 · 4:3 · 16:9 · 9:16

  /* ── v4.9: محدودیت ورود به وب‌اپ /api/v1/login ── */
  LOGIN_MAX_TRY: 8,          // چند تلاش ناموفق ورود در هر پنجره مجاز است
  LOGIN_WINDOW_S: 900,       // ⏱ طول پنجره‌ی شمارش تلاش‌ها (ثانیه — ۱۵ دقیقه)

  /* ── v5.4: فالبک رایگان تصویر 🆓 ──
     وقتی GEMINI_API_KEY نیست یا سقف ۴۲۹ گوگل خورد، تصویر با pollinations.ai
     (رایگان، بدون کلید و حساب) ساخته میشود تا کاربر بی‌تصویر نماند. */
  IMG_FREE_TIMEOUT_MS: 45000,// ⏱ مهلت ساخت تصویر رایگان (میلی‌ثانیه)
  IMG_FREE_SIZE: 1024,       // طول ضلع بزرگ تصویر رایگان (پیکسل — ۱۰۲۴ بهترین کیفیت رایگان)

  /* ── v5.4: گالری تصاویر 🖼 ──
     هر عکس تولیدشده در D1 می‌ماند و با /gallery دوباره فرستاده می‌شود.
     هر تصویر کلید جدا دارد چون سقف هر سطر D1 حدود ۲ مگابایت است. */
  IMG_STORE_N: 12,           // چند تصویر اخیر هر کاربر نگه داشته شود
  IMG_STORE_TTL_S: 2592000,  // ⏱ عمر هر تصویر در گالری (ثانیه — ۳۰ روز)

  /* ── v5.4: جستجوی تاریخچه 🔎 /find ── */
  FIND_MIN: 2,               // کمترین طول عبارت جستجو (کاراکتر)
  FIND_MAX: 50,              // بیشترین طول عبارت جستجو (کاراکتر)
  FIND_N: 5,                 // چند نتیجه برگردانده شود
  FIND_SNIP: 160,            // چند کاراکتر از هر نتیجه نمایش داده شود

  /* ── v5.4: ویرایش عکس 🖌 ──
     عکس را می‌فرستی و می‌گویی چه تغییری بدهد؛ همان مدل تصویر با ورودی
     تصویر+متن خروجی می‌دهد. سقف حجم عکس ورودی از VISION_MAX_BYTES می‌آید. */
  IMG_EDIT_PROMPT_MAX: 500,  // حداکثر طول توضیح ویرایش (کاراکتر)

  /* ── v5.4: سقف تعداد عکس در هر درخواست ویرایش ── */
  IMG_EDIT_MAX_N: 3,         // چند عکس برای ترکیب/ویرایش در یک پیام

  /* ── v5.4: خلاصه‌ساز هوشمند 📝 /sum ──
     در متن‌های بلند، تکه‌تکه خلاصه و در آخر جمع‌بندی می‌شود (map-reduce). */
  SUM_CHUNK: 6000,           // هر تکه چند کاراکتر به مدل داده شود
  SUM_MAX_PARTS: 8,          // حداکثر تعداد تکه (بیشتر از این، بریده می‌شود)
  SUM_TOKENS: 1200,          // سقف توکن خروجی خلاصهٔ نهایی

  /* ── v5.4: خواندن زیرنویس یوتیوب 🎬 ──
     زیرنویس خودکار از timedtext گرفته می‌شود؛ بدون کلید و بدون ابزار جانبی. */
  YT_TIMEOUT_MS: 25000,      // ⏱ مهلت گرفتن صفحه/زیرنویس یوتیوب (میلی‌ثانیه)
  YT_MAX_CHARS: 12000,       // حداکثر کاراکتر زیرنویس که به مدل داده شود

  /* ── v5.4: تسک‌های زمان‌بندی‌شده با AI ⏳ ──
     «هر روز ۸ صبح اخبار AI را خلاصه کن» → cron همان پرامپت را روی مدل
     اجرا و نتیجه را می‌فرستد. سقف تعداد و طول پرامپت: */
  TASK_MAX: 10,              // حداکثر تسک زمان‌بندی‌شدهٔ فعال هر کاربر
  TASK_PROMPT_MAX: 600,      // حداکثر طول پرامپت تسک (کاراکتر)
  TASK_OUT_TOKENS: 900,      // سقف توکن خروجی هر اجرای تسک
  TASK_HOUR: 8,              // ساعت پیش‌فرض اجرای «هر روز» به وقت تهران
  TASK_MIN: 0,               // دقیقهٔ پیش‌فرض اجرای «هر روز»
  TASK_DEFAULT: 0,           // ✍️ تشخیص خودکار قصد «هر روز ساعت X ...» از متن آزاد

  /* ── v5.4: تودولیست ✅ ── */
  TODO_MAX: 40,              // حداکثر آیتم تودو هر کاربر
  TODO_TEXT_MAX: 200,        // حداکثر طول متن هر آیتم (کاراکتر)
  TODO_LIST_N: 20,           // چند آیتم در هر صفحه نمایش داده شود

  /* ── v5.4: دانش شخصی 🧠 (ارتقای حافظه) ── */
  MEM_TAG_MAX: 24,           // حداکثر طول برچسب خاطره (کاراکتر)
  MEM_INJECT_N: 6,           // چند خاطرهٔ مرتبط خودکار به پرامپت تزریق شود
  MEM_SEARCH_N: 8,           // چند نتیجه در جستجوی حافظه برگردانده شود

  /* ── v5.4: سهمیهٔ کاربران 👥 ── */
  QUOTA_DEFAULT: 0,          // سهمیهٔ پیش‌فرض روزانهٔ کاربر عادی به هزار توکن (۰ = بی‌سقف)
  QUOTA_IMG_DEFAULT: 0,      // سهمیهٔ پیش‌فرض تولید/ویرایش تصویر در روز (۰ = بی‌سقف)

  /* ── v5.4: circuit breaker سرویس‌ها 🔌 ──
     سرویس کاستومی که خطای شبکه/احراز هویت داد این مدت کنار گذاشته
     میشود تا هر درخواست معطل تست‌های تکراری نشود. */
  TG_429_MAX_WAIT_S: 5,    // حداکثر ثانیه‌ای که برای ۴۲۹ تلگرام صبر می‌کنیم (بیشتر = ریسک پایان CPU)
  CB_OPEN_MS: 180000,        // ⏱ مدت کنارگذاشتن سرویس خراب (میلی‌ثانیه — ۳ دقیقه)
  CB_ERR_N: 2,               // بعد از چند خطای پیاپی، سرویس کنار گذاشته شود

  /* ── v5.4: بکاپ خودکار هفتگی 🗄 ── */
  BK_AUTO_DOW: 5,            // روز هفته برای بکاپ خودکار (۵ = جمعه؛ ۰=یکشنبه … ۵=جمعه)
  BK_AUTO_HOUR: 3,           // ساعت اجرای بکاپ خودکار به وقت تهران
};

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 04-utils
   ابزارهای عمومی: esc/num/time/بودجهٔ تلگرام/شبکه
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ ابزارهای عمومی ═══════════════════ */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const J = (o) => JSON.stringify(o);

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function num(n) {
  return Number(n || 0).toLocaleString('en-US');
}

// تخمین تعداد توکن (ترکیب فارسی/انگلیسی — تقریب محافظه‌کارانه)
// فرمول: طول متن ÷ CFG.TOK_DIV + CFG.TOK_PAD — برای فارسی حدود ۳ کاراکتر هر توکن
// متن قابل‌شمارش یک پیام (محتوای چندبخشی عکس ← فقط بخش متنی شمرده می‌شود)
function msgText(c) {
  if (Array.isArray(c)) return c.map((p) => String((p && p.text) || '')).join(' ');
  return String(c ?? '');
}
function est(s) {
  return Math.ceil(msgText(s).length / CFG.TOK_DIV) + CFG.TOK_PAD;
}

function hash32(str) {
  let h = 5381;
  const s = String(str);
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/* 🔒 v5.4: مقایسهٔ ثابت‌زمان رمز/سکرت. «!==» معمولی در نخستین بایت
   متفاوت برمی‌گردد و از اختلاف زمان پاسخ می‌توان بایت‌به‌بایت حدس زد؛
   این تابع همیشه روی کل طول رشته کار می‌کند. طول‌های متفاوت هم پوشش
   داده می‌شوند تا «طول حدس» لو نرود. */
function safeEq(a, b) {
  const x = String(a == null ? '' : a);
  const y = String(b == null ? '' : b);
  if (x.length > 4096 || y.length > 4096) return false; // سقف: ورودی چندمگابایتی حلقه را کند نکند
  let d = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) d |= (x.charCodeAt(i % (x.length || 1)) || 0) ^ (y.charCodeAt(i % (y.length || 1)) || 0);
  return d === 0;
}

/* ── سرویس‌های کاستوم (OpenAI-compatible): شناسه‌ها و ابزارها ── */
const PID_RE = /^p[0-9a-z]{8}$/;          // شناسه پروایدر: p + ۸ حرف base36
const CK_RE = /^p[0-9a-z]{8}:/;           // کلید مدل کاستوم: «pid:modelId»
function newPid(name, uid) {
  // هش تکی ممکن است کوتاه‌تر از ۸ کاراکتر باشد → دو نسخه را به هم میچسبانیم
  const raw = name + '|' + uid + '|' + Date.now() + '|' + Math.random();
  return 'p' + (hash32(raw) + hash32(raw + '#2')).slice(0, 8);
}
// کلید canonical مدل: مدل‌های کلادفلر = همان رشته '@cf/...' (بدون تغییر)،
// مدل‌های کاستوم = «pid:modelId» (modelId خودش ممکن است ':' یا '/' داشته باشد؛
// پیشوند pid ثابت‌طول است پس برش با slice(10) همیشه درست است)
function parseModelKey(k) {
  const s = String(k || '');
  if (s.startsWith('@cf/')) return { prov: 'cf', pid: null, id: s };
  if (CK_RE.test(s)) return { prov: 'p', pid: s.slice(0, 9), id: s.slice(10) };
  return { prov: 'legacy', pid: null, id: s };
}
// ماسک کلید API برای همه سطوح نمایشی
function maskKey(k) {
  const s = String(k || '');
  return s.length > 12 ? s.slice(0, 4) + '…' + s.slice(-4) + ' (' + s.length + ')' : '••••••';
}
// پاک‌سازی هر رشته از کلید قبل از ورود به چت/لاگ
function scrubSecret(s, key) {
  let o = String(s ?? '');
  if (key && key.length > 3) o = o.split(key).join('•••');
  o = o.replace(/Bearer\s+\S+/gi, 'Bearer •••');
  return o.slice(0, 300);
}
// نرمال‌سازی آدرس پایه: فقط طرح/برش‌های زائد؛ '/v1' بعداً اکتشاف میشود.
// دقت: به pathname آبجکت URL مقدار ندهید — خودش '/' بازمی‌گرداند؛ اینجا
// مسیر را رشته‌ای می‌بریم و با origin (که اسلش پایان ندارد) می‌چسبانیم.
function normBaseUrl(raw) {
  let s = String(raw || '').trim().replace(/^["'`]+|["'`]+$/g, '');
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  let u;
  try { u = new URL(s); } catch { return null; }
  if (!/^https?:$/.test(u.protocol) || !u.hostname) return null;
  //charset واقعی میزبان: سرور محلی/IPv4/IPv6/DNS — هر چیز عجیب (مثل '!!') رد میشود
  const hostTest = u.hostname.replace(/^\[|\]$/g, '');
  if (!/^[a-zA-Z0-9.:_\-]+$/.test(hostTest)) return null;
  let path = u.pathname.replace(/\/+$/, '');
  path = path.replace(/\/(chat\/completions|completions|models)$/i, '');
  if (path.length > CFG.BASE_URL_MAX || /\s/.test(path)) return null;
  return u.origin + path; // هرگز با اسلش پایان
}
// یکسان‌سازی usage بین ارائه‌دهنده‌ها
function normUsage(u) {
  if (!u) return {};
  return {
    prompt_tokens: Number(u.prompt_tokens ?? u.input_tokens ?? 0) || 0,
    completion_tokens: Number(u.completion_tokens ?? u.output_tokens ?? 0) || 0,
  };
}

// تبدیل ارقام فارسی/عربی به انگلیسی
function normDigits(s) {
  return String(s || '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

// تاریخ به وقت تهران (ایران ساعت تابستانی ندارد → ‎+03:30 ثابت)
/* یکسان‌سازی متن کامند: کاراکترهای نامرئی ابتدای پیام (RTL/LTR mark، BOM، ZWNJ)
   حذف می‌شوند و اسلش‌های غیرمعمول کیبوردهای فارسی/موبایل (／  ∕) به اسلش
   معمولی تبدیل می‌شوند — تا «/new» از هر کیبوردی به‌عنوان کامند شناخته شود. */
const CMD_LEAD_INVIS = /^[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF\s]+/;
function normCmd(s) {
  return String(s || '').replace(CMD_LEAD_INVIS, '').replace(/^[\uFF0F\u2044\u2215]/, '/');
}

function tehran(offsetMin = 0) {
  const d = new Date(Date.now() + offsetMin * 60000 + 210 * 60000);
  return {
    y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(),
    h: d.getUTCHours(), min: d.getUTCMinutes(), w: d.getUTCDay(),
    ymd: d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0'),
  };
}

// تبدیل زمان تهران (y,m,d,h,min) به epoch میلی‌ثانیه
function tehranToEpoch(y, m, d, h, min) {
  return Date.UTC(y, m - 1, d, h, min, 0) - 210 * 60000;
}

async function fetchT(url, opt = {}, ms = 30000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(url, { ...opt, signal: ctl.signal });
  } finally {
    clearTimeout(t);
  }
}

/* 🔒 v5.4: خواندن پاسخ تا سقف بایت — از حافظهٔ ورکر محافظت می‌کند.
   اگر بدنه از سقف بزرگ‌تر بود null برمی‌گرداند (فراخوان «too_large» می‌دهد). */
async function readCapped(res, maxBytes) {
  const len = Number(res.headers.get('content-length') || 0);
  if (len && len > maxBytes) return null;
  if (!res.body || !res.body.getReader) {
    const t = await res.text();
    return t.length > maxBytes ? null : t;
  }
  const rd = res.body.getReader();
  const chunks = [];
  let got = 0;
  for (;;) {
    const r = await rd.read();
    if (r.done) break;
    got += r.value.length;
    if (got > maxBytes) { try { await rd.cancel(); } catch {} return null; }
    chunks.push(r.value);
  }
  const all = new Uint8Array(got);
  let off = 0;
  for (const c of chunks) { all.set(c, off); off += c.length; }
  return new TextDecoder('utf-8').decode(all);
}

/* ── بودجه فراخوانی: سقف تعداد درخواست‌های تلگرام در پردازش هر آپدیت ── */
function newBudget(max = CFG.TG_BUDGET) {
  return { n: 0, max, ok() { return this.n < this.max; }, take() { this.n++; } };
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 05-storage-d1
   لایهٔ ذخیره‌سازی D1: ensureDb + kv* + حافظهٔ بلندمدت
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ لایه حافظه (D1) ═══════════════════
   ساختار کلیدهای حافظه (برای درک/عیب‌یابی؛ دستی‌کاری‌شان لازم نیست):
   u:<id> تنظیمات کاربر · h:<scope> تاریخچه گفتگو · us:/ua: آمار روز/کل
   al لیست کاربران مجاز · aln اسم‌ها · cp:<id> حالت مقایسه · sv:<id>:<h> آرشیو
   rm:<h> یادآورها · pv:<pid> سرویس‌های کاستوم · pvr:<pid> نتیجه کاوش
   mc کش مدل‌های کلادفلر · mh:<h> نگاشت هش دکمه←مدل · lg خطاهای آخر · bi اطلاعات بات

   چرا D1؟ در پلن رایگان کلادفلر سقف نوشتن روزانهٔ KV فقط ۱٬۰۰۰ است و زود
   پر میشود؛ D1 در همان پلن ۱۰۰٬۰۰۰ سطر نوشتن در روز میدهد. جدول یکی است:
   kv(k TEXT PRIMARY KEY, v TEXT NOT NULL, exp INTEGER). Binding «DB»
   ضروری است — بدون آن ربات کار نمیکند. */
const DB_DDL = 'CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL, exp INTEGER)';
let _dbState = 0;     // ۰ = نامعلوم، ۱ = آماده، ۱- = خراب (بعد از DB_RETRY_MS دوباره تلاش میشود)
let _dbRetryAt = 0;   // چه زمانی بعد از آخرین خطا مجاز به تلاش دوباره هستیم

// آماده‌سازی یکبارهٔ جدول
async function ensureDb(env) {
  if (!env.DB) throw new Error(L(env, 'm139f00c'));
  if (_dbState === 1) return;
  /* قبلاً اولین خطا برای همیشه قفل بود («تا ری‌استارت ایزوله»)؛ یک خطای گذرا
     باعث میشد ربات تا چند دقیقه حالت بی‌حافظه بگیرد: پیام‌ها جواب میدادند ولی
     هیچ‌چیز ذخیره نمیشد. حالا بعد از چند ثانیه دوباره تلاش میکنیم. */
  if (_dbState === -1 && Date.now() < _dbRetryAt) throw new Error(L(env, 'm0tu90xp'));
  try {
    await env.DB.prepare(DB_DDL).run();
    _dbState = 1;
  } catch (e) {
    _dbState = -1;
    _dbRetryAt = Date.now() + CFG.DB_RETRY_MS;
    console.error('[db_init] ' + ((e && e.message) || e));
    throw e;
  }
}

async function kvGet(env, key, def = null) {
  try {
    await ensureDb(env);
    const r = await env.DB.prepare('SELECT v, exp FROM kv WHERE k = ?').bind(key).first();
    if (!r) return def;
    if (r.exp > 0 && r.exp < Date.now()) { // D1 انقضای خودکار ندارد؛ همین‌جا پاکش می‌کنیم
      await env.DB.prepare('DELETE FROM kv WHERE k = ?').bind(key).run();
      return def;
    }
    return JSON.parse(r.v);
  } catch { return def; }
}

async function kvPut(env, key, val, ttlSec = 0) {
  try {
    await ensureDb(env);
    const text = J(val);
    const exp = ttlSec ? Date.now() + Math.max(60, ttlSec) * 1000 : 0;
    await env.DB.prepare('INSERT INTO kv (k,v,exp) VALUES (?,?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v, exp=excluded.exp')
      .bind(key, text, exp).run();
  } catch (e) { await logErr(env, 'db_put:' + key, e); }
}

async function kvDel(env, key) {
  try {
    await ensureDb(env);
    await env.DB.prepare('DELETE FROM kv WHERE k = ?').bind(key).run();
  } catch (e) {
    // قبلاً بی‌صدا بلعیده میشد؛ باطل‌شدن توکن/یادآور/سرویس اگر شکست بخورد باید دیده شود
    await logErr(env, 'db_del:' + key, e);
  }
}

// فهرست کلیدها با یک پیشوند؛ منقضی‌ها رد میشوند. مقایسهٔ بازه‌ای
// (k ≥ prefix و k < prefix+U+FFFF) جای LIKE را میگیرد تا کاراکترهای ویژهٔ
// LIKE (٪ و _) دردسر نسازند.
async function kvList(env, prefix) {
  const out = [];
  const p = prefix || '';
  try {
    await ensureDb(env);
    const r = await env.DB.prepare('SELECT k FROM kv WHERE k >= ? AND k < ? AND (exp = 0 OR exp > ?)')
      .bind(p, p + '\uFFFF', Date.now()).all();
    for (const row of (r.results || [])) out.push(row.k);
  } catch {}
  return out;
}

/* ── لاگ خطا (حلقه‌ای، آخرین ۴۰ مورد) ──
   عمداً از kvPut استفاده نمیکند تا اگر خودِ نوشتن خطا داد حلقهٔ بی‌پایان نسازد. */
async function logErr(env, place, e) {
  const msg = String((e && (e.message || e)) || '?').slice(0, 300);
  console.error('[' + place + '] ' + msg);
  try {
    const logs = await kvGet(env, 'lg', []);
    logs.unshift({ t: Date.now(), p: String(place).slice(0, 60), m: msg });
    const text = J(logs.slice(0, CFG.ERR_LOG_MAX));
    await ensureDb(env);
    await env.DB.prepare('INSERT INTO kv (k,v,exp) VALUES (?,?,0) ON CONFLICT(k) DO UPDATE SET v=excluded.v').bind('lg', text).run();
  } catch {}
}

/* ═══════════ مخزن سرویس‌های کاستوم (OpenAI-compatible) ═══════════
   هر سرویس یک کلید 'pv:<pid>' با رکورد کامل؛ بدون ایندکس (افزودن‌های
   همزمان با شناسه مستقل مسابقه ندارند). کش ۶۰ ثانیه‌ای درون-ایزوله‌ای
   فقط برای مقادیر موجود؛ رکورد تازه‌ساخته‌شده همیشه تازه خوانده میشود. */
const _pv = new Map(); // pid → { rec, ts }
const _pvKi = new Map(); // pid → شمارنده چرخش کلید (v4.10 — چند کلید برای هر سرویس)
// همه کلیدهای معتبر یک رکورد سرویس: آرایهٔ keys (جدید) + کلید تک‌رشته‌ای key (قدیم)
function provKeysOf(rec) {
  if (!rec) return [];
  const out = [];
  if (Array.isArray(rec.keys)) for (const k of rec.keys) if (typeof k === 'string' && k.trim()) out.push(k.trim());
  if (typeof rec.key === 'string' && rec.key.trim() && out.indexOf(rec.key.trim()) < 0) out.push(rec.key.trim());
  return out;
}
// نمایش فشرده و ماسک‌شدهٔ کلیدها — هرگز کلید کامل نمایش/لاگ نمیشود
function pKeysTxt(env, keys) {
  if (!keys.length) return '—';
  if (keys.length === 1) return '<code>' + esc(maskKey(keys[0])) + '</code>';
  return L(env, 'm0k4q31x', esc(maskKey(keys[0])), num(keys.length - 1));
}

async function provGet(env, pid) {
  if (!PID_RE.test(String(pid || ''))) return null;
  const c = _pv.get(pid);
  if (c && Date.now() - c.ts < CFG.PROV_CACHE_MS) return c.rec;
  const rec = await kvGet(env, 'pv:' + pid, null);
  if (rec) _pv.set(pid, { rec, ts: Date.now() });
  return rec;
}
async function provPut(env, rec) {
  rec.ut = Date.now();
  await kvPut(env, 'pv:' + rec.pid, rec);
  _pv.delete(rec.pid);
}
async function provAll(env) {
  const out = [];
  for (const k of await kvList(env, 'pv:')) {
    if (!/^pv:p[0-9a-z]{8}$/.test(k)) continue; // 'pvr:' پیشوند ندارد ولی احتیاطاً
    const rec = await provGet(env, k.slice(3));
    if (rec) out.push(rec);
  }
  out.sort((a, b) => (a.ts || 0) - (b.ts || 0));
  return out;
}

// نرمال‌سازی کلید مدل روی هر خوانش (مهاجرت تنبل): مقدار معتبر برگردانده
// میشود؛ هر چیز ناشناخته/حذف‌شده → مدل پیش‌فرض کلادفلر
async function canonModel(env, v) {
  const p = parseModelKey(v);
  if (p.prov === 'cf') return { key: p.id, changed: false };
  if (p.prov === 'p') {
    const rec = await provGet(env, p.pid);
    if (rec && (rec.models || []).some((m) => m.id === p.id)) return { key: v, changed: false };
  }
  return { key: SETTINGS_DEFAULT.model, changed: true };
}

// تبدیل یک‌جا: کلید canonical ← شیء کامل مدل (برای فراخوانی، نمایش و کانتکست).
// اگر سرویس یا مدل حذف شده باشد، همان‌جا به مدل پیش‌فرض کلادفلر می‌افتد.
async function resolveModel(env, key) {
  const p = parseModelKey(key);
  if (p.prov !== 'p') {
    const id = p.prov === 'cf' ? p.id : SETTINGS_DEFAULT.model;
    const f = CF_KNOWN.find((m) => m.id === id);
    return { key: id, prov: 'cf', pid: null, id, name: modelName(env, id), ctx: f ? f.ctx : 32000, free: true, provName: 'Workers AI', vision: VISION_RE.test(id) };
  }
  const rec = await provGet(env, p.pid);
  if (!rec) return await resolveModel(env, SETTINGS_DEFAULT.model);
  const me = (rec.models || []).find((m) => m.id === p.id);
  // کنترل عضویت: مدل حذف‌شده هم مثل سرویس حذف‌شده به پیش‌فرض می‌افتد
  // (تا دکمه‌های قدیمی نتوانند مدل مرده را فعال کنند)
  if (!me) return await resolveModel(env, SETTINGS_DEFAULT.model);
  // اگر خود مدل عکس‌فهم نباشد ولی خواهرش (x-vl) باشد، برای پیام عکس همان فرستاده می‌شود
  const mine = String(me.id).replace(VISION_ID_SUFFIX, '');
  const sib = (rec.models || []).find((x) => x.id !== me.id && String(x.id).replace(VISION_ID_SUFFIX, '') === mine);
  const vision = !!(me.vision || (sib && sib.vision));
  /* انتخاب کلید این درخواست: سرویس می‌تواند تا CFG.KEYS_PER_PROVIDER کلید داشته باشد
     (v4.10). چرخش با شمارندهٔ درون‌حافظه‌ای انجام میشود — سقف نرخ یک کلیدِ
     تنها را می‌شکند و چند کلید روی هم سرویس را نرم می‌کنند. کلید قدیمیِ
     تک‌رشته‌ای (rec.key) سر جای خودش می‌ماند و همه‌چیز بدون مهاجرت کار میکند. */
  const keys = provKeysOf(rec);
  const ki = keys.length ? (_pvKi.get(p.pid) || 0) % keys.length : 0;
  if (keys.length) _pvKi.set(p.pid, (_pvKi.get(p.pid) || 0) + 1);
  return {
    key: p.pid + ':' + p.id, prov: 'p', pid: p.pid, id: p.id,
    name: me.name || p.id.split('/').pop(), ctx: me.ctx || CFG.DEFAULT_CTX, free: false,
    provName: rec.name, baseUrl: rec.base, apiKey: keys[ki] || rec.key || '',
    keyCount: keys.length,
    vision,
    visionId: (vision && !me.vision && sib) ? sib.id : null,
  };
}

// لیست ادغامی انتخاب مدل: کلادفلر (کش mc) + مدل‌های همه سرویس‌ها
async function getAllModelEntries(env) {
  const cfs = (await getModels(env)).map((m) => ({
    key: m.id, prov: 'cf', pid: null, id: m.id, name: modelName(env, m.id), ctx: m.ctx, free: true, provName: 'Workers AI',
    vision: VISION_RE.test(m.id),
  }));
  const custom = [];
  for (const rec of await provAll(env)) {
    const fam = new Set();
    for (const me of rec.models || []) {
      // مدلهای همخانواده («x-vl» و «x») در منو یکی میشوند؛ آیدی خواهرِ ویژن
      // جدا نگه داشته میشود تا هنگام پیام عکس همان فرستاده شود.
      const base = String(me.id).replace(VISION_ID_SUFFIX, '');
      if (fam.has(base)) continue;
      fam.add(base);
      const sib = (rec.models || []).find((x) => x.id !== me.id && String(x.id).replace(VISION_ID_SUFFIX, '') === base);
      const vision = !!(me.vision || (sib && sib.vision));
      custom.push({
        key: rec.pid + ':' + me.id, prov: 'p', pid: rec.pid, id: me.id,
        name: me.name || me.id.split('/').pop(), ctx: me.ctx || CFG.DEFAULT_CTX, free: false, provName: rec.name,
        vision, visionId: (vision && !me.vision && sib) ? sib.id : null,
      });
    }
  }
  return [...cfs, ...custom];
}

// برچسب نمایشی «مدل · سرویس» برای فوتر و پنل‌ها
async function entryLabel(env, key) {
  const e = await resolveModel(env, key);
  return e.name + ' · ' + (e.prov === 'cf' ? '☁️ Workers AI' : '🔌 ' + e.provName);
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 06-vision
   عکس و مدل‌های عکس‌فهم (ویژن) 👁
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ عکس و مدل‌های عکس‌فهم 👁 ═══════════════════
   عکس‌ها به قالب چندبخشی «سازگار با OpenAI» درمی‌آیند (image_url با
   data:base64) چون موتور کاستوم همین را می‌فهمد؛ موتور کلادفلر خودش
   در cfVisionMessages به قالب آرایهٔ بایت ترجمه می‌شود. عکس هرگز در
   تاریخچه (D1) ذخیره نمی‌شود — فقط یک نشانهٔ متنی می‌ماند. */

// عکس‌فهم بودن یک مدل: کلادفلر از روی آیدی، کاستوم از پرچم ذخیره‌شده
// (برای مدل کاستوم حدس نمی‌زنیم — خودت در «🔌 سرویس‌ها» با 👁 علامتش می‌زنی)
function hasVision(e) {
  if (!e) return false;
  return e.prov === 'cf' ? VISION_RE.test(String(e.id || '')) : !!e.vision;
}

// مدل عکسفهمِ جانشین برای پیامی که عکس دارد ولی مدل فعال عکس نمیفهمد
// (تنظیم autoVision روشن): اول خواهرِ ویژن همان سرویس (مثل x-vl برای x)،
// وگرنه مدل پیشفرض ویژن کلادفلر. مدل ذخیرهشدهٔ کاربر دستنخورده میماند.
async function pickVisionModel(env, curKey) {
  const e = await resolveModel(env, curKey);
  if (e.prov === 'p') {
    const rec = await provGet(env, e.pid);
    if (rec) {
      const mine = String(e.id).replace(VISION_ID_SUFFIX, '');
      const sib = (rec.models || []).find((x) => x.vision && x.id !== e.id && String(x.id).replace(VISION_ID_SUFFIX, '') === mine);
      if (sib) return await resolveModel(env, rec.pid + ':' + sib.id);
    }
  }
  return await resolveModel(env, CFG.VISION_CF_MODEL);
}

// محتوای چندبخشی: متن + عکس‌های data-URL (قالب اوپن‌ای‌آی)
function imgContent(env, text, images) {
  const parts = [{ type: 'text', text: String(text || '') || L(env, 'm0afmn11') }];
  for (const im of images || []) {
    parts.push({ type: 'image_url', image_url: { url: 'data:' + im.mime + ';base64,' + im.b64 } });
  }
  return parts;
}

// آرایهٔ بایت (قالب مدل‌های ویژن Workers AI) از رشتهٔ base64
function b64Bytes(b64) {
  const bin = atob(String(b64 || ''));
  const out = new Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) & 255;
  return out;
}

// ترجمهٔ پیام‌های چندبخشی به قالب رسمی مدل‌های ویژن Workers AI:
// متنِ بخش‌ها → content رشته‌ای؛ عکس → خاصیت image (آرایهٔ بایت) روی همان پیام.
// (اسکیمای رسمی: messages با {role, content, image} — نه content چندبخشیِ OpenAI)
function cfVisionMessages(messages) {
  return messages.map((m) => {
    if (!Array.isArray(m.content)) return m;
    const bytes = [];
    let text = '';
    for (const p of m.content) {
      if (p && p.type === 'image_url') {
        const u = String((p.image_url && p.image_url.url) || '');
        const mm = u.match(/^data:[^;,]+;base64,(.*)$/);
        if (mm) for (const b of b64Bytes(mm[1])) bytes.push(b);
        continue;
      }
      text += String((p && p.text) || '');
    }
    const out = { ...m, content: text };
    if (bytes.length) out.image = bytes;
    return out;
  });
}

// بایت ← base64 (تکه‌ای، تا برای عکس‌های چندمگابایتی پشته سرریز نکند)
function bufToB64(buf) {
  const b = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return btoa(s);
}

// نوع MIME عکس از پسوند مسیر فایل تلگرام (عکس‌های تلگرام همیشه jpg‌اند)
function guessMime(path) {
  const p = String(path || '').toLowerCase();
  if (p.endsWith('.png')) return 'image/png';
  if (p.endsWith('.webp')) return 'image/webp';
  if (p.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

// ارتقای جفت مقایسه (canonical + سازگاری داده قدیمی) → دو شیء مدل
async function upgradeCpPair(env, uid, cp) {
  const dflt = [CF_KNOWN[0].id, CF_KNOWN[1].id];
  let dirty = false;
  if (!Array.isArray(cp.pair) || cp.pair.length !== 2) { cp.pair = [...dflt]; dirty = true; }
  else {
    for (let i = 0; i < 2; i++) {
      const c = await canonModel(env, cp.pair[i]);
      if (c.changed) { cp.pair[i] = c.key; dirty = true; }
    }
    // جفت چهارعضوی نسخه‌های قبل اینجا به دو عضوی canonical میرسد
    if (!String(cp.pair[0] || '').match(/^(@cf\/|p[0-9a-z]{8}:)/)) { cp.pair = [...dflt]; dirty = true; }
  }
  if (dirty) await kvPut(env, 'cp:' + uid, cp);
  return [await resolveModel(env, cp.pair[0]), await resolveModel(env, cp.pair[1])];
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 07-telegram
   لایهٔ تلگرام: tg/sendMsg/editMsg/answerCb/تایپینگ
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ لایه تلگرام ═══════════════════ */
class TGError extends Error {}

async function tg(env, budget, method, params = null, form = null) {
  if (budget && !budget.ok()) throw new TGError('budget');
  if (budget) budget.take();
  /* 🔧 v5.4: تلگرام سقف نرخ (۴۲۹) دارد؛ قبلاً پیام‌ها هنگام ارسال دسته‌ای/تکه‌ای
     یا ویرایش زندهٔ استریم بی‌صدا شکست می‌خوردند. حالا اگر retry_after کوتاه
     باشد یک بار صبر و دوباره تلاش می‌شود (سقف انتظار زیر حد CPU ورکر). */
  try {
    return await tgOnce(env, method, params, form);
  } catch (e) {
    const wait = e && e.retryAfter ? e.retryAfter : 0;
    if (!wait || wait > CFG.TG_429_MAX_WAIT_S || (budget && !budget.ok())) throw e;
    await sleep(Math.max(300, Math.min(wait * 1000, CFG.TG_429_MAX_WAIT_S * 1000)));
    if (budget) budget.take();
    return await tgOnce(env, method, params, form);
  }
}

async function tgOnce(env, method, params, form) {
  const url = TG_BASE + '/bot' + env.TELEGRAM_BOT_TOKEN + '/' + method;
  let res;
  try {
    res = await fetchT(url, form
      ? { method: 'POST', body: form }
      : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: J(params || {}) }
    , 55000);
  } catch (e) {
    throw new TGError('network: ' + ((e && e.message) || e));
  }
  let data;
  try { data = await res.json(); } catch { throw new TGError('bad_json http=' + res.status); }
  if (!data.ok) {
    const d = data.description || ('http_' + res.status);
    if (d.includes('message is not modified')) return { ignored: true };
    const err = new TGError(d);
    if (res.status === 429 && data.parameters && data.parameters.retry_after) {
      err.retryAfter = Number(data.parameters.retry_after) || 0;
    }
    throw err;
  }
  return data.result;
}

async function sendMsg(env, budget, chatId, text, kb = null) {
  return tg(env, budget, 'sendMessage', {
    chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true,
    ...(kb ? { reply_markup: { inline_keyboard: kb } } : {}),
  });
}
async function editMsg(env, budget, chatId, msgId, text, kb = null) {
  return tg(env, budget, 'editMessageText', {
    chat_id: chatId, message_id: msgId, text, parse_mode: 'HTML', disable_web_page_preview: true,
    ...(kb ? { reply_markup: { inline_keyboard: kb } } : {}),
  });
}
async function answerCb(env, budget, cbId, text = '') {
  try {
    /* 🔧 v5.4: تلگرام به هر callback_query فقط یک پاسخ می‌دهد؛ پاسخ دوم
       خطای «query is too old» می‌گیرد. onCallback اول از همه یک پاسخ خالی
       می‌فرستد تا اسپینر دکمه بخوابد؛ اینجا پاسخ‌های تکراری همان دکمه را
       نادیده می‌گیریم تا درخواست خطادار راهی تلگرام نشود. */
    if (budget && cbId) {
      if (!budget._ans) budget._ans = new Set();
      if (budget._ans.has(cbId)) return;
      budget._ans.add(cbId);
    }
    await tg(env, budget, 'answerCallbackQuery', { callback_query_id: cbId, text, cache_time: 1 });
  } catch {}
}
async function typingOn(env, budget, chatId) {
  try { await tg(env, budget, 'sendChatAction', { chat_id: chatId, action: 'typing' }); } catch {}
}

// اطلاعات خود ربات (کش ۱ روزه)
async function botInfo(env) {
  const c = await kvGet(env, 'bi');
  if (c && Date.now() - c.t < 86400000) return c.v;
  try {
    const v = await tg(env, newBudget(1), 'getMe');
    await kvPut(env, 'bi', { t: Date.now(), v }, 90000);
    return v;
  } catch { return c ? c.v : null; }
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 08-llm
   موتور مدل‌ها: Workers AI + سرویس سازگار با OpenAI + استریم/فالبک + تاریخچه
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ موتور کلادفلر (Workers AI) ═══════════════════ */
function knownCtx(id) {
  const f = CF_KNOWN.find((m) => m.id === id);
  return f ? f.ctx : 32000;
}
function modelName(env, id) {
  if (!id) return L(env, 'm0782kha');
  const f = CF_KNOWN.find((m) => m.id === id);
  if (f) return f.name;
  // «@cf/meta/llama-3.1-8b-instruct» ← «llama-3.1-8b-instruct»
  return String(id).split('/').pop();
}

// استخراج زنده مدل‌های متنی چت از binding کلادفلر (با صفحه‌بندی کامل)
async function fetchCfChatModels(env) {
  const out = [];
  const pages = [1, 2, 3, 4]; // تا ۴ صفحه × ۱۰۰ = ۴۰۰ مدل، کافی است
  for (const page of pages) {
    let items = [];
    try {
      const ms = await env.AI.models({ page, per_page: 100 });
      items = Array.isArray(ms) ? ms : ((ms && (ms.result || ms.data)) || []);
    } catch { break; }
    if (!items.length) break;
    for (const m of items) {
      const id = String((m && (m.name || m.id)) || '');
      if (!id) continue;
      // task گاهی رشته است گاهی آبجکت {name: ...}
      const t = (m && (m.task || m.taskType)) || '';
      const task = typeof t === 'string' ? t : String((t && t.name) || '');
      const isChat = task.includes('Text Generation') || task === 'Any-to-Any' || task === 'Image-to-Text' || (!task && !out.length);
      // مدل‌های ویژن (vl/vision) دیگر «آشغال» نیستند — از v4.2 عکس می‌فهمند
      const isJunk = /embed|whisper|flux|sd-|stable-|bge|img2text|faster-|tts|melotts|m2t|uer|unmask|rerank|trans/i.test(id);
      if (isChat && !isJunk) out.push(id);
    }
    if (items.length < 100) break;
  }
  return [...new Set(out)];
}

// لیست مدل‌ها با کش ۳۰ دقیقه‌ای؛ در خرابی، لیست داخلی
async function getModels(env) {
  const cached = await kvGet(env, 'mc');
  if (cached && Date.now() - cached.t < 1800000) return cached.list;
  let list = null;
  try {
    if (!env.AI || typeof env.AI.models !== 'function') throw new Error(L(env, 'm0b4m9n9'));
    const ids = await fetchCfChatModels(env);
    if (ids.length) {
      ids.sort((a, b) => a.localeCompare(b));
      // مدل‌های مهم کاربر اول نمایش داده شوند
      const star = ids.filter((x) => /glm-4\.7-flash|gpt-oss-120b/.test(x));
      const rest = ids.filter((x) => !/glm-4\.7-flash|gpt-oss-120b/.test(x));
      list = [...star, ...rest].map((id) => ({ id, ctx: knownCtx(id), free: true }));
    }
  } catch (e) { await logErr(env, 'models_cf', e); }
  if (!list) list = CF_KNOWN.map((m) => ({ id: m.id, ctx: m.ctx, free: true }));
  await kvPut(env, 'mc', { t: Date.now(), list }, 1800);
  return list;
}

/* ═══════════════════ موتور هوش مصنوعی (استریم + ریترای + فالبک) ═══════════════════ */

// ساخت پرامپت سیستمی نهایی بر اساس تنظیمات و شخصیت
function buildSystemPrompt(env, settings) {
  const PA = pick(env, PERSONAS, PERSONAS_EN);
  const p = PA[settings.persona] || PA[0];
  let sys = pick(env, CORE_SYSTEM_PROMPT, CORE_SYSTEM_PROMPT_EN) + '\n\n' + p.sys;
  if (settings.sysCustom && settings.sysCustom.trim()) {
    sys += L(env, 'm1vcg84s', settings.sysCustom.trim().slice(0, CFG.SYS_CUSTOM_MAX));
  }
  return sys + pick(env, FORMAT_RULES, FORMAT_RULES_EN);
}

// تبدیل خطای خام Workers AI به پیام فارسی مفهوم
async function aiErrorText(env, e, model) {
  const raw = String((e && (e.message || e)) || e || '?');
  if (/binding/i.test(raw))
    return L(env, 'm05capdd');
  if (/5016|submit the prompt/i.test(raw))
    return L(env, 'm0yh8z4o');
  if (/model (not found|does not exist|is not found)|no such model|404/i.test(raw))
    return L(env, 'm0ijnyp9');
  if (/limit|429|rate|quota|exceed|neuron/i.test(raw))
    return L(env, 'm1pw5tdo');
  if (/context|maximum|too long|too many tokens/i.test(raw))
    return L(env, 'm19dgteb');
  if (/timeout|abort|timed? out/i.test(raw))
    return L(env, 'm0k7yabp');
  await logErr(env, 'ai_cf:' + model, e instanceof Error ? e : new Error(raw));
  return L(env, 'm0geupfq', esc(raw.slice(0, 150)));
}

// فراخوانی مدل با binding کلادفلر (env.AI.run)؛ onDelta(text_so_far) برای ویرایش زنده.
// خروجی: { text, usage:{prompt_tokens, completion_tokens} } یا throw {status, code, message}
async function aiChatCf(env, model, messages, opts = {}, onDelta = null) {
  if (!env.AI) throw { status: 0, code: 'binding', message: await aiErrorText(env, new Error(L(env, 'm0b4m9n9')), model) };

  const base = {
    temperature: opts.temperature ?? 0.8,
    max_tokens: opts.maxTokens ?? 2048,
    stream: !!onDelta,
    ...(opts.extra || {}),
  };
  // پیام عکس دارد؟ → قالب ویژن Workers AI (content رشته‌ای + image آرایه‌ای)
  const input = messages.some((m) => Array.isArray(m.content))
    ? { messages: cfVisionMessages(messages), ...base }
    : { messages, ...base };

  // تا ۳ تلاش برای خطاهای موقتی
  for (let attempt = 1; attempt <= CFG.RETRY_MAX; attempt++) {
    let res;
    try {
      res = await env.AI.run(model, input);
    } catch (e) {
      const raw = String((e && (e.message || e)) || e);
      // دروازهٔ مجوز لاما (خطای ۵۰۱۶): اولین استفاده باید پرامپت «agree» بگیرد —
      // ربات خودکار میپذیرد و همان درخواست را دوباره میفرستد
      if (/5016|submit the prompt/i.test(raw)) {
        try { await env.AI.run(model, { prompt: 'agree', max_tokens: 1 }); } catch {}
        try { res = await env.AI.run(model, input); }
        catch (e2) { throw { status: 0, code: 'ai', message: await aiErrorText(env, e2, model) }; }
      } else if (/503|504|529|overload|busy|temporar/i.test(raw) && attempt < 3) {
        await sleep(CFG.RETRY_BASE_MS * attempt);
        continue;
      } else {
        throw { status: 0, code: 'ai', message: await aiErrorText(env, e, model) };
      }
    }

    if (!onDelta) {
      return {
        text: (res && res.response) || '',
        usage: (res && res.usage) || {},
      };
    }

    /* ── حالت استریم: خواندن SSE با فیلد response ── */
    let acc = '';
    let lastEdit = Date.now();
    let usage = {};
    try {
      const rd = res.getReader();
      const dec = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await rd.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const js = JSON.parse(payload);
            if (js.response) {
              acc += js.response;
              if (Date.now() - lastEdit > CFG.STREAM_EDIT_MS && acc.length > CFG.STREAM_EDIT_MIN) {
                lastEdit = Date.now();
                try { await onDelta(acc); } catch {} // ویرایش زنده؛ خطایش مهم نیست
              }
            }
            if (js.usage) usage = js.usage;
          } catch {}
        }
      }
    } catch (e) {
      if (!acc) throw { status: 0, code: 'stream', message: L(env, 'm0t8bfm5') };
      // اگر بخشی آمده بود، همان کافی است
    }
    if (!acc.trim()) throw { status: 0, code: 'empty', message: L(env, 'm1trjnig') };
    return { text: acc, usage };
  }
  throw { status: 0, code: 'retries', message: L(env, 'm0bo17ie') };
}

/* ── حات‌کننده: کلید canonical را میخواند و به موتور مناسب میفرستد ── */
async function aiChat(env, model, messages, opts = {}, onDelta = null) {
  if (parseModelKey(model).prov !== 'p') return aiChatCf(env, model, messages, opts, onDelta);
  const e = await resolveModel(env, model);
  if (e.prov !== 'p') return aiChatCf(env, e.key, messages, opts, onDelta); // سرویس/مدل حذف شده ← پیش‌فرض کلادفلر
  return aiChatOpenAi(env, e, messages, opts, onDelta);
}

/* ── موتور OpenAI-compatible: POST {base}/chat/completions با Bearer ──
   اگر آدرس پایه /v1 لازم داشته باشد و کاربر نزده باشد، خودکار امتحان و
   ذخیره میشود. فقط پیام‌های فارسی از پیش نوشته‌شده throw میشوند؛ کلید
   API هرگز به چت یا لاگ نمیرود (scrubSecret روی همه مسیرها). */
async function aiChatOpenAi(env, e, messages, opts, onDelta) {
  const bases = [e.baseUrl];
  if (!/\/v1$/.test(e.baseUrl)) bases.push(e.baseUrl + '/v1');
  const pName = esc(e.provName);
  const maxTry = opts.quick ? 1 : CFG.RETRY_MAX;
  /* circuit breaker: سرویس خراب موقتاً کنار گذاشته میشود تا هر پیام
     معطل تست‌های تکراری نشود؛ خودکار بعد از CB_OPEN_MS برمیگردد. */
  if (!opts.noBreaker && cbBlocked(e.pid)) {
    throw { status: 0, code: 'breaker', message: L(env, 'm0cd8thb', pName) };
  }

  for (let bi = 0; bi < bases.length; bi++) {
    const url = bases[bi].replace(/\/+$/, '') + '/chat/completions';
    const body = {
      model: e.id, messages,
      temperature: opts.temperature ?? 0.8,
      max_tokens: opts.maxTokens ?? 2048,
      stream: !!onDelta,
      ...(opts.extra || {}),
    };
    if (onDelta) body.stream_options = { include_usage: true };
    const hdr = {
      'Content-Type': 'application/json',
      Accept: onDelta ? 'text/event-stream' : 'application/json',
      Authorization: 'Bearer ' + e.apiKey,
    };

    for (let attempt = 1; attempt <= maxTry; attempt++) {
      let res;
      try {
        res = await fetchT(url, { method: 'POST', headers: hdr, body: J(body) }, CFG.PROV_TIMEOUT_MS);
      } catch (er) {
        if (attempt < maxTry) { await sleep(CFG.RETRY_BASE_MS * attempt); continue; }
        await logErr(env, 'ai_p:' + e.pid, new Error(scrubSecret('net: ' + ((er && er.message) || er), e.apiKey)));
        cbFail(e.pid, false);
        throw { status: 0, code: 'net', message: L(env, 'm0xbyneb', pName) };
      }

      if (res.status === 401 || res.status === 403) {
        await logErr(env, 'ai_p:' + e.pid, new Error('auth http=' + res.status));
        cbFail(e.pid, true);
        throw { status: res.status, code: 'auth', message: L(env, 'm1m6a063', pName) };
      }
      if (res.status === 404) {
        if (bi < bases.length - 1) break; // پایگاه بعدی (مثلاً +/v1) را امتحان کن
        throw { status: 404, code: 'nomodel', message: L(env, 'm0hoqsmy', pName) };
      }
      if (res.status === 429) {
        if (attempt === 1) { await sleep(2500); continue; } // یک تلاش مجدد — سقف نرخ گاهی لحظه‌ای است
        throw { status: 429, code: 'rate', message: L(env, 'm1hzo9wt', pName) };
      }
      if (res.status >= 500) {
        if (attempt < maxTry) { await sleep(CFG.RETRY_BASE_MS * attempt); continue; }
        await logErr(env, 'ai_p:' + e.pid, new Error('upstream http=' + res.status));
        throw { status: res.status, code: 'upstream', message: L(env, 'm0pzr5p7', pName, res.status) };
      }
      if (!res.ok) {
        const raw = scrubSecret((await res.text().catch(() => '')) || '', e.apiKey);
        await logErr(env, 'ai_p:' + e.pid, new Error('http ' + res.status + ' body=' + raw));
        if (res.status === 400 && body.stream_options && /stream_options/i.test(raw)) {
          delete body.stream_options; // سرورهای سخت‌گیر این فیلد را رد میکنند
          attempt--;
          continue;
        }
        if (/context|maximum|too long|too many tokens/i.test(raw)) {
          throw { status: res.status, code: 'context', message: L(env, 'm0ywwp7s', pName) };
        }
        throw { status: res.status, code: 'http', message: L(env, 'm0zcl66u', pName, res.status) };
      }

      /* پاسخ موفق — برنده را اگر حدس /v1 بود ذخیره کن */
      cbOk(e.pid);
      const saveWinner = async () => {
        if (bi > 0) {
          const rec = await provGet(env, e.pid);
          if (rec) { rec.base = bases[bi]; await provPut(env, rec); }
        }
      };
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (onDelta && ct.includes('event-stream')) {
        const out = await sseCollectOm(env, res, e, onDelta);
        await saveWinner();
        return out;
      }
      // JSON (یا سروری که stream=true را نادیده گرفته)
      let js;
      try { js = JSON.parse((await res.text()).slice(0, CFG.JSON_RESP_CAP)); } catch {
        throw { status: 0, code: 'badresp', message: L(env, 'm0wzvs2h', pName, res.status) };
      }
      const choice = (js.choices || [])[0] || {};
      const txt = (choice.message && choice.message.content) || choice.text || '';
      if (!String(txt).trim()) throw { status: 0, code: 'empty', message: L(env, 'm1trjnig') };
      if (onDelta) { try { await onDelta(String(txt)); } catch {} }
      await saveWinner();
      return { text: String(txt), usage: normUsage(js.usage) };
    }
  }
  throw { status: 0, code: 'retries', message: L(env, 'm0oilrtb', pName) };
}

/* ── خوانش SSE استاندارد OpenAI (delta.content) با همان آهنگ نسخه CF ── */
async function sseCollectOm(env, res, e, onDelta) {
  let acc = '';
  let usage = {};
  let lastEdit = Date.now();
  try {
    const rd = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    while (acc.length <= CFG.STREAM_CAP) {
      const { done, value } = await rd.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let idx;
      while ((idx = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line.startsWith('data:')) continue; // کامنت‌های SSE (:) و فیلدهای دیگر رد میشوند
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') { buf = ''; break; }
        try {
          const js = JSON.parse(payload);
          const d = ((js.choices || [])[0] || {}).delta || {};
          if (typeof d.content === 'string' && d.content) {
            acc += d.content;
            if (Date.now() - lastEdit > CFG.STREAM_EDIT_MS && acc.length > CFG.STREAM_EDIT_MIN) {
              lastEdit = Date.now();
              try { await onDelta(acc); } catch {} // ویرایش زنده؛ خطایش مهم نیست
            }
          }
          if (js.usage) usage = normUsage(js.usage);
        } catch {}
      }
    }
  } catch (er) {
    await logErr(env, 'ai_p:' + (e && e.pid), new Error(scrubSecret('stream: ' + ((er && er.message) || er), e && e.apiKey)));
    if (!acc) throw { status: 0, code: 'stream', message: L(env, 'm0t8bfm5') };
    // اگر بخشی آمده بود، همان کافی است
  }
  if (!acc.trim()) throw { status: 0, code: 'empty', message: L(env, 'm1trjnig') };
  return { text: acc, usage };
}

/* ═══════════════════ مدیریت کانتکست و تاریخچه ═══════════════════ */
// کلید تاریخچه: h:<scope>   |   scope برای چت خصوصی «c<chatId>:<threadId>»

async function histGet(env, scope) {
  return await kvGet(env, 'h:' + scope, { msgs: [], used: 0 });
}
async function histPut(env, scope, h) {
  // نگه‌داشتن حداکثر ۶۰ پیام اخیر (کانتکست واقعی پایین‌تر هم بریده میشود)
  if (h.msgs.length > CFG.HIST_MAX_MSGS) h.msgs = h.msgs.slice(-CFG.HIST_MAX_MSGS);
  // سقف هر سطر D1 دو مگابایت است؛ اگر تاریخچه به آن نزدیک شد، قدیمیترها حذف میشوند
  while (h.msgs.length > 1 && J(h).length > CFG.HIST_MAX_BYTES) h.msgs.shift();
  await kvPut(env, 'h:' + scope, h);
}

// بریدن هوشمند: اگر مجموع تخمین از سقف گذشت، قدیمی‌ها حذف میشوند؛
// شروعِ نگه‌داشت همیشه روی پیام «user» است تا جفت‌های گفتگو سالم بمانند
/* 🔎 جستجوی متنی در تاریخچهٔ همهٔ گفتگوهای کاربر (/find).
   عمداً بدون مدل: رشته‌یابی ساده است چون مدل برای یافتن یک جملهٔ
   قدیمی هم کند است هم توکن می‌سوزاند.
   چه چیزهایی جستجو میشود:
     • همهٔ تردهای خصوصی کاربر (u.threads) — کلیدهای h:c<uid>:<tid>
     • همین گفتگوی جاری (scope) که گروهی باشد h:g<chatId>
   سایر گروه‌ها عمداً جستجو نمیشوند: کلید گروه بین همهٔ اعضا مشترک است
   و نباید پیام کسی را به کاربر دیگر نشان دهد. */
async function histFind(env, uid, scope, query) {
  const q = String(query || '').trim().slice(0, CFG.FIND_MAX);
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').toLowerCase();
  const nq = norm(q);
  if (nq.length < CFG.FIND_MIN) return { error: L(env, 'm0docj9h', num(CFG.FIND_MIN)) };

  const scopes = [];
  const u = await getUser(env, uid);
  for (const t of (u.threads || [])) if (t && t.id) scopes.push('c' + uid + ':' + t.id);
  if (scope && scopes.indexOf(scope) < 0) scopes.push(scope);

  const hits = [];
  for (const sc of scopes) {
    const h = await histGet(env, sc);
    if (!h || !h.msgs || !h.msgs.length) continue;
    const th = (u.threads || []).find((x) => 'c' + uid + ':' + x.id === sc);
    const thName = th ? th.name : (sc.charAt(0) === 'g' ? L(env, 'm1krzef8') : sc);
    for (let i = 0; i < h.msgs.length; i++) {
      const m = h.msgs[i];
      const txt = msgText(m.content || m.text || '');
      const at = norm(txt).indexOf(nq);
      if (at < 0) continue;
      /* برش دور محل تطبیق؛ همیشه از ابتدای رشته کم میکنیم نه از وسط */
      const pad = 40, from = Math.max(0, Math.min(at, txt.length) - pad);
      const role = m.role === 'user' ? L(env, 'm0y549rx') : L(env, 'm0rmapm3');
      hits.push({
        thread: String(thName || '').slice(0, 40),
        role,
        snip: (from > 0 ? '…' : '') + String(txt).slice(from, from + CFG.FIND_SNIP) +
          (from + CFG.FIND_SNIP < txt.length ? '…' : ''),
      });
      if (hits.length >= CFG.FIND_N) break;
    }
    if (hits.length >= CFG.FIND_N) break;
  }
  return { hits, total: hits.length, q };
}

/* 🖼 ذخیرهٔ تصویر تولیدشده در گالری — هر تصویر کلید جدا دارد تا سطر D1
   (سقف ~۲ مگابایت) سبک بماند؛ ایندکس فقط متن و معرف.
   عمداً بی‌صدا است: شکست اینجا نباید جلوی رسیدن عکس به کاربر را بگیرد. */
async function imgGallerySave(env, uid, img) {
  try {
    if (!img || !img.b64 || !img.mime) return;
    /* سقف سطر D1: اگر تصویر بزرگ باشد اصلاً ذخیره نمیکنیم تا سطر بشکند */
    if (img.b64.length > 1500000) return;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const ttl = CFG.IMG_STORE_TTL_S;
    await kvPut(env, 'ig:' + uid + ':' + id, { b64: img.b64, mime: img.mime, prompt: String(img.prompt || '').slice(0, 200) }, ttl);
    const idx = await kvGet(env, 'igs:' + uid, []);
    const list = Array.isArray(idx) ? idx : [];
    list.push({ id, prompt: String(img.prompt || '').slice(0, 120), ts: Date.now() });
    while (list.length > CFG.IMG_STORE_N) {
      const drop = list.shift();
      if (drop && drop.id) await kvDel(env, 'ig:' + uid + ':' + drop.id);
    }
    await kvPut(env, 'igs:' + uid, list, ttl);
  } catch (e) { await logErr(env, 'img_gallery', e); }
}

/* خواندن یک تصویر از گالری — اگر منقضی/حذف شده باشد null */
async function imgGalleryGet(env, uid, id) {
  if (!/^[a-z0-9]{6,20}$/.test(String(id || ''))) return null;
  return await kvGet(env, 'ig:' + uid + ':' + id, null);
}
async function imgGalleryList(env, uid) {
  const idx = await kvGet(env, 'igs:' + uid, []);
  return Array.isArray(idx) ? idx.slice(-CFG.IMG_STORE_N).reverse() : [];
}

function trimContext(sysPrompt, msgs, ctxLimit) {
  const budget = Math.floor(ctxLimit * CFG.CTX_RATIO);
  let total = est(sysPrompt);
  // از جدیدترین پیام به عقب جمع میکنیم تا سقف بودجه — هرچه جا نشد حذف می‌شود و
  // اگر همه جا شد همه می‌مانند (حالت نرمال). «from = msgs.length» یعنی حتی
  // جدیدترین پیام هم جا نشد → کانتکست خالی.
  let from = msgs.length;
  for (let i = msgs.length - 1; i >= 0; i--) {
    const tk = est(msgs[i].content);
    if (total + tk > budget) break;
    total += tk;
    from = i;
  }
  while (from < msgs.length && msgs[from].role !== 'user') from++;
  return from >= msgs.length ? [] : msgs.slice(from);
}

async function buildMessages(env, settings, scope, userContent, extraSys = null, ctxLimit = null, uidForMem = null) {
  let memBlock = '';
  try {
    if (uidForMem) {
      /* تزریق هوشمند: اگر متن کاربر به خاطره‌ای مربوط باشد فقط همان‌ها می‌آیند
         (کمتر توکن، دقت بیشتر). اگر هیچ‌کدام مرتبط نبود، برای حفظ رفتار
         قبلی همهٔ حافظه می‌آید — مگر اینکه کاربر «حافظهٔ خودکار» را خاموش
         کرده باشد. */
      const rel = await memRelevant(env, uidForMem, userContent || '');
      let mt = '';
      if (rel.length) {
        mt = rel.map((x) => '- ' + (x.tag ? '[' + x.tag + '] ' : '') + x.t).join('\n');
      } else if (!settings || settings.memAuto !== false) {
        mt = await memText(env, uidForMem);
      }
      if (mt) memBlock = L(env, 'm0014jqj', mt);
    }
  } catch {}
  const sys = (extraSys ? extraSys + '\n\n' : '') + memBlock + buildSystemPrompt(env, settings);
  const h = await histGet(env, scope);
  const msgs = [{ role: 'system', content: sys }, ...trimContext(sys, h.msgs, ctxLimit || knownCtx(settings.model))];
  if (userContent !== null) msgs.push({ role: 'user', content: userContent });
  return { msgs, h };
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 09-link-reader
   خوانندهٔ لینک 🌐 (Jina/مستقیم + یوتیوب)
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ خواننده لینک 🌐 ═══════════════════ */
const URL_RE = /https?:\/\/[^\s<>"')\]]+/gi;

function extractUrls(text) {
  return (String(text || '').match(URL_RE) || []).slice(0, CFG.URL_MAX_COUNT); // حداکثر چند لینک
}

/* 🎬 خواندن زیرنویس یوتیوب (بدون کلید و بدون ابزار جانبی).
   صفحه را می‌خوانیم، captionTracks را از playerResponse درمی‌آوریم و
   زیرنویس را (json3 > vtt > xml) می‌گیریم. اگر زیرنویس خودکار نبود null. */
function ytVideoId(u) {
  try {
    const x = new URL(u);
    if (/youtu\.be$/i.test(x.hostname)) return (x.pathname.split('/')[1] || '').slice(0, 11);
    if (/youtube\.com$/i.test(x.hostname) || /\.youtube\.com$/i.test(x.hostname)) {
      if (x.searchParams.get('v')) return String(x.searchParams.get('v')).slice(0, 11);
      const m = /^\/(?:shorts|embed|live)\/([\w-]{11})/.exec(x.pathname);
      if (m) return m[1];
    }
  } catch {}
  return null;
}

async function youtubeTranscript(url, maxChars = CFG.YT_MAX_CHARS) {
  const id = ytVideoId(url);
  if (!id) return null;
  let html = '';
  try {
    const res = await fetchT('https://www.youtube.com/watch?v=' + id + '&hl=fa',
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36', 'Accept-Language': 'fa,en;q=0.8' } },
      CFG.YT_TIMEOUT_MS);
    if (!res.ok) return null;
    html = await res.text();
  } catch { return null; }
  /* playerResponse داخل صفحه؛ JSON تودرتوی بزرگ است، پس با شمارش آکولاد
     تا انتهای همان شیء می‌رویم (regex ساده اینجا نمی‌گیرد). */
  const key = 'ytInitialPlayerResponse';
  let i = html.indexOf(key);
  if (i < 0) return null;
  let b = html.indexOf('{', i);
  if (b < 0) return null;
  let d = 0, e = -1, inStr = false, esc2 = false;
  for (let p = b; p < html.length; p++) {
    const c = html[p];
    if (inStr) {
      if (esc2) esc2 = false;
      else if (c === '\\') esc2 = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') { inStr = true; continue; }
    if (c === '{') d++;
    else if (c === '}') { d--; if (!d) { e = p + 1; break; } }
  }
  if (e < 0) return null;
  let pr = null;
  try { pr = JSON.parse(html.slice(b, e)); } catch { return null; }
  const tr = pr && pr.captions && pr.captions.playerCaptionsTracklistRenderer &&
    pr.captions.playerCaptionsTracklistRenderer.captionTracks;
  if (!Array.isArray(tr) || !tr.length) return null;
  /* اول فارسی، بعد انگلیسی، بعد هر زبان دیگری */
  const pick = tr.find((x) => /^fa/i.test(x.languageCode || '')) ||
    tr.find((x) => /^en/i.test(x.languageCode || '')) || tr[0];
  if (!pick || !pick.baseUrl) return null;
  const title = String((pr.videoDetails && pr.videoDetails.title) || '').slice(0, 160);
  let text = '';
  try {
    const r1 = await fetchT(pick.baseUrl + '&fmt=json3', {}, CFG.YT_TIMEOUT_MS);
    if (r1.ok) {
      const js = await r1.json().catch(() => null);
      const ev = js && Array.isArray(js.events) ? js.events : [];
      text = ev.map((x) => (x.segs || []).map((s) => s.utf8 || '').join('')).join(' ').replace(/\s+/g, ' ');
    }
  } catch {}
  if (!text.trim()) {
    try {
      const r2 = await fetchT(pick.baseUrl, {}, CFG.YT_TIMEOUT_MS);
      if (r2.ok) {
        const xml = await r2.text();
        text = (xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g) || [])
          .map((x) => x.replace(/<[^>]+>/g, ''))
          .join(' ')
          .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
          .replace(/\s+/g, ' ');
      }
    } catch {}
  }
  if (!text.trim()) return null;
  return { title, lang: pick.languageCode || '', text: text.trim().slice(0, maxChars) };
}

/* 🧪 فالبک خواندن صفحه با Jina Reader (بدون کلید) — برای سایت‌هایی که
   HTML خامشان با جاوااسکریپت پر می‌شود و متن قابل استفاده ندارد. */
async function readPageJina(url, maxChars) {
  const safe = safePageUrl(url); // 🔒 فقط آدرس عمومی
  if (!safe) return null;
  try {
    const res = await fetchT('https://r.jina.ai/' + safe, { headers: { 'Accept': 'text/plain' } }, 25000);
    if (!res.ok) return null;
    const t = (await res.text()).trim();
    /* کمتر از ۲۰۰ کاراکتر یعنی عملاً چیزی نبوده (صفحهٔ لاگین/خطا) */
    if (t.length < 200) return null;
    return t.slice(0, maxChars);
  } catch { return null; }
}

/* 🔒 v5.4: گارد SSRF — لینک خوانده‌شده باید http/https و روی میزبان
   عمومی باشد. localhost، آدرس‌های خصوصی (۱۰/۸، ‎172.16/12، ‎192.168/16)،
   link-local (‎169.254/16 — متادیتای ابری) و نام‌های داخلی رد می‌شوند. */
function privateHost(host) {
  const h = String(host || '').toLowerCase().replace(/^\[|\]$/g, '');
  if (!h) return true;
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return true;
  if (h === '::1' || h === '::' || h.startsWith('fe80:') || h.startsWith('fc') || h.startsWith('fd')) return true;
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (!m) return false;
  const a = +m[1], b = +m[2];
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;              // متادیتای ابری
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;    // CGNAT
  return false;
}
function safePageUrl(u) {
  try {
    const x = new URL(String(u || ''));
    if (x.protocol !== 'http:' && x.protocol !== 'https:') return null;
    if (privateHost(x.hostname)) return null;
    return x.toString();
  } catch { return null; }
}

async function readPage(url, maxChars = CFG.URL_PAGE_CHARS, settings = null) {
  let host = '';
  try { host = new URL(url).hostname; } catch { return null; }
  const safe = safePageUrl(url); // 🔒 آدرس خصوصی/غیرhttp خوانده نمی‌شود
  if (!safe) return null;
  /* یوتیوب: مسیر زیرنویس، که متن کامل و تمیز می‌دهد (اگر بود).
     🔧 v5.4: اگر کاربر «خلاصه یوتیوب» (ytSum) را خاموش کرده باشد، از مسیر
     زیرنویس رد نمی‌شویم و صفحه مثل هر سایت دیگری خوانده می‌شود. */
  if (/youtu\.?be/i.test(host) && (!settings || settings.ytSum !== false)) {
    const yt = await youtubeTranscript(url, CFG.YT_MAX_CHARS).catch(() => null);
    if (yt) {
      return { url, host, text: '🎬 ' + yt.title + ' (' + yt.lang + ')\n\n' + yt.text, truncated: false, kind: 'youtube' };
    }
  }
  const res = await fetchT(safe, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36', 'Accept-Language': 'fa,en;q=0.8' },
  }, 20000);
  if (!res.ok) throw new Error('http_' + res.status);
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  /* 🔒 v5.4: بدنه را بی‌سقف نمی‌خوانیم؛ یک فایل چند صد مگابایتی حافظهٔ
     ورکر (۱۲۸ مگابایت) را پر می‌کرد و درخواست با خطای مبهم می‌مُرد. */
  const bodyText = await readCapped(res, CFG.URL_BODY_MAX);
  if (bodyText === null) throw new Error('too_large');
  let body = bodyText;
  if (ct.includes('json')) {
    body = body.replace(/\s+/g, ' ');
  } else {
    body = body
      .replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(br|p|div|h[1-6]|li|tr)[^>]*>/gi, '\n')
      .replace(/<[^>]{1,200}>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/[ \t]+/g, ' ').replace(/\n\s*\n\s*\n+/g, '\n\n').trim();
  }
  /* صفحه‌های جاوااسکریپتی: HTML خام تقریباً خالی است (منو/اسکریپت).
     اگر متن معنادار کم بود، یک بار از Jina Reader می‌خوانیم. */
  const plain = body.replace(/\s+/g, ' ').trim();
  if (!ct.includes('json') && plain.length < 240 && settings_jina_enabled()) {
    const jp = await readPageJina(url, maxChars);
    if (jp && jp.length > plain.length) {
      return { url, host, text: jp, truncated: jp.length >= maxChars, kind: 'jina' };
    }
  }
  return { url, host, text: body.slice(0, maxChars), truncated: body.length > maxChars };
}
/* سوییچ ماژولی فالبک Jina — همیشه روشن؛ فقط برای تست‌پذیری جدا شده */
function settings_jina_enabled() { return true; }

// اگر پیام لینک داشت و تنظیم روشن بود، محتوای صفحه به پرامپت اضافه میشود
async function maybeAttachLinks(env, settings, text, statusCb) {
  if (!settings.readLinks) return null;
  const urls = extractUrls(text);
  if (!urls.length) return null;
  const parts = [];
  for (const u of urls) {
    if (statusCb) await statusCb(L(env, 'm1tofqi9', esc((() => { try { return new URL(u).hostname; } catch { return u; } })())));
    try {
      const page = await readPage(u, CFG.URL_PAGE_CHARS, settings);
      if (!page) { parts.push(L(env, 'm1u2656m', u)); continue; }
      parts.push(L(env, 'm0s75bnj', page.host, u, page.text, page.truncated ? L(env, 'm1dk9uoo') : ''));
    } catch (e) {
      parts.push(L(env, 'm04jjex3', u, String((e && e.message) || e)));
    }
  }
  return parts.length ? L(env, 'm1f6ec9b', parts.join('\n\n')) : null;
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 10-voice
   صدای گوگل: STT/TTS/فهم ویس/فهم PDF
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ v4.6: صدای گوگل (AI Studio) ═══════════════════
   Secret: GEMINI_API_KEY (aistudio.google.com/apikey).
   داک: ai.google.dev/gemini-api/docs/transcribe (مدل gemini-3.5-live-translate-preview،
   ۸۵+ زبان با تشخیص خودکار) و ai.google.dev/gemini-api/docs/speech-generation
   (مدل‌های TTS با ۳۰ وویس، فارسی fa پشتیبانی میشود). بدون کلید، خودکار به
   موتور کلادفلر برمیگردد. */
const GEM_TTS_MODELS = [
  { id: 'gemini-3.8-flash-tts', name: '3.8 Flash TTS (پیشنهادی)' },
  { id: 'gemini-3.5-live-translate-preview', name: 'Live TTS (سریع و طبیعی)' },
  { id: 'gemini-2.5-flash-preview-tts', name: 'Flash TTS (کلاسیک)' },
  { id: 'gemini-2.5-pro-preview-tts', name: 'Pro TTS (باکیفیت بالا)' },
];
const GEM_STT_MODELS = [
  { id: 'gemini-3.5-transcribe', name: 'Transcribe (پیشنهادی، تخصصی STT)' },
  { id: 'gemini-3.5-live-translate-preview', name: 'Live Translate (سریع، چندزبانه)' },
  { id: 'gemini-2.5-flash', name: 'Flash (فهم صوت عمومی)' },
];
// 🎨 مدل‌های تولید تصویر (اولی = پیش‌فرض SETTINGS_DEFAULT.imgModel)
const GEM_IMG_MODELS = [
  { id: 'gemini-3.1-flash-lite-image', name: 'Flash Lite Image (پیشنهادی، ارزان)' },
  { id: 'gemini-3.1-flash-image', name: 'Flash Image (کیفیت بالاتر)' },
];
/* مدل‌های خواندن سند (PDF) — فقط برای استخراج متن، نه چت. زنجیره‌ی فالبک دارد
   چون ممکن است مدلی روی کلید کاربر موجود یا مجاز نباشد. */
const GEM_DOC_MODELS = [
  'gemini-3.5-flash',
  'gemini-2.5-flash',
];
const GEM_VOICES = ['Zephyr','Puck','Charon','Kore','Fenrir','Leda','Orus','Aoede','Callirrhoe','Autonoe','Enceladus','Iapetus','Umbriel','Algieba','Despina','Erinome','Algenib','Rasalgethi','Laomedeia','Achernar','Alnilam','Schedar','Gacrux','Pulcherrima','Achird','Zubenelgenubi','Vindemiatrix','Sadachbia','Sadaltager','Sulafat'];
function gemKey(env) { return (env.GEMINI_API_KEY || '').trim(); }

/* ── ابزارهای اختیاریِ استقرار (رازِ FEATURES) ──
   ابزارهایی که مالکِ استقرار می‌تواند کامل خاموش کند تا خرج/سوءاستفاده کم شود.
   مثال: FEATURES="search,sum" فقط جستجو و خلاصه را روشن می‌گذارد؛
   FEATURES="none" همهٔ ابزارهای اختیاری را خاموش می‌کند؛ نبودنِ راز = همه روشن.
   کلیدهای تصویر/جستجو همچنان رازِ جدا می‌خواهند — این گیت مکملِ آن است. */
const FEATURE_KEYS = ['img', 'search', 'tts', 'stt', 'translate', 'sum', 'yt', 'crypto', 'weather'];
function featSet(env) {
  const raw = (env && env.FEATURES != null ? String(env.FEATURES) : '').trim().toLowerCase();
  if (!raw) return null;                        /* null = همه روشن */
  if (raw === 'none' || raw === 'off') return new Set();
  return new Set(raw.split(/[\s,;]+/).filter(Boolean));
}
function featOn(env, name) {
  const set = featSet(env);
  return !set || set.has(name);
}
/* آیا این ابزار برای این استقرار اصلاً هست؟ (کلید + گیت) */
function toolAvailable(env, name) {
  if (!featOn(env, name)) return false;
  if (name === 'img') return !!gemKey(env) || true;   /* تصویر با pollinations هم کار می‌کند */
  if (name === 'search') return !!(env.SEARCH_API_KEY || '').trim();
  if (name === 'tts' || name === 'stt' || name === 'translate') return !!gemKey(env);
  return true;
}
const GEM_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';

/* پرامپت فهم ویس: عمداً فارسی و با تأکید صریح روی «الفبای فارسی».
   دلیل فینگلیش‌شدن خروجی: پرامپت انگلیسی + مدلِ ترجمه (live-translate) باعث
   می‌شد متن فارسی را با حروف لاتین برگرداند. اینجا زبان خروجی قفل شده. */
const STT_SYS = 'تو فقط یک تبدیل‌کننده‌ی گفتار به متن هستی.\n' +
  '۱) زبان گفتار را تشخیص بده و عیناً با همان الفبا بنویس. اگر فارسی بود حتماً با ' +
  'حروف فارسی بنویس — هرگز فینگلیش/لاتین ننویس.\n' +
  '۲) فقط متن خالص گفتار را برگردان: بدون ترجمه، بدون توضیح، بدون نقل‌قول، ' +
  'بدون علامت‌گذاری اضافه.\n' +
  '۳) اعداد و اسامی را همان‌طور که شنیده می‌شوند بنویس.';

/* EN */
const STT_SYS_EN = 'You are only a speech-to-text transcriber.\n' +
  '1) Detect the spoken language and write it in exactly that script. If it is Persian, write it in Persian letters — never transliterate into Latin script.\n' +
  '2) Return only the plain spoken text: no translation, no explanation, no quotation marks, no extra punctuation.\n' +
  '3) Write numbers and names exactly as they are heard.';

// فهم ویس با گوگل: inline base64 (زیر ۲۰MB) روی generateContent — بدون Files API
async function geminiTranscribe(env, audioBytes, models, mime) {
  const key = gemKey(env);
  if (!key) throw new Error(L(env, 'm1mkkwk3'));
  const b64 = bufToB64(audioBytes);
  const chain = [];
  for (const m of [].concat(models || [])) if (m && chain.indexOf(m) < 0) chain.push(m);
  if (chain.indexOf(CFG.GEM_STT_FALLBACK) < 0) chain.push(CFG.GEM_STT_FALLBACK);
  const mt = (mime && /^audio\//.test(mime)) ? mime.split(';')[0].trim() : 'audio/ogg';
  let lastErr = '';
  for (const m of chain) {
    const body = {
      contents: [{ parts: [
        { inline_data: { mime_type: mt, data: b64 } },
        { text: L(env, 'm0v3kc92') },
      ] }],
      systemInstruction: { parts: [{ text: pick(env, STT_SYS, STT_SYS_EN) }] },
      generationConfig: { temperature: 0, maxOutputTokens: 2048 },
    };
    let res;
    try {
      res = await fetchT(GEM_BASE + m + ':generateContent',
        { method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' }, body: J(body) }, CFG.GEM_TIMEOUT_MS);
    } catch (e) { lastErr = String((e && e.message) || e); continue; }
    if (res.status === 429) throw new Error(L(env, 'm0z2h7di'));
    if (res.status === 400 || res.status === 404) { // مدل/فرمت قبول نکرد → بعدی
      lastErr = L(env, 'm0ibw2xu', m, res.status);
      continue;
    }
    if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(L(env, 'm0ygfxpe', res.status, t.slice(0, 140))); }
    const js = await res.json().catch(() => null);
    const cand = js && js.candidates && js.candidates[0];
    const blocked = js && js.promptFeedback && js.promptFeedback.blockReason;
    if (blocked) { lastErr = L(env, 'm1r518my', blocked); continue; }
    const parts = cand && cand.content && cand.content.parts;
    const txt = Array.isArray(parts) ? parts.map((p) => p.text || '').join(' ').trim() : '';
    if (txt) return txt;
    lastErr = L(env, 'm0iirtmi', m);
  }
  throw new Error(lastErr || L(env, 'm0xu2xv6'));
}

/* پرامپت ترجمهٔ فوری (/translate): جهت را خودِ مدل تشخیص میدهد —
   فارسی ← انگلیسی، هر زبان دیگر ← فارسی. خروجی باید فقط متن ترجمه باشد
   تا بتوان آن را مستقیم فرستاد یا روی آن ریپلای زد. */
const TRANSLATE_SYS = 'تو یک مترجم حرفه‌ای هستی.\n' +
  '۱) زبان متن کاربر را تشخیص بده.\n' +
  '۲) اگر فارسی بود به انگلیسی روان ترجمه کن؛ اگر غیرفارسی بود به فارسی روان ترجمه کن.\n' +
  '۳) فقط متن ترجمه‌شده را بده — بدون «ترجمه:»، بدون توضیح، بدون نکته، بدون علامت نقل‌قول.\n' +
  '۴) لحن، اعداد، اسامی خاص و قالب‌بندی ساده (لیست/خط جدید) را حفظ کن.';

/* EN */
const TRANSLATE_SYS_EN = 'You are a professional translator.\n' +
  '1) Detect the language of the user text.\n' +
  '2) If it is Persian, translate it into fluent English; if it is not Persian, translate it into fluent Persian.\n' +
  '3) Output only the translated text — no "Translation:", no explanation, no notes, no extra markup.\n' +
  '4) Preserve meaning, tone and proper nouns; keep line breaks and list structure.';

/* خواندن PDF: متن را خودِ گوگل استخراج میکند (inline_data با mime application/pdf).
   دلیل انتخاب این مسیر: استخراج متن خالص از PDF داخل ورکر بدون کتابخانه‌ی
   رمزگشایی FlateDecode شدنی نیست، و فونت‌های CID فارسی هم بدون جدول کدگذاری
   بی‌معنی برمی‌گردند — یعنی راه‌حل خانگی عملاً برای PDF فارسی خراب است. */
async function geminiPdfText(env, bytes) {
  const key = gemKey(env);
  if (!key) throw new Error(L(env, 'm1mkkwk3'));
  const b64 = bufToB64(bytes);
  const chain = [];
  for (const m of [].concat(GEM_DOC_MODELS)) if (m && chain.indexOf(m) < 0) chain.push(m);
  const instr = L(env, 'm1300qjh');
  let lastErr = '';
  for (const m of chain) {
    const body = {
      contents: [{ parts: [
        { inline_data: { mime_type: 'application/pdf', data: b64 } },
        { text: instr },
      ] }],
      generationConfig: { temperature: 0, maxOutputTokens: CFG.PDF_OUT_TOKENS },
    };
    let res;
    try {
      res = await fetchT(GEM_BASE + m + ':generateContent',
        { method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' }, body: J(body) }, CFG.GEM_TIMEOUT_MS);
    } catch (e) { lastErr = String((e && e.message) || e); continue; }
    if (res.status === 429) throw new Error(L(env, 'm1tvgg96'));
    if (res.status === 400 || res.status === 404) { lastErr = L(env, 'm1f8675x', m, res.status); continue; }
    if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(L(env, 'm0ygfxpe', res.status, t.slice(0, 140))); }
    const js = await res.json().catch(() => null);
    const cand = js && js.candidates && js.candidates[0];
    const blocked = js && js.promptFeedback && js.promptFeedback.blockReason;
    if (blocked) { lastErr = L(env, 'm1r518my', blocked); continue; }
    const parts = cand && cand.content && cand.content.parts;
    const txt = Array.isArray(parts) ? parts.map((p) => p.text || '').join('\n').trim() : '';
    if (txt) return txt;
    lastErr = L(env, 'm0iirtmi', m);
  }
  throw new Error(lastErr || L(env, 'm1dncruw'));
}

/* تولید صدا با گوگل — generateContent + responseModalities AUDIO.
   (نسخه‌ی قبلی روی /v1beta/interactions می‌رفت که endpoint درست نیست و
    همیشه خطا می‌داد؛ به همین دلیل «تولید صوت کار نمی‌کرد».) */
async function geminiTTS(env, text, voice, model) {
  const key = gemKey(env);
  if (!key) throw new Error(L(env, 'm1mkkwk3'));
  const clean = String(text || '').replace(/<[^>]+>/g, ' ').slice(0, 900);
  if (!clean.trim()) throw new Error(L(env, 'm1mmplej'));
  const chain = [];
  for (const m of [model, CFG.GEM_TTS_FALLBACK].concat(GEM_TTS_MODELS.map((x) => x.id))) {
    if (m && chain.indexOf(m) < 0) chain.push(m);
  }
  let lastErr = '';
  for (const m of chain) {
    const body = {
      contents: [{ parts: [{ text: L(env, 'm0kpcin1', clean) }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice || 'Kore' } } },
        temperature: 0.7,
      },
    };
    let res;
    try {
      res = await fetchT(GEM_BASE + m + ':generateContent',
        { method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' }, body: J(body) }, CFG.GEM_TIMEOUT_MS);
    } catch (e) { lastErr = String((e && e.message) || e); continue; }
    if (res.status === 429) throw new Error(L(env, 'm19k19o9'));
    if (res.status === 400 || res.status === 404) { lastErr = L(env, 'm1jr3y73', m, res.status); continue; }
    if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(L(env, 'm1il87ot', res.status, t.slice(0, 140))); }
    const js = await res.json().catch(() => null);
    const parts = js && js.candidates && js.candidates[0] && js.candidates[0].content && js.candidates[0].content.parts;
    if (Array.isArray(parts)) {
      for (const p of parts) {
        const d = (p.inlineData && p.inlineData.data) || (p.inline_data && p.inline_data.data);
        if (d) return d; // base64 PCM 16-bit mono 24kHz
      }
    }
    lastErr = L(env, 'm0nfs8zg', m);
  }
  throw new Error(lastErr || L(env, 'm0k4zmrk'));
}

/* 🎨 تولید تصویر با گوگل — generateContent + responseModalities IMAGE.
   خروجی: base64 + mimeType (معمولاً image/png). */
/* 🎨 تولید تصویر رایگان — pollinations.ai (بدون کلید و بدون حساب).
   لایهٔ فالبک آخر: وقتی GEMINI_API_KEY نیست یا سقف ۴۲۹ گوگل خورده باشد،
   اینجا تصویر ساخته میشود. سمت‌سرور رندر میکند و PNG/JPEG برمی‌گرداند.
   خروجی: { b64, mime, via } — همان ساختار geminiImage تا فراخواننده‌ها
   بدون تغییر کار کنند. */
async function pollinationsImage(env, prompt) {
  const p = String(prompt || '').trim().slice(0, CFG.IMG_PROMPT_MAX);
  if (!p) throw new Error(L(env, 'm0ag5krm'));
  /* نسبت تصویر: نسبت‌های گوگل → عرض/ارتفاع pollinations */
  const AR = { '1:1': 1, '3:4': 0.75, '4:3': 1.333, '16:9': 1.777, '9:16': 0.5625 };
  const ratio = AR[CFG.IMG_ASPECT] || 1;
  const S = CFG.IMG_FREE_SIZE;
  /* سمت بلندتر همیشه S می‌ماند تا مساحت (و هزینهٔ رندر) ثابت بماند */
  const w = Math.round(ratio >= 1 ? S * ratio : S);
  const h = Math.round(ratio >= 1 ? S : S / ratio);
  const seed = Math.floor(Math.random() * 999999);
  /* nologo تا واترمارک pollinations پاک شود — نیاز به حساب ندارد */
  const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(p) +
    '?width=' + w + '&height=' + h + '&seed=' + seed + '&nologo=true&model=flux&enhance=false';
  const res = await fetchT(url, {}, CFG.IMG_FREE_TIMEOUT_MS);
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(L(env, 'm0q8y2ht', res.status, t.slice(0, 120)));
  }
  const buf = await res.arrayBuffer();
  if (!buf || buf.byteLength < 3000) throw new Error(L(env, 'm0gjmbaj'));
  if (buf.byteLength > CFG.IMG_B64_MAX * 0.7) throw new Error(L(env, 'm12tsv4m'));
  const ct = String(res.headers.get('content-type') || 'image/jpeg').split(';')[0].trim();
  if (!/^image\//.test(ct)) throw new Error(L(env, 'm0txxoug', ct));
  return { b64: bufToB64(buf), mime: ct, via: L(env, 'm0tt8pbw') };
}

/* 🖌 ویرایش عکس با گوگل — همان generateContent تصویر، ولی با قطعهٔ تصویر
   ورودی (inline_data) به‌علاوهٔ دستور ویرایش. مدل‌های تصویر Gemini این را
   پشتیبانی می‌کنند؛ برای هر مدل زنجیره، ورودی عکس دوباره فرستاده میشود.
   images: [{ b64, mime }] — خروجی: { b64, mime, via } */
async function geminiImageEdit(env, prompt, images, model) {
  const p = String(prompt || '').trim().slice(0, CFG.IMG_EDIT_PROMPT_MAX);
  if (!p) throw new Error(L(env, 'm0n09w9i'));
  const key = gemKey(env);
  if (!key) throw new Error(L(env, 'm1uy9uyh'));
  const list = (Array.isArray(images) ? images : []).filter((x) => x && x.b64).slice(0, CFG.IMG_EDIT_MAX_N);
  if (!list.length) throw new Error(L(env, 'm09kujhd'));
  const chain = [];
  for (const m of [model, CFG.IMG_MODEL_DEFAULT].concat(GEM_IMG_MODELS.map((x) => x.id))) {
    if (m && chain.indexOf(m) < 0) chain.push(m);
  }
  let lastErr = '';
  for (const m of chain) {
    /* قطعه‌ها: اول همهٔ عکس‌ها، بعد دستور متنی (ترتیب مطابق مستند گوگل) */
    const parts = list.map((im) => ({ inline_data: { mime_type: im.mime || 'image/png', data: im.b64 } }));
    parts.push({ text: p });
    const body = {
      contents: [{ role: 'user', parts }],
      generationConfig: { responseModalities: ['IMAGE'], temperature: 0.6 },
    };
    let res;
    try {
      res = await fetchT(GEM_BASE + m + ':generateContent',
        { method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' }, body: J(body) }, CFG.GEM_TIMEOUT_MS);
    } catch (e) { lastErr = String((e && e.message) || e); continue; }
    if (res.status === 429) {
      /* یک کلید برای همهٔ مدل‌ها → زدن بقیه فقط وقت تلف میکند */
      throw new Error(L(env, 'm1jguqm2'));
    }
    if (res.status === 400 || res.status === 404) {
      lastErr = L(env, 'm1hqu7fu', m, res.status);
      continue;
    }
    if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(L(env, 'm0ygfxpe', res.status, t.slice(0, 160))); }
    const js = await res.json().catch(() => null);
    const blocked = js && js.promptFeedback && js.promptFeedback.blockReason;
    if (blocked) throw new Error(L(env, 'm1oja2mt', blocked));
    const rparts = js && js.candidates && js.candidates[0] && js.candidates[0].content && js.candidates[0].content.parts;
    if (Array.isArray(rparts)) {
      for (const pt of rparts) {
        const d = (pt.inlineData && pt.inlineData.data) || (pt.inline_data && pt.inline_data.data);
        if (!d) continue;
        if (d.length > CFG.IMG_B64_MAX) throw new Error(L(env, 'm07sawkt'));
        const mt = (pt.inlineData && pt.inlineData.mimeType) || (pt.inline_data && pt.inline_data.mime_type) || 'image/png';
        return { b64: d, mime: mt, via: m };
      }
    }
    lastErr = L(env, 'm0etycr3', m);
  }
  throw new Error(lastErr || L(env, 'm1f5guho'));
}

/* 🎨 تولید تصویر با گوگل — generateContent + responseModalities IMAGE.
   اگر کلید نباشد یا همهٔ مدل‌ها شکست بخورند و فالبک رایگان روشن باشد،
   خودکار به pollinations می‌رود. خروجی: { b64, mime, via }. */
async function geminiImage(env, prompt, model, opts = {}) {
  const p = String(prompt || '').trim().slice(0, CFG.IMG_PROMPT_MAX);
  if (!p) throw new Error(L(env, 'm0ag5krm'));
  /* کلید کاربر یا کلید پیش‌فرض؛ imgFree از تنظیمات کاربر هم پشتیبانی میشود */
  const freeOk = opts.free !== undefined ? !!opts.free : true;
  const key = gemKey(env);
  if (!key) {
    if (freeOk) return await pollinationsImage(env, p);
    throw new Error(L(env, 'm0e6n638'));
  }
  const chain = [];
  for (const m of [model, CFG.IMG_MODEL_DEFAULT].concat(GEM_IMG_MODELS.map((x) => x.id))) {
    if (m && chain.indexOf(m) < 0) chain.push(m);
  }
  let lastErr = '';
  for (const m of chain) {
    const body = {
      contents: [{ parts: [{ text: p }] }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: CFG.IMG_ASPECT },
        temperature: 0.8,
      },
    };
    let res;
    try {
      res = await fetchT(GEM_BASE + m + ':generateContent',
        { method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' }, body: J(body) }, CFG.GEM_TIMEOUT_MS);
    } catch (e) { lastErr = String((e && e.message) || e); continue; }
    /* ۴۲۹ = سقف روزانهٔ کلید → نباید بقیهٔ مدل‌ها را هم زد (همه روی همان
       کلیدند)؛ ولی نباید throw هم کرد تا از فالبک رایگان رد شود. */
    if (res.status === 429) { lastErr = L(env, 'm18fhtg6'); break; }
    if (res.status === 400 && body.generationConfig.imageConfig) {
      // imageConfig توسط این مدل پشتیبانی نمیشود → همان مدل را بدون آن دوباره بزن
      delete body.generationConfig.imageConfig;
      try {
        res = await fetchT(GEM_BASE + m + ':generateContent',
          { method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' }, body: J(body) }, CFG.GEM_TIMEOUT_MS);
      } catch (e2) { lastErr = String((e2 && e2.message) || e2); continue; }
      if (res.status === 429) { lastErr = L(env, 'm18fhtg6'); break; }
    }
    if (res.status === 400 || res.status === 404) {
      lastErr = L(env, 'm0ibw2xu', m, res.status);
      continue;
    }
    if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error(L(env, 'm0ygfxpe', res.status, t.slice(0, 160))); }
    const js = await res.json().catch(() => null);
    const blocked = js && js.promptFeedback && js.promptFeedback.blockReason;
    if (blocked) throw new Error(L(env, 'm059mjt5', blocked));
    const parts = js && js.candidates && js.candidates[0] && js.candidates[0].content && js.candidates[0].content.parts;
    if (Array.isArray(parts)) {
      for (const pt of parts) {
        const d = (pt.inlineData && pt.inlineData.data) || (pt.inline_data && pt.inline_data.data);
        if (!d) continue;
        if (d.length > CFG.IMG_B64_MAX) throw new Error(L(env, 'm07sawkt'));
        const mt = (pt.inlineData && pt.inlineData.mimeType) || (pt.inline_data && pt.inline_data.mime_type) || 'image/png';
        return { b64: d, mime: mt, via: m };
      }
    }
    lastErr = L(env, 'm0etycr3', m);
  }
  /* همهٔ مدل‌های گوگل شکست خوردند → فالبک رایگان (اگر روشن باشد).
     فیلد via در کپشن دروغ نمی‌گوید: اگر رایگان باشد اسم Gemini نمی‌آید. */
  if (freeOk) {
    try { return await pollinationsImage(env, p); }
    catch (e2) {
      throw new Error(L(env, 'm1407yf8', lastErr, String((e2 && e2.message) || e2).slice(0, 140)));
    }
  }
  throw new Error(lastErr || L(env, 'm07h72dx'));
}
function pcmToWavBytes(pcmB64, rate) {
  const bin = atob(String(pcmB64 || ''));
  const n = bin.length;
  const buf = new Uint8Array(44 + n);
  const v = new DataView(buf.buffer);
  const ws = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
  ws(0, 'RIFF'); v.setUint32(4, 36 + n, true); ws(8, 'WAVE'); ws(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate || 24000, true); v.setUint32(28, (rate || 24000) * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, n, true);
  for (let i = 0; i < n; i++) buf[44 + i] = bin.charCodeAt(i) & 255;
  return buf;
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 11-tools
   ابزارها: سرچ Tavily، آب‌وهوا، کریپتو، ماشین‌حساب، خلاصه‌ساز
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ v4.5: حافظه بلندمدت، سرچ Tavily، ابزارها، ویس ═══════════════════
   Secret جدید: SEARCH_API_KEY (کلید Tavily، از نوع Secret).
   داک مرجع: Tavily POST https://api.tavily.com/search با هدر Authorization: Bearer <key>،
   Whisper ورودی {audio:[bytes]}، MeloTTS ورودی {prompt, lang}،
   Open-Meteo GET بدون کلید https://api.open-meteo.com/v1/forecast. */

// ── حافظه بلندمدت mem:<uid> = [{id, t, ts}] ──
async function memGet(env, uid) {
  return await kvGet(env, 'mem:' + uid, []);
}
async function memPut(env, uid, arr) {
  if (arr.length > CFG.MEM_MAX) arr = arr.slice(-CFG.MEM_MAX);
  await kvPut(env, 'mem:' + uid, arr);
}
async function memAdd(env, uid, text, tag) {
  const t = String(text || '').trim().slice(0, 300);
  if (!t) return false;
  const tg = String(tag || '').trim().replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, CFG.MEM_TAG_MAX);
  const arr = await memGet(env, uid);
  if (arr.some((x) => x.t === t || (t.length > 12 && String(x.t || '').includes(t)) || (String(x.t || '').length > 12 && t.includes(String(x.t))))) return false;
  const item = { id: hash32(t + Date.now()), t, ts: Date.now() };
  if (tg) item.tag = tg;
  arr.push(item);
  await memPut(env, uid, arr);
  return true;
}
async function memDel(env, uid, id) {
  const arr = (await memGet(env, uid)).filter((x) => x.id !== id);
  await memPut(env, uid, arr);
}
/* ویرایش متن/برچسب یک خاطره با شناسه — برای منوی مدیریت */
async function memEdit(env, uid, id, text, tag) {
  const arr = await memGet(env, uid);
  const it = arr.find((x) => x.id === id);
  if (!it) return false;
  const t = String(text || '').trim().slice(0, 300);
  if (!t) return false;
  it.t = t;
  const tg = String(tag || '').trim().replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, CFG.MEM_TAG_MAX);
  if (tg) it.tag = tg; else delete it.tag;
  it.ts = Date.now();
  await memPut(env, uid, arr);
  return true;
}
async function memText(env, uid) {
  const arr = await memGet(env, uid);
  if (!arr.length) return '';
  return arr.map((x) => '- ' + (x.tag ? '[' + x.tag + '] ' : '') + x.t).join('\n');
}

/* 🔎 جستجوی حافظه — رتبه‌بندی سادهٔ کلمه‌ای (بدون embedding).
   چرا این و نه حافظهٔ برداری: با سقف ۵۰ خاطره، تطبیق کلمه‌ای + وزن تازگی
   دقیق‌تر و بی‌هزینه‌تر از یک پایگاه برداری است و هیچ کلید/سرویس اضافه نمیخواهد. */
function memScore(item, words, now) {
  const t = String((item && item.t) || '').toLowerCase();
  const tg = String((item && item.tag) || '').toLowerCase();
  let s = 0;
  for (const w of words) {
    if (!w) continue;
    if (tg.indexOf(w) >= 0) s += 3;
    if (t.indexOf(w) >= 0) s += 2;
  }
  /* تازگی: ۳۰ روز = بدون امتیاز، تازه‌تر کمی بیشتر */
  const age = now - (item && item.ts ? item.ts : 0);
  if (age < 30 * 86400000) s += 1 - age / (30 * 86400000);
  return s;
}

/* کلمات قابل جستجو از متن فارسی/انگلیسی — علائم حذف، کوتاه‌ها رد */
function memWords(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .slice(0, 40);
}

/* خاطره‌های مرتبط با متن کاربر — برای تزریق هوشمند به پرامپت.
   اگر هیچ‌کدام مرتبط نبود، خروجی خالی است تا توکن بی‌دلیل سوزانده نشود. */
async function memRelevant(env, uid, query) {
  try {
    const arr = await memGet(env, uid);
    if (!arr.length) return [];
    const words = memWords(query);
    if (!words.length) return [];
    const now = Date.now();
    const scored = arr
      .map((x) => ({ x, s: memScore(x, words, now) }))
      .filter((o) => o.s > 1)
      .sort((a, b) => b.s - a.s)
      .slice(0, CFG.MEM_INJECT_N)
      .map((o) => o.x);
    return scored;
  } catch { return []; }
}

/* جستجوی دستی حافظه (/memfind) — همان رتبه‌بندی، نمایش با شماره */
async function memSearch(env, uid, query) {
  const arr = await memGet(env, uid);
  const words = memWords(query);
  if (!words.length) return [];
  const now = Date.now();
  return arr
    .map((x) => ({ x, s: memScore(x, words, now) }))
    .filter((o) => o.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, CFG.MEM_SEARCH_N)
    .map((o) => o.x);
}
// استخراج خودکار: هر MEM_EXTRACT_EVERY پیام کاربر، با مدل ارزان CF
async function maybeExtractMemory(env, uid, scope, settings) {
  try {
    if (settings && settings.memAuto === false) return;
    const h = await histGet(env, scope);
    const userCount = h.msgs.filter((m) => m.role === 'user').length;
    if (!userCount || userCount % CFG.MEM_EXTRACT_EVERY !== 0) return;
    const recent = h.msgs.slice(-10).map((m) => (m.role === 'user' ? L(env, 'm1g0tw8h') : L(env, 'm1phc68b')) + String(m.content || '').slice(0, 600)).join('\n');
    if (!recent.trim()) return;
    const prompt = [
      { role: 'system', content: L(env, 'm14uzdrv') },
      { role: 'user', content: recent },
    ];
    let out = '';
    try {
      const r = await aiChatCf(env, CF_FALLBACK_MODEL, prompt, { temperature: 0.2, maxTokens: 400 });
      out = String((r && r.text) || '');
    } catch { return; }
    if (!out.trim() || /^\s*NONE\s*$/i.test(out.trim())) return;
    for (const line of out.split('\n').map((x) => x.replace(/^[-•\d.)\s]+/, '').trim()).filter(Boolean).slice(0, 10)) {
      if (/^none$/i.test(line)) continue;
      await memAdd(env, uid, line);
    }
  } catch (e) { await logErr(env, 'mem_extract', e); }
}

/* ═══════════════════ v5.4: خلاصه‌ساز هوشمند 📝 ═══════════════════
   /sum روی ریپلای، روی متن ارسالی، یا روی خروجی خواندن لینک/PDF.
   متن کوتاه = یک فراخوانی؛ متن بلند = map-reduce (تکه‌تکه خلاصه، بعد جمع‌بندی)
   تا از سقف کانتکست مدل رد نشود. */

const SUM_SYS =
  'تو یک خلاصه‌ساز حرفه‌ای فارسی هستی. متن را دقیق بخوان و فقط نکات مهم را ' +
  'با ساختار روشن بده: یک خلاصهٔ سه‌خطی، بعد فهرست نکته‌های کلیدی (حداکثر ۸ مورد)، ' +
  'بعد اگر بود «عددها و تاریخ‌ها» و «کارهای قابل‌اقدام». از حاشیه‌روی پرهیز کن؛ ' +
  'اگر متن بی‌ربط یا خالی بود همان را صادقانه بگو.';

/* EN */
const SUM_SYS_EN = 'You are a professional summarizer. Read the text carefully and give only the important points ' +
  'in a clear structure: a three-line summary, then a list of key points (at most 8), ' +
  'then, if present, "Numbers and dates" and "Action items". Avoid rambling; ' +
  'if the text is irrelevant or empty, say so honestly.';

/* تکه‌کردن متن روی مرزهای طبیعی (پاراگراف، بعد جمله) تا معنا نشکند */
function sumChunks(text, size) {
  const s = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!s) return [];
  const out = [];
  let rest = s;
  while (rest && out.length < CFG.SUM_MAX_PARTS) {
    if (rest.length <= size) { out.push(rest); break; }
    let cut = rest.lastIndexOf('\n\n', size);
    if (cut < size * 0.5) cut = rest.lastIndexOf('\n', size);
    if (cut < size * 0.5) cut = rest.lastIndexOf('. ', size);
    if (cut < size * 0.5) cut = rest.lastIndexOf(' ', size);
    if (cut < size * 0.5) cut = size;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  return out.filter(Boolean);
}

/* خلاصهٔ یک متن؛ modelKey = مدل فعال کاربر. خروجی: { text, reduced, parts } */
async function summarizeText(env, modelKey, settings, text, opts = {}) {
  const src = String(text || '').trim();
  if (src.length < 40) return { text: src, reduced: false, parts: 0 };
  const chunks = sumChunks(src, CFG.SUM_CHUNK);
  /* 🔧 v5.4: sumChunks حداکثر SUM_MAX_PARTS تکه می‌دهد؛ متن بلندتر بی‌صدا
     بریده می‌شد و کاربر فکر می‌کرد همهٔ متن خلاصه شده. حالا گزارش می‌شود. */
  const covered = chunks.reduce((a, c) => a + c.length, 0);
  const cut = chunks.length >= CFG.SUM_MAX_PARTS && src.length - covered > CFG.SUM_CHUNK;
  const st = settings || SETTINGS_DEFAULT;
  /* کوتاه: یک فراخوانی معمولی */
  if (chunks.length <= 1) {
    const r = await aiChat(env, modelKey, [
      { role: 'system', content: buildSystemPrompt(env, st) + '\n\n' + pick(env, SUM_SYS, SUM_SYS_EN) },
      { role: 'user', content: L(env, 'm1khkbmk', opts.title ? ' («' + String(opts.title).slice(0, 80) + '»)' : '', src) },
    ], { temperature: 0.3, maxTokens: CFG.SUM_TOKENS, ...cbOff(st) });
    return { text: String(r.text || '').trim(), reduced: false, parts: 1, cut };
  }
  /* بلند: هر تکه خلاصه می‌شود (موازی، سقف ۸ تکه) بعد جمع‌بندی */
  const partials = await Promise.all(chunks.map((c, i) =>
    aiChatCf(env, CF_FALLBACK_MODEL, [
      { role: 'system', content: L(env, 'm1rqktif', pick(env, SUM_SYS, SUM_SYS_EN), num(i + 1), num(chunks.length)) },
      { role: 'user', content: c },
    ], { temperature: 0.2, maxTokens: 400 })
      .then((r) => String(r && r.text || '').trim())
      .catch(() => '')
  ));
  const joined = partials.filter(Boolean).map((x, i) => L(env, 'm12f27gh', num(i + 1), x)).join('\n\n');
  if (!joined) throw new Error(L(env, 'm0jtj6so'));
  const r2 = await aiChat(env, modelKey, [
    { role: 'system', content: L(env, 'm1i8f55l', buildSystemPrompt(env, st), pick(env, SUM_SYS, SUM_SYS_EN)) },
    { role: 'user', content: (opts.title ? L(env, 'm012u9x3', String(opts.title).slice(0, 120)) : '') + joined },
  ], { temperature: 0.3, maxTokens: CFG.SUM_TOKENS, ...cbOff(st) });
  return { text: String(r2.text || '').trim(), reduced: true, parts: chunks.length, cut };
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 12-reminders
   تودولیست ✅ + تسک‌های زمان‌بندی‌شده با AI ⏳
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ v5.4: تودولیست ✅ ═══════════════════
   ساده و بدون مدل: todo:<uid> = [{id,t,done,ts}]. در گروه هم قابل استفاده
   نیست (کلید کاربری) — مثل حافظه. */
async function todoGet(env, uid) {
  const v = await kvGet(env, 'todo:' + uid, []);
  return Array.isArray(v) ? v : [];
}
async function todoPut(env, uid, arr) {
  await kvPut(env, 'todo:' + uid, arr.slice(-CFG.TODO_MAX));
}
async function todoAdd(env, uid, text) {
  const t = String(text || '').trim().slice(0, CFG.TODO_TEXT_MAX);
  if (!t) return null;
  const arr = await todoGet(env, uid);
  const it = { id: 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4), t, done: false, ts: Date.now() };
  arr.push(it);
  await todoPut(env, uid, arr);
  return it;
}

/* ═══════════════════ v5.4: تسک‌های زمان‌بندی‌شده با AI ⏳ ═══════════════════
   «هر روز ۸ صبح اخبار AI را خلاصه کن» → cron همان پرامپت را اجرا و
   نتیجه را می‌فرستد. کلید: task:<uid>:<id> = {id, prompt, chat, repeat, at,
   step, day, hour, min, ts}. repeat: daily|weekly|interval|monthly|once */
async function taskList(env, uid) {
  const keys = await kvList(env, 'task:' + uid + ':');
  const out = [];
  for (const k of keys) {
    const v = await kvGet(env, k, null);
    if (v && v.prompt) out.push(v);
  }
  out.sort((a, b) => (a.at || 0) - (b.at || 0));
  return out;
}
async function taskSave(env, t) {
  const ttl = Math.max(3600, Math.ceil(((t.at || Date.now()) - Date.now()) / 1000) + 3 * 86400);
  await kvPut(env, 'task:' + t.uid + ':' + t.id, t, ttl);
}
async function taskDel(env, uid, id) {
  const keys = await kvList(env, 'task:' + uid + ':');
  for (const k of keys) {
    const v = await kvGet(env, k, null);
    if (v && v.id === id) { await kvDel(env, k); return true; }
  }
  return false;
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 13-circuit-breaker
   قطع‌کنندهٔ خودکار سرویس‌های خراب 🔌
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ v5.4: circuit breaker سرویس‌ها 🔌 ═══════════════════
   سرویس کاستومی که چند بار خطای شبکه/احراز داد موقتاً کنار گذاشته میشود
   تا هر پیام معطل تست‌های تکراری نشود؛ بعد از CB_OPEN_MS خودکار برمیگردد.
   وضعیت در حافظهٔ instance است (مثل _pv) — ری‌ستارت ورکر همه را پاک میکند. */
const _cb = new Map(); // pid → { n, until, last }

function cbBlocked(pid) {
  const s = _cb.get(pid);
  return !!(s && s.until && s.until > Date.now());
}
function cbFail(pid, hard) {
  const s = _cb.get(pid) || { n: 0, until: 0, last: 0 };
  /* خطای احراز هویت = قطعی؛ یک بار هم کافی است سرویس کنار برود.
     خطای شبکه = نرم؛ بعد از CB_ERR_N بار پیوسته. */
  s.n = (hard ? Math.max(CFG.CB_ERR_N, 1) : s.n + 1);
  s.last = Date.now();
  if (s.n >= CFG.CB_ERR_N) s.until = Date.now() + CFG.CB_OPEN_MS;
  _cb.set(pid, s);
}
function cbOk(pid) {
  const s = _cb.get(pid);
  if (s) { s.n = 0; s.until = 0; }
}
/* 🔧 v5.4: تنظیم «cbBreaker» کاربر حالا واقعاً اثر دارد؛ با خاموش‌بودنش
   هیچ سرویسی به‌خاطر خطای قبلی کنار گذاشته نمی‌شود. */
function cbOff(st) { return st && st.cbBreaker === false ? { noBreaker: true } : {}; }

// ── سرچ Tavily ──
async function tavilySearch(env, query, maxResults) {
  const key = (env.SEARCH_API_KEY || '').trim();
  if (!key) throw new Error(L(env, 'm1mxuwf4'));
  const body = {
    query: String(query).slice(0, 400),
    search_depth: 'advanced',
    max_results: Math.min(10, Math.max(1, maxResults || CFG.SEARCH_MAX_RESULTS)),
    include_answer: true,
    include_raw_content: false,
  };
  const res = await fetchT('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    body: J(body),
  }, CFG.SEARCH_TIMEOUT_MS);
  if (res.status === 401 || res.status === 403) throw new Error(L(env, 'm0yfcpfv'));
  if (!res.ok) throw new Error(L(env, 'm07t3pjs', res.status));
  const js = JSON.parse((await res.text()).slice(0, 200000));
  const results = Array.isArray(js.results) ? js.results : [];
  const lines = results.slice(0, body.max_results).map((r, i) => (i + 1) + '. ' + (r.title || r.url) + '\n' + (r.url || '') + '\n' + String(r.content || '').slice(0, 700));
  let out = '';
  if (js.answer) out += L(env, 'm1x9w9nk', String(js.answer).slice(0, 1200));
  out += lines.join('\n\n');
  return out.trim() || L(env, 'm1hy4g2y');
}
function shouldAutoSearch(text) {
  return /\/web\b|سرچ|جستجو|قیمت|نرخ|دلار|طلا|ارز|بیت|کریپتو|آب.?وهوا|هوای|هواشناسی|دما|اخبار|خبر|به.?روز|امروز|جدیدترین|آخرین|who is|latest|price|weather|news|today/i.test(String(text || ''));
}

// ── ابزارها (بدون کلید اضافه) ──
async function toolWeather(env) {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + CFG.WEATHER_LAT + '&longitude=' + CFG.WEATHER_LON + '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTehran&forecast_days=2';
  const res = await fetchT(url, {}, 15000);
  if (!res.ok) throw new Error(L(env, 'm0snzrp4'));
  const js = await res.json();
  const c = js.current || {};
  const d = js.daily || {};
  return L(env, 'm0i28j95', c.temperature_2m ?? '?', c.relative_humidity_2m ?? '?', c.wind_speed_10m ?? '?', (d.temperature_2m_max || [])[0] ?? '?', (d.temperature_2m_min || [])[0] ?? '?', (d.precipitation_probability_max || [])[0] ?? '?');
}
async function toolCrypto(env) {
  const res = await fetchT('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd', {}, 15000);
  if (!res.ok) throw new Error(L(env, 'm1s5pm7h'));
  const js = await res.json();
  return L(env, 'm09v7775', num((js.bitcoin || {}).usd || 0), num((js.ethereum || {}).usd || 0));
}
function toolCalc(env, expr) {
  const e = String(expr || '').replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[^0-9+\-*/().\s%^]/g, '');
  if (!e.trim()) throw new Error(L(env, 'm1rcl01p'));
  if (/\/\s*0(?!\d)/.test(e)) throw new Error(L(env, 'm04ay7hd'));
  const v = Function('"use strict";return(' + e + ')')();
  if (typeof v !== 'number' || !isFinite(v)) throw new Error(L(env, 'm1udosa7'));
  return String(Math.round(v * 1e8) / 1e8);
}
// اجرای پیش‌ابزارها قبل از فراخوانی مدل (سازگار با همه مدل‌ها، بدون function-calling نیتیو)
async function runPreTools(env, settings, text, statusCb) {
  const parts = [];
  const t = String(text || '');
  // ماشین‌حساب: پیام‌های کوتاه ریاضی
  if (/^[\d۰-۹\s+\-*/().%^×÷]+$/.test(t.trim()) && /[\d]/.test(t) && /[+\-*/×÷%^]/.test(t) && t.trim().length < 60) {
    try { parts.push(L(env, 'm0qhk4og', t.trim(), toolCalc(env, t.replace(/×/g, '*').replace(/÷/g, '/')))); } catch (e) { parts.push(L(env, 'm0bfh0iq', e.message)); }
  }
  if (/آب.?وهوا|هواشناسی|دمای نیشابور|هوای نیشابور/i.test(t)) {
    try {
      if (statusCb) await statusCb(L(env, 'm1hohx9w'));
      parts.push('🌤 ' + await toolWeather(env));
    } catch (e) { parts.push('🌤 ' + e.message); }
  }
  if (/قیمت.*(بیت|اتریوم|کریپتو|btc|eth)|^(قیمت کریپتو)/i.test(t)) {
    try {
      if (statusCb) await statusCb(L(env, 'm1a53mxk'));
      parts.push('💰 ' + await toolCrypto(env));
    } catch (e) { parts.push('💰 ' + e.message); }
  }
  const wantSearch = settings.searchAuto && shouldAutoSearch(t);
  if (wantSearch && (env.SEARCH_API_KEY || '').trim()) {
    try {
      if (statusCb) await statusCb(L(env, 'm13mn28d'));
      const ans = await tavilySearch(env, t, CFG.SEARCH_MAX_RESULTS);
      parts.push(L(env, 'm05dz4kl', t.slice(0, 120), ans));
    } catch (e) { parts.push(L(env, 'm1in1ufb', String((e && e.message) || e).slice(0, 160))); }
  }
  if (!parts.length) return null;
  return L(env, 'm0j0hd75', parts.join('\n\n'));
}

// ── ویس: دانلود + Whisper + TTS ──
async function downloadTelegramFileBytes(env, budget, fileId, maxBytes) {
  const f = await tg(env, budget, 'getFile', { file_id: fileId });
  if (!f || !f.file_path) return null;
  const res = await fetchT(TG_BASE + '/file/bot' + env.TELEGRAM_BOT_TOKEN + '/' + f.file_path, {}, 30000);
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();
  if (!buf || !buf.byteLength || buf.byteLength > (maxBytes || CFG.VOICE_MAX_BYTES)) return null;
  return buf;
}
async function transcribeVoice(env, audioBytes, settings, mime) {
  // گوگل اول (اگر انتخاب شده و کلید هست)، وگرنه Whisper کلادفلر
  const sttChain = [];
  if (settings && settings.sttModel) sttChain.push(settings.sttModel);
  for (const m of GEM_STT_MODELS) if (sttChain.indexOf(m.id) < 0) sttChain.push(m.id);
  if (settings && settings.voiceProv !== 'cf' && gemKey(env)) {
    try { return await geminiTranscribe(env, audioBytes, sttChain, mime); }
    catch (e) {
      await logErr(env, 'stt_gem', e);
      if (/GEMINI_API_KEY|429/.test(String((e && e.message) || e))) throw e; // کلید/سقف: فالبک پنهان نکن
    }
  }
  if (!env.AI || typeof env.AI.run !== 'function') throw new Error(L(env, 'm0dgo48x'));
  const arr = Array.from(new Uint8Array(audioBytes));
  // زبان را صریح فارسی بگو تا Whisper ویس کوتاه فارسی را انگلیسی (فینگلیش) نخواند
  let r = null;
  try { r = await env.AI.run(CFG.WHISPER_MODEL, { audio: arr, language: 'fa' }); }
  catch (e) { r = await env.AI.run(CFG.WHISPER_MODEL, { audio: arr }); }
  const txt = String((r && (r.text || r.transcription)) || '').trim();
  if (!txt) throw new Error(L(env, 'm0jtid39'));
  return txt;
}
async function sendVoiceReply(env, budget, chatId, text, settings) {
  try {
    if (settings && settings.voiceProv !== 'cf' && gemKey(env)) {
      try {
        const pcm = await geminiTTS(env, text, settings.voiceName || 'Kore', settings.ttsModel);
        const wav = pcmToWavBytes(pcm, 24000);
        const fd = new FormData();
        fd.append('chat_id', String(chatId));
        fd.append('audio', new Blob([wav], { type: 'audio/wav' }), 'reply.wav');
        fd.append('title', 'Behrad AI');
        try {
          await tg(env, budget, 'sendAudio', null, fd);
        } catch (e1) {
          /* بعضی کلاینت‌های تلگرام WAV را در sendAudio پخش نمیکنند → سند بده تا
             صدا اصلاً گم نشود (کاربر می‌تواند دانلود/پخش کند). */
          await logErr(env, 'tts_send', e1);
          const fd2 = new FormData();
          fd2.append('chat_id', String(chatId));
          fd2.append('document', new Blob([wav], { type: 'audio/wav' }), 'behrad-voice.wav');
          fd2.append('caption', L(env, 'm1c1943k'));
          await tg(env, budget, 'sendDocument', null, fd2);
        }
        return true;
      } catch (e) {
        await logErr(env, 'tts_gem', e);
        if (/GEMINI_API_KEY|429/.test(String((e && e.message) || e))) return false;
      }
    }
    // فالبک آخر: MeloTTS کلادفلر — فارسی ندارد، پس فقط برای متن انگلیسی به‌درد می‌خورد
    if (!env.AI || typeof env.AI.run !== 'function') return false;
    const clean = String(text || '').replace(/<[^>]+>/g, ' ').slice(0, 900);
    if (!clean.trim()) return false;
    if (/[؀-ۿ]/.test(clean)) return false; // متن فارسی → صدای بی‌کیفیت نده
    const out = await env.AI.run(CFG.TTS_MODEL, { prompt: clean, lang: 'en' });
    let bytes = null;
    if (out instanceof ArrayBuffer) bytes = out;
    else if (out && out.byteLength) bytes = out;
    else if (typeof out === 'string' && out.length > 100) {
      const bin = atob(out);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      bytes = u8.buffer;
    } else return false;
    const fd = new FormData();
    fd.append('chat_id', String(chatId));
    fd.append('voice', new Blob([bytes], { type: 'audio/mpeg' }), 'reply.mp3');
    await tg(env, budget, 'sendVoice', null, fd);
    return true;
  } catch (e) { await logErr(env, 'tts', e); return false; }
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 14-users
   دسترسی (allow-list) + سهمیه/نقش کاربران + آمار مصرف 👥
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ دسترسی و وضعیت کاربران ═══════════════════ */

/* زبانِ ذخیره‌شدهٔ یک کاربر (برای پیام‌های پیش از احرازِ کامل) */
async function _langOf(env, uid) {
  try { const u = await kvGet(env, 'u:' + uid, {}); return (u.st && u.st.lang) === 'en' ? 'en' : null; } catch { return null; }
}
async function isAllowed(env, uid) {
  uid = String(uid);
  if (!env.ADMIN_ID) return false;
  if (String(env.ADMIN_ID).trim() === uid) return true;
  const al = await kvGet(env, 'al', []);
  return al.includes(uid);
}
async function isAdmin(env, uid) {
  return env.ADMIN_ID && String(env.ADMIN_ID).trim() === String(uid);
}

/* ═══════════════════ v5.4: سهمیه و نقش کاربران 👥 ═══════════════════
   هر کاربر در `lim:<uid>` می‌تواند سهمیهٔ روزانهٔ تصویر خودش را داشته باشد؛
   صفر = پیش‌فرض QUOTA_IMG_DEFAULT. مدیر همیشه بی‌سقف است. شمارنده‌ها در
   `uq:<uid>:<ymd>` روزانه ری‌ست می‌شوند (کلید جدا برای هر روز). */
async function userQuota(env, uid) {
  const q = await kvGet(env, 'lim:' + uid, null);
  return {
    img: q && typeof q.img === 'number' ? q.img : CFG.QUOTA_IMG_DEFAULT,
    tok: q && typeof q.tok === 'number' ? q.tok : CFG.QUOTA_DEFAULT,
  };
}
async function quotaTake(env, uid, kind) {
  if (await isAdmin(env, uid)) return null; // مدیر بی‌سقف
  const q = await userQuota(env, uid);
  const cap = kind === 'img' ? q.img : q.tok;
  if (!cap) return null;
  const t = tehran();
  const s = await kvGet(env, 'uq:' + uid + ':' + t.ymd, { img: 0, tok: 0 });
  if (kind === 'img' && (s.img || 0) >= cap) {
    return L(env, 'm1mtscmq', num(cap));
  }
  return null;
}
async function quotaBump(env, uid, kind) {
  try {
    const t = tehran();
    const k = 'uq:' + uid + ':' + t.ymd;
    const s = await kvGet(env, k, { img: 0, tok: 0 });
    if (kind === 'img') s.img = (s.img || 0) + 1;
    await kvPut(env, k, s, 2 * 86400);
  } catch (e) { await logErr(env, 'quota', e); }
}

// تنظیمات هر کاربر (ادغام با پیش‌فرض‌ها برای سازگاری نسخه‌ها)
async function getUser(env, uid) {
  const u = await kvGet(env, 'u:' + uid, {});
  u.st = { ...SETTINGS_DEFAULT, ...(u.st || {}) };
  /* زبانِ مؤثرِ این درخواست: تنظیماتِ همین کاربر (پیش‌فرض fa) */
  env._lang = u.st.lang === 'en' ? 'en' : 'fa';
  env._langSet = true;
  // مهاجرت تنبل: کلید مدل canonical میشود (ناشناخته/حذف‌شده → پیش‌فرض کلادفلر)
  u.st.model = (await canonModel(env, u.st.model)).key;
  delete u.st.provider; // فیلد قدیمی رد شده — سرویس از خود کلید قابل استخراج است
  /* مهاجرت v4.9 (یکبار): کاربران قدیمی voiceProv='cf' داشتند یعنی همیشه به
     Whisper/MeloTTS می‌رفت (MeloTTS فارسی ندارد → «تولید صوت کار نمی‌کرد» و
     Whisper ویس کوتاه را فینگلیش می‌خواند). اگر کلید گوگل ست باشد، یکبار
     روی گوگل می‌نشیند؛ کاربر هر وقت بخواهد از منوی صدا برمی‌گرداند. */
  if (u.st._m49 !== 1 && gemKey(env)) {
    u.st._m49 = 1;
    if (u.st.voiceProv === 'cf') u.st.voiceProv = 'google';
    if (u.st.sttModel === 'gemini-3.5-live-translate-preview') u.st.sttModel = 'gemini-3.5-transcribe';
    if (u.st.ttsModel === 'gemini-2.5-flash-preview-tts') u.st.ttsModel = 'gemini-3.8-flash-tts';
    u.st.imgGen = u.st.imgGen !== false;
    u.st.imgModel = u.st.imgModel || SETTINGS_DEFAULT.imgModel;
    await kvPut(env, 'u:' + uid, u);
  }
  if (!u.thread) u.thread = 'main';
  if (!Array.isArray(u.threads)) u.threads = [{ id: 'main', name: L(env, 'm095kqe9'), ts: Date.now() }];
  return u;
}
async function putUser(env, uid, u) {
  await kvPut(env, 'u:' + uid, u);
}
function curThread(u) {
  let t = u.threads.find((x) => x.id === u.thread);
  if (!t) { t = u.threads[0]; u.thread = t.id; }
  return t;
}
function scopeOf(chatId, u, isGroup) {
  return isGroup ? 'g' + chatId : 'c' + chatId + ':' + u.thread;
}

/* ═══════════════════ آمار و مصرف ═══════════════════ */
async function bumpUsage(env, uid, tin, tout) {
  const t = tehran();
  const k = 'us:' + uid;
  const s = await kvGet(env, k, { d: t.ymd, msgs: 0, tin: 0, tout: 0 });
  if (s.d !== t.ymd) { s.d = t.ymd; s.msgs = 0; s.tin = 0; s.tout = 0; }
  s.msgs++; s.tin += tin || 0; s.tout += tout || 0;
  await kvPut(env, k, s, 2 * 86400);
  return s;
}
async function checkDailyLimit(env, uid, settings) {
  if (!settings.dailyLimit) return null;
  const t = tehran();
  const s = await kvGet(env, 'us:' + uid, { d: t.ymd });
  if (s.d !== t.ymd) return null;
  if (s.tin + s.tout >= settings.dailyLimit * 1000) {
    return L(env, 'm09y06ue', num(settings.dailyLimit));
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 15-markdown-typing
   تبدیل Markdown→HTML تلگرام + چرخهٔ تایپینگ ⌨️
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ تبدیل Markdown به HTML تلگرام ═══════════════════ */
function mdToHtml(src) {
  let s = String(src || '');
  // اگر بلوک کد نیمه‌کاره بود (حین استریم)، ببندش
  const fences = (s.match(/```/g) || []).length;
  if (fences % 2 === 1) s += '\n```';
  s = esc(s);
  const codes = [];
  s = s.replace(/```([a-zA-Z0-9+#-]*)\n?([\s\S]*?)```/g, (m, lang, code) => {
    codes.push('<pre><code>' + code.replace(/\n$/, '') + '</code></pre>');
    return '\x01CB' + (codes.length - 1) + '\x02';
  });
  const inl = [];
  s = s.replace(/`([^`\n]+)`/g, (m, c) => {
    inl.push('<code>' + c + '</code>');
    return '\x01IN' + (inl.length - 1) + '\x02';
  });
  s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<b><i>$1</i></b>')
       .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
       .replace(/__(.+?)__/g, '<b>$1</b>')
       .replace(/~~(.+?)~~/g, '<s>$1</s>')
       .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<i>$2</i>')
       .replace(/(^|[\s(])_([^_\n]+)_/g, '$1<i>$2</i>')
       .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/\x01CB(\d+)\x02/g, (m, i) => codes[+i])
       .replace(/\x01IN(\d+)\x02/g, (m, i) => inl[+i]);
  return s.trim() || '…';
}

// برش پیام بلند به تکه‌های زیر ۴۰۰۰ کاراکتر (روی مرز خط)
/* 🔧 v5.4: برش متن HTML-تلگرام. قبلاً اگر مرز با limit وسط یک تگ یا
   انتیتی («<b» / «&#x…») می‌افتاد، تلگرام آن پیام را با خطای parse رد
   می‌کرد و بخشی از پاسخ گم می‌شد. حالا:
   ۱) نقطهٔ برش از داخل تگ/انتیتی به بیرونش جابه‌جا می‌شود؛
   ۲) تگ‌هایی که در تکه باز مانده‌اند در انتهای همان تکه بسته و در آغاز
      تکهٔ بعد دوباره باز می‌شوند (بولد/ایتالیک/کد بین تکه‌ها ادامه دارد). */
const CHUNK_TAGS = /<(\/?)(b|i|u|s|code|pre|a|blockquote|tg-spoiler)(\s[^>]*)?>/g;
function chunkText(text, limit = CFG.MSG_CHUNK) {
  const out = [];
  let rest = String(text || '');
  while (rest.length > limit) {
    let cut = rest.lastIndexOf('\n', limit);
    if (cut < limit * 0.5) cut = limit;
    /* برش نباید داخل تگ/انتیتی باشد */
    const lt = rest.lastIndexOf('<', cut);
    const gt = rest.lastIndexOf('>', cut);
    if (lt > gt && lt > limit * 0.3) cut = lt;
    else {
      const amp = rest.lastIndexOf('&', cut);
      if (amp > rest.lastIndexOf(';', cut) && amp > limit * 0.3 && cut - amp < 10) cut = amp;
    }
    if (cut <= 0) cut = limit;
    let piece = rest.slice(0, cut);
    /* تعادل تگ‌ها: بازهای بدون بسته را ببند و در تکهٔ بعد باز کن */
    const open = [];
    for (const m of piece.matchAll(CHUNK_TAGS)) {
      if (m[1]) { const i2 = open.lastIndexOf(m[2]); if (i2 >= 0) open.splice(i2, 1); }
      else if (!/\/>$/.test(m[0])) open.push(m[2]);
    }
    piece += open.slice().reverse().map((t2) => '</' + t2 + '>').join('');
    out.push(piece);
    rest = open.map((t2) => '<' + t2 + '>').join('') + rest.slice(cut).replace(/^\n{2,}/, '\n');
  }
  if (rest.trim()) out.push(rest);
  return out.length ? out : ['…'];
}

/* ═══════════════════ چرخه تایپینگ ⌨️ ═══════════════════ */
function startTyping(env, chatId) {
  const st = { stop: false };
  (async () => {
    const b = newBudget(CFG.TYPING_MAX);
    while (!st.stop && b.ok()) {
      b.take();
      try {
        await fetchT(TG_BASE + '/bot' + env.TELEGRAM_BOT_TOKEN + '/sendChatAction',
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: J({ chat_id: chatId, action: 'typing' }) }, 8000);
      } catch {}
      for (let i = 0; i < CFG.TYPING_GAP_MS / 100 && !st.stop; i++) await sleep(100);
    }
  })();
  return st;
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 16-chat-core
   اجرای چت کامل — هستهٔ ربات 💬
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ اجرای چت کامل (هسته ربات) ═══════════════════ */
// خروجی پاسخ + ذخیره تاریخچه + آمار؛ برای چت عادی، مقایسه و regenerate استفاده میشود
async function runChatReply(env, budget, chatId, uid, scope, settings, userText, opts = {}) {
  const tMsg = Date.now(); // v4.10: شروع زمان پاسخ‌دهی (از لحظهٔ دریافت پیام)
  const typing = startTyping(env, chatId);
  let ph = null;
  try {
    ph = await sendMsg(env, budget, chatId, L(env, 'm1atr754', EMOJI.think));
  } catch {}

  const setStatus = async (html) => {
    if (ph) { try { await editMsg(env, budget, chatId, ph.message_id, html); } catch {} }
  };

  try {
    /* پیوستن محتوای وب و فایل */
    let content = userText;
    const linkPart = await maybeAttachLinks(env, settings, userText, setStatus);
    if (linkPart) content += linkPart;
    if (opts.filePart) content += (linkPart ? '' : '\n\n') + opts.filePart;
    try {
      const toolPart = await runPreTools(env, settings, userText, setStatus);
      if (toolPart) content += toolPart;
    } catch (e) { await logErr(env, 'pretools', e); }
    const photos = opts.photos || [];

    /* حالت مقایسه دو مدل */
    const cp = !opts.noCompare ? await kvGet(env, 'cp:' + uid, null) : null;
    if (cp && cp.on) {
      const [ea, eb] = await upgradeCpPair(env, uid, cp);
      const { msgs } = await buildMessages(env, settings, scope, null, opts.extraSys, Math.min(ea.ctx, eb.ctx), uid);
      const mkMsgs = (sys) => [{ role: 'system', content: sys }, ...msgs.slice(1), { role: 'user', content: uContent }];
      const uContent = photos.length ? imgContent(env, userText, photos) : content;
      await setStatus(L(env, 'm0ylbfz3'));
      const cmp = (ent, tag) => (photos.length && !hasVision(ent))
        ? Promise.resolve({ err: { message: L(env, 'm1hbrg4g', tag) } })
        : aiChat(env, ent.key, mkMsgs(buildSystemPrompt(env, settings)), { temperature: settings.temperature, maxTokens: settings.maxTokens, ...cbOff(settings) });
      const [resA, resB] = await Promise.all([
        cmp(ea, L(env, 'm12tkrii')).catch((e) => ({ err: e })),
        cmp(eb, L(env, 'm0fh2tgl')).catch((e) => ({ err: e })),
      ]);
      const fmt = (tag, ent, r) => {
        if (r.err) return tag + ' <b>' + esc(ent.name) + ' · ' + esc(ent.provName) + '</b>\n❌ ' + esc(r.err.message || L(env, 'm0opv2xb'));
        return tag + ' <b>' + esc(ent.name) + ' · ' + esc(ent.provName) + '</b>\n' + mdToHtml(r.text);
      };
      const body = fmt('🅰️', ea, resA) + '\n\n───────────\n\n' + fmt('🅱️', eb, resB);
      if (photos.length) {
        await sendMsg(env, budget, chatId, L(env, 'm09qlg2a', num(photos.length)));
      }
      const parts = chunkText(body);
      await editMsg(env, budget, chatId, ph.message_id, parts[0], [
        [{ text: L(env, 'm147xw31'), callback_data: 'cmpoff' }],
      ]);
      for (let i = 1; i < parts.length; i++) await sendMsg(env, budget, chatId, parts[i]);
      if (resA.text && resB.text) {
        const h = await histGet(env, scope);
        h.msgs.push({ role: 'user', content });
        h.msgs.push({ role: 'assistant', content: L(env, 'm1hlllrf', resA.text.slice(0, 1500)) });
        await histPut(env, scope, h);
      }
      await bumpUsage(env, uid, est(content) * 2, ((resA.usage && resA.usage.completion_tokens) || est(resA.text)) + ((resB.usage && resB.usage.completion_tokens) || est(resB.text)));
      return;
    }

    /* چت عادی */
    const lim = await checkDailyLimit(env, uid, settings);
    if (lim) { await setStatus(EMOJI.err + ' ' + lim); return; }

    let entry = await resolveModel(env, settings.model);
    let visionNote = ''; // اگر مدل نهایی عوض شد، در فوتر توضیح داده می‌شود
    if (photos.length && !hasVision(entry)) {
      if (!settings.autoVision) {
        await setStatus(L(env, 'm0w9mkno'));
        return;
      }
      const ve = await pickVisionModel(env, settings.model);
      if (!ve || ve.key === entry.key) {
        await setStatus(L(env, 'm131yarz'));
        return;
      }
      visionNote = L(env, 'm0xly8zo', ve.name);
      entry = ve;
    }
    const uContent = photos.length ? imgContent(env, content, photos) : content;
    const { msgs } = await buildMessages(env, settings, scope, null, opts.extraSys, entry.ctx, uid);
    msgs.push({ role: 'user', content: uContent });

    let finalText = '';
    let usage = {};
    const tModel0 = Date.now(); // زمان‌سنجی دقیق مدل (v4.10): از شروع فراخوانی تا پایان
    const useStream = settings.liveStream;
    const r = await aiChat(env, entry.key, msgs,
      { temperature: settings.temperature, maxTokens: settings.maxTokens, ...cbOff(settings) },
      useStream
        ? async (acc) => {
            const t = mdToHtml(acc.slice(-3800));
            try { await editMsg(env, budget, chatId, ph.message_id, t + ' ✍️'); } catch {}
          }
        : null
    ).catch(async (e) => {
      /* فالبک خودکار به مدل مطمئن دیگر — همیشه داخل استخر رایگان کلادفلر */
      if (!settings.autoFallback) throw e;
      if (/binding/i.test(String(e.message || ''))) throw e;
      // این خطاها با عوض‌کردن مدل کلادفلر درست نمیشوند (net نه — سرویس قطع باشد فالبک مفید است)
      if (e.code === 'context' || e.code === 'auth' || e.code === 'nomodel') throw e;
      const alt = entry.prov !== 'p'
        ? (CF_FALLBACK_MODEL !== settings.model ? CF_FALLBACK_MODEL : (((await getModels(env)).find((m) => m.id !== settings.model) || {}).id || null))
        : CF_FALLBACK_MODEL; // سرویس کاستوم → فقط به lane رایگان کلادفلر، نه به یک سرویس پولی دیگر
      if (!alt) throw e;
      await setStatus(L(env, 'm0hvve17', esc(e.message || L(env, 'm0opv2xb')), esc(modelName(env, alt))));
      const r2 = await aiChat(env, alt,
        [{ role: 'system', content: buildSystemPrompt(env, settings) }, ...msgs.slice(1)],
        { temperature: settings.temperature, maxTokens: settings.maxTokens, ...cbOff(settings) });
      r2._alt = alt;
      return r2;
    });

    finalText = r.text;
    usage = r.usage || {};

    /* ذخیره تاریخچه */
    // تاریخچه: متن + نشانهٔ عکس (خود عکس ذخیره نمی‌شود)
    const h = await histGet(env, scope);
    const noteParts = [];
    if (photos.length) noteParts.push(L(env, 'm0hwj8vq', num(photos.length)));
    h.msgs.push({ role: 'user', content: [userText, ...noteParts].filter(Boolean).join(' ') });
    h.msgs.push({ role: 'assistant', content: finalText });
    await histPut(env, scope, h);
    try { await maybeExtractMemory(env, uid, scope, settings); } catch {}

    /* نمایش نهایی */
    const shownModel = r._alt || entry.key;
    /* فوتر آماری (v4.10): مدل · سرویس · زمان پاسخ‌دهی · توکن.
       «مدت پاسخ» = از لحظهٔ ارسال پیام تا آماده شدن جواب — شامل زمان فکر مدل،
       خواندن لینک/ابزارها و هر فالبک خودکار. */
    const respMs = Date.now() - tMsg;
    const respSec = (respMs / 1000).toFixed(respMs < 10000 ? 1 : 0);
    const foot = L(env, 'm0306yaz', esc(await entryLabel(env, shownModel)), esc(visionNote), num(respSec), usage.completion_tokens ? ' · ' + num(usage.completion_tokens) + L(env, 'm1rriwiu') : '');
    const kb = [
      [
        { text: L(env, 'm1ivrg4n'), callback_data: 'regen' },
        { text: L(env, 'm04607zy'), callback_data: 'save' },
      ],
      [
        { text: L(env, 'm1rq6ppp'), callback_data: 'threset' },
        { text: L(env, 'm0giln1r'), callback_data: 'set' },
      ],
    ];
    /* دکمه‌ی «تلاش مجدد rt:» حذف شد: هیچ‌جا payloadHash تولید نمی‌شد یعنی دکمه
       هرگز ساخته نمیشد، ولی اگر ساخته میشد هیچ هندلری برایش نبود و تلگرام
       فقط «؟» برمی‌گرداند. برای تکرار همان «♻️ تولید مجدد» (regen) کافی است. */

    const parts = chunkText(mdToHtml(finalText) + foot);
    /* دکمه‌های ناوبری روی پیام چت هم هست — متن + کلید همان لحظه در پشته ثبت
       میشود تا «🔙 بازگشت» از یک منو بتواند دقیقاً همین پیام را بازگرداند. */
    const chatKb = kb.concat([navBar(env, chatId, 'chat')]);
    navPush(chatId, { s: 'chat', txt: parts[0], kb: chatKb });
    await editMsg(env, budget, chatId, ph.message_id, parts[0], chatKb);
    for (let i = 1; i < parts.length; i++) await sendMsg(env, budget, chatId, parts[i], i === parts.length - 1 ? chatKb : null);

    await bumpUsage(env, uid, usage.prompt_tokens || (est(content) + photos.length * CFG.VISION_TOK_EST), usage.completion_tokens || est(finalText));
    if (opts.fromVoice && settings.voiceReply && finalText) {
      try { await sendVoiceReply(env, budget, chatId, finalText, settings); } catch {}
    }
  } catch (e) {
    const msg = (e && e.message) || L(env, 'm1nnd31k');
    const kb = [[{ text: L(env, 'm0yxhz1s'), callback_data: 'threset' }]];
    if (ph) {
      try { await editMsg(env, budget, chatId, ph.message_id, L(env, 'm0h5v7yd', EMOJI.err, esc(msg)), kb); } catch {}
    } else {
      try { await sendMsg(env, budget, chatId, L(env, 'm0h5v7yd', EMOJI.err, esc(msg)), kb); } catch {}
    }
  } finally {
    typing.stop = true;
  }
}

// ── CRUD سرویس‌ها ──
// افزودن مدل‌ها به‌صورت اجتماع: ورودی‌های موجود (دستی یا کاوش‌شده) هرگز
// تغییر/حذف نمیشوند؛ فقط شناسه‌های جدید اضافه میشوند. (max 50 مدل)
async function mergeModels(env, rec, items) {
  const have = new Set((rec.models || []).map((m) => m.id));
  let added = 0;
  if (!Array.isArray(rec.models)) rec.models = [];
  for (const it of items) {
    const id = String(it.id || '').trim();
    if (!id || have.has(id) || rec.models.length >= CFG.MAX_MODELS_PER_PROVIDER) continue;
    // پرچم عکسفهم: مقدار صریح، وگرنه حدس از آیدی (با 👁 در صفحه سرویس قابل تغییر)
    const vis = it.vision !== undefined ? !!it.vision : VISION_RE.test(id);
    rec.models.push({ id, ctx: it.ctx || null, name: it.name || '', src: it.src || 'disc', ts: Date.now(), vision: vis });
    have.add(id);
    added++;
    await kvPut(env, 'mh:' + hash32(rec.pid + ':' + id), rec.pid + ':' + id, CFG.HASH_TTL);
  }
  if (added) await provPut(env, rec);
  return added;
}
async function removeModel(env, rec, modelId) {
  rec.models = (rec.models || []).filter((m) => m.id !== modelId);
  await kvDel(env, 'mh:' + hash32(rec.pid + ':' + modelId));
  await provPut(env, rec);
}
// حذف سرویس + جاروب کاربران/مقایسه‌ها (علاوه بر فالبک تنبل در getUser)
async function deleteProvider(env, pid) {
  const rec = await provGet(env, pid);
  if (!rec) return 0;
  for (const m of rec.models || []) await kvDel(env, 'mh:' + hash32(pid + ':' + m.id));
  const draft = await kvGet(env, 'pvr:' + pid, null); // نگاشت‌های پیش‌نویس کاوش هم پاک شوند
  if (draft) for (const it of draft.items || []) { const id = it.id || it; await kvDel(env, 'mh:' + hash32(pid + ':' + id)); }
  await kvDel(env, 'pvr:' + pid);
  await kvDel(env, 'pv:' + pid);
  _pv.delete(pid);
  let fixed = 0;
  for (const k of await kvList(env, 'u:')) {
    const v = await kvGet(env, k, null);
    if (v && v.st && CK_RE.test(String(v.st.model || '')) && String(v.st.model).slice(0, 9) === pid) {
      v.st.model = SETTINGS_DEFAULT.model;
      delete v.st.provider;
      await kvPut(env, k, v);
      fixed++;
    }
  }
  for (const k of await kvList(env, 'cp:')) {
    const v = await kvGet(env, k, null);
    if (v && Array.isArray(v.pair)) {
      let dirty = false;
      v.pair = v.pair.map((s, i) => {
        if (String(s || '').startsWith(pid + ':')) { dirty = true; return (CF_KNOWN[i] || CF_KNOWN[0]).id; }
        return s;
      });
      if (dirty) await kvPut(env, k, v);
    }
  }
  return fixed;
}

// کاوش مدل‌ها: GET {base}/models روی [base, base+'/v1'] — پاسخ قالب آزاد
// (آرایه خالص | .data | .models | .result) و ctx از فیلدهای رایج گرفته میشود
async function discoverModels(env, base, key) {
  const bases = [base];
  if (!/\/v1$/.test(base)) bases.push(base + '/v1');
  let lastCode = 'net';
  for (const b of bases) {
    let res;
    try {
      res = await fetchT(b.replace(/\/+$/, '') + '/models', { headers: { Authorization: 'Bearer ' + key, Accept: 'application/json' } }, CFG.DISCO_TIMEOUT_MS);
    } catch (e) {
      lastCode = 'net';
      await logErr(env, 'prov_disco', new Error(scrubSecret(String((e && e.message) || e), key)));
      continue;
    }
    if (res.status === 401 || res.status === 403) return { ok: false, code: 'auth' };
    if (!res.ok) { lastCode = res.status === 404 ? 'notfound' : 'http'; continue; }
    let js;
    try { js = JSON.parse((await res.text()).slice(0, 1000000)); } catch { lastCode = 'badjson'; continue; }
    const arr = Array.isArray(js) ? js : ((js && (js.data || js.models || js.result)) || []);
    const items = [];
    const seen = new Set();
    for (const o of arr) {
      const id = String(typeof o === 'string' ? o : ((o && (o.id || o.model || o.name)) || '')).trim();
      if (!id || id.length > CFG.MODEL_ID_MAX || !/^[ -~]+$/.test(id) || seen.has(id)) continue;
      seen.add(id);
      const ctx = Number((o && (o.context_length || o.max_model_len || o.max_context_length || o.supported_total_tokens)) || 0) || null;
      items.push({ id, ctx });
      if (items.length >= CFG.DISCOVER_CAP) break;
    }
    if (!items.length) { lastCode = 'empty'; continue; }
    return { ok: true, base: b, items };
  }
  return { ok: false, code: lastCode };
}
const DISCO_FAIL_TEXT = {
  auth: 'کلید API رد شد (کلید را اصلاح کن)', notfound: 'مسیر /models وجود ندارد', net: 'ارتباط برقرار نشد',
  http: 'سرور خطا داد', badjson: 'پاسخ نامفهوم بود', empty: 'هیچ مدلی گزارش نشد',
};

/* EN */
const DISCO_FAIL_TEXT_EN = {
  auth: 'API key rejected (fix the key)', notfound: 'No /models endpoint', net: 'Could not connect',
  http: 'Server returned an error', badjson: 'Unreadable response', empty: 'No models reported',
};

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 17-menus
   منوها: مدل 🤖 / اصلی 🏠 / تنظیمات ⚙️ / سلامت 🩺 / کاربران 👥
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ صفحه‌بندی لیست مدل‌ها 🤖 ═══════════════════ */
// آیدی کامل مدل‌ها طولانی است؛ در callback_data با hash کوتاه کار میکنیم.
// برای حفظ سازگاری با کش ۳۰ دقیقه‌ای، نگاشت hash→کلید canonical در D1 ذخیره میشود.
// برگشت جدید: همیشه از resolveModel اعتبارسنجی میشود تا مدل/سرویس حذف‌شده
// از کش mh زنده نشود؛ ورودی hash برای مدل‌های cf همان آیدی قبلی است.
async function resolveModelByHash(env, h) {
  let key = null;
  const mapped = await kvGet(env, 'mh:' + h, null);
  if (typeof mapped === 'string' && mapped) key = mapped;
  if (!key) {
    for (const f of CF_KNOWN) if (hash32(f.id) === h) { key = f.id; break; }
  }
  if (!key) {
    for (const m of await getAllModelEntries(env)) {
      if (hash32(m.key) === h) { key = m.key; await kvPut(env, 'mh:' + h, m.key, CFG.HASH_TTL); break; }
    }
  }
  if (!key) return null;
  const e = await resolveModel(env, key);
  if (e.key !== key) return null; // سرویس یا مدل حذف شده
  return e;
}

async function showModels(env, budget, chatId, page, refresh = false) {
  if (refresh) await kvDel(env, 'mc');
  const list = await getAllModelEntries(env);
  const per = CFG.PICK_PAGE;
  const pages = Math.max(1, Math.ceil(list.length / per));
  page = Math.max(0, Math.min(page || 0, pages - 1));
  const slice = list.slice(page * per, (page + 1) * per);
  const u = await getUser(env, String(chatId));
  const cur = u.st.model;
  const curEntry = await resolveModel(env, cur);
  const kb = [];
  let prevProv = null;
  for (const m of slice) {
    const ident = m.prov === 'cf' ? 'cf' : m.pid;
    if (ident !== prevProv) {
      kb.push([{ text: m.prov === 'cf' ? L(env, 'm1lvln25') : '── 🔌 ' + m.provName + ' ──', callback_data: 'noop' }]);
      prevProv = ident;
    }
    kb.push([{
      text: (curEntry.key === m.key ? '✅ ' : '') + m.name + ' (' + Math.round(m.ctx / 1000) + 'K)' + (m.vision ? ' 👁' : ''),
      callback_data: 'ms:' + hash32(m.key),
    }]);
  }
  if (!kb.length) kb.push([{ text: L(env, 'm1xwo61m'), callback_data: 'noop' }]);
  kb.push([
    { text: '◀️', callback_data: 'mp:' + ((page - 1 + pages) % pages) },
    { text: (page + 1) + '/' + pages, callback_data: 'noop' },
    { text: '▶️', callback_data: 'mp:' + ((page + 1) % pages) },
  ]);
  kb.push([
    { text: L(env, 'm0xu8uz9'), callback_data: 'mref' },
    { text: '✖️', callback_data: 'close' },
  ]);
  const txt =
    L(env, 'm0rymzdf', esc(curEntry.name), curEntry.prov === 'cf' ? '☁️ Workers AI' : '🔌 ' + esc(curEntry.provName), num(Math.round(curEntry.ctx / 1000)));
  await menuRender(env, budget, chatId, txt, kb, 'mm');
}

/* ═══════════════ ناوبری دو دکمه‌ای (v4.10) ═══════════════
   همه منوها و همه پیام‌ها دو دکمهٔ ثابت دارند:
     🔙 بازگشت  → پیش‌بینی‌شده: به همان صفحه/پیامی برمی‌گردد که از آن آمده‌اید
     🏠 منوی اصلی → پنل ربات
   پشته به‌صورت حافظهٔ درون‌حافظه‌ای هر گفتگو نگه داشته میشود (chatId کلید است).
   اگر ایزوله ری‌استارت شود پشته خالی میشود و دکمهٔ بازگشت ناپدید میشود —
   خراب نمیشود، فقط عمیق‌ترین سطح را از دست میدهید. */
const _nav = new Map(); // chatId → [{ s: شناسه صفحه, txt?, kb? }]
function navPush(chatId, entry) {
  const st = _nav.get(chatId) || [];
  const last = st[st.length - 1];
  if (last && last.s === entry.s) {
    if (entry.s === 'chat' && entry.txt != null) st[st.length - 1] = entry; // آخرین پیام را نگه دار تا بازگشت درست باشد
    return;
  }
  st.push(entry);
  while (st.length > 12) st.shift();
  _nav.set(chatId, st);
}
function navBar(env, chatId, screen) {
  const st = _nav.get(chatId) || [];
  let i = st.length - 1;
  if (i >= 0 && st[i].s === screen) i--; // همین صفحه بالاست ← یکی مانده به عقب
  const back = i >= 0 ? st[i] : null;
  const row = [{ text: L(env, 'm1gfk5sg'), callback_data: 'home' }];
  if (back && back.s !== screen) row.unshift({ text: L(env, 'm12pftld'), callback_data: 'navback' });
  if (_nav.size > 400) { _nav.clear(); _nav.set(chatId, st); } // جلوگیری از رشد بی‌انتها
  return row;
}

// بازیابی صفحهٔ قبلی از روی شناسه — هر صفحه مسیر بازگشتی خودش را میداند
/* منوی حافظهٔ بلندمدت — هم از callback هم از navRestore */
async function memMenu(env, budget, chatId, uid) {
  const arr = await memGet(env, uid);
  let txt = L(env, 'm11dxfum', arr.length, CFG.MEM_MAX);
  if (!arr.length) txt += L(env, 'm1aq8wn1');
  else txt += arr.map((x, i) => (i + 1) + '. ' + esc(x.t)).join('\n');
  txt += L(env, 'm0oolpwr');
  const kb = arr.slice(-10).map((x) => [{ text: '🗑 ' + x.t.slice(0, 26), callback_data: 'memdel:' + x.id }]);
  kb.push([{ text: L(env, 'm1p8c2gn'), callback_data: 'memadd' }, { text: L(env, 'm1w5c8ch'), callback_data: 'memedit' }]);
  kb.push([{ text: L(env, 'm14cbrju'), callback_data: 'memdelall' }]);
  kb.push([{ text: L(env, 'm1t3qh5r'), callback_data: 'set' }, { text: '✖️', callback_data: 'close' }]);
  await menuRender(env, budget, chatId, txt, kb, 'mem');
}

async function navRestore(env, budget, chatId, uid, screen) {
  if (screen === 'set') return await settingsMenu(env, budget, chatId, uid);
  if (screen === 'pv') return await providersMenu(env, budget, chatId);
  if (screen === 'ping') return await healthCheck(env, budget, chatId);
  if (screen === 'stats') return await statsView(env, budget, chatId, uid);
  if (screen === 'voice') return await voiceMenu(env, budget, chatId, uid, 0);
  if (screen === 'th') return await threadsMenu(env, budget, chatId, uid);
  if (screen === 'ps') return await personaMenu(env, budget, chatId, uid);
  if (screen === 'pl') return await promptsMenu(env, budget, chatId, uid);
  if (screen === 'cmp') return await compareMenu(env, budget, chatId, uid);
  if (screen === 'arch') return await archiveMenu(env, budget, chatId, uid);
  if (screen === 'usr') return await usersMenu(env, budget, chatId);
  if (screen === 'bkup') return await backupMenu(env, budget, chatId, uid);
  if (screen === 'mm') return await showModels(env, budget, chatId, 0);
  if (screen === 'mem') return await memMenu(env, budget, chatId, uid);
  if (screen === 'rmlist') return await remindersMenu(env, budget, chatId, uid);
  if (screen === 'hpall') return await provHealthAll(env, budget, chatId);
  if (screen.startsWith('pvo:')) return await providerPage(env, budget, chatId, screen.slice(4));
  if (screen.startsWith('pvkk:')) return await providerKeysPage(env, budget, chatId, screen.slice(5));
  /* صفحهٔ سلامتِ یک سرویس، بعد از بازگشت به منوی همان سرویس برمی‌گردد
     (تست را دوباره اجرا نمیکنیم — بازگشت نباید چند ثانیه معطل کند) */
  if (screen.startsWith('pvhp:')) return await providerKeysPage(env, budget, chatId, screen.slice(5));
  return await mainMenu(env, budget, chatId, uid);
}

async function menuRender(env, budget, chatId, txt, kb, screen) {
  /* ردیف‌های قدیمی «↩️ بازگشت → home» و «✖️» را دور می‌ریزیم تا فقط دو دکمهٔ
     استاندارد ناوبری بمانند. ردیف‌هایی که کنار خانه دکمهٔ دیگری دارند (مثل
     «↩️ سرویس‌ها + ✖️») دست‌نخورده می‌مانند؛ فقط دکمهٔ خانه‌شان کنده میشود. */
  const rows = [];
  for (const row of (kb || [])) {
    const arr = Array.isArray(row) ? row : [row];
    const r = arr.filter((b) => b && b.callback_data !== 'home' && b.callback_data !== 'navback');
    if (r.length) rows.push(r);
    else if (arr.some((b) => b && b.callback_data === 'close')) rows.push(arr.filter((b) => b.callback_data === 'close'));
    /* خالی ← ردیف کنار خانه فقط «بازگشت/بستن» بود و ناوبری استاندارد جایگزینش میشود */
  }
  const kb2 = rows.concat([navBar(env, chatId, screen)]);
  navPush(chatId, { s: screen });
  try { await editMsg(env, budget, chatId, env._menuMsg, txt, kb2); }
  catch { const m = await sendMsg(env, budget, chatId, txt, kb2); env._menuMsg = m.message_id; }
}

/* ═══════════════════ منوی اصلی 🏠 ═══════════════════ */
async function mainMenu(env, budget, chatId, uid) {
  const u = await getUser(env, uid);
  const s = u.st;
  const us = await kvGet(env, 'us:' + uid, {});
  const t = tehran();
  const p = PERSONAS[s.persona] || PERSONAS[0];
  const mEntry = await resolveModel(env, s.model);
  const txt =
    L(env, 'm1gee2xq', EMOJI.robot, VERSION, esc(mEntry.name), mEntry.prov === 'cf' ? L(env, 'm1xi1wad') : '🔌 ' + esc(mEntry.provName), num(Math.round(mEntry.ctx / 1000)), p.icon, esc(p.name), num(us.d === t.ymd ? us.msgs || 0 : 0));
  const kb = [
    [{ text: L(env, 'm0kr3n6n'), callback_data: 'th' }, { text: L(env, 'm0l10a65'), callback_data: 'mm:0' }],
    [{ text: L(env, 'm09lhgw1'), callback_data: 'ps' }, { text: L(env, 'm0giln1r'), callback_data: 'set' }],
    [{ text: L(env, 'm1qm7w1e'), callback_data: 'mem' }, { text: L(env, 'm05h45yl'), callback_data: 'voice' }],
    [{ text: L(env, 'm0mbn0v4'), callback_data: 'cmp' }, { text: L(env, 'm0g64mqj'), callback_data: 'pl' }],
    [{ text: L(env, 'm1mep9mb'), callback_data: 'pv' }, { text: L(env, 'm012p9xn'), callback_data: 'arch' }],
    [{ text: L(env, 'm1ae0jwf'), callback_data: 'bkup2' }, { text: L(env, 'm18igbmz'), callback_data: 'stats' }],
    [{ text: L(env, 'm18zglcd'), callback_data: 'todo' }, { text: L(env, 'm0r6mjqm'), callback_data: 'task' }],
    [{ text: L(env, 'm0dsvbbz'), callback_data: 'gal' }, { text: L(env, 'm1jgr3l8'), callback_data: 'fnd' }],
    [{ text: L(env, 'm1meqlbf'), callback_data: 'help' }, { text: L(env, 'm1wrjtc2'), callback_data: 'ex' }],
    [{ text: L(env, 'm1kijfqi'), callback_data: 'usr' }, { text: L(env, 'm151nw5e'), callback_data: 'ping' }],
    [{ text: L(env, 'm1uzs74l'), url: env._dashUrl }],
    [{ text: L(env, 'm0in6xe7'), callback_data: 'close' }],
  ];
  await menuRender(env, budget, chatId, txt, kb, 'home');
}

// ── UI مدیریتی سرویس‌ها (فقط ادمین) ──
async function providersMenu(env, budget, chatId) {
  const provs = await provAll(env);
  const kb = [[{ text: L(env, 'm109z0d3'), callback_data: 'noop' }]];
  for (const r of provs) kb.push([{ text: L(env, 'm1w57hdy', esc(r.name), (r.models || []).length), callback_data: 'pvo:' + r.pid }]);
  if (!provs.length) kb.push([{ text: L(env, 'm0ll5bys'), callback_data: 'noop' }]);
  kb.push([{ text: L(env, 'm0j1mde2'), callback_data: 'pvnew' }]);
  kb.push([{ text: L(env, 'm1v7msmb'), callback_data: 'home' }, { text: '✖️', callback_data: 'close' }]);
  const txt =
    L(env, 'm1wfb8a4');
  await menuRender(env, budget, chatId, txt, kb, 'pv');
}

async function providerPage(env, budget, chatId, pid) {
  const rec = await provGet(env, pid);
  if (!rec) return providersMenu(env, budget, chatId);
  const ms = rec.models || [];
  const kb = [];
  for (const m of ms.slice(0, CFG.PROV_SHOW_MODELS)) {
    const h = hash32(pid + ':' + m.id);
    await kvPut(env, 'mh:' + h, pid + ':' + m.id, CFG.HASH_TTL);
    kb.push([
      { text: '🗑 ' + (m.name || m.id).slice(0, 24), callback_data: 'pvmx:' + h },
      { text: m.vision ? '👁' : '🚫', callback_data: 'pvvis:' + h },
      { text: '📏', callback_data: 'pvxc:' + h },
    ]);
  }
  if (ms.length > CFG.PROV_SHOW_MODELS) kb.push([{ text: L(env, 'm0e3xgcr', ms.length - CFG.PROV_SHOW_MODELS), callback_data: 'noop' }]);
  kb.push([{ text: L(env, 'm1jsnlsx'), callback_data: 'pvrn:' + pid }, { text: L(env, 'm1boeob4'), callback_data: 'pvru:' + pid }]);
  kb.push([{ text: L(env, 'm14dee9w', provKeysOf(rec).length, CFG.KEYS_PER_PROVIDER), callback_data: 'pvkk:' + pid }, { text: L(env, 'm078pchs'), callback_data: 'pvscan:' + pid }]);
  kb.push([{ text: L(env, 'm0d1lmgo'), callback_data: 'pvaddm:' + pid }, { text: L(env, 'm0l10a65'), callback_data: 'mm:0' }]);
  kb.push([{ text: L(env, 'm1muwsii'), callback_data: 'pvrm:' + pid }]);
  kb.push([{ text: L(env, 'm1yfp2py'), callback_data: 'pv' }, { text: '✖️', callback_data: 'close' }]);
  const pKeys = provKeysOf(rec);
  const txt =
    L(env, 'm1uet3nu', esc(rec.name), esc(rec.base), pKeysTxt(env, pKeys), ms.length, CFG.MAX_MODELS_PER_PROVIDER, ms.length ? ms.map((m) => '• <code>' + esc(m.id) + '</code>' + (m.ctx ? ' (' + Math.round(m.ctx / 1000) + 'K)' : L(env, 'm1gojmdi')) + (m.src === 'man' ? ' ✍️' : '')).join('\n') : L(env, 'm1w7ig69'));
  await menuRender(env, budget, chatId, txt, kb, 'pvo:' + pid);
}

/* منوی مدیریت کلیدهای یک سرویس (v4.10): تا CFG.KEYS_PER_PROVIDER کلید.
   چرا چند کلید: سرویس‌های OpenAI-compatible سقف نرخ برای «هر کلید» دارند؛
   چند کلید که ربات بین‌شان می‌چرخد هم سقف را نرم میکند هم اگر یکی سقف بزند
   بقیه در کار می‌مانند. حذف کلید اول = کلید از بین میرود (خطر ندارد چون
   همیشه نسخهٔ کامل قبل از حذف نشان داده میشود). */
async function providerKeysPage(env, budget, chatId, pid) {
  const rec = await provGet(env, pid);
  if (!rec) return providersMenu(env, budget, chatId);
  const keys = provKeysOf(rec);
  const kb = keys.map((k, i) => [
    { text: (i + 1) + '. ' + maskKey(k), callback_data: 'noop' },
    { text: '🗑', callback_data: 'pvkdel:' + pid + ':' + i },
  ]);
  if (!keys.length) kb.push([{ text: L(env, 'm183q2dk'), callback_data: 'noop' }]);
  const full = keys.length >= CFG.KEYS_PER_PROVIDER;
  kb.push([{ text: L(env, 'm0a3fam9'), callback_data: 'pvkadd:' + pid },
    { text: keys.length ? L(env, 'm0lnxyqe') : 'noop', callback_data: keys.length ? 'pvkdel:' + pid + ':' + (keys.length - 1) : 'noop' }]);
  kb.push([{ text: L(env, 'm078pchs'), callback_data: 'pvscan:' + pid }, { text: L(env, 'm06d51hl'), callback_data: 'pvhp:' + pid }]);
  kb.push([{ text: '↩️ ' + esc(rec.name).slice(0, 12), callback_data: 'pvo:' + pid }, { text: L(env, 'm1yfp2py'), callback_data: 'pv' }]);
  const txt =
    L(env, 'm0ue4kw6', esc(rec.name), keys.length, CFG.KEYS_PER_PROVIDER, pKeysTxt(env, keys));
  await menuRender(env, budget, chatId, txt, kb, 'pvkk:' + pid);
}

// صفحه انتخاب مدل‌های کاوش‌شده: هر لمس ➕ همان لحظه به سرویس اضافه میشود
async function renderPick(env, budget, chatId, pid, page, anchor) {
  const rec = await provGet(env, pid);
  const rr = await kvGet(env, 'pvr:' + pid, null);
  if (!rec || !rr) return providerPage(env, budget, chatId, pid);
  const per = CFG.PICK_PAGE;
  const ids = (rr.items || []).map((x) => x.id);
  const pages = Math.max(1, Math.ceil(ids.length / per));
  page = Math.max(0, Math.min(page || 0, pages - 1));
  const kb = [];
  for (const id of ids.slice(page * per, (page + 1) * per)) {
    const h = hash32(pid + ':' + id);
    await kvPut(env, 'mh:' + h, pid + ':' + id, CFG.HASH_TTL);
    const have = (rec.models || []).some((m) => m.id === id);
    kb.push([{ text: (have ? '✔️ ' : '➕ ') + id.split('/').pop().slice(0, 30), callback_data: 'pvmadd:' + h }]);
  }
  kb.push([
    { text: '◀️', callback_data: 'pvpg:' + pid + ':' + ((page - 1 + pages) % pages) },
    { text: (page + 1) + '/' + pages, callback_data: 'noop' },
    { text: '▶️', callback_data: 'pvpg:' + pid + ':' + ((page + 1) % pages) },
  ]);
  kb.push([{ text: L(env, 'm0evw0lf'), callback_data: 'pvman:' + pid }, { text: L(env, 'm1gbjz3g'), callback_data: 'pvmend:' + pid }]);
  const txt = L(env, 'm1g5muhw', esc(rec.name), ids.length);
  if (anchor) { try { await editMsg(env, budget, chatId, anchor, txt, kb); return; } catch {} }
  await menuRender(env, budget, chatId, txt, kb, 'pvo:' + pid);
}

// شروع مراحل ورودی متنی (اسم/آدرس/کلید/مدل دستی/...)
async function pvAsk(env, budget, chatId, uid, u, type, d) {
  u.wait = { type, d: d || {}, ts: Date.now() };
  await putUser(env, uid, u);
  const prompts = {
    pv_name: L(env, 'm1iw41j6'),
    pv_url: L(env, 'm0hlduu1'),
    pv_key: L(env, 'm11ftfhm'),
    pv_manual: L(env, 'm1lpxoee'),
    pv_rename: L(env, 'm0r1l59a'),
    pv_reurl: L(env, 'm16d29py'),
    pv_rekey: L(env, 'm0oi9mbh'),
    pv_addkey: L(env, 'm1evf8ki', CFG.KEYS_PER_PROVIDER),
    pv_ctx: L(env, 'm013xmeb'),
  };
  return sendMsg(env, budget, chatId, prompts[type] || L(env, 'm0782kha'));
}

/* ═══════════════════ منوی تنظیمات ⚙️ ═══════════════════ */
async function settingsMenu(env, budget, chatId, uid) {
  const u = await getUser(env, uid);
  const s = u.st;
  const oo = (b) => (b ? L(env, 'm08u9bn5') : L(env, 'm1y5pded'));
  let memN = 0;
  try { memN = (await memGet(env, uid)).length; } catch {}
  const txt =
    L(env, 'm1dr59dw', EMOJI.gear, num(s.temperature), num(s.maxTokens), s.dailyLimit ? num(s.dailyLimit) + L(env, 'm06cgnqj') : L(env, 'm0zzrxp4'), oo(s.autoFallback), oo(s.liveStream), oo(s.readLinks), oo(s.autoVision), oo(s.voiceReply), oo(s.searchAuto), oo(s.briefing), num(memN), s.voiceProv === 'cf' ? L(env, 'm0zji1xq') : L(env, 'm1uvfcxx'), s.voiceProv !== 'cf' ? ' · ' + esc(s.voiceName || 'Kore') + ' · ' + esc(s.ttsModel || '') : '', oo(s.imgGen !== false), s.imgGen !== false ? ' · ' + esc(s.imgModel || CFG.IMG_MODEL_DEFAULT) : '', gemKey(env) ? '' : L(env, 'm0m2zbpw'), oo(s.imgFree !== false), oo(s.imgEdit !== false), oo(s.nlRemind !== false), oo(s.memAuto !== false), oo(s.weeklyBackup !== false), oo(s.cbBreaker !== false), oo(s.ytSum !== false));
  const kb = [
    [{ text: L(env, 'm1wnt5i1'), callback_data: 'st:t-' }, { text: L(env, 'm1u7r2em'), callback_data: 'st:t+' }],
    [{ text: L(env, 'm0ues10s'), callback_data: 'st:m-' }, { text: L(env, 'm0sf0h0n'), callback_data: 'st:m+' }],
    [{ text: L(env, 'm0188hr5'), callback_data: 'st:dl' }],
    [{ text: L(env, 'm0kwd68f'), callback_data: 'st:fb' }, { text: L(env, 'm0xj44wz'), callback_data: 'st:ls' }, { text: L(env, 'm0yqdp5m'), callback_data: 'st:rl' }],
    [{ text: L(env, 'm162ldin'), callback_data: 'st:vr' }, { text: L(env, 'm1f9u72c'), callback_data: 'st:sa' }, { text: L(env, 'm0u85jr8'), callback_data: 'st:br' }],
    [{ text: L(env, 'm0jd89cs', s.imgGen !== false ? '✅ ' : ''), callback_data: 'st:ig' }, { text: L(env, 'm0p4iy30'), callback_data: 'st:igm' }],
    [{ text: L(env, 'm0xr25fd'), callback_data: 'st:if' }, { text: L(env, 'm0nxa3ar'), callback_data: 'st:ie' }],
    [{ text: L(env, 'm096nnz0'), callback_data: 'st:nl' }, { text: L(env, 'm1ew74lr'), callback_data: 'st:ma' }],
    [{ text: L(env, 'm1707pip'), callback_data: 'st:wb' }],
    [{ text: L(env, 'm0jcprmh', s.cbBreaker !== false ? '✅ ' : ''), callback_data: 'st:cb' }, { text: L(env, 'm0afxg26', s.ytSum !== false ? '✅ ' : ''), callback_data: 'st:yt' }],
    [{ text: L(env, 'm0dmwsnb', memN), callback_data: 'mem' }],
    [{ text: L(env, 'm05h45yl'), callback_data: 'voice' }],
    [{ text: L(env, 'm0a9t3mp'), callback_data: 'threset' }],
    [{ text: L(env, 'm1v7msmb'), callback_data: 'home' }, { text: '✖️', callback_data: 'close' }],
  ];
  /* سطرِ زبان: همیشه هر دو گزینه با علامتِ فعال */
  kb.splice(kb.length - 1, 0, [
    { text: (s.lang === 'fa' ? '✅ ' : '') + '🇮🇷 فارسی', callback_data: 'st:lang:fa' },
    { text: (s.lang === 'en' ? '✅ ' : '') + '🇬🇧 English', callback_data: 'st:lang:en' },
  ]);
  await menuRender(env, budget, chatId, txt, kb, 'set');
}

/* ═══════════ تنظیمات صدا v4.6 ═══════════ */
async function voiceMenu(env, budget, chatId, uid, page) {
  const u = await getUser(env, uid);
  const st = u.st;
  const hasGem = !!gemKey(env);
  const per = CFG.VOICE_PAGE;
  const pages = Math.max(1, Math.ceil(GEM_VOICES.length / per));
  page = Math.max(0, Math.min(page || 0, pages - 1));
  const ttsIdx = Math.max(0, GEM_TTS_MODELS.findIndex((m) => m.id === st.ttsModel));
  const sttIdx = Math.max(0, GEM_STT_MODELS.findIndex((m) => m.id === st.sttModel));
  let txt = L(env, 'm08a864g');
  txt += L(env, 'm01vbrff', st.voiceProv === 'google' ? L(env, 'm1uvfcxx') : L(env, 'm1wzuw1q'));
  txt += L(env, 'm04agodf', hasGem ? L(env, 'm0nxxawz') : L(env, 'm0j397wr'));
  txt += L(env, 'm0w64ohe', esc((GEM_STT_MODELS[sttIdx] || {}).name || st.sttModel));
  txt += L(env, 'm08tb1tg', esc((GEM_TTS_MODELS[ttsIdx] || {}).name || st.ttsModel));
  txt += L(env, 'm13de9hb', esc(st.voiceName || 'Kore'));
  txt += L(env, 'm1axwmcn', st.voiceReply ? L(env, 'm08u9bn5') : L(env, 'm0x3ex3n'));
  txt += L(env, 'm0ofspz9');
  const kb = [
    [{ text: L(env, 'm0ke7go8', st.voiceProv === 'cf' ? '✅ ' : ''), callback_data: 'vprov:cf' }, { text: L(env, 'm07wmsun', st.voiceProv === 'google' ? '✅ ' : ''), callback_data: 'vprov:google' }],
    [{ text: L(env, 'm1csnrtf', (GEM_STT_MODELS[sttIdx] || {}).name || st.sttModel || ''), callback_data: 'vstt' }],
    [{ text: L(env, 'm06mahyb'), callback_data: 'noop' }],
    ...GEM_TTS_MODELS.map((m, i) => [{ text: ((i === ttsIdx && st.voiceProv === 'google' ? '✅ ' : '') + m.name), callback_data: 'vmdl:' + i }]),
    [{ text: L(env, 'm0xcli33', page + 1, pages), callback_data: 'noop' }],
    ...GEM_VOICES.slice(page * per, (page + 1) * per).map((v) => [{ text: ((v === st.voiceName ? '✅ ' : '') + v), callback_data: 'vset:' + v }]),
    [
      { text: '◀️', callback_data: 'vvc:' + ((page - 1 + pages) % pages) },
      { text: (page + 1) + '/' + pages, callback_data: 'noop' },
      { text: '▶️', callback_data: 'vvc:' + ((page + 1) % pages) },
    ],
    [{ text: L(env, 'm19nob78', st.voiceReply ? L(env, 'm0vplg8q') : L(env, 'm13eyrx5')), callback_data: 'st:vr' }, { text: L(env, 'm0l67xhw'), callback_data: 'vtest' }],
    [{ text: L(env, 'm1t3qh5r'), callback_data: 'set' }, { text: '✖️', callback_data: 'close' }],
  ];
  await menuRender(env, budget, chatId, txt, kb, 'voice');
}

/* ═══════════ شخصیت‌ها 🎭 ═══════════ */
async function personaMenu(env, budget, chatId, uid) {
  const u = await getUser(env, uid);
  const kb = PERSONAS.map((p, i) => [{
    text: (u.st.persona === i ? '✅ ' : '') + p.icon + ' ' + p.name,
    callback_data: 'pc:' + i,
  }]);
  kb.push([{ text: L(env, 'm1pkxn1n'), callback_data: 'st:sys' }]);
  kb.push([{ text: L(env, 'm1v7msmb'), callback_data: 'home' }, { text: '✖️', callback_data: 'close' }]);
  const curP = pick(env, PERSONAS, PERSONAS_EN);
  const cur = curP[u.st.persona] || curP[0];
  const txt = L(env, 'm1rekgpu', cur.icon, esc(cur.name));
  await menuRender(env, budget, chatId, txt, kb, 'ps');
}

/* ═══════════ چت‌های چندگانه 🧵 ═══════════ */
async function threadsMenu(env, budget, chatId, uid) {
  const u = await getUser(env, uid);
  const kb = u.threads.slice(-14).map((t2) => [
    { text: (t2.id === u.thread ? '📍 ' : '') + esc(t2.name), callback_data: 'tsel:' + t2.id },
    ...(t2.id === 'main' ? [] : [{ text: '🗑', callback_data: 'tdel:' + t2.id }]),
  ]);
  kb.push([{ text: L(env, 'm1x98qhl'), callback_data: 'tnew' }]);
  kb.push([{ text: L(env, 'm1v7msmb'), callback_data: 'home' }, { text: '✖️', callback_data: 'close' }]);
  const cur = curThread(u);
  const txt = L(env, 'm0gr5cyj', esc(cur.name));
  await menuRender(env, budget, chatId, txt, kb, 'th');
}

/* ═══════════ کتابخانه پرامپت 📚 ═══════════ */
async function promptsMenu(env, budget, chatId, uid) {
  const u = await getUser(env, uid);
  const pl = u.pl || [];
  const kb = [];
  if (pl.length) {
    for (const p of pl.slice(-12)) kb.push([{ text: '▶️ ' + esc(p.n.slice(0, 30)), callback_data: 'pu:' + p.k }]);
    kb.push([{ text: L(env, 'm018lqkn'), callback_data: 'pdelall' }]);
  } else {
    kb.push([{ text: L(env, 'm0wrxgyd'), callback_data: 'noop' }]);
  }
  kb.push([{ text: L(env, 'm1efce1c'), callback_data: 'panew' }]);
  kb.push([{ text: L(env, 'm1v7msmb'), callback_data: 'home' }, { text: '✖️', callback_data: 'close' }]);
  const txt = L(env, 'm1rs4jo0', pl.length
      ? L(env, 'm1vokrzd')
      : L(env, 'm01ke8u3'));
  await menuRender(env, budget, chatId, txt, kb, 'pl');
}

/* ═══════════ مقایسه مدل‌ها ⚔️ ═══════════ */
async function compareMenu(env, budget, chatId, uid) {
  const cp = await kvGet(env, 'cp:' + uid, { on: false, pair: [CF_KNOWN[0].id, CF_KNOWN[1].id] });
  // سازگاری با داده قدیمی + canonical‌سازی جفت (upgradeCpPair در جای استفاده)
  if (!Array.isArray(cp.pair) || cp.pair.length !== 2 ||
      !String(cp.pair[0] || '').match(/^(@cf\/|p[0-9a-z]{8}:)/) || !String(cp.pair[1] || '').match(/^(@cf\/|p[0-9a-z]{8}:)/)) {
    cp.pair = [CF_KNOWN[0].id, CF_KNOWN[1].id];
    cp.on = false;
    await kvPut(env, 'cp:' + uid, cp);
  }
  const [ea, eb] = await upgradeCpPair(env, uid, cp);
  const txt =
    L(env, 'm1nk6vkl', cp.on ? L(env, 'm00tpw29') : L(env, 'm17zlr9p'), esc(ea.name), esc(ea.provName), esc(eb.name), esc(eb.provName));
  const kb = [
    [{ text: L(env, 'm1vh1eyb'), callback_data: 'cmplist:A:0' }, { text: L(env, 'm15i4frb'), callback_data: 'cmplist:B:0' }],
    cp.on ? [{ text: L(env, 'm12qi6ri'), callback_data: 'cmpoff' }] : [{ text: L(env, 'm1mboacc'), callback_data: 'cmpon' }],
    [{ text: L(env, 'm1v7msmb'), callback_data: 'home' }, { text: '✖️', callback_data: 'close' }],
  ];
  await menuRender(env, budget, chatId, txt, kb, 'cmp');
}

async function cmpPickModel(env, budget, chatId, slot, page) {
  const list = await getAllModelEntries(env);
  const per = CFG.PICK_PAGE;
  const pages = Math.max(1, Math.ceil(list.length / per));
  page = Math.max(0, Math.min(page || 0, pages - 1));
  const slice = list.slice(page * per, (page + 1) * per);
  const kb = slice.map((m) => [{ text: m.name + ' (' + Math.round(m.ctx / 1000) + 'K)' + (m.vision ? ' 👁' : '') + (m.prov === 'p' ? ' · ' + m.provName : ''), callback_data: 'cmpset:' + slot + ':' + hash32(m.key) }]);
  kb.push([
    { text: '◀️', callback_data: 'cmplist:' + slot + ':' + ((page - 1 + pages) % pages) },
    { text: (page + 1) + '/' + pages, callback_data: 'noop' },
    { text: '▶️', callback_data: 'cmplist:' + slot + ':' + ((page + 1) % pages) },
  ]);
  kb.push([{ text: L(env, 'm1v7msmb'), callback_data: 'cmp' }]);
  const txt = L(env, 'm1obvhrj', slot === 'A' ? L(env, 'm0qy9xpz') : L(env, 'm0xfju51'));
  await menuRender(env, budget, chatId, txt, kb, 'cmp');
}

/* ═══════════ آمار 📊 ═══════════ */
async function statsView(env, budget, chatId, uid) {
  const u = await getUser(env, uid);
  const t = tehran();
  const us = await kvGet(env, 'us:' + uid, {});
  const all = await kvGet(env, 'ua:' + uid, { msgs: 0, tin: 0, tout: 0 });
  const h = await histGet(env, scopeOf(chatId, u, false));
  const al = await kvGet(env, 'al', []);
  const saved = await kvList(env, 'sv:' + uid + ':');
  const txt =
    L(env, 'm10i38cb', num(us.d === t.ymd ? us.msgs || 0 : 0), num(us.d === t.ymd ? us.tin || 0 : 0), num(us.d === t.ymd ? us.tout || 0 : 0), u.st.dailyLimit ? L(env, 'm0p9r082') + num(u.st.dailyLimit) + 'K\n' : '', num(all.msgs || 0), num(all.tin || 0), num(all.tout || 0), num(h.msgs.length), num(saved.length), num((al.length || 0) + 1));
  const kb = [[{ text: L(env, 'm03pn5mm'), callback_data: 'ping' }], [{ text: L(env, 'm1v7msmb'), callback_data: 'home' }, { text: '✖️', callback_data: 'close' }]];
  await menuRender(env, budget, chatId, txt, kb, 'stats');
}

/* ═══════════ آرشیو پاسخ‌ها 📌 ═══════════ */
async function archiveMenu(env, budget, chatId, uid) {
  const keys = await kvList(env, 'sv:' + uid + ':');
  const items = [];
  for (const k of keys.slice(0, 40)) {
    const v = await kvGet(env, k, null);
    if (v) items.push({ k, q: v.q, t: v.t });
  }
  items.sort((a, b) => b.t - a.t);
  const kb = items.map((it) => [{ text: '📄 ' + esc(String(it.q).slice(0, 30)), callback_data: 'svview:' + it.k.slice(3) }]);
  if (!items.length) kb.push([{ text: L(env, 'm13yp1y4'), callback_data: 'noop' }]);
  else kb.push([{ text: L(env, 'm1ynfxqi'), callback_data: 'svdelall' }]);
  kb.push([{ text: L(env, 'm1v7msmb'), callback_data: 'home' }, { text: '✖️', callback_data: 'close' }]);
  const txt = L(env, 'm0xh3fro', num(items.length));
  await menuRender(env, budget, chatId, txt, kb, 'arch');
}

/* ═══════════ یادآورها ⏰ ═══════════ */
const WD_FA = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];

/* EN */
const WD_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function remindersMenu(env, budget, chatId, uid) {
  const rs = await kvList(env, 'rm:');
  const mine = [];
  for (const k of rs) {
    const v = await kvGet(env, k, null);
    if (v && v.uid === uid) mine.push({ k, ...v });
  }
  mine.sort((a, b) => a.at - b.at);
  const kb = [];
  for (const r of mine) {
    const d = new Date(r.at + 210 * 60000);
    kb.push([{
      text: '⏰ ' + (r.repeat === 'daily' ? '🔁 ' : '') + pick(env, WD_FA, WD_EN)[d.getUTCDay()] + ' ' + d.getUTCHours() + ':' + String(d.getUTCMinutes()).padStart(2, '0') + ' — ' + esc(String(r.txt).slice(0, 18)),
      callback_data: 'rmdel:' + hash32(r.k),
    }]);
  }
  if (!mine.length) kb.push([{ text: L(env, 'm10td73w'), callback_data: 'noop' }]);
  kb.push([{ text: L(env, 'm1dfp7h5'), callback_data: 'rmnew' }]);
  kb.push([{ text: L(env, 'm1v7msmb'), callback_data: 'home' }, { text: '✖️', callback_data: 'close' }]);
  const txt = L(env, 'm006t0tp', num(mine.length));
  await menuRender(env, budget, chatId, txt, kb, 'rmlist');
}

/* ═══════════════════ سلامت سرویس‌ها 🩺 ═══════════════════ */
async function healthCheck(env, budget, chatId) {
  const t0 = Date.now();
  const results = [];

  /* binding هوش مصنوعی: یک تست واقعی کوچک */
  const s = Date.now();
  if (env.AI && typeof env.AI.run === 'function') {
    try {
      await env.AI.run(CF_FALLBACK_MODEL, { messages: [{ role: 'user', content: 'ping' }], max_tokens: 1 });
      results.push(EMOJI.ok + ' <b>Workers AI</b> — <code>' + (Date.now() - s) + 'ms</code>');
    } catch (e) {
      results.push(EMOJI.err + ' <b>Workers AI</b> — ' + esc(String((e && e.message) || e).slice(0, 60)));
    }
  } else {
    results.push(L(env, 'm01d0e0j', EMOJI.err));
  }

  /* تلگرام */
  const s2 = Date.now();
  try {
    const res = await fetchT(TG_BASE + '/bot' + env.TELEGRAM_BOT_TOKEN + '/getMe', { method: 'POST' }, 10000);
    results.push(L(env, 'm0dytgkj', res.ok ? EMOJI.ok : EMOJI.err, res.ok ? '<code>' + (Date.now() - s2) + 'ms</code>' : 'HTTP <code>' + res.status + '</code>'));
  } catch {
    results.push(L(env, 'm0rugro2', EMOJI.err));
  }

  /* حافظه D1 (تنها حافظه‌ی ربات). اگر Binding نباشد، ربات بالا نمیآید و
     در لاگ خطا «D1 تنظیم نشده» می‌بینی — هیچ فالبک KV در کار نیست. */
  if (env.DB) {
    const s3 = Date.now();
    let dbok = false;
    try { await env.DB.prepare('SELECT 1 AS x').first(); dbok = true; } catch {}
    results.push(L(env, 'm1of23e6', dbok ? EMOJI.ok : EMOJI.err, dbok ? '<code>' + (Date.now() - s3) + 'ms</code>' : L(env, 'm0fao5nf')));
  } else {
    results.push(L(env, 'm082hgni', EMOJI.err));
  }
  const txt = L(env, 'm06cglwu', results.join('\n'), Date.now() - t0);
  const kb = [[{ text: L(env, 'm0wtzzqu'), callback_data: 'ping' }], [{ text: L(env, 'm0rifmvi'), callback_data: 'hpall' }], [{ text: L(env, 'm1v7msmb'), callback_data: 'home' }, { text: '✖️', callback_data: 'close' }]];
  await menuRender(env, budget, chatId, txt, kb, 'ping');
}

/* ── تست سلامت همه سرویس‌های کاستوم (v4.10) ──
   هر سرویس با یک درخواست کوچک واقعی chat/completions (max_tokens:1) چک میشود.
   تشخیص نوع خرابی (مطابق طبقه‌بندی aiChatOpenAi):
   • net  → آدرس پایه/اتصال خراب است
   • auth → کلید API رد شده
   • ok   → سرویس و کلید هر دو سالم
   کلید کاوش /models کافی نیست چون بعضی سرویس‌ها /models را بدون کلید معتبر
   جواب میدهند؛ اینجا همان مسیری که چت واقعاً می‌رود تست میشود. */
/* ── تست سلامت سرویس‌های کاستوم (v4.10) ──
   هر سرویس با یک درخواست واقعیِ کوچک chat/completions (max_tokens:1) چک میشود —
   دقیقاً همان مسیری که چت می‌رود، نه /models.
   دلیل: بعضی سرویس‌ها /models را بدون کلیدِ معتبر هم جواب میدهند، پس «سالم»
   بودنِ کاوش مدل دلیلی بر سالم‌بودن کلید چت نیست.

   خروجیِ طبقه‌بندی (مانند aiChatOpenAi):
   • ok   → سرویس و کلید هر دو کار میکنند
   • 401/403 → مشکل از کلید API است (باید عوض شود)
   • net  → مشکل از آدرس پایه (base URL) یا اتصال است
   • 404  → آدرس یا مدل ثبت‌شده پیدا نمیشود
   • 429  → کلید/سرویس سالم ولی سقف نرخ زده (چند کلید کمک میکند) */
async function provProbe(env, rec) {
  const keys = provKeysOf(rec);
  const models = rec.models || [];
  const t0 = Date.now();
  if (!rec.base) return { code: 'nobase', ms: 0, keys: keys.length };
  if (!keys.length) return { code: 'nokey', ms: 0, keys: 0 };
  if (!models.length) return { code: 'nomodel', ms: 0, keys: keys.length };
  const base = /\/v1$/.test(rec.base) ? rec.base : rec.base + '/v1';
  const url = base.replace(/\/+$/, '') + '/chat/completions';
  const body = J({ model: models[0].id, messages: [{ role: 'user', content: 'ping' }], max_tokens: 1, stream: false });
  let res;
  try {
    res = await fetchT(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + keys[0] },
      body,
    }, CFG.PROBE_TIMEOUT_MS);
  } catch (e) { return { code: 'net', ms: Date.now() - t0, keys: keys.length }; }
  const ms = Date.now() - t0;
  if (res.status === 401 || res.status === 403) return { code: 'auth', ms, keys: keys.length, http: res.status };
  if (res.status === 404) return { code: 'notfound', ms, keys: keys.length, http: 404 };
  if (res.status === 429) return { code: 'ratelimit', ms, keys: keys.length, http: 429 };
  if (res.status >= 500) return { code: 'up', ms, keys: keys.length, http: res.status };
  if (!res.ok) return { code: 'http', ms, keys: keys.length, http: res.status };
  return { code: 'ok', ms, keys: keys.length };
}

function provProbeLine(env, name, r, keyCount) {
  const n = num(keyCount);
  if (r.code === 'ok') return L(env, 'm0g9udyr', EMOJI.ok, esc(name), r.ms, keyCount > 1 ? ' · ' + n + L(env, 'm0kp7zwv') : '');
  if (r.code === 'nokey') return L(env, 'm1m42zdi', esc(name));
  if (r.code === 'nobase') return L(env, 'm03uh4lb', esc(name));
  if (r.code === 'nomodel') return L(env, 'm0gfqmzh', esc(name));
  if (r.code === 'auth') return L(env, 'm0n7i97l', EMOJI.err, esc(name), r.http);
  if (r.code === 'notfound') return L(env, 'm0p161cu', EMOJI.err, esc(name));
  if (r.code === 'ratelimit') return L(env, 'm00acb8y', esc(name), n);
  if (r.code === 'up') return L(env, 'm1cg57k3', EMOJI.err, esc(name), r.http, r.ms);
  if (r.code === 'http') return L(env, 'm10i3hsb', EMOJI.err, esc(name), r.http);
  return L(env, 'm0cq023g', EMOJI.err, esc(name), r.ms);
}

async function provHealthAll(env, budget, chatId) {
  const provs = await provAll(env);
  const kb = [[{ text: L(env, 'm0wtzzqu'), callback_data: 'hpall' }], [{ text: L(env, 'm1v7msmb'), callback_data: 'home' }, { text: '✖️', callback_data: 'close' }]];
  if (!provs.length) {
    const txt = L(env, 'm1crgumw');
    await menuRender(env, budget, chatId, txt, kb, 'hpall');
    return;
  }
  const t0 = Date.now();
  const lines = [];
  for (const rec of provs) {
    const r = await provProbe(env, rec);
    lines.push(provProbeLine(env, rec.name, r, provKeysOf(rec).length));
  }
  const okN = lines.filter((l) => l.indexOf(EMOJI.ok) === 0).length;
  const txt = L(env, 'm0o7ek39', lines.join('\n'), num(okN), num(lines.length), Date.now() - t0);
  await menuRender(env, budget, chatId, txt, kb, 'hpall');
}

/* ═══════════════════ کاربران مجاز 👥 ═══════════════════ */
async function usersMenu(env, budget, chatId) {
  const al = await kvGet(env, 'al', []);
  const names = await kvGet(env, 'aln', {});
  const kb = [];
  if (al.length) {
    for (const id of al) kb.push([{ text: '👤 ' + (names[id] || id), callback_data: 'usrdel:' + id }]);
    kb.push([{ text: L(env, 'm0kqkcfb'), callback_data: 'usrdelall' }]);
  } else {
    kb.push([{ text: L(env, 'm04m94qe'), callback_data: 'noop' }]);
  }
  kb.push([{ text: L(env, 'm1mlimxv'), callback_data: 'usradd' }]);
  kb.push([{ text: L(env, 'm1aw5brt'), callback_data: 'usrimgquota' }]);
  kb.push([{ text: L(env, 'm1v7msmb'), callback_data: 'home' }, { text: '✖️', callback_data: 'close' }]);
  const txt = L(env, 'm13s3u37');
  await menuRender(env, budget, chatId, txt, kb, 'usr');
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 18-export-backup
   خروجی گفتگو 📤 + بکاپ هفتگی 🗄
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ خروجی گفتگو 📤 و بکاپ 🗄 ═══════════════════ */
async function exportChat(env, budget, chatId, uid) {
  const u = await getUser(env, uid);
  const h = await histGet(env, scopeOf(chatId, u, false));
  if (!h.msgs.length) {
    try { await editMsg(env, budget, chatId, env._menuMsg, L(env, 'm1szivj4'), [[{ text: L(env, 'm1v7msmb'), callback_data: 'home' }]]); } catch {}
    return;
  }
  let out = L(env, 'm09ni6ew', curThread(u).name, VERSION, tehran().ymd, '─'.repeat(40));
  for (const m of h.msgs) out += (m.role === 'user' ? L(env, 'm0bap9el') : L(env, 'm0u2g2jv')) + String(m.content || '') + '\n\n';
  const fd = new FormData();
  fd.append('chat_id', String(chatId));
  fd.append('caption', L(env, 'm02iqbkx', curThread(u).name, num(h.msgs.length)));
  fd.append('document', new Blob([out], { type: 'text/plain; charset=utf-8' }), 'chat-' + tehran().ymd + '.txt');
  try { await tg(env, budget, 'sendDocument', null, fd); } catch (e) { await logErr(env, 'export', e); }
}

async function backupMenu(env, budget, chatId, uid) {
  const txt = L(env, 'm077phq3');
  const kb = [
    [{ text: L(env, 'm0qdhhin'), callback_data: 'bkchats' }, { text: L(env, 'm0giln1r'), callback_data: 'bkset' }],
    [{ text: L(env, 'm1lyveyk'), callback_data: 'bkprov' }],
    [{ text: L(env, 'm02srs8j'), callback_data: 'bkmem' }],
    [{ text: L(env, 'm090xhe3'), callback_data: 'bkall' }],
    [{ text: L(env, 'm13rx1cf'), callback_data: 'bkget' }],
    [{ text: L(env, 'm1yy8oao'), callback_data: 'bkres' }],
  ];
  await menuRender(env, budget, chatId, txt, kb, 'bkup');
}

/* ── پشتیبان‌گیری انتخابی به فرمت TXT (v4.10) ──
   چرا txt جدا از بکاپ JSON: فایل JSON برای «بازگرداندن در ربات» است، ولی
   برای مطالعه/آرشیو در جای دیگر قابل‌استفاده نیست. اینجا هر بخش در یک فایل
   متنی ساده تحویل میشود.

   ⚠️ کلیدهای API: فقط بخش «سرویس‌ها» کلید واقعی را داخل فایل می‌گذارد —
   چون هدف کاربر دقیقاً همین است (نقل‌کلید بین سرویس‌ها). این فایل را همان‌طور
   که کلید را در پیام‌ها نمی‌فرستیم، اینجا هم صریح هشدار میدهیم. بقیهٔ بخش‌ها
   هیچ کلیدی ندارند. */
function bkTxtHeader(env, title) {
  const t = tehran();
  return L(env, 'm1x9y5vp', txtSafe(title), t.ymd, VERSION, '═'.repeat(46));
}
function txtSafe(s) { return String(s || '').replace(/[\r\n]+/g, ' ').slice(0, 60); }

async function backupTxtSend(env, budget, chatId, fname, content, caption) {
  const fd = new FormData();
  fd.append('chat_id', String(chatId));
  fd.append('caption', caption || L(env, 'm1xi9ykb', fname));
  fd.append('document', new Blob([content], { type: 'text/plain; charset=utf-8' }), fname);
  try { await tg(env, budget, 'sendDocument', null, fd); } catch (e) { await logErr(env, 'bk_txt', e); }
}

// گفتگوهای همهٔ ترد به‌صورت متن خوانا
async function backupChatsTxt(env, budget, chatId, uid) {
  const u = await getUser(env, uid);
  let out = bkTxtHeader(env, L(env, 'm1wezh0o'));
  for (const t of u.threads) {
    const h = await histGet(env, 'c' + chatId + ':' + t.id);
    if (!h.msgs.length) continue;
    out += L(env, 'm0pcmij0', t.name || t.id, num(h.msgs.length));
    for (const m of h.msgs) {
      out += (m.role === 'user' ? L(env, 'm0y549rx') : L(env, 'm1jhgi3v')) + ':\n' + String(m.content || '') + '\n\n';
    }
    out += '\n';
  }
  await backupTxtSend(env, budget, chatId, 'chats-' + tehran().ymd + '.txt', out, L(env, 'm1a5ofxs', tehran().ymd));
}

async function backupSettingsTxt(env, budget, chatId, uid) {
  const u = await getUser(env, uid);
  const s = u.st;
  const out = L(env, 'm02v5mwr', bkTxtHeader(env, L(env, 'm1vez5kd')), s.model, (pick(env, PERSONAS, PERSONAS_EN)[s.persona] || pick(env, PERSONAS, PERSONAS_EN)[0]).name, s.temperature, s.maxTokens, s.dailyLimit ? s.dailyLimit + L(env, 'm06cgnqj') : L(env, 'm1yk76a9'), s.autoFallback ? L(env, 'm0vplg8q') : L(env, 'm13eyrx5'), s.liveStream ? L(env, 'm0vplg8q') : L(env, 'm13eyrx5'), s.readLinks ? L(env, 'm0vplg8q') : L(env, 'm13eyrx5'), s.autoVision ? L(env, 'm0vplg8q') : L(env, 'm13eyrx5'), s.voiceReply ? L(env, 'm0vplg8q') : L(env, 'm13eyrx5'), s.searchAuto ? L(env, 'm0vplg8q') : L(env, 'm13eyrx5'), s.briefing ? L(env, 'm0vplg8q') : L(env, 'm13eyrx5'), s.imgGen === false ? L(env, 'm13eyrx5') : L(env, 'm0vplg8q'), s.imgModel || CFG.IMG_MODEL_DEFAULT, s.voiceProv === 'cf' ? L(env, 'm0zji1xq') : L(env, 'm1t25ozt'), s.voiceName || 'Kore', s.ttsModel || '', s.sttModel || '', s.imgModel || CFG.IMG_MODEL_DEFAULT, s.cbBreaker === false ? L(env, 'm13eyrx5') : L(env, 'm0vplg8q'), s.ytSum === false ? L(env, 'm13eyrx5') : L(env, 'm0vplg8q'), s.sysCustom ? L(env, 'm1bh0mq8') + s.sysCustom : L(env, 'm0pcopcc'));
  await backupTxtSend(env, budget, chatId, 'behrad-settings-' + tehran().ymd + '.txt', out, L(env, 'm10bndpe'));
}

/* سرویس‌ها + کلیدهایشان. این تنها بخشی است که کلید API را عیناً داخل فایل
   می‌گذارد — دقیقاً چیزی که برای نقل‌کلید لازم است. */
async function backupProvidersTxt(env, budget, chatId) {
  const provs = await provAll(env);
  let out = L(env, 'm1o0d33d', bkTxtHeader(env, L(env, 'm0aqi32i')));
  if (!provs.length) out += L(env, 'm02lrd99');
  for (const p of provs) {
    const keys = provKeysOf(p);
    out += '── ' + (p.name || p.pid) + ' ──\n';
    out += 'base_url: ' + (p.base || '—') + '\n';
    /* 🔧 v5.4: قبلاً کلید خام در فایل نوشته می‌شد و با قاعدهٔ «کلیدها همه‌جا
       ماسک و از بکاپ خارج» جور نبود. حالا فقط اثر انگشت (۴+۴ کاراکتر) می‌آید. */
    out += L(env, 'm1vllml2', keys.length, CFG.KEYS_PER_PROVIDER);
    keys.forEach((k, i) => { out += '  ' + (i + 1) + '. ' + maskKey(k) + '\n'; });
    out += L(env, 'm0txn918', (p.models || []).length);
    for (const m of (p.models || [])) {
      out += '  - ' + m.id + (m.ctx ? L(env, 'm16emhxl', Math.round(m.ctx / 1000)) : '') + (m.vision ? ' 👁' : '') + '\n';
    }
    out += '\n';
  }
  out += L(env, 'm0c9vplc', '═'.repeat(46));
  await backupTxtSend(env, budget, chatId, 'providers-' + tehran().ymd + '.txt', out, L(env, 'm0ewqfzt'));
}

// حافظه، یادآورها، آرشیو و پرامپت‌ها
async function backupMemTxt(env, budget, chatId, uid) {
  const u = await getUser(env, uid);
  let out = bkTxtHeader(env, L(env, 'm0ygw84s'));

  const mem = await kvGet(env, 'mem:' + uid, []);
  out += L(env, 'm1fm62qv', (mem || []).length);
  if (!(mem || []).length) out += L(env, 'm15p0q5y');
  (mem || []).forEach((m, i) => { out += (i + 1) + '. ' + String(m.t || m) + '\n'; });
  out += L(env, 'm1afmx6s');
  let rmN = 0;
  for (const k of await kvList(env, 'rm:')) {
    const v = await kvGet(env, k, null);
    if (!v || String(v.uid) !== String(uid)) continue;
    rmN++;
    const at = new Date((v.at || 0) + 210 * 60000);
    out += L(env, 'm1vkjfrw', at.getUTCHours(), String(at.getUTCMinutes()).padStart(2, '0'), v.repeat === 'daily' ? L(env, 'm15kn5cf') : '', String(v.txt || ''));
  }
  if (!rmN) out += L(env, 'm15p0q5y');

  out += L(env, 'm0yce6zh');
  const sv = await kvList(env, 'sv:' + uid + ':');
  if (!sv.length) out += L(env, 'm15p0q5y');
  for (const k of sv) {
    const v = await kvGet(env, k, null);
    if (v) out += '• ' + String(v.q || '') + '\n' + String(v.a || '') + '\n\n';
  }

  out += L(env, 'm09fpshh');
  if (!(u.pl || []).length) out += L(env, 'm15p0q5y');
  (u.pl || []).forEach((p, i) => { out += (i + 1) + '. [' + (p.k || L(env, 'm033g8c0')) + '] ' + (p.v || '') + '\n\n'; });

  await backupTxtSend(env, budget, chatId, 'memory-' + tehran().ymd + '.txt', out, L(env, 'm1rg8et5'));
}

// همهٔ بخش‌ها در یک فایل (کلیدها را هم دارد)
async function backupAllTxt(env, budget, chatId, uid) {
  const u = await getUser(env, uid);
  let out = bkTxtHeader(env, L(env, 'm1v3tg8a'));
  out += L(env, 'm1et921v');

  out += L(env, 'm0pruoaf', JSON.stringify(u.st, null, 2));

  out += L(env, 'm01nr5yu');
  for (const p of await provAll(env)) {
    out += p.name + ' | ' + (p.base || '') + '\n';
    provKeysOf(p).forEach((k, i) => { out += L(env, 'm0hu0lri', i + 1, maskKey(k)); });
    (p.models || []).forEach((m) => { out += L(env, 'm0p7vbmf', m.id); });
    out += '\n';
  }

  out += L(env, 'm13baz7k');
  for (const t of u.threads) {
    const h = await histGet(env, 'c' + chatId + ':' + t.id);
    if (!h.msgs.length) continue;
    out += '── ' + (t.name || t.id) + ' ──\n';
    for (const m of h.msgs) out += (m.role === 'user' ? L(env, 'm0pnadnz') : L(env, 'm0unnej5')) + ': ' + String(m.content || '').replace(/\n+/g, ' | ') + '\n';
    out += '\n';
  }

  const mem = await kvGet(env, 'mem:' + uid, []);
  out += L(env, 'm1damvlh');
  (mem || []).forEach((m) => { out += '• ' + String(m.t || m) + '\n'; });
  out += L(env, 'm0nds0ge');
  (u.pl || []).forEach((p) => { out += '[' + (p.k || '') + '] ' + (p.v || '') + '\n'; });

  out += L(env, 'm14rvopo');
  for (const k of await kvList(env, 'rm:')) {
    const v = await kvGet(env, k, null);
    if (!v || String(v.uid) !== String(uid)) continue;
    out += L(env, 'm0qz0gx5', String(v.txt || ''), v.at, String(v.repeat || 'none'));
  }

  await backupTxtSend(env, budget, chatId, 'behrad-full-' + tehran().ymd + '.txt', out, L(env, 'm016idmf'));
}

async function backupGet(env, budget, chatId, uid) {
  const dump = {};
  for (const pre of ['u:' + uid, 'us:' + uid, 'ua:' + uid]) dump[pre] = await kvGet(env, pre, null);
  dump.threads_hist = {};
  const u = await getUser(env, uid);
  for (const t of u.threads) dump.threads_hist[t.id] = await histGet(env, 'c' + chatId + ':' + t.id);
  dump.saved = {};
  for (const k of await kvList(env, 'sv:' + uid + ':')) dump.saved[k] = await kvGet(env, k, null);
  dump.reminders = {};
  for (const k of await kvList(env, 'rm:')) {
    const v = await kvGet(env, k, null);
    if (v && v.uid === uid) dump.reminders[k] = v;
  }
  // v4.9: حافظه بلندمدت، ویجت‌ها و جفت مقایسه هم در بکاپ — قبلاً جا مانده بود
  // و «دریافت بکاپ» خاطره‌ها و ویجت‌ها را از بین می‌برد.
  dump.memory = await kvGet(env, 'mem:' + uid, null);
  dump.widgets = await kvGet(env, 'wg:' + uid, null);
  dump.compare = await kvGet(env, 'cp:' + uid, null);
  /* v5.4: تودو و تسک‌های زمان‌بندی‌شده — بدون این‌ها بازیابی، تودوها را
     بی‌صدا پاک می‌کرد (همان اشتباهی که یک‌بار برای حافظه پیش آمد). */
  dump.todo = await kvGet(env, 'todo:' + uid, null);
  dump.tasks = {};
  for (const tk of await taskList(env, uid)) dump.tasks['task:' + uid + ':' + tk.id] = tk;
  dump._meta = { v: VERSION, at: new Date().toISOString(), uid, scope: 'c' + chatId };
  const contentFinal = J(dump);
  const fd = new FormData();
  fd.append('chat_id', String(chatId));
  fd.append('caption', L(env, 'm0matpor'));
  fd.append('document', new Blob([contentFinal], { type: 'application/json' }), 'ai-bot-backup-' + tehran().ymd + '.json');
  try { await tg(env, budget, 'sendDocument', null, fd); } catch (e) { await logErr(env, 'backup', e); }
  return { ok: true, content: contentFinal };
}

async function backupRestore(env, budget, chatId, uid, jsonText) {
  let dump;
  try { dump = JSON.parse(String(jsonText || '')); } catch { throw new Error(L(env, 'm12u9zyd')); }
  if (!dump || typeof dump !== 'object' || Array.isArray(dump)) throw new Error(L(env, 'm077i9hw'));
  /* ⚠️ کلیدها باید عیناً همان‌هایی باشند که backupGet می‌سازد: u:<uid> / us:<uid> / ua:<uid>.
     قبلاً اینجا دنبال dump.u می‌گشتیم و dump['u:'] را می‌خواندیم — در حالی که backupGet
     هرگز dump.u را نمی‌سازد؛ یعنی بازیابی یک بکاپِ سالم هم همیشه «ساختار نامشخص» می‌داد
     و حتی اگر می‌گذشت، هیچ تنظیمات/آماری برنمی‌گشت. */
  const uKey = 'u:' + uid, usKey = 'us:' + uid, uaKey = 'ua:' + uid;
  const rec = dump[uKey] || dump.u;
  if (!dump._meta || !rec || typeof rec !== 'object' || Array.isArray(rec)) {
    throw new Error(L(env, 'm1o9k8vs', uKey));
  }
  /* ⚠️ امنیت: کلیدهای داخل فایل را کاربر می‌نویسد، پس نباید مستقیم به D1 بروند.
     فقط کلیدهایی که متعلق به همین کاربرند پذیرفته میشوند — وگرنه یک JSON
     دست‌کاری‌شده می‌توانست رکورد کاربر دیگر، لیست مجاز یا سرویس‌ها را بنویسد. */
  const ownSv = 'sv:' + uid + ':';
  const okTid = /^[A-Za-z0-9_-]{1,40}$/;
  await kvPut(env, uKey, dump[uKey] || rec);
  if (dump[usKey]) await kvPut(env, usKey, dump[usKey]);
  if (dump[uaKey]) await kvPut(env, uaKey, dump[uaKey]);
  if (dump.threads_hist && typeof dump.threads_hist === 'object') {
    for (const tid of Object.keys(dump.threads_hist)) {
      if (!okTid.test(tid)) continue;
      await histPut(env, 'c' + chatId + ':' + tid, dump.threads_hist[tid]);
    }
  }
  for (const k of Object.keys(dump.saved || {})) {
    if (!k.startsWith(ownSv)) continue;
    await kvPut(env, k, dump.saved[k]);
  }
  for (const k of Object.keys(dump.reminders || {})) {
    const v = dump.reminders[k];
    if (!k.startsWith('rm:')) continue;
    if (!v || typeof v !== 'object' || String(v.uid) !== String(uid)) continue;
    await kvPut(env, k, v);
  }
  // v4.9: بازگردانی حافظه/ویجت/مقایسه (اگر در بکاپ تازه باشند)
  if (dump.memory) await kvPut(env, 'mem:' + uid, dump.memory);
  if (dump.widgets) await kvPut(env, 'wg:' + uid, dump.widgets);
  if (dump.compare) await kvPut(env, 'cp:' + uid, dump.compare);
  /* 🔧 v5.4: تودو و تسک‌ها هم در بکاپ هستند و باید برگردند — وگرنه
     بازیابی، تودوهای فعلی را با نسخهٔ قدیمی جایگزین/پاک می‌کرد.
     کلیدها فقط وقتی پذیرفته می‌شوند که دقیقاً مال همین کاربر باشند. */
  if (Array.isArray(dump.todo)) {
    const clean = dump.todo.filter((x) => x && typeof x.t === 'string').slice(-CFG.TODO_MAX)
      .map((x) => ({ id: String(x.id || ('d' + hash32(x.t + Math.random()))).slice(0, 24), t: String(x.t).slice(0, CFG.TODO_TEXT_MAX), done: !!x.done, ts: +x.ts || Date.now() }));
    await kvPut(env, 'todo:' + uid, clean);
  }
  if (dump.tasks && typeof dump.tasks === 'object') {
    const ownTask = 'task:' + uid + ':';
    for (const k of Object.keys(dump.tasks)) {
      if (!k.startsWith(ownTask)) continue;
      const v = dump.tasks[k];
      if (!v || typeof v !== 'object' || !v.prompt || String(v.uid) !== String(uid)) continue;
      await taskSave(env, v);
    }
  }
  return true;
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 19-dashboard
   وب‌داشبورد 🌐 + API پشت داشبورد
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ وب‌داشبورد 🌐 ═══════════════════ */
const DASH_CSS = [
  '*{box-sizing:border-box;margin:0;padding:0}',
  "body{font-family:'Segoe UI',Tahoma,sans-serif;background:#0f1117;color:#e2e4ea;direction:rtl;min-height:100vh}",
  '.wrap{max-width:860px;margin:0 auto;padding:24px 16px 60px}',
  'h1{font-size:1.35rem;margin-bottom:4px}',
  '.sub{color:#8b90a0;font-size:.85rem;margin-bottom:20px}',
  '.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin-top:16px}',
  '.card{background:#181b25;border:1px solid #2a2e3d;border-radius:14px;padding:18px}',
  '.card h3{font-size:.98rem;margin-bottom:10px}',
  '.big{font-size:1.45rem;font-weight:700;color:#a78bfa}',
  '.row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #232736;font-size:.88rem}',
  '.row:last-child{border-bottom:none}',
  "button{background:#7c3aed;color:#fff;border:none;border-radius:9px;padding:9px 18px;font-family:inherit;font-size:.87rem;cursor:pointer}",
  'button:hover{background:#8b5cf6}',
  'button.gray{background:#2a2e3d}',
  "input,select{width:100%;background:#10131c;border:1px solid #2a2e3d;color:#e2e4ea;border-radius:9px;padding:10px;font-family:inherit;font-size:.9rem;margin-top:6px}",
].join('\n');

function dashLoginPage(env, err) {
  return L(env, 'm01abs39', DASH_CSS, err ? '<div class="sub" style="color:#f87171;margin-top:10px">' + err + '</div>' : '');
}

/* توکن داشبورد: رشته تصادفی در کوکی HttpOnly + همان در D1 با عمر ۳۰ روز */
function dashCookieTok(req) {
  const c = req.headers.get('Cookie') || '';
  const m = /(?:^|;\s*)dsh=([A-Fa-f0-9]{16,})/.exec(c);
  return m ? m[1] : '';
}
async function dashAuthed(env, req) {
  const t = dashCookieTok(req);
  if (!t) return false;
  return !!(await kvGet(env, 'dsk:' + t, null));
}
async function dashRateLimited(env, req) {
  const ip = String(req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || 'na')
    .split(',')[0].trim().slice(0, 64) || 'na';
  const lk = 'lg:' + hash32(ip);
  const W = CFG.LOGIN_WINDOW_S * 1000;
  const now = Date.now();
  const cnt = await kvGet(env, lk, { n: 0, ts: 0 });
  const fresh = cnt.ts && (now - cnt.ts) < W;
  return { ok: !(cnt.n >= CFG.LOGIN_MAX_TRY && fresh), lk, n: fresh ? cnt.n : 0, ts: fresh ? cnt.ts : now, W, now };
}

function dashAppPage(env) {
  const js = L(env, 'm1n9q4z9');
  return L(env, 'm1jgwrok', DASH_CSS, js);
}

/* ═══════════════════ API پشت داشبورد 🌐 ═══════════════════ */
function jsonRes(obj, status = 200) {
  return new Response(J(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}

async function dashApiHandler(env, req) {
  const u = new URL(req.url);
  const pw = env.DASHBOARD_PASSWORD || '';
  if (!pw) return jsonRes({ error: L(env, 'm1b0wm64') }, 503);
  /* احراز هویت با کوکی نشست (نه ?t= رمز در URL) */
  if (!(await dashAuthed(env, req))) return jsonRes({ error: 'unauthorized' }, 401);

  const uid = String(env.ADMIN_ID);
  let body = {};
  try { body = await req.json(); } catch {}
  const uu = await getUser(env, uid);
  const scopeMain = 'c' + env._dashChat + ':main';

  if (u.pathname === '/api/state') {
    const t0 = tehran();
    const us = await kvGet(env, 'us:' + uid, {});
    const h = await histGet(env, scopeMain);
    const errs = await kvGet(env, 'lg', []);
    const entries = await getAllModelEntries(env);
    const curEntry = await resolveModel(env, uu.st.model);
    return jsonRes({
      version: VERSION,
      modelName: curEntry.name,
      provLabel: curEntry.prov === 'cf' ? L(env, 'm05vbixl') : '🔌 ' + curEntry.provName,
      ctxK: Math.round(curEntry.ctx / 1000),
      model: curEntry.key,
      temperature: uu.st.temperature,
      maxTokens: uu.st.maxTokens,
      dailyLimit: uu.st.dailyLimit,
      today: {
        msgs: us.d === t0.ymd ? us.msgs || 0 : 0,
        tin: us.d === t0.ymd ? us.tin || 0 : 0,
        tout: us.d === t0.ymd ? us.tout || 0 : 0,
      },
      hasAiBinding: !!(env.AI && typeof env.AI.run === 'function'),
      hasDb: !!env.DB,
      webhook: env._whInfo || L(env, 'm001frqm'),
      histLen: h.msgs.length,
      models: entries.map((m) => ({ key: m.key, label: m.name + ' (' + Math.round(m.ctx / 1000) + 'K)', prov: m.prov === 'cf' ? 'Workers AI' : m.provName })),
      providers: (await provAll(env)).map((r) => ({ name: r.name, n: (r.models || []).length, base: r.base, keyMask: maskKey(r.key) })),
      errors: errs.slice(0, 10),
    });
  }

  if (u.pathname === '/api/settings') {
    const st = uu.st;
    if (typeof body.temperature === 'number') st.temperature = Math.min(2, Math.max(0, body.temperature));
    if (typeof body.maxTokens === 'number') st.maxTokens = Math.min(8192, Math.max(256, Math.round(body.maxTokens)));
    if (typeof body.dailyLimit === 'number') st.dailyLimit = Math.min(100000, Math.max(0, Math.round(body.dailyLimit)));
    if (typeof body.model === 'string' && body.model) {
      // مدل باید کلید canonical معتبر باشد (کلادفلر با مدارای قبلی؛ کاستوم باید سرویس موجود باشد)
      const cm = await canonModel(env, body.model);
      if (cm.changed && !String(body.model).startsWith('@cf/')) return jsonRes({ ok: false, error: 'bad_model' });
      st.model = cm.key;
    }
    if (body.clearHist) await histPut(env, scopeMain, { msgs: [], used: 0 });
    await putUser(env, uid, uu);
    return jsonRes({ ok: true });
  }

  if (u.pathname === '/api/ping') {
    const out = {};
    /* Workers AI */
    const s = Date.now();
    let aiok = false;
    try {
      if (env.AI && typeof env.AI.run === 'function') {
        await env.AI.run(CF_FALLBACK_MODEL, { messages: [{ role: 'user', content: 'ping' }], max_tokens: 1 });
        aiok = true;
      }
    } catch {}
    out.workersai = aiok ? Date.now() - s : false;
    /* تلگرام */
    const s2 = Date.now();
    let tgok = false;
    try { tgok = (await fetchT(TG_BASE + '/bot' + env.TELEGRAM_BOT_TOKEN + '/getMe', { method: 'POST' }, 8000)).ok; } catch {}
    out.telegram = tgok ? Date.now() - s2 : false;
    return jsonRes(out);
  }

  if (u.pathname === '/api/exporttxt') {
    const h = await histGet(env, scopeMain);
    let out = L(env, 'm04u1206', tehran().ymd, '─'.repeat(40));
    for (const m of h.msgs) out += (m.role === 'user' ? L(env, 'm1drkjyx') : L(env, 'm0jfrd9p')) + String(m.content || '') + '\n\n';
    return new Response(out, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Disposition': 'attachment; filename="chat.txt"' },
    });
  }

  return jsonRes({ error: 'not_found' }, 404);
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 20-cron
   خلاصهٔ صبحگاهی + Cron (یادآور/هشدار مدل جدید) ⏰
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ v4.5: خلاصه صبحگاهی ۱۰ تهران ═══════════════════ */
async function sendMorningBriefing(env, uid, chatId) {
  const budget = newBudget(10);
  try {
    const u = await getUser(env, uid);
    if (u.st && u.st.briefing === false) return;
    // یادآورهای امروز همین کاربر
    const keys = await kvList(env, 'rm:');
    const mine = [];
    for (const k of keys) {
      const v = await kvGet(env, k, null);
      if (v && v.uid === uid) mine.push(v);
    }
    mine.sort((a, b) => a.at - b.at);
    const t = tehran();
    const todayLines = mine.slice(0, 10).map((r) => {
      const d = new Date(r.at + 210 * 60000);
      return '- ' + d.getUTCHours() + ':' + String(d.getUTCMinutes()).padStart(2, '0') + ' ' + r.txt + (r.repeat === 'daily' ? L(env, 'm15kn5cf') : '');
    });
    let wx = '';
    try { wx = await toolWeather(env); } catch (e) { wx = L(env, 'm0snzrp4'); }
    let mem = '';
    try { mem = await memText(env, uid); } catch {}
    const ctxMsg = L(env, 'm19l14ca', todayLines.length ? todayLines.join('\n') : L(env, 'm0mukgq6'), wx, mem ? L(env, 'm1ecmit3') + mem : '');
    let summary = '';
    try {
      const r = await aiChatCf(env, CF_FALLBACK_MODEL, [
        { role: 'system', content: L(env, 'm1c9h1d6', buildSystemPrompt(u.st)) },
        { role: 'user', content: L(env, 'm0n3mzk9', t.ymd, ctxMsg) },
      ], { temperature: 0.7, maxTokens: 900 });
      summary = String((r && r.text) || '');
    } catch (e) { summary = ''; }
    const body = L(env, 'm1rk4h7r', t.ymd, summary ? mdToHtml(summary) : esc(ctxMsg), mine.length);
    const parts = chunkText(body);
    for (const p of parts) await sendMsg(env, budget, chatId, p);
  } catch (e) { await logErr(env, 'brief', e); }
}

/* ═══════════════════ Cron: یادآور ⏰ + هشدار مدل جدید 🔔 ═══════════════════ */
async function cronTick(env) {
  /* یادآورهای سررسیده (v4.5: تکرار روزانه scheduling مجدد) */
  const now = Date.now();
  const keys = await kvList(env, 'rm:');
  for (const k of keys) {
    const r = await kvGet(env, k, null);
    if (!r) continue;
    if (r.at > now) continue;
    const rep = r.repeat || 'none';
    if (rep === 'daily' || rep === 'weekly' || rep === 'interval' || rep === 'monthly') {
      const dd = new Date(r.at + 210 * 60000);
      if (rep === 'monthly') {
        /* 🔧 v5.4: اگر یادآور مدتی اجرا نشده باشد (ورکر خواب/خطا)، یک بار
           جلو بردن ماه هنوز در گذشته می‌ماند و همان لحظه دوباره شلیک می‌شد.
           حالا تا رسیدن به آینده جلو می‌رود (سقف ۶۰ پرش). */
        let guardM = 0;
        r.at = nextMonthEpoch(dd.getUTCFullYear(), dd.getUTCMonth() + 1, r.day || dd.getUTCDate(), dd.getUTCHours(), dd.getUTCMinutes());
        while (r.at <= now && guardM++ < 60) {
          const nd = new Date(r.at + 210 * 60000);
          r.at = nextMonthEpoch(nd.getUTCFullYear(), nd.getUTCMonth() + 1, r.day || nd.getUTCDate(), nd.getUTCHours(), nd.getUTCMinutes());
        }
      } else {
        const stepDays = rep === 'weekly' ? 7 : rep === 'interval' ? Math.max(1, r.step || 1) : 1;
        r.at = r.at + stepDays * 86400000;
        while (r.at <= now) r.at += stepDays * 86400000;
      }
      await kvPut(env, k, r, Math.max(60, Math.ceil((r.at - Date.now()) / 1000) + 300));
    } else {
      await kvDel(env, k);
    }
    if (!r.chat) continue;
    const b = newBudget(5);
    try {
      await sendMsg(env, b, r.chat, L(env, 'm0u0w588', rep !== 'none' ? ' ' + repeatLabel(env, rep) : '', esc(r.txt)));
    } catch (e) { await logErr(env, 'remind', e); }
  }

  /* جاروب کلیدهای منقضی — D1 انقضای خودکار ندارد؛ ساعتی یکبار کافی است
     (هر دقیقه اجرا شود بی‌دلیل سطر می‌خواند و سهمیه مصرف میشود) */
  if (env.DB && tehran().min === 0) {
    try { await env.DB.prepare('DELETE FROM kv WHERE exp > 0 AND exp < ?').bind(Date.now()).run(); } catch {}
  }

  /* خلاصه صبحگاهی — ساعت ۱۰ تهران، روزی یکبار برای هر کاربر فعال */
  try {
    const bt = tehran();
    if (bt.h === CFG.BRIEF_HOUR && bt.min < 2) {
      const flag = await kvGet(env, 'brflag', {});
      if (flag.d !== bt.ymd) {
        await kvPut(env, 'brflag', { d: bt.ymd }, 172800);
        const targets = [];
        try {
          const adminU = String(env.ADMIN_ID || '');
          if (adminU) {
            const au = await getUser(env, adminU);
            const ac = (au && au.lastChat) || env.ADMIN_ID;
            if (au.st.briefing !== false) targets.push({ uid: adminU, chat: ac });
          }
        } catch {}
        try {
          const al = await kvGet(env, 'al', []);
          for (const id of al || []) {
            try {
              const uu = await getUser(env, String(id));
              if (uu.st.briefing === false) continue;
              if (uu.lastChat) targets.push({ uid: String(id), chat: uu.lastChat });
            } catch {}
          }
        } catch {}
        for (const tg of targets.slice(0, 20)) {
          try { await sendMorningBriefing(env, tg.uid, tg.chat); } catch (e) { await logErr(env, 'brief_send', e); }
        }
      }
    }
  } catch (e) { await logErr(env, 'brief_cron', e); }

  /* ⏳ تسک‌های زمان‌بندی‌شده با AI — هر task که at آن رسیده باشد یک بار
     اجرا و دوباره زمان‌بندی (یا حذف) میشود. کلیدها زیر task:<uid>: هستند
     و چون هر کاربر کلید خودش را دارد، پیمایش همه برای cron لازم است. */
  try {
    const tks = await kvList(env, 'task:');
    for (const k of tks) {
      const t = await kvGet(env, k, null);
      if (!t || !t.prompt || !t.at || t.at > now) continue;
      const nb = newBudget(8);
      /* زمان بعدی را قبل از اجرا حساب کن تا خطای مدل باعث تکرار بی‌پایان نشود */
      const rep = t.repeat || 'once';
      const dd = new Date(t.at + 210 * 60000);
      let next = 0;
      if (rep === 'daily') next = t.at + 86400000;
      else if (rep === 'weekly') next = t.at + 7 * 86400000;
      else if (rep === 'interval') next = t.at + Math.max(1, t.step || 1) * 86400000;
      else if (rep === 'monthly') next = nextMonthEpoch(dd.getUTCFullYear(), dd.getUTCMonth() + 1, t.day || dd.getUTCDate(), dd.getUTCHours(), dd.getUTCMinutes());
      if (next) {
        /* 🔧 v5.4: قبلاً برای ماهانه، داخل حلقه دوباره از همان dd حساب
           میشد و اگر یک ماه هم عقب بود، مقدار عوض نمیشد → حلقهٔ بی‌پایان
           و قطع ورکر. الان ماه‌به‌ماه جلو می‌رود و سقف ۶۰ پرش دارد. */
        let guard = 0;
        while (next <= now && guard++ < 60) {
          if (rep === 'monthly') {
            const nd = new Date(next + 210 * 60000);
            next = nextMonthEpoch(nd.getUTCFullYear(), nd.getUTCMonth() + 1, t.day || nd.getUTCDate(), nd.getUTCHours(), nd.getUTCMinutes());
          } else next += (rep === 'weekly' ? 7 : rep === 'interval' ? Math.max(1, t.step || 1) : 1) * 86400000;
        }
        t.at = next;
        await taskSave(env, t);
      } else {
        await kvDel(env, k);
      }
      /* اجرای پرامپت — با مدل کاربر یا مدل امن کلادفلر */
      let out = '';
      try {
        const tu = await getUser(env, t.uid);
        const r = await aiChat(env, (tu.st && tu.st.model) || SETTINGS_DEFAULT.model, [
          { role: 'system', content: L(env, 'm0cnnfaw', buildSystemPrompt(tu.st || SETTINGS_DEFAULT)) },
          { role: 'user', content: String(t.prompt).slice(0, CFG.TASK_PROMPT_MAX) },
        ], { temperature: 0.7, maxTokens: CFG.TASK_OUT_TOKENS, ...cbOff(tu.st) }, null);
        out = String((r && r.text) || '').trim();
      } catch (e) {
        await logErr(env, 'task_run:' + t.id, e);
        out = '';
      }
      if (!out) out = L(env, 'm1qiiekg');
      try {
        const parts = chunkText(mdToHtml(L(env, 'm1mfpwzn', rep !== 'once' ? ' ' + repeatLabel(env, rep) : '', out)));
        for (const p of parts) await sendMsg(env, nb, t.chat, p);
      } catch (e) { await logErr(env, 'task_send', e); }
    }
  } catch (e) { await logErr(env, 'task_cron', e); }

  /* 🗄 بکاپ خودکار هفتگی — یک بار در هفته فایل JSON را به Saved Messages
     ADMIN_ID می‌فرستد تا بکاپ از خودِ D1 هم بیرون بماند. */
  try {
    const bt = tehran();
    const dow = new Date(bt.y, bt.m - 1, bt.d).getDay(); // 0=یکشنبه
    if (bt.h === CFG.BK_AUTO_HOUR && bt.min < 2 && dow === CFG.BK_AUTO_DOW) {
      const flag = await kvGet(env, 'bkflag', {});
      if (flag.d !== bt.ymd) {
        await kvPut(env, 'bkflag', { d: bt.ymd }, 172800);
        const au = await getUser(env, String(env.ADMIN_ID));
        if (au.st.weeklyBackup !== false) {
          const dump = await backupGet(env, newBudget(10), env.ADMIN_ID, String(env.ADMIN_ID));
          if (dump && dump.content) {
            const b2 = newBudget(10);
            const fd = new FormData();
            fd.append('chat_id', String(env.ADMIN_ID));
            fd.append('caption', L(env, 'm19imdx9', bt.ymd));
            fd.append('document', new Blob([dump.content], { type: 'application/json' }), 'behrad-backup-' + bt.ymd + '.json');
            try { await tg(env, b2, 'sendDocument', null, fd); } catch (e) { await logErr(env, 'bk_auto', e); }
          }
        }
      }
    }
  } catch (e) { await logErr(env, 'bk_cron', e); }

  /* هشدار مدل جدید — روزی یک بار، حدود ۹ صبح به وقت تهران
     (ساعت/دقیقه را همین‌جا عوض کنی؛ فقط مدل‌های کلادفلر بررسی میشوند —
     سرویس‌های کاستوم هرگز از cron پولی نمی‌شوند و فقط دستی کاوش میشوند) */
  const t = tehran();
  if (t.h !== 9 || t.min >= 2) return;

  const flag = await kvGet(env, 'mkflag', {});
  if (flag.d === t.ymd) return; // امروز انجام شد
  await kvPut(env, 'mkflag', { d: t.ymd }, 172800);

  const known = await kvGet(env, 'mk', null);
  let ids = [];
  try { ids = await fetchCfChatModels(env); } catch {}
  if (!ids.length) return;
  const cur = {};
  for (const id of ids) cur[id] = 1;
  await kvPut(env, 'mk', cur);

  if (!known) return; // اولین اجرا فقط ثبت میکند
  const added = Object.keys(cur).filter((x) => !known[x]);
  if (!added.length) return;

  const adminChat = env.ADMIN_ID;
  const b2 = newBudget(10);
  const lines = added.slice(0, 12).map((x) => '• <code>' + esc(x) + '</code>');
  try {
    await sendMsg(env, b2, adminChat,
      L(env, 'm1fxo1jq', EMOJI.spark, lines.join('\n')));
  } catch (e) { await logErr(env, 'newmodel', e); }
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 21-webapp-api
   لایهٔ API اپ اندروید + دارایی‌های UI (APP_ASSETS در همین‌جاست)
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ اپ اندروید — لایه API و دارایی‌های UI (v4.7) ═══════════════════
   ورود با رمز داشبورد → توکن ۳۰ روزه در D1 (atk:) · scope همان تلگرام:
   c<ADMIN_ID>:<threadId> یعنی تاریخچه مشترک با ربات. */
const APP_ASSETS = {"app-core.js":{"t":"text/javascript; charset=utf-8","b":"/* ═══════════════════════════════════════════════════════════════\n   Behrad AI — هسته: وضعیت، API، SSE، مارک‌داون، افکت‌ها\n   ═══════════════════════════════════════════════════════════════ */\n'use strict';\n\n/* ─── وضعیت سراسری ─── */\nconst S = {\n  token: '',\n  screen: 'chat',\n  stack: [],                 // سابقه اسکرین‌ها برای دکمه بازگشت\n  settings: {},\n  threads: [],\n  thread: 'main',\n  models: [],\n  currentModel: {},\n  personas: [],\n  providers: [],\n  usage: {},\n  flags: {},\n  memCount: 0,\n  memMax: 50,\n  hist: [],                   // تاریخچه اسکرین چت (پیام‌های سرور)\n  busy: false,                // در حال دریافت پاسخ\n  rec: null,                  // وضعیت ضبط ویس\n  attaches: [],               // عکس‌های آماده‌ارسال {b64, mime}\n  fileAtt: null,              // فایل متنی آماده‌ارسال {name, text}\n  locale: 'fa',\n  theme: 'abyss',\n  layout: 'classic',\n  toastN: 0,\n};\n\nconst $ = (id) => document.getElementById(id);\nconst $ = (sel, root) => Array.from((root || document).querySelectorAll(sel));\nconst THEMES = ['abyss', 'jade', 'ember', 'storm'];\nconst THEME_NAMES = new Proxy({}, { get: (_, k) => t('theme.' + k) });\nconst THEME_DESC = new Proxy({}, { get: (_, k) => t('theme.' + k + '.desc') });\nconst THEME_DOTS = {\n  abyss: ['#38BDF8', '#34D399', '#F87171'],\n  jade: ['#34D399', '#38BDF8', '#D97706'],\n  ember: ['#F87171', '#60A5FA', '#D97706'],\n  storm: ['#60A5FA', '#FB8090', '#0EA5E9'],\n};\nconst LAYOUTS = ['classic', 'immersive', 'bento'];\nconst LAYOUT_NAMES = new Proxy({}, { get: (_, k) => t('layout.' + k) });\nconst LAYOUT_DESC = new Proxy({}, { get: (_, k) => t('layout.' + k + '.desc') });\n\n/* ─── ابزارها ─── */\nconst esc = (s) => String(s == null ? '' : s)\n  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')\n  .replace(/\"/g, '&quot;').replace(/'/g, '&#39;');\n\nfunction haptic(ms) {\n  try {\n    if (window.Android && Android.vibrate) Android.vibrate(ms || 12);\n  } catch (e) {}\n}\n\nfunction nowHM() {\n  const d = new Date();\n  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');\n}\n\nfunction toast(msg, type) {\n  const el = document.createElement('div');\n  el.className = 'toast ' + (type || '');\n  el.textContent = msg;\n  $('toasts').appendChild(el);\n  haptic(type === 'err' ? 40 : 14);\n  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 420); }, 2400);\n}\n\n/* ریپل لمس روی دکمه‌ها */\ndocument.addEventListener('pointerdown', (e) => {\n  const b = e.target.closest('.btn, .dock-item, .tb-btn, .c-btn, .mini-btn, .b-card, .go, .pick, .v-chip');\n  if (!b) return;\n  const r = b.getBoundingClientRect();\n  const sp = document.createElement('span');\n  sp.className = 'ripple';\n  const d = Math.max(r.width, r.height);\n  sp.style.width = sp.style.height = d + 'px';\n  sp.style.left = (e.clientX - r.left - d / 2) + 'px';\n  sp.style.top = (e.clientY - r.top - d / 2) + 'px';\n  b.appendChild(sp);\n  setTimeout(() => sp.remove(), 640);\n});\n\n/* ─── اینست‌ها (از اندروید) ─── */\nwindow.__setInsets = function (arr) {\n  if (!Array.isArray(arr)) return;\n  const r = document.documentElement.style;\n  r.setProperty('--it', (arr[0] || 0) + 'px');\n  r.setProperty('--ib', (arr[1] || 0) + 'px');\n  r.setProperty('--il', (arr[2] || 0) + 'px');\n  r.setProperty('--ir', (arr[3] || 0) + 'px');\n};\ntry {\n  if (window.Android && Android.getInsets) window.__setInsets(JSON.parse(Android.getInsets()));\n} catch (e) {}\n\n/* ─── تم و چیدمان ─── */\n/* ── زبانِ رابط (fa/en) — پس از تغییر، کلِ صفحه بازرند می‌شود ── */\nfunction setLocale(l, save) {\n  S.locale = (l === 'en') ? 'en' : 'fa';\n  if (save) { try { localStorage.setItem('locale', S.locale); } catch (e) {} }\n  applyLocale();\n  if (typeof renderScreen === 'function') renderScreen(S.screen);\n  if (typeof renderDock === 'function') renderDock();\n  if (typeof renderChips === 'function') try { renderChips(); } catch (e) {}\n}\nfunction applyTheme(t, save) {\n  if (THEMES.indexOf(t) < 0) t = 'abyss';\n  S.theme = t;\n  document.documentElement.setAttribute('data-theme', t);\n  const mc = document.querySelector('meta[name=\"theme-color\"]');\n  const cols = { abyss: '#050B14', jade: '#04120E', ember: '#130709', storm: '#07090F' };\n  if (mc) mc.setAttribute('content', cols[t] || '#050B14');\n  if (save) { try { localStorage.setItem('theme', t); } catch (e) {} }\n}\nfunction applyLayout(l, save) {\n  if (LAYOUTS.indexOf(l) < 0) l = 'classic';\n  S.layout = l;\n  document.documentElement.setAttribute('data-layout', l);\n  if (save) { try { localStorage.setItem('layout', l); } catch (e) {} }\n  renderDock();\n}\nfunction nextTheme() {\n  const i = THEMES.indexOf(S.theme);\n  applyTheme(THEMES[(i + 1) % THEMES.length], true);\n  toast(W(\"تم: \") + THEME_NAMES[S.theme]);\n  haptic(18);\n  if (S.screen === 'home' || S.screen === 'settings') renderScreen(S.screen);\n}\n\n/* ─── مارک‌داون سبک (همان خروجی mdToHtml ورکر) ─── */\nfunction mdRender(src) {\n  let s = String(src == null ? '' : src);\n  const blocks = [];\n  // کدهای چندخطی را موقت بیرون بکش\n  s = s.replace(/```([\\w+-]*)\\n?([\\s\\S]*?)```/g, (m, lang, code) => {\n    blocks.push({ lang: lang || '', code: code.replace(/\\n$/, '') });\n    return '\\u0000CODE' + (blocks.length - 1) + '\\u0000';\n  });\n  s = esc(s);\n  s = s.replace(/`([^`\\n]+)`/g, '<code>$1</code>');\n  s = s.replace(/^\\s*&gt;\\s?(.*)$/gm, '<blockquote>$1</blockquote>');\n  s = s.replace(/^\\s*---+\\s*$/gm, '<hr>');\n  s = s.replace(/^######\\s+(.*)$/gm, '<h3>$1</h3>');\n  s = s.replace(/^#####\\s+(.*)$/gm, '<h3>$1</h3>');\n  s = s.replace(/^####\\s+(.*)$/gm, '<h3>$1</h3>');\n  s = s.replace(/^###\\s+(.*)$/gm, '<h3>$1</h3>');\n  s = s.replace(/^##\\s+(.*)$/gm, '<h2>$1</h2>');\n  s = s.replace(/^#\\s+(.*)$/gm, '<h1>$1</h1>');\n  s = s.replace(/\\*\\*\\*([^*]+)\\*\\*\\*/g, '<b><i>$1</i></b>');\n  s = s.replace(/\\*\\*([^*]+)\\*\\*/g, '<b>$1</b>');\n  s = s.replace(/(^|[^*\\w])\\*([^*\\n]+)\\*(?=[^*\\w]|$)/g, '$1<i>$2</i>');\n  s = s.replace(/~~([^~\\n]+)~~/g, '<s>$1</s>');\n  s = s.replace(/\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\s)]+)\\)/g,\n    '<a href=\"$2\" target=\"_blank\" rel=\"noopener\">$1</a>');\n  s = s.replace(/(^|[\\s(])((?:https?:\\/\\/)[^\\s<)]+)/g, '$1<a href=\"$2\" target=\"_blank\" rel=\"noopener\">$2</a>');\n  // لیست‌ها\n  s = s.replace(/(?:^|\\n)((?:[ \\t]*[-*+][ \\t]+.*(?:\\n|$))+)/g, (m, list) => {\n    const items = list.trim().split('\\n').map((li) => '<li>' + li.replace(/^[ \\t]*[-*+][ \\t]+/, '') + '</li>').join('');\n    return '\\n<ul>' + items + '</ul>';\n  });\n  s = s.replace(/(?:^|\\n)((?:[ \\t]*\\d+\\.[ \\t]+.*(?:\\n|$))+)/g, (m, list) => {\n    const items = list.trim().split('\\n').map((li) => '<li>' + li.replace(/^[ \\t]*\\d+\\.[ \\t]+/, '') + '</li>').join('');\n    return '\\n<ol>' + items + '</ol>';\n  });\n  // پاراگراف\n  s = s.split(/\\n{2,}/).map((p) => {\n    p = p.trim();\n    if (!p) return '';\n    if (/^<(h1|h2|h3|ul|ol|blockquote|hr|pre)/.test(p)) return p;\n    return '<p>' + p.replace(/\\n/g, '<br>') + '</p>';\n  }).join('\\n');\n  // کدها را برگردان\n  s = s.replace(/\\u0000CODE(\\d+)\\u0000/g, (m, i) => {\n    const b = blocks[+i];\n    const safe = esc(b.code);\n    return '<pre data-code=\"' + encodeURIComponent(b.code) + '\"><button class=\"copy-btn\">کپی</button>' +\n      '<code>' + safe + '</code></pre>';\n  });\n  return s;\n}\n\n/* ─── API ─── */\nconst API = {\n  async req(path, opt) {\n    opt = opt || {};\n    const headers = Object.assign({}, opt.headers || {});\n    if (S.token) headers['Authorization'] = 'Bearer ' + S.token;\n    let body = opt.body;\n    if (body != null && !(body instanceof FormData) && typeof body !== 'string') {\n      headers['Content-Type'] = 'application/json';\n      body = JSON.stringify(body);\n    }\n    let res;\n    try {\n      res = await fetch(path, { method: opt.method || 'GET', headers: headers, body: body });\n    } catch (e) {\n      throw { message: W(\"شبکه در دسترس نیست — اینترنت را چک کنید.\") };\n    }\n    if (res.status === 401) { showLogin(); throw { message: W(\"نشست منقضی شد — دوباره وارد شوید.\") }; }\n    const ct = res.headers.get('content-type') || '';\n    if (ct.indexOf('application/json') >= 0) {\n      const js = await res.json();\n      if (!res.ok) throw { message: js.error || (W(\"خطای \") + res.status) };\n      return js;\n    }\n    if (!res.ok) throw { message: W(\"خطای \") + res.status };\n    return res;\n  },\n  get(path) { return this.req(path); },\n  post(path, body) { return this.req(path, { method: 'POST', body: body }); },\n\n  /* چت جریانی (SSE روی POST) */\n  async chat(body, onEvent) {\n    const headers = { 'Content-Type': 'application/json' };\n    if (S.token) headers['Authorization'] = 'Bearer ' + S.token;\n    let res;\n    try {\n      res = await fetch('/api/v1/chat', { method: 'POST', headers: headers, body: JSON.stringify(body) });\n    } catch (e) { throw { message: W(\"شبکه در دسترس نیست.\") }; }\n    if (res.status === 401) { showLogin(); throw { message: W(\"نشست منقضی شد.\") }; }\n    if (!res.ok) {\n      let msg = W(\"خطای \") + res.status;\n      try { const j = await res.json(); if (j.error) msg = j.error; } catch (e) {}\n      throw { message: msg };\n    }\n    const reader = res.body.getReader();\n    const dec = new TextDecoder();\n    let buf = '';\n    for (;;) {\n      const r = await reader.read();\n      if (r.done) break;\n      buf += dec.decode(r.value, { stream: true });\n      let idx;\n      while ((idx = buf.indexOf('\\n\\n')) >= 0) {\n        const chunk = buf.slice(0, idx);\n        buf = buf.slice(idx + 2);\n        if (chunk.slice(0, 6) !== 'data: ') continue;\n        let ev;\n        try { ev = JSON.parse(chunk.slice(6)); } catch (e) { continue; }\n        onEvent(ev);\n      }\n    }\n  },\n};\n\n/* ─── ورود ─── */\nfunction showLogin() {\n  const l = $('login');\n  if (!l.hidden) return;\n  $('loginSt').textContent = '';\n  $('loginSt').className = 'status';\n  $('loginOrigin').textContent = location.origin;\n  l.hidden = false;\n  const card = l.querySelector('.card');\n  card.style.animation = 'none';\n  void card.offsetWidth;\n  card.style.animation = '';\n  setTimeout(() => $('loginPw').focus(), 450);\n}\nfunction hideLogin() { $('login').hidden = true; }\n\nasync function doLogin() {\n  const pw = $('loginPw').value;\n  if (!pw) { const s = $('loginSt'); s.className = 'status err'; s.textContent = W(\"رمز را وارد کنید.\"); return; }\n  const go = $('loginGo');\n  go.disabled = true;\n  const s = $('loginSt');\n  s.className = 'status';\n  s.textContent = W(\"در حال ورود ...\");\n  try {\n    const r = await API.post('/api/v1/login', { password: pw });\n    S.token = r.token;\n    try { localStorage.setItem('tk', S.token); } catch (e) {}\n    if (window.Android && Android.saveConfig) {\n      try { Android.saveConfig(location.origin, S.token); } catch (e) {}\n    }\n    s.className = 'status ok';\n    s.textContent = W(\"خوش آمدی ✅\");\n    $('loginPw').value = '';\n    setTimeout(async () => { hideLogin(); await bootState(true); }, 500);\n  } catch (e) {\n    s.className = 'status err';\n    s.textContent = e.message || W(\"ورود ناموفق بود.\");\n  } finally { go.disabled = false; }\n}\n\n/* ─── مسیریاب اسکرین‌ها ─── */\nconst SCREEN_TABS = { chat: 'chat', widgets: 'widgets', threads: 'threads', reminders: 'reminders', settings: 'settings', home: 'home' };\nconst SCREEN_TITLES = {\n  chat: '', widgets: W(\"ویجت‌ها\"), threads: W(\"گفتگوها\"), reminders: W(\"یادآورها\"), memory: W(\"حافظه بلندمدت\"),\n  voice: W(\"استودیو صدا\"), settings: W(\"تنظیمات\"), stats: W(\"آمار و مصرف\"), home: W(\"خانه\"),\n};\n\nfunction go(name, opts) {\n  opts = opts || {};\n  if (name === S.screen && !opts.force) return;\n  const cur = document.querySelector('.screen.on');\n  const nxt = document.querySelector('.screen[data-screen=\"' + name + '\"]');\n  if (!nxt) return;\n  if (cur && cur !== nxt) {\n    cur.classList.remove('on');\n    cur.classList.add('leaving');\n    setTimeout(() => cur.classList.remove('leaving'), 480);\n  }\n  if (!opts.back && SCREEN_TABS[name] !== S.screen && !SCREEN_TABS[S.screen]) S.stack.push(S.screen);\n  if (!opts.back && SCREEN_TABS[name]) S.stack = [];\n  S.screen = name;\n  nxt.classList.add('on');\n  // هدر\n  const isChat = name === 'chat';\n  $('tbBrand').hidden = !isChat;\n  $('scrTitle').hidden = isChat;\n  $('scrTitle').textContent = SCREEN_TITLES[name] || '';\n  $('backBtn').hidden = isChat || !!SCREEN_TABS[name];\n  $('statsBtn').hidden = !isChat;\n  renderDock();\n  renderScreen(name);\n  haptic(10);\n  // پارالاکس هدر روی اسکرین‌های اسکرول‌دار\n  const body = nxt.querySelector('.scr-body, .msgs');\n  if (body) body.scrollTop = nxt.dataset.scroll ? +nxt.dataset.scroll : body.scrollTop;\n}\n\nfunction goBack() {\n  const prev = S.stack.pop() || 'chat';\n  go(prev, { back: true });\n}\n\nfunction renderScreen(name) {\n  try {\n    if (name === 'threads') renderThreads();\n    else if (name === 'memory') renderMemory();\n    else if (name === 'reminders') renderReminders();\n    else if (name === 'settings') renderSettings();\n    else if (name === 'voice') renderVoice();\n    else if (name === 'stats') renderStats();\n    else if (name === 'home') renderBento();\n    else if (name === 'widgets') renderWidgets();\n    else if (name === 'chat') updateModelChip();\n  } catch (e) { console.error('render', name, e); }\n}\n\n/* ─── داک ─── */\nfunction renderDock() {\n  const dock = $('dock');\n  let items;\n  if (S.layout === 'bento') {\n    items = [\n      { tab: 'home', ic: '🏠', lb: W(\"خانه\") },\n      { tab: 'chat', ic: '💬', lb: W(\"چت\") },\n      { tab: 'widgets', ic: '🧩', lb: W(\"ویجت‌ها\") },\n      { tab: 'threads', ic: '🗂', lb: W(\"گفتگوها\") },\n      { tab: 'reminders', ic: '⏰', lb: W(\"یادآور\") },\n      { tab: 'settings', ic: '⚙️', lb: W(\"تنظیمات\") },\n    ];\n  } else if (S.layout === 'immersive') {\n    items = [\n      { tab: 'chat', ic: '💬', lb: W(\"چت\") },\n      { tab: 'widgets', ic: '🧩', lb: W(\"ویجت‌ها\") },\n      { tab: 'threads', ic: '🗂', lb: W(\"گفتگوها\") },\n      { tab: 'memory', ic: '🧠', lb: W(\"حافظه\") },\n      { tab: 'settings', ic: '⚙️', lb: W(\"تنظیمات\") },\n    ];\n  } else {\n    items = [\n      { tab: 'chat', ic: '💬', lb: W(\"چت\") },\n      { tab: 'widgets', ic: '🧩', lb: W(\"ویجت‌ها\") },\n      { tab: 'threads', ic: '🗂', lb: W(\"گفتگوها\") },\n      { tab: 'reminders', ic: '⏰', lb: W(\"یادآور\") },\n      { tab: 'voice', ic: '🎙', lb: W(\"صدا\") },\n      { tab: 'settings', ic: '⚙️', lb: W(\"تنظیمات\") },\n    ];\n  }\n  const active = SCREEN_TABS[S.screen] || (S.screen === 'chat' ? 'chat' : '');\n  dock.innerHTML = items.map((it) =>\n    '<button class=\"dock-item' + (it.tab === active ? ' on' : '') + '\" data-tab=\"' + it.tab + '\">' +\n    '<span class=\"di-ic\">' + it.ic + '</span><span class=\"di-lb\">' + it.lb + '</span></button>'\n  ).join('');\n}\n\n/* ─── اسکرین‌ها: لود اولیه وضعیت ─── */\nasync function bootState(fast) {\n  const st = await API.get('/api/v1/state');\n  S.settings = st.settings || {};\n  S.threads = st.threads || [];\n  S.thread = st.thread || (S.threads[0] && S.threads[0].id) || 'main';\n  S.models = st.models || [];\n  S.currentModel = st.currentModel || {};\n  S.personas = st.personas || [];\n  S.providers = st.providers || [];\n  S.usage = st.usage || {};\n  S.flags = st.flags || {};\n  S.memCount = st.memCount || 0;\n  S.memMax = st.memMax || 50;\n  S.version = st.version || '';\n  S.briefHour = st.briefHour;\n  S.gemModels = st.gemModels || null; // لیست واقعی مدل‌های TTS/STT/تصویر از سرور\n  updateModelChip();\n  renderDock();\n  renderScreen(S.screen);\n  if (!fast) loadHistory();\n  try { loadWidgets(); } catch (e) {}\n}\n\nfunction updateModelChip() {\n  const m = S.currentModel || {};\n  const txt = (m.label || m.name || W(\"مدل\")).replace(/\\s+/g, ' ');\n  $('modelChipText').textContent = txt;\n}\n\n/* ─── راه‌اندازی ─── */\nasync function boot() {\n  // تم/چیدمان ذخیره‌شده\n  try {\n    setLocale(localStorage.getItem('locale') || 'fa', false);\n    applyTheme(localStorage.getItem('theme') || 'abyss', false);\n    applyLayout(localStorage.getItem('layout') || 'classic', false);\n  } catch (e) { applyTheme('abyss', false); applyLayout('classic', false); }\n\n  // توکن از هش (هنگام ورود از اپ یا مرورگر)\n  if (location.hash.indexOf('#tk=') === 0) {\n    const tk = decodeURIComponent(location.hash.slice(4));\n    if (tk) { S.token = tk; try { localStorage.setItem('tk', tk); } catch (e) {} }\n    history.replaceState(null, '', location.pathname + location.search);\n  } else {\n    try { S.token = localStorage.getItem('tk') || ''; } catch (e) {}\n  }\n\n  // وایر بخش‌ها\n  wireChat();\n  wireThreads();\n  wireMemory();\n  wireReminders();\n  wireSettings();\n  wireVoice();\n  wireBento();\n  wireWidgets();\n  wireLogin();\n  $('themeBtn').addEventListener('click', nextTheme);\n  $('statsBtn').addEventListener('click', () => go('stats'));\n  $('backBtn').addEventListener('click', goBack);\n  $('dock').addEventListener('click', (e) => {\n    const it = e.target.closest('.dock-item');\n    if (it) go(it.dataset.tab);\n  });\n  $('modelChip').addEventListener('click', openModelsSheet);\n  wireSheets();\n\n  // اسپلش حداقل ۹۰۰ms برای دیدن انیمیشن ورود\n  const t0 = Date.now();\n  let ok = false;\n  if (S.token) {\n    try { await bootState(); ok = true; } catch (e) { ok = false; }\n  }\n  const wait = Math.max(0, 950 - (Date.now() - t0));\n  setTimeout(() => {\n    $('splash').classList.add('off');\n    setTimeout(() => { $('splash').style.display = 'none'; }, 750);\n    $('app').hidden = false;\n    if (ok) {\n      go('chat', { force: true });\n      if (S.layout === 'bento') { go('home', { force: true }); }\n    } else {\n      showLogin();\n    }\n  }, wait);\n}\n\ndocument.addEventListener('DOMContentLoaded', boot);\n"},"app-i18n.js":{"t":"text/javascript; charset=utf-8","b":"/* ═══════════════════════════════════════════════════════════════\n   Behrad AI — i18n (Persian / English)\n   هر متن با کلیدِ پایدار در I18N است؛ t('key') متنِ زبانِ جاری را می‌دهد.\n   زبان از S.locale می‌آید ('fa' پیش‌فرض). جهتِ صفحه هم از همین می‌آید.\n   ═══════════════════════════════════════════════════════════════ */\n'use strict';\n\nconst I18N = {\n  /* ── عمومی ── */\n  'app.title': { fa: 'هوش مصنوعی', en: 'AI' },\n  'common.ok': { fa: 'باشه', en: 'OK' },\n  'common.cancel': { fa: 'لغو', en: 'Cancel' },\n  'common.save': { fa: 'ذخیره', en: 'Save' },\n  'common.delete': { fa: 'حذف', en: 'Delete' },\n  'common.edit': { fa: 'ویرایش', en: 'Edit' },\n  'common.close': { fa: 'بستن', en: 'Close' },\n  'common.back': { fa: 'بازگشت', en: 'Back' },\n  'common.loading': { fa: 'در حال بارگذاری…', en: 'Loading…' },\n  'common.none': { fa: 'هیچ', en: 'None' },\n  'common.on': { fa: 'روشن', en: 'On' },\n  'common.off': { fa: 'خاموش', en: 'Off' },\n  'common.copy': { fa: 'کپی', en: 'Copy' },\n  'common.copied': { fa: 'کپی شد', en: 'Copied' },\n  'common.retry': { fa: 'تلاش دوباره', en: 'Retry' },\n  'common.search': { fa: 'جستجو', en: 'Search' },\n  'common.empty': { fa: 'چیزی نیست', en: 'Nothing here' },\n\n  /* ── ورود ── */\n  'login.pw': { fa: 'رمز ورود', en: 'Password' },\n  'login.go': { fa: 'ورود', en: 'Sign in' },\n  'login.change': { fa: 'آدرس ورکر عوض شده؟ تغییر بده', en: 'Worker address changed? Change it' },\n  'login.wrong': { fa: 'رمز اشتباه است', en: 'Wrong password' },\n  'login.wait': { fa: 'در حال بررسی…', en: 'Checking…' },\n\n  /* ── ناوبری ── */\n  'nav.chat': { fa: 'گفتگو', en: 'Chat' },\n  'nav.home': { fa: 'خانه', en: 'Home' },\n  'nav.settings': { fa: 'تنظیمات', en: 'Settings' },\n  'nav.memory': { fa: 'حافظه', en: 'Memory' },\n  'nav.tasks': { fa: 'کارها', en: 'Tasks' },\n  'nav.stats': { fa: 'آمار', en: 'Stats' },\n\n  /* ── تم‌ها ── */\n  'theme.abyss': { fa: 'اقیانوس تاریک', en: 'Dark Ocean' },\n  'theme.jade': { fa: 'زمرد شب', en: 'Night Jade' },\n  'theme.ember': { fa: 'عنابی داغ', en: 'Hot Ember' },\n  'theme.storm': { fa: 'طوفان', en: 'Storm' },\n  'theme.abyss.desc': { fa: 'آبی تیره با درخشش سبز — کلاسیک و شیشه‌ای', en: 'Deep blue with green glow — classic glass' },\n  'theme.jade.desc': { fa: 'سبز زمردی با لبه آبی — تازه و آرام', en: 'Emerald green with a blue edge — fresh and calm' },\n  'theme.ember.desc': { fa: 'قرمز عنابی با هاله آتش — جسورانه', en: 'Deep red with a fire halo — bold' },\n  'theme.storm.desc': { fa: 'سرمه‌ای و قرمز دوگانه — سینمایی', en: 'Navy and red dual tone — cinematic' },\n\n  /* ── چیدمان ── */\n  'layout.classic': { fa: 'کلاسیک', en: 'Classic' },\n  'layout.immersive': { fa: 'غوطه‌ور', en: 'Immersive' },\n  'layout.bento': { fa: 'خانه هوشمند', en: 'Smart Home' },\n  'layout.classic.desc': { fa: 'نوار پایین + هدر بالا — آشنا و مرتب', en: 'Bottom bar + top header — familiar and tidy' },\n  'layout.immersive.desc': { fa: 'تمام‌صفحه با دکمه‌های شناور شیشه‌ای', en: 'Full screen with floating glass buttons' },\n  'layout.bento.desc': { fa: 'خانه با کارت‌های بزرگ و زنده', en: 'Home with large live cards' },\n\n  /* ── چت ── */\n  'chat.empty.title': { fa: 'شروع گفتگو', en: 'Start a chat' },\n  'chat.empty.sub': { fa: 'هر چی بخواهی همین‌جاست: جستجوی وب، هوا، یادآور، ویس و حافظه بلندمدت.<br>با <code>/</code> دستورها را ببین — مثل تلگرام، ولی شیشه‌ای‌تر ✨', en: 'Everything you need is right here: web search, weather, reminders, voice and long-term memory.<br>Type <code>/</code> to see the commands — like Telegram, only more glassy ✨' },\n  'chat.placeholder': { fa: 'بنویس یا بگو…', en: 'Type or speak…' },\n  'chat.send': { fa: 'ارسال', en: 'Send' },\n  'chat.thinking': { fa: 'در حال فکر…', en: 'Thinking…' },\n  'chat.attach': { fa: 'پیوست', en: 'Attach' },\n  'chat.mic': { fa: 'ویس', en: 'Voice' },\n  'chat.newThread': { fa: 'گفتگوی تازه', en: 'New chat' },\n  'chat.threads': { fa: 'گفتگوها', en: 'Chats' },\n  'chat.rename': { fa: 'تغییر نام', en: 'Rename' },\n  'chat.clear': { fa: 'پاک کردن', en: 'Clear' },\n\n  /* ── تنظیمات ── */\n  'set.title': { fa: 'تنظیمات', en: 'Settings' },\n  'set.general': { fa: 'عمومی', en: 'General' },\n  'set.language': { fa: 'زبان', en: 'Language' },\n  'set.language.desc': { fa: 'زبان رابط و پاسخ‌های ربات', en: 'Interface and bot reply language' },\n  'set.theme': { fa: 'ظاهر', en: 'Appearance' },\n  'set.theme.desc': { fa: 'تم رنگ و چیدمان', en: 'Color theme and layout' },\n  'set.model': { fa: 'مدل', en: 'Model' },\n  'set.model.desc': { fa: 'مدل هوش مصنوعیِ فعال', en: 'Active AI model' },\n  'set.persona': { fa: 'شخصیت', en: 'Persona' },\n  'set.persona.desc': { fa: 'لحن و رفتار دستیار', en: 'Assistant tone and behavior' },\n  'set.temp': { fa: 'خلاقیت', en: 'Creativity' },\n  'set.temp.desc': { fa: '۰ دقیق، ۱ خلاق (پیش‌فرض ۰٫۸)', en: '0 precise, 1 creative (default 0.8)' },\n  'set.maxTokens': { fa: 'طول پاسخ', en: 'Reply length' },\n  'set.maxTokens.desc': { fa: 'سقف توکن هر پاسخ', en: 'Token cap per reply' },\n  'set.voice': { fa: 'صدا', en: 'Voice' },\n  'set.voice.desc': { fa: 'خواندن پاسخ‌ها و مدل صدا', en: 'Read replies aloud and voice model' },\n  'set.tools': { fa: 'ابزارها', en: 'Tools' },\n  'set.tools.desc': { fa: 'تصویر، جستجو، یادآور و حافظه', en: 'Images, search, reminders and memory' },\n  'set.sysCustom': { fa: 'پرامپت سیستمی', en: 'System prompt' },\n  'set.sysCustom.desc': { fa: 'دستور اضافه برای مدل', en: 'Extra instruction for the model' },\n  'set.saved': { fa: 'ذخیره شد', en: 'Saved' },\n\n  /* ── حافظه ── */\n  'mem.title': { fa: 'حافظه بلندمدت', en: 'Long-term memory' },\n  'mem.add': { fa: 'افزودن', en: 'Add' },\n  'mem.add.hint': { fa: 'چیزی که باید یادم بماند…', en: 'Something I should remember…' },\n  'mem.empty': { fa: 'هنوز چیزی نسپرده‌ای', en: 'Nothing saved yet' },\n  'mem.count': { fa: '%1 از %2', en: '%1 of %2' },\n\n  /* ── کارها ── */\n  'todo.title': { fa: 'تودولیست', en: 'To-do list' },\n  'todo.empty': { fa: 'کاری نیست', en: 'No tasks' },\n  'todo.done': { fa: 'انجام شد', en: 'Done' },\n  'task.title': { fa: 'کارهای زمان‌بندی‌شده', en: 'Scheduled tasks' },\n  'task.empty': { fa: 'کاری زمان‌بندی نشده', en: 'Nothing scheduled' },\n\n  /* ── آمار ── */\n  'stats.msgs': { fa: 'پیام‌ها', en: 'Messages' },\n  'stats.tokens': { fa: 'توکن', en: 'Tokens' },\n  'stats.today': { fa: 'امروز', en: 'Today' },\n  'stats.total': { fa: 'مجموع', en: 'Total' },\n\n  /* ── ویجت‌ها ── */\n  'wg.title': { fa: 'ویجت‌ها', en: 'Widgets' },\n  'wg.add': { fa: 'ویجت تازه', en: 'New widget' },\n  'wg.empty': { fa: 'ویجتی روی خانه نیست', en: 'No widgets on the home screen' },\n  'wg.remove': { fa: 'حذف ویجت', en: 'Remove widget' },\n\n  /* ── پیام‌های خطا ── */\n  'err.net': { fa: 'اتصال برقرار نشد — اینترنت را بررسی کن', en: 'Could not connect — check your internet' },\n  'err.auth': { fa: 'دسترسی منقضی شد؛ دوباره وارد شو', en: 'Session expired; sign in again' },\n  'err.server': { fa: 'سرور خطا داد', en: 'The server returned an error' },\n  'err.generic': { fa: 'خطای نامشخص', en: 'Unknown error' },\n};\n\n/* زبانِ جاری: S.locale اگر هست، وگرنه fa */\nfunction curLocale() {\n  try { return (typeof S !== 'undefined' && S.locale === 'en') ? 'en' : 'fa'; } catch { return 'fa'; }\n}\n/* t('key', ...args) — جای‌نگهدارهای %1..%N با args پر می‌شوند */\nfunction t(key, ...args) {\n  const e = I18N[key];\n  if (!e) return key;\n  const lang = curLocale();\n  let s = e[lang] != null && e[lang] !== '' ? e[lang] : e.fa;\n  if (args.length) s = s.replace(/%(\\\\d+)/g, (m, d) => { const i = +d - 1; return i >= 0 && i < args.length && args[i] != null ? String(args[i]) : ''; });\n  return s;\n}\n/* زبانِ راست‌به‌چپ است؟ */\nfunction isRTL() { return curLocale() === 'fa'; }\n/* اعمالِ زبان روی <html> (lang/dir) — بعد از هر تغییرِ زبان صدا زده می‌شود */\nfunction applyLocale() {\n  const lang = curLocale();\n  const root = document.documentElement;\n  root.setAttribute('lang', lang);\n  root.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');\n  root.setAttribute('data-locale', lang);\n}\n\n/* ── دیکشنریِ انگلیسیِ کلِ رشته‌های inline (کلید = متنِ فارسی) ── */\nconst WEB_I18N = {\n  \"تم: \": \"Theme: \",\n  \"شبکه در دسترس نیست — اینترنت را چک کنید.\": \"Network unavailable — check your internet.\",\n  \"نشست منقضی شد — دوباره وارد شوید.\": \"Session expired — please sign in again.\",\n  \"خطای \": \"Error \",\n  \"شبکه در دسترس نیست.\": \"Network unavailable.\",\n  \"نشست منقضی شد.\": \"Session expired.\",\n  \"رمز را وارد کنید.\": \"Enter the password.\",\n  \"در حال ورود ...\": \"Signing in ...\",\n  \"خوش آمدی ✅\": \"Welcome ✅\",\n  \"ورود ناموفق بود.\": \"Sign-in failed.\",\n  \"ویجت‌ها\": \"Widgets\",\n  \"گفتگوها\": \"Chats\",\n  \"یادآورها\": \"Reminders\",\n  \"حافظه بلندمدت\": \"Long-term memory\",\n  \"استودیو صدا\": \"Voice studio\",\n  \"تنظیمات\": \"Settings\",\n  \"آمار و مصرف\": \"Stats & usage\",\n  \"خانه\": \"Home\",\n  \"چت\": \"Chat\",\n  \"یادآور\": \"Reminder\",\n  \"حافظه\": \"Memory\",\n  \"صدا\": \"Voice\",\n  \"مدل\": \"Model\",\n  \"3.8 Flash TTS (پیشنهادی)\": \"3.8 Flash TTS (recommended)\",\n  \"Live TTS (سریع و طبیعی)\": \"Live TTS (fast and natural)\",\n  \"Flash TTS (کلاسیک)\": \"Flash TTS (classic)\",\n  \"Pro TTS (باکیفیت بالا)\": \"Pro TTS (high quality)\",\n  \"Transcribe (پیشنهادی، تخصصی STT)\": \"Transcribe (recommended, dedicated STT)\",\n  \"Live Translate (سریع، چندزبانه)\": \"Live Translate (fast, multilingual)\",\n  \"Flash (فهم صوت عمومی)\": \"Flash (general audio understanding)\",\n  \"Flash Lite Image (پیشنهادی، ارزان)\": \"Flash Lite Image (recommended, cheap)\",\n  \"Flash Image (کیفیت بالاتر)\": \"Flash Image (higher quality)\",\n  \"<div class=\\\"em-t\\\">شروع گفتگو</div>\": \"<div class=\\\"em-t\\\">Start a chat</div>\",\n  \"<div class=\\\"em-s\\\">هر چی بخواهی همین‌جاست: جستجوی وب، هوای نیشابور، یادآور، ویس و حافظه بلندمدت.<br>\": \"<div class=\\\"em-s\\\">Everything you need is right here: web search, Nishapur weather, reminders, voice notes, and long-term memory.<br>\",\n  \"با <code>/</code> دستورها را ببین — مثل تلگرام، ولی شیشه‌ای‌تر ✨</div></div>\": \"Use <code>/</code> to see the commands — like Telegram, but glassier ✨</div></div>\",\n  \"<span class=\\\"spin\\\"></span><span class=\\\"pt\\\">دارم فکر میکنم...</span>\": \"<span class=\\\"spin\\\"></span><span class=\\\"pt\\\">Thinking...</span>\",\n  \" توکن\": \" tokens\",\n  \" مجدد\": \" again\",\n  \"تولید مجدد از «\": \"Regenerate from «\",\n  \"خطا\": \"Error\",\n  \"پخش صدا ناموفق بود\": \"Audio playback failed\",\n  \"تصویر تولیدشده\": \"Generated image\",\n  \" عکس\": \" images\",\n  \"افزودن پیوست\": \"Add attachment\",\n  \"<div class=\\\"item\\\" data-act=\\\"act-img\\\"><span class=\\\"ic\\\">🖼</span><div class=\\\"mid\\\"><div class=\\\"t1\\\">عکس</div><div class=\\\"t2\\\">حداکثر \": \"<div class=\\\"item\\\" data-act=\\\"act-img\\\"><span class=\\\"ic\\\">🖼</span><div class=\\\"mid\\\"><div class=\\\"t1\\\">Image</div><div class=\\\"t2\\\">Up to \",\n  \" عکس — برای مدل 👁</div></div><span class=\\\"chev\\\">‹</span></div>\": \" images — for the vision model 👁</div></div><span class=\\\"chev\\\">‹</span></div>\",\n  \"<div class=\\\"item\\\" data-act=\\\"act-txt\\\"><span class=\\\"ic\\\">📄</span><div class=\\\"mid\\\"><div class=\\\"t1\\\">فایل متنی / کد</div><div class=\\\"t2\\\">تا \": \"<div class=\\\"item\\\" data-act=\\\"act-txt\\\"><span class=\\\"ic\\\">📄</span><div class=\\\"mid\\\"><div class=\\\"t1\\\">Text / code file</div><div class=\\\"t2\\\">Up to \",\n  \" کیلوبایت</div></div><span class=\\\"chev\\\">‹</span></div>\": \" KB</div></div><span class=\\\"chev\\\">‹</span></div>\",\n  \"سقف \": \"Limit \",\n  \"عکس خوانده نشد\": \"Could not read image\",\n  \"فایل خیلی بزرگ است\": \"File is too large\",\n  \"فایل «\": \"File «\",\n  \"» آماده ارسال\": \"» is ready to send\",\n  \"کد کپی شد\": \"Code copied\",\n  \"کپی شد\": \"Copied\",\n  \"متنی نیست\": \"Not text\",\n  \"صدایی ساخته نشد\": \"No audio was generated\",\n  \"ویسی ضبط نشد\": \"No voice recorded\",\n  \"چیزی فهمیده نشد — دوباره بگو\": \"Couldn't understand — say it again\",\n  \"ویس پردازش نشد\": \"Voice note processing failed\",\n  \"میکروفون در دسترس نیست — اجازه را بده\": \"Microphone unavailable — grant permission\",\n  \"<div class=\\\"empty\\\"><span class=\\\"em-ic\\\">🗂</span><div class=\\\"em-t\\\">گفتگویی نیست</div></div>\": \"<div class=\\\"empty\\\"><span class=\\\"em-ic\\\">🗂</span><div class=\\\"em-t\\\">No chats yet</div></div>\",\n  \" · فعال\": \" · active\",\n  \"<button class=\\\"mini-btn\\\" data-op=\\\"ren\\\" title=\\\"نام\\\">✏️</button>\": \"<button class=\\\"mini-btn\\\" data-op=\\\"ren\\\" title=\\\"Rename\\\">✏️</button>\",\n  \"<button class=\\\"mini-btn del\\\" data-op=\\\"del\\\" title=\\\"حذف\\\">🗑</button></div></div>\": \"<button class=\\\"mini-btn del\\\" data-op=\\\"del\\\" title=\\\"Delete\\\">🗑</button></div></div>\",\n  \"گفتگوی تازه ساخته شد ✨\": \"New chat created ✨\",\n  \"حداقل یک گفتگو بماند\": \"At least one chat must remain\",\n  \"حذف گفتگو؟\": \"Delete chat?\",\n  \"» و تاریخچه‌اش پاک می‌شود.</p><div class=\\\"f-row\\\" style=\\\"justify-content:center;margin-top:14px\\\">\": \"» and its history will be deleted.</p><div class=\\\"f-row\\\" style=\\\"justify-content:center;margin-top:14px\\\">\",\n  \"\\\">حذف شود</button>\": \"\\\">Delete</button>\",\n  \"<button class=\\\"btn ghost\\\" data-act=\\\"close\\\">انصراف</button></div>\": \"<button class=\\\"btn ghost\\\" data-act=\\\"close\\\">Cancel</button></div>\",\n  \"نام گفتگو\": \"Chat name\",\n  \"\\\">ذخیره</button></div>\": \"\\\">Save</button></div>\",\n  \"<div class=\\\"empty\\\"><span class=\\\"em-ic\\\">🧠</span><div class=\\\"em-t\\\">حافظه خالی است</div>\": \"<div class=\\\"empty\\\"><span class=\\\"em-ic\\\">🧠</span><div class=\\\"em-t\\\">Memory is empty</div>\",\n  \"<div class=\\\"em-s\\\">خودکار از حرف‌هایت یاد می‌گیرم، یا همین‌جا اضافه کن.</div></div>\": \"<div class=\\\"em-s\\\">I learn automatically from what you say, or add entries right here.</div></div>\",\n  \"این را از قبل داشتم\": \"I already have this\",\n  \"در حافظه ذخیره شد ✨\": \"Saved to memory ✨\",\n  \"پاک کردن کل حافظه؟\": \"Clear all memory?\",\n  \"<p style=\\\"text-align:center;color:var(--muted);line-height:2.2\\\">همه \": \"<p style=\\\"text-align:center;color:var(--muted);line-height:2.2\\\">All \",\n  \" خاطره پاک می‌شود و دیگر برنمی‌گردد.</p><div class=\\\"f-row\\\" style=\\\"justify-content:center;margin-top:14px\\\">\": \" memories will be erased and can't be recovered.</p><div class=\\\"f-row\\\" style=\\\"justify-content:center;margin-top:14px\\\">\",\n  \"<button class=\\\"btn danger-ghost\\\" data-act=\\\"do-memclear\\\">پاک شود</button>\": \"<button class=\\\"btn danger-ghost\\\" data-act=\\\"do-memclear\\\">Clear</button>\",\n  \"حذف شد\": \"Deleted\",\n  \"ویرایش خاطره\": \"Edit memory\",\n  \"<div class=\\\"empty\\\"><span class=\\\"em-ic\\\">⏰</span><div class=\\\"em-t\\\">یادآوری نداری</div>\": \"<div class=\\\"empty\\\"><span class=\\\"em-ic\\\">⏰</span><div class=\\\"em-t\\\">No reminders yet</div>\",\n  \"<div class=\\\"em-s\\\">مثلاً بنویس: <code>روزانه 08:00 ورزش</code><br>یا <code>18:30 چای دم کن</code></div></div>\": \"<div class=\\\"em-s\\\">For example, write: <code>daily 08:00 exercise</code><br>or <code>18:30 brew tea</code></div></div>\",\n  \" ساعت \": \" at \",\n  \"<span class=\\\"badge green\\\">روزانه</span>\": \"<span class=\\\"badge green\\\">Daily</span>\",\n  \"یادآور ثبت شد ✅ \": \"Reminder saved ✅ \",\n  \"چت و مدل\": \"Chat & model\",\n  \"مدل فعال\": \"Active model\",\n  \"شخصیت (پرسونا)\": \"Personality (persona)\",\n  \"پیش‌فرض\": \"Default\",\n  \"دما (خلاقیت)\": \"Temperature (creativity)\",\n  \"حداکثر توکن خروجی\": \"Max output tokens\",\n  \"سقف روزانه (هزار توکن — صفر = بدون سقف)\": \"Daily cap (thousand tokens — 0 = no cap)\",\n  \"جریان زنده پاسخ\": \"Live response streaming\",\n  \"متن تیک‌تیک روی صفحه بیاید\": \"Show the text appearing on screen tick-by-tick\",\n  \"خواندن لینک‌ها\": \"Read links\",\n  \"محتوای لینک داخل پیام خودکار خوانده شود\": \"Automatically read the content of links in messages\",\n  \"سوییچ خودکار به مدل 👁\": \"Auto-switch to the vision model 👁\",\n  \"اگر مدل عکس نفهمد، خودکار مدل ویژن بیاید\": \"If the model doesn't understand an image, a vision model takes over automatically\",\n  \"سوییچ خودکار مدل\": \"Auto model switching\",\n  \"هنگام خطا مدل رایگان جایگزین شود\": \"On error, fall back to a free model\",\n  \"سرچ خودکار وب\": \"Automatic web search\",\n  \"وقتی سؤال تازه وبی است Tavily خودکار بزند\": \"Hit Tavily automatically when the question needs fresh web info\",\n  \"تولید تصویر\": \"Image generation\",\n  \"با دستور /image عکس بسازد — با GEMINI_API_KEY باکیفیت‌تر، بدون کلید هم می‌سازد (رایگان)\": \"Generate photos with the /image command — better quality with GEMINI_API_KEY, works without a key too (free)\",\n  \"مدل تولید تصویر\": \"Image generation model\",\n  \"فالبک رایگان تصویر\": \"Free image fallback\",\n  \"اگر کلید گوگل نبود یا ۴۲۹ داد، pollinations رایگان عکس بسازد\": \"If the Google key is missing or returns 429, pollinations makes the photo for free\",\n  \"ویرایش عکس\": \"Photo editing\",\n  \"عکس را با کپشن «ویرایش: …» بفرست تا تغییرش بدم\": \"Send a photo with the caption \\\"Edit: …\\\" and I'll edit it\",\n  \"یادآور از متن آزاد\": \"Reminders from free text\",\n  \"«فردا ساعت ۵ یادم بنداز…» بدون دستور /remind\": \"\\\"Remind me tomorrow at 5…\\\" without the /remind command\",\n  \"حافظهٔ خودکار\": \"Automatic memory\",\n  \"از گفتگو خاطره استخراج شود و در پاسخ‌ها لحاظ شود\": \"Memories are extracted from chats and factored into replies\",\n  \"بکاپ خودکار هفتگی\": \"Weekly auto backup\",\n  \"هر جمعه فایل JSON بکاپ در Saved Messages\": \"JSON backup file to Saved Messages every Friday\",\n  \"قطع خودکار سرویس خراب\": \"Auto-disable broken services\",\n  \"سرویس کاستومی که چند بار خطا داد، چند دقیقه کنار گذاشته شود\": \"A custom service that errors repeatedly is set aside for a few minutes\",\n  \"خلاصهٔ یوتیوب\": \"YouTube summaries\",\n  \"لینک یوتیوب → خواندن زیرنویس و خلاصه کردن\": \"YouTube link → reads the subtitles and summarizes\",\n  \"<div class=\\\"row\\\"><span class=\\\"ic\\\">🔑</span><div class=\\\"mid\\\"><div class=\\\"t1\\\" style=\\\"color:var(--danger)\\\">GEMINI_API_KEY ست نشده</div>\": \"<div class=\\\"row\\\"><span class=\\\"ic\\\">🔑</span><div class=\\\"mid\\\"><div class=\\\"t1\\\" style=\\\"color:var(--danger)\\\">GEMINI_API_KEY not set</div>\",\n  \"<div class=\\\"t2\\\">تصویر و صدای گوگل کار نمی‌کند — Worker ← Settings ← Secrets</div></div></div>\": \"<div class=\\\"t2\\\">Google image and voice won't work — Worker ← Settings ← Secrets</div></div></div>\",\n  \"<div class=\\\"t1\\\">پرامپت سیستمی دلخواه</div><div class=\\\"t2\\\">سقف \": \"<div class=\\\"t1\\\">Custom system prompt</div><div class=\\\"t2\\\">Limit \",\n  \" کاراکتر — اولویت بالا</div></div>\": \" characters — high priority</div></div>\",\n  \"<button class=\\\"foot-btn\\\" data-act=\\\"do-sysave\\\">ذخیره</button></div>\": \"<button class=\\\"foot-btn\\\" data-act=\\\"do-sysave\\\">Save</button></div>\",\n  \"<textarea class=\\\"f-area\\\" id=\\\"sysArea\\\" maxlength=\\\"2000\\\" placeholder=\\\"مثلاً: همیشه کوتاه و بی‌حاشیه جواب بده...\\\">\": \"<textarea class=\\\"f-area\\\" id=\\\"sysArea\\\" maxlength=\\\"2000\\\" placeholder=\\\"e.g. Always answer briefly and to the point...\\\">\",\n  \"صدا و صبح\": \"Voice & Morning\",\n  \"پاسخ صوتی\": \"Voice replies\",\n  \"جواب‌ها با وویس انتخابی تولید شود\": \"Replies are generated with the selected voice\",\n  \"<div class=\\\"row\\\"><span class=\\\"ic\\\">🎛</span><div class=\\\"mid\\\"><div class=\\\"t1\\\">موتور صدا</div>\": \"<div class=\\\"row\\\"><span class=\\\"ic\\\">🎛</span><div class=\\\"mid\\\"><div class=\\\"t1\\\">Voice engine</div>\",\n  \"<div class=\\\"t2\\\">کلادفلر (رایگان) یا گوگل AI Studio</div></div></div>\": \"<div class=\\\"t2\\\">Cloudflare (free) or Google AI Studio</div></div></div>\",\n  \"\\\">کلادفلر</button>\": \"\\\">Cloudflare</button>\",\n  \"\\\">گوگل</button></div></div>\": \"\\\">Google</button></div></div>\",\n  \"مدل‌ها، ۳۰ وویس و تست صدا\": \"Models, 30 voices and a voice test\",\n  \"خلاصه صبحگاهی ساعت \": \"Morning summary at \",\n  \":۰۰\": \":00\",\n  \"هر صبح خلاصه روز به وقت تهران\": \"Every morning, the day's summary in Tehran time\",\n  \"ظاهر\": \"Appearance\",\n  \"<div class=\\\"row\\\" style=\\\"border:none;padding-bottom:4px\\\"><div class=\\\"mid\\\"><div class=\\\"t1\\\">تم رنگی</div>\": \"<div class=\\\"row\\\" style=\\\"border:none;padding-bottom:4px\\\"><div class=\\\"mid\\\"><div class=\\\"t1\\\">Color theme</div>\",\n  \"<div class=\\\"t2\\\">چهار تم تیره — آبی، سبز، قرمز، طوفانی</div></div></div>\": \"<div class=\\\"t2\\\">Four dark themes — blue, green, red, storm</div></div></div>\",\n  \"<div class=\\\"row\\\" style=\\\"border:none;padding-bottom:4px\\\"><div class=\\\"mid\\\"><div class=\\\"t1\\\">چیدمان</div>\": \"<div class=\\\"row\\\" style=\\\"border:none;padding-bottom:4px\\\"><div class=\\\"mid\\\"><div class=\\\"t1\\\">Layout</div>\",\n  \"<div class=\\\"t2\\\">سه چینش متفاوت برای هر سلیقه</div></div></div>\": \"<div class=\\\"t2\\\">Three different layouts for every taste</div></div></div>\",\n  \"داده‌ها\": \"Data\",\n  \"شروع گفتگوی تازه\": \"Start a new chat\",\n  \"تاریخچه همین گفتگو پاک شود\": \"Clear this chat's history\",\n  \"خروجی گفتگو\": \"Export chat\",\n  \"دانلود متنی تاریخچه این گفتگو\": \"Download this chat's history as text\",\n  \"خروج از حساب\": \"Log out\",\n  \"دفعه بعد دوباره رمز می‌خواهم\": \"You'll need the password again next time\",\n  \"</div><div class=\\\"t2\\\">اپ شیشه‌ای متصل به ورکر Cloudflare — همان داده‌های تلگرام</div></div></div>\": \"</div><div class=\\\"t2\\\">Glassy app connected to the Cloudflare worker — same Telegram data</div></div></div>\",\n  \"ذخیره شد ✅\": \"Saved ✅\",\n  \"چیدمان: \": \"Layout: \",\n  \"مدل تولید تصویر 🖼\": \"Image generation model 🖼\",\n  \"با <code>/image توصیف</code> در چت عکس می‌سازی.</p>\": \"Create an image in chat with <code>/image description</code>.</p>\",\n  \"پرامپت ذخیره شد ✅\": \"Prompt saved ✅\",\n  \"شروع گفتگوی تازه؟\": \"Start a new chat?\",\n  \"<p style=\\\"text-align:center;color:var(--muted);line-height:2.2\\\">تاریخچه «\": \"<p style=\\\"text-align:center;color:var(--muted);line-height:2.2\\\">The history of \\\"\",\n  \"» پاک می‌شود.</p>\": \"\\\" will be cleared.</p>\",\n  \"<button class=\\\"btn danger-ghost\\\" data-act=\\\"do-clearhist\\\">پاک شود</button>\": \"<button class=\\\"btn danger-ghost\\\" data-act=\\\"do-clearhist\\\">Clear</button>\",\n  \"خروجی دانلود شد 📤\": \"Export downloaded 📤\",\n  \"خروجی نشد\": \"Export failed\",\n  \"کلید SEARCH_API_KEY تنظیم نشده — سرچ وب غیرفعال است\": \"SEARCH_API_KEY not set — web search is disabled\",\n  \"کلید GEMINI_API_KEY نیست — صدای گوگل در دسترس نیست (فالبک Whisper)\": \"GEMINI_API_KEY missing — Google voice unavailable (Whisper fallback)\",\n  \"موتور صدا\": \"Voice engine\",\n  \"\\\">کلادفلر (رایگان)</button>\": \"\\\">Cloudflare (free)</button>\",\n  \"\\\">گوگل AI Studio</button></div></div>\": \"\\\">Google AI Studio</button></div></div>\",\n  \"پاسخ صوتی در چت\": \"Voice replies in chat\",\n  \"جواب‌ها صوتی بیاید\": \"Replies come as audio\",\n  \"مدل فهم ویس (STT) — گوگل\": \"Voice understanding model (STT) — Google\",\n  \"<span class=\\\"badge\\\">فعال</span>\": \"<span class=\\\"badge\\\">Active</span>\",\n  \"مدل تولید صدا (TTS) — گوگل\": \"Speech generation model (TTS) — Google\",\n  \"وویس — \": \"Voice — \",\n  \" <span style=\\\"color:var(--dim);font-weight:400\\\">(۳۰ گزینه، فارسی fa)</span>\": \" <span style=\\\"color:var(--dim);font-weight:400\\\">(30 options, Persian fa)</span>\",\n  \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">تست</div><div class=\\\"sec-box\\\">\": \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">Test</div><div class=\\\"sec-box\\\">\",\n  \"<div class=\\\"row\\\"><span class=\\\"ic\\\">🎧</span><div class=\\\"mid\\\"><div class=\\\"t1\\\">پخش نمونه با وویس فعلی</div>\": \"<div class=\\\"row\\\"><span class=\\\"ic\\\">🎧</span><div class=\\\"mid\\\"><div class=\\\"t1\\\">Play a sample with the current voice</div>\",\n  \"<div class=\\\"t2\\\">«سلام بهراد! من دستیار صوتی تو هستم...»</div></div>\": \"<div class=\\\"t2\\\">\\\"Hello {{owner}}! I'm your voice assistant...\\\"</div></div>\",\n  \"<button class=\\\"btn acc sm\\\" data-act=\\\"do-test\\\">تست 🎧</button></div></div></div>\": \"<button class=\\\"btn acc sm\\\" data-act=\\\"do-test\\\">Test 🎧</button></div></div></div>\",\n  \"موتور عوض شد ✅\": \"Engine changed ✅\",\n  \"مدل فهم عوض شد ✅\": \"Understanding model changed ✅\",\n  \"مدل صدا عوض شد ✅\": \"Voice model changed ✅\",\n  \"وویس: \": \"Voice: \",\n  \"سلام بهراد! من دستیار صوتی تو هستم. این صدای \": \"Hello {{owner}}! I'm your voice assistant. This is the voice of \",\n  \" است.\": \".\",\n  \"تست ناموفق\": \"Test failed\",\n  \"تست 🎧\": \"Test 🎧\",\n  \"</div><div class=\\\"sl\\\">پیام امروز</div></div>\": \"</div><div class=\\\"sl\\\">Messages today</div></div>\",\n  \"K</div><div class=\\\"sl\\\">توکن ورودی امروز</div></div>\": \"K</div><div class=\\\"sl\\\">Input tokens today</div></div>\",\n  \"K</div><div class=\\\"sl\\\">توکن خروجی امروز</div></div>\": \"K</div><div class=\\\"sl\\\">Output tokens today</div></div>\",\n  \"</div><div class=\\\"sl\\\">گفتگو (از \": \"</div><div class=\\\"sl\\\">Chats (from \",\n  \"<div class=\\\"sec\\\" style=\\\"--i:4\\\"><div class=\\\"sec-t\\\">سقف روزانه</div><div class=\\\"sec-box\\\"><div class=\\\"row\\\">\": \"<div class=\\\"sec\\\" style=\\\"--i:4\\\"><div class=\\\"sec-t\\\">Daily limit</div><div class=\\\"sec-box\\\"><div class=\\\"row\\\">\",\n  \"٪ مصرف شده</div>\": \"% used</div>\",\n  \"K از \": \"K of \",\n  \"K توکن</div>\": \"K tokens</div>\",\n  \"<div class=\\\"sec\\\" style=\\\"--i:5\\\"><div class=\\\"sec-t\\\">سرویس‌ها</div><div class=\\\"sec-box\\\">\": \"<div class=\\\"sec\\\" style=\\\"--i:5\\\"><div class=\\\"sec-t\\\">Services</div><div class=\\\"sec-box\\\">\",\n  \"مدل AI\": \"AI model\",\n  \"🗄 دیتابیس D1\": \"🗄 D1 database\",\n  \"دیتابیس D1\": \"D1 database\",\n  \"سرچ Tavily (SEARCH_API_KEY)\": \"Tavily search (SEARCH_API_KEY)\",\n  \"صدای گوگل (GEMINI_API_KEY)\": \"Google voice (GEMINI_API_KEY)\",\n  \"فعال\": \"Active\",\n  \"غیرفعال\": \"Disabled\",\n  \"<div class=\\\"sec\\\" style=\\\"--i:6\\\"><div class=\\\"sec-t\\\">درباره</div><div class=\\\"sec-box\\\">\": \"<div class=\\\"sec\\\" style=\\\"--i:6\\\"><div class=\\\"sec-t\\\">About</div><div class=\\\"sec-box\\\">\",\n  \"<div class=\\\"t2\\\">اپ شیشه‌ای اندروید — همان ورکر Cloudflare، همان تاریخچه تلگرام</div></div></div></div></div>\": \"<div class=\\\"t2\\\">Glassy Android app — same Cloudflare worker, same Telegram history</div></div></div></div></div>\",\n  \"<span class=\\\"bc-ic\\\">💬</span><div class=\\\"bc-v\\\">چت تازه</div>\": \"<span class=\\\"bc-ic\\\">💬</span><div class=\\\"bc-v\\\">New chat</div>\",\n  \"👁 ویژن\": \"👁 Vision\",\n  \"متن\": \"Text\",\n  \"<div><div class=\\\"bc-t\\\">مدل فعال</div><div class=\\\"bc-v\\\" style=\\\"font-size:17px\\\">\": \"<div><div class=\\\"bc-t\\\">Active model</div><div class=\\\"bc-v\\\" style=\\\"font-size:17px\\\">\",\n  \"K کانتکست\": \"K context\",\n  \"<span class=\\\"bc-ic\\\">🌤</span><div><div class=\\\"bc-t\\\">هوای نیشابور</div>\": \"<span class=\\\"bc-ic\\\">🌤</span><div><div class=\\\"bc-t\\\">Nishapur weather</div>\",\n  \"<div class=\\\"bc-v\\\" style=\\\"font-size:19px\\\">ببین...</div><div class=\\\"bc-s\\\">برای دریافت بزن</div></div></div>\": \"<div class=\\\"bc-v\\\" style=\\\"font-size:19px\\\">Let's see...</div><div class=\\\"bc-s\\\">Tap to fetch</div></div></div>\",\n  \"<span class=\\\"bc-ic\\\">🧠</span><div><div class=\\\"bc-t\\\">حافظه بلندمدت</div>\": \"<span class=\\\"bc-ic\\\">🧠</span><div><div class=\\\"bc-t\\\">Long-term memory</div>\",\n  \"<div class=\\\"bc-s\\\">مدیریت خاطره‌ها</div></div></div>\": \"<div class=\\\"bc-s\\\">Manage memories</div></div></div>\",\n  \"<span class=\\\"bc-ic\\\">⏰</span><div><div class=\\\"bc-t\\\">یادآورها</div>\": \"<span class=\\\"bc-ic\\\">⏰</span><div><div class=\\\"bc-t\\\">Reminders</div>\",\n  \"صبح \": \"Morning \",\n  \":۰۰ 🌅\": \":00 🌅\",\n  \"مدیریت\": \"Manage\",\n  \"<div class=\\\"bc-s\\\">ساخت و حذف یادآور</div></div></div>\": \"<div class=\\\"bc-s\\\">Create and delete reminders</div></div></div>\",\n  \"<span class=\\\"bc-ic\\\">📊</span><div><div class=\\\"bc-t\\\">پیام امروز</div>\": \"<span class=\\\"bc-ic\\\">📊</span><div><div class=\\\"bc-t\\\">Messages today</div>\",\n  \"K توکن</div></div></div>\": \"K tokens</div></div></div>\",\n  \"<div><div class=\\\"bc-t\\\">استودیو صدا</div><div class=\\\"bc-v\\\" style=\\\"font-size:17px\\\">\": \"<div><div class=\\\"bc-t\\\">Voice studio</div><div class=\\\"bc-v\\\" style=\\\"font-size:17px\\\">\",\n  \"کلادفلر\": \"Cloudflare\",\n  \"گوگل\": \"Google\",\n  \"<div class=\\\"bc-s\\\">۳۰ وویس، مدل‌ها و تست صدا</div></div></div>\": \"<div class=\\\"bc-s\\\">30 voices, models and voice test</div></div></div>\",\n  \"<div><div class=\\\"bc-t\\\">تم و چیدمان</div><div class=\\\"bc-v\\\" style=\\\"font-size:17px\\\">\": \"<div><div class=\\\"bc-t\\\">Theme and layout</div><div class=\\\"bc-v\\\" style=\\\"font-size:17px\\\">\",\n  \"<div class=\\\"bc-s\\\">برای عوض زدن بزن — ۴ تم × ۳ چیدمان</div></div></div>\": \"<div class=\\\"bc-s\\\">Tap to switch — 4 themes × 3 layouts</div></div></div>\",\n  \"🌤 هوای نیشابور\": \"🌤 Nishapur weather\",\n  \"یکشنبه\": \"Sunday\",\n  \"دوشنبه\": \"Monday\",\n  \"سه‌شنبه\": \"Tuesday\",\n  \"چهارشنبه\": \"Wednesday\",\n  \"پنجشنبه\": \"Thursday\",\n  \"جمعه\": \"Friday\",\n  \"شنبه\": \"Saturday\",\n  \"فروردین\": \"Farvardin\",\n  \"اردیبهشت\": \"Ordibehesht\",\n  \"خرداد\": \"Khordad\",\n  \"تیر\": \"Tir\",\n  \"مرداد\": \"Mordad\",\n  \"شهریور\": \"Shahrivar\",\n  \"مهر\": \"Mehr\",\n  \"آبان\": \"Aban\",\n  \"آذر\": \"Azar\",\n  \"دی\": \"Dey\",\n  \"بهمن\": \"Bahman\",\n  \"اسفند\": \"Esfand\",\n  \"الان\": \"Now\",\n  \"کمتر از یک دقیقه دیگه\": \"Less than a minute left\",\n  \" دقیقه دیگه\": \" minutes left\",\n  \" ساعت\": \" hours\",\n  \" و \": \" and \",\n  \" دقیقه\": \" minutes\",\n  \" دیگه\": \" left\",\n  \" روز\": \" days\",\n  \"رسید 🎉\": \"Arrived 🎉\",\n  \" روزانه\": \" daily\",\n  \" امروز\": \" today\",\n  \" فردا\": \" tomorrow\",\n  \" دیروز\": \" yesterday\",\n  \"🎉 رسید\": \"🎉 Arrived\",\n  \"الان!\": \"Now!\",\n  \"✓ انجام شد\": \"✓ Done\",\n  \"🎉 رسید!\": \"🎉 Arrived!\",\n  \"الان وقتشه! ⏰\": \"It's time! ⏰\",\n  \"صاف\": \"Clear\",\n  \"کمی ابری\": \"Partly cloudy\",\n  \"ابری\": \"Cloudy\",\n  \"مه\": \"Fog\",\n  \"باران\": \"Rain\",\n  \"برف\": \"Snow\",\n  \"رگبار\": \"Showers\",\n  \"طوفان\": \"Storm\",\n  \"هوای خوب\": \"Nice weather\",\n  \"؟\": \"?\",\n  \"ویجت\": \"Widget\",\n  \"<span class=\\\"wg-unit\\\"> روز</span>\": \"<span class=\\\"wg-unit\\\"> days</span>\",\n  \"نیشابور\": \"Nishapur\",\n  \"<div class=\\\"wg-skelbar\\\"></div><div class=\\\"wg-sub\\\">دارم هوا را می‌گیرم ...</div>\": \"<div class=\\\"wg-skelbar\\\"></div><div class=\\\"wg-sub\\\">Fetching the weather ...</div>\",\n  \" · بیشینه \": \" · Max \",\n  \"° / کمینه \": \"° / Min \",\n  \"٪</span>\": \"%</span>\",\n  \"٪</span></div>\": \"%</span></div>\",\n  \"امروز\": \"Today\",\n  \"<span class=\\\"wg-unit\\\"> پیام</span></div>\": \"<span class=\\\"wg-unit\\\"> messages</span></div>\",\n  \"<div class=\\\"wg-sub\\\">از سقف \": \"<div class=\\\"wg-sub\\\">Out of \",\n  \"<div class=\\\"wg-li\\\"><i></i><span>خالی است</span></div>\": \"<div class=\\\"wg-li\\\"><i></i><span>Empty</span></div>\",\n  \" مورد\": \" items\",\n  \"یادداشت\": \"Note\",\n  \"\\\" aria-label=\\\"ویرایش\\\">✎</button>\": \"\\\" aria-label=\\\"Edit\\\">✎</button>\",\n  \"<div class=\\\"em-t\\\">هنوز ویجتی نداری</div>\": \"<div class=\\\"em-t\\\">No widgets yet</div>\",\n  \"<div class=\\\"em-s\\\">بالا بنویس چی بسازم:<br>\": \"<div class=\\\"em-s\\\">Type above what to build:<br>\",\n  \"<b>«فردا ساعت ۹ قرص بخورم»</b> · <b>«آب‌وهوا نشون بده»</b> · <b>«لیست خرید»</b></div></div>\": \"<b>\\\"Take my pill tomorrow at 9\\\"</b> · <b>\\\"Show the weather\\\"</b> · <b>\\\"Shopping list\\\"</b></div></div>\",\n  \"اول بنویس چی بسازم ✍️\": \"First type what to build ✍️\",\n  \"<div class=\\\"wg-skel-in\\\"><span class=\\\"spin\\\">✨</span>دارم می‌سازمش ...</div>\": \"<div class=\\\"wg-skel-in\\\"><span class=\\\"spin\\\">✨</span>Building it ...</div>\",\n  \"ویجت ساخته شد ✨\": \"Widget created ✨\",\n  \"ویجت ساخته شد (حالت سریع ⚡)\": \"Widget created (fast mode ⚡)\",\n  \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">عنوان</div><div class=\\\"f-row\\\">\": \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">Title</div><div class=\\\"f-row\\\">\",\n  \"زمان یادآوری (به وقت تهران)\": \"Reminder time (Tehran time)\",\n  \"زمان پایان\": \"End time\",\n  \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">تکرار</div>\": \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">Repeat</div>\",\n  \"یک‌بار\": \"One-time\",\n  \"🔁 هر روز\": \"🔁 Every day\",\n  \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">متن</div><textarea id=\\\"wgX\\\" class=\\\"f-area\\\" maxlength=\\\"150\\\">\": \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">Text</div><textarea id=\\\"wgX\\\" class=\\\"f-area\\\" maxlength=\\\"150\\\">\",\n  \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">آیتم‌ها (هر خط یکی)</div><textarea id=\\\"wgI\\\" class=\\\"f-area\\\">\": \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">Items (one per line)</div><textarea id=\\\"wgI\\\" class=\\\"f-area\\\">\",\n  \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">اندازه ویجت</div>\": \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">Widget size</div>\",\n  \"▣ کوچک\": \"▣ Small\",\n  \"▭ پهن\": \"▭ Wide\",\n  \"▯ بلند\": \"▯ Tall\",\n  \"▦ بزرگ\": \"▦ Large\",\n  \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">رنگ</div>\": \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">Color</div>\",\n  \"🔵 آبی\": \"🔵 Blue\",\n  \"🟢 سبز\": \"🟢 Green\",\n  \"🔴 قرمز\": \"🔴 Red\",\n  \"\\\">ذخیره ✅</button>\": \"\\\">Save ✅</button>\",\n  \"\\\">↑ جلو</button>\": \"\\\">↑ Forward</button>\",\n  \"\\\">↓ عقب</button>\": \"\\\">↓ Back</button>\",\n  \"\\\" style=\\\"color:var(--danger)\\\">🗑 حذف</button></div>\": \"\\\" style=\\\"color:var(--danger)\\\">🗑 Delete</button></div>\",\n  \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">یا دوباره با AI از نو بسازش</div>\": \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">Or rebuild it with AI</div>\",\n  \"<textarea id=\\\"wgAi\\\" class=\\\"f-area\\\" placeholder=\\\"مثلاً: فردا ساعت ۱۰ صبح جلسه دارم\\\"></textarea>\": \"<textarea id=\\\"wgAi\\\" class=\\\"f-area\\\" placeholder=\\\"e.g.: I have a meeting tomorrow at 10 AM\\\"></textarea>\",\n  \"\\\" style=\\\"margin-top:8px;width:100%\\\">✨ بازسازی با AI</button></div>\": \"\\\" style=\\\"margin-top:8px;width:100%\\\">✨ Rebuild with AI</button></div>\",\n  \"ویرایش ویجت\": \"Edit widget\",\n  \"ویجت ذخیره شد ✅\": \"Widget saved ✅\",\n  \"ویجت حذف شد 🗑\": \"Widget deleted 🗑\",\n  \"پرامپت را بنویس ✍️\": \"Write a prompt ✍️\",\n  \"... دارم می‌سازمش\": \"... building it\",\n  \"✨ بازسازی با AI\": \"✨ Rebuild with AI\",\n  \"برد جلوتر ↑\": \"Move forward ↑\",\n  \"برد عقب‌تر ↓\": \"Move back ↓\",\n  \"بنویس چی بسازم ...\": \"Describe what to build ...\",\n  \"تازه شد 🔄\": \"Refreshed 🔄\",\n  \"مدل تصویر عوض شد ✅\": \"Image model changed ✅\",\n  \"نام عوض شد ✅\": \"Name changed ✅\",\n  \"حافظه پاک شد\": \"Memory cleared\",\n  \"ویرایش شد ✅\": \"Edited ✅\",\n  \"تاریخچه پاک شد 🧹\": \"History cleared 🧹\",\n  \"مدل عوض شد ✅\": \"Model changed ✅\",\n  \"شخصیت عوض شد ✅\": \"Personality changed ✅\",\n  \"<div class=\\\"f-row\\\" style=\\\"margin-bottom:6px\\\"><input id=\\\"mdlSearch\\\" placeholder=\\\"جستجوی مدل...\\\"></div>\": \"<div class=\\\"f-row\\\" style=\\\"margin-bottom:6px\\\"><input id=\\\"mdlSearch\\\" placeholder=\\\"Search models...\\\"></div>\",\n  \"سرویس‌ها\": \"Services\",\n  \" · 👁 ویژن\": \" · 👁 Vision\",\n  \"انتخاب مدل\": \"Select model\",\n  \"تم و چیدمان\": \"Theme & layout\",\n  \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">تم رنگی</div>\": \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">Color theme</div>\",\n  \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">چیدمان</div>\": \"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">Layout</div>\",\n  \"در حالت مرورگر، آدرس را در ورکر جدید عوض کن و رفرش بزن.\": \"In browser mode, change the address to the new worker and hit refresh.\",\n  \"اصلی\": \"Main\",\n  \"پروژه ربات\": \"Bot project\",\n  \"ایده‌های نوشتن\": \"Writing ideas\",\n  \"سلام! کیستی؟\": \"Hi! Who are you?\",\n  \"سلام بهراد جان! 👋 من دستیار شیشه‌ای تو هستم — همان مغز ورکر Cloudflare، فقط با ظاهر تازه.\\n\\n**بله:**\\n- حافظه بلندمدت 🧠\\n- سرچ وب با `/web`\\n- ویس دوطرفه 🎙\\n\\n```js\\nconsole.log(\\\"Liquid Glass ✨\\\");\\n```\\n\\nبپرس تا جواب بدهم.\": \"Hi there! 👋 I'm your glass assistant — the same Cloudflare worker brain, just with a fresh look.\\n\\n**Yes:**\\n- Long-term memory 🧠\\n- Web search with `/web`\\n- Two-way voice 🎙\\n\\n```js\\nconsole.log(\\\"Liquid Glass ✨\\\");\\n```\\n\\nAsk and I'll answer.\",\n  \"هوای نیشابور چطوره؟\": \"How's the weather in Nishapur?\",\n  \"🌤 **هوای نیشابور**\\n\\n- دما: ۲۴ درجه، نیمه‌ابری\\n- باد: ۱۱ کیلومتر بر ساعت\\n- رطوبت: ۳۸٪\\n\\n> برای پیش‌بینی ۲ روز آینده همین‌جا بپرس.\": \"🌤 **Nishapur weather**\\n\\n- Temperature: 24 degrees, partly cloudy\\n- Wind: 11 kilometers per hour\\n- Humidity: 38%\\n\\n> Ask right here for the 2-day forecast.\",\n  \"یادآور روزانه ۸ صبح ورزش بذار\": \"Set a daily 8 AM workout reminder\",\n  \"⏰ ثبت شد: **روزانه 08:00 ورزش** 🔁\\n\\nهر صبح ساعت ۸ به وقت تهران یادت می‌اندازم.\": \"⏰ Saved: **Daily 08:00 workout** 🔁\\n\\nI'll remind you every morning at 8 Tehran time.\",\n  \"اسم من بهراد است و پروژه اصلی‌ام ربات تلگرام AI است.\": \"My name is {{owner}} and my main project is an AI Telegram bot.\",\n  \"پروژه فعلی: اپ اندروید شیشه‌ای متصل به ورکر.\": \"Current project: a glassy Android app connected to the worker.\",\n  \"زبان ترجیحی همیشه فارسی، جواب کوتاه و بی‌حاشیه.\": \"Preferred language is always Persian, short and to-the-point answers.\",\n  \"چای دم کن\": \"Brew tea\",\n  \"ورزش\": \"Workout\",\n  \"استراحت کن\": \"Take a break\",\n  \"هوای نیشابور\": \"Nishapur weather\",\n  \"یادآور عصر\": \"Afternoon reminder\",\n  \"ساعت تهران\": \"Tehran time\",\n  \"خرید هفته\": \"Weekly shopping\",\n  \"شیر و ماست\": \"Milk & yogurt\",\n  \"نان تازه\": \"Fresh bread\",\n  \"میوه\": \"Fruit\",\n  \"تخم‌مرغ\": \"Eggs\",\n  \"آزادکلید\": \"Custom key\",\n  \"سرویس دوم\": \"Second service\",\n  \"مختصر و فنی\": \"Concise & technical\",\n  \"معلم صبور\": \"Patient teacher\",\n  \"مهندس برنامه\": \"Software engineer\",\n  \"### جواب نمونه (حالت پیش‌نمایش)\\n\\n\": \"### Sample answer (preview mode)\\n\\n\",\n  \"سؤال تو این بود: **\": \"Your question was: **\",\n  \"این پاسخ از *mock* می‌آید تا بدون ورکر هم بتوانی ظاهر و انیمیشن‌ها را ببینی:\\n\\n\": \"This answer comes from *mock* so you can see the look and animations even without a worker:\\n\\n\",\n  \"1. استریم زنده با مکان‌نما ✨\\n\": \"1. Live streaming with a cursor ✨\\n\",\n  \"2. کارت‌های شیشه‌ای با بلور\\n\": \"2. Glass cards with blur\\n\",\n  \"3. چهار تم و سه چیدمان\\n\\n\": \"3. Four themes and three layouts\\n\\n\",\n  \"```python\\n# نمونه کد\\nprint(\\\"Behrad AI — Liquid Glass\\\")\\n```\\n\\n\": \"```python\\n# Sample code\\nprint(\\\"Behrad AI — Liquid Glass\\\")\\n```\\n\\n\",\n  \"برای اتصال واقعی، آدرس ورکر و رمز داشبورد را در صفحه ورود بزن.\": \"For a real connection, enter the worker address and dashboard password on the login page.\",\n  \"🌤 در حال گرفتن هوا...\": \"🌤 Getting weather...\",\n  \"🌤 **هوای نیشابور**\\n\\n- دما: ۲۴° نیمه‌ابری\\n- باد: ۱۱ km/h\\n- رطوبت: ۳۸٪\": \"🌤 **Nishapur weather**\\n\\n- Temperature: 24° partly cloudy\\n- Wind: 11 km/h\\n- Humidity: 38%\",\n  \"حافظه خالی است.\": \"Memory is empty.\",\n  \"🧠 **حافظه بلندمدت (\": \"🧠 **Long-term memory (\",\n  \"🧹 گفتگوی تازه شروع شد.\": \"🧹 Fresh conversation started.\",\n  \"راهنما:\\n\\n- `/web جستجو` — سرچ وب\\n- `/weather` — هوای نیشابور\\n- `/remember متن` — سپردن به حافظه\\n- `/memory` — دیدن حافظه\\n- `/remind 18:30 چای` — یادآور\\n- `/brief` — خلاصه صبح\\n- `/new` — گفتگوی تازه\": \"Help:\\n\\n- `/web search` — web search\\n- `/weather` — Nishapur weather\\n- `/remember text` — save to memory\\n- `/memory` — view memory\\n- `/remind 18:30 tea` — reminder\\n- `/brief` — morning brief\\n- `/new` — fresh conversation\",\n  \"🧠 ذخیره شد: **\": \"🧠 Saved: **\",\n  \"عکس\": \"Photo\",\n  \"🔎 در حال جستجوی وب ...\": \"🔎 Searching the web ...\",\n  \"⚡ دارم می‌نویسم...\": \"⚡ Writing...\",\n  \"گفتگو \": \"Chat \",\n  \"این یک متن نمونه است که از ویس فهمیدم!\": \"This is sample text I understood from voice!\",\n  \"💰 بیت‌کوین: ۶۸٬۴۰۰ دلار (+۱.۲٪)\": \"💰 Bitcoin: $68,400 (+1.2%)\",\n  \" تو: \": \" You: \",\n  \"خروجی گفتگو — Behrad AI\\n\\n\": \"Conversation export — Behrad AI\\n\\n\",\n  \"پرامپت خالی است.\": \"Prompt is empty.\",\n  \"سقف ۱۲ ویجت پر است.\": \"Widget limit of 12 reached.\",\n  \"لیست\": \"List\",\n  \"مورد اول\": \"First item\",\n  \"مورد دوم\": \"Second item\",\n  \"مورد سوم\": \"Third item\",\n  \"یادآور روزانه\": \"Daily reminder\",\n  \"ویجت پیدا نشد.\": \"Widget not found.\",\n  \"عملیات نامشخص است.\": \"Unknown operation.\",\n  \"نام داده نامعتبر است.\": \"Invalid data name.\",\n  \"mock: مسیر ناشناخته \": \"mock: unknown path \",\n  \"[mock] پیش‌نمایش محلی فعال است\": \"[mock] Local preview is active\",\n\n};\n\n/* W(fa) — متنِ فارسی را در locale=en به انگلیسی برمی‌گرداند.\n   در همهٔ رشته‌های وب‌اپ دورِ متن فارسی می‌نشیند (کدمودِ build). */\nfunction W(fa) {\n  if (curLocale() !== 'en') return fa;\n  const en = WEB_I18N[fa];\n  return en != null && en !== '' ? en : fa;\n}\n"},"app-screens.js":{"t":"text/javascript; charset=utf-8","b":"/* ═══════════════════════════════════════════════════════════════\n   Behrad AI — اسکرین‌ها و رفتارها\n   ═══════════════════════════════════════════════════════════════ */\n'use strict';\n\n/* ثابت‌ها — باید با GEM_TTS_MODELS / GEM_STT_MODELS / GEM_IMG_MODELS ورکر یکی باشد\n   (اگر متفاوت باشد /api/v1/settings مدل را بی‌صدا رد می‌کند). اولویت با لیست\n   سرور است: bootState آن‌ها را روی S.gemModels می‌نشاند و این‌ها فقط فالبک‌اند. */\nconst GEM_TTS = [\n  { id: 'gemini-3.8-flash-tts', name: W(\"3.8 Flash TTS (پیشنهادی)\") },\n  { id: 'gemini-3.5-live-translate-preview', name: W(\"Live TTS (سریع و طبیعی)\") },\n  { id: 'gemini-2.5-flash-preview-tts', name: W(\"Flash TTS (کلاسیک)\") },\n  { id: 'gemini-2.5-pro-preview-tts', name: W(\"Pro TTS (باکیفیت بالا)\") },\n];\nconst GEM_STT = [\n  { id: 'gemini-3.5-transcribe', name: W(\"Transcribe (پیشنهادی، تخصصی STT)\") },\n  { id: 'gemini-3.5-live-translate-preview', name: W(\"Live Translate (سریع، چندزبانه)\") },\n  { id: 'gemini-2.5-flash', name: W(\"Flash (فهم صوت عمومی)\") },\n];\nconst GEM_IMG = [\n  { id: 'gemini-3.1-flash-lite-image', name: W(\"Flash Lite Image (پیشنهادی، ارزان)\") },\n  { id: 'gemini-3.1-flash-image', name: W(\"Flash Image (کیفیت بالاتر)\") },\n];\nconst GEM_VOICES = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir', 'Leda', 'Orus', 'Aoede', 'Callirrhoe', 'Autonoe',\n  'Enceladus', 'Iapetus', 'Umbriel', 'Algieba', 'Despina', 'Erinome', 'Algenib', 'Rasalgethi', 'Laomedeia',\n  'Achernar', 'Alnilam', 'Schedar', 'Gacrux', 'Pulcherrima', 'Achird', 'Zubenelgenubi', 'Vindemiatrix',\n  'Sadachbia', 'Sadaltager', 'Sulafat'];\nconst CMDS = ['/image ', '/web ', '/weather', '/crypto', '/remember ', '/memory', '/new', '/brief', '/export', '/help',\n  '/sum ', '/find ', '/gallery', '/todo ', '/task ', '/memfind ', '/video '];\nconst MEM_MAX = 50, THREAD_MAX = 15, VISION_MAX_N = 3, FILE_MAX = 150000;\n\n/* لیست‌های واقعی سرور (از /api/v1/state) — اگر نرسیده بود همان ثابت‌های بالا */\nfunction gemList(kind) {\n  const g = (S && S.gemModels) || {};\n  const arr = g[kind];\n  return Array.isArray(arr) && arr.length ? arr : (kind === 'tts' ? GEM_TTS : kind === 'stt' ? GEM_STT : GEM_IMG);\n}\n\n/* ═══════════ helpers ═══════════ */\nfunction scrollMsgs(force) {\n  const box = $('msgs');\n  const near = box.scrollHeight - box.scrollTop - box.clientHeight < 220;\n  if (force || near) box.scrollTop = box.scrollHeight;\n}\nfunction prepareMsgs() {\n  const em = $('msgs').querySelector('.empty');\n  if (em) em.remove();\n}\nfunction emptyChatHtml() {\n  return '<div class=\"empty\"><span class=\"em-ic\">🌊</span>' +\n    W(\"<div class=\\\"em-t\\\">شروع گفتگو</div>\") +\n    W(\"<div class=\\\"em-s\\\">هر چی بخواهی همین‌جاست: جستجوی وب، هوای نیشابور، یادآور، ویس و حافظه بلندمدت.<br>\") +\n    W(\"با <code>/</code> دستورها را ببین — مثل تلگرام، ولی شیشه‌ای‌تر ✨</div></div>\");\n}\nfunction setBusy(b) {\n  S.busy = b;\n  $('sendBtn').disabled = b;\n  $('micBtn').disabled = b;\n  $('sendBtn').classList.toggle('busy', b);\n  $('composer').style.opacity = b ? '.9' : '';\n}\nfunction addPill() {\n  prepareMsgs();\n  const p = document.createElement('div');\n  p.className = 'status-pill';\n  p.innerHTML = W(\"<span class=\\\"spin\\\"></span><span class=\\\"pt\\\">دارم فکر میکنم...</span>\");\n  $('msgs').appendChild(p);\n  scrollMsgs();\n  return {\n    update(html) {\n      p.innerHTML = '<span class=\"spin\"></span><span class=\"pt\">' + (html || '') + '</span>';\n      scrollMsgs();\n    },\n    remove() { p.remove(); },\n  };\n}\nfunction addBubbleEl(role, rawText) {\n  prepareMsgs();\n  const b = document.createElement('div');\n  b.className = 'bubble ' + role;\n  const t = document.createElement('div');\n  t.className = 'b-text';\n  t.innerHTML = role === 'user'\n    ? esc(rawText).replace(/\\n/g, '<br>')\n    : mdRender(rawText || '');\n  b.appendChild(t);\n  b._raw = rawText || '';\n  const m = document.createElement('div');\n  m.className = 'meta';\n  m.innerHTML = nowHM() + (role === 'user' ? ' ✓✓' : '');\n  b.appendChild(m);\n  $('msgs').appendChild(b);\n  return b;\n}\nfunction footFor(ab, label, tokens) {\n  let f = ab.querySelector('.b-foot');\n  if (!f) { f = document.createElement('div'); f.className = 'b-foot'; ab.insertBefore(f, ab.querySelector('.meta')); }\n  let lbl = f.querySelector('.lbl');\n  if (!lbl) { lbl = document.createElement('span'); lbl.className = 'lbl'; f.appendChild(lbl); }\n  if (label) lbl.textContent = label + (tokens ? ' · ' + tokens + W(\" توکن\") : '');\n  [['tts', '🔊'], ['copy', '📋'], ['regen', '🔄']].forEach(([k, ic]) => {\n    if (!f.querySelector('[data-f=\"' + k + '\"]')) {\n      const btn = document.createElement('button');\n      btn.className = 'foot-btn';\n      btn.dataset.f = k;\n      btn.textContent = ic + (k === 'regen' ? W(\" مجدد\") : '');\n      f.appendChild(btn);\n    }\n  });\n}\nfunction refreshFooters() {\n  const all = $('#msgs .bubble');\n  let lastAs = null;\n  all.forEach((b) => {\n    if (b.classList.contains('assistant')) lastAs = b;\n    const g = b.querySelector('[data-f=\"regen\"]');\n    if (g) g.remove();\n  });\n  // حباب تصویر تولیدشده دکمه «جدد» نمی‌گیرد (تولید تصویر در تاریخچه ذخیره نمی‌شود)\n  if (lastAs && !lastAs.classList.contains('has-img')) footFor(lastAs, lastAs._footLabel || '', lastAs._footTokens || 0);\n}\n\n/* ═══════════ چت ═══════════ */\nasync function loadHistory() {\n  const box = $('msgs');\n  box.innerHTML = '';\n  try {\n    const r = await API.get('/api/v1/history?thread=' + encodeURIComponent(S.thread));\n    S.hist = r.msgs || [];\n    if (!S.hist.length) { box.innerHTML = emptyChatHtml(); return; }\n    S.hist.forEach((m) => addBubbleEl(m.role === 'user' ? 'user' : 'assistant', m.content));\n    refreshFooters();\n    scrollMsgs(true);\n  } catch (e) {\n    box.innerHTML = emptyChatHtml();\n  }\n}\n\nasync function runCore(payload) {\n  if (S.busy) return;\n  setBusy(true);\n  if (S.screen !== 'chat') go('chat');\n  const pill = addPill();\n  const ab = addBubbleEl('assistant', '');\n  const body = ab.querySelector('.b-text');\n  body.innerHTML = '<span class=\"stream-caret\"></span>';\n  let got = false, err = null, done = null;\n  try {\n    await API.chat(Object.assign({ thread: S.thread }, payload), (ev) => {\n      if (ev.t === 'status') pill.update(ev.html);\n      else if (ev.t === 'regen') toast(W(\"تولید مجدد از «\") + String(ev.text || '').slice(0, 40) + '» ...');\n      else if (ev.t === 'delta') {\n        if (!got) { got = true; pill.remove(); }\n        body.innerHTML = mdRender(ev.text || '') + '<span class=\"stream-caret\"></span>';\n        scrollMsgs();\n      } else if (ev.t === 'done') { got = true; done = ev; pill.remove(); }\n      else if (ev.t === 'err') err = ev.msg;\n    });\n  } catch (e) { err = e.message || W(\"خطا\"); }\n\n  if (done) {\n    /* 🔊 صدای ساخته‌شده با /tts — data-URI روی همان پاسخ آمده، پس بلافاصله پخش میشود */\n    if (done.audio) {\n      try {\n        if (curAudio) curAudio.pause();\n        curAudio = new Audio(done.audio);\n        await curAudio.play();\n        haptic(16);\n      } catch (e) { toast(W(\"پخش صدا ناموفق بود\"), 'err'); }\n    }\n    /* 🎨 تصویر تولیدشده: data-URI داخل حباب + زیرش متن کپشن */\n    if (done.img && done.img.b64) {\n      const im = document.createElement('img');\n      im.className = 'gen-img';\n      im.alt = done.text || W(\"تصویر تولیدشده\");\n      im.src = 'data:' + (done.img.mime || 'image/png') + ';base64,' + done.img.b64;\n      body.innerHTML = '';\n      body.appendChild(im);\n      if (done.text) {\n        const cap = document.createElement('div');\n        cap.className = 'gen-cap';\n        cap.innerHTML = mdRender(done.text);\n        body.appendChild(cap);\n      }\n      ab._raw = done.text || '';\n      ab.classList.add('has-img');\n      const rg = ab.querySelector('[data-f=\"regen\"]'); if (rg) rg.remove();\n    } else {\n      body.innerHTML = mdRender(done.text || '');\n      ab._raw = done.text || '';\n    }\n    if (done.reset && !(done.img && done.img.b64)) { $('msgs').innerHTML = ''; const nb = addBubbleEl('assistant', done.text || ''); nb._raw = done.text || ''; }\n    else {\n      const f = done.footer || {};\n      if (f.label) { ab._footLabel = f.label; ab._footTokens = f.tokens; }\n      footFor(ab, ab._footLabel || (done.cmd ? '' : ''), ab._footTokens || 0);\n      if (done.cmd) { const g = ab.querySelector('[data-f=\"regen\"]'); if (g) g.remove(); }\n    }\n  } else if (err) {\n    pill.remove();\n    if (!got) { ab.classList.add('error'); body.innerHTML = '<b>❌ ' + esc(err) + '</b>'; }\n    else body.innerHTML += '<p style=\"color:var(--danger)\">❌ ' + esc(err) + '</p>';\n    toast(err, 'err');\n  } else {\n    pill.remove();\n    if (!got) ab.remove();\n  }\n  setBusy(false);\n  refreshFooters();\n  scrollMsgs(true);\n}\n\nasync function sendChat(text) {\n  text = (text || '').trim();\n  const photos = S.attaches.slice(0, VISION_MAX_N).map((a) => ({ mime: 'image/jpeg', b64: a.b64 }));\n  const file = S.fileAtt;\n  if (!text && !photos.length && !file) return;\n  if (S.busy) return;\n  let disp = text;\n  if (photos.length) disp = (disp ? disp + '\\n' : '') + '🖼 ' + photos.length + W(\" عکس\");\n  if (file) disp = (disp ? disp + '\\n' : '') + '📎 ' + file.name;\n  prepareMsgs();\n  addBubbleEl('user', disp);\n  scrollMsgs();\n  S.attaches = []; S.fileAtt = null;\n  renderChips();\n  $('input').value = '';\n  autoGrow();\n  updateQuick();\n  await runCore({ text: text, photos: photos, file: file });\n}\n\nasync function doRegen() {\n  if (S.busy) return;\n  const bs = $('#msgs .bubble.assistant');\n  const last = bs[bs.length - 1];\n  if (last) last.remove();\n  await runCore({ regen: true });\n}\n\nfunction autoGrow() {\n  const el = $('input');\n  el.style.height = 'auto';\n  el.style.height = Math.min(132, el.scrollHeight) + 'px';\n}\nfunction updateQuick() {\n  const v = $('input').value;\n  const q = $('quick');\n  if (v.startsWith('/')) {\n    q.hidden = false;\n    if (!q.childElementCount) {\n      q.innerHTML = CMDS.map((c) => '<button data-c=\"' + esc(c) + '\">' + esc(c.trim()) + '</button>').join('');\n    }\n  } else q.hidden = true;\n}\n\nfunction wireChat() {\n  const input = $('input');\n  input.addEventListener('input', () => { autoGrow(); updateQuick(); });\n  input.addEventListener('keydown', (e) => {\n    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(input.value); }\n  });\n  $('sendBtn').addEventListener('click', () => sendChat(input.value));\n  $('quick').addEventListener('click', (e) => {\n    const b = e.target.closest('button[data-c]');\n    if (!b) return;\n    input.value = b.dataset.c;\n    input.focus();\n    autoGrow();\n  });\n\n  /* پیوست */\n  $('attachBtn').addEventListener('click', () => {\n    openSheet(W(\"افزودن پیوست\"),\n      '<div class=\"list\">' +\n      W(\"<div class=\\\"item\\\" data-act=\\\"act-img\\\"><span class=\\\"ic\\\">🖼</span><div class=\\\"mid\\\"><div class=\\\"t1\\\">عکس</div><div class=\\\"t2\\\">حداکثر \") + VISION_MAX_N + W(\" عکس — برای مدل 👁</div></div><span class=\\\"chev\\\">‹</span></div>\") +\n      W(\"<div class=\\\"item\\\" data-act=\\\"act-txt\\\"><span class=\\\"ic\\\">📄</span><div class=\\\"mid\\\"><div class=\\\"t1\\\">فایل متنی / کد</div><div class=\\\"t2\\\">تا \") + Math.round(FILE_MAX / 1000) + W(\" کیلوبایت</div></div><span class=\\\"chev\\\">‹</span></div>\") +\n      '</div>');\n  });\n  $('fileImg').addEventListener('change', async (e) => {\n    const files = Array.from(e.target.files || []).slice(0, VISION_MAX_N);\n    e.target.value = '';\n    for (const f of files) {\n      if (S.attaches.length >= VISION_MAX_N) { toast(W(\"سقف \") + VISION_MAX_N + W(\" عکس\"), 'err'); break; }\n      try {\n        const b64 = await imgToJpeg(f);\n        S.attaches.push({ b64: b64 });\n      } catch (err) { toast(W(\"عکس خوانده نشد\"), 'err'); }\n    }\n    renderChips();\n  });\n  $('fileTxt').addEventListener('change', (e) => {\n    const f = (e.target.files || [])[0];\n    e.target.value = '';\n    if (!f) return;\n    if (f.size > FILE_MAX * 4) { toast(W(\"فایل خیلی بزرگ است\"), 'err'); return; }\n    const rd = new FileReader();\n    rd.onload = () => {\n      S.fileAtt = { name: f.name, text: String(rd.result || '').slice(0, FILE_MAX) };\n      renderChips();\n      toast(W(\"فایل «\") + f.name.slice(0, 24) + W(\"» آماده ارسال\"), 'ok');\n    };\n    rd.readAsText(f);\n  });\n  $('attachChips').addEventListener('click', (e) => {\n    const x = e.target.closest('.x');\n    if (!x) return;\n    if (x.dataset.f) S.fileAtt = null;\n    else S.attaches.splice(+x.dataset.i, 1);\n    renderChips();\n  });\n\n  /* کلیک‌های روی پیام‌ها */\n  $('msgs').addEventListener('click', (e) => {\n    const cb = e.target.closest('.copy-btn');\n    if (cb) {\n      const pre = cb.closest('pre');\n      try { navigator.clipboard.writeText(decodeURIComponent(pre.dataset.code || '')); toast(W(\"کد کپی شد\"), 'ok'); } catch (er) {}\n      return;\n    }\n    const fb = e.target.closest('.foot-btn');\n    if (fb) {\n      const b = fb.closest('.bubble');\n      const k = fb.dataset.f;\n      if (k === 'copy') { try { navigator.clipboard.writeText(b._raw || ''); toast(W(\"کپی شد\"), 'ok'); } catch (er) {} }\n      else if (k === 'tts') playTts(fb, b._raw || '');\n      else if (k === 'regen') doRegen();\n      return;\n    }\n    const a = e.target.closest('a');\n    if (a && a.href) {\n      e.preventDefault();\n      if (window.Android && Android.openUrl) Android.openUrl(a.href);\n      else window.open(a.href, '_blank');\n      return;\n    }\n    if (e.target.closest('.empty')) $('input').focus();\n  });\n\n  /* ویس */\n  $('micBtn').addEventListener('click', () => { if (S.rec) stopRec(true); else startRec(); });\n  $('recCancel').addEventListener('click', () => stopRec(false));\n}\n\nfunction renderChips() {\n  const box = $('attachChips');\n  let html = S.attaches.map((a, i) =>\n    '<div class=\"c-chip\" style=\"animation-delay:' + (i * 60) + 'ms\"><img src=\"data:image/jpeg;base64,' + a.b64 + '\">' +\n    '<button class=\"x\" data-i=\"' + i + '\">✕</button></div>').join('');\n  if (S.fileAtt) {\n    html += '<div class=\"c-chip file\">📄<br>' + esc(S.fileAtt.name.slice(0, 12)) +\n      '<button class=\"x\" data-f=\"1\">✕</button></div>';\n  }\n  box.innerHTML = html;\n  box.hidden = !html;\n}\n\nfunction imgToJpeg(file, max, q) {\n  max = max || 1280; q = q || 0.85;\n  return new Promise((res, rej) => {\n    const url = URL.createObjectURL(file);\n    const im = new Image();\n    im.onload = () => {\n      let w = im.naturalWidth, h = im.naturalHeight;\n      const sc = Math.min(1, max / Math.max(w, h));\n      w = Math.max(1, Math.round(w * sc)); h = Math.max(1, Math.round(h * sc));\n      const c = document.createElement('canvas');\n      c.width = w; c.height = h;\n      c.getContext('2d').drawImage(im, 0, 0, w, h);\n      URL.revokeObjectURL(url);\n      const d = c.toDataURL('image/jpeg', q);\n      res(d.slice(d.indexOf(',') + 1));\n    };\n    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('bad image')); };\n    im.src = url;\n  });\n}\n\n/* ─── پخش صدا ─── */\nlet curAudio = null, curBtn = null;\nasync function playTts(btn, raw) {\n  if (!raw) { toast(W(\"متنی نیست\"), 'err'); return; }\n  if (curBtn === btn && curAudio && !curAudio.paused) { curAudio.pause(); btn.textContent = '🔊'; haptic(10); return; }\n  if (curAudio) { curAudio.pause(); if (curBtn) curBtn.textContent = '🔊'; }\n  const old = btn.textContent;\n  btn.textContent = '…';\n  try {\n    const res = await API.req('/api/v1/tts', { method: 'POST', body: { text: raw.slice(0, 900) } });\n    const blob = await res.blob();\n    curAudio = new Audio(URL.createObjectURL(blob));\n    curBtn = btn;\n    curAudio.onended = () => { btn.textContent = '🔊'; };\n    await curAudio.play();\n    btn.textContent = '⏸';\n    haptic(16);\n  } catch (e) {\n    btn.textContent = old;\n    toast(e.message || W(\"صدایی ساخته نشد\"), 'err');\n  }\n}\n\n/* ─── ضبط ویس ─── */\nasync function startRec() {\n  try {\n    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });\n    /* ترتیب مهم است: گوگل فقط WAV/MP3/AAC(m4a)/OGG/FLAC می‌پذیرد، نه webm.\n       پس اول سراغ audio/mp4 و audio/ogg می‌رویم تا «فهم ویس با گوگل» (همان\n       که فینگلیش نمی‌دهد) واقعاً از اپ هم اجرا شود؛ webm فقط فالبک آخر است. */\n    const mime = ['audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/webm;codecs=opus', 'audio/webm', '']\n      .find((m) => !m || !window.MediaRecorder || MediaRecorder.isTypeSupported(m));\n    const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);\n    const chunks = [];\n    let wantSend = true;\n    const wave = $('recWave');\n    wave.innerHTML = Array.from({ length: 22 }, () => '<i></i>').join('');\n    const bars = Array.from(wave.children);\n\n    const ctx = new (window.AudioContext || window.webkitAudioContext)();\n    const src = ctx.createMediaStreamSource(stream);\n    const an = ctx.createAnalyser();\n    an.fftSize = 128;\n    src.connect(an);\n    const data = new Uint8Array(an.frequencyBinCount);\n    let raf = 0;\n    const loop = () => {\n      an.getByteFrequencyData(data);\n      for (let i = 0; i < bars.length; i++) {\n        const v = data[Math.floor(i * data.length / bars.length)] || 0;\n        bars[i].style.height = Math.max(12, Math.min(100, (v / 255) * 130)) + '%';\n      }\n      raf = requestAnimationFrame(loop);\n    };\n    loop();\n\n    const t0 = Date.now();\n    const timer = setInterval(() => {\n      const s = Math.floor((Date.now() - t0) / 1000);\n      $('recTime').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');\n      if (s >= 120) stopRec(true);\n    }, 400);\n\n    mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };\n    mr.onstop = async () => {\n      clearInterval(timer);\n      cancelAnimationFrame(raf);\n      try { ctx.close(); } catch (e) {}\n      stream.getTracks().forEach((t) => t.stop());\n      $('cRec').hidden = true;\n      $('cRow').hidden = false;\n      $('micBtn').classList.remove('listening');\n      S.rec = null;\n      if (!wantSend) return;\n      const blob = new Blob(chunks, { type: mime || 'audio/webm' });\n      if (!blob.size) { toast(W(\"ویسی ضبط نشد\"), 'err'); return; }\n      setBusy(true);\n      try {\n        const fd = new FormData();\n        fd.append('file', blob, 'voice.' + ((mime || 'webm').split(';')[0].split('/')[1] || 'webm'));\n        const r = await API.req('/api/v1/stt', { method: 'POST', body: fd });\n        setBusy(false);\n        if (r.text && r.text.trim()) { haptic(20); await sendChat(r.text.trim()); }\n        else toast(W(\"چیزی فهمیده نشد — دوباره بگو\"), 'err');\n      } catch (e) {\n        setBusy(false);\n        toast(e.message || W(\"ویس پردازش نشد\"), 'err');\n      }\n    };\n\n    mr.start(250);\n    S.rec = mr;\n    $('recTime').textContent = '0:00';\n    $('cRec').hidden = false;\n    $('cRow').hidden = true;\n    $('micBtn').classList.add('listening');\n    haptic(25);\n    S._stopRec = (send) => { wantSend = send; try { mr.stop(); } catch (e) {} };\n  } catch (e) {\n    toast(W(\"میکروفون در دسترس نیست — اجازه را بده\"), 'err');\n  }\n}\nfunction stopRec(send) {\n  if (S._stopRec) S._stopRec(send);\n}\n\n/* ═══════════ گفتگوها ═══════════ */\nfunction renderThreads() {\n  $('thCount').textContent = '(' + S.threads.length + '/' + THREAD_MAX + ')';\n  const list = $('thList');\n  if (!S.threads.length) {\n    list.innerHTML = W(\"<div class=\\\"empty\\\"><span class=\\\"em-ic\\\">🗂</span><div class=\\\"em-t\\\">گفتگویی نیست</div></div>\");\n    return;\n  }\n  list.innerHTML = S.threads.slice().reverse().map((t, i) => {\n    const d = t.ts ? new Date(t.ts) : null;\n    const when = d ? d.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }) + ' · ' +\n      String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') : '';\n    return '<div class=\"item' + (t.id === S.thread ? ' active' : '') + '\" style=\"--i:' + i + '\" data-id=\"' + esc(t.id) + '\">' +\n      '<span class=\"ic\">' + (t.id === S.thread ? '💬' : '🗨') + '</span>' +\n      '<div class=\"mid\"><div class=\"t1\" style=\"white-space:normal\">' + esc(t.name || t.id) + '</div>' +\n      '<div class=\"t2\">' + esc(when) + (t.id === S.thread ? W(\" · فعال\") : '') + '</div></div>' +\n      '<div class=\"act\">' +\n      W(\"<button class=\\\"mini-btn\\\" data-op=\\\"ren\\\" title=\\\"نام\\\">✏️</button>\") +\n      W(\"<button class=\\\"mini-btn del\\\" data-op=\\\"del\\\" title=\\\"حذف\\\">🗑</button></div></div>\");\n  }).join('');\n}\nfunction wireThreads() {\n  $('thNew').addEventListener('click', async () => {\n    try {\n      const r = await API.post('/api/v1/thread', { op: 'new' });\n      S.threads = r.threads; S.thread = r.thread;\n      toast(W(\"گفتگوی تازه ساخته شد ✨\"), 'ok');\n      haptic(20);\n      loadHistory();\n      go('chat');\n    } catch (e) { toast(e.message, 'err'); }\n  });\n  $('thList').addEventListener('click', async (e) => {\n    const item = e.target.closest('.item[data-id]');\n    if (!item) return;\n    const id = item.dataset.id;\n    const op = (e.target.closest('[data-op]') || {}).dataset;\n    if (op && op.op === 'del') {\n      if (S.threads.length <= 1) { toast(W(\"حداقل یک گفتگو بماند\"), 'err'); return; }\n      openSheet(W(\"حذف گفتگو؟\"),\n        '<p style=\"text-align:center;color:var(--muted);line-height:2.2\">«' + esc(item.querySelector('.t1').textContent) +\n        W(\"» و تاریخچه‌اش پاک می‌شود.</p><div class=\\\"f-row\\\" style=\\\"justify-content:center;margin-top:14px\\\">\") +\n        '<button class=\"btn danger-ghost\" data-act=\"do-del\" data-id=\"' + esc(id) + W(\"\\\">حذف شود</button>\") +\n        W(\"<button class=\\\"btn ghost\\\" data-act=\\\"close\\\">انصراف</button></div>\"));\n      return;\n    }\n    if (op && op.op === 'ren') {\n      openSheet(W(\"نام گفتگو\"),\n        '<div class=\"f-row\"><input id=\"renIn\" value=\"' + esc((S.threads.find((t) => t.id === id) || {}).name || '') + '\">' +\n        '<button class=\"btn acc sm\" data-act=\"do-ren\" data-id=\"' + esc(id) + W(\"\\\">ذخیره</button></div>\"));\n      setTimeout(() => { const el = $('renIn'); if (el) { el.focus(); el.select(); } }, 350);\n      return;\n    }\n    try {\n      const r = await API.post('/api/v1/thread', { op: 'select', id: id });\n      S.threads = r.threads; S.thread = r.thread;\n      closeSheet();\n      go('chat');\n      loadHistory();\n    } catch (er) { toast(er.message, 'err'); }\n  });\n}\n\n/* ═══════════ حافظه ═══════════ */\nasync function renderMemory() {\n  const list = $('memList');\n  list.innerHTML = '<div class=\"skeleton\" style=\"height:64px\"></div><div class=\"skeleton\" style=\"height:64px\"></div>';\n  try {\n    const r = await API.get('/api/v1/memory');\n    const items = r.items || [];\n    S.memCount = items.length;\n    S.memMax = r.max || MEM_MAX;\n    $('memCount').textContent = items.length + '/' + S.memMax;\n    if (!items.length) {\n      list.innerHTML = W(\"<div class=\\\"empty\\\"><span class=\\\"em-ic\\\">🧠</span><div class=\\\"em-t\\\">حافظه خالی است</div>\") +\n        W(\"<div class=\\\"em-s\\\">خودکار از حرف‌هایت یاد می‌گیرم، یا همین‌جا اضافه کن.</div></div>\");\n      return;\n    }\n    list.innerHTML = items.map((x, i) =>\n      '<div class=\"item\" style=\"--i:' + i + '\"><span class=\"ic\">🧠</span>' +\n      '<div class=\"mid\"><div class=\"t1\" style=\"white-space:normal\">' + esc(x.t) + '</div></div>' +\n      '<div class=\"act\"><button class=\"mini-btn edit\" data-id=\"' + esc(x.id) + '\">✏️</button>' +\n      '<button class=\"mini-btn del\" data-id=\"' + esc(x.id) + '\">🗑</button></div></div>').join('');\n  } catch (e) {\n    list.innerHTML = '<div class=\"empty\"><div class=\"em-s\">' + esc(e.message) + '</div></div>';\n  }\n}\nfunction wireMemory() {\n  $('memAdd').addEventListener('click', async () => {\n    const v = $('memInput').value.trim();\n    if (!v) return;\n    try {\n      const r = await API.post('/api/v1/memory', { op: 'add', text: v });\n      if (r.added === false) toast(W(\"این را از قبل داشتم\"), 'err');\n      else { toast(W(\"در حافظه ذخیره شد ✨\"), 'ok'); haptic(20); }\n      $('memInput').value = '';\n      renderMemory();\n    } catch (e) { toast(e.message, 'err'); }\n  });\n  $('memClear').addEventListener('click', () => {\n    openSheet(W(\"پاک کردن کل حافظه؟\"),\n      W(\"<p style=\\\"text-align:center;color:var(--muted);line-height:2.2\\\">همه \") + S.memCount +\n      W(\" خاطره پاک می‌شود و دیگر برنمی‌گردد.</p><div class=\\\"f-row\\\" style=\\\"justify-content:center;margin-top:14px\\\">\") +\n      W(\"<button class=\\\"btn danger-ghost\\\" data-act=\\\"do-memclear\\\">پاک شود</button>\") +\n      W(\"<button class=\\\"btn ghost\\\" data-act=\\\"close\\\">انصراف</button></div>\"));\n  });\n  $('memInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('memAdd').click(); });\n  $('memList').addEventListener('click', async (e) => {\n    const del = e.target.closest('.del');\n    const ed = e.target.closest('.edit');\n    if (del) {\n      try { await API.post('/api/v1/memory', { op: 'del', id: del.dataset.id }); toast(W(\"حذف شد\"), 'ok'); renderMemory(); }\n      catch (er) { toast(er.message, 'err'); }\n    } else if (ed) {\n      const t = ed.closest('.item').querySelector('.t1').textContent;\n      openSheet(W(\"ویرایش خاطره\"),\n        '<div class=\"f-row\"><input id=\"memEd\" value=\"' + esc(t) + '\" style=\"min-width:0\">' +\n        '<button class=\"btn acc sm\" data-act=\"do-memedit\" data-id=\"' + esc(ed.dataset.id) + W(\"\\\">ذخیره</button></div>\"));\n      setTimeout(() => { const el = $('memEd'); if (el) { el.focus(); el.select(); } }, 350);\n    }\n  });\n}\n\n/* ═══════════ یادآورها ═══════════ */\nasync function renderReminders() {\n  const list = $('rmList');\n  list.innerHTML = '<div class=\"skeleton\" style=\"height:64px\"></div>';\n  try {\n    const r = await API.get('/api/v1/reminders');\n    const items = (r.items || []).slice().sort((a, b) => (a.at || 0) - (b.at || 0));\n    if (!items.length) {\n      list.innerHTML = W(\"<div class=\\\"empty\\\"><span class=\\\"em-ic\\\">⏰</span><div class=\\\"em-t\\\">یادآوری نداری</div>\") +\n        W(\"<div class=\\\"em-s\\\">مثلاً بنویس: <code>روزانه 08:00 ورزش</code><br>یا <code>18:30 چای دم کن</code></div></div>\");\n      return;\n    }\n    list.innerHTML = items.map((x, i) => {\n      const d = new Date(x.at);\n      const when = isNaN(d) ? '' : d.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }) + W(\" ساعت \") +\n        String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');\n      return '<div class=\"item\" style=\"--i:' + i + '\">' +\n        '<span class=\"ic\">' + (x.repeat === 'daily' ? '🔁' : '⏰') + '</span>' +\n        '<div class=\"mid\"><div class=\"t1\" style=\"white-space:normal\">' + esc(x.txt) + '</div>' +\n        '<div class=\"t2\">' + esc(when) + '</div></div>' +\n        (x.repeat === 'daily' ? W(\"<span class=\\\"badge green\\\">روزانه</span>\") : '') +\n        '<div class=\"act\"><button class=\"mini-btn del\" data-key=\"' + esc(x.key) + '\">🗑</button></div></div>';\n    }).join('');\n  } catch (e) {\n    list.innerHTML = '<div class=\"empty\"><div class=\"em-s\">' + esc(e.message) + '</div></div>';\n  }\n}\nfunction wireReminders() {\n  $('rmAdd').addEventListener('click', async () => {\n    const v = $('rmInput').value.trim();\n    if (!v) return;\n    try {\n      const r = await API.post('/api/v1/reminders', { op: 'add', text: v });\n      toast(W(\"یادآور ثبت شد ✅ \") + (r.atLabel ? '(' + r.atLabel + ')' : ''), 'ok');\n      haptic(20);\n      $('rmInput').value = '';\n      renderReminders();\n    } catch (e) { toast(e.message, 'err'); }\n  });\n  $('rmInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('rmAdd').click(); });\n  $('rmList').addEventListener('click', async (e) => {\n    const del = e.target.closest('.del');\n    if (!del) return;\n    try { await API.post('/api/v1/reminders', { op: 'del', key: del.dataset.key }); toast(W(\"حذف شد\"), 'ok'); renderReminders(); }\n    catch (er) { toast(er.message, 'err'); }\n  });\n}\n\n/* ═══════════ تنظیمات ═══════════ */\nfunction sw(key, on) { return '<button class=\"sw' + (on ? ' on' : '') + '\" data-toggle=\"' + key + '\"></button>'; }\nfunction rowTgl(ic, t1, t2, key, on) {\n  return '<div class=\"row\" data-key=\"' + key + '\"><span class=\"ic\">' + ic + '</span>' +\n    '<div class=\"mid\"><div class=\"t1\">' + t1 + '</div>' + (t2 ? '<div class=\"t2\">' + t2 + '</div>' : '') + '</div>' +\n    sw(key, on) + '</div>';\n}\nfunction rowNav(ic, t1, t2, act) {\n  return '<div class=\"row click\" data-act=\"' + act + '\"><span class=\"ic\">' + ic + '</span>' +\n    '<div class=\"mid\"><div class=\"t1\">' + t1 + '</div>' + (t2 ? '<div class=\"t2\">' + t2 + '</div>' : '') + '</div>' +\n    '<span class=\"chev\">‹</span></div>';\n}\nfunction rowSlider(ic, t1, key, val, min, max, step, fmt) {\n  const p = ((val - min) / (max - min)) * 100;\n  return '<div class=\"row slider-row\" data-slider=\"' + key + '\"><div class=\"sr-top\"><span class=\"ic\">' + ic + '</span>' +\n    '<div class=\"mid\"><div class=\"t1\">' + t1 + '</div></div>' +\n    '<span class=\"val\" data-v=\"' + key + '\">' + fmt(val) + '</span></div>' +\n    '<input type=\"range\" min=\"' + min + '\" max=\"' + max + '\" step=\"' + step + '\" value=\"' + val +\n    '\" data-fmt=\"' + key + '\" style=\"--p:' + p + '%\"></div>';\n}\nfunction sec(title, rows, i) {\n  return '<div class=\"sec\" style=\"--i:' + (i || 0) + '\"><div class=\"sec-t\">' + title + '</div><div class=\"sec-box\">' +\n    rows.join('') + '</div></div>';\n}\nfunction themePickHtml() {\n  return '<div class=\"pick-grid\">' + THEMES.map((t) =>\n    '<div class=\"pick' + (S.theme === t ? ' on' : '') + '\" data-theme-pick=\"' + t + '\">' +\n    '<span class=\"pk-check\">✓</span><div class=\"pk-t\">' + THEME_NAMES[t] + '</div>' +\n    '<div class=\"pk-s\">' + THEME_DESC[t] + '</div>' +\n    '<div class=\"pk-swatches\">' + THEME_DOTS[t].map((c) => '<i style=\"background:' + c + '\"></i>').join('') + '</div></div>').join('') + '</div>';\n}\nfunction layoutPickHtml() {\n  return '<div class=\"pick-grid\">' + LAYOUTS.map((l) =>\n    '<div class=\"pick' + (S.layout === l ? ' on' : '') + '\" data-layout-pick=\"' + l + '\">' +\n    '<span class=\"pk-check\">✓</span><div class=\"pk-t\">' + LAYOUT_NAMES[l] + '</div>' +\n    '<div class=\"pk-s\">' + LAYOUT_DESC[l] + '</div>' +\n    '<div class=\"pk-prev\"><span class=\"pp-b\" style=\"top:8px;right:8px;width:38%\"></span>' +\n    '<span class=\"pp-b\" style=\"top:20px;left:8px;width:54%;opacity:.6\"></span>' +\n    '<span class=\"pp-d\"></span></div></div>').join('') + '</div>';\n}\n\nfunction renderSettings() {\n  const s = S.settings || {};\n  const persona = S.personas[s.persona];\n  $('setBody').innerHTML = [\n    sec(W(\"چت و مدل\"), [\n      rowNav('🤖', W(\"مدل فعال\"), esc(S.currentModel.label || ''), 'act-model'),\n      rowNav('🎭', W(\"شخصیت (پرسونا)\"), persona ? esc(persona.icon + ' ' + persona.name) : W(\"پیش‌فرض\"), 'act-persona'),\n      rowSlider('🌡', W(\"دما (خلاقیت)\"), 'temperature', s.temperature == null ? 0.8 : s.temperature, 0, 2, 0.05,\n        (v) => (+v).toFixed(2)),\n      rowSlider('📏', W(\"حداکثر توکن خروجی\"), 'maxTokens', s.maxTokens || 2048, 256, 8192, 128, (v) => Math.round(v)),\n      rowSlider('⛽', W(\"سقف روزانه (هزار توکن — صفر = بدون سقف)\"), 'dailyLimit', s.dailyLimit || 0, 0, 500, 10, (v) => Math.round(v)),\n      rowTgl('⚡', W(\"جریان زنده پاسخ\"), W(\"متن تیک‌تیک روی صفحه بیاید\"), 'liveStream', !!s.liveStream),\n      rowTgl('🔗', W(\"خواندن لینک‌ها\"), W(\"محتوای لینک داخل پیام خودکار خوانده شود\"), 'readLinks', !!s.readLinks),\n      rowTgl('👁', W(\"سوییچ خودکار به مدل 👁\"), W(\"اگر مدل عکس نفهمد، خودکار مدل ویژن بیاید\"), 'autoVision', !!s.autoVision),\n      rowTgl('🛟', W(\"سوییچ خودکار مدل\"), W(\"هنگام خطا مدل رایگان جایگزین شود\"), 'autoFallback', !!s.autoFallback),\n      rowTgl('🔎', W(\"سرچ خودکار وب\"), W(\"وقتی سؤال تازه وبی است Tavily خودکار بزند\"), 'searchAuto', !!s.searchAuto),\n      rowTgl('🎨', W(\"تولید تصویر\"), W(\"با دستور /image عکس بسازد — با GEMINI_API_KEY باکیفیت‌تر، بدون کلید هم می‌سازد (رایگان)\"), 'imgGen', s.imgGen !== false),\n      rowNav('🖼', W(\"مدل تولید تصویر\"), esc(s.imgModel || 'gemini-3.1-flash-lite-image'), 'act-imgmodel'),\n      rowTgl('🆓', W(\"فالبک رایگان تصویر\"), W(\"اگر کلید گوگل نبود یا ۴۲۹ داد، pollinations رایگان عکس بسازد\"), 'imgFree', s.imgFree !== false),\n      rowTgl('🖌', W(\"ویرایش عکس\"), W(\"عکس را با کپشن «ویرایش: …» بفرست تا تغییرش بدم\"), 'imgEdit', s.imgEdit !== false),\n      rowTgl('🗣', W(\"یادآور از متن آزاد\"), W(\"«فردا ساعت ۵ یادم بنداز…» بدون دستور /remind\"), 'nlRemind', s.nlRemind !== false),\n      rowTgl('🧠', W(\"حافظهٔ خودکار\"), W(\"از گفتگو خاطره استخراج شود و در پاسخ‌ها لحاظ شود\"), 'memAuto', s.memAuto !== false),\n      rowTgl('🗄', W(\"بکاپ خودکار هفتگی\"), W(\"هر جمعه فایل JSON بکاپ در Saved Messages\"), 'weeklyBackup', s.weeklyBackup !== false),\n      rowTgl('🔌', W(\"قطع خودکار سرویس خراب\"), W(\"سرویس کاستومی که چند بار خطا داد، چند دقیقه کنار گذاشته شود\"), 'cbBreaker', s.cbBreaker !== false),\n      rowTgl('🎬', W(\"خلاصهٔ یوتیوب\"), W(\"لینک یوتیوب → خواندن زیرنویس و خلاصه کردن\"), 'ytSum', s.ytSum !== false),\n      (S.flags && S.flags.gemini ? '' :\n        W(\"<div class=\\\"row\\\"><span class=\\\"ic\\\">🔑</span><div class=\\\"mid\\\"><div class=\\\"t1\\\" style=\\\"color:var(--danger)\\\">GEMINI_API_KEY ست نشده</div>\") +\n        W(\"<div class=\\\"t2\\\">تصویر و صدای گوگل کار نمی‌کند — Worker ← Settings ← Secrets</div></div></div>\")),\n      '<div class=\"row slider-row\"><div class=\"sr-top\"><span class=\"ic\">✏️</span><div class=\"mid\">' +\n      W(\"<div class=\\\"t1\\\">پرامپت سیستمی دلخواه</div><div class=\\\"t2\\\">سقف \") + 2000 + W(\" کاراکتر — اولویت بالا</div></div>\") +\n      W(\"<button class=\\\"foot-btn\\\" data-act=\\\"do-sysave\\\">ذخیره</button></div>\") +\n      W(\"<textarea class=\\\"f-area\\\" id=\\\"sysArea\\\" maxlength=\\\"2000\\\" placeholder=\\\"مثلاً: همیشه کوتاه و بی‌حاشیه جواب بده...\\\">\") +\n      esc(s.sysCustom || '') + '</textarea></div>',\n    ], 0),\n    sec(W(\"صدا و صبح\"), [\n      rowTgl('🔊', W(\"پاسخ صوتی\"), W(\"جواب‌ها با وویس انتخابی تولید شود\"), 'voiceReply', !!s.voiceReply),\n      W(\"<div class=\\\"row\\\"><span class=\\\"ic\\\">🎛</span><div class=\\\"mid\\\"><div class=\\\"t1\\\">موتور صدا</div>\") +\n      W(\"<div class=\\\"t2\\\">کلادفلر (رایگان) یا گوگل AI Studio</div></div></div>\") +\n      '<div class=\"row\" style=\"padding-top:0\"><div class=\"seg\" data-seg=\"voiceProv\">' +\n      '<span class=\"seg-pill\"></span>' +\n      '<button data-v=\"cf\" class=\"' + (s.voiceProv === 'cf' ? 'on' : '') + W(\"\\\">کلادفلر</button>\") +\n      '<button data-v=\"google\" class=\"' + (s.voiceProv !== 'cf' ? 'on' : '') + W(\"\\\">گوگل</button></div></div>\"),\n      rowNav('🎙', W(\"استودیو صدا\"), W(\"مدل‌ها، ۳۰ وویس و تست صدا\"), 'act-voice'),\n      rowTgl('🌅', W(\"خلاصه صبحگاهی ساعت \") + (S.briefHour || 10) + W(\":۰۰\"), W(\"هر صبح خلاصه روز به وقت تهران\"), 'briefing', !!s.briefing),\n    ], 1),\n    sec(W(\"ظاهر\"), [\n      W('<div class=\"row\" style=\"border:none\"><div class=\"mid\"><div class=\"t1\">' + W('زبان') + '</div><div class=\"t2\">' + W('زبان رابط و پاسخ‌های ربات') + '</div></div></div>') +\n      '<div class=\"row\" style=\"border:none;padding-top:0\"><div class=\"seg\" id=\"localeSeg\">' +\n        '<button class=\"seg-b\" data-loc=\"fa\">🇮🇷 ' + W('فارسی') + '</button>' +\n        '<button class=\"seg-b\" data-loc=\"en\">🇬🇧 English</button></div></div>',\n      W(\"<div class=\\\"row\\\" style=\\\"border:none;padding-bottom:4px\\\"><div class=\\\"mid\\\"><div class=\\\"t1\\\">تم رنگی</div>\") +\n      W(\"<div class=\\\"t2\\\">چهار تم تیره — آبی، سبز، قرمز، طوفانی</div></div></div>\") +\n      '<div class=\"row\" style=\"border:none;padding-top:0\">' + themePickHtml() + '</div>',\n      W(\"<div class=\\\"row\\\" style=\\\"border:none;padding-bottom:4px\\\"><div class=\\\"mid\\\"><div class=\\\"t1\\\">چیدمان</div>\") +\n      W(\"<div class=\\\"t2\\\">سه چینش متفاوت برای هر سلیقه</div></div></div>\") +\n      '<div class=\"row\" style=\"border:none;padding-top:0\">' + layoutPickHtml() + '</div>',\n    ], 2),\n    sec(W(\"داده‌ها\"), [\n      rowNav('🧹', W(\"شروع گفتگوی تازه\"), W(\"تاریخچه همین گفتگو پاک شود\"), 'act-clearhist'),\n      rowNav('📤', W(\"خروجی گفتگو\"), W(\"دانلود متنی تاریخچه این گفتگو\"), 'act-export'),\n      rowNav('🔐', W(\"خروج از حساب\"), W(\"دفعه بعد دوباره رمز می‌خواهم\"), 'act-logout'),\n      '<div class=\"row\"><span class=\"ic\">ℹ️</span><div class=\"mid\"><div class=\"t1\">Behrad AI v' + esc(S.version || '') +\n      W(\"</div><div class=\\\"t2\\\">اپ شیشه‌ای متصل به ورکر Cloudflare — همان داده‌های تلگرام</div></div></div>\"),\n    ], 3),\n  ].join('');\n  $('#setBody .seg').forEach(layoutSeg);\n}\nfunction layoutSeg(seg) {\n  const pill = seg.querySelector('.seg-pill');\n  const on = seg.querySelector('button.on') || seg.querySelector('button');\n  if (!pill || !on) return;\n  requestAnimationFrame(() => {\n    const pr = seg.getBoundingClientRect();\n    const br = on.getBoundingClientRect();\n    pill.style.left = '0px';\n    pill.style.transform = 'translateX(' + (br.left - pr.left) + 'px)';\n    pill.style.width = br.width + 'px';\n  });\n}\nasync function setSetting(patch) {\n  const r = await API.post('/api/v1/settings', patch);\n  if (r.settings) Object.assign(S.settings, r.settings);\n  return r;\n}\nfunction wireSettings() {\n  const body = $('setBody');\n  body.addEventListener('click', async (e) => {\n    const tg = e.target.closest('[data-toggle]');\n    if (tg) {\n      const key = tg.dataset.toggle;\n      const nv = !S.settings[key];\n      S.settings[key] = nv;\n      tg.classList.toggle('on', nv);\n      haptic(16);\n      try { await setSetting({ [key]: nv }); toast(W(\"ذخیره شد ✅\"), 'ok'); }\n      catch (er) { S.settings[key] = !nv; tg.classList.toggle('on', !nv); toast(er.message, 'err'); }\n      return;\n    }\n    const seg = e.target.closest('[data-seg] button');\n    if (seg) {\n      const wrap = seg.closest('[data-seg]');\n      const key = wrap.dataset.seg;\n      $('button', wrap).forEach((b) => b.classList.toggle('on', b === seg));\n      layoutSeg(wrap);\n      haptic(16);\n      try { await setSetting({ [key]: seg.dataset.v }); toast(W(\"ذخیره شد ✅\"), 'ok'); }\n      catch (er) { toast(er.message, 'err'); renderSettings(); }\n      return;\n    }\n    const lc = e.target.closest('[data-loc]');\n    if (lc) {\n      setLocale(lc.dataset.loc, true);\n      $('#localeSeg .seg-b').forEach((b2) => b2.classList.toggle('on', b2 === lc));\n      haptic(16);\n      toast(W(\"ذخیره شد ✅\"), 'ok');\n      return;\n    }\n    const tp = e.target.closest('[data-theme-pick]');\n    if (tp) {\n      applyTheme(tp.dataset.themePick, true);\n      $('#setBody [data-theme-pick]').forEach((p) => p.classList.toggle('on', p === tp));\n      toast(W(\"تم: \") + THEME_NAMES[S.theme], 'ok');\n      haptic(18);\n      return;\n    }\n    const lp = e.target.closest('[data-layout-pick]');\n    if (lp) {\n      applyLayout(lp.dataset.layoutPick, true);\n      $('#setBody [data-layout-pick]').forEach((p) => p.classList.toggle('on', p === lp));\n      toast(W(\"چیدمان: \") + LAYOUT_NAMES[S.layout], 'ok');\n      haptic(18);\n      return;\n    }\n    const act = (e.target.closest('[data-act]') || {}).dataset;\n    if (!act || !act.act) return;\n    if (act.act === 'act-model') openModelsSheet();\n    else if (act.act === 'act-persona') openPersonasSheet();\n    else if (act.act === 'act-voice') go('voice');\n    else if (act.act === 'act-imgmodel') {\n      const list = gemList('img');\n      const cur = S.settings.imgModel || (list[0] && list[0].id);\n      openSheet(W(\"مدل تولید تصویر 🖼\"),\n        '<div class=\"list\">' + list.map((m) =>\n          '<div class=\"item\" data-act=\"do-imgmodel\" data-id=\"' + esc(m.id) + '\">' +\n          '<span class=\"ic\">🖼</span><div class=\"mid\"><div class=\"t1\">' + esc(m.name) + '</div>' +\n          '<div class=\"t2\"><code>' + esc(m.id) + '</code></div></div>' +\n          '<span class=\"chev\">' + (m.id === cur ? '✓' : '‹') + '</span></div>').join('') +\n        '</div><p style=\"color:var(--muted);font-size:.8rem;text-align:center;margin-top:10px\">' +\n        W(\"با <code>/image توصیف</code> در چت عکس می‌سازی.</p>\"));\n    }\n    else if (act.act === 'do-sysave') {\n      try { await setSetting({ sysCustom: $('sysArea').value }); toast(W(\"پرامپت ذخیره شد ✅\"), 'ok'); }\n      catch (er) { toast(er.message, 'err'); }\n    } else if (act.act === 'act-clearhist') {\n      openSheet(W(\"شروع گفتگوی تازه؟\"),\n        W(\"<p style=\\\"text-align:center;color:var(--muted);line-height:2.2\\\">تاریخچه «\") +\n        esc((S.threads.find((t) => t.id === S.thread) || {}).name || '') + W(\"» پاک می‌شود.</p>\") +\n        '<div class=\"f-row\" style=\"justify-content:center;margin-top:14px\">' +\n        W(\"<button class=\\\"btn danger-ghost\\\" data-act=\\\"do-clearhist\\\">پاک شود</button>\") +\n        W(\"<button class=\\\"btn ghost\\\" data-act=\\\"close\\\">انصراف</button></div>\"));\n    } else if (act.act === 'act-export') {\n      try {\n        const res = await API.get('/api/v1/export?thread=' + encodeURIComponent(S.thread));\n        const text = await res.text();\n        const a = document.createElement('a');\n        a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));\n        a.download = 'behraad-chat-' + S.thread + '.txt';\n        a.click();\n        toast(W(\"خروجی دانلود شد 📤\"), 'ok');\n      } catch (er) { toast(er.message || W(\"خروجی نشد\"), 'err'); }\n    } else if (act.act === 'act-logout') {\n      // توکن سمت سرور هم باطل شود — وگرنه توکن ۳۰ روزه در D1 معتبر می‌ماند\n      try { await API.post('/api/v1/logout', {}); } catch (er) {}\n      try { localStorage.removeItem('tk'); } catch (er) {}\n      S.token = '';\n      showLogin();\n    }\n  });\n  body.addEventListener('input', (e) => {\n    const r = e.target;\n    if (r.type !== 'range') return;\n    const min = +r.min, max = +r.max, v = +r.value;\n    r.style.setProperty('--p', ((v - min) / (max - min)) * 100 + '%');\n    const lbl = body.querySelector('[data-v=\"' + r.dataset.fmt + '\"]');\n    const fmts = {\n      temperature: (x) => x.toFixed(2),\n      maxTokens: (x) => Math.round(x),\n      dailyLimit: (x) => Math.round(x),\n    };\n    if (lbl) lbl.textContent = (fmts[r.dataset.fmt] || ((x) => x))(v);\n  });\n  body.addEventListener('change', async (e) => {\n    const r = e.target;\n    if (r.type !== 'range') return;\n    try {\n      await setSetting({ [r.dataset.fmt]: +r.value });\n      toast(W(\"ذخیره شد ✅\"), 'ok');\n      haptic(14);\n    } catch (er) { toast(er.message, 'err'); }\n  });\n}\n\n/* ═══════════ استودیو صدا ═══════════ */\nfunction renderVoice() {\n  const s = S.settings || {};\n  const google = s.voiceProv !== 'cf'; // پیش‌فرض سرور «گوگل» است، نه کلادفلر\n  const banners = [];\n  if (!S.flags.search) banners.push(['🔎', W(\"کلید SEARCH_API_KEY تنظیم نشده — سرچ وب غیرفعال است\")]);\n  if (!S.flags.gemini) banners.push(['🔊', W(\"کلید GEMINI_API_KEY نیست — صدای گوگل در دسترس نیست (فالبک Whisper)\")]);\n  $('voiceBody').innerHTML = [\n    banners.map((b) => '<div class=\"glass form-card\" style=\"display:flex;gap:12px;align-items:center;border-color:rgba(251,191,36,.4)\">' +\n      '<span style=\"font-size:20px\">' + b[0] + '</span><div style=\"font-size:13px;color:var(--muted)\">' + b[1] + '</div></div>').join(''),\n\n    sec(W(\"موتور صدا\"), [\n      '<div class=\"row\"><div class=\"seg\" data-seg=\"voiceProv\" style=\"flex:1\"><span class=\"seg-pill\"></span>' +\n      '<button data-v=\"cf\" class=\"' + (!google ? 'on' : '') + W(\"\\\">کلادفلر (رایگان)</button>\") +\n      '<button data-v=\"google\" class=\"' + (google ? 'on' : '') + W(\"\\\">گوگل AI Studio</button></div></div>\"),\n      rowTgl('🔊', W(\"پاسخ صوتی در چت\"), W(\"جواب‌ها صوتی بیاید\"), 'voiceReply', !!s.voiceReply),\n    ], 0),\n\n    sec(W(\"مدل فهم ویس (STT) — گوگل\"), GEM_STT.map((m) =>\n      '<div class=\"row click' + (s.sttModel === m.id ? ' active' : '') + '\" data-stt=\"' + m.id + '\">' +\n      '<span class=\"ic\">' + (s.sttModel === m.id ? '✅' : '🎤') + '</span>' +\n      '<div class=\"mid\"><div class=\"t1\">' + m.name + '</div><div class=\"t2\" dir=\"ltr\" style=\"text-align:right\">' + m.id + '</div></div>' +\n      (s.sttModel === m.id ? W(\"<span class=\\\"badge\\\">فعال</span>\") : '') + '</div>'), 1),\n\n    sec(W(\"مدل تولید صدا (TTS) — گوگل\"), GEM_TTS.map((m) =>\n      '<div class=\"row click' + (s.ttsModel === m.id ? ' active' : '') + '\" data-tts=\"' + m.id + '\">' +\n      '<span class=\"ic\">' + (s.ttsModel === m.id ? '✅' : '🔊') + '</span>' +\n      '<div class=\"mid\"><div class=\"t1\">' + m.name + '</div><div class=\"t2\" dir=\"ltr\" style=\"text-align:right\">' + m.id + '</div></div>' +\n      (s.ttsModel === m.id ? W(\"<span class=\\\"badge\\\">فعال</span>\") : '') + '</div>'), 2),\n\n    sec(W(\"وویس — \") + (s.voiceName || 'Kore') + W(\" <span style=\\\"color:var(--dim);font-weight:400\\\">(۳۰ گزینه، فارسی fa)</span>\"),\n      ['<div class=\"row\" style=\"border:none\"><div class=\"voice-grid\" style=\"flex:1\">' +\n        GEM_VOICES.map((v, i) =>\n          '<button class=\"v-chip' + ((s.voiceName || 'Kore') === v ? ' on' : '') + '\" style=\"--i:' + i +\n          '\" data-vset=\"' + v + '\">' + v + '</button>').join('') +\n        '</div></div>'], 3),\n\n    W(\"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">تست</div><div class=\\\"sec-box\\\">\") +\n    W(\"<div class=\\\"row\\\"><span class=\\\"ic\\\">🎧</span><div class=\\\"mid\\\"><div class=\\\"t1\\\">پخش نمونه با وویس فعلی</div>\") +\n    W(\"<div class=\\\"t2\\\">«سلام بهراد! من دستیار صوتی تو هستم...»</div></div>\") +\n    '<div class=\"eq\" id=\"voiceEq\" hidden>' + '<i></i>'.repeat(7) + '</div>' +\n    W(\"<button class=\\\"btn acc sm\\\" data-act=\\\"do-test\\\">تست 🎧</button></div></div></div>\"),\n  ].join('');\n  $('#voiceBody .seg').forEach(layoutSeg);\n}\nfunction wireVoice() {\n  const body = $('voiceBody');\n  body.addEventListener('click', async (e) => {\n    const tg = e.target.closest('[data-toggle]');\n    if (tg) {\n      const key = tg.dataset.toggle;\n      const nv = !S.settings[key];\n      S.settings[key] = nv;\n      tg.classList.toggle('on', nv);\n      try { await setSetting({ [key]: nv }); toast(W(\"ذخیره شد ✅\"), 'ok'); }\n      catch (er) { toast(er.message, 'err'); }\n      return;\n    }\n    const seg = e.target.closest('[data-seg] button');\n    if (seg) {\n      const wrap = seg.closest('[data-seg]');\n      $('button', wrap).forEach((b) => b.classList.toggle('on', b === seg));\n      layoutSeg(wrap);\n      try { await setSetting({ voiceProv: seg.dataset.v }); toast(W(\"موتور عوض شد ✅\"), 'ok'); }\n      catch (er) { toast(er.message, 'err'); }\n      return;\n    }\n    const stt = e.target.closest('[data-stt]');\n    if (stt) {\n      try { await setSetting({ sttModel: stt.dataset.stt }); S.settings.sttModel = stt.dataset.stt; toast(W(\"مدل فهم عوض شد ✅\"), 'ok'); haptic(14); renderVoice(); }\n      catch (er) { toast(er.message, 'err'); }\n      return;\n    }\n    const tts = e.target.closest('[data-tts]');\n    if (tts) {\n      try { await setSetting({ ttsModel: tts.dataset.tts }); S.settings.ttsModel = tts.dataset.tts; toast(W(\"مدل صدا عوض شد ✅\"), 'ok'); haptic(14); renderVoice(); }\n      catch (er) { toast(er.message, 'err'); }\n      return;\n    }\n    const v = e.target.closest('[data-vset]');\n    if (v) {\n      $('.v-chip', body).forEach((c) => c.classList.toggle('on', c === v));\n      haptic(12);\n      try { await setSetting({ voiceName: v.dataset.vset }); toast(W(\"وویس: \") + v.dataset.vset, 'ok'); }\n      catch (er) { toast(er.message, 'err'); }\n      return;\n    }\n    if ((e.target.closest('[data-act]') || {}).dataset.act === 'do-test') {\n      const eq = $('voiceEq');\n      const btn = e.target.closest('button');\n      if (eq) eq.hidden = false;\n      btn.disabled = true;\n      btn.textContent = '...';\n      try {\n        const res = await API.req('/api/v1/tts', {\n          method: 'POST',\n          body: { text: W(\"سلام بهراد! من دستیار صوتی تو هستم. این صدای \") + (S.settings.voiceName || 'Kore') + W(\" است.\") },\n        });\n        const blob = await res.blob();\n        if (curAudio) curAudio.pause();\n        curAudio = new Audio(URL.createObjectURL(blob));\n        curAudio.onended = () => { if (eq) eq.hidden = true; };\n        await curAudio.play();\n        haptic(20);\n      } catch (er) { toast(er.message || W(\"تست ناموفق\"), 'err'); if (eq) eq.hidden = true; }\n      btn.disabled = false;\n      btn.textContent = W(\"تست 🎧\");\n    }\n  });\n}\n\n/* ═══════════ آمار ═══════════ */\nfunction renderStats() {\n  const u = S.usage || {};\n  const s = S.settings || {};\n  const lim = s.dailyLimit || 0;\n  const used = (u.tin || 0) + (u.tout || 0);\n  const pct = lim ? Math.min(100, Math.round(used / (lim * 1000) * 100)) : 0;\n  const f = S.flags || {};\n  $('statsBody').innerHTML = [\n    '<div class=\"stat-grid\">' +\n    '<div class=\"stat\" style=\"--i:0\"><span class=\"sic\">💬</span><div class=\"sv\">' + (u.msgs || 0) + W(\"</div><div class=\\\"sl\\\">پیام امروز</div></div>\") +\n    '<div class=\"stat\" style=\"--i:1\"><span class=\"sic\">⬇️</span><div class=\"sv\">' + ((u.tin || 0) / 1000).toFixed(1) + W(\"K</div><div class=\\\"sl\\\">توکن ورودی امروز</div></div>\") +\n    '<div class=\"stat\" style=\"--i:2\"><span class=\"sic\">⬆️</span><div class=\"sv\">' + ((u.tout || 0) / 1000).toFixed(1) + W(\"K</div><div class=\\\"sl\\\">توکن خروجی امروز</div></div>\") +\n    '<div class=\"stat\" style=\"--i:3\"><span class=\"sic\">🧵</span><div class=\"sv\">' + S.threads.length + W(\"</div><div class=\\\"sl\\\">گفتگو (از \") + THREAD_MAX + ')</div></div>' +\n    '</div>',\n    lim ? W(\"<div class=\\\"sec\\\" style=\\\"--i:4\\\"><div class=\\\"sec-t\\\">سقف روزانه</div><div class=\\\"sec-box\\\"><div class=\\\"row\\\">\") +\n      '<div class=\"mid\"><div class=\"t1\">' + pct + W(\"٪ مصرف شده</div>\") +\n      '<div class=\"t2\">' + (used / 1000).toFixed(1) + W(\"K از \") + lim + W(\"K توکن</div>\") +\n      '<div class=\"bar-line\"><i style=\"width:' + pct + '%\"></i></div></div></div></div></div>' : '',\n    W(\"<div class=\\\"sec\\\" style=\\\"--i:5\\\"><div class=\\\"sec-t\\\">سرویس‌ها</div><div class=\\\"sec-box\\\">\") +\n    [['🧠', W(\"مدل AI\"), !!f.hasAi], [W(\"🗄 دیتابیس D1\"), W(\"دیتابیس D1\"), !!f.hasDb],\n      ['🔎', W(\"سرچ Tavily (SEARCH_API_KEY)\"), !!f.search], ['🔊', W(\"صدای گوگل (GEMINI_API_KEY)\"), !!f.gemini]]\n      .map((x) => '<div class=\"row\"><span class=\"ic\">' + (typeof x[0] === 'string' && x[0].length <= 3 ? x[0] : '🧩') +\n        '</span><div class=\"mid\"><div class=\"t1\">' + x[1] + '</div></div>' +\n        '<span class=\"badge ' + (x[2] ? 'green' : 'red') + '\">' + (x[2] ? W(\"فعال\") : W(\"غیرفعال\")) + '</span></div>').join('') +\n    '</div></div>',\n    W(\"<div class=\\\"sec\\\" style=\\\"--i:6\\\"><div class=\\\"sec-t\\\">درباره</div><div class=\\\"sec-box\\\">\") +\n    '<div class=\"row\"><span class=\"ic\">📱</span><div class=\"mid\"><div class=\"t1\">Behrad AI v' + esc(S.version || '') + '</div>' +\n    W(\"<div class=\\\"t2\\\">اپ شیشه‌ای اندروید — همان ورکر Cloudflare، همان تاریخچه تلگرام</div></div></div></div></div>\"),\n  ].join('');\n}\n\n/* ═══════════ خانه bento ═══════════ */\nfunction renderBento() {\n  const s = S.settings || {};\n  const u = S.usage || {};\n  const t = THEME_DOTS[S.theme] || [];\n  $('bento').innerHTML =\n    '<div class=\"b-card hero\" style=\"--i:0\" data-act=\"newchat\"><span class=\"glow\"></span>' +\n    W(\"<span class=\\\"bc-ic\\\">💬</span><div class=\\\"bc-v\\\">چت تازه</div>\") +\n    '<div class=\"bc-s\">' + esc(S.currentModel.label || '') + '</div></div>' +\n\n    '<div class=\"b-card accent span2\" style=\"--i:1\" data-act=\"model\"><span class=\"glow\"></span>' +\n    '<div style=\"display:flex;justify-content:space-between;align-items:flex-start\">' +\n    '<span class=\"bc-ic\">🤖</span><span class=\"badge\">' + (S.currentModel.vision ? W(\"👁 ویژن\") : W(\"متن\")) + '</span></div>' +\n    W(\"<div><div class=\\\"bc-t\\\">مدل فعال</div><div class=\\\"bc-v\\\" style=\\\"font-size:17px\\\">\") +\n    esc(S.currentModel.label || '—') + '</div>' +\n    '<div class=\"bc-s\">' + (S.currentModel.ctx ? S.currentModel.ctx + W(\"K کانتکست\") : '') + '</div></div></div>' +\n\n    '<div class=\"b-card green\" style=\"--i:2\" data-act=\"weather\"><span class=\"glow\"></span>' +\n    W(\"<span class=\\\"bc-ic\\\">🌤</span><div><div class=\\\"bc-t\\\">هوای نیشابور</div>\") +\n    W(\"<div class=\\\"bc-v\\\" style=\\\"font-size:19px\\\">ببین...</div><div class=\\\"bc-s\\\">برای دریافت بزن</div></div></div>\") +\n\n    '<div class=\"b-card\" style=\"--i:3\" data-act=\"memory\"><span class=\"glow\"></span>' +\n    W(\"<span class=\\\"bc-ic\\\">🧠</span><div><div class=\\\"bc-t\\\">حافظه بلندمدت</div>\") +\n    '<div class=\"bc-v\">' + S.memCount + '<span style=\"font-size:15px;color:var(--muted)\">/' + S.memMax + '</span></div>' +\n    W(\"<div class=\\\"bc-s\\\">مدیریت خاطره‌ها</div></div></div>\") +\n\n    '<div class=\"b-card red\" style=\"--i:4\" data-act=\"reminders\">' +\n    W(\"<span class=\\\"bc-ic\\\">⏰</span><div><div class=\\\"bc-t\\\">یادآورها</div>\") +\n    '<div class=\"bc-v\" style=\"font-size:19px\">' + (s.briefing ? W(\"صبح \") + (S.briefHour || 10) + W(\":۰۰ 🌅\") : W(\"مدیریت\")) + '</div>' +\n    W(\"<div class=\\\"bc-s\\\">ساخت و حذف یادآور</div></div></div>\") +\n\n    '<div class=\"b-card\" style=\"--i:5\" data-act=\"stats\"><span class=\"glow\"></span>' +\n    W(\"<span class=\\\"bc-ic\\\">📊</span><div><div class=\\\"bc-t\\\">پیام امروز</div>\") +\n    '<div class=\"bc-v\">' + (u.msgs || 0) + '</div><div class=\"bc-s\">' + (((u.tin || 0) + (u.tout || 0)) / 1000).toFixed(1) + W(\"K توکن</div></div></div>\") +\n\n    '<div class=\"b-card span2\" style=\"--i:6\" data-act=\"voice\">' +\n    '<div style=\"display:flex;justify-content:space-between\"><span class=\"bc-ic\">🎙</span>' +\n    '<div class=\"eq\" style=\"height:22px\">' + '<i></i>'.repeat(7) + '</div></div>' +\n    W(\"<div><div class=\\\"bc-t\\\">استودیو صدا</div><div class=\\\"bc-v\\\" style=\\\"font-size:17px\\\">\") +\n    esc(s.voiceName || 'Kore') + ' · ' + (s.voiceProv === 'cf' ? W(\"کلادفلر\") : W(\"گوگل\")) + '</div>' +\n    W(\"<div class=\\\"bc-s\\\">۳۰ وویس، مدل‌ها و تست صدا</div></div></div>\") +\n\n    '<div class=\"b-card span2\" style=\"--i:7\" data-act=\"theme\">' +\n    '<div style=\"display:flex;justify-content:space-between;align-items:center\">' +\n    '<span class=\"bc-ic\">🎨</span><div class=\"theme-dots\">' +\n    THEMES.map((th) => '<i class=\"' + (S.theme === th ? 'on' : '') + '\" style=\"background:' +\n      (THEME_DOTS[th] || ['#fff'])[0] + ';color:' + (THEME_DOTS[th] || ['#fff'])[0] + '\"></i>').join('') +\n    '</div></div>' +\n    W(\"<div><div class=\\\"bc-t\\\">تم و چیدمان</div><div class=\\\"bc-v\\\" style=\\\"font-size:17px\\\">\") +\n    THEME_NAMES[S.theme] + ' · ' + LAYOUT_NAMES[S.layout] + '</div>' +\n    W(\"<div class=\\\"bc-s\\\">برای عوض زدن بزن — ۴ تم × ۳ چیدمان</div></div></div>\");\n}\nfunction wireBento() {\n  $('bento').addEventListener('click', async (e) => {\n    const card = e.target.closest('[data-act]');\n    if (!card) return;\n    const act = card.dataset.act;\n    haptic(14);\n    if (act === 'newchat') {\n      try {\n        const r = await API.post('/api/v1/thread', { op: 'new' });\n        S.threads = r.threads; S.thread = r.thread;\n        go('chat'); loadHistory();\n      } catch (er) { toast(er.message, 'err'); }\n    } else if (act === 'model') openModelsSheet();\n    else if (act === 'memory') go('memory');\n    else if (act === 'reminders') go('reminders');\n    else if (act === 'stats') go('stats');\n    else if (act === 'voice') go('voice');\n    else if (act === 'theme') openThemeSheet();\n    else if (act === 'weather') {\n      const v = card.querySelector('.bc-v');\n      const s2 = card.querySelector('.bc-s');\n      if (v) v.textContent = '...';\n      try {\n        const r = await API.get('/api/v1/tool?name=weather');\n        openSheet(W(\"🌤 هوای نیشابور\"), '<div class=\"b-text\" style=\"font-size:14.5px\">' + mdRender(r.text || '') + '</div>');\n      } catch (er) { if (v) v.textContent = '—'; if (s2) s2.textContent = er.message; toast(er.message, 'err'); }\n    }\n  });\n}\n\n/* ═══════════ ویجت‌های هوشمند 🧩 ═══════════\n   پرامپت فارسی ← سرور با AI ساخته ← کارت شیشه‌ای روی برد؛ یادآورها به rm: وصل‌اند. */\nconst WG_MAX_DEFAULT = 12;\nconst WG_DAYS = [W(\"یکشنبه\"), W(\"دوشنبه\"), W(\"سه‌شنبه\"), W(\"چهارشنبه\"), W(\"پنجشنبه\"), W(\"جمعه\"), W(\"شنبه\")];\nconst WG_MONTHS = [W(\"فروردین\"), W(\"اردیبهشت\"), W(\"خرداد\"), W(\"تیر\"), W(\"مرداد\"), W(\"شهریور\"), W(\"مهر\"), W(\"آبان\"), W(\"آذر\"), W(\"دی\"), W(\"بهمن\"), W(\"اسفند\")];\nconst wgFa = (n) => String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);\nconst wgPad = (n) => String(n).padStart(2, '0');\n\nfunction wgTehran(ms) {\n  const d = new Date((ms == null ? Date.now() : ms) + 210 * 60000);\n  return {\n    y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(),\n    h: d.getUTCHours(), min: d.getUTCMinutes(), s: d.getUTCSeconds(), w: d.getUTCDay(),\n    ymd: d.getUTCFullYear() + '-' + wgPad(d.getUTCMonth() + 1) + '-' + wgPad(d.getUTCDate()),\n  };\n}\nfunction wgEpochT(y, m, d, h, min) { return Date.UTC(y, m - 1, d, h, min, 0) - 210 * 60000; }\n\nfunction wgJalali(gy, gm, gd) {\n  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];\n  let jy = (gy <= 1600) ? 0 : 979;\n  gy -= (gy <= 1600) ? 621 : 1600;\n  const gy2 = (gm > 2) ? gy + 1 : gy;\n  let days = (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100)\n    + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];\n  jy += 33 * Math.floor(days / 12053); days %= 12053;\n  jy += 4 * Math.floor(days / 1461); days %= 1461;\n  if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }\n  const jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);\n  const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));\n  return { jy: jy, jm: jm, jd: jd };\n}\nfunction wgJalaliLine(t) {\n  const j = wgJalali(t.y, t.m, t.d);\n  return WG_DAYS[t.w] + ' ' + wgFa(j.jd) + ' ' + WG_MONTHS[j.jm - 1] + ' ' + wgFa(j.jy);\n}\nfunction wgJalaliFull(t) {\n  const j = wgJalali(t.y, t.m, t.d);\n  return wgFa(j.jd) + ' ' + WG_MONTHS[j.jm - 1] + ' ' + wgFa(j.jy);\n}\nfunction wgFind(id) { return (S.widgets || []).find((x) => x.id === id) || null; }\n\nfunction wgAtToLocal(at) {\n  const d = new Date(at + 210 * 60000);\n  return d.getUTCFullYear() + '-' + wgPad(d.getUTCMonth() + 1) + '-' + wgPad(d.getUTCDate()) +\n    'T' + wgPad(d.getUTCHours()) + ':' + wgPad(d.getUTCMinutes());\n}\nfunction wgLocalToAt(v) {\n  const m = String(v || '').match(/^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2})/);\n  if (!m) return 0;\n  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) - 210 * 60000;\n}\n\n/* ─── حالت یادآور/شمارش معکوس: wait | due | done ─── */\nfunction wgRemState(sp, now) {\n  if (sp.type === 'countdown') {\n    const from = Math.min(sp.ts || 0, sp.at - 86400000) || (sp.at - 86400000);\n    if (now < sp.at) return { s: 'wait', target: sp.at, from: Math.max(0, Math.min(sp.ts || 0, sp.at - 86400000) || sp.at - 86400000) };\n    if (now - sp.at < 6 * 3600000) return { s: 'due', target: sp.at, from: from };\n    return { s: 'done', target: sp.at, from: from };\n  }\n  const p = wgTehran(sp.at);\n  const t = wgTehran(now);\n  let dueAt = sp.at;\n  if (sp.repeat === 'daily') dueAt = wgEpochT(t.y, t.m, t.d, p.h, p.min);\n  if (now < dueAt) return { s: 'wait', target: dueAt, from: Math.max(0, dueAt - 86400000) };\n  if (now - dueAt < 6 * 3600000) return { s: 'due', target: dueAt, from: Math.max(0, dueAt - 86400000) };\n  return { s: 'done', target: dueAt, from: Math.max(0, dueAt - 86400000) };\n}\nfunction wgProg(st, now) {\n  const span = st.target - st.from;\n  if (span <= 0) return 1;\n  return (now - st.from) / span;\n}\nfunction wgLeftText(ms) {\n  if (ms <= 0) return W(\"الان\");\n  const m = Math.floor(ms / 60000);\n  if (m < 1) return W(\"کمتر از یک دقیقه دیگه\");\n  if (m < 60) return wgFa(m) + W(\" دقیقه دیگه\");\n  const h = Math.floor(m / 60), mm = m % 60;\n  if (h < 24) return wgFa(h) + W(\" ساعت\") + (mm ? W(\" و \") + wgFa(mm) + W(\" دقیقه\") : '') + W(\" دیگه\");\n  const d = Math.floor(h / 24), hh = h % 24;\n  return wgFa(d) + W(\" روز\") + (hh ? W(\" و \") + wgFa(hh) + W(\" ساعت\") : '') + W(\" دیگه\");\n}\nfunction wgHmsText(ms) {\n  if (ms <= 0) return W(\"رسید 🎉\");\n  const s = Math.floor(ms / 1000);\n  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;\n  return wgFa(wgPad(h) + ':' + wgPad(m) + ':' + wgPad(ss));\n}\nfunction wgAtLabel(sp, now) {\n  const p = wgTehran(sp.at), t = wgTehran(now);\n  const hm = wgFa(wgPad(p.h) + ':' + wgPad(p.min));\n  if (sp.repeat === 'daily') return hm + W(\" روزانه\");\n  const diff = Math.round((wgEpochT(p.y, p.m, p.d, 0, 0) - wgEpochT(t.y, t.m, t.d, 0, 0)) / 86400000);\n  if (diff === 0) return hm + W(\" امروز\");\n  if (diff === 1) return hm + W(\" فردا\");\n  if (diff === -1) return hm + W(\" دیروز\");\n  return hm + ' ' + wgFa(p.m + '/' + p.d);\n}\nfunction wgFlagText(sp, st, now) {\n  if (st.s === 'wait') return wgAtLabel(sp, now);\n  if (sp.type === 'countdown') return W(\"🎉 رسید\");\n  return st.s === 'due' ? W(\"الان!\") : W(\"✓ انجام شد\");\n}\nfunction wgCdText(sp, st, now) {\n  if (st.s !== 'wait') return sp.type === 'countdown' ? W(\"🎉 رسید!\") : (st.s === 'due' ? W(\"الان وقتشه! ⏰\") : W(\"✓ انجام شد\"));\n  if (sp.type === 'countdown') return wgHmsText(st.target - now);\n  return wgLeftText(st.target - now);\n}\nfunction wgRing(p) {\n  const c = 94.2;\n  return '<svg class=\"wg-ring\" viewBox=\"0 0 36 36\">' +\n    '<circle class=\"wr-bg\" cx=\"18\" cy=\"18\" r=\"15\"></circle>' +\n    '<circle class=\"wr-fg\" cx=\"18\" cy=\"18\" r=\"15\" data-wg=\"ring\" stroke-dasharray=\"' + c +\n    '\" stroke-dashoffset=\"' + (c * (1 - Math.max(0, Math.min(1, p)))).toFixed(2) + '\"></circle></svg>';\n}\nfunction wgSetRing(el, p) {\n  const c = 94.2;\n  el.setAttribute('stroke-dashoffset', String(Math.round(c * (1 - Math.max(0, Math.min(1, p)))) * 100) / 100);\n}\nfunction wgWxEmoji(code) {\n  const c = +code;\n  if (c === 0) return ['☀️', W(\"صاف\")];\n  if (c === 1 || c === 2) return ['⛅', W(\"کمی ابری\")];\n  if (c === 3) return ['☁️', W(\"ابری\")];\n  if (c === 45 || c === 48) return ['🌫', W(\"مه\")];\n  if (c >= 51 && c <= 67) return ['🌧', W(\"باران\")];\n  if ((c >= 71 && c <= 77) || c === 85 || c === 86) return ['❄️', W(\"برف\")];\n  if (c >= 80 && c <= 82) return ['🌦', W(\"رگبار\")];\n  if (c >= 95) return ['⛈', W(\"طوفان\")];\n  return ['🌤', W(\"هوای خوب\")];\n}\nfunction wgNum(v, d) {\n  const n = +v;\n  if (!isFinite(n)) return W(\"؟\");\n  return wgFa(String(Math.round(n * (d ? 10 : 1)) / (d ? 10 : 1)));\n}\nfunction wgShort(v) {\n  const n = +v;\n  if (!isFinite(n)) return W(\"؟\");\n  if (n >= 1000) return wgFa((n / 1000).toFixed(1)) + 'K';\n  return wgFa(n);\n}\nfunction wgHead(sp, flag, live) {\n  return '<div class=\"wg-h\"><span class=\"wg-t\">' + esc(sp.title || W(\"ویجت\")) + '</span>' +\n    '<span class=\"wg-flag\"' + (live ? ' data-wg=\"flag\"' : '') + '>' + esc(flag) + '</span></div>';\n}\n\n/* ─── رندرر هر نوع ویجت ─── */\nfunction wgInner(sp, now) {\n  const st = sp.type === 'reminder' || sp.type === 'countdown' ? wgRemState(sp, now) : null;\n\n  if (sp.type === 'reminder') {\n    return wgHead(sp, wgFlagText(sp, st, now), true) +\n      (sp.text ? '<div class=\"wg-sub\">' + esc(sp.text) + '</div>' : '') +\n      '<div class=\"wg-foot\"><span class=\"wg-cd\" data-wg=\"cd\">' + esc(wgCdText(sp, st, now)) + '</span>' +\n      wgRing(wgProg(st, now)) + '</div>';\n  }\n\n  if (sp.type === 'countdown') {\n    const left = Math.max(0, st.target - now);\n    const days = Math.floor(left / 86400000);\n    const big = days >= 1\n      ? wgFa(days) + W(\"<span class=\\\"wg-unit\\\"> روز</span>\")\n      : wgFa(wgPad(Math.floor(left / 3600000)) + ':' + wgPad(Math.floor((left % 3600000) / 60000)));\n    return wgHead(sp, wgFlagText(sp, st, now), true) +\n      '<div class=\"wg-big\">' + big + '</div>' +\n      '<div class=\"wg-foot\"><span class=\"wg-cd ltr\" data-wg=\"cd\">' + esc(wgCdText(sp, st, now)) + '</span></div>';\n  }\n\n  if (sp.type === 'weather') {\n    const w = S.wgWx;\n    const emo = wgWxEmoji(w ? w.code : null);\n    const head = wgHead(sp, W(\"نیشابور\"), false);\n    if (!w) {\n      return head + W(\"<div class=\\\"wg-skelbar\\\"></div><div class=\\\"wg-sub\\\">دارم هوا را می‌گیرم ...</div>\");\n    }\n    return head +\n      '<div class=\"wg-wx\"><span class=\"wg-wx-emo\">' + emo[0] + '</span>' +\n      '<span class=\"wg-big wg-temp\">' + wgNum(w.t) + '°</span></div>' +\n      '<div class=\"wg-sub\">' + esc(emo[1]) + W(\" · بیشینه \") + wgNum(w.hi) + W(\"° / کمینه \") + wgNum(w.lo) + '°</div>' +\n      '<div class=\"wg-chips\"><span class=\"wg-chip\">💧 ' + wgNum(w.hum) + W(\"٪</span>\") +\n      '<span class=\"wg-chip\">🌬 ' + wgNum(w.wind) + '</span>' +\n      '<span class=\"wg-chip extra\">🌧 ' + wgNum(w.pop) + W(\"٪</span></div>\");\n  }\n\n  if (sp.type === 'clock') {\n    const t = wgTehran(now);\n    return wgHead(sp, WG_DAYS[t.w], true) +\n      '<div class=\"wg-big\"><span data-wg=\"hms\">' + wgFa(wgPad(t.h) + ':' + wgPad(t.min)) + '</span>' +\n      '<span class=\"wg-secs\" data-wg=\"secs\">:' + wgFa(wgPad(t.s)) + '</span></div>' +\n      '<div class=\"wg-sub\" data-wg=\"jline\">' + esc(wgJalaliLine(t)) + '</div>';\n  }\n\n  if (sp.type === 'date') {\n    const t = wgTehran(now);\n    const j = wgJalali(t.y, t.m, t.d);\n    return wgHead(sp, WG_DAYS[t.w], true) +\n      '<div class=\"wg-big wg-date\">' + wgFa(j.jd) + '<span class=\"wg-unit\"> ' + WG_MONTHS[j.jm - 1] + '</span></div>' +\n      '<div class=\"wg-sub\"><b data-wg=\"flag\">' + WG_DAYS[t.w] + '</b> · ' +\n      '<span data-wg=\"jline\">' + esc(wgJalaliFull(t)) + '</span></div>';\n  }\n\n  if (sp.type === 'stats') {\n    const u = S.wgStats || {};\n    const msgs = isFinite(+u.msgs) ? +u.msgs : ((S.usage || {}).msgs || 0);\n    const lim = +u.dailyLimit || ((S.settings || {}).dailyLimit || 0);\n    const p = lim > 0 ? Math.min(1, msgs / lim) : 0;\n    return wgHead(sp, W(\"امروز\"), false) +\n      '<div class=\"wg-big\">' + wgFa(msgs) + W(\"<span class=\\\"wg-unit\\\"> پیام</span></div>\") +\n      (lim > 0 ? '<div class=\"wg-bar\"><i style=\"width:' + Math.round(p * 100) + '%\"></i></div>' +\n        W(\"<div class=\\\"wg-sub\\\">از سقف \") + wgFa(lim) + '</div>' : '') +\n      '<div class=\"wg-chips\"><span class=\"wg-chip\">⬇ ' + wgShort(u.tin) + '</span>' +\n      '<span class=\"wg-chip\">⬆ ' + wgShort(u.tout) + '</span></div>';\n  }\n\n  if (sp.type === 'list') {\n    let ck = [];\n    try { ck = JSON.parse(localStorage.getItem('wgCk:' + sp.id) || '[]') || []; } catch (e) {}\n    const lis = (sp.items || []).map((it, i) => {\n      const on = ck.indexOf(i) >= 0;\n      return '<div class=\"wg-li' + (on ? ' on' : '') + '\" data-wg-li=\"' + i + '\" data-id=\"' + esc(sp.id) + '\">' +\n        '<i>' + (on ? '✓' : '') + '</i><span>' + esc(it) + '</span></div>';\n    }).join('') || W(\"<div class=\\\"wg-li\\\"><i></i><span>خالی است</span></div>\");\n    return wgHead(sp, wgFa((sp.items || []).length) + W(\" مورد\"), false) + '<div class=\"wg-list\">' + lis + '</div>';\n  }\n\n  /* note (پیش‌فرض) */\n  return wgHead(sp, W(\"یادداشت\"), false) +\n    '<div class=\"wg-note\">' + esc(sp.text || sp.title || '—') + '</div>';\n}\n\nfunction wgCardHtml(sp, i) {\n  const isNew = !S.wgSeen[sp.id];\n  return '<div class=\"wg-card wg-' + sp.size + ' wg-ac-' + sp.accent + (isNew ? ' wg-new' : '') +\n    '\" data-id=\"' + esc(sp.id) + '\" data-type=\"' + sp.type + '\" style=\"--i:' + i + '\">' +\n    '<button class=\"wg-edit\" data-wg-edit=\"' + esc(sp.id) + W(\"\\\" aria-label=\\\"ویرایش\\\">✎</button>\") +\n    '<div class=\"wg-in\">' + wgInner(sp, Date.now()) + '</div></div>';\n}\n\nasync function loadWidgets() {\n  if (S.wgLoaded) return;\n  try {\n    const r = await API.get('/api/v1/widgets');\n    S.widgets = r.items || [];\n    S.wgMax = r.max || WG_MAX_DEFAULT;\n    S.wgLoaded = true;\n    if (S.screen === 'widgets') renderWidgets();\n  } catch (e) { /* بعداً دوباره */ }\n}\n\nfunction renderWidgets() {\n  const board = $('wgBoard');\n  if (!board) return;\n  if (!S.wgLoaded) { loadWidgets(); return; }\n  const items = S.widgets || [];\n  $('wgCount').textContent = wgFa(items.length) + '/' + wgFa(S.wgMax || WG_MAX_DEFAULT);\n  if (!S.wgSeen) S.wgSeen = {};\n  board.innerHTML = items.length\n    ? items.map(wgCardHtml).join('')\n    : '<div class=\"wg-empty glass\"><span class=\"em-ic\">🧩</span>' +\n      W(\"<div class=\\\"em-t\\\">هنوز ویجتی نداری</div>\") +\n      W(\"<div class=\\\"em-s\\\">بالا بنویس چی بسازم:<br>\") +\n      W(\"<b>«فردا ساعت ۹ قرص بخورم»</b> · <b>«آب‌وهوا نشون بده»</b> · <b>«لیست خرید»</b></div></div>\");\n  items.forEach((sp) => { S.wgSeen[sp.id] = 1; });\n  wgLoadWx(false);\n  wgLoadStats(false);\n}\n\n/* FLIP: قبل/بعد جابه‌جایی کارت‌ها (تغییر سایز/حذف/بازآرایی) */\nfunction wgFlipRender() {\n  const board = $('wgBoard');\n  if (!board) { renderWidgets(); return; }\n  const before = {};\n  const prev = board.querySelectorAll('.wg-card');\n  prev.forEach((c) => { before[c.dataset.id] = c.getBoundingClientRect(); });\n  renderWidgets();\n  const next = board.querySelectorAll('.wg-card');\n  next.forEach((c) => {\n    const b = before[c.dataset.id];\n    if (!b) return;\n    const a = c.getBoundingClientRect();\n    const dx = b.left - a.left, dy = b.top - a.top;\n    if (!dx && !dy) return;\n    c.animate([\n      { transform: 'translate(' + dx + 'px,' + dy + 'px)', opacity: .7 },\n      { transform: 'none', opacity: 1 },\n    ], { duration: 450, easing: 'cubic-bezier(.2,.9,.25,1.08)' });\n  });\n}\n\n/* ─── داده‌های زنده: هوا و آمار ─── */\nasync function wgLoadWx(force) {\n  if (!(S.widgets || []).some((x) => x.type === 'weather')) return;\n  const now = Date.now();\n  if (!force && S.wgWx && !S.wgWxErr && now - S.wgWx.at < 60000) return;\n  if (S.wgWxLoading) return;\n  S.wgWxLoading = true;\n  try {\n    const d = await API.get('/api/v1/wdata?what=weather');\n    S.wgWx = d; S.wgWxErr = '';\n    if (S.screen === 'widgets') {\n      const cards = $('wgBoard').querySelectorAll('.wg-card[data-type=\"weather\"]');\n      cards.forEach((c) => {\n        const sp = wgFind(c.dataset.id);\n        const inr = c.querySelector('.wg-in');\n        if (sp && inr) inr.innerHTML = wgInner(sp, Date.now());\n      });\n    }\n  } catch (e) { S.wgWxErr = e.message; }\n  S.wgWxLoading = false;\n}\nasync function wgLoadStats(force) {\n  if (!(S.widgets || []).some((x) => x.type === 'stats')) return;\n  const now = Date.now();\n  if (!force && S.wgStats && now - S.wgStats.at < 60000) return;\n  if (S.wgStatsLoading) return;\n  S.wgStatsLoading = true;\n  try {\n    const d = await API.get('/api/v1/wdata?what=stats');\n    d.at = now;\n    S.wgStats = d;\n    if (S.screen === 'widgets') {\n      const cards = $('wgBoard').querySelectorAll('.wg-card[data-type=\"stats\"]');\n      cards.forEach((c) => {\n        const sp = wgFind(c.dataset.id);\n        const inr = c.querySelector('.wg-in');\n        if (sp && inr) inr.innerHTML = wgInner(sp, Date.now());\n      });\n    }\n  } catch (e) { /* بعداً */ }\n  S.wgStatsLoading = false;\n}\n\n/* ─── تیک ثانیه: یادآوری‌های رسیده + کارت‌های زنده ─── */\nfunction wgTick() {\n  const items = S.widgets;\n  if (!items || !items.length) return;\n  const now = Date.now();\n\n  for (let i = 0; i < items.length; i++) {\n    const sp = items[i];\n    if (sp.type !== 'reminder' || !sp.at) continue;\n    const st = wgRemState(sp, now);\n    if (st.s !== 'due') continue;\n    const marker = sp.repeat === 'daily' ? wgTehran(now).ymd : '1';\n    let got = '';\n    try { got = localStorage.getItem('wgDue:' + sp.id) || ''; } catch (e) {}\n    if (got === marker) continue;\n    try { localStorage.setItem('wgDue:' + sp.id, marker); } catch (e) {}\n    if (now - st.target >= 6 * 3600000) continue;\n    toast('⏰ ' + (sp.title || W(\"یادآور\")) + (sp.text ? ' — ' + sp.text : ''), 'ok');\n    haptic(180);\n  }\n\n  wgUpdateLive(now);\n\n  /* تازه‌سازی هر چند ثانیه (داخلش کهنگی را خودش چک می‌کند) */\n  if (now % 5000 < 1100) { wgLoadWx(false); wgLoadStats(false); }\n}\n\nfunction wgUpdateLive(now) {\n  if (S.screen !== 'widgets') return;\n  const board = $('wgBoard');\n  if (!board) return;\n  const t = wgTehran(now);\n  const cards = board.querySelectorAll('.wg-card');\n  for (let i = 0; i < cards.length; i++) {\n    const card = cards[i];\n    const sp = wgFind(card.dataset.id);\n    if (!sp) continue;\n    const type = sp.type;\n\n    if (type === 'clock') {\n      const a = card.querySelector('[data-wg=\"hms\"]');\n      if (a) a.textContent = wgFa(wgPad(t.h) + ':' + wgPad(t.min));\n      const b = card.querySelector('[data-wg=\"secs\"]');\n      if (b) b.textContent = ':' + wgFa(wgPad(t.s));\n      const f = card.querySelector('[data-wg=\"flag\"]');\n      if (f) f.textContent = WG_DAYS[t.w];\n      const jl = card.querySelector('[data-wg=\"jline\"]');\n      if (jl) jl.textContent = wgJalaliLine(t);\n      const rg = card.querySelector('[data-wg=\"ring\"]');\n      if (rg) wgSetRing(rg, t.s / 60);\n    } else if (type === 'date') {\n      const f = card.querySelector('[data-wg=\"flag\"]');\n      if (f) f.textContent = WG_DAYS[t.w];\n      const jl = card.querySelector('[data-wg=\"jline\"]');\n      if (jl) jl.textContent = wgJalaliFull(t);\n    } else if (type === 'reminder' || type === 'countdown') {\n      const st = wgRemState(sp, now);\n      const cur = card.classList.contains('st-due') ? 'due' : (card.classList.contains('st-done') ? 'done' : 'wait');\n      if (cur !== st.s) {\n        card.classList.remove('st-due', 'st-done');\n        if (st.s === 'due') card.classList.add('st-due');\n        if (st.s === 'done') card.classList.add('st-done');\n        const f = card.querySelector('[data-wg=\"flag\"]');\n        if (f) f.textContent = wgFlagText(sp, st, now);\n        haptic(st.s === 'due' ? 24 : 10);\n      }\n      const cd = card.querySelector('[data-wg=\"cd\"]');\n      if (cd) cd.textContent = wgCdText(sp, st, now);\n      const rg = card.querySelector('[data-wg=\"ring\"]');\n      if (rg && st.s === 'wait') wgSetRing(rg, wgProg(st, now));\n      const big = card.querySelector('.wg-big[data-wg=\"big\"]');\n      if (big && type === 'countdown' && st.s === 'wait') {\n        const left = Math.max(0, st.target - now);\n        const days = Math.floor(left / 86400000);\n        big.innerHTML = days >= 1\n          ? wgFa(days) + W(\"<span class=\\\"wg-unit\\\"> روز</span>\")\n          : wgFa(wgPad(Math.floor(left / 3600000)) + ':' + wgPad(Math.floor((left % 3600000) / 60000)));\n      }\n    }\n  }\n}\n\n/* ─── ساخت با AI ─── */\nasync function wgMake(prompt, id) {\n  const p = String(prompt || '').replace(/\\s+/g, ' ').trim();\n  if (!p) { toast(W(\"اول بنویس چی بسازم ✍️\"), 'err'); return null; }\n  const board = $('wgBoard');\n  let skel = null;\n  if (board) {\n    skel = document.createElement('div');\n    skel.className = 'wg-card wg-1x1 wg-skel';\n    skel.innerHTML = W(\"<div class=\\\"wg-skel-in\\\"><span class=\\\"spin\\\">✨</span>دارم می‌سازمش ...</div>\");\n    board.appendChild(skel);\n  }\n  try {\n    const body = { op: 'ai', prompt: p };\n    if (id) body.id = id;\n    const r = await API.post('/api/v1/widgets', body);\n    S.widgets = r.items || [];\n    S.wgMax = r.max || S.wgMax || WG_MAX_DEFAULT;\n    if (skel) skel.remove();\n    wgFlipRender();\n    toast(r.src === 'ai' ? W(\"ویجت ساخته شد ✨\") : W(\"ویجت ساخته شد (حالت سریع ⚡)\"), 'ok');\n    haptic(24);\n    return r.spec || null;\n  } catch (e) {\n    if (skel) skel.remove();\n    toast(e.message, 'err');\n    return null;\n  }\n}\n\n/* ─── شیت ویرایش ─── */\nfunction wgChipsPick(group, opts, cur) {\n  return '<div class=\"wg-pick\">' + opts.map((o) =>\n    '<button class=\"wg-pk' + (o.v === cur ? ' on' : '') + '\" data-wg-pick=\"' + group +\n    '\" data-v=\"' + o.v + '\">' + o.l + '</button>').join('') + '</div>';\n}\nfunction wgEditSheet(id) {\n  const sp = wgFind(id);\n  if (!sp) return;\n  let h = W(\"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">عنوان</div><div class=\\\"f-row\\\">\") +\n    '<input id=\"wgT\" maxlength=\"30\" value=\"' + esc(sp.title || '') + '\"></div></div>';\n  if (sp.type === 'reminder' || sp.type === 'countdown') {\n    h += '<div class=\"sec\"><div class=\"sec-t\">' +\n      (sp.type === 'reminder' ? W(\"زمان یادآوری (به وقت تهران)\") : W(\"زمان پایان\")) +\n      '</div><div class=\"f-row\"><input id=\"wgAt\" type=\"datetime-local\" value=\"' + wgAtToLocal(sp.at) + '\"></div></div>';\n  }\n  if (sp.type === 'reminder') {\n    h += W(\"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">تکرار</div>\") +\n      wgChipsPick('rep', [{ v: 'none', l: W(\"یک‌بار\") }, { v: 'daily', l: W(\"🔁 هر روز\") }], sp.repeat || 'none') + '</div>';\n  }\n  if (sp.type === 'reminder' || sp.type === 'countdown' || sp.type === 'note') {\n    h += W(\"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">متن</div><textarea id=\\\"wgX\\\" class=\\\"f-area\\\" maxlength=\\\"150\\\">\") +\n      esc(sp.text || '') + '</textarea></div>';\n  }\n  if (sp.type === 'list') {\n    h += W(\"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">آیتم‌ها (هر خط یکی)</div><textarea id=\\\"wgI\\\" class=\\\"f-area\\\">\") +\n      esc((sp.items || []).join('\\n')) + '</textarea></div>';\n  }\n  h += W(\"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">اندازه ویجت</div>\") +\n    wgChipsPick('size', [\n      { v: '1x1', l: W(\"▣ کوچک\") }, { v: '2x1', l: W(\"▭ پهن\") },\n      { v: '1x2', l: W(\"▯ بلند\") }, { v: '2x2', l: W(\"▦ بزرگ\") },\n    ], sp.size) + '</div>';\n  h += W(\"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">رنگ</div>\") +\n    wgChipsPick('acc', [\n      { v: 'blue', l: W(\"🔵 آبی\") }, { v: 'green', l: W(\"🟢 سبز\") }, { v: 'red', l: W(\"🔴 قرمز\") },\n    ], sp.accent) + '</div>';\n  h += '<div class=\"f-row\" style=\"gap:8px;flex-wrap:wrap;margin-bottom:12px\">' +\n    '<button class=\"btn acc sm\" data-act=\"wg-save\" data-id=\"' + esc(id) + W(\"\\\">ذخیره ✅</button>\") +\n    '<button class=\"btn ghost sm\" data-act=\"wg-up\" data-id=\"' + esc(id) + W(\"\\\">↑ جلو</button>\") +\n    '<button class=\"btn ghost sm\" data-act=\"wg-down\" data-id=\"' + esc(id) + W(\"\\\">↓ عقب</button>\") +\n    '<button class=\"btn ghost sm\" data-act=\"wg-del\" data-id=\"' + esc(id) + W(\"\\\" style=\\\"color:var(--danger)\\\">🗑 حذف</button></div>\");\n  h += W(\"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">یا دوباره با AI از نو بسازش</div>\") +\n    W(\"<textarea id=\\\"wgAi\\\" class=\\\"f-area\\\" placeholder=\\\"مثلاً: فردا ساعت ۱۰ صبح جلسه دارم\\\"></textarea>\") +\n    '<button class=\"btn ghost sm\" data-act=\"wg-ai\" data-id=\"' + esc(id) + W(\"\\\" style=\\\"margin-top:8px;width:100%\\\">✨ بازسازی با AI</button></div>\");\n  openSheet(W(\"ویرایش ویجت\"), h);\n}\n\nasync function wgSaveFromSheet(id) {\n  const sp = wgFind(id);\n  if (!sp) return;\n  const pick = (k) => {\n    const el = document.querySelector('#shBody [data-wg-pick=\"' + k + '\"].on');\n    return el ? el.dataset.v : null;\n  };\n  const nsp = JSON.parse(JSON.stringify(sp));\n  const tv = $('wgT') ? $('wgT').value.trim() : '';\n  if (tv) nsp.title = tv.slice(0, 30);\n  if ($('wgX')) nsp.text = ($('wgX').value || '').replace(/\\s+/g, ' ').trim().slice(0, 150);\n  if ($('wgI')) nsp.items = ($('wgI').value || '').split('\\n').map((s) => s.trim()).filter(Boolean).slice(0, 6);\n  if ($('wgAt')) { const at = wgLocalToAt($('wgAt').value); if (at) nsp.at = at; }\n  const sz = pick('size'); if (sz) nsp.size = sz;\n  const ac = pick('acc'); if (ac) nsp.accent = ac;\n  const rp = pick('rep'); if (rp) nsp.repeat = rp;\n  try {\n    const r = await API.post('/api/v1/widgets', { op: 'put', spec: nsp });\n    S.widgets = r.items || [];\n    try { localStorage.removeItem('wgDue:' + id); } catch (e) {}\n    closeSheet();\n    wgFlipRender();\n    toast(W(\"ویجت ذخیره شد ✅\"), 'ok');\n  } catch (e) { toast(e.message, 'err'); }\n}\nasync function wgDelFromSheet(id) {\n  try {\n    const r = await API.post('/api/v1/widgets', { op: 'del', id: id });\n    S.widgets = r.items || [];\n    try { localStorage.removeItem('wgDue:' + id); localStorage.removeItem('wgCk:' + id); } catch (e) {}\n    closeSheet();\n    wgFlipRender();\n    toast(W(\"ویجت حذف شد 🗑\"), 'ok');\n  } catch (e) { toast(e.message, 'err'); }\n}\nasync function wgAiFromSheet(id, btn) {\n  const ta = $('wgAi');\n  const v = ta ? ta.value.trim() : '';\n  if (!v) { toast(W(\"پرامپت را بنویس ✍️\"), 'err'); return; }\n  if (btn) { btn.disabled = true; btn.textContent = W(\"... دارم می‌سازمش\"); }\n  const sp = await wgMake(v, id);\n  if (btn) { btn.disabled = false; btn.textContent = W(\"✨ بازسازی با AI\"); }\n  if (sp) closeSheet();\n}\nasync function wgMove(id, dir) {\n  const ids = (S.widgets || []).map((x) => x.id);\n  const i = ids.indexOf(id);\n  const j = i + dir;\n  if (i < 0 || j < 0 || j >= ids.length) return;\n  ids.splice(j, 0, ids.splice(i, 1)[0]);\n  try {\n    const r = await API.post('/api/v1/widgets', { op: 'reorder', order: ids });\n    S.widgets = r.items || S.widgets;\n    wgFlipRender();\n    toast(dir < 0 ? W(\"برد جلوتر ↑\") : W(\"برد عقب‌تر ↓\"), 'ok');\n  } catch (e) { toast(e.message, 'err'); }\n}\n\n/* ─── وایر صفحه ویجت‌ها ─── */\nfunction wireWidgets() {\n  $('wgMake').addEventListener('click', async () => {\n    const v = $('wgInput').value.trim();\n    if (!v) { toast(W(\"بنویس چی بسازم ...\"), 'err'); $('wgInput').focus(); return; }\n    const b = $('wgMake');\n    b.disabled = true;\n    const sp = await wgMake(v);\n    if (sp) $('wgInput').value = '';\n    b.disabled = false;\n  });\n  $('wgInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('wgMake').click(); });\n  $('wgEx').addEventListener('click', (e) => {\n    const b = e.target.closest('[data-ex]');\n    if (b) { $('wgInput').value = b.dataset.ex; $('wgInput').focus(); }\n  });\n  $('wgRefresh').addEventListener('click', async () => {\n    const b = $('wgRefresh');\n    b.disabled = true;\n    try {\n      const r = await API.get('/api/v1/widgets');\n      S.widgets = r.items || [];\n      S.wgMax = r.max || S.wgMax;\n      S.wgLoaded = true;\n      S.wgWx = null; S.wgStats = null;\n      wgFlipRender();\n      wgLoadWx(true);\n      wgLoadStats(true);\n      toast(W(\"تازه شد 🔄\"), 'ok');\n    } catch (e) { toast(e.message, 'err'); }\n    b.disabled = false;\n  });\n  $('wgBoard').addEventListener('click', (e) => {\n    const ed = e.target.closest('[data-wg-edit]');\n    if (ed) { wgEditSheet(ed.dataset.wgEdit); return; }\n    const li = e.target.closest('[data-wg-li]');\n    if (li) {\n      const id = li.dataset.id, idx = +li.dataset.wgLi;\n      let ck = [];\n      try { ck = JSON.parse(localStorage.getItem('wgCk:' + id) || '[]') || []; } catch (er) { ck = []; }\n      const at = ck.indexOf(idx);\n      if (at >= 0) ck.splice(at, 1); else ck.push(idx);\n      try { localStorage.setItem('wgCk:' + id, JSON.stringify(ck)); } catch (er) {}\n      const on = ck.indexOf(idx) >= 0;\n      li.classList.toggle('on', on);\n      const bi = li.querySelector('i');\n      if (bi) bi.textContent = on ? '✓' : '';\n      haptic(10);\n      return;\n    }\n  });\n  if (!S.wgTimer) S.wgTimer = setInterval(wgTick, 1000);\n}\n\n/* ═══════════ شیت‌ها ═══════════ */\nfunction openSheet(title, html) {\n  $('shTitle').textContent = title;\n  $('shBody').innerHTML = html;\n  $('backdrop').hidden = false;\n  $('sheet').hidden = false;\n  requestAnimationFrame(() => {\n    $('backdrop').classList.add('on');\n    $('sheet').classList.add('on');\n  });\n  haptic(12);\n}\nfunction closeSheet() {\n  $('backdrop').classList.remove('on');\n  $('sheet').classList.remove('on');\n  setTimeout(() => { $('backdrop').hidden = true; $('sheet').hidden = true; }, 460);\n}\nfunction wireSheets() {\n  $('shClose').addEventListener('click', closeSheet);\n  $('backdrop').addEventListener('click', closeSheet);\n  $('shBody').addEventListener('click', async (e) => {\n    const act = (e.target.closest('[data-act]') || {}).dataset;\n    if (act && act.act) {\n      if (act.act === 'close') { closeSheet(); return; }\n      if (act.act === 'wg-save') { wgSaveFromSheet(act.id); return; }\n      if (act.act === 'wg-del') { wgDelFromSheet(act.id); return; }\n      if (act.act === 'wg-ai') { wgAiFromSheet(act.id, e.target.closest('button')); return; }\n      if (act.act === 'wg-up') { wgMove(act.id, -1); return; }\n      if (act.act === 'wg-down') { wgMove(act.id, 1); return; }\n      if (act.act === 'do-imgmodel') {\n        try {\n          await API.post('/api/v1/settings', { imgModel: act.id });\n          S.settings.imgModel = act.id;\n          closeSheet(); toast(W(\"مدل تصویر عوض شد ✅\"), 'ok'); renderSettings();\n        } catch (er) { toast(er.message, 'err'); }\n        return;\n      }\n      if (act.act === 'do-del') {\n        try {\n          const r = await API.post('/api/v1/thread', { op: 'delete', id: act.id });\n          S.threads = r.threads; S.thread = r.thread;\n          closeSheet(); toast(W(\"حذف شد\"), 'ok'); renderThreads(); loadHistory();\n        } catch (er) { toast(er.message, 'err'); }\n        return;\n      }\n      if (act.act === 'do-ren') {\n        try {\n          const r = await API.post('/api/v1/thread', { op: 'rename', id: act.id, name: $('renIn').value });\n          S.threads = r.threads;\n          closeSheet(); toast(W(\"نام عوض شد ✅\"), 'ok'); renderThreads();\n        } catch (er) { toast(er.message, 'err'); }\n        return;\n      }\n      if (act.act === 'do-memclear') {\n        try { await API.post('/api/v1/memory', { op: 'clear' }); closeSheet(); toast(W(\"حافظه پاک شد\"), 'ok'); renderMemory(); }\n        catch (er) { toast(er.message, 'err'); }\n        return;\n      }\n      if (act.act === 'do-memedit') {\n        try {\n          await API.post('/api/v1/memory', { op: 'edit', id: act.id, newText: $('memEd').value });\n          closeSheet(); toast(W(\"ویرایش شد ✅\"), 'ok'); renderMemory();\n        } catch (er) { toast(er.message, 'err'); }\n        return;\n      }\n      if (act.act === 'do-clearhist') {\n        try {\n          await API.post('/api/v1/thread', { op: 'clear', id: S.thread });\n          closeSheet(); toast(W(\"تاریخچه پاک شد 🧹\"), 'ok'); loadHistory();\n        } catch (er) { toast(er.message, 'err'); }\n        return;\n      }\n      if (act.act === 'act-img') { closeSheet(); setTimeout(() => $('fileImg').click(), 300); return; }\n      if (act.act === 'act-txt') { closeSheet(); setTimeout(() => $('fileTxt').click(), 300); return; }\n    }\n    /* انتخاب چیپ‌های ویجت (اندازه/رنگ/تکرار) */\n    const wgp = e.target.closest('[data-wg-pick]');\n    if (wgp) {\n      const grp = wgp.dataset.wgPick;\n      $('#shBody [data-wg-pick=\"' + grp + '\"]').forEach((x) => x.classList.toggle('on', x === wgp));\n      haptic(8);\n      return;\n    }\n    /* انتخاب مدل */\n    const mi = e.target.closest('[data-model]');\n    if (mi) {\n      const key = mi.dataset.model;\n      try {\n        await setSetting({ model: key });\n        closeSheet();\n        toast(W(\"مدل عوض شد ✅\"), 'ok');\n        haptic(18);\n        await bootState(true);\n      } catch (er) { toast(er.message, 'err'); }\n      return;\n    }\n    /* انتخاب پرسونا */\n    const pi = e.target.closest('[data-persona]');\n    if (pi) {\n      try {\n        await setSetting({ persona: +pi.dataset.persona });\n        closeSheet();\n        toast(W(\"شخصیت عوض شد ✅\"), 'ok');\n        if (S.screen === 'settings') renderSettings();\n      } catch (er) { toast(er.message, 'err'); }\n      return;\n    }\n    /* تم/چیدمان از شیت */\n    const lc = e.target.closest('[data-loc]');\n    if (lc) {\n      setLocale(lc.dataset.loc, true);\n      $('#localeSeg .seg-b').forEach((b2) => b2.classList.toggle('on', b2 === lc));\n      haptic(16);\n      toast(W(\"ذخیره شد ✅\"), 'ok');\n      return;\n    }\n    const tp = e.target.closest('[data-theme-pick]');\n    if (tp) {\n      applyTheme(tp.dataset.themePick, true);\n      $('#shBody [data-theme-pick]').forEach((p) => p.classList.toggle('on', p === tp));\n      toast(W(\"تم: \") + THEME_NAMES[S.theme], 'ok');\n      return;\n    }\n    const lp = e.target.closest('[data-layout-pick]');\n    if (lp) {\n      applyLayout(lp.dataset.layoutPick, true);\n      $('#shBody [data-layout-pick]').forEach((p) => p.classList.toggle('on', p === lp));\n      toast(W(\"چیدمان: \") + LAYOUT_NAMES[S.layout], 'ok');\n      return;\n    }\n  });\n  /* جستجوی مدل */\n  $('shBody').addEventListener('input', (e) => {\n    if (e.target.id !== 'mdlSearch') return;\n    const q = e.target.value.trim().toLowerCase();\n    $('#mdlList .item').forEach((it) => {\n      it.hidden = q && (it.dataset.k || '').toLowerCase().indexOf(q) < 0 && it.textContent.toLowerCase().indexOf(q) < 0;\n    });\n    $('#mdlList .sec-t').forEach((h) => { h.hidden = !!q; });\n  });\n}\nfunction openModelsSheet() {\n  let html = W(\"<div class=\\\"f-row\\\" style=\\\"margin-bottom:6px\\\"><input id=\\\"mdlSearch\\\" placeholder=\\\"جستجوی مدل...\\\"></div>\");\n  const groups = {};\n  S.models.forEach((m) => {\n    const g = m.prov === 'cf' ? 'Workers AI ☁️' : (m.provName || W(\"سرویس‌ها\"));\n    (groups[g] = groups[g] || []).push(m);\n  });\n  html += '<div class=\"list\" id=\"mdlList\">';\n  Object.keys(groups).forEach((g) => {\n    html += '<div class=\"sec-t\" style=\"margin-top:10px\">' + esc(g) + '</div>';\n    groups[g].forEach((m) => {\n      const active = m.key === (S.currentModel.key || S.settings.model);\n      html += '<div class=\"item' + (active ? ' active' : '') + '\" data-model=\"' + esc(m.key) + '\" data-k=\"' + esc((m.name || '') + ' ' + (m.key || '')) + '\">' +\n        '<span class=\"ic\">' + (active ? '✅' : (m.prov === 'cf' ? '☁️' : '🔌')) + '</span>' +\n        '<div class=\"mid\"><div class=\"t1\">' + esc(m.name) + '</div>' +\n        '<div class=\"t2\">' + esc(m.provName || '') + ' · ' + m.ctx + 'K' + (m.vision ? W(\" · 👁 ویژن\") : '') + '</div></div></div>';\n    });\n  });\n  html += '</div>';\n  openSheet(W(\"انتخاب مدل\"), html);\n  setTimeout(() => { const el = $('mdlSearch'); if (el) el.focus(); }, 400);\n}\nfunction openPersonasSheet() {\n  let html = '<div class=\"list\">';\n  S.personas.forEach((p, i) => {\n    const active = (S.settings.persona || 0) === i;\n    html += '<div class=\"item' + (active ? ' active' : '') + '\" data-persona=\"' + i + '\">' +\n      '<span class=\"ic\">' + esc(p.icon) + '</span>' +\n      '<div class=\"mid\"><div class=\"t1\">' + esc(p.name) + '</div></div>' +\n      (active ? W(\"<span class=\\\"badge\\\">فعال</span>\") : '') + '</div>';\n  });\n  html += '</div>';\n  openSheet(W(\"شخصیت (پرسونا)\"), html);\n}\nfunction openThemeSheet() {\n  openSheet(W(\"تم و چیدمان\"),\n    W(\"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">تم رنگی</div>\") + themePickHtml() + '</div>' +\n    W(\"<div class=\\\"sec\\\"><div class=\\\"sec-t\\\">چیدمان</div>\") + layoutPickHtml() + '</div>');\n}\n\n/* ═══════════ ورود ═══════════ */\nfunction wireLogin() {\n  $('loginGo').addEventListener('click', doLogin);\n  $('loginPw').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });\n  $('loginSwitch').addEventListener('click', () => {\n    try { localStorage.removeItem('tk'); } catch (e) {}\n    S.token = '';\n    if (window.Android && Android.reset) { Android.reset(); }\n    else { $('loginSt').className = 'status'; $('loginSt').textContent = W(\"در حالت مرورگر، آدرس را در ورکر جدید عوض کن و رفرش بزن.\"); }\n  });\n}\n"},"app.css":{"t":"text/css; charset=utf-8","b":"/* ═══════════════════════════════════════════════════════════════\n   Behrad AI — Liquid Glass UI\n   ۴ تم (آبی تیره / زمردی / عنابی / طوفانی) × ۳ چیدمان (کلاسیک /\n   غوطه‌ور / bento) — بدون بنفش، بدون صورتی؛ فقط آبی، سبز، قرمز.\n   ═══════════════════════════════════════════════════════════════ */\n\n@font-face {\n  font-family: 'Vazirmatn';\n  font-style: normal;\n  font-weight: 100 900;\n  font-display: swap;\n  src: url('./font-ar.woff2') format('woff2');\n  unicode-range: U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+1EE00-1EEF1;\n}\n@font-face {\n  font-family: 'Vazirmatn';\n  font-style: normal;\n  font-weight: 100 900;\n  font-display: swap;\n  src: url('./font-la.woff2') format('woff2');\n}\n\n/* ─── توکن‌ها ─── */\n:root {\n  --it: 0px; --ib: 0px; --il: 0px; --ir: 0px;   /*Insets از اندروید*/\n  --bg0: #050B14; --bg1: #0A1B33;\n  --bl1: 11,79,158; --bl2: 11,122,85; --bl3: 143,29,34;\n  --acc: #38BDF8; --acc2: #34D399; --danger: #F87171; --warn: #FBBF24;\n  --acc-rgb: 56,189,248; --acc2-rgb: 52,211,153;\n  --txt: #EAF6FF; --muted: #93A9C2; --dim: #5F7893;\n  --glass: linear-gradient(160deg, rgba(255,255,255,.105), rgba(255,255,255,.035));\n  --glass-2: linear-gradient(160deg, rgba(255,255,255,.16), rgba(255,255,255,.05));\n  --bd: rgba(255,255,255,.155);\n  --specular: inset 0 1.5px 0 rgba(255,255,255,.45), inset 0 -14px 32px rgba(var(--acc-rgb),.05);\n  --lift: 0 24px 60px rgba(0,0,0,.5);\n  --r-lg: 28px; --r-md: 19px; --r-sm: 13px;\n  --ease: cubic-bezier(.2,.9,.25,1.08);\n  --spring: cubic-bezier(.34,1.56,.64,1);\n  --dur: .42s;\n  --top-h: 64px; --dock-h: 78px;\n  --msg-max: 84%;\n}\nhtml[data-theme=\"jade\"] {\n  --bg0: #04120E; --bg1: #0A2A1F;\n  --bl1: 11,122,85; --bl2: 11,79,158; --bl3: 143,90,20;\n  --acc: #34D399; --acc2: #38BDF8;\n  --acc-rgb: 52,211,153; --acc2-rgb: 56,189,248;\n}\nhtml[data-theme=\"ember\"] {\n  --bg0: #130709; --bg1: #2B1014;\n  --bl1: 160,32,38; --bl2: 11,79,158; --bl3: 145,96,16;\n  --acc: #F87171; --acc2: #60A5FA;\n  --acc-rgb: 248,113,113; --acc2-rgb: 96,165,250;\n}\nhtml[data-theme=\"storm\"] {\n  --bg0: #07090F; --bg1: #131C2E;\n  --bl1: 30,64,175; --bl2: 150,28,36; --bl3: 11,90,120;\n  --acc: #60A5FA; --acc2: #FB8090;\n  --acc-rgb: 96,165,250; --acc2-rgb: 251,128,144;\n}\n\n/* ─── پایه ─── */\n* { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }\nhtml, body { height: 100%; }\nbody {\n  font-family: 'Vazirmatn', system-ui, 'Segoe UI', Tahoma, sans-serif;\n  background: var(--bg0);\n  color: var(--txt);\n  overflow: hidden;\n  font-size: 15px;\n  line-height: 1.75;\n  -webkit-font-smoothing: antialiased;\n  text-rendering: optimizeLegibility;\n  user-select: none;\n}\ninput, textarea { user-select: text; -webkit-user-select: text; }\nbutton { font-family: inherit; color: inherit; border: none; background: none; cursor: pointer; font-size: inherit; }\nbutton:active { transform: scale(.96); }\n::-webkit-scrollbar { width: 0; height: 0; }\n:focus-visible { outline: 2px solid rgba(var(--acc-rgb),.8); outline-offset: 2px; border-radius: 8px; }\n[hidden] { display: none !important; }\n\n/* ─── پس‌زمینه زنده ─── */\n.bg { position: fixed; inset: 0; z-index: 0; overflow: hidden;\n  background:\n    radial-gradient(120% 90% at 85% -10%, rgba(var(--bl1),.30), transparent 55%),\n    radial-gradient(110% 80% at -10% 100%, rgba(var(--bl2),.24), transparent 55%),\n    linear-gradient(165deg, var(--bg1), var(--bg0) 70%);\n  transition: background 1s ease;\n}\n.blob { position: absolute; border-radius: 50%; filter: blur(72px); opacity: .5; mix-blend-mode: screen; will-change: transform; }\n.b1 { width: 58vmax; height: 58vmax; background: radial-gradient(circle, rgb(var(--bl1)), transparent 65%); top: -20vmax; right: -16vmax; animation: drift1 19s ease-in-out infinite alternate; }\n.b2 { width: 50vmax; height: 50vmax; background: radial-gradient(circle, rgb(var(--bl2)), transparent 65%); bottom: -18vmax; left: -14vmax; animation: drift2 23s ease-in-out infinite alternate; }\n.b3 { width: 36vmax; height: 36vmax; background: radial-gradient(circle, rgb(var(--bl3)), transparent 65%); bottom: 4vmax; right: -10vmax; animation: drift3 27s ease-in-out infinite alternate; }\n@keyframes drift1 { to { transform: translate(-10vmax, 8vmax) scale(1.16) rotate(12deg); } }\n@keyframes drift2 { to { transform: translate(8vmax, -10vmax) scale(1.1); } }\n@keyframes drift3 { to { transform: translate(-7vmax, -6vmax) scale(.9); } }\n.aura { position: absolute; inset: -20%; background: conic-gradient(from 0deg at 50% 50%, transparent 0 70%, rgba(var(--acc-rgb),.10) 82%, transparent 96%); animation: auraSpin 26s linear infinite; opacity: .5; }\n@keyframes auraSpin { to { transform: rotate(360deg); } }\n.grain { position: absolute; inset: 0; opacity: .05; pointer-events: none;\n  background-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.7'/></svg>\"); }\n\n/* ─── اسپلش ─── */\n#splash { position: fixed; inset: 0; z-index: 90; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px;\n  background: radial-gradient(90% 70% at 50% 30%, rgba(var(--bl1),.16), transparent), var(--bg0);\n  transition: opacity .7s ease, transform .7s var(--ease), filter .7s ease; }\n#splash.off { opacity: 0; transform: scale(1.06); filter: blur(10px); pointer-events: none; }\n.sp-logo { width: 96px; height: 96px; position: relative; }\n.sp-logo.sm { width: 74px; height: 74px; margin: 0 auto 14px; }\n.sp-logo .ring { position: absolute; inset: 0; border-radius: 50%; border: 3.5px solid rgba(255,255,255,.2);\n  border-top-color: var(--acc); border-right-color: var(--acc2); border-left-color: var(--danger);\n  animation: spin 1.6s linear infinite; box-shadow: 0 0 34px rgba(var(--acc-rgb),.35), inset 0 0 26px rgba(var(--acc-rgb),.15); }\n.sp-logo .star { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 42px; animation: pulse 1.8s ease-in-out infinite; }\n.sp-logo.sm .star { font-size: 32px; }\n@keyframes spin { to { transform: rotate(360deg); } }\n@keyframes pulse { 50% { transform: scale(1.16); filter: drop-shadow(0 0 16px rgba(var(--acc-rgb),.95)); } }\n.sp-name { font-size: 30px; font-weight: 800; letter-spacing: 1px; display: flex; }\n.sp-name span { animation: letterIn .6s var(--ease) both; }\n.sp-name span:nth-child(1) { animation-delay: .05s; } .sp-name span:nth-child(2) { animation-delay: .11s; }\n.sp-name span:nth-child(3) { animation-delay: .17s; } .sp-name span:nth-child(4) { animation-delay: .23s; }\n.sp-name span:nth-child(5) { animation-delay: .29s; } .sp-name span:nth-child(6) { animation-delay: .35s; }\n.sp-name span:nth-child(7) { animation-delay: .45s; }\n@keyframes letterIn { from { opacity: 0; transform: translateY(20px) rotateX(70deg); filter: blur(6px); } }\n.sp-ai { color: var(--acc); text-shadow: 0 0 24px rgba(var(--acc-rgb),.7); }\n.sp-line { width: 190px; height: 3px; border-radius: 99px; background: rgba(255,255,255,.1); overflow: hidden; }\n.sp-line i { display: block; height: 100%; width: 40%; border-radius: 99px; background: linear-gradient(90deg, var(--acc), var(--acc2)); animation: load 1.4s ease-in-out infinite; }\n@keyframes load { 0% { transform: translateX(160%); } 100% { transform: translateX(-320%); } }\n\n/* ─── شیشه ─── */\n.glass { background: var(--glass); backdrop-filter: blur(22px) saturate(165%); -webkit-backdrop-filter: blur(22px) saturate(165%);\n  border: 1px solid var(--bd); box-shadow: var(--specular), var(--lift); }\n\n/* ─── چیدمان کلاسیک: اپ‌بار ─── */\n#app { position: fixed; inset: 0; z-index: 2; display: flex; flex-direction: column;\n  animation: appIn .6s var(--ease) .1s both; }\n@keyframes appIn { from { opacity: 0; transform: translateY(16px); filter: blur(8px); } }\n\n#topbar {\n  position: relative; z-index: 20; flex: none;\n  display: flex; align-items: center; gap: 10px;\n  padding: calc(var(--it) + 10px) 14px 10px;\n  min-height: calc(var(--top-h) + var(--it));\n  background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.03));\n  backdrop-filter: blur(26px) saturate(170%); -webkit-backdrop-filter: blur(26px) saturate(170%);\n  border-bottom: 1px solid rgba(255,255,255,.10);\n  box-shadow: 0 12px 34px rgba(0,0,0,.28);\n  will-change: transform;\n}\n.tb-btn { width: 40px; height: 40px; border-radius: 14px; display: grid; place-items: center; font-size: 17px;\n  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);\n  transition: transform .3s var(--spring), background .3s, box-shadow .3s; flex: none; }\n.tb-btn:hover { background: rgba(255,255,255,.13); box-shadow: 0 6px 18px rgba(0,0,0,.35); }\n.tb-btn.glow { color: var(--acc); box-shadow: inset 0 0 14px rgba(var(--acc-rgb),.16); }\n.tb-brand { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; transition: opacity .3s, transform .3s; }\n.tb-logo { width: 38px; height: 38px; border-radius: 50%; flex: none; position: relative;\n  background: radial-gradient(circle at 32% 28%, rgba(255,255,255,.35), rgba(255,255,255,.05) 55%), conic-gradient(from 210deg, rgba(var(--acc-rgb),.9), rgba(var(--acc2-rgb),.85), rgba(248,113,113,.8), rgba(var(--acc-rgb),.9));\n  box-shadow: 0 0 20px rgba(var(--acc-rgb),.45), inset 0 1.5px 0 rgba(255,255,255,.6);\n  animation: logoBreath 5s ease-in-out infinite; }\n.tb-logo::after { content: \"✨\"; position: absolute; inset: 0; display: grid; place-items: center; font-size: 17px; }\n@keyframes logoBreath { 50% { box-shadow: 0 0 30px rgba(var(--acc-rgb),.65), inset 0 1.5px 0 rgba(255,255,255,.6); transform: scale(1.05); } }\n.tb-titles { min-width: 0; }\n.tb-title { font-weight: 800; font-size: 16.5px; letter-spacing: .2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;\n  text-shadow: 0 1px 12px rgba(var(--acc-rgb),.35); }\n.scr-title { flex: 1; font-weight: 800; font-size: 17px; }\n.tb-chip { display: inline-flex; align-items: center; gap: 6px; max-width: 100%;\n  font-size: 11.5px; color: var(--muted); padding: 2px 10px; margin-top: 1px;\n  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); border-radius: 99px;\n  transition: all .3s; white-space: nowrap; overflow: hidden; }\n.tb-chip:hover { color: var(--txt); border-color: rgba(var(--acc-rgb),.6); }\n.tb-chip .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--acc2); box-shadow: 0 0 8px var(--acc2); flex: none; animation: pulse2 2.2s ease-in-out infinite; }\n@keyframes pulse2 { 50% { opacity: .45; transform: scale(.8); } }\n.tb-chip span:last-child { overflow: hidden; text-overflow: ellipsis; }\n.tb-actions { display: flex; gap: 8px; flex: none; }\n#backBtn { font-size: 20px; transform: scaleX(-1); }\n\n/* ─── استیج و اسکرین‌ها ─── */\n#stage { position: relative; flex: 1; min-height: 0; }\n.screen { position: absolute; inset: 0; display: flex; flex-direction: column;\n  opacity: 0; visibility: hidden; transform: translateY(16px) scale(.985); filter: blur(7px);\n  transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease), filter var(--dur) var(--ease), visibility 0s linear var(--dur); }\n.screen.on { opacity: 1; visibility: visible; transform: none; filter: none; transition-delay: 0s; z-index: 3; }\n.screen.leaving { opacity: 0; transform: translateY(-14px) scale(.99); filter: blur(6px); z-index: 2; visibility: visible; }\n.scr-head { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px 10px; }\n.scr-head h2 { font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px;\n  animation: riseIn .55s var(--ease) both; }\n.scr-head .count { font-size: 12.5px; color: var(--acc); background: rgba(var(--acc-rgb),.14); border: 1px solid rgba(var(--acc-rgb),.4);\n  padding: 1px 10px; border-radius: 99px; font-weight: 600; }\n.scr-body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain;\n  padding: 6px 16px calc(var(--dock-h) + var(--ib) + 24px); -webkit-overflow-scrolling: touch; }\n@keyframes riseIn { from { opacity: 0; transform: translateY(16px); filter: blur(5px); } }\n\n/* ─── داک شناور ─── */\n#dock { position: relative; z-index: 20; flex: none; display: flex; justify-content: center; gap: 6px;\n  padding: 8px 12px calc(8px + var(--ib));\n  background: linear-gradient(0deg, rgba(255,255,255,.10), rgba(255,255,255,.03));\n  backdrop-filter: blur(26px) saturate(170%); -webkit-backdrop-filter: blur(26px) saturate(170%);\n  border-top: 1px solid rgba(255,255,255,.11); box-shadow: 0 -16px 40px rgba(0,0,0,.32);\n  animation: dockIn .55s var(--ease) both; }\n@keyframes dockIn { from { transform: translateY(70px); opacity: 0; } }\n.dock-item { position: relative; flex: 1; max-width: 116px; display: flex; flex-direction: column; align-items: center; gap: 1px;\n  padding: 8px 4px 6px; border-radius: 18px; color: var(--muted); font-size: 10.5px;\n  transition: color .35s, transform .35s var(--spring); overflow: hidden; }\n.dock-item .di-ic { font-size: 20px; line-height: 1.15; transition: transform .4s var(--spring); position: relative; z-index: 1; }\n.dock-item .di-lb { position: relative; z-index: 1; transition: transform .4s var(--ease); }\n.dock-item::before { content: \"\"; position: absolute; inset: 4px 6px; border-radius: 14px; opacity: 0; transform: scale(.7);\n  background: linear-gradient(160deg, rgba(var(--acc-rgb),.34), rgba(var(--acc-rgb),.10));\n  border: 1px solid rgba(var(--acc-rgb),.5); box-shadow: 0 6px 20px rgba(var(--acc-rgb),.30), inset 0 1px 0 rgba(255,255,255,.4);\n  transition: opacity .4s var(--ease), transform .45s var(--spring); }\n.dock-item.on { color: var(--txt); }\n.dock-item.on::before { opacity: 1; transform: scale(1); }\n.dock-item.on .di-ic { transform: translateY(-2px) scale(1.16); }\n.dock-item:active .di-ic { transform: scale(.86); }\n\n/* ─── چت ─── */\n[data-screen=\"chat\"] { padding: 0; }\n.chat-wrap { display: contents; }\n.msgs { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;\n  padding: 18px 14px 12px; display: flex; flex-direction: column; gap: 4px; }\n.day-div { align-self: center; font-size: 11px; color: var(--muted); background: rgba(4,12,24,.5);\n  backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,.1); padding: 2px 14px; border-radius: 99px; margin: 12px 0 6px; }\n\n.bubble { max-width: var(--msg-max); padding: 9px 13px 7px; border-radius: 18px; position: relative;\n  animation: bubbleIn .5s var(--ease) both; word-break: break-word; overflow-wrap: anywhere;\n  user-select: text; -webkit-user-select: text; }\n@keyframes bubbleIn { from { opacity: 0; transform: translateY(18px) scale(.94); filter: blur(6px); } }\n.bubble.assistant { align-self: flex-start; background: var(--glass); backdrop-filter: blur(18px) saturate(155%);\n  -webkit-backdrop-filter: blur(18px) saturate(155%); border: 1px solid rgba(255,255,255,.14);\n  box-shadow: inset 0 1.5px 0 rgba(255,255,255,.35), 0 10px 26px rgba(0,0,0,.34);\n  border-bottom-right-radius: 7px; }\n.bubble.user { align-self: flex-end; background: linear-gradient(140deg, rgba(var(--acc-rgb),.34), rgba(var(--acc2-rgb),.20));\n  border: 1px solid rgba(255,255,255,.17); box-shadow: inset 0 1.5px 0 rgba(255,255,255,.42), 0 12px 28px rgba(0,0,0,.34);\n  border-bottom-left-radius: 7px; }\n.bubble .meta { display: flex; justify-content: flex-end; align-items: center; gap: 5px; font-size: 10px; color: rgba(255,255,255,.55); margin-top: 2px; padding: 0 4px; }\n.bubble.user .meta { color: rgba(255,255,255,.75); }\n.bubble.error { border-color: rgba(248,113,113,.55); background: rgba(140,30,36,.30); align-self: flex-start; }\n.bubble .stream-caret { display: inline-block; width: 8px; height: 1.1em; vertical-align: -3px; margin-right: 2px;\n  background: var(--acc); border-radius: 2px; animation: caret .8s steps(2) infinite; box-shadow: 0 0 10px var(--acc); }\n@keyframes caret { 50% { opacity: 0; } }\n\n.b-text { font-size: 14.6px; }\n.b-text p { margin: 3px 0; }\n.b-text h1, .b-text h2, .b-text h3 { font-size: 16px; margin: 8px 0 4px; color: var(--acc); }\n.b-text ul, .b-text ol { margin: 4px 8px 4px 0; padding-right: 20px; }\n.b-text li { margin: 2px 0; }\n.b-text a { color: var(--acc2); text-decoration: none; border-bottom: 1px dashed rgba(var(--acc2-rgb),.7); }\n.b-text blockquote { border-right: 3px solid var(--acc); background: rgba(var(--acc-rgb),.10); padding: 4px 10px; border-radius: 8px; margin: 6px 0; color: var(--muted); }\n.b-text hr { border: none; border-top: 1px dashed rgba(255,255,255,.25); margin: 8px 0; }\n.b-text code { font-family: ui-monospace, Consolas, monospace; font-size: 12.8px; background: rgba(2,10,20,.65);\n  border: 1px solid rgba(255,255,255,.12); padding: 1px 7px; border-radius: 7px; direction: ltr; unicode-bidi: embed; color: #9DE8FF; }\n.b-text pre { position: relative; background: rgba(2,8,16,.78); border: 1px solid rgba(255,255,255,.11);\n  border-radius: 14px; padding: 12px 12px 10px; margin: 7px 0; overflow-x: auto; direction: ltr; text-align: left;\n  box-shadow: inset 0 0 30px rgba(0,0,0,.5); animation: riseIn .4s var(--ease) both; }\n.b-text pre code { background: none; border: none; padding: 0; color: #B8E6FF; font-size: 12.4px; line-height: 1.65; }\n.b-text .copy-btn { position: absolute; top: 6px; left: 6px; font-size: 10.5px; color: var(--muted);\n  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.16); padding: 2px 9px; border-radius: 8px;\n  transition: all .25s; }\n.b-text .copy-btn:hover { color: var(--txt); background: rgba(var(--acc-rgb),.3); border-color: rgba(var(--acc-rgb),.6); }\n/* 🎨 تصویر تولیدشده با /image */\n.b-text .gen-img { display: block; width: 100%; max-width: 420px; height: auto; border-radius: 14px;\n  margin: 2px 0 6px; border: 1px solid rgba(255,255,255,.16); background: #04101d;\n  box-shadow: 0 12px 34px rgba(0,0,0,.45); animation: popIn .5s var(--spring) both; }\n.b-text .gen-cap { font-size: 13px; color: var(--muted); line-height: 1.7; }\n.b-text .gen-cap p { margin: 0; }\n.b-foot { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 7px; padding-top: 6px;\n  border-top: 1px dashed rgba(255,255,255,.14); }\n.b-foot .lbl { font-size: 10.5px; color: var(--dim); flex: 1; min-width: 120px; }\n.foot-btn { font-size: 12px; padding: 3.5px 11px; border-radius: 99px; background: rgba(255,255,255,.08);\n  border: 1px solid rgba(255,255,255,.15); color: var(--muted); transition: all .3s var(--spring); }\n.foot-btn:hover { color: var(--txt); border-color: rgba(var(--acc-rgb),.65); background: rgba(var(--acc-rgb),.22); transform: translateY(-2px); }\n\n.status-pill { align-self: flex-start; display: inline-flex; align-items: center; gap: 9px; font-size: 12.5px; color: var(--muted);\n  background: rgba(4,12,24,.55); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,.14);\n  padding: 6px 15px; border-radius: 99px; margin: 4px 0; box-shadow: 0 8px 22px rgba(0,0,0,.3);\n  animation: popIn .45s var(--spring) both; max-width: 92%; }\n.status-pill .spin { width: 14px; height: 14px; border-radius: 50%; flex: none;\n  border: 2.5px solid rgba(255,255,255,.18); border-top-color: var(--acc); animation: spin .8s linear infinite; }\n.status-pill b { color: var(--acc); font-weight: 600; }\n/* متن وضعیت داخل کپسول: پیام‌ها HTML دارند (<i>/<b>) و باید در یک خطِ قابل‌شکست بمانند */\n.status-pill .pt { min-width: 0; overflow-wrap: anywhere; }\n.status-pill .pt i { font-style: normal; color: var(--txt); }\n@keyframes popIn { from { opacity: 0; transform: scale(.8) translateY(10px); } }\n\n.empty { text-align: center; color: var(--muted); padding: 46px 20px; animation: riseIn .6s var(--ease) both; }\n.empty .em-ic { font-size: 52px; display: block; margin-bottom: 12px; animation: floaty 3.4s ease-in-out infinite;\n  filter: drop-shadow(0 12px 24px rgba(var(--acc-rgb),.4)); }\n@keyframes floaty { 50% { transform: translateY(-12px) rotate(-4deg); } }\n.empty .em-t { font-size: 16px; font-weight: 700; color: var(--txt); margin-bottom: 4px; }\n.empty .em-s { font-size: 13px; line-height: 2; }\n\n/* ─── کامپوزر ─── */\n.composer-holder { flex: none; position: relative; z-index: 10;\n  padding: 6px 12px calc(10px + var(--ib));\n  background: linear-gradient(0deg, rgba(3,9,18,.78), rgba(3,9,18,.25) 70%, transparent);\n  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }\n.quick { display: flex; gap: 7px; overflow-x: auto; padding: 4px 2px 9px; animation: riseIn .35s var(--ease) both; }\n.quick button { flex: none; font-size: 12.5px; color: var(--acc); background: rgba(var(--acc-rgb),.13);\n  border: 1px solid rgba(var(--acc-rgb),.45); padding: 5px 13px; border-radius: 99px; transition: all .3s var(--spring); }\n.quick button:hover { background: rgba(var(--acc-rgb),.3); transform: translateY(-2px); box-shadow: 0 8px 18px rgba(var(--acc-rgb),.3); }\n.composer { border-radius: 26px; transition: box-shadow .4s, border-color .4s, transform .4s var(--ease); }\n.composer:focus-within { border-color: rgba(var(--acc-rgb),.65); box-shadow: var(--specular), var(--lift), 0 0 0 4px rgba(var(--acc-rgb),.16), 0 0 34px rgba(var(--acc-rgb),.25); }\n.c-row { display: flex; align-items: flex-end; gap: 7px; padding: 7px; }\n.c-input { flex: 1; min-width: 0; padding: 4px 4px 2px; }\n.c-input textarea { width: 100%; background: none; border: none; outline: none; resize: none; color: var(--txt);\n  font-family: inherit; font-size: 15px; line-height: 1.7; max-height: 132px; min-height: 30px; display: block; }\n.c-input textarea::placeholder { color: var(--dim); }\n.c-chips { display: flex; gap: 7px; flex-wrap: wrap; padding-bottom: 7px; }\n.c-chip { position: relative; width: 54px; height: 54px; border-radius: 13px; overflow: hidden; border: 1px solid rgba(255,255,255,.25);\n  animation: popIn .4s var(--spring) both; box-shadow: 0 6px 16px rgba(0,0,0,.4); }\n.c-chip img { width: 100%; height: 100%; object-fit: cover; }\n.c-chip .x { position: absolute; top: 2px; left: 2px; width: 19px; height: 19px; border-radius: 50%; font-size: 10px;\n  background: rgba(0,0,0,.72); color: #fff; display: grid; place-items: center; border: 1px solid rgba(255,255,255,.4); }\n.c-chip.file { display: grid; place-items: center; font-size: 9.5px; color: var(--acc2); background: rgba(var(--acc2-rgb),.16); text-align: center; padding: 3px; line-height: 1.3; }\n.c-btn { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; font-size: 18px; flex: none;\n  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14); color: var(--muted);\n  transition: all .35s var(--spring); position: relative; overflow: hidden; }\n.c-btn:hover { color: var(--txt); background: rgba(255,255,255,.15); }\n.c-btn.send { background: linear-gradient(140deg, var(--acc), var(--acc2)); color: #04121F; border: none;\n  box-shadow: 0 10px 26px rgba(var(--acc-rgb),.45), inset 0 1.5px 0 rgba(255,255,255,.7); font-size: 17px; }\n.c-btn.send:hover { transform: translateY(-2px) rotate(-8deg); box-shadow: 0 14px 32px rgba(var(--acc-rgb),.6), inset 0 1.5px 0 rgba(255,255,255,.7); }\n.c-btn.mic.listening { background: linear-gradient(140deg, var(--danger), #C81E26); color: #fff; animation: micPulse 1.1s ease-in-out infinite; box-shadow: 0 0 0 0 rgba(248,113,113,.7); }\n@keyframes micPulse { 70% { box-shadow: 0 0 0 16px rgba(248,113,113,0); } 100% { box-shadow: 0 0 0 0 rgba(248,113,113,0); } }\n.c-btn.send[disabled], .c-btn[disabled] { opacity: .45; pointer-events: none; }\n/* حالت «در حال نوشتن» — setBusy کلاس busy را می‌زد ولی استایلی برایش نبود */\n.c-btn.send.busy { animation: sendBusy 1s ease-in-out infinite; }\n@keyframes sendBusy { 50% { transform: scale(.9); } }\n\n.c-rec { display: flex; align-items: center; gap: 12px; padding: 10px 12px; animation: popIn .4s var(--spring) both; }\n.c-btn.stop { background: rgba(248,113,113,.2); border-color: rgba(248,113,113,.55); color: var(--danger); }\n.rec-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--danger); box-shadow: 0 0 14px var(--danger);\n  animation: pulse2 1s ease-in-out infinite; flex: none; order: -1; }\n.rec-time { font-variant-numeric: tabular-nums; font-size: 14px; color: var(--txt); min-width: 46px; direction: ltr; }\n.rec-wave { flex: 1; display: flex; align-items: center; gap: 3px; height: 34px; direction: ltr; }\n.rec-wave i { flex: 1; background: linear-gradient(180deg, var(--acc), var(--acc2)); border-radius: 4px; height: 18%;\n  transition: height .1s linear; box-shadow: 0 0 8px rgba(var(--acc-rgb),.6); }\n\n/* ─── لیست‌ها و کارت‌ها ─── */\n.list { display: flex; flex-direction: column; gap: 10px; padding-top: 4px; }\n.item { position: relative; display: flex; align-items: center; gap: 13px; padding: 13px 15px; border-radius: var(--r-md);\n  background: var(--glass); backdrop-filter: blur(16px) saturate(150%); -webkit-backdrop-filter: blur(16px) saturate(150%);\n  border: 1px solid rgba(255,255,255,.13); box-shadow: inset 0 1.5px 0 rgba(255,255,255,.3), 0 8px 22px rgba(0,0,0,.26);\n  transition: transform .35s var(--spring), border-color .3s, box-shadow .3s;\n  animation: itemIn .5s var(--ease) both; animation-delay: calc(var(--i, 0) * 55ms); overflow: hidden; cursor: pointer; }\n@keyframes itemIn { from { opacity: 0; transform: translateY(22px) scale(.96); filter: blur(5px); } }\n.item:hover { transform: translateY(-3px); border-color: rgba(var(--acc-rgb),.5); box-shadow: inset 0 1.5px 0 rgba(255,255,255,.35), 0 16px 34px rgba(0,0,0,.4), 0 0 24px rgba(var(--acc-rgb),.14); }\n.item:active { transform: scale(.975); }\n.item::after { content: \"\"; position: absolute; top: 0; bottom: 0; width: 40%;\n  background: linear-gradient(100deg, transparent, rgba(255,255,255,.14), transparent); transform: translateX(-300%) skewX(-16deg);\n  transition: transform .9s ease; pointer-events: none; }\n.item:hover::after { transform: translateX(360%) skewX(-16deg); }\n.item.active { border-color: rgba(var(--acc-rgb),.75); background: linear-gradient(160deg, rgba(var(--acc-rgb),.22), rgba(255,255,255,.05));\n  box-shadow: inset 0 1.5px 0 rgba(255,255,255,.4), 0 10px 30px rgba(0,0,0,.35), 0 0 30px rgba(var(--acc-rgb),.25); }\n.item .ic { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; font-size: 20px; flex: none;\n  background: linear-gradient(150deg, rgba(255,255,255,.16), rgba(255,255,255,.05));\n  border: 1px solid rgba(255,255,255,.2); box-shadow: inset 0 1.5px 0 rgba(255,255,255,.5), 0 6px 14px rgba(0,0,0,.3); }\n.item .mid { flex: 1; min-width: 0; }\n.item .t1 { font-weight: 700; font-size: 14.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.item .t2 { font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.7; }\n.item .act { display: flex; gap: 6px; flex: none; }\n.mini-btn { width: 34px; height: 34px; border-radius: 11px; display: grid; place-items: center; font-size: 14px;\n  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14); color: var(--muted); transition: all .3s var(--spring); }\n.mini-btn:hover { color: var(--txt); transform: translateY(-2px); }\n.mini-btn.del:hover { color: var(--danger); border-color: rgba(248,113,113,.6); background: rgba(248,113,113,.18); box-shadow: 0 8px 18px rgba(248,113,113,.25); }\n.mini-btn.edit:hover { color: var(--acc); border-color: rgba(var(--acc-rgb),.6); background: rgba(var(--acc-rgb),.18); }\n.badge { flex: none; font-size: 11px; padding: 2px 11px; border-radius: 99px; font-weight: 600;\n  background: rgba(var(--acc-rgb),.16); color: var(--acc); border: 1px solid rgba(var(--acc-rgb),.45); }\n.badge.red { background: rgba(248,113,113,.16); color: var(--danger); border-color: rgba(248,113,113,.5); }\n.badge.green { background: rgba(var(--acc2-rgb),.16); color: var(--acc2); border-color: rgba(var(--acc2-rgb),.5); }\n\n.form-card { padding: 15px; border-radius: var(--r-md); margin-bottom: 14px; animation: riseIn .5s var(--ease) both; }\n.f-row { display: flex; gap: 9px; }\n.f-row input, .f-area { flex: 1; min-width: 0; background: rgba(3,12,24,.55); border: 1px solid rgba(255,255,255,.14);\n  border-radius: 14px; padding: 11px 15px; color: var(--txt); font-family: inherit; font-size: 14.5px; outline: none;\n  transition: border-color .3s, box-shadow .3s; }\n.f-row input:focus, .f-area:focus { border-color: rgba(var(--acc-rgb),.7); box-shadow: 0 0 0 4px rgba(var(--acc-rgb),.15); }\n.f-row input::placeholder { color: var(--dim); }\n.f-hint { font-size: 11.5px; color: var(--dim); margin-top: 9px; line-height: 2.1; }\n.f-hint code { background: rgba(2,10,20,.6); border: 1px solid rgba(255,255,255,.12); padding: 0 7px; border-radius: 6px;\n  color: #9DE8FF; font-size: 11px; direction: ltr; unicode-bidi: embed; display: inline-block; margin: 1px 2px; }\n.f-area { width: 100%; min-height: 84px; resize: vertical; margin-top: 8px; line-height: 1.9; }\n\n/* ─── دکمه‌ها ─── */\n.btn { position: relative; overflow: hidden; padding: 11px 22px; border-radius: 15px; font-weight: 700; font-size: 14.5px;\n  background: rgba(255,255,255,.09); border: 1px solid rgba(255,255,255,.16); color: var(--txt);\n  transition: all .35s var(--spring); }\n.btn:hover { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(0,0,0,.4); }\n.btn.sm { padding: 8px 16px; font-size: 13px; border-radius: 13px; }\n.btn.acc { background: linear-gradient(140deg, var(--acc), var(--acc2)); color: #04121F; border: none;\n  box-shadow: 0 10px 26px rgba(var(--acc-rgb),.42), inset 0 1.5px 0 rgba(255,255,255,.7); }\n.btn.acc:hover { box-shadow: 0 14px 34px rgba(var(--acc-rgb),.6), inset 0 1.5px 0 rgba(255,255,255,.7); }\n.btn.ghost { background: rgba(255,255,255,.06); }\n.btn.danger-ghost { background: rgba(248,113,113,.13); border-color: rgba(248,113,113,.45); color: var(--danger); }\n.btn.danger-ghost:hover { background: rgba(248,113,113,.26); box-shadow: 0 10px 24px rgba(248,113,113,.3); }\n.btn::after { content: \"\"; position: absolute; top: 0; bottom: 0; width: 44%;\n  background: linear-gradient(100deg, transparent, rgba(255,255,255,.5), transparent); transform: translateX(-280%) skewX(-16deg); }\n.btn:active::after { transform: translateX(320%) skewX(-16deg); transition: transform .7s ease; }\n.ripple { position: absolute; border-radius: 50%; background: rgba(255,255,255,.5); transform: scale(0);\n  animation: rip .6s ease-out forwards; pointer-events: none; }\n@keyframes rip { to { transform: scale(3.2); opacity: 0; } }\n.linkish { display: block; margin: 14px auto 0; font-size: 12px; color: var(--dim); text-decoration: underline; text-underline-offset: 3px; }\n.linkish:hover { color: var(--acc); }\n\n/* ─── سوییچ و کنترل‌ها ─── */\n.sw { width: 52px; height: 31px; border-radius: 99px; background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.16);\n  position: relative; flex: none; cursor: pointer; transition: background .4s, border-color .4s, box-shadow .4s; }\n.sw::after { content: \"\"; position: absolute; top: 3px; right: 3px; width: 23px; height: 23px; border-radius: 50%;\n  background: #EAF6FF; box-shadow: 0 3px 9px rgba(0,0,0,.45); transition: transform .42s var(--spring), background .3s; }\n.sw.on { background: rgba(var(--acc-rgb),.5); border-color: rgba(var(--acc-rgb),.75); box-shadow: 0 0 18px rgba(var(--acc-rgb),.4), inset 0 0 12px rgba(255,255,255,.25); }\n.sw.on::after { transform: translateX(-21px); background: #fff; }\n.seg { display: flex; gap: 5px; background: rgba(3,12,24,.5); border: 1px solid rgba(255,255,255,.13);\n  padding: 5px; border-radius: 16px; position: relative; }\n.seg button { flex: 1; padding: 9px 8px; border-radius: 12px; font-size: 13.5px; color: var(--muted); z-index: 1;\n  transition: color .3s; white-space: nowrap; }\n.seg button.on { color: #04121F; font-weight: 700; }\n.seg .seg-pill { position: absolute; top: 5px; bottom: 5px; border-radius: 12px; z-index: 0;\n  background: linear-gradient(140deg, var(--acc), var(--acc2)); box-shadow: 0 6px 18px rgba(var(--acc-rgb),.45), inset 0 1.5px 0 rgba(255,255,255,.6);\n  transition: transform .48s var(--spring), width .48s var(--spring); }\n\ninput[type=\"range\"] { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; border-radius: 99px; outline: none;\n  background: linear-gradient(to left, var(--acc) var(--p, 50%), rgba(255,255,255,.13) var(--p, 50%)); direction: ltr; }\ninput[type=\"range\"]::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%;\n  background: radial-gradient(circle at 34% 30%, #fff, #CFEFFF 60%, #8FD6F5);\n  border: none; box-shadow: 0 4px 14px rgba(0,0,0,.5), 0 0 16px rgba(var(--acc-rgb),.7); cursor: pointer;\n  transition: transform .25s var(--spring); }\ninput[type=\"range\"]::-webkit-slider-thumb:active { transform: scale(1.25); }\n\n/* ─── سکشن‌های تنظیمات ─── */\n.sec { margin-bottom: 20px; animation: riseIn .5s var(--ease) both; animation-delay: calc(var(--i, 0) * 70ms); }\n.sec-t { font-size: 12px; color: var(--acc); font-weight: 700; letter-spacing: .5px; margin: 0 6px 8px;\n  display: flex; align-items: center; gap: 8px; }\n.sec-t::after { content: \"\"; flex: 1; height: 1px; background: linear-gradient(to left, rgba(var(--acc-rgb),.5), transparent); }\n.sec-box { border-radius: var(--r-md); overflow: hidden; background: var(--glass); backdrop-filter: blur(16px) saturate(150%);\n  -webkit-backdrop-filter: blur(16px) saturate(150%); border: 1px solid rgba(255,255,255,.13);\n  box-shadow: inset 0 1.5px 0 rgba(255,255,255,.3), 0 10px 26px rgba(0,0,0,.28); }\n.row { display: flex; align-items: center; gap: 13px; padding: 13px 16px; border-bottom: 1px solid rgba(255,255,255,.07);\n  transition: background .3s; }\n.row:last-child { border-bottom: none; }\n.row:hover { background: rgba(255,255,255,.045); }\n.row .ic { width: 36px; height: 36px; border-radius: 12px; display: grid; place-items: center; font-size: 17px; flex: none;\n  background: rgba(255,255,255,.09); border: 1px solid rgba(255,255,255,.15); box-shadow: inset 0 1px 0 rgba(255,255,255,.4); }\n.row .mid { flex: 1; min-width: 0; }\n.row .t1 { font-size: 14.3px; font-weight: 600; }\n.row .t2 { font-size: 11.8px; color: var(--muted); line-height: 1.8; }\n.row .val { font-size: 13px; color: var(--acc); font-weight: 700; direction: ltr; }\n.row.slider-row { flex-direction: column; align-items: stretch; gap: 10px; }\n.row.slider-row .sr-top { display: flex; align-items: center; gap: 13px; }\n.chev { color: var(--dim); font-size: 16px; transform: scaleX(-1); transition: transform .3s var(--spring); }\n.item:hover .chev, .row.click:hover .chev { transform: scaleX(-1) translateX(-4px); color: var(--acc); }\n.row.click { cursor: pointer; }\n\n/* ─── bento ─── */\n.bento { display: grid; grid-template-columns: repeat(2, 1fr); gap: 13px; padding-top: 8px; }\n.b-card { position: relative; grid-column: span 1; border-radius: 24px; padding: 17px; overflow: hidden;\n  background: var(--glass); backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%);\n  border: 1px solid rgba(255,255,255,.14); box-shadow: var(--specular), 0 14px 34px rgba(0,0,0,.34);\n  animation: itemIn .6s var(--ease) both; animation-delay: calc(var(--i, 0) * 70ms);\n  transition: transform .4s var(--spring), box-shadow .4s; cursor: pointer; min-height: 118px;\n  display: flex; flex-direction: column; justify-content: space-between; }\n.b-card:hover { transform: translateY(-5px) scale(1.015); box-shadow: var(--specular), 0 26px 54px rgba(0,0,0,.5), 0 0 36px rgba(var(--acc-rgb),.18); }\n.b-card:active { transform: scale(.97); }\n.b-card.span2 { grid-column: span 2; }\n.b-card .bc-ic { font-size: 26px; filter: drop-shadow(0 6px 14px rgba(var(--acc-rgb),.55)); }\n.b-card .bc-t { font-size: 12.5px; color: var(--muted); font-weight: 600; }\n.b-card .bc-v { font-size: 25px; font-weight: 800; letter-spacing: .3px; line-height: 1.35;\n  text-shadow: 0 2px 18px rgba(var(--acc-rgb),.5); direction: ltr; text-align: right; unicode-bidi: plaintext; }\n.b-card .bc-s { font-size: 11.5px; color: var(--dim); }\n.b-card.hero { grid-column: span 2; min-height: 138px; justify-content: center; text-align: center; align-items: center; gap: 6px;\n  background: linear-gradient(150deg, rgba(var(--acc-rgb),.34), rgba(var(--acc2-rgb),.20)), var(--glass);\n  border-color: rgba(255,255,255,.26); }\n.b-card.hero .bc-ic { font-size: 44px; animation: floaty 3.2s ease-in-out infinite; }\n.b-card.hero .bc-v { font-size: 21px; }\n.b-card.accent { background: linear-gradient(150deg, rgba(var(--acc-rgb),.30), rgba(255,255,255,.04)); }\n.b-card.red { background: linear-gradient(150deg, rgba(248,113,113,.30), rgba(255,255,255,.04)); }\n.b-card.green { background: linear-gradient(150deg, rgba(var(--acc2-rgb),.30), rgba(255,255,255,.04)); }\n.b-card .glow { position: absolute; width: 130px; height: 130px; border-radius: 50%; top: -50px; left: -40px;\n  background: radial-gradient(circle, rgba(var(--acc-rgb),.5), transparent 70%); filter: blur(30px); opacity: .8; pointer-events: none;\n  animation: glowMove 7s ease-in-out infinite alternate; }\n@keyframes glowMove { to { transform: translate(70px, 60px) scale(1.3); } }\n.theme-dots { display: flex; gap: 8px; justify-content: center; padding-top: 6px; }\n.theme-dots i { width: 22px; height: 22px; border-radius: 50%; border: 2px solid rgba(255,255,255,.5); cursor: pointer;\n  transition: transform .35s var(--spring), box-shadow .3s; }\n.theme-dots i:hover { transform: scale(1.25); }\n.theme-dots i.on { transform: scale(1.18); box-shadow: 0 0 0 3px rgba(255,255,255,.28), 0 0 18px currentColor; border-color: #fff; }\n\n/* ─── تم‌ها و چیدمان‌ها (انتخابگر) ─── */\n.pick-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 11px; }\n.pick { position: relative; border-radius: 18px; padding: 14px; min-height: 92px; overflow: hidden; cursor: pointer;\n  border: 2px solid rgba(255,255,255,.14); transition: all .4s var(--spring); background: var(--glass);\n  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }\n.pick:hover { transform: translateY(-4px); }\n.pick.on { border-color: var(--acc); box-shadow: 0 0 0 3px rgba(var(--acc-rgb),.28), 0 14px 32px rgba(0,0,0,.45); }\n.pick .pk-t { font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: space-between; }\n.pick .pk-s { font-size: 11px; color: var(--muted); margin-top: 3px; line-height: 1.8; }\n.pick .pk-check { position: absolute; top: 10px; left: 10px; width: 22px; height: 22px; border-radius: 50%;\n  background: var(--acc); color: #04121F; display: grid; place-items: center; font-size: 12px; font-weight: 900;\n  transform: scale(0); transition: transform .4s var(--spring); }\n.pick.on .pk-check { transform: scale(1); }\n.pk-swatches { display: flex; gap: 6px; margin-top: 9px; }\n.pk-swatches i { width: 26px; height: 15px; border-radius: 6px; border: 1px solid rgba(255,255,255,.35); }\n.pick .pk-prev { margin-top: 10px; height: 46px; border-radius: 10px; position: relative; overflow: hidden;\n  background: linear-gradient(150deg, rgba(255,255,255,.14), rgba(255,255,255,.04)); border: 1px solid rgba(255,255,255,.2); }\n.pk-prev .pp-b { position: absolute; border-radius: 5px; height: 7px; background: rgba(255,255,255,.55); }\n.pk-prev .pp-d { position: absolute; bottom: 4px; right: 4px; left: 4px; height: 9px; border-radius: 5px;\n  background: linear-gradient(90deg, var(--acc), var(--acc2)); opacity: .85; }\n\n/* ─── وویس‌ها ─── */\n.voice-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; }\n.v-chip { padding: 11px 6px; border-radius: 14px; text-align: center; font-size: 12.5px; direction: ltr;\n  background: rgba(255,255,255,.07); border: 1.5px solid rgba(255,255,255,.14); color: var(--muted);\n  transition: all .35s var(--spring); animation: itemIn .45s var(--ease) both; animation-delay: calc(var(--i,0) * 35ms); }\n.v-chip:hover { transform: translateY(-3px); color: var(--txt); }\n.v-chip.on { background: linear-gradient(140deg, rgba(var(--acc-rgb),.4), rgba(var(--acc2-rgb),.22));\n  border-color: var(--acc); color: #fff; font-weight: 700; box-shadow: 0 8px 22px rgba(var(--acc-rgb),.4), inset 0 1px 0 rgba(255,255,255,.5);\n  transform: translateY(-2px); }\n.eq { display: flex; align-items: flex-end; gap: 3px; height: 30px; direction: ltr; }\n.eq i { width: 5px; border-radius: 4px; background: linear-gradient(180deg, var(--acc), var(--acc2)); height: 30%;\n  animation: eqB .9s ease-in-out infinite alternate; box-shadow: 0 0 8px rgba(var(--acc-rgb),.7); }\n.eq i:nth-child(2) { animation-delay: .15s; } .eq i:nth-child(3) { animation-delay: .3s; }\n.eq i:nth-child(4) { animation-delay: .45s; } .eq i:nth-child(5) { animation-delay: .6s; }\n.eq i:nth-child(6) { animation-delay: .22s; } .eq i:nth-child(7) { animation-delay: .38s; }\n@keyframes eqB { from { height: 16%; } to { height: 95%; } }\n\n/* ─── آمار ─── */\n.stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }\n.stat { border-radius: 20px; padding: 16px; text-align: center; position: relative; overflow: hidden;\n  background: var(--glass); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.14);\n  box-shadow: var(--specular), 0 12px 28px rgba(0,0,0,.3); animation: itemIn .55s var(--ease) both; animation-delay: calc(var(--i,0) * 70ms); }\n.stat .sv { font-size: 30px; font-weight: 800; direction: ltr; text-shadow: 0 2px 20px rgba(var(--acc-rgb),.55); font-variant-numeric: tabular-nums; }\n.stat .sl { font-size: 12px; color: var(--muted); margin-top: 2px; }\n.stat .sic { font-size: 19px; position: absolute; top: 11px; left: 13px; opacity: .75; }\n.bar-line { height: 9px; border-radius: 99px; background: rgba(255,255,255,.10); overflow: hidden; margin-top: 12px; direction: ltr; }\n.bar-line i { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--acc), var(--acc2));\n  box-shadow: 0 0 12px rgba(var(--acc-rgb),.8); animation: barGrow 1.2s var(--ease) both; transform-origin: right; }\n@keyframes barGrow { from { transform: scaleX(0); } }\n\n/* ─── شیت، بک‌دراپ، تست ─── */\n.backdrop { position: fixed; inset: 0; z-index: 60; background: rgba(2,7,14,.6); backdrop-filter: blur(7px);\n  -webkit-backdrop-filter: blur(7px); opacity: 0; transition: opacity .4s ease; }\n.backdrop.on { opacity: 1; }\n.sheet { position: fixed; right: 0; left: 0; bottom: 0; z-index: 61; max-height: 86vh; display: flex; flex-direction: column;\n  border-radius: 30px 30px 0 0; border-bottom: none; transform: translateY(105%);\n  transition: transform .5s var(--ease); padding-bottom: var(--ib); }\n.sheet.on { transform: translateY(0); }\n.sh-grab { width: 44px; height: 5px; border-radius: 99px; background: rgba(255,255,255,.35); margin: 11px auto 3px; flex: none;\n  animation: popIn .5s var(--ease) .15s both; }\n.sh-head { display: flex; align-items: center; justify-content: space-between; padding: 8px 20px 12px; flex: none;\n  border-bottom: 1px solid rgba(255,255,255,.10); }\n.sh-head h3 { font-size: 17px; font-weight: 800; }\n.sh-body { overflow-y: auto; overscroll-behavior: contain; padding: 16px 18px 26px; }\n.sh-body .list { gap: 9px; }\n\n.overlay { position: fixed; inset: 0; z-index: 80; display: flex; align-items: center; justify-content: center; padding: 24px;\n  background: radial-gradient(90% 70% at 50% 25%, rgba(var(--bl1),.20), transparent), rgba(3,8,16,.82);\n  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }\n.card { width: 100%; max-width: 400px; padding: 32px 26px 26px; border-radius: 30px; text-align: center;\n  animation: rise .75s var(--ease) both; }\n@keyframes rise { from { opacity: 0; transform: translateY(50px) scale(.93); filter: blur(9px); } }\n.card h1 { font-size: 24px; font-weight: 800; }\n.card h1 span { color: var(--acc); text-shadow: 0 0 22px rgba(var(--acc-rgb),.7); }\n.card .sub { color: var(--muted); font-size: 12.5px; margin: 7px 0 20px; direction: ltr; }\n.field { text-align: right; margin-bottom: 14px; }\n.field label { display: block; font-size: 12px; color: var(--muted); margin: 0 6px 7px; }\n.field input { width: 100%; padding: 14px 16px; border-radius: 16px; border: 1px solid rgba(255,255,255,.16);\n  background: rgba(3,12,24,.6); color: var(--txt); font-size: 15.5px; outline: none; font-family: inherit;\n  transition: border-color .3s, box-shadow .3s; }\n.field input:focus { border-color: rgba(var(--acc-rgb),.75); box-shadow: 0 0 0 4px rgba(var(--acc-rgb),.16); }\n.go { width: 100%; padding: 15px; border-radius: 16px; font-size: 16px; font-weight: 800; color: #04121F; position: relative; overflow: hidden;\n  background: linear-gradient(120deg, var(--acc), var(--acc2)); box-shadow: 0 14px 34px rgba(var(--acc-rgb),.45), inset 0 1.5px 0 rgba(255,255,255,.7);\n  transition: transform .3s var(--spring); }\n.go:hover { transform: translateY(-2px); }\n.go::after { content: \"\"; position: absolute; top: 0; bottom: 0; width: 46%;\n  background: linear-gradient(100deg, transparent, rgba(255,255,255,.75), transparent); transform: translateX(-260%) skewX(-18deg);\n  animation: sheen 3s ease-in-out infinite; }\n@keyframes sheen { 45%, 100% { transform: translateX(360%) skewX(-18deg); } }\n.status { min-height: 22px; margin-top: 13px; font-size: 13.5px; }\n.status.err { color: var(--danger); animation: shake .45s; }\n.status.ok { color: var(--acc2); }\n@keyframes shake { 20% { transform: translateX(-7px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(3px); } }\n\n#toasts { position: fixed; top: calc(var(--it) + 16px); left: 0; right: 0; z-index: 95; display: flex; flex-direction: column; align-items: center; gap: 9px; pointer-events: none; }\n.toast { max-width: 88%; padding: 10px 22px; border-radius: 99px; font-size: 13.5px; text-align: center;\n  background: rgba(5,14,26,.85); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,.2);\n  box-shadow: 0 14px 40px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.35);\n  animation: toastIn .5s var(--spring) both; }\n.toast.out { animation: toastOut .4s ease both; }\n.toast.ok { border-color: rgba(var(--acc2-rgb),.65); box-shadow: 0 14px 40px rgba(0,0,0,.5), 0 0 24px rgba(var(--acc2-rgb),.3); }\n.toast.err { border-color: rgba(248,113,113,.7); color: #FFD9DB; box-shadow: 0 14px 40px rgba(0,0,0,.5), 0 0 24px rgba(248,113,113,.35); }\n@keyframes toastIn { from { opacity: 0; transform: translateY(-26px) scale(.85); filter: blur(6px); } }\n@keyframes toastOut { to { opacity: 0; transform: translateY(-20px) scale(.92); filter: blur(5px); } }\n\n.skeleton { border-radius: 14px; background: linear-gradient(100deg, rgba(255,255,255,.06) 40%, rgba(255,255,255,.16) 50%, rgba(255,255,255,.06) 60%);\n  background-size: 220% 100%; animation: sk 1.3s linear infinite; }\n@keyframes sk { to { background-position: -220% 0; } }\n\n/* ─── چیدمان غوطه‌ور ─── */\nhtml[data-layout=\"immersive\"] #topbar { background: linear-gradient(180deg, rgba(3,10,20,.75), transparent);\n  border-bottom: none; box-shadow: none; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);\n  position: absolute; top: 0; right: 0; left: 0; }\nhtml[data-layout=\"immersive\"] #stage { padding-top: 0; }\nhtml[data-layout=\"immersive\"] .msgs { padding-top: calc(var(--top-h) + var(--it) + 14px); }\nhtml[data-layout=\"immersive\"] { --msg-max: 92%; }\nhtml[data-layout=\"immersive\"] .bubble.assistant { background: rgba(6,14,26,.55); }\nhtml[data-layout=\"immersive\"] #dock { position: absolute; bottom: calc(96px + var(--ib)); right: 0; left: 0;\n  background: none; border: none; box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none;\n  padding: 0 16px; animation: none; pointer-events: none; }\nhtml[data-layout=\"immersive\"] .dock-item { flex: none; pointer-events: auto; width: 54px; height: 54px; padding: 0;\n  justify-content: center; background: rgba(5,14,26,.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);\n  border: 1px solid rgba(255,255,255,.18); border-radius: 50%; box-shadow: 0 12px 30px rgba(0,0,0,.5), inset 0 1.5px 0 rgba(255,255,255,.4); }\nhtml[data-layout=\"immersive\"] .dock-item .di-lb { display: none; }\nhtml[data-layout=\"immersive\"] .dock-item::before { inset: 0; border-radius: 50%; }\nhtml[data-layout=\"immersive\"] .dock-item.on { transform: scale(1.14); }\nhtml[data-layout=\"immersive\"] .composer { border-radius: 34px; background: rgba(5,14,26,.6); }\nhtml[data-layout=\"immersive\"] .scr-head, html[data-layout=\"immersive\"] .scr-body { padding-right: 22px; padding-left: 22px; }\nhtml[data-layout=\"immersive\"] .scr-body { padding-top: calc(var(--top-h) + var(--it) + 8px); }\nhtml[data-layout=\"immersive\"] .b-card { border-radius: 30px; }\n\n/* ─── چیدمان bento: خانه اول است ─── */\nhtml[data-layout=\"bento\"] .dock-item[data-tab=\"chat\"] .di-lb::after { content: \"\"; }\n@media (min-width: 560px) {\n  .bento { grid-template-columns: repeat(4, 1fr); }\n  .b-card.hero { grid-column: span 2; }\n  .b-card.span2 { grid-column: span 2; }\n}\n@media (min-width: 900px) {\n  .bento { grid-template-columns: repeat(6, 1fr); max-width: 980px; margin: 0 auto; }\n  .b-card.hero { grid-column: span 3; grid-row: span 2; }\n  .b-card.span2 { grid-column: span 3; }\n  .scr-body { max-width: 980px; width: 100%; margin: 0 auto; }\n  .msgs { max-width: 900px; width: 100%; margin: 0 auto; }\n  .composer-holder { max-width: 940px; width: 100%; margin: 0 auto; }\n  .sheet { right: 50%; left: auto; width: 560px; transform: translate(50%, 105%); border-radius: 30px 30px 0 0; }\n  .sheet.on { transform: translate(50%, 0); }\n}\n@media (max-width: 360px) {\n  .voice-grid { grid-template-columns: repeat(2, 1fr); }\n}\n\n/* ─── احترام به کاهش حرکت ─── */\n@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after { animation-duration: .01s !important; animation-iteration-count: 1 !important; transition-duration: .06s !important; }\n}\n\n/* ═══════════ ویجت‌ها 🧩 برد شیشه‌ای ═══════════ */\n.wg-maker { margin-bottom: 14px; }\n.wg-ex { padding-bottom: 0 !important; padding-top: 9px; flex-wrap: wrap; overflow: visible !important; }\n.wg-ex button { flex: none; font-size: 12px; white-space: nowrap; }\n\n.wg-board {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  grid-auto-rows: 134px;\n  gap: 12px;\n  padding-bottom: 14px;\n}\n.wg-card {\n  position: relative;\n  grid-column: span 2;\n  border-radius: 24px;\n  padding: 14px 15px;\n  overflow: hidden;\n  background: var(--glass);\n  backdrop-filter: blur(24px) saturate(175%);\n  -webkit-backdrop-filter: blur(24px) saturate(175%);\n  border: 1px solid rgba(255,255,255,.15);\n  box-shadow: var(--specular, inset 0 1px 0 rgba(255,255,255,.28)), 0 16px 36px rgba(0,0,0,.36);\n  display: flex;\n  flex-direction: column;\n  container-type: inline-size;\n  --wg: #38BDF8; --wg-rgb: 56,189,248;\n  transform: translateY(0) scale(1);\n  transition: transform .4s var(--spring), box-shadow .4s, border-color .4s;\n}\n.wg-card.wg-new { animation: wgIn .65s var(--ease) both; animation-delay: calc(var(--i, 0) * 60ms); }\n@keyframes wgIn {\n  from { opacity: 0; transform: scale(.9) translateY(18px); filter: blur(16px); }\n  to { opacity: 1; transform: none; filter: blur(0); }\n}\n.wg-card:hover {\n  transform: translateY(-4px);\n  box-shadow: var(--specular, inset 0 1px 0 rgba(255,255,255,.28)), 0 26px 54px rgba(0,0,0,.5), 0 0 34px rgba(var(--wg-rgb),.22);\n  border-color: rgba(var(--wg-rgb),.55);\n}\n.wg-card::before {\n  content: \"\";\n  position: absolute; inset: 0;\n  background: radial-gradient(130% 95% at 100% 0%, rgba(var(--wg-rgb),.20), transparent 62%);\n  pointer-events: none;\n}\n.wg-ac-blue { --wg: #38BDF8; --wg-rgb: 56,189,248; }\n.wg-ac-green { --wg: #34D399; --wg-rgb: 52,211,153; }\n.wg-ac-red { --wg: #F87171; --wg-rgb: 248,113,113; }\n\n.wg-1x1 { grid-column: span 2; grid-row: span 1; }\n.wg-2x1 { grid-column: span 4; grid-row: span 1; }\n.wg-1x2 { grid-column: span 2; grid-row: span 2; }\n.wg-2x2 { grid-column: span 4; grid-row: span 2; }\n\n.wg-in { position: relative; z-index: 1; display: flex; flex-direction: column; flex: 1; min-height: 0; }\n.wg-edit {\n  position: absolute; top: 9px; left: 10px; z-index: 3;\n  width: 30px; height: 30px; border-radius: 10px;\n  background: rgba(3,10,20,.55);\n  border: 1px solid rgba(255,255,255,.2);\n  color: var(--muted); font-size: 13px;\n  display: grid; place-items: center;\n  opacity: .65;\n  transition: all .3s var(--spring);\n}\n.wg-edit:hover, .wg-edit:active { opacity: 1; color: var(--wg); border-color: rgba(var(--wg-rgb),.75); transform: scale(1.12); }\n\n.wg-h { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 5px; }\n.wg-t {\n  font-size: 11.5px; font-weight: 700; color: var(--muted); letter-spacing: .2px;\n  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;\n}\n.wg-flag {\n  flex: none; font-size: 10.5px; font-weight: 700; color: var(--wg);\n  background: rgba(var(--wg-rgb),.14); border: 1px solid rgba(var(--wg-rgb),.45);\n  padding: 1px 9px; border-radius: 99px; font-variant-numeric: tabular-nums;\n  white-space: nowrap;\n}\n.wg-cd {\n  font-size: 15.5px; font-weight: 800; color: var(--txt); line-height: 1.6;\n  text-shadow: 0 2px 16px rgba(var(--wg-rgb),.55);\n}\n.wg-cd.ltr { direction: ltr; unicode-bidi: embed; letter-spacing: .5px; }\n.wg-sub {\n  font-size: 12px; color: var(--muted); line-height: 1.95; margin-top: 3px;\n  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;\n}\n.wg-big {\n  font-size: clamp(26px, 20cqi, 46px);\n  font-weight: 800; line-height: 1.15; letter-spacing: -.5px;\n  background: linear-gradient(140deg, var(--txt) 30%, var(--wg));\n  -webkit-background-clip: text; background-clip: text; color: transparent;\n  font-variant-numeric: tabular-nums;\n  margin-top: auto;\n}\n.wg-big .wg-unit { font-size: .42em; font-weight: 700; }\n.wg-secs { font-size: .55em; opacity: .75; }\n.wg-foot {\n  display: flex; align-items: center; justify-content: space-between; gap: 9px;\n  margin-top: auto; padding-top: 7px; min-height: 40px;\n}\n.wg-ring { width: 40px; height: 40px; flex: none; transform: rotate(-90deg); }\n.wr-bg { fill: none; stroke: rgba(255,255,255,.14); stroke-width: 3.4; }\n.wr-fg {\n  fill: none; stroke: var(--wg); stroke-width: 3.4; stroke-linecap: round;\n  filter: drop-shadow(0 0 5px rgba(var(--wg-rgb),.9));\n  transition: stroke-dashoffset .9s linear;\n}\n.wg-note {\n  flex: 1; margin-top: auto; font-size: clamp(13.5px, 11cqi, 17px); font-weight: 600;\n  line-height: 2; color: var(--txt); padding-right: 11px;\n  border-right: 3px solid rgba(var(--wg-rgb),.7);\n  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical;\n}\n.wg-list { flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column; gap: 4px; margin-top: 2px; }\n.wg-li {\n  display: flex; align-items: center; gap: 8px;\n  font-size: clamp(12.5px, 9.5cqi, 15px); font-weight: 600; line-height: 1.7;\n  cursor: pointer; padding: 3px 4px; border-radius: 10px;\n  transition: background .25s;\n}\n.wg-li:active { background: rgba(255,255,255,.07); }\n.wg-li i {\n  flex: none; width: 18px; height: 18px; border-radius: 6px;\n  border: 1.6px solid rgba(var(--wg-rgb),.6); color: var(--wg);\n  display: grid; place-items: center; font-style: normal; font-size: 11px; font-weight: 800;\n  transition: all .25s var(--spring);\n}\n.wg-li.on { opacity: .55; }\n.wg-li.on span { text-decoration: line-through; }\n.wg-li.on i { background: rgba(var(--wg-rgb),.3); }\n\n.wg-wx { display: flex; align-items: center; gap: 10px; margin-top: auto; }\n.wg-wx-emo {\n  font-size: clamp(26px, 22cqi, 44px); line-height: 1;\n  animation: wgFloat 3.6s ease-in-out infinite;\n  filter: drop-shadow(0 4px 12px rgba(var(--wg-rgb),.5));\n}\n@keyframes wgFloat {\n  0%, 100% { transform: translateY(0) rotate(-3deg); }\n  50% { transform: translateY(-6px) rotate(4deg); }\n}\n.wg-temp { margin-top: 0; }\n.wg-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 7px; }\n.wg-chip {\n  font-size: 10.5px; font-weight: 700; color: var(--txt);\n  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15);\n  border-radius: 99px; padding: 2px 9px; font-variant-numeric: tabular-nums;\n}\n.wg-bar {\n  height: 7px; border-radius: 99px; background: rgba(255,255,255,.1);\n  overflow: hidden; margin-top: 9px;\n}\n.wg-bar i {\n  display: block; height: 100%; border-radius: 99px;\n  background: linear-gradient(90deg, rgba(var(--wg-rgb),.7), var(--wg));\n  box-shadow: 0 0 10px rgba(var(--wg-rgb),.8);\n  transition: width .8s var(--ease);\n}\n\n/* حالت‌های یادآور */\n.wg-card.st-due {\n  border-color: rgba(var(--wg-rgb),.85);\n  box-shadow: var(--specular, inset 0 1px 0 rgba(255,255,255,.28)), 0 18px 42px rgba(0,0,0,.45), 0 0 40px rgba(var(--wg-rgb),.45);\n  animation: wgPulse 1.6s ease-in-out infinite;\n}\n@keyframes wgPulse {\n  0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.025); }\n}\n.wg-card.st-due .wg-flag { background: rgba(var(--wg-rgb),.3); color: var(--txt); }\n.wg-card.st-done { opacity: .68; filter: saturate(.6); }\n\n/* اسکلتون ساخت */\n.wg-skel {\n  grid-column: span 2;\n  background: rgba(6,16,30,.5);\n  animation: wgIn .5s var(--ease) both;\n  display: flex; align-items: center; justify-content: center;\n}\n.wg-skel-in {\n  display: flex; align-items: center; gap: 9px;\n  color: var(--muted); font-size: 13px; font-weight: 700;\n}\n.wg-skel-in .spin {\n  display: inline-block; animation: wgSpin 1.1s linear infinite; font-size: 17px;\n}\n@keyframes wgSpin { to { transform: rotate(360deg); } }\n.wg-skelbar, .skeleton {\n  height: 26px; width: 70px; border-radius: 10px; margin-top: auto;\n  background: linear-gradient(100deg, rgba(255,255,255,.07) 40%, rgba(255,255,255,.22) 50%, rgba(255,255,255,.07) 60%);\n  background-size: 200% 100%;\n  animation: wgShimmer 1.3s linear infinite;\n}\n@keyframes wgShimmer { to { background-position: -200% 0; } }\n\n/* حالت خالی */\n.wg-empty {\n  grid-column: 1 / -1;\n  grid-row: span 2;\n  display: flex; flex-direction: column; align-items: center; justify-content: center;\n  gap: 6px; text-align: center; padding: 26px 18px;\n  border-radius: 24px;\n  animation: wgIn .6s var(--ease) both;\n}\n.wg-empty .em-ic { font-size: 40px; animation: wgFloat 3.5s ease-in-out infinite; }\n.wg-empty .em-t { font-size: 16.5px; font-weight: 800; }\n.wg-empty .em-s { font-size: 12.5px; color: var(--muted); line-height: 2.2; }\n.wg-empty .em-s b { color: var(--acc); font-weight: 700; }\n\n/* چیپ‌های شیت ویرایش */\n.sec { margin-bottom: 13px; }\n.sec-t { font-size: 12.5px; font-weight: 700; color: var(--muted); margin-bottom: 7px; }\n.wg-pick { display: flex; gap: 7px; flex-wrap: wrap; }\n.wg-pk {\n  font-size: 12.5px; font-weight: 700; color: var(--muted);\n  background: rgba(3,12,24,.55); border: 1px solid rgba(255,255,255,.16);\n  border-radius: 13px; padding: 8px 14px;\n  transition: all .28s var(--spring);\n}\n.wg-pk.on {\n  color: var(--acc); border-color: rgba(var(--acc-rgb),.75);\n  background: rgba(var(--acc-rgb),.16);\n  box-shadow: 0 0 16px rgba(var(--acc-rgb),.3);\n}\ninput[type=\"datetime-local\"] { color-scheme: dark; }\n\n/* ریسپانسیو به ابعاد کانتینر و صفحه */\n@container (max-width: 190px) {\n  .wg-chip.extra { display: none; }\n  .wg-sub { -webkit-line-clamp: 1; }\n  .wg-flag { font-size: 9.5px; padding: 1px 7px; }\n}\n@container (min-width: 340px) {\n  .wg-big { font-size: clamp(30px, 13cqi, 54px); }\n  .wg-sub { -webkit-line-clamp: 3; }\n}\n@media (min-width: 640px) {\n  .wg-board { max-width: 680px; margin: 0 auto; grid-auto-rows: 150px; }\n}\n@media (min-width: 900px) {\n  .wg-board { max-width: 980px; }\n}\n\n/* ═══════════ دوزبانگی: LTR/RTL ═══════════\n   پیش‌فرض فارسی (RTL). در حالت انگلیسی (html[data-locale=\"en\"]) جهت\n   و فاصله‌های جهت‌دار برعکس می‌شوند؛ متن‌ها چپ‌چینِ طبیعی. */\nhtml[data-locale=\"en\"] { direction: ltr; }\nhtml[data-locale=\"en\"] body { font-family: -apple-system, 'Segoe UI', Roboto, 'Inter', system-ui, sans-serif; }\nhtml[data-locale=\"en\"] .row,\nhtml[data-locale=\"en\"] .lb,\nhtml[data-locale=\"en\"] .sh-head,\nhtml[data-locale=\"en\"] .hdr { direction: ltr; }\nhtml[data-locale=\"en\"] code,\nhtml[data-locale=\"en\"] .md code { direction: ltr; unicode-bidi: embed; }\nhtml[data-locale=\"en\"] .msg.user { direction: ltr; text-align: left; }\nhtml[data-locale=\"en\"] .msg.bot { direction: ltr; text-align: left; }\nhtml[data-locale=\"fa\"] .msg.user,\nhtml[data-locale=\"fa\"] .msg.bot { text-align: right; }\n/* فونت لاتین در انگلیسی سبک‌تر می‌شود */\nhtml[data-locale=\"en\"] .t1,\nhtml[data-locale=\"en\"] .t2 { letter-spacing: .1px; }\n"},"index.html":{"t":"text/html; charset=utf-8","b":"<!DOCTYPE html>\n<html lang=\"fa\" dir=\"rtl\" data-theme=\"abyss\" data-layout=\"classic\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n<meta name=\"theme-color\" content=\"#050B14\">\n<title>Behrad AI</title>\n<link rel=\"icon\" href=\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='42' fill='%23061019' stroke='%2338BDF8' stroke-width='7'/><path d='M50 26 C55 44 58 47 76 50 C58 53 55 56 50 74 C45 56 42 53 24 50 C42 47 45 44 50 26 Z' fill='%23EAF7FF'/></svg>\">\n<link rel=\"stylesheet\" href=\"./app.css\">\n</head>\n<body>\n\n<!-- ═══ پس‌زمینه زنده: سه لکه آبی/سبز/قرمز + دانه‌بندی ═══ -->\n<div class=\"bg\" aria-hidden=\"true\">\n  <div class=\"blob b1\"></div>\n  <div class=\"blob b2\"></div>\n  <div class=\"blob b3\"></div>\n  <div class=\"aura\"></div>\n  <div class=\"grain\"></div>\n</div>\n\n<!-- ═══ اسپلش ورود ═══ -->\n<div id=\"splash\">\n  <div class=\"sp-logo\"><div class=\"ring\"></div><div class=\"star\">✨</div></div>\n  <div class=\"sp-name\"><span>B</span><span>e</span><span>h</span><span>r</span><span>a</span><span>d</span><span class=\"sp-ai\">&nbsp;AI</span></div>\n  <div class=\"sp-line\"><i></i></div>\n</div>\n\n<!-- ═══ اپ ═══ -->\n<div id=\"app\" hidden>\n\n  <header id=\"topbar\">\n    <button class=\"tb-btn\" id=\"backBtn\" aria-label=\"بازگشت\" hidden>→</button>\n    <div class=\"tb-brand\" id=\"tbBrand\">\n      <div class=\"tb-logo\"></div>\n      <div class=\"tb-titles\">\n        <div class=\"tb-title\" id=\"tbTitle\">Behrad AI</div>\n        <button class=\"tb-chip\" id=\"modelChip\"><span class=\"dot\"></span><span id=\"modelChipText\">مدل</span></button>\n      </div>\n    </div>\n    <div class=\"tb-title scr-title\" id=\"scrTitle\" hidden></div>\n    <div class=\"tb-actions\">\n      <button class=\"tb-btn glow\" id=\"themeBtn\" aria-label=\"تم\">◑</button>\n      <button class=\"tb-btn\" id=\"statsBtn\" aria-label=\"آمار\">📊</button>\n    </div>\n  </header>\n\n  <main id=\"stage\">\n\n    <!-- چت -->\n    <section class=\"screen on\" data-screen=\"chat\">\n      <div class=\"msgs\" id=\"msgs\"></div>\n      <div class=\"composer-holder\">\n        <div class=\"quick\" id=\"quick\" hidden></div>\n        <div class=\"composer glass\" id=\"composer\">\n          <div class=\"c-row\" id=\"cRow\">\n            <button class=\"c-btn\" id=\"attachBtn\" title=\"عکس یا فایل\">＋</button>\n            <div class=\"c-input\">\n              <div class=\"c-chips\" id=\"attachChips\" hidden></div>\n              <textarea id=\"input\" rows=\"1\" placeholder=\"پیام بفرست ...\" enterkeyhint=\"send\"></textarea>\n            </div>\n            <button class=\"c-btn mic\" id=\"micBtn\" title=\"ویس بگیر\">🎙</button>\n            <button class=\"c-btn send\" id=\"sendBtn\" title=\"ارسال\">➤</button>\n          </div>\n          <div class=\"c-rec\" id=\"cRec\" hidden>\n            <button class=\"c-btn stop\" id=\"recCancel\" title=\"لغو\">✕</button>\n            <div class=\"rec-wave\" id=\"recWave\"></div>\n            <div class=\"rec-time\" id=\"recTime\">0:00</div>\n            <div class=\"rec-dot\"></div>\n          </div>\n          <input type=\"file\" id=\"fileImg\" accept=\"image/*\" hidden>\n          <input type=\"file\" id=\"fileTxt\" accept=\".txt,.md,.json,.csv,.js,.py,.html,.css,.xml,.yml,.yaml,.log,.ini,.conf\" hidden>\n        </div>\n      </div>\n    </section>\n\n    <!-- ویجت‌های هوشمند -->\n    <section class=\"screen\" data-screen=\"widgets\">\n      <div class=\"scr-head\">\n        <h2>ویجت‌ها 🧩 <span class=\"count\" id=\"wgCount\">—</span></h2>\n        <button class=\"mini-btn\" id=\"wgRefresh\" aria-label=\"تازه‌سازی\">🔄</button>\n      </div>\n      <div class=\"scr-body\">\n        <div class=\"glass form-card wg-maker\">\n          <div class=\"f-row\">\n            <input id=\"wgInput\" placeholder=\"چی بسازم؟ «فردا ساعت ۹ قرص بخورم» یا «آب‌وهوا نشون بده»\" dir=\"auto\" enterkeyhint=\"go\">\n            <button class=\"btn acc sm\" id=\"wgMake\">✨ بساز</button>\n          </div>\n          <div class=\"quick wg-ex\" id=\"wgEx\">\n            <button data-ex=\"فردا ساعت 9 بهم یادآوری کن قرص بخورم\">⏰ یادآور فردا ۹</button>\n            <button data-ex=\"آب و هوا رو نشون بده\">🌤 آب‌وهوا</button>\n            <button data-ex=\"ساعت و تقویم امروز\">🕒 ساعت و تقویم</button>\n            <button data-ex=\"لیست خرید هفته\">📝 لیست</button>\n          </div>\n        </div>\n        <div class=\"wg-board\" id=\"wgBoard\"></div>\n      </div>\n    </section>\n\n    <!-- گفتگوها -->\n    <section class=\"screen\" data-screen=\"threads\">\n      <div class=\"scr-head\">\n        <h2>گفتگوها <span class=\"count\" id=\"thCount\"></span></h2>\n        <button class=\"btn acc sm\" id=\"thNew\">＋ گفتگوی تازه</button>\n      </div>\n      <div class=\"scr-body\"><div class=\"list\" id=\"thList\"></div></div>\n    </section>\n\n    <!-- یادآورها -->\n    <section class=\"screen\" data-screen=\"reminders\">\n      <div class=\"scr-head\"><h2>یادآورها ⏰</h2></div>\n      <div class=\"scr-body\">\n        <div class=\"glass form-card\">\n          <div class=\"f-row\">\n            <input id=\"rmInput\" placeholder=\"مثلاً: روزانه 08:00 ورزش\" dir=\"auto\">\n            <button class=\"btn acc sm\" id=\"rmAdd\">افزودن</button>\n          </div>\n          <div class=\"f-hint\">فرمت: <code>18:30 چای</code> · <code>روزانه 08:00 ورزش</code> · <code>45m استراحت</code></div>\n        </div>\n        <div class=\"list\" id=\"rmList\"></div>\n      </div>\n    </section>\n\n    <!-- حافظه -->\n    <section class=\"screen\" data-screen=\"memory\">\n      <div class=\"scr-head\">\n        <h2>حافظه بلندمدت 🧠 <span class=\"count\" id=\"memCount\"></span></h2>\n        <button class=\"btn danger-ghost sm\" id=\"memClear\">پاک همه</button>\n      </div>\n      <div class=\"scr-body\">\n        <div class=\"glass form-card\">\n          <div class=\"f-row\">\n            <input id=\"memInput\" placeholder=\"خاطره‌ای بسپار ... مثلاً: پروژه ربات با پایتون\">\n            <button class=\"btn acc sm\" id=\"memAdd\">افزودن</button>\n          </div>\n        </div>\n        <div class=\"list\" id=\"memList\"></div>\n      </div>\n    </section>\n\n    <!-- استودیو صدا -->\n    <section class=\"screen\" data-screen=\"voice\">\n      <div class=\"scr-head\"><h2>استودیو صدا 🎙</h2></div>\n      <div class=\"scr-body\" id=\"voiceBody\"></div>\n    </section>\n\n    <!-- تنظیمات -->\n    <section class=\"screen\" data-screen=\"settings\">\n      <div class=\"scr-head\"><h2>تنظیمات ⚙️</h2></div>\n      <div class=\"scr-body\" id=\"setBody\"></div>\n    </section>\n\n    <!-- آمار -->\n    <section class=\"screen\" data-screen=\"stats\">\n      <div class=\"scr-head\"><h2>آمار و مصرف 📊</h2></div>\n      <div class=\"scr-body\" id=\"statsBody\"></div>\n    </section>\n\n    <!-- خانه (bento) -->\n    <section class=\"screen\" data-screen=\"home\">\n      <div class=\"scr-body\"><div class=\"bento\" id=\"bento\"></div></div>\n    </section>\n\n  </main>\n\n  <nav id=\"dock\"></nav>\n</div>\n\n<!-- ═══ شیت‌ها / مودال‌ها ═══ -->\n<div class=\"backdrop\" id=\"backdrop\" hidden></div>\n<div class=\"sheet glass\" id=\"sheet\" hidden>\n  <div class=\"sh-grab\"></div>\n  <div class=\"sh-head\"><h3 id=\"shTitle\"></h3><button class=\"tb-btn\" id=\"shClose\">✕</button></div>\n  <div class=\"sh-body\" id=\"shBody\"></div>\n</div>\n\n<!-- ═══ ورود ═══ -->\n<div class=\"overlay\" id=\"login\" hidden>\n  <div class=\"card glass\">\n    <div class=\"sp-logo sm\"><div class=\"ring\"></div><div class=\"star\">✨</div></div>\n    <h1>Behrad <span>AI</span></h1>\n    <p class=\"sub\" id=\"loginOrigin\"></p>\n    <div class=\"field\"><label>رمز ورود</label><input id=\"loginPw\" type=\"password\" placeholder=\"DASHBOARD_PASSWORD\" autocomplete=\"current-password\"></div>\n    <button class=\"go\" id=\"loginGo\">ورود ✈️</button>\n    <div class=\"status\" id=\"loginSt\"></div>\n    <button class=\"linkish\" id=\"loginSwitch\">آدرس ورکر عوض شده؟ تغییر بده</button>\n  </div>\n</div>\n\n<div id=\"toasts\"></div>\n\n<script src=\"./app-i18n.js\"></script>\n<script src=\"./mock.js\"></script>\n<script src=\"./app-core.js\"></script>\n<script src=\"./app-screens.js\"></script>\n</body>\n</html>\n"},"mock.js":{"t":"text/javascript; charset=utf-8","b":"/* ═══════════════════════════════════════════════════════════════\n   mock.js — پیش‌نمایش محلی بدون ورکر (فقط روی localhost)\n   در محیط واقعی Worker مسیر /app/mock.js را خالی سرو می‌کند.\n   ═══════════════════════════════════════════════════════════════ */\n(function () {\n  const on = location.hostname === 'localhost' || location.hostname === '127.0.0.1' ||\n    location.search.indexOf('mock=1') >= 0;\n  if (!on) return;\n\n  const DB = {\n    threads: [\n      { id: 'main', name: W(\"اصلی\"), ts: Date.now() - 86400000 * 2 },\n      { id: 'tq8x1', name: W(\"پروژه ربات\"), ts: Date.now() - 3600000 * 5 },\n      { id: 'tp9z2', name: W(\"ایده‌های نوشتن\"), ts: Date.now() - 3600000 * 30 },\n    ],\n    hist: {\n      main: [\n        { role: 'user', content: W(\"سلام! کیستی؟\") },\n        { role: 'assistant', content: W(\"سلام بهراد جان! 👋 من دستیار شیشه‌ای تو هستم — همان مغز ورکر Cloudflare، فقط با ظاهر تازه.\\n\\n**بله:**\\n- حافظه بلندمدت 🧠\\n- سرچ وب با `/web`\\n- ویس دوطرفه 🎙\\n\\n```js\\nconsole.log(\\\"Liquid Glass ✨\\\");\\n```\\n\\nبپرس تا جواب بدهم.\") },\n        { role: 'user', content: W(\"هوای نیشابور چطوره؟\") },\n        { role: 'assistant', content: W(\"🌤 **هوای نیشابور**\\n\\n- دما: ۲۴ درجه، نیمه‌ابری\\n- باد: ۱۱ کیلومتر بر ساعت\\n- رطوبت: ۳۸٪\\n\\n> برای پیش‌بینی ۲ روز آینده همین‌جا بپرس.\") },\n      ],\n      tq8x1: [\n        { role: 'user', content: W(\"یادآور روزانه ۸ صبح ورزش بذار\") },\n        { role: 'assistant', content: W(\"⏰ ثبت شد: **روزانه 08:00 ورزش** 🔁\\n\\nهر صبح ساعت ۸ به وقت تهران یادت می‌اندازم.\") },\n      ],\n      tp9z2: [],\n    },\n    mem: [\n      { id: 101, t: W(\"اسم من بهراد است و پروژه اصلی‌ام ربات تلگرام AI است.\"), ts: Date.now() },\n      { id: 102, t: W(\"پروژه فعلی: اپ اندروید شیشه‌ای متصل به ورکر.\"), ts: Date.now() },\n      { id: 103, t: W(\"زبان ترجیحی همیشه فارسی، جواب کوتاه و بی‌حاشیه.\"), ts: Date.now() },\n    ],\n    rm: [\n      { key: 'rm:a1', at: Date.now() + 3600000 * 3, txt: W(\"چای دم کن\"), repeat: null },\n      { key: 'rm:a2', at: nextAt(8), txt: W(\"ورزش\"), repeat: 'daily' },\n      { key: 'rm:a3', at: Date.now() + 45 * 60000, txt: W(\"استراحت کن\"), repeat: null },\n    ],\n    settings: {\n      model: 'mock-cf-1',\n      temperature: 0.8, maxTokens: 2048, dailyLimit: 0,\n      autoFallback: true, liveStream: true, readLinks: true, autoVision: true,\n      searchAuto: false, briefing: false, voiceReply: false,\n      voiceProv: 'google', ttsModel: 'gemini-2.5-flash-preview-tts',\n      sttModel: 'gemini-3.5-transcribe', voiceName: 'Kore', sysCustom: '',\n    },\n    thread: 'main',\n    usage: { msgs: 24, tin: 18400, tout: 9120 },\n    wg: [\n      { id: 'wseed1', type: 'weather', size: '2x1', title: W(\"هوای نیشابور\"), text: '', at: 0, repeat: 'none', refresh: 900, accent: 'green', items: [], remKey: '', ts: Date.now() - 60000, up: 0 },\n      { id: 'wseed2', type: 'reminder', size: '1x1', title: W(\"یادآور عصر\"), text: W(\"چای دم کن\"), at: nextAt(18), repeat: 'none', refresh: 60, accent: 'blue', items: [], remKey: 'rm:mock2', ts: Date.now() - 30000, up: 0 },\n      { id: 'wseed3', type: 'clock', size: '1x1', title: W(\"ساعت تهران\"), text: '', at: 0, repeat: 'none', refresh: 60, accent: 'red', items: [], remKey: '', ts: Date.now() - 20000, up: 0 },\n      { id: 'wseed4', type: 'list', size: '1x2', title: W(\"خرید هفته\"), text: '', at: 0, repeat: 'none', refresh: 60, accent: 'blue', items: [W(\"شیر و ماست\"), W(\"نان تازه\"), W(\"میوه\"), W(\"تخم‌مرغ\")], remKey: '', ts: Date.now() - 10000, up: 0 },\n    ],\n  };\n  function nextAt(h) {\n    const d = new Date();\n    d.setHours(h, 0, 0, 0);\n    if (d < Date.now()) d.setDate(d.getDate() + 1);\n    return d.getTime();\n  }\n\n  const MODELS = [\n    { key: 'mock-cf-1', name: 'Llama 3.3 70B', ctx: 128, prov: 'cf', provName: 'Workers AI', vision: false },\n    { key: 'mock-cf-2', name: 'Gemma 3 27B', ctx: 128, prov: 'cf', provName: 'Workers AI', vision: true },\n    { key: 'mock-cf-3', name: 'Qwen 2.5 Coder 32B', ctx: 32, prov: 'cf', provName: 'Workers AI', vision: false },\n    { key: 'p1:gpt-4o-mini', name: 'GPT-4o mini', ctx: 128, prov: 'p', provName: W(\"آزادکلید\"), vision: true },\n    { key: 'p1:claude-sonnet', name: 'Claude Sonnet', ctx: 200, prov: 'p', provName: W(\"آزادکلید\"), vision: true },\n    { key: 'p2:deepseek-v3', name: 'DeepSeek V3', ctx: 64, prov: 'p', provName: W(\"سرویس دوم\"), vision: false },\n  ];\n  const PERSONAS = [\n    { i: 0, icon: '🙂', name: W(\"پیش‌فرض\") },\n    { i: 1, icon: '🎯', name: W(\"مختصر و فنی\") },\n    { i: 2, icon: '🧑‍🏫', name: W(\"معلم صبور\") },\n    { i: 3, icon: '🛠', name: W(\"مهندس برنامه\") },\n  ];\n\n  const json = (o, status) => new Response(JSON.stringify(o), {\n    status: status || 200,\n    headers: { 'Content-Type': 'application/json; charset=utf-8' },\n  });\n  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));\n\n  function sse(events) {\n    const enc = new TextEncoder();\n    let i = 0;\n    const stream = new ReadableStream({\n      async start(ctrl) {\n        for (const [delay, ev] of events) {\n          await sleep(delay);\n          try { ctrl.enqueue(enc.encode('data: ' + JSON.stringify(ev) + '\\n\\n')); } catch (e) { return; }\n        }\n        try { ctrl.close(); } catch (e) {}\n      },\n    });\n    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream; charset=utf-8' } });\n  }\n\n  function fakeAnswer(q) {\n    return W(\"### جواب نمونه (حالت پیش‌نمایش)\\n\\n\") +\n      W(\"سؤال تو این بود: **\") + q.slice(0, 80) + '**\\n\\n' +\n      W(\"این پاسخ از *mock* می‌آید تا بدون ورکر هم بتوانی ظاهر و انیمیشن‌ها را ببینی:\\n\\n\") +\n      W(\"1. استریم زنده با مکان‌نما ✨\\n\") +\n      W(\"2. کارت‌های شیشه‌ای با بلور\\n\") +\n      W(\"3. چهار تم و سه چیدمان\\n\\n\") +\n      W(\"```python\\n# نمونه کد\\nprint(\\\"Behrad AI — Liquid Glass\\\")\\n```\\n\\n\") +\n      W(\"برای اتصال واقعی، آدرس ورکر و رمز داشبورد را در صفحه ورود بزن.\");\n  }\n\n  async function mockChat(body) {\n    const q = (body.text || '').trim();\n    const th = body.thread || DB.thread;\n    // دستورات ساده\n    if (q === '/weather') {\n      return sse([[120, { t: 'status', html: W(\"🌤 در حال گرفتن هوا...\") }],\n        [500, { t: 'done', text: W(\"🌤 **هوای نیشابور**\\n\\n- دما: ۲۴° نیمه‌ابری\\n- باد: ۱۱ km/h\\n- رطوبت: ۳۸٪\"), footer: { label: 'Open-Meteo' } }]]);\n    }\n    if (q === '/memory') {\n      const txt = DB.mem.length ? DB.mem.map((m, i) => (i + 1) + '. ' + m.t).join('\\n') : W(\"حافظه خالی است.\");\n      return sse([[150, { t: 'done', text: W(\"🧠 **حافظه بلندمدت (\") + DB.mem.length + '/50)**\\n\\n' + txt, cmd: true }]]);\n    }\n    if (q === '/new') {\n      DB.hist[th] = [];\n      return sse([[150, { t: 'done', text: W(\"🧹 گفتگوی تازه شروع شد.\"), reset: true, cmd: true }]]);\n    }\n    if (q === '/help' || q === '/start') {\n      return sse([[150, { t: 'done', cmd: true, text: W(\"راهنما:\\n\\n- `/web جستجو` — سرچ وب\\n- `/weather` — هوای نیشابور\\n- `/remember متن` — سپردن به حافظه\\n- `/memory` — دیدن حافظه\\n- `/remind 18:30 چای` — یادآور\\n- `/brief` — خلاصه صبح\\n- `/new` — گفتگوی تازه\") }]]);\n    }\n    if (q.startsWith('/remember ')) {\n      const t = q.slice(10).trim();\n      if (t) DB.mem.push({ id: Date.now(), t: t, ts: Date.now() });\n      return sse([[200, { t: 'done', cmd: true, text: W(\"🧠 ذخیره شد: **\") + t + '** (' + DB.mem.length + '/50)' }]]);\n    }\n\n    const answer = fakeAnswer(q || W(\"عکس\"));\n    const events = [];\n    events.push([150, { t: 'status', html: W(\"🔎 در حال جستجوی وب ...\") }]);\n    events.push([450, { t: 'status', html: W(\"⚡ دارم می‌نویسم...\") }]);\n    // استریم تکه‌تکه\n    const words = answer.split(' ');\n    let acc = '';\n    const chunk = Math.max(2, Math.ceil(words.length / 26));\n    for (let i = 0; i < words.length; i += chunk) {\n      acc += (i ? ' ' : '') + words.slice(i, i + chunk).join(' ');\n      events.push([90, { t: 'delta', text: acc }]);\n    }\n    events.push([140, {\n      t: 'done', text: answer,\n      footer: { label: 'Llama 3.3 70B · Workers AI', tokens: 142 },\n    }]);\n    return sse(events);\n  }\n\n  /* WAV کوتاه بی‌صدا برای تست TTS */\n  function tinyWav() {\n    const n = 12000, rate = 8000;\n    const buf = new ArrayBuffer(44 + n * 2);\n    const v = new DataView(buf);\n    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };\n    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt ');\n    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);\n    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true);\n    v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);\n    for (let i = 0; i < n; i++) {\n      const t = i / rate;\n      const s = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 4) * 0.5;\n      v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 32767, true);\n    }\n    return new Blob([buf], { type: 'audio/wav' });\n  }\n\n  const origFetch = window.fetch.bind(window);\n  window.fetch = async function (input, init) {\n    const url = typeof input === 'string' ? input : (input && input.url) || '';\n    if (url.indexOf('/api/v1/') < 0) return origFetch(input, init);\n    const path = url.slice(url.indexOf('/api/v1/'));\n    const p = path.split('?')[0];\n    const method = ((init && init.method) || 'GET').toUpperCase();\n    let body = {};\n    if (init && init.body && typeof init.body === 'string') { try { body = JSON.parse(init.body); } catch (e) {} }\n\n    await sleep(120);\n\n    if (p === '/api/v1/ping') return json({ ok: true, version: 'mock' });\n    if (p === '/api/v1/login') return json({ token: 'mock-token', uid: '1' });\n    if (p === '/api/v1/state') {\n      return json({\n        version: '4.8.0-mock', uid: '1',\n        settings: DB.settings,\n        thread: DB.thread,\n        threads: DB.threads.map((t) => Object.assign({}, t)),\n        models: MODELS,\n        currentModel: Object.assign({ label: 'Llama 3.3 70B · Workers AI' },\n          MODELS.find((m) => m.key === DB.settings.model) || MODELS[0]),\n        personas: PERSONAS,\n        providers: [{ name: W(\"آزادکلید\"), n: 2, base: 'https://api.example.com/v1', keyMask: 'sk-***abc' }],\n        usage: DB.usage,\n        flags: { hasAi: true, hasDb: true, search: true, gemini: true },\n        memCount: DB.mem.length, memMax: 50,\n        briefHour: 10,\n        weather: { city: W(\"نیشابور\") },\n      });\n    }\n    if (p === '/api/v1/history') {\n      const th = new URLSearchParams(path.split('?')[1] || '').get('thread') || DB.thread;\n      return json({ thread: th, msgs: (DB.hist[th] || []) });\n    }\n    if (p === '/api/v1/chat') return mockChat(body);\n    if (p === '/api/v1/settings') {\n      Object.keys(body).forEach((k) => { DB.settings[k] = body[k]; });\n      return json({ ok: true, settings: DB.settings });\n    }\n    if (p === '/api/v1/thread') {\n      if (body.op === 'new') {\n        const id = 't' + Date.now().toString(36);\n        const n = DB.threads.length + 1;\n        DB.threads.push({ id: id, name: W(\"گفتگو \") + n, ts: Date.now() });\n        DB.hist[id] = [];\n        DB.thread = id;\n      } else if (body.op === 'select') { if (DB.threads.some((t) => t.id === body.id)) DB.thread = body.id; }\n      else if (body.op === 'delete') {\n        DB.threads = DB.threads.filter((t) => t.id !== body.id);\n        delete DB.hist[body.id];\n        if (DB.thread === body.id) DB.thread = DB.threads[DB.threads.length - 1].id;\n      } else if (body.op === 'rename') {\n        const t = DB.threads.find((x) => x.id === body.id);\n        if (t) t.name = body.name;\n      } else if (body.op === 'clear') { DB.hist[body.id || DB.thread] = []; }\n      return json({ ok: true, threads: DB.threads.map((t) => Object.assign({}, t)), thread: DB.thread });\n    }\n    if (p === '/api/v1/memory') {\n      if (method === 'GET') return json({ items: DB.mem, max: 50 });\n      if (body.op === 'add') {\n        const dup = DB.mem.some((m) => m.t === body.text);\n        if (!dup) DB.mem.push({ id: Date.now(), t: body.text, ts: Date.now() });\n        return json({ ok: true, added: !dup });\n      }\n      if (body.op === 'del') DB.mem = DB.mem.filter((m) => String(m.id) !== String(body.id));\n      if (body.op === 'clear') DB.mem = [];\n      if (body.op === 'edit') { const m = DB.mem.find((x) => String(x.id) === String(body.id)); if (m) m.t = body.newText; }\n      return json({ ok: true });\n    }\n    if (p === '/api/v1/reminders') {\n      if (method === 'GET') return json({ items: DB.rm });\n      if (body.op === 'add') {\n        const t = String(body.text || '');\n        const daily = /روزانه|daily/i.test(t);\n        const hm = t.match(/(\\d{1,2}):(\\d{2})/);\n        const rel = t.match(/(\\d+)\\s*m\\b/i);\n        let at;\n        if (hm) {\n          const d = new Date();\n          d.setHours(+hm[1], +hm[2], 0, 0);\n          if (d < Date.now() && !daily) d.setDate(d.getDate() + 1);\n          at = d.getTime();\n        } else if (rel) at = Date.now() + (+rel[1]) * 60000;\n        else at = Date.now() + 3600000;\n        const txt = t.replace(/روزانه/i, '').replace(/\\d{1,2}:\\d{2}/, '').replace(/\\d+\\s*m\\b/i, '').trim() || t;\n        DB.rm.push({ key: 'rm:' + Date.now().toString(36), at: at, txt: txt, repeat: daily ? 'daily' : null });\n        return json({ ok: true, at: at });\n      }\n      if (body.op === 'del') DB.rm = DB.rm.filter((x) => x.key !== body.key);\n      return json({ ok: true });\n    }\n    if (p === '/api/v1/stt') return json({ text: W(\"این یک متن نمونه است که از ویس فهمیدم!\") });\n    if (p === '/api/v1/tts') return new Response(tinyWav(), { headers: { 'Content-Type': 'audio/wav' } });\n    if (p === '/api/v1/tool') {\n      const name = new URLSearchParams(path.split('?')[1] || '').get('name');\n      if (name === 'weather') return json({ text: W(\"🌤 **هوای نیشابور**\\n\\n- دما: ۲۴° نیمه‌ابری\\n- باد: ۱۱ km/h\\n- رطوبت: ۳۸٪\") });\n      return json({ text: W(\"💰 بیت‌کوین: ۶۸٬۴۰۰ دلار (+۱.۲٪)\") });\n    }\n    if (p === '/api/v1/export') {\n      const th = new URLSearchParams(path.split('?')[1] || '').get('thread') || DB.thread;\n      const lines = (DB.hist[th] || []).map((m) => (m.role === 'user' ? W(\" تو: \") : '🤖: ') + m.content).join('\\n\\n');\n      return new Response(W(\"خروجی گفتگو — Behrad AI\\n\\n\") + lines, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });\n    }\n    if (p === '/api/v1/widgets') {\n      const WGM = 12;\n      if (method === 'GET') return json({ items: DB.wg.map((w) => Object.assign({}, w)), max: WGM });\n      if (body.op === 'ai') {\n        const idm = body.id || ('w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));\n        const pr = String(body.prompt || '').replace(/\\s+/g, ' ').trim();\n        if (!pr) return json({ error: W(\"پرامپت خالی است.\") }, 400);\n        const ixOld = DB.wg.findIndex((w) => w.id === idm);\n        if (ixOld < 0 && DB.wg.length >= WGM) return json({ error: W(\"سقف ۱۲ ویجت پر است.\") }, 400);\n        let spec;\n        if (/هوا|آب/.test(pr)) {\n          spec = { type: 'weather', size: '2x1', title: W(\"هوای نیشابور\"), text: '', at: 0, repeat: 'none', refresh: 900, accent: 'green', items: [] };\n        } else if (/ساعت|تقویم|تاریخ/.test(pr)) {\n          spec = { type: 'clock', size: '1x1', title: W(\"ساعت تهران\"), text: '', at: 0, repeat: 'none', refresh: 60, accent: 'blue', items: [] };\n        } else if (/لیست|چک/.test(pr)) {\n          spec = { type: 'list', size: '1x2', title: W(\"لیست\"), text: '', at: 0, repeat: 'none', refresh: 60, accent: 'blue', items: [W(\"مورد اول\"), W(\"مورد دوم\"), W(\"مورد سوم\")] };\n        } else if (/یاد|یادآور|هشدار|ساعت \\d|فردا/.test(pr) || /\\d{1,2}:\\d{2}/.test(pr)) {\n          const hm2 = pr.match(/(\\d{1,2})(?::(\\d{2}))?/);\n          let h = hm2 ? +hm2[1] : 9;\n          const mi = hm2 && hm2[2] ? +hm2[2] : 0;\n          const d2 = new Date();\n          d2.setHours(h, mi, 0, 0);\n          if (/فردا/.test(pr) || d2 < Date.now()) d2.setDate(d2.getDate() + 1);\n          spec = {\n            type: 'reminder', size: '1x1', title: /روزانه|هر روز/.test(pr) ? W(\"یادآور روزانه\") : W(\"یادآور\"),\n            text: pr.slice(0, 150), at: d2.getTime(),\n            repeat: /روزانه|هر روز/.test(pr) ? 'daily' : 'none',\n            accent: 'blue', items: [], refresh: 60,\n          };\n        } else {\n          spec = { type: 'note', size: '1x1', title: W(\"یادداشت\"), text: pr.slice(0, 150), at: 0, repeat: 'none', refresh: 60, accent: 'blue', items: [] };\n        }\n        spec.id = idm;\n        spec.remKey = spec.type === 'reminder' ? 'rm:mock' + Date.now().toString(36) : '';\n        spec.ts = Date.now(); spec.up = spec.ts;\n        if (ixOld >= 0) DB.wg[ixOld] = spec; else DB.wg.push(spec);\n        return json({ ok: true, spec: spec, items: DB.wg.map((w) => Object.assign({}, w)), src: 'ai', max: WGM });\n      }\n      if (body.op === 'put') {\n        const idp = String((body.spec || {}).id || '');\n        const ix = DB.wg.findIndex((w) => w.id === idp);\n        if (ix < 0) return json({ error: W(\"ویجت پیدا نشد.\") }, 404);\n        const keep = DB.wg[ix];\n        const ns = Object.assign({}, keep, body.spec, { id: idp, ts: keep.ts, up: Date.now() });\n        if (ns.type !== 'reminder') ns.remKey = '';\n        DB.wg[ix] = ns;\n        return json({ ok: true, spec: ns, items: DB.wg.map((w) => Object.assign({}, w)) });\n      }\n      if (body.op === 'del') {\n        const ixd = DB.wg.findIndex((w) => w.id === String(body.id || ''));\n        if (ixd < 0) return json({ error: W(\"ویجت پیدا نشد.\") }, 404);\n        DB.wg.splice(ixd, 1);\n        return json({ ok: true, items: DB.wg.map((w) => Object.assign({}, w)) });\n      }\n      if (body.op === 'reorder') {\n        const order = Array.isArray(body.order) ? body.order.map(String) : [];\n        const map = {};\n        DB.wg.forEach((w) => { map[w.id] = w; });\n        const next = [];\n        order.forEach((id) => { if (map[id]) { next.push(map[id]); delete map[id]; } });\n        DB.wg.forEach((w) => { if (map[w.id]) next.push(w); });\n        DB.wg = next;\n        return json({ ok: true, items: DB.wg.map((w) => Object.assign({}, w)) });\n      }\n      return json({ error: W(\"عملیات نامشخص است.\") }, 400);\n    }\n    if (p === '/api/v1/wdata') {\n      const what = new URLSearchParams(path.split('?')[1] || '').get('what');\n      if (what === 'weather') {\n        return json({ t: 22, hum: 41, code: 1, wind: 9, hi: 27, lo: 14, pop: 5, hi2: 26, lo2: 13, pop2: 15, city: W(\"نیشابور\"), at: Date.now() });\n      }\n      if (what === 'stats') {\n        return json({ msgs: DB.usage.msgs, tin: DB.usage.tin, tout: DB.usage.tout, dailyLimit: DB.settings.dailyLimit || 0, day: 'mock' });\n      }\n      return json({ error: W(\"نام داده نامعتبر است.\") }, 400);\n    }\n    return json({ error: W(\"mock: مسیر ناشناخته \") + p }, 404);\n  };\n\n  console.log(W(\"[mock] پیش‌نمایش محلی فعال است\"));\n})();\n"}};

function appB64Bytes(s) {
  const bin = atob(s);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}

function appAsset(env, url) {
  if (url.pathname === '/app') return new Response('', { status: 302, headers: { 'Location': '/app/' } });
  let name = url.pathname.slice('/app/'.length);
  if (!name) name = 'index.html';
  /* mock.js فقط روی localhost/wrangler dev سرو میشود — روی دامنه واقعی خالی است
     (کامنت داخل mock.js همین را می‌گوید؛ قبلاً فایل کامل در پروداکشن هم می‌رفت) */
  if (name === 'mock.js') {
    const host = String(url.hostname || '');
    if (!/^localhost$/i.test(host) && !/^127\.0\.0\.1$/i.test(host)) {
      return new Response(L(env, 'm0zxccnz'),
        { headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' } });
    }
  }
  /* 🔒 v5.4: فقط کلیدهای واقعی خودِ آبجکت — «constructor» یا «__proto__»
     در مسیر نباید از زنجیرهٔ prototype جواب بگیرد. */
  const a = Object.prototype.hasOwnProperty.call(APP_ASSETS, name) ? APP_ASSETS[name] : null;
  if (!a) return new Response('not found', { status: 404 });
  const body = a.b64 ? appB64Bytes(a.b) : a.b;
  return new Response(body, { headers: { 'Content-Type': a.t, 'Cache-Control': 'no-cache' } });
}

/* CORS: فقط همان دامنه‌ی خود ورکر مجاز است.
   قبلاً '*' بود → هر سایتی می‌توانست از مرورگر کاربر پاسخ‌ها را بخواند و
   روی /login هم brute-force بزند. حالا Origin خارجی اصلاً هدر CORS نمی‌گیرد.

   نکته: مقایسه باید با آدرس «درخواست» باشد، نه پاسخ — Responseهایی که خودمان
   می‌سازیم url خالی دارند و `new URL('')` خطا می‌دهد؛ قبلاً همین باعث میشد
   سمتِ «مجاز» هرگز کار نکند (هدر ACAO فقط برای دامنه‌ی بیگانه می‌رفت). */
function appCors(r, origin, selfOrigin) {
  try {
    const o = String(origin || '');
    if (o && /^https?:\/\//.test(o)) {
      let same = false;
      const self = String(selfOrigin || r.url || '');
      if (self) { try { same = new URL(o).host === new URL(self).host; } catch {} }
      if (same) r.headers.set('Access-Control-Allow-Origin', o);
    }
    r.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    r.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    r.headers.set('Vary', 'Origin');
  } catch {}
  return r;
}

async function appAuth(env, request) {
  try {
    const h = request.headers.get('Authorization') || '';
    const tk = h.replace(/^Bearer\s+/i, '').trim();
    if (!tk) return null;
    const v = await kvGet(env, 'atk:' + tk, null);
    if (!v || !v.uid || String(v.uid) !== String(env.ADMIN_ID)) return null;
    return { token: tk, uid: String(env.ADMIN_ID) };
  } catch { return null; }
}

function appThreadOk(id) {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(id);
}

const APP_HELP_MD = [
  '**راهنمای {{brand}}** 🤖',
  '',
  'دستورات:',
  '',
  '- `/web جستجو` — جستجوی وب با Tavily',
  '- `/image توصیف` — تولید تصویر 🎨 با GEMINI_API_KEY',
  '- `/tts متن` — تبدیل متن به صدا 🔊 (تا ۴۰۰ نویسه؛ متن‌های بلند: روی حباب 🔊 بزن)',
  '- `/translate متن` — ترجمهٔ فوری 🌐 فارسی↔انگلیسی',
  '- `/weather` — هوای نیشابور',
  '- `/crypto` — قیمت بیت‌کوین و اتریوم',
  '- `/remember متن` — سپردن به حافظه بلندمدت',
  '- `/memory` — دیدن حافظه · `/forget 2` · `/forget all`',
  '- `/remind 18:30 چای` — یادآور (روزانه 08:00 / 45m هم می‌شود)',
  '- `/new` — گفتگوی تازه',
  '- `/brief` — خلاصه صبح ' + CFG.BRIEF_HOUR + ':۰۰ روشن/خاموش',
  '- `/export` — خروجی تاریخچه',
  '- `/find عبارت` — جستجو در همهٔ گفتگوها 🔎',
  '- `/gallery` — گالری عکس‌ها · `/gallery 2` ارسال مجدد 🖼',
  '- `/sum متن` — خلاصهٔ هوشمند 📝 (روی ریپلای و متن بلند هم)',
  '- `/todo ...` — تودولیست ✅ · `/task هر روز 08:00 ...` — تسک زمان‌بندی‌شده با AI ⏳',
  '- `/memfind عبارت` — جستجو در حافظه 🧠',
  '- عکس با کپشن `ویرایش: ...` یا `/edit` روی ریپلای — ویرایش عکس 🖌',
  '',
  'وگرنه هر چی بپرسی همان جواب را می‌گیری؛ عکس 🖼، فایل 📄، PDF (تا ۶ مگابایت)، ماشین‌حساب 🧮 و لینک 🔗 هم بلدم.',
].join('\n');

/* EN */
const APP_HELP_MD_EN = [
  '**{{brand}} — Help** 🤖',
  '',
  'Commands:',
  '',
  '- `/web query` — web search with Tavily',
  '- `/image description` — generate an image 🎨 with GEMINI_API_KEY',
  '- `/tts text` — text to speech 🔊 (up to 400 chars; for longer text tap the 🔊 bubble)',
  '- `/translate text` — instant translation 🌐 Persian↔English',
  '- `/weather` — current weather',
  '- `/crypto` — Bitcoin and Ethereum prices',
  '- `/remember text` — save to long-term memory',
  '- `/memory` — view memory · `/forget 2` · `/forget all`',
  '- `/remind 18:30 tea` — reminder (daily 08:00 / 45m also work)',
  '- `/new` — new chat',
  '- `/brief` — morning briefing ' + CFG.BRIEF_HOUR + ':00 on/off',
  '- `/export` — export history',
  '- `/find term` — search all chats 🔎',
  '- `/gallery` — image gallery · `/gallery 2` resend 🖼',
  '- `/sum text` — smart summary 📝 (also on a reply and long text)',
  '- `/todo ...` — to-do list ✅ · `/task every day 08:00 ...` — AI scheduled task ⏳',
  '- `/memfind term` — search memory 🧠',
  '- photo with the caption `edit: ...` or `/edit` on a reply — edit an image 🖌',
  '',
  'Otherwise ask me anything; I also handle images 🖼, files 📄, PDFs (up to 6 MB), math 🧮 and links 🔗.',
].join('\n');

async function appApiHandler(env, request) {
  const url = new URL(request.url);
  const p = url.pathname;
  const method = (request.method || 'GET').toUpperCase();
  const origin = request.headers.get('Origin') || '';
  if (method === 'OPTIONS') return appCors(new Response(null, { status: 204 }), origin, url.origin);
  try {
    return appCors(await appRoute(env, request, url, p, method), origin, url.origin);
  } catch (e) {
    await logErr(env, 'app_api', e);
    return appCors(jsonRes({ error: String((e && e.message) || L(env, 'm1mjercl')) }, 500), origin, url.origin);
  }
}

async function appRoute(env, request, url, p, method) {

  /* ── ورود: رمز داشبورد → توکن ۳۰ روزه (با محدودیت تلاش) ── */
  if (p === '/api/v1/login' && method === 'POST') {
    const pw = env.DASHBOARD_PASSWORD || '';
    if (!pw) return jsonRes({ error: L(env, 'm1b0wm64') }, 503);
    const ip = String(request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'na')
      .split(',')[0].trim().slice(0, 64) || 'na';
    const lk = 'lg:' + hash32(ip);
    const W = CFG.LOGIN_WINDOW_S * 1000;
    const now = Date.now();
    const cnt = await kvGet(env, lk, { n: 0, ts: 0 });
    const fresh = cnt.ts && (now - cnt.ts) < W;
    if (cnt.n >= CFG.LOGIN_MAX_TRY && fresh) {
      return jsonRes({ error: L(env, 'm1la1lui', Math.ceil((W - (now - cnt.ts)) / 60000)) }, 429);
    }
    let body = {};
    try { body = await request.json(); } catch {}
    if (!safeEq(String(body.password || ''), pw)) {
      await kvPut(env, lk, { n: (fresh ? cnt.n : 0) + 1, ts: fresh ? cnt.ts : now }, CFG.LOGIN_WINDOW_S);
      return jsonRes({ error: L(env, 'm0o7tsjn') }, 401);
    }
    await kvDel(env, lk);
    const b = new Uint8Array(24);
    crypto.getRandomValues(b);
    let tk = '';
    for (let i = 0; i < b.length; i++) tk += b[i].toString(16).padStart(2, '0');
    await kvPut(env, 'atk:' + tk, { uid: String(env.ADMIN_ID) }, 30 * 86400);
    return jsonRes({ token: tk, uid: String(env.ADMIN_ID), expiresInDays: 30 });
  }

  const auth = await appAuth(env, request);
  if (!auth) return jsonRes({ error: 'unauthorized' }, 401);
  const uid = auth.uid;

  if (p === '/api/v1/ping') return jsonRes({ ok: true, version: VERSION });
  if (p === '/api/v1/logout' && method === 'POST') {
    await kvDel(env, 'atk:' + auth.token);
    return jsonRes({ ok: true });
  }

  const u = await getUser(env, uid);

  /* ── وضعیت کامل اپ ── */
  if (p === '/api/v1/state') {
    const entries = await getAllModelEntries(env);
    const cur = await resolveModel(env, u.st.model);
    const us = await kvGet(env, 'us:' + uid, {});
    const t0 = tehran();
    const mem = await memGet(env, uid);
    return jsonRes({
      version: VERSION,
      uid: uid,
      settings: u.st,
      thread: u.thread,
      threads: u.threads,
      models: entries.map((m) => ({
        key: m.key, name: m.name, ctx: Math.round(m.ctx / 1000),
        prov: m.prov === 'cf' ? 'cf' : 'p', provName: m.provName, vision: hasVision(m),
      })),
      currentModel: {
        key: cur.key,
        label: await entryLabel(env, cur.key),
        ctx: Math.round(cur.ctx / 1000),
        prov: cur.prov, provName: cur.provName, vision: hasVision(cur),
      },
      personas: PERSONAS.map((x, i) => ({ i: i, icon: x.icon, name: x.name })),
      providers: (await provAll(env)).map((r) => ({ name: r.name, n: (r.models || []).length, base: r.base, keyMask: maskKey(r.key) })),
      usage: {
        msgs: us.d === t0.ymd ? us.msgs || 0 : 0,
        tin: us.d === t0.ymd ? us.tin || 0 : 0,
        tout: us.d === t0.ymd ? us.tout || 0 : 0,
      },
      flags: {
        hasAi: !!(env.AI && typeof env.AI.run === 'function'),
        hasDb: !!env.DB,
        search: !!(env.SEARCH_API_KEY || '').trim(),
        gemini: !!(env.GEMINI_API_KEY || '').trim(),
      },
      gemModels: {
        tts: GEM_TTS_MODELS,
        stt: GEM_STT_MODELS,
        img: GEM_IMG_MODELS,
      },
      memCount: mem.length,
      memMax: CFG.MEM_MAX,
      briefHour: CFG.BRIEF_HOUR,
    });
  }

  /* ── تاریخچه (مشترک با تلگرام) ── */
  if (p === '/api/v1/history') {
    let th = url.searchParams.get('thread') || u.thread;
    if (!appThreadOk(th)) th = u.thread;
    const h = await histGet(env, 'c' + uid + ':' + th);
    return jsonRes({ thread: th, msgs: h.msgs });
  }

  /* ── چت جریانی: SSE روی POST ── */
  if (p === '/api/v1/chat' && method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch {}
    let th = body.thread || u.thread;
    if (!appThreadOk(th)) th = u.thread;
    const scope = 'c' + uid + ':' + th;
    const enc = new TextEncoder();
    let ctrl = null;
    const rs = new ReadableStream({ start(c) { ctrl = c; } });
    const send = (ev) => { try { ctrl.enqueue(enc.encode('data: ' + JSON.stringify(ev) + '\n\n')); } catch {} };
    const end = () => { try { ctrl.close(); } catch {} };
    const res = new Response(rs, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
    (async () => {
      try {
        await appChatFlow(env, uid, u, scope, body, send);
      } catch (e) {
        await logErr(env, 'app_chat', e);
        send({ t: 'err', msg: String((e && e.message) || L(env, 'm1x7wkws')) });
      } finally { end(); }
    })();
    return res;
  }

  /* ── تنظیمات (همان کلیدهای ربات) ── */
  if (p === '/api/v1/settings' && method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch {}
    const st = u.st;
    if (typeof body.temperature === 'number') st.temperature = Math.min(2, Math.max(0, body.temperature));
    if (typeof body.maxTokens === 'number') st.maxTokens = Math.min(8192, Math.max(256, Math.round(body.maxTokens)));
    if (typeof body.dailyLimit === 'number') st.dailyLimit = Math.min(100000, Math.max(0, Math.round(body.dailyLimit)));
    if (typeof body.model === 'string' && body.model) {
      const cm = await canonModel(env, body.model);
      if (cm.changed && !String(body.model).startsWith('@cf/')) return jsonRes({ error: L(env, 'm0w2eptl') }, 400);
      st.model = cm.key;
    }
    if (typeof body.persona === 'number' && body.persona >= 0 && body.persona < PERSONAS.length) st.persona = Math.round(body.persona);
    if (typeof body.sysCustom === 'string') st.sysCustom = body.sysCustom.slice(0, CFG.SYS_CUSTOM_MAX);
    const bools = ['autoFallback', 'liveStream', 'readLinks', 'autoVision', 'voiceReply', 'briefing', 'searchAuto', 'imgGen', 'imgFree', 'imgEdit', 'nlRemind', 'memAuto', 'weeklyBackup', 'cbBreaker', 'ytSum'];
    for (let i = 0; i < bools.length; i++) {
      const k = bools[i];
      if (typeof body[k] === 'boolean') st[k] = body[k];
    }
    if (body.voiceProv === 'cf' || body.voiceProv === 'google') st.voiceProv = body.voiceProv;
    if (typeof body.ttsModel === 'string' && GEM_TTS_MODELS.some((m) => m.id === body.ttsModel)) st.ttsModel = body.ttsModel;
    if (typeof body.sttModel === 'string' && GEM_STT_MODELS.some((m) => m.id === body.sttModel)) st.sttModel = body.sttModel;
    if (typeof body.imgModel === 'string' && GEM_IMG_MODELS.some((m) => m.id === body.imgModel)) st.imgModel = body.imgModel;
    if (typeof body.voiceName === 'string' && GEM_VOICES.indexOf(body.voiceName) >= 0) st.voiceName = body.voiceName;
    await putUser(env, uid, u);
    return jsonRes({ ok: true, settings: st });
  }

  /* ── گفتگوها (تردها) — همان منطق دکمه‌های ربات ── */
  if (p === '/api/v1/thread' && method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch {}
    const op = String(body.op || '');
    if (op === 'new') {
      const n = L(env, 'm1erlebc', u.threads.length + 1);
      u.threads.push({ id: 't' + Date.now().toString(36), name: n, ts: Date.now() });
      if (u.threads.length > CFG.THREAD_MAX) u.threads.shift();
      u.thread = u.threads[u.threads.length - 1].id;
    } else if (op === 'select') {
      if (!appThreadOk(body.id)) return jsonRes({ error: L(env, 'm0l3fmoi') }, 400);
      if (!u.threads.some((x) => x.id === body.id)) return jsonRes({ error: L(env, 'm0ix2zhp') }, 404);
      u.thread = body.id;
    } else if (op === 'delete') {
      if (u.threads.length <= 1) return jsonRes({ error: L(env, 'm1amitkh') }, 400);
      if (!u.threads.some((x) => x.id === body.id)) return jsonRes({ error: L(env, 'm0ix2zhp') }, 404);
      u.threads = u.threads.filter((x) => x.id !== body.id);
      if (u.thread === body.id) u.thread = u.threads[u.threads.length - 1].id;
    } else if (op === 'rename') {
      const t = u.threads.find((x) => x.id === body.id);
      if (!t) return jsonRes({ error: L(env, 'm0ix2zhp') }, 404);
      const nm = String(body.name || '').trim().slice(0, 40);
      if (nm) { t.name = nm; delete t.auto; } // تغییر دستی = عنوان دیگر خودکار عوض نمیشود
    } else if (op === 'clear') {
      const th = appThreadOk(body.id) && u.threads.some((x) => x.id === body.id) ? body.id : u.thread;
      await histPut(env, 'c' + uid + ':' + th, { msgs: [], used: 0 });
    } else {
      return jsonRes({ error: L(env, 'm1j7slcx') }, 400);
    }
    await putUser(env, uid, u);
    return jsonRes({ ok: true, threads: u.threads, thread: u.thread });
  }

  /* ── حافظه بلندمدت ── */
  if (p === '/api/v1/memory') {
    if (method === 'GET') {
      const arr = await memGet(env, uid);
      return jsonRes({ items: arr, max: CFG.MEM_MAX });
    }
    if (method === 'POST') {
      let body = {};
      try { body = await request.json(); } catch {}
      if (body.op === 'add') {
        const ok = await memAdd(env, uid, String(body.text || ''));
        return jsonRes({ ok: true, added: ok });
      }
      if (body.op === 'del') {
        await memDel(env, uid, body.id);
        return jsonRes({ ok: true });
      }
      if (body.op === 'clear') {
        await memPut(env, uid, []);
        return jsonRes({ ok: true });
      }
      if (body.op === 'edit') {
        const t = String(body.newText || '').trim().slice(0, 300);
        if (!t) return jsonRes({ error: L(env, 'm06c2j1v') }, 400);
        const arr = await memGet(env, uid);
        const it = arr.find((x) => x.id === body.id);
        if (!it) return jsonRes({ error: L(env, 'm084jnlc') }, 404);
        it.t = t;
        await memPut(env, uid, arr);
        return jsonRes({ ok: true });
      }
      return jsonRes({ error: L(env, 'm1j7slcx') }, 400);
    }
  }

  /* ── یادآورها (همان کلیدهای rm: ربات — اجرا با کرون همان ورکر) ── */
  if (p === '/api/v1/reminders') {
    if (method === 'GET') {
      const keys = await kvList(env, 'rm:');
      const items = [];
      for (let i = 0; i < keys.length; i++) {
        const v = await kvGet(env, keys[i], null);
        if (!v || String(v.uid) !== uid) continue;
        items.push({ key: keys[i], at: v.at, txt: v.txt, repeat: v.repeat || 'none' });
      }
      return jsonRes({ items: items });
    }
    if (method === 'POST') {
      let body = {};
      try { body = await request.json(); } catch {}
      if (body.op === 'del') {
        const k = String(body.key || '');
        if (k.indexOf('rm:') !== 0) return jsonRes({ error: L(env, 'm0pty8cf') }, 400);
        const v = await kvGet(env, k, null);
        if (v && String(v.uid) === uid) await kvDel(env, k);
        return jsonRes({ ok: true });
      }
      if (body.op === 'add') {
        const r = parseRemind(String(body.text || ''));
        if (!r) return jsonRes({ error: L(env, 'm1nnjo5o') }, 400);
        const k = 'rm:' + hash32(uid + r.at + Math.random());
        await kvPut(env, k, { uid: uid, chat: u.lastChat || env.ADMIN_ID, at: r.at, txt: r.txt, repeat: (r.repeat || 'none') },
          Math.max(60, Math.ceil((r.at - Date.now()) / 1000) + 120));
        const d = new Date(r.at + 210 * 60000); // +۳:۳۰ = تهران
        const label = d.getUTCHours() + ':' + String(d.getUTCMinutes()).padStart(2, '0');
        return jsonRes({ ok: true, at: r.at, atLabel: label, repeat: r.repeat || 'none' });
      }
      return jsonRes({ error: L(env, 'm1j7slcx') }, 400);
    }
  }

  /* ── فهم ویس ── */
  if (p === '/api/v1/stt' && method === 'POST') {
    let fd = null;
    try { fd = await request.formData(); } catch { return jsonRes({ error: L(env, 'm14oov0j') }, 400); }
    const f = fd.get('file');
    if (!f || typeof f.arrayBuffer !== 'function') return jsonRes({ error: L(env, 'm1kw1dvu') }, 400);
    const buf = await f.arrayBuffer();
    if (!buf.byteLength) return jsonRes({ error: L(env, 'm09ybhe9') }, 400);
    if (buf.byteLength > CFG.VOICE_MAX_BYTES) return jsonRes({ error: L(env, 'm0obeb7t') }, 413);
    const text = await transcribeVoice(env, buf, u.st, String(f.type || ''));
    return jsonRes({ text: text });
  }

  /* ── تولید صدا ── */
  if (p === '/api/v1/tts' && method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch {}
    const text = String(body.text || '').replace(/<[^>]+>/g, ' ').trim().slice(0, 900);
    if (!text) return jsonRes({ error: L(env, 'm00vb6we') }, 400);
    if (u.st.voiceProv !== 'cf' && gemKey(env)) {
      try {
        const pcm = await geminiTTS(env, text, u.st.voiceName || 'Kore', u.st.ttsModel);
        const wav = pcmToWavBytes(pcm, 24000);
        return appCors(new Response(wav, { headers: { 'Content-Type': 'audio/wav' } }));
      } catch (e) {
        await logErr(env, 'app_tts_gem', e);
        if (/GEMINI_API_KEY|429/.test(String((e && e.message) || e))) return jsonRes({ error: L(env, 'm0bt2k9o', String(e.message || '')) }, 502);
      }
    }
    if (/[؀-ۿ]/.test(text)) return jsonRes({ error: L(env, 'm0lkdita') }, 503);
    if (env.AI && typeof env.AI.run === 'function') {
      try {
        const out = await env.AI.run(CFG.TTS_MODEL, { prompt: text, lang: 'en' });
        let bytes = null;
        if (out instanceof ArrayBuffer) bytes = out;
        else if (out && out.byteLength) bytes = out;
        else if (typeof out === 'string' && out.length > 100) bytes = appB64Bytes(out);
        if (!bytes) return jsonRes({ error: L(env, 'm1292qjs') }, 502);
        return appCors(new Response(bytes, { headers: { 'Content-Type': 'audio/mpeg' } }));
      } catch (e) {
        await logErr(env, 'app_tts', e);
        return jsonRes({ error: L(env, 'm07nuekz') }, 502);
      }
    }
    return jsonRes({ error: L(env, 'm0izy80o') }, 503);
  }

  /* ── 🎨 تولید تصویر (GEMINI_API_KEY + مدل imgModel) ── */
  if (p === '/api/v1/image' && method === 'POST') {
    let body = {};
    try { body = await request.json(); } catch {}
    if (u.st.imgGen === false) return jsonRes({ error: L(env, 'm19wixy6') }, 403);
    if (!gemKey(env) && u.st.imgFree === false) return jsonRes({ error: L(env, 'm1mkkwk3') }, 503);
    const lim = await checkDailyLimit(env, uid, u.st);
    if (lim) return jsonRes({ error: lim }, 429);
    const qlim = await quotaTake(env, uid, 'img');
    if (qlim) return jsonRes({ error: qlim }, 429);
    try {
      /* 🖌 اگر body.images داشت → ویرایش عکس، وگرنه تولید جدید */
      const imgs = Array.isArray(body.images) ? body.images.filter((x) => x && x.b64).slice(0, CFG.IMG_EDIT_MAX_N) : [];
      const img = imgs.length
        ? await geminiImageEdit(env, body.prompt, imgs, u.st.imgModel || CFG.IMG_MODEL_DEFAULT)
        : await geminiImage(env, body.prompt, u.st.imgModel || CFG.IMG_MODEL_DEFAULT, { free: u.st.imgFree !== false });
      await imgGallerySave(env, uid, { b64: img.b64, mime: img.mime, prompt: (imgs.length ? '✏️ ' : '') + body.prompt });
      await quotaBump(env, uid, 'img');
      await bumpUsage(env, uid, est(String(body.prompt || '')) + 600, 0);
      return jsonRes({ ok: true, mime: img.mime, b64: img.b64, via: img.via || '', model: u.st.imgModel || CFG.IMG_MODEL_DEFAULT });
    } catch (e) {
      await logErr(env, 'app_image', e);
      return jsonRes({ error: String((e && e.message) || L(env, 'm0uqywig')) }, 502);
    }
  }

  /* ── v5.4: گالری تصاویر ── */
  if (p === '/api/v1/gallery') {
    if (method === 'GET') {
      const list = await imgGalleryList(env, uid);
      return jsonRes({ ok: true, items: list.map((x) => ({ id: x.id, prompt: x.prompt, ts: x.ts })) });
    }
    let gb = {};
    try { gb = await request.json(); } catch {}
    const gid = String(gb.id || '');
    const item = await imgGalleryGet(env, uid, gid);
    if (!item) return jsonRes({ error: L(env, 'm0uziz0m') }, 404);
    return jsonRes({ ok: true, mime: item.mime, b64: item.b64, prompt: item.prompt || '' });
  }

  /* ── v5.4: جستجوی تاریخچه ── */
  if (p === '/api/v1/find') {
    const q = url.searchParams.get('q') || '';
    const found = await histFind(env, uid, 'c' + uid + ':' + (u.thread || 'main'), q);
    if (found.error) return jsonRes({ error: found.error }, 400);
    return jsonRes({ ok: true, hits: found.hits, total: found.total });
  }

  /* ── v5.4: تودولیست ── */
  if (p === '/api/v1/todo') {
    if (method === 'GET') {
      const arr = await todoGet(env, uid);
      return jsonRes({ ok: true, items: arr });
    }
    let tb = {};
    try { tb = await request.json(); } catch {}
    const op = String(tb.op || '');
    const arr = await todoGet(env, uid);
    if (op === 'add') {
      const it = await todoAdd(env, uid, tb.text);
      if (!it) return jsonRes({ error: L(env, 'm06c2j1v') }, 400);
      return jsonRes({ ok: true, item: it, items: await todoGet(env, uid) });
    }
    if (op === 'toggle') {
      const i = arr.findIndex((x) => x.id === tb.id);
      if (i < 0) return jsonRes({ error: L(env, 'm1gchinh') }, 404);
      arr[i].done = !arr[i].done;
      await todoPut(env, uid, arr);
      return jsonRes({ ok: true, items: arr });
    }
    if (op === 'del') {
      await todoPut(env, uid, arr.filter((x) => x.id !== tb.id));
      return jsonRes({ ok: true, items: await todoGet(env, uid) });
    }
    if (op === 'clear') {
      await todoPut(env, uid, []);
      return jsonRes({ ok: true, items: [] });
    }
    return jsonRes({ error: L(env, 'm1uj91hd') }, 400);
  }

  /* ── v5.4: تسک‌های زمان‌بندی‌شده با AI ── */
  if (p === '/api/v1/tasks') {
    if (method === 'GET') {
      const list = await taskList(env, uid);
      return jsonRes({ ok: true, items: list.map((t) => ({ id: t.id, prompt: t.prompt, repeat: t.repeat, at: t.at })) });
    }
    let kb = {};
    try { kb = await request.json(); } catch {}
    const kop = String(kb.op || '');
    if (kop === 'add') {
      const pr = parseRemind(String(kb.text || '').trim());
      if (!pr) return jsonRes({ error: L(env, 'm0xi2loh') }, 400);
      const list = await taskList(env, uid);
      if (list.length >= CFG.TASK_MAX) return jsonRes({ error: L(env, 'm0uvfha0') }, 429);
      const tt = { uid, chat: u.lastChat || String(env.ADMIN_ID), id: 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4), prompt: String(pr.txt || '').slice(0, CFG.TASK_PROMPT_MAX), repeat: pr.repeat || 'none', step: pr.step, day: pr.day, at: pr.at, ts: Date.now() };
      if (!tt.prompt) return jsonRes({ error: L(env, 'm1lsps31') }, 400);
      await taskSave(env, tt);
      return jsonRes({ ok: true, id: tt.id });
    }
    if (kop === 'del') {
      await taskDel(env, uid, String(kb.id || ''));
      return jsonRes({ ok: true });
    }
    return jsonRes({ error: L(env, 'm1uj91hd') }, 400);
  }

  /* ── v5.4: جستجوی حافظه ── */
  if (p === '/api/v1/memfind') {
    const q = url.searchParams.get('q') || '';
    const res = await memSearch(env, uid, q);
    return jsonRes({ ok: true, items: res });
  }

  /* ── ابزارها ── */
  if (p === '/api/v1/tool') {
    const name = url.searchParams.get('name');
    try {
      if (name === 'weather') return jsonRes({ text: L(env, 'm0ojfxpv', await toolWeather(env)) });
      if (name === 'crypto') return jsonRes({ text: L(env, 'm0vh2r6b', await toolCrypto(env)) });
    } catch (e) { return jsonRes({ error: String(e.message || L(env, 'm11r1o8b')) }, 502); }
    return jsonRes({ error: L(env, 'm12ktwun') }, 400);
  }

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 21b-widgets
   ویجت‌های هوشمند 🧩: ساخت/اعتبارسنجی/آب‌وهوا/یادآور
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */

  /* ── ویجت‌های هوشمند 🧩 (v4.8): برد شیشه‌ای اپ — spec با AI از پرامپت فارسی ── */
  if (p === '/api/v1/widgets') {
    if (method === 'GET') {
      const items = await wgGet(env, uid);
      return jsonRes({ items: items, max: WIDGET_MAX });
    }
    if (method === 'POST') {
      let body = {};
      try { body = await request.json(); } catch {}
      const op = String(body.op || '');
      const items = await wgGet(env, uid);

      if (op === 'ai') {
        const prompt = String(body.prompt || '').replace(/\s+/g, ' ').trim().slice(0, 300);
        if (!prompt) return jsonRes({ error: L(env, 'm1dmay17') }, 400);
        const id = body.id ? String(body.id) : '';
        const idx = id ? items.findIndex((x) => x.id === id) : -1;
        if (!id && items.length >= WIDGET_MAX) return jsonRes({ error: L(env, 'm0p1jj7b', num(WIDGET_MAX)) }, 400);
        if (id && idx < 0) return jsonRes({ error: L(env, 'm1tqgsds') }, 404);
        const lim = await checkDailyLimit(env, uid, u.st);
        if (lim) return jsonRes({ error: lim }, 429);
        const made = await widgetAiSpec(env, u, prompt);
        const spec = widgetSanitize(env, made.spec, id || wgNewId());
        spec.ts = idx >= 0 ? items[idx].ts : Date.now();
        spec.up = Date.now();
        spec.remKey = idx >= 0 ? (items[idx].remKey || '') : '';
        await wgSyncReminder(env, uid, u, spec, false);
        // ورودی و خروجی جدا شمارده شوند (قبلاً هر دو = est(prompt) بود و مصرف ~۵۰٪ کمتر ثبت می‌شد)
        try { await bumpUsage(env, uid, est(prompt), Math.max(60, Math.round(est(prompt) * 0.25))); } catch {}
        if (idx >= 0) items[idx] = spec; else items.push(spec);
        await wgPut(env, uid, items);
        return jsonRes({ ok: true, spec: spec, items: items, src: made.src, max: WIDGET_MAX });
      }

      if (op === 'put') {
        const raw = (body.spec && typeof body.spec === 'object') ? body.spec : {};
        const id = String(raw.id || '');
        const idx = items.findIndex((x) => x.id === id);
        if (idx < 0) return jsonRes({ error: L(env, 'm1tqgsds') }, 404);
        const spec = widgetSanitize(env, raw, id);
        spec.ts = items[idx].ts;
        spec.up = Date.now();
        spec.remKey = items[idx].remKey || '';
        await wgSyncReminder(env, uid, u, spec, false);
        items[idx] = spec;
        await wgPut(env, uid, items);
        return jsonRes({ ok: true, spec: spec, items: items });
      }

      if (op === 'del') {
        const id = String(body.id || '');
        const idx = items.findIndex((x) => x.id === id);
        if (idx < 0) return jsonRes({ error: L(env, 'm1tqgsds') }, 404);
        const spec = items[idx];
        await wgSyncReminder(env, uid, u, spec, true);
        items.splice(idx, 1);
        await wgPut(env, uid, items);
        return jsonRes({ ok: true, items: items });
      }

      if (op === 'reorder') {
        const order = Array.isArray(body.order) ? body.order.map(String).slice(0, WIDGET_MAX) : [];
        const map = {};
        items.forEach((x) => { map[x.id] = x; });
        const next = [];
        order.forEach((id) => {
          if (map[id]) { next.push(map[id]); delete map[id]; }
        });
        items.forEach((x) => { if (map[x.id]) next.push(x); });
        await wgPut(env, uid, next);
        return jsonRes({ ok: true, items: next });
      }

      return jsonRes({ error: L(env, 'm1j7slcx') }, 400);
    }
    return jsonRes({ error: L(env, 'm15q1ctd') }, 405);
  }

  /* ── داده زنده ویجت‌ها: هوا (ساختاریافته) و آمار امروز ── */
  if (p === '/api/v1/wdata') {
    const what = url.searchParams.get('what');
    if (what === 'weather') {
      try { return jsonRes(await widgetWeather(env)); }
      catch (e) { return jsonRes({ error: String((e && e.message) || L(env, 'm17gr4fi')) }, 502); }
    }
    if (what === 'stats') {
      const us = await kvGet(env, 'us:' + uid, {});
      const t0 = tehran();
      const day = us && us.d === t0.ymd;
      return jsonRes({
        msgs: day ? (us.msgs || 0) : 0,
        tin: day ? (us.tin || 0) : 0,
        tout: day ? (us.tout || 0) : 0,
        dailyLimit: u.st.dailyLimit || 0,
        day: t0.ymd,
      });
    }
    return jsonRes({ error: L(env, 'm1rqy9fl') }, 400);
  }

  /* ── خروجی متنی گفتگو ── */
  if (p === '/api/v1/export') {
    let th = url.searchParams.get('thread') || u.thread;
    if (!appThreadOk(th)) th = u.thread;
    const t = u.threads.find((x) => x.id === th);
    const h = await histGet(env, 'c' + uid + ':' + th);
    const lines = h.msgs.map((m) => (m.role === 'user' ? L(env, 'm05g16ki') : L(env, 'm0m4g10r')) + m.content).join('\n\n──────────\n\n');
    const out = L(env, 'm1in2yd5', (t && t.name) || th, VERSION, new Date().toISOString(), lines || L(env, 'm1as29d3'));
    return new Response(out, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Disposition': 'attachment; filename="behraad-' + th + '.txt"' },
    });
  }

  return jsonRes({ error: L(env, 'm1lkb9pm') }, 404);
}

/* ── جریان یک پیام چت (فرمان/بازتولید/عادی) ── */
async function appChatFlow(env, uid, u, scope, body, send) {
  const settings = u.st;
  const raw = String(body.text || '');
  const trimmed = raw.trim();

  /* تولید مجدد: آخرین پیام کاربر و همه‌چیز بعدش بریده میشود — عین رفتار ربات */
  if (body.regen) {
    const h0 = await histGet(env, scope);
    let i = h0.msgs.length - 1;
    while (i >= 0 && h0.msgs[i].role !== 'user') i--;
    if (i < 0) { send({ t: 'err', msg: L(env, 'm0osdx2r') }); return; }
    const popped = h0.msgs[i];
    h0.msgs = h0.msgs.slice(0, i);
    await histPut(env, scope, h0);
    send({ t: 'regen', text: String(popped.content || '').slice(0, 200) });
    await appRunChat(env, uid, scope, settings, {
      text: String(popped.content || '').replace(/\s*📷 [0-9۰-۹]+ عکس پیوست شد/g, '').trim(),
      photos: [], file: null,
    }, send, {});
    return;
  }

  /* دستورات — عین handleCommand ربات ولی خروجی مارک‌داون برای اپ */
  if (trimmed.charAt(0) === '/') {
    const handled = await appApiCommand(env, uid, u, scope, trimmed, send);
    if (handled === 'web') {
      await appRunChat(env, uid, scope, settings, { text: raw, photos: body.photos, file: body.file }, send,
        { forceWeb: trimmed.split(/\s+/).slice(1).join(' ').trim() });
      return;
    }
    if (handled) return;
  }

  await appRunChat(env, uid, scope, settings, { text: raw, photos: body.photos, file: body.file }, send, {});
}

async function appApiCommand(env, uid, u, scope, text, send) {
  const parts = text.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ');
  const done = (o) => { send(Object.assign({ t: 'done', cmd: true }, o)); };

  switch (cmd) {
    case '/start':
    case '/help':
      done({ text: pick(env, APP_HELP_MD, APP_HELP_MD_EN) });
      return true;

    case '/weather':
      send({ t: 'status', html: L(env, 'm0ei4a2j') });
      try { done({ text: L(env, 'm0ojfxpv', await toolWeather(env)) }); }
      catch (e) { send({ t: 'err', msg: String(e.message || L(env, 'm01jl3p0')) }); }
      return true;

    case '/crypto':
      send({ t: 'status', html: L(env, 'm031atyr') });
      try { done({ text: L(env, 'm0vh2r6b', await toolCrypto(env)) }); }
      catch (e) { send({ t: 'err', msg: String(e.message || L(env, 'm14lsjrb')) }); }
      return true;

    case '/image':
    case '/img': {
      if (!toolAvailable(env, 'img')) {
        return await sendMsg(env, budget, chatId, L(env, 'm0img_off'));
      }
      if (u.st.imgGen === false) { done({ text: L(env, 'm0x2yp3a') }); return true; }
      /* 🔧 v5.4: این مسیر مثل تلگرام باید فالبک رایگان را هم ببیند؛
         قبلاً بدون کلید گوگل همیشه خطا می‌داد و imgFree بی‌اثر بود. */
      if (!gemKey(env) && u.st.imgFree === false) { done({ text: L(env, 'm0o91y9t') }); return true; }
      const pr = arg.trim();
      if (!pr) { done({ text: L(env, 'm023cmhe', u.st.imgModel || CFG.IMG_MODEL_DEFAULT) }); return true; }
      /* سقف روزانه — مسیر اپ از /api/v1/image رد نمیشود، پس اینجا باید جدا بسته شود */
      const cmdLim = await checkDailyLimit(env, uid, u.st);
      if (cmdLim) { send({ t: 'err', msg: cmdLim.replace(/\n/g, ' ') }); return true; }
      const cmdQ = await quotaTake(env, uid, 'img');
      if (cmdQ) { send({ t: 'err', msg: cmdQ.replace(/\n/g, ' ') }); return true; }
      send({ t: 'status', html: L(env, 'm1klk24e') });
      try {
        const img = await geminiImage(env, pr, u.st.imgModel || CFG.IMG_MODEL_DEFAULT, { free: u.st.imgFree !== false });
        await quotaBump(env, uid, 'img');
        await imgGallerySave(env, uid, { b64: img.b64, mime: img.mime, prompt: pr });
        await bumpUsage(env, uid, est(pr) + 600, 0);
        done({ text: '🎨 ' + pr, img: { b64: img.b64, mime: img.mime } });
      } catch (e) {
        await logErr(env, 'app_image_cmd', e);
        send({ t: 'err', msg: String((e && e.message) || L(env, 'm0uqywig')) });
      }
      return true;
    }

    case '/remember': {
      const t = arg.trim();
      if (!t) { done({ text: L(env, 'm0lr0o49') }); return true; }
      const ok = await memAdd(env, uid, t);
      const arr = await memGet(env, uid);
      done({
        text: ok
          ? L(env, 'm1p4fs19', t.slice(0, 200), arr.length, CFG.MEM_MAX)
          : L(env, 'm1nnv324', arr.length, CFG.MEM_MAX),
      });
      return true;
    }

    case '/forget': {
      const a = arg.trim();
      if (!a) { done({ text: L(env, 'm0jj8mb0') }); return true; }
      if (a.toLowerCase() === 'all') {
        await memPut(env, uid, []);
        done({ text: L(env, 'm0bruwal') });
        return true;
      }
      const idx = parseInt(a, 10);
      const arr = await memGet(env, uid);
      const it = arr[idx - 1];
      if (!it) { done({ text: L(env, 'm1t6zi84') }); return true; }
      await memDel(env, uid, it.id);
      done({ text: L(env, 'm1leppoo', String(it.t).slice(0, 200)) });
      return true;
    }

    case '/memory': {
      const arr = await memGet(env, uid);
      if (!arr.length) { done({ text: L(env, 'm14jqzm2') }); return true; }
      done({
        text: L(env, 'm0z2w8r4', arr.length, CFG.MEM_MAX, arr.map((x, i) => (i + 1) + '. ' + x.t).join('\n')),
      });
      return true;
    }

    case '/new':
      await histPut(env, scope, { msgs: [], used: 0 });
      done({ text: L(env, 'm0ysn1iy'), reset: true });
      return true;

    case '/brief':
      u.st.briefing = u.st.briefing === false;
      await putUser(env, uid, u);
      if (u.st.briefing === false) { done({ text: L(env, 'm0ajkdai') }); return true; }
      try { await sendMorningBriefing(env, uid, u.lastChat || env.ADMIN_ID); } catch (e) { await logErr(env, 'app_brief', e); }
      done({ text: L(env, 'm1sri6y8', CFG.BRIEF_HOUR) });
      return true;

    case '/remind': {
      const r = parseRemind(arg);
      if (!r) {
        done({ text: L(env, 'm096gedn') });
        return true;
      }
      const k = 'rm:' + hash32(uid + r.at + Math.random());
      await kvPut(env, k, { uid: uid, chat: u.lastChat || env.ADMIN_ID, at: r.at, txt: r.txt, repeat: (r.repeat || 'none') },
        Math.max(60, Math.ceil((r.at - Date.now()) / 1000) + 120));
      const d = new Date(r.at + 210 * 60000);
      done({
        text: L(env, 'm1c1xw8a', r.repeat === 'daily' ? L(env, 'm18eeume') : '', d.getUTCHours(), String(d.getUTCMinutes()).padStart(2, '0'), r.txt),
      });
      return true;
    }

    case '/export':
      done({ text: L(env, 'm0l450r2') });
      return true;

    case '/tts': {
      if (!toolAvailable(env, 'tts')) return await sendMsg(env, budget, chatId, L(env, 'm0tts_off'));
      /* سقف ۴۰۰ نویسه: صدا به‌صورت data-URI روی همان SSE برمی‌گردد، پس
         باید حجمش بسته بماند. متن بلندتر: روی حبابِ همان پیام 🔊 بزن. */
      const q = arg.trim().slice(0, 400);
      if (!q) { done({ text: L(env, 'm0dr5k87', u.st.voiceName || 'Kore') }); return true; }
      if (!gemKey(env)) { done({ text: L(env, 'm1emacaq') }); return true; }
      const ttsLim = await checkDailyLimit(env, uid, u.st);
      if (ttsLim) { send({ t: 'err', msg: ttsLim.replace(/\n/g, ' ') }); return true; }
      send({ t: 'status', html: L(env, 'm1m3sg2c') });
      try {
        /* voiceProv گوگل اجباری است تا وقتی کاربر موتور را روی کلادفلر گذاشته،
           همچنان (مثل تلگرام) صدای فارسیِ سالم بگیرد. */
        const pcm = await geminiTTS(env, q, u.st.voiceName || 'Kore', u.st.ttsModel);
        const wav = pcmToWavBytes(pcm, 24000);
        await bumpUsage(env, uid, est(q) + 500, 0);
        done({ text: '🔊 ' + q.slice(0, 200), audio: 'data:audio/wav;base64,' + bufToB64(wav), cmd: true });
      } catch (e) {
        await logErr(env, 'app_tts_cmd', e);
        send({ t: 'err', msg: String((e && e.message) || L(env, 'm14186yy')) });
      }
      return true;
    }

    /* ── v5.4: جستجوی تاریخچه ── */
    case '/find': {
      const qf = arg.trim();
      if (!qf) { done({ text: L(env, 'm01jegfx') }); return true; }
      send({ t: 'status', html: L(env, 'm0ddnpuc') });
      const found = await histFind(env, uid, scope, qf);
      if (found.error) { send({ t: 'err', msg: found.error }); return true; }
      if (!found.hits.length) { done({ text: L(env, 'm14pjnho', qf) }); return true; }
      const linesF = found.hits.map((h, i) => (i + 1) + '. ' + h.thread + ' · ' + h.role + '\n   ' + h.snip);
      done({ text: L(env, 'm06nczjq', found.total, qf, linesF.join('\n')) });
      return true;
    }
    /* ── v5.4: گالری ── */
    case '/gallery': {
      const listG = await imgGalleryList(env, uid);
      if (!listG.length) { done({ text: L(env, 'm03sf4bw') }); return true; }
      const nG = parseInt(normDigits(arg).replace(/[^0-9]/g, ''), 10);
      if (nG >= 1 && nG <= listG.length) {
        const itemG = listG[nG - 1];
        const imgG = await imgGalleryGet(env, uid, itemG.id);
        if (!imgG) { send({ t: 'err', msg: L(env, 'm1v7div1') }); return true; }
        done({ text: '🖼 ' + (itemG.prompt || L(env, 'm02yw10f')), img: { b64: imgG.b64, mime: imgG.mime } });
        return true;
      }
      const rowsG = listG.map((x, i) => (i + 1) + '. ' + (x.prompt || L(env, 'm1if2w6h')).slice(0, 60));
      done({ text: L(env, 'm0kk51n1', listG.length, rowsG.join('\n')) });
      return true;
    }
    /* ── v5.4: خلاصه ── */
    case '/sum': {
      if (!toolAvailable(env, 'sum')) return await sendMsg(env, budget, chatId, L(env, 'm0sum_off'));
      const srcS = arg.trim();
      if (!srcS) { done({ text: L(env, 'm1l5ph9g') }); return true; }
      const limS = await checkDailyLimit(env, uid, u.st);
      if (limS) { send({ t: 'err', msg: limS.replace(/\n/g, ' ') }); return true; }
      send({ t: 'status', html: L(env, 'm0t4ez9i') });
      try {
        const resS = await summarizeText(env, u.st.model, u.st, srcS, {});
        done({ text: L(env, 'm0d3swmp', resS.reduced ? ' (' + resS.parts + L(env, 'm0i35436') : '', resS.text || L(env, 'm0q7ytpb'), resS.cut ? L(env, 'm0cfmgf4') + (CFG.SUM_MAX_PARTS * CFG.SUM_CHUNK) + L(env, 'm1s7i8mq') : '') });
        await bumpUsage(env, uid, est(srcS), est(resS.text || ''));
      } catch (e) { send({ t: 'err', msg: String((e && e.message) || e).slice(0, 240) }); }
      return true;
    }
    /* ── v5.4: تودو ── */
    case '/todo': {
      const a2 = arg.trim();
      if (!a2 || /^(list|لیست)$/i.test(a2)) {
        const arrT = await todoGet(env, uid);
        if (!arrT.length) { done({ text: L(env, 'm1sk4va5') }); return true; }
        done({ text: L(env, 'm06ghlxp', arrT.map((x, i) => (x.done ? '✅ ' : '⬜ ') + (i + 1) + '. ' + x.t).join('\n')) });
        return true;
      }
      const mm2 = /^(done|انجام)\s+(\d+)$/i.exec(a2);
      if (mm2) {
        const arrT = await todoGet(env, uid);
        const i2 = +mm2[2] - 1;
        if (!arrT[i2]) { send({ t: 'err', msg: L(env, 'm1knzm87') }); return true; }
        arrT[i2].done = !arrT[i2].done;
        await todoPut(env, uid, arrT);
        done({ text: (arrT[i2].done ? '✅ ' : '⬜ ') + arrT[i2].t });
        return true;
      }
      const md2 = /^(del|حذف)\s+(\d+)$/i.exec(a2);
      if (md2) {
        const arrT = await todoGet(env, uid);
        const i2 = +md2[2] - 1;
        if (!arrT[i2]) { send({ t: 'err', msg: L(env, 'm1knzm87') }); return true; }
        const rmT = arrT.splice(i2, 1)[0];
        await todoPut(env, uid, arrT);
        done({ text: L(env, 'm02h4m74', rmT.t) });
        return true;
      }
      const it2 = await todoAdd(env, uid, a2);
      if (!it2) { send({ t: 'err', msg: L(env, 'm06c2j1v') }); return true; }
      done({ text: L(env, 'm1wpozgv', it2.t) });
      return true;
    }
    /* ── v5.4: تسک زمان‌بندی‌شده ── */
    case '/task': {
      const a3 = arg.trim();
      if (!a3 || /^(list|لیست)$/i.test(a3)) {
        const listK = await taskList(env, uid);
        if (!listK.length) { done({ text: L(env, 'm03xtq24') }); return true; }
        done({ text: L(env, 'm0uopnzg', listK.map((t, i) => (i + 1) + '. ' + repeatLabel(env, t.repeat) + ' — ' + String(t.prompt).slice(0, 60)).join('\n')) });
        return true;
      }
      const md3 = /^(del|حذف)\s+(\d+)$/i.exec(a3);
      if (md3) {
        const listK = await taskList(env, uid);
        const t3 = listK[+md3[2] - 1];
        if (!t3) { send({ t: 'err', msg: L(env, 'm1knzm87') }); return true; }
        await taskDel(env, uid, t3.id);
        done({ text: L(env, 'm1nwlaw0') });
        return true;
      }
      const pr3 = parseRemind(a3);
      if (!pr3) { done({ text: L(env, 'm0vjpbwb') }); return true; }
      const listK2 = await taskList(env, uid);
      if (listK2.length >= CFG.TASK_MAX) { send({ t: 'err', msg: L(env, 'm0uvfha0') }); return true; }
      const tt3 = { uid, chat: u.lastChat || String(env.ADMIN_ID), id: 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4), prompt: String(pr3.txt || a3).slice(0, CFG.TASK_PROMPT_MAX), repeat: pr3.repeat || 'none', step: pr3.step, day: pr3.day, at: pr3.at, ts: Date.now() };
      await taskSave(env, tt3);
      done({ text: L(env, 'm14221jq', repeatLabel(env, tt3.repeat), tt3.prompt.slice(0, 120)) });
      return true;
    }
    /* ── v5.4: جستجوی حافظه ── */
    case '/memfind': {
      const qm = arg.trim();
      if (!qm) { done({ text: L(env, 'm1j27vq4') }); return true; }
      const resM = await memSearch(env, uid, qm);
      if (!resM.length) { done({ text: L(env, 'm0kt28mc', qm) }); return true; }
      done({ text: L(env, 'm1xhf763', resM.map((x, i) => (i + 1) + '. ' + (x.tag ? '[' + x.tag + '] ' : '') + x.t).join('\n')) });
      return true;
    }

    case '/translate': {
      if (!toolAvailable(env, 'translate')) return await sendMsg(env, budget, chatId, L(env, 'm0tr_off'));
      if (!q) { done({ text: L(env, 'm0c7cgc4') }); return true; }
      const trLim = await checkDailyLimit(env, uid, u.st);
      if (trLim) { send({ t: 'err', msg: trLim.replace(/\n/g, ' ') }); return true; }
      send({ t: 'status', html: L(env, 'm0anxs2n') });
      try {
        const { msgs } = await buildMessages(env, u.st, scope, null, pick(env, TRANSLATE_SYS, TRANSLATE_SYS_EN), knownCtx(u.st.model), uid);
        msgs.push({ role: 'user', content: q });
        const r = await aiChat(env, u.st.model, msgs, { temperature: 0.2, maxTokens: u.st.maxTokens, ...cbOff(u.st) });
        await bumpUsage(env, uid, est(q) + 800, (r.usage && r.usage.completion_tokens) || est(r.text));
        done({ text: '🌐 ' + r.text, cmd: true });
      } catch (e) {
        await logErr(env, 'app_translate', e);
        send({ t: 'err', msg: String((e && e.message) || L(env, 'm08csxgs')) });
      }
      return true;
    }

    case '/web': {
      const q = arg.trim();
      if (!q) { done({ text: L(env, 'm1dojn9x') }); return true; }
      if (!(env.SEARCH_API_KEY || '').trim()) {
        done({ text: L(env, 'm15g3aah') });
        return true;
      }
      return 'web';
    }
  }

  /* دستورات مخصوص منوی تلگرام — داخل اپ جای دیگری دارند */
  if (['/model', '/settings', '/stats', '/persona', '/prompts', '/providers'].indexOf(cmd) >= 0) {
    done({ text: L(env, 'm089z4rj') });
    return true;
  }
  return false;
}

/* ── هسته چت: عین runChatReply بدون تلگرام؛ خروجی روی SSE ── */
async function appRunChat(env, uid, scope, settings, input, send, opts) {
  const setStatus = (html) => { if (html) send({ t: 'status', html: String(html) }); };
  const fail = (msg) => send({ t: 'err', msg: String(msg) });

  const userText = String(input.text || '');
  const photos = Array.isArray(input.photos)
    ? input.photos.slice(0, CFG.VISION_MAX_N)
        .filter((x) => x && typeof x.b64 === 'string' && typeof x.mime === 'string')
        .map((x) => ({ mime: String(x.mime).slice(0, 40), b64: String(x.b64).slice(0, 4000000) }))
    : [];
  const filePart = input.file && input.file.text
    ? L(env, 'm115nlgh', String(input.file.name || L(env, 'm0abc4ft')).slice(0, 80), String(input.file.text).slice(0, CFG.USER_FILE_INLINE))
    : '';

  setStatus(L(env, 'm1qhftot'));

  /* پیوستن محتوای وب و فایل */
  let content = userText;
  const linkPart = await maybeAttachLinks(env, settings, userText, setStatus);
  if (linkPart) content += linkPart;
  if (filePart) content += filePart;
  try {
    const toolPart = await runPreTools(env, settings, userText, setStatus);
    if (toolPart) content += toolPart;
  } catch (e) { await logErr(env, 'app_pretools', e); }

  if (!content.trim() && !photos.length) { fail(L(env, 'm08zbpvl')); return; }

  const lim = await checkDailyLimit(env, uid, settings);
  if (lim) { fail(lim); return; }

  /* سرچ اجباری /web — عین دستور /web ربات */
  let extraSys = null;
  if (opts.forceWeb) {
    if (!(env.SEARCH_API_KEY || '').trim()) { fail(L(env, 'm0t7ebbc')); return; }
    setStatus(L(env, 'm1yucpp6'));
    try {
      const ans = await tavilySearch(env, opts.forceWeb, CFG.SEARCH_MAX_RESULTS);
      extraSys = L(env, 'm0x828qa', opts.forceWeb.slice(0, 200), ans);
    } catch (e) { await logErr(env, 'app_web', e); fail(L(env, 'm1gq3vo8')); return; }
  }

  /* مدل فعال + سوییچ خودکار به مدل عکس‌فهم */
  let entry = await resolveModel(env, settings.model);
  let visionNote = '';
  if (photos.length && !hasVision(entry)) {
    if (!settings.autoVision) {
      fail(L(env, 'm04i2bvf'));
      return;
    }
    const ve = await pickVisionModel(env, settings.model);
    if (!ve || ve.key === entry.key) { fail(L(env, 'm1s8u5h4')); return; }
    visionNote = L(env, 'm0qan5wf', ve.name);
    entry = ve;
  }

  if (!content.trim() && photos.length) content = L(env, 'm1fqc776');

  const uContent = photos.length ? imgContent(env, content, photos) : content;
  const { msgs } = await buildMessages(env, settings, scope, null, extraSys, entry.ctx, uid);
  msgs.push({ role: 'user', content: uContent });

  /* فراخوانی مدل + استریم زنده + فالبک خودکار — عین ربات */
  let lastDL = 0, lastDT = 0;
  const onDelta = settings.liveStream
    ? (acc) => {
        const now = Date.now();
        if (now - lastDT < 70 && acc.length - lastDL < 60) return;
        lastDT = now; lastDL = acc.length;
        send({ t: 'delta', text: acc });
      }
    : null;

  let r = null;
  try {
    r = await aiChat(env, entry.key, msgs,
      { temperature: settings.temperature, maxTokens: settings.maxTokens, ...cbOff(settings) }, onDelta);
  } catch (e) {
    const msg = String((e && e.message) || L(env, 'm1sreiq9'));
    if (!settings.autoFallback || /binding/i.test(msg) ||
        e.code === 'context' || e.code === 'auth' || e.code === 'nomodel') { fail(msg); return; }
    const alt = entry.prov !== 'p'
      ? (CF_FALLBACK_MODEL !== settings.model
          ? CF_FALLBACK_MODEL
          : (((await getModels(env)).find((m) => m.id !== settings.model) || {}).id || null))
      : CF_FALLBACK_MODEL;
    if (!alt) { fail(msg); return; }
    setStatus(L(env, 'm1ioz4gs', esc(msg), esc(modelName(env, alt))));
    try {
      r = await aiChat(env, alt,
        [{ role: 'system', content: buildSystemPrompt(env, settings) }, ...msgs.slice(1)],
        { temperature: settings.temperature, maxTokens: settings.maxTokens, ...cbOff(settings) });
      r._alt = alt;
    } catch (e2) { fail(String((e2 && e2.message) || L(env, 'm1sreiq9'))); return; }
  }
  if (!r || typeof r.text !== 'string') { fail(L(env, 'm1f7ihn9')); return; }

  /* ذخیره تاریخچه با همان قالب ربات (متن + نشانه عکس) */
  const h = await histGet(env, scope);
  const noteParts = [];
  if (photos.length) noteParts.push(L(env, 'm0hwj8vq', num(photos.length)));
  const histUser = userText || (input.file && input.file.name ? '📎 ' + String(input.file.name).slice(0, 60) : '') || L(env, 'm05xy4it');
  h.msgs.push({ role: 'user', content: [histUser, ...noteParts].filter(Boolean).join(' ') });
  h.msgs.push({ role: 'assistant', content: r.text });
  await histPut(env, scope, h);
  try { await maybeExtractMemory(env, uid, scope, settings); } catch {}
  try { await bumpUsage(env, uid, est(content), (r.usage && r.usage.completion_tokens) || est(r.text)); } catch {}

  const label = (await entryLabel(env, r._alt || entry.key)) + visionNote;
  send({
    t: 'done',
    text: r.text,
    footer: { label: label, tokens: (r.usage && r.usage.completion_tokens) || est(r.text) },
  });
}

/* ═══════════ ویجت‌های هوشمند 🧩 (v4.8) ═══════════
   پرامپت فارسی ← spec JSON (AI با مدل فعال کاربر، وگرنه فالبک کیوردی)
   ← ذخیره در kv wg:<uid> (سقف ۱۲) ← برد شیشه‌ای اپ.
   یادآورها به همان کلیدهای rm: وصل‌اند — کرون همین ورکر به تلگرام هم می‌فرستد. */
const WIDGET_MAX = 12;
const WG_TYPES = ['reminder', 'weather', 'clock', 'countdown', 'note', 'stats', 'list', 'date'];
const WG_SIZES = ['1x1', '2x1', '1x2', '2x2'];
const WG_ACCENTS = ['blue', 'green', 'red'];

const WG_SYS = [
  'تو «مولد ویجت» اپ {{brand}} هستی. خروجی فقط و فقط یک شیء JSON معتبر است — بدون متن اضافه، بدون توضیح، بدون ```.',
  'ساختار دقیق:',
  '{"type":"reminder|weather|clock|countdown|note|stats|list|date","size":"1x1|2x1|1x2|2x2","title":"...","text":"...","at":0,"repeat":"none|daily","refresh":60,"accent":"blue|green|red","items":[]}',
  'قوانین:',
  '- عنوان حداکثر ۳۰ و متن حداکثر ۱۵۰ کاراکتر فارسی؛ اعداد داخل متن‌ها فارسی باشند.',
  '- at فقط برای reminder و countdown: میلی‌ثانیه epoch. اکنون دقیقاً {{NOW}} است (به وقت تهران UTC+3:30). «فردا ساعت ۹» یعنی فردای همین حالا ساعت ۹:۰۰ به وقت تهران.',
  '- یادآوری/هشدار/«یادم بنداز» ← type=reminder؛ تکرار روزانه فقط اگر «هر روز/روزانه» گفتند ← repeat:daily. جشن/سفر/پایان کار ← countdown.',
  '- آب‌وهوا، هوا، دما، نیشابور ← type=weather با refresh:900. ساعت/زمان/ساعت چنده ← clock. تقویم/تاریخ ← date. آمار/مصرف ← stats.',
  '- متن/یادداشت/نقل‌قول ← note. لیست/کارها/چک‌لیست ← list با items حداکثر ۶ تا.',
  '- size: پیش‌فرض 1x1؛ متن بلند یا دو بخشی ← 2x1؛ فهرست بلند ← 1x2؛ مهم و بزرگ ← 2x2.',
  '- accent فقط blue یا green یا red؛ رنگ دیگری نیاور.',
  'نمونه (پرامپت: «فردا ساعت ۹ قرص بخورم»): {"type":"reminder","size":"1x1","title":"یادآور فردا","text":"قرص بخور ⚕️","at":1769137800000,"repeat":"none","refresh":60,"accent":"blue","items":[]}',
  'نمونه («آب و هوا رو نشون بده»): {"type":"weather","size":"2x1","title":"هوای نیشابور","refresh":900,"accent":"green","items":[]}',
  'نمونه («لیست خرید هفته»): {"type":"list","size":"1x2","title":"خرید هفته","items":["شیر","نان","تخم‌مرغ"],"accent":"blue","items":[]}',
].join('\n');

/* EN */
const WG_SYS_EN = [
  'You are the widget generator of the {{brand}} app. The output is exactly one valid JSON object — no extra text, no explanation, no ```.',
  'Exact structure:',
  '{"type":"reminder|weather|clock|countdown|note|stats|list|date","size":"1x1|2x1|1x2|2x2","title":"...","text":"...","at":0,"repeat":"none|daily","refresh":60,"accent":"blue|green|red","items":[]}',
  'Rules:',
  '- Title at most 30 and text at most 150 characters; write in the language of the user prompt.',
  '- at is only for reminder and countdown: epoch milliseconds. Right now is exactly {{NOW}} (Tehran time UTC+3:30). “Tomorrow at 9” means tomorrow at 09:00 Tehran time.',
  '- Reminder/alert/“remind me” ← type=reminder; daily repeat only if they say “every day/daily” ← repeat:daily. Celebration/trip/finish ← countdown.',
  '- Weather/temperature ← type=weather with refresh:900. Clock/time/what time is it ← clock. Calendar/date ← date. Stats/usage ← stats.',
  '- Note/memo/quote ← note. List/tasks/checklist ← list with at most 6 items.',
  '- size: default 1x1; long or two-part text ← 2x1; long list ← 1x2; important and big ← 2x2.',
  '- accent only blue, green or red; no other color.',
  'Example (prompt: “take my pill tomorrow at 9”): {"type":"reminder","size":"1x1","title":"Tomorrow reminder","text":"Take your pill ⚕️","at":1769137800000,"repeat":"none","refresh":60,"accent":"blue","items":[]}',
  'Example (“show the weather”): {"type":"weather","size":"2x1","title":"Weather","refresh":900,"accent":"green","items":[]}',
  'Example (“this week shopping list”): {"type":"list","size":"1x2","title":"This week","items":["Milk","Bread","Eggs"],"accent":"blue"}',
].join('\n');

function wgNewId() {
  return 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

async function wgGet(env, uid) {
  const v = await kvGet(env, 'wg:' + uid, null);
  const items = v && Array.isArray(v.items) ? v.items : [];
  return items.slice(0, WIDGET_MAX);
}

async function wgPut(env, uid, items) {
  await kvPut(env, 'wg:' + uid, { items: items.slice(0, WIDGET_MAX) });
}

/* ── استخراج JSON از خروجی مدل (کد-فنس، متن دور، آرایه‌ها) ── */
function widgetExtractJson(text) {
  let s = String(text == null ? '' : text).trim();
  s = s.replace(/^```(?:json)?/i, '').replace(/```\s*$/i, '').trim();
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a < 0 || b <= a) return null;
  try {
    const o = JSON.parse(s.slice(a, b + 1));
    return o && typeof o === 'object' && !Array.isArray(o) ? o : null;
  } catch (e) { return null; }
}

/* ── سانیتایزر سمت سرور: انوم‌ها، کلمپ رشته‌ها، ساعت‌ها ── */
function widgetSanitize(env, raw, id) {
  const o = raw && typeof raw === 'object' ? raw : {};
  const type = WG_TYPES.indexOf(String(o.type)) >= 0 ? String(o.type) : 'note';
  const size = WG_SIZES.indexOf(String(o.size)) >= 0 ? String(o.size) : '1x1';
  const accent = WG_ACCENTS.indexOf(String(o.accent)) >= 0 ? String(o.accent) : 'blue';
  const clean = (v, n) => String(v == null ? '' : v)
    .replace(/[\u0000-\u001F\u007F<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, n);
  const timed = type === 'reminder' || type === 'countdown';
  let at = 0;
  if (timed && typeof o.at === 'number' && isFinite(o.at) && Math.abs(o.at - Date.now()) < 10 * 365 * 86400000) {
    at = Math.round(o.at);
  }
  if (timed && !at) at = Date.now() + (type === 'countdown' ? 7 * 86400000 : 3600000);
  let refresh = 60;
  if (typeof o.refresh === 'number' && isFinite(o.refresh)) {
    refresh = Math.min(3600, Math.max(15, Math.round(o.refresh)));
  } else if (type === 'weather') {
    refresh = 900;
  }
  const items = Array.isArray(o.items)
    ? o.items.slice(0, 6).map((x) => clean(x, 60)).filter(Boolean)
    : [];
  return {
    id: String(id || wgNewId()).slice(0, 24),
    type: type,
    size: size,
    accent: accent,
    title: clean(o.title, 30) || L(env, 'm1f8p06f'),
    text: clean(o.text, 150),
    at: at,
    repeat: o.repeat === 'daily' ? 'daily' : 'none',
    refresh: refresh,
    items: items,
    remKey: '',
    ts: 0,
    up: 0,
  };
}

/* ── پیوند یادآور ویجت با کلیدهای rm: همان ربات (کرون + تلگرام) ── */
async function wgSyncReminder(env, uid, u, spec, remove) {
  const old = String(spec.remKey || '');
  const drop = async () => {
    if (!old) { spec.remKey = ''; return; }
    const v = await kvGet(env, old, null);
    if (v && String(v.uid) === uid) await kvDel(env, old);
    spec.remKey = '';
  };
  if (remove) { await drop(); return; }
  if (spec.type !== 'reminder' || !spec.at) {
    if (old) await drop();
    return;
  }
  // یادآور یک‌باره خیلی گذشته ← کلید نساز (ویجت حالت «رسید» را خودش نشان می‌دهد)
  if (spec.repeat !== 'daily' && spec.at < Date.now() - 60000) {
    if (old) await drop();
    return;
  }
  const txt = (((spec.title || '') + (spec.text ? ' — ' + spec.text : ''))
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300)) || L(env, 'm011jgxy');
  let at = spec.at;
  if (spec.repeat === 'daily' && at <= Date.now()) at += 86400000; // امروز گذشته ← فردا همین ساعت
  const k = old || ('rm:' + hash32(uid + spec.at + Math.random()));
  const ttl = Math.max(60, Math.ceil((at - Date.now()) / 1000) + 120);
  await kvPut(env, k, {
    uid: uid,
    chat: u.lastChat || env.ADMIN_ID,
    at: at,
    txt: txt,
    repeat: spec.repeat === 'daily' ? 'daily' : 'none',
  }, ttl);
  spec.remKey = k;
}

/* ── داده آب‌وهوا به‌صورت ساختاریافته (برای رندرر ویجت) ── */
async function widgetWeather(env) {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + CFG.WEATHER_LAT + '&longitude=' + CFG.WEATHER_LON + '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTehran&forecast_days=2';
  const res = await fetchT(url, {}, 15000);
  if (!res.ok) throw new Error(L(env, 'm0snzrp4'));
  const js = await res.json();
  const c = js.current || {};
  const d = js.daily || {};
  return {
    t: c.temperature_2m,
    hum: c.relative_humidity_2m,
    code: c.weather_code,
    wind: c.wind_speed_10m,
    hi: (d.temperature_2m_max || [])[0],
    lo: (d.temperature_2m_min || [])[0],
    pop: (d.precipitation_probability_max || [])[0],
    hi2: (d.temperature_2m_max || [])[1],
    lo2: (d.temperature_2m_min || [])[1],
    pop2: (d.precipitation_probability_max || [])[1],
    city: L(env, 'm03g58op'),
    at: Date.now(),
  };
}

/* ── فالبک بدون AI: از روی کیورد/regex همان spec را می‌سازد ── */
function widgetFallbackSpec(env, prompt, nowMs) {
  const base = { type: 'note', size: '1x1', title: '', text: '', at: 0, repeat: 'none', refresh: 60, accent: 'blue', items: [] };
  const s = String(prompt || '').replace(/\s+/g, ' ').trim();
  if (!s) { base.title = L(env, 'm0172fa1'); return base; }
  if (/آب\s*و\s*هوا|هوای|هواشناس|دمای/.test(s)) {
    return Object.assign(base, { type: 'weather', size: '2x1', title: L(env, 'm1m4c883'), accent: 'green', refresh: 900 });
  }
  if (/آمار|مصرف|توکن/.test(s)) {
    return Object.assign(base, { type: 'stats', size: '1x1', title: L(env, 'm0zl2rxs'), accent: 'red' });
  }
  const n = s.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  const remind = /یادآور|یادم|یاد\s*بده|یادآوری|هشدار|remind/i.test(n);
  const tmatch = /(^|\s)(ساعت|فردا|امروز|\d{1,2}:\d{2})/.test(n) && /\d/.test(n);
  if (remind || tmatch) {
    const daily = /روزانه|هر\s*روز|هرروز/.test(n);
    const tomorrow = /فردا/.test(n);
    const rest = n
      .replace(/روزانه|هر\s*روز|هرروز|فردا|امروز|ساعت|به\s*من|به\s*منم|یادآوری?\s*(?:کن|بکن)?|یادم\s*بند?از|یاد\s*بده|هشدار\s*(?:بده|کن)?/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const hm = rest.match(/^(\d{1,2})(?::(\d{2}))?\s*(صبح|عصر|شب)?\s*(.*)$/);
    if (hm) {
      let h = +hm[1];
      const min = hm[2] != null ? +hm[2] : 0;
      const part = hm[3] || '';
      if (part === 'عصر' && h < 12) h += 12;
      if (part === 'شب' && h < 12) h += 12;
      if (h <= 23 && min <= 59) {
        const txt = (hm[4] || '').replace(/\s+/g, ' ').trim() || s;
        const t = tehran();
        let at = tehranToEpoch(t.y, t.m, t.d + (tomorrow ? 1 : 0), h, min);
        if (!tomorrow && at <= nowMs && remind) at += 86400000;
        return Object.assign(base, {
          type: 'reminder',
          size: '1x1',
          title: daily ? L(env, 'm0cfn323') : L(env, 'm011jgxy'),
          text: txt.slice(0, 150),
          at: at,
          repeat: daily ? 'daily' : 'none',
          accent: 'blue',
        });
      }
    }
  }
  if (/لیست|چک.?لیست|کارهای/.test(s)) {
    return Object.assign(base, { size: '1x2', title: L(env, 'm0mk6fps'), text: s.replace(/^لیست\s*/i, '').slice(0, 150) });
  }
  if (/^ساعت|^زمان|ساعت چنده|الانچند|چند ساعت/.test(n)) {
    return Object.assign(base, { type: 'clock', size: '1x1', title: L(env, 'm03bydy7'), accent: 'blue' });
  }
  if (/تقویم|تاریخ|روز چند/.test(n)) {
    return Object.assign(base, { type: 'date', size: '2x1', title: L(env, 'm06bt1d9'), accent: 'green' });
  }
  return Object.assign(base, { title: L(env, 'm0172fa1'), text: s.slice(0, 150) });
}

/* ── مسیر اصلی: AI با مدل فعال کاربر ← در نبود/خطا، فالبک کیوردی ── */
async function widgetAiSpec(env, u, prompt) {
  const nowMs = Date.now();
  try {
    if (env.AI && typeof env.AI.run === 'function') {
      const t = tehran();
      const sys = pick(env, WG_SYS, WG_SYS_EN).replace('{{NOW}}',
        t.h + ':' + String(t.min).padStart(2, '0') + ' ' + pick(env, WD_FA, WD_EN)[t.w] + ' ' +
        t.y + '/' + t.m + '/' + t.d + ' (epoch ' + nowMs + ')');
      const r = await aiChat(env, u.st.model || CF_FALLBACK_MODEL, [
        { role: 'system', content: sys },
        { role: 'user', content: prompt },
      ], { temperature: 0.15, maxTokens: 700, ...cbOff(u.st) });
      const js = widgetExtractJson(r && r.text);
      if (js) return { spec: js, src: 'ai' };
    }
  } catch (e) { await logErr(env, 'widget_ai', e); }
  return { spec: widgetFallbackSpec(env, prompt, nowMs), src: 'fast' };
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 22-handlers
   نقطهٔ ورود Worker + dispatch + callback‌ها + پیام‌ها/دستورات
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ نقطه ورود Worker ═══════════════════ */
export default {
  async fetch(request, env, ctx) {
    try { return await handleFetch(request, env, ctx); }
    catch (e) { console.error('fetch', e && e.message); return new Response('error', { status: 500 }); }
  },
  async scheduled(controller, env, ctx) {
    try { await cronTick(env); } catch (e) { await logErr(env, 'cron', e); }
  },
};

function htmlRes(s, status) {
  return new Response(s, { status: status || 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function handleFetch(request, env, ctx) {
  const url = new URL(request.url);
  env._dashUrl = url.origin + '/dashboard';
  env._dashChat = String(env.ADMIN_ID);
  env._dashChatId = String(env.ADMIN_ID);
  if (env._lang == null) env._lang = 'fa';

  /* اپ اندروید (v4.7): پوسته /app و لایه API /api/v1 — پیش از مسیرهای داشبورد */
  if (url.pathname === '/app' || url.pathname.startsWith('/app/')) return appAsset(env, url);
  if (url.pathname.startsWith('/api/v1/')) return appApiHandler(env, request);

  /* وب‌داشبورد */
  if (url.pathname === '/dashboard') {
    const pw = env.DASHBOARD_PASSWORD || '';
    const meth = (request.method || 'GET').toUpperCase();

    /* POST ← ورود. رمز دیگر هرگز در URL نمی‌آید؛ کوکی HttpOnly ساخته میشود. */
    if (meth === 'POST') {
      if (!pw) return htmlRes(dashLoginPage(L(env, 'm1b0wm64')), 503);
      const rl = await dashRateLimited(env, request);
      if (!rl.ok) return htmlRes(dashLoginPage(L(env, 'm07h1ysm', Math.ceil((rl.W - (rl.now - rl.ts)) / 60000))), 429);
      let form = '';
      try { form = await request.text(); } catch {}
      let got = '';
      try { // ورودی خراب (مثلاً %ZZ) نباید ۵۰۰ خام بدهد؛ فقط «رمز نادرست»
        got = decodeURIComponent((String(form).match(/(?:^|&)pw=([^&]*)/) || [, ''])[1].replace(/\+/g, ' '));
      } catch {}
      if (!safeEq(got, pw)) {
        await kvPut(env, rl.lk, { n: rl.n + 1, ts: rl.n ? rl.ts : rl.now }, CFG.LOGIN_WINDOW_S);
        return htmlRes(dashLoginPage(L(env, 'm0o7tsjn')), 401);
      }
      await kvDel(env, rl.lk);
      const b = new Uint8Array(24);
      crypto.getRandomValues(b);
      let tk = '';
      for (let i = 0; i < b.length; i++) tk += b[i].toString(16).padStart(2, '0');
      await kvPut(env, 'dsk:' + tk, { uid: String(env.ADMIN_ID), at: Date.now() }, 30 * 86400);
      return new Response('', {
        status: 302,
        headers: {
          'Location': '/dashboard',
          'Set-Cookie': 'dsh=' + tk + '; Path=/; HttpOnly; SameSite=Strict; Max-Age=' + (30 * 86400) + (url.protocol === 'https:' ? '; Secure' : ''),
        },
      });
    }

    if (!(await dashAuthed(env, request))) return htmlRes(dashLoginPage(env));
    try { // وضعیت وب‌هوک برای نمایش در داشبورد
      const r = await fetchT(TG_BASE + '/bot' + env.TELEGRAM_BOT_TOKEN + '/getWebhookInfo', { method: 'POST' }, 8000);
      if (r.ok) {
        const js = await r.json();
        env._whInfo = js && js.result && js.result.url ? L(env, 'm1a4onem') : L(env, 'm03rkab0');
      } else env._whInfo = L(env, 'm0782kha');
    } catch { env._whInfo = L(env, 'm0782kha'); }
    return htmlRes(dashAppPage(env));
  }
  if (url.pathname.startsWith('/api/')) return dashApiHandler(env, request);

  if (url.pathname === '/') {
    return htmlRes(L(env, 'm0d4q0q5'));
  }

  /* وب‌هوک تلگرام — امنیت با Secret، پاسخ سریع، کار سنگین در پس‌زمینه */
  if (url.pathname === '/webhook') {
    if (env.WEBHOOK_SECRET && !safeEq(request.headers.get('X-Telegram-Bot-Api-Secret-Token'), env.WEBHOOK_SECRET)) {
      return new Response('forbidden', { status: 403 });
    }
    let upd = null;
    try { upd = await request.json(); } catch {}
    if (ctx) ctx.waitUntil(processUpdate(env, upd).catch((e) => logErr(env, 'update_top', e)));
    else await processUpdate(env, upd).catch((e) => logErr(env, 'update_top', e));
    return jsonRes({ ok: true });
  }

  return new Response('not found', { status: 404 });
}

/* ═══════════════════ پردازش آپدیت‌ها ═══════════════════ */
async function processUpdate(env, upd) {
  if (!upd) return;
  /* زبانِ پیش‌فرضِ امن برای پیام‌های پیش از شناخته‌شدنِ کاربر (ناشناس/دسترسی‌ندارد) */
  if (env._lang == null) env._lang = 'fa';
  try {
    if (upd.callback_query) return await onCallback(env, upd);
    if (upd.message) return await onMessage(env, upd.message);
    if (upd.inline_query) return await onInlineQuery(env, upd);
    if (upd.chosen_inline_result) return await onChosenInline(env, upd.chosen_inline_result);
  } catch (e) { await logErr(env, 'update', e); }
}

/* ═══════════════════ دکمه‌ها (callback_query) ═══════════════════ */
async function onCallback(env, upd) {
  const cb = upd.callback_query;
  const chatId = cb.message ? cb.message.chat.id : cb.from.id;
  const uid = String(cb.from.id);
  const budget = newBudget(CFG.TG_BUDGET_MSG);

  if (!(await isAllowed(env, uid))) {
    /* این پیام فقط به کاربرِ ناشناس می‌رسد → زبانِ پیش‌فرضِ ثابت */
    env._lang = (await _langOf(env, uid)) || 'fa';
    await answerCb(env, budget, cb.id, L(env, 'm1k15sil'));
    return;
  }

  const data = String(cb.data || '');
  const msgId = cb.message ? cb.message.message_id : null;
  env._menuMsg = msgId;
  await answerCb(env, budget, cb.id);

  const u = await getUser(env, uid);
  const st = u.st;

  /* ── ساده‌ها ── */
  if (data === 'close') {
    if (msgId) { try { await tg(env, budget, 'deleteMessage', { chat_id: chatId, message_id: msgId }); } catch {} }
    return;
  }
  if (data === 'noop') return;
  if (data === 'home') { if (u.wait) { u.wait = null; await putUser(env, uid, u); } return await mainMenu(env, budget, chatId, uid); }
  if (data === 'navback') {
    if (u.wait) { u.wait = null; await putUser(env, uid, u); }
    const st = _nav.get(chatId) || [];
    st.pop(); // صفحهٔ جاری را بگذار کنار
    const prev = st[st.length - 1];
    if (!prev) { _nav.set(chatId, st); return await mainMenu(env, budget, chatId, uid); }
    /* صفحهٔ قبلی یک پیام چت است → همان متن و همان کلید را بازگردان */
    if (prev.s === 'chat' && prev.txt != null) {
      try { await editMsg(env, budget, chatId, msgId, prev.txt, prev.kb); }
      catch { const m = await sendMsg(env, budget, chatId, prev.txt, prev.kb); env._menuMsg = m.message_id; }
      return;
    }
    st.pop(); // منو را از پشته بردار تا menuRender دوباره بگذاردش
    _nav.set(chatId, st);
    return await navRestore(env, budget, chatId, uid, prev.s);
  }
  if (data === 'help') return sendMsg(env, budget, chatId, pick(env, HELP_TEXT, HELP_TEXT_EN));

  /* ── سرویس‌های کاستوم 🔌 (فقط مدیر) ── */
  if (data === 'pv' || data.startsWith('pv')) {
    if (!(await isAdmin(env, uid))) return sendMsg(env, budget, chatId, L(env, 'm152h8p6'));
    if (data === 'pv') return await providersMenu(env, budget, chatId);
    if (data === 'pvnew') {
      const many = await provAll(env);
      if (many.length >= CFG.MAX_PROVIDERS) return sendMsg(env, budget, chatId, L(env, 'm0tis57h', CFG.MAX_PROVIDERS));
      return await pvAsk(env, budget, chatId, uid, u, 'pv_name', {});
    }
    const pvArg = data.slice(2); // '<head>:<rest>' (حذف 'pv')
    const head = pvArg.split(':')[0];
    const rest = pvArg.slice(head.length + 1);
    if (head === 'o' && PID_RE.test(rest)) return await providerPage(env, budget, chatId, rest);
    if (head === 'kk' && PID_RE.test(rest)) return await providerKeysPage(env, budget, chatId, rest);
    if (head === 'kadd' && PID_RE.test(rest)) {
      const rec = await provGet(env, rest);
      if (!rec) return providersMenu(env, budget, chatId);
      if (provKeysOf(rec).length >= CFG.KEYS_PER_PROVIDER) { await answerCb(env, budget, cb.id, L(env, 'm0swb6sa', CFG.KEYS_PER_PROVIDER)); await sendMsg(env, budget, chatId, L(env, 'm1t4fx2o', CFG.KEYS_PER_PROVIDER)); return await providerKeysPage(env, budget, chatId, rest); }
      return await pvAsk(env, budget, chatId, uid, u, 'pv_addkey', { pid: rest });
    }
    if (head === 'kdel' && PID_RE.test(rest)) {
      const idx = parseInt(data.split(':')[2], 10);
      const rec = await provGet(env, rest);
      if (!rec) return providersMenu(env, budget, chatId);
      const keys = provKeysOf(rec);
      if (!(idx >= 0 && idx < keys.length)) return await providerKeysPage(env, budget, chatId, rest);
      /* درست‌کردن هر دو فیلد keys و key — تا هیچ مسیر خواندنی قدیمی نشکند */
      const removed = keys[idx];
      keys.splice(idx, 1);
      rec.keys = keys.slice(0, CFG.KEYS_PER_PROVIDER);
      rec.key = rec.keys[0] || '';
      await provPut(env, rec);
      await answerCb(env, budget, cb.id, removed ? L(env, 'm1rkc7e1', EMOJI.ok, idx + 1) : L(env, 'm0vpitua'));
      return await providerKeysPage(env, budget, chatId, rest);
    }
    if (head === 'hp' && PID_RE.test(rest)) {
      /* تست سلامت یک سرویس مشخص (از دکمهٔ صفحهٔ کلیدها) */
      const rec = await provGet(env, rest);
      if (!rec) return providersMenu(env, budget, chatId);
      await answerCb(env, budget, cb.id, L(env, 'm0b7on10'));
      const tp = startTyping(env, chatId);
      try {
        const r = await provProbe(env, rec);
        const txtP = L(env, 'm08ta3de', esc(rec.name), provProbeLine(env, rec.name, r, provKeysOf(rec).length), esc(rec.base || '—'), pKeysTxt(env, provKeysOf(rec)));
        const kbP = [[{ text: L(env, 'm0ppor7n'), callback_data: 'pvhp:' + rest }, { text: L(env, 'm138mkur'), callback_data: 'pvkk:' + rest }],
          [{ text: L(env, 'm1yfp2py'), callback_data: 'pv' }, { text: '✖️', callback_data: 'close' }]];
        await menuRender(env, budget, chatId, txtP, kbP, 'pvhp:' + rest);
      } catch (e) { await logErr(env, 'pvhp', e); await sendMsg(env, budget, chatId, L(env, 'm16ywyfe', EMOJI.err)); }
      finally { tp.stop = true; }
      return;
    }
    if (head === 'rk' && PID_RE.test(rest)) return await providerKeysPage(env, budget, chatId, rest);
    if ((head === 'rn' || head === 'ru') && PID_RE.test(rest)) {
      const wt = head === 'rn' ? 'pv_rename' : 'pv_reurl';
      return await pvAsk(env, budget, chatId, uid, u, wt, { pid: rest });
    }
    if (head === 'addm' && PID_RE.test(rest)) return await pvAsk(env, budget, chatId, uid, u, 'pv_manual', { pid: rest });
    if (head === 'scan' && PID_RE.test(rest)) {
      const rec = await provGet(env, rest);
      if (!rec) return providersMenu(env, budget, chatId);
      await answerCb(env, budget, cb.id, L(env, 'm00ddzyp'));
      const res = await discoverModels(env, rec.base, rec.key);
      if (!res.ok) return sendMsg(env, budget, chatId, L(env, 'm1ejcoip', EMOJI.err, pick(env, DISCO_FAIL_TEXT, DISCO_FAIL_TEXT_EN)[res.code] || res.code));
      if (res.base !== rec.base) { rec.base = res.base; await provPut(env, rec); }
      await kvPut(env, 'pvr:' + rec.pid, { items: res.items, t: Date.now() }, CFG.DISCO_TTL);
      return await renderPick(env, budget, chatId, rec.pid, 0, msgId);
    }
    if (head === 'madd') { // افزودن یک مدل کاوش‌شده (h = hash32('pid:id'))
      const key = await kvGet(env, 'mh:' + rest, null);
      const p = parseModelKey(key);
      if (p.prov !== 'p') { await answerCb(env, budget, cb.id, L(env, 'm0bu4xi0')); return sendMsg(env, budget, chatId, L(env, 'm1e149se')); }
      const rec = await provGet(env, p.pid);
      if (!rec) return providersMenu(env, budget, chatId);
      if ((rec.models || []).some((m) => m.id === p.id)) { await answerCb(env, budget, cb.id, L(env, 'm05db4i8')); return; }
      if ((rec.models || []).length >= CFG.MAX_MODELS_PER_PROVIDER) { await answerCb(env, budget, cb.id, L(env, 'm0zurdar')); return sendMsg(env, budget, chatId, L(env, 'm1qjb97j', CFG.MAX_MODELS_PER_PROVIDER)); }
      const rr = await kvGet(env, 'pvr:' + p.pid, null);
      const found = rr && (rr.items || []).find((x) => x.id === p.id);
      const n = await mergeModels(env, rec, [{ id: p.id, ctx: found && found.ctx, src: 'disc' }]);
      await answerCb(env, budget, cb.id, n ? L(env, 'm07pehx1', EMOJI.ok, rec.models.length, CFG.MAX_MODELS_PER_PROVIDER)  : L(env, 'm0782kha'));
      const page = rr ? Math.floor(Math.max(0, (rr.items || []).findIndex((x) => x.id === p.id)) / CFG.PICK_PAGE) : 0;
      return await renderPick(env, budget, chatId, p.pid, page, msgId);
    }
    if (head === 'pg') { // pvpg:<pid>:<n>
      const pid = pvArg.split(':')[1];
      const n = +(pvArg.split(':')[2]) || 0;
      if (PID_RE.test(pid)) return await renderPick(env, budget, chatId, pid, n, msgId);
      return;
    }
    if (head === 'man' && PID_RE.test(rest)) return await pvAsk(env, budget, chatId, uid, u, 'pv_manual', { pid: rest });
    if (head === 'mend' && PID_RE.test(rest)) { await kvDel(env, 'pvr:' + rest); return await providerPage(env, budget, chatId, rest); }
    if (head === 'mx') { // حذف یک مدل از سرویس
      const key = await kvGet(env, 'mh:' + rest, null);
      const p = parseModelKey(key);
      if (p.prov !== 'p') return answerCb(env, budget, cb.id, L(env, 'm0z98t31'));
      const rec = await provGet(env, p.pid);
      if (!rec) return providersMenu(env, budget, chatId);
      await removeModel(env, rec, p.id);
      await answerCb(env, budget, cb.id, L(env, 'm0b4rjyg', EMOJI.ok));
      return await providerPage(env, budget, chatId, p.pid);
    }
    if (head === 'xc') { // تنظیم کانتکست یک مدل
      const key = await kvGet(env, 'mh:' + rest, null);
      const p = parseModelKey(key);
      if (p.prov !== 'p') return answerCb(env, budget, cb.id, L(env, 'm1fa3cu9'));
      return await pvAsk(env, budget, chatId, uid, u, 'pv_ctx', { key: p.pid + ':' + p.id });
    }
    if (head === 'vis') { // 👁 روشن/خاموش‌کردن عکس‌فهم یک مدل کاستوم
      const key = await kvGet(env, 'mh:' + rest, null);
      const p = parseModelKey(key);
      if (p.prov !== 'p') return answerCb(env, budget, cb.id, L(env, 'm0z98t31'));
      const rec = await provGet(env, p.pid);
      if (!rec) return providersMenu(env, budget, chatId);
      const me = (rec.models || []).find((x) => x.id === p.id);
      if (!me) { await answerCb(env, budget, cb.id, L(env, 'm0ybfzvs')); return sendMsg(env, budget, chatId, L(env, 'm040gipl')); }
      me.vision = !me.vision;
      await provPut(env, rec);
      await answerCb(env, budget, cb.id, me.vision ? L(env, 'm16x2fb5', EMOJI.ok) : L(env, 'm0oi7qii'));
      return await providerPage(env, budget, chatId, p.pid);
    }
    if (head === 'rm' && PID_RE.test(rest)) {
      const rec = await provGet(env, rest);
      if (!rec) return providersMenu(env, budget, chatId);
      const txt = L(env, 'm1t6cbxs', esc(rec.name), (rec.models || []).length);
      const kb = [[{ text: L(env, 'm1kb3y6a'), callback_data: 'pvrm2:' + rest }, { text: L(env, 'm1ihcuh8'), callback_data: 'pvo:' + rest }]];
      try { await editMsg(env, budget, chatId, msgId, txt, kb); } catch { await sendMsg(env, budget, chatId, txt, kb); }
      return;
    }
    if (head === 'rm2' && PID_RE.test(rest)) {
      const n = await deleteProvider(env, rest);
      await sendMsg(env, budget, chatId, L(env, 'm1glo0hc', EMOJI.ok, n ? ' — ' + n + L(env, 'm1smnzzx') : ''));
      return await providersMenu(env, budget, chatId);
    }
    return answerCb(env, budget, cb.id, L(env, 'm0782kha'));
  }

  /* ── مدل‌ها ── */
  if (data.startsWith('mm:')) { return await showModels(env, budget, chatId, +(data.split(':')[1]) || 0); }
  if (data.startsWith('mp:')) { return await showModels(env, budget, chatId, +(data.split(':')[1]) || 0); }
  if (data === 'mref') { await answerCb(env, budget, cb.id, L(env, 'm0bpj753')); return await showModels(env, budget, chatId, 0, true); }
  if (data.startsWith('ms:')) {
    const e = await resolveModelByHash(env, data.slice(3));
    if (!e) { await answerCb(env, budget, cb.id, L(env, 'm1w21uqe')); return sendMsg(env, budget, chatId, L(env, 'm040gipl')); }
    st.model = e.key;
    await putUser(env, uid, u);
    await sendMsg(env, budget, chatId,
      L(env, 'm1mtnwic', EMOJI.ok, esc(e.name), e.prov === 'cf' ? L(env, 'm1xi1wad') : '🔌 ' + esc(e.provName), num(Math.round(e.ctx / 1000))));
    return await mainMenu(env, budget, chatId, uid);
  }

  /* ── تنظیمات ── */
  if (data === 'set') return await settingsMenu(env, budget, chatId, uid);
  if (data.startsWith('st:')) {
    const k = data.slice(3);
    if (k.startsWith('lang:')) {
      st.lang = k.endsWith(':en') ? 'en' : 'fa';
      env._lang = st.lang;
      await putUser(env, uid, u);
      return await settingsMenu(env, budget, chatId, uid);
    }
    if (k === 't+') st.temperature = Math.min(2, +(st.temperature + 0.1).toFixed(1));
    if (k === 't-') st.temperature = Math.max(0, +(st.temperature - 0.1).toFixed(1));
    if (k === 'm+') st.maxTokens = Math.min(8192, st.maxTokens + 512);
    if (k === 'm-') st.maxTokens = Math.max(256, st.maxTokens - 512);
    if (k === 'fb') st.autoFallback = !st.autoFallback;
    if (k === 'ls') st.liveStream = !st.liveStream;
    if (k === 'rl') st.readLinks = !st.readLinks;
    if (k === 'av') st.autoVision = !st.autoVision;
    if (k === 'vr') st.voiceReply = !st.voiceReply;
    if (k === 'br') st.briefing = !st.briefing;
    if (k === 'sa') st.searchAuto = !st.searchAuto;
    if (k === 'ig') st.imgGen = st.imgGen === false;
    if (k === 'if') st.imgFree = st.imgFree === false;
    if (k === 'ie') st.imgEdit = st.imgEdit === false;
    if (k === 'nl') st.nlRemind = st.nlRemind === false;
    if (k === 'ma') st.memAuto = st.memAuto === false;
    if (k === 'wb') st.weeklyBackup = st.weeklyBackup === false;
    if (k === 'cb') st.cbBreaker = st.cbBreaker === false;
    if (k === 'yt') st.ytSum = st.ytSum === false;
    if (k === 'igm') {
      // چرخ بین مدل‌های تولید تصویر
      const ix = GEM_IMG_MODELS.findIndex((m) => m.id === st.imgModel);
      st.imgModel = GEM_IMG_MODELS[(ix + 1 + GEM_IMG_MODELS.length) % GEM_IMG_MODELS.length].id;
    }
    if (k === 'dl') { u.wait = { type: 'dl', ts: Date.now() }; await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm18za59v')); }
    if (k === 'sys') { u.wait = { type: 'sys', ts: Date.now() }; await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm178g1ea')); }
    await putUser(env, uid, u);
    return await settingsMenu(env, budget, chatId, uid);
  }

  /* ── حافظه بلندمدت v4.5 ── */
  if (data === 'mem') { await memMenu(env, budget, chatId, uid); return; }
  if (data === 'memadd') { u.wait = { type: 'memadd', ts: Date.now() }; await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm08po0h6')); }
  if (data === 'memedit') { u.wait = { type: 'memedit', ts: Date.now() }; await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm02pgq4y')); }
  if (data === 'memdelall') { await memPut(env, uid, []); await answerCb(env, budget, cb.id, L(env, 'm1ubu2n2')); return await memMenu(env, budget, chatId, uid); }
  if (data.startsWith('memdel:')) {
    await memDel(env, uid, data.slice(7));
    await answerCb(env, budget, cb.id, L(env, 'm0i9xl7k'));
    u.wait = null;
    const arr = await memGet(env, uid);
    let txt = L(env, 'm0t2bz6p', arr.length, arr.length ? arr.map((x, i) => (i + 1) + '. ' + esc(x.t)).join('\n') : L(env, 'm1ihkad4'));
    const kb = arr.slice(-10).map((x) => [{ text: '🗑 ' + x.t.slice(0, 26), callback_data: 'memdel:' + x.id }]);
    kb.push([{ text: L(env, 'm1t3qh5r'), callback_data: 'set' }]);
    await menuRender(env, budget, chatId, txt, kb, 'mem');
    return;
  }

  /* ── صدا v4.6 ── */
  if (data === 'voice') return await voiceMenu(env, budget, chatId, uid, 0);
  if (data.startsWith('vvc:')) return await voiceMenu(env, budget, chatId, uid, +(data.split(':')[1]) || 0);
  if (data.startsWith('vprov:')) {
    const v = data.split(':')[1];
    if (v === 'google' || v === 'cf') { st.voiceProv = v; await putUser(env, uid, u); }
    if (v === 'google' && !gemKey(env)) await answerCb(env, budget, cb.id, L(env, 'm0k2awem'));
    return await voiceMenu(env, budget, chatId, uid, 0);
  }
  if (data.startsWith('vmdl:')) {
    const i = +data.split(':')[1];
    if (GEM_TTS_MODELS[i]) { st.ttsModel = GEM_TTS_MODELS[i].id; await putUser(env, uid, u); }
    return await voiceMenu(env, budget, chatId, uid, 0);
  }
  if (data === 'vstt') {
    // چرخ بین همه‌ی مدل‌های فهم ویس (فقط بین دو تا نمی‌چرخد)
    const ix = GEM_STT_MODELS.findIndex((m) => m.id === st.sttModel);
    st.sttModel = GEM_STT_MODELS[(ix + 1 + GEM_STT_MODELS.length) % GEM_STT_MODELS.length].id;
    await putUser(env, uid, u);
    return await voiceMenu(env, budget, chatId, uid, 0);
  }
  if (data.startsWith('vset:')) {
    const v = data.slice(5);
    if (GEM_VOICES.includes(v)) { st.voiceName = v; await putUser(env, uid, u); await answerCb(env, budget, cb.id, L(env, 'm0xbu9ms', v)); }
    const per = CFG.VOICE_PAGE;
    const pg = Math.floor(Math.max(0, GEM_VOICES.indexOf(st.voiceName)) / per);
    return await voiceMenu(env, budget, chatId, uid, pg);
  }
  if (data === 'vtest') {
    await answerCb(env, budget, cb.id, L(env, 'm0pjrxci'));
    const ok = await sendVoiceReply(env, budget, chatId, L(env, 'm1tqybd0', st.voiceName || 'Kore'), { ...st, voiceReply: true, voiceProv: 'google' });
    if (!ok) await sendMsg(env, budget, chatId, L(env, 'm0zk2lt7'));
    return;
  }

  /* ── شخصیت‌ها ── */
  if (data === 'ps') return await personaMenu(env, budget, chatId, uid);
  if (data.startsWith('pc:')) {
    const i = +data.split(':')[1];
    if (PERSONAS[i]) { st.persona = i; st.sysCustom = ''; await putUser(env, uid, u); }
    return await personaMenu(env, budget, chatId, uid);
  }

  /* ── گفتگوهای چندگانه ── */
  if (data === 'th') return await threadsMenu(env, budget, chatId, uid);
  if (data.startsWith('tsel:')) { u.thread = data.slice(5); await putUser(env, uid, u); return await threadsMenu(env, budget, chatId, uid); }
  if (data === 'tnew') {
    const n = L(env, 'm1erlebc', u.threads.length + 1);
    u.threads.push({ id: 't' + Date.now().toString(36), name: n, ts: Date.now() });
    /* auto ست نمیشود — بعد از اولین پیام autoTitle نامش را عوض میکند */
    if (u.threads.length > CFG.THREAD_MAX) u.threads.shift();
    u.thread = u.threads[u.threads.length - 1].id;
    await putUser(env, uid, u);
    return await threadsMenu(env, budget, chatId, uid);
  }
  if (data.startsWith('tdel:')) {
    const tid = data.slice(5);
    if (tid !== 'main') {
      u.threads = u.threads.filter((x) => x.id !== tid);
      if (u.thread === tid) u.thread = 'main';
      await kvDel(env, 'h:c' + chatId + ':' + tid);
      await putUser(env, uid, u);
    }
    return await threadsMenu(env, budget, chatId, uid);
  }
  if (data === 'threset') {
    const sc = scopeOf(chatId, u, ['group', 'supergroup'].includes((cb.message || {}).chat ? cb.message.chat.type : 'private'));
    await kvPut(env, 'h:' + sc, { msgs: [], used: 0 });
    return sendMsg(env, budget, chatId, L(env, 'm0g83ila', EMOJI.ok));
  }

  /* ── پرامپت‌ها ── */
  if (data === 'pl') return await promptsMenu(env, budget, chatId, uid);
  if (data === 'panew') { u.wait = { type: 'panew', ts: Date.now() }; await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm0g6qwas')); }
  if (data === 'pdelall') { u.pl = []; await putUser(env, uid, u); return await promptsMenu(env, budget, chatId, uid); }
  if (data.startsWith('pu:')) {
    const kk = data.slice(3);
    const p = (u.pl || []).find((x) => x.k === kk);
    if (!p) return;
    const scope = scopeOf(chatId, u, false);
    return await runChatReply(env, budget, chatId, uid, scope, st, p.v, {});
  }

  /* ── مقایسه ⚔️ ── */
  if (data === 'cmp') return await compareMenu(env, budget, chatId, uid);
  if (data === 'cmpon') { const cp = await kvGet(env, 'cp:' + uid, null); if (cp) cp.on = true; await kvPut(env, 'cp:' + uid, cp); return await compareMenu(env, budget, chatId, uid); }
  if (data === 'cmpoff') { await kvDel(env, 'cp:' + uid); return await compareMenu(env, budget, chatId, uid); }
  if (data.startsWith('cmplist:')) { const [, slot, page] = data.split(':'); return await cmpPickModel(env, budget, chatId, slot, +page || 0); }
  if (data.startsWith('cmpset:')) {
    const [, slot, hsh] = data.split(':');
    const e = await resolveModelByHash(env, hsh);
    if (!e) { await answerCb(env, budget, cb.id, L(env, 'm1w21uqe')); return sendMsg(env, budget, chatId, L(env, 'm040gipl')); }
    const cp = await kvGet(env, 'cp:' + uid, { on: false, pair: [CF_KNOWN[0].id, CF_KNOWN[1].id] });
    const pair = [...cp.pair];
    pair[slot === 'A' ? 0 : 1] = e.key;
    cp.pair = pair;
    await kvPut(env, 'cp:' + uid, cp);
    return await compareMenu(env, budget, chatId, uid);
  }

  /* ── آمار و سلامت ── */
  if (data === 'stats') return await statsView(env, budget, chatId, uid);
  if (data === 'ping') return await healthCheck(env, budget, chatId);
  if (data === 'hpall') {
    /* تست سلامت همه سرویس‌های کاستوم — چه از منوی سلامت بیاید چه از صفحهٔ کلیدها */
    const typingH = startTyping(env, chatId);
    try { await typingOn(env, budget, chatId); return await provHealthAll(env, budget, chatId); }
    catch (e) { await logErr(env, 'hpall', e); return sendMsg(env, budget, chatId, L(env, 'm1f0vb9x', EMOJI.err)); }
    finally { typingH.stop = true; }
  }

  /* ── آرشیو 📌 ── */
  if (data === 'arch') return await archiveMenu(env, budget, chatId, uid);
  if (data === 'save') {
    const scope = scopeOf(chatId, u, false);
    const h = await histGet(env, scope);
    let ai = -1, qi = -1;
    for (let i = h.msgs.length - 1; i >= 0; i--) {
      if (ai < 0 && h.msgs[i].role === 'assistant') ai = i;
      else if (h.msgs[i].role === 'user') { qi = i; break; }
    }
    if (ai >= 0) {
      const lastQ = qi >= 0 ? String(h.msgs[qi].content).slice(0, 80) : L(env, 'm1k4f7x2');
      const k = 'sv:' + uid + ':' + hash32(h.msgs[ai].content + Date.now());
      await kvPut(env, k, { q: lastQ, a: h.msgs[ai].content, t: Date.now() });
      await answerCb(env, budget, cb.id, L(env, 'm0i4af02', EMOJI.ok));
    }
    return;
  }
  if (data.startsWith('svview:')) {
    const rest = data.slice(7);
    /* 🔒 v5.4: کلید آرشیو از callback_data می‌آید و کاربر می‌تواند دستکاری‌اش
       کند؛ پس قبل از نمایش، مالکیت چک می‌شود (وگرنه کاربر مجاز می‌توانست
       آرشیو کاربر دیگر را بخواند یا حذف کند). */
    if (!rest.startsWith(uid + ':')) return sendMsg(env, budget, chatId, L(env, 'm17fazrc'));
    const keyParts = rest.split(':');
    const v = await kvGet(env, 'sv:' + keyParts.join(':'), null);
    if (!v) return;
    const txt = '📌 <b>' + esc(v.q) + '</b>\n\n' + mdToHtml(v.a);
    const kb = [[{ text: L(env, 'm0azigkn'), callback_data: 'svdel:' + rest }], [{ text: L(env, 'm1v7msmb'), callback_data: 'arch' }, { text: '✖️', callback_data: 'close' }]];
    const parts = chunkText(txt);
    try { await editMsg(env, budget, chatId, msgId, parts[0], kb); } catch { await sendMsg(env, budget, chatId, parts[0], kb); }
    for (let i = 1; i < parts.length; i++) await sendMsg(env, budget, chatId, parts[i]);
    return;
  }
  if (data.startsWith('svdel:')) {
    const rest = data.slice(6);
    if (!rest.startsWith(uid + ':')) return sendMsg(env, budget, chatId, L(env, 'm17fazrc')); // 🔒 v5.4
    await kvDel(env, 'sv:' + rest);
    return await archiveMenu(env, budget, chatId, uid);
  }
  if (data === 'svdelall') {
    for (const k of await kvList(env, 'sv:' + uid + ':')) await kvDel(env, k);
    return await archiveMenu(env, budget, chatId, uid);
  }

  /* ── تولید مجدد ♻️ ── */
  if (data === 'regen') {
    const scope = scopeOf(chatId, u, false);
    const h = await histGet(env, scope);
    let qi = -1;
    for (let i = h.msgs.length - 1; i >= 0; i--) if (h.msgs[i].role === 'user') { qi = i; break; }
    if (qi < 0) { await answerCb(env, budget, cb.id, L(env, 'm0p3af3m')); return sendMsg(env, budget, chatId, L(env, 'm0uz8dc4')); }
    const q = h.msgs[qi].content;
    h.msgs = h.msgs.slice(0, qi);
    await histPut(env, scope, h);
    return await runChatReply(env, budget, chatId, uid, scope, st, q, {});
  }

  /* ── خروجی و بکاپ ── */
  if (data === 'ex') return await exportChat(env, budget, chatId, uid);
  if (data === 'bkup') return await backupMenu(env, budget, chatId, uid);
  /* پشتیبان‌گیری انتخابی TXT — فقط مدیر (کلیدهای API ممکن است داخل فایل باشند) */
  if (data === 'bkchats' || data === 'bkset' || data === 'bkprov' || data === 'bkmem' || data === 'bkall' || data === 'bkup2') {
    if (!(await isAdmin(env, uid))) return sendMsg(env, budget, chatId, L(env, 'm0ddwlzr'));
    if (data === 'bkup2') return await backupMenu(env, budget, chatId, uid);
    await answerCb(env, budget, cb.id, L(env, 'm1kw0d0m'));
    try {
      if (data === 'bkchats') await backupChatsTxt(env, budget, chatId, uid);
      else if (data === 'bkset') await backupSettingsTxt(env, budget, chatId, uid);
      else if (data === 'bkprov') await backupProvidersTxt(env, budget, chatId);
      else if (data === 'bkmem') await backupMemTxt(env, budget, chatId, uid);
      else if (data === 'bkall') await backupAllTxt(env, budget, chatId, uid);
    } catch (e) { await logErr(env, 'bk_txt_send', e); return sendMsg(env, budget, chatId, L(env, 'm0ykatwm', EMOJI.err)); }
    return;
  }
  if (data === 'bkget') return await backupGet(env, budget, chatId, uid);
  if (data === 'bkres') {
    /* بازیابی فقط مدیر: کل رکورد کاربر را با محتوای فایل جایگزین می‌کند */
    if (!(await isAdmin(env, uid))) return sendMsg(env, budget, chatId, L(env, 'm01pi7i4'));
    u.wait = { type: 'bk', ts: Date.now() };
    await putUser(env, uid, u);
    return sendMsg(env, budget, chatId,
      L(env, 'm15usjk8'));
  }

  /* ── یادآورها ⏰ ── */
  if (data === 'rmlist') return await remindersMenu(env, budget, chatId, uid);
  if (data === 'rmnew') { u.wait = { type: 'rm', ts: Date.now() }; await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm11aanc0')); }
  if (data.startsWith('rmdel:')) {
    const hh = data.slice(6);
    /* 🔒 v5.4: قبلاً هش بدون بررسی مالکیت جستجو می‌شد و هر کاربر مجازی
       می‌توانست یادآور دیگران را پاک کند. حالا رکورد باید مال همین کاربر باشد. */
    for (const k of await kvList(env, 'rm:')) {
      if (hash32(k) !== hh) continue;
      const rv = await kvGet(env, k, null);
      if (rv && String(rv.uid) === String(uid)) await kvDel(env, k);
      break;
    }
    return await remindersMenu(env, budget, chatId, uid);
  }

  /* ── کاربران مجاز 👥 ── */
  /* 🔒 v5.4: مدیریت کاربران مجاز فقط دست مدیر است — قبلاً هر کاربر مجازی
     می‌توانست کاربر اضافه/حذف کند یا کل لیست را پاک کند. */
  if (data === 'usr') { if (!(await isAdmin(env, uid))) return sendMsg(env, budget, chatId, L(env, 'm152h8p6')); return await usersMenu(env, budget, chatId); }
  /* v5.4: میان‌برهای منوی اصلی برای قابلیت‌های تازه */
  if (data === 'todo') {
    u.wait = { type: 'todo', ts: Date.now() };
    await putUser(env, uid, u);
    const arr = await todoGet(env, uid);
    const txt2 = L(env, 'm19i3m0r', arr.length ? arr.map((x, i) => (x.done ? '✅ ' : '⬜ ') + num(i + 1) + '. ' + esc(x.t)).join('\n') : L(env, 'm1ihkad4'));
    await menuRender(env, budget, chatId, txt2, [[{ text: L(env, 'm1v7msmb'), callback_data: 'home' }]], 'todo');
    return;
  }
  if (data === 'task') {
    const list = await taskList(env, uid);
    const txt3 = L(env, 'm14n5t4v', list.length ? list.map((t, i) => {
        const d = new Date((t.at || 0) + 210 * 60000);
        return num(i + 1) + '. ' + repeatLabel(env, t.repeat) + ' ' + d.getUTCHours() + ':' + String(d.getUTCMinutes()).padStart(2, '0') + ' — ' + esc(String(t.prompt).slice(0, 70));
      }).join('\n') : L(env, 'm0y45ydf'));
    const kb2 = list.slice(0, 8).map((t, i) => [{ text: '🗑 ' + String(t.prompt).slice(0, 24), callback_data: 'taskdel:' + t.id }]);
    kb2.push([{ text: L(env, 'm1v7msmb'), callback_data: 'home' }]);
    await menuRender(env, budget, chatId, txt3, kb2, 'task');
    return;
  }
  if (data.startsWith('taskdel:')) {
    await taskDel(env, uid, data.slice(8));
    await answerCb(env, budget, cb.id, L(env, 'm0i9xl7k'));
    const list = await taskList(env, uid);
    const txt3 = L(env, 'm0jj1nn9', list.length ? list.map((t, i) => num(i + 1) + '. ' + repeatLabel(env, t.repeat) + ' — ' + esc(String(t.prompt).slice(0, 70))).join('\n') : L(env, 'm0y45ydf'));
    const kb2 = list.slice(0, 8).map((t, i) => [{ text: '🗑 ' + String(t.prompt).slice(0, 24), callback_data: 'taskdel:' + t.id }]);
    kb2.push([{ text: L(env, 'm1v7msmb'), callback_data: 'home' }]);
    await menuRender(env, budget, chatId, txt3, kb2, 'task');
    return;
  }
  if (data === 'gal') {
    const list = await imgGalleryList(env, uid);
    if (!list.length) {
      return sendMsg(env, budget, chatId, L(env, 'm1krerrn'));
    }
    const kb3 = list.slice(0, 8).map((x, i) => [{ text: '🖼 ' + String(x.prompt || L(env, 'm1if2w6h')).slice(0, 26), callback_data: 'galsend:' + x.id }]);
    kb3.push([{ text: L(env, 'm1v7msmb'), callback_data: 'home' }]);
    await menuRender(env, budget, chatId, L(env, 'm1bt0wd7', num(list.length)), kb3, 'gal');
    return;
  }
  if (data.startsWith('galsend:')) {
    const item = await imgGalleryGet(env, uid, data.slice(8));
    if (!item) return sendMsg(env, budget, chatId, L(env, 'm17p2kvb', EMOJI.err));
    const fd = new FormData();
    fd.append('chat_id', String(chatId));
    fd.append('photo', new Blob([appB64Bytes(item.b64)], { type: item.mime || 'image/png' }), 'gallery.png');
    fd.append('parse_mode', 'HTML');
    fd.append('caption', '🖼 ' + esc(String(item.prompt || L(env, 'm1if2w6h')).slice(0, 900)));
    try { await tg(env, budget, 'sendPhoto', null, fd); } catch (e) { await logErr(env, 'gallery_send', e); }
    return;
  }
  if (data === 'fnd') {
    u.wait = { type: 'find', ts: Date.now() };
    await putUser(env, uid, u);
    return sendMsg(env, budget, chatId, L(env, 'm1hejoom'));
  }
  /* v5.4: سهمیهٔ تصویر روزانهٔ یک کاربر — «آیدی | تعداد» (۰ = بی‌سقف) */
  if (data === 'usrimgquota') {
    if (!(await isAdmin(env, uid))) return;
    u.wait = { type: 'usrimgq', ts: Date.now() };
    await putUser(env, uid, u);
    return sendMsg(env, budget, chatId,
      L(env, 'm1hzemkv'));
  }
  if (data === 'usradd' || data.startsWith('usrdel:') || data === 'usrdelall') {
    if (!(await isAdmin(env, uid))) return sendMsg(env, budget, chatId, L(env, 'm152h8p6')); // 🔒 v5.4
  }
  if (data === 'usradd') { u.wait = { type: 'usradd', ts: Date.now() }; await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm0dh5ewl')); }
  if (data.startsWith('usrdel:')) {
    const rid = data.slice(7);
    const al = (await kvGet(env, 'al', [])).filter((x) => x !== rid);
    await kvPut(env, 'al', al);
    return await usersMenu(env, budget, chatId);
  }
  if (data === 'usrdelall') { await kvPut(env, 'al', []); return await usersMenu(env, budget, chatId); }

  await answerCb(env, budget, cb.id, L(env, 'm0782kha'));
}

/* ═══════════════════ پیام‌ها و دستورات ═══════════════════ */
const HELP_TEXT =
  '❓ <b>راهنمای ربات {{brand}}</b>\n\n' +
  '💬 <b>چت:</b> هر متنی بفرستی با مدل فعال جواب میدهم. لینک بفرستی صفحه را میخوانم و تحلیل میکنم 🌐\n\n' +
  '🤖 <b>مدل:</b> از منوی «انتخاب مدل» — مدل‌های Workers AI خود کلادفلر + سرویس‌های کاستومی که اضافه کرده‌ای\n\n' +
  '🔌 <b>سرویس کاستوم:</b> <code>/provideradd</code> — نام + آدرس پایه + کلید API هر سرویس <b>سازگار با OpenAI</b> (OpenRouter، Groq، DeepSeek، vLLM، Ollama...). استخراج خودکار مدل‌ها با fallback به واردکردن دستی؛ ویرایش/حذف از <code>/providers</code> یا دکمه «🔌 سرویس‌های AI». فالبک خودکار همیشه به lane رایگان کلادفلر میرود، نه به سرویس پولی دیگر.\n\n' +
  '🧵 <b>گفتگوهای جدا:</b> منوی «گفتگوها» ← ➕ — هر گفتگو حافظه مستقل دارد\n\n' +
  '🎭 <b>شخصیت:</b> مترجم، برنامه‌نویس، معلم، نویسنده... یا پرامپت سیستمی خودت\n\n' +
  '⚔️ <b>مقایسه:</b> یک سوال به دو مدل همزمان (میتواند کلادفلر + سرویس کاستوم باشد) — جواب‌ها کنار هم!\n\n' +
  '⏰ <b>یادآور:</b> <code>/remind 18:30 چای</code> یا <code>/remind 45m استراحت</code>\n\n' +
  '📚 <b>پرامپت‌ها:</b> متن پرتکرارت را ذخیره کن، با یک لمس اجرا کن\n\n' +
  '<b>دستورات:</b>\n' +
  '/start — پنل اصلی · /new — گفتگوی تازه · /model — انتخاب مدل\n' +
  '/settings — تنظیمات · /stats — آمار · /ping — سلامت سرویس‌ها\n' +
  '/provideradd — افزودن سرویس AI · /providers — مدیریت سرویس‌ها\n' +
  '/export — خروجی گفتگو · /pladd — ذخیره پرامپت · /cancel — لغو ورودی\n' +
  '/image — تولید تصویر 🎨 · /web — جستجوی وب · /weather — هوای نیشابور · /crypto — قیمت کریپتو\n' +
  '/tts متن — تبدیل متن به صدا 🔊 · /translate متن — ترجمهٔ فوری (یا ریپلای) 🌐\n' +
  '📄 PDF: فایل PDF بفرست تا متنش را بخوانم · روی هر پیام متنی ریپلای بزن تا زمینهٔ جواب شود\n' +
  '/remember — سپردن به حافظه · /forget — حذف از حافظه (رقم یا all) · /memory — دیدن حافظه\n' +
  '/brief — خلاصه صبح · /help — همین راهنما\n\n' +
  '📷 <b>عکس:</b> عکس بفرستی، با مدل عکس‌فهم (👁) تحلیل می‌شود — چه مدل کلادفلر چه سرویس کاستوم. اگر مدل فعال عکس نفهمد، خودکار با مدل ویژن کلادفلر جواب می‌گیری. برای مدل کاستوم، در «🔌 سرویس‌ها» با دکمه 👁 علامتش بزن.\n\n' +
  '🎨 <b>تولید تصویر:</b> <code>/image توصیف تصویر</code> (یا <code>/img</code>) — با کلید <code>GEMINI_API_KEY</code> و مدل <code>gemini-3.1-flash-lite-image</code> عکس می‌سازد و همان‌جا می‌فرستد. روشن/خاموش و مدلش از ⚙️ تنظیمات.\n\n' +
  '<b>🆕 نسخهٔ ۵.۴:</b>\n' +
  '/find عبارت — جستجو در همهٔ گفتگوها (بدون مدل و رایگان)\n' +
  '/gallery — گالری عکس‌های ساخته‌شده (۳۰ روز) · <code>/gallery 2</code> برای ارسال مجدد\n' +
  '/sum متن — خلاصهٔ هوشمند (روی ریپلای هم کار می‌کند؛ متن بلند را تکه‌تکه جمع می‌کند)\n' +
  '/todo — تودولیست: <code>/todo خرید نان</code> · <code>/todo done 1</code> · <code>/todo del 1</code>\n' +
  '/task — تسک زمان‌بندی‌شده با AI: <code>/task هر روز 08:00 اخبار AI</code>\n' +
  '/memfind عبارت — جستجو در حافظهٔ بلندمدت\n' +
  '🖌 <b>ویرایش عکس:</b> عکس را با کپشن <code>ویرایش: آسمان را غروب کن</code> بفرست (یا ریپلای + <code>/edit</code>)\n' +
  '🗣 <b>یادآور از متن آزاد:</b> بگو «فردا ساعت ۵ یادم بنداز قبض رو بدم» — خودم می‌فهمم\n' +
  '🎬 <b>لینک یوتیوب:</b> لینک بفرست، زیرنویسش را می‌خوانم و خلاصه می‌کنم\n' +
  '🆓 <b>بدون کلید هم عکس می‌سازم:</b> فالبک رایگان Pollinations (از ⚙️ تنظیمات قابل خاموش‌کردن)';

/* EN */
const HELP_TEXT_EN =
  '❓ <b>{{brand}} — Help</b>\n\n' +
  '💬 <b>Chat:</b> Send any text and I answer with the active model. Send a link and I read the page and analyze it 🌐\n\n' +
  '🤖 <b>Model:</b> from the “Choose model” menu — Cloudflare Workers AI models plus any custom services you added\n\n' +
  '🔌 <b>Custom service:</b> <code>/provideradd</code> — name + base URL + API key for any <b>OpenAI-compatible</b> service (OpenRouter, Groq, DeepSeek, vLLM, Ollama...). Models are discovered automatically with a manual fallback; edit/delete from <code>/providers</code> or the “🔌 AI services” button. Automatic fallback always goes to the free Cloudflare lane, never to another paid service.\n\n' +
  '🧵 <b>Separate chats:</b> the “Chats” menu → ➕ — each chat has its own memory\n\n' +
  '🎭 <b>Persona:</b> translator, programmer, tutor, writer... or your own system prompt\n\n' +
  '⚔️ <b>Compare:</b> one question to two models at once (Cloudflare + a custom service is fine) — answers side by side!\n\n' +
  '⏰ <b>Reminder:</b> <code>/remind 18:30 tea</code> or <code>/remind 45m break</code>\n\n' +
  '📚 <b>Prompts:</b> save text you send often and run it with one tap\n\n' +
  '<b>Commands:</b>\n' +
  '/start — main panel · /new — new chat · /model — choose model\n' +
  '/settings — settings · /stats — usage · /ping — service health\n' +
  '/provideradd — add an AI service · /providers — manage services\n' +
  '/export — export chat · /pladd — save prompt · /cancel — cancel input\n' +
  '/image — generate an image 🎨 · /web — web search · /weather — weather · /crypto — crypto prices\n' +
  '/tts text — text to speech 🔊 · /translate text — instant translation (or reply) 🌐\n' +
  '📄 PDF: send a PDF and I read its text · reply to any message to use it as context\n' +
  '/remember — save to memory · /forget — remove from memory (number or all) · /memory — view memory\n' +
  '/brief — morning briefing · /help — this help\n\n' +
  '📷 <b>Images:</b> send a photo and it is analyzed with a vision model (👁) — Cloudflare or custom. If the active model cannot see images, a Cloudflare vision model is used automatically. For a custom model, mark it with the 👁 button under “🔌 Services”.\n\n' +
  '🎨 <b>Image generation:</b> <code>/image description</code> (or <code>/img</code>) — uses <code>GEMINI_API_KEY</code> and the <code>gemini-3.1-flash-lite-image</code> model and sends the image right there. Toggle and choose the model under ⚙️ Settings.\n\n' +
  '<b>🆕 Version 5.4:</b>\n' +
  '/find term — search all your chats (no model, free)\n' +
  '/gallery — gallery of generated images (30 days) · <code>/gallery 2</code> to resend\n' +
  '/sum text — smart summary (works on a reply too; summarizes long text in chunks)\n' +
  '/todo — to-do list: <code>/todo buy bread</code> · <code>/todo done 1</code> · <code>/todo del 1</code>\n' +
  '/task — AI scheduled task: <code>/task every day 08:00 AI news</code>\n' +
  '/memfind term — search long-term memory\n' +
  '🖌 <b>Image edit:</b> send a photo with the caption <code>edit: make the sky a sunset</code> (or reply + <code>/edit</code>)\n' +
  '🗣 <b>Reminder from free text:</b> say “remind me tomorrow at 5 to pay the bill” — I understand\n' +
  '🎬 <b>YouTube links:</b> send a link and I read the subtitles and summarize them\n' +
  '🆓 <b>Images without a key:</b> free Pollinations fallback (can be turned off under ⚙️ Settings)';

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 22b-messages
   پیام‌ها: onMessage، دستورات، پیوست‌ها، تشخیص یادآور
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
async function onMessage(env, m) {
  if (!m.from || !m.chat) return;
  const uid = String(m.from.id);
  const chatId = m.chat.id;
  const isGroup = ['group', 'supergroup'].includes(m.chat.type);
  const rawText = String(m.text || m.caption || '');
  let text = normDigits(rawText).trim();
  let fromVoice = false;
  const cmdText = normCmd(text);
  const budget = newBudget(CFG.TG_BUDGET_MSG);

  /* مجوز */
  if (!(await isAllowed(env, uid))) {
    if (!isGroup) {
      env._lang = (await _langOf(env, uid)) || 'fa';
      await sendMsg(env, budget, chatId, L(env, 'm0jdeepr'));
    }
    return;
  }
  /* در گروه فقط وقتی منشن یا ریپلای به ربات باشد پاسخ میدهد */
  let forcedChat = false;
  if (isGroup) {
    const mentioned = await groupWantsBot(env, m);
    if (!mentioned) return;
    forcedChat = true;
  }

  const u = await getUser(env, uid);
  const st = u.st;
  const scope = scopeOf(chatId, u, isGroup);
  try { if (u.lastChat !== chatId) { u.lastChat = chatId; await putUser(env, uid, u); } } catch {}

  /* دستورات */
  /* دستورات: هر متنی که با اسلش شروع شود هرگز به مدل نمی‌رود.
     handleCommand فقط برای کامند ناشناخته «false» برمی‌گرداند؛ مقدار برگشتی
     توابع منو مهم نیست (باگ قبلی: توابع منو undefined برمی‌گرداندند و متن
     کامند به‌عنوان پیام عادی به مدل می‌رفت). */
  if (cmdText.startsWith('/')) {
    const known = await handleCommand(env, budget, chatId, uid, m, cmdText, u, isGroup);
    if (known !== false) return;
    const waiting = u.wait && Date.now() - (u.wait.ts || 0) < CFG.WAIT_TTL_MS;
    if (!waiting) {
      await sendMsg(env, budget, chatId,
        L(env, 'm1fxm35l', esc(cmdText.split(/\s+/)[0].slice(0, 32))));
      return;
    }
  }

  /* حالت‌های انتظار ورودی */
  if (u.wait && Date.now() - (u.wait.ts || 0) < CFG.WAIT_TTL_MS) {
    const w = u.wait.type;
    if (w === 'bk') {
      /* بازیابی بکاپ: سند JSON یا متن paste‌شده. از rawText استفاده می‌کنیم نه text،
         چون normDigits ارقام فارسی داخل خاطره‌ها را عوض می‌کند و JSON خراب میشد. */
      let raw = '';
      if (m.document) {
        await typingOn(env, budget, chatId);
        raw = (await readDocRaw(env, budget, m.document, CFG.BACKUP_MAX)) || '';
      } else {
        raw = String(rawText || '');
      }
      u.wait = null;
      await putUser(env, uid, u);
      if (!raw.trim()) return await sendMsg(env, budget, chatId, L(env, 'm0sezqye', EMOJI.err));
      try {
        await backupRestore(env, budget, chatId, uid, raw);
      } catch (e) {
        await logErr(env, 'restore', e);
        return await sendMsg(env, budget, chatId, L(env, 'm19t6q6e', EMOJI.err, esc(String((e && e.message) || e).slice(0, 220))));
      }
      return await sendMsg(env, budget, chatId, L(env, 'm0wez77p', EMOJI.ok));
    }
    if (w === 'dl') {
      const n = parseInt(text, 10);
      if (!isNaN(n)) { st.dailyLimit = Math.min(100000, Math.max(0, n)); }
      u.wait = null; await putUser(env, uid, u);
      await sendMsg(env, budget, chatId, L(env, 'm0y5t1g0', EMOJI.ok, n > 0 ? num(n) + L(env, 'm06cgnqj') : L(env, 'm13m57j2')));
      return await settingsMenu(env, budget, chatId, uid);
    }
    if (w === 'sys') {
      st.sysCustom = text.slice(0, 2000);
      u.wait = null; await putUser(env, uid, u);
      await sendMsg(env, budget, chatId, EMOJI.ok + (text ? L(env, 'm109dy58') : L(env, 'm1tbrfla')));
      return await personaMenu(env, budget, chatId, uid);
    }
    if (w === 'panew') {
      if (!u.pl) u.pl = [];
      u.pl.push({ k: hash32(text + Date.now()), n: text.slice(0, 40), v: text.slice(0, CFG.PROMPT_LIB_VALUE) });
      if (u.pl.length > CFG.PROMPT_LIB_MAX) u.pl.shift();
      u.wait = null; await putUser(env, uid, u);
      await sendMsg(env, budget, chatId, L(env, 'm1ht8n3f', EMOJI.ok));
      return await promptsMenu(env, budget, chatId, uid);
    }
    if (w === 'rm') {
      const r = parseRemind(text);
      u.wait = null; await putUser(env, uid, u);
      if (!r) return await sendMsg(env, budget, chatId, L(env, 'm1bnwrya', EMOJI.err));
      const k = 'rm:' + hash32(uid + r.at + Math.random());
      await kvPut(env, k, { uid, chat: chatId, at: r.at, txt: r.txt, repeat: (r.repeat || 'none') }, Math.max(60, Math.ceil((r.at - Date.now()) / 1000) + 120));
      const d = new Date(r.at + 210 * 60000);
      await sendMsg(env, budget, chatId, L(env, 'm0zrvigh', EMOJI.ok, d.getUTCHours(), String(d.getUTCMinutes()).padStart(2, '0'), esc(r.txt)));
      return;
    }
    if (w === 'todo') {
      const it = await todoAdd(env, uid, text);
      u.wait = null; await putUser(env, uid, u);
      if (!it) return sendMsg(env, budget, chatId, L(env, 'm03lhvxb', EMOJI.err));
      const arr = await todoGet(env, uid);
      return sendMsg(env, budget, chatId, L(env, 'm1in7o29', EMOJI.ok, esc(it.t), num(arr.filter((x) => !x.done).length), num(arr.length)));
    }
    if (w === 'find') {
      u.wait = null; await putUser(env, uid, u);
      const found = await histFind(env, uid, scope, text);
      if (found.error) return sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(found.error));
      if (!found.hits.length) return sendMsg(env, budget, chatId, L(env, 'm102js5y', esc(text)));
      const lines = found.hits.map((h, i) => esc(num(i + 1) + '. ' + h.thread + ' · ' + h.role + '\n   ' + h.snip)).join('\n');
      return sendMsg(env, budget, chatId, L(env, 'm1cai5l5', num(found.total), esc(text), lines));
    }
    if (w === 'usrimgq') {
      /* «آیدی | تعداد» — سهمیهٔ تصویر روزانه برای همان کاربر ذخیره می‌شود */
      const seg = String(text || '').split(/[|،]/);
      const nid = (seg[0] || '').replace(/[^0-9]/g, '');
      const nq = parseInt(normDigits(seg[1] || '').replace(/[^0-9]/g, ''), 10);
      u.wait = null;
      await putUser(env, uid, u);
      if (!nid || isNaN(nq) || nq < 0 || nq > 10000) {
        return sendMsg(env, budget, chatId, L(env, 'm1hjy90d', EMOJI.err));
      }
      const prev = await kvGet(env, 'lim:' + nid, {});
      prev.img = nq;
      await kvPut(env, 'lim:' + nid, prev);
      return await sendMsg(env, budget, chatId, L(env, 'm1sa9jh3', EMOJI.ok, esc(nid), nq ? num(nq) + L(env, 'm16t1u4f') : L(env, 'm0knucpz')));
    }
    if (w === 'usradd') {
      const parts = text.split(/\s+/);
      const nid = parts[0].replace(/[^0-9-]/g, '');
      u.wait = null;
      if (!nid) { await putUser(env, uid, u); return await sendMsg(env, budget, chatId, L(env, 'm1ux7f4b', EMOJI.err)); }
      const al = await kvGet(env, 'al', []);
      if (!al.includes(nid)) al.push(nid);
      await kvPut(env, 'al', al);
      if (parts[1]) { const nm = await kvGet(env, 'aln', {}); nm[nid] = esc(parts.slice(1).join(' ').slice(0, 30)); await kvPut(env, 'aln', nm); }
      await putUser(env, uid, u);
      await sendMsg(env, budget, chatId, L(env, 'm0egij2w', EMOJI.ok, esc(nid)));
      return await usersMenu(env, budget, chatId);
    }

    if (w === 'memadd') {
      const ok = await memAdd(env, uid, text);
      u.wait = null; await putUser(env, uid, u);
      await sendMsg(env, budget, chatId, ok ? L(env, 'm16pccr9', EMOJI.ok) : L(env, 'm09bzqqm', EMOJI.err));
      return await settingsMenu(env, budget, chatId, uid);
    }
    if (w === 'memedit') {
      const mm = text.split('|');
      const arr = await memGet(env, uid);
      u.wait = null;
      if (mm.length >= 2) {
        const idx = parseInt(normDigits(mm[0]).replace(/[^0-9]/g, ''), 10) - 1;
        const nt = mm.slice(1).join('|').trim().slice(0, 300);
        /* 🔧 v5.4: از memEdit استفاده کن تا برچسب و زمانِ خاطره حفظ شود
           (قبلاً نسخهٔ درون‌خطی، tag را پاک و ts را کهنه می‌گذاشت). */
        if (arr[idx] && nt && await memEdit(env, uid, arr[idx].id, nt, arr[idx].tag)) { await putUser(env, uid, u); await sendMsg(env, budget, chatId, L(env, 'm1v2qmn4', EMOJI.ok)); }
        else { await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm080aqqz', EMOJI.err)); }
      } else { await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm0npkj1n', EMOJI.err)); }
      return await settingsMenu(env, budget, chatId, uid);
    }

    /* ── ویزارد سرویس کاستوم 🔌 ── */
    if (w === 'pv_name') {
      const name = text.slice(0, CFG.PROVIDER_NAME_MAX).trim();
      if (!name || name.startsWith('/')) return sendMsg(env, budget, chatId, L(env, 'm1kt27iy', EMOJI.err));
      return await pvAsk(env, budget, chatId, uid, u, 'pv_url', { name });
    }
    if (w === 'pv_url') {
      const base = normBaseUrl(text);
      if (!base) return sendMsg(env, budget, chatId, L(env, 'm14a7zjh', EMOJI.err));
      return await pvAsk(env, budget, chatId, uid, u, 'pv_key', { name: (u.wait.d || {}).name, base });
    }
    if (w === 'pv_key') {
      const key = text.replace(/\s+/g, '');
      if (key.length < CFG.KEY_MIN || key.length > CFG.KEY_MAX) return sendMsg(env, budget, chatId, L(env, 'm17b8a4j', EMOJI.err, CFG.KEY_MIN, CFG.KEY_MAX));
      const d = u.wait.d || {};
      const many = await provAll(env);
      if (many.length >= CFG.MAX_PROVIDERS) { u.wait = null; await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm0tis57h', CFG.MAX_PROVIDERS)); }
      const pid = newPid(d.name, uid);
      const rec = { pid, name: d.name, base: d.base, key, models: [], ts: Date.now(), ut: Date.now() };
      await provPut(env, rec);
      u.wait = null; await putUser(env, uid, u);
      await sendMsg(env, budget, chatId, L(env, 'm0ejgkqx', esc(d.name), esc(d.base)));
      const res = await discoverModels(env, d.base, key);
      if (res.ok) {
        if (res.base !== d.base) { rec.base = res.base; await provPut(env, rec); }
        await kvPut(env, 'pvr:' + pid, { items: res.items, t: Date.now() }, CFG.DISCO_TTL);
        env._menuMsg = null;
        return await renderPick(env, budget, chatId, pid, 0, null);
      }
      u.wait = { type: 'pv_manual', d: { pid }, ts: Date.now() };
      await putUser(env, uid, u);
      return await sendMsg(env, budget, chatId,
        L(env, 'm1wb9onq', EMOJI.err, pick(env, DISCO_FAIL_TEXT, DISCO_FAIL_TEXT_EN)[res.code] || res.code));
    }
    if (w === 'pv_manual') {
      const d = u.wait.d || {};
      const raw = text.split(/[,،\n]+/).map((x) => x.trim()).filter(Boolean).slice(0, CFG.MANUAL_IDS_MAX);
      const items = [];
      for (const r0 of raw) {
        let id = r0, ctx = null;
        const m = r0.match(/^(.+?)\s+([0-9]{1,4})\s*[kK]\s*$/); // «my-model 128k»
        if (m) { id = m[1].trim(); ctx = (+m[2]) * 1000; }
        id = id.replace(/\s+/g, '');
        if (id && id.length <= CFG.MODEL_ID_MAX && /^[ -~]+$/.test(id)) items.push({ id, ctx, src: 'man' });
      }
      const rec = await provGet(env, d.pid);
      u.wait = null; await putUser(env, uid, u);
      if (!rec) return sendMsg(env, budget, chatId, L(env, 'm1yh7mvd', EMOJI.err));
      if (!items.length) return sendMsg(env, budget, chatId, L(env, 'm1nl12v2', EMOJI.err));
      const added = await mergeModels(env, rec, items);
      await sendMsg(env, budget, chatId, L(env, 'm0wcku8x', EMOJI.ok, added, esc(rec.name)));
      env._menuMsg = null;
      return await providerPage(env, budget, chatId, rec.pid);
    }
    if (w === 'pv_rename' || w === 'pv_reurl' || w === 'pv_rekey' || w === 'pv_addkey' || w === 'pv_ctx') {
      const d = u.wait.d || {};
      const rec = await provGet(env, d.pid || parseModelKey(d.key).pid);
      u.wait = null; await putUser(env, uid, u);
      if (!rec) return sendMsg(env, budget, chatId, L(env, 'm1k5ju5y', EMOJI.err));
      if (w === 'pv_rename') {
        const name = text.slice(0, CFG.PROVIDER_NAME_MAX).trim();
        if (!name) return sendMsg(env, budget, chatId, L(env, 'm0gmmytc', EMOJI.err));
        rec.name = name; await provPut(env, rec);
        await sendMsg(env, budget, chatId, L(env, 'm1a510vh', EMOJI.ok, esc(name)));
      }
      if (w === 'pv_reurl') {
        const base = normBaseUrl(text);
        if (!base) return sendMsg(env, budget, chatId, L(env, 'm04vzm1x', EMOJI.err));
        rec.base = base; await provPut(env, rec);
        await sendMsg(env, budget, chatId, L(env, 'm0niplq6', EMOJI.ok, esc(base)));
      }
      if (w === 'pv_rekey') {
        const key = text.replace(/\s+/g, '');
        if (key.length < CFG.KEY_MIN || key.length > CFG.KEY_MAX) return sendMsg(env, budget, chatId, L(env, 'm1d0sm13', EMOJI.err));
        /* v4.10: کلید جدید به انتهای لیست اضافه میشود (نه جایگزینی کورکورانه).
           اگر سقف پر باشد، قدیمی‌ترین کلیدِ بعد از اولی حذف میشود؛ کلیدِ اصلی
           (اول) دست‌نخورده می‌ماند تا چیزی که کاربر می‌شناسد ناپدید نشود. */
        const keys = provKeysOf(rec);
        if (keys.length >= CFG.KEYS_PER_PROVIDER) keys.splice(1, keys.length - 1);
        if (keys.indexOf(key) < 0) keys.push(key);
        rec.keys = keys.slice(0, CFG.KEYS_PER_PROVIDER);
        rec.key = rec.keys[0];
        await provPut(env, rec);
        await sendMsg(env, budget, chatId, L(env, 'm02hnuk1', EMOJI.ok, rec.keys.length, CFG.KEYS_PER_PROVIDER, esc(maskKey(key))));
      }
      if (w === 'pv_addkey') {
        const key = text.replace(/\s+/g, '');
        if (key.length < CFG.KEY_MIN || key.length > CFG.KEY_MAX) return sendMsg(env, budget, chatId, L(env, 'm1d0sm13', EMOJI.err));
        if (provKeysOf(rec).length >= CFG.KEYS_PER_PROVIDER) {
          u.wait = null; await putUser(env, uid, u);
          return sendMsg(env, budget, chatId, L(env, 'm06byytx', CFG.KEYS_PER_PROVIDER));
        }
        const keys = provKeysOf(rec);
        if (keys.indexOf(key) >= 0) return sendMsg(env, budget, chatId, L(env, 'm1y8wv5p'));
        keys.push(key);
        rec.keys = keys.slice(0, CFG.KEYS_PER_PROVIDER);
        rec.key = rec.keys[0];
        await provPut(env, rec);
        u.wait = null; await putUser(env, uid, u);
        await sendMsg(env, budget, chatId, L(env, 'm0ppl6sq', EMOJI.ok, rec.keys.length, esc(maskKey(key))));
        return await providerKeysPage(env, budget, chatId, d.pid);
      }
      if (w === 'pv_ctx') {
        const n = parseInt(normDigits(text).replace(/[^0-9]/g, ''), 10);
        const p = parseModelKey(d.key);
        const me = (rec.models || []).find((x) => x.id === p.id);
        if (!me || !n || n < 1 || n > 100000) return sendMsg(env, budget, chatId, L(env, 'm1x2dhio', EMOJI.err));
        me.ctx = n * 1000; await provPut(env, rec);
        await sendMsg(env, budget, chatId, L(env, 'm1qswibp', EMOJI.ok, esc(me.id), num(n)));
      }
      env._menuMsg = null;
      return await providerPage(env, budget, chatId, rec.pid);
    }
  }

  /* عکس‌ها 👁 — بزرگ‌ترین سایز هر پیام (چند عکس = آلبوم ⇒ چند پیام پشت‌سرهم) */
  const photos = [];
  const photoSizes = [];
  if (Array.isArray(m.photo) && m.photo.length) photoSizes.push(m.photo[m.photo.length - 1]);
  if (m.reply_to_message && Array.isArray(m.reply_to_message.photo) && m.reply_to_message.photo.length) {
    photoSizes.push(m.reply_to_message.photo[m.reply_to_message.photo.length - 1]);
  }
  if (photoSizes.length && !forcedChat && !(m.document || m.video || m.voice || m.audio || m.sticker)) {
    await typingOn(env, budget, chatId);
    for (const sz of photoSizes.slice(0, CFG.VISION_MAX_N)) {
      const im = await readTelegramPhoto(env, budget, sz);
      if (im) photos.push(im);
    }
    if (!photos.length) return sendMsg(env, budget, chatId, L(env, 'm1wmdiq9', EMOJI.err));
  }

  /* 🖌 v5.4: ویرایش عکس با کپشن — «ویرایش: …» یا «/edit …» در کپشن عکس.
     مستقیم به geminiImageEdit می‌رود، بدون رفتن به مدل چت. */
  if (!forcedChat && photos.length && text && st.imgEdit !== false && /^\s*(?:\/edit\b|ویرایش\s*:|edit\s*:)/i.test(text)) {
    const edp = text.replace(/^\s*(?:\/edit\b|ویرایش\s*:|edit\s*:)\s*/i, '').trim();
    if (!edp) return sendMsg(env, budget, chatId, L(env, 'm0b861td'));
    if (st.imgGen === false) return sendMsg(env, budget, chatId, L(env, 'm0wbseun'));
    const el = await checkDailyLimit(env, uid, st);
    if (el) return sendMsg(env, budget, chatId, el);
    const eq = await quotaTake(env, uid, 'img');
    if (eq) return sendMsg(env, budget, chatId, eq);
    const typingE = startTyping(env, chatId);
    try {
      await typingOn(env, budget, chatId);
      const img = await geminiImageEdit(env, edp, photos.map((x) => ({ b64: x.b64, mime: x.mime })), st.imgModel || CFG.IMG_MODEL_DEFAULT);
      await quotaBump(env, uid, 'img');
      await imgGallerySave(env, uid, { b64: img.b64, mime: img.mime, prompt: '✏️ ' + edp });
      const fdE = new FormData();
      fdE.append('chat_id', String(chatId));
      fdE.append('photo', new Blob([appB64Bytes(img.b64)], { type: img.mime || 'image/png' }), 'behrad-edit.png');
      fdE.append('parse_mode', 'HTML');
      fdE.append('caption', '🖌 ' + esc(edp.slice(0, 900)) + '\n<i>' + esc(img.via || '') + '</i>');
      await tg(env, budget, 'sendPhoto', null, fdE);
      await bumpUsage(env, uid, est(edp) + 1000, 0);
    } catch (e) {
      await logErr(env, 'img_edit', e);
      await sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(String((e && e.message) || e).slice(0, 300)));
    } finally { typingE.stop = true; }
    return;
  }

  /* فایل متنی/کد پیوست؟ */
  let filePart = null;
  if (m.document && !forcedChat) {
    filePart = await readTelegramFile(env, budget, m.document);
    if (filePart) await typingOn(env, budget, chatId);
  }

  /* ویس فارسی → متن (v4.5: خروجی پیش‌فرض متنی، صوتی اختیاری از تنظیمات) */
  const voiceObj = m.voice || m.audio || null;
  if (voiceObj && !forcedChat) {
    await typingOn(env, budget, chatId);
    try {
      const buf = await downloadTelegramFileBytes(env, budget, voiceObj.file_id, CFG.VOICE_MAX_BYTES);
      if (!buf) {
        return sendMsg(env, budget, chatId, L(env, 'm088ke95', EMOJI.err));
      }
      const tr = await transcribeVoice(env, buf, st, voiceObj.mime_type || '');
      text = tr;
      fromVoice = true;
    } catch (e) {
      await logErr(env, 'stt', e);
      return sendMsg(env, budget, chatId, L(env, 'm0s14x2z', EMOJI.err, esc(String((e && e.message) || e).slice(0, 160))));
    }
  }

  /* 🗣 v5.4: تشخیص قصد یادآور/تسک از متن آزاد — قبل از چت، فقط وقتی
     عبارت صریح یادآوری هست. «یادآور» ← rm: و «هر روز/هفتگی» ← task. */
  if (!isGroup && !filePart && !photos.length && st.nlRemind !== false && NL_REMIND_RE.test(text)) {
    const nl = await nlRemindIntent(text);
    if (nl) {
      /* اگر «هر روز/هفتگی» در متن بود، تسک تکراری بساز نه یادآور یک‌باره */
      const repM = /(هر\s*روز|روزانه|هفتگی|هر\s*هفته)/.test(text);
      if (repM) {
        const pr = parseRemind(text.replace(NL_REMIND_RE, '').replace(/(هر\s*روز|روزانه|هفتگی|هر\s*هفته)/g, (x) => /هفت/.test(x) ? 'هفتگی ' : 'روزانه ').trim());
        if (pr) {
          const list = await taskList(env, uid);
          if (list.length < CFG.TASK_MAX) {
            const tt = { uid, chat: chatId, id: 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4), prompt: pr.txt.slice(0, CFG.TASK_PROMPT_MAX), repeat: pr.repeat || 'daily', at: pr.at, ts: Date.now() };
            if (tt.prompt) {
              await taskSave(env, tt);
              const dd = new Date(tt.at + 210 * 60000);
              await sendMsg(env, budget, chatId, L(env, 'm0wkggkw', EMOJI.ok, repeatLabel(env, tt.repeat), dd.getUTCHours(), String(dd.getUTCMinutes()).padStart(2, '0'), esc(tt.prompt.slice(0, 120))));
              return;
            }
          }
        }
      }
      const k = 'rm:' + hash32(uid + nl.at + Math.random());
      await kvPut(env, k, { uid, chat: chatId, at: nl.at, txt: nl.txt, repeat: 'none' }, Math.max(60, Math.ceil((nl.at - Date.now()) / 1000) + 120));
      const d2 = new Date(nl.at + 210 * 60000);
      await sendMsg(env, budget, chatId, L(env, 'm0c4ur19', EMOJI.ok, d2.getUTCHours(), String(d2.getUTCMinutes()).padStart(2, '0'), esc(nl.txt)));
      return;
    }
  }

  /* ریپلای روی پیام متنی → زمینهٔ گفتگو.
     قبلاً فقط عکسِ ریپلای خوانده میشد؛ یعنی «همین رو خلاصه کن» بدون اینکه متن
     دوباره فرستاده شود اصلاً کار نمیکرد (به‌خصوص در گروه، جایی که پیامِ دیگران
     اصلاً وارد تاریخچه نمیشود و تنها راه دیدنش همین ریپلای است). */
  let replyPart = '';
  const rp = m.reply_to_message;
  if (rp && rp.text) {
    const bi = await botInfo(env);
    /* ریپلای روی جوابِ خودِ ربات رد میشود: آن پیام آخرین ورودی تاریخچه است و
       آوردن دوباره‌اش فقط توکن می‌سوزاند. */
    if (!(bi && rp.from && rp.from.id === bi.id)) {
      const who = esc(String((rp.from && (rp.from.first_name || rp.from.username)) || L(env, 'm0p16vdf')).slice(0, 40));
      replyPart = L(env, 'm1x19yq4', who, String(rp.text).slice(0, 4000));
    }
  }

  /* پیام خالی؟ (ریپلایِ بدون متن هم معتبر است: زمینه را می‌فرستد و مدل خودش می‌فهمد) */
  if (!text && !filePart && !photos.length && !replyPart) {
    if (!isGroup) await sendMsg(env, budget, chatId, L(env, 'm1x74gtg'));
    return;
  }

  /* چت! (متن گروهی: پیشوند منشن حذف میشود) */
  const baseText = forcedChat ? (text.replace(/@\w+/g, '').trim() || text) : text;
  const userText = replyPart + baseText;

  /* اسم‌گذاری خودکار گفتگو: به‌جای «گفتگو ۱» یک عنوان از اولین پیام.
     کاملاً محلی و بدون فراخوانی مدل — رایگان، آنی، و هیچ‌وقت خطا نمی‌دهد. */
  try {
    if (!isGroup) {
      const th = (u.threads || []).find((x) => x.id === u.thread);
      if (th && th.auto !== 1 && /^گفتگو\s+\d+$/.test(th.name)) {
        const ti = autoTitle(baseText);
        if (ti) { th.name = ti; th.auto = 1; await putUser(env, uid, u); }
      }
    }
  } catch (e) { await logErr(env, 'autotitle', e); }

  await runChatReply(env, budget, chatId, uid, scope, st, userText, { filePart, photos, fromVoice });
}

/* عنوان کوتاه برای گفتگو: از اولین پیام کاربر، بدون فراخوانی مدل.
   عمداً محلی است: یک فراخوانی ارزان برای هر گفتگوی تازه هم تأخیر می‌آورد
   هم اگر کلید گوگل نباشد شکست می‌خورد، در حالی که برش کردن متن هیچ‌وقت خراب نمیشود. */
function autoTitle(s) {
  let t = String(s || '')
    .replace(/<\|(?:REPLY|FILE)_(?:START|END)\|>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!t) return '';
  t = t.replace(/^\/[a-z]+\s*/i, '');
  if (!t) return '';
  if (t.length > 34) {
    t = t.slice(0, 34);
    const sp = t.lastIndexOf(' ');
    if (sp > 10) t = t.slice(0, sp);
    t += '…';
  }
  return t;
}

/* در گروه: منشن مستقیم به ربات یا ریپلای به پیام ربات */
async function groupWantsBot(env, m) {
  const t = String(m.text || '');
  if (normCmd(t).startsWith('/')) return true; // دستورات همیشه
  const bi = await botInfo(env);
  if (bi && t.includes('@' + bi.username)) return true;
  const rep = m.reply_to_message;
  if (rep && rep.from && rep.from.is_bot && bi && rep.from.id === bi.id) return true;
  if ((m.entities || []).some((e) => e.type === 'mention')) {
    if (bi && t.includes('@' + bi.username)) return true;
  }
  return false;
}

/* خواندن فایل ارسالی تلگرام (متنی/کد تا ~۲۰۰KB؛ PDF تا سقف PDF_MAX با گوگل) */

/* خواندن عکس تلگرام (base64) — دو مسیر: data-URL برای سرویس‌های کاستوم و
   آرایهٔ بایت برای مدل‌های ویژن کلادفلر. خروجی: { mime, b64, bytes } */
async function readTelegramPhoto(env, budget, size) {
  if (!size || size.file_size > CFG.VISION_MAX_BYTES) return null;
  let f = null;
  try {
    f = await tg(env, budget, 'getFile', { file_id: size.file_id });
  } catch (e) { await logErr(env, 'readphoto', e); return null; }
  if (!f || !f.file_path) return null;
  try {
    const res = await fetchT(TG_BASE + '/file/bot' + env.TELEGRAM_BOT_TOKEN + '/' + f.file_path, {}, 30000);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > CFG.VISION_MAX_BYTES) return null;
    const b64 = bufToB64(buf);
    const mime = guessMime(f.file_path);
    const id = { mime, b64, bytes: b64Bytes(b64) };
    return id;
  } catch (e) { await logErr(env, 'readphoto', e); return null; }
}

async function readTelegramFile(env, budget, doc) {
  try {
    const okTypes = ['text/', 'application/json', 'application/javascript', 'application/xml', 'application/x-yaml'];
    const mime = doc.mime_type || '';
    const name = String(doc.file_name || '');
    /* PDF: خودِ گوگل متنش را استخراج میکند (inline_data) — بدون کتابخانه و
       بدون خراب‌شدن فونت‌های CID فارسی. سقف جدا دارد چون سند است نه متن. */
    if (mime === 'application/pdf' || /\.pdf$/i.test(name)) {
      if ((doc.file_size || 0) > CFG.PDF_MAX) {
        return L(env, 'm1py50hw', name, Math.round(CFG.PDF_MAX / 1000000));
      }
      if (!(env.GEMINI_API_KEY || '').trim()) {
        return L(env, 'm1drucif', name);
      }
      const buf = await downloadTelegramFileBytes(env, budget, doc.file_id, CFG.PDF_MAX);
      if (!buf) return L(env, 'm0c71ikm', name);
      const txt = await geminiPdfText(env, buf);
      return L(env, 'm0wxcg0v', name, txt.slice(0, CFG.USER_FILE_INLINE));
    }
    if (doc.file_size > CFG.USER_FILE_MAX) return L(env, 'm12x15ww', name);
    if (!okTypes.some((x) => mime.startsWith(x)) && !/\.(txt|md|json|js|py|ts|html|css|csv|xml|yaml|yml|log|sh|c|cpp|java|go|rs)$/i.test(name)) {
      return null;
    }
    const f = await tg(env, budget, 'getFile', { file_id: doc.file_id });
    const res = await fetchT(TG_BASE + '/file/bot' + env.TELEGRAM_BOT_TOKEN + '/' + f.file_path, {}, 30000);
    if (!res.ok) return null;
    const body = await res.text();
    return L(env, 'm115nlgh', doc.file_name || L(env, 'm0abc4ft'), body.slice(0, CFG.USER_FILE_INLINE));
  } catch (e) { await logErr(env, 'readfile', e); return null; }
}

/* خواندنِ خامِ سند تلگرام (بدون پوشش پرامپت) — فقط برای بازیابی بکاپ JSON.
   با readTelegramFile فرق دارد: آن متن را برای مدل می‌بندد، اینجا محتوای
   اصلی لازم است تا JSON بتوان parse شود. */
async function readDocRaw(env, budget, doc, maxBytes) {
  try {
    const mime = String(doc.mime_type || '');
    const name = String(doc.file_name || '');
    const cap = maxBytes || CFG.BACKUP_MAX;
    const okType = mime.startsWith('application/json') || mime.startsWith('text/') || /\.json$/i.test(name);
    if (!okType) return null;
    if ((doc.file_size || 0) > cap) return null;
    const f = await tg(env, budget, 'getFile', { file_id: doc.file_id });
    if (!f || !f.file_path) return null;
    const res = await fetchT(TG_BASE + '/file/bot' + env.TELEGRAM_BOT_TOKEN + '/' + f.file_path, {}, 30000);
    if (!res.ok) return null;
    return (await res.text()).slice(0, cap);
  } catch (e) { await logErr(env, 'readdoc', e); return null; }
}

/* تجزیه ورودی یادآور */
function parseRemind(text) {
  /* فرمت‌ها (v5.4 کامل‌تر شد):
       18:30 متن                  → یک‌بار (فردا اگر گذشته)
       45m متن | 2h متن | 3d متن  → نسبت به این لحظه
       روزانه 08:00 متن            → هر روز
       هفتگی 08:00 متن             → هر هفت روز
       هر 5 روز 08:00 متن          → هر N روز
       ماهانه 08:00 روز 15 متن     → پانزدهم هر ماه (اگر آن ماه ۱۵ نداشت، آخر ماه) */
  /* 🔧 v5.4: ساعت/دقیقه باید معتبر باشند؛ وگرنه «99:99» با rollover
     تاریخچه به روز بعد می‌رفت و زمان بی‌معنی ثبت می‌شد. */
  const validHM = (h, m) => h >= 0 && h <= 23 && m >= 0 && m <= 59;
  let mm = text.match(/^(?:روزانه|daily)\s+(\d{1,2}):(\d{2})\s+(.+)$/i);
  if (mm && validHM(+mm[1], +mm[2])) {
    const t = tehran();
    let at = tehranToEpoch(t.y, t.m, t.d, +mm[1], +mm[2]);
    if (at <= Date.now()) at += 86400000;
    return { at, txt: mm[3].slice(0, 300), repeat: 'daily' };
  }
  mm = text.match(/^(?:هفتگی|weekly)\s+(\d{1,2}):(\d{2})\s+(.+)$/i);
  if (mm && +mm[1] <= 23 && +mm[2] <= 59) {
    const t = tehran();
    let at = tehranToEpoch(t.y, t.m, t.d, +mm[1], +mm[2]);
    if (at <= Date.now()) at += 86400000;
    return { at, txt: mm[3].slice(0, 300), repeat: 'weekly', step: 7 };
  }
  mm = text.match(/^هر\s+(\d{1,2})\s*روز\s+(\d{1,2}):(\d{2})\s+(.+)$/i);
  if (mm && validHM(+mm[2], +mm[3])) {
    const step = Math.max(1, Math.min(30, +mm[1]));
    const t = tehran();
    let at = tehranToEpoch(t.y, t.m, t.d, +mm[2], +mm[3]);
    if (at <= Date.now()) at += 86400000;
    return { at, txt: mm[4].slice(0, 300), repeat: 'interval', step };
  }
  mm = text.match(/^ماهانه\s+(\d{1,2}):(\d{2})\s+روز\s+(\d{1,2})\s+(.+)$/i);
  if (mm && validHM(+mm[1], +mm[2])) {
    const day = Math.max(1, Math.min(31, +mm[3]));
    const t = tehran();
    /* اگر آن ماه روز ۳۱ را ندارد (۳۰ روزه/اسفند)، آخرین روز ماه گرفته می‌شود
       نه اینکه Date.UTC به ماه بعد بپرد. */
    const lastThis = new Date(Date.UTC(t.y, t.m, 0)).getUTCDate();
    let at = tehranToEpoch(t.y, t.m, Math.min(day, lastThis), +mm[1], +mm[2]);
    if (at <= Date.now()) at = nextMonthEpoch(t.y, t.m, day, +mm[1], +mm[2]);
    return { at, txt: mm[4].slice(0, 300), repeat: 'monthly', day };
  }
  mm = text.match(/^(\d{1,2}):(\d{2})\s+(.+)$/);
  if (mm && validHM(+mm[1], +mm[2])) {
    const t = tehran();
    let at = tehranToEpoch(t.y, t.m, t.d, +mm[1], +mm[2]);
    if (at <= Date.now()) at += 86400000; // اگر گذشته، فردا
    return { at, txt: mm[3].slice(0, 300), repeat: 'none' };
  }
  mm = text.match(/^(\d+)\s*(m|h|d)\s+(.+)$/i);
  if (mm) {
    const mult = { m: 60000, h: 3600000, d: 86400000 }[mm[2].toLowerCase()];
    return { at: Date.now() + (+mm[1]) * mult, txt: mm[3].slice(0, 300), repeat: 'none' };
  }
  return null;
}

/* epoch ماه بعدی برای همان روز — اگر آن روز در ماه بعد نبود (۳۱ بهمن → ۳۰ اسفند) */
function nextMonthEpoch(y, m, day, h, min) {
  const nm = m + 1, ny = m === 12 ? y + 1 : y;
  const last = new Date(Date.UTC(ny, nm, 0)).getUTCDate(); // روزهای ماه بعد
  return tehranToEpoch(ny, nm, Math.min(day, last), h, min);
}

/* تگ تکرار برای نمایش فارسی در پیام تأیید */
function repeatLabel(env, r) {
  if (r === 'daily') return L(env, 'm0k2v20w');
  if (r === 'weekly') return L(env, 'm1wvtx2k');
  if (r === 'monthly') return L(env, 'm1jhc1hk');
  if (r === 'interval') return L(env, 'm11hu893');
  return L(env, 'm1dhy9ai');
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 23-reminder-intent
   تشخیص قصد یادآور از متن آزاد 🗣
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ v5.4: تشخیص قصد یادآور از متن آزاد 🗣 ═══════════════════
   «فردا ساعت ۵ یادم بنداز قبض رو بدم» بدون /remind.
   عمداً قاعده‌محور است (نه مدل): سریع، رایگان و بدون ریسک اشتباه؛ فقط وقتی
   عبارت یادآوری صریح است فعال می‌شود تا پیام‌های عادی به یادآور تبدیل نشوند. */
const NL_REMIND_RE = /(یادم\s*بنداز|یادآوری\s*کن|یادآور|remind\s*me|یادم\s*بیار|یادم\s*باشه|به\s*یادم\s*باشه)/i;

async function nlRemindIntent(text) {
  /* ارقام فارسی/عربی اول به انگلیسی تبدیل می‌شوند — وگرنه «۲ ساعت دیگه»
     هیچ‌وقت با \d نمی‌خواند و یادآور ساخته نمی‌شد. */
  const raw0 = String(text || '').trim();
  const s = normDigits(raw0);
  if (!s || s.length > 300) return null;
  if (s.charAt(0) === '/') return null; // خود دستور /remind جای خودش
  if (!NL_REMIND_RE.test(s)) return null;
  const t = tehran();
  const now = Date.now();
  let at = 0, clean = s;
  /* «فردا» / «پس‌فردا» + ساعت */
  const hmRaw = s.match(/(\d{1,2}):(\d{2})/);
  /* 🔧 v5.4: ساعت نامعتبر (مثل ۹۹:۹۹) نباید با rollover به روز بعد بپرد */
  const hm = hmRaw && +hmRaw[1] <= 23 && +hmRaw[2] <= 59 ? hmRaw : null;
  const dayOffset = /پس\s*فردا/.test(s) ? 2 : /فردا/.test(s) ? 1 : /امروز/.test(s) ? 0 : -1;
  if (hm && dayOffset >= 0) {
    at = tehranToEpoch(t.y, t.m, t.d + dayOffset, +hm[1], +hm[2]);
    if (at <= now) at += 86400000;
  } else if (hm) {
    at = tehranToEpoch(t.y, t.m, t.d, +hm[1], +hm[2]);
    if (at <= now) at += 86400000;
  } else {
    /* «۴۵ دقیقه دیگه» / «۲ ساعت دیگه» / «۳ روز دیگه» */
    const rel = s.match(/(\d{1,3})\s*(دقیقه|ساعت|روز|min|hour|day|m|h|d)(?:\s*دیگه|\s*بعد|\s*later)?/i);
    if (rel) {
      const unit = rel[2].toLowerCase();
      const mult = /دقیقه|min|^m$/.test(unit) ? 60000 : /ساعت|hour|^h$/.test(unit) ? 3600000 : 86400000;
      at = now + (+rel[1]) * mult;
    }
  }
  if (!at) return null;
  /* متن یادآور: عبارت‌های زمانی و دستوری حذف میشوند تا متن تمیز بماند */
  clean = s
    .replace(/(پس\s*فردا|فردا|امروز)/g, ' ')
    .replace(/(\d{1,2}):(\d{2})/g, ' ')
    .replace(/(\d{1,3})\s*(دقیقه|ساعت|روز)\s*(دیگه|بعد)?/g, ' ')
    .replace(/(یادم\s*بنداز|یادآوری\s*کن|یادآور|remind\s*me|یادم\s*بیار|یادم\s*باشه|به\s*یادم\s*باشه)/gi, ' ')
    .replace(/(ساعت|که|را|رو)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length < 2) clean = s.slice(0, 120);
  return { at, txt: clean.slice(0, 300), repeat: 'none', src: 'nl' };
}

/* ── اجرای دستورات؛ خروجی true یعنی مدیریت شد ── */
async function handleCommand(env, budget, chatId, uid, m, text, u, isGroup) {
  const cmd = text.split(/\s+/)[0].toLowerCase().replace(/@[\w_]+$/, '');
  const arg = text.split(/\s+/).slice(1).join(' ');
  const scope = scopeOf(chatId, u, isGroup);

  switch (cmd) {
    case '/start':
      if (!isGroup) await sendMsg(env, budget, chatId,
        L(env, 'm07llsqr', EMOJI.fire));
      return await mainMenu(env, budget, chatId, uid);
    case '/help':
      return await sendMsg(env, budget, chatId, pick(env, HELP_TEXT, HELP_TEXT_EN), [[{ text: L(env, 'm0s5o55t', EMOJI.robot), callback_data: 'home' }]]);
    case '/model':
      env._menuMsg = null;
      return await showModels(env, budget, chatId, 0);
    case '/settings':
      env._menuMsg = null;
      return await settingsMenu(env, budget, chatId, uid);
    case '/stats':
      env._menuMsg = null;
      return await statsView(env, budget, chatId, uid);
    case '/new': {
      const th = curThread(u);
      th.ts = Date.now();
      /* گفتگویی که عنوانش را خودکار گرفته بود از نو عنوان می‌گیرد تا بعد از /new
         عنوانِ پیامِ قبلی را نشان ندهد. عنوان دستیِ کاربر دست‌نخورده می‌ماند. */
      if (th.auto === 1) {
        delete th.auto;
        th.name = L(env, 'm1erlebc', Math.max(1, (u.threads || []).indexOf(th) + 1));
      }
      await kvPut(env, 'h:' + scope, { msgs: [], used: 0 });
      await putUser(env, uid, u);
      await sendMsg(env, budget, chatId, L(env, 'm0m32lf1', EMOJI.ok, esc(th.name)));
      return true;
    }
    case '/ping':
      env._menuMsg = null;
      return await healthCheck(env, budget, chatId);
    case '/export':
      return await exportChat(env, budget, chatId, uid);
    case '/pladd':
      u.wait = { type: 'panew', ts: Date.now() }; await putUser(env, uid, u);
      return await sendMsg(env, budget, chatId, L(env, 'm16ee8fa'));
    case '/cancel':
      u.wait = null; await putUser(env, uid, u);
      return await sendMsg(env, budget, chatId, L(env, 'm0ytwmc4', EMOJI.ok));
    case '/provideradd': {
      if (isGroup) return await sendMsg(env, budget, chatId, L(env, 'm0mj740u'));
      if (!(await isAdmin(env, uid))) return await sendMsg(env, budget, chatId, L(env, 'm0w12m1w'));
      env._menuMsg = null;
      return await pvAsk(env, budget, chatId, uid, u, 'pv_name', {});
    }
    case '/providers': {
      if (isGroup) return await sendMsg(env, budget, chatId, L(env, 'm16uowci'));
      if (!(await isAdmin(env, uid))) return await sendMsg(env, budget, chatId, L(env, 'm0san7u4'));
      env._menuMsg = null;
      return await providersMenu(env, budget, chatId);
    }
    case '/remind': {
      const r = parseRemind(arg);
      if (!r) return await sendMsg(env, budget, chatId, L(env, 'm11cp206'));
      const k = 'rm:' + hash32(uid + r.at + Math.random());
      await kvPut(env, k, { uid, chat: chatId, at: r.at, txt: r.txt, repeat: (r.repeat || 'none') }, Math.max(60, Math.ceil((r.at - Date.now()) / 1000) + 120));
      const d = new Date(r.at + 210 * 60000);
      return await sendMsg(env, budget, chatId, L(env, 'm0zh1oic', EMOJI.ok, r.repeat === 'daily' ? L(env, 'm18eeume') : '', d.getUTCHours(), String(d.getUTCMinutes()).padStart(2, '0'), esc(r.txt)));
    }
    case '/web': {
      if (!arg.trim()) return await sendMsg(env, budget, chatId, L(env, 'm1jgabks'));
      if (!toolAvailable(env, 'search')) return await sendMsg(env, budget, chatId, L(env, 'm0web_off'));
      if (!(env.SEARCH_API_KEY || '').trim()) return await sendMsg(env, budget, chatId, L(env, 'm1i06i2v'));
      const typing = startTyping(env, chatId);
      try {
        await typingOn(env, budget, chatId);
        const ans = await tavilySearch(env, arg.trim(), CFG.SEARCH_MAX_RESULTS);
        const { msgs } = await buildMessages(env, u.st, scope, null, L(env, 'm0x828qa', arg.trim().slice(0, 200), ans), knownCtx(u.st.model), uid);
        msgs.push({ role: 'user', content: L(env, 'm132pgpd', arg.trim()) });
        const r = await aiChat(env, u.st.model, msgs, { temperature: u.st.temperature, maxTokens: u.st.maxTokens, ...cbOff(u.st) });
        const parts = chunkText(mdToHtml(r.text));
        await sendMsg(env, budget, chatId, parts[0]);
        for (let i = 1; i < parts.length; i++) await sendMsg(env, budget, chatId, parts[i]);
        await bumpUsage(env, uid, est(arg) + 1500, (r.usage && r.usage.completion_tokens) || est(r.text));
      } catch (e) {
        await sendMsg(env, budget, chatId, L(env, 'm0bflqnb', EMOJI.err, esc(String((e && e.message) || e).slice(0, 200))));
      } finally { typing.stop = true; }
      return true;
    }
    case '/weather': {
      try {
        const w = await toolWeather(env);
        return await sendMsg(env, budget, chatId, L(env, 'm13r3zno', esc(w)));
      } catch (e) { return await sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(String((e && e.message) || e).slice(0, 160))); }
    }
    case '/crypto': {
      try {
        const c = await toolCrypto(env);
        return await sendMsg(env, budget, chatId, L(env, 'm02n8h7e', esc(c)));
      } catch (e) { return await sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(String((e && e.message) || e).slice(0, 160))); }
    }
    case '/image':
    case '/img': {
      if (!toolAvailable(env, 'img')) {
        return await sendMsg(env, budget, chatId, L(env, 'm0img_off'));
      }
      if (u.st.imgGen === false) {
        return await sendMsg(env, budget, chatId,
          L(env, 'm0w1ho9v'),
          [[{ text: L(env, 'm07r2tk2'), callback_data: 'st:ig' }], [{ text: L(env, 'm1t3qh5r'), callback_data: 'set' }]]);
      }
      if (!gemKey(env) && u.st.imgFree === false) return await sendMsg(env, budget, chatId,
        L(env, 'm0ja2c6v'));
      if (!arg.trim()) return await sendMsg(env, budget, chatId,
        L(env, 'm1dii9n0', esc(u.st.imgModel || CFG.IMG_MODEL_DEFAULT)));
      /* سقف روزانه باید اینجا هم بسته شود — قبلاً چت/ویجت سقف داشت ولی تصویر
         نه، یعنی بعد از پر شدن سقف می‌شد بی‌نهایت عکس گرفت. */
      const imgLim = await checkDailyLimit(env, uid, u.st);
      if (imgLim) return await sendMsg(env, budget, chatId, imgLim);
      const imgQ = await quotaTake(env, uid, 'img');
      if (imgQ) return await sendMsg(env, budget, chatId, imgQ);
      const typing = startTyping(env, chatId);
      try {
        await typingOn(env, budget, chatId);
        const img = await geminiImage(env, arg.trim(), u.st.imgModel || CFG.IMG_MODEL_DEFAULT, { free: u.st.imgFree !== false });
        await quotaBump(env, uid, 'img');
        await imgGallerySave(env, uid, { b64: img.b64, mime: img.mime, prompt: arg.trim() });
        const fd = new FormData();
        fd.append('chat_id', String(chatId));
        fd.append('photo', new Blob([appB64Bytes(img.b64)], { type: img.mime || 'image/png' }), 'behrad-image.png');
        fd.append('parse_mode', 'HTML');
        fd.append('caption', '🎨 ' + esc(arg.trim().slice(0, 900)) + '\n<i>' + esc(img.via || (u.st.imgModel || CFG.IMG_MODEL_DEFAULT)) + '</i>');
        await tg(env, budget, 'sendPhoto', null, fd);
        await bumpUsage(env, uid, est(arg) + 600, 0);
      } catch (e) {
        await logErr(env, 'image', e);
        await sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(String((e && e.message) || e).slice(0, 300)));
      } finally { typing.stop = true; }
      return true;
    }
    case '/tts': {
      if (!toolAvailable(env, 'tts')) return await sendMsg(env, budget, chatId, L(env, 'm0tts_off'));
      const q = arg.trim();
      if (!q) return await sendMsg(env, budget, chatId,
        L(env, 'm14ls76j', esc(u.st.voiceName || 'Kore'), esc(u.st.ttsModel || GEM_TTS_MODELS[0].id)));
      if (!gemKey(env)) return await sendMsg(env, budget, chatId,
        L(env, 'm1rjzl9l'));
      const ttsLim = await checkDailyLimit(env, uid, u.st);
      if (ttsLim) return await sendMsg(env, budget, chatId, ttsLim);
      const typing = startTyping(env, chatId);
      try {
        await typingOn(env, budget, chatId);
        /* voiceProv گوگل اجباری است: اگر کاربر کلادفلر را انتخاب کرده باشد
           MeloTTS فارسی ندارد و جواب، بی‌کیفیت یا خالی می‌شود. */
        const okv = await sendVoiceReply(env, budget, chatId, q, { ...u.st, voiceProv: 'google' });
        if (!okv) return await sendMsg(env, budget, chatId, L(env, 'm1yjv98q', EMOJI.err));
        await bumpUsage(env, uid, est(q) + 500, 0);
      } catch (e) {
        await logErr(env, 'tts_cmd', e);
        await sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(String((e && e.message) || e).slice(0, 220)));
      } finally { typing.stop = true; }
      return true;
    }
    /* ── v5.4: جستجو در تاریخچهٔ همهٔ گفتگوها ── */
    case '/find': {
      const qf = arg.trim();
      if (!qf) return await sendMsg(env, budget, chatId, L(env, 'm0uxc72i'));
      const typing = startTyping(env, chatId);
      try {
        const found = await histFind(env, uid, scope, qf);
        if (found.error) return await sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(found.error));
        if (!found.hits.length) return await sendMsg(env, budget, chatId, L(env, 'm102js5y', esc(qf)));
        const lines = found.hits.map((h, i) =>
          esc(num(i + 1) + '. ' + h.thread + ' · ' + h.role + '\n   ' + h.snip)).join('\n');
        return await sendMsg(env, budget, chatId,
          L(env, 'm1cai5l5', num(found.total), esc(qf), lines));
      } finally { typing.stop = true; }
    }
    /* ── v5.4: گالری تصاویر ── */
    case '/gallery': {
      const list = await imgGalleryList(env, uid);
      if (!list.length) return await sendMsg(env, budget, chatId, L(env, 'm1krerrn'));
      const ng = parseInt(normDigits(arg).replace(/[^0-9]/g, ''), 10);
      if (ng >= 1 && ng <= list.length) {
        const item = list[ng - 1];
        const img = await imgGalleryGet(env, uid, item.id);
        if (!img) return await sendMsg(env, budget, chatId, L(env, 'm0w4e92h', EMOJI.err));
        const fd = new FormData();
        fd.append('chat_id', String(chatId));
        fd.append('photo', new Blob([appB64Bytes(img.b64)], { type: img.mime || 'image/png' }), 'gallery.png');
        fd.append('parse_mode', 'HTML');
        fd.append('caption', '🖼 ' + esc(String(item.prompt || L(env, 'm1if2w6h')).slice(0, 900)));
        try { await tg(env, budget, 'sendPhoto', null, fd); } catch (e) { await logErr(env, 'gallery_send', e); }
        return true;
      }
      const rows = list.map((x, i) => esc(num(i + 1) + '. ' + String(x.prompt || L(env, 'm1if2w6h')).slice(0, 60))).join('\n');
      return await sendMsg(env, budget, chatId,
        L(env, 'm1pm7ic1', num(list.length), rows));
    }
    /* ── v5.4: خلاصه‌ساز هوشمند ── */
    case '/sum': {
      if (!toolAvailable(env, 'sum')) return await sendMsg(env, budget, chatId, L(env, 'm0sum_off'));
      /* منبع: ریپلای، آرگومان متن، یا آخرین خروجی گفتگو */
      let src = arg.trim();
      let title = '';
      const rp = m.reply_to_message;
      if (!src && rp && (rp.text || rp.caption)) src = String(rp.text || rp.caption);
      if (!src) {
        /* آخرین پیام دستیار در این گفتگو */
        const h = await histGet(env, scope);
        for (let i = h.msgs.length - 1; i >= 0; i--) {
          if (h.msgs[i].role !== 'user' && h.msgs[i].content) { src = String(h.msgs[i].content); break; }
        }
        title = L(env, 'm08mh1dc');
      }
      if (!src.trim()) return await sendMsg(env, budget, chatId, L(env, 'm0qwnp48'));
      const limit = await checkDailyLimit(env, uid, u.st);
      if (limit) return await sendMsg(env, budget, chatId, limit);
      const typing = startTyping(env, chatId);
      try {
        await typingOn(env, budget, chatId);
        const res = await summarizeText(env, u.st.model, u.st, src, { title });
        const parts = chunkText(mdToHtml(L(env, 'm125ytt6', res.reduced ? ' <i>(' + num(res.parts) + L(env, 'm06ta784') : '', res.text || L(env, 'm0q7ytpb'), res.cut ? L(env, 'm13tao4t') + num(CFG.SUM_MAX_PARTS * CFG.SUM_CHUNK) + L(env, 'm1h6doxp') : '')));
        await sendMsg(env, budget, chatId, parts[0]);
        for (let i = 1; i < parts.length; i++) await sendMsg(env, budget, chatId, parts[i]);
        await bumpUsage(env, uid, est(src), est(res.text || ''));
      } catch (e) {
        await logErr(env, 'sum', e);
        await sendMsg(env, budget, chatId, L(env, 'm0c85s0a', EMOJI.err, esc(String((e && e.message) || e).slice(0, 220))));
      } finally { typing.stop = true; }
      return true;
    }
    /* ── v5.4: تودولیست ── */
    case '/todo': {
      const a2 = arg.trim();
      if (!a2 || /^(list|لیست|همه)$/i.test(a2)) {
        const arr = await todoGet(env, uid);
        if (!arr.length) return await sendMsg(env, budget, chatId, L(env, 'm1c1m55m'));
        const lines = arr.map((x, i) => (x.done ? '✅ ' : '⬜ ') + num(i + 1) + '. ' + esc(x.t)).join('\n');
        return await sendMsg(env, budget, chatId, L(env, 'm1c9x46b', num(arr.filter((x) => !x.done).length), lines));
      }
      let mm2 = /^(done|انجام|تیک)\s+(\d+)$/i.exec(a2);
      if (mm2) {
        const arr = await todoGet(env, uid);
        const i = +mm2[2] - 1;
        if (!arr[i]) return await sendMsg(env, budget, chatId, L(env, 'm080aqqz', EMOJI.err));
        arr[i].done = !arr[i].done;
        await todoPut(env, uid, arr);
        return await sendMsg(env, budget, chatId, (arr[i].done ? L(env, 'm15od1xf', EMOJI.ok) : L(env, 'm1bsefql')) + esc(arr[i].t));
      }
      mm2 = /^(del|حذف)\s+(\d+)$/i.exec(a2);
      if (mm2) {
        const arr = await todoGet(env, uid);
        const i = +mm2[2] - 1;
        if (!arr[i]) return await sendMsg(env, budget, chatId, L(env, 'm080aqqz', EMOJI.err));
        const rm = arr.splice(i, 1)[0];
        await todoPut(env, uid, arr);
        return await sendMsg(env, budget, chatId, L(env, 'm02h4m74', esc(rm.t)));
      }
      if (/^(clear|پاک)$/i.test(a2)) {
        await todoPut(env, uid, []);
        return await sendMsg(env, budget, chatId, L(env, 'm1nqv4pm', EMOJI.ok));
      }
      const it = await todoAdd(env, uid, a2);
      if (!it) return await sendMsg(env, budget, chatId, L(env, 'm03lhvxb', EMOJI.err));
      const arr = await todoGet(env, uid);
      return await sendMsg(env, budget, chatId, L(env, 'm04pv010', EMOJI.ok, esc(it.t), num(arr.filter((x) => !x.done).length)));
    }
    /* ── v5.4: تسک‌های زمان‌بندی‌شده با AI ── */
    case '/task': {
      const a3 = arg.trim();
      if (!a3 || /^(list|لیست)$/i.test(a3)) {
        const list = await taskList(env, uid);
        if (!list.length) return await sendMsg(env, budget, chatId,
          L(env, 'm1hxe77c'));
        const lines = list.map((t, i) => {
          const d = new Date((t.at || 0) + 210 * 60000);
          const hh = String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0');
          return num(i + 1) + '. ' + repeatLabel(env, t.repeat) + ' ' + hh + ' — ' + esc(String(t.prompt).slice(0, 60));
        }).join('\n');
        return await sendMsg(env, budget, chatId, L(env, 'm0d3w221', num(list.length), lines));
      }
      let md = /^(del|حذف)\s+(\d+)$/i.exec(a3);
      if (md) {
        const list = await taskList(env, uid);
        const t = list[+md[2] - 1];
        if (!t) return await sendMsg(env, budget, chatId, L(env, 'm080aqqz', EMOJI.err));
        await taskDel(env, uid, t.id);
        return await sendMsg(env, budget, chatId, L(env, 'm1nwlaw0'));
      }
      const parsed = parseRemind(a3);
      if (!parsed) return await sendMsg(env, budget, chatId,
        L(env, 'm0lcog11'));
      const list = await taskList(env, uid);
      if (list.length >= CFG.TASK_MAX) return await sendMsg(env, budget, chatId, L(env, 'm11dawz9', num(CFG.TASK_MAX)));
      /* متن پرامپت: حذف عبارت زمان از ابتدای متن */
      const tt = { uid, chat: chatId, id: 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4), prompt: parsed.txt.replace(/^\s+|\s+$/g, '').slice(0, CFG.TASK_PROMPT_MAX), repeat: parsed.repeat || 'none', step: parsed.step, day: parsed.day, at: parsed.at, ts: Date.now() };
      if (!tt.prompt) tt.prompt = a3.slice(0, CFG.TASK_PROMPT_MAX);
      await taskSave(env, tt);
      const dd = new Date(tt.at + 210 * 60000);
      return await sendMsg(env, budget, chatId, L(env, 'm0nl90pu', EMOJI.ok, repeatLabel(env, tt.repeat), dd.getUTCHours(), String(dd.getUTCMinutes()).padStart(2, '0'), esc(tt.prompt.slice(0, 120))));
    }
    /* ── v5.4: جستجوی حافظه ── */
    case '/memfind': {
      const qm = arg.trim();
      if (!qm) return await sendMsg(env, budget, chatId, L(env, 'm06pteoj'));
      const res = await memSearch(env, uid, qm);
      if (!res.length) return await sendMsg(env, budget, chatId, L(env, 'm04vqfrq', esc(qm)));
      const lines = res.map((x, i) => num(i + 1) + '. ' + (x.tag ? '<b>[' + esc(x.tag) + ']</b> ' : '') + esc(x.t)).join('\n');
      return await sendMsg(env, budget, chatId, L(env, 'm0ukz3bq', num(res.length), lines));
    }
    /* ── v5.4: ویرایش عکس با توضیح (روی ریپلای عکس) ── */
    case '/edit': {
      const ed = arg.trim();
      if (!ed) return await sendMsg(env, budget, chatId,
        L(env, 'm0frncj9'));
      const rpImg = m.reply_to_message;
      const sizes = [];
      if (rpImg && Array.isArray(rpImg.photo) && rpImg.photo.length) sizes.push(rpImg.photo[rpImg.photo.length - 1]);
      if (Array.isArray(m.photo) && m.photo.length) sizes.push(m.photo[m.photo.length - 1]);
      if (!sizes.length) return await sendMsg(env, budget, chatId,
        L(env, 'm0w8486t'));
      if (u.st.imgGen === false) return await sendMsg(env, budget, chatId, L(env, 'm0wbseun'));
      const lim2 = await checkDailyLimit(env, uid, u.st);
      if (lim2) return await sendMsg(env, budget, chatId, lim2);
      const q2 = await quotaTake(env, uid, 'img');
      if (q2) return await sendMsg(env, budget, chatId, q2);
      const typing = startTyping(env, chatId);
      try {
        await typingOn(env, budget, chatId);
        const imgs = [];
        for (const sz of sizes.slice(0, CFG.IMG_EDIT_MAX_N)) {
          const im = await readTelegramPhoto(env, budget, sz);
          if (im) imgs.push({ b64: im.b64, mime: im.mime });
        }
        if (!imgs.length) return await sendMsg(env, budget, chatId, L(env, 'm1kuzdn2', EMOJI.err));
        const img = await geminiImageEdit(env, ed, imgs, u.st.imgModel || CFG.IMG_MODEL_DEFAULT);
        await quotaBump(env, uid, 'img');
        await imgGallerySave(env, uid, { b64: img.b64, mime: img.mime, prompt: '✏️ ' + ed });
        const fd = new FormData();
        fd.append('chat_id', String(chatId));
        fd.append('photo', new Blob([appB64Bytes(img.b64)], { type: img.mime || 'image/png' }), 'behrad-edit.png');
        fd.append('parse_mode', 'HTML');
        fd.append('caption', '🖌 ' + esc(ed.slice(0, 900)) + '\n<i>' + esc(img.via || '') + '</i>');
        await tg(env, budget, 'sendPhoto', null, fd);
        await bumpUsage(env, uid, est(ed) + 1000, 0);
      } catch (e) {
        await logErr(env, 'img_edit', e);
        await sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(String((e && e.message) || e).slice(0, 300)));
      } finally { typing.stop = true; }
      return true;
    }
    case '/translate': {
      if (!toolAvailable(env, 'translate')) return await sendMsg(env, budget, chatId, L(env, 'm0tr_off'));
      if (!q) return await sendMsg(env, budget, chatId,
        L(env, 'm1alst2r'));
      const trLim = await checkDailyLimit(env, uid, u.st);
      if (trLim) return await sendMsg(env, budget, chatId, trLim);
      const typing = startTyping(env, chatId);
      try {
        await typingOn(env, budget, chatId);
        /* تک‌باره و بدون ثبت در تاریخچه: buildMessages تاریخچه را می‌خواند ولی
           histPut فقط در runChatReply انجام میشود، پس تاریخچه تمیز می‌ماند. */
        const { msgs } = await buildMessages(env, u.st, scope, null, pick(env, TRANSLATE_SYS, TRANSLATE_SYS_EN), knownCtx(u.st.model), uid);
        msgs.push({ role: 'user', content: q });
        const r = await aiChat(env, u.st.model, msgs, { temperature: 0.2, maxTokens: u.st.maxTokens, ...cbOff(u.st) });
        const parts = chunkText(mdToHtml(r.text));
        await sendMsg(env, budget, chatId, '🌐 ' + parts[0]);
        for (let i = 1; i < parts.length; i++) await sendMsg(env, budget, chatId, parts[i]);
        await bumpUsage(env, uid, est(q) + 800, (r.usage && r.usage.completion_tokens) || est(r.text));
      } catch (e) {
        await sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(String((e && e.message) || e).slice(0, 220)));
      } finally { typing.stop = true; }
      return true;
    }
    case '/remember': {
      if (!arg.trim()) return await sendMsg(env, budget, chatId, L(env, 'm07b2ga0'));
      const ok = await memAdd(env, uid, arg.trim());
      return await sendMsg(env, budget, chatId, ok ? L(env, 'm16pccr9', EMOJI.ok) : L(env, 'm1y16hbu'));
    }
    case '/forget': {
      const a = arg.trim();
      if (!a || a === 'all') { await memPut(env, uid, []); return await sendMsg(env, budget, chatId, L(env, 'm13u55s5', EMOJI.ok)); }
      const n = parseInt(normDigits(a).replace(/[^0-9]/g, ''), 10);
      const arr = await memGet(env, uid);
      if (n >= 1 && n <= arr.length) { arr.splice(n - 1, 1); await memPut(env, uid, arr); return await sendMsg(env, budget, chatId, L(env, 'm1vnpove', EMOJI.ok, n)); }
      return await sendMsg(env, budget, chatId, L(env, 'm0fwcdxf', EMOJI.err));
    }
    case '/memory': {
      const arr = await memGet(env, uid);
      if (!arr.length) return await sendMsg(env, budget, chatId, L(env, 'm0fgs1co'));
      return await sendMsg(env, budget, chatId, L(env, 'm00e9yn3', arr.length, arr.map((x, i) => (i + 1) + '. ' + esc(x.t)).join('\n')));
    }
    case '/brief': {
      u.st.briefing = u.st.briefing === false;
      await putUser(env, uid, u);
      if (u.st.briefing === false) return await sendMsg(env, budget, chatId, L(env, 'm0ajkdai'));
      await sendMsg(env, budget, chatId, L(env, 'm1e9jws6'));
      try { await sendMorningBriefing(env, uid, chatId); } catch {}
      return true;
    }
  }
  return false;
}

/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 24-inline-mode
   حالت اینلاین 💬
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ حالت اینلاین 💬 ═══════════════════ */
async function onInlineQuery(env, upd) {
  const iq = upd.inline_query;
  const uid = String(iq.from.id);
  if (!(await isAllowed(env, uid))) {
    try {
      await fetchT(TG_BASE + '/bot' + env.TELEGRAM_BOT_TOKEN + '/answerInlineQuery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: J({ inline_query_id: iq.id, results: [], cache_time: 1 }),
      }, 8000);
    } catch {}
    return;
  }
  const q = String(iq.query || '').trim();
  if (q.length < 3 || normCmd(q).startsWith('/')) {
    try {
      await fetchT(TG_BASE + '/bot' + env.TELEGRAM_BOT_TOKEN + '/answerInlineQuery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: J({
          inline_query_id: iq.id, cache_time: 5,
          results: [{
            type: 'article', id: 'hint', title: L(env, 'm1f1b1sd'),
            description: L(env, 'm1sx0npz'),
            input_message_content: { message_text: L(env, 'm1ujmzgb') },
          }],
        }),
      }, 8000);
    } catch {}
    return;
  }
  /* سوال موقتاً ذخیره میشود؛ جواب واقعی هنگام chosen_inline_result ساخته میشود */
  const qid = 'iq:' + hash32(uid + q);
  await kvPut(env, qid, { uid, q, at: Date.now() }, 1800);
  try {
    await fetchT(TG_BASE + '/bot' + env.TELEGRAM_BOT_TOKEN + '/answerInlineQuery', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: J({
        inline_query_id: iq.id, cache_time: 1,
        results: [{
          type: 'article', id: hash32(q),
          title: L(env, 'm0x74pip', q.slice(0, 60)),
          description: L(env, 'm1qajgbf'),
          input_message_content: { message_text: L(env, 'm1pkarij', esc(q.slice(0, 80))), parse_mode: 'HTML' },
        }],
      }),
    }, 8000);
  } catch {}
}

async function onChosenInline(env, res) {
  /* 🔒 v5.4: دسترسی و مالکیت کوئری دوباره چک می‌شود — کار در نتایج
     اینلاین ممکن است ساعتی قدیمی باشد و کاربر در این فاصله از لیست مجاز
     حذف شده باشد؛ ضمناً رکورد iq: باید مال همین فرستنده باشد. */
  if (!(await isAllowed(env, String(res.from.id)))) return;
  const qid = 'iq:' + hash32(res.from.id + res.query);
  const v = await kvGet(env, qid, null);
  if (!v || String(v.uid) !== String(res.from.id)) return;
  await kvDel(env, qid);
  const u = await getUser(env, v.uid);
  const scope = 'c' + res.from.id + ':' + u.thread;
  /* پاسخ به‌صورت پیام جدا فرستاده میشود چون ویرایش پیام اینلاین ممکن نیست */
  const budget = newBudget(CFG.TG_BUDGET_MSG);
  await runChatReply(env, budget, res.from.id, v.uid, scope, u.st, v.q, {});
}
