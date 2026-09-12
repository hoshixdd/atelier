import { useEffect, useRef } from "react";
import { useAtelier } from "@/store/atelier";

export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const coords = useRef<HTMLDivElement>(null);
  const magEl = useRef<HTMLElement | null>(null);
  const isTouch = useAtelier((s) => s.isTouch);
  const entered = useAtelier((s) => s.entered);
  const hoverLabel = useAtelier((s) => s.hoverLabel);

  useEffect(() => {
    if (isTouch || !entered) return;
    document.documentElement.classList.add("cursor-hide");
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const lag = { x: pos.x, y: pos.y };
    let raf = 0;
    let interacting = false;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const target = e.target as HTMLElement | null;
      interacting = Boolean(
        target?.closest("a, button, [data-magnetic], input, textarea"),
      );
      const nextMag = (target?.closest("[data-magnetic]") as HTMLElement | null) ?? null;
      if (magEl.current && magEl.current !== nextMag) {
        magEl.current.style.transform = "";
        magEl.current.style.transition = "transform 280ms cubic-bezier(0.16,1,0.3,1)";
      }
      magEl.current = nextMag;
      if (nextMag) {
        const r = nextMag.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        nextMag.style.transition = "transform 80ms linear";
        nextMag.style.transform = `translate(${dx * 0.22}px, ${dy * 0.22}px)`;
      }
      if (dot.current) {
        dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
      }
      if (coords.current) {
        const nx = (pos.x / window.innerWidth).toFixed(3);
        const ny = (pos.y / window.innerHeight).toFixed(3);
        coords.current.textContent = `${nx}  ${ny}`;
        coords.current.style.transform = `translate(${pos.x + 18}px, ${pos.y - 18}px)`;
      }
    };

    const loop = () => {
      lag.x += (pos.x - lag.x) * 0.16;
      lag.y += (pos.y - lag.y) * 0.16;
      if (ring.current) {
        const s = interacting ? 1.85 : 1;
        ring.current.style.transform = `translate(${lag.x}px, ${lag.y}px) translate(-50%, -50%) scale(${s})`;
        ring.current.style.opacity = interacting ? "0.95" : "0.5";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.documentElement.classList.remove("cursor-hide");
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      if (magEl.current) magEl.current.style.transform = "";
    };
  }, [isTouch, entered]);

  if (isTouch || !entered) return null;

  return (
    <>
      <div
        ref={ring}
        className="pointer-events-none fixed top-0 left-0 z-cursor size-10 rounded-full border border-bone mix-blend-difference"
      />
      <div
        ref={dot}
        className="pointer-events-none fixed top-0 left-0 z-cursor size-1 rounded-full bg-bone mix-blend-difference"
      />
      <div
        ref={coords}
        className="pointer-events-none fixed top-0 left-0 z-cursor font-sans text-xs tabular-nums tracking-widest text-mute mix-blend-difference"
      />
      {hoverLabel ? (
        <div className="pointer-events-none fixed bottom-8 left-1/2 z-cursor -translate-x-1/2 font-display text-lg italic text-bone mix-blend-difference">
          {hoverLabel}
        </div>
      ) : null}
    </>
  );
}
