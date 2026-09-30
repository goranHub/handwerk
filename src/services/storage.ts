import {
  ERPProject,
  Customer,
  CustomerActivity,
  ERPAppointment,
  MaterialItem,
  ProjectMaterialItem,
  ExpenseItem,
  ChecklistItem,
  ERPDocument,
  SignatureRecord,
  SalesDocument,
  OpsTask,
  OpsEmployee,
  OpsAbsence,
  OpsInboxItem,
  OpsMessage,
  OpsDevice,
  OpsMeasurementBook,
  OpsWorkPlanEntry,
  OpsDailyReport,
  OpsMaterialOrder,
  OpsLaborCost,
  OpsVehicle,
  OpsTrip,
  OpsDefect,
  SitePhotoRecord,
  CompanyProfile,
  ProjectBudgetSettings,
  ProjectWorkStep,
  ProjectPlannedMaterial,
  WorkCategory,
  WorkStep,
  ActiveBooking,
  TimeEntrySummary,
  Supplier,
  TaxiShiftReport,
  Language,
  ERPStoreState,
} from '../types/erp';

const STORAGE_KEY = 'handwerker_erp_v28_state';
const BACKUP_KEY = 'handwerker_erp_v28_backup';

export const DEFAULT_COMPANY: CompanyProfile = {
  companyName: 'Bayerische Handwerksbetriebe GmbH',
  ownerName: 'Maximilian Huber (Meisterbetrieb)',
  street: 'Lindwurmstraße 48',
  postalCode: '80337',
  city: 'München',
  country: 'Deutschland',
  phone: '+49 89 2314560',
  email: 'info@bayerische-handwerk.de',
  website: 'www.bayerische-handwerk.de',
  iban: 'DE44 7001 0080 0123 4567 89',
  bic: 'PBNKDEFFXXX',
  bankName: 'Postbank München',
  taxNumber: '143/123/45678',
  vatId: 'DE 298765432',
  registerInfo: 'Handwerkskammer für München und Oberbayern · HRB 241908',
  defaultPaymentDays: 14,
  footerText: 'Vielen Dank für das Vertrauen in unsere handwerkliche Qualitätsarbeit.',
};

