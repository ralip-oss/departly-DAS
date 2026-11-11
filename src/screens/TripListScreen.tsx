import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TripEvent } from '../types';
import {
  Calendar,
  MapPin,
  Clock,
  Car,
  Mic,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Navigation,
  ChevronRight,
  ShieldCheck,
  Compass,
  Trash2,
} from 'lucide-react';
import { Button, FilterChip } from '../components/UIComponents';
import { AppLanguage } from '../types';
import { translations } from '../i18n';
import { formatDuration } from '../utils/formatTime';

interface TripListScreenProps {
  trips: TripEvent[];
  onSelectTrip: (trip: TripEvent) => void;
  onOpenVoiceHUD: (trip: TripEvent) => void;
  onOpenNewTrip: () => void;
  onMarkDeparted: (tripId: string) => void;
  onDeleteTrip?: (tripId: string) => void;
  language?: AppLanguage;
}

export const TripListScreen: React.FC<TripListScreenProps> = ({
  trips,
  onSelectTrip,
  onOpenVoiceHUD,
  onOpenNewTrip,
  onMarkDeparted,
  onDeleteTrip,
  language = 'pt',
}) => {
  const t = translations[language];
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destinationAddress.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'upcoming') return trip.status === 'upcoming';
    if (activeFilter === 'completed') return trip.status === 'completed';
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-4 select-none pb-8">
      {/* Header and Add Action */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="font-mono-telemetry text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-wider block">
            {language === 'en' ? 'OPERATIONAL SCHEDULE // LEAVY ENGINE' : 'AGENDA OPERACIONAL // LEAVY ENGINE'}
          </span>
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#0F172A] dark:text-white mt-1">
            {t.trips}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'en'
              ? 'Real-time traffic monitoring and automated calendar travel block.'
              : 'Monitorização de trânsito em tempo real e bloqueio automático de viagem.'}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={16} />}
          onClick={onOpenNewTrip}
        >
          {t.newTripBtn}
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-2.5">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchInputPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] text-xs font-body text-[#0F172A] dark:text-white placeholder:text-slate-400 outline-none focus:border-[#29B6F6]"
          />
        </div>

        {trips.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <FilterChip
              label={t.allTrips}
              count={trips.length}
              active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
            />
            <FilterChip
              label={t.pendingTrips}
              count={trips.filter((t) => t.status !== 'completed').length}
              active={activeFilter === 'upcoming'}
              onClick={() => setActiveFilter('upcoming')}
            />
            <FilterChip
              label={t.completedTrips}
              count={trips.filter((t) => t.status === 'completed').length}
              active={activeFilter === 'completed'}
              onClick={() => setActiveFilter('completed')}
            />
          </div>
        )}
      </div>

      {/* Trips Cards Stack */}
      <div className="space-y-3">
        {filteredTrips.length === 0 ? (
          <div className="p-8 sm:p-10 text-center rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <Calendar size={28} />
            </div>
            <h3 className="font-headline font-bold text-lg text-slate-800 dark:text-slate-200">
              {language === 'en' ? 'No trips scheduled' : 'Nenhum trajeto agendado'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              {language === 'en'
                ? 'Add a new meeting for Departly to calculate safety buffers and departure times automatically.'
                : 'Adicione um novo compromisso para que o Departly calcule automaticamente a margem de segurança e a hora de partida.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-5 w-full max-w-xs">
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
        ) : (
          filteredTrips.map((trip, idx) => {
            const isCompleted = trip.status === 'completed';
            const isHeavyTraffic =
              trip.trafficCondition === 'heavy' || trip.trafficCondition === 'incident';

            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`relative overflow-hidden p-4 rounded-3xl border transition-all duration-200 ${
                  isCompleted
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
                    : isHeavyTraffic
                    ? 'bg-white dark:bg-[#10192A] border-rose-300 dark:border-rose-900 shadow-md'
                    : 'bg-white dark:bg-[#10192A] border-[#E1E6F0] dark:border-[#243248] shadow-sm hover:border-[#29B6F6]/60'
                }`}
              >
                {/* Traffic alert top edge bar if delayed */}
                {isHeavyTraffic && !isCompleted && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-[#FF6B57]" />
                )}

                <div className="flex flex-col gap-3">
                  {/* Row 1: Time pill & Title */}
                  <div className="flex items-start gap-3">
                    <div className="text-center min-w-[68px] p-2 rounded-2xl bg-[#EBF1F9] dark:bg-[#1E293B] border border-[#E1E6F0] dark:border-[#334155] shrink-0">
                      <span className="font-mono-telemetry font-bold text-sm text-[#0F172A] dark:text-white block">
                        {trip.scheduledTime}
                      </span>
                      <span className="font-mono-telemetry text-[9px] text-[#0284C7] dark:text-[#38BDF8] font-bold block mt-0.5">
                        SAÍDA {trip.departureTime}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3
                          onClick={() => onSelectTrip(trip)}
                          className="font-headline font-bold text-base text-[#0F172A] dark:text-white hover:text-[#0284C7] dark:hover:text-[#38BDF8] cursor-pointer transition-colors truncate"
                        >
                          {trip.title}
                        </h3>
                        {trip.calendarBlockInjected && (
                          <span className="px-1.5 py-0.2 rounded-full font-mono-telemetry text-[9px] bg-sky-50 dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] border border-sky-200 dark:border-sky-800 font-semibold flex items-center gap-0.5">
                            <ShieldCheck size={9} /> BLOCO
                          </span>
                        )}
                        {isHeavyTraffic && (
                          <span className="px-1.5 py-0.2 rounded-full font-mono-telemetry text-[9px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold flex items-center gap-0.5">
                            <AlertTriangle size={9} /> +14m TRÂNSITO
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 truncate">
                        <MapPin size={12} className="text-[#29B6F6] shrink-0" />
                        <span className="truncate">{trip.destinationAddress}</span>
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono-telemetry mt-1">
                        <span>{language === 'en' ? 'Client' : 'Cliente'}: {trip.clientName}</span>
                        <span>·</span>
                        <span>+{formatDuration(trip.smartBufferMin)} {t.margin}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Touch action buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div>
                      {onDeleteTrip && (
                        <button
                          type="button"
                          onClick={() => setTripToDelete(trip.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title={t.deleteTrip}
                          aria-label={t.deleteTrip}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectTrip(trip)}
                        icon={<ChevronRight size={14} />}
                        iconPosition="right"
                      >
                        {t.details}
                      </Button>
                      <Button
                        variant="urgent"
                        size="sm"
                        icon={<Mic size={14} />}
                        onClick={() => onOpenVoiceHUD(trip)}
                      >
                        {t.voicebotBtn}
                      </Button>
                      {!isCompleted && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Navigation size={14} />}
                          onClick={() => onMarkDeparted(trip.id)}
                        >
                          {t.departNow}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
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
              className="relative z-10 w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-[#0F172A] dark:text-white">
                  {t.confirmDeleteTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {t.confirmDeleteDesc}
                </p>
              </div>
              <div className="flex gap-2 pt-1">
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
