import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Sky, OrbitControls, Text } from '@react-three/drei';
import { Buildings, MultiStoryBuilding, CampusGate, UShapeBlock, OShapeBlock, ConvocationHall, SingleTree, TreeRow } from './components/Buildings';
import { RoadSegment, RoadCross, RoadCorner } from './components/Roads';
import * as THREE from 'three';

// Player Avatar controller with Road Constraints
function PlayerController({ joystick }) {
  const { camera, scene } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const playerRef = useRef();
  const speed = 25; // Movement speed
  const shieldTexture = useLoader(THREE.TextureLoader, '/shield.jpg');

  // Reset camera position to third-person view when Walk Mode mounts
  useEffect(() => {
    if (playerRef.current) {
      camera.position.copy(playerRef.current.position).add(new THREE.Vector3(0, 10, 20));
    }
  }, [camera]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.w = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.a = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.s = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.d = true;
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.w = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.a = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.s = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.d = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const controls = state.controls;
    if (!controls) return;
    const target = controls.target;
    
    // Get forward direction projected on the XZ plane
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    
    // Prevent division by zero / NaN if looking straight down/up
    if (forward.lengthSq() < 0.001) {
      forward.set(0, 0, -1);
    } else {
      forward.normalize();
    }

    // Get right direction
    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up);
    if (right.lengthSq() < 0.001) {
      right.set(1, 0, 0);
    } else {
      right.normalize();
    }

    const moveDirection = new THREE.Vector3(0, 0, 0);

    // Keyboard inputs
    if (keys.current.w) moveDirection.add(forward);
    if (keys.current.s) moveDirection.sub(forward);
    if (keys.current.d) moveDirection.add(right);
    if (keys.current.a) moveDirection.sub(right);

    // Joystick inputs
    if (joystick && joystick.current) {
      if (joystick.current.y !== 0) moveDirection.add(forward.clone().multiplyScalar(-joystick.current.y));
      if (joystick.current.x !== 0) moveDirection.add(right.clone().multiplyScalar(joystick.current.x));
    }

    const player = playerRef.current;
    if (!player) return;

    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize();
      
      // Rotate the player model to face the movement direction
      const targetAngle = Math.atan2(moveDirection.x, moveDirection.z);
      // Smoothly rotate character
      const currentAngle = player.rotation.y;
      player.rotation.y = THREE.MathUtils.lerp(currentAngle, targetAngle, 0.1);

      moveDirection.multiplyScalar(speed * delta);
      
      if (!isNaN(moveDirection.x) && !isNaN(moveDirection.z)) {
        const nextPosition = player.position.clone().add(moveDirection);
        
        // Raycast straight down from slightly above the next position to check for RoadMesh
        const raycaster = new THREE.Raycaster();
        const origin = new THREE.Vector3(nextPosition.x, 10, nextPosition.z);
        const down = new THREE.Vector3(0, -1, 0);
        raycaster.set(origin, down);
        
        const intersects = raycaster.intersectObjects(scene.children, true);
        const hitRoad = intersects.some(hit => hit.object.name === "RoadMesh");
        
        // Only move if the next position is on a road
        if (hitRoad) {
          player.position.copy(nextPosition);
          // Move camera along with player to keep third-person view
          camera.position.add(moveDirection);
        }
      }
    }

    // Always keep OrbitControls targeting the player's torso
    target.copy(player.position).add(new THREE.Vector3(0, 1.5, 0));
    controls.update();
  });

  return (
    <group ref={playerRef} position={[0, 0, 50]}>
      {/* Vignan Shield Avatar (Background removed via alphaMap) */}
      <mesh position={[0, 1.5, 0]}>
        <planeGeometry args={[2, 2.5]} />
        <meshBasicMaterial 
          map={shieldTexture} 
          alphaMap={shieldTexture} 
          transparent={true} 
          side={THREE.DoubleSide} 
          color="#FFF"
        />
      </mesh>
    </group>
  );
}

// IMPORTANT: Increment this version string whenever DEFAULT_MAP_ITEMS is updated.
// This forces all users' browsers to discard their old localStorage and reload fresh defaults.
const LAYOUT_VERSION = "v14";

