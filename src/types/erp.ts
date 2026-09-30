export type Language = 'de' | 'bs' | 'en';

export type ProjectStatus = 'Geplant' | 'In Arbeit' | 'Wartet' | 'Erledigt';

export interface ERPProject {
  id: number;
  name?: string;
  displayName: string;
  projektnummer?: string;
  kunde?: string;
  adresse?: string;
  customerId?: string;
  status?: ProjectStatus;
  createdAt?: string;
}

export interface ProjectDraft {
  name: string;
  projektnummer: string;
  kunde: string;
  adresse: string;
  customerId?: string;
  templateId?: string;
}

export interface WorkCategory {
  id: number;
  name?: string;
  pfad?: string;
}

export interface WorkStep {
  id: number;
  name?: string;
  bezeichnung?: string;
}

export interface ActiveBooking {
  aktiv: boolean;
  projektId?: number;
  projektName?: string;
  arbeitsgangId?: number;
  arbeitsgangName?: string;
  startzeit?: string;
  produktkategorieId?: number;
  pausiert?: boolean;
  pauseSeit?: string;
  pausenSekunden?: number;
  employeeId?: string;
  employeeName?: string;
  hourlyCostRate?: number;
}

export interface TimeEntrySummary {
  id: string;
  projectId: number;
  projectName: string;
  workStepName: string;
  startedAt: string; // ISO string
  endedAt: string;   // ISO string
  categoryId?: number;
  workStepId?: number;
  comment?: string;
  pauseSeconds?: number;
  travelSeconds?: number;
  employeeId?: string;
  employeeName?: string;
  hourlyCostRate?: number;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  note: string;
}

export type CustomerActivityKind = 'Notiz' | 'Telefonat' | 'E-Mail' | 'Termin' | 'Status';

export interface CustomerActivity {
  id: string;
  customerId: string;
  kind: CustomerActivityKind;
  title: string;
  details: string;
  date: string;
}

export interface ERPAppointment {
  id: string;
  title: string;
  projectId?: number;
  projectName?: string;
  start: string;
  end: string;
  location: string;
  note: string;
  reminderEnabled: boolean;
}

export interface MaterialItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  stock: number;
  minimumStock: number;
  unitPrice: number;
}

export interface ProjectMaterialItem {
  id: string;
  projectId: number;
  materialId?: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  createdAt: string;
}

export interface ExpenseItem {
  id: string;
  projectId?: number;
  title: string;
  amount: number;
  category: 'Material' | 'Fahrt' | 'Werkzeug' | 'Sonstiges';
  date: string;
  note: string;
}

export interface ChecklistItem {
  id: string;
  projectId: number;
  title: string;
  isDone: boolean;
  sortOrder: number;
}

export type ERPDocumentKind = 'Angebot' | 'Rechnung' | 'Lieferschein' | 'Plan' | 'Protokoll' | 'Sonstiges';

export interface ERPDocument {
  id: string;
  projectId: number;
  name: string;
  kind: ERPDocumentKind;
  createdAt: string;
  note: string;
  fileName?: string;
  fileData?: string; // Base64 or mock
  fileSize?: number;
  typeIdentifier?: string;
}

export interface SignatureRecord {
  id: string;
  projectId: number;
  signerName: string;
  signedAt: string;
  purpose: string;
  signatureDataUrl?: string;
}

export type SalesDocumentType = 'Angebot' | 'Rechnung';
export type SalesDocumentStatus = 'Entwurf' | 'Versendet' | 'Angenommen' | 'Bezahlt' | 'Überfällig' | 'Storniert';
export type SalesLineKind = 'Arbeitsleistung' | 'Material' | 'Pauschale' | 'Text';
export type SalesRecurrence = 'Einmalig' | 'Monatlich' | 'Vierteljährlich' | 'Jährlich';
export type SalesTaxMode = 'Regelbesteuerung' | '§19 UStG Kleinunternehmer' | '§13b UStG Reverse Charge';
export type SalesElectronicFormat = 'Kein E-Rechnungs-Export' | 'XRechnung XML (Basis)' | 'ZUGFeRD-Daten (Basis)';

export interface SalesLineItem {
  id: string;
  title: string;
  details: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  kind?: SalesLineKind;
}

