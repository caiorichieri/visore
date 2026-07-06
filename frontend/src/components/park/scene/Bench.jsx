import { useEffect, useRef } from "react";
import * as THREE from "three";

// A wooden park bench built from primitive geometry, oriented facing +Z.
// The user "sits" when the group's userData.onSelect is triggered
// (either by the DesktopPlayer raycast or the XR pointer).
export default function Bench({
  position = [0, 0, 0],
  rotationY = 0,
  onSelect,
  onHoverChange,
  highlighted = false,
}) {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;
    ref.current.userData.onSelect = onSelect;
    ref.current.userData.interactType = "bench";
  }, [onSelect]);

  const woodDark = new THREE.Color("#5b3a1e");
  const woodLight = new THREE.Color("#8b5a30");
  const metal = new THREE.Color("#2a2a2a");

  const seatHeight = 0.48;
  const seatDepth = 0.55;
  const seatWidth = 1.9;
  const legThickness = 0.08;

  const emissive = highlighted ? new THREE.Color("#f6c67a") : new THREE.Color("#000000");
  const emissiveIntensity = highlighted ? 0.35 : 0;

  return (
    <group
      ref={ref}
      position={position}
      rotation={[0, rotationY, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHoverChange?.(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHoverChange?.(false);
        document.body.style.cursor = "";
      }}
    >
      {/* Seat slats */}
      {[-0.2, 0, 0.2].map((zOff, i) => (
        <mesh key={`seat-${i}`} position={[0, seatHeight, zOff * seatDepth]} castShadow receiveShadow>
          <boxGeometry args={[seatWidth, 0.05, 0.14]} />
          <meshStandardMaterial color={i === 1 ? woodLight : woodDark} roughness={0.7} metalness={0.05}
            emissive={emissive} emissiveIntensity={emissiveIntensity} />
        </mesh>
      ))}
      {/* Backrest slats */}
      {[0, 0.22, 0.44].map((yOff, i) => (
        <mesh key={`back-${i}`} position={[0, seatHeight + 0.15 + yOff, -seatDepth / 2 - 0.02]}
          rotation={[-0.12, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[seatWidth, 0.09, 0.05]} />
          <meshStandardMaterial color={woodLight} roughness={0.72} metalness={0.05}
            emissive={emissive} emissiveIntensity={emissiveIntensity} />
        </mesh>
      ))}
      {/* Armrests */}
      {[-1, 1].map((side) => (
        <mesh key={`arm-${side}`} position={[side * (seatWidth / 2 - 0.02), seatHeight + 0.25, 0]} castShadow>
          <boxGeometry args={[0.06, 0.5, seatDepth]} />
          <meshStandardMaterial color={woodDark} roughness={0.75} />
        </mesh>
      ))}
      {/* Legs */}
      {[
        [-seatWidth / 2 + 0.1, -seatDepth / 2 + 0.05],
        [seatWidth / 2 - 0.1, -seatDepth / 2 + 0.05],
        [-seatWidth / 2 + 0.1, seatDepth / 2 - 0.05],
        [seatWidth / 2 - 0.1, seatDepth / 2 - 0.05],
      ].map(([lx, lz], i) => (
        <mesh key={`leg-${i}`} position={[lx, seatHeight / 2, lz]} castShadow>
          <boxGeometry args={[legThickness, seatHeight, legThickness]} />
          <meshStandardMaterial color={metal} roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
      {highlighted && (
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.3, 1.55, 48]} />
          <meshBasicMaterial color="#f6c67a" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
