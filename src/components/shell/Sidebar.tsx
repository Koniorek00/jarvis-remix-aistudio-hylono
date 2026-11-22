import React, { useMemo, useState } from 'react';
import {
  Activity,
  Bot,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Dumbbell,
  Flame,
  HeartHandshake,
  LayoutGrid,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  Volume2,
  Wallet,
  X,
} from 'lucide-react';
import { MODULE_ORDER, MODULE_VISUALS, prewarmModuleVisual } from '../../assets/visualManifest';
import { AUDIO_PRESETS } from '../../engines/audioDspEngine';
import {
  computeBiomarkerSummary,
  computeReadinessScore,
  computeRunwayMetrics,
  computeWarmthStatus,
} from '../../engines/readinessEngine';
import { t } from '../../store/i18n';
import { useJarvis } from '../../store/jarvisStore';
import { ModuleId, OsMode } from '../../types/jarvis';

const MODULE_ICONS: Record<ModuleId, React.ComponentType<{ className?: string }>> = {
  'command-deck': LayoutGrid,
  'vital-pulse': Activity,
  'training-lab': Dumbbell,
  'fuel-nutrition': Flame,
  'health-dossier': ShieldCheck,
  'day-rhythm': Clock,
  'inner-circle': HeartHandshake,
  'life-finance': Wallet,
  'hardware-nodes': Cpu,
  'ai-swarm': Bot,
  'forge-mind': Sparkles,
  'sanctuary-audio': Volume2,
};

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface SidebarNavItemProps {
  moduleId: ModuleId;
  active: boolean;
  collapsed: boolean;
  badgeText: string;
  onSelect: (id: ModuleId) => void;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = React.memo(
  ({ moduleId, active, collapsed, badgeText, onSelect }) => {
    const { state } = useJarvis();
    const [imgErr, setImgErr] = useState(false);
    const spec = MODULE_VISUALS[moduleId];
    const Icon = MODULE_ICONS[moduleId];
    const title = state.language === 'pl' ? (spec.sidebarTitlePl ?? spec.titlePl) : spec.titleEn;

    return (
      <button
        type="button"
        onClick={() => onSelect(moduleId)}
        onMouseEnter={() => prewarmModuleVisual(moduleId)}
        title={collapsed ? `${title} · ${badgeText}` : undefined}
        aria-current={active ? 'page' : undefined}
        className={`group relative flex h-11 w-full items-center overflow-hidden rounded-xl border text-left transition-transform duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14F1D9] ${
          active
            ? 'border-[#14F1D9]/80 shadow-[0_0_16px_-4px_rgba(20,241,217,0.45)]'
            : 'border-white/8 hover:border-white/25'
        } ${collapsed ? 'justify-center px-2' : 'justify-between px-2.5'}`}
        style={{ backgroundImage: spec.fallbackGradient }}
      >
        {!imgErr && (
          <img
            src={spec.sidebarUrl}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgErr(true)}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right opacity-85 transition-opacity duration-200 group-hover:opacity-100"
          />
        )}
        <div className="sidebar-scrim pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative z-10 flex min-w-0 items-center gap-2">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/8"
            style={{ color: active ? '#14F1D9' : spec.accent }}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          {!collapsed && (
            <span className="truncate text-[11.5px] font-semibold tracking-tight text-slate-100">
              {title}
            </span>
          )}
        </div>

        {!collapsed && (
          <span className="relative z-10 ml-2 shrink-0 rounded-md bg-[#090C11]/75 px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-slate-200">
            {badgeText}
          </span>
        )}
      </button>
    );
  }
);

