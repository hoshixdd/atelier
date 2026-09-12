import { dayPart, dayPartLabel } from "@/lib/ceb";
import { sluglineFor } from "@/lib/director";
import { useAtelier } from "@/store/atelier";

type Source = () => HTMLCanvasElement | null;
let source: Source | null = null;

export function bindCapture(fn: Source | null) {
  source = fn;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export async function captureStill() {
  const gl = source?.();
  if (!gl) return false;
  const w = 1920;
  const h = 1080;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d");
  if (!ctx) return false;

  const srcW = gl.width;
  const srcH = gl.height;
  const srcAspect = srcW / Math.max(1, srcH);
  const destAspect = w / h;
  let sx = 0;
  let sy = 0;
  let sw = srcW;
  let sh = srcH;
  if (srcAspect > destAspect) {
    sw = srcH * destAspect;
    sx = (srcW - sw) / 2;
  } else {
    sh = srcW / destAspect;
    sy = (srcH - sh) / 2;
  }
  ctx.fillStyle = "#050506";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(gl, sx, sy, sw, sh, 0, 0, w, h);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, 48);
  ctx.fillRect(0, h - 48, w, 48);

  const state = useAtelier.getState();
  const path = window.location.pathname || "/";
  const line = state.slugline || sluglineFor(path);
  const part = dayPartLabel(dayPart(state.hour));
  ctx.fillStyle = "rgba(237,234,227,0.92)";
  ctx.font = "500 22px Manrope, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("HOSHIIXDD", w / 2, 34);
  ctx.font = "italic 28px 'Instrument Serif', serif";
  ctx.letterSpacing = "0px";
  ctx.fillText(line, w / 2, h - 18);
  ctx.font = "500 14px Manrope, sans-serif";
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(237,234,227,0.55)";
  ctx.fillText(`CEB · ${part}`, 40, h - 20);
  ctx.textAlign = "right";
  const d = new Date();
  ctx.fillText(`${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`, w - 40, h - 20);

  return new Promise<boolean>((resolve) => {
    out.toBlob((blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `hoshiixdd-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
      resolve(true);
    }, "image/png");
  });
}
