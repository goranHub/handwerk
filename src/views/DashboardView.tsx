import React from 'react';
import {
  ERPStoreState,
  ERPProject,
  ERPAppointment,
  TimeEntrySummary,
} from '../types/erp';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Briefcase,
  Users,
  Camera,
  Boxes,
  FileText,
  MapPin,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Pause,
  Square,
  Plus,
} from 'lucide-react';
import { ERPView } from '../components/layout/Sidebar';

interface DashboardViewProps {
  state: ERPStoreState;
  onNavigate: (view: ERPView, projectId?: number) => void;
  onOpenNewProject: () => void;
  onOpenQuickTime: () => void;
  onPauseResumeTimer: () => void;
  onStopTimer: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onNavigate,
  onOpenNewProject,
  onOpenQuickTime,
  onPauseResumeTimer,
  onStopTimer,
}) => {
  const activeBooking = state.activeBooking;
  const projects = state.projects;
  const tasks = state.tasks;
  const appointments = state.appointments;
  const materials = state.materials;
  const salesDocs = state.salesDocuments;
  const timeEntries = state.timeEntries;

  // Compute metrics
  const todayEntries = timeEntries.filter((e: TimeEntrySummary) => {
    const today = new Date().toISOString().split('T')[0];
    return e.startedAt.startsWith(today);
  });
  const todayHours = todayEntries.reduce((sum: number, e: TimeEntrySummary) => {
    const durSec =
      (new Date(e.endedAt).getTime() - new Date(e.startedAt).getTime()) / 1000 -
      (e.pauseSeconds || 0);
    return sum + Math.max(0, durSec / 3600);
  }, 0);

  const openTasks = tasks.filter((t: any) => t.status !== 'Erledigt');
  const overdueTasks = tasks.filter((t: any) => {
    if (t.status === 'Erledigt') return false;
    return new Date(t.dueDate) < new Date();
  });
  const openDefects = state.defects.filter((d: any) => d.status !== 'Abgeschlossen' && d.status !== 'Behoben');
  const lowStock = materials.filter((m: any) => m.stock <= m.minimumStock);
  const overdueInvoices = salesDocs.filter(
    (s: any) => s.type === 'Rechnung' && s.status !== 'Bezahlt' && s.dueDate && new Date(s.dueDate) < new Date()
  );

  const nextApt = appointments
    .filter((a: ERPAppointment) => new Date(a.end) >= new Date())
    .sort((a: ERPAppointment, b: ERPAppointment) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

  const focusProject = nextApt?.projectId
    ? projects.find((p: ERPProject) => p.id === nextApt.projectId)
    : projects[0];

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  })();

  const attentionCount = overdueTasks.length + openDefects.length + lowStock.length + overdueInvoices.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Header greeting & Company identity */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
            Handwerksbetrieb · Meisterqualität
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {greeting}, {state.company.ownerName ? state.company.ownerName.split(' ')[0] : 'Team'}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {new Date().toLocaleDateString('de-DE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-900">{state.company.companyName}</div>
            <div className="text-[11px] text-slate-500">{state.company.city}</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-amber-400 font-bold text-base shadow-sm">
            {state.company.companyName.charAt(0) || 'H'}
          </div>
        </div>
      </div>

      {/* 2. Active punch clock strip if running */}
      {activeBooking.aktiv && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5 rounded-full bg-emerald-500">
              {!activeBooking.pausiert && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-900">
                  {activeBooking.pausiert ? 'Zeiterfassung pausiert' : 'Arbeitszeit läuft aktiv'}
                </span>
                <span className="text-[11px] rounded bg-emerald-200/80 px-1.5 py-0.2 font-medium text-emerald-800">
                  {activeBooking.arbeitsgangName || 'Montage'}
                </span>
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                {activeBooking.projektName || 'Auftrag'} · Gestartet um{' '}
                {activeBooking.startzeit
                  ? new Date(activeBooking.startzeit).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '--:--'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onPauseResumeTimer}
              className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              {activeBooking.pausiert ? (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Fortsetzen</span>
                </>
              ) : (
                <>
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span>Pause</span>
                </>
              )}
            </button>
            <button
              onClick={onStopTimer}
              className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 shadow-xs"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>Stoppen</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Focus Hero Card: Next Job / Appointment */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 tracking-wider uppercase">
              <Calendar className="h-4 w-4" />
              <span>{nextApt ? 'Nächster geplanter Einsatz' : 'Heutiger Baustellenfokus'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {nextApt?.title || focusProject?.displayName || 'Auftrag Musterstraße 18'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                {nextApt?.location || focusProject?.adresse || 'Musterstraße 18, 80331 München'}
              </span>
            </p>
            {nextApt?.note && (
              <p className="text-xs text-slate-400 italic bg-white/5 p-2 rounded-lg border border-white/10">
                "{nextApt.note}"
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            {focusProject && (
              <button
                onClick={() => onNavigate('projects', focusProject.id)}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
              >
                <span>Auftrag öffnen</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onNavigate('time')}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors border border-white/15"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Arbeitszeit erfassen</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Core KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => onNavigate('time')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Heute gebucht</span>
            <Clock className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {todayHours.toFixed(1)} <span className="text-sm font-medium text-slate-500">Std.</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {todayEntries.length} Buchung{todayEntries.length === 1 ? '' : 'en'} erfasst
          </span>
        </div>

        <div
          onClick={() => onNavigate('projects')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Aktive Aufträge</span>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {projects.length}
          </div>
          <span className="text-[11px] text-slate-500">Baustellen & Service</span>
        </div>

        <div
          onClick={() => onNavigate('tasks')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Offene Aufgaben</span>
            <CheckCircle2 className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {openTasks.length}
          </div>
          <span className="text-[11px] text-slate-500">
            {overdueTasks.length > 0 ? (
              <span className="text-red-600 font-semibold">{overdueTasks.length} überfällig</span>
            ) : (
              'Im Zeitplan'
            )}
          </span>
        </div>

        <div
          onClick={() => onNavigate('team')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Mitarbeiter & Team</span>
            <Users className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {state.employees.length}
          </div>
          <span className="text-[11px] text-slate-500">Einsatzbereit vor Ort</span>
        </div>
      </div>

      {/* 5. Handlungsbedarf / Attention Center */}
      {attentionCount > 0 && (
        <div className="rounded-2xl border border-red-200/80 bg-red-50/40 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3 text-red-900">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Handlungsbedarf ({attentionCount})</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {overdueTasks.length > 0 && (
              <button
                onClick={() => onNavigate('tasks')}
                className="flex items-center justify-between rounded-xl bg-white p-3 border border-red-100 shadow-xs hover:border-red-300 text-left"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Überfällige Aufgaben</span>
                  <span className="text-[11px] text-slate-500">{overdueTasks.length} Aufgaben warten</span>
                </div>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                  {overdueTasks.length}
                </span>
              </button>
            )}

            {openDefects.length > 0 && (
              <button
                onClick={() => onNavigate('defects')}
                className="flex items-center justify-between rounded-xl bg-white p-3 border border-red-100 shadow-xs hover:border-red-300 text-left"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Offene Mängel</span>
                  <span className="text-[11px] text-slate-500">Qualitätsnacharbeit nötig</span>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                  {openDefects.length}
                </span>
              </button>
            )}

            {lowStock.length > 0 && (
              <button
                onClick={() => onNavigate('inventory')}
                className="flex items-center justify-between rounded-xl bg-white p-3 border border-red-100 shadow-xs hover:border-red-300 text-left"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Materialbestand niedrig</span>
                  <span className="text-[11px] text-slate-500">Artikel nachbestellen</span>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                  {lowStock.length}
                </span>
              </button>
            )}

            {overdueInvoices.length > 0 && (
              <button
                onClick={() => onNavigate('sales')}
                className="flex items-center justify-between rounded-xl bg-white p-3 border border-red-100 shadow-xs hover:border-red-300 text-left"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Offene Rechnungen</span>
                  <span className="text-[11px] text-slate-500">Mahnstufe prüfen</span>
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                  {overdueInvoices.length}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6. Quick Action Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Schnellzugriff & Aktionen
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={onOpenNewProject}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-xs hover:border-amber-500 hover:shadow-sm transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Neuer Auftrag</span>
          </button>

          <button
            onClick={onOpenQuickTime}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-xs hover:border-emerald-500 hover:shadow-sm transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Zeit buchen</span>
          </button>

          <button
            onClick={() => onNavigate('journal')}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-xs hover:border-purple-500 hover:shadow-sm transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Camera className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Bautagebuch</span>
          </button>

          <button
            onClick={() => onNavigate('sales')}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-xs hover:border-blue-500 hover:shadow-sm transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Rechnung / Angebot</span>
          </button>

          <button
            onClick={() => onNavigate('inventory')}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-xs hover:border-amber-500 hover:shadow-sm transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Boxes className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Materiallager</span>
          </button>

          <button
            onClick={() => onNavigate('crm')}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-xs hover:border-teal-500 hover:shadow-sm transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Kunden CRM</span>
          </button>
        </div>
      </div>

      {/* 7. Two Column: Current Projects & Today's Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Current Active Projects */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Aktuelle Baustellen ({projects.length})
              </h3>
              <button
                onClick={() => onNavigate('projects')}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700"
              >
                Alle anzeigen →
              </button>
            </div>

            <div className="space-y-2.5">
              {projects.slice(0, 4).map((p: ERPProject) => (
                <div
                  key={p.id}
                  onClick={() => onNavigate('projects', p.id)}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-[240px]">
                      {p.displayName}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[200px]">{p.adresse || p.kunde || 'Baustelle'}</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {p.status || 'In Arbeit'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Today's Time Bookings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Zeiterfassung Heute ({todayEntries.length})
              </h3>
              <button
                onClick={() => onNavigate('time')}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700"
              >
                Zum Kalender →
              </button>
            </div>

            {todayEntries.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Heute noch keine Zeiten gebucht.</p>
                <button
                  onClick={onOpenQuickTime}
                  className="mt-2 text-xs font-bold text-amber-600 hover:underline"
                >
                  + Erste Buchung eintragen
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayEntries.slice(0, 4).map((entry: TimeEntrySummary) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{entry.projectName}</div>
                      <div className="text-[11px] text-slate-500">
                        {entry.workStepName} · {entry.employeeName || 'Mitarbeiter'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-600">
                        {(
                          (new Date(entry.endedAt).getTime() - new Date(entry.startedAt).getTime()) /
                            3600000 -
                          (entry.pauseSeconds || 0) / 3600
                        ).toFixed(2)}{' '}
                        h
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Pause: {Math.round((entry.pauseSeconds || 0) / 60)} Min.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
