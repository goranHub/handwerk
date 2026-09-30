import React, { useState } from 'react';
import {
  OpsVehicle,
  OpsTrip,
  TaxiShiftReport,
  ERPProject,
  OpsEmployee,
} from '../types/erp';
import {
  Car,
  Plus,
  Route,
  Receipt,
  Search,
  CheckCircle2,
  Trash2,
  Calendar,
  Fuel,
  TrendingUp,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface FleetViewProps {
  vehicles: OpsVehicle[];
  trips: OpsTrip[];
  taxiShift: TaxiShiftReport;
  projects: ERPProject[];
  employees: OpsEmployee[];
  onAddVehicle: (veh: OpsVehicle) => void;
  onAddTrip: (trip: OpsTrip) => void;
  onDeleteTrip: (id: string) => void;
  onUpdateTaxiShift: (report: TaxiShiftReport) => void;
}

export const FleetView: React.FC<FleetViewProps> = ({
  vehicles,
  trips,
  taxiShift,
  projects,
  employees,
  onAddVehicle,
  onAddTrip,
  onDeleteTrip,
  onUpdateTaxiShift,
}) => {
  const [tab, setTab] = useState<'trips' | 'vehicles' | 'taxi'>('trips');

  // Modals
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  // Trip Form State
  const [formVehId, setFormVehId] = useState(vehicles[0]?.id || '');
  const [formProjId, setFormProjId] = useState<number | undefined>(projects[0]?.id);
  const [formEmpId, setFormEmpId] = useState<string>(employees[0]?.id || '');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStartKm, setFormStartKm] = useState(vehicles[0]?.odometerKm || 68400);
  const [formEndKm, setFormEndKm] = useState((vehicles[0]?.odometerKm || 68400) + 28);
  const [formPurpose, setFormPurpose] = useState('Baustellenbelieferung');
  const [formNote, setFormNote] = useState('');

  // Vehicle Form State
  const [vehName, setVehName] = useState('');
  const [vehPlate, setVehPlate] = useState('');
  const [vehKm, setVehKm] = useState(50000);
  const [vehCost, setVehCost] = useState(0.52);

  // Taxi Shift state
  const [shiftData, setShiftData] = useState<TaxiShiftReport>(taxiShift);

  const totalKmDriven = trips.reduce((sum, t) => sum + (t.endKm - t.startKm), 0);
  const totalTripCost = trips.reduce((sum, t) => sum + t.costPerKm * Math.max(0, t.endKm - t.startKm), 0);

  const handleSaveTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find((v) => v.id === formVehId);
    const emp = employees.find((e) => e.id === formEmpId);

    if (!veh || formEndKm < formStartKm) {
      alert('Endkilometerstand muss größer oder gleich Startkilometerstand sein.');
      return;
    }

    onAddTrip({
      id: `trp-${Date.now()}`,
      vehicleId: formVehId,
      projectId: formProjId,
      employeeId: emp?.id,
      employeeName: emp?.name || 'Mitarbeiter',
      date: new Date(formDate).toISOString(),
      startKm: formStartKm,
      endKm: formEndKm,
      purpose: formPurpose.trim(),
      note: formNote.trim(),
      costPerKm: veh.costPerKm || 0.5,
    });

    setIsTripModalOpen(false);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehName.trim() || !vehPlate.trim()) return;

    onAddVehicle({
      id: `veh-${Date.now()}`,
      name: vehName.trim(),
      licensePlate: vehPlate.trim(),
      odometerKm: vehKm,
      costPerKm: vehCost,
      state: 'Verfügbar',
      note: '',
    });

    setVehName('');
    setVehPlate('');
    setIsVehicleModalOpen(false);
  };

  // Taxi shift calculations
  const drivenKm = Math.max(0, shiftData.kilometerEnd - shiftData.kilometerStart);
  const meterTurnover = Math.max(0, shiftData.meterEnd - shiftData.meterStart);
  const turnover = meterTurnover + shiftData.turnoverPlus - shiftData.turnoverMinus;
  const companyAmount = Math.max(0, turnover - shiftData.commission);
  const averagePerKm = drivenKm > 0 ? turnover / drivenKm : 0;
  const cashDifference =
    shiftData.cash +
    shiftData.income -
    shiftData.fuel -
    shiftData.wash -
    shiftData.cashless -
    shiftData.expenses -
    shiftData.socialDeductions;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
            Fuhrpark, Fahrtenbuch & Schichtabrechnung
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Fahrzeuge, Fahrten & Schicht
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVehicleModalOpen(true)}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
          >
            + Fahrzeug anlegen
          </button>
          <button
            onClick={() => setIsTripModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Fahrt erfassen</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl max-w-md text-xs">
        <button
          onClick={() => setTab('trips')}
          className={`flex-1 py-1.5 px-3 font-bold rounded-lg transition-all ${
            tab === 'trips' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Fahrtenbuch ({trips.length})
        </button>
        <button
          onClick={() => setTab('vehicles')}
          className={`flex-1 py-1.5 px-3 font-bold rounded-lg transition-all ${
            tab === 'vehicles' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Fahrzeugflotte ({vehicles.length})
        </button>
        <button
          onClick={() => setTab('taxi')}
          className={`flex-1 py-1.5 px-3 font-bold rounded-lg transition-all ${
            tab === 'taxi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Schichtabrechnung
        </button>
      </div>

      {/* Tab 1: Fahrtenbuch */}
      {tab === 'trips' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Gefahrene Kilometer
              </span>
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                {totalKmDriven.toFixed(1)} km
              </div>
              <span className="text-[11px] text-slate-500">Alle erfassten Fahrten</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Fahrtkosten kalkuliert
              </span>
              <div className="text-2xl font-black text-amber-600 tabular-nums">
                {totalTripCost.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </div>
              <span className="text-[11px] text-slate-500">Nach km-Kostensätzen</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Fahrzeugpool
              </span>
              <div className="text-2xl font-black text-blue-600 tabular-nums">
                {vehicles.length} Autos
              </div>
              <span className="text-[11px] text-slate-500">Transporter & Caddy</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Fahrtenbuch-Einträge
              </h3>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {trips.length === 0 ? (
                <div className="py-12 text-center text-slate-400">Keine Fahrten erfasst.</div>
              ) : (
                trips.map((trp) => {
                  const veh = vehicles.find((v) => v.id === trp.vehicleId);
                  const proj = projects.find((p) => p.id === trp.projectId);
                  const dist = Math.max(0, trp.endKm - trp.startKm);
                  const cost = dist * trp.costPerKm;

                  return (
                    <div key={trp.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{trp.purpose}</span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-700">
                            {veh?.licensePlate || 'M-ER'}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {veh?.name} · Fahrer: {trp.employeeName} · {new Date(trp.date).toLocaleDateString('de-DE')}
                          {proj && ` · Auftrag: ${proj.displayName}`}
                        </div>
                        {trp.note && <p className="text-[11px] text-slate-400 italic">"{trp.note}"</p>}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900 block text-sm">
                            {dist.toFixed(1)} km
                          </span>
                          <span className="font-mono text-emerald-600 text-[11px]">
                            {cost.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                          </span>
                        </div>

                        <button
                          onClick={() => onDeleteTrip(trp.id)}
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
        </div>
      )}

      {/* Tab 2: Fahrzeuge */}
      {tab === 'vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{v.name}</h3>
                    <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800 border border-slate-200 inline-block mt-1">
                      {v.licensePlate}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      v.state === 'Im Einsatz'
                        ? 'bg-emerald-100 text-emerald-800'
                        : v.state === 'Werkstatt'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {v.state}
                  </span>
                </div>

                {v.note && <p className="text-xs text-slate-500 italic">{v.note}</p>}
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Kilometerstand</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {v.odometerKm.toLocaleString('de-DE')} km
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Kostensatz</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">
                    {v.costPerKm.toFixed(2)} €/km
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Schichtabrechnung (Taxi / Shift Report Calculator) */}
      {tab === 'taxi' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Fahrzeug- & Schichtabrechnung
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kilometer, Taxameter/Umsatz, Ausgaben und Bar-Kassenabgleich
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                shiftData.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {shiftData.verified ? 'Geprüft & Freigegeben' : 'Entwurf'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Box 1: Kilometer & Schnitt */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                1. Kilometer
              </span>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">KM Ende:</span>
                <input
                  type="number"
                  value={shiftData.kilometerEnd}
                  onChange={(e) => setShiftData({ ...shiftData, kilometerEnd: Number(e.target.value) })}
                  className="w-24 rounded border border-slate-300 p-1 font-mono text-right"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">KM Beginn:</span>
                <input
                  type="number"
                  value={shiftData.kilometerStart}
                  onChange={(e) => setShiftData({ ...shiftData, kilometerStart: Number(e.target.value) })}
                  className="w-24 rounded border border-slate-300 p-1 font-mono text-right"
                />
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                <span>Summe gefahren:</span>
                <span className="font-mono text-blue-600">{drivenKm.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Schnitt € / km:</span>
                <span className="font-mono font-semibold">{averagePerKm.toFixed(2)} €/km</span>
              </div>
            </div>

            {/* Box 2: Taxameter & Umsatz */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                2. Taxameter & Umsatz
              </span>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Uhr Ende (€):</span>
                <input
                  type="number"
                  step="0.1"
                  value={shiftData.meterEnd}
                  onChange={(e) => setShiftData({ ...shiftData, meterEnd: Number(e.target.value) })}
                  className="w-24 rounded border border-slate-300 p-1 font-mono text-right"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Uhr Beginn (€):</span>
                <input
                  type="number"
                  step="0.1"
                  value={shiftData.meterStart}
                  onChange={(e) => setShiftData({ ...shiftData, meterStart: Number(e.target.value) })}
                  className="w-24 rounded border border-slate-300 p-1 font-mono text-right"
                />
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                <span>Gesamtumsatz:</span>
                <span className="font-mono text-emerald-600">
                  {turnover.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Firma Anteil:</span>
                <span className="font-mono font-semibold">
                  {companyAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            </div>

            {/* Box 3: Bar & Kassenabgleich */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                3. Kassenprüfung BAR
              </span>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Bar gezählt:</span>
                <input
                  type="number"
                  step="0.01"
                  value={shiftData.cash}
                  onChange={(e) => setShiftData({ ...shiftData, cash: Number(e.target.value) })}
                  className="w-24 rounded border border-slate-300 p-1 font-mono text-right font-bold"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Bargeldlos (Karte):</span>
                <input
                  type="number"
                  step="0.01"
                  value={shiftData.cashless}
                  onChange={(e) => setShiftData({ ...shiftData, cashless: Number(e.target.value) })}
                  className="w-24 rounded border border-slate-300 p-1 font-mono text-right"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Spesen / Tanken:</span>
                <input
                  type="number"
                  step="0.01"
                  value={shiftData.expenses}
                  onChange={(e) => setShiftData({ ...shiftData, expenses: Number(e.target.value) })}
                  className="w-24 rounded border border-slate-300 p-1 font-mono text-right"
                />
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                <span>Differenz Kasse:</span>
                <span className={`font-mono ${cashDifference >= -0.05 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {cashDifference.toFixed(2)} €
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                onUpdateTaxiShift(shiftData);
                alert('Schichtabrechnung erfolgreich gespeichert!');
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              Schicht speichern
            </button>
          </div>
        </div>
      )}

      {/* Trip Modal */}
      <Modal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        title="Fahrtenbucheintrag erfassen"
        subtitle="Kilometerstände und Projektzuordnung dokumentieren"
      >
        <form onSubmit={handleSaveTrip} className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Fahrzeug *</label>
            <select
              value={formVehId}
              onChange={(e) => {
                setFormVehId(e.target.value);
                const v = vehicles.find((veh) => veh.id === e.target.value);
                if (v) {
                  setFormStartKm(v.odometerKm);
                  setFormEndKm(v.odometerKm + 25);
                }
              }}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white font-semibold"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.licensePlate})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Fahrer (Mitarbeiter)</label>
              <select
                value={formEmpId}
                onChange={(e) => setFormEmpId(e.target.value)}
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
              <label className="mb-1 block font-semibold text-slate-700">Auftrag (Optional)</label>
              <select
                value={formProjId || ''}
                onChange={(e) => setFormProjId(Number(e.target.value) || undefined)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
              >
                <option value="">Werkstatt / Allgemein</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Datum</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Start KM</label>
              <input
                type="number"
                required
                value={formStartKm}
                onChange={(e) => setFormStartKm(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Ende KM</label>
              <input
                type="number"
                required
                value={formEndKm}
                onChange={(e) => setFormEndKm(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Fahrtzweck *</label>
            <input
              type="text"
              required
              value={formPurpose}
              onChange={(e) => setFormPurpose(e.target.value)}
              placeholder="z. B. Materialtransport Dachlatten"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsTripModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-700"
            >
              Fahrt speichern
            </button>
          </div>
        </form>
      </Modal>

      {/* Vehicle Modal */}
      <Modal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        title="Neues Fahrzeug im Fuhrpark erfassen"
        subtitle="Stammdaten für Fahrtenbuch und Kilometerkosten"
      >
        <form onSubmit={handleSaveVehicle} className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Modell / Bezeichnung *</label>
            <input
              type="text"
              required
              value={vehName}
              onChange={(e) => setVehName(e.target.value)}
              placeholder="z. B. Mercedes-Benz Sprinter 316 CDI"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Kennzeichen *</label>
              <input
                type="text"
                required
                value={vehPlate}
                onChange={(e) => setVehPlate(e.target.value)}
                placeholder="M-ER 2026"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Kilometerstand</label>
              <input
                type="number"
                value={vehKm}
                onChange={(e) => setVehKm(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Kosten (€ / km)</label>
              <input
                type="number"
                step="0.01"
                value={vehCost}
                onChange={(e) => setVehCost(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsVehicleModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-700"
            >
              Fahrzeug anlegen
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
