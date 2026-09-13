import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { cn } from "@/lib/utils";
import { WORKS } from "@/lib/works";
import { dayPart } from "@/lib/ceb";
import { ASTER_FIGURES, ASTER_NODES, edgeKey, figureCentroid, figureComplete } from "@/lib/constellations";
import { fillBox, fillDebris, fillShell, fillSpiral, points, starSprite } from "@/lib/cosmos";
import { bindCapture } from "@/lib/capture";
import { flyToRoom, flyToShot } from "@/lib/director";
import { sound } from "@/lib/sound";
import { useAtelier, type SceneMode, type SkyLabel } from "@/store/atelier";

const MODE: Record<
  SceneMode,
  { z: number; fog: number; novaScale: number; frameR: number; frameOp: number }
> = {
  home: { z: 7.8, fog: 26, novaScale: 0.68, frameR: 2.55, frameOp: 1 },
  work: { z: 8.0, fog: 24, novaScale: 0.62, frameR: 3.05, frameOp: 1 },
  room: { z: 6.6, fog: 22, novaScale: 0.55, frameR: 3.6, frameOp: 0.2 },
  lab: { z: 8.8, fog: 30, novaScale: 0.55, frameR: 3.8, frameOp: 0.25 },
  about: { z: 1.72, fog: 18, novaScale: 1.42, frameR: 3.8, frameOp: 0.08 },
  colophon: { z: 7.0, fog: 24, novaScale: 0.65, frameR: 3.4, frameOp: 0.18 },
  contact: { z: 6.15, fog: 22, novaScale: 0.58, frameR: 3.5, frameOp: 0.18 },
  notes: { z: 2.15, fog: 20, novaScale: 1.18, frameR: 3.6, frameOp: 0.1 },
  lost: { z: 11, fog: 16, novaScale: 0.4, frameR: 4.2, frameOp: 0.3 },
  play: { z: 7.4, fog: 30, novaScale: 1.12, frameR: 4.4, frameOp: 0 },
};

const WORLD: Record<string, { fog: number; rim: number; nova: number }> = {
  "assess-pilot": { fog: 0x07141c, rim: 0x7eb8e8, nova: 0.82 },
  "a-little-infinity": { fog: 0x0c0618, rim: 0xb08cff, nova: 0.9 },
  "common-table": { fog: 0x160c06, rim: 0xe8b07a, nova: 0.78 },
};

const SHARDS = 12;
const SHARD_COLORS = [0x7ec8e3, 0xf0c36d, 0xd4a5ff, 0x9fe8c3];

const PLANET_LOOK: Record<
  string,
  { radius: number; atmos: number; spin: number; tilt: number; rings: boolean }
> = {
  "assess-pilot": { radius: 0.36, atmos: 0x7eb8e8, spin: 0.28, tilt: 0.32, rings: false },
  "a-little-infinity": { radius: 0.46, atmos: 0xb08cff, spin: 0.14, tilt: 0.55, rings: true },
  "common-table": { radius: 0.33, atmos: 0xe8b07a, spin: 0.32, tilt: 0.18, rings: false },
};

