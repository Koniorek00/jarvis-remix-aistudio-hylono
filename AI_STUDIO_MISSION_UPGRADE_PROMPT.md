# PROMPT DLA AGENTA GOOGLE AI STUDIO (GEMINI 4 NEON)
**Repozytorium:** `Koniorek00/jarvis-remix-aistudio-hylono`  
**Cel:** Integracja Uniwersalnego Skarbca Dokumentów (`DocumentVaultView`) oraz Paska Wielu Podmiotów (`Multi-Tenant Switcher`)

---

## WKLEJ PONIŻSZY PROMPT W CZACIE GOOGLE AI STUDIO:

```xml
<role>
You are a Principal Frontend Systems Architect and Luxury UI Engineer upgrading the JARVIS-NEXUS desktop application inside Google AI Studio (React 19 + TypeScript + Tailwind CSS).
Your responsibility is to integrate the newly added Universal Document Vault and Multi-Tenant Switcher, unifying personal life intelligence with enterprise business operations (Hylono Hyperbarics, AI Commerce, and JARVIS Core).
</role>

<context>
The repository already contains the base 12 personal life modules (Command Deck, Vital Pulse, Training Lab, Fuel & Nutrition, Health Dossier, Day Rhythm, Inner Circle, Life Finance, Hardware Nodes, AI Swarm, Forge Mind, Sanctuary Audio).

We have just deposited 3 new core files into your project:
1. `src/types/documents.ts` — Type definitions for 5 tenant partitions (Personal Sovereign, JARVIS AI Core, Hylono Hyperbarics, AI Commerce Ventures, Client Ventures) and 6 document categories (personal-id, health-intake, b2b-contracts, tax-finance, technical-sep, system-dossier).
2. `src/engines/universalVaultEngine.ts` — Pre-loaded realistic seed vault containing biometric passports, OxyHelp B2B distribution contracts, InPost Paczkomat BLE agreements, KSeF FA(2) e-invoices, Kilowat SEP electrical inspection protocols, and SHA-256 seal proofs.
3. `src/views/DocumentVaultView.tsx` — Complete luxury Bento Grid UI with live document preview modal, SHA-256 hash copying, 1-tap PDF printing, and dynamic tenant filtering.
4. `JARVIS_NEXUS_UNIFIED_MASTER_COCKPIT_REPORT.md` — The complete architectural master specification.
</context>

<task>
Perform the following upgrades to complete the JARVIS-NEXUS convergence:

1. Update `src/types/jarvis.ts`:
   - Extend `ModuleId` with `'documents-vault'`:
     ```typescript
     export type ModuleId =
       | 'command-deck'
       | 'documents-vault'
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
     ```
   - In `JarvisState`, add `activeTenant: 'personal' | 'jarvis' | 'hylono' | 'commerce' | 'ventures'`.

2. Wire `DocumentVaultView` into `src/App.tsx`:
   - Add lazy import:
     ```typescript
     const DocumentVaultView = lazy(() => import('./views/DocumentVaultView'));
     ```
   - Add to `VIEW_MAP`:
     ```typescript
     'documents-vault': DocumentVaultView,
     ```

3. Update `src/components/shell/Sidebar.tsx`:
   - Import `FileText` from `lucide-react`.
   - Map `'documents-vault': FileText` in `MODULE_ICONS`.
   - Add `'documents-vault'` to navigation items right after `'command-deck'` so the operator has 1-click access to the Universal Document Vault.

4. Add Tenant Switcher to `src/components/shell/TopBar.tsx`:
   - Render a refined, liquid-glass tenant selector showing the active partition badge (e.g., `S1 BIO`, `NEXUS B2B`, `KSeF / G2G`, `S3 DORA`).
   - When clicked, allow fast switching between `Personal Sovereign`, `Hylono Hyperbarics`, `AI Commerce`, and `JARVIS Core`.

5. Sandboxed Iframe Safety (Adversarial Hardening):
   - In `src/store/jarvisStore.tsx`, ensure all `localStorage` access is wrapped in a `try/catch` block with an in-memory fallback to prevent `SecurityError / DOMException` crashes inside Google AI Studio's sandboxed preview frame.

Ensure the build compiles cleanly with zero TypeScript errors and all buttons are interactive!
</task>
```
