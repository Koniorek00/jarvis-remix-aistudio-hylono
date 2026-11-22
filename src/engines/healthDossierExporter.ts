import { JarvisState } from '../types/jarvis';
import {
  computeBiomarkerSummary,
  computeHydrationTarget,
  computeReadinessScore,
  getBiomarkerStatus,
} from './readinessEngine';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildHealthDossierMarkdown(state: JarvisState): string {
  const readiness = computeReadinessScore(state.vitalPulse);
  const summary = computeBiomarkerSummary(state.healthDossier.biomarkers);
  const todayIso = new Date().toISOString().slice(0, 10);
  const workoutToday = state.trainingLab.sessionLogs.some((l) => l.dateIso.startsWith(todayIso));
  const completedSteps = state.vitalPulse.bioStackSteps.filter((s) => s.completed).length;
  const hydrationTarget = computeHydrationTarget({
    workoutToday,
    bioStackCompletedCount: completedSteps,
  });

  const biomarkerRows = state.healthDossier.biomarkers
    .map((b) => {
      const status = getBiomarkerStatus(b);
      const flag = status === 'optimal' ? 'OPTYMALNY' : status === 'watch' ? 'OBSERWACJA' : 'POZA NORMĄ LAB';
      const deltaStr = b.delta >= 0 ? `+${b.delta}` : `${b.delta}`;
      return `| ${b.name} | ${b.value} ${b.unit} | ${b.labMin}–${b.labMax} | ${b.optimalMin}–${b.optimalMax} | ${deltaStr} | ${flag} | ${b.date} |`;
    })
    .join('\n');

  const suppRows = state.fuelNutrition.supplements
    .map((s) => `- [${s.takenToday ? 'x' : ' '}] **${s.name}** (${s.dosage}) — ${s.slot}`)
    .join('\n');

  const checkInRows = state.vitalPulse.checkIns
    .slice(0, 5)
    .map(
      (c) =>
        `- **${c.timestamp.slice(0, 16).replace('T', ' ')}** · Energia ${c.energy}/10 · Jasność ${c.clarity}/10 · Stres ${c.stress}/10 — ${c.note}`
    )
    .join('\n');

  const questions = state.healthDossier.doctorQuestions
    .map((q, idx) => `${idx + 1}. ${q}`)
    .join('\n');

  return `---
title: JARVIS PERSONAL OS — Executive Health Dossier
operator: ${state.healthDossier.operatorName}
date: ${todayIso}
readiness_score: ${readiness}
biomarkers_optimal: ${summary.optimal}/${summary.total}
---

# Executive Health Dossier — ${state.healthDossier.operatorName}

> Wygenerowano lokalnie przez **JARVIS PERSONAL OS** (${todayIso}). Dokument ma charakter wyłącznie edukacyjno-informacyjny i wspiera konsultację lekarską (nie stanowi diagnozy medycznej).

## 1. Profil Operatora & Telemetria Bazowa (7-dniowa)
- **Operator:** ${state.healthDossier.operatorName} (${state.healthDossier.operatorAge} lat, Grupa krwi: ${state.healthDossier.bloodType})
- **Readiness Score:** ${readiness}/100
- **HRV (śr.):** ${state.vitalPulse.hrvMs} ms | **RHR:** ${state.vitalPulse.rhrBpm} bpm
- **Sen:** ${state.vitalPulse.sleepHours} h (Jakość: ${state.vitalPulse.sleepQuality}%)
- **Dzienne nawodnienie:** ${state.fuelNutrition.waterMl} / ${hydrationTarget.targetMl} ml (Sód cel: ${hydrationTarget.targetSodiumMg} mg)

## 2. Panel Biomarkerów Długowieczności (${summary.optimal} Optymalnych / ${summary.watch} Do obserwacji / ${summary.alert} Poza normą)

| Biomarker | Wynik | Norma Lab | Strefa Optymalna | Delta | Status | Data |
|---|---:|---:|---:|---:|---|---|
${biomarkerRows}

## 3. Aktualny Stos Suplementacyjny
${suppRows}

## 4. Ostatnie Treningi & Obciążenie
${state.trainingLab.sessionLogs
  .slice(0, 4)
  .map(
    (l) =>
      `- **${l.dateIso.slice(0, 10)}** — ${l.protocolTitle}: ${l.totalVolumeKg} kg objętości, ${l.zone2Minutes} min Zone 2${l.prAchieved ? ' (Rekord PR)' : ''}`
  )
  .join('\n')}

## 5. Ostatnie Bio Check-Iny
${checkInRows}

## 6. Pytania na Konsultację Lekarską
${questions}
`;
}