export interface SalesDocument {
  id: string;
  type: SalesDocumentType;
  number: string;
  projectId?: number;
  projectName: string;
  customerId?: string;
  customerName: string;
  customerAddress: string;
  date: string;
  dueDate?: string;
  status: SalesDocumentStatus;
  items: SalesLineItem[];
  taxRate: number;
  notes: string;
  signedBy?: string;
  signedAt?: string;
  signatureDataUrl?: string;
  recurrence?: SalesRecurrence;
  nextRecurringDate?: string;
  reminderLevel?: number;
  reminderFee?: number;
  buyerReference?: string;
  electronicFormat?: SalesElectronicFormat;
  taxMode?: SalesTaxMode;
}

export interface ProjectWorkStep {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProjectPlannedMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  note: string;
}

export interface ERPProjectTemplate {
  id: string;
  name: string;
  icon: string;
  workSteps: string[];
  checklist: string[];
  materials: { name: string; quantity: number; unit: string }[];
}

export type OpsTaskPriority = 'Niedrig' | 'Normal' | 'Hoch';
export type OpsTaskStatus = 'Offen' | 'In Bearbeitung' | 'Erledigt' | 'In Abklärung';
export type OpsTaskRecurrence = 'Einmalig' | 'Täglich' | 'Wöchentlich' | 'Monatlich';
export type PlanfredCategory = 'TODO' | 'MANGEL' | 'KLÄRUNGSBEDARF';

export interface OpsTask {
  id: string;
  title: string;
  projectId?: number;
  dueDate: string;
  priority: OpsTaskPriority;
  status: OpsTaskStatus;
  note: string;
  recurrence?: OpsTaskRecurrence;
  recurrenceGroupId?: string;
  // Planfred fields
  category?: PlanfredCategory;
  assigneeName?: string;
  assigneeRole?: string;
  creatorName?: string;
  location?: string;
  hasPhoto?: boolean;
}

export interface OpsEmployee {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  hourlyCostRate?: number;
  dailyTargetHours?: number;
  workStepHourlyRates?: Record<string, number>;
  nightSurchargePercent?: number;
  birthDate?: string;
  companyName?: string;
}

export type OpsAbsenceKind = 'Urlaub' | 'Krank' | 'Fortbildung' | 'Zeitausgleich';

export interface OpsAbsence {
  id: string;
  employeeId: string;
  kind: OpsAbsenceKind;
  start: string;
  end: string;
  note: string;
  approved: boolean;
  rejected?: boolean;
}

export interface OpsInboxItem {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  projectId?: number;
  attachmentName?: string;
}

export interface OpsMessage {
  id: string;
  channel: string;
  author: string;
  text: string;
  date: string;
  projectId?: number;
}

export interface OpsDevice {
  id: string;
  name: string;
  serial: string;
  assignedTo: string;
  inspectionDue: string;
  state: 'Verfügbar' | 'Im Einsatz' | 'Prüfung fällig';
}

export interface OpsMeasurementEntry {
  id: string;
  description: string;
  length: number;
  width: number;
  height: number;
  quantity: number;
  unit: 'm²' | 'm³' | 'm' | 'Stk.';
}

export interface OpsMeasurementBook {
  id: string;
  projectId?: number;
  title: string;
  createdAt: string;
  entries: OpsMeasurementEntry[];
}

export interface OpsWorkPlanEntry {
  id: string;
  employeeId: string;
  projectId?: number;
  title: string;
  start: string;
  end: string;
  location: string;
  note: string;
}

export interface OpsDailyReport {
  id: string;
  projectId: number;
  date: string;
  employeeId?: string;
  workDescription: string;
  obstacles: string;
  timeHours: number;
  material: string;
  machines: string;
  vehicles: string;
}

export interface OpsMaterialOrder {
  id: string;
  projectId?: number;
  supplier: string;
  item: string;
  quantity: number;
  unit: string;
  createdAt: string;
  neededBy: string;
  status: 'Entwurf' | 'Bestellt' | 'Geliefert';
  note: string;
}

export interface OpsLaborCost {
  id: string;
  timeEntryId: string;
  projectId: number;
  employeeId?: string;
  employeeName: string;
  hours: number;
  hourlyRate: number;
  amount: number;
  date: string;
}

export interface OpsVehicle {
  id: string;
  name: string;
  licensePlate: string;
  odometerKm: number;
  costPerKm: number;
  state: 'Verfügbar' | 'Im Einsatz' | 'Werkstatt';
  note: string;
}

