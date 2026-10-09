# Improvement rollout strategy

How BNECK sequences, implements and sustains fixes. Written for the shift manager and the CI engineer. The simulation follows the same rules, so what the demo shows is what the method predicts.

## 1. One constraint at a time (TOC)

1. Identify the bottleneck from state data (active period method), not from opinion.
2. Exploit it: remove its own stops first (reason Pareto at the bottleneck only).
3. Subordinate the rest: buffers before it, no local optimisation elsewhere.
4. Elevate only when exploitation is exhausted (new equipment, extra shift).
5. When the bottleneck moves, start again. Do not keep improving the old one.

A fix on a non-bottleneck machine is not wrong, it is simply not first. The app shows it with an estimate of about zero.

## 2. Order of fixes

Rank by **minutes recovered at the bottleneck per week ÷ effort**, with two overrides:

| Override | Rule |
|---|---|
| Data first | If more than 25% of stop events have no reason, the first action is the reporting standard (andon), not a technical fix. |
| Safety and quality | Any fix that removes a safety or food-safety risk goes ahead of throughput. |

Effort classes: S = standard work or schedule change, no spend; M = tooling, parts, template, under one week; L = equipment change or capital request.

## 3. Rollout of one fix (PDCA on weeks)

| Phase | Length | What happens | Exit criterion |
|---|---|---|---|
| Plan | 1 shift | Owner named, standard-work line written, check added to the operator tablet | Standard visible on the tablet |
| Do | 3 shifts | Trial on one line, one crew. Effect ramps up: people learn, parts arrive, settings settle | Check ticked on every shift |
| Check | 1 week | Compare the reason's minutes at the bottleneck: week before vs week after, same shift pattern | Reduction ≥ 50% of the estimate, no new reason appearing |
| Act | ongoing | Standard confirmed, added to the audit list. If the check fails, back to Plan with the 5 Why | Audited weekly |

Ramp: the simulation applies a fix at 40% effect on the first shift, rising 10 points per shift to 100% after 6 shifts. This matches the usual pattern: nothing works fully on day one.

## 4. Sustain: fixes decay without a standard

A fix without a tablet check and a weekly audit drifts back. In the simulation a fix whose check is not ticked for 3 consecutive shifts loses 10 points of effect per shift, down to 50%. One audit (CI engineer, weekly) restores it. This is the mechanism behind "we fixed it last year and it came back".

Rules:
- Every fix has one tablet check. No check, no fix.
- Weekly audit walks the line: ticked or not, and whether the standard is still true.
- A fix that fails two audits is removed from "in place" and goes back to the proposal list with the note "did not hold".

## 5. Cadence

| When | Who | What |
|---|---|---|
| Every shift | Operators | Report reasons; tick standard-work checks |
| Shift handover | Shift manager | Overview tab: output, bottleneck, first action. 2 minutes |
| Daily | Team leader + SM | Yesterday vs plan, top reason at the bottleneck, one action owner |
| Weekly | CI engineer + SM | Check phase for fixes in Do; audit of fixes in Act; pick the next fix |
| Monthly | SLT | Trend of line OEE and plan attainment; which bottleneck now; capital asks |

## 6. What the app must show for this to work

- Minutes at the bottleneck per reason, per week, before and after a fix (History tab).
- Fix status: proposed → in Do (with ramp) → in Check → held / did not hold.
- Check tick rate per fix per shift.
- Bottleneck share per machine per week, to see when it moves.

## 7. What is not in the demo

Real effort and cost. Safety and quality overrides are rules in this document, not data in the simulation. Audits are a button in the demo; in the plant they are a person on the floor.
