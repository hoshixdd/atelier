import { SITE } from "./site";

export type DayPart = "night" | "morning" | "day" | "dusk";

export function cebHour(date = new Date()) {
  const h = new Intl.DateTimeFormat("en-GB", {
    timeZone: SITE.timezone,
    hour: "2-digit",
    hour12: false,
  }).format(date);
  return Number.parseInt(h, 10);
}

export function dayPart(hour: number): DayPart {
  if (hour < 6 || hour >= 21) return "night";
  if (hour < 11) return "morning";
  if (hour < 17) return "day";
  return "dusk";
}

export function dayPartLabel(part: DayPart) {
  if (part === "night") return "Night watch";
  if (part === "morning") return "Morning light";
  if (part === "dusk") return "Dusk";
  return "Daylight";
}
