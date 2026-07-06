import { useMemo } from "react";
import * as THREE from "three";

// A handful of scattered rocks and bushes for scene detail.
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default function Rocks() {
  const items = useMemo(() => {
    const rng = seededRandom(7);
    const out = [];
    for (let i = 0; i < 22; i++) {
      const angle = rng() * Math.PI * 2;
      const radius = 4 + rng() * 30;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      if (Math.abs(x) < 2.5 && z < 2 && z > -14) continue;
      const s = 0.18 + rng() * 0.55;
      const type = rng() > 0.55 ? "rock" : "bush";
      const rotY = rng() * Math.PI * 2;
      out.push({ x, z, s, type, rotY });
    }
    return out;
  }, []);

  return (
    <group>
      {items.map((it, i) =>
        it.type === "rock" ? (
          <mesh
            key={i}
            position={[it.x, it.s * 0.35, it.z]}
            rotation={[0, it.rotY, 0]}
            castShadow
            receiveShadow
            scale={[it.s * 1.6, it.s, it.s * 1.3]}
          >
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color="#7d8177" roughness={0.95} flatShading />
          </mesh>
        ) : (
          <mesh
            key={i}
            position={[it.x, it.s * 0.5, it.z]}
            rotation={[0, it.rotY, 0]}
            castShadow
            receiveShadow
            scale={[it.s * 1.4, it.s * 0.9, it.s * 1.4]}
          >
            <icosahedronGeometry args={[0.55, 1]} />
            <meshStandardMaterial color="#4d7a3d" roughness={0.9} flatShading />
          </mesh>
        )
      )}
    </group>
  );
}
