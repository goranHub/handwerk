import React, { useState } from 'react';
import {
  CompanyProfile,
  ERPStoreState,
} from '../types/erp';
import {
  Building2,
  Save,
  Download,
  Upload,
  RefreshCw,
  Server,
  Key,
  Shield,
  CheckCircle2,
  Copy,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { ERPStorage } from '../services/storage';

interface SettingsViewProps {
  company: CompanyProfile;
  serverUrl: string;
  serverInstance: string;
  serverToken: string;
  onUpdateCompany: (company: CompanyProfile) => void;
  onUpdateServerConfig: (url: string, instance: string, token: string) => void;
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  company,
  serverUrl,
  serverInstance,
  serverToken,
  onUpdateCompany,
  onUpdateServerConfig,
  onResetDemoData,
}) => {
  const [profile, setProfile] = useState<CompanyProfile>(company);
  const [srvUrl, setSrvUrl] = useState(serverUrl);
  const [srvInstance, setSrvInstance] = useState(serverInstance);
  const [srvToken, setSrvToken] = useState(serverToken);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveNotification, setSaveNotification] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompany(profile);
    setSaveNotification('Firmenprofil erfolgreich gespeichert!');
    setTimeout(() => setSaveNotification(''), 2500);
  };

  const handleSaveServer = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateServerConfig(srvUrl, srvInstance, srvToken);
    setSaveNotification('Server-Verbindungseinstellungen aktualisiert!');
    setTimeout(() => setSaveNotification(''), 2500);
  };

  const handleExportBackup = () => {
    const json = ERPStorage.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HandwerkerERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = ERPStorage.importBackupJson(content);
      if (success) {
        alert('Backup erfolgreich wiederhergestellt! Die App wird neu geladen.');
        window.location.reload();
      } else {
        alert('Fehler beim Einlesen der Backup-Datei.');
      }
    };
    reader.readAsText(file);
  };

  const workerPortalUrl = `${srvUrl.replace(/\/+$/, '')}/?instance=${encodeURIComponent(srvInstance)}`;

  const copyWorkerLink = () => {
    navigator.clipboard.writeText(workerPortalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
          Betriebsdaten & Administration
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
          Einstellungen & Datensicherung
        </h1>
      </div>

      {saveNotification && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Section 1: Firmenprofil & Meisterbetrieb Branding */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            1. Firmenprofil & Briefkopf
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Diese Daten erscheinen automatisch auf Angeboten, Rechnungen und E-Rechnungen.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Firmenname (wie im Register)</label>
              <input
                type="text"
                value={profile.companyName}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Inhaber / Geschäftsführer</label>
              <input
                type="text"
                value={profile.ownerName}
                onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="mb-1 block font-semibold text-slate-700">Straße und Hausnummer</label>
              <input
                type="text"
                value={profile.street}
                onChange={(e) => setProfile({ ...profile, street: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">PLZ & Ort</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="PLZ"
                  value={profile.postalCode}
                  onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                  className="w-20 rounded-lg border border-slate-300 p-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="Ort"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-300 p-2 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Telefonnummer</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">E-Mail für Belege</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Website</label>
              <input
                type="text"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">IBAN für Überweisungen & GiroCode</label>
              <input
                type="text"
                value={profile.iban}
                onChange={(e) => setProfile({ ...profile, iban: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">BIC</label>
              <input
                type="text"
                value={profile.bic}
                onChange={(e) => setProfile({ ...profile, bic: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Bankname</label>
              <input
                type="text"
                value={profile.bankName}
                onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">USt-IdNr.</label>
              <input
                type="text"
                value={profile.vatId}
                onChange={(e) => setProfile({ ...profile, vatId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Steuernummer</label>
              <input
                type="text"
                value={profile.taxNumber}
                onChange={(e) => setProfile({ ...profile, taxNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Standard-Zahlungsziel (Tage)</label>
            <input
              type="number"
              min="0"
              value={profile.defaultPaymentDays}
              onChange={(e) => setProfile({ ...profile, defaultPaymentDays: Number(e.target.value) })}
              className="w-32 rounded-lg border border-slate-300 p-2 text-xs font-bold"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Fußzeile auf Angeboten & Rechnungen</label>
            <input
              type="text"
              value={profile.footerText}
              onChange={(e) => setProfile({ ...profile, footerText: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              <span>Firmendaten speichern</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Datensicherung & Backup */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            2. Datensicherung & Backup (JSON)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Komplettes lokales Backup inklusive Aufträge, Zeiterfassung, Rechnungen und Fotos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Alle Daten als JSON exportieren</span>
          </button>

          <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs">
            <Upload className="h-4 w-4 text-slate-500" />
            <span>JSON-Backup wiederherstellen</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (confirm('Alle Beispieldaten auf Werkseinstellung zurücksetzen?')) {
                onResetDemoData();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-semibold p-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Auf Standard-Demodaten zurücksetzen</span>
          </button>
        </div>
      </div>

      {/* Section 3: Firmenserver & Mitarbeiterportal */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            3. Firmenserver & Mitarbeiter-Portal
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kopplung mit dem PHP/SQLite Firmenserver für externe Mitarbeiterzugänge
          </p>
        </div>

        <form onSubmit={handleSaveServer} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Server-Adresse</label>
              <input
                type="text"
                value={srvUrl}
                onChange={(e) => setSrvUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Firmen-Instanz</label>
              <input
                type="text"
                value={srvInstance}
                onChange={(e) => setSrvInstance(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-700">Büro-Zugangscode</label>
              <input
                type="text"
                value={srvToken}
                onChange={(e) => setSrvToken(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono"
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-800 block text-xs">Mitarbeiter-Portal Link:</span>
              <span className="font-mono text-slate-500 text-[11px] break-all">{workerPortalUrl}</span>
            </div>
            <button
              type="button"
              onClick={copyWorkerLink}
              className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 shrink-0"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{copiedLink ? 'Kopiert!' : 'Link kopieren'}</span>
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800"
            >
              Servereinstellungen speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
