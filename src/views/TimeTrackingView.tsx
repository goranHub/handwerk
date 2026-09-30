import React, { useState } from 'react';
import {
  ActiveBooking,
  TimeEntrySummary,
  ERPProject,
  WorkStep,
  WorkCategory,
  OpsEmployee,
  OpsAbsence,
} from '../types/erp';
import {
  Timer,
  Play,
  Pause,
  Square,
  Plus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Car,
  Trash2,
  Edit2,
  CheckCircle,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface TimeTrackingViewProps {
  activeBooking: ActiveBooking;
  timeEntries: TimeEntrySummary[];
  projects: ERPProject[];
  steps: WorkStep[];
  categories: WorkCategory[];
  employees: OpsEmployee[];
  absences: OpsAbsence[];
  onStartBooking: (projectId: number, stepName: string, employeeId?: string) => void;
  onPauseResumeBooking: () => void;
  onStopBooking: () => void;
  onAddManualEntry: (entry: Omit<TimeEntrySummary, 'id'>) => void;
  onUpdateManualEntry: (entry: TimeEntrySummary) => void;
  onDeleteManualEntry: (id: string) => void;
}

export const TimeTrackingView: React.FC<TimeTrackingViewProps> = ({
  activeBooking,
  timeEntries,
  projects,
  steps,
  categories,
  employees,
  absences,
  onStartBooking,
  onPauseResumeBooking,
  onStopBooking,
  onAddManualEntry,
  onUpdateManualEntry,
  onDeleteManualEntry,
}) => {
  const [activeTab, setActiveTab] = useState<'punch' | 'calendar' | 'history'>('punch');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntrySummary | null>(null);

  // Live selection
  const [selectedProjectId, setSelectedProjectId] = useState<number>(projects[0]?.id || 1);
  const [selectedStep, setSelectedStep] = useState<string>(steps[0]?.name || 'Montage');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || '');

  // Manual entry modal form state
  const [formProjectId, setFormProjectId] = useState<number>(projects[0]?.id || 1);
  const [formStep, setFormStep] = useState<string>(steps[0]?.name || 'Montage');
  const [formEmployeeId, setFormEmployeeId] = useState<string>(employees[0]?.id || '');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStartTime, setFormStartTime] = useState('07:30');
  const [formEndTime, setFormEndTime] = useState('16:30');
  const [formPauseMin, setFormPauseMin] = useState(30);
  const [formTravelMin, setFormTravelMin] = useState(0);
  const [formComment, setFormComment] = useState('');

  // Calendar month state
  const [calendarDate, setCalendarDate] = useState(new Date());

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId) || employees[0];

  const handleOpenNewEntry = () => {
    setEditingEntry(null);
    setFormProjectId(projects[0]?.id || 1);
    setFormStep(steps[0]?.name || 'Montage');
    setFormEmployeeId(employees[0]?.id || '');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormStartTime('07:30');
    setFormEndTime('16:30');
    setFormPauseMin(30);
    setFormTravelMin(0);
    setFormComment('');
    setIsManualModalOpen(true);
  };

  const handleOpenEditEntry = (entry: TimeEntrySummary) => {
    setEditingEntry(entry);
    setFormProjectId(entry.projectId);
    setFormStep(entry.workStepName);
    setFormEmployeeId(entry.employeeId || employees[0]?.id || '');
    const startD = new Date(entry.startedAt);
    const endD = new Date(entry.endedAt);
    setFormStartDate(startD.toISOString().split('T')[0]);
    setFormStartTime(startD.toTimeString().substring(0, 5));
    setFormEndTime(endD.toTimeString().substring(0, 5));
    setFormPauseMin(Math.round((entry.pauseSeconds || 0) / 60));
    setFormTravelMin(Math.round((entry.travelSeconds || 0) / 60));
    setFormComment(entry.comment || '');
    setIsManualModalOpen(true);
  };

  const handleSaveManual = () => {
    const proj = projects.find((p) => p.id === formProjectId);
    const emp = employees.find((e) => e.id === formEmployeeId);
    const startIso = new Date(`${formStartDate}T${formStartTime}:00`).toISOString();
    const endIso = new Date(`${formStartDate}T${formEndTime}:00`).toISOString();

    if (new Date(endIso) <= new Date(startIso)) {
      alert('Endzeit muss nach der Startzeit liegen!');
      return;
    }

    const payload = {
      projectId: formProjectId,
      projectName: proj?.displayName || `Auftrag #${formProjectId}`,
      workStepName: formStep,
      startedAt: startIso,
      endedAt: endIso,
      pauseSeconds: formPauseMin * 60,
      travelSeconds: formTravelMin * 60,
      comment: formComment,
      employeeId: emp?.id,
      employeeName: emp?.name,
      hourlyCostRate: emp?.hourlyCostRate || 52,
    };

    if (editingEntry) {
      onUpdateManualEntry({ ...payload, id: editingEntry.id });
    } else {
      onAddManualEntry(payload);
    }

    setIsManualModalOpen(false);
  };

  // Calendar generation helpers
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDay.getDate();

  const changeMonth = (delta: number) => {
    setCalendarDate(new Date(year, month + delta, 1));
  };

  const selectedCalEmployee = employees.find((e) => e.id === formEmployeeId) || employees[0];
  const targetHoursPerDay = selectedCalEmployee?.dailyTargetHours || 8.0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
            Mobile Stempeluhr & Kalender
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Zeiterfassung & Arbeitszeiten
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNewEntry}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Nachtrag erfassen</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('punch')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'punch' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Live Stempeluhr
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Monatskalender
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Buchungsjournal ({timeEntries.length})
        </button>
      </div>

      {/* View: Live Punch Clock */}
      {activeTab === 'punch' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Stempeluhr Card */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Live Arbeitszeit stempeln
                </h3>
              </div>
              {activeBooking.aktiv && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 animate-pulse">
                  AKTIV
                </span>
              )}
            </div>

            {activeBooking.aktiv ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-4">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                    Aktueller Auftrag
                  </span>
                  <h4 className="text-xl font-bold text-slate-900">
                    {activeBooking.projektName}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tätigkeit: <span className="font-semibold">{activeBooking.arbeitsgangName}</span> · Mitarbeiter: {activeBooking.employeeName || 'Max Mustermann'}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={onPauseResumeBooking}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-xs"
                  >
                    {activeBooking.pausiert ? (
                      <>
                        <Play className="h-4 w-4 fill-current text-emerald-600" />
                        <span>Arbeit fortsetzen</span>
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4 fill-current text-amber-600" />
                        <span>Pause stempeln</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={onStopBooking}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-xs"
                  >
                    <Square className="h-4 w-4 fill-current" />
                    <span>Feierabend / Beenden</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">Mitarbeiter</label>
                    <select
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">Auftrag / Baustelle</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.displayName} ({p.projektnummer || `#${p.id}`})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Tätigkeit / Arbeitsgang</label>
                  <div className="flex flex-wrap gap-2">
                    {steps.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStep(st.name || 'Montage')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          selectedStep === st.name
                            ? 'bg-amber-600 text-white font-bold'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {st.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onStartBooking(selectedProjectId, selectedStep, selectedEmployeeId)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-colors"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Jetzt Zeiterfassung starten</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Cost rates & info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mitarbeiter Kostensatz
            </h4>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Mitarbeiter:</span>
                <span className="font-bold text-slate-900">{selectedEmployee.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Rolle:</span>
                <span className="text-slate-700">{selectedEmployee.role}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Sollstunden / Tag:</span>
                <span className="font-semibold text-slate-800">{selectedEmployee.dailyTargetHours || 8.0} h</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                <span className="text-slate-700 font-semibold">Stundensatz:</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">
                  {(selectedEmployee.hourlyCostRate || 52).toFixed(2)} €/h
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Arbeitszeiten werden exakt erfasst und fließen automatisch in das Projektcontrolling ein.
            </p>
          </div>
        </div>
      )}

      {/* View: Arbeitszeit-Kalender (Month View) */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-base font-bold text-slate-900">
                {calendarDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => changeMonth(1)}
                className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Mitarbeiter:</span>
              <select
                value={formEmployeeId}
                onChange={(e) => setFormEmployeeId(e.target.value)}
                className="rounded-lg border border-slate-300 p-1.5 font-semibold text-slate-800"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 min-w-[500px]">
              {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => (
                <div key={d} className="text-center font-bold text-xs text-slate-400 py-1">
                  {d}
                </div>
              ))}

              {/* Leading empty days */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20 rounded-xl bg-slate-50/40 border border-transparent" />
              ))}

              {/* Month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayEntries = timeEntries.filter((te) => te.startedAt.startsWith(dStr));
                const totalHours = dayEntries.reduce((sum, te) => {
                  const sec = (new Date(te.endedAt).getTime() - new Date(te.startedAt).getTime()) / 1000 - (te.pauseSeconds || 0);
                  return sum + Math.max(0, sec / 3600);
                }, 0);

                const isWeekend = (startDayOfWeek + i) % 7 >= 5;
                const isOvertime = totalHours > targetHoursPerDay;
                const isUnder = !isWeekend && totalHours > 0 && totalHours < targetHoursPerDay;

                return (
                  <div
                    key={dayNum}
                    className={`h-22 rounded-xl p-2 border flex flex-col justify-between transition-colors ${
                      isWeekend
                        ? 'bg-slate-50/70 border-slate-100 text-slate-400'
                        : totalHours > 0
                        ? isOvertime
                          ? 'bg-amber-50/60 border-amber-200'
                          : 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span>{dayNum}</span>
                      {totalHours > 0 && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                            isOvertime
                              ? 'bg-amber-500 text-white'
                              : isUnder
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {totalHours.toFixed(1)} h
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-500 truncate">
                      {dayEntries.length > 0 ? (
                        <span>{dayEntries[0].projectName.substring(0, 14)}…</span>
                      ) : (
                        <span className="text-slate-300">--</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* View: Buchungsjournal (History) */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Erfasste Zeitbuchungen ({timeEntries.length})
            </h3>
            <button
              onClick={handleOpenNewEntry}
              className="text-xs font-semibold text-amber-600 hover:underline"
            >
              + Neuer Nachtrag
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {timeEntries.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Noch keine Zeitbuchungen vorhanden.
              </div>
            ) : (
              timeEntries.map((te) => {
                const durHours =
                  ((new Date(te.endedAt).getTime() - new Date(te.startedAt).getTime()) / 1000 -
                    (te.pauseSeconds || 0)) /
                  3600;

                return (
                  <div
                    key={te.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{te.projectName}</span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {te.workStepName}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>{new Date(te.startedAt).toLocaleDateString('de-DE')}</span>
                        <span>·</span>
                        <span>
                          {new Date(te.startedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(te.endedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {te.pauseSeconds && te.pauseSeconds > 0 && (
                          <>
                            <span>·</span>
                            <span>Pause: {Math.round(te.pauseSeconds / 60)} Min.</span>
                          </>
                        )}
                        {te.travelSeconds && te.travelSeconds > 0 && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-blue-600">
                              <Car className="h-3 w-3" />
                              <span>{Math.round(te.travelSeconds / 60)} Min. Fahrt</span>
                            </span>
                          </>
                        )}
                      </div>
                      {te.comment && <p className="text-xs text-slate-600 italic">"{te.comment}"</p>}
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-600 text-sm">
                          {durHours.toFixed(2)} h
                        </div>
                        {te.hourlyCostRate && (
                          <div className="text-[11px] text-slate-400">
                            {(durHours * te.hourlyCostRate).toLocaleString('de-DE', {
                              style: 'currency',
                              currency: 'EUR',
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditEntry(te)}
                          className="rounded p-1 text-slate-400 hover:text-slate-700"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteManualEntry(te.id)}
                          className="rounded p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title={editingEntry ? 'Arbeitszeit bearbeiten' : 'Arbeitszeit eintragen (Nachtrag)'}
        subtitle="Beginn, Ende, Pausen und Baustelle angeben"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Auftrag / Baustelle</label>
            <select
              value={formProjectId}
              onChange={(e) => setFormProjectId(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName} ({p.projektnummer || `#${p.id}`})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Mitarbeiter</label>
              <select
                value={formEmployeeId}
                onChange={(e) => setFormEmployeeId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-700">Tätigkeit / Arbeitsgang</label>
              <select
                value={formStep}
                onChange={(e) => setFormStep(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              >
                {steps.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Datum</label>
            <input
              type="date"
              value={formStartDate}
              onChange={(e) => setFormStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Beginn Uhrzeit</label>
              <input
                type="time"
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Ende Uhrzeit</label>
              <input
                type="time"
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Pause (Minuten)</label>
              <input
                type="number"
                min="0"
                step="5"
                value={formPauseMin}
                onChange={(e) => setFormPauseMin(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Fahrzeit (Minuten)</label>
              <input
                type="number"
                min="0"
                step="5"
                value={formTravelMin}
                onChange={(e) => setFormTravelMin(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Notiz / Bericht</label>
            <textarea
              rows={2}
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              placeholder="Was wurde erledigt?"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleSaveManual}
              className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
            >
              {editingEntry ? 'Buchung aktualisieren' : 'Arbeitszeit speichern'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
