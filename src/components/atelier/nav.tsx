import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { captureStill } from "@/lib/capture";
import { NAV, SITE } from "@/lib/site";
import { sound } from "@/lib/sound";
import { useAtelier } from "@/store/atelier";
import { StarMark } from "./star-mark";

function ManilaClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => {
      setT(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: SITE.timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="tabular-nums text-mute">
      <span className="sm:hidden">CEB {t.slice(0, 5) || "--:--"}</span>
      <span className="hidden sm:inline">CEB {t || "--:--:--"}</span>
    </span>
  );
}

export function Nav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const soundOn = useAtelier((s) => s.soundOn);
  const setSoundOn = useAtelier((s) => s.setSoundOn);
  const entered = useAtelier((s) => s.entered);

  async function toggleSound() {
    await sound.unlock();
    const next = !soundOn;
    sound.setEnabled(next);
    setSoundOn(next);
    if (next) sound.click();
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-nav md:mix-blend-difference">
      <div
        className="pointer-events-auto flex items-center justify-between px-4 py-3 text-bone sm:px-8 sm:py-5 max-md:bg-void/55 max-md:backdrop-blur-md"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <Link
          to="/"
          data-magnetic
          onMouseEnter={() => sound.hover()}
          onClick={() => sound.click()}
          className="glitch flex min-h-11 items-center gap-2 text-xs tracking-widest uppercase"
        >
          <StarMark className="size-3" />
          {SITE.name}
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                to={item.href}
                data-magnetic
                onMouseEnter={() => sound.hover()}
                onClick={() => sound.click()}
                aria-current={active ? "page" : undefined}
                className={`min-h-11 text-xs tracking-widest uppercase ${active ? "text-bone" : "text-mute hover:text-bone"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 text-xs tracking-widest uppercase sm:gap-5">
          <span className="hidden sm:inline">
            <ManilaClock />
          </span>
          <button
            type="button"
            onClick={() => useAtelier.getState().setPaletteOpen(true)}
            disabled={!entered}
            data-magnetic
            className="hidden min-h-11 text-mute hover:text-bone disabled:opacity-40 sm:inline"
            aria-label="Open command palette"
          >
            <span className="hidden md:inline">⌘K</span>
            <span className="md:hidden">Go</span>
          </button>
          <button
            type="button"
            onClick={() => useAtelier.getState().setDeskOpen(true)}
            disabled={!entered}
            data-magnetic
            className="hidden min-h-11 text-mute hover:text-bone disabled:opacity-40 md:inline"
          >
            Desk
          </button>
          <button
            type="button"
            onClick={() => void toggleSound()}
            disabled={!entered}
            data-magnetic
            className="min-h-11 text-mute hover:text-bone disabled:opacity-40"
            aria-pressed={soundOn}
            aria-label={soundOn ? "Mute sound" : "Enable sound"}
          >
            <span className="md:hidden">{soundOn ? "Sound" : "Quiet"}</span>
            <span className="hidden md:inline">Sound {soundOn ? "on" : "off"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              void (async () => {
                const ok = await captureStill();
                useAtelier.getState().setNotice(ok ? "Still saved" : "No frame");
                window.setTimeout(() => useAtelier.getState().setNotice(null), 1600);
              })();
            }}
            disabled={!entered}
            data-magnetic
            className="min-h-11 text-mute hover:text-bone disabled:opacity-40"
            aria-label="Capture a still"
          >
            Still
          </button>
        </div>
      </div>
    </header>
  );
}
