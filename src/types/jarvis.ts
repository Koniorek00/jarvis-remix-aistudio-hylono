export type ModuleId =
  | 'command-deck'
  | 'vital-pulse'
  | 'training-lab'
  | 'fuel-nutrition'
  | 'health-dossier'
  | 'day-rhythm'
  | 'inner-circle'
  | 'life-finance'
  | 'hardware-nodes'
  | 'ai-swarm'
  | 'forge-mind'
  | 'sanctuary-audio';

export type PillarId = 'core' | 'body' | 'life' | 'mind';
export type PillarFilter = 'all' | 'pinned' | 'body' | 'life' | 'mind';
export type OsMode = 'ACTIVE' | 'DEEP WORK' | 'FIELD' | 'STEALTH';
export type Language = 'pl' | 'en';
export type ThemeMode = 'day' | 'oled';
export type DeckViewMode = 'bento' | 'compact';

export interface BioStackStep {
  id: string;
  titlePl: string;
  titleEn: string;
  protocolPl: string;
  protocolEn: string;
  durationMin: number;
  completed: boolean;
}

export interface BioCheckIn {
  id: string;
  timestamp: string;
  energy: number;
  clarity: number;
  mood: number;
  muscleRecovery: number;
  stress: number;
  note: string;
}

export interface VitalPulseState {
  hrvMs: number;
  rhrBpm: number;
  sleepHours: number;
  sleepQuality: number;
  bodyTempDelta: number;
  bioStackSteps: BioStackStep[];
  activeStepId: string | null;
  activeStepRemainingSec: number;
  activeStepRunning: boolean;
  checkIns: BioCheckIn[];
}

export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'legs' | 'core' | 'arms';

export interface ExerciseSet {
  id: string;
  weightKg: number;
  reps: number;
  rpe: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  bestVolumeKg: number;
  sets: ExerciseSet[];
}

export interface WorkoutProtocol {
  id: string;
  titlePl: string;
  titleEn: string;
  focusPl: string;
  focusEn: string;
  durationMin: number;
  exercises: WorkoutExercise[];
}

export interface WorkoutSessionLog {
  id: string;
  dateIso: string;
  protocolTitle: string;
  totalVolumeKg: number;
  zone2Minutes: number;
  musclesWorked: MuscleGroup[];
  prAchieved: boolean;
}

export interface TrainingLabState {
  activeProtocolId: string;
  protocols: WorkoutProtocol[];
  sessionLogs: WorkoutSessionLog[];
  restTimerSec: number;
  restTimerRunning: boolean;
  restDefaultSec: 60 | 90 | 120;
  weeklyZone2Minutes: number[];
  weeklyTonnageKg: number[];
}

export interface MealEntry {
  id: string;
  namePl: string;
  nameEn: string;
  time: string;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  fiberG: number;
}

export interface FavoriteMealTemplate {
  id: string;
  namePl: string;
  nameEn: string;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  fiberG: number;
  moduleAccent?: string;
}

export type SupplementSlot = 'morning' | 'midday' | 'evening';

export interface SupplementItem {
  id: string;
  name: string;
  dosage: string;
  slot: SupplementSlot;
  takenToday: boolean;
  linkedRestockId?: string;
}

export interface FuelNutritionState {
  calorieTarget: number;
  proteinTargetG: number;
  fatTargetG: number;
  carbsTargetG: number;
  fiberTargetG: number;
  waterMl: number;
  electrolytesCount: number;
  sodiumMg: number;
  potassiumMg: number;
  meals: MealEntry[];
  favorites: FavoriteMealTemplate[];
  supplements: SupplementItem[];
  fastingActive: boolean;
  fastingElapsedHours: number;
  fastingGoalHours: number;
}

export interface Biomarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  labMin: number;
  labMax: number;
  optimalMin: number;
  optimalMax: number;
  delta: number;
  date: string;
  category: string;
}

export interface HealthDocument {
  id: string;
  titlePl: string;
  titleEn: string;
  category: 'blood' | 'imaging' | 'recovery' | 'visit';
  date: string;
  summaryPl: string;
  summaryEn: string;
}

export interface HealthDossierState {
  operatorName: string;
  operatorAge: number;
  bloodType: string;
  biomarkers: Biomarker[];
  documents: HealthDocument[];
  doctorQuestions: string[];
}

export interface UltradianBlock {
  id: string;
  titlePl: string;
  titleEn: string;
  timeRange: string;
  durationMin: number;
  kind: 'anchor' | 'deep' | 'recovery' | 'shutdown';
  completed: boolean;
}

export type TaskTier = 'needle' | 'leverage' | 'inbox';

export interface PriorityTask {
  id: string;
  title: string;
  tier: TaskTier;
  done: boolean;
}

