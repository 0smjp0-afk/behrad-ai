/* ═══════════════════════════════════════════════════════════════
   Behrad AI — اسکرین‌ها و رفتارها
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ثابت‌ها — باید با GEM_TTS_MODELS / GEM_STT_MODELS / GEM_IMG_MODELS ورکر یکی باشد
   (اگر متفاوت باشد /api/v1/settings مدل را بی‌صدا رد می‌کند). اولویت با لیست
   سرور است: bootState آن‌ها را روی S.gemModels می‌نشاند و این‌ها فقط فالبک‌اند. */
const GEM_TTS = [
  { id: 'gemini-3.8-flash-tts', name: W("3.8 Flash TTS (پیشنهادی)") },
  { id: 'gemini-3.5-live-translate-preview', name: W("Live TTS (سریع و طبیعی)") },
  { id: 'gemini-2.5-flash-preview-tts', name: W("Flash TTS (کلاسیک)") },
  { id: 'gemini-2.5-pro-preview-tts', name: W("Pro TTS (باکیفیت بالا)") },
];
const GEM_STT = [
  { id: 'gemini-3.5-transcribe', name: W("Transcribe (پیشنهادی، تخصصی STT)") },
  { id: 'gemini-3.5-live-translate-preview', name: W("Live Translate (سریع، چندزبانه)") },
  { id: 'gemini-2.5-flash', name: W("Flash (فهم صوت عمومی)") },
];
const GEM_IMG = [
  { id: 'gemini-3.1-flash-lite-image', name: W("Flash Lite Image (پیشنهادی، ارزان)") },
  { id: 'gemini-3.1-flash-image', name: W("Flash Image (کیفیت بالاتر)") },
];
const GEM_VOICES = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir', 'Leda', 'Orus', 'Aoede', 'Callirrhoe', 'Autonoe',
  'Enceladus', 'Iapetus', 'Umbriel', 'Algieba', 'Despina', 'Erinome', 'Algenib', 'Rasalgethi', 'Laomedeia',
  'Achernar', 'Alnilam', 'Schedar', 'Gacrux', 'Pulcherrima', 'Achird', 'Zubenelgenubi', 'Vindemiatrix',
  'Sadachbia', 'Sadaltager', 'Sulafat'];
const CMDS = ['/image ', '/web ', '/weather', '/crypto', '/remember ', '/memory', '/new', '/brief', '/export', '/help',
  '/sum ', '/find ', '/gallery', '/todo ', '/task ', '/memfind ', '/video '];
const MEM_MAX = 50, THREAD_MAX = 15, VISION_MAX_N = 3, FILE_MAX = 150000;

/* لیست‌های واقعی سرور (از /api/v1/state) — اگر نرسیده بود همان ثابت‌های بالا */
function gemList(kind) {
  const g = (S && S.gemModels) || {};
  const arr = g[kind];
  return Array.isArray(arr) && arr.length ? arr : (kind === 'tts' ? GEM_TTS : kind === 'stt' ? GEM_STT : GEM_IMG);
}

/* ═══════════ helpers ═══════════ */
function scrollMsgs(force) {
  const box = $('msgs');
  const near = box.scrollHeight - box.scrollTop - box.clientHeight < 220;
  if (force || near) box.scrollTop = box.scrollHeight;
}
function prepareMsgs() {
  const em = $('msgs').querySelector('.empty');
  if (em) em.remove();
}
function emptyChatHtml() {
  return '<div class="empty"><span class="em-ic">🌊</span>' +
    W("<div class=\"em-t\">شروع گفتگو</div>") +
    W("<div class=\"em-s\">هر چی بخواهی همین‌جاست: جستجوی وب، هوای نیشابور، یادآور، ویس و حافظه بلندمدت.<br>") +
    W("با <code>/</code> دستورها را ببین — مثل تلگرام، ولی شیشه‌ای‌تر ✨</div></div>");
}
function setBusy(b) {
  S.busy = b;
  $('sendBtn').disabled = b;
  $('micBtn').disabled = b;
  $('sendBtn').classList.toggle('busy', b);
  $('composer').style.opacity = b ? '.9' : '';
}
function addPill() {
  prepareMsgs();
  const p = document.createElement('div');
  p.className = 'status-pill';
  p.innerHTML = W("<span class=\"spin\"></span><span class=\"pt\">دارم فکر میکنم...</span>");
  $('msgs').appendChild(p);
  scrollMsgs();
  return {
    update(html) {
      p.innerHTML = '<span class="spin"></span><span class="pt">' + (html || '') + '</span>';
      scrollMsgs();
    },
    remove() { p.remove(); },
  };
}
function addBubbleEl(role, rawText) {
  prepareMsgs();
  const b = document.createElement('div');
  b.className = 'bubble ' + role;
  const t = document.createElement('div');
  t.className = 'b-text';
  t.innerHTML = role === 'user'
    ? esc(rawText).replace(/\n/g, '<br>')
    : mdRender(rawText || '');
  b.appendChild(t);
  b._raw = rawText || '';
  const m = document.createElement('div');
  m.className = 'meta';
  m.innerHTML = nowHM() + (role === 'user' ? ' ✓✓' : '');
  b.appendChild(m);
  $('msgs').appendChild(b);
  return b;
}
function footFor(ab, label, tokens) {
  let f = ab.querySelector('.b-foot');
  if (!f) { f = document.createElement('div'); f.className = 'b-foot'; ab.insertBefore(f, ab.querySelector('.meta')); }
  let lbl = f.querySelector('.lbl');
  if (!lbl) { lbl = document.createElement('span'); lbl.className = 'lbl'; f.appendChild(lbl); }
  if (label) lbl.textContent = label + (tokens ? ' · ' + tokens + W(" توکن") : '');
  [['tts', '🔊'], ['copy', '📋'], ['regen', '🔄']].forEach(([k, ic]) => {
    if (!f.querySelector('[data-f="' + k + '"]')) {
      const btn = document.createElement('button');
      btn.className = 'foot-btn';
      btn.dataset.f = k;
      btn.textContent = ic + (k === 'regen' ? W(" مجدد") : '');
      f.appendChild(btn);
    }
  });
}
function refreshFooters() {
  const all = $$('#msgs .bubble');
  let lastAs = null;
  all.forEach((b) => {
    if (b.classList.contains('assistant')) lastAs = b;
    const g = b.querySelector('[data-f="regen"]');
    if (g) g.remove();
  });
  // حباب تصویر تولیدشده دکمه «جدد» نمی‌گیرد (تولید تصویر در تاریخچه ذخیره نمی‌شود)
  if (lastAs && !lastAs.classList.contains('has-img')) footFor(lastAs, lastAs._footLabel || '', lastAs._footTokens || 0);
}

/* ═══════════ چت ═══════════ */
async function loadHistory() {
  const box = $('msgs');
  box.innerHTML = '';
  try {
    const r = await API.get('/api/v1/history?thread=' + encodeURIComponent(S.thread));
    S.hist = r.msgs || [];
    if (!S.hist.length) { box.innerHTML = emptyChatHtml(); return; }
    S.hist.forEach((m) => addBubbleEl(m.role === 'user' ? 'user' : 'assistant', m.content));
    refreshFooters();
    scrollMsgs(true);
  } catch (e) {
    box.innerHTML = emptyChatHtml();
  }
}

async function runCore(payload) {
  if (S.busy) return;
  setBusy(true);
  if (S.screen !== 'chat') go('chat');
  const pill = addPill();
  const ab = addBubbleEl('assistant', '');
  const body = ab.querySelector('.b-text');
  body.innerHTML = '<span class="stream-caret"></span>';
  let got = false, err = null, done = null;
  try {
    await API.chat(Object.assign({ thread: S.thread }, payload), (ev) => {
      if (ev.t === 'status') pill.update(ev.html);
      else if (ev.t === 'regen') toast(W("تولید مجدد از «") + String(ev.text || '').slice(0, 40) + '» ...');
      else if (ev.t === 'delta') {
        if (!got) { got = true; pill.remove(); }
        body.innerHTML = mdRender(ev.text || '') + '<span class="stream-caret"></span>';
        scrollMsgs();
      } else if (ev.t === 'done') { got = true; done = ev; pill.remove(); }
      else if (ev.t === 'err') err = ev.msg;
    });
  } catch (e) { err = e.message || W("خطا"); }

  if (done) {
    /* 🔊 صدای ساخته‌شده با /tts — data-URI روی همان پاسخ آمده، پس بلافاصله پخش میشود */
    if (done.audio) {
      try {
        if (curAudio) curAudio.pause();
        curAudio = new Audio(done.audio);
        await curAudio.play();
        haptic(16);
      } catch (e) { toast(W("پخش صدا ناموفق بود"), 'err'); }
    }
    /* 🎨 تصویر تولیدشده: data-URI داخل حباب + زیرش متن کپشن */
    if (done.img && done.img.b64) {
      const im = document.createElement('img');
      im.className = 'gen-img';
      im.alt = done.text || W("تصویر تولیدشده");
      im.src = 'data:' + (done.img.mime || 'image/png') + ';base64,' + done.img.b64;
      body.innerHTML = '';
      body.appendChild(im);
      if (done.text) {
        const cap = document.createElement('div');
        cap.className = 'gen-cap';
        cap.innerHTML = mdRender(done.text);
        body.appendChild(cap);
      }
      ab._raw = done.text || '';
      ab.classList.add('has-img');
      const rg = ab.querySelector('[data-f="regen"]'); if (rg) rg.remove();
    } else {
      body.innerHTML = mdRender(done.text || '');
      ab._raw = done.text || '';
    }
    if (done.reset && !(done.img && done.img.b64)) { $('msgs').innerHTML = ''; const nb = addBubbleEl('assistant', done.text || ''); nb._raw = done.text || ''; }
    else {
      const f = done.footer || {};
      if (f.label) { ab._footLabel = f.label; ab._footTokens = f.tokens; }
      footFor(ab, ab._footLabel || (done.cmd ? '' : ''), ab._footTokens || 0);
      if (done.cmd) { const g = ab.querySelector('[data-f="regen"]'); if (g) g.remove(); }
    }
  } else if (err) {
    pill.remove();
    if (!got) { ab.classList.add('error'); body.innerHTML = '<b>❌ ' + esc(err) + '</b>'; }
    else body.innerHTML += '<p style="color:var(--danger)">❌ ' + esc(err) + '</p>';
    toast(err, 'err');
  } else {
    pill.remove();
    if (!got) ab.remove();
  }
  setBusy(false);
  refreshFooters();
  scrollMsgs(true);
}

async function sendChat(text) {
  text = (text || '').trim();
  const photos = S.attaches.slice(0, VISION_MAX_N).map((a) => ({ mime: 'image/jpeg', b64: a.b64 }));
  const file = S.fileAtt;
  if (!text && !photos.length && !file) return;
  if (S.busy) return;
  let disp = text;
  if (photos.length) disp = (disp ? disp + '\n' : '') + '🖼 ' + photos.length + W(" عکس");
  if (file) disp = (disp ? disp + '\n' : '') + '📎 ' + file.name;
  prepareMsgs();
  addBubbleEl('user', disp);
  scrollMsgs();
  S.attaches = []; S.fileAtt = null;
  renderChips();
  $('input').value = '';
  autoGrow();
  updateQuick();
  await runCore({ text: text, photos: photos, file: file });
}

async function doRegen() {
  if (S.busy) return;
  const bs = $$('#msgs .bubble.assistant');
  const last = bs[bs.length - 1];
  if (last) last.remove();
  await runCore({ regen: true });
}

function autoGrow() {
  const el = $('input');
  el.style.height = 'auto';
  el.style.height = Math.min(132, el.scrollHeight) + 'px';
}
function updateQuick() {
  const v = $('input').value;
  const q = $('quick');
  if (v.startsWith('/')) {
    q.hidden = false;
    if (!q.childElementCount) {
      q.innerHTML = CMDS.map((c) => '<button data-c="' + esc(c) + '">' + esc(c.trim()) + '</button>').join('');
    }
  } else q.hidden = true;
}

