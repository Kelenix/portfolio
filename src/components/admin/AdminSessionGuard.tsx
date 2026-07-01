"use client";

import { useEffect } from "react";

export function AdminSessionGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const originalFetch = window.fetch;
    let redirecting = false;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (redirecting) return response;

      try {
        const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
        if (response.status === 401 && url.includes("/api/admin/")) {
          redirecting = true;
          window.location.href = "/admin/login?reason=expired";
        }
      } catch {
        /* ignore parsing issues */
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