export function buildHealthDossierHtml(state: JarvisState): string {
  const readiness = computeReadinessScore(state.vitalPulse);
  const summary = computeBiomarkerSummary(state.healthDossier.biomarkers);
  const todayIso = new Date().toISOString().slice(0, 10);

  const rowsHtml = state.healthDossier.biomarkers
    .map((b) => {
      const status = getBiomarkerStatus(b);
      const badgeColor =
        status === 'optimal' ? '#047857' : status === 'watch' ? '#B45309' : '#B91C1C';
      const label =
        status === 'optimal' ? 'Optymalny' : status === 'watch' ? 'Obserwacja' : 'Poza normą';
      const deltaStr = b.delta >= 0 ? `+${b.delta}` : `${b.delta}`;
      return `
        <tr>
          <td><strong>${escapeHtml(b.name)}</strong><br><span class="muted">${escapeHtml(b.category)}</span></td>
          <td class="num"><strong>${b.value}</strong> ${escapeHtml(b.unit)}</td>
          <td class="num">${b.labMin} – ${b.labMax}</td>
          <td class="num">${b.optimalMin} – ${b.optimalMax}</td>
          <td class="num">${deltaStr}</td>
          <td style="color:${badgeColor};font-weight:600">${label}</td>
          <td class="num">${escapeHtml(b.date)}</td>
        </tr>`;
    })
    .join('');

  return `<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <title>JARVIS Health Dossier — ${escapeHtml(state.healthDossier.operatorName)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111827; margin: 36px; line-height: 1.5; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    h2 { font-size: 15px; margin: 24px 0 10px; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em; color: #374151; }
    .meta { color: #6B7280; font-size: 12px; margin-bottom: 18px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
    .kpi { border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px 12px; }
    .kpi .label { font-size: 11px; color: #6B7280; text-transform: uppercase; }
    .kpi .val { font-size: 18px; font-weight: 700; font-variant-numeric: tabular-nums; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border-bottom: 1px solid #E5E7EB; padding: 8px 6px; text-align: left; }
    th { font-size: 11px; color: #4B5563; text-transform: uppercase; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .muted { color: #6B7280; font-size: 11px; }
    .disclaimer { margin-top: 20px; padding: 10px 12px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 11px; color: #4B5563; }
    @media print { body { margin: 18px; } }
  </style>
</head>
<body>
  <h1>Executive Health Dossier — ${escapeHtml(state.healthDossier.operatorName)}</h1>
  <div class="meta">JARVIS PERSONAL OS · Data wygenerowania: ${todayIso} · Wiek: ${state.healthDossier.operatorAge} · Grupa krwi: ${escapeHtml(state.healthDossier.bloodType)}</div>

  <div class="grid">
    <div class="kpi"><div class="label">Readiness</div><div class="val">${readiness}/100</div></div>
    <div class="kpi"><div class="label">HRV / RHR</div><div class="val">${state.vitalPulse.hrvMs} ms / ${state.vitalPulse.rhrBpm} bpm</div></div>
    <div class="kpi"><div class="label">Sen (7d śr.)</div><div class="val">${state.vitalPulse.sleepHours}h (${state.vitalPulse.sleepQuality}%)</div></div>
    <div class="kpi"><div class="label">Biomarkery</div><div class="val">${summary.optimal}/${summary.total} Optymalne</div></div>
  </div>

  <h2>Biomarkery Długowieczności (Norma Lab vs. Strefa Optymalna)</h2>
  <table>
    <thead>
      <tr>
        <th>Biomarker</th>
        <th class="num">Wynik</th>
        <th class="num">Norma Lab</th>
        <th class="num">Strefa Optymalna</th>
        <th class="num">Delta</th>
        <th>Status</th>
        <th class="num">Data</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>

  <h2>Aktualny Stos Suplementacyjny</h2>
  <ul>
    ${state.fuelNutrition.supplements
      .map((s) => `<li><strong>${escapeHtml(s.name)}</strong> — ${escapeHtml(s.dosage)} (${escapeHtml(s.slot)})</li>`)
      .join('')}
  </ul>

  <h2>Pytania Przygotowane do Konsultacji Lekarskiej</h2>
  <ol>
    ${state.healthDossier.doctorQuestions.map((q) => `<li>${escapeHtml(q)}</li>`).join('')}
  </ol>

  <div class="disclaimer">
    Dokument wygenerowany lokalnie w przeglądarce przez JARVIS PERSONAL OS. Zawarte zakresy optymalne mają charakter wyłącznie edukacyjny i służą do przygotowania rozmowy z lekarzem prowadzącym — nie stanowią porady ani diagnozy medycznej.
  </div>
</body>
</html>`;
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function printHealthReportViaIframe(state: JarvisState): void {
  const html = buildHealthDossierHtml(state);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        // Fallback download if browser blocks iframe print
        downloadTextFile(
          `jarvis-health-dossier-${new Date().toISOString().slice(0, 10)}.html`,
          html,
          'text/html;charset=utf-8'
        );
      }
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 120);
  }
}
