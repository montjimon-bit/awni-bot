import React, { useState, useEffect, useRef, useCallback } from "react";

export type BotMood = "idle" | "listening" | "thinking" | "speaking" | "happy";

interface CyberBotFaceProps {
  mood: BotMood;
  isAudioPlaying: boolean;
  onTap?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  shape: "dot" | "star" | "ring" | "spark";
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const CyberBotFace: React.FC<CyberBotFaceProps> = ({
  mood,
  isAudioPlaying,
  onTap,
}) => {
  const [blink, setBlink] = useState(false);
  const [lookDir, setLookDir] = useState<"center" | "left" | "right">("center");

  // Particle System Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const prevMoodRef = useRef<BotMood>(mood);

  // Trigger Particle Burst around the robot
  const triggerParticleBurst = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    const colors = [
      "#10b981", // Emerald
      "#34d399", // Light emerald
      "#6ee7b7", // Mint
      "#06b6d4", // Cyan
      "#22d3ee", // Sky cyan
      "#fbbf24", // Gold
      "#f59e0b", // Amber
      "#ffffff", // Cyber white
    ];

    const shapes: ("dot" | "star" | "ring" | "spark")[] = ["dot", "star", "ring", "spark"];

    const newParticles: Particle[] = [];
    const count = 55;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2.5 + Math.random() * 6.5;
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];

