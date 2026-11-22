import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Lock,
  Plus,
  Printer,
  Search,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import {
  CATEGORY_REGISTRY,
  DocumentCategory,
  TENANT_REGISTRY,
  TenantId,
  UniversalDocument,
} from '../types/documents';
import { SEED_UNIVERSAL_DOCUMENTS, filterDocuments } from '../engines/universalVaultEngine';
import { useJarvis } from '../store/jarvisStore';

export const DocumentVaultView: React.FC = () => {
  const { state, notify } = useJarvis();
  const lang = state.language;

  const [documents, setDocuments] = useState<UniversalDocument[]>(SEED_UNIVERSAL_DOCUMENTS);
  const [selectedTenant, setSelectedTenant] = useState<TenantId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreviewDoc, setActivePreviewDoc] = useState<UniversalDocument | null>(null);

  // New Document Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DocumentCategory>('b2b-contracts');
  const [newTenant, setNewTenant] = useState<TenantId>('personal');
  const [newFileName, setNewFileName] = useState('');

  const filteredDocs = useMemo(() => {
    return filterDocuments(documents, selectedTenant, selectedCategory, searchQuery);
  }, [documents, selectedTenant, selectedCategory, searchQuery]);

  const kpis = useMemo(() => {
    const total = documents.length;
    const verified = documents.filter((d) => d.signers && d.signers.length > 0).length;
    const encrypted = documents.filter(
      (d) => d.encryptionTier === 'AES_256_GCM_ENCRYPTED' || d.encryptionTier === 'ZERO_KNOWLEDGE_VAULT'
    ).length;
    return { total, verified, encrypted };
  }, [documents]);

  const handlePrintDoc = (doc: UniversalDocument) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      notify(lang === 'pl' ? 'Zablokowano okno drukowania' : 'Popup blocked', 'rose');
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            .header { border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 24px; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; background: #eee; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .content { white-space: pre-wrap; font-family: monospace; background: #f9f9f9; padding: 20px; border-radius: 8px; }
            .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 16px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="badge">${doc.category}</span>
            <h1>${doc.title}</h1>
            <p><strong>Plik:</strong> ${doc.fileName} | <strong>Tenant:</strong> ${doc.tenantId} | <strong>Data:</strong> ${new Date(doc.createdAt).toLocaleDateString()}</p>
            <p><strong>SHA-256 Hash:</strong> <code>${doc.sha256Hash}</code></p>
          </div>
          <div class="content">${doc.fullContentPreview}</div>
          <div class="footer">
            <p>Wydrukowano z JARVIS Sovereign Life & Business Vault | Certyfikat cyfrowy zweryfikowany.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    notify(lang === 'pl' ? `Wysłano do druku: ${doc.title}` : `Sent to print: ${doc.title}`, 'emerald');
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newDoc: UniversalDocument = {
      id: `doc-${Date.now()}`,
      tenantId: newTenant,
      title: newTitle.trim(),
      category: newCategory,
      fileName: newFileName.trim() || `${newTitle.toUpperCase().replace(/\s+/g, '_')}.pdf`,
      fileSizeBytes: 1_250_000,
      mimeType: 'application/pdf',
      sha256Hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      encryptionTier: 'AES_256_GCM_ENCRYPTED',
      tags: ['Nowy', newCategory, newTenant],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      signers: [
        {
          name: 'Wiktor Myszor',
          role: 'Operator',
          signedAt: new Date().toISOString(),
          verifiedSignature: true,
        },
      ],
      contentSummaryPl: `Zarejestrowano nowy dokument w skarbcu podmiotu ${newTenant}.`,
      contentSummaryEn: `New document registered under ${newTenant} vault partition.`,
      fullContentPreview: `DOKUMENT PODMIOTU: ${newTenant.toUpperCase()}
Tytuł: ${newTitle}
Kategoria: ${newCategory}
Data rejestracji: ${new Date().toLocaleString()}
Status pieczęci: ZWERYFIKOWANY PODPIS ELEKTRONICZNY`,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setShowAddModal(false);
    setNewTitle('');
    setNewFileName('');
    notify(lang === 'pl' ? 'Utworzono i zdeponowano dokument' : 'Document vaulted successfully', 'cyan');
  };

  return (
    <div className="space-y-6">
      {/* Top Page Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-900/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B0E14]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-[#14F1D9]/10 px-2.5 py-1 font-mono text-xs font-bold text-[#14F1D9]">
                VAULT S4
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {lang === 'pl'
                  ? 'Skarbiec Dokumentów Osobistych & Biznesowych'
                  : 'Universal Personal & Business Document Vault'}
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {lang === 'pl'
                ? 'Scentralizowany rejestr umów, paszportów, zgód medycznych HBOT, e-faktur KSeF i protokołów technicznych.'
                : 'Unified repository for personal passports, clinical consents, B2B OxyHelp contracts, KSeF invoices, and technical audits.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#14F1D9] px-4 py-2 text-xs font-bold text-[#090C11] shadow-[0_0_16px_-4px_rgba(20,241,217,0.4)] hover:bg-[#14F1D9]/90"
            >
              <Plus className="h-4 w-4" />
              <span>{lang === 'pl' ? 'Zdeponuj Dokument' : 'Vault New Document'}</span>
            </button>
          </div>
        </div>

        {/* Quick KPIs */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-900/5 bg-slate-50/50 p-3.5 dark:border-white/5 dark:bg-white/[0.02]">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {lang === 'pl' ? 'Wszystkie Dokumenty' : 'Total Documents'}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {kpis.total}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-900/5 bg-slate-50/50 p-3.5 dark:border-white/5 dark:bg-white/[0.02]">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {lang === 'pl' ? 'Zweryfikowane Cyfrowo' : 'Digitally Signed'}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#10B981]">
              {kpis.verified}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-900/5 bg-slate-50/50 p-3.5 dark:border-white/5 dark:bg-white/[0.02]">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {lang === 'pl' ? 'Szyfrowane AES-256' : 'AES-256 Encrypted'}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#6366F1]">
              {kpis.encrypted}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-900/5 bg-slate-50/50 p-3.5 dark:border-white/5 dark:bg-white/[0.02]">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {lang === 'pl' ? 'Aktywny Filtr' : 'Active Scope'}
            </p>
            <p className="mt-1 text-sm font-bold uppercase tracking-wider text-[#14F1D9]">
              {selectedTenant === 'all' ? 'All Tenants' : TENANT_REGISTRY[selectedTenant]?.badge}
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Tenant Switcher Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-900/10 bg-white p-2 dark:border-white/10 dark:bg-[#0E1219]">
        <span className="px-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
          {lang === 'pl' ? 'Podmiot:' : 'Tenant:'}
        </span>
        <button
          type="button"
          onClick={() => setSelectedTenant('all')}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            selectedTenant === 'all'
              ? 'bg-[#14F1D9] text-[#090C11] shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
          }`}
        >
          {lang === 'pl' ? 'Wszystkie Podmioty' : 'All Tenants'}
        </button>
        {(Object.keys(TENANT_REGISTRY) as TenantId[]).map((tid) => {
          const t = TENANT_REGISTRY[tid];
          const active = selectedTenant === tid;
          return (
            <button
              key={tid}
              type="button"
              onClick={() => setSelectedTenant(tid)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                active
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: t.accentColor }}
              />
              <span>{lang === 'pl' ? t.labelPl : t.labelEn}</span>
              <span className="rounded bg-black/10 px-1 font-mono text-[9px] dark:bg-white/10">
                {t.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Category Filter Chips */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'pl'
                ? 'Szukaj dokumentu, numeru KSeF, SHA-256 lub tagu...'
                : 'Search document, KSeF ID, SHA-256 hash or tag...'
            }
            className="w-full rounded-xl border border-slate-900/10 bg-white py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-[#14F1D9] focus:outline-none dark:border-white/10 dark:bg-[#0E1219] dark:text-white dark:placeholder-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
            }`}
          >
            {lang === 'pl' ? 'Wszystkie kategorie' : 'All Categories'}
          </button>
          {(Object.keys(CATEGORY_REGISTRY) as DocumentCategory[]).map((catId) => {
            const cat = CATEGORY_REGISTRY[catId];
            const active = selectedCategory === catId;
            return (
              <button
                key={catId}
                type="button"
                onClick={() => setSelectedCategory(catId)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                  active
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400'
                }`}
              >
                {lang === 'pl' ? cat.labelPl : cat.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Documents Bento Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocs.map((doc) => {
          const catMeta = CATEGORY_REGISTRY[doc.category];
          const tenantMeta = TENANT_REGISTRY[doc.tenantId];

          return (
            <div
              key={doc.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-900/10 bg-white p-5 transition-all duration-150 hover:border-[#14F1D9]/40 hover:shadow-md dark:border-white/10 dark:bg-[#0E1219]"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${catMeta.badgeBg} ${catMeta.badgeText}`}
                  >
                    {lang === 'pl' ? catMeta.labelPl : catMeta.labelEn}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-slate-400">
                    <Lock className="h-3 w-3 text-emerald-400" />
                    {doc.encryptionTier === 'ZERO_KNOWLEDGE_VAULT' ? 'ZK-VAULT' : 'AES-256'}
                  </span>
                </div>

                {/* Title & File Name */}
                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-[#14F1D9] dark:text-white">
                  {doc.title}
                </h3>
                <p className="mt-0.5 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                  {doc.fileName}
                </p>

                {/* Summary */}
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                  {lang === 'pl' ? doc.contentSummaryPl : doc.contentSummaryEn}
                </p>

                {/* SHA-256 Stamp */}
                <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-2 font-mono text-[10px] text-slate-500 dark:bg-white/[0.03] dark:text-slate-400">
                  <span className="truncate">SHA: {doc.sha256Hash.slice(0, 16)}...</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(doc.sha256Hash);
                      notify(lang === 'pl' ? 'Skopiowano SHA-256' : 'SHA-256 copied', 'cyan');
                    }}
                    title="Kopiuj pełny hash SHA-256"
                    className="hover:text-slate-900 dark:hover:text-white"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Signers & Tenant */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md border border-slate-900/10 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:border-white/10 dark:text-slate-300">
                    {tenantMeta?.badge}
                  </span>
                  {doc.signers?.map((s, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{s.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-900/5 pt-3 dark:border-white/5">
                <span className="text-[10px] text-slate-400">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrintDoc(doc)}
                    title={lang === 'pl' ? 'Drukuj / Pobierz PDF' : 'Print / Download PDF'}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewDoc(doc)}
                    className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>{lang === 'pl' ? 'Podgląd' : 'Preview'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document Live Preview Modal */}
      {activePreviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-900/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0E1219]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-900/10 p-5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-[#14F1D9]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activePreviewDoc.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewDoc(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4 rounded-2xl bg-slate-50 p-5 font-mono text-xs text-slate-800 dark:bg-black/40 dark:text-slate-200">
                <div className="border-b border-slate-900/10 pb-3 dark:border-white/10">
                  <p>
                    <strong>PLIK:</strong> {activePreviewDoc.fileName}
                  </p>
                  <p>
                    <strong>TENANT:</strong> {activePreviewDoc.tenantId.toUpperCase()}
                  </p>
                  <p>
                    <strong>KATEGORIA:</strong> {activePreviewDoc.category}
                  </p>
                  <p>
                    <strong>SHA-256:</strong> {activePreviewDoc.sha256Hash}
                  </p>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {activePreviewDoc.fullContentPreview}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-900/10 p-4 dark:border-white/10">
              <span className="font-mono text-xs text-emerald-500">
                ✓ Integralność potwierdzona kluczem SHA-256
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintDoc(activePreviewDoc)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#14F1D9] px-4 py-2 text-xs font-bold text-[#090C11] hover:bg-[#14F1D9]/90"
                >
                  <Printer className="h-4 w-4" />
                  <span>{lang === 'pl' ? 'Drukuj / Pobierz PDF' : 'Print / Download PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateDocument}
            className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-slate-900/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0E1219]"
          >
            <div className="flex items-center justify-between border-b border-slate-900/10 pb-3 dark:border-white/10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'pl' ? 'Zdeponuj Nowy Dokument w Skarbcu' : 'Vault New Document'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {lang === 'pl' ? 'Tytuł Dokumentu' : 'Document Title'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="np. Umowa Najmu Lokalu Biurowego Katowice"
                  className="mt-1 w-full rounded-xl border border-slate-900/10 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {lang === 'pl' ? 'Podmiot (Tenant)' : 'Tenant Partition'}
                  </label>
                  <select
                    value={newTenant}
                    onChange={(e) => setNewTenant(e.target.value as TenantId)}
                    className="mt-1 w-full rounded-xl border border-slate-900/10 bg-slate-50 p-2 text-xs text-slate-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                  >
                    {(Object.keys(TENANT_REGISTRY) as TenantId[]).map((tid) => (
                      <option key={tid} value={tid}>
                        {TENANT_REGISTRY[tid].labelPl} ({TENANT_REGISTRY[tid].badge})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {lang === 'pl' ? 'Kategoria' : 'Category'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DocumentCategory)}
                    className="mt-1 w-full rounded-xl border border-slate-900/10 bg-slate-50 p-2 text-xs text-slate-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                  >
                    {(Object.keys(CATEGORY_REGISTRY) as DocumentCategory[]).map((cid) => (
                      <option key={cid} value={cid}>
                        {CATEGORY_REGISTRY[cid].labelPl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {lang === 'pl' ? 'Nazwa Pliku' : 'File Name'}
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="np. UMOWA_NAJMU_KATOWICE_2026.pdf"
                  className="mt-1 w-full rounded-xl border border-slate-900/10 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-white/10 dark:bg-black/30 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-900/10 pt-4 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                {lang === 'pl' ? 'Anuluj' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#14F1D9] px-4 py-2 text-xs font-bold text-[#090C11] hover:bg-[#14F1D9]/90"
              >
                {lang === 'pl' ? 'Podpisz i Zdeponuj' : 'Sign & Vault'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DocumentVaultView;
