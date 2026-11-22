import React, { useMemo, useState } from 'react';
import { Check, Droplets, Plus, Zap } from 'lucide-react';
import { MODULE_VISUALS } from '../assets/visualManifest';
import { PageHero } from '../components/ui/PageHero';
import { PhotographicCard } from '../components/ui/PhotographicCard';
import { computeHydrationTarget } from '../engines/readinessEngine';
import { useJarvis } from '../store/jarvisStore';

export const FuelNutritionView: React.FC = () => {
  const { state, dispatch, notify } = useJarvis();
  const lang = state.language;
  const fn = state.fuelNutrition;

  const [mealName, setMealName] = useState('');
  const [mealKcal, setMealKcal] = useState('520');
  const [mealProtein, setMealProtein] = useState('38');
  const [mealFat, setMealFat] = useState('18');
  const [mealCarbs, setMealCarbs] = useState('46');

  const totals = useMemo(() => {
    return fn.meals.reduce(
      (acc, m) => ({
        kcal: acc.kcal + m.kcal,
        protein: acc.protein + m.proteinG,
        fat: acc.fat + m.fatG,
        carbs: acc.carbs + m.carbsG,
        fiber: acc.fiber + m.fiberG,
      }),
      { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
    );
  }, [fn.meals]);

  const todayIso = new Date().toISOString().slice(0, 10);
  const workoutToday = state.trainingLab.sessionLogs.some((l) => l.dateIso.startsWith(todayIso));
  const bioCompleted = state.vitalPulse.bioStackSteps.filter((s) => s.completed).length;
  const hydTarget = computeHydrationTarget({ workoutToday, bioStackCompletedCount: bioCompleted });

  const handleAddCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;
    dispatch({
      type: 'ADD_MEAL',
      meal: {
        namePl: mealName.trim(),
        nameEn: mealName.trim(),
        kcal: Number(mealKcal) || 0,
        proteinG: Number(mealProtein) || 0,
        fatG: Number(mealFat) || 0,
        carbsG: Number(mealCarbs) || 0,
        fiberG: 6,
      },
    });
    setMealName('');
    notify(lang === 'pl' ? 'Zapisano posiłek' : 'Meal logged', 'emerald');
  };

  const fastingPct = Math.min(100, Math.round((fn.fastingElapsedHours / fn.fastingGoalHours) * 100));
  const ringR = 36;
  const ringC = 2 * Math.PI * ringR;
  const ringOffset = ringC - (fastingPct / 100) * ringC;

  return (
    <div className="space-y-6">
      <PageHero
        moduleId="fuel-nutrition"
        kpis={[
          { label: 'Kalorie', value: `${totals.kcal} / ${fn.calorieTarget}`, accent: true },
          { label: lang === 'pl' ? 'Białko' : 'Protein', value: `${totals.protein} / ${fn.proteinTargetG} g` },
          {
            label: lang === 'pl' ? 'Nawodnienie' : 'Hydration',
            value: `${fn.waterMl} / ${hydTarget.targetMl} ml`,
          },
          { label: lang === 'pl' ? 'Okno 16:8' : '16:8 Window', value: `${fn.fastingElapsedHours}h` },
        ]}
      />

      {/* Favorite 1-Tap Photographic Meals */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          {lang === 'pl' ? 'Ulubione Posiłki (1-Tap Log)' : '1-Tap Favorite Meals'}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {fn.favorites.map((fav) => (
            <PhotographicCard
              key={fav.id}
              imageUrl={MODULE_VISUALS['fuel-nutrition'].cardUrl}
              fallbackGradient={MODULE_VISUALS['fuel-nutrition'].fallbackGradient}
              alt={lang === 'pl' ? fav.namePl : fav.nameEn}
              className="flex flex-col justify-between p-4"
            >
              <div>
                <div className="font-mono text-[11px] text-[#84CC16]">{fav.kcal} kcal</div>
                <div className="mt-1 text-sm font-bold text-white">
                  {lang === 'pl' ? fav.namePl : fav.nameEn}
                </div>
                <div className="mt-1 font-mono text-[11px] text-slate-300">
                  B {fav.proteinG}g · T {fav.fatG}g · W {fav.carbsG}g
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
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
                }}
                className="mt-3 flex w-fit items-center gap-1 rounded-lg bg-[#84CC16] px-3 py-1.5 text-xs font-bold text-[#090C11] hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{lang === 'pl' ? 'Dodaj' : 'Add'}</span>
              </button>
            </PhotographicCard>
          ))}
        </div>
      </section>

      {/* Macros + Custom Logger + CNC Hydration + Fasting Ring */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219] lg:col-span-7">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {lang === 'pl' ? 'Makroskładniki & Oś Czasu Posiłków' : 'Macros & Meal Timeline'}
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: lang === 'pl' ? 'Białko' : 'Protein', cur: totals.protein, tgt: fn.proteinTargetG, color: '#84CC16' },
              { label: lang === 'pl' ? 'Tłuszcze' : 'Fats', cur: totals.fat, tgt: fn.fatTargetG, color: '#FFB020' },
              { label: lang === 'pl' ? 'Węgle' : 'Carbs', cur: totals.carbs, tgt: fn.carbsTargetG, color: '#38BDF8' },
              { label: lang === 'pl' ? 'Błonnik' : 'Fiber', cur: totals.fiber, tgt: fn.fiberTargetG, color: '#14F1D9' },
            ].map((macro) => {
              const pct = Math.min(100, Math.round((macro.cur / macro.tgt) * 100));
              return (
                <div key={macro.label} className="rounded-xl border border-slate-900/8 p-3 dark:border-white/8">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{macro.label}</div>
                  <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                    {macro.cur}g <span className="text-xs font-normal text-slate-400">/ {macro.tgt}g</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: macro.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleAddCustomMeal} className="grid grid-cols-2 gap-2 sm:grid-cols-6">
            <input
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder={lang === 'pl' ? 'Własny posiłek...' : 'Custom meal...'}
              className="col-span-2 h-9 rounded-xl border border-slate-900/12 bg-slate-50 px-3 text-xs dark:border-white/12 dark:bg-white/5"
            />
            <input
              type="number"
              value={mealKcal}
              onChange={(e) => setMealKcal(e.target.value)}
              aria-label="kcal"
              className="h-9 rounded-xl border border-slate-900/12 bg-slate-50 px-2 text-right font-mono text-xs dark:border-white/12 dark:bg-white/5"
            />
            <input
              type="number"
              value={mealProtein}
              onChange={(e) => setMealProtein(e.target.value)}
              aria-label="protein g"
              className="h-9 rounded-xl border border-slate-900/12 bg-slate-50 px-2 text-right font-mono text-xs dark:border-white/12 dark:bg-white/5"
            />
            <input
              type="number"
              value={mealCarbs}
              onChange={(e) => setMealCarbs(e.target.value)}
              aria-label="carbs g"
              className="h-9 rounded-xl border border-slate-900/12 bg-slate-50 px-2 text-right font-mono text-xs dark:border-white/12 dark:bg-white/5"
            />
            <button
              type="submit"
              className="h-9 rounded-xl bg-[#090C11] text-xs font-semibold text-white dark:bg-[#84CC16] dark:text-[#090C11]"
            >
              + {lang === 'pl' ? 'Posiłek' : 'Meal'}
            </button>
          </form>

          <div className="divide-y divide-slate-900/8 dark:divide-white/8">
            {fn.meals.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2.5 text-xs">
                <div>
                  <span className="font-mono text-slate-400">{m.time}</span>{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {lang === 'pl' ? m.namePl : m.nameEn}
                  </span>
                </div>
                <div className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                  {m.kcal} kcal · B {m.proteinG}g
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CNC Hydration + Fasting Ring */}
        <div className="space-y-5 lg:col-span-5">
          <div className="rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219]">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'pl' ? 'Nawodnienie CNC & Elektrolity' : 'CNC Hydration & Electrolytes'}
              </h2>
              {workoutToday && (
                <span className="font-mono text-[11px] font-semibold text-[#FFB020]">
                  {lang === 'pl' ? '+650ml za trening' : '+650ml workout'}
                </span>
              )}
            </div>

            <div className="mt-3 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {fn.waterMl} <span className="text-sm font-normal text-slate-400">/ {hydTarget.targetMl} ml</span>
            </div>
            <div className="mt-1 font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
              Na: {fn.sodiumMg} / {hydTarget.targetSodiumMg} mg · K: {fn.potassiumMg} / {hydTarget.targetPotassiumMg} mg
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'ADD_WATER', ml: 250 });
                  notify('+250 ml', 'cyan');
                }}
                className="flex items-center justify-center gap-1 rounded-xl border border-slate-900/12 bg-slate-50 py-2.5 font-mono text-xs font-semibold hover:bg-slate-100 dark:border-white/12 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <Droplets className="h-3.5 w-3.5 text-[#38BDF8]" />
                <span>+250ml</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'ADD_WATER', ml: 500 });
                  notify('+500 ml', 'cyan');
                }}
                className="flex items-center justify-center gap-1 rounded-xl border border-slate-900/12 bg-slate-50 py-2.5 font-mono text-xs font-semibold hover:bg-slate-100 dark:border-white/12 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <Droplets className="h-3.5 w-3.5 text-[#14F1D9]" />
                <span>+500ml</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'ADD_ELECTROLYTES' });
                  notify('+1000mg Na / +200mg K', 'emerald');
                }}
                className="flex items-center justify-center gap-1 rounded-xl bg-[#090C11] py-2.5 font-mono text-xs font-semibold text-white dark:bg-[#84CC16] dark:text-[#090C11]"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>+Na/K</span>
              </button>
            </div>
          </div>

          {/* Fasting SVG Ring */}
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'pl' ? 'Okno Postu 16:8' : '16:8 Fasting Window'}
              </h3>
              <p className="mt-1 font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {fn.fastingActive
                  ? lang === 'pl'
                    ? `Post aktywny · ${fn.fastingElapsedHours}h / ${fn.fastingGoalHours}h`
                    : `Fasting · ${fn.fastingElapsedHours}h / ${fn.fastingGoalHours}h`
                  : lang === 'pl'
                  ? `Okno żywieniowe · ${fn.fastingElapsedHours}h od startu`
                  : `Eating window · ${fn.fastingElapsedHours}h elapsed`}
              </p>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'TOGGLE_FASTING' });
                  notify(
                    fn.fastingActive
                      ? lang === 'pl'
                        ? 'Zakończono okno postu'
                        : 'Fast ended'
                      : lang === 'pl'
                      ? 'Rozpoczęto post 16:8'
                      : '16:8 fast started',
                    'cyan'
                  );
                }}
                className="mt-3 rounded-xl border border-slate-900/15 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-100 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
              >
                {fn.fastingActive
                  ? lang === 'pl'
                    ? 'Zakończ Post'
                    : 'End Fast'
                  : lang === 'pl'
                  ? 'Rozpocznij Post'
                  : 'Start Fast'}
              </button>
            </div>

            <svg width="92" height="92" viewBox="0 0 92 92" className="shrink-0">
              <circle
                cx="46"
                cy="46"
                r={ringR}
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                className="text-slate-200 dark:text-white/10"
              />
              <circle
                cx="46"
                cy="46"
                r={ringR}
                fill="none"
                stroke="#84CC16"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={ringC}
                strokeDashoffset={ringOffset}
                transform="rotate(-90 46 46)"
              />
              <text
                x="46"
                y="50"
                textAnchor="middle"
                className="fill-slate-900 font-mono text-xs font-bold tabular-nums dark:fill-white"
              >
                {fastingPct}%
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Supplement Protocol Matrix */}
      <div className="rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219]">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          {lang === 'pl' ? 'Matryca Suplementacji' : 'Supplement Protocol Matrix'}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {(['morning', 'midday', 'evening'] as const).map((slot) => {
            const items = fn.supplements.filter((s) => s.slot === slot);
            const title =
              slot === 'morning'
                ? lang === 'pl'
                  ? 'Rano'
                  : 'Morning'
                : slot === 'midday'
                ? lang === 'pl'
                  ? 'W południe / Do posiłku'
                  : 'Midday / With Meal'
                : lang === 'pl'
                ? 'Wieczór / Sen'
                : 'Evening / Sleep';

            return (
              <div key={slot} className="space-y-2">
                <div className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {title}
                </div>
                {items.map((supp) => {
                  const restock = state.lifeFinance.restockItems.find(
                    (r) => r.id === supp.linkedRestockId
                  );
                  return (
                    <div
                      key={supp.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-900/8 p-3 dark:border-white/8"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                          {supp.name}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {supp.dosage}
                          {restock && restock.status !== 'ok' && (
                            <span className="ml-2 text-amber-500">
                              · {restock.status === 'out' ? 'BRAK' : 'NISKI ZAPAS'}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'TOGGLE_SUPPLEMENT', suppId: supp.id })}
                        aria-label={`Toggle ${supp.name}`}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                          supp.takenToday
                            ? 'border-[#84CC16] bg-[#84CC16] text-[#090C11]'
                            : 'border-slate-900/15 text-transparent dark:border-white/15'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FuelNutritionView;
