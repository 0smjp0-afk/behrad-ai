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
