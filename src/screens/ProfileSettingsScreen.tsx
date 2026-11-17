import React, { useState } from 'react';
import { UserProfile, TimeOfDay } from '../types';
import {
  User,
  Shield,
  Moon,
  Sun,
  Globe,
  Sliders,
  Sparkles,
  Lock,
  ChevronRight,
  Eye,
  CheckCircle2,
  LogIn,
  UserPlus,
  Mail,
  Key,
  X,
  LogOut,
} from 'lucide-react';
import { Toggle, BufferSlider, Button, FloatingInput } from '../components/UIComponents';
import { translations } from '../i18n';
import {
  isValidUsernameFormat,
  loadUserProfileFromFirestore,
  loginWithEmailOrUsername,
  registerAccountWithUsername,
} from '../firebase';

interface ProfileSettingsScreenProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onLogout?: () => void;
  timeOfDay: TimeOfDay;
  onChangeTimeOfDay: (time: TimeOfDay) => void;
  onToggleDemoState: (stateType: 'empty' | 'loading' | 'error' | 'none') => void;
  currentDemoState: 'empty' | 'loading' | 'error' | 'none';
}

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({
  profile,
  onUpdateProfile,
  onLogout,
  timeOfDay,
  onChangeTimeOfDay,
  onToggleDemoState,
  currentDemoState,
}) => {
  const t = translations[profile.language || 'pt'];
  const isEn = profile.language === 'en';
  const [authModal, setAuthModal] = useState<'none' | 'login' | 'signup'>('none');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authFeedback, setAuthFeedback] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const isGuest = !profile.uid && profile.name === 'Guest Account';

  const mapAuthError = (err: unknown): string => {
    const raw = err instanceof Error ? err.message : String(err);
    if (raw === 'INVALID_USERNAME') {
      return isEn
        ? 'Username must be 3–32 characters (letters, numbers, _ or -).'
        : 'O nome de utilizador deve ter 3–32 caracteres (letras, números, _ ou -).';
    }
    if (raw === 'USERNAME_TAKEN') {
      return isEn
        ? 'This username is already taken.'
        : 'Este nome de utilizador já está registado.';
    }
    if (raw === 'USER_NOT_FOUND' || raw.includes('auth/invalid-credential') || raw.includes('auth/wrong-password') || raw.includes('auth/user-not-found')) {
      return isEn
        ? 'Invalid credentials. Check your email/username and password.'
        : 'Credenciais inválidas. Verifique o e-mail/utilizador e a palavra-passe.';
    }
    if (raw.includes('auth/email-already-in-use')) {
      return isEn ? 'This email is already registered.' : 'Este e-mail já está registado.';
    }
    if (raw.includes('auth/weak-password')) {
      return isEn ? 'Password must be at least 6 characters.' : 'A palavra-passe deve ter pelo menos 6 caracteres.';
    }
    if (raw.includes('auth/operation-not-allowed') || raw.includes('auth/configuration-not-found')) {
      return isEn
        ? 'Enable Email/Password sign-in in Firebase Console Authentication > Providers.'
        : 'Ative o provedor E-mail/Palavra-passe no Firebase Console (Authentication > Providers).';
    }
    return isEn ? 'Authentication failed. Please try again.' : 'Erro de autenticação. Tente novamente.';
  };

  const handleAuthSubmit = async (type: 'login' | 'signup') => {
    setAuthFeedback(null);
    if (type === 'signup') {
      if (!isValidUsernameFormat(authUsername)) {
        setAuthFeedback(mapAuthError('INVALID_USERNAME'));
        return;
      }
      if (!authEmail.includes('@')) {
        setAuthFeedback(isEn ? 'Please enter a valid email address.' : 'Por favor insira um endereço de e-mail válido.');
        return;
      }
      if (authPassword.length < 6) {
        setAuthFeedback(mapAuthError('auth/weak-password'));
        return;
      }
      setAuthLoading(true);
      try {
        const { profile: created } = await registerAccountWithUsername({
          username: authUsername,
          email: authEmail,
          password: authPassword,
          baseProfile: profile,
        });
        onUpdateProfile(created);
        setAuthModal('none');
      } catch (err) {
        setAuthFeedback(mapAuthError(err));
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    if (!authEmail.trim() || !authPassword) {
      setAuthFeedback(
        isEn
          ? 'Enter your email or username and password.'
          : 'Insira o seu e-mail ou nome de utilizador e a palavra-passe.'
      );
      return;
    }
    setAuthLoading(true);
    try {
      const user = await loginWithEmailOrUsername({
        identifier: authEmail,
        password: authPassword,
      });
      const loaded = await loadUserProfileFromFirestore(user.uid);
      onUpdateProfile(
        loaded || {
          uid: user.uid,
          username: user.displayName || authEmail.split('@')[0],
          name: user.displayName || authEmail.split('@')[0],
          email: user.email || '',
          role: 'Membro Departly',
        }
      );
      setAuthModal('none');
    } catch (err) {
      setAuthFeedback(mapAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogoutToGuest = () => {
    if (onLogout) {
      onLogout();
    } else {
      onUpdateProfile({
        uid: undefined,
        username: undefined,
        name: 'Guest Account',
        email: '',
        role: 'Convidado',
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 select-none pb-8">
      {/* Header */}
      <div>
        <span className="font-mono-telemetry text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-wider block">
          {profile.language === 'en' ? 'SETTINGS & PERSONAL TELEMETRY' : 'DEFINIÇÕES & TELEMETRIA PESSOAL'}
        </span>
        <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#0F172A] dark:text-white mt-1">
          {t.profileTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t.profileSubtitle}
        </p>
      </div>

      {/* Profile Card: Guest Account or Authenticated Account */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-headline font-bold text-lg shadow-sm">
              {isGuest ? <User size={24} className="text-slate-400 dark:text-slate-500" /> : profile.name.slice(0, 2).toUpperCase()}
            </div>
            <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#10192A] ${isGuest ? 'bg-amber-400' : 'bg-emerald-500'}`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-headline font-bold text-lg text-[#0F172A] dark:text-white truncate">
                {profile.name}
              </h3>
              {isGuest && (
                <span className="px-2 py-0.5 rounded-full font-mono-telemetry text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  {t.guestBadge}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isGuest
                ? t.guestDesc
                : profile.email || (profile.language === 'en' ? 'Registered account' : 'Conta registada')}
            </p>
          </div>
        </div>

        {/* Buttons for Sign up and Login */}
        {isGuest ? (
          <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              icon={<UserPlus size={15} />}
              onClick={() => {
                setAuthFeedback(null);
                setAuthModal('signup');
              }}
            >
              {t.signUp}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              icon={<LogIn size={15} />}
              onClick={() => {
                setAuthFeedback(null);
                setAuthModal('login');
              }}
            >
              {t.login}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-mono-telemetry flex items-center gap-1.5 font-semibold">
              <CheckCircle2 size={14} /> {profile.language === 'en' ? 'Cloud Sync Active' : 'Sincronização de Nuvem Ativa'}
            </span>
            <button
              onClick={handleLogoutToGuest}
              className="text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium flex items-center gap-1 transition-colors"
            >
              <LogOut size={13} /> {t.logoutToGuest}
            </button>
          </div>
        )}
      </div>

      {/* APARÊNCIA & TEMA (LIGHT / DARK / ADAPTIVE) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {profile.theme === 'light' ? (
              <Sun size={20} className="text-amber-500" />
            ) : (
              <Moon size={20} className="text-[#29B6F6]" />
            )}
            <div>
              <h3 className="font-headline font-bold text-base text-[#0F172A] dark:text-white">
                {profile.language === 'en' ? 'Theme & Contrast' : 'Tema & Contraste'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {profile.language === 'en'
                  ? 'Switch between Light, Dark, or Time-of-Day Adaptive.'
                  : 'Alterne entre Claro, Escuro ou Adaptativo por Horário.'}
              </p>
            </div>
          </div>
        </div>

        {/* 3-Option Segmented Control for Theme: Light, Dark, Adaptive */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onUpdateProfile({ themeMode: 'light', theme: 'light' })}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl font-headline font-semibold text-xs transition-all duration-200 ${
              profile.themeMode === 'light'
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sun size={15} className={profile.themeMode === 'light' ? 'text-amber-500 mb-0.5' : 'text-slate-400 mb-0.5'} />
            <span className="text-[11px] truncate">{profile.language === 'en' ? 'Light' : 'Claro'}</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateProfile({ themeMode: 'dark', theme: 'dark' })}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl font-headline font-semibold text-xs transition-all duration-200 ${
              profile.themeMode === 'dark'
                ? 'bg-[#1E293B] text-white shadow-sm ring-1 ring-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Moon size={15} className={profile.themeMode === 'dark' ? 'text-[#29B6F6] mb-0.5' : 'text-slate-400 mb-0.5'} />
            <span className="text-[11px] truncate">{profile.language === 'en' ? 'Dark' : 'Escuro'}</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateProfile({ themeMode: 'adaptive' })}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl font-headline font-semibold text-xs transition-all duration-200 ${
              profile.themeMode === 'adaptive'
                ? 'bg-gradient-to-r from-sky-500 to-[#29B6F6] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles size={15} className={profile.themeMode === 'adaptive' ? 'text-white mb-0.5' : 'text-slate-400 mb-0.5'} />
            <span className="text-[11px] truncate">{profile.language === 'en' ? 'Adaptive' : 'Adaptativo'}</span>
          </button>
        </div>

        {profile.themeMode === 'adaptive' && (
          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11px] font-mono-telemetry text-sky-800 dark:text-sky-300 flex items-center gap-2">
            <Sparkles size={14} className="text-[#0284C7] dark:text-[#38BDF8] shrink-0" />
            <span>
              {profile.language === 'en'
                ? 'Adaptive theme: Light from 08:00 to 18:00, Dark from 18:00 to 08:00.'
                : 'Tema adaptativo: Claro das 08:00 às 18:00, Escuro das 18:00 às 08:00.'}
            </span>
          </div>
        )}

        {/* TRANSLATION / IDIOMA (PT-PT & EN-UK) - DIRECTLY UNDER THEME */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-[#29B6F6]" />
            <div>
              <h4 className="font-headline font-bold text-sm text-[#0F172A] dark:text-white">
                {profile.language === 'en' ? 'Translation / Language' : 'Tradução / Idioma'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {profile.language === 'en' ? 'Select interface and voice language.' : 'Selecione o idioma da interface e da voz.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onUpdateProfile({ language: 'pt' })}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-headline font-semibold text-xs transition-all ${
                profile.language === 'pt'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🇵🇹 PT-PT (Português)</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateProfile({ language: 'en' })}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-headline font-semibold text-xs transition-all ${
                profile.language === 'en'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🇬🇧 EN-UK (English)</span>
            </button>
          </div>
        </div>
      </div>

      {/* DRIVING & BUFFER CALIBRATION */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm space-y-4">
        <h3 className="font-headline font-bold text-base text-[#0F172A] dark:text-white flex items-center gap-2">
          <Sliders size={18} className="text-[#29B6F6]" />
          {t.drivingCalibration}
        </h3>

        <BufferSlider
          value={profile.defaultBufferMin}
          onChange={(val) => onUpdateProfile({ defaultBufferMin: val })}
          label={t.defaultBuffer}
        />

        {/* Voice AI Tone */}
        <div className="space-y-1.5 pt-1">
          <span className="font-mono-telemetry text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
            {profile.language === 'en' ? 'Voice AI Communication Tone' : 'Tom de Comunicação da IA em Casos de Atraso'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              'Empathetic & Professional',
              'Direct & Concise',
              'Executive Formal',
            ].map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => onUpdateProfile({ voiceTone: tone as any })}
                className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                  profile.voiceTone === tone
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-[#29B6F6] text-[#0284C7] dark:text-[#38BDF8] font-bold'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tone === 'Empathetic & Professional'
                  ? (profile.language === 'en' ? 'Empathetic & Courteous' : 'Empático & Cortês')
                  : tone === 'Direct & Concise'
                  ? (profile.language === 'en' ? 'Direct & Concise' : 'Direto & Sucinto')
                  : (profile.language === 'en' ? 'Executive Formal' : 'Formal Executivo')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PAINEL POR HORÁRIO DO DIA */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#29B6F6]" />
          <h3 className="font-headline font-bold text-base text-[#0F172A] dark:text-white">
            {t.timeOfDayAdaptiveTitle}
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.timeOfDayAdaptiveDesc}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {[
            {
              id: 'morning' as const,
              title: t.morningPhase,
              desc: t.morningPhaseDesc,
            },
            {
              id: 'afternoon' as const,
              title: t.afternoonPhase,
              desc: t.afternoonPhaseDesc,
            },
            {
              id: 'evening' as const,
              title: t.eveningPhase,
              desc: t.eveningPhaseDesc,
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTimeOfDay(item.id)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                timeOfDay === item.id
                  ? 'bg-sky-50 dark:bg-sky-950/60 border-[#29B6F6] ring-2 ring-[#29B6F6]/30'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-xs text-[#0F172A] dark:text-white">
                  {item.title}
                </span>
                {timeOfDay === item.id && (
                  <CheckCircle2 size={15} className="text-[#0284C7] dark:text-[#38BDF8]" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ESTADOS ESPECIAIS (LOADING / EMPTY / ERROR) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-[#29B6F6]" />
          <h3 className="font-headline font-bold text-base text-[#0F172A] dark:text-white">
            {t.stateSimTitle}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            variant={currentDemoState === 'none' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onToggleDemoState('none')}
          >
            {t.stateNormal}
          </Button>
          <Button
            variant={currentDemoState === 'loading' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onToggleDemoState('loading')}
          >
            {t.stateLoading}
          </Button>
          <Button
            variant={currentDemoState === 'empty' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onToggleDemoState('empty')}
          >
            {t.stateEmpty}
          </Button>
          <Button
            variant={currentDemoState === 'error' ? 'urgent' : 'secondary'}
            size="sm"
            onClick={() => onToggleDemoState('error')}
          >
            {t.stateError}
          </Button>
        </div>
      </div>

      {/* NOTIFICAÇÕES & HÁPTICA */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm space-y-4">
        <h3 className="font-headline font-bold text-base text-[#0F172A] dark:text-white">
          {t.soundsHaptics}
        </h3>

        <Toggle
          checked={profile.soundAlerts}
          onChange={(checked) => onUpdateProfile({ soundAlerts: checked })}
          label={t.soundAlertsLabel}
          description={t.soundAlertsDesc}
        />

        <Toggle
          checked={profile.hapticFeedback}
          onChange={(checked) => onUpdateProfile({ hapticFeedback: checked })}
          label={t.hapticsLabel}
          description={t.hapticsDesc}
        />
      </div>

      {/* PRIVACIDADE RGPD */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-emerald-500" />
          <h3 className="font-headline font-bold text-base text-[#0F172A] dark:text-white">
            {t.privacyGDPR}
          </h3>
        </div>

        <Toggle
          checked={profile.gdprCompliantData}
          onChange={(checked) => onUpdateProfile({ gdprCompliantData: checked })}
          label={t.privacyGpsLabel}
          description={t.privacyGpsDesc}
        />

        <Toggle
          checked={profile.endToEndEncryption}
          onChange={(checked) => onUpdateProfile({ endToEndEncryption: checked })}
          label={t.privacyE2eeLabel}
          description={t.privacyE2eeDesc}
        />
      </div>

      {/* AUTH MODAL FOR SIGN UP & LOGIN */}
      {authModal !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] rounded-3xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setAuthModal('none')}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            <div>
              <span className="font-mono-telemetry text-[11px] font-bold text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-wider block">
                {authModal === 'signup' ? 'REGISTO DE CONTA' : 'INICIAR SESSÃO'}
              </span>
              <h3 className="font-headline font-bold text-xl text-[#0F172A] dark:text-white mt-1">
                {authModal === 'signup' ? 'Criar Conta Departly' : 'Bem-vindo de volta'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {authModal === 'signup'
                  ? 'Sincronize calendários e desbloqueie o Voicebot IA completo.'
                  : 'Aceda à sua conta e restaure as suas rotinas.'}
              </p>
            </div>

            <div className="space-y-3">
              {authModal === 'signup' ? (
                <>
                  <FloatingInput
                    label={isEn ? 'Username' : 'Nome de Utilizador'}
                    placeholder={isEn ? 'e.g. joao_mendes' : 'ex: joao_mendes'}
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    icon={<User size={16} />}
                  />
                  <FloatingInput
                    label={isEn ? 'Email Address' : 'Endereço de E-mail'}
                    placeholder="nome@empresa.pt"
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    icon={<Mail size={16} />}
                  />
                </>
              ) : (
                <FloatingInput
                  label={isEn ? 'Email or Username' : 'E-mail ou Nome de Utilizador'}
                  placeholder={isEn ? 'email@company.pt or username' : 'email@empresa.pt ou utilizador'}
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  icon={<User size={16} />}
                />
              )}

              <FloatingInput
                label={isEn ? 'Password' : 'Palavra-passe'}
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                icon={<Key size={16} />}
              />
            </div>

            {authFeedback && (
              <p className="text-xs text-rose-500 font-medium">
                {authFeedback}
              </p>
            )}

            <Button
              variant="primary"
              className="w-full"
              isLoading={authLoading}
              onClick={() => handleAuthSubmit(authModal)}
            >
              {authModal === 'signup'
                ? isEn
                  ? 'Create Account'
                  : 'Concluir Registo'
                : isEn
                ? 'Sign In'
                : 'Entrar na Conta'}
            </Button>

            <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
              {authModal === 'signup' ? (
                <span>
                  {isEn ? 'Already have an account?' : 'Já tem conta?'}{' '}
                  <button
                    onClick={() => {
                      setAuthFeedback(null);
                      setAuthModal('login');
                    }}
                    className="text-[#0284C7] dark:text-[#38BDF8] font-semibold hover:underline"
                  >
                    {isEn ? 'Sign In' : 'Fazer Login'}
                  </button>
                </span>
              ) : (
                <span>
                  {isEn ? 'New to Departly?' : 'Novo no Departly?'}{' '}
                  <button
                    onClick={() => {
                      setAuthFeedback(null);
                      setAuthModal('signup');
                    }}
                    className="text-[#0284C7] dark:text-[#38BDF8] font-semibold hover:underline"
                  >
                    {isEn ? 'Create an Account' : 'Criar Conta'}
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
