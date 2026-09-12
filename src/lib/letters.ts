export type SkyWord = { word: string; a: number; born: number };

const KEY = "hoshii-sky-words";
const SEED: SkyWord[] = [
  { word: "still", a: 0.4, born: 0 },
  { word: "hoshi", a: 2.1, born: 0 },
  { word: "quietly", a: 3.6, born: 0 },
  { word: "ceb", a: 5.2, born: 0 },
];

export function sanitizeWord(raw: string) {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9 ']/g, "")
    .trim()
    .slice(0, 18);
}

function readLocal(): SkyWord[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SkyWord[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((w) => w && typeof w.word === "string").slice(-24);
  } catch {
    return [];
  }
}

function writeLocal(list: SkyWord[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(-24)));
  } catch {
    /* private */
  }
}

export function mergeWords(remote: SkyWord[]) {
  const local = readLocal();
  const all = [...SEED, ...remote, ...local];
  const seen = new Set<string>();
  const out: SkyWord[] = [];
  for (const w of all) {
    const k = w.word;
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(w);
  }
  return out.slice(-28);
}

export async function loadSkyWords(): Promise<SkyWord[]> {
  let remote: SkyWord[] = [];
  try {
    const res = await fetch("/api/letters", { headers: { accept: "application/json" } });
    if (res.ok) {
      const data = (await res.json()) as { words?: SkyWord[] };
      if (Array.isArray(data.words)) remote = data.words;
    }
  } catch {
    /* static host */
  }
  return mergeWords(remote);
}

export async function leaveSkyWord(raw: string): Promise<SkyWord[] | null> {
  const word = sanitizeWord(raw);
  if (word.length < 2) return null;
  const next: SkyWord = { word, a: Math.random() * Math.PI * 2, born: Date.now() };
  const local = [...readLocal(), next];
  writeLocal(local);
  try {
    await fetch("/api/letters", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ word }),
    });
  } catch {
    /* static host keeps local */
  }
  return mergeWords([next]);
}