function wireChat() {
  const input = $('input');
  input.addEventListener('input', () => { autoGrow(); updateQuick(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(input.value); }
  });
  $('sendBtn').addEventListener('click', () => sendChat(input.value));
  $('quick').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-c]');
    if (!b) return;
    input.value = b.dataset.c;
    input.focus();
    autoGrow();
  });

  /* پیوست */
  $('attachBtn').addEventListener('click', () => {
    openSheet(W("افزودن پیوست"),
      '<div class="list">' +
      W("<div class=\"item\" data-act=\"act-img\"><span class=\"ic\">🖼</span><div class=\"mid\"><div class=\"t1\">عکس</div><div class=\"t2\">حداکثر ") + VISION_MAX_N + W(" عکس — برای مدل 👁</div></div><span class=\"chev\">‹</span></div>") +
      W("<div class=\"item\" data-act=\"act-txt\"><span class=\"ic\">📄</span><div class=\"mid\"><div class=\"t1\">فایل متنی / کد</div><div class=\"t2\">تا ") + Math.round(FILE_MAX / 1000) + W(" کیلوبایت</div></div><span class=\"chev\">‹</span></div>") +
      '</div>');
  });
  $('fileImg').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []).slice(0, VISION_MAX_N);
    e.target.value = '';
    for (const f of files) {
      if (S.attaches.length >= VISION_MAX_N) { toast(W("سقف ") + VISION_MAX_N + W(" عکس"), 'err'); break; }
      try {
        const b64 = await imgToJpeg(f);
        S.attaches.push({ b64: b64 });
      } catch (err) { toast(W("عکس خوانده نشد"), 'err'); }
    }
    renderChips();
  });
  $('fileTxt').addEventListener('change', (e) => {
    const f = (e.target.files || [])[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > FILE_MAX * 4) { toast(W("فایل خیلی بزرگ است"), 'err'); return; }
    const rd = new FileReader();
    rd.onload = () => {
      S.fileAtt = { name: f.name, text: String(rd.result || '').slice(0, FILE_MAX) };
      renderChips();
      toast(W("فایل «") + f.name.slice(0, 24) + W("» آماده ارسال"), 'ok');
    };
    rd.readAsText(f);
  });
  $('attachChips').addEventListener('click', (e) => {
    const x = e.target.closest('.x');
    if (!x) return;
    if (x.dataset.f) S.fileAtt = null;
    else S.attaches.splice(+x.dataset.i, 1);
    renderChips();
  });

  /* کلیک‌های روی پیام‌ها */
  $('msgs').addEventListener('click', (e) => {
    const cb = e.target.closest('.copy-btn');
    if (cb) {
      const pre = cb.closest('pre');
      try { navigator.clipboard.writeText(decodeURIComponent(pre.dataset.code || '')); toast(W("کد کپی شد"), 'ok'); } catch (er) {}
      return;
    }
    const fb = e.target.closest('.foot-btn');
    if (fb) {
      const b = fb.closest('.bubble');
      const k = fb.dataset.f;
      if (k === 'copy') { try { navigator.clipboard.writeText(b._raw || ''); toast(W("کپی شد"), 'ok'); } catch (er) {} }
      else if (k === 'tts') playTts(fb, b._raw || '');
      else if (k === 'regen') doRegen();
      return;
    }
    const a = e.target.closest('a');
    if (a && a.href) {
      e.preventDefault();
      if (window.Android && Android.openUrl) Android.openUrl(a.href);
      else window.open(a.href, '_blank');
      return;
    }
    if (e.target.closest('.empty')) $('input').focus();
  });

  /* ویس */
  $('micBtn').addEventListener('click', () => { if (S.rec) stopRec(true); else startRec(); });
  $('recCancel').addEventListener('click', () => stopRec(false));
}

function renderChips() {
  const box = $('attachChips');
  let html = S.attaches.map((a, i) =>
    '<div class="c-chip" style="animation-delay:' + (i * 60) + 'ms"><img src="data:image/jpeg;base64,' + a.b64 + '">' +
    '<button class="x" data-i="' + i + '">✕</button></div>').join('');
  if (S.fileAtt) {
    html += '<div class="c-chip file">📄<br>' + esc(S.fileAtt.name.slice(0, 12)) +
      '<button class="x" data-f="1">✕</button></div>';
  }
  box.innerHTML = html;
  box.hidden = !html;
}

function imgToJpeg(file, max, q) {
  max = max || 1280; q = q || 0.85;
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      let w = im.naturalWidth, h = im.naturalHeight;
      const sc = Math.min(1, max / Math.max(w, h));
      w = Math.max(1, Math.round(w * sc)); h = Math.max(1, Math.round(h * sc));
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(im, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const d = c.toDataURL('image/jpeg', q);
      res(d.slice(d.indexOf(',') + 1));
    };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('bad image')); };
    im.src = url;
  });
}

/* ─── پخش صدا ─── */
let curAudio = null, curBtn = null;
async function playTts(btn, raw) {
  if (!raw) { toast(W("متنی نیست"), 'err'); return; }
  if (curBtn === btn && curAudio && !curAudio.paused) { curAudio.pause(); btn.textContent = '🔊'; haptic(10); return; }
  if (curAudio) { curAudio.pause(); if (curBtn) curBtn.textContent = '🔊'; }
  const old = btn.textContent;
  btn.textContent = '…';
  try {
    const res = await API.req('/api/v1/tts', { method: 'POST', body: { text: raw.slice(0, 900) } });
    const blob = await res.blob();
    curAudio = new Audio(URL.createObjectURL(blob));
    curBtn = btn;
    curAudio.onended = () => { btn.textContent = '🔊'; };
    await curAudio.play();
    btn.textContent = '⏸';
    haptic(16);
  } catch (e) {
    btn.textContent = old;
    toast(e.message || W("صدایی ساخته نشد"), 'err');
  }
}

/* ─── ضبط ویس ─── */
async function startRec() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    /* ترتیب مهم است: گوگل فقط WAV/MP3/AAC(m4a)/OGG/FLAC می‌پذیرد، نه webm.
       پس اول سراغ audio/mp4 و audio/ogg می‌رویم تا «فهم ویس با گوگل» (همان
       که فینگلیش نمی‌دهد) واقعاً از اپ هم اجرا شود؛ webm فقط فالبک آخر است. */
    const mime = ['audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/webm;codecs=opus', 'audio/webm', '']
      .find((m) => !m || !window.MediaRecorder || MediaRecorder.isTypeSupported(m));
    const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks = [];
    let wantSend = true;
    const wave = $('recWave');
    wave.innerHTML = Array.from({ length: 22 }, () => '<i></i>').join('');
    const bars = Array.from(wave.children);

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser();
    an.fftSize = 128;
    src.connect(an);
    const data = new Uint8Array(an.frequencyBinCount);
    let raf = 0;
    const loop = () => {
      an.getByteFrequencyData(data);
      for (let i = 0; i < bars.length; i++) {
        const v = data[Math.floor(i * data.length / bars.length)] || 0;
        bars[i].style.height = Math.max(12, Math.min(100, (v / 255) * 130)) + '%';
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    const t0 = Date.now();
    const timer = setInterval(() => {
      const s = Math.floor((Date.now() - t0) / 1000);
      $('recTime').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
      if (s >= 120) stopRec(true);
    }, 400);

    mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    mr.onstop = async () => {
      clearInterval(timer);
      cancelAnimationFrame(raf);
      try { ctx.close(); } catch (e) {}
      stream.getTracks().forEach((t) => t.stop());
      $('cRec').hidden = true;
      $('cRow').hidden = false;
      $('micBtn').classList.remove('listening');
      S.rec = null;
      if (!wantSend) return;
      const blob = new Blob(chunks, { type: mime || 'audio/webm' });
      if (!blob.size) { toast(W("ویسی ضبط نشد"), 'err'); return; }
      setBusy(true);
      try {
        const fd = new FormData();
        fd.append('file', blob, 'voice.' + ((mime || 'webm').split(';')[0].split('/')[1] || 'webm'));
        const r = await API.req('/api/v1/stt', { method: 'POST', body: fd });
        setBusy(false);
        if (r.text && r.text.trim()) { haptic(20); await sendChat(r.text.trim()); }
        else toast(W("چیزی فهمیده نشد — دوباره بگو"), 'err');
      } catch (e) {
        setBusy(false);
        toast(e.message || W("ویس پردازش نشد"), 'err');
      }
    };

    mr.start(250);
    S.rec = mr;
    $('recTime').textContent = '0:00';
    $('cRec').hidden = false;
    $('cRow').hidden = true;
    $('micBtn').classList.add('listening');
    haptic(25);
    S._stopRec = (send) => { wantSend = send; try { mr.stop(); } catch (e) {} };
  } catch (e) {
    toast(W("میکروفون در دسترس نیست — اجازه را بده"), 'err');
  }
}
function stopRec(send) {
  if (S._stopRec) S._stopRec(send);
}

/* ═══════════ گفتگوها ═══════════ */
function renderThreads() {
  $('thCount').textContent = '(' + S.threads.length + '/' + THREAD_MAX + ')';
  const list = $('thList');
  if (!S.threads.length) {
    list.innerHTML = W("<div class=\"empty\"><span class=\"em-ic\">🗂</span><div class=\"em-t\">گفتگویی نیست</div></div>");
    return;
  }
  list.innerHTML = S.threads.slice().reverse().map((t, i) => {
    const d = t.ts ? new Date(t.ts) : null;
    const when = d ? d.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }) + ' · ' +
      String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') : '';
    return '<div class="item' + (t.id === S.thread ? ' active' : '') + '" style="--i:' + i + '" data-id="' + esc(t.id) + '">' +
      '<span class="ic">' + (t.id === S.thread ? '💬' : '🗨') + '</span>' +
      '<div class="mid"><div class="t1" style="white-space:normal">' + esc(t.name || t.id) + '</div>' +
      '<div class="t2">' + esc(when) + (t.id === S.thread ? W(" · فعال") : '') + '</div></div>' +
      '<div class="act">' +
      W("<button class=\"mini-btn\" data-op=\"ren\" title=\"نام\">✏️</button>") +
      W("<button class=\"mini-btn del\" data-op=\"del\" title=\"حذف\">🗑</button></div></div>");
  }).join('');
}
function wireThreads() {
  $('thNew').addEventListener('click', async () => {
    try {
      const r = await API.post('/api/v1/thread', { op: 'new' });
      S.threads = r.threads; S.thread = r.thread;
      toast(W("گفتگوی تازه ساخته شد ✨"), 'ok');
      haptic(20);
      loadHistory();
      go('chat');
    } catch (e) { toast(e.message, 'err'); }
  });
  $('thList').addEventListener('click', async (e) => {
    const item = e.target.closest('.item[data-id]');
    if (!item) return;
    const id = item.dataset.id;
    const op = (e.target.closest('[data-op]') || {}).dataset;
    if (op && op.op === 'del') {
      if (S.threads.length <= 1) { toast(W("حداقل یک گفتگو بماند"), 'err'); return; }
      openSheet(W("حذف گفتگو؟"),
        '<p style="text-align:center;color:var(--muted);line-height:2.2">«' + esc(item.querySelector('.t1').textContent) +
        W("» و تاریخچه‌اش پاک می‌شود.</p><div class=\"f-row\" style=\"justify-content:center;margin-top:14px\">") +
        '<button class="btn danger-ghost" data-act="do-del" data-id="' + esc(id) + W("\">حذف شود</button>") +
        W("<button class=\"btn ghost\" data-act=\"close\">انصراف</button></div>"));
      return;
    }
    if (op && op.op === 'ren') {
      openSheet(W("نام گفتگو"),
        '<div class="f-row"><input id="renIn" value="' + esc((S.threads.find((t) => t.id === id) || {}).name || '') + '">' +
        '<button class="btn acc sm" data-act="do-ren" data-id="' + esc(id) + W("\">ذخیره</button></div>"));
      setTimeout(() => { const el = $('renIn'); if (el) { el.focus(); el.select(); } }, 350);
      return;
    }
    try {
      const r = await API.post('/api/v1/thread', { op: 'select', id: id });
      S.threads = r.threads; S.thread = r.thread;
      closeSheet();
      go('chat');
      loadHistory();
    } catch (er) { toast(er.message, 'err'); }
  });
}

