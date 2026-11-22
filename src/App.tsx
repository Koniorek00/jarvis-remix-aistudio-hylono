import React, { Component, Suspense, lazy, useEffect, useState } from 'react';
import { CommandPalette } from './components/shell/CommandPalette';
import { Sidebar } from './components/shell/Sidebar';
import { ToastHost } from './components/shell/ToastHost';
import { TopBar } from './components/shell/TopBar';
import { JarvisProvider, useJarvis } from './store/jarvisStore';
import { ModuleId } from './types/jarvis';

const CommandDeckView = lazy(() => import('./views/CommandDeckView'));
const DocumentVaultView = lazy(() => import('./views/DocumentVaultView'));
const VitalPulseView = lazy(() => import('./views/VitalPulseView'));
const TrainingLabView = lazy(() => import('./views/TrainingLabView'));
const FuelNutritionView = lazy(() => import('./views/FuelNutritionView'));
const HealthDossierView = lazy(() => import('./views/HealthDossierView'));
const DayRhythmView = lazy(() => import('./views/DayRhythmView'));
const InnerCircleView = lazy(() => import('./views/InnerCircleView'));
const LifeFinanceView = lazy(() => import('./views/LifeFinanceView'));
const HardwareNodesView = lazy(() => import('./views/HardwareNodesView'));
const AiSwarmView = lazy(() => import('./views/AiSwarmView'));
const ForgeMindView = lazy(() => import('./views/ForgeMindView'));
const SanctuaryAudioView = lazy(() => import('./views/SanctuaryAudioView'));

class JarvisErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(err: Error) {
    return { hasError: true, errorMsg: err.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="m-6 rounded-2xl border border-rose-500/30 bg-[#0B0E14] p-6 text-white">
          <h2 className="text-lg font-bold">JARVIS View Recovery</h2>
          <p className="mt-2 font-mono text-xs text-rose-300">{this.state.errorMsg}</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, errorMsg: '' })}
            className="mt-4 rounded-xl bg-[#14F1D9] px-4 py-2 text-xs font-bold text-[#090C11]"
          >
            Reload View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const VIEW_MAP: Record<ModuleId, React.LazyExoticComponent<React.FC>> = {
  'command-deck': CommandDeckView,
  'documents-vault': DocumentVaultView,
  'vital-pulse': VitalPulseView,
  'training-lab': TrainingLabView,
  'fuel-nutrition': FuelNutritionView,
  'health-dossier': HealthDossierView,
  'day-rhythm': DayRhythmView,
  'inner-circle': InnerCircleView,
  'life-finance': LifeFinanceView,
  'hardware-nodes': HardwareNodesView,
  'ai-swarm': AiSwarmView,
  'forge-mind': ForgeMindView,
  'sanctuary-audio': SanctuaryAudioView,
};

const JarvisShell: React.FC = () => {
  const { state } = useJarvis();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const ActiveView = VIEW_MAP[state.activeModule] ?? CommandDeckView;

  return (
    <div className="flex min-h-screen bg-[#F4F3EF] text-[#111622] transition-colors duration-150 dark:bg-[#07090D] dark:text-slate-100">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          onOpenMobileNav={() => setMobileOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1440px] flex-1 p-4 md:p-6">
          <JarvisErrorBoundary>
            <Suspense
              fallback={
                <div className="space-y-4">
                  <div className="h-48 animate-pulse rounded-[20px] bg-slate-200 dark:bg-[#0E1219]" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="h-44 animate-pulse rounded-[20px] bg-slate-200 dark:bg-[#0E1219]" />
                    <div className="h-44 animate-pulse rounded-[20px] bg-slate-200 dark:bg-[#0E1219]" />
                  </div>
                </div>
              }
            >
              <ActiveView />
            </Suspense>
          </JarvisErrorBoundary>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ToastHost />
    </div>
  );
};

export function App() {
  return (
    <JarvisProvider>
      <JarvisShell />
    </JarvisProvider>
  );
}

export default App;
