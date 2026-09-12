import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SITE } from "@/lib/site";
import { sound } from "@/lib/sound";
import { PageFrame } from "@/components/atelier/page-frame";
import { SplitTitle } from "@/components/atelier/reveal";
import { useSceneMode } from "@/components/atelier/use-scene-mode";
import { useAtelier } from "@/store/atelier";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  useSceneMode("contact");
  const entered = useAtelier((s) => s.entered);
  const [name, setName] = useState("");
  const [intent, setIntent] = useState("Work");
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  function send(e: FormEvent) {
    e.preventDefault();
    sound.click();
    const subject = `Signal — ${intent} — ${name || "visitor"}`;
    const body = [
      message || "(no message)",
      link ? `Link: ${link}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      sound.hover();
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <PageFrame>
      <p className="kicker">Transmission</p>
      <h1 className="mt-6 font-display text-6xl sm:text-8xl">
        {entered ? <SplitTitle text="Signal" /> : "Signal"}
      </h1>
      <p className="mt-6 max-w-lg text-sm leading-relaxed text-mute">
        {SITE.availability}. Time here is {SITE.timezone} — the clock in the header is
        Cebu. Write a brief. It opens mail toward {SITE.email}. Nothing is stored here.
      </p>

      <dl className="mt-10 grid gap-4 text-sm sm:grid-cols-3">
        <div className="border border-line p-4">
          <dt className="kicker">Availability</dt>
          <dd className="mt-2">{SITE.availability}</dd>
        </div>
        <div className="border border-line p-4">
          <dt className="kicker">Base</dt>
          <dd className="mt-2">{SITE.location}</dd>
        </div>
        <div className="border border-line p-4">
          <dt className="kicker">Wants</dt>
          <dd className="mt-2">Selected product, spatial, systems work.</dd>
        </div>
      </dl>

      <form onSubmit={send} className="mt-16 grid gap-8 lg:grid-cols-12">
        <label className="block lg:col-span-6">
          <span className="kicker">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-3 min-h-12 w-full border-b border-line bg-transparent py-3 text-lg outline-none focus:border-bone"
            placeholder="Who is sending"
            autoComplete="name"
          />
        </label>
        <label className="block lg:col-span-6">
          <span className="kicker">Intent</span>
          <select
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            className="mt-3 min-h-12 w-full appearance-none border-b border-line bg-transparent py-3 text-lg outline-none focus:border-bone"
          >
            <option className="bg-void">Work</option>
            <option className="bg-void">Collaboration</option>
            <option className="bg-void">Hello</option>
          </select>
        </label>
        <label className="block lg:col-span-12">
          <span className="kicker">Link</span>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="mt-3 min-h-12 w-full border-b border-line bg-transparent py-3 text-lg outline-none focus:border-bone"
            placeholder="A site, a deck, a repo"
            autoComplete="url"
            inputMode="url"
          />
        </label>
        <label className="block lg:col-span-12">
          <span className="kicker">Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="mt-3 min-h-32 w-full resize-none border-b border-line bg-transparent py-3 text-lg outline-none focus:border-bone"
            placeholder="The room you want to enter"
          />
        </label>
        <div className="flex flex-wrap items-center gap-4 lg:col-span-12">
          <button
            type="submit"
            className="min-h-12 border border-line px-8 py-3 text-xs tracking-widest uppercase transition-colors duration-200 hover:bg-bone hover:text-void active:scale-[0.96]"
          >
            Dispatch
          </button>
          <button
            type="button"
            onClick={() => void copy()}
            className="min-h-11 px-4 text-xs tracking-widest text-mute uppercase hover:text-bone"
          >
            {copied ? "Copied" : "Copy mail"}
          </button>
          <a
            href={SITE.github}
            target="_blank"
            rel="noreferrer"
            className="min-h-11 px-4 text-xs tracking-widest text-mute uppercase hover:text-bone"
          >
            GitHub
          </a>
        </div>
      </form>
    </PageFrame>
  );
}
