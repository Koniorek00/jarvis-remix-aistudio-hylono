import {
  Biomarker,
  ContactPerson,
  LifeFinanceState,
  MuscleGroup,
  VitalPulseState,
  WorkoutSessionLog,
} from '../types/jarvis';

export function computeReadinessScore(vital: VitalPulseState): number {
  const hrvScore = Math.min(100, Math.max(25, (vital.hrvMs / 78) * 90));
  const rhrScore = Math.min(100, Math.max(30, 100 - (vital.rhrBpm - 48) * 2.1));
  const sleepDurScore = Math.min(100, Math.max(20, (vital.sleepHours / 8) * 96));
  const tempPenalty = Math.abs(vital.bodyTempDelta) > 0.4 ? (Math.abs(vital.bodyTempDelta) - 0.4) * 18 : 0;

  const raw =
    hrvScore * 0.36 +
    rhrScore * 0.2 +
    sleepDurScore * 0.24 +
    vital.sleepQuality * 0.2 -
    tempPenalty;

  return Math.round(Math.min(99, Math.max(20, raw)));
}

export interface CircadianPoint {
  hour: number;
  label: string;
  energy: number;
  phase: 'peak' | 'dip' | 'winddown' | 'baseline';
}

export function computeCircadianCurve(vital: VitalPulseState): {
  points: CircadianPoint[];
  deepWorkPeakWindow: string;
  nsdrWindow: string;
  windDownCutoff: string;
} {
  const readiness = computeReadinessScore(vital);
  const scale = 0.72 + (readiness / 100) * 0.28;
  const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

  const baseProfile: Record<number, number> = {
    6: 46,
    7: 64,
    8: 80,
    9: 92,
    10: 96,
    11: 93,
    12: 81,
    13: 66,
    14: 58,
    15: 68,
    16: 82,
    17: 86,
    18: 77,
    19: 63,
    20: 48,
    21: 34,
    22: 22,
    23: 14,
  };

  const points: CircadianPoint[] = hours.map((hour) => {
    const energy = Math.round(Math.min(99, Math.max(10, (baseProfile[hour] ?? 50) * scale)));
    let phase: CircadianPoint['phase'] = 'baseline';
    if (hour >= 9 && hour <= 11) phase = 'peak';
    else if (hour >= 13 && hour <= 15) phase = 'dip';
    else if (hour >= 21) phase = 'winddown';
    return {
      hour,
      label: `${String(hour).padStart(2, '0')}:00`,
      energy,
      phase,
    };
  });

  return {
    points,
    deepWorkPeakWindow: '09:00 – 11:45',
    nsdrWindow: '13:30 – 14:15',
    windDownCutoff: '21:00',
  };
}

const ALL_MUSCLES: MuscleGroup[] = ['chest', 'back', 'shoulders', 'legs', 'core', 'arms'];

export function computeMuscleRecoveryMap(
  logs: WorkoutSessionLog[],
  nowIso: string = new Date().toISOString()
): Record<MuscleGroup, { recoveryPct: number; status: 'fresh' | 'recovering' | 'fatigued' }> {
  const nowMs = new Date(nowIso).getTime();
  const fatigue: Record<MuscleGroup, number> = {
    chest: 0,
    back: 0,
    shoulders: 0,
    legs: 0,
    core: 0,
    arms: 0,
  };

  for (const log of logs) {
    const logMs = new Date(log.dateIso).getTime();
    const hoursAgo = Math.max(0, (nowMs - logMs) / 3600000);
    if (hoursAgo > 72) continue;
    const decay = Math.max(0, 1 - hoursAgo / 72);
    const loadFactor = Math.min(1.25, Math.max(0.45, log.totalVolumeKg / 4500));
    for (const m of log.musclesWorked) {
      fatigue[m] = Math.min(82, fatigue[m] + Math.round(52 * decay * loadFactor));
    }
  }

  const result = {} as Record<
    MuscleGroup,
    { recoveryPct: number; status: 'fresh' | 'recovering' | 'fatigued' }
  >;

  for (const m of ALL_MUSCLES) {
    const recoveryPct = Math.max(18, Math.min(100, 100 - fatigue[m]));
    const status =
      recoveryPct >= 85 ? 'fresh' : recoveryPct >= 55 ? 'recovering' : 'fatigued';
    result[m] = { recoveryPct, status };
  }

  return result;
}

