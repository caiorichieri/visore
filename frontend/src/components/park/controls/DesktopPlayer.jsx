import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Desktop WASD movement using camera orientation. Keeps player on the ground plane.
// Also raycasts from screen-center on click to detect bench interaction when
// PointerLockControls has grabbed the mouse (clientX/Y is frozen while locked).
export default function DesktopPlayer({ bench, sitting, onNearBench, onSelectBench, benchTarget }) {
  const { camera, gl } = useThree();
  const keys = useRef({});
  const velocity = useRef(new THREE.Vector3());
  const dir = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const worldUp = useRef(new THREE.Vector3(0, 1, 0));
  const raycaster = useRef(new THREE.Raycaster());

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

  // Initial spawn position
  useEffect(() => {
    camera.position.set(0, 1.65, 6);
    camera.lookAt(bench.position.x, 1.2, bench.position.z);
  }, [camera, bench]);

  // Click handler: raycasts against the bench (from screen center when pointer
  // locked, otherwise from actual mouse position). Also acts as a lenient "sit"
  // trigger when the player is standing right next to the bench.
  useEffect(() => {
    const onClick = (e) => {
      // If player is near the bench, treat any canvas click as a sit intent.
      const dx = camera.position.x - bench.position.x;
      const dz = camera.position.z - bench.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      if (distance < 2.9) {
        onSelectBench?.();
        return;
      }

      if (!benchTarget?.current) return;
      let ndc = { x: 0, y: 0 };
      if (!document.pointerLockElement) {
        const rect = gl.domElement.getBoundingClientRect();
        ndc = {
          x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
          y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
        };
      }
      raycaster.current.setFromCamera(ndc, camera);
      const hits = raycaster.current.intersectObject(benchTarget.current, true);
      if (hits.length > 0) onSelectBench?.();
    };
    const el = gl.domElement;
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [camera, gl, benchTarget, onSelectBench, bench]);

  useFrame((_, delta) => {
    if (sitting) return; // SitController owns camera while seated

    const speed = keys.current["ShiftLeft"] || keys.current["ShiftRight"] ? 9 : 5.2;
    const k = keys.current;
    let moveZ = 0;
    let moveX = 0;
    if (k["KeyW"] || k["ArrowUp"]) moveZ += 1;
    if (k["KeyS"] || k["ArrowDown"]) moveZ -= 1;
    if (k["KeyA"] || k["ArrowLeft"]) moveX -= 1;
    if (k["KeyD"] || k["ArrowRight"]) moveX += 1;

    camera.getWorldDirection(dir.current);
    dir.current.y = 0;
    dir.current.normalize();
    right.current.crossVectors(dir.current, worldUp.current).normalize();

    velocity.current.set(0, 0, 0);
    velocity.current.addScaledVector(dir.current, moveZ * speed * delta);
    velocity.current.addScaledVector(right.current, moveX * speed * delta);

    camera.position.add(velocity.current);
    camera.position.y = 1.65;

    const dist = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
    if (dist > 55) {
      camera.position.x = (camera.position.x / dist) * 55;
      camera.position.z = (camera.position.z / dist) * 55;
    }

    const dx = camera.position.x - bench.position.x;
    const dz = camera.position.z - bench.position.z;
    const near = Math.sqrt(dx * dx + dz * dz) < 2.9;
    onNearBench?.(near);
  });

  return null;
}
