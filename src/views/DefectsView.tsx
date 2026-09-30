import React, { useState } from 'react';
import {
  OpsDefect,
  DefectSeverity,
  DefectStatus,
  ERPProject,
  OpsEmployee,
} from '../types/erp';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  Trash2,
  Camera,
  Search,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface DefectsViewProps {
  defects: OpsDefect[];
  projects: ERPProject[];
  employees: OpsEmployee[];
  onAddDefect: (defect: OpsDefect) => void;
  onUpdateDefect: (defect: OpsDefect) => void;
  onDeleteDefect: (id: string) => void;
}

export const DefectsView: React.FC<DefectsViewProps> = ({
  defects,
  projects,
  employees,
  onAddDefect,
  onUpdateDefect,
  onDeleteDefect,
}) => {
  const [statusFilter, setStatusFilter] = useState<DefectStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<OpsDefect | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formProjectId, setFormProjectId] = useState<number>(projects[0]?.id || 1);
  const [formKind, setFormKind] = useState<'Mangel' | 'Reklamation'>('Mangel');
  const [formCategory, setFormCategory] = useState('Ausführung');
  const [formSeverity, setFormSeverity] = useState<DefectSeverity>('Mittel');
  const [formStatus, setFormStatus] = useState<DefectStatus>('Offen');
  const [formDueDate, setFormDueDate] = useState(
    new Date(Date.now() + 3 * 86400 * 1000).toISOString().split('T')[0]
  );
  const [formResponsible, setFormResponsible] = useState<string>(employees[0]?.id || '');
  const [formCustomerVisible, setFormCustomerVisible] = useState(true);

  const filteredDefects = defects.filter((d) => {
    if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const proj = projects.find((p) => p.id === d.projectId);
      return (
        d.title.toLowerCase().includes(q) ||
        d.details.toLowerCase().includes(q) ||
        (proj && proj.displayName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const openNewModal = () => {
    setEditingDefect(null);
    setFormTitle('');
    setFormDetails('');
    setFormProjectId(projects[0]?.id || 1);
    setFormKind('Mangel');
    setFormCategory('Ausführung');
    setFormSeverity('Mittel');
    setFormStatus('Offen');
    setFormDueDate(new Date(Date.now() + 3 * 86400 * 1000).toISOString().split('T')[0]);
    setFormResponsible(employees[0]?.id || '');
    setFormCustomerVisible(true);
    setIsModalOpen(true);
  };

  const openEditModal = (d: OpsDefect) => {
    setEditingDefect(d);
    setFormTitle(d.title);
    setFormDetails(d.details);
    setFormProjectId(d.projectId);
    setFormKind(d.kind);
    setFormCategory(d.category);
    setFormSeverity(d.severity);
    setFormStatus(d.status);
    setFormDueDate(d.dueDate.split('T')[0]);
    setFormResponsible(d.responsibleEmployeeId || '');
    setFormCustomerVisible(d.customerVisible);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingDefect) {
      onUpdateDefect({
        ...editingDefect,
        title: formTitle.trim(),
        details: formDetails.trim(),
        projectId: formProjectId,
        kind: formKind,
        category: formCategory,
        severity: formSeverity,
        status: formStatus,
        dueDate: new Date(formDueDate).toISOString(),
        responsibleEmployeeId: formResponsible || undefined,
        customerVisible: formCustomerVisible,
      });
    } else {
      onAddDefect({
        id: `def-${Date.now()}`,
        title: formTitle.trim(),
        details: formDetails.trim(),
        projectId: formProjectId,
        kind: formKind,
        category: formCategory,
        severity: formSeverity,
        status: formStatus,
        createdAt: new Date().toISOString(),
        dueDate: new Date(formDueDate).toISOString(),
        responsibleEmployeeId: formResponsible || undefined,
        customerVisible: formCustomerVisible,
        photoDataUrls: [],
      });
    }

    setIsModalOpen(false);
  };

  const advanceStatus = (defect: OpsDefect) => {
    const next: Record<DefectStatus, DefectStatus> = {
      Offen: 'In Bearbeitung',
      'In Bearbeitung': 'Behoben',
      Behoben: 'Abgeschlossen',
      Abgeschlossen: 'Offen',
    };
    onUpdateDefect({
      ...defect,
      status: next[defect.status] || 'Offen',
      resolvedAt: defect.status === 'In Bearbeitung' ? new Date().toISOString() : defect.resolvedAt,
    });
  };

  const getSeverityBadge = (s: DefectSeverity) => {
    switch (s) {
      case 'Kritisch':
        return 'bg-red-600 text-white font-black';
      case 'Hoch':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Mittel':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Niedrig':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusBadge = (s: DefectStatus) => {
    switch (s) {
      case 'Offen':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'In Bearbeitung':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Behoben':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Abgeschlossen':
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
            Qualitätssicherung & Nachbesserung
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Mängel & Reklamationen ({defects.length})
          </h1>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>+ Mangel erfassen</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Titel, Beschreibung oder Baustelle suchen …"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {(['ALL', 'Offen', 'In Bearbeitung', 'Behoben', 'Abgeschlossen'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1 font-semibold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? 'Alle' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Defects List */}
      <div className="space-y-3">
        {filteredDefects.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-40 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-600">Keine Mängel gefunden</p>
            <p className="text-xs text-slate-400 mt-1">
              Hervorragend! Für die gewählten Filter liegen keine Beanstandungen vor.
            </p>
          </div>
        ) : (
          filteredDefects.map((def) => {
            const project = projects.find((p) => p.id === def.projectId);
            const employee = employees.find((e) => e.id === def.responsibleEmployeeId);
            const isOverdue =
              new Date(def.dueDate) < new Date() && def.status !== 'Behoben' && def.status !== 'Abgeschlossen';

            return (
              <div
                key={def.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${getSeverityBadge(
                          def.severity
                        )}`}
                      >
                        {def.severity}
                      </span>
                      <span className="text-xs font-bold text-slate-400">· {def.category}</span>
                    </div>

                    <h3
                      onClick={() => openEditModal(def)}
                      className="font-bold text-sm text-slate-900 hover:text-amber-600 cursor-pointer"
                    >
                      {def.title}
                    </h3>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Auftrag: <strong>{project?.displayName || `#${def.projectId}`}</strong></span>
                      {employee && <span>· Verantwortlich: <strong>{employee.name}</strong></span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => advanceStatus(def)}
                      className={`rounded-full px-3 py-1 text-xs font-bold border transition-colors shadow-2xs ${getStatusBadge(
                        def.status
                      )}`}
                    >
                      Status: {def.status} ➔
                    </button>
                    <button
                      onClick={() => onDeleteDefect(def.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {def.details && (
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    {def.details}
                  </p>
                )}

                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      Frist:{' '}
                      <strong className={isOverdue ? 'text-red-600 font-bold' : 'text-slate-700'}>
                        {new Date(def.dueDate).toLocaleDateString('de-DE')}
                        {isOverdue && ' (Überfällig!)'}
                      </strong>
                    </span>
                  </div>

                  <span className="text-slate-400 text-[10px]">
                    Erfasst am {new Date(def.createdAt).toLocaleDateString('de-DE')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDefect ? 'Mangel bearbeiten' : 'Neuen Mangel / Beanstandung erfassen'}
        subtitle="Dokumentation mit Schweregrad, Fristsetzung und verantwortlicher Person"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Mangelbezeichnung / Kurztitel *</label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="z. B. Spaltmaß Türzarge ungleichmäßig"
              className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Auftrag / Baustelle</label>
              <select
                value={formProjectId}
                onChange={(e) => setFormProjectId(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Art</label>
              <select
                value={formKind}
                onChange={(e) => setFormKind(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
              >
                <option value="Mangel">Mangel</option>
                <option value="Reklamation">Kunden-Reklamation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Schweregrad</label>
              <select
                value={formSeverity}
                onChange={(e) => setFormSeverity(e.target.value as DefectSeverity)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white font-bold"
              >
                <option value="Niedrig">Niedrig</option>
                <option value="Mittel">Mittel</option>
                <option value="Hoch">Hoch</option>
                <option value="Kritisch">Kritisch</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Kategorie</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
              >
                <option value="Ausführung">Ausführung</option>
                <option value="Material">Material</option>
                <option value="Planung">Planung</option>
                <option value="Sicherheit">Sicherheit</option>
                <option value="Kundendienst">Kundendienst</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Behebungsfrist</label>
              <input
                type="date"
                required
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Verantwortlicher Mitarbeiter</label>
            <select
              value={formResponsible}
              onChange={(e) => setFormResponsible(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
            >
              <option value="">Nicht zugewiesen</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Mängelbeschreibung & Abhilfe</label>
            <textarea
              rows={3}
              value={formDetails}
              onChange={(e) => setFormDetails(e.target.value)}
              placeholder="Welche Mängel liegen vor und welche Maßnahmen sind zur Behebung erforderlich?"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-700"
            >
              Mangel speichern
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
