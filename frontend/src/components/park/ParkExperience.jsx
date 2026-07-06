import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { XR, XROrigin } from "@react-three/xr";
import { Sky, PointerLockControls, Stars, Preload } from "@react-three/drei";
import * as THREE from "three";

import Ground from "@/components/park/scene/Ground";
import Trees from "@/components/park/scene/Trees";
import Bench from "@/components/park/scene/Bench";
import Path from "@/components/park/scene/Path";
import Rocks from "@/components/park/scene/Rocks";
import Butterflies from "@/components/park/scene/Butterflies";
import Clouds from "@/components/park/scene/Clouds";
import Birds from "@/components/park/scene/Birds";
import GrassTufts from "@/components/park/scene/GrassTufts";
import Ball from "@/components/park/scene/Ball";
import LampPost from "@/components/park/scene/LampPost";
import Radio from "@/components/park/scene/Radio";
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

const LAMP_POS = [-3, 0, -1];
const RADIO_POS = [1.65, 0, -6.4];
const BALL_INITIAL = [1.6, 0.35, 2];

export default function ParkExperience({ mode, xrStore, onExit, autoEnterVR, onVRUnavailable }) {
  const [sitting, setSitting] = useState(false);
  const [hoveringBench, setHoveringBench] = useState(false);
  const [nearBench, setNearBench] = useState(false);
  const [locked, setLocked] = useState(false);
  const [vrError, setVrError] = useState(null);
  const [dayTime, setDayTime] = useState("day");
  const [radioOn, setRadioOn] = useState(false);
  const [heldObject, setHeldObject] = useState(null);
  const [aimedAt, setAimedAt] = useState(null);

  const xrOriginRef = useRef(null);
  const ballRef = useRef(null);
  const ballPosRef = useRef(new THREE.Vector3(...BALL_INITIAL));
  const lastToggleAt = useRef(0);

  // Feed the current live ball position into the proximity map so pickup
  // detection follows the ball as it rolls / gets thrown.
  const [ballWorld, setBallWorld] = useState(() => new THREE.Vector3(...BALL_INITIAL));
  useEffect(() => {
    const id = setInterval(() => {
      if (ballRef.current?.getPosition) {
        const p = ballRef.current.getPosition();
        if (p.distanceTo(ballPosRef.current) > 0.1) {
          ballPosRef.current.copy(p);
          setBallWorld(p.clone());
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, []);

  const interactPositions = useMemo(() => ({
    bench: BENCH.position,
    lamp: new THREE.Vector3(...LAMP_POS),
    radio: new THREE.Vector3(...RADIO_POS),
    ball: ballWorld,
  }), [ballWorld]);

  const toggleSit = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleAt.current < 400) return;
    lastToggleAt.current = now;
    setSitting((s) => !s);
  }, []);

  const toggleDayNight = useCallback(() => setDayTime((d) => (d === "day" ? "night" : "day")), []);
  const toggleRadio = useCallback(() => setRadioOn((r) => !r), []);
  const pickupBall = useCallback(() => setHeldObject("ball"), []);
  const throwHeld = useCallback((dir) => {
    if (heldObject === "ball" && ballRef.current) {
      ballRef.current.throwBall(dir, 10);
    }
    setHeldObject(null);
  }, [heldObject]);

  const onInteract = useCallback((type) => {
    if (type === "bench") toggleSit();
    else if (type === "ball") pickupBall();
    else if (type === "lamp") toggleDayNight();
    else if (type === "radio") toggleRadio();
  }, [toggleSit, pickupBall, toggleDayNight, toggleRadio]);

  // VR autoStart with graceful degradation
  useEffect(() => {
    if (!autoEnterVR) return;
    let cancelled = false;
    const t = setTimeout(() => {
      if (cancelled) return;
      try {
        const result = xrStore.enterVR();
        if (result && typeof result.catch === "function") {
          result.catch((err) => {
            console.warn("VR not available:", err?.message || err);
            setVrError(err?.message || "VR non disponibile su questo dispositivo.");
            onVRUnavailable?.();
          });
        }
      } catch (err) {
        console.warn("VR init failed:", err);
        setVrError(err?.message || "VR non disponibile.");
        onVRUnavailable?.();
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [autoEnterVR, xrStore]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts: E = context-sensitive interact / stand-up when seated,
  // F = drop the held ball.
  const nearestInteractableRef = useRef(null);
  useEffect(() => { nearestInteractableRef.current = aimedAt; }, [aimedAt]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat) return;
      if (e.key === "e" || e.key === "E") {
        if (sitting) { toggleSit(); return; }
        if (heldObject === "ball") return; // click to throw / F to drop
        // Bench takes priority over other interactables when the player is
        // literally standing at the bench — otherwise the ball can steal the
        // sit affordance.
        if (nearBench) { toggleSit(); return; }
        const near = nearestInteractableRef.current;
        if (near === "lamp") { toggleDayNight(); return; }
        if (near === "radio") { toggleRadio(); return; }
        if (near === "ball") { pickupBall(); return; }
        if (near === "bench") { toggleSit(); return; }
      }
      if (e.key === "f" || e.key === "F") {
        if (heldObject === "ball" && ballRef.current) {
          ballRef.current.dropBall();
          setHeldObject(null);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aimedAt, nearBench, sitting, heldObject, toggleSit, toggleDayNight, toggleRadio, pickupBall]);

  useEffect(() => {
    const onLockChange = () => setLocked(!!document.pointerLockElement);
    document.addEventListener("pointerlockchange", onLockChange);
    return () => document.removeEventListener("pointerlockchange", onLockChange);
  }, []);

  // Colors / sky settings by time of day
  const scene = useMemo(() => {
    if (dayTime === "night") {
      return {
        bg: "#0a1220",
        fog: ["#101828", 22, 90],
        ambientColor: "#3f5170",
        ambientIntensity: 0.18,
        hemiSky: "#22385c",
        hemiGround: "#182a1f",
        hemiIntensity: 0.35,
        dirIntensity: 0.35,
        dirColor: "#bcd4ff",
        dirPos: [-8, 12, 6],
        sunPos: [-3, -0.6, 1],
        showSky: false,
        showStars: true,
        showClouds: false,
      };
    }
    return {
      bg: "#a9c9d9",
      fog: ["#b4c9d0", 30, 130],
      ambientColor: "#e6efe0",
      ambientIntensity: 0.55,
      hemiSky: "#cfe4ee",
      hemiGround: "#3a5b3b",
      hemiIntensity: 0.75,
      dirIntensity: 2.4,
      dirColor: "#fff3d6",
      dirPos: [15, 22, 10],
      sunPos: [3, 1.5, 1],
      showSky: true,
      showStars: false,
      showClouds: true,
    };
  }, [dayTime]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0d1a12" }} data-testid="park-experience">
      <Canvas
        shadows
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: dayTime === "night" ? 1.35 : 1.15,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        camera={{ fov: 68, near: 0.1, far: 500, position: [0, 1.65, 6] }}
        dpr={[1, 1.75]}
      >
        <XR store={xrStore}>
          <color attach="background" args={[scene.bg]} />
          <fog attach="fog" args={scene.fog} />

          <ambientLight intensity={scene.ambientIntensity} color={scene.ambientColor} />
          <hemisphereLight args={[scene.hemiSky, scene.hemiGround, scene.hemiIntensity]} />
          <directionalLight
            castShadow
            position={scene.dirPos}
            intensity={scene.dirIntensity}
            color={scene.dirColor}
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

          {scene.showSky && (
            <Sky
              distance={4500}
              sunPosition={scene.sunPos}
              mieCoefficient={0.005}
              mieDirectionalG={0.8}
              rayleigh={1.5}
              turbidity={6}
            />
          )}
          {scene.showStars && (
            <Stars radius={120} depth={40} count={2200} factor={4} fade speed={0.6} />
          )}

          <Ground />
          <Path />
          <Trees />
          <GrassTufts />
          <Rocks />
          <Butterflies />
          {scene.showClouds && <Clouds />}
          {dayTime === "day" && <Birds count={7} />}

          <group>
            <Bench
              position={BENCH.position.toArray()}
              rotationY={BENCH.rotationY}
              onHoverChange={setHoveringBench}
              onSelect={toggleSit}
              highlighted={hoveringBench || nearBench || aimedAt === "bench"}
            />
            <LampPost
              position={LAMP_POS}
              night={dayTime === "night"}
              onSelect={toggleDayNight}
              highlighted={aimedAt === "lamp"}
            />
            <Radio
              position={RADIO_POS}
              playing={radioOn}
              onSelect={toggleRadio}
              highlighted={aimedAt === "radio"}
            />
            <Ball
              ref={ballRef}
              held={heldObject === "ball"}
              onSelect={pickupBall}
              initialPosition={BALL_INITIAL}
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
              interactPositions={interactPositions}
              heldObject={heldObject}
              onThrow={throwHeld}
              onInteract={onInteract}
              onProximityHint={setAimedAt}
            />
          )}
          <SitController
            mode={mode}
            bench={BENCH}
            sitting={sitting}
            xrOriginRef={xrOriginRef}
          />

          {mode === "desktop" && <PointerLockControls pointerSpeed={0.6} />}

          <Preload all />
        </XR>
      </Canvas>

      <div className={`pk-crosshair ${aimedAt || nearBench || hoveringBench ? "active" : ""}`} />
      <HUD
        mode={mode}
        sitting={sitting}
        nearBench={nearBench}
        hoveringBench={hoveringBench}
        pointerLocked={locked}
        aimedAt={aimedAt}
        heldObject={heldObject}
        dayTime={dayTime}
        radioOn={radioOn}
      />

      {/* Day / night vignette */}
      {dayTime === "night" && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 5,
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      )}

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

      {vrError && (
        <div
          data-testid="vr-error-banner"
          style={{
            position: "fixed",
            top: 80,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            padding: "10px 18px",
            borderRadius: 999,
            background: "rgba(120, 40, 30, 0.85)",
            backdropFilter: "blur(14px)",
            color: "#f5efe4",
            fontSize: 13,
            letterSpacing: "0.02em",
            border: "1px solid rgba(245, 200, 190, 0.35)",
            maxWidth: "80vw",
            textAlign: "center",
          }}
        >
          Nessun dispositivo VR rilevato — puoi esplorare comunque con mouse e tastiera.
        </div>
      )}

      <AmbientAudio dayTime={dayTime} />
    </div>
  );
}
