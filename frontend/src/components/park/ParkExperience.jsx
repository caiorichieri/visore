import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { XR, XROrigin } from "@react-three/xr";
import { Sky, PointerLockControls, Preload } from "@react-three/drei";
import * as THREE from "three";

import Ground from "@/components/park/scene/Ground";
import Trees from "@/components/park/scene/Trees";
import Bench from "@/components/park/scene/Bench";
import Path from "@/components/park/scene/Path";
import Rocks from "@/components/park/scene/Rocks";
import Butterflies from "@/components/park/scene/Butterflies";
import DesktopPlayer from "@/components/park/controls/DesktopPlayer";
import VRTeleport from "@/components/park/controls/VRTeleport";
import SitController from "@/components/park/controls/SitController";
import AmbientAudio from "@/components/park/AmbientAudio";
import HUD from "@/components/park/HUD";

export const BENCH = {
  position: new THREE.Vector3(0, 0, -6),
  rotationY: 0,
  seatCameraOffset: new THREE.Vector3(0, 1.15, 0.05),
};

export default function ParkExperience({ mode, xrStore, onExit }) {
  const [sitting, setSitting] = useState(false);
  const [hoveringBench, setHoveringBench] = useState(false);
  const [nearBench, setNearBench] = useState(false);
  const [locked, setLocked] = useState(false);
  const pointerLockRef = useRef(null);
  const xrOriginRef = useRef(null);
  const benchTargetRef = useRef(null);

  const lastToggleAt = useRef(0);
  const toggleSit = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleAt.current < 400) return; // guard against rapid retriggers
    lastToggleAt.current = now;
    setSitting((s) => !s);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat) return;
      if (e.key === "e" || e.key === "E") {
        if (nearBench || sitting) toggleSit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nearBench, sitting, toggleSit]);

  useEffect(() => {
    const onLockChange = () => setLocked(!!document.pointerLockElement);
    document.addEventListener("pointerlockchange", onLockChange);
    return () => document.removeEventListener("pointerlockchange", onLockChange);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0d1a12" }} data-testid="park-experience">
      <Canvas
        shadows
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        camera={{ fov: 68, near: 0.1, far: 500, position: [0, 1.65, 6] }}
        dpr={[1, 1.75]}
      >
        <XR store={xrStore}>
          <color attach="background" args={["#a9c9d9"]} />
          <fog attach="fog" args={["#b4c9d0", 30, 120]} />

          <ambientLight intensity={0.55} color="#e6efe0" />
          <hemisphereLight args={["#cfe4ee", "#3a5b3b", 0.75]} />
          <directionalLight
            castShadow
            position={[15, 22, 10]}
            intensity={2.4}
            color="#fff3d6"
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
            shadow-camera-near={0.5}
            shadow-camera-far={80}
            shadow-bias={-0.0005}
          />

          <Sky
            distance={4500}
            sunPosition={[3, 1.5, 1]}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
            rayleigh={1.5}
            turbidity={6}
          />

          <Ground />
          <Path />
          <Trees />
          <Rocks />
          <Butterflies />
          <group ref={benchTargetRef}>
            <Bench
              position={BENCH.position.toArray()}
              rotationY={BENCH.rotationY}
              onHoverChange={setHoveringBench}
              onSelect={toggleSit}
              highlighted={hoveringBench || nearBench}
            />
          </group>

          {mode === "vr" ? (
            <>
              <XROrigin ref={xrOriginRef} position={[0, 0, 4]} />
              <VRTeleport
                bench={BENCH}
                sitting={sitting}
                onNearBench={setNearBench}
                xrOriginRef={xrOriginRef}
              />
            </>
          ) : (
            <DesktopPlayer
              bench={BENCH}
              sitting={sitting}
              onNearBench={setNearBench}
              onSelectBench={toggleSit}
              benchTarget={benchTargetRef}
            />
          )}
          <SitController
            mode={mode}
            bench={BENCH}
            sitting={sitting}
            xrOriginRef={xrOriginRef}
          />

          {mode === "desktop" && (
            <PointerLockControls ref={pointerLockRef} pointerSpeed={0.6} />
          )}

          <Preload all />
        </XR>
      </Canvas>

      <div className={`pk-crosshair ${hoveringBench || nearBench ? "active" : ""}`} />
      <HUD
        mode={mode}
        sitting={sitting}
        nearBench={nearBench}
        hoveringBench={hoveringBench}
        pointerLocked={locked}
      />
      <button
        className="pk-exit"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          try {
            if (document.pointerLockElement) document.exitPointerLock();
          } catch { /* noop */ }
          setTimeout(() => onExit?.(), 40);
        }}
        data-testid="exit-park-button"
      >
        Torna all&apos;ingresso
      </button>

      <AmbientAudio />
    </div>
  );
}
