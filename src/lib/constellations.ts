export type AsterNode = { id: string; x: number; y: number; z: number };

export type AsterFigure = {
  id: string;
  name: string;
  kicker: string;
  nodeIds: string[];
  edges: [string, string][];
};

export const ASTER_NODES: AsterNode[] = [
  { id: "c0", x: -1.55, y: 2.48, z: 2.55 },
  { id: "c1", x: -0.72, y: 2.12, z: 2.62 },
  { id: "c2", x: 0.05, y: 2.52, z: 2.5 },
  { id: "c3", x: 0.78, y: 2.1, z: 2.6 },
  { id: "c4", x: 1.58, y: 2.46, z: 2.52 },
  { id: "b0", x: -0.72, y: -2.42, z: 2.58 },
  { id: "b1", x: 0.05, y: -2.32, z: 2.52 },
  { id: "b2", x: 0.82, y: -2.44, z: 2.58 },
  { id: "h0", x: -1.62, y: 0.72, z: 2.62 },
  { id: "h1", x: -1.95, y: 0.18, z: 2.7 },
  { id: "h2", x: -1.72, y: -0.42, z: 2.64 },
  { id: "h3", x: -1.18, y: -0.44, z: 2.56 },
  { id: "h4", x: -1.02, y: 0.22, z: 2.52 },
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
  return { x: x / k, y: y / k + 0.28, z: z / k };
}
