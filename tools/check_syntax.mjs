#!/usr/bin/env node
/* ═══ بررسی نحوی + شناسایی ارجاع‌های آزاد (undefined) ═══
   ورودی: فایل سورس. APP_ASSETS خالی می‌شود تا AST سبک بماند.            */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const acorn = require('acorn');

const FILE = process.argv[2] || 'src/worker.js';
let code = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');

/* APP_ASSETS را خالی کن. یک دستورِ تک‌خطی است، پس کلِ خط جایگزین می‌شود —
   شمارشِ آکولاد روی متنِ JSON اشتباه می‌شود (آکولاد داخل رشته‌ها) و کدِ بعدش
   را می‌خورد. */
code = code.split('\n').map((l) => l.startsWith('const APP_ASSETS = ') ? 'const APP_ASSETS = {};' : l).join('\n');

let ast;
try {
  ast = acorn.parse(code, { ecmaVersion: 2022, sourceType: 'module', locations: true });
  console.log('✔ نحو درست است:', FILE);
} catch (e) {
  console.error('✗ خطای نحوی:', e.message);
  process.exit(1);
}

/* ── جمع‌آوری اعلان‌ها ── */
const declared = new Set(['undefined', 'NaN', 'Infinity', 'globalThis', 'console', 'JSON', 'Math', 'Object',
  'Array', 'String', 'Number', 'Boolean', 'Promise', 'Date', 'Error', 'TypeError', 'Map', 'Set', 'WeakMap',
  'WeakSet', 'Symbol', 'RegExp', 'Uint8Array', 'Int8Array', 'Uint16Array', 'Float32Array', 'Float64Array',
  'ArrayBuffer', 'TextEncoder', 'TextDecoder', 'URL', 'URLSearchParams', 'fetch', 'atob', 'btoa', 'crypto',
  'Request', 'Response', 'Headers', 'FormData', 'Blob', 'File', 'AbortController', 'setTimeout', 'clearTimeout',
  'setInterval', 'clearInterval', 'queueMicrotask', 'structuredClone', 'Intl', 'parseInt', 'parseFloat',
  'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent', 'encodeURI', 'decodeURI', 'Proxy', 'Reflect',
  'DataView', 'Function', 'Uint8ClampedArray', 'BigInt', 'eval', 'arguments', 'require', 'module', 'exports',
  'ReadableStream', 'WritableStream', 'TransformStream']);

const used = new Map();   // نام → تعداد استفادهٔ آزاد
const scopes = [];        // پشتهٔ scopeها

function declare(name) { if (name) declared.add(name); }
/* همهٔ نام‌های اعلام‌شده در یک الگو (Identifier / Object / Array / Rest / Assign) */
const namesIn = (pat, out = []) => {
  if (!pat || typeof pat.type !== 'string') return out;
  if (pat.type === 'Identifier') out.push(pat.name);
  else if (pat.type === 'RestElement') namesIn(pat.argument, out);
  else if (pat.type === 'AssignmentPattern') namesIn(pat.left, out);
  else if (pat.type === 'ArrayPattern') pat.elements.forEach((x) => namesIn(x, out));
  else if (pat.type === 'ObjectPattern') pat.properties.forEach((pr) => namesIn(pr.value || (pr.type === 'RestElement' ? pr.argument : null), out));
  return out;
};

function collect(node, scope) {
  if (!node || typeof node.type !== 'string') return;
  switch (node.type) {
    case 'VariableDeclarator': namesIn(node.id).forEach(declare); break;
    case 'FunctionDeclaration':
      declare(node.id && node.id.name);
      node.params.forEach((p) => namesIn(p).forEach(declare));
      break;
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
      node.params.forEach((p) => namesIn(p).forEach(declare));
      break;
    case 'ClassDeclaration': declare(node.id && node.id.name); break;
    case 'CatchClause': if (node.param && node.param.type === 'Identifier') declare(node.param.name); break;
    case 'ImportSpecifier': declare(node.local.name); break;
  }
  for (const k of Object.keys(node)) {
    const v = node[k];
    if (Array.isArray(v)) v.forEach((c) => { if (c && typeof c.type === 'string') collect(c, scope); });
    else if (v && typeof v.type === 'string') collect(v, scope);
  }
}

/* موقعیت‌هایی که یک Identifier در آن‌ها «نام» است، نه ارجاع:
   کلیدِ غیرمحاسبه‌شدهٔ پراپرتی، پراپرتیِ غیرمحاسبه‌شدهٔ member، برچسب،
   نامِ متد/پراپرتی در کلاس و آبجکت. */
const NO_REF = new Set();
(function mark(node) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'Property' && !node.computed && node.key && node.key.type === 'Identifier') NO_REF.add(node.key);
  if (node.type === 'MemberExpression' && !node.computed && node.property && node.property.type === 'Identifier') NO_REF.add(node.property);
  if (node.type === 'MethodDefinition' && !node.computed && node.key && node.key.type === 'Identifier') NO_REF.add(node.key);
  if (node.type === 'LabeledStatement' && node.label) NO_REF.add(node.label);
  if (node.type === 'BreakStatement' && node.label) NO_REF.add(node.label);
  if (node.type === 'ContinueStatement' && node.label) NO_REF.add(node.label);
  if (node.type === 'ExportSpecifier' && node.exported && node.exported.type === 'Identifier') NO_REF.add(node.exported);
  for (const k of Object.keys(node)) {
    if (k === 'loc' || k === 'start' || k === 'end') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach((c) => { if (c && typeof c.type === 'string') mark(c); });
    else if (v && typeof v.type === 'string') mark(v);
  }
})(ast);

