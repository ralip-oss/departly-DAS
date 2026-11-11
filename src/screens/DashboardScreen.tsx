import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TripEvent,
  UserProfile,
  TimeOfDay,
  ChronoState,
} from '../types';
import { ChronoPulse } from '../components/ChronoPulse';
import { Button, FilterChip } from '../components/UIComponents';
import {
  Mic,
  AlertTriangle,
  Plus,
  RefreshCw,
  Navigation,
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Car,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { translations } from '../i18n';
import { GoogleMapView } from '../components/GoogleMapView';
import { ArrivalPredictionWidget } from '../components/ArrivalPredictionWidget';
import { formatDuration } from '../utils/formatTime';
import { Trash2 } from 'lucide-react';

interface DashboardScreenProps {
  profile: UserProfile;
  trips: TripEvent[];
  timeOfDay: TimeOfDay;
  onSelectTrip: (trip: TripEvent) => void;
  onOpenVoiceHUD: (trip?: TripEvent) => void;
  onOpenNewTrip: () => void;
  onMarkDeparted: (tripId: string) => void;
  onSimulateTrafficIncident: () => void;
  onDeleteTrip?: (tripId: string) => void;
  currentTime?: Date;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  profile,
  trips,
  timeOfDay,
  onSelectTrip,
  onOpenVoiceHUD,
  onOpenNewTrip,
  onMarkDeparted,
  onSimulateTrafficIncident,
  onDeleteTrip,
  currentTime = new Date(),
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

  const hasTrips = trips.length > 0;

  // Imminent departure: ALWAYS sort upcoming trips by earliest departure/scheduled time
  const sortedUpcoming = [...trips.filter((t) => t.status === 'upcoming')].sort((a, b) => {
    const [aH, aM] = (a.departureTime || a.scheduledTime).split(':').map(Number);
    const [bH, bM] = (b.departureTime || b.scheduledTime).split(':').map(Number);
    return aH * 60 + aM - (bH * 60 + bM);
  });
  const activeTrip = sortedUpcoming[0] || trips[0];

  // Dynamic real-time calculation of departure countdown
  const minutesUntilDeparture = activeTrip
    ? (() => {
        const [h, m] = (activeTrip.departureTime || '12:00').split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return 0;
        const targetMin = h * 60 + m;
        const currentMin = currentTime.getHours() * 60 + currentTime.getMinutes();
        return targetMin - currentMin;
      })()
    : 0;

  // Filtered trips
  const filteredTrips = trips.filter((t) => {
    if (filter === 'pending') return t.status !== 'completed';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const isGuest = profile.name === 'Guest Account';
  const isEn = profile.language === 'en';
  const userGreetingName = isGuest ? '' : `, ${profile.name.split(' ')[0]}`;
  const t = translations[profile.language || 'pt'];

  // Time-of-day contextual content
  const timeContent = {
    morning: {
      tag: isEn ? 'MORNING LAUNCHPAD // 08:00 - 12:00' : 'LAUNCHPAD MATINAL // 08:00 - 12:00',
      greeting: `${isEn ? 'Good morning' : 'Bom dia'}${userGreetingName}`,
      summary: hasTrips
        ? (isEn ? `1st Recommended departure at ${activeTrip?.departureTime || '09:30'}. Lisbon corridors clear.` : `1ª Partida recomendada às ${activeTrip?.departureTime || '09:30'}. Corredores de Lisboa fluídos.`)
        : (isEn ? 'No scheduled trips for this morning. Clear skies and protected calendar.' : 'Sem viagens agendadas para esta manhã. Céu limpo e agenda protegida.'),
      heroMetricLabel: isEn ? 'NEXT DEPARTURE WINDOW' : 'PRÓXIMA JANELA DE PARTIDA',
      tip: isEn ? 'Departly calculates departure in real time based on traffic.' : 'O Departly calcula a hora de saída em tempo real com base no trânsito.',
    },
    afternoon: {
      tag: isEn ? 'ACTIVE TRAFFIC RADAR // 12:00 - 18:00' : 'CONTROLO DE TRÁFEGO ATIVO // 12:00 - 18:00',
      greeting: `${isEn ? 'Good afternoon' : 'Boa tarde'}${userGreetingName}`,
      summary: hasTrips
        ? (isEn ? `${trips.length} meetings with physical addresses. Traffic picking up on main arteries.` : `${trips.length} reuniões com morada física. Trânsito a intensificar nos eixos urbanos.`)
        : (isEn ? 'Zero pending departures for this afternoon. Ready to add new trips.' : 'Zero partidas pendentes para esta tarde. Pronto para adicionar novos trajetos.'),
      heroMetricLabel: isEn ? 'IMMINENT DEPARTURE WINDOW' : 'JANELA DE PARTIDA IMINENTE',
      tip: isEn ? 'In case of road delays, use Voice AI to alert clients hands-free.' : 'Em caso de imprevisto na estrada, use o Voicebot IA para avisar clientes.',
    },
    evening: {
      tag: isEn ? 'DAILY DEBRIEF & PRE-BUFFER // 18:00 - 23:00' : 'DEBRIEF DIÁRIO & PRÉ-BUFFER // 18:00 - 23:00',
      greeting: `${isEn ? 'Good evening' : 'Boa noite'}${userGreetingName}`,
      summary: hasTrips
        ? (isEn ? 'All trips today completed with guaranteed punctuality.' : 'Todas as deslocações de hoje concluídas com pontualidade assegurada.')
        : (isEn ? 'Schedule clear. Plan tomorrow trips to inject travel blocks.' : 'Agenda desimpedida. Planeie os trajetos de amanhã para injetar blocos de viagem.'),
      heroMetricLabel: isEn ? 'OPERATIONAL STATUS' : 'ESTADO OPERACIONAL',
      tip: isEn ? 'Invisible calendar blocking prevents overlapping calls.' : 'O bloqueio invisível de calendário previne chamadas sobrepostas.',
    },
  }[timeOfDay];

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      {/* Pull to refresh visual feedback banner if refreshing */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full flex items-center justify-center p-2.5 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center gap-2.5">
              <ChronoPulse state="scanning" size="sm" />
              <span className="font-mono-telemetry text-xs font-semibold text-[#0284C7] dark:text-[#38BDF8]">
                Recalibrando radares de trânsito em tempo real...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Greeting Header & Quick Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-[#E1F5FE] dark:bg-[#003852] border border-[#B3E5FC] dark:border-sky-800 font-mono-telemetry text-[9px] font-bold text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-wider">
              {timeContent.tag.split('//')[0]}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="font-headline font-bold text-xl sm:text-2xl text-[#0F172A] dark:text-white mt-1 tracking-tight truncate">
            {timeContent.greeting}
          </h1>
          <p className="font-body text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
            {timeContent.summary}
          </p>
        </div>

        {/* Refresh / Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] text-slate-600 dark:text-slate-300 hover:text-[#0284C7] active:scale-95 transition-all"
            title="Atualizar Radar"
            aria-label="Atualizar Radar"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* DYNAMIC ARRIVAL PREDICTION WIDGET (DISTANCE MATRIX LIVE ETA) */}
      <ArrivalPredictionWidget
        trip={activeTrip || null}
        currentTime={currentTime}
        language={profile.language}
        onOpenVoiceHUD={onOpenVoiceHUD}
        onSelectTrip={onSelectTrip}
      />

      {/* =========================================================
          HERO CARD: ACTIVE TRIP OR CLEAN EMPTY RADAR
          ========================================================= */}
      {hasTrips && activeTrip ? (
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] p-5 shadow-sm flex flex-col gap-4">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#29B6F6]/10 dark:bg-[#29B6F6]/5 rounded-full blur-2xl pointer-events-none" />

          {/* Top Pill / Status */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="font-mono-telemetry text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {timeContent.heroMetricLabel}
            </span>

            <div
              className={`px-2.5 py-0.5 rounded-full font-mono-telemetry text-[11px] font-bold flex items-center gap-1.5 ${
                activeTrip?.trafficCondition === 'heavy' || activeTrip?.trafficCondition === 'incident'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeTrip?.trafficCondition === 'heavy' || activeTrip?.trafficCondition === 'incident'
                    ? 'bg-rose-500 animate-pulse'
                    : 'bg-emerald-500'
                }`}
              />
              {activeTrip?.trafficCondition === 'heavy'
                ? 'TRÂNSITO INTENSO'
                : 'FLUXO REGULAR'}
            </div>
          </div>

          {/* ChronoPulse + Meeting Info */}
          <div className="flex flex-col sm:flex-row items-center gap-4 my-1">
            <div className="shrink-0 flex items-center justify-center">
              <ChronoPulse
                state={
                  activeTrip?.trafficCondition === 'heavy' || activeTrip?.trafficCondition === 'incident'
                    ? 'warning'
                    : 'calm'
                }
                size="md"
                countdownMinutes={Math.max(0, minutesUntilDeparture)}
                interactive
                onClick={() => onSelectTrip(activeTrip)}
              />
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
              <span className="font-mono-telemetry text-[11px] text-[#0284C7] dark:text-[#38BDF8] uppercase font-bold tracking-wider block">
                {minutesUntilDeparture > 0
                  ? (isEn
                      ? `Depart in ${formatDuration(minutesUntilDeparture)} · Exact: ${activeTrip.departureTime}`
                      : `Saída em ${formatDuration(minutesUntilDeparture)} · Partida exata às ${activeTrip.departureTime}`)
                  : minutesUntilDeparture >= -15
                  ? (isEn ? `Depart now · Planned at ${activeTrip.departureTime}` : `Partida imediata · Agendada às ${activeTrip.departureTime}`)
                  : (isEn ? `Departure time passed (${activeTrip.departureTime})` : `Hora de partida ultrapassada (${activeTrip.departureTime})`)}
              </span>
              <h3 className="font-headline font-bold text-lg text-[#0F172A] dark:text-white truncate">
                {activeTrip.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1 truncate">
                <MapPin size={12} className="text-[#29B6F6] shrink-0" />
                <span className="truncate">{activeTrip.destinationAddress}</span>
              </p>
            </div>
          </div>

          {/* Transit Breakdown Numbers */}
          <div className="grid grid-cols-3 gap-1 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div>
              <span className="font-mono-telemetry text-[9px] text-slate-400 block uppercase">
                {t.travelTime}
              </span>
              <span className="font-mono-telemetry font-bold text-xs text-[#0F172A] dark:text-white">
                {formatDuration(activeTrip.travelTimeMin)}
              </span>
            </div>
            <div className="border-x border-slate-200 dark:border-slate-800">
              <span className="font-mono-telemetry text-[9px] text-[#0284C7] dark:text-[#38BDF8] block uppercase font-semibold">
                {t.margin}
              </span>
              <span className="font-mono-telemetry font-bold text-xs text-[#0284C7] dark:text-[#38BDF8]">
                +{formatDuration(activeTrip.smartBufferMin)}
              </span>
            </div>
            <div>
              <span className="font-mono-telemetry text-[9px] text-slate-400 block uppercase">
                {t.meeting}
              </span>
              <span className="font-mono-telemetry font-bold text-xs text-[#0F172A] dark:text-white">
                {activeTrip.scheduledTime}
              </span>
            </div>
          </div>

          {/* Live Google Map Preview */}
          <GoogleMapView
            origin={activeTrip.originCoordinates || { lat: 38.7223, lng: -9.1485, title: activeTrip.originAddress }}
            destination={activeTrip.destinationCoordinates || { lat: 38.7675, lng: -9.0988, title: activeTrip.destinationAddress }}
            height="150px"
            theme={profile.theme}
          />

          {/* Action Buttons in Thumb Zone */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              icon={<Navigation size={14} />}
              onClick={() => onMarkDeparted(activeTrip.id)}
            >
              {t.departNow}
            </Button>
            <Button
              variant="urgent"
              size="sm"
              className="flex-1"
              icon={<Mic size={14} />}
              onClick={() => onOpenVoiceHUD(activeTrip)}
            >
              {t.voiceAlert}
            </Button>
          </div>
        </div>
      ) : (
        /* HERO EMPTY STATE: WHEN NO TRIPS EXIST */
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] p-6 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="my-1">
            <ChronoPulse state="empty" size="md" />
          </div>

          <div>
            <h3 className="font-headline font-bold text-lg text-[#0F172A] dark:text-white">
              {t.noTripsTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              {t.noTripsDesc}
            </p>
          </div>

          <div className="flex flex-col w-full gap-2 pt-1 max-w-xs">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={15} />}
              onClick={onOpenNewTrip}
              className="w-full"
            >
              {t.newTripBtn}
            </Button>
          </div>
        </div>
      )}

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onOpenNewTrip}
          className="p-3.5 rounded-2xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] text-slate-800 dark:text-slate-200 font-headline font-semibold text-xs flex items-center justify-between shadow-sm active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8]">
              <Plus size={16} />
            </div>
            <span>{t.newTripBtn}</span>
          </div>
          <ArrowRight size={14} className="text-slate-400" />
        </button>

        <button
          onClick={() => onOpenVoiceHUD()}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-headline font-semibold text-xs flex items-center justify-between shadow-md shadow-rose-500/20 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20">
              <Mic size={16} className="animate-pulse" />
            </div>
            <span>{t.voicebotBtn}</span>
          </div>
          <ArrowRight size={14} className="text-white/70" />
        </button>
      </div>

      {/* ACTIVITY FEED */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="font-headline font-bold text-sm text-[#0F172A] dark:text-white">
            {t.scheduledTrips} ({trips.length})
          </h2>

          {hasTrips && (
            <div className="flex items-center gap-1">
              <FilterChip
                label={t.allTrips}
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              />
              <FilterChip
                label={t.pendingTrips}
                active={filter === 'pending'}
                onClick={() => setFilter('pending')}
              />
            </div>
          )}
        </div>

        {hasTrips ? (
          <div className="space-y-2">
            {filteredTrips.map((trip) => {
              const isCompleted = trip.status === 'completed';
              return (
                <div
                  key={trip.id}
                  onClick={() => onSelectTrip(trip)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isCompleted
                      ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                      : 'bg-white dark:bg-[#10192A] border-[#E1E6F0] dark:border-[#243248] shadow-sm hover:border-[#29B6F6]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-center min-w-[50px] p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-mono-telemetry font-bold text-slate-800 dark:text-slate-200">
                      {trip.scheduledTime}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-headline font-bold text-xs text-[#0F172A] dark:text-white truncate">
                        {trip.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {trip.destinationAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {onDeleteTrip && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTripToDelete(trip.id);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title={t.deleteTrip}
                        aria-label={t.deleteTrip}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                    <ChevronRight size={16} className="text-slate-400 shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEn ? 'No trips scheduled at the moment.' : 'Nenhuma viagem agendada no momento.'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {tripToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setTripToDelete(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-sm p-5 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-[#0F172A] dark:text-white">
                  {t.confirmDeleteTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t.confirmDeleteDesc}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => setTripToDelete(null)}
                >
                  {t.cancelBtn}
                </Button>
                <Button
                  variant="urgent"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    if (tripToDelete && onDeleteTrip) {
                      onDeleteTrip(tripToDelete);
                    }
                    setTripToDelete(null);
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
  );
};
