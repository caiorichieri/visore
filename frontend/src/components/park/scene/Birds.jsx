import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// A small flock of birds flying in slow circles high above the park.
// Each bird is a tiny triangle wing pair that flaps.
export default function Birds({ count = 6 }) {
  const groupRef = useRef();

  const birds = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        radius: 18 + Math.random() * 15,
        height: 14 + Math.random() * 5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.12 + Math.random() * 0.08,
        wingPhase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((bird, i) => {
      const b = birds[i];
      const a = t * b.speed + b.phase;
      const x = Math.cos(a) * b.radius;
      const z = Math.sin(a) * b.radius;
      bird.position.set(x, b.height + Math.sin(t * 0.7 + b.phase) * 0.5, z);
      bird.rotation.y = -a + Math.PI / 2;

      // Wing flap animation
      const flap = Math.sin(t * 6 + b.wingPhase) * 0.7;
      if (bird.children[0]) bird.children[0].rotation.z = flap;
      if (bird.children[1]) bird.children[1].rotation.z = -flap;
    });
  });

  return (
    <group ref={groupRef}>
      {birds.map((_, i) => (
        <group key={i}>
          <mesh position={[0.16, 0, 0]}>
            <coneGeometry args={[0.05, 0.32, 4]} />
            <meshStandardMaterial color="#1c1c1c" roughness={0.9} flatShading />
          </mesh>
          <mesh position={[-0.16, 0, 0]}>
            <coneGeometry args={[0.05, 0.32, 4]} />
            <meshStandardMaterial color="#1c1c1c" roughness={0.9} flatShading />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.045, 6, 5]} />
            <meshStandardMaterial color="#141414" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
