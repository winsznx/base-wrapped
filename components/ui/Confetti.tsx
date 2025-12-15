'use client';

import { useEffect, useRef } from 'react';

export function Confetti() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Particle[] = [];
        const particleCount = 100;
        const colors = ['#0052FF', '#FFD700', '#FF6B35', '#FFFFFF', '#4169E1'];

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            color: string;
            alpha: number;
            size: number;

            constructor() {
                this.x = canvas!.width / 2;
                this.y = canvas!.height / 2;
                // Random velocity in all directions
                const angle = Math.random() * Math.PI * 2;
                const velocity = 10 + Math.random() * 10;
                this.vx = Math.cos(angle) * velocity;
                this.vy = Math.sin(angle) * velocity;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.alpha = 1;
                this.size = Math.random() * 8 + 4;
            }

            draw() {
                if (!ctx) return;
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += 0.2; // Gravity
                this.vx *= 0.99; // Drag
                this.vy *= 0.99;
                this.alpha -= 0.01;
            }
        }

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        let animationFrameId: number;

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let activeParticles = 0;
            particles.forEach(p => {
                if (p.alpha > 0) {
                    p.update();
                    p.draw();
                    activeParticles++;
                }
            });

            if (activeParticles > 0) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10
            }}
        />
    );
}


