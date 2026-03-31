import { useEffect, useRef, useState } from 'react';

export function useAnimatedValue(targetValue: number, duration: number = 300) {
  const [value, setValue] = useState(targetValue);
  const valueRef = useRef(targetValue);
  const targetRef = useRef(targetValue);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(targetValue);

  useEffect(() => {
    if (targetValue === targetRef.current) return;

    targetRef.current = targetValue;
    startValueRef.current = valueRef.current;
    startTimeRef.current = performance.now();

    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const newValue = startValueRef.current + (targetRef.current - startValueRef.current) * easeProgress;
      valueRef.current = newValue;
      setValue(newValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [targetValue, duration]);

  return value;
}
