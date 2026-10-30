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

async function onMessage(env, m) {
  if (!m.from || !m.chat) return;
  const uid = String(m.from.id);
  const chatId = m.chat.id;
  const isGroup = ['group', 'supergroup'].includes(m.chat.type);
  const rawText = String(m.text || m.caption || '');
  let text = normDigits(rawText).trim();
  let fromVoice = false;
  const cmdText = normCmd(text);
  const budget = newBudget(CFG.TG_BUDGET_MSG);

  /* مجوز */
  if (!(await isAllowed(env, uid))) {
    if (!isGroup) {
      env._lang = (await _langOf(env, uid)) || 'fa';
      await sendMsg(env, budget, chatId, L(env, 'm0jdeepr'));
    }
    return;
  }
  /* در گروه فقط وقتی منشن یا ریپلای به ربات باشد پاسخ میدهد */
  let forcedChat = false;
  if (isGroup) {
    const mentioned = await groupWantsBot(env, m);
    if (!mentioned) return;
    forcedChat = true;
  }

  const u = await getUser(env, uid);
  const st = u.st;
  const scope = scopeOf(chatId, u, isGroup);
  try { if (u.lastChat !== chatId) { u.lastChat = chatId; await putUser(env, uid, u); } } catch {}

  /* دستورات */
  /* دستورات: هر متنی که با اسلش شروع شود هرگز به مدل نمی‌رود.
     handleCommand فقط برای کامند ناشناخته «false» برمی‌گرداند؛ مقدار برگشتی
     توابع منو مهم نیست (باگ قبلی: توابع منو undefined برمی‌گرداندند و متن
     کامند به‌عنوان پیام عادی به مدل می‌رفت). */
  if (cmdText.startsWith('/')) {
    const known = await handleCommand(env, budget, chatId, uid, m, cmdText, u, isGroup);
    if (known !== false) return;
    const waiting = u.wait && Date.now() - (u.wait.ts || 0) < CFG.WAIT_TTL_MS;
    if (!waiting) {
      await sendMsg(env, budget, chatId,
        L(env, 'm1fxm35l', esc(cmdText.split(/\s+/)[0].slice(0, 32))));
      return;
    }
  }

  /* حالت‌های انتظار ورودی */
  if (u.wait && Date.now() - (u.wait.ts || 0) < CFG.WAIT_TTL_MS) {
    const w = u.wait.type;
    if (w === 'bk') {
      /* بازیابی بکاپ: سند JSON یا متن paste‌شده. از rawText استفاده می‌کنیم نه text،
         چون normDigits ارقام فارسی داخل خاطره‌ها را عوض می‌کند و JSON خراب میشد. */
      let raw = '';
      if (m.document) {
        await typingOn(env, budget, chatId);
        raw = (await readDocRaw(env, budget, m.document, CFG.BACKUP_MAX)) || '';
      } else {
        raw = String(rawText || '');
      }
      u.wait = null;
      await putUser(env, uid, u);
      if (!raw.trim()) return await sendMsg(env, budget, chatId, L(env, 'm0sezqye', EMOJI.err));
      try {
        await backupRestore(env, budget, chatId, uid, raw);
      } catch (e) {
        await logErr(env, 'restore', e);
        return await sendMsg(env, budget, chatId, L(env, 'm19t6q6e', EMOJI.err, esc(String((e && e.message) || e).slice(0, 220))));
      }
      return await sendMsg(env, budget, chatId, L(env, 'm0wez77p', EMOJI.ok));
    }
    if (w === 'dl') {
      const n = parseInt(text, 10);
      if (!isNaN(n)) { st.dailyLimit = Math.min(100000, Math.max(0, n)); }
      u.wait = null; await putUser(env, uid, u);
      await sendMsg(env, budget, chatId, L(env, 'm0y5t1g0', EMOJI.ok, n > 0 ? num(n) + L(env, 'm06cgnqj') : L(env, 'm13m57j2')));
      return await settingsMenu(env, budget, chatId, uid);
    }
    if (w === 'sys') {
      st.sysCustom = text.slice(0, 2000);
      u.wait = null; await putUser(env, uid, u);
      await sendMsg(env, budget, chatId, EMOJI.ok + (text ? L(env, 'm109dy58') : L(env, 'm1tbrfla')));
      return await personaMenu(env, budget, chatId, uid);
    }
    if (w === 'panew') {
      if (!u.pl) u.pl = [];
      u.pl.push({ k: hash32(text + Date.now()), n: text.slice(0, 40), v: text.slice(0, CFG.PROMPT_LIB_VALUE) });
      if (u.pl.length > CFG.PROMPT_LIB_MAX) u.pl.shift();
      u.wait = null; await putUser(env, uid, u);
      await sendMsg(env, budget, chatId, L(env, 'm1ht8n3f', EMOJI.ok));
      return await promptsMenu(env, budget, chatId, uid);
    }
    if (w === 'rm') {
      const r = parseRemind(text);
      u.wait = null; await putUser(env, uid, u);
      if (!r) return await sendMsg(env, budget, chatId, L(env, 'm1bnwrya', EMOJI.err));
      const k = 'rm:' + hash32(uid + r.at + Math.random());
      await kvPut(env, k, { uid, chat: chatId, at: r.at, txt: r.txt, repeat: (r.repeat || 'none') }, Math.max(60, Math.ceil((r.at - Date.now()) / 1000) + 120));
      const d = new Date(r.at + 210 * 60000);
      await sendMsg(env, budget, chatId, L(env, 'm0zrvigh', EMOJI.ok, d.getUTCHours(), String(d.getUTCMinutes()).padStart(2, '0'), esc(r.txt)));
      return;
    }
    if (w === 'todo') {
      const it = await todoAdd(env, uid, text);
      u.wait = null; await putUser(env, uid, u);
      if (!it) return sendMsg(env, budget, chatId, L(env, 'm03lhvxb', EMOJI.err));
      const arr = await todoGet(env, uid);
      return sendMsg(env, budget, chatId, L(env, 'm1in7o29', EMOJI.ok, esc(it.t), num(arr.filter((x) => !x.done).length), num(arr.length)));
    }
    if (w === 'find') {
      u.wait = null; await putUser(env, uid, u);
      const found = await histFind(env, uid, scope, text);
      if (found.error) return sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(found.error));
      if (!found.hits.length) return sendMsg(env, budget, chatId, L(env, 'm102js5y', esc(text)));
      const lines = found.hits.map((h, i) => esc(num(i + 1) + '. ' + h.thread + ' · ' + h.role + '\n   ' + h.snip)).join('\n');
      return sendMsg(env, budget, chatId, L(env, 'm1cai5l5', num(found.total), esc(text), lines));
    }
    if (w === 'usrimgq') {
      /* «آیدی | تعداد» — سهمیهٔ تصویر روزانه برای همان کاربر ذخیره می‌شود */
      const seg = String(text || '').split(/[|،]/);
      const nid = (seg[0] || '').replace(/[^0-9]/g, '');
      const nq = parseInt(normDigits(seg[1] || '').replace(/[^0-9]/g, ''), 10);
      u.wait = null;
      await putUser(env, uid, u);
      if (!nid || isNaN(nq) || nq < 0 || nq > 10000) {
        return sendMsg(env, budget, chatId, L(env, 'm1hjy90d', EMOJI.err));
      }
      const prev = await kvGet(env, 'lim:' + nid, {});
      prev.img = nq;
      await kvPut(env, 'lim:' + nid, prev);
      return await sendMsg(env, budget, chatId, L(env, 'm1sa9jh3', EMOJI.ok, esc(nid), nq ? num(nq) + L(env, 'm16t1u4f') : L(env, 'm0knucpz')));
    }
    if (w === 'usradd') {
      const parts = text.split(/\s+/);
      const nid = parts[0].replace(/[^0-9-]/g, '');
      u.wait = null;
      if (!nid) { await putUser(env, uid, u); return await sendMsg(env, budget, chatId, L(env, 'm1ux7f4b', EMOJI.err)); }
      const al = await kvGet(env, 'al', []);
      if (!al.includes(nid)) al.push(nid);
      await kvPut(env, 'al', al);
      if (parts[1]) { const nm = await kvGet(env, 'aln', {}); nm[nid] = esc(parts.slice(1).join(' ').slice(0, 30)); await kvPut(env, 'aln', nm); }
      await putUser(env, uid, u);
      await sendMsg(env, budget, chatId, L(env, 'm0egij2w', EMOJI.ok, esc(nid)));
      return await usersMenu(env, budget, chatId);
    }

    if (w === 'memadd') {
      const ok = await memAdd(env, uid, text);
      u.wait = null; await putUser(env, uid, u);
      await sendMsg(env, budget, chatId, ok ? L(env, 'm16pccr9', EMOJI.ok) : L(env, 'm09bzqqm', EMOJI.err));
      return await settingsMenu(env, budget, chatId, uid);
    }
    if (w === 'memedit') {
      const mm = text.split('|');
      const arr = await memGet(env, uid);
      u.wait = null;
      if (mm.length >= 2) {
        const idx = parseInt(normDigits(mm[0]).replace(/[^0-9]/g, ''), 10) - 1;
        const nt = mm.slice(1).join('|').trim().slice(0, 300);
        /* 🔧 v5.4: از memEdit استفاده کن تا برچسب و زمانِ خاطره حفظ شود
           (قبلاً نسخهٔ درون‌خطی، tag را پاک و ts را کهنه می‌گذاشت). */
        if (arr[idx] && nt && await memEdit(env, uid, arr[idx].id, nt, arr[idx].tag)) { await putUser(env, uid, u); await sendMsg(env, budget, chatId, L(env, 'm1v2qmn4', EMOJI.ok)); }
        else { await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm080aqqz', EMOJI.err)); }
      } else { await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm0npkj1n', EMOJI.err)); }
      return await settingsMenu(env, budget, chatId, uid);
    }

    /* ── ویزارد سرویس کاستوم 🔌 ── */
    if (w === 'pv_name') {
      const name = text.slice(0, CFG.PROVIDER_NAME_MAX).trim();
      if (!name || name.startsWith('/')) return sendMsg(env, budget, chatId, L(env, 'm1kt27iy', EMOJI.err));
      return await pvAsk(env, budget, chatId, uid, u, 'pv_url', { name });
    }
    if (w === 'pv_url') {
      const base = normBaseUrl(text);
      if (!base) return sendMsg(env, budget, chatId, L(env, 'm14a7zjh', EMOJI.err));
      return await pvAsk(env, budget, chatId, uid, u, 'pv_key', { name: (u.wait.d || {}).name, base });
    }
    if (w === 'pv_key') {
      const key = text.replace(/\s+/g, '');
      if (key.length < CFG.KEY_MIN || key.length > CFG.KEY_MAX) return sendMsg(env, budget, chatId, L(env, 'm17b8a4j', EMOJI.err, CFG.KEY_MIN, CFG.KEY_MAX));
      const d = u.wait.d || {};
      const many = await provAll(env);
      if (many.length >= CFG.MAX_PROVIDERS) { u.wait = null; await putUser(env, uid, u); return sendMsg(env, budget, chatId, L(env, 'm0tis57h', CFG.MAX_PROVIDERS)); }
      const pid = newPid(d.name, uid);
      const rec = { pid, name: d.name, base: d.base, key, models: [], ts: Date.now(), ut: Date.now() };
      await provPut(env, rec);
      u.wait = null; await putUser(env, uid, u);
      await sendMsg(env, budget, chatId, L(env, 'm0ejgkqx', esc(d.name), esc(d.base)));
      const res = await discoverModels(env, d.base, key);
      if (res.ok) {
        if (res.base !== d.base) { rec.base = res.base; await provPut(env, rec); }
        await kvPut(env, 'pvr:' + pid, { items: res.items, t: Date.now() }, CFG.DISCO_TTL);
        env._menuMsg = null;
        return await renderPick(env, budget, chatId, pid, 0, null);
      }
      u.wait = { type: 'pv_manual', d: { pid }, ts: Date.now() };
      await putUser(env, uid, u);
      return await sendMsg(env, budget, chatId,
        L(env, 'm1wb9onq', EMOJI.err, pick(env, DISCO_FAIL_TEXT, DISCO_FAIL_TEXT_EN)[res.code] || res.code));
    }
    if (w === 'pv_manual') {
      const d = u.wait.d || {};
      const raw = text.split(/[,،\n]+/).map((x) => x.trim()).filter(Boolean).slice(0, CFG.MANUAL_IDS_MAX);
      const items = [];
      for (const r0 of raw) {
        let id = r0, ctx = null;
        const m = r0.match(/^(.+?)\s+([0-9]{1,4})\s*[kK]\s*$/); // «my-model 128k»
        if (m) { id = m[1].trim(); ctx = (+m[2]) * 1000; }
        id = id.replace(/\s+/g, '');
        if (id && id.length <= CFG.MODEL_ID_MAX && /^[ -~]+$/.test(id)) items.push({ id, ctx, src: 'man' });
      }
      const rec = await provGet(env, d.pid);
      u.wait = null; await putUser(env, uid, u);
      if (!rec) return sendMsg(env, budget, chatId, L(env, 'm1yh7mvd', EMOJI.err));
      if (!items.length) return sendMsg(env, budget, chatId, L(env, 'm1nl12v2', EMOJI.err));
      const added = await mergeModels(env, rec, items);
      await sendMsg(env, budget, chatId, L(env, 'm0wcku8x', EMOJI.ok, added, esc(rec.name)));
      env._menuMsg = null;
      return await providerPage(env, budget, chatId, rec.pid);
    }
    if (w === 'pv_rename' || w === 'pv_reurl' || w === 'pv_rekey' || w === 'pv_addkey' || w === 'pv_ctx') {
      const d = u.wait.d || {};
      const rec = await provGet(env, d.pid || parseModelKey(d.key).pid);
      u.wait = null; await putUser(env, uid, u);
      if (!rec) return sendMsg(env, budget, chatId, L(env, 'm1k5ju5y', EMOJI.err));
      if (w === 'pv_rename') {
        const name = text.slice(0, CFG.PROVIDER_NAME_MAX).trim();
        if (!name) return sendMsg(env, budget, chatId, L(env, 'm0gmmytc', EMOJI.err));
        rec.name = name; await provPut(env, rec);
        await sendMsg(env, budget, chatId, L(env, 'm1a510vh', EMOJI.ok, esc(name)));
      }
      if (w === 'pv_reurl') {
        const base = normBaseUrl(text);
        if (!base) return sendMsg(env, budget, chatId, L(env, 'm04vzm1x', EMOJI.err));
        rec.base = base; await provPut(env, rec);
        await sendMsg(env, budget, chatId, L(env, 'm0niplq6', EMOJI.ok, esc(base)));
      }
      if (w === 'pv_rekey') {
        const key = text.replace(/\s+/g, '');
        if (key.length < CFG.KEY_MIN || key.length > CFG.KEY_MAX) return sendMsg(env, budget, chatId, L(env, 'm1d0sm13', EMOJI.err));
        /* v4.10: کلید جدید به انتهای لیست اضافه میشود (نه جایگزینی کورکورانه).
           اگر سقف پر باشد، قدیمی‌ترین کلیدِ بعد از اولی حذف میشود؛ کلیدِ اصلی
           (اول) دست‌نخورده می‌ماند تا چیزی که کاربر می‌شناسد ناپدید نشود. */
        const keys = provKeysOf(rec);
        if (keys.length >= CFG.KEYS_PER_PROVIDER) keys.splice(1, keys.length - 1);
        if (keys.indexOf(key) < 0) keys.push(key);
        rec.keys = keys.slice(0, CFG.KEYS_PER_PROVIDER);
        rec.key = rec.keys[0];
        await provPut(env, rec);
        await sendMsg(env, budget, chatId, L(env, 'm02hnuk1', EMOJI.ok, rec.keys.length, CFG.KEYS_PER_PROVIDER, esc(maskKey(key))));
      }
      if (w === 'pv_addkey') {
        const key = text.replace(/\s+/g, '');
        if (key.length < CFG.KEY_MIN || key.length > CFG.KEY_MAX) return sendMsg(env, budget, chatId, L(env, 'm1d0sm13', EMOJI.err));
        if (provKeysOf(rec).length >= CFG.KEYS_PER_PROVIDER) {
          u.wait = null; await putUser(env, uid, u);
          return sendMsg(env, budget, chatId, L(env, 'm06byytx', CFG.KEYS_PER_PROVIDER));
        }
        const keys = provKeysOf(rec);
        if (keys.indexOf(key) >= 0) return sendMsg(env, budget, chatId, L(env, 'm1y8wv5p'));
        keys.push(key);
        rec.keys = keys.slice(0, CFG.KEYS_PER_PROVIDER);
        rec.key = rec.keys[0];
        await provPut(env, rec);
        u.wait = null; await putUser(env, uid, u);
        await sendMsg(env, budget, chatId, L(env, 'm0ppl6sq', EMOJI.ok, rec.keys.length, esc(maskKey(key))));
        return await providerKeysPage(env, budget, chatId, d.pid);
      }
      if (w === 'pv_ctx') {
        const n = parseInt(normDigits(text).replace(/[^0-9]/g, ''), 10);
        const p = parseModelKey(d.key);
        const me = (rec.models || []).find((x) => x.id === p.id);
        if (!me || !n || n < 1 || n > 100000) return sendMsg(env, budget, chatId, L(env, 'm1x2dhio', EMOJI.err));
        me.ctx = n * 1000; await provPut(env, rec);
        await sendMsg(env, budget, chatId, L(env, 'm1qswibp', EMOJI.ok, esc(me.id), num(n)));
      }
      env._menuMsg = null;
      return await providerPage(env, budget, chatId, rec.pid);
    }
  }

  /* عکس‌ها 👁 — بزرگ‌ترین سایز هر پیام (چند عکس = آلبوم ⇒ چند پیام پشت‌سرهم) */
  const photos = [];
  const photoSizes = [];
  if (Array.isArray(m.photo) && m.photo.length) photoSizes.push(m.photo[m.photo.length - 1]);
  if (m.reply_to_message && Array.isArray(m.reply_to_message.photo) && m.reply_to_message.photo.length) {
    photoSizes.push(m.reply_to_message.photo[m.reply_to_message.photo.length - 1]);
  }
  if (photoSizes.length && !forcedChat && !(m.document || m.video || m.voice || m.audio || m.sticker)) {
    await typingOn(env, budget, chatId);
    for (const sz of photoSizes.slice(0, CFG.VISION_MAX_N)) {
      const im = await readTelegramPhoto(env, budget, sz);
      if (im) photos.push(im);
    }
    if (!photos.length) return sendMsg(env, budget, chatId, L(env, 'm1wmdiq9', EMOJI.err));
  }

  /* 🖌 v5.4: ویرایش عکس با کپشن — «ویرایش: …» یا «/edit …» در کپشن عکس.
     مستقیم به geminiImageEdit می‌رود، بدون رفتن به مدل چت. */
  if (!forcedChat && photos.length && text && st.imgEdit !== false && /^\s*(?:\/edit\b|ویرایش\s*:|edit\s*:)/i.test(text)) {
    const edp = text.replace(/^\s*(?:\/edit\b|ویرایش\s*:|edit\s*:)\s*/i, '').trim();
    if (!edp) return sendMsg(env, budget, chatId, L(env, 'm0b861td'));
    if (st.imgGen === false) return sendMsg(env, budget, chatId, L(env, 'm0wbseun'));
    const el = await checkDailyLimit(env, uid, st);
    if (el) return sendMsg(env, budget, chatId, el);
    const eq = await quotaTake(env, uid, 'img');
    if (eq) return sendMsg(env, budget, chatId, eq);
    const typingE = startTyping(env, chatId);
    try {
      await typingOn(env, budget, chatId);
      const img = await geminiImageEdit(env, edp, photos.map((x) => ({ b64: x.b64, mime: x.mime })), st.imgModel || CFG.IMG_MODEL_DEFAULT);
      await quotaBump(env, uid, 'img');
      await imgGallerySave(env, uid, { b64: img.b64, mime: img.mime, prompt: '✏️ ' + edp });
      const fdE = new FormData();
      fdE.append('chat_id', String(chatId));
      fdE.append('photo', new Blob([appB64Bytes(img.b64)], { type: img.mime || 'image/png' }), 'behrad-edit.png');
      fdE.append('parse_mode', 'HTML');
      fdE.append('caption', '🖌 ' + esc(edp.slice(0, 900)) + '\n<i>' + esc(img.via || '') + '</i>');
      await tg(env, budget, 'sendPhoto', null, fdE);
      await bumpUsage(env, uid, est(edp) + 1000, 0);
    } catch (e) {
      await logErr(env, 'img_edit', e);
      await sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(String((e && e.message) || e).slice(0, 300)));
    } finally { typingE.stop = true; }
    return;
  }

  /* فایل متنی/کد پیوست؟ */
  let filePart = null;
  if (m.document && !forcedChat) {
    filePart = await readTelegramFile(env, budget, m.document);
    if (filePart) await typingOn(env, budget, chatId);
  }

  /* ویس فارسی → متن (v4.5: خروجی پیش‌فرض متنی، صوتی اختیاری از تنظیمات) */
  const voiceObj = m.voice || m.audio || null;
  if (voiceObj && !forcedChat) {
    await typingOn(env, budget, chatId);
    try {
      const buf = await downloadTelegramFileBytes(env, budget, voiceObj.file_id, CFG.VOICE_MAX_BYTES);
      if (!buf) {
        return sendMsg(env, budget, chatId, L(env, 'm088ke95', EMOJI.err));
      }
      const tr = await transcribeVoice(env, buf, st, voiceObj.mime_type || '');
      text = tr;
      fromVoice = true;
    } catch (e) {
      await logErr(env, 'stt', e);
      return sendMsg(env, budget, chatId, L(env, 'm0s14x2z', EMOJI.err, esc(String((e && e.message) || e).slice(0, 160))));
    }
  }

  /* 🗣 v5.4: تشخیص قصد یادآور/تسک از متن آزاد — قبل از چت، فقط وقتی
     عبارت صریح یادآوری هست. «یادآور» ← rm: و «هر روز/هفتگی» ← task. */
  if (!isGroup && !filePart && !photos.length && st.nlRemind !== false && NL_REMIND_RE.test(text)) {
    const nl = await nlRemindIntent(text);
    if (nl) {
      /* اگر «هر روز/هفتگی» در متن بود، تسک تکراری بساز نه یادآور یک‌باره */
      const repM = /(هر\s*روز|روزانه|هفتگی|هر\s*هفته)/.test(text);
      if (repM) {
        const pr = parseRemind(text.replace(NL_REMIND_RE, '').replace(/(هر\s*روز|روزانه|هفتگی|هر\s*هفته)/g, (x) => /هفت/.test(x) ? 'هفتگی ' : 'روزانه ').trim());
        if (pr) {
          const list = await taskList(env, uid);
          if (list.length < CFG.TASK_MAX) {
            const tt = { uid, chat: chatId, id: 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4), prompt: pr.txt.slice(0, CFG.TASK_PROMPT_MAX), repeat: pr.repeat || 'daily', at: pr.at, ts: Date.now() };
            if (tt.prompt) {
              await taskSave(env, tt);
              const dd = new Date(tt.at + 210 * 60000);
              await sendMsg(env, budget, chatId, L(env, 'm0wkggkw', EMOJI.ok, repeatLabel(env, tt.repeat), dd.getUTCHours(), String(dd.getUTCMinutes()).padStart(2, '0'), esc(tt.prompt.slice(0, 120))));
              return;
            }
          }
        }
      }
      const k = 'rm:' + hash32(uid + nl.at + Math.random());
      await kvPut(env, k, { uid, chat: chatId, at: nl.at, txt: nl.txt, repeat: 'none' }, Math.max(60, Math.ceil((nl.at - Date.now()) / 1000) + 120));
      const d2 = new Date(nl.at + 210 * 60000);
      await sendMsg(env, budget, chatId, L(env, 'm0c4ur19', EMOJI.ok, d2.getUTCHours(), String(d2.getUTCMinutes()).padStart(2, '0'), esc(nl.txt)));
      return;
    }
  }

  /* ریپلای روی پیام متنی → زمینهٔ گفتگو.
     قبلاً فقط عکسِ ریپلای خوانده میشد؛ یعنی «همین رو خلاصه کن» بدون اینکه متن
     دوباره فرستاده شود اصلاً کار نمیکرد (به‌خصوص در گروه، جایی که پیامِ دیگران
     اصلاً وارد تاریخچه نمیشود و تنها راه دیدنش همین ریپلای است). */
  let replyPart = '';
  const rp = m.reply_to_message;
  if (rp && rp.text) {
    const bi = await botInfo(env);
    /* ریپلای روی جوابِ خودِ ربات رد میشود: آن پیام آخرین ورودی تاریخچه است و
       آوردن دوباره‌اش فقط توکن می‌سوزاند. */
    if (!(bi && rp.from && rp.from.id === bi.id)) {
      const who = esc(String((rp.from && (rp.from.first_name || rp.from.username)) || L(env, 'm0p16vdf')).slice(0, 40));
      replyPart = L(env, 'm1x19yq4', who, String(rp.text).slice(0, 4000));
    }
  }

  /* پیام خالی؟ (ریپلایِ بدون متن هم معتبر است: زمینه را می‌فرستد و مدل خودش می‌فهمد) */
  if (!text && !filePart && !photos.length && !replyPart) {
    if (!isGroup) await sendMsg(env, budget, chatId, L(env, 'm1x74gtg'));
    return;
  }

  /* چت! (متن گروهی: پیشوند منشن حذف میشود) */
  const baseText = forcedChat ? (text.replace(/@\w+/g, '').trim() || text) : text;
  const userText = replyPart + baseText;

  /* اسم‌گذاری خودکار گفتگو: به‌جای «گفتگو ۱» یک عنوان از اولین پیام.
     کاملاً محلی و بدون فراخوانی مدل — رایگان، آنی، و هیچ‌وقت خطا نمی‌دهد. */
  try {
    if (!isGroup) {
      const th = (u.threads || []).find((x) => x.id === u.thread);
      if (th && th.auto !== 1 && /^گفتگو\s+\d+$/.test(th.name)) {
        const ti = autoTitle(baseText);
        if (ti) { th.name = ti; th.auto = 1; await putUser(env, uid, u); }
      }
    }
  } catch (e) { await logErr(env, 'autotitle', e); }

  await runChatReply(env, budget, chatId, uid, scope, st, userText, { filePart, photos, fromVoice });
}

