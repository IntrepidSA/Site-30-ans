"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export default function ExperienceEffects() {
  const pathname = usePathname();
  const router = useRouter();
  const [transition, setTransition] = useState<"idle" | "leaving" | "entering">("entering");
  const [message, setMessage] = useState("");
  const destination = useRef<string | null>(null);
  const keyProgress = useRef(0);
  const secretClicks = useRef(0);

  useEffect(() => {
    setTransition("entering");
    const timer = window.setTimeout(() => setTransition("idle"), 480);
    destination.current = null;
    window.scrollTo({ top: 0, behavior: "auto" });
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const click = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const secret = target.closest(".chrome-logo");
      if (secret) {
        secretClicks.current += 1;
        if (secretClicks.current === 5) {
          setMessage("ACHIEVEMENT UNLOCKED — SIGNAL PIRATE DÉTECTÉ");
          document.documentElement.classList.add("retro-boost");
          window.setTimeout(() => {
            setMessage("");
            document.documentElement.classList.remove("retro-boost");
            secretClicks.current = 0;
          }, 2600);
        }
      }

      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || anchor.target === "_blank" || url.pathname === window.location.pathname) return;
      event.preventDefault();
      if (destination.current) return;
      destination.current = `${url.pathname}${url.search}${url.hash}`;
      setTransition("leaving");
      window.setTimeout(() => router.push(destination.current!), 1000);
    };

    const keys = (event: KeyboardEvent) => {
      const expected = KONAMI[keyProgress.current];
      if (event.key.toLowerCase() === expected.toLowerCase()) keyProgress.current += 1;
      else keyProgress.current = event.key === KONAMI[0] ? 1 : 0;
      if (keyProgress.current === KONAMI.length) {
        keyProgress.current = 0;
        setMessage("PLAYER 1 READY — LEVEL 30");
        document.documentElement.classList.add("retro-boost");
        window.setTimeout(() => {
          setMessage("");
          document.documentElement.classList.remove("retro-boost");
        }, 3000);
      }
    };
    const pointer = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
    };

    document.addEventListener("click", click);
    window.addEventListener("keydown", keys);
    window.addEventListener("pointermove", pointer, { passive: true });
    return () => {
      document.removeEventListener("click", click);
      window.removeEventListener("keydown", keys);
      window.removeEventListener("pointermove", pointer);
    };
  }, [router]);

  useEffect(() => {
    const candidates = document.querySelectorAll(
      ".page-content section, .page-hero > *, .game-select-card, .event-cards article, .recorder-panel, .photo-upload, .admin-page section"
    );
    candidates.forEach((element, index) => {
      element.classList.add("reveal-on-scroll");
      element.setAttribute("data-reveal", ["up", "left", "right", "zoom"][index % 4]);
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.09, rootMargin: "0px 0px -6%" });
    candidates.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  return <>
    {pathname === "/" && <div className="home-intro" aria-hidden="true"><span>SIGNAL EN COURS...</span><strong>30 ANS D’UNE AVENTURE</strong><small>PLAYER 1 READY</small></div>}
    <div className={`page-transition ${transition}`} aria-hidden="true"><i /><i /><i /><span>CHANGEMENT DE SCÈNE</span></div>
    <div className="crt-overlay" aria-hidden="true" />
    <div className="cursor-glow" aria-hidden="true" />
    {message && <div className="achievement" role="status">{message}</div>}
  </>;
}

