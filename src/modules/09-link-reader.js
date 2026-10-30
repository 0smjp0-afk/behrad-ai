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
