import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChronoState } from '../types';
import { Compass, AlertTriangle, Check, RefreshCw, Clock } from 'lucide-react';

interface ChronoPulseProps {
  state?: ChronoState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  countdownMinutes?: number;
  label?: string;
  sublabel?: string;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ChronoPulse: React.FC<ChronoPulseProps> = ({
  state = 'calm',
  size = 'md',
  countdownMinutes,
  label,
  sublabel,
  interactive = false,
  onClick,
  className = '',
}) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Dimension presets
  const sizeMap = {
    sm: {
      dim: 'w-14 h-14',
      svgSize: 56,
      strokeWidth: 2,
      glowSize: 'inset-0 blur-sm',
      textSize: 'text-xs',
      subtextSize: 'text-[9px]',
      iconSize: 16,
    },
    md: {
      dim: 'w-24 h-24',
      svgSize: 96,
      strokeWidth: 2.5,
      glowSize: 'inset-1 blur-md',
      textSize: 'text-lg',
      subtextSize: 'text-[11px]',
      iconSize: 22,
    },
    lg: {
      dim: 'w-40 h-40',
      svgSize: 160,
      strokeWidth: 3,
      glowSize: 'inset-2 blur-xl',
      textSize: 'text-2xl',
      subtextSize: 'text-xs',
      iconSize: 32,
    },
    hero: {
      dim: 'w-56 h-56 sm:w-64 sm:h-64',
      svgSize: 240,
      strokeWidth: 3.5,
      glowSize: 'inset-4 blur-2xl',
      textSize: 'text-3xl sm:text-4xl',
      subtextSize: 'text-xs sm:text-sm',
      iconSize: 42,
    },
  };

  const config = sizeMap[size];

  // Palette based on state
  const colors = {
    calm: {
      primary: '#29B6F6',
      secondary: '#0284C7',
      glow: 'rgba(41, 182, 246, 0.25)',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/60',
      badgeBorder: 'border-sky-200 dark:border-sky-800',
      badgeText: 'text-sky-700 dark:text-sky-300',
    },
    warning: {
      primary: '#FF6B57',
      secondary: '#E11D48',
      glow: 'rgba(255, 107, 87, 0.35)',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
      badgeBorder: 'border-rose-200 dark:border-rose-800',
      badgeText: 'text-rose-700 dark:text-rose-300',
    },
    scanning: {
      primary: '#38BDF8',
      secondary: '#0284C7',
      glow: 'rgba(56, 189, 248, 0.3)',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
      badgeBorder: 'border-blue-200 dark:border-blue-800',
      badgeText: 'text-blue-700 dark:text-blue-300',
    },
    empty: {
      primary: '#94A3B8',
      secondary: '#64748B',
      glow: 'rgba(148, 163, 184, 0.15)',
      badgeBg: 'bg-slate-100 dark:bg-slate-800/60',
      badgeBorder: 'border-slate-200 dark:border-slate-700',
      badgeText: 'text-slate-600 dark:text-slate-400',
    },
    success: {
      primary: '#10B981',
      secondary: '#059669',
      glow: 'rgba(16, 185, 129, 0.3)',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      badgeBorder: 'border-emerald-200 dark:border-emerald-800',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
    },
  }[state];

  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={`relative inline-flex flex-col items-center justify-center select-none ${
        interactive ? 'cursor-pointer group active:scale-95 transition-transform' : ''
      } ${className}`}
    >
      {/* Visual Orb Container */}
      <div className={`relative ${config.dim} flex items-center justify-center`}>
        {/* Soft Ambient Radiance Aura */}
        <div
          className={`absolute ${config.glowSize} rounded-full transition-colors duration-500`}
          style={{ backgroundColor: colors.glow }}
        />

        {/* Concentric SVG Reactive Device */}
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full relative z-10 overflow-visible"
        >
          {/* Static Outer Dotted Radar Perimeter */}
          <circle
            cx="120"
            cy="120"
            r="108"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="4 6"
            className="text-slate-300 dark:text-slate-700 opacity-60"
          />

