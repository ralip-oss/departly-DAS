import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, AlertCircle, Info, ChevronRight, Sliders } from 'lucide-react';
import { ToastMessage } from '../types';

/* =========================================================
   BUTTONS
   Primary, Secondary, Urgent (Coral), Ghost, with States
   ========================================================= */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'urgent' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-headline font-semibold rounded-full select-none transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45';

  const sizeStyles = {
    sm: 'min-h-[36px] px-3.5 py-1.5 text-xs gap-1.5',
    md: 'min-h-[48px] px-5 py-2.5 text-sm gap-2',
    lg: 'min-h-[54px] px-7 py-3 text-base gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#29B6F6] text-white hover:bg-[#0284C7] active:scale-[0.98] shadow-sm hover:shadow-[0_4px_14px_rgba(41,182,246,0.35)] focus-visible:ring-[#29B6F6]',
    secondary:
      'bg-[#EBF1F9] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E1E6F0] dark:border-[#334155] hover:bg-[#DEE6F2] dark:hover:bg-[#334155] active:scale-[0.98] focus-visible:ring-[#29B6F6]',
    urgent:
      'bg-[#FF6B57] text-white hover:bg-[#E11D48] active:scale-[0.98] shadow-sm hover:shadow-[0_4px_14px_rgba(255,107,87,0.35)] focus-visible:ring-[#FF6B57]',
    ghost:
      'bg-transparent text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] focus-visible:ring-slate-400',
    outline:
      'bg-transparent border border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-[0.98] focus-visible:ring-[#29B6F6]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
};

/* =========================================================
   TEXT INPUT WITH FLOATING LABEL
   ========================================================= */

interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  onClear?: () => void;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  error,
  helperText,
  icon,
  value,
  onClear,
  id,
  className = '',
  readOnly,
  onChange,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const inputId = id || `floating-input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const hasValue = value !== undefined && value !== '' && String(value).length > 0;
  const isReadOnly = readOnly !== undefined ? readOnly : (!onChange && value !== undefined);

  return (
    <div className={`relative flex flex-col w-full ${className}`}>
      <div
        className={`relative flex items-center min-h-[52px] px-3.5 pt-3 pb-1 rounded-xl bg-white dark:bg-[#131D2E] border transition-all duration-200 ${
          error
            ? 'border-rose-400 focus-within:ring-2 focus-within:ring-rose-200'
            : focused
            ? 'border-[#29B6F6] ring-3 ring-[#29B6F6]/20'
            : 'border-[#E1E6F0] dark:border-[#2A374A] hover:border-slate-400 dark:hover:border-slate-600'
        }`}
      >
        {icon && (
          <span className="text-slate-400 dark:text-slate-500 mr-2.5 shrink-0 self-center">
            {icon}
          </span>
        )}

        <div className="relative flex-1">
          <label
            htmlFor={inputId}
            className={`absolute left-0 pointer-events-none transition-all duration-150 origin-top-left ${
              focused || hasValue
                ? '-top-2 text-[10px] font-mono-telemetry font-semibold uppercase tracking-wider text-[#0284C7] dark:text-[#38BDF8]'
                : 'top-1 text-sm text-slate-400 dark:text-slate-500 font-body'
            }`}
          >
            {label}
          </label>

          <input
            id={inputId}
            value={value}
            readOnly={isReadOnly}
            onChange={onChange}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className="w-full bg-transparent text-sm font-body text-[#0F172A] dark:text-white outline-none pt-2"
            {...props}
          />
        </div>

        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
            aria-label="Limpar campo"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {error ? (
        <span className="text-xs text-rose-500 mt-1 pl-1 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </span>
      ) : helperText ? (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-1 font-mono-telemetry">
          {helperText}
        </span>
      ) : null}
    </div>
  );
};

/* =========================================================
   FILTER CHIPS
   ========================================================= */

interface FilterChipProps {
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  count,
  active = false,
  onClick,
  icon,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center min-h-[36px] px-3.5 py-1 rounded-full text-xs font-semibold font-headline whitespace-nowrap transition-all duration-150 select-none ${
        active
          ? 'bg-[#29B6F6] text-white shadow-sm'
          : 'bg-[#EBF1F9] dark:bg-[#1E293B] text-slate-700 dark:text-slate-300 border border-[#E1E6F0] dark:border-[#334155] hover:border-slate-300'
      }`}
    >
      {icon && <span className="mr-1.5 text-sm">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`ml-1.5 px-1.5 py-0.2 rounded-full font-mono-telemetry text-[10px] ${
            active
              ? 'bg-white/20 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};

/* =========================================================
   TOGGLES
   ========================================================= */

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <label
      className={`flex items-start justify-between gap-3 cursor-pointer select-none py-1.5 ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#29B6F6] ${
          checked ? 'bg-[#29B6F6]' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
};

