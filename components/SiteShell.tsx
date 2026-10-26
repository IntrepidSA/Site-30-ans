"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLockStatus } from "./UnlockGate";

const menu = [
  ["Accueil", "/", "▣"],
  ["Infos", "/infos", "◇"],
  ["Livre d’or", "/livre-or", "▣"],
  ["Photos", "/photos", "◇"],
  ["Jeux", "/jeux", "◆"],
  ["Admin", "/admin", "★"]
];

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locked } = useLockStatus();
  const currentPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  return <main className="site-shell">
    <aside className="sidebar">
      <Link className="brand" href="/" aria-label="Retour à l’accueil">
        <div className="chrome-logo">S</div>
        <p className="logo-subtitle">Les 30 ans<br />d’une légende</p>
      </Link>
      <nav className="side-nav" aria-label="Navigation principale">
        {menu.map(([item, href, icon], index) => {
          const isActive = currentPath === href;
          return <Link
            className={`${isActive ? "active" : ""}${locked && ["/livre-or","/photos","/jeux"].includes(href) ? " locked-link" : ""}`}
            href={href}
            key={href}
            aria-current={isActive ? "page" : undefined}
            style={{ "--nav-index": index } as React.CSSProperties}
          ><span aria-hidden="true">{icon}</span>{item}</Link>;
        })}
      </nav>
      <div className="coming-soon"><strong>La fête de l’année !</strong><span>Date, lieu et heure…</span><em>Bientôt disponibles !</em></div>
      <div className="vhs-badge">VHS</div>
      <p className="sidebar-note">100% Pop Culture<br />80’s • 90’s • Nanar</p>
    </aside>
    <div className="content page-content">{children}</div>
  </main>;
}

