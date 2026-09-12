import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { WORKS } from "@/lib/works";
import { sound } from "@/lib/sound";
import { PageFrame } from "@/components/atelier/page-frame";
import { Reveal, SplitTitle } from "@/components/atelier/reveal";
import { useSceneMode } from "@/components/atelier/use-scene-mode";
import { useAtelier } from "@/store/atelier";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  useSceneMode("about");
  const entered = useAtelier((s) => s.entered);

  return (
    <PageFrame>
      <Reveal>
        <p className="kicker">Portrait · {SITE.since}—</p>
      </Reveal>
      <h1 className="mt-6 font-display text-6xl sm:text-8xl">
        {entered ? <SplitTitle text={SITE.person} /> : SITE.person}
      </h1>
      <p className="mt-4 text-sm tracking-widest text-mute uppercase">{SITE.name}</p>
      <Reveal delay={80}>
        <p className="mt-10 max-w-2xl font-display text-3xl italic leading-snug">
          Creative developer and AI engineer. I make software that occupies space —
          not pages that wait to be scrolled past.
        </p>
      </Reveal>

      <Reveal clip className="relative mt-12 min-h-[70vh] overflow-hidden bg-fog sm:min-h-[80vh]">
        <img
          src="/portrait/mirror-bw.jpg"
          alt={`${SITE.person} in the mirror, Cebu`}
          className="h-full w-full min-h-[70vh] object-cover object-top sm:min-h-[80vh]"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void via-void/50 to-transparent p-5 sm:p-8">
          <p className="kicker">Cebu · {SITE.location}</p>
          <p className="mt-2 font-display text-2xl italic">{SITE.role}</p>
        </div>
      </Reveal>

      <div className="mt-16 grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <p className="text-sm leading-relaxed text-mute">
            {SITE.name} takes its name from <span className="text-bone">hoshi</span> — star.
            The extra letters are the handle I ship under on GitHub. I work from{" "}
            {SITE.location}: education tools, confession architectures, operational
            systems. Motion, type and data are the same craft.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-mute">
            Selected work lives in three rooms. AssessPilot is a teacher workspace with
            OpenAI and Supabase foundations. A Little Infinity is a WebGL love letter.
            Common Table is a four-role canteen ledger on Neon PostgreSQL.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-mute">
            {SITE.availability}. If the work is a room, send a signal — not a cold deck.
          </p>
          <Link
            to="/notes"
            className="mt-8 inline-flex min-h-11 items-center text-xs tracking-widest uppercase underline decoration-line underline-offset-8"
          >
            Read the note
          </Link>
        </Reveal>
        <Reveal delay={80} className="lg:col-span-5">
          <ul className="space-y-0 text-sm">
            {[
              ["Practice", SITE.role],
              ["Base", SITE.location],
              ["Online", `${SITE.since} →`],
            ].map(([k, v]) => (
              <li key={k} className="flex justify-between gap-4 border-b border-line py-3">
                <span className="text-mute">{k}</span>
                <span className="text-right">{v}</span>
              </li>
            ))}
            <li className="flex justify-between gap-4 border-b border-line py-3">
              <span className="text-mute">GitHub</span>
              <a
                href={SITE.github}
                className="hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                @{SITE.handle}
              </a>
            </li>
            <li className="flex justify-between gap-4 border-b border-line py-3">
              <span className="text-mute">Mail</span>
              <a href={`mailto:${SITE.email}`} className="hover:underline">
                {SITE.email}
              </a>
            </li>
          </ul>
        </Reveal>
      </div>

      <section className="mt-24">
        <p className="kicker">Stack</p>
        <ul className="mt-6 flex flex-wrap gap-3">
          {SITE.stack.map((item) => (
            <li
              key={item}
              className="border border-line px-4 py-2 text-xs tracking-widest uppercase"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-24">
        <p className="kicker">Now</p>
        <h2 className="mt-6 font-display text-4xl">Three rooms, one atelier.</h2>
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {WORKS.map((w) => (
            <li key={w.slug}>
              <Link
                to="/work/$slug"
                params={{ slug: w.slug }}
                onClick={() => sound.click()}
                data-magnetic
                className="flex min-h-14 items-center justify-between py-5"
              >
                <span className="font-display text-2xl">{w.title}</span>
                <span className="text-xs tracking-widest text-mute uppercase">{w.short}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageFrame>
  );
}
