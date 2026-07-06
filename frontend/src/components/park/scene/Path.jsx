import { useMemo } from "react";
import * as THREE from "three";

// A subtle beige/gravel path meandering from spawn to the bench area.
export default function Path() {
  const geometry = useMemo(() => {
    // Build path as a stretched, curved ring segment using a TubeGeometry style
    // but simpler: a series of flat quads following a curve.
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
    // Flatten the tube: scale Y by tiny amount to make it a flat ribbon
    geo.scale(1, 0.04, 1);
    geo.translate(0, 0.01, 0);
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#c9b184" roughness={1} metalness={0} />
    </mesh>
  );
}
