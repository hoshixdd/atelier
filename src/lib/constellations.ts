export type AsterNode = { id: string; x: number; y: number; z: number };

export type AsterFigure = {
  id: string;
  name: string;
  kicker: string;
  nodeIds: string[];
  edges: [string, string][];
};

export const ASTER_NODES: AsterNode[] = [
  { id: "c0", x: -1.55, y: 1.72, z: 3.35 },
  { id: "c1", x: -0.72, y: 1.38, z: 3.42 },
  { id: "c2", x: 0.05, y: 1.78, z: 3.32 },
  { id: "c3", x: 0.78, y: 1.36, z: 3.4 },
  { id: "c4", x: 1.58, y: 1.7, z: 3.34 },
  { id: "b0", x: -0.7, y: -1.68, z: 3.38 },
  { id: "b1", x: 0.05, y: -1.58, z: 3.32 },
  { id: "b2", x: 0.82, y: -1.7, z: 3.38 },
  { id: "h0", x: -1.58, y: 0.22, z: 3.45 },
  { id: "h1", x: -1.88, y: -0.18, z: 3.5 },
  { id: "h2", x: -1.68, y: -0.62, z: 3.46 },
  { id: "h3", x: -1.22, y: -0.64, z: 3.4 },
  { id: "h4", x: -1.08, y: -0.16, z: 3.38 },
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
    nodeIds: ["h0", "h1", "h2", "h3", "h4"],
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
