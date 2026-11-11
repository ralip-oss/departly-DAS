import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TripEvent } from '../types';
import {
  Search,
  Clock,
  MapPin,
  Calendar,
  X,
  History,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Navigation,
} from 'lucide-react';
import { FilterChip, Button } from '../components/UIComponents';
import { AppLanguage } from '../types';
import { translations } from '../i18n';

interface SearchScreenProps {
  trips: TripEvent[];
  onSelectTrip: (trip: TripEvent) => void;
  onOpenVoiceHUD: (trip: TripEvent) => void;
  language?: AppLanguage;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  trips,
  onSelectTrip,
  onOpenVoiceHUD,
  language = 'pt',
}) => {
  const t = translations[language];
  const [query, setQuery] = useState('');
  const [selectedChip, setSelectedChip] = useState<'all' | 'traffic' | 'today' | 'buffers'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const handleClearRecent = () => setRecentSearches([]);

  const handleChipClick = (chip: 'all' | 'traffic' | 'today' | 'buffers') => {
    setSelectedChip(chip);
  };

  const filteredResults = trips.filter((trip) => {
    const matchesText =
      trip.title.toLowerCase().includes(query.toLowerCase()) ||
      trip.clientName.toLowerCase().includes(query.toLowerCase()) ||
      trip.destinationAddress.toLowerCase().includes(query.toLowerCase()) ||
      (trip.notes && trip.notes.toLowerCase().includes(query.toLowerCase()));

    if (!matchesText && query.trim() !== '') return false;

    if (selectedChip === 'traffic') {
      return trip.trafficCondition === 'heavy' || trip.trafficCondition === 'incident';
    }
    if (selectedChip === 'buffers') {
      return trip.calendarBlockInjected;
    }
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      {/* Header */}
      <div>
        <span className="font-mono-telemetry text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-wider block">
          {language === 'en' ? 'INTELLIGENT SEARCH ENGINE' : 'CENTRAL DE PESQUISA INTELIGENTE'}
        </span>
        <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#0F172A] dark:text-white mt-1">
          {t.searchTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t.searchSubtitle}
        </p>
      </div>

      {/* Main Search Input Bar with Floating Effect */}
      <div className="relative">
        <div className="relative flex items-center min-h-[56px] px-4 rounded-2xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm focus-within:border-[#29B6F6] focus-within:ring-3 focus-within:ring-[#29B6F6]/20 transition-all">
          <Search size={20} className="text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchInputPlaceholder}
            className="w-full bg-transparent text-sm font-body text-[#0F172A] dark:text-white outline-none placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <FilterChip
          label={t.allTrips}
          count={trips.length}
          active={selectedChip === 'all'}
          onClick={() => handleChipClick('all')}
        />
        <FilterChip
          label={t.trafficAlerts}
          count={trips.filter((t) => t.trafficCondition === 'heavy').length}
          active={selectedChip === 'traffic'}
          onClick={() => handleChipClick('traffic')}
        />
        <FilterChip
          label={t.blockInjected}
          count={trips.filter((t) => t.calendarBlockInjected).length}
          active={selectedChip === 'buffers'}
          onClick={() => handleChipClick('buffers')}
        />
      </div>

      {/* Recent Searches Row (if query is empty) */}
      {query === '' && recentSearches.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono-telemetry font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <History size={14} />
              {t.recentSearchesTitle}
            </span>
            <button
              onClick={handleClearRecent}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[11px]"
            >
              {t.clearHistoryBtn}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {recentSearches.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(item)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-[#E1F5FE] hover:text-[#0284C7] transition-colors flex items-center gap-1.5"
              >
                <span>{item}</span>
                <ArrowRight size={12} className="opacity-50" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono-telemetry text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            {filteredResults.length} {t.resultsFound}
          </span>
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] text-center">
            <p className="font-headline font-bold text-slate-700 dark:text-slate-300">
              {t.noResultsTitle} {query ? `("${query}")` : ''}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {t.noResultsDesc}
            </p>
          </div>
        ) : (
          filteredResults.map((trip) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onSelectTrip(trip)}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm hover:border-[#29B6F6] cursor-pointer transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="p-2.5 rounded-xl bg-[#EBF1F9] dark:bg-[#1E293B] text-[#0284C7] shrink-0">
                  <Calendar size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-headline font-bold text-sm text-[#0F172A] dark:text-white truncate">
                      {trip.title}
                    </h4>
                    <span className="font-mono-telemetry text-[11px] font-bold text-[#0284C7] dark:text-[#38BDF8] shrink-0">
                      {trip.scheduledTime}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin size={12} className="text-[#29B6F6] shrink-0" />
                    <span>{trip.destinationAddress}</span>
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono-telemetry mt-1">
                    <span>{language === 'en' ? 'Client' : 'Cliente'}: {trip.clientName}</span>
                    <span>·</span>
                    <span>{language === 'en' ? 'Departure' : 'Saída'}: {trip.departureTime}</span>
                  </div>
                </div>
              </div>

              <ChevronRight size={18} className="text-slate-400 shrink-0" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
