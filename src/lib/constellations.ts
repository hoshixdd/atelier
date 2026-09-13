export type AsterNode = { id: string; x: number; y: number; z: number };

export type AsterFigure = {
  id: string;
  name: string;
  kicker: string;
  nodeIds: string[];
  edges: [string, string][];
};

const R = 3.12;
const SQUASH = 0.78;
const HOSHI_Z = 0.92;
const ROT = Math.PI / 5;

const hoshi: AsterNode[] = Array.from({ length: 5 }, (_, i) => {
  const a = -Math.PI / 2 + ROT + (i * Math.PI * 2) / 5;
  return {
    id: `h${i}`,
    x: Math.cos(a) * R,
    y: Math.sin(a) * R * SQUASH,
    z: HOSHI_Z,
  };
});

export const ASTER_NODES: AsterNode[] = [
  { id: "c0", x: -1.55, y: 2.18, z: 1.55 },
  { id: "c1", x: -0.78, y: 1.82, z: 1.62 },
  { id: "c2", x: 0, y: 2.22, z: 1.52 },
  { id: "c3", x: 0.78, y: 1.8, z: 1.6 },
  { id: "c4", x: 1.55, y: 2.16, z: 1.55 },
  { id: "b0", x: -1.05, y: -2.18, z: 1.58 },
  { id: "b1", x: 0, y: -2.05, z: 1.52 },
  { id: "b2", x: 1.05, y: -2.18, z: 1.58 },
  ...hoshi,
];

export const ASTER_FIGURES: AsterFigure[] = [
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    kicker: "The W",
    nodeIds: ["c0", "c1", "c2", "c3", "c4"],
    edges: [
      ["c0", "c1"],
      ["c1", "c2"],
      ["c2", "c3"],
      ["c3", "c4"],
    ],
  },
  {
    id: "belt",
    name: "The Belt",
    kicker: "Three in a line",
    nodeIds: ["b0", "b1", "b2"],
    edges: [
      ["b0", "b1"],
      ["b1", "b2"],
    ],
  },
  {
    id: "hoshi",
    name: "Hoshi",
    kicker: "The star",
    nodeIds: hoshi.map((n) => n.id),
    edges: [
      ["h0", "h1"],
      ["h1", "h2"],
      ["h2", "h3"],
      ["h3", "h4"],
      ["h4", "h0"],
    ],
  },
];

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
