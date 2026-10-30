/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 12-reminders
   تودولیست ✅ + تسک‌های زمان‌بندی‌شده با AI ⏳
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ v5.4: تودولیست ✅ ═══════════════════
   ساده و بدون مدل: todo:<uid> = [{id,t,done,ts}]. در گروه هم قابل استفاده
   نیست (کلید کاربری) — مثل حافظه. */
async function todoGet(env, uid) {
  const v = await kvGet(env, 'todo:' + uid, []);
  return Array.isArray(v) ? v : [];
}
async function todoPut(env, uid, arr) {
  await kvPut(env, 'todo:' + uid, arr.slice(-CFG.TODO_MAX));
}
async function todoAdd(env, uid, text) {
  const t = String(text || '').trim().slice(0, CFG.TODO_TEXT_MAX);
  if (!t) return null;
  const arr = await todoGet(env, uid);
  const it = { id: 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4), t, done: false, ts: Date.now() };
  arr.push(it);
  await todoPut(env, uid, arr);
  return it;
}

/* ═══════════════════ v5.4: تسک‌های زمان‌بندی‌شده با AI ⏳ ═══════════════════
   «هر روز ۸ صبح اخبار AI را خلاصه کن» → cron همان پرامپت را اجرا و
   نتیجه را می‌فرستد. کلید: task:<uid>:<id> = {id, prompt, chat, repeat, at,
   step, day, hour, min, ts}. repeat: daily|weekly|interval|monthly|once */
async function taskList(env, uid) {
  const keys = await kvList(env, 'task:' + uid + ':');
  const out = [];
  for (const k of keys) {
    const v = await kvGet(env, k, null);
    if (v && v.prompt) out.push(v);
  }
  out.sort((a, b) => (a.at || 0) - (b.at || 0));
  return out;
}
async function taskSave(env, t) {
  const ttl = Math.max(3600, Math.ceil(((t.at || Date.now()) - Date.now()) / 1000) + 3 * 86400);
  await kvPut(env, 'task:' + t.uid + ':' + t.id, t, ttl);
}
async function taskDel(env, uid, id) {
  const keys = await kvList(env, 'task:' + uid + ':');
  for (const k of keys) {
    const v = await kvGet(env, k, null);
    if (v && v.id === id) { await kvDel(env, k); return true; }
  }
  return false;
}
