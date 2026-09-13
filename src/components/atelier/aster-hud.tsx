import { ASTER_FIGURES } from "@/lib/constellations";
import { useAtelier } from "@/store/atelier";

export function AsterHud() {
  const found = useAtelier((s) => s.asterFound);
  const mode = useAtelier((s) => s.sceneMode);
  const entered = useAtelier((s) => s.entered);
  const intro = useAtelier((s) => s.introPlaying);
  if (!entered || intro || (mode !== "home" && mode !== "work")) return null;
  const last = ASTER_FIGURES.find((f) => f.id === found[found.length - 1]);
  return (
    <div className="pointer-events-none fixed top-[max(5.5rem,calc(env(safe-area-inset-top)+4.2rem))] left-5 z-20 max-w-[14rem] md:left-8">
      <p className="kicker">
        Sky · {String(found.length).padStart(2, "0")} / {String(ASTER_FIGURES.length).padStart(2, "0")}
      </p>
      {last ? (
        <>
          <p className="mt-2 font-display text-3xl italic leading-none">{last.name}</p>
          <p className="mt-2 text-[10px] leading-relaxed tracking-wide text-bone/75">
            {ASTER_FIGURES.filter((f) => found.includes(f.id))
              .map((f) => f.name)
              .join(" · ")}
          </p>
        </>
      ) : (
        <p className="mt-2 text-[10px] leading-relaxed tracking-wide text-bone/70">
          Tap a bright star, then another. Lines stay. A name when the figure closes.
        </p>
      )}
    </div>
  );
}
