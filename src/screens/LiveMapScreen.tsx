// Source: Google Maps Platform Code Assist
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TripEvent, UserProfile, AppLanguage } from '../types';
import { GoogleMapView } from '../components/GoogleMapView';
import { PlacesAutocompleteInput, PlaceResult } from '../components/PlacesAutocompleteInput';
import { Button } from '../components/UIComponents';
import {
  MapPin,
  Navigation,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Car,
  Activity,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Plus,
  RefreshCw,
  Mic,
  Gauge,
  Compass,
} from 'lucide-react';
import { translations } from '../i18n';
import { formatDuration } from '../utils/formatTime';

interface LiveMapScreenProps {
  trips: TripEvent[];
  profile: UserProfile;
  currentTime?: Date;
  onSelectTrip: (trip: TripEvent) => void;
  onOpenVoiceHUD: (trip?: TripEvent) => void;
  onOpenNewTrip: () => void;
  onMarkDeparted: (tripId: string) => void;
  onDeleteTrip?: (tripId: string) => void;
  language?: AppLanguage;
}

export const LiveMapScreen: React.FC<LiveMapScreenProps> = ({
  trips,
  profile,
  currentTime = new Date(),
  onSelectTrip,
  onOpenVoiceHUD,
  onOpenNewTrip,
  onMarkDeparted,
  language = 'pt',
}) => {
  const isEn = language === 'en';
  const t = translations[language];

  // Active trip selection
  const [selectedTripId, setSelectedTripId] = useState<string>(
    trips.length > 0 ? (trips.find((t) => t.status === 'upcoming')?.id || trips[0].id) : ''
  );

  // Sync selected trip when trips change
  useEffect(() => {
    if (trips.length > 0) {
      if (!trips.some((t) => t.id === selectedTripId)) {
        const upcoming = trips.find((t) => t.status === 'upcoming') || trips[0];
        setSelectedTripId(upcoming.id);
      }
    } else {
      setSelectedTripId('');
    }
  }, [trips, selectedTripId]);

  // Route Simulator State for when user wants to test custom A -> B or has no trips
  const [simOrigin, setSimOrigin] = useState<PlaceResult>({
    name: 'Avenida da Liberdade',
    address: 'Avenida da Liberdade 245, Lisboa',
    lat: 38.7223,
    lng: -9.1485,
  });
  const [simDest, setSimDest] = useState<PlaceResult>({
    name: 'Aeroporto de Lisboa',
    address: 'Aeroporto Humberto Delgado, Lisboa',
    lat: 38.7756,
    lng: -9.1354,
  });
  const [simOriginText, setSimOriginText] = useState(simOrigin.address);
  const [simDestText, setSimDestText] = useState(simDest.address);
  const [simScheduledTime, setSimScheduledTime] = useState('16:00');
  const [simBufferMin, setSimBufferMin] = useState(12);

  const activeTrip = trips.find((t) => t.id === selectedTripId);

  // Determine current active coordinates and details (from trip or simulator)
  const originCoords = activeTrip?.originCoordinates || { lat: simOrigin.lat, lng: simOrigin.lng };
  const destCoords = activeTrip?.destinationCoordinates || { lat: simDest.lat, lng: simDest.lng };
  const originAddress = activeTrip?.originAddress || simOrigin.address;
  const destAddress = activeTrip?.destinationAddress || simDest.address;
  const clientOrTitle = activeTrip?.title || (isEn ? 'Custom Transit Route' : 'Trajeto Personalizado A → B');
  const scheduledTimeStr = activeTrip?.scheduledTime || simScheduledTime;
  const smartBuffer = activeTrip?.smartBufferMin ?? simBufferMin;

  // Real-time calculation of distance & travel time via haversine + road factor
  const computeRouteMetrics = () => {
    const R = 6371;
    const dLat = (destCoords.lat - originCoords.lat) * (Math.PI / 180);
    const dLon = (destCoords.lng - originCoords.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(originCoords.lat * (Math.PI / 180)) *
        Math.cos(destCoords.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDist = R * c;
    const roadDist = Math.max(1.2, Number((straightDist * 1.35).toFixed(1)));
    const minutes = Math.max(5, Math.round(roadDist * 2.2));
    return { roadDist, minutes };
  };

  const { roadDist, minutes: travelMinutes } = computeRouteMetrics();
  const currentDistanceKm = activeTrip?.distanceKm || roadDist;
  const currentTravelTimeMin = activeTrip?.travelTimeMin || travelMinutes;

  // Parse scheduled time and calculate real-time punctuality
  const calculatePunctuality = () => {
    const [schedH, schedM] = scheduledTimeStr.split(':').map(Number);
    if (isNaN(schedH) || isNaN(schedM)) {
      return {
        status: 'on-time' as const,
        label: isEn ? 'ON TIME' : 'NO HORÁRIO',
        color: 'sky',
        etaStr: '15:15',
        diffMin: 0,
        desc: isEn ? 'Punctual arrival expected' : 'Chegada pontual prevista',
      };
    }

    const scheduledDate = new Date(currentTime);
    scheduledDate.setHours(schedH, schedM, 0, 0);

    // If scheduled time already passed for today, assume next cycle
    if (scheduledDate.getTime() < currentTime.getTime() - 2 * 60 * 60 * 1000) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    // ETA = currentTime + travelTimeMin
    const etaDate = new Date(currentTime.getTime() + currentTravelTimeMin * 60 * 1000);
    const diffMs = scheduledDate.getTime() - etaDate.getTime();
    const diffMin = Math.round(diffMs / (60 * 1000));

    const etaH = String(etaDate.getHours()).padStart(2, '0');
    const etaM = String(etaDate.getMinutes()).padStart(2, '0');
    const etaStr = `${etaH}:${etaM}`;

    // Minutes left until scheduled time
    const minutesLeftToSched = Math.round((scheduledDate.getTime() - currentTime.getTime()) / (60 * 1000));

    if (diffMin < 0) {
      // Late: ETA is after scheduled meeting time!
      const lateBy = Math.abs(diffMin);
      return {
        status: 'late' as const,
        label: isEn ? 'LATE' : 'ATRASADO',
        color: 'rose',
        etaStr,
        diffMin,
        minutesLeftToSched,
        desc: isEn
          ? `ETA ${etaStr} (${lateBy}m after scheduled meeting)`
          : `ETA às ${etaStr} (${lateBy}m após o início da reunião)`,
      };
    } else if (diffMin >= smartBuffer) {
      // With safety margin / early
      return {
        status: 'early' as const,
        label: isEn ? 'SAFE MARGIN' : 'COM FOLGA',
        color: 'emerald',
        etaStr,
        diffMin,
        minutesLeftToSched,
        desc: isEn
          ? `Arrival at ${etaStr} (+${diffMin}m protected safety buffer)`
          : `Chegada às ${etaStr} (+${diffMin}m de margem protegida)`,
      };
    } else {
      // On time
      return {
        status: 'on-time' as const,
        label: isEn ? 'ON TIME' : 'NO HORÁRIO',
        color: 'sky',
        etaStr,
        diffMin,
        minutesLeftToSched,
        desc: isEn
          ? `Arrival at ${etaStr} (Within scheduled departure window)`
          : `Chegada às ${etaStr} (Dentro da janela de partida)`,
      };
    }
  };

  const punctuality = calculatePunctuality();

  // Traffic Telemetry
  const traffic = {
    condition: activeTrip?.trafficCondition || 'moderate',
    congestionPct: activeTrip?.trafficCondition === 'heavy' ? 82 : activeTrip?.trafficCondition === 'moderate' ? 48 : 18,
    avgSpeedKmh: activeTrip?.trafficCondition === 'heavy' ? 24 : activeTrip?.trafficCondition === 'moderate' ? 38 : 55,
    delayNotice: activeTrip?.trafficCondition === 'heavy' ? '+14 min' : activeTrip?.trafficCondition === 'moderate' ? '+5 min' : '0 min',
  };

  return (
    <div className="space-y-4 pb-4">
      {/* SCREEN HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/70 text-[#0284C7] dark:text-[#38BDF8] font-mono-telemetry text-[9px] font-bold uppercase tracking-wider">
              GOOGLE MAPS PLATFORM
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="font-headline font-bold text-xl text-[#0F172A] dark:text-white mt-1">
            {isEn ? 'Live Transit Radar' : 'Radar de Trajeto em Tempo Real'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isEn
              ? 'Real-time telemetry, path calculation from A to B & smart punctuality.'
              : 'Telemetria ao vivo, traçado de A para B e controlo de pontualidade.'}
          </p>
        </div>

        <button
          onClick={onOpenNewTrip}
          className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#29B6F6] text-white shadow-md shadow-[#29B6F6]/20 active:scale-95 transition-all"
          title={t.newTripBtn}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* TRIP SELECTOR CHIPS IF MULTIPLE TRIPS EXIST */}
      {trips.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {trips.map((tr) => {
            const isSelected = tr.id === selectedTripId;
            return (
              <button
                key={tr.id}
                onClick={() => setSelectedTripId(tr.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono-telemetry font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0284C7] text-white shadow-sm'
                    : 'bg-white dark:bg-[#10192A] text-slate-600 dark:text-slate-300 border border-[#E1E6F0] dark:border-[#243248] hover:border-slate-300'
                }`}
              >
                <MapPin size={12} className={isSelected ? 'text-white' : 'text-[#0284C7]'} />
                <span>{tr.title.length > 20 ? `${tr.title.slice(0, 20)}...` : tr.title}</span>
                <span className="text-[10px] opacity-80">({tr.scheduledTime})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* INTERACTIVE GOOGLE MAP CANVAS WITH PATH FROM A TO B */}
      <div className="relative rounded-3xl overflow-hidden border border-[#E1E6F0] dark:border-[#243248] shadow-md">
        <GoogleMapView
          origin={{ lat: originCoords.lat, lng: originCoords.lng, title: originAddress }}
          destination={{ lat: destCoords.lat, lng: destCoords.lng, title: destAddress }}
          height="300px"
          zoom={12}
          theme={profile.theme}
          showTraffic={true}
        />

        {/* FLOATING PUNCTUALITY STATUS OVERLAY ON THE MAP */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div
            className={`px-3 py-1.5 rounded-2xl backdrop-blur-md border shadow-lg flex items-center gap-2 pointer-events-auto transition-all ${
              punctuality.status === 'late'
                ? 'bg-rose-950/85 border-rose-500/50 text-rose-200'
                : punctuality.status === 'early'
                ? 'bg-emerald-950/85 border-emerald-500/50 text-emerald-200'
                : 'bg-sky-950/85 border-sky-500/50 text-sky-200'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full animate-ping ${
                punctuality.status === 'late'
                  ? 'bg-rose-400'
                  : punctuality.status === 'early'
                  ? 'bg-emerald-400'
                  : 'bg-[#38BDF8]'
              }`}
            />
            <div>
              <span className="font-mono-telemetry text-[11px] font-bold uppercase tracking-wider block">
                {punctuality.label} // {punctuality.desc}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TELEMETRY DASHBOARD CARD */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm space-y-4">
        {/* Origin -> Destination Trip Details */}
        <div className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-mono-telemetry text-[10px] uppercase font-bold text-slate-400">
              {isEn ? 'ACTIVE ROUTE TRAJECTORY' : 'TRAJETÓRIA DO TRAJETO'}
            </span>
            <span className="font-mono-telemetry text-xs font-bold text-[#0284C7] dark:text-[#38BDF8]">
              {clientOrTitle}
            </span>
          </div>

          <div className="space-y-2">
            {/* Origin (A) */}
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center shrink-0 mt-0.5 font-mono-telemetry text-[10px] font-bold">
                A
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-mono-telemetry text-[10px] text-slate-400 uppercase block">
                  {isEn ? 'Departure (Origin)' : 'Partida (Origem)'}
                </span>
                <p className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">
                  {originAddress}
                </p>
              </div>
            </div>

            {/* Destination (B) */}
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950 text-[#FF6B57] flex items-center justify-center shrink-0 mt-0.5 font-mono-telemetry text-[10px] font-bold">
                B
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-mono-telemetry text-[10px] text-slate-400 uppercase block">
                  {isEn ? 'Destination (Meeting)' : 'Destino (Reunião)'}
                </span>
                <p className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">
                  {destAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TIME LEFT & ETA GRID */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-mono-telemetry text-[9px] uppercase text-slate-400 block font-semibold">
              {isEn ? 'Travel Time' : 'Tempo Viagem'}
            </span>
            <span className="font-mono-telemetry font-bold text-sm text-[#0F172A] dark:text-white mt-0.5 block">
              {formatDuration(currentTravelTimeMin)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono-telemetry">
              {currentDistanceKm} km
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-900">
            <span className="font-mono-telemetry text-[9px] uppercase text-[#0284C7] dark:text-[#38BDF8] block font-semibold">
              {isEn ? 'Arrival ETA' : 'Chegada ETA'}
            </span>
            <span className="font-mono-telemetry font-bold text-sm text-[#0284C7] dark:text-[#38BDF8] mt-0.5 block">
              {punctuality.etaStr}
            </span>
            <span className="text-[10px] text-sky-700 dark:text-sky-300 font-mono-telemetry font-medium">
              {punctuality.diffMin >= 0 ? `+${punctuality.diffMin}m margem` : `${punctuality.diffMin}m atraso`}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-mono-telemetry text-[9px] uppercase text-slate-400 block font-semibold">
              {isEn ? 'Meeting Start' : 'Hora Reunião'}
            </span>
            <span className="font-mono-telemetry font-bold text-sm text-[#0F172A] dark:text-white mt-0.5 block">
              {scheduledTimeStr}
            </span>
            <span className="text-[10px] text-slate-400 font-mono-telemetry">
              +{formatDuration(smartBuffer)}
            </span>
          </div>
        </div>

        {/* TRAFFIC TELEMETRY METERS */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-mono-telemetry">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-semibold">
              <Activity size={14} className="text-[#0284C7]" />
              {isEn ? 'Road Congestion Index' : 'Índice de Congestionamento'}
            </span>
            <span
              className={`font-bold ${
                traffic.congestionPct > 70
                  ? 'text-rose-500'
                  : traffic.congestionPct > 35
                  ? 'text-amber-500'
                  : 'text-emerald-500'
              }`}
            >
              {traffic.congestionPct}% ({traffic.delayNotice})
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                traffic.congestionPct > 70
                  ? 'bg-rose-500'
                  : traffic.congestionPct > 35
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${traffic.congestionPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
            <span>{isEn ? 'Estimated Speed:' : 'Velocidade Média:'} {traffic.avgSpeedKmh} km/h</span>
            <span>{isEn ? 'Telemetry:' : 'Telemetria:'} Google Maps Live</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {activeTrip ? (
            <>
              <Button
                variant="primary"
                size="sm"
                icon={<Navigation size={14} />}
                onClick={() => onMarkDeparted(activeTrip.id)}
              >
                {t.departNow}
              </Button>
              <Button
                variant="urgent"
                size="sm"
                icon={<Mic size={14} />}
                onClick={() => onOpenVoiceHUD(activeTrip)}
              >
                {t.voiceAlert}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={onOpenNewTrip}
                className="col-span-2"
              >
                {isEn ? 'Add Trip to Agenda' : 'Adicionar Trajeto à Agenda'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* QUICK ROUTE TESTING SIMULATOR (WITH REAL GOOGLE MAPS PLACES SEARCH) */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono-telemetry text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Compass size={15} className="text-[#0284C7]" />
            {isEn ? 'Test Any Custom Route with Google Maps' : 'Simular Outro Trajeto com Google Maps'}
          </span>
          <span className="text-[10px] font-mono-telemetry text-slate-400">
            {isEn ? 'Places API Active' : 'Places API Ativo'}
          </span>
        </div>

        <div className="space-y-3">
          <PlacesAutocompleteInput
            label={isEn ? 'Custom Departure (Point A)' : 'Partida Personalizada (Ponto A)'}
            placeholder={isEn ? 'Type departure place or address...' : 'Digite morada ou local de saída...'}
            value={simOriginText}
            language={language}
            onChange={setSimOriginText}
            onSelectPlace={(place) => {
              setSimOrigin(place);
              setSimOriginText(place.address);
            }}
            icon={<MapPin size={16} className="text-[#0284C7]" />}
          />

          <PlacesAutocompleteInput
            label={isEn ? 'Custom Destination (Point B)' : 'Destino Personalizado (Ponto B)'}
            placeholder={isEn ? 'Type destination place or address...' : 'Digite morada ou local de destino...'}
            value={simDestText}
            language={language}
            onChange={setSimDestText}
            onSelectPlace={(place) => {
              setSimDest(place);
              setSimDestText(place.address);
            }}
            icon={<MapPin size={16} className="text-[#FF6B57]" />}
          />
        </div>
      </div>
    </div>
  );
};
