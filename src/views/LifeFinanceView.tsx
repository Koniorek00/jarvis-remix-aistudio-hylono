import React, { useMemo, useState } from 'react';
import { Check, Plus, Scissors } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { computeRunwayMetrics } from '../engines/readinessEngine';
import { useJarvis } from '../store/jarvisStore';

export const LifeFinanceView: React.FC = () => {
  const { state, dispatch, notify } = useJarvis();
  const lang = state.language;
  const lf = state.lifeFinance;

  const [txLabel, setTxLabel] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [txCategory, setTxCategory] = useState('Operacje');

  const metrics = useMemo(() => computeRunwayMetrics(lf), [lf]);

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txLabel.trim() || !txAmount) return;
    dispatch({
      type: 'ADD_TRANSACTION',
      tx: {
        label: txLabel.trim(),
        amountPln: Math.abs(Number(txAmount) || 0),
        type: txType,
        category: txCategory,
      },
    });
    setTxLabel('');
    setTxAmount('');
    notify(lang === 'pl' ? 'Zapisano operację finansową' : 'Transaction logged', 'emerald');
  };

  return (
    <div className="space-y-6">
      <PageHero
        moduleId="life-finance"
        kpis={[
          { label: 'Runway', value: `${metrics.runwayMonths} ${lang === 'pl' ? 'mies.' : 'mo'}`, accent: true },
          { label: lang === 'pl' ? 'Stopa Wolności' : 'Freedom Rate', value: `${metrics.freedomRatePct}%` },
          {
            label: lang === 'pl' ? 'Rezerwa Płynna' : 'Liquid Reserve',
            value: `${lf.liquidReservePln.toLocaleString('pl-PL')} PLN`,
          },
          {
            label: lang === 'pl' ? 'Subskrypcje / m' : 'Subs / mo',
            value: `${metrics.monthlySubsPln} PLN`,
          },
        ]}
      />

      {/* Cashflow Radar + Logger */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219] lg:col-span-7">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {lang === 'pl' ? 'Radar Runway & Przepływy' : 'Runway & Cashflow Radar'}
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-900/8 p-3 dark:border-white/8">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === 'pl' ? 'Miesięczne Wpływy' : 'Monthly Income'}
              </div>
              <div className="mt-1 font-mono text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {metrics.monthlyIncomePln.toLocaleString('pl-PL')} PLN
              </div>
            </div>
            <div className="rounded-xl border border-slate-900/8 p-3 dark:border-white/8">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === 'pl' ? 'Koszty Miesięczne' : 'Monthly Costs'}
              </div>
              <div className="mt-1 font-mono text-base font-bold tabular-nums text-slate-900 dark:text-white">
                {metrics.monthlyExpensePln.toLocaleString('pl-PL')} PLN
              </div>
            </div>
            <div className="rounded-xl border border-slate-900/8 p-3 dark:border-white/8">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === 'pl' ? 'Oszczędność z cięć' : 'Potential Cut / yr'}
              </div>
              <div className="mt-1 font-mono text-base font-bold tabular-nums text-[#10B981]">
                +{metrics.yearlySavingsPotentialPln.toLocaleString('pl-PL')} PLN
              </div>
            </div>
          </div>

          <form onSubmit={handleAddTx} className="grid grid-cols-2 gap-2 sm:grid-cols-6">
            <input
              type="text"
              value={txLabel}
              onChange={(e) => setTxLabel(e.target.value)}
              placeholder={lang === 'pl' ? 'Opis operacji...' : 'Entry label...'}
              className="col-span-2 h-9 rounded-xl border border-slate-900/12 bg-slate-50 px-3 text-xs dark:border-white/12 dark:bg-white/5"
            />
            <input
              type="number"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              placeholder="PLN"
              className="h-9 rounded-xl border border-slate-900/12 bg-slate-50 px-2.5 text-right font-mono text-xs dark:border-white/12 dark:bg-white/5"
            />
            <select
              value={txType}
              onChange={(e) => setTxType(e.target.value as 'expense' | 'income')}
              className="h-9 rounded-xl border border-slate-900/12 bg-slate-50 px-2 text-xs dark:border-white/12 dark:bg-[#0B0E14]"
            >
              <option value="expense">{lang === 'pl' ? 'Wydatek' : 'Expense'}</option>
              <option value="income">{lang === 'pl' ? 'Wpływ' : 'Income'}</option>
            </select>
            <input
              type="text"
              value={txCategory}
              onChange={(e) => setTxCategory(e.target.value)}
              className="h-9 rounded-xl border border-slate-900/12 bg-slate-50 px-2.5 text-xs dark:border-white/12 dark:bg-white/5"
            />
            <button
              type="submit"
              className="flex h-9 items-center justify-center gap-1 rounded-xl bg-[#10B981] text-xs font-bold text-[#090C11]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{lang === 'pl' ? 'Dodaj' : 'Add'}</span>
            </button>
          </form>

          <div className="divide-y divide-slate-900/8 dark:divide-white/8">
            {lf.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2.5 text-xs">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">{tx.label}</span>
                  <span className="ml-2 font-mono text-[11px] text-slate-400">
                    {tx.date} · {tx.category}
                  </span>
                </div>
                <span
                  className={`font-mono font-semibold tabular-nums ${
                    tx.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {tx.amountPln.toLocaleString('pl-PL')} PLN
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscriptions Audit */}
        <div className="rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219] lg:col-span-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {lang === 'pl' ? 'Audyt Subskrypcji' : 'Subscriptions Audit'}
          </h2>
          <p className="mt-0.5 font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
            {lang === 'pl' ? 'Oszczędność roczna po cięciach:' : 'Annual savings flagged:'}{' '}
            <span className="font-bold text-[#10B981]">
              {metrics.yearlySavingsPotentialPln.toLocaleString('pl-PL')} PLN
            </span>
          </p>

          <div className="mt-4 space-y-2">
            {lf.subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-900/8 p-3 dark:border-white/8"
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                    {sub.name}
                  </div>
                  <div className="font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                    {sub.category} · {sub.monthlyPln} PLN/m
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'TOGGLE_SUBSCRIPTION_CUT', subId: sub.id })}
                  className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    sub.flaggedForCut
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : 'border border-slate-900/12 text-slate-600 hover:bg-slate-100 dark:border-white/12 dark:text-slate-300 dark:hover:bg-white/10'
                  }`}
                >
                  <Scissors className="h-3 w-3" />
                  <span>
                    {sub.flaggedForCut
                      ? lang === 'pl'
                        ? 'Do cięcia'
                        : 'Flagged'
                      : lang === 'pl'
                      ? 'Oznacz do cięcia'
                      : 'Flag Cut'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Essentials & Supplements Restock Board */}
      <div className="rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219]">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          {lang === 'pl' ? 'Magazyn Zapasów & Suplementów' : 'Smart Essentials Restock Board'}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lf.restockItems.map((item) => {
            const barColor =
              item.status === 'ok' ? '#10B981' : item.status === 'low' ? '#F59E0B' : '#EF4444';
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-slate-900/8 p-4 dark:border-white/8"
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-400">{item.category}</span>
                    <span style={{ color: barColor }} className="font-bold uppercase">
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {item.name}
                  </div>
                  <div className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {item.unitNote}
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${Math.max(4, item.stockPct)}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'RESTOCK_ITEM', itemId: item.id });
                    notify(`${item.name} · 100%`, 'emerald');
                  }}
                  className="mt-3 flex w-fit items-center gap-1.5 rounded-lg border border-slate-900/12 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-white/12 dark:text-slate-100 dark:hover:bg-white/10"
                >
                  <Check className="h-3.5 w-3.5 text-[#10B981]" />
                  <span>{lang === 'pl' ? 'Uzupełniono' : 'Restocked'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LifeFinanceView;
