import React from 'react';
import { motion } from 'motion/react';
import { DepartlyBrand } from '../components/DepartlyBrand';
import { ChronoPulse } from '../components/ChronoPulse';
import { ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { Button } from '../components/UIComponents';
import { AppLanguage } from '../types';

interface SplashScreenProps {
  language?: AppLanguage;
  onCreateAccount: () => void;
  onLogin: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  language = 'pt',
  onCreateAccount,
  onLogin,
}) => {
  const isEn = language === 'en';

  return (
    <div className="relative min-h-screen w-full bg-[#F5F7FB] dark:bg-[#070D18] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-between p-4 sm:p-10 overflow-hidden select-none">
      {/* Background Radiance Auras */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#29B6F6]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -right-24 w-80 h-80 bg-sky-300/10 dark:bg-sky-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Centered Top Telemetry Pill (No 100% Pronto badge) */}
      <div className="relative z-10 flex items-center justify-center w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-2 max-w-full px-3.5 sm:px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#29B6F6] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#29B6F6]" />
          </span>
          <span className="font-mono-telemetry text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
            CALIBRANDO DISPATCH // V2.4
          </span>
        </div>
      </div>

      {/* Center Hero: Brand & Signature ChronoPulse Device with Cycling Map Icons */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-8">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="mb-8"
        >
          <DepartlyBrand size="xl" />
          <p className="mt-3 text-sm sm:text-base font-body text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {isEn
              ? 'Intelligent transit assistant with calendar blocking and autonomous voice delay alerts.'
              : 'Assistente de trânsito inteligente com bloqueio de calendário e avisos de atraso por voz autónomos.'}
          </p>
        </motion.div>

        {/* Central Reactive ChronoPulse Device cycling map/transit icons */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 22, stiffness: 180 }}
          className="my-4"
        >
          <ChronoPulse
            state="calm"
            size="hero"
            cycleMapIcons
            label={isEn ? 'Intelligent Route Radar Active' : 'Radar Inteligente de Rotas Ativo'}
            sublabel={isEn ? 'Google Maps · Smart Buffer · Live Traffic' : 'Google Maps · Margem Dinâmica · Trânsito ao Vivo'}
          />
        </motion.div>

        {/* Three core pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl w-full mt-6">
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-left">
            <span className="font-mono-telemetry text-[10px] uppercase text-[#0284C7] dark:text-[#38BDF8] font-bold block">
              {isEn ? '01. DYNAMIC MAPS' : '01. MAPAS DINÂMICOS'}
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
              {isEn
                ? 'Alerts 15m before real departure based on live road traffic.'
                : 'Alerta 15m antes da partida real com base no trânsito ao vivo.'}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-left">
            <span className="font-mono-telemetry text-[10px] uppercase text-[#0284C7] dark:text-[#38BDF8] font-bold block">
              {isEn ? '02. CALENDAR BLOCK' : '02. BLOQUEIO DE AGENDA'}
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
              {isEn
                ? 'Protects driving windows against overlapping meetings.'
                : 'Protege o tempo de condução contra reuniões sobrepostas.'}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-left">
            <span className="font-mono-telemetry text-[10px] uppercase text-[#FF6B57] font-bold block">
              03. VOICEBOT IA
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
              {isEn
                ? 'Notifies clients hands-free behind the wheel during delays.'
                : 'Avisa clientes hands-free ao volante quando há imprevistos.'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Row */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col sm:flex-row items-center gap-3 pt-4">
        <Button
          variant="primary"
          size="lg"
          className="w-full sm:flex-1 shadow-lg shadow-[#29B6F6]/30"
          icon={<UserPlus size={18} />}
          iconPosition="left"
          onClick={onCreateAccount}
        >
          {isEn ? 'Create an Account' : 'Criar uma Conta'}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto"
          icon={<LogIn size={16} />}
          iconPosition="left"
          onClick={onLogin}
        >
          {isEn ? 'I already have an account' : 'Já tenho conta'}
        </Button>
      </div>
    </div>
  );
};
