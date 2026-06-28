<script lang="ts">
  import type { SmartScriptRow, ConditionRow } from '../lib/api';
  import { SMART_EVENTS, SMART_EVENT_FLAGS } from '../lib/types';
  import { getEventParams, getEventParamString, getEventLabel, getActionLabel, type EventGroup as EventGroupData } from '../lib/paramMeta';
  import { getEventTooltip, getEventFlagTooltip } from '../lib/tooltips';
  import { t, type TranslationKey, type Lang } from '../lib/i18n';
  import ActionCard from './ActionCard.svelte';
  import ConditionCard from './ConditionCard.svelte';
  import SearchableSelect from './SearchableSelect.svelte';

  let {
    group,
    scripts,
    onAddAction,
    onDeleteAction,
    onDuplicateAction,
    onActionSave,
    onAddCondition,
    onDeleteCondition,
    onConditionSave,
    onSaveEvent,
    conditions = [] as ConditionRow[],
    onDeleteEvent,
    lang = 'en' as Lang,
    saveMode = 'manual' as 'manual' | 'auto',
    uiStyle = 'compact' as 'classic' | 'compact',
    connected = false,
    expanded = true,
    selectedEventIds = new Set<string>(),
    onToggleSelect,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
  } = $props();

  let showFlagsPopup = $state(false);
  let internalExpanded = $state(false);
  let showConditionsPanel = $state(false);
  let showAdvanced = $state(false);
  let isDragging = $state(false);
  let isDragOver = $state(false);

  $effect(() => { internalExpanded = expanded; });

  function toggleExpanded() {
    internalExpanded = !internalExpanded;
  }

  let eventParams = $derived(getEventParams(group.eventType));
  let eventHasString = $derived(getEventParamString(group.eventType));
  let eventTooltip = $derived(getEventTooltip(group.eventType) ?? '');

  let firstRow = $derived(scripts[group.rows[0]]);
  let eventConditions = $derived(conditions.filter(c =>
    c.SourceGroup === (firstRow?.id ?? -999) + 1 &&
    c.SourceId === firstRow?.source_type &&
    c.SourceEntry === firstRow?.entryorguid
  ));

  let isSelected = $derived(selectedEventIds.has(group.eventId));

  function tr(key: TranslationKey): string {
    return t(lang, key);
  }

  function getEventParamValue(idx: number): number {
    const r = firstRow;
    switch (idx) {
      case 1: return r.event_param1;
      case 2: return r.event_param2;
      case 3: return r.event_param3;
      case 4: return r.event_param4;
      case 5: return r.event_param5;
      default: return 0;
    }
  }

  function setEventParamValue(idx: number, val: number) {
    group.rows.forEach((rowIdx: number) => {
      const r = scripts[rowIdx];
      switch (idx) {
        case 1: r.event_param1 = val; break;
        case 2: r.event_param2 = val; break;
        case 3: r.event_param3 = val; break;
        case 4: r.event_param4 = val; break;
        case 5: r.event_param5 = val; break;
      }
    });
  }

  function setEventType(val: number) {
    group.rows.forEach((rowIdx: number) => {
      scripts[rowIdx].event_type = val;
    });
    group.eventType = val;
  }

  function setEventPhase(val: number) {
    group.rows.forEach((rowIdx: number) => {
      scripts[rowIdx].event_phase_mask = val;
    });
    group.eventPhaseMask = val;
  }

  function setEventChance(val: number) {
    group.rows.forEach((rowIdx: number) => {
      scripts[rowIdx].event_chance = val;
    });
    group.eventChance = val;
  }

  function setEventFlags(val: number) {
    group.rows.forEach((rowIdx: number) => {
      scripts[rowIdx].event_flags = val;
    });
    group.eventFlags = val;
  }

  function setEventParamString(val: string) {
    group.rows.forEach((rowIdx: number) => {
      scripts[rowIdx].event_param_string = val;
    });
    group.eventParamString = val;
  }

  function toggleFlag(flag: number) {
    const newFlags = group.eventFlags ^ flag;
    setEventFlags(newFlags);
  }

  function hasFlag(flag: number): boolean {
    return (group.eventFlags & flag) !== 0;
  }
</script>

