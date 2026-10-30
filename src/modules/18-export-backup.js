/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 18-export-backup
   خروجی گفتگو 📤 + بکاپ هفتگی 🗄
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ خروجی گفتگو 📤 و بکاپ 🗄 ═══════════════════ */
async function exportChat(env, budget, chatId, uid) {
  const u = await getUser(env, uid);
  const h = await histGet(env, scopeOf(chatId, u, false));
  if (!h.msgs.length) {
    try { await editMsg(env, budget, chatId, env._menuMsg, L(env, 'm1szivj4'), [[{ text: L(env, 'm1v7msmb'), callback_data: 'home' }]]); } catch {}
    return;
  }
  let out = L(env, 'm09ni6ew', curThread(u).name, VERSION, tehran().ymd, '─'.repeat(40));
  for (const m of h.msgs) out += (m.role === 'user' ? L(env, 'm0bap9el') : L(env, 'm0u2g2jv')) + String(m.content || '') + '\n\n';
  const fd = new FormData();
  fd.append('chat_id', String(chatId));
  fd.append('caption', L(env, 'm02iqbkx', curThread(u).name, num(h.msgs.length)));
  fd.append('document', new Blob([out], { type: 'text/plain; charset=utf-8' }), 'chat-' + tehran().ymd + '.txt');
  try { await tg(env, budget, 'sendDocument', null, fd); } catch (e) { await logErr(env, 'export', e); }
}

async function backupMenu(env, budget, chatId, uid) {
  const txt = L(env, 'm077phq3');
  const kb = [
    [{ text: L(env, 'm0qdhhin'), callback_data: 'bkchats' }, { text: L(env, 'm0giln1r'), callback_data: 'bkset' }],
    [{ text: L(env, 'm1lyveyk'), callback_data: 'bkprov' }],
    [{ text: L(env, 'm02srs8j'), callback_data: 'bkmem' }],
    [{ text: L(env, 'm090xhe3'), callback_data: 'bkall' }],
    [{ text: L(env, 'm13rx1cf'), callback_data: 'bkget' }],
    [{ text: L(env, 'm1yy8oao'), callback_data: 'bkres' }],
  ];
  await menuRender(env, budget, chatId, txt, kb, 'bkup');
}

/* ── پشتیبان‌گیری انتخابی به فرمت TXT (v4.10) ──
   چرا txt جدا از بکاپ JSON: فایل JSON برای «بازگرداندن در ربات» است، ولی
   برای مطالعه/آرشیو در جای دیگر قابل‌استفاده نیست. اینجا هر بخش در یک فایل
   متنی ساده تحویل میشود.

   ⚠️ کلیدهای API: فقط بخش «سرویس‌ها» کلید واقعی را داخل فایل می‌گذارد —
   چون هدف کاربر دقیقاً همین است (نقل‌کلید بین سرویس‌ها). این فایل را همان‌طور
   که کلید را در پیام‌ها نمی‌فرستیم، اینجا هم صریح هشدار میدهیم. بقیهٔ بخش‌ها
   هیچ کلیدی ندارند. */
function bkTxtHeader(env, title) {
  const t = tehran();
  return L(env, 'm1x9y5vp', txtSafe(title), t.ymd, VERSION, '═'.repeat(46));
}
function txtSafe(s) { return String(s || '').replace(/[\r\n]+/g, ' ').slice(0, 60); }

async function backupTxtSend(env, budget, chatId, fname, content, caption) {
  const fd = new FormData();
  fd.append('chat_id', String(chatId));
  fd.append('caption', caption || L(env, 'm1xi9ykb', fname));
  fd.append('document', new Blob([content], { type: 'text/plain; charset=utf-8' }), fname);
  try { await tg(env, budget, 'sendDocument', null, fd); } catch (e) { await logErr(env, 'bk_txt', e); }
}

