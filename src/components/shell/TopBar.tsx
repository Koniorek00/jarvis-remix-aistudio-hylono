import React, { useRef } from 'react';
import { Download, Menu, Moon, Search, Sun, Upload } from 'lucide-react';
import { MODULE_VISUALS } from '../../assets/visualManifest';
import { downloadTextFile } from '../../engines/healthDossierExporter';
import { t } from '../../store/i18n';
import { useJarvis } from '../../store/jarvisStore';
import { JarvisState } from '../../types/jarvis';

interface TopBarProps {
  onOpenMobileNav: () => void;
  onOpenPalette: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileNav, onOpenPalette }) => {
  const { state, dispatch, notify } = useJarvis();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lang = state.language;
  const activeVisual = MODULE_VISUALS[state.activeModule];
  const activeTitle = lang === 'pl' ? activeVisual.titlePl : activeVisual.titleEn;

  const handleExportBackup = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadTextFile(
      `jarvis-personal-os-backup-${stamp}.json`,
      JSON.stringify(state, null, 2),
      'application/json;charset=utf-8'
    );
    notify(lang === 'pl' ? 'Wyeksportowano pełny backup JSON' : 'Full JSON backup exported', 'emerald');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as JarvisState;
        if (!parsed.vitalPulse || !parsed.healthDossier || !parsed.forgeMind) {
          throw new Error('Invalid schema');
        }
        dispatch({ type: 'RESTORE_STATE', state: parsed });
        notify(
          lang === 'pl' ? 'Przywrócono stan z pliku JSON' : 'State restored from JSON backup',
          'emerald'
        );
      } catch {
        notify(
          lang === 'pl' ? 'Nieprawidłowy plik kopii zapasowej' : 'Invalid backup JSON file',
          'rose'
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-slate-900/10 bg-[#F4F3EF]/95 px-4 dark:border-white/10 dark:bg-[#07090D]/95 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-900/12 bg-white text-slate-700 dark:border-white/12 dark:bg-[#0E1219] dark:text-slate-200 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex min-w-0 items-center gap-2 text-xs md:text-sm">
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_MODULE', moduleId: 'command-deck' })}
            className="whitespace-nowrap shrink-0 font-mono text-xs font-semibold tracking-wider text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            JARVIS
          </button>
          <span className="text-slate-400" aria-hidden="true">
            /
          </span>
          <span className="truncate font-semibold text-slate-900 dark:text-white">
            {activeVisual.code}. {activeTitle}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenPalette}
          className="flex h-9 items-center gap-2 whitespace-nowrap rounded-xl border border-slate-900/12 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:border-slate-900/25 hover:text-slate-900 dark:border-white/12 dark:bg-[#0E1219] dark:text-slate-300 dark:hover:border-white/25 dark:hover:text-white"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t(lang, 'searchBtn')}</span>
          <kbd className="hidden rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:bg-white/10 dark:text-slate-400 md:inline">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'TOGGLE_LANGUAGE' })}
          aria-label="Switch language PL / EN"
          className="flex h-9 items-center whitespace-nowrap rounded-xl border border-slate-900/12 bg-white px-3 font-mono text-xs font-semibold text-slate-800 transition-colors hover:border-slate-900/25 dark:border-white/12 dark:bg-[#0E1219] dark:text-slate-100"
        >
          {lang === 'pl' ? 'PL / EN' : 'EN / PL'}
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
          aria-label={state.theme === 'day' ? t(lang, 'oledMode') : t(lang, 'dayMode')}
          className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-900/12 bg-white px-3 text-xs font-medium text-slate-800 transition-colors hover:border-slate-900/25 dark:border-white/12 dark:bg-[#0E1219] dark:text-slate-100"
        >
          {state.theme === 'day' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-[#14F1D9]" />}
          <span className="hidden md:inline">
            {state.theme === 'day' ? t(lang, 'oledMode') : t(lang, 'dayMode')}
          </span>
        </button>

        <button
          type="button"
          onClick={handleExportBackup}
          className="hidden h-9 items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-900/12 bg-white px-3 text-xs font-medium text-slate-800 transition-colors hover:border-slate-900/25 dark:border-white/12 dark:bg-[#0E1219] dark:text-slate-100 sm:flex"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">{t(lang, 'exportBackup')}</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label={t(lang, 'importBackup')}
          title={t(lang, 'importBackup')}
          className="hidden h-9 items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-900/12 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-900/25 dark:border-white/12 dark:bg-[#0E1219] dark:text-slate-200 md:flex"
        >
          <Upload className="h-3.5 w-3.5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleImportFile}
          className="hidden"
        />
      </div>
    </header>
  );
};