export interface DayRhythmState {
  blocks: UltradianBlock[];
  activeBlockId: string;
  remainingSec: number;
  timerRunning: boolean;
  tasks: PriorityTask[];
}

export type CircleGroup = 'family' | 'friends' | 'mentors';

export interface ContactPerson {
  id: string;
  name: string;
  rolePl: string;
  roleEn: string;
  group: CircleGroup;
  daysSinceContact: number;
  desiredCadenceDays: number;
  contextNotePl: string;
  contextNoteEn: string;
  upcomingEvent: string;
  lastGesture: string;
}

export interface InnerCircleState {
  contacts: ContactPerson[];
}

export interface CashflowEntry {
  id: string;
  label: string;
  amountPln: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
}

export interface RestockItem {
  id: string;
  name: string;
  category: string;
  stockPct: number;
  status: 'ok' | 'low' | 'out';
  unitNote: string;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  monthlyPln: number;
  category: string;
  flaggedForCut: boolean;
}

export interface LifeFinanceState {
  liquidReservePln: number;
  monthlyIncomePln: number;
  monthlyFixedCostPln: number;
  transactions: CashflowEntry[];
  restockItems: RestockItem[];
  subscriptions: SubscriptionItem[];
}

export interface HardwareNode {
  id: 'S1' | 'S2' | 'S3' | 'S4';
  name: string;
  rolePl: string;
  roleEn: string;
  endpoint: string;
  status: 'online' | 'degraded';
  latencyMs: number;
  cpuPct: number;
  ramPct: number;
  stackLabel: string;
}

export interface BioGearItem {
  id: string;
  namePl: string;
  nameEn: string;
  sessionsCount: number;
  lastUsedDate: string;
  spec: string;
}

export interface HardwareNodesState {
  nodes: HardwareNode[];
  bioGear: BioGearItem[];
  lastPingTimestamp: string;
}

export interface AgentTraceStep {
  id: string;
  label: string;
  status: 'done' | 'running' | 'queued';
  durationMs: number;
}

export interface AgentProposal {
  id: string;
  title: string;
  agent: string;
  estimatedUsd: number;
  status: 'pending' | 'running' | 'completed' | 'rejected';
  planSteps: string[];
  traces: AgentTraceStep[];
}

export interface AiSwarmState {
  dailyBudgetCapUsd: number;
  spentTodayUsd: number;
  proposals: AgentProposal[];
}

export type VesselType = 'audio' | 'comic' | 'story' | 'video' | 'recall' | 'arena';
export type MasteryGrade = 'solid' | 'partial' | 'miss';

export interface KnowledgeAtom {
  id: string;
  code: string;
  titlePl: string;
  titleEn: string;
  domainPl: string;
  domainEn: string;
  stage: number; // S1-S6
  dueForReview: boolean;
  nextReviewDays: number;
  coreMechanismPl: string;
  coreMechanismEn: string;
  vessels: {
    audio: string;
    comic: string[];
    story: string;
    video: string;
    recallPrompt: string;
    arenaScenario: string;
  };
}

export interface ForgeMindState {
  totalAtomsCount: number;
  sprintDay: number;
  sprintTotalDays: number;
  selectedAtomId: string;
  activeVessel: VesselType;
  atoms: KnowledgeAtom[];
}

export type AudioPresetId = 'clarity' | 'calm' | 'focus' | 'sleep';
export type AudioOutputMode = 'headphones' | 'speakers';

export interface JournalEntry {
  id: string;
  timestamp: string;
  promptText: string;
  generatedScript: string;
}

export interface SanctuaryAudioState {
  preset: AudioPresetId;
  outputMode: AudioOutputMode;
  playing: boolean;
  volume: number;
  durationMin: 5 | 15 | 25;
  remainingSec: number;
  breathingActive: boolean;
  journal: JournalEntry[];
}

export interface ToastItem {
  id: string;
  message: string;
  tone: 'cyan' | 'emerald' | 'amber' | 'rose';
}

export interface JarvisState {
  activeModule: ModuleId;
  osMode: OsMode;
  language: Language;
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  deckViewMode: DeckViewMode;
  pinnedModules: ModuleId[];
  vitalPulse: VitalPulseState;
  trainingLab: TrainingLabState;
  fuelNutrition: FuelNutritionState;
  healthDossier: HealthDossierState;
  dayRhythm: DayRhythmState;
  innerCircle: InnerCircleState;
  lifeFinance: LifeFinanceState;
  hardwareNodes: HardwareNodesState;
  aiSwarm: AiSwarmState;
  forgeMind: ForgeMindState;
  sanctuaryAudio: SanctuaryAudioState;
}
