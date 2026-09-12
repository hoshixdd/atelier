import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { WORKS } from "@/lib/works";
import { flyToRoom } from "@/lib/director";
import { sound } from "@/lib/sound";
import { useAtelier } from "@/store/atelier";

type Cmd = {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  run: () => void;
};

export function Palette() {
  const open = useAtelier((s) => s.paletteOpen);
  const setPaletteOpen = useAtelier((s) => s.setPaletteOpen);
  const setDeskOpen = useAtelier((s) => s.setDeskOpen);
  const soundOn = useAtelier((s) => s.soundOn);
  const setSoundOn = useAtelier((s) => s.setSoundOn);
  const setNotice = useAtelier((s) => s.setNotice);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const commands = useMemo<Cmd[]>(() => {
    const go = (to: string, params?: Record<string, string>) => {
      setPaletteOpen(false);
      sound.click();
      if (params) void navigate({ to: to as never, params: params as never });
      else void navigate({ to: to as never });
    };
    return [
      { id: "home", label: "Home", hint: "Atelier", keywords: "home start star", run: () => go("/") },
      { id: "work", label: "Work", hint: "Archive", keywords: "work rooms", run: () => go("/work") },
      ...WORKS.map((w) => ({
        id: w.slug,
        label: w.title,
        hint: `Room ${w.index}`,
        keywords: `${w.title} ${w.short} ${w.tags.join(" ")}`,
        run: () => {
          setPaletteOpen(false);
          flyToRoom(w.slug);
        },
      })),
      { id: "about", label: "Portrait", hint: "About", keywords: "about jude portrait", run: () => go("/about") },
      { id: "lab", label: "Lab", hint: "Instruments", keywords: "lab play instruments", run: () => go("/lab") },
      { id: "play", label: "Harvest", hint: "Play", keywords: "play harvest nova game shards", run: () => go("/play") },
      { id: "signal", label: "Signal", hint: "Contact", keywords: "contact mail signal hire", run: () => go("/contact") },
      { id: "notes", label: "Notes", hint: "Essay", keywords: "notes essay writing systems", run: () => go("/notes") },
      { id: "colophon", label: "Colophon", hint: "Making", keywords: "colophon type sound fonts", run: () => go("/colophon") },
      {
        id: "desk",
        label: "Open desk",
        hint: "Tune",
        keywords: "desk grain fog star drone",
        run: () => {
          setPaletteOpen(false);
          setDeskOpen(true);
          sound.click();
        },
      },
      {
        id: "sound",
        label: soundOn ? "Mute sound" : "Enable sound",
        hint: "Audio",
        keywords: "sound mute audio drone",
        run: () => {
          void (async () => {
            await sound.unlock();
            const next = !useAtelier.getState().soundOn;
            sound.setEnabled(next);
            setSoundOn(next);
            if (next) sound.click();
            setPaletteOpen(false);
          })();
        },
      },
      {
        id: "mail",
        label: "Copy mail",
        hint: SITE.email,
        keywords: "email copy mail jude",
        run: () => {
          void navigator.clipboard.writeText(SITE.email);
          setNotice("Mail copied");
          setPaletteOpen(false);
          sound.click();
          window.setTimeout(() => useAtelier.getState().setNotice(null), 1800);
        },
      },
    ];
  }, [navigate, setDeskOpen, setPaletteOpen, setSoundOn, setNotice, soundOn]);

  const filtered = commands.filter((c) => {
    const hay = (c.label + " " + c.hint + " " + c.keywords).toLowerCase();
    return hay.includes(q.toLowerCase().trim());
  });

  useEffect(() => {
    if (!open) return;
    setQ("");
    setI(0);
    const t = window.setTimeout(() => input.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    setI(0);
  }, [q]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(!useAtelier.getState().paletteOpen);
        return;
      }
      if (e.key === "/" && !typing && !useAtelier.getState().paletteOpen) {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (!useAtelier.getState().paletteOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setPaletteOpen(false);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setI((n) => Math.min(filtered.length - 1, n + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setI((n) => Math.max(0, n - 1));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        filtered[i]?.run();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, i, setPaletteOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-overlay flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-label="Command palette">
      <button
        type="button"
        className="absolute inset-0 bg-void/55"
        aria-label="Close palette"
        onClick={() => setPaletteOpen(false)}
      />
      <div className="relative w-full max-w-lg border border-line bg-fog">
        <input
          ref={input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Go to a room…"
          className="h-14 w-full border-b border-line bg-transparent px-5 text-base outline-none"
          aria-label="Filter commands"
        />
        <ul className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <li className="px-5 py-4 text-sm text-mute">No room by that name.</li>
          ) : (
            filtered.map((c, n) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => c.run()}
                  onMouseEnter={() => {
                    setI(n);
                    sound.hover();
                  }}
                  className={`flex min-h-12 w-full items-center justify-between px-5 text-left text-sm ${n === i ? "bg-bone text-void" : "text-bone"}`}
                >
                  <span>{c.label}</span>
                  <span className={`text-xs tracking-widest uppercase ${n === i ? "text-void/50" : "text-mute"}`}>
                    {c.hint}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
        <p className="border-t border-line px-5 py-3 text-xs tracking-widest text-mute uppercase">
          ↑↓ enter · esc
        </p>
      </div>
    </div>
  );
}
