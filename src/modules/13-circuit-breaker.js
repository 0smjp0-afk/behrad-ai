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
  /* گیتِ استقرار: اگر مالک صدا را خاموش کرده باشد، هیچ راهی برای فهم ویس نیست. */
  if (!toolAvailable(env, 'stt')) throw new Error(L(env, 'm0stt_off'));
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
