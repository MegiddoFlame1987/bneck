// Month test: 52 production shifts (30 days, Sundays off), for every value stream. No fixes vs staged fixes with
// ramp, plus staged fixes with the crew rota and absences on bars. Run: node test-month.js
const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const a = html.indexOf('/*ENGINE-START*/'), b = html.indexOf('/*ENGINE-END*/');
const E = vm.runInNewContext(html.slice(a, b) + '\n;({ SHIFTS, rampOf, warmShift, newShift, step, bnMinutes, bnShares, autoOps, goodOut, IND_KEYS, IND, setIndustry, planShift, plan: () => PLAN_TOTAL })');
function month(plan, rota) {
  const res = []; let prev = null;
  for (let n = 1; n <= E.SHIFTS; n++) {
    const fx = {}; for (const k in plan) if (n >= plan[k]) fx[k] = E.rampOf(n - plan[k]);
    const assign = rota ? E.planShift(n).assign : undefined;
    const s = E.warmShift(E.newShift(n, fx, prev, assign)); while (!s.done) { E.step(s); if (s.t % 10 === 0) E.autoOps(s); }
    const bn = E.bnShares(E.bnMinutes(s)); prev = bn.main;
    res.push({ day: s.cal.day, p: E.goodOut(s) / E.plan(), bn: bn.main });
  }
  return res;
}
const wk = r => { const w = {}; for (const x of r) { const k = Math.ceil(x.day / 7); (w[k] = w[k] || []).push(x.p); } return Object.entries(w).map(([k, v]) => [k, v.reduce((a, b) => a + b) / v.length]); };
// Rollout order per value stream: the constraint first (docs/lean/rollout.md).
const PLANS = {
  bars:   { kitting: 3, syrop: 3, tpm: 9, bufor: 9, smed: 15, noz: 15, zastepstwo: 15, prowadnice: 21 },
  drinks: { kitting: 3, syrop: 3, smed: 9, noz: 9, zastepstwo: 9, tpm: 15, bufor: 15, prowadnice: 21 },
  meals:  { kitting: 3, syrop: 3, tpm: 9, bufor: 9, prowadnice: 15, smed: 15, noz: 15, zastepstwo: 21 },
  parts:  { kitting: 3, syrop: 3, smed: 9, noz: 9, zastepstwo: 9, tpm: 15, bufor: 15, prowadnice: 21 },
};
let fail = 0;
for (const key of E.IND_KEYS) {
  E.setIndustry(key);
  const base = wk(month({})), staged = wk(month(PLANS[key]));
  console.log(`-- ${key} · ${E.IND[key].company}`);
  console.log('   no fixes     ', base.map(([k, v]) => `W${k} ${(v * 100).toFixed(0)}%`).join('  '));
  console.log('   staged fixes ', staged.map(([k, v]) => `W${k} ${(v * 100).toFixed(0)}%`).join('  '));
  for (const [k, v] of base) if (v < 0.40 || v > 0.70) { fail++; console.log(`   FAIL no fixes week ${k}: ${(v * 100).toFixed(0)}% outside 40-70%`); }
  const late = staged.filter(([k]) => +k >= 4).map(([, v]) => v);
  if (late.some(v => v < 0.95)) { fail++; console.log('   FAIL staged fixes: week 4+ below 95%'); }
  if (staged[0][1] >= late[0]) { fail++; console.log('   FAIL staged fixes: no improvement over the month'); }
}

// ---- the same month with the crew rota and absences: some shifts lose an operator, the month still holds ----
E.setIndustry('bars');
const rota = wk(month(PLANS.bars, true));
const openShifts = Array.from({ length: E.SHIFTS }, (_, i) => E.planShift(i + 1)).filter(p => p.open.length).length;
console.log('-- crew rota (bars)');
console.log('   with rota    ', rota.map(([k, v]) => `W${k} ${(v * 100).toFixed(0)}%`).join('  '), `  (${openShifts} shifts with an open machine)`);
if (rota.filter(([k]) => +k >= 3).some(([, v]) => v < 0.90)) { fail++; console.log('   FAIL with rota: week 3+ below 90%'); }
if (!openShifts) { fail++; console.log('   FAIL with rota: no shift with an open machine, absences have no effect'); }

console.log(fail ? `FAIL ${fail}` : 'OK   month test, all value streams');
process.exit(fail ? 1 : 0);
