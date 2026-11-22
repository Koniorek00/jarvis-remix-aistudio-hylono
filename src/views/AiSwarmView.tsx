import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Send, ShieldAlert, X } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { useJarvis } from '../store/jarvisStore';

export const AiSwarmView: React.FC = () => {
  const { state, dispatch, notify } = useJarvis();
  const lang = state.language;
  const swarm = state.aiSwarm;

  const [expandedId, setExpandedId] = useState<string | null>(swarm.proposals[1]?.id ?? null);
  const [missionTitle, setMissionTitle] = useState('');
  const [missionAgent, setMissionAgent] = useState('Research Scout');
  const [missionCost, setMissionCost] = useState('1.40');

  const budgetExceeded = swarm.spentTodayUsd >= swarm.dailyBudgetCapUsd;

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionTitle.trim()) return;
    dispatch({
      type: 'DISPATCH_MISSION',
      title: missionTitle.trim(),
      agent: missionAgent,
      estimatedUsd: Math.max(0.1, Number(missionCost) || 1.0),
    });
    setMissionTitle('');
    notify(
      lang === 'pl' ? 'Wysłano misję do bramki akceptacji' : 'Mission queued at Approval Gate',
      'cyan'
    );
  };

  return (
    <div className="space-y-6">
      <PageHero
        moduleId="ai-swarm"
        kpis={[
          {
            label: lang === 'pl' ? 'Aktywne' : 'Running',
            value: `${swarm.proposals.filter((p) => p.status === 'running').length}`,
            accent: true,
          },
          {
            label: lang === 'pl' ? 'Czeka na Zgodę' : 'Pending',
            value: `${swarm.proposals.filter((p) => p.status === 'pending').length}`,
          },
          {
            label: lang === 'pl' ? 'Budżet Dziś' : 'Spent Today',
            value: `$${swarm.spentTodayUsd.toFixed(2)} / $${swarm.dailyBudgetCapUsd}`,
          },
        ]}
      />

      {/* Budget Circuit Breaker + Quick Mission Dispatch */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219] lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'pl' ? 'Bezpiecznik Budżetu AI' : 'Budget Circuit Breaker'}
            </h2>
            <span className="font-mono text-sm font-bold tabular-nums text-[#6366F1]">
              ${swarm.dailyBudgetCapUsd}/day
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {lang === 'pl'
              ? 'Blokuje automatycznie płatne zadania po przekroczeniu dziennego limitu.'
              : 'Physically blocks paid agent approvals if daily cap is exceeded.'}
          </p>

          <input
            type="range"
            min={5}
            max={50}
            step={1}
            value={swarm.dailyBudgetCapUsd}
            onChange={(e) =>
              dispatch({ type: 'SET_DAILY_BUDGET_CAP', capUsd: Number(e.target.value) })
            }
            className="mt-4 w-full accent-[#6366F1]"
          />

          <div className="mt-3 flex items-center justify-between font-mono text-xs tabular-nums">
            <span className="text-slate-500 dark:text-slate-400">
              {lang === 'pl' ? 'Wykorzystano:' : 'Used:'} ${swarm.spentTodayUsd.toFixed(2)}
            </span>
            {budgetExceeded && (
              <span className="flex items-center gap-1 font-semibold text-rose-500">
                <ShieldAlert className="h-3.5 w-3.5" /> LIMIT
              </span>
            )}
          </div>
        </div>

        <form
          onSubmit={handleDispatch}
          className="rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219] lg:col-span-7"
        >
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {lang === 'pl' ? 'Wyślij Nową Misję Badawczą' : 'Quick Mission Dispatch'}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-6">
            <input
              type="text"
              value={missionTitle}
              onChange={(e) => setMissionTitle(e.target.value)}
              placeholder={
                lang === 'pl'
                  ? 'Pytanie badawcze lub źródło Archive-Pro...'
                  : 'Research question or Archive-Pro job...'
              }
              className="h-10 rounded-xl border border-slate-900/12 bg-slate-50 px-3 text-xs dark:border-white/12 dark:bg-white/5 sm:col-span-3"
            />
            <select
              value={missionAgent}
              onChange={(e) => setMissionAgent(e.target.value)}
              className="h-10 rounded-xl border border-slate-900/12 bg-slate-50 px-2.5 text-xs dark:border-white/12 dark:bg-[#0B0E14] sm:col-span-2"
            >
              <option value="Research Scout">Research Scout</option>
              <option value="Docling Distiller">Docling Distiller</option>
              <option value="Bio-Analyst">Bio-Analyst</option>
            </select>
            <input
              type="number"
              step="0.1"
              min={0.1}
              value={missionCost}
              onChange={(e) => setMissionCost(e.target.value)}
              aria-label="Estimated USD cost"
              className="h-10 rounded-xl border border-slate-900/12 bg-slate-50 px-2.5 text-right font-mono text-xs dark:border-white/12 dark:bg-white/5"
            />
          </div>
          <button
            type="submit"
            className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#6366F1] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{lang === 'pl' ? 'Dodaj do Bramki Akceptacji' : 'Queue at Approval Gate'}</span>
          </button>
        </form>
      </div>

      {/* Approval Gate & Live Trace Tree */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          {lang === 'pl' ? 'Bramka Akceptacji & Drzewo Wykonania' : 'Human-in-the-Loop Gate & Trace Tree'}
        </h2>
        {swarm.proposals.map((prop) => {
          const isExpanded = expandedId === prop.id;
          const wouldExceed = swarm.spentTodayUsd + prop.estimatedUsd > swarm.dailyBudgetCapUsd;

          return (
            <div
              key={prop.id}
              className="rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-[#6366F1]">{prop.agent}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums text-slate-500 dark:text-slate-400">
                      Est. ${prop.estimatedUsd.toFixed(2)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        prop.status === 'completed'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : prop.status === 'running'
                          ? 'text-[#6366F1]'
                          : prop.status === 'rejected'
                          ? 'text-rose-500'
                          : 'text-amber-600 dark:text-amber-400'
                      }
                    >
                      {prop.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {prop.title}
                  </h3>
                  <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {prop.planSteps.map((step, idx) => (
                      <li key={idx}>
                        {idx + 1}. {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {prop.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        disabled={wouldExceed}
                        onClick={() => {
                          dispatch({ type: 'APPROVE_PROPOSAL', proposalId: prop.id });
                          notify(`${prop.title} · Running`, 'emerald');
                        }}
                        className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>
                          {wouldExceed
                            ? lang === 'pl'
                              ? 'Przekroczono Limit'
                              : 'Over Budget'
                            : lang === 'pl'
                            ? 'Zatwierdź i Uruchom'
                            : 'Approve & Run'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          dispatch({ type: 'REJECT_PROPOSAL', proposalId: prop.id });
                          notify(lang === 'pl' ? 'Zadanie odrzucone' : 'Proposal rejected', 'rose');
                        }}
                        className="flex items-center gap-1 rounded-xl border border-slate-900/12 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/12 dark:text-slate-200 dark:hover:bg-white/10"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>{lang === 'pl' ? 'Odrzuć' : 'Reject'}</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : prop.id)}
                    className="flex items-center gap-1 rounded-xl border border-slate-900/10 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:text-slate-300"
                  >
                    <span>Trace ({prop.traces.length})</span>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-1.5 border-t border-slate-900/8 pt-3 font-mono text-xs dark:border-white/8">
                  {prop.traces.map((tr) => (
                    <div key={tr.id} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>
                        [{tr.status.toUpperCase()}] {tr.label}
                      </span>
                      <span className="tabular-nums text-slate-400">{tr.durationMs} ms</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AiSwarmView;
