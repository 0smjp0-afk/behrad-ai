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

/* APP_ASSETS را خالی کن */
const aa = code.indexOf('const APP_ASSETS = ');
if (aa >= 0) {
  let p = code.indexOf('{', aa), d = 0;
  for (; p < code.length; p++) { const c = code[p]; if (c === '{') d++; else if (c === '}') { d--; if (!d) { p++; break; } } }
  code = code.slice(0, aa) + 'const APP_ASSETS = {};' + code.slice(p);
}

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
  'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent', 'encodeURI', 'decodeURI', 'Proxy', 'Reflect']);

const used = new Map();   // نام → تعداد استفادهٔ آزاد
const scopes = [];        // پشتهٔ scopeها

function declare(name) { if (name) declared.add(name); }

function collect(node, scope) {
  if (!node || typeof node.type !== 'string') return;
  switch (node.type) {
    case 'VariableDeclarator': declare(node.id.type === 'Identifier' ? node.id.name : null); break;
    case 'FunctionDeclaration':
      declare(node.id && node.id.name);
      node.params.forEach((p) => { if (p.type === 'Identifier') declare(p.name); else if (p.type === 'AssignmentPattern' && p.left.type === 'Identifier') declare(p.left.name); });
      break;
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
      node.params.forEach((p) => { if (p.type === 'Identifier') declare(p.name); else if (p.type === 'AssignmentPattern' && p.left.type === 'Identifier') declare(p.left.name); });
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

/* استفاده‌ها */
(function walk(node, scope) {
  if (!node || typeof node.type !== 'string') return;
  let sc = scope;
  const push = (name) => { sc = new Set(sc || []); sc.add(name); };

  if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
    const inner = new Set(sc || []);
    node.params.forEach((p) => { if (p.type === 'Identifier') inner.add(p.name); else if (p.type === 'AssignmentPattern' && p.left.type === 'Identifier') inner.add(p.left.name); });
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

  if (node.type === 'Identifier') {
    const inScope = sc && sc.has(node.name);
    if (!inScope && !declared.has(node.name)) {
      if (!used.has(node.name)) used.set(node.name, []);
      used.get(node.name).push(node.loc.start.line);
    }
  }
  if (node.type === 'VariableDeclaration') {
    for (const d of node.declarations) { if (d.id.type === 'Identifier') push(d.id.name); }
  }
  if (node.type === 'BlockStatement' || node.type === 'ForStatement' || node.type === 'ForInStatement' || node.type === 'ForOfStatement' || node.type === 'CatchClause') {
    sc = new Set(sc || []);
  }
  if (node.type === 'CatchClause' && node.param && node.param.type === 'Identifier') sc.add(node.param.name);

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
  console.log('\n⚠ شناسه‌های استفاده‌شده ولی اعلام‌نشده: ' + used.size);
  for (const [n, ls] of [...used].sort((a, b) => a[1][0] - b[1][0])) {
    console.log('  ' + n.padEnd(24) + ' lines: ' + ls.slice(0, 6).join(', ') + (ls.length > 6 ? ' …' : ''));
  }
}
