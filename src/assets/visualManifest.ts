import { ModuleId, PillarId } from '../types/jarvis';

export interface ModuleVisualSpec {
  id: ModuleId;
  code: string;
  pillar: PillarId;
  accent: string;
  heroUrl: string;
  cardUrl: string;
  sidebarUrl: string;
  fallbackGradient: string;
  titlePl: string;
  titleEn: string;
  sidebarTitlePl?: string;
  subtitlePl: string;
  subtitleEn: string;
}

function makePaths(slug: string) {
  return {
    heroUrl: `/src/assets/images/opt/${slug}_hero.webp`,
    cardUrl: `/src/assets/images/opt/${slug}_card.webp`,
    sidebarUrl: `/src/assets/images/opt/${slug}_sidebar.webp`,
  };
}

export const MODULE_VISUALS: Record<ModuleId, ModuleVisualSpec> = {
  'command-deck': {
    id: 'command-deck',
    code: '00',
    pillar: 'core',
    accent: '#14F1D9',
    ...makePaths('jarvis_command_deck_1795370732363'),
    fallbackGradient:
      'radial-gradient(circle at 82% 50%, rgba(20, 241, 217, 0.24) 0%, rgba(11, 14, 20, 0.96) 58%, #090C11 100%)',
    titlePl: 'Pokład Dowodzenia',
    titleEn: 'Command Deck',
    subtitlePl: 'Centralny kokpit telemetryczny, priorytety przypięte i akcje błyskawiczne.',
    subtitleEn: 'Central telemetry cockpit, pinned priorities, and instant cross-module actions.',
  },
  'vital-pulse': {
    id: 'vital-pulse',
    code: '01',
    pillar: 'body',
    accent: '#14F1D9',
    ...makePaths('jarvis_vital_pulse_1795370730530'),
    fallbackGradient:
      'radial-gradient(circle at 80% 48%, rgba(20, 241, 217, 0.26) 0%, rgba(11, 14, 20, 0.96) 56%, #090C11 100%)',
    titlePl: 'Puls Witalny',
    titleEn: 'Vital Pulse',
    subtitlePl: 'Gotowość biologiczna, HRV, krzywa dobowo-rytmiczna i poranny Bio-Stack 75m.',
    subtitleEn: 'Biological readiness, HRV telemetry, circadian curve, and 75m Bio-Stack sequencer.',
  },
  'training-lab': {
    id: 'training-lab',
    code: '02',
    pillar: 'body',
    accent: '#FFB020',
    ...makePaths('jarvis_training_lab_1795370730035'),
    fallbackGradient:
      'radial-gradient(circle at 82% 52%, rgba(255, 176, 32, 0.24) 0%, rgba(11, 14, 20, 0.96) 56%, #090C11 100%)',
    titlePl: 'Laboratorium Treningu',
    titleEn: 'Training Lab',
    subtitlePl: 'Precyzyjny rejestrator serii, rekordy PR, minutnik przerw i mapa regeneracji mięśni.',
    subtitleEn: 'Precision set logger, automatic PR detection, rest countdown, and muscle recovery map.',
  },
  'fuel-nutrition': {
    id: 'fuel-nutrition',
    code: '03',
    pillar: 'body',
    accent: '#84CC16',
    ...makePaths('jarvis_fuel_nutrition_1795370730214'),
    fallbackGradient:
      'radial-gradient(circle at 80% 50%, rgba(132, 204, 22, 0.22) 0%, rgba(11, 14, 20, 0.96) 58%, #090C11 100%)',
    titlePl: 'Paliwo & Odżywianie',
    titleEn: 'Fuel & Nutrition',
    subtitlePl: 'Makroskładniki, nawodnienie CNC z elektrolitami, matryca suplementów i okno 16:8.',
    subtitleEn: 'Macros, CNC hydration & electrolyte deck, supplement matrix, and 16:8 fasting arc.',
  },
  'health-dossier': {
    id: 'health-dossier',
    code: '04',
    pillar: 'body',
    accent: '#38BDF8',
    ...makePaths('jarvis_health_dossier_1795370730294'),
    fallbackGradient:
      'radial-gradient(circle at 80% 48%, rgba(56, 189, 248, 0.24) 0%, rgba(11, 14, 20, 0.96) 58%, #090C11 100%)',
    titlePl: 'Skarbiec & Dossier Zdrowia',
    sidebarTitlePl: 'Skarbiec Zdrowia',
    titleEn: 'Health Vault & Dossier',
    subtitlePl: 'Biomarkery długowieczności, strefy optymalne i natychmiastowy eksport dla lekarza.',
    subtitleEn: 'Longevity biomarkers, optimal range telemetry, and 1-click medical dossier export.',
  },
  'day-rhythm': {
    id: 'day-rhythm',
    code: '05',
    pillar: 'life',
    accent: '#0A84FF',
    ...makePaths('jarvis_day_rhythm_1795370729988'),
    fallbackGradient:
      'radial-gradient(circle at 80% 50%, rgba(10, 132, 255, 0.24) 0%, rgba(11, 14, 20, 0.96) 58%, #090C11 100%)',
    titlePl: 'Rytm Dnia 90m',
    titleEn: 'Day Rhythm',
    subtitlePl: 'Bloki ultradialne 90 minut, kokpit 3 poziomów jasności i ochrona głębokiej pracy.',
    subtitleEn: '90-minute ultradian focus engine and 3-tier priority cockpit.',
  },
  'inner-circle': {
    id: 'inner-circle',
    code: '06',
    pillar: 'life',
    accent: '#FB7185',
    ...makePaths('jarvis_inner_circle_1795370732438'),
    fallbackGradient:
      'radial-gradient(circle at 80% 50%, rgba(251, 113, 133, 0.22) 0%, rgba(11, 14, 20, 0.96) 58%, #090C11 100%)',
    titlePl: 'Krąg Bliskich',
    titleEn: 'Inner Circle',
    subtitlePl: 'Puls ciepła relacji, kadencja spotkań i prawdziwe gesty offline.',
    subtitleEn: 'Relationship warmth cadence, personal context, and bridge-to-offline gestures.',
  },
  'life-finance': {
    id: 'life-finance',
    code: '07',
    pillar: 'life',
    accent: '#10B981',
    ...makePaths('jarvis_life_finance_1795370730447'),
    fallbackGradient:
      'radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.22) 0%, rgba(11, 14, 20, 0.96) 58%, #090C11 100%)',
    titlePl: 'Operacje & Finanse',
    titleEn: 'Life & Finance Ops',
    subtitlePl: 'Radar Runway, przepływy, magazyn zapasów i audyt subskrypcji.',
    subtitleEn: 'Personal runway radar, cashflow logger, essentials restock, and subscription audit.',
  },
  'hardware-nodes': {
    id: 'hardware-nodes',
    code: '08',
    pillar: 'life',
    accent: '#06B6D4',
    ...makePaths('jarvis_hardware_nodes_1795370730841'),
    fallbackGradient:
      'radial-gradient(circle at 82% 50%, rgba(6, 182, 212, 0.24) 0%, rgba(11, 14, 20, 0.96) 58%, #090C11 100%)',
    titlePl: 'Flota & Węzły S1–S4',
    titleEn: 'Hardware & Nodes',
    subtitlePl: 'Suwerenna sieć urządzeń S1–S4, tryb systemu oraz rejestr bio-sprzętu.',
    subtitleEn: 'Sovereign S1–S4 node mesh telemetry, OS mode control, and bio-hardware log.',
  },
  'ai-swarm': {
    id: 'ai-swarm',
    code: '09',
    pillar: 'mind',
    accent: '#6366F1',
    ...makePaths('jarvis_ai_swarm_1795370731151'),
    fallbackGradient:
      'radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.26) 0%, rgba(11, 14, 20, 0.96) 58%, #090C11 100%)',
    titlePl: 'Rój AI & Agenci',
    titleEn: 'AI Swarm & Agents',
    subtitlePl: 'Bramka akceptacji człowieka, drzewo wykonania i bezpiecznik budżetu.',
    subtitleEn: 'Human-in-the-loop approval gate, live execution trace tree, and budget guard.',
  },
  'forge-mind': {
    id: 'forge-mind',
    code: '10',
    pillar: 'mind',
    accent: '#A855F7',
    ...makePaths('jarvis_forge_mind_1795370731264'),
    fallbackGradient:
      'radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.24) 0%, rgba(11, 14, 20, 0.96) 58%, #090C11 100%)',
    titlePl: 'Kuźnia & Umysł (.jkp)',
    titleEn: 'The Forge & Mind',
    subtitlePl: 'Atomy wiedzy .jkp, przełącznik 6 naczyń polimorficznych i aktywne przywołanie.',
    subtitleEn: 'Knowledge atoms (.jkp), 6-vessel polymorphic delivery, and active recall drill.',
  },
  'documents-vault': {
    id: 'documents-vault' as ModuleId,
    code: '04',
    pillar: 'core',
    accent: '#14F1D9',
    heroUrl: '',
    cardUrl: '',
    sidebarUrl: '',
    fallbackGradient:
      'radial-gradient(circle at 80% 50%, rgba(20, 241, 217, 0.22) 0%, rgba(11, 14, 20, 0.96) 58%, #090C11 100%)',
    titlePl: 'Skarbiec Dokumentów & B2B',
    titleEn: 'Document & B2B Vault',
    subtitlePl: 'Scentralizowany skarbiec umów, KSeF, zgód medycznych i paszportów z pieczęcią SHA-256.',
    subtitleEn: 'Unified repository for personal passports, clinical consents, B2B contracts and KSeF.',
  },
  'sanctuary-audio': {
    id: 'sanctuary-audio',
    code: '11',
    pillar: 'mind',
    accent: '#2DD4BF',
    ...makePaths('jarvis_sanctuary_audio_1795370730344'),
    fallbackGradient:
      'radial-gradient(circle at 80% 50%, rgba(45, 212, 191, 0.22) 0%, rgba(11, 14, 20, 0.96) 58%, #090C11 100%)',
    titlePl: 'Sanktuarium & Audio DSP',
    titleEn: 'Sanctuary & Audio',
    subtitlePl: 'Syntezator Web Audio API (Binaural/Izochroniczne), oddech 4-6 i dziennik Soul Dump.',
    subtitleEn: 'Real-time Web Audio DSP synth, 4s-6s breath pacer, and Soul Dump composer.',
  },
};

