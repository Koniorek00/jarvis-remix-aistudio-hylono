import React, { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { audioDspEngine } from '../engines/audioDspEngine';
import {
  AudioOutputMode,
  AudioPresetId,
  BioCheckIn,
  Biomarker,
  CashflowEntry,
  CircleGroup,
  DeckViewMode,
  JarvisState,
  Language,
  MasteryGrade,
  MealEntry,
  ModuleId,
  OsMode,
  PriorityTask,
  TaskTier,
  ThemeMode,
  ToastItem,
  VesselType,
  WorkoutSessionLog,
} from '../types/jarvis';
import { createSeedState } from './seedData';

const STORAGE_KEY = 'jarvis_personal_os_v1';

type JarvisAction =
  | { type: 'SET_MODULE'; moduleId: ModuleId }
  | { type: 'SET_OS_MODE'; mode: OsMode }
  | { type: 'TOGGLE_LANGUAGE' }
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_THEME'; theme: ThemeMode }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_DECK_VIEW_MODE'; mode: DeckViewMode }
  | { type: 'TOGGLE_PIN_MODULE'; moduleId: ModuleId }
  | { type: 'MOVE_PINNED_MODULE'; moduleId: ModuleId; direction: 'left' | 'right' }
  | { type: 'RESET_LAYOUT' }
  | { type: 'TOGGLE_BIO_STEP'; stepId: string }
  | { type: 'START_BIO_STEP'; stepId?: string }
  | { type: 'PAUSE_BIO_STEP' }
  | { type: 'ADD_CHECKIN'; checkIn: Omit<BioCheckIn, 'id' | 'timestamp'> }
  | { type: 'UPDATE_VITAL_INPUTS'; hrvMs?: number; rhrBpm?: number; sleepHours?: number }
  | { type: 'SET_ACTIVE_PROTOCOL'; protocolId: string }
  | { type: 'TOGGLE_EXERCISE_SET'; protocolId: string; exerciseId: string; setId: string }
  | { type: 'UPDATE_EXERCISE_SET'; protocolId: string; exerciseId: string; setId: string; weightKg: number; reps: number; rpe: number }
  | { type: 'ADD_EXERCISE'; protocolId: string; name: string; muscleGroup: 'chest' | 'back' | 'shoulders' | 'legs' | 'core' | 'arms' }
  | { type: 'ADD_SET'; protocolId: string; exerciseId: string }
  | { type: 'SET_REST_DEFAULT'; sec: 60 | 90 | 120 }
  | { type: 'TOGGLE_REST_TIMER' }
  | { type: 'COMPLETE_WORKOUT_SESSION' }
  | { type: 'ADD_WATER'; ml: number }
  | { type: 'ADD_ELECTROLYTES' }
  | { type: 'ADD_MEAL'; meal: Omit<MealEntry, 'id' | 'time'> }
  | { type: 'TOGGLE_SUPPLEMENT'; suppId: string }
  | { type: 'TOGGLE_FASTING' }
  | { type: 'ADD_BIOMARKER'; biomarker: Omit<Biomarker, 'id'> }
  | { type: 'UPDATE_BIOMARKER_VALUE'; id: string; value: number }
  | { type: 'ADD_DOCTOR_QUESTION'; question: string }
  | { type: 'REMOVE_DOCTOR_QUESTION'; index: number }
  | { type: 'SELECT_ULTRADIAN_BLOCK'; blockId: string }
  | { type: 'TOGGLE_ULTRADIAN_TIMER' }
  | { type: 'RESET_ULTRADIAN_TIMER' }
  | { type: 'COMPLETE_ULTRADIAN_BLOCK'; blockId: string }
  | { type: 'ADD_TASK'; title: string; tier: TaskTier }
  | { type: 'TOGGLE_TASK'; taskId: string }
  | { type: 'DELETE_TASK'; taskId: string }
  | { type: 'LOG_CONTACT_INTERACTION'; contactId: string; gesture?: string }
  | { type: 'ADD_CONTACT'; name: string; rolePl: string; roleEn: string; group: CircleGroup; desiredCadenceDays: number; contextNotePl: string }
  | { type: 'ADD_TRANSACTION'; tx: Omit<CashflowEntry, 'id' | 'date'> }
  | { type: 'RESTOCK_ITEM'; itemId: string }
  | { type: 'TOGGLE_SUBSCRIPTION_CUT'; subId: string }
  | { type: 'PING_NODES' }
  | { type: 'LOG_BIO_GEAR_SESSION'; gearId: string }
  | { type: 'APPROVE_PROPOSAL'; proposalId: string }
  | { type: 'REJECT_PROPOSAL'; proposalId: string }
  | { type: 'SET_DAILY_BUDGET_CAP'; capUsd: number }
  | { type: 'DISPATCH_MISSION'; title: string; agent: string; estimatedUsd: number }
  | { type: 'SELECT_ATOM'; atomId: string }
  | { type: 'SET_ACTIVE_VESSEL'; vessel: VesselType }
  | { type: 'GRADE_ATOM'; atomId: string; grade: MasteryGrade }
  | { type: 'SET_AUDIO_PRESET'; preset: AudioPresetId; autoPlay?: boolean }
  | { type: 'SET_AUDIO_OUTPUT_MODE'; mode: AudioOutputMode }
  | { type: 'TOGGLE_AUDIO_PLAY' }
  | { type: 'SET_AUDIO_VOLUME'; volume: number }
  | { type: 'SET_AUDIO_DURATION'; durationMin: 5 | 15 | 25 }
  | { type: 'TOGGLE_BREATHING' }
  | { type: 'ADD_SOUL_DUMP'; promptText: string; generatedScript: string }
  | { type: 'TICK_ONE_SECOND' }
  | { type: 'RESTORE_STATE'; state: JarvisState };

