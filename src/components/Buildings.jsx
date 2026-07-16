import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

// Helper component for loading hoarding texture
function HoardingBillboard() {
  const texture = useLoader(THREE.TextureLoader, '/hoarding.jpg');
  return (
    <group position={[0, 0, -2]}>
      {/* Billboard Support Pillars */}
      {[-5, 5].map((x) => (
        <mesh key={`hoard-${x}`} position={[x, 5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 10]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
      {/* Billboard Frame */}
      <mesh position={[0, 7, 0.2]} castShadow>
        <boxGeometry args={[14, 4.5, 0.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Image Texture Plane */}
      <mesh position={[0, 7, 0.31]}>
        <planeGeometry args={[13.5, 4]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
}

// Vignan Bus Stop (Placed across the highway, aligned parallel to the diagonal road)
function VignanBusStop() {
  return (
    <group position={[-55, 0.01, 5]} rotation={[0, Math.atan2(110, 130), 0]}>
      {/* Shift left (-35) across the highway, slide down Z (100) to align with Main Gate, face +X towards road */}
      <group position={[-35, 0, 100]} rotation={[0, Math.PI / 2, 0]}>
        {/* Concrete Base */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[40, 0.5, 6]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      
      {/* Support Pillars */}
      {[-18, -12, -6, 0, 6, 12, 18].map((x) => (
        <mesh key={`bus-pillar-${x}`} position={[x, 2.5, -1]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 4.5]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}

      {/* Roof Canopy */}
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[42, 1, 7]} />
        <meshStandardMaterial color="#FFFACD" /> {/* Lemon Chiffon / Cream */}
      </mesh>

      {/* Left Red NAAC block */}
      <mesh position={[-19, 5, 3.6]} castShadow>
        <boxGeometry args={[4, 1.1, 0.2]} />
        <meshStandardMaterial color="#DC143C" />
      </mesh>
      <Text position={[-19, 5, 3.75]} fontSize={0.5} color="white" fontWeight="bold">
        NAAC A
      </Text>

      {/* Right Red NAAC block */}
      <mesh position={[19, 5, 3.6]} castShadow>
        <boxGeometry args={[4, 1.1, 0.2]} />
        <meshStandardMaterial color="#DC143C" />
      </mesh>
      <Text position={[19, 5, 3.75]} fontSize={0.5} color="white" fontWeight="bold">
        NAAC A
      </Text>

      {/* Main Text */}
      <Text position={[0, 5, 3.6]} fontSize={1.2} color="#DC143C" fontWeight="bold">
        VIGNAN'S UNIVERSITY
      </Text>

      {/* Background Trees behind the bus stop */}
      {[-15, -5, 5, 15].map((x) => (
        <group key={`bus-tree-${x}`} position={[x, 0, -5]}>
          <mesh position={[0, 2, 0]}>
             <cylinderGeometry args={[0.5, 0.5, 4]} />
             <meshStandardMaterial color="#5C4033" />
          </mesh>
          <mesh position={[0, 7, 0]}>
             <sphereGeometry args={[6, 8, 8]} />
             <meshStandardMaterial color="#228B22" />
          </mesh>
        </group>
      ))}
      </group>
    </group>
  );
}

// Helper component for drawing repeating window grids on building facades
function WindowGrid({ width, height, floors, floorHeight, spacingX = 3.5, winW = 1.2, winH = 1.8, yOffset = 0 }) {
  const windowConfig = useMemo(() => {
    const list = [];
    const cols = Math.floor((width - 4) / spacingX);
    if (cols <= 0) return list;
    const startX = -((cols - 1) * spacingX) / 2;
    
    for (let f = 0; f < floors; f++) {
      const y = f * floorHeight + floorHeight / 2 + yOffset;
      for (let c = 0; c < cols; c++) {
        const x = startX + c * spacingX;
        list.push({ x, y });
      }
    }
    return list;
  }, [width, floors, floorHeight, spacingX, yOffset]);

  return (
    <group>
      {windowConfig.map((win, idx) => (
        <mesh key={idx} position={[win.x, win.y, 0.05]}>
          <planeGeometry args={[winW, winH]} />
          <meshStandardMaterial color="#1a2536" roughness={0.1} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// Helper component for Mud Ground with a square walking track
function MudGroundWithTrack({ position, size = [60, 25] }) {
  const [w, d] = size;
  const trackWidth = 2;
  return (
    <group position={position}>
      {/* Outer Walking Track (Gravel/Concrete Color) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#A9A9A9" roughness={0.9} /> {/* Dark Gray Track */}
      </mesh>
      
      {/* White inner border line for the track */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[w - trackWidth * 2 + 0.2, d - trackWidth * 2 + 0.2]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Inner Mud Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <planeGeometry args={[w - trackWidth * 2, d - trackWidth * 2]} />
        <meshStandardMaterial color="#8B4513" roughness={1.0} /> {/* Saddle Brown / Mud */}
      </mesh>
    </group>
  );
}

// Helper component for drawing a standard multi-story building
function MultiStoryBuilding({ 
  position, 
  size, 
  floors, 
  floorHeight = 4, 
  baseColor = "#e5e7eb", 
  accentColor = "#1e3a8a", 
  label
}) {
  const [width, depth] = size;
  const height = floors * floorHeight;
  
  // Calculate window rows
  const windowConfig = useMemo(() => {
    const list = [];
    const windowWidth = 1.2;
    const windowHeight = 1.8;
    const spacingX = 3.5;
    
    // Front and Back windows
    const cols = Math.floor((width - 4) / spacingX);
    if (cols > 0) {
      const startX = -((cols - 1) * spacingX) / 2;
      for (let f = 0; f < floors; f++) {
        const y = f * floorHeight + floorHeight / 2;
        for (let c = 0; c < cols; c++) {
          const x = startX + c * spacingX;
          list.push({ x, y, z: depth / 2 + 0.05, w: windowWidth, h: windowHeight, rotY: 0 });
          list.push({ x, y, z: -depth / 2 - 0.05, w: windowWidth, h: windowHeight, rotY: Math.PI });
        }
      }
    }
    
    // Sides (depth)
    const sideCols = Math.floor((depth - 4) / spacingX);
    if (sideCols > 0) {
      const startZ = -((sideCols - 1) * spacingX) / 2;
      for (let f = 0; f < floors; f++) {
        const y = f * floorHeight + floorHeight / 2;
        for (let sc = 0; sc < sideCols; sc++) {
          const z = startZ + sc * spacingX;
          list.push({ x: width / 2 + 0.05, y, z, w: windowWidth, h: windowHeight, rotY: Math.PI / 2 });
          list.push({ x: -width / 2 - 0.05, y, z, w: windowWidth, h: windowHeight, rotY: -Math.PI / 2 });
        }
      }
    }
    return list;
  }, [width, depth, floors, floorHeight]);

  return (
    <group position={position}>
      {/* Main Structure */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={baseColor} roughness={0.7} />
      </mesh>

      {/* Accent stripes per floor */}
      {Array.from({ length: floors }).map((_, f) => {
        const stripeY = f * floorHeight + floorHeight - 0.4;
        return (
          <mesh key={f} position={[0, stripeY, 0]} castShadow>
            <boxGeometry args={[width + 0.1, 0.3, depth + 0.1]} />
            <meshStandardMaterial color={accentColor} roughness={0.5} />
          </mesh>
        );
      })}

      {/* Windows */}
      {windowConfig.map((win, idx) => (
        <mesh key={idx} position={[win.x, win.y, win.z]} rotation={[0, win.rotY, 0]}>
          <planeGeometry args={[win.w, win.h]} />
          <meshStandardMaterial color="#1a2536" roughness={0.1} metalness={0.9} />
        </mesh>
      ))}

      {/* Roof Parapet */}
      <group position={[0, height + 0.25, 0]}>
        {/* Left Wall Parapet */}
        <mesh position={[-width / 2 + 0.1, 0, 0]}>
          <boxGeometry args={[0.2, 0.5, depth]} />
          <meshStandardMaterial color={baseColor} />
        </mesh>
        {/* Right Wall Parapet */}
        <mesh position={[width / 2 - 0.1, 0, 0]}>
          <boxGeometry args={[0.2, 0.5, depth]} />
          <meshStandardMaterial color={baseColor} />
        </mesh>
        {/* Front Wall Parapet */}
        <mesh position={[0, 0, depth / 2 - 0.1]}>
          <boxGeometry args={[width, 0.5, 0.2]} />
          <meshStandardMaterial color={baseColor} />
        </mesh>
        {/* Back Wall Parapet */}
        <mesh position={[0, 0, -depth / 2 + 0.1]}>
          <boxGeometry args={[width, 0.5, 0.2]} />
          <meshStandardMaterial color={baseColor} />
        </mesh>
      </group>

      {/* Staircase/Utility Tower on one end */}
      <mesh position={[-width / 2 + 4, (height + 2) / 2, 0]} castShadow>
        <boxGeometry args={[8, height + 2, depth - 2]} />
        <meshStandardMaterial color={accentColor} />
      </mesh>

      {/* Floating Label */}
      {label && (
        <Text
          position={[0, height + 4, 0]}
          fontSize={4}
          color="white"
          outlineWidth={0.2}
          outlineColor="black"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

// Reusable Campus Gate Component
function CampusGate({ position, rotation = [0, 0, 0], label = "VIGNAN'S FOUNDATION" }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Main Central Red Roof */}
      <mesh position={[0, 16, 0]} castShadow>
        <coneGeometry args={[16, 7, 4, 1, false, Math.PI / 4]} />
        <meshStandardMaterial color="#A0522D" roughness={0.7} />
      </mesh>
      {/* White Fascia underneath roof */}
      <mesh position={[0, 11.5, 0]} castShadow>
        <boxGeometry args={[22, 2, 7]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Signboard on the Fascia */}
      <Text position={[0, 11.5, 3.6]} fontSize={1.2} color="#111" fontWeight="bold">
        {label}
      </Text>
      {/* Thick Black Pillars (Left and Right of road) */}
      {[-9, 9].map((x) => (
        <mesh key={`pillar-${x}`} position={[x, 5.25, 0]} castShadow>
          <boxGeometry args={[2.5, 10.5, 2.5]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
      ))}

      {/* Small Side Pedestrian Arches (Left and Right) */}
      {[-14, 14].map((x) => (
        <group key={`arch-${x}`} position={[x, 0, 0]}>
          {/* Side Roof */}
          <mesh position={[0, 8, 0]} castShadow>
            <coneGeometry args={[6, 3.5, 4, 1, false, Math.PI / 4]} />
            <meshStandardMaterial color="#A0522D" roughness={0.7} />
          </mesh>
          {/* Side White Fascia */}
          <mesh position={[0, 5.75, 0]} castShadow>
            <boxGeometry args={[8, 1, 4.5]} />
            <meshStandardMaterial color="white" />
          </mesh>
          {/* Outer small pillar */}
          <mesh position={x < 0 ? [-3, 2.625, 0] : [3, 2.625, 0]} castShadow>
            <boxGeometry args={[1.5, 5.25, 1.5]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Buildings() {
  return (
    <group>
      {/* ⛩️ MAIN GATE AREA LANDMARKS */}
      {/* 1. Main Gate Architecture (Scaled up to 3rd floor height ~ 16 units) */}
      <CampusGate position={[0, 0, 0]} rotation={[0, 0, 0]} label="VIGNAN'S FOUNDATION" />

      {/* 2. Library Gate */}
      <CampusGate position={[-110, 0, -60]} rotation={[0, Math.PI / 2, 0]} label="LIBRARY ENTRANCE GATE" />


      {/* 2. Boundary Wall & VIGNAN'S FOUNDATION Signboard */}
      {/* Placed on the right boundary of the road (X=8), facing the left (-X direction) towards the Shrine */}
      <group position={[10, 0, 15]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Black Tiled Wall (Foreground) */}
        <mesh position={[0, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[25, 4, 1]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
        </mesh>
        {/* Golden 3D Text */}
        <Text position={[0, 2.5, 0.6]} fontSize={1.5} color="#FFD700" fontStyle="italic" fontWeight="bold">
          VIGNAN'S FOUNDATION
        </Text>
        <Text position={[0, 1.2, 0.6]} fontSize={0.7} color="#FFD700">
          FOR SCIENCE, TECHNOLOGY AND RESEARCH
        </Text>
      </group>

      {/* (Hoarding moved to the left side near the shrine) */}

      {/* 3. Vignan Bus Stop (Across the Highway) */}
      <VignanBusStop />
      {/* 🏛️ NTR VIGNAN CENTRAL LIBRARY */}
      {/* Position: [-25.0, 0, -40.0]. Rotated to face the center circle */}
      <group position={[-25.0, 0, -40.0]} rotation={[0, Math.PI / 6, 0]}>
        
        {/* MAIN OCTAGONAL STRUCTURE */}
        {/* 3 Floors of Octagon with Windows */}
        {[0, 1, 2].map((floor) => (
          <group key={`lib-oct-floor-${floor}`} position={[0, floor * 4, 0]}>
            <mesh position={[0, 2, 0]} rotation={[0, Math.PI / 8, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[9, 9, 4, 8]} />
              <meshStandardMaterial color={floor === 0 ? "#e0e0e0" : "#f5f5f5"} roughness={0.8} />
            </mesh>
            {/* Windows on 7 faces (skip front face i=0 which is covered by the brown facade) */}
            {[1, 2, 3, 4, 5, 6, 7].map((i) => {
              const angle = i * Math.PI / 4;
              const radius = 9 * Math.cos(Math.PI / 8) + 0.1;
              const x = Math.sin(angle) * radius;
              const z = Math.cos(angle) * radius;
              return (
                 <group key={`win-${floor}-${i}`} position={[x, 0, z]} rotation={[0, angle, 0]}>
                   {/* Using width=11 to force 2 windows per face (WindowGrid logic: Math.floor((11-4)/3.5) = 2) */}
                   <WindowGrid width={11} height={4} floors={1} floorHeight={4} yOffset={-0.5} />
                 </group>
              )
            })}
          </group>
        ))}

        {/* Floor Separator Bands */}
        {[1, 2].map((floor) => (
          <mesh key={`lib-sep-${floor}`} position={[0, floor * 4, 0]} rotation={[0, Math.PI / 8, 0]}>
            <cylinderGeometry args={[9.1, 9.1, 0.4, 8]} />
            <meshStandardMaterial color="#555" />
          </mesh>
        ))}

        {/* MASSIVE BROWN CLADDED FRONT FACADE */}
        <group position={[0, 0, 9]}>
          {/* The huge overhanging brown panel (Covers Floor 1 & 2) */}
          <mesh position={[0, 10, 0]} castShadow receiveShadow>
            <boxGeometry args={[18, 12, 1.5]} />
            <meshStandardMaterial color="#704214" roughness={0.4} /> {/* Rich Brown Wood/Composite */}
          </mesh>
          
          {/* English Text (Top Left) */}
          <Text position={[-4, 13.5, 0.8]} fontSize={1.2} color="white" fontWeight="bold" anchorX="center">
            NTR{"\n"}VIGNAN LIBRARY
          </Text>
          
          {/* Telugu Text (Bottom Right) */}
          <Text position={[4, 6.5, 0.8]} fontSize={1.0} color="white" fontWeight="bold" anchorX="center">
            ఎన్. టి. ఆర్.{"\n"}విజ్ఞాన్ లైబ్రరీ
          </Text>

          {/* 2 Massive Black Pillars at the edges supporting the overhang */}
          {[-8, 8].map((x) => (
             <mesh key={`lib-front-pillar-${x}`} position={[x, 2, 0]} castShadow>
               <boxGeometry args={[2, 4, 1.5]} />
               <meshStandardMaterial color="#222" roughness={0.7} />
             </mesh>
          ))}

          {/* Recessed Entrance Wall (Behind the facade) */}
          <mesh position={[0, 2, -2]} castShadow>
            <boxGeometry args={[14, 4, 0.5]} />
            <meshStandardMaterial color="#d3d3d3" />
          </mesh>
          {/* Glass Doors */}
          <mesh position={[0, 2, -1.7]} castShadow>
            <boxGeometry args={[5, 3, 0.1]} />
            <meshStandardMaterial color="#88ccff" transparent opacity={0.6} />
          </mesh>

          {/* Steps leading up to the recessed entrance */}
          {[0, 1, 2, 3].map((step) => (
             <mesh key={`lib-step-${step}`} position={[0, step * 0.25, -0.5 + step * -0.4]} receiveShadow>
               <boxGeometry args={[10, 0.25, 0.4]} />
               <meshStandardMaterial color="#999" />
             </mesh>
          ))}

          {/* Ramp on the left */}
          <mesh position={[-6.5, 0.5, -1]} rotation={[-Math.PI/12, 0, 0]} receiveShadow>
            <boxGeometry args={[2, 1.2, 3]} />
            <meshStandardMaterial color="#888" />
          </mesh>

          {/* Saraswati Idol frame next to the entrance */}
          <group position={[-3.5, 1.5, -1.7]}>
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[1.5, 2, 0.2]} />
              <meshStandardMaterial color="#eaeaea" />
            </mesh>
            <mesh position={[0, 0, 0.1]} castShadow>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial color="#FFD700" />
            </mesh>
          </group>
        </group>
      </group>

      {/* 🏢 A-BLOCK (Administrative Block) */}
      {/* Position: [52, 0, -12.0]. Rotated 180deg to face inward towards H-Block */}
      <group position={[52, 0, -12.0]} rotation={[0, Math.PI, 0]}>
        {/* --- Back Wing --- */}
        {/* Upper Floors */}
        <mesh position={[0, 14, -6]} castShadow receiveShadow>
          <boxGeometry args={[80, 20, 8]} />
          <meshStandardMaterial color="#fcfcfc" roughness={0.9} />
        </mesh>
        {/* Recessed Ground Floor */}
        <mesh position={[0, 2, -7]} castShadow receiveShadow>
          <boxGeometry args={[78, 4, 6]} />
          <meshStandardMaterial color="#d3d3d3" roughness={0.9} />
        </mesh>
        {/* Ground Floor Pillars (Facing Courtyard) */}
        {[-35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35].map((x) => (
          <mesh key={`ab-pil-${x}`} position={[x, 2, -2.5]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 4]} />
            <meshStandardMaterial color="#fcfcfc" />
          </mesh>
        ))}
        {/* Windows and Accent Stripes */}
        <group position={[0, 4, -2]}>
          <WindowGrid width={80} height={20} floors={5} floorHeight={4} />
          {[4, 8, 12, 16].map((y) => (
            <mesh key={`a-acc-b-${y}`} position={[0, y, 0.1]}>
              <boxGeometry args={[80.1, 0.3, 0.1]} />
              <meshStandardMaterial color="#A52A2A" />
            </mesh>
          ))}
        </group>

        {/* --- Left Wing --- */}
        <mesh position={[-35, 14, 4]} castShadow receiveShadow>
          <boxGeometry args={[10, 20, 12]} />
          <meshStandardMaterial color="#fcfcfc" roughness={0.9} />
        </mesh>
        <mesh position={[-36, 2, 4]} castShadow receiveShadow>
          <boxGeometry args={[8, 4, 10]} />
          <meshStandardMaterial color="#d3d3d3" roughness={0.9} />
        </mesh>
        {[-1, 4, 9].map((z) => (
          <mesh key={`al-pil-${z}`} position={[-30.5, 2, z]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 4]} />
            <meshStandardMaterial color="#fcfcfc" />
          </mesh>
        ))}
        <group position={[-30, 4, 4]} rotation={[0, Math.PI / 2, 0]}>
          <WindowGrid width={12} height={20} floors={5} floorHeight={4} />
          {[4, 8, 12, 16].map((y) => (
            <mesh key={`a-acc-l-${y}`} position={[0, y, 0.1]}>
              <boxGeometry args={[12.1, 0.3, 0.1]} />
              <meshStandardMaterial color="#A52A2A" />
            </mesh>
          ))}
        </group>

        {/* --- Right Wing --- */}
        <mesh position={[35, 14, 4]} castShadow receiveShadow>
          <boxGeometry args={[10, 20, 12]} />
          <meshStandardMaterial color="#fcfcfc" roughness={0.9} />
        </mesh>
        <mesh position={[36, 2, 4]} castShadow receiveShadow>
          <boxGeometry args={[8, 4, 10]} />
          <meshStandardMaterial color="#d3d3d3" roughness={0.9} />
        </mesh>
        {[-1, 4, 9].map((z) => (
          <mesh key={`ar-pil-${z}`} position={[30.5, 2, z]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 4]} />
            <meshStandardMaterial color="#fcfcfc" />
          </mesh>
        ))}
        <group position={[30, 4, 4]} rotation={[0, -Math.PI / 2, 0]}>
          <WindowGrid width={12} height={20} floors={5} floorHeight={4} />
          {[4, 8, 12, 16].map((y) => (
            <mesh key={`a-acc-r-${y}`} position={[0, y, 0.1]}>
              <boxGeometry args={[12.1, 0.3, 0.1]} />
              <meshStandardMaterial color="#A52A2A" />
            </mesh>
          ))}
        </group>

        {/* Central Entrance Portico & Grand Staircase */}
        <group position={[0, 0, 0]}>
          {/* Grand Staircase (Wedge shape) */}
          <mesh position={[0, 2, 2]} rotation={[Math.PI / 4, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[16, 6, 8]} />
            <meshStandardMaterial color="#888" roughness={1.0} />
          </mesh>
          
          {/* Red Carpet / Center Strip on stairs */}
          <mesh position={[0, 2.1, 2]} rotation={[Math.PI / 4, 0, 0]}>
            <boxGeometry args={[3, 6.1, 8.1]} />
            <meshStandardMaterial color="#A52A2A" roughness={0.9} />
          </mesh>

          {/* Portico Pillars (Starting from top of stairs Y=4) */}
          {[-6, -2, 2, 6].map((x, i) => (
            <mesh key={`apillar-${i}`} position={[x, 8, 5]} castShadow>
              <cylinderGeometry args={[0.5, 0.5, 8]} />
              <meshStandardMaterial color="#fcfcfc" roughness={0.9} />
            </mesh>
          ))}

          {/* Portico Roof / Brown Fascia */}
          <mesh position={[0, 12.5, 5]} castShadow>
            <boxGeometry args={[14, 1.5, 2]} />
            <meshStandardMaterial color="#5C4033" roughness={0.6} />
          </mesh>

          {/* Main Glass Facade Above Portico (Spans floors 3, 4, 5) */}
          <mesh position={[0, 18, 4.5]} castShadow>
            <boxGeometry args={[12, 10, 1]} />
            <meshStandardMaterial color="#8FBC8F" roughness={0.2} metalness={0.8} transparent={true} opacity={0.85} />
          </mesh>

          {/* Signboard Text on Brown Fascia */}
          <Text
            position={[0, 12.8, 6.05]}
            fontSize={0.6}
            color="white"
            fontWeight="bold"
          >
            VIGNAN'S FOUNDATION Deemed to be UNIVERSITY
          </Text>
          <Text
            position={[0, 12.2, 6.05]}
            fontSize={0.25}
            color="white"
          >
            FOR SCIENCE, TECHNOLOGY AND RESEARCH
          </Text>
        </group>
      </group>

      {/* 🏢 H-BLOCK (Sri Visweswaraya Bhavan) */}
      {/* Position: [55.0, 0, -72.5]. 4 floors, H-shaped, pure white, large dome, curved balconies */}
      <group position={[55.0, 0, -72.5]}>
        {/* --- Central Bar --- */}
        <mesh position={[0, 10, -5]} castShadow receiveShadow>
          <boxGeometry args={[80, 12, 12]} />
          <meshStandardMaterial color="#fcfcfc" roughness={0.9} />
        </mesh>
        <mesh position={[0, 2, -6]} castShadow receiveShadow>
          <boxGeometry args={[78, 4, 10]} />
          <meshStandardMaterial color="#d3d3d3" roughness={0.9} />
        </mesh>
        {[-35, -25, -15, -5, 5, 15, 25, 35].map((x) => (
          <mesh key={`hb-pil-${x}`} position={[x, 2, -0.5]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 4]} />
            <meshStandardMaterial color="#fcfcfc" />
          </mesh>
        ))}
        {/* Windows & Accents */}
        <group position={[0, 4, 1]}>
          <WindowGrid width={80} height={12} floors={3} floorHeight={4} />
          {[4, 8].map((y) => (
            <mesh key={`h-acc-b-${y}`} position={[0, y, 0.1]}>
              <boxGeometry args={[80.1, 0.3, 0.1]} />
              <meshStandardMaterial color="#4B0082" />
            </mesh>
          ))}
        </group>

        {/* Back Pillars (Central Bar) */}
        {[-35, -25, -15, -5, 5, 15, 25, 35].map((x) => (
          <mesh key={`hb-back-pil-${x}`} position={[x, 2, -9.5]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 4]} />
            <meshStandardMaterial color="#fcfcfc" />
          </mesh>
        ))}
        {/* Back Windows & Accents */}
        <group position={[0, 4, -11]} rotation={[0, Math.PI, 0]}>
          <WindowGrid width={80} height={12} floors={3} floorHeight={4} />
          {[4, 8].map((y) => (
            <mesh key={`h-back-acc-${y}`} position={[0, y, 0.1]}>
              <boxGeometry args={[80.1, 0.3, 0.1]} />
              <meshStandardMaterial color="#4B0082" />
            </mesh>
          ))}
        </group>
        
        {/* --- Left Wing --- */}
        <mesh position={[-35, 10, 13.5]} castShadow receiveShadow>
          <boxGeometry args={[12, 12, 25]} />
          <meshStandardMaterial color="#fcfcfc" roughness={0.9} />
        </mesh>
        <mesh position={[-36, 2, 13.5]} castShadow receiveShadow>
          <boxGeometry args={[10, 4, 23]} />
          <meshStandardMaterial color="#d3d3d3" roughness={0.9} />
        </mesh>
        {[3.5, 13.5, 23.5].map((z) => (
          <mesh key={`hl-pil-${z}`} position={[-29.5, 2, z]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 4]} />
            <meshStandardMaterial color="#fcfcfc" />
          </mesh>
        ))}
        <group position={[-29, 4, 13.5]} rotation={[0, Math.PI / 2, 0]}>
          <WindowGrid width={25} height={12} floors={3} floorHeight={4} />
          {[4, 8].map((y) => (
            <mesh key={`h-acc-l-${y}`} position={[0, y, 0.1]}>
              <boxGeometry args={[25.1, 0.3, 0.1]} />
              <meshStandardMaterial color="#4B0082" />
            </mesh>
          ))}
        </group>

        {/* --- Right Wing --- */}
        <mesh position={[35, 10, 13.5]} castShadow receiveShadow>
          <boxGeometry args={[12, 12, 25]} />
          <meshStandardMaterial color="#fcfcfc" roughness={0.9} />
        </mesh>
        <mesh position={[36, 2, 13.5]} castShadow receiveShadow>
          <boxGeometry args={[10, 4, 23]} />
          <meshStandardMaterial color="#d3d3d3" roughness={0.9} />
        </mesh>
        {[3.5, 13.5, 23.5].map((z) => (
          <mesh key={`hr-pil-${z}`} position={[29.5, 2, z]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 4]} />
            <meshStandardMaterial color="#fcfcfc" />
          </mesh>
        ))}
        <group position={[29, 4, 13.5]} rotation={[0, -Math.PI / 2, 0]}>
          <WindowGrid width={25} height={12} floors={3} floorHeight={4} />
          {[4, 8].map((y) => (
            <mesh key={`h-acc-r-${y}`} position={[0, y, 0.1]}>
              <boxGeometry args={[25.1, 0.3, 0.1]} />
              <meshStandardMaterial color="#4B0082" />
            </mesh>
          ))}
        </group>

        {/* Curved Balconies on Left Wing (Facing +X into the courtyard) */}
        {[5, 13.5, 22].map((z) => (
          <group key={`balcony-${z}`}>
            {[4, 8, 12].map((y) => (
              <group key={`balc-${z}-${y}`} position={[-29, y, z]}>
                {/* Balcony Floor */}
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[2.5, 2.5, 0.4, 16]} />
                  <meshStandardMaterial color="#d3d3d3" roughness={0.8} />
                </mesh>
                {/* Balcony Railing */}
                <mesh position={[0, 0.6, 0]} castShadow>
                  <cylinderGeometry args={[2.5, 2.5, 1.2, 16, 1, true, 0, Math.PI]} />
                  <meshStandardMaterial color="#fcfcfc" roughness={0.9} side={2} />
                </mesh>
              </group>
            ))}
          </group>
        ))}

        {/* --- Back Left Wing --- */}
        <mesh position={[-35, 10, -18.5]} castShadow receiveShadow>
          <boxGeometry args={[12, 12, 15]} />
          <meshStandardMaterial color="#fcfcfc" roughness={0.9} />
        </mesh>
        <mesh position={[-36, 2, -18.5]} castShadow receiveShadow>
          <boxGeometry args={[10, 4, 13]} />
          <meshStandardMaterial color="#d3d3d3" roughness={0.9} />
        </mesh>
        {[-13.5, -23.5].map((z) => (
          <mesh key={`hbl-pil-${z}`} position={[-29.5, 2, z]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 4]} />
            <meshStandardMaterial color="#fcfcfc" />
          </mesh>
        ))}
        <group position={[-29, 4, -18.5]} rotation={[0, Math.PI / 2, 0]}>
          <WindowGrid width={15} height={12} floors={3} floorHeight={4} />
          {[4, 8].map((y) => (
            <mesh key={`hb-acc-l-${y}`} position={[0, y, 0.1]}>
              <boxGeometry args={[15.1, 0.3, 0.1]} />
              <meshStandardMaterial color="#4B0082" />
            </mesh>
          ))}
        </group>

        {/* --- Back Right Wing --- */}
        <mesh position={[35, 10, -18.5]} castShadow receiveShadow>
          <boxGeometry args={[12, 12, 15]} />
          <meshStandardMaterial color="#fcfcfc" roughness={0.9} />
        </mesh>
        <mesh position={[36, 2, -18.5]} castShadow receiveShadow>
          <boxGeometry args={[10, 4, 13]} />
          <meshStandardMaterial color="#d3d3d3" roughness={0.9} />
        </mesh>
        {[-13.5, -23.5].map((z) => (
          <mesh key={`hbr-pil-${z}`} position={[29.5, 2, z]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 4]} />
            <meshStandardMaterial color="#fcfcfc" />
          </mesh>
        ))}
        <group position={[29, 4, -18.5]} rotation={[0, -Math.PI / 2, 0]}>
          <WindowGrid width={15} height={12} floors={3} floorHeight={4} />
          {[4, 8].map((y) => (
            <mesh key={`hb-acc-r-${y}`} position={[0, y, 0.1]}>
              <boxGeometry args={[15.1, 0.3, 0.1]} />
              <meshStandardMaterial color="#4B0082" />
            </mesh>
          ))}
        </group>

        {/* Curved Balconies on Back Left Wing (Facing +X into the courtyard) */}
        {[-15, -23.5].map((z) => (
          <group key={`b-balcony-${z}`}>
            {[4, 8, 12].map((y) => (
              <group key={`b-balc-${z}-${y}`} position={[-29, y, z]}>
                {/* Balcony Floor */}
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[2.5, 2.5, 0.4, 16]} />
                  <meshStandardMaterial color="#d3d3d3" roughness={0.8} />
                </mesh>
                {/* Balcony Railing */}
                <mesh position={[0, 0.6, 0]} castShadow>
                  <cylinderGeometry args={[2.5, 2.5, 1.2, 16, 1, true, 0, Math.PI]} />
                  <meshStandardMaterial color="#fcfcfc" roughness={0.9} side={2} />
                </mesh>
              </group>
            ))}
          </group>
        ))}

        {/* Grand Staircase & Portico (On Central Bar, facing +Z towards A-Block) */}
        <group position={[0, 0, 1]}>
          {/* Stairs (Wedge) */}
          <mesh position={[0, 2, 4]} rotation={[Math.PI / 4, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[16, 6, 8]} />
            <meshStandardMaterial color="#888" roughness={1.0} />
          </mesh>
          
          {/* Indigo Carpet / Center Strip on stairs */}
          <mesh position={[0, 2.1, 4]} rotation={[Math.PI / 4, 0, 0]}>
            <boxGeometry args={[3, 6.1, 8.1]} />
            <meshStandardMaterial color="#4B0082" roughness={0.9} />
          </mesh>

          {/* Portico Canopy */}
          <mesh position={[0, 5, 4]} castShadow>
            <boxGeometry args={[16, 1, 8]} />
            <meshStandardMaterial color="#fcfcfc" />
          </mesh>

          {/* Yellow Signboard on Portico */}
          <mesh position={[0, 5, 8.05]} castShadow>
            <boxGeometry args={[16.2, 1.5, 0.2]} />
            <meshStandardMaterial color="#FADA5E" />
          </mesh>
          <Text
            position={[0, 5, 8.2]}
            fontSize={0.8}
            color="black"
            fontWeight="bold"
          >
            VIGNAN'S FOUNDATION Deemed to be UNIVERSITY
          </Text>

          {/* Portico Pillars */}
          {[-7, -2.5, 2.5, 7].map((x, i) => (
            <mesh key={`hpillar-${i}`} position={[x, 2.5, 7.5]} castShadow>
              <cylinderGeometry args={[0.3, 0.3, 5]} />
              <meshStandardMaterial color="#fcfcfc" />
            </mesh>
          ))}
        </group>

        {/* Back Stage & Portico (In the back courtyard, facing -Z) */}
        <group position={[0, 0, -18]} rotation={[0, Math.PI, 0]}>
          {/* Small Stage instead of stairs */}
          <mesh position={[0, 1, 4]} castShadow receiveShadow>
             <boxGeometry args={[16, 2, 8]} />
             <meshStandardMaterial color="#888" roughness={1.0} />
          </mesh>

          {/* Portico Canopy Base */}
          <mesh position={[0, 5, 4]} castShadow>
            <boxGeometry args={[16, 1, 8]} />
            <meshStandardMaterial color="#fcfcfc" />
          </mesh>

          {/* Cone Top covering the stage */}
          <mesh position={[0, 7.5, 4]} castShadow>
             <coneGeometry args={[8, 4, 32]} />
             <meshStandardMaterial color="#8B4513" /> 
          </mesh>

          {/* Portico Pillars */}
          {[-7, -2.5, 2.5, 7].map((x, i) => (
            <mesh key={`h-back-pillar-${i}`} position={[x, 2.5, 7.5]} castShadow>
              <cylinderGeometry args={[0.3, 0.3, 5]} />
              <meshStandardMaterial color="#fcfcfc" />
            </mesh>
          ))}
        </group>

        {/* The Massive White Architectural Dome on Roof */}
        <group position={[0, 16, 0]}>
          {/* Dome Base */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[6, 6, 3, 32]} />
            <meshStandardMaterial color="#fcfcfc" />
          </mesh>
          {/* Dome Hemisphere */}
          <mesh position={[0, 3, 0]} castShadow>
            <sphereGeometry args={[6, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#fcfcfc" roughness={0.3} />
          </mesh>
          {/* Spire */}
          <mesh position={[0, 10, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.4, 3]} />
            <meshStandardMaterial color="#fcfcfc" />
          </mesh>
          <mesh position={[0, 11.5, 0]} castShadow>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        </group>

        {/* Ground Signboard */}
        <group position={[10, 0, 26]}>
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[8, 2, 0.2]} />
            <meshStandardMaterial color="#FADA5E" />
          </mesh>
          <Text
            position={[0, 1, 0.2]}
            fontSize={0.5}
            color="black"
            fontWeight="bold"
          >
            SRI VISWESWARAYA BHAVAN
          </Text>
        </group>
      </group>

      {/* 🏢 N-BLOCK (Nagarjuna Block) & MHP (The Most Happening Place) */}
      {/* Position: [-53.5, 0, -161.0]. Size [93, 50]. 6 floors, red/maroon brick facade, MHP on ground floor */}
      <group position={[-53.5, 0, -161.0]}>
        {/* Main Block (N-Block) */}
        <mesh position={[0, 12, 0]} castShadow receiveShadow>
          <boxGeometry args={[88, 24, 26]} />
          <meshStandardMaterial color="#7A2222" roughness={0.8} /> {/* Red/maroon brick tone */}
        </mesh>

        {/* Floor separators */}
        {[4, 8, 12, 16, 20, 24].map((y) => (
          <mesh key={y} position={[0, y - 0.2, 13.05]}>
            <boxGeometry args={[88.2, 0.2, 0.1]} />
            <meshStandardMaterial color="#551A1A" />
          </mesh>
        ))}

        {/* Window grid for upper floors (floors 2-6) */}
        <group position={[0, 0, 13]}>
          <WindowGrid width={88} height={20} floors={5} floorHeight={4} yOffset={4} />
        </group>

        {/* NAGARJUNA BLOCK sign at top */}
        <group position={[0, 21, 13.1]}>
          <Text fontSize={1.4} color="white" outlineColor="black" outlineWidth={0.1}>
            N - BLOCK
          </Text>
          <Text position={[0, -1.1, 0]} fontSize={0.65} color="#FFD700" outlineColor="black" outlineWidth={0.05}>
            NAGARJUNA BLOCK
          </Text>
        </group>

        {/* 🍔 THE MOST HAPPENING PLACE (MHP) */}
        {/* Integrated Ground Floor Food Court Entrance, facing the spine road (right side of N-block) */}
        <group position={[22, 0, 13]}>
          {/* Main Entrance portal frame (red brick/maroon facade) */}
          <mesh position={[0, 2.5, 1.1]} castShadow>
            <boxGeometry args={[26, 5, 2.2]} />
            <meshStandardMaterial color="#6E1E1E" />
          </mesh>
          {/* Wide entrance staircase */}
          <mesh position={[0, 0.15, 3.25]} receiveShadow>
            <boxGeometry args={[22, 0.3, 2]} />
            <meshStandardMaterial color="#bbb" />
          </mesh>
          <mesh position={[0, 0.45, 2.55]} receiveShadow>
            <boxGeometry args={[22, 0.3, 1.4]} />
            <meshStandardMaterial color="#aaa" />
          </mesh>
          {/* Glass facade entrance doors */}
          <mesh position={[0, 2.2, 2.3]} castShadow>
            <boxGeometry args={[18, 3.6, 0.1]} />
            <meshStandardMaterial color="#88ccff" transparent opacity={0.6} roughness={0.1} />
          </mesh>

          {/* Blue illuminated LED Sign "THE MOST HAPPENING PLACE" */}
          <group position={[0, 4.4, 2.25]}>
            {/* Background signboard panel */}
            <mesh>
              <boxGeometry args={[22, 0.9, 0.1]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            {/* Blue LED Text */}
            <Text
              position={[0, 0, 0.1]}
              fontSize={0.8}
              color="#00D2FF" // Neon blue LED color
              fontWeight="bold"
              outlineWidth={0.06}
              outlineColor="#003366"
            >
              THE MOST HAPPENING PLACE
            </Text>
          </group>

          {/* Interior Canteen view visible through glass (Ceiling grid and colorful furniture) */}
          <group position={[0, 0, -4]}>
            {/* Warm wooden slatted ceiling representation */}
            {Array.from({ length: 6 }).map((_, i) => (
              <mesh key={i} position={[0, 3.9, -1 - i * 1.2]}>
                <boxGeometry args={[20, 0.1, 0.4]} />
                <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
              </mesh>
            ))}
            {/* Red, Yellow, White dining tables/chairs representations */}
            {[
              { pos: [-5, 0.5, -3], color: "#FF3B30" }, // Red table/chairs
              { pos: [5, 0.5, -3], color: "#FFCC00" },  // Yellow
              { pos: [0, 0.5, -6], color: "#FFFFFF" }   // White
            ].map((tbl, i) => (
              <group key={i} position={tbl.pos}>
                {/* Table */}
                <mesh position={[0, 0.6, 0]} castShadow>
                  <cylinderGeometry args={[1, 1, 0.1]} />
                  <meshStandardMaterial color={tbl.color} />
                </mesh>
                <mesh position={[0, 0.3, 0]}>
                  <cylinderGeometry args={[0.08, 0.08, 0.6]} />
                  <meshStandardMaterial color="#222" />
                </mesh>
                {/* Stools */}
                {[-1.2, 1.2].map((sx) => 
                  [-1.2, 1.2].map((sz) => (
                    <mesh key={`${sx}-${sz}`} position={[sx, 0.25, sz]} castShadow>
                      <cylinderGeometry args={[0.3, 0.3, 0.5]} />
                      <meshStandardMaterial color={tbl.color} />
                    </mesh>
                  ))
                )}
              </group>
            ))}
          </group>
        </group>
      </group>

      {/* 🏢 U-BLOCK */}
      <MultiStoryBuilding
        position={[-141.5, 0, -198.0]}
        size={[70, 80]}
        floors={5}
        baseColor="#fcfcfc"
        accentColor="#dad20a"
        label="U - BLOCK"
      />

      {/* 🏛️ CONVOCATION HALL */}
      <MultiStoryBuilding
        position={[-196.5, 0, -197.5]}
        size={[20, 80]}
        floors={3}
        baseColor="#f3f4f6"
        accentColor="#9f96f7"
        label="CONVOCATION HALL"
      />

      {/* 🏡 GUEST HOUSE */}
      <MultiStoryBuilding
        position={[-226.5, 0, -171.0]}
        size={[26, 26]}
        floors={2}
        baseColor="#faf5ff"
        accentColor="#37794b"
        label="GUEST HOUSE"
      />

      {/* 🏐 VOLLEY BALL COURTS */}
      <group position={[-236.5, 0, -214.0]}>
        {/* Fence/Boundary around courts */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[50, 3, 50]} />
          <meshStandardMaterial color="#a5b65d" transparent opacity={0.1} wireframe />
        </mesh>
        
        {/* Court 1 */}
        <group position={[0, 0.05, -12]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[18, 9]} />
            <meshStandardMaterial color="#E0A96D" roughness={1.0} />
          </mesh>
          <mesh position={[0, 1.5, -5]} castShadow><cylinderGeometry args={[0.08, 0.08, 3]}/><meshStandardMaterial color="#555"/></mesh>
          <mesh position={[0, 1.5, 5]} castShadow><cylinderGeometry args={[0.08, 0.08, 3]}/><meshStandardMaterial color="#555"/></mesh>
          <mesh position={[0, 2, 0]}><boxGeometry args={[0.02, 1, 10]}/><meshStandardMaterial color="#ccc" transparent opacity={0.4} wireframe /></mesh>
        </group>

        {/* Court 2 */}
        <group position={[0, 0.05, 12]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[18, 9]} />
            <meshStandardMaterial color="#E0A96D" roughness={1.0} />
          </mesh>
          <mesh position={[0, 1.5, -5]} castShadow><cylinderGeometry args={[0.08, 0.08, 3]}/><meshStandardMaterial color="#555"/></mesh>
          <mesh position={[0, 1.5, 5]} castShadow><cylinderGeometry args={[0.08, 0.08, 3]}/><meshStandardMaterial color="#555"/></mesh>
          <mesh position={[0, 2, 0]}><boxGeometry args={[0.02, 1, 10]}/><meshStandardMaterial color="#ccc" transparent opacity={0.4} wireframe /></mesh>
        </group>
        <Text position={[0, 6, 0]} fontSize={2.5} color="white" outlineWidth={0.1} outlineColor="black">
          VOLLEYBALL COURTS
        </Text>
      </group>

      {/* 🏨 HOSTELS */}
      {/* Boys Hostel: 3 floors (height = 12), orange accent at [40.0, 0, -165.0] */}
      <MultiStoryBuilding
        position={[40.0, 0, -165.0]}
        size={[52, 22]}
        floors={3}
        accentColor="#FF8C00"
        label="BOYS HOSTEL"
      />

      {/* AC Hostel: 3 floors (height = 12), orange/premium accent at [95.0, 0, -165.0] */}
      <MultiStoryBuilding
        position={[95.0, 0, -165.0]}
        size={[26, 22]}
        floors={3}
        accentColor="#E67E22"
        label="AC HOSTEL"
      />

      {/* Hostel Connector Walkway/Bridge */}
      <group position={[75.0, 0, -180.0]}>
        <mesh position={[0, 6, 0]} castShadow>
          <boxGeometry args={[12, 1, 4]} />
          <meshStandardMaterial color="#e5e7eb" />
        </mesh>
        <mesh position={[0, 7, 1.9]} transparent opacity={0.5}>
          <boxGeometry args={[12, 1.2, 0.1]} />
          <meshStandardMaterial color="#add8e6" />
        </mesh>
        <mesh position={[0, 7, -1.9]} transparent opacity={0.5}>
          <boxGeometry args={[12, 1.2, 0.1]} />
          <meshStandardMaterial color="#add8e6" />
        </mesh>
        <mesh position={[-5, 3, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 6]} />
          <meshStandardMaterial color="#999" />
        </mesh>
        <mesh position={[5, 3, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 6]} />
          <meshStandardMaterial color="#999" />
        </mesh>
      </group>

      {/* 🍽️ CANTEEN SHED */}
      <group position={[90.5, 0, -122.0]}>
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[18, 0.1, 20]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
        {[
          [-8, -9], [8, -9],
          [-8, 0], [8, 0],
          [-8, 9], [8, 9]
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 2, z]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 4]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
        ))}
        <mesh position={[0, 4.2, 0]} rotation={[0.08, 0, 0]} castShadow>
          <boxGeometry args={[20, 0.2, 22]} />
          <meshStandardMaterial color="#7f8c8d" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.5, -8.5]} castShadow>
          <boxGeometry args={[16, 3, 2]} />
          <meshStandardMaterial color="#bdc3c7" />
        </mesh>
        
        <Text
          position={[0, 6, 0]}
          fontSize={3}
          color="white"
          outlineWidth={0.15}
          outlineColor="black"
        >
          CANTEEN SHED
        </Text>
      </group>

      {/* ⚽ SPORTS FIELD */}
      <group position={[135.0, 0, -93.0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
          <planeGeometry args={[66, 90]} />
          <meshStandardMaterial color="#2d8a4e" roughness={0.9} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <planeGeometry args={[64, 2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <group position={[0, 0, -42]}>
          <mesh position={[-6, 2, 0]}><cylinderGeometry args={[0.1, 0.1, 4]}/><meshStandardMaterial color="#fff"/></mesh>
          <mesh position={[6, 2, 0]}><cylinderGeometry args={[0.1, 0.1, 4]}/><meshStandardMaterial color="#fff"/></mesh>
          <mesh position={[0, 4, 0]}><boxGeometry args={[12, 0.15, 0.15]}/><meshStandardMaterial color="#fff"/></mesh>
        </group>
        <group position={[0, 0, 42]}>
          <mesh position={[-6, 2, 0]}><cylinderGeometry args={[0.1, 0.1, 4]}/><meshStandardMaterial color="#fff"/></mesh>
          <mesh position={[6, 2, 0]}><cylinderGeometry args={[0.1, 0.1, 4]}/><meshStandardMaterial color="#fff"/></mesh>
          <mesh position={[0, 4, 0]}><boxGeometry args={[12, 0.15, 0.15]}/><meshStandardMaterial color="#fff"/></mesh>
        </group>

        <Text
          position={[0, 2, 0]}
          fontSize={4}
          color="white"
          outlineWidth={0.2}
          outlineColor="black"
        >
          SPORTS GROUND
        </Text>
      </group>

      {/* 🚜 FARM ZONE (Walled off with large trees) */}
      <group position={[-30.0, 0, -93.5]}>
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
          <planeGeometry args={[46, 53]} />
          <meshStandardMaterial color="#3E8E41" roughness={0.9} /> {/* Deep grass green */}
        </mesh>
        
        {/* Boundary Walls (No Entry) */}
        {/* Front/Back Walls */}
        {[-26, 26].map((z, i) => (
          <mesh key={`fw-${i}`} position={[0, 3, z]} castShadow receiveShadow>
            <boxGeometry args={[46, 6, 1]} />
            <meshStandardMaterial color="#888" roughness={0.8} />
          </mesh>
        ))}
        {/* Left/Right Walls */}
        {[-22.5, 22.5].map((x, i) => (
          <mesh key={`sw-${i}`} position={[x, 3, 0]} castShadow receiveShadow>
            <boxGeometry args={[1, 6, 53]} />
            <meshStandardMaterial color="#888" roughness={0.8} />
          </mesh>
        ))}

        {/* Large Trees inside the farm */}
        {[-12, 0, 12].map((x) => 
          [-15, -5, 5, 15].map((z) => (
            <group key={`tree-${x}-${z}`} position={[x + (Math.random() * 4 - 2), 0, z + (Math.random() * 4 - 2)]}>
              {/* Trunk */}
              <mesh position={[0, 4, 0]} castShadow>
                <cylinderGeometry args={[0.8, 1.2, 8, 8]} />
                <meshStandardMaterial color="#5C4033" />
              </mesh>
              {/* Leaves */}
              <mesh position={[0, 12, 0]} castShadow>
                <sphereGeometry args={[7, 16, 16]} />
                <meshStandardMaterial color="#228B22" roughness={0.8} />
              </mesh>
            </group>
          ))
        )}

        <Text
          position={[0, 20, 0]}
          fontSize={3}
          color="white"
          outlineWidth={0.15}
          outlineColor="black"
        >
          FARM ZONE
        </Text>
      </group>

      {/* 🏬 SMALL ZONE */}
      <group position={[92.5, 0, -2.0]}>
        {Array.from({ length: 3 }).map((_, i) => {
          const z = -20 + i * 20;
          return (
            <group key={i} position={[0, 0, z]}>
              <mesh position={[0, 2, 0]} castShadow>
                <boxGeometry args={[12, 4, 12]} />
                <meshStandardMaterial color="#eaeaea" />
              </mesh>
              <mesh position={[-6.05, 2, 0]} rotation={[0, -Math.PI/2, 0]}>
                <planeGeometry args={[8, 3]} />
                <meshStandardMaterial color="#88ccff" opacity={0.6} transparent />
              </mesh>
              <Text
                position={[0, 4.5, 0]}
                fontSize={1.8}
                color="white"
                outlineWidth={0.1}
                outlineColor="black"
              >
                UTILITY #{i+1}
              </Text>
            </group>
          );
        })}
      </group>

      {/* 3. APPROACH ROAD LEFT ZONE (Shrine & Hoarding) */}
      <group position={[-10, 0, 25.0]}>
        {/* The Ganesha Shrine (Replacing Store A) */}
        <group position={[0, 0, -8]}>
          {/* Base / Plinth (Red with White border) */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[6, 1, 6]} />
            <meshStandardMaterial color="#A0522D" />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <boxGeometry args={[6.2, 0.2, 6.2]} />
            <meshStandardMaterial color="white" />
          </mesh>
          
          {/* Vibrant Blue Pillars */}
          {[-2.5, 2.5].map((x) => 
            [-2.5, 2.5].map((z) => (
              <mesh key={`pillar-${x}-${z}`} position={[x, 2.5, z]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 3]} />
                <meshStandardMaterial color="#0000FF" />
              </mesh>
            ))
          )}
          
          {/* Flat/Slightly Sloped Red Roof */}
          <mesh position={[0, 4.2, 0]} castShadow>
            <boxGeometry args={[6.5, 0.4, 6.5]} />
            <meshStandardMaterial color="#A0522D" />
          </mesh>
          
          {/* Ganesha Idol */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.8, 1.5, 8]} />
            <meshStandardMaterial color="#FF6347" /> {/* Orange/Red hue */}
          </mesh>
          <Text position={[0, 5, 0]} fontSize={1.2} color="white" outlineColor="black" outlineWidth={0.05}>
            SHRINE
          </Text>
        </group>

        {/* Huge Hoarding Billboard (Placed near the shrine, facing the highway at +Z, shifted left to avoid road) */}
        <group position={[-5, 0, 8]} rotation={[0, 0, 0]}>
          <HoardingBillboard />
        </group>
      </group>

      {/* MUD GROUND WITH WALKING TRACK (Between H-Block Road and Boys Hostel) */}
      <group position={[38, 0.05, -126.5]}>
        <MudGroundWithTrack position={[0, 0, 0]} size={[53, 22]} />
      </group>
    </group>
  );
}
