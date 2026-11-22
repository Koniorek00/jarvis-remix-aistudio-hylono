import React from 'react';
import { Activity, Plus, RefreshCw } from 'lucide-react';
import { MODULE_VISUALS } from '../assets/visualManifest';
import { PageHero } from '../components/ui/PageHero';
import { PhotographicCard } from '../components/ui/PhotographicCard';
import { useJarvis } from '../store/jarvisStore';
import { OsMode } from '../types/jarvis';

const OS_MODES: OsMode[] = ['ACTIVE', 'DEEP WORK', 'FIELD', 'STEALTH'];

export const HardwareNodesView: React.FC = () => {
  const { state, dispatch, notify } = useJarvis();
  const lang = state.language;
  const hn = state.hardwareNodes;

  const avgLatency = Math.round(
    hn.nodes.reduce((a, n) => a + n.latencyMs, 0) / Math.max(1, hn.nodes.length)
  );

  return (
    <div className="space-y-6">
      <PageHero
        moduleId="hardware-nodes"
        kpis={[
          { label: 'Mesh', value: `${hn.nodes.filter((n) => n.status === 'online').length}/4 Online`, accent: true },
          { label: lang === 'pl' ? 'Śr. Opóźnienie' : 'Avg Latency', value: `${avgLatency} ms` },
          { label: lang === 'pl' ? 'Tryb OS' : 'OS Mode', value: state.osMode },
          { label: 'Last Ping', value: hn.lastPingTimestamp },
        ]}
        controls={
          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'PING_NODES' });
              notify(lang === 'pl' ? 'Przepytano wszystkie węzły S1–S4' : 'S1–S4 fleet pinged', 'cyan');
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#06B6D4] px-3.5 py-2 text-xs font-bold text-[#090C11] hover:opacity-90"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{lang === 'pl' ? 'Ping Floty S1–S4' : 'Ping Fleet S1–S4'}</span>
          </button>
        }
      />

      {/* Global OS Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-[#0E1219]">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {lang === 'pl' ? 'Globalny Tryb Systemu JARVIS' : 'Global JARVIS OS Mode'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'pl'
              ? 'Synchronizuje politykę powiadomień i profil wydajności między S1–S4.'
              : 'Synchronizes notification routing and power profiles across S1–S4.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {OS_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                dispatch({ type: 'SET_OS_MODE', mode: m });
                notify(`OS Mode: ${m}`, 'cyan');
              }}
              className={`rounded-xl px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                state.osMode === m
                  ? 'bg-[#090C11] text-[#14F1D9] dark:bg-[#06B6D4] dark:text-[#090C11]'
                  : 'border border-slate-900/12 text-slate-600 hover:bg-slate-100 dark:border-white/12 dark:text-slate-300 dark:hover:bg-white/10'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* S1-S4 Sovereign Node Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {hn.nodes.map((node) => (
          <PhotographicCard
            key={node.id}
            imageUrl={MODULE_VISUALS['hardware-nodes'].cardUrl}
            fallbackGradient={MODULE_VISUALS['hardware-nodes'].fallbackGradient}
            alt={node.name}
            className="p-5"
          >
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#06B6D4]">{node.id} · {node.endpoint}</span>
              <span className="text-emerald-400">{node.latencyMs} ms</span>
            </div>
            <h3 className="mt-1.5 text-lg font-bold text-white">{node.name}</h3>
            <p className="text-xs text-slate-300">{lang === 'pl' ? node.rolePl : node.roleEn}</p>
            <div className="mt-1 font-mono text-[11px] text-slate-400">{node.stackLabel}</div>

            <div className="mt-4 grid grid-cols-2 gap-4 font-mono text-xs tabular-nums">
              <div>
                <div className="flex justify-between text-slate-400">
                  <span>CPU</span>
                  <span className="text-white">{node.cpuPct}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-white/10">
                  <div className="h-1.5 rounded-full bg-[#06B6D4]" style={{ width: `${node.cpuPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-400">
                  <span>RAM</span>
                  <span className="text-white">{node.ramPct}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-white/10">
                  <div className="h-1.5 rounded-full bg-[#14F1D9]" style={{ width: `${node.ramPct}%` }} />
                </div>
              </div>
            </div>
          </PhotographicCard>
        ))}
      </div>

      {/* Personal Bio-Hardware Control Strip */}
      <div className="rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219]">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          {lang === 'pl' ? 'Osobisty Bio-Sprzęt & Rejestr Sesji' : 'Personal Bio-Hardware Control Strip'}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {hn.bioGear.map((gear) => (
            <div
              key={gear.id}
              className="flex flex-col justify-between rounded-xl border border-slate-900/8 p-4 dark:border-white/8"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-[11px] text-[#06B6D4]">
                  <Activity className="h-3.5 w-3.5" />
                  <span>{gear.sessionsCount}×</span>
                </div>
                <div className="mt-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  {lang === 'pl' ? gear.namePl : gear.nameEn}
                </div>
                <div className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {gear.spec}
                </div>
                <div className="mt-1 font-mono text-[10px] text-slate-400">
                  {lang === 'pl' ? 'Ostatnio:' : 'Last:'} {gear.lastUsedDate}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'LOG_BIO_GEAR_SESSION', gearId: gear.id });
                  notify(`${lang === 'pl' ? gear.namePl : gear.nameEn} +1`, 'cyan');
                }}
                className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-[#090C11] py-1.5 text-xs font-semibold text-white dark:bg-white/10"
              >
                <Plus className="h-3 w-3" />
                <span>{lang === 'pl' ? 'Zaloguj Sesję' : 'Log Session'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HardwareNodesView;
