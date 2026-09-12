import { cn } from "@/lib/utils";
import { useAtelier } from "@/store/atelier";

const VEIL: Record<string, string> = {
  "assess-pilot":
    "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(90,160,200,0.22), transparent 62%)",
  "a-little-infinity":
    "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(120,80,200,0.24), transparent 62%)",
  "common-table":
    "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(200,120,50,0.2), transparent 62%)",
};

export function Atmosphere() {
  const slug = useAtelier((s) => s.workSlug);
  const bg = slug ? VEIL[slug] : undefined;
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[1] transition-opacity duration-700",
        bg ? "opacity-100" : "opacity-0",
      )}
      style={{ background: bg }}
      aria-hidden="true"
    />
  );
}
