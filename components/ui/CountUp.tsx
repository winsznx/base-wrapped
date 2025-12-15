'use client';

import { useEffect, useState } from 'react';

interface CountUpProps {
    end: number;
    duration?: number;
    decimals?: number;
    suffix?: string;
    prefix?: string;
    delay?: number;
    className?: string;
}

export function CountUp({
    end,
    duration = 2000,
    decimals = 0,
    suffix = '',
    prefix = '',
    delay = 0,
    className
}: CountUpProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrameId: number;


        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;

            if (progress < duration) {
                // Ease out expo function
                const percentage = 1 - Math.pow(2, -10 * (progress / duration));
                setCount(end * percentage);
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        const timeoutId = setTimeout(() => {
            animationFrameId = requestAnimationFrame(animate);
        }, delay);

        return () => {
            cancelAnimationFrame(animationFrameId);
            clearTimeout(timeoutId);
        };
    }, [end, duration, delay]);

    return (
        <span className={className}>
            {prefix}{count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{suffix}
        </span>
    );
}
