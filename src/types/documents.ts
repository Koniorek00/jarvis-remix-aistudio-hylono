export type TenantId = 'personal' | 'jarvis' | 'hylono' | 'commerce' | 'ventures';

export interface TenantMeta {
  id: TenantId;
  labelPl: string;
  labelEn: string;
  badge: string;
  accentColor: string;
  descriptionPl: string;
  descriptionEn: string;
}

export const TENANT_REGISTRY: Record<TenantId, TenantMeta> = {
  personal: {
    id: 'personal',
    labelPl: 'Suwerenny & Zdrowie',
    labelEn: 'Personal Sovereign',
    badge: 'S1 BIO',
    accentColor: '#14F1D9',
    descriptionPl: 'Osobisty bio-stan, badania krwi, paszporty, treningi i prywatny skarbiec.',
    descriptionEn: 'Personal bio-state, bloodwork, passports, training and private vault.',
  },
  jarvis: {
    id: 'jarvis',
    labelPl: 'JARVIS Core AI',
    labelEn: 'JARVIS Core AI',
    badge: 'S3 DORA',
    accentColor: '#6366F1',
    descriptionPl: '24/7 Mini-PC, potok Dora-rs SHM, Kokoro TTS, roje agentów i routing modeli.',
    descriptionEn: '24/7 Mini-PC, Dora-rs SHM pipeline, Kokoro TTS, agent swarms, and model router.',
  },
  hylono: {
    id: 'hylono',
    labelPl: 'Hylono Hyperbarics',
    labelEn: 'Hylono Hyperbarics',
    badge: 'NEXUS B2B',
    accentColor: '#06B6D4',
    descriptionPl: 'Flota komór OxyHelp, formularze świadomej zgody pacjentów, serwis i zaopatrzenie.',
    descriptionEn: 'OxyHelp chamber fleet, patient informed consents, service ops, and supply shop.',
  },
  commerce: {
    id: 'commerce',
    labelPl: 'Przedsięwzięcia Cyfrowe',
    labelEn: 'AI Commerce Ventures',
    badge: 'KSeF / G2G',
    accentColor: '#10B981',
    descriptionPl: 'Sklepy cyfrowe G2G/GGsel, automatyzacje leadów, fakturowanie KSeF i podatki.',
    descriptionEn: 'G2G/GGsel marketplace automation, lead engines, KSeF e-invoices, and tax models.',
  },
  ventures: {
    id: 'ventures',
    labelPl: 'Klienci & Konsulting',
    labelEn: 'Client Ventures',
    badge: 'EXT',
    accentColor: '#F59E0B',
    descriptionPl: 'Dedykowane portale klientów, wdrożenia agencyjne i zewnętrzne umowy SLA.',
    descriptionEn: 'Dedicated client spaces, agency deployments, and external SLA contracts.',
  },
};

export type DocumentCategory =
  | 'personal-id'
  | 'health-intake'
  | 'b2b-contracts'
  | 'tax-finance'
  | 'technical-sep'
  | 'system-dossier';

export interface CategoryMeta {
  id: DocumentCategory;
  labelPl: string;
  labelEn: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
}

export const CATEGORY_REGISTRY: Record<DocumentCategory, CategoryMeta> = {
  'personal-id': {
    id: 'personal-id',
    labelPl: 'Tożsamość & Prawo Osobiste',
    labelEn: 'Identity & Legal ID',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    accentColor: '#10B981',
  },
  'health-intake': {
    id: 'health-intake',
    labelPl: 'Zgody & Dokumentacja Medyczna',
    labelEn: 'Consents & Clinical Records',
    badgeBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    badgeText: 'text-cyan-700 dark:text-cyan-400',
    accentColor: '#06B6D4',
  },
  'b2b-contracts': {
    id: 'b2b-contracts',
    labelPl: 'Kontrakty Handlowe & B2B',
    labelEn: 'B2B & Commercial Contracts',
    badgeBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    badgeText: 'text-indigo-700 dark:text-indigo-400',
    accentColor: '#6366F1',
  },
  'tax-finance': {
    id: 'tax-finance',
    labelPl: 'KSeF, Podatki & Finanse',
    labelEn: 'KSeF Invoicing & Tax',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-700 dark:text-amber-400',
    accentColor: '#F59E0B',
  },
  'technical-sep': {
    id: 'technical-sep',
    labelPl: 'Protokoły SEP & Odbiory Techniczne',
    labelEn: 'Technical SEP Inspections',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    badgeText: 'text-rose-700 dark:text-rose-400',
    accentColor: '#F43F5E',
  },
  'system-dossier': {
    id: 'system-dossier',
    labelPl: 'Dossier Systemowe & Architektura',
    labelEn: 'System Dossiers & Blueprints',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    badgeText: 'text-purple-700 dark:text-purple-400',
    accentColor: '#A855F7',
  },
};

export type EncryptionTier = 'PLAINTEXT_SESSION' | 'AES_256_GCM_ENCRYPTED' | 'ZERO_KNOWLEDGE_VAULT';

export interface UniversalDocument {
  id: string;
  tenantId: TenantId;
  title: string;
  category: DocumentCategory;
  fileName: string;
  fileSizeBytes: number;
  mimeType: 'application/pdf' | 'text/markdown' | 'application/json' | 'image/png';
  sha256Hash: string;
  encryptionTier: EncryptionTier;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  signers?: Array<{
    name: string;
    role: string;
    signedAt: string;
    verifiedSignature: boolean;
  }>;
  contentSummaryPl: string;
  contentSummaryEn: string;
  fullContentPreview: string;
}
