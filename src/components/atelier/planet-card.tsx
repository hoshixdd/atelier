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
  const work = getWork(slug ?? "");
  if (!work) return null;

  return (
    <aside
      data-letter
      className="pointer-events-auto fixed inset-x-4 bottom-24 z-20 overflow-hidden border border-line bg-void/80 backdrop-blur-md md:inset-x-auto md:bottom-10 md:left-1/2 md:w-[min(36rem,calc(100vw-3rem))] md:-translate-x-1/2"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <button
        type="button"
        onClick={() => flyToRoom(work.slug)}
        onPointerEnter={() => sound.hover()}
        className="grid w-full grid-cols-[7rem_1fr] text-left sm:grid-cols-[10rem_1fr]"
      >
        <div className="aspect-4/5 overflow-hidden bg-fog sm:aspect-square">
          <img src={work.image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-end p-4 sm:p-6">
          <p className="kicker">
            {work.index} · {work.year} · {work.short}
          </p>
          <h2 className="mt-2 font-display text-3xl leading-none sm:text-4xl">{work.title}</h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-bone/80">{work.thesis}</p>
          <p className="mt-4 text-[10px] tracking-[0.28em] text-mute uppercase">Enter the room</p>
        </div>
      </button>
    </aside>
  );
}
