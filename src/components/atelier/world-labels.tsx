import { flyToRoom } from "@/lib/director";
import { sound } from "@/lib/sound";
import { useAtelier } from "@/store/atelier";

export function WorldLabels() {
  const labels = useAtelier((s) => s.labels);
  const introPlaying = useAtelier((s) => s.introPlaying);
  const entered = useAtelier((s) => s.entered);
  const mode = useAtelier((s) => s.sceneMode);
  const pending = useAtelier((s) => s.pendingSlug);
  const focus = useAtelier((s) => s.focusSlug);
  if (!entered || introPlaying || pending || (mode !== "home" && mode !== "work")) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[8]">
      {labels.map((l) => {
        const on = focus === l.id;
        return (
          <button
            key={l.id}
            type="button"
            aria-label={`Enter ${l.title}`}
            onPointerEnter={() => {
              useAtelier.getState().setFocusSlug(l.id);
              sound.hover();
            }}
            onClick={() => {
              const s = useAtelier.getState();
              if (s.isTouch && s.focusSlug !== l.id) {
                s.setFocusSlug(l.id);
                sound.hover();
                return;
              }
              flyToRoom(l.id);
            }}
            className="pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${l.x}%`, top: `${l.y}%` }}
          >
            <span className="size-20 rounded-full md:size-24" />
            <span
              className={`mt-1 max-w-[9rem] text-center text-[10px] font-medium tracking-[0.18em] uppercase md:hidden ${on ? "text-bone" : "text-bone/85"}`}
              style={{ textShadow: "0 1px 2px #000, 0 0 12px #000" }}
            >
              {l.index} · {l.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
