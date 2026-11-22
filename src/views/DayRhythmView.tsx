import React, { useState } from 'react';
import { Check, Pause, Play, RotateCcw, Trash2 } from 'lucide-react';
import { MODULE_VISUALS } from '../assets/visualManifest';
import { PageHero } from '../components/ui/PageHero';
import { PhotographicCard } from '../components/ui/PhotographicCard';
import { useJarvis } from '../store/jarvisStore';
import { TaskTier } from '../types/jarvis';

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const DayRhythmView: React.FC = () => {
  const { state, dispatch, notify } = useJarvis();
  const lang = state.language;
  const dr = state.dayRhythm;

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTier, setNewTaskTier] = useState<TaskTier>('leverage');

  const activeBlock = dr.blocks.find((b) => b.id === dr.activeBlockId) ?? dr.blocks[0];
  const doneTasks = dr.tasks.filter((t) => t.done).length;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    dispatch({ type: 'ADD_TASK', title: newTaskTitle.trim(), tier: newTaskTier });
    setNewTaskTitle('');
    notify(lang === 'pl' ? 'Dodano zadanie' : 'Task added', 'cyan');
  };

  return (
    <div className="space-y-6">
      <PageHero
        moduleId="day-rhythm"
        kpis={[
          { label: lang === 'pl' ? 'Aktywny Blok' : 'Active Block', value: formatClock(dr.remainingSec), accent: true },
          { label: lang === 'pl' ? 'Bloki' : 'Blocks', value: `${dr.blocks.filter((b) => b.completed).length}/${dr.blocks.length}` },
          { label: lang === 'pl' ? 'Zadania' : 'Tasks', value: `${doneTasks}/${dr.tasks.length}` },
        ]}
      />

      {/* Live 90-Minute Ultradian Engine */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-5">
          <PhotographicCard
            imageUrl={MODULE_VISUALS['day-rhythm'].cardUrl}
            fallbackGradient={MODULE_VISUALS['day-rhythm'].fallbackGradient}
            alt="Ultradian Focus Clock"
            className="p-6"
          >
            <div className="font-mono text-xs text-[#0A84FF]">{activeBlock.timeRange}</div>
            <h2 className="mt-1 text-lg font-bold text-white">
              {lang === 'pl' ? activeBlock.titlePl : activeBlock.titleEn}
            </h2>
            <div className="mt-4 font-mono text-5xl font-bold tracking-tight tabular-nums text-white">
              {formatClock(dr.remainingSec)}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => dispatch({ type: 'TOGGLE_ULTRADIAN_TIMER' })}
                className="flex items-center gap-1.5 rounded-xl bg-[#0A84FF] px-4 py-2 text-xs font-bold text-white hover:opacity-90"
              >
                {dr.timerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span>{dr.timerRunning ? (lang === 'pl' ? 'Pauza' : 'Pause') : 'Start'}</span>
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'RESET_ULTRADIAN_TIMER' })}
                className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </PhotographicCard>

          <div className="space-y-2">
            {dr.blocks.map((blk) => {
              const isSelected = blk.id === dr.activeBlockId;
              return (
                <div
                  key={blk.id}
                  className={`flex items-center justify-between rounded-xl border p-3 ${
                    isSelected
                      ? 'border-[#0A84FF] bg-blue-50/70 dark:bg-[#0A84FF]/10'
                      : 'border-slate-900/10 bg-white dark:border-white/10 dark:bg-[#0E1219]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SELECT_ULTRADIAN_BLOCK', blockId: blk.id })}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {blk.timeRange} · {blk.durationMin}m
                    </div>
                    <div className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {lang === 'pl' ? blk.titlePl : blk.titleEn}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'COMPLETE_ULTRADIAN_BLOCK', blockId: blk.id })}
                    aria-label={`Mark ${blk.titlePl} complete`}
                    className={`ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                      blk.completed
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-900/15 text-transparent dark:border-white/15'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3-Tier Clarity Cockpit */}
        <div className="rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219] lg:col-span-7">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {lang === 'pl' ? 'Kokpit 3 Poziomów Jasności' : '3-Tier Clarity Cockpit'}
          </h2>

          <form onSubmit={handleAddTask} className="mt-4 flex flex-wrap gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder={lang === 'pl' ? 'Wpisz zadanie i naciśnij Enter...' : 'Type task and press Enter...'}
              className="h-9 flex-1 rounded-xl border border-slate-900/12 bg-slate-50 px-3 text-xs dark:border-white/12 dark:bg-white/5"
            />
            <select
              value={newTaskTier}
              onChange={(e) => setNewTaskTier(e.target.value as TaskTier)}
              className="h-9 rounded-xl border border-slate-900/12 bg-slate-50 px-2.5 text-xs dark:border-white/12 dark:bg-[#0B0E14]"
            >
              <option value="needle">{lang === 'pl' ? '1. Kluczowy Ruch' : '1. Needle Mover'}</option>
              <option value="leverage">{lang === 'pl' ? '2. Wysoka Dźwignia' : '2. High Leverage'}</option>
              <option value="inbox">{lang === 'pl' ? '3. Szybki Zrzut' : '3. Inbox'}</option>
            </select>
            <button
              type="submit"
              className="h-9 rounded-xl bg-[#0A84FF] px-4 text-xs font-semibold text-white"
            >
              + {lang === 'pl' ? 'Dodaj' : 'Add'}
            </button>
          </form>

          <div className="mt-5 space-y-5">
            {(
              [
                {
                  tier: 'needle' as TaskTier,
                  titlePl: '1 Kluczowy Ruch Dnia (Needle Mover)',
                  titleEn: '1 Daily Needle Mover',
                },
                {
                  tier: 'leverage' as TaskTier,
                  titlePl: '3 Zadania Wysokiej Dźwigni',
                  titleEn: '3 High-Leverage Tasks',
                },
                {
                  tier: 'inbox' as TaskTier,
                  titlePl: 'Szybki Zrzut (Inbox)',
                  titleEn: 'Quick Capture (Inbox)',
                },
              ]
            ).map((group) => {
              const items = dr.tasks.filter((t) => t.tier === group.tier);
              return (
                <div key={group.tier}>
                  <div className="mb-2 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {lang === 'pl' ? group.titlePl : group.titleEn} ({items.length})
                  </div>
                  <div className="space-y-1.5">
                    {items.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-900/8 px-3 py-2.5 dark:border-white/8"
                      >
                        <button
                          type="button"
                          onClick={() => dispatch({ type: 'TOGGLE_TASK', taskId: task.id })}
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                              task.done
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-slate-900/20 text-transparent dark:border-white/20'
                            }`}
                          >
                            <Check className="h-3 w-3" />
                          </span>
                          <span
                            className={`truncate text-xs font-medium ${
                              task.done
                                ? 'text-slate-400 line-through'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => dispatch({ type: 'DELETE_TASK', taskId: task.id })}
                          aria-label={`Delete ${task.title}`}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayRhythmView;