          {/* Dynamic Telemetry Ring 1 */}
          <circle
            cx="120"
            cy="120"
            r="94"
            fill="none"
            stroke={colors.primary}
            strokeWidth={state === 'warning' ? 3.5 : 2.5}
            strokeDasharray={
              state === 'scanning'
                ? '30 20 60 20'
                : state === 'empty'
                ? '6 12'
                : state === 'warning'
                ? '80 30 50 30'
                : '120 40 30 40'
            }
            strokeLinecap="round"
            style={{
              transformOrigin: 'center',
              transform: `rotate(${state === 'scanning' ? rotation * 3 : rotation * 0.8}deg)`,
              transition: 'stroke 0.4s ease',
            }}
          />

          {/* Dynamic Counter-Rotating Ring 2 */}
          <circle
            cx="120"
            cy="120"
            r="76"
            fill="none"
            stroke={colors.secondary}
            strokeWidth="1.8"
            strokeDasharray={
              state === 'scanning' ? '40 30 20 30' : '50 50 20 60'
            }
            strokeLinecap="round"
            opacity="0.8"
            style={{
              transformOrigin: 'center',
              transform: `rotate(${-rotation * 1.2}deg)`,
              transition: 'stroke 0.4s ease',
            }}
          />

          {/* Inner Solid Anchor Arch */}
          <circle
            cx="120"
            cy="120"
            r="56"
            fill="none"
            stroke={colors.primary}
            strokeWidth="2.5"
            strokeDasharray={state === 'success' ? '300 0' : '90 40'}
            strokeLinecap="round"
            opacity="0.9"
            style={{
              transformOrigin: 'center',
              transform: `rotate(${rotation * 0.5}deg)`,
            }}
          />

          {/* Orbiting Telemetry Particle Bead */}
          <circle
            cx="120"
            cy="26"
            r={state === 'warning' ? 5 : 4}
            fill={colors.primary}
            style={{
              transformOrigin: 'center',
              transform: `rotate(${rotation * 1.5}deg)`,
            }}
          />

          {/* Secondary Orbiting Satellite Bead */}
          <circle
            cx="120"
            cy="44"
            r="3"
            fill={colors.secondary}
            style={{
              transformOrigin: 'center',
              transform: `rotate(${-rotation * 2}deg)`,
            }}
          />
        </svg>

        {/* Central Core Element */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center pointer-events-none">
          <AnimatePresence mode="wait">
            {state === 'success' ? (
              <motion.div
                key="success"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                className="flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400"
              >
                <Check className="stroke-[3]" size={config.iconSize} />
              </motion.div>
            ) : state === 'scanning' ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-sky-500 animate-spin"
                style={{ animationDuration: '3s' }}
              >
                <RefreshCw size={config.iconSize} />
              </motion.div>
            ) : state === 'warning' ? (
              <motion.div
                key="warning"
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.95, 1.05, 0.95] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex flex-col items-center justify-center text-rose-500"
              >
                <AlertTriangle size={config.iconSize} />
                {countdownMinutes !== undefined && (
                  <span className={`font-mono-telemetry font-bold ${config.textSize} text-rose-600 dark:text-rose-400 leading-tight mt-0.5`}>
                    +{countdownMinutes}m
                  </span>
                )}
              </motion.div>
            ) : state === 'empty' ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500"
              >
                <Compass size={config.iconSize} />
              </motion.div>
            ) : (
              /* Calm / Default Mode */
              <motion.div
                key="calm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center"
              >
                {countdownMinutes !== undefined ? (
                  <>
                    <span className="font-mono-telemetry text-[10px] tracking-wider uppercase text-slate-400 font-medium">
                      SAÍDA EM
                    </span>
                    <span className={`font-mono-telemetry font-bold ${config.textSize} text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-none`}>
                      {countdownMinutes}
                      <span className="text-xs font-normal text-[#29B6F6] ml-0.5">min</span>
                    </span>
                  </>
                ) : (
                  <Clock size={config.iconSize} className="text-[#29B6F6]" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Optional Metadata Labels below */}
      {(label || sublabel) && (
        <div className="mt-2.5 text-center flex flex-col items-center">
          {label && (
            <span className="font-headline font-semibold text-sm text-[#0F172A] dark:text-[#F1F5F9]">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="font-mono-telemetry text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
