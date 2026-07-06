import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Soft, low-poly clouds drifting across the sky.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default function Clouds() {
  const groupRef = useRef();

  const clouds = useMemo(() => {
    const rng = seeded(19);
    const arr = [];
    for (let i = 0; i < 9; i++) {
      const angle = rng() * Math.PI * 2;
      const radius = 25 + rng() * 40;
      arr.push({
        x: Math.cos(angle) * radius,
        y: 22 + rng() * 8,
        z: Math.sin(angle) * radius,
        scale: 4 + rng() * 3,
        speed: 0.15 + rng() * 0.25,
        offset: rng() * 100,
      });
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((cloud, i) => {
      const c = clouds[i];
      cloud.position.x = c.x + Math.sin(t * 0.02 + c.offset) * 4 + t * c.speed;
      // Wrap horizontally
      if (cloud.position.x > 80) cloud.position.x -= 160;
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.scale}>
          <mesh>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color="#f4f7f9" roughness={0.9} flatShading transparent opacity={0.92} />
          </mesh>
          <mesh position={[0.9, -0.15, 0.2]} scale={[0.7, 0.6, 0.7]}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color="#ecf1f4" roughness={0.9} flatShading transparent opacity={0.9} />
          </mesh>
          <mesh position={[-0.85, -0.1, -0.15]} scale={[0.6, 0.5, 0.7]}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color="#f7f9fb" roughness={0.9} flatShading transparent opacity={0.92} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