// گفتگوهای همهٔ ترد به‌صورت متن خوانا
async function backupChatsTxt(env, budget, chatId, uid) {
  const u = await getUser(env, uid);
  let out = bkTxtHeader(env, L(env, 'm1wezh0o'));
  for (const t of u.threads) {
    const h = await histGet(env, 'c' + chatId + ':' + t.id);
    if (!h.msgs.length) continue;
    out += L(env, 'm0pcmij0', t.name || t.id, num(h.msgs.length));
    for (const m of h.msgs) {
      out += (m.role === 'user' ? L(env, 'm0y549rx') : L(env, 'm1jhgi3v')) + ':\n' + String(m.content || '') + '\n\n';
    }
    out += '\n';
  }
  await backupTxtSend(env, budget, chatId, 'chats-' + tehran().ymd + '.txt', out, L(env, 'm1a5ofxs', tehran().ymd));
}

async function backupSettingsTxt(env, budget, chatId, uid) {
  const u = await getUser(env, uid);
  const s = u.st;
  const out = L(env, 'm02v5mwr', bkTxtHeader(env, L(env, 'm1vez5kd')), s.model, (pick(env, PERSONAS, PERSONAS_EN)[s.persona] || pick(env, PERSONAS, PERSONAS_EN)[0]).name, s.temperature, s.maxTokens, s.dailyLimit ? s.dailyLimit + L(env, 'm06cgnqj') : L(env, 'm1yk76a9'), s.autoFallback ? L(env, 'm0vplg8q') : L(env, 'm13eyrx5'), s.liveStream ? L(env, 'm0vplg8q') : L(env, 'm13eyrx5'), s.readLinks ? L(env, 'm0vplg8q') : L(env, 'm13eyrx5'), s.autoVision ? L(env, 'm0vplg8q') : L(env, 'm13eyrx5'), s.voiceReply ? L(env, 'm0vplg8q') : L(env, 'm13eyrx5'), s.searchAuto ? L(env, 'm0vplg8q') : L(env, 'm13eyrx5'), s.briefing ? L(env, 'm0vplg8q') : L(env, 'm13eyrx5'), s.imgGen === false ? L(env, 'm13eyrx5') : L(env, 'm0vplg8q'), s.imgModel || CFG.IMG_MODEL_DEFAULT, s.voiceProv === 'cf' ? L(env, 'm0zji1xq') : L(env, 'm1t25ozt'), s.voiceName || 'Kore', s.ttsModel || '', s.sttModel || '', s.imgModel || CFG.IMG_MODEL_DEFAULT, s.cbBreaker === false ? L(env, 'm13eyrx5') : L(env, 'm0vplg8q'), s.ytSum === false ? L(env, 'm13eyrx5') : L(env, 'm0vplg8q'), s.sysCustom ? L(env, 'm1bh0mq8') + s.sysCustom : L(env, 'm0pcopcc'));
  await backupTxtSend(env, budget, chatId, 'behrad-settings-' + tehran().ymd + '.txt', out, L(env, 'm10bndpe'));
}

/* سرویس‌ها + کلیدهایشان. این تنها بخشی است که کلید API را عیناً داخل فایل
   می‌گذارد — دقیقاً چیزی که برای نقل‌کلید لازم است. */
