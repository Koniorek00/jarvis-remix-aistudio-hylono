import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeBiomarkerSummary,
  computeCircadianCurve,
  computeHydrationTarget,
  computeMuscleRecoveryMap,
  computeReadinessScore,
  computeRunwayMetrics,
  computeWarmthStatus,
} from './readinessEngine';
import { Biomarker, ContactPerson, LifeFinanceState, VitalPulseState, WorkoutSessionLog } from '../types/jarvis';

const sampleVital: VitalPulseState = {
  hrvMs: 74,
  rhrBpm: 51,
  sleepHours: 7.8,
  sleepQuality: 89,
  bodyTempDelta: 0.1,
  bioStackSteps: [],
  activeStepId: null,
  activeStepRemainingSec: 0,
  activeStepRunning: false,
  checkIns: [],
};

test('computeReadinessScore stays within 20-99 and reflects high recovery', () => {
  const high = computeReadinessScore(sampleVital);
  const low = computeReadinessScore({
    ...sampleVital,
    hrvMs: 36,
    rhrBpm: 68,
    sleepHours: 5.1,
    sleepQuality: 54,
    bodyTempDelta: 0.9,
  });
  assert.ok(high >= 82 && high <= 99, `Expected high score, got ${high}`);
  assert.ok(low < high - 20, `Expected low (${low}) significantly below high (${high})`);
});

test('computeCircadianCurve maps 18 hourly points with peak and winddown phases', () => {
  const curve = computeCircadianCurve(sampleVital);
  assert.equal(curve.points.length, 18);
  const peak = curve.points.find((p) => p.hour === 10);
  const winddown = curve.points.find((p) => p.hour === 22);
  assert.equal(peak?.phase, 'peak');
  assert.equal(winddown?.phase, 'winddown');
  assert.ok((peak?.energy ?? 0) > (winddown?.energy ?? 0));
});

test('computeMuscleRecoveryMap decreases recovery on recently trained muscles', () => {
  const now = '2026-11-22T12:00:00.000Z';
  const logs: WorkoutSessionLog[] = [
    {
      id: 'w1',
      dateIso: '2026-11-22T08:00:00.000Z',
      protocolTitle: 'Upper Strength',
      totalVolumeKg: 4800,
      zone2Minutes: 20,
      musclesWorked: ['chest', 'back'],
      prAchieved: true,
    },
  ];
  const map = computeMuscleRecoveryMap(logs, now);
  assert.ok(map.chest.recoveryPct < 70);
  assert.equal(map.legs.recoveryPct, 100);
  assert.equal(map.legs.status, 'fresh');
});

test('computeHydrationTarget scales upward when workout logged today', () => {
  const restDay = computeHydrationTarget({ workoutToday: false, bioStackCompletedCount: 1 });
  const trainDay = computeHydrationTarget({ workoutToday: true, bioStackCompletedCount: 4 });
  assert.ok(trainDay.targetMl > restDay.targetMl);
  assert.ok(trainDay.targetSodiumMg > restDay.targetSodiumMg);
});

test('computeBiomarkerSummary categorizes optimal vs watch vs alert', () => {
  const markers: Biomarker[] = [
    {
      id: '1',
      name: 'Vit D3',
      value: 58,
      unit: 'ng/mL',
      labMin: 30,
      labMax: 100,
      optimalMin: 50,
      optimalMax: 75,
      delta: 4,
      date: '2026-11-01',
      category: 'Hormony',
    },
    {
      id: '2',
      name: 'Ferrytyna',
      value: 38,
      unit: 'ng/mL',
      labMin: 30,
      labMax: 300,
      optimalMin: 70,
      optimalMax: 150,
      delta: -5,
      date: '2026-11-01',
      category: 'Krew',
    },
    {
      id: '3',
      name: 'hs-CRP',
      value: 4.1,
      unit: 'mg/L',
      labMin: 0,
      labMax: 3.0,
      optimalMin: 0,
      optimalMax: 0.8,
      delta: 1.5,
      date: '2026-11-01',
      category: 'Stan zapalny',
    },
  ];
  const summary = computeBiomarkerSummary(markers);
  assert.equal(summary.total, 3);
  assert.equal(summary.optimal, 1);
  assert.equal(summary.watch, 1);
  assert.equal(summary.alert, 1);
});

test('computeRunwayMetrics calculates runway and yearly savings potential', () => {
  const finance: LifeFinanceState = {
    liquidReservePln: 84000,
    monthlyIncomePln: 20000,
    monthlyFixedCostPln: 10000,
    transactions: [],
    restockItems: [],
    subscriptions: [
      { id: 's1', name: 'Tool A', monthlyPln: 100, category: 'AI', flaggedForCut: true },
      { id: 's2', name: 'Tool B', monthlyPln: 50, category: 'Cloud', flaggedForCut: false },
    ],
  };
  const metrics = computeRunwayMetrics(finance);
  assert.equal(metrics.runwayMonths, 8.4);
  assert.equal(metrics.freedomRatePct, 50);
  assert.equal(metrics.yearlySavingsPotentialPln, 1200);
});

test('computeWarmthStatus flags overdue contacts accurately', () => {
  const overdueContact: ContactPerson = {
    id: 'c1',
    name: 'Mama',
    rolePl: 'Rodzina',
    roleEn: 'Family',
    group: 'family',
    daysSinceContact: 5,
    desiredCadenceDays: 3,
    contextNotePl: '',
    contextNoteEn: '',
    upcomingEvent: '',
    lastGesture: '',
  };
  assert.equal(computeWarmthStatus(overdueContact).status, 'overdue');
});
