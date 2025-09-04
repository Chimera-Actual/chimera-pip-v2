import { useCallback, useEffect, useRef, useState } from 'react';

interface UseLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export const useLazyLoading = <T extends Element>(
  options: UseLazyLoadingOptions = {}
) => {
  const { threshold = 0.1, rootMargin = '50px', enabled = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<T>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      setIsVisible(true);
      setHasBeenVisible(true);
    } else {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection, threshold, rootMargin, enabled]);

  return {
    elementRef,
    isVisible,
    hasBeenVisible,
    shouldRender: hasBeenVisible // Once rendered, keep rendered
  };
};