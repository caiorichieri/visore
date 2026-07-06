import { useState, useMemo, Suspense, lazy } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import { createXRStore } from "@react-three/xr";

const ParkExperience = lazy(() => import("@/components/park/ParkExperience"));

export default function Home() {
  const [mode, setMode] = useState("welcome"); // welcome | desktop | vr

  // Single XR store shared between welcome (VR button) and experience
  const xrStore = useMemo(
    () =>
      createXRStore({
        offerSession: "immersive-vr",
        controller: { teleportPointer: true },
        hand: { teleportPointer: true },
        emulate: false,
      }),
    []
  );

  const enterDesktop = () => setMode("desktop");
  const enterVR = () => {
    setMode("vr");
    // slight delay so the Canvas mounts before requesting session
    setTimeout(() => {
      try {
        xrStore.enterVR();
      } catch (e) {
        console.warn("VR not available:", e);
      }
    }, 150);
  };
  const exitPark = () => {
    try {
      if (document.pointerLockElement) document.exitPointerLock();
    } catch { /* noop */ }
    setMode("welcome");
  };

  return (
    <div className="grain" data-testid="home-root">
      {mode === "welcome" && (
        <WelcomeScreen onEnterDesktop={enterDesktop} onEnterVR={enterVR} />
      )}

      {mode !== "welcome" && (
        <Suspense
          fallback={
            <div className="pk-loading" data-testid="park-loading">
              <div className="pk-spinner" />
              <span className="serif" style={{ fontSize: 22 }}>
                Il parco si sta risvegliando…
              </span>
            </div>
          }
        >
          <ParkExperience mode={mode} xrStore={xrStore} onExit={exitPark} />
        </Suspense>
      )}
    </div>
  );
}