const DEFAULT_MAP_ITEMS = [
  { id: 'gate_main', type: 'gate', label: "VIGNAN'S FOUNDATION", pos: [0, 0, 0], rotation: 0, size: [18, 5] },
  { id: 'gate_library', type: 'gate', label: "LIBRARY ENTRANCE GATE", pos: [-110, 0, -60], rotation: 1.5707963267948966, size: [18, 5] },
  { id: 'boundary_wall', type: 'boundary_wall', label: "WALL", pos: [10, 0, 15], rotation: -1.5707963267948966, size: [25, 4] },
  { id: 'bus_stop', type: 'bus_stop', label: "BUS STOP", pos: [-11.4, 0.01, 156.5], rotation: 0.702256931509007, size: [42, 8] },
  { id: 'library', type: 'custom_library', label: "LIBRARY", pos: [-25, 0, -40], rotation: 0.5235987755982988, size: [21, 21] },
  { id: 'ablock', type: 'custom_ablock', label: "A-BLOCK", pos: [56.9, 0, 5.6], rotation: 3.141592653589793, size: [65, 145] },
  { id: 'hblock', type: 'custom_hblock', label: "H-BLOCK", pos: [55, 0, -72.5], rotation: 0, size: [90, 53] },
  { id: 'nblock', type: 'custom_nblock', label: "N-BLOCK", pos: [-49.1, 0, -189.6], rotation: 1.5707963267948966, size: [49, 189] },
  { id: 'hostel_connector', type: 'hostel_connector', label: "CONNECTOR BRIDGE", pos: [75, 0, -180], rotation: 0 },
  { id: 'canteen', type: 'canteen', label: "CANTEEN & TT", pos: [90.5, 0, -122], size: [19, 22], rotation: 0 },
  { id: 'farm', type: 'farm', label: "FARM ZONE", pos: [-30, 0, -93.5], size: [46, 53], rotation: 0 },
  { id: 'new_outside_zone', type: 'shrine', label: "SHRINE", pos: [-10, 0, 25], rotation: 0 },
  { id: 'ublock', type: 'building', label: "U BLOCK", pos: [-141.5, 0, -198], size: [75, 85], floors: 4, color: "#dad20a", rotation: 0 },
  { id: 'convocationhall', type: 'convocation', label: "CONVOCATION HALL", pos: [-197.5, 0, -197.7], size: [18, 85], floors: 3, color: "#9f96f7", rotation: 0 },
  { id: 'guesthouse', type: 'building', label: "GUEST HOUSE", pos: [-226.5, 0, -171], size: [30, 30], floors: 2, color: "#37794b", rotation: 0 },
  { id: 'textile', type: 'building', label: "TEXTILE TECHNOLOGY", pos: [49, 0, -334.5], size: [15, 70], floors: 3, color: "#927b5d", rotation: 0 },
  { id: 'priyadarshinihostel', type: 'building', label: "PRIYADARSHINI HOSTEL", pos: [-332.5, 0, -399], size: [45, 102], floors: 5, color: "#8add61", rotation: 0 },
  { id: 'z_library', type: 'zone', label: "LIBRARY", size: [21, 21], color: "#8B4513", pos: [-25, 0, -40] },
  { id: 'z_farm', type: 'zone', label: "FARM ZONE", size: [46, 53], color: "#228B22", pos: [-30, 0, -93.5] },
  { id: 'z_smallzone', type: 'zone', label: "SMALL ZONE", size: [15, 64], color: "#FF1493", pos: [92.5, 0, -2] },
  { id: 'z_canteen', type: 'zone', label: "CANTEEN & TT", size: [19, 22], color: "#00FFFF", pos: [90.5, 0, -122] },
  { id: 'z_sportsground', type: 'zone', label: "HOCKEY & FOOTBALL GROUND", size: [70, 94], color: "#3CB371", pos: [135, 0, -93] },
  { id: 'z_ground', type: 'zone', label: "GROUND", size: [60, 25], color: "#FFFF00", pos: [40, 0, -125] },
  { id: 'z_ublock', type: 'zone', label: "U-BLOCK", size: [75, 85], color: "#dad20a", pos: [-141.5, 0, -198] },
  { id: 'z_convocationhall', type: 'zone', label: "CONVOCATION HALL", size: [25, 85], color: "#9f96f7", pos: [-196.5, 0, -197.5] },
  { id: 'z_guesthouse', type: 'zone', label: "GUEST HOUSE", size: [30, 30], color: "#37794b", pos: [-226.5, 0, -171] },
  { id: 'z_textile', type: 'zone', label: "TEXTILE TECHNOLOGY", size: [15, 70], color: "#927b5d", pos: [49, 0, -334.5] },
  { id: 'z_pharmacy_badminton', type: 'zone', label: "PHARMACY BADMINTON COURT", size: [23, 20], color: "#5ae354", pos: [88, 0, -319.5] },
  { id: 'z_pharmacy_volleyball', type: 'zone', label: "PHARMACY VOLLEYBALL COURT", size: [22, 25], color: "#75e391", pos: [88, 0, -353.5] },
  { id: 'z_cricketground', type: 'zone', label: "CRICKET GROUND", size: [235, 85], color: "#223269", pos: [-94.6, 0, -334.5] },
  { id: 'z_vignanpond', type: 'zone', label: "VIGNAN POND", size: [45, 45], color: "#7fb0c9", pos: [-332.5, 0, -321.5] },
  { id: 'z_priyadarshinihostel', type: 'zone', label: "PRIYADARSHINI HOSTEL", size: [45, 60], color: "#8add61", pos: [-322.5, 0, -379] },
  { id: 'road_highway', type: 'road_highway', label: "Diagonal Highway (SH 261)", pos: [-155.3, 0.01, -60], size: [20, 600], rotation: 0.702256931509007 },
  { id: 'road_approach', type: 'road', label: "Approach Road", pos: [-0.4, 0, 54.4], size: [12, 191], rotation: 0, hasTrees: false, hasWalls: false },
  { id: 'road_spine_1', type: 'road', label: "Spine Road Seg 1", pos: [0, 0, -17], size: [12, 34], rotation: 0, hasTreesRight: false },
  { id: 'road_spine_1b', type: 'road', label: "Spine Road Seg 1b", pos: [0, 0, -40], size: [12, 12], rotation: 0, hasTrees: false, hasWalls: false },
  { id: 'road_spine_2', type: 'road', label: "Spine Road Seg 2", pos: [0, 0, -50], size: [12, 8], rotation: 0, hasTreesRight: false },
  { id: 'road_spine_2b', type: 'road', label: "Spine Road Seg 2b", pos: [0, 0, -60], size: [12, 12], rotation: 0, hasTrees: false, hasWalls: false },
  { id: 'road_spine_3', type: 'road', label: "Spine Road Seg 3", pos: [0, 0, -82.5], size: [12, 33], rotation: 0, hasTreesLeft: false },
  { id: 'road_spine_3b', type: 'road', label: "Spine Road Seg 3b", pos: [0, 0, -105], size: [12, 12], rotation: 0, hasTrees: false, hasWalls: false },
  { id: 'road_spine_4', type: 'road', label: "Spine Road Seg 4", pos: [0, 0, -117.5], size: [12, 13], rotation: 0, hasTreesLeft: false },
  { id: 'road_spine_4b', type: 'road', label: "Spine Road Seg 4b", pos: [0, 0, -130], size: [12, 12], rotation: 0, hasTrees: false, hasWalls: false },
  { id: 'road_spine_5', type: 'road', label: "Spine Road Seg 5", pos: [0, 0, -138], size: [12, 4], rotation: 0 },
  { id: 'road_lib_circle', type: 'road_circle', label: "Library Circle", pos: [-25, 0, -40], size: [15, 27], rotation: 0 },
  { id: 'road_lib_gate', type: 'road', label: "Library Gate Road", pos: [-56.7, 0, -61.4], size: [12, 104], rotation: 1.5707963267948966, hasWalls: false, hasTreesRight: false },
  { id: 'road_right_a_h', type: 'road', label: "Right Road (A/H-Block)", pos: [52.7, 0, -38.7], size: [12, 94], rotation: 1.5707963267948966, hasTreesLeft: false },
  { id: 'road_right_h_gr', type: 'road', label: "Right Road (H/Ground)", pos: [53, 0, -105], size: [12, 94], rotation: 1.5707963267948966, hasTreesLeft: false, holesLeft: [{ start: 16, end: 28 }] },
  { id: 'road_spine_deep', type: 'road', label: "Spine Road Deep", pos: [-0.2, 0, -199.2], size: [12, 123], rotation: 0 },
  { id: 'road_hostel_h', type: 'road', label: "Hostel to H-Block Road", pos: [74.8, 0, -124], size: [12, 31], rotation: 0, hasTreesRight: false, holesRight: [{ start: 0.5, end: 7.5 }] },
  { id: 'road_ac_canteen', type: 'road', label: "AC Hostel to Canteen Road", pos: [90.5, 0, -136.5], size: [7, 19], rotation: 1.5707963267948966, hasTreesLeft: false },
  { id: 'item_1784218958565', type: 'building', pos: [66, 0, -196], rotation: 0, label: "Hostel", size: [94, 107], floors: 4, color: "#FF8C00" },
  { id: 'item_1784219400616', type: 'road_highway', pos: [-129.8, 0, -282.5], rotation: 1.5707963267948963, label: "HIGHWAY ROAD", size: [20, 442] },
  { id: 'item_1784220061382', type: 'road_highway', pos: [80, 0, -326], rotation: 0, label: "HIGHWAY ROAD", size: [13, 111] },
  { id: 'item_1784220132123', type: 'road_highway', pos: [-214, 0, -346], rotation: 0, label: "HIGHWAY ROAD", size: [20, 170] },
  { id: 'item_1784220216781', type: 'road_highway', pos: [-279.6, 0, -361.2], rotation: 0, label: "HIGHWAY ROAD", size: [14, 169] },
  { id: 'item_1784220401591', type: 'road_highway', pos: [-124.2, 0, -409.8], rotation: 1.5707963267948966, label: "HIGHWAY ROAD", size: [9, 191] },
  { id: 'item_1784220840575', type: 'ushape', pos: [110, 0, -334], rotation: 4.71238898038469, label: "Pharmacy block", size: [58, 15], floors: 3, color: "#eaeaea" },
  { id: 'item_1784220960590', type: 'road_highway', pos: [88, 0, -350], rotation: 1.5707963267948966, label: "HIGHWAY ROAD", size: [8, 34] },
  { id: 'pharmacy', type: 'building', label: "PHARMACY BLOCK", pos: [122, 0, -333.5], size: [30, 70], floors: 4, color: "#847e42", rotation: 0 },
  { id: 'pharmacy_badminton', type: 'pharmacy_badminton', label: "PHARMACY BADMINTON COURT", pos: [86, 0, -317.5], size: [30, 30], rotation: 0 },
  { id: 'pharmacy_volleyball', type: 'pharmacy_volleyball', label: "PHARMACY VOLLEYBALL COURT", pos: [86, 0, -351.5], size: [30, 25], rotation: 0 },
  { id: 'volleyballcourts', type: 'volleyballcourts', label: "VOLLEY BALL COURTS", pos: [-231.3, 0, -214.9], size: [64, 50], rotation: 1.5707963267948966 },
  { id: 'cricketground', type: 'cricketground', label: "CRICKET GROUND", pos: [-127, 0, -336.5], size: [150, 85], rotation: 0 },
  { id: 'basketballcourts', type: 'basketballcourts', label: "BASKETBALL COURTS", pos: [-255.5, 0, -297.5], size: [30, 29], rotation: 4.71238898038469 },
  { id: 'vignanpond', type: 'vignanpond', label: "VIGNAN POND", pos: [-332.5, 0, -321.5], size: [45, 45], rotation: 0 },
  { id: 'open_gym', type: 'open_gym', label: "OPEN GYM", pos: [-9.5, 0, -306.5], size: [60, 30], rotation: 0 },
  { id: 'kabaddi_courts', type: 'kabaddi_courts', label: "KABADDI COURTS", pos: [-10.5, 0, -334.5], size: [60, 23], rotation: 3.141592653589793 },
  { id: 'khokho_courts', type: 'khokho_courts', label: "KHO-KHO COURTS", pos: [-9.8, 0, -361.9], size: [60, 30], rotation: 0 },
  { id: 'lamp_pole_sports', type: 'lamp_pole_sports', label: "SPORTS FLOODLIGHT", pos: [-11, 0, -322.5], size: [2, 2], rotation: 0 },
  { id: 'item_1784224906629', type: 'road_highway', pos: [-89.7, 0, -74.2], rotation: 0, label: "HIGHWAY ROAD", size: [20, 200] },
  { id: 'item_1784224983665', type: 'road_highway', pos: [-240, 0, -220], rotation: 0, label: "HIGHWAY ROAD", size: [10, 77] },
  { id: 'item_1784225058908', type: 'road_highway', pos: [-235.5, 0, -184.8], rotation: 0, label: "HIGHWAY ROAD", size: [18, 8] },
  { id: 'lara_ground', type: 'lara_ground', label: "LARA GROUND", pos: [-263.5, 0, -378], size: [42, 93], rotation: 0 },
  { id: 'pickleball_zone', type: 'pickleball_zone', label: "PICKLEBALL ZONE", pos: [-277.5, 0, -297], size: [35, 16], rotation: 1.5707963267948966 },
  { id: 'cricket_nets', type: 'cricket_nets', label: "CRICKET NETS", pos: [-275.5, 0, -321], size: [13, 18], rotation: 1.5707963267948966 },
  { id: 'item_1784227348304', type: 'road_highway', pos: [-400, 0, -360], rotation: 0.6283185307179586, label: "HIGHWAY ROAD", size: [20, 200] }
];

