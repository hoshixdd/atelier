import { createFileRoute } from "@tanstack/react-router";
import { sanitizeWord, type SkyWord } from "@/lib/letters";

const words: SkyWord[] = [];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export const Route = createFileRoute("/api/letters")({
  server: {
    handlers: {
      GET: () => json({ words: words.slice(-40) }),
      POST: async ({ request }: { request: Request }) => {
        let body: { word?: string } = {};
        try {
          body = (await request.json()) as { word?: string };
        } catch {
          return json({ error: "bad" }, 400);
        }
        const word = sanitizeWord(String(body.word ?? ""));
        if (word.length < 2) return json({ error: "short" }, 400);
        if (words.some((w) => w.word === word)) return json({ words: words.slice(-40) });
        words.push({ word, a: Math.random() * Math.PI * 2, born: Date.now() });
        if (words.length > 80) words.splice(0, words.length - 80);
        return json({ words: words.slice(-40) });
      },
    },
  },
});
