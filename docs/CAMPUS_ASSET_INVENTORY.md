# Campus asset inventory — baseline

This inventory comes only from the supplied satellite screenshots and venue diagram, compared with the procedural prototype. It is not a surveyed site plan: scene-space positions are retained only to prevent visual regression until aerial-image calibration is available.

## Existing prototype assets

| Asset | Category | Scene-space position | Assessment |
| --- | --- | --- | --- |
| Main Gate and Library Gate | entrance | `[0,0,0]`, `[-110,0,-60]` | Present, but their relationship to SH 261 and the real access points needs recalibration. |
| Vignan Bus Stop | transport | `[-55,0.01,5]` | Present; approximate only. |
| NTR Vignan Library | academic | `[-25,0,-40]` | Present; needs footprint/orientation confirmation. |
| A-Block | academic | `[52,0,-12]` | Present; oversized relative to the reference plan. |
| H-Block | academic | `[55,0,-72.5]` | Present; satellite label confirms the block, but its footprint and surrounding roads need rebuilding. |
| N-Block and MHP | academic / student life | `[-53.5,0,-161]`, `[-31.5,0,-148]` | Present; placed as one remote frontage instead of the compact central cluster shown in the venue plan. |
| Boys Hostel | residential | `[40,0,-165]` | Present; needs orientation/footprint confirmation. |
| AC Hostel, Canteen Shed, Utility Buildings, Farm Zone, Shrine | provisional assets | registry | Prototype-only placeholders; retain for visual continuity, validate before detailed work. |
| Cricket & Hockey Field, Walking Track Ground | sports | `[135,0,-93]`, `[38,0.05,-126.5]` | Present, but sports uses are conflated and their positions/scale need recalibration. |

## Missing assets

Vignan LARA Institute; Vignan Pharmacy College; Convocation Hall; U-Block; Sports Arenas 1 and 2; Amusement Arena / Flea Market; Vignan Pond; Girls Hostel; volleyball, basketball, throwball, badminton and tennikoit courts.

## Layout findings

1. The implementation puts its deepest buildings roughly 100 scene units south of the main gate, whereas the venue plan has its major academic and sports cluster immediately behind the highway frontage. This is a general spatial mismatch, not a claim of exact real-world coordinates.
2. Its cardinal grid and long straight spine roads do not match the angled, branching internal-road pattern visible in the satellite imagery. The SH 261 frontage is also a simplified diagonal strip.
3. A-Block, H-Block and N-Block have exaggerated footprints and are spaced as isolated landmarks; the reference plan shows tighter relationships among A-Block, H-Block, Library, MHP, N-Block and the sports facilities.
4. The prototype substitutes or invents several spaces (farm, utility buildings, AC hostel, shrine) while omitting named venue assets. These should not receive high-detail work before reference confirmation.

## Rebuild order

1. Calibrate a shared campus origin, north direction, perimeter and SH 261 frontage from a higher-resolution aerial source.
2. Rebuild road network, gates and NTR Library because they anchor every other placement.
3. Rebuild the A-Block / H-Block / Library cluster, then place LARA and Pharmacy as their own named complexes.
4. Rebuild the central sports and event cluster: Cricket Ground, Sports Arenas, Convocation Hall and courts.
5. Rebuild N-Block, MHP and U-Block.
6. Rebuild hostels and remaining landscape/event assets.

## Registry contract

`src/data/buildings.js` is the initial source of truth. Each asset has a stable id, name, category, current scene position, orientation, status and reference-confidence tag. `null` positions explicitly mean "not yet placed", rather than a guessed coordinate.
