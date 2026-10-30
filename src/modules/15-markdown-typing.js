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
