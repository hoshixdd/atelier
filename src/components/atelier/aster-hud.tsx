import { ASTER_FIGURES } from "@/lib/constellations";
import { useAtelier } from "@/store/atelier";

export function AsterHud() {
  const found = useAtelier((s) => s.asterFound);
  const mode = useAtelier((s) => s.sceneMode);
  const entered = useAtelier((s) => s.entered);
  const intro = useAtelier((s) => s.introPlaying);
  if (!entered || intro || (mode !== "home" && mode !== "work")) return null;
  return (
    <div className="pointer-events-none fixed top-[max(5.5rem,calc(env(safe-area-inset-top)+4.2rem))] left-5 z-20 md:left-8">
      <p className="kicker">
        Sky · {String(found.length).padStart(2, "0")} / {String(ASTER_FIGURES.length).padStart(2, "0")}
      </p>
      {found.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {ASTER_FIGURES.filter((f) => found.includes(f.id)).map((f) => (
            <li key={f.id} className="font-display text-xl italic text-bone">
              {f.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 max-w-[12rem] text-[10px] leading-relaxed tracking-wide text-bone/70">
          Tap a bright star, then another. Lines stay. A name when the figure closes.
        </p>
      )}
    </div>
  );
}
