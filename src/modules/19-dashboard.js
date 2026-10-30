/* ═══════════════════════════════════════════════════════════════
   behrad-ai — 19-dashboard
   وب‌داشبورد 🌐 + API پشت داشبورد
   ─────────────────────────────────────────────────────────────
   بخشی از سورسِ ماژولار. با «npm run build» به worker.js (تک‌فایلِ
   استقرار) بسته می‌شود. همهٔ فایل‌های src/modules یک دامنهٔ سراسریِ
   مشترک دارند؛ ترتیبشان در src/modules/manifest.json است.
   ═══════════════════════════════════════════════════════════════ */
/* ═══════════════════ وب‌داشبورد 🌐 ═══════════════════ */
const DASH_CSS = [
  '*{box-sizing:border-box;margin:0;padding:0}',
  "body{font-family:'Segoe UI',Tahoma,sans-serif;background:#0f1117;color:#e2e4ea;direction:rtl;min-height:100vh}",
  '.wrap{max-width:860px;margin:0 auto;padding:24px 16px 60px}',
  'h1{font-size:1.35rem;margin-bottom:4px}',
  '.sub{color:#8b90a0;font-size:.85rem;margin-bottom:20px}',
  '.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin-top:16px}',
  '.card{background:#181b25;border:1px solid #2a2e3d;border-radius:14px;padding:18px}',
  '.card h3{font-size:.98rem;margin-bottom:10px}',
  '.big{font-size:1.45rem;font-weight:700;color:#a78bfa}',
  '.row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #232736;font-size:.88rem}',
  '.row:last-child{border-bottom:none}',
  "button{background:#7c3aed;color:#fff;border:none;border-radius:9px;padding:9px 18px;font-family:inherit;font-size:.87rem;cursor:pointer}",
  'button:hover{background:#8b5cf6}',
  'button.gray{background:#2a2e3d}',
  "input,select{width:100%;background:#10131c;border:1px solid #2a2e3d;color:#e2e4ea;border-radius:9px;padding:10px;font-family:inherit;font-size:.9rem;margin-top:6px}",
].join('\n');

function dashLoginPage(env, err) {
  return L(env, 'm01abs39', DASH_CSS, err ? '<div class="sub" style="color:#f87171;margin-top:10px">' + err + '</div>' : '');
}

/* توکن داشبورد: رشته تصادفی در کوکی HttpOnly + همان در D1 با عمر ۳۰ روز */
function dashCookieTok(req) {
  const c = req.headers.get('Cookie') || '';
  const m = /(?:^|;\s*)dsh=([A-Fa-f0-9]{16,})/.exec(c);
  return m ? m[1] : '';
}
async function dashAuthed(env, req) {
  const t = dashCookieTok(req);
  if (!t) return false;
  return !!(await kvGet(env, 'dsk:' + t, null));
}
async function dashRateLimited(env, req) {
  const ip = String(req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || 'na')
    .split(',')[0].trim().slice(0, 64) || 'na';
  const lk = 'lg:' + hash32(ip);
  const W = CFG.LOGIN_WINDOW_S * 1000;
  const now = Date.now();
  const cnt = await kvGet(env, lk, { n: 0, ts: 0 });
  const fresh = cnt.ts && (now - cnt.ts) < W;
  return { ok: !(cnt.n >= CFG.LOGIN_MAX_TRY && fresh), lk, n: fresh ? cnt.n : 0, ts: fresh ? cnt.ts : now, W, now };
}

function dashAppPage(env) {
  const js = L(env, 'm1n9q4z9');
  return L(env, 'm1jgwrok', DASH_CSS, js);
}

