import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Sky, OrbitControls, Text } from '@react-three/drei';
import { Buildings } from './components/Buildings';
import { Roads } from './components/Roads';
import { Zones } from './components/Zones';
import { Joystick } from './components/Joystick';
import * as THREE from 'three';

// Player Avatar controller with Road Constraints
function PlayerController({ joystick }) {
  const { camera, scene } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const playerRef = useRef();
  const speed = 25; // Movement speed
  const shieldTexture = useLoader(THREE.TextureLoader, '/shield.jpg');

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

export default function App() {
  const joystick = useRef({ x: 0, y: 0 });
  
  // Set this to true to view the campus from top-down for layout planning
  const isLayoutMode = true;

  // Interactive Layout Editor State
  const [draftZones, setDraftZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  const addDraftZone = () => {
    const newId = `draft_${Date.now()}`;
    const newZone = {
      id: newId,
      label: `NEW ZONE ${draftZones.length + 1}`,
      size: [30, 30],
      pos: [0, 0, 0],
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    };
    setDraftZones([...draftZones, newZone]);
    setSelectedZoneId(newId);
  };

  const updateSelectedZone = (fields) => {
    setDraftZones(prev => prev.map(z => z.id === selectedZoneId ? { ...z, ...fields } : z));
  };

  const selectedZone = draftZones.find(z => z.id === selectedZoneId);

  return (
    <>
      <Canvas 
        shadows 
        camera={{ 
          fov: 60, 
          near: 0.1, 
          far: 1000, 
          position: isLayoutMode ? [0, 400, 0] : [0, 15, 75] 
        }}
      >
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
        {!isLayoutMode && <PlayerController joystick={joystick} />}
        
        {isLayoutMode ? (
          <OrbitControls 
            makeDefault 
            enablePan={true}
            maxDistance={500}
            target={[0, 0, 0]}
          />
        ) : (
          <OrbitControls 
            makeDefault 
            enablePan={false}
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera from going under ground
            minDistance={2}
            maxDistance={15} // Restrict zoom out to keep third person view tight
          />
        )}

        {/* Scene Objects (Physics removed to avoid WASM/Rapier load failure crashes) */}
        <Buildings />
        <Roads />
        <Zones />
        
        {/* Ground */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -0.1, 0]} 
          receiveShadow
          onPointerDown={(e) => {
            if (isLayoutMode && selectedZoneId) {
              e.stopPropagation();
              const x = Math.round(e.point.x * 2) / 2;
              const z = Math.round(e.point.z * 2) / 2;
              updateSelectedZone({ pos: [x, 0, z] });
            }
          }}
        >
          <planeGeometry args={[2000, 2000]} />
          <meshStandardMaterial color="#2E8B57" roughness={0.9} /> {/* Grass */}
        </mesh>

        {/* Draft Zones rendering for layout editor */}
        {isLayoutMode && draftZones.map((z) => (
          <group key={z.id} position={z.pos}>
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[z.size[0], 1, z.size[1]]} />
              <meshStandardMaterial 
                color={z.color} 
                transparent 
                opacity={selectedZoneId === z.id ? 0.7 : 0.4} 
                wireframe={selectedZoneId === z.id}
              />
            </mesh>
            {/* Outline box for selected zone */}
            {selectedZoneId === z.id && (
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[z.size[0] + 0.5, 1.1, z.size[1] + 0.5]} />
                <meshBasicMaterial color="#ffffff" wireframe />
              </mesh>
            )}
            <Text
              position={[0, 8, 0]}
              fontSize={4}
              color="white"
              outlineWidth={0.2}
              outlineColor="black"
            >
              {z.label}
            </Text>
          </group>
        ))}
      </Canvas>

      <Joystick joystickRef={joystick} />

      <div className="ui-container">
        {/* Floating Layout Editor Panel (HTML Overlay) */}
        {isLayoutMode && (
          <div className="layout-editor-panel">
            <h3>📐 Campus Layout Editor</h3>
            <p className="help-text">Click on the ground to move the selected zone</p>
            
            <button className="add-btn" onClick={addDraftZone}>+ Add Draft Zone</button>
            
            {selectedZone && (
              <div className="zone-details">
                <h4>Editing: <span style={{color: selectedZone.color}}>{selectedZone.label}</span></h4>
                <div className="input-row">
                  <label>Label:</label>
                  <input 
                    type="text" 
                    value={selectedZone.label} 
                    onChange={(e) => updateSelectedZone({ label: e.target.value.toUpperCase() })} 
                  />
                </div>
                <div className="slider-group">
                  <div className="control-row">
                    <label>Width: {selectedZone.size[0]}m</label>
                    <input 
                      type="range" min="5" max="300" step="5"
                      value={selectedZone.size[0]} 
                      onChange={(e) => updateSelectedZone({ size: [parseInt(e.target.value), selectedZone.size[1]] })} 
                    />
                  </div>
                  <div className="control-row">
                    <label>Depth: {selectedZone.size[1]}m</label>
                    <input 
                      type="range" min="5" max="300" step="5"
                      value={selectedZone.size[1]} 
                      onChange={(e) => updateSelectedZone({ size: [selectedZone.size[0], parseInt(e.target.value)] })} 
                    />
                  </div>
                  <div className="control-row">
                    <label>Position X: {selectedZone.pos[0]}</label>
                    <input 
                      type="number" step="1"
                      value={selectedZone.pos[0]} 
                      onChange={(e) => updateSelectedZone({ pos: [parseFloat(e.target.value) || 0, 0, selectedZone.pos[2]] })} 
                    />
                  </div>
                  <div className="control-row">
                    <label>Position Z: {selectedZone.pos[2]}</label>
                    <input 
                      type="number" step="1"
                      value={selectedZone.pos[2]} 
                      onChange={(e) => updateSelectedZone({ pos: [selectedZone.pos[0], 0, parseFloat(e.target.value) || 0] })} 
                    />
                  </div>
                </div>
                <button className="delete-btn" onClick={() => {
                  setDraftZones(prev => prev.filter(z => z.id !== selectedZoneId));
                  setSelectedZoneId(null);
                }}>Delete Zone</button>
              </div>
            )}

            <div className="zones-list">
              <h4>Drafts List:</h4>
              {draftZones.length === 0 ? (
                <p className="empty-text">No draft zones added yet.</p>
              ) : (
                <ul>
                  {draftZones.map(z => (
                    <li 
                      key={z.id} 
                      className={selectedZoneId === z.id ? 'active' : ''}
                      onClick={() => setSelectedZoneId(z.id)}
                    >
                      <span className="color-dot" style={{backgroundColor: z.color}}></span>
                      <span className="zone-label-text">{z.label}</span>
                      <span className="zone-coords">[{z.pos[0]}, {z.pos[2]}]</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {draftZones.length > 0 && (
              <div className="output-box">
                <h4>Copy Configuration:</h4>
                <textarea 
                  readOnly 
                  onClick={(e) => e.target.select()}
                  value={draftZones.map(z => `{ id: '${z.id}', label: '${z.label}', size: [${z.size[0]}, ${z.size[1]}], color: '${z.color}', pos: [${z.pos[0]}, 0, ${z.pos[2]}] }`).join(',\n')}
                />
                <span className="copy-tip">Click to select all, then Ctrl+C</span>
              </div>
            )}
          </div>
        )}

        <div className="instructions">
          <h3>Vignan University - 3D Walkthrough Tour</h3>
          <p>⌨️ **WASD / Arrow Keys** to move / walk around</p>
          <p>鼠标 **Left Click & Drag** to look around | **Right Click & Drag** to pan camera</p>
          <p>🔍 **Scroll Mouse** to zoom in/out</p>
        </div>
      </div>
    </>
  );
}
