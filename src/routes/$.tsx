import { createFileRoute } from "@tanstack/react-router";
import { LostRoom } from "@/components/atelier/lost-room";

export const Route = createFileRoute("/$")({
  component: LostRoom,
});
