/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 23-reminder-intent
   تشخیص قصد یادآور از متن آزاد 🗣
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ v5.4: تشخیص قصد یادآور از متن آزاد 🗣 ═══════════════════
   «فردا ساعت ۵ یادم بنداز قبض رو بدم» بدون /remind.
   عمداً قاعده‌محور است (نه مدل): سریع، رایگان و بدون ریسک اشتباه؛ فقط وقتی
   عبارت یادآوری صریح است فعال می‌شود تا پیام‌های عادی به یادآور تبدیل نشوند. */
const NL_REMIND_RE = /(یادم\s*بنداز|یادآوری\s*کن|یادآور|remind\s*me|یادم\s*بیار|یادم\s*باشه|به\s*یادم\s*باشه)/i;

async function nlRemindIntent(text) {
  /* ارقام فارسی/عربی اول به انگلیسی تبدیل می‌شوند — وگرنه «۲ ساعت دیگه»
     هیچ‌وقت با \d نمی‌خواند و یادآور ساخته نمی‌شد. */
  const raw0 = String(text || '').trim();
  const s = normDigits(raw0);
  if (!s || s.length > 300) return null;
  if (s.charAt(0) === '/') return null; // خود دستور /remind جای خودش
  if (!NL_REMIND_RE.test(s)) return null;
  const t = tehran();
  const now = Date.now();
  let at = 0, clean = s;
  /* «فردا» / «پس‌فردا» + ساعت */
  const hmRaw = s.match(/(\d{1,2}):(\d{2})/);
  /* 🔧 v5.4: ساعت نامعتبر (مثل ۹۹:۹۹) نباید با rollover به روز بعد بپرد */
  const hm = hmRaw && +hmRaw[1] <= 23 && +hmRaw[2] <= 59 ? hmRaw : null;
  const dayOffset = /پس\s*فردا/.test(s) ? 2 : /فردا/.test(s) ? 1 : /امروز/.test(s) ? 0 : -1;
  if (hm && dayOffset >= 0) {
    at = tehranToEpoch(t.y, t.m, t.d + dayOffset, +hm[1], +hm[2]);
    if (at <= now) at += 86400000;
  } else if (hm) {
    at = tehranToEpoch(t.y, t.m, t.d, +hm[1], +hm[2]);
    if (at <= now) at += 86400000;
  } else {
    /* «۴۵ دقیقه دیگه» / «۲ ساعت دیگه» / «۳ روز دیگه» */
    const rel = s.match(/(\d{1,3})\s*(دقیقه|ساعت|روز|min|hour|day|m|h|d)(?:\s*دیگه|\s*بعد|\s*later)?/i);
    if (rel) {
      const unit = rel[2].toLowerCase();
      const mult = /دقیقه|min|^m$/.test(unit) ? 60000 : /ساعت|hour|^h$/.test(unit) ? 3600000 : 86400000;
      at = now + (+rel[1]) * mult;
    }
  }
  if (!at) return null;
  /* متن یادآور: عبارت‌های زمانی و دستوری حذف میشوند تا متن تمیز بماند */
  clean = s
    .replace(/(پس\s*فردا|فردا|امروز)/g, ' ')
    .replace(/(\d{1,2}):(\d{2})/g, ' ')
    .replace(/(\d{1,3})\s*(دقیقه|ساعت|روز)\s*(دیگه|بعد)?/g, ' ')
    .replace(/(یادم\s*بنداز|یادآوری\s*کن|یادآور|remind\s*me|یادم\s*بیار|یادم\s*باشه|به\s*یادم\s*باشه)/gi, ' ')
    .replace(/(ساعت|که|را|رو)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length < 2) clean = s.slice(0, 120);
  return { at, txt: clean.slice(0, 300), repeat: 'none', src: 'nl' };
}

