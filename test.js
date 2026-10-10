// Checks the simulation engine inside index.html: for every value stream, 5 shifts with successive fixes,
// % of plan and which machine is the constraint. Then the crew cases (unstaffed machine, shift plan) on bars.
// Run: node test.js
const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const a = html.indexOf('/*ENGINE-START*/'), b = html.indexOf('/*ENGINE-END*/');
if (a < 0 || b < 0) { console.error('ENGINE-START/END markers not found in index.html'); process.exit(1); }
const E = vm.runInNewContext(html.slice(a, b) + '\n;({ warmShift, newShift, step, bnMinutes, bnShares, autoOps, goodOut, oee, MS, IND, IND_KEYS, setIndustry, propsOf, planShift, plan: () => PLAN_TOTAL })');

const FX = [
  {},
  { kitting: 1, syrop: 1 },
  { kitting: 1, syrop: 1, tpm: 1, bufor: 1 },
  { kitting: 1, syrop: 1, tpm: 1, bufor: 1, smed: 1, noz: 1, zastepstwo: 1 },
  { kitting: 1, syrop: 1, tpm: 1, bufor: 1, smed: 1, noz: 1, zastepstwo: 1, prowadnice: 1 },
];
// Per value stream: band for % of plan at each stage, and the machine that must be the constraint.
const EXP = {
  bars:   { p: [[0.44, 0.60], [0.66, 0.82], [0.86, 1.00], [0.98, 1.12], [1.00, 1.14]], bn: ['A', 'C', 'B', 'C', 'C'] },
  drinks: { p: [[0.47, 0.63], [0.64, 0.80], [0.72, 0.88], [0.99, 1.15], [0.98, 1.13]], bn: ['A', 'B', 'B', 'B', 'B'] },
  meals:  { p: [[0.45, 0.61], [0.55, 0.71], [0.94, 1.10], [0.99, 1.15], [1.00, 1.16]], bn: ['A', 'C', 'C', 'C', 'C'] },
  parts:  { p: [[0.45, 0.61], [0.66, 0.82], [0.69, 0.85], [1.00, 1.16], [1.00, 1.16]], bn: ['A', 'B', 'B', 'B', 'B'] },
};
const REASON_IDS = ['skladniki', 'syrop', 'zawor', 'przezbrojenie', 'noz', 'przerwa', 'obsada', 'tor', 'zator', 'inne'];
let fail = 0;
for (const key of E.IND_KEYS) {
  E.setIndustry(key);
  const I = E.IND[key], exp = EXP[key];
  if (!exp) { fail++; console.log(`FAIL ${key}: no expectations`); continue; }
  // The nine fixes and ten reasons must resolve in every profile, otherwise the proposal engine and the
  // fishbone have nothing to point at. Shared wording (no operator, floater plan) comes from the skeleton.
  for (const p of E.propsOf(key)) if (!p.title || !p.what || !p.effect || !p.check) { fail++; console.log(`FAIL ${key}: fix ${p.id} missing text`); }
  for (const r of REASON_IDS) if (!I.rl[r] && !['obsada', 'inne'].includes(r)) { fail++; console.log(`FAIL ${key}: reason ${r} has no label`); }
  console.log(`-- ${key} · ${I.company} · plan ${I.base.planRate} ${I.unit}/min`);
  let prev = null;
  FX.forEach((fx, i) => {
    const s = E.warmShift(E.newShift(i + 1, fx, prev));
    while (!s.done) { E.step(s); if (s.t % 10 === 0) E.autoOps(s); }
    const sh = E.bnShares(E.bnMinutes(s)), p = E.goodOut(s) / E.plan();
    const ok = p >= exp.p[i][0] && p <= exp.p[i][1] && sh.main === exp.bn[i];
    if (!ok) fail++;
    console.log(`${ok ? 'OK  ' : 'FAIL'} shift ${i + 1}: ${(p * 100).toFixed(0)}% of plan (good), OEE ${E.MS.map(m => m + ' ' + (E.oee(s, m).oee * 100).toFixed(0)).join('/')}, bottleneck ${sh.main} (${(sh.sh[sh.main] * 100).toFixed(0)}%)${ok ? '' : ` · expected ${exp.bn[i]} in ${(exp.p[i][0] * 100).toFixed(0)}-${(exp.p[i][1] * 100).toFixed(0)}%`}`);
    prev = sh.main;
  });
}

// ---- crew: an unstaffed machine, and the shift plan. Bars, so the numbers are the familiar ones. ----
E.setIndustry('bars');
console.log('-- crew (bars)');
const full = { kitting: 1, syrop: 1, tpm: 1, bufor: 1, smed: 1, noz: 1, zastepstwo: 1, prowadnice: 1 };
const crewCases = [
  { label: 'former unstaffed', fx: full, assign: { A: 'kasia', B: null, C: 'jan' }, expect: [0.80, 0.97], bn: 'B' },
  { label: 'former unstaffed, floater cover plan', fx: { ...full, pula: 1 }, assign: { A: 'kasia', B: null, C: 'jan' }, expect: [0.98, 1.15], bn: 'C' },
];
for (const c of crewCases) {
  const s = E.warmShift(E.newShift(4, c.fx, 'B', c.assign));
  while (!s.done) { E.step(s); if (s.t % 10 === 0) E.autoOps(s); }
  const sh = E.bnShares(E.bnMinutes(s)), p = E.goodOut(s) / E.plan();
  const stops = s.events.filter(e => e.reason === 'obsada').length;
  const ok = p >= c.expect[0] && p <= c.expect[1] && sh.main === c.bn;
  if (!ok) fail++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${c.label}: ${(p * 100).toFixed(0)}% of plan (good), bottleneck ${sh.main} (${(sh.sh[sh.main] * 100).toFixed(0)}%), no-operator stops ${stops}`);
}

// Shift plan: fixed people to their machine, the floater to the gap where their level is highest.
const one = E.planShift(1, { kasia: 'HOL' }), two = E.planShift(1, { kasia: 'HOL', marek: 'SICK' });
const eve = E.planShift(2, { anna: 'HOL', sam: 'SICK' });  // Eve: mixer I, former L -> she takes the former
const planOk = one.assign.A === 'tomek' && one.open.length === 0 && two.assign.A === 'tomek' && two.open.join() === 'B'
  && eve.assign.B === 'ewa' && eve.open.join() === 'A';
if (!planOk) fail++;
console.log(`${planOk ? 'OK  ' : 'FAIL'} shift plan: Kate off -> Tom (O) on the mixer; Kate and Mark off -> former open; Ann and Sam off -> Eve (L) on the former, mixer open`);

console.log(fail ? `FAIL ${fail}` : 'OK   all value streams and crew cases');
process.exit(fail ? 1 : 0);
