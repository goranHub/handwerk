/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ERPStorage } from './services/storage';
import {
  ERPProject,
  ProjectDraft,
  TimeEntrySummary,
  SalesDocument,
  OpsTask,
  OpsDefect,
  OpsDailyReport,
  SitePhotoRecord,
  Customer,
  CustomerActivity,
  MaterialItem,
  OpsVehicle,
  OpsTrip,
  TaxiShiftReport,
  OpsEmployee,
  OpsAbsence,
  OpsMaterialOrder,
  CompanyProfile,
  Language,
  ERPStoreState,
  ProjectMaterialItem,
  ChecklistItem,
} from './types/erp';

// Layout & Navigation
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ERPView } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Views
import { DashboardView } from './views/DashboardView';
import { ProjectsView, BUILTIN_TEMPLATES } from './views/ProjectsView';
import { ProjectDetailView } from './views/ProjectDetailView';
import { PlanfredTasksView } from './views/PlanfredTasksView';
import { TimeTrackingView } from './views/TimeTrackingView';
import { CRMView } from './views/CRMView';
import { SalesView } from './views/SalesView';
import { BautagebuchView } from './views/BautagebuchView';
import { PhotoDocumentationView } from './views/PhotoDocumentationView';
import { InventoryView } from './views/InventoryView';
import { DefectsView } from './views/DefectsView';
import { FleetView } from './views/FleetView';
import { TeamView } from './views/TeamView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [state, setState] = useState<ERPStoreState>(ERPStorage.getState());
  const [currentView, setCurrentView] = useState<ERPView>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = ERPStorage.subscribe((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  // Keyboard shortcut Cmd/Ctrl + K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active Punch Clock Handlers
  const handleStartBooking = (projectId: number, stepName: string, employeeId?: string) => {
    const project = state.projects.find((p: ERPProject) => p.id === projectId);
    const employee = state.employees.find((e: OpsEmployee) => e.id === employeeId) || state.employees[0];
    const hourlyRate = employee?.hourlyCostRate || 52;

    ERPStorage.setState((prev) => ({
      ...prev,
      activeBooking: {
        aktiv: true,
        projektId: projectId,
        projektName: project?.displayName || `Auftrag #${projectId}`,
        arbeitsgangName: stepName,
        startzeit: new Date().toISOString(),
        pausiert: false,
        pausenSekunden: 0,
        employeeId: employee?.id,
        employeeName: employee?.name,
        hourlyCostRate: hourlyRate,
      },
    }));
  };

  const handlePauseResumeBooking = () => {
    const booking = state.activeBooking;
    if (!booking.aktiv) return;

    if (booking.pausiert) {
      // Resume
      const now = Date.now();
      const pauseStart = booking.pauseSeit ? new Date(booking.pauseSeit).getTime() : now;
      const additionalPauseSec = Math.max(0, Math.floor((now - pauseStart) / 1000));
      ERPStorage.setState((prev) => ({
        ...prev,
        activeBooking: {
          ...prev.activeBooking,
          pausiert: false,
          pauseSeit: undefined,
          pausenSekunden: (prev.activeBooking.pausenSekunden || 0) + additionalPauseSec,
        },
      }));
    } else {
      // Pause
      ERPStorage.setState((prev) => ({
        ...prev,
        activeBooking: {
          ...prev.activeBooking,
          pausiert: true,
          pauseSeit: new Date().toISOString(),
        },
      }));
    }
  };

  const handleStopBooking = () => {
    const booking = state.activeBooking;
    if (!booking.aktiv || !booking.startzeit) return;

    const endedAt = new Date().toISOString();
    const pauseSec =
      (booking.pausenSekunden || 0) +
      (booking.pausiert && booking.pauseSeit
        ? Math.max(0, Math.floor((Date.now() - new Date(booking.pauseSeit).getTime()) / 1000))
        : 0);

    const durSec =
      (new Date(endedAt).getTime() - new Date(booking.startzeit).getTime()) / 1000 - pauseSec;
    const durHours = Math.max(0, durSec / 3600);

    const newEntry: TimeEntrySummary = {
      id: `te-${Date.now()}`,
      projectId: booking.projektId || 1,
      projectName: booking.projektName || 'Auftrag',
      workStepName: booking.arbeitsgangName || 'Montage',
      startedAt: booking.startzeit,
      endedAt,
      pauseSeconds: pauseSec,
      travelSeconds: 0,
      employeeId: booking.employeeId,
      employeeName: booking.employeeName,
      hourlyCostRate: booking.hourlyCostRate || 52,
    };

    // Calculate labor cost
    const newLaborCost = {
      id: `lc-${Date.now()}`,
      timeEntryId: newEntry.id,
      projectId: newEntry.projectId,
      employeeId: newEntry.employeeId,
      employeeName: newEntry.employeeName || 'Mitarbeiter',
      hours: durHours,
      hourlyRate: newEntry.hourlyCostRate || 52,
      amount: durHours * (newEntry.hourlyCostRate || 52),
      date: endedAt,
    };

    ERPStorage.setState((prev) => ({
      ...prev,
      timeEntries: [newEntry, ...prev.timeEntries],
      laborCosts: [newLaborCost, ...prev.laborCosts],
      activeBooking: {
        aktiv: false,
        projektId: undefined,
        projektName: undefined,
        arbeitsgangName: undefined,
        startzeit: undefined,
        pausiert: false,
        pausenSekunden: 0,
      },
    }));
  };

  // Projects Handlers
  const handleCreateProject = (draft: ProjectDraft) => {
    const nextId = Math.max(0, ...state.projects.map((p: ERPProject) => p.id)) + 1;
    const newProject: ERPProject = {
      id: nextId,
      name: draft.name,
      displayName: draft.name,
      projektnummer: draft.projektnummer || `A-${new Date().getFullYear()}-00${nextId}`,
      kunde: draft.kunde,
      adresse: draft.adresse,
      customerId: draft.customerId,
      status: 'In Arbeit',
      createdAt: new Date().toISOString(),
    };

    // Apply template if chosen
    let newSteps = state.projectSteps[nextId] || [];
    let newPlanned = state.plannedMaterials[nextId] || [];
    let newChecklistItems: any[] = [];

    if (draft.templateId) {
      const tmpl = BUILTIN_TEMPLATES.find((t) => t.id === draft.templateId);
      if (tmpl) {
        newSteps = tmpl.workSteps.map((ws, i) => ({
          id: nextId * 100 + i,
          name: ws,
          sortOrder: i,
          isActive: true,
        }));
        newPlanned = tmpl.materials.map((m, i) => ({
          id: `plan-${nextId}-${i}`,
          name: m.name,
          quantity: m.quantity,
          unit: m.unit,
          note: `Aus Vorlage ${tmpl.name}`,
        }));
        newChecklistItems = tmpl.checklist.map((chk, i) => ({
          id: `chk-${nextId}-${i}`,
          projectId: nextId,
          title: chk,
          isDone: false,
          sortOrder: i,
        }));
      }
    }

    ERPStorage.setState((prev) => ({
      ...prev,
      projects: [newProject, ...prev.projects],
      projectSteps: { ...prev.projectSteps, [nextId]: newSteps },
      plannedMaterials: { ...prev.plannedMaterials, [nextId]: newPlanned },
      checklist: [...newChecklistItems, ...prev.checklist],
    }));

    setSelectedProjectId(nextId);
  };

  // Checklist Handlers
  const handleToggleChecklist = (itemId: string) => {
    ERPStorage.setState((prev) => ({
      ...prev,
      checklist: prev.checklist.map((c: ChecklistItem) => (c.id === itemId ? { ...c, isDone: !c.isDone } : c)),
    }));
  };

  const handleAddChecklistItem = (projectId: number, title: string) => {
    const existing = state.checklist.filter((c: ChecklistItem) => c.projectId === projectId);
    const newItem = {
      id: `chk-${Date.now()}`,
      projectId,
      title,
      isDone: false,
      sortOrder: existing.length,
    };
    ERPStorage.setState((prev) => ({
      ...prev,
      checklist: [...prev.checklist, newItem],
    }));
  };

  // Material Handlers
  const handleConsumeMaterial = (projectId: number, materialId: string, quantity: number) => {
    const mat = state.materials.find((m: MaterialItem) => m.id === materialId);
    if (!mat) return;

    const newBooking = {
      id: `pm-${Date.now()}`,
      projectId,
      materialId,
      name: mat.name,
      quantity,
      unit: mat.unit,
      unitPrice: mat.unitPrice,
      createdAt: new Date().toISOString(),
    };

    // Deduct warehouse stock
    ERPStorage.setState((prev) => ({
      ...prev,
      materials: prev.materials.map((m: MaterialItem) =>
        m.id === materialId ? { ...m, stock: Math.max(0, m.stock - quantity) } : m
      ),
      projectMaterials: [newBooking, ...prev.projectMaterials],
    }));
  };

  const handleRevertConsumption = (consumptionId: string) => {
    const item = state.projectMaterials.find((pm: ProjectMaterialItem) => pm.id === consumptionId);
    if (!item) return;

    ERPStorage.setState((prev) => ({
      ...prev,
      materials: prev.materials.map((m: MaterialItem) =>
        m.id === item.materialId ? { ...m, stock: m.stock + item.quantity } : m
      ),
      projectMaterials: prev.projectMaterials.filter((pm: ProjectMaterialItem) => pm.id !== consumptionId),
    }));
  };

  // Digital Signature on Project
  const handleSaveSignature = (projectId: number, signerName: string, signatureDataUrl: string) => {
    const newRecord = {
      id: `sig-${Date.now()}`,
      projectId,
      signerName,
      signedAt: new Date().toISOString(),
      purpose: 'Abnahme durch Kunden / Bauleiter',
      signatureDataUrl,
    };
    ERPStorage.setState((prev) => ({
      ...prev,
      signatures: [newRecord, ...prev.signatures],
    }));
  };

  // Controlling budget update
  const handleUpdateBudget = (
    projectId: number,
    budget: { plannedHours: number; laborBudget: number; materialBudget: number }
  ) => {
    ERPStorage.setState((prev) => ({
      ...prev,
      budgets: {
        ...prev.budgets,
        [projectId]: {
          projectId,
          plannedHours: budget.plannedHours,
          laborBudget: budget.laborBudget,
          materialBudget: budget.materialBudget,
          travelBudget: prev.budgets[projectId]?.travelBudget || 400,
          otherBudget: prev.budgets[projectId]?.otherBudget || 500,
          warningThresholdPercent: 85,
        },
      },
    }));
  };

  // Task Handlers
  const handleAddTask = (task: OpsTask) => {
    ERPStorage.setState((prev) => ({
      ...prev,
      tasks: [task, ...prev.tasks],
    }));
  };

  const handleUpdateTask = (task: OpsTask) => {
    ERPStorage.setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === task.id ? task : t)),
    }));
  };

  const handleDeleteTask = (id: string) => {
    ERPStorage.setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  // Time entries handlers
  const handleAddManualTime = (entry: Omit<TimeEntrySummary, 'id'>) => {
    const fullEntry: TimeEntrySummary = {
      ...entry,
      id: `te-${Date.now()}`,
    };
    const durHours =
      ((new Date(entry.endedAt).getTime() - new Date(entry.startedAt).getTime()) / 1000 -
        (entry.pauseSeconds || 0)) /
      3600;

    const newLaborCost = {
      id: `lc-${Date.now()}`,
      timeEntryId: fullEntry.id,
      projectId: entry.projectId,
      employeeId: entry.employeeId,
      employeeName: entry.employeeName || 'Mitarbeiter',
      hours: durHours,
      hourlyRate: entry.hourlyCostRate || 52,
      amount: durHours * (entry.hourlyCostRate || 52),
      date: entry.endedAt,
    };

    ERPStorage.setState((prev) => ({
      ...prev,
      timeEntries: [fullEntry, ...prev.timeEntries],
      laborCosts: [newLaborCost, ...prev.laborCosts],
    }));
  };

  const handleUpdateManualTime = (entry: TimeEntrySummary) => {
    ERPStorage.setState((prev) => ({
      ...prev,
      timeEntries: prev.timeEntries.map((te) => (te.id === entry.id ? entry : te)),
    }));
  };

  const handleDeleteManualTime = (id: string) => {
    ERPStorage.setState((prev) => ({
      ...prev,
      timeEntries: prev.timeEntries.filter((te) => te.id !== id),
      laborCosts: prev.laborCosts.filter((lc) => lc.timeEntryId !== id),
    }));
  };

  // Sales Handlers
  const handleAddSalesDocument = (doc: SalesDocument) => {
    ERPStorage.setState((prev) => ({
      ...prev,
      salesDocuments: [doc, ...prev.salesDocuments],
    }));
  };

  const handleUpdateSalesDocument = (doc: SalesDocument) => {
    ERPStorage.setState((prev) => ({
      ...prev,
      salesDocuments: prev.salesDocuments.map((d) => (d.id === doc.id ? doc : d)),
    }));
  };

  const handleDeleteSalesDocument = (id: string) => {
    ERPStorage.setState((prev) => ({
      ...prev,
      salesDocuments: prev.salesDocuments.filter((d) => d.id !== id),
    }));
  };

  const handleCreateProjectFromOffer = (offer: SalesDocument) => {
    const nextId = Math.max(0, ...state.projects.map((p: ERPProject) => p.id)) + 1;
    const newProj: ERPProject = {
      id: nextId,
      name: `Auftrag ${offer.customerName} (${offer.number})`,
      displayName: `Auftrag ${offer.customerName} (${offer.number})`,
      projektnummer: `A-${new Date().getFullYear()}-00${nextId}`,
      kunde: offer.customerName,
      adresse: offer.customerAddress,
      status: 'In Arbeit',
      createdAt: new Date().toISOString(),
    };
    const updatedOffer: SalesDocument = {
      ...offer,
      projectId: nextId,
      projectName: newProj.displayName,
      status: 'Angenommen',
    };
    ERPStorage.setState((prev) => ({
      ...prev,
      projects: [newProj, ...prev.projects],
      salesDocuments: prev.salesDocuments.map((d) => (d.id === offer.id ? updatedOffer : d)),
    }));
    setSelectedProjectId(nextId);
  };

  const handleNavigateToResult = (view: ERPView, projectId?: number) => {
    setCurrentView(view);
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  };

  // Count active badges
  const badgeCounts = {
    tasks: state.tasks.filter((t: OpsTask) => t.status !== 'Erledigt').length,
    defects: state.defects.filter((d: OpsDefect) => d.status !== 'Abgeschlossen' && d.status !== 'Behoben').length,
    inventory: state.materials.filter((m: MaterialItem) => m.stock <= m.minimumStock).length,
    activeTimer: state.activeBooking.aktiv,
    unpaidInvoices: state.salesDocuments.filter((s: SalesDocument) => s.type === 'Rechnung' && s.status !== 'Bezahlt').length,
  };

  // Active Project if in detail mode
  const activeProject = selectedProjectId
    ? state.projects.find((p: ERPProject) => p.id === selectedProjectId)
    : null;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar for Desktop & Tablet */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          setSelectedProjectId(null);
        }}
        badgeCounts={badgeCounts}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          activeBooking={state.activeBooking}
          onPauseResume={handlePauseResumeBooking}
          onStopBooking={handleStopBooking}
          onOpenQuickTime={() => {
            setCurrentView('time');
            setSelectedProjectId(null);
          }}
          onOpenSearch={() => setIsGlobalSearchOpen(true)}
          onOpenNewProject={() => {
            setCurrentView('projects');
            setSelectedProjectId(null);
          }}
          currentLanguage={state.language}
          onLanguageChange={(lang) => ERPStorage.setState({ language: lang })}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeProject && currentView === 'projects' ? (
            <ProjectDetailView
              project={activeProject}
              state={state}
              onBack={() => setSelectedProjectId(null)}
              onNavigate={(v) => {
                setCurrentView(v);
                setSelectedProjectId(null);
              }}
              onToggleChecklist={handleToggleChecklist}
              onAddChecklistItem={handleAddChecklistItem}
              onConsumeMaterial={handleConsumeMaterial}
              onSaveSignature={handleSaveSignature}
              onUpdateBudget={handleUpdateBudget}
              onStartBooking={(pid, step) => handleStartBooking(pid, step)}
            />
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardView
                  state={state}
                  onNavigate={(v, pid) => {
                    setCurrentView(v);
                    if (pid) setSelectedProjectId(pid);
                  }}
                  onOpenNewProject={() => {
                    setCurrentView('projects');
                    setSelectedProjectId(null);
                  }}
                  onOpenQuickTime={() => {
                    setCurrentView('time');
                    setSelectedProjectId(null);
                  }}
                  onPauseResumeTimer={handlePauseResumeBooking}
                  onStopTimer={handleStopBooking}
                />
              )}

              {currentView === 'projects' && (
                <ProjectsView
                  projects={state.projects}
                  customers={state.customers}
                  onSelectProject={(pid) => setSelectedProjectId(pid)}
                  onCreateProject={handleCreateProject}
                />
              )}

              {currentView === 'tasks' && (
                <PlanfredTasksView
                  tasks={state.tasks}
                  projects={state.projects}
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                />
              )}

              {currentView === 'time' && (
                <TimeTrackingView
                  activeBooking={state.activeBooking}
                  timeEntries={state.timeEntries}
                  projects={state.projects}
                  steps={state.steps}
                  categories={state.categories}
                  employees={state.employees}
                  absences={state.absences}
                  onStartBooking={(pid, st, empId) => handleStartBooking(pid, st, empId)}
                  onPauseResumeBooking={handlePauseResumeBooking}
                  onStopBooking={handleStopBooking}
                  onAddManualEntry={handleAddManualTime}
                  onUpdateManualEntry={handleUpdateManualTime}
                  onDeleteManualEntry={handleDeleteManualTime}
                />
              )}

              {currentView === 'calendar' && (
                <TimeTrackingView
                  activeBooking={state.activeBooking}
                  timeEntries={state.timeEntries}
                  projects={state.projects}
                  steps={state.steps}
                  categories={state.categories}
                  employees={state.employees}
                  absences={state.absences}
                  onStartBooking={(pid, st, empId) => handleStartBooking(pid, st, empId)}
                  onPauseResumeBooking={handlePauseResumeBooking}
                  onStopBooking={handleStopBooking}
                  onAddManualEntry={handleAddManualTime}
                  onUpdateManualEntry={handleUpdateManualTime}
                  onDeleteManualEntry={handleDeleteManualTime}
                />
              )}

              {currentView === 'crm' && (
                <CRMView
                  customers={state.customers}
                  activities={state.customerActivities}
                  projects={state.projects}
                  salesDocuments={state.salesDocuments}
                  onAddCustomer={(c) => ERPStorage.setState((p) => ({ ...p, customers: [c, ...p.customers] }))}
                  onUpdateCustomer={(c) =>
                    ERPStorage.setState((p) => ({
                      ...p,
                      customers: p.customers.map((cust) => (cust.id === c.id ? c : cust)),
                    }))
                  }
                  onDeleteCustomer={(id) =>
                    ERPStorage.setState((p) => ({
                      ...p,
                      customers: p.customers.filter((cust) => cust.id !== id),
                    }))
                  }
                  onAddActivity={(a) =>
                    ERPStorage.setState((p) => ({
                      ...p,
                      customerActivities: [a, ...p.customerActivities],
                    }))
                  }
                  onSelectProject={(pid) => {
                    setCurrentView('projects');
                    setSelectedProjectId(pid);
                  }}
                />
              )}

              {currentView === 'sales' && (
                <SalesView
                  documents={state.salesDocuments}
                  projects={state.projects}
                  customers={state.customers}
                  company={state.company}
                  onAddDocument={handleAddSalesDocument}
                  onUpdateDocument={handleUpdateSalesDocument}
                  onDeleteDocument={handleDeleteSalesDocument}
                  onCreateProjectFromOffer={handleCreateProjectFromOffer}
                />
              )}

              {currentView === 'journal' && (
                <BautagebuchView
                  projects={state.projects}
                  reports={state.dailyReports}
                  employees={state.employees}
                  onAddReport={(r) =>
                    ERPStorage.setState((p) => ({ ...p, dailyReports: [r, ...p.dailyReports] }))
                  }
                  onSelectProject={(pid) => {
                    setCurrentView('projects');
                    setSelectedProjectId(pid);
                  }}
                />
              )}

              {currentView === 'photos' && (
                <PhotoDocumentationView
                  photos={state.sitePhotos}
                  projects={state.projects}
                  onAddPhoto={(ph) =>
                    ERPStorage.setState((p) => ({
                      ...p,
                      sitePhotos: [
                        { ...ph, id: `sp-${Date.now()}`, createdAt: new Date().toISOString() },
                        ...p.sitePhotos,
                      ],
                    }))
                  }
                  onDeletePhoto={(id) =>
                    ERPStorage.setState((p) => ({
                      ...p,
                      sitePhotos: p.sitePhotos.filter((ph) => ph.id !== id),
                    }))
                  }
                />
              )}

              {currentView === 'inventory' && (
                <InventoryView
                  materials={state.materials}
                  consumptions={state.projectMaterials}
                  orders={state.materialOrders}
                  projects={state.projects}
                  suppliers={state.suppliers}
                  onAddMaterial={(m) =>
                    ERPStorage.setState((p) => ({ ...p, materials: [m, ...p.materials] }))
                  }
                  onUpdateMaterial={(m) =>
                    ERPStorage.setState((p) => ({
                      ...p,
                      materials: p.materials.map((mat) => (mat.id === m.id ? m : mat)),
                    }))
                  }
                  onDeleteMaterial={(id) =>
                    ERPStorage.setState((p) => ({
                      ...p,
                      materials: p.materials.filter((mat) => mat.id !== id),
                    }))
                  }
                  onRevertConsumption={handleRevertConsumption}
                  onAddOrder={(ord: OpsMaterialOrder) =>
                    ERPStorage.setState((p) => ({ ...p, materialOrders: [ord, ...p.materialOrders] }))
                  }
                  onAdvanceOrderStatus={(ordId: string) => {
                    const order = state.materialOrders.find((o: OpsMaterialOrder) => o.id === ordId);
                    if (!order) return;
                    // Receive into warehouse
                    const existingMat = state.materials.find(
                      (m: MaterialItem) => m.name.toLowerCase() === order.item.toLowerCase()
                    );
                    ERPStorage.setState((p) => ({
                      ...p,
                      materialOrders: p.materialOrders.map((o: OpsMaterialOrder) =>
                        o.id === ordId ? { ...o, status: 'Geliefert' } : o
                      ),
                      materials: existingMat
                        ? p.materials.map((m) =>
                            m.id === existingMat.id ? { ...m, stock: m.stock + order.quantity } : m
                          )
                        : [
                            {
                              id: `mat-${Date.now()}`,
                              name: order.item,
                              sku: `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
                              unit: order.unit,
                              stock: order.quantity,
                              minimumStock: 5,
                              unitPrice: 15.0,
                            },
                            ...p.materials,
                          ],
                    }));
                  }}
                />
              )}

              {currentView === 'defects' && (
                <DefectsView
                  defects={state.defects}
                  projects={state.projects}
                  employees={state.employees}
                  onAddDefect={(d) => ERPStorage.setState((p) => ({ ...p, defects: [d, ...p.defects] }))}
                  onUpdateDefect={(d) =>
                    ERPStorage.setState((p) => ({
                      ...p,
                      defects: p.defects.map((def) => (def.id === d.id ? d : def)),
                    }))
                  }
                  onDeleteDefect={(id) =>
                    ERPStorage.setState((p) => ({
                      ...p,
                      defects: p.defects.filter((def) => def.id !== id),
                    }))
                  }
                />
              )}

              {currentView === 'fleet' && (
                <FleetView
                  vehicles={state.vehicles}
                  trips={state.trips}
                  taxiShift={state.taxiShift}
                  projects={state.projects}
                  employees={state.employees}
                  onAddVehicle={(v) =>
                    ERPStorage.setState((p) => ({ ...p, vehicles: [v, ...p.vehicles] }))
                  }
                  onAddTrip={(t) => ERPStorage.setState((p) => ({ ...p, trips: [t, ...p.trips] }))}
                  onDeleteTrip={(id) =>
                    ERPStorage.setState((p) => ({ ...p, trips: p.trips.filter((t) => t.id !== id) }))
                  }
                  onUpdateTaxiShift={(s) => ERPStorage.setState({ taxiShift: s })}
                />
              )}

              {currentView === 'team' && (
                <TeamView
                  employees={state.employees}
                  absences={state.absences}
                  onAddEmployee={(e) =>
                    ERPStorage.setState((p) => ({ ...p, employees: [e, ...p.employees] }))
                  }
                  onUpdateEmployee={(e) =>
                    ERPStorage.setState((p) => ({
                      ...p,
                      employees: p.employees.map((emp) => (emp.id === e.id ? e : emp)),
                    }))
                  }
                  onDeleteEmployee={(id) =>
                    ERPStorage.setState((p) => ({
                      ...p,
                      employees: p.employees.filter((emp) => emp.id !== id),
                    }))
                  }
                  onAddAbsence={(a) =>
                    ERPStorage.setState((p) => ({ ...p, absences: [a, ...p.absences] }))
                  }
                  onApproveAbsence={(id) =>
                    ERPStorage.setState((p) => ({
                      ...p,
                      absences: p.absences.map((a) => (a.id === id ? { ...a, approved: true } : a)),
                    }))
                  }
                  onRejectAbsence={(id) =>
                    ERPStorage.setState((p) => ({
                      ...p,
                      absences: p.absences.map((a) =>
                        a.id === id ? { ...a, approved: false, rejected: true } : a
                      ),
                    }))
                  }
                  onDeleteAbsence={(id) =>
                    ERPStorage.setState((p) => ({
                      ...p,
                      absences: p.absences.filter((a) => a.id !== id),
                    }))
                  }
                />
              )}

              {currentView === 'settings' && (
                <SettingsView
                  company={state.company}
                  serverUrl={state.serverUrl}
                  serverInstance={state.serverInstance}
                  serverToken={state.serverToken}
                  onUpdateCompany={(c) => ERPStorage.setState({ company: c })}
                  onUpdateServerConfig={(url, inst, tok) =>
                    ERPStorage.setState({
                      serverUrl: url,
                      serverInstance: inst,
                      serverToken: tok,
                    })
                  }
                  onResetDemoData={() => {
                    ERPStorage.resetToDemoData();
                    window.location.reload();
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          setSelectedProjectId(null);
        }}
        activeTimer={state.activeBooking.aktiv}
      />

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        state={state}
        onSelectResult={handleNavigateToResult}
      />
    </div>
  );
}
