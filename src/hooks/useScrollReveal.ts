import { useInView } from "react-intersection-observer";
import { ScrollRevealOptions } from "@/hooks/useScrollReveal.types";

export const useScrollReveal = ({
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  once = false,
}: ScrollRevealOptions = {}) => {
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: once,
    fallbackInView: true,
  });

  return { ref, isVisible: inView };
};