async function backupProvidersTxt(env, budget, chatId) {
  const provs = await provAll(env);
  let out = L(env, 'm1o0d33d', bkTxtHeader(env, L(env, 'm0aqi32i')));
  if (!provs.length) out += L(env, 'm02lrd99');
  for (const p of provs) {
    const keys = provKeysOf(p);
    out += '── ' + (p.name || p.pid) + ' ──\n';
    out += 'base_url: ' + (p.base || '—') + '\n';
    /* 🔧 v5.4: قبلاً کلید خام در فایل نوشته می‌شد و با قاعدهٔ «کلیدها همه‌جا
       ماسک و از بکاپ خارج» جور نبود. حالا فقط اثر انگشت (۴+۴ کاراکتر) می‌آید. */
    out += L(env, 'm1vllml2', keys.length, CFG.KEYS_PER_PROVIDER);
    keys.forEach((k, i) => { out += '  ' + (i + 1) + '. ' + maskKey(k) + '\n'; });
    out += L(env, 'm0txn918', (p.models || []).length);
    for (const m of (p.models || [])) {
      out += '  - ' + m.id + (m.ctx ? L(env, 'm16emhxl', Math.round(m.ctx / 1000)) : '') + (m.vision ? ' 👁' : '') + '\n';
    }
    out += '\n';
  }
  out += L(env, 'm0c9vplc', '═'.repeat(46));
  await backupTxtSend(env, budget, chatId, 'providers-' + tehran().ymd + '.txt', out, L(env, 'm0ewqfzt'));
}

// حافظه، یادآورها، آرشیو و پرامپت‌ها
async function backupMemTxt(env, budget, chatId, uid) {
  const u = await getUser(env, uid);
  let out = bkTxtHeader(env, L(env, 'm0ygw84s'));

  const mem = await kvGet(env, 'mem:' + uid, []);
  out += L(env, 'm1fm62qv', (mem || []).length);
  if (!(mem || []).length) out += L(env, 'm15p0q5y');
  (mem || []).forEach((m, i) => { out += (i + 1) + '. ' + String(m.t || m) + '\n'; });
  out += L(env, 'm1afmx6s');
  let rmN = 0;
  for (const k of await kvList(env, 'rm:')) {
    const v = await kvGet(env, k, null);
    if (!v || String(v.uid) !== String(uid)) continue;
    rmN++;
    const at = new Date((v.at || 0) + 210 * 60000);
    out += L(env, 'm1vkjfrw', at.getUTCHours(), String(at.getUTCMinutes()).padStart(2, '0'), v.repeat === 'daily' ? L(env, 'm15kn5cf') : '', String(v.txt || ''));
  }
  if (!rmN) out += L(env, 'm15p0q5y');

  out += L(env, 'm0yce6zh');
  const sv = await kvList(env, 'sv:' + uid + ':');
  if (!sv.length) out += L(env, 'm15p0q5y');
  for (const k of sv) {
    const v = await kvGet(env, k, null);
    if (v) out += '• ' + String(v.q || '') + '\n' + String(v.a || '') + '\n\n';
  }

  out += L(env, 'm09fpshh');
  if (!(u.pl || []).length) out += L(env, 'm15p0q5y');
  (u.pl || []).forEach((p, i) => { out += (i + 1) + '. [' + (p.k || L(env, 'm033g8c0')) + '] ' + (p.v || '') + '\n\n'; });

  await backupTxtSend(env, budget, chatId, 'memory-' + tehran().ymd + '.txt', out, L(env, 'm1rg8et5'));
}