/* عنوان کوتاه برای گفتگو: از اولین پیام کاربر، بدون فراخوانی مدل.
   عمداً محلی است: یک فراخوانی ارزان برای هر گفتگوی تازه هم تأخیر می‌آورد
   هم اگر کلید گوگل نباشد شکست می‌خورد، در حالی که برش کردن متن هیچ‌وقت خراب نمیشود. */
function autoTitle(s) {
  let t = String(s || '')
    .replace(/<\|(?:REPLY|FILE)_(?:START|END)\|>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!t) return '';
  t = t.replace(/^\/[a-z]+\s*/i, '');
  if (!t) return '';
  if (t.length > 34) {
    t = t.slice(0, 34);
    const sp = t.lastIndexOf(' ');
    if (sp > 10) t = t.slice(0, sp);
    t += '…';
  }
  return t;
}

/* در گروه: منشن مستقیم به ربات یا ریپلای به پیام ربات */
async function groupWantsBot(env, m) {
  const t = String(m.text || '');
  if (normCmd(t).startsWith('/')) return true; // دستورات همیشه
  const bi = await botInfo(env);
  if (bi && t.includes('@' + bi.username)) return true;
  const rep = m.reply_to_message;
  if (rep && rep.from && rep.from.is_bot && bi && rep.from.id === bi.id) return true;
  if ((m.entities || []).some((e) => e.type === 'mention')) {
    if (bi && t.includes('@' + bi.username)) return true;
  }
  return false;
}

