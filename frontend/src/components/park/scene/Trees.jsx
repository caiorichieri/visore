import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// Procedural mid-poly trees: tapered trunk + irregular foliage cluster.
// Placed with a seeded deterministic layout so scene stays consistent.
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default function Trees() {
  const foliageRef = useRef();

  const trees = useMemo(() => {
    const rng = seededRandom(42);
    const items = [];
    const count = 46;
    for (let i = 0; i < count; i++) {
      // Distribute in a ring 8..55 units from origin, avoid path/bench area
      const angle = rng() * Math.PI * 2;
      const radius = 8 + rng() * 45;
      let x = Math.cos(angle) * radius;
      let z = Math.sin(angle) * radius;
      // Avoid the immediate bench and path corridor
      if (Math.abs(x) < 3 && z < 2 && z > -14) {
        x += 6 * (x >= 0 ? 1 : -1);
      }
      const scale = 0.85 + rng() * 0.9;
      const foliageColor = new THREE.Color().setHSL(
        0.28 + rng() * 0.06, // green hue
        0.45 + rng() * 0.2,
        0.28 + rng() * 0.15
      );
      const rotY = rng() * Math.PI * 2;
      items.push({ x, z, scale, foliageColor, rotY, phase: rng() * Math.PI * 2 });
    }
    return items;
  }, []);

  // Slight sway animation on foliage group
  useFrame((state) => {
    if (!foliageRef.current) return;
    foliageRef.current.children.forEach((child, i) => {
      const t = state.clock.elapsedTime;
      child.rotation.z =
        Math.sin(t * 0.6 + trees[i].phase) * 0.02;
    });
  });

  return (
    <group>
      {/* Trunks */}
      <group>
        {trees.map((tr, i) => (
          <mesh
            key={`t-${i}`}
            position={[tr.x, 1.4 * tr.scale, tr.z]}
            rotation={[0, tr.rotY, 0]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry
              args={[0.12 * tr.scale, 0.22 * tr.scale, 2.8 * tr.scale, 8]}
            />
            <meshStandardMaterial color="#5a3a24" roughness={0.95} />
          </mesh>
        ))}
      </group>

      {/* Foliage clusters */}
      <group ref={foliageRef}>
        {trees.map((tr, i) => (
          <group
            key={`f-${i}`}
            position={[tr.x, 3.0 * tr.scale + 0.4, tr.z]}
            rotation={[0, tr.rotY, 0]}
          >
            <mesh castShadow receiveShadow>
              <icosahedronGeometry args={[1.4 * tr.scale, 1]} />
              <meshStandardMaterial
                color={tr.foliageColor}
                roughness={0.85}
                flatShading
              />
            </mesh>
            <mesh position={[0.8 * tr.scale, 0.4 * tr.scale, -0.2 * tr.scale]} castShadow>
              <icosahedronGeometry args={[0.9 * tr.scale, 1]} />
              <meshStandardMaterial
                color={tr.foliageColor.clone().offsetHSL(0, 0, -0.04)}
                roughness={0.9}
                flatShading
              />
            </mesh>
            <mesh position={[-0.7 * tr.scale, 0.15 * tr.scale, 0.5 * tr.scale]} castShadow>
              <icosahedronGeometry args={[0.85 * tr.scale, 1]} />
              <meshStandardMaterial
                color={tr.foliageColor.clone().offsetHSL(0, 0, 0.03)}
                roughness={0.88}
                flatShading
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
