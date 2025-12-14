'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './IntroAnimation.module.css';

interface IntroAnimationProps {
    onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
    const [phase, setPhase] = useState<'logo' | 'text' | 'exit'>('logo');

    useEffect(() => {
        // Phase 1: Logo appears and floats (0-1.5s)
        const textTimer = setTimeout(() => {
            setPhase('text');
        }, 1500);

        // Phase 2: Text appears (1.5-3s)
        const exitTimer = setTimeout(() => {
            setPhase('exit');
        }, 3000);

        // Phase 3: Exit animation (3-3.8s) then complete
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 3800);

        return () => {
            clearTimeout(textTimer);
            clearTimeout(exitTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div className={`${styles.container} ${phase === 'exit' ? styles.exit : ''}`}>
            {/* Background particles */}
            <div className={styles.particles}>
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className={styles.particle}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${3 + Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            {/* 3D Logo */}
            <div className={`${styles.logoWrapper} ${phase !== 'logo' ? styles.logoReady : ''}`}>
                <div className={styles.logoContainer}>
                    <div className={styles.logoGlow} />
                    <Image
                        src="/logo.png"
                        alt="Base Wrapped"
                        width={140}
                        height={140}
                        className={styles.logo}
                        priority
                    />
                    <div className={styles.logoReflection}>
                        <Image
                            src="/logo.png"
                            alt=""
                            width={140}
                            height={140}
                            className={styles.logoMirror}
                        />
                    </div>
                </div>
            </div>

            {/* Text */}
            <div className={`${styles.textWrapper} ${phase === 'text' || phase === 'exit' ? styles.textVisible : ''}`}>
                <h1 className={styles.title}>
                    <span className={styles.titleLine}>Base</span>
                    <span className={styles.titleLine}>Wrapped</span>
                </h1>
                <p className={styles.year}>2025</p>
            </div>
        </div>
    );
}
