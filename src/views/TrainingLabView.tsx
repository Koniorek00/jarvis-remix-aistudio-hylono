import React, { useMemo, useState } from 'react';
import { Award, Check, Pause, Play, Plus } from 'lucide-react';
import { MODULE_VISUALS } from '../assets/visualManifest';
import { PageHero } from '../components/ui/PageHero';
import { PhotographicCard } from '../components/ui/PhotographicCard';
import { SparklineSvg } from '../components/ui/SparklineSvg';
import { computeMuscleRecoveryMap } from '../engines/readinessEngine';
import { useJarvis } from '../store/jarvisStore';
import { MuscleGroup } from '../types/jarvis';

const MUSCLE_LABELS: Record<MuscleGroup, { pl: string; en: string }> = {
  chest: { pl: 'Klatka', en: 'Chest' },
  back: { pl: 'Plecy', en: 'Back' },
  shoulders: { pl: 'Barki', en: 'Shoulders' },
  legs: { pl: 'Nogi', en: 'Legs' },
  core: { pl: 'Core / Brzuch', en: 'Core' },
  arms: { pl: 'Ramiona', en: 'Arms' },
};

function recoveryFill(status: 'fresh' | 'recovering' | 'fatigued'): string {
  if (status === 'fresh') return '#10B981';
  if (status === 'recovering') return '#F59E0B';
  return '#EF4444';
}

