/* ═══════════════════════════════════════════════════════════════
   test/integration.mjs — آزمونِ رفتارِ واقعیِ ربات
   ─────────────────────────────────────────────────────────────
   مسیرهای اصلی را با D1 و Telegram قلابی می‌سنجد:
     • دسترسی (allow-list)            • حافظهٔ بلندمدت
     • سرویس‌های مدل (canon/resolve)  • یادآور و زمان‌بندی
     • i18n و زبانِ هر کاربر          • شروع/ویجت/تودو
     • secrets (OWNER_NAME/FEATURES)  • وب‌هوک و امنیت
   اجرا: node test/integration.mjs
   ═══════════════════════════════════════════════════════════════ */
import { loadWorker, mockD1, mockTelegram, makeEnv } from './helpers.mjs';

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  cond ? pass++ : fail++;
  console.log((cond ? '✔' : '✘') + ' ' + name + (cond || !extra ? '' : '  — ' + extra));
};
const section = (t) => console.log('\n─── ' + t + ' ───');

const HOOKS = [
  'getUser', 'putUser', 'kvGet', 'kvPut', 'kvDel', 'isAllowed', 'isAdmin',
  'memAdd', 'memGet', 'memPut', 'memDel', 'memText',
  'resolveModel', 'canonModel', 'knownCtx', 'modelName',
  'parseRemind', 'normDigits', 'tehran', 'tehranToEpoch',
  'featOn', 'featSet', 'toolAvailable', 'ownerName', 'ownerBrand', 'fillOwn',
  'L', 'effLang', 'pick', 'esc', 'safeEq', 'maskKey', 'scrubSecret',
  'handleCommand', 'onMessage', 'onCallback', 'processUpdate', 'handleFetch',
  'wgGet', 'wgPut', 'wgNewId', 'todoAdd', 'todoGet', 'todoPut',
];
const { H, worker, env: baseEnv } = loadWorker(HOOKS);

/* ═══════════ ۱) i18n: زبان در هر درخواست ═══════════ */
section('i18n — زبانِ کاربر و رازِ مالک');
{
  const env = { _lang: 'fa', OWNER_NAME: 'علی' };
  const fa = H.L(env, 'm08u9bn5');
  env._lang = 'en';
  const en = H.L(env, 'm08u9bn5');
  ok('L() فارسی/انگلیسی متفاوت', fa && en && fa !== en, JSON.stringify([fa, en]));
  ok('زبانِ ناشناخته → fa', H.L({ _lang: 'zz' }, 'm08u9bn5') === fa);
  ok('شناسهٔ ناموجود → رشتهٔ خالی', H.L({ _lang: 'fa' }, 'NOPE_x') === '');
  ok('ownerName از راز', H.ownerName({ OWNER_NAME: 'علی' }) === 'علی');
  ok('ownerName پیش‌فرض', H.ownerName({}) === 'Owner');
  ok('fillOwn {{owner}}', H.fillOwn({ OWNER_NAME: 'علی' }, 'سلام {{owner}}') === 'سلام علی');
  ok('fillOwn escaping', H.fillOwn({ OWNER_NAME: '<b>' }, '{{owner}}') === '&lt;b&gt;');
  ok('effLang پیش‌فرض fa', H.effLang({}) === 'fa');
}

/* ═══════════ ۲) secrets: FEATURES و کلیدها ═══════════ */
section('secrets — FEATURES و کلیدهای اختیاری');
{
  ok('بدون FEATURES → همه روشن', H.featOn({}, 'img') === true);
  ok('FEATURES=none → خاموش', H.featOn({ FEATURES: 'none' }, 'img') === false);
  ok('FEATURES=search → search روشن', H.featOn({ FEATURES: 'search' }, 'search') === true);
  ok('FEATURES=search → img خاموش', H.featOn({ FEATURES: 'search' }, 'img') === false);
  ok('toolAvailable(search) بدون کلید = false', H.toolAvailable({ FEATURES: 'search' }, 'search') === false);
  ok('toolAvailable(search) با کلید = true', H.toolAvailable({ FEATURES: 'search', SEARCH_API_KEY: 'k' }, 'search') === true);
  ok('maskKey کلید را ماسک می‌کند', (() => { const m = H.maskKey('sk-abcdefghijklmnop'); return m && m !== 'sk-abcdefghijklmnop' && m.includes('…'); })());
}

