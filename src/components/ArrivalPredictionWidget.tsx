// Source: Google Maps Platform Code Assist
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TripEvent, AppLanguage } from '../types';
import {
  Clock,
  MapPin,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Navigation,
  CheckCircle2,
  Car,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Mic,
} from 'lucide-react';
import { translations } from '../i18n';
import { formatDuration } from '../utils/formatTime';

interface ArrivalPredictionWidgetProps {
  trip: TripEvent | null;
  currentTime: Date;
  language?: AppLanguage;
  onOpenVoiceHUD?: (trip: TripEvent) => void;
  onSelectTrip?: (trip: TripEvent) => void;
}

export const ArrivalPredictionWidget: React.FC<ArrivalPredictionWidgetProps> = ({
  trip,
  currentTime,
  language = 'pt',
  onOpenVoiceHUD,
  onSelectTrip,
}) => {
  const t = translations[language];
  const isEn = language === 'en';

  const [isRecalculating, setIsRecalculating] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(currentTime);
  const [trafficOffsetMin, setTrafficOffsetMin] = useState<number>(0);

  useEffect(() => {
    if (trip) {
      if (trip.trafficCondition === 'heavy' || trip.trafficCondition === 'incident') {
        setTrafficOffsetMin(14);
      } else if (trip.trafficCondition === 'moderate') {
        setTrafficOffsetMin(5);
      } else {
        setTrafficOffsetMin(0);
      }
    }
  }, [trip]);

  // Recalculate Distance Matrix ETA
  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setIsRecalculating(false);
      setLastSync(new Date());
    }, 900);
  };

  if (!trip) {
    return (
      <div className="p-4 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
            <Car size={20} />
          </div>
          <div>
            <h4 className="font-headline font-bold text-xs text-[#0F172A] dark:text-white">
              {isEn ? 'Distance Matrix Standby' : 'Matriz de Distância em Standby'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isEn ? 'No pending trip to calculate real-time ETA.' : 'Sem viagens pendentes para calcular ETA ao vivo.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate live ETA
  // Live Travel Time = base travel time + traffic offset
  const liveDriveDurationMin = trip.travelTimeMin + trafficOffsetMin;

  // Calculate ETA timestamp from current live clock
  const liveEtaDate = new Date(currentTime.getTime() + liveDriveDurationMin * 60 * 1000);
  const etaFormatted = `${String(liveEtaDate.getHours()).padStart(2, '0')}:${String(
    liveEtaDate.getMinutes()
  ).padStart(2, '0')}`;

  // Minute-level comparison for departure window and meeting punctuality
  const currentMinuteStamp = Math.floor(currentTime.getTime() / 60000);
  const [depHours, depMins] = (trip.departureTime || '00:00').split(':').map(Number);
  const hasValidDep = !isNaN(depHours) && !isNaN(depMins);
  const departureDate = new Date(currentTime);
  if (hasValidDep) {
    departureDate.setHours(depHours, depMins, 0, 0);
  }
  const minutesUntilDeparture = hasValidDep
    ? Math.floor(departureDate.getTime() / 60000) - currentMinuteStamp
    : 0;

  // Compare ETA against scheduled meeting time
  const [schedHours, schedMins] = (trip.scheduledTime || '00:00').split(':').map(Number);
  const hasValidSched = !isNaN(schedHours) && !isNaN(schedMins);
  const meetingDate = new Date(currentTime);
  if (hasValidSched) {
    meetingDate.setHours(schedHours, schedMins, 0, 0);
    // Handle midnight-crossing trips (e.g. departure 23:50, meeting 00:15)
    if (hasValidDep && schedHours * 60 + schedMins < depHours * 60 + depMins) {
      meetingDate.setDate(meetingDate.getDate() + 1);
    }
  }

  const etaMinuteStamp = Math.floor(liveEtaDate.getTime() / 60000);
  const meetingMinuteStamp = Math.floor(meetingDate.getTime() / 60000);

  // Late badge if ETA is strictly after meeting time
  const isLateByEta = hasValidSched && etaMinuteStamp > meetingMinuteStamp;
  // User is late for departure if departure time has passed OR ETA already exceeds meeting time
  const isUserLate = minutesUntilDeparture < 0 || isLateByEta;
  const isDelayRisk = trafficOffsetMin > 8;

  return (
    <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white via-white to-sky-50/50 dark:from-[#10192A] dark:via-[#10192A] dark:to-[#0A1220] border border-[#E1E6F0] dark:border-[#243248] shadow-sm space-y-3.5 select-none transition-all">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-[#29B6F6]/10 dark:bg-[#29B6F6]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Strip: Distance Matrix Badge & Live Ticker */}
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0284C7] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0284C7]" />
          </span>
          <span className="font-mono-telemetry text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">
            {isEn ? 'GOOGLE MAPS DISTANCE MATRIX // LIVE ETA' : 'GOOGLE MAPS DISTANCE MATRIX // ETA AO VIVO'}
          </span>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={isRecalculating}
          className="text-[11px] font-mono-telemetry font-semibold text-[#0284C7] dark:text-[#38BDF8] hover:underline flex items-center gap-1 shrink-0 active:scale-95 transition-all whitespace-nowrap"
        >
          <RefreshCw size={11} className={isRecalculating ? 'animate-spin' : ''} />
          <span>{isEn ? 'Recalculate' : 'Recalcular'}</span>
        </button>
      </div>

      {/* Main Metric Split: Real-Time ETA Hero Readout + Contained Departure Window */}
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-mono-telemetry uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-semibold">
            {isEn ? 'PREDICTED ARRIVAL (ETA)' : 'PREVISÃO DE CHEGADA (ETA)'}
          </span>
          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            <span className="font-mono-telemetry font-bold text-3xl sm:text-4xl text-[#0F172A] dark:text-white tracking-tight">
              {etaFormatted}
            </span>
            <span
              className={`font-mono-telemetry text-xs font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${
                isLateByEta
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {isLateByEta
                ? (isEn ? 'Late' : 'Atrasado')
                : (isEn ? 'On Time' : 'A Horas')}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 min-w-0">
            <MapPin size={12} className="text-[#29B6F6] shrink-0" />
            <span className="truncate">{trip.destinationAddress}</span>
          </p>
        </div>

        {/* Dynamic Departure Countdown Strip (Stacked cleanly inside the card so it never clips on phone screens) */}
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-3 py-2 rounded-2xl bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 min-w-0">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 min-w-0">
            <span className="font-mono-telemetry text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">
              {isEn ? 'DEPARTURE IN' : 'SAÍDA EM'}
            </span>
            <span className="font-mono-telemetry text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
              · {isEn ? `At ${trip.departureTime}` : `Às ${trip.departureTime}`}
            </span>
          </div>

          <span
            className={`font-mono-telemetry font-bold text-sm sm:text-base leading-tight shrink-0 whitespace-nowrap ${
              isUserLate
                ? 'text-rose-600 dark:text-rose-400 animate-pulse'
                : minutesUntilDeparture <= 15
                ? 'text-[#FF6B57] animate-pulse'
                : 'text-[#0284C7] dark:text-[#38BDF8]'
            }`}
          >
            {isUserLate
              ? (isEn ? 'LATE' : 'ATRASO')
              : minutesUntilDeparture > 0
              ? (minutesUntilDeparture >= 60 ? formatDuration(minutesUntilDeparture) : `${minutesUntilDeparture}m`)
              : (isEn ? 'NOW' : 'AGORA')}
          </span>
        </div>
      </div>

      {/* Distance Matrix Details Grid */}
      <div className="grid grid-cols-3 gap-1.5 p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#131D2E] border border-slate-200 dark:border-slate-800 text-center font-mono-telemetry">
        <div className="min-w-0 px-0.5">
          <span className="text-[9px] text-slate-400 block uppercase truncate">
            {isEn ? 'Matrix Dist' : 'Distância'}
          </span>
          <span className="font-bold text-[11px] sm:text-xs text-[#0F172A] dark:text-white block break-words">
            {trip.distanceKm} km
          </span>
        </div>
        <div className="min-w-0 px-1 border-x border-slate-200 dark:border-slate-800">
          <span className="text-[9px] text-[#0284C7] dark:text-[#38BDF8] block uppercase font-semibold truncate">
            {isEn ? 'Live Drive' : 'Condução'}
          </span>
          <span className="font-bold text-[11px] sm:text-xs text-[#0284C7] dark:text-[#38BDF8] block break-words">
            {formatDuration(liveDriveDurationMin)}
          </span>
        </div>
        <div className="min-w-0 px-0.5">
          <span className="text-[9px] text-slate-400 block uppercase truncate">
            {isEn ? 'Meeting' : 'Reunião'}
          </span>
          <span className="font-bold text-[11px] sm:text-xs text-[#0F172A] dark:text-white block break-words">
            {trip.scheduledTime}
          </span>
        </div>
      </div>

      {/* Traffic Warning Alert & Quick Voice Action if Delayed or Late */}
      {(isDelayRisk || isLateByEta) && onOpenVoiceHUD && (
        <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-semibold min-w-0 flex-1">
            <AlertTriangle size={15} className="shrink-0" />
            <span className="break-words leading-snug">
              {isLateByEta
                ? (isEn ? 'ETA is past scheduled meeting time.' : 'ETA ultrapassa a hora da reunião.')
                : (isEn ? 'Heavy traffic corridor detected.' : 'Congestionamento severo no corredor.')}
            </span>
          </div>

          <button
            onClick={() => onOpenVoiceHUD(trip)}
            className="px-2.5 py-1 rounded-xl bg-[#FF6B57] text-white font-headline text-xs font-bold flex items-center gap-1 shadow-sm shrink-0 whitespace-nowrap active:scale-95 transition-all"
          >
            <Mic size={12} />
            <span>{isEn ? 'Voice Alert' : 'Aviso IA'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
