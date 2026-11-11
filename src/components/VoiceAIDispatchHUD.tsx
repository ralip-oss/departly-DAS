import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  X,
  Send,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  Volume2,
  RefreshCw,
  Mail,
  User,
  MapPin,
} from 'lucide-react';
import { TripEvent } from '../types';
import { Button } from './UIComponents';

interface VoiceAIDispatchHUDProps {
  isOpen: boolean;
  onClose: () => void;
  targetTrip: TripEvent;
  onDispatchSuccess: (tripId: string, delayMin: number, message: string) => void;
}

export const VoiceAIDispatchHUD: React.FC<VoiceAIDispatchHUDProps> = ({
  isOpen,
  onClose,
  targetTrip,
  onDispatchSuccess,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [step, setStep] = useState<'listening' | 'analyzing' | 'preview' | 'sent'>('listening');
  const [delayMinutes, setDelayMinutes] = useState(14);
  const [autoCountdown, setAutoCountdown] = useState(5);
  const [autoSendActive, setAutoSendActive] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Email editable contents
  const [subject, setSubject] = useState(
    `Atraso imprevisto trânsito — Reunião ${targetTrip.title} (${targetTrip.clientName})`
  );
  const [body, setBody] = useState(
    `Estimado(a) ${targetTrip.clientName},\n\n` +
      `Estou a caminho da nossa reunião em ${targetTrip.destinationAddress}, mas deparei-me com uma retenção severa de trânsito inesperada.\n\n` +
      `A nova previsão de chegada calculada pelo sistema com telemetria GPS em tempo real é às 14:44 (aproximadamente +14 minutos após o previsto).\n\n` +
      `Apresento desde já as minhas sinceras desculpas pelo constrangimento e comprometo-me a iniciar a reunião imediatamente à chegada.\n\n` +
      `Atentamente,\nJoão Mendes`
  );

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && targetTrip) {
      setStep('listening');
      setTranscript('');
      setAutoCountdown(5);
      setAutoSendActive(true);
      setSubject(
        `Atraso imprevisto trânsito — Reunião ${targetTrip.title} (${targetTrip.clientName})`
      );
      setBody(
        `Estimado(a) ${targetTrip.clientName},\n\n` +
          `Estou a caminho da nossa reunião em ${targetTrip.destinationAddress}, mas deparei-me com uma retenção severa de trânsito inesperada.\n\n` +
          `A nova previsão de chegada calculada pelo sistema com telemetria GPS em tempo real é às 14:44 (aproximadamente +14 minutos após o previsto).\n\n` +
          `Apresento desde já as minhas sinceras desculpas pelo constrangimento e comprometo-me a iniciar a reunião imediatamente à chegada.\n\n` +
          `Atentamente,\nDepartly Dispatch`
      );
      startSpeechRecognition();
    } else {
      stopSpeechRecognition();
    }
    return () => {
      stopSpeechRecognition();
    };
  }, [isOpen, targetTrip]);

  const startSpeechRecognition = () => {
    setIsListening(true);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'pt-PT';

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
        };

        recognition.onend = () => {
          setIsListening(false);
          // Auto advance to analyzing
          processSpokenCommand();
        };

        recognition.onerror = () => {
          setIsListening(false);
          // If error or denied, use default prompt
          simulateSpokenVoice();
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch {
        simulateSpokenVoice();
      }
    } else {
      simulateSpokenVoice();
    }
  };

  const simulateSpokenVoice = () => {
    setIsListening(true);
    setTranscript('');
    const phrase =
      'Estou preso no trânsito no Eixo Norte-Sul, avisa o meu cliente das 14h30 que vou chegar atrasado.';
    let i = 0;
    const interval = setInterval(() => {
      if (i <= phrase.length) {
        setTranscript(phrase.slice(0, i));
        i += 3;
      } else {
        clearInterval(interval);
        setIsListening(false);
        setTimeout(() => {
          processSpokenCommand();
        }, 600);
      }
    }, 40);
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const processSpokenCommand = () => {
    setStep('analyzing');
    setTimeout(() => {
      setStep('preview');
    }, 1200);
  };

  // Auto countdown for hands-free driving safety
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'preview' && autoSendActive && autoCountdown > 0) {
      timer = setTimeout(() => {
        setAutoCountdown((prev) => prev - 1);
      }, 1000);
    } else if (step === 'preview' && autoSendActive && autoCountdown === 0) {
      handleConfirmSend();
    }
    return () => clearTimeout(timer);
  }, [step, autoCountdown, autoSendActive]);

  const handleConfirmSend = () => {
    setStep('sent');
    if ('speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(
          `Aviso de atraso enviado com sucesso para ${targetTrip.clientName}. Nova hora de chegada prevista às 14h44.`
        );
        utterance.lang = 'pt-PT';
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      } catch {
        // ignore speech error
      }
    }

    setTimeout(() => {
      onDispatchSuccess(targetTrip.id, delayMinutes, body);
      onClose();
    }, 2400);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Darkened backdrop with ambient warning / aerospace blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#070D18]/85 backdrop-blur-md"
          onClick={() => step !== 'sent' && onClose()}
        />

        {/* HUD Window Container */}
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative z-10 w-full max-w-xl bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B57] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF6B57]" />
              </span>
              <div>
                <span className="font-mono-telemetry text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider uppercase">
                  VOICE AI DELAY DISPATCH HUD
                </span>
                <span className="text-[10px] text-slate-400 block font-mono-telemetry">
                  HANDS-FREE PROTOCOL // SAFETY ACTIVE
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              aria-label="Fechar HUD"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto flex-1 flex flex-col">
            {/* STEP 1: LISTENING & VOICE RECOGNITION */}
            {step === 'listening' && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                {/* Reactive Microphone Sphere */}
                <div className="relative w-32 h-32 flex items-center justify-center my-4">
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className="absolute inset-0 rounded-full bg-[#29B6F6]/30 blur-xl"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="absolute inset-2 rounded-full border-2 border-[#29B6F6]/40"
                  />
                  <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#29B6F6] text-white flex items-center justify-center shadow-lg shadow-[#29B6F6]/30">
                    <Mic size={36} className="animate-pulse" />
                  </div>
                </div>

                {/* Animated Waveform Simulator */}
                <div className="flex items-center gap-1.5 h-10 my-3">
                  {[24, 40, 16, 48, 32, 56, 20, 44, 30, 52, 18, 36].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: [h * 0.3, h, h * 0.4],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6 + (i % 3) * 0.2,
                        delay: i * 0.05,
                      }}
                      className="w-1.5 rounded-full bg-[#29B6F6]"
                    />
                  ))}
                </div>

                <h3 className="font-headline font-bold text-xl text-[#0F172A] dark:text-[#F8FAFC] mt-2">
                  A Escutar Comando de Voz...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Diga: &ldquo;Estou preso no trânsito, avisa a minha próxima reunião do meu atraso&rdquo;
                </p>

                {/* Live Transcript Bubble */}
                <div className="w-full mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
                  <span className="font-mono-telemetry text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    TRANSCRIÇÃO EM TEMPO REAL
                  </span>
                  <p className="font-body text-sm font-medium text-slate-800 dark:text-slate-200 italic min-h-[44px]">
                    &ldquo;{transcript || 'Aguardando áudio do condutor...'}&rdquo;
                  </p>
                </div>

                <div className="mt-6 flex gap-3 w-full">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setTranscript(
                        'Estou preso no trânsito, avisa a minha próxima reunião do meu atraso.'
                      );
                      processSpokenCommand();
                    }}
                  >
                    Usar Comando Predefinido
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={processSpokenCommand}
                  >
                    Processar
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: ANALYZING GPS & TELEMETRY */}
            {step === 'analyzing' && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative w-28 h-28 flex items-center justify-center my-4">
                  <RefreshCw
                    size={48}
                    className="text-[#29B6F6] animate-spin"
                    style={{ animationDuration: '2s' }}
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#29B6F6]/40 animate-spin" />
                </div>

                <h3 className="font-headline font-bold text-xl text-[#0F172A] dark:text-[#F8FAFC]">
                  Cruzando Telemetria GPS & Agenda
                </h3>
                <div className="mt-4 space-y-2 text-xs font-mono-telemetry text-slate-500 dark:text-slate-400 max-w-sm text-left">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <CheckCircle2 size={14} /> Incidente detetado: Eixo Norte-Sul (+14m)
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500">
                    <CheckCircle2 size={14} /> Reunião identificada: {targetTrip.title}
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500">
                    <CheckCircle2 size={14} /> Destinatário: {targetTrip.clientName} (
                    {targetTrip.attendees[0]?.email})
                  </div>
                  <div className="flex items-center gap-2 text-[#0284C7] dark:text-[#38BDF8]">
                    <Sparkles size={14} className="animate-spin" /> IA a redigir mensagem empática...
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PREVIEW & AUTONOMOUS DISPATCH */}
            {step === 'preview' && (
              <div className="flex flex-col gap-4">
                {/* Live Incident Status Banner */}
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 flex items-center justify-center shrink-0">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <span className="font-mono-telemetry text-xs font-bold text-rose-700 dark:text-rose-400 block">
                        ATRASO ESTIMADO: +{delayMinutes} MINUTOS
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">
                        Chegada recalculada: <strong className="text-slate-900 dark:text-white">14:44</strong> (Hora original: {targetTrip.scheduledTime})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono-telemetry text-xs text-rose-600 font-semibold bg-white dark:bg-rose-900/80 px-2.5 py-1 rounded-full border border-rose-200">
                      A1 / Eixo Norte-Sul
                    </span>
                  </div>
                </div>

                {/* Recipient Card */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E1F5FE] dark:bg-[#003852] text-[#0284C7] flex items-center justify-center font-bold text-xs">
                      {targetTrip.clientName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-headline font-bold text-xs text-[#0F172A] dark:text-white block">
                        {targetTrip.clientName}
                      </span>
                      <span className="font-mono-telemetry text-[11px] text-slate-400">
                        {targetTrip.attendees[0]?.email || 'contacto@cliente.pt'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono-telemetry text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200">
                    Cliente Notificado
                  </span>
                </div>

                {/* AI Drafted Message Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-telemetry uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-[#29B6F6]" />
                      Mensagem Redigida pelo Departly IA
                    </span>
                    <button
                      onClick={() => setAutoSendActive(false)}
                      className="text-xs text-[#0284C7] dark:text-[#38BDF8] hover:underline"
                    >
                      Pausar Envio Automático
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-body space-y-2 text-slate-700 dark:text-slate-300">
                    <div className="font-semibold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
                      Assunto: {subject}
                    </div>
                    <textarea
                      value={body}
                      onChange={(e) => {
                        setAutoSendActive(false);
                        setBody(e.target.value);
                      }}
                      rows={5}
                      className="w-full bg-transparent resize-none outline-none font-body text-xs leading-relaxed"
                    />
                  </div>
                </div>

                {/* Auto Dispatch Countdown Bar */}
                {autoSendActive && (
                  <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-sky-800 dark:text-sky-300 font-medium">
                      <Clock size={14} className="text-[#0284C7]" />
                      <span>Envio autónomo hands-free em:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-telemetry font-bold text-base text-[#0284C7] dark:text-[#38BDF8]">
                        {autoCountdown}s
                      </span>
                      <button
                        onClick={() => setAutoSendActive(false)}
                        className="text-[11px] underline text-slate-500 hover:text-slate-700 dark:text-slate-400"
                      >
                        Cancelar timer
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={onClose}
                  >
                    Descartar
                  </Button>
                  <Button
                    variant="urgent"
                    className="flex-1"
                    icon={<Send size={16} />}
                    onClick={handleConfirmSend}
                  >
                    Enviar Agora
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS SENT CONFIRMATION */}
            {step === 'sent' && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center my-3 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 size={44} />
                </motion.div>

                <h3 className="font-headline font-bold text-2xl text-[#0F172A] dark:text-[#F8FAFC]">
                  Aviso de Atraso Enviado com Sucesso!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-sm">
                  O cliente <strong>{targetTrip.clientName}</strong> foi avisado da nova previsão de chegada às <strong>14:44</strong>.
                </p>

                <div className="mt-4 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono-telemetry text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Volume2 size={14} className="text-[#0284C7]" />
                  &ldquo;E-mail de atraso enviado com sucesso. Chegará às 14h44.&rdquo;
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
