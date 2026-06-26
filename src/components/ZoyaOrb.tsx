import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { AssistantState } from "../types";
import { Mic, MicOff, Power, Volume2, Shield, Radio, Activity } from "lucide-react";

interface ZoyaOrbProps {
  state: AssistantState;
  userVolume: number;
  zoyaVolume: number;
  onTogglePower: () => void;
  errorMessage?: string;
  appTheme?: "cosmic" | "cyberpunk" | "emerald" | "amber" | "neon-pink" | "sunset" | "electric-violet" | "aurora" | "cherry" | "ocean-breeze";
  assistantName?: string;
  voiceGender?: "Male" | "Female";
  aiCardGlowEnabled?: boolean;
  waveDesign?: string;
  waveStyle?: "curve" | "circular" | "electric" | "radio" | "voice";
}

interface WaveStyle {
  bgGradientId: string;
  line1: string;
  line2: string;
  line3: string;
  line4: string;
  line5: string;
  line6: string;
  line7: string;
  ampMultiplier: number;
  speedMultiplier: number;
}

export const WAVE_DESIGN_CONFIGS: Record<string, WaveStyle> = {
  cosmic: {
    bgGradientId: "wave-gradient-cyan",
    line1: "#06B6D4", // Cyan
    line2: "#A855F7", // Purple
    line3: "#EC4899", // Pink
    line4: "#F59E0B", // Amber
    line5: "#10B981", // Emerald
    line6: "#3B82F6", // Deep Blue
    line7: "#FFFFFF", // White
    ampMultiplier: 1.55,
    speedMultiplier: 1.0,
  },
  matrix: {
    bgGradientId: "wave-gradient-green",
    line1: "#10B981", // Emerald
    line2: "#059669", // Dark Emerald
    line3: "#34D399", // Mint
    line4: "#14B8A6", // Teal
    line5: "#06B6D4", // Cyan
    line6: "#22C55E", // Green
    line7: "#AAFF00", // Lime
    ampMultiplier: 1.85,
    speedMultiplier: 0.75,
  },
  volcanic: {
    bgGradientId: "wave-gradient-red",
    line1: "#EF4444", // Red
    line2: "#F97316", // Orange
    line3: "#F59E0B", // Amber
    line4: "#DC2626", // Dark Red
    line5: "#EA580C", // Rust Orange
    line6: "#FACC15", // Yellow
    line7: "#FFFFFF", // White
    ampMultiplier: 1.95,
    speedMultiplier: 0.65,
  },
  "deep-blue": {
    bgGradientId: "wave-gradient-blue",
    line1: "#2563EB", // Royal Blue
    line2: "#3B82F6", // Blue
    line3: "#06B6D4", // Cyan
    line4: "#1E3A8A", // Deep Navy
    line5: "#0EA5E9", // Sky Blue
    line6: "#14B8A6", // Ocean Teal
    line7: "#E0F2FE", // Light ice blue
    ampMultiplier: 1.35,
    speedMultiplier: 1.4,
  },
  "cyber-pink": {
    bgGradientId: "wave-gradient-pink",
    line1: "#EC4899", // Pink
    line2: "#D946EF", // Fuchsia
    line3: "#A855F7", // Purple
    line4: "#F43F5E", // Rose
    line5: "#818CF8", // Indigo
    line6: "#F472B6", // Light pink
    line7: "#FFFFFF", // White
    ampMultiplier: 1.70,
    speedMultiplier: 0.85,
  }
};

const ORB_THEME_STYLES = {
  cosmic: {
    card: "bg-white/90 border border-slate-200/80 shadow-[0_20px_50px_rgba(120,119,198,0.1)] text-slate-800",
    textMuted: "text-slate-400",
    textBold: "text-slate-700",
    bgMuted: "bg-slate-50",
    borderMuted: "border-slate-100",
  },
  cyberpunk: {
    card: "bg-slate-900/95 border border-cyan-500/30 shadow-[0_20px_50px_rgba(6,182,212,0.15)] text-slate-200",
    textMuted: "text-cyan-400/80",
    textBold: "text-cyan-300",
    bgMuted: "bg-slate-950/80",
    borderMuted: "border-cyan-500/20",
  },
  emerald: {
    card: "bg-zinc-900/95 border border-emerald-500/30 shadow-[0_20px_50px_rgba(16,185,129,0.15)] text-zinc-100",
    textMuted: "text-emerald-400/80",
    textBold: "text-emerald-300",
    bgMuted: "bg-zinc-950/80",
    borderMuted: "border-emerald-500/20",
  },
  amber: {
    card: "bg-stone-900/95 border border-amber-500/30 shadow-[0_20px_50px_rgba(245,158,11,0.15)] text-stone-200",
    textMuted: "text-amber-400/80",
    textBold: "text-amber-300",
    bgMuted: "bg-stone-950/80",
    borderMuted: "border-amber-500/20",
  },
  "neon-pink": {
    card: "bg-slate-900/95 border border-pink-500/30 shadow-[0_20px_50px_rgba(236,72,153,0.15)] text-slate-100",
    textMuted: "text-pink-400/80",
    textBold: "text-pink-300",
    bgMuted: "bg-slate-950/80",
    borderMuted: "border-pink-500/20",
  },
  sunset: {
    card: "bg-slate-900/95 border border-orange-500/30 shadow-[0_20px_50px_rgba(249,115,22,0.15)] text-slate-100",
    textMuted: "text-orange-400/80",
    textBold: "text-orange-300",
    bgMuted: "bg-slate-950/80",
    borderMuted: "border-orange-500/20",
  },
  "electric-violet": {
    card: "bg-zinc-900/95 border border-violet-500/30 shadow-[0_20px_50px_rgba(139,92,246,0.15)] text-zinc-100",
    textMuted: "text-violet-400/80",
    textBold: "text-violet-300",
    bgMuted: "bg-zinc-950/80",
    borderMuted: "border-violet-500/20",
  },
  aurora: {
    card: "bg-slate-900/95 border border-teal-500/30 shadow-[0_20px_50px_rgba(20,184,166,0.15)] text-teal-100",
    textMuted: "text-teal-400/80",
    textBold: "text-teal-300",
    bgMuted: "bg-slate-950/80",
    borderMuted: "border-teal-500/20",
  },
  cherry: {
    card: "bg-stone-900/95 border border-rose-500/30 shadow-[0_20px_50px_rgba(244,63,94,0.15)] text-stone-100",
    textMuted: "text-rose-400/80",
    textBold: "text-rose-300",
    bgMuted: "bg-stone-950/80",
    borderMuted: "border-rose-500/20",
  },
  "ocean-breeze": {
    card: "bg-slate-900/95 border border-sky-500/30 shadow-[0_20px_50px_rgba(14,165,233,0.15)] text-sky-100",
    textMuted: "text-sky-400/80",
    textBold: "text-sky-300",
    bgMuted: "bg-slate-950/80",
    borderMuted: "border-sky-500/20",
  }
};