/* ═══════════════════ API پشت داشبورد 🌐 ═══════════════════ */
function jsonRes(obj, status = 200) {
  return new Response(J(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}

async function dashApiHandler(env, req) {
  const u = new URL(req.url);
  const pw = env.DASHBOARD_PASSWORD || '';
  if (!pw) return jsonRes({ error: L(env, 'm1b0wm64') }, 503);
  /* احراز هویت با کوکی نشست (نه ?t= رمز در URL) */
  if (!(await dashAuthed(env, req))) return jsonRes({ error: 'unauthorized' }, 401);

  const uid = String(env.ADMIN_ID);
  let body = {};
  try { body = await req.json(); } catch {}
  const uu = await getUser(env, uid);
  const scopeMain = 'c' + env._dashChat + ':main';

  if (u.pathname === '/api/state') {
    const t0 = tehran();
    const us = await kvGet(env, 'us:' + uid, {});
    const h = await histGet(env, scopeMain);
    const errs = await kvGet(env, 'lg', []);
    const entries = await getAllModelEntries(env);
    const curEntry = await resolveModel(env, uu.st.model);
    return jsonRes({
      version: VERSION,
      modelName: curEntry.name,
      provLabel: curEntry.prov === 'cf' ? L(env, 'm05vbixl') : '🔌 ' + curEntry.provName,
      ctxK: Math.round(curEntry.ctx / 1000),
      model: curEntry.key,
      temperature: uu.st.temperature,
      maxTokens: uu.st.maxTokens,
      dailyLimit: uu.st.dailyLimit,
      today: {
        msgs: us.d === t0.ymd ? us.msgs || 0 : 0,
        tin: us.d === t0.ymd ? us.tin || 0 : 0,
        tout: us.d === t0.ymd ? us.tout || 0 : 0,
      },
      hasAiBinding: !!(env.AI && typeof env.AI.run === 'function'),
      hasDb: !!env.DB,
      webhook: env._whInfo || L(env, 'm001frqm'),
      histLen: h.msgs.length,
      models: entries.map((m) => ({ key: m.key, label: m.name + ' (' + Math.round(m.ctx / 1000) + 'K)', prov: m.prov === 'cf' ? 'Workers AI' : m.provName })),
      providers: (await provAll(env)).map((r) => ({ name: r.name, n: (r.models || []).length, base: r.base, keyMask: maskKey(r.key) })),
      errors: errs.slice(0, 10),
    });
  }

  if (u.pathname === '/api/settings') {
    const st = uu.st;
    if (typeof body.temperature === 'number') st.temperature = Math.min(2, Math.max(0, body.temperature));
    if (typeof body.maxTokens === 'number') st.maxTokens = Math.min(8192, Math.max(256, Math.round(body.maxTokens)));
    if (typeof body.dailyLimit === 'number') st.dailyLimit = Math.min(100000, Math.max(0, Math.round(body.dailyLimit)));
    if (typeof body.model === 'string' && body.model) {
      // مدل باید کلید canonical معتبر باشد (کلادفلر با مدارای قبلی؛ کاستوم باید سرویس موجود باشد)
      const cm = await canonModel(env, body.model);
      if (cm.changed && !String(body.model).startsWith('@cf/')) return jsonRes({ ok: false, error: 'bad_model' });
      st.model = cm.key;
    }
    if (body.clearHist) await histPut(env, scopeMain, { msgs: [], used: 0 });
    await putUser(env, uid, uu);
    return jsonRes({ ok: true });
  }

  if (u.pathname === '/api/ping') {
    const out = {};
    /* Workers AI */
    const s = Date.now();
    let aiok = false;
    try {
      if (env.AI && typeof env.AI.run === 'function') {
        await env.AI.run(CF_FALLBACK_MODEL, { messages: [{ role: 'user', content: 'ping' }], max_tokens: 1 });
        aiok = true;
      }
    } catch {}
    out.workersai = aiok ? Date.now() - s : false;
    /* تلگرام */
    const s2 = Date.now();
    let tgok = false;
    try { tgok = (await fetchT(TG_BASE + '/bot' + env.TELEGRAM_BOT_TOKEN + '/getMe', { method: 'POST' }, 8000)).ok; } catch {}
    out.telegram = tgok ? Date.now() - s2 : false;
    return jsonRes(out);
  }

  if (u.pathname === '/api/exporttxt') {
    const h = await histGet(env, scopeMain);
    let out = L(env, 'm04u1206', tehran().ymd, '─'.repeat(40));
    for (const m of h.msgs) out += (m.role === 'user' ? L(env, 'm1drkjyx') : L(env, 'm0jfrd9p')) + String(m.content || '') + '\n\n';
    return new Response(out, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Disposition': 'attachment; filename="chat.txt"' },
    });
  }

  return jsonRes({ error: 'not_found' }, 404);
}
