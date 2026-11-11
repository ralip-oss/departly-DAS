export type TrafficStatus = 'clear' | 'moderate' | 'heavy' | 'incident';
export type TripStatus = 'upcoming' | 'depart_now' | 'in_transit' | 'delayed' | 'completed';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';
export type ChronoState = 'calm' | 'warning' | 'scanning' | 'empty' | 'success';
export type ThemeMode = 'light' | 'dark' | 'adaptive';
export type AppLanguage = 'pt' | 'en';

export interface TripAttendee {
  name: string;
  role: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface TripEvent {
  id: string;
  title: string;
  clientName: string;
  clientCompany?: string;
  attendees: TripAttendee[];
  originAddress: string;
  destinationAddress: string;
  originCoordinates?: { lat: number; lng: number };
  destinationCoordinates?: { lat: number; lng: number };
  scheduledTime: string; // e.g. "14:30"
  durationMin: number; // meeting duration e.g. 60
  travelTimeMin: number; // estimated driving time e.g. 18
  smartBufferMin: number; // added safety margin e.g. 10
  departureTime: string; // calculated e.g. "14:02"
  trafficCondition: TrafficStatus;
  status: TripStatus;
  notes?: string;
  calendarSource: 'Google Calendar' | 'Microsoft 365' | 'Apple iCal';
  calendarBlockInjected: boolean;
  transitMode: 'car' | 'metro' | 'motorcycle';
  distanceKm: number;
  delayOffsetMin?: number;
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  dateGroup: 'Hoje' | 'Ontem' | 'Esta semana' | 'Today' | 'Yesterday' | 'This week';
  title: string;
  message: string;
  type: 'alert' | 'success' | 'info' | 'critical';
  read: boolean;
  actionLabel?: string;
  tripId?: string;
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatar: string;
  defaultBufferMin: number;
  primaryTransitMode: 'car' | 'metro' | 'motorcycle';
  voiceTone: 'Empathetic & Professional' | 'Direct & Concise' | 'Executive Formal';
  autoSendDelayNotice: boolean;
  soundAlerts: boolean;
  hapticFeedback: boolean;
  themeMode: ThemeMode;
  theme: 'light' | 'dark'; // computed resolved theme
  language: AppLanguage;
  timeOfDaySimulation: 'auto' | 'morning' | 'afternoon' | 'evening';
  gdprCompliantData: boolean;
  endToEndEncryption: boolean;
}

export interface VoiceAIDispatchState {
  isOpen: boolean;
  isListening: boolean;
  transcript: string;
  detectedDelayMin: number;
  targetTrip: TripEvent | null;
  generatedSubject: string;
  generatedBody: string;
  recipientEmail: string;
  recipientName: string;
  channel: 'email' | 'sms' | 'both';
  status: 'idle' | 'listening' | 'analyzing' | 'preview' | 'sent';
  autoCountdownSec: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
  undoAction?: () => void;
}