SidebarNavItem.displayName = 'SidebarNavItem';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const OS_MODES: OsMode[] = ['ACTIVE', 'DEEP WORK', 'FIELD', 'STEALTH'];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { state, dispatch, notify } = useJarvis();
  const collapsed = state.sidebarCollapsed;
  const lang = state.language;

  const badges = useMemo<Record<ModuleId, string>>(() => {
    const readiness = computeReadinessScore(state.vitalPulse);
    const activeProto = state.trainingLab.protocols.find(
      (p) => p.id === state.trainingLab.activeProtocolId
    );
    const totalSets = activeProto?.exercises.reduce((a, e) => a + e.sets.length, 0) ?? 0;
    const doneSets =
      activeProto?.exercises.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0) ?? 0;
    const totalKcal = state.fuelNutrition.meals.reduce((a, m) => a + m.kcal, 0);
    const bmSummary = computeBiomarkerSummary(state.healthDossier.biomarkers);
    const pendingTasks = state.dayRhythm.tasks.filter((tk) => !tk.done).length;
    const dueContacts = state.innerCircle.contacts.filter(
      (c) => computeWarmthStatus(c).status !== 'warm'
    ).length;
    const runway = computeRunwayMetrics(state.lifeFinance);
    const onlineNodes = state.hardwareNodes.nodes.filter((n) => n.status === 'online').length;
    const pendingAgents = state.aiSwarm.proposals.filter((p) => p.status === 'pending').length;
    const dueAtoms = state.forgeMind.atoms.filter((a) => a.dueForReview).length;

    return {
      'command-deck': `${state.pinnedModules.length} PIN`,
      'vital-pulse': `${readiness}`,
      'training-lab': `${doneSets}/${totalSets}`,
      'fuel-nutrition': `${totalKcal}`,
      'health-dossier': `${bmSummary.optimal}/${bmSummary.total}`,
      'day-rhythm': `${pendingTasks}`,
      'inner-circle': dueContacts > 0 ? `${dueContacts}!` : 'OK',
      'life-finance': `${runway.runwayMonths}m`,
      'hardware-nodes': `${onlineNodes}/4`,
      'ai-swarm': `${pendingAgents}`,
      'forge-mind': `${dueAtoms}`,
      'sanctuary-audio': state.sanctuaryAudio.playing ? 'ON' : 'DSP',
    };
  }, [state]);

  const liveSession = useMemo(() => {
    if (state.sanctuaryAudio.playing) {
      const preset = AUDIO_PRESETS[state.sanctuaryAudio.preset];
      return {
        label: `${preset.freqLabel} · ${formatClock(state.sanctuaryAudio.remainingSec)}`,
        target: 'sanctuary-audio' as ModuleId,
        active: true,
        onToggle: () => dispatch({ type: 'TOGGLE_AUDIO_PLAY' }),
      };
    }
    if (state.dayRhythm.timerRunning) {
      return {
        label: `Focus Block · ${formatClock(state.dayRhythm.remainingSec)}`,
        target: 'day-rhythm' as ModuleId,
        active: true,
        onToggle: () => dispatch({ type: 'TOGGLE_ULTRADIAN_TIMER' }),
      };
    }
    if (state.vitalPulse.activeStepRunning) {
      const done = state.vitalPulse.bioStackSteps.filter((s) => s.completed).length;
      return {
        label: `Bio-Stack · ${done}/${state.vitalPulse.bioStackSteps.length} · ${formatClock(state.vitalPulse.activeStepRemainingSec)}`,
        target: 'vital-pulse' as ModuleId,
        active: true,
        onToggle: () => dispatch({ type: 'PAUSE_BIO_STEP' }),
      };
    }
    const doneSteps = state.vitalPulse.bioStackSteps.filter((s) => s.completed).length;
    return {
      label:
        lang === 'pl'
          ? `Morning Stack · ${doneSteps}/${state.vitalPulse.bioStackSteps.length}`
          : `Morning Stack · ${doneSteps}/${state.vitalPulse.bioStackSteps.length}`,
      target: 'vital-pulse' as ModuleId,
      active: false,
      onToggle: () => {
        dispatch({ type: 'START_BIO_STEP' });
        notify(lang === 'pl' ? 'Uruchomiono krok Bio-Stack' : 'Bio-Stack step started', 'cyan');
      },
    };
  }, [state, lang, dispatch, notify]);

  const handleSelectModule = (id: ModuleId) => {
    dispatch({ type: 'SET_MODULE', moduleId: id });
    onCloseMobile();
  };

  const railContent = (
    <div className="flex h-full flex-col bg-[#090C11] text-slate-100">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/8 px-3.5">
        <button
          type="button"
          onClick={() => handleSelectModule('command-deck')}
          className="flex min-w-0 items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14F1D9] rounded-lg"
        >
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#14F1D9] shadow-[0_0_14px_rgba(20,241,217,0.4)]">
            <span className="h-2.5 w-2.5 rounded-full border border-[#14F1D9]/90" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-bold tracking-wider text-white">JARVIS</div>
              <div className="truncate font-mono text-[10px] tracking-widest text-[#14F1D9]">
                {t(lang, 'brandSubtitle')}
              </div>
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:border-white/25 hover:text-white lg:flex"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label={t(lang, 'close')}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-300 lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Modules */}
      <nav
        aria-label="JARVIS Primary Navigation"
        className="flex-1 space-y-1.5 overflow-y-auto px-2.5 py-3"
      >
        {MODULE_ORDER.map((id) => (
          <SidebarNavItem
            key={id}
            moduleId={id}
            active={state.activeModule === id}
            collapsed={collapsed}
            badgeText={badges[id]}
            onSelect={handleSelectModule}
          />
        ))}
      </nav>

      {/* Bottom Live Session Pill + Operator Identity */}
      <div className="shrink-0 space-y-2.5 border-t border-white/8 p-2.5">
        <div
          className={`flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2 ${
            liveSession.active
              ? 'border-[#14F1D9]/50 bg-[#14F1D9]/10'
              : 'border-white/10 bg-white/[0.03]'
          }`}
        >
          <button
            type="button"
            onClick={() => handleSelectModule(liveSession.target)}
            className="min-w-0 flex-1 text-left focus-visible:outline-none"
          >
            {!collapsed ? (
              <>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#14F1D9]">
                  {liveSession.active ? 'LIVE ENGINE' : 'SESSION'}
                </div>
                <div className="truncate font-mono text-xs font-medium tabular-nums text-white">
                  {liveSession.label}
                </div>
              </>
            ) : (
              <span className="block text-center font-mono text-[10px] text-[#14F1D9]">LIVE</span>
            )}
          </button>
          <button
            type="button"
            onClick={liveSession.onToggle}
            aria-label={liveSession.active ? 'Pause live session' : 'Start live session'}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#14F1D9]/20 text-[#14F1D9] transition-colors hover:bg-[#14F1D9]/30"
          >
            {liveSession.active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
        </div>

        {!collapsed && (
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-2.5">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-white">
                  {state.healthDossier.operatorName}
                </div>
                <div className="truncate font-mono text-[10px] text-slate-400">
                  {t(lang, 'operatorSubtitle')}
                </div>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1">
              {OS_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'SET_OS_MODE', mode });
                    notify(`OS Mode: ${mode}`, 'cyan');
                  }}
                  className={`whitespace-nowrap rounded-md px-1.5 py-1 font-mono text-[10px] font-medium transition-colors ${
                    state.osMode === mode
                      ? 'bg-[#14F1D9] text-[#090C11]'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Rail */}
      <aside
        className={`hidden shrink-0 border-r border-white/10 transition-[width] duration-150 lg:block ${
          collapsed ? 'w-[72px]' : 'w-[252px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{railContent}</div>
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label={t(lang, 'close')}
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/70"
          />
          <div className="relative z-10 h-full w-[264px] border-r border-white/10">{railContent}</div>
        </div>
      )}
    </>
  );
};
