import React, { useState } from 'react';
import {
  OpsEmployee,
  OpsAbsence,
  OpsAbsenceKind,
} from '../types/erp';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Calendar,
  Check,
  X,
  Trash2,
  Clock,
  Sun,
  Cross,
  UserCheck,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface TeamViewProps {
  employees: OpsEmployee[];
  absences: OpsAbsence[];
  onAddEmployee: (emp: OpsEmployee) => void;
  onUpdateEmployee: (emp: OpsEmployee) => void;
  onDeleteEmployee: (id: string) => void;
  onAddAbsence: (abs: OpsAbsence) => void;
  onApproveAbsence: (id: string) => void;
  onRejectAbsence: (id: string) => void;
  onDeleteAbsence: (id: string) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({
  employees,
  absences,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onAddAbsence,
  onApproveAbsence,
  onRejectAbsence,
  onDeleteAbsence,
}) => {
  const [tab, setTab] = useState<'employees' | 'absences'>('employees');

  // Modals
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isAbsModalOpen, setIsAbsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<OpsEmployee | null>(null);

  // Employee Form State
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('Monteur');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRate, setFormRate] = useState(52.0);
  const [formTargetHours, setFormTargetHours] = useState(8.0);
  const [formNightSurcharge, setFormNightSurcharge] = useState(25);
  const [formBirthDate, setFormBirthDate] = useState('1990-01-01');

  // Absence Form State
  const [absEmpId, setAbsEmpId] = useState(employees[0]?.id || '');
  const [absKind, setAbsKind] = useState<OpsAbsenceKind>('Urlaub');
  const [absStart, setAbsStart] = useState(new Date().toISOString().split('T')[0]);
  const [absEnd, setAbsEnd] = useState(new Date().toISOString().split('T')[0]);
  const [absNote, setAbsNote] = useState('');

  const openNewEmployee = () => {
    setEditingEmp(null);
    setFormName('');
    setFormRole('Facharbeiter / Monteur');
    setFormPhone('+49 170 1234567');
    setFormEmail('');
    setFormRate(52.0);
    setFormTargetHours(8.0);
    setFormNightSurcharge(25);
    setFormBirthDate('1990-01-01');
    setIsEmpModalOpen(true);
  };

  const openEditEmployee = (emp: OpsEmployee) => {
    setEditingEmp(emp);
    setFormName(emp.name);
    setFormRole(emp.role);
    setFormPhone(emp.phone);
    setFormEmail(emp.email);
    setFormRate(emp.hourlyCostRate || 52.0);
    setFormTargetHours(emp.dailyTargetHours || 8.0);
    setFormNightSurcharge(emp.nightSurchargePercent || 25);
    setFormBirthDate(emp.birthDate || '1990-01-01');
    setIsEmpModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingEmp) {
      onUpdateEmployee({
        ...editingEmp,
        name: formName.trim(),
        role: formRole.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        hourlyCostRate: formRate,
        dailyTargetHours: formTargetHours,
        nightSurchargePercent: formNightSurcharge,
        birthDate: formBirthDate,
      });
    } else {
      onAddEmployee({
        id: `emp-${Date.now()}`,
        name: formName.trim(),
        role: formRole.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        hourlyCostRate: formRate,
        dailyTargetHours: formTargetHours,
        nightSurchargePercent: formNightSurcharge,
        birthDate: formBirthDate,
      });
    }

    setIsEmpModalOpen(false);
  };

  const handleSaveAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!absEmpId) return;

    onAddAbsence({
      id: `abs-${Date.now()}`,
      employeeId: absEmpId,
      kind: absKind,
      start: absStart,
      end: absEnd,
      note: absNote.trim(),
      approved: false,
    });

    setIsAbsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
            Personal, Stundensätze & Urlaubsplaner
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Mitarbeiter & Abwesenheiten
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAbsModalOpen(true)}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
          >
            + Urlaub / Krankmeldung
          </button>
          <button
            onClick={openNewEmployee}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Mitarbeiter anlegen</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl max-w-sm text-xs">
        <button
          onClick={() => setTab('employees')}
          className={`flex-1 py-1.5 px-3 font-bold rounded-lg transition-all ${
            tab === 'employees' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Mitarbeiterstamm ({employees.length})
        </button>
        <button
          onClick={() => setTab('absences')}
          className={`flex-1 py-1.5 px-3 font-bold rounded-lg transition-all ${
            tab === 'absences' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Abwesenheiten ({absences.length})
        </button>
      </div>

      {/* Tab 1: Mitarbeiterstamm */}
      {tab === 'employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-800 font-bold text-sm border border-teal-100">
                      {emp.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{emp.name}</h3>
                      <span className="text-xs text-slate-500">{emp.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditEmployee(emp)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Mitarbeiter ${emp.name} löschen?`)) onDeleteEmployee(emp.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <a href={`tel:${emp.phone}`} className="hover:underline">
                        {emp.phone}
                      </a>
                    </div>
                  )}
                  {emp.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <a href={`mailto:${emp.email}`} className="hover:underline">
                        {emp.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Rates and Targets */}
              <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Stundensatz
                  </span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">
                    {(emp.hourlyCostRate || 52).toFixed(2)} €/h
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Sollzeit / Tag
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {emp.dailyTargetHours || 8.0} h
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Abwesenheiten (Urlaub / Krank) */}
      {tab === 'absences' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Urlaubsanträge & Krankmeldungen ({absences.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Genehmigte Tage fließen automatisch in das Stundenkonto und den Kalender ein.
              </p>
            </div>
            <button
              onClick={() => setIsAbsModalOpen(true)}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
            >
              + Antrag erfassen
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {absences.length === 0 ? (
              <div className="py-12 text-center text-slate-400">Keine Abwesenheiten eingetragen.</div>
            ) : (
              absences.map((abs) => {
                const emp = employees.find((e) => e.id === abs.employeeId);
                return (
                  <div
                    key={abs.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{emp?.name || 'Mitarbeiter'}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            abs.kind === 'Krank'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {abs.kind}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            abs.rejected
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : abs.approved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {abs.rejected ? 'Abgelehnt' : abs.approved ? 'Genehmigt' : 'Beantragt'}
                        </span>
                      </div>

                      <div className="text-slate-500 text-[11px] flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {new Date(abs.start).toLocaleDateString('de-DE')} bis{' '}
                          {new Date(abs.end).toLocaleDateString('de-DE')}
                        </span>
                        {abs.note && <span>· "{abs.note}"</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!abs.approved && !abs.rejected && (
                        <>
                          <button
                            onClick={() => onApproveAbsence(abs.id)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700 shadow-2xs"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Genehmigen</span>
                          </button>
                          <button
                            onClick={() => onRejectAbsence(abs.id)}
                            className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 font-bold text-red-700 hover:bg-red-100"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Ablehnen</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onDeleteAbsence(abs.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Employee Modal */}
      <Modal
        isOpen={isEmpModalOpen}
        onClose={() => setIsEmpModalOpen(false)}
        title={editingEmp ? 'Mitarbeiter bearbeiten' : 'Neuen Mitarbeiter anlegen'}
        subtitle="Rolle, Kostensätze, Nachtzuschläge und Sollstunden verwalten"
      >
        <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Vor- und Nachname *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="z. B. Max Mustermann"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Rolle / Qualifikation</label>
              <input
                type="text"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                placeholder="z. B. Meister, Geselle, Azubi"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Telefonnummer</label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+49 170 ..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">E-Mail</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="mitarbeiter@example.de"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Stundensatz (€ / h)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formRate}
                onChange={(e) => setFormRate(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Sollstunden / Tag</label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={formTargetHours}
                onChange={(e) => setFormTargetHours(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Nachtzuschlag (%)</label>
              <input
                type="number"
                value={formNightSurcharge}
                onChange={(e) => setFormNightSurcharge(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEmpModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-700"
            >
              Mitarbeiter sichern
            </button>
          </div>
        </form>
      </Modal>

      {/* Absence Modal */}
      <Modal
        isOpen={isAbsModalOpen}
        onClose={() => setIsAbsModalOpen(false)}
        title="Abwesenheit erfassen"
        subtitle="Urlaubsantrag oder Krankmeldung eintragen"
      >
        <form onSubmit={handleSaveAbsence} className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Mitarbeiter *</label>
            <select
              value={absEmpId}
              onChange={(e) => setAbsEmpId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Art der Abwesenheit</label>
            <select
              value={absKind}
              onChange={(e) => setAbsKind(e.target.value as OpsAbsenceKind)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
            >
              <option value="Urlaub">Erholungsurlaub</option>
              <option value="Krank">Krankmeldung (Arbeitsunfähig)</option>
              <option value="Fortbildung">Schulung & Fortbildung</option>
              <option value="Zeitausgleich">Zeitausgleich / Überstundenabbau</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Beginn (Erster Tag)</label>
              <input
                type="date"
                required
                value={absStart}
                onChange={(e) => setAbsStart(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Ende (Letzter Tag)</label>
              <input
                type="date"
                required
                value={absEnd}
                onChange={(e) => setAbsEnd(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Begründung / Anmerkung</label>
            <input
              type="text"
              value={absNote}
              onChange={(e) => setAbsNote(e.target.value)}
              placeholder="z. B. Urlaub genehmigt oder AU liegt vor"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAbsModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-700"
            >
              Antrag einreichen
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
