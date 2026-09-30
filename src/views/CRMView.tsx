import React, { useState } from 'react';
import {
  Customer,
  CustomerActivity,
  CustomerActivityKind,
  ERPProject,
  SalesDocument,
} from '../types/erp';
import {
  Users,
  Plus,
  Phone,
  Mail,
  MapPin,
  Search,
  MessageSquare,
  Briefcase,
  DollarSign,
  ArrowRight,
  Calendar,
  Clock,
  Trash2,
  Edit2,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface CRMViewProps {
  customers: Customer[];
  activities: CustomerActivity[];
  projects: ERPProject[];
  salesDocuments: SalesDocument[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onAddActivity: (act: CustomerActivity) => void;
  onSelectProject: (projectId: number) => void;
}

export const CRMView: React.FC<CRMViewProps> = ({
  customers,
  activities,
  projects,
  salesDocuments,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onAddActivity,
  onSelectProject,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states for customer
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNote, setFormNote] = useState('');

  // Form states for activity
  const [actKind, setActKind] = useState<CustomerActivityKind>('Telefonat');
  const [actTitle, setActTitle] = useState('');
  const [actDetails, setActDetails] = useState('');

  const filteredCustomers = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const currentCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Activities for current customer
  const customerActivities = currentCustomer
    ? activities
        .filter((a) => a.customerId === currentCustomer.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  // Related projects
  const relatedProjects = currentCustomer
    ? projects.filter(
        (p) =>
          p.customerId === currentCustomer.id ||
          (p.kunde && (p.kunde.toLowerCase().includes(currentCustomer.name.toLowerCase()) || (currentCustomer.company && p.kunde.toLowerCase().includes(currentCustomer.company.toLowerCase()))))
      )
    : [];

  // Revenue metrics
  const customerInvoices = currentCustomer
    ? salesDocuments.filter(
        (s) =>
          s.type === 'Rechnung' &&
          (s.customerId === currentCustomer.id ||
            s.customerName.toLowerCase().includes(currentCustomer.name.toLowerCase()) ||
            (currentCustomer.company && s.customerName.toLowerCase().includes(currentCustomer.company.toLowerCase())))
      )
    : [];

  const totalRevenue = customerInvoices.reduce((sum, inv) => {
    const net = inv.items.reduce((iSum, i) => iSum + (i.kind === 'Text' ? 0 : i.quantity * i.unitPrice), 0);
    const tax = inv.taxMode === 'Regelbesteuerung' ? (net * inv.taxRate) / 100 : 0;
    return sum + net + tax;
  }, 0);

  const openRevenue = customerInvoices
    .filter((inv) => inv.status !== 'Bezahlt')
    .reduce((sum, inv) => {
      const net = inv.items.reduce((iSum, i) => iSum + (i.kind === 'Text' ? 0 : i.quantity * i.unitPrice), 0);
      const tax = inv.taxMode === 'Regelbesteuerung' ? (net * inv.taxRate) / 100 : 0;
      return sum + net + tax;
    }, 0);

  const openNewCustomerModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormCompany('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormNote('');
    setIsCustomerModalOpen(true);
  };

  const openEditCustomerModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormName(c.name);
    setFormCompany(c.company);
    setFormPhone(c.phone);
    setFormEmail(c.email);
    setFormAddress(c.address);
    setFormNote(c.note);
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() && !formCompany.trim()) return;

    if (editingCustomer) {
      onUpdateCustomer({
        ...editingCustomer,
        name: formName.trim(),
        company: formCompany.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        address: formAddress.trim(),
        note: formNote.trim(),
      });
    } else {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: formName.trim(),
        company: formCompany.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        address: formAddress.trim(),
        note: formNote.trim(),
      };
      onAddCustomer(newCust);
      setSelectedCustomerId(newCust.id);
    }

    setIsCustomerModalOpen(false);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer || !actTitle.trim()) return;

    onAddActivity({
      id: `act-${Date.now()}`,
      customerId: currentCustomer.id,
      kind: actKind,
      title: actTitle.trim(),
      details: actDetails.trim(),
      date: new Date().toISOString(),
    });

    setActTitle('');
    setActDetails('');
    setIsActivityModalOpen(false);
  };

  const openMapDirections = (addr: string) => {
    if (!addr) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
            Kundenstamm & Kontaktpflege
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Kunden CRM ({customers.length})
          </h1>
        </div>

        <button
          onClick={openNewCustomerModal}
          className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>+ Neuen Kunden anlegen</span>
        </button>
      </div>

      {/* Two Column Layout: List on left, Dossier on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customers List */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, Firma, Adresse oder Tel …"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
                Keine Kunden gefunden.
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = currentCustomer?.id === cust.id;
                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all text-xs space-y-1.5 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{cust.company || cust.name}</span>
                      {cust.company && cust.name && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{cust.name}</span>
                      )}
                    </div>

                    {cust.address && (
                      <p className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                        <span>{cust.address}</span>
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                      {cust.phone && <span>{cust.phone}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Customer Dossier */}
        <div className="lg:col-span-2 space-y-5">
          {currentCustomer ? (
            <>
              {/* Customer Hero Dossier */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-purple-700 tracking-wider uppercase">
                      Kundenakte
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      {currentCustomer.company || currentCustomer.name}
                    </h2>
                    {currentCustomer.company && (
                      <p className="text-xs text-slate-500 font-medium">Ansprechpartner: {currentCustomer.name}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditCustomerModal(currentCustomer)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Kunde ${currentCustomer.name} löschen?`)) {
                          onDeleteCustomer(currentCustomer.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Kunde löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Contact triggers: Call, Mail, Directions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentCustomer.phone ? (
                    <a
                      href={`tel:${currentCustomer.phone.replace(/\s+/g, '')}`}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 text-xs font-semibold text-slate-800 transition-colors"
                    >
                      <Phone className="h-4 w-4 text-purple-600 shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block font-normal">Anrufen</span>
                        <span className="truncate">{currentCustomer.phone}</span>
                      </div>
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl border border-slate-100 text-xs text-slate-400">Keine Tel.</div>
                  )}

                  {currentCustomer.email ? (
                    <a
                      href={`mailto:${currentCustomer.email}`}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-xs font-semibold text-slate-800 transition-colors"
                    >
                      <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block font-normal">E-Mail senden</span>
                        <span className="truncate">{currentCustomer.email}</span>
                      </div>
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl border border-slate-100 text-xs text-slate-400">Keine E-Mail</div>
                  )}

                  {currentCustomer.address ? (
                    <button
                      onClick={() => openMapDirections(currentCustomer.address)}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-xs font-semibold text-slate-800 transition-colors text-left"
                    >
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block font-normal">Route öffnen</span>
                        <span className="truncate">{currentCustomer.address}</span>
                      </div>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl border border-slate-100 text-xs text-slate-400">Keine Adresse</div>
                  )}
                </div>

                {currentCustomer.note && (
                  <div className="rounded-xl bg-amber-50/60 p-3.5 border border-amber-200/70 text-xs text-amber-900">
                    <span className="font-bold block mb-0.5">Wichtige Kundenpräferenz / Notiz:</span>
                    <p className="leading-relaxed">{currentCustomer.note}</p>
                  </div>
                )}
              </div>

              {/* Revenue & Project Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Gesamtumsatz
                  </span>
                  <div className="text-lg font-black text-slate-900 tabular-nums">
                    {totalRevenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </div>
                  <span className="text-[10px] text-slate-500">{customerInvoices.length} Rechnungen</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Offene Posten
                  </span>
                  <div className="text-lg font-black text-amber-600 tabular-nums">
                    {openRevenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </div>
                  <span className="text-[10px] text-slate-500">Ausstehend</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Zugeordnete Aufträge
                  </span>
                  <div className="text-lg font-black text-blue-600 tabular-nums">
                    {relatedProjects.length}
                  </div>
                  <span className="text-[10px] text-slate-500">Bauvorhaben</span>
                </div>
              </div>

              {/* Related Projects */}
              {relatedProjects.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Aufträge dieses Kunden ({relatedProjects.length})
                  </h3>
                  <div className="space-y-2">
                    {relatedProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => onSelectProject(p.id)}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 cursor-pointer text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{p.displayName}</span>
                          <span className="text-slate-500 text-[11px]">{p.adresse || 'Baustelle'}</span>
                        </div>
                        <span className="font-semibold text-amber-600 flex items-center gap-1">
                          <span>Öffnen</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interaction History / Timeline */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Kontaktverlauf & Historie ({customerActivities.length})
                  </h3>
                  <button
                    onClick={() => setIsActivityModalOpen(true)}
                    className="flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Kontakt erfassen</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {customerActivities.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">
                      Noch keine Aktivitäten für diesen Kunden erfasst.
                    </p>
                  ) : (
                    customerActivities.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
                      >
                        <span className="mt-0.5 rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-[10px] font-bold">
                          {act.kind}
                        </span>
                        <div className="space-y-0.5 flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900">{act.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(act.date).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                          {act.details && <p className="text-slate-600 text-[11px]">{act.details}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-semibold text-slate-600">Wähle einen Kunden aus</p>
              <p className="text-xs text-slate-400 mt-1">
                Klicke links auf einen Kunden oder lege einen neuen an.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Create/Edit Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title={editingCustomer ? 'Kunden bearbeiten' : 'Neuen Kunden anlegen'}
        subtitle="Stammdaten für Angebote, Rechnungen und Baustellen"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Ansprechpartner (Name)</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="z. B. Anna Wagner"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Firma / Unternehmen</label>
              <input
                type="text"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                placeholder="z. B. Müller GmbH"
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
                placeholder="+49 89 1234567"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">E-Mail-Adresse</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="kunde@example.de"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Adresse / Anschrift</label>
            <textarea
              rows={2}
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="Straße, Hausnr., PLZ Ort"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Interne Notiz / Absprachen</label>
            <textarea
              rows={2}
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              placeholder="z. B. Bevorzugte Arbeitszeiten, Parkmöglichkeiten ..."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCustomerModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-700"
            >
              {editingCustomer ? 'Änderungen speichern' : 'Kunde anlegen'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Activity Modal */}
      <Modal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        title="Kontakt erfassen"
        subtitle={`Kunde: ${currentCustomer?.company || currentCustomer?.name}`}
      >
        <form onSubmit={handleSaveActivity} className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Art des Kontakts</label>
            <select
              value={actKind}
              onChange={(e) => setActKind(e.target.value as CustomerActivityKind)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
            >
              <option value="Telefonat">Telefonat</option>
              <option value="Notiz">Notiz</option>
              <option value="Termin">Termin vor Ort</option>
              <option value="E-Mail">E-Mail</option>
              <option value="Status">Statusänderung</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Betreff / Kurztitel *</label>
            <input
              type="text"
              required
              value={actTitle}
              onChange={(e) => setActTitle(e.target.value)}
              placeholder="z. B. Rückruf wegen Farbmuster"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Details / Gesprächsinhalt</label>
            <textarea
              rows={3}
              value={actDetails}
              onChange={(e) => setActDetails(e.target.value)}
              placeholder="Was wurde besprochen oder vereinbart?"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsActivityModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-lg bg-purple-700 px-4 py-2 font-bold text-white hover:bg-purple-800"
            >
              Eintrag sichern
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
