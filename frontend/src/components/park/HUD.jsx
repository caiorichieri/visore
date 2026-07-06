export default function HUD({
  mode,
  sitting,
  nearBench,
  hoveringBench,
  pointerLocked,
  aimedAt,
  heldObject,
  dayTime,
  radioOn,
}) {
  const showSitPrompt =
    !sitting && !heldObject && (nearBench || hoveringBench || aimedAt === "bench");

  return (
    <>
      {mode === "desktop" && !pointerLocked && !sitting && (
        <div
          className="pk-hud"
          data-testid="click-to-play-prompt"
          style={{ bottom: 32, background: "rgba(13, 26, 18, 0.7)" }}
        >
          <span>Clicca per attivare mouse e tastiera</span>
        </div>
      )}

      {mode === "desktop" && pointerLocked && !sitting && !heldObject && (
        <div className="pk-hud" data-testid="desktop-hud-controls">
          <span className="pk-key">W</span>
          <span className="pk-key">A</span>
          <span className="pk-key">S</span>
          <span className="pk-key">D</span>
          <span style={{ opacity: 0.75, marginLeft: 8 }}>muoviti · frecce per ruotare · <span className="pk-key">Esc</span> per liberare il mouse</span>
        </div>
      )}

      {mode === "vr" && !sitting && !heldObject && (
        <div className="pk-hud" data-testid="vr-hud-controls">
          <span style={{ opacity: 0.85 }}>Punta a terra e premi il grilletto per teletrasportarti</span>
        </div>
      )}

      {/* Contextual hover prompts (raycast target) */}
      {aimedAt === "ball" && !heldObject && !sitting && (
        <div
          className="pk-hud"
          data-testid="pickup-ball-prompt"
          style={{ bottom: 92, background: "rgba(230, 74, 58, 0.18)", borderColor: "rgba(230, 130, 120, 0.4)" }}
        >
          <span className="pk-key" style={{ background: "rgba(255, 200, 190, 0.25)" }}>E</span>
          <span>o click per raccogliere la pallina</span>
        </div>
      )}
      {aimedAt === "lamp" && !heldObject && !sitting && (
        <div
          className="pk-hud"
          data-testid="lamp-prompt"
          style={{ bottom: 92, background: "rgba(246, 198, 122, 0.15)", borderColor: "rgba(246, 198, 122, 0.4)" }}
        >
          <span className="pk-key" style={{ background: "rgba(246, 198, 122, 0.25)" }}>E</span>
          <span>o click per {dayTime === "day" ? "accendere il lampione (notte)" : "spegnere il lampione (giorno)"}</span>
        </div>
      )}
      {aimedAt === "radio" && !heldObject && !sitting && (
        <div
          className="pk-hud"
          data-testid="radio-prompt"
          style={{ bottom: 92, background: "rgba(127, 176, 105, 0.18)", borderColor: "rgba(127, 176, 105, 0.4)" }}
        >
          <span className="pk-key" style={{ background: "rgba(127, 255, 154, 0.25)" }}>E</span>
          <span>o click per {radioOn ? "spegnere la radio" : "accendere la radio"}</span>
        </div>
      )}

      {showSitPrompt && (
        <div
          className="pk-hud"
          data-testid="sit-prompt"
          style={{ bottom: 92, background: "rgba(246, 198, 122, 0.15)", borderColor: "rgba(246, 198, 122, 0.35)" }}
        >
          <span className="pk-key" style={{ background: "rgba(246, 198, 122, 0.25)", borderColor: "rgba(246, 198, 122, 0.5)" }}>E</span>
          <span>{mode === "vr" ? "o grilletto per sederti" : "o click per sederti sulla panchina"}</span>
        </div>
      )}

      {sitting && (
        <div className="pk-hud" data-testid="stand-prompt">
          <span className="pk-key">E</span>
          <span>per alzarti e continuare l&apos;esplorazione</span>
        </div>
      )}

      {heldObject === "ball" && !sitting && (
        <div
          className="pk-hud"
          data-testid="throw-ball-prompt"
          style={{ background: "rgba(230, 74, 58, 0.22)", borderColor: "rgba(255, 160, 150, 0.4)" }}
        >
          <span className="pk-key" style={{ background: "rgba(255, 200, 190, 0.25)" }}>click</span>
          <span>per lanciare · </span>
          <span className="pk-key">F</span>
          <span>per lasciarla cadere</span>
        </div>
      )}
    </>
  );
}
