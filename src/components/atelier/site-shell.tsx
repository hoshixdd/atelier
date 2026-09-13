import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { sound } from "@/lib/sound";
import { cebHour, dayPart } from "@/lib/ceb";
import { bindGoToWork } from "@/lib/director";
import { loadDesk, useAtelier } from "@/store/atelier";
import { AtelierCanvas } from "./canvas";
import { Cursor } from "./cursor";
import { Desk } from "./desk";
import { Loader } from "./loader";
import { MobileDock } from "./mobile-dock";
import { Nav } from "./nav";
import { PageTransition } from "./page-transition";
import { Palette } from "./palette";
import { Presence } from "./presence";
import { WorldLabels } from "./world-labels";
import { SecretLetter } from "./secret-letter";
import { Atmosphere } from "./atmosphere";
import { FlyShot, Letterbox, Slugline } from "./film";
import { PlanetCard } from "./planet-card";
import { DirectorHud } from "./director-hud";
import { Keys } from "./keys";
import { AsterHud } from "./aster-hud";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const setReducedMotion = useAtelier((s) => s.setReducedMotion);
  const setIsTouch = useAtelier((s) => s.setIsTouch);
  const setHour = useAtelier((s) => s.setHour);
  const grain = useAtelier((s) => s.grain);
  const hour = useAtelier((s) => s.hour);
  const entered = useAtelier((s) => s.entered);
  const pendingSlug = useAtelier((s) => s.pendingSlug);
  const notice = useAtelier((s) => s.notice);

  useEffect(() => {
    loadDesk();
    sound.setDrone(useAtelier.getState().drone);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(motion);
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    setHour(cebHour());
    const id = window.setInterval(() => setHour(cebHour()), 60_000);
    return () => window.clearInterval(id);
  }, [setHour, setIsTouch, setReducedMotion]);

  useEffect(() => {
    document.documentElement.style.setProperty("--grain", String(grain));
  }, [grain]);

  useEffect(() => {
    document.documentElement.dataset.tod = dayPart(hour);
  }, [hour]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (useAtelier.getState().reducedMotion) return;
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
    });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    sound.whoosh();
    window.scrollTo({ top: 0, behavior: "auto" });
    useAtelier.getState().setFocusSlug(null);
    useAtelier.getState().bumpTake();
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") {
      useAtelier.getState().setHomeScroll(0);
      return;
    }
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      useAtelier.getState().setHomeScroll(Math.min(1, window.scrollY / max));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    bindGoToWork((slug) => {
      void navigate({ to: "/work/$slug", params: { slug } });
    });
    return () => bindGoToWork(null);
  }, [navigate]);

  return (
    <div className="relative min-h-dvh bg-void text-bone">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-cursor focus:bg-bone focus:px-4 focus:py-2 focus:text-void"
      >
        Skip to content
      </a>
      <AtelierCanvas />
      <Atmosphere />
      <div className="cosmos-veil" />
      <div className="grain" />
      {entered ? <div className="scanline" /> : null}
      <span className="hud-corner tl" />
      <span className="hud-corner tr" />
      <span className="hud-corner bl hidden md:block" />
      <span className="hud-corner br hidden md:block" />
      <PageTransition />
      <Letterbox />
      <Slugline />
      <DirectorHud />
      <Keys />
      <FlyShot />
      <PlanetCard />
      <AsterHud />
      <Loader />
      <Nav />
      <Cursor />
      <Desk />
      <Palette />
      <Presence />
      <WorldLabels />
      <SecretLetter />
      {notice ? (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-overlay -translate-x-1/2 border border-line bg-fog px-5 py-3 text-xs tracking-widest uppercase md:bottom-8">
          {notice}
        </div>
      ) : null}
      <div
        id="main"
        className={`relative z-10 pb-16 transition-opacity duration-700 md:pb-0 ${entered ? (pendingSlug ? "opacity-20" : "opacity-100") : "opacity-0"}`}
        aria-hidden={!entered}
        inert={!entered ? true : undefined}
      >
        {children}
      </div>
      <MobileDock />
    </div>
  );
}
