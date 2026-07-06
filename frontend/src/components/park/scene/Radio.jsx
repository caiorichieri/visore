import { useEffect, useRef } from "react";
import * as THREE from "three";

// A vintage wooden radio. Clicking it toggles procedural chord-pad music.
// Own Web Audio graph so the sound source is spatially "attached" to the radio.
export default function Radio({
  position = [1.65, 0, -6.4],
  rotationY = -0.5,
  playing = false,
  onSelect,
  highlighted = false,
}) {
  const groupRef = useRef();
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.userData.onSelect = onSelect;
    groupRef.current.userData.interactType = "radio";
  }, [onSelect]);

  // Manage procedural chord pad — Am, F, C, G — soft attack/release.
  useEffect(() => {
    if (!playing) {
      // Stop
      if (gainRef.current && ctxRef.current) {
        const now = ctxRef.current.currentTime;
        gainRef.current.gain.cancelScheduledValues(now);
        gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, now);
        gainRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.6);
      }
      const timeout = setTimeout(() => {
        nodesRef.current.forEach((n) => {
          try { n.stop(); } catch { /* noop */ }
        });
        nodesRef.current = [];
        try { ctxRef.current?.close(); } catch { /* noop */ }
        ctxRef.current = null;
        gainRef.current = null;
      }, 700);
      return () => clearTimeout(timeout);
    }

    // Start
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return undefined;
      const ctx = new AudioCtx();
      ctxRef.current = ctx;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 1.2);
      master.connect(ctx.destination);
      gainRef.current = master;

      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 900;
      lp.Q.value = 0.6;
      lp.connect(master);

      // Chord progression (A minor key): Am, F, C, G
      const chords = [
        [220, 261.63, 329.63], // Am (A3, C4, E4)
        [174.61, 220, 261.63], // F  (F3, A3, C4)
        [261.63, 329.63, 392], // C  (C4, E4, G4)
        [196, 246.94, 293.66], // G  (G3, B3, D4)
      ];
      const CHORD_LEN = 3.2;

      const oscs = chords[0].map(() => {
        const o = ctx.createOscillator();
        o.type = "sine";
        const g = ctx.createGain();
        g.gain.value = 0.5;
        o.connect(g).connect(lp);
        o.start();
        nodesRef.current.push(o);
        return { osc: o, gain: g };
      });

      // Slight detune for warmth via a second layer of triangle oscillators
      const oscsB = chords[0].map(() => {
        const o = ctx.createOscillator();
        o.type = "triangle";
        o.detune.value = 6;
        const g = ctx.createGain();
        g.gain.value = 0.28;
        o.connect(g).connect(lp);
        o.start();
        nodesRef.current.push(o);
        return { osc: o, gain: g };
      });

      // Schedule chord changes on the AudioContext timeline
      const t0 = ctx.currentTime + 0.05;
      for (let i = 0; i < 32; i++) {
        const t = t0 + i * CHORD_LEN;
        const chord = chords[i % chords.length];
        oscs.forEach(({ osc }, k) => {
          osc.frequency.setValueAtTime(chord[k], t);
        });
        oscsB.forEach(({ osc }, k) => {
          osc.frequency.setValueAtTime(chord[k] * 2, t); // octave up
        });
      }

      // A very quiet arpeggio ping on top for texture
      const scheduleArp = () => {
        if (!ctxRef.current || ctxRef.current.state === "closed") return;
        const now = ctxRef.current.currentTime;
        const note = 523.25 + Math.floor(Math.random() * 4) * 65.4; // C5 upwards
        const osc = ctxRef.current.createOscillator();
        const g = ctxRef.current.createGain();
        osc.type = "sine";
        osc.frequency.value = note;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.05, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
        osc.connect(g).connect(lp);
        osc.start(now);
        osc.stop(now + 1.8);
        setTimeout(scheduleArp, 2500 + Math.random() * 3500);
      };
      scheduleArp();
    } catch (e) {
      console.warn("Radio audio init failed", e);
    }

    return undefined;
  }, [playing]);

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[0.55, 0.34, 0.32]} />
        <meshStandardMaterial color="#7a4a26" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Speaker grille */}
      <mesh position={[-0.14, 0.22, 0.161]} castShadow>
        <boxGeometry args={[0.22, 0.22, 0.01]} />
        <meshStandardMaterial color="#d3b98a" roughness={0.8} />
      </mesh>
      {/* Tuning dial */}
      <mesh position={[0.15, 0.28, 0.161]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 20]} />
        <meshStandardMaterial color="#e8d29a" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Antenna */}
      <mesh position={[0.22, 0.62, -0.11]} rotation={[0.1, 0, 0.15]} castShadow>
        <cylinderGeometry args={[0.006, 0.006, 0.55, 6]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Play indicator light */}
      <mesh position={[0.16, 0.38, 0.161]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial
          color={playing ? "#7fff9a" : "#552222"}
          emissive={playing ? "#7fff9a" : "#000000"}
          emissiveIntensity={playing ? 1.4 : 0}
        />
      </mesh>
      {highlighted && (
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.65, 32]} />
          <meshBasicMaterial color="#f6c67a" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
