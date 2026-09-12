import { Link, useRouterState } from "@tanstack/react-router";
import { NAV } from "@/lib/site";
import { sound } from "@/lib/sound";

export function MobileDock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-nav border-t border-line bg-void/95 px-1 pt-1 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.4rem, env(safe-area-inset-bottom))" }}
    >
      <ul className="grid grid-cols-4">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                onClick={() => sound.click()}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] tracking-[0.22em] uppercase active:scale-[0.96] ${active ? "text-bone" : "text-mute"}`}
              >
                <span
                  className={`h-px w-5 ${active ? "bg-bone" : "bg-transparent"}`}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
