import { flyToRoom } from "@/lib/director";
import { sound } from "@/lib/sound";
import { useAtelier } from "@/store/atelier";

export function WorldLabels() {
  const labels = useAtelier((s) => s.labels);
  const introPlaying = useAtelier((s) => s.introPlaying);
  const entered = useAtelier((s) => s.entered);
  const mode = useAtelier((s) => s.sceneMode);
  const pending = useAtelier((s) => s.pendingSlug);
  if (!entered || introPlaying || pending || (mode !== "home" && mode !== "work")) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[8]">
      {labels.map((l) => (
        <button
          key={l.id}
          type="button"
          aria-label={`Enter ${l.title}`}
          onPointerEnter={() => {
            useAtelier.getState().setFocusSlug(l.id);
            sound.hover();
          }}
          onClick={() => flyToRoom(l.id)}
          className="pointer-events-auto absolute size-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ left: `${l.x}%`, top: `${l.y}%` }}
        />
      ))}
    </div>
  );
}
