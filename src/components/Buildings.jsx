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

function VignanBusStop({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Shift right (15) to other side of the highway (campus side), slide down Z (100) to align with Main Gate, face -X towards road */}
      <group position={[15, 0, 100]} rotation={[0, -Math.PI / 2, 0]}>
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
export function MultiStoryBuilding({ 
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
export function CampusGate({ position, rotation = [0, 0, 0], label = "VIGNAN'S FOUNDATION" }) {
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

export function Buildings({ zones = [] }) {
  const getZone = (id, defaultLabel, defaultPos, defaultSize = null, defaultRot = 0) => {
    const found = zones.find(z => z.id === id);
    return {
      render: found ? true : false,
      pos: found ? found.pos : defaultPos,
      label: found ? found.label : defaultLabel,
      size: found ? found.size : defaultSize,
      rotation: found && found.rotation !== undefined ? found.rotation : defaultRot
    };
  };

  const gateMain = getZone('gate_main', "VIGNAN'S FOUNDATION", [0, 0, 0], null, 0);
  const gateLibrary = getZone('gate_library', "LIBRARY ENTRANCE GATE", [-110, 0, -60], null, Math.PI / 2);
  const boundaryWall = getZone('boundary_wall', "WALL", [10, 0, 15], null, -Math.PI / 2);
  const busStopZone = getZone('bus_stop', 'BUS STOP', [-55, 0.01, 5], null, Math.atan2(110, 130));

  const libZone = getZone('library', 'LIBRARY', [-25.0, 0, -40.0], null, Math.PI / 6);
  const ablockZone = getZone('ablock', 'A-BLOCK', [52, 0, -12.0], null, Math.PI);
  const hblockZone = getZone('hblock', 'H-BLOCK', [55.0, 0, -72.5], null, 0);
  const nblockZone = getZone('nblock', 'N-BLOCK', [-53.5, 0, -192.0], [62, 140], Math.PI / 2);
  const boyshostelZone = getZone('boyshostel', 'BOYS HOSTEL', [40.0, 0, -165.0], [52, 22], 0);
  const achostelZone = getZone('achostel', 'AC HOSTEL', [95.0, 0, -165.0], [26, 22], 0);
  const connectorZone = getZone('hostel_connector', '', [75.0, 0, -180.0], null, 0);
  const canteenZone = getZone('canteen', 'CANTEEN & TT', [90.5, 0, -122.0], [19, 22], 0);
  const sportsZone = getZone('sportsground', 'HOCKEY & FOOTBALL GROUND', [135.0, 0, -93.0], [70, 94], 0);
  const farmZone = getZone('farm', 'FARM ZONE', [-30.0, 0, -93.5], [46, 53], 0);
  const smallZone = getZone('smallzone', 'SMALL ZONE', [92.5, 0, -2.0], null, 0);
  const newOutsideZone = getZone('new_outside_zone', 'NEW ZONE', [-10, 0, 25.0], null, 0);
  const groundZone = getZone('ground', 'GROUND', [38, 0.05, -126.5], [53, 22], 0);

  const ublockZone = getZone('ublock', 'U-BLOCK', [-141.5, 0, -198.0], [75, 85], 0);
  const convocationhallZone = getZone('convocationhall', 'CONVOCATION HALL', [-196.5, 0, -197.5], [25, 85], 0);
  const guesthouseZone = getZone('guesthouse', 'GUEST HOUSE', [-226.5, 0, -171.0], [30, 30], 0);
  const volleyballcourtsZone = getZone('volleyballcourts', 'VOLLEY BALL COURTS', [-236.5, 0, -214.0], [50, 50], 0);

  const textileZone = getZone('textile', 'TEXTILE TECHNOLOGY', [49.0, 0, -334.5], [15, 70], 0);
  const pharmacyZone = getZone('pharmacy', 'PHARMACY BLOCK', [122.0, 0, -333.5], [30, 70], 0);
  const pharmacyBadmintonZone = getZone('pharmacy_badminton', 'PHARMACY BADMINTON COURT', [86.0, 0, -317.5], [30, 30], 0);
  const pharmacyVolleyballZone = getZone('pharmacy_volleyball', 'PHARMACY VOLLEYBALL COURT', [86.0, 0, -351.5], [30, 25], 0);

  const cricketZone = getZone('cricketground', 'CRICKET GROUND', [-121.0, 0, -340.5], [235, 85], 0);
  const basketballZone = getZone('basketballcourts', 'BASKETBALL COURTS', [-271.5, 0, -359.5], [30, 125], 0);
  const pondZone = getZone('vignanpond', 'VIGNAN POND', [-322.5, 0, -321.5], [45, 45], 0);
  const girlsHostelZone = getZone('priyadarshinihostel', 'PRIYADARSHINI HOSTEL', [-322.5, 0, -379.0], [45, 60], 0);

  return (
    <group>
      {/* ⛩️ MAIN GATE AREA LANDMARKS */}
      {/* 1. Main Gate Architecture */}
      {gateMain.render && (
        <CampusGate position={gateMain.pos} rotation={[0, gateMain.rotation, 0]} label={gateMain.label} />
      )}

      {/* 2. Library Gate */}
      {gateLibrary.render && (
        <CampusGate position={gateLibrary.pos} rotation={[0, gateLibrary.rotation, 0]} label={gateLibrary.label} />
      )}

      {/* 2. Boundary Wall & VIGNAN'S FOUNDATION Signboard */}
      {boundaryWall.render && (
        <group position={boundaryWall.pos} rotation={[0, boundaryWall.rotation, 0]}>
          {/* Black Tiled Wall (Foreground) */}
          <mesh position={[0, 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[25, 4, 1]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
          </mesh>
          {/* Golden 3D Text */}
          <Text position={[0, 2.5, 0.6]} fontSize={1.5} color="#FFD700" fontStyle="italic" fontWeight="bold">
            {boundaryWall.label}
          </Text>
          <Text position={[0, 1.2, 0.6]} fontSize={0.7} color="#FFD700">
            FOR SCIENCE, TECHNOLOGY AND RESEARCH
          </Text>
        </group>
      )}

      {/* 3. Vignan Bus Stop (Across the Highway) */}
      {busStopZone.render && (
        <VignanBusStop position={busStopZone.pos} rotation={[0, busStopZone.rotation, 0]} />
      )}
      {/* 🏛️ NTR VIGNAN CENTRAL LIBRARY */}
      {/* Position: [-25.0, 0, -40.0]. Rotated to face the center circle */}
      {libZone.render && (
        <group position={libZone.pos} rotation={[0, libZone.rotation, 0]}>
        
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
            {libZone.label}
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
      )}

      {/* 🏢 A-BLOCK (Administrative Block) */}
      {ablockZone.render && (
        <group position={ablockZone.pos} rotation={[0, ablockZone.rotation, 0]}>
        {/* Floating Label for A-Block */}
        <Text position={[0, 26, 0]} fontSize={4} color="white" outlineWidth={0.2} outlineColor="black">
          {ablockZone.label}
        </Text>
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
      )}

      {/* 🏢 H-BLOCK (Sri Visweswaraya Bhavan) */}
      {hblockZone.render && (
        <group position={hblockZone.pos} rotation={[0, hblockZone.rotation, 0]}>
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
            {hblockZone.label}
          </Text>
        </group>
      </group>
      )}

      {/* 🏢 N-BLOCK (Nagarjuna Block) & MHP (The Most Happening Place) */}
      {nblockZone.render && (
        <group position={nblockZone.pos} rotation={[0, nblockZone.rotation, 0]}>
          {/* Courtyard Concrete Pavement */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
            <planeGeometry args={[104, 58]} />
            <meshStandardMaterial color="#a0a0a0" roughness={0.9} />
          </mesh>

          {/* 🏢 WEST WING (North side in rotated frame) */}
          <mesh position={[-60, 12, -2]} castShadow receiveShadow>
            <boxGeometry args={[16, 24, 58]} />
            <meshStandardMaterial color="#fcfcfc" roughness={0.9} />
          </mesh>
          
          {/* 🏢 EAST WING (South side in rotated frame) */}
          <mesh position={[60, 12, -2]} castShadow receiveShadow>
            <boxGeometry args={[16, 24, 58]} />
            <meshStandardMaterial color="#fcfcfc" roughness={0.9} />
          </mesh>

          {/* Orange End Cladding for West Wing (facing East/courtyard opening) */}
          <mesh position={[-60, 12, 27.1]} castShadow>
            <boxGeometry args={[16, 24, 0.2]} />
            <meshStandardMaterial color="#C26D38" roughness={0.5} />
          </mesh>

          {/* Orange End Cladding for East Wing (facing East/courtyard opening) */}
          <mesh position={[60, 12, 27.1]} castShadow>
            <boxGeometry args={[16, 24, 0.2]} />
            <meshStandardMaterial color="#C26D38" roughness={0.5} />
          </mesh>

          {/* Orange Corner Cladding (West Wing / Connector junction) */}
          <mesh position={[-51, 12, -15]} castShadow>
            <boxGeometry args={[2, 24, 2]} />
            <meshStandardMaterial color="#C26D38" roughness={0.5} />
          </mesh>

          {/* Orange Corner Cladding (East Wing / Connector junction) */}
          <mesh position={[51, 12, -15]} castShadow>
            <boxGeometry args={[2, 24, 2]} />
            <meshStandardMaterial color="#C26D38" roughness={0.5} />
          </mesh>

          {/* 🏢 NORTH WING (Connector - West side in rotated frame) */}
          <mesh position={[0, 12, -23]} castShadow receiveShadow>
            <boxGeometry args={[104, 24, 16]} />
            <meshStandardMaterial color="#fcfcfc" roughness={0.9} />
          </mesh>

          {/* 🏛️ Central Concrete Atrium Grid (Back of Courtyard) */}
          <group position={[0, 0, -15]}>
            {/* 4 Corner columns */}
            {[-8, 8].map((ax) => 
              [-4, 4].map((az) => (
                <mesh key={`atrium-col-${ax}-${az}`} position={[ax, 13, az]} castShadow>
                  <boxGeometry args={[0.8, 26, 0.8]} />
                  <meshStandardMaterial color="#888888" roughness={0.9} />
                </mesh>
              ))
            )}
            {/* Horizontal floor slabs for atrium (every 4 units) */}
            {Array.from({ length: 7 }).map((_, f) => (
              <mesh key={`atrium-slab-${f}`} position={[0, f * 4, 0]} castShadow>
                <boxGeometry args={[16.8, 0.3, 8.8]} />
                <meshStandardMaterial color="#777777" roughness={0.9} />
              </mesh>
            ))}
          </group>

          {/* 🎢 ZIG-ZAG RAMPS (West Wing Outer Face - North side of courtyard) */}
          {Array.from({ length: 6 }).map((_, f) => {
            const isForward = f % 2 === 0;
            const startZ = isForward ? 20 : -20;
            const endZ = isForward ? -20 : 20;
            const startY = f * 4;
            const endY = (f + 1) * 4;
            const centerZ = (startZ + endZ) / 2;
            const centerY = (startY + endY) / 2;
            const len = 40;
            const angle = Math.atan2(4, 40);
            return (
              <group key={`ramp-${f}`}>
                {/* Sloped ramp deck */}
                <mesh 
                  position={[-71, centerY, centerZ]} 
                  rotation={[isForward ? angle : -angle, 0, 0]}
                  castShadow 
                  receiveShadow
                >
                  <boxGeometry args={[4, 0.25, len]} />
                  <meshStandardMaterial color="#f3f4f6" roughness={0.8} />
                </mesh>
                {/* Outer wall/railing for ramp */}
                <mesh 
                  position={[-73, centerY + 0.5, centerZ]} 
                  rotation={[isForward ? angle : -angle, 0, 0]}
                  castShadow
                >
                  <boxGeometry args={[0.1, 1.2, len]} />
                  <meshStandardMaterial color="#e5e7eb" />
                </mesh>
              </group>
            );
          })}

          {/* Vertical support columns for the ramps */}
          {[-20, 0, 20].map((z) => (
            <mesh key={`ramp-support-${z}`} position={[-73, 12, z]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 24]} />
              <meshStandardMaterial color="#ffffff" roughness={0.8} />
            </mesh>
          ))}

          {/* 🧱 TERRACOTTA VERTICAL PILLARS (Spacing out the windows) */}
          {[-25, -15, -5, 5, 15, 25].map((z) => (
            <group key={`pillars-${z}`}>
              {/* West Wing Inner Pillar */}
              <mesh position={[-51.8, 12, z]} castShadow>
                <boxGeometry args={[0.5, 24, 1.4]} />
                <meshStandardMaterial color="#C26D38" roughness={0.5} />
              </mesh>
              {/* West Wing Outer Pillar */}
              <mesh position={[-68.2, 12, z]} castShadow>
                <boxGeometry args={[0.5, 24, 1.4]} />
                <meshStandardMaterial color="#C26D38" roughness={0.5} />
              </mesh>
              {/* East Wing Inner Pillar */}
              <mesh position={[51.8, 12, z]} castShadow>
                <boxGeometry args={[0.5, 24, 1.4]} />
                <meshStandardMaterial color="#C26D38" roughness={0.5} />
              </mesh>
              {/* East Wing Outer Pillar */}
              <mesh position={[68.2, 12, z]} castShadow>
                <boxGeometry args={[0.5, 24, 1.4]} />
                <meshStandardMaterial color="#C26D38" roughness={0.5} />
              </mesh>
            </group>
          ))}

          {/* 🏢 HORIZONTAL WHITE FLOOR LEDGES */}
          {Array.from({ length: 6 }).map((_, f) => {
            const y = (f + 1) * 4 - 0.2;
            return (
              <group key={`floor-ledges-${f}`}>
                {/* West Wing Ledges */}
                <mesh position={[-60, y, -2]} castShadow>
                  <boxGeometry args={[16.2, 0.3, 58.2]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.7} />
                </mesh>
                {/* East Wing Ledges */}
                <mesh position={[60, y, -2]} castShadow>
                  <boxGeometry args={[16.2, 0.3, 58.2]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.7} />
                </mesh>
                {/* North Wing Ledges */}
                <mesh position={[0, y, -23]} castShadow>
                  <boxGeometry args={[104.2, 0.3, 16.2]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.7} />
                </mesh>
              </group>
            )
          })}

          {/* ⛺ TENSILE CANOPY TENTS (North Wing Roof) */}
          {[-45, -30, -15, 0, 15, 30, 45].map((x) => (
            <group key={`tent-${x}`} position={[x, 24, -23]}>
              {/* Tent Membrane */}
              <mesh position={[0, 2.5, 0]} castShadow>
                <coneGeometry args={[4.5, 5, 4, 1, false, Math.PI / 4]} />
                <meshStandardMaterial color="#f0f4f8" roughness={0.4} side={2} />
              </mesh>
              {/* Supporting corner posts */}
              {[-3.5, 3.5].map((tx) => 
                [-3.5, 3.5].map((tz) => (
                  <mesh key={`post-${tx}-${tz}`} position={[tx, 1, tz]} castShadow>
                    <cylinderGeometry args={[0.05, 0.05, 2]} />
                    <meshStandardMaterial color="#bbbbbb" />
                  </mesh>
                ))
              )}
            </group>
          ))}

          {/* 🖼️ WINDOWS GRIDS (Inner faces facing Courtyard) */}
          {/* West Wing Windows (facing +X) */}
          <group position={[-52.05, 0, -2]} rotation={[0, Math.PI / 2, 0]}>
            <WindowGrid width={58} height={24} floors={6} floorHeight={4} />
          </group>
          {/* East Wing Windows (facing -X) */}
          <group position={[52.05, 0, -2]} rotation={[0, -Math.PI / 2, 0]}>
            <WindowGrid width={58} height={24} floors={6} floorHeight={4} />
          </group>
          {/* North Wing Windows (facing +Z) */}
          <group position={[0, 0, -15.05]}>
            <WindowGrid width={104} height={24} floors={6} floorHeight={4} />
          </group>

          {/* NAGARJUNA BLOCK sign at top of North Wing (facing south/courtyard) */}
          <group position={[0, 21, -14.9]}>
            <Text fontSize={1.8} color="white" outlineColor="black" outlineWidth={0.1}>
              {nblockZone.label}
            </Text>
            <Text position={[0, -1.3, 0]} fontSize={0.8} color="#FFD700" outlineColor="black" outlineWidth={0.05}>
              NAGARJUNA BLOCK
            </Text>
          </group>

          {/* 🍔 THE MOST HAPPENING PLACE (MHP) */}
          {/* Relocated to the ground floor inner face of East Wing, facing the courtyard */}
          <group position={[52.1, 0, 10]} rotation={[0, -Math.PI / 2, 0]}>
            {/* Main Entrance portal frame */}
            <mesh position={[0, 2.5, 0.1]} castShadow>
              <boxGeometry args={[18, 5, 0.5]} />
              <meshStandardMaterial color="#6E1E1E" />
            </mesh>
            {/* Glass facade entrance doors */}
            <mesh position={[0, 2.2, 0.2]} castShadow>
              <boxGeometry args={[14, 3.6, 0.1]} />
              <meshStandardMaterial color="#88ccff" transparent opacity={0.6} roughness={0.1} />
            </mesh>

            {/* Blue illuminated LED Sign "THE MOST HAPPENING PLACE" */}
            <group position={[0, 4.4, 0.3]}>
              {/* Background signboard panel */}
              <mesh>
                <boxGeometry args={[16, 0.8, 0.1]} />
                <meshStandardMaterial color="#111" />
              </mesh>
              {/* Blue LED Text */}
              <Text
                position={[0, 0, 0.1]}
                fontSize={0.65}
                color="#00D2FF"
                fontWeight="bold"
                outlineWidth={0.05}
                outlineColor="#003366"
              >
                THE MOST HAPPENING PLACE
              </Text>
            </group>

            {/* Interior Food Court (Tables & Chairs inside East Wing ground floor) */}
            <group position={[0, 0, -4]}>
              {/* Red, Yellow, White dining tables/chairs */}
              {[
                { pos: [-4, 0.5, -2], color: "#FF3B30" },
                { pos: [4, 0.5, -2], color: "#FFCC00" },
                { pos: [0, 0.5, -5], color: "#FFFFFF" }
              ].map((tbl, i) => (
                <group key={i} position={tbl.pos}>
                  <mesh position={[0, 0.6, 0]} castShadow>
                    <cylinderGeometry args={[0.9, 0.9, 0.08]} />
                    <meshStandardMaterial color={tbl.color} />
                  </mesh>
                  <mesh position={[0, 0.3, 0]}>
                    <cylinderGeometry args={[0.08, 0.08, 0.6]} />
                    <meshStandardMaterial color="#222" />
                  </mesh>
                  {[-1, 1].map((sx) => 
                    [-1, 1].map((sz) => (
                      <mesh key={`${sx}-${sz}`} position={[sx, 0.25, sz]} castShadow>
                        <cylinderGeometry args={[0.25, 0.25, 0.5]} />
                        <meshStandardMaterial color={tbl.color} />
                      </mesh>
                    ))
                  )}
                </group>
              ))}
            </group>
          </group>
        </group>
      )}

      {/* 🏨 HOSTELS */}
      {/* Boys Hostel: 3 floors (height = 12) */}
      {boyshostelZone.render && (
        <group rotation={[0, boyshostelZone.rotation, 0]}>
          <MultiStoryBuilding
            position={boyshostelZone.pos}
            size={boyshostelZone.size || [52, 22]}
            floors={3}
            accentColor="#FF8C00"
            label={boyshostelZone.label}
          />
        </group>
      )}

      {/* AC Hostel: 3 floors (height = 12) */}
      {achostelZone.render && (
        <group rotation={[0, achostelZone.rotation, 0]}>
          <MultiStoryBuilding
            position={achostelZone.pos}
            size={achostelZone.size || [26, 22]}
            floors={3}
            accentColor="#E67E22"
            label={achostelZone.label}
          />
        </group>
      )}

      {/* Hostel Connector Walkway/Bridge */}
      {connectorZone.render && (
        <group position={connectorZone.pos} rotation={[0, connectorZone.rotation, 0]}>
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
      )}

      {/* 🍽️ CANTEEN SHED */}
      {canteenZone.render && (
        <group position={canteenZone.pos} rotation={[0, canteenZone.rotation, 0]}>
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
          {canteenZone.label}
        </Text>
      </group>
      )}

      {/* ⚽ SPORTS FIELD */}
      {sportsZone.render && (
        <group position={sportsZone.pos} rotation={[0, sportsZone.rotation, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
          <planeGeometry args={[(sportsZone.size ? sportsZone.size[0] - 4 : 66), (sportsZone.size ? sportsZone.size[1] - 4 : 90)]} />
          <meshStandardMaterial color="#2d8a4e" roughness={0.9} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <planeGeometry args={[(sportsZone.size ? sportsZone.size[0] - 6 : 64), 2]} />
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
          {sportsZone.label}
        </Text>
      </group>
      )}

      {/* 🚜 FARM ZONE (Walled off with large trees) */}
      {farmZone.render && (
        <group position={farmZone.pos} rotation={[0, farmZone.rotation, 0]}>
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
          <planeGeometry args={farmZone.size || [46, 53]} />
          <meshStandardMaterial color="#3E8E41" roughness={0.9} /> {/* Deep grass green */}
        </mesh>
        
        {/* Boundary Walls (No Entry) */}
        {/* Front/Back Walls */}
        {[-(farmZone.size ? farmZone.size[1] : 53)/2, (farmZone.size ? farmZone.size[1] : 53)/2].map((z, i) => (
          <mesh key={`fw-${i}`} position={[0, 3, z]} castShadow receiveShadow>
            <boxGeometry args={[(farmZone.size ? farmZone.size[0] : 46), 6, 1]} />
            <meshStandardMaterial color="#888" roughness={0.8} />
          </mesh>
        ))}
        {/* Left/Right Walls */}
        {[-(farmZone.size ? farmZone.size[0] : 46)/2, (farmZone.size ? farmZone.size[0] : 46)/2].map((x, i) => (
          <mesh key={`sw-${i}`} position={[x, 3, 0]} castShadow receiveShadow>
            <boxGeometry args={[1, 6, (farmZone.size ? farmZone.size[1] : 53)]} />
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
          {farmZone.label}
        </Text>
      </group>
      )}

      {/* 🏬 SMALL ZONE */}
      {smallZone.render && (
        <group position={smallZone.pos} rotation={[0, smallZone.rotation, 0]}>
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
                {smallZone.label} #{i+1}
              </Text>
            </group>
          );
        })}
      </group>
      )}

      {/* 3. APPROACH ROAD LEFT ZONE (Shrine & Hoarding) */}
      {newOutsideZone.render && (
        <group position={newOutsideZone.pos} rotation={[0, newOutsideZone.rotation, 0]}>
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
            {newOutsideZone.label}
          </Text>
        </group>

        {/* Huge Hoarding Billboard (Placed near the shrine, facing the highway at +Z, shifted left to avoid road) */}
        <group position={[-5, 0, 8]} rotation={[0, 0, 0]}>
          <HoardingBillboard />
        </group>
      </group>
      )}

      {/* MUD GROUND WITH WALKING TRACK (Between H-Block Road and Boys Hostel) */}
      <group position={groundZone.pos}>
        <MudGroundWithTrack position={[0, 0, 0]} size={groundZone.size || [53, 22]} />
      </group>

      {/* 🏢 SECTOR A: SOUTH-WEST ZONE LANDMARKS */}
      {ublockZone.render && (
        <group rotation={[0, ublockZone.rotation, 0]}>
          <UShapeBlock position={ublockZone.pos} size={ublockZone.size || [75, 85]} floors={4} color="#dad20a" label={ublockZone.label} />
        </group>
      )}

      {convocationhallZone.render && (
        <ConvocationHall position={convocationhallZone.pos} size={convocationhallZone.size || [25, 85]} floors={3} color="#9f96f7" label={convocationhallZone.label} />
      )}

      {guesthouseZone.render && (
        <group rotation={[0, guesthouseZone.rotation, 0]}>
          <MultiStoryBuilding position={guesthouseZone.pos} size={guesthouseZone.size || [30, 30]} floors={2} accentColor="#37794b" label={guesthouseZone.label} />
        </group>
      )}

      {volleyballcourtsZone.render && (
        <group position={volleyballcourtsZone.pos} rotation={[0, volleyballcourtsZone.rotation, 0]}>
          {[-12, 12].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
                <planeGeometry args={[18, 28]} />
                <meshStandardMaterial color="#dfc28d" roughness={0.9} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
                <planeGeometry args={[18.2, 0.2]} />
                <meshStandardMaterial color="#fff" />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
                <planeGeometry args={[0.2, 28.2]} />
                <meshStandardMaterial color="#fff" />
              </mesh>
              {[-10, 10].map((nx) => (
                <mesh key={nx} position={[nx, 1.5, 0]} castShadow>
                  <cylinderGeometry args={[0.08, 0.08, 3]} />
                  <meshStandardMaterial color="#555" />
                </mesh>
              ))}
              <mesh position={[0, 2.2, 0]}>
                <boxGeometry args={[20, 0.8, 0.02]} />
                <meshStandardMaterial color="#fff" transparent opacity={0.4} wireframe />
              </mesh>
            </group>
          ))}
          <Text position={[0, 5, 0]} fontSize={2.5} color="white" outlineColor="black" outlineWidth={0.1}>
            {volleyballcourtsZone.label}
          </Text>
        </group>
      )}

      {/* 🏢 SECTOR B: NORTH-EAST / PHARMACY ZONE LANDMARKS */}
      {textileZone.render && (
        <group rotation={[0, textileZone.rotation, 0]}>
          <MultiStoryBuilding position={textileZone.pos} size={textileZone.size || [15, 70]} floors={3} accentColor="#927b5d" label={textileZone.label} />
        </group>
      )}

      {pharmacyZone.render && (
        <group rotation={[0, pharmacyZone.rotation, 0]}>
          <MultiStoryBuilding position={pharmacyZone.pos} size={pharmacyZone.size || [30, 70]} floors={4} accentColor="#847e42" label={pharmacyZone.label} />
        </group>
      )}

      {pharmacyBadmintonZone.render && (
        <group position={pharmacyBadmintonZone.pos} rotation={[0, pharmacyBadmintonZone.rotation, 0]}>
          {[-6, 6].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
                <planeGeometry args={[8, 15]} />
                <meshStandardMaterial color="#228B22" roughness={0.9} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
                <planeGeometry args={[8.2, 0.15]} />
                <meshStandardMaterial color="#fff" />
              </mesh>
              {[-4.2, 4.2].map((px) => (
                <mesh key={px} position={[px, 0.8, 0]}><cylinderGeometry args={[0.04, 0.04, 1.65]}/><meshStandardMaterial color="#444"/></mesh>
              ))}
              <mesh position={[0, 1.2, 0]}><boxGeometry args={[8.4, 0.4, 0.01]}/><meshStandardMaterial color="#ddd" transparent opacity={0.5} wireframe/></mesh>
            </group>
          ))}
          <Text position={[0, 4, 0]} fontSize={1.8} color="white" outlineColor="black" outlineWidth={0.08}>
            {pharmacyBadmintonZone.label}
          </Text>
        </group>
      )}

      {pharmacyVolleyballZone.render && (
        <group position={pharmacyVolleyballZone.pos} rotation={[0, pharmacyVolleyballZone.rotation, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
            <planeGeometry args={[18, 24]} />
            <meshStandardMaterial color="#dfc28d" roughness={0.9} />
          </mesh>
          {[-10, 10].map((x) => (
            <mesh key={x} position={[x, 1.5, 0]}><cylinderGeometry args={[0.08, 0.08, 3]}/><meshStandardMaterial color="#555"/></mesh>
          ))}
          <mesh position={[0, 2.2, 0]}><boxGeometry args={[20, 0.8, 0.02]}/><meshStandardMaterial color="#fff" transparent opacity={0.4} wireframe/></mesh>
          <Text position={[0, 4.5, 0]} fontSize={1.8} color="white" outlineColor="black" outlineWidth={0.08}>
            {pharmacyVolleyballZone.label}
          </Text>
        </group>
      )}

      {/* 🏟️ SECTOR C: NORTH-WEST / SPORTS ZONE LANDMARKS */}
      {cricketZone.render && (
        <group position={cricketZone.pos} rotation={[0, cricketZone.rotation, 0]}>
          {/* Oval green field — circleGeometry scaled on Z to form an ellipse (110 x 40) */}
          <group scale={[1, 1, 40 / 110]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
              <circleGeometry args={[110, 64]} />
              <meshStandardMaterial color="#1e5c2f" roughness={0.9} />
            </mesh>
            {/* White boundary ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
              <ringGeometry args={[107, 110, 64]} />
              <meshBasicMaterial color="white" />
            </mesh>
          </group>
          {/* Pitch strip (unscaled — centered on ground) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <planeGeometry args={[6, 20]} />
            <meshStandardMaterial color="#c29c6a" roughness={0.8} />
          </mesh>
          {/* Wickets at each end */}
          {[-8, 8].map((z) => (
            <group key={z} position={[0, 0, z]}>
              {[-0.2, 0, 0.2].map((x) => (
                <mesh key={x} position={[x, 0.5, 0]} castShadow>
                  <cylinderGeometry args={[0.03, 0.03, 1]} />
                  <meshStandardMaterial color="#e0a96d" />
                </mesh>
              ))}
              <mesh position={[0, 1.02, 0]}>
                <boxGeometry args={[0.5, 0.03, 0.03]} />
                <meshStandardMaterial color="#e0a96d" />
              </mesh>
            </group>
          ))}
          <Text position={[0, 6, 0]} fontSize={4} color="white" outlineColor="black" outlineWidth={0.15}>
            {cricketZone.label}
          </Text>
        </group>
      )}

      {basketballZone.render && (
        <group position={basketballZone.pos} rotation={[0, basketballZone.rotation, 0]}>
          {[-35, 0, 35].map((z) => (
            <group key={z} position={[0, 0, z]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
                <planeGeometry args={[26, 15]} />
                <meshStandardMaterial color="#2b5c8f" roughness={0.8} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
                <planeGeometry args={[26.2, 0.15]} />
                <meshStandardMaterial color="#fff" />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
                <planeGeometry args={[0.15, 15.2]} />
                <meshStandardMaterial color="#fff" />
              </mesh>
              {[-13, 13].map((x) => (
                <group key={x} position={[x, 0, 0]} rotation={[0, x < 0 ? Math.PI/2 : -Math.PI/2, 0]}>
                  <mesh position={[0, 2.5, 0]} castShadow>
                    <cylinderGeometry args={[0.1, 0.1, 5]} />
                    <meshStandardMaterial color="#555" />
                  </mesh>
                  <mesh position={[0.4, 4.8, 0]} castShadow>
                    <boxGeometry args={[0.1, 1.2, 1.8]} />
                    <meshStandardMaterial color="#fff" />
                  </mesh>
                  <mesh position={[0.9, 4.4, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
                    <torusGeometry args={[0.3, 0.03, 8, 16]} />
                    <meshStandardMaterial color="#ff5500" />
                  </mesh>
                </group>
              ))}
            </group>
          ))}
          <Text position={[0, 6, 0]} fontSize={2.8} color="white" outlineColor="black" outlineWidth={0.1}>
            {basketballZone.label}
          </Text>
        </group>
      )}

      {pondZone.render && (
        <group position={pondZone.pos} rotation={[0, pondZone.rotation, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
            <planeGeometry args={[41, 41]} />
            <meshStandardMaterial color="#4d88ff" transparent opacity={0.65} roughness={0.1} metalness={0.9} />
          </mesh>
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 24;
            const radius = 20.5;
            const rx = Math.cos(angle) * radius;
            const rz = Math.sin(angle) * radius;
            const scale = 1.2 + Math.random() * 1.5;
            return (
              <mesh key={i} position={[rx, 0.3, rz]} castShadow>
                <dodecahedronGeometry args={[scale]} />
                <meshStandardMaterial color="#5a5e6b" roughness={0.9} />
              </mesh>
            );
          })}
          {[
            [-5, -8], [8, -3], [-3, 6], [7, 5], [-8, 2]
          ].map(([px, pz], idx) => (
            <mesh key={idx} position={[px, 0.04, pz]} rotation={[-Math.PI/2, 0, Math.random() * 6]}>
              <cylinderGeometry args={[1.1, 1.1, 0.02, 16, 1, false, 0, Math.PI * 1.9]} />
              <meshStandardMaterial color="#1f6b31" roughness={0.8} />
            </mesh>
          ))}
          <Text position={[0, 4, 0]} fontSize={2.2} color="white" outlineColor="black" outlineWidth={0.1}>
            {pondZone.label}
          </Text>
        </group>
      )}

      {girlsHostelZone.render && (
        <group rotation={[0, girlsHostelZone.rotation, 0]}>
          <MultiStoryBuilding
            position={girlsHostelZone.pos}
            size={girlsHostelZone.size || [45, 60]}
            floors={4}
            accentColor="#8add61"
            label={girlsHostelZone.label}
          />
        </group>
      )}
    </group>
  );
}

export function UShapeBlock({ position, size = [30, 15, 20], floors = 3, color = '#eaeaea', label }) {
  const height = floors * 4;
  const [w, , d] = size;
  const wallThick = Math.min(w, d) * 0.25;
  
  return (
    <group position={position}>
      {/* Back connector */}
      <mesh position={[0, height / 2, -d / 2 + wallThick / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, height, wallThick]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Left Wing */}
      <mesh position={[-w / 2 + wallThick / 2, height / 2, wallThick / 2]} castShadow receiveShadow>
        <boxGeometry args={[wallThick, height, d - wallThick]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Right Wing */}
      <mesh position={[w / 2 - wallThick / 2, height / 2, wallThick / 2]} castShadow receiveShadow>
        <boxGeometry args={[wallThick, height, d - wallThick]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Floating Label */}
      {label && (
        <Text position={[0, height + 3, 0]} fontSize={2.5} color="white" outlineColor="black" outlineWidth={0.1}>
          {label}
        </Text>
      )}
    </group>
  );
}

export function OShapeBlock({ position, size = [30, 15, 30], floors = 3, color = '#eaeaea', label }) {
  const height = floors * 4;
  const [w, , d] = size;
  const wallThick = Math.min(w, d) * 0.22;
  
  return (
    <group position={position}>
      {/* Back Wall */}
      <mesh position={[0, height / 2, -d / 2 + wallThick / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, height, wallThick]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Front Wall */}
      <mesh position={[0, height / 2, d / 2 - wallThick / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, height, wallThick]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-w / 2 + wallThick / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThick, height, d - wallThick * 2]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[w / 2 - wallThick / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThick, height, d - wallThick * 2]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Floating Label */}
      {label && (
        <Text position={[0, height + 3, 0]} fontSize={2.5} color="white" outlineColor="black" outlineWidth={0.1}>
          {label}
        </Text>
      )}
    </group>
  );
}

export function ConvocationHall({ position, size = [24, 24], floors = 3, color = '#eaeaea', label }) {
  const height = floors * 4;
  const radius = size[0] / 2;
  const coneHeight = radius * 0.6;
  
  return (
    <group position={position}>
      {/* Octagonal Main Structure */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, height, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Dome/Cone Roof */}
      <mesh position={[0, height + coneHeight / 2, 0]} castShadow>
        <coneGeometry args={[radius * 1.1, coneHeight, 8]} />
        <meshStandardMaterial color="#DAA520" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Spike top */}
      <mesh position={[0, height + coneHeight + 1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 2]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      {/* Floating Label */}
      {label && (
        <Text position={[0, height + coneHeight + 3, 0]} fontSize={2.5} color="white" outlineColor="black" outlineWidth={0.1}>
          {label}
        </Text>
      )}
    </group>
  );
}

export function SingleTree({ position }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 3]} />
        <meshStandardMaterial color="#5C4033" roughness={0.9} />
      </mesh>
      {/* Foliage */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <sphereGeometry args={[1.5, 8, 8]} />
        <meshStandardMaterial color="#2E8B57" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function TreeRow({ position, size = [40, 1], rotation = 0 }) {
  const [length] = size;
  const numTrees = Math.max(2, Math.floor(length / 8));
  
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {Array.from({ length: numTrees }).map((_, i) => {
        const offset = -length / 2 + (i / (numTrees - 1)) * length;
        return <SingleTree key={i} position={[offset, 0, 0]} />;
      })}
    </group>
  );
}
