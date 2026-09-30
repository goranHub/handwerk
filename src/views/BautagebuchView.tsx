import React, { useState } from 'react';
import {
  ERPProject,
  OpsDailyReport,
  OpsEmployee,
} from '../types/erp';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  Camera,
  User,
  MapPin,
  AlertCircle,
  Truck,
  Wrench,
  Search,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface BautagebuchViewProps {
  projects: ERPProject[];
  reports: OpsDailyReport[];
  employees: OpsEmployee[];
  onAddReport: (report: OpsDailyReport) => void;
  onSelectProject: (projectId: number) => void;
}

export const BautagebuchView: React.FC<BautagebuchViewProps> = ({
  projects,
  reports,
  employees,
  onAddReport,
  onSelectProject,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // New report form states
  const [formProjectId, setFormProjectId] = useState<number>(projects[0]?.id || 1);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEmployeeId, setFormEmployeeId] = useState<string>(employees[0]?.id || '');
  const [formWorkDesc, setFormWorkDesc] = useState('');
  const [formObstacles, setFormObstacles] = useState('');
  const [formHours, setFormHours] = useState(8.0);
  const [formMaterial, setFormMaterial] = useState('');
  const [formMachines, setFormMachines] = useState('');
  const [formVehicles, setFormVehicles] = useState('');

  const filteredReports = reports.filter((r) => {
    if (selectedProjectId !== 'ALL' && r.projectId !== selectedProjectId) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const proj = projects.find((p) => p.id === r.projectId);
      return (
        r.workDescription.toLowerCase().includes(q) ||
        (proj && proj.displayName.toLowerCase().includes(q)) ||
        (r.obstacles && r.obstacles.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formWorkDesc.trim()) return;

    onAddReport({
      id: `rep-${Date.now()}`,
      projectId: formProjectId,
      date: formDate,
      employeeId: formEmployeeId || undefined,
      workDescription: formWorkDesc.trim(),
      obstacles: formObstacles.trim(),
      timeHours: formHours,
      material: formMaterial.trim(),
      machines: formMachines.trim(),
      vehicles: formVehicles.trim(),
    });

    setFormWorkDesc('');
    setFormObstacles('');
    setIsReportModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
            Baustellendokumentation & Nachweis
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Bautagebuch & Bautagesberichte
          </h1>
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>+ Neuen Tagesbericht verfassen</span>
        </button>
      </div>

      {/* Filter and Project Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tätigkeit, Behinderung oder Baustelle suchen …"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Auftrag:</span>
          <select
            value={selectedProjectId}
            onChange={(e) =>
              setSelectedProjectId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
            }
            className="rounded-xl border border-slate-200 bg-slate-50 p-1.5 font-semibold text-slate-800 text-xs"
          >
            <option value="ALL">Alle Baustellen ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports Timeline */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
            <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-sm font-semibold text-slate-600">Keine Bautagesberichte gefunden</p>
            <p className="text-xs text-slate-400 mt-1">
              Erfasse Arbeitsfortschritt, Hindernisse und Maschinen für die Baustelle.
            </p>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
            >
              + Ersten Bericht erfassen
            </button>
          </div>
        ) : (
          filteredReports.map((rep) => {
            const project = projects.find((p) => p.id === rep.projectId);
            const employee = employees.find((e) => e.id === rep.employeeId);

            return (
              <div
                key={rep.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">
                      {project?.name?.charAt(0) || 'B'}
                    </span>
                    <div>
                      <button
                        onClick={() => onSelectProject(rep.projectId)}
                        className="font-bold text-sm text-slate-900 hover:text-amber-600 text-left block"
                      >
                        {project?.displayName || `Auftrag #${rep.projectId}`}
                      </button>
                      <span className="text-[11px] text-slate-500">
                        {employee ? `Erstellt von ${employee.name} (${employee.role})` : 'Mitarbeiter'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 font-semibold text-slate-700">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{new Date(rep.date).toLocaleDateString('de-DE')}</span>
                    </div>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono font-bold text-emerald-700 border border-emerald-200">
                      {rep.timeHours} Std.
                    </span>
                  </div>
                </div>

                {/* Work Description */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Ausgeführte Arbeiten
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                    {rep.workDescription}
                  </p>
                </div>

                {/* Obstacles if any */}
                {rep.obstacles && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 flex items-start gap-2 text-xs text-amber-900">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Behinderungen / Erschwernisse:</span>
                      <p className="text-[11px] text-amber-800 mt-0.5">{rep.obstacles}</p>
                    </div>
                  </div>
                )}

                {/* Resources: Material, Machines, Vehicles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-600">
                  {rep.material && (
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-slate-700 shrink-0">Material:</span>
                      <span className="text-slate-500">{rep.material}</span>
                    </div>
                  )}
                  {rep.machines && (
                    <div className="flex items-start gap-1.5">
                      <Wrench className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-500">{rep.machines}</span>
                    </div>
                  )}
                  {rep.vehicles && (
                    <div className="flex items-start gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-500">{rep.vehicles}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Daily Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Neuen Bautagesbericht (Rapport) erstellen"
        subtitle="Vollständige Baudokumentation für Kunde, Architekt und Abrechnung"
      >
        <form onSubmit={handleSaveReport} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Baustelle / Auftrag *</label>
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
              <label className="mb-1 block font-semibold text-slate-700">Mitarbeiter / Berichterstatter</label>
              <select
                value={formEmployeeId}
                onChange={(e) => setFormEmployeeId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Datum des Arbeitstages</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Arbeitszeit (Stunden)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={formHours}
                onChange={(e) => setFormHours(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Ausgeführte Arbeiten *</label>
            <textarea
              rows={3}
              required
              value={formWorkDesc}
              onChange={(e) => setFormWorkDesc(e.target.value)}
              placeholder="Welche Leistungen und Arbeitsschritte wurden heute fertiggestellt?"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Behinderungen / Erschwernisse / Witterung</label>
            <input
              type="text"
              value={formObstacles}
              onChange={(e) => setFormObstacles(e.target.value)}
              placeholder="z. B. Starkregen, Vorleistung anderer Gewerke nicht fertig ..."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Material</label>
              <input
                type="text"
                value={formMaterial}
                onChange={(e) => setFormMaterial(e.target.value)}
                placeholder="Verbaute Baustoffe"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Maschinen</label>
              <input
                type="text"
                value={formMachines}
                onChange={(e) => setFormMachines(e.target.value)}
                placeholder="Geräte & Werkzeuge"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Fahrzeuge</label>
              <input
                type="text"
                value={formVehicles}
                onChange={(e) => setFormVehicles(e.target.value)}
                placeholder="z. B. Sprinter M-ER 2025"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-700"
            >
              Tagesbericht speichern
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
