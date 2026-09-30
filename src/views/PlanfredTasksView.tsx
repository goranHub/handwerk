import React, { useState } from 'react';
import {
  OpsTask,
  PlanfredCategory,
  OpsTaskStatus,
  OpsTaskPriority,
  ERPProject,
} from '../types/erp';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Camera,
  User,
  Clock,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface PlanfredTasksViewProps {
  tasks: OpsTask[];
  projects: ERPProject[];
  onAddTask: (task: OpsTask) => void;
  onUpdateTask: (task: OpsTask) => void;
  onDeleteTask: (id: string) => void;
}

export const PlanfredTasksView: React.FC<PlanfredTasksViewProps> = ({
  tasks,
  projects,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlanfredCategory | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<OpsTaskStatus | 'ALL'>('ALL');
  const [selectedTab, setSelectedTab] = useState<'pending' | 'drafts' | 'done'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<OpsTask | null>(null);

  // Form states for creating/editing task
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<PlanfredCategory>('TODO');
  const [formStatus, setFormStatus] = useState<OpsTaskStatus>('Offen');
  const [formPriority, setFormPriority] = useState<OpsTaskPriority>('Normal');
  const [formLocation, setFormLocation] = useState('');
  const [formAssignee, setFormAssignee] = useState('');
  const [formRole, setFormRole] = useState('Baufirma');
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formProjectId, setFormProjectId] = useState<number | undefined>(projects[0]?.id);
  const [formNote, setFormNote] = useState('');
  const [formHasPhoto, setFormHasPhoto] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    // Tab filter
    if (selectedTab === 'done' && t.status !== 'Erledigt') return false;
    if (selectedTab === 'pending' && t.status === 'Erledigt') return false;

    // Category filter
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;

    // Status filter
    if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        (t.location && t.location.toLowerCase().includes(q)) ||
        (t.assigneeName && t.assigneeName.toLowerCase().includes(q)) ||
        (t.note && t.note.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const openNewTaskModal = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormCategory('TODO');
    setFormStatus('Offen');
    setFormPriority('Normal');
    setFormLocation('EG');
    setFormAssignee('Max Mustermann');
    setFormRole('Monteur');
    setFormDueDate(new Date().toISOString().split('T')[0]);
    setFormProjectId(projects[0]?.id);
    setFormNote('');
    setFormHasPhoto(false);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task: OpsTask) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormCategory(task.category || 'TODO');
    setFormStatus(task.status);
    setFormPriority(task.priority);
    setFormLocation(task.location || '');
    setFormAssignee(task.assigneeName || '');
    setFormRole(task.assigneeRole || 'Baufirma');
    setFormDueDate(task.dueDate.split('T')[0]);
    setFormProjectId(task.projectId);
    setFormNote(task.note || '');
    setFormHasPhoto(task.hasPhoto || false);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formTitle.trim()) return;

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title: formTitle.trim(),
        category: formCategory,
        status: formStatus,
        priority: formPriority,
        location: formLocation.trim(),
        assigneeName: formAssignee.trim(),
        assigneeRole: formRole.trim(),
        dueDate: new Date(formDueDate).toISOString(),
        projectId: formProjectId,
        note: formNote.trim(),
        hasPhoto: formHasPhoto,
      });
    } else {
      onAddTask({
        id: `tsk-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        status: formStatus,
        priority: formPriority,
        location: formLocation.trim(),
        assigneeName: formAssignee.trim(),
        assigneeRole: formRole.trim(),
        dueDate: new Date(formDueDate).toISOString(),
        projectId: formProjectId,
        note: formNote.trim(),
        hasPhoto: formHasPhoto,
        creatorName: 'Bauleiter',
      });
    }

    setIsModalOpen(false);
  };

  const getCategoryBadge = (cat?: PlanfredCategory) => {
    switch (cat) {
      case 'KLÄRUNGSBEDARF':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'TODO':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MANGEL':
        return 'bg-slate-900 text-white border-slate-900';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusBadge = (st: OpsTaskStatus) => {
    switch (st) {
      case 'In Abklärung':
        return 'bg-amber-500 text-white';
      case 'In Bearbeitung':
        return 'bg-teal-600 text-white';
      case 'Erledigt':
        return 'bg-emerald-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-700 tracking-wider uppercase">
              Planfred Tasks & Mängel
            </span>
            <span className="rounded bg-teal-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              INTEGRIERT
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Aufgaben & Klärungsbedarf
          </h1>
        </div>

        <button
          onClick={openNewTaskModal}
          className="flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>+ NEUEN TASK ANLEGEN</span>
        </button>
      </div>

      {/* Planfred Teal Banner & Filter Matrix */}
      <div className="rounded-2xl bg-teal-800 p-4 sm:p-5 text-white shadow-md space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-b border-teal-700/60 pb-3">
          <button
            onClick={() => setSelectedTab('pending')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedTab === 'pending'
                ? 'bg-white text-teal-900 shadow-sm'
                : 'text-teal-100 hover:bg-teal-700/50'
            }`}
          >
            Tasks zu erledigen ({tasks.filter((t) => t.status !== 'Erledigt').length})
          </button>
          <button
            onClick={() => setSelectedTab('done')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedTab === 'done'
                ? 'bg-white text-teal-900 shadow-sm'
                : 'text-teal-100 hover:bg-teal-700/50'
            }`}
          >
            Erledigt ({tasks.filter((t) => t.status === 'Erledigt').length})
          </button>
        </div>

        {/* Search input & Filter chips */}
        <div className="space-y-3">
          <div className="relative max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suchbegriffe für Titel, Verortung oder Zuständigkeit eingeben …"
              className="w-full rounded-lg border-0 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-teal-200 mr-1">Kategorie:</span>
            {(['ALL', 'TODO', 'MANGEL', 'KLÄRUNGSBEDARF'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-white text-teal-950 font-bold'
                    : 'bg-teal-700/60 text-teal-100 hover:bg-teal-700'
                }`}
              >
                {cat === 'ALL' ? 'Alle Kategorien' : cat}
              </button>
            ))}

            <div className="h-4 w-[1px] bg-teal-600/80 mx-1 hidden sm:block" />

            <span className="font-bold text-teal-200 mr-1">Status:</span>
            {(['ALL', 'Offen', 'In Bearbeitung', 'In Abklärung'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  selectedStatus === st
                    ? 'bg-white text-teal-950 font-bold'
                    : 'bg-teal-700/60 text-teal-100 hover:bg-teal-700'
                }`}
              >
                {st === 'ALL' ? 'Alle Status' : st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-teal-200 border-t border-teal-700/60 pt-2 font-medium">
          <span>{filteredTasks.length} von {tasks.length} Tasks gefiltert</span>
          {search && (
            <button onClick={() => setSearch('')} className="hover:underline text-teal-100">
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* High-density Planfred Desktop Table */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-2.5 px-3 w-10 text-center">Typ</th>
              <th className="py-2.5 px-3">Titel & Verortung</th>
              <th className="py-2.5 px-3">Zuständigkeit</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Kategorie</th>
              <th className="py-2.5 px-3">Fälligkeit</th>
              <th className="py-2.5 px-3 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Keine Tasks für die gewählten Filterkriterien vorhanden.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task, idx) => (
                <tr
                  key={task.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                  }`}
                >
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      {task.hasPhoto ? <Camera className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div
                      onClick={() => openEditTaskModal(task)}
                      className="font-bold text-slate-900 hover:text-teal-700 cursor-pointer text-sm"
                    >
                      {task.title}
                    </div>
                    {task.location && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{task.location}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      {task.assigneeRole && (
                        <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                          {task.assigneeRole}
                        </span>
                      )}
                      <span className="font-medium text-slate-800">
                        {task.assigneeName || 'Nicht zugewiesen'}
                      </span>
                    </div>
                    {task.creatorName && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        von {task.creatorName}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => {
                        const nextStatus: Record<OpsTaskStatus, OpsTaskStatus> = {
                          Offen: 'In Bearbeitung',
                          'In Bearbeitung': 'Erledigt',
                          Erledigt: 'Offen',
                          'In Abklärung': 'In Bearbeitung',
                        };
                        onUpdateTask({ ...task, status: nextStatus[task.status] || 'Offen' });
                      }}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(
                        task.status
                      )} shadow-2xs hover:opacity-90`}
                    >
                      {task.status}
                    </button>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold ${getCategoryBadge(
                        task.category
                      )}`}
                    >
                      {task.category || 'TODO'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 text-slate-600 font-medium">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>
                        {new Date(task.dueDate).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditTaskModal(task)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                        title="Bearbeiten"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Löschen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="space-y-3 md:hidden">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            Keine Tasks gefunden.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div
                    onClick={() => openEditTaskModal(task)}
                    className="font-bold text-slate-900 text-sm hover:text-teal-700 cursor-pointer"
                  >
                    {task.title}
                  </div>
                  {task.location && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="h-3 w-3" />
                      <span>{task.location}</span>
                    </div>
                  )}
                </div>

                <span
                  className={`rounded border px-2 py-0.5 text-[10px] font-bold shrink-0 ${getCategoryBadge(
                    task.category
                  )}`}
                >
                  {task.category || 'TODO'}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                <div className="text-slate-600">
                  <span className="font-medium">{task.assigneeName || 'Mitarbeiter'}</span>
                  {task.assigneeRole && (
                    <span className="text-slate-400 text-[10px]"> ({task.assigneeRole})</span>
                  )}
                </div>

                <button
                  onClick={() => {
                    const nextStatus: Record<OpsTaskStatus, OpsTaskStatus> = {
                      Offen: 'In Bearbeitung',
                      'In Bearbeitung': 'Erledigt',
                      Erledigt: 'Offen',
                      'In Abklärung': 'In Bearbeitung',
                    };
                    onUpdateTask({ ...task, status: nextStatus[task.status] || 'Offen' });
                  }}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(
                    task.status
                  )}`}
                >
                  {task.status}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Planfred Task bearbeiten' : 'Neuen Planfred Task erfassen'}
        subtitle="Aufgabe für Baustelle, Gewerk und Handwerker anlegen"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Titel der Aufgabe / Klärungsbedarf</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="z. B. Dachflächenfenster Lage prüfen"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Kategorie</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as PlanfredCategory)}
                className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
              >
                <option value="TODO">TODO</option>
                <option value="KLÄRUNGSBEDARF">KLÄRUNGSBEDARF</option>
                <option value="MANGEL">MANGEL</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-700">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as OpsTaskStatus)}
                className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
              >
                <option value="Offen">Offen</option>
                <option value="In Bearbeitung">In Bearbeitung</option>
                <option value="In Abklärung">In Abklärung</option>
                <option value="Erledigt">Erledigt</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Verortung (Ort / Raum / Geschoss)</label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="z. B. 1. DG, Zimmer 2"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-700">Fälligkeitsdatum</label>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Zuständige Person</label>
              <input
                type="text"
                value={formAssignee}
                onChange={(e) => setFormAssignee(e.target.value)}
                placeholder="z. B. Bernhard Wiesberger"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-700">Rolle / Gewerk</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
              >
                <option value="Baufirma">Baufirma</option>
                <option value="Architekt">Architekt</option>
                <option value="Bauphysik">Bauphysik</option>
                <option value="Monteur">Monteur</option>
                <option value="Spengler">Spengler</option>
                <option value="Elektriker">Elektriker</option>
                <option value="Sanitär">Sanitär</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Zugeordneter Auftrag</label>
            <select
              value={formProjectId || ''}
              onChange={(e) => setFormProjectId(Number(e.target.value) || undefined)}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName} ({p.projektnummer || `#${p.id}`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Details / Anmerkung</label>
            <textarea
              rows={3}
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              placeholder="Detaillierte Beschreibung oder Fotohinweis ..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formHasPhoto}
              onChange={(e) => setFormHasPhoto(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-slate-700">Fotodokumentation vorhanden / Foto erforderlich</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800"
            >
              {editingTask ? 'Änderungen speichern' : 'Task anlegen'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