<div 
  class="event-group glass-event fade-in" 
  class:expanded={internalExpanded} 
  class:selected={isSelected}
  class:dragging={isDragging}
  class:drag-over={isDragOver}
  role="group"
  draggable={true}
  ondragstart={(e) => { isDragging = true; onDragStart?.(e, group.eventId); }}
  ondragover={(e) => { e.preventDefault(); isDragOver = true; onDragOver?.(e, group.eventId); }}
  ondragleave={() => { isDragOver = false; }}
  ondrop={(e) => { isDragOver = false; onDrop?.(e, group.eventId); }}
  ondragend={() => { isDragging = false; onDragEnd?.(); }}
>
  <div class="group-header" role="button" tabindex="0" onclick={toggleExpanded} onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleExpanded()}>
    <input type="checkbox" class="event-checkbox" checked={isSelected} onclick={(e) => { e.stopPropagation(); onToggleSelect?.(group.eventId); }} />
    <span class="expand-icon" class:rotated={internalExpanded}>v</span>
    <span class="badge badge-blue" title={eventTooltip}>{getEventLabel(group.eventType)}</span>
    {#each group.rows as ri (ri)}
      <span class="badge badge-purple">{getActionLabel(scripts[ri].action_type)}</span>
    {/each}
    <span class="group-info">
      {group.rows.length} {tr('actions').toLowerCase()}
    </span>
    <span class="badge badge-green" title={tr('chance')}>{group.eventChance}%</span>
    {#if group.eventPhaseMask > 0}
      <span class="badge badge-orange" title={tr('phaseMask')}>P:{group.eventPhaseMask}</span>
    {/if}
    <span class="group-actions">
      {#if eventConditions.length > 0}
        <button class="badge badge-cyan cond-badge" title={tr('conditions')} onclick={(e) => { e.stopPropagation(); showConditionsPanel = !showConditionsPanel; }}>COND ({eventConditions.length})</button>
      {:else if uiStyle === 'compact'}
        <button class="badge badge-cyan cond-badge cond-empty" title={tr('addCondition')} onclick={(e) => { e.stopPropagation(); showConditionsPanel = !showConditionsPanel; }}>+ COND</button>
      {/if}
      <button class="icon-btn" title={tr('addAction')} onclick={(e) => { e.stopPropagation(); onAddAction?.(group); }}>+</button>
      <button class="icon-btn danger delete-btn" title={tr('delete')} onclick={(e) => { e.stopPropagation(); onDeleteEvent?.(group); }}>×</button>
    </span>
  </div>

  {#if internalExpanded}
    <div class="group-body slide-in">

      {#if uiStyle === 'classic'}
        <!-- ═══════════════ CLASSIC VIEW ═══════════════ -->
        <div class="event-section">
          <div class="event-type-row">
            <SearchableSelect
              value={group.eventType}
              options={SMART_EVENTS.map(ev => ({ value: ev.value, label: ev.label, title: getEventTooltip(ev.value) ?? '' }))}
              title={eventTooltip}
              onselect={(val) => setEventType(val)}
            />
          </div>
          {#if eventTooltip}
            <p class="type-tooltip">{eventTooltip}</p>
          {/if}
          <div class="params-grid">
            {#each eventParams as p}
              <label>
                <span class="param-label">{p.label}</span>
                <input type="number" value={getEventParamValue(p.index)} onchange={(e) => setEventParamValue(p.index, parseInt(e.currentTarget.value) || 0)} />
              </label>
            {/each}
            <label>
              <span class="param-label">{tr('phaseMask')}</span>
              <input type="number" min="0" max="12" value={group.eventPhaseMask} onchange={(e) => setEventPhase(parseInt(e.currentTarget.value) || 0)} />
            </label>
            <label>
              <span class="param-label">{tr('chance')}%</span>
              <input type="number" min="0" max="100" value={group.eventChance} onchange={(e) => setEventChance(parseInt(e.currentTarget.value) || 0)} />
            </label>
          </div>
          {#if eventHasString}
            <label class="full-width">
              <span class="param-label">{tr('paramString')}</span>
              <input type="text" value={group.eventParamString} onchange={(e) => setEventParamString(e.currentTarget.value)} />
            </label>
          {/if}
          <div class="flags-row">
            <button class="flags-toggle" class:active={group.eventFlags > 0} onclick={() => showFlagsPopup = !showFlagsPopup}>
              {tr('flags')}{#if group.eventFlags > 0} ({group.eventFlags}){/if}
            </button>
            {#if showFlagsPopup}
              <div class="flags-popup">
                {#each SMART_EVENT_FLAGS as f}
                  <button class="flag-tag" class:active={hasFlag(f.value)} onclick={() => toggleFlag(f.value)} title={getEventFlagTooltip(f.value) ?? f.comment}>{f.label}</button>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        {#if eventConditions.length > 0}
          <div class="conditions-section">
            <div class="actions-divider"><span>{tr('conditions')} ({eventConditions.length})</span></div>
            {#each conditions as cond, cIdx (cIdx)}
              {#if cond.SourceGroup === (firstRow?.id ?? -999) + 1 && cond.SourceId === firstRow?.source_type && cond.SourceEntry === firstRow?.entryorguid}
                <ConditionCard bind:cond={conditions[cIdx]} onDelete={() => onDeleteCondition?.(cond)} onSave={() => onConditionSave?.(cond)} {lang} {saveMode} {connected} />
              {/if}
            {/each}
            <button class="add-action-btn" onclick={() => onAddCondition?.(firstRow)}>+ {tr('addCondition')}</button>
          </div>
        {:else}
          <div class="conditions-section">
            <button class="add-action-btn" onclick={() => onAddCondition?.(firstRow)}>+ {tr('addCondition')}</button>
          </div>
        {/if}

      {:else}
        <!-- ═══════════════ COMPACT VIEW ═══════════════ -->
        <div class="compact-event-section">
          <!-- Row 1: event type + all params + advanced toggle in one flow -->
          <div class="compact-inline-row">
            <SearchableSelect
              value={group.eventType}
              options={SMART_EVENTS.map(ev => ({ value: ev.value, label: ev.label, title: getEventTooltip(ev.value) ?? '' }))}
              title={eventTooltip}
              onselect={(val) => setEventType(val)}
            />
            {#if eventTooltip}
              <span class="info-icon" title={eventTooltip}>ⓘ</span>
            {/if}

            {#if eventParams.length > 0}
              <span class="inline-sep"></span>
              {#each eventParams as p, i}
                <span class="param-pill">
                  <span class="pill-label">{p.label}</span>
                  <input class="pill-input" type="number" value={getEventParamValue(p.index)} onchange={(e) => setEventParamValue(p.index, parseInt(e.currentTarget.value) || 0)} />
                </span>
                {#if i < eventParams.length - 1}<span class="pill-sep">·</span>{/if}
              {/each}
            {/if}

            {#if eventHasString}
              <span class="inline-sep"></span>
              <span class="param-pill">
                <span class="pill-label">{tr('paramString')}</span>
                <input class="pill-input pill-text" type="text" value={group.eventParamString} onchange={(e) => setEventParamString(e.currentTarget.value)} />
              </span>
            {/if}

            <button class="advanced-toggle" onclick={() => showAdvanced = !showAdvanced}>
              {tr('advanced')} {showAdvanced ? '▲' : '▼'}
            </button>
          </div>

          <!-- Advanced panel (hidden by default) -->
          {#if showAdvanced}
            <div class="advanced-panel">
              <span class="param-pill">
                <span class="pill-label">{tr('chance')}%</span>
                <input class="pill-input" type="number" min="0" max="100" value={group.eventChance} onchange={(e) => setEventChance(parseInt(e.currentTarget.value) || 0)} />
              </span>
              <span class="pill-sep">·</span>
              <span class="param-pill">
                <span class="pill-label">{tr('phaseMask')}</span>
                <input class="pill-input" type="number" min="0" max="12" value={group.eventPhaseMask} onchange={(e) => setEventPhase(parseInt(e.currentTarget.value) || 0)} />
              </span>
              <span class="pill-sep">·</span>
              <button class="flags-toggle" class:active={group.eventFlags > 0} onclick={() => showFlagsPopup = !showFlagsPopup}>
                {tr('flags')}{#if group.eventFlags > 0} ({group.eventFlags}){/if}
              </button>
              {#if showFlagsPopup}
                <div class="flags-popup">
                  {#each SMART_EVENT_FLAGS as f}
                    <button class="flag-tag" class:active={hasFlag(f.value)} onclick={() => toggleFlag(f.value)} title={getEventFlagTooltip(f.value) ?? f.comment}>{f.label}</button>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        </div>

        {#if showConditionsPanel || eventConditions.length > 0}
          <div class="conditions-section">
            <div class="actions-divider"><span>{tr('conditions')} ({eventConditions.length})</span></div>
            {#each conditions as cond, cIdx (cIdx)}
              {#if cond.SourceGroup === (firstRow?.id ?? -999) + 1 && cond.SourceId === firstRow?.source_type && cond.SourceEntry === firstRow?.entryorguid}
                <ConditionCard bind:cond={conditions[cIdx]} onDelete={() => onDeleteCondition?.(cond)} onSave={() => onConditionSave?.(cond)} {lang} {saveMode} {connected} />
              {/if}
            {/each}
            <button class="add-action-btn" onclick={() => onAddCondition?.(firstRow)}>+ {tr('addCondition')}</button>
          </div>
        {/if}
      {/if}

      <div class="actions-section">
        <div class="actions-divider">
          <span>{tr('actions')} ({group.rows.length})</span>
        </div>
        {#each group.rows as rowIdx (rowIdx)}
          <ActionCard
            bind:row={scripts[rowIdx]}
            onDelete={() => onDeleteAction?.(group, rowIdx)}
            onDuplicate={() => onDuplicateAction?.(group, rowIdx)}
            onSave={() => onActionSave?.(scripts[rowIdx])}
            {lang}
            {saveMode}
            {uiStyle}
            {connected}
          />
        {/each}
        <button class="add-action-btn" onclick={() => onAddAction?.(group)}>
          + {tr('addAction')}
        </button>
      </div>

      {#if saveMode === 'manual'}
        <button class="save-button" onclick={() => onSaveEvent?.(group)}>💾 {tr('save')}</button>
      {/if}
      {#if saveMode === 'auto'}
        <div class="auto-save-indicator">✓ Auto-saved</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .event-group {
    margin-bottom: 8px;
    overflow: hidden;
    transition: var(--transition);
    border-left: 3px solid rgba(88, 166, 255, 0.25);
  }

  .event-group.selected {
    border-left-color: var(--accent-purple);
    background: rgba(188, 140, 255, 0.05);
  }

  .event-group:hover {
    border-left-color: rgba(88, 166, 255, 0.45);
  }

  .event-group.selected:hover {
    border-left-color: var(--accent-purple);
  }

  .event-group.dragging {
    opacity: 0.5;
  }

  .event-group.drag-over {
    border-left-color: var(--accent-green);
    background: rgba(63, 185, 80, 0.05);
  }

  .event-checkbox {
    width: 14px;
    height: 14px;
    cursor: pointer;
    margin-right: 6px;
    accent-color: var(--accent-purple);
  }

  .group-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    cursor: pointer;
    transition: var(--transition);
  }

  .group-header:hover {
    background: rgba(88, 166, 255, 0.05);
  }

  .group-info {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .group-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .icon-btn {
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-secondary);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    transition: var(--transition);
  }

  .icon-btn:hover {
    background: var(--bg-hover);
    color: var(--accent-blue);
  }

  .icon-btn.danger:hover {
    color: var(--accent-red);
    background: rgba(248, 81, 73, 0.1);
  }

  .save-button {
    width: 100%;
    margin-top: 8px;
    padding: 8px 12px;
    background: linear-gradient(135deg, rgba(88, 166, 255, 0.2), rgba(88, 166, 255, 0.1));
    border: 1px solid rgba(88, 166, 255, 0.4);
    border-radius: var(--radius-sm);
    color: var(--accent-blue);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .save-button:hover {
    background: linear-gradient(135deg, rgba(88, 166, 255, 0.3), rgba(88, 166, 255, 0.2));
    border-color: rgba(88, 166, 255, 0.6);
    color: var(--text-primary);
  }

  .auto-save-indicator {
    font-size: 10px;
    color: var(--accent-green);
    text-align: right;
    padding: 2px 8px;
    opacity: 0.7;
  }

  .conditions-section {
    margin-bottom: 8px;
  }

  .compact-event-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-bottom: 4px;
  }

  .compact-inline-row {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
    padding: 2px 0;
  }

  .inline-sep {
    width: 1px;
    height: 14px;
    background: rgba(255,255,255,0.1);
    flex-shrink: 0;
    margin: 0 2px;
  }

  .param-pill {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: rgba(88, 166, 255, 0.06);
    border: 1px solid rgba(88, 166, 255, 0.15);
    border-radius: 4px;
    padding: 1px 5px;
  }

  .pill-label {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    white-space: nowrap;
  }

  .pill-input {
    width: 54px;
    padding: 1px 4px;
    font-size: 13px;
    font-weight: 600;
    background: transparent;
    border: none;
    color: var(--text-primary);
    outline: none;
  }

  .pill-input.pill-text {
    width: 120px;
  }

  .pill-sep {
    color: var(--text-muted);
    font-size: 11px;
    opacity: 0.5;
  }

  .advanced-toggle {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 10px;
    cursor: pointer;
    padding: 0;
    text-align: left;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    opacity: 0.6;
    transition: opacity 0.15s;
  }

  .advanced-toggle:hover { opacity: 1; }

  .advanced-panel {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    padding: 4px 0;
  }

  .info-icon {
    font-size: 13px;
    color: var(--accent-blue);
    cursor: help;
    opacity: 0.7;
    flex-shrink: 0;
  }

  .info-icon:hover { opacity: 1; }

  .cond-badge {
    background: none;
    border: 1px solid rgba(88, 200, 255, 0.35);
    cursor: pointer;
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 10px;
    transition: var(--transition);
  }

  .cond-badge:hover {
    background: rgba(88, 200, 255, 0.15);
  }

  .cond-empty {
    opacity: 0.45;
    border-style: dashed;
  }

  .cond-empty:hover { opacity: 0.8; }

  .delete-btn {
    padding: 1px 5px;
    font-size: 14px;
    line-height: 1;
    color: var(--text-muted);
  }

  .expand-icon {
    font-size: 10px;
    color: var(--text-muted);
    transition: transform 0.2s ease;
  }

  .expand-icon.rotated {
    transform: rotate(180deg);
  }

  .group-body {
    padding: 6px 10px;
    border-top: 1px solid rgba(88, 166, 255, 0.08);
  }

  .event-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-bottom: 6px;
  }

  .event-type-row {
    display: flex;
    gap: 6px;
  }

  .type-tooltip {
    font-size: 12px;
    color: var(--text-secondary);
    margin: 2px 0 2px;
    padding: 4px 8px;
    background: rgba(88, 166, 255, 0.05);
    border-left: 2px solid rgba(88, 166, 255, 0.25);
    border-radius: 3px;
    line-height: 1.4;
  }

  .params-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 3px;
  }

  .params-grid label {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .full-width {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .param-label {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .flags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 2px;
    align-items: center;
    position: relative;
  }

  .flags-toggle {
    background: rgba(10, 14, 20, 0.6);
    border: 1px solid var(--border-color);
    color: var(--text-muted);
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    transition: var(--transition);
  }

  .flags-toggle.active {
    background: rgba(88, 166, 255, 0.12);
    border-color: rgba(88, 166, 255, 0.25);
    color: var(--accent-blue);
  }

  .flags-toggle:hover {
    border-color: var(--accent-blue);
  }

  .flags-popup {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 50;
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    padding: 6px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-pop);
    max-width: 320px;
  }

  .flag-tag {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-muted);
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 11px;
    transition: var(--transition);
  }

  .flag-tag.active {
    background: rgba(88, 166, 255, 0.12);
    border-color: rgba(88, 166, 255, 0.25);
    color: var(--accent-blue);
  }

  .flag-tag:hover {
    border-color: var(--accent-blue);
  }

  .actions-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .actions-divider {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 4px 0 2px;
    font-size: 10px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .actions-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-color);
  }

  .add-action-btn {
    margin-top: 2px;
    padding: 6px;
    background: transparent;
    border: 1px dashed var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    font-size: 13px;
    transition: var(--transition);
  }

  .add-action-btn:hover {
    border-color: var(--accent-blue);
    color: var(--accent-blue);
    background: rgba(88, 166, 255, 0.05);
  }

  input {
    padding: 4px 8px;
    font-size: 13px;
  }
</style>
