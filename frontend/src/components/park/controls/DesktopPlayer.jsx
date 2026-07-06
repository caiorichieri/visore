import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Desktop controls: WASD + proximity-based interaction detection.
// Instead of ray-casting (which fights with PointerLockControls in some
// browsers), we simply pick the closest interactable within 3.2m and
// surface it to the parent. Click / E throws or interacts with it.
export default function DesktopPlayer({
  bench,
  sitting,
  onNearBench,
  interactPositions, // { bench, ball, lamp, radio } as THREE.Vector3
  heldObject,
  onThrow,
  onInteract, // fired when the player clicks while pointer locked and near an interactable
  onProximityHint,
}) {
  const { camera, gl } = useThree();
  const keys = useRef({});
  const velocity = useRef(new THREE.Vector3());
  const dir = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const worldUp = useRef(new THREE.Vector3(0, 1, 0));
  const heldRef = useRef(heldObject);
  const nearestRef = useRef(null);
  const isLockedRef = useRef(false);

  useEffect(() => { heldRef.current = heldObject; }, [heldObject]);

  useEffect(() => {
    const onChange = () => { isLockedRef.current = !!document.pointerLockElement; };
    document.addEventListener("pointerlockchange", onChange);
    return () => document.removeEventListener("pointerlockchange", onChange);
  }, []);

  useEffect(() => {
    const down = (e) => { keys.current[e.code] = true; };
    const up = (e) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    camera.position.set(0, 1.65, 6);
    camera.lookAt(bench.position.x, 1.0, bench.position.z);
  }, [camera, bench]);

  // Canvas click → throw held ball, else interact with the closest object.
  // Use pointerdown for reliability (R3F's event system doesn't swallow it).
  useEffect(() => {
    const onDown = (e) => {
      if (e.button !== 0) return; // left only
      if (!isLockedRef.current) return;
      if (heldRef.current === "ball") {
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        onThrow?.(forward);
        return;
      }
      if (nearestRef.current) onInteract?.(nearestRef.current);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [camera, gl, onThrow, onInteract]);

  useFrame((_, delta) => {
    if (sitting) return;

    const d = Math.min(delta, 0.05);
    const speed = keys.current["ShiftLeft"] || keys.current["ShiftRight"] ? 9 : 5.2;
    const k = keys.current;

    // --- Arrow keys → camera rotation (yaw + pitch), so the player can
    // spin 360° with the keyboard alone even without a mouse. ---
    let yawDelta = 0;
    let pitchDelta = 0;
    if (k["ArrowLeft"]) yawDelta += 1;
    if (k["ArrowRight"]) yawDelta -= 1;
    if (k["ArrowUp"]) pitchDelta += 1;
    if (k["ArrowDown"]) pitchDelta -= 1;
    if (yawDelta !== 0 || pitchDelta !== 0) {
      const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
      euler.y += yawDelta * 1.9 * d;
      const maxPitch = Math.PI / 2 - 0.05;
      euler.x = Math.max(-maxPitch, Math.min(maxPitch, euler.x + pitchDelta * 1.4 * d));
      euler.z = 0;
      camera.quaternion.setFromEuler(euler);
    }

    let moveZ = 0;
    let moveX = 0;
    if (k["KeyW"]) moveZ += 1;
    if (k["KeyS"]) moveZ -= 1;
    if (k["KeyA"]) moveX -= 1;
    if (k["KeyD"]) moveX += 1;

    camera.getWorldDirection(dir.current);
    dir.current.y = 0;
    dir.current.normalize();
    right.current.crossVectors(dir.current, worldUp.current).normalize();

    velocity.current.set(0, 0, 0);
    velocity.current.addScaledVector(dir.current, moveZ * speed * d);
    velocity.current.addScaledVector(right.current, moveX * speed * d);

    camera.position.add(velocity.current);
    camera.position.y = 1.65;

    const distFromOrigin = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
    if (distFromOrigin > 55) {
      camera.position.x = (camera.position.x / distFromOrigin) * 55;
      camera.position.z = (camera.position.z / distFromOrigin) * 55;
    }

    // Proximity to bench (for sit hint and legacy near-check)
    const dx = camera.position.x - bench.position.x;
    const dz = camera.position.z - bench.position.z;
    onNearBench?.(Math.sqrt(dx * dx + dz * dz) < 3.2);

    // Determine nearest interactable within 5.0m. Bench gets a small distance
    // bias when standing at it, so it wins over a ball lying on the way.
    if (interactPositions && onProximityHint) {
      let best = null;
      let bestDist = 5.0;
      for (const [type, pos] of Object.entries(interactPositions)) {
        if (heldRef.current === "ball" && type === "ball") continue;
        const ddx = camera.position.x - pos.x;
        const ddz = camera.position.z - pos.z;
        let dist = Math.sqrt(ddx * ddx + ddz * ddz);
        if (type === "bench") dist -= 1.2; // give bench a preference bias
        if (dist < bestDist) {
          bestDist = dist;
          best = type;
        }
      }
      if (best !== nearestRef.current) {
        nearestRef.current = best;
        onProximityHint(best);
      }
    }
  });

  return null;
}
