// Month test: 52 production shifts (30 days, Sundays off). No fixes vs staged fixes with ramp. Run: node test-month.js
const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const a = html.indexOf('/*ENGINE-START*/'), b = html.indexOf('/*ENGINE-END*/');
const E = vm.runInNewContext(html.slice(a, b) + '\n;({ SHIFTS, rampOf, warmShift, newShift, step, bnMinutes, bnShares, autoOps, goodOut, PLAN_TOTAL })');
function month(plan) {
  const res = []; let prev = null;
  for (let n = 1; n <= E.SHIFTS; n++) {
    const fx = {}; for (const k in plan) if (n >= plan[k]) fx[k] = E.rampOf(n - plan[k]);
    const s = E.warmShift(E.newShift(n, fx, prev)); while (!s.done) { E.step(s); if (s.t % 10 === 0) E.autoOps(s); }
    const bn = E.bnShares(E.bnMinutes(s)); prev = bn.main;
    res.push({ day: s.cal.day, p: E.goodOut(s) / E.PLAN_TOTAL, bn: bn.main });
  }
  return res;
}
const wk = r => { const w = {}; for (const x of r) { const k = Math.ceil(x.day / 7); (w[k] = w[k] || []).push(x.p); } return Object.entries(w).map(([k, v]) => [k, v.reduce((a, b) => a + b) / v.length]); };
let fail = 0;
const base = wk(month({}));
const staged = wk(month({ kitting: 3, syrop: 3, tpm: 9, bufor: 9, smed: 15, noz: 15, zastepstwo: 15, prowadnice: 21 }));
console.log('no fixes     ', base.map(([k, v]) => `W${k} ${(v * 100).toFixed(0)}%`).join('  '));
console.log('staged fixes ', staged.map(([k, v]) => `W${k} ${(v * 100).toFixed(0)}%`).join('  '));
for (const [k, v] of base) if (v < 0.40 || v > 0.65) { fail++; console.log(`FAIL no fixes week ${k}: ${(v * 100).toFixed(0)}% outside 40–65%`); }
const late = staged.filter(([k]) => +k >= 3).map(([, v]) => v);
if (late.some(v => v < 0.95)) { fail++; console.log('FAIL staged fixes: week 3+ below 95%'); }
if (staged[0][1] >= late[0]) { fail++; console.log('FAIL staged fixes: no improvement over the month'); }
console.log(fail ? 'FAIL' : 'OK   month test');
process.exit(fail ? 1 : 0);
