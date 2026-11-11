import React from 'react';
import {
  Compass,
  Calendar,
  Search,
  User,
  Mic,
  Plus,
  Bell,
  Sun,
  Moon,
  Sparkles,
  Navigation as NavigationIcon,
} from 'lucide-react';
import { DepartlyBrand } from './DepartlyBrand';
import { TimeOfDay, ThemeMode, AppLanguage } from '../types';
import { translations } from '../i18n';

export type NavTab = 'dashboard' | 'trips' | 'search' | 'notifications' | 'profile' | 'liveMap';

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenVoiceHUD: () => void;
  onOpenNewTrip: () => void;
  unreadNotificationsCount?: number;
  timeOfDay: TimeOfDay;
  theme: 'light' | 'dark';
  themeMode?: ThemeMode;
  language?: AppLanguage;
  currentTime?: Date;
  onToggleTheme: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  onOpenVoiceHUD,
  onOpenNewTrip,
  unreadNotificationsCount = 0,
  timeOfDay,
  theme,
  themeMode = 'adaptive',
  language = 'pt',
  onToggleTheme,
}) => {
  const t = translations[language];

  return (
    <>
      {/* =========================================================
          PHONE-FIRST TOP APP BAR
          Compact (54px) with Logo and (Left to Right: Theme, Notifications, Profile)
          Time is hidden on the top bar as requested by user
          ========================================================= */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#0E1626]/90 backdrop-blur-md border-b border-[#E1E6F0] dark:border-[#1E293B] px-4 py-2.5 flex items-center justify-between select-none transition-colors duration-200">
        <div className="flex items-center gap-2">
          <DepartlyBrand size="sm" onClick={() => onTabChange('dashboard')} />
        </div>

        <div className="flex items-center gap-1.5">
          {/* 1. Theme toggle button */}
          <button
            onClick={onToggleTheme}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
            aria-label={
              themeMode === 'adaptive'
                ? 'Tema Adaptativo (8h-18h)'
                : theme === 'light'
                ? 'Modo Claro'
                : 'Modo Escuro'
            }
            title={
              themeMode === 'adaptive'
                ? 'Tema Adaptativo (8h-18h)'
                : theme === 'light'
                ? 'Modo Claro'
                : 'Modo Escuro'
            }
          >
            {themeMode === 'adaptive' ? (
              <span className="relative flex items-center justify-center">
                <Sparkles size={18} className="text-[#29B6F6]" />
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
              </span>
            ) : theme === 'light' ? (
              <Moon size={19} className="text-slate-700" />
            ) : (
              <Sun size={19} className="text-amber-400" />
            )}
          </button>

          {/* 2. Notifications button with badge */}
          <button
            onClick={() => onTabChange('notifications')}
            className={`relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full transition-colors ${
              currentTab === 'notifications'
                ? 'bg-sky-50 dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8]'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-label={t.notifications}
            title={t.notifications}
          >
            <Bell size={19} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF6B57]" />
            )}
          </button>

          {/* 3. Profile button (Left to Right: Theme, Notifications, Profile) */}
          <button
            onClick={() => onTabChange('profile')}
            className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full transition-all ${
              currentTab === 'profile'
                ? 'bg-[#29B6F6] text-white shadow-sm ring-2 ring-[#29B6F6]/30'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-label={t.profile}
            title={t.profile}
          >
            <User size={19} />
          </button>
        </div>
      </header>

      {/* =========================================================
          PHONE-FIRST BOTTOM NAVIGATION BAR WITH FLOATING ACTION BUTTON
          Thumb-zone anchor: Hoje, Trajetos, Voicebot (center), Pesquisa, Radar (Google Maps)
          ========================================================= */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0E1626]/95 backdrop-blur-xl border-t border-[#E1E6F0] dark:border-[#1E293B] pb-safe transition-colors duration-200">
        <div className="max-w-md mx-auto relative h-16 flex items-center justify-around px-2">
          {/* Tab 1: Dashboard (Hoje / Today) */}
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
              currentTab === 'dashboard'
                ? 'text-[#0284C7] dark:text-[#38BDF8] scale-105 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Compass size={22} />
            <span className="text-[10px] font-headline font-semibold mt-1">{t.today}</span>
          </button>

          {/* Tab 2: Trajetos / Trips */}
          <button
            onClick={() => onTabChange('trips')}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
              currentTab === 'trips'
                ? 'text-[#0284C7] dark:text-[#38BDF8] scale-105 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Calendar size={22} />
            <span className="text-[10px] font-headline font-semibold mt-1">{t.trips}</span>
          </button>

          {/* Floating Center Action Button (Voicebot Delay Dispatch) */}
          <div className="relative -top-5">
            <button
              onClick={onOpenVoiceHUD}
              className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#29B6F6] text-white flex items-center justify-center shadow-lg shadow-[#29B6F6]/40 ring-4 ring-[#F5F7FB] dark:ring-[#070D18] active:scale-95 hover:scale-105 transition-all"
              aria-label={t.voicebotBtn}
              title={t.voicebotBtn}
            >
              <Mic size={24} className="animate-pulse" />
              <span className="absolute inset-0 rounded-full bg-[#29B6F6]/30 animate-ping pointer-events-none" />
            </button>
          </div>

          {/* Tab 3: Search (Pesquisa / Search) */}
          <button
            onClick={() => onTabChange('search')}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
              currentTab === 'search'
                ? 'text-[#0284C7] dark:text-[#38BDF8] scale-105 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Search size={22} />
            <span className="text-[10px] font-headline font-semibold mt-1">{t.search}</span>
          </button>

          {/* Tab 4: Google Maps Live Radar (replaces components section) */}
          <button
            onClick={() => onTabChange('liveMap')}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
              currentTab === 'liveMap'
                ? 'text-[#0284C7] dark:text-[#38BDF8] scale-105 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <NavigationIcon size={22} />
            <span className="text-[10px] font-headline font-semibold mt-1">
              {language === 'en' ? 'Radar' : 'Radar'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};
