import { useMemo, useEffect, useState } from "react";
import * as THREE from "three";

// CC0 grass texture from Poly Haven (with a graceful procedural fallback if
// the CDN is blocked).
const GRASS_URL =
  "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/forrest_ground_01/forrest_ground_01_diff_1k.jpg";

export default function Ground() {
  const [grass, setGrass] = useState(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      GRASS_URL,
      (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(12, 12);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        setGrass(tex);
      },
      undefined,
      () => setGrass(null)
    );
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.CircleGeometry(80, 128);
    const pos = geo.attributes.position;
    const colors = [];
    const base = new THREE.Color("#5a8f4a");
    const dark = new THREE.Color("#3f6b39");
    const light = new THREE.Color("#8bbf6b");

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const d = Math.sqrt(x * x + y * y);
      const wave = Math.sin(x * 0.12) * Math.cos(y * 0.11) * 0.35;
      const z = (d > 4 ? wave : wave * 0.1) + Math.random() * 0.06;
      pos.setZ(i, z);

      const n = Math.sin(x * 0.4) * Math.cos(y * 0.35) * 0.5 + 0.5;
      const c = base.clone().lerp(dark, n * 0.55).lerp(light, (1 - n) * 0.25);
      colors.push(c.r, c.g, c.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      {grass ? (
        <meshStandardMaterial
          map={grass}
          color="#ffffff"
          roughness={0.95}
          metalness={0}
        />
      ) : (
        <meshStandardMaterial vertexColors roughness={0.95} metalness={0} />
      )}
    </mesh>
  );
}
