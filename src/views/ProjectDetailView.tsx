import React, { useState } from 'react';
import {
  ERPProject,
  ERPStoreState,
  ProjectWorkStep,
  ProjectPlannedMaterial,
  ChecklistItem,
  TimeEntrySummary,
} from '../types/erp';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileText,
  Camera,
  Boxes,
  Users,
  MessageSquare,
  Ruler,
  TrendingUp,
  DollarSign,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { DigitalSignatureCanvas } from '../components/common/DigitalSignatureCanvas';
import { ERPView } from '../components/layout/Sidebar';

interface ProjectDetailViewProps {
  project: ERPProject;
  state: ERPStoreState;
  onBack: () => void;
  onNavigate: (view: ERPView) => void;
  onToggleChecklist: (itemId: string) => void;
  onAddChecklistItem: (projectId: number, title: string) => void;
  onConsumeMaterial: (projectId: number, materialId: string, quantity: number) => void;
  onSaveSignature: (projectId: number, signerName: string, signatureDataUrl: string) => void;
  onUpdateBudget: (projectId: number, budget: { plannedHours: number; laborBudget: number; materialBudget: number }) => void;
  onStartBooking: (projectId: number, stepName: string) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  state,
  onBack,
  onNavigate,
  onToggleChecklist,
  onAddChecklistItem,
  onConsumeMaterial,
  onSaveSignature,
  onUpdateBudget,
  onStartBooking,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'field' | 'office' | 'finish'>('overview');
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [selectedMatId, setSelectedMatId] = useState(state.materials[0]?.id || '');
  const [matQuantity, setMatQuantity] = useState(1);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Budget modal form
  const currentBudget = state.budgets[project.id] || {
    plannedHours: 100,
    laborBudget: 5200,
    materialBudget: 3500,
  };
  const [formPlannedHours, setFormPlannedHours] = useState(currentBudget.plannedHours || 100);
  const [formLaborBudget, setFormLaborBudget] = useState(currentBudget.laborBudget || 5200);
  const [formMaterialBudget, setFormMaterialBudget] = useState(currentBudget.materialBudget || 3500);

  // Filter project-specific data
  const projectTasks = state.tasks.filter((t: any) => t.projectId === project.id);
  const projectChecklist = state.checklist.filter((c: any) => c.projectId === project.id);
  const projectPhotos = state.sitePhotos.filter((p: any) => p.projectId === project.id);
  const projectMaterialsUsed = state.projectMaterials.filter((m: any) => m.projectId === project.id);
  const projectTimeEntries = state.timeEntries.filter((t: any) => t.projectId === project.id);
  const projectDefects = state.defects.filter((d: any) => d.projectId === project.id);
  const projectReports = state.dailyReports.filter((r: any) => r.projectId === project.id);
  const projectSignatures = state.signatures.filter((s: any) => s.projectId === project.id);
  const projectSales = state.salesDocuments.filter((s: any) => s.projectId === project.id);

  // Financial calculations
  const totalHoursWorked = projectTimeEntries.reduce((sum: number, te: any) => {
    const durSec =
      (new Date(te.endedAt).getTime() - new Date(te.startedAt).getTime()) / 1000 -
      (te.pauseSeconds || 0);
    return sum + Math.max(0, durSec / 3600);
  }, 0);

  const totalLaborCost = projectTimeEntries.reduce((sum: number, te: any) => {
    const durSec =
      (new Date(te.endedAt).getTime() - new Date(te.startedAt).getTime()) / 1000 -
      (te.pauseSeconds || 0);
    return sum + Math.max(0, durSec / 3600) * (te.hourlyCostRate || 52);
  }, 0);

  const totalMaterialCost = projectMaterialsUsed.reduce((sum: number, m: any) => sum + m.quantity * m.unitPrice, 0);
  const totalOtherExpenses = state.expenses
    .filter((e: any) => e.projectId === project.id)
    .reduce((sum: number, e: any) => sum + e.amount, 0);

  const totalActualCost = totalLaborCost + totalMaterialCost + totalOtherExpenses;

  const totalInvoicedNet = projectSales
    .filter((s: any) => s.type === 'Rechnung')
    .reduce((sum: number, doc: any) => {
      const net = doc.items.reduce((iSum: number, i: any) => iSum + (i.kind === 'Text' ? 0 : i.quantity * i.unitPrice), 0);
      return sum + net;
    }, 0);

  const contributionMargin = totalInvoicedNet - totalActualCost;
  const marginPercent = totalInvoicedNet > 0 ? (contributionMargin / totalInvoicedNet) * 100 : 0;

