import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';

const SPEED = 12;

const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();

export function Player() {
  const ref = useRef();
  const [, get] = useKeyboardControls();

  useFrame((state) => {
    if (!ref.current) return;

    const { forward, backward, left, right } = get();
    const velocity = ref.current.linvel();

    // Get player position
    const playerPosition = ref.current.translation();

    // Update camera
    state.camera.position.set(
      playerPosition.x,
      playerPosition.y + 1.6,
      playerPosition.z
    );

    // Movement input
    frontVector.set(
      0,
      0,
      Number(backward) - Number(forward)
    );

    sideVector.set(
      Number(left) - Number(right),
      0,
      0
    );

    // Calculate movement direction
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED);

    // Apply camera rotation
    direction.applyEuler(state.camera.rotation);

    // Prevent vertical camera angle from affecting movement
    direction.y = 0;

    // Apply movement
    ref.current.setLinvel(
      {
        x: direction.x,
        y: velocity.y,
        z: direction.z,
      },
      true
    );
  });

  return (
    <RigidBody
      ref={ref}
      colliders={false}
      mass={1}
      type="dynamic"
      position={[0, 10, 40]}
      enabledRotations={[false, false, false]}
    >
      {/* Player Physics Collider */}
      <CapsuleCollider args={[0.75, 0.5]} />

      {/* ============================= */}
      {/* PLAYER NAVIGATION ARROW */}
      {/* ============================= */}

      <group position={[0, 0.5, 0]}>

        {/* Arrow Head */}
        <mesh
          position={[0, 0, -0.65]}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
        >
          <coneGeometry args={[0.65, 1.5, 3]} />

          <meshStandardMaterial
            color="#2196f3"
            emissive="#1565c0"
            emissiveIntensity={0.6}
            metalness={0.3}
            roughness={0.25}
          />
        </mesh>

        {/* Arrow Tail */}
        <mesh
          position={[0, 0, 0.4]}
          castShadow
        >
          <boxGeometry args={[0.45, 0.15, 1.2]} />

          <meshStandardMaterial
            color="#2196f3"
            emissive="#1565c0"
            emissiveIntensity={0.6}
            metalness={0.3}
            roughness={0.25}
          />
        </mesh>

        {/* Soft Glow */}
        <pointLight
          position={[0, 0.5, 0]}
          intensity={1.5}
          distance={3}
        />

      </group>

    </RigidBody>
  );
}