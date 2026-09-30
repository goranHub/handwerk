import React, { useState } from 'react';
import { generateQRCodeSvg, getGiroCodePayload } from '../../services/qrGenerator';
import { SalesDocument, CompanyProfile } from '../../types/erp';
import { QrCode, Copy, Check, Info } from 'lucide-react';
import { Modal } from './Modal';

interface GiroCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: SalesDocument;
  company: CompanyProfile;
}

export const GiroCodeModal: React.FC<GiroCodeModalProps> = ({
  isOpen,
  onClose,
  document,
  company,
}) => {
  const [copied, setCopied] = useState(false);

  const netTotal = document.items.reduce(
    (sum, item) => sum + (item.kind === 'Text' ? 0 : item.quantity * item.unitPrice),
    0
  );
  const taxRate = document.taxMode === 'Regelbesteuerung' ? document.taxRate : 0;
  const grossTotal = netTotal + (netTotal * taxRate) / 100 + (document.reminderFee || 0);

  const payload = getGiroCodePayload({
    bic: company.bic,
    name: company.companyName || company.ownerName,
    iban: company.iban,
    amount: grossTotal,
    reference: `Rechnung ${document.number}`,
  });

  const qrSvg = generateQRCodeSvg(payload, 200);

  const handleCopy = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="GiroCode (EPC-QR) für Banking-Apps"
      subtitle={`Rechnung ${document.number} sofort kontaktlos überweisen`}
      maxWidth="md"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-md">
          <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
        </div>

        <div className="w-full rounded-xl bg-slate-50 p-4 border border-slate-200 text-left text-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span>Empfänger:</span>
            <span className="font-semibold text-slate-800">{company.companyName}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>IBAN:</span>
            <span className="font-mono font-semibold text-slate-800">{company.iban}</span>
          </div>
          {company.bic && (
            <div className="flex justify-between items-center text-slate-500">
              <span>BIC:</span>
              <span className="font-mono font-semibold text-slate-800">{company.bic}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-slate-500">
            <span>Verwendungszweck:</span>
            <span className="font-semibold text-slate-800">Rechnung {document.number}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
            <span className="font-medium text-slate-700">Zu zahlender Betrag:</span>
            <span className="font-bold text-sm text-emerald-600 tabular-nums">
              {grossTotal.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-left text-xs text-amber-800 border border-amber-200/60">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Der Kunde scannt diesen GiroCode direkt in seiner Banking-App (Sparkasse, Volksbank, Deutsche Bank, Erste Bank etc.) und gibt die Überweisung ohne Tippfehler frei.
          </span>
        </div>

        <div className="flex w-full items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={handleCopy}
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Kopiert' : 'EPC-Text kopieren'}</span>
          </button>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Schließen
          </button>
        </div>
      </div>
    </Modal>
  );
};
