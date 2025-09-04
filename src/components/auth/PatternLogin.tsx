import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid3X3, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const PatternLogin: React.FC = () => {
  const [pattern, setPattern] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const GRID_SIZE = 3;
  const CIRCLE_RADIUS = 20;
  const CANVAS_SIZE = 300;
  const GRID_SPACING = CANVAS_SIZE / (GRID_SIZE + 1);

  // Grid points positions
  const gridPoints = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
    id: i,
    x: ((i % GRID_SIZE) + 1) * GRID_SPACING,
    y: (Math.floor(i / GRID_SIZE) + 1) * GRID_SPACING,
    active: false,
  }));

  const drawCanvas = (currentPattern: number[] = pattern, mousePos?: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Set styles
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 3;

    // Draw grid points
    gridPoints.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, CIRCLE_RADIUS, 0, 2 * Math.PI);
      
      if (currentPattern.includes(index)) {
        ctx.fill();
        // Add glow effect
        ctx.shadowColor = 'hsl(var(--primary))';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.stroke();
      }
    });

    // Draw pattern lines
    if (currentPattern.length > 1) {
      ctx.beginPath();
      ctx.moveTo(gridPoints[currentPattern[0]].x, gridPoints[currentPattern[0]].y);
      
      for (let i = 1; i < currentPattern.length; i++) {
        ctx.lineTo(gridPoints[currentPattern[i]].x, gridPoints[currentPattern[i]].y);
      }
      
      // Draw line to mouse position if drawing
      if (isDrawing && mousePos) {
        ctx.lineTo(mousePos.x, mousePos.y);
      }
      
      ctx.stroke();
    }
  };

  const getPointFromPosition = (x: number, y: number): number | null => {
    for (let i = 0; i < gridPoints.length; i++) {
      const point = gridPoints[i];
      const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
      if (distance <= CIRCLE_RADIUS) {
        return i;
      }
    }
    return null;
  };

  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0]?.clientX || 0 : event.clientX;
    const clientY = 'touches' in event ? event.touches[0]?.clientY || 0 : event.clientY;
    
    return {
      x: (clientX - rect.left) * (CANVAS_SIZE / rect.width),
      y: (clientY - rect.top) * (CANVAS_SIZE / rect.height),
    };
  };

  const handleStart = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const { x, y } = getCanvasCoordinates(event);
    const pointIndex = getPointFromPosition(x, y);
    
    if (pointIndex !== null) {
      setIsDrawing(true);
      setPattern([pointIndex]);
      setError('');
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  const handleMove = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    event.preventDefault();
    
    const { x, y } = getCanvasCoordinates(event);
    const pointIndex = getPointFromPosition(x, y);
    
    if (pointIndex !== null && !pattern.includes(pointIndex)) {
      const newPattern = [...pattern, pointIndex];
      setPattern(newPattern);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }
    
    drawCanvas(pattern, { x, y });
  };

  const handleEnd = () => {
    setIsDrawing(false);
    drawCanvas(pattern);
  };

  const handleReset = () => {
    setPattern([]);
    setError('');
    drawCanvas([]);
  };

  const handleSubmit = async () => {
    if (pattern.length < 4) {
      setError('Pattern must connect at least 4 points');
      return;
    }

    setIsLoading(true);
    // Convert pattern to string for demo purposes
    const patternString = pattern.join('');
    
    // For demo purposes, we'll use the pattern as password
    // In production, this would be properly hashed and validated
    const { error } = await signIn('demo@chimera-tec.com', patternString);
    
    if (!error) {
      navigate('/');
    } else {
      setError('Invalid pattern. Access denied.');
      handleReset();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    drawCanvas();
  }, [pattern]);

  return (
    <div className="min-h-screen pip-scanlines bg-pip-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card variant="pip-terminal" className="p-pip-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Grid3X3 className="h-12 w-12 text-primary pip-text-glow" />
            </div>
            <h1 className="text-2xl font-display font-bold text-pip-text-bright pip-text-glow">
              PATTERN SECURITY ACCESS
            </h1>
            <p className="text-pip-text-secondary mt-2 font-mono text-sm">
              Draw your unlock pattern
            </p>
          </div>

          {/* Pattern Canvas */}
          <div className="flex justify-center mb-6">
            <div className="relative pip-terminal border-2 border-pip-border rounded-lg p-4">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="touch-none cursor-pointer"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
              />
            </div>
          </div>

          {/* Pattern Info */}
          <div className="text-center mb-4">
            <p className="text-pip-text-secondary font-mono text-sm">
              Points connected: {pattern.length}
              {pattern.length > 0 && pattern.length < 4 && (
                <span className="text-yellow-500 ml-2">
                  (Min 4 required)
                </span>
              )}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center mb-4">
              <p className="text-destructive text-sm font-mono pip-text-glow">
                {error}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 pip-terminal border-pip-border font-mono"
              disabled={isLoading || pattern.length === 0}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              RESET
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={pattern.length < 4 || isLoading}
              className="flex-1 pip-button-glow font-mono font-bold"
            >
              {isLoading ? 'VERIFYING...' : 'ACCESS VAULT'}
            </Button>
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center">
            <p className="text-pip-text-muted font-mono text-xs">
              Connect at least 4 points to create your pattern
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};