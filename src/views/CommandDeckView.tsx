import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Pin, PinOff, RotateCcw, Search } from 'lucide-react';
import { MODULE_ORDER, MODULE_VISUALS, prewarmModuleVisual } from '../assets/visualManifest';
import { PageHero } from '../components/ui/PageHero';
import { PhotographicCard } from '../components/ui/PhotographicCard';
import { AUDIO_PRESETS } from '../engines/audioDspEngine';
import { printHealthReportViaIframe } from '../engines/healthDossierExporter';
import {
  computeBiomarkerSummary,
  computeHydrationTarget,
  computeReadinessScore,
  computeRunwayMetrics,
  computeWarmthStatus,
} from '../engines/readinessEngine';
import { t } from '../store/i18n';
import { useJarvis } from '../store/jarvisStore';
import { ModuleId, PillarFilter } from '../types/jarvis';

interface CardMeta {
  headline: string;
  secondary: string;
  actions: {
    label: string;
    onClick: () => void;
  }[];
}

export const CommandDeckView: React.FC = () => {
  const { state, dispatch, notify } = useJarvis();
  const [pillarFilter, setPillarFilter] = useState<PillarFilter>('all');
  const [rawSearch, setRawSearch] = useState('');
  const [search, setSearch] = useState('');
  const lang = state.language;

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(rawSearch.trim().toLowerCase()), 120);
    return () => window.clearTimeout(timer);
  }, [rawSearch]);

  const cardMeta = useMemo<Record<Exclude<ModuleId, 'command-deck'>, CardMeta>>(() => {
    const readiness = computeReadinessScore(state.vitalPulse);
    const bioDone = state.vitalPulse.bioStackSteps.filter((s) => s.completed).length;

    const activeProto = state.trainingLab.protocols.find(
      (p) => p.id === state.trainingLab.activeProtocolId
    );
    const doneSets =
      activeProto?.exercises.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0) ?? 0;
    const totalSets = activeProto?.exercises.reduce((a, e) => a + e.sets.length, 0) ?? 0;

    const totalKcal = state.fuelNutrition.meals.reduce((a, m) => a + m.kcal, 0);
    const totalProtein = state.fuelNutrition.meals.reduce((a, m) => a + m.proteinG, 0);
    const todayIso = new Date().toISOString().slice(0, 10);
    const workoutToday = state.trainingLab.sessionLogs.some((l) => l.dateIso.startsWith(todayIso));
    const hydTarget = computeHydrationTarget({
      workoutToday,
      bioStackCompletedCount: bioDone,
    });

    const bm = computeBiomarkerSummary(state.healthDossier.biomarkers);
    const doneTasks = state.dayRhythm.tasks.filter((tk) => tk.done).length;
    const totalTasks = state.dayRhythm.tasks.length;
    const remMin = Math.floor(state.dayRhythm.remainingSec / 60);
    const remSec = state.dayRhythm.remainingSec % 60;
    const blockClock = `${String(remMin).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;

    const dueContacts = state.innerCircle.contacts.filter(
      (c) => computeWarmthStatus(c).status !== 'warm'
    ).length;

    const runway = computeRunwayMetrics(state.lifeFinance);
    const lowStockCount = state.lifeFinance.restockItems.filter((r) => r.status !== 'ok').length;

    const onlineNodes = state.hardwareNodes.nodes.filter((n) => n.status === 'online').length;
    const avgLatency = Math.round(
      state.hardwareNodes.nodes.reduce((a, n) => a + n.latencyMs, 0) /
        Math.max(1, state.hardwareNodes.nodes.length)
    );

    const activeAgents = state.aiSwarm.proposals.filter((p) => p.status === 'running').length;
    const pendingAgents = state.aiSwarm.proposals.filter((p) => p.status === 'pending').length;

    const dueAtoms = state.forgeMind.atoms.filter((a) => a.dueForReview).length;

    return {
      'vital-pulse': {
        headline: `Readiness ${readiness}/100 · HRV ${state.vitalPulse.hrvMs} ms`,
        secondary:
          lang === 'pl'
            ? `Sen ${state.vitalPulse.sleepHours}h · Bio-Stack ${bioDone}/${state.vitalPulse.bioStackSteps.length}`
            : `Sleep ${state.vitalPulse.sleepHours}h · Bio-Stack ${bioDone}/${state.vitalPulse.bioStackSteps.length}`,
        actions: [
          {
            label: lang === 'pl' ? 'Start Bio-Stack' : 'Start Bio-Stack',
            onClick: () => {
              dispatch({ type: 'START_BIO_STEP' });
              notify(lang === 'pl' ? 'Uruchomiono Bio-Stack 75m' : 'Bio-Stack 75m started', 'cyan');
            },
          },
          {
            label: 'Check-In',
            onClick: () => dispatch({ type: 'SET_MODULE', moduleId: 'vital-pulse' }),
          },
        ],
      },
      'training-lab': {
        headline: `${lang === 'pl' ? activeProto?.titlePl : activeProto?.titleEn} · ${doneSets}/${totalSets}`,
        secondary:
          lang === 'pl'
            ? `Ostatnia sesja: ${state.trainingLab.sessionLogs[0]?.totalVolumeKg ?? 0} kg`
            : `Last session: ${state.trainingLab.sessionLogs[0]?.totalVolumeKg ?? 0} kg`,
        actions: [
          {
            label: lang === 'pl' ? 'Start Treningu' : 'Start Workout',
            onClick: () => dispatch({ type: 'SET_MODULE', moduleId: 'training-lab' }),
          },
          {
            label: lang === 'pl' ? 'Szybka Seria' : 'Quick Set',
            onClick: () => {
              const ex = activeProto?.exercises[0];
              const set = ex?.sets.find((s) => !s.completed) ?? ex?.sets[0];
              if (activeProto && ex && set) {
                dispatch({
                  type: 'TOGGLE_EXERCISE_SET',
                  protocolId: activeProto.id,
                  exerciseId: ex.id,
                  setId: set.id,
                });
                notify(
                  lang === 'pl'
                    ? `Zapisano serię: ${ex.name} (${set.weightKg}kg × ${set.reps})`
                    : `Set logged: ${ex.name}`,
                  'amber'
                );
              }
            },
          },
        ],
      },
      'fuel-nutrition': {
        headline: `${totalKcal} / ${state.fuelNutrition.calorieTarget} kcal · ${totalProtein}g ${lang === 'pl' ? 'Białka' : 'Protein'}`,
        secondary: `${(state.fuelNutrition.waterMl / 1000).toFixed(2)}L / ${(hydTarget.targetMl / 1000).toFixed(2)}L · ${state.fuelNutrition.electrolytesCount}× Na/K`,
        actions: [
          {
            label: lang === 'pl' ? '+ Posiłek' : '+ Meal',
            onClick: () => {
              const fav = state.fuelNutrition.favorites[0];
              if (fav) {
                dispatch({
                  type: 'ADD_MEAL',
                  meal: {
                    namePl: fav.namePl,
                    nameEn: fav.nameEn,
                    kcal: fav.kcal,
                    proteinG: fav.proteinG,
                    fatG: fav.fatG,
                    carbsG: fav.carbsG,
                    fiberG: fav.fiberG,
                  },
                });
                notify(`+ ${lang === 'pl' ? fav.namePl : fav.nameEn}`, 'emerald');
              }
            },
          },
          {
            label: lang === 'pl' ? '+ 300ml Wody' : '+ 300ml Water',
            onClick: () => {
              dispatch({ type: 'ADD_WATER', ml: 300 });
              notify('+300 ml', 'cyan');
            },
          },
        ],
      },
      'health-dossier': {
        headline: `${bm.total} ${lang === 'pl' ? 'Biomarkerów' : 'Biomarkers'} · ${bm.optimal} ${lang === 'pl' ? 'Optymalnych' : 'Optimal'}`,
        secondary: `${bm.watch + bm.alert} ${lang === 'pl' ? 'Do obserwacji' : 'Watchlist'} · ${state.healthDossier.documents.length} ${lang === 'pl' ? 'Dokumenty' : 'Docs'}`,
        actions: [
          {
            label: lang === 'pl' ? 'Pobierz Raport PDF' : 'Export Health PDF',
            onClick: () => {
              printHealthReportViaIframe(state);
              notify(lang === 'pl' ? 'Generowanie Raportu Zdrowia PDF' : 'Generating Health Report PDF', 'cyan');
            },
          },
          {
            label: lang === 'pl' ? '+ Wynik Badania' : '+ Lab Result',
            onClick: () => dispatch({ type: 'SET_MODULE', moduleId: 'health-dossier' }),
          },
        ],
      },
      'day-rhythm': {
        headline: `${lang === 'pl' ? 'Blok 90m' : '90m Block'} · ${blockClock}`,
        secondary: `${doneTasks}/${totalTasks} ${lang === 'pl' ? 'zadań ukończonych' : 'tasks done'}`,
        actions: [
          {
            label: state.dayRhythm.timerRunning
              ? lang === 'pl'
                ? 'Pauza 90m'
                : 'Pause 90m'
              : lang === 'pl'
              ? 'Start 90m'
              : 'Start 90m',
            onClick: () => {
              dispatch({ type: 'TOGGLE_ULTRADIAN_TIMER' });
              notify(
                state.dayRhythm.timerRunning
                  ? lang === 'pl'
                    ? 'Wstrzymano blok 90m'
                    : '90m block paused'
                  : lang === 'pl'
                  ? 'Blok skupienia 90m aktywny'
                  : '90m focus block active',
                'cyan'
              );
            },
          },
          {
            label: lang === 'pl' ? '+ Zadanie' : '+ Task',
            onClick: () => dispatch({ type: 'SET_MODULE', moduleId: 'day-rhythm' }),
          },
        ],
      },
      'inner-circle': {
        headline: `${state.innerCircle.contacts.length} ${lang === 'pl' ? 'Bliskich Osób' : 'Inner Circle'}`,
        secondary:
          lang === 'pl'
            ? `${dueContacts} kontakty do odnowienia`
            : `${dueContacts} contacts due for warmth`,
        actions: [
          {
            label: lang === 'pl' ? 'Zapisz Kontakt' : 'Log Contact',
            onClick: () => {
              const target =
                state.innerCircle.contacts.find(
                  (c) => computeWarmthStatus(c).status !== 'warm'
                ) ?? state.innerCircle.contacts[0];
              if (target) {
                dispatch({ type: 'LOG_CONTACT_INTERACTION', contactId: target.id });
                notify(`${target.name} · ${lang === 'pl' ? 'Odświeżono kontakt' : 'Logged'}`, 'emerald');
              }
            },
          },
          {
            label: lang === 'pl' ? 'Wyślij Iskrę' : 'Bridge Idea',
            onClick: () => dispatch({ type: 'SET_MODULE', moduleId: 'inner-circle' }),
          },
        ],
      },
      'life-finance': {
        headline: `Runway ${runway.runwayMonths} ${lang === 'pl' ? 'mies.' : 'mo'} · ${runway.freedomRatePct}%`,
        secondary: `${lowStockCount} ${lang === 'pl' ? 'braki do uzupełnienia' : 'items to restock'}`,
        actions: [
          {
            label: lang === 'pl' ? '+ Wydatek/Wpływ' : '+ Cashflow',
            onClick: () => dispatch({ type: 'SET_MODULE', moduleId: 'life-finance' }),
          },
          {
            label: lang === 'pl' ? 'Lista Zakupów' : 'Restock Board',
            onClick: () => dispatch({ type: 'SET_MODULE', moduleId: 'life-finance' }),
          },
        ],
      },
      'hardware-nodes': {
        headline: `Mesh ${onlineNodes}/4 Online · ${state.osMode}`,
        secondary: `${avgLatency} ms · ${state.hardwareNodes.bioGear.length} Bio-Gear`,
        actions: [
          {
            label: lang === 'pl' ? 'Zmień Tryb OS' : 'Cycle OS Mode',
            onClick: () => {
              const modes = ['ACTIVE', 'DEEP WORK', 'FIELD', 'STEALTH'] as const;
              const next = modes[(modes.indexOf(state.osMode) + 1) % modes.length];
              dispatch({ type: 'SET_OS_MODE', mode: next });
              notify(`OS Mode: ${next}`, 'cyan');
            },
          },
          {
            label: lang === 'pl' ? 'Ping Floty' : 'Ping Fleet',
            onClick: () => {
              dispatch({ type: 'PING_NODES' });
              notify(lang === 'pl' ? 'Odświeżono telemetrię S1–S4' : 'S1–S4 mesh pinged', 'cyan');
            },
          },
        ],
      },
      'ai-swarm': {
        headline: `${activeAgents} ${lang === 'pl' ? 'Aktywne' : 'Active'} · ${pendingAgents} ${lang === 'pl' ? 'Czeka' : 'Pending'}`,
        secondary: `$${state.aiSwarm.spentTodayUsd.toFixed(2)} / $${state.aiSwarm.dailyBudgetCapUsd} ${lang === 'pl' ? 'limitu' : 'cap'}`,
        actions: [
          {
            label: lang === 'pl' ? 'Zatwierdź Plan' : 'Approve Plan',
            onClick: () => {
              const pending = state.aiSwarm.proposals.find((p) => p.status === 'pending');
              if (pending) {
                dispatch({ type: 'APPROVE_PROPOSAL', proposalId: pending.id });
                notify(`${pending.title}`, 'emerald');
              } else {
                dispatch({ type: 'SET_MODULE', moduleId: 'ai-swarm' });
              }
            },
          },
          {
            label: lang === 'pl' ? 'Wyślij Research' : 'Dispatch Job',
            onClick: () => dispatch({ type: 'SET_MODULE', moduleId: 'ai-swarm' }),
          },
        ],
      },
      'forge-mind': {
        headline: `${state.forgeMind.totalAtomsCount} ${lang === 'pl' ? 'Atomów' : 'Atoms'} (.jkp)`,
        secondary: `${dueAtoms} ${lang === 'pl' ? 'do powtórki' : 'due'} · Sprint ${state.forgeMind.sprintDay}/${state.forgeMind.sprintTotalDays}`,
        actions: [
          {
            label: 'Drill 3 min',
            onClick: () => {
              dispatch({ type: 'SET_ACTIVE_VESSEL', vessel: 'recall' });
              dispatch({ type: 'SET_MODULE', moduleId: 'forge-mind' });
            },
          },
          {
            label: lang === 'pl' ? 'Widok 6 Naczyń' : '6 Vessels',
            onClick: () => dispatch({ type: 'SET_MODULE', moduleId: 'forge-mind' }),
          },
        ],
      },
      'sanctuary-audio': {
        headline: state.sanctuaryAudio.playing
          ? `${AUDIO_PRESETS[state.sanctuaryAudio.preset].freqLabel} · Playing`
          : lang === 'pl'
          ? 'Silnik DSP Gotowy'
          : 'DSP Synth Ready',
        secondary:
          state.sanctuaryAudio.outputMode === 'headphones'
            ? lang === 'pl'
              ? 'Słuchawki Binaural'
              : 'Binaural Headphones'
            : lang === 'pl'
            ? 'Głośnik Izochroniczne'
            : 'Isochronic Speakers',
        actions: [
          {
            label: lang === 'pl' ? 'Wycisz 6Hz' : 'Play Calm 6Hz',
            onClick: () => {
              dispatch({ type: 'SET_AUDIO_PRESET', preset: 'calm', autoPlay: true });
              notify('Sanctuary DSP · Calm 6 Hz', 'cyan');
            },
          },
          {
            label: 'Focus 16Hz',
            onClick: () => {
              dispatch({ type: 'SET_AUDIO_PRESET', preset: 'focus', autoPlay: true });
              notify('Sanctuary DSP · Focus 16 Hz', 'cyan');
            },
          },
        ],
      },
    };
  }, [state, lang, dispatch, notify]);

  const moduleIds = MODULE_ORDER.filter(
    (id): id is Exclude<ModuleId, 'command-deck'> => id !== 'command-deck'
  );

  const filteredIds = useMemo(() => {
    return moduleIds.filter((id) => {
      const spec = MODULE_VISUALS[id];
      if (pillarFilter === 'pinned' && !state.pinnedModules.includes(id)) return false;
      if (pillarFilter === 'body' && spec.pillar !== 'body') return false;
      if (pillarFilter === 'life' && spec.pillar !== 'life') return false;
      if (pillarFilter === 'mind' && spec.pillar !== 'mind') return false;
      if (search) {
        const meta = cardMeta[id];
        const hay = `${spec.titlePl} ${spec.titleEn} ${spec.subtitlePl} ${meta.headline} ${meta.secondary}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }, [moduleIds, pillarFilter, state.pinnedModules, search, cardMeta]);

  const pinnedList = state.pinnedModules.filter((id): id is Exclude<ModuleId, 'command-deck'> =>
    filteredIds.includes(id as Exclude<ModuleId, 'command-deck'>)
  );
  const unpinnedList = filteredIds.filter((id) => !state.pinnedModules.includes(id));

  const renderCard = (id: Exclude<ModuleId, 'command-deck'>, isPinned: boolean, index: number) => {
    const spec = MODULE_VISUALS[id];
    const meta = cardMeta[id];
    const title = lang === 'pl' ? spec.titlePl : spec.titleEn;

    if (state.deckViewMode === 'compact') {
      return (
        <div
          key={id}
          onMouseEnter={() => prewarmModuleVisual(id)}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-900/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0E1219]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="font-mono text-xs font-semibold tabular-nums"
              style={{ color: spec.accent }}
            >
              {spec.code}
            </span>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_MODULE', moduleId: id })}
              className="truncate text-sm font-semibold text-slate-900 hover:underline dark:text-white"
            >
              {title}
            </button>
            <span className="hidden text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 md:inline">
              {meta.headline}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {meta.actions.map((act) => (
              <button
                key={act.label}
                type="button"
                onClick={act.onClick}
                className="whitespace-nowrap rounded-lg border border-slate-900/10 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                {act.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => dispatch({ type: 'TOGGLE_PIN_MODULE', moduleId: id })}
              aria-label={isPinned ? `${t(lang, 'unpinCard')} ${title}` : `${t(lang, 'pinCard')} ${title}`}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
            >
              {isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={id} onMouseEnter={() => prewarmModuleVisual(id)}>
        <PhotographicCard
          imageUrl={spec.cardUrl}
          fallbackGradient={spec.fallbackGradient}
          alt={title}
          eager={isPinned}
          belowFold={!isPinned}
          accentColor={spec.accent}
          className={`flex flex-col justify-between p-5 ${isPinned ? 'min-h-[224px]' : 'min-h-[196px]'}`}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                <span style={{ color: spec.accent }}>{spec.code}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {spec.pillar === 'body'
                    ? t(lang, 'pillarBody')
                    : spec.pillar === 'life'
                    ? t(lang, 'pillarLife')
                    : t(lang, 'pillarMind')}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {isPinned && (
                  <>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() =>
                        dispatch({ type: 'MOVE_PINNED_MODULE', moduleId: id, direction: 'left' })
                      }
                      aria-label={`${t(lang, 'moveLeft')} ${title}`}
                      className="rounded-lg border border-white/10 bg-white/5 p-1 text-slate-300 transition-colors hover:bg-white/15 disabled:opacity-30"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === pinnedList.length - 1}
                      onClick={() =>
                        dispatch({ type: 'MOVE_PINNED_MODULE', moduleId: id, direction: 'right' })
                      }
                      aria-label={`${t(lang, 'moveRight')} ${title}`}
                      className="rounded-lg border border-white/10 bg-white/5 p-1 text-slate-300 transition-colors hover:bg-white/15 disabled:opacity-30"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'TOGGLE_PIN_MODULE', moduleId: id })}
                  aria-label={isPinned ? `${t(lang, 'unpinCard')} ${title}` : `${t(lang, 'pinCard')} ${title}`}
                  className="rounded-lg border border-white/10 bg-white/5 p-1 text-slate-300 transition-colors hover:bg-white/15"
                >
                  {isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_MODULE', moduleId: id })}
                  aria-label={`${t(lang, 'openModule')} ${title}`}
                  className="rounded-lg border border-white/10 bg-white/5 p-1 text-slate-300 transition-colors hover:bg-white/15"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_MODULE', moduleId: id })}
              className="mt-2.5 block text-left focus-visible:outline-none"
            >
              <h2 className="text-lg font-bold tracking-tight text-white hover:underline">
                {title}
              </h2>
            </button>

            <div
              className="mt-2 font-mono text-sm font-semibold tabular-nums"
              style={{ color: spec.accent }}
            >
              {meta.headline}
            </div>
            <div className="mt-1 font-mono text-xs tabular-nums text-slate-300">{meta.secondary}</div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {meta.actions.map((act) => (
              <button
                key={act.label}
                type="button"
                onClick={act.onClick}
                className="whitespace-nowrap shrink-0 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-white/35 hover:bg-white/20"
              >
                {act.label}
              </button>
            ))}
          </div>
        </PhotographicCard>
      </div>
    );
  };

  const readiness = computeReadinessScore(state.vitalPulse);
  const runway = computeRunwayMetrics(state.lifeFinance);
  const bm = computeBiomarkerSummary(state.healthDossier.biomarkers);

  const filterTabs: { id: PillarFilter; label: string }[] = [
    { id: 'all', label: t(lang, 'filterAll') },
    { id: 'pinned', label: t(lang, 'filterPinned') },
    { id: 'body', label: t(lang, 'filterBody') },
    { id: 'life', label: t(lang, 'filterLife') },
    { id: 'mind', label: t(lang, 'filterMind') },
  ];

  return (
    <div className="space-y-6">
      <PageHero
        moduleId="command-deck"
        kpis={[
          { label: 'Readiness', value: `${readiness}/100`, accent: true },
          { label: lang === 'pl' ? 'Nawodnienie' : 'Hydration', value: `${(state.fuelNutrition.waterMl / 1000).toFixed(2)} L` },
          { label: lang === 'pl' ? 'Biomarkery' : 'Biomarkers', value: `${bm.optimal}/${bm.total}` },
          { label: 'Runway', value: `${runway.runwayMonths} m` },
        ]}
        controls={
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/12 bg-black/40 p-1">
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_DECK_VIEW_MODE', mode: 'bento' })}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                state.deckViewMode === 'bento'
                  ? 'bg-[#14F1D9] text-[#090C11]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {t(lang, 'viewBento')}
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_DECK_VIEW_MODE', mode: 'compact' })}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                state.deckViewMode === 'compact'
                  ? 'bg-[#14F1D9] text-[#090C11]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {t(lang, 'viewCompact')}
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'RESET_LAYOUT' });
                notify(lang === 'pl' ? 'Przywrócono układ domyślny' : 'Layout reset', 'cyan');
              }}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{t(lang, 'resetLayout')}</span>
            </button>
          </div>
        }
      />

      {/* Pillar Filters + Instant Module/Action Search */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-900/10 bg-white p-1 dark:border-white/10 dark:bg-[#0E1219]">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPillarFilter(tab.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                pillarFilter === tab.id
                  ? 'bg-[#090C11] text-white dark:bg-[#14F1D9] dark:text-[#090C11]'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            placeholder={lang === 'pl' ? 'Filtruj moduły...' : 'Filter modules...'}
            aria-label={lang === 'pl' ? 'Filtruj moduły' : 'Filter modules'}
            className="h-9 w-full rounded-xl border border-slate-900/10 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#14F1D9] focus:outline-none dark:border-white/10 dark:bg-[#0E1219] dark:text-white"
          />
        </div>
      </div>

      {/* Pinned 2x2 Section */}
      {pinnedList.length > 0 && (
        <section aria-label={t(lang, 'pinnedSectionTitle')}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              {t(lang, 'pinnedSectionTitle')} ({pinnedList.length})
            </h2>
          </div>
          <div
            className={
              state.deckViewMode === 'compact'
                ? 'space-y-2'
                : 'grid grid-cols-1 gap-4 md:grid-cols-2'
            }
          >
            {pinnedList.map((id, idx) => renderCard(id, true, idx))}
          </div>
        </section>
      )}

      {/* All Systems Section */}
      {unpinnedList.length > 0 && (
        <section aria-label={t(lang, 'allSystemsTitle')}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              {t(lang, 'allSystemsTitle')} ({unpinnedList.length})
            </h2>
          </div>
          <div
            className={
              state.deckViewMode === 'compact'
                ? 'space-y-2'
                : 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'
            }
          >
            {unpinnedList.map((id, idx) => renderCard(id, false, idx))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CommandDeckView;
