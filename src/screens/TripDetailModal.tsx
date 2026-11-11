// Source: Google Maps Platform Code Assist
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TripEvent, AppLanguage } from '../types';
import {
  X,
  MapPin,
  Clock,
  Car,
  Navigation,
  Mic,
  Calendar,
  User,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Shield,
  Sliders,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import { Button, BufferSlider, Toggle } from '../components/UIComponents';
import { GoogleMapView } from '../components/GoogleMapView';
import { translations } from '../i18n';
import { formatDuration } from '../utils/formatTime';

interface TripDetailModalProps {
  trip: TripEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenVoiceHUD: (trip: TripEvent) => void;
  onMarkDeparted: (tripId: string) => void;
  onUpdateBuffer: (tripId: string, newBuffer: number) => void;
  onDeleteTrip?: (tripId: string) => void;
  theme?: 'light' | 'dark';
  language?: AppLanguage;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({
  trip,
  isOpen,
  onClose,
  onOpenVoiceHUD,
  onMarkDeparted,
  onUpdateBuffer,
  onDeleteTrip,
  theme = 'light',
  language = 'pt',
}) => {
  const t = translations[language];
  const isEn = language === 'en';

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !trip) return null;

  const [currentBuffer, setCurrentBuffer] = useState(trip.smartBufferMin);
  const [autoAdjustActive, setAutoAdjustActive] = useState(true);
  const [liveTrafficSeverity, setLiveTrafficSeverity] = useState<'clear' | 'moderate' | 'heavy'>(
    trip.trafficCondition === 'heavy' || trip.trafficCondition === 'incident'
      ? 'heavy'
      : trip.trafficCondition === 'moderate'
      ? 'moderate'
      : 'clear'
  );
  const [isUpdatingTraffic, setIsUpdatingTraffic] = useState(false);
  const [autoAdjustNotice, setAutoAdjustNotice] = useState<string | null>(null);

  // Sync buffer state when trip changes
  useEffect(() => {
    setCurrentBuffer(trip.smartBufferMin);
  }, [trip]);

  // Real-time automatic adjustment of Smart Buffer based on Directions live traffic
  const applyLiveTrafficTelemetry = (severity: 'clear' | 'moderate' | 'heavy') => {
    setLiveTrafficSeverity(severity);
    if (!autoAdjustActive) return;

    let targetBuffer = 10;
    let notice = '';

    if (severity === 'clear') {
      targetBuffer = 10;
      notice = isEn
        ? 'Clear corridor: Smart Buffer normalized to +10m baseline.'
        : 'Corredor livre: Margem normalizada para +10m base.';
    } else if (severity === 'moderate') {
      targetBuffer = 16;
      notice = isEn
        ? 'Moderate congestion (+5m delay): Smart Buffer automatically increased to +16m.'
        : 'Trânsito moderado (+5m atraso): Margem ajustada automaticamente para +16m.';
    } else {
      targetBuffer = 24;
      notice = isEn
        ? 'Severe corridor incident (+14m delay): Smart Buffer automatically expanded to +24m.'
        : 'Incidente severo (+14m atraso): Margem expandida automaticamente para +24m.';
    }

    setCurrentBuffer(targetBuffer);
    onUpdateBuffer(trip.id, targetBuffer);
    setAutoAdjustNotice(notice);
  };

  const handleSimulateTrafficChange = () => {
    setIsUpdatingTraffic(true);
    setTimeout(() => {
      setIsUpdatingTraffic(false);
      const nextSeverity =
        liveTrafficSeverity === 'clear'
          ? 'moderate'
          : liveTrafficSeverity === 'moderate'
          ? 'heavy'
          : 'clear';
      applyLiveTrafficTelemetry(nextSeverity);
    }, 700);
  };

  const handleBufferChange = (val: number) => {
    setCurrentBuffer(val);
    onUpdateBuffer(trip.id, val);
    setAutoAdjustNotice(null);
  };

  const isCompleted = trip.status === 'completed';
  const hasDelay = liveTrafficSeverity === 'heavy';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#10192A] rounded-t-3xl sm:rounded-3xl border border-[#E1E6F0] dark:border-[#243248] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-[#E1E6F0] dark:border-[#243248] flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
            <div className="flex items-center gap-2">
              <span className="font-mono-telemetry text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-wider">
                {t.tripDetailHeader}
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-mono-telemetry text-xs text-slate-500">
                {trip.calendarSource}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {onDeleteTrip && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title={t.deleteTrip}
                  aria-label={t.deleteTrip}
                >
                  <Trash2 size={18} />
                </button>
              )}

              <button
                onClick={onClose}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Title & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-headline font-bold text-2xl text-[#0F172A] dark:text-white">
                  {trip.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#29B6F6] shrink-0" />
                  <span>{trip.destinationAddress}</span>
                </p>
              </div>

              {hasDelay && (
                <div className="px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 font-mono-telemetry text-xs font-bold flex items-center gap-1.5 self-start sm:self-center">
                  <AlertTriangle size={14} />
                  <span>{isEn ? 'Severe Traffic (+14m)' : 'Trânsito Grave (+14m)'}</span>
                </div>
              )}
            </div>

            {/* REAL-TIME TRANSIT TELEMETRY OVERLAY (DIRECTIONS API LIVE TRAFFIC) */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-50 via-white to-sky-50/40 dark:from-slate-900 dark:via-[#10192A] dark:to-slate-950 border border-[#29B6F6]/30 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#29B6F6] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#29B6F6]" />
                  </span>
                  <span className="font-mono-telemetry text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-wider">
                    {isEn ? 'GOOGLE MAPS DIRECTIONS // LIVE TRANSIT TELEMETRY' : 'GOOGLE MAPS DIRECTIONS // TELEMETRIA DE TRÂNSITO AO VIVO'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateTrafficChange}
                  disabled={isUpdatingTraffic}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#E1F5FE] dark:hover:bg-[#003852] text-[#0284C7] dark:text-[#38BDF8] font-mono-telemetry text-[11px] font-semibold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw size={12} className={isUpdatingTraffic ? 'animate-spin' : ''} />
                  <span>{isEn ? 'Simulate Traffic Change' : 'Simular Trânsito'}</span>
                </button>
              </div>

              {/* Corridor Real-time Segments */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono-telemetry">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#131D2E] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">
                    {isEn ? 'Sec 1: City Access' : 'Sec 1: Saída Urbana'}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    48 km/h · {isEn ? 'Clear Flow' : 'Fluido'}
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border ${
                  liveTrafficSeverity === 'heavy'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-700 dark:text-rose-300'
                    : liveTrafficSeverity === 'moderate'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-700 dark:text-amber-300'
                    : 'bg-white dark:bg-[#131D2E] border-slate-200 text-slate-800 dark:text-slate-200'
                }`}>
                  <span className="text-[10px] opacity-75 block uppercase">
                    {isEn ? 'Sec 2: Highway Axis' : 'Sec 2: Eixo Principal'}
                  </span>
                  <span className="font-bold block">
                    {liveTrafficSeverity === 'heavy'
                      ? '16 km/h · +14m Retenção'
                      : liveTrafficSeverity === 'moderate'
                      ? '31 km/h · +5m Atraso'
                      : '56 km/h · Livre'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-[#131D2E] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">
                    {isEn ? 'Sec 3: Meeting Area' : 'Sec 3: Destino'}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    38 km/h · {isEn ? 'Normal' : 'Normal'}
                  </span>
                </div>
              </div>

              {/* Automated Smart Buffer Notification Banner */}
              {autoAdjustNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-xs font-mono-telemetry text-[#0284C7] dark:text-[#38BDF8] flex items-center gap-2"
                >
                  <Sparkles size={16} className="shrink-0" />
                  <span>{autoAdjustNotice}</span>
                </motion.div>
              )}

              {/* Automatic Buffer Adjustment Toggle */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs">
                  <Shield size={14} className="text-emerald-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {isEn
                      ? 'Auto-adjust Smart Buffer based on road conditions'
                      : 'Ajuste automático de margem baseado nas condições da estrada'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoAdjustActive(!autoAdjustActive)}
                  className={`px-3 py-1 rounded-full text-xs font-mono-telemetry font-bold transition-all ${
                    autoAdjustActive
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {autoAdjustActive ? (isEn ? 'AUTO ON' : 'ATIVO') : (isEn ? 'MANUAL' : 'MANUAL')}
                </button>
              </div>
            </div>

            {/* Route Corridor Visual Strip */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono-telemetry text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {t.corridorTitle} // {trip.distanceKm} KM
                </span>
                <span className="font-mono-telemetry text-xs text-[#0284C7] dark:text-[#38BDF8] font-semibold">
                  Via A1 / Eixo Norte-Sul
                </span>
              </div>

              {/* Graphical Route Steps */}
              <div className="relative flex items-center justify-between px-2 py-3">
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-700" />
                <div
                  className={`absolute left-6 top-1/2 -translate-y-1/2 h-1 transition-all duration-500 ${
                    hasDelay ? 'bg-[#FF6B57] w-2/3' : 'bg-[#29B6F6] w-full'
                  }`}
                />

                {/* Origin node */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#29B6F6] text-white flex items-center justify-center font-bold text-xs shadow-md">
                    1
                  </div>
                  <span className="font-mono-telemetry text-[11px] font-bold text-[#0F172A] dark:text-white mt-1">
                    {trip.departureTime}
                  </span>
                  <span className="text-[10px] text-slate-400">{isEn ? 'Departure' : 'Partida'}</span>
                </div>

                {/* Mid: Travel + Buffer badge */}
                <div className="relative z-10 px-3 py-1 rounded-full bg-white dark:bg-[#131D2E] border border-slate-300 dark:border-slate-600 shadow-sm font-mono-telemetry text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Car size={14} className="text-[#0284C7]" />
                  <span>{formatDuration(trip.travelTimeMin)} {isEn ? 'drive' : 'viagem'}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-[#0284C7] dark:text-[#38BDF8]">+{formatDuration(currentBuffer)} {isEn ? 'buffer' : 'margem'}</span>
                </div>

                {/* Destination node */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shadow-md">
                    2
                  </div>
                  <span className="font-mono-telemetry text-[11px] font-bold text-[#0F172A] dark:text-white mt-1">
                    {trip.scheduledTime}
                  </span>
                  <span className="text-[10px] text-slate-400">{isEn ? 'Meeting' : 'Reunião'}</span>
                </div>
              </div>
            </div>

            {/* Real Interactive Google Map */}
            <div className="space-y-2">
              <span className="font-mono-telemetry text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                {t.googleMapCorridorTitle}
              </span>
              <GoogleMapView
                origin={trip.originCoordinates || { lat: 38.7223, lng: -9.1485, title: trip.originAddress }}
                destination={trip.destinationCoordinates || { lat: 38.7675, lng: -9.0988, title: trip.destinationAddress }}
                height="210px"
                theme={theme}
              />
            </div>

            {/* Smart Buffer Adjuster for this meeting */}
            <div className="space-y-2">
              <span className="font-mono-telemetry text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                {t.bufferCalibrationMeeting}
              </span>
              <BufferSlider
                value={currentBuffer}
                onChange={handleBufferChange}
                label={isEn ? 'Safety Margin for this Client' : 'Margem de Segurança para este Cliente'}
              />
            </div>

            {/* Attendees and Contacts */}
            <div className="space-y-3">
              <span className="font-mono-telemetry text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                {t.clientAttendeesTitle} ({trip.attendees.length})
              </span>

              <div className="space-y-2">
                {trip.attendees.map((attendee, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E1F5FE] dark:bg-[#003852] text-[#0284C7] flex items-center justify-center font-bold text-sm">
                        {attendee.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-headline font-bold text-sm text-[#0F172A] dark:text-white block">
                          {attendee.name}
                        </span>
                        <span className="text-xs text-slate-400 block font-mono-telemetry">
                          {attendee.role} · {attendee.email}
                        </span>
                      </div>
                    </div>

                    {attendee.phone && (
                      <a
                        href={`tel:${attendee.phone}`}
                        className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#0284C7] transition-colors"
                        title="Ligar"
                      >
                        <Phone size={16} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar Injected Block info */}
            <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-start gap-3">
              <Calendar size={18} className="text-[#0284C7] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-sky-900 dark:text-sky-200 block">
                  {isEn ? '"Traveling" Block Injected' : 'Bloco "Em Deslocação" Injetado'}
                </span>
                <p className="text-sky-700 dark:text-sky-400 mt-0.5">
                  {isEn
                    ? `The window ${trip.departureTime} – ${trip.scheduledTime} is reserved in ${trip.calendarSource} to ensure uninterrupted travel.`
                    : `O período ${trip.departureTime} – ${trip.scheduledTime} está bloqueado como "Ocupado" no ${trip.calendarSource} para garantir viagem sem interrupções.`}
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 border-t border-[#E1E6F0] dark:border-[#243248] bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3">
            <Button
              variant="urgent"
              className="flex-1"
              icon={<Mic size={16} />}
              onClick={() => {
                onClose();
                onOpenVoiceHUD(trip);
              }}
            >
              {t.voiceAlert}
            </Button>
            {!isCompleted ? (
              <Button
                variant="primary"
                className="flex-1"
                icon={<Navigation size={16} />}
                onClick={() => {
                  onMarkDeparted(trip.id);
                  onClose();
                }}
              >
                {t.departNow}
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="flex-1"
                disabled
              >
                {t.markCompletedBtn}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setShowDeleteConfirm(false)}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative z-10 w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-2xl text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-[#0F172A] dark:text-white">
                    {t.confirmDeleteTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {t.confirmDeleteDesc}
                  </p>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    {t.cancelBtn}
                  </Button>
                  <Button
                    variant="urgent"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      if (onDeleteTrip) {
                        onDeleteTrip(trip.id);
                      }
                      setShowDeleteConfirm(false);
                      onClose();
                    }}
                  >
                    {t.deleteBtn}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
