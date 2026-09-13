export type Work = {
  slug: string;
  index: string;
  title: string;
  short: string;
  year: string;
  role: string;
  tags: string[];
  live?: string;
  repo?: string;
  embed?: boolean;
  image: string;
  planet: string;
  detail: string;
  thesis: string;
  problem: string;
  process: string[];
  outcome: string;
  stack: string[];
};

export const WORKS: Work[] = [
  {
    slug: "assess-pilot",
    index: "01",
    title: "AssessPilot",
    short: "Edu",
    year: "2026",
    role: "Product, design, engineering",
    tags: ["Education", "Assessment", "Workspace"],
    live: "https://assesspilot.vercel.app",
    repo: "https://github.com/hoshixdd/assesspilot",
    image: "/works/assess-pilot.jpg",
    planet: "/cosmos/planets/assess.jpg",
    detail: "/works/assess-pilot-detail.jpg",
    thesis: "Good feedback deserves a home.",
    problem:
      "Teacher work is scattered across answer keys, scans, gradebooks and inboxes. Assessment becomes a filing cabinet instead of a conversation.",
    process: [
      "Designed a quiet teacher workspace for creating assessments, collecting responses, reviewing grades and publishing feedback.",
      "Eight question types, answer keys, rubric criteria, immutable published versions, roster CSV, and original-paper uploads.",
      "Sample mode stores work locally; cloud foundations exist without pretending the live grading pipeline is finished.",
    ],
    outcome:
      "A working teacher demonstration at AssessPilot — private, focused, and honest about what is sample versus live.",
    stack: ["Next.js", "TypeScript", "OpenAI", "Supabase", "Tailwind"],
  },
  {
    slug: "a-little-infinity",
    index: "02",
    title: "A Little Infinity",
    short: "Confession",
    year: "2026",
    role: "Direction, interaction, engineering",
    tags: ["WebGL", "Narrative", "Confession"],
    live: "https://didactic-giggle-nine.vercel.app",
    repo: "https://github.com/hoshixdd/didactic-giggle",
    embed: true,
    image: "/works/infinity.jpg",
    planet: "/cosmos/planets/infinity.jpg",
    detail: "/works/infinity-detail.jpg",
    thesis: "Some things are only true when they are offered, not posted.",
    problem:
      "A confession should feel like a letter, not a feed. Most “personal sites” flatten intimacy into a template.",
    process: [
      "Built a love letter in six acts: hero, reasons, timeline, unfolding letter, question, closing.",
      "WebGL constellation and glass heart, GSAP/ScrollTrigger, Lenis, a dodging No that never traps keyboard or touch.",
      "Gentle mode, reading mode, reduced-motion path, and a text fallback if WebGL fails — every memory still reachable.",
    ],
    outcome:
      "A confession you enter. Nothing is stored. Yes is a moment. The letter stays selectable.",
    stack: ["React", "Three.js", "GSAP", "Lenis", "Vite"],
  },
  {
    slug: "common-table",
    index: "03",
    title: "Common Table",
    short: "Canteen",
    year: "2026",
    role: "Full-stack systems",
    tags: ["Operations", "Restaurant", "Realtime"],
    live: "https://common-table-demo.vercel.app",
    repo: "https://github.com/hoshixdd/common-table",
    image: "/works/common-table.jpg",
    planet: "/cosmos/planets/table.jpg",
    detail: "/works/common-table-detail.jpg",
    thesis: "The canteen is the only room at work that still belongs to everyone.",
    problem:
      "Workplace dining is usually a spreadsheet, a queue, and a guess. Money, stock and pickup cannot be client-side theatre.",
    process: [
      "Four roles — employee, cashier, kitchen, admin — against one transactional order service in PostgreSQL.",
      "Integer money, row locks, idempotent retries, HMAC-peppered credentials, private image storage, Asia/Manila service hours.",
      "Three-second snapshots instead of a websocket bill. Demo seed is fictional. Production refuses demo credentials.",
    ],
    outcome:
      "A canteen system you can actually run: allowance, stock, pickup codes, privacy retention — not a restaurant landing page.",
    stack: ["Next.js", "PostgreSQL", "Neon", "Vercel Blob", "TypeScript"],
  },
];

export function getWork(slug: string) {
  return WORKS.find((w) => w.slug === slug);
}

export function neighbors(slug: string) {
  const i = WORKS.findIndex((w) => w.slug === slug);
  if (i < 0) return { prev: undefined, next: undefined };
  return {
    prev: WORKS[(i + WORKS.length - 1) % WORKS.length],
    next: WORKS[(i + 1) % WORKS.length],
  };
}