/* ── اجرای دستورات؛ خروجی true یعنی مدیریت شد ── */
async function handleCommand(env, budget, chatId, uid, m, text, u, isGroup) {
  const cmd = text.split(/\s+/)[0].toLowerCase().replace(/@[\w_]+$/, '');
  const arg = text.split(/\s+/).slice(1).join(' ');
  const scope = scopeOf(chatId, u, isGroup);

  switch (cmd) {
    case '/start':
      if (!isGroup) await sendMsg(env, budget, chatId,
        L(env, 'm07llsqr', EMOJI.fire));
      return await mainMenu(env, budget, chatId, uid);
    case '/help':
      return await sendMsg(env, budget, chatId, pick(env, HELP_TEXT, HELP_TEXT_EN), [[{ text: L(env, 'm0s5o55t', EMOJI.robot), callback_data: 'home' }]]);
    case '/model':
      env._menuMsg = null;
      return await showModels(env, budget, chatId, 0);
    case '/settings':
      env._menuMsg = null;
      return await settingsMenu(env, budget, chatId, uid);
    case '/stats':
      env._menuMsg = null;
      return await statsView(env, budget, chatId, uid);
    case '/new': {
      const th = curThread(u);
      th.ts = Date.now();
      /* گفتگویی که عنوانش را خودکار گرفته بود از نو عنوان می‌گیرد تا بعد از /new
         عنوانِ پیامِ قبلی را نشان ندهد. عنوان دستیِ کاربر دست‌نخورده می‌ماند. */
      if (th.auto === 1) {
        delete th.auto;
        th.name = L(env, 'm1erlebc', Math.max(1, (u.threads || []).indexOf(th) + 1));
      }
      await kvPut(env, 'h:' + scope, { msgs: [], used: 0 });
      await putUser(env, uid, u);
      await sendMsg(env, budget, chatId, L(env, 'm0m32lf1', EMOJI.ok, esc(th.name)));
      return true;
    }
    case '/ping':
      env._menuMsg = null;
      return await healthCheck(env, budget, chatId);
    case '/export':
      return await exportChat(env, budget, chatId, uid);
    case '/pladd':
      u.wait = { type: 'panew', ts: Date.now() }; await putUser(env, uid, u);
      return await sendMsg(env, budget, chatId, L(env, 'm16ee8fa'));
    case '/cancel':
      u.wait = null; await putUser(env, uid, u);
      return await sendMsg(env, budget, chatId, L(env, 'm0ytwmc4', EMOJI.ok));
    case '/provideradd': {
      if (isGroup) return await sendMsg(env, budget, chatId, L(env, 'm0mj740u'));
      if (!(await isAdmin(env, uid))) return await sendMsg(env, budget, chatId, L(env, 'm0w12m1w'));
      env._menuMsg = null;
      return await pvAsk(env, budget, chatId, uid, u, 'pv_name', {});
    }
    case '/providers': {
      if (isGroup) return await sendMsg(env, budget, chatId, L(env, 'm16uowci'));
      if (!(await isAdmin(env, uid))) return await sendMsg(env, budget, chatId, L(env, 'm0san7u4'));
      env._menuMsg = null;
      return await providersMenu(env, budget, chatId);
    }
    case '/remind': {
      const r = parseRemind(arg);
      if (!r) return await sendMsg(env, budget, chatId, L(env, 'm11cp206'));
      const k = 'rm:' + hash32(uid + r.at + Math.random());
      await kvPut(env, k, { uid, chat: chatId, at: r.at, txt: r.txt, repeat: (r.repeat || 'none') }, Math.max(60, Math.ceil((r.at - Date.now()) / 1000) + 120));
      const d = new Date(r.at + 210 * 60000);
      return await sendMsg(env, budget, chatId, L(env, 'm0zh1oic', EMOJI.ok, r.repeat === 'daily' ? L(env, 'm18eeume') : '', d.getUTCHours(), String(d.getUTCMinutes()).padStart(2, '0'), esc(r.txt)));
    }
    case '/web': {
      if (!arg.trim()) return await sendMsg(env, budget, chatId, L(env, 'm1jgabks'));
      if (!toolAvailable(env, 'search')) return await sendMsg(env, budget, chatId, L(env, 'm0web_off'));
      if (!(env.SEARCH_API_KEY || '').trim()) return await sendMsg(env, budget, chatId, L(env, 'm1i06i2v'));
      const typing = startTyping(env, chatId);
      try {
        await typingOn(env, budget, chatId);
        const ans = await tavilySearch(env, arg.trim(), CFG.SEARCH_MAX_RESULTS);
        const { msgs } = await buildMessages(env, u.st, scope, null, L(env, 'm0x828qa', arg.trim().slice(0, 200), ans), knownCtx(u.st.model), uid);
        msgs.push({ role: 'user', content: L(env, 'm132pgpd', arg.trim()) });
        const r = await aiChat(env, u.st.model, msgs, { temperature: u.st.temperature, maxTokens: u.st.maxTokens, ...cbOff(u.st) });
        const parts = chunkText(mdToHtml(r.text));
        await sendMsg(env, budget, chatId, parts[0]);
        for (let i = 1; i < parts.length; i++) await sendMsg(env, budget, chatId, parts[i]);
        await bumpUsage(env, uid, est(arg) + 1500, (r.usage && r.usage.completion_tokens) || est(r.text));
      } catch (e) {
        await sendMsg(env, budget, chatId, L(env, 'm0bflqnb', EMOJI.err, esc(String((e && e.message) || e).slice(0, 200))));
      } finally { typing.stop = true; }
      return true;
    }
    case '/weather': {
      if (!toolAvailable(env, 'weather')) return await sendMsg(env, budget, chatId, L(env, 'm0wr_off'));
      try {
        const w = await toolWeather(env);
        return await sendMsg(env, budget, chatId, L(env, 'm13r3zno', esc(w)));
      } catch (e) { return await sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(String((e && e.message) || e).slice(0, 160))); }
    }
    case '/crypto': {
      if (!toolAvailable(env, 'crypto')) return await sendMsg(env, budget, chatId, L(env, 'm0cr_off'));
      try {
        const c = await toolCrypto(env);
        return await sendMsg(env, budget, chatId, L(env, 'm02n8h7e', esc(c)));
      } catch (e) { return await sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(String((e && e.message) || e).slice(0, 160))); }
    }
    case '/image':
    case '/img': {
      if (!toolAvailable(env, 'img')) {
        return await sendMsg(env, budget, chatId, L(env, 'm0img_off'));
      }
      if (u.st.imgGen === false) {
        return await sendMsg(env, budget, chatId,
          L(env, 'm0w1ho9v'),
          [[{ text: L(env, 'm07r2tk2'), callback_data: 'st:ig' }], [{ text: L(env, 'm1t3qh5r'), callback_data: 'set' }]]);
      }
      if (!gemKey(env) && u.st.imgFree === false) return await sendMsg(env, budget, chatId,
        L(env, 'm0ja2c6v'));
      if (!arg.trim()) return await sendMsg(env, budget, chatId,
        L(env, 'm1dii9n0', esc(u.st.imgModel || CFG.IMG_MODEL_DEFAULT)));
      /* سقف روزانه باید اینجا هم بسته شود — قبلاً چت/ویجت سقف داشت ولی تصویر
         نه، یعنی بعد از پر شدن سقف می‌شد بی‌نهایت عکس گرفت. */
      const imgLim = await checkDailyLimit(env, uid, u.st);
      if (imgLim) return await sendMsg(env, budget, chatId, imgLim);
      const imgQ = await quotaTake(env, uid, 'img');
      if (imgQ) return await sendMsg(env, budget, chatId, imgQ);
      const typing = startTyping(env, chatId);
      try {
        await typingOn(env, budget, chatId);
        const img = await geminiImage(env, arg.trim(), u.st.imgModel || CFG.IMG_MODEL_DEFAULT, { free: u.st.imgFree !== false });
        await quotaBump(env, uid, 'img');
        await imgGallerySave(env, uid, { b64: img.b64, mime: img.mime, prompt: arg.trim() });
        const fd = new FormData();
        fd.append('chat_id', String(chatId));
        fd.append('photo', new Blob([appB64Bytes(img.b64)], { type: img.mime || 'image/png' }), 'behrad-image.png');
        fd.append('parse_mode', 'HTML');
        fd.append('caption', '🎨 ' + esc(arg.trim().slice(0, 900)) + '\n<i>' + esc(img.via || (u.st.imgModel || CFG.IMG_MODEL_DEFAULT)) + '</i>');
        await tg(env, budget, 'sendPhoto', null, fd);
        await bumpUsage(env, uid, est(arg) + 600, 0);
      } catch (e) {
        await logErr(env, 'image', e);
        await sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(String((e && e.message) || e).slice(0, 300)));
      } finally { typing.stop = true; }
      return true;
    }
    case '/tts': {
      if (!toolAvailable(env, 'tts')) return await sendMsg(env, budget, chatId, L(env, 'm0tts_off'));
      const q = arg.trim();
      if (!q) return await sendMsg(env, budget, chatId,
        L(env, 'm14ls76j', esc(u.st.voiceName || 'Kore'), esc(u.st.ttsModel || GEM_TTS_MODELS[0].id)));
      if (!gemKey(env)) return await sendMsg(env, budget, chatId,
        L(env, 'm1rjzl9l'));
      const ttsLim = await checkDailyLimit(env, uid, u.st);
      if (ttsLim) return await sendMsg(env, budget, chatId, ttsLim);
      const typing = startTyping(env, chatId);
      try {
        await typingOn(env, budget, chatId);
        /* voiceProv گوگل اجباری است: اگر کاربر کلادفلر را انتخاب کرده باشد
           MeloTTS فارسی ندارد و جواب، بی‌کیفیت یا خالی می‌شود. */
        const okv = await sendVoiceReply(env, budget, chatId, q, { ...u.st, voiceProv: 'google' });
        if (!okv) return await sendMsg(env, budget, chatId, L(env, 'm1yjv98q', EMOJI.err));
        await bumpUsage(env, uid, est(q) + 500, 0);
      } catch (e) {
        await logErr(env, 'tts_cmd', e);
        await sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(String((e && e.message) || e).slice(0, 220)));
      } finally { typing.stop = true; }
      return true;
    }
    /* ── v5.4: جستجو در تاریخچهٔ همهٔ گفتگوها ── */
    case '/find': {
      const qf = arg.trim();
      if (!qf) return await sendMsg(env, budget, chatId, L(env, 'm0uxc72i'));
      const typing = startTyping(env, chatId);
      try {
        const found = await histFind(env, uid, scope, qf);
        if (found.error) return await sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(found.error));
        if (!found.hits.length) return await sendMsg(env, budget, chatId, L(env, 'm102js5y', esc(qf)));
        const lines = found.hits.map((h, i) =>
          esc(num(i + 1) + '. ' + h.thread + ' · ' + h.role + '\n   ' + h.snip)).join('\n');
        return await sendMsg(env, budget, chatId,
          L(env, 'm1cai5l5', num(found.total), esc(qf), lines));
      } finally { typing.stop = true; }
    }
    /* ── v5.4: گالری تصاویر ── */
    case '/gallery': {
      const list = await imgGalleryList(env, uid);
      if (!list.length) return await sendMsg(env, budget, chatId, L(env, 'm1krerrn'));
      const ng = parseInt(normDigits(arg).replace(/[^0-9]/g, ''), 10);
      if (ng >= 1 && ng <= list.length) {
        const item = list[ng - 1];
        const img = await imgGalleryGet(env, uid, item.id);
        if (!img) return await sendMsg(env, budget, chatId, L(env, 'm0w4e92h', EMOJI.err));
        const fd = new FormData();
        fd.append('chat_id', String(chatId));
        fd.append('photo', new Blob([appB64Bytes(img.b64)], { type: img.mime || 'image/png' }), 'gallery.png');
        fd.append('parse_mode', 'HTML');
        fd.append('caption', '🖼 ' + esc(String(item.prompt || L(env, 'm1if2w6h')).slice(0, 900)));
        try { await tg(env, budget, 'sendPhoto', null, fd); } catch (e) { await logErr(env, 'gallery_send', e); }
        return true;
      }
      const rows = list.map((x, i) => esc(num(i + 1) + '. ' + String(x.prompt || L(env, 'm1if2w6h')).slice(0, 60))).join('\n');
      return await sendMsg(env, budget, chatId,
        L(env, 'm1pm7ic1', num(list.length), rows));
    }
    /* ── v5.4: خلاصه‌ساز هوشمند ── */
    case '/sum': {
      if (!toolAvailable(env, 'sum')) return await sendMsg(env, budget, chatId, L(env, 'm0sum_off'));
      /* منبع: ریپلای، آرگومان متن، یا آخرین خروجی گفتگو */
      let src = arg.trim();
      let title = '';
      const rp = m.reply_to_message;
      if (!src && rp && (rp.text || rp.caption)) src = String(rp.text || rp.caption);
      if (!src) {
        /* آخرین پیام دستیار در این گفتگو */
        const h = await histGet(env, scope);
        for (let i = h.msgs.length - 1; i >= 0; i--) {
          if (h.msgs[i].role !== 'user' && h.msgs[i].content) { src = String(h.msgs[i].content); break; }
        }
        title = L(env, 'm08mh1dc');
      }
      if (!src.trim()) return await sendMsg(env, budget, chatId, L(env, 'm0qwnp48'));
      const limit = await checkDailyLimit(env, uid, u.st);
      if (limit) return await sendMsg(env, budget, chatId, limit);
      const typing = startTyping(env, chatId);
      try {
        await typingOn(env, budget, chatId);
        const res = await summarizeText(env, u.st.model, u.st, src, { title });
        const parts = chunkText(mdToHtml(L(env, 'm125ytt6', res.reduced ? ' <i>(' + num(res.parts) + L(env, 'm06ta784') : '', res.text || L(env, 'm0q7ytpb'), res.cut ? L(env, 'm13tao4t') + num(CFG.SUM_MAX_PARTS * CFG.SUM_CHUNK) + L(env, 'm1h6doxp') : '')));
        await sendMsg(env, budget, chatId, parts[0]);
        for (let i = 1; i < parts.length; i++) await sendMsg(env, budget, chatId, parts[i]);
        await bumpUsage(env, uid, est(src), est(res.text || ''));
      } catch (e) {
        await logErr(env, 'sum', e);
        await sendMsg(env, budget, chatId, L(env, 'm0c85s0a', EMOJI.err, esc(String((e && e.message) || e).slice(0, 220))));
      } finally { typing.stop = true; }
      return true;
    }
    /* ── v5.4: تودولیست ── */
    case '/todo': {
      const a2 = arg.trim();
      if (!a2 || /^(list|لیست|همه)$/i.test(a2)) {
        const arr = await todoGet(env, uid);
        if (!arr.length) return await sendMsg(env, budget, chatId, L(env, 'm1c1m55m'));
        const lines = arr.map((x, i) => (x.done ? '✅ ' : '⬜ ') + num(i + 1) + '. ' + esc(x.t)).join('\n');
        return await sendMsg(env, budget, chatId, L(env, 'm1c9x46b', num(arr.filter((x) => !x.done).length), lines));
      }
      let mm2 = /^(done|انجام|تیک)\s+(\d+)$/i.exec(a2);
      if (mm2) {
        const arr = await todoGet(env, uid);
        const i = +mm2[2] - 1;
        if (!arr[i]) return await sendMsg(env, budget, chatId, L(env, 'm080aqqz', EMOJI.err));
        arr[i].done = !arr[i].done;
        await todoPut(env, uid, arr);
        return await sendMsg(env, budget, chatId, (arr[i].done ? L(env, 'm15od1xf', EMOJI.ok) : L(env, 'm1bsefql')) + esc(arr[i].t));
      }
      mm2 = /^(del|حذف)\s+(\d+)$/i.exec(a2);
      if (mm2) {
        const arr = await todoGet(env, uid);
        const i = +mm2[2] - 1;
        if (!arr[i]) return await sendMsg(env, budget, chatId, L(env, 'm080aqqz', EMOJI.err));
        const rm = arr.splice(i, 1)[0];
        await todoPut(env, uid, arr);
        return await sendMsg(env, budget, chatId, L(env, 'm02h4m74', esc(rm.t)));
      }
      if (/^(clear|پاک)$/i.test(a2)) {
        await todoPut(env, uid, []);
        return await sendMsg(env, budget, chatId, L(env, 'm1nqv4pm', EMOJI.ok));
      }
      const it = await todoAdd(env, uid, a2);
      if (!it) return await sendMsg(env, budget, chatId, L(env, 'm03lhvxb', EMOJI.err));
      const arr = await todoGet(env, uid);
      return await sendMsg(env, budget, chatId, L(env, 'm04pv010', EMOJI.ok, esc(it.t), num(arr.filter((x) => !x.done).length)));
    }
    /* ── v5.4: تسک‌های زمان‌بندی‌شده با AI ── */
    case '/task': {
      const a3 = arg.trim();
      if (!a3 || /^(list|لیست)$/i.test(a3)) {
        const list = await taskList(env, uid);
        if (!list.length) return await sendMsg(env, budget, chatId,
          L(env, 'm1hxe77c'));
        const lines = list.map((t, i) => {
          const d = new Date((t.at || 0) + 210 * 60000);
          const hh = String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0');
          return num(i + 1) + '. ' + repeatLabel(env, t.repeat) + ' ' + hh + ' — ' + esc(String(t.prompt).slice(0, 60));
        }).join('\n');
        return await sendMsg(env, budget, chatId, L(env, 'm0d3w221', num(list.length), lines));
      }
      let md = /^(del|حذف)\s+(\d+)$/i.exec(a3);
      if (md) {
        const list = await taskList(env, uid);
        const t = list[+md[2] - 1];
        if (!t) return await sendMsg(env, budget, chatId, L(env, 'm080aqqz', EMOJI.err));
        await taskDel(env, uid, t.id);
        return await sendMsg(env, budget, chatId, L(env, 'm1nwlaw0'));
      }
      const parsed = parseRemind(a3);
      if (!parsed) return await sendMsg(env, budget, chatId,
        L(env, 'm0lcog11'));
      const list = await taskList(env, uid);
      if (list.length >= CFG.TASK_MAX) return await sendMsg(env, budget, chatId, L(env, 'm11dawz9', num(CFG.TASK_MAX)));
      /* متن پرامپت: حذف عبارت زمان از ابتدای متن */
      const tt = { uid, chat: chatId, id: 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4), prompt: parsed.txt.replace(/^\s+|\s+$/g, '').slice(0, CFG.TASK_PROMPT_MAX), repeat: parsed.repeat || 'none', step: parsed.step, day: parsed.day, at: parsed.at, ts: Date.now() };
      if (!tt.prompt) tt.prompt = a3.slice(0, CFG.TASK_PROMPT_MAX);
      await taskSave(env, tt);
      const dd = new Date(tt.at + 210 * 60000);
      return await sendMsg(env, budget, chatId, L(env, 'm0nl90pu', EMOJI.ok, repeatLabel(env, tt.repeat), dd.getUTCHours(), String(dd.getUTCMinutes()).padStart(2, '0'), esc(tt.prompt.slice(0, 120))));
    }
    /* ── v5.4: جستجوی حافظه ── */
    case '/memfind': {
      const qm = arg.trim();
      if (!qm) return await sendMsg(env, budget, chatId, L(env, 'm06pteoj'));
      const res = await memSearch(env, uid, qm);
      if (!res.length) return await sendMsg(env, budget, chatId, L(env, 'm04vqfrq', esc(qm)));
      const lines = res.map((x, i) => num(i + 1) + '. ' + (x.tag ? '<b>[' + esc(x.tag) + ']</b> ' : '') + esc(x.t)).join('\n');
      return await sendMsg(env, budget, chatId, L(env, 'm0ukz3bq', num(res.length), lines));
    }
    /* ── v5.4: ویرایش عکس با توضیح (روی ریپلای عکس) ── */
    case '/edit': {
      const ed = arg.trim();
      if (!ed) return await sendMsg(env, budget, chatId,
        L(env, 'm0frncj9'));
      const rpImg = m.reply_to_message;
      const sizes = [];
      if (rpImg && Array.isArray(rpImg.photo) && rpImg.photo.length) sizes.push(rpImg.photo[rpImg.photo.length - 1]);
      if (Array.isArray(m.photo) && m.photo.length) sizes.push(m.photo[m.photo.length - 1]);
      if (!sizes.length) return await sendMsg(env, budget, chatId,
        L(env, 'm0w8486t'));
      if (u.st.imgGen === false) return await sendMsg(env, budget, chatId, L(env, 'm0wbseun'));
      const lim2 = await checkDailyLimit(env, uid, u.st);
      if (lim2) return await sendMsg(env, budget, chatId, lim2);
      const q2 = await quotaTake(env, uid, 'img');
      if (q2) return await sendMsg(env, budget, chatId, q2);
      const typing = startTyping(env, chatId);
      try {
        await typingOn(env, budget, chatId);
        const imgs = [];
        for (const sz of sizes.slice(0, CFG.IMG_EDIT_MAX_N)) {
          const im = await readTelegramPhoto(env, budget, sz);
          if (im) imgs.push({ b64: im.b64, mime: im.mime });
        }
        if (!imgs.length) return await sendMsg(env, budget, chatId, L(env, 'm1kuzdn2', EMOJI.err));
        const img = await geminiImageEdit(env, ed, imgs, u.st.imgModel || CFG.IMG_MODEL_DEFAULT);
        await quotaBump(env, uid, 'img');
        await imgGallerySave(env, uid, { b64: img.b64, mime: img.mime, prompt: '✏️ ' + ed });
        const fd = new FormData();
        fd.append('chat_id', String(chatId));
        fd.append('photo', new Blob([appB64Bytes(img.b64)], { type: img.mime || 'image/png' }), 'behrad-edit.png');
        fd.append('parse_mode', 'HTML');
        fd.append('caption', '🖌 ' + esc(ed.slice(0, 900)) + '\n<i>' + esc(img.via || '') + '</i>');
        await tg(env, budget, 'sendPhoto', null, fd);
        await bumpUsage(env, uid, est(ed) + 1000, 0);
      } catch (e) {
        await logErr(env, 'img_edit', e);
        await sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(String((e && e.message) || e).slice(0, 300)));
      } finally { typing.stop = true; }
      return true;
    }
    case '/translate': {
      if (!toolAvailable(env, 'translate')) return await sendMsg(env, budget, chatId, L(env, 'm0tr_off'));
      if (!q) return await sendMsg(env, budget, chatId,
        L(env, 'm1alst2r'));
      const trLim = await checkDailyLimit(env, uid, u.st);
      if (trLim) return await sendMsg(env, budget, chatId, trLim);
      const typing = startTyping(env, chatId);
      try {
        await typingOn(env, budget, chatId);
        /* تک‌باره و بدون ثبت در تاریخچه: buildMessages تاریخچه را می‌خواند ولی
           histPut فقط در runChatReply انجام میشود، پس تاریخچه تمیز می‌ماند. */
        const { msgs } = await buildMessages(env, u.st, scope, null, pick(env, TRANSLATE_SYS, TRANSLATE_SYS_EN), knownCtx(u.st.model), uid);
        msgs.push({ role: 'user', content: q });
        const r = await aiChat(env, u.st.model, msgs, { temperature: 0.2, maxTokens: u.st.maxTokens, ...cbOff(u.st) });
        const parts = chunkText(mdToHtml(r.text));
        await sendMsg(env, budget, chatId, '🌐 ' + parts[0]);
        for (let i = 1; i < parts.length; i++) await sendMsg(env, budget, chatId, parts[i]);
        await bumpUsage(env, uid, est(q) + 800, (r.usage && r.usage.completion_tokens) || est(r.text));
      } catch (e) {
        await sendMsg(env, budget, chatId, EMOJI.err + ' ' + esc(String((e && e.message) || e).slice(0, 220)));
      } finally { typing.stop = true; }
      return true;
    }
    case '/remember': {
      if (!arg.trim()) return await sendMsg(env, budget, chatId, L(env, 'm07b2ga0'));
      const ok = await memAdd(env, uid, arg.trim());
      return await sendMsg(env, budget, chatId, ok ? L(env, 'm16pccr9', EMOJI.ok) : L(env, 'm1y16hbu'));
    }
    case '/forget': {
      const a = arg.trim();
      if (!a || a === 'all') { await memPut(env, uid, []); return await sendMsg(env, budget, chatId, L(env, 'm13u55s5', EMOJI.ok)); }
      const n = parseInt(normDigits(a).replace(/[^0-9]/g, ''), 10);
      const arr = await memGet(env, uid);
      if (n >= 1 && n <= arr.length) { arr.splice(n - 1, 1); await memPut(env, uid, arr); return await sendMsg(env, budget, chatId, L(env, 'm1vnpove', EMOJI.ok, n)); }
      return await sendMsg(env, budget, chatId, L(env, 'm0fwcdxf', EMOJI.err));
    }
    case '/memory': {
      const arr = await memGet(env, uid);
      if (!arr.length) return await sendMsg(env, budget, chatId, L(env, 'm0fgs1co'));
      return await sendMsg(env, budget, chatId, L(env, 'm00e9yn3', arr.length, arr.map((x, i) => (i + 1) + '. ' + esc(x.t)).join('\n')));
    }
    case '/brief': {
      u.st.briefing = u.st.briefing === false;
      await putUser(env, uid, u);
      if (u.st.briefing === false) return await sendMsg(env, budget, chatId, L(env, 'm0ajkdai'));
      await sendMsg(env, budget, chatId, L(env, 'm1e9jws6'));
      try { await sendMorningBriefing(env, uid, chatId); } catch {}
      return true;
    }
  }
  return false;
}