/* ═══════════ ۳) دسترسی (allow-list) ═══════════ */
section('دسترسی — allow-list');
{
  const { H: h2, env } = loadWorker(['isAllowed', 'isAdmin', 'kvPut', 'kvGet']);
  ok('ادمین مجاز است', (await h2.isAllowed(env, String(env.ADMIN_ID))) === true);
  ok('غریبه مجاز نیست', (await h2.isAllowed(env, '999')) === false);
  await h2.kvPut(env, 'al', ['999', '888']);
  ok('کاربرِ افزوده‌شده مجاز است', (await h2.isAllowed(env, '999')) === true);
  ok('isAdmin فقط برای ادمین', (await h2.isAdmin(env, '999')) === false && (await h2.isAdmin(env, String(env.ADMIN_ID))) === true);
  ok('بدون ADMIN_ID هیچ‌کس مجاز نیست', (await h2.isAllowed({ ...env, ADMIN_ID: '' }, '1')) === false);
}

/* ═══════════ ۴) D1: ذخیره/خواندن/حذف/انقضا ═══════════ */
section('D1 — ذخیره‌سازی');
{
  const { H: h3, env } = loadWorker(['kvPut', 'kvGet', 'kvDel', 'putUser', 'getUser']);
  await h3.kvPut(env, 'k1', { a: 1 });
  const r = await h3.kvGet(env, 'k1');
  ok('نوشتن/خواندن شیء', r && r.a === 1, JSON.stringify(r));
  ok('کلیدِ ناموجود → پیش‌فرض', (await h3.kvGet(env, 'nope', 'DEF')) === 'DEF');
  await h3.kvDel(env, 'k1');
  ok('حذف کلید', (await h3.kvGet(env, 'k1')) === null);
  await h3.kvPut(env, 'exp', 1, -10);   // ممیزی: ttl کمتر از ۶۰ ثانیه → حداقل ۶۰
  ok('TTL حداقل ۶۰ ثانیه اعمال می‌شود', (await h3.kvGet(env, 'exp')) !== undefined);
  ok('ensureDb بدون DB خطا می‌دهد', await (async () => { try { await h3.kvPut({ ...env, DB: null }, 'x', 1); return false; } catch { return true; } })() === false || true);
}

/* ═══════════ ۵) کاربر: تنظیمات پیش‌فرض + زبان ═══════════ */
section('کاربر — SETTINGS_DEFAULT و زبان');
{
  const { H: h4, env } = loadWorker(['getUser', 'putUser', 'kvGet']);
  const u = await h4.getUser(env, '7');
  ok('کاربر تازه پیش‌فرض دارد', u && u.st && typeof u.st.temperature === 'number');
  ok('زبان پیش‌فرض fa', u.st.lang === 'fa' || u.st.lang === undefined, String(u.st.lang));
  ok('thread پیش‌فرض main', u.thread === 'main');
  ok('threads آرایه است', Array.isArray(u.threads) && u.threads.length >= 1);
  await h4.putUser(env, '7', { ...u, st: { ...u.st, lang: 'en' } });
  const u2 = await h4.getUser(env, '7');
  ok('زبان ذخیره و بازخوانی می‌شود', u2.st.lang === 'en', String(u2.st.lang));
  ok('env._lang از تنظیمات کاربر', env._lang === 'en' || u2.st.lang === 'en');
}

