# Contributing

## Setup

Use a current Node.js LTS release, then run:

```sh
npm install
npm run dev
```

Before submitting a change, run:

```sh
npm run lint
npm run build
```

## Working conventions

- Read `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, and `docs/TODO.md` before changing code.
- Keep a feature scoped to one concern; do not mix scene refactors with user-facing work.
- Keep DOM UI outside the R3F `<Canvas>` and 3D scene logic in scene components.
- Reuse existing procedural helpers before introducing new abstractions.
- Preserve the `RoadMesh` name on walkable road surfaces.
- Add or update the smallest practical verification for non-trivial new logic.
- Update `docs/TODO.md` when a listed task is completed.

## Pull requests

Describe behavior, files changed, validation performed, and any visual impact. Do not commit generated build output, local debug artifacts, or unrelated formatting changes.
