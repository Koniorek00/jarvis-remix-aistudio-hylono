import React from 'react';
import { MODULE_VISUALS } from '../../assets/visualManifest';
import { useJarvis } from '../../store/jarvisStore';
import { ModuleId } from '../../types/jarvis';
import { PhotographicCard } from './PhotographicCard';

export interface HeroKpi {
  label: string;
  value: string;
  accent?: boolean;
}

interface PageHeroProps {
  moduleId: ModuleId;
  kpis: HeroKpi[];
  controls?: React.ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = React.memo(({ moduleId, kpis, controls }) => {
  const { state } = useJarvis();
  const visual = MODULE_VISUALS[moduleId];
  const lang = state.language;
  const title = lang === 'pl' ? visual.titlePl : visual.titleEn;
  const subtitle = lang === 'pl' ? visual.subtitlePl : visual.subtitleEn;

  return (
    <PhotographicCard
      imageUrl={visual.heroUrl}
      fallbackGradient={visual.fallbackGradient}
      alt={title}
      eager
      accentColor={visual.accent}
      className="mb-6 min-h-[196px] p-6 md:p-7"
    >
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-2.5 text-xs font-mono tracking-wider text-slate-400">
            <span style={{ color: visual.accent }}>{visual.code}</span>
            <span aria-hidden="true">·</span>
            <span>JARVIS PERSONAL OS</span>
            <span aria-hidden="true">·</span>
            <span>{state.osMode}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl text-balance">
            {title}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-300">{subtitle}</p>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          {controls && <div className="flex flex-wrap items-center gap-2">{controls}</div>}
          <div className="flex flex-wrap items-center gap-5 rounded-xl border border-white/10 bg-[#090C11]/75 px-4 py-2.5">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="min-w-[78px]">
                <div className="text-[11px] font-medium text-slate-400">{kpi.label}</div>
                <div
                  className="mt-0.5 font-mono text-base font-semibold tabular-nums"
                  style={{ color: kpi.accent ? visual.accent : '#F8FAFC' }}
                >
                  {kpi.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhotographicCard>
  );
});

PageHero.displayName = 'PageHero';
