import { useEffect, useState } from "react";
import * as THREE from "three";

// CC0 wood plank texture (Poly Haven).
const WOOD_URL =
  "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_planks_grey/wood_planks_grey_diff_1k.jpg";

export function useWoodTexture(repeat = [1.5, 0.4]) {
  const [tex, setTex] = useState(null);
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      WOOD_URL,
      (t) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(...repeat);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        setTex(t);
      },
      undefined,
      () => setTex(null)
    );
  }, [repeat]);
  return tex;
}

const DIRT_URL =
  "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/aerial_beach_01/aerial_beach_01_diff_1k.jpg";

export function useDirtTexture(repeat = [10, 3]) {
  const [tex, setTex] = useState(null);
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      DIRT_URL,
      (t) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(...repeat);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        setTex(t);
      },
      undefined,
      () => setTex(null)
    );
  }, [repeat]);
  return tex;
}

const BARK_URL =
  "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/bark_brown_02/bark_brown_02_diff_1k.jpg";

export function useBarkTexture(repeat = [1, 2]) {
  const [tex, setTex] = useState(null);
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      BARK_URL,
      (t) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(...repeat);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        setTex(t);
      },
      undefined,
      () => setTex(null)
    );
  }, [repeat]);
  return tex;
}