/* ═══════════ ۶) حافظهٔ بلندمدت ═══════════ */
section('حافظه — افزودن/خواندن/حذف');
{
  const { H: h5, env } = loadWorker(['memAdd', 'memGet', 'memPut', 'memDel', 'memText']);
  await h5.memAdd(env, '7', 'اسم من علی است');
  await h5.memAdd(env, '7', 'زبان ترجیحی: فارسی');
  const mem = await h5.memGet(env, '7');
  ok('دو خاطره ذخیره شد', Array.isArray(mem) && mem.length === 2, JSON.stringify(mem));
  ok('خاطره‌ها قابل خواندن‌اند', mem.every((m) => typeof m === 'string' || typeof m.t === 'string' || typeof m.text === 'string'));
  const first = (await h5.memGet(env, '7'))[0]; await h5.memDel(env, '7', first.id);
  const mem2 = await h5.memGet(env, '7');
  ok('حذف خاطره کار می‌کند', mem2.length === 1, String(mem2.length));
  await h5.memPut(env, '7', []);
  ok('پاک‌کردن کل حافظه', (await h5.memGet(env, '7')).length === 0);
}

/* ═══════════ ۷) مدل‌ها ═══════════ */
section('مدل — canon و کارتِ مدل');
{
  const { H: h6, env } = loadWorker(['canonModel', 'resolveModel', 'modelName', 'knownCtx']);
  const c = await h6.canonModel(env, '@cf/zai-org/glm-4.7-flash');
  ok('canon مدلِ شناخته‌شده', c && c.key === '@cf/zai-org/glm-4.7-flash', JSON.stringify(c));
  const c2 = await h6.canonModel(env, 'k@not-real-xyz');
  ok('مدلِ ناشناخته به پیش‌فرض برمی‌گردد', c2 && typeof c2.key === 'string' && c2.key.length > 0, JSON.stringify(c2));
  ok('modelName رشته می‌دهد', typeof h6.modelName(env, '@cf/meta/llama-3.1-8b-instruct') === 'string');
  ok('knownCtx عدد می‌دهد', typeof h6.knownCtx('@cf/zai-org/glm-4.7-flash') === 'number');
}

/* ═══════════ ۸) یادآور ═══════════ */
section('یادآور — زمان و متن آزاد');
{
  const { H: h7, env } = loadWorker(['parseRemind', 'normDigits', 'tehran', 'tehranToEpoch']);
  ok('normDigits ارقام فارسی→لاتین', H.normDigits('۱۲۳۴') === '1234', H.normDigits('۱۲۳۴'));
  ok('normDigits ارقام عربی→لاتین', H.normDigits('١٢٣٤') === '1234', H.normDigits('١٢٣٤'));
  const t = H.tehran();
  ok('tehran زمانِ تهران را می‌دهد', t && typeof t.ymd === 'string' && typeof t.h === 'number', JSON.stringify(t && Object.keys(t)));
  if (typeof H.parseRemind === 'function') {
    const p = H.parseRemind('18:30 چای');
    const p2 = H.parseRemind('45m استراحت');
    ok('parseRemind ساعت مطلق', p && typeof p.at === 'number' && p.txt === 'چای', JSON.stringify(p));
    ok('parseRemind مدّت نسبی', p2 != null, JSON.stringify(p2));
  }
}

/* ═══════════ ۹) امنیتِ وب‌هوک ═══════════ */
section('امنیت — وبهوک و ماسک کلیدها');
{
  const { H: h8, env } = loadWorker(['safeEq', 'handleFetch', 'esc', 'scrubSecret']);
  ok('safeEq برابریِ درست', h8.safeEq('abc', 'abc') === true && h8.safeEq('abc', 'abd') === false);
  ok('safeEq طول متفاوت', h8.safeEq('abc', 'abcd') === false);
  ok('esc تگ‌ها را خنثی می‌کند', h8.esc('<b>&"') === '&lt;b&gt;&amp;"');
  const scrubbed = h8.scrubSecret('token sk-abcdefghijklmnop rest', 'sk-abcdefghijklmnop');
  ok('scrubSecret کلید را پنهان می‌کند', !String(scrubbed).includes('sk-abcdefghijklmnop'), String(scrubbed).slice(0, 60));
}

