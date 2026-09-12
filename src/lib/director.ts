import { sound } from "@/lib/sound";
import { useAtelier } from "@/store/atelier";

export const SLUGLINES: Record<string, string> = {
  "/": "INT. THE BELT — CONTINUOUS",
  "/work": "INT. ARCHIVE — HOLD",
  "/work/assess-pilot": "INT. ASSESSPILOT — DAY",
  "/work/a-little-infinity": "INT. A LITTLE INFINITY — NIGHT",
  "/work/common-table": "INT. COMMON TABLE — DUSK",
  "/about": "INT. THE STAR — THROUGH",
  "/play": "INT. REMNANT — CLOSE",
  "/contact": "EXT. BEACON — NIGHT",
  "/notes": "INT. THE NOTE — QUIET",
  "/lab": "INT. INSTRUMENTS — PLAY",
  "/colophon": "END CREDITS — HOLD",
};

export function sluglineFor(path: string) {
  if (SLUGLINES[path]) return SLUGLINES[path];
  if (path.startsWith("/work/")) return "INT. A ROOM — CONTINUOUS";
  return "INT. ATELIER — CONTINUOUS";
}

export type FlyRect = { src: string; x: number; y: number; w: number; h: number };

type GoToWork = (slug: string) => void;
let goToWork: GoToWork | null = null;
let flyTimer = 0;

export function bindGoToWork(fn: GoToWork | null) {
  goToWork = fn;
}

export function flyToRoom(slug: string, img?: HTMLImageElement | null) {
  const { reducedMotion } = useAtelier.getState();
  let fly: FlyRect | null = null;
  if (img && !reducedMotion) {
    const r = img.getBoundingClientRect();
    fly = { src: img.currentSrc || img.src, x: r.left, y: r.top, w: r.width, h: r.height };
  }
  sound.click();
  sound.duck(reducedMotion ? 200 : 900);
  useAtelier.setState({
    pendingSlug: slug,
    focusSlug: slug,
    fly,
    letterboxOn: !reducedMotion,
    slugline: sluglineFor(`/work/${slug}`),
  });
  if (flyTimer) window.clearTimeout(flyTimer);
  const delay = reducedMotion ? 0 : 720;
  flyTimer = window.setTimeout(() => {
    flyTimer = 0;
    goToWork?.(slug);
    if (!goToWork) {
      window.location.assign(`/work/${slug}`);
    }
    window.setTimeout(() => {
      useAtelier.setState({ pendingSlug: null, fly: null, letterboxOn: false });
    }, 80);
  }, delay);
}
