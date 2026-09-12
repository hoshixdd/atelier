import { Link } from "@tanstack/react-router";
import { useSceneMode } from "./use-scene-mode";
import { StarMark } from "./star-mark";

export function LostRoom() {
  useSceneMode("lost");
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-6 pb-24 pt-28 text-center">
      <StarMark className="mb-8 size-8 opacity-40" />
      <p className="kicker mb-6">404</p>
      <h1 className="font-display text-5xl italic sm:text-7xl">This room is unlit.</h1>
      <p className="mt-6 max-w-md text-sm leading-relaxed text-mute">
        The coordinate you asked for is not in the archive. The star is still here. Home is
        closer than it looks.
      </p>
      <Link
        to="/"
        className="mt-12 min-h-11 border border-line px-8 py-3 text-xs tracking-widest uppercase hover:bg-bone hover:text-void"
      >
        Return to the atelier
      </Link>
    </main>
  );
}
