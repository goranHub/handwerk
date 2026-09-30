import React, { useState, useEffect } from 'react';
import { ERPStoreState } from '../../types/erp';
import {
  Search,
  Briefcase,
  Users,
  CheckSquare,
  Boxes,
  FileText,
  User,
  ArrowRight,
  X,
} from 'lucide-react';
import { ERPView } from '../layout/Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ERPStoreState;
  onSelectResult: (view: ERPView, projectId?: number) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  state,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingProjects = q
    ? state.projects.filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          (p.kunde && p.kunde.toLowerCase().includes(q)) ||
          (p.adresse && p.adresse.toLowerCase().includes(q)) ||
          (p.projektnummer && p.projektnummer.toLowerCase().includes(q))
      )
    : [];

  const matchingCustomers = q
    ? state.customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
      )
    : [];

  const matchingTasks = q
    ? state.tasks.filter((t) => t.title.toLowerCase().includes(q) || (t.location && t.location.toLowerCase().includes(q)))
    : [];

  const matchingMaterials = q
    ? state.materials.filter((m) => m.name.toLowerCase().includes(q) || m.sku.toLowerCase().includes(q))
    : [];

  const matchingDocs = q
    ? state.salesDocuments.filter(
        (d) =>
          d.number.toLowerCase().includes(q) ||
          d.customerName.toLowerCase().includes(q) ||
          d.projectName.toLowerCase().includes(q)
      )
    : [];

  const hasResults =
    matchingProjects.length > 0 ||
    matchingCustomers.length > 0 ||
    matchingTasks.length > 0 ||
    matchingMaterials.length > 0 ||
    matchingDocs.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Globale Suche: Auftrag, Kunde, Aufgabe, Material oder Rechnung suchen …"
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto p-4 space-y-4 text-xs">
          {!q ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Search className="h-8 w-8 mx-auto opacity-30" />
              <p className="font-medium text-slate-600">Tippe einen Suchbegriff ein</p>
              <p className="text-[11px] text-slate-400">
                z. B. "Musterstraße", "Wagner", "Silikon", "RE-2026"
              </p>
            </div>
          ) : !hasResults ? (
            <div className="py-12 text-center text-slate-400">
              Keine Treffer für "{query}" gefunden.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Projects */}
              {matchingProjects.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1.5 px-2">
                    Aufträge & Baustellen
                  </h4>
                  <div className="space-y-1">
                    {matchingProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectResult('projects', p.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Briefcase className="h-4 w-4 text-amber-600" />
                          <div>
                            <span className="font-bold text-slate-900 block">{p.displayName}</span>
                            <span className="text-[11px] text-slate-500">{p.adresse || p.kunde}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {matchingCustomers.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1.5 px-2">
                    Kundenstamm
                  </h4>
                  <div className="space-y-1">
                    {matchingCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectResult('crm');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="h-4 w-4 text-purple-600" />
                          <div>
                            <span className="font-bold text-slate-900 block">{c.company || c.name}</span>
                            <span className="text-[11px] text-slate-500">{c.address || c.phone}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {matchingTasks.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1.5 px-2">
                    Aufgaben & Mängel
                  </h4>
                  <div className="space-y-1">
                    {matchingTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onSelectResult('tasks');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckSquare className="h-4 w-4 text-teal-600" />
                          <div>
                            <span className="font-bold text-slate-900 block">{t.title}</span>
                            <span className="text-[11px] text-slate-500">{t.location || t.status}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {matchingDocs.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1.5 px-2">
                    Angebote & Rechnungen
                  </h4>
                  <div className="space-y-1">
                    {matchingDocs.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          onSelectResult('sales');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {d.type} {d.number}
                            </span>
                            <span className="text-[11px] text-slate-500">{d.customerName}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {matchingMaterials.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1.5 px-2">
                    Materiallager
                  </h4>
                  <div className="space-y-1">
                    {matchingMaterials.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onSelectResult('inventory');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Boxes className="h-4 w-4 text-amber-700" />
                          <div>
                            <span className="font-bold text-slate-900 block">{m.name}</span>
                            <span className="text-[11px] text-slate-500">
                              Bestand: {m.stock} {m.unit} · {m.sku}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