export interface OpsTrip {
  id: string;
  vehicleId: string;
  projectId?: number;
  employeeId?: string;
  employeeName: string;
  date: string;
  startKm: number;
  endKm: number;
  purpose: string;
  note: string;
  costPerKm: number;
}

export type DefectSeverity = 'Niedrig' | 'Mittel' | 'Hoch' | 'Kritisch';
export type DefectStatus = 'Offen' | 'In Bearbeitung' | 'Behoben' | 'Abgeschlossen';

export interface OpsDefect {
  id: string;
  projectId: number;
  kind: 'Mangel' | 'Reklamation';
  title: string;
  details: string;
  category: string;
  severity: DefectSeverity;
  status: DefectStatus;
  createdAt: string;
  dueDate: string;
  responsibleEmployeeId?: string;
  customerVisible: boolean;
  photoDataUrls: string[];
  resolvedAt?: string;
}

export type SitePhotoPhase = 'Vorher' | 'Während' | 'Nachher' | 'Mangel';

export interface SitePhotoRecord {
  id: string;
  projectId: number;
  phase: SitePhotoPhase;
  caption: string;
  dataUrl: string;
  createdAt: string;
}

export interface ProjectNoteImage {
  id: number;
  url: string;
  dateiname?: string;
}

export interface ProjectNote {
  id: number;
  notiz: string;
  erstelltAm: string;
  erstellerName: string;
  bilder: ProjectNoteImage[];
}

export interface CompanyProfile {
  companyName: string;
  ownerName: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  iban: string;
  bic: string;
  bankName: string;
  taxNumber: string;
  vatId: string;
  registerInfo: string;
  defaultPaymentDays: number;
  footerText: string;
  logoDataUrl?: string;
}

export interface ProjectBudgetSettings {
  projectId: number;
  plannedHours: number;
  laborBudget: number;
  materialBudget: number;
  travelBudget: number;
  otherBudget: number;
  warningThresholdPercent: number;
}

export interface Supplier {
  id: number;
  name?: string;
  firma?: string;
  telefon?: string;
  email?: string;
  adresse?: string;
}

export interface TaxiShiftLogEntry {
  id: string;
  time: string;
  emptyKm: number;
  amount: number;
  minutes: number;
  occupiedKm: number;
}

export interface TaxiShiftReport {
  shiftStart: string;
  shiftEnd: string;
  taxiNumber: string;
  hourlyWage: number;
  kilometerStart: number;
  kilometerEnd: number;
  surchargeStart: number;
  surchargeEnd: number;
  meterStart: number;
  meterEnd: number;
  turnoverPlus: number;
  turnoverMinus: number;
  commission: number;
  cash: number;
  fuel: number;
  wash: number;
  cashless: number;
  expenses: number;
  socialDeductions: number;
  income: number;
  verified: boolean;
  logs: TaxiShiftLogEntry[];
}

export interface ERPStoreState {
  company: CompanyProfile;
  projects: ERPProject[];
  customers: Customer[];
  customerActivities: CustomerActivity[];
  appointments: ERPAppointment[];
  materials: MaterialItem[];
  projectMaterials: ProjectMaterialItem[];
  expenses: ExpenseItem[];
  checklist: ChecklistItem[];
  documents: ERPDocument[];
  signatures: SignatureRecord[];
  salesDocuments: SalesDocument[];
  tasks: OpsTask[];
  employees: OpsEmployee[];
  absences: OpsAbsence[];
  inbox: OpsInboxItem[];
  messages: OpsMessage[];
  devices: OpsDevice[];
  measurementBooks: OpsMeasurementBook[];
  workPlan: OpsWorkPlanEntry[];
  dailyReports: OpsDailyReport[];
  materialOrders: OpsMaterialOrder[];
  laborCosts: OpsLaborCost[];
  vehicles: OpsVehicle[];
  trips: OpsTrip[];
  defects: OpsDefect[];
  sitePhotos: SitePhotoRecord[];
  budgets: Record<number, ProjectBudgetSettings>;
  projectSteps: Record<number, ProjectWorkStep[]>;
  plannedMaterials: Record<number, ProjectPlannedMaterial[]>;
  categories: WorkCategory[];
  steps: WorkStep[];
  suppliers: Supplier[];
  activeBooking: ActiveBooking;
  timeEntries: TimeEntrySummary[];
  taxiShift: TaxiShiftReport;
  language: Language;
  serverUrl: string;
  serverInstance: string;
  serverToken: string;
}

