import { useRef, type PointerEvent, type ReactNode } from "react";
import { flyToRoom } from "@/lib/director";
import type { Work } from "@/lib/works";

export function SwipeRoom({
  prev,
  next,
  children,
}: {
  prev?: Work;
  next?: Work;
  children: ReactNode;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const dx = useRef(0);
  const wrap = useRef<HTMLDivElement>(null);

  function down(e: PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a, button, input, textarea, select")) return;
    start.current = { x: e.clientX, y: e.clientY };
    dx.current = 0;
  }

  function move(e: PointerEvent<HTMLDivElement>) {
    if (!start.current) return;
    const mx = e.clientX - start.current.x;
    const my = e.clientY - start.current.y;
    if (Math.abs(mx) < Math.abs(my)) return;
    dx.current = mx;
    if (wrap.current) wrap.current.style.transform = `translateX(${mx * 0.18}px)`;
  }

  function up() {
    const d = dx.current;
    start.current = null;
    dx.current = 0;
    if (wrap.current) wrap.current.style.transform = "";
    if (d < -72 && next) {
      flyToRoom(next.slug);
    } else if (d > 72 && prev) {
      flyToRoom(prev.slug);
    }
  }

  return (
    <div
      ref={wrap}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className="transition-transform duration-300"
    >
      {children}
      <p className="mt-8 text-center text-xs tracking-widest text-mute uppercase md:hidden">
        Swipe for the next world
      </p>
    </div>
  );
}