/* ═══════════ حافظه ═══════════ */
async function renderMemory() {
  const list = $('memList');
  list.innerHTML = '<div class="skeleton" style="height:64px"></div><div class="skeleton" style="height:64px"></div>';
  try {
    const r = await API.get('/api/v1/memory');
    const items = r.items || [];
    S.memCount = items.length;
    S.memMax = r.max || MEM_MAX;
    $('memCount').textContent = items.length + '/' + S.memMax;
    if (!items.length) {
      list.innerHTML = W("<div class=\"empty\"><span class=\"em-ic\">🧠</span><div class=\"em-t\">حافظه خالی است</div>") +
        W("<div class=\"em-s\">خودکار از حرف‌هایت یاد می‌گیرم، یا همین‌جا اضافه کن.</div></div>");
      return;
    }
    list.innerHTML = items.map((x, i) =>
      '<div class="item" style="--i:' + i + '"><span class="ic">🧠</span>' +
      '<div class="mid"><div class="t1" style="white-space:normal">' + esc(x.t) + '</div></div>' +
      '<div class="act"><button class="mini-btn edit" data-id="' + esc(x.id) + '">✏️</button>' +
      '<button class="mini-btn del" data-id="' + esc(x.id) + '">🗑</button></div></div>').join('');
  } catch (e) {
    list.innerHTML = '<div class="empty"><div class="em-s">' + esc(e.message) + '</div></div>';
  }
}
function wireMemory() {
  $('memAdd').addEventListener('click', async () => {
    const v = $('memInput').value.trim();
    if (!v) return;
    try {
      const r = await API.post('/api/v1/memory', { op: 'add', text: v });
      if (r.added === false) toast(W("این را از قبل داشتم"), 'err');
      else { toast(W("در حافظه ذخیره شد ✨"), 'ok'); haptic(20); }
      $('memInput').value = '';
      renderMemory();
    } catch (e) { toast(e.message, 'err'); }
  });
  $('memClear').addEventListener('click', () => {
    openSheet(W("پاک کردن کل حافظه؟"),
      W("<p style=\"text-align:center;color:var(--muted);line-height:2.2\">همه ") + S.memCount +
      W(" خاطره پاک می‌شود و دیگر برنمی‌گردد.</p><div class=\"f-row\" style=\"justify-content:center;margin-top:14px\">") +
      W("<button class=\"btn danger-ghost\" data-act=\"do-memclear\">پاک شود</button>") +
      W("<button class=\"btn ghost\" data-act=\"close\">انصراف</button></div>"));
  });
  $('memInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('memAdd').click(); });
  $('memList').addEventListener('click', async (e) => {
    const del = e.target.closest('.del');
    const ed = e.target.closest('.edit');
    if (del) {
      try { await API.post('/api/v1/memory', { op: 'del', id: del.dataset.id }); toast(W("حذف شد"), 'ok'); renderMemory(); }
      catch (er) { toast(er.message, 'err'); }
    } else if (ed) {
      const t = ed.closest('.item').querySelector('.t1').textContent;
      openSheet(W("ویرایش خاطره"),
        '<div class="f-row"><input id="memEd" value="' + esc(t) + '" style="min-width:0">' +
        '<button class="btn acc sm" data-act="do-memedit" data-id="' + esc(ed.dataset.id) + W("\">ذخیره</button></div>"));
      setTimeout(() => { const el = $('memEd'); if (el) { el.focus(); el.select(); } }, 350);
    }
  });
}

/* ═══════════ یادآورها ═══════════ */
async function renderReminders() {
  const list = $('rmList');
  list.innerHTML = '<div class="skeleton" style="height:64px"></div>';
  try {
    const r = await API.get('/api/v1/reminders');
    const items = (r.items || []).slice().sort((a, b) => (a.at || 0) - (b.at || 0));
    if (!items.length) {
      list.innerHTML = W("<div class=\"empty\"><span class=\"em-ic\">⏰</span><div class=\"em-t\">یادآوری نداری</div>") +
        W("<div class=\"em-s\">مثلاً بنویس: <code>روزانه 08:00 ورزش</code><br>یا <code>18:30 چای دم کن</code></div></div>");
      return;
    }
    list.innerHTML = items.map((x, i) => {
      const d = new Date(x.at);
      const when = isNaN(d) ? '' : d.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }) + W(" ساعت ") +
        String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      return '<div class="item" style="--i:' + i + '">' +
        '<span class="ic">' + (x.repeat === 'daily' ? '🔁' : '⏰') + '</span>' +
        '<div class="mid"><div class="t1" style="white-space:normal">' + esc(x.txt) + '</div>' +
        '<div class="t2">' + esc(when) + '</div></div>' +
        (x.repeat === 'daily' ? W("<span class=\"badge green\">روزانه</span>") : '') +
        '<div class="act"><button class="mini-btn del" data-key="' + esc(x.key) + '">🗑</button></div></div>';
    }).join('');
  } catch (e) {
    list.innerHTML = '<div class="empty"><div class="em-s">' + esc(e.message) + '</div></div>';
  }
}
function wireReminders() {
  $('rmAdd').addEventListener('click', async () => {
    const v = $('rmInput').value.trim();
    if (!v) return;
    try {
      const r = await API.post('/api/v1/reminders', { op: 'add', text: v });
      toast(W("یادآور ثبت شد ✅ ") + (r.atLabel ? '(' + r.atLabel + ')' : ''), 'ok');
      haptic(20);
      $('rmInput').value = '';
      renderReminders();
    } catch (e) { toast(e.message, 'err'); }
  });
  $('rmInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('rmAdd').click(); });
  $('rmList').addEventListener('click', async (e) => {
    const del = e.target.closest('.del');
    if (!del) return;
    try { await API.post('/api/v1/reminders', { op: 'del', key: del.dataset.key }); toast(W("حذف شد"), 'ok'); renderReminders(); }
    catch (er) { toast(er.message, 'err'); }
  });
}

/* ═══════════ تنظیمات ═══════════ */
function sw(key, on) { return '<button class="sw' + (on ? ' on' : '') + '" data-toggle="' + key + '"></button>'; }
function rowTgl(ic, t1, t2, key, on) {
  return '<div class="row" data-key="' + key + '"><span class="ic">' + ic + '</span>' +
    '<div class="mid"><div class="t1">' + t1 + '</div>' + (t2 ? '<div class="t2">' + t2 + '</div>' : '') + '</div>' +
    sw(key, on) + '</div>';
}
function rowNav(ic, t1, t2, act) {
  return '<div class="row click" data-act="' + act + '"><span class="ic">' + ic + '</span>' +
    '<div class="mid"><div class="t1">' + t1 + '</div>' + (t2 ? '<div class="t2">' + t2 + '</div>' : '') + '</div>' +
    '<span class="chev">‹</span></div>';
}
function rowSlider(ic, t1, key, val, min, max, step, fmt) {
  const p = ((val - min) / (max - min)) * 100;
  return '<div class="row slider-row" data-slider="' + key + '"><div class="sr-top"><span class="ic">' + ic + '</span>' +
    '<div class="mid"><div class="t1">' + t1 + '</div></div>' +
    '<span class="val" data-v="' + key + '">' + fmt(val) + '</span></div>' +
    '<input type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val +
    '" data-fmt="' + key + '" style="--p:' + p + '%"></div>';
}
function sec(title, rows, i) {
  return '<div class="sec" style="--i:' + (i || 0) + '"><div class="sec-t">' + title + '</div><div class="sec-box">' +
    rows.join('') + '</div></div>';
}
function themePickHtml() {
  return '<div class="pick-grid">' + THEMES.map((t) =>
    '<div class="pick' + (S.theme === t ? ' on' : '') + '" data-theme-pick="' + t + '">' +
    '<span class="pk-check">✓</span><div class="pk-t">' + THEME_NAMES[t] + '</div>' +
    '<div class="pk-s">' + THEME_DESC[t] + '</div>' +
    '<div class="pk-swatches">' + THEME_DOTS[t].map((c) => '<i style="background:' + c + '"></i>').join('') + '</div></div>').join('') + '</div>';
}
function layoutPickHtml() {
  return '<div class="pick-grid">' + LAYOUTS.map((l) =>
    '<div class="pick' + (S.layout === l ? ' on' : '') + '" data-layout-pick="' + l + '">' +
    '<span class="pk-check">✓</span><div class="pk-t">' + LAYOUT_NAMES[l] + '</div>' +
    '<div class="pk-s">' + LAYOUT_DESC[l] + '</div>' +
    '<div class="pk-prev"><span class="pp-b" style="top:8px;right:8px;width:38%"></span>' +
    '<span class="pp-b" style="top:20px;left:8px;width:54%;opacity:.6"></span>' +
    '<span class="pp-d"></span></div></div>').join('') + '</div>';
}

function renderSettings() {
  const s = S.settings || {};
  const persona = S.personas[s.persona];
  $('setBody').innerHTML = [
    sec(W("چت و مدل"), [
      rowNav('🤖', W("مدل فعال"), esc(S.currentModel.label || ''), 'act-model'),
      rowNav('🎭', W("شخصیت (پرسونا)"), persona ? esc(persona.icon + ' ' + persona.name) : W("پیش‌فرض"), 'act-persona'),
      rowSlider('🌡', W("دما (خلاقیت)"), 'temperature', s.temperature == null ? 0.8 : s.temperature, 0, 2, 0.05,
        (v) => (+v).toFixed(2)),
      rowSlider('📏', W("حداکثر توکن خروجی"), 'maxTokens', s.maxTokens || 2048, 256, 8192, 128, (v) => Math.round(v)),
      rowSlider('⛽', W("سقف روزانه (هزار توکن — صفر = بدون سقف)"), 'dailyLimit', s.dailyLimit || 0, 0, 500, 10, (v) => Math.round(v)),
      rowTgl('⚡', W("جریان زنده پاسخ"), W("متن تیک‌تیک روی صفحه بیاید"), 'liveStream', !!s.liveStream),
      rowTgl('🔗', W("خواندن لینک‌ها"), W("محتوای لینک داخل پیام خودکار خوانده شود"), 'readLinks', !!s.readLinks),
      rowTgl('👁', W("سوییچ خودکار به مدل 👁"), W("اگر مدل عکس نفهمد، خودکار مدل ویژن بیاید"), 'autoVision', !!s.autoVision),
      rowTgl('🛟', W("سوییچ خودکار مدل"), W("هنگام خطا مدل رایگان جایگزین شود"), 'autoFallback', !!s.autoFallback),
      rowTgl('🔎', W("سرچ خودکار وب"), W("وقتی سؤال تازه وبی است Tavily خودکار بزند"), 'searchAuto', !!s.searchAuto),
      rowTgl('🎨', W("تولید تصویر"), W("با دستور /image عکس بسازد — با GEMINI_API_KEY باکیفیت‌تر، بدون کلید هم می‌سازد (رایگان)"), 'imgGen', s.imgGen !== false),
      rowNav('🖼', W("مدل تولید تصویر"), esc(s.imgModel || 'gemini-3.1-flash-lite-image'), 'act-imgmodel'),
      rowTgl('🆓', W("فالبک رایگان تصویر"), W("اگر کلید گوگل نبود یا ۴۲۹ داد، pollinations رایگان عکس بسازد"), 'imgFree', s.imgFree !== false),
      rowTgl('🖌', W("ویرایش عکس"), W("عکس را با کپشن «ویرایش: …» بفرست تا تغییرش بدم"), 'imgEdit', s.imgEdit !== false),
      rowTgl('🗣', W("یادآور از متن آزاد"), W("«فردا ساعت ۵ یادم بنداز…» بدون دستور /remind"), 'nlRemind', s.nlRemind !== false),
      rowTgl('🧠', W("حافظهٔ خودکار"), W("از گفتگو خاطره استخراج شود و در پاسخ‌ها لحاظ شود"), 'memAuto', s.memAuto !== false),
      rowTgl('🗄', W("بکاپ خودکار هفتگی"), W("هر جمعه فایل JSON بکاپ در Saved Messages"), 'weeklyBackup', s.weeklyBackup !== false),
      rowTgl('🔌', W("قطع خودکار سرویس خراب"), W("سرویس کاستومی که چند بار خطا داد، چند دقیقه کنار گذاشته شود"), 'cbBreaker', s.cbBreaker !== false),
      rowTgl('🎬', W("خلاصهٔ یوتیوب"), W("لینک یوتیوب → خواندن زیرنویس و خلاصه کردن"), 'ytSum', s.ytSum !== false),
      (S.flags && S.flags.gemini ? '' :
        W("<div class=\"row\"><span class=\"ic\">🔑</span><div class=\"mid\"><div class=\"t1\" style=\"color:var(--danger)\">GEMINI_API_KEY ست نشده</div>") +
        W("<div class=\"t2\">تصویر و صدای گوگل کار نمی‌کند — Worker ← Settings ← Secrets</div></div></div>")),
      '<div class="row slider-row"><div class="sr-top"><span class="ic">✏️</span><div class="mid">' +
      W("<div class=\"t1\">پرامپت سیستمی دلخواه</div><div class=\"t2\">سقف ") + 2000 + W(" کاراکتر — اولویت بالا</div></div>") +
      W("<button class=\"foot-btn\" data-act=\"do-sysave\">ذخیره</button></div>") +
      W("<textarea class=\"f-area\" id=\"sysArea\" maxlength=\"2000\" placeholder=\"مثلاً: همیشه کوتاه و بی‌حاشیه جواب بده...\">") +
      esc(s.sysCustom || '') + '</textarea></div>',
    ], 0),
    sec(W("صدا و صبح"), [
      rowTgl('🔊', W("پاسخ صوتی"), W("جواب‌ها با وویس انتخابی تولید شود"), 'voiceReply', !!s.voiceReply),
      W("<div class=\"row\"><span class=\"ic\">🎛</span><div class=\"mid\"><div class=\"t1\">موتور صدا</div>") +
      W("<div class=\"t2\">کلادفلر (رایگان) یا گوگل AI Studio</div></div></div>") +
      '<div class="row" style="padding-top:0"><div class="seg" data-seg="voiceProv">' +
      '<span class="seg-pill"></span>' +
      '<button data-v="cf" class="' + (s.voiceProv === 'cf' ? 'on' : '') + W("\">کلادفلر</button>") +
      '<button data-v="google" class="' + (s.voiceProv !== 'cf' ? 'on' : '') + W("\">گوگل</button></div></div>"),
      rowNav('🎙', W("استودیو صدا"), W("مدل‌ها، ۳۰ وویس و تست صدا"), 'act-voice'),
      rowTgl('🌅', W("خلاصه صبحگاهی ساعت ") + (S.briefHour || 10) + W(":۰۰"), W("هر صبح خلاصه روز به وقت تهران"), 'briefing', !!s.briefing),
    ], 1),
    sec(W("ظاهر"), [
      W('<div class="row" style="border:none"><div class="mid"><div class="t1">' + W('زبان') + '</div><div class="t2">' + W('زبان رابط و پاسخ‌های ربات') + '</div></div></div>') +
      '<div class="row" style="border:none;padding-top:0"><div class="seg" id="localeSeg">' +
        '<button class="seg-b" data-loc="fa">🇮🇷 ' + W('فارسی') + '</button>' +
        '<button class="seg-b" data-loc="en">🇬🇧 English</button></div></div>',
      W("<div class=\"row\" style=\"border:none;padding-bottom:4px\"><div class=\"mid\"><div class=\"t1\">تم رنگی</div>") +
      W("<div class=\"t2\">چهار تم تیره — آبی، سبز، قرمز، طوفانی</div></div></div>") +
      '<div class="row" style="border:none;padding-top:0">' + themePickHtml() + '</div>',
      W("<div class=\"row\" style=\"border:none;padding-bottom:4px\"><div class=\"mid\"><div class=\"t1\">چیدمان</div>") +
      W("<div class=\"t2\">سه چینش متفاوت برای هر سلیقه</div></div></div>") +
      '<div class="row" style="border:none;padding-top:0">' + layoutPickHtml() + '</div>',
    ], 2),
    sec(W("داده‌ها"), [
      rowNav('🧹', W("شروع گفتگوی تازه"), W("تاریخچه همین گفتگو پاک شود"), 'act-clearhist'),
      rowNav('📤', W("خروجی گفتگو"), W("دانلود متنی تاریخچه این گفتگو"), 'act-export'),
      rowNav('🔐', W("خروج از حساب"), W("دفعه بعد دوباره رمز می‌خواهم"), 'act-logout'),
      '<div class="row"><span class="ic">ℹ️</span><div class="mid"><div class="t1">Behrad AI v' + esc(S.version || '') +
      W("</div><div class=\"t2\">اپ شیشه‌ای متصل به ورکر Cloudflare — همان داده‌های تلگرام</div></div></div>"),
    ], 3),
  ].join('');
  $$('#setBody .seg').forEach(layoutSeg);
}
function layoutSeg(seg) {
  const pill = seg.querySelector('.seg-pill');
  const on = seg.querySelector('button.on') || seg.querySelector('button');
  if (!pill || !on) return;
  requestAnimationFrame(() => {
    const pr = seg.getBoundingClientRect();
    const br = on.getBoundingClientRect();
    pill.style.left = '0px';
    pill.style.transform = 'translateX(' + (br.left - pr.left) + 'px)';
    pill.style.width = br.width + 'px';
  });
}
async function setSetting(patch) {
  const r = await API.post('/api/v1/settings', patch);
  if (r.settings) Object.assign(S.settings, r.settings);
  return r;
}
function wireSettings() {
  const body = $('setBody');
  body.addEventListener('click', async (e) => {
    const tg = e.target.closest('[data-toggle]');
    if (tg) {
      const key = tg.dataset.toggle;
      const nv = !S.settings[key];
      S.settings[key] = nv;
      tg.classList.toggle('on', nv);
      haptic(16);
      try { await setSetting({ [key]: nv }); toast(W("ذخیره شد ✅"), 'ok'); }
      catch (er) { S.settings[key] = !nv; tg.classList.toggle('on', !nv); toast(er.message, 'err'); }
      return;
    }
    const seg = e.target.closest('[data-seg] button');
    if (seg) {
      const wrap = seg.closest('[data-seg]');
      const key = wrap.dataset.seg;
      $$('button', wrap).forEach((b) => b.classList.toggle('on', b === seg));
      layoutSeg(wrap);
      haptic(16);
      try { await setSetting({ [key]: seg.dataset.v }); toast(W("ذخیره شد ✅"), 'ok'); }
      catch (er) { toast(er.message, 'err'); renderSettings(); }
      return;
    }
    const lc = e.target.closest('[data-loc]');
    if (lc) {
      setLocale(lc.dataset.loc, true);
      $$('#localeSeg .seg-b').forEach((b2) => b2.classList.toggle('on', b2 === lc));
      haptic(16);
      toast(W("ذخیره شد ✅"), 'ok');
      return;
    }
    const tp = e.target.closest('[data-theme-pick]');
    if (tp) {
      applyTheme(tp.dataset.themePick, true);
      $$('#setBody [data-theme-pick]').forEach((p) => p.classList.toggle('on', p === tp));
      toast(W("تم: ") + THEME_NAMES[S.theme], 'ok');
      haptic(18);
      return;
    }
    const lp = e.target.closest('[data-layout-pick]');
    if (lp) {
      applyLayout(lp.dataset.layoutPick, true);
      $$('#setBody [data-layout-pick]').forEach((p) => p.classList.toggle('on', p === lp));
      toast(W("چیدمان: ") + LAYOUT_NAMES[S.layout], 'ok');
      haptic(18);
      return;
    }
    const act = (e.target.closest('[data-act]') || {}).dataset;
    if (!act || !act.act) return;
    if (act.act === 'act-model') openModelsSheet();
    else if (act.act === 'act-persona') openPersonasSheet();
    else if (act.act === 'act-voice') go('voice');
    else if (act.act === 'act-imgmodel') {
      const list = gemList('img');
      const cur = S.settings.imgModel || (list[0] && list[0].id);
      openSheet(W("مدل تولید تصویر 🖼"),
        '<div class="list">' + list.map((m) =>
          '<div class="item" data-act="do-imgmodel" data-id="' + esc(m.id) + '">' +
          '<span class="ic">🖼</span><div class="mid"><div class="t1">' + esc(m.name) + '</div>' +
          '<div class="t2"><code>' + esc(m.id) + '</code></div></div>' +
          '<span class="chev">' + (m.id === cur ? '✓' : '‹') + '</span></div>').join('') +
        '</div><p style="color:var(--muted);font-size:.8rem;text-align:center;margin-top:10px">' +
        W("با <code>/image توصیف</code> در چت عکس می‌سازی.</p>"));
    }
    else if (act.act === 'do-sysave') {
      try { await setSetting({ sysCustom: $('sysArea').value }); toast(W("پرامپت ذخیره شد ✅"), 'ok'); }
      catch (er) { toast(er.message, 'err'); }
    } else if (act.act === 'act-clearhist') {
      openSheet(W("شروع گفتگوی تازه؟"),
        W("<p style=\"text-align:center;color:var(--muted);line-height:2.2\">تاریخچه «") +
        esc((S.threads.find((t) => t.id === S.thread) || {}).name || '') + W("» پاک می‌شود.</p>") +
        '<div class="f-row" style="justify-content:center;margin-top:14px">' +
        W("<button class=\"btn danger-ghost\" data-act=\"do-clearhist\">پاک شود</button>") +
        W("<button class=\"btn ghost\" data-act=\"close\">انصراف</button></div>"));
    } else if (act.act === 'act-export') {
      try {
        const res = await API.get('/api/v1/export?thread=' + encodeURIComponent(S.thread));
        const text = await res.text();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
        a.download = 'behraad-chat-' + S.thread + '.txt';
        a.click();
        toast(W("خروجی دانلود شد 📤"), 'ok');
      } catch (er) { toast(er.message || W("خروجی نشد"), 'err'); }
    } else if (act.act === 'act-logout') {
      // توکن سمت سرور هم باطل شود — وگرنه توکن ۳۰ روزه در D1 معتبر می‌ماند
      try { await API.post('/api/v1/logout', {}); } catch (er) {}
      try { localStorage.removeItem('tk'); } catch (er) {}
      S.token = '';
      showLogin();
    }
  });
  body.addEventListener('input', (e) => {
    const r = e.target;
    if (r.type !== 'range') return;
    const min = +r.min, max = +r.max, v = +r.value;
    r.style.setProperty('--p', ((v - min) / (max - min)) * 100 + '%');
    const lbl = body.querySelector('[data-v="' + r.dataset.fmt + '"]');
    const fmts = {
      temperature: (x) => x.toFixed(2),
      maxTokens: (x) => Math.round(x),
      dailyLimit: (x) => Math.round(x),
    };
    if (lbl) lbl.textContent = (fmts[r.dataset.fmt] || ((x) => x))(v);
  });
  body.addEventListener('change', async (e) => {
    const r = e.target;
    if (r.type !== 'range') return;
    try {
      await setSetting({ [r.dataset.fmt]: +r.value });
      toast(W("ذخیره شد ✅"), 'ok');
      haptic(14);
    } catch (er) { toast(er.message, 'err'); }
  });
}

/* ═══════════ استودیو صدا ═══════════ */
function renderVoice() {
  const s = S.settings || {};
  const google = s.voiceProv !== 'cf'; // پیش‌فرض سرور «گوگل» است، نه کلادفلر
  const banners = [];
  if (!S.flags.search) banners.push(['🔎', W("کلید SEARCH_API_KEY تنظیم نشده — سرچ وب غیرفعال است")]);
  if (!S.flags.gemini) banners.push(['🔊', W("کلید GEMINI_API_KEY نیست — صدای گوگل در دسترس نیست (فالبک Whisper)")]);
  $('voiceBody').innerHTML = [
    banners.map((b) => '<div class="glass form-card" style="display:flex;gap:12px;align-items:center;border-color:rgba(251,191,36,.4)">' +
      '<span style="font-size:20px">' + b[0] + '</span><div style="font-size:13px;color:var(--muted)">' + b[1] + '</div></div>').join(''),

    sec(W("موتور صدا"), [
      '<div class="row"><div class="seg" data-seg="voiceProv" style="flex:1"><span class="seg-pill"></span>' +
      '<button data-v="cf" class="' + (!google ? 'on' : '') + W("\">کلادفلر (رایگان)</button>") +
      '<button data-v="google" class="' + (google ? 'on' : '') + W("\">گوگل AI Studio</button></div></div>"),
      rowTgl('🔊', W("پاسخ صوتی در چت"), W("جواب‌ها صوتی بیاید"), 'voiceReply', !!s.voiceReply),
    ], 0),

    sec(W("مدل فهم ویس (STT) — گوگل"), GEM_STT.map((m) =>
      '<div class="row click' + (s.sttModel === m.id ? ' active' : '') + '" data-stt="' + m.id + '">' +
      '<span class="ic">' + (s.sttModel === m.id ? '✅' : '🎤') + '</span>' +
      '<div class="mid"><div class="t1">' + m.name + '</div><div class="t2" dir="ltr" style="text-align:right">' + m.id + '</div></div>' +
      (s.sttModel === m.id ? W("<span class=\"badge\">فعال</span>") : '') + '</div>'), 1),

    sec(W("مدل تولید صدا (TTS) — گوگل"), GEM_TTS.map((m) =>
      '<div class="row click' + (s.ttsModel === m.id ? ' active' : '') + '" data-tts="' + m.id + '">' +
      '<span class="ic">' + (s.ttsModel === m.id ? '✅' : '🔊') + '</span>' +
      '<div class="mid"><div class="t1">' + m.name + '</div><div class="t2" dir="ltr" style="text-align:right">' + m.id + '</div></div>' +
      (s.ttsModel === m.id ? W("<span class=\"badge\">فعال</span>") : '') + '</div>'), 2),

    sec(W("وویس — ") + (s.voiceName || 'Kore') + W(" <span style=\"color:var(--dim);font-weight:400\">(۳۰ گزینه، فارسی fa)</span>"),
      ['<div class="row" style="border:none"><div class="voice-grid" style="flex:1">' +
        GEM_VOICES.map((v, i) =>
          '<button class="v-chip' + ((s.voiceName || 'Kore') === v ? ' on' : '') + '" style="--i:' + i +
          '" data-vset="' + v + '">' + v + '</button>').join('') +
        '</div></div>'], 3),

    W("<div class=\"sec\"><div class=\"sec-t\">تست</div><div class=\"sec-box\">") +
    W("<div class=\"row\"><span class=\"ic\">🎧</span><div class=\"mid\"><div class=\"t1\">پخش نمونه با وویس فعلی</div>") +
    W("<div class=\"t2\">«سلام بهراد! من دستیار صوتی تو هستم...»</div></div>") +
    '<div class="eq" id="voiceEq" hidden>' + '<i></i>'.repeat(7) + '</div>' +
    W("<button class=\"btn acc sm\" data-act=\"do-test\">تست 🎧</button></div></div></div>"),
  ].join('');
  $$('#voiceBody .seg').forEach(layoutSeg);
}
function wireVoice() {
  const body = $('voiceBody');
  body.addEventListener('click', async (e) => {
    const tg = e.target.closest('[data-toggle]');
    if (tg) {
      const key = tg.dataset.toggle;
      const nv = !S.settings[key];
      S.settings[key] = nv;
      tg.classList.toggle('on', nv);
      try { await setSetting({ [key]: nv }); toast(W("ذخیره شد ✅"), 'ok'); }
      catch (er) { toast(er.message, 'err'); }
      return;
    }
    const seg = e.target.closest('[data-seg] button');
    if (seg) {
      const wrap = seg.closest('[data-seg]');
      $$('button', wrap).forEach((b) => b.classList.toggle('on', b === seg));
      layoutSeg(wrap);
      try { await setSetting({ voiceProv: seg.dataset.v }); toast(W("موتور عوض شد ✅"), 'ok'); }
      catch (er) { toast(er.message, 'err'); }
      return;
    }
    const stt = e.target.closest('[data-stt]');
    if (stt) {
      try { await setSetting({ sttModel: stt.dataset.stt }); S.settings.sttModel = stt.dataset.stt; toast(W("مدل فهم عوض شد ✅"), 'ok'); haptic(14); renderVoice(); }
      catch (er) { toast(er.message, 'err'); }
      return;
    }
    const tts = e.target.closest('[data-tts]');
    if (tts) {
      try { await setSetting({ ttsModel: tts.dataset.tts }); S.settings.ttsModel = tts.dataset.tts; toast(W("مدل صدا عوض شد ✅"), 'ok'); haptic(14); renderVoice(); }
      catch (er) { toast(er.message, 'err'); }
      return;
    }
    const v = e.target.closest('[data-vset]');
    if (v) {
      $$('.v-chip', body).forEach((c) => c.classList.toggle('on', c === v));
      haptic(12);
      try { await setSetting({ voiceName: v.dataset.vset }); toast(W("وویس: ") + v.dataset.vset, 'ok'); }
      catch (er) { toast(er.message, 'err'); }
      return;
    }
    if ((e.target.closest('[data-act]') || {}).dataset.act === 'do-test') {
      const eq = $('voiceEq');
      const btn = e.target.closest('button');
      if (eq) eq.hidden = false;
      btn.disabled = true;
      btn.textContent = '...';
      try {
        const res = await API.req('/api/v1/tts', {
          method: 'POST',
          body: { text: W("سلام بهراد! من دستیار صوتی تو هستم. این صدای ") + (S.settings.voiceName || 'Kore') + W(" است.") },
        });
        const blob = await res.blob();
        if (curAudio) curAudio.pause();
        curAudio = new Audio(URL.createObjectURL(blob));
        curAudio.onended = () => { if (eq) eq.hidden = true; };
        await curAudio.play();
        haptic(20);
      } catch (er) { toast(er.message || W("تست ناموفق"), 'err'); if (eq) eq.hidden = true; }
      btn.disabled = false;
      btn.textContent = W("تست 🎧");
    }
  });
}

/* ═══════════ آمار ═══════════ */
function renderStats() {
  const u = S.usage || {};
  const s = S.settings || {};
  const lim = s.dailyLimit || 0;
  const used = (u.tin || 0) + (u.tout || 0);
  const pct = lim ? Math.min(100, Math.round(used / (lim * 1000) * 100)) : 0;
  const f = S.flags || {};
  $('statsBody').innerHTML = [
    '<div class="stat-grid">' +
    '<div class="stat" style="--i:0"><span class="sic">💬</span><div class="sv">' + (u.msgs || 0) + W("</div><div class=\"sl\">پیام امروز</div></div>") +
    '<div class="stat" style="--i:1"><span class="sic">⬇️</span><div class="sv">' + ((u.tin || 0) / 1000).toFixed(1) + W("K</div><div class=\"sl\">توکن ورودی امروز</div></div>") +
    '<div class="stat" style="--i:2"><span class="sic">⬆️</span><div class="sv">' + ((u.tout || 0) / 1000).toFixed(1) + W("K</div><div class=\"sl\">توکن خروجی امروز</div></div>") +
    '<div class="stat" style="--i:3"><span class="sic">🧵</span><div class="sv">' + S.threads.length + W("</div><div class=\"sl\">گفتگو (از ") + THREAD_MAX + ')</div></div>' +
    '</div>',
    lim ? W("<div class=\"sec\" style=\"--i:4\"><div class=\"sec-t\">سقف روزانه</div><div class=\"sec-box\"><div class=\"row\">") +
      '<div class="mid"><div class="t1">' + pct + W("٪ مصرف شده</div>") +
      '<div class="t2">' + (used / 1000).toFixed(1) + W("K از ") + lim + W("K توکن</div>") +
      '<div class="bar-line"><i style="width:' + pct + '%"></i></div></div></div></div></div>' : '',
    W("<div class=\"sec\" style=\"--i:5\"><div class=\"sec-t\">سرویس‌ها</div><div class=\"sec-box\">") +
    [['🧠', W("مدل AI"), !!f.hasAi], [W("🗄 دیتابیس D1"), W("دیتابیس D1"), !!f.hasDb],
      ['🔎', W("سرچ Tavily (SEARCH_API_KEY)"), !!f.search], ['🔊', W("صدای گوگل (GEMINI_API_KEY)"), !!f.gemini]]
      .map((x) => '<div class="row"><span class="ic">' + (typeof x[0] === 'string' && x[0].length <= 3 ? x[0] : '🧩') +
        '</span><div class="mid"><div class="t1">' + x[1] + '</div></div>' +
        '<span class="badge ' + (x[2] ? 'green' : 'red') + '">' + (x[2] ? W("فعال") : W("غیرفعال")) + '</span></div>').join('') +
    '</div></div>',
    W("<div class=\"sec\" style=\"--i:6\"><div class=\"sec-t\">درباره</div><div class=\"sec-box\">") +
    '<div class="row"><span class="ic">📱</span><div class="mid"><div class="t1">Behrad AI v' + esc(S.version || '') + '</div>' +
    W("<div class=\"t2\">اپ شیشه‌ای اندروید — همان ورکر Cloudflare، همان تاریخچه تلگرام</div></div></div></div></div>"),
  ].join('');
}

/* ═══════════ خانه bento ═══════════ */
function renderBento() {
  const s = S.settings || {};
  const u = S.usage || {};
  const t = THEME_DOTS[S.theme] || [];
  $('bento').innerHTML =
    '<div class="b-card hero" style="--i:0" data-act="newchat"><span class="glow"></span>' +
    W("<span class=\"bc-ic\">💬</span><div class=\"bc-v\">چت تازه</div>") +
    '<div class="bc-s">' + esc(S.currentModel.label || '') + '</div></div>' +

    '<div class="b-card accent span2" style="--i:1" data-act="model"><span class="glow"></span>' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
    '<span class="bc-ic">🤖</span><span class="badge">' + (S.currentModel.vision ? W("👁 ویژن") : W("متن")) + '</span></div>' +
    W("<div><div class=\"bc-t\">مدل فعال</div><div class=\"bc-v\" style=\"font-size:17px\">") +
    esc(S.currentModel.label || '—') + '</div>' +
    '<div class="bc-s">' + (S.currentModel.ctx ? S.currentModel.ctx + W("K کانتکست") : '') + '</div></div></div>' +

    '<div class="b-card green" style="--i:2" data-act="weather"><span class="glow"></span>' +
    W("<span class=\"bc-ic\">🌤</span><div><div class=\"bc-t\">هوای نیشابور</div>") +
    W("<div class=\"bc-v\" style=\"font-size:19px\">ببین...</div><div class=\"bc-s\">برای دریافت بزن</div></div></div>") +

    '<div class="b-card" style="--i:3" data-act="memory"><span class="glow"></span>' +
    W("<span class=\"bc-ic\">🧠</span><div><div class=\"bc-t\">حافظه بلندمدت</div>") +
    '<div class="bc-v">' + S.memCount + '<span style="font-size:15px;color:var(--muted)">/' + S.memMax + '</span></div>' +
    W("<div class=\"bc-s\">مدیریت خاطره‌ها</div></div></div>") +

    '<div class="b-card red" style="--i:4" data-act="reminders">' +
    W("<span class=\"bc-ic\">⏰</span><div><div class=\"bc-t\">یادآورها</div>") +
    '<div class="bc-v" style="font-size:19px">' + (s.briefing ? W("صبح ") + (S.briefHour || 10) + W(":۰۰ 🌅") : W("مدیریت")) + '</div>' +
    W("<div class=\"bc-s\">ساخت و حذف یادآور</div></div></div>") +

    '<div class="b-card" style="--i:5" data-act="stats"><span class="glow"></span>' +
    W("<span class=\"bc-ic\">📊</span><div><div class=\"bc-t\">پیام امروز</div>") +
    '<div class="bc-v">' + (u.msgs || 0) + '</div><div class="bc-s">' + (((u.tin || 0) + (u.tout || 0)) / 1000).toFixed(1) + W("K توکن</div></div></div>") +

    '<div class="b-card span2" style="--i:6" data-act="voice">' +
    '<div style="display:flex;justify-content:space-between"><span class="bc-ic">🎙</span>' +
    '<div class="eq" style="height:22px">' + '<i></i>'.repeat(7) + '</div></div>' +
    W("<div><div class=\"bc-t\">استودیو صدا</div><div class=\"bc-v\" style=\"font-size:17px\">") +
    esc(s.voiceName || 'Kore') + ' · ' + (s.voiceProv === 'cf' ? W("کلادفلر") : W("گوگل")) + '</div>' +
    W("<div class=\"bc-s\">۳۰ وویس، مدل‌ها و تست صدا</div></div></div>") +

    '<div class="b-card span2" style="--i:7" data-act="theme">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<span class="bc-ic">🎨</span><div class="theme-dots">' +
    THEMES.map((th) => '<i class="' + (S.theme === th ? 'on' : '') + '" style="background:' +
      (THEME_DOTS[th] || ['#fff'])[0] + ';color:' + (THEME_DOTS[th] || ['#fff'])[0] + '"></i>').join('') +
    '</div></div>' +
    W("<div><div class=\"bc-t\">تم و چیدمان</div><div class=\"bc-v\" style=\"font-size:17px\">") +
    THEME_NAMES[S.theme] + ' · ' + LAYOUT_NAMES[S.layout] + '</div>' +
    W("<div class=\"bc-s\">برای عوض زدن بزن — ۴ تم × ۳ چیدمان</div></div></div>");
}
function wireBento() {
  $('bento').addEventListener('click', async (e) => {
    const card = e.target.closest('[data-act]');
    if (!card) return;
    const act = card.dataset.act;
    haptic(14);
    if (act === 'newchat') {
      try {
        const r = await API.post('/api/v1/thread', { op: 'new' });
        S.threads = r.threads; S.thread = r.thread;
        go('chat'); loadHistory();
      } catch (er) { toast(er.message, 'err'); }
    } else if (act === 'model') openModelsSheet();
    else if (act === 'memory') go('memory');
    else if (act === 'reminders') go('reminders');
    else if (act === 'stats') go('stats');
    else if (act === 'voice') go('voice');
    else if (act === 'theme') openThemeSheet();
    else if (act === 'weather') {
      const v = card.querySelector('.bc-v');
      const s2 = card.querySelector('.bc-s');
      if (v) v.textContent = '...';
      try {
        const r = await API.get('/api/v1/tool?name=weather');
        openSheet(W("🌤 هوای نیشابور"), '<div class="b-text" style="font-size:14.5px">' + mdRender(r.text || '') + '</div>');
      } catch (er) { if (v) v.textContent = '—'; if (s2) s2.textContent = er.message; toast(er.message, 'err'); }
    }
  });
}

/* ═══════════ ویجت‌های هوشمند 🧩 ═══════════
   پرامپت فارسی ← سرور با AI ساخته ← کارت شیشه‌ای روی برد؛ یادآورها به rm: وصل‌اند. */
const WG_MAX_DEFAULT = 12;
const WG_DAYS = [W("یکشنبه"), W("دوشنبه"), W("سه‌شنبه"), W("چهارشنبه"), W("پنجشنبه"), W("جمعه"), W("شنبه")];
const WG_MONTHS = [W("فروردین"), W("اردیبهشت"), W("خرداد"), W("تیر"), W("مرداد"), W("شهریور"), W("مهر"), W("آبان"), W("آذر"), W("دی"), W("بهمن"), W("اسفند")];
const wgFa = (n) => String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
const wgPad = (n) => String(n).padStart(2, '0');

function wgTehran(ms) {
  const d = new Date((ms == null ? Date.now() : ms) + 210 * 60000);
  return {
    y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(),
    h: d.getUTCHours(), min: d.getUTCMinutes(), s: d.getUTCSeconds(), w: d.getUTCDay(),
    ymd: d.getUTCFullYear() + '-' + wgPad(d.getUTCMonth() + 1) + '-' + wgPad(d.getUTCDate()),
  };
}
function wgEpochT(y, m, d, h, min) { return Date.UTC(y, m - 1, d, h, min, 0) - 210 * 60000; }

function wgJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  const gy2 = (gm > 2) ? gy + 1 : gy;
  let days = (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100)
    + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053); days %= 12053;
  jy += 4 * Math.floor(days / 1461); days %= 1461;
  if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  const jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return { jy: jy, jm: jm, jd: jd };
}
function wgJalaliLine(t) {
  const j = wgJalali(t.y, t.m, t.d);
  return WG_DAYS[t.w] + ' ' + wgFa(j.jd) + ' ' + WG_MONTHS[j.jm - 1] + ' ' + wgFa(j.jy);
}
function wgJalaliFull(t) {
  const j = wgJalali(t.y, t.m, t.d);
  return wgFa(j.jd) + ' ' + WG_MONTHS[j.jm - 1] + ' ' + wgFa(j.jy);
}
function wgFind(id) { return (S.widgets || []).find((x) => x.id === id) || null; }

