import { useFrame, useThree } from "@react-three/fiber";
import { TeleportTarget } from "@react-three/xr";
import * as THREE from "three";

// Teleport target that covers the whole ground and moves the XR origin on select.
// Also reports proximity to the bench for HUD prompts.
export default function VRTeleport({ bench, sitting, onNearBench, xrOriginRef }) {
  const { camera } = useThree();

  useFrame(() => {
    if (sitting) return;
    // Report proximity: XR camera world position vs bench
    const cp = new THREE.Vector3();
    camera.getWorldPosition(cp);
    const dx = cp.x - bench.position.x;
    const dz = cp.z - bench.position.z;
    onNearBench?.(Math.sqrt(dx * dx + dz * dz) < 2.2);
  });

  return (
    <TeleportTarget
      onTeleport={(target) => {
        const origin = xrOriginRef?.current;
        if (origin) {
          origin.position.copy(target);
        }
      }}
    >
      {/* Large invisible plane for teleport hits (matches ground extent). */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[55, 64]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </TeleportTarget>
  );
}
