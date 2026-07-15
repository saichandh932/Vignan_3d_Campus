# Vignan Digital Campus Platform — TODO

Tactical checklist. Pair this with `ROADMAP.md` for the why/when — this file is the what. Check items off as you finish them, not as you plan to finish them. An unchecked box with three sub-tasks half-done is still an unchecked box.

---

## Milestone M0 — Foundation Clean

- [ ] Delete or quarantine `Player.jsx` (dead Rapier-based controller)
- [ ] Decide: keep or remove `@react-three/rapier` dependency — if removed, update `package.json`
- [ ] Remove dead `App.css` (Vite template boilerplate — `.counter`, `.hero`, `.logo`, `.framework`, `.vite`, `.ticks`)
- [ ] Remove unused assets: `hero.png`, `react.svg`, `vite.svg`, `public/icons.svg`
- [ ] Relocate `test_console.js`, `test_console.cjs`, `test_screenshot.cjs`, `debug_screenshot.png` into `tools/debug/`
- [ ] Replace hardcoded Windows paths in debug scripts with a portable equivalent (or drop them for a real dev-tool)
- [ ] Write a project-specific `README.md`: run instructions, coordinate conventions, "how to add a building/road/zone"
- [ ] Hoist `THREE.Raycaster` in `PlayerController` out of the per-frame closure into a persistent instance
- [ ] Add `.gitattributes`/`.editorconfig` to standardize line endings (currently CRLF-only)
- [ ] Add minimal CI: lint + build on every PR (do not wait for M6)

---

## Milestone M1 — Data Layer Live

### Folder additions
- [ ] `src/data/`
- [ ] `src/data/buildings.js`
- [ ] `src/data/zones.js` (formalized from existing `ZONES` array)
- [ ] `src/data/roads.js`
- [ ] `src/data/pointsOfInterest.js`

### New data models

- [ ] **`data/buildings.js`** — array of building records:
  `{ id, name, category, position [x,y,z], rotation?, footprint {width, depth}, description, images? [], tags? [], openingHours?, isInteractive: bool, zoneId }`
- [ ] **`data/zones.js`** — formalized zone records:
  `{ id, label, size, color, position, category?, description? }`
- [ ] **`data/roads.js`** — road segment records:
  `{ id, start [x,z], end [x,z], width, hasWalls: bool, hasTrees: bool, holes? [{start, end}] }`
- [ ] **`data/pointsOfInterest.js`** — benches, statues, signage, generic markers:
  `{ id, type, position, label?, description?, icon? }`

### Refactor tasks
- [ ] Refactor `Buildings.jsx` to read position/metadata from `data/buildings.js` — **no visual output change**
- [ ] Refactor `Roads.jsx` to read from `data/roads.js`
- [ ] Refactor `Zones.jsx` to read from `data/zones.js`
- [ ] Split `Buildings.jsx` (1,255 lines) into per-landmark files: `Library.jsx`, `ABlock.jsx`, `HBlock.jsx`, `NBlockMHP.jsx`, `BusStop.jsx`, `Shrine.jsx`, `Canteen.jsx`, `SportsGround.jsx`, `FarmZone.jsx` — mechanical extraction, no behavior change
- [ ] Start unit tests here, not at M6: data model shape validation + the road "holes" segment-subtraction algorithm

### Folder reorg (per architecture §14)
- [ ] `src/scene/` (renamed from `components/`)
- [ ] `src/scene/environment/Sky.jsx`, `Ground.jsx`
- [ ] `src/scene/buildings/primitives/` — `MultiStoryBuilding.jsx`, `WindowGrid.jsx`, `CampusGate.jsx`
- [ ] `src/scene/buildings/landmarks/` — per-landmark files above
- [ ] `src/scene/roads/RoadSegment.jsx`
- [ ] `src/scene/zones/BoundaryWall.jsx`
- [ ] `src/player/` — `PlayerController.jsx`, `PlayerAvatar.jsx`, `useRoadConstraint.js` (extracted from `App.jsx`)
- [ ] `src/styles/` (repurpose or remove `App.css`)

---

## Milestone M2 — Interactive Campus

### Folder additions
- [ ] `src/state/`
- [ ] `src/state/CampusStateProvider.jsx`
- [ ] `src/state/useCampusStore.js`
- [ ] `src/ui/` (DOM-level UI, separate from 3D scene)

### New React components
- [ ] `BuildingInfoPanel.jsx` — DOM overlay showing selected building's name/description/image on selection
- [ ] `useInteractiveBuilding` hook (or wrapper) — attaches `onClick`/`onPointerOver`/`onPointerOut` to building groups, writes `id` into shared state
- [ ] `BuildingLabel.jsx` — data-driven, toggleable "always show building name" system, replacing the ad hoc `<Text>` calls
- [ ] `InstructionsOverlay.jsx` (extracted from `App.jsx`)

### Tasks
- [ ] Decide store implementation: Context (fast to ship) vs. Zustand (recommended long-term, avoids re-render footguns) — decide before writing hover/click code against it
- [ ] Wire `selectedBuildingId`, `hoveredBuildingId`, `activePanel` state
- [ ] Add `React.memo` boundaries to `Buildings`/`Roads`/`Zones` once they accept props like `selectedBuildingId` — otherwise one selection change re-reconciles ~300 sibling meshes

