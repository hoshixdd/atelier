import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { enableGyro } from "@/lib/gyro";
import { sound } from "@/lib/sound";
import { useAtelier } from "@/store/atelier";
import { StarMark } from "./star-mark";
import { SplitTitle } from "./reveal";

export function Loader() {
  const entered = useAtelier((s) => s.entered);
  const setEntered = useAtelier((s) => s.setEntered);
  const setSoundOn = useAtelier((s) => s.setSoundOn);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState(1);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("hoshii-entered-v2") === "1") {
        setEntered(true);
        return;
      }
    } catch {
      /* private mode */
    }
    const t2 = window.setTimeout(() => setPhase(2), 500);
    const t3 = window.setTimeout(() => setReady(true), 1400);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(100, Math.round(((now - start) / 1400) * 100));
      setPct(p);
      if (p < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      cancelAnimationFrame(raf);
    };
  }, [setEntered]);

  async function enter(withSound: boolean) {
    if (useAtelier.getState().entered) return;
    await sound.unlock();
    if (withSound) {
      sound.setEnabled(true);
      setSoundOn(true);
      sound.enter();
    }
    if (window.matchMedia("(pointer: coarse)").matches) {
      void enableGyro().then((ok) => {
        if (ok) {
          useAtelier.getState().setNotice("Tilt to look");
          window.setTimeout(() => useAtelier.getState().setNotice(null), 2200);
        }
      });
    }
    setEntered(true);
    try {
      sessionStorage.setItem("hoshii-entered-v2", "1");
    } catch {
      /* private mode */
    }
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!quiet) {
      const s = useAtelier.getState();
      s.setIntroPlaying(true);
      s.setLetterboxOn(true);
      s.setSlugline("FADE IN:");
      window.setTimeout(() => useAtelier.getState().setSlugline("TITLE CARD — HOSHIIXDD"), 900);
      window.setTimeout(() => useAtelier.getState().setSlugline("INT. THE BELT — CONTINUOUS"), 2800);
      window.setTimeout(() => useAtelier.getState().setSlugline(null), 5200);
      window.setTimeout(() => {
        useAtelier.getState().setIntroPlaying(false);
        useAtelier.getState().setLetterboxOn(false);
      }, 7200);
    }
  }

  if (entered) return null;

  return (
    <div className="fixed inset-0 z-loader flex flex-col items-center justify-center bg-void px-5 text-bone" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="scanline opacity-60" />
      <div
        className="mb-10 transition-all duration-700"
        style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "scale(1)" : "scale(0.6)",
        }}
      >
        <StarMark className="size-10 animate-pulse" />
      </div>
      <p className="kicker mb-6">Calibration · {String(pct).padStart(3, "0")}</p>
      <h1 className="font-display text-5xl tracking-tight sm:text-7xl">
        <SplitTitle text={SITE.name} />
      </h1>
      <p
        className="mt-4 text-sm text-mute"
        style={{
          opacity: phase >= 2 ? 1 : 0,
          transition: "opacity 700ms ease",
        }}
      >
        {SITE.role}
      </p>
      <button
        type="button"
        disabled={!ready}
        onClick={() => void enter(true)}
        data-magnetic
        className="mt-14 w-full max-w-xs min-h-12 border border-line px-8 py-3 text-xs tracking-widest uppercase transition-colors duration-200 hover:bg-bone hover:text-void disabled:opacity-30 active:scale-[0.96]"
      >
        Enter the atelier
      </button>
      <button
        type="button"
        onClick={() => void enter(false)}
        className="mt-3 min-h-12 w-full max-w-xs text-xs tracking-widest text-mute uppercase"
      >
        Enter silently
      </button>
      <div className="absolute inset-x-0 bottom-0 h-px bg-line" aria-hidden="true">
        <div className="h-full bg-bone transition-[width] duration-100" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
