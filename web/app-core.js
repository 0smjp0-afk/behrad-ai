/* ═══════════════════════════════════════════════════════════════
   Behrad AI — هسته: وضعیت، API، SSE، مارک‌داون، افکت‌ها
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ─── وضعیت سراسری ─── */
const S = {
  token: '',
  screen: 'chat',
  stack: [],                 // سابقه اسکرین‌ها برای دکمه بازگشت
  settings: {},
  threads: [],
  thread: 'main',
  models: [],
  currentModel: {},
  personas: [],
  providers: [],
  usage: {},
  flags: {},
  memCount: 0,
  memMax: 50,
  hist: [],                   // تاریخچه اسکرین چت (پیام‌های سرور)
  busy: false,                // در حال دریافت پاسخ
  rec: null,                  // وضعیت ضبط ویس
  attaches: [],               // عکس‌های آماده‌ارسال {b64, mime}
  fileAtt: null,              // فایل متنی آماده‌ارسال {name, text}
  locale: 'fa',
  theme: 'abyss',
  layout: 'classic',
  toastN: 0,
};

const $ = (id) => document.getElementById(id);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
const THEMES = ['abyss', 'jade', 'ember', 'storm'];
const THEME_NAMES = new Proxy({}, { get: (_, k) => t('theme.' + k) });
const THEME_DESC = new Proxy({}, { get: (_, k) => t('theme.' + k + '.desc') });
const THEME_DOTS = {
  abyss: ['#38BDF8', '#34D399', '#F87171'],
  jade: ['#34D399', '#38BDF8', '#D97706'],
  ember: ['#F87171', '#60A5FA', '#D97706'],
  storm: ['#60A5FA', '#FB8090', '#0EA5E9'],
};
const LAYOUTS = ['classic', 'immersive', 'bento'];
const LAYOUT_NAMES = new Proxy({}, { get: (_, k) => t('layout.' + k) });
const LAYOUT_DESC = new Proxy({}, { get: (_, k) => t('layout.' + k + '.desc') });

/* ─── ابزارها ─── */
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function haptic(ms) {
  try {
    if (window.Android && Android.vibrate) Android.vibrate(ms || 12);
  } catch (e) {}
}

function nowHM() {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function toast(msg, type) {
  const el = document.createElement('div');
  el.className = 'toast ' + (type || '');
  el.textContent = msg;
  $('toasts').appendChild(el);
  haptic(type === 'err' ? 40 : 14);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 420); }, 2400);
}

/* ریپل لمس روی دکمه‌ها */
document.addEventListener('pointerdown', (e) => {
  const b = e.target.closest('.btn, .dock-item, .tb-btn, .c-btn, .mini-btn, .b-card, .go, .pick, .v-chip');
  if (!b) return;
  const r = b.getBoundingClientRect();
  const sp = document.createElement('span');
  sp.className = 'ripple';
  const d = Math.max(r.width, r.height);
  sp.style.width = sp.style.height = d + 'px';
  sp.style.left = (e.clientX - r.left - d / 2) + 'px';
  sp.style.top = (e.clientY - r.top - d / 2) + 'px';
  b.appendChild(sp);
  setTimeout(() => sp.remove(), 640);
});

/* ─── اینست‌ها (از اندروید) ─── */
window.__setInsets = function (arr) {
  if (!Array.isArray(arr)) return;
  const r = document.documentElement.style;
  r.setProperty('--it', (arr[0] || 0) + 'px');
  r.setProperty('--ib', (arr[1] || 0) + 'px');
  r.setProperty('--il', (arr[2] || 0) + 'px');
  r.setProperty('--ir', (arr[3] || 0) + 'px');
};
try {
  if (window.Android && Android.getInsets) window.__setInsets(JSON.parse(Android.getInsets()));
} catch (e) {}