function wgAtToLocal(at) {
  const d = new Date(at + 210 * 60000);
  return d.getUTCFullYear() + '-' + wgPad(d.getUTCMonth() + 1) + '-' + wgPad(d.getUTCDate()) +
    'T' + wgPad(d.getUTCHours()) + ':' + wgPad(d.getUTCMinutes());
}
function wgLocalToAt(v) {
  const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return 0;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) - 210 * 60000;
}

/* ─── حالت یادآور/شمارش معکوس: wait | due | done ─── */
function wgRemState(sp, now) {
  if (sp.type === 'countdown') {
    const from = Math.min(sp.ts || 0, sp.at - 86400000) || (sp.at - 86400000);
    if (now < sp.at) return { s: 'wait', target: sp.at, from: Math.max(0, Math.min(sp.ts || 0, sp.at - 86400000) || sp.at - 86400000) };
    if (now - sp.at < 6 * 3600000) return { s: 'due', target: sp.at, from: from };
    return { s: 'done', target: sp.at, from: from };
  }
  const p = wgTehran(sp.at);
  const t = wgTehran(now);
  let dueAt = sp.at;
  if (sp.repeat === 'daily') dueAt = wgEpochT(t.y, t.m, t.d, p.h, p.min);
  if (now < dueAt) return { s: 'wait', target: dueAt, from: Math.max(0, dueAt - 86400000) };
  if (now - dueAt < 6 * 3600000) return { s: 'due', target: dueAt, from: Math.max(0, dueAt - 86400000) };
  return { s: 'done', target: dueAt, from: Math.max(0, dueAt - 86400000) };
}
function wgProg(st, now) {
  const span = st.target - st.from;
  if (span <= 0) return 1;
  return (now - st.from) / span;
}
function wgLeftText(ms) {
  if (ms <= 0) return W("الان");
  const m = Math.floor(ms / 60000);
  if (m < 1) return W("کمتر از یک دقیقه دیگه");
  if (m < 60) return wgFa(m) + W(" دقیقه دیگه");
  const h = Math.floor(m / 60), mm = m % 60;
  if (h < 24) return wgFa(h) + W(" ساعت") + (mm ? W(" و ") + wgFa(mm) + W(" دقیقه") : '') + W(" دیگه");
  const d = Math.floor(h / 24), hh = h % 24;
  return wgFa(d) + W(" روز") + (hh ? W(" و ") + wgFa(hh) + W(" ساعت") : '') + W(" دیگه");
}
function wgHmsText(ms) {
  if (ms <= 0) return W("رسید 🎉");
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return wgFa(wgPad(h) + ':' + wgPad(m) + ':' + wgPad(ss));
}
function wgAtLabel(sp, now) {
  const p = wgTehran(sp.at), t = wgTehran(now);
  const hm = wgFa(wgPad(p.h) + ':' + wgPad(p.min));
  if (sp.repeat === 'daily') return hm + W(" روزانه");
  const diff = Math.round((wgEpochT(p.y, p.m, p.d, 0, 0) - wgEpochT(t.y, t.m, t.d, 0, 0)) / 86400000);
  if (diff === 0) return hm + W(" امروز");
  if (diff === 1) return hm + W(" فردا");
  if (diff === -1) return hm + W(" دیروز");
  return hm + ' ' + wgFa(p.m + '/' + p.d);
}
function wgFlagText(sp, st, now) {
  if (st.s === 'wait') return wgAtLabel(sp, now);
  if (sp.type === 'countdown') return W("🎉 رسید");
  return st.s === 'due' ? W("الان!") : W("✓ انجام شد");
}
function wgCdText(sp, st, now) {
  if (st.s !== 'wait') return sp.type === 'countdown' ? W("🎉 رسید!") : (st.s === 'due' ? W("الان وقتشه! ⏰") : W("✓ انجام شد"));
  if (sp.type === 'countdown') return wgHmsText(st.target - now);
  return wgLeftText(st.target - now);
}
function wgRing(p) {
  const c = 94.2;
  return '<svg class="wg-ring" viewBox="0 0 36 36">' +
    '<circle class="wr-bg" cx="18" cy="18" r="15"></circle>' +
    '<circle class="wr-fg" cx="18" cy="18" r="15" data-wg="ring" stroke-dasharray="' + c +
    '" stroke-dashoffset="' + (c * (1 - Math.max(0, Math.min(1, p)))).toFixed(2) + '"></circle></svg>';
}
function wgSetRing(el, p) {
  const c = 94.2;
  el.setAttribute('stroke-dashoffset', String(Math.round(c * (1 - Math.max(0, Math.min(1, p)))) * 100) / 100);
}
function wgWxEmoji(code) {
  const c = +code;
  if (c === 0) return ['☀️', W("صاف")];
  if (c === 1 || c === 2) return ['⛅', W("کمی ابری")];
  if (c === 3) return ['☁️', W("ابری")];
  if (c === 45 || c === 48) return ['🌫', W("مه")];
  if (c >= 51 && c <= 67) return ['🌧', W("باران")];
  if ((c >= 71 && c <= 77) || c === 85 || c === 86) return ['❄️', W("برف")];
  if (c >= 80 && c <= 82) return ['🌦', W("رگبار")];
  if (c >= 95) return ['⛈', W("طوفان")];
  return ['🌤', W("هوای خوب")];
}
function wgNum(v, d) {
  const n = +v;
  if (!isFinite(n)) return W("؟");
  return wgFa(String(Math.round(n * (d ? 10 : 1)) / (d ? 10 : 1)));
}
function wgShort(v) {
  const n = +v;
  if (!isFinite(n)) return W("؟");
  if (n >= 1000) return wgFa((n / 1000).toFixed(1)) + 'K';
  return wgFa(n);
}
function wgHead(sp, flag, live) {
  return '<div class="wg-h"><span class="wg-t">' + esc(sp.title || W("ویجت")) + '</span>' +
    '<span class="wg-flag"' + (live ? ' data-wg="flag"' : '') + '>' + esc(flag) + '</span></div>';
}

