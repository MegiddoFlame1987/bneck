# BNECK

Demo of a shift-manager tool: line bottleneck, flow between machines, OEE, crew skills and lean improvement proposals.

**Oakmere Bar Co.** is fictional. Machines, failures and numbers come from a simulation.

## Contents

| File | What it is |
|---|---|
| `index.html` | The whole app in one file. Tabs: Overview (manager), Line (stream top to bottom, bottleneck, OEE, losses), Crew (ILUO, staffing, recommendation), Operators (tablets), Analysis, Actions |
| `test.js` | Engine test: 5 shifts with successive fixes, checks % of plan and bottleneck |

## Run

- App: open `index.html` in a browser. No build, no server.
- Test: `node test.js`
- Vercel: import the repo, preset "Other", no build command.

## How it works

Bottleneck: active period method (Roser). At any moment the bottleneck is the machine with the longest uninterrupted period of running or own stoppage. Starved and blocked states end the period.

OEE: availability (time without own stops) × performance (against ideal rate; waiting for another machine lowers it) × quality (good units).

Crew: the operator's ILUO level multiplies own-stop duration (I ×1.45, L ×1.15, U ×1.0, O ×0.8). In the product, staffing and the matrix come from Crewmap.

Proposals in the demo come from a rule engine, not an AI model.

## Licence and ownership

Copyright (c) 2026 Norbert Mazur. All rights reserved. See `LICENSE`.

| Owned by the author | Public, not owned by anyone |
|---|---|
| Source code of the app and the simulation engine | Active period method (Roser, 2001) |
| Combination: bottleneck + crew ILUO + operator tablet modes + lean proposal engine | OEE (ISO 22400), ILUO, muda/mura/muri, SMED, TPM, TOC |
| BNECK name, texts, screens, reason taxonomy | Lean vocabulary and standard KPIs |

Plant data from any real site stays the property of that site. Oakmere Bar Co. is fictional.
