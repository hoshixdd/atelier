import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { PageFrame } from "@/components/atelier/page-frame";
import { Reveal, SplitTitle } from "@/components/atelier/reveal";
import { useSceneMode } from "@/components/atelier/use-scene-mode";
import { useAtelier } from "@/store/atelier";

export const Route = createFileRoute("/notes")({ component: Notes });

function Notes() {
  useSceneMode("notes");
  const entered = useAtelier((s) => s.entered);

  return (
    <PageFrame>
      <p className="kicker">A point of view</p>
      <h1 className="mt-6 font-display text-6xl sm:text-8xl">
        {entered ? <SplitTitle text="Systems you can feel" /> : "Systems you can feel"}
      </h1>
      <p className="mt-6 max-w-xl text-sm text-mute">
        {SITE.person} · {SITE.location} · {SITE.since}—
      </p>

      <div className="mt-16 max-w-2xl space-y-8 text-base leading-relaxed text-bone/90">
        <Reveal>
          <p>
            Software is usually asked to disappear. I ask it to occupy a room. A teacher
            workspace should feel like a desk. A confession should feel like a letter you
            can walk through. A canteen ledger should feel like noon in Manila — stock,
            money, names — not a dashboard pretending to be a place.
          </p>
        </Reveal>
        <Reveal delay={60}>
          <p>
            Motion is not decoration. If the type does not sit, if the camera does not
            land, if the sound does not duck when you leave a world, the system is lying
            about how it was made. I would rather ship three rooms that behave than thirty
            pages that wait.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <p>
            I will not flatten intimacy into a template. I will not treat money as
            client-side theatre. I will not call a model a product when the pipeline is
            still a sample. The unnamed planets in this atelier are the work I have not
            named yet — kept in orbit so the list does not become the practice.
          </p>
        </Reveal>
        <Reveal delay={140}>
          <p className="font-display text-2xl italic text-bone">
            Build the room. Then let people enter it.
          </p>
        </Reveal>
      </div>

      <Link
        to="/contact"
        className="mt-16 inline-flex min-h-12 items-center border border-line px-6 text-xs tracking-widest uppercase hover:bg-bone hover:text-void"
      >
        Send a signal
      </Link>
    </PageFrame>
  );
}
