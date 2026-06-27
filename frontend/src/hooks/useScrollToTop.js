import { useEffect } from "react";
import { useLocation } from "wouter";
const useScrollToTop = () => {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
};
export {
  useScrollToTop
};
