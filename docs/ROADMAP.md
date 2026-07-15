# Vignan University Digital Campus Platform — Development Roadmap

**Based on:** `ARCHITECTURE.md` (existing technical review). No re-analysis performed here — this document takes that review's findings as ground truth and turns them into an execution plan.

**Target end state:** Take the current rendering-layer prototype (good geometry, zero data model, zero interaction layer, zero tests) to a production-quality Interactive Digital Campus Platform: searchable, clickable, tour-able, event-mode-capable, and performant on mobile.

---

## 1. Major Milestones

| Milestone | Version tag | Goal | Exit criteria |
|---|---|---|---|
| **M0 — Foundation Clean** | `v0.1.0` | Repo is honest: no dead code, no dead CSS, no ambiguity about what's live | `Player.jsx` and unused deps resolved, dead CSS/assets removed, debug scripts relocated, real README exists, Raycaster hoisted |
| **M1 — Data Layer Live** | `v0.2.0` | Buildings/zones/roads exist as structured, queryable data, not JSX literals | `data/buildings.js`, `data/zones.js`, `data/roads.js` exist; `Buildings.jsx`/`Roads.jsx`/`Zones.jsx` read from them; **zero visual regression** |
| **M2 — Interactive Campus** | `v0.3.0` | You can click a building and get real information back | Shared state store live; click/hover wired on building groups; `BuildingInfoPanel` renders real data-model content |
| **M3 — Navigable Campus** | `v0.4.0` | You can find something and get taken to it | Search returns and selects buildings by name/category; camera fly-to works end-to-end; minimap shows live player + building markers |
| **M4 — Guided Campus** | `v0.5.0` | The platform can drive the experience, not just respond to it | At least one full guided tour works start-to-finish; Event Mode toggles markers/signage without a rebuild |
| **M5 — Performance Hardened** | `v0.6.0` | The scene survives content growth without degrading | Instancing applied to the top repeated-geometry offenders; draw calls measurably reduced; verified on a mid-tier mobile device |
| **M6 — Production Ready** | `v1.0.0` | Someone other than the original author can safely contribute | Test suite covers the data model + critical interactions; CI runs lint+build+test on every PR; onboarding docs complete |

Do not skip a milestone to get to a "cooler" one. M2–M4 (the visible features) are structurally impossible to build correctly without M1. Trying anyway is how you get the exact duplicated-position-data drift bug the architecture review already flagged between `Zones.jsx` and `Buildings.jsx`, at platform scale.

---

## 2. Feature Prioritization

| Feature | Priority | Effort | Milestone | Depends on |
|---|---|---|---|---|
| Dead code / dead CSS / asset cleanup | P0 | S | M0 | — |
| Hoist per-frame `Raycaster` | P0 | S | M0 | — |
| Real project README + conventions doc | P1 | S | M0 | — |
| Campus data model (buildings/zones/roads) | P0 | M | M1 | M0 |
| Split `Buildings.jsx` monolith by landmark | P1 | M | M1 | data model shape agreed |
| Shared UI/interaction state store | P0 | S | M2 | M1 |
| Click/hover on buildings | P0 | M | M2 | state store |
| Building info panel | P0 | S | M2 | click/hover, data model |
| Data-driven building name labels | P2 | S | M2 | data model |
| Search bar | P1 | M | M3 | data model, state store |
| Camera fly-to service | P0 | M | M3 | — (extends existing controller) |
| Minimap | P1 | M | M3 | data model, fly-to service |
| Guided tour | P2 | M | M4 | fly-to service, data model |
| Event mode + dynamic markers | P2 | L | M4 | data model, tour infra reused |
| Instancing (windows/trees/walls/lines) | P1 | M | M5 | — (independent of feature phases) |
| Scoped/navmesh road-constraint check | P1 | M | M5 | — (independent) |
| Shadow frustum tuning / cascaded shadows | P2 | S | M5 | — |
| glTF pipeline go/no-go decision | P3 | M | M6 | — |
| Automated test suite (data model + logic) | P0 | M | **start at M1**, not M6 | data model exists |
| CI (lint + build) | P1 | S | **start at M0**, not M6 | — |

Two corrections to the "everything-testing-at-the-end" instinct that the architecture doc's phase list leans toward: **CI for lint+build costs nothing and should exist from M0.** **Unit tests for the data model and the road "holes" algorithm should start the moment M1 lands**, not get deferred to M6 as one big catch-up task nobody will actually do once four feature milestones of debt have piled up.

---

## 3. Dependency Graph

```
                    ┌───────────────────────┐
                    │ M0 — Foundation Clean │
                    │ (dead code, hoisted    │
                    │  raycaster, real README)│
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ M1 — Data Layer Live   │
                    │ buildings/zones/roads  │
                    │ as structured data     │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────────┐
              ▼                                       ▼
   ┌───────────────────────┐               ┌───────────────────────┐
   │ M2 — Interactive       │               │ M5 — Performance       │
   │ Campus (state store,   │               │ Hardened (instancing,  │
   │ click/hover, info panel│               │ scoped raycast) — can  │
   │                        │               │ run in PARALLEL, only  │
   │                        │               │ needs M0, not M2/M3/M4 │
   └───────────┬────────────┘               └───────────────────────┘
               │
               ▼
   ┌───────────────────────┐
   │ M3 — Navigable Campus  │
   │ search, minimap,       │
   │ camera fly-to service  │
   └───────────┬────────────┘
               │
               ▼
   ┌───────────────────────┐
   │ M4 — Guided Campus     │
   │ tours, event mode,     │
   │ dynamic markers        │
   │ (reuses fly-to service)│
   └───────────┬────────────┘
               │
               ▼
   ┌───────────────────────┐
   │ M6 — Production Ready  │
   │ tests, CI, glTF        │
   │ decision, docs         │
   └───────────────────────┘
```

