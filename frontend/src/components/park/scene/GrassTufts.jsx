import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

// Scattered instanced grass tufts and colorful little flowers to give the
// meadow more life.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default function GrassTufts() {
  const tuftRef = useRef();
  const flowerYellowRef = useRef();
  const flowerWhiteRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const { tufts, flowersY, flowersW } = useMemo(() => {
    const rng = seeded(13);
    const inCircle = (r) => {
      const angle = rng() * Math.PI * 2;
      const radius = 3 + rng() * (r - 3);
      return [Math.cos(angle) * radius, Math.sin(angle) * radius];
    };
    const tufts = [];
    const flowersY = [];
    const flowersW = [];
    for (let i = 0; i < 240; i++) {
      const [x, z] = inCircle(45);
      if (Math.abs(x) < 2 && z < 3 && z > -10) continue; // avoid path
      tufts.push({ x, z, s: 0.5 + rng() * 0.9, rot: rng() * Math.PI });
    }
    for (let i = 0; i < 90; i++) {
      const [x, z] = inCircle(30);
      if (Math.abs(x) < 2 && z < 3 && z > -10) continue;
      flowersY.push({ x, z, s: 0.6 + rng() * 0.5, rot: rng() * Math.PI });
    }
    for (let i = 0; i < 60; i++) {
      const [x, z] = inCircle(28);
      if (Math.abs(x) < 2 && z < 3 && z > -10) continue;
      flowersW.push({ x, z, s: 0.6 + rng() * 0.5, rot: rng() * Math.PI });
    }
    return { tufts, flowersY, flowersW };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (tuftRef.current) {
      tufts.forEach((tf, i) => {
        dummy.position.set(tf.x, 0, tf.z);
        dummy.rotation.set(0, tf.rot + Math.sin(t * 0.9 + i * 0.1) * 0.08, 0);
        dummy.scale.set(tf.s, tf.s * (0.9 + Math.sin(t + i) * 0.05), tf.s);
        dummy.updateMatrix();
        tuftRef.current.setMatrixAt(i, dummy.matrix);
      });
      tuftRef.current.instanceMatrix.needsUpdate = true;
    }

    if (flowerYellowRef.current) {
      flowersY.forEach((tf, i) => {
        dummy.position.set(tf.x, 0.05, tf.z);
        dummy.rotation.set(0, tf.rot, 0);
        dummy.scale.set(tf.s, tf.s, tf.s);
        dummy.updateMatrix();
        flowerYellowRef.current.setMatrixAt(i, dummy.matrix);
      });
      flowerYellowRef.current.instanceMatrix.needsUpdate = true;
    }

    if (flowerWhiteRef.current) {
      flowersW.forEach((tf, i) => {
        dummy.position.set(tf.x, 0.05, tf.z);
        dummy.rotation.set(0, tf.rot, 0);
        dummy.scale.set(tf.s, tf.s, tf.s);
        dummy.updateMatrix();
        flowerWhiteRef.current.setMatrixAt(i, dummy.matrix);
      });
      flowerWhiteRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Grass tufts — small cone bundles */}
      <instancedMesh ref={tuftRef} args={[undefined, undefined, tufts.length]} castShadow>
        <coneGeometry args={[0.08, 0.28, 5]} />
        <meshStandardMaterial color="#4c8a3a" roughness={0.9} flatShading />
      </instancedMesh>
      {/* Yellow flowers (dandelions) */}
      <instancedMesh ref={flowerYellowRef} args={[undefined, undefined, flowersY.length]}>
        <sphereGeometry args={[0.05, 6, 5]} />
        <meshStandardMaterial color="#f2c14e" emissive="#663d00" emissiveIntensity={0.15} roughness={0.7} />
      </instancedMesh>
      {/* White flowers */}
      <instancedMesh ref={flowerWhiteRef} args={[undefined, undefined, flowersW.length]}>
        <sphereGeometry args={[0.045, 6, 5]} />
        <meshStandardMaterial color="#f8f5ea" roughness={0.7} />
      </instancedMesh>
    </group>
  );
}
