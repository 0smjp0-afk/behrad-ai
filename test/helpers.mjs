/* ═══════════════════════════════════════════════════════════════
   test/helpers.mjs — زیرساختِ آزمونِ یکپارچگی
   ─────────────────────────────────────────────────────────────
   • loadWorker(): سورسِ ماژولار را در یک vm با scope مشترک بار می‌کند
     (شبیه به bundle نهایی) + APP_ASSETS خالی + exportهای test hook.
   • mockD1(): پیاده‌سازیِ درون‌حافظه‌ایِ D1 با همان API (prepare/bind/run/
     first/all).
   • mockTelegram(): fetch قلابی برای api.telegram.org که درخواست‌ها را
     ثبت می‌کند و می‌تواند پاسخ سفارشی بدهد.
   ═══════════════════════════════════════════════════════════════ */
import fs from 'fs';
import path from 'path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const acorn = require('acorn');

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const MOD_DIR = path.join(ROOT, 'src', 'modules');

/** سورسِ کاملِ ماژول‌ها، به ترتیبِ manifest، بدون APP_ASSETS سنگین. */
export function workerSource({ withAssets = false } = {}) {
  const manifest = JSON.parse(fs.readFileSync(path.join(MOD_DIR, 'manifest.json'), 'utf8'));
  const parts = manifest.map((n) => fs.readFileSync(path.join(MOD_DIR, n), 'utf8').replace(/\r\n/g, '\n'));
  if (!withAssets) {
    const gen = path.join(ROOT, 'src', 'generated', 'app-assets.js');
    const aa = fs.existsSync(gen)
      ? fs.readFileSync(gen, 'utf8').split('\n').find((l) => l.startsWith('const APP_ASSETS = '))
      : 'const APP_ASSETS = {};';
    const holder = parts.findIndex((p) => p.includes('/* APP_ASSETS → src/generated/app-assets.js'));
    if (holder >= 0) parts[holder] = parts[holder].replace('/* APP_ASSETS → src/generated/app-assets.js (در build برمی‌گردد) */', aa);
  }
  return parts.join('\n\n');
}

/* ── D1 قلابی (درون‌حافظه) ── */
export function mockD1() {
  const rows = new Map();          // k → {v, exp}
  let writes = 0;
  const api = {
    writes: () => writes,
    dump: () => rows,
    prepare(sql) {
      const st = {
        _args: [],
        bind(...a) { this._args = a; return this; },
        async first() {
          if (/SELECT\s+v,\s*exp\s+FROM\s+kv\s+WHERE\s+k\s*=\s*\?/i.test(sql)) {
            const r = rows.get(st._args[0]);
            if (!r) return null;
            if (r.exp > 0 && r.exp < Date.now()) { rows.delete(st._args[0]); return null; }
            return { v: r.v, exp: r.exp };
          }
          if (/SELECT\s+v\s+FROM\s+kv/i.test(sql)) { const r = rows.get(st._args[0]); return r ? { v: r.v } : null; }
          return null;
        },
        async all() {
          if (/SELECT\s+k\s+FROM\s+kv/i.test(sql)) {
            const [lo, hi] = st._args;
            const out = [];
            for (const [k, r] of rows) {
              if (r.exp > 0 && r.exp < Date.now()) continue;
              if ((lo == null || k >= lo) && (hi == null || k < hi)) out.push({ k });
            }
            return { results: out };
          }
          return { results: [] };
        },
        async run() {
          if (/CREATE\s+TABLE/i.test(sql)) return { success: true };
          if (/INSERT\s+INTO\s+kv/i.test(sql)) {
            const [k, v, exp] = st._args; rows.set(k, { v, exp: exp || 0 }); writes++; return { success: true };
          }
          if (/DELETE\s+FROM\s+kv/i.test(sql)) { rows.delete(st._args[0]); writes++; return { success: true }; }
          return { success: true };
        },
      };
      return st;
    },
  };
  return api;
}