export default function ZoyaOrb({
  state,
  userVolume,
  zoyaVolume,
  onTogglePower,
  errorMessage,
  appTheme = "cosmic",
  assistantName = "Zoya",
  voiceGender = "Female",
  aiCardGlowEnabled = true,
  waveDesign = "cosmic",
  waveStyle = "curve",
}: ZoyaOrbProps) {
  const waveConfig = WAVE_DESIGN_CONFIGS[waveDesign] || WAVE_DESIGN_CONFIGS.cosmic;
  const time = Date.now() * 0.008;

  // Generate random jumping heights for the equalizer bar visualizer
  const [barHeights, setBarHeights] = useState<number[]>(new Array(24).fill(15));
  const animationRef = useRef<number | null>(null);

  const activeVolume =
    state === AssistantState.SPEAKING
      ? zoyaVolume
      : state === AssistantState.LISTENING
      ? userVolume
      : 0;

  useEffect(() => {
    let lastUpdate = 0;
    const updateBars = () => {
      const now = Date.now();
      // Throttle equalizer bar heights updates to 20 FPS (every 50ms) to significantly save CPU and prevent interface lagging
      if (now - lastUpdate >= 50) {
        lastUpdate = now;
        const isIdle = state === AssistantState.IDLE;
        const isConnecting = state === AssistantState.CONNECTING;
        const isDisconnected = state === AssistantState.DISCONNECTED || state === AssistantState.ERROR;

        setBarHeights((prev) =>
          prev.map(() => {
            if (isDisconnected) {
              return 4 + Math.random() * 4; // Flatline quiet state
            }
            if (isConnecting) {
              return 8 + Math.random() * 12; // Slow pulse
            }
            if (isIdle) {
              return 6 + Math.random() * 10; // Idle breathing
            }
            
            // Active state (speaking or listening)
            const baseHeight = 6;
            const randomFactor = Math.random() * 20;
            // Scale based on audio volume
            const volumeFactor = activeVolume * 150;
            return Math.min(60, baseHeight + randomFactor + volumeFactor);
          })
        );
      }
      animationRef.current = requestAnimationFrame(updateBars);
    };

    animationRef.current = requestAnimationFrame(updateBars);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state, activeVolume]);

  // Determine current system status colors & text
  const getSystemTheme = () => {
    const pronounSubject = voiceGender === "Male" ? "he" : "she";
    const pronounPossessive = voiceGender === "Male" ? "his" : "her";
    const pronounNoun = voiceGender === "Male" ? "guy" : "girl";

    switch (state) {
      case AssistantState.CONNECTING:
        return {
          badgeBg: "bg-purple-50 text-purple-600 border-purple-100",
          statusText: "CONNECTING_TUNNEL",
          badgeLabel: "SYS: BOOTING",
          textColor: "text-purple-500",
          accentColor: "#A855F7",
          desc: `Establishing highly secure multi-duplex bridge to ${assistantName}'s sass core...`,
        };
      case AssistantState.LISTENING:
        return {
          badgeBg: "bg-rose-50 text-rose-600 border-rose-100 animate-pulse",
          statusText: "LISTENING_ACTIVE",
          badgeLabel: "SYS: CAPTURING",
          textColor: "text-rose-500",
          accentColor: "#F43F5E",
          desc: "Mic stream is fully armed. Talk to me, sweetie—I am all ears.",
        };
      case AssistantState.SPEAKING:
        return {
          badgeBg: "bg-amber-50 text-amber-600 border-amber-100",
          statusText: "SPEAKING_TRANSMISSION",
          badgeLabel: "SYS: RESPONDING",
          textColor: "text-amber-500",
          accentColor: "#F59E0B",
          desc: `${assistantName} is expressing ${pronounPossessive} witty thoughts. Shh, let a ${pronounNoun} speak.`,
        };
      case AssistantState.ERROR:
        return {
          badgeBg: "bg-red-50 text-red-600 border-red-100",
          statusText: "CRITICAL_HALT",
          badgeLabel: "SYS: FAULT",
          textColor: "text-red-500",
          accentColor: "#EF4444",
          desc: errorMessage || "An administrative block halted the core matrix session.",
        };
      case AssistantState.IDLE:
        return {
          badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
          statusText: "STANDBY_READY",
          badgeLabel: "SYS: IDLE",
          textColor: "text-emerald-500",
          accentColor: "#10B981",
          desc: "Mic loop armed. Conversation is awaiting administrative audio input.",
        };
      case AssistantState.DISCONNECTED:
      default:
        return {
          badgeBg: "bg-neutral-100 text-neutral-500 border-neutral-200",
          statusText: "POWER_SHUTDOWN",
          badgeLabel: "SYS: OFF",
          textColor: "text-neutral-500",
          accentColor: "#737373",
          desc: `${assistantName} is fast asleep. Click anywhere on this card or toggle the switch to wake me up.`,
        };
    }
  };

  const currentTheme = getSystemTheme();

  const isWaveOn = state === AssistantState.SPEAKING || state === AssistantState.LISTENING;

  const getLineColor = (defaultLineColor: string) => {
    return isWaveOn ? defaultLineColor : currentTheme.accentColor;
  };

  const activeOrbTheme = ORB_THEME_STYLES[appTheme] || ORB_THEME_STYLES.cosmic;

  // Calculate high-performance voice-responsive dynamic colors, shadows and glow borders
  const getDynamicGlowStyle = () => {
    if (!aiCardGlowEnabled || state === AssistantState.DISCONNECTED) {
      return {};
    }

    // High fidelity color palette depending on state and voice activity
    const time = Date.now() * 0.002;
    let glowColor = "rgba(168, 85, 247, "; // Violet default
    let borderRGB = "168, 85, 247";

    if (state === AssistantState.SPEAKING) {
      // Rotate seamlessly between rich orange, sweet pink, and sky blue during active speech
      const huePhase = Math.sin(time) * 0.5 + 0.5;
      if (huePhase < 0.33) {
        glowColor = "rgba(249, 115, 22, "; // Deep warm orange
        borderRGB = "249, 115, 22";
      } else if (huePhase < 0.66) {
        glowColor = "rgba(236, 72, 153, "; // Vivid fuchsia pink
        borderRGB = "236, 72, 153";
      } else {
        glowColor = "rgba(14, 165, 233, "; // Sky blue glow
        borderRGB = "14, 165, 233";
      }
    } else if (state === AssistantState.LISTENING) {
      // Pulse bright crimson/rose to mimic dynamic listening feedback
      const pulsePhase = Math.sin(time * 3.5) * 0.5 + 0.5;
      if (pulsePhase < 0.5) {
        glowColor = "rgba(244, 63, 94, "; // Rose red
        borderRGB = "244, 63, 94";
      } else {
        glowColor = "rgba(225, 29, 72, "; // Crimson red
        borderRGB = "225, 29, 72";
      }
    } else if (state === AssistantState.CONNECTING) {
      // Mystic violet breathing
      glowColor = "rgba(139, 92, 246, ";
      borderRGB = "139, 92, 246";
    } else if (state === AssistantState.IDLE) {
      // Standby ready: elegant teal/emerald breathing glow
      const breathPhase = Math.sin(time * 0.8) * 0.5 + 0.5;
      if (breathPhase < 0.5) {
        glowColor = "rgba(16, 185, 129, "; // Emerald
        borderRGB = "16, 185, 129";
      } else {
        glowColor = "rgba(20, 184, 166, "; // Teal
        borderRGB = "20, 184, 166";
      }
    } else if (state === AssistantState.ERROR) {
      // Critical Red warning glow
      glowColor = "rgba(239, 68, 68, ";
      borderRGB = "239, 68, 68";
    }

    // Scale intensity and shadow expansion dynamically with user or assistant voice volume!
    // activeVolume ranges from 0 (silence) to ~1 (peak)
    const volumeIntensity = 0.65 + (activeVolume * 0.95); // High baseline of 0.65 to 1.6 for a super visible, rich glow
    const spreadSize = 32 + (activeVolume * 68); // spreads from 32px up to 100px during peak voice levels
    const borderAlpha = 0.75 + (activeVolume * 0.25); // border gets extremely solid and bright when speaking (0.75 to 1.0)

    return {
      boxShadow: `0 16px 45px -8px ${glowColor}${volumeIntensity * 0.45}), 0 0 ${spreadSize}px 2px ${glowColor}${volumeIntensity * 1.0}), 0 0 20px 0px ${glowColor}0.3)`,
      borderWidth: "2px",
      borderColor: `rgba(${borderRGB}, ${borderAlpha})`,
      transition: "box-shadow 0.05s ease-out, border-color 0.08s ease-out"
    };
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Central Visualizer Card */}
      <div 
        onClick={onTogglePower}
        style={getDynamicGlowStyle()}
        className={`w-full ${activeOrbTheme.card} rounded-[2.5rem] px-3 py-8 backdrop-blur-2xl relative overflow-hidden flex flex-col justify-between min-h-[440px] transition-all duration-500 cursor-pointer select-none hover:scale-[1.01]`}
      >
        
        {/* Top bar indicators inside visualizer */}
        <div className="flex items-center justify-between w-full z-10 relative">
          <div className="flex items-center gap-2.5">
            <div className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                state === AssistantState.DISCONNECTED ? "bg-neutral-400" :
                state === AssistantState.CONNECTING ? "bg-purple-400" :
                state === AssistantState.LISTENING ? "bg-rose-400" :
                state === AssistantState.SPEAKING ? "bg-amber-400" :
                "bg-emerald-400"
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                state === AssistantState.DISCONNECTED ? "bg-neutral-400" :
                state === AssistantState.CONNECTING ? "bg-purple-500" :
                state === AssistantState.LISTENING ? "bg-rose-500" :
                state === AssistantState.SPEAKING ? "bg-amber-500" :
                "bg-emerald-500"
              }`} />
            </div>
            <span className={`text-[10px] font-mono tracking-widest ${activeOrbTheme.textMuted} uppercase font-bold hidden sm:inline`}>
              AI_CO_COMPANION
            </span>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${currentTheme.badgeBg}`}>
              {currentTheme.badgeLabel}
            </span>
          </div>

          {/* Original Glowing core power node (Moved from center to the right side of the card as requested) */}
          <motion.button
            id="orb-core-power-trigger"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePower();
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-xl z-20 ${
              state === AssistantState.DISCONNECTED
                ? "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-400 shadow-slate-100"
                : state === AssistantState.CONNECTING
                ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30"
                : state === AssistantState.LISTENING
                ? "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30 animate-pulse"
                : state === AssistantState.SPEAKING
                ? "bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/30"
                : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30"
            }`}
          >
            {state === AssistantState.DISCONNECTED ? (
              <Power className="w-5 h-5" />
            ) : state === AssistantState.CONNECTING ? (
              <Activity className="w-5 h-5 animate-spin" />
            ) : state === AssistantState.LISTENING ? (
              <Mic className="w-5 h-5" />
            ) : state === AssistantState.SPEAKING ? (
              <Volume2 className="w-5 h-5 animate-bounce" />
            ) : (
              <Radio className="w-5 h-5 animate-pulse" />
            )}
          </motion.button>
        </div>        {/* Waves Overlay Container (The flowing visual spectrum lines) */}
        <div className="relative w-full h-56 my-6 flex items-center justify-center">
          {/* Base SVG Wave lines that flow beautifully */}
          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 -160 400 440" preserveAspectRatio="none">
            {/* 1. CURVE STYLE */}
            {waveStyle === "curve" && (
              <>
                {/* Wave 1: Background soft wave fill gradient */}
                <path
                  d="M 0 60 C 80 20, 120 100, 200 60 C 280 20, 320 100, 400 60 L 400 280 L 0 280 Z"
                  fill={`url(#${waveConfig.bgGradientId})`}
                  opacity={state === AssistantState.DISCONNECTED ? "0.02" : "0.08"}
                  className="transition-all duration-1000"
                />

                {/* Glowing path lines */}
                <motion.path
                  d="M 0 60 Q 100 20, 200 60 T 400 60"
                  fill="none"
                  stroke={getLineColor(waveConfig.line1)}
                  strokeWidth={state === AssistantState.SPEAKING ? "4.5" : "2.5"}
                  opacity={state === AssistantState.DISCONNECTED ? "0.1" : state === AssistantState.SPEAKING ? "1.0" : "0.75"}
                  animate={{
                    d: state === AssistantState.DISCONNECTED
                      ? "M 0 60 Q 100 60, 200 60 T 400 60"
                      : [
                          `M 0 60 Q 100 ${60 - activeVolume * 150 * waveConfig.ampMultiplier - 15}, 200 ${60 + activeVolume * 150 * waveConfig.ampMultiplier + 10} T 400 60`,
                          `M 0 60 Q 100 ${60 + activeVolume * 150 * waveConfig.ampMultiplier + 20}, 200 ${60 - activeVolume * 150 * waveConfig.ampMultiplier - 15} T 400 60`,
                          `M 0 60 Q 100 ${60 - activeVolume * 150 * waveConfig.ampMultiplier - 15}, 200 ${60 + activeVolume * 150 * waveConfig.ampMultiplier + 10} T 400 60`
                        ]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: (state === AssistantState.SPEAKING ? 1.5 : 3) * waveConfig.speedMultiplier,
                    ease: "easeInOut"
                  }}
                />

                {/* Wave 2: Offset wave */}
                <motion.path
                  d="M 0 60 Q 100 100, 200 60 T 400 60"
                  fill="none"
                  stroke={getLineColor(waveConfig.line2)}
                  strokeWidth={state === AssistantState.SPEAKING ? "4.0" : "2.0"}
                  opacity={state === AssistantState.DISCONNECTED ? "0.08" : state === AssistantState.SPEAKING ? "1.0" : "0.6"}
                  animate={{
                    d: state === AssistantState.DISCONNECTED
                      ? "M 0 60 Q 100 60, 200 60 T 400 60"
                      : [
                          `M 0 60 Q 120 ${60 + activeVolume * 120 * waveConfig.ampMultiplier + 10}, 220 ${60 - activeVolume * 120 * waveConfig.ampMultiplier - 15} T 400 60`,
                          `M 0 60 Q 120 ${60 - activeVolume * 120 * waveConfig.ampMultiplier - 20}, 220 ${60 + activeVolume * 120 * waveConfig.ampMultiplier + 10} T 400 60`,
                          `M 0 60 Q 120 ${60 + activeVolume * 120 * waveConfig.ampMultiplier + 10}, 220 ${60 - activeVolume * 120 * waveConfig.ampMultiplier - 15} T 400 60`
                        ]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: (state === AssistantState.SPEAKING ? 2 : 4) * waveConfig.speedMultiplier,
                    ease: "easeInOut"
                  }}
                />

                {/* Wave 3: Offset thin energetic wave */}
                <motion.path
                  d="M 0 60 Q 80 40, 180 65 T 400 60"
                  fill="none"
                  stroke={getLineColor(waveConfig.line3)}
                  strokeWidth={state === AssistantState.SPEAKING ? "3.5" : "1.5"}
                  opacity={state === AssistantState.DISCONNECTED ? "0.05" : state === AssistantState.SPEAKING ? "1.0" : "0.5"}
                  animate={{
                    d: state === AssistantState.DISCONNECTED
                      ? "M 0 60 Q 100 60, 200 60 T 400 60"
                      : [
                          `M 0 60 Q 90 ${60 - activeVolume * 180 * waveConfig.ampMultiplier - 25}, 190 ${60 + activeVolume * 180 * waveConfig.ampMultiplier + 20} T 400 60`,
                          `M 0 60 Q 90 ${60 + activeVolume * 180 * waveConfig.ampMultiplier + 15}, 190 ${60 - activeVolume * 180 * waveConfig.ampMultiplier - 10} T 400 60`,
                          `M 0 60 Q 90 ${60 - activeVolume * 180 * waveConfig.ampMultiplier - 25}, 190 ${60 + activeVolume * 180 * waveConfig.ampMultiplier + 20} T 400 60`
                        ]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: (state === AssistantState.SPEAKING ? 1.2 : 2.5) * waveConfig.speedMultiplier,
                    ease: "easeInOut"
                  }}
                />

                {/* Wave 4: Warm auxiliary wave */}
                <motion.path
                  d="M 0 60 Q 110 50, 210 55 T 400 60"
                  fill="none"
                  stroke={getLineColor(waveConfig.line4)}
                  strokeWidth={state === AssistantState.SPEAKING ? "3.0" : "1.2"}
                  opacity={state === AssistantState.DISCONNECTED ? "0.04" : state === AssistantState.SPEAKING ? "1.0" : "0.45"}
                  animate={{
                    d: state === AssistantState.DISCONNECTED
                      ? "M 0 60 Q 100 60, 200 60 T 400 60"
                      : [
                          `M 0 60 Q 110 ${60 + activeVolume * 140 * waveConfig.ampMultiplier + 15}, 210 ${60 - activeVolume * 140 * waveConfig.ampMultiplier - 20} T 400 60`,
                          `M 0 60 Q 110 ${60 - activeVolume * 140 * waveConfig.ampMultiplier - 15}, 210 ${60 + activeVolume * 140 * waveConfig.ampMultiplier + 20} T 400 60`,
                          `M 0 60 Q 110 ${60 + activeVolume * 140 * waveConfig.ampMultiplier + 15}, 210 ${60 - activeVolume * 140 * waveConfig.ampMultiplier - 20} T 400 60`
                        ]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: (state === AssistantState.SPEAKING ? 1.8 : 3.5) * waveConfig.speedMultiplier,
                    ease: "easeInOut"
                  }}
                />

                {/* Wave 5: Subtle organic rhythm */}
                <motion.path
                  d="M 0 60 Q 70 70, 170 50 T 400 60"
                  fill="none"
                  stroke={getLineColor(waveConfig.line5)}
                  strokeWidth={state === AssistantState.SPEAKING ? "2.5" : "1.0"}
                  opacity={state === AssistantState.DISCONNECTED ? "0.03" : state === AssistantState.SPEAKING ? "1.0" : "0.35"}
                  animate={{
                    d: state === AssistantState.DISCONNECTED
                      ? "M 0 60 Q 100 60, 200 60 T 400 60"
                      : [
                          `M 0 60 Q 70 ${60 - activeVolume * 160 * waveConfig.ampMultiplier - 10}, 170 ${60 + activeVolume * 160 * waveConfig.ampMultiplier + 15} T 400 60`,
                          `M 0 60 Q 70 ${60 + activeVolume * 160 * waveConfig.ampMultiplier + 10}, 170 ${60 - activeVolume * 160 * waveConfig.ampMultiplier - 15} T 400 60`,
                          `M 0 60 Q 70 ${60 - activeVolume * 160 * waveConfig.ampMultiplier - 10}, 170 ${60 + activeVolume * 160 * waveConfig.ampMultiplier + 15} T 400 60`
                        ]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: (state === AssistantState.SPEAKING ? 2.2 : 4.5) * waveConfig.speedMultiplier,
                    ease: "easeInOut"
                  }}
                />

                {/* Wave 6: Undercurrent frequency */}
                <motion.path
                  d="M 0 60 Q 130 30, 230 75 T 400 60"
                  fill="none"
                  stroke={getLineColor(waveConfig.line6)}
                  strokeWidth={state === AssistantState.SPEAKING ? "3.5" : "1.5"}
                  opacity={state === AssistantState.DISCONNECTED ? "0.05" : state === AssistantState.SPEAKING ? "1.0" : "0.4"}
                  animate={{
                    d: state === AssistantState.DISCONNECTED
                      ? "M 0 60 Q 100 60, 200 60 T 400 60"
                      : [
                          `M 0 60 Q 130 ${60 + activeVolume * 110 * waveConfig.ampMultiplier + 25}, 230 ${60 - activeVolume * 110 * waveConfig.ampMultiplier - 15} T 400 60`,
                          `M 0 60 Q 130 ${60 - activeVolume * 110 * waveConfig.ampMultiplier - 25}, 230 ${60 + activeVolume * 110 * waveConfig.ampMultiplier + 15} T 400 60`,
                          `M 0 60 Q 130 ${60 + activeVolume * 110 * waveConfig.ampMultiplier + 25}, 230 ${60 - activeVolume * 110 * waveConfig.ampMultiplier - 15} T 400 60`
                        ]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: (state === AssistantState.SPEAKING ? 2.5 : 5) * waveConfig.speedMultiplier,
                    ease: "easeInOut"
                  }}
                />

                {/* Wave 7: Center line */}
                <motion.path
                  d="M 0 60 Q 150 60, 250 60 T 400 60"
                  fill="none"
                  stroke={getLineColor(waveConfig.line7)}
                  strokeWidth={state === AssistantState.SPEAKING ? "3.0" : "1.0"}
                  opacity={state === AssistantState.DISCONNECTED ? "0.06" : state === AssistantState.SPEAKING ? "1.0" : "0.55"}
                  className="drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                  animate={{
                    d: state === AssistantState.DISCONNECTED
                      ? "M 0 60 Q 100 60, 200 60 T 400 60"
                      : [
                          `M 0 60 Q 150 ${60 - activeVolume * 130 * waveConfig.ampMultiplier - 5}, 250 ${60 + activeVolume * 130 * waveConfig.ampMultiplier + 5} T 400 60`,
                          `M 0 60 Q 150 ${60 + activeVolume * 130 * waveConfig.ampMultiplier + 5}, 250 ${60 - activeVolume * 130 * waveConfig.ampMultiplier - 5} T 400 60`,
                          `M 0 60 Q 150 ${60 - activeVolume * 130 * waveConfig.ampMultiplier - 5}, 250 ${60 + activeVolume * 130 * waveConfig.ampMultiplier + 5} T 400 60`
                        ]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: (state === AssistantState.SPEAKING ? 1.0 : 2.0) * waveConfig.speedMultiplier,
                    ease: "easeInOut"
                  }}
                />
              </>
            )}

            {/* 2. CIRCULAR PORTAL STYLE */}
            {waveStyle === "circular" && (
              <>
                <defs>
                  <radialGradient id="portal-gradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={getLineColor(waveConfig.line1)} stopOpacity="0.25" />
                    <stop offset="65%" stopColor={getLineColor(waveConfig.line2)} stopOpacity="0.08" />
                    <stop offset="100%" stopColor={getLineColor(waveConfig.line3)} stopOpacity="0" />
                  </radialGradient>
                </defs>
 
                {/* Deep background organic portal visual */}
                <circle
                  cx="200"
                  cy="60"
                  r={75 + activeVolume * 115}
                  fill="url(#portal-gradient)"
                  className="transition-all duration-300"
                />
 
                {/* Inner glowing pulse circle */}
                <motion.circle
                  cx="200"
                  cy="60"
                  r={44 + activeVolume * 88}
                  stroke={getLineColor(waveConfig.line1)}
                  strokeWidth="4.0"
                  fill="none"
                  opacity={state === AssistantState.DISCONNECTED ? 0.2 : 0.95}
                  className="drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                />
 
                {/* Rotating dashed ring */}
                <motion.circle
                  cx="200"
                  cy="60"
                  r={80 + activeVolume * 125}
                  stroke={getLineColor(waveConfig.line2)}
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  fill="none"
                  opacity={state === AssistantState.DISCONNECTED ? 0.12 : 0.8}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
                />
 
                {/* Soft breathing ring */}
                <motion.circle
                  cx="200"
                  cy="60"
                  r={112 + activeVolume * 160}
                  stroke={getLineColor(waveConfig.line3)}
                  strokeWidth="1.0"
                  fill="none"
                  opacity={state === AssistantState.DISCONNECTED ? 0.08 : 0.65}
                  animate={{ scale: [1, 1.02, 0.97, 1] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                />
 
                {/* Multi-segmented cyber-radar outer ring */}
                <motion.circle
                  cx="200"
                  cy="60"
                  r={150 + activeVolume * 195}
                  stroke={getLineColor(waveConfig.line4)}
                  strokeWidth="1.0"
                  strokeDasharray="30 15 5 15"
                  fill="none"
                  opacity={state === AssistantState.DISCONNECTED ? 0.04 : 0.45}
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
                />
 
                {/* Central organic morphing audio liquid blob */}
                <path
                  d={(() => {
                    const points = [];
                    const numPoints = 12;
                    const center = { x: 200, y: 60 };
                    const baseRadius = 32 + activeVolume * 65;
                    
                    for (let i = 0; i < numPoints; i++) {
                      const angle = (i / numPoints) * Math.PI * 2;
                      const offsetSeed = i * 1.4 + time * 3.2;
                      const r = baseRadius + (Math.sin(offsetSeed) * 9 + Math.cos(offsetSeed * 1.5) * 4) * (activeVolume + 0.1);
                      const px = center.x + Math.cos(angle) * r;
                      const py = center.y + Math.sin(angle) * r;
                      points.push(`${i === 0 ? 'M' : 'L'} ${px} ${py}`);
                    }
                    return points.join(" ") + " Z";
                  })()}
                  fill="none"
                  stroke={getLineColor(waveConfig.line5)}
                  strokeWidth="2.5"
                  opacity={state === AssistantState.DISCONNECTED ? 0.15 : 0.85}
                />
              </>
            )}

            {/* 3. ELECTRIC PLASMA STYLE */}
            {waveStyle === "electric" && (
              <>
                {/* Crackling Line 1 - Cyber Cyan */}
                <path
                  d={(() => {
                    const points = [];
                    const count = 38;
                    const width = 400;
                    const midY = 60;
                    for (let i = 0; i <= count; i++) {
                      const x = (i / count) * width;
                      const envelope = Math.sin((i / count) * Math.PI);
                      const baseNoise = Math.sin(i * 1.1 + time * 2.8) * 11;
                      const crackle = (Math.sin(i * 4.5 - time * 5.5) * 0.65 + (Math.random() - 0.5) * 1.6) * (12 + activeVolume * 165);
                      const y = midY + (baseNoise + crackle) * envelope;
                      points.push(`${x},${y}`);
                    }
                    return `M ${points.join(" L ")}`;
                  })()}
                  fill="none"
                  stroke={getLineColor(waveConfig.line1)}
                  strokeWidth="2.5"
                  opacity={state === AssistantState.DISCONNECTED ? 0.15 : 0.95}
                  className="drop-shadow-[0_0_8px_rgba(6,182,212,0.65)]"
                />

                {/* Crackling Line 2 - Vivid Pink/Fuchsia */}
                <path
                  d={(() => {
                    const points = [];
                    const count = 32;
                    const width = 400;
                    const midY = 60;
                    for (let i = 0; i <= count; i++) {
                      const x = (i / count) * width;
                      const envelope = Math.sin((i / count) * Math.PI);
                      const baseNoise = Math.cos(i * 1.6 - time * 1.9) * 9;
                      const crackle = (Math.sin(i * 5.8 + time * 4.5) * 0.6 + (Math.random() - 0.5) * 1.8) * (9 + activeVolume * 145);
                      const y = midY + (baseNoise + crackle) * envelope;
                      points.push(`${x},${y}`);
                    }
                    return `M ${points.join(" L ")}`;
                  })()}
                  fill="none"
                  stroke={getLineColor(waveConfig.line3)}
                  strokeWidth="1.8"
                  opacity={state === AssistantState.DISCONNECTED ? 0.1 : 0.85}
                  className="drop-shadow-[0_0_6px_rgba(236,72,153,0.55)]"
                />

                {/* Crackling Line 3 - White Core Plasma */}
                <path
                  d={(() => {
                    const points = [];
                    const count = 26;
                    const width = 400;
                    const midY = 60;
                    for (let i = 0; i <= count; i++) {
                      const x = (i / count) * width;
                      const envelope = Math.sin((i / count) * Math.PI);
                      const baseNoise = Math.sin(i * 0.9 + time * 3.3) * 6;
                      const crackle = (Math.cos(i * 3.5 - time * 6.5) * 0.75 + (Math.random() - 0.5) * 2.1) * (6 + activeVolume * 125);
                      const y = midY + (baseNoise + crackle) * envelope;
                      points.push(`${x},${y}`);
                    }
                    return `M ${points.join(" L ")}`;
                  })()}
                  fill="none"
                  stroke={getLineColor(waveConfig.line7)}
                  strokeWidth="1.2"
                  opacity={state === AssistantState.DISCONNECTED ? 0.08 : 0.75}
                  className="drop-shadow-[0_0_4px_rgba(255,255,255,0.9)]"
                />
              </>
            )}

            {/* 4. RADIO TRANSCEIVER STYLE */}
            {waveStyle === "radio" && (
              <>
                {/* Core emitting transmitter bead */}
                <circle
                  cx="200"
                  cy="60"
                  r="5.5"
                  fill={getLineColor(waveConfig.line1)}
                  opacity={state === AssistantState.DISCONNECTED ? 0.35 : 1.0}
                  className="drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]"
                />

                {/* Wireless Radio Ripples emitting from center (200, 60) */}
                {(() => {
                  const ripples = [];
                  const pulseTime = (Date.now() / 1600) % 1.0;
                  
                  for (let j = 0; j < 3; j++) {
                    const offset = j / 3;
                    const fraction = (pulseTime + offset) % 1.0;
                    const radius = 12 + fraction * 240;
                    const opacity = (1.0 - fraction) * (state === AssistantState.DISCONNECTED ? 0.1 : 0.7) * (1.0 + activeVolume * 0.6);
                    
                    ripples.push(
                      <circle
                        key={j}
                        cx="200"
                        cy="60"
                        r={radius}
                        stroke={j === 0 ? getLineColor(waveConfig.line1) : j === 1 ? getLineColor(waveConfig.line2) : getLineColor(waveConfig.line3)}
                        strokeWidth="1.5"
                        strokeDasharray="4 6"
                        fill="none"
                        opacity={opacity}
                      />
                    );
                  }
                  return ripples;
                })()}

                {/* RF carrier modulated waves */}
                <path
                  d={(() => {
                    const points = [];
                    const count = 120;
                    const width = 400;
                    const midY = 60;
                    for (let i = 0; i <= count; i++) {
                      const x = (i / count) * width;
                      const envelope = Math.sin((i / count) * Math.PI);
                      const carrier = Math.sin(i * 0.85 - time * 4.2);
                      const modulation = (3.5 + activeVolume * 155);
                      const y = midY + carrier * modulation * envelope;
                      points.push(`${x},${y}`);
                    }
                    return `M ${points.join(" L ")}`;
                  })()}
                  fill="none"
                  stroke={getLineColor(waveConfig.line1)}
                  strokeWidth="2.2"
                  opacity={state === AssistantState.DISCONNECTED ? 0.16 : 0.9}
                  className="drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                />

                {/* Secondary RF carrier phase shifted */}
                <path
                  d={(() => {
                    const points = [];
                    const count = 95;
                    const width = 400;
                    const midY = 60;
                    for (let i = 0; i <= count; i++) {
                      const x = (i / count) * width;
                      const envelope = Math.sin((i / count) * Math.PI);
                      const carrier = Math.cos(i * 0.98 + time * 3.0);
                      const modulation = (2.0 + activeVolume * 120);
                      const y = midY + carrier * modulation * envelope;
                      points.push(`${x},${y}`);
                    }
                    return `M ${points.join(" L ")}`;
                  })()}
                  fill="none"
                  stroke={getLineColor(waveConfig.line4)}
                  strokeWidth="1.2"
                  opacity={state === AssistantState.DISCONNECTED ? 0.08 : 0.65}
                />
              </>
            )}

            {/* 5. VOICE SPECTROGRAM STYLE */}
            {waveStyle === "voice" && (
              <>
                <line
                  x1="0"
                  y1="60"
                  x2="400"
                  y2="60"
                  stroke={getLineColor(waveConfig.line7)}
                  strokeWidth="1.0"
                  strokeDasharray="5 5"
                  opacity="0.25"
                />

                {/* 40 thick vertical audio spectrogram columns */}
                {(() => {
                  const bars = [];
                  const count = 42;
                  const width = 360;
                  
                  for (let i = 0; i < count; i++) {
                    const x = 20 + (i / (count - 1)) * width;
                    const envelope = Math.sin((i / (count - 1)) * Math.PI);
                    
                    const seed = i * 0.45 + time * 1.6;
                    const noise = Math.sin(seed) * 8.5 + Math.cos(seed * 2.4) * 4;
                    const amplitudeMultiplier = state === AssistantState.DISCONNECTED ? 2.5 : 6.0 + activeVolume * 220;
                    const barHeight = Math.max(2.5, (noise + amplitudeMultiplier) * envelope);
                    
                    let barColor = waveConfig.line1;
                    if (i % 5 === 1) barColor = waveConfig.line2;
                    else if (i % 5 === 2) barColor = waveConfig.line3;
                    else if (i % 5 === 3) barColor = waveConfig.line4;
                    else if (i % 5 === 4) barColor = waveConfig.line5;

                    bars.push(
                      <g key={i}>
                        {/* Upper spectrum bar */}
                        <motion.line
                          x1={x}
                          y1={60}
                          x2={x}
                          y2={60 - barHeight}
                          stroke={getLineColor(barColor)}
                          strokeWidth="5"
                          strokeLinecap="round"
                          opacity={state === AssistantState.DISCONNECTED ? 0.2 : 0.88}
                          className="drop-shadow-[0_0_4px_rgba(255,255,255,0.25)]"
                        />
                        {/* Lower symmetrical spectrum bar */}
                        <motion.line
                          x1={x}
                          y1={60}
                          x2={x}
                          y2={60 + barHeight}
                          stroke={getLineColor(barColor)}
                          strokeWidth="5"
                          strokeLinecap="round"
                          opacity={state === AssistantState.DISCONNECTED ? 0.2 : 0.88}
                          className="drop-shadow-[0_0_4px_rgba(255,255,255,0.25)]"
                        />
                      </g>
                    );
                  }
                  return bars;
                })()}
              </>
            )}

            {/* SVG Definitions for backgrounds */}
            <defs>
              <linearGradient id="wave-gradient-cyan" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="1" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="wave-gradient-green" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="1" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="wave-gradient-red" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="1" />
                <stop offset="100%" stopColor="#C2410C" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="wave-gradient-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
                <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="wave-gradient-pink" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EC4899" stopOpacity="1" />
                <stop offset="100%" stopColor="#9D174D" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>


        </div>

        {/* Mid-bottom Equalizer bar visualizer */}
        <div className="flex items-end justify-center gap-[4px] h-12 w-full mt-4">
          {barHeights.map((height, i) => (
            <motion.div
              key={i}
              className="w-[5px] rounded-full transition-all duration-75"
              style={{
                height: `${height}px`,
                backgroundColor:
                  state === AssistantState.DISCONNECTED
                    ? "#E2E8F0"
                    : state === AssistantState.CONNECTING
                    ? "#C084FC"
                    : state === AssistantState.LISTENING
                    ? "#F43F5E"
                    : state === AssistantState.SPEAKING
                    ? "#F59E0B"
                    : "#10B981",
              }}
            />
          ))}
        </div>

        {/* Modern Spacious Typography Block */}
        <div className="text-center mt-6 z-10">
          <motion.h3
            key={currentTheme.statusText}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xl font-bold tracking-widest font-mono uppercase ${currentTheme.textColor}`}
          >
            {currentTheme.statusText}
          </motion.h3>
          <motion.p
            key={currentTheme.desc}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-xs ${activeOrbTheme.textMuted} max-w-full px-2 mt-2 leading-relaxed font-sans font-medium transition-colors duration-500`}
          >
            {currentTheme.desc}
          </motion.p>
        </div>

      </div>
    </div>
  );
}
