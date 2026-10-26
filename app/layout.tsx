import "./globals.css";
import type { Metadata, Viewport } from "next";
import SiteShell from "@/components/SiteShell";
import ExperienceEffects from "@/components/ExperienceEffects";
import UnlockGate from "@/components/UnlockGate";

export const metadata: Metadata = {
  title: "Simon — 30 ans d’aventure",
  description: "L’invitation officielle aux 30 ans de Simon : infos, photos, jeux et livre d’or audio.",
  icons: { icon: "/favicon.svg" }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#070707"
};

const lockPreflight = '(function(){var p=location.pathname;while(p.length>1&&p.endsWith("/"))p=p.slice(0,-1);document.documentElement.classList.add("lock-preflight");if(["/livre-or","/photos","/jeux"].includes(p))document.documentElement.dataset.protectedPage="true"})()';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><head><script dangerouslySetInnerHTML={{ __html: lockPreflight }} /></head><body><UnlockGate><ExperienceEffects /><SiteShell>{children}</SiteShell></UnlockGate></body></html>;
}