/* ── fetch قلابی برای تلگرام ── */
export function mockTelegram(opts = {}) {
  const calls = [];
  let me = { id: 42, username: 'test_bot', first_name: 'Test' };
  const fn = async (url, init) => {
    const u = String(url);
    const m = u.match(/\/bot[^/]+\/(\w+)/);
    const method = m ? m[1] : '';
    let body = {};
    try { body = init && init.body ? JSON.parse(init.body) : {}; } catch { body = {}; }
    calls.push({ method, url: u, body });
    if (opts.onCall) { const r = opts.onCall(method, u, body); if (r) return r; }
    const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json' } });
    if (method === 'getMe') return json({ ok: true, result: me });
    if (method === 'sendMessage') return json({ ok: true, result: { message_id: 1000 + (body.message_id || 0), chat: { id: body.chat_id }, text: body.text } });
    if (method === 'editMessageText') return json({ ok: true, result: { message_id: body.message_id } });
    if (method === 'sendChatAction') return json({ ok: true, result: true });
    if (method === 'answerCallbackQuery') return json({ ok: true, result: true });
    if (method === 'deleteMessage') return json({ ok: true, result: true });
    if (method === 'getWebhookInfo') return json({ ok: true, result: { url: 'https://x/webhook', pending_update_count: 0 } });
    if (method === 'setWebhook') return json({ ok: true, result: true });
    if (method === 'getFile') return json({ ok: true, result: { file_path: 'f/x.bin' } });
    if (method === 'sendDocument') return json({ ok: true, result: { message_id: 2000 } });
    if (method === 'sendPhoto') return json({ ok: true, result: { message_id: 3000 } });
    return json({ ok: true, result: true });
  };
  fn.calls = calls;
  fn.sent = () => calls.filter((c) => c.method === 'sendMessage').map((c) => c.body);
  fn.methods = () => calls.map((c) => c.method);
  fn.setMe = (x) => { me = x; };
  return fn;
}

/* env نمونه برای آزمون‌ها */
export function makeEnv(over = {}) {
  return {
    TELEGRAM_BOT_TOKEN: 'TEST:TOKEN',
    ADMIN_ID: '1',
    DASHBOARD_PASSWORD: 'pw',
    OWNER_NAME: 'Ali',
    DB: mockD1(),
    AI: { run: async () => ({ response: 'ok' }) },
    ...over,
  };
}

/* ctx قلابیِ Workers: waitUntil را واقعاً اجرا می‌کند تا کارِ پس‌زمینه
   (پردازش آپدیت) در آزمون تمام شود. */
export function makeCtx() {
  const pending = [];
  return {
    waitUntil(p) { pending.push(Promise.resolve(p).catch(() => {})); },
    passThroughOnException() {},
    async done() { await Promise.all(pending); },
  };
}

/**
 * سورسِ ماژول‌ها را در یک vm اجرا می‌کند و API داخلی را بیرون می‌دهد.
 * hooks = نامِ توابع/متغیرهایی که می‌خواهی برگردند.
 */
export function loadWorker(hooks = [], envOver = {}, srcOpts = {}) {
  /* bundle با «export default» تمام می‌شود (ماژول ES). vm یک script را پارس
     می‌کند، پس تنها همان یک دستور را به اعلانِ ساده تبدیل می‌کنیم. */
  const src = workerSource(srcOpts).replace(/^export default \{/m, 'const __workerDefault = {');
  const fetchImpl = srcOpts.fetch || mockTelegram();
  const ctx = vm.createContext({
    console: { log() {}, error() {}, warn() {}, info() {} },
    fetch: fetchImpl,
    crypto: globalThis.crypto,
    TextEncoder, TextDecoder, Response, Request, Headers, URL, URLSearchParams,
    AbortController, ReadableStream, Blob, atob, btoa, structuredClone,
    setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout,
    setInterval: globalThis.setInterval, clearInterval: globalThis.clearInterval,
    queueMicrotask: globalThis.queueMicrotask,
    Promise, Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Error, Map, Set, Symbol, BigInt, Intl, isNaN, parseInt, parseFloat,
  });
  const exportLine = '\nthis.__default = typeof __workerDefault !== "undefined" ? __workerDefault : null;' +
    (hooks.length ? '\nthis.__H = { ' + hooks.join(', ') + ' };' : '');
  try {
    vm.runInContext(src + exportLine, ctx, { filename: 'worker-bundle.js' });
  } catch (e) {
    throw new Error('worker اجرا نشد: ' + e.message);
  }
  return { ctx, env: makeEnv(envOver), H: ctx.__H || {}, worker: ctx.__default, fetch: fetchImpl, makeCtx };
}

export { acorn };
