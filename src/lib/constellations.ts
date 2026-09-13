export type AsterNode = { id: string; x: number; y: number; z: number };

export type AsterFigure = {
  id: string;
  name: string;
  kicker: string;
  nodeIds: string[];
  edges: [string, string][];
};

type Layout = {
  id: string;
  name: string;
  kicker: string;
  cx: number;
  cy: number;
  cz: number;
  s: number;
  pts: [number, number][];
  edges: [number, number][];
};

const LAYOUTS: Layout[] = [
  { id: "aries", name: "Aries", kicker: "The ram", cx: -1.52, cy: 2.42, cz: 2.55, s: 0.42, pts: [[0, 0.45], [-0.55, -0.05], [0.55, -0.05], [0.85, 0.4]], edges: [[0, 1], [0, 2], [2, 3]] },
  { id: "taurus", name: "Taurus", kicker: "The bull", cx: -0.52, cy: 2.48, cz: 2.5, s: 0.4, pts: [[-0.65, 0.4], [0, -0.05], [0.65, 0.4], [0.2, -0.45]], edges: [[0, 1], [1, 2], [1, 3]] },
  { id: "gemini", name: "Gemini", kicker: "The twins", cx: 0.52, cy: 2.46, cz: 2.52, s: 0.4, pts: [[-0.38, 0.5], [-0.38, -0.45], [0.38, 0.5], [0.38, -0.45]], edges: [[0, 1], [2, 3], [0, 2]] },
  { id: "cancer", name: "Cancer", kicker: "The crab", cx: 1.52, cy: 2.4, cz: 2.55, s: 0.4, pts: [[0, 0.5], [0, 0], [-0.55, -0.42], [0.55, -0.42]], edges: [[0, 1], [1, 2], [1, 3]] },
  { id: "leo", name: "Leo", kicker: "The lion", cx: 1.58, cy: 1.12, cz: 2.58, s: 0.42, pts: [[0.55, 0.2], [0.1, 0.5], [-0.45, 0.28], [-0.5, -0.2], [0.15, -0.48]], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  { id: "virgo", name: "Virgo", kicker: "The maiden", cx: 1.58, cy: -1.12, cz: 2.58, s: 0.42, pts: [[0, 0.55], [0, 0.08], [0, -0.35], [0.48, -0.55]], edges: [[0, 1], [1, 2], [2, 3]] },
  { id: "libra", name: "Libra", kicker: "The scales", cx: 1.5, cy: -2.42, cz: 2.52, s: 0.4, pts: [[-0.52, 0.28], [0.52, 0.28], [0, 0.52], [0, -0.45]], edges: [[0, 1], [0, 2], [1, 2], [2, 3]] },
  { id: "scorpius", name: "Scorpius", kicker: "The hook", cx: 0.5, cy: -2.48, cz: 2.5, s: 0.42, pts: [[-0.7, 0.22], [-0.15, 0.38], [0.35, 0.08], [0.55, -0.32], [0.1, -0.52]], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  { id: "sagittarius", name: "Sagittarius", kicker: "The archer", cx: -0.5, cy: -2.46, cz: 2.52, s: 0.4, pts: [[-0.42, 0.18], [0.12, 0.48], [0.52, 0.1], [0.18, -0.4], [-0.38, -0.22]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]] },
  { id: "capricornus", name: "Capricornus", kicker: "The goat", cx: -1.5, cy: -2.4, cz: 2.55, s: 0.4, pts: [[-0.52, 0.28], [0.52, 0.28], [0, -0.48]], edges: [[0, 1], [1, 2], [2, 0]] },
  { id: "aquarius", name: "Aquarius", kicker: "The water", cx: -1.58, cy: -1.12, cz: 2.58, s: 0.42, pts: [[-0.7, 0.38], [-0.18, -0.05], [0.22, 0.32], [0.72, -0.18]], edges: [[0, 1], [1, 2], [2, 3]] },
  { id: "pisces", name: "Pisces", kicker: "The fish", cx: -1.58, cy: 1.12, cz: 2.58, s: 0.42, pts: [[-0.52, 0.38], [-0.35, -0.22], [0.52, 0.38], [0.35, -0.22]], edges: [[0, 1], [2, 3], [1, 3]] },
];

export const ASTER_NODES: AsterNode[] = [];
export const ASTER_FIGURES: AsterFigure[] = [];

for (const L of LAYOUTS) {
  const nodeIds: string[] = [];
  L.pts.forEach(([x, y], i) => {
    const id = `${L.id}${i}`;
    nodeIds.push(id);
    ASTER_NODES.push({
      id,
      x: L.cx + x * L.s,
      y: L.cy + y * L.s,
      z: L.cz,
    });
  });
  ASTER_FIGURES.push({
    id: L.id,
    name: L.name,
    kicker: L.kicker,
    nodeIds,
    edges: L.edges.map(([a, b]) => [nodeIds[a]!, nodeIds[b]!]),
  });
}

export function edgeKey(a: string, b: string) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function figureComplete(fig: AsterFigure, have: Set<string>) {
  return fig.edges.every(([a, b]) => have.has(edgeKey(a, b)));
}

export function figureCentroid(fig: AsterFigure) {
  let x = 0;
  let y = 0;
  let z = 0;
  const nodes = fig.nodeIds
    .map((id) => ASTER_NODES.find((n) => n.id === id))
    .filter((n): n is AsterNode => Boolean(n));
  if (!nodes.length) return { x: 0, y: 0, z: 0 };
  for (const n of nodes) {
    x += n.x;
    y += n.y;
    z += n.z;
  }
  const k = nodes.length;
  return { x: x / k, y: y / k + 0.28, z: z / k };
}
