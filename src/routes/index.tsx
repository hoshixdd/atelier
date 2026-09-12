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
      <section className="relative flex min-h-dvh flex-col justify-end px-5 pb-36 pt-24 sm:px-10 sm:pb-28 lg:px-16">
        {intro || !entered ? (
          <>
            <p className="kicker">A film by {SITE.person} · {SITE.location}</p>
            <h1 className="glitch mt-4 font-display text-5xl leading-[0.9] tracking-tight sm:mt-6 sm:text-8xl lg:text-9xl">
              {entered ? <SplitTitle text={SITE.name} /> : SITE.name}
            </h1>
            <p className="mt-5 font-display text-xl italic text-bone/90 sm:mt-8 sm:text-2xl">{SITE.tagline}</p>
          </>
        ) : (
          <p className="kicker mb-2 max-md:text-center">
            <span className="md:hidden">Tap a named world</span>
            <span className="hidden md:inline">
              Touch a named world · unnamed worlds keep letters · 1–8 play · hold D · S still · L a word
            </span>
          </p>
        )}
      </section>
    </main>
  );
}
