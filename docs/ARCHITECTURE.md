# Vignan University Digital Campus Platform
## Comprehensive Technical Architecture & Code Review

**Reviewed by:** Lead Software Engineer / Technical Architect
**Scope:** Full source tree (`Vignan_3d_Campus.zip`)
**Purpose:** Establish a complete, accurate mental model of the current system before any future feature work begins.

---

## 1. Project Overview

### What problem does this project solve?
The project renders an explorable 3D digital twin of the Vignan University campus in the browser. A visitor controls an avatar (currently a billboard sprite carrying the Vignan shield texture) and walks around a hand-built campus — gate, library, academic blocks, hostels, sports ground, farm zone, canteen, bus stop — using keyboard or an on-screen joystick, with an orbit-style third-person camera.

It currently solves **one problem well**: giving someone a spatial sense of "what the campus looks like and how its parts relate to each other," similar to a walkable architectural render. It does **not yet** solve the platform-level problems described in the long-term vision (navigation, search, guided tours, event mode, information panels).

### Current capabilities
- Renders a large, detailed static campus scene (~300 meshes) built entirely from primitive Three.js geometries (no imported 3D models/GLTF).
- Third-person walkthrough with WASD/Arrow key movement.
- Mobile virtual joystick input, unified with keyboard input into a single movement vector.
- Movement is constrained to hand-authored "road" meshes via downward raycasting (you can only walk where there is a mesh named `RoadMesh` beneath you).
- OrbitControls provides look-around/zoom camera control, capped to avoid going underground and to keep a tight third-person framing.
- Basic environment: sky, directional sun light with shadows, ambient fill light, distance fog, and a large ground plane.
- Named zones (invisible colored ground overlays) and building labels (`drei`'s `Text`) hint at a data model that doesn't fully exist yet.

### Missing capabilities (relative to the stated long-term vision)
- No interactivity on buildings (no click/tap handlers, no hover states, no selection).
- No building metadata model at all (names exist only as JSX literals inside geometry-building functions — not as data).
- No search, no minimap, no fly-to camera, no guided tour, no event mode, no dynamic markers, no information panels.
- No React state management beyond a couple of `useRef`s (`keys`, `joystick`, `playerRef`) — there is no app-level state (selected building, UI mode, tour progress, etc.) because nothing yet needs it.
- No routing, no persistence, no backend/data layer.
- No automated tests; the three `test_*.js/.cjs` files are ad hoc, Windows-specific manual debugging scripts, not a test suite.
- No asset pipeline for 3D models — everything is procedural `BoxGeometry`/`CylinderGeometry`/`SphereGeometry`/`PlaneGeometry`, which will become a scalability wall (see §12).
- Dead code and dead CSS are present (see §3, §11).

### Overall maturity assessment
This is a **solid, artistically detailed prototype / MVP of the rendering layer**, built with reasonable Three.js/R3F idioms (raycasting, `useFrame`, `useMemo` for generated geometry). It is **not yet an application architecture** — there is no data layer, no interactivity layer, and no UI/state layer beyond the movement controller. Every "feature" the long-term vision describes (search, tours, info panels, event mode) requires a layer that doesn't exist yet: a **campus data model** (buildings, zones, POIs as structured data, not JSX literals) and **an interaction/UI layer** built on top of it. The rendering foundation is good enough to build on; the application shell is the next major body of work.

Maturity in one line: **Good geometry, no data model, no interaction layer, no state management, no tests.**

---

## 2. Technology Stack

| Package | Version | Why it's used |
|---|---|---|
| `react` / `react-dom` | 19.2.7 | UI layer; drives the reactive component tree that declares the Three.js scene graph. |
| `vite` | ^5.4.11 | Dev server + bundler. Fast HMR is important here because iterating on 3D scenes benefits from instant reload. |
| `@vitejs/plugin-react` | ^4.3.4 | Enables JSX/Fast Refresh in Vite. |
| `three` | ^0.185.1 | The underlying WebGL 3D engine — geometries, materials, lights, raycasting, textures. |
| `@react-three/fiber` | ^9.6.1 | React renderer for Three.js. Lets the scene graph be declared as JSX (`<mesh>`, `<group>`) instead of imperative `scene.add(...)` calls, and provides `useFrame`, `useThree`, `useLoader`. |
| `@react-three/drei` | ^10.7.7 | Helper library on top of R3F. Currently used for `<Sky>` (procedural sky dome + sun), `<OrbitControls>` (camera orbiting/zoom/pan), and `<Text>` (SDF-based 3D text labels for signage). |
| `@react-three/rapier` | ^2.2.0 | **Installed but effectively unused in the live app.** It backs the WASM-based physics engine and is only referenced by the dead `Player.jsx` component (see §3). The in-app comment in `App.jsx` explicitly says physics was removed "to avoid WASM/Rapier load failure crashes." |
| `ws` | ^8.21.0 | Node WebSocket client, used only by the ad hoc `test_console.cjs`/`test_screenshot.cjs` debug scripts (headless Chrome remote debugging) — not part of the shipped app. |
| `oxlint` | ^1.71.0 | Fast Rust-based linter (replaces ESLint here). Config (`.oxlintrc.json`) enables `react/rules-of-hooks` and `react/only-export-components`. |
| `@types/react`, `@types/react-dom` | dev only | Editor/IDE type-checking support even though the project is plain JS, not TS. |

**Rendering pipeline in one sentence:** React declares a Three.js scene graph via R3F → R3F's internal reconciler creates real `THREE.Object3D` instances → Three.js's WebGLRenderer rasterizes them each frame inside a single `<Canvas>`.

**Notable absence:** no state management library (Redux/Zustand/Jotai), no routing library, no data-fetching library, no 3D model loader in active use (no `GLTFLoader`/`useGLTF`), no testing framework (Vitest/Jest/Playwright), no CI config. These are all reasonable omissions for the current feature set, but each becomes necessary as the roadmap in §15 progresses.

---

## 3. Folder Structure

```
Vignan_3d_Campus/
├── .oxlintrc.json          Lint configuration (react + oxc plugins)
├── .gitignore              Standard Vite/Node ignores
├── README.md               Default Vite/React template README (not project-specific)
├── index.html              HTML shell; also contains a hand-rolled global error overlay
├── package.json / package-lock.json
├── vite.config.js          Minimal Vite config, just the React plugin
├── debug_screenshot.png    Leftover artifact from a manual debugging script
├── test_console.js         Dead debug script (duplicate/older version, Windows Chrome path hardcoded)
├── test_console.cjs        Dead debug script (headless Chrome + CDP over WebSocket to read console/errors)
├── test_screenshot.cjs     Dead debug script (headless Chrome + CDP to capture a screenshot to a hardcoded Windows path)
├── public/
│   ├── favicon.svg
│   ├── hoarding.jpg        Texture used by the billboard hoarding near the shrine
│   ├── icons.svg           Unreferenced in code (not imported anywhere found)
│   └── shield.jpg          Texture used as the player avatar sprite (with alpha map for background removal)
└── src/
    ├── main.jsx            React root bootstrap (createRoot + StrictMode + <App/>)
    ├── App.jsx             Canvas setup, lighting/sky/fog, PlayerController (movement + camera), ground plane, UI overlay
    ├── App.css             Legacy Vite template CSS (counter/hero/logo/framework/vite/ticks classes) — **entirely dead, unused by any JSX**
    ├── index.css           Real, in-use UI styling: fullscreen canvas container, instructions panel, joystick styling, mobile media query
    ├── assets/
    │   ├── hero.png, react.svg, vite.svg  — leftover Vite template assets, not imported by any current component
    └── components/
        ├── Buildings.jsx   1,255 lines. All campus structures: gates, library, A-Block, H-Block, N-Block/MHP, bus stop, hoarding, shrine, canteen, sports field, farm zone walls, utility zone, mud track. Composed of small reusable sub-builders (`WindowGrid`, `MultiStoryBuilding`, `CampusGate`, `MudGroundWithTrack`, `HoardingBillboard`, `VignanBusStop`) plus a large amount of one-off inline JSX for named landmark buildings.
        ├── Roads.jsx        199 lines. `RoadSegment` primitive (asphalt strip + optional low walls + optional roadside trees with gap/"hole" support) and the highway diagonal + ring road, composed into the full road network via hardcoded position/rotation/length values.
        ├── Zones.jsx        103 lines. A `ZONES` data array (id/label/size/color/position) rendered as semi-transparent colored ground overlays, plus a `BoundaryWall` primitive and a large curved perimeter wall built from a partial `CylinderGeometry`.
        ├── Player.jsx       38 lines. **Dead code.** A Rapier-physics-based FPS-style player controller (`RigidBody` + `CapsuleCollider` + `useKeyboardControls`) that is not imported or rendered anywhere in the app. It represents an earlier movement-system design that was superseded by the raycast-constrained `PlayerController` inside `App.jsx`.
        └── Joystick.jsx     83 lines. Self-contained on-screen virtual joystick: pointer-event based, normalizes stick displacement to a `[-1,1]` vector written into a ref shared with `PlayerController`.
```

### Key structural observations
1. **Two competing player-movement implementations exist in the repo** (`Player.jsx` using Rapier physics, and `PlayerController` inline in `App.jsx` using raycasting). Only the raycasting one is live. This is the single most important piece of dead code to resolve before building further movement/interaction features on top, because a future engineer could easily start extending the wrong one.
2. **`App.jsx` currently does two jobs that should be separated**: it is both the *scene composition root* (Canvas, lights, sky, fog, ground) and the *player controller implementation*. `PlayerController` is a substantial, self-contained system (60+ lines of input handling + movement + raycasting + camera-follow logic) currently living as a nested function inside the file that also assembles the scene.
3. **`Buildings.jsx` is a monolith.** At 1,255 lines it is by far the largest file in the project and mixes three concerns: (a) small reusable geometry builders (`WindowGrid`, `MultiStoryBuilding`), (b) named, one-off landmark structures (Library, A-Block, H-Block, N-Block/MHP, bus stop, shrine) written as long inline JSX blocks with magic-number coordinates, and (c) the top-level `Buildings()` export that just concatenates all of the above. There is no data-driven building list analogous to `Zones.jsx`'s `ZONES` array — building identity (name, position, category) is implicit in code structure, not represented as data.
4. **Dead CSS**: `App.css` is the unmodified Vite starter template stylesheet (`.counter`, `.hero`, `.logo`, `.framework`, `.vite`, `.ticks`, etc.). None of these class names appear anywhere in the JSX (`grep` confirms zero usage). It is currently harmless (nothing imports classes that don't exist) but it is confusing dead weight; a reviewer or new contributor will reasonably wonder if it's load-bearing.
5. **Dead assets**: `src/assets/hero.png`, `react.svg`, `vite.svg`, and `public/icons.svg` are unreferenced by any component.
6. **Debug tooling checked into the main tree**: `test_console.js`, `test_console.cjs`, `test_screenshot.cjs`, and `debug_screenshot.png` are developer-machine-specific (hardcoded `C:\Program Files\...` Chrome path, hardcoded `C:\Users\DELL\...` output path) manual debugging aids, not a real test suite, and not portable across machines/OSes. They should not live at the project root long-term.
7. **CRLF line endings** are used throughout every source file (confirmed via inspection) — likely fine for a Windows-based dev environment, but worth standardizing (`.gitattributes` / `.editorconfig`) once the team grows, to avoid noisy diffs on other OSes.
8. **`README.md` is the unmodified Vite template README** — it documents Oxlint/React Compiler in general, not anything about the Vignan Campus project itself (setup, run instructions, campus data conventions, etc.).

---

## 4. React Architecture

### Component hierarchy
```
main.jsx
 └── App (default export)
      ├── <Canvas>                         (@react-three/fiber root)
      │    ├── <ambientLight>
      │    ├── <directionalLight>          (shadow-casting sun)
      │    ├── <Sky>                       (drei)
      │    ├── <fog>
      │    ├── <PlayerController>          (local function component, defined in App.jsx)
      │    │    └── <group ref=playerRef>  → avatar billboard mesh
      │    ├── <OrbitControls>             (drei; makeDefault → registered as state.controls)
      │    ├── <Buildings />                → CampusGate × 2, VignanBusStop, Library group,
      │    │                                   A-Block/H-Block/N-Block groups, HoardingBillboard,
      │    │                                   MudGroundWithTrack, many inline landmark groups
      │    ├── <Roads />                     → RoadSegment × many, ring road, parking markings
      │    ├── <Zones />                     → ZONES.map(...) ground overlays, BoundaryWall × many
      │    └── <mesh> (ground plane)
      ├── <Joystick joystickRef={joystick} />   (outside the Canvas — plain DOM overlay)
      └── <div className="ui-container">        (outside the Canvas — instructions overlay)
```

### Component responsibilities
- **`main.jsx`** — pure bootstrap; no logic.
- **`App` (in `App.jsx`)** — top-level composition root. Owns the `joystick` ref, assembles the `<Canvas>` with lighting/environment, mounts the scene sub-components, and renders the DOM-level UI overlay (instructions + joystick) as siblings of the canvas.
- **`PlayerController` (in `App.jsx`)** — everything about "being the player": keyboard listeners, per-frame movement integration, forward/right vector derivation from camera orientation, joystick input blending, road-constraint raycasting, camera-follow translation, and OrbitControls target update. Also renders the avatar mesh itself.
- **`Buildings`, `Roads`, `Zones`** — pure, stateless scene-content components. Each exports one top-level function that returns a `<group>` of static geometry. They accept no props and manage no state; they exist purely to keep `App.jsx` from growing even larger.
- **`Joystick`** — self-contained UI widget with its own local state (`active`, `position`) for visual feedback, and an imperative side-channel (`joystickRef.current = {x, y}`) to communicate with `PlayerController` without triggering React re-renders on every touch-move (a good performance-conscious pattern, since re-rendering per pointermove would be wasteful — using a ref avoids that entirely).
- **`Player.jsx`** — dead; not part of the live component tree.

### Rendering flow
1. `main.jsx` mounts `<App/>` once.
2. `App` renders its JSX once; the `<Canvas>` mounts, and R3F starts its own internal render loop **independent of React's render cycle** — this is important: after initial mount, per-frame updates (player movement, camera) happen via `useFrame` callbacks that mutate Three.js objects directly (`player.position.copy(...)`, `camera.position.add(...)`), **not** via React state/re-render. This is the correct pattern for R3F (avoids 60fps React re-renders) and is used correctly here.
3. The only thing that causes an actual React re-render after mount is the `Joystick`'s local `useState` (position/active) when the user touches the on-screen stick — and that re-render is confined to the `Joystick` DOM subtree, not the Canvas/scene tree.

### State management
- No global/app-level state exists yet (no Context, no external store).
- Local component state is minimal: `Joystick`'s `active`/`position` (`useState`), and refs everywhere else (`keys`, `playerRef`, `joystick`, `baseRef`, `shieldTexture` is not state but a loaded resource).
- This is appropriate for the current feature set but **will not scale** once features like "selected building," "tour step," "UI panel open/closed," or "event markers" are introduced — these are exactly the kinds of cross-cutting concerns Context or a lightweight store (Zustand is the idiomatic choice in the R3F ecosystem) are meant to solve.

### Data flow / props flow
- Essentially unidirectional and shallow: `App` owns the `joystick` ref and passes it down to both `PlayerController` (read) and `Joystick` (write). There is no other prop-passing of consequence — `Buildings`, `Roads`, `Zones` take no props at all, which is precisely why they cannot yet be "interactive" or "queried" (a building has no identity outside the JSX that draws it).

---

## 5. Three.js / React Three Fiber Architecture

### Canvas setup
```jsx
<Canvas shadows camera={{ fov: 60, near: 0.1, far: 1000, position: [0, 15, 75] }}>
```
- `shadows` enables the renderer's shadow map globally (required for the directional light's `castShadow` to have any effect).
- A single default `PerspectiveCamera` is implicitly created by R3F from the `camera` prop (fov 60°, near/far 0.1–1000, starting above and behind the gate). There is no explicit multi-camera setup yet (no dedicated overview/minimap camera).

### Camera system
- The camera is **not** parented to the player mesh. Instead, `PlayerController`'s `useFrame` (a) computes movement in camera-relative directions (`camera.getWorldDirection` projected to XZ) and (b) manually translates the camera by the same delta the player moves (`camera.position.add(moveDirection)`), while OrbitControls' `target` is continuously re-pointed at the player's torso height. This produces a hybrid "third-person orbit rig": the camera orbits around a point that itself follows the player.
- This is a workable but slightly unconventional pattern — most third-person controllers either (a) parent the camera to a follow-target `Object3D` or (b) use a spring/damped follow. Here, camera translation is a **1:1, undamped copy of the player's own delta**, so the camera never lags/catches up; it moves in perfect lockstep, and all "smoothing" comes only from OrbitControls' own damping (which isn't explicitly enabled — no `enableDamping` prop is set, so OrbitControls defaults apply).

### OrbitControls
```jsx
<OrbitControls makeDefault enablePan={false}
  minPolarAngle={0} maxPolarAngle={Math.PI/2 - 0.05}
  minDistance={2} maxDistance={15} />
```
- `makeDefault` registers the controls instance on R3F's internal state so that `useThree().controls` / `state.controls` (used inside `PlayerController`) can access it — this is the mechanism that lets `PlayerController` read `controls.target` and call `controls.update()` each frame.
- Panning is disabled (keeps the pivot locked to the player). Polar angle is clamped just under 90° to prevent the camera from dipping below ground level. Zoom is clamped tightly (2–15 units) to preserve a "third-person" framing rather than allowing a bird's-eye pull-back.

### Lighting
- One `ambientLight` (flat fill, intensity 0.7) + one shadow-casting `directionalLight` (intensity 1.8, 2048×2048 shadow map) positioned far away at `[120,150,100]` to emulate sunlight. This is a simple, standard two-light outdoor setup — adequate for the current stylized/low-poly look, but with ~300 shadow-casting meshes in view, shadow map resolution and camera frustum tuning will become relevant as the scene grows (see §10).

### Sky
- `drei`'s `<Sky sunPosition={[120,150,100]} />` renders Three.js's procedural atmospheric scattering sky dome, matched to the same direction as the directional light (correct practice — sun position and light direction should agree, and they do here).

### Fog
- `<fog attach="fog" args={['#87CEEB', 150, 600]} />` — linear fog from 150–600 units, tinted sky-blue to blend the far draw distance into the sky color, and incidentally serving as a cheap performance aid (things past 600 units are still rendered by default, but Three's linear fog does not by itself cull geometry — cutting draw calls requires actual frustum culling or object hiding, which is not yet implemented; see §10).

### Scene hierarchy
The scene graph is flat at the top level (`Buildings`, `Roads`, `Zones`, ground plane, player, lights all as direct children of `<Canvas>`), but each of `Buildings`/`Roads`/`Zones` internally builds deep nested `<group>` trees per landmark (position/rotation applied per group, children positioned relative to it) — this is good practice, since it means each building's internal coordinates are locally authored (relative to its own group origin) even though the buildings' *placement* in the world uses global magic-number coordinates (see §12).

### Mesh / geometry / material organization
- **No geometry reuse or instancing.** Every window, pillar, tree, and wall segment is its own `<mesh>` with its own `boxGeometry`/`cylinderGeometry`/`sphereGeometry`/`planeGeometry` and its own `meshStandardMaterial`. Three.js/R3F does deduplicate *identical* JSX-declared geometry/material props to some extent under the hood in some cases, but there's no explicit `InstancedMesh` anywhere despite many highly-repeated elements (windows: `WindowGrid` generates dozens of near-identical plane meshes per building face; roadside trees repeat every 15 units along many road segments; parking-line meshes repeat 22 times). This is the most important performance-scalability gap in the current implementation (detailed in §10).
- **Materials** are exclusively `meshStandardMaterial` / `meshBasicMaterial`, using PBR-ish `roughness`/`metalness` props for stylistic variation (glass panels, metal window frames) rather than textures for most surfaces — reasonable for a stylized look and for keeping load-time light, but window/wall detail is faked with **thousands of tiny flat plane meshes** rather than a **baked/tiled texture with UV-mapped windows**, which is both a performance and a visual-fidelity tradeoff.

### Rendering lifecycle
- Standard R3F lifecycle: JSX declares objects → R3F reconciler creates the underlying Three.js objects on mount → `useFrame` hooks run every animation frame for time-based updates (input, movement, camera) → Three's `WebGLRenderer` draws the frame. No manual `renderer.render()` call exists (R3F manages the render loop internally), and no `frameloop="demand"` optimization is used (the canvas always renders continuously at max framerate, appropriate for a game-like walkthrough, but worth knowing if battery/perf on mobile becomes a concern).

---

## 6. Player System (Deep Dive)

### Keyboard handling
- A single `useEffect` in `PlayerController` attaches `keydown`/`keyup` listeners to `window` on mount and cleans them up on unmount. Both WASD and Arrow keys map to the same four boolean flags stored in a `useRef` (`keys.current.{w,a,s,d}`), which correctly avoids triggering React re-renders on every key press (using state here would be a common R3F anti-pattern; a ref is the right call).

### Camera follow
- Not parented; recomputed and translated every frame (see §5's Camera System section for full detail). The forward vector is derived from `camera.getWorldDirection()` (flattened to XZ, normalized, with a degenerate-case fallback when looking straight up/down), and "right" is the cross product of forward and camera "up." This correctly produces camera-relative WASD movement (as in most third-person games) rather than world-relative movement.

### Movement logic
- Keyboard and joystick inputs are summed into one `moveDirection` vector per frame (keyboard: unit forward/right contributions; joystick: scaled by the analog stick's normalized x/y). The combined vector is normalized (preserving diagonal-movement speed parity) and scaled by `speed * delta` (25 units/sec, frame-rate independent via `delta`).
- The player mesh's Y rotation is smoothly interpolated (`lerp`, factor 0.1) toward the movement heading — this gives the avatar sprite a believable "facing where it's going" turn rather than snapping instantly.

### Road constraint system (raycasting)
- Before committing a movement step, the controller **recomputes the tentative next position**, then fires a `THREE.Raycaster` straight down from 10 units above that tentative position, and tests whether any hit object is named `"RoadMesh"`. If yes, the move (and matching camera translation) is applied; if no, the entire frame's movement is silently discarded (the player simply doesn't move that frame).
- This is a clever, low-effort way to get "you can only walk on roads" without a navmesh or physics engine, and it correctly uses `raycaster.intersectObjects(scene.children, true)` (recursive) so nested group hierarchies are matched.
- **Known costs of this approach** (worth flagging now, before scaling it further):
  1. A **new `THREE.Raycaster()` object is allocated every single frame** inside `useFrame` — this creates GC churn. Best practice is to create one `Raycaster` once (e.g., via `useRef` or module scope) and reuse it via `.set()` each frame (the code already calls `.set()`, so the fix is trivial: hoist the raycaster instance out of the per-frame closure).
  2. The raycast tests against **the entire scene graph** (`scene.children` recursively) every frame, including buildings, trees, and every other mesh — not just road meshes. As the number of scene objects grows into the many hundreds/low thousands (which the roadmap implies), this will become the single biggest per-frame CPU cost in the player system. A far cheaper approach once the scene grows: maintain a **separate, smaller scene/group containing only road meshes** (or a dedicated navmesh/2D polygon check) and raycast/point-test against that instead of the whole graph.
  3. Movement is **binary allow/deny per frame**, not vector-projected — if you approach a road edge at an angle, you simply stop rather than sliding along the edge (no "wall slide"). This is a minor UX rough edge, not a bug, but worth noting for future polish.

### Camera updates
- After movement (or even when stationary), the OrbitControls target is re-pointed at `player.position + (0, 1.5, 0)` every frame, and `controls.update()` is called manually (required because `PlayerController` is mutating `target` outside of OrbitControls' own internal pointer-drag handling).

### Avatar representation
- The "player" is not a 3D character model — it's a **flat double-sided plane mesh textured with `shield.jpg`**, using the same texture as both `map` and `alphaMap` (a common trick to fake background removal/transparency from a single JPEG without a real alpha channel — works but is visually limited to whatever contrast exists in the source image; a PNG with real alpha, or eventually a rigged glTF character, would be the natural upgrade).

---

## 7. Buildings System

### How buildings are created
Entirely **procedurally, in-code, from primitive Three.js geometry** — `boxGeometry`, `cylinderGeometry`, `sphereGeometry`, `coneGeometry`, `planeGeometry`, composed into building "shapes" via nested `<group>`s. There is **no imported 3D model** (no `.glb`/`.gltf`, no `GLTFLoader`/`useGLTF` usage anywhere in the codebase) — every column, window, dome, and stripe is hand-authored geometry with hand-tuned dimensions and offsets.

Two reusable builder patterns exist:
- `MultiStoryBuilding` + `WindowGrid` — a generic "box building with a floor-based window grid, accent stripes, parapet, and stair tower" builder, parameterized by `position/size/floors/floorHeight/baseColor/accentColor/label`.
- `CampusGate` — a reusable ornamental gate archway (used twice: main gate, library gate).

However, the **majority of named landmark buildings** (Library, A-Block, H-Block, N-Block/MHP, bus stop, shrine, canteen shed, sports ground, farm zone) are **not** built via `MultiStoryBuilding` — they are large, bespoke, one-off inline JSX blocks with hardcoded per-mesh coordinates, comments serving as pseudo-documentation (`{/* 🏢 A-BLOCK (Administrative Block) */}`), and no shared abstraction between them. This is understandable for buildings with genuinely unique architecture (octagonal library, H-shaped block with a dome), but it means there's no single, queryable list of "all buildings" as data — the list only exists implicitly as "the sequence of JSX blocks inside `Buildings()`."

### Procedural vs. imported
100% procedural. No mesh/model assets are imported for structures; only two flat image textures (`hoarding.jpg`, `shield.jpg`) are used, both as simple plane decals, not as building materials.

### How coordinates are managed
Purely as **hardcoded magic numbers** scattered through JSX (`position={[52, 0, -12.0]}`, `position={[-25.0, 0, -40.0]}`, etc.), each accompanied by an explanatory code comment describing intent ("Rotated 180deg to face inward towards H-Block"). There is a **loose, informal consistency** between `Buildings.jsx` and `Zones.jsx` — e.g., the library's zone entry in `ZONES` (`pos: [-25.0, 0, -40.0]`) matches the library group's position in `Buildings.jsx` — but this consistency is maintained **by convention and manual copy-paste discipline, not by a shared source of truth**. If someone moves the library in `Buildings.jsx` without also updating `Zones.jsx`, nothing will catch the drift.

### How buildings can become interactive (assessment for future work)
Currently: not at all — there's no `onClick`/`onPointerOver` on any building mesh, and no way to ask "which building is this" from a click event, because there is no per-building identity/metadata attached to any mesh or group (no `userData`, no `name` prop beyond the incidental `"RoadMesh"` naming convention used for the road-raycast system).

To make buildings interactive, the architecture will need (see §13 for the full recommendation):
1. A **campus data model** — a single source-of-truth array/object per building (id, name, category, position, description, metadata) analogous to `Zones.jsx`'s `ZONES` array, but building-scoped and richer.
2. Each building's outer `<group>` wrapped with pointer event handlers (`onClick`, `onPointerOver`/`onPointerOut`) reading/writing that ID into shared UI state (Context or a small store), so a click can open an information panel, trigger a camera fly-to, or highlight the building.
3. Ideally, the *visual construction* of a building (its meshes) and its *data record* (id/name/position) should be co-located or linked by a shared ID, not duplicated between `Buildings.jsx` and `Zones.jsx` as they currently are for zones.

---

## 8. Roads System

### How roads are created
A single reusable primitive, `RoadSegment`, generates: (a) one flat asphalt `planeGeometry` named `"RoadMesh"` (the load-bearing name for the movement-constraint raycast), (b) optional low knee-height boundary walls on either side, with support for "holes" (gaps in the wall, e.g., for driveways/entrances) via an interval-subtraction algorithm (`getWallSegments`), and (c) optional roadside trees spaced every 15 units, also gap-aware via the same "holes" concept.

The full road network (`Roads()`) is then assembled as a **long, hardcoded sequence of `RoadSegment` instances and a couple of bespoke pieces** (the diagonal highway as a raw rotated plane, a full-circle `ringGeometry` "circle road" around the library, and hand-placed parking-line meshes), each positioned/rotated/sized via more hardcoded magic numbers, annotated with descriptive comments ("Segment 2: Right Road 8 to Library Gate Road 6").

### How movement constraints work
Every road-surface mesh (whether a `RoadSegment`'s asphalt plane, the highway plane, or the ring road) is deliberately named `"RoadMesh"`. `PlayerController`'s per-frame downward raycast checks for that literal string among hit objects (see §6) — this is essentially a **naming-convention-based, ad hoc "walkable surface" tag system**, standing in for a proper navmesh.

### Future improvements (architectural recommendation)
1. **Replace the "magic string" walkability convention with a structured tag**, e.g. `userData.walkable = true` on road meshes, or (better long-term) a real navigation mesh / 2D polygon-based walkable-area check computed once and queried cheaply, rather than raycasting the whole scene every frame (see §6's raycasting cost discussion).
2. **Data-drive the road network** the way `Zones.jsx` data-drives zones — a `ROADS` array of segment definitions (start/end points or position/rotation/length + wall/tree flags) would make the network easier to visualize, validate, and programmatically derive a navmesh or minimap path graph from, instead of it existing only as sequential JSX calls.
3. **Precompute/bake the roadside tree and parking-line placement** rather than recomputing them via `useMemo` per `RoadSegment` instance on every mount (already memoized per-segment, which is good, but the underlying geometry is still one mesh per tree/line — an instancing opportunity, see §10).
4. Road segments currently must be manually aligned end-to-end by tuning position/length by hand (as the comments make clear — "Extended length to 90 and position to 45 so it perfectly meets the shifted diagonal highway"); a small "path builder" abstraction (define a polyline of waypoints, derive segment transforms automatically) would remove an entire class of manual-alignment bugs as the network grows.

---

## 9. Zones System

### Purpose
`Zones.jsx` provides two related but distinct things:
1. **`ZONES`** — a genuinely data-driven array (id, label, size, color, position) rendered as large, mostly-invisible (`opacity: 0.2`) colored ground planes under/around buildings. These appear to serve as (a) a soft visual "this area belongs to X" cue, and (b) — importantly — **the closest thing in the codebase to a real building/area registry**, since it's the only place building-like entities exist as structured data rather than as JSX call sequences.
2. **Boundary walls** — low decorative campus perimeter walls (including one large partial-`ringGeometry` sweeping curved wall) marking the edge of walkable campus grounds, unrelated to the `ZONES` array itself (they're separately hardcoded).

### Rendering
Simple: `ZONES.map(...)` renders one semi-transparent ground plane per zone; boundary walls are individually placed `BoundaryWall` instances (each itself two stacked box meshes: a solid lower "planter wall" look and a semi-transparent wireframe upper "fence" look).

### Opportunities for expansion
- **`ZONES` is the natural seed for the future "campus data model"** described in §7 and §13 — it already has the right shape (id, label, position, size) to be extended with metadata (description, category, opening hours, images, icon) and reused for search results, minimap pins, and info panels, rather than inventing a second, parallel data structure.
- Currently `ZONES` and the actual building positions in `Buildings.jsx` are **two independently hand-maintained sources that happen to roughly agree** — unifying them (buildings reference/derive from the same data used to draw their zone overlay) removes an entire class of "the zone highlight doesn't match the building" bugs as the map grows.
- Zone ground planes could double as **click targets for "select this area"** interactions (e.g., tapping a zone label on a minimap) once pointer events and shared UI state exist.

---

## 10. Performance Review

### Rendering efficiency
- **No instancing anywhere**, despite obvious candidates: windows (`WindowGrid` produces potentially 50+ individual `<mesh>` per building face), roadside trees (repeated every 15 units along many multi-hundred-unit road segments), boundary-wall segments, farm-zone trees, parking-line stripes. Each is a **separate draw call and a separate GPU buffer upload**, even though geometry and material are identical within each group. Converting these repeated-geometry groups to `THREE.InstancedMesh` (via drei's `<Instances>`/`<Instance>` helpers, which are already an available dependency since `@react-three/drei` is installed) would be the single highest-leverage performance improvement available today, and becomes non-optional once building count multiplies per the roadmap.
- **No LOD (level of detail) system** — distant buildings render with the same mesh complexity as nearby ones. Not urgent yet at ~300 meshes, but will matter once the roadmap's building count/detail grows.
- **No frustum-based or distance-based culling beyond what Three.js does automatically** — the fog hides things visually past 600 units but does not stop them from being rendered/shaded.

### React performance
- Good discipline overall: no per-frame React state updates, correct ref usage for animation-loop data (keys, player, joystick), correct `useMemo` usage for the two most expensive derived-array computations (`windowConfig`, tree/wall segment lists).
- `Buildings()`, `Roads()`, `Zones()` are large single components with no internal memoization boundaries (no `React.memo`), but since none of them currently receive changing props or re-render after mount, this is a non-issue *today*. It will become relevant the moment any of them start accepting props (e.g., a "selected building ID" prop) — at that point, wrapping sibling sub-components in `React.memo` will be necessary to avoid one selection change forcing all ~300 sibling meshes to re-reconcile.

### Three.js performance
- **Per-frame `new THREE.Raycaster()` allocation** in `PlayerController` (see §6) — should be hoisted to a persistent instance.
- **Full-scene-graph raycasting** every frame for the road check — will not scale gracefully; needs a scoped "roads-only" object list or navmesh once the scene grows (see §6, §8).
- **Shadow map**: single 2048×2048 directional-light shadow map covering the whole (large, sprawling) campus — as the campus grows in area, shadow resolution-per-unit-area will drop, causing blocky/aliased shadows unless the shadow camera's frustum is tuned (`shadow-camera-left/right/top/bottom`) to tightly bound the actually-visible/actually-relevant area, or cascaded shadow maps are introduced.
- **Materials**: heavy reliance on flat-colored `meshStandardMaterial` (good for performance — no extra texture memory) rather than textures for most surfaces; the tradeoff is thousands of individual small meshes (windows) instead of fewer meshes with texture-mapped detail. From a pure GPU-memory standpoint this is fine; from a **draw-call count** standpoint (which is usually the actual bottleneck in WebGL) it is the opposite of ideal.

### Memory usage
- Not a concern yet — no large textures (only two JPEGs, `hoarding.jpg` and `shield.jpg`), no imported 3D models, geometry is all simple parametric primitives. Memory will start to matter once glTF models, higher-res textures, and many more buildings enter the picture (see §13's recommendation to introduce compressed textures/Draco-compressed models early, before it's a retrofit problem).

### Possible bottlenecks (ranked)
1. Draw-call count from non-instanced repeated geometry (windows, trees, parking lines, wall segments) — **biggest scalability risk**.
2. Per-frame full-scene raycast for road constraint — **biggest per-frame CPU cost**, worsens linearly as scene grows.
3. Shadow map resolution vs. campus footprint — **visual quality risk**, not yet a hard performance bottleneck.
4. Uncapped continuous render loop (`frameloop="always"` default) — fine for desktop, worth revisiting for mobile battery life.

---

## 11. Code Quality Review

### Readability
Generally good at the micro level — descriptive variable names, consistent formatting, helpful inline comments explaining *why* a magic number was chosen (e.g., "Extended length to 90 ... so it perfectly meets the shifted diagonal highway"). The comment style compensates somewhat for the lack of a data model by documenting intent inline, but this only helps a reader *understanding* the code, not a future feature *querying* it programmatically.

### Maintainability
- `Buildings.jsx`'s 1,255-line, single-export-function structure is the biggest maintainability risk in the repo today. Any change to one landmark requires scrolling through an enormous file, and there's meaningful risk of merge conflicts once more than one person edits campus content simultaneously.
- Coordinate consistency between `Zones.jsx` and `Buildings.jsx` is maintained by convention, not by a shared source of truth — a real (if currently low-probability) drift risk.
- Dead code (`Player.jsx`, unused assets, unused CSS) adds cognitive overhead for anyone new to the repo trying to determine "what's actually live."

### Modularity
- `Roads.jsx` and, to a lesser extent, `Zones.jsx` demonstrate the right pattern (a reusable parameterized primitive + a data/composition list). `Buildings.jsx` demonstrates the same pattern for generic buildings (`MultiStoryBuilding`) but abandons it for every named landmark, which are each fully bespoke. This inconsistency, more than any individual line of code, is the main "code quality" issue to address before the building count grows further.

### Scalability
- The current "one giant function returns one giant `<group>`" pattern for `Buildings()` will not scale gracefully past its current size — every new building is more lines in an already-1,255-line file, with no natural per-building code boundary (file, or at minimum, extracted named component) enforced.
- The lack of any building/zone/POI data model is the single biggest scalability blocker for the *feature* roadmap (search, info panels, minimap, tours all need "the list of things on campus" as queryable data, which doesn't yet exist).

### Reusability
- `WindowGrid`, `MultiStoryBuilding`, `RoadSegment`, `CampusGate`, `BoundaryWall` are all genuinely reusable, well-parameterized primitives — this is a real strength of the current code and a good foundation to build on.
- The bespoke landmark buildings, by contrast, have zero reusability — each is single-use code that could not be easily reconfigured to build "a different building of the same general shape."

---

## 12. Architecture Weaknesses (highest → lowest priority)

1. **No campus data model.** Buildings, POIs, and (partially) zones exist only as JSX/code, not as structured, queryable data. Every planned feature (search, minimap, info panels, event mode, guided tours) depends on this data existing first. This is the #1 architectural gap.
2. **No interaction/UI state layer.** There is no Context/store for "selected building," "active UI panel," "tour step," etc. Every future interactive feature needs this, and retrofitting it later (once many components need to read/write shared state) is more disruptive than introducing a lightweight store now.
3. **Dead/competing player-movement code (`Player.jsx`).** A second, Rapier-physics-based player implementation sits unused in the tree. Left alone, it risks confusing future contributors about which movement system is authoritative, and it keeps `@react-three/rapier` as a "why is this installed?" dependency.
4. **`Buildings.jsx` monolith (1,255 lines, single function).** Highest-risk file for merge conflicts and cognitive load; no per-building code boundaries.
5. **Full-scene raycasting every frame for road-constraint movement.** Works today; will degrade linearly as scene complexity grows, and is the most likely near-term performance regression source.
6. **No geometry instancing for repeated elements** (windows, trees, wall segments, parking lines). Currently invisible as a problem because the scene is "only" ~300 meshes; will become visible the moment the roadmap's additional buildings/detail are added.
7. **Duplicated/parallel position data between `Zones.jsx` and `Buildings.jsx`**, maintained only by convention. Low current risk, but a structural landmine — nothing prevents silent drift.
8. **No automated tests, no CI.** The three `test_*` scripts are manual, machine-specific debugging aids, not a regression safety net. As interactive features are added (click handlers, state transitions, tour logic), the absence of any test coverage becomes a real risk to shipping confidently.
9. **Dead CSS/assets** (`App.css` template boilerplate, unused images). Cosmetic, but adds noise for new contributors.
10. **Root-level developer debug scripts and artifacts** (`test_console.js/.cjs`, `test_screenshot.cjs`, `debug_screenshot.png`) committed alongside production source, with hardcoded Windows-specific paths. Should be relocated/removed or replaced with a proper cross-platform dev-tooling setup if this kind of visual/console debugging is still valuable.
11. **`README.md` is the unmodified Vite template.** Not a functional problem, but it means there is currently zero onboarding documentation specific to this project (how to run it, campus data conventions, coordinate system, how to add a building) — worth fixing early, especially with a stated intent to grow this into a bigger platform with (presumably) more contributors.

---

## 13. Future Architecture — Recommendation

The rendering foundation (Buildings/Roads/Zones as declarative R3F scene content, plus a working movement/camera controller) is worth keeping. The recommended evolution is to introduce three new layers **around** the existing rendering layer, without rewriting it:

### Layer 1 — Campus Data Model (new)
A single, framework-agnostic data source (plain JS/JSON, or eventually a small local database/CMS) describing every building, zone, and POI: `{ id, name, category, position, rotation?, footprint, description, images?, tags?, openingHours?, isInteractive }`. `Zones.jsx`'s existing `ZONES` array is the natural starting seed for this — it already has the right shape. Buildings in `Buildings.jsx` would reference entries in this model by `id` instead of duplicating raw coordinates.

This single change unlocks nearly everything else on the roadmap: search (query the data model), minimap (project the data model's positions to 2D), info panels (render the data model's description/images), guided tour (an ordered list of IDs from the same data model), event mode (a filtered/overlaid subset of the same model).

### Layer 2 — Interaction & UI State Layer (new)
A lightweight shared store (React Context is sufficient at first; Zustand is the more idiomatic long-term choice in the R3F ecosystem and avoids Context re-render footguns) holding cross-cutting UI state: `selectedBuildingId`, `hoveredBuildingId`, `activePanel`, `tourActive/tourStepIndex`, `eventModeActive`. Building meshes gain `onClick`/`onPointerOver` handlers that write into this store; DOM-level UI (search bar, info panel, minimap, tour controls) reads from it. This cleanly separates "3D scene" concerns from "application UI" concerns, which today are only weakly separated (the DOM overlay in `App.jsx` is currently just static instructional text).

### Layer 3 — Camera & Navigation Services (extension of existing PlayerController)
Extract `PlayerController` out of `App.jsx` into its own module/folder, and introduce a small camera-service layer (fly-to-target animation, tour waypoint traversal, "look at building" framing) that can temporarily take control of the camera away from the player-follow behavior and hand it back — this is what "Camera fly-to" and "Guided tour" ultimately need, and it's cleanly additive to the existing controller rather than a rewrite.

### Supporting changes
- Replace the per-frame full-scene raycast with either a dedicated "roads" object list/ref, or (further out) a proper navmesh, as building/road count grows (§6, §8, §10).
- Introduce `InstancedMesh`/`@react-three/drei`'s `<Instances>` for windows, trees, and repeated wall/parking segments (§10).
- Decide, before the building count grows much further, whether hand-authored primitive geometry remains viable or whether some future buildings should be authored as lightweight glTF models (via Blender or similar) and loaded with `useGLTF` — mixing both is fine, but it's worth deciding deliberately rather than defaulting to "always more inline JSX."
- Split `Buildings.jsx` by landmark (see §14) once the data model exists, so each building's visual construction can be co-located with (or reference) its data-model entry.
- Introduce a minimal test setup (Vitest for logic/unit tests — e.g., the road "holes" segment-subtraction algorithm, the data model — and consider Playwright only later for true end-to-end smoke tests) so interactive features can be shipped with some regression confidence.

---

## 14. Suggested Folder Structure (for future development)

```
src/
├── main.jsx
├── App.jsx                      Thin composition root only (Canvas + top-level layout)
├── index.css
│
├── data/                        NEW — the campus data model (Layer 1)
│   ├── buildings.js              Building records (id, name, position, metadata...)
│   ├── zones.js                  Zone records (existing ZONES array, relocated)
│   ├── roads.js                  Road segment definitions as data, not inline JSX calls
│   └── pointsOfInterest.js       Future: benches, statues, signage, event markers
│
├── state/                        NEW — shared UI/interaction state (Layer 2)
│   ├── CampusStateProvider.jsx    Context or Zustand store: selection, active panel, tour state
│   └── useCampusStore.js
│
├── scene/                        Renamed/reorganized from "components" — pure 3D scene content
│   ├── environment/
│   │   ├── Sky.jsx                Extracted lighting/sky/fog setup
│   │   └── Ground.jsx             Extracted ground plane
│   ├── buildings/
│   │   ├── Buildings.jsx          Thin composition: maps data/buildings.js → building components
│   │   ├── primitives/
│   │   │   ├── MultiStoryBuilding.jsx
│   │   │   ├── WindowGrid.jsx
│   │   │   └── CampusGate.jsx
│   │   └── landmarks/             One file per bespoke landmark (split out of the 1,255-line monolith)
│   │       ├── Library.jsx
│   │       ├── ABlock.jsx
│   │       ├── HBlock.jsx
│   │       ├── NBlockMHP.jsx
│   │       ├── BusStop.jsx
│   │       ├── Shrine.jsx
│   │       ├── Canteen.jsx
│   │       ├── SportsGround.jsx
│   │       └── FarmZone.jsx
│   ├── roads/
│   │   ├── Roads.jsx               Thin composition: maps data/roads.js → RoadSegment
│   │   └── RoadSegment.jsx
│   └── zones/
│       ├── Zones.jsx
│       └── BoundaryWall.jsx
│
├── player/                        Extracted from App.jsx (Layer 3 base)
│   ├── PlayerController.jsx
│   ├── PlayerAvatar.jsx
│   └── useRoadConstraint.js        Extracted raycasting logic, hoisted Raycaster instance
│
├── camera/                        NEW — camera services (Layer 3 extension)
│   ├── CameraFlyTo.jsx
│   └── useGuidedTour.js
│
├── ui/                            NEW — DOM-level UI, separate from 3D scene
│   ├── InstructionsOverlay.jsx     Extracted from App.jsx
│   ├── Joystick.jsx                (relocated, unchanged)
│   ├── SearchBar.jsx               Future
│   ├── BuildingInfoPanel.jsx       Future
│   ├── Minimap.jsx                 Future
│   └── EventModeToggle.jsx         Future
│
├── assets/                        Only actually-used assets (prune dead template files)
└── styles/
    └── (index.css content; remove dead App.css or repurpose it)

tools/                             Relocated from project root
└── debug/
    ├── test_console.cjs
    └── test_screenshot.cjs
```

This structure is a **direct extension** of the current one — nothing here requires discarding existing working code; it's a relocation/splitting exercise plus three genuinely new layers (`data/`, `state/`, `camera/`).

---

## 15. Feature Roadmap (Phased, with Priority)

### Phase 0 — Foundation Cleanup *(do this before any new feature work)*
*Priority: Critical — everything else compounds on top of this.*
- Remove or clearly quarantine `Player.jsx` (dead Rapier-based controller) and decide whether `@react-three/rapier` stays a dependency at all.
- Remove dead CSS (`App.css` template boilerplate) and unused assets (`hero.png`, `react.svg`, `vite.svg`, `icons.svg`).
- Relocate the manual debug scripts (`test_console.js/.cjs`, `test_screenshot.cjs`) out of the project root into a `tools/` folder, and note their Windows-specific hardcoded paths (or replace with a portable equivalent).
- Write a real, project-specific `README.md` (run instructions, coordinate conventions, how to add a building/road/zone).
- Hoist the `THREE.Raycaster` in `PlayerController` out of the per-frame closure into a persistent instance.

### Phase 1 — Campus Data Model
*Priority: Highest feature priority — this unblocks every other future feature.*
- Introduce `data/buildings.js`, formalize `data/zones.js` (from the existing `ZONES` array), and `data/roads.js`.
- Refactor `Buildings.jsx`/`Roads.jsx`/`Zones.jsx` to read positions/metadata from this data rather than (or in addition to) inline literals, without changing their visual output.
- Split `Buildings.jsx` into per-landmark files (per §14), purely a mechanical extraction, no behavior change.

### Phase 2 — Interactivity Core
*Priority: High — required for Building Info, Search, and Event Mode.*
- Introduce shared UI/interaction state (Context or Zustand).
- Add `onClick`/`onPointerOver` handlers to building groups, wired to the data model's `id`s.
- Building metadata display: a basic `BuildingInfoPanel` DOM overlay showing name/description on selection.
- Building labels: promote the ad hoc `<Text>` signage already present into a consistent, data-driven "always show building name" system (toggleable).

### Phase 3 — Navigation & Wayfinding
*Priority: High — the core "digital campus platform" value proposition.*
- Search: a DOM search box querying the Phase 1 data model by name/category, resulting in a selectable list.
- Camera fly-to: extracted camera service (§13, Layer 3) that smoothly animates the camera/OrbitControls target to a selected building, then hands control back to `PlayerController`.
- Minimap: a simple top-down orthographic mini-render (or a 2D canvas/SVG projection of the data model's positions) showing player position + building markers.

### Phase 4 — Guided Experiences
*Priority: Medium — high visibility for Mahotsav/visitor use cases, but depends on Phases 1–3.*
- Guided tour: an ordered sequence of data-model IDs, driven by the Phase 3 camera-fly-to service, with "next/previous/skip" UI controls.
- Event mode: a filtered/overlaid view of the data model (event-specific markers, temporary signage, possibly a different starting camera position), toggleable without needing a second build of the app.
- Dynamic event markers: floating icons/labels at specific coordinates for Mahotsav stalls/stages, likely reusing the same `<Text>`/billboard-sprite techniques already proven in `Buildings.jsx`/`PlayerController`.

### Phase 5 — Performance & Scale Hardening
*Priority: Medium-High — becomes urgent as Phases 1–4 add content, but not blocking to start those phases.*
- Convert repeated geometry (windows, trees, wall segments, parking lines) to `InstancedMesh`/drei `<Instances>`.
- Replace full-scene road raycasting with a scoped roads-only check or navmesh.
- Introduce LOD for distant buildings if/when the campus footprint or building count grows substantially.
- Tune the shadow camera frustum (or move to cascaded shadows) if the visible campus area grows.

### Phase 6 — Platform Polish & Sustainability
*Priority: Medium — important for long-term maintainability, not user-facing.*
- Introduce a minimal automated test suite (unit tests for the data model and any pure-logic utilities like the road "holes" algorithm; smoke tests for critical interactions).
- Decide on and, if adopted, migrate some future buildings to glTF-authored models (with Draco/Meshopt compression) rather than always-inline procedural geometry, if visual fidelity demands outpace what primitive geometry can reasonably deliver.
- CI setup (lint + build + tests) once a test suite exists.

---

## 16. Development Recommendations (before any coding begins)

1. **Do Phase 0 first, as its own small PR/commit set**, before touching any feature work — it's low-risk, high-clarity-value, and prevents new work from being built on top of ambiguous dead code.
2. **Treat the Campus Data Model (Phase 1) as the true "next big architectural decision,"** not a feature — get alignment on its shape (fields, ID scheme, whether it lives in JS objects, JSON, or eventually a lightweight CMS/database) before writing any interactivity code against it, since every later feature (search, minimap, tours, info panels) will depend on this shape being right.
3. **Extract, don't rewrite.** `PlayerController`, `Buildings`, `Roads`, `Zones` all work today and encode real, hard-won coordinate-tuning effort (the comments make clear how much manual alignment went into the road network especially) — the recommended folder restructuring (§14) is explicitly a *relocation and splitting* exercise, not a rewrite, in line with the stated development principle of never rewriting working code without clear reason.
4. **Introduce shared state (Zustand/Context) before the first interactive feature, not during it** — retrofitting shared state after two or three components have already grown ad hoc local state for overlapping concerns (selection, panels, tour progress) is more expensive than starting with the right shape.
5. **Fix the per-frame Raycaster allocation and consider scoping the road raycast early** — it's a small, low-risk fix today, and increasingly expensive to justify delaying as more scene content is added per the roadmap.
6. **Decide the instancing strategy before adding many more repeated elements** (more buildings means more windows/trees) — retrofitting `InstancedMesh` after dozens more buildings exist in hand-authored form is a larger refactor than adopting the pattern now, at ~300 meshes, while the codebase is still small enough to convert confidently.
7. **Write the project-specific README and establish a lightweight "how to add a building/zone/road" convention doc early** — the current implicit conventions (coordinate consistency between files, the `"RoadMesh"` naming convention, comment-based documentation of intent) work today only because one contributor understands them from memory; they need to be written down before more people touch this code.
8. **Adopt feature branches per the existing Git workflow policy** and land Phase 0 cleanup, the data model, and each subsequent phase as separate, reviewable PRs — given the roadmap's breadth, staging this work is what will keep "clean, scalable, and easy to maintain" true throughout, rather than only true at the start.

---

*End of architectural review. No source files were modified as part of this analysis, per instructions. This document reflects the state of the codebase as extracted from `Vignan_3d_Campus.zip`.*