/* ─── تم و چیدمان ─── */
/* ── زبانِ رابط (fa/en) — پس از تغییر، کلِ صفحه بازرند می‌شود ── */
function setLocale(l, save) {
  S.locale = (l === 'en') ? 'en' : 'fa';
  if (save) { try { localStorage.setItem('locale', S.locale); } catch (e) {} }
  applyLocale();
  if (typeof renderScreen === 'function') renderScreen(S.screen);
  if (typeof renderDock === 'function') renderDock();
  if (typeof renderChips === 'function') try { renderChips(); } catch (e) {}
}
function applyTheme(t, save) {
  if (THEMES.indexOf(t) < 0) t = 'abyss';
  S.theme = t;
  document.documentElement.setAttribute('data-theme', t);
  const mc = document.querySelector('meta[name="theme-color"]');
  const cols = { abyss: '#050B14', jade: '#04120E', ember: '#130709', storm: '#07090F' };
  if (mc) mc.setAttribute('content', cols[t] || '#050B14');
  if (save) { try { localStorage.setItem('theme', t); } catch (e) {} }
}
function applyLayout(l, save) {
  if (LAYOUTS.indexOf(l) < 0) l = 'classic';
  S.layout = l;
  document.documentElement.setAttribute('data-layout', l);
  if (save) { try { localStorage.setItem('layout', l); } catch (e) {} }
  renderDock();
}
function nextTheme() {
  const i = THEMES.indexOf(S.theme);
  applyTheme(THEMES[(i + 1) % THEMES.length], true);
  toast(W("تم: ") + THEME_NAMES[S.theme]);
  haptic(18);
  if (S.screen === 'home' || S.screen === 'settings') renderScreen(S.screen);
}