export function AtelierCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mode = useAtelier((s) => s.sceneMode);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const dprCap = isTouch ? 1.2 : 2;
    const farCount = isTouch ? 700 : 1600;
    const midCount = isTouch ? 200 : 480;
    const milkyCount = isTouch ? 500 : 1200;
    const brightCount = isTouch ? 18 : 40;
    const trailCount = isTouch ? 14 : 28;
    const moteCount = isTouch ? 80 : 160;
    const useBloom = !isTouch && !reduced;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isTouch,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));
    renderer.setClearColor(0x08070a, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    if (!isTouch) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08070a, 0.01);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 160);
    camera.position.set(0, 0, 0.9);

    const ambient = new THREE.AmbientLight(0x6a7a99, 0.022);
    scene.add(ambient);
    const hemi = new THREE.HemisphereLight(0x1c283c, 0x040406, 0.16);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffe8c8, 0.42);
    key.position.set(2.4, 3.2, 5.2);
    key.castShadow = !isTouch;
    if (!isTouch) {
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 0.4;
      key.shadow.camera.far = 22;
      key.shadow.camera.left = -7;
      key.shadow.camera.right = 7;
      key.shadow.camera.top = 7;
      key.shadow.camera.bottom = -7;
      key.shadow.bias = -0.0008;
    }
    scene.add(key);
    const rim = new THREE.PointLight(0x7ec8e3, 8, 10, 1.8);
    rim.position.set(0, 0, 0.2);
    scene.add(rim);
    const sun = new THREE.PointLight(0xfff1d0, 92, 16, 1.25);
    sun.position.set(0, 0, 0);
    scene.add(sun);
    const warm = new THREE.PointLight(0xf0c36d, 5, 8, 2);
    warm.position.set(0.5, -0.2, 0.4);
    scene.add(warm);
    const cursorLight = new THREE.PointLight(0xffffff, 6, 9, 2);
    scene.add(cursorLight);

    const starTex = starSprite(128);
    const loader = new THREE.TextureLoader();

    const nova = new THREE.Group();
    const remnantMat = new THREE.SpriteMaterial({
      color: 0xffe4c4,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0,
    });
    const remnant = new THREE.Sprite(remnantMat);
    remnant.scale.set(3.5, 3.5, 1);
    remnant.position.z = 0.02;
    const remnantInnerMat = remnantMat.clone();
    remnantInnerMat.opacity = 0;
    remnantInnerMat.color.setHex(0xffd4a8);
    const remnantInner = new THREE.Sprite(remnantInnerMat);
    remnantInner.scale.set(2.05, 2.05, 1);
    remnantInner.position.z = 0.14;
    const remnantOuterMat = remnantMat.clone();
    remnantOuterMat.opacity = 0;
    remnantOuterMat.color.setHex(0xffc090);
    const remnantOuter = new THREE.Sprite(remnantOuterMat);
    remnantOuter.scale.set(4.35, 4.35, 1);
    remnantOuter.position.z = -0.16;
    const knot = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: starTex,
        color: 0xffc898,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.55,
      }),
    );
    knot.scale.set(1.05, 1.05, 1);

    const ejecta = points(fillShell(isTouch ? 220 : 520, 0.55, 1.55), 0.045, 0.7, starTex);
    (ejecta.mesh.material as THREE.PointsMaterial).color.setHex(0xffd8b0);
    const jetPos = new Float32Array((isTouch ? 90 : 180) * 3);
    for (let i = 0; i < jetPos.length / 3; i++) {
      const up = i % 2 === 0 ? 1 : -1;
      const y = up * (0.4 + Math.random() * 2.4);
      const s = Math.abs(y) * 0.07;
      jetPos[i * 3] = (Math.random() - 0.5) * s;
      jetPos[i * 3 + 1] = y;
      jetPos[i * 3 + 2] = (Math.random() - 0.5) * s;
    }
    const jets = points(jetPos, 0.038, 0.62, starTex);
    (jets.mesh.material as THREE.PointsMaterial).color.setHex(0xffe6c8);
    jets.mesh.rotation.z = 0.42;
    jets.mesh.rotation.x = 0.18;

    function debris(count: number, r0: number, r1: number, flatten: number, warp: number, clumps: number, hex: number, size: number, arc = 1) {
      const pos = fillDebris(count, r0, r1, flatten, warp, clumps, arc);
      const cloud = points(pos, size, 0.82, starTex);
      (cloud.mesh.material as THREE.PointsMaterial).color.setHex(hex);
      return cloud;
    }
    const innerDisk = debris(isTouch ? 420 : 980, 1.05, 1.48, 0.34, 0.08, 3, 0xffd9a0, 0.032);
    const midStream = debris(isTouch ? 280 : 640, 1.62, 2.18, 0.4, 0.16, 2, 0xe8c9ff, 0.036);
    const outerArc = debris(isTouch ? 180 : 420, 2.35, 3.05, 0.48, 0.28, 1.4, 0x9ec8ff, 0.04, 0.62);
    innerDisk.mesh.rotation.x = 0.72;
    midStream.mesh.rotation.x = 0.58;
    midStream.mesh.rotation.z = 0.22;
    outerArc.mesh.rotation.x = 1.05;
    outerArc.mesh.rotation.z = -0.35;

    nova.add(remnantOuter, remnant, remnantInner, knot, ejecta.mesh, jets.mesh, innerDisk.mesh, midStream.mesh, outerArc.mesh);
    const remnantHit = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 16, 16),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    nova.add(remnantHit);
    scene.add(nova);

    const dustCount = isTouch ? 140 : 320;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const b = (Math.random() - 0.5) * 0.85;
      const rr = 0.8 + Math.random() * 2.2;
      dustPos[i * 3] = Math.cos(a) * Math.cos(b) * rr;
      dustPos[i * 3 + 1] = Math.sin(b) * rr * 0.4;
      dustPos[i * 3 + 2] = Math.sin(a) * Math.cos(b) * rr * 0.6;
    }
    const dust = points(dustPos, 0.036, 0.4, starTex);
    (dust.mesh.material as THREE.PointsMaterial).color.setHex(0xffe6c4);
    scene.add(dust.mesh);

    loader.load("/cosmos/remnant.png", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      remnantMat.map = tex;
      remnantMat.opacity = 0.96;
      remnantMat.needsUpdate = true;
      remnantInnerMat.map = tex;
      remnantInnerMat.opacity = 0.62;
      remnantInnerMat.needsUpdate = true;
      remnantOuterMat.map = tex;
      remnantOuterMat.opacity = 0.28;
      remnantOuterMat.needsUpdate = true;
    });

    const far = points(
      fillBox(farCount, new THREE.Vector3(70, 42, 70), new THREE.Vector3(0, 0, -8)),
      0.07,
      0.7,
      starTex,
    );
    const mid = points(
      fillBox(midCount, new THREE.Vector3(36, 22, 36), new THREE.Vector3(0, 0, -2)),
      0.12,
      0.8,
      starTex,
    );
    const milky = points(fillSpiral(milkyCount), 0.09, 0.55, starTex);
    milky.mesh.rotation.x = 0.42;
    milky.mesh.rotation.z = -0.35;
    const bright = points(
      fillBox(brightCount, new THREE.Vector3(28, 16, 28), new THREE.Vector3(0, 0, -3)),
      0.28,
      0.95,
      starTex,
    );
    const motes = points(fillShell(moteCount, 1.55, 2.35), 0.08, 0.85, starTex);
    scene.add(far.mesh, mid.mesh, milky.mesh, bright.mesh, motes.mesh);

    const trailPos = new Float32Array(trailCount * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
    const trail = new THREE.Points(
      trailGeo,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.09,
        map: starTex,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    scene.add(trail);
    const trailState = Array.from({ length: trailCount }, () => ({ x: 0, y: 0, z: 2 }));

    const meteorPos = new Float32Array(6);
    const meteorGeo = new THREE.BufferGeometry();
    meteorGeo.setAttribute("position", new THREE.BufferAttribute(meteorPos, 3));
    const meteor = new THREE.Line(
      meteorGeo,
      new THREE.LineBasicMaterial({ color: 0xc8e4ff, transparent: true, opacity: 0.7 }),
    );
    scene.add(meteor);
    const meteorState = { t: 5, active: 0, ax: 0, ay: 0, az: 0, bx: 0, by: 0, bz: 0 };

    function atmosMat(color: number, op: number) {
      return new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uOp: { value: op },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        vertexShader: `
          varying float vF;
          void main() {
            vec3 n = normalize(normalMatrix * normal);
            vec3 v = normalize(-(modelViewMatrix * vec4(position, 1.0)).xyz);
            vF = pow(1.0 - abs(dot(n, v)), 2.7);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uOp;
          varying float vF;
          void main() {
            gl_FragColor = vec4(uColor, vF * uOp);
          }
        `,
      });
    }
    const frames: THREE.Group[] = [];
    const planetBodies: THREE.Mesh[] = [];
    const sphereGeoCache = new Map<number, THREE.SphereGeometry>();
    WORKS.forEach((work, i) => {
      const look = PLANET_LOOK[work.slug] ?? PLANET_LOOK["assess-pilot"];
      const g = new THREE.Group();
      g.userData.angle = (i / WORKS.length) * Math.PI * 2 - Math.PI / 2;
      g.userData.slug = work.slug;
      g.userData.title = work.title;
      g.userData.index = work.index;
      g.userData.spin = look.spin;
      g.userData.tilt = look.tilt;
      g.rotation.z = look.tilt;
      let bodyGeo = sphereGeoCache.get(look.radius);
      if (!bodyGeo) {
        bodyGeo = new THREE.SphereGeometry(look.radius, 64, 48);
        sphereGeoCache.set(look.radius, bodyGeo);
      }
      const body = new THREE.Mesh(
        bodyGeo,
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.72,
          metalness: 0.04,
        }),
      );
      body.castShadow = !isTouch;
      body.receiveShadow = !isTouch;
      body.userData.slug = work.slug;
      body.userData.title = work.title;
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(0.85, look.radius * 2.6), 16, 12),
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      hit.userData.slug = work.slug;
      hit.userData.title = work.title;
      const atmos = new THREE.Mesh(
        new THREE.SphereGeometry(look.radius * 1.14, 40, 28),
        atmosMat(look.atmos, 0.55),
      );
      g.add(body, atmos, hit);
      if (look.rings) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(look.radius * 1.7, 0.028, 8, 80),
          new THREE.MeshBasicMaterial({
            color: 0xd4c4a8,
            transparent: true,
            opacity: 0.55,
            side: THREE.DoubleSide,
          }),
        );
        ring.rotation.x = Math.PI / 2.15;
        g.add(ring);
      }
      loader.load(work.planet, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        tex.wrapS = THREE.RepeatWrapping;
        (body.material as THREE.MeshStandardMaterial).map = tex;
        (body.material as THREE.MeshStandardMaterial).needsUpdate = true;
      });
      scene.add(g);
      frames.push(g);
      planetBodies.push(body);
      planetBodies.push(hit);
    });

    type Extra = {
      group: THREE.Group;
      body: THREE.Mesh;
      a0: number;
      orbit: number;
      speed: number;
      spin: number;
      y: number;
    };
    const extras: Extra[] = [];
    const extraHits: THREE.Mesh[] = [];
    const extraDefs = [
      { map: "/cosmos/planets/ice.jpg", radius: 0.2, orbit: 3.45, speed: 0.032, spin: 0.35, atmos: 0xa8e4ff, a0: 0.6, y: 0.62, secret: "ice", title: "Ice" },
      { map: "/cosmos/planets/volcanic.jpg", radius: 0.18, orbit: 3.85, speed: 0.026, spin: 0.42, atmos: 0xff6a3c, a0: 2.3, y: -0.72, secret: "volcanic", title: "Heat" },
      { map: "/cosmos/planets/moon.jpg", radius: 0.12, orbit: 4.15, speed: 0.04, spin: 0.6, atmos: 0, a0: 3.9, y: 0.95, secret: "stone", title: "Stone" },
      { map: "/cosmos/planets/ice.jpg", radius: 0.1, orbit: 4.4, speed: 0.02, spin: 0.18, atmos: 0x88aacc, a0: 5.1, y: -1.05, secret: "drift", title: "Drift" },
      { map: "/cosmos/planets/volcanic.jpg", radius: 0.09, orbit: 3.2, speed: 0.048, spin: 0.55, atmos: 0, a0: 1.4, y: 1.15, secret: "ember", title: "Ember" },
    ];
    extraDefs.forEach((d) => {
      const g = new THREE.Group();
      const geo = new THREE.SphereGeometry(d.radius, 32, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.78,
        metalness: 0.05,
      });
      const body = new THREE.Mesh(geo, mat);
      body.castShadow = !isTouch;
      body.receiveShadow = !isTouch;
      body.userData.secret = d.secret;
      body.userData.title = d.title;
      g.add(body);
      if (d.atmos) {
        g.add(
          new THREE.Mesh(
            new THREE.SphereGeometry(d.radius * 1.16, 28, 20),
            atmosMat(d.atmos, 0.5),
          ),
        );
      }
      loader.load(d.map, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        mat.map = tex;
        mat.needsUpdate = true;
      });
      scene.add(g);
      extras.push({ group: g, body, a0: d.a0, orbit: d.orbit, speed: d.speed, spin: d.spin, y: d.y });
      extraHits.push(body);
    });

    const moons: { mesh: THREE.Mesh; parent: THREE.Group; r: number; speed: number; phase: number }[] = [];
    const moonGeo = new THREE.SphereGeometry(1, 16, 12);
    const moonMat = new THREE.MeshStandardMaterial({ color: 0xb0b4b8, roughness: 0.85, metalness: 0.05 });
    loader.load("/cosmos/planets/moon.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      moonMat.map = tex;
      moonMat.needsUpdate = true;
    });
    [
      { parent: 0, r: 0.58, size: 0.08, speed: 1.15, phase: 0.2 },
      { parent: 1, r: 0.78, size: 0.1, speed: 0.82, phase: 1.4 },
      { parent: 2, r: 0.52, size: 0.07, speed: 1.4, phase: 2.6 },
    ].forEach((m) => {
      const mesh = new THREE.Mesh(moonGeo, moonMat);
      mesh.scale.setScalar(m.size);
      mesh.castShadow = !isTouch;
      mesh.receiveShadow = !isTouch;
      scene.add(mesh);
      moons.push({ mesh, parent: frames[m.parent]!, r: m.r, speed: m.speed, phase: m.phase });
    });

    const beltCount = isTouch ? 160 : 380;
    const beltPos = new Float32Array(beltCount * 3);
    for (let i = 0; i < beltCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 3.28 + Math.random() * 0.55;
      beltPos[i * 3] = Math.cos(a) * r;
      beltPos[i * 3 + 1] = (Math.random() - 0.5) * 0.22;
      beltPos[i * 3 + 2] = Math.sin(a) * r * 0.38 + 0.35;
    }
    const belt = points(beltPos, 0.035, 0.7, starTex);
    scene.add(belt.mesh);

    const beacon = new THREE.Group();
    const beaconCore = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: starTex,
        color: 0x7ec8e3,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    beaconCore.scale.set(0.55, 0.55, 1);
    beacon.add(beaconCore);
    beacon.position.set(5.2, 1.35, -1.4);
    scene.add(beacon);

    const linePos = new Float32Array(WORKS.length * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    const constellation = new THREE.LineLoop(
      lineGeo,
      new THREE.LineBasicMaterial({ color: 0x7ec8e3, transparent: true, opacity: 0.18 }),
    );
    scene.add(constellation);

    const shards: THREE.Sprite[] = [];
    function placeShard(s: THREE.Sprite, i: number) {
      const a = (i / SHARDS) * Math.PI * 2 + Math.random() * 0.25;
      s.userData.a = a;
      s.userData.r = 2.15 + Math.random() * 0.7;
      s.userData.y = (Math.random() - 0.5) * 1.4;
      s.userData.speed = 0.16 + Math.random() * 0.2;
      s.userData.taken = false;
      s.visible = true;
      s.scale.setScalar(0.38);
    }
    for (let i = 0; i < SHARDS; i++) {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: starTex,
          color: SHARD_COLORS[i % SHARD_COLORS.length],
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      placeShard(s, i);
      shards.push(s);
      scene.add(s);
    }

    const visitorGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const visitorMat = new THREE.MeshBasicMaterial({
      color: 0x7ec8e3,
      transparent: true,
      opacity: 0.8,
    });
    const visitorMeshes = Array.from({ length: 8 }, () => {
      const m = new THREE.Mesh(visitorGeo, visitorMat);
      m.visible = false;
      scene.add(m);
      return m;
    });

    const asterHits: THREE.Mesh[] = [];
    const asterSprites: THREE.Sprite[] = [];
    const asterPos = new Map<string, THREE.Vector3>();
    ASTER_NODES.forEach((n) => {
      const pos = new THREE.Vector3(n.x, n.y, n.z);
      asterPos.set(n.id, pos);
      const spr = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: starTex,
          color: 0xfff4dc,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          opacity: 1,
        }),
      );
      spr.position.copy(pos);
      spr.scale.setScalar(0.55);
      spr.renderOrder = 4;
      spr.userData.id = n.id;
      scene.add(spr);
      asterSprites.push(spr);
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 12, 10),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      );
      hit.position.copy(pos);
      hit.userData.id = n.id;
      scene.add(hit);
      asterHits.push(hit);
    });
    const asterHave = new Set<string>();
    const asterDone = new Set<string>();
    let asterPick: string | null = null;
    const asterLineGeo = new THREE.BufferGeometry();
    const asterLinePos = new Float32Array(256 * 3);
    asterLineGeo.setAttribute("position", new THREE.BufferAttribute(asterLinePos, 3));
    const asterLines = new THREE.LineSegments(
      asterLineGeo,
      new THREE.LineBasicMaterial({
        color: 0xfff0d4,
        transparent: true,
        opacity: 0.92,
        depthTest: false,
      }),
    );
    asterLines.renderOrder = 3;
    scene.add(asterLines);
    function rebuildAsterLines() {
      let i = 0;
      asterHave.forEach((key) => {
        const [a, b] = key.split("|");
        const pa = asterPos.get(a ?? "");
        const pb = asterPos.get(b ?? "");
        if (!pa || !pb || i + 6 > asterLinePos.length) return;
        asterLinePos[i++] = pa.x;
        asterLinePos[i++] = pa.y;
        asterLinePos[i++] = pa.z;
        asterLinePos[i++] = pb.x;
        asterLinePos[i++] = pb.y;
        asterLinePos[i++] = pb.z;
      });
      asterLineGeo.setDrawRange(0, i / 3);
      asterLineGeo.attributes.position.needsUpdate = true;
    }
    function nameSprite(text: string) {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 96;
      const ctx = c.getContext("2d");
      if (!ctx) return null;
      ctx.clearRect(0, 0, 512, 96);
      ctx.fillStyle = "rgba(244,241,234,0.95)";
      ctx.font = "italic 42px 'Instrument Serif', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 12;
      ctx.fillText(text, 256, 48);
      const tex = new THREE.CanvasTexture(c);
      const spr = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.95 }),
      );
      spr.scale.set(1.35, 0.26, 1);
      return spr;
    }
    function markFound(fig: (typeof ASTER_FIGURES)[number], state: ReturnType<typeof useAtelier.getState>) {
      if (state.asterFound.includes(fig.id)) return;
      state.addAsterFound(fig.id);
      fig.nodeIds.forEach((nid) => asterDone.add(nid));
      const mid = figureCentroid(fig);
      const label = nameSprite(fig.name);
      if (label) {
        label.position.set(mid.x, mid.y, mid.z);
        scene.add(label);
      }
      state.setSlugline(`${fig.kicker.toUpperCase()} — ${fig.name.toUpperCase()}`);
      window.setTimeout(() => {
        if (useAtelier.getState().slugline?.includes(fig.name.toUpperCase())) {
          useAtelier.getState().setSlugline(null);
        }
      }, 3200);
      sound.letter();
      pulse = Math.max(pulse, 0.7);
    }
    function connectAster(id: string, state: ReturnType<typeof useAtelier.getState>) {
      if (asterPick === id) {
        asterPick = null;
        return;
      }
      if (!asterPick) {
        asterPick = id;
        sound.hover();
        return;
      }
      const key = edgeKey(asterPick, id);
      asterPick = id;
      if (asterHave.has(key)) return;
      asterHave.add(key);
      rebuildAsterLines();
      sound.click();
      pulse = Math.max(pulse, 0.28);
      for (const fig of ASTER_FIGURES) {
        if (state.asterFound.includes(fig.id)) continue;
        if (!figureComplete(fig, asterHave)) continue;
        markFound(fig, state);
      }
    }

    let lastStrike = 0;

    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    if (useBloom) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.2, 0.26, 0.48);
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());
    }

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const proj = new THREE.Vector3();
    const hitPlanes = planetBodies;

    const clockStart = performance.now();
    let raf = 0;
    let running = true;
    let pulse = 0;
    let completing = false;
    let frameN = 0;
    let introT0 = 0;
    const pointer = { x: 0, y: 0 };
    const cam = { x: 0, y: 0, z: 0.42 };
    const look = { x: 0, y: 0, z: 0 };
    const fov = { v: 42 };
    const orbit = { theta: 0.28, phi: 0.12, radius: 7.4 };
    let dolly = 0;
    const press = { x: 0, y: 0, active: false, dragged: false };

    function interactive(t: EventTarget | null) {
      return Boolean(
        (t as HTMLElement | null)?.closest?.(
          "a, button, input, textarea, select, [role='dialog'], [data-desk], [data-palette], [data-letter]",
        ),
      );
    }

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.x = nx;
      pointer.y = ny;
      const state = useAtelier.getState();
      state.setPointer(nx, ny);
      if (press.active && state.sceneMode === "play") {
        const dx = e.clientX - press.x;
        const dy = e.clientY - press.y;
        if (Math.hypot(dx, dy) > 6) press.dragged = true;
        if (press.dragged) {
          orbit.theta -= dx * 0.0045;
          orbit.phi = Math.max(-1.15, Math.min(1.15, orbit.phi + dy * 0.004));
          press.x = e.clientX;
          press.y = e.clientY;
        }
      }
      if (state.deskOpen || state.paletteOpen || state.secretId || !state.entered || interactive(e.target)) {
        if (state.hoverLabel) state.setHoverLabel(null);
        return;
      }
      ndc.set(nx, -ny);
      raycaster.setFromCamera(ndc, camera);
      if (state.sceneMode === "play") {
        const hits = raycaster.intersectObjects(shards.filter((s) => s.visible), false);
        const next = hits[0] ? "Shard" : null;
        if (next !== state.hoverLabel) state.setHoverLabel(next);
        return;
      }
      if (state.sceneMode === "home" || state.sceneMode === "work") {
        const starHover = raycaster.intersectObjects(asterHits, false);
        if (starHover[0]) {
          if (state.hoverLabel !== "Star") state.setHoverLabel("Star");
          return;
        }
      }
      const named = raycaster.intersectObjects(hitPlanes, false);
      if (named[0]) {
        const title = named[0].object.userData.title as string | undefined;
        const slug = named[0].object.userData.slug as string | undefined;
        if (title !== state.hoverLabel) state.setHoverLabel(title ?? null);
        if (!state.isTouch && slug && slug !== state.focusSlug) state.setFocusSlug(slug);
        return;
      }
      if (state.sceneMode === "home" || state.sceneMode === "work") {
        if (raycaster.intersectObject(remnantHit, false).length) {
          if (state.hoverLabel !== "Hoshi") state.setHoverLabel("Hoshi");
          if (!state.isTouch && state.focusSlug !== "remnant") state.setFocusSlug("remnant");
          return;
        }
      }
      if (!state.isTouch && state.focusSlug) state.setFocusSlug(null);
      const unnamed = raycaster.intersectObjects(extraHits, false);
      const title = unnamed[0]?.object.userData.title as string | undefined;
      if (title !== state.hoverLabel) state.setHoverLabel(title ?? null);
    };

    const onDown = (e: PointerEvent) => {
      onMove(e);
      press.x = e.clientX;
      press.y = e.clientY;
      press.active = true;
      press.dragged = false;
    };

    const onUp = (e: PointerEvent) => {
      if (!press.active) return;
      press.active = false;
      const state = useAtelier.getState();
      if (state.deskOpen || state.paletteOpen || state.secretId || !state.entered || interactive(e.target)) return;
      if (press.dragged) return;
      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      if (state.sceneMode === "play") {
        const hits = raycaster.intersectObjects(shards.filter((s) => s.visible), false);
        const shard = hits[0]?.object as THREE.Sprite | undefined;
        if (shard && !shard.userData.taken) {
          shard.userData.taken = true;
          shard.visible = false;
          const next = shards.filter((s) => s.userData.taken).length;
          state.setHarvested(next);
          sound.harvest();
          pulse = Math.max(pulse, 0.4);
          if (next >= SHARDS && !completing) {
            completing = true;
            sound.nova();
            pulse = 1;
            window.setTimeout(() => {
              shards.forEach((s, i) => placeShard(s, i));
              useAtelier.getState().addNova();
              completing = false;
            }, 1400);
          }
          return;
        }
        if (raycaster.intersectObject(remnantHit, false).length) {
          pulse = Math.max(pulse, 0.9);
          sound.nova();
        }
        return;
      }
      if (state.sceneMode === "home" || state.sceneMode === "work") {
        const starHit = raycaster.intersectObjects(asterHits, false);
        const starId = starHit[0]?.object.userData.id as string | undefined;
        if (starId) {
          connectAster(starId, state);
          return;
        }
      }
      const hits = raycaster.intersectObjects(hitPlanes, false);
      const slug = hits[0]?.object.userData.slug as string | undefined;
      if (slug) {
        if (state.isTouch && state.focusSlug !== slug) {
          sound.hover();
          state.setFocusSlug(slug);
          return;
        }
        flyToRoom(slug);
        return;
      }
      if (state.isTouch) state.setFocusSlug(null);
      const remnantHits = raycaster.intersectObject(remnantHit, false);
      if (remnantHits.length && (state.sceneMode === "home" || state.sceneMode === "work")) {
        if (state.isTouch && state.focusSlug !== "remnant") {
          sound.hover();
          state.setFocusSlug("remnant");
          return;
        }
        pulse = Math.max(pulse, 0.85);
        flyToShot("/about");
        return;
      }
      const secretHit = raycaster.intersectObjects(extraHits, false);
      const secret = secretHit[0]?.object.userData.secret as string | undefined;
      if (secret) {
        sound.letter();
        state.setSecretId(secret);
        return;
      }
    };

    const onWheel = (e: WheelEvent) => {
      const mode = useAtelier.getState().sceneMode;
      if (mode === "play") {
        orbit.radius = Math.max(4.4, Math.min(16, orbit.radius + e.deltaY * 0.008));
        return;
      }
      if (mode === "home" || mode === "work") {
        dolly = Math.max(-2.4, Math.min(3.2, dolly + e.deltaY * 0.0065));
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    const onLost = (e: Event) => e.preventDefault();
    canvas.addEventListener("webglcontextlost", onLost);
    bindCapture(() => renderer.domElement);

    const resize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w < 1 || h < 1) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      composer?.setSize(w, h);
      bloomPass?.setSize(w, h);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const tick = () => {
      if (!running) return;
      const t = (performance.now() - clockStart) / 1000;
      const state = useAtelier.getState();
      const target = MODE[state.sceneMode];
      const motion = reduced || state.reducedMotion || !state.entered ? 0.1 : 1;
      const part = dayPart(state.hour);
      const playing = state.sceneMode === "play";
      pulse *= 0.955;
      frameN += 1;
      if (state.strikeN !== lastStrike) {
        pulse = Math.max(pulse, 0.72);
        lastStrike = state.strikeN;
      }
      dust.mesh.rotation.y = t * 0.018 * motion;
      dust.mesh.rotation.z = Math.sin(t * 0.11) * 0.05;
      if (state.entered && introT0 === 0) introT0 = performance.now();
      const introK = !state.entered
        ? 0
        : reduced || state.reducedMotion
          ? 1
          : Math.min(1, (performance.now() - introT0) / 7200);
      const introEase = 1 - Math.pow(1 - introK, 3);

      const ambT = part === "night" ? 0.016 : part === "morning" ? 0.03 : part === "dusk" ? 0.024 : 0.028;
      const keyT = part === "night" ? 0.22 : part === "morning" ? 0.48 : part === "dusk" ? 0.36 : 0.42;
      ambient.intensity += (ambT - ambient.intensity) * 0.04;
      key.intensity += (keyT - key.intensity) * 0.04;
      sun.color.setHex(part === "night" ? 0xffe8d2 : part === "dusk" ? 0xffc090 : 0xfff1d0);
      key.color.setHex(part === "night" ? 0xc8b8a0 : part === "morning" ? 0xffd4a8 : part === "dusk" ? 0xffb078 : 0xffe8c8);

      if (playing) {
        fov.v += (50 - fov.v) * 0.05;
        const ct = Math.cos(orbit.phi);
        camera.position.set(
          Math.sin(orbit.theta) * ct * orbit.radius,
          Math.sin(orbit.phi) * orbit.radius,
          Math.cos(orbit.theta) * ct * orbit.radius,
        );
        camera.lookAt(0, 0, 0);
      } else {
        const dock = state.pendingSlug
          ? frames.find((g) => g.userData.slug === state.pendingSlug)
          : state.workSlug
            ? frames.find((g) => g.userData.slug === state.workSlug)
            : null;
        const sc = state.sceneMode === "home" ? state.homeScroll : 0;
        let tx = 0;
        let ty = 0;
        let tz = 0.42 + (target.z - 0.42) * introEase;
        let lx = 0;
        let ly = 0;
        let lz = 0;
        let wantFov = 42;

        if (state.pendingSlug === "remnant") {
          wantFov = 24;
          tx = 0;
          ty = 0;
          tz = 1.7;
          lx = 0;
          ly = 0;
          lz = 0;
        } else if (dock && state.pendingSlug) {
          wantFov = 28;
          tx = dock.position.x * 0.78;
          ty = dock.position.y * 0.78;
          tz = dock.position.z + 1.25;
          lx = dock.position.x;
          ly = dock.position.y;
          lz = dock.position.z;
        } else if (dock && state.sceneMode === "room") {
          wantFov = 36;
          tx = dock.position.x * 0.42;
          ty = dock.position.y * 0.32 + 0.15;
          tz = 5.15;
          lx = dock.position.x * 0.55;
          ly = dock.position.y * 0.4;
          lz = 0;
        } else if (state.sceneMode === "contact") {
          wantFov = 34;
          tx = 2.4;
          ty = 0.55;
          tz = 5.6;
          lx = beacon.position.x;
          ly = beacon.position.y;
          lz = beacon.position.z;
        } else if (state.sceneMode === "about" || state.sceneMode === "notes") {
          wantFov = 54;
          tx = 0.12 * motion;
          ty = 0.08;
          tz = target.z;
          lx = 0;
          ly = 0;
          lz = 0;
        } else {
          const ang = sc * Math.PI * 1.2;
          const portrait = camera.aspect > 0 && camera.aspect < 0.86;
          wantFov = (portrait ? 54 : 42) - sc * 6 - dolly * 2.2;
          tx = Math.sin(ang) * (0.9 + sc * 2.1) + pointer.x * 0.4 * motion + state.tiltX * 0.85 * motion;
          ty = Math.sin(ang * 0.5) * 0.45 - pointer.y * 0.22 * motion + (portrait ? 0.22 : 0) + state.tiltY * 0.55 * motion;
          tz = tz - sc * 1.85 + dolly + (portrait ? 1.35 : 0);
          lx = Math.sin(ang) * 0.35 + pointer.x * 0.08;
          ly = (portrait ? -0.15 : 0) - pointer.y * 0.05;
          lz = 0;
        }

        fov.v += (wantFov - fov.v) * 0.05;
        cam.x += (tx - cam.x) * 0.055;
        cam.y += (ty - cam.y) * 0.055;
        cam.z += (tz - cam.z) * 0.05;
        look.x += (lx - look.x) * 0.07;
        look.y += (ly - look.y) * 0.07;
        look.z += (lz - look.z) * 0.07;
        camera.position.set(cam.x, cam.y, cam.z);
        camera.lookAt(look.x, look.y, look.z);
      }
      if (Math.abs(camera.fov - fov.v) > 0.05) {
        camera.fov = fov.v;
        camera.updateProjectionMatrix();
      }

      const world = state.workSlug ? WORLD[state.workSlug] : null;
      const novaMul = (world?.nova ?? 1) * (state.novas > 0 ? 1.08 : 1);
      const ns =
        (0.85 + (target.novaScale - 0.85) * introEase) * state.star * (1 + pulse * 0.25) * novaMul;
      nova.scale.setScalar(nova.scale.x + (ns - nova.scale.x) * 0.06);
      if (!playing && state.sceneMode !== "home" && state.sceneMode !== "work") dolly *= 0.9;
      nova.rotation.x += (pointer.y * 0.1 * motion - nova.rotation.x) * 0.045;
      nova.rotation.y += (pointer.x * 0.1 * motion - nova.rotation.y) * 0.045;
      remnant.material.rotation = t * 0.018 * motion;
      remnantInner.material.rotation = -t * 0.032 * motion;
      remnantOuter.material.rotation = t * 0.01 * motion;
      const near = Math.max(0, 1.15 - camera.position.z * 0.09);
      const breathe = 1 + Math.sin(t * 0.55) * 0.012 * motion + pulse * 0.12;
      remnant.scale.set(3.5 * breathe, 3.5 * breathe, 1);
      remnantInner.scale.set(2.05 * (1 + pulse * 0.18), 2.05 * (1 + pulse * 0.18), 1);
      remnantOuter.scale.set(4.35 + pulse * 0.45, 4.35 + pulse * 0.45, 1);
      remnantInner.position.z = 0.14 + near * 0.22;
      remnantOuter.position.z = -0.16 - near * 0.28;
      knot.scale.setScalar(1.02 + Math.sin(t * 1.6) * 0.08 + pulse * 0.28);
      innerDisk.mesh.rotation.z = t * 0.055 * motion;
      midStream.mesh.rotation.z = 0.22 + t * 0.028 * motion;
      outerArc.mesh.rotation.z = -0.35 + t * 0.014 * motion;
      ejecta.mesh.rotation.y = t * 0.07 * motion;
      ejecta.mesh.rotation.x = t * 0.03 * motion;
      jets.mesh.rotation.y = t * 0.12 * motion;
      motes.mesh.rotation.y = t * 0.08 * motion;
      motes.mesh.rotation.x = t * 0.03 * motion;

      far.mesh.rotation.y = t * 0.005 * motion;
      mid.mesh.rotation.y = t * 0.012 * motion;
      milky.mesh.rotation.y = t * 0.008 * motion;
      bright.mesh.rotation.y = t * 0.007 * motion;

      const fogCol = world?.fog ?? 0x050506;
      (scene.fog as THREE.FogExp2).color.setHex(fogCol);
      (scene.fog as THREE.FogExp2).density =
        (0.008 + (1 / target.fog) * 0.12) * state.fog * (part === "night" ? 1.1 : 1);
      rim.intensity = 7 + pulse * 10;
      if (world) rim.color.setHex(world.rim);
      else rim.color.setHex(0x7ec8e3);
      warm.intensity = 8 + pulse * 16;
      if (bloomPass) bloomPass.strength = 0.18 + pulse * 0.16 + (state.novas > 0 ? 0.04 : 0);

      frames.forEach((g, i) => {
        const show = target.frameOp > 0.04;
        g.visible = show;
        const a = g.userData.angle + t * 0.055 * motion;
        const r = target.frameR;
        g.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.78, 0.48);
        const hovered = state.hoverLabel === g.userData.title;
        const landed = state.workSlug === g.userData.slug;
        const held = state.focusSlug === g.userData.slug;
        const want = landed ? 1.28 : hovered || held ? 1.18 : 1;
        const cur = g.scale.x + (want - g.scale.x) * 0.12;
        g.scale.setScalar(cur);
        g.children[0].rotation.y = t * g.userData.spin * motion;
        linePos[i * 3] = g.position.x;
        linePos[i * 3 + 1] = g.position.y;
        linePos[i * 3 + 2] = g.position.z;
      });
      constellation.visible = target.frameOp > 0.35;
      lineGeo.attributes.position.needsUpdate = true;

      extras.forEach((ex) => {
        ex.group.visible = target.frameOp > 0.2;
        const a = ex.a0 + t * ex.speed * motion;
        ex.group.position.set(
          Math.cos(a) * ex.orbit,
          ex.y + Math.sin(a * 0.7) * 0.12,
          Math.sin(a) * ex.orbit * 0.34 + 0.3,
        );
        ex.body.rotation.y = t * ex.spin * motion;
      });
      moons.forEach((m) => {
        m.mesh.visible = target.frameOp > 0.2 && m.parent.visible;
        const a = m.phase + t * m.speed * motion;
        m.mesh.position.set(
          m.parent.position.x + Math.cos(a) * m.r,
          m.parent.position.y + Math.sin(a * 1.3) * m.r * 0.35,
          m.parent.position.z + Math.sin(a) * m.r * 0.55,
        );
        m.mesh.rotation.y = t * 0.6;
      });
      belt.mesh.visible = target.frameOp > 0.25;
      belt.mesh.rotation.y = t * 0.012 * motion;
      const beaconOn = state.sceneMode === "contact" || state.sceneMode === "home";
      beacon.visible = beaconOn;
      const b = 0.42 + Math.sin(t * 3.1) * 0.14;
      beaconCore.scale.set(b, b, 1);

      shards.forEach((s) => {
        s.visible = playing && !s.userData.taken;
        if (!s.visible) return;
        const a = s.userData.a + t * s.userData.speed * motion;
        s.position.set(
          Math.cos(a) * s.userData.r,
          s.userData.y + Math.sin(a * 1.3) * 0.18,
          Math.sin(a) * s.userData.r,
        );
        const sc = 0.34 + Math.sin(t * 3 + s.userData.a) * 0.06;
        s.scale.setScalar(sc);
      });

      const tx = pointer.x * 3.6;
      const ty = -pointer.y * 2.2;
      trailState.forEach((p, i) => {
        const ease = 0.08 + i * 0.012;
        p.x += (tx - p.x) * ease;
        p.y += (ty - p.y) * ease;
        p.z += (2.1 - p.z) * 0.05;
        trailPos[i * 3] = p.x;
        trailPos[i * 3 + 1] = p.y;
        trailPos[i * 3 + 2] = p.z;
      });
      trailGeo.attributes.position.needsUpdate = true;

      meteorState.t -= 0.016 * motion;
      if (meteorState.t < 0 && meteorState.active <= 0) {
        meteorState.active = 1;
        meteorState.ax = (Math.random() - 0.5) * 16;
        meteorState.ay = 4 + Math.random() * 4;
        meteorState.az = -6 - Math.random() * 6;
        meteorState.bx = meteorState.ax - 6 - Math.random() * 4;
        meteorState.by = meteorState.ay - 7;
        meteorState.bz = meteorState.az + 2;
        meteorState.t = 7 + Math.random() * 8;
      }
      if (meteorState.active > 0) {
        meteorState.active -= 0.018 * motion;
        const k = 1 - meteorState.active;
        meteorPos[0] = meteorState.ax + (meteorState.bx - meteorState.ax) * k;
        meteorPos[1] = meteorState.ay + (meteorState.by - meteorState.ay) * k;
        meteorPos[2] = meteorState.az + (meteorState.bz - meteorState.az) * k;
        meteorPos[3] = meteorPos[0] - 0.9;
        meteorPos[4] = meteorPos[1] - 0.35;
        meteorPos[5] = meteorPos[2] + 0.15;
        meteorGeo.attributes.position.needsUpdate = true;
        (meteor.material as THREE.LineBasicMaterial).opacity = Math.max(0, meteorState.active);
      }

      cursorLight.position.set(pointer.x * 4, -pointer.y * 2.5, 2.4);

      const ids = Object.keys(state.visitors);
      visitorMeshes.forEach((m, i) => {
        const v = state.visitors[ids[i] ?? ""];
        if (!v) {
          m.visible = false;
          return;
        }
        m.visible = true;
        m.position.set(v.x * 4.2, -v.y * 2.6, 2.15);
      });

      if (document.hidden) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (frameN % 4 === 0 && state.entered && !state.introPlaying && state.sceneMode === "home") {
        const next: SkyLabel[] = frames.map((g) => {
          proj.copy(g.position).project(camera);
          return {
            id: g.userData.slug as string,
            title: g.userData.title as string,
            index: g.userData.index as string,
            x: (proj.x * 0.5 + 0.5) * 100,
            y: (-proj.y * 0.5 + 0.5) * 100,
          };
        });
        state.setLabels(next);
      }

      asterSprites.forEach((spr) => {
        const id = spr.userData.id as string;
        const on = id === asterPick;
        const done = asterDone.has(id);
        const s = on ? 0.68 + Math.sin(t * 6) * 0.08 : done ? 0.58 : 0.52;
        spr.scale.setScalar(s);
        (spr.material as THREE.SpriteMaterial).color.setHex(
          done ? 0xffd78a : on ? 0xffe6b0 : id.startsWith("h") ? 0xd4eeff : 0xfff4dc,
        );
      });
      if (state.directorOn && frameN % 3 === 0) state.setCam(camera.position.z, camera.fov);

      if (composer) composer.render();
      else renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("webglcontextlost", onLost);
      bindCapture(null);
      dust.geo.dispose();
      (dust.mesh.material as THREE.Material).dispose();
      asterLineGeo.dispose();
      asterHits.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      asterSprites.forEach((s) => (s.material as THREE.Material).dispose());
      ro.disconnect();
      composer?.dispose();
      starTex.dispose();
      remnantMat.map?.dispose();
      remnantMat.dispose();
      remnantInnerMat.dispose();
      remnantOuterMat.dispose();
      remnantHit.geometry.dispose();
      (remnantHit.material as THREE.Material).dispose();
      ejecta.geo.dispose();
      ejecta.mat.dispose();
      jets.geo.dispose();
      jets.mat.dispose();
      innerDisk.geo.dispose();
      innerDisk.mat.dispose();
      midStream.geo.dispose();
      midStream.mat.dispose();
      outerArc.geo.dispose();
      outerArc.mat.dispose();
      far.geo.dispose();
      far.mat.dispose();
      mid.geo.dispose();
      mid.mat.dispose();
      milky.geo.dispose();
      milky.mat.dispose();
      bright.geo.dispose();
      bright.mat.dispose();
      motes.geo.dispose();
      motes.mat.dispose();
      belt.geo.dispose();
      belt.mat.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      extras.forEach((ex) => {
        ex.group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            const m = obj.material;
            if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
            else if (m !== moonMat) m.dispose();
          }
        });
      });
      trailGeo.dispose();
      meteorGeo.dispose();
      lineGeo.dispose();
      visitorGeo.dispose();
      visitorMat.dispose();
      frames.forEach((g) => {
        g.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            const m = obj.material;
            if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
            else m.dispose();
          }
        });
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} className="atelier-sky pointer-events-none fixed inset-0 z-0">
      <canvas
        ref={canvasRef}
        className={cn(
          "h-full w-full transition-opacity duration-700",
          mode === "home" || mode === "lost" || mode === "contact" || mode === "lab" || mode === "play"
            ? "opacity-100"
            : "opacity-70",
        )}
      />
    </div>
  );
}
