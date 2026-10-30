/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 24-inline-mode
   حالت اینلاین 💬
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ حالت اینلاین 💬 ═══════════════════ */
async function onInlineQuery(env, upd) {
  const iq = upd.inline_query;
  const uid = String(iq.from.id);
  if (!(await isAllowed(env, uid))) {
    try {
      await fetchT(TG_BASE + '/bot' + env.TELEGRAM_BOT_TOKEN + '/answerInlineQuery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: J({ inline_query_id: iq.id, results: [], cache_time: 1 }),
      }, 8000);
    } catch {}
    return;
  }
  const q = String(iq.query || '').trim();
  if (q.length < 3 || normCmd(q).startsWith('/')) {
    try {
      await fetchT(TG_BASE + '/bot' + env.TELEGRAM_BOT_TOKEN + '/answerInlineQuery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: J({
          inline_query_id: iq.id, cache_time: 5,
          results: [{
            type: 'article', id: 'hint', title: L(env, 'm1f1b1sd'),
            description: L(env, 'm1sx0npz'),
            input_message_content: { message_text: L(env, 'm1ujmzgb') },
          }],
        }),
      }, 8000);
    } catch {}
    return;
  }
  /* سوال موقتاً ذخیره میشود؛ جواب واقعی هنگام chosen_inline_result ساخته میشود */
  const qid = 'iq:' + hash32(uid + q);
  await kvPut(env, qid, { uid, q, at: Date.now() }, 1800);
  try {
    await fetchT(TG_BASE + '/bot' + env.TELEGRAM_BOT_TOKEN + '/answerInlineQuery', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: J({
        inline_query_id: iq.id, cache_time: 1,
        results: [{
          type: 'article', id: hash32(q),
          title: L(env, 'm0x74pip', q.slice(0, 60)),
          description: L(env, 'm1qajgbf'),
          input_message_content: { message_text: L(env, 'm1pkarij', esc(q.slice(0, 80))), parse_mode: 'HTML' },
        }],
      }),
    }, 8000);
  } catch {}
}

async function onChosenInline(env, res) {
  /* 🔒 v5.4: دسترسی و مالکیت کوئری دوباره چک می‌شود — کار در نتایج
     اینلاین ممکن است ساعتی قدیمی باشد و کاربر در این فاصله از لیست مجاز
     حذف شده باشد؛ ضمناً رکورد iq: باید مال همین فرستنده باشد. */
  if (!(await isAllowed(env, String(res.from.id)))) return;
  const qid = 'iq:' + hash32(res.from.id + res.query);
  const v = await kvGet(env, qid, null);
  if (!v || String(v.uid) !== String(res.from.id)) return;
  await kvDel(env, qid);
  const u = await getUser(env, v.uid);
  const scope = 'c' + res.from.id + ':' + u.thread;
  /* پاسخ به‌صورت پیام جدا فرستاده میشود چون ویرایش پیام اینلاین ممکن نیست */
  const budget = newBudget(CFG.TG_BUDGET_MSG);
  await runChatReply(env, budget, res.from.id, v.uid, scope, u.st, v.q, {});
}
