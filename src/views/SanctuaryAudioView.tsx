import React, { useState } from 'react';
import { Headphones, Pause, Play, Speaker, Wind } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { AUDIO_PRESETS } from '../engines/audioDspEngine';
import { useJarvis } from '../store/jarvisStore';
import { AudioPresetId } from '../types/jarvis';

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const SanctuaryAudioView: React.FC = () => {
  const { state, dispatch, notify } = useJarvis();
  const lang = state.language;
  const sa = state.sanctuaryAudio;

  const [soulInput, setSoulInput] = useState('');

  const activePreset = AUDIO_PRESETS[sa.preset];

  const handleComposeSoulDump = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soulInput.trim()) return;
    const raw = soulInput.trim();
    const script =
      lang === 'pl'
        ? `[00:00 · KOTWICA] Usiądź spokojnie. Twoja obecna myśl brzmi: "${raw}".\n\n[PAUZA: 4s WDECH / 6s WYDECH] Zauważ ciężar ciała na krześle i pozwól barkom opaść.\n\n[01:45 · PRZEŁĄCZENIE] Oddychaj rytmem 4-6. To, co nazwałeś ("${raw.slice(0, 64)}"), jest teraz bezpiecznie zapisane poza Twoją głową.\n\n[PAUZA: 4s WDECH / 6s WYDECH] Zakończ jednym spokojnym zdaniem intencji na kolejną godzinę.`
        : `[00:00 · ANCHOR] Settle your posture. What is alive right now: "${raw}".\n\n[PAUSE: 4s INHALE / 6s EXHALE] Drop your shoulders and soften your visual gaze.\n\n[01:45 · CLARITY] What you named ("${raw.slice(0, 64)}") is now safely externalized.\n\n[PAUSE: 4s INHALE / 6s EXHALE] Carry one calm intention into the next hour.`;

    dispatch({ type: 'ADD_SOUL_DUMP', promptText: raw, generatedScript: script });
    setSoulInput('');
    notify(
      lang === 'pl' ? 'Skomponowano spersonalizowany skrypt 5 min' : 'Personalized 5m script composed',
      'emerald'
    );
  };

  return (
    <div className="space-y-6">
      <PageHero
        moduleId="sanctuary-audio"
        kpis={[
          {
            label: lang === 'pl' ? 'Program DSP' : 'DSP Preset',
            value: activePreset.freqLabel,
            accent: true,
          },
          { label: lang === 'pl' ? 'Pozostało' : 'Remaining', value: formatClock(sa.remainingSec) },
          {
            label: lang === 'pl' ? 'Wyjście' : 'Output',
            value: sa.outputMode === 'headphones' ? 'Binaural' : 'Isochronic AM',
          },
          { label: lang === 'pl' ? 'Wpisy' : 'Journal', value: `${sa.journal.length}` },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Live Web Audio DSP Synthesizer */}
        <div className="space-y-5 rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219] lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'pl'
                  ? 'Syntezator Web Audio API (Czas Rzeczywisty)'
                  : 'Real-Time Web Audio DSP Synthesizer'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'pl'
                  ? 'Generuje czyste fale i filtrowany szum na żywo w przeglądarce — zero plików MP3.'
                  : 'Synthesizes binaural/isochronic waves and filtered pink/brown noise live in browser.'}
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-slate-900/10 bg-slate-100 p-1 dark:border-white/10 dark:bg-white/5">
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_AUDIO_OUTPUT_MODE', mode: 'headphones' })}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  sa.outputMode === 'headphones'
                    ? 'bg-[#090C11] text-[#2DD4BF] dark:bg-[#2DD4BF] dark:text-[#090C11]'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Headphones className="h-3.5 w-3.5" />
                <span>{lang === 'pl' ? 'Słuchawki' : 'Headphones'}</span>
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_AUDIO_OUTPUT_MODE', mode: 'speakers' })}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  sa.outputMode === 'speakers'
                    ? 'bg-[#090C11] text-[#2DD4BF] dark:bg-[#2DD4BF] dark:text-[#090C11]'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Speaker className="h-3.5 w-3.5" />
                <span>{lang === 'pl' ? 'Głośnik' : 'Speakers'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {(Object.keys(AUDIO_PRESETS) as AudioPresetId[]).map((presetId) => {
              const cfg = AUDIO_PRESETS[presetId];
              const isSelected = sa.preset === presetId;
              return (
                <button
                  key={presetId}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_AUDIO_PRESET', preset: presetId, autoPlay: true })}
                  className={`rounded-xl border p-3.5 text-left transition-colors ${
                    isSelected
                      ? 'border-[#2DD4BF] bg-[#2DD4BF]/12'
                      : 'border-slate-900/10 hover:border-slate-900/25 dark:border-white/10 dark:hover:border-white/25'
                  }`}
                >
                  <div className="font-mono text-[11px] font-semibold text-[#0D9488] dark:text-[#2DD4BF]">
                    {cfg.freqLabel} · {cfg.noiseType.toUpperCase()} NOISE
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {lang === 'pl' ? cfg.labelPl : cfg.labelEn}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-900/8 bg-slate-50 p-4 dark:border-white/8 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => dispatch({ type: 'TOGGLE_AUDIO_PLAY' })}
                className="flex items-center gap-2 rounded-xl bg-[#2DD4BF] px-4 py-2 text-xs font-bold text-[#090C11] hover:opacity-90"
              >
                {sa.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{sa.playing ? (lang === 'pl' ? 'Pauza DSP' : 'Pause DSP') : 'Play DSP'}</span>
              </button>

              <div className="flex items-center gap-1">
                {([5, 15, 25] as const).map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => dispatch({ type: 'SET_AUDIO_DURATION', durationMin: min })}
                    className={`rounded-lg px-2 py-1 font-mono text-xs ${
                      sa.durationMin === min
                        ? 'bg-[#090C11] text-white dark:bg-white/20'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400">Vol</span>
              <input
                type="range"
                min={0.05}
                max={0.8}
                step={0.05}
                value={sa.volume}
                onChange={(e) =>
                  dispatch({ type: 'SET_AUDIO_VOLUME', volume: Number(e.target.value) })
                }
                className="w-28 accent-[#2DD4BF]"
              />
            </label>
          </div>
        </div>

        {/* GPU Breathing Pacer Orb */}
        <div className="flex flex-col items-center justify-between rounded-2xl border border-slate-900/10 bg-[#0B0E14] p-6 text-center text-white dark:border-white/10 lg:col-span-5">
          <div>
            <div className="font-mono text-xs text-[#2DD4BF]">4s WDECH → 6s WYDECH</div>
            <h2 className="mt-1 text-base font-bold">
              {lang === 'pl' ? 'Przewodnik Oddechowy (GPU Orb)' : 'Breathing Pacer Orb'}
            </h2>
          </div>

          <div className="my-6 flex h-36 w-36 items-center justify-center">
            <div
              className={`flex h-28 w-28 items-center justify-center rounded-full border border-[#2DD4BF]/60 bg-[#2DD4BF]/15 shadow-[0_0_40px_rgba(45,212,191,0.25)] ${
                sa.breathingActive ? 'breathing-orb-active' : ''
              }`}
            >
              <Wind className="h-7 w-7 text-[#2DD4BF]" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch({ type: 'TOGGLE_BREATHING' })}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            {sa.breathingActive
              ? lang === 'pl'
                ? 'Zatrzymaj Rytm 4-6'
                : 'Stop Breath Pacer'
              : lang === 'pl'
              ? 'Uruchom Oddech 4-6'
              : 'Start 4-6 Breath Pacer'}
          </button>
        </div>
      </div>

      {/* 30-Second Soul Dump & Script Composer */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form
          onSubmit={handleComposeSoulDump}
          className="space-y-3 rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219] lg:col-span-5"
        >
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {lang === 'pl'
              ? '30-Sekundowy Soul Dump & Kompozytor Skryptu'
              : '30-Second Soul Dump & Script Composer'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'pl'
              ? 'Wpisz co jest teraz żywe w Twojej głowie — Jarvis zapisze wpis i wplecie Twoje słowa w 5-minutowy skrypt oddechowy.'
              : 'Write what is alive in your mind — Jarvis logs it and composes a timed breathing script.'}
          </p>
          <textarea
            rows={4}
            value={soulInput}
            onChange={(e) => setSoulInput(e.target.value)}
            placeholder={
              lang === 'pl'
                ? 'Np. Jestem wdzięczny za spokojny poranek i chcę wejść w blok projektowy bez pośpiechu...'
                : 'What is present in your mind right now?'
            }
            className="w-full rounded-xl border border-slate-900/12 bg-slate-50 p-3 text-xs dark:border-white/12 dark:bg-white/5"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-[#090C11] py-2.5 text-xs font-semibold text-white dark:bg-[#2DD4BF] dark:text-[#090C11]"
          >
            {lang === 'pl' ? 'Zapisz & Skomponuj Skrypt 5m' : 'Save & Compose 5m Script'}
          </button>
        </form>

        <div className="space-y-3 rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219] lg:col-span-7">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {lang === 'pl' ? 'Dziennik Refleksji & Skrypty' : 'Reflection Journal & Composed Scripts'}
          </h2>
          <div className="space-y-3">
            {sa.journal.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-slate-900/8 bg-slate-50/70 p-4 dark:border-white/8 dark:bg-white/[0.03]"
              >
                <div className="font-mono text-[11px] text-[#0D9488] dark:text-[#2DD4BF]">
                  {entry.timestamp}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">
                  “{entry.promptText}”
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {entry.generatedScript}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SanctuaryAudioView;
