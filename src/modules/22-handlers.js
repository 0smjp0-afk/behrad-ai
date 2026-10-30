/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 22-handlers
   نقطهٔ ورود Worker + dispatch + callback‌ها + پیام‌ها/دستورات
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ نقطه ورود Worker ═══════════════════ */
export default {
  async fetch(request, env, ctx) {
    try { return await handleFetch(request, env, ctx); }
    catch (e) { console.error('fetch', e && e.message); return new Response('error', { status: 500 }); }
  },
  async scheduled(controller, env, ctx) {
    try { await cronTick(env); } catch (e) { await logErr(env, 'cron', e); }
  },
};

function htmlRes(s, status) {
  return new Response(s, { status: status || 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function handleFetch(request, env, ctx) {
  const url = new URL(request.url);
  env._dashUrl = url.origin + '/dashboard';
  env._dashChat = String(env.ADMIN_ID);
  env._dashChatId = String(env.ADMIN_ID);
  if (env._lang == null) env._lang = 'fa';

  /* اپ اندروید (v4.7): پوسته /app و لایه API /api/v1 — پیش از مسیرهای داشبورد */
  if (url.pathname === '/app' || url.pathname.startsWith('/app/')) return appAsset(env, url);
  if (url.pathname.startsWith('/api/v1/')) return appApiHandler(env, request);

  /* وب‌داشبورد */
  if (url.pathname === '/dashboard') {
    const pw = env.DASHBOARD_PASSWORD || '';
    const meth = (request.method || 'GET').toUpperCase();

    /* POST ← ورود. رمز دیگر هرگز در URL نمی‌آید؛ کوکی HttpOnly ساخته میشود. */
    if (meth === 'POST') {
      if (!pw) return htmlRes(dashLoginPage(L(env, 'm1b0wm64')), 503);
      const rl = await dashRateLimited(env, request);
      if (!rl.ok) return htmlRes(dashLoginPage(L(env, 'm07h1ysm', Math.ceil((rl.W - (rl.now - rl.ts)) / 60000))), 429);
      let form = '';
      try { form = await request.text(); } catch {}
      let got = '';
      try { // ورودی خراب (مثلاً %ZZ) نباید ۵۰۰ خام بدهد؛ فقط «رمز نادرست»
        got = decodeURIComponent((String(form).match(/(?:^|&)pw=([^&]*)/) || [, ''])[1].replace(/\+/g, ' '));
      } catch {}
      if (!safeEq(got, pw)) {
        await kvPut(env, rl.lk, { n: rl.n + 1, ts: rl.n ? rl.ts : rl.now }, CFG.LOGIN_WINDOW_S);
        return htmlRes(dashLoginPage(L(env, 'm0o7tsjn')), 401);
      }
      await kvDel(env, rl.lk);
      const b = new Uint8Array(24);
      crypto.getRandomValues(b);
      let tk = '';
      for (let i = 0; i < b.length; i++) tk += b[i].toString(16).padStart(2, '0');
      await kvPut(env, 'dsk:' + tk, { uid: String(env.ADMIN_ID), at: Date.now() }, 30 * 86400);
      return new Response('', {
        status: 302,
        headers: {
          'Location': '/dashboard',
          'Set-Cookie': 'dsh=' + tk + '; Path=/; HttpOnly; SameSite=Strict; Max-Age=' + (30 * 86400) + (url.protocol === 'https:' ? '; Secure' : ''),
        },
      });
    }

    if (!(await dashAuthed(env, request))) return htmlRes(dashLoginPage(env));
    try { // وضعیت وب‌هوک برای نمایش در داشبورد
      const r = await fetchT(TG_BASE + '/bot' + env.TELEGRAM_BOT_TOKEN + '/getWebhookInfo', { method: 'POST' }, 8000);
      if (r.ok) {
        const js = await r.json();
        env._whInfo = js && js.result && js.result.url ? L(env, 'm1a4onem') : L(env, 'm03rkab0');
      } else env._whInfo = L(env, 'm0782kha');
    } catch { env._whInfo = L(env, 'm0782kha'); }
    return htmlRes(dashAppPage(env));
  }
  if (url.pathname.startsWith('/api/')) return dashApiHandler(env, request);

  if (url.pathname === '/') {
    return htmlRes(L(env, 'm0d4q0q5'));
  }

  /* وب‌هوک تلگرام — امنیت با Secret، پاسخ سریع، کار سنگین در پس‌زمینه */
  if (url.pathname === '/webhook') {
    if (env.WEBHOOK_SECRET && !safeEq(request.headers.get('X-Telegram-Bot-Api-Secret-Token'), env.WEBHOOK_SECRET)) {
      return new Response('forbidden', { status: 403 });
    }
    let upd = null;
    try { upd = await request.json(); } catch {}
    if (ctx) ctx.waitUntil(processUpdate(env, upd).catch((e) => logErr(env, 'update_top', e)));
    else await processUpdate(env, upd).catch((e) => logErr(env, 'update_top', e));
    return jsonRes({ ok: true });
  }

  return new Response('not found', { status: 404 });
}

/* ═══════════════════ پردازش آپدیت‌ها ═══════════════════ */
async function processUpdate(env, upd) {
  if (!upd) return;
  /* زبانِ پیش‌فرضِ امن برای پیام‌های پیش از شناخته‌شدنِ کاربر (ناشناس/دسترسی‌ندارد) */
  if (env._lang == null) env._lang = 'fa';
  try {
    if (upd.callback_query) return await onCallback(env, upd);
    if (upd.message) return await onMessage(env, upd.message);
    if (upd.inline_query) return await onInlineQuery(env, upd);
    if (upd.chosen_inline_result) return await onChosenInline(env, upd.chosen_inline_result);
  } catch (e) { await logErr(env, 'update', e); }
}

/* ═══════════════════ دکمه‌ها (callback_query) ═══════════════════ */
async function onCallback(env, upd) {
  const cb = upd.callback_query;
  const chatId = cb.message ? cb.message.chat.id : cb.from.id;
  const uid = String(cb.from.id);
  const budget = newBudget(CFG.TG_BUDGET_MSG);

  if (!(await isAllowed(env, uid))) {
    /* این پیام فقط به کاربرِ ناشناس می‌رسد → زبانِ پیش‌فرضِ ثابت */
    env._lang = (await _langOf(env, uid)) || 'fa';
    await answerCb(env, budget, cb.id, L(env, 'm1k15sil'));
    return;
  }

  const data = String(cb.data || '');
  const msgId = cb.message ? cb.message.message_id : null;
  env._menuMsg = msgId;
  await answerCb(env, budget, cb.id);

  const u = await getUser(env, uid);
  const st = u.st;

  /* ── ساده‌ها ── */
  if (data === 'close') {
    if (msgId) { try { await tg(env, budget, 'deleteMessage', { chat_id: chatId, message_id: msgId }); } catch {} }
    return;
  }
  if (data === 'noop') return;
  if (data === 'home') { if (u.wait) { u.wait = null; await putUser(env, uid, u); } return await mainMenu(env, budget, chatId, uid); }
  if (data === 'navback') {
    if (u.wait) { u.wait = null; await putUser(env, uid, u); }
    const st = _nav.get(chatId) || [];
    st.pop(); // صفحهٔ جاری را بگذار کنار
    const prev = st[st.length - 1];
    if (!prev) { _nav.set(chatId, st); return await mainMenu(env, budget, chatId, uid); }
    /* صفحهٔ قبلی یک پیام چت است → همان متن و همان کلید را بازگردان */
    if (prev.s === 'chat' && prev.txt != null) {
      try { await editMsg(env, budget, chatId, msgId, prev.txt, prev.kb); }
      catch { const m = await sendMsg(env, budget, chatId, prev.txt, prev.kb); env._menuMsg = m.message_id; }
      return;
    }
    st.pop(); // منو را از پشته بردار تا menuRender دوباره بگذاردش
    _nav.set(chatId, st);
    return await navRestore(env, budget, chatId, uid, prev.s);
  }
  if (data === 'help') return sendMsg(env, budget, chatId, pick(env, HELP_TEXT, HELP_TEXT_EN));

  /* ── سرویس‌های کاستوم 🔌 (فقط مدیر) ── */
  if (data === 'pv' || data.startsWith('pv')) {
    if (!(await isAdmin(env, uid))) return sendMsg(env, budget, chatId, L(env, 'm152h8p6'));
    if (data === 'pv') return await providersMenu(env, budget, chatId);
    if (data === 'pvnew') {
      const many = await provAll(env);
      if (many.length >= CFG.MAX_PROVIDERS) return sendMsg(env, budget, chatId, L(env, 'm0tis57h', CFG.MAX_PROVIDERS));
      return await pvAsk(env, budget, chatId, uid, u, 'pv_name', {});
    }
    const pvArg = data.slice(2); // '<head>:<rest>' (حذف 'pv')
    const head = pvArg.split(':')[0];
    const rest = pvArg.slice(head.length + 1);
    if (head === 'o' && PID_RE.test(rest)) return await providerPage(env, budget, chatId, rest);
    if (head === 'kk' && PID_RE.test(rest)) return await providerKeysPage(env, budget, chatId, rest);
    if (head === 'kadd' && PID_RE.test(rest)) {
      const rec = await provGet(env, rest);
      if (!rec) return providersMenu(env, budget, chatId);
      if (provKeysOf(rec).length >= CFG.KEYS_PER_PROVIDER) { await answerCb(env, budget, cb.id, L(env, 'm0swb6sa', CFG.KEYS_PER_PROVIDER)); await sendMsg(env, budget, chatId, L(env, 'm1t4fx2o', CFG.KEYS_PER_PROVIDER)); return await providerKeysPage(env, budget, chatId, rest); }
      return await pvAsk(env, budget, chatId, uid, u, 'pv_addkey', { pid: rest });
    }
    if (head === 'kdel' && PID_RE.test(rest)) {
      const idx = parseInt(data.split(':')[2], 10);
      const rec = await provGet(env, rest);
      if (!rec) return providersMenu(env, budget, chatId);
      const keys = provKeysOf(rec);
      if (!(idx >= 0 && idx < keys.length)) return await providerKeysPage(env, budget, chatId, rest);
      /* درست‌کردن هر دو فیلد keys و key — تا هیچ مسیر خواندنی قدیمی نشکند */
      const removed = keys[idx];
      keys.splice(idx, 1);
      rec.keys = keys.slice(0, CFG.KEYS_PER_PROVIDER);
      rec.key = rec.keys[0] || '';
      await provPut(env, rec);
      await answerCb(env, budget, cb.id, removed ? L(env, 'm1rkc7e1', EMOJI.ok, idx + 1) : L(env, 'm0vpitua'));
      return await providerKeysPage(env, budget, chatId, rest);
    }
    if (head === 'hp' && PID_RE.test(rest)) {
      /* تست سلامت یک سرویس مشخص (از دکمهٔ صفحهٔ کلیدها) */
      const rec = await provGet(env, rest);
      if (!rec) return providersMenu(env, budget, chatId);
      await answerCb(env, budget, cb.id, L(env, 'm0b7on10'));
      const tp = startTyping(env, chatId);
      try {
        const r = await provProbe(env, rec);
        const txtP = L(env, 'm08ta3de', esc(rec.name), provProbeLine(env, rec.name, r, provKeysOf(rec).length), esc(rec.base || '—'), pKeysTxt(env, provKeysOf(rec)));
        const kbP = [[{ text: L(env, 'm0ppor7n'), callback_data: 'pvhp:' + rest }, { text: L(env, 'm138mkur'), callback_data: 'pvkk:' + rest }],
          [{ text: L(env, 'm1yfp2py'), callback_data: 'pv' }, { text: '✖️', callback_data: 'close' }]];
        await menuRender(env, budget, chatId, txtP, kbP, 'pvhp:' + rest);
      } catch (e) { await logErr(env, 'pvhp', e); await sendMsg(env, budget, chatId, L(env, 'm16ywyfe', EMOJI.err)); }
      finally { tp.stop = true; }
      return;
    }
    if (head === 'rk' && PID_RE.test(rest)) return await providerKeysPage(env, budget, chatId, rest);
    if ((head === 'rn' || head === 'ru') && PID_RE.test(rest)) {
      const wt = head === 'rn' ? 'pv_rename' : 'pv_reurl';
      return await pvAsk(env, budget, chatId, uid, u, wt, { pid: rest });
    }
    if (head === 'addm' && PID_RE.test(rest)) return await pvAsk(env, budget, chatId, uid, u, 'pv_manual', { pid: rest });
    if (head === 'scan' && PID_RE.test(rest)) {
      const rec = await provGet(env, rest);
      if (!rec) return providersMenu(env, budget, chatId);
      await answerCb(env, budget, cb.id, L(env, 'm00ddzyp'));
      const res = await discoverModels(env, rec.base, rec.key);
      if (!res.ok) return sendMsg(env, budget, chatId, L(env, 'm1ejcoip', EMOJI.err, pick(env, DISCO_FAIL_TEXT, DISCO_FAIL_TEXT_EN)[res.code] || res.code));
      if (res.base !== rec.base) { rec.base = res.base; await provPut(env, rec); }
      await kvPut(env, 'pvr:' + rec.pid, { items: res.items, t: Date.now() }, CFG.DISCO_TTL);
      return await renderPick(env, budget, chatId, rec.pid, 0, msgId);
    }
    if (head === 'madd') { // افزودن یک مدل کاوش‌شده (h = hash32('pid:id'))
      const key = await kvGet(env, 'mh:' + rest, null);
      const p = parseModelKey(key);
      if (p.prov !== 'p') { await answerCb(env, budget, cb.id, L(env, 'm0bu4xi0')); return sendMsg(env, budget, chatId, L(env, 'm1e149se')); }
      const rec = await provGet(env, p.pid);
      if (!rec) return providersMenu(env, budget, chatId);
      if ((rec.models || []).some((m) => m.id === p.id)) { await answerCb(env, budget, cb.id, L(env, 'm05db4i8')); return; }
      if ((rec.models || []).length >= CFG.MAX_MODELS_PER_PROVIDER) { await answerCb(env, budget, cb.id, L(env, 'm0zurdar')); return sendMsg(env, budget, chatId, L(env, 'm1qjb97j', CFG.MAX_MODELS_PER_PROVIDER)); }
      const rr = await kvGet(env, 'pvr:' + p.pid, null);
      const found = rr && (rr.items || []).find((x) => x.id === p.id);
      const n = await mergeModels(env, rec, [{ id: p.id, ctx: found && found.ctx, src: 'disc' }]);
      await answerCb(env, budget, cb.id, n ? L(env, 'm07pehx1', EMOJI.ok, rec.models.length, CFG.MAX_MODELS_PER_PROVIDER)  : L(env, 'm0782kha'));
      const page = rr ? Math.floor(Math.max(0, (rr.items || []).findIndex((x) => x.id === p.id)) / CFG.PICK_PAGE) : 0;
      return await renderPick(env, budget, chatId, p.pid, page, msgId);
    }
    if (head === 'pg') { // pvpg:<pid>:<n>
      const pid = pvArg.split(':')[1];
      const n = +(pvArg.split(':')[2]) || 0;
      if (PID_RE.test(pid)) return await renderPick(env, budget, chatId, pid, n, msgId);
      return;
    }
    if (head === 'man' && PID_RE.test(rest)) return await pvAsk(env, budget, chatId, uid, u, 'pv_manual', { pid: rest });
    if (head === 'mend' && PID_RE.test(rest)) { await kvDel(env, 'pvr:' + rest); return await providerPage(env, budget, chatId, rest); }
    if (head === 'mx') { // حذف یک مدل از سرویس
      const key = await kvGet(env, 'mh:' + rest, null);
      const p = parseModelKey(key);
      if (p.prov !== 'p') return answerCb(env, budget, cb.id, L(env, 'm0z98t31'));
      const rec = await provGet(env, p.pid);
      if (!rec) return providersMenu(env, budget, chatId);
      await removeModel(env, rec, p.id);
      await answerCb(env, budget, cb.id, L(env, 'm0b4rjyg', EMOJI.ok));
      return await providerPage(env, budget, chatId, p.pid);
    }
    if (head === 'xc') { // تنظیم کانتکست یک مدل
      const key = await kvGet(env, 'mh:' + rest, null);
      const p = parseModelKey(key);
      if (p.prov !== 'p') return answerCb(env, budget, cb.id, L(env, 'm1fa3cu9'));
      return await pvAsk(env, budget, chatId, uid, u, 'pv_ctx', { key: p.pid + ':' + p.id });
    }
    if (head === 'vis') { // 👁 روشن/خاموش‌کردن عکس‌فهم یک مدل کاستوم
      const key = await kvGet(env, 'mh:' + rest, null);
      const p = parseModelKey(key);
      if (p.prov !== 'p') return answerCb(env, budget, cb.id, L(env, 'm0z98t31'));
      const rec = await provGet(env, p.pid);
      if (!rec) return providersMenu(env, budget, chatId);
      const me = (rec.models || []).find((x) => x.id === p.id);
      if (!me) { await answerCb(env, budget, cb.id, L(env, 'm0ybfzvs')); return sendMsg(env, budget, chatId, L(env, 'm040gipl')); }
      me.vision = !me.vision;
      await provPut(env, rec);
      await answerCb(env, budget, cb.id, me.vision ? L(env, 'm16x2fb5', EMOJI.ok) : L(env, 'm0oi7qii'));
      return await providerPage(env, budget, chatId, p.pid);
    }
    if (head === 'rm' && PID_RE.test(rest)) {
      const rec = await provGet(env, rest);
      if (!rec) return providersMenu(env, budget, chatId);
      const txt = L(env, 'm1t6cbxs', esc(rec.name), (rec.models || []).length);
      const kb = [[{ text: L(env, 'm1kb3y6a'), callback_data: 'pvrm2:' + rest }, { text: L(env, 'm1ihcuh8'), callback_data: 'pvo:' + rest }]];
      try { await editMsg(env, budget, chatId, msgId, txt, kb); } catch { await sendMsg(env, budget, chatId, txt, kb); }
      return;
    }
    if (head === 'rm2' && PID_RE.test(rest)) {
      const n = await deleteProvider(env, rest);
      await sendMsg(env, budget, chatId, L(env, 'm1glo0hc', EMOJI.ok, n ? ' — ' + n + L(env, 'm1smnzzx') : ''));
      return await providersMenu(env, budget, chatId);
    }
    return answerCb(env, budget, cb.id, L(env, 'm0782kha'));
  }

  /* ── مدل‌ها ── */
  if (data.startsWith('mm:')) { return await showModels(env, budget, chatId, +(data.split(':')[1]) || 0); }
  if (data.startsWith('mp:')) { return await showModels(env, budget, chatId, +(data.split(':')[1]) || 0); }
  if (data === 'mref') { await answerCb(env, budget, cb.id, L(env, 'm0bpj753')); return await showModels(env, budget, chatId, 0, true); }
  if (data.startsWith('ms:')) {
    const e = await resolveModelByHash(env, data.slice(3));
    if (!e) { await answerCb(env, budget, cb.id, L(env, 'm1w21uqe')); return sendMsg(env, budget, chatId, L(env, 'm040gipl')); }
    st.model = e.key;
    await putUser(env, uid, u);
    await sendMsg(env, budget, chatId,
      L(env, 'm1mtnwic', EMOJI.ok, esc(e.name), e.prov === 'cf' ? L(env, 'm1xi1wad') : '🔌 ' + esc(e.provName), num(Math.round(e.ctx / 1000))));
    return await mainMenu(env, budget, chatId, uid);
  }

  /* ── تنظیمات ── */
  if (data === 'set') return await settingsMenu(env, budget, chatId, uid);
  if (data.startsWith('st:')) {
    const k = data.slice(3);
    if (k.startsWith('lang:')) {
      st.lang = k.endsWith(':en') ? 'en' : 'fa';
      env._lang = st.lang;
      await putUser(env, uid, u);
      return await settingsMenu(env, budget, chatId, uid);
    }
    if (k === 't+') st.temperature = Math.min(2, +(st.temperature + 0.1).toFixed(1));
    if (k === 't-') st.temperature = Math.max(0, +(st.temperature - 0.1).toFixed(1));
    if (k === 'm+') st.maxTokens = Math.min(8192, st.maxTokens + 512);
    if (k === 'm-') st.maxTokens = Math.max(256, st.maxTokens - 512);
    if (k === 'fb') st.autoFallback = !st.autoFallback;
    if (k === 'ls') st.liveStream = !st.liveStream;
    if (k === 'rl') st.readLinks = !st.readLinks;
    if (k === 'av') st.autoVision = !st.autoVision;
    if (k === 'vr') st.voiceReply = !st.voiceReply;
    if (k === 'br') st.briefing = !st.briefing;
    if (k === 'sa') st.searchAuto = !st.searchAuto;
    if (k === 'ig') st.imgGen = st.imgGen === false;
    if (k === 'if') st.imgFree = st.imgFree === false;
    if (k === 'ie') st.imgEdit = st.imgEdit === false;
    if (k === 'nl') st.nlRemind = st.nlRemind === false;
    if (k === 'ma') st.memAuto = st.memAuto === false;
    if (k === 'wb') st.weeklyBackup = st.weeklyBackup === false;
    if (k === 'cb') st.cbBreaker = st.cbBreaker === false;
    if (k === 'yt') st.ytSum = st.ytSum === false;
    if (k === 'igm') {
      // چرخ بین مدل‌های تولید تصویر
      const ix = GEM_IMG_MODELS.findIndex((m) => m.id === st.imgModel);
      st.imgModel = GEM_IMG_MODELS[(ix + 1 + GEM_IMG_MODELS.length) % GEM_IMG_MODELS.length].id;
    }
    if (k === 'dl') { u.wait = { type: 'dl', ts: Date.now() }; await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm18za59v')); }
    if (k === 'sys') { u.wait = { type: 'sys', ts: Date.now() }; await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm178g1ea')); }
    await putUser(env, uid, u);
    return await settingsMenu(env, budget, chatId, uid);
  }

  /* ── حافظه بلندمدت v4.5 ── */
  if (data === 'mem') { await memMenu(env, budget, chatId, uid); return; }
  if (data === 'memadd') { u.wait = { type: 'memadd', ts: Date.now() }; await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm08po0h6')); }
  if (data === 'memedit') { u.wait = { type: 'memedit', ts: Date.now() }; await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm02pgq4y')); }
  if (data === 'memdelall') { await memPut(env, uid, []); await answerCb(env, budget, cb.id, L(env, 'm1ubu2n2')); return await memMenu(env, budget, chatId, uid); }
  if (data.startsWith('memdel:')) {
    await memDel(env, uid, data.slice(7));
    await answerCb(env, budget, cb.id, L(env, 'm0i9xl7k'));
    u.wait = null;
    const arr = await memGet(env, uid);
    let txt = L(env, 'm0t2bz6p', arr.length, arr.length ? arr.map((x, i) => (i + 1) + '. ' + esc(x.t)).join('\n') : L(env, 'm1ihkad4'));
    const kb = arr.slice(-10).map((x) => [{ text: '🗑 ' + x.t.slice(0, 26), callback_data: 'memdel:' + x.id }]);
    kb.push([{ text: L(env, 'm1t3qh5r'), callback_data: 'set' }]);
    await menuRender(env, budget, chatId, txt, kb, 'mem');
    return;
  }

  /* ── صدا v4.6 ── */
  if (data === 'voice') return await voiceMenu(env, budget, chatId, uid, 0);
  if (data.startsWith('vvc:')) return await voiceMenu(env, budget, chatId, uid, +(data.split(':')[1]) || 0);
  if (data.startsWith('vprov:')) {
    const v = data.split(':')[1];
    if (v === 'google' || v === 'cf') { st.voiceProv = v; await putUser(env, uid, u); }
    if (v === 'google' && !gemKey(env)) await answerCb(env, budget, cb.id, L(env, 'm0k2awem'));
    return await voiceMenu(env, budget, chatId, uid, 0);
  }
  if (data.startsWith('vmdl:')) {
    const i = +data.split(':')[1];
    if (GEM_TTS_MODELS[i]) { st.ttsModel = GEM_TTS_MODELS[i].id; await putUser(env, uid, u); }
    return await voiceMenu(env, budget, chatId, uid, 0);
  }
  if (data === 'vstt') {
    // چرخ بین همه‌ی مدل‌های فهم ویس (فقط بین دو تا نمی‌چرخد)
    const ix = GEM_STT_MODELS.findIndex((m) => m.id === st.sttModel);
    st.sttModel = GEM_STT_MODELS[(ix + 1 + GEM_STT_MODELS.length) % GEM_STT_MODELS.length].id;
    await putUser(env, uid, u);
    return await voiceMenu(env, budget, chatId, uid, 0);
  }
  if (data.startsWith('vset:')) {
    const v = data.slice(5);
    if (GEM_VOICES.includes(v)) { st.voiceName = v; await putUser(env, uid, u); await answerCb(env, budget, cb.id, L(env, 'm0xbu9ms', v)); }
    const per = CFG.VOICE_PAGE;
    const pg = Math.floor(Math.max(0, GEM_VOICES.indexOf(st.voiceName)) / per);
    return await voiceMenu(env, budget, chatId, uid, pg);
  }
  if (data === 'vtest') {
    await answerCb(env, budget, cb.id, L(env, 'm0pjrxci'));
    const ok = await sendVoiceReply(env, budget, chatId, L(env, 'm1tqybd0', st.voiceName || 'Kore'), { ...st, voiceReply: true, voiceProv: 'google' });
    if (!ok) await sendMsg(env, budget, chatId, L(env, 'm0zk2lt7'));
    return;
  }

  /* ── شخصیت‌ها ── */
  if (data === 'ps') return await personaMenu(env, budget, chatId, uid);
  if (data.startsWith('pc:')) {
    const i = +data.split(':')[1];
    if (PERSONAS[i]) { st.persona = i; st.sysCustom = ''; await putUser(env, uid, u); }
    return await personaMenu(env, budget, chatId, uid);
  }

  /* ── گفتگوهای چندگانه ── */
  if (data === 'th') return await threadsMenu(env, budget, chatId, uid);
  if (data.startsWith('tsel:')) { u.thread = data.slice(5); await putUser(env, uid, u); return await threadsMenu(env, budget, chatId, uid); }
  if (data === 'tnew') {
    const n = L(env, 'm1erlebc', u.threads.length + 1);
    u.threads.push({ id: 't' + Date.now().toString(36), name: n, ts: Date.now() });
    /* auto ست نمیشود — بعد از اولین پیام autoTitle نامش را عوض میکند */
    if (u.threads.length > CFG.THREAD_MAX) u.threads.shift();
    u.thread = u.threads[u.threads.length - 1].id;
    await putUser(env, uid, u);
    return await threadsMenu(env, budget, chatId, uid);
  }
  if (data.startsWith('tdel:')) {
    const tid = data.slice(5);
    if (tid !== 'main') {
      u.threads = u.threads.filter((x) => x.id !== tid);
      if (u.thread === tid) u.thread = 'main';
      await kvDel(env, 'h:c' + chatId + ':' + tid);
      await putUser(env, uid, u);
    }
    return await threadsMenu(env, budget, chatId, uid);
  }
  if (data === 'threset') {
    const sc = scopeOf(chatId, u, ['group', 'supergroup'].includes((cb.message || {}).chat ? cb.message.chat.type : 'private'));
    await kvPut(env, 'h:' + sc, { msgs: [], used: 0 });
    return sendMsg(env, budget, chatId, L(env, 'm0g83ila', EMOJI.ok));
  }

  /* ── پرامپت‌ها ── */
  if (data === 'pl') return await promptsMenu(env, budget, chatId, uid);
  if (data === 'panew') { u.wait = { type: 'panew', ts: Date.now() }; await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm0g6qwas')); }
  if (data === 'pdelall') { u.pl = []; await putUser(env, uid, u); return await promptsMenu(env, budget, chatId, uid); }
  if (data.startsWith('pu:')) {
    const kk = data.slice(3);
    const p = (u.pl || []).find((x) => x.k === kk);
    if (!p) return;
    const scope = scopeOf(chatId, u, false);
    return await runChatReply(env, budget, chatId, uid, scope, st, p.v, {});
  }

  /* ── مقایسه ⚔️ ── */
  if (data === 'cmp') return await compareMenu(env, budget, chatId, uid);
  if (data === 'cmpon') { const cp = await kvGet(env, 'cp:' + uid, null); if (cp) cp.on = true; await kvPut(env, 'cp:' + uid, cp); return await compareMenu(env, budget, chatId, uid); }
  if (data === 'cmpoff') { await kvDel(env, 'cp:' + uid); return await compareMenu(env, budget, chatId, uid); }
  if (data.startsWith('cmplist:')) { const [, slot, page] = data.split(':'); return await cmpPickModel(env, budget, chatId, slot, +page || 0); }
  if (data.startsWith('cmpset:')) {
    const [, slot, hsh] = data.split(':');
    const e = await resolveModelByHash(env, hsh);
    if (!e) { await answerCb(env, budget, cb.id, L(env, 'm1w21uqe')); return sendMsg(env, budget, chatId, L(env, 'm040gipl')); }
    const cp = await kvGet(env, 'cp:' + uid, { on: false, pair: [CF_KNOWN[0].id, CF_KNOWN[1].id] });
    const pair = [...cp.pair];
    pair[slot === 'A' ? 0 : 1] = e.key;
    cp.pair = pair;
    await kvPut(env, 'cp:' + uid, cp);
    return await compareMenu(env, budget, chatId, uid);
  }

  /* ── آمار و سلامت ── */
  if (data === 'stats') return await statsView(env, budget, chatId, uid);
  if (data === 'ping') return await healthCheck(env, budget, chatId);
  if (data === 'hpall') {
    /* تست سلامت همه سرویس‌های کاستوم — چه از منوی سلامت بیاید چه از صفحهٔ کلیدها */
    const typingH = startTyping(env, chatId);
    try { await typingOn(env, budget, chatId); return await provHealthAll(env, budget, chatId); }
    catch (e) { await logErr(env, 'hpall', e); return sendMsg(env, budget, chatId, L(env, 'm1f0vb9x', EMOJI.err)); }
    finally { typingH.stop = true; }
  }

  /* ── آرشیو 📌 ── */
  if (data === 'arch') return await archiveMenu(env, budget, chatId, uid);
  if (data === 'save') {
    const scope = scopeOf(chatId, u, false);
    const h = await histGet(env, scope);
    let ai = -1, qi = -1;
    for (let i = h.msgs.length - 1; i >= 0; i--) {
      if (ai < 0 && h.msgs[i].role === 'assistant') ai = i;
      else if (h.msgs[i].role === 'user') { qi = i; break; }
    }
    if (ai >= 0) {
      const lastQ = qi >= 0 ? String(h.msgs[qi].content).slice(0, 80) : L(env, 'm1k4f7x2');
      const k = 'sv:' + uid + ':' + hash32(h.msgs[ai].content + Date.now());
      await kvPut(env, k, { q: lastQ, a: h.msgs[ai].content, t: Date.now() });
      await answerCb(env, budget, cb.id, L(env, 'm0i4af02', EMOJI.ok));
    }
    return;
  }
  if (data.startsWith('svview:')) {
    const rest = data.slice(7);
    /* 🔒 v5.4: کلید آرشیو از callback_data می‌آید و کاربر می‌تواند دستکاری‌اش
       کند؛ پس قبل از نمایش، مالکیت چک می‌شود (وگرنه کاربر مجاز می‌توانست
       آرشیو کاربر دیگر را بخواند یا حذف کند). */
    if (!rest.startsWith(uid + ':')) return sendMsg(env, budget, chatId, L(env, 'm17fazrc'));
    const keyParts = rest.split(':');
    const v = await kvGet(env, 'sv:' + keyParts.join(':'), null);
    if (!v) return;
    const txt = '📌 <b>' + esc(v.q) + '</b>\n\n' + mdToHtml(v.a);
    const kb = [[{ text: L(env, 'm0azigkn'), callback_data: 'svdel:' + rest }], [{ text: L(env, 'm1v7msmb'), callback_data: 'arch' }, { text: '✖️', callback_data: 'close' }]];
    const parts = chunkText(txt);
    try { await editMsg(env, budget, chatId, msgId, parts[0], kb); } catch { await sendMsg(env, budget, chatId, parts[0], kb); }
    for (let i = 1; i < parts.length; i++) await sendMsg(env, budget, chatId, parts[i]);
    return;
  }
  if (data.startsWith('svdel:')) {
    const rest = data.slice(6);
    if (!rest.startsWith(uid + ':')) return sendMsg(env, budget, chatId, L(env, 'm17fazrc')); // 🔒 v5.4
    await kvDel(env, 'sv:' + rest);
    return await archiveMenu(env, budget, chatId, uid);
  }
  if (data === 'svdelall') {
    for (const k of await kvList(env, 'sv:' + uid + ':')) await kvDel(env, k);
    return await archiveMenu(env, budget, chatId, uid);
  }

  /* ── تولید مجدد ♻️ ── */
  if (data === 'regen') {
    const scope = scopeOf(chatId, u, false);
    const h = await histGet(env, scope);
    let qi = -1;
    for (let i = h.msgs.length - 1; i >= 0; i--) if (h.msgs[i].role === 'user') { qi = i; break; }
    if (qi < 0) { await answerCb(env, budget, cb.id, L(env, 'm0p3af3m')); return sendMsg(env, budget, chatId, L(env, 'm0uz8dc4')); }
    const q = h.msgs[qi].content;
    h.msgs = h.msgs.slice(0, qi);
    await histPut(env, scope, h);
    return await runChatReply(env, budget, chatId, uid, scope, st, q, {});
  }

  /* ── خروجی و بکاپ ── */
  if (data === 'ex') return await exportChat(env, budget, chatId, uid);
  if (data === 'bkup') return await backupMenu(env, budget, chatId, uid);
  /* پشتیبان‌گیری انتخابی TXT — فقط مدیر (کلیدهای API ممکن است داخل فایل باشند) */
  if (data === 'bkchats' || data === 'bkset' || data === 'bkprov' || data === 'bkmem' || data === 'bkall' || data === 'bkup2') {
    if (!(await isAdmin(env, uid))) return sendMsg(env, budget, chatId, L(env, 'm0ddwlzr'));
    if (data === 'bkup2') return await backupMenu(env, budget, chatId, uid);
    await answerCb(env, budget, cb.id, L(env, 'm1kw0d0m'));
    try {
      if (data === 'bkchats') await backupChatsTxt(env, budget, chatId, uid);
      else if (data === 'bkset') await backupSettingsTxt(env, budget, chatId, uid);
      else if (data === 'bkprov') await backupProvidersTxt(env, budget, chatId);
      else if (data === 'bkmem') await backupMemTxt(env, budget, chatId, uid);
      else if (data === 'bkall') await backupAllTxt(env, budget, chatId, uid);
    } catch (e) { await logErr(env, 'bk_txt_send', e); return sendMsg(env, budget, chatId, L(env, 'm0ykatwm', EMOJI.err)); }
    return;
  }
  if (data === 'bkget') return await backupGet(env, budget, chatId, uid);
  if (data === 'bkres') {
    /* بازیابی فقط مدیر: کل رکورد کاربر را با محتوای فایل جایگزین می‌کند */
    if (!(await isAdmin(env, uid))) return sendMsg(env, budget, chatId, L(env, 'm01pi7i4'));
    u.wait = { type: 'bk', ts: Date.now() };
    await putUser(env, uid, u);
    return sendMsg(env, budget, chatId,
      L(env, 'm15usjk8'));
  }

  /* ── یادآورها ⏰ ── */
  if (data === 'rmlist') return await remindersMenu(env, budget, chatId, uid);
  if (data === 'rmnew') { u.wait = { type: 'rm', ts: Date.now() }; await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm11aanc0')); }
  if (data.startsWith('rmdel:')) {
    const hh = data.slice(6);
    /* 🔒 v5.4: قبلاً هش بدون بررسی مالکیت جستجو می‌شد و هر کاربر مجازی
       می‌توانست یادآور دیگران را پاک کند. حالا رکورد باید مال همین کاربر باشد. */
    for (const k of await kvList(env, 'rm:')) {
      if (hash32(k) !== hh) continue;
      const rv = await kvGet(env, k, null);
      if (rv && String(rv.uid) === String(uid)) await kvDel(env, k);
      break;
    }
    return await remindersMenu(env, budget, chatId, uid);
  }

  /* ── کاربران مجاز 👥 ── */
  /* 🔒 v5.4: مدیریت کاربران مجاز فقط دست مدیر است — قبلاً هر کاربر مجازی
     می‌توانست کاربر اضافه/حذف کند یا کل لیست را پاک کند. */
  if (data === 'usr') { if (!(await isAdmin(env, uid))) return sendMsg(env, budget, chatId, L(env, 'm152h8p6')); return await usersMenu(env, budget, chatId); }
  /* v5.4: میان‌برهای منوی اصلی برای قابلیت‌های تازه */
  if (data === 'todo') {
    u.wait = { type: 'todo', ts: Date.now() };
    await putUser(env, uid, u);
    const arr = await todoGet(env, uid);
    const txt2 = L(env, 'm19i3m0r', arr.length ? arr.map((x, i) => (x.done ? '✅ ' : '⬜ ') + num(i + 1) + '. ' + esc(x.t)).join('\n') : L(env, 'm1ihkad4'));
    await menuRender(env, budget, chatId, txt2, [[{ text: L(env, 'm1v7msmb'), callback_data: 'home' }]], 'todo');
    return;
  }
  if (data === 'task') {
    const list = await taskList(env, uid);
    const txt3 = L(env, 'm14n5t4v', list.length ? list.map((t, i) => {
        const d = new Date((t.at || 0) + 210 * 60000);
        return num(i + 1) + '. ' + repeatLabel(env, t.repeat) + ' ' + d.getUTCHours() + ':' + String(d.getUTCMinutes()).padStart(2, '0') + ' — ' + esc(String(t.prompt).slice(0, 70));
      }).join('\n') : L(env, 'm0y45ydf'));
    const kb2 = list.slice(0, 8).map((t, i) => [{ text: '🗑 ' + String(t.prompt).slice(0, 24), callback_data: 'taskdel:' + t.id }]);
    kb2.push([{ text: L(env, 'm1v7msmb'), callback_data: 'home' }]);
    await menuRender(env, budget, chatId, txt3, kb2, 'task');
    return;
  }
  if (data.startsWith('taskdel:')) {
    await taskDel(env, uid, data.slice(8));
    await answerCb(env, budget, cb.id, L(env, 'm0i9xl7k'));
    const list = await taskList(env, uid);
    const txt3 = L(env, 'm0jj1nn9', list.length ? list.map((t, i) => num(i + 1) + '. ' + repeatLabel(env, t.repeat) + ' — ' + esc(String(t.prompt).slice(0, 70))).join('\n') : L(env, 'm0y45ydf'));
    const kb2 = list.slice(0, 8).map((t, i) => [{ text: '🗑 ' + String(t.prompt).slice(0, 24), callback_data: 'taskdel:' + t.id }]);
    kb2.push([{ text: L(env, 'm1v7msmb'), callback_data: 'home' }]);
    await menuRender(env, budget, chatId, txt3, kb2, 'task');
    return;
  }
  if (data === 'gal') {
    const list = await imgGalleryList(env, uid);
    if (!list.length) {
      return sendMsg(env, budget, chatId, L(env, 'm1krerrn'));
    }
    const kb3 = list.slice(0, 8).map((x, i) => [{ text: '🖼 ' + String(x.prompt || L(env, 'm1if2w6h')).slice(0, 26), callback_data: 'galsend:' + x.id }]);
    kb3.push([{ text: L(env, 'm1v7msmb'), callback_data: 'home' }]);
    await menuRender(env, budget, chatId, L(env, 'm1bt0wd7', num(list.length)), kb3, 'gal');
    return;
  }
  if (data.startsWith('galsend:')) {
    const item = await imgGalleryGet(env, uid, data.slice(8));
    if (!item) return sendMsg(env, budget, chatId, L(env, 'm17p2kvb', EMOJI.err));
    const fd = new FormData();
    fd.append('chat_id', String(chatId));
    fd.append('photo', new Blob([appB64Bytes(item.b64)], { type: item.mime || 'image/png' }), 'gallery.png');
    fd.append('parse_mode', 'HTML');
    fd.append('caption', '🖼 ' + esc(String(item.prompt || L(env, 'm1if2w6h')).slice(0, 900)));
    try { await tg(env, budget, 'sendPhoto', null, fd); } catch (e) { await logErr(env, 'gallery_send', e); }
    return;
  }
  if (data === 'fnd') {
    u.wait = { type: 'find', ts: Date.now() };
    await putUser(env, uid, u);
    return sendMsg(env, budget, chatId, L(env, 'm1hejoom'));
  }
  /* v5.4: سهمیهٔ تصویر روزانهٔ یک کاربر — «آیدی | تعداد» (۰ = بی‌سقف) */
  if (data === 'usrimgquota') {
    if (!(await isAdmin(env, uid))) return;
    u.wait = { type: 'usrimgq', ts: Date.now() };
    await putUser(env, uid, u);
    return sendMsg(env, budget, chatId,
      L(env, 'm1hzemkv'));
  }
  if (data === 'usradd' || data.startsWith('usrdel:') || data === 'usrdelall') {
    if (!(await isAdmin(env, uid))) return sendMsg(env, budget, chatId, L(env, 'm152h8p6')); // 🔒 v5.4
  }
  if (data === 'usradd') { u.wait = { type: 'usradd', ts: Date.now() }; await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm0dh5ewl')); }
  if (data.startsWith('usrdel:')) {
    const rid = data.slice(7);
    const al = (await kvGet(env, 'al', [])).filter((x) => x !== rid);
    await kvPut(env, 'al', al);
    return await usersMenu(env, budget, chatId);
  }
  if (data === 'usrdelall') { await kvPut(env, 'al', []); return await usersMenu(env, budget, chatId); }

  await answerCb(env, budget, cb.id, L(env, 'm0782kha'));
}

/* ═══════════════════ پیام‌ها و دستورات ═══════════════════ */
const HELP_TEXT =
  '❓ <b>راهنمای ربات {{brand}}</b>\n\n' +
  '💬 <b>چت:</b> هر متنی بفرستی با مدل فعال جواب میدهم. لینک بفرستی صفحه را میخوانم و تحلیل میکنم 🌐\n\n' +
  '🤖 <b>مدل:</b> از منوی «انتخاب مدل» — مدل‌های Workers AI خود کلادفلر + سرویس‌های کاستومی که اضافه کرده‌ای\n\n' +
  '🔌 <b>سرویس کاستوم:</b> <code>/provideradd</code> — نام + آدرس پایه + کلید API هر سرویس <b>سازگار با OpenAI</b> (OpenRouter، Groq، DeepSeek، vLLM، Ollama...). استخراج خودکار مدل‌ها با fallback به واردکردن دستی؛ ویرایش/حذف از <code>/providers</code> یا دکمه «🔌 سرویس‌های AI». فالبک خودکار همیشه به lane رایگان کلادفلر میرود، نه به سرویس پولی دیگر.\n\n' +
  '🧵 <b>گفتگوهای جدا:</b> منوی «گفتگوها» ← ➕ — هر گفتگو حافظه مستقل دارد\n\n' +
  '🎭 <b>شخصیت:</b> مترجم، برنامه‌نویس، معلم، نویسنده... یا پرامپت سیستمی خودت\n\n' +
  '⚔️ <b>مقایسه:</b> یک سوال به دو مدل همزمان (میتواند کلادفلر + سرویس کاستوم باشد) — جواب‌ها کنار هم!\n\n' +
  '⏰ <b>یادآور:</b> <code>/remind 18:30 چای</code> یا <code>/remind 45m استراحت</code>\n\n' +
  '📚 <b>پرامپت‌ها:</b> متن پرتکرارت را ذخیره کن، با یک لمس اجرا کن\n\n' +
  '<b>دستورات:</b>\n' +
  '/start — پنل اصلی · /new — گفتگوی تازه · /model — انتخاب مدل\n' +
  '/settings — تنظیمات · /stats — آمار · /ping — سلامت سرویس‌ها\n' +
  '/provideradd — افزودن سرویس AI · /providers — مدیریت سرویس‌ها\n' +
  '/export — خروجی گفتگو · /pladd — ذخیره پرامپت · /cancel — لغو ورودی\n' +
  '/image — تولید تصویر 🎨 · /web — جستجوی وب · /weather — هوای نیشابور · /crypto — قیمت کریپتو\n' +
  '/tts متن — تبدیل متن به صدا 🔊 · /translate متن — ترجمهٔ فوری (یا ریپلای) 🌐\n' +
  '📄 PDF: فایل PDF بفرست تا متنش را بخوانم · روی هر پیام متنی ریپلای بزن تا زمینهٔ جواب شود\n' +
  '/remember — سپردن به حافظه · /forget — حذف از حافظه (رقم یا all) · /memory — دیدن حافظه\n' +
  '/brief — خلاصه صبح · /help — همین راهنما\n\n' +
  '📷 <b>عکس:</b> عکس بفرستی، با مدل عکس‌فهم (👁) تحلیل می‌شود — چه مدل کلادفلر چه سرویس کاستوم. اگر مدل فعال عکس نفهمد، خودکار با مدل ویژن کلادفلر جواب می‌گیری. برای مدل کاستوم، در «🔌 سرویس‌ها» با دکمه 👁 علامتش بزن.\n\n' +
  '🎨 <b>تولید تصویر:</b> <code>/image توصیف تصویر</code> (یا <code>/img</code>) — با کلید <code>GEMINI_API_KEY</code> و مدل <code>gemini-3.1-flash-lite-image</code> عکس می‌سازد و همان‌جا می‌فرستد. روشن/خاموش و مدلش از ⚙️ تنظیمات.\n\n' +
  '<b>🆕 نسخهٔ ۵.۴:</b>\n' +
  '/find عبارت — جستجو در همهٔ گفتگوها (بدون مدل و رایگان)\n' +
  '/gallery — گالری عکس‌های ساخته‌شده (۳۰ روز) · <code>/gallery 2</code> برای ارسال مجدد\n' +
  '/sum متن — خلاصهٔ هوشمند (روی ریپلای هم کار می‌کند؛ متن بلند را تکه‌تکه جمع می‌کند)\n' +
  '/todo — تودولیست: <code>/todo خرید نان</code> · <code>/todo done 1</code> · <code>/todo del 1</code>\n' +
  '/task — تسک زمان‌بندی‌شده با AI: <code>/task هر روز 08:00 اخبار AI</code>\n' +
  '/memfind عبارت — جستجو در حافظهٔ بلندمدت\n' +
  '🖌 <b>ویرایش عکس:</b> عکس را با کپشن <code>ویرایش: آسمان را غروب کن</code> بفرست (یا ریپلای + <code>/edit</code>)\n' +
  '🗣 <b>یادآور از متن آزاد:</b> بگو «فردا ساعت ۵ یادم بنداز قبض رو بدم» — خودم می‌فهمم\n' +
  '🎬 <b>لینک یوتیوب:</b> لینک بفرست، زیرنویسش را می‌خوانم و خلاصه می‌کنم\n' +
  '🆓 <b>بدون کلید هم عکس می‌سازم:</b> فالبک رایگان Pollinations (از ⚙️ تنظیمات قابل خاموش‌کردن)';

/* EN */
const HELP_TEXT_EN =
  '❓ <b>{{brand}} — Help</b>\n\n' +
  '💬 <b>Chat:</b> Send any text and I answer with the active model. Send a link and I read the page and analyze it 🌐\n\n' +
  '🤖 <b>Model:</b> from the “Choose model” menu — Cloudflare Workers AI models plus any custom services you added\n\n' +
  '🔌 <b>Custom service:</b> <code>/provideradd</code> — name + base URL + API key for any <b>OpenAI-compatible</b> service (OpenRouter, Groq, DeepSeek, vLLM, Ollama...). Models are discovered automatically with a manual fallback; edit/delete from <code>/providers</code> or the “🔌 AI services” button. Automatic fallback always goes to the free Cloudflare lane, never to another paid service.\n\n' +
  '🧵 <b>Separate chats:</b> the “Chats” menu → ➕ — each chat has its own memory\n\n' +
  '🎭 <b>Persona:</b> translator, programmer, tutor, writer... or your own system prompt\n\n' +
  '⚔️ <b>Compare:</b> one question to two models at once (Cloudflare + a custom service is fine) — answers side by side!\n\n' +
  '⏰ <b>Reminder:</b> <code>/remind 18:30 tea</code> or <code>/remind 45m break</code>\n\n' +
  '📚 <b>Prompts:</b> save text you send often and run it with one tap\n\n' +
  '<b>Commands:</b>\n' +
  '/start — main panel · /new — new chat · /model — choose model\n' +
  '/settings — settings · /stats — usage · /ping — service health\n' +
  '/provideradd — add an AI service · /providers — manage services\n' +
  '/export — export chat · /pladd — save prompt · /cancel — cancel input\n' +
  '/image — generate an image 🎨 · /web — web search · /weather — weather · /crypto — crypto prices\n' +
  '/tts text — text to speech 🔊 · /translate text — instant translation (or reply) 🌐\n' +
  '📄 PDF: send a PDF and I read its text · reply to any message to use it as context\n' +
  '/remember — save to memory · /forget — remove from memory (number or all) · /memory — view memory\n' +
  '/brief — morning briefing · /help — this help\n\n' +
  '📷 <b>Images:</b> send a photo and it is analyzed with a vision model (👁) — Cloudflare or custom. If the active model cannot see images, a Cloudflare vision model is used automatically. For a custom model, mark it with the 👁 button under “🔌 Services”.\n\n' +
  '🎨 <b>Image generation:</b> <code>/image description</code> (or <code>/img</code>) — uses <code>GEMINI_API_KEY</code> and the <code>gemini-3.1-flash-lite-image</code> model and sends the image right there. Toggle and choose the model under ⚙️ Settings.\n\n' +
  '<b>🆕 Version 5.4:</b>\n' +
  '/find term — search all your chats (no model, free)\n' +
  '/gallery — gallery of generated images (30 days) · <code>/gallery 2</code> to resend\n' +
  '/sum text — smart summary (works on a reply too; summarizes long text in chunks)\n' +
  '/todo — to-do list: <code>/todo buy bread</code> · <code>/todo done 1</code> · <code>/todo del 1</code>\n' +
  '/task — AI scheduled task: <code>/task every day 08:00 AI news</code>\n' +
  '/memfind term — search long-term memory\n' +
  '🖌 <b>Image edit:</b> send a photo with the caption <code>edit: make the sky a sunset</code> (or reply + <code>/edit</code>)\n' +
  '🗣 <b>Reminder from free text:</b> say “remind me tomorrow at 5 to pay the bill” — I understand\n' +
  '🎬 <b>YouTube links:</b> send a link and I read the subtitles and summarize them\n' +
  '🆓 <b>Images without a key:</b> free Pollinations fallback (can be turned off under ⚙️ Settings)';
