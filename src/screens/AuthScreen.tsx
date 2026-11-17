import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { DepartlyBrand } from '../components/DepartlyBrand';
import { Button, FloatingInput } from '../components/UIComponents';
import { AppLanguage, UserProfile } from '../types';
import {
  isValidUsernameFormat,
  loadUserProfileFromFirestore,
  loginWithEmailOrUsername,
  registerAccountWithUsername,
} from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';

interface AuthScreenProps {
  initialMode: 'register' | 'login';
  baseProfile: UserProfile;
  language: AppLanguage;
  onBack: () => void;
  onAuthSuccess: (profile: UserProfile, isNewAccount: boolean) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode,
  baseProfile,
  language,
  onBack,
  onAuthSuccess,
}) => {
  const isEn = language === 'en';
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConsoleHint, setShowConsoleHint] = useState(false);

  const mapAuthError = (err: unknown): string => {
    const raw = err instanceof Error ? err.message : String(err);
    setShowConsoleHint(false);

    if (raw === 'INVALID_USERNAME') {
      return isEn
        ? 'Username must be 3–32 characters using only letters, numbers, _ or -.'
        : 'O nome de utilizador deve ter 3–32 caracteres (apenas letras, números, _ ou -).';
    }
    if (raw === 'USERNAME_TAKEN') {
      return isEn
        ? 'This username is already taken. Please choose another.'
        : 'Este nome de utilizador já está registado. Escolha outro.';
    }
    if (raw === 'USER_NOT_FOUND') {
      return isEn
        ? 'Account not found. Check your username or email.'
        : 'Conta não encontrada. Verifique o nome de utilizador ou e-mail.';
    }
    if (raw.includes('auth/email-already-in-use')) {
      return isEn
        ? 'An account with this email already exists.'
        : 'Já existe uma conta registada com este endereço de e-mail.';
    }
    if (raw.includes('auth/invalid-email')) {
      return isEn
        ? 'Please enter a valid email address.'
        : 'Por favor insira um endereço de e-mail válido.';
    }
    if (raw.includes('auth/weak-password')) {
      return isEn
        ? 'Password must be at least 6 characters.'
        : 'A palavra-passe deve ter pelo menos 6 caracteres.';
    }
    if (
      raw.includes('auth/wrong-password') ||
      raw.includes('auth/invalid-credential') ||
      raw.includes('auth/user-not-found')
    ) {
      return isEn
        ? 'Invalid credentials. Check your email/username and password.'
        : 'Credenciais inválidas. Verifique o e-mail/utilizador e a palavra-passe.';
    }
    if (
      raw.includes('auth/operation-not-allowed') ||
      raw.includes('auth/configuration-not-found')
    ) {
      setShowConsoleHint(true);
      return isEn
        ? 'Email/Password sign-in is not yet enabled in Firebase Authentication for this project.'
        : 'O método E-mail/Palavra-passe ainda não está ativado no Firebase Authentication deste projeto.';
    }
    if (raw.includes('Quota exceeded')) {
      return isEn
        ? 'Firestore daily quota exceeded. Please try again tomorrow.'
        : 'Quota diária do Firestore excedida. Tente novamente amanhã.';
    }
    return isEn
      ? 'Authentication error. Please check your details and try again.'
      : 'Erro de autenticação. Verifique os dados e tente novamente.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setShowConsoleHint(false);

    if (mode === 'register') {
      if (!isValidUsernameFormat(username)) {
        setErrorMsg(mapAuthError('INVALID_USERNAME'));
        return;
      }
      if (!email.includes('@') || email.trim().length < 5) {
        setErrorMsg(mapAuthError('auth/invalid-email'));
        return;
      }
      if (password.length < 6) {
        setErrorMsg(mapAuthError('auth/weak-password'));
        return;
      }

      setIsLoading(true);
      try {
        const { profile } = await registerAccountWithUsername({
          username,
          email,
          password,
          baseProfile,
        });
        onAuthSuccess(profile, true);
      } catch (err) {
        setErrorMsg(mapAuthError(err));
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!identifier.trim()) {
        setErrorMsg(
          isEn
            ? 'Please enter your email or username.'
            : 'Por favor insira o seu e-mail ou nome de utilizador.'
        );
        return;
      }
      if (!password) {
        setErrorMsg(
          isEn
            ? 'Please enter your password.'
            : 'Por favor insira a sua palavra-passe.'
        );
        return;
      }

      setIsLoading(true);
      try {
        const user = await loginWithEmailOrUsername({ identifier, password });
        const loaded = await loadUserProfileFromFirestore(user.uid);
        const resolvedProfile: UserProfile = loaded || {
          ...baseProfile,
          uid: user.uid,
          username: user.displayName || identifier.split('@')[0],
          name: user.displayName || identifier.split('@')[0],
          email: user.email || '',
          role: 'Membro Departly',
        };
        onAuthSuccess(resolvedProfile, false);
      } catch (err) {
        setErrorMsg(mapAuthError(err));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F5F7FB] dark:bg-[#070D18] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-between p-6 sm:p-10 overflow-hidden select-none">
      {/* Ambient Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#29B6F6]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation Row */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-md mx-auto">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-headline font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0284C7] dark:hover:text-[#38BDF8] py-2 px-3 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 transition-colors"
        >
          <ArrowLeft size={14} />
          {isEn ? 'Back' : 'Voltar'}
        </button>
        <DepartlyBrand size="sm" />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-md mx-auto my-auto py-6"
      >
        <div className="bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          {/* Segmented Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-2 px-3 rounded-xl font-headline font-semibold text-xs transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {isEn ? 'Create an Account' : 'Criar uma Conta'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 px-3 rounded-xl font-headline font-semibold text-xs transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {isEn ? 'I already have an account' : 'Já tenho conta'}
            </button>
          </div>

          {/* Heading */}
          <div>
            <span className="font-mono-telemetry text-[11px] font-bold text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-wider block">
              {mode === 'register'
                ? isEn
                  ? 'NEW ACCOUNT'
                  : 'NOVA CONTA'
                : isEn
                ? 'SIGN IN'
                : 'INICIAR SESSÃO'}
            </span>
            <h1 className="font-headline font-bold text-2xl text-[#0F172A] dark:text-white mt-1">
              {mode === 'register'
                ? isEn
                  ? 'Create your Departly account'
                  : 'Crie a sua conta Departly'
                : isEn
                ? 'Welcome back'
                : 'Bem-vindo de volta'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {mode === 'register'
                ? isEn
                  ? 'Save your trips, routes, and preferences securely in the cloud.'
                  : 'Guarde os seus trajetos, rotas e preferências com segurança na nuvem.'
                : isEn
                ? 'Sign in with your email or username to sync your trips.'
                : 'Entre com o seu e-mail ou nome de utilizador para sincronizar os trajetos.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' ? (
              <>
                <FloatingInput
                  label={isEn ? 'Username' : 'Nome de Utilizador'}
                  placeholder={isEn ? 'e.g. joao_mendes' : 'ex: joao_mendes'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  icon={<User size={16} />}
                  helperText={
                    isEn
                      ? '3–32 characters (letters, numbers, _ or -)'
                      : '3–32 caracteres (letras, números, _ ou -)'
                  }
                  autoComplete="username"
                />

                <FloatingInput
                  label={isEn ? 'Email Address' : 'Endereço de E-mail'}
                  placeholder="nome@empresa.pt"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={16} />}
                  autoComplete="email"
                />
              </>
            ) : (
              <FloatingInput
                label={isEn ? 'Email or Username' : 'E-mail ou Nome de Utilizador'}
                placeholder={isEn ? 'email@company.pt or username' : 'email@empresa.pt ou utilizador'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                icon={<User size={16} />}
                autoComplete="username"
              />
            )}

            {/* Password Input with visibility toggle */}
            <div className="relative">
              <FloatingInput
                label={isEn ? 'Password' : 'Palavra-passe'}
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-3.5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                aria-label={isEn ? 'Toggle password visibility' : 'Mostrar/ocultar palavra-passe'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
                {showConsoleHint && (
                  <a
                    href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold underline text-rose-800 dark:text-rose-200"
                  >
                    {isEn
                      ? 'Open Firebase Authentication Providers'
                      : 'Abrir Provedores no Firebase Console'}
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2 shadow-md shadow-[#29B6F6]/25"
              icon={mode === 'register' ? <UserPlus size={18} /> : <LogIn size={18} />}
            >
              {mode === 'register'
                ? isEn
                  ? 'Create Account'
                  : 'Criar Conta'
                : isEn
                ? 'Sign In'
                : 'Entrar'}
            </Button>
          </form>
        </div>
      </motion.div>

      <div className="relative z-10 text-center text-[11px] font-mono-telemetry text-slate-400">
        DEPARTLY // CLOUD SYNC & ENCRYPTED TELEMETRY
      </div>
    </div>
  );
};
