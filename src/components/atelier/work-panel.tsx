import { Link } from "@tanstack/react-router";
import { flyToRoom } from "@/lib/director";
import { sound } from "@/lib/sound";
import type { Work } from "@/lib/works";
import { Reveal } from "./reveal";

export function WorkPanel({
  work,
  delay = 0,
}: {
  work: Work;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <Link
        to="/work/$slug"
        params={{ slug: work.slug }}
        onMouseEnter={() => sound.hover()}
        onClick={(e) => {
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            sound.click();
            return;
          }
          e.preventDefault();
          const img = (e.currentTarget as HTMLElement).querySelector("img");
          flyToRoom(work.slug, img);
        }}
        aria-label={`${work.title}, ${work.short}, ${work.year}`}
        className="group relative block overflow-hidden bg-fog"
      >
        <div className="aspect-4/5 sm:aspect-16/9">
          <img
            src={work.image}
            alt=""
            className="h-full w-full object-cover opacity-75 transition duration-700 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-105 group-hover:opacity-100 group-active:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <p className="kicker">
            {work.index} · {work.year} · {work.short}
          </p>
          <h2 className="mt-3 font-display text-4xl leading-none sm:text-6xl">{work.title}</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-bone/80">{work.thesis}</p>
        </div>
      </Link>
    </Reveal>
  );
}
