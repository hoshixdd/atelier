import * as THREE from "three";

export function starSprite(size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(c);
  const cx = size / 2;
  const g = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.12, "rgba(255,252,245,0.95)");
  g.addColorStop(0.28, "rgba(210,230,255,0.35)");
  g.addColorStop(0.55, "rgba(160,190,255,0.08)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function fillBox(count: number, spread: THREE.Vector3, origin: THREE.Vector3) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = origin.x + (Math.random() - 0.5) * spread.x;
    pos[i * 3 + 1] = origin.y + (Math.random() - 0.5) * spread.y;
    pos[i * 3 + 2] = origin.z + (Math.random() - 0.5) * spread.z;
  }
  return pos;
}

export function fillSpiral(count: number) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const arm = i % 3;
    const r = Math.pow(Math.random(), 0.45) * 22;
    const a = Math.random() * Math.PI * 2 + r * 0.42 + arm * ((Math.PI * 2) / 3);
    const flatten = 1 - r / 24;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 1.6 * flatten;
    pos[i * 3 + 2] = Math.sin(a) * r * 0.72 - 6;
  }
  return pos;
}

export function fillShell(count: number, r0: number, r1: number) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(Math.random() * 2 - 1);
    const r = r0 + Math.random() * (r1 - r0);
    pos[i * 3] = Math.sin(b) * Math.cos(a) * r;
    pos[i * 3 + 1] = Math.cos(b) * r;
    pos[i * 3 + 2] = Math.sin(b) * Math.sin(a) * r;
  }
  return pos;
}

export function points(
  pos: Float32Array,
  size: number,
  opacity: number,
  map: THREE.Texture,
  blending: THREE.Blending = THREE.AdditiveBlending,
) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size,
    map,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending,
    alphaMap: map,
  });
  return { mesh: new THREE.Points(geo, mat), geo, mat };
}