---

## Milestone M3 — Navigable Campus

### New React components
- [ ] `SearchBar.jsx` — DOM search input, queries the data model by name/category
- [ ] `SearchResultsList.jsx` — selectable result list
- [ ] `Minimap.jsx` — top-down orthographic render or 2D canvas/SVG projection showing player position + building markers

### Folder additions
- [ ] `src/camera/`
- [ ] `src/camera/CameraFlyTo.jsx`

### Tasks
- [ ] Build camera fly-to service: smoothly animate camera/OrbitControls target to a selected building, then hand control back to `PlayerController`
- [ ] Wire search selection → fly-to service → info panel open
- [ ] Add empty-state / no-results UI for the search bar

---

## Milestone M4 — Guided Campus

### New React components
- [ ] `TourControls.jsx` — next/previous/skip/exit UI
- [ ] `TourStepIndicator.jsx` — progress breadcrumb/dots
- [ ] `EventModeToggle.jsx` — switches between normal/event campus view
- [ ] `EventMarker.jsx` — floating billboard/icon for event-specific POIs (reuse existing `<Text>`/billboard-sprite technique)

### New data models
- [ ] **`data/tours.js`** — guided tour definitions:
  `{ id, title, description, steps: [{ buildingId or poiId, narration?, cameraOverride? }] }`
- [ ] **`data/events.js`** — Event Mode overlay data:
  `{ id, name, active: bool, startDate?, endDate?, markers: [{ position, label, type, icon }], overrideStartCamera? }`

### Folder additions
- [ ] `src/camera/useGuidedTour.js`
- [ ] `src/ui/tour/`
- [ ] `src/ui/EventModeToggle.jsx`

### Tasks
- [ ] Build guided tour as an ordered sequence of data-model IDs driven by the fly-to service
- [ ] Freeze Event Mode v1 scope: markers + signage + start-camera-override only — anything beyond that is a written-down v2 item, not an ad hoc addition
- [ ] Ship one complete end-to-end tour before adding a second

---

## Milestone M5 — Performance Hardened *(runs in parallel — start after M0, don't wait)*

### Three.js improvements
- [ ] Convert `WindowGrid` output to `InstancedMesh` / drei `<Instances>`
- [ ] Convert roadside trees to instancing
- [ ] Convert boundary-wall segments and parking-line meshes to instancing
- [ ] Replace full-scene raycast with a scoped roads-only object list, or a real navmesh
- [ ] Tune shadow camera frustum to actual visible campus bounds, or evaluate cascaded shadow maps
- [ ] Introduce LOD for distant buildings once building count/detail grows meaningfully
- [ ] Evaluate `frameloop="demand"` for battery-sensitive mobile sessions once idle-but-UI-active states exist

### Performance improvements
- [ ] Measure draw-call count before/after the instancing pass — prove the win, don't assume it
- [ ] Texture compression / sizing audit for `hoarding.jpg`, `shield.jpg`, and any future images
- [ ] Add a dev-only FPS/perf HUD toggle for internal testing
- [ ] Code-split heavier DOM UI (search, tour controls, settings) via `React.lazy` if bundle size becomes a concern

---

## Milestone M6 — Production Ready

### UI/UX improvements
- [ ] Replace static instructions overlay with a dismissible, first-time-only onboarding sequence
- [ ] Add keyboard-accessible focus states + ARIA labels for all new DOM UI (search, panels, tour controls)
- [ ] Add loading state (spinner/progress) for any Suspense-boundary asset loads (glTF, textures)
- [ ] Mobile breakpoint audit — verify search bar, info panel, minimap don't collide with the joystick zone
- [ ] Add a persistent "Help / Controls" modal, replacing the baked-in instructions text
- [ ] Add visual hover feedback in 3D (outline shader or emissive tint), not just DOM panel changes
- [ ] Add a settings affordance for shadow/graphics quality on low-end mobile devices
- [ ] Replace the hand-rolled `index.html` global error overlay with a proper React `ErrorBoundary` + user-facing fallback UI

### New React components
- [ ] `LoadingScreen.jsx` — Suspense fallback for asset loads
- [ ] `SettingsPanel.jsx` — graphics quality, shadow toggle, sound
- [ ] `ErrorBoundary.jsx` — wraps `<Canvas>`
- [ ] `NotificationBanner.jsx` — lightweight feedback ("Building selected", "Tour started")

### Folder additions
- [ ] `tests/` — Vitest unit tests + fixtures
- [ ] `.github/workflows/` — CI config (lint + build + test)
- [ ] `src/ui/settings/`

### Tasks
- [ ] Test suite covers: data model shape, road-holes algorithm, and smoke tests for critical interactions (select building, search, tour step)
- [ ] CI runs lint + build + test on every PR
- [ ] Make the explicit glTF vs. procedural-geometry decision — write it down, don't leave it implicit
- [ ] Finalize onboarding docs: how to add a building/zone/road/tour/event

---

## Standing Rule (applies to every milestone above)

Do not open a new `feat/*` branch for the next milestone until the current milestone's checklist above is fully checked and merged to `main`. A partially-done M1 with M2 work layered on top of it is exactly the "duplicated/parallel position data maintained only by convention" problem the architecture review already flagged — don't recreate it one layer up.
