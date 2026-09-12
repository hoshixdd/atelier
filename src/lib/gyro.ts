import { useAtelier } from "@/store/atelier";

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

function onOri(e: DeviceOrientationEvent) {
  const gamma = e.gamma ?? 0;
  const beta = e.beta ?? 45;
  useAtelier.getState().setTilt(clamp(gamma / 32, -1, 1), clamp((beta - 45) / 32, -1, 1));
}

let listening = false;

export async function enableGyro() {
  if (listening) return true;
  if (typeof window === "undefined" || !window.DeviceOrientationEvent) return false;
  const DOE = window.DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<string>;
  };
  try {
    if (typeof DOE.requestPermission === "function") {
      const res = await DOE.requestPermission();
      if (res !== "granted") return false;
    }
  } catch {
    return false;
  }
  window.addEventListener("deviceorientation", onOri, { passive: true });
  listening = true;
  useAtelier.getState().setGyroOn(true);
  return true;
}
