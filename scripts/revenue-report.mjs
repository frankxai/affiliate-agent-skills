#!/usr/bin/env node
// Revenue report for the Agentic Income network.
// Answers the one question the catalog never could: are we earning yet?
// Reads the source-of-truth catalog + the append-only revenue ledger and prints
// monetization coverage, the next program to join, and first-dollar status.
//
// Ledger format: one JSON object per line in data/revenue-ledger.jsonl
//   { "date":"2026-07-04", "program":"systeme", "site":"agenticincome",
//     "network":"direct", "event":"commission", "amount":24.0, "currency":"USD",
//     "recurring":true, "note":"first payout" }
// event ∈ click | signup | commission | payout   (money events: commission, payout)
// Lines starting with # and blank lines are ignored.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(readFileSync(join(ROOT, 'data/programs.json'), 'utf8'));
const programs = catalog.programs ?? [];

let ledger = [];
try {
  ledger = readFileSync(join(ROOT, 'data/revenue-ledger.jsonl'), 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l, i) => {
      try { return JSON.parse(l); }
      catch { throw new Error(`revenue-ledger.jsonl: bad JSON on line ${i + 1}: ${l}`); }
    });
} catch (e) {
  if (e.code !== 'ENOENT') throw e; // no ledger yet = zero revenue, that's fine
}

const money = (n) => `$${n.toFixed(2)}`;
const isRecurring = (p) => p.recurring && !/one-time|null/i.test(String(p.recurring));
const joinable = (p) => p.hasProgram === true && !['dead-end', 'closed'].includes(p.status);

// --- Coverage -------------------------------------------------------------
const withProgram = programs.filter(joinable);
const joined = withProgram.filter((p) => p.ourLink);
const recurringJoined = joined.filter(isRecurring);
const cov = withProgram.length ? Math.round((joined.length / withProgram.length) * 100) : 0;

// --- Join-next gaps (priority-ranked, recurring first) --------------------
const gaps = withProgram
  .filter((p) => !p.ourLink || p.status === 'verify')
  .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

// --- Revenue from ledger --------------------------------------------------
const moneyEvents = ledger.filter((e) => e.event === 'commission' || e.event === 'payout');
const total = moneyEvents.reduce((s, e) => s + (Number(e.amount) || 0), 0);
const firstDollar = moneyEvents
  .map((e) => e.date)
  .sort()[0];

const now = new Date();
const days30 = new Date(now.getTime() - 30 * 864e5).toISOString().slice(0, 10);
const last30 = moneyEvents.filter((e) => e.date >= days30).reduce((s, e) => s + (Number(e.amount) || 0), 0);
const recurring30 = moneyEvents
  .filter((e) => e.date >= days30 && e.recurring)
  .reduce((s, e) => s + (Number(e.amount) || 0), 0);

const byProgram = {};
for (const e of moneyEvents) byProgram[e.program] = (byProgram[e.program] || 0) + (Number(e.amount) || 0);

const signups = ledger.filter((e) => e.event === 'signup').length;
const clicks = ledger.filter((e) => e.event === 'click').reduce((s, e) => s + (Number(e.amount) || 1), 0);

// --- Print ----------------------------------------------------------------
const bar = '─'.repeat(60);
console.log(`\n${bar}\n  AGENTIC INCOME — REVENUE REPORT   ${now.toISOString().slice(0, 10)}\n${bar}\n`);

console.log('FIRST DOLLAR');
if (total > 0) {
  console.log(`  ✅ ACHIEVED ${firstDollar}  ·  ${money(total)} booked to date\n`);
} else {
  console.log(`  ⛔ not yet — 0 money events in the ledger.`);
  console.log(`     The aim in reality.md is unmet until one commission lands here.\n`);
}

console.log('MONETIZATION COVERAGE');
console.log(`  ${joined.length}/${withProgram.length} joinable programs wired  (${cov}%)`);
console.log(`  ${recurringJoined.length} of those pay recurring  ← the compounding base`);
console.log(`  ${programs.filter((p) => p.hasProgram === false).length} high-traffic dead-ends (route their posts to payers)\n`);

if (moneyEvents.length) {
  console.log('REVENUE');
  console.log(`  total booked ........ ${money(total)}`);
  console.log(`  last 30 days ........ ${money(last30)}   (recurring: ${money(recurring30)})`);
  const top = Object.entries(byProgram).sort((a, b) => b[1] - a[1]).slice(0, 5);
  for (const [prog, amt] of top) console.log(`    · ${prog.padEnd(16)} ${money(amt)}`);
  console.log('');
}

console.log('LEADING SIGNALS');
console.log(`  clicks logged ....... ${clicks}`);
console.log(`  signups logged ...... ${signups}\n`);

console.log('JOIN / VERIFY NEXT  (priority order — recurring beats one-time)');
if (!gaps.length) console.log('  none — every joinable program is wired. Focus shifts to traffic.\n');
for (const p of gaps.slice(0, 8)) {
  const tag = p.status === 'verify' ? 'VERIFY' : 'JOIN  ';
  const rec = isRecurring(p) ? '♻ recurring' : 'one-time';
  console.log(`  [P${p.priority ?? '?'}] ${tag} ${p.tool.padEnd(14)} ${String(p.commission).padEnd(16)} ${rec}`);
}
console.log(`\n${bar}`);
console.log('  Log a payout:  append one line to data/revenue-ledger.jsonl');
console.log('  Weekly loop:   pnpm audit  (what to write) + pnpm revenue  (what earned)');
console.log(`${bar}\n`);
