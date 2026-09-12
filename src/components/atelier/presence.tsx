import { useEffect, useRef } from "react";
import { useP2PRoom } from "@/lib/multiplayer";
import { useAtelier } from "@/store/atelier";

type Packet = { x: number; y: number };

export function Presence() {
  const entered = useAtelier((s) => s.entered);
  if (!entered) return null;
  return <PresenceMesh />;
}

function PresenceMesh() {
  const p2p = useP2PRoom({ room: "atelier", name: "guest" });
  const setVisitor = useAtelier((s) => s.setVisitor);
  const seen = useRef(new Set<string>());

  useEffect(
    () =>
      p2p.onMessage((from, data, channel) => {
        if (channel !== "state") return;
        const pkt = data as Packet;
        if (typeof pkt?.x !== "number" || typeof pkt?.y !== "number") return;
        seen.current.add(from);
        setVisitor(from, { x: pkt.x, y: pkt.y });
      }),
    [p2p.onMessage, setVisitor],
  );

  useEffect(() => {
    const live = new Set(p2p.peers.map((p) => p.id));
    for (const id of seen.current) {
      if (!live.has(id)) {
        setVisitor(id, null);
        seen.current.delete(id);
      }
    }
  }, [p2p.peers, setVisitor]);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      if (now - last >= 80) {
        const { pointer } = useAtelier.getState();
        p2p.broadcast({ x: pointer.x, y: pointer.y });
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [p2p.broadcast]);

  return null;
}
