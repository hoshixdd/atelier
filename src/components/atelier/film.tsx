import { useEffect, useState } from "react";
import { useAtelier } from "@/store/atelier";

export function Letterbox() {
  const entered = useAtelier((s) => s.entered);
  const on = useAtelier((s) => s.letterboxOn);
  const intro = useAtelier((s) => s.introPlaying);
  const tall = on || intro;
  if (!entered) return null;
  return (
    <>
      <div className={`letterbox top ${tall ? "deep" : "film"}`} aria-hidden="true" />
      <div className={`letterbox bot ${tall ? "deep" : "film"}`} aria-hidden="true" />
      <Timecode />
    </>
  );
}

function Timecode() {
  const entered = useAtelier((s) => s.entered);
  const [t, setT] = useState("01:00:00:00");
  useEffect(() => {
    if (!entered) return;
    const start = performance.now();
    const tick = () => {
      const ms = performance.now() - start;
      const frames = Math.floor((ms / 1000) * 24);
      const f = frames % 24;
      const sec = Math.floor(frames / 24) % 60;
      const min = Math.floor(frames / 24 / 60) % 60;
      const hr = 1 + Math.floor(frames / 24 / 60 / 60);
      const p = (n: number) => String(n).padStart(2, "0");
      setT(`${p(hr)}:${p(min)}:${p(sec)}:${p(f)}`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [entered]);
  return (
    <p className="pointer-events-none fixed bottom-14 left-1/2 z-[11] hidden -translate-x-1/2 font-mono text-[9px] tracking-[0.35em] text-bone/80 md:bottom-1 md:block" style={{ textShadow: "0 1px 2px #000" }}>
      HOSHIIXDD · {t}
    </p>
  );
}

export function Slugline() {
  const line = useAtelier((s) => s.slugline);
  if (!line) return null;
  return (
    <p className="slugline" role="status">
      {line}
    </p>
  );
}

export function FlyShot() {
  const fly = useAtelier((s) => s.fly);
  const setFly = useAtelier((s) => s.setFly);
  const [to, setTo] = useState(false);
  useEffect(() => {
    if (!fly) {
      setTo(false);
      return;
    }
    const a = window.setTimeout(() => setTo(true), 30);
    const b = window.setTimeout(() => setFly(null), 920);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [fly, setFly]);
  if (!fly) return null;
  const dest = destRect();
  return (
    <img
      src={fly.src}
      alt=""
      className="pointer-events-none fixed z-[55] object-cover"
      style={{
        left: to ? dest.x : fly.x,
        top: to ? dest.y : fly.y,
        width: to ? dest.w : fly.w,
        height: to ? dest.h : fly.h,
        opacity: to ? 0.35 : 1,
        transition:
          "left 820ms cubic-bezier(0.2,0,0,1), top 820ms cubic-bezier(0.2,0,0,1), width 820ms cubic-bezier(0.2,0,0,1), height 820ms cubic-bezier(0.2,0,0,1), opacity 820ms cubic-bezier(0.2,0,0,1)",
      }}
    />
  );
}

function destRect() {
  const w = Math.min(window.innerWidth - 40, 1100);
  const h = w * (9 / 16);
  return {
    x: (window.innerWidth - w) / 2,
    y: Math.max(96, window.innerHeight * 0.18),
    w,
    h,
  };
}
