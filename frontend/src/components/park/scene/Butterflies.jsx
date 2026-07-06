import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// Subtle floating "butterfly" points around the bench for ambience.
export default function Butterflies() {
  const ref = useRef();
  const count = 24;

  const { positions, phases } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 6;
      p[i * 3] = Math.cos(angle) * r;
      p[i * 3 + 1] = 0.6 + Math.random() * 2.2;
      p[i * 3 + 2] = -6 + Math.sin(angle) * r;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { positions: p, phases: ph };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const attr = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const px = positions[i * 3];
      const py = positions[i * 3 + 1];
      const pz = positions[i * 3 + 2];
      attr.array[i * 3] = px + Math.sin(t * 0.6 + phases[i]) * 0.4;
      attr.array[i * 3 + 1] = py + Math.sin(t * 1.3 + phases[i]) * 0.2;
      attr.array[i * 3 + 2] = pz + Math.cos(t * 0.5 + phases[i]) * 0.4;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#f6e2a6"
        size={0.14}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}