/* ─── رندرر هر نوع ویجت ─── */
function wgInner(sp, now) {
  const st = sp.type === 'reminder' || sp.type === 'countdown' ? wgRemState(sp, now) : null;

  if (sp.type === 'reminder') {
    return wgHead(sp, wgFlagText(sp, st, now), true) +
      (sp.text ? '<div class="wg-sub">' + esc(sp.text) + '</div>' : '') +
      '<div class="wg-foot"><span class="wg-cd" data-wg="cd">' + esc(wgCdText(sp, st, now)) + '</span>' +
      wgRing(wgProg(st, now)) + '</div>';
  }

  if (sp.type === 'countdown') {
    const left = Math.max(0, st.target - now);
    const days = Math.floor(left / 86400000);
    const big = days >= 1
      ? wgFa(days) + W("<span class=\"wg-unit\"> روز</span>")
      : wgFa(wgPad(Math.floor(left / 3600000)) + ':' + wgPad(Math.floor((left % 3600000) / 60000)));
    return wgHead(sp, wgFlagText(sp, st, now), true) +
      '<div class="wg-big">' + big + '</div>' +
      '<div class="wg-foot"><span class="wg-cd ltr" data-wg="cd">' + esc(wgCdText(sp, st, now)) + '</span></div>';
  }

  if (sp.type === 'weather') {
    const w = S.wgWx;
    const emo = wgWxEmoji(w ? w.code : null);
    const head = wgHead(sp, W("نیشابور"), false);
    if (!w) {
      return head + W("<div class=\"wg-skelbar\"></div><div class=\"wg-sub\">دارم هوا را می‌گیرم ...</div>");
    }
    return head +
      '<div class="wg-wx"><span class="wg-wx-emo">' + emo[0] + '</span>' +
      '<span class="wg-big wg-temp">' + wgNum(w.t) + '°</span></div>' +
      '<div class="wg-sub">' + esc(emo[1]) + W(" · بیشینه ") + wgNum(w.hi) + W("° / کمینه ") + wgNum(w.lo) + '°</div>' +
      '<div class="wg-chips"><span class="wg-chip">💧 ' + wgNum(w.hum) + W("٪</span>") +
      '<span class="wg-chip">🌬 ' + wgNum(w.wind) + '</span>' +
      '<span class="wg-chip extra">🌧 ' + wgNum(w.pop) + W("٪</span></div>");
  }

  if (sp.type === 'clock') {
    const t = wgTehran(now);
    return wgHead(sp, WG_DAYS[t.w], true) +
      '<div class="wg-big"><span data-wg="hms">' + wgFa(wgPad(t.h) + ':' + wgPad(t.min)) + '</span>' +
      '<span class="wg-secs" data-wg="secs">:' + wgFa(wgPad(t.s)) + '</span></div>' +
      '<div class="wg-sub" data-wg="jline">' + esc(wgJalaliLine(t)) + '</div>';
  }

  if (sp.type === 'date') {
    const t = wgTehran(now);
    const j = wgJalali(t.y, t.m, t.d);
    return wgHead(sp, WG_DAYS[t.w], true) +
      '<div class="wg-big wg-date">' + wgFa(j.jd) + '<span class="wg-unit"> ' + WG_MONTHS[j.jm - 1] + '</span></div>' +
      '<div class="wg-sub"><b data-wg="flag">' + WG_DAYS[t.w] + '</b> · ' +
      '<span data-wg="jline">' + esc(wgJalaliFull(t)) + '</span></div>';
  }

  if (sp.type === 'stats') {
    const u = S.wgStats || {};
    const msgs = isFinite(+u.msgs) ? +u.msgs : ((S.usage || {}).msgs || 0);
    const lim = +u.dailyLimit || ((S.settings || {}).dailyLimit || 0);
    const p = lim > 0 ? Math.min(1, msgs / lim) : 0;
    return wgHead(sp, W("امروز"), false) +
      '<div class="wg-big">' + wgFa(msgs) + W("<span class=\"wg-unit\"> پیام</span></div>") +
      (lim > 0 ? '<div class="wg-bar"><i style="width:' + Math.round(p * 100) + '%"></i></div>' +
        W("<div class=\"wg-sub\">از سقف ") + wgFa(lim) + '</div>' : '') +
      '<div class="wg-chips"><span class="wg-chip">⬇ ' + wgShort(u.tin) + '</span>' +
      '<span class="wg-chip">⬆ ' + wgShort(u.tout) + '</span></div>';
  }

  if (sp.type === 'list') {
    let ck = [];
    try { ck = JSON.parse(localStorage.getItem('wgCk:' + sp.id) || '[]') || []; } catch (e) {}
    const lis = (sp.items || []).map((it, i) => {
      const on = ck.indexOf(i) >= 0;
      return '<div class="wg-li' + (on ? ' on' : '') + '" data-wg-li="' + i + '" data-id="' + esc(sp.id) + '">' +
        '<i>' + (on ? '✓' : '') + '</i><span>' + esc(it) + '</span></div>';
    }).join('') || W("<div class=\"wg-li\"><i></i><span>خالی است</span></div>");
    return wgHead(sp, wgFa((sp.items || []).length) + W(" مورد"), false) + '<div class="wg-list">' + lis + '</div>';
  }

  /* note (پیش‌فرض) */
  return wgHead(sp, W("یادداشت"), false) +
    '<div class="wg-note">' + esc(sp.text || sp.title || '—') + '</div>';
}

