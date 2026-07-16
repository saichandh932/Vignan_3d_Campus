# Vignan University Digital Campus Platform

## Current architecture

The application is a client-side React 19 prototype rendered through React Three Fiber and Three.js. It contains one R3F `<Canvas>` plus a DOM instructions overlay. There is no backend, route layer, persistence layer, global state store, data model, test suite, or mobile virtual joystick.

```text
main.jsx
└─ App.jsx
   ├─ Canvas
   │  ├─ environment: lights, Sky, fog, ground
   │  ├─ PlayerController (local to App.jsx)
   │  ├─ OrbitControls
   │  ├─ Buildings
   │  ├─ Roads
   │  └─ Zones
   └─ DOM instructions overlay
```

## Source layout

| Path | Purpose |
| --- | --- |
| `src/main.jsx` | React mount point. |
| `src/App.jsx` | Canvas composition, player movement and camera behavior, and DOM instructions. |
| `src/components/Buildings.jsx` | All building and landmark geometry, including reusable geometry helpers. |
| `src/components/Roads.jsx` | Road network, walls, roadside trees, and parking markings. |
| `src/components/Zones.jsx` | Zone overlays, garden label, and campus boundary walls. |
| `src/index.css` | Global and instructions-overlay styles. |
| `public/shield.jpg` | Player-avatar texture. |
| `public/hoarding.jpg` | Billboard texture. |

## Runtime behavior

- `PlayerController` accepts WASD and arrow-key input, derives movement from the camera's projected forward/right directions, and moves an avatar billboard and camera together.
- A tentative position is accepted only when a downward raycast intersects a mesh named `RoadMesh`. `Roads.jsx` owns those mesh names.
- `OrbitControls` is the default control system. It has panning disabled, a limited polar angle, and a 2–15 unit zoom range.
- The scene is procedural JSX geometry. No glTF models are loaded.
- `Buildings`, `Roads`, and `Zones` are static scene components and do not receive props or expose metadata for selection.

## Dependencies

Runtime dependencies are React, React DOM, Three.js, React Three Fiber, and Drei. Vite, the React Vite plugin, and Oxlint are development dependencies. The removed Rapier and WebSocket packages were not part of the shipped application.

## Constraints and technical debt

1. `Buildings.jsx` is a large, mixed-concern file with many hand-authored coordinates.
2. Campus coordinates are duplicated across buildings, roads, and zone overlays; M1 should move them to structured data before interactive features are added.
3. The player Raycaster is reused, but it still recursively tests the whole scene while moving. A roads-only group or navigation model is the next safe performance improvement.
4. Repeated windows, trees, wall segments, and parking lines are individual meshes rather than instances.
5. Farm tree positions call `Math.random()` during render, making their positions non-deterministic on remount.
6. There is no automated test or CI configuration.

## Validation result

The previous architecture document described a `Joystick.jsx` component and joystick-driven movement, but neither exists in the current source tree. It also described now-removed Rapier and debug tooling as active repository contents. This version reflects the checked-in runtime after the safe M0 cleanup.
