import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { sluglineFor } from "@/lib/director";
import { sound } from "@/lib/sound";
import { useAtelier } from "@/store/atelier";

export function PageTransition() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sound.duck(900);
    if (reduced) return;
    useAtelier.getState().setLetterboxOn(true);
    useAtelier.getState().setSlugline(sluglineFor(pathname));
    const t = window.setTimeout(() => {
      useAtelier.getState().setLetterboxOn(false);
      useAtelier.getState().setSlugline(null);
    }, 1200);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
