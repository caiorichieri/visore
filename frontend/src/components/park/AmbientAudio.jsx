import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

// Procedural ambient audio built with the Web Audio API — no external files,
// no CORS issues. Produces a soft wind bed plus occasional bird-like chirps.
export default function AmbientAudio() {
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const cleanupRef = useRef(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let birdTimer = null;

    const start = () => {
      if (cancelled || ctxRef.current) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        ctxRef.current = ctx;

        const master = ctx.createGain();
        master.gain.value = muted ? 0 : 0.55;
        master.connect(ctx.destination);
        masterRef.current = master;

        // Wind: filtered white noise
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 520;
        lp.Q.value = 0.8;

        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 90;

        const windGain = ctx.createGain();
        windGain.gain.value = 0.22;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.08;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.15;
        lfo.connect(lfoGain).connect(windGain.gain);

        noise.connect(hp).connect(lp).connect(windGain).connect(master);
        noise.start();
        lfo.start();

        const scheduleBird = () => {
          if (cancelled || !ctxRef.current || ctxRef.current.state === "closed") return;
          try {
            const localCtx = ctxRef.current;
            const localMaster = masterRef.current;
            const now = localCtx.currentTime;
            for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
              const t = now + i * 0.09 + Math.random() * 0.05;
              const osc = localCtx.createOscillator();
              const g = localCtx.createGain();
              const startFreq = 1400 + Math.random() * 1800;
              const endFreq = startFreq * (0.6 + Math.random() * 0.7);
              osc.frequency.setValueAtTime(startFreq, t);
              osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.08);
              osc.type = "sine";
              g.gain.setValueAtTime(0, t);
              g.gain.linearRampToValueAtTime(0.08, t + 0.01);
              g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
              osc.connect(g).connect(localMaster);
              osc.start(t);
              osc.stop(t + 0.12);
            }
          } catch {
            /* context possibly closed – ignore */
          }
          birdTimer = setTimeout(scheduleBird, (1.5 + Math.random() * 4) * 1000);
        };
        scheduleBird();
      } catch (e) {
        console.warn("Audio init failed", e);
      }
    };

    // Try immediate start; if not allowed, retry on next user gesture.
    start();
    const retry = () => start();
    window.addEventListener("click", retry);
    window.addEventListener("keydown", retry);

    cleanupRef.current = () => {
      cancelled = true;
      if (birdTimer) clearTimeout(birdTimer);
      window.removeEventListener("click", retry);
      window.removeEventListener("keydown", retry);
      try {
        ctxRef.current?.close();
      } catch {
        /* noop */
      }
      ctxRef.current = null;
      masterRef.current = null;
    };
    return () => cleanupRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (masterRef.current) {
      masterRef.current.gain.value = muted ? 0 : 0.55;
    }
  }, [muted]);

  return (
    <button
      onClick={() => setMuted((m) => !m)}
      aria-label={muted ? "Attiva audio" : "Disattiva audio"}
      data-testid="ambient-audio-toggle"
      style={{
        position: "fixed",
        top: 20,
        left: 20,
        zIndex: 40,
        padding: 10,
        borderRadius: 999,
        width: 42,
        height: 42,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(13, 26, 18, 0.55)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(245, 239, 228, 0.15)",
        color: "#f5efe4",
        cursor: "pointer",
        transition: "background 250ms ease",
      }}
    >
      {muted ? <VolumeX size={18} strokeWidth={1.6} /> : <Volume2 size={18} strokeWidth={1.6} />}
    </button>
  );
}