function wgCardHtml(sp, i) {
  const isNew = !S.wgSeen[sp.id];
  return '<div class="wg-card wg-' + sp.size + ' wg-ac-' + sp.accent + (isNew ? ' wg-new' : '') +
    '" data-id="' + esc(sp.id) + '" data-type="' + sp.type + '" style="--i:' + i + '">' +
    '<button class="wg-edit" data-wg-edit="' + esc(sp.id) + W("\" aria-label=\"ویرایش\">✎</button>") +
    '<div class="wg-in">' + wgInner(sp, Date.now()) + '</div></div>';
}

async function loadWidgets() {
  if (S.wgLoaded) return;
  try {
    const r = await API.get('/api/v1/widgets');
    S.widgets = r.items || [];
    S.wgMax = r.max || WG_MAX_DEFAULT;
    S.wgLoaded = true;
    if (S.screen === 'widgets') renderWidgets();
  } catch (e) { /* بعداً دوباره */ }
}

function renderWidgets() {
  const board = $('wgBoard');
  if (!board) return;
  if (!S.wgLoaded) { loadWidgets(); return; }
  const items = S.widgets || [];
  $('wgCount').textContent = wgFa(items.length) + '/' + wgFa(S.wgMax || WG_MAX_DEFAULT);
  if (!S.wgSeen) S.wgSeen = {};
  board.innerHTML = items.length
    ? items.map(wgCardHtml).join('')
    : '<div class="wg-empty glass"><span class="em-ic">🧩</span>' +
      W("<div class=\"em-t\">هنوز ویجتی نداری</div>") +
      W("<div class=\"em-s\">بالا بنویس چی بسازم:<br>") +
      W("<b>«فردا ساعت ۹ قرص بخورم»</b> · <b>«آب‌وهوا نشون بده»</b> · <b>«لیست خرید»</b></div></div>");
  items.forEach((sp) => { S.wgSeen[sp.id] = 1; });
  wgLoadWx(false);
  wgLoadStats(false);
}

