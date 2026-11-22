import { TenantId, DocumentCategory, UniversalDocument } from '../types/documents';

export const SEED_UNIVERSAL_DOCUMENTS: UniversalDocument[] = [
  {
    id: 'doc-001',
    tenantId: 'personal',
    title: 'Paszport Biometryczny RP — Wiktor Myszor',
    category: 'personal-id',
    fileName: 'PASSPORT_WM_BIOMETRIC_ENCRYPTED.pdf',
    fileSizeBytes: 2_450_000,
    mimeType: 'application/pdf',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    encryptionTier: 'ZERO_KNOWLEDGE_VAULT',
    tags: ['Tożsamość', 'Paszport', 'Biometria', 'AES-256'],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-11-20T14:30:00Z',
    signers: [
      {
        name: 'Wiktor Myszor',
        role: 'Obywatel / Posiadacz',
        signedAt: '2026-01-15T10:05:00Z',
        verifiedSignature: true,
      },
    ],
    contentSummaryPl: 'Dokument tożsamości z certyfikatem biometrycznym, zdeponowany w prywatnym sejfie sprzętowym.',
    contentSummaryEn: 'Biometric identity passport with hardware-backed zero-knowledge credential vault attestation.',
    fullContentPreview: `DOKUMENT TOŻSAMOŚCI I CERTYFIKAT BIOMETRYCZNY
Posiadacz: WIKTOR MYSZOR
Seria i Numer: [ZAMASKOWANO W WIDOKU PUBLICZNYM]
Obywatelstwo: POLSKIE
Organ wydający: WOJEWODA MAŁOPOLSKI
Szyfrowanie: AES-256-GCM Hardware Enclave`,
  },
  {
    id: 'doc-002',
    tenantId: 'hylono',
    title: 'Formularz Świadomej Zgody na Terapię Hiperbaryczną (HBOT 1.82 ATA)',
    category: 'health-intake',
    fileName: 'HYLONO_CONSENT_HBOT_182ATA_V4.pdf',
    fileSizeBytes: 640_000,
    mimeType: 'application/pdf',
    sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    encryptionTier: 'AES_256_GCM_ENCRYPTED',
    tags: ['Zgoda Medyczna', 'HBOT', 'OxyHelp', 'Wywiad Kliniczny'],
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-11-22T16:00:00Z',
    signers: [
      {
        name: 'dr n. med. E. Vasquez',
        role: 'Lekarz Konsultant',
        signedAt: '2026-02-01T09:30:00Z',
        verifiedSignature: true,
      },
      {
        name: 'Wiktor Myszor',
        role: 'Operator & Użytkownik',
        signedAt: '2026-02-01T09:40:00Z',
        verifiedSignature: true,
      },
    ],
    contentSummaryPl: 'Kompletny formularz wywiadu zdrowotnego i świadomej zgody na protokoły regeneracyjne 1.82 ATA.',
    contentSummaryEn: 'Clinical health intake and informed consent protocol for 1.82 ATA hyperbaric oxygen recovery sessions.',
    fullContentPreview: `HYLONO PROTOKÓŁ ZGODY INFORMOWANEJ
Procedura: Hiperbaryczna Terapia Tlenowa (HBOT)
Ciśnienie docelowe: 1.82 ATA | Czas sesji: 60 minut
Wykluczenie przeciwwskazań: Odma opłucnowa (NEG), Leki cytostatyczne (NEG)
Zatwierdzono do użytku w klinikach partnerskich Hylono.`,
  },
  {
    id: 'doc-003',
    tenantId: 'hylono',
    title: 'Umowa Dystrybucyjna i Serwisowa Komór OxyHelp C2-C5',
    category: 'b2b-contracts',
    fileName: 'OXYHELP_DISTRIBUTION_AGREEMENT_2026.pdf',
    fileSizeBytes: 3_820_000,
    mimeType: 'application/pdf',
    sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    encryptionTier: 'AES_256_GCM_ENCRYPTED',
    tags: ['Dystrybucja', 'OxyHelp', 'B2B', 'SLA Serwisowe'],
    createdAt: '2026-03-10T12:00:00Z',
    updatedAt: '2026-11-21T18:00:00Z',
    signers: [
      {
        name: 'OxyHelp International GmbH',
        role: 'Producent',
        signedAt: '2026-03-10T12:15:00Z',
        verifiedSignature: true,
      },
      {
        name: 'Wiktor Myszor (Hylono / HiperbaryczneKomory)',
        role: 'Wyłączny Dystrybutor PL',
        signedAt: '2026-03-10T12:30:00Z',
        verifiedSignature: true,
      },
    ],
    contentSummaryPl: 'Oficjalna umowa dystrybucyjna na komory łagodne i medyczne OxyHelp, procedury SLA i gwarancje.',
    contentSummaryEn: 'Master B2B distribution and warranty SLA agreement for OxyHelp C2-C5 chambers in Poland.',
    fullContentPreview: `UMOWA DYSTRYBUCYJNA I SERWISOWA
Strony: OxyHelp International GmbH oraz Hylono Polska
Zakres: Dostawy, serwis gwarancyjny (SLA 24h), części zamienne
Terytorium: Rzeczpospolita Polska i kraje CEE
Autoryzacja stacji serwisowej: Katowice / Kraków`,
  },
  {
    id: 'doc-004',
    tenantId: 'commerce',
    title: 'Raport Sprzedaży i E-Fakturowanie KSeF — Listopad 2026',
    category: 'tax-finance',
    fileName: 'KSEF_INVOICE_BATCH_2026_11.xml.pdf',
    fileSizeBytes: 890_000,
    mimeType: 'application/pdf',
    sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    encryptionTier: 'AES_256_GCM_ENCRYPTED',
    tags: ['KSeF', 'Faktury', 'VAT-7', 'E-commerce'],
    createdAt: '2026-11-20T08:00:00Z',
    updatedAt: '2026-11-22T12:00:00Z',
    signers: [
      {
        name: 'KSeF Bramka Ministerstwa Finansów',
        role: 'Urząd Skarbowy',
        signedAt: '2026-11-20T08:05:00Z',
        verifiedSignature: true,
      },
    ],
    contentSummaryPl: 'Zbiorczy wykaz e-faktur z rynków cyfrowych G2G/GGsel zintegrowany ze schematem KSeF FA(2).',
    contentSummaryEn: 'Consolidated Polish KSeF FA(2) e-invoicing batch and VAT-7 return report for digital commerce channels.',
    fullContentPreview: `KRAJOWY SYSTEM E-FAKTUR (KSeF)
Identyfikator sesji: 20261122-SO-889124-77
Liczba dokumentów w paczce: 142
Podatek należny VAT: Rozliczony (Status: ZAAKCEPTOWANO)
Certyfikat pieczęci ministerialnej: WAŻNY`,
  },
  {
    id: 'doc-005',
    tenantId: 'commerce',
    title: 'Protokół Pomiarów Elektrycznych SEP E+D — KiloKontrol',
    category: 'technical-sep',
    fileName: 'SEP_INSPECTION_PROTOCOL_2026.pdf',
    fileSizeBytes: 1_120_000,
    mimeType: 'application/pdf',
    sha256Hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    encryptionTier: 'PLAINTEXT_SESSION',
    tags: ['SEP', 'Pomiary', 'KiloKontrol', 'Inspekcja'],
    createdAt: '2026-10-18T14:00:00Z',
    updatedAt: '2026-11-15T11:00:00Z',
    signers: [
      {
        name: 'Uprawniony Inżynier SEP (E+D)',
        role: 'Rzeczoznawca',
        signedAt: '2026-10-18T14:30:00Z',
        verifiedSignature: true,
      },
    ],
    contentSummaryPl: 'Oficjalny protokół 5-letnich pomiarów rezystancji izolacji i wyłączników RCD wygenerowany z aplikacji Kilowat.',
    contentSummaryEn: 'Certified SEP electrical resistance and RCD trip inspection protocol generated via Kilowat OCR mobile app.',
    fullContentPreview: `PROTOKÓŁ Z BADAŃ I POMIARÓW INSTALACJI ELEKTRYCZNEJ
Podstawa prawna: Dz.U. 2026 r. poz. 1205 (Prawo Budowlane)
Zakres: Pętla zwarcia, rezystancja uziemienia, wyłączniki RCD
Ocena końcowa: INSTALACJA NADAJE SIĘ DO EKSPLOATACJI`,
  },
  {
    id: 'doc-006',
    tenantId: 'jarvis',
    title: 'JARVIS OS: Sovereign Cognitive Architecture Atlas v4.2',
    category: 'system-dossier',
    fileName: 'JARVIS_MASTER_SYSTEM_OMNIBUS_V42.md',
    fileSizeBytes: 5_200_000,
    mimeType: 'text/markdown',
    sha256Hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    encryptionTier: 'ZERO_KNOWLEDGE_VAULT',
    tags: ['Architektura', 'Dora-rs', 'Living Mesh', 'S1-S4'],
    createdAt: '2026-10-31T11:00:00Z',
    updatedAt: '2026-11-22T19:00:00Z',
    signers: [
      {
        name: 'Wiktor Myszor',
        role: 'Główny Architekt Systemu',
        signedAt: '2026-11-22T19:05:00Z',
        verifiedSignature: true,
      },
    ],
    contentSummaryPl: 'Kompletne kompendium architektoniczne JARVIS OS łączące 4 powierzchnie fizyczne, potoki Dora-rs i roje agentów.',
    contentSummaryEn: 'Master architectural omnibus for JARVIS OS combining 4 hardware surfaces, Dora-rs SHM, and autonomous swarms.',
    fullContentPreview: `JARVIS SOVEREIGN COGNITIVE OS
Architektura: S1 (Wearable Edge) + S2 (Mobile Precision) + S3 (Mini-PC 24/7) + S4 (Workstation HUD)
Szyna Zero-Copy SHM: Dora-rs (<10ms opóźnienia)
Model: Gemini 3.8 Flash High / Kokoro 82M TTS
Status: PRODUKCYJNY 24/7`,
  },
];

export function filterDocuments(
  docs: UniversalDocument[],
  tenantId: TenantId | 'all',
  category: DocumentCategory | 'all',
  searchQuery: string
): UniversalDocument[] {
  return docs.filter((doc) => {
    if (tenantId !== 'all' && doc.tenantId !== tenantId) return false;
    if (category !== 'all' && doc.category !== category) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchFileName = doc.fileName.toLowerCase().includes(q);
      const matchTags = doc.tags.some((t) => t.toLowerCase().includes(q));
      const matchSummary =
        doc.contentSummaryPl.toLowerCase().includes(q) || doc.contentSummaryEn.toLowerCase().includes(q);
      if (!matchTitle && !matchFileName && !matchTags && !matchSummary) return false;
    }
    return true;
  });
}
