import { create } from "zustand";

export type SceneMode =
  | "home"
  | "work"
  | "room"
  | "lab"
  | "about"
  | "contact"
  | "lost"
  | "colophon"
  | "play"
  | "notes";

export type SkyLabel = {
  id: string;
  title: string;
  index: string;
  x: number;
  y: number;
};

export type Visitor = { x: number; y: number };

type AtelierState = {
  entered: boolean;
  introPlaying: boolean;
  soundOn: boolean;
  reducedMotion: boolean;
  isTouch: boolean;
  sceneMode: SceneMode;
  workSlug: string | null;
  pointer: { x: number; y: number };
  hoverLabel: string | null;
  focusSlug: string | null;
  grain: number;
  fog: number;
  star: number;
  drone: number;
  hour: number;
  deskOpen: boolean;
  paletteOpen: boolean;
  pendingSlug: string | null;
  notice: string | null;
  visitors: Record<string, Visitor>;
  harvested: number;
  novas: number;
  harvestNeed: number;
  secretId: string | null;
  labels: SkyLabel[];
  homeScroll: number;
  fly: { src: string; x: number; y: number; w: number; h: number } | null;
  letterboxOn: boolean;
  slugline: string | null;
  directorOn: boolean;
  tiltX: number;
  tiltY: number;
  gyroOn: boolean;
  camZ: number;
  camFov: number;
  take: number;
  asterFound: string[];
  strikeN: number;
  setEntered: (v: boolean) => void;
  setIntroPlaying: (v: boolean) => void;
  setSoundOn: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
  setIsTouch: (v: boolean) => void;
  setSceneMode: (m: SceneMode) => void;
  setWorkSlug: (s: string | null) => void;
  setPointer: (x: number, y: number) => void;
  setHoverLabel: (s: string | null) => void;
  setFocusSlug: (s: string | null) => void;
  setGrain: (v: number) => void;
  setFog: (v: number) => void;
  setStar: (v: number) => void;
  setDrone: (v: number) => void;
  setHour: (v: number) => void;
  setDeskOpen: (v: boolean) => void;
  setPaletteOpen: (v: boolean) => void;
  setPendingSlug: (s: string | null) => void;
  setNotice: (s: string | null) => void;
  setVisitor: (id: string, v: Visitor | null) => void;
  setHarvested: (n: number) => void;
  addNova: () => void;
  setSecretId: (s: string | null) => void;
  setLabels: (l: SkyLabel[]) => void;
  setHomeScroll: (n: number) => void;
  setFly: (f: { src: string; x: number; y: number; w: number; h: number } | null) => void;
  setLetterboxOn: (v: boolean) => void;
  setSlugline: (s: string | null) => void;
  setDirectorOn: (v: boolean) => void;
  setTilt: (x: number, y: number) => void;
  setGyroOn: (v: boolean) => void;
  setCam: (z: number, fov: number) => void;
  bumpTake: () => void;
  addAsterFound: (id: string) => void;
  strike: () => void;
};