/* پیش‌پیمایش برای اعلان‌ها (سراسری) */
(function hoist(node) {
  if (!node || typeof node.type !== 'string') return;
  collect(node, null);
  for (const k of Object.keys(node)) {
    const v = node[k];
    if (Array.isArray(v)) v.forEach((c) => { if (c && typeof c.type === 'string') hoist(c); });
    else if (v && typeof v.type === 'string') hoist(v);
  }
})(ast);

/* پاسِ قطعیِ اعلان‌ها: هر FunctionDeclaration و هر VariableDeclarator در کلِ
   درخت اعلان‌شده است — مستقل از منطقِ scopeِ بالا. (قبلاً بعضی توابع در
   ماژول‌های انتهایی جا می‌افتادند و هشدارِ کاذب می‌ساختند.) */
(function declareAll(n) {
  if (!n || typeof n.type !== 'string') return;
  if (n.type === 'FunctionDeclaration' && n.id) declared.add(n.id.name);
  if (n.type === 'FunctionExpression' && n.id) declared.add(n.id.name);
  if (n.type === 'ClassDeclaration' && n.id) declared.add(n.id.name);
  if (n.type === 'VariableDeclarator') namesIn(n.id).forEach((x) => declared.add(x));
  for (const k of Object.keys(n)) {
    if (k === 'loc' || k === 'start' || k === 'end') continue;
    const v = n[k];
    if (Array.isArray(v)) v.forEach((c) => { if (c && typeof c.type === 'string') declareAll(c); });
    else if (v && typeof v.type === 'string') declareAll(v);
  }
})(ast);

/* استفاده‌ها */
(function walk(node, scope) {
  if (!node || typeof node.type !== 'string') return;
  let sc = scope;
  const push = (name) => { sc = new Set(sc || []); sc.add(name); };

  if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
    const inner = new Set(sc || []);
    node.params.forEach((p) => namesIn(p).forEach((nm) => inner.add(nm)));
    if (node.id && node.id.name) inner.add(node.id.name);
    /* بدنهٔ تابع: اعلان‌های var/function در همان scope بالا می‌آیند */
    for (const k of Object.keys(node.body || {})) {
      const v = node.body[k];
      if (Array.isArray(v)) v.forEach((c) => { if (c && typeof c.type === 'string') collect(c, inner); });
      else if (v && typeof v.type === 'string') collect(v, inner);
    }
    if (node.body && node.body.type === 'BlockStatement') {
      for (const st of node.body.body) collect(st, inner);
    }
    /* شناسه‌های استفاده‌شده در بدنه */
    for (const k of Object.keys(node.body || {})) {
      const v = node.body[k];
      if (Array.isArray(v)) v.forEach((c) => { if (c && typeof c.type === 'string') walk(c, inner); });
      else if (v && typeof v.type === 'string') walk(v, inner);
    }
    if (node.body && node.body.type === 'BlockStatement') {
      for (const st of node.body.body) walk(st, inner);
    }
    return;
  }

  /* ⚠️ فقط ارجاعِ واقعی به یک نام بررسی می‌شود. کلیدِ شیء (`{temperature: 1}`)،
     نامِ پراپرتی (`.read`) و برچسب (label:) «ارجاع» نیستند — قبلاً همین‌ها
     صدها هشدارِ کاذب می‌ساختند و ابزار را بی‌فایده کرده بودند. */
  if (node.type === 'Identifier' && !NO_REF.has(node)) {
    const inScope = sc && sc.has(node.name);
    if (!inScope && !declared.has(node.name)) {
      if (!used.has(node.name)) used.set(node.name, []);
      used.get(node.name).push(node.loc.start.line);
    }
  }
  if (node.type === 'VariableDeclaration') {
    for (const d of node.declarations) namesIn(d.id).forEach(push);
  }
  if (node.type === 'BlockStatement' || node.type === 'ForStatement' || node.type === 'ForInStatement' || node.type === 'ForOfStatement' || node.type === 'CatchClause') {
    sc = new Set(sc || []);
  }
  if (node.type === 'CatchClause' && node.param) namesIn(node.param).forEach((nm) => sc.add(nm));

  for (const k of Object.keys(node)) {
    if (k === 'loc' || k === 'start' || k === 'end') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach((c) => { if (c && typeof c.type === 'string') walk(c, sc); });
    else if (v && typeof v.type === 'string') walk(v, sc);
  }
})(ast, null);

if (used.size === 0) {
  console.log('✔ هیچ شناسهٔ آزاد (undefined) پیدا نشد.');
} else {
  console.log('\n✘ شناسه‌های استفاده‌شده ولی اعلام‌نشده: ' + used.size);
  for (const [n, ls] of [...used].sort((a, b) => a[1][0] - b[1][0])) {
    console.log('  ' + n.padEnd(24) + ' lines: ' + ls.slice(0, 6).join(', ') + (ls.length > 6 ? ' …' : ''));
  }
  /* ارجاعِ آزاد = احتمالِ باگِ واقعی → CI باید بگیردش */
  process.exit(1);
}
