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
