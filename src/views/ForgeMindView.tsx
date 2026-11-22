import React, { useState } from 'react';
import { MODULE_VISUALS } from '../assets/visualManifest';
import { PageHero } from '../components/ui/PageHero';
import { PhotographicCard } from '../components/ui/PhotographicCard';
import { useJarvis } from '../store/jarvisStore';
import { VesselType } from '../types/jarvis';

const VESSELS: { id: VesselType; pl: string; en: string }[] = [
  { id: 'audio', pl: 'Audio 5 min', en: '5m Audio Script' },
  { id: 'comic', pl: 'Komiks 4-Kadrowy', en: '4-Panel Comic' },
  { id: 'story', pl: 'Bajka Wieczorna', en: 'Evening Story' },
  { id: 'video', pl: 'Filmik 15s (Veo)', en: '15s Video Prompt' },
  { id: 'recall', pl: 'Aktywne Przywołanie', en: 'Active Recall' },
  { id: 'arena', pl: 'Arena Mode', en: 'Arena Mode' },
];

export const ForgeMindView: React.FC = () => {
  const { state, dispatch, notify } = useJarvis();
  const lang = state.language;
  const fm = state.forgeMind;

  const [recallInput, setRecallInput] = useState('');
  const [revealed, setRevealed] = useState(false);

  const selectedAtom = fm.atoms.find((a) => a.id === fm.selectedAtomId) ?? fm.atoms[0];
  const dueCount = fm.atoms.filter((a) => a.dueForReview).length;

  return (
    <div className="space-y-6">
      <PageHero
        moduleId="forge-mind"
        kpis={[
          { label: lang === 'pl' ? 'Atomy (.jkp)' : 'Atoms (.jkp)', value: `${fm.totalAtomsCount}`, accent: true },
          { label: lang === 'pl' ? 'Do Powtórki' : 'Due Now', value: `${dueCount}` },
          { label: 'Sprint', value: `${fm.sprintDay}/${fm.sprintTotalDays}` },
          { label: lang === 'pl' ? 'Etap Atomu' : 'Atom Stage', value: `S${selectedAtom.stage}/6` },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Atom Selector List */}
        <div className="space-y-2 lg:col-span-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {lang === 'pl' ? 'Biblioteka Atomów Wiedzy (.jkp)' : 'Knowledge Atoms (.jkp)'}
          </h2>
          <div className="space-y-2">
            {fm.atoms.map((atom) => {
              const isSelected = atom.id === selectedAtom.id;
              return (
                <button
                  key={atom.id}
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'SELECT_ATOM', atomId: atom.id });
                    setRevealed(false);
                    setRecallInput('');
                  }}
                  className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                    isSelected
                      ? 'border-[#A855F7] bg-purple-50/70 dark:bg-[#A855F7]/15'
                      : 'border-slate-900/10 bg-white hover:border-slate-900/25 dark:border-white/10 dark:bg-[#0E1219]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#A855F7]">{atom.code} · S{atom.stage}/6</span>
                    <span className={atom.dueForReview ? 'font-bold text-amber-500' : 'text-slate-400'}>
                      {atom.dueForReview
                        ? lang === 'pl'
                          ? 'Do powtórki'
                          : 'Due'
                        : `${atom.nextReviewDays}d`}
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
                    {lang === 'pl' ? atom.titlePl : atom.titleEn}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'pl' ? atom.domainPl : atom.domainEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1-Atom -> 6-Vessels Polymorphic Viewer & Active Recall Engine */}
        <div className="space-y-4 lg:col-span-8">
          <PhotographicCard
            imageUrl={MODULE_VISUALS['forge-mind'].cardUrl}
            fallbackGradient={MODULE_VISUALS['forge-mind'].fallbackGradient}
            alt={selectedAtom.titlePl}
            className="p-6"
          >
            <div className="font-mono text-xs text-[#A855F7]">
              {selectedAtom.code} · {lang === 'pl' ? selectedAtom.domainPl : selectedAtom.domainEn} · Stage S{selectedAtom.stage}/6
            </div>
            <h2 className="mt-1 text-xl font-bold text-white">
              {lang === 'pl' ? selectedAtom.titlePl : selectedAtom.titleEn}
            </h2>

            {/* 6-Vessels Polymorphic Switcher */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {VESSELS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_ACTIVE_VESSEL', vessel: v.id })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    fm.activeVessel === v.id
                      ? 'bg-[#A855F7] text-white'
                      : 'border border-white/15 bg-white/8 text-slate-200 hover:bg-white/15'
                  }`}
                >
                  {lang === 'pl' ? v.pl : v.en}
                </button>
              ))}
            </div>
          </PhotographicCard>

          <div className="rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219]">
            {fm.activeVessel === 'audio' && (
              <div className="space-y-2">
                <div className="font-mono text-xs font-semibold text-[#A855F7]">
                  {lang === 'pl' ? 'Skrypt Audio z Pauzami Oddechowymi' : 'Audio Script with Breath Pauses'}
                </div>
                <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {selectedAtom.vessels.audio}
                </p>
              </div>
            )}

            {fm.activeVessel === 'comic' && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {selectedAtom.vessels.comic.map((panel, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-900/10 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  >
                    {panel}
                  </div>
                ))}
              </div>
            )}

            {fm.activeVessel === 'story' && (
              <div className="space-y-2">
                <div className="font-mono text-xs font-semibold text-[#A855F7]">
                  {lang === 'pl' ? 'Bajka Wieczorna (Rodzic + Dziecko)' : 'Evening Story Vessel'}
                </div>
                <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {selectedAtom.vessels.story}
                </p>
              </div>
            )}

            {fm.activeVessel === 'video' && (
              <div className="space-y-2">
                <div className="font-mono text-xs font-semibold text-[#A855F7]">
                  Flow / Veo 15s Cinematography Prompt
                </div>
                <pre className="whitespace-pre-wrap rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-100">
                  {selectedAtom.vessels.video}
                </pre>
              </div>
            )}

            {fm.activeVessel === 'arena' && (
              <div className="space-y-3">
                <div className="font-mono text-xs font-semibold text-[#A855F7]">
                  {lang === 'pl' ? 'Symulacja pod Presją (Arena Mode)' : 'High-Pressure Arena Simulation'}
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {selectedAtom.vessels.arenaScenario}
                </p>
              </div>
            )}

            {fm.activeVessel === 'recall' && (
              <div className="space-y-4">
                <div className="font-mono text-xs font-semibold text-[#A855F7]">
                  {lang === 'pl' ? 'Aktywne Przywołanie (Mastery Gate)' : 'Active Recall Drill'}
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedAtom.vessels.recallPrompt}
                </p>
                <textarea
                  rows={3}
                  value={recallInput}
                  onChange={(e) => setRecallInput(e.target.value)}
                  placeholder={
                    lang === 'pl'
                      ? 'Zapisz swoją odpowiedź z pamięci przed odkryciem mechanizmu...'
                      : 'Write your unaided recall before revealing...'
                  }
                  className="w-full rounded-xl border border-slate-900/12 bg-slate-50 p-3 text-xs dark:border-white/12 dark:bg-white/5"
                />

                {!revealed ? (
                  <button
                    type="button"
                    onClick={() => setRevealed(true)}
                    className="rounded-xl bg-[#A855F7] px-4 py-2 text-xs font-semibold text-white"
                  >
                    {lang === 'pl' ? 'Odkryj Rdzeń Mechanizmu' : 'Reveal Core Mechanism'}
                  </button>
                ) : (
                  <div className="space-y-3 rounded-xl border border-[#A855F7]/30 bg-purple-50/50 p-4 dark:bg-[#A855F7]/10">
                    <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-100">
                      {lang === 'pl' ? selectedAtom.coreMechanismPl : selectedAtom.coreMechanismEn}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          dispatch({ type: 'GRADE_ATOM', atomId: selectedAtom.id, grade: 'solid' });
                          notify(`${selectedAtom.code} → S${Math.min(6, selectedAtom.stage + 1)}`, 'emerald');
                          setRevealed(false);
                          setRecallInput('');
                        }}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        {lang === 'pl' ? 'Pewne (Awans +1)' : 'Solid (+1 Stage)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          dispatch({ type: 'GRADE_ATOM', atomId: selectedAtom.id, grade: 'partial' });
                          notify(`${selectedAtom.code} · +2d`, 'amber');
                          setRevealed(false);
                        }}
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-[#090C11]"
                      >
                        {lang === 'pl' ? 'Częściowe' : 'Partial'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          dispatch({ type: 'GRADE_ATOM', atomId: selectedAtom.id, grade: 'miss' });
                          notify(`${selectedAtom.code} · Reset SRS`, 'rose');
                          setRevealed(false);
                        }}
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        {lang === 'pl' ? 'Błąd modelu' : 'Model Miss'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgeMindView;
