import React, { useState } from 'react';
import {
  MaterialItem,
  ProjectMaterialItem,
  OpsMaterialOrder,
  ERPProject,
  Supplier,
} from '../types/erp';
import {
  Boxes,
  Plus,
  AlertTriangle,
  ArrowUpRight,
  ShoppingCart,
  Search,
  CheckCircle2,
  Trash2,
  PackageCheck,
  Undo2,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface InventoryViewProps {
  materials: MaterialItem[];
  consumptions: ProjectMaterialItem[];
  orders: OpsMaterialOrder[];
  projects: ERPProject[];
  suppliers: Supplier[];
  onAddMaterial: (mat: MaterialItem) => void;
  onUpdateMaterial: (mat: MaterialItem) => void;
  onDeleteMaterial: (id: string) => void;
  onRevertConsumption: (id: string) => void;
  onAddOrder: (order: OpsMaterialOrder) => void;
  onAdvanceOrderStatus: (id: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  materials,
  consumptions,
  orders,
  projects,
  suppliers,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  onRevertConsumption,
  onAddOrder,
  onAdvanceOrderStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'consumption' | 'orders'>('inventory');
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);

  // Material Form state
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formUnit, setFormUnit] = useState('Stk.');
  const [formStock, setFormStock] = useState(10);
  const [formMinStock, setFormMinStock] = useState(5);
  const [formPrice, setFormPrice] = useState(0);

  // Order Form state
  const [orderSupplier, setOrderSupplier] = useState(suppliers[0]?.name || 'BayWa Baustoffe');
  const [orderItem, setOrderItem] = useState('');
  const [orderQty, setOrderQty] = useState(10);
  const [orderUnit, setOrderUnit] = useState('Stk.');
  const [orderNeededBy, setOrderNeededBy] = useState(new Date(Date.now() + 3 * 86400 * 1000).toISOString().split('T')[0]);
  const [orderProjectId, setOrderProjectId] = useState<number | undefined>(projects[0]?.id);
  const [orderNote, setOrderNote] = useState('');

  const filteredMaterials = materials.filter((m) => {
    if (lowStockOnly && m.stock > m.minimumStock) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const lowStockCount = materials.filter((m) => m.stock <= m.minimumStock).length;
  const totalStockValue = materials.reduce((sum, m) => sum + m.stock * m.unitPrice, 0);

  const openNewMaterialModal = () => {
    setEditingMaterial(null);
    setFormName('');
    setFormSku(`MAT-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormUnit('Stk.');
    setFormStock(10);
    setFormMinStock(5);
    setFormPrice(12.5);
    setIsMaterialModalOpen(true);
  };

  const openEditMaterialModal = (m: MaterialItem) => {
    setEditingMaterial(m);
    setFormName(m.name);
    setFormSku(m.sku);
    setFormUnit(m.unit);
    setFormStock(m.stock);
    setFormMinStock(m.minimumStock);
    setFormPrice(m.unitPrice);
    setIsMaterialModalOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingMaterial) {
      onUpdateMaterial({
        ...editingMaterial,
        name: formName.trim(),
        sku: formSku.trim(),
        unit: formUnit.trim(),
        stock: formStock,
        minimumStock: formMinStock,
        unitPrice: formPrice,
      });
    } else {
      onAddMaterial({
        id: `mat-${Date.now()}`,
        name: formName.trim(),
        sku: formSku.trim(),
        unit: formUnit.trim(),
        stock: formStock,
        minimumStock: formMinStock,
        unitPrice: formPrice,
      });
    }
    setIsMaterialModalOpen(false);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderItem.trim()) return;

    onAddOrder({
      id: `ord-${Date.now()}`,
      supplier: orderSupplier,
      item: orderItem.trim(),
      quantity: orderQty,
      unit: orderUnit,
      neededBy: orderNeededBy,
      createdAt: new Date().toISOString(),
      status: 'Bestellt',
      projectId: orderProjectId,
      note: orderNote.trim(),
    });

    setOrderItem('');
    setIsOrderModalOpen(false);
  };

  const adjustStock = (mat: MaterialItem, delta: number) => {
    onUpdateMaterial({
      ...mat,
      stock: Math.max(0, mat.stock + delta),
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
            Materiallogistik & Baustellenbelieferung
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Materiallager & Verbrauch
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
          >
            + Material bestellen
          </button>
          <button
            onClick={openNewMaterialModal}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Artikel anlegen</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Lagerwert (Gesamtbestand)
          </span>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {totalStockValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </div>
          <span className="text-[11px] text-slate-500">{materials.length} verschiedene Artikel</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Nachbestellbedarf (Niedrig)
          </span>
          <div className={`text-2xl font-black tabular-nums ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {lowStockCount} Artikel
          </div>
          <span className="text-[11px] text-slate-500">
            {lowStockCount > 0 ? 'Mindestbestand unterschritten' : 'Alle Bestände im grünen Bereich'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Materialentnahmen (Baustelle)
          </span>
          <div className="text-2xl font-black text-blue-600 tabular-nums">
            {consumptions.length}
          </div>
          <span className="text-[11px] text-slate-500">Direkt auf Aufträge verbucht</span>
        </div>
      </div>

      {/* Segmented Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl max-w-md text-xs">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-1.5 px-3 font-bold rounded-lg transition-all ${
            activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Lagerbestand ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('consumption')}
          className={`flex-1 py-1.5 px-3 font-bold rounded-lg transition-all ${
            activeTab === 'consumption' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Verbrauch ({consumptions.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-1.5 px-3 font-bold rounded-lg transition-all ${
            activeTab === 'orders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Bestellungen ({orders.length})
        </button>
      </div>

      {/* Tab 1: Lagerbestand */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Artikelname oder SKU-Nummer suchen …"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Nur Nachbestellungen anzeigen</span>
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Artikel & SKU</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Einzelpreis</th>
                  <th className="py-3 px-4 text-center">Bestand anpassen</th>
                  <th className="py-3 px-4 text-right">Lagerbestand</th>
                  <th className="py-3 px-4 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((mat) => {
                  const isLow = mat.stock <= mat.minimumStock;
                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block text-sm">{mat.name}</span>
                        <span className="font-mono text-[11px] text-slate-400">{mat.sku}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isLow
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isLow ? 'Niedrig' : 'Ausreichend'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {mat.unitPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / {mat.unit}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1">
                          <button
                            onClick={() => adjustStock(mat, -1)}
                            className="h-6 w-6 rounded bg-white font-bold text-slate-700 hover:bg-slate-200 shadow-xs"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-bold font-mono tabular-nums">
                            {mat.stock}
                          </span>
                          <button
                            onClick={() => adjustStock(mat, 1)}
                            className="h-6 w-6 rounded bg-white font-bold text-slate-700 hover:bg-slate-200 shadow-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-slate-900 text-sm tabular-nums">
                          {mat.stock} {mat.unit}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Mindest: {mat.minimumStock} {mat.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditMaterialModal(mat)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                            title="Bearbeiten"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Artikel ${mat.name} löschen?`)) onDeleteMaterial(mat.id);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                            title="Löschen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Materialverbrauch (Consumptions) */}
      {activeTab === 'consumption' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Verbrauchsprotokoll & Entnahmen ({consumptions.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bei Entnahme wird der Artikelbestand automatisch reduziert und dem Auftrag zugerechnet.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {consumptions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Noch kein Material auf Aufträge gebucht.
              </div>
            ) : (
              consumptions.map((c) => {
                const project = projects.find((p) => p.id === c.projectId);
                return (
                  <div key={c.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block text-sm">{c.name}</span>
                      <span className="text-slate-500 text-[11px]">
                        {project?.displayName || `Auftrag #${c.projectId}`} · Gebucht am{' '}
                        {new Date(c.createdAt).toLocaleDateString('de-DE')}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block tabular-nums">
                          {c.quantity} {c.unit}
                        </span>
                        <span className="font-mono text-[11px] text-amber-700">
                          {(c.quantity * c.unitPrice).toLocaleString('de-DE', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Buchung rückgängig machen und ${c.quantity} ${c.unit} wieder ins Lager zurückbuchen?`)) {
                            onRevertConsumption(c.id);
                          }
                        }}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-amber-50 hover:text-amber-800"
                        title="Buchung stornieren und Bestand wiederherstellen"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                        <span>Storno</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Bestellungen (Material Orders) */}
      {activeTab === 'orders' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Materialbestellungen & Lieferantenaviso ({orders.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bestellungen bei Baustoffhändlern erfassen und Wareneingang buchen.
              </p>
            </div>
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
            >
              + Neue Bestellung
            </button>
          </div>

          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Keine Materialbestellungen vorhanden.
              </div>
            ) : (
              orders.map((ord) => {
                const project = projects.find((p) => p.id === ord.projectId);
                return (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{ord.item}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            ord.status === 'Geliefert'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'Bestellt'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Lieferant: <strong className="text-slate-700">{ord.supplier}</strong> · Menge:{' '}
                        <strong>
                          {ord.quantity} {ord.unit}
                        </strong>
                        {project && ` · Auftrag: ${project.displayName}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Benötigt bis: {new Date(ord.neededBy).toLocaleDateString('de-DE')}
                        {ord.note && ` · "${ord.note}"`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {ord.status !== 'Geliefert' && (
                        <button
                          onClick={() => onAdvanceOrderStatus(ord.id)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                        >
                          <PackageCheck className="h-4 w-4" />
                          <span>Wareneingang buchen</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Material Modal */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        title={editingMaterial ? 'Materialartikel bearbeiten' : 'Neuen Materialartikel anlegen'}
        subtitle="Stammdaten für Lagerverwaltung und Baustellenentnahme"
      >
        <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Artikelbezeichnung *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="z. B. Universalschrauben 5x80 TX25"
              className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Artikelnummer / SKU</label>
              <input
                type="text"
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Mengeneinheit</label>
              <select
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
              >
                <option value="Stk.">Stk. (Stück)</option>
                <option value="m">m (Laufende Meter)</option>
                <option value="m²">m² (Quadratmeter)</option>
                <option value="Kart.">Kart. (Kartusche)</option>
                <option value="Rollen">Rollen</option>
                <option value="Dosen">Dosen</option>
                <option value="kg">kg (Kilogramm)</option>
                <option value="Pakete">Pakete</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Aktueller Bestand</label>
              <input
                type="number"
                min="0"
                value={formStock}
                onChange={(e) => setFormStock(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Mindestbestand</label>
              <input
                type="number"
                min="0"
                value={formMinStock}
                onChange={(e) => setFormMinStock(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Einzelpreis netto (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold"
              />
            </div>
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
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-700"
            >
              Artikel sichern
            </button>
          </div>
        </form>
      </Modal>

      {/* Order Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="Materialbestellung aufgeben"
        subtitle="Bestellung an Baustoffgroßhändler erfassen"
      >
        <form onSubmit={handleSaveOrder} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Lieferant</label>
              <input
                type="text"
                required
                value={orderSupplier}
                onChange={(e) => setOrderSupplier(e.target.value)}
                placeholder="z. B. BayWa Baustoffe"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Zuordnung Auftrag (Optional)</label>
              <select
                value={orderProjectId || ''}
                onChange={(e) => setOrderProjectId(Number(e.target.value) || undefined)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
              >
                <option value="">Lager / Werkstatt</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Artikel / Materialbeschreibung *</label>
            <input
              type="text"
              required
              value={orderItem}
              onChange={(e) => setOrderItem(e.target.value)}
              placeholder="z. B. 200m Dachlatte 40x60"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Menge</label>
              <input
                type="number"
                min="1"
                required
                value={orderQty}
                onChange={(e) => setOrderQty(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Einheit</label>
              <input
                type="text"
                value={orderUnit}
                onChange={(e) => setOrderUnit(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Benötigt bis</label>
              <input
                type="date"
                required
                value={orderNeededBy}
                onChange={(e) => setOrderNeededBy(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Lieferanweisung / Notiz</label>
            <textarea
              rows={2}
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="z. B. Kranentladung erforderlich, Anfahrt über Tor 2"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsOrderModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-700"
            >
              Bestellung aufgeben
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
