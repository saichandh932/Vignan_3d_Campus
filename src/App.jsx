import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { Sky, OrbitControls } from '@react-three/drei';
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

  return (
    <>
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
        <PlayerController joystick={joystick} />
        <OrbitControls 
          makeDefault 
          enablePan={false}
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera from going under ground
          minDistance={2}
          maxDistance={15} // Restrict zoom out to keep third person view tight
        />

        {/* Scene Objects (Physics removed to avoid WASM/Rapier load failure crashes) */}
        <Buildings />
        <Roads />
        <Zones />
        
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[2000, 2000]} />
          <meshStandardMaterial color="#2E8B57" roughness={0.9} /> {/* Grass */}
        </mesh>
      </Canvas>

      <Joystick joystickRef={joystick} />

      <div className="ui-container">
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
