import React, { useEffect, useRef, useState } from "react";
import { ThemeMode } from "../types";

export type BackgroundMode = "ambient" | "analyzing" | "viewer";

interface AIInteractiveBackgroundProps {
  mode?: BackgroundMode;
  isAnalyzing?: boolean;
  themeMode?: ThemeMode;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  colorType: "emerald" | "cyan" | "indigo";
  pulsePhase: number;
  pulseSpeed: number;
}

interface CVTarget {
  x: number;
  y: number;
  size: number;
  label: string;
  alpha: number;
  phase: number;
}

export const AIInteractiveBackground: React.FC<AIInteractiveBackgroundProps> = ({
  mode = "ambient",
  isAnalyzing = false,
  themeMode = "light",
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDark = themeMode === "dark";

  // Effective visual state
  const effectiveMode: BackgroundMode = isAnalyzing
    ? "analyzing"
    : mode === "viewer"
    ? "viewer"
    : "ambient";

  // Mouse / Pointer tracking with smooth lerp
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });
  const smoothPointerRef = useRef<{ x: number; y: number }>({
    x: -1000,
    y: -1000,
  });

  // Scanner beam position for analyzing mode
  const scanYRef = useRef<number>(0);
  const scanDirectionRef = useRef<number>(1);

  // Particles & CV targets
  const particlesRef = useRef<Particle[]>([]);
  const cvTargetsRef = useRef<CVTarget[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Resize handler with devicePixelRatio support
    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);

      // Initialize or scale particles
      initParticles(width, height);
      initCVTargets(width, height);
    };

    const initParticles = (w: number, h: number) => {
      // Responsive particle count (fewer on mobile for 60fps)
      const isMobile = w < 768;
      const count = isMobile ? 26 : 48;
      const particles: Particle[] = [];

      const colorTypes: ("emerald" | "cyan" | "indigo")[] = [
        "emerald",
        "cyan",
        "indigo",
      ];

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 2.2 + 1.2,
          baseAlpha: Math.random() * 0.45 + 0.25,
          alpha: 0.3,
          colorType: colorTypes[Math.floor(Math.random() * colorTypes.length)],
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.025 + 0.015,
        });
      }
      particlesRef.current = particles;
    };

    const initCVTargets = (w: number, h: number) => {
      // Generate 4-6 computer vision feature detection boxes
      const labels = [
        "SEGMENT_A",
        "NODE_DETECT",
        "LABEL_OCR",
        "VECTOR_PTS",
        "FEATURE_ROI",
        "STRUCTURE",
      ];
      const targets: CVTarget[] = [];
      const count = Math.min(5, Math.floor(w / 240));

      for (let i = 0; i < count; i++) {
        targets.push({
          x: (w * (i + 1)) / (count + 1) + (Math.random() - 0.5) * 60,
          y: h * 0.25 + Math.random() * (h * 0.5),
          size: Math.random() * 32 + 28,
          label: labels[i % labels.length],
          alpha: 0,
          phase: Math.random() * Math.PI * 2,
        });
      }
      cvTargetsRef.current = targets;
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    // Pointer move listener
    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    // Main render loop
    let tick = 0;

    const render = () => {
      tick++;

      // Smooth pointer position lerp
      if (pointerRef.current.active) {
        smoothPointerRef.current.x +=
          (pointerRef.current.x - smoothPointerRef.current.x) * 0.06;
        smoothPointerRef.current.y +=
          (pointerRef.current.y - smoothPointerRef.current.y) * 0.06;
      } else {
        smoothPointerRef.current.x +=
          (-1000 - smoothPointerRef.current.x) * 0.04;
        smoothPointerRef.current.y +=
          (-1000 - smoothPointerRef.current.y) * 0.04;
      }

      ctx.clearRect(0, 0, width, height);

      // Color palette definitions based on light / dark
      const palette = isDark
        ? {
            emerald: "rgba(16, 185, 129,",
            cyan: "rgba(6, 182, 212,",
            indigo: "rgba(99, 102, 241,",
            grid: "rgba(148, 163, 184, 0.04)",
            line: "rgba(56, 189, 248,",
            scanner: "rgba(16, 185, 129,",
            glowDisc1: "rgba(16, 185, 129, 0.045)",
            glowDisc2: "rgba(6, 182, 212, 0.04)",
          }
        : {
            emerald: "rgba(5, 150, 105,",
            cyan: "rgba(2, 132, 199,",
            indigo: "rgba(79, 70, 229,",
            grid: "rgba(100, 116, 139, 0.035)",
            line: "rgba(14, 165, 233,",
            scanner: "rgba(16, 185, 129,",
            glowDisc1: "rgba(16, 185, 129, 0.03)",
            glowDisc2: "rgba(14, 165, 233, 0.03)",
          };

      // 1. Subtle Ambient Soft Glowing Discs in background
      const disc1X = width * 0.8 + Math.sin(tick * 0.008) * 40;
      const disc1Y = height * 0.2 + Math.cos(tick * 0.009) * 30;
      const rad1 = ctx.createRadialGradient(disc1X, disc1Y, 10, disc1X, disc1Y, 380);
      rad1.addColorStop(0, palette.glowDisc1);
      rad1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rad1;
      ctx.fillRect(0, 0, width, height);

      const disc2X = width * 0.2 + Math.cos(tick * 0.007) * 40;
      const disc2Y = height * 0.75 + Math.sin(tick * 0.008) * 30;
      const rad2 = ctx.createRadialGradient(disc2X, disc2Y, 10, disc2X, disc2Y, 420);
      rad2.addColorStop(0, palette.glowDisc2);
      rad2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rad2;
      ctx.fillRect(0, 0, width, height);

      // 2. Technical CV Matrix Grid (Very subtle geometric matrix)
      const gridSize = 64;
      ctx.strokeStyle = palette.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Draw faint horizontal matrix grid lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      // Draw faint vertical matrix grid lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      ctx.stroke();

      // Technical crosshairs (+) at some grid intersections
      const crossSize = 3;
      ctx.strokeStyle = isDark
        ? "rgba(148, 163, 184, 0.12)"
        : "rgba(100, 116, 139, 0.08)";
      ctx.beginPath();
      for (let x = gridSize * 2; x < width; x += gridSize * 3) {
        for (let y = gridSize * 2; y < height; y += gridSize * 3) {
          ctx.moveTo(x - crossSize, y);
          ctx.lineTo(x + crossSize, y);
          ctx.moveTo(x, y - crossSize);
          ctx.lineTo(x, y + crossSize);
        }
      }
      ctx.stroke();

      // 3. Smooth Sinusoidal Ambient Wave (Bottom flow)
      const waveAlpha = effectiveMode === "analyzing" ? 0.08 : 0.04;
      const waveColor = isDark
        ? `rgba(56, 189, 248, ${waveAlpha})`
        : `rgba(14, 165, 233, ${waveAlpha})`;
      ctx.fillStyle = waveColor;
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 16) {
        const waveY =
          height -
          45 +
          Math.sin((x * 0.005) + tick * 0.012) * 16 +
          Math.cos((x * 0.003) - tick * 0.008) * 10;
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // 4. Update & Draw Particles (Constellation Neural Graph)
      const particles = particlesRef.current;
      const maxConnectDist = effectiveMode === "analyzing" ? 140 : 110;
      const maxConnectDistSq = maxConnectDist * maxConnectDist;

      // Speed modifier based on mode
      const speedMod =
        effectiveMode === "analyzing" ? 1.6 : effectiveMode === "viewer" ? 0.45 : 0.85;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx * speedMod;
        p.y += p.vy * speedMod;

        // Bounce on boundaries
        if (p.x < 0) {
          p.x = 0;
          p.vx = Math.abs(p.vx);
        } else if (p.x > width) {
          p.x = width;
          p.vx = -Math.abs(p.vx);
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy = Math.abs(p.vy);
        } else if (p.y > height) {
          p.y = height;
          p.vy = -Math.abs(p.vy);
        }

        // Pointer proximity interaction (gentle deflection)
        const dx = p.x - smoothPointerRef.current.x;
        const dy = p.y - smoothPointerRef.current.y;
        const distSq = dx * dx + dy * dy;
        const pointerReach = 130;
        if (distSq < pointerReach * pointerReach && distSq > 0.1) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / pointerReach) * 0.8;
          p.x += (dx / dist) * force * 2;
          p.y += (dy / dist) * force * 2;
        }

        // Calculate pulsing alpha
        p.pulsePhase += p.pulseSpeed;
        const pulse = (Math.sin(p.pulsePhase) + 1) * 0.5; // 0 to 1
        const alphaMultiplier =
          effectiveMode === "viewer"
            ? 0.55 // Calm & quiet in viewer
            : effectiveMode === "analyzing"
            ? 1.25 // Bright & dynamic in scanner
            : 0.9;
        p.alpha = Math.min(
          1,
          Math.max(0.1, (p.baseAlpha + pulse * 0.3) * alphaMultiplier)
        );

        // Draw particle dot
        const colorPrefix = palette[p.colorType];
        ctx.fillStyle = `${colorPrefix}${p.alpha * (isDark ? 0.75 : 0.5)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect near neighbors with neural lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const lineDx = p.x - p2.x;
          const lineDy = p.y - p2.y;
          const lineDistSq = lineDx * lineDx + lineDy * lineDy;

          if (lineDistSq < maxConnectDistSq) {
            const lineDist = Math.sqrt(lineDistSq);
            const lineAlpha = (1 - lineDist / maxConnectDist) * 0.22 * alphaMultiplier;
            ctx.strokeStyle = `${palette.line}${lineAlpha * (isDark ? 0.6 : 0.35)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 5. MODE-SPECIFIC EFFECT: SCANNER & COMPUTER VISION ANALYSIS
      if (effectiveMode === "analyzing") {
        // Move scanner beam
        const scanSpeed = 3.5;
        scanYRef.current += scanSpeed * scanDirectionRef.current;
        if (scanYRef.current > height) {
          scanYRef.current = height;
          scanDirectionRef.current = -1;
        } else if (scanYRef.current < 0) {
          scanYRef.current = 0;
          scanDirectionRef.current = 1;
        }

        const scanY = scanYRef.current;

        // Laser beam gradient trail (scanner glow)
        const trailHeight = 70;
        const beamGrad = ctx.createLinearGradient(
          0,
          scanY - (scanDirectionRef.current > 0 ? trailHeight : -trailHeight),
          0,
          scanY
        );
        beamGrad.addColorStop(
          0,
          isDark ? "rgba(16, 185, 129, 0)" : "rgba(5, 150, 105, 0)"
        );
        beamGrad.addColorStop(
          0.7,
          isDark ? "rgba(16, 185, 129, 0.08)" : "rgba(5, 150, 105, 0.06)"
        );
        beamGrad.addColorStop(
          1,
          isDark ? "rgba(52, 211, 153, 0.25)" : "rgba(16, 185, 129, 0.18)"
        );

        ctx.fillStyle = beamGrad;
        ctx.fillRect(
          0,
          scanDirectionRef.current > 0 ? scanY - trailHeight : scanY,
          width,
          trailHeight
        );

        // Core bright laser line
        ctx.strokeStyle = isDark
          ? "rgba(52, 211, 153, 0.85)"
          : "rgba(16, 185, 129, 0.75)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.stroke();

        // Laser beam head pulse
        const pingX = (tick * 8) % width;
        const pingGrad = ctx.createRadialGradient(
          pingX,
          scanY,
          2,
          pingX,
          scanY,
          40
        );
        pingGrad.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        pingGrad.addColorStop(0.3, "rgba(52, 211, 153, 0.5)");
        pingGrad.addColorStop(1, "rgba(16, 185, 129, 0)");
        ctx.fillStyle = pingGrad;
        ctx.beginPath();
        ctx.arc(pingX, scanY, 40, 0, Math.PI * 2);
        ctx.fill();

        // Draw Computer Vision analytical targeting boxes (CV reticles)
        const cvTargets = cvTargetsRef.current;
        for (let k = 0; k < cvTargets.length; k++) {
          const target = cvTargets[k];
          target.phase += 0.03;
          target.alpha = (Math.sin(target.phase) + 1) * 0.5;

          const s = target.size;
          const tx = target.x;
          const ty = target.y;

          ctx.strokeStyle = isDark
            ? `rgba(52, 211, 153, ${target.alpha * 0.65})`
            : `rgba(16, 185, 129, ${target.alpha * 0.55})`;
          ctx.lineWidth = 1.2;

          // Corner brackets
          const cornerLen = 7;
          ctx.beginPath();
          // Top Left
          ctx.moveTo(tx, ty + cornerLen);
          ctx.lineTo(tx, ty);
          ctx.lineTo(tx + cornerLen, ty);
          // Top Right
          ctx.moveTo(tx + s - cornerLen, ty);
          ctx.lineTo(tx + s, ty);
          ctx.lineTo(tx + s, ty + cornerLen);
          // Bottom Right
          ctx.moveTo(tx + s, ty + s - cornerLen);
          ctx.lineTo(tx + s, ty + s);
          ctx.lineTo(tx + s - cornerLen, ty + s);
          // Bottom Left
          ctx.moveTo(tx + cornerLen, ty + s);
          ctx.lineTo(tx, ty + s);
          ctx.lineTo(tx, ty + s - cornerLen);
          ctx.stroke();

          // Small technical coordinate text
          ctx.font = "9px monospace";
          ctx.fillStyle = isDark
            ? `rgba(148, 163, 184, ${target.alpha * 0.7})`
            : `rgba(71, 85, 105, ${target.alpha * 0.6})`;
          ctx.fillText(`[${target.label}]`, tx, ty - 4);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [effectiveMode, isDark]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: "100%", height: "100%" }}
      />

      {/* When analyzing, show a subtle HUD badge indicating active computer vision analysis */}
      {effectiveMode === "analyzing" && (
        <div
          className={`absolute top-20 right-6 px-3 py-1.5 rounded-xl border backdrop-blur-md flex items-center gap-2 shadow-lg transition-all animate-pulse ${
            isDark
              ? "bg-[#0B1528]/80 border-emerald-500/40 text-emerald-300"
              : "bg-white/85 border-emerald-500/40 text-emerald-800"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
            AI Vision Engine // Scanning Matrix
          </span>
        </div>
      )}
    </div>
  );
};
