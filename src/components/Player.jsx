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
    
    // update camera
    state.camera.position.copy(ref.current.translation());
    state.camera.position.y += 1.6; // camera height (eye level)

    // movement
    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(SPEED).applyEuler(state.camera.rotation);

    ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true);
  });

  return (
    <RigidBody ref={ref} colliders={false} mass={1} type="dynamic" position={[0, 10, 40]} enabledRotations={[false, false, false]}>
      <CapsuleCollider args={[0.75, 0.5]} />
    </RigidBody>
  );
}
