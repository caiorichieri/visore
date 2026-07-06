import { useEffect, useState } from "react";
import { Monitor, Sparkles } from "lucide-react";

export default function WelcomeScreen({ onEnterDesktop, onEnterVR }) {
  const [xrSupported, setXrSupported] = useState(null);

  useEffect(() => {
    if (navigator.xr?.isSessionSupported) {
      navigator.xr
        .isSessionSupported("immersive-vr")
        .then(setXrSupported)
        .catch(() => setXrSupported(false));
    } else {
      setXrSupported(false);
    }
  }, []);

  return (
    <div className="pk-welcome" data-testid="welcome-screen">
      <div className="pk-welcome-bg" />
      <div className="pk-welcome-veil" />

      <div className="pk-welcome-content">
        {/* Top bar */}
        <header className="flex items-center justify-between rise">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background:
                  "radial-gradient(circle at 30% 30%, #f6c67a 0%, #7fb069 65%, #2c4a30 100%)",
                boxShadow: "0 0 24px rgba(127, 176, 105, 0.4)",
              }}
              aria-hidden
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(245, 239, 228, 0.75)",
              }}
            >
              Parco · WebXR
            </span>
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(245, 239, 228, 0.55)",
            }}
          >
            {xrSupported === true
              ? "· VR disponibile"
              : xrSupported === false
              ? "· VR non rilevato"
              : "· Verifica supporto VR"}
          </div>
        </header>

        {/* Hero */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 32,
            maxWidth: 780,
          }}
        >
          <div
            className="rise delay-1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              alignSelf: "flex-start",
              padding: "8px 16px",
              borderRadius: 999,
              background: "rgba(245, 239, 228, 0.08)",
              border: "1px solid rgba(245, 239, 228, 0.18)",
              backdropFilter: "blur(10px)",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(245, 239, 228, 0.85)",
            }}
          >
            <Sparkles size={14} strokeWidth={1.5} />
            Un giardino tra due mondi
          </div>

          <h1
            className="serif rise delay-2"
            style={{
              fontSize: "clamp(56px, 9vw, 132px)",
              lineHeight: 0.92,
              margin: 0,
              color: "#f5efe4",
              fontWeight: 400,
            }}
          >
            Cammina nel <em style={{ color: "#f6c67a" }}>parco</em>
            <br />
            respira il <em style={{ color: "#7fb069" }}>silenzio</em>.
          </h1>

          <p
            className="rise delay-3"
            style={{
              maxWidth: 520,
              fontSize: 17,
              lineHeight: 1.55,
              color: "rgba(245, 239, 228, 0.75)",
              margin: 0,
            }}
            data-testid="welcome-description"
          >
            Un&apos;esperienza immersiva costruita interamente nel browser.
            Indossa il visore o esplora con mouse e tastiera. Trova la panchina,
            siediti, ascolta il vento tra gli alberi.
          </p>

          <div
            className="rise delay-4"
            style={{ display: "flex", gap: 14, flexWrap: "wrap" }}
          >
            <button
              onClick={onEnterVR}
              className="pk-hero-btn"
              data-testid="enter-vr-button"
              aria-label="Entra in modalità VR"
            >
              <span className="dot" />
              Entra in VR
            </button>
            <button
              onClick={onEnterDesktop}
              className="pk-hero-btn ghost"
              data-testid="enter-desktop-button"
              aria-label="Esplora sul desktop"
            >
              <Monitor size={16} strokeWidth={1.7} />
              Esplora sul desktop
            </button>
          </div>
        </section>

        {/* Bottom instructions */}
        <footer
          className="rise delay-4"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 24,
            paddingTop: 20,
            borderTop: "1px solid rgba(245, 239, 228, 0.14)",
          }}
        >
          {[
            {
              n: "01",
              t: "Muoviti",
              d: "WASD sul desktop · teletrasporto con i controller VR.",
            },
            {
              n: "02",
              t: "Guarda",
              d: "Mouse per orientarti · gira semplicemente la testa in VR.",
            },
            {
              n: "03",
              t: "Siediti",
              d: "Avvicinati alla panchina di legno e premi il grilletto o il tasto E.",
            },
          ].map((item) => (
            <div key={item.n} data-testid={`welcome-step-${item.n}`}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  color: "rgba(245, 239, 228, 0.45)",
                }}
              >
                {item.n}
              </div>
              <div
                className="serif"
                style={{
                  fontSize: 22,
                  color: "#f5efe4",
                  marginTop: 6,
                  marginBottom: 8,
                }}
              >
                {item.t}
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: "rgba(245, 239, 228, 0.65)",
                }}
              >
                {item.d}
              </div>
            </div>
          ))}
        </footer>
      </div>
    </div>
  );
}
