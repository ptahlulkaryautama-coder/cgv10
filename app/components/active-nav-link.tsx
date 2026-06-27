"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isActiveRoute(pathname: string, href: string) {
  const normalizePath = (path: string) =>
    path === "/" ? "/" : path.replace(/\/+$/, "");

  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(href);

  if (targetPath === "/") {
    return currentPath === "/";
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

export function ActiveNavLink({
  children,
  href,
  mobile = false,
}: {
  children: React.ReactNode;
  href: string;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const active = isActiveRoute(pathname, href);

  const baseClass =
    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const desktopClass = active
    ? "text-primary"
    : "text-muted hover:text-primary";
  const mobileClass = active
    ? "border-primary/45 bg-primary-soft text-primary"
    : "border-border bg-surface text-muted hover:border-primary/40 hover:text-primary";

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        mobile
          ? `${baseClass} ${mobileClass} inline-flex min-h-11 shrink-0 items-center rounded-full border px-3 py-2`
          : `${baseClass} ${desktopClass} whitespace-nowrap`
      }
    >
      {children}
    </Link>
  );
}
