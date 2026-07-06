import { useMemo } from "react";
import * as THREE from "three";
import { useDirtTexture } from "@/components/park/scene/textures";

// A meandering dirt-and-gravel path from spawn to the bench and beyond.
export default function Path() {
  const dirt = useDirtTexture([14, 1.5]);

  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.01, 8),
      new THREE.Vector3(-0.4, 0.01, 4),
      new THREE.Vector3(0.5, 0.01, 0),
      new THREE.Vector3(-0.2, 0.01, -4),
      new THREE.Vector3(0, 0.01, -6.5),
      new THREE.Vector3(0.6, 0.01, -12),
      new THREE.Vector3(-1.2, 0.01, -18),
    ]);
    const geo = new THREE.TubeGeometry(curve, 80, 0.7, 8, false);
    geo.scale(1, 0.04, 1);
    geo.translate(0, 0.01, 0);
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        map={dirt}
        color={dirt ? "#d6bf98" : "#c9b184"}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}
