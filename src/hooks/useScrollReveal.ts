import { useInView } from "react-intersection-observer";

type Options = {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
};

export const useScrollReveal = ({
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  once = false,
}: Options = {}) => {
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: once,
    fallbackInView: true,
  });

  return { ref, isVisible: inView };
};
