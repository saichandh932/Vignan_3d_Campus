# Codebase Guide

## Runtime entry points

| Path | Responsibility |
| --- | --- |
| `src/main.jsx` | Mounts the React application. |
| `src/App.jsx` | Composes the R3F canvas, environment, player controller, scene components, and DOM instructions. |
| `src/components/Buildings.jsx` | Procedural campus buildings and landmark geometry. |
| `src/components/Roads.jsx` | Road surfaces, roadside walls, trees, and parking markings. |
| `src/components/Zones.jsx` | Zone overlays, labels, and boundary walls. |
| `src/index.css` | Global layout and instructions-overlay styles. |

## Assets

`public/shield.jpg` is the player-avatar texture and `public/hoarding.jpg` is the campus billboard texture. `public/favicon.svg` is the browser favicon.

## Important runtime contracts

- Walkable road meshes must keep `name="RoadMesh"`; `PlayerController` raycasts the scene and accepts movement only when the tentative position hits one.
- Buildings, roads, and zones use hand-authored coordinates. Keep related coordinates aligned until M1 moves them to shared data.
- `Buildings.jsx` includes deterministic procedural geometry except for the farm-tree offsets, which currently use `Math.random()` during render.

## Known maintenance hotspots

- `Buildings.jsx` is a large mixed-concern scene file.
- Movement raycasts the complete scene graph each moving frame; the Raycaster object is reused, but the search is not road-scoped.
- Repeated windows, trees, walls, and parking stripes are individual meshes rather than instances.
- There is no automated test suite or CI workflow.
