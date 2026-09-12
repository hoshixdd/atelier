import { useState, type FormEvent } from "react";
import { leaveSkyWord } from "@/lib/letters";
import { sound } from "@/lib/sound";
import { useAtelier } from "@/store/atelier";

export function SkyWord() {
  const open = useAtelier((s) => s.leaveOpen);
  const setLeaveOpen = useAtelier((s) => s.setLeaveOpen);
  const setSkyWords = useAtelier((s) => s.setSkyWords);
  const setNotice = useAtelier((s) => s.setNotice);
  const [word, setWord] = useState("");

  if (!open) return null;

  async function send(e: FormEvent) {
    e.preventDefault();
    const next = await leaveSkyWord(word);
    sound.letter();
    if (!next) {
      setNotice("A word needs two letters");
      window.setTimeout(() => useAtelier.getState().setNotice(null), 1600);
      return;
    }
    setSkyWords(next);
    setLeaveOpen(false);
    setWord("");
    setNotice("It is in the sky");
    window.setTimeout(() => useAtelier.getState().setNotice(null), 1800);
  }

  return (
    <div
      className="fixed inset-0 z-overlay flex items-end justify-center bg-void/70 p-5 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sky-word-title"
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close"
        onClick={() => setLeaveOpen(false)}
      />
      <form
        onSubmit={(e) => void send(e)}
        className="relative w-full max-w-md border border-line bg-fog p-8"
      >
        <p className="kicker">Unnamed world</p>
        <h2 id="sky-word-title" className="mt-3 font-display text-4xl">
          Leave a word
        </h2>
        <p className="mt-3 text-sm text-mute">
          One word. It orbits with the others for a while. Nothing else is stored here if the
          host is quiet.
        </p>
        <input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          maxLength={18}
          autoFocus
          placeholder="still"
          className="mt-8 h-12 w-full border-b border-line bg-transparent text-lg outline-none"
        />
        <button
          type="submit"
          className="mt-8 min-h-11 text-xs tracking-widest uppercase underline decoration-line underline-offset-8"
        >
          Place it
        </button>
      </form>
    </div>
  );
}