export const TrainingLabView: React.FC = () => {
  const { state, dispatch, notify } = useJarvis();
  const lang = state.language;
  const tl = state.trainingLab;

  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState<MuscleGroup>('chest');

  const activeProtocol =
    tl.protocols.find((p) => p.id === tl.activeProtocolId) ?? tl.protocols[0];
  const recoveryMap = useMemo(() => computeMuscleRecoveryMap(tl.sessionLogs), [tl.sessionLogs]);

  const totalWeeklyTonnage = tl.weeklyTonnageKg.reduce((a, b) => a + b, 0);
  const totalWeeklyZone2 = tl.weeklyZone2Minutes.reduce((a, b) => a + b, 0);

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    dispatch({
      type: 'ADD_EXERCISE',
      protocolId: activeProtocol.id,
      name: newExName.trim(),
      muscleGroup: newExMuscle,
    });
    setNewExName('');
    notify(lang === 'pl' ? 'Dodano ćwiczenie do protokołu' : 'Exercise added to protocol', 'amber');
  };

  return (
    <div className="space-y-6">
      <PageHero
        moduleId="training-lab"
        kpis={[
          {
            label: lang === 'pl' ? 'Protokół' : 'Protocol',
            value: lang === 'pl' ? activeProtocol.titlePl : activeProtocol.titleEn,
            accent: true,
          },
          {
            label: lang === 'pl' ? 'Tonaż 7d' : '7d Volume',
            value: `${totalWeeklyTonnage.toLocaleString('pl-PL')} kg`,
          },
          { label: 'Zone 2 (7d)', value: `${totalWeeklyZone2} min` },
          {
            label: lang === 'pl' ? 'Minutnik przerwy' : 'Rest Timer',
            value: `${tl.restTimerSec}s`,
          },
        ]}
      />

      {/* Protocol Selector Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tl.protocols.map((proto) => {
          const isSelected = proto.id === activeProtocol.id;
          return (
            <button
              key={proto.id}
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_PROTOCOL', protocolId: proto.id })}
              className="text-left focus-visible:outline-none"
            >
              <PhotographicCard
                imageUrl={MODULE_VISUALS['training-lab'].cardUrl}
                fallbackGradient={MODULE_VISUALS['training-lab'].fallbackGradient}
                alt={lang === 'pl' ? proto.titlePl : proto.titleEn}
                className={`p-4 transition-transform duration-150 hover:scale-[1.01] ${
                  isSelected ? 'ring-2 ring-[#FFB020]' : ''
                }`}
              >
                <div className="font-mono text-[11px] text-[#FFB020]">{proto.durationMin} min</div>
                <div className="mt-1 text-sm font-bold text-white">
                  {lang === 'pl' ? proto.titlePl : proto.titleEn}
                </div>
                <div className="mt-1 text-xs text-slate-300">
                  {lang === 'pl' ? proto.focusPl : proto.focusEn}
                </div>
              </PhotographicCard>
            </button>
          );
        })}
      </div>

      {/* Main Split: Live Set Logger + Muscle Recovery SVG */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219] lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'pl' ? 'Rejestrator Serii na Żywo' : 'Live Workout Logger'}
            </h2>
            <div className="flex items-center gap-2">
              {([60, 90, 120] as const).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_REST_DEFAULT', sec })}
                  className={`rounded-lg px-2 py-1 font-mono text-xs ${
                    tl.restDefaultSec === sec
                      ? 'bg-[#FFB020] font-semibold text-[#090C11]'
                      : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300'
                  }`}
                >
                  {sec}s
                </button>
              ))}
              <button
                type="button"
                onClick={() => dispatch({ type: 'TOGGLE_REST_TIMER' })}
                className="flex items-center gap-1 rounded-lg bg-[#090C11] px-2.5 py-1 font-mono text-xs font-semibold tabular-nums text-white dark:bg-white/10"
              >
                {tl.restTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                <span>{tl.restTimerSec}s</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {activeProtocol.exercises.map((ex) => {
              const currentVol = ex.sets.reduce((a, s) => a + s.weightKg * s.reps, 0);
              const isPr = currentVol > ex.bestVolumeKg;

              return (
                <div
                  key={ex.id}
                  className="rounded-xl border border-slate-900/8 bg-slate-50/70 p-3.5 dark:border-white/8 dark:bg-white/[0.03]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {ex.name}
                        </span>
                        {isPr && (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#D97706] dark:text-[#FFB020]">
                            <Award className="h-3.5 w-3.5" /> PR ({currentVol} kg)
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {lang === 'pl' ? MUSCLE_LABELS[ex.muscleGroup].pl : MUSCLE_LABELS[ex.muscleGroup].en}{' '}
                        · Best: {ex.bestVolumeKg} kg
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'ADD_SET',
                          protocolId: activeProtocol.id,
                          exerciseId: ex.id,
                        })
                      }
                      className="flex items-center gap-1 rounded-lg border border-slate-900/12 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-white/12 dark:bg-white/5 dark:text-slate-200"
                    >
                      <Plus className="h-3 w-3" />
                      <span>{lang === 'pl' ? 'Seria' : 'Set'}</span>
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {ex.sets.map((s, idx) => (
                      <div
                        key={s.id}
                        className="grid grid-cols-12 items-center gap-2 text-xs font-mono tabular-nums"
                      >
                        <span className="col-span-2 text-slate-500 dark:text-slate-400">
                          #{idx + 1}
                        </span>
                        <label className="col-span-3 flex items-center gap-1">
                          <input
                            type="number"
                            value={s.weightKg}
                            onChange={(e) =>
                              dispatch({
                                type: 'UPDATE_EXERCISE_SET',
                                protocolId: activeProtocol.id,
                                exerciseId: ex.id,
                                setId: s.id,
                                weightKg: Number(e.target.value) || 0,
                                reps: s.reps,
                                rpe: s.rpe,
                              })
                            }
                            className="w-full rounded-lg border border-slate-900/10 bg-white px-2 py-1 text-right dark:border-white/10 dark:bg-[#0B0E14]"
                          />
                          <span className="text-slate-400">kg</span>
                        </label>
                        <label className="col-span-3 flex items-center gap-1">
                          <input
                            type="number"
                            value={s.reps}
                            onChange={(e) =>
                              dispatch({
                                type: 'UPDATE_EXERCISE_SET',
                                protocolId: activeProtocol.id,
                                exerciseId: ex.id,
                                setId: s.id,
                                weightKg: s.weightKg,
                                reps: Number(e.target.value) || 0,
                                rpe: s.rpe,
                              })
                            }
                            className="w-full rounded-lg border border-slate-900/10 bg-white px-2 py-1 text-right dark:border-white/10 dark:bg-[#0B0E14]"
                          />
                          <span className="text-slate-400">rep</span>
                        </label>
                        <label className="col-span-2 flex items-center gap-1">
                          <span className="text-slate-400">RPE</span>
                          <input
                            type="number"
                            step="0.5"
                            min={5}
                            max={10}
                            value={s.rpe}
                            onChange={(e) =>
                              dispatch({
                                type: 'UPDATE_EXERCISE_SET',
                                protocolId: activeProtocol.id,
                                exerciseId: ex.id,
                                setId: s.id,
                                weightKg: s.weightKg,
                                reps: s.reps,
                                rpe: Number(e.target.value) || 8,
                              })
                            }
                            className="w-full rounded-lg border border-slate-900/10 bg-white px-1.5 py-1 text-right dark:border-white/10 dark:bg-[#0B0E14]"
                          />
                        </label>
                        <div className="col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              dispatch({
                                type: 'TOGGLE_EXERCISE_SET',
                                protocolId: activeProtocol.id,
                                exerciseId: ex.id,
                                setId: s.id,
                              })
                            }
                            aria-label={`Complete set ${idx + 1} for ${ex.name}`}
                            className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
                              s.completed
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-slate-900/15 bg-white text-slate-400 hover:border-slate-900/35 dark:border-white/15 dark:bg-[#0B0E14]'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleAddExercise} className="flex flex-wrap gap-2 pt-2">
            <input
              type="text"
              value={newExName}
              onChange={(e) => setNewExName(e.target.value)}
              placeholder={lang === 'pl' ? 'Nowe ćwiczenie...' : 'Add exercise...'}
              className="h-9 flex-1 rounded-xl border border-slate-900/12 bg-slate-50 px-3 text-xs dark:border-white/12 dark:bg-white/5"
            />
            <select
              value={newExMuscle}
              onChange={(e) => setNewExMuscle(e.target.value as MuscleGroup)}
              className="h-9 rounded-xl border border-slate-900/12 bg-slate-50 px-2.5 text-xs dark:border-white/12 dark:bg-[#0B0E14]"
            >
              {(Object.keys(MUSCLE_LABELS) as MuscleGroup[]).map((m) => (
                <option key={m} value={m}>
                  {lang === 'pl' ? MUSCLE_LABELS[m].pl : MUSCLE_LABELS[m].en}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-9 rounded-xl border border-slate-900/15 bg-slate-100 px-3 text-xs font-semibold text-slate-900 hover:bg-slate-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
            >
              + {lang === 'pl' ? 'Dodaj' : 'Add'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'COMPLETE_WORKOUT_SESSION' });
              notify(
                lang === 'pl'
                  ? 'Sesja zapisana! Zaktualizowano mapę regeneracji i cel nawodnienia.'
                  : 'Workout logged! Muscle recovery map & hydration target updated.',
                'emerald'
              );
            }}
            className="w-full rounded-xl bg-[#FFB020] py-2.5 text-xs font-bold text-[#090C11] transition-opacity hover:opacity-90"
          >
            {lang === 'pl'
              ? 'Zakończ i Zapisz Sesję Treningową'
              : 'Complete & Save Workout Session'}
          </button>
        </div>

        {/* SVG Muscle Recovery Heatmap + Weekly Sparklines */}
        <div className="space-y-5 lg:col-span-5">
          <div className="rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219]">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'pl'
                ? 'Mapa Regeneracji Mięśni (72h)'
                : 'Muscle Recovery Heatmap (72h)'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {lang === 'pl'
                ? 'Zielony >=85% · Bursztyn 55–84% · Czerwony <55%'
                : 'Emerald >=85% · Amber 55–84% · Crimson <55%'}
            </p>

            <div className="mt-4 grid grid-cols-2 items-center gap-4">
              {/* Anatomical Front & Back Architectural SVG */}
              <svg viewBox="0 0 220 190" className="mx-auto h-44 w-full max-w-[220px]">
                {/* Front Figure */}
                <text x="55" y="14" textAnchor="middle" className="fill-slate-400 font-mono text-[9px]">
                  FRONT
                </text>
                <circle cx="55" cy="30" r="9" fill="#334155" />
                {/* Shoulders */}
                <rect x="30" y="42" width="12" height="14" rx="4" fill={recoveryFill(recoveryMap.shoulders.status)} />
                <rect x="68" y="42" width="12" height="14" rx="4" fill={recoveryFill(recoveryMap.shoulders.status)} />
                {/* Chest */}
                <rect x="43" y="43" width="24" height="20" rx="4" fill={recoveryFill(recoveryMap.chest.status)} />
                {/* Arms */}
                <rect x="27" y="58" width="10" height="34" rx="4" fill={recoveryFill(recoveryMap.arms.status)} />
                <rect x="73" y="58" width="10" height="34" rx="4" fill={recoveryFill(recoveryMap.arms.status)} />
                {/* Core */}
                <rect x="44" y="66" width="22" height="30" rx="4" fill={recoveryFill(recoveryMap.core.status)} />
                {/* Legs */}
                <rect x="41" y="100" width="12" height="58" rx="4" fill={recoveryFill(recoveryMap.legs.status)} />
                <rect x="57" y="100" width="12" height="58" rx="4" fill={recoveryFill(recoveryMap.legs.status)} />

                {/* Back Figure */}
                <text x="165" y="14" textAnchor="middle" className="fill-slate-400 font-mono text-[9px]">
                  BACK
                </text>
                <circle cx="165" cy="30" r="9" fill="#334155" />
                <rect x="140" y="42" width="12" height="14" rx="4" fill={recoveryFill(recoveryMap.shoulders.status)} />
                <rect x="178" y="42" width="12" height="14" rx="4" fill={recoveryFill(recoveryMap.shoulders.status)} />
                {/* Back */}
                <rect x="153" y="43" width="24" height="34" rx="4" fill={recoveryFill(recoveryMap.back.status)} />
                {/* Arms */}
                <rect x="137" y="58" width="10" height="34" rx="4" fill={recoveryFill(recoveryMap.arms.status)} />
                <rect x="183" y="58" width="10" height="34" rx="4" fill={recoveryFill(recoveryMap.arms.status)} />
                {/* Legs */}
                <rect x="151" y="100" width="12" height="58" rx="4" fill={recoveryFill(recoveryMap.legs.status)} />
                <rect x="167" y="100" width="12" height="58" rx="4" fill={recoveryFill(recoveryMap.legs.status)} />
              </svg>

              <div className="space-y-2 text-xs">
                {(Object.keys(MUSCLE_LABELS) as MuscleGroup[]).map((m) => {
                  const info = recoveryMap[m];
                  return (
                    <div key={m} className="flex items-center justify-between font-mono tabular-nums">
                      <span className="text-slate-700 dark:text-slate-300">
                        {lang === 'pl' ? MUSCLE_LABELS[m].pl : MUSCLE_LABELS[m].en}
                      </span>
                      <span style={{ color: recoveryFill(info.status) }} className="font-semibold">
                        {info.recoveryPct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'pl' ? 'Tygodniowy Tonaż & Zone 2' : 'Weekly Tonnage & Zone 2'}
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {lang === 'pl' ? 'Objętość (kg)' : 'Volume (kg)'}
                </div>
                <div className="mt-1">
                  <SparklineSvg values={tl.weeklyTonnageKg} color="#FFB020" width={150} height={38} />
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Zone 2 (min)</div>
                <div className="mt-1">
                  <SparklineSvg values={tl.weeklyZone2Minutes} color="#14F1D9" width={150} height={38} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingLabView;
