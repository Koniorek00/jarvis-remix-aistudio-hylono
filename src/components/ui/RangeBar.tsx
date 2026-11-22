import React from 'react';
import { getBiomarkerStatus } from '../../engines/readinessEngine';
import { Biomarker } from '../../types/jarvis';

interface RangeBarProps {
  biomarker: Biomarker;
}

export const RangeBar: React.FC<RangeBarProps> = React.memo(({ biomarker }) => {
  const status = getBiomarkerStatus(biomarker);
  const spanMin = Math.min(biomarker.labMin, biomarker.value) * 0.85;
  const spanMax = Math.max(biomarker.labMax, biomarker.value) * 1.12;
  const totalSpan = spanMax - spanMin || 1;

  const toPct = (val: number) =>
    Math.max(2, Math.min(98, ((val - spanMin) / totalSpan) * 100));

  const labStart = toPct(biomarker.labMin);
  const labEnd = toPct(biomarker.labMax);
  const optStart = toPct(biomarker.optimalMin);
  const optEnd = toPct(biomarker.optimalMax);
  const valPos = toPct(biomarker.value);

  const markerColor =
    status === 'optimal' ? '#10B981' : status === 'watch' ? '#F59E0B' : '#EF4444';

  return (
    <div className="w-full min-w-[160px]">
      <div className="relative h-2.5 w-full rounded-full bg-slate-200 dark:bg-white/10">
        {/* Standard Lab Range */}
        <div
          className="absolute top-0 h-2.5 rounded-full bg-slate-400/35 dark:bg-white/15"
          style={{ left: `${labStart}%`, width: `${Math.max(4, labEnd - labStart)}%` }}
          title={`Norma Lab: ${biomarker.labMin}–${biomarker.labMax}`}
        />
        {/* Longevity Optimal Range */}
        <div
          className="absolute top-0 h-2.5 rounded-full bg-emerald-500/75"
          style={{ left: `${optStart}%`, width: `${Math.max(4, optEnd - optStart)}%` }}
          title={`Strefa Optymalna: ${biomarker.optimalMin}–${biomarker.optimalMax}`}
        />
        {/* Current Value Pin */}
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm dark:border-[#0B0E14]"
          style={{ left: `${valPos}%`, backgroundColor: markerColor }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
        <span>
          Lab: {biomarker.labMin}–{biomarker.labMax}
        </span>
        <span className="text-emerald-600 dark:text-emerald-400">
          Opt: {biomarker.optimalMin}–{biomarker.optimalMax}
        </span>
      </div>
    </div>
  );
});

RangeBar.displayName = 'RangeBar';
