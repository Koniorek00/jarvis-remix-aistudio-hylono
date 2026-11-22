import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Search, X, Zap } from 'lucide-react';
import { MODULE_ORDER, MODULE_VISUALS } from '../../assets/visualManifest';
import { printHealthReportViaIframe } from '../../engines/healthDossierExporter';
import { t } from '../../store/i18n';
import { useJarvis } from '../../store/jarvisStore';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface PaletteCommand {
  id: string;
  label: string;
  category: string;
  keywords: string;
  run: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const { state, dispatch, notify } = useJarvis();
  const [rawQuery, setRawQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lang = state.language;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(rawQuery.trim().toLowerCase()), 120);
    return () => window.clearTimeout(timer);
  }, [rawQuery]);

  useEffect(() => {
    if (open) {
      setRawQuery('');
      setDebouncedQuery('');
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const commands = useMemo<PaletteCommand[]>(() => {
    const quickActions: PaletteCommand[] = [
      {
        id: 'act-water',
        label: lang === 'pl' ? '+500 ml Wody (Paliwo)' : '+500 ml Water (Fuel)',
        category: lang === 'pl' ? 'Szybka Akcja' : 'Quick Action',
        keywords: 'woda water hydration fuel +500',
        run: () => {
          dispatch({ type: 'ADD_WATER', ml: 500 });
          notify('+500 ml', 'emerald');
        },
      },
      {
        id: 'act-calm',
        label: lang === 'pl' ? 'Włącz Calm 6 Hz (Sanctuary DSP)' : 'Play Calm 6 Hz (Sanctuary DSP)',
        category: lang === 'pl' ? 'Audio DSP' : 'Audio DSP',
        keywords: 'calm 6hz theta audio sanctuary play',
        run: () => {
          dispatch({ type: 'SET_AUDIO_PRESET', preset: 'calm', autoPlay: true });
          notify('Sanctuary · Calm 6 Hz', 'cyan');
        },
      },
      {
        id: 'act-focus90',
        label: lang === 'pl' ? 'Start Bloku Skupienia 90m' : 'Start 90m Focus Block',
        category: lang === 'pl' ? 'Rytm Dnia' : 'Day Rhythm',
        keywords: 'focus 90m ultradian block timer',
        run: () => {
          dispatch({ type: 'TOGGLE_ULTRADIAN_TIMER' });
          dispatch({ type: 'SET_MODULE', moduleId: 'day-rhythm' });
          notify('90m Focus Block', 'cyan');
        },
      },
      {
        id: 'act-pdf',
        label: lang === 'pl' ? 'Pobierz Raport Zdrowia PDF' : 'Export Health Report PDF',
        category: lang === 'pl' ? 'Dossier Zdrowia' : 'Health Dossier',
        keywords: 'pdf report dossier health raport',
        run: () => {
          printHealthReportViaIframe(state);
          notify(lang === 'pl' ? 'Przygotowano raport PDF' : 'Health PDF prepared', 'cyan');
        },
      },
      {
        id: 'act-theme',
        label: lang === 'pl' ? 'Przełącz tryb Dzień / Noc OLED' : 'Toggle Day / Night OLED Mode',
        category: lang === 'pl' ? 'Wygląd' : 'Appearance',
        keywords: 'theme oled dark day light mode noc',
        run: () => {
          dispatch({ type: 'TOGGLE_THEME' });
        },
      },
      {
        id: 'act-lang',
        label: lang === 'pl' ? 'Przełącz język PL / EN' : 'Switch Language PL / EN',
        category: lang === 'pl' ? 'Język' : 'Language',
        keywords: 'polish english pl en language jezyk',
        run: () => {
          dispatch({ type: 'TOGGLE_LANGUAGE' });
        },
      },
    ];

    const navCommands: PaletteCommand[] = MODULE_ORDER.map((id) => {
      const spec = MODULE_VISUALS[id];
      const title = lang === 'pl' ? spec.titlePl : spec.titleEn;
      return {
        id: `nav-${id}`,
        label: `${spec.code}. ${title}`,
        category: lang === 'pl' ? 'Moduł' : 'Module',
        keywords: `${spec.titlePl} ${spec.titleEn} ${spec.code} ${id}`,
        run: () => dispatch({ type: 'SET_MODULE', moduleId: id }),
      };
    });

    return [...quickActions, ...navCommands];
  }, [lang, dispatch, notify, state]);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(debouncedQuery) ||
        c.keywords.toLowerCase().includes(debouncedQuery) ||
        c.category.toLowerCase().includes(debouncedQuery)
    );
  }, [commands, debouncedQuery]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/65 px-4 pt-20 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t(lang, 'commandPaletteTitle')}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[#0E1219] text-slate-100 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search className="h-4 w-4 text-[#14F1D9]" />
          <input
            ref={inputRef}
            type="text"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && filtered[0]) {
                filtered[0].run();
                onClose();
              }
            }}
            placeholder={t(lang, 'commandPaletteHint')}
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t(lang, 'close')}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">{t(lang, 'noResults')}</div>
          ) : (
            filtered.map((cmd) => (
              <button
                key={cmd.id}
                type="button"
                onClick={() => {
                  cmd.run();
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/8"
              >
                <div className="flex items-center gap-3">
                  <Zap className="h-3.5 w-3.5 text-[#14F1D9]" />
                  <span className="text-sm font-medium text-white">{cmd.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                  <span>{cmd.category}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
