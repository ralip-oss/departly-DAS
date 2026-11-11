import { TripEvent, NotificationItem, UserProfile } from './types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Guest Account',
  role: 'Convidado',
  email: '',
  avatar: '',
  defaultBufferMin: 12,
  primaryTransitMode: 'car',
  voiceTone: 'Empathetic & Professional',
  autoSendDelayNotice: false,
  soundAlerts: true,
  hapticFeedback: true,
  themeMode: 'adaptive',
  theme: 'light',
  language: 'pt',
  timeOfDaySimulation: 'afternoon',
  gdprCompliantData: true,
  endToEndEncryption: true,
};

// Start with empty trips as requested
export const INITIAL_TRIPS: TripEvent[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    timestamp: '13:40',
    dateGroup: 'Hoje',
    title: 'Assistente Departly Pronto',
    message: 'Adicione o seu primeiro trajeto com morada física para ativar o bloqueio dinâmico no calendário e alertas de trânsito.',
    type: 'info',
    read: false,
    actionLabel: 'Criar Trajeto',
  },
  {
    id: 'notif-2',
    timestamp: '10:00',
    dateGroup: 'Hoje',
    title: 'Radar de Trânsito Inicializado',
    message: 'Algoritmos de margem de segurança ativos para a região metropolitana.',
    type: 'info',
    read: true,
  },
];
