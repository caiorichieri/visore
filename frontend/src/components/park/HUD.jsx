export default function HUD({ mode, sitting, nearBench, hoveringBench, pointerLocked }) {
  const showSitPrompt = !sitting && (nearBench || hoveringBench);

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

      {mode === "desktop" && pointerLocked && !sitting && (
        <div className="pk-hud" data-testid="desktop-hud-controls">
          <span className="pk-key">W</span>
          <span className="pk-key">A</span>
          <span className="pk-key">S</span>
          <span className="pk-key">D</span>
          <span style={{ opacity: 0.75, marginLeft: 8 }}>
            per muoverti · <span className="pk-key">Esc</span> per liberare il mouse
          </span>
        </div>
      )}

      {mode === "vr" && !sitting && (
        <div className="pk-hud" data-testid="vr-hud-controls">
          <span style={{ opacity: 0.85 }}>Punta a terra e premi il grilletto per teletrasportarti</span>
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
    </>
  );
}
