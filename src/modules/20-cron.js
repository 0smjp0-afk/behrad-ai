/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 20-cron
   خلاصهٔ صبحگاهی + Cron (یادآور/هشدار مدل جدید) ⏰
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ v4.5: خلاصه صبحگاهی ۱۰ تهران ═══════════════════ */
async function sendMorningBriefing(env, uid, chatId) {
  const budget = newBudget(10);
  try {
    const u = await getUser(env, uid);
    if (u.st && u.st.briefing === false) return;
    // یادآورهای امروز همین کاربر
    const keys = await kvList(env, 'rm:');
    const mine = [];
    for (const k of keys) {
      const v = await kvGet(env, k, null);
      if (v && v.uid === uid) mine.push(v);
    }
    mine.sort((a, b) => a.at - b.at);
    const t = tehran();
    const todayLines = mine.slice(0, 10).map((r) => {
      const d = new Date(r.at + 210 * 60000);
      return '- ' + d.getUTCHours() + ':' + String(d.getUTCMinutes()).padStart(2, '0') + ' ' + r.txt + (r.repeat === 'daily' ? L(env, 'm15kn5cf') : '');
    });
    let wx = '';
    try { wx = await toolWeather(env); } catch (e) { wx = L(env, 'm0snzrp4'); }
    let mem = '';
    try { mem = await memText(env, uid); } catch {}
    const ctxMsg = L(env, 'm19l14ca', todayLines.length ? todayLines.join('\n') : L(env, 'm0mukgq6'), wx, mem ? L(env, 'm1ecmit3') + mem : '');
    let summary = '';
    try {
      const r = await aiChatCf(env, CF_FALLBACK_MODEL, [
        { role: 'system', content: L(env, 'm1c9h1d6', buildSystemPrompt(u.st)) },
        { role: 'user', content: L(env, 'm0n3mzk9', t.ymd, ctxMsg) },
      ], { temperature: 0.7, maxTokens: 900 });
      summary = String((r && r.text) || '');
    } catch (e) { summary = ''; }
    const body = L(env, 'm1rk4h7r', t.ymd, summary ? mdToHtml(summary) : esc(ctxMsg), mine.length);
    const parts = chunkText(body);
    for (const p of parts) await sendMsg(env, budget, chatId, p);
  } catch (e) { await logErr(env, 'brief', e); }
}

