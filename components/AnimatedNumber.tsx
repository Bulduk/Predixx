import { useEffect, useRef, memo } from 'react';

export const AnimatedNumber = memo(function AnimatedNumber({ 
  value, 
  format = (v: number) => v.toFixed(0),
  duration = 300,
  className = ''
}: { 
  value: number; 
  format?: (v: number) => string;
  duration?: number;
  className?: string;
}) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const targetRef = useRef(value);
  const currentRef = useRef(value);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === targetRef.current) return;

    const startValue = currentRef.current;
    const targetValue = value;
    targetRef.current = targetValue;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const newValue = startValue + (targetValue - startValue) * easeProgress;
      currentRef.current = newValue;

      if (nodeRef.current) {
        nodeRef.current.textContent = format(newValue);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [value, duration, format]);

  // Initial render
  useEffect(() => {
    if (nodeRef.current && currentRef.current === value) {
      nodeRef.current.textContent = format(value);
    }
  }, [value, format]);

  return <span ref={nodeRef} className={className}>{format(currentRef.current)}</span>;
});
