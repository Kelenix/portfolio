"use client";

import { signOut } from "next-auth/react";
import { useEffect, useRef } from "react";

const IDLE_LIMIT_MS = 5 * 60 * 1000;
const CHECK_INTERVAL_MS = 30 * 1000;
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

export function IdleTimeout() {
  const lastActivityRef = useRef<number>(0);
  const signedOutRef = useRef(false);

  useEffect(() => {
    lastActivityRef.current = Date.now();

    const bump = () => {
      lastActivityRef.current = Date.now();
    };

    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, bump, { passive: true });
    }

    const check = () => {
      if (signedOutRef.current) return;
      const idle = Date.now() - lastActivityRef.current;
      if (idle >= IDLE_LIMIT_MS) {
        signedOutRef.current = true;
        signOut({ callbackUrl: "/admin/login?reason=expired" });
      }
    };

    const id = setInterval(check, CHECK_INTERVAL_MS);

    return () => {
      clearInterval(id);
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, bump);
      }
    };
  }, []);

  return null;
}
