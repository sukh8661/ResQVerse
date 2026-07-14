import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "wouter";

const resetWindowScroll = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const useScrollToTop = () => {
  const [location] = useLocation();
  useLayoutEffect(() => {
    resetWindowScroll();
  }, [location]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    resetWindowScroll();
    const firstFrame = requestAnimationFrame(resetWindowScroll);
    const secondFrame = requestAnimationFrame(() => requestAnimationFrame(resetWindowScroll));
    const restoreGuard = window.setTimeout(resetWindowScroll, 120);

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      window.clearTimeout(restoreGuard);
    };
  }, [location]);
};
export {
  useScrollToTop
};
