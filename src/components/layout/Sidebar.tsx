import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Timer,
  Calendar,
  Users,
  FileText,
  BookOpen,
  Camera,
  Boxes,
  AlertTriangle,
  Car,
  UserCheck,
  Settings,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export type ERPView =
  | 'dashboard'
  | 'projects'
  | 'tasks'
  | 'time'
  | 'calendar'
  | 'crm'
  | 'sales'
  | 'journal'
  | 'photos'
  | 'inventory'
  | 'defects'
  | 'fleet'
  | 'team'
  | 'settings';

interface SidebarProps {
  currentView: ERPView;
  onSelectView: (view: ERPView) => void;
  badgeCounts: {
    tasks?: number;
    defects?: number;
    inventory?: number;
    activeTimer?: boolean;
    unpaidInvoices?: number;
  };
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: ERPView;
  label: string;
  icon: any;
  badge?: number;
  badgeColor?: string;
  isLive?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  badgeCounts,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navSections: NavSection[] = [
    {
      title: 'HAUPTMENÜ',
      items: [
        { id: 'dashboard' as ERPView, label: 'Heute & Dashboard', icon: LayoutDashboard },
        { id: 'projects' as ERPView, label: 'Aufträge & Baustellen', icon: Briefcase },
        { id: 'tasks' as ERPView, label: 'Planfred Aufgaben', icon: CheckSquare, badge: badgeCounts.tasks },
        { id: 'calendar' as ERPView, label: 'Termine & Einsätze', icon: Calendar },
        { id: 'time' as ERPView, label: 'Zeiterfassung & Kalender', icon: Timer, isLive: badgeCounts.activeTimer },
      ],
    },
    {
      title: 'BAUSTELLE & AUSFÜHRUNG',
      items: [
        { id: 'journal' as ERPView, label: 'Bautagebuch & Rapporte', icon: BookOpen },
        { id: 'photos' as ERPView, label: 'Foto-Dokumentation', icon: Camera },
        { id: 'defects' as ERPView, label: 'Mängel & Reklamationen', icon: AlertTriangle, badge: badgeCounts.defects, badgeColor: 'bg-red-500' },
        { id: 'inventory' as ERPView, label: 'Materiallager & Entnahme', icon: Boxes, badge: badgeCounts.inventory, badgeColor: 'bg-amber-500' },
      ],
    },
    {
      title: 'BÜRO & FINANZEN',
      items: [
        { id: 'crm' as ERPView, label: 'Kunden CRM', icon: Users },
        { id: 'sales' as ERPView, label: 'Angebote & Rechnungen', icon: FileText, badge: badgeCounts.unpaidInvoices, badgeColor: 'bg-blue-500' },
        { id: 'fleet' as ERPView, label: 'Fuhrpark & Schicht', icon: Car },
      ],
    },
    {
      title: 'VERWALTUNG',
      items: [
        { id: 'team' as ERPView, label: 'Mitarbeiter & Urlaub', icon: UserCheck },
        { id: 'settings' as ERPView, label: 'Einstellungen & Backup', icon: Settings },
      ],
    },
  ];

  const handleSelect = (view: ERPView) => {
    onSelectView(view);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand in mobile sidebar */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 lg:hidden">
          <span className="font-extrabold text-slate-900">
            HANDWERKER <span className="text-amber-600">ERP</span>
          </span>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <h4 className="px-3 text-[11px] font-bold tracking-wider text-slate-400">
                {sec.title}
              </h4>
              <nav className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 ${
                            isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.isLive && (
                          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white ${
                              item.badgeColor || (isActive ? 'bg-amber-500' : 'bg-slate-800')
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom user / quick status banner */}
        <div className="border-t border-slate-100 p-3 bg-slate-50/50">
          <div className="flex items-center justify-between px-2 py-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-600">Offline-Ready PWA</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">v28 PRO</span>
          </div>
        </div>
      </aside>
    </>
  );
};
