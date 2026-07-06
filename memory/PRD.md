# Parque Virtual VR (Parco Virtuale)

## Problem Statement (Original, PT-BR)
Uma experiência VR pelo navegador onde o usuário explora um parque com banco e
árvores usando óculos VR completo, com objetos interativos.

## Language & UX
- **UI language: Italian** (per user choice)
- Semi-realistic stylized (mid-poly with good lighting), user quote:
  "nao precisa ser realista, mas precisa dar a sensacao de que é"
- Desktop mode with WASD + mouse look enabled
- Ambient audio: procedural (Web Audio API) — wind + occasional bird chirps
  (CC0 external files failed with 403 hotlink protection)

## Architecture
- **Frontend only**: React + Three.js + @react-three/fiber + @react-three/drei
  + @react-three/xr v6 (WebXR)
- No backend needed for V1
- Everything is client-side, no persistence

## Implemented (2026-02)
- Welcome screen (Italian) with "Entra in VR" and "Esplora sul desktop" buttons
- 3D park: sky, grass ground (undulated + per-vertex colors), path, ~46 trees
  (procedural), ~22 rocks/bushes, wooden bench with slats, floating pollen
  particles ("butterflies")
- Lighting: directional sun + hemisphere + ambient with real-time shadows
- Desktop controls: WASD + Shift to run, mouse look via PointerLockControls
- VR controls: teleport pointer + XR origin move on select
- Bench interaction: proximity + E key (or click) toggles sit/stand with
  smooth camera transition
- Ambient audio: procedural wind + bird chirps, mute button
- Exit-to-welcome button

## Backlog
- P1: Real HDR environment for more realism
- P1: External CC0 audio files (need reliable CDN)
- P2: Object grabbing (ball / frisbee)
- P2: Day/night toggle via lamp post
- P2: Multiplayer (see other visitors)

## Test Credentials
None — no authentication in this app.
