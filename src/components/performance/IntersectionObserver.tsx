import React, { useEffect, useRef, useState, ReactNode } from 'react';

interface IntersectionObserverProps {
  children: ReactNode;
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  fallback?: ReactNode;
  onIntersect?: (entry: IntersectionObserverEntry) => void;
  className?: string;
}

export const IntersectionObserver: React.FC<IntersectionObserverProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  fallback,
  onIntersect,
  className = ''
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new window.IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const intersecting = entry.isIntersecting;
        
        setIsIntersecting(intersecting);
        
        if (intersecting && !hasIntersected) {
          setHasIntersected(true);
          onIntersect?.(entry);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, onIntersect, hasIntersected]);

  const shouldRender = triggerOnce ? hasIntersected : isIntersecting;

  return (
    <div ref={elementRef} className={className}>
      {shouldRender ? children : (fallback || null)}
    </div>
  );
};

// Hook version for more control
export const useIntersectionObserver = (
  options: {
    threshold?: number | number[];
    rootMargin?: string;
    triggerOnce?: boolean;
  } = {}
) => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<Element | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new window.IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const intersecting = entry.isIntersecting;
        
        setIsIntersecting(intersecting);
        
        if (intersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, hasIntersected]);

  const ref = (node: Element | null) => {
    elementRef.current = node;
  };

  return {
    ref,
    isIntersecting,
    hasIntersected,
    isVisible: triggerOnce ? hasIntersected : isIntersecting
  };
};