function jarvisReducer(state: JarvisState, action: JarvisAction): JarvisState {
  switch (action.type) {
    case 'SET_MODULE':
      return { ...state, activeModule: action.moduleId };

    case 'SET_OS_MODE':
      return { ...state, osMode: action.mode };

    case 'TOGGLE_LANGUAGE':
      return { ...state, language: state.language === 'pl' ? 'en' : 'pl' };

    case 'SET_LANGUAGE':
      return { ...state, language: action.language };

    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'day' ? 'oled' : 'day' };

    case 'SET_THEME':
      return { ...state, theme: action.theme };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    case 'SET_DECK_VIEW_MODE':
      return { ...state, deckViewMode: action.mode };

    case 'TOGGLE_PIN_MODULE': {
      if (action.moduleId === 'command-deck') return state;
      const exists = state.pinnedModules.includes(action.moduleId);
      const pinnedModules = exists
        ? state.pinnedModules.filter((id) => id !== action.moduleId)
        : [...state.pinnedModules, action.moduleId];
      return { ...state, pinnedModules };
    }

    case 'MOVE_PINNED_MODULE': {
      const idx = state.pinnedModules.indexOf(action.moduleId);
      if (idx === -1) return state;
      const targetIdx = action.direction === 'left' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= state.pinnedModules.length) return state;
      const next = [...state.pinnedModules];
      const [item] = next.splice(idx, 1);
      next.splice(targetIdx, 0, item);
      return { ...state, pinnedModules: next };
    }

    case 'RESET_LAYOUT':
      return {
        ...state,
        deckViewMode: 'bento',
        pinnedModules: ['vital-pulse', 'training-lab', 'fuel-nutrition', 'health-dossier'],
      };

    case 'TOGGLE_BIO_STEP': {
      const steps = state.vitalPulse.bioStackSteps.map((s) =>
        s.id === action.stepId ? { ...s, completed: !s.completed } : s
      );
      return {
        ...state,
        vitalPulse: { ...state.vitalPulse, bioStackSteps: steps },
      };
    }

    case 'START_BIO_STEP': {
      const targetStep =
        state.vitalPulse.bioStackSteps.find((s) => s.id === action.stepId) ??
        state.vitalPulse.bioStackSteps.find((s) => !s.completed) ??
        state.vitalPulse.bioStackSteps[0];
      if (!targetStep) return state;
      const isSame = state.vitalPulse.activeStepId === targetStep.id;
      return {
        ...state,
        vitalPulse: {
          ...state.vitalPulse,
          activeStepId: targetStep.id,
          activeStepRemainingSec: isSame && state.vitalPulse.activeStepRemainingSec > 0
            ? state.vitalPulse.activeStepRemainingSec
            : targetStep.durationMin * 60,
          activeStepRunning: true,
        },
      };
    }

    case 'PAUSE_BIO_STEP':
      return {
        ...state,
        vitalPulse: { ...state.vitalPulse, activeStepRunning: false },
      };

    case 'ADD_CHECKIN': {
      const newEntry: BioCheckIn = {
        ...action.checkIn,
        id: `chk-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        vitalPulse: {
          ...state.vitalPulse,
          checkIns: [newEntry, ...state.vitalPulse.checkIns],
        },
      };
    }

    case 'UPDATE_VITAL_INPUTS':
      return {
        ...state,
        vitalPulse: {
          ...state.vitalPulse,
          hrvMs: action.hrvMs ?? state.vitalPulse.hrvMs,
          rhrBpm: action.rhrBpm ?? state.vitalPulse.rhrBpm,
          sleepHours: action.sleepHours ?? state.vitalPulse.sleepHours,
        },
      };

    case 'SET_ACTIVE_PROTOCOL':
      return {
        ...state,
        trainingLab: { ...state.trainingLab, activeProtocolId: action.protocolId },
      };

    case 'TOGGLE_EXERCISE_SET': {
      let justCompleted = false;
      const protocols = state.trainingLab.protocols.map((p) => {
        if (p.id !== action.protocolId) return p;
        return {
          ...p,
          exercises: p.exercises.map((ex) => {
            if (ex.id !== action.exerciseId) return ex;
            return {
              ...ex,
              sets: ex.sets.map((s) => {
                if (s.id !== action.setId) return s;
                justCompleted = !s.completed;
                return { ...s, completed: !s.completed };
              }),
            };
          }),
        };
      });

      return {
        ...state,
        trainingLab: {
          ...state.trainingLab,
          protocols,
          restTimerSec: justCompleted ? state.trainingLab.restDefaultSec : state.trainingLab.restTimerSec,
          restTimerRunning: justCompleted ? true : state.trainingLab.restTimerRunning,
        },
      };
    }

    case 'UPDATE_EXERCISE_SET': {
      const protocols = state.trainingLab.protocols.map((p) => {
        if (p.id !== action.protocolId) return p;
        return {
          ...p,
          exercises: p.exercises.map((ex) => {
            if (ex.id !== action.exerciseId) return ex;
            return {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === action.setId
                  ? { ...s, weightKg: action.weightKg, reps: action.reps, rpe: action.rpe }
                  : s
              ),
            };
          }),
        };
      });
      return {
        ...state,
        trainingLab: { ...state.trainingLab, protocols },
      };
    }

    case 'ADD_EXERCISE': {
      const protocols = state.trainingLab.protocols.map((p) => {
        if (p.id !== action.protocolId) return p;
        return {
          ...p,
          exercises: [
            ...p.exercises,
            {
              id: `ex-${Date.now()}`,
              name: action.name,
              muscleGroup: action.muscleGroup,
              bestVolumeKg: 400,
              sets: [{ id: `set-${Date.now()}`, weightKg: 20, reps: 10, rpe: 8, completed: false }],
            },
          ],
        };
      });
      return { ...state, trainingLab: { ...state.trainingLab, protocols } };
    }

    case 'ADD_SET': {
      const protocols = state.trainingLab.protocols.map((p) => {
        if (p.id !== action.protocolId) return p;
        return {
          ...p,
          exercises: p.exercises.map((ex) => {
            if (ex.id !== action.exerciseId) return ex;
            const last = ex.sets[ex.sets.length - 1] ?? { weightKg: 20, reps: 10, rpe: 8 };
            return {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: `set-${Date.now()}`,
                  weightKg: last.weightKg,
                  reps: last.reps,
                  rpe: last.rpe,
                  completed: false,
                },
              ],
            };
          }),
        };
      });
      return { ...state, trainingLab: { ...state.trainingLab, protocols } };
    }

    case 'SET_REST_DEFAULT':
      return {
        ...state,
        trainingLab: {
          ...state.trainingLab,
          restDefaultSec: action.sec,
          restTimerSec: action.sec,
        },
      };

    case 'TOGGLE_REST_TIMER':
      return {
        ...state,
        trainingLab: {
          ...state.trainingLab,
          restTimerRunning: !state.trainingLab.restTimerRunning,
        },
      };

    case 'COMPLETE_WORKOUT_SESSION': {
      const proto = state.trainingLab.protocols.find(
        (p) => p.id === state.trainingLab.activeProtocolId
      );
      if (!proto) return state;

      let totalVolumeKg = 0;
      let prAchieved = false;
      const musclesSet = new Set(proto.exercises.map((e) => e.muscleGroup));

      const updatedProtocols = state.trainingLab.protocols.map((p) => {
        if (p.id !== proto.id) return p;
        return {
          ...p,
          exercises: p.exercises.map((ex) => {
            const exVol = ex.sets.reduce((acc, s) => acc + s.weightKg * s.reps, 0);
            totalVolumeKg += exVol;
            if (exVol > ex.bestVolumeKg) prAchieved = true;
            return {
              ...ex,
              bestVolumeKg: Math.max(ex.bestVolumeKg, exVol),
            };
          }),
        };
      });

      const newLog: WorkoutSessionLog = {
        id: `log-${Date.now()}`,
        dateIso: new Date().toISOString(),
        protocolTitle: state.language === 'pl' ? proto.titlePl : proto.titleEn,
        totalVolumeKg: Math.max(450, totalVolumeKg),
        zone2Minutes: proto.id === 'proto-zone2' ? proto.durationMin : 15,
        musclesWorked: Array.from(musclesSet),
        prAchieved,
      };

      const nextTonnage = [...state.trainingLab.weeklyTonnageKg.slice(1), newLog.totalVolumeKg];
      const nextZone2 = [...state.trainingLab.weeklyZone2Minutes.slice(1), newLog.zone2Minutes];

      return {
        ...state,
        trainingLab: {
          ...state.trainingLab,
          protocols: updatedProtocols,
          sessionLogs: [newLog, ...state.trainingLab.sessionLogs],
          weeklyTonnageKg: nextTonnage,
          weeklyZone2Minutes: nextZone2,
          restTimerRunning: false,
        },
      };
    }

    case 'ADD_WATER':
      return {
        ...state,
        fuelNutrition: {
          ...state.fuelNutrition,
          waterMl: state.fuelNutrition.waterMl + action.ml,
        },
      };

    case 'ADD_ELECTROLYTES':
      return {
        ...state,
        fuelNutrition: {
          ...state.fuelNutrition,
          electrolytesCount: state.fuelNutrition.electrolytesCount + 1,
          sodiumMg: state.fuelNutrition.sodiumMg + 1000,
          potassiumMg: state.fuelNutrition.potassiumMg + 200,
          waterMl: state.fuelNutrition.waterMl + 350,
        },
      };

    case 'ADD_MEAL': {
      const timeStr = new Date().toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const entry: MealEntry = {
        ...action.meal,
        id: `meal-${Date.now()}`,
        time: timeStr,
      };
      return {
        ...state,
        fuelNutrition: {
          ...state.fuelNutrition,
          meals: [entry, ...state.fuelNutrition.meals],
        },
      };
    }

    case 'TOGGLE_SUPPLEMENT': {
      const supplements = state.fuelNutrition.supplements.map((s) =>
        s.id === action.suppId ? { ...s, takenToday: !s.takenToday } : s
      );
      return {
        ...state,
        fuelNutrition: { ...state.fuelNutrition, supplements },
      };
    }

    case 'TOGGLE_FASTING':
      return {
        ...state,
        fuelNutrition: {
          ...state.fuelNutrition,
          fastingActive: !state.fuelNutrition.fastingActive,
          fastingElapsedHours: !state.fuelNutrition.fastingActive
            ? 0.5
            : state.fuelNutrition.fastingElapsedHours,
        },
      };

    case 'ADD_BIOMARKER': {
      const next: Biomarker = { ...action.biomarker, id: `bm-${Date.now()}` };
      return {
        ...state,
        healthDossier: {
          ...state.healthDossier,
          biomarkers: [next, ...state.healthDossier.biomarkers],
        },
      };
    }

    case 'UPDATE_BIOMARKER_VALUE': {
      const todayIso = new Date().toISOString().slice(0, 10);
      const biomarkers = state.healthDossier.biomarkers.map((b) =>
        b.id === action.id
          ? {
              ...b,
              delta: Number((action.value - b.value).toFixed(2)),
              value: action.value,
              date: todayIso,
            }
          : b
      );
      return {
        ...state,
        healthDossier: { ...state.healthDossier, biomarkers },
      };
    }

    case 'ADD_DOCTOR_QUESTION':
      return {
        ...state,
        healthDossier: {
          ...state.healthDossier,
          doctorQuestions: [...state.healthDossier.doctorQuestions, action.question],
        },
      };

    case 'REMOVE_DOCTOR_QUESTION':
      return {
        ...state,
        healthDossier: {
          ...state.healthDossier,
          doctorQuestions: state.healthDossier.doctorQuestions.filter((_, i) => i !== action.index),
        },
      };

    case 'SELECT_ULTRADIAN_BLOCK': {
      const blk = state.dayRhythm.blocks.find((b) => b.id === action.blockId);
      if (!blk) return state;
      return {
        ...state,
        dayRhythm: {
          ...state.dayRhythm,
          activeBlockId: blk.id,
          remainingSec: blk.durationMin * 60,
          timerRunning: false,
        },
      };
    }

    case 'TOGGLE_ULTRADIAN_TIMER':
      return {
        ...state,
        dayRhythm: {
          ...state.dayRhythm,
          timerRunning: !state.dayRhythm.timerRunning,
        },
      };

    case 'RESET_ULTRADIAN_TIMER': {
      const blk = state.dayRhythm.blocks.find((b) => b.id === state.dayRhythm.activeBlockId);
      return {
        ...state,
        dayRhythm: {
          ...state.dayRhythm,
          remainingSec: (blk?.durationMin ?? 90) * 60,
          timerRunning: false,
        },
      };
    }

    case 'COMPLETE_ULTRADIAN_BLOCK': {
      const blocks = state.dayRhythm.blocks.map((b) =>
        b.id === action.blockId ? { ...b, completed: !b.completed } : b
      );
      return {
        ...state,
        dayRhythm: { ...state.dayRhythm, blocks },
      };
    }

    case 'ADD_TASK': {
      const newTask: PriorityTask = {
        id: `task-${Date.now()}`,
        title: action.title,
        tier: action.tier,
        done: false,
      };
      return {
        ...state,
        dayRhythm: {
          ...state.dayRhythm,
          tasks: [newTask, ...state.dayRhythm.tasks],
        },
      };
    }

    case 'TOGGLE_TASK':
      return {
        ...state,
        dayRhythm: {
          ...state.dayRhythm,
          tasks: state.dayRhythm.tasks.map((t) =>
            t.id === action.taskId ? { ...t, done: !t.done } : t
          ),
        },
      };

    case 'DELETE_TASK':
      return {
        ...state,
        dayRhythm: {
          ...state.dayRhythm,
          tasks: state.dayRhythm.tasks.filter((t) => t.id !== action.taskId),
        },
      };

    case 'LOG_CONTACT_INTERACTION':
      return {
        ...state,
        innerCircle: {
          contacts: state.innerCircle.contacts.map((c) =>
            c.id === action.contactId
              ? {
                  ...c,
                  daysSinceContact: 0,
                  lastGesture: action.gesture ?? 'Rozmowa / Spotkanie na żywo',
                }
              : c
          ),
        },
      };

    case 'ADD_CONTACT':
      return {
        ...state,
        innerCircle: {
          contacts: [
            {
              id: `p-${Date.now()}`,
              name: action.name,
              rolePl: action.rolePl,
              roleEn: action.roleEn,
              group: action.group,
              daysSinceContact: 0,
              desiredCadenceDays: action.desiredCadenceDays,
              contextNotePl: action.contextNotePl,
              contextNoteEn: action.contextNotePl,
              upcomingEvent: 'Nowy kontakt w kręgu',
              lastGesture: 'Dodano do kręgu',
            },
            ...state.innerCircle.contacts,
          ],
        },
      };

    case 'ADD_TRANSACTION': {
      const todayIso = new Date().toISOString().slice(0, 10);
      const entry: CashflowEntry = {
        ...action.tx,
        id: `tx-${Date.now()}`,
        date: todayIso,
      };
      return {
        ...state,
        lifeFinance: {
          ...state.lifeFinance,
          liquidReservePln:
            action.tx.type === 'income'
              ? state.lifeFinance.liquidReservePln + action.tx.amountPln
              : Math.max(0, state.lifeFinance.liquidReservePln - action.tx.amountPln),
          transactions: [entry, ...state.lifeFinance.transactions],
        },
      };
    }

    case 'RESTOCK_ITEM':
      return {
        ...state,
        lifeFinance: {
          ...state.lifeFinance,
          restockItems: state.lifeFinance.restockItems.map((item) =>
            item.id === action.itemId
              ? { ...item, stockPct: 100, status: 'ok', unitNote: 'Uzupełniono (100%)' }
              : item
          ),
        },
      };

    case 'TOGGLE_SUBSCRIPTION_CUT':
      return {
        ...state,
        lifeFinance: {
          ...state.lifeFinance,
          subscriptions: state.lifeFinance.subscriptions.map((s) =>
            s.id === action.subId ? { ...s, flaggedForCut: !s.flaggedForCut } : s
          ),
        },
      };

    case 'PING_NODES':
      return {
        ...state,
        hardwareNodes: {
          ...state.hardwareNodes,
          lastPingTimestamp: new Date().toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          nodes: state.hardwareNodes.nodes.map((n) => ({
            ...n,
            latencyMs: Math.max(3, Math.min(28, n.latencyMs + Math.round((Math.random() - 0.5) * 6))),
            cpuPct: Math.max(8, Math.min(72, n.cpuPct + Math.round((Math.random() - 0.5) * 8))),
          })),
        },
      };

    case 'LOG_BIO_GEAR_SESSION': {
      const todayIso = new Date().toISOString().slice(0, 10);
      return {
        ...state,
        hardwareNodes: {
          ...state.hardwareNodes,
          bioGear: state.hardwareNodes.bioGear.map((g) =>
            g.id === action.gearId
              ? { ...g, sessionsCount: g.sessionsCount + 1, lastUsedDate: todayIso }
              : g
          ),
        },
      };
    }

    case 'APPROVE_PROPOSAL': {
      const target = state.aiSwarm.proposals.find((p) => p.id === action.proposalId);
      if (!target || target.status !== 'pending') return state;
      if (state.aiSwarm.spentTodayUsd + target.estimatedUsd > state.aiSwarm.dailyBudgetCapUsd) {
        return state;
      }
      return {
        ...state,
        aiSwarm: {
          ...state.aiSwarm,
          spentTodayUsd: Number((state.aiSwarm.spentTodayUsd + target.estimatedUsd).toFixed(2)),
          proposals: state.aiSwarm.proposals.map((p) =>
            p.id === action.proposalId
              ? {
                  ...p,
                  status: 'running',
                  traces: [
                    ...p.traces.map((t) => ({ ...t, status: 'done' as const, durationMs: t.durationMs || 340 })),
                    {
                      id: `tr-${Date.now()}`,
                      label: 'Executing Sovereign Pipeline...',
                      status: 'running',
                      durationMs: 120,
                    },
                  ],
                }
              : p
          ),
        },
      };
    }

    case 'REJECT_PROPOSAL':
      return {
        ...state,
        aiSwarm: {
          ...state.aiSwarm,
          proposals: state.aiSwarm.proposals.map((p) =>
            p.id === action.proposalId ? { ...p, status: 'rejected' } : p
          ),
        },
      };

    case 'SET_DAILY_BUDGET_CAP':
      return {
        ...state,
        aiSwarm: { ...state.aiSwarm, dailyBudgetCapUsd: action.capUsd },
      };

    case 'DISPATCH_MISSION':
      return {
        ...state,
        aiSwarm: {
          ...state.aiSwarm,
          proposals: [
            {
              id: `ag-${Date.now()}`,
              title: action.title,
              agent: action.agent,
              estimatedUsd: action.estimatedUsd,
              status: 'pending',
              planSteps: [
                'Analiza kontekstu lokalnego i zapytań źródłowych',
                'Przetwarzanie potokiem Map-Reduce v3.3',
                'Kompilacja wyniku do atomu wiedzy .jkp',
              ],
              traces: [
                { id: `tr-${Date.now()}`, label: 'Await Human Budget Approval', status: 'queued', durationMs: 0 },
              ],
            },
            ...state.aiSwarm.proposals,
          ],
        },
      };

    case 'SELECT_ATOM':
      return {
        ...state,
        forgeMind: { ...state.forgeMind, selectedAtomId: action.atomId },
      };

    case 'SET_ACTIVE_VESSEL':
      return {
        ...state,
        forgeMind: { ...state.forgeMind, activeVessel: action.vessel },
      };

    case 'GRADE_ATOM': {
      const atoms = state.forgeMind.atoms.map((a) => {
        if (a.id !== action.atomId) return a;
        const nextStage =
          action.grade === 'solid'
            ? Math.min(6, a.stage + 1)
            : action.grade === 'partial'
            ? a.stage
            : Math.max(1, a.stage - 1);
        const nextReviewDays =
          action.grade === 'solid' ? nextStage * 3 : action.grade === 'partial' ? 2 : 1;
        return {
          ...a,
          stage: nextStage,
          dueForReview: action.grade === 'miss',
          nextReviewDays,
        };
      });
      return {
        ...state,
        forgeMind: { ...state.forgeMind, atoms },
      };
    }

    case 'SET_AUDIO_PRESET':
      return {
        ...state,
        sanctuaryAudio: {
          ...state.sanctuaryAudio,
          preset: action.preset,
          playing: action.autoPlay ?? state.sanctuaryAudio.playing,
          remainingSec: state.sanctuaryAudio.durationMin * 60,
        },
      };

    case 'SET_AUDIO_OUTPUT_MODE':
      return {
        ...state,
        sanctuaryAudio: { ...state.sanctuaryAudio, outputMode: action.mode },
      };

    case 'TOGGLE_AUDIO_PLAY':
      return {
        ...state,
        sanctuaryAudio: {
          ...state.sanctuaryAudio,
          playing: !state.sanctuaryAudio.playing,
        },
      };

    case 'SET_AUDIO_VOLUME':
      return {
        ...state,
        sanctuaryAudio: { ...state.sanctuaryAudio, volume: action.volume },
      };

    case 'SET_AUDIO_DURATION':
      return {
        ...state,
        sanctuaryAudio: {
          ...state.sanctuaryAudio,
          durationMin: action.durationMin,
          remainingSec: action.durationMin * 60,
        },
      };

    case 'TOGGLE_BREATHING':
      return {
        ...state,
        sanctuaryAudio: {
          ...state.sanctuaryAudio,
          breathingActive: !state.sanctuaryAudio.breathingActive,
        },
      };

    case 'ADD_SOUL_DUMP': {
      const entry = {
        id: `j-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
        promptText: action.promptText,
        generatedScript: action.generatedScript,
      };
      return {
        ...state,
        sanctuaryAudio: {
          ...state.sanctuaryAudio,
          journal: [entry, ...state.sanctuaryAudio.journal],
        },
      };
    }

    case 'TICK_ONE_SECOND': {
      let next = state;

      if (state.vitalPulse.activeStepRunning && state.vitalPulse.activeStepRemainingSec > 0) {
        const rem = state.vitalPulse.activeStepRemainingSec - 1;
        const steps =
          rem === 0 && state.vitalPulse.activeStepId
            ? state.vitalPulse.bioStackSteps.map((s) =>
                s.id === state.vitalPulse.activeStepId ? { ...s, completed: true } : s
              )
            : state.vitalPulse.bioStackSteps;
        next = {
          ...next,
          vitalPulse: {
            ...next.vitalPulse,
            bioStackSteps: steps,
            activeStepRemainingSec: rem,
            activeStepRunning: rem > 0,
          },
        };
      }

      if (state.trainingLab.restTimerRunning && state.trainingLab.restTimerSec > 0) {
        const rem = state.trainingLab.restTimerSec - 1;
        next = {
          ...next,
          trainingLab: {
            ...next.trainingLab,
            restTimerSec: rem,
            restTimerRunning: rem > 0,
          },
        };
      }

      if (state.dayRhythm.timerRunning && state.dayRhythm.remainingSec > 0) {
        const rem = state.dayRhythm.remainingSec - 1;
        next = {
          ...next,
          dayRhythm: {
            ...next.dayRhythm,
            remainingSec: rem,
            timerRunning: rem > 0,
          },
        };
      }

      if (state.sanctuaryAudio.playing && state.sanctuaryAudio.remainingSec > 0) {
        const rem = state.sanctuaryAudio.remainingSec - 1;
        next = {
          ...next,
          sanctuaryAudio: {
            ...next.sanctuaryAudio,
            remainingSec: rem,
            playing: rem > 0,
          },
        };
      }

      return next;
    }

    case 'RESTORE_STATE':
      return action.state;

    default:
      return state;
  }
}