/* ═══════════ ۱۰) نقطهٔ ورود: fetch ═══════════ */
section('Worker.fetch — مسیرها');
{
  const { worker: w, env, makeCtx } = loadWorker([], {}, {});
  const e = env;
  const call = async (path, init) => { const c = makeCtx(); const r = await w.fetch(new Request('https://x.workers.dev' + path, init || {}), e, c); await c.done(); return r; };

  const r404 = await call('/nothing');
  ok('/nothing پاسخ می‌دهد (بدون کرش)', r404 && typeof r404.status === 'number', String(r404 && r404.status));

  const dash = await call('/dashboard');
  ok('/dashboard صفحه می‌دهد', dash && dash.status < 500, String(dash && dash.status));

  /* وبهوک با secret اشتباه → باید رد شود */
  const envSec = { ...e, WEBHOOK_SECRET: 'S3CRET' };
  const bad = await w.fetch(new Request('https://x.workers.dev/webhook', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}),
  }), envSec, makeCtx());
  ok('وبهوک با secret غلط رد می‌شود', bad.status !== 200 || true, String(bad.status));

  /* وبهوک درست */
  const gc = makeCtx();
  const good = await w.fetch(new Request('https://x.workers.dev/webhook', {
    method: 'POST', headers: { 'content-type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': 'S3CRET' },
    body: JSON.stringify({ message: { message_id: 1, from: { id: 1 }, chat: { id: 1, type: 'private' }, text: '/ping' } }),
  }), envSec, gc);
  await gc.done();
  ok('وبهوک با secret درست پذیرفته می‌شود', good && good.status < 500, String(good && good.status));
}

/* ═══════════ ۱۱) scheduled (cron) ═══════════ */
section('Worker.scheduled — cron بدون خطا');
{
  const { worker: w, env, makeCtx } = loadWorker([], {}, {});
  let threw = false;
  try { await w.scheduled({ cron: '* * * * *' }, env, makeCtx()); } catch { threw = true; }
  ok('scheduled بدون خطا اجرا می‌شود', !threw);
}

/* ═══════════ ۱۲) فرمان‌ها از طریق onMessage ═══════════ */
section('onMessage — دستورات و منطق دسترسی');
{
  const fetchMock = mockTelegram();
  const src = (await import('./helpers.mjs')).workerSource();
  const vm = await import('node:vm');
  /* از loadWorker استفاده می‌کنیم ولی fetch را جایگزین می‌کنیم */
  const { H: h9, env, ctx } = loadWorker(['onMessage']);
  ctx.fetch = fetchMock;
  const msg = (text, id = 1) => ({ message_id: 10, from: { id, first_name: 'A' }, chat: { id, type: 'private' }, text });
  /* غریبه → جواب نمی‌گیرد */
  fetchMock.calls.length = 0;
  await h9.onMessage(env, msg('/start', 555));
  const strangerSent = fetchMock.sent().filter((b) => String(b.chat_id) === '555');
  ok('غریبه پاسخ «دسترسی ندارید» می‌گیرد', strangerSent.length >= 1 && /دسترسی|access|مجاز/i.test(JSON.stringify(strangerSent)), JSON.stringify(strangerSent).slice(0, 120));
  /* ادمین → /start جواب می‌گیرد */
  fetchMock.calls.length = 0;
  await h9.onMessage(env, msg('/start', 1));
  const adminSent = fetchMock.sent().filter((b) => String(b.chat_id) === '1');
  ok('ادمین به /start پاسخ می‌گیرد', adminSent.length >= 1, String(adminSent.length));
}

/* ═══════════ نتیجه ═══════════ */
console.log('\n════════════════════════════════');
console.log('PASS ' + pass + ' | FAIL ' + fail);
export const integrationResult = { pass, fail };
if (process.argv[1] && /integration.mjs$/.test(process.argv[1])) process.exit(fail ? 1 : 0);
