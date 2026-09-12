import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("page-shot relative px-5 pb-32 pt-24 sm:px-10 sm:pb-28 sm:pt-28 lg:px-16", className)}>
      {children}
    </main>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="kicker">{children}</p>;
}
