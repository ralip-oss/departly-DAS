import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DepartlyBrand } from '../components/DepartlyBrand';
import {
  Car,
  Train,
  Bike,
  ShieldCheck,
  Calendar,
  Mic,
  Clock,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
} from 'lucide-react';
import { Button, BufferSlider } from '../components/UIComponents';
import { UserProfile } from '../types';

interface OnboardingScreenProps {
  initialProfile: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
  onSkip: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  initialProfile,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bufferMin, setBufferMin] = useState(initialProfile.defaultBufferMin);
  const [transitMode, setTransitMode] = useState(initialProfile.primaryTransitMode);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(true);

  // SVG paths for the morphing progress indicator
  // Step 1: Aerodynamic Delta Arrow / Triangle
  // Step 2: Rhombus / Diamond Precision Polygon
  // Step 3: Complete Chrono-Ring Circle with Wing Notch
  const morphPaths = {
    1: 'M 50 15 L 85 80 L 15 80 Z',
    2: 'M 50 12 L 88 50 L 50 88 L 12 50 Z',
    3: 'M 50 10 A 40 40 0 1 1 49.9 10 Z',
  };

  const handleFinish = () => {
    onComplete({
      ...initialProfile,
      defaultBufferMin: bufferMin,
      primaryTransitMode: transitMode,
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F5F7FB] dark:bg-[#070D18] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#29B6F6]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-2xl mx-auto">
        <DepartlyBrand size="sm" />
        <button
          onClick={onSkip}
          className="text-xs font-headline font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          Saltar introdução
        </button>
      </div>

      {/* Main Step Questionnaire */}
      <div className="relative z-10 w-full max-w-lg mx-auto my-auto py-6">
        {/* Morphing Shape Progress Indicator */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Ambient glow behind shape */}
            <div className="absolute inset-2 bg-[#29B6F6]/20 rounded-full blur-md" />

            <svg
              viewBox="0 0 100 100"
              className="w-20 h-20 overflow-visible text-[#29B6F6]"
            >
              <defs>
                <linearGradient id="morphGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#29B6F6" />
                  <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
              </defs>
              <motion.path
                d={morphPaths[currentStep as 1 | 2 | 3]}
                fill="url(#morphGrad)"
                stroke="#B3E5FC"
                strokeWidth="2"
                initial={false}
                animate={{ d: morphPaths[currentStep as 1 | 2 | 3] }}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              />
              {/* Inner step number */}
              <text
                x="50"
                y="56"
                textAnchor="middle"
                fill="#FFFFFF"
                className="font-mono-telemetry font-bold text-sm"
              >
                {currentStep}/3
              </text>
            </svg>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentStep === step
                    ? 'w-8 bg-[#29B6F6]'
                    : currentStep > step
                    ? 'w-3 bg-emerald-500'
                    : 'w-3 bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Step Content */}
        <AnimatePresence mode="wait">
          {/* STEP 1: SAFETY BUFFER */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <span className="font-mono-telemetry text-xs font-semibold text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-wider">
                  Passo 1 · Zero Cegueira Temporal
                </span>
                <h2 className="font-headline font-bold text-2xl sm:text-3xl tracking-tight text-[#0F172A] dark:text-white">
                  Com quanto tempo de antecedência prefere chegar aos clientes?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  O Departly adiciona automaticamente esta margem ao tempo de trânsito em tempo real para calcular a hora exata de partida.
                </p>
              </div>

              {/* Buffer Selection Tiles */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 5, label: '5 minutos', desc: 'Pontualidade Express' },
                  { val: 10, label: '10 minutos', desc: 'Recomendado B2B' },
                  { val: 15, label: '15 minutos', desc: 'Margem Imobiliária' },
                  { val: 20, label: '20 minutos', desc: 'Ultra-Tranquilo' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setBufferMin(item.val)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      bufferMin === item.val
                        ? 'bg-sky-50 dark:bg-sky-950/50 border-[#29B6F6] ring-2 ring-[#29B6F6]/30 shadow-sm'
                        : 'bg-white dark:bg-[#131D2E] border-[#E1E6F0] dark:border-[#2A374A] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-telemetry font-bold text-lg text-[#0F172A] dark:text-white">
                        +{item.val}m
                      </span>
                      {bufferMin === item.val && (
                        <Check size={16} className="text-[#0284C7] dark:text-[#38BDF8]" />
                      )}
                    </div>
                    <span className="font-headline font-semibold text-xs block text-slate-700 dark:text-slate-300 mt-1">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>

              {/* Slider Fine Tuning */}
              <BufferSlider
                value={bufferMin}
                onChange={setBufferMin}
                label="Ajuste fino da margem"
              />
            </motion.div>
          )}

          {/* STEP 2: TRANSIT PROFILE */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <span className="font-mono-telemetry text-xs font-semibold text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-wider">
                  Passo 2 · Perfil de Mobilidade
                </span>
                <h2 className="font-headline font-bold text-2xl sm:text-3xl tracking-tight text-[#0F172A] dark:text-white">
                  Como costuma deslocar-se entre compromissos?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Calibramos o modelo de previsão de tráfego (Google Maps / Waze) para o seu veículo habitual.
                </p>
              </div>

              {/* Transit Modes */}
              <div className="space-y-3">
                {[
                  {
                    id: 'car' as const,
                    title: 'Automóvel Pessoal / Empresa',
                    desc: 'Telemetria em tempo real com desvios dinâmicos de tráfego e acidentes.',
                    icon: <Car size={24} />,
                  },
                  {
                    id: 'motorcycle' as const,
                    title: 'Motociclo / Scooter',
                    desc: 'Previsões otimizadas para fluidez urbana e tempos de viagem mais estáveis.',
                    icon: <Bike size={24} />,
                  },
                  {
                    id: 'metro' as const,
                    title: 'Metro & Transportes Urbanos',
                    desc: 'Cruzamento com horários de carruagens e tempo a pé até à estação.',
                    icon: <Train size={24} />,
                  },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setTransitMode(mode.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all ${
                      transitMode === mode.id
                        ? 'bg-sky-50 dark:bg-sky-950/50 border-[#29B6F6] ring-2 ring-[#29B6F6]/30 shadow-sm'
                        : 'bg-white dark:bg-[#131D2E] border-[#E1E6F0] dark:border-[#2A374A] hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl shrink-0 ${
                        transitMode === mode.id
                          ? 'bg-[#29B6F6] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {mode.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-headline font-bold text-sm text-[#0F172A] dark:text-white">
                          {mode.title}
                        </span>
                        {transitMode === mode.id && (
                          <Check size={18} className="text-[#0284C7] dark:text-[#38BDF8]" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {mode.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: AUTOMATIONS & PERMISSIONS */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <span className="font-mono-telemetry text-xs font-semibold text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-wider">
                  Passo 3 · Proteção & Voz
                </span>
                <h2 className="font-headline font-bold text-2xl sm:text-3xl tracking-tight text-[#0F172A] dark:text-white">
                  Ativar as funcionalidades essenciais do Departly?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Protegemos a sua agenda profissional e garantimos comunicação segura durante a condução.
                </p>
              </div>

              <div className="space-y-3">
                {/* Feature 1: Smart Calendar Injection */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#131D2E] border border-[#E1E6F0] dark:border-[#2A374A] flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-[#0284C7] shrink-0">
                      <Calendar size={22} />
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-sm text-[#0F172A] dark:text-white">
                        Bloqueio Bidirecional no Calendário
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Injeta blocos automáticos marcados como &ldquo;Em Deslocação&rdquo; antes de cada evento físico.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={calendarSyncEnabled}
                    onChange={(e) => setCalendarSyncEnabled(e.target.checked)}
                    className="w-5 h-5 mt-1 accent-[#29B6F6] rounded"
                  />
                </div>

                {/* Feature 2: Hands-Free Voice AI */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#131D2E] border border-[#E1E6F0] dark:border-[#2A374A] flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-[#FF6B57] shrink-0">
                      <Mic size={22} />
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-sm text-[#0F172A] dark:text-white">
                        Voicebot IA para Gestão de Imprevistos
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Em caso de trânsito repentino, avisa clientes por voz com novo ETA sem tirar as mãos do volante.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={voiceEnabled}
                    onChange={(e) => setVoiceEnabled(e.target.checked)}
                    className="w-5 h-5 mt-1 accent-[#FF6B57] rounded"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>Conformidade RGPD: dados de GPS encriptados e processados localmente.</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Step Navigation Bar */}
      <div className="relative z-10 w-full max-w-lg mx-auto flex items-center justify-between gap-3 pt-4 border-t border-[#E1E6F0] dark:border-slate-800">
        {currentStep > 1 ? (
          <Button
            variant="secondary"
            icon={<ArrowLeft size={16} />}
            onClick={() => setCurrentStep((prev) => prev - 1)}
          >
            Anterior
          </Button>
        ) : (
          <div />
        )}

        {currentStep < 3 ? (
          <Button
            variant="primary"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
            onClick={() => setCurrentStep((prev) => prev + 1)}
          >
            Continuar
          </Button>
        ) : (
          <Button
            variant="primary"
            icon={<Check size={16} />}
            iconPosition="right"
            onClick={handleFinish}
          >
            Ativar Departly
          </Button>
        )}
      </div>
    </div>
  );
};
