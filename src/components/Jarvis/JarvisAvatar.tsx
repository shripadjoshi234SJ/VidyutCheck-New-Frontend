import React, { useRef, useEffect } from 'react';

interface JarvisAvatarProps {
  state: 'idle' | 'listening' | 'processing' | 'speaking';
  size?: number;
}

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  angle: number;
  speed: number;
  radius: number;
  color: string;
}

const JarvisAvatar: React.FC<JarvisAvatarProps> = ({ state, size = 120 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];
    const particleCount = 60;
    const centerX = size / 2;
    const centerY = size / 2;
    const sphereRadius = size * 0.28;

    // Get color based on state
    const getColor = (currentState: string, opacity = 1) => {
      switch (currentState) {
        case 'listening': // Neon Green
          return `rgba(34, 197, 94, ${opacity})`;
        case 'processing': // Vivid Purple
          return `rgba(139, 92, 246, ${opacity})`;
        case 'speaking': // Electric Blue / Pink wave
          return `rgba(244, 63, 94, ${opacity})`;
        case 'idle':
        default: // Electric Blue
          return `rgba(59, 130, 246, ${opacity})`;
      }
    };

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * sphereRadius;
      const y = centerY + Math.sin(angle) * sphereRadius;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        angle,
        speed: 0.02 + Math.random() * 0.02,
        radius: 1.5 + Math.random() * 1.5,
        color: getColor(state),
      });
    }

    let time = 0;

    // Render loop
    const render = () => {
      time += 0.05;
      ctx.clearRect(0, 0, size, size);

      // Draw background central core glow
      const glowGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, sphereRadius * 1.5);
      glowGrad.addColorStop(0, getColor(state, 0.25));
      glowGrad.addColorStop(0.5, getColor(state, 0.05));
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Connect particles with thin webbing lines (neural network style)
      ctx.strokeStyle = getColor(state, 0.08);
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < size * 0.3) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach((p, idx) => {
        p.angle += p.speed;

        // Apply state-specific physics
        switch (state) {
          case 'processing': {
            // Rapid inward/outward breathing motion + faster rotation
            p.angle += p.speed * 1.5;
            const orbitScale = 1 + Math.sin(time * 2 + idx) * 0.15;
            p.x = centerX + Math.cos(p.angle) * sphereRadius * orbitScale;
            p.y = centerY + Math.sin(p.angle) * sphereRadius * orbitScale;
            p.color = getColor('processing', 0.9);
            break;
          }
          case 'listening': {
            // High frequency micro vibration
            const pulse = 1 + Math.sin(time * 4 + idx) * 0.05;
            const jitter = (Math.random() - 0.5) * 1.5;
            p.x = centerX + Math.cos(p.angle) * sphereRadius * pulse + jitter;
            p.y = centerY + Math.sin(p.angle) * sphereRadius * pulse + jitter;
            p.color = getColor('listening', 0.95);
            break;
          }
          case 'speaking': {
            // Waveform modulation (sine wave)
            const waveY = Math.sin(time + p.angle * 2) * 12;
            const distCenter = Math.abs(p.angle - Math.PI);
            const amplitude = Math.max(0, 1 - distCenter / Math.PI); // Pinched at ends
            
            // Map particles to an undulating horizontal line
            const targetX = size * 0.15 + (idx / particleCount) * size * 0.7;
            const targetY = centerY + waveY * amplitude;
            
            p.x += (targetX - p.x) * 0.1;
            p.y += (targetY - p.y) * 0.1;
            p.color = getColor('speaking', 0.9);
            break;
          }
          case 'idle':
          default: {
            // Smooth slow rotation + breathing
            const breathe = 1 + Math.sin(time * 0.5) * 0.08;
            const targetX = centerX + Math.cos(p.angle) * sphereRadius * breathe;
            const targetY = centerY + Math.sin(p.angle) * sphereRadius * breathe;
            
            // Smooth transition back to circle if coming from speaking wave
            p.x += (targetX - p.x) * 0.1;
            p.y += (targetY - p.y) * 0.1;
            p.color = getColor('idle', 0.8);
            break;
          }
        }

        // Draw particle node
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw tiny outer halo ring
        if (idx === 0) {
          ctx.strokeStyle = getColor(state, 0.2);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(centerX, centerY, sphereRadius * 1.1, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Central core pulsing circle
      ctx.fillStyle = getColor(state, 0.4);
      ctx.beginPath();
      const coreSize = 4 + Math.sin(time) * 1.5;
      ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        display: 'block',
        margin: '0 auto',
      }}
    />
  );
};

export default JarvisAvatar;
