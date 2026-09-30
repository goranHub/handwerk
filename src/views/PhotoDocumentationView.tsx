import React, { useState } from 'react';
import {
  SitePhotoRecord,
  SitePhotoPhase,
  ERPProject,
} from '../types/erp';
import {
  Camera,
  Plus,
  Filter,
  Columns,
  Trash2,
  Calendar,
  Image as ImageIcon,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { BeforeAfterSlider } from '../components/common/BeforeAfterSlider';

interface PhotoDocumentationViewProps {
  photos: SitePhotoRecord[];
  projects: ERPProject[];
  onAddPhoto: (photo: Omit<SitePhotoRecord, 'id' | 'createdAt'>) => void;
  onDeletePhoto: (id: string) => void;
}

export const PhotoDocumentationView: React.FC<PhotoDocumentationViewProps> = ({
  photos,
  projects,
  onAddPhoto,
  onDeletePhoto,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<SitePhotoPhase | 'ALL'>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<number | 'ALL'>('ALL');
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload form state
  const [formProjectId, setFormProjectId] = useState<number>(projects[0]?.id || 1);
  const [formPhase, setFormPhase] = useState<SitePhotoPhase>('Vorher');
  const [formCaption, setFormCaption] = useState('');
  const [formDataUrl, setFormDataUrl] = useState('');

  const filteredPhotos = photos.filter((p) => {
    if (selectedPhase !== 'ALL' && p.phase !== selectedPhase) return false;
    if (selectedProjectId !== 'ALL' && p.projectId !== selectedProjectId) return false;
    return true;
  });

  const beforePhoto = photos.find((p) => p.phase === 'Vorher');
  const afterPhoto = photos.find((p) => p.phase === 'Nachher');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormDataUrl((event.target?.result as string) || '');
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDataUrl) {
      alert('Bitte wähle ein Foto aus.');
      return;
    }

    onAddPhoto({
      projectId: formProjectId,
      phase: formPhase,
      caption: formCaption.trim(),
      dataUrl: formDataUrl,
    });

    setFormCaption('');
    setFormDataUrl('');
    setIsUploadModalOpen(false);
  };

  const getPhaseBadge = (ph: SitePhotoPhase) => {
    switch (ph) {
      case 'Vorher':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Während':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Nachher':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Mangel':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
            Beweissicherung & Baufortschritt
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Foto-Dokumentation ({photos.length})
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {beforePhoto && afterPhoto && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Columns className="h-4 w-4 text-blue-600" />
              <span>Vorher / Nachher Vergleich</span>
            </button>
          )}

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Foto hinzufügen</span>
          </button>
        </div>
      </div>

      {/* Filter Matrix */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-bold mr-1">Phase:</span>
          {(['ALL', 'Vorher', 'Während', 'Nachher', 'Mangel'] as const).map((phase) => (
            <button
              key={phase}
              onClick={() => setSelectedPhase(phase)}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all whitespace-nowrap ${
                selectedPhase === phase
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {phase === 'ALL' ? 'Alle Phasen' : phase}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Auftrag:</span>
          <select
            value={selectedProjectId}
            onChange={(e) =>
              setSelectedProjectId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
            }
            className="rounded-xl border border-slate-200 bg-slate-50 p-1.5 font-semibold text-slate-800 text-xs"
          >
            <option value="ALL">Alle Baustellen</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Camera className="h-10 w-10 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-sm font-semibold text-slate-600">Keine Fotos für diese Phase gefunden</p>
            <p className="text-xs text-slate-400 mt-1">Lade Baustellenfotos zur lückenlosen Dokumentation hoch.</p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
            >
              + Erstes Foto erfassen
            </button>
          </div>
        ) : (
          filteredPhotos.map((photo) => {
            const project = projects.find((p) => p.id === photo.projectId);
            return (
              <div
                key={photo.id}
                className="group relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={
                      photo.dataUrl ||
                      'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={photo.caption || 'Baustellenfoto'}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs border ${getPhaseBadge(
                        photo.phase
                      )}`}
                    >
                      {photo.phase}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeletePhoto(photo.id)}
                    className="absolute top-2 right-2 rounded-full bg-slate-900/70 p-1.5 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-xs"
                    title="Foto löschen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="p-3.5 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-900 line-clamp-1">
                    {photo.caption || 'Baustellenzustand'}
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span className="truncate max-w-[140px]">
                      {project?.displayName || `Auftrag #${photo.projectId}`}
                    </span>
                    <span>{new Date(photo.createdAt).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Comparison Modal */}
      {beforePhoto && afterPhoto && (
        <Modal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          title="Vorher / Nachher Schieberegler"
          subtitle="Beweiskräftiger Vorher-Nachher-Vergleich der erbrachten Handwerksleistung"
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <BeforeAfterSlider
              beforeImage={beforePhoto.dataUrl}
              afterImage={afterPhoto.dataUrl}
              beforeLabel={`Vorher (${beforePhoto.caption || 'Bestand'})`}
              afterLabel={`Nachher (${afterPhoto.caption || 'Fertigstellung'})`}
            />
            <p className="text-xs text-slate-500 text-center">
              Ziehe den mittleren Schieberegler nach links und rechts, um die Veränderung zu präsentieren.
            </p>
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Baustellenfoto hochladen & zuordnen"
        subtitle="Foto der Baustelle aufnehmen oder aus der Galerie auswählen"
      >
        <form onSubmit={handleSavePhoto} className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate-700">Auftrag / Baustelle *</label>
            <select
              value={formProjectId}
              onChange={(e) => setFormProjectId(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Dokumentationsphase</label>
            <div className="grid grid-cols-4 gap-2">
              {(['Vorher', 'Während', 'Nachher', 'Mangel'] as const).map((ph) => (
                <button
                  key={ph}
                  type="button"
                  onClick={() => setFormPhase(ph)}
                  className={`rounded-lg py-2 text-center text-xs font-bold border transition-colors ${
                    formPhase === ph
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {ph}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Bilddatei auswählen *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          {formDataUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200 max-h-48 flex justify-center bg-slate-100">
              <img src={formDataUrl} alt="Vorschau" className="h-full object-contain" />
            </div>
          )}

          <div>
            <label className="mb-1 block font-semibold text-slate-700">Beschreibung / Notiz</label>
            <input
              type="text"
              value={formCaption}
              onChange={(e) => setFormCaption(e.target.value)}
              placeholder="z. B. Zustand nach Entfernung der alten Dämmung"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-700"
            >
              Foto speichern
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
