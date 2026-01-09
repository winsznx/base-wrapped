'use client';

import { useEffect, useState, useRef } from 'react';

interface CountUpProps {
    end: number;
    duration?: number;
    decimals?: number;
    suffix?: string;
    prefix?: string;
    delay?: number;
    className?: string;
    onStart?: () => void;
    onComplete?: () => void;
}

export function CountUp({
    end,
    duration = 2000,
    decimals = 0,
    suffix = '',
    prefix = '',
    delay = 0,
    className,
    onStart,
    onComplete
}: CountUpProps) {
    const [count, setCount] = useState(0);
    const animationFrameId = useRef<number>();

    useEffect(() => {
        let startTime: number | null = null;
        
        const animate = (timestamp: number) => {
            if (!startTime) {
                startTime = timestamp;
                onStart?.(); // Callback when animation starts
            }
            
            const progress = timestamp - startTime;

            if (progress < duration) {
                const percentage = 1 - Math.pow(2, -10 * (progress / duration));
                setCount(end * percentage);
                animationFrameId.current = requestAnimationFrame(animate);
            } else {
                setCount(end);
                onComplete?.(); // Callback when animation completes
            }
        };

        const timeoutId = setTimeout(() => {
            animationFrameId.current = requestAnimationFrame(animate);
        }, delay);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            clearTimeout(timeoutId);
        };
    }, [end, duration, delay, onStart, onComplete]);

    return (
        <span className={className}>
            {prefix}{count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{suffix}
        </span>
    );
}
