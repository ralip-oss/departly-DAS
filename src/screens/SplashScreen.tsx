import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { DepartlyBrand } from '../components/DepartlyBrand';
import { ChronoPulse } from '../components/ChronoPulse';
import { ArrowRight, ShieldCheck, Compass, Sparkles } from 'lucide-react';
import { Button } from '../components/UIComponents';

interface SplashScreenProps {
  onComplete: () => void;
  onSkipToDashboard: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  onSkipToDashboard,
}) => {
  const [calibrationProgress, setCalibrationProgress] = useState(24);

  useEffect(() => {
    const timer = setInterval(() => {
      setCalibrationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 19;
      });
    }, 280);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#F5F7FB] dark:bg-[#070D18] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-between p-6 sm:p-10 overflow-hidden select-none">
      {/* Background Radiance Auras */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#29B6F6]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -right-24 w-80 h-80 bg-sky-300/10 dark:bg-sky-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Telemetry Header */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#29B6F6] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#29B6F6]" />
          </span>
          <span className="font-mono-telemetry text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            CALIBRANDO DISPATCH // V2.4
          </span>
        </div>

        <div className="font-mono-telemetry text-xs font-semibold text-[#0284C7] dark:text-[#38BDF8] bg-[#E1F5FE] dark:bg-[#003852] px-3 py-1 rounded-full border border-[#B3E5FC] dark:border-sky-800">
          {calibrationProgress}% PRONTO
        </div>
      </div>

      {/* Center Hero: Brand & Signature ChronoPulse Device */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-8">
        {/* Animated Brand with Logo 'D' */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="mb-8"
        >
          <DepartlyBrand size="xl" />
          <p className="mt-3 text-sm sm:text-base font-body text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Assistente de trânsito inteligente com bloqueio de calendário e avisos de atraso por voz autónomos.
          </p>
        </motion.div>

        {/* Central Reactive ChronoPulse Device */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 22, stiffness: 180 }}
          className="my-4"
        >
          <ChronoPulse
            state={calibrationProgress < 100 ? 'scanning' : 'calm'}
            size="hero"
            countdownMinutes={calibrationProgress < 100 ? undefined : 14}
            label={calibrationProgress < 100 ? 'Sincronizando radares GPS...' : 'Corredores de Partida Prontos'}
            sublabel="Lisboa · Eixo Norte-Sul · A1 · CRIL"
          />
        </motion.div>

        {/* Three core pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl w-full mt-6">
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-left">
            <span className="font-mono-telemetry text-[10px] uppercase text-[#0284C7] dark:text-[#38BDF8] font-bold block">
              01. MAPAS DINÂMICOS
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
              Alerta 15m antes da partida real com base no trânsito ao vivo.
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-left">
            <span className="font-mono-telemetry text-[10px] uppercase text-[#0284C7] dark:text-[#38BDF8] font-bold block">
              02. BLOQUEIO DE AGENDA
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
              Protege o tempo de condução contra reuniões sobrepostas.
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-left">
            <span className="font-mono-telemetry text-[10px] uppercase text-[#FF6B57] font-bold block">
              03. VOICEBOT IA
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
              Avisa clientes hands-free ao volante quando há imprevistos.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Row */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col sm:flex-row items-center gap-3 pt-4">
        <Button
          variant="primary"
          size="lg"
          className="w-full shadow-lg shadow-[#29B6F6]/30"
          icon={<ArrowRight size={18} />}
          iconPosition="right"
          onClick={onComplete}
        >
          Iniciar Configuração Inteligente
        </Button>
        <button
          onClick={onSkipToDashboard}
          className="text-xs font-headline font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-2 transition-colors"
        >
          Aceder diretamente ao Painel
        </button>
      </div>
    </div>
  );
};
