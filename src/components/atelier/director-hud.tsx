import { useRouterState } from "@tanstack/react-router";
import { dayPart, dayPartLabel } from "@/lib/ceb";
import { sluglineFor } from "@/lib/director";
import { useAtelier } from "@/store/atelier";

export function DirectorHud() {
  const on = useAtelier((s) => s.directorOn);
  const camZ = useAtelier((s) => s.camZ);
  const camFov = useAtelier((s) => s.camFov);
  const sceneMode = useAtelier((s) => s.sceneMode);
  const hour = useAtelier((s) => s.hour);
  const take = useAtelier((s) => s.take);
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (!on) return null;
  const p = (n: number, d = 2) => n.toFixed(d);
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[70] font-mono text-[10px] tracking-[0.18em] text-bone/80 mix-blend-difference"
      aria-hidden="true"
    >
      <p className="absolute top-[max(4.5rem,calc(env(safe-area-inset-top)+3.2rem))] left-5">
        CAM {p(camZ)}m · FOV {p(camFov, 0)}° · {sceneMode.toUpperCase()}
      </p>
      <p className="absolute top-[max(4.5rem,calc(env(safe-area-inset-top)+3.2rem))] right-5 text-right">
        TAKE {String(take).padStart(3, "0")} · {dayPartLabel(dayPart(hour)).toUpperCase()}
      </p>
      <p className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center md:bottom-8">
        {sluglineFor(path)}
      </p>
      <span className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 border border-bone/40" />
    </div>
  );
}
