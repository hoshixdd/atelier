import { cn } from "@/lib/utils";

export function StarMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("fill-current", className)}
      aria-hidden="true"
    >
      <path d="M12 0.8 14.55 9.2 23.2 12 14.55 14.8 12 23.2 9.45 14.8 0.8 12 9.45 9.2Z" />
    </svg>
  );
}
