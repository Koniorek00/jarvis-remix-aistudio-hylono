import React, { useMemo, useState } from 'react';
import { Check, Pause, Play } from 'lucide-react';
import { MODULE_VISUALS } from '../assets/visualManifest';
import { PageHero } from '../components/ui/PageHero';
import { PhotographicCard } from '../components/ui/PhotographicCard';
import { computeCircadianCurve, computeReadinessScore } from '../engines/readinessEngine';
import { useJarvis } from '../store/jarvisStore';

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const VitalPulseView: React.FC = () => {
  const { state, dispatch, notify } = useJarvis();
  const lang = state.language;
  const vp = state.vitalPulse;

  const [energy, setEnergy] = useState(8);
  const [clarity, setClarity] = useState(8);
  const [mood, setMood] = useState(8);
  const [muscleRecovery, setMuscleRecovery] = useState(8);
  const [stress, setStress] = useState(3);
  const [note, setNote] = useState('');

  const readiness = useMemo(() => computeReadinessScore(vp), [vp]);
  const circadian = useMemo(() => computeCircadianCurve(vp), [vp]);
  const completedCount = vp.bioStackSteps.filter((s) => s.completed).length;

  // Build smooth SVG path for Circadian Curve
  const svgW = 640;
  const svgH = 190;
  const padX = 28;
  const padY = 24;
  const coords = circadian.points.map((pt, i) => {
    const x = padX + (i / (circadian.points.length - 1)) * (svgW - padX * 2);
    const y = svgH - padY - (pt.energy / 100) * (svgH - padY * 2);
    return { x, y, ...pt };
  });

  const linePath = coords
    .map((c, idx) => {
      if (idx === 0) return `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
      const prev = coords[idx - 1];
      const cx = ((prev.x + c.x) / 2).toFixed(1);
      return `C ${cx} ${prev.y.toFixed(1)}, ${cx} ${c.y.toFixed(1)}, ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
    })
    .join(' ');

  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${svgH - padY} L ${coords[0].x.toFixed(1)} ${svgH - padY} Z`;

  const handleSaveCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({
      type: 'ADD_CHECKIN',
      checkIn: {
        energy,
        clarity,
        mood,
        muscleRecovery,
        stress,
        note: note.trim() || (lang === 'pl' ? 'Szybki wpis stanu biologicznego.' : 'Quick bio-state check-in.'),
      },
    });
    setNote('');
    notify(lang === 'pl' ? 'Zapisano Check-In w Dossier Zdrowia' : 'Check-In saved to Health Dossier', 'emerald');
  };

  return (
    <div className="space-y-6">
      <PageHero
        moduleId="vital-pulse"
        kpis={[
          { label: 'Readiness', value: `${readiness}/100`, accent: true },
          { label: 'HRV', value: `${vp.hrvMs} ms` },
          { label: 'RHR', value: `${vp.rhrBpm} bpm` },
          { label: lang === 'pl' ? 'Sen' : 'Sleep', value: `${vp.sleepHours} h · ${vp.sleepQuality}%` },
        ]}
      />

      {/* 75-Min Morning Bio-Stack Sequencer */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'pl'
                ? 'Sekwencer Porannego Bio-Stacku (75 min)'
                : '75-Min Morning Bio-Stack Sequencer'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {completedCount}/{vp.bioStackSteps.length}{' '}
              {lang === 'pl' ? 'kroków ukończonych dzisiaj' : 'steps completed today'}
            </p>
          </div>
          {vp.activeStepId && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-900/10 bg-white px-3 py-1.5 font-mono text-xs tabular-nums dark:border-white/10 dark:bg-[#0E1219]">
              <span className="text-[#0D9488] dark:text-[#14F1D9]">
                {formatClock(vp.activeStepRemainingSec)}
              </span>
              <button
                type="button"
                onClick={() =>
                  vp.activeStepRunning
                    ? dispatch({ type: 'PAUSE_BIO_STEP' })
                    : dispatch({ type: 'START_BIO_STEP', stepId: vp.activeStepId ?? undefined })
                }
                className="rounded-lg bg-[#090C11] px-2.5 py-1 text-white dark:bg-[#14F1D9] dark:text-[#090C11]"
              >
                {vp.activeStepRunning ? (lang === 'pl' ? 'Pauza' : 'Pause') : 'Start'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {vp.bioStackSteps.map((step, idx) => {
            const isActive = vp.activeStepId === step.id;
            return (
              <PhotographicCard
                key={step.id}
                imageUrl={MODULE_VISUALS['vital-pulse'].cardUrl}
                fallbackGradient={MODULE_VISUALS['vital-pulse'].fallbackGradient}
                alt={lang === 'pl' ? step.titlePl : step.titleEn}
                className={`flex flex-col justify-between p-4 ${
                  isActive ? 'ring-1 ring-[#14F1D9]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#14F1D9]">
                      0{idx + 1} · {step.durationMin}m
                    </span>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'TOGGLE_BIO_STEP', stepId: step.id })}
                      aria-label={`Toggle ${step.titlePl}`}
                      className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-colors ${
                        step.completed
                          ? 'border-[#14F1D9] bg-[#14F1D9] text-[#090C11]'
                          : 'border-white/25 bg-white/5 text-transparent hover:border-white/50'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-white">
                    {lang === 'pl' ? step.titlePl : step.titleEn}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    {lang === 'pl' ? step.protocolPl : step.protocolEn}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (isActive && vp.activeStepRunning) {
                        dispatch({ type: 'PAUSE_BIO_STEP' });
                      } else {
                        dispatch({ type: 'START_BIO_STEP', stepId: step.id });
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-medium text-white hover:bg-white/20"
                  >
                    {isActive && vp.activeStepRunning ? (
                      <>
                        <Pause className="h-3 w-3" />
                        <span>{formatClock(vp.activeStepRemainingSec)}</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" />
                        <span>{lang === 'pl' ? 'Uruchom' : 'Run'}</span>
                      </>
                    )}
                  </button>
                </div>
              </PhotographicCard>
            );
          })}
        </div>
      </section>

      {/* Circadian Curve + Biometric Baseline Adjuster + Bio Check-In */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219] lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'pl' ? 'Krzywa Energii Dobowej (Circadian)' : 'Circadian Energy Curve'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deep Work: {circadian.deepWorkPeakWindow} · NSDR: {circadian.nsdrWindow} · Wind-down: {circadian.windDownCutoff}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
              <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                HRV
                <input
                  type="number"
                  min={25}
                  max={150}
                  value={vp.hrvMs}
                  onChange={(e) =>
                    dispatch({ type: 'UPDATE_VITAL_INPUTS', hrvMs: Number(e.target.value) || 60 })
                  }
                  className="w-16 rounded-lg border border-slate-900/15 bg-slate-50 px-2 py-1 text-right dark:border-white/15 dark:bg-white/5"
                />
              </label>
              <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                {lang === 'pl' ? 'Sen' : 'Sleep'}
                <input
                  type="number"
                  step="0.2"
                  min={4}
                  max={11}
                  value={vp.sleepHours}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_VITAL_INPUTS',
                      sleepHours: Number(e.target.value) || 7.5,
                    })
                  }
                  className="w-16 rounded-lg border border-slate-900/15 bg-slate-50 px-2 py-1 text-right dark:border-white/15 dark:bg-white/5"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full min-w-[460px]">
              <defs>
                <linearGradient id="circadianGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14F1D9" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#14F1D9" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#circadianGrad)" />
              <path
                d={linePath}
                fill="none"
                stroke="#14F1D9"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {coords
                .filter((_, idx) => idx % 3 === 0 || idx === coords.length - 1)
                .map((c) => (
                  <g key={c.hour}>
                    <circle cx={c.x} cy={c.y} r="3.5" fill="#14F1D9" />
                    <text
                      x={c.x}
                      y={svgH - 4}
                      textAnchor="middle"
                      className="fill-slate-500 font-mono text-[10px] dark:fill-slate-400"
                    >
                      {c.label}
                    </text>
                  </g>
                ))}
            </svg>
          </div>
        </div>

        {/* Bio Check-In Sliders */}
        <form
          onSubmit={handleSaveCheckIn}
          className="rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219] lg:col-span-5"
        >
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {lang === 'pl' ? 'Szybki Check-In Biologiczny' : 'Quick Bio-State Check-In'}
          </h2>

          <div className="mt-4 space-y-3">
            {[
              { label: lang === 'pl' ? 'Energia' : 'Energy', val: energy, set: setEnergy },
              { label: lang === 'pl' ? 'Jasność umysłu' : 'Mental Clarity', val: clarity, set: setClarity },
              { label: lang === 'pl' ? 'Nastrój' : 'Mood', val: mood, set: setMood },
              { label: lang === 'pl' ? 'Regeneracja mięśni' : 'Muscle Recovery', val: muscleRecovery, set: setMuscleRecovery },
              { label: lang === 'pl' ? 'Stres (niżej = lepiej)' : 'Stress (lower = better)', val: stress, set: setStress },
            ].map((item) => (
              <label key={item.label} className="block">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                  <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-[#14F1D9]">
                    {item.val}/10
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={item.val}
                  onChange={(e) => item.set(Number(e.target.value))}
                  className="w-full accent-[#14F1D9]"
                />
              </label>
            ))}

            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={lang === 'pl' ? 'Krótka obserwacja do Dossier...' : 'Short note for Dossier...'}
              className="mt-1 h-9 w-full rounded-xl border border-slate-900/12 bg-slate-50 px-3 text-xs text-slate-900 dark:border-white/12 dark:bg-white/5 dark:text-white"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-[#090C11] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-[#14F1D9] dark:text-[#090C11]"
            >
              {lang === 'pl' ? 'Zapisz Snapshot w Dossier' : 'Save Snapshot to Dossier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VitalPulseView;
