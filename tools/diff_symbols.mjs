#!/usr/bin/env node
/* ═══ مقایسهٔ نمادهای اعلام‌شده بین نسخهٔ اصلی و نسخهٔ عمومی ═══
   هدف: مطمئن شویم حذف کد اسپیس هیچ نمادِ زنده‌ای را نشکسته است.
   خروجی: دو فهرست «نمادهای حذف‌شده» و «نمادهای تازه».                */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const acorn = require('acorn');

function parse(file) {
  let code = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const aa = code.indexOf('const APP_ASSETS = ');
  if (aa >= 0) {
    let p = code.indexOf('{', aa), d = 0;
    for (; p < code.length; p++) { const c = code[p]; if (c === '{') d++; else if (c === '}') { d--; if (!d) { p++; break; } } }
    code = code.slice(0, aa) + 'const APP_ASSETS = {};' + code.slice(p);
  }
  return acorn.parse(code, { ecmaVersion: 2022, sourceType: 'module' });
}

/* نام‌های اعلام‌شده در سطح بالا + نام توابع/کلاس‌ها + کلیدهای ثابتِ تنظیمات */
function symbols(ast) {
  const top = new Set();
  const funcs = new Set();
  const consts = new Set();
  for (const node of ast.body) {
    if (node.type === 'FunctionDeclaration' && node.id) { funcs.add(node.id.name); top.add(node.id.name); }
    if (node.type === 'ClassDeclaration' && node.id) { top.add(node.id.name); }
    if (node.type === 'VariableDeclaration') {
      for (const d of node.declarations) {
        if (d.id.type === 'Identifier') { consts.add(d.id.name); top.add(d.id.name); }
        else if (d.id.type === 'ObjectPattern') for (const p of d.id.properties) if (p.value && p.value.type === 'Identifier') { consts.add(p.value.name); top.add(p.value.name); }
        else if (d.id.type === 'ArrayPattern') for (const p of d.id.elements) if (p && p.type === 'Identifier') { consts.add(p.name); top.add(p.name); }
      }
    }
  }
  return { top, funcs, consts };
}

const A = symbols(parse(process.argv[2]));
const B = symbols(parse(process.argv[3]));

const diff = (a, b) => [...a].filter((x) => !b.has(x)).sort();

const removedTop = diff(A.top, B.top);
const addedTop = diff(B.top, A.top);

console.log('═══ نمادهای حذف‌شده (سطح بالا) ═══');
for (const n of removedTop) console.log('  − ' + n);
console.log('═══ نمادهای تازه ═══');
for (const n of addedTop) console.log('  + ' + n);

/* هر نماد حذف‌شده باید یا با «کد اسپیس» مرتبط باشد یا گزارش شود */
const CS = /^(cs|CS|gh|GH|agentApi|fmtBytes|fmtSize|mpName|_CS)/;
const suspicious = removedTop.filter((n) => !CS.test(n));
console.log('\nنمادهای حذف‌شدهٔ «غیرمرتبط با کد اسپیس» (باید خالی باشد): ' + suspicious.length);
for (const n of suspicious) console.log('  ⚠ ' + n);

/* بررسی معکوس: هر نامی که در سورس تازه استفاده شده و تعریف ندارد */
const astB = parse(process.argv[3]);
const declaredB = new Set([...B.top]);
/* توابع داخلی هم اعلام هستند */
(function collect(node) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'FunctionDeclaration' && node.id) declaredB.add(node.id.name);
  if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') declaredB.add(node.id.name);
  if (node.type === 'CatchClause' && node.param && node.param.type === 'Identifier') declaredB.add(node.param.name);
  for (const k of Object.keys(node)) {
    const v = node[k];
    if (Array.isArray(v)) v.forEach((c) => { if (c && typeof c.type === 'string') collect(c); });
    else if (v && typeof v.type === 'string') collect(v);
  }
})(astB);

const used = new Map();
(function walk(node, scope) {
  if (!node || typeof node.type !== 'string') return;
  if (node.type === 'Property' && !node.computed && node.key.type === 'Identifier') {
    /* کلید شیء: مرجع نیست */
    if (node.value && node.value.type === 'Identifier') {
      /* shorthand: {x} هم کلید است هم مرجع */
      if (node.shorthand) { const sc = new Set(scope); sc.add(node.key.name); walk(node.value, sc); }
    }
    for (const k of ['value']) if (node[k] && typeof node[k].type === 'string') walk(node[k], scope);
    return;
  }
  if (node.type === 'MemberExpression') {
    if (node.object) walk(node.object, scope);
    if (node.computed && node.property) walk(node.property, scope);
    return;
  }
  if (node.type === 'Identifier') {
    if (!scope.has(node.name) && !declaredB.has(node.name)) {
      if (!used.has(node.name)) used.set(node.name, node.loc ? node.loc.start.line : 0);
    }
  }
  const sc = new Set(scope);
  if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
    node.params.forEach((p) => { if (p.type === 'Identifier') sc.add(p.name); else if (p.type === 'AssignmentPattern' && p.left.type === 'Identifier') sc.add(p.left.name); });
    if (node.id && node.id.name) sc.add(node.id.name);
    if (node.body && node.body.type === 'BlockStatement') {
      for (const st of node.body.body) {
        if (st.type === 'VariableDeclaration') for (const d of st.declarations) if (d.id.type === 'Identifier') sc.add(d.id.name);
        if (st.type === 'FunctionDeclaration' && st.id) sc.add(st.id.name);
      }
    }
  }
  if (node.type === 'VariableDeclaration') for (const d of node.declarations) if (d.id.type === 'Identifier') sc.add(d.id.name);
  if (node.type === 'CatchClause' && node.param && node.param.type === 'Identifier') sc.add(node.param.name);
  for (const k of Object.keys(node)) {
    if (k === 'loc' || k === 'start' || k === 'end') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach((c) => { if (c && typeof c.type === 'string') walk(c, sc); });
    else if (v && typeof v.type === 'string') walk(v, sc);
  }
})(astB, new Set());

const GLOBAL = new Set(['undefined', 'NaN', 'Infinity', 'globalThis', 'console', 'JSON', 'Math', 'Object', 'Array',
  'String', 'Number', 'Boolean', 'Promise', 'Date', 'Error', 'TypeError', 'Map', 'Set', 'WeakMap', 'WeakSet',
  'Symbol', 'RegExp', 'Uint8Array', 'Int8Array', 'Uint16Array', 'Float32Array', 'Float64Array', 'ArrayBuffer',
  'TextEncoder', 'TextDecoder', 'URL', 'URLSearchParams', 'fetch', 'atob', 'btoa', 'crypto', 'Request', 'Response',
  'Headers', 'FormData', 'Blob', 'File', 'AbortController', 'setTimeout', 'clearTimeout', 'setInterval',
  'clearInterval', 'queueMicrotask', 'structuredClone', 'Intl', 'parseInt', 'parseFloat', 'isNaN', 'isFinite',
  'encodeURIComponent', 'decodeURIComponent', 'encodeURI', 'decodeURI', 'Proxy', 'Reflect']);

const freed = [...used].filter(([n]) => !GLOBAL.has(n));
console.log('\n═══ شناسه‌های آزاد در نسخهٔ تازه ═══');
if (!freed.length) console.log('  ✔ هیچ‌کدام');
for (const [n, l] of freed) console.log('  ⚠ ' + n.padEnd(22) + ' خط ' + l);
