import React from 'react';

interface DepartlyBrandProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  onClick?: () => void;
  className?: string;
}

export const DepartlyBrand: React.FC<DepartlyBrandProps> = ({
  size = 'md',
  showSubtitle = false,
  subtitleText = 'Departure Intelligence',
  onClick,
  className = '',
}) => {
  // Size presets
  const sizeMap = {
    sm: {
      imgH: 'h-6 sm:h-7',
      text: 'text-xl sm:text-2xl',
      margin: '-mr-1',
    },
    md: {
      imgH: 'h-8 sm:h-9',
      text: 'text-2xl sm:text-3xl',
      margin: '-mr-1.5',
    },
    lg: {
      imgH: 'h-11 sm:h-13',
      text: 'text-3xl sm:text-4xl',
      margin: '-mr-2',
    },
    xl: {
      imgH: 'h-14 sm:h-16',
      text: 'text-4xl sm:text-5xl',
      margin: '-mr-2.5',
    },
  };

  const current = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center">
        {/* Light theme logo: The "D" has the original dark arch */}
        <img
          src="/departly-logo.png"
          alt="Departly Logo (Light Theme)"
          className={`${current.imgH} w-auto object-contain ${current.margin} drop-shadow-sm block dark:hidden transition-transform duration-200 hover:scale-105`}
        />
        {/* Dark theme logo: The "D" arch is white */}
        <img
          src="/departly-logo-dark.png"
          alt="Departly Logo (Dark Theme - White Arch)"
          className={`${current.imgH} w-auto object-contain ${current.margin} drop-shadow-sm hidden dark:block transition-transform duration-200 hover:scale-105`}
        />

        {/* Wordmark: In light theme 'epart' matches the dark arch of 'D'; in dark theme 'epart' is white matching the white arch of 'D' */}
        <span
          className={`font-headline ${current.text} font-bold tracking-tight text-[#181c1f] dark:text-white flex items-center leading-none transition-colors duration-200`}
        >
          epart<span className="text-[#29B6F6]">ly</span>
        </span>
      </div>

      {showSubtitle && (
        <span className="ml-3 pl-3 border-l border-slate-300 dark:border-slate-700 font-mono-telemetry text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden sm:inline-block">
          {subtitleText}
        </span>
      )}
    </div>
  );
};