/* خواندن فایل ارسالی تلگرام (متنی/کد تا ~۲۰۰KB؛ PDF تا سقف PDF_MAX با گوگل) */

/* خواندن عکس تلگرام (base64) — دو مسیر: data-URL برای سرویس‌های کاستوم و
   آرایهٔ بایت برای مدل‌های ویژن کلادفلر. خروجی: { mime, b64, bytes } */
async function readTelegramPhoto(env, budget, size) {
  if (!size || size.file_size > CFG.VISION_MAX_BYTES) return null;
  let f = null;
  try {
    f = await tg(env, budget, 'getFile', { file_id: size.file_id });
  } catch (e) { await logErr(env, 'readphoto', e); return null; }
  if (!f || !f.file_path) return null;
  try {
    const res = await fetchT(TG_BASE + '/file/bot' + env.TELEGRAM_BOT_TOKEN + '/' + f.file_path, {}, 30000);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > CFG.VISION_MAX_BYTES) return null;
    const b64 = bufToB64(buf);
    const mime = guessMime(f.file_path);
    const id = { mime, b64, bytes: b64Bytes(b64) };
    return id;
  } catch (e) { await logErr(env, 'readphoto', e); return null; }
}

async function readTelegramFile(env, budget, doc) {
  try {
    const okTypes = ['text/', 'application/json', 'application/javascript', 'application/xml', 'application/x-yaml'];
    const mime = doc.mime_type || '';
    const name = String(doc.file_name || '');
    /* PDF: خودِ گوگل متنش را استخراج میکند (inline_data) — بدون کتابخانه و
       بدون خراب‌شدن فونت‌های CID فارسی. سقف جدا دارد چون سند است نه متن. */
    if (mime === 'application/pdf' || /\.pdf$/i.test(name)) {
      if ((doc.file_size || 0) > CFG.PDF_MAX) {
        return L(env, 'm1py50hw', name, Math.round(CFG.PDF_MAX / 1000000));
      }
      if (!(env.GEMINI_API_KEY || '').trim()) {
        return L(env, 'm1drucif', name);
      }
      const buf = await downloadTelegramFileBytes(env, budget, doc.file_id, CFG.PDF_MAX);
      if (!buf) return L(env, 'm0c71ikm', name);
      const txt = await geminiPdfText(env, buf);
      return L(env, 'm0wxcg0v', name, txt.slice(0, CFG.USER_FILE_INLINE));
    }
    if (doc.file_size > CFG.USER_FILE_MAX) return L(env, 'm12x15ww', name);
    if (!okTypes.some((x) => mime.startsWith(x)) && !/\.(txt|md|json|js|py|ts|html|css|csv|xml|yaml|yml|log|sh|c|cpp|java|go|rs)$/i.test(name)) {
      return null;
    }
    const f = await tg(env, budget, 'getFile', { file_id: doc.file_id });
    const res = await fetchT(TG_BASE + '/file/bot' + env.TELEGRAM_BOT_TOKEN + '/' + f.file_path, {}, 30000);
    if (!res.ok) return null;
    const body = await res.text();
    return L(env, 'm115nlgh', doc.file_name || L(env, 'm0abc4ft'), body.slice(0, CFG.USER_FILE_INLINE));
  } catch (e) { await logErr(env, 'readfile', e); return null; }
}

