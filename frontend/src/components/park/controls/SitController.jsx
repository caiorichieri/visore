import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Smoothly interpolates the camera / XR origin to the bench seat when `sitting`
// is true, and back to a saved location when it becomes false.
export default function SitController({ mode, bench, sitting, xrOriginRef }) {
  const { camera } = useThree();
  const savedCamPos = useRef(new THREE.Vector3());
  const savedCamQuat = useRef(new THREE.Quaternion());
  const savedOriginPos = useRef(new THREE.Vector3());
  const targetCamPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const active = useRef(false);
  const startedSitting = useRef(false);

  const seatWorld = () =>
    new THREE.Vector3(
      bench.position.x + bench.seatCameraOffset.x,
      bench.position.y + bench.seatCameraOffset.y,
      bench.position.z + bench.seatCameraOffset.z
    );

  // Save / restore snapshot on state change
  useEffect(() => {
    if (sitting) {
      savedCamPos.current.copy(camera.position);
      savedCamQuat.current.copy(camera.quaternion);
      if (mode === "vr" && xrOriginRef?.current) {
        savedOriginPos.current.copy(xrOriginRef.current.position);
      }
      targetCamPos.current.copy(seatWorld());
      targetLookAt.current.set(
        bench.position.x,
        bench.position.y + 1.3,
        bench.position.z + 8
      );
      active.current = true;
      startedSitting.current = true;
    } else if (startedSitting.current) {
      targetCamPos.current.copy(savedCamPos.current);
      active.current = true;
    }
  }, [sitting]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    if (!active.current) return;
    const smooth = 1 - Math.pow(0.001, delta);

    if (mode === "vr") {
      const origin = xrOriginRef?.current;
      if (!origin) return;

      if (sitting) {
        // Compute origin position so that headset world position aligns with the seat.
        // XR camera position (in local space) is set every frame by WebXR based on the
        // headset pose. We derive origin = seat - localCam.
        const camLocal = camera.position.clone();
        const desired = targetCamPos.current.clone().sub(camLocal);
        desired.y = 0; // keep the rig on the floor
        origin.position.lerp(desired, smooth * 0.15);
      } else {
        origin.position.lerp(savedOriginPos.current, smooth * 0.15);
        if (origin.position.distanceTo(savedOriginPos.current) < 0.02) {
          active.current = false;
        }
      }
    } else {
      camera.position.lerp(targetCamPos.current, smooth * 0.12);
      if (sitting) {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const desired = targetLookAt.current
          .clone()
          .sub(camera.position)
          .normalize();
        const blended = dir.lerp(desired, smooth * 0.08).normalize();
        camera.lookAt(camera.position.clone().add(blended));
      } else {
        camera.quaternion.slerp(savedCamQuat.current, smooth * 0.12);
        if (camera.position.distanceTo(targetCamPos.current) < 0.02) {
          active.current = false;
        }
      }
    }
  });

  return null;
}