/* FLIP: قبل/بعد جابه‌جایی کارت‌ها (تغییر سایز/حذف/بازآرایی) */
function wgFlipRender() {
  const board = $('wgBoard');
  if (!board) { renderWidgets(); return; }
  const before = {};
  const prev = board.querySelectorAll('.wg-card');
  prev.forEach((c) => { before[c.dataset.id] = c.getBoundingClientRect(); });
  renderWidgets();
  const next = board.querySelectorAll('.wg-card');
  next.forEach((c) => {
    const b = before[c.dataset.id];
    if (!b) return;
    const a = c.getBoundingClientRect();
    const dx = b.left - a.left, dy = b.top - a.top;
    if (!dx && !dy) return;
    c.animate([
      { transform: 'translate(' + dx + 'px,' + dy + 'px)', opacity: .7 },
      { transform: 'none', opacity: 1 },
    ], { duration: 450, easing: 'cubic-bezier(.2,.9,.25,1.08)' });
  });
}

/* ─── داده‌های زنده: هوا و آمار ─── */
async function wgLoadWx(force) {
  if (!(S.widgets || []).some((x) => x.type === 'weather')) return;
  const now = Date.now();
  if (!force && S.wgWx && !S.wgWxErr && now - S.wgWx.at < 60000) return;
  if (S.wgWxLoading) return;
  S.wgWxLoading = true;
  try {
    const d = await API.get('/api/v1/wdata?what=weather');
    S.wgWx = d; S.wgWxErr = '';
    if (S.screen === 'widgets') {
      const cards = $('wgBoard').querySelectorAll('.wg-card[data-type="weather"]');
      cards.forEach((c) => {
        const sp = wgFind(c.dataset.id);
        const inr = c.querySelector('.wg-in');
        if (sp && inr) inr.innerHTML = wgInner(sp, Date.now());
      });
    }
  } catch (e) { S.wgWxErr = e.message; }
  S.wgWxLoading = false;
}
async function wgLoadStats(force) {
  if (!(S.widgets || []).some((x) => x.type === 'stats')) return;
  const now = Date.now();
  if (!force && S.wgStats && now - S.wgStats.at < 60000) return;
  if (S.wgStatsLoading) return;
  S.wgStatsLoading = true;
  try {
    const d = await API.get('/api/v1/wdata?what=stats');
    d.at = now;
    S.wgStats = d;
    if (S.screen === 'widgets') {
      const cards = $('wgBoard').querySelectorAll('.wg-card[data-type="stats"]');
      cards.forEach((c) => {
        const sp = wgFind(c.dataset.id);
        const inr = c.querySelector('.wg-in');
        if (sp && inr) inr.innerHTML = wgInner(sp, Date.now());
      });
    }
  } catch (e) { /* بعداً */ }
  S.wgStatsLoading = false;
}

/* ─── تیک ثانیه: یادآوری‌های رسیده + کارت‌های زنده ─── */
function wgTick() {
  const items = S.widgets;
  if (!items || !items.length) return;
  const now = Date.now();

  for (let i = 0; i < items.length; i++) {
    const sp = items[i];
    if (sp.type !== 'reminder' || !sp.at) continue;
    const st = wgRemState(sp, now);
    if (st.s !== 'due') continue;
    const marker = sp.repeat === 'daily' ? wgTehran(now).ymd : '1';
    let got = '';
    try { got = localStorage.getItem('wgDue:' + sp.id) || ''; } catch (e) {}
    if (got === marker) continue;
    try { localStorage.setItem('wgDue:' + sp.id, marker); } catch (e) {}
    if (now - st.target >= 6 * 3600000) continue;
    toast('⏰ ' + (sp.title || W("یادآور")) + (sp.text ? ' — ' + sp.text : ''), 'ok');
    haptic(180);
  }

  wgUpdateLive(now);

  /* تازه‌سازی هر چند ثانیه (داخلش کهنگی را خودش چک می‌کند) */
  if (now % 5000 < 1100) { wgLoadWx(false); wgLoadStats(false); }
}

function wgUpdateLive(now) {
  if (S.screen !== 'widgets') return;
  const board = $('wgBoard');
  if (!board) return;
  const t = wgTehran(now);
  const cards = board.querySelectorAll('.wg-card');
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const sp = wgFind(card.dataset.id);
    if (!sp) continue;
    const type = sp.type;

    if (type === 'clock') {
      const a = card.querySelector('[data-wg="hms"]');
      if (a) a.textContent = wgFa(wgPad(t.h) + ':' + wgPad(t.min));
      const b = card.querySelector('[data-wg="secs"]');
      if (b) b.textContent = ':' + wgFa(wgPad(t.s));
      const f = card.querySelector('[data-wg="flag"]');
      if (f) f.textContent = WG_DAYS[t.w];
      const jl = card.querySelector('[data-wg="jline"]');
      if (jl) jl.textContent = wgJalaliLine(t);
      const rg = card.querySelector('[data-wg="ring"]');
      if (rg) wgSetRing(rg, t.s / 60);
    } else if (type === 'date') {
      const f = card.querySelector('[data-wg="flag"]');
      if (f) f.textContent = WG_DAYS[t.w];
      const jl = card.querySelector('[data-wg="jline"]');
      if (jl) jl.textContent = wgJalaliFull(t);
    } else if (type === 'reminder' || type === 'countdown') {
      const st = wgRemState(sp, now);
      const cur = card.classList.contains('st-due') ? 'due' : (card.classList.contains('st-done') ? 'done' : 'wait');
      if (cur !== st.s) {
        card.classList.remove('st-due', 'st-done');
        if (st.s === 'due') card.classList.add('st-due');
        if (st.s === 'done') card.classList.add('st-done');
        const f = card.querySelector('[data-wg="flag"]');
        if (f) f.textContent = wgFlagText(sp, st, now);
        haptic(st.s === 'due' ? 24 : 10);
      }
      const cd = card.querySelector('[data-wg="cd"]');
      if (cd) cd.textContent = wgCdText(sp, st, now);
      const rg = card.querySelector('[data-wg="ring"]');
      if (rg && st.s === 'wait') wgSetRing(rg, wgProg(st, now));
      const big = card.querySelector('.wg-big[data-wg="big"]');
      if (big && type === 'countdown' && st.s === 'wait') {
        const left = Math.max(0, st.target - now);
        const days = Math.floor(left / 86400000);
        big.innerHTML = days >= 1
          ? wgFa(days) + W("<span class=\"wg-unit\"> روز</span>")
          : wgFa(wgPad(Math.floor(left / 3600000)) + ':' + wgPad(Math.floor((left % 3600000) / 60000)));
      }
    }
  }
}

/* ─── ساخت با AI ─── */
async function wgMake(prompt, id) {
  const p = String(prompt || '').replace(/\s+/g, ' ').trim();
  if (!p) { toast(W("اول بنویس چی بسازم ✍️"), 'err'); return null; }
  const board = $('wgBoard');
  let skel = null;
  if (board) {
    skel = document.createElement('div');
    skel.className = 'wg-card wg-1x1 wg-skel';
    skel.innerHTML = W("<div class=\"wg-skel-in\"><span class=\"spin\">✨</span>دارم می‌سازمش ...</div>");
    board.appendChild(skel);
  }
  try {
    const body = { op: 'ai', prompt: p };
    if (id) body.id = id;
    const r = await API.post('/api/v1/widgets', body);
    S.widgets = r.items || [];
    S.wgMax = r.max || S.wgMax || WG_MAX_DEFAULT;
    if (skel) skel.remove();
    wgFlipRender();
    toast(r.src === 'ai' ? W("ویجت ساخته شد ✨") : W("ویجت ساخته شد (حالت سریع ⚡)"), 'ok');
    haptic(24);
    return r.spec || null;
  } catch (e) {
    if (skel) skel.remove();
    toast(e.message, 'err');
    return null;
  }
}

/* ─── شیت ویرایش ─── */
function wgChipsPick(group, opts, cur) {
  return '<div class="wg-pick">' + opts.map((o) =>
    '<button class="wg-pk' + (o.v === cur ? ' on' : '') + '" data-wg-pick="' + group +
    '" data-v="' + o.v + '">' + o.l + '</button>').join('') + '</div>';
}
function wgEditSheet(id) {
  const sp = wgFind(id);
  if (!sp) return;
  let h = W("<div class=\"sec\"><div class=\"sec-t\">عنوان</div><div class=\"f-row\">") +
    '<input id="wgT" maxlength="30" value="' + esc(sp.title || '') + '"></div></div>';
  if (sp.type === 'reminder' || sp.type === 'countdown') {
    h += '<div class="sec"><div class="sec-t">' +
      (sp.type === 'reminder' ? W("زمان یادآوری (به وقت تهران)") : W("زمان پایان")) +
      '</div><div class="f-row"><input id="wgAt" type="datetime-local" value="' + wgAtToLocal(sp.at) + '"></div></div>';
  }
  if (sp.type === 'reminder') {
    h += W("<div class=\"sec\"><div class=\"sec-t\">تکرار</div>") +
      wgChipsPick('rep', [{ v: 'none', l: W("یک‌بار") }, { v: 'daily', l: W("🔁 هر روز") }], sp.repeat || 'none') + '</div>';
  }
  if (sp.type === 'reminder' || sp.type === 'countdown' || sp.type === 'note') {
    h += W("<div class=\"sec\"><div class=\"sec-t\">متن</div><textarea id=\"wgX\" class=\"f-area\" maxlength=\"150\">") +
      esc(sp.text || '') + '</textarea></div>';
  }
  if (sp.type === 'list') {
    h += W("<div class=\"sec\"><div class=\"sec-t\">آیتم‌ها (هر خط یکی)</div><textarea id=\"wgI\" class=\"f-area\">") +
      esc((sp.items || []).join('\n')) + '</textarea></div>';
  }
  h += W("<div class=\"sec\"><div class=\"sec-t\">اندازه ویجت</div>") +
    wgChipsPick('size', [
      { v: '1x1', l: W("▣ کوچک") }, { v: '2x1', l: W("▭ پهن") },
      { v: '1x2', l: W("▯ بلند") }, { v: '2x2', l: W("▦ بزرگ") },
    ], sp.size) + '</div>';
  h += W("<div class=\"sec\"><div class=\"sec-t\">رنگ</div>") +
    wgChipsPick('acc', [
      { v: 'blue', l: W("🔵 آبی") }, { v: 'green', l: W("🟢 سبز") }, { v: 'red', l: W("🔴 قرمز") },
    ], sp.accent) + '</div>';
  h += '<div class="f-row" style="gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
    '<button class="btn acc sm" data-act="wg-save" data-id="' + esc(id) + W("\">ذخیره ✅</button>") +
    '<button class="btn ghost sm" data-act="wg-up" data-id="' + esc(id) + W("\">↑ جلو</button>") +
    '<button class="btn ghost sm" data-act="wg-down" data-id="' + esc(id) + W("\">↓ عقب</button>") +
    '<button class="btn ghost sm" data-act="wg-del" data-id="' + esc(id) + W("\" style=\"color:var(--danger)\">🗑 حذف</button></div>");
  h += W("<div class=\"sec\"><div class=\"sec-t\">یا دوباره با AI از نو بسازش</div>") +
    W("<textarea id=\"wgAi\" class=\"f-area\" placeholder=\"مثلاً: فردا ساعت ۱۰ صبح جلسه دارم\"></textarea>") +
    '<button class="btn ghost sm" data-act="wg-ai" data-id="' + esc(id) + W("\" style=\"margin-top:8px;width:100%\">✨ بازسازی با AI</button></div>");
  openSheet(W("ویرایش ویجت"), h);
}

