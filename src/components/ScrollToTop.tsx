import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    if (!hash) {
      window.scrollTo({ top: 0, left: 0 });
    }

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [pathname, search, hash]);

  return null;
}
