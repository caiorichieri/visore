import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// A small red-and-white striped ball with simple manual physics.
// Held: follows the camera at a fixed offset (like carrying it).
// Free: gravity + bounce with damping.
// Exposes an imperative `throw(dir, force)` for the parent to call.
const Ball = forwardRef(function Ball(
  { held = false, onSelect, initialPosition = [1, 0.35, 2] },
  ref
) {
  const groupRef = useRef();
  const meshRef = useRef();
  const pos = useRef(new THREE.Vector3(...initialPosition));
  const vel = useRef(new THREE.Vector3());
  const spin = useRef(new THREE.Vector3());
  const heldRef = useRef(false);

  useEffect(() => {
    heldRef.current = held;
  }, [held]);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.userData.onSelect = () => {
      if (!heldRef.current) onSelect?.();
    };
    groupRef.current.userData.interactType = "ball";
  }, [onSelect]);

  useImperativeHandle(
    ref,
    () => ({
      throwBall: (dir, force = 9) => {
        vel.current.copy(dir).multiplyScalar(force);
        vel.current.y += 2.4;
        spin.current.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 8
        );
      },
      getPosition: () => pos.current.clone(),
      dropBall: () => {
        vel.current.set(0, 0, 0);
      },
    }),
    []
  );

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    if (heldRef.current) {
      // Follow camera at a low, forward offset — like cradling it.
      const cam = state.camera;
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
      const targetOffset = new THREE.Vector3(0, -0.32, 0);
      const target = cam.position.clone().add(forward.multiplyScalar(0.55)).add(targetOffset);
      pos.current.lerp(target, 0.28);
      spin.current.multiplyScalar(0.9);
    } else {
      vel.current.y -= 12 * d;
      pos.current.addScaledVector(vel.current, d);
      // Ground bounce
      if (pos.current.y < 0.22) {
        pos.current.y = 0.22;
        if (Math.abs(vel.current.y) > 0.3) {
          vel.current.y = -vel.current.y * 0.5;
          vel.current.x *= 0.8;
          vel.current.z *= 0.8;
          spin.current.multiplyScalar(0.65);
        } else {
          vel.current.set(0, 0, 0);
          spin.current.multiplyScalar(0.85);
        }
      }
      // Soft world bounds
      const r = Math.sqrt(pos.current.x ** 2 + pos.current.z ** 2);
      if (r > 40) {
        pos.current.x = (pos.current.x / r) * 40;
        pos.current.z = (pos.current.z / r) * 40;
        vel.current.x *= -0.4;
        vel.current.z *= -0.4;
      }
    }

    if (groupRef.current) {
      groupRef.current.position.copy(pos.current);
    }
    if (meshRef.current) {
      meshRef.current.rotation.x += spin.current.x * d;
      meshRef.current.rotation.y += spin.current.y * d;
      meshRef.current.rotation.z += spin.current.z * d;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[0.22, 32, 24]} />
        <meshStandardMaterial color="#e64a3a" roughness={0.35} metalness={0.05} />
      </mesh>
      {/* White stripe belt */}
      <mesh castShadow>
        <torusGeometry args={[0.221, 0.032, 12, 40]} />
        <meshStandardMaterial color="#f5efe4" roughness={0.3} />
      </mesh>
    </group>
  );
});

export default Ball;
