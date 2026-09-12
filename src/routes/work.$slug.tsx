import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { flyToRoom } from "@/lib/director";
import { getWork, neighbors } from "@/lib/works";
import { sound } from "@/lib/sound";
import { PageFrame } from "@/components/atelier/page-frame";
import { LivePortal } from "@/components/atelier/live-portal";
import { Reveal } from "@/components/atelier/reveal";
import { SwipeRoom } from "@/components/atelier/swipe-room";
import { useSceneMode } from "@/components/atelier/use-scene-mode";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => {
    const work = getWork(params.slug);
    if (!work) throw notFound();
    return { work, ...neighbors(params.slug) };
  },
  component: WorkRoom,
});

function WorkRoom() {
  const { work, prev, next } = Route.useLoaderData();
  useSceneMode("room", work.slug);

  return (
    <PageFrame>
      <SwipeRoom prev={prev} next={next}>
      <p className="kicker">
        Room {work.index} · {work.year}
      </p>
      <h1 className="mt-6 font-display text-5xl leading-none sm:text-7xl lg:text-8xl">
        {work.title}
      </h1>
      <p className="mt-8 max-w-2xl font-display text-2xl italic text-bone/90">{work.thesis}</p>
      <p className="mt-4 text-sm text-mute">
        {work.role} · {work.tags.join(" · ")}
      </p>

      <Reveal clip className="mt-12 overflow-hidden bg-fog">
        <div className="aspect-16/9">
          <img src={work.image} alt="" className="h-full w-full object-cover" />
        </div>
      </Reveal>

      <LivePortal work={work} />

      <div className="mt-16 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="kicker">Problem</p>
          <p className="mt-4 text-base leading-relaxed text-bone/90">{work.problem}</p>
          <p className="kicker mt-12">Process</p>
          <ol className="mt-4 space-y-4">
            {work.process.map((step, i) => (
              <li key={i} className="flex gap-4 text-sm leading-relaxed text-mute">
                <span className="kicker w-8 shrink-0 pt-0.5">0{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="kicker mt-12">Outcome</p>
          <p className="mt-4 text-base leading-relaxed">{work.outcome}</p>
        </div>
        <aside className="lg:col-span-5">
          <Reveal clip className="overflow-hidden bg-fog">
            <div className="aspect-4/3">
              <img src={work.detail} alt="" className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex justify-between border-b border-line py-3">
              <span className="text-mute">Year</span>
              <span>{work.year}</span>
            </li>
            <li className="flex justify-between border-b border-line py-3">
              <span className="text-mute">Role</span>
              <span>{work.role}</span>
            </li>
            <li className="flex justify-between border-b border-line py-3">
              <span className="text-mute">Stack</span>
              <span className="text-right">{work.stack.join(" · ")}</span>
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-4">
            {work.live ? (
              <a
                href={work.live}
                target="_blank"
                rel="noreferrer"
                onClick={() => sound.click()}
                className="min-h-11 border border-line px-6 py-3 text-xs tracking-widest uppercase hover:bg-bone hover:text-void"
              >
                Open live
              </a>
            ) : null}
            {work.repo ? (
              <a
                href={work.repo}
                target="_blank"
                rel="noreferrer"
                onClick={() => sound.click()}
                className="min-h-11 px-6 py-3 text-xs tracking-widest text-mute uppercase hover:text-bone"
              >
                Source
              </a>
            ) : null}
          </div>
        </aside>
      </div>

      <nav className="mt-24 grid gap-4 border-t border-line pt-10 sm:grid-cols-2">
        {prev ? (
          <Link
            to="/work/$slug"
            params={{ slug: prev.slug }}
            onClick={(e) => {
              if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
              e.preventDefault();
              const img = (e.currentTarget as HTMLElement).querySelector("img");
              flyToRoom(prev.slug, img);
            }}
            className="group overflow-hidden border border-line"
          >
            <div className="aspect-16/9 overflow-hidden bg-fog">
              <img
                src={prev.image}
                alt=""
                className="h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
              />
            </div>
            <div className="p-5">
              <p className="kicker">Previous</p>
              <p className="mt-2 font-display text-3xl">{prev.title}</p>
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to="/work/$slug"
            params={{ slug: next.slug }}
            onClick={(e) => {
              if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
              e.preventDefault();
              const img = (e.currentTarget as HTMLElement).querySelector("img");
              flyToRoom(next.slug, img);
            }}
            className="group overflow-hidden border border-line"
          >
            <div className="aspect-16/9 overflow-hidden bg-fog">
              <img
                src={next.image}
                alt=""
                className="h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
              />
            </div>
            <div className="p-5 sm:text-right">
              <p className="kicker">Next</p>
              <p className="mt-2 font-display text-3xl">{next.title}</p>
            </div>
          </Link>
        ) : null}
      </nav>
      </SwipeRoom>
    </PageFrame>
  );
}