/* =========================================================
   SLIDER (Buffer Duration)
   ========================================================= */

interface BufferSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  label?: string;
  onChange: (value: number) => void;
}

export const BufferSlider: React.FC<BufferSliderProps> = ({
  value,
  min = 5,
  max = 30,
  step = 1,
  unit = 'minutos',
  label = 'Margem de Segurança Inteligente',
  onChange,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2 w-full p-4 rounded-xl bg-white dark:bg-[#131D2E] border border-[#E1E6F0] dark:border-[#2A374A]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono-telemetry uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span className="font-mono-telemetry font-bold text-sm text-[#0284C7] dark:text-[#38BDF8] bg-[#E1F5FE] dark:bg-[#003852] px-2.5 py-0.5 rounded-full">
          +{value} {unit}
        </span>
      </div>

      <div className="relative flex items-center w-full my-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#29B6F6] focus:outline-none"
        />
      </div>

      <div className="flex justify-between text-[10px] font-mono-telemetry text-slate-400">
        <span>{min} min (Express)</span>
        <span>15 min (Padrão)</span>
        <span>{max} min (Ultra-Seguro)</span>
      </div>
    </div>
  );
};

/* =========================================================
   BOTTOM SHEET / MODAL CONTAINER
   ========================================================= */

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Sheet container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg max-h-[90vh] bg-white dark:bg-[#10192A] rounded-t-3xl sm:rounded-3xl border border-[#E1E6F0] dark:border-[#2A374A] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Drag handle for mobile */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 sm:hidden" />

            {/* Header */}
            <div className="px-5 py-3 border-b border-[#E1E6F0] dark:border-[#2A374A] flex items-center justify-between">
              <div>
                {title && (
                  <h3 className="font-headline font-bold text-lg text-[#0F172A] dark:text-[#F8FAFC]">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs font-mono-telemetry text-slate-500 dark:text-slate-400">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* =========================================================
   TOASTS SYSTEM
   ========================================================= */

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#131D2E] border border-[#E1E6F0] dark:border-[#2A374A] shadow-xl text-[#0F172A] dark:text-[#F8FAFC]"
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && (
                <Check className="text-emerald-500" size={18} />
              )}
              {toast.type === 'warning' && (
                <AlertCircle className="text-amber-500" size={18} />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="text-rose-500" size={18} />
              )}
              {toast.type === 'info' && (
                <Info className="text-sky-500" size={18} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="font-headline font-semibold text-xs leading-snug">
                {toast.title}
              </h5>
              {toast.description && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {toast.description}
                </p>
              )}
              {toast.undoAction && (
                <button
                  onClick={() => {
                    toast.undoAction?.();
                    onDismiss(toast.id);
                  }}
                  className="text-xs font-semibold text-[#0284C7] dark:text-[#38BDF8] hover:underline mt-1 block"
                >
                  Desfazer
                </button>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

/* =========================================================
   SKELETON LOADER
   Shaped like real departure card
   ========================================================= */

export const DepartureCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#131D2E] border border-[#E1E6F0] dark:border-[#2A374A] animate-pulse flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded-md" />
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
      <div className="flex items-center gap-3 my-1">
        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-md" />
        </div>
      </div>
      <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" />
    </div>
  );
};
