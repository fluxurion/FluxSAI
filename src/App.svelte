<script lang="ts">
  import Sidebar from './components/Sidebar.svelte';
  import EventGroup from './components/EventGroup.svelte';
  import SqlPreview from './components/SqlPreview.svelte';
  import DbModal from './components/DbModal.svelte';
  import type { SmartScriptRow, ConditionRow, DbConfig } from './lib/api';
  import * as api from './lib/api';
  import { createEmptyScriptRow, createEmptyConditionRow, generateInsertSQL, SMART_SCRIPT_TYPES } from './lib/types';
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

  function saveCachedScript(entry: number, sourceType: number, count: number, rows?: SmartScriptRow[], conditions?: ConditionRow[]) {
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
    
    cached.unshift({ entryorguid: entry, source_type: sourceType, rowCount: count, eventCount, actionCount, conditionCount, firstEventLabel, firstActionLabel, timestamp: Date.now() });
    cached = cached.slice(0, MAX_CACHED);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    }
    cachedScripts = cached;
    if (rows) saveCachedRows(entry, sourceType, rows);
  }

  function openCachedScript(entry: number, sourceType: number) {
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
  let newScriptEntry = $state('');
  let newScriptType = $state(0);
  let welcomeSearchEntry = $state('');
  let expandedGroups = $state<Set<string>>(new Set());
  let welcomeSearchType = $state(0);
  let currentEntry = $state(0);
  let currentSourceType = $state(0);
  let lang = $state<Lang>(getStoredLang());
  let statusMessage = $state('');
  let statusType = $state<'info' | 'success' | 'error'>('info');

  let eventGroups = $derived(groupByEvent(scripts));

  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    if (saveMode !== 'auto' || !currentEntry) return;
    const _track = scripts.length + '|' + conditions.length + '|' + scripts.map(s => s.action_param1 + s.action_param2 + s.action_param3 + s.action_param4 + s.action_param5 + s.action_param6 + s.event_param1 + s.event_param2 + s.event_param3 + s.event_param4 + s.target_param1 + s.target_param2 + s.target_param3).join('');
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(async () => {
      try {
        if (!connected && scripts.length > 0) {
          await api.saveEntryToFile(scripts, conditions);
          saveCachedScript(currentEntry, currentSourceType, scripts.length, scripts, conditions);
        }
      } catch {}
    }, 1200);
    return () => { if (autoSaveTimer) clearTimeout(autoSaveTimer); };
  });

  function tr(key: TranslationKey): string {
    return t(lang, key);
  }

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
        showStatus(`${tr('loaded')} ${cached.length} ${tr('scriptsForEntry')} ${entry} (cached)`, 'success');
        return;
      }
      showStatus(tr('notConnected'), 'error');
      return;
    }
    try {
      const rows = await api.fetchScriptByEntry(entry, sourceType);
      scripts = rows;
      try {
        conditions = await api.fetchAllConditionsForEntry(entry);
      } catch {
        conditions = [];
      }
      saveCachedScript(entry, sourceType, rows.length, rows, conditions);
      showStatus(`${tr('loaded')} ${rows.length} ${tr('scriptsForEntry')} ${entry}`, 'success');
    } catch (e: any) {
      showStatus(String(e), 'error');
    }
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
    currentEntry = entry;
    currentSourceType = sourceType;
    const row = createEmptyScriptRow(entry, sourceType);
    row.id = nextId();
    const evId = nextEventId();
    row.eventId = evId;
    row.comment = generateScriptComment(row);
    scripts = [...scripts, row];
    expandedGroups = new Set([`ev-${evId}`]);
    saveCachedScript(entry, sourceType, scripts.length, scripts);
    sidebarCollapsed = true;
    showStatus(tr('newEventAdded'), 'success');
  }

  function handleAddAction(group: EventGroupData) {
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

  async function handleDeleteAction(group: EventGroupData, rowIdx: number) {
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

  function handleDuplicateAction(group: EventGroupData, rowIdx: number) {
    const orig = scripts[rowIdx];
    const copy = { ...orig, id: nextId() };
    scripts = [...scripts.slice(0, rowIdx + 1), copy, ...scripts.slice(rowIdx + 1)];
    showStatus(tr('actionDuplicated'), 'success');
  }

  function handleAddCondition(row: SmartScriptRow) {
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
    conditions = conditions.filter(c => c !== cond);
  }

  async function handleConditionSave(cond: ConditionRow) {
    try {
      if (connected) {
        await api.insertCondition(cond);
        showStatus('Condition saved to DB', 'success');
      } else {
        const msg = await api.saveEntryToFile(scripts, conditions);
        showStatus(msg, 'success');
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
        const msg = await api.saveEntryToFile(scripts, conditions);
        showStatus(msg, 'success');
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
        const msg = await api.saveEntryToFile(scripts, conditions);
        showStatus(msg, 'success');
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

  async function handleExport() {
    if (scripts.length === 0) {
      showStatus(tr('noScriptsExport'), 'error');
      return;
    }
    try {
      const sql = await api.exportScriptsSql(scripts, conditions);
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const defaultName = `world_${now.getFullYear()}_${pad(now.getMonth() + 1)}_${pad(now.getDate())}_${pad(now.getHours())}_${currentSourceType}_${currentEntry}.sql`;
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

  function handleClearRequest() {
    if (scripts.length === 0) {
      scripts = [];
      currentEntry = 0;
      currentSourceType = 0;
      sidebarCollapsed = false;
      return;
    }
    showClearModal = true;
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
    const entry = parseInt(welcomeSearchEntry);
    if (!isNaN(entry)) {
      handleSearch(entry, welcomeSearchType);
    }
  }

  function handleAddRow() {
    handleNew();
  }

  function handleAddActionToLastGroup() {
    const groups = groupByEvent(scripts);
    if (groups.length === 0) {
      handleNew();
      return;
    }
    handleAddAction(groups[groups.length - 1]);
  }

  function handleAddLinkedScript() {
    const row = createEmptyScriptRow(currentEntry, currentSourceType);
    row.id = nextId();
    row.link = 0;
    row.comment = generateScriptComment(row);
    scripts = [...scripts, row];
    saveCachedScript(currentEntry, currentSourceType, scripts.length);
    showStatus(tr('linkedScriptAdded'), 'success');
  }
</script>

<div class="app-container" class:sidebar-collapsed={sidebarCollapsed && scripts.length > 0}>
  <div class="sidebar-wrapper" class:collapsed={sidebarCollapsed && scripts.length > 0}>
    <Sidebar
      connected={connected}
      onConnectClick={() => showDbModal = true}
      onSearch={handleSearch}
      onNew={handleAddRow}
      {lang}
      onLangChange={handleLangChange}
      bind:saveMode
      bind:uiStyle
    />
  </div>

  <div class="main-area">
    <div class="top-bar glass">
      <div class="top-bar-left">
        {#if scripts.length > 0}
          <button class="sidebar-toggle" onclick={() => sidebarCollapsed = !sidebarCollapsed} title="Toggle sidebar">
            {sidebarCollapsed ? '\u2630' : '\u2715'}
          </button>
        {/if}
        {#if currentEntry !== 0}
          <span class="badge badge-blue">{currentEntry}</span>
          <span class="badge badge-purple">{SMART_SCRIPT_TYPES.find(st => st.value === currentSourceType)?.label ?? currentSourceType}</span>
          <span class="badge badge-green">{eventGroups.length} {tr('events')}</span>
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
        <button class="btn-primary" onclick={handleSaveAll} disabled={!connected || scripts.length === 0}>
          {tr('saveToDb')}
        </button>
        <button class="btn-ghost" onclick={handleExport} disabled={scripts.length === 0}>
          {tr('export')}
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
                  <div class="recent-list">
                    {#each cachedScripts as cs}
                      <div class="recent-item-wrapper">
                        <button class="recent-item" onclick={() => openCachedScript(cs.entryorguid, cs.source_type)}>
                          <span class="recent-entry">{cs.entryorguid}</span>
                          <span class="recent-type">{SMART_SCRIPT_TYPES.find(st => st.value === cs.source_type)?.label ?? cs.source_type}</span>
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
              {:else}
                <p class="no-recent">{tr('noRecentScripts')}</p>
              {/if}
            </div>
          </div>
          {:else}
            <div class="scripts-list">
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
                </div>
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
                  onSaveEvent={handleEventSave}
                  {conditions}
                  onDeleteEvent={handleDeleteEvent}
                  {lang}
                  {saveMode}
                  {uiStyle}
                  {connected}
                  expanded={expandedGroups.size === 0 || expandedGroups.has(`ev-${scripts[group.rows[0]]?.eventId ?? group.key}`)}
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
    background: rgba(10, 14, 20, 0.6);
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

  .top-bar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tab-switcher {
    display: flex;
    background: rgba(10, 14, 20, 0.6);
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
    background: rgba(10, 14, 20, 0.8);
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
    gap: 6px;
    width: 100%;
    max-width: 480px;
    margin-bottom: 8px;
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

  .scripts-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
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
    background: rgba(10, 14, 20, 0.4);
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
    background: rgba(0, 0, 0, 0.6);
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
</style>
