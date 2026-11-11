import React from 'react';
import { ChronoPulse } from './ChronoPulse';
import { Button, DepartureCardSkeleton } from './UIComponents';
import { RefreshCw, Plus, AlertTriangle, ShieldCheck, Sparkles, Navigation } from 'lucide-react';

/* =========================================================
   EMPTY STATE VIEW
   ========================================================= */

interface EmptyStateViewProps {
  onAddTrip: () => void;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  onAddTrip,
}) => {
  return (
    <div className="w-full p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm flex flex-col items-center justify-center text-center my-4 select-none">
      <ChronoPulse state="empty" size="lg" />

      <h3 className="font-headline font-bold text-xl sm:text-2xl text-[#0F172A] dark:text-white mt-5">
        Céu Limpo. Zero Partidas Pendentes
      </h3>
      <p className="font-body text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md">
        Nenhum evento com deslocação física requer a sua atenção neste momento. O Departly continua a monitorizar a sua agenda para prevenir colisões de calendário.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={onAddTrip}
        >
          Adicionar Reunião & Bloco
        </Button>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono-telemetry text-slate-400 flex items-center gap-1.5">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span>Sincronização invisível de calendário ativa em segundo plano.</span>
      </div>
    </div>
  );
};

/* =========================================================
   LOADING STATE VIEW
   ========================================================= */

export const LoadingStateView: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-6 select-none animate-pulse">
      <div className="w-full p-8 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] flex flex-col items-center text-center">
        <ChronoPulse state="scanning" size="hero" />

        <h3 className="font-headline font-bold text-xl text-[#0F172A] dark:text-white mt-4">
          Calibrando Telemetria GPS & Tráfego Lisboa
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          A cruzar dados de satélite Google Maps com os seus compromissos no Google Calendar...
        </p>
      </div>

      <div className="space-y-3">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-md" />
        <DepartureCardSkeleton />
        <DepartureCardSkeleton />
      </div>
    </div>
  );
};

/* =========================================================
   ERROR STATE VIEW
   ========================================================= */

interface ErrorStateViewProps {
  onRetry: () => void;
}

export const ErrorStateView: React.FC<ErrorStateViewProps> = ({ onRetry }) => {
  return (
    <div className="w-full p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#10192A] border border-rose-200 dark:border-rose-900 shadow-sm flex flex-col items-center justify-center text-center my-4 select-none">
      <ChronoPulse state="warning" size="lg" />

      <h3 className="font-headline font-bold text-xl sm:text-2xl text-rose-600 dark:text-rose-400 mt-5">
        Interrupção Temporária de Radar GPS
      </h3>
      <p className="font-body text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-md">
        Não foi possível contactar a API de trânsito em tempo real (possível túnel ou quebra de rede). As margens de segurança locais mantêm-se ativas para prevenir atrasos.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <Button
          variant="urgent"
          icon={<RefreshCw size={16} />}
          onClick={onRetry}
        >
          Recalibrar Conexão GPS
        </Button>
      </div>

      <div className="mt-6 text-[11px] font-mono-telemetry text-slate-400">
        CÓDIGO DE TELEMETRIA: CORRIDOR_TIMEOUT_408 // LISBOA_SECTOR_3
      </div>
    </div>
  );
};
