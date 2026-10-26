"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type LockState = { locked: boolean; admin: boolean; unlockAt: string | null };
const LockContext = createContext<LockState>({ locked: false, admin: false, unlockAt: null });
export const useLockStatus = () => useContext(LockContext);

const protectedPaths = ["/livre-or", "/photos", "/jeux"];
const defaultUnlockAt = "2026-12-06T23:00:00.000Z";

function Remaining({ target }: { target: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, []);
  const total = Math.max(0, new Date(target).getTime() - now);
  const days = Math.floor(total / 86400000);
  const hours = Math.floor(total / 3600000) % 24;
  const minutes = Math.floor(total / 60000) % 60;
  const seconds = Math.floor(total / 1000) % 60;
  return <div className="countdown-grid" aria-live="polite">
    {[[days,"Jours"],[hours,"Heures"],[minutes,"Minutes"],[seconds,"Secondes"]].map(([value,label]) => <div key={label}><strong>{String(value).padStart(2,"0")}</strong><span>{label}</span></div>)}
  </div>;
}

export function HomeCountdown() {
  const { locked, unlockAt } = useLockStatus();
  if (!locked || !unlockAt) return null;
  return <section className="home-countdown"><p>Ouverture des archives dans</p><Remaining target={unlockAt} /></section>;
}

export default function UnlockGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [unlockAt, setUnlockAt] = useState<string | null>(defaultUnlockAt);
  const [admin, setAdmin] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    Promise.all([
      fetch("/api/event-settings", { cache: "no-store" }).then(r => r.ok ? r.json() : null),
      fetch("/api/admin/status", { cache: "no-store" }).then(r => r.ok ? r.json() : null)
    ]).then(([settings, status]) => { setUnlockAt(settings?.unlockAt || null); setAdmin(Boolean(status?.admin)); });
    const refresh = () => fetch("/api/admin/status", { cache: "no-store" }).then(r => r.json()).then(s => setAdmin(Boolean(s.admin)));
    window.addEventListener("simon-admin-changed", refresh);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { window.removeEventListener("simon-admin-changed", refresh); window.clearInterval(timer); };
  }, []);
  const pending = Boolean(unlockAt && new Date(unlockAt).getTime() > now);
  const current = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  const routeLocked = pending && !admin && protectedPaths.includes(current);
  const value = useMemo(() => ({ locked: pending, admin, unlockAt }), [pending, admin, unlockAt]);
  return <LockContext.Provider value={value}>
    {children}
    {routeLocked && unlockAt && <div className="locked-screen" role="dialog" aria-modal="true"><div><span>ACCESS LOCKED</span><h1>Cette archive est encore classée secrète</h1><Remaining target={unlockAt} /><p>La section se déverrouillera automatiquement à la fin du compte à rebours.</p></div></div>}
  </LockContext.Provider>;
}

