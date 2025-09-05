import { memo, useMemo } from 'react';
import { LazyImage } from './LazyImage';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  aspectRatio?: '16/9' | '4/3' | '1/1' | '3/2' | '21/9';
  priority?: boolean;
  quality?: 'low' | 'medium' | 'high';
  onLoad?: () => void;
  onError?: () => void;
}

// Generate srcSet for different screen densities
function generateSrcSet(
  baseSrc: string,
  quality: 'low' | 'medium' | 'high' = 'medium'
): string {
  const qualityMap = {
    low: [0.5, 0.75],
    medium: [0.75, 1, 1.5],
    high: [1, 1.5, 2]
  };

  const densities = qualityMap[quality];
  
  // If it's a local image or doesn't support query params, return empty
  if (baseSrc.startsWith('data:') || baseSrc.startsWith('blob:')) {
    return '';
  }

  // Generate srcSet string
  return densities
    .map(density => {
      const width = Math.round(800 * density); // Base width of 800px
      // Add width parameter to URL
      const separator = baseSrc.includes('?') ? '&' : '?';
      return `${baseSrc}${separator}w=${width} ${density}x`;
    })
    .join(', ');
}

// Generate sizes attribute for responsive images
function generateSizes(defaultSizes?: string): string {
  return defaultSizes || `
    (max-width: 640px) 100vw,
    (max-width: 1024px) 50vw,
    (max-width: 1536px) 33vw,
    25vw
  `.trim();
}

export const ResponsiveImage = memo<ResponsiveImageProps>(({
  src,
  alt,
  className,
  sizes,
  aspectRatio = '16/9',
  priority = false,
  quality = 'medium',
  onLoad,
  onError
}) => {
  // Memoize srcSet generation
  const srcSet = useMemo(() => generateSrcSet(src, quality), [src, quality]);
  
  // Memoize sizes attribute
  const responsiveSizes = useMemo(() => generateSizes(sizes), [sizes]);

  // Calculate aspect ratio padding
  const aspectRatioPadding = useMemo(() => {
    const ratioMap = {
      '16/9': '56.25%',
      '4/3': '75%',
      '1/1': '100%',
      '3/2': '66.67%',
      '21/9': '42.86%'
    };
    return ratioMap[aspectRatio];
  }, [aspectRatio]);

  return (
    <div 
      className={cn('relative overflow-hidden', className)}
      style={{ paddingBottom: aspectRatioPadding }}
    >
      <LazyImage
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        srcSet={srcSet}
        sizes={responsiveSizes}
        priority={priority}
        onLoad={onLoad}
        onError={onError}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.src === nextProps.src &&
    prevProps.alt === nextProps.alt &&
    prevProps.className === nextProps.className &&
    prevProps.aspectRatio === nextProps.aspectRatio &&
    prevProps.priority === nextProps.priority &&
    prevProps.quality === nextProps.quality
  );
});

ResponsiveImage.displayName = 'ResponsiveImage';

// Picture element for art direction
interface ResponsivePictureProps {
  sources: Array<{
    srcSet: string;
    media?: string;
    type?: string;
  }>;
  fallbackSrc: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export const ResponsivePicture = memo<ResponsivePictureProps>(({
  sources,
  fallbackSrc,
  alt,
  className,
  priority = false
}) => {
  return (
    <picture className={className}>
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          media={source.media}
          type={source.type}
        />
      ))}
      <LazyImage
        src={fallbackSrc}
        alt={alt}
        className="w-full h-auto"
        priority={priority}
      />
    </picture>
  );
});

ResponsivePicture.displayName = 'ResponsivePicture';