/* خواندنِ خامِ سند تلگرام (بدون پوشش پرامپت) — فقط برای بازیابی بکاپ JSON.
   با readTelegramFile فرق دارد: آن متن را برای مدل می‌بندد، اینجا محتوای
   اصلی لازم است تا JSON بتوان parse شود. */
async function readDocRaw(env, budget, doc, maxBytes) {
  try {
    const mime = String(doc.mime_type || '');
    const name = String(doc.file_name || '');
    const cap = maxBytes || CFG.BACKUP_MAX;
    const okType = mime.startsWith('application/json') || mime.startsWith('text/') || /\.json$/i.test(name);
    if (!okType) return null;
    if ((doc.file_size || 0) > cap) return null;
    const f = await tg(env, budget, 'getFile', { file_id: doc.file_id });
    if (!f || !f.file_path) return null;
    const res = await fetchT(TG_BASE + '/file/bot' + env.TELEGRAM_BOT_TOKEN + '/' + f.file_path, {}, 30000);
    if (!res.ok) return null;
    return (await res.text()).slice(0, cap);
  } catch (e) { await logErr(env, 'readdoc', e); return null; }
}

/* تجزیه ورودی یادآور */
function parseRemind(text) {
  /* فرمت‌ها (v5.4 کامل‌تر شد):
       18:30 متن                  → یک‌بار (فردا اگر گذشته)
       45m متن | 2h متن | 3d متن  → نسبت به این لحظه
       روزانه 08:00 متن            → هر روز
       هفتگی 08:00 متن             → هر هفت روز
       هر 5 روز 08:00 متن          → هر N روز
       ماهانه 08:00 روز 15 متن     → پانزدهم هر ماه (اگر آن ماه ۱۵ نداشت، آخر ماه) */
  /* 🔧 v5.4: ساعت/دقیقه باید معتبر باشند؛ وگرنه «99:99» با rollover
     تاریخچه به روز بعد می‌رفت و زمان بی‌معنی ثبت می‌شد. */
  const validHM = (h, m) => h >= 0 && h <= 23 && m >= 0 && m <= 59;
  let mm = text.match(/^(?:روزانه|daily)\s+(\d{1,2}):(\d{2})\s+(.+)$/i);
  if (mm && validHM(+mm[1], +mm[2])) {
    const t = tehran();
    let at = tehranToEpoch(t.y, t.m, t.d, +mm[1], +mm[2]);
    if (at <= Date.now()) at += 86400000;
    return { at, txt: mm[3].slice(0, 300), repeat: 'daily' };
  }
  mm = text.match(/^(?:هفتگی|weekly)\s+(\d{1,2}):(\d{2})\s+(.+)$/i);
  if (mm && +mm[1] <= 23 && +mm[2] <= 59) {
    const t = tehran();
    let at = tehranToEpoch(t.y, t.m, t.d, +mm[1], +mm[2]);
    if (at <= Date.now()) at += 86400000;
    return { at, txt: mm[3].slice(0, 300), repeat: 'weekly', step: 7 };
  }
  mm = text.match(/^هر\s+(\d{1,2})\s*روز\s+(\d{1,2}):(\d{2})\s+(.+)$/i);
  if (mm && validHM(+mm[2], +mm[3])) {
    const step = Math.max(1, Math.min(30, +mm[1]));
    const t = tehran();
    let at = tehranToEpoch(t.y, t.m, t.d, +mm[2], +mm[3]);
    if (at <= Date.now()) at += 86400000;
    return { at, txt: mm[4].slice(0, 300), repeat: 'interval', step };
  }
  mm = text.match(/^ماهانه\s+(\d{1,2}):(\d{2})\s+روز\s+(\d{1,2})\s+(.+)$/i);
  if (mm && validHM(+mm[1], +mm[2])) {
    const day = Math.max(1, Math.min(31, +mm[3]));
    const t = tehran();
    /* اگر آن ماه روز ۳۱ را ندارد (۳۰ روزه/اسفند)، آخرین روز ماه گرفته می‌شود
       نه اینکه Date.UTC به ماه بعد بپرد. */
    const lastThis = new Date(Date.UTC(t.y, t.m, 0)).getUTCDate();
    let at = tehranToEpoch(t.y, t.m, Math.min(day, lastThis), +mm[1], +mm[2]);
    if (at <= Date.now()) at = nextMonthEpoch(t.y, t.m, day, +mm[1], +mm[2]);
    return { at, txt: mm[4].slice(0, 300), repeat: 'monthly', day };
  }
  mm = text.match(/^(\d{1,2}):(\d{2})\s+(.+)$/);
  if (mm && validHM(+mm[1], +mm[2])) {
    const t = tehran();
    let at = tehranToEpoch(t.y, t.m, t.d, +mm[1], +mm[2]);
    if (at <= Date.now()) at += 86400000; // اگر گذشته، فردا
    return { at, txt: mm[3].slice(0, 300), repeat: 'none' };
  }
  mm = text.match(/^(\d+)\s*(m|h|d)\s+(.+)$/i);
  if (mm) {
    const mult = { m: 60000, h: 3600000, d: 86400000 }[mm[2].toLowerCase()];
    return { at: Date.now() + (+mm[1]) * mult, txt: mm[3].slice(0, 300), repeat: 'none' };
  }
  return null;
}

/* epoch ماه بعدی برای همان روز — اگر آن روز در ماه بعد نبود (۳۱ بهمن → ۳۰ اسفند) */
function nextMonthEpoch(y, m, day, h, min) {
  const nm = m + 1, ny = m === 12 ? y + 1 : y;
  const last = new Date(Date.UTC(ny, nm, 0)).getUTCDate(); // روزهای ماه بعد
  return tehranToEpoch(ny, nm, Math.min(day, last), h, min);
}

/* تگ تکرار برای نمایش فارسی در پیام تأیید */
function repeatLabel(env, r) {
  if (r === 'daily') return L(env, 'm0k2v20w');
  if (r === 'weekly') return L(env, 'm1wvtx2k');
  if (r === 'monthly') return L(env, 'm1jhc1hk');
  if (r === 'interval') return L(env, 'm11hu893');
  return L(env, 'm1dhy9ai');
}
