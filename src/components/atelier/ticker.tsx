const ITEMS = [
  "HOSHIIXDD",
  "Atelier",
  "Cebu",
  "AssessPilot",
  "A Little Infinity",
  "Common Table",
  "TypeScript",
  "Three.js",
  "Next.js",
  "PostgreSQL",
  "GSAP",
  "AI systems",
];

export function Ticker() {
  const line = [...ITEMS, ...ITEMS].map((item, i) => (
    <span key={`${item}-${i}`} className="flex items-center gap-6 px-6">
      <span className="text-xs tracking-widest uppercase">{item}</span>
      <span aria-hidden="true" className="text-mute">
        ✦
      </span>
    </span>
  ));
  return (
    <div className="marquee">
      <div className="marquee-track py-4 text-mute">{line}</div>
    </div>
  );
}
