import React, { useState } from 'react';
import {
  ERPProject,
  ProjectDraft,
  ERPProjectTemplate,
  Customer,
} from '../types/erp';
import {
  Plus,
  Search,
  Briefcase,
  MapPin,
  User,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Hammer,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const BUILTIN_TEMPLATES: ERPProjectTemplate[] = [
  {
    id: 'badsanierung',
    name: 'Badsanierung',
    icon: 'shower',
    workSteps: [
      'Demontage',
      'Rohinstallation',
      'Elektro',
      'Abdichtung',
      'Fliesen / Montage',
      'Sanitärmontage',
      'Abnahme',
      'Nacharbeit',
    ],
    checklist: [
      'Baustelle schützen & Staubschutzwand aufbauen',
      'Wasser absperren & Leitungen entleeren',
      'Bestand fotografieren',
      'Abdichtungsebene DIN 18534 dokumentieren',
      'Druckprüfung Rohrleitungen durchführen',
      'Endreinigung & Silikonfugen',
      'Kundenabnahme & Protokoll',
    ],
    materials: [
      { name: 'Silikon Sanitär weiß', quantity: 4, unit: 'Kart.' },
      { name: 'Dichtband flexibel 100mm', quantity: 2, unit: 'Rollen' },
      { name: 'Universalschrauben 5x80', quantity: 100, unit: 'Stk.' },
    ],
  },
  {
    id: 'dachsanierung',
    name: 'Dachsanierung',
    icon: 'house',
    workSteps: [
      'Gerüst / Sicherung',
      'Demontage Altdach',
      'Untergrundprüfung Sparren',
      'Unterkonstruktion & Lattung',
      'Dämmung',
      'Eindeckung Ziegel',
      'Anschlüsse & Spenglerei',
      'Abnahme',
    ],
    checklist: [
      'Baustelle absichern & Gerüstfreigabe prüfen',
      'Absturzsicherung kontrollieren',
      'Bestand vor Abbruch fotografieren',
      'Untergrund auf Feuchtigkeit prüfen',
      'Kamin- und Wandanschlüsse dokumentieren',
      'Endkontrolle',
    ],
    materials: [
      { name: 'Dachlatte 40x60 imprägniert', quantity: 80, unit: 'm' },
      { name: 'Universalschrauben 5x80', quantity: 250, unit: 'Stk.' },
      { name: 'Dichtband 100 mm', quantity: 4, unit: 'Rollen' },
    ],
  },
  {
    id: 'fenstermontage',
    name: 'Fenstermontage',
    icon: 'window',
    workSteps: [
      'Aufmaßkontrolle',
      'Demontage Altfenster',
      'Vorbereitung Leibung',
      'Montage RAL-konform',
      'Abdichtung innen/außen',
      'Einstellung Beschläge',
      'Abnahme',
    ],
    checklist: [
      'Maße und Öffnungen nachprüfen',
      'Bestand vor Ausbau fotografieren',
      'Bauteile auf Transportschäden prüfen',
      'Befestigung nach RAL-Leitfaden',
      'Fugen luftdicht innen / schlagregendicht außen',
      'Funktionsprüfung aller Flügel',
      'Kundenabnahme',
    ],
    materials: [
      { name: 'Montageschaum 1K B2', quantity: 3, unit: 'Dosen' },
      { name: 'Multifunktions-Dichtband', quantity: 2, unit: 'Rollen' },
      { name: 'Fensterrahmenschrauben', quantity: 40, unit: 'Stk.' },
    ],
  },
];

interface ProjectsViewProps {
  projects: ERPProject[];
  customers: Customer[];
  onSelectProject: (projectId: number) => void;
  onCreateProject: (draft: ProjectDraft) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  customers,
  onSelectProject,
  onCreateProject,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formCustomer, setFormCustomer] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCustomerId, setFormCustomerId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const filtered = projects.filter((p) => {
    if (statusFilter !== 'ALL' && (p.status || 'In Arbeit') !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.kunde && p.kunde.toLowerCase().includes(q)) ||
      (p.projektnummer && p.projektnummer.toLowerCase().includes(q)) ||
      (p.adresse && p.adresse.toLowerCase().includes(q))
    );
  });

  const handleOpenModal = () => {
    setFormName('');
    const year = new Date().getFullYear();
    setFormNumber(`A-${year}-00${projects.length + 1}`);
    setFormCustomer('');
    setFormAddress('');
    setFormCustomerId('');
    setSelectedTemplateId('');
    setIsModalOpen(true);
  };

  const handleSelectCustomer = (customerId: string) => {
    setFormCustomerId(customerId);
    const c = customers.find((cust) => cust.id === customerId);
    if (c) {
      setFormCustomer(c.company || c.name);
      if (!formAddress) setFormAddress(c.address);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    onCreateProject({
      name: formName.trim(),
      projektnummer: formNumber.trim(),
      kunde: formCustomer.trim(),
      adresse: formAddress.trim(),
      customerId: formCustomerId || undefined,
      templateId: selectedTemplateId || undefined,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
            Auftragsverwaltung
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Aufträge & Baustellen ({projects.length})
          </h1>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Neuen Auftrag anlegen</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Auftrag, Kunde, Nummer oder Adresse suchen …"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
          {['ALL', 'In Arbeit', 'Geplant', 'Erledigt'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'Alle' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-sm font-semibold text-slate-600">Keine Aufträge gefunden</p>
            <p className="text-xs text-slate-400 mt-1">Passe die Suche an oder lege einen neuen Auftrag an.</p>
            <button
              onClick={handleOpenModal}
              className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
            >
              + Auftrag anlegen
            </button>
          </div>
        ) : (
          filtered.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-amber-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-bold text-sm">
                    {project.name?.charAt(0) || 'A'}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      project.status === 'Erledigt'
                        ? 'bg-slate-100 text-slate-600'
                        : project.status === 'Geplant'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {project.status || 'In Arbeit'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                    {project.name || `Auftrag #${project.id}`}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono font-semibold text-slate-700">
                      {project.projektnummer || `#${project.id}`}
                    </span>
                    {project.kunde && (
                      <>
                        <span>·</span>
                        <span className="truncate">{project.kunde}</span>
                      </>
                    )}
                  </div>
                </div>

                {project.adresse && (
                  <p className="flex items-start gap-1.5 text-xs text-slate-500 line-clamp-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
                    <span>{project.adresse}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4 text-xs font-semibold text-amber-600">
                <span>Projekt-Hub öffnen</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Neuen Auftrag / Baustelle anlegen"
        subtitle="Stammdaten, Kunde, Baustellenadresse und optionale Projektvorlage"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Auftragsbezeichnung *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="z. B. Dachsanierung Musterstraße 18"
              className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Auftragsnummer</label>
              <input
                type="text"
                value={formNumber}
                onChange={(e) => setFormNumber(e.target.value)}
                placeholder="z. B. A-2026-004"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Bestandskunde wählen</label>
              <select
                value={formCustomerId}
                onChange={(e) => handleSelectCustomer(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
              >
                <option value="">Freie Eingabe oder wählen ...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company ? `${c.company} (${c.name})` : c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Kundenname / Firma</label>
            <input
              type="text"
              value={formCustomer}
              onChange={(e) => setFormCustomer(e.target.value)}
              placeholder="z. B. Müller GmbH oder Familie Wagner"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Baustellenadresse</label>
            <textarea
              rows={2}
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="Straße, Hausnummer, PLZ Ort (für Routennavigation)"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          {/* Project Template Selection */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <label className="block font-bold text-slate-800">Projektvorlage anwenden (Optional)</label>
            <p className="text-[11px] text-slate-500">
              Übernimmt vordefinierte Arbeitsgänge, Qualitäts-Checklisten und Materialbedarf.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {BUILTIN_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(selectedTemplateId === tmpl.id ? '' : tmpl.id)}
                  className={`cursor-pointer rounded-lg p-2.5 border text-center transition-all ${
                    selectedTemplateId === tmpl.id
                      ? 'border-amber-600 bg-amber-50/80 text-amber-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-xs">{tmpl.name}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {tmpl.workSteps.length} Phasen
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow-xs"
            >
              Auftrag anlegen
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
