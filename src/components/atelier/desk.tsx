import { sound } from "@/lib/sound";
import { cebHour, dayPart, dayPartLabel } from "@/lib/ceb";
import { saveDesk, useAtelier } from "@/store/atelier";

function Field({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs tracking-widest uppercase">
        <span className="text-mute">{label}</span>
        <span className="tabular-nums text-bone">{value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-bone"
      />
    </label>
  );
}

export function Desk() {
  const open = useAtelier((s) => s.deskOpen);
  const setDeskOpen = useAtelier((s) => s.setDeskOpen);
  const grain = useAtelier((s) => s.grain);
  const fog = useAtelier((s) => s.fog);
  const star = useAtelier((s) => s.star);
  const drone = useAtelier((s) => s.drone);
  const hour = useAtelier((s) => s.hour);
  const visitors = useAtelier((s) => s.visitors);
  const reduced = useAtelier((s) => s.reducedMotion);
  const setGrain = useAtelier((s) => s.setGrain);
  const setFog = useAtelier((s) => s.setFog);
  const setStar = useAtelier((s) => s.setStar);
  const setDrone = useAtelier((s) => s.setDrone);
  const setReducedMotion = useAtelier((s) => s.setReducedMotion);
  const count = Object.keys(visitors).length;
  const part = dayPart(hour || cebHour());

  if (!open) return null;

  function persist() {
    saveDesk();
    sound.hover();
  }

  return (
    <div
      className="fixed inset-0 z-overlay flex items-end justify-end md:items-end"
      role="dialog"
      aria-label="Atelier desk"
    >
      <button
        type="button"
        className="absolute inset-0 bg-void/40"
        aria-label="Close desk"
        onClick={() => setDeskOpen(false)}
      />
      <div className="relative w-full border border-line bg-fog p-6 md:m-6 md:max-w-sm">
        <div className="flex items-center justify-between">
          <p className="kicker">Desk</p>
          <button
            type="button"
            onClick={() => setDeskOpen(false)}
            className="min-h-11 text-xs tracking-widest text-mute uppercase"
          >
            Close
          </button>
        </div>
        <p className="mt-4 font-display text-2xl italic">
          {dayPartLabel(part)} · CEB {String(hour).padStart(2, "0")}h
        </p>
        <p className="mt-2 text-xs tracking-widest text-mute uppercase">
          {count === 0 ? "You are alone in the room" : `${count} other${count === 1 ? "" : "s"} present`}
        </p>
        <div className="mt-8 space-y-6">
          <Field
            label="Grain"
            value={grain}
            min={0}
            max={0.18}
            step={0.01}
            onChange={(n) => {
              setGrain(n);
              persist();
            }}
          />
          <Field
            label="Fog"
            value={fog}
            min={0.4}
            max={1.8}
            step={0.02}
            onChange={(n) => {
              setFog(n);
              persist();
            }}
          />
          <Field
            label="Star"
            value={star}
            min={0.5}
            max={1.8}
            step={0.02}
            onChange={(n) => {
              setStar(n);
              persist();
            }}
          />
          <Field
            label="Drone"
            value={drone}
            min={0}
            max={1}
            step={0.02}
            onChange={(n) => {
              setDrone(n);
              sound.setDrone(n);
              persist();
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setReducedMotion(!reduced);
            sound.click();
          }}
          aria-pressed={reduced}
          className="mt-8 min-h-12 w-full border border-line text-xs tracking-widest uppercase hover:bg-bone hover:text-void"
        >
          Quiet {reduced ? "on" : "off"}
        </button>
      </div>
    </div>
  );
}
