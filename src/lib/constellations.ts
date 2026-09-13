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
  { id: "hoshi", name: "Hoshi", kicker: "The star", cx: -1.62, cy: -1.42, cz: 3.48, s: 0.3, pts: [[0, 0.55], [-0.55, 0.12], [-0.34, -0.48], [0.34, -0.48], [0.55, 0.12]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]] },
  { id: "cassiopeia", name: "Cassiopeia", kicker: "The W", cx: -1.58, cy: 1.55, cz: 3.42, s: 0.32, pts: [[-0.9, 0.18], [-0.42, -0.32], [0, 0.28], [0.42, -0.32], [0.9, 0.18]], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  { id: "belt", name: "The Belt", kicker: "Three in a line", cx: -0.72, cy: -1.68, cz: 3.4, s: 0.3, pts: [[-0.7, 0], [0, 0.12], [0.7, 0]], edges: [[0, 1], [1, 2]] },
  { id: "lyra", name: "Lyra", kicker: "The harp", cx: 1.58, cy: 1.55, cz: 3.42, s: 0.3, pts: [[0, 0.5], [-0.42, 0], [0.42, 0], [0, -0.48]], edges: [[0, 1], [0, 2], [1, 3], [2, 3]] },
  { id: "cygnus", name: "Cygnus", kicker: "The swan", cx: 1.62, cy: 0.72, cz: 3.5, s: 0.3, pts: [[0, 0.55], [0, -0.05], [0, -0.52], [-0.55, 0.08], [0.55, 0.08]], edges: [[0, 1], [1, 2], [3, 1], [1, 4]] },
  { id: "aquila", name: "Aquila", kicker: "The eagle", cx: 1.62, cy: -1.42, cz: 3.48, s: 0.3, pts: [[0, 0.48], [-0.5, -0.08], [0.5, -0.08], [0, -0.48]], edges: [[0, 1], [0, 2], [1, 3], [2, 3]] },
  { id: "draco", name: "Draco", kicker: "The dragon", cx: -0.72, cy: 1.7, cz: 3.38, s: 0.3, pts: [[-0.7, 0.12], [-0.15, 0.38], [0.28, 0], [0.72, 0.28], [0.32, -0.38]], edges: [[0, 1], [1, 2], [2, 3], [2, 4]] },
  { id: "andromeda", name: "Andromeda", kicker: "The chained", cx: 0.72, cy: -1.68, cz: 3.4, s: 0.3, pts: [[-0.65, 0.28], [-0.12, -0.08], [0.32, 0.3], [0.72, -0.28]], edges: [[0, 1], [1, 2], [2, 3]] },
];

export const ASTER_NODES: AsterNode[] = [];
export const ASTER_FIGURES: AsterFigure[] = [];

for (const L of LAYOUTS) {
  const nodeIds: string[] = [];
  L.pts.forEach(([x, y], i) => {
    const id = `${L.id}${i}`;
    nodeIds.push(id);
    ASTER_NODES.push({ id, x: L.cx + x * L.s, y: L.cy + y * L.s, z: L.cz });
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
  const nodes = fig.nodeIds
    .map((id) => ASTER_NODES.find((n) => n.id === id))
    .filter((n): n is AsterNode => Boolean(n));
  if (!nodes.length) return { x: 0, y: 0, z: 0 };
  let x = 0;
  let y = 0;
  let z = 0;
  for (const n of nodes) {
    x += n.x;
    y += n.y;
    z += n.z;
  }
  const k = nodes.length;
  return { x: x / k, y: y / k + 0.22, z: z / k };
}