**The one thing to internalize:** M5 (performance) is the *only* milestone that doesn't sit on the critical path. It can start the day M0 finishes and run on its own branch the whole time M2–M4 are being built. There is no excuse for it being left until "later" — later is when it's expensive.

---

## 4. Git Branch Strategy

Given a small team (solo or 2–3 contributors), a full GitFlow setup is overhead you don't need. Use this instead:

**Branch types:**
- `main` — protected, always buildable, always demoable. No direct commits.
- `phase/N-<short-name>` — one per milestone (e.g. `phase/1-data-model`). Opened at milestone start, merged to `main` via PR only when that milestone's exit criteria are met, then deleted. This is the integration branch feature branches target while a milestone is in flight.
- `feat/<short-desc>` — short-lived, branches off the current `phase/*` branch (or `main` if no phase is active, e.g. the parallel performance track).
- `fix/<short-desc>` — bug fixes.
- `perf/<short-desc>` — performance work (the M5 track lives here).
- `chore/<short-desc>` — cleanup, deps, docs, tooling.
- `test/<short-desc>` — test-only additions.

**Rules:**
1. No direct pushes to `main` or to an active `phase/*` branch — everything through a PR, even solo.
2. Squash-merge `feat/*`/`fix/*`/`perf/*` into their parent `phase/*` branch.
3. Tag a release the moment a `phase/*` branch merges into `main`: `v0.1.0` through `v1.0.0` per the milestone table above.
4. Commit messages follow Conventional Commits (`feat:`, `fix:`, `perf:`, `refactor:`, `chore:`, `docs:`, `test:`) — this is what makes `CHANGELOG` generation and later CI gating possible without extra tooling.
5. The M5 performance branch (`phase/5-performance`) is allowed to run concurrently with `phase/2`, `phase/3`, `phase/4` — merge it into `main` whenever it's ready, independent of feature-phase sequencing.

---

## 5. Estimated Implementation Order

1. **M0 — Foundation Clean.** Solo, fast. Do this fully before writing a single line of feature code. No exceptions, no "I'll clean it up later" — later never happens on a codebase that's actively growing.
2. **M1 — Data Layer Live.** This is the actual hard part of the whole roadmap — not because the code is complex, but because getting the schema wrong here means rewriting Phase 2–4 work against it later. Lock the schema before writing interactivity code against it.
3. **M5 (start, parallel).** The moment M0 is done, open `phase/5-performance` and start the instancing pass on `Roads.jsx` trees and `WindowGrid` — this doesn't need the data model and there's no reason to wait.
4. **M2 — Interactive Campus.** Depends entirely on M1's schema being stable.
5. **M3 — Navigable Campus.** Depends on M2's state store existing.
6. **M4 — Guided Campus.** Depends on M3's camera fly-to service — tours and event mode are both just orchestration on top of it.
7. **M5 (finish).** Full pass once M4's added content makes the scene heavier — shadow tuning, LOD if warranted, scoped raycast finalized.
8. **M6 — Production Ready.** Test coverage that should already exist in part (data model tests from M1 onward), CI that should already exist in part (lint+build from M0 onward), and the glTF decision made explicitly rather than left to rot as an open question.

Testing and CI are written into this list as *ongoing*, not as an M6 task — treat the M6 entry as "close out anything not already done," not "start from zero."

---

## 6. Risks and Technical Challenges

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Dead competing player controller (`Player.jsx`) confuses future work | Medium | Medium | Delete or clearly quarantine in M0 — don't defer |
| `Buildings.jsx` monolith causes merge conflicts once more than one person edits campus content | High (if team grows) | High | Split into per-landmark files during M1, not after the pain starts |
| Full-scene raycast becomes the dominant per-frame cost as scene grows | High | High | Hoist raycaster now (M0); scope to road-only objects before M4's content growth, not after |
| Shadow map resolution degrades as campus footprint grows | Medium | Medium | Tune shadow camera frustum or move to cascaded shadows during M5, before M4 adds more area |
| Data model schema chosen wrong, forcing a rewrite of dependent features | Medium | High | Get explicit sign-off on the buildings/zones/roads/POI shape before any M2 code is written against it |
| Context re-render footguns once many components read shared UI state | Medium | Medium | Prefer Zustand over plain Context, or split Context by concern (selection vs. tour vs. event mode) |
| Event Mode scope creep (every Mahotsav ask becomes "just one more marker type") | High | Medium | Freeze Event Mode v1 to markers + signage + start-camera-override only. Everything else is v2, written down, not built on demand |
| Mobile battery drain from uncapped continuous render loop | Medium | Medium | Evaluate `frameloop="demand"` once idle-but-UI-active states exist (panel open, tour paused) |
| Zero test coverage while adding stateful interactive features | High | High | Start data-model + road-holes-algorithm unit tests at M1, not M6 |
| No CI while surface area and possibly team size grows | Medium | Medium | Add lint+build CI at M0 exit, not M6 |
| Coordinate drift between `Zones.jsx` and `Buildings.jsx` positions | Medium until M1 lands | Medium | Structurally resolved once both read from the same `data/buildings.js` — this is exactly why M1 is P0 |
| glTF migration decision deferred indefinitely, "always more inline JSX" by default | Low | Medium | Make an explicit go/no-go call by end of M5 — an undecided decision is still a decision, just an unaccountable one |

