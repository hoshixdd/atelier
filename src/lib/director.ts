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

type GoPath = (path: string) => void;
let goToPath: GoPath | null = null;

export function bindGo(fn: GoPath | null) {
  goToPath = fn;
}

export function bindGoToWork(fn: ((slug: string) => void) | null) {
  goToPath = fn
    ? (path) => {
        const slug = path.replace("/work/", "");
        fn(slug);
      }
    : null;
}

let flyTimer = 0;

function shoot(path: string, pending: string | null, fly: FlyRect | null) {
  const { reducedMotion } = useAtelier.getState();
  sound.whoosh();
  sound.duck(reducedMotion ? 200 : 1100);
  useAtelier.setState({
    pendingSlug: pending,
    focusSlug: pending,
    fly,
    letterboxOn: !reducedMotion,
    slugline: sluglineFor(path),
  });
  if (flyTimer) window.clearTimeout(flyTimer);
  const delay = reducedMotion ? 0 : 780;
  flyTimer = window.setTimeout(() => {
    flyTimer = 0;
    if (goToPath) goToPath(path);
    else {
      window.history.pushState(window.history.state, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
    window.setTimeout(() => {
      useAtelier.setState({ pendingSlug: null, fly: null, letterboxOn: false });
    }, 80);
  }, delay);
}

export function flyToRoom(slug: string, img?: HTMLImageElement | null) {
  let fly: FlyRect | null = null;
  if (img && !useAtelier.getState().reducedMotion) {
    const r = img.getBoundingClientRect();
    fly = { src: img.currentSrc || img.src, x: r.left, y: r.top, w: r.width, h: r.height };
  }
  shoot(`/work/${slug}`, slug, fly);
}

export function flyToShot(path: string, pending = "remnant") {
  shoot(path, pending, null);
}
