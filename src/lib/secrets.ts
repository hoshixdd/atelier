export type Secret = {
  id: string;
  kicker: string;
  title: string;
  letter: string;
};

export const SECRETS: Secret[] = [
  {
    id: "ice",
    kicker: "Unnamed · 01",
    title: "A colder year",
    letter:
      "I still build like the first winter I took seriously — window open, one system at a time, no audience. Ice is the work that never shipped. It taught the rest how to hold still.",
  },
  {
    id: "volcanic",
    kicker: "Unnamed · 02",
    title: "Heat",
    letter:
      "Common Table started as anger at a queue that lied. Heat is a kind of honesty. If the ledger cannot tell the truth at noon in Manila, it is not a product.",
  },
  {
    id: "stone",
    kicker: "Unnamed · 03",
    title: "The moons",
    letter:
      "The unnamed moons are the rooms I have not named yet. I keep them in orbit so I remember that a portfolio is a system, not a list.",
  },
  {
    id: "drift",
    kicker: "Unnamed · 04",
    title: "Drift",
    letter:
      "Some years are only a heading. I was learning how to make software occupy space instead of asking to be scrolled past. This ice is that heading, still.",
  },
  {
    id: "ember",
    kicker: "Unnamed · 05",
    title: "Ember",
    letter:
      "A small world, close in. The first sketches for AssessPilot lived here — a teacher’s desk, not a dashboard. I keep the ember so I do not decorate the problem.",
  },
];

export function getSecret(id: string | null) {
  if (!id) return undefined;
  return SECRETS.find((s) => s.id === id);
}