export const MODULE_ORDER: ModuleId[] = [
  'command-deck',
  'documents-vault',
  'ai-swarm',
  'hardware-nodes',
  'sanctuary-audio',
  'vital-pulse',
  'training-lab',
  'fuel-nutrition',
  'health-dossier',
  'day-rhythm',
  'inner-circle',
  'life-finance',
  'forge-mind',
];

const prewarmedImages = new Set<string>();
const prewarmedChunks = new Set<ModuleId>();

export const ROUTE_PRELOADERS: Partial<Record<ModuleId, () => Promise<unknown>>> = {
  'command-deck': () => import('../views/CommandDeckView'),
  'documents-vault': () => import('../views/DocumentVaultView'),
  'vital-pulse': () => import('../views/VitalPulseView'),
  'training-lab': () => import('../views/TrainingLabView'),
  'fuel-nutrition': () => import('../views/FuelNutritionView'),
  'health-dossier': () => import('../views/HealthDossierView'),
  'day-rhythm': () => import('../views/DayRhythmView'),
  'inner-circle': () => import('../views/InnerCircleView'),
  'life-finance': () => import('../views/LifeFinanceView'),
  'hardware-nodes': () => import('../views/HardwareNodesView'),
  'ai-swarm': () => import('../views/AiSwarmView'),
  'forge-mind': () => import('../views/ForgeMindView'),
  'sanctuary-audio': () => import('../views/SanctuaryAudioView'),
};

export function prewarmModuleVisual(moduleId: ModuleId): void {
  const spec = MODULE_VISUALS[moduleId];
  if (!spec || typeof window === 'undefined') return;

  const run = () => {
    if (!prewarmedImages.has(spec.heroUrl)) {
      prewarmedImages.add(spec.heroUrl);
      const img = new Image();
      img.decoding = 'async';
      img.src = spec.heroUrl;
    }
    if (!prewarmedChunks.has(moduleId)) {
      prewarmedChunks.add(moduleId);
      ROUTE_PRELOADERS[moduleId]?.().catch(() => {});
    }
  };

  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(run);
  } else {
    setTimeout(run, 32);
  }
}
