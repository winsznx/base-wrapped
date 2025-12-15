'use client';

import { useEffect, useState } from 'react';

interface ProgressRingProps {
    radius: number;
    stroke: number;
    progress: number;
    color?: string;
    className?: string;
}

export function ProgressRing({
    radius,
    stroke,
    progress,
    color = '#0052FF',
    className
}: ProgressRingProps) {
    const [normalizedRadius, setNormalizedRadius] = useState(0);
    const [circumference, setCircumference] = useState(0);
    const [animatedProgress, setAnimatedProgress] = useState(0);

    useEffect(() => {
        setNormalizedRadius(radius - stroke * 2);
        setCircumference((radius - stroke * 2) * 2 * Math.PI);

        // Animate from 0 to progress
        const timeout = setTimeout(() => {
            setAnimatedProgress(progress);
        }, 100);

        return () => clearTimeout(timeout);
    }, [radius, stroke, progress]);

    const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

    return (
        <div className={className} style={{ position: 'relative', width: radius * 2, height: radius * 2 }}>
            <svg
                height={radius * 2}
                width={radius * 2}
                style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
            >
                <circle
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke={color}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{
                        strokeDashoffset,
                        transition: 'stroke-dashoffset 1s ease-out'
                    }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: `${radius * 0.4}px`
            }}>
                {animatedProgress}%
            </div>
        </div>
    );
}