/* ═══════════════════ Cron: یادآور ⏰ + هشدار مدل جدید 🔔 ═══════════════════ */
async function cronTick(env) {
  /* یادآورهای سررسیده (v4.5: تکرار روزانه scheduling مجدد) */
  const now = Date.now();
  const keys = await kvList(env, 'rm:');
  for (const k of keys) {
    const r = await kvGet(env, k, null);
    if (!r) continue;
    if (r.at > now) continue;
    const rep = r.repeat || 'none';
    if (rep === 'daily' || rep === 'weekly' || rep === 'interval' || rep === 'monthly') {
      const dd = new Date(r.at + 210 * 60000);
      if (rep === 'monthly') {
        /* 🔧 v5.4: اگر یادآور مدتی اجرا نشده باشد (ورکر خواب/خطا)، یک بار
           جلو بردن ماه هنوز در گذشته می‌ماند و همان لحظه دوباره شلیک می‌شد.
           حالا تا رسیدن به آینده جلو می‌رود (سقف ۶۰ پرش). */
        let guardM = 0;
        r.at = nextMonthEpoch(dd.getUTCFullYear(), dd.getUTCMonth() + 1, r.day || dd.getUTCDate(), dd.getUTCHours(), dd.getUTCMinutes());
        while (r.at <= now && guardM++ < 60) {
          const nd = new Date(r.at + 210 * 60000);
          r.at = nextMonthEpoch(nd.getUTCFullYear(), nd.getUTCMonth() + 1, r.day || nd.getUTCDate(), nd.getUTCHours(), nd.getUTCMinutes());
        }
      } else {
        const stepDays = rep === 'weekly' ? 7 : rep === 'interval' ? Math.max(1, r.step || 1) : 1;
        r.at = r.at + stepDays * 86400000;
        while (r.at <= now) r.at += stepDays * 86400000;
      }
      await kvPut(env, k, r, Math.max(60, Math.ceil((r.at - Date.now()) / 1000) + 300));
    } else {
      await kvDel(env, k);
    }
    if (!r.chat) continue;
    const b = newBudget(5);
    try {
      await sendMsg(env, b, r.chat, L(env, 'm0u0w588', rep !== 'none' ? ' ' + repeatLabel(env, rep) : '', esc(r.txt)));
    } catch (e) { await logErr(env, 'remind', e); }
  }

  /* جاروب کلیدهای منقضی — D1 انقضای خودکار ندارد؛ ساعتی یکبار کافی است
     (هر دقیقه اجرا شود بی‌دلیل سطر می‌خواند و سهمیه مصرف میشود) */
  if (env.DB && tehran().min === 0) {
    try { await env.DB.prepare('DELETE FROM kv WHERE exp > 0 AND exp < ?').bind(Date.now()).run(); } catch {}
  }

  /* خلاصه صبحگاهی — ساعت ۱۰ تهران، روزی یکبار برای هر کاربر فعال */
  try {
    const bt = tehran();
    if (bt.h === CFG.BRIEF_HOUR && bt.min < 2) {
      const flag = await kvGet(env, 'brflag', {});
      if (flag.d !== bt.ymd) {
        await kvPut(env, 'brflag', { d: bt.ymd }, 172800);
        const targets = [];
        try {
          const adminU = String(env.ADMIN_ID || '');
          if (adminU) {
            const au = await getUser(env, adminU);
            const ac = (au && au.lastChat) || env.ADMIN_ID;
            if (au.st.briefing !== false) targets.push({ uid: adminU, chat: ac });
          }
        } catch {}
        try {
          const al = await kvGet(env, 'al', []);
          for (const id of al || []) {
            try {
              const uu = await getUser(env, String(id));
              if (uu.st.briefing === false) continue;
              if (uu.lastChat) targets.push({ uid: String(id), chat: uu.lastChat });
            } catch {}
          }
        } catch {}
        for (const tg of targets.slice(0, 20)) {
          try { await sendMorningBriefing(env, tg.uid, tg.chat); } catch (e) { await logErr(env, 'brief_send', e); }
        }
      }
    }
  } catch (e) { await logErr(env, 'brief_cron', e); }

  /* ⏳ تسک‌های زمان‌بندی‌شده با AI — هر task که at آن رسیده باشد یک بار
     اجرا و دوباره زمان‌بندی (یا حذف) میشود. کلیدها زیر task:<uid>: هستند
     و چون هر کاربر کلید خودش را دارد، پیمایش همه برای cron لازم است. */
  try {
    const tks = await kvList(env, 'task:');
    for (const k of tks) {
      const t = await kvGet(env, k, null);
      if (!t || !t.prompt || !t.at || t.at > now) continue;
      const nb = newBudget(8);
      /* زمان بعدی را قبل از اجرا حساب کن تا خطای مدل باعث تکرار بی‌پایان نشود */
      const rep = t.repeat || 'once';
      const dd = new Date(t.at + 210 * 60000);
      let next = 0;
      if (rep === 'daily') next = t.at + 86400000;
      else if (rep === 'weekly') next = t.at + 7 * 86400000;
      else if (rep === 'interval') next = t.at + Math.max(1, t.step || 1) * 86400000;
      else if (rep === 'monthly') next = nextMonthEpoch(dd.getUTCFullYear(), dd.getUTCMonth() + 1, t.day || dd.getUTCDate(), dd.getUTCHours(), dd.getUTCMinutes());
      if (next) {
        /* 🔧 v5.4: قبلاً برای ماهانه، داخل حلقه دوباره از همان dd حساب
           میشد و اگر یک ماه هم عقب بود، مقدار عوض نمیشد → حلقهٔ بی‌پایان
           و قطع ورکر. الان ماه‌به‌ماه جلو می‌رود و سقف ۶۰ پرش دارد. */
        let guard = 0;
        while (next <= now && guard++ < 60) {
          if (rep === 'monthly') {
            const nd = new Date(next + 210 * 60000);
            next = nextMonthEpoch(nd.getUTCFullYear(), nd.getUTCMonth() + 1, t.day || nd.getUTCDate(), nd.getUTCHours(), nd.getUTCMinutes());
          } else next += (rep === 'weekly' ? 7 : rep === 'interval' ? Math.max(1, t.step || 1) : 1) * 86400000;
        }
        t.at = next;
        await taskSave(env, t);
      } else {
        await kvDel(env, k);
      }
      /* اجرای پرامپت — با مدل کاربر یا مدل امن کلادفلر */
      let out = '';
      try {
        const tu = await getUser(env, t.uid);
        const r = await aiChat(env, (tu.st && tu.st.model) || SETTINGS_DEFAULT.model, [
          { role: 'system', content: L(env, 'm0cnnfaw', buildSystemPrompt(tu.st || SETTINGS_DEFAULT)) },
          { role: 'user', content: String(t.prompt).slice(0, CFG.TASK_PROMPT_MAX) },
        ], { temperature: 0.7, maxTokens: CFG.TASK_OUT_TOKENS, ...cbOff(tu.st) }, null);
        out = String((r && r.text) || '').trim();
      } catch (e) {
        await logErr(env, 'task_run:' + t.id, e);
        out = '';
      }
      if (!out) out = L(env, 'm1qiiekg');
      try {
        const parts = chunkText(mdToHtml(L(env, 'm1mfpwzn', rep !== 'once' ? ' ' + repeatLabel(env, rep) : '', out)));
        for (const p of parts) await sendMsg(env, nb, t.chat, p);
      } catch (e) { await logErr(env, 'task_send', e); }
    }
  } catch (e) { await logErr(env, 'task_cron', e); }

  /* 🗄 بکاپ خودکار هفتگی — یک بار در هفته فایل JSON را به Saved Messages
     ADMIN_ID می‌فرستد تا بکاپ از خودِ D1 هم بیرون بماند. */
  try {
    const bt = tehran();
    const dow = new Date(bt.y, bt.m - 1, bt.d).getDay(); // 0=یکشنبه
    if (bt.h === CFG.BK_AUTO_HOUR && bt.min < 2 && dow === CFG.BK_AUTO_DOW) {
      const flag = await kvGet(env, 'bkflag', {});
      if (flag.d !== bt.ymd) {
        await kvPut(env, 'bkflag', { d: bt.ymd }, 172800);
        const au = await getUser(env, String(env.ADMIN_ID));
        if (au.st.weeklyBackup !== false) {
          const dump = await backupGet(env, newBudget(10), env.ADMIN_ID, String(env.ADMIN_ID));
          if (dump && dump.content) {
            const b2 = newBudget(10);
            const fd = new FormData();
            fd.append('chat_id', String(env.ADMIN_ID));
            fd.append('caption', L(env, 'm19imdx9', bt.ymd));
            fd.append('document', new Blob([dump.content], { type: 'application/json' }), 'behrad-backup-' + bt.ymd + '.json');
            try { await tg(env, b2, 'sendDocument', null, fd); } catch (e) { await logErr(env, 'bk_auto', e); }
          }
        }
      }
    }
  } catch (e) { await logErr(env, 'bk_cron', e); }

  /* هشدار مدل جدید — روزی یک بار، حدود ۹ صبح به وقت تهران
     (ساعت/دقیقه را همین‌جا عوض کنی؛ فقط مدل‌های کلادفلر بررسی میشوند —
     سرویس‌های کاستوم هرگز از cron پولی نمی‌شوند و فقط دستی کاوش میشوند) */
  const t = tehran();
  if (t.h !== 9 || t.min >= 2) return;

  const flag = await kvGet(env, 'mkflag', {});
  if (flag.d === t.ymd) return; // امروز انجام شد
  await kvPut(env, 'mkflag', { d: t.ymd }, 172800);

  const known = await kvGet(env, 'mk', null);
  let ids = [];
  try { ids = await fetchCfChatModels(env); } catch {}
  if (!ids.length) return;
  const cur = {};
  for (const id of ids) cur[id] = 1;
  await kvPut(env, 'mk', cur);

  if (!known) return; // اولین اجرا فقط ثبت میکند
  const added = Object.keys(cur).filter((x) => !known[x]);
  if (!added.length) return;

  const adminChat = env.ADMIN_ID;
  const b2 = newBudget(10);
  const lines = added.slice(0, 12).map((x) => '• <code>' + esc(x) + '</code>');
  try {
    await sendMsg(env, b2, adminChat,
      L(env, 'm1fxo1jq', EMOJI.spark, lines.join('\n')));
  } catch (e) { await logErr(env, 'newmodel', e); }
}
