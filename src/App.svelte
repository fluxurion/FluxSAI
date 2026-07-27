<script lang="ts">
  import Sidebar from './components/Sidebar.svelte';
  import EventGroup from './components/EventGroup.svelte';
  import SqlPreview from './components/SqlPreview.svelte';
  import DbModal from './components/DbModal.svelte';
  import OptionsModal from './components/OptionsModal.svelte';
  import ImportModal from './components/ImportModal.svelte';
  import ActionListModal from './components/ActionListModal.svelte';
  import type { SmartScriptRow, ConditionRow, DbConfig, NameSearchResult } from './lib/api';
  import * as api from './lib/api';
  import { createEmptyScriptRow, createEmptyConditionRow, SMART_SCRIPT_TYPES, SMART_EVENTS, SMART_ACTIONS } from './lib/types';
  import { groupByEvent, getEventLabel, getActionLabel, type EventGroup as EventGroupData, generateScriptComment } from './lib/paramMeta';
  import { getStoredLang, storeLang, t, type Lang, type TranslationKey } from './lib/i18n';
  import { save } from '@tauri-apps/plugin-dialog';
  import { writeTextFile } from '@tauri-apps/plugin-fs';

  const CACHE_KEY = 'fluxsai-recent-scripts';
  const CACHE_ROWS_KEY = 'fluxsai-cached-rows';
  const MAX_CACHED = 5;

  interface CachedScript {
    entryorguid: number;
    source_type: number;
    rowCount: number;
    eventCount: number;
    actionCount: number;
    conditionCount: number;
    firstEventLabel: string;
    firstActionLabel: string;
    timestamp: number;
    isOnline: boolean;
  }

  function loadCachedScripts(): CachedScript[] {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return [];
  }

  function loadCachedRows(entry: number, sourceType: number): SmartScriptRow[] | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(CACHE_ROWS_KEY);
      if (!raw) return null;
      const all = JSON.parse(raw) as Record<string, SmartScriptRow[]>;
      const key = `${entry}:${sourceType}`;
      return all[key] ?? null;
    } catch {
      return null;
    }
  }

  function saveCachedRows(entry: number, sourceType: number, rows: SmartScriptRow[]) {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(CACHE_ROWS_KEY);
      const all = raw ? JSON.parse(raw) as Record<string, SmartScriptRow[]> : {};
      all[`${entry}:${sourceType}`] = rows;
      localStorage.setItem(CACHE_ROWS_KEY, JSON.stringify(all));
    } catch {}
  }

  function saveCachedScript(entry: number, sourceType: number, count: number, rows?: SmartScriptRow[], conditions?: ConditionRow[], isOnline: boolean = false) {
    if (entry === 0) return;
    let cached = loadCachedScripts();
    cached = cached.filter(c => !(c.entryorguid === entry && c.source_type === sourceType));
    
    let eventCount = 0;
    let actionCount = count;
    let conditionCount = conditions?.length ?? 0;
    let firstEventLabel = '';
    let firstActionLabel = '';
    if (rows && rows.length > 0) {
      const groups = groupByEvent(rows);
      eventCount = groups.length;
      if (groups[0]) {
        firstEventLabel = getEventLabel(groups[0].eventType);
        const firstRow = rows[groups[0].rows[0]];
        if (firstRow) firstActionLabel = getActionLabel(firstRow.action_type);
      }
    }
    
    cached.unshift({ entryorguid: entry, source_type: sourceType, rowCount: count, eventCount, actionCount, conditionCount, firstEventLabel, firstActionLabel, timestamp: Date.now(), isOnline });
    cached = cached.slice(0, MAX_CACHED);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    }
    cachedScripts = cached;
    if (rows) saveCachedRows(entry, sourceType, rows);
  }

  function openCachedScript(entry: number, sourceType: number) {
    const cached = loadCachedScripts().find(c => c.entryorguid === entry && c.source_type === sourceType);
    currentIsOnline = cached?.isOnline ?? false;
    currentEntry = entry;
    currentSourceType = sourceType;
    handleSearch(entry, sourceType);
  }

  function removeCachedScript(entry: number, sourceType: number) {
    let cached = loadCachedScripts();
    cached = cached.filter(c => !(c.entryorguid === entry && c.source_type === sourceType));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
      const raw = localStorage.getItem(CACHE_ROWS_KEY);
      if (raw) {
        try {
          const all = JSON.parse(raw) as Record<string, SmartScriptRow[]>;
          delete all[`${entry}:${sourceType}`];
          localStorage.setItem(CACHE_ROWS_KEY, JSON.stringify(all));
        } catch {}
      }
    }
    cachedScripts = cached;
  }

  let cachedScripts = $state<CachedScript[]>(loadCachedScripts());

  const sourceTypeIcons: Record<number, string> = {
    0: '🐺',
    1: '📦',
    2: '📍',
    3: '🎉',
    4: '💬',
    5: '❗',
    6: '✨',
    7: '🚢',
    8: '🏰',
    9: '⏱️',
    10: '🎬',
  };

  let scripts = $state<SmartScriptRow[]>([]);
  let conditions = $state<ConditionRow[]>([]);
  let connected = $state(false);
  let showDbModal = $state(false);
  let showOptionsModal = $state(false);
  let showActionListModal = $state(false);
  let actionListId = $state(0);
  let activeTab = $state<'editor' | 'sql'>('editor');
  let saveMode = $state<'manual' | 'auto'>(
    (localStorage.getItem('fluxsai_save_mode') as 'manual' | 'auto') ?? 'auto'
  );
  let uiStyle = $state<'classic' | 'compact'>(
    (localStorage.getItem('fluxsai_ui_style') as 'classic' | 'compact') ?? 'compact'
  );
  let sidebarCollapsed = $state(false);
  let showClearModal = $state(false);
  let showNewScriptModal = $state(false);
  let showAiWarningModal = $state(false);
  let aiWarningInfo = $state<{ entry: number; name: string; ainame: string; scriptname: string } | null>(null);
  let newScriptEntry = $state('');
  let newScriptType = $state(0);
  let welcomeSearchEntry = $state('');
  let welcomeSearchName = $state('');
  let welcomeSearchMode = $state<'entry' | 'name' | 'action' | 'event'>('entry');
  let expandedGroups = $state<Set<string>>(new Set());
  let defaultExpanded = $state(true);
  let nameSearchResult = $state<NameSearchResult | null>(null);
  let nameSearchPage = $state(0);
  let welcomeSearchType = $state(0);
  let welcomeSearchActionEventValue = $state(0);
  let currentEntry = $state(0);
  let currentSourceType = $state(0);
  let currentIsOnline = $state(false);
  let lang = $state<Lang>(getStoredLang());
  let theme = $state<'dark' | 'light'>('dark');
  let statusMessage = $state('');
  let statusType = $state<'info' | 'success' | 'error'>('info');

  // Undo/Redo history
  let history = $state<SmartScriptRow[][]>([]);
  let historyIndex = $state(-1);
  const MAX_HISTORY = 50;

  // Context menu for recent list
  let contextMenu = $state<{ x: number; y: number; entry: number; sourceType: number } | null>(null);

  // Recent list filter
  let recentFilter = $state('');

  // Multi-select for events
  let selectedEventIds = $state<Set<string>>(new Set());

  // Drag and drop for event reordering
  let draggedEventId = $state<string | null>(null);

  // Import modal
  let showImportModal = $state(false);

  let eventGroups = $derived(groupByEvent(scripts));

  let filteredCachedScripts = $derived(() => {
    if (!recentFilter) return cachedScripts;
    const filter = recentFilter.toLowerCase();
    return cachedScripts.filter(cs => {
      const entryMatch = cs.entryorguid.toString().includes(filter);
      const typeMatch = SMART_SCRIPT_TYPES.find(st => st.value === cs.source_type)?.label.toLowerCase().includes(filter);
      const eventMatch = cs.firstEventLabel?.toLowerCase().includes(filter);
      const actionMatch = cs.firstActionLabel?.toLowerCase().includes(filter);
      return entryMatch || typeMatch || eventMatch || actionMatch;
    });
  });

  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    if (saveMode !== 'auto' || !currentEntry) return;
    scripts.length + '|' + conditions.length + '|' + scripts.map(s => s.action_param1 + s.action_param2 + s.action_param3 + s.action_param4 + s.action_param5 + s.action_param6 + s.event_param1 + s.event_param2 + s.event_param3 + s.event_param4 + s.target_param1 + s.target_param2 + s.target_param3).join('');
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      try {
        if (scripts.length > 0) {
          saveCachedScript(currentEntry, currentSourceType, scripts.length, scripts, conditions, currentIsOnline);
        }
      } catch {}
    }, 1200);
    return () => { if (autoSaveTimer) clearTimeout(autoSaveTimer); };
  });

  function tr(key: TranslationKey): string {
    return t(lang, key);
  }

  function getStoredTheme(): 'dark' | 'light' {
    if (typeof localStorage === 'undefined') return 'dark';
    try {
      const stored = localStorage.getItem('fluxsai_theme');
      return (stored === 'light' ? 'light' : 'dark');
    } catch {
      return 'dark';
    }
  }

  function handleThemeChange(newTheme: 'dark' | 'light') {
    theme = newTheme;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('fluxsai_theme', newTheme);
    }
  }

  $effect(() => {
    theme = getStoredTheme();
  });

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('theme-light', theme === 'light');
    }
  });

  function handleLangChange(newLang: Lang) {
    lang = newLang;
    storeLang(newLang);
  }

  function showStatus(msg: string, type: 'info' | 'success' | 'error' = 'info') {
    statusMessage = msg;
    statusType = type;
    setTimeout(() => { statusMessage = ''; }, 4000);
  }

  async function handleSearch(entry: number, sourceType: number) {
    if (!connected) {
      if (scripts.length > 0 && currentEntry === entry && currentSourceType === sourceType) {
        showStatus(`${tr('loaded')} ${scripts.length} ${tr('scriptsForEntry')} ${entry}`, 'success');
        return;
      }
    }
    currentEntry = entry;
    currentSourceType = sourceType;
    if (!connected) {
      const cached = loadCachedRows(entry, sourceType);
      if (cached && cached.length > 0) {
        scripts = cached;
        currentIsOnline = false;
        history = [[...cached]];
        historyIndex = 0;
        saveCachedScript(entry, sourceType, cached.length, cached, [], false);
        showStatus(`${tr('loaded')} ${cached.length} ${tr('scriptsForEntry')} ${entry} (cached)`, 'success');
        return;
      }
      showStatus(tr('notConnected'), 'error');
      return;
    }
    try {
      const rows = await api.fetchScriptByEntry(entry, sourceType);
      scripts = rows;
      currentIsOnline = true;
      history = [[...rows]];
      historyIndex = 0;
      nameSearchResult = null;
      nameSearchPage = 0;
      const evCount = new Set(rows.map(r => r.eventId ?? r.id)).size;
      defaultExpanded = evCount <= 5;
      expandedGroups = new Set();
      try {
        conditions = await api.fetchAllConditionsForEntry(entry);
      } catch {
        conditions = [];
      }
      saveCachedScript(entry, sourceType, rows.length, rows, conditions, true);
      showStatus(`${tr('loaded')} ${rows.length} ${tr('scriptsForEntry')} ${entry}`, 'success');
      if (sourceType === 0 && entry > 0) {
        checkCreatureTemplateAi(entry);
      }
    } catch (e: any) {
      showStatus(String(e), 'error');
    }
  }

  async function checkCreatureTemplateAi(entry: number) {
    try {
      const info = await api.fetchCreatureTemplateInfo(entry);
      if (!info) return;
      const aiName = info.ainame?.trim() ?? '';
      const scriptName = info.scriptname?.trim() ?? '';
      if (aiName.toLowerCase() !== 'smartai' || scriptName !== '') {
        aiWarningInfo = { entry: info.entry, name: info.name, ainame: aiName, scriptname: scriptName };
        showAiWarningModal = true;
      }
    } catch {
      // silently ignore — not all DBs may have creature_template
    }
  }

  async function handleNameSearch(name: string, sourceType: number) {
    if (!connected) {
      showStatus(tr('notConnected'), 'error');
      return;
    }
    try {
      const result = await api.searchScriptsByName(name, sourceType);
      if (result.scripts.length === 0) {
        showStatus(`${tr('nameSearchNoResults')} "${name}"`, 'error');
        return;
      }
      nameSearchResult = result;
      nameSearchPage = 0;
      loadNameSearchPage(result, 0, sourceType);
      showStatus(`${tr('nameSearchFound')} ${result.entries.length} ${tr('nameSearchEntries')}, ${result.scripts.length} ${tr('nameSearchScripts')}`, 'success');
    } catch (e: any) {
      showStatus(String(e), 'error');
    }
  }

  async function handleActionEventSearch(searchField: 'action' | 'event', value: number, sourceType: number) {
    if (!connected) {
      showStatus(tr('notConnected'), 'error');
      return;
    }
    try {
      const result = await api.searchScriptsByActionOrEvent(searchField, value, sourceType);
      if (result.scripts.length === 0) {
        showStatus(`${tr('nameSearchNoResults')}`, 'error');
        return;
      }
      nameSearchResult = result;
      nameSearchPage = 0;
      currentSourceType = sourceType;
      loadNameSearchPage(result, 0, sourceType);
      showStatus(`${tr('nameSearchFound')} ${result.entries.length} ${tr('nameSearchEntries')}, ${result.scripts.length} ${tr('nameSearchScripts')}`, 'success');
    } catch (e: any) {
      showStatus(String(e), 'error');
    }
  }

  function getNameSearchEntryGroups(result: NameSearchResult): number[] {
    const seen = new Set<number>();
    const order: number[] = [];
    for (const s of result.scripts) {
      if (!seen.has(s.entryorguid)) { seen.add(s.entryorguid); order.push(s.entryorguid); }
    }
    return order;
  }

  async function loadNameSearchPage(result: NameSearchResult, page: number, sourceType: number) {
    const groups = getNameSearchEntryGroups(result);
    const entryorguid = groups[page] ?? groups[0];
    scripts = result.scripts.filter(s => s.entryorguid === entryorguid);
    currentEntry = entryorguid;
    currentSourceType = sourceType;
    expandedGroups = new Set();
    const evCount = new Set(scripts.map(r => r.eventId ?? r.id)).size;
    defaultExpanded = evCount <= 5;
    try {
      conditions = await api.fetchAllConditionsForEntry(entryorguid);
    } catch {
      conditions = [];
    }
  }

  async function navigateNameSearch(direction: -1 | 1) {
    if (!nameSearchResult) return;
    const groups = getNameSearchEntryGroups(nameSearchResult);
    const newPage = Math.max(0, Math.min(groups.length - 1, nameSearchPage + direction));
    if (newPage === nameSearchPage) return;
    nameSearchPage = newPage;
    await loadNameSearchPage(nameSearchResult, newPage, currentSourceType);
  }

  function nextId(): number {
    return scripts.length > 0 ? Math.max(...scripts.map(s => s.id)) + 1 : 0;
  }

  function nextEventId(): number {
    return scripts.length > 0 ? Math.max(...scripts.map(s => s.eventId ?? 0)) + 1 : 0;
  }

  function handleNew() {
    sidebarCollapsed = true;
    if (currentEntry === 0) {
      showNewScriptModal = true;
    } else {
      createNewScript(currentEntry, currentSourceType);
    }
  }

  function confirmNewScript() {
    const entry = parseInt(newScriptEntry);
    if (isNaN(entry) || entry <= 0) return;
    createNewScript(entry, newScriptType);
    showNewScriptModal = false;
    newScriptEntry = '';
    newScriptType = 0;
  }

  function createNewScript(entry: number, sourceType: number) {
    addToHistory();
    currentEntry = entry;
    currentSourceType = sourceType;
    const row = createEmptyScriptRow(entry, sourceType);
    row.id = nextId();
    const evId = nextEventId();
    row.eventId = evId;
    row.comment = generateScriptComment(row);
    scripts = [...scripts, row];
    expandedGroups = new Set([`ev-${evId}`]);
    saveCachedScript(entry, sourceType, scripts.length, scripts, [], connected);
    sidebarCollapsed = true;
    showStatus(tr('newEventAdded'), 'success');
  }

  function handleAddAction(group: EventGroupData) {
    addToHistory();
    const template = scripts[group.rows[0]];
    const row = createEmptyScriptRow(currentEntry, currentSourceType);
    row.id = nextId();
    row.eventId = template.eventId;
    row.event_type = template.event_type;
    row.event_phase_mask = template.event_phase_mask;
    row.event_chance = template.event_chance;
    row.event_flags = template.event_flags;
    row.event_param1 = template.event_param1;
    row.event_param2 = template.event_param2;
    row.event_param3 = template.event_param3;
    row.event_param4 = template.event_param4;
    row.event_param5 = template.event_param5;
    row.event_param_string = template.event_param_string;
    row.comment = generateScriptComment(row);
    scripts = [...scripts, row];
    showStatus(tr('actionAdded'), 'success');
  }

  async function handleDeleteAction(_group: EventGroupData, rowIdx: number) {
    addToHistory();
    const row = scripts[rowIdx];
    if (connected && row) {
      try {
        await api.deleteScript(row.entryorguid, row.source_type, row.id);
      } catch (e: any) {
        showStatus(String(e), 'error');
        return;
      }
    }
    scripts = scripts.filter((_, i) => i !== rowIdx);
    showStatus(tr('actionRemoved'), 'info');
  }

  async function handleDeleteEvent(group: EventGroupData) {
    addToHistory();
    const indices = new Set(group.rows);
    if (connected) {
      for (const rowIdx of group.rows) {
        const row = scripts[rowIdx];
        if (row) {
          try {
            await api.deleteScript(row.entryorguid, row.source_type, row.id);
          } catch (e: any) {
            showStatus(String(e), 'error');
            return;
          }
        }
      }
    }
    scripts = scripts.filter((_, i) => !indices.has(i));
    showStatus(tr('actionRemoved'), 'info');
  }

  function handleDuplicateAction(_group: EventGroupData, rowIdx: number) {
    addToHistory();
    const orig = scripts[rowIdx];
    const copy = { ...orig, id: nextId() };
    scripts = [...scripts.slice(0, rowIdx + 1), copy, ...scripts.slice(rowIdx + 1)];
    showStatus(tr('actionDuplicated'), 'success');
  }

  function handleAddCondition(row: SmartScriptRow) {
    addToHistory();
    const typeLabel = SMART_SCRIPT_TYPES.find(t => t.value === row.source_type)?.label ?? 'Entry';
    const c = createEmptyConditionRow();
    c.SourceEntry = row.entryorguid;
    c.SourceId = row.source_type;
    c.SourceGroup = row.id + 1;
    c.ElseGroup = conditions.filter(cd => cd.SourceGroup === row.id + 1 && cd.SourceId === row.source_type && cd.SourceEntry === row.entryorguid).length;
    c.ScriptName = `${typeLabel} ${row.entryorguid} SAI`;
    conditions = [...conditions, c];
  }

  function handleDeleteCondition(cond: ConditionRow) {
    addToHistory();
    conditions = conditions.filter(c => c !== cond);
  }

  async function handleConditionSave(cond: ConditionRow) {
    try {
      if (connected) {
        await api.insertCondition(cond);
        showStatus('Condition saved to DB', 'success');
      } else {
        saveCachedScript(currentEntry, currentSourceType, scripts.length, scripts, conditions, currentIsOnline);
        showStatus('Condition saved to cache', 'success');
      }
    } catch (e: any) {
      showStatus(String(e), 'error');
    }
  }

  async function handleActionSave(row: SmartScriptRow) {
    try {
      if (connected) {
        await api.insertScript(row);
        showStatus('Action saved to DB', 'success');
      } else {
        saveCachedScript(currentEntry, currentSourceType, scripts.length, scripts, conditions, currentIsOnline);
        showStatus('Action saved to cache', 'success');
      }
    } catch (e: any) {
      showStatus(String(e), 'error');
    }
  }

  async function handleEventSave(group: EventGroupData) {
    try {
      if (connected) {
        for (const rowIdx of group.rows) {
          await api.insertScript(scripts[rowIdx]);
        }
        showStatus(`Event saved to DB (${group.rows.length} rows)`, 'success');
      } else {
        saveCachedScript(currentEntry, currentSourceType, scripts.length, scripts, conditions, currentIsOnline);
        showStatus(`Event saved to cache (${group.rows.length} rows)`, 'success');
      }
    } catch (e: any) {
      showStatus(String(e), 'error');
    }
  }

  async function handleConnect(config: DbConfig) {
    connected = true;
    showDbModal = false;
    showStatus(`${tr('connectedTo')} ${config.host}:${config.port}/${config.database}`, 'success');
  }

  async function handleSaveAll() {
    if (!connected) {
      showStatus(tr('notConnectedShort'), 'error');
      return;
    }
    const validation = validateScripts();
    if (!validation.valid) {
      showStatus(`Validation errors: ${validation.errors.join('; ')}`, 'error');
      return;
    }
    try {
      for (const row of scripts) {
        await api.insertScript(row);
      }
      // Delete existing conditions for this entry
      if (currentEntry > 0) {
        await api.deleteConditionsForSmartEvent(currentEntry, 0);
      }
      // Insert all conditions
      for (const cond of conditions) {
        await api.insertCondition(cond);
      }
      showStatus(`${tr('savedToDb')} ${scripts.length} ${tr('scriptsToDb')} + ${conditions.length} conditions`, 'success');
    } catch (e: any) {
      showStatus(String(e), 'error');
    }
  }

  async function handleUploadToDb() {
    if (!connected) {
      showStatus(tr('notConnectedShort'), 'error');
      return;
    }
    const validation = validateScripts();
    if (!validation.valid) {
      showStatus(`Validation errors: ${validation.errors.join('; ')}`, 'error');
      return;
    }
    try {
      for (const row of scripts) {
        await api.insertScript(row);
      }
      // Delete existing conditions for this entry
      if (currentEntry > 0) {
        await api.deleteConditionsForSmartEvent(currentEntry, 0);
      }
      // Insert all conditions
      for (const cond of conditions) {
        await api.insertCondition(cond);
      }
      currentIsOnline = true;
      saveCachedScript(currentEntry, currentSourceType, scripts.length, scripts, conditions, true);
      showStatus(`${tr('savedToDb')} ${scripts.length} ${tr('scriptsToDb')} + ${conditions.length} conditions`, 'success');
    } catch (e: any) {
      showStatus(String(e), 'error');
    }
  }

  async function handleExport() {
    if (scripts.length === 0) {
      showStatus(tr('noScriptsExport'), 'error');
      return;
    }
    try {
      const sql = await api.exportScriptsSql(scripts, conditions);
      const sourcePrefix = currentSourceType === 0 ? 'creature' : currentSourceType === 1 ? 'gameobject' : currentSourceType === 2 ? 'areatrigger' : currentSourceType === 9 ? 'scene' : `source${currentSourceType}`;
      const defaultName = `${sourcePrefix}_${currentEntry}_sai.sql`;
      const filePath = await save({
        defaultPath: defaultName,
        filters: [{ name: 'SQL files', extensions: ['sql'] }],
      });
      if (!filePath) return;
      await writeTextFile(filePath, sql);
      showStatus(`${tr('sqlExported')} → ${filePath}`, 'success');
    } catch (e: any) {
      showStatus(String(e), 'error');
    }
  }

  async function handleDeleteFromDb() {
    if (scripts.length === 0) return;
    if (!connected) {
      showStatus(tr('notConnectedShort'), 'error');
      return;
    }
    try {
      for (const row of scripts) {
        await api.deleteScript(row.entryorguid, row.source_type, row.id);
      }
      showStatus(`${scripts.length} ${tr('rows')} deleted from DB`, 'success');
      doClear();
    } catch (e: any) {
      showStatus(String(e), 'error');
    }
  }

  async function handleClearExport() {
    await handleExport();
    doClear();
  }

  async function handleClearSaveDb() {
    await handleSaveAll();
    doClear();
  }

  function doClear() {
    scripts = [];
    conditions = [];
    currentEntry = 0;
    currentSourceType = 0;
    sidebarCollapsed = false;
    showClearModal = false;
    activeTab = 'editor';
  }

  function handleWelcomeSearch() {
    if (welcomeSearchMode === 'name') {
      if (welcomeSearchName.trim()) {
        if (welcomeSearchType > 1) welcomeSearchType = 0;
        handleNameSearch(welcomeSearchName.trim(), welcomeSearchType);
      }
      return;
    }
    if (welcomeSearchMode === 'action' || welcomeSearchMode === 'event') {
      handleActionEventSearch(welcomeSearchMode, welcomeSearchActionEventValue, welcomeSearchType);
      return;
    }
    const entry = parseInt(welcomeSearchEntry);
    if (!isNaN(entry)) {
      handleSearch(entry, welcomeSearchType);
    }
  }

  function handleAddRow() {
    handleNew();
  }

  function handleKeyDown(e: KeyboardEvent) {
    // Ctrl+S: Save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (connected) {
        handleSaveAll();
      } else {
        saveCachedScript(currentEntry, currentSourceType, scripts.length, scripts, conditions, currentIsOnline);
        showStatus('Saved to cache', 'success');
      }
      return;
    }
    // Ctrl+E: Export
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      handleExport();
      return;
    }
    // Ctrl+N: New script
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      handleNew();
      return;
    }
    // Ctrl+F: Focus search
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      if (currentEntry === 0) {
        const searchInput = document.querySelector('.welcome-search-input') as HTMLInputElement;
        searchInput?.focus();
      }
      return;
    }
    // Ctrl+Z: Undo
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    }
    // Ctrl+Y or Ctrl+Shift+Z: Redo
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      handleRedo();
      return;
    }
    // Escape: Close modals
    if (e.key === 'Escape') {
      if (showDbModal) showDbModal = false;
      if (showOptionsModal) showOptionsModal = false;
      if (showActionListModal) showActionListModal = false;
      if (showNewScriptModal) showNewScriptModal = false;
      if (showClearModal) showClearModal = false;
      if (showAiWarningModal) showAiWarningModal = false;
      return;
    }
  }

  function addToHistory() {
    const currentSnapshot = [...scripts];
    if (historyIndex >= 0 && JSON.stringify(history[historyIndex]) === JSON.stringify(currentSnapshot)) {
      return;
    }
    history = history.slice(0, historyIndex + 1);
    history = [...history, currentSnapshot];
    if (history.length > MAX_HISTORY) {
      history = history.slice(-MAX_HISTORY);
    }
    historyIndex = history.length - 1;
  }

  function handleUndo() {
    if (historyIndex > 0) {
      historyIndex--;
      scripts = [...history[historyIndex]];
      showStatus('Undo', 'info');
    }
  }

  function handleRedo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      scripts = [...history[historyIndex]];
      showStatus('Redo', 'info');
    }
  }

  function validateScripts(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (currentEntry === 0) {
      errors.push('Entry/GUID cannot be 0');
    }
    
    for (const row of scripts) {
      if (row.entryorguid === 0) {
        errors.push(`Row ${row.id}: Entry/GUID is 0`);
      }
      if (row.event_type === 0 && row.action_type === 0) {
        errors.push(`Row ${row.id}: Both event and action type are 0 (NONE)`);
      }
      if (row.event_chance < 0 || row.event_chance > 100) {
        errors.push(`Row ${row.id}: Event chance must be between 0-100`);
      }
    }
    
    // Check for duplicate IDs
    const ids = scripts.map(s => s.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate row IDs: ${[...new Set(duplicateIds)].join(', ')}`);
    }
    
    return { valid: errors.length === 0, errors };
  }

  function handleContextMenu(e: MouseEvent, entry: number, sourceType: number) {
    e.preventDefault();
    contextMenu = { x: e.clientX, y: e.clientY, entry, sourceType };
  }

  function closeContextMenu() {
    contextMenu = null;
  }

  function handleContextAction(action: string) {
    if (!contextMenu) return;
    const { entry, sourceType } = contextMenu;

    if (action === 'open') {
      openCachedScript(entry, sourceType);
    } else if (action === 'remove') {
      removeCachedScript(entry, sourceType);
    } else if (action === 'export') {
      const cached = loadCachedRows(entry, sourceType);
      if (cached && cached.length > 0) {
        handleExport();
      }
    }

    closeContextMenu();
  }

  function handleToggleSelect(eventId: string) {
    if (selectedEventIds.has(eventId)) {
      selectedEventIds.delete(eventId);
    } else {
      selectedEventIds.add(eventId);
    }
    selectedEventIds = new Set(selectedEventIds);
  }

  function handleSelectAll() {
    const allIds = eventGroups.map(g => g.eventId);
    selectedEventIds = new Set(allIds);
  }

  function handleDeselectAll() {
    selectedEventIds = new Set();
  }

  function handleDeleteSelected() {
    if (selectedEventIds.size === 0) return;
    addToHistory();
    const indicesToDelete = new Set<number>();
    for (const group of eventGroups) {
      if (selectedEventIds.has(group.eventId)) {
        group.rows.forEach(idx => indicesToDelete.add(idx));
      }
    }
    scripts = scripts.filter((_, i) => !indicesToDelete.has(i));
    selectedEventIds = new Set();
    showStatus(`Deleted ${indicesToDelete.size} rows`, 'info');
  }

  function handleDragStart(e: DragEvent, eventId: string) {
    draggedEventId = eventId;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  function handleDragOver(e: DragEvent, eventId: string) {
    if (draggedEventId && draggedEventId !== eventId) {
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
    }
  }

  function handleDrop(e: DragEvent, targetEventId: string) {
    e.preventDefault();
    if (!draggedEventId || draggedEventId === targetEventId) return;

    addToHistory();
    const sourceGroup = eventGroups.find(g => g.eventId === draggedEventId);
    const targetGroup = eventGroups.find(g => g.eventId === targetEventId);

    if (!sourceGroup || !targetGroup) return;

    // Get all row indices from source group
    const sourceIndices = sourceGroup.rows;
    const targetIndices = targetGroup.rows;

    // Remove source rows from scripts
    const sourceRows = sourceIndices.map(i => scripts[i]);
    const remainingScripts = scripts.filter((_, i) => !sourceIndices.has(i));

    // Find the position to insert (before target group)
    const insertPosition = Math.min(...targetIndices);

    // Insert source rows at the new position
    const newScripts = [
      ...remainingScripts.slice(0, insertPosition),
      ...sourceRows,
      ...remainingScripts.slice(insertPosition)
    ];

    scripts = newScripts;
    draggedEventId = null;
    showStatus('Events reordered', 'info');
  }

  function handleDragEnd() {
    draggedEventId = null;
  }

  async function handleImport(importedScripts: SmartScriptRow[], importedConditions: ConditionRow[]) {
    addToHistory();
    scripts = importedScripts;
    conditions = importedConditions;
    currentEntry = importedScripts[0]?.entryorguid ?? 0;
    currentSourceType = importedScripts[0]?.source_type ?? 0;
    currentIsOnline = false;
    history = [[...importedScripts]];
    historyIndex = 0;
    showStatus(`Imported ${importedScripts.length} scripts and ${importedConditions.length} conditions`, 'success');
    showImportModal = false;
  }
</script>

<div class="app-container" class:sidebar-collapsed={sidebarCollapsed && scripts.length > 0} onkeydown={handleKeyDown} onclick={closeContextMenu} tabindex="-1">
  <div class="sidebar-wrapper" class:collapsed={sidebarCollapsed && scripts.length > 0}>
    <Sidebar
      connected={connected}
      onConnectClick={() => showDbModal = true}
      onSearch={handleSearch}
      onNameSearch={handleNameSearch}
      onActionEventSearch={handleActionEventSearch}
      onNew={handleAddRow}
      {lang}
      onOptions={() => showOptionsModal = true}
      onCollapse={() => sidebarCollapsed = true}
    />
  </div>

  <div class="main-area">
    <div class="top-bar glass">
      <div class="top-bar-left">
        {#if sidebarCollapsed && scripts.length > 0}
          <button class="sidebar-toggle" onclick={() => sidebarCollapsed = false} title="Toggle sidebar">
            ☰
          </button>
        {/if}
        {#if currentEntry !== 0}
          <span class="badge badge-blue">{currentEntry}</span>
          <span class="badge badge-purple">{SMART_SCRIPT_TYPES.find(st => st.value === currentSourceType)?.label ?? currentSourceType}</span>
          <span class="badge badge-green">{eventGroups.length} {tr('events')}</span>
          <span class="status-indicator" class:online={currentIsOnline} class:offline={!currentIsOnline} title={currentIsOnline ? tr('online') : tr('offline')}>
            {currentIsOnline ? '🟢' : '🔴'}
          </span>
        {:else}
          <span class="top-bar-hint">{tr('searchOrCreate')}</span>
        {/if}
      </div>
      <div class="top-bar-right">
        <div class="tab-switcher">
          <button class="tab-btn" class:active={activeTab === 'editor'} onclick={() => activeTab = 'editor'}>
            {tr('editor')}
          </button>
          <button class="tab-btn" class:active={activeTab === 'sql'} onclick={() => activeTab = 'sql'}>
            {tr('sql')}
          </button>
        </div>
        {#if !currentIsOnline && connected && scripts.length > 0}
          <button class="btn-sync" onclick={handleUploadToDb}>
            {tr('uploadToDb')}
          </button>
        {/if}
        <button class="btn-primary" onclick={handleSaveAll} disabled={!connected || scripts.length === 0}>
          {tr('saveToDb')}
        </button>
        <button class="btn-import" onclick={() => showImportModal = true}>
          📥 {tr('import')}
        </button>
        <button class="btn-export" onclick={handleExport} disabled={scripts.length === 0}>
          📤 {tr('export')}
        </button>
        <button class="btn-danger" onclick={handleDeleteFromDb} disabled={!connected || scripts.length === 0}>
          {tr('delete')}
        </button>
        <button class="btn-cancel" onclick={doClear} disabled={scripts.length === 0}>
          {tr('cancel')}
        </button>
      </div>
    </div>

    {#if statusMessage}
      <div class="status-bar" class:success={statusType === 'success'} class:error={statusType === 'error'}>
        {statusMessage}
      </div>
    {/if}

    <div class="content-area">
      {#if activeTab === 'editor'}
        <div class="editor-panel">
          {#if scripts.length === 0}
            <div class="welcome-state">
              <div class="welcome-bg">
                <div class="aurora aurora-1"></div>
                <div class="aurora aurora-2"></div>
                <div class="aurora aurora-3"></div>
                <div class="hex-grid">
                  {#each Array(12) as _, i}
                    <div class="hex" style="--i: {i}"></div>
                  {/each}
                </div>
              </div>
              <div class="welcome-content">
                <div class="welcome-icon">FluxSAI</div>
              <h2>{tr('welcomeTitle')}</h2>
              <p>{tr('welcomeText')}</p>
              <div class="welcome-search">
                <div class="welcome-search-mode">
                  <button class="save-mode-btn" class:active={welcomeSearchMode === 'entry'} onclick={() => welcomeSearchMode = 'entry'}>{tr('entryGuid')}</button>
                  <button class="save-mode-btn" class:active={welcomeSearchMode === 'name'} onclick={() => welcomeSearchMode = 'name'}>{tr('searchByName')}</button>
                  <button class="save-mode-btn" class:active={welcomeSearchMode === 'action'} onclick={() => welcomeSearchMode = 'action'}>{tr('searchByAction')}</button>
                  <button class="save-mode-btn" class:active={welcomeSearchMode === 'event'} onclick={() => welcomeSearchMode = 'event'}>{tr('searchByEvent')}</button>
                </div>
                {#if welcomeSearchMode === 'entry'}
                  <input
                    type="text"
                    class="welcome-search-input"
                    placeholder={tr('entryGuid')}
                    bind:value={welcomeSearchEntry}
                    onkeydown={(e) => e.key === 'Enter' && handleWelcomeSearch()}
                    disabled={!connected}
                  />
                  <select bind:value={welcomeSearchType} disabled={!connected}>
                    {#each SMART_SCRIPT_TYPES as st}
                      <option value={st.value}>{st.label}</option>
                    {/each}
                  </select>
                {:else if welcomeSearchMode === 'name'}
                  <input
                    type="text"
                    class="welcome-search-input"
                    placeholder={tr('namePlaceholder')}
                    bind:value={welcomeSearchName}
                    onkeydown={(e) => e.key === 'Enter' && handleWelcomeSearch()}
                    disabled={!connected}
                  />
                  <select bind:value={welcomeSearchType} disabled={!connected}>
                    {#each SMART_SCRIPT_TYPES.filter(st => st.value === 0 || st.value === 1) as st}
                      <option value={st.value}>{st.label}</option>
                    {/each}
                  </select>
                {:else}
                  <select bind:value={welcomeSearchActionEventValue} disabled={!connected}>
                    {#each (welcomeSearchMode === 'action' ? SMART_ACTIONS : SMART_EVENTS) as opt}
                      <option value={opt.value}>{opt.value}: {opt.label}</option>
                    {/each}
                  </select>
                  <select bind:value={welcomeSearchType} disabled={!connected}>
                    {#each SMART_SCRIPT_TYPES as st}
                      <option value={st.value}>{st.label}</option>
                    {/each}
                  </select>
                {/if}
                <button class="btn-primary" onclick={handleWelcomeSearch} disabled={!connected}>
                  {tr('search')}
                </button>
              </div>
              {#if !connected}
                <p class="welcome-hint">{tr('notConnectedShort')}</p>
              {/if}
              <button class="welcome-new-btn" onclick={handleNew}>
                + {tr('newScript')}
              </button>
              {#if cachedScripts.length > 0}
                <div class="recent-scripts">
                  <div class="recent-title">{tr('recentScripts')}</div>
                  <input
                    type="text"
                    placeholder={tr('filter')}
                    bind:value={recentFilter}
                    class="recent-filter"
                  />
                  <div class="recent-list">
                    {#each filteredCachedScripts() as cs}
                      <div class="recent-item-wrapper">
                        <button class="recent-item" onclick={() => openCachedScript(cs.entryorguid, cs.source_type)} oncontextmenu={(e) => handleContextMenu(e, cs.entryorguid, cs.source_type)}>
                          <span class="recent-entry">{cs.entryorguid}</span>
                          <span class="recent-type">{SMART_SCRIPT_TYPES.find(st => st.value === cs.source_type)?.label ?? cs.source_type}</span>
                          <span class="recent-status" class:online={cs.isOnline} class:offline={!cs.isOnline}>
                            {cs.isOnline ? '🟢' : '🔴'}
                          </span>
                          {#if cs.firstEventLabel}
                            <span class="recent-event-label">{cs.firstEventLabel}</span>
                          {/if}
                          {#if cs.firstActionLabel}
                            <span class="recent-action-label">{cs.firstActionLabel}</span>
                          {/if}
                          <span class="recent-info">{cs.eventCount || '?'} ev · {cs.rowCount} rows · {cs.conditionCount || 0} cond</span>
                        </button>
                        <button class="recent-remove" title="{tr('remove')}" onclick={() => removeCachedScript(cs.entryorguid, cs.source_type)}>×</button>
                      </div>
                    {/each}
                  </div>
                </div>
                {#if contextMenu}
                  <div class="context-menu" style="left: {contextMenu.x}px; top: {contextMenu.y}px;">
                    <button class="context-menu-item" onclick={() => handleContextAction('open')}>{tr('open')}</button>
                    <button class="context-menu-item" onclick={() => handleContextAction('export')}>{tr('export')}</button>
                    <button class="context-menu-item danger" onclick={() => handleContextAction('remove')}>{tr('remove')}</button>
                  </div>
                {/if}
              {:else}
                <p class="no-recent">{tr('noRecentScripts')}</p>
              {/if}
            </div>
          </div>
          {:else}
            <div class="scripts-list">
              {#if nameSearchResult}
                {@const nsGroups = getNameSearchEntryGroups(nameSearchResult)}
                <div class="name-search-pager">
                  <button class="pager-btn" onclick={() => navigateNameSearch(-1)} disabled={nameSearchPage === 0}>‹</button>
                  <span class="pager-info">
                    <span class="pager-entry">{currentEntry}</span>
                    {#if nameSearchResult.entries.find(e => e.entry === currentEntry)}
                      <span class="pager-name">{nameSearchResult.entries.find(e => e.entry === currentEntry)?.name}</span>
                    {/if}
                    <span class="pager-count">{nameSearchPage + 1} / {nsGroups.length}</span>
                  </span>
                  <button class="pager-btn" onclick={() => navigateNameSearch(1)} disabled={nameSearchPage >= nsGroups.length - 1}>›</button>
                </div>
              {/if}
              <div class="source-header glass-event">
                <label class="source-field">
                  <span class="param-label">{tr('entryGuid')}</span>
                  <input
                    type="number"
                    value={currentEntry}
                    onchange={(e) => {
                      const val = parseInt(e.currentTarget.value) || 0;
                      currentEntry = val;
                      scripts = scripts.map(s => ({ ...s, entryorguid: val }));
                    }}
                  />
                </label>
                <label class="source-field">
                  <span class="param-label">{tr('sourceType')}</span>
                  <select
                    value={currentSourceType}
                    onchange={(e) => {
                      const val = parseInt(e.currentTarget.value) || 0;
                      currentSourceType = val;
                      scripts = scripts.map(s => ({ ...s, source_type: val }));
                    }}
                  >
                    {#each SMART_SCRIPT_TYPES as st}
                      <option value={st.value}>{st.label}</option>
                    {/each}
                  </select>
                </label>
                <div class="source-info">
                  <span class="badge badge-green">{eventGroups.length} {tr('events')}</span>
                  {#if selectedEventIds.size > 0}
                    <span class="badge badge-purple">{selectedEventIds.size} selected</span>
                  {/if}
                </div>
                {#if eventGroups.length > 0}
                  <div class="batch-actions">
                    <button class="batch-btn" onclick={handleSelectAll} title="Select All">☑ All</button>
                    <button class="batch-btn" onclick={handleDeselectAll} title="Deselect All">☐ None</button>
                    {#if selectedEventIds.size > 0}
                      <button class="batch-btn danger" onclick={handleDeleteSelected} title="Delete Selected">🗑 Delete ({selectedEventIds.size})</button>
                    {/if}
                  </div>
                {/if}
              </div>
              {#each eventGroups as group (group.key)}
                <EventGroup
                  {group}
                  {scripts}
                  onAddAction={handleAddAction}
                  onDeleteAction={handleDeleteAction}
                  onDuplicateAction={handleDuplicateAction}
                  onActionSave={handleActionSave}
                  onAddCondition={handleAddCondition}
                  onDeleteCondition={handleDeleteCondition}
                  onConditionSave={handleConditionSave}
                  {selectedEventIds}
                  onToggleSelect={handleToggleSelect}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  onSaveEvent={handleEventSave}
                  {conditions}
                  onDeleteEvent={handleDeleteEvent}
                  {lang}
                  {saveMode}
                  {uiStyle}
                  {connected}
                  onOpenActionList={(id: number) => { actionListId = id; showActionListModal = true; }}
                  expanded={defaultExpanded ? (expandedGroups.size === 0 || expandedGroups.has(`ev-${scripts[group.rows[0]]?.eventId ?? group.key}`)) : expandedGroups.has(`ev-${scripts[group.rows[0]]?.eventId ?? group.key}`)}
                />
              {/each}
              <button class="add-script-btn" onclick={handleNew}>
                + {tr('newEvent')}
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <div class="sql-tab">
          <SqlPreview bind:rows={scripts} {conditions} onExport={handleExport} />
        </div>
      {/if}
    </div>
  </div>
</div>

{#if showDbModal}
  <DbModal onConnect={handleConnect} onClose={() => showDbModal = false} {lang} />
{/if}
{#if showOptionsModal}
  <OptionsModal onClose={() => showOptionsModal = false} {lang} onLangChange={handleLangChange} bind:saveMode bind:uiStyle {theme} onThemeChange={handleThemeChange} />
{/if}
{#if showImportModal}
  <ImportModal onImport={handleImport} onClose={() => showImportModal = false} {connected} {lang} />
{/if}
{#if showActionListModal}
  <ActionListModal {actionListId} onClose={() => showActionListModal = false} {lang} {saveMode} {uiStyle} {connected} />
{/if}

{#if showNewScriptModal}
  <div class="modal-overlay" role="presentation" onclick={() => showNewScriptModal = false} onkeydown={(e) => e.key === 'Escape' && (showNewScriptModal = false)}>
    <div class="new-script-modal glass-card" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
      <h3>{tr('newScript')}</h3>
      <label class="modal-field">
        <span class="param-label">{tr('entryGuid')}</span>
        <input
          type="number"
          placeholder="e.g. 12345"
          bind:value={newScriptEntry}
          onkeydown={(e) => e.key === 'Enter' && confirmNewScript()}
        />
      </label>
      <div class="modal-field">
        <span class="param-label">{tr('sourceType')}</span>
        <div class="source-type-grid">
          {#each SMART_SCRIPT_TYPES as st}
            <button
              class="source-type-icon"
              class:selected={newScriptType === st.value}
              onclick={() => newScriptType = st.value}
            >
              <span class="source-type-emoji">{sourceTypeIcons[st.value] ?? '📋'}</span>
              <span class="source-type-label">{st.label}</span>
            </button>
          {/each}
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-primary" onclick={confirmNewScript}>
          {tr('create')}
        </button>
        <button class="btn-ghost" onclick={() => showNewScriptModal = false}>
          {tr('cancel')}
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showClearModal}
  <div class="modal-overlay" role="presentation" onclick={() => showClearModal = false} onkeydown={(e) => e.key === 'Escape' && (showClearModal = false)}>
    <div class="clear-modal glass-card" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
      <h3>{tr('clear')}</h3>
      <p>{tr('clearConfirm')}</p>
      <div class="clear-actions">
        <button class="btn-ghost" onclick={handleClearExport}>
          {tr('clearExportSql')}
        </button>
        {#if connected}
          <button class="btn-primary" onclick={handleClearSaveDb}>
            {tr('clearSaveDb')}
          </button>
        {/if}
        <button class="btn-danger" onclick={doClear}>
          {tr('discard')}
        </button>
        <button class="btn-ghost" onclick={() => showClearModal = false}>
          {tr('clearCancel')}
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showAiWarningModal && aiWarningInfo}
  <div class="modal-overlay" role="presentation" onclick={() => showAiWarningModal = false} onkeydown={(e) => e.key === 'Escape' && (showAiWarningModal = false)}>
    <div class="ai-warning-modal glass-card" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
      <h3>⚠️ AI Configuration Warning</h3>
      <p class="warning-creature">
        <strong>{aiWarningInfo.name}</strong> (Entry: {aiWarningInfo.entry})
      </p>
      <div class="warning-details">
        {#if aiWarningInfo.ainame.toLowerCase() !== 'smartai'}
          <div class="warning-row">
            <span class="warning-label">AIName:</span>
            <span class="warning-value warning-bad">{aiWarningInfo.ainame || '(empty)'}</span>
            <span class="warning-hint">→ should be "SmartAI" for SmartAI scripts to work</span>
          </div>
        {/if}
        {#if aiWarningInfo.scriptname !== ''}
          <div class="warning-row">
            <span class="warning-label">ScriptName:</span>
            <span class="warning-value warning-bad">{aiWarningInfo.scriptname}</span>
            <span class="warning-hint">→ C++ script assigned, may conflict with SmartAI</span>
          </div>
        {/if}
      </div>
      <p class="warning-footer">
        Smart scripts may not function correctly with this configuration.
        Update <code>creature_template</code> to fix.
      </p>
      <div class="modal-actions">
        <button class="btn-primary" onclick={() => showAiWarningModal = false}>
          OK
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .app-container {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .sidebar-wrapper {
    width: 240px;
    min-width: 240px;
    height: 100vh;
    overflow: hidden;
    transition: width 0.25s ease-in-out, min-width 0.25s ease-in-out;
  }

  .sidebar-wrapper.collapsed {
    width: 0;
    min-width: 0;
  }

  .main-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
    gap: 12px;
  }

  .top-bar-left {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    font-size: 16px;
    transition: var(--transition);
  }

  .sidebar-toggle:hover {
    border-color: var(--accent-blue);
    color: var(--accent-blue);
  }

  .top-bar-hint {
    font-size: 12px;
    color: var(--text-muted);
  }

  .status-indicator {
    font-size: 14px;
    margin-left: 6px;
    cursor: help;
  }

  .top-bar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tab-switcher {
    display: flex;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .tab-btn {
    background: transparent;
    color: var(--text-secondary);
    padding: 6px 14px;
    font-size: 12px;
    border: none;
    transition: var(--transition);
  }

  .tab-btn.active {
    background: rgba(88, 166, 255, 0.15);
    color: var(--accent-blue);
  }

  .tab-btn:hover:not(.active) {
    color: var(--text-primary);
  }

  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .status-bar {
    padding: 6px 16px;
    font-size: 12px;
    background: var(--bg-input);
    border-bottom: 1px solid var(--border-color);
    color: var(--text-secondary);
    animation: slideIn 0.2s ease-out;
  }

  .status-bar.success {
    color: var(--accent-green);
    border-color: rgba(63, 185, 80, 0.2);
  }

  .status-bar.error {
    color: var(--accent-red);
    border-color: rgba(248, 81, 73, 0.2);
  }

  .content-area {
    flex: 1;
    overflow: auto;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
  }

  .editor-panel {
    max-width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .welcome-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 100%;
    width: 100%;
    min-height: 400px;
    padding: 40px;
    position: relative;
    overflow: hidden;
  }

  .welcome-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
  }

  .welcome-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .aurora {
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    opacity: 0.12;
    mix-blend-mode: screen;
  }

  .aurora-1 {
    background: conic-gradient(from 0deg at 30% 40%, transparent 0%, rgba(88, 166, 255, 0.6) 15%, transparent 30%, transparent 50%, rgba(88, 166, 255, 0.4) 65%, transparent 80%);
    animation: auroraSpin1 25s linear infinite;
  }

  .aurora-2 {
    background: conic-gradient(from 90deg at 70% 60%, transparent 0%, rgba(188, 140, 255, 0.5) 20%, transparent 40%, transparent 60%, rgba(188, 140, 255, 0.3) 75%, transparent 90%);
    animation: auroraSpin2 30s linear infinite reverse;
  }

  .aurora-3 {
    background: conic-gradient(from 180deg at 50% 50%, transparent 0%, rgba(63, 185, 80, 0.4) 10%, transparent 25%, transparent 45%, rgba(232, 168, 56, 0.3) 60%, transparent 75%);
    animation: auroraSpin3 35s linear infinite;
  }

  @keyframes auroraSpin1 {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.15); }
    100% { transform: rotate(360deg) scale(1); }
  }

  @keyframes auroraSpin2 {
    0% { transform: rotate(0deg) scale(1.1); }
    50% { transform: rotate(-180deg) scale(0.9); }
    100% { transform: rotate(-360deg) scale(1.1); }
  }

  @keyframes auroraSpin3 {
    0% { transform: rotate(0deg) scale(0.95); }
    50% { transform: rotate(180deg) scale(1.2); }
    100% { transform: rotate(360deg) scale(0.95); }
  }

  .hex-grid {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .hex {
    position: absolute;
    width: 40px;
    height: 46px;
    background: rgba(88, 166, 255, 0.04);
    border: 1px solid rgba(88, 166, 255, 0.08);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    top: calc(var(--i) * 8.3%);
    left: calc(var(--i) * 8.7%);
    animation: hexFloat calc(8s + var(--i) * 0.8s) ease-in-out infinite;
    animation-delay: calc(var(--i) * -0.6s);
  }

  @keyframes hexFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
    50% { transform: translateY(-30px) rotate(60deg); opacity: 0.7; }
  }

  .welcome-icon {
    font-size: 36px;
    font-weight: 800;
    margin-bottom: 16px;
    color: var(--accent-purple);
    filter: drop-shadow(0 0 20px rgba(188, 140, 255, 0.4));
    animation: textPulse 3s ease-in-out infinite;
  }

  @keyframes textPulse {
    0%, 100% { text-shadow: 0 0 8px rgba(188, 140, 255, 0.3); }
    50% { text-shadow: 0 0 24px rgba(188, 140, 255, 0.6), 0 0 48px rgba(188, 140, 255, 0.3); }
  }

  .welcome-state h2 {
    font-size: 22px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .welcome-state p {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 20px;
  }

  .welcome-search {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    max-width: 480px;
    margin-bottom: 8px;
  }

  .welcome-search-mode {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 3px;
  }

  .welcome-search-mode .save-mode-btn {
    background: transparent;
    color: var(--text-muted);
    padding: 5px 8px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 4px;
    transition: var(--transition);
    border: none;
    cursor: pointer;
  }

  .welcome-search-mode .save-mode-btn.active {
    background: rgba(88, 166, 255, 0.15);
    color: var(--accent-blue);
  }

  .welcome-search-mode .save-mode-btn:hover:not(.active) {
    color: var(--text-primary);
  }

  .welcome-search > .welcome-search-input,
  .welcome-search > select,
  .welcome-search > button {
    width: 100%;
  }

  .welcome-search-input {
    flex: 1;
    min-width: 0;
  }

  .welcome-search select {
    min-width: 120px;
  }

  .welcome-search:has(input:disabled) {
    opacity: 0.5;
  }

  .welcome-hint {
    font-size: 12px;
    color: var(--accent-red);
    margin-bottom: 20px;
    opacity: 0.8;
  }

  .welcome-new-btn {
    padding: 12px 32px;
    background: linear-gradient(135deg, rgba(88, 166, 255, 0.25), rgba(188, 140, 255, 0.25));
    border: 1px solid rgba(88, 166, 255, 0.4);
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 700;
    border-radius: var(--radius-md);
    box-shadow: 0 0 12px rgba(88, 166, 255, 0.2);
    animation: pulseGlow 2.5s ease-in-out infinite;
    transition: var(--transition);
    margin-bottom: 24px;
  }

  .welcome-new-btn:hover {
    background: linear-gradient(135deg, rgba(88, 166, 255, 0.4), rgba(188, 140, 255, 0.4));
    border-color: var(--accent-blue);
    box-shadow: 0 0 20px rgba(88, 166, 255, 0.5);
    transform: translateY(-1px);
  }

  .recent-scripts {
    width: 100%;
    max-width: 520px;
    margin-bottom: 28px;
  }

  .recent-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
    font-weight: 600;
    margin-bottom: 8px;
    text-align: left;
  }

  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .recent-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    transition: var(--transition);
    cursor: pointer;
    text-align: left;
    overflow: hidden;
  }

  .recent-item:hover {
    border-color: rgba(88, 166, 255, 0.3);
    background: rgba(88, 166, 255, 0.05);
  }

  .recent-item-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .recent-item-wrapper .recent-item {
    flex: 1;
  }

  .recent-remove {
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-muted);
    font-size: 14px;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: var(--transition);
    flex-shrink: 0;
  }

  .recent-remove:hover {
    color: var(--accent-red);
    border-color: rgba(248, 81, 73, 0.3);
    background: rgba(248, 81, 73, 0.1);
  }

  .recent-entry {
    font-size: 14px;
    font-weight: 600;
    color: var(--accent-blue);
  }

  .recent-event-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--accent-green);
    padding: 1px 6px;
    border-radius: 4px;
    background: rgba(63, 185, 80, 0.12);
    border: 1px solid rgba(63, 185, 80, 0.2);
  }

  .recent-action-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--accent-orange, #e8a838);
    padding: 1px 6px;
    border-radius: 4px;
    background: rgba(232, 168, 56, 0.12);
    border: 1px solid rgba(232, 168, 56, 0.2);
  }

  .recent-type {
    font-size: 11px;
    font-weight: 500;
    color: var(--accent-purple);
    padding: 1px 6px;
    border-radius: 4px;
    background: rgba(188, 140, 255, 0.12);
    border: 1px solid rgba(188, 140, 255, 0.2);
  }

  .recent-status {
    font-size: 12px;
    margin-left: 4px;
  }

  .recent-filter {
    width: 100%;
    padding: 6px 10px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-size: 12px;
    margin-bottom: 8px;
    outline: none;
  }

  .recent-filter:focus {
    border-color: var(--accent-blue);
  }

  .recent-info {
    font-size: 11px;
    color: var(--text-muted);
    margin-left: auto;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .no-recent {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 28px;
  }

  .context-menu {
    position: fixed;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 4px;
    z-index: 1000;
    min-width: 120px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }

  .context-menu-item {
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 13px;
    text-align: left;
    border-radius: 4px;
    cursor: pointer;
    transition: var(--transition);
  }

  .context-menu-item:hover {
    background: rgba(88, 166, 255, 0.15);
    color: var(--accent-blue);
  }

  .context-menu-item.danger:hover {
    background: rgba(248, 81, 73, 0.15);
    color: var(--accent-red);
  }

  .scripts-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .name-search-pager {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: rgba(88, 166, 255, 0.06);
    border: 1px solid rgba(88, 166, 255, 0.2);
    border-radius: var(--radius-sm);
    margin-bottom: 4px;
  }

  .pager-btn {
    background: rgba(88, 166, 255, 0.1);
    border: 1px solid rgba(88, 166, 255, 0.25);
    color: var(--accent-blue);
    width: 28px;
    height: 28px;
    border-radius: 4px;
    font-size: 18px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition);
    flex-shrink: 0;
  }

  .pager-btn:hover:not(:disabled) {
    background: rgba(88, 166, 255, 0.2);
    border-color: var(--accent-blue);
  }

  .pager-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .pager-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
  }

  .pager-entry {
    font-weight: 700;
    color: var(--accent-blue);
    font-size: 13px;
    flex-shrink: 0;
  }

  .pager-name {
    color: var(--text-secondary);
    font-size: 12px;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pager-count {
    font-size: 11px;
    color: var(--text-muted);
    flex-shrink: 0;
    margin-left: auto;
  }

  .add-script-btn {
    width: 100%;
    padding: 10px;
    margin-top: 6px;
    background: transparent;
    border: 1px dashed var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-muted);
    font-size: 14px;
    font-weight: 600;
    transition: var(--transition);
  }

  .add-script-btn:hover {
    border-color: var(--accent-blue);
    color: var(--accent-blue);
    background: rgba(88, 166, 255, 0.05);
  }

  .source-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    margin-bottom: 6px;
    border-left: 3px solid var(--accent-green);
  }

  .source-field {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .source-field input,
  .source-field select {
    padding: 4px 8px;
    font-size: 13px;
    min-width: 140px;
  }

  .source-info {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .batch-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
  }

  .batch-btn {
    padding: 4px 10px;
    background: rgba(88, 166, 255, 0.1);
    border: 1px solid rgba(88, 166, 255, 0.2);
    color: var(--text-secondary);
    font-size: 12px;
    border-radius: 4px;
    transition: var(--transition);
  }

  .batch-btn:hover {
    background: rgba(88, 166, 255, 0.2);
    color: var(--accent-blue);
    border-color: var(--accent-blue);
  }

  .batch-btn.danger:hover {
    background: rgba(248, 81, 73, 0.15);
    color: var(--accent-red);
    border-color: var(--accent-red);
  }

  .btn-cancel {
    padding: 6px 14px;
    background: transparent;
    border: 1px solid rgba(232, 168, 56, 0.3);
    border-radius: var(--radius-sm);
    color: #e8a838;
    font-size: 12px;
    font-weight: 600;
    transition: var(--transition);
    cursor: pointer;
  }

  .btn-cancel:hover:not(:disabled) {
    border-color: #e8a838;
    background: rgba(232, 168, 56, 0.1);
  }

  .btn-cancel:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-sync {
    background: linear-gradient(135deg, rgba(63, 185, 80, 0.2), rgba(88, 166, 255, 0.2));
    border: 1px solid rgba(63, 185, 80, 0.3);
    color: var(--accent-green);
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    transition: var(--transition);
  }

  .btn-sync:hover {
    background: linear-gradient(135deg, rgba(63, 185, 80, 0.3), rgba(88, 166, 255, 0.3));
    border-color: var(--accent-green);
    box-shadow: 0 0 12px rgba(63, 185, 80, 0.3);
  }

  .btn-import {
    background: linear-gradient(135deg, rgba(63, 185, 80, 0.15), rgba(63, 185, 80, 0.05));
    border: 1px solid rgba(63, 185, 80, 0.3);
    color: var(--accent-green);
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .btn-import:hover {
    background: linear-gradient(135deg, rgba(63, 185, 80, 0.3), rgba(63, 185, 80, 0.15));
    border-color: var(--accent-green);
    box-shadow: 0 0 12px rgba(63, 185, 80, 0.3);
    color: var(--text-primary);
  }

  .btn-export {
    background: linear-gradient(135deg, rgba(88, 166, 255, 0.15), rgba(88, 166, 255, 0.05));
    border: 1px solid rgba(88, 166, 255, 0.3);
    color: var(--accent-blue);
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .btn-export:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(88, 166, 255, 0.3), rgba(88, 166, 255, 0.15));
    border-color: var(--accent-blue);
    box-shadow: 0 0 12px rgba(88, 166, 255, 0.3);
    color: var(--text-primary);
  }

  .sql-tab {
    height: 100%;
  }

  .new-script-modal {
    max-width: 360px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .new-script-modal h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .modal-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .modal-field input {
    padding: 6px 10px;
    font-size: 13px;
  }

  .source-type-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .source-type-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 6px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    transition: var(--transition);
    cursor: pointer;
  }

  .source-type-icon:hover {
    border-color: rgba(88, 166, 255, 0.3);
    background: rgba(88, 166, 255, 0.05);
  }

  .source-type-icon.selected {
    border-color: var(--accent-blue);
    background: rgba(88, 166, 255, 0.12);
    box-shadow: 0 0 8px rgba(88, 166, 255, 0.15);
  }

  .source-type-emoji {
    font-size: 24px;
    line-height: 1;
  }

  .source-type-label {
    font-size: 11px;
    color: var(--text-secondary);
    text-align: center;
  }

  .source-type-icon.selected .source-type-label {
    color: var(--accent-blue);
    font-weight: 600;
  }

  .modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 8px;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--overlay-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fadeIn 0.2s ease-out;
  }

  .clear-modal {
    max-width: 420px;
    padding: 24px;
    text-align: center;
  }

  .clear-modal h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .clear-modal p {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .clear-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .ai-warning-modal {
    max-width: 460px;
    padding: 24px;
  }

  .ai-warning-modal h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--accent-orange);
    margin-bottom: 12px;
  }

  .warning-creature {
    font-size: 14px;
    color: var(--text-primary);
    margin-bottom: 14px;
  }

  .warning-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 14px;
  }

  .warning-row {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 13px;
  }

  .warning-label {
    color: var(--text-muted);
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.3px;
    min-width: 80px;
  }

  .warning-value {
    font-family: var(--font-mono);
    font-weight: 600;
  }

  .warning-bad {
    color: var(--accent-red);
  }

  .warning-hint {
    color: var(--text-muted);
    font-size: 12px;
    width: 100%;
    margin-left: 86px;
  }

  .warning-footer {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .warning-footer code {
    font-family: var(--font-mono);
    background: var(--bg-input);
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 11px;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
