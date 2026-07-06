import { useEffect, useRef } from "react";
import * as THREE from "three";

// An iron lamp post with a glowing bulb. Clicking it toggles day / night.
// When `night` is true, the bulb becomes emissive and emits a warm pointLight.
export default function LampPost({
  position = [-3, 0, -1],
  night = false,
  onSelect,
  highlighted = false,
}) {
  const groupRef = useRef();

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.userData.onSelect = onSelect;
    groupRef.current.userData.interactType = "lamp";
  }, [onSelect]);

  const emissive = night ? new THREE.Color("#ffd694") : new THREE.Color("#000000");
  const emissiveIntensity = night ? 2.6 : 0;
  const hoverEmissive = highlighted ? new THREE.Color("#f6c67a") : new THREE.Color("#000000");
  const hoverIntensity = highlighted ? 0.28 : 0;

  return (
    <group ref={groupRef} position={position}>
      {/* Base */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.3, 16]} />
        <meshStandardMaterial color="#1f1f21" roughness={0.6} metalness={0.4}
          emissive={hoverEmissive} emissiveIntensity={hoverIntensity} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 3, 12]} />
        <meshStandardMaterial color="#26262a" roughness={0.55} metalness={0.5} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.28, 3.25, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 10]} />
        <meshStandardMaterial color="#26262a" roughness={0.55} metalness={0.5} />
      </mesh>
      {/* Lantern housing */}
      <mesh position={[0.58, 3.15, 0]} castShadow>
        <boxGeometry args={[0.28, 0.36, 0.28]} />
        <meshStandardMaterial color="#1a1a1c" roughness={0.6} metalness={0.4}
          emissive={hoverEmissive} emissiveIntensity={hoverIntensity} />
      </mesh>
      {/* Glass bulb */}
      <mesh position={[0.58, 3.12, 0]}>
        <sphereGeometry args={[0.13, 20, 16]} />
        <meshStandardMaterial
          color={night ? "#fff2c8" : "#e6e6d8"}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.25}
          metalness={0.05}
          transparent
          opacity={0.95}
        />
      </mesh>
      {/* Lamp light (only at night) */}
      {night && (
        <pointLight
          position={[0.58, 3.12, 0]}
          intensity={9}
          distance={14}
          decay={2}
          color="#ffcf88"
          castShadow
        />
      )}
      {/* Hover ring */}
      {highlighted && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.72, 32]} />
          <meshBasicMaterial color="#f6c67a" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
