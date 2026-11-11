import React, { useState } from 'react';
import {
  Button,
  FloatingInput,
  FilterChip,
  Toggle,
  BufferSlider,
  BottomSheet,
  DepartureCardSkeleton,
} from '../components/UIComponents';
import { ChronoPulse } from '../components/ChronoPulse';
import {
  Send,
  Navigation,
  Mic,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
  Clock,
  Layers,
} from 'lucide-react';
import { ChronoState } from '../types';

interface ComponentsShowcaseScreenProps {
  onTriggerToast: (title: string, desc?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const ComponentsShowcaseScreen: React.FC<ComponentsShowcaseScreenProps> = ({
  onTriggerToast,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [activeChip, setActiveChip] = useState('1');
  const [toggleState1, setToggleState1] = useState(true);
  const [toggleState2, setToggleState2] = useState(false);
  const [sliderVal, setSliderVal] = useState(12);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedChronoState, setSelectedChronoState] = useState<ChronoState>('calm');

  return (
    <div className="w-full flex flex-col gap-8 select-none">
      {/* Header */}
      <div>
        <span className="font-mono-telemetry text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-wider block">
          AEROSPACE DAYLIGHT // COMPONENT DESIGN SYSTEM
        </span>
        <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#0F172A] dark:text-white mt-1">
          Biblioteca de Componentes Departly
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Demonstração de todos os componentes com estados predefinidos: normal, hover, pressed, focused e disabled.
        </p>
      </div>

      {/* 1. SIGNATURE REACTIVE ELEMENT */}
      <section className="p-6 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline font-bold text-lg text-[#0F172A] dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-[#29B6F6]" />
              Elemento de Assinatura: ChronoPulse Orb
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Reage ao estado do utilizador, urgência de tráfego, escaneamento e sucesso de envio.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {(['calm', 'warning', 'scanning', 'empty', 'success'] as ChronoState[]).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedChronoState(st)}
              className={`px-3 py-1.5 rounded-full font-mono-telemetry text-xs font-semibold uppercase transition-all ${
                selectedChronoState === st
                  ? 'bg-[#29B6F6] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Estado: {st}
            </button>
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-[#F5F7FB] dark:bg-[#070D18] flex flex-col sm:flex-row items-center justify-around gap-6">
          <ChronoPulse
            state={selectedChronoState}
            size="lg"
            countdownMinutes={14}
            label="ChronoPulse Ativo"
            sublabel="Lisboa · Eixo Norte-Sul"
            interactive
          />

          <div className="text-xs font-mono-telemetry space-y-1.5 text-slate-600 dark:text-slate-400 max-w-xs">
            <div><strong className="text-slate-900 dark:text-white">Calm:</strong> Saída segura, anéis ciano regulares</div>
            <div><strong className="text-[#FF6B57]">Warning:</strong> Acidente/retenção, pulsação coral acelerada</div>
            <div><strong className="text-sky-500">Scanning:</strong> Recalibração de rotas, rotação dupla</div>
            <div><strong className="text-slate-400">Empty:</strong> Sem partidas pendentes</div>
            <div><strong className="text-emerald-500">Success:</strong> Disparo confirmado com asas 45°</div>
          </div>
        </div>
      </section>

      {/* 2. BUTTONS VARIATIONS & STATES */}
      <section className="p-6 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm space-y-4">
        <h3 className="font-headline font-bold text-lg text-[#0F172A] dark:text-white">
          Botões: Primário, Secundário, Urgente (Coral) e Ghost
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Primary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="font-mono-telemetry text-xs font-bold text-slate-400 block uppercase">
              Primário (Cyan Brand)
            </span>
            <Button variant="primary" className="w-full" icon={<Navigation size={14} />}>
              Partida Imediata
            </Button>
            <Button variant="primary" className="w-full" disabled>
              Desativado
            </Button>
          </div>

          {/* Secondary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="font-mono-telemetry text-xs font-bold text-slate-400 block uppercase">
              Secundário (Tonal)
            </span>
            <Button variant="secondary" className="w-full" icon={<Clock size={14} />}>
              Ver Histórico
            </Button>
            <Button variant="secondary" className="w-full" disabled>
              Desativado
            </Button>
          </div>

          {/* Urgent Coral */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="font-mono-telemetry text-xs font-bold text-slate-400 block uppercase">
              Urgente (Dynamic Coral)
            </span>
            <Button variant="urgent" className="w-full" icon={<Mic size={14} />}>
              Voicebot de Atraso
            </Button>
            <Button variant="urgent" className="w-full" disabled>
              Desativado
            </Button>
          </div>

          {/* Ghost / Outline */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="font-mono-telemetry text-xs font-bold text-slate-400 block uppercase">
              Ghost & Outline
            </span>
            <Button variant="ghost" className="w-full">
              Ação Secundária
            </Button>
            <Button variant="outline" className="w-full">
              Exportar Rota
            </Button>
          </div>
        </div>
      </section>

      {/* 3. INPUTS WITH FLOATING LABELS */}
      <section className="p-6 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm space-y-4">
        <h3 className="font-headline font-bold text-lg text-[#0F172A] dark:text-white">
          Campos de Texto com Floating Labels
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FloatingInput
            label="Morada de Destino"
            placeholder="Ex: Av. da Liberdade 245"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setInputError('');
            }}
            onClear={() => setInputValue('')}
            helperText="Rótulo flutuante sobe automaticamente ao focar ou preencher."
          />

          <FloatingInput
            label="Campo com Validação"
            value="Entrada inválida"
            readOnly
            error="Formato de código postal ou morada não reconhecido."
          />
        </div>
      </section>

      {/* 4. FILTER CHIPS, TOGGLES & SLIDERS */}
      <section className="p-6 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm space-y-6">
        <h3 className="font-headline font-bold text-lg text-[#0F172A] dark:text-white">
          Filter Chips, Toggles e Sliders
        </h3>

        {/* Chips */}
        <div className="space-y-2">
          <span className="font-mono-telemetry text-xs font-bold text-slate-400 block uppercase">
            Filter Chips com Contador
          </span>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="Todos os Trajetos"
              count={4}
              active={activeChip === '1'}
              onClick={() => setActiveChip('1')}
            />
            <FilterChip
              label="Alertas de Trânsito"
              count={1}
              active={activeChip === '2'}
              onClick={() => setActiveChip('2')}
            />
            <FilterChip
              label="Blocos Injetados"
              count={3}
              active={activeChip === '3'}
              onClick={() => setActiveChip('3')}
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Toggle
            checked={toggleState1}
            onChange={setToggleState1}
            label="Bloqueio de Agenda Ativo"
            description="Injeta intervalos 'Em Deslocação' no Google Calendar."
          />
          <Toggle
            checked={toggleState2}
            onChange={setToggleState2}
            label="Envio Automático Sem Confirmação"
            description="Envia aviso aos clientes após contagem decrescente de 5s."
          />
        </div>

        {/* Slider */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <BufferSlider
            value={sliderVal}
            onChange={setSliderVal}
            label="Margem de Segurança (5m a 30m)"
          />
        </div>
      </section>

      {/* 5. TOASTS & BOTTOM SHEETS */}
      <section className="p-6 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm space-y-4">
        <h3 className="font-headline font-bold text-lg text-[#0F172A] dark:text-white">
          Notificações Toast e Bottom Sheets
        </h3>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              onTriggerToast(
                'Bloco de Deslocação Injetado',
                'Janela 13:56 - 14:30 reservada com sucesso no calendário.',
                'success'
              )
            }
          >
            Disparar Toast de Sucesso
          </Button>

          <Button
            variant="urgent"
            onClick={() =>
              onTriggerToast(
                'Incidente Detetado na 2ª Circular',
                '+14 minutos de retenção estimada no seu trajeto.',
                'warning'
              )
            }
          >
            Disparar Toast de Alerta
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsSheetOpen(true)}
          >
            Abrir Bottom Sheet Modal
          </Button>
        </div>
      </section>

      {/* 6. SKELETON LOADER */}
      <section className="p-6 rounded-3xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-sm space-y-4">
        <h3 className="font-headline font-bold text-lg text-[#0F172A] dark:text-white">
          Skeleton Loader com Forma do Conteúdo Real
        </h3>
        <p className="text-xs text-slate-500">
          Apresenta a forma anatómica exata dos cartões de partida enquanto a telemetria GPS está a inicializar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DepartureCardSkeleton />
          <DepartureCardSkeleton />
        </div>
      </section>

      {/* Bottom Sheet Demo */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Demonstração de Bottom Sheet"
        subtitle="Ergonomia otimizada para zona do polegar em dispositivos móveis"
      >
        <div className="space-y-4 text-xs font-body text-slate-600 dark:text-slate-300">
          <p>
            Esta janela modal deslizante utiliza curvas de mola natural e cumpre o limite de 15% de sobreposição com toque ergonómico.
          </p>
          <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[#0284C7] dark:text-[#38BDF8]">
            Toque fora ou no botão fechar para recolher a folha com spring animation.
          </div>
          <Button
            variant="primary"
            className="w-full mt-2"
            onClick={() => setIsSheetOpen(false)}
          >
            Concluir Demonstração
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};
