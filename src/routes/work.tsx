import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/work")({ component: WorkLayout });

function WorkLayout() {
  return <Outlet />;
}
