import { useMemo } from 'react';
import * as THREE from 'three';

function RoadSegment({ length, position, rotation, width = 12, hasTrees = true, hasTreesLeft = true, hasTreesRight = true, hasWalls = true, holesLeft = [], holesRight = [] }) {
  const getWallSegments = (len, holes) => {
    if (!holes || holes.length === 0) return [{ start: -len/2, end: len/2 }];
    let segments = [];
    let currentZ = -len / 2;
    const sortedHoles = [...holes].sort((a, b) => a.start - b.start);
    for (const h of sortedHoles) {
      if (h.start > currentZ) {
        segments.push({ start: currentZ, end: h.start });
      }
      currentZ = Math.max(currentZ, h.end);
    }
    if (currentZ < len / 2) {
      segments.push({ start: currentZ, end: len / 2 });
    }
    return segments;
  };

  const leftWallSegments = useMemo(() => getWallSegments(length, holesLeft), [length, holesLeft]);
  const rightWallSegments = useMemo(() => getWallSegments(length, holesRight), [length, holesRight]);

  const leftTrees = useMemo(() => {
    const arr = [];
    for (let i = -length / 2 + 5; i < length / 2; i += 15) {
      if (!holesLeft.some(h => i >= h.start - 5 && i <= h.end + 5)) arr.push(i);
    }
    return arr;
  }, [length, holesLeft]);

  const rightTrees = useMemo(() => {
    const arr = [];
    for (let i = -length / 2 + 5; i < length / 2; i += 15) {
      if (!holesRight.some(h => i >= h.start - 5 && i <= h.end + 5)) arr.push(i);
    }
    return arr;
  }, [length, holesRight]);

  return (
    <group position={position} rotation={rotation}>
      {/* Asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} name="RoadMesh">
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Left low wall (knee height ~0.5m) */}
      {hasWalls && leftWallSegments.map((seg, idx) => {
        const segLen = seg.end - seg.start;
        if (segLen <= 0) return null;
        const segCenter = seg.start + segLen / 2;
        return (
          <mesh key={`lw-${idx}`} position={[-width / 2 - 0.5, 0.25, segCenter]}>
            <boxGeometry args={[1, 0.5, segLen]} />
            <meshStandardMaterial color="#999999" />
          </mesh>
        );
      })}
      
      {/* Right low wall */}
      {hasWalls && rightWallSegments.map((seg, idx) => {
        const segLen = seg.end - seg.start;
        if (segLen <= 0) return null;
        const segCenter = seg.start + segLen / 2;
        return (
          <mesh key={`rw-${idx}`} position={[width / 2 + 0.5, 0.25, segCenter]}>
            <boxGeometry args={[1, 0.5, segLen]} />
            <meshStandardMaterial color="#999999" />
          </mesh>
        );
      })}

      {/* Trees Left */}
      {(hasTrees && hasTreesLeft) && leftTrees.map((z, idx) => (
        <group key={`tl-${idx}`} position={[-width / 2 - 2, 0, z]}>
          <mesh position={[0, 1, 0]}>
             <cylinderGeometry args={[0.3, 0.3, 2]} />
             <meshStandardMaterial color="#5C4033" />
          </mesh>
          <mesh position={[0, 3.5, 0]}>
             <sphereGeometry args={[2.5, 7, 7]} />
             <meshStandardMaterial color="#2E8B57" />
          </mesh>
        </group>
      ))}

      {/* Trees Right */}
      {(hasTrees && hasTreesRight) && rightTrees.map((z, idx) => (
        <group key={`tr-${idx}`} position={[width / 2 + 2, 0, z]}>
          <mesh position={[0, 1, 0]}>
             <cylinderGeometry args={[0.3, 0.3, 2]} />
             <meshStandardMaterial color="#5C4033" />
          </mesh>
          <mesh position={[0, 3.5, 0]}>
             <sphereGeometry args={[2.5, 7, 7]} />
             <meshStandardMaterial color="#2E8B57" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Roads() {
  return (
    <group>
      {/* 1. Highway (SH 261) outside campus (No low walls, just flat road) */}
      {/* Diagonal road connecting [-110, -60] (Library Gate) to [0, 70] (Approach Road) */}
      <group position={[-55, 0.01, 5]} rotation={[0, Math.atan2(110, 130), 0]}>
        {/* Shifted locally by -15 in X to push it away from clipping into the gates */}
        <mesh position={[-15, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} name="RoadMesh">
          <planeGeometry args={[20, 600]} />
          <meshStandardMaterial color="#222" /> 
        </mesh>
      </group>

      {/* 2. Approach Road (Highway to Main Gate) */}
      {/* Extended length to 90 and position to 45 so it perfectly meets the shifted diagonal highway */}
      <RoadSegment length={90} position={[0, 0, 45]} rotation={[0, 0, 0]} hasTrees={false} hasWalls={false} />

      {/* (Old security canopy removed because it's built in Buildings.jsx) */}

      {/* 4. Main Campus Spine Road (Gate to Deep Campus) */}
      {/* Segment 1: Gate to Right Road 8 */}
      <RoadSegment length={34} position={[0, 0, -17]} rotation={[0, 0, 0]} hasTreesRight={false} />
      <RoadSegment length={12} position={[0, 0, -40]} rotation={[0, 0, 0]} hasTrees={false} hasWalls={false} />
      
      {/* Segment 2: Right Road 8 to Library Gate Road 6 */}
      <RoadSegment length={8} position={[0, 0, -50]} rotation={[0, 0, 0]} hasTreesRight={false} />
      <RoadSegment length={12} position={[0, 0, -60]} rotation={[0, 0, 0]} hasTrees={false} hasWalls={false} />

      {/* Segment 3: Library Gate Road 6 to Right Road 10 */}
      <RoadSegment length={33} position={[0, 0, -82.5]} rotation={[0, 0, 0]} hasTreesLeft={false} />
      <RoadSegment length={12} position={[0, 0, -105]} rotation={[0, 0, 0]} hasTrees={false} hasWalls={false} />

      {/* Segment 4: Right Road 10 to Left Road 9 */}
      <RoadSegment length={13} position={[0, 0, -117.5]} rotation={[0, 0, 0]} hasTreesLeft={false} />
      <RoadSegment length={12} position={[0, 0, -130]} rotation={[0, 0, 0]} hasTrees={false} hasWalls={false} />

      {/* Segment 5: Left Road 9 to Z=-140 */}
      <RoadSegment length={4} position={[0, 0, -138]} rotation={[0, 0, 0]} />

      {/* 5. Left Circle Road (Around NTR Library) */}
      <group position={[-25, 0, -40]}>
        {/* Asphalt Ring (Full 360 Circle) */}
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} name="RoadMesh">
          <ringGeometry args={[15, 27, 32]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        
        {/* Low walls removed to prevent clipping at intersections */}
      </group>

      {/* 6. Lara / Library Gate Road (Stretching to Main Spine Road) */}
      <RoadSegment length={104} position={[-58, 0, -60]} rotation={[0, Math.PI / 2, 0]} hasWalls={false} hasTreesRight={false} />

      {/* Parking Markings from Library Gate to Library Circle Intersection */}
      <group position={[0, 0, 0]}>
        {/* Drawing parking lines every 3 units along the south edge of the road */}
        {Array.from({ length: 22 }).map((_, i) => {
          const startX = -108;
          const spacing = 3;
          const xPos = startX + (i * spacing);
          return (
            <mesh key={`parking-${i}`} position={[xPos, 0.04, -63.5]} receiveShadow>
              <boxGeometry args={[0.2, 0.01, 5]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          );
        })}
        {/* Long connecting line to frame the parking bays */}
        <mesh position={[-76.5, 0.04, -61]} receiveShadow>
          <boxGeometry args={[63, 0.01, 0.2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* 8. Right Road (to A-Block & H-Block, opposite circle end) */}
      <RoadSegment length={94} position={[53, 0, -40]} rotation={[0, Math.PI / 2, 0]} hasTreesLeft={false} />

      {/* 9. Left Road (Between Farm and N-Block) */}
      <RoadSegment length={94} position={[-53, 0, -130]} rotation={[0, Math.PI / 2, 0]} hasTreesLeft={false} />

      {/* 10. Right Road (Between H-Block and Ground) */}
      <RoadSegment length={94} position={[53, 0, -105]} rotation={[0, Math.PI / 2, 0]} hasTreesLeft={false} holesLeft={[{start: 16, end: 28}]} />

      {/* 11. Further spine road past N-Block / Hostel (Extended to Z=-340 to connect new western sectors) */}
      <RoadSegment length={200} position={[0, 0, -240]} rotation={[0, 0, 0]} holesLeft={[{start: -36, end: -24}]} />

      {/* 14. New West Road (Between U-Block and Cricket Ground) */}
      <RoadSegment length={270} position={[-135, 0, -270]} rotation={[0, Math.PI / 2, 0]} />

      {/* 12. Vertical Road from Hostel Gate to H-Block Road (Z=-111 edge) */}
      <RoadSegment length={59} position={[75, 0, -140.5]} rotation={[0, 0, 0]} hasTreesRight={false} holesRight={[{start: 0.5, end: 7.5}]} />

      {/* 13. Horizontal Road between AC Hostel and Canteen */}
      <RoadSegment length={19} position={[90.5, 0, -136.5]} rotation={[0, Math.PI / 2, 0]} width={7} hasTreesLeft={false} />
    </group>
  );
}
