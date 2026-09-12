import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { PageFrame } from "@/components/atelier/page-frame";
import { SplitTitle } from "@/components/atelier/reveal";
import { useSceneMode } from "@/components/atelier/use-scene-mode";
import { useAtelier } from "@/store/atelier";

export const Route = createFileRoute("/colophon")({ component: Colophon });

function extraLine() {
  if (typeof navigator === "undefined") return "GUEST — UNKNOWN";
  const ua = navigator.userAgent;
  const chrome = /Chrome\/(\d+)/.exec(ua);
  const safari = /Version\/(\d+).+Safari/.exec(ua);
  const engine = chrome ? `CHROME ${chrome[1]}` : safari ? `SAFARI ${safari[1]}` : "BROWSER";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "LOCAL";
  return `GUEST — ${engine}, ${tz.replace(/_/g, " ").toUpperCase()}`;
}

function Colophon() {
  useSceneMode("colophon");
  const entered = useAtelier((s) => s.entered);
  const novas = useAtelier((s) => s.novas);
  const extra = extraLine();

  return (
    <PageFrame>
      <p className="kicker">End credits</p>
      <h1 className="mt-6 font-display text-6xl sm:text-8xl">
        {entered ? <SplitTitle text="Colophon" /> : "Colophon"}
      </h1>
      <p className="mt-6 max-w-lg text-sm leading-relaxed text-mute">
        How the atelier is built. Type, sound, light, and the rooms they hold.
      </p>

      <div className="credits-mask relative mt-16 h-[70vh] overflow-hidden border border-line">
        <div className="credits-crawl px-6 py-16 text-center">
          <p className="kicker">A film by</p>
          <p className="mt-3 font-display text-4xl">{SITE.person}</p>
          <p className="mt-16 kicker">Wordmark</p>
          <p className="mt-2 text-sm">{SITE.name} — from hoshi, star. Handle @{SITE.handle}.</p>
          <p className="mt-10 kicker">Type</p>
          <p className="mt-2 text-sm">Instrument Serif · Manrope</p>
          <p className="mt-10 kicker">World</p>
          <p className="mt-2 text-sm">Three.js · supernova remnant · named worlds · unnamed letters</p>
          <p className="mt-10 kicker">Score</p>
          <p className="mt-2 text-sm">Web Audio. A drone that retunes per planet. Keys 1–8 play the remnant.</p>
          <p className="mt-10 kicker">Time</p>
          <p className="mt-2 text-sm">Asia/Manila. The sky is {SITE.location}.</p>
          <p className="mt-10 kicker">Harvest</p>
          <p className="mt-2 text-sm">
            {novas > 0 ? `${novas} nova${novas === 1 ? "" : "s"} on this machine.` : "None yet."}
          </p>
          <p className="mt-10 kicker">Stack</p>
          <p className="mt-2 text-sm">{SITE.stack.join(" · ")}</p>
          <p className="mt-16 kicker">Extra</p>
          <p className="mt-3 font-display text-2xl">{extra}</p>
          <p className="mt-20 font-display text-5xl">{SITE.name}</p>
          <p className="mt-4 text-xs tracking-[0.35em] uppercase text-mute">The belt continues</p>
        </div>
      </div>

      <dl className="mt-16 max-w-2xl divide-y divide-line border-y border-line text-sm">
        <Row k="Palette" v="Void #0A0A0A · Fog #161614 · Line #2C2C28 · Mute #8A8A84 · Bone #EDEAE3" />
        <Row k="Motion" v="Lenis. A title pull-back. Gyro look on the phone. Reduced motion is Quiet." />
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
