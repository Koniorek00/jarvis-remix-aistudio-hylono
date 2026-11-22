import React, { useMemo, useState } from 'react';
import { Download, FileText, Plus, Printer, Trash2 } from 'lucide-react';
import { MODULE_VISUALS } from '../assets/visualManifest';
import { PageHero } from '../components/ui/PageHero';
import { PhotographicCard } from '../components/ui/PhotographicCard';
import { RangeBar } from '../components/ui/RangeBar';
import {
  buildHealthDossierHtml,
  buildHealthDossierMarkdown,
  downloadTextFile,
  printHealthReportViaIframe,
} from '../engines/healthDossierExporter';
import { computeBiomarkerSummary, getBiomarkerStatus } from '../engines/readinessEngine';
import { useJarvis } from '../store/jarvisStore';

export const HealthDossierView: React.FC = () => {
  const { state, dispatch, notify } = useJarvis();
  const lang = state.language;
  const hd = state.healthDossier;

  const [showAddForm, setShowAddForm] = useState(false);
  const [bmName, setBmName] = useState('');
  const [bmValue, setBmValue] = useState('');
  const [bmUnit, setBmUnit] = useState('mg/dL');
  const [bmLabMin, setBmLabMin] = useState('10');
  const [bmLabMax, setBmLabMax] = useState('100');
  const [bmOptMin, setBmOptMin] = useState('40');
  const [bmOptMax, setBmOptMax] = useState('75');
  const [newQuestion, setNewQuestion] = useState('');

  const summary = useMemo(() => computeBiomarkerSummary(hd.biomarkers), [hd.biomarkers]);

  const handleAddBiomarker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bmName.trim() || !bmValue) return;
    dispatch({
      type: 'ADD_BIOMARKER',
      biomarker: {
        name: bmName.trim(),
        value: Number(bmValue),
        unit: bmUnit.trim() || 'u',
        labMin: Number(bmLabMin) || 0,
        labMax: Number(bmLabMax) || 100,
        optimalMin: Number(bmOptMin) || 20,
        optimalMax: Number(bmOptMax) || 80,
        delta: 0,
        date: new Date().toISOString().slice(0, 10),
        category: lang === 'pl' ? 'Nowy wynik' : 'New Lab',
      },
    });
    setBmName('');
    setBmValue('');
    setShowAddForm(false);
    notify(lang === 'pl' ? 'Dodano wynik biomarkera' : 'Biomarker result added', 'emerald');
  };

  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHero
        moduleId="health-dossier"
        kpis={[
          { label: lang === 'pl' ? 'Biomarkery' : 'Biomarkers', value: `${summary.total}`, accent: true },
          { label: lang === 'pl' ? 'Optymalne' : 'Optimal', value: `${summary.optimal}` },
          { label: lang === 'pl' ? 'Do obserwacji' : 'Watchlist', value: `${summary.watch + summary.alert}` },
          { label: lang === 'pl' ? 'Dokumenty' : 'Documents', value: `${hd.documents.length}` },
        ]}
      />

      {/* 1-Click Instant Health Dossier Download Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-900/10 bg-white p-4 dark:border-white/10 dark:bg-[#0E1219]">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {lang === 'pl'
              ? 'Natychmiastowy Eksport Executive Health Dossier'
              : '1-Click Executive Health Dossier Export'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'pl'
              ? 'Kompiluje lokalnie HRV, biomarkery, suplementy, treningi i pytania na wizytę lekarską.'
              : 'Locally compiles HRV, biomarkers, supplements, workouts, and physician visit questions.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              printHealthReportViaIframe(state);
              notify(lang === 'pl' ? 'Otwarto okno druku / PDF' : 'Print / PDF dialog opened', 'cyan');
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#090C11] px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-[#38BDF8] dark:text-[#090C11]"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>{lang === 'pl' ? 'Pobierz Raport Zdrowia (PDF / Druk)' : 'Health Report (PDF / Print)'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              downloadTextFile(
                `jarvis-health-dossier-${todayIso}.md`,
                buildHealthDossierMarkdown(state),
                'text/markdown;charset=utf-8'
              );
              notify('Obsidian .md exported', 'emerald');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-900/12 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-white/12 dark:bg-white/5 dark:text-slate-100"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Obsidian (.md)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              downloadTextFile(
                `jarvis-health-dossier-${todayIso}.html`,
                buildHealthDossierHtml(state),
                'text/html;charset=utf-8'
              );
              notify('HTML Dossier downloaded', 'emerald');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-900/12 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-white/12 dark:bg-white/5 dark:text-slate-100"
          >
            <Download className="h-3.5 w-3.5" />
            <span>HTML</span>
          </button>
          <button
            type="button"
            onClick={() => {
              downloadTextFile(
                `jarvis-health-backup-${todayIso}.json`,
                JSON.stringify(hd, null, 2),
                'application/json;charset=utf-8'
              );
              notify('Health JSON exported', 'emerald');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-900/12 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-white/12 dark:bg-white/5 dark:text-slate-100"
          >
            <Download className="h-3.5 w-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Biomarker Optimal-Range Table */}
      <div className="rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {lang === 'pl'
              ? 'Biomarkery Długowieczności (Norma Lab vs. Strefa Optymalna)'
              : 'Longevity Biomarkers (Lab Range vs. Optimal Zone)'}
          </h2>
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl bg-[#38BDF8] px-3 py-1.5 text-xs font-bold text-[#090C11]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{lang === 'pl' ? 'Dodaj Wynik Badania' : 'Add Lab Result'}</span>
          </button>
        </div>

        {showAddForm && (
          <form
            onSubmit={handleAddBiomarker}
            className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-900/10 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5 sm:grid-cols-8"
          >
            <input
              type="text"
              value={bmName}
              onChange={(e) => setBmName(e.target.value)}
              placeholder={lang === 'pl' ? 'Nazwa (np. Kortyzol)' : 'Marker name'}
              className="col-span-2 h-9 rounded-lg border border-slate-900/10 bg-white px-2.5 text-xs dark:border-white/10 dark:bg-[#0B0E14]"
            />
            <input
              type="number"
              step="0.01"
              value={bmValue}
              onChange={(e) => setBmValue(e.target.value)}
              placeholder="Wynik"
              className="h-9 rounded-lg border border-slate-900/10 bg-white px-2 text-right font-mono text-xs dark:border-white/10 dark:bg-[#0B0E14]"
            />
            <input
              type="text"
              value={bmUnit}
              onChange={(e) => setBmUnit(e.target.value)}
              placeholder="Jedn."
              className="h-9 rounded-lg border border-slate-900/10 bg-white px-2 font-mono text-xs dark:border-white/10 dark:bg-[#0B0E14]"
            />
            <input
              type="number"
              value={bmLabMin}
              onChange={(e) => setBmLabMin(e.target.value)}
              placeholder="Lab min"
              className="h-9 rounded-lg border border-slate-900/10 bg-white px-2 text-right font-mono text-xs dark:border-white/10 dark:bg-[#0B0E14]"
            />
            <input
              type="number"
              value={bmLabMax}
              onChange={(e) => setBmLabMax(e.target.value)}
              placeholder="Lab max"
              className="h-9 rounded-lg border border-slate-900/10 bg-white px-2 text-right font-mono text-xs dark:border-white/10 dark:bg-[#0B0E14]"
            />
            <input
              type="number"
              value={bmOptMin}
              onChange={(e) => setBmOptMin(e.target.value)}
              placeholder="Opt min"
              className="h-9 rounded-lg border border-slate-900/10 bg-white px-2 text-right font-mono text-xs dark:border-white/10 dark:bg-[#0B0E14]"
            />
            <button
              type="submit"
              className="h-9 rounded-lg bg-[#090C11] text-xs font-semibold text-white dark:bg-[#38BDF8] dark:text-[#090C11]"
            >
              {lang === 'pl' ? 'Zapisz' : 'Save'}
            </button>
          </form>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-900/10 font-mono text-[11px] text-slate-500 dark:border-white/10 dark:text-slate-400">
                <th className="py-2 pr-3">Biomarker</th>
                <th className="py-2 px-3 text-right">{lang === 'pl' ? 'Wynik' : 'Value'}</th>
                <th className="py-2 px-3">{lang === 'pl' ? 'Rozkład Lab vs Optymalny' : 'Range Bar'}</th>
                <th className="py-2 px-3 text-right">Delta</th>
                <th className="py-2 pl-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/8 dark:divide-white/8">
              {hd.biomarkers.map((b) => {
                const status = getBiomarkerStatus(b);
                const statusText =
                  status === 'optimal'
                    ? lang === 'pl'
                      ? 'Optymalny'
                      : 'Optimal'
                    : status === 'watch'
                    ? lang === 'pl'
                      ? 'Obserwacja'
                      : 'Watch'
                    : lang === 'pl'
                    ? 'Poza normą'
                    : 'Alert';

                return (
                  <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                    <td className="py-3 pr-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{b.name}</div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {b.category} · {b.date}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      <input
                        type="number"
                        step="0.1"
                        value={b.value}
                        aria-label={`Edit ${b.name} value`}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_BIOMARKER_VALUE',
                            id: b.id,
                            value: Number(e.target.value) || 0,
                          })
                        }
                        className="w-20 rounded-lg border border-slate-900/10 bg-slate-50 px-2 py-1 text-right font-semibold text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />{' '}
                      <span className="text-slate-400">{b.unit}</span>
                    </td>
                    <td className="py-3 px-3">
                      <RangeBar biomarker={b} />
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {b.delta >= 0 ? `+${b.delta}` : b.delta}
                    </td>
                    <td className="py-3 pl-3 text-right font-mono font-semibold">
                      <span
                        className={
                          status === 'optimal'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : status === 'watch'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }
                      >
                        {statusText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Vault + Doctor Visit Questions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-7">
          {hd.documents.map((doc) => (
            <PhotographicCard
              key={doc.id}
              imageUrl={MODULE_VISUALS['health-dossier'].cardUrl}
              fallbackGradient={MODULE_VISUALS['health-dossier'].fallbackGradient}
              alt={lang === 'pl' ? doc.titlePl : doc.titleEn}
              belowFold
              className="p-4"
            >
              <div className="font-mono text-[11px] text-[#38BDF8]">{doc.date}</div>
              <h3 className="mt-1 text-sm font-bold text-white">
                {lang === 'pl' ? doc.titlePl : doc.titleEn}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                {lang === 'pl' ? doc.summaryPl : doc.summaryEn}
              </p>
            </PhotographicCard>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-[#0E1219] lg:col-span-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {lang === 'pl' ? 'Pytania na Wizytę Lekarską' : 'Doctor Visit Question Checklist'}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {lang === 'pl'
              ? 'Automatycznie dołączane do eksportu PDF oraz Markdown.'
              : 'Automatically embedded into PDF and Markdown dossier exports.'}
          </p>

          <ul className="mt-3 space-y-2">
            {hd.doctorQuestions.map((q, idx) => (
              <li
                key={idx}
                className="flex items-start justify-between gap-2 rounded-xl border border-slate-900/8 p-3 text-xs dark:border-white/8"
              >
                <span className="leading-relaxed text-slate-700 dark:text-slate-200">{q}</span>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'REMOVE_DOCTOR_QUESTION', index: idx })}
                  aria-label={`Remove question ${idx + 1}`}
                  className="shrink-0 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newQuestion.trim()) return;
              dispatch({ type: 'ADD_DOCTOR_QUESTION', question: newQuestion.trim() });
              setNewQuestion('');
            }}
            className="mt-3 flex gap-2"
          >
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder={lang === 'pl' ? 'Dodaj pytanie do lekarza...' : 'Add question for doctor...'}
              className="h-9 flex-1 rounded-xl border border-slate-900/12 bg-slate-50 px-3 text-xs dark:border-white/12 dark:bg-white/5"
            />
            <button
              type="submit"
              className="h-9 rounded-xl bg-[#090C11] px-3 text-xs font-semibold text-white dark:bg-[#38BDF8] dark:text-[#090C11]"
            >
              +
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HealthDossierView;