const ADD_TEMPLATES = [
  // Modular components
  { type: 'building', label: 'Building Block', icon: '🏢', category: 'building' },
  { type: 'ushape', label: 'U - Shape Block', icon: '🏢', category: 'building' },
  { type: 'oshape', label: 'O - Shape Block', icon: '🏢', category: 'building' },
  { type: 'convocation', label: 'Convocation Hall', icon: '🏛️', category: 'building' },
  { type: 'road', label: 'Road Segment', icon: '🚗', category: 'road' },
  { type: 'road_cross', label: 'Crossroads (+)', icon: '🚗', category: 'road' },
  { type: 'road_corner', label: 'Corner Road (L)', icon: '🚗', category: 'road' },
  { type: 'road_highway', label: 'Highway Road', icon: '🛣️', category: 'road' },
  { type: 'road_circle', label: 'Circle Road', icon: '🔄', category: 'road' },
  { type: 'gate', label: 'Campus Gate', icon: '⛩️', category: 'gate' },
  { type: 'zone', label: 'Ground Zone', icon: '🟩', category: 'zone' },
  { type: 'tree_single', label: 'Single Tree', icon: '🌲', category: 'zone' },
  { type: 'tree_row', label: 'Row of Trees', icon: '🌳', category: 'zone' },
  // Landmarks
  { type: 'custom_library', label: 'NTR Library', icon: '🏛️', category: 'landmark' },
  { type: 'custom_ablock', label: 'A - Block', icon: '🏛️', category: 'landmark' },
  { type: 'custom_hblock', label: 'H - Block', icon: '🏛️', category: 'landmark' },
  { type: 'custom_nblock', label: 'N - Block', icon: '🏛️', category: 'landmark' },
  { type: 'canteen', label: 'Canteen Shed', icon: '🍽️', category: 'landmark' },
  { type: 'sportsground', label: 'Sports Ground', icon: '⚽', category: 'landmark' },
  { type: 'farm', label: 'Farm Zone', icon: '🚜', category: 'landmark' },
  { type: 'shrine', label: 'Ganesha Shrine', icon: '🛕', category: 'landmark' },
  { type: 'smallzone', label: 'Utility Block', icon: '🏬', category: 'landmark' },
  { type: 'hostel_connector', label: 'Walkway Bridge', icon: '🌉', category: 'landmark' },
  { type: 'ground', label: 'Mud Ground', icon: '🟫', category: 'landmark' },
  { type: 'bus_stop', label: 'Bus Stop', icon: '🚌', category: 'landmark' }
];

function DroneCameraController({ active, selectedItemPos }) {
  const { camera } = useThree();
  const controls = useThree((state) => state.controls);

  useEffect(() => {
    if (active && controls) {
      camera.position.set(30, 240, 60);
      controls.target.set(30, 0, -80);
      controls.update();
    }
  }, [active, controls, camera]);

  // Focus and pan to the selected item
  useEffect(() => {
    if (active && selectedItemPos && controls) {
      const targetX = selectedItemPos[0];
      const targetZ = selectedItemPos[2];
      controls.target.set(targetX, 0, targetZ);
      camera.position.set(targetX, 140, targetZ + 40);
      controls.update();
    }
  }, [selectedItemPos, active, controls, camera]);

  return null;
}