function loadInitialState(): JarvisState {
  const seed = createSeedState();
  if (typeof window === 'undefined') return seed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Partial<JarvisState>;
    if (!parsed || typeof parsed !== 'object' || !parsed.vitalPulse || !parsed.healthDossier) {
      return seed;
    }
    return {
      ...seed,
      ...parsed,
      // Always boot audio paused so browsers don't block autoplay without gesture
      sanctuaryAudio: {
        ...seed.sanctuaryAudio,
        ...parsed.sanctuaryAudio,
        playing: false,
      },
    };
  } catch {
    return seed;
  }
}

interface JarvisContextValue {
  state: JarvisState;
  dispatch: React.Dispatch<JarvisAction>;
  toasts: ToastItem[];
  notify: (message: string, tone?: ToastItem['tone']) => void;
  dismissToast: (id: string) => void;
}

const JarvisContext = createContext<JarvisContextValue | null>(null);

export const JarvisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(jarvisReducer, undefined, loadInitialState);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const saveTimerRef = useRef<number | null>(null);

  const notify = useCallback((message: string, tone: ToastItem['tone'] = 'cyan') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync theme & language attributes on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'oled') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.lang = state.language;
  }, [state.theme, state.language]);

  // Debounced localStorage persistence (250ms)
  useEffect(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore storage quota errors
      }
    }, 250);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [state]);

  // Global 1-second timer tick (only active when at least one timer is running)
  const anyTimerRunning =
    state.vitalPulse.activeStepRunning ||
    state.trainingLab.restTimerRunning ||
    state.dayRhythm.timerRunning ||
    state.sanctuaryAudio.playing;

  useEffect(() => {
    if (!anyTimerRunning) return;
    const interval = window.setInterval(() => {
      dispatch({ type: 'TICK_ONE_SECOND' });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [anyTimerRunning]);

  // Synchronize Web Audio DSP engine with Sanctuary state
  useEffect(() => {
    if (state.sanctuaryAudio.playing) {
      audioDspEngine.start(
        state.sanctuaryAudio.preset,
        state.sanctuaryAudio.outputMode,
        state.sanctuaryAudio.volume
      );
    } else {
      audioDspEngine.stop();
    }
  }, [
    state.sanctuaryAudio.playing,
    state.sanctuaryAudio.preset,
    state.sanctuaryAudio.outputMode,
  ]);

  useEffect(() => {
    audioDspEngine.setVolume(state.sanctuaryAudio.volume);
  }, [state.sanctuaryAudio.volume]);

  return (
    <JarvisContext.Provider value={{ state, dispatch, toasts, notify, dismissToast }}>
      {children}
    </JarvisContext.Provider>
  );
};

export function useJarvis(): JarvisContextValue {
  const ctx = useContext(JarvisContext);
  if (!ctx) {
    throw new Error('useJarvis must be used inside JarvisProvider');
  }
  return ctx;
}
