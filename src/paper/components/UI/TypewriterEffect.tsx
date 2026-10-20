'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { usePerformance } from '../../hooks/usePerformance';
import { measureTextWidth } from '../../utils/pretext';

interface TypewriterEffectProps {
  text: string;
  delay?: number;
  className?: string;
  cursorClassName?: string;
  typingSpeed?: number;
  hideCursorOnComplete?: boolean;
  font?: string;
}

export const TypewriterEffect = ({ 
  text, 
  delay = 0, 
  className = '',
  cursorClassName = '',
  typingSpeed = 75,
  hideCursorOnComplete = false,
  font = '16px monospace',
}: TypewriterEffectProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const { simplify } = usePerformance();

  const [naturalWidth, setNaturalWidth] = useState<number | undefined>(undefined);

  // Measure natural width on client mount to avoid canvas SSR mismatch
  useEffect(() => {
    const width = measureTextWidth(text, font);
    if (width > 0) {
      setNaturalWidth(Math.ceil(width));
    }
  }, [text, font]);

  useEffect(() => {
    if (simplify) {
      setDisplayedText(text);
      setHasStarted(true);
      return;
    }

    // Start typing after initial delay
    const startTimeout = setTimeout(() => {
      setHasStarted(true);
      setIsTyping(true);
      let i = 0;
      
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, typingSpeed); 
      
      return () => clearInterval(typingInterval);
    }, delay * 1000);

    return () => clearTimeout(startTimeout);
  }, [text, delay, typingSpeed, simplify]);

  return (
    <span
      suppressHydrationWarning
      className={`inline-block ${className}`}
      style={{ minWidth: naturalWidth ? `${naturalWidth}px` : undefined }}
    >
      {displayedText}
    </span>
  );
};
