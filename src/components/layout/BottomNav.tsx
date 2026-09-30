import React from 'react';
import { Home, Briefcase, Calendar, Timer, Grid } from 'lucide-react';
import { ERPView } from './Sidebar';

interface BottomNavProps {
  currentView: ERPView;
  onSelectView: (view: ERPView) => void;
  activeTimer?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onSelectView,
  activeTimer,
}) => {
  const tabs = [
    { id: 'dashboard' as ERPView, label: 'Heute', icon: Home },
    { id: 'projects' as ERPView, label: 'Aufträge', icon: Briefcase },
    { id: 'calendar' as ERPView, label: 'Kalender', icon: Calendar },
    { id: 'time' as ERPView, label: 'Zeit', icon: Timer, isLive: activeTimer },
    { id: 'tasks' as ERPView, label: 'Aufgaben', icon: Grid },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur-md px-2 lg:hidden no-print">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectView(tab.id)}
            className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-colors ${
              isActive ? 'text-amber-600 font-bold' : 'text-slate-500 font-medium hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {tab.isLive && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
