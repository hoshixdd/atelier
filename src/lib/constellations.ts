export type AsterNode = { id: string; x: number; y: number; z: number };

export type AsterFigure = {
  id: string;
  name: string;
  kicker: string;
  edges: [string, string][];
};

export const ASTER_NODES: AsterNode[] = [
  { id: "c0", x: -1.85, y: 1.62, z: 1.75 },
  { id: "c1", x: -0.95, y: 1.18, z: 1.88 },
  { id: "c2", x: 0.05, y: 1.7, z: 1.7 },
  { id: "c3", x: 0.98, y: 1.14, z: 1.82 },
  { id: "c4", x: 1.88, y: 1.6, z: 1.72 },
  { id: "b0", x: -0.58, y: -0.22, z: 2.12 },
  { id: "b1", x: 0.12, y: -0.12, z: 2.08 },
  { id: "b2", x: 0.82, y: -0.24, z: 2.14 },
  { id: "h0", x: -2.15, y: 0.58, z: 1.55 },
  { id: "h1", x: -2.62, y: 0.12, z: 1.68 },
  { id: "h2", x: -2.38, y: -0.48, z: 1.6 },
  { id: "h3", x: -1.72, y: -0.5, z: 1.48 },
  { id: "h4", x: -1.52, y: 0.14, z: 1.42 },
];

export const ASTER_FIGURES: AsterFigure[] = [
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    kicker: "The W",
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
    edges: [
      ["b0", "b1"],
      ["b1", "b2"],
    ],
  },
  {
    id: "hoshi",
    name: "Hoshi",
    kicker: "The star",
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