      newParticles.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color,
        alpha: 1.0,
        decay: 0.012 + Math.random() * 0.018,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        shape,
      });
    }

    particlesRef.current = newParticles;

    // Add 2 concentric cyber shockwaves
    shockwavesRef.current = [
      {
        x: cx,
        y: cy,
        radius: 30,
        maxRadius: Math.min(width, height) * 0.5,
        alpha: 0.85,
        color: "#34d399",
      },
      {
        x: cx,
        y: cy,
        radius: 15,
        maxRadius: Math.min(width, height) * 0.42,
        alpha: 0.7,
        color: "#fbbf24",
      },
    ];

    // Start animation loop if not running
    if (!animFrameRef.current) {
      const updateParticles = () => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render & update shockwaves
        shockwavesRef.current.forEach((sw) => {
          sw.radius += 4.5;
          sw.alpha = Math.max(0, sw.alpha - 0.022);

          if (sw.alpha > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.strokeStyle = sw.color;
            ctx.globalAlpha = sw.alpha;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = sw.color;
            ctx.shadowBlur = 12;
            ctx.stroke();
            ctx.restore();
          }
        });
        shockwavesRef.current = shockwavesRef.current.filter((sw) => sw.alpha > 0);

        // Render & update particles
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96; // Friction
          p.vy *= 0.96;
          p.vy += 0.04; // Gentle downward gravity
          p.rotation += p.vRot;
          p.alpha = Math.max(0, p.alpha - p.decay);

          if (p.alpha > 0) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.strokeStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;

            if (p.shape === "dot") {
              ctx.beginPath();
              ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
              ctx.fill();
            } else if (p.shape === "ring") {
              ctx.beginPath();
              ctx.arc(0, 0, p.size, 0, Math.PI * 2);
              ctx.lineWidth = 1.5;
              ctx.stroke();
            } else if (p.shape === "star") {
              // 4-pointed sparkle
              const s = p.size;
              ctx.beginPath();
              ctx.moveTo(0, -s);
              ctx.lineTo(s * 0.3, -s * 0.3);
              ctx.lineTo(s, 0);
              ctx.lineTo(s * 0.3, s * 0.3);
              ctx.lineTo(0, s);
              ctx.lineTo(-s * 0.3, s * 0.3);
              ctx.lineTo(-s, 0);
              ctx.lineTo(-s * 0.3, -s * 0.3);
              ctx.closePath();
              ctx.fill();
            } else if (p.shape === "spark") {
              ctx.beginPath();
              ctx.moveTo(-p.size, 0);
              ctx.lineTo(p.size, 0);
              ctx.lineWidth = 2;
              ctx.stroke();
            }

            ctx.restore();
          }
        });

        particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);

        if (particlesRef.current.length > 0 || shockwavesRef.current.length > 0) {
          animFrameRef.current = requestAnimationFrame(updateParticles);
        } else {
          animFrameRef.current = null;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      animFrameRef.current = requestAnimationFrame(updateParticles);
    }
  }, []);

  // Watch for transition from "thinking" -> "happy", or entry into "happy"
  useEffect(() => {
    if (prevMoodRef.current === "thinking" && mood === "happy") {
      triggerParticleBurst();
    } else if (mood === "happy" && prevMoodRef.current !== "happy") {
      triggerParticleBurst();
    }
    prevMoodRef.current = mood;
  }, [mood, triggerParticleBurst]);

  // Adjust canvas size to parent container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Idle autonomous blinking & eye movement
  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3800 + Math.random() * 2000);

    const lookTimer = setInterval(() => {
      const dirs: ("center" | "left" | "right")[] = ["center", "left", "center", "right"];
      setLookDir(dirs[Math.floor(Math.random() * dirs.length)]);
    }, 4500);

    return () => {
      clearInterval(blinkTimer);
      clearInterval(lookTimer);
    };
  }, []);

  return (
    <div
      onClick={onTap}
      className="relative flex items-center justify-center select-none cursor-pointer group"
      style={{ width: "min(90vw, 560px)", height: "min(60vh, 420px)" }}
    >
      {/* 0. Cyber Particle Overlay Canvas (Bursts around the robot upon thinking -> happy transition) */}
      <canvas
        ref={canvasRef}
        className="absolute -inset-16 w-[calc(100%+128px)] h-[calc(100%+128px)] pointer-events-none z-30"
      />

      {/* 1. Deep Ambient Cyber Emerald Aura behind the bot (Exactly like the video's green backlight) */}
      <div
        className={`absolute inset-0 rounded-full blur-[90px] transition-all duration-700 pointer-events-none ${
          mood === "listening"
            ? "bg-emerald-500/35 scale-110"
            : mood === "speaking"
            ? "bg-emerald-400/40 scale-125"
            : mood === "happy"
            ? "bg-teal-400/45 scale-130"
            : mood === "thinking"
            ? "bg-cyan-500/30 scale-105"
            : "bg-emerald-500/25 scale-100"
        }`}
      />

      {/* Floating Robot Rig with Smooth Hover Physics */}
      <div className="relative w-full h-full flex items-center justify-center animate-float-cyber">
        {/* ========================================================
            LEFT FLOATING HAND / FIN
        ======================================================== */}
        <div
          className={`absolute left-2 sm:left-6 transition-all duration-500 ${
            mood === "speaking"
              ? "-translate-y-6 -rotate-12 scale-105"
              : mood === "happy"
              ? "-translate-y-12 rotate-[-25deg] scale-110"
              : mood === "listening"
              ? "translate-y-2 rotate-6"
              : "translate-y-0 rotate-0"
          }`}
          style={{
            animation: "float-cyber 4s ease-in-out infinite",
            animationDelay: "0.4s",
          }}
        >
          <div className="relative w-12 sm:w-16 h-20 sm:h-28 rounded-[50px] bg-gradient-to-br from-white via-slate-100 to-slate-300 shadow-[0_10px_25px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.3)] border border-white/80">
            {/* Soft inner glow */}
            <div className="absolute top-2 left-2 w-4 h-8 rounded-full bg-white/70 blur-[2px]" />
          </div>
        </div>

        {/* ========================================================
            RIGHT FLOATING HAND / FIN (Gesturing & Waving)
        ======================================================== */}
        <div
          className={`absolute right-2 sm:right-6 transition-all duration-500 ${
            mood === "speaking"
              ? "-translate-y-8 rotate-16 scale-105"
              : mood === "happy"
              ? "-translate-y-14 rotate-[30deg] scale-115"
              : mood === "listening"
              ? "translate-y-2 -rotate-6"
              : "translate-y-0 rotate-0"
          }`}
          style={{
            animation: "float-cyber 4s ease-in-out infinite",
            animationDelay: "0.8s",
          }}
        >
          <div className="relative w-12 sm:w-16 h-20 sm:h-28 rounded-[50px] bg-gradient-to-br from-white via-slate-100 to-slate-300 shadow-[0_10px_25px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.3)] border border-white/80">
            {/* Soft inner glow */}
            <div className="absolute top-2 right-2 w-4 h-8 rounded-full bg-white/70 blur-[2px]" />
          </div>
        </div>

        {/* ========================================================
            CENTRAL ROBOT HEAD (Smooth White Chassis + Ears)
        ======================================================== */}
        <div className="relative w-[280px] sm:w-[360px] h-[230px] sm:h-[290px] flex items-center justify-center">
          {/* LEFT EAR (Pointed cyber ear like the video) */}
          <div
            className={`absolute -top-7 sm:-top-9 left-6 sm:left-10 w-12 sm:w-16 h-16 sm:h-20 bg-gradient-to-t from-slate-100 to-white rounded-tl-[36px] rounded-tr-[12px] shadow-[0_-5px_15px_rgba(0,0,0,0.3)] border-t border-l border-white/90 transform -rotate-12 transition-all duration-300 ${
              mood === "listening" ? "scale-110 -rotate-6" : ""
            }`}
          >
            {/* Glowing inner ear notch (cyan/emerald glow) */}
            <div className="absolute bottom-2 left-3 w-4 h-6 rounded-full bg-emerald-400/50 blur-[4px]" />
          </div>

          {/* RIGHT EAR (Pointed cyber ear like the video) */}
          <div
            className={`absolute -top-7 sm:-top-9 right-6 sm:right-10 w-12 sm:w-16 h-16 sm:h-20 bg-gradient-to-t from-slate-100 to-white rounded-tr-[36px] rounded-tl-[12px] shadow-[0_-5px_15px_rgba(0,0,0,0.3)] border-t border-r border-white/90 transform rotate-12 transition-all duration-300 ${
              mood === "listening" ? "scale-110 rotate-6" : ""
            }`}
          >
            {/* Glowing inner ear notch */}
            <div className="absolute bottom-2 right-3 w-4 h-6 rounded-full bg-emerald-400/50 blur-[4px]" />
          </div>

          {/* MAIN HEAD CHASSIS (Smooth curved TV/capsule head) */}
          <div className="relative w-full h-full rounded-[65px] sm:rounded-[80px] bg-gradient-to-b from-white via-slate-100 to-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_40px_rgba(16,185,129,0.35)] border-2 border-white/90 p-4 sm:p-5 flex items-center justify-center">
            {/* Top metallic specular shine */}
            <div className="absolute top-3 inset-x-12 h-6 rounded-full bg-white/80 blur-[6px] pointer-events-none" />

            {/* Subtle Omani Khanjar / Montaji Insignia on the forehead rim */}
            <div className="absolute top-2.5 flex items-center justify-center gap-1 opacity-60">
              <span className="text-[9px] font-bold text-slate-500 tracking-wider">
                مُنتجي · عوني
              </span>
            </div>

            {/* ========================================================
                DARK OLED VISOR SCREEN (The glowing interactive face)
            ======================================================== */}
            <div className="relative w-full h-full rounded-[50px] sm:rounded-[62px] bg-black shadow-[inset_0_5px_20px_rgba(0,0,0,0.9),0_0_15px_rgba(16,185,129,0.25)] border border-slate-900 overflow-hidden flex flex-col items-center justify-center p-4">
              {/* Screen CRT Scanlines & Cyber Gloss Overlay */}
              <div className="absolute inset-0 scanline-effect opacity-30 pointer-events-none" />
              <div className="absolute top-0 inset-x-4 h-12 rounded-b-[40px] bg-gradient-to-b from-emerald-500/15 via-white/5 to-transparent pointer-events-none" />

              {/* CELEBRATION / SPARKLES (When mood is happy) */}
              {mood === "happy" && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="text-amber-300 text-lg animate-ping absolute -top-2 left-10">✨</div>
                  <div className="text-emerald-300 text-xl animate-bounce absolute top-4 right-10">⭐</div>
                  <div className="text-cyan-300 text-sm animate-pulse absolute bottom-4 left-12">✨</div>
                </div>
              )}

              {/* ========================================================
                  DYNAMIC EYE EXPRESSIONS
              ======================================================== */}
              <div
                className={`relative z-10 flex items-center gap-12 sm:gap-16 transition-transform duration-300 ${
                  lookDir === "left"
                    ? "-translate-x-3"
                    : lookDir === "right"
                    ? "translate-x-3"
                    : "translate-x-0"
                }`}
              >
                {/* 1. HAPPY / JOYFUL ARCH EYES (^ ^) */}
                {mood === "happy" ? (
                  <>
                    <div className="w-10 sm:w-14 h-8 sm:h-10 border-t-4 sm:border-t-[6px] border-emerald-300 rounded-t-full shadow-[0_0_20px_#6ee7b7]" />
                    <div className="w-10 sm:w-14 h-8 sm:h-10 border-t-4 sm:border-t-[6px] border-emerald-300 rounded-t-full shadow-[0_0_20px_#6ee7b7]" />
                  </>
                ) : mood === "thinking" ? (
                  /* 2. THINKING EYES (Glancing dots / scanning bars) */
                  <>
                    <div className="w-10 sm:w-12 h-4 sm:h-5 rounded-full bg-cyan-300 shadow-[0_0_20px_#67e8f9] animate-pulse" />
                    <div className="w-10 sm:w-12 h-4 sm:h-5 rounded-full bg-cyan-300 shadow-[0_0_20px_#67e8f9] animate-pulse" />
                  </>
                ) : (
                  /* 3. STANDARD GLOWING CYBER EYES (Like the video: rounded rectangles with smooth corners) */
                  <>
                    {/* LEFT EYE */}
                    <div
                      className={`relative bg-gradient-to-b from-white via-emerald-200 to-emerald-400 rounded-2xl sm:rounded-3xl shadow-[0_0_25px_rgba(52,211,153,0.9),0_0_12px_#fff] flex items-center justify-center transition-all duration-150 ${
                        blink
                          ? "w-10 sm:w-14 h-1 sm:h-1.5"
                          : mood === "speaking"
                          ? "w-11 sm:w-14 h-10 sm:h-12 scale-105"
                          : "w-10 sm:w-12 h-9 sm:h-11"
                      }`}
                    >
                      {!blink && (
                        <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm -translate-y-1" />
                      )}
                    </div>

                    {/* RIGHT EYE */}
                    <div
                      className={`relative bg-gradient-to-b from-white via-emerald-200 to-emerald-400 rounded-2xl sm:rounded-3xl shadow-[0_0_25px_rgba(52,211,153,0.9),0_0_12px_#fff] flex items-center justify-center transition-all duration-150 ${
                        blink
                          ? "w-10 sm:w-14 h-1 sm:h-1.5"
                          : mood === "speaking"
                          ? "w-11 sm:w-14 h-10 sm:h-12 scale-105"
                          : "w-10 sm:w-12 h-9 sm:h-11"
                      }`}
                    >
                      {!blink && (
                        <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm -translate-y-1" />
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* ========================================================
                  LIFELIKE CYBER MOUTH (Subtle organic LED pulsation & soft speak wave)
              ======================================================== */}
              <div
                className={`relative z-10 mt-5 sm:mt-7 flex items-center justify-center gap-1.5 sm:gap-2 transition-transform duration-300 ${
                  mood === "speaking" || isAudioPlaying
                    ? "animate-mouth-subtle"
                    : mood === "happy"
                    ? "-translate-y-0.5 scale-105"
                    : "animate-mouth-breathe"
                }`}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                  // Center dots arch slightly up when happy for a subtle smile curve
                  const isCenter = i >= 2 && i <= 4;
                  const smileOffset = mood === "happy" && isCenter ? "-translate-y-0.5" : "";
                  // Staggered subtle wave delay when speaking
                  const speakDelay = `${(Math.abs(i - 3) * 0.12).toFixed(2)}s`;

                  return (
                    <div
                      key={i}
                      style={{
                        animationDelay: speakDelay,
                      }}
                      className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full transition-all duration-200 ${smileOffset} ${
                        mood === "speaking" || isAudioPlaying
                          ? "bg-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.95)]"
                          : mood === "happy"
                          ? "bg-emerald-300 shadow-[0_0_9px_rgba(52,211,153,0.9)]"
                          : "bg-emerald-300/85 shadow-[0_0_8px_rgba(52,211,153,0.75)]"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
