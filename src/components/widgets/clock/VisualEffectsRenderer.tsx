import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  type: 'radiation' | 'spark' | 'static' | 'ash';
  color: string;
}

interface VisualEffectsRendererProps {
  effects: {
    particles: boolean;
    scanlines: boolean;
    glow: boolean;
  };
}

export const VisualEffectsRenderer = forwardRef<HTMLCanvasElement, VisualEffectsRendererProps>(
  ({ effects }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>();
    const particlesRef = useRef<Particle[]>([]);
    const isAnimatingRef = useRef<boolean>(false);
    const resizeObserverRef = useRef<ResizeObserver>();

    useImperativeHandle(ref, () => canvasRef.current!);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !effects.particles) {
        // Clean up if effects are disabled
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
        isAnimatingRef.current = false;
        particlesRef.current = [];
        return;
      }

      // Prevent multiple animation loops
      if (isAnimatingRef.current) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Optimized canvas sizing with ResizeObserver
      const updateCanvasSize = () => {
        if (!canvas.parentElement) return;
        
        const { width, height } = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Batch DOM operations to prevent forced reflows
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);
      };

      updateCanvasSize();

      // Use ResizeObserver for better performance
      resizeObserverRef.current = new ResizeObserver(() => {
        updateCanvasSize();
      });
      resizeObserverRef.current.observe(canvas.parentElement!);

      // Hard-coded Vault-Tec theme configuration for optimal performance
      const config = {
        particleCount: 12, // Reduced for better performance
        colors: ['hsl(var(--pip-green-primary))', 'hsl(var(--pip-green-secondary))', 'hsl(var(--pip-green-muted))'],
        types: ['radiation', 'static'] as const,
        speed: 0.5
      };

      // Create initial particles with performance boundaries
      const createParticle = (): Particle => {
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * config.speed,
          vy: (Math.random() - 0.5) * config.speed,
          life: Math.random() * 100 + 50,
          maxLife: Math.random() * 100 + 50,
          size: Math.random() * 3 + 1,
          type: config.types[Math.floor(Math.random() * config.types.length)],
          color: config.colors[Math.floor(Math.random() * config.colors.length)]
        };
      };

      // Clear existing particles and initialize new ones
      particlesRef.current = [];
      for (let i = 0; i < config.particleCount; i++) {
        particlesRef.current.push(createParticle());
      }

      // Optimized animation loop with performance monitoring
      const animate = () => {
        if (!isAnimatingRef.current) return;
        
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, width, height);

        // Update and render particles
        particlesRef.current.forEach((particle, index) => {
          // Update position
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life--;

          // Wrap around edges
          const width = canvas.width / (window.devicePixelRatio || 1);
          const height = canvas.height / (window.devicePixelRatio || 1);
          if (particle.x < 0) particle.x = width;
          if (particle.x > width) particle.x = 0;
          if (particle.y < 0) particle.y = height;
          if (particle.y > height) particle.y = 0;

          // Calculate alpha based on life
          const alpha = Math.max(0, particle.life / particle.maxLife);

          // Render based on type
          ctx.save();
          ctx.globalAlpha = alpha * 0.6;

          switch (particle.type) {
            case 'radiation':
              // Draw radiation symbol
              ctx.strokeStyle = particle.color;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
              ctx.stroke();
              break;

            case 'spark':
              // Draw spark
              ctx.fillStyle = particle.color;
              ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
              break;

            case 'static':
              // Draw static noise
              ctx.fillStyle = particle.color;
              const staticSize = Math.random() * particle.size;
              ctx.fillRect(particle.x, particle.y, staticSize, staticSize);
              break;

            case 'ash':
              // Draw ash particle
              ctx.fillStyle = particle.color;
              ctx.beginPath();
              ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
              ctx.fill();
              break;
          }

          ctx.restore();

          // Remove dead particles
          if (particle.life <= 0) {
            particlesRef.current[index] = createParticle();
          }
        });

        if (isAnimatingRef.current) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      isAnimatingRef.current = true;
      animate();

      return () => {
        // Clean up ResizeObserver
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
        isAnimatingRef.current = false;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
        particlesRef.current = [];
      };
    }, [effects.particles]);

    if (!effects.particles) {
      return null;
    }

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          mixBlendMode: 'screen',
          opacity: 0.4
        }}
      />
    );
  }
);