import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { PageFrame } from "@/components/atelier/page-frame";
import { SplitTitle } from "@/components/atelier/reveal";
import { useSceneMode } from "@/components/atelier/use-scene-mode";
import { useAtelier } from "@/store/atelier";

export const Route = createFileRoute("/colophon")({ component: Colophon });

function Colophon() {
  useSceneMode("colophon");
  const entered = useAtelier((s) => s.entered);
  const novas = useAtelier((s) => s.novas);

  return (
    <PageFrame>
      <p className="kicker">Making</p>
      <h1 className="mt-6 font-display text-6xl sm:text-8xl">
        {entered ? <SplitTitle text="Colophon" /> : "Colophon"}
      </h1>
      <p className="mt-6 max-w-lg text-sm leading-relaxed text-mute">
        How the atelier is built. Type, sound, light, and the rooms they hold.
      </p>

      <dl className="mt-16 max-w-2xl divide-y divide-line border-y border-line text-sm">
        <Row k="Wordmark" v={`${SITE.name} — from hoshi, star. Handle @${SITE.handle}.`} />
        <Row k="Type" v="Instrument Serif for display. Manrope for the body and HUD." />
        <Row k="Palette" v="Void #0A0A0A · Fog #161614 · Line #2C2C28 · Mute #8A8A84 · Bone #EDEAE3" />
        <Row k="World" v="A persistent Three.js cosmos. A supernova remnant as the star. Named worlds for the work, unnamed planets that keep letters, moons, a belt. Night sides are real. Bloom on the remnant." />
        <Row k="Sound" v="Web Audio. A drone that retunes per planet. Warps duck the score. Mute is a first-class door." />
        <Row k="Motion" v="Lenis scroll. A title pull-back from inside the remnant. Interruptible landings. Reduced motion is Quiet on the desk." />
        <Row k="Time" v={`Asia/Manila. The room shifts with Cebu — ${SITE.location}.`} />
        <Row k="Presence" v="Other visitors appear as dim stars. No names. No store of who was here." />
        <Row k="Harvest" v={novas > 0 ? `${novas} nova${novas === 1 ? "" : "s"} remembered on this machine. The remnant keeps the count.` : "None yet. Play is a session around the core."} />
        {novas >= 2 ? (
          <Row k="Unlocked" v="You have walked the belt. The unnamed worlds will speak; the fourth instrument waits at three." />
        ) : null}
        <Row k="Stack" v={SITE.stack.join(" · ")} />
        <Row k="Year" v={String(new Date().getFullYear())} />
      </dl>

      <div className="mt-16 flex flex-wrap gap-4">
        <Link
          to="/"
          className="inline-flex min-h-12 items-center border border-line px-6 text-xs tracking-widest uppercase hover:bg-bone hover:text-void"
        >
          Return
        </Link>
        <a
          href={SITE.github}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center px-6 text-xs tracking-widest text-mute uppercase hover:text-bone"
        >
          Source
        </a>
      </div>
    </PageFrame>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid gap-2 py-5 sm:grid-cols-12">
      <dt className="kicker sm:col-span-3">{k}</dt>
      <dd className="text-bone/90 sm:col-span-9">{v}</dd>
    </div>
  );
}