export const useAtelier = create<AtelierState>((set) => ({
  entered: false,
  introPlaying: false,
  soundOn: false,
  reducedMotion: false,
  isTouch: false,
  sceneMode: "home",
  workSlug: null,
  pointer: { x: 0, y: 0 },
  hoverLabel: null,
  focusSlug: null,
  grain: 0.07,
  fog: 1,
  star: 1,
  drone: 0.55,
  hour: 12,
  deskOpen: false,
  paletteOpen: false,
  pendingSlug: null,
  notice: null,
  visitors: {},
  harvested: 0,
  novas: 0,
  harvestNeed: 12,
  secretId: null,
  labels: [],
  homeScroll: 0,
  fly: null,
  letterboxOn: false,
  slugline: null,
  directorOn: false,
  tiltX: 0,
  tiltY: 0,
  gyroOn: false,
  camZ: 7.8,
  camFov: 42,
  take: 1,
  asterFound: [],
  strikeN: 0,
  setEntered: (entered) => set({ entered }),
  setIntroPlaying: (introPlaying) => set({ introPlaying }),
  setSoundOn: (soundOn) => set({ soundOn }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setIsTouch: (isTouch) => set({ isTouch }),
  setSceneMode: (sceneMode) => set({ sceneMode }),
  setWorkSlug: (workSlug) => set({ workSlug }),
  setPointer: (x, y) => set({ pointer: { x, y } }),
  setHoverLabel: (hoverLabel) => set({ hoverLabel }),
  setFocusSlug: (focusSlug) => set({ focusSlug }),
  setGrain: (grain) => set({ grain }),
  setFog: (fog) => set({ fog }),
  setStar: (star) => set({ star }),
  setDrone: (drone) => set({ drone }),
  setHour: (hour) => set({ hour }),
  setDeskOpen: (deskOpen) => set((s) => ({ deskOpen, paletteOpen: deskOpen ? false : s.paletteOpen })),
  setPaletteOpen: (paletteOpen) => set((s) => ({ paletteOpen, deskOpen: paletteOpen ? false : s.deskOpen })),
  setPendingSlug: (pendingSlug) => set({ pendingSlug }),
  setNotice: (notice) => set({ notice }),
  setVisitor: (id, v) =>
    set((s) => {
      if (!v) {
        const next = { ...s.visitors };
        delete next[id];
        return { visitors: next };
      }
      return { visitors: { ...s.visitors, [id]: v } };
    }),
  setHarvested: (harvested) => set({ harvested }),
  addNova: () =>
    set((s) => {
      const novas = s.novas + 1;
      try {
        window.localStorage.setItem(NOVA_KEY, String(novas));
      } catch {
        /* ignore */
      }
      return { novas, harvested: 0 };
    }),
  setSecretId: (secretId) => set({ secretId }),
  setLabels: (labels) => set({ labels }),
  setHomeScroll: (homeScroll) => set({ homeScroll }),
  setFly: (fly) => set({ fly }),
  setLetterboxOn: (letterboxOn) => set({ letterboxOn }),
  setSlugline: (slugline) => set({ slugline }),
  setDirectorOn: (directorOn) => set({ directorOn }),
  setTilt: (tiltX, tiltY) => set({ tiltX, tiltY }),
  setGyroOn: (gyroOn) => set({ gyroOn }),
  setCam: (camZ, camFov) => set({ camZ, camFov }),
  bumpTake: () => set((s) => ({ take: s.take + 1 })),
  addAsterFound: (id) =>
    set((s) => (s.asterFound.includes(id) ? s : { asterFound: [...s.asterFound, id] })),
  strike: () => set((s) => ({ strikeN: s.strikeN + 1 })),
}));

const DESK_KEY = "hoshii-desk";
const NOVA_KEY = "hoshii-novas";

export function loadDesk() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(DESK_KEY);
    if (raw) {
      const d = JSON.parse(raw) as Partial<{
        grain: number;
        fog: number;
        star: number;
        drone: number;
      }>;
      useAtelier.setState({
        grain: clamp(d.grain ?? 0.07, 0, 0.2),
        fog: clamp(d.fog ?? 1, 0.4, 1.8),
        star: clamp(d.star ?? 1, 0.5, 1.8),
        drone: clamp(d.drone ?? 0.55, 0, 1),
      });
    }
    const n = Number(window.localStorage.getItem(NOVA_KEY) ?? "0");
    if (Number.isFinite(n) && n > 0) useAtelier.setState({ novas: Math.min(99, n) });
  } catch {
    /* ignore */
  }
}

export function saveDesk() {
  const { grain, fog, star, drone } = useAtelier.getState();
  window.localStorage.setItem(DESK_KEY, JSON.stringify({ grain, fog, star, drone }));
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}
