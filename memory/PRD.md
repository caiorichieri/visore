# Parque Virtual VR (Parco Virtuale)

## Problem Statement (Original, PT-BR)
Uma experiência VR pelo navegador onde o usuário explora um parque com banco e
árvores usando óculos VR completo, com objetos interativos.

## Language & UX
- **UI language: Italian** (per user choice)
- Semi-realistic stylized (mid-poly with good lighting)
- Desktop mode with WASD + mouse look enabled
- Ambient audio: procedural (Web Audio API)

## Architecture
- **Frontend only**: React + Three.js + @react-three/fiber + @react-three/drei
  + @react-three/xr v6 (WebXR)
- No backend needed. Client-side only, no persistence.

## Implemented (2026-02)
### Fase 1-5 (V1)
- Welcome screen (Italian) with "Entra in VR" / "Esplora sul desktop" buttons
- 3D park: sky, undulating grass ground with per-vertex colors, meandering path,
  ~46 procedural trees, ~22 rocks/bushes, wooden bench
- Directional sun + hemisphere + ambient with shadows
- Desktop: WASD + Shift-run + PointerLockControls mouse-look
- VR: teleport pointer + XR origin (fallback to desktop when no headset)
- Bench sit / stand with smooth camera lerp
- Procedural ambient audio (wind bed + bird chirps) with mute toggle
- Exit-to-welcome, VR unavailable graceful fallback

### Fase Ampliamento (2026-02)
- **Day/Night toggle** via clickable lamp post (E or click) — swaps sky/stars/
  fog/lights, lights the lamp with a warm pointLight at night
- **Radio** near the bench — click / E toggles a procedural chord-pad "music"
  (Am-F-C-G loop with soft arpeggios)
- **Throwable ball** — click / E to pick up when close, click to throw in
  camera direction, F to drop. Simple gravity + bounce + damping physics
- **Life additions**: drifting low-poly clouds, flock of 7 flapping birds,
  ~240 instanced grass tufts, ~150 dandelions and white flowers, floating
  pollen particles ("butterflies")
- Contextual HUD prompts that surface the right action based on the nearest
  interactable (proximity <5m)

## Backlog
- P1: Real HDR environment map for photometrically accurate lighting
- P1: Curated CC0 audio loops (currently procedural because Pixabay/Google
  hotlink protection blocked direct URLs)
- P2: Multiplayer — see other visitors (requires backend + WebRTC/WebSocket)
- P2: Additional interactions (frisbee, dice, umbrella, gramophone…)

## Test Credentials
None — no authentication in this app.
