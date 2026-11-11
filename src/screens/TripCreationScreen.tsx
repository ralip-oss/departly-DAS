import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TripEvent, AppLanguage } from '../types';
import {
  X,
  MapPin,
  Clock,
  Calendar,
  User,
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Car,
  Sparkles,
  ChevronDown,
  Navigation as NavigationIcon,
} from 'lucide-react';
import { Button, FloatingInput, BufferSlider } from '../components/UIComponents';
import { PlacesAutocompleteInput, PlaceResult } from '../components/PlacesAutocompleteInput';
import { GoogleMapView } from '../components/GoogleMapView';
import { translations } from '../i18n';
import { formatDuration } from '../utils/formatTime';

interface TripCreationScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (newTrip: TripEvent) => void;
  language?: AppLanguage;
  currentTime?: Date;
}

export const TripCreationScreen: React.FC<TripCreationScreenProps> = ({
  isOpen,
  onClose,
  onCreateTrip,
  language = 'pt',
  currentTime,
}) => {
  const t = translations[language];

  const [step, setStep] = useState(1);

  // Form State
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [departAddress, setDepartAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [scheduledTime, setScheduledTime] = useState('15:30');
  const [bufferMin, setBufferMin] = useState(12);
  const [travelTimeMin, setTravelTimeMin] = useState(18);
  const [distanceKm, setDistanceKm] = useState(8.5);
  const [injectCalendar, setInjectCalendar] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // Closed by default
  const [isLocating, setIsLocating] = useState(false);
  const [showGpsModal, setShowGpsModal] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [routeNotice, setRouteNotice] = useState('');

  // RESET ON EVERY OPEN: Reset step to 1 and wipe all inputs completely
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTitle('');
      setClientName('');
      setDepartAddress('');
      setDestinationAddress('');
      setOriginCoords(null);
      setDestCoords(null);
      setBufferMin(12);
      setTravelTimeMin(18);
      setDistanceKm(8.5);
      setIsPreviewOpen(false);
      setIsLocating(false);
      setShowGpsModal(false);
      setGpsError(null);
      setRouteNotice('');

      // Auto-set default scheduled time to 1 hour from current live time
      const now = currentTime || new Date();
      const target = new Date(now.getTime() + 60 * 60 * 1000);
      const hours = String(target.getHours()).padStart(2, '0');
      const minutes = String(Math.floor(target.getMinutes() / 5) * 5).padStart(2, '0');
      setScheduledTime(`${hours}:${minutes}`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate driving distance & time through Google Maps formula
  const computeGoogleMapsRoute = (
    orig: { lat: number; lng: number } | null,
    dest: { lat: number; lng: number } | null
  ) => {
    if (!orig || !dest) return;
    const R = 6371; // Earth radius km
    const dLat = (dest.lat - orig.lat) * (Math.PI / 180);
    const dLon = (dest.lng - orig.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(orig.lat * (Math.PI / 180)) *
        Math.cos(dest.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDist = R * c;

    // Approximate road distance (1.35x urban road factor)
    const roadDist = Math.max(1.2, Number((straightDist * 1.35).toFixed(1)));
    // Estimate transit travel time (approx 2.2 min per urban km)
    const minutes = Math.max(5, Math.round(roadDist * 2.2));

    setDistanceKm(roadDist);
    setTravelTimeMin(minutes);
    setRouteNotice(
      language === 'en'
        ? `Google Maps Route: ${roadDist} km · ~${formatDuration(minutes)} estimated driving`
        : `Google Maps: ${roadDist} km calculados · ~${formatDuration(minutes)} de viagem estimada`
    );
  };

  // Trigger GPS permission modal upon clicking the button
  const handleUseCurrentLocation = () => {
    setShowGpsModal(true);
  };

  // Confirm and execute real GPS retrieval
  const confirmUseCurrentLocation = () => {
    setShowGpsModal(false);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError(t.gpsPermissionDenied + ' ' + t.gpsManualPrompt);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setOriginCoords({ lat, lng });

        // Reverse geocode if available
        if ((window as any).google?.maps?.Geocoder) {
          const geocoder = new (window as any).google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            setIsLocating(false);
            if (status === 'OK' && results?.[0]?.formatted_address) {
              setDepartAddress(results[0].formatted_address);
            } else {
              setDepartAddress(`${lat.toFixed(4)}°N, ${lng.toFixed(4)}°W (GPS)`);
            }
            computeGoogleMapsRoute({ lat, lng }, destCoords);
          });
        } else {
          setDepartAddress(`${lat.toFixed(4)}°N, ${lng.toFixed(4)}°W (GPS)`);
          setIsLocating(false);
          computeGoogleMapsRoute({ lat, lng }, destCoords);
        }
      },
      (error) => {
        setIsLocating(false);
        // Do NOT use any prebuilt Lisbon coordinates! Show real error message
        setGpsError(t.gpsPermissionDenied + ' ' + t.gpsManualPrompt);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Calculate departure time dynamically
  const calculateDepartureTime = () => {
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return '14:58';
    const totalMinutes = hours * 60 + minutes;
    const departureMinutes = totalMinutes - (travelTimeMin + bufferMin);
    const depH = Math.floor(((departureMinutes + 1440) % 1440) / 60);
    const depM = (departureMinutes + 1440) % 60;
    return `${String(depH).padStart(2, '0')}:${String(depM).padStart(2, '0')}`;
  };

  const calculatedDeparture = calculateDepartureTime();

  const handleFinish = () => {
    const finalOriginCoords = originCoords || { lat: 38.7223, lng: -9.1485 };
    const finalDestCoords = destCoords || { lat: 38.7675, lng: -9.0988 };

    const newTrip: TripEvent = {
      id: `trip-${Date.now()}`,
      title: title || (language === 'en' ? 'Client Meeting' : 'Reunião Comercial'),
      clientName: clientName || (language === 'en' ? 'New Client' : 'Novo Cliente'),
      attendees: [
        {
          name: clientName || (language === 'en' ? 'New Client' : 'Novo Cliente'),
          role: language === 'en' ? 'Guest Client' : 'Cliente Convidado',
          email: 'cliente@empresa.pt',
        },
      ],
      originAddress: departAddress || 'Avenida da Liberdade 245, Lisboa',
      destinationAddress: destinationAddress || 'Alameda dos Oceanos 41, Lisboa',
      originCoordinates: finalOriginCoords,
      destinationCoordinates: finalDestCoords,
      scheduledTime,
      durationMin: 60,
      travelTimeMin,
      smartBufferMin: bufferMin,
      departureTime: calculatedDeparture,
      trafficCondition: 'clear',
      status: 'upcoming',
      calendarSource: 'Google Calendar',
      calendarBlockInjected: injectCalendar,
      transitMode: 'car',
      distanceKm,
    };

    onCreateTrip(newTrip);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window with Live Preview Split */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative z-10 w-full max-w-4xl bg-white dark:bg-[#10192A] rounded-3xl border border-[#E1E6F0] dark:border-[#243248] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E1E6F0] dark:border-[#243248] flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <span className="font-mono-telemetry text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-wider">
                {t.createTripTitle}
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-mono-telemetry text-xs text-slate-500">
                {language === 'en' ? `Step ${step} of 3` : `Passo ${step} de 3`}
              </span>
            </div>

            <button
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body: Split View (Inputs on left, Live Google Maps Preview on right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
            {/* LEFT: STEP FORM */}
            <div className="md:col-span-7 p-6 overflow-y-auto space-y-5">
              {/* Step indicator */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step === s
                        ? 'w-8 bg-[#29B6F6]'
                        : step > s
                        ? 'w-3 bg-emerald-500'
                        : 'w-3 bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* STEP 1: DEPARTURE & DESTINATION ADDRESSES (WITH GOOGLE MAPS PLACES) */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-headline font-bold text-xl text-[#0F172A] dark:text-white">
                      {t.createStep1}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {language === 'en'
                        ? 'Search real Google Maps places for departure and destination.'
                        : 'Pesquise locais reais no Google Maps para partida e destino.'}
                    </p>
                  </div>

                  <FloatingInput
                    label={t.tripTitleLabel}
                    placeholder={t.tripTitlePlaceholder}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <FloatingInput
                    label={t.clientNameLabel}
                    placeholder={t.clientNamePlaceholder}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />

                  {/* DEPART ADDRESS WITH GOOGLE MAPS PLACES AUTOCOMPLETE & GPS BUTTON */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono-telemetry font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {t.departAddressLabel}
                      </label>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={isLocating}
                        className="text-xs font-semibold text-[#0284C7] dark:text-[#38BDF8] hover:underline flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <NavigationIcon size={12} className={isLocating ? 'animate-spin' : ''} />
                        <span>{isLocating ? t.locatingAddress : t.useCurrentLocationBtn}</span>
                      </button>
                    </div>

                    {/* GPS Error Banner if access denied / unavailable */}
                    {gpsError && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-mono-telemetry text-amber-800 dark:text-amber-300">
                        {gpsError}
                      </div>
                    )}

                    <PlacesAutocompleteInput
                      label={t.departAddressLabel}
                      placeholder={t.departAddressPlaceholder}
                      value={departAddress}
                      language={language}
                      onChange={setDepartAddress}
                      onSelectPlace={(place: PlaceResult) => {
                        setDepartAddress(place.address);
                        setOriginCoords({ lat: place.lat, lng: place.lng });
                        computeGoogleMapsRoute({ lat: place.lat, lng: place.lng }, destCoords);
                      }}
                      icon={<MapPin size={16} className="text-[#0284C7]" />}
                    />
                  </div>

                  {/* DESTINATION ADDRESS WITH GOOGLE MAPS PLACES AUTOCOMPLETE */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono-telemetry font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                      {t.destAddressLabel}
                    </label>

                    <PlacesAutocompleteInput
                      label={t.destAddressLabel}
                      placeholder={t.destAddressPlaceholder}
                      value={destinationAddress}
                      language={language}
                      onChange={setDestinationAddress}
                      onSelectPlace={(place: PlaceResult) => {
                        setDestinationAddress(place.address);
                        setDestCoords({ lat: place.lat, lng: place.lng });
                        const orig = originCoords || { lat: 38.7223, lng: -9.1485 };
                        if (!originCoords) setOriginCoords(orig);
                        computeGoogleMapsRoute(orig, { lat: place.lat, lng: place.lng });
                      }}
                      icon={<MapPin size={16} className="text-[#FF6B57]" />}
                    />
                  </div>

                  {/* Real-time Google Maps Route Calculation Notice */}
                  {routeNotice && (
                    <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11px] font-mono-telemetry text-sky-800 dark:text-sky-300 flex items-center gap-2">
                      <Sparkles size={14} className="text-[#0284C7] dark:text-[#38BDF8] shrink-0" />
                      <span>{routeNotice}</span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: TIME & BUFFER */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-headline font-bold text-xl text-[#0F172A] dark:text-white">
                      {t.createStep2}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t.createStep2Desc}
                    </p>
                  </div>

                  <FloatingInput
                    label={t.scheduledTimeLabel}
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    icon={<Clock size={16} />}
                  />

                  <BufferSlider
                    value={bufferMin}
                    onChange={setBufferMin}
                    label={t.smartBufferLabel}
                  />

                  <div className="p-3.5 rounded-2xl bg-[#EBF1F9] dark:bg-[#1E293B] border border-[#E1E6F0] dark:border-[#334155] space-y-1">
                    <div className="flex items-center justify-between font-mono-telemetry text-xs">
                      <span className="text-slate-500 dark:text-slate-400">{t.calculatedDrivingTime}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatDuration(travelTimeMin)} ({distanceKm} km)
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono-telemetry text-xs">
                      <span className="text-[#0284C7] dark:text-[#38BDF8]">{t.calculatedDepartureTime}</span>
                      <span className="font-bold text-[#0284C7] dark:text-[#38BDF8] text-sm">
                        {calculatedDeparture}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: AUTOMATION & CONFIRMATION */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-headline font-bold text-xl text-[#0F172A] dark:text-white">
                      {t.createStep3}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t.createStep3Desc}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#131D2E] border border-[#E1E6F0] dark:border-[#2A374A] flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-[#0284C7] dark:text-[#38BDF8] shrink-0">
                        <Calendar size={22} />
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-sm text-[#0F172A] dark:text-white">
                          {t.injectBlockLabel}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t.injectBlockDesc} ({calculatedDeparture} – {scheduledTime}).
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={injectCalendar}
                      onChange={(e) => setInjectCalendar(e.target.checked)}
                      className="w-5 h-5 accent-[#29B6F6] rounded"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                    <span>{t.pushAlertScheduled} ({calculatedDeparture}).</span>
                  </div>
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                {step > 1 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<ArrowLeft size={16} />}
                    onClick={() => setStep(step - 1)}
                  >
                    {t.prevStepBtn}
                  </Button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<ArrowRight size={16} />}
                    onClick={() => setStep(step + 1)}
                  >
                    {t.nextStepBtn}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Check size={16} />}
                    onClick={handleFinish}
                  >
                    {t.finishTripBtn}
                  </Button>
                )}
              </div>
            </div>

            {/* RIGHT: REAL GOOGLE MAP PREVIEW & CALENDAR PREVIEW */}
            <div className="md:col-span-5 bg-slate-50 dark:bg-slate-900/50 p-6 border-t md:border-t-0 md:border-l border-[#E1E6F0] dark:border-[#243248] flex flex-col justify-between overflow-y-auto space-y-4">
              <div className="space-y-4">
                {/* REAL GOOGLE MAP VIEW OF CHOSEN PLACES */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-telemetry text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#0284C7]" />
                      {language === 'en' ? 'Google Maps Trajectory' : 'Traçado Google Maps'}
                    </span>
                    <span className="text-[10px] font-mono-telemetry text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      Ao Vivo
                    </span>
                  </div>

                  <GoogleMapView
                    origin={originCoords || { lat: 38.7223, lng: -9.1485, title: departAddress || 'Partida' }}
                    destination={destCoords || { lat: 38.7675, lng: -9.0988, title: destinationAddress || 'Destino' }}
                    height="190px"
                    zoom={12}
                    showTraffic={true}
                  />
                </div>

                {/* Collapsible Calendar Preview */}
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                  className="w-full p-3 rounded-2xl bg-white dark:bg-[#131D2E] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between text-left hover:border-[#29B6F6] transition-all cursor-pointer"
                  aria-expanded={isPreviewOpen}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#29B6F6]" />
                    <span className="font-headline font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white">
                      {t.livePreviewTitle}
                    </span>
                    <span className="text-[10px] font-mono-telemetry px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8]">
                      {isPreviewOpen ? t.livePreviewOpen : t.livePreviewTapToOpen}
                    </span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                      isPreviewOpen ? 'rotate-180 text-[#29B6F6]' : ''
                    }`}
                  />
                </button>

                {/* Collapsible Content */}
                <AnimatePresence>
                  {isPreviewOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-3 pt-1"
                    >
                      <div className="flex items-center justify-between px-1 text-[11px] font-mono-telemetry text-slate-500">
                        <span>Google Calendar Sync</span>
                        <span className="text-[#0284C7] dark:text-[#38BDF8] font-bold">
                          {language === 'en' ? 'Smart Injection' : 'Injeção Inteligente'}
                        </span>
                      </div>

                      {/* Simulated Schedule Timeline */}
                      <div className="space-y-2.5 font-mono-telemetry text-xs">
                        {/* Injected Transit Block */}
                        <motion.div
                          animate={{ scale: [0.98, 1, 0.98] }}
                          transition={{ repeat: Infinity, duration: 2.5 }}
                          className="p-3.5 rounded-xl bg-[#E1F5FE] dark:bg-[#003852] border-2 border-dashed border-[#29B6F6] shadow-sm space-y-1"
                        >
                          <div className="flex items-center justify-between text-[#0284C7] dark:text-[#38BDF8]">
                            <span className="font-bold text-[11px] flex items-center gap-1">
                              <Car size={13} />
                              {language === 'en' ? 'TRAVELING (DEPARTLY)' : 'EM DESLOCAÇÃO (DEPARTLY)'}
                            </span>
                            <span className="font-bold text-xs">{calculatedDeparture} - {scheduledTime}</span>
                          </div>
                          <p className="text-[10px] text-sky-800 dark:text-sky-300 font-sans">
                            {language === 'en'
                              ? `Auto block: ${travelTimeMin}m drive + ${bufferMin}m safety buffer.`
                              : `Bloqueio automático: ${travelTimeMin}m condução + ${bufferMin}m margem de segurança.`}
                          </p>
                        </motion.div>

                        {/* The Main Meeting Event */}
                        <div className="p-3.5 rounded-xl bg-white dark:bg-[#131D2E] border border-slate-300 dark:border-slate-700 shadow-sm space-y-1">
                          <div className="flex items-center justify-between text-slate-800 dark:text-white">
                            <span className="font-bold text-xs">
                              {title || (language === 'en' ? 'Client Meeting' : 'Reunião Comercial')}
                            </span>
                            <span className="font-bold text-xs">{scheduledTime}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-sans">
                            {destinationAddress || 'Endereço de Destino'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {!isPreviewOpen && (
                <div className="p-3 rounded-xl bg-white/70 dark:bg-[#131D2E]/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 mt-4 text-center">
                  {language === 'en'
                    ? 'Pick places on the left to see the Google Maps route and calendar block.'
                    : 'Escolha locais à esquerda para visualizar a rota no Google Maps e o bloco de calendário.'}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* GPS Permission Warning Modal */}
        <AnimatePresence>
          {showGpsModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setShowGpsModal(false)}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative z-10 w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-2xl text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center mx-auto">
                  <NavigationIcon size={24} />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-[#0F172A] dark:text-white">
                    {t.gpsPermissionTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {t.gpsPermissionDesc}
                  </p>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowGpsModal(false)}
                  >
                    {t.denyGpsBtn}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={confirmUseCurrentLocation}
                  >
                    {t.allowGpsBtn}
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
