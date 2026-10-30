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
