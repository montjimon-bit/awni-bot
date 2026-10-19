import React, { useState, useEffect } from "react";
import { CyberSoundFX } from "../utils/audioUtils";

export type BotState = "idle" | "listening" | "thinking" | "speaking" | "happy" | "advising";

interface AwniCyberBotProps {
  botState: BotState;
  isMuted?: boolean;
  onBotClick?: () => void;
  statusMessage?: string;
}

export const AwniCyberBot: React.FC<AwniCyberBotProps> = ({
  botState,
  isMuted = false,
  onBotClick,
  statusMessage,
}) => {
  const [blink, setBlink] = useState(false);
  const [glance, setGlance] = useState<"center" | "left" | "right">("center");

  // Autonomous blinking and glancing when idle
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 4000 + Math.random() * 2500);

    const glanceInterval = setInterval(() => {
      const directions: ("center" | "left" | "right")[] = ["center", "left", "right", "center"];
      setGlance(directions[Math.floor(Math.random() * directions.length)]);
    }, 5000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(glanceInterval);
    };
  }, []);

  const handleClick = () => {
    CyberSoundFX.playBlip();
    if (onBotClick) onBotClick();
  };

  // State text description
  const getStateBadge = () => {
    switch (botState) {
      case "listening":
        return { text: "أستمع إليك باهتمام...", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" };
      case "thinking":
        return { text: "أحلل البيانات والاستشارة...", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" };
      case "speaking":
        return { text: "يتحدث مباشرة...", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
      case "advising":
        return { text: "استشارة اقتصادية معتمدة", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" };
      default:
        return { text: "متصل · رؤية عُمان 2040", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    }
  };

  const badge = getStateBadge();

  return (
    <div className="relative flex flex-col items-center select-none group">
      {/* Background Holographic Glow Field */}
      <div className="absolute -top-12 inset-x-0 h-80 bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />

      {/* Floating Status Ring Indicator */}
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md transition-all duration-300 ${badge.color}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              botState === "speaking"
                ? "bg-emerald-400 animate-ping"
                : botState === "listening"
                ? "bg-amber-400 animate-pulse"
                : botState === "thinking"
                ? "bg-cyan-400 animate-spin"
                : "bg-emerald-400"
            }`}
          />
          <span>{statusMessage || badge.text}</span>
          {isMuted && <span className="text-[10px] text-slate-400">(صامت)</span>}
        </span>
      </div>

      {/* Cyber Bot Interactive Avatar Body */}
      <div
        onClick={handleClick}
        className="relative cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
        title="انقر للتفاعل مع عوني"
      >
        {/* Holographic Overhead Orbit Ring */}
        <div className="absolute -top-6 inset-x-0 flex justify-center pointer-events-none animate-float-rings">
          <div className="w-36 h-6 rounded-full border border-emerald-400/40 border-dashed animate-[spin_18s_linear_infinite] shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
          </div>
        </div>

        {/* Floating Left Thruster / Shoulder Node */}
        <div className="absolute top-16 -left-8 w-6 h-14 rounded-full bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border border-emerald-500/30 shadow-lg flex flex-col items-center justify-between py-1 animate-float-cyber" style={{ animationDelay: "0.2s" }}>
          <div className="w-2 h-2 rounded-full bg-emerald-400/60 shadow-[0_0_6px_#10b981]" />
          <div className="w-1 h-4 rounded-full bg-emerald-500/30" />
          <div className="w-2.5 h-1 rounded-full bg-cyan-400/80 shadow-[0_0_8px_#06b6d4]" />
        </div>

        {/* Floating Right Thruster / Shoulder Node */}
        <div className="absolute top-16 -right-8 w-6 h-14 rounded-full bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border border-emerald-500/30 shadow-lg flex flex-col items-center justify-between py-1 animate-float-cyber" style={{ animationDelay: "0.6s" }}>
          <div className="w-2 h-2 rounded-full bg-emerald-400/60 shadow-[0_0_6px_#10b981]" />
          <div className="w-1 h-4 rounded-full bg-emerald-500/30" />
          <div className="w-2.5 h-1 rounded-full bg-cyan-400/80 shadow-[0_0_8px_#06b6d4]" />
        </div>

        {/* Main Floating Bot Body & Head */}
        <div className="relative animate-float-cyber">
          {/* Bot Head Chassis */}
          <div className="relative w-48 h-44 rounded-[40px] bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 p-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.2)] border-2 border-emerald-500/30">
            {/* Top Sensor Fin with Omani Gold Accent */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1">
              <div className="w-1 h-3 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
              <div className="w-8 h-2 rounded-t-lg bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500 border border-amber-300/40" />
              <div className="w-1 h-3 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
            </div>

            {/* Side Ear Antennas with Cyan LED tips */}
            <div className="absolute top-12 -left-2.5 w-2 h-8 rounded-l-md bg-slate-700 border-l border-emerald-400/60 flex items-center justify-center">
              <div className="w-1 h-3 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="absolute top-12 -right-2.5 w-2 h-8 rounded-r-md bg-slate-700 border-r border-emerald-400/60 flex items-center justify-center">
              <div className="w-1 h-3 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Inner Interactive OLED Screen */}
            <div className="relative w-full h-full rounded-[30px] bg-black/90 p-3 overflow-hidden border border-emerald-500/40 shadow-inner flex flex-col items-center justify-center">
              {/* Scanline CRT overlay */}
              <div className="absolute inset-0 scanline-effect pointer-events-none opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-teal-500/10 pointer-events-none" />

              {/* Eyes and Facial Expression Engine */}
              <div className="relative z-10 w-full flex flex-col items-center justify-center">
                {/* Mode 1: THINKING - Neural Rotation Ring */}
                {botState === "thinking" ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-14 h-14 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 border-r-emerald-400 animate-spin flex items-center justify-center shadow-[0_0_15px_#22d3ee]">
                      <div className="w-6 h-6 rounded-full border-2 border-emerald-300 border-b-transparent animate-[spin_1s_linear_infinite_reverse]" />
                    </div>
                    <span className="text-[10px] text-cyan-300 font-mono tracking-widest uppercase">
                      عوني يحلل الجدوى...
                    </span>
                  </div>
                ) : botState === "listening" ? (
                  /* Mode 2: LISTENING - Pulsating Sound Wave Sensors */
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="flex items-center gap-3">
                      {/* Left Listening Wave Eye */}
                      <div className="relative w-8 h-8 rounded-full border-2 border-amber-400/80 bg-amber-950/40 flex items-center justify-center shadow-[0_0_15px_#f59e0b]">
                        <div className="w-4 h-4 rounded-full bg-amber-400 animate-ping" />
                      </div>
                      {/* Center Frequency Audio Bars */}
                      <div className="flex items-center gap-1 h-6 px-1">
                        <div className="w-1 bg-amber-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-4" />
                        <div className="w-1 bg-amber-300 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-6" />
                        <div className="w-1 bg-amber-400 rounded-full animate-[pulse_0.3s_ease-in-out_infinite] h-5" />
                      </div>
                      {/* Right Listening Wave Eye */}
                      <div className="relative w-8 h-8 rounded-full border-2 border-amber-400/80 bg-amber-950/40 flex items-center justify-center shadow-[0_0_15px_#f59e0b]">
                        <div className="w-4 h-4 rounded-full bg-amber-400 animate-ping" />
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-300 font-medium">جاهز.. تكلّم الحين</span>
                  </div>
                ) : botState === "speaking" ? (
                  /* Mode 3: SPEAKING - Animated Expressive Eyes + Equalizer Mouth */
                  <div className="flex flex-col items-center gap-2">
                    {/* Glowing Eyes */}
                    <div className="flex items-center gap-8">
                      <div className="w-7 h-7 rounded-2xl bg-gradient-to-br from-emerald-300 to-teal-400 shadow-[0_0_15px_#34d399] flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                      </div>
                      <div className="w-7 h-7 rounded-2xl bg-gradient-to-br from-emerald-300 to-teal-400 shadow-[0_0_15px_#34d399] flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                      </div>
                    </div>
                    {/* Equalizer Mouth */}
                    <div className="flex items-center gap-1 h-5 mt-1">
                      <div className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.25s_infinite] h-2" />
                      <div className="w-1.5 bg-emerald-300 rounded-full animate-[pulse_0.4s_infinite] h-5" />
                      <div className="w-1.5 bg-cyan-300 rounded-full animate-[pulse_0.3s_infinite] h-4" />
                      <div className="w-1.5 bg-emerald-300 rounded-full animate-[pulse_0.5s_infinite] h-5" />
                      <div className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.3s_infinite] h-3" />
                    </div>
                  </div>
                ) : (
                  /* Mode 4: IDLE / ADVISING / HAPPY - Friendly Curved or Glowing Cyber Eyes */
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`flex items-center gap-8 transition-transform duration-300 ${
                        glance === "left"
                          ? "-translate-x-2"
                          : glance === "right"
                          ? "translate-x-2"
                          : "translate-x-0"
                      }`}
                    >
                      {/* Left Eye */}
                      <div
                        className={`transition-all duration-150 rounded-2xl bg-gradient-to-b from-emerald-300 via-emerald-400 to-teal-500 shadow-[0_0_16px_rgba(52,211,153,0.8)] flex items-center justify-center overflow-hidden ${
                          blink ? "h-1 w-7" : "h-7 w-7"
                        }`}
                      >
                        {!blink && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white translate-x-0.5 -translate-y-0.5 shadow-sm" />
                        )}
                      </div>

                      {/* Right Eye */}
                      <div
                        className={`transition-all duration-150 rounded-2xl bg-gradient-to-b from-emerald-300 via-emerald-400 to-teal-500 shadow-[0_0_16px_rgba(52,211,153,0.8)] flex items-center justify-center overflow-hidden ${
                          blink ? "h-1 w-7" : "h-7 w-7"
                        }`}
                      >
                        {!blink && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white translate-x-0.5 -translate-y-0.5 shadow-sm" />
                        )}
                      </div>
                    </div>

                    {/* Cute LED Smile Arc */}
                    <div className="w-8 h-2 rounded-b-full border-b-2 border-emerald-400/80 shadow-[0_2px_6px_#10b981]" />
                  </div>
                )}
              </div>

              {/* Lower Screen Micro Telemetry Label */}
              <div className="absolute bottom-1 inset-x-0 flex justify-center text-[9px] font-mono tracking-widest text-emerald-400/60 uppercase">
                <span>AWNI // MONTAJI 2040</span>
              </div>
            </div>
          </div>

          {/* Magnetic Floating Neck Coupler */}
          <div className="relative mx-auto -mt-1 w-24 h-4 rounded-full bg-gradient-to-r from-slate-800 via-emerald-900/60 to-slate-800 border border-emerald-500/40 flex items-center justify-center shadow-md">
            <div className="w-16 h-1 rounded-full bg-emerald-400/60 shadow-[0_0_8px_#10b981]" />
          </div>

          {/* Torso & Emblem Chassis with Omani Khanjar Motif */}
          <div className="relative mx-auto mt-0.5 w-36 h-20 rounded-b-[28px] rounded-t-lg bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border border-emerald-500/30 p-2 shadow-xl flex flex-col items-center justify-center">
            {/* Omani Dagger / Khanjar Holographic Emblem */}
            <div className="w-8 h-8 rounded-full bg-emerald-950/80 border border-amber-400/50 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.3)]">
              {/* Stylized Khanjar / Crown SVG */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-400 fill-current">
                <path d="M12 2L14 6L18 7L15 10L16 14L12 12L8 14L9 10L6 7L10 6L12 2Z" opacity="0.9" />
                <path d="M12 12V21M9 18H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-slate-200 mt-1">مُنتجي</span>
            <span className="text-[8px] text-emerald-400">سلطنة عُمان</span>

            {/* Bottom Thruster Anti-Gravity Plasma Glow */}
            <div className="absolute -bottom-3 inset-x-8 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Interactive Helper Text */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400">
          انقر على <strong className="text-emerald-400">عوني</strong> أو تحدث معه بالصوت للاستشارة الفورية
        </p>
      </div>
    </div>
  );
};
