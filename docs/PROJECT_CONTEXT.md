# Project Context

## Purpose

Vignan 3D Campus is a browser-based, procedural 3D campus walkthrough. It provides a spatial tour of the campus using React, React Three Fiber, Three.js, and Drei.

## Current product scope

- Keyboard movement with WASD or arrow keys.
- Third-person camera using `OrbitControls`.
- Road-constrained movement using downward raycasts against meshes named `RoadMesh`.
- Procedural campus buildings, roads, zones, labels, lighting, fog, and two image textures.

The application does not currently provide a data model, building selection, search, tours, persistence, routing, a backend, or a mobile joystick.

## Constraints

- Keep the React + React Three Fiber architecture.
- Keep DOM UI outside the `<Canvas>` and scene rendering inside it.
- Treat `RoadMesh` as a runtime contract until a navigation model replaces it.
- Preserve the existing coordinate system: X is lateral, Y is vertical, and Z is campus depth.

## Near-term direction

Finish M0 documentation/tooling items, then introduce structured campus data before adding interactive features. See `ROADMAP.md` and `TODO.md` for sequencing.
