import { cn } from "@/lib/utils";
import { dayPart } from "@/lib/ceb";
import { useAtelier } from "@/store/atelier";

const VEIL: Record<string, string> = {
  "assess-pilot":
    "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(90,160,200,0.22), transparent 62%)",
  "a-little-infinity":
    "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(120,80,200,0.24), transparent 62%)",
  "common-table":
    "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(200,120,50,0.2), transparent 62%)",
};

const CEB: Record<string, string> = {
  night: "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(40,28,16,0.18), transparent 70%)",
  morning: "radial-gradient(ellipse 80% 70% at 50% 18%, rgba(255,200,140,0.14), transparent 68%)",
  day: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,244,220,0.08), transparent 60%)",
  dusk: "radial-gradient(ellipse 80% 70% at 50% 70%, rgba(255,120,60,0.14), transparent 68%)",
};

export function Atmosphere() {
  const slug = useAtelier((s) => s.workSlug);
  const hour = useAtelier((s) => s.hour);
  const bg = slug ? VEIL[slug] : CEB[dayPart(hour)];
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