  // Completion criteria
  const checklistTotal = projectChecklist.length;
  const checklistDone = projectChecklist.filter((c: any) => c.isDone).length;
  const hasReport = projectReports.length > 0;
  const hasSignature = projectSignatures.length > 0;
  const hasOpenDefects = projectDefects.some((d: any) => d.status !== 'Abgeschlossen' && d.status !== 'Behoben');

  const completionPercent = Math.round(
    ((checklistTotal > 0 && checklistDone === checklistTotal ? 25 : (checklistDone / (checklistTotal || 1)) * 25) +
      (!hasOpenDefects ? 25 : 0) +
      (hasReport ? 25 : 0) +
      (hasSignature ? 25 : 0))
  );

  const openNavigationMap = () => {
    if (!project.adresse) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.adresse)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    onAddChecklistItem(project.id, newChecklistText.trim());
    setNewChecklistText('');
    setIsChecklistModalOpen(false);
  };

  const handleBookMaterial = () => {
    if (!selectedMatId || matQuantity <= 0) return;
    onConsumeMaterial(project.id, selectedMatId, matQuantity);
    setIsMaterialModalOpen(false);
  };

  const handleSaveBudget = () => {
    onUpdateBudget(project.id, {
      plannedHours: formPlannedHours,
      laborBudget: formLaborBudget,
      materialBudget: formMaterialBudget,
    });
    setIsBudgetModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Back button and breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Zurück zur Auftragsübersicht</span>
        </button>

        <span className="font-mono text-xs font-bold text-slate-500">
          {project.projektnummer || `ID #${project.id}`}
        </span>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider border border-amber-500/30">
                {project.status || 'In Arbeit'}
              </span>
              <span className="text-xs text-slate-400">{project.kunde || 'Privatkunde'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {project.displayName}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onStartBooking(project.id, 'Montage')}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Zeit stempeln</span>
            </button>
            {project.adresse && (
              <button
                onClick={openNavigationMap}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors border border-white/10"
              >
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span>Navigation</span>
              </button>
            )}
          </div>
        </div>

        {project.adresse && (
          <p className="flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{project.adresse}</span>
          </p>
        )}
      </div>

      {/* Navigation Segmented Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-x-auto">
        {[
          { id: 'overview', label: '1. Übersicht & Cockpit' },
          { id: 'field', label: '2. Baustelle & Doku' },
          { id: 'office', label: '3. Büro & Controlling' },
          { id: 'finish', label: '4. Abnahme & Abschluss' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Übersicht & Cockpit */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Geleistete Stunden
              </span>
              <div className="text-xl font-black text-slate-900 tabular-nums">
                {totalHoursWorked.toFixed(1)} h
              </div>
              <span className="text-[10px] text-slate-500">
                Soll: {currentBudget.plannedHours || 100} h
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Kosten bisher
              </span>
              <div className="text-xl font-black text-slate-900 tabular-nums">
                {totalActualCost.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </div>
              <span className="text-[10px] text-slate-500">Arbeit & Material</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Checkliste
              </span>
              <div className="text-xl font-black text-emerald-600 tabular-nums">
                {checklistDone} / {checklistTotal}
              </div>
              <span className="text-[10px] text-slate-500">
                {checklistTotal === checklistDone && checklistTotal > 0 ? 'Vollständig erledigt' : 'Punkte offen'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Rechnungswert
              </span>
              <div className="text-xl font-black text-blue-600 tabular-nums">
                {totalInvoicedNet.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </div>
              <span className="text-[10px] text-slate-500">{projectSales.length} Beleg(e)</span>
            </div>
          </div>

          {/* Quick Cockpit Shortcuts */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Baustellen-Cockpit (Häufigste Aktionen)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => onStartBooking(project.id, 'Montage')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-center gap-1.5"
              >
                <Clock className="h-5 w-5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Zeit stempeln</span>
                <span className="text-[10px] text-slate-400">Live Timer</span>
              </button>

              <button
                onClick={() => onNavigate('photos')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all text-center gap-1.5"
              >
                <Camera className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Foto aufnehmen</span>
                <span className="text-[10px] text-slate-400">{projectPhotos.length} Fotos</span>
              </button>

              <button
                onClick={() => setIsMaterialModalOpen(true)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 transition-all text-center gap-1.5"
              >
                <Boxes className="h-5 w-5 text-amber-600" />
                <span className="text-xs font-bold text-slate-800">Material buchen</span>
                <span className="text-[10px] text-slate-400">Aus Lager entnehmen</span>
              </button>

              <button
                onClick={() => onNavigate('journal')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 transition-all text-center gap-1.5"
              >
                <FileText className="h-5 w-5 text-purple-600" />
                <span className="text-xs font-bold text-slate-800">Rapport verfassen</span>
                <span className="text-[10px] text-slate-400">Tagesbericht</span>
              </button>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Kunden- & Auftragsdetails
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Kunde:</span>
                <span className="font-bold text-slate-800 text-sm">{project.kunde || 'Kein Kunde angegeben'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Auftragsnummer:</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {project.projektnummer || `A-${project.id}`}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Baustellenort:</span>
                <span className="font-medium text-slate-800">{project.adresse || 'Werkstatt / Depot'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Baustelle & Doku */}
      {activeTab === 'field' && (
        <div className="space-y-6">
          {/* Quality Checklist */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Qualitäts- & Ausführungs-Checkliste
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {checklistDone} von {checklistTotal} Punkten erfüllt
                </p>
              </div>
              <button
                onClick={() => setIsChecklistModalOpen(true)}
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                + Punkt hinzufügen
              </button>
            </div>

            <div className="space-y-2">
              {projectChecklist.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Noch keine Checklistenpunkte hinterlegt.</p>
              ) : (
                projectChecklist.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => onToggleChecklist(item.id)}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.isDone}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span
                        className={`text-xs font-medium ${
                          item.isDone ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>
                    {item.isDone && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        Erledigt
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Material Used on Site */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Verbautes Material auf der Baustelle
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gesamtwert: {totalMaterialCost.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <button
                onClick={() => setIsMaterialModalOpen(true)}
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                + Material buchen
              </button>
            </div>

            <div className="space-y-2">
              {projectMaterialsUsed.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Noch keine Materialbuchungen erfasst.</p>
              ) : (
                projectMaterialsUsed.map((pm: any) => (
                  <div
                    key={pm.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{pm.name}</span>
                      <span className="text-slate-500 text-[11px]">
                        {pm.quantity} {pm.unit} × {pm.unitPrice.toFixed(2)} €
                      </span>
                    </div>
                    <span className="font-mono font-bold text-amber-700">
                      {(pm.quantity * pm.unitPrice).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Büro & Controlling */}
      {activeTab === 'office' && (
        <div className="space-y-6">
          {/* Controlling Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Projektcontrolling & Deckungsbeitrag
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Echte Kosten vs. fakturierter Netto-Umsatz
                </p>
              </div>
              <button
                onClick={() => {
                  setFormPlannedHours(currentBudget.plannedHours || 100);
                  setFormLaborBudget(currentBudget.laborBudget || 5200);
                  setFormMaterialBudget(currentBudget.materialBudget || 3500);
                  setIsBudgetModalOpen(true);
                }}
                className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:underline"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Budgets anpassen</span>
              </button>
            </div>

            {/* Cost Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <span className="text-slate-500 block mb-1">Arbeitskosten (Lohn)</span>
                <span className="text-lg font-bold text-slate-900 block tabular-nums">
                  {totalLaborCost.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
                <span className="text-[10px] text-slate-500">
                  {totalHoursWorked.toFixed(1)} h gebucht
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <span className="text-slate-500 block mb-1">Materialkosten</span>
                <span className="text-lg font-bold text-slate-900 block tabular-nums">
                  {totalMaterialCost.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
                <span className="text-[10px] text-slate-500">Aus Lager entnommen</span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <span className="text-slate-500 block mb-1">Fahrt & Sonstiges</span>
                <span className="text-lg font-bold text-slate-900 block tabular-nums">
                  {totalOtherExpenses.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
                <span className="text-[10px] text-slate-500">Fahrtkosten & Belege</span>
              </div>
            </div>

            {/* Margin Calculation */}
            <div className="rounded-xl border border-slate-200 bg-slate-900 text-white p-5 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Fakturiertes Netto-Auftragsvolumen:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {totalInvoicedNet.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Gesamte Projektkosten (Arbeit + Material + Spesen):</span>
                <span className="font-mono font-bold text-red-400 text-sm">
                  - {totalActualCost.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Deckungsbeitrag (Gewinn)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Marge: <strong className={marginPercent >= 20 ? 'text-emerald-400' : 'text-amber-400'}>{marginPercent.toFixed(1)}%</strong>
                  </span>
                </div>
                <span
                  className={`text-xl font-black font-mono tabular-nums ${
                    contributionMargin >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {contributionMargin.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Abnahme & Abschluss */}
      {activeTab === 'finish' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Abschluss-Check & Abnahmestatus ({completionPercent}%)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vier Schritte bis zur mängelfreien Abrechnung
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  completionPercent === 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {completionPercent === 100 ? 'Bereit zum Abschluss' : 'In Bearbeitung'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      checklistDone === checklistTotal && checklistTotal > 0
                        ? 'text-emerald-600'
                        : 'text-slate-300'
                    }`}
                  />
                  <span>1. Qualitäts-Checkliste vollständig abgearbeitet ({checklistDone}/{checklistTotal})</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${!hasOpenDefects ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>2. Keine offenen Mängel oder Reklamationen</span>
                </div>
                {hasOpenDefects && <span className="text-red-600 font-bold">Mängel offen</span>}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${hasReport ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>3. Bautagesbericht / Rapport abgeschlossen</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${hasSignature ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>4. Digitale Kundenunterschrift erfasst ({projectSignatures.length})</span>
                </div>
                {!hasSignature && (
                  <button
                    onClick={() => setIsSignatureModalOpen(true)}
                    className="rounded bg-purple-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-purple-700"
                  >
                    Unterschrift erfassen
                  </button>
                )}
              </div>
            </div>

            {/* Display recorded signatures */}
            {projectSignatures.length > 0 && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Gespeicherte Freigaben:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projectSignatures.map((sig: any) => (
                    <div
                      key={sig.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-2"
                    >
                      <div className="flex justify-between items-center text-slate-500 text-[11px]">
                        <span>{sig.purpose}</span>
                        <span>{new Date(sig.signedAt).toLocaleDateString('de-DE')}</span>
                      </div>
                      <div className="font-bold text-slate-900">{sig.signerName}</div>
                      {sig.signatureDataUrl && (
                        <div className="rounded-lg bg-white p-2 border border-slate-200">
                          <img
                            src={sig.signatureDataUrl}
                            alt="Unterschrift"
                            className="max-h-16 mx-auto object-contain"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checklist Item Modal */}
      <Modal
        isOpen={isChecklistModalOpen}
        onClose={() => setIsChecklistModalOpen(false)}
        title="Checklistenpunkt hinzufügen"
        subtitle={project.displayName}
      >
        <form onSubmit={handleAddChecklist} className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Aufgabe / Prüfpunkt</label>
            <input
              type="text"
              required
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              placeholder="z. B. Silikonfugen auf Dichtigkeit prüfen"
              className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsChecklistModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-700"
            >
              Hinzufügen
            </button>
          </div>
        </form>
      </Modal>

      {/* Book Material Modal */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        title="Material auf Baustelle buchen"
        subtitle="Entnahme aus Materiallager mit automatischer Bestandsreduktion"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Materialartikel wählen</label>
            <select
              value={selectedMatId}
              onChange={(e) => setSelectedMatId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
            >
              {state.materials.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name} (Verfügbar: {m.stock} {m.unit} · {m.unitPrice.toFixed(2)} €/{m.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Menge</label>
            <input
              type="number"
              min="1"
              value={matQuantity}
              onChange={(e) => setMatQuantity(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsMaterialModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleBookMaterial}
              className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-700"
            >
              Jetzt entnehmen & buchen
            </button>
          </div>
        </div>
      </Modal>

      {/* Budget Modal */}
      <Modal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        title="Projektbudget & Controlling anpassen"
        subtitle={project.displayName}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Geplante Stunden (Soll)</label>
            <input
              type="number"
              value={formPlannedHours}
              onChange={(e) => setFormPlannedHours(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Lohnkosten-Budget (€)</label>
            <input
              type="number"
              value={formLaborBudget}
              onChange={(e) => setFormLaborBudget(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Material-Budget (€)</label>
            <input
              type="number"
              value={formMaterialBudget}
              onChange={(e) => setFormMaterialBudget(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleSaveBudget}
              className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-700"
            >
              Budgets speichern
            </button>
          </div>
        </div>
      </Modal>

      {/* Signature Modal */}
      <Modal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        title="Digitale Kundenunterschrift erfassen"
        subtitle={project.displayName}
      >
        <DigitalSignatureCanvas
          initialSignerName={project.kunde || ''}
          onSave={(signer, dataUrl) => {
            onSaveSignature(project.id, signer, dataUrl);
            setIsSignatureModalOpen(false);
          }}
          onCancel={() => setIsSignatureModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