async function wgSaveFromSheet(id) {
  const sp = wgFind(id);
  if (!sp) return;
  const pick = (k) => {
    const el = document.querySelector('#shBody [data-wg-pick="' + k + '"].on');
    return el ? el.dataset.v : null;
  };
  const nsp = JSON.parse(JSON.stringify(sp));
  const tv = $('wgT') ? $('wgT').value.trim() : '';
  if (tv) nsp.title = tv.slice(0, 30);
  if ($('wgX')) nsp.text = ($('wgX').value || '').replace(/\s+/g, ' ').trim().slice(0, 150);
  if ($('wgI')) nsp.items = ($('wgI').value || '').split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 6);
  if ($('wgAt')) { const at = wgLocalToAt($('wgAt').value); if (at) nsp.at = at; }
  const sz = pick('size'); if (sz) nsp.size = sz;
  const ac = pick('acc'); if (ac) nsp.accent = ac;
  const rp = pick('rep'); if (rp) nsp.repeat = rp;
  try {
    const r = await API.post('/api/v1/widgets', { op: 'put', spec: nsp });
    S.widgets = r.items || [];
    try { localStorage.removeItem('wgDue:' + id); } catch (e) {}
    closeSheet();
    wgFlipRender();
    toast(W("ویجت ذخیره شد ✅"), 'ok');
  } catch (e) { toast(e.message, 'err'); }
}
async function wgDelFromSheet(id) {
  try {
    const r = await API.post('/api/v1/widgets', { op: 'del', id: id });
    S.widgets = r.items || [];
    try { localStorage.removeItem('wgDue:' + id); localStorage.removeItem('wgCk:' + id); } catch (e) {}
    closeSheet();
    wgFlipRender();
    toast(W("ویجت حذف شد 🗑"), 'ok');
  } catch (e) { toast(e.message, 'err'); }
}
async function wgAiFromSheet(id, btn) {
  const ta = $('wgAi');
  const v = ta ? ta.value.trim() : '';
  if (!v) { toast(W("پرامپت را بنویس ✍️"), 'err'); return; }
  if (btn) { btn.disabled = true; btn.textContent = W("... دارم می‌سازمش"); }
  const sp = await wgMake(v, id);
  if (btn) { btn.disabled = false; btn.textContent = W("✨ بازسازی با AI"); }
  if (sp) closeSheet();
}
async function wgMove(id, dir) {
  const ids = (S.widgets || []).map((x) => x.id);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  ids.splice(j, 0, ids.splice(i, 1)[0]);
  try {
    const r = await API.post('/api/v1/widgets', { op: 'reorder', order: ids });
    S.widgets = r.items || S.widgets;
    wgFlipRender();
    toast(dir < 0 ? W("برد جلوتر ↑") : W("برد عقب‌تر ↓"), 'ok');
  } catch (e) { toast(e.message, 'err'); }
}

/* ─── وایر صفحه ویجت‌ها ─── */
function wireWidgets() {
  $('wgMake').addEventListener('click', async () => {
    const v = $('wgInput').value.trim();
    if (!v) { toast(W("بنویس چی بسازم ..."), 'err'); $('wgInput').focus(); return; }
    const b = $('wgMake');
    b.disabled = true;
    const sp = await wgMake(v);
    if (sp) $('wgInput').value = '';
    b.disabled = false;
  });
  $('wgInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('wgMake').click(); });
  $('wgEx').addEventListener('click', (e) => {
    const b = e.target.closest('[data-ex]');
    if (b) { $('wgInput').value = b.dataset.ex; $('wgInput').focus(); }
  });
  $('wgRefresh').addEventListener('click', async () => {
    const b = $('wgRefresh');
    b.disabled = true;
    try {
      const r = await API.get('/api/v1/widgets');
      S.widgets = r.items || [];
      S.wgMax = r.max || S.wgMax;
      S.wgLoaded = true;
      S.wgWx = null; S.wgStats = null;
      wgFlipRender();
      wgLoadWx(true);
      wgLoadStats(true);
      toast(W("تازه شد 🔄"), 'ok');
    } catch (e) { toast(e.message, 'err'); }
    b.disabled = false;
  });
  $('wgBoard').addEventListener('click', (e) => {
    const ed = e.target.closest('[data-wg-edit]');
    if (ed) { wgEditSheet(ed.dataset.wgEdit); return; }
    const li = e.target.closest('[data-wg-li]');
    if (li) {
      const id = li.dataset.id, idx = +li.dataset.wgLi;
      let ck = [];
      try { ck = JSON.parse(localStorage.getItem('wgCk:' + id) || '[]') || []; } catch (er) { ck = []; }
      const at = ck.indexOf(idx);
      if (at >= 0) ck.splice(at, 1); else ck.push(idx);
      try { localStorage.setItem('wgCk:' + id, JSON.stringify(ck)); } catch (er) {}
      const on = ck.indexOf(idx) >= 0;
      li.classList.toggle('on', on);
      const bi = li.querySelector('i');
      if (bi) bi.textContent = on ? '✓' : '';
      haptic(10);
      return;
    }
  });
  if (!S.wgTimer) S.wgTimer = setInterval(wgTick, 1000);
}

/* ═══════════ شیت‌ها ═══════════ */
function openSheet(title, html) {
  $('shTitle').textContent = title;
  $('shBody').innerHTML = html;
  $('backdrop').hidden = false;
  $('sheet').hidden = false;
  requestAnimationFrame(() => {
    $('backdrop').classList.add('on');
    $('sheet').classList.add('on');
  });
  haptic(12);
}
function closeSheet() {
  $('backdrop').classList.remove('on');
  $('sheet').classList.remove('on');
  setTimeout(() => { $('backdrop').hidden = true; $('sheet').hidden = true; }, 460);
}
function wireSheets() {
  $('shClose').addEventListener('click', closeSheet);
  $('backdrop').addEventListener('click', closeSheet);
  $('shBody').addEventListener('click', async (e) => {
    const act = (e.target.closest('[data-act]') || {}).dataset;
    if (act && act.act) {
      if (act.act === 'close') { closeSheet(); return; }
      if (act.act === 'wg-save') { wgSaveFromSheet(act.id); return; }
      if (act.act === 'wg-del') { wgDelFromSheet(act.id); return; }
      if (act.act === 'wg-ai') { wgAiFromSheet(act.id, e.target.closest('button')); return; }
      if (act.act === 'wg-up') { wgMove(act.id, -1); return; }
      if (act.act === 'wg-down') { wgMove(act.id, 1); return; }
      if (act.act === 'do-imgmodel') {
        try {
          await API.post('/api/v1/settings', { imgModel: act.id });
          S.settings.imgModel = act.id;
          closeSheet(); toast(W("مدل تصویر عوض شد ✅"), 'ok'); renderSettings();
        } catch (er) { toast(er.message, 'err'); }
        return;
      }
      if (act.act === 'do-del') {
        try {
          const r = await API.post('/api/v1/thread', { op: 'delete', id: act.id });
          S.threads = r.threads; S.thread = r.thread;
          closeSheet(); toast(W("حذف شد"), 'ok'); renderThreads(); loadHistory();
        } catch (er) { toast(er.message, 'err'); }
        return;
      }
      if (act.act === 'do-ren') {
        try {
          const r = await API.post('/api/v1/thread', { op: 'rename', id: act.id, name: $('renIn').value });
          S.threads = r.threads;
          closeSheet(); toast(W("نام عوض شد ✅"), 'ok'); renderThreads();
        } catch (er) { toast(er.message, 'err'); }
        return;
      }
      if (act.act === 'do-memclear') {
        try { await API.post('/api/v1/memory', { op: 'clear' }); closeSheet(); toast(W("حافظه پاک شد"), 'ok'); renderMemory(); }
        catch (er) { toast(er.message, 'err'); }
        return;
      }
      if (act.act === 'do-memedit') {
        try {
          await API.post('/api/v1/memory', { op: 'edit', id: act.id, newText: $('memEd').value });
          closeSheet(); toast(W("ویرایش شد ✅"), 'ok'); renderMemory();
        } catch (er) { toast(er.message, 'err'); }
        return;
      }
      if (act.act === 'do-clearhist') {
        try {
          await API.post('/api/v1/thread', { op: 'clear', id: S.thread });
          closeSheet(); toast(W("تاریخچه پاک شد 🧹"), 'ok'); loadHistory();
        } catch (er) { toast(er.message, 'err'); }
        return;
      }
      if (act.act === 'act-img') { closeSheet(); setTimeout(() => $('fileImg').click(), 300); return; }
      if (act.act === 'act-txt') { closeSheet(); setTimeout(() => $('fileTxt').click(), 300); return; }
    }
    /* انتخاب چیپ‌های ویجت (اندازه/رنگ/تکرار) */
    const wgp = e.target.closest('[data-wg-pick]');
    if (wgp) {
      const grp = wgp.dataset.wgPick;
      $$('#shBody [data-wg-pick="' + grp + '"]').forEach((x) => x.classList.toggle('on', x === wgp));
      haptic(8);
      return;
    }
    /* انتخاب مدل */
    const mi = e.target.closest('[data-model]');
    if (mi) {
      const key = mi.dataset.model;
      try {
        await setSetting({ model: key });
        closeSheet();
        toast(W("مدل عوض شد ✅"), 'ok');
        haptic(18);
        await bootState(true);
      } catch (er) { toast(er.message, 'err'); }
      return;
    }
    /* انتخاب پرسونا */
    const pi = e.target.closest('[data-persona]');
    if (pi) {
      try {
        await setSetting({ persona: +pi.dataset.persona });
        closeSheet();
        toast(W("شخصیت عوض شد ✅"), 'ok');
        if (S.screen === 'settings') renderSettings();
      } catch (er) { toast(er.message, 'err'); }
      return;
    }
    /* تم/چیدمان از شیت */
    const lc = e.target.closest('[data-loc]');
    if (lc) {
      setLocale(lc.dataset.loc, true);
      $$('#localeSeg .seg-b').forEach((b2) => b2.classList.toggle('on', b2 === lc));
      haptic(16);
      toast(W("ذخیره شد ✅"), 'ok');
      return;
    }
    const tp = e.target.closest('[data-theme-pick]');
    if (tp) {
      applyTheme(tp.dataset.themePick, true);
      $$('#shBody [data-theme-pick]').forEach((p) => p.classList.toggle('on', p === tp));
      toast(W("تم: ") + THEME_NAMES[S.theme], 'ok');
      return;
    }
    const lp = e.target.closest('[data-layout-pick]');
    if (lp) {
      applyLayout(lp.dataset.layoutPick, true);
      $$('#shBody [data-layout-pick]').forEach((p) => p.classList.toggle('on', p === lp));
      toast(W("چیدمان: ") + LAYOUT_NAMES[S.layout], 'ok');
      return;
    }
  });
  /* جستجوی مدل */
  $('shBody').addEventListener('input', (e) => {
    if (e.target.id !== 'mdlSearch') return;
    const q = e.target.value.trim().toLowerCase();
    $$('#mdlList .item').forEach((it) => {
      it.hidden = q && (it.dataset.k || '').toLowerCase().indexOf(q) < 0 && it.textContent.toLowerCase().indexOf(q) < 0;
    });
    $$('#mdlList .sec-t').forEach((h) => { h.hidden = !!q; });
  });
}
function openModelsSheet() {
  let html = W("<div class=\"f-row\" style=\"margin-bottom:6px\"><input id=\"mdlSearch\" placeholder=\"جستجوی مدل...\"></div>");
  const groups = {};
  S.models.forEach((m) => {
    const g = m.prov === 'cf' ? 'Workers AI ☁️' : (m.provName || W("سرویس‌ها"));
    (groups[g] = groups[g] || []).push(m);
  });
  html += '<div class="list" id="mdlList">';
  Object.keys(groups).forEach((g) => {
    html += '<div class="sec-t" style="margin-top:10px">' + esc(g) + '</div>';
    groups[g].forEach((m) => {
      const active = m.key === (S.currentModel.key || S.settings.model);
      html += '<div class="item' + (active ? ' active' : '') + '" data-model="' + esc(m.key) + '" data-k="' + esc((m.name || '') + ' ' + (m.key || '')) + '">' +
        '<span class="ic">' + (active ? '✅' : (m.prov === 'cf' ? '☁️' : '🔌')) + '</span>' +
        '<div class="mid"><div class="t1">' + esc(m.name) + '</div>' +
        '<div class="t2">' + esc(m.provName || '') + ' · ' + m.ctx + 'K' + (m.vision ? W(" · 👁 ویژن") : '') + '</div></div></div>';
    });
  });
  html += '</div>';
  openSheet(W("انتخاب مدل"), html);
  setTimeout(() => { const el = $('mdlSearch'); if (el) el.focus(); }, 400);
}
function openPersonasSheet() {
  let html = '<div class="list">';
  S.personas.forEach((p, i) => {
    const active = (S.settings.persona || 0) === i;
    html += '<div class="item' + (active ? ' active' : '') + '" data-persona="' + i + '">' +
      '<span class="ic">' + esc(p.icon) + '</span>' +
      '<div class="mid"><div class="t1">' + esc(p.name) + '</div></div>' +
      (active ? W("<span class=\"badge\">فعال</span>") : '') + '</div>';
  });
  html += '</div>';
  openSheet(W("شخصیت (پرسونا)"), html);
}
function openThemeSheet() {
  openSheet(W("تم و چیدمان"),
    W("<div class=\"sec\"><div class=\"sec-t\">تم رنگی</div>") + themePickHtml() + '</div>' +
    W("<div class=\"sec\"><div class=\"sec-t\">چیدمان</div>") + layoutPickHtml() + '</div>');
}

/* ═══════════ ورود ═══════════ */
function wireLogin() {
  $('loginGo').addEventListener('click', doLogin);
  $('loginPw').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
  $('loginSwitch').addEventListener('click', () => {
    try { localStorage.removeItem('tk'); } catch (e) {}
    S.token = '';
    if (window.Android && Android.reset) { Android.reset(); }
    else { $('loginSt').className = 'status'; $('loginSt').textContent = W("در حالت مرورگر، آدرس را در ورکر جدید عوض کن و رفرش بزن."); }
  });
}