// همهٔ بخش‌ها در یک فایل (کلیدها را هم دارد)
async function backupAllTxt(env, budget, chatId, uid) {
  const u = await getUser(env, uid);
  let out = bkTxtHeader(env, L(env, 'm1v3tg8a'));
  out += L(env, 'm1et921v');

  out += L(env, 'm0pruoaf', JSON.stringify(u.st, null, 2));

  out += L(env, 'm01nr5yu');
  for (const p of await provAll(env)) {
    out += p.name + ' | ' + (p.base || '') + '\n';
    provKeysOf(p).forEach((k, i) => { out += L(env, 'm0hu0lri', i + 1, maskKey(k)); });
    (p.models || []).forEach((m) => { out += L(env, 'm0p7vbmf', m.id); });
    out += '\n';
  }

  out += L(env, 'm13baz7k');
  for (const t of u.threads) {
    const h = await histGet(env, 'c' + chatId + ':' + t.id);
    if (!h.msgs.length) continue;
    out += '── ' + (t.name || t.id) + ' ──\n';
    for (const m of h.msgs) out += (m.role === 'user' ? L(env, 'm0pnadnz') : L(env, 'm0unnej5')) + ': ' + String(m.content || '').replace(/\n+/g, ' | ') + '\n';
    out += '\n';
  }

  const mem = await kvGet(env, 'mem:' + uid, []);
  out += L(env, 'm1damvlh');
  (mem || []).forEach((m) => { out += '• ' + String(m.t || m) + '\n'; });
  out += L(env, 'm0nds0ge');
  (u.pl || []).forEach((p) => { out += '[' + (p.k || '') + '] ' + (p.v || '') + '\n'; });

  out += L(env, 'm14rvopo');
  for (const k of await kvList(env, 'rm:')) {
    const v = await kvGet(env, k, null);
    if (!v || String(v.uid) !== String(uid)) continue;
    out += L(env, 'm0qz0gx5', String(v.txt || ''), v.at, String(v.repeat || 'none'));
  }

  await backupTxtSend(env, budget, chatId, 'behrad-full-' + tehran().ymd + '.txt', out, L(env, 'm016idmf'));
}

async function backupGet(env, budget, chatId, uid) {
  const dump = {};
  for (const pre of ['u:' + uid, 'us:' + uid, 'ua:' + uid]) dump[pre] = await kvGet(env, pre, null);
  dump.threads_hist = {};
  const u = await getUser(env, uid);
  for (const t of u.threads) dump.threads_hist[t.id] = await histGet(env, 'c' + chatId + ':' + t.id);
  dump.saved = {};
  for (const k of await kvList(env, 'sv:' + uid + ':')) dump.saved[k] = await kvGet(env, k, null);
  dump.reminders = {};
  for (const k of await kvList(env, 'rm:')) {
    const v = await kvGet(env, k, null);
    if (v && v.uid === uid) dump.reminders[k] = v;
  }
  // v4.9: حافظه بلندمدت، ویجت‌ها و جفت مقایسه هم در بکاپ — قبلاً جا مانده بود
  // و «دریافت بکاپ» خاطره‌ها و ویجت‌ها را از بین می‌برد.
  dump.memory = await kvGet(env, 'mem:' + uid, null);
  dump.widgets = await kvGet(env, 'wg:' + uid, null);
  dump.compare = await kvGet(env, 'cp:' + uid, null);
  /* v5.4: تودو و تسک‌های زمان‌بندی‌شده — بدون این‌ها بازیابی، تودوها را
     بی‌صدا پاک می‌کرد (همان اشتباهی که یک‌بار برای حافظه پیش آمد). */
  dump.todo = await kvGet(env, 'todo:' + uid, null);
  dump.tasks = {};
  for (const tk of await taskList(env, uid)) dump.tasks['task:' + uid + ':' + tk.id] = tk;
  dump._meta = { v: VERSION, at: new Date().toISOString(), uid, scope: 'c' + chatId };
  const contentFinal = J(dump);
  const fd = new FormData();
  fd.append('chat_id', String(chatId));
  fd.append('caption', L(env, 'm0matpor'));
  fd.append('document', new Blob([contentFinal], { type: 'application/json' }), 'ai-bot-backup-' + tehran().ymd + '.json');
  try { await tg(env, budget, 'sendDocument', null, fd); } catch (e) { await logErr(env, 'backup', e); }
  return { ok: true, content: contentFinal };
}