export const INITIAL_STATE: ERPStoreState = {
  company: DEFAULT_COMPANY,
  language: 'de',
  serverUrl: 'https://erp.tmbv-hms.com/time',
  serverInstance: 'tmbv',
  serverToken: 'Buro-5a38d0209567',
  projects: [
    {
      id: 1,
      name: 'Dachsanierung Musterstraße',
      displayName: 'Dachsanierung Musterstraße',
      projektnummer: 'A-2026-001',
      kunde: 'Müller GmbH',
      adresse: 'Musterstraße 18, 80331 München',
      customerId: '11111111-1111-1111-1111-111111111111',
      status: 'In Arbeit',
      createdAt: '2026-03-01T08:00:00Z',
    },
    {
      id: 2,
      name: 'Badsanierung Familie Wagner',
      displayName: 'Badsanierung Familie Wagner',
      projektnummer: 'A-2026-002',
      kunde: 'Anna Wagner',
      adresse: 'Leopoldstraße 81, 80802 München',
      customerId: '22222222-2222-2222-2222-222222222222',
      status: 'In Arbeit',
      createdAt: '2026-03-10T09:30:00Z',
    },
    {
      id: 3,
      name: 'Fenstermontage Bürogebäude',
      displayName: 'Fenstermontage Bürogebäude',
      projektnummer: 'A-2026-003',
      kunde: 'Isar Büroservice',
      adresse: 'Rosenheimer Straße 55, 81667 München',
      customerId: '33333333-3333-3333-3333-333333333333',
      status: 'Geplant',
      createdAt: '2026-03-15T11:00:00Z',
    },
  ],
  customers: [
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Anna Wagner',
      company: 'Privatkundin',
      phone: '+49 171 2345678',
      email: 'anna.wagner@example.de',
      address: 'Leopoldstraße 81, 80802 München',
      note: 'Badsanierung – Terminabsprachen vorzugsweise vormittags.',
    },
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Martin Müller',
      company: 'Müller GmbH',
      phone: '+49 89 1234567',
      email: 'm.mueller@example.de',
      address: 'Musterstraße 18, 80331 München',
      note: 'Dachsanierung, Ansprechpartner Herr Müller vor Ort erreichbar.',
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Sabine Keller',
      company: 'Isar Büroservice',
      phone: '+49 89 5550199',
      email: 'office@isar-buero.de',
      address: 'Rosenheimer Straße 55, 81667 München',
      note: 'Fenstermontage im 2. Obergeschoss, Parkausweis im Empfang.',
    },
  ],
  customerActivities: [
    {
      id: 'act-1',
      customerId: '22222222-2222-2222-2222-222222222222',
      kind: 'Notiz',
      title: 'Erstgespräch & Beratung',
      details: 'Ausführung und gewünschte Fliesen & Sanitärmodelle besprochen.',
      date: '2026-03-24T10:00:00Z',
    },
    {
      id: 'act-2',
      customerId: '11111111-1111-1111-1111-111111111111',
      kind: 'Telefonat',
      title: 'Terminbestätigung Baustelle',
      details: 'Krananfahrt und Absperrung für Dachlattenlieferung bestätigt.',
      date: '2026-03-27T14:30:00Z',
    },
  ],
  appointments: [
    {
      id: 'apt-1',
      title: 'Baustellenbegehung Dach',
      projectId: 1,
      projectName: 'Dachsanierung Musterstraße',
      start: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      end: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      location: 'Musterstraße 18, München',
      note: 'Dachfläche gemeinsam mit Bauleiter prüfen und Absicherung kontrollieren.',
      reminderEnabled: true,
    },
    {
      id: 'apt-2',
      title: 'Zwischenabnahme Badinstallation',
      projectId: 2,
      projectName: 'Badsanierung Familie Wagner',
      start: new Date(Date.now() + 26 * 3600 * 1000).toISOString(),
      end: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
      location: 'Leopoldstraße 81, München',
      note: 'Druckprüfung Rohrleitungen und Abdichtungsebene begutachten.',
      reminderEnabled: true,
    },
  ],
  materials: [
    { id: 'mat-1', name: 'Dachlatte 40×60 imprägniert', sku: 'DL-4060', unit: 'm', stock: 148, minimumStock: 60, unitPrice: 2.45 },
    { id: 'mat-2', name: 'Universalschraube 5×80 TX25', sku: 'SCH-580', unit: 'Stk.', stock: 420, minimumStock: 200, unitPrice: 0.18 },
    { id: 'mat-3', name: 'Silikon Sanitär premium weiß', sku: 'SIL-W', unit: 'Kart.', stock: 9, minimumStock: 12, unitPrice: 8.9 },
    { id: 'mat-4', name: 'Dichtband flexibel 100 mm', sku: 'DB-100', unit: 'Rollen', stock: 14, minimumStock: 6, unitPrice: 24.5 },
    { id: 'mat-5', name: 'Montageschaum 1K B2 750ml', sku: 'SCH-750', unit: 'Dosen', stock: 18, minimumStock: 10, unitPrice: 7.8 },
  ],
  projectMaterials: [
    {
      id: 'pm-1',
      projectId: 1,
      materialId: 'mat-1',
      name: 'Dachlatte 40×60 imprägniert',
      quantity: 32,
      unit: 'm',
      unitPrice: 2.45,
      createdAt: '2026-03-28T09:00:00Z',
    },
    {
      id: 'pm-2',
      projectId: 1,
      materialId: 'mat-2',
      name: 'Universalschraube 5×80 TX25',
      quantity: 120,
      unit: 'Stk.',
      unitPrice: 0.18,
      createdAt: '2026-03-28T10:30:00Z',
    },
    {
      id: 'pm-3',
      projectId: 2,
      materialId: 'mat-3',
      name: 'Silikon Sanitär premium weiß',
      quantity: 3,
      unit: 'Kart.',
      unitPrice: 8.9,
      createdAt: '2026-03-29T14:15:00Z',
    },
  ],
  expenses: [
    {
      id: 'exp-1',
      projectId: 1,
      title: 'Container Miete & Entsorgung',
      amount: 340.0,
      category: 'Sonstiges',
      date: '2026-03-26T08:00:00Z',
      note: 'Bauschuttcontainer 7m³',
    },
    {
      id: 'exp-2',
      projectId: 1,
      title: 'Kraftstoff Transporter M-ER 2025',
      amount: 78.5,
      category: 'Fahrt',
      date: '2026-03-28T17:00:00Z',
      note: 'Baustellenbelieferung',
    },
  ],
  checklist: [
    { id: 'chk-1', projectId: 1, title: 'Baustelle absichern & Gerüst freigeben', isDone: true, sortOrder: 0 },
    { id: 'chk-2', projectId: 1, title: 'Bestandsaufnahme vor Abbruch fotografieren', isDone: true, sortOrder: 1 },
    { id: 'chk-3', projectId: 1, title: 'Unterkonstruktion auf Feuchtigkeit prüfen', isDone: false, sortOrder: 2 },
    { id: 'chk-4', projectId: 1, title: 'Dampfbremse luftdicht verkleben', isDone: false, sortOrder: 3 },
    { id: 'chk-5', projectId: 2, title: 'Hauptwasserhahn absperren & entleeren', isDone: true, sortOrder: 0 },
    { id: 'chk-6', projectId: 2, title: 'Druckprüfung Sanitärleitungen protokollieren', isDone: false, sortOrder: 1 },
    { id: 'chk-7', projectId: 2, title: 'Kundenabnahme & Silikonfugen prüfen', isDone: false, sortOrder: 2 },
  ],
  documents: [
    {
      id: 'doc-1',
      projectId: 1,
      name: 'Ausführungsplan Dachschnitt M 1:50.pdf',
      kind: 'Plan',
      createdAt: '2026-03-12T09:00:00Z',
      note: 'Freigegebener Werkplan vom Statiker',
      fileName: 'Ausführungsplan.pdf',
      fileSize: 2480000,
    },
    {
      id: 'doc-2',
      projectId: 1,
      name: 'Lieferschein BayWa Baustoffe LS-9921.pdf',
      kind: 'Lieferschein',
      createdAt: '2026-03-26T11:20:00Z',
      note: 'Dämmung und Latten quittiert',
      fileName: 'Lieferschein_BayWa.pdf',
      fileSize: 420000,
    },
  ],
  signatures: [
    {
      id: 'sig-1',
      projectId: 2,
      signerName: 'Anna Wagner',
      signedAt: '2026-03-20T16:30:00Z',
      purpose: 'Freigabe Fliesenmuster & Beginn Rohinstallation',
    },
  ],
  salesDocuments: [
    {
      id: 'sal-1',
      type: 'Angebot',
      number: 'ANG-2026-001',
      projectId: 1,
      projectName: 'Dachsanierung Musterstraße',
      customerId: '11111111-1111-1111-1111-111111111111',
      customerName: 'Müller GmbH',
      customerAddress: 'Musterstraße 18, 80331 München',
      date: '2026-03-02T10:00:00Z',
      dueDate: '2026-03-31T23:59:59Z',
      status: 'Angenommen',
      taxRate: 19,
      taxMode: 'Regelbesteuerung',
      notes: 'Zahlbar rein netto innerhalb von 14 Tagen nach Rechnungsstellung.',
      items: [
        {
          id: 'li-1',
          title: 'Dachlatten und Konterlattung erneuern',
          details: 'Inkl. Ausrichten und Montage auf Bestandssparren',
          quantity: 160,
          unit: 'm',
          unitPrice: 9.8,
          kind: 'Arbeitsleistung',
        },
        {
          id: 'li-2',
          title: 'Unterspannbahn diffusionsoffen',
          details: 'Hochwertige 3-lagige Unterdeckbahn winddicht verklebt',
          quantity: 95,
          unit: 'm²',
          unitPrice: 14.5,
          kind: 'Material',
        },
        {
          id: 'li-3',
          title: 'Baustelleneinrichtung & Schutzgerüst',
          details: 'Pauschale Gestellung für 3 Wochen',
          quantity: 1,
          unit: 'Pauschale',
          unitPrice: 750.0,
          kind: 'Pauschale',
        },
      ],
    },
    {
      id: 'sal-2',
      type: 'Rechnung',
      number: 'RE-2026-001',
      projectId: 2,
      projectName: 'Badsanierung Familie Wagner',
      customerId: '22222222-2222-2222-2222-222222222222',
      customerName: 'Anna Wagner',
      customerAddress: 'Leopoldstraße 81, 80802 München',
      date: '2026-03-25T11:00:00Z',
      dueDate: '2026-04-08T23:59:59Z',
      status: 'Versendet',
      taxRate: 19,
      taxMode: 'Regelbesteuerung',
      notes: '1. Abschlagsrechnung nach Abschluss der Rohinstallation.',
      buyerReference: 'WAGNER-BAD-1',
      electronicFormat: 'XRechnung XML (Basis)',
      items: [
        {
          id: 'li-4',
          title: 'Demontage Altbad & Entsorgung',
          details: 'Fliesen, Wanne und alte Zuleitungen demontiert',
          quantity: 1,
          unit: 'Pauschale',
          unitPrice: 850.0,
          kind: 'Pauschale',
        },
        {
          id: 'li-5',
          title: 'Rohinstallation Kalt- & Warmwasser',
          details: 'Verbundrohr inkl. Wandscheiben und Abdrücken',
          quantity: 18,
          unit: 'Std.',
          unitPrice: 68.0,
          kind: 'Arbeitsleistung',
        },
      ],
    },
  ],
  tasks: [
    {
      id: 'tsk-1',
      title: 'Dachflächenfenster Lage prüfen',
      projectId: 1,
      dueDate: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      priority: 'Hoch',
      status: 'In Bearbeitung',
      note: 'Dachausschnitt mit Zimmermann vor Ort abstimmen.',
      category: 'KLÄRUNGSBEDARF',
      assigneeName: 'Bernhard Wiesberger',
      assigneeRole: 'Baufirma',
      creatorName: 'Paul Freund',
      location: '1. DG, Zimmer 2',
      hasPhoto: true,
    },
    {
      id: 'tsk-2',
      title: 'Planänderungen EG Sanitär einarbeiten',
      projectId: 2,
      dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      priority: 'Normal',
      status: 'Offen',
      note: 'Kunde wünscht bodengleiche Dusche statt Wanne.',
      category: 'TODO',
      assigneeName: 'Klara Blitz',
      assigneeRole: 'Architekt',
      creatorName: 'Bernhard W.',
      location: 'EG Bad',
      hasPhoto: false,
    },
    {
      id: 'tsk-3',
      title: 'Fensteranschlussband abdichten',
      projectId: 1,
      dueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      priority: 'Hoch',
      status: 'Offen',
      note: 'Linke Anschlusskante nacharbeiten vor Regeneinbruch.',
      category: 'MANGEL',
      assigneeName: 'Max Mustermann',
      assigneeRole: 'Monteur',
      creatorName: 'Paul Freund',
      location: 'Dach Westseite',
      hasPhoto: true,
    },
    {
      id: 'tsk-4',
      title: 'Dämmplatten Typenfreigabe einholen',
      projectId: 3,
      dueDate: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      priority: 'Normal',
      status: 'In Bearbeitung',
      note: 'Bauphysiker Bestätigung für WLG 032.',
      category: 'TODO',
      assigneeName: 'Harald Kainz',
      assigneeRole: 'Bauphysik',
      creatorName: 'Paul Freund',
      location: 'Fassade',
      hasPhoto: false,
    },
  ],
  employees: [
    {
      id: 'emp-1',
      name: 'Max Mustermann',
      role: 'Obermonteur / Dach',
      phone: '+49 170 1234567',
      email: 'max@bayerische-handwerk.de',
      hourlyCostRate: 52.0,
      dailyTargetHours: 8.0,
      nightSurchargePercent: 25,
      birthDate: '1987-04-12',
      companyName: 'Bayerische Handwerksbetriebe GmbH',
    },
    {
      id: 'emp-2',
      name: 'Lena Bauer',
      role: 'Disposition & Meisterin Sanitär',
      phone: '+49 170 7654321',
      email: 'lena@bayerische-handwerk.de',
      hourlyCostRate: 46.0,
      dailyTargetHours: 8.0,
      nightSurchargePercent: 25,
      birthDate: '1992-09-24',
      companyName: 'Bayerische Handwerksbetriebe GmbH',
    },
    {
      id: 'emp-3',
      name: 'Anton Gruber',
      role: 'Auszubildender 3. Lehrjahr',
      phone: '+49 170 9988776',
      email: 'anton@bayerische-handwerk.de',
      hourlyCostRate: 26.0,
      dailyTargetHours: 7.7,
      nightSurchargePercent: 25,
      birthDate: '2004-11-03',
      companyName: 'Bayerische Handwerksbetriebe GmbH',
    },
  ],
  absences: [
    {
      id: 'abs-1',
      employeeId: 'emp-2',
      kind: 'Urlaub',
      start: '2026-04-14',
      end: '2026-04-18',
      note: 'Osterurlaub genehmigt',
      approved: true,
    },
  ],
  inbox: [
    {
      id: 'inb-1',
      sender: 'BayWa Baustoffe München',
      subject: 'Lieferaviso: Dachziegel & Zubehör',
      preview: 'Die Lieferung für Auftrag A-2026-001 erfolgt morgen planmäßig zwischen 07:30 und 09:00 Uhr per Kranfahrzeug.',
      date: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      isRead: false,
      projectId: 1,
      attachmentName: 'Aviso_BayWa_LS9921.pdf',
    },
    {
      id: 'inb-2',
      sender: 'Anna Wagner',
      subject: 'Termin passt hervorragend',
      preview: 'Vielen Dank für die Bestätigung. Ich bin ab 10 Uhr zuhause erreichbar.',
      date: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
      isRead: true,
      projectId: 2,
    },
  ],
  messages: [
    {
      id: 'msg-1',
      channel: 'Baustelle Musterstraße',
      author: 'Max Mustermann',
      text: 'Unterspannbahn ist fertig verlegt. Morgen starten wir mit den Lattungen.',
      date: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      projectId: 1,
    },
  ],
  devices: [
    {
      id: 'dev-1',
      name: 'Hilti Akku-Kombihammer TE 30-A36',
      serial: 'HT-3021884',
      assignedTo: 'Max Mustermann',
      inspectionDue: '2026-08-15',
      state: 'Im Einsatz',
    },
    {
      id: 'dev-2',
      name: 'Bosch Linienlaser GLL 3-80 C',
      serial: 'BS-8841190',
      assignedTo: 'Lena Bauer',
      inspectionDue: '2026-05-10',
      state: 'Im Einsatz',
    },
    {
      id: 'dev-3',
      name: 'Rothenberger Pressbacken-Set ROMAX',
      serial: 'RB-49021',
      assignedTo: 'Lager Werkstatt',
      inspectionDue: '2026-04-05',
      state: 'Prüfung fällig',
    },
  ],
  measurementBooks: [
    {
      id: 'mb-1',
      projectId: 1,
      title: 'Dachfläche Süd- und Nordseite',
      createdAt: '2026-03-24T11:00:00Z',
      entries: [
        { id: 'me-1', description: 'Hauptdachfläche Südseite', length: 14.2, width: 6.8, height: 0, quantity: 1, unit: 'm²' },
        { id: 'me-2', description: 'Hauptdachfläche Nordseite', length: 14.2, width: 6.5, height: 0, quantity: 1, unit: 'm²' },
        { id: 'me-3', description: 'Ortgang-Verkleidung Blech', length: 26.8, width: 0, height: 0, quantity: 1, unit: 'm' },
      ],
    },
  ],
  workPlan: [
    {
      id: 'wp-1',
      employeeId: 'emp-1',
      projectId: 1,
      title: 'Eindeckung Dachfläche',
      start: new Date().setHours(7, 30, 0, 0) ? new Date(new Date().setHours(7, 30, 0, 0)).toISOString() : '',
      end: new Date().setHours(16, 30, 0, 0) ? new Date(new Date().setHours(16, 30, 0, 0)).toISOString() : '',
      location: 'Musterstraße 18, München',
      note: 'Krananfahrt beachten und Helm tragen.',
    },
    {
      id: 'wp-2',
      employeeId: 'emp-2',
      projectId: 2,
      title: 'Sanitärmontage Dusche',
      start: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      end: new Date(Date.now() + 32 * 3600 * 1000).toISOString(),
      location: 'Leopoldstraße 81, München',
      note: 'Fliesenspiegel ist abgebunden und gereinigt.',
    },
  ],
  dailyReports: [
    {
      id: 'rep-1',
      projectId: 1,
      date: new Date().toISOString().split('T')[0],
      employeeId: 'emp-1',
      workDescription: 'Lattung komplett gerichtet und verschraubt. Rinne eingehängt und Traufbleche gesetzt.',
      obstacles: 'Kurzer Regenschauer am Mittag, Dach mit Plane vorübergehend gesichert.',
      timeHours: 8.0,
      material: 'Dachlatten 40×60 (80m), Spenglerschrauben, Traufgitter (15m)',
      machines: 'Hilti TE 30, Akku-Kapp- und Gehrungssäge',
      vehicles: 'Mercedes Sprinter M-ER 2025',
    },
  ],
  materialOrders: [
    {
      id: 'ord-1',
      projectId: 1,
      supplier: 'BayWa Baustoffe München',
      item: 'Braas Frankfurter Pfanne Matt-Anthrazit',
      quantity: 1200,
      unit: 'Stk.',
      createdAt: '2026-03-20T08:00:00Z',
      neededBy: '2026-04-02',
      status: 'Bestellt',
      note: 'Paletten mit Kran auf Dachbühne heben.',
    },
  ],
  laborCosts: [
    {
      id: 'lc-1',
      timeEntryId: 'te-1',
      projectId: 1,
      employeeId: 'emp-1',
      employeeName: 'Max Mustermann',
      hours: 7.5,
      hourlyRate: 52.0,
      amount: 390.0,
      date: new Date().toISOString(),
    },
  ],
  vehicles: [
    {
      id: 'veh-1',
      name: 'Mercedes-Benz Sprinter 316 CDI',
      licensePlate: 'M-ER 2025',
      odometerKm: 68420,
      costPerKm: 0.58,
      state: 'Im Einsatz',
      note: 'Werkstattwagen Dach & Spenglerei mit Dachträger',
    },
    {
      id: 'veh-2',
      name: 'Volkswagen Caddy Maxi',
      licensePlate: 'M-HW 104',
      odometerKm: 41210,
      costPerKm: 0.46,
      state: 'Verfügbar',
      note: 'Kundendienst- & Servicefahrzeug Sanitär',
    },
  ],
  trips: [
    {
      id: 'trp-1',
      vehicleId: 'veh-1',
      projectId: 1,
      employeeId: 'emp-1',
      employeeName: 'Max Mustermann',
      date: new Date().toISOString(),
      startKm: 68392,
      endKm: 68420,
      purpose: 'Materialtransport Baustelle Musterstraße',
      note: 'Dachlatten und Befestigungsmittel transportiert',
      costPerKm: 0.58,
    },
  ],
  defects: [
    {
      id: 'def-1',
      projectId: 1,
      kind: 'Mangel',
      title: 'Blechanschluss Kaminabdichtung undicht',
      details: 'Kaminverwahrung hat an der Rückseite einen Spalt von 4mm, Dichtmasse fehlt.',
      category: 'Ausführung',
      severity: 'Hoch',
      status: 'Offen',
      createdAt: '2026-03-27T15:00:00Z',
      dueDate: '2026-04-02',
      responsibleEmployeeId: 'emp-1',
      customerVisible: true,
      photoDataUrls: [],
    },
  ],
  sitePhotos: [
    {
      id: 'sp-1',
      projectId: 1,
      phase: 'Vorher',
      caption: 'Altbestand vor dem Abdecken der alten Ziegel',
      dataUrl: '',
      createdAt: '2026-03-05T09:00:00Z',
    },
    {
      id: 'sp-2',
      projectId: 1,
      phase: 'Während',
      caption: 'Unterspannbahn fertig verlegt und winddicht abgeklebt',
      dataUrl: '',
      createdAt: '2026-03-28T14:00:00Z',
    },
  ],
  budgets: {
    1: {
      projectId: 1,
      plannedHours: 120,
      laborBudget: 6240,
      materialBudget: 4500,
      travelBudget: 450,
      otherBudget: 800,
      warningThresholdPercent: 85,
    },
    2: {
      projectId: 2,
      plannedHours: 65,
      laborBudget: 3380,
      materialBudget: 2800,
      travelBudget: 220,
      otherBudget: 400,
      warningThresholdPercent: 85,
    },
  },
  projectSteps: {
    1: [
      { id: 101, name: 'Baustelleneinrichtung & Schutzgerüst', sortOrder: 0, isActive: true },
      { id: 102, name: 'Altdacheindeckung abtragen', sortOrder: 1, isActive: true },
      { id: 103, name: 'Dämmung & Unterspannbahn', sortOrder: 2, isActive: true },
      { id: 104, name: 'Konter- & Traglattung montieren', sortOrder: 3, isActive: true },
      { id: 105, name: 'Eindeckung & Ziegelverlegung', sortOrder: 4, isActive: true },
      { id: 106, name: 'Kamin- & Wandanschlüsse', sortOrder: 5, isActive: true },
      { id: 107, name: 'Endabnahme & Gerüstabbau', sortOrder: 6, isActive: true },
    ],
  },
  plannedMaterials: {
    1: [
      { id: 'pm-plan-1', name: 'Braas Frankfurter Pfanne Anthrazit', quantity: 1200, unit: 'Stk.', note: 'Hauptdach' },
      { id: 'pm-plan-2', name: 'Dachlatten 40×60', quantity: 240, unit: 'm', note: 'Traglattung' },
    ],
  },
  categories: [
    { id: 1, name: 'Montage', pfad: 'Baustelle / Montage' },
    { id: 2, name: 'Service', pfad: 'Baustelle / Service' },
    { id: 3, name: 'Fahrt', pfad: 'Allgemein / Fahrt' },
    { id: 4, name: 'Vorbereitung', pfad: 'Werkstatt / Rüstzeit' },
  ],
  steps: [
    { id: 1, name: 'Montage', bezeichnung: 'Montage' },
    { id: 2, name: 'Demontage', bezeichnung: 'Demontage' },
    { id: 3, name: 'Fahrtzeit', bezeichnung: 'Fahrtzeit' },
    { id: 4, name: 'Nacharbeit', bezeichnung: 'Nacharbeit' },
    { id: 5, name: 'Dokumentation', bezeichnung: 'Dokumentation' },
  ],
  suppliers: [
    { id: 1, name: 'BayWa Baustoffe', firma: 'BayWa AG Baustoffe München', telefon: '+49 89 92220', email: 'baustoffe-muenchen@baywa.de', adresse: 'Arabellastraße 4, 81925 München' },
    { id: 2, name: 'GC Sanitär Großhandel', firma: 'Gienger & Renz KG', telefon: '+49 89 451500', email: 'service@gienger.de', adresse: 'Gruber Straße 48, 85599 Poing' },
    { id: 3, name: 'Würth Niederlassung', firma: 'Adolf Würth GmbH & Co. KG', telefon: '+49 89 6800910', email: 'nl.muenchen@wuerth.com', adresse: 'Schäftlarnstraße 162, 81371 München' },
  ],
  activeBooking: {
    aktiv: false,
    projektId: undefined,
    projektName: undefined,
    arbeitsgangId: undefined,
    arbeitsgangName: undefined,
    startzeit: undefined,
    pausiert: false,
    pausenSekunden: 0,
  },
  timeEntries: [
    {
      id: 'te-1',
      projectId: 1,
      projectName: 'Dachsanierung Musterstraße',
      workStepName: 'Montage',
      startedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      endedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      pauseSeconds: 30 * 60,
      travelSeconds: 25 * 60,
      comment: 'Traglattung fertig montiert und ausgerichtet.',
      employeeId: 'emp-1',
      employeeName: 'Max Mustermann',
      hourlyCostRate: 52.0,
    },
  ],
  taxiShift: {
    shiftStart: new Date().setHours(6, 0, 0, 0) ? new Date(new Date().setHours(6, 0, 0, 0)).toISOString() : '',
    shiftEnd: new Date().setHours(15, 30, 0, 0) ? new Date(new Date().setHours(15, 30, 0, 0)).toISOString() : '',
    taxiNumber: '195',
    hourlyWage: 15.21,
    kilometerStart: 66193,
    kilometerEnd: 66307,
    surchargeStart: 5541,
    surchargeEnd: 5541,
    meterStart: 8535.5,
    meterEnd: 8831.5,
    turnoverPlus: 0,
    turnoverMinus: 0,
    commission: 8.59,
    cash: 134.35,
    fuel: 0,
    wash: 0,
    cashless: 140.04,
    expenses: 21.68,
    socialDeductions: 0,
    income: 0,
    verified: true,
    logs: [
      { id: '1', time: '11:24', emptyKm: 0.0, amount: 11.9, minutes: 6, occupiedKm: 1.8 },
      { id: '2', time: '11:40', emptyKm: 1.0, amount: 34.5, minutes: 30, occupiedKm: 8.2 },
      { id: '3', time: '12:36', emptyKm: 1.4, amount: 14.1, minutes: 10, occupiedKm: 1.7 },
      { id: '4', time: '12:48', emptyKm: 0.8, amount: 55.5, minutes: 25, occupiedKm: 17.9 },
      { id: '5', time: '15:52', emptyKm: 0.1, amount: 55.5, minutes: 36, occupiedKm: 17.7 },
    ],
  },
};

