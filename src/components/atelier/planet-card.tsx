import { flyToRoom } from "@/lib/director";
import { getWork } from "@/lib/works";
import { sound } from "@/lib/sound";
import { useAtelier } from "@/store/atelier";

export function PlanetCard() {
  const slug = useAtelier((s) => s.focusSlug);
  const mode = useAtelier((s) => s.sceneMode);
  const pending = useAtelier((s) => s.pendingSlug);
  const intro = useAtelier((s) => s.introPlaying);
  if (intro || pending || (mode !== "home" && mode !== "work")) return null;
  if (slug === "remnant") return null;
  const work = getWork(slug ?? "");
  if (!work) return null;

  return (
    <aside
      data-letter
      className="pointer-events-auto fixed inset-x-3 z-20 overflow-hidden border border-line bg-void/94 backdrop-blur-md max-md:bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-10 md:left-1/2 md:w-[min(36rem,calc(100vw-3rem))] md:-translate-x-1/2"
    >
      <button
        type="button"
        onClick={() => flyToRoom(work.slug)}
        onPointerEnter={() => sound.hover()}
        className="grid w-full grid-cols-[5.5rem_1fr] text-left sm:grid-cols-[10rem_1fr] md:grid-cols-[10rem_1fr]"
      >
        <div className="aspect-square overflow-hidden bg-fog sm:aspect-square">
          <img src={work.image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-end p-3 sm:p-6">
          <p className="kicker">
            {work.index} · {work.year} · {work.short}
          </p>
          <h2 className="mt-1 font-display text-2xl leading-none sm:text-4xl">{work.title}</h2>
          <p className="mt-2 hidden max-w-sm text-sm leading-relaxed text-bone/90 sm:block">{work.thesis}</p>
          <p className="mt-3 text-[10px] tracking-[0.28em] text-bone/70 uppercase">
            <span className="md:hidden">Tap to enter</span>
            <span className="hidden md:inline">Enter the room</span>
          </p>
        </div>
      </button>
    </aside>
  );
}