async function backupRestore(env, budget, chatId, uid, jsonText) {
  let dump;
  try { dump = JSON.parse(String(jsonText || '')); } catch { throw new Error(L(env, 'm12u9zyd')); }
  if (!dump || typeof dump !== 'object' || Array.isArray(dump)) throw new Error(L(env, 'm077i9hw'));
  /* ⚠️ کلیدها باید عیناً همان‌هایی باشند که backupGet می‌سازد: u:<uid> / us:<uid> / ua:<uid>.
     قبلاً اینجا دنبال dump.u می‌گشتیم و dump['u:'] را می‌خواندیم — در حالی که backupGet
     هرگز dump.u را نمی‌سازد؛ یعنی بازیابی یک بکاپِ سالم هم همیشه «ساختار نامشخص» می‌داد
     و حتی اگر می‌گذشت، هیچ تنظیمات/آماری برنمی‌گشت. */
  const uKey = 'u:' + uid, usKey = 'us:' + uid, uaKey = 'ua:' + uid;
  const rec = dump[uKey] || dump.u;
  if (!dump._meta || !rec || typeof rec !== 'object' || Array.isArray(rec)) {
    throw new Error(L(env, 'm1o9k8vs', uKey));
  }
  /* ⚠️ امنیت: کلیدهای داخل فایل را کاربر می‌نویسد، پس نباید مستقیم به D1 بروند.
     فقط کلیدهایی که متعلق به همین کاربرند پذیرفته میشوند — وگرنه یک JSON
     دست‌کاری‌شده می‌توانست رکورد کاربر دیگر، لیست مجاز یا سرویس‌ها را بنویسد. */
  const ownSv = 'sv:' + uid + ':';
  const okTid = /^[A-Za-z0-9_-]{1,40}$/;
  await kvPut(env, uKey, dump[uKey] || rec);
  if (dump[usKey]) await kvPut(env, usKey, dump[usKey]);
  if (dump[uaKey]) await kvPut(env, uaKey, dump[uaKey]);
  if (dump.threads_hist && typeof dump.threads_hist === 'object') {
    for (const tid of Object.keys(dump.threads_hist)) {
      if (!okTid.test(tid)) continue;
      await histPut(env, 'c' + chatId + ':' + tid, dump.threads_hist[tid]);
    }
  }
  for (const k of Object.keys(dump.saved || {})) {
    if (!k.startsWith(ownSv)) continue;
    await kvPut(env, k, dump.saved[k]);
  }
  for (const k of Object.keys(dump.reminders || {})) {
    const v = dump.reminders[k];
    if (!k.startsWith('rm:')) continue;
    if (!v || typeof v !== 'object' || String(v.uid) !== String(uid)) continue;
    await kvPut(env, k, v);
  }
  // v4.9: بازگردانی حافظه/ویجت/مقایسه (اگر در بکاپ تازه باشند)
  if (dump.memory) await kvPut(env, 'mem:' + uid, dump.memory);
  if (dump.widgets) await kvPut(env, 'wg:' + uid, dump.widgets);
  if (dump.compare) await kvPut(env, 'cp:' + uid, dump.compare);
  /* 🔧 v5.4: تودو و تسک‌ها هم در بکاپ هستند و باید برگردند — وگرنه
     بازیابی، تودوهای فعلی را با نسخهٔ قدیمی جایگزین/پاک می‌کرد.
     کلیدها فقط وقتی پذیرفته می‌شوند که دقیقاً مال همین کاربر باشند. */
  if (Array.isArray(dump.todo)) {
    const clean = dump.todo.filter((x) => x && typeof x.t === 'string').slice(-CFG.TODO_MAX)
      .map((x) => ({ id: String(x.id || ('d' + hash32(x.t + Math.random()))).slice(0, 24), t: String(x.t).slice(0, CFG.TODO_TEXT_MAX), done: !!x.done, ts: +x.ts || Date.now() }));
    await kvPut(env, 'todo:' + uid, clean);
  }
  if (dump.tasks && typeof dump.tasks === 'object') {
    const ownTask = 'task:' + uid + ':';
    for (const k of Object.keys(dump.tasks)) {
      if (!k.startsWith(ownTask)) continue;
      const v = dump.tasks[k];
      if (!v || typeof v !== 'object' || !v.prompt || String(v.uid) !== String(uid)) continue;
      await taskSave(env, v);
    }
  }
  return true;
}
