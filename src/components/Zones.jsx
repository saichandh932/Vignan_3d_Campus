import { Text } from '@react-three/drei';

// Final hardcoded zone positions
export const ZONES = [
  { id: 'library', label: 'LIBRARY', size: [21, 21], color: '#8B4513', pos: [-25.0, 0, -40.0] },
  { id: 'farm', label: 'FARM ZONE', size: [46, 53], color: '#228B22', pos: [-30.0, 0, -93.5] },
  { id: 'ablock', label: 'A-BLOCK', size: [75, 64], color: '#0000FF', pos: [47.5, 0, -2.0] },
  { id: 'smallzone', label: 'SMALL ZONE', size: [15, 64], color: '#FF1493', pos: [92.5, 0, -2.0] },
  { id: 'new_outside_zone', label: 'NEW ZONE', size: [21, 30], color: '#DAA520', pos: [-16.5, 0, 15.0] },
  { id: 'hblock', label: 'H-BLOCK', size: [90, 53], color: '#4B0082', pos: [55.0, 0, -72.5] },
  { id: 'canteen', label: 'CANTEEN & TT', size: [19, 22], color: '#00FFFF', pos: [90.5, 0, -122.0] },
  { id: 'sportsground', label: 'HOCKEY & FOOTBALL GROUND', size: [70, 94], color: '#3CB371', pos: [135.0, 0, -93.0] },
  { id: 'mhp', label: 'MHP (Ground Floor)', size: [20, 20], color: '#DC143C', pos: [-20.0, 0, -165.0] },
  { id: 'nblock', label: 'N-BLOCK', size: [62, 140], color: '#800000', pos: [-53.5, 0, -192.0] },
  { id: 'boyshostel', label: 'BOYS HOSTEL', size: [60, 50], color: '#FF8C00', pos: [40.0, 0, -165.0] },
  { id: 'achostel', label: 'AC HOSTEL', size: [30, 50], color: '#FF8C00', pos: [95.0, 0, -165.0] },
  { id: 'hostel_connector', label: '', size: [10, 20], color: '#FF8C00', pos: [75.0, 0, -180.0] },
  { id: 'ground', label: 'GROUND', size: [60, 25], color: '#FFFF00', pos: [40.0, 0, -125.0] },
  
  { id: 'convocationhall', label: 'CONVOCATION HALL', size: [25, 85], color: '#9f96f7', pos: [-196.5, 0, -197.5] },
  { id: 'guesthouse', label: 'GUEST HOUSE', size: [30, 30], color: '#37794b', pos: [-226.5, 0, -171.0] },
  { id: 'volleyballcourts', label: 'VOLLEY BALL COURTS', size: [50, 50], color: '#a5b65d', pos: [-236.5, 0, -214.0] },
  
  { id: 'textile', label: 'TEXTILE TECHNOLOGY', size: [15, 70], color: '#927b5d', pos: [49.0, 0, -334.5] },
  { id: 'pharmacy', label: 'PHARMACY BLOCK', size: [30, 70], color: '#847e42', pos: [122.0, 0, -333.5] },
  { id: 'pharmacy_badminton', label: 'PHARMACY BADMINTON COURT', size: [30, 30], color: '#5ae354', pos: [86.0, 0, -317.5] },
  { id: 'pharmacy_volleyball', label: 'PHARMACY VOLLEYBALL COURT', size: [30, 25], color: '#75e391', pos: [86.0, 0, -351.5] },
  
  { id: 'cricketground', label: 'CRICKET GROUND', size: [235, 85], color: '#223269', pos: [-121.0, 0, -340.5] },
  { id: 'basketballcourts', label: 'BASKETBALL COURTS', size: [30, 125], color: '#b29cd0', pos: [-271.5, 0, -359.5] },
  { id: 'vignanpond', label: 'VIGNAN POND', size: [45, 45], color: '#7fb0c9', pos: [-322.5, 0, -321.5] },
  { id: 'priyadarshinihostel', label: 'PRIYADARSHINI HOSTEL', size: [45, 60], color: '#8add61', pos: [-322.5, 0, -379.0] },
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

export function Zones({ zones = ZONES, isDroneMode = false, selectedZoneId = null, onSelectZone = () => {} }) {
  return (
    <group>
      {/* Zone ground planes (subtle, under buildings) */}
      {zones.map((z) => (
        <group 
          key={z.id} 
          position={z.pos}
          onClick={(e) => {
            if (isDroneMode) {
              e.stopPropagation();
              onSelectZone(z.id);
            }
          }}
          onPointerOver={(e) => {
            if (isDroneMode) {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }
          }}
          onPointerOut={(e) => {
            if (isDroneMode) {
              document.body.style.cursor = 'default';
            }
          }}
        >
          {/* Main Ground Plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <planeGeometry args={z.size || [20, 20]} />
            <meshStandardMaterial 
              color={z.color || '#444444'} 
              opacity={selectedZoneId === z.id ? 0.55 : 0.25} 
              transparent 
            />
          </mesh>

          {/* Active selection outline helper */}
          {selectedZoneId === z.id && (
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[z.size ? z.size[0] : 20, 0.25, z.size ? z.size[1] : 20]} />
              <meshBasicMaterial color="#ffffff" wireframe />
            </mesh>
          )}

          {/* Flat visual label in drone editor view */}
          {isDroneMode && z.label && (
            <Text
              position={[0, 0.15, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={Math.min(z.size ? z.size[0] : 20, z.size ? z.size[1] : 20) * 0.12 + 1.2}
              color={selectedZoneId === z.id ? "#ffffff" : "#cccccc"}
              fontWeight="bold"
              outlineWidth={0.1}
              outlineColor="#000000"
            >
              {z.label}
            </Text>
          )}
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
