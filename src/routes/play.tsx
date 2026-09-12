import { createFileRoute, Link } from "@tanstack/react-router";
import { useSceneMode } from "@/components/atelier/use-scene-mode";
import { useAtelier } from "@/store/atelier";

export const Route = createFileRoute("/play")({ component: Play });

function Play() {
  useSceneMode("play");
  const harvested = useAtelier((s) => s.harvested);
  const need = useAtelier((s) => s.harvestNeed);
  const novas = useAtelier((s) => s.novas);
  const isTouch = useAtelier((s) => s.isTouch);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none fixed inset-x-0 top-24 z-10 px-6 text-center md:top-28">
        <p className="kicker">Session</p>
        <h1 className="mt-3 font-display text-5xl sm:text-7xl">Harvest</h1>
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-10 px-6 pb-safe text-center md:bottom-10">
        <p className="font-display text-3xl tabular-nums">
          {String(harvested).padStart(2, "0")}
          <span className="text-mute"> / {String(need).padStart(2, "0")}</span>
        </p>
        <p className="mt-2 text-xs tracking-widest text-mute uppercase">
          {novas === 0 ? "No nova yet" : `${novas} nova${novas === 1 ? "" : "s"}`}
          {" · "}
          {isTouch ? "Drag to orbit · tap a shard" : "Drag to orbit · click a shard · scroll to pull"}
        </p>
        <p className="mt-4 text-xs tracking-widest text-mute uppercase">
          <Link to="/lab" className="pointer-events-auto hover:text-bone">
            Lab
          </Link>
          {" · "}
          <Link to="/work" className="pointer-events-auto hover:text-bone">
            Work
          </Link>
        </p>
      </div>
    </div>
  );
}
