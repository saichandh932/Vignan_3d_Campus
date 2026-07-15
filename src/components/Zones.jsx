import { Text } from '@react-three/drei';

// Final hardcoded zone positions
const ZONES = [
  { id: 'library', label: 'LIBRARY', size: [21, 21], color: '#8B4513', pos: [-25.0, 0, -40.0] },
  { id: 'farm', label: 'FARM ZONE', size: [46, 53], color: '#228B22', pos: [-30.0, 0, -93.5] },
  { id: 'ablock', label: 'A-BLOCK', size: [75, 64], color: '#0000FF', pos: [47.5, 0, -2.0] },
  { id: 'smallzone', label: 'SMALL ZONE', size: [15, 64], color: '#FF1493', pos: [92.5, 0, -2.0] },
  { id: 'new_outside_zone', label: 'NEW ZONE', size: [21, 30], color: '#DAA520', pos: [-16.5, 0, 15.0] },
  { id: 'hblock', label: 'H-BLOCK', size: [90, 53], color: '#4B0082', pos: [55.0, 0, -72.5] },
  { id: 'canteen', label: 'CANTEEN & TT', size: [19, 22], color: '#00FFFF', pos: [90.5, 0, -122.0] },
  { id: 'sportsground', label: 'HOCKEY & FOOTBALL GROUND', size: [70, 94], color: '#3CB371', pos: [135.0, 0, -93.0] },
  { id: 'mhp', label: 'MHP (Ground Floor)', size: [20, 20], color: '#DC143C', pos: [-20.0, 0, -165.0] },
  { id: 'nblock', label: 'N-BLOCK', size: [93, 50], color: '#800000', pos: [-53.5, 0, -161.0] },
  { id: 'boyshostel', label: 'BOYS HOSTEL', size: [60, 50], color: '#FF8C00', pos: [40.0, 0, -165.0] },
  { id: 'achostel', label: 'AC HOSTEL', size: [30, 50], color: '#FF8C00', pos: [95.0, 0, -165.0] },
  { id: 'hostel_connector', label: '', size: [10, 20], color: '#FF8C00', pos: [75.0, 0, -180.0] },
  { id: 'ground', label: 'GROUND', size: [60, 25], color: '#FFFF00', pos: [40.0, 0, -125.0] },
];

function BoundaryWall({ position, size, rotation = [0, 0, 0] }) {
  const [w, h, d] = size;
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, -h/2 + (h * 0.4)/2, 0]}>
        <boxGeometry args={[w, h * 0.4, d]} />
        <meshStandardMaterial color="#88cc44" />
      </mesh>
      <mesh position={[0, h/2 - (h * 0.6)/2, 0]}>
        <boxGeometry args={[w, h * 0.6, d * 0.2]} />
        <meshStandardMaterial color="#555555" transparent opacity={0.5} wireframe />
      </mesh>
    </group>
  );
}

export function Zones() {
  return (
    <group>
      {/* Zone ground planes (subtle, under buildings) */}
      {ZONES.map((z) => (
        <group key={z.id} position={z.pos}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <planeGeometry args={z.size} />
            <meshStandardMaterial color={z.color} opacity={0.2} transparent />
          </mesh>
        </group>
      ))}

      {/* Static GARDEN label */}
      <Text
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-65, 0.3, -30]}
        fontSize={6}
        color="#32CD32"
        outlineWidth={0.3}
        outlineColor="#006400"
      >
        GARDEN
      </Text>

      {/* ===== BOUNDARY WALLS ===== */}
      
      {/* Wall from Gate to A-Block edge */}
      <BoundaryWall position={[8, 1.5, 0]} size={[4, 3, 1]} />
      
      {/* Massive Sweeping Curved Boundary Wall (Main Gate to Library Gate) */}
      <group position={[-6, 1.5, -120.13]}>
        <mesh position={[0, -0.9, 0]}>
          <cylinderGeometry args={[120.13, 120.13, 1.2, 64, 1, true, -1.047, 1.047]} />
          <meshStandardMaterial color="#88cc44" side={2} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[120.13, 120.13, 1.8, 64, 1, true, -1.047, 1.047]} />
          <meshStandardMaterial color="#555555" transparent opacity={0.5} wireframe side={2} />
        </mesh>
      </group>
      
      {/* Wall going out towards Highway along A-Block left edge */}
      <BoundaryWall position={[10, 1.5, 15]} size={[30, 3, 1]} rotation={[0, Math.PI/2, 0]} />
      
      {/* Highway Frontage Wall */}
      <BoundaryWall position={[55, 1.5, 30]} size={[90, 3, 1]} />
      
      {/* Right Perimeter Wall */}
      {/* Main Campus East Boundary (Split to create an entry to the Hockey Ground at Z=-105) */}
      <BoundaryWall position={[100, 1.5, -34.5]} size={[129, 3, 1]} rotation={[0, Math.PI/2, 0]} />
      <BoundaryWall position={[100, 1.5, -125.5]} size={[29, 3, 1]} rotation={[0, Math.PI/2, 0]} />
      
      {/* Hockey & Football Ground Boundary Walls */}
      <BoundaryWall position={[135, 1.5, -46]} size={[70, 3, 1]} />
      <BoundaryWall position={[135, 1.5, -140]} size={[70, 3, 1]} />
      <BoundaryWall position={[170, 1.5, -93]} size={[94, 3, 1]} rotation={[0, Math.PI/2, 0]} />
      
      {/* Farm Boundary Walls */}
      <BoundaryWall position={[-30, 1.5, -120]} size={[46, 3, 1]} />
      <BoundaryWall position={[-53, 1.5, -93.5]} size={[53, 3, 1]} rotation={[0, Math.PI/2, 0]} />

      {/* ===== GATES ===== */}
      {/* Gates have been moved to Buildings.jsx as CampusGate instances */}
    </group>
  );
}
