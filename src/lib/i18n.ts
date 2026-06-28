export type Lang = 'en' | 'hu';

export const translations = {
  en: {
    // Sidebar
    database: 'Database',
    connected: 'Connected',
    disconnected: 'Disconnected',
    saveMode: 'Save Mode',
    manual: 'Manual',
    auto: 'Auto',
    uiStyle: 'View Style',
    classic: 'Classic',
    compact: 'Compact',
    advanced: 'Advanced',
    repeat: 'Repeat',
    initial: 'Initial',
    info: 'Info',
    searchScripts: 'Search Scripts',
    entryGuid: 'Entry / GUID',
    searchByName: 'Search by Name',
    searchMode: 'Search Mode',
    namePlaceholder: 'Creature / GO name...',
    search: 'Search',
    newScript: 'New Script',
    trinityCoreEditor: 'TrinityCore SmartAI Editor',

    // Top bar
    entry: 'Entry',
    type: 'Type',
    rows: 'rows',
    searchOrCreate: 'Search for an entry or create a new script to begin',
    editor: 'Editor',
    sql: 'SQL',
    saveToDb: 'Save to DB',
    export: 'Export',

    // Welcome
    welcomeTitle: 'SmartAI Editor',
    welcomeText: 'Search for a creature/GO entry below, or click to start creating SmartAI scripts. Database search requires an active connection.',
    selectEvent: 'Select Event',
    selectEventDesc: 'Choose event type & set params',
    addActions: 'Add Actions',
    addActionsDesc: 'Multiple actions per event',
    setTarget: 'Set Target',
    setTargetDesc: 'Per-action target selection',
    exportSql: 'Export SQL',
    exportSqlDesc: 'Preview & export to file',

    // EventGroup
    event: 'Event',
    events: 'Events',
    actions: 'Actions',
    addAction: 'Add Action',
    addNewEvent: 'Add New Event',
    save: 'Save',
    eventType: 'Event Type',
    phaseMask: 'Phase Mask',
    chance: 'Chance %',
    flags: 'Flags',
    param: 'Param',
    paramString: 'Param String',
    noParams: 'This event has no parameters.',
    noActionParams: 'This action has no parameters.',
    noTargetParams: 'This target has no parameters.',
    actionType: 'Action Type',
    targetType: 'Target Type',

    // ActionCard
    conditions: 'Conditions',
    duplicate: 'Duplicate',
    delete: 'Delete',

    // Status messages
    newEventAdded: 'New event group added',
    actionAdded: 'Action added to event',
    actionRemoved: 'Action removed',
    actionDuplicated: 'Action duplicated',
    notConnected: 'Not connected to database. Create scripts offline or connect first.',
    notConnectedShort: 'Not connected to database',
    loaded: 'Loaded',
    scriptsForEntry: 'scripts for entry',
    noScriptsExport: 'No scripts to export',
    nameSearchNoResults: 'No scripts found for name',
    nameSearchFound: 'Found',
    nameSearchEntries: 'entries',
    nameSearchScripts: 'scripts',
    sqlExported: 'SQL exported successfully',
    savedToDb: 'Saved',
    scriptsToDb: 'scripts to database',
    connectedTo: 'Connected to',

    // DbModal
    dbConnection: 'Database Connection',
    host: 'Host',
    port: 'Port',
    user: 'User',
    password: 'Password',
    dbName: 'Database',
    connect: 'Connect',
    cancel: 'Cancel',

    // ConditionEditor
    conditionEditor: 'Condition Editor',
    addCondition: 'Add Condition',
    sourceType: 'Source Type',
    sourceGroup: 'Source Group',
    sourceEntry: 'Source Entry',
    sourceId: 'Source Id',
    elseGroup: 'Else Group',
    conditionType: 'Condition Type',
    conditionTarget: 'Condition Target',
    conditionValue: 'Condition Value',
    negative: 'Negative',
    errorType: 'Error Type',
    errorTextId: 'Error Text Id',
    scriptName: 'Script Name',
    close: 'Close',

    // SqlPreview
    sqlPreview: 'SQL Preview',
    copy: 'Copy',
    copied: 'Copied to clipboard',
    exportFile: 'Export to File',

    // Language
    language: 'Language',
    online: 'Online',
    offline: 'Offline',
    uploadToDb: 'Upload to DB',
    syncScript: 'Sync Script',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    import: 'Import',

    // Welcome - cached scripts
    recentScripts: 'Recent Scripts',
    noRecentScripts: 'No recent scripts',
    scriptCount: 'rows',
    filter: 'Filter...',

    // Clean / clear
    clear: 'Clear',
    open: 'Open',
    clearConfirm: 'You have active scripts. What would you like to do before clearing?',
    clearExportSql: 'Export SQL',
    clearSaveDb: 'Save to DB',
    discard: 'Discard & Clear',
    clearCancel: 'Cancel',

    // New script modal
    create: 'Create',
    addLinkedScript: 'Linked Script',
    linkedScriptAdded: 'Linked script added',
    remove: 'Remove',
    newEvent: 'New Event',

    // ConditionEditor - extra keys
    noConditions: 'No conditions for this smart event.',
    conditionHint: 'Conditions control when/how the smart script event fires.',
    negativeCondition: 'Negative (NOT)',
    saveConditions: 'Save to DB',
    conditionsSaved: 'Conditions saved to DB',
    conditionDeleted: 'Condition deleted',
    deleteCondition: 'Delete condition from DB?',
    unsavedConditions: 'You have unsaved conditions. Are you sure you want to close?',
    confirmClose: 'Confirm Close',
    addAnotherCondition: 'Add Another Condition',

    // OptionsModal
    options: 'Options',
  },
  hu: {
    // Sidebar
    database: 'Adatbázis',
    connected: 'Csatlakozva',
    disconnected: 'Nem csatlakozott',
    saveMode: 'Mentés mód',
    manual: 'Manuális',
    auto: 'Auto',
    uiStyle: 'Nézet stílus',
    classic: 'Klasszikus',
    compact: 'Kompakt',
    advanced: 'Részletek',
    repeat: 'Ismétlés',
    initial: 'Kezdeti',
    info: 'Info',
    searchScripts: 'Szkriptek keresése',
    entryGuid: 'Entry / GUID',
    searchByName: 'Keresés névre',
    searchMode: 'Keresés mód',
    namePlaceholder: 'Creature / GO név...',
    search: 'Keresés',
    newScript: 'Új szkript',
    trinityCoreEditor: 'TrinityCore SmartAI Szerkesztő',

    // Top bar
    entry: 'Entry',
    type: 'Típus',
    rows: 'sor',
    searchOrCreate: 'Keress egy entry-re vagy készíts új szkriptet a kezdéshez',
    editor: 'Szerkesztő',
    sql: 'SQL',
    saveToDb: 'Mentés DB-be',
    export: 'Exportálás',

    // Welcome
    welcomeTitle: 'SmartAI Szerkesztő',
    welcomeText: 'Keress egy creature/GO entry-re lent, vagy kattints az SmartAI szkriptek készítésének megkezdéséhez. Az adatbázis kereséshez aktív kapcsolat szükséges.',
    selectEvent: 'Event kiválasztása',
    selectEventDesc: 'Válassz event típus és állítsd be a paramétereket',
    addActions: 'Action hozzáadása',
    addActionsDesc: 'Több action egy eventhez',
    setTarget: 'Target beállítása',
    setTargetDesc: 'Actionönkénti target kiválasztása',
    exportSql: 'SQL exportálása',
    exportSqlDesc: 'Előnézet és export fájlba',

    // EventGroup
    event: 'Event',
    events: 'Esemény',
    actions: 'Action',
    addAction: 'Action hozzáadása',
    addNewEvent: 'Új event hozzáadása',
    save: 'Mentés',
    eventType: 'Event típus',
    phaseMask: 'Fázis maszk',
    chance: 'Esély %',
    flags: 'Flag-ek',
    param: 'Param',
    paramString: 'Param String',
    noParams: 'Ennek az eventnek nincsenek paraméterei.',
    noActionParams: 'Ennek az actionnek nincsenek paraméterei.',
    noTargetParams: 'Ennek a targetnek nincsenek paraméterei.',
    actionType: 'Action típus',
    targetType: 'Target típus',

    // ActionCard
    conditions: 'Feltételek',
    duplicate: 'Másolás',
    delete: 'Törlés',

    // Status messages
    newEventAdded: 'Új event csoport hozzáadva',
    actionAdded: 'Action hozzáadva az eventhez',
    actionRemoved: 'Action eltávolítva',
    actionDuplicated: 'Action másolva',
    notConnected: 'Nincs csatlakozva az adatbázishoz. Készíts szkripteket offline vagy csatlakozz először.',
    notConnectedShort: 'Nincs csatlakozva az adatbázishoz',
    loaded: 'Betöltve',
    scriptsForEntry: 'szkript az entry-hez',
    noScriptsExport: 'Nincsenek exportálható szkriptek',
    nameSearchNoResults: 'Nem található szkript a név alapján',
    nameSearchFound: 'Találva',
    nameSearchEntries: 'entry',
    nameSearchScripts: 'szkript',
    sqlExported: 'SQL sikeresen exportálva',
    savedToDb: 'Mentve',
    scriptsToDb: 'szkript az adatbázisba',
    connectedTo: 'Csatlakozva a',

    // DbModal
    dbConnection: 'Adatbázis kapcsolat',
    host: 'Host',
    port: 'Port',
    user: 'Felhasználó',
    password: 'Jelszó',
    dbName: 'Adatbázis',
    connect: 'Csatlakozás',
    cancel: 'Mégse',

    // ConditionEditor
    conditionEditor: 'Feltétel Szerkesztő',
    addCondition: 'Feltétel hozzáadása',
    sourceType: 'Forrás típus',
    sourceGroup: 'Forrás csoport',
    sourceEntry: 'Forrás entry',
    sourceId: 'Forrás id',
    elseGroup: 'Else csoport',
    conditionType: 'Feltétel típusa',
    conditionTarget: 'Feltétel target',
    conditionValue: 'Feltétel érték',
    negative: 'Negatív',
    errorType: 'Hiba típusa',
    errorTextId: 'Hiba szöveg id',
    scriptName: 'Szkript név',
    close: 'Bezárás',

    // SqlPreview
    sqlPreview: 'SQL Előnézet',
    copy: 'Másolás',
    copied: 'Vágólapra másolva',
    exportFile: 'Export fájlba',

    // Language
    language: 'Nyelv',
    online: 'Online',
    offline: 'Offline',
    uploadToDb: 'Feltöltés DB-be',
    syncScript: 'Szinkronizálás',
    theme: 'Téma',
    dark: 'Sötét',
    light: 'Világos',
    import: 'Import',

    // Welcome - cached scripts
    recentScripts: 'Legutóbbi szkriptek',
    noRecentScripts: 'Nincsenek legutóbbi szkriptek',
    scriptCount: 'sor',
    filter: 'Szűrés...',

    // Clean / clear
    clear: 'Törlés',
    open: 'Megnyitás',
    clearConfirm: 'Aktív szkriptjeid vannak. Mit szeretnél tenni törlés előtt?',
    clearExportSql: 'SQL exportálása',
    clearSaveDb: 'Mentés DB-be',
    discard: 'Elvetés & törlés',
    clearCancel: 'Mégse',

    // New script modal
    create: 'Létrehozás',
    addLinkedScript: 'Linkelt szkript',
    linkedScriptAdded: 'Linkelt szkript hozzáadva',
    remove: 'Eltávolítás',
    newEvent: 'Új Esemény',

    // ConditionEditor - extra keys
    noConditions: 'Nincsenek conditionök ehhez az eseményhez.',
    conditionHint: 'A conditionök szabályozzák, hogy mikor/hogyan indul el az esemény.',
    negativeCondition: 'Negált (NOT)',
    saveConditions: 'Mentés DB-be',
    conditionsSaved: 'Conditionök mentve az adatbázisba',
    conditionDeleted: 'Condition törölve',
    deleteCondition: 'Condition törlése az adatbázisból?',

    // OptionsModal
    options: 'Beállítások',
    unsavedConditions: 'Mentetlen conditionök vannak. Biztosan bezárod?',
    confirmClose: 'Bezárás megerősítése',
    addAnotherCondition: 'Még Egy Feltétel Hozzáadása',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

const STORAGE_KEY = 'fluxsai-lang';

export function getStoredLang(): Lang {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'hu') return stored;
  }
  return 'en';
}

export function storeLang(lang: Lang): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
  }
}

export function t(lang: Lang, key: TranslationKey): string {
  return translations[lang][key] ?? translations.en[key] ?? key;
}
