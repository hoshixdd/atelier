import { createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/atelier/page-frame";
import { SplitTitle } from "@/components/atelier/reveal";
import { useSceneMode } from "@/components/atelier/use-scene-mode";
import { useAtelier } from "@/store/atelier";

export const Route = createFileRoute("/work/")({ component: WorkIndex });

function WorkIndex() {
  useSceneMode("work");
  const entered = useAtelier((s) => s.entered);
  return (
    <PageFrame className="pointer-events-none">
      <p className="kicker">Archive</p>
      <h1 className="mt-6 font-display text-6xl sm:text-8xl">
        {entered ? <SplitTitle text="Work" /> : "Work"}
      </h1>
      <p className="mt-6 max-w-lg text-sm leading-relaxed text-mute">
        The rooms are in the sky. Touch a named world. The still only appears when you
        do.
      </p>
    </PageFrame>
  );
}
