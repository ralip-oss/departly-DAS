/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import {
  TripEvent,
  UserProfile,
  TimeOfDay,
  NotificationItem,
  ToastMessage,
  ThemeMode,
} from './types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_TRIPS,
  INITIAL_NOTIFICATIONS,
} from './mockData';
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { TripListScreen } from './screens/TripListScreen';
import { TripDetailModal } from './screens/TripDetailModal';
import { TripCreationScreen } from './screens/TripCreationScreen';
import { SearchScreen } from './screens/SearchScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { ProfileSettingsScreen } from './screens/ProfileSettingsScreen';
import { LiveMapScreen } from './screens/LiveMapScreen';
import { Navigation, NavTab } from './components/Navigation';
import { VoiceAIDispatchHUD } from './components/VoiceAIDispatchHUD';
import { ToastContainer } from './components/UIComponents';
import {
  EmptyStateView,
  LoadingStateView,
  ErrorStateView,
} from './components/StateViews';

// Provisioned Google Maps API Key
const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  'AIzaSyC2Xf1uEQW-AeXj83Yhtaiw_lYWP83uZ3c';

export default function App() {
  // App flow stage: 'splash' | 'onboarding' | 'app'
  const [appStage, setAppStage] = useState<'splash' | 'onboarding' | 'app'>('splash');

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // User Profile: Default Guest Account
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);

  // Trips data: starts empty as requested
  const [trips, setTrips] = useState<TripEvent[]>(INITIAL_TRIPS);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );

  // Active Modals & Overlays
  const [selectedTrip, setSelectedTrip] = useState<TripEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isVoiceHUDOpen, setIsVoiceHUDOpen] = useState(false);
  const [voiceHUDTargetTrip, setVoiceHUDTargetTrip] = useState<TripEvent | null>(null);
  const [isNewTripOpen, setIsNewTripOpen] = useState(false);

  // Demo state switcher ('none' | 'empty' | 'loading' | 'error')
  const [demoState, setDemoState] = useState<'none' | 'empty' | 'loading' | 'error'>('none');

  // Time of Day (Morning, Afternoon, Evening)
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('afternoon');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Maps Quota Exceeded flag (Client-Side Quota Defense)
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Real life live clock updating every second
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Adaptive Theme calculation: Light from 8h to 18h, Dark from 18h to 8h based on real clock
  const resolveTheme = (mode: ThemeMode, date: Date): 'light' | 'dark' => {
    if (mode === 'light') return 'light';
    if (mode === 'dark') return 'dark';
    const hour = date.getHours();
    return hour >= 8 && hour < 18 ? 'light' : 'dark';
  };

  const resolvedTheme = resolveTheme(profile.themeMode, currentTime);

  // Apply dark / light theme to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [resolvedTheme]);

  // Toast trigger helper
  const addToast = (
    title: string,
    description?: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info',
    undoAction?: () => void
  ) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}`,
      title,
      description,
      type,
      undoAction,
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 4));

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle Theme: cycles Light -> Dark -> Adaptive with ZERO toast notification on screen
  const handleToggleTheme = () => {
    setProfile((prev) => {
      const nextMode: ThemeMode =
        prev.themeMode === 'light'
          ? 'dark'
          : prev.themeMode === 'dark'
          ? 'adaptive'
          : 'light';
      return { ...prev, themeMode: nextMode };
    });
    // No toast displayed here, as requested by user!
  };

  // Handler: Mark Trip as Departed
  const handleMarkDeparted = (tripId: string) => {
    const target = trips.find((t) => t.id === tripId);
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? { ...t, status: 'completed' as const }
          : t
      )
    );

    addToast(
      'Partida Confirmada',
      `Iniciou a deslocação para ${target?.destinationAddress || 'o compromisso'}. Janela de segurança respeitada.`,
      'success',
      () => {
        setTrips((prev) =>
          prev.map((t) => (t.id === tripId ? { ...t, status: 'upcoming' as const } : t))
        );
      }
    );
  };

  // Handler: Simulate unexpected traffic incident
  const handleSimulateTrafficIncident = () => {
    const active = trips.find((t) => t.status === 'upcoming') || trips[0];
    if (!active) {
      addToast(
        profile.language === 'en' ? 'No Active Trips' : 'Sem Trajetos Ativos',
        profile.language === 'en'
          ? 'Add a trip first to simulate real-time traffic telemetry.'
          : 'Crie primeiro um trajeto para simular telemetria de trânsito em tempo real.',
        'info'
      );
      setIsNewTripOpen(true);
      return;
    }

    setTrips((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? {
              ...t,
              trafficCondition: 'heavy' as const,
              delayOffsetMin: 14,
              notes: 'Incidente grave reportado no Eixo Norte-Sul (+14m retenção)',
            }
          : t
      )
    );

    addToast(
      'Alerta: Retenção Severa Detetada (+14m)',
      'O tráfego aumentou abruptamente. O assistente de voz sugere avisar os clientes com nova previsão de chegada.',
      'warning'
    );

    setTimeout(() => {
      setVoiceHUDTargetTrip(active);
      setIsVoiceHUDOpen(true);
    }, 600);
  };

  // Handler: Create New Trip
  const handleCreateTrip = (newTrip: TripEvent) => {
    setTrips((prev) => [newTrip, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      timestamp: 'Agora',
      dateGroup: 'Hoje',
      title: 'Novo Bloco de Deslocação Injetado',
      message: `O Departly bloqueou o período ${newTrip.departureTime} – ${newTrip.scheduledTime} no Google Calendar para a reunião "${newTrip.title}".`,
      type: 'success',
      read: false,
      tripId: newTrip.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addToast(
      'Trajeto & Bloco Injetados com Sucesso',
      `Hora ideal de saída calculada para as ${newTrip.departureTime} com +${newTrip.smartBufferMin}m de margem.`,
      'success'
    );
  };

  // Handler: Delete Trip
  const handleDeleteTrip = (tripId: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    if (selectedTrip?.id === tripId) {
      setSelectedTrip(null);
      setIsDetailOpen(false);
    }
    addToast(
      profile.language === 'en' ? 'Trip Deleted' : 'Trajeto Eliminado',
      profile.language === 'en'
        ? 'The trip and its calendar block reservation have been removed.'
        : 'O trajeto e o respetivo bloco do calendário foram removidos.',
      'info'
    );
  };

  // Handler: Update smart buffer for a specific trip
  const handleUpdateBuffer = (tripId: string, newBuffer: number) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          const [h, m] = t.scheduledTime.split(':').map(Number);
          const totalMin = h * 60 + m;
          const depMin = totalMin - (t.travelTimeMin + newBuffer);
          const depH = Math.floor((depMin + 1440) % 1440 / 60);
          const depM = (depMin + 1440) % 60;
          const calculatedDeparture = `${String(depH).padStart(2, '0')}:${String(depM).padStart(2, '0')}`;
          return {
            ...t,
            smartBufferMin: newBuffer,
            departureTime: calculatedDeparture,
          };
        }
        return t;
      })
    );

    addToast(
      'Margem Atualizada',
      `Nova hora de partida recalculada para garantir +${newBuffer} minutos de antecipação.`,
      'info'
    );
  };

  // Handler: Voice AI Dispatch completed
  const handleVoiceDispatchSuccess = (
    tripId: string,
    delayMin: number,
    message: string
  ) => {
    const target = trips.find((t) => t.id === tripId);
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      timestamp: 'Agora',
      dateGroup: 'Hoje',
      title: `Aviso IA Enviado a ${target?.clientName || 'Cliente'}`,
      message: `E-mail de atraso contextualizado (+${delayMin}m) transmitido com nova chegada às 14:44. Imagem profissional preservada.`,
      type: 'info',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addToast(
      'Aviso de Atraso Enviado com Sucesso',
      `O cliente ${target?.clientName || ''} foi notificado da nova estimativa de chegada.`,
      'success'
    );
  };

  // Stage 1: Splash Screen
  if (appStage === 'splash') {
    return (
      <SplashScreen
        onComplete={() => setAppStage('onboarding')}
        onSkipToDashboard={() => setAppStage('app')}
      />
    );
  }

  // Stage 2: Onboarding in 3 steps
  if (appStage === 'onboarding') {
    return (
      <OnboardingScreen
        initialProfile={{ ...profile, theme: resolvedTheme }}
        onComplete={(updated) => {
          setProfile((p) => ({ ...p, ...updated }));
          setAppStage('app');
          addToast(
            'Configuração Concluída',
            'O Departly está ativo e pronto para adicionar as suas deslocações.',
            'success'
          );
        }}
        onSkip={() => setAppStage('app')}
      />
    );
  }

  // Stage 3: Phone-First Centered Application wrapped in Google Maps APIProvider
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places', 'routes', 'geometry', 'marker']}>
      <div className="min-h-screen w-full bg-slate-100/70 dark:bg-[#030712] flex items-center justify-center p-0 sm:py-6 sm:px-4 antialiased transition-colors duration-200">
        {/* Phone Shell / Device Frame Container */}
        <div className="w-full max-w-[440px] min-h-screen sm:min-h-[844px] bg-[#F5F7FB] dark:bg-[#070D18] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col relative sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-slate-200/80 sm:dark:border-slate-800/80 overflow-hidden transition-colors duration-200">
          
          {/* Quota Exceeded Sticky Notice if triggered */}
          {mapsQuotaExceeded && (
            <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-3.5 py-2 text-xs text-center sticky top-0 z-50 shadow-sm">
              <span>
                Google Maps Platform quota reached. If you are the app owner, visit{' '}
                <a
                  href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold text-amber-950 hover:text-amber-800"
                >
                  maps developer site
                </a>{' '}
                for instructions to update your account.
              </span>
            </div>
          )}

          {/* Phone Top Header with Theme Switcher, Brand & Notifications */}
          <Navigation
            currentTab={currentTab}
            onTabChange={(tab) => {
              setCurrentTab(tab);
              setDemoState('none');
            }}
            onOpenVoiceHUD={() => {
              const active = trips.find((t) => t.status === 'upcoming') || trips[0];
              setVoiceHUDTargetTrip(active || null);
              setIsVoiceHUDOpen(true);
            }}
            onOpenNewTrip={() => setIsNewTripOpen(true)}
            unreadNotificationsCount={notifications.filter((n) => !n.read).length}
            timeOfDay={timeOfDay}
            theme={resolvedTheme}
            themeMode={profile.themeMode}
            language={profile.language}
            currentTime={currentTime}
            onToggleTheme={handleToggleTheme}
          />

          {/* Scrollable Phone Screen Content Area */}
          <main className="flex-1 overflow-y-auto px-4 py-4 pb-28">
            {/* DEMO STATE OVERRIDES */}
            {demoState === 'loading' && <LoadingStateView />}

            {demoState === 'empty' && (
              <EmptyStateView
                onAddTrip={() => setIsNewTripOpen(true)}
              />
            )}

            {demoState === 'error' && (
              <ErrorStateView onRetry={() => setDemoState('none')} />
            )}

            {/* NORMAL ACTIVE TABS */}
            {demoState === 'none' && (
              <>
                {currentTab === 'dashboard' && (
                  <DashboardScreen
                    profile={{ ...profile, theme: resolvedTheme }}
                    trips={trips}
                    timeOfDay={timeOfDay}
                    onSelectTrip={(trip) => {
                      setSelectedTrip(trip);
                      setIsDetailOpen(true);
                    }}
                    onOpenVoiceHUD={(trip) => {
                      setVoiceHUDTargetTrip(trip || trips[0] || null);
                      setIsVoiceHUDOpen(true);
                    }}
                    onOpenNewTrip={() => setIsNewTripOpen(true)}
                    onMarkDeparted={handleMarkDeparted}
                    onSimulateTrafficIncident={handleSimulateTrafficIncident}
                    onDeleteTrip={handleDeleteTrip}
                    currentTime={currentTime}
                  />
                )}

                {currentTab === 'trips' && (
                  <TripListScreen
                    trips={trips}
                    onSelectTrip={(trip) => {
                      setSelectedTrip(trip);
                      setIsDetailOpen(true);
                    }}
                    onOpenVoiceHUD={(trip) => {
                      setVoiceHUDTargetTrip(trip);
                      setIsVoiceHUDOpen(true);
                    }}
                    onOpenNewTrip={() => setIsNewTripOpen(true)}
                    onMarkDeparted={handleMarkDeparted}
                    onDeleteTrip={handleDeleteTrip}
                    language={profile.language}
                  />
                )}

                {currentTab === 'search' && (
                  <SearchScreen
                    trips={trips}
                    onSelectTrip={(trip) => {
                      setSelectedTrip(trip);
                      setIsDetailOpen(true);
                    }}
                    onOpenVoiceHUD={(trip) => {
                      setVoiceHUDTargetTrip(trip);
                      setIsVoiceHUDOpen(true);
                    }}
                    language={profile.language}
                  />
                )}

                {currentTab === 'notifications' && (
                  <NotificationsScreen
                    notifications={notifications}
                    onMarkAllAsRead={() => {
                      setNotifications((prev) =>
                        prev.map((n) => ({ ...n, read: true }))
                      );
                      addToast(
                        profile.language === 'en'
                          ? 'Notifications Marked as Read'
                          : 'Notificações Marcadas como Lidas',
                        undefined,
                        'info'
                      );
                    }}
                    onNotificationAction={(notif) => {
                      if (notif.tripId) {
                        const match = trips.find((t) => t.id === notif.tripId);
                        if (match) {
                          setSelectedTrip(match);
                          setIsDetailOpen(true);
                        }
                      } else {
                        setCurrentTab('trips');
                      }
                    }}
                    language={profile.language}
                  />
                )}

                {currentTab === 'profile' && (
                  <ProfileSettingsScreen
                    profile={{ ...profile, theme: resolvedTheme }}
                    onUpdateProfile={(updated) =>
                      setProfile((prev) => ({ ...prev, ...updated }))
                    }
                    timeOfDay={timeOfDay}
                    onChangeTimeOfDay={(tod) => setTimeOfDay(tod)}
                    onToggleDemoState={(st) => setDemoState(st)}
                    currentDemoState={demoState}
                  />
                )}

                {currentTab === 'liveMap' && (
                  <LiveMapScreen
                    trips={trips}
                    profile={{ ...profile, theme: resolvedTheme }}
                    currentTime={currentTime}
                    onSelectTrip={(trip) => {
                      setSelectedTrip(trip);
                      setIsDetailOpen(true);
                    }}
                    onOpenVoiceHUD={(trip) => {
                      setVoiceHUDTargetTrip(trip || trips[0] || null);
                      setIsVoiceHUDOpen(true);
                    }}
                    onOpenNewTrip={() => setIsNewTripOpen(true)}
                    onMarkDeparted={handleMarkDeparted}
                    language={profile.language}
                  />
                )}
              </>
            )}
          </main>

          {/* OVERLAY: VOICE AI DELAY DISPATCH HUD */}
          <VoiceAIDispatchHUD
            isOpen={isVoiceHUDOpen}
            onClose={() => setIsVoiceHUDOpen(false)}
            targetTrip={
              voiceHUDTargetTrip ||
              trips[0] || {
                id: 'temp-trip',
                title: profile.language === 'en' ? 'Upcoming Meeting' : 'Próxima Reunião Comercial',
                clientName: profile.language === 'en' ? 'Client' : 'Cliente Convidado',
                attendees: [{ name: 'Cliente', role: 'Cliente', email: 'cliente@empresa.pt' }],
                originAddress: profile.language === 'en' ? 'Departure Location' : 'Local de Partida',
                destinationAddress: profile.language === 'en' ? 'Destination Address' : 'Local de Destino',
                scheduledTime: '15:00',
                durationMin: 60,
                travelTimeMin: 20,
                smartBufferMin: 12,
                departureTime: '14:28',
                trafficCondition: 'heavy',
                status: 'upcoming',
                calendarSource: 'Google Calendar',
                calendarBlockInjected: true,
                transitMode: 'car',
                distanceKm: 8.5,
              }
            }
            onDispatchSuccess={handleVoiceDispatchSuccess}
          />

          {/* OVERLAY: TRIP DETAIL MODAL WITH GOOGLE MAPS */}
          <TripDetailModal
            trip={selectedTrip}
            isOpen={isDetailOpen}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedTrip(null);
            }}
            onOpenVoiceHUD={(trip) => {
              setVoiceHUDTargetTrip(trip);
              setIsVoiceHUDOpen(true);
            }}
            onMarkDeparted={handleMarkDeparted}
            onUpdateBuffer={handleUpdateBuffer}
            onDeleteTrip={handleDeleteTrip}
            theme={resolvedTheme}
            language={profile.language}
          />

          {/* OVERLAY: TRIP CREATION MODAL WITH LIVE PREVIEW */}
          <TripCreationScreen
            isOpen={isNewTripOpen}
            onClose={() => setIsNewTripOpen(false)}
            onCreateTrip={handleCreateTrip}
            language={profile.language}
            currentTime={currentTime}
          />

          {/* SYSTEM TOAST NOTIFICATIONS */}
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
      </div>
    </APIProvider>
  );
}
