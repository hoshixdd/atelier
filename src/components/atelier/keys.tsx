import { useEffect } from "react";
import { captureStill } from "@/lib/capture";
import { sound } from "@/lib/sound";
import { useAtelier } from "@/store/atelier";

const NOTES = [130.81, 146.83, 164.81, 196, 220, 246.94, 261.63, 329.63];

function typing(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function Keys() {
  useEffect(() => {
    function down(e: KeyboardEvent) {
      if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      const { entered, paletteOpen, deskOpen, leaveOpen } = useAtelier.getState();
      if (!entered || paletteOpen || deskOpen || leaveOpen) return;

      if (e.key === "d" || e.key === "D") {
        useAtelier.getState().setDirectorOn(true);
        return;
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        void (async () => {
          const ok = await captureStill();
          useAtelier.getState().setNotice(ok ? "Still saved" : "No frame");
          window.setTimeout(() => useAtelier.getState().setNotice(null), 1600);
        })();
        return;
      }
      if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        useAtelier.getState().setLeaveOpen(true);
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= 8) {
        e.preventDefault();
        sound.tone(NOTES[n - 1]!);
        useAtelier.getState().strike();
      }
    }
    function up(e: KeyboardEvent) {
      if (e.key === "d" || e.key === "D") useAtelier.getState().setDirectorOn(false);
    }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  return null;
}
