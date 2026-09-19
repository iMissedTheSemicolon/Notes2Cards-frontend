"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * NavigationProgress
 * A lightweight NProgress-style thin bar at the very top of the viewport.
 * It fires whenever the pathname changes — no external dependencies needed.
 *
 * Phases:
 *  1. "starting"  — bar appears at 0% and quickly animates to ~75% (indeterminate feel)
 *  2. "finishing" — on pathname change resolved, jumps to 100%
 *  3. After 300ms fade-out, resets to hidden
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const [fading, setFading] = useState(false);

  // Store the previous pathname so we can detect actual changes
  const prevPathname = useRef(pathname);
  // Track if a navigation is in flight
  const inFlight = useRef(false);
  // Safety timeout ref — auto-finishes the bar if pathname never changes
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When pathname changes → the new page has loaded → finish the bar
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      if (inFlight.current) {
        // Cancel safety timer — navigation completed normally
        if (safetyTimer.current) { clearTimeout(safetyTimer.current); safetyTimer.current = null; }
        // Finish
        setWidth(100);
        setFading(false);
        const fadeTimer = setTimeout(() => {
          setFading(true);
          const hideTimer = setTimeout(() => {
            setVisible(false);
            setWidth(0);
            setFading(false);
            inFlight.current = false;
          }, 300);
          return () => clearTimeout(hideTimer);
        }, 200);
        return () => clearTimeout(fadeTimer);
      }
    }
  }, [pathname]);


  // Intercept link clicks to start the bar immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      // Only intercept internal same-origin navigations
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto") || href.startsWith("blob:") || href.startsWith("data:")) return;
      if (target.getAttribute("target") === "_blank") return;

      // If the link points to the current page, skip entirely
      try {
        const url = new URL(href, window.location.origin);
        if (url.pathname === window.location.pathname) return;
      } catch { /* ignore malformed href */ }

      inFlight.current = true;
      setFading(false);
      setVisible(true);
      setWidth(0);

      // Kick off the indeterminate crawl: 0→15% instantly, then 15→72% over ~800ms
      requestAnimationFrame(() => {
        setWidth(15);
        setTimeout(() => setWidth(72), 50);
      });

      // Safety net — if pathname hasn't changed after 5 s, auto-finish the bar
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      safetyTimer.current = setTimeout(() => {
        if (inFlight.current) {
          setWidth(100);
          setTimeout(() => {
            setFading(true);
            setTimeout(() => {
              setVisible(false);
              setWidth(0);
              setFading(false);
              inFlight.current = false;
            }, 300);
          }, 200);
        }
      }, 5000);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        pointerEvents: "none",
        opacity: fading ? 0 : 1,
        transition: fading ? "opacity 300ms ease" : "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: "linear-gradient(90deg, #6DB5FF 0%, #FF5DE7 60%, #00FF88 100%)",
          boxShadow: "0 0 10px rgba(109, 181, 255, 0.7)",
          transition: width === 100
            ? "width 200ms ease-out"
            : width === 72
            ? "width 800ms cubic-bezier(0.1, 0.05, 0, 1)"
            : "width 80ms ease-out",
          borderRadius: "0 3px 3px 0",
        }}
      />
    </div>
  );
}