/* ─── مارک‌داون سبک (همان خروجی mdToHtml ورکر) ─── */
function mdRender(src) {
  let s = String(src == null ? '' : src);
  const blocks = [];
  // کدهای چندخطی را موقت بیرون بکش
  s = s.replace(/```([\w+-]*)\n?([\s\S]*?)```/g, (m, lang, code) => {
    blocks.push({ lang: lang || '', code: code.replace(/\n$/, '') });
    return '\u0000CODE' + (blocks.length - 1) + '\u0000';
  });
  s = esc(s);
  s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  s = s.replace(/^\s*&gt;\s?(.*)$/gm, '<blockquote>$1</blockquote>');
  s = s.replace(/^\s*---+\s*$/gm, '<hr>');
  s = s.replace(/^######\s+(.*)$/gm, '<h3>$1</h3>');
  s = s.replace(/^#####\s+(.*)$/gm, '<h3>$1</h3>');
  s = s.replace(/^####\s+(.*)$/gm, '<h3>$1</h3>');
  s = s.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
  s = s.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');
  s = s.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');
  s = s.replace(/\*\*\*([^*]+)\*\*\*/g, '<b><i>$1</i></b>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?=[^*\w]|$)/g, '$1<i>$2</i>');
  s = s.replace(/~~([^~\n]+)~~/g, '<s>$1</s>');
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>');
  s = s.replace(/(^|[\s(])((?:https?:\/\/)[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  // لیست‌ها
  s = s.replace(/(?:^|\n)((?:[ \t]*[-*+][ \t]+.*(?:\n|$))+)/g, (m, list) => {
    const items = list.trim().split('\n').map((li) => '<li>' + li.replace(/^[ \t]*[-*+][ \t]+/, '') + '</li>').join('');
    return '\n<ul>' + items + '</ul>';
  });
  s = s.replace(/(?:^|\n)((?:[ \t]*\d+\.[ \t]+.*(?:\n|$))+)/g, (m, list) => {
    const items = list.trim().split('\n').map((li) => '<li>' + li.replace(/^[ \t]*\d+\.[ \t]+/, '') + '</li>').join('');
    return '\n<ol>' + items + '</ol>';
  });
  // پاراگراف
  s = s.split(/\n{2,}/).map((p) => {
    p = p.trim();
    if (!p) return '';
    if (/^<(h1|h2|h3|ul|ol|blockquote|hr|pre)/.test(p)) return p;
    return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
  }).join('\n');
  // کدها را برگردان
  s = s.replace(/\u0000CODE(\d+)\u0000/g, (m, i) => {
    const b = blocks[+i];
    const safe = esc(b.code);
    return '<pre data-code="' + encodeURIComponent(b.code) + '"><button class="copy-btn">کپی</button>' +
      '<code>' + safe + '</code></pre>';
  });
  return s;
}

/* ─── API ─── */
const API = {
  async req(path, opt) {
    opt = opt || {};
    const headers = Object.assign({}, opt.headers || {});
    if (S.token) headers['Authorization'] = 'Bearer ' + S.token;
    let body = opt.body;
    if (body != null && !(body instanceof FormData) && typeof body !== 'string') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }
    let res;
    try {
      res = await fetch(path, { method: opt.method || 'GET', headers: headers, body: body });
    } catch (e) {
      throw { message: W("شبکه در دسترس نیست — اینترنت را چک کنید.") };
    }
    if (res.status === 401) { showLogin(); throw { message: W("نشست منقضی شد — دوباره وارد شوید.") }; }
    const ct = res.headers.get('content-type') || '';
    if (ct.indexOf('application/json') >= 0) {
      const js = await res.json();
      if (!res.ok) throw { message: js.error || (W("خطای ") + res.status) };
      return js;
    }
    if (!res.ok) throw { message: W("خطای ") + res.status };
    return res;
  },
  get(path) { return this.req(path); },
  post(path, body) { return this.req(path, { method: 'POST', body: body }); },

  /* چت جریانی (SSE روی POST) */
  async chat(body, onEvent) {
    const headers = { 'Content-Type': 'application/json' };
    if (S.token) headers['Authorization'] = 'Bearer ' + S.token;
    let res;
    try {
      res = await fetch('/api/v1/chat', { method: 'POST', headers: headers, body: JSON.stringify(body) });
    } catch (e) { throw { message: W("شبکه در دسترس نیست.") }; }
    if (res.status === 401) { showLogin(); throw { message: W("نشست منقضی شد.") }; }
    if (!res.ok) {
      let msg = W("خطای ") + res.status;
      try { const j = await res.json(); if (j.error) msg = j.error; } catch (e) {}
      throw { message: msg };
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    for (;;) {
      const r = await reader.read();
      if (r.done) break;
      buf += dec.decode(r.value, { stream: true });
      let idx;
      while ((idx = buf.indexOf('\n\n')) >= 0) {
        const chunk = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        if (chunk.slice(0, 6) !== 'data: ') continue;
        let ev;
        try { ev = JSON.parse(chunk.slice(6)); } catch (e) { continue; }
        onEvent(ev);
      }
    }
  },
};

/* ─── ورود ─── */
function showLogin() {
  const l = $('login');
  if (!l.hidden) return;
  $('loginSt').textContent = '';
  $('loginSt').className = 'status';
  $('loginOrigin').textContent = location.origin;
  l.hidden = false;
  const card = l.querySelector('.card');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = '';
  setTimeout(() => $('loginPw').focus(), 450);
}
function hideLogin() { $('login').hidden = true; }

async function doLogin() {
  const pw = $('loginPw').value;
  if (!pw) { const s = $('loginSt'); s.className = 'status err'; s.textContent = W("رمز را وارد کنید."); return; }
  const go = $('loginGo');
  go.disabled = true;
  const s = $('loginSt');
  s.className = 'status';
  s.textContent = W("در حال ورود ...");
  try {
    const r = await API.post('/api/v1/login', { password: pw });
    S.token = r.token;
    try { localStorage.setItem('tk', S.token); } catch (e) {}
    if (window.Android && Android.saveConfig) {
      try { Android.saveConfig(location.origin, S.token); } catch (e) {}
    }
    s.className = 'status ok';
    s.textContent = W("خوش آمدی ✅");
    $('loginPw').value = '';
    setTimeout(async () => { hideLogin(); await bootState(true); }, 500);
  } catch (e) {
    s.className = 'status err';
    s.textContent = e.message || W("ورود ناموفق بود.");
  } finally { go.disabled = false; }
}

/* ─── مسیریاب اسکرین‌ها ─── */
const SCREEN_TABS = { chat: 'chat', widgets: 'widgets', threads: 'threads', reminders: 'reminders', settings: 'settings', home: 'home' };
const SCREEN_TITLES = {
  chat: '', widgets: W("ویجت‌ها"), threads: W("گفتگوها"), reminders: W("یادآورها"), memory: W("حافظه بلندمدت"),
  voice: W("استودیو صدا"), settings: W("تنظیمات"), stats: W("آمار و مصرف"), home: W("خانه"),
};

function go(name, opts) {
  opts = opts || {};
  if (name === S.screen && !opts.force) return;
  const cur = document.querySelector('.screen.on');
  const nxt = document.querySelector('.screen[data-screen="' + name + '"]');
  if (!nxt) return;
  if (cur && cur !== nxt) {
    cur.classList.remove('on');
    cur.classList.add('leaving');
    setTimeout(() => cur.classList.remove('leaving'), 480);
  }
  if (!opts.back && SCREEN_TABS[name] !== S.screen && !SCREEN_TABS[S.screen]) S.stack.push(S.screen);
  if (!opts.back && SCREEN_TABS[name]) S.stack = [];
  S.screen = name;
  nxt.classList.add('on');
  // هدر
  const isChat = name === 'chat';
  $('tbBrand').hidden = !isChat;
  $('scrTitle').hidden = isChat;
  $('scrTitle').textContent = SCREEN_TITLES[name] || '';
  $('backBtn').hidden = isChat || !!SCREEN_TABS[name];
  $('statsBtn').hidden = !isChat;
  renderDock();
  renderScreen(name);
  haptic(10);
  // پارالاکس هدر روی اسکرین‌های اسکرول‌دار
  const body = nxt.querySelector('.scr-body, .msgs');
  if (body) body.scrollTop = nxt.dataset.scroll ? +nxt.dataset.scroll : body.scrollTop;
}

function goBack() {
  const prev = S.stack.pop() || 'chat';
  go(prev, { back: true });
}

function renderScreen(name) {
  try {
    if (name === 'threads') renderThreads();
    else if (name === 'memory') renderMemory();
    else if (name === 'reminders') renderReminders();
    else if (name === 'settings') renderSettings();
    else if (name === 'voice') renderVoice();
    else if (name === 'stats') renderStats();
    else if (name === 'home') renderBento();
    else if (name === 'widgets') renderWidgets();
    else if (name === 'chat') updateModelChip();
  } catch (e) { console.error('render', name, e); }
}

/* ─── داک ─── */
function renderDock() {
  const dock = $('dock');
  let items;
  if (S.layout === 'bento') {
    items = [
      { tab: 'home', ic: '🏠', lb: W("خانه") },
      { tab: 'chat', ic: '💬', lb: W("چت") },
      { tab: 'widgets', ic: '🧩', lb: W("ویجت‌ها") },
      { tab: 'threads', ic: '🗂', lb: W("گفتگوها") },
      { tab: 'reminders', ic: '⏰', lb: W("یادآور") },
      { tab: 'settings', ic: '⚙️', lb: W("تنظیمات") },
    ];
  } else if (S.layout === 'immersive') {
    items = [
      { tab: 'chat', ic: '💬', lb: W("چت") },
      { tab: 'widgets', ic: '🧩', lb: W("ویجت‌ها") },
      { tab: 'threads', ic: '🗂', lb: W("گفتگوها") },
      { tab: 'memory', ic: '🧠', lb: W("حافظه") },
      { tab: 'settings', ic: '⚙️', lb: W("تنظیمات") },
    ];
  } else {
    items = [
      { tab: 'chat', ic: '💬', lb: W("چت") },
      { tab: 'widgets', ic: '🧩', lb: W("ویجت‌ها") },
      { tab: 'threads', ic: '🗂', lb: W("گفتگوها") },
      { tab: 'reminders', ic: '⏰', lb: W("یادآور") },
      { tab: 'voice', ic: '🎙', lb: W("صدا") },
      { tab: 'settings', ic: '⚙️', lb: W("تنظیمات") },
    ];
  }
  const active = SCREEN_TABS[S.screen] || (S.screen === 'chat' ? 'chat' : '');
  dock.innerHTML = items.map((it) =>
    '<button class="dock-item' + (it.tab === active ? ' on' : '') + '" data-tab="' + it.tab + '">' +
    '<span class="di-ic">' + it.ic + '</span><span class="di-lb">' + it.lb + '</span></button>'
  ).join('');
}

/* ─── اسکرین‌ها: لود اولیه وضعیت ─── */
async function bootState(fast) {
  const st = await API.get('/api/v1/state');
  S.settings = st.settings || {};
  S.threads = st.threads || [];
  S.thread = st.thread || (S.threads[0] && S.threads[0].id) || 'main';
  S.models = st.models || [];
  S.currentModel = st.currentModel || {};
  S.personas = st.personas || [];
  S.providers = st.providers || [];
  S.usage = st.usage || {};
  S.flags = st.flags || {};
  S.memCount = st.memCount || 0;
  S.memMax = st.memMax || 50;
  S.version = st.version || '';
  S.briefHour = st.briefHour;
  S.gemModels = st.gemModels || null; // لیست واقعی مدل‌های TTS/STT/تصویر از سرور
  updateModelChip();
  renderDock();
  renderScreen(S.screen);
  if (!fast) loadHistory();
  try { loadWidgets(); } catch (e) {}
}

function updateModelChip() {
  const m = S.currentModel || {};
  const txt = (m.label || m.name || W("مدل")).replace(/\s+/g, ' ');
  $('modelChipText').textContent = txt;
}

/* ─── راه‌اندازی ─── */
async function boot() {
  // تم/چیدمان ذخیره‌شده
  try {
    setLocale(localStorage.getItem('locale') || 'fa', false);
    applyTheme(localStorage.getItem('theme') || 'abyss', false);
    applyLayout(localStorage.getItem('layout') || 'classic', false);
  } catch (e) { applyTheme('abyss', false); applyLayout('classic', false); }

  // توکن از هش (هنگام ورود از اپ یا مرورگر)
  if (location.hash.indexOf('#tk=') === 0) {
    const tk = decodeURIComponent(location.hash.slice(4));
    if (tk) { S.token = tk; try { localStorage.setItem('tk', tk); } catch (e) {} }
    history.replaceState(null, '', location.pathname + location.search);
  } else {
    try { S.token = localStorage.getItem('tk') || ''; } catch (e) {}
  }

  // وایر بخش‌ها
  wireChat();
  wireThreads();
  wireMemory();
  wireReminders();
  wireSettings();
  wireVoice();
  wireBento();
  wireWidgets();
  wireLogin();
  $('themeBtn').addEventListener('click', nextTheme);
  $('statsBtn').addEventListener('click', () => go('stats'));
  $('backBtn').addEventListener('click', goBack);
  $('dock').addEventListener('click', (e) => {
    const it = e.target.closest('.dock-item');
    if (it) go(it.dataset.tab);
  });
  $('modelChip').addEventListener('click', openModelsSheet);
  wireSheets();

  // اسپلش حداقل ۹۰۰ms برای دیدن انیمیشن ورود
  const t0 = Date.now();
  let ok = false;
  if (S.token) {
    try { await bootState(); ok = true; } catch (e) { ok = false; }
  }
  const wait = Math.max(0, 950 - (Date.now() - t0));
  setTimeout(() => {
    $('splash').classList.add('off');
    setTimeout(() => { $('splash').style.display = 'none'; }, 750);
    $('app').hidden = false;
    if (ok) {
      go('chat', { force: true });
      if (S.layout === 'bento') { go('home', { force: true }); }
    } else {
      showLogin();
    }
  }, wait);
}

document.addEventListener('DOMContentLoaded', boot);
