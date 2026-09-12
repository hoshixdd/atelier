import { useEffect } from "react";
import { sound } from "@/lib/sound";
import { useAtelier, type SceneMode } from "@/store/atelier";

export function useSceneMode(mode: SceneMode, workSlug: string | null = null) {
  const setSceneMode = useAtelier((s) => s.setSceneMode);
  const setWorkSlug = useAtelier((s) => s.setWorkSlug);
  useEffect(() => {
    setSceneMode(mode);
    setWorkSlug(workSlug);
    sound.setScene(workSlug ?? mode);
  }, [mode, workSlug, setSceneMode, setWorkSlug]);
}
