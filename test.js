// Checks the simulation engine inside index.html: 5 shifts with successive fixes, a machine without an operator,
// and the shift plan. % of plan and bottleneck.
// Run: node test.js
const fs = require('fs'), vm = require('vm');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const a = html.indexOf('/*ENGINE-START*/'), b = html.indexOf('/*ENGINE-END*/');
if (a < 0 || b < 0) { console.error('ENGINE-START/END markers not found in index.html'); process.exit(1); }
const E = vm.runInNewContext(html.slice(a, b) + '\n;({ warmShift, newShift, step, bnMinutes, bnShares, autoOps, goodOut, oee, MS, PLAN_TOTAL, planShift })');

const stages = [
  { fx: {}, expect: [0.40, 0.62], bn: 'A' },
  { fx: { kitting: 1, syrop: 1 }, expect: [0.64, 0.84], bn: 'C' },
  { fx: { kitting: 1, syrop: 1, tpm: 1, bufor: 1 }, expect: [0.84, 0.96], bn: 'B' },
  { fx: { kitting: 1, syrop: 1, tpm: 1, bufor: 1, smed: 1, noz: 1, zastepstwo: 1 }, expect: [0.98, 1.15], bn: 'C' },
  { fx: { kitting: 1, syrop: 1, tpm: 1, bufor: 1, smed: 1, noz: 1, zastepstwo: 1, prowadnice: 1 }, expect: [1.0, 1.15], bn: 'C' },
];
let fail = 0, prev = null;
stages.forEach((st, i) => {
  const s = E.warmShift(E.newShift(i + 1, st.fx, prev));
  while (!s.done) { E.step(s); if (s.t % 10 === 0) E.autoOps(s); }
  const sh = E.bnShares(E.bnMinutes(s)), p = E.goodOut(s) / E.PLAN_TOTAL;
  const ok = p >= st.expect[0] && p <= st.expect[1] && sh.main === st.bn;
  if (!ok) fail++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} shift ${i + 1}: ${(p * 100).toFixed(0)}% of plan (good), OEE ${E.MS.map(m => m + ' ' + (E.oee(s, m).oee * 100).toFixed(0)).join('/')}, bottleneck ${sh.main} (${(sh.sh[sh.main] * 100).toFixed(0)}%), fixes: ${Object.keys(st.fx).join(', ') || 'none'}`);
  prev = sh.main;
});

// Crew: a machine with no operator. All stage-4 fixes in place, the former loses its operator.
const full = { kitting: 1, syrop: 1, tpm: 1, bufor: 1, smed: 1, noz: 1, zastepstwo: 1 };
const crewCases = [
  { label: 'former unstaffed', fx: full, assign: { A: 'kasia', B: null, C: 'jan' }, expect: [0.80, 0.97], bn: 'B' },
  { label: 'former unstaffed, floater cover plan', fx: { ...full, pula: 1 }, assign: { A: 'kasia', B: null, C: 'jan' }, expect: [0.98, 1.15], bn: 'C' },
];
for (const c of crewCases) {
  const s = E.warmShift(E.newShift(4, c.fx, 'B', c.assign));
  while (!s.done) { E.step(s); if (s.t % 10 === 0) E.autoOps(s); }
  const sh = E.bnShares(E.bnMinutes(s)), p = E.goodOut(s) / E.PLAN_TOTAL;
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
process.exit(fail ? 1 : 0);