export default function App() {
  const joystick = useRef({ x: 0, y: 0 });
  const [isDroneMode, setIsDroneMode] = useState(false);
  const [isLayoutLocked, setIsLayoutLocked] = useState(() => localStorage.getItem('vignan_3d_campus_layout_locked') === 'true');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [editorTab, setEditorTab] = useState('add'); // 'add', 'list', 'edit'
  const [filterCategory, setFilterCategory] = useState('all'); // 'all', 'building', 'road', 'gate', 'zone', 'landmark'

  // Persist lock state
  useEffect(() => {
    localStorage.setItem('vignan_3d_campus_layout_locked', isLayoutLocked.toString());
  }, [isLayoutLocked]);

  // Auto switch tab when selecting/deselecting items
  useEffect(() => {
    if (selectedItemId) {
      setEditorTab('edit');
    }
  }, [selectedItemId]);

  // Load items from localStorage or fallback to defaults.
  // If LAYOUT_VERSION has changed since last save, wipe localStorage and use fresh defaults.
  const [mapItems, setMapItems] = useState(() => {
    const storedVersion = localStorage.getItem('vignan_3d_campus_layout_version');
    
    // Version mismatch → wipe old data and reload with fresh defaults
    if (storedVersion !== LAYOUT_VERSION) {
      localStorage.removeItem('vignan_3d_campus_map_items');
      localStorage.removeItem('vignan_3d_campus_layout_locked');
      localStorage.setItem('vignan_3d_campus_layout_version', LAYOUT_VERSION);
      return DEFAULT_MAP_ITEMS;
    }

    const saved = localStorage.getItem('vignan_3d_campus_map_items');
    const defaultSizes = {
      'gate_main': [18, 5],
      'gate_library': [18, 5],
      'boundary_wall': [25, 4],
      'bus_stop': [42, 8],
      'library': [21, 21],
      'ablock': [75, 64],
      'hblock': [90, 53],
      'nblock': [62, 140],
      'cricketground': [150, 85],
      'open_gym': [30, 30],
      'kabaddi_courts': [30, 30],
      'khokho_courts': [30, 30],
      'lamp_pole_sports': [2, 2],
      'basketballcourts': [35, 25],
      'lara_ground': [45, 50],
      'pickleball_zone': [30, 25],
      'cricket_nets': [55, 18]
    };
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        
        // Fix convocation/landmark types
        parsed = parsed.map(item => {
          if (item.id === 'convocationhall') {
            return { ...item, type: 'convocation', size: item.size || defaultSizes[item.id] };
          }
          if (['volleyballcourts', 'pharmacy_badminton', 'pharmacy_volleyball', 'cricketground', 'cricket_nets', 'basketballcourts', 'vignanpond', 'open_gym', 'kabaddi_courts', 'khokho_courts', 'lamp_pole_sports', 'lara_ground', 'pickleball_zone'].includes(item.id)) {
            return { ...item, type: item.id, size: item.size || defaultSizes[item.id] };
          }
          if (!item.size && defaultSizes[item.id]) {
            return { ...item, size: defaultSizes[item.id] };
          }
          return item;
        });

        // Inject missing essential structures
        const essentialIds = [
          'pharmacy', 'pharmacy_badminton', 'pharmacy_volleyball', 'textile',
          'ublock', 'convocationhall', 'guesthouse', 'volleyballcourts',
          'cricketground', 'basketballcourts', 'vignanpond', 'priyadarshinihostel',
          'open_gym', 'kabaddi_courts', 'khokho_courts', 'lamp_pole_sports',
          'lara_ground', 'pickleball_zone', 'cricket_nets'
        ];
        
        essentialIds.forEach(id => {
          if (!parsed.some(item => item.id === id)) {
            const defaultItem = DEFAULT_MAP_ITEMS.find(item => item.id === id);
            if (defaultItem) parsed.push(defaultItem);
          }
        });

        return parsed;
      } catch (e) {
        console.error("Failed to parse stored map items", e);
      }
    }
    return DEFAULT_MAP_ITEMS;
  });

  // Persist layout items and version when updated
  useEffect(() => {
    localStorage.setItem('vignan_3d_campus_map_items', JSON.stringify(mapItems));
    localStorage.setItem('vignan_3d_campus_layout_version', LAYOUT_VERSION);
  }, [mapItems]);

  const selectedItem = mapItems.find(item => item.id === selectedItemId);

  const updateSelectedItem = (updates) => {
    if (!selectedItemId || isLayoutLocked) return;
    setMapItems(prev => prev.map(item => item.id === selectedItemId ? { ...item, ...updates } : item));
  };

  // Keyboard nudging and shortcuts in Editor Mode
  useEffect(() => {
    if (!isDroneMode || !selectedItem || isLayoutLocked) return;
    
    const handleKeyDown = (e) => {
      // Skip shortcuts if the user is typing in a text field
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') {
        return;
      }

      const nudgeAmt = e.shiftKey ? 10 : 2;
      let moved = false;
      let newPos = [...selectedItem.pos];
      let newRot = selectedItem.rotation || 0;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newPos[0] -= nudgeAmt;
          moved = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newPos[0] += nudgeAmt;
          moved = true;
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          newPos[2] -= nudgeAmt;
          moved = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newPos[2] += nudgeAmt;
          moved = true;
          break;
        case 'q':
        case 'Q':
          newRot -= Math.PI / 12; // Rotate 15 degrees CCW
          updateSelectedItem({ rotation: newRot });
          break;
        case 'e':
        case 'E':
          newRot += Math.PI / 12; // Rotate 15 degrees CW
          updateSelectedItem({ rotation: newRot });
          break;
        case 'r':
        case 'R':
          newRot = (newRot + Math.PI / 2) % (Math.PI * 2); // Rotate 90 degrees
          updateSelectedItem({ rotation: newRot });
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          deleteSelectedItem();
          break;
        default:
          break;
      }

      if (moved) {
        e.preventDefault();
        updateSelectedItem({ pos: [parseFloat(newPos[0].toFixed(1)), newPos[1], parseFloat(newPos[2].toFixed(1))] });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDroneMode, selectedItemId, selectedItem]);

  const addItem = (type, landmarkId = null) => {
    if (isLayoutLocked) return;
    const id = landmarkId || `item_${Date.now()}`;
    let newItem = { id, type, pos: [0, 0, -50], rotation: 0, label: '' };

    if (type === 'building') {
      newItem.label = 'NEW BLOCK';
      newItem.size = [40, 20];
      newItem.floors = 3;
      newItem.color = '#FF8C00';
    } else if (type === 'ushape') {
      newItem.label = 'U-SHAPE BLOCK';
      newItem.size = [30, 15, 20];
      newItem.floors = 3;
      newItem.color = '#eaeaea';
    } else if (type === 'oshape') {
      newItem.label = 'O-SHAPE BLOCK';
      newItem.size = [30, 15, 30];
      newItem.floors = 3;
      newItem.color = '#eaeaea';
    } else if (type === 'convocation') {
      newItem.label = 'CONVOCATION HALL';
      newItem.size = [24, 24];
      newItem.floors = 3;
      newItem.color = '#eaeaea';
    } else if (type === 'road') {
      newItem.label = 'NEW ROAD';
      newItem.size = [12, 50];
    } else if (type === 'road_cross') {
      newItem.label = 'CROSSROAD';
      newItem.size = [12, 12];
    } else if (type === 'road_corner') {
      newItem.label = 'CORNER ROAD';
      newItem.size = [12, 12];
    } else if (type === 'road_highway') {
      newItem.label = 'HIGHWAY ROAD';
      newItem.size = [20, 200];
    } else if (type === 'road_circle') {
      newItem.label = 'CIRCLE ROAD';
      newItem.size = [12, 22];
    } else if (type === 'gate') {
      newItem.label = 'NEW GATE';
    } else if (type === 'zone') {
      newItem.label = 'NEW ZONE';
      newItem.size = [30, 30];
      newItem.color = '#DAA520';
    } else if (type === 'tree_single') {
      newItem.label = 'SINGLE TREE';
    } else if (type === 'tree_row') {
      newItem.label = 'TREE ROW';
      newItem.size = [40, 1];
    } else if (type.startsWith('custom_') || ['canteen', 'sportsground', 'farm', 'shrine', 'smallzone', 'hostel_connector', 'ground', 'bus_stop', 'boundary_wall', 'volleyballcourts', 'pharmacy_badminton', 'pharmacy_volleyball', 'cricketground', 'cricket_nets', 'basketballcourts', 'vignanpond', 'open_gym', 'kabaddi_courts', 'khokho_courts', 'lamp_pole_sports', 'lara_ground', 'pickleball_zone'].includes(type)) {
      const labelMap = {
        'custom_library': 'LIBRARY',
        'custom_ablock': 'A-BLOCK',
        'custom_hblock': 'H-BLOCK',
        'custom_nblock': 'N-BLOCK',
        'canteen': 'CANTEEN & TT',
        'sportsground': 'HOCKEY & FOOTBALL GROUND',
        'farm': 'FARM ZONE',
        'shrine': 'SHRINE',
        'smallzone': 'SMALL ZONE',
        'hostel_connector': 'CONNECTOR BRIDGE',
        'ground': 'GROUND',
        'bus_stop': 'BUS STOP',
        'boundary_wall': 'WALL',
        'volleyballcourts': 'VOLLEY BALL COURTS',
        'pharmacy_badminton': 'PHARMACY BADMINTON COURT',
        'pharmacy_volleyball': 'PHARMACY VOLLEYBALL COURT',
        'cricketground': 'CRICKET GROUND',
        'basketballcourts': 'BASKETBALL COURTS',
        'vignanpond': 'VIGNAN POND',
        'open_gym': 'OPEN GYM',
        'kabaddi_courts': 'KABADDI COURTS',
        'khokho_courts': 'KHO-KHO COURTS',
        'lamp_pole_sports': 'SPORTS FLOODLIGHT',
        'lara_ground': 'LARA GROUND',
        'pickleball_zone': 'PICKLEBALL ZONE',
        'cricket_nets': 'CRICKET NETS'
      };
      const sizeMap = {
        'sportsground': [70, 94],
        'farm': [46, 53],
        'ground': [53, 22],
        'canteen': [19, 22],
        'cricketground': [150, 85],
        'open_gym': [30, 30],
        'kabaddi_courts': [30, 30],
        'khokho_courts': [30, 30],
        'lamp_pole_sports': [2, 2],
        'basketballcourts': [35, 25],
        'lara_ground': [45, 50],
        'pickleball_zone': [30, 25],
        'cricket_nets': [55, 18]
      };
      newItem.type = type;
      newItem.id = type; // Keep predictable ID to bind properly in Buildings.jsx
      newItem.label = labelMap[type] || 'LANDMARK';
      if (sizeMap[type]) newItem.size = sizeMap[type];
    }

    setMapItems(prev => {
      // Prevent duplicate landmark IDs
      const filtered = prev.filter(item => item.id !== newItem.id);
      return [...filtered, newItem];
    });
    setSelectedItemId(newItem.id);
  };

  const deleteSelectedItem = () => {
    if (!selectedItemId || isLayoutLocked) return;
    const name = selectedItem?.label || selectedItemId;
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      setMapItems(prev => prev.filter(item => item.id !== selectedItemId));
      setSelectedItemId(null);
    }
  };

  const clearMap = () => {
    if (isLayoutLocked) return;
    if (window.confirm("Are you sure you want to clear the entire map layout down to dynamic land?")) {
      setMapItems([]);
      setSelectedItemId(null);
    }
  };

  const resetLayout = () => {
    if (isLayoutLocked) return;
    if (window.confirm("Are you sure you want to reset the entire map layout back to default campus coordinates?")) {
      setMapItems(DEFAULT_MAP_ITEMS);
      setSelectedItemId(null);
    }
  };

  const copyLayoutCoordinates = () => {
    const formatted = JSON.stringify(mapItems, null, 2);
    navigator.clipboard.writeText(formatted)
      .then(() => {
        alert("Campus coordinates copied to your clipboard! You can paste them directly into the AI chat.");
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        window.prompt("Failed to copy to clipboard automatically. Please copy the coordinates manually from below:", formatted);
      });
  };

  const rotationDeg = selectedItem ? Math.round(((selectedItem.rotation || 0) * 180) / Math.PI) : 0;

  return (
    <>
      {/* Top bar mode toggle */}
      <div className="mode-toggle-bar">
        <button 
          className={`mode-btn ${!isDroneMode ? 'active' : ''}`}
          onClick={() => {
            setIsDroneMode(false);
            setSelectedItemId(null);
          }}
        >
          🧑 Walk Mode
        </button>
        <button 
          className={`mode-btn ${isDroneMode ? 'active' : ''}`}
          onClick={() => setIsDroneMode(true)}
        >
          🚁 Drone / Editor Mode
        </button>
      </div>

      <Canvas shadows camera={{ fov: 60, near: 0.1, far: 1000, position: [0, 15, 75] }}>
        {/* Sky, lighting and fog */}
        <ambientLight intensity={0.7} />
        <directionalLight 
          position={[120, 150, 100]} 
          intensity={1.8} 
          castShadow 
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048}
        />
        <Sky sunPosition={[120, 150, 100]} />
        <fog attach="fog" args={['#87CEEB', 150, 600]} />

        {/* Custom Third-Person Controller + Orbit Controls */}
        {!isDroneMode && <PlayerController joystick={joystick} />}
        <OrbitControls 
          makeDefault 
          enablePan={isDroneMode}
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera from going under ground
          minDistance={isDroneMode ? 5 : 2}
          maxDistance={isDroneMode ? 600 : 15} // Restrict zoom out to keep third person view tight
        />

        {/* Drone Camera manager */}
        <DroneCameraController active={isDroneMode} selectedItemPos={selectedItem?.pos} />

        {/* Dynamic Map Item Rendering */}
        {/* Renders Custom landmarks dynamically */}
        <Buildings zones={mapItems} />

        {/* Render dynamic modular buildings & custom shapes */}
        {mapItems.filter(item => ['building', 'ushape', 'oshape', 'convocation'].includes(item.type) && !['boyshostel', 'achostel'].includes(item.id)).map(item => (
          <group 
            key={item.id} 
            position={item.pos} 
            rotation={[0, item.rotation || 0, 0]}
            onClick={(e) => {
              if (isDroneMode) {
                e.stopPropagation();
                setSelectedItemId(item.id);
              }
            }}
          >
            {item.type === 'ushape' && (
              <UShapeBlock
                position={[0, 0, 0]}
                size={item.size || [30, 15, 20]}
                floors={item.floors || 3}
                color={item.color || '#eaeaea'}
                label={item.label}
              />
            )}
            {item.type === 'oshape' && (
              <OShapeBlock
                position={[0, 0, 0]}
                size={item.size || [30, 15, 30]}
                floors={item.floors || 3}
                color={item.color || '#eaeaea'}
                label={item.label}
              />
            )}
            {item.type === 'convocation' && (
              <ConvocationHall
                position={[0, 0, 0]}
                size={item.size || [24, 24]}
                floors={item.floors || 3}
                color={item.color || '#eaeaea'}
                label={item.label}
              />
            )}
            {item.type === 'building' && (
              <MultiStoryBuilding
                position={[0, 0, 0]}
                size={item.size || [40, 20]}
                floors={item.floors || 3}
                accentColor={item.color || '#FF8C00'}
                label={item.label}
              />
            )}
            {selectedItemId === item.id && (
              <mesh position={[0, ((item.floors || 3) * 4)/2, 0]}>
                <boxGeometry args={[(item.size ? item.size[0] : 40) + 2, (item.floors || 3) * 4 + 2, (item.size ? item.size[1] : 20) + 2]} />
                <meshBasicMaterial color="#ffffff" wireframe />
              </mesh>
            )}
          </group>
        ))}

        {/* Render selection helpers for custom landmarks in editor mode */}
        {isDroneMode && mapItems.filter(item => 
          item.type.startsWith('custom_') || 
          ['canteen', 'sportsground', 'farm', 'shrine', 'smallzone', 'hostel_connector', 'ground', 'bus_stop', 'boundary_wall', 'volleyballcourts', 'pharmacy_badminton', 'pharmacy_volleyball', 'cricketground', 'cricket_nets', 'basketballcourts', 'vignanpond', 'convocationhall', 'open_gym', 'kabaddi_courts', 'khokho_courts', 'lamp_pole_sports', 'lara_ground', 'pickleball_zone'].includes(item.id) ||
          ['boyshostel', 'achostel', 'priyadarshinihostel'].includes(item.id)
        ).map(item => {
          const w = item.size ? item.size[0] : 20;
          const d = item.size ? item.size[1] : 20;
          const h = item.id === 'cricketground' ? 1 : 
                    item.id === 'boundary_wall' ? 4 : 
                    item.id === 'bus_stop' ? 3 :
                    item.floors ? item.floors * 4 : 12;
          
          return (
            <mesh
              key={`helper-${item.id}`}
              position={[item.pos[0], h / 2, item.pos[2]]}
              rotation={[0, item.rotation || 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItemId(item.id);
              }}
            >
              <boxGeometry args={[w, h, d]} />
              <meshBasicMaterial 
                color="#60a5fa" 
                transparent 
                opacity={selectedItemId === item.id ? 0.15 : 0.0} 
                depthWrite={false}
              />
              {selectedItemId === item.id && (
                <mesh>
                  <boxGeometry args={[w + 0.5, h + 0.5, d + 0.5]} />
                  <meshBasicMaterial color="#ffffff" wireframe />
                </mesh>
              )}
            </mesh>
          );
        })}

        {/* Render dynamic road segments, crossroads and corners */}
        {mapItems.filter(item => ['road', 'road_cross', 'road_corner', 'road_highway', 'road_circle'].includes(item.type)).map(item => {
          if (item.type === 'road') {
            return (
              <group 
                key={item.id} 
                position={item.pos} 
                rotation={[0, item.rotation || 0, 0]}
                onClick={(e) => {
                  if (isDroneMode) {
                    e.stopPropagation();
                    setSelectedItemId(item.id);
                  }
                }}
              >
                <RoadSegment 
                  length={item.size[1]} 
                  width={item.size[0]}
                  position={[0, 0, 0]} 
                  rotation={[0, 0, 0]} 
                  hasTrees={item.hasTrees ?? true} 
                  hasWalls={item.hasWalls ?? true}
                  hasTreesLeft={item.hasTreesLeft ?? true}
                  hasTreesRight={item.hasTreesRight ?? true}
                  holesLeft={item.holesLeft || []}
                  holesRight={item.holesRight || []}
                />
                {selectedItemId === item.id && (
                  <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[item.size[0] + 1, 1, item.size[1] + 1]} />
                    <meshBasicMaterial color="#ffffff" wireframe />
                  </mesh>
                )}
              </group>
            );
          }
          if (item.type === 'road_cross') {
            return (
              <group 
                key={item.id} 
                position={item.pos} 
                rotation={[0, item.rotation || 0, 0]}
                onClick={(e) => {
                  if (isDroneMode) {
                    e.stopPropagation();
                    setSelectedItemId(item.id);
                  }
                }}
              >
                <RoadCross
                  size={item.size || [12, 12]}
                />
                {selectedItemId === item.id && (
                  <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[item.size[0] + 1, 1, item.size[0] + 1]} />
                    <meshBasicMaterial color="#ffffff" wireframe />
                  </mesh>
                )}
              </group>
            );
          }
          if (item.type === 'road_corner') {
            return (
              <group 
                key={item.id} 
                position={item.pos} 
                rotation={[0, item.rotation || 0, 0]}
                onClick={(e) => {
                  if (isDroneMode) {
                    e.stopPropagation();
                    setSelectedItemId(item.id);
                  }
                }}
              >
                <RoadCorner
                  size={item.size || [12, 12]}
                />
                {selectedItemId === item.id && (
                  <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[item.size[0] + 1, 1, item.size[0] + 1]} />
                    <meshBasicMaterial color="#ffffff" wireframe />
                  </mesh>
                )}
              </group>
            );
          }
          if (item.type === 'road_highway') {
            return (
              <group 
                key={item.id} 
                position={item.pos} 
                rotation={[0, item.rotation || 0, 0]}
                onClick={(e) => {
                  if (isDroneMode) {
                    e.stopPropagation();
                    setSelectedItemId(item.id);
                  }
                }}
              >
                <mesh position={[-15, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} name="RoadMesh">
                  <planeGeometry args={item.size} />
                  <meshStandardMaterial color="#222" /> 
                </mesh>
                {selectedItemId === item.id && (
                  <mesh position={[-15, 0.5, 0]}>
                    <boxGeometry args={[item.size[0] + 2, 1, item.size[1] + 2]} />
                    <meshBasicMaterial color="#ffffff" wireframe />
                  </mesh>
                )}
              </group>
            );
          }
          if (item.type === 'road_circle') {
            return (
              <group 
                key={item.id} 
                position={item.pos}
                onClick={(e) => {
                  if (isDroneMode) {
                    e.stopPropagation();
                    setSelectedItemId(item.id);
                  }
                }}
              >
                <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} name="RoadMesh">
                  <ringGeometry args={[item.size[0], item.size[1], 32]} />
                  <meshStandardMaterial color="#333" />
                </mesh>
                {selectedItemId === item.id && (
                  <mesh position={[0, 0.1, 0]}>
                    <cylinderGeometry args={[item.size[1] + 1, item.size[1] + 1, 0.5, 32, 1, true]} />
                    <meshBasicMaterial color="#ffffff" wireframe />
                  </mesh>
                )}
              </group>
            );
          }
          return null;
        })}

        {/* Render dynamic tree assets */}
        {mapItems.filter(item => ['tree_single', 'tree_row'].includes(item.type)).map(item => (
          <group 
            key={item.id} 
            position={item.pos}
            rotation={[0, item.rotation || 0, 0]}
            onClick={(e) => {
              if (isDroneMode) {
                e.stopPropagation();
                setSelectedItemId(item.id);
              }
            }}
          >
            {item.type === 'tree_single' && <SingleTree position={[0, 0, 0]} />}
            {item.type === 'tree_row' && (
              <TreeRow 
                position={[0, 0, 0]} 
                size={item.size || [40, 1]} 
                rotation={0} 
              />
            )}
            {selectedItemId === item.id && (
              <mesh position={[0, 2.5, 0]}>
                <boxGeometry args={[4, 6, 4]} />
                <meshBasicMaterial color="#ffffff" wireframe />
              </mesh>
            )}
          </group>
        ))}

        {/* Render dynamic custom gates */}
        {mapItems.filter(item => item.type === 'gate' && !['gate_main', 'gate_library'].includes(item.id)).map(item => (
          <group 
            key={item.id} 
            position={item.pos} 
            rotation={[0, item.rotation || 0, 0]}
            onClick={(e) => {
              if (isDroneMode) {
                e.stopPropagation();
                setSelectedItemId(item.id);
              }
            }}
          >
            <CampusGate position={[0, 0, 0]} rotation={[0, 0, 0]} label={item.label} />
            {selectedItemId === item.id && (
              <mesh position={[0, 8, 0]}>
                <boxGeometry args={[30, 18, 10]} />
                <meshBasicMaterial color="#ffffff" wireframe />
              </mesh>
            )}
          </group>
        ))}

        {/* Render dynamic zones (blueprint grounds) */}
        {mapItems.filter(item => item.type === 'zone').map(item => (
          <group 
            key={item.id} 
            position={item.pos}
            onClick={(e) => {
              if (isDroneMode) {
                e.stopPropagation();
                setSelectedItemId(item.id);
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
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <planeGeometry args={item.size} />
              <meshStandardMaterial color={item.color} opacity={selectedItemId === item.id ? 0.6 : 0.25} transparent />
            </mesh>
            {selectedItemId === item.id && (
              <mesh position={[0, 0.1, 0]}>
                <boxGeometry args={[item.size[0], 0.25, item.size[1]]} />
                <meshBasicMaterial color="#ffffff" wireframe />
              </mesh>
            )}
            {isDroneMode && item.label && (
              <Text
                position={[0, 0.15, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={Math.min(item.size[0], item.size[1]) * 0.12 + 1.2}
                color={selectedItemId === item.id ? "#ffffff" : "#cccccc"}
                fontWeight="bold"
                outlineWidth={0.1}
                outlineColor="#000000"
              >
                {item.label}
              </Text>
            )}
          </group>
        ))}
        
        {/* Grid Helper to help align items in editor mode */}
        {isDroneMode && (
          <gridHelper args={[1000, 100, '#60a5fa', '#3b82f6']} position={[0, 0.05, 0]} />
        )}

        {/* Ground with Click-to-Position behavior */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -0.1, 0]} 
          receiveShadow
          onClick={(e) => {
            if (isDroneMode && selectedItem && !isLayoutLocked) {
              e.stopPropagation();
              // Snap selected item to the clicked point on the ground
              updateSelectedItem({ pos: [parseFloat(e.point.x.toFixed(1)), selectedItem.pos[1], parseFloat(e.point.z.toFixed(1))] });
            }
          }}
        >
          <planeGeometry args={[2000, 2000]} />
          <meshStandardMaterial color="#2E8B57" roughness={0.9} /> {/* Grass */}
        </mesh>
      </Canvas>

      <div className="ui-container">
        {!isDroneMode && (
          <div className="instructions">
            <h3>Vignan University - 3D Walkthrough Tour</h3>
            <p>⌨️ **WASD / Arrow Keys** to move / walk around</p>
            <p>鼠标 **Left Click & Drag** to look around | **Right Click & Drag** to pan camera</p>
            <p>🔍 **Scroll Mouse** to zoom in/out</p>
          </div>
        )}
      </div>

      {/* Sandbox Editor Sidebar */}
      {isDroneMode && (
        <div className="editor-sidebar">
          <div className="editor-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>🗺️ Sandbox Builder</h2>
            <button 
              onClick={() => setIsLayoutLocked(!isLayoutLocked)}
              style={{
                background: isLayoutLocked ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s',
                pointerEvents: 'auto'
              }}
            >
              {isLayoutLocked ? '🔒 Locked' : '🔓 Unlock'}
            </button>
          </div>
          
          {/* Tabs header */}
          <div className="editor-tabs">
            <button 
              className={`tab-btn ${editorTab === 'add' ? 'active' : ''}`}
              onClick={() => setEditorTab('add')}
            >
              ➕ Add
            </button>
            <button 
              className={`tab-btn ${editorTab === 'list' ? 'active' : ''}`}
              onClick={() => setEditorTab('list')}
            >
              📋 Items ({mapItems.length})
            </button>
            <button 
              className={`tab-btn ${editorTab === 'edit' ? 'active' : ''}`}
              onClick={() => setEditorTab('edit')}
              disabled={!selectedItem}
            >
              ✏️ Edit
            </button>
          </div>

          <div className="editor-body" style={{ paddingTop: '0px' }}>
            
            {/* Quick Actions (Keep reset/clear maps globally accessible at top of body) */}
            {editorTab !== 'edit' && (
              <div className="editor-actions" style={{ marginBottom: '12px', gap: '8px', display: 'flex' }}>
                <button className="btn-secondary" style={{ flexGrow: 1, padding: '6px 10px', fontSize: '0.75rem' }} onClick={resetLayout}>Reset All</button>
                <button className="btn-secondary" style={{ flexGrow: 1, padding: '6px 10px', fontSize: '0.75rem', background: '#3b82f6', color: 'white', borderColor: '#2563eb' }} onClick={copyLayoutCoordinates}>Copy Layout</button>
                <button className="btn-danger" style={{ flexGrow: 1, padding: '6px 10px', fontSize: '0.75rem' }} onClick={clearMap}>Clear Map</button>
              </div>
            )}

            {/* TAB 1: ADD ENTITIES */}
            {editorTab === 'add' && (
              <div>
                <div style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '8px 10px', borderRadius: '6px', marginBottom: '12px', color: '#93c5fd', lineHeight: '1.4' }}>
                  💡 Click any block card below to add it directly to the 3D map workspace!
                </div>
                <div className="add-grid">
                  {ADD_TEMPLATES.map(item => (
                    <div 
                      key={item.type} 
                      className="add-card"
                      onClick={() => addItem(item.type)}
                    >
                      <span className="icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: ACTIVE ITEMS LIST */}
            {editorTab === 'list' && (
              <div>
                <div className="filter-pills">
                  {['all', 'building', 'road', 'gate', 'zone', 'landmark'].map(cat => (
                    <button 
                      key={cat} 
                      className={`filter-pill ${filterCategory === cat ? 'active' : ''}`}
                      onClick={() => setFilterCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="zone-list" style={{ maxHeight: '400px' }}>
                  {mapItems.filter(item => {
                    if (filterCategory === 'all') return true;
                    if (filterCategory === 'building') return ['building', 'ushape', 'oshape', 'convocation'].includes(item.type);
                    if (filterCategory === 'road') return ['road', 'road_cross', 'road_corner', 'road_highway', 'road_circle'].includes(item.type);
                    if (filterCategory === 'zone') return ['zone', 'tree_single', 'tree_row'].includes(item.type);
                    if (filterCategory === 'landmark') return item.type.startsWith('custom_') || ['canteen', 'sportsground', 'farm', 'shrine', 'smallzone', 'hostel_connector', 'ground', 'bus_stop', 'boundary_wall'].includes(item.type);
                    return item.type === filterCategory;
                  }).map(item => (
                    <div 
                      key={item.id} 
                      className={`zone-list-item ${selectedItemId === item.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setEditorTab('edit');
                      }}
                    >
                      <span>
                        <span 
                          className="zone-color-indicator" 
                          style={{ backgroundColor: item.color || (item.type.startsWith('road') ? '#444' : '#6b7280') }}
                        />
                        {item.label || item.type.toUpperCase()}
                      </span>
                      <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>
                        [{Math.round(item.pos[0])}, {Math.round(item.pos[2])}]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PROPERTIES & POSITION EDITING */}
            {editorTab === 'edit' && selectedItem && (
              <div className="editor-details-section" style={{ borderTop: 'none', paddingTop: '0px' }}>
                {isLayoutLocked ? (
                  <div style={{ fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 10px', borderRadius: '6px', marginBottom: '10px', color: '#fca5a5', fontWeight: 'bold', textAlign: 'center' }}>
                    🔒 Layout is locked! Unlock from top to edit.
                  </div>
                ) : (
                  /* Advanced Shortcut helper */
                  <div style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '8px 10px', borderRadius: '6px', marginBottom: '10px', color: '#93c5fd', lineHeight: '1.4' }}>
                    💡 <b>Advanced controls:</b> Click grass to teleport block. Move with <b>WASD/Arrows</b>, rotate with <b>Q/E/R</b>, delete with <b>Delete/Backspace</b>.
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label">Entity Label/Name</label>
                  <input 
                    type="text" 
                    className="editor-input" 
                    value={selectedItem.label} 
                    onChange={(e) => updateSelectedItem({ label: e.target.value })} 
                    disabled={isLayoutLocked}
                    style={{ opacity: isLayoutLocked ? 0.5 : 1 }}
                  />
                </div>

                {/* 🎯 Nudge Positioning Grid */}
                <div style={{ marginTop: '4px', textAlign: 'center' }}>
                  <span className="input-label" style={{ display: 'block', marginBottom: '6px', textAlign: 'left' }}>🎯 Nudge Position</span>
                  <div className="nudge-grid" style={{ opacity: isLayoutLocked ? 0.4 : 1, pointerEvents: isLayoutLocked ? 'none' : 'auto' }}>
                    <button className="nudge-btn" disabled={isLayoutLocked} onClick={() => updateSelectedItem({ pos: [selectedItem.pos[0] - 2, selectedItem.pos[1], selectedItem.pos[2] - 2] })}>↖️</button>
                    <button className="nudge-btn" disabled={isLayoutLocked} onClick={() => updateSelectedItem({ pos: [selectedItem.pos[0], selectedItem.pos[1], selectedItem.pos[2] - 2] })}>▲</button>
                    <button className="nudge-btn" disabled={isLayoutLocked} onClick={() => updateSelectedItem({ pos: [selectedItem.pos[0] + 2, selectedItem.pos[1], selectedItem.pos[2] - 2] })}>↗️</button>
                    <button className="nudge-btn" disabled={isLayoutLocked} onClick={() => updateSelectedItem({ pos: [selectedItem.pos[0] - 2, selectedItem.pos[1], selectedItem.pos[2] ] })}>◀</button>
                    <button className="nudge-btn" style={{ background: '#3b82f6', borderColor: '#3b82f6' }} disabled={isLayoutLocked} onClick={() => updateSelectedItem({ pos: [0, selectedItem.pos[1], -50] })}>⌖</button>
                    <button className="nudge-btn" disabled={isLayoutLocked} onClick={() => updateSelectedItem({ pos: [selectedItem.pos[0] + 2, selectedItem.pos[1], selectedItem.pos[2]] })}>▶</button>
                    <button className="nudge-btn" disabled={isLayoutLocked} onClick={() => updateSelectedItem({ pos: [selectedItem.pos[0] - 2, selectedItem.pos[1], selectedItem.pos[2] + 2] })}>↙️</button>
                    <button className="nudge-btn" disabled={isLayoutLocked} onClick={() => updateSelectedItem({ pos: [selectedItem.pos[0], selectedItem.pos[1], selectedItem.pos[2] + 2] })}>▼</button>
                    <button className="nudge-btn" disabled={isLayoutLocked} onClick={() => updateSelectedItem({ pos: [selectedItem.pos[0] + 2, selectedItem.pos[1], selectedItem.pos[2] + 2] })}>↘️</button>
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-label">
                    <span>Position X (Left-Right)</span>
                    <span className="slider-val">{Math.round(selectedItem.pos[0])}</span>
                  </div>
                  <div className="slider-container">
                    <input 
                      type="range" 
                      className="editor-slider" 
                      min="-200" 
                      max="200" 
                      value={selectedItem.pos[0]} 
                      disabled={isLayoutLocked}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        updateSelectedItem({ pos: [val, selectedItem.pos[1], selectedItem.pos[2]] });
                      }} 
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-label">
                    <span>Position Z (Forward-Back)</span>
                    <span className="slider-val">{Math.round(selectedItem.pos[2])}</span>
                  </div>
                  <div className="slider-container">
                    <input 
                      type="range" 
                      className="editor-slider" 
                      min="-250" 
                      max="50" 
                      value={selectedItem.pos[2]} 
                      disabled={isLayoutLocked}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        updateSelectedItem({ pos: [selectedItem.pos[0], selectedItem.pos[1], val] });
                      }} 
                    />
                  </div>
                </div>

                {/* ↺ Quick Rotation Controls */}
                <div className="input-group">
                  <span className="input-label">Rotate Block</span>
                  <div style={{ display: 'flex', gap: '8px', opacity: isLayoutLocked ? 0.4 : 1, pointerEvents: isLayoutLocked ? 'none' : 'auto' }}>
                    <button className="btn-secondary" style={{ flexGrow: 1, padding: '6px' }} disabled={isLayoutLocked} onClick={() => updateSelectedItem({ rotation: (selectedItem.rotation || 0) - Math.PI / 12 })}>↺ 15°</button>
                    <button className="btn-secondary" style={{ flexGrow: 1, padding: '6px' }} disabled={isLayoutLocked} onClick={() => updateSelectedItem({ rotation: (selectedItem.rotation || 0) + Math.PI / 12 })}>↻ 15°</button>
                    <button className="btn-secondary" style={{ flexGrow: 1, padding: '6px' }} disabled={isLayoutLocked} onClick={() => updateSelectedItem({ rotation: ((selectedItem.rotation || 0) + Math.PI / 2) % (Math.PI * 2) })}>↻ 90°</button>
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-label">
                    <span>Rotation Angle</span>
                    <span className="slider-val">{rotationDeg}°</span>
                  </div>
                  <div className="slider-container">
                    <input 
                      type="range" 
                      className="editor-slider" 
                      min="0" 
                      max="360" 
                      value={rotationDeg} 
                      disabled={isLayoutLocked}
                      onChange={(e) => {
                        const rad = (parseFloat(e.target.value) * Math.PI) / 180;
                        updateSelectedItem({ rotation: rad });
                      }} 
                    />
                  </div>
                </div>

                {selectedItem.size && (
                  <>
                    <div className="input-group">
                      <div className="input-label">
                        <span>Width Size (X)</span>
                        <span className="slider-val">{Math.round(selectedItem.size[0])}</span>
                      </div>
                      <div className="slider-container">
                        <input 
                          type="range" 
                          className="editor-slider" 
                          min="5" 
                          max="150" 
                          value={selectedItem.size[0]} 
                          disabled={isLayoutLocked}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            updateSelectedItem({ size: [val, selectedItem.size[1]] });
                          }} 
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <div className="input-label">
                        <span>Depth / Length Size (Z)</span>
                        <span className="slider-val">{Math.round(selectedItem.size[1])}</span>
                      </div>
                      <div className="slider-container">
                        <input 
                          type="range" 
                          className="editor-slider" 
                          min="5" 
                          max="600" 
                          value={selectedItem.size[1]} 
                          disabled={isLayoutLocked}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            updateSelectedItem({ size: [selectedItem.size[0], val] });
                          }} 
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedItem.type === 'building' && (
                  <div className="input-group">
                    <div className="input-label">
                      <span>Floors (Height)</span>
                      <span className="slider-val">{selectedItem.floors || 3}</span>
                    </div>
                    <div className="slider-container">
                      <input 
                        type="range" 
                        className="editor-slider" 
                        min="1" 
                        max="10" 
                        value={selectedItem.floors || 3} 
                        disabled={isLayoutLocked}
                        onChange={(e) => {
                          updateSelectedItem({ floors: parseInt(e.target.value) });
                        }} 
                      />
                    </div>
                  </div>
                )}

                {(selectedItem.type === 'building' || selectedItem.type === 'zone') && (
                  <div className="input-group">
                    <label className="input-label">Theme Color</label>
                    <div className="color-palette" style={{ opacity: isLayoutLocked ? 0.4 : 1, pointerEvents: isLayoutLocked ? 'none' : 'auto' }}>
                      {['#8B4513', '#228B22', '#0000FF', '#FF1493', '#DAA520', '#4B0082', '#00FFFF', '#3CB371', '#DC143C', '#800000', '#FF8C00', '#FFFF00', '#A9A9A9', '#4682B4'].map(c => (
                        <div 
                          key={c} 
                          className={`color-choice ${selectedItem.color === c ? 'selected' : ''}`}
                          style={{ backgroundColor: c, cursor: isLayoutLocked ? 'not-allowed' : 'pointer' }}
                          onClick={() => !isLayoutLocked && updateSelectedItem({ color: c })}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="editor-actions" style={{ gap: '8px', display: 'flex', marginTop: '10px', opacity: isLayoutLocked ? 0.4 : 1, pointerEvents: isLayoutLocked ? 'none' : 'auto' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ flexGrow: 1 }} 
                    disabled={isLayoutLocked}
                    onClick={() => {
                      if (!selectedItem || isLayoutLocked) return;
                      const id = `item_${Date.now()}`;
                      const newItem = {
                        ...selectedItem,
                        id,
                        label: `${selectedItem.label} (Copy)`,
                        pos: [selectedItem.pos[0] + 15, selectedItem.pos[1], selectedItem.pos[2] + 15]
                      };
                      setMapItems(prev => [...prev, newItem]);
                      setSelectedItemId(id);
                    }}
                  >
                    👯 Clone Block
                  </button>
                  <button className="btn-danger" style={{ flexGrow: 1 }} disabled={isLayoutLocked} onClick={deleteSelectedItem}>🗑️ Delete</button>
                </div>
              </div>
            )}
            
            {editorTab === 'edit' && !selectedItem && (
              <div style={{ textAlign: 'center', color: '#888', marginTop: '40px', fontSize: '0.85rem' }}>
                🫵 Click on any block in the 3D map view or select from the "Items" tab to start editing its properties.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
