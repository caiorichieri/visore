import { useMemo } from "react";
import * as THREE from "three";

// Large disc-shaped grass ground with subtle vertex noise for undulation and
// per-vertex color variation so it feels organic and semi-realistic without textures.
export default function Ground() {
  const geometry = useMemo(() => {
    const geo = new THREE.CircleGeometry(80, 96);
    const pos = geo.attributes.position;
    const colors = [];
    const base = new THREE.Color("#5a8f4a");
    const dark = new THREE.Color("#3f6b39");
    const light = new THREE.Color("#8bbf6b");

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // gentle undulation - keep near center flat
      const d = Math.sqrt(x * x + y * y);
      const wave = Math.sin(x * 0.12) * Math.cos(y * 0.11) * 0.35;
      const z = (d > 4 ? wave : wave * 0.1) + Math.random() * 0.06;
      pos.setZ(i, z);

      // Blend colors based on noise-like function
      const n = Math.sin(x * 0.4) * Math.cos(y * 0.35) * 0.5 + 0.5;
      const c = base.clone().lerp(dark, n * 0.55).lerp(light, (1 - n) * 0.25);
      colors.push(c.r, c.g, c.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <meshStandardMaterial
        vertexColors
        roughness={0.95}
        metalness={0}
        flatShading={false}
      />
    </mesh>
  );
}
