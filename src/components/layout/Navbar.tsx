import React, { useState, useEffect } from 'react';
import {
  Timer,
  Pause,
  Play,
  Square,
  Plus,
  Search,
  Globe,
  HardHat,
  Bell,
  Menu,
} from 'lucide-react';
import { ActiveBooking, Language } from '../../types/erp';

interface NavbarProps {
  activeBooking: ActiveBooking;
  onPauseResume: () => void;
  onStopBooking: () => void;
  onOpenQuickTime: () => void;
  onOpenSearch: () => void;
  onOpenNewProject: () => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onToggleMobileSidebar: () => void;
  activeViewTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeBooking,
  onPauseResume,
  onStopBooking,
  onOpenQuickTime,
  onOpenSearch,
  onOpenNewProject,
  currentLanguage,
  onLanguageChange,
  onToggleMobileSidebar,
}) => {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    if (!activeBooking.aktiv || !activeBooking.startzeit) return;

    const interval = setInterval(() => {
      const start = new Date(activeBooking.startzeit!).getTime();
      const now = Date.now();
      const pauseTotal = (activeBooking.pausenSekunden || 0) * 1000;
      const currentPause =
        activeBooking.pausiert && activeBooking.pauseSeit
          ? now - new Date(activeBooking.pauseSeit).getTime()
          : 0;

      const diffSec = Math.max(0, Math.floor((now - start - pauseTotal - currentPause) / 1000));
      const hours = Math.floor(diffSec / 3600);
      const mins = Math.floor((diffSec % 3600) / 60);
      const secs = diffSec % 60;

      setElapsed(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeBooking]);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Zone 1: Brand & Mobile Drawer Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Menü öffnen"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-amber-500 shadow-sm">
            <HardHat className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              HANDWERKER <span className="text-amber-600">ERP</span>
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Live Punch Clock Banner (if active) or Quick Search trigger */}
      <div className="hidden md:flex items-center gap-3">
        {activeBooking.aktiv ? (
          <div className="flex items-center gap-3 rounded-full border border-amber-300 bg-amber-50/80 px-4 py-1.5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className={`relative flex h-2.5 w-2.5 ${activeBooking.pausiert ? 'bg-amber-500' : 'bg-emerald-500'} rounded-full`}>
                {!activeBooking.pausiert && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
              </span>
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[200px]">
                {activeBooking.projektName || 'Auftrag'}
              </span>
              <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                {elapsed}
              </span>
            </div>

            <div className="flex items-center gap-1 border-l border-amber-200 pl-2">
              <button
                type="button"
                onClick={onPauseResume}
                title={activeBooking.pausiert ? 'Fortsetzen' : 'Pause'}
                className="rounded-full p-1 text-slate-700 hover:bg-amber-200/60"
              >
                {activeBooking.pausiert ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5 fill-current" />}
              </button>
              <button
                type="button"
                onClick={onStopBooking}
                title="Arbeitszeit beenden"
                className="rounded-full p-1 text-red-600 hover:bg-red-100"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-white transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Auftrag, Kunde, Material suchen …</span>
            <kbd className="hidden lg:inline-block rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-200">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Zone 3: Actions (Quick Time, New Project, Language) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
          title="Suche"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Language selector */}
        <div className="relative">
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="de">🇩🇪 DE</option>
            <option value="bs">🇧🇦 EX-YU</option>
            <option value="en">🇬🇧 EN</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onOpenQuickTime}
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Timer className="h-3.5 w-3.5 text-amber-600" />
          <span>Zeit buchen</span>
        </button>

        <button
          type="button"
          onClick={onOpenNewProject}
          className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Neuer Auftrag</span>
        </button>
      </div>
    </header>
  );
};
