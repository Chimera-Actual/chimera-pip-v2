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
  theme: string;
  effects: {
    particles: boolean;
    scanlines: boolean;
    glow: boolean;
  };
}

export const VisualEffectsRenderer = forwardRef<HTMLCanvasElement, VisualEffectsRendererProps>(
  ({ theme, effects }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>();
    const particlesRef = useRef<Particle[]>([]);
    const isAnimatingRef = useRef<boolean>(false);

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

      // Set canvas size
      const updateCanvasSize = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      };

      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);

      // Particle system configuration based on theme
      const getThemeConfig = (theme: string) => {
        const configs = {
          'vault-tec': {
            particleCount: 15,
            colors: ['#00ff00', '#00cc00', '#00aa00'],
            types: ['radiation', 'static'] as const,
            speed: 0.5
          },
          'military': {
            particleCount: 12,
            colors: ['#ff6500', '#ff8c00', '#ffaa00'],
            types: ['spark', 'ash'] as const,
            speed: 0.8
          },
          'nixie': {
            particleCount: 20,
            colors: ['#ffa500', '#ff8c00', '#ffb84d'],
            types: ['spark', 'static'] as const,
            speed: 0.3
          },
          'led': {
            particleCount: 10,
            colors: ['#ff0000', '#ff3333', '#ff6666'],
            types: ['static', 'spark'] as const,
            speed: 0.6
          }
        };
        
        return configs[theme as keyof typeof configs] || configs['vault-tec'];
      };

      const config = getThemeConfig(theme);

      // Create initial particles
      const createParticle = (): Particle => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
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

      // Animation loop
      const animate = () => {
        if (!isAnimatingRef.current) return;
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);

        // Update and render particles
        particlesRef.current.forEach((particle, index) => {
          // Update position
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life--;

          // Wrap around edges
          if (particle.x < 0) particle.x = rect.width;
          if (particle.x > rect.width) particle.x = 0;
          if (particle.y < 0) particle.y = rect.height;
          if (particle.y > rect.height) particle.y = 0;

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
        window.removeEventListener('resize', updateCanvasSize);
        isAnimatingRef.current = false;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
        particlesRef.current = [];
      };
    }, [theme, effects.particles]);

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