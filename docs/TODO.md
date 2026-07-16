# Vignan Digital Campus Platform — TODO

## Completed in the documentation and cleanup audit

- [x] Remove dead Rapier player code and unused Rapier/WebSocket/type-package dependencies.
- [x] Remove unused Vite starter CSS and assets.
- [x] Remove obsolete machine-specific debug scripts and screenshot artifact.
- [x] Reuse the player Raycaster instead of allocating it during movement.
- [x] Add project context, codebase, contribution, and changelog documentation.

## M0 — Foundation Clean

- [ ] Replace the Vite template `README.md` with project setup and coordinate-convention guidance.
- [ ] Add `.gitattributes` or `.editorconfig` for line-ending consistency.
- [ ] Add minimal CI that runs lint and build on pull requests.

## M1 — Data Layer Live

- [x] Create the initial structured building registry and asset inventory.
- [ ] Create structured zone, road, and point-of-interest data.
- [ ] Move scene coordinates from JSX literals into the shared data model without visual regression.
- [ ] Split `Buildings.jsx` into focused landmark components after the data shape is agreed.
- [ ] Add small validation tests for data shape and road-hole segment logic.

## M5 — Performance Hardened

- [ ] Scope player road checks to road objects instead of the full scene graph.
- [ ] Measure and reduce repeated-geometry draw calls with instancing where worthwhile.
- [ ] Evaluate shadow frustum tuning and texture sizing on representative mobile hardware.

## Later milestones

- [ ] M2: shared interaction state, building selection, hover states, and an information panel.
- [ ] M3: search, camera fly-to, and minimap.
- [ ] M4: guided tours and event markers.
- [ ] M6: accessible UI, error boundary, loading states, full test coverage, and CI completion.
