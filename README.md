# BNECK

Demo of a shift-manager tool: line bottleneck, flow between machines, OEE, crew skills and lean improvement proposals.

**Oakmere Bar Co.** is fictional. Machines, failures and numbers come from a simulation.

## Contents

| File | What it is |
|---|---|
| `index.html` | The whole app in one file. View switcher = scope: Operator sees one machine with large downtime buttons for that machine only, Team leader sees the line, Shift manager sees the shift (all tabs), Site leadership sees the month (History by week, decisions, Actions). Light theme by default, dark as an in-app switch. Tap a machine for its detail. Tabs: Flow (who sits where: production stream on X, decisions and strategy on Y, interactive), Overview (manager, help needed from other teams), Line (stream top to bottom, bottleneck, OEE, losses), Crew (ILUO, staffing, recommendation), Operators (tablets), Analysis, Fishbone (pick a recurring bottleneck problem, Ishikawa from operator answers across shifts, 5 Why, matching fix), History (hour/shift/day/week, Pareto by period, insights), Actions |
| `test.js` | Engine test: 5 shifts with successive fixes, a machine without an operator (with and without the floater cover plan), the shift plan. Checks % of plan and bottleneck |
| `test-month.js` | Month test: 52 shifts, no fixes vs staged fixes with ramp, and staged fixes with the crew rota and absences |
| `docs/lean/rollout.md` | How fixes are sequenced, rolled out and sustained (TOC, PDCA on weeks, ramp, audit) |

## Run

- App: open `index.html` in a browser. No build, no server.
- Tests: `node test.js` and `node test-month.js`
- Vercel: import the repo, preset "Other", no build command.

## How it works

Bottleneck: active period method (Roser). At any moment the bottleneck is the machine with the longest uninterrupted period of running or own stoppage. Starved and blocked states end the period.

OEE: availability (time without own stops) × performance (against ideal rate; waiting for another machine lowers it) × quality (good units).

Crew: the operator's ILUO level multiplies own-stop duration (I ×1.45, L ×1.15, U ×1.0, O ×0.8). Four crews of four on a fixed rota (crews 1-2 Mon-Wed, 3-4 Thu-Sat, days and nights swap weekly). Each person is fixed to a machine or is a floater. About 12% of person-shifts are absences (ASSUMED: UK statutory holiday of 5.6 weeks a year plus some sickness), seeded per shift. The shift plan puts fixed people on their machine and fills gaps with floaters, best level first. A machine with no operator is covered by the next machine's operator: own stops ×1.6 and a 4-9 min stop about every 45 min, reason "No operator at the machine". The fix is a floater cover plan before the shift. In the product, staffing and the matrix come from Crewmap.

Calendar: 30 days, day shift 06:00–18:00 and night shift 18:00–06:00, no production on Sundays: 52 shifts. A fix starts at 40% effect and reaches 100% after 6 shifts; three shifts without the tablet check ticked and it slips 10 points per shift, an audit restores it (`docs/lean/rollout.md`).

History: every finished shift is stored in the browser (IndexedDB). Export and import as JSON for replay. Insights are rules over stored shifts: rising and falling reasons week over week, recurring reasons, day vs night, fixes that held or slipped, check tick rate, bottleneck moved, reporting quality.

Proposals in the demo come from a rule engine, not an AI model.

## Licence and ownership

Copyright (c) 2026 Norbert Mazur. All rights reserved. See `LICENSE`.

| Owned by the author | Public, not owned by anyone |
|---|---|
| Source code of the app and the simulation engine | Active period method (Roser, 2001) |
| Combination: bottleneck + crew ILUO + operator tablet modes + lean proposal engine | OEE (ISO 22400), ILUO, muda/mura/muri, SMED, TPM, TOC |
| BNECK name, texts, screens, reason taxonomy | Lean vocabulary and standard KPIs |

Plant data from any real site stays the property of that site. Oakmere Bar Co. is fictional.