export class ERPStorage {
  private static state: ERPStoreState | null = null;
  private static listeners: Set<(state: ERPStoreState) => void> = new Set();

  static getState(): ERPStoreState {
    if (!this.state) {
      this.state = this.loadFromDisk();
    }
    return this.state;
  }

  static setState(newState: Partial<ERPStoreState> | ((prev: ERPStoreState) => ERPStoreState)): void {
    const current = this.getState();
    const updated = typeof newState === 'function' ? newState(current) : { ...current, ...newState };
    this.state = updated;
    this.saveToDisk(updated);
    this.listeners.forEach((listener) => listener(updated));
  }

  static subscribe(listener: (state: ERPStoreState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static loadFromDisk(): ERPStoreState {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        // Deep merge with initial state to guarantee all keys exist
        return {
          ...INITIAL_STATE,
          ...parsed,
          projects: (parsed.projects || INITIAL_STATE.projects).map((p: any) => ({
            ...p,
            displayName: p.displayName || p.name || p.projektnummer || `Auftrag #${p.id}`,
          })),
          company: { ...INITIAL_STATE.company, ...(parsed.company || {}) },
          budgets: { ...INITIAL_STATE.budgets, ...(parsed.budgets || {}) },
          projectSteps: { ...INITIAL_STATE.projectSteps, ...(parsed.projectSteps || {}) },
          plannedMaterials: { ...INITIAL_STATE.plannedMaterials, ...(parsed.plannedMaterials || {}) },
          taxiShift: { ...INITIAL_STATE.taxiShift, ...(parsed.taxiShift || {}) },
        };
      }
    } catch (err) {
      console.warn('Failed to load ERP state from localStorage, trying backup slot', err);
      try {
        const backup = localStorage.getItem(BACKUP_KEY);
        if (backup) return JSON.parse(backup);
      } catch (backupErr) {
        console.error('Backup slot also corrupt, returning clean initial state', backupErr);
      }
    }
    return INITIAL_STATE;
  }

  private static saveToDisk(state: ERPStoreState): void {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serialized);
      // Keep last-known-good backup in secondary slot
      localStorage.setItem(BACKUP_KEY, serialized);
    } catch (err) {
      console.error('Failed to save ERP state to localStorage:', err);
    }
  }

  static exportBackupJson(): string {
    const state = this.getState();
    const backupArchive = {
      format: 'HandwerkerERP-Backup',
      version: 2,
      createdAt: new Date().toISOString(),
      appState: state,
    };
    return JSON.stringify(backupArchive, null, 2);
  }

  static importBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.appState) {
        this.setState(parsed.appState);
        return true;
      }
      if (parsed.projects || parsed.company) {
        this.setState(parsed);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Invalid backup JSON:', err);
      return false;
    }
  }

  static resetToDemoData(): void {
    this.setState(INITIAL_STATE);
  }
}
