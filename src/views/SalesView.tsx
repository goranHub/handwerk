import React, { useState } from 'react';
import {
  SalesDocument,
  SalesLineItem,
  SalesDocumentType,
  SalesDocumentStatus,
  SalesTaxMode,
  SalesLineKind,
  SalesElectronicFormat,
  ERPProject,
  Customer,
  CompanyProfile,
} from '../types/erp';
import {
  Plus,
  FileText,
  Search,
  Printer,
  QrCode,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Repeat,
  Trash2,
  Edit2,
  Share2,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { GiroCodeModal } from '../components/common/GiroCodeModal';
import { DigitalSignatureCanvas } from '../components/common/DigitalSignatureCanvas';
import { generateElectronicInvoiceXml, downloadXmlFile } from '../services/xmlExport';

interface SalesViewProps {
  documents: SalesDocument[];
  projects: ERPProject[];
  customers: Customer[];
  company: CompanyProfile;
  onAddDocument: (doc: SalesDocument) => void;
  onUpdateDocument: (doc: SalesDocument) => void;
  onDeleteDocument: (id: string) => void;
  onCreateProjectFromOffer: (offer: SalesDocument) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  documents,
  projects,
  customers,
  company,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
  onCreateProjectFromOffer,
}) => {
  const [filterType, setFilterType] = useState<SalesDocumentType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<SalesDocument | null>(null);

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isGiroModalOpen, setIsGiroModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  // Form states for creating/editing sales document
  const [formType, setFormType] = useState<SalesDocumentType>('Rechnung');
  const [formNumber, setFormNumber] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerAddress, setFormCustomerAddress] = useState('');
  const [formCustomerId, setFormCustomerId] = useState<string>('');
  const [formProjectId, setFormProjectId] = useState<number | undefined>(projects[0]?.id);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState(
    new Date(Date.now() + 14 * 86400 * 1000).toISOString().split('T')[0]
  );
  const [formStatus, setFormStatus] = useState<SalesDocumentStatus>('Entwurf');
  const [formTaxMode, setFormTaxMode] = useState<SalesTaxMode>('Regelbesteuerung');
  const [formTaxRate, setFormTaxRate] = useState(19);
  const [formNotes, setFormNotes] = useState('Zahlbar rein netto innerhalb von 14 Tagen nach Rechnungsstellung.');
  const [formBuyerRef, setFormBuyerRef] = useState('');
  const [formElectronicFormat, setFormElectronicFormat] = useState<SalesElectronicFormat>('XRechnung XML (Basis)');
  const [formItems, setFormItems] = useState<SalesLineItem[]>([
    {
      id: 'item-1',
      title: 'Fachgerechte Handwerksleistung',
      details: 'Ausführung gemäß Angebot und Aufmaß',
      quantity: 8,
      unit: 'Std.',
      unitPrice: 65,
      kind: 'Arbeitsleistung',
    },
  ]);

  const filteredDocs = documents.filter((d) => {
    if (filterType !== 'ALL' && d.type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.number.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        d.projectName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalInvoiced = documents
    .filter((d) => d.type === 'Rechnung')
    .reduce((sum, d) => {
      const net = d.items.reduce((iSum, i) => iSum + (i.kind === 'Text' ? 0 : i.quantity * i.unitPrice), 0);
      return sum + net;
    }, 0);

  const totalUnpaid = documents
    .filter((d) => d.type === 'Rechnung' && d.status !== 'Bezahlt')
    .reduce((sum, d) => {
      const net = d.items.reduce((iSum, i) => iSum + (i.kind === 'Text' ? 0 : i.quantity * i.unitPrice), 0);
      const tax = d.taxMode === 'Regelbesteuerung' ? (net * d.taxRate) / 100 : 0;
      return sum + net + tax + (d.reminderFee || 0);
    }, 0);

  const handleOpenNew = (type: SalesDocumentType) => {
    setFormType(type);
    const year = new Date().getFullYear();
    const count = documents.filter((d) => d.type === type).length + 1;
    setFormNumber(`${type === 'Angebot' ? 'ANG' : 'RE'}-${year}-${String(count).padStart(3, '0')}`);
    setFormCustomerName(customers[0]?.name || '');
    setFormCustomerAddress(customers[0]?.address || '');
    setFormCustomerId(customers[0]?.id || '');
    setFormProjectId(projects[0]?.id);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDueDate(new Date(Date.now() + 14 * 86400 * 1000).toISOString().split('T')[0]);
    setFormStatus('Entwurf');
    setFormTaxMode('Regelbesteuerung');
    setFormTaxRate(19);
    setFormNotes('Zahlbar rein netto innerhalb von 14 Tagen nach Rechnungsdatum.');
    setFormBuyerRef('');
    setFormElectronicFormat('XRechnung XML (Basis)');
    setFormItems([
      {
        id: `item-${Date.now()}`,
        title: 'Arbeitsleistung / Montage',
        details: 'Fachgerechte Ausführung nach Aufmaß',
        quantity: 1,
        unit: 'Std.',
        unitPrice: 68.0,
        kind: 'Arbeitsleistung',
      },
    ]);
    setIsEditorOpen(true);
  };

  const handleAddItem = () => {
    setFormItems([
      ...formItems,
      {
        id: `item-${Date.now()}`,
        title: 'Material / Artikel',
        details: '',
        quantity: 1,
        unit: 'Stk.',
        unitPrice: 0,
        kind: 'Material',
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setFormItems(formItems.filter((i) => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof SalesLineItem, value: any) => {
    setFormItems(
      formItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveDoc = () => {
    if (!formNumber.trim() || !formCustomerName.trim() || formItems.length === 0) return;

    const proj = projects.find((p) => p.id === formProjectId);

    const newDoc: SalesDocument = {
      id: selectedDoc?.id || `sal-${Date.now()}`,
      type: formType,
      number: formNumber.trim(),
      projectId: formProjectId,
      projectName: proj?.displayName || '',
      customerId: formCustomerId || undefined,
      customerName: formCustomerName.trim(),
      customerAddress: formCustomerAddress.trim(),
      date: new Date(formDate).toISOString(),
      dueDate: formType === 'Rechnung' ? new Date(formDueDate).toISOString() : undefined,
      status: formStatus,
      taxMode: formTaxMode,
      taxRate: formTaxRate,
      notes: formNotes,
      buyerReference: formBuyerRef.trim() || undefined,
      electronicFormat: formElectronicFormat,
      items: formItems,
      signedBy: selectedDoc?.signedBy,
      signedAt: selectedDoc?.signedAt,
      signatureDataUrl: selectedDoc?.signatureDataUrl,
    };

    if (selectedDoc) {
      onUpdateDocument(newDoc);
    } else {
      onAddDocument(newDoc);
    }

    setIsEditorOpen(false);
    setSelectedDoc(newDoc);
  };

  const handleDuplicateAsInvoice = (offer: SalesDocument) => {
    const year = new Date().getFullYear();
    const invoiceCount = documents.filter((d) => d.type === 'Rechnung').length + 1;
    const invoiceNum = `RE-${year}-${String(invoiceCount).padStart(3, '0')}`;

    const newInvoice: SalesDocument = {
      ...offer,
      id: `sal-${Date.now()}`,
      type: 'Rechnung',
      number: invoiceNum,
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 86400 * 1000).toISOString(),
      status: 'Entwurf',
      notes: `Erstellt aus Angebot ${offer.number}. Zahlbar innerhalb von 14 Tagen.`,
    };

    onAddDocument(newInvoice);
    setSelectedDoc(newInvoice);
  };

  const handleApplyNextDunning = (invoice: SalesDocument) => {
    const nextLevel = Math.min(3, (invoice.reminderLevel || 0) + 1);
    const fee = nextLevel === 1 ? 0 : nextLevel === 2 ? 5 : 10;
    const updated: SalesDocument = {
      ...invoice,
      status: 'Überfällig',
      reminderLevel: nextLevel,
      reminderFee: fee,
      notes: `${invoice.notes}\n\n[${nextLevel}. Mahnung erstellt am ${new Date().toLocaleDateString('de-DE')} · Mahngebühr: ${fee.toFixed(2)} €]`,
    };
    onUpdateDocument(updated);
    setSelectedDoc(updated);
  };

  const handleExportXml = (doc: SalesDocument) => {
    const xml = generateElectronicInvoiceXml(doc, company);
    downloadXmlFile(xml, `E-Rechnung_${doc.number}.xml`);
  };

  // Preview computations
  const currentNet = selectedDoc
    ? selectedDoc.items.reduce((sum, item) => sum + (item.kind === 'Text' ? 0 : item.quantity * item.unitPrice), 0)
    : 0;
  const currentTax = selectedDoc?.taxMode === 'Regelbesteuerung' ? (currentNet * selectedDoc.taxRate) / 100 : 0;
  const currentGross = currentNet + currentTax + (selectedDoc?.reminderFee || 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
            Fakturierung & GoBD / E-Rechnung
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Angebote & Rechnungen
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenNew('Angebot')}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
          >
            + Neues Angebot
          </button>
          <button
            onClick={() => handleOpenNew('Rechnung')}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Neue Rechnung</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Fakturiert Netto
          </span>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {totalInvoiced.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          <span className="text-[11px] text-slate-500">Alle gestellten Rechnungen</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Offene Forderungen
          </span>
          <div className="text-2xl font-black text-amber-600 tabular-nums">
            {totalUnpaid.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          <span className="text-[11px] text-slate-500">Ausstehende Zahlungen Brutto</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Erstellte Belege
          </span>
          <div className="text-2xl font-black text-blue-600 tabular-nums">
            {documents.length}
          </div>
          <span className="text-[11px] text-slate-500">
            {documents.filter((d) => d.type === 'Angebot').length} Angebote ·{' '}
            {documents.filter((d) => d.type === 'Rechnung').length} Rechnungen
          </span>
        </div>
      </div>

      {/* Filters and List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Documents List */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nummer, Kunde oder Auftrag …"
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs">
              {(['ALL', 'Angebot', 'Rechnung'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`rounded-lg px-2.5 py-1 font-semibold text-[11px] ${
                    filterType === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {t === 'ALL' ? 'Alle' : t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredDocs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
                Keine Belege gefunden.
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                const net = doc.items.reduce((s, i) => s + (i.kind === 'Text' ? 0 : i.quantity * i.unitPrice), 0);
                const gross = net + (doc.taxMode === 'Regelbesteuerung' ? (net * doc.taxRate) / 100 : 0) + (doc.reminderFee || 0);

                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all text-xs space-y-2 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            doc.type === 'Angebot'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {doc.type}
                        </span>
                        <span className="font-mono font-bold text-slate-900">{doc.number}</span>
                      </div>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          doc.status === 'Bezahlt' || doc.status === 'Angenommen'
                            ? 'bg-emerald-50 text-emerald-700'
                            : doc.status === 'Überfällig'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-slate-800 line-clamp-1">{doc.customerName}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{doc.projectName}</div>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-[11px]">
                      <span className="text-slate-400">
                        {new Date(doc.date).toLocaleDateString('de-DE')}
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {gross.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Printable Document Preview & Action Panel */}
        <div className="lg:col-span-2 space-y-4">
          {selectedDoc ? (
            <>
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Drucken / PDF</span>
                  </button>

                  {selectedDoc.type === 'Rechnung' && (
                    <button
                      onClick={() => setIsGiroModalOpen(true)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700 shadow-2xs"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>GiroCode</span>
                    </button>
                  )}

                  {selectedDoc.type === 'Rechnung' && (
                    <button
                      onClick={() => handleExportXml(selectedDoc)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>E-Rechnung XML</span>
                    </button>
                  )}

                  {selectedDoc.type === 'Angebot' && (
                    <button
                      onClick={() => handleDuplicateAsInvoice(selectedDoc)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700 shadow-2xs"
                    >
                      <Repeat className="h-3.5 w-3.5" />
                      <span>In Rechnung wandeln</span>
                    </button>
                  )}

                  {selectedDoc.type === 'Angebot' && !selectedDoc.projectId && (
                    <button
                      onClick={() => onCreateProjectFromOffer(selectedDoc)}
                      className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 font-bold text-white hover:bg-blue-700 shadow-2xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>In Auftrag wandeln</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {selectedDoc.type === 'Rechnung' && selectedDoc.status !== 'Bezahlt' && (
                    <button
                      onClick={() => handleApplyNextDunning(selectedDoc)}
                      className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 font-semibold text-amber-800 hover:bg-amber-100"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Mahnstufe ({selectedDoc.reminderLevel ? selectedDoc.reminderLevel + 1 : 1})</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm('Diesen Beleg unwiderruflich löschen?')) {
                        onDeleteDocument(selectedDoc.id);
                        setSelectedDoc(null);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Printable Invoice / Offer Page */}
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md text-slate-900 space-y-8 font-sans">
                {/* Header: Company & Document Title */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase block">
                      {company.companyName} · {company.street} · {company.postalCode} {company.city}
                    </span>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 mt-2">
                      {selectedDoc.type.toUpperCase()}
                    </h2>
                    <span className="font-mono text-base font-bold text-slate-700">
                      {selectedDoc.number}
                    </span>
                  </div>

                  <div className="text-right text-xs space-y-1">
                    <div className="font-bold text-slate-900 text-sm">{company.companyName}</div>
                    <div className="text-slate-500">{company.street}</div>
                    <div className="text-slate-500">
                      {company.postalCode} {company.city}
                    </div>
                    <div className="text-slate-500">Tel: {company.phone}</div>
                    <div className="text-slate-500">USt-IdNr: {company.vatId}</div>
                  </div>
                </div>

                {/* Recipient and Meta */}
                <div className="flex justify-between items-start text-xs">
                  <div className="space-y-1 max-w-sm">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Empfänger
                    </span>
                    <div className="font-bold text-sm text-slate-900">{selectedDoc.customerName}</div>
                    <div className="text-slate-600 whitespace-pre-line">{selectedDoc.customerAddress}</div>
                  </div>

                  <div className="text-right space-y-1">
                    <div>
                      <span className="text-slate-400">Belegdatum: </span>
                      <span className="font-semibold">{new Date(selectedDoc.date).toLocaleDateString('de-DE')}</span>
                    </div>
                    {selectedDoc.dueDate && (
                      <div>
                        <span className="text-slate-400">Fälligkeitsdatum: </span>
                        <span className="font-semibold text-amber-700">
                          {new Date(selectedDoc.dueDate).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    )}
                    {selectedDoc.projectName && (
                      <div>
                        <span className="text-slate-400">Auftrag: </span>
                        <span className="font-semibold">{selectedDoc.projectName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-3 w-10 text-center">Pos.</th>
                        <th className="py-2.5 px-3">Bezeichnung & Ausführung</th>
                        <th className="py-2.5 px-3 text-right">Menge</th>
                        <th className="py-2.5 px-3 text-right">Einzelpreis</th>
                        <th className="py-2.5 px-3 text-right">Gesamt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedDoc.items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">{item.title}</span>
                            {item.details && <span className="text-[11px] text-slate-500">{item.details}</span>}
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums">
                            {item.kind === 'Text' ? '' : `${item.quantity} ${item.unit}`}
                          </td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums">
                            {item.kind === 'Text'
                              ? ''
                              : item.unitPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                            {item.kind === 'Text'
                              ? ''
                              : (item.quantity * item.unitPrice).toLocaleString('de-DE', {
                                  style: 'currency',
                                  currency: 'EUR',
                                })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Nettosumme:</span>
                      <span className="font-mono font-bold">
                        {currentNet.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>
                        {selectedDoc.taxMode === 'Regelbesteuerung'
                          ? `Umsatzsteuer (${selectedDoc.taxRate}%):`
                          : selectedDoc.taxMode}
                      </span>
                      <span className="font-mono font-bold">
                        {currentTax.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>

                    {selectedDoc.reminderFee && selectedDoc.reminderFee > 0 && (
                      <div className="flex justify-between items-center text-amber-700">
                        <span>Mahngebühren:</span>
                        <span className="font-mono font-bold">
                          {selectedDoc.reminderFee.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-slate-900 pt-2 flex justify-between items-center font-bold text-sm text-slate-900">
                      <span>Gesamtbetrag:</span>
                      <span className="font-mono text-base text-emerald-600">
                        {currentGross.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes and Bank Details */}
                <div className="border-t border-slate-100 pt-6 text-xs text-slate-600 space-y-4">
                  {selectedDoc.notes && (
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-800 block">Zahlungsbedingungen & Hinweise:</span>
                      <p className="whitespace-pre-line text-[11px] leading-relaxed">{selectedDoc.notes}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-[11px] text-slate-500">
                    <div>
                      <span className="font-bold text-slate-700 block">Bankverbindung</span>
                      <span>{company.bankName}</span>
                      <br />
                      <span className="font-mono">IBAN: {company.iban}</span>
                      <br />
                      <span className="font-mono">BIC: {company.bic}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block">Steuerliche Angaben</span>
                      <span>Steuernummer: {company.taxNumber}</span>
                      <br />
                      <span>USt-IdNr.: {company.vatId}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block">Register & Kammer</span>
                      <span>{company.registerInfo}</span>
                      <br />
                      <span>Inhaber: {company.ownerName}</span>
                    </div>
                  </div>

                  {/* Customer Signature on Offer */}
                  {selectedDoc.type === 'Angebot' && (
                    <div className="border-t border-slate-200 pt-4 flex justify-between items-end">
                      {selectedDoc.signedBy ? (
                        <div className="space-y-1">
                          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                            Rechtsverbindlich angenommen durch Kunden
                          </span>
                          <span className="font-bold text-slate-900">{selectedDoc.signedBy}</span>
                          <span className="text-slate-400 block text-[10px]">
                            Unterzeichnet am{' '}
                            {selectedDoc.signedAt ? new Date(selectedDoc.signedAt).toLocaleDateString('de-DE') : ''}
                          </span>
                          {selectedDoc.signatureDataUrl && (
                            <img
                              src={selectedDoc.signatureDataUrl}
                              alt="Kundenunterschrift"
                              className="max-h-16 mt-1"
                            />
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsSignatureModalOpen(true)}
                          className="rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700"
                        >
                          Digitale Kundenunterschrift erfassen
                        </button>
                      )}
                      <div className="text-right text-[10px] text-slate-400">
                        {company.footerText}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-semibold text-slate-600">Wähle einen Beleg aus</p>
              <p className="text-xs text-slate-400 mt-1">
                Klicke links auf ein Angebot oder eine Rechnung zur Ansicht oder Bearbeitung.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* GiroCode Modal */}
      {selectedDoc && (
        <GiroCodeModal
          isOpen={isGiroModalOpen}
          onClose={() => setIsGiroModalOpen(false)}
          document={selectedDoc}
          company={company}
        />
      )}

      {/* Signature Modal */}
      {selectedDoc && (
        <Modal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          title={`Angebot ${selectedDoc.number} verbindlich annehmen`}
          subtitle="Kundenunterschrift direkt auf dem Display erfassen"
        >
          <DigitalSignatureCanvas
            initialSignerName={selectedDoc.customerName}
            onSave={(signer, dataUrl) => {
              const updated: SalesDocument = {
                ...selectedDoc,
                status: 'Angenommen',
                signedBy: signer,
                signedAt: new Date().toISOString(),
                signatureDataUrl: dataUrl,
              };
              onUpdateDocument(updated);
              setSelectedDoc(updated);
              setIsSignatureModalOpen(false);
            }}
            onCancel={() => setIsSignatureModalOpen(false)}
          />
        </Modal>
      )}

      {/* New Document Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={formType === 'Angebot' ? 'Neues Angebot erstellen' : 'Neue Rechnung erstellen'}
        subtitle="GoBD-konforme Positionserfassung & automatische Summenberechnung"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Belegart</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as SalesDocumentType)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              >
                <option value="Angebot">Angebot</option>
                <option value="Rechnung">Rechnung</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Belegnummer *</label>
              <input
                type="text"
                value={formNumber}
                onChange={(e) => setFormNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Kundenname / Firma *</label>
              <input
                type="text"
                value={formCustomerName}
                onChange={(e) => setFormCustomerName(e.target.value)}
                placeholder="z. B. Anna Wagner"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Zugehöriger Auftrag</label>
              <select
                value={formProjectId || ''}
                onChange={(e) => setFormProjectId(Number(e.target.value) || undefined)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              >
                <option value="">Kein Auftrag zugeordnet</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Kundenanschrift</label>
            <input
              type="text"
              value={formCustomerAddress}
              onChange={(e) => setFormCustomerAddress(e.target.value)}
              placeholder="Straße, PLZ Ort"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Belegdatum</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Zahlungsziel (Fälligkeit)</label>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Steuerfall</label>
              <select
                value={formTaxMode}
                onChange={(e) => setFormTaxMode(e.target.value as SalesTaxMode)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              >
                <option value="Regelbesteuerung">Regelbesteuerung 19%</option>
                <option value="§19 UStG Kleinunternehmer">§19 UStG Kleinunternehmer</option>
                <option value="§13b UStG Reverse Charge">§13b UStG Reverse Charge</option>
              </select>
            </div>
          </div>

          {/* Line items section */}
          <div className="border-t border-slate-200 pt-3 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800">Leistungspositionen ({formItems.length})</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-amber-600 font-bold hover:underline"
              >
                + Position hinzufügen
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {formItems.map((item, idx) => (
                <div key={item.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-500 text-[10px]">#{idx + 1}</span>
                    <input
                      type="text"
                      placeholder="Bezeichnung der Leistung"
                      value={item.title}
                      onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                      className="flex-1 rounded border border-slate-300 p-1 text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Menge"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                      className="rounded border border-slate-300 p-1 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Einheit (Std., m, Stk.)"
                      value={item.unit}
                      onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                      className="rounded border border-slate-300 p-1 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Einzelpreis in €"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                      className="rounded border border-slate-300 p-1 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Hinweise / Zahlungsbedingungen</label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleSaveDoc}
              className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-700"
            >
              Beleg speichern
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
