import { useState } from "react";
import { sound } from "@/lib/sound";
import type { Work } from "@/lib/works";

export function LivePortal({ work }: { work: Work }) {
  const [open, setOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);
  if (!work.live) return null;

  return (
    <>
      <div className="mt-12 overflow-hidden border border-line bg-void">
        <div className="flex items-center justify-between border-b border-line px-4 py-2">
          <p className="kicker">Live surface · {work.live.replace(/^https?:\/\//, "")}</p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                sound.click();
                setOpen(true);
              }}
              className="text-[10px] tracking-widest uppercase hover:text-bone"
            >
              Step through
            </button>
            <a
              href={work.live}
              target="_blank"
              rel="noreferrer"
              onClick={() => sound.click()}
              className="text-[10px] tracking-widest text-mute uppercase hover:text-bone"
            >
              Open
            </a>
          </div>
        </div>
        <div className="relative aspect-16/9 bg-fog">
          {blocked ? (
            <img src={work.image} alt="" className="h-full w-full object-cover" />
          ) : (
            <iframe
              src={work.live}
              title={`Live ${work.title}`}
              className="h-full w-full bg-void"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setBlocked(true)}
            />
          )}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-bone/10" />
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-overlay flex flex-col bg-void">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="kicker">INT. {work.title.toUpperCase()} — LIVE</p>
            <button
              type="button"
              onClick={() => {
                sound.click();
                setOpen(false);
              }}
              className="min-h-11 px-3 text-xs tracking-widest uppercase"
            >
              Exit the room
            </button>
          </div>
          <iframe
            src={work.live}
            title={`Walk-in ${work.title}`}
            className="min-h-0 w-full flex-1 bg-void"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : null}
    </>
  );
}
