import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

const FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-void px-6 text-center text-bone">
      <p className="kicker">Fault</p>
      <h1 className="font-display text-5xl italic">Something slipped.</h1>
      <p className="max-w-md text-sm break-words text-mute">{errorMessage(error)}</p>
      <Link
        to="/"
        className="kicker text-bone underline decoration-line underline-offset-8"
      >
        Return to the atelier
      </Link>
    </main>
  );
}