export function computeHydrationTarget(params: {
  workoutToday: boolean;
  bioStackCompletedCount: number;
}): {
  targetMl: number;
  targetSodiumMg: number;
  targetPotassiumMg: number;
} {
  const baseMl = 2700;
  const workoutBonusMl = params.workoutToday ? 650 : 0;
  const stackBonusMl = params.bioStackCompletedCount >= 3 ? 250 : 0;

  return {
    targetMl: baseMl + workoutBonusMl + stackBonusMl,
    targetSodiumMg: 3200 + (params.workoutToday ? 750 : 0),
    targetPotassiumMg: 4200 + (params.workoutToday ? 350 : 0),
  };
}

export function getBiomarkerStatus(b: Biomarker): 'optimal' | 'watch' | 'alert' {
  if (b.value < b.labMin || b.value > b.labMax) {
    return 'alert';
  }
  if (b.value >= b.optimalMin && b.value <= b.optimalMax) {
    return 'optimal';
  }
  return 'watch';
}

export function computeBiomarkerSummary(biomarkers: Biomarker[]): {
  total: number;
  optimal: number;
  watch: number;
  alert: number;
} {
  let optimal = 0;
  let watch = 0;
  let alert = 0;
  for (const b of biomarkers) {
    const s = getBiomarkerStatus(b);
    if (s === 'optimal') optimal++;
    else if (s === 'watch') watch++;
    else alert++;
  }
  return {
    total: biomarkers.length,
    optimal,
    watch,
    alert,
  };
}

export function computeRunwayMetrics(finance: LifeFinanceState): {
  monthlyIncomePln: number;
  monthlyExpensePln: number;
  freedomRatePct: number;
  runwayMonths: number;
  monthlySubsPln: number;
  yearlySavingsPotentialPln: number;
} {
  const txIncome = finance.transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amountPln, 0);
  const txExpense = finance.transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amountPln, 0);

  const monthlyIncomePln = finance.monthlyIncomePln + txIncome;
  const monthlyExpensePln = finance.monthlyFixedCostPln + txExpense;
  const surplus = monthlyIncomePln - monthlyExpensePln;
  const freedomRatePct =
    monthlyIncomePln > 0 ? Math.max(0, Math.round((surplus / monthlyIncomePln) * 100)) : 0;
  const runwayMonths =
    monthlyExpensePln > 0
      ? Number((finance.liquidReservePln / monthlyExpensePln).toFixed(1))
      : 0;

  const monthlySubsPln = finance.subscriptions.reduce((acc, s) => acc + s.monthlyPln, 0);
  const yearlySavingsPotentialPln =
    finance.subscriptions
      .filter((s) => s.flaggedForCut)
      .reduce((acc, s) => acc + s.monthlyPln, 0) * 12;

  return {
    monthlyIncomePln,
    monthlyExpensePln,
    freedomRatePct,
    runwayMonths,
    monthlySubsPln,
    yearlySavingsPotentialPln,
  };
}

export function computeWarmthStatus(contact: ContactPerson): {
  ratio: number;
  status: 'warm' | 'due' | 'overdue';
} {
  const ratio = contact.desiredCadenceDays > 0 ? contact.daysSinceContact / contact.desiredCadenceDays : 1;
  if (ratio >= 1.15) return { ratio, status: 'overdue' };
  if (ratio >= 0.8) return { ratio, status: 'due' };
  return { ratio, status: 'warm' };
}
