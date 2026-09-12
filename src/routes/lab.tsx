import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { SITE } from "@/lib/site";
import { sound } from "@/lib/sound";
import { PageFrame } from "@/components/atelier/page-frame";
import { SplitTitle } from "@/components/atelier/reveal";
import { useSceneMode } from "@/components/atelier/use-scene-mode";
import { useAtelier } from "@/store/atelier";

export const Route = createFileRoute("/lab")({ component: Lab });

function Lab() {
  useSceneMode("lab");
  const entered = useAtelier((s) => s.entered);
  const novas = useAtelier((s) => s.novas);
  return (
    <PageFrame>
      <p className="kicker">Instruments</p>
      <h1 className="mt-6 font-display text-6xl sm:text-8xl">
        {entered ? <SplitTitle text="Lab" /> : "Lab"}
      </h1>
      <p className="mt-6 max-w-lg text-sm leading-relaxed text-mute">
        Toys for the hand. Sound, if you armed it at the door, follows. Keys 1–8 play
        the remnant from anywhere. Harvest novas to open the fourth.
      </p>
      <div className="mt-16 grid gap-8 lg:grid-cols-2">
        <Constellation />
        <TypePress />
        <div className="lg:col-span-2">
          <SignalPad />
        </div>
        <div className="lg:col-span-2">
          {novas >= 3 ? (
            <Harmonic novas={novas} />
          ) : (
            <div className="border border-line bg-fog/80 p-5">
              <p className="kicker">04 · Harmonic · locked</p>
              <p className="mt-2 text-sm text-mute">
                Harvest three novas in Play. The remnant will remember ({novas}/3).
              </p>
            </div>
          )}
        </div>
      </div>
    </PageFrame>
  );
}

function Constellation() {
  const ref = useRef<HTMLCanvasElement>(null);
  const stars = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * window.devicePixelRatio;
      canvas.height = r.height * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      draw();
    };
    const draw = () => {
      const r = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      ctx.strokeStyle = "rgba(237,234,227,0.28)";
      ctx.fillStyle = "#edeae3";
      ctx.lineWidth = 1;
      const pts = stars.current;
      for (let i = 0; i < pts.length; i++) {
        let nearest = -1;
        let dMin = 140;
        for (let j = 0; j < pts.length; j++) {
          if (i === j) continue;
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < dMin) {
            dMin = d;
            nearest = j;
          }
        }
        if (nearest >= 0) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[nearest].x, pts[nearest].y);
          ctx.stroke();
        }
      }
      pts.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  function addStar(e: PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    stars.current = [
      ...stars.current,
      { x: e.clientX - rect.left, y: e.clientY - rect.top },
    ].slice(-48);
    sound.hover();
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const r = e.currentTarget.getBoundingClientRect();
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, r.width, r.height);
    const pts = stars.current;
    ctx.strokeStyle = "rgba(237,234,227,0.28)";
    ctx.fillStyle = "#edeae3";
    for (let i = 0; i < pts.length; i++) {
      let nearest = -1;
      let dMin = 140;
      for (let j = 0; j < pts.length; j++) {
        if (i === j) continue;
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < dMin) {
          dMin = d;
          nearest = j;
        }
      }
      if (nearest >= 0) {
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[nearest].x, pts[nearest].y);
        ctx.stroke();
      }
    }
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  return (
    <div className="border border-line bg-fog/80 p-5">
      <p className="kicker">01 · Constellation</p>
      <p className="mt-2 text-sm text-mute">Tap to place stars. They find each other.</p>
      <canvas
        ref={ref}
        onPointerDown={addStar}
        className="mt-5 h-72 w-full bg-fog touch-none"
        aria-label="Constellation canvas. Tap to place a star."
      />
    </div>
  );
}

function TypePress() {
  const word = SITE.name.split("");
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="border border-line bg-fog/80 p-5">
      <p className="kicker">02 · Type press</p>
      <p className="mt-2 text-sm text-mute">Press a glyph. It leaves its seat.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-1">
        {word.map((ch, i) => (
          <button
            key={i}
            type="button"
            onPointerEnter={() => {
              setActive(i);
              sound.hover();
            }}
            onPointerLeave={() => setActive(null)}
            onPointerDown={() => {
              setActive(i);
              sound.click();
            }}
            className="font-display min-h-12 min-w-10 text-4xl sm:text-5xl active:scale-[0.96]"
            style={{
              transform:
                active === i ? "translateY(-18px) rotate(-8deg)" : "none",
              transition: "transform 220ms cubic-bezier(0.2,0,0,1)",
            }}
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  );
}

function SignalPad() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });

  function at(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    setPos({ x, y });
    sound.setFilter(x);
  }

  return (
    <div className="border border-line bg-fog/80 p-5">
      <p className="kicker">03 · Signal pad</p>
      <p className="mt-2 text-sm text-mute">
        Drag to open the ambient filter. Horizontal is brightness of the drone.
      </p>
      <div
        ref={ref}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          at(e);
          sound.click();
        }}
        onPointerMove={(e) => {
          if (e.buttons) at(e);
        }}
        className="relative mt-5 h-56 w-full touch-none bg-fog sm:h-48"
      >
        <div
          className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-bone"
          style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
        />
        <span className="pointer-events-none absolute bottom-3 left-3 text-xs tabular-nums tracking-widest text-mute">
          {pos.x.toFixed(2)} · {pos.y.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function Harmonic({ novas }: { novas: number }) {
  const notes = [110, 146.83, 164.81, 220, 329.63];
  return (
    <div className="border border-line bg-fog/80 p-5">
      <p className="kicker">04 · Harmonic · unlocked</p>
      <p className="mt-2 text-sm text-mute">
        {novas} nova{novas === 1 ? "" : "s"} remembered. Press a tone. The remnant
        answers in fifths.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        {notes.map((f, i) => (
          <button
            key={f}
            type="button"
            onPointerEnter={() => sound.hover()}
            onClick={() => sound.tone(f)}
            className="min-h-16 min-w-16 flex-1 border border-line text-xs tracking-widest uppercase hover:bg-bone hover:text-void active:scale-[0.96]"
          >
            0{i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
