import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { useSceneMode } from "@/components/atelier/use-scene-mode";
import { SplitTitle } from "@/components/atelier/reveal";
import { useAtelier } from "@/store/atelier";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  useSceneMode("home");
  const entered = useAtelier((s) => s.entered);
  const intro = useAtelier((s) => s.introPlaying);

  return (
    <main className="page-shot pointer-events-none">
      <section className="relative flex min-h-dvh flex-col justify-end px-5 pb-28 pt-28 sm:px-10 lg:px-16">
        {intro || !entered ? (
          <>
            <p className="kicker">A film by {SITE.person} · {SITE.location}</p>
            <h1 className="glitch mt-6 font-display text-6xl leading-none tracking-tight sm:text-8xl lg:text-9xl">
              {entered ? <SplitTitle text={SITE.name} /> : SITE.name}
            </h1>
            <p className="mt-8 font-display text-2xl italic text-bone/90">{SITE.tagline}</p>
          </>
        ) : (
          <p className="kicker mb-2">Touch a named world · unnamed worlds keep letters</p>
        )}
      </section>
    </main>
  );
}
