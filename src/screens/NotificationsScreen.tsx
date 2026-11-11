import React, { useState } from 'react';
import { motion } from 'motion/react';
import { NotificationItem } from '../types';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button, FilterChip } from '../components/UIComponents';
import { AppLanguage } from '../types';
import { translations } from '../i18n';

interface NotificationsScreenProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onNotificationAction?: (notification: NotificationItem) => void;
  language?: AppLanguage;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  notifications,
  onMarkAllAsRead,
  onNotificationAction,
  language = 'pt',
}) => {
  const t = translations[language];
  const [filter, setFilter] = useState<'all' | 'alerts' | 'unread'>('all');

  const filtered = notifications.filter((item) => {
    if (filter === 'alerts') return item.type === 'alert' || item.type === 'critical';
    if (filter === 'unread') return !item.read;
    return true;
  });

  // Group notifications by dateGroup ('Hoje', 'Ontem', 'Esta semana')
  const groups: { [key: string]: NotificationItem[] } = {};
  filtered.forEach((item) => {
    if (!groups[item.dateGroup]) {
      groups[item.dateGroup] = [];
    }
    groups[item.dateGroup].push(item);
  });

  const translateDateGroup = (group: string) => {
    if (language === 'en') {
      if (group === 'Hoje') return 'Today';
      if (group === 'Ontem') return 'Yesterday';
      if (group === 'Esta semana') return 'This Week';
    }
    return group;
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono-telemetry text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-wider block">
            {language === 'en' ? 'ALERTS & TELEMETRY CENTER' : 'CENTRO DE ALERTAS & TELEMETRIA'}
          </span>
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#0F172A] dark:text-white mt-1">
            {t.notificationsHeader}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.notificationsSubtitle}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<Check size={14} />}
          onClick={onMarkAllAsRead}
        >
          {t.markAllRead}
        </Button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <FilterChip
          label={t.allNotifications}
          count={notifications.length}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <FilterChip
          label={t.unreadNotifications}
          count={notifications.filter((n) => !n.read).length}
          active={filter === 'unread'}
          onClick={() => setFilter('unread')}
        />
        <FilterChip
          label={t.trafficAlerts}
          count={notifications.filter((n) => n.type === 'alert').length}
          active={filter === 'alerts'}
          onClick={() => setFilter('alerts')}
        />
      </div>

      {/* Grouped Notifications Feed */}
      <div className="space-y-6">
        {Object.keys(groups).length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248]">
            <Bell size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-headline font-bold text-lg text-slate-800 dark:text-slate-200">
              {t.noNotificationsTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t.noNotificationsDesc}
            </p>
          </div>
        ) : (
          Object.entries(groups).map(([dateGroup, items]) => (
            <div key={dateGroup} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-mono-telemetry text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {translateDateGroup(dateGroup)}
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              <div className="space-y-2.5">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      !item.read
                        ? 'bg-white dark:bg-[#10192A] border-[#29B6F6]/40 shadow-sm ring-1 ring-[#29B6F6]/15'
                        : 'bg-white/80 dark:bg-[#10192A]/80 border-[#E1E6F0] dark:border-[#243248]'
                    }`}
                  >
                    {/* Icon type */}
                    <div className="mt-0.5 shrink-0">
                      {item.type === 'alert' && (
                        <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600">
                          <AlertTriangle size={18} />
                        </div>
                      )}
                      {item.type === 'success' && (
                        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
                          <CheckCircle2 size={18} />
                        </div>
                      )}
                      {item.type === 'info' && (
                        <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8]">
                          <Info size={18} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-headline font-bold text-sm text-[#0F172A] dark:text-white">
                          {item.title}
                        </h4>
                        <span className="font-mono-telemetry text-[11px] text-slate-400 shrink-0">
                          {item.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {item.message}
                      </p>

                      {item.actionLabel && onNotificationAction && (
                        <button
                          onClick={() => onNotificationAction(item)}
                          className="mt-2 text-xs font-headline font-semibold text-[#0284C7] dark:text-[#38BDF8] hover:underline flex items-center gap-1"
                        >
                          {language === 'en' && item.actionLabel === 'Criar Trajeto' ? 'New Trip' : item.actionLabel} <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
