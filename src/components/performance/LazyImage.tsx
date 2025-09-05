import { useState, useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  srcSet?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  fadeIn?: boolean;
}

export const LazyImage = memo<LazyImageProps>(({
  src,
  alt,
  className,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzMzMyIvPjwvc3ZnPg==',
  srcSet,
  sizes,
  onLoad,
  onError,
  priority = false,
  fadeIn = true
}) => {
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholder);
  const [isLoaded, setIsLoaded] = useState(priority);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  useEffect(() => {
    if (!isInView || priority) {
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      setImageSrc(placeholder);
      onError?.();
    };

    img.src = src;

    if (srcSet) {
      img.srcset = srcSet;
    }
  }, [isInView, src, srcSet, placeholder, priority, onLoad, onError]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      srcSet={isLoaded && srcSet ? srcSet : undefined}
      sizes={isLoaded && sizes ? sizes : undefined}
      className={cn(
        className,
        fadeIn && 'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0'
      )}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.src === nextProps.src &&
    prevProps.alt === nextProps.alt &&
    prevProps.className === nextProps.className
  );
});

LazyImage.displayName = 'LazyImage';