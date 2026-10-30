/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 22b-messages
   پیام‌ها: onMessage، دستورات، پیوست‌ها، تشخیص یادآور
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
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
