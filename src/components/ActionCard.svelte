<script lang="ts">
  import type { SmartScriptRow } from '../lib/api';
  import { SMART_ACTIONS, SMART_TARGETS } from '../lib/types';
  import { getActionParams, getTargetParams, getTargetHasCoords, getActionLabel, getTargetLabel, generateScriptComment } from '../lib/paramMeta';
  import { getActionTooltip, getTargetTooltip } from '../lib/tooltips';
  import { t, type TranslationKey } from '../lib/i18n';
  import SearchableSelect from './SearchableSelect.svelte';

  let {
    row = $bindable(),
    onDelete,
    onDuplicate,
    onSave,
    lang = 'en',
    saveMode = 'manual' as 'manual' | 'auto',
    uiStyle = 'compact' as 'classic' | 'compact',
    connected = false,
  } = $props();

  let actionParams = $derived(getActionParams(row.action_type));
  let targetParams = $derived(getTargetParams(row.target_type));
  let targetHasCoords = $derived(getTargetHasCoords(row.target_type));
  let actionTooltip = $derived(getActionTooltip(row.action_type) ?? '');
  let targetTooltip = $derived(getTargetTooltip(row.target_type) ?? '');

  function tr(key: TranslationKey): string {
    return t(lang, key);
  }

  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    if (saveMode === 'auto' && connected) {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        onSave?.();
      }, 500);
    }
    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  });

  function getActionParamValue(idx: number): number {
    switch (idx) {
      case 1: return row.action_param1;
      case 2: return row.action_param2;
      case 3: return row.action_param3;
      case 4: return row.action_param4;
      case 5: return row.action_param5;
      case 6: return row.action_param6;
      default: return 0;
    }
  }

  function setActionParamValue(idx: number, val: number) {
    switch (idx) {
      case 1: row.action_param1 = val; break;
      case 2: row.action_param2 = val; break;
      case 3: row.action_param3 = val; break;
      case 4: row.action_param4 = val; break;
      case 5: row.action_param5 = val; break;
      case 6: row.action_param6 = val; break;
    }
  }

  function getTargetParamValue(idx: number): number {
    switch (idx) {
      case 1: return row.target_param1;
      case 2: return row.target_param2;
      case 3: return row.target_param3;
      default: return 0;
    }
  }

  function setTargetParamValue(idx: number, val: number) {
    switch (idx) {
      case 1: row.target_param1 = val; break;
      case 2: row.target_param2 = val; break;
      case 3: row.target_param3 = val; break;
    }
  }
</script>

<div class="action-card glass-action fade-in" class:compact={uiStyle === 'compact'}>

  {#if uiStyle === 'compact'}
    <!-- ═══ COMPACT HEADER: selects + id + actions all in one bar ═══ -->
    <div class="compact-header">
      <span class="header-id">[#{row.id}]</span>
      <SearchableSelect value={row.action_type} options={SMART_ACTIONS.map(a => ({ value: a.value, label: a.label, title: getActionTooltip(a.value) ?? '' }))} title={actionTooltip} onselect={(val) => row.action_type = val} />
      <span class="compact-arrow">➔</span>
      <SearchableSelect value={row.target_type} options={SMART_TARGETS.map(t2 => ({ value: t2.value, label: t2.label, title: getTargetTooltip(t2.value) ?? '' }))} title={targetTooltip} onselect={(val) => row.target_type = val} />
      {#if actionTooltip || targetTooltip}
        <span class="info-icon" title="{actionTooltip}{actionTooltip && targetTooltip ? ' → ' : ''}{targetTooltip}">ⓘ</span>
      {/if}
      <div class="card-actions">
        <button class="icon-btn" title={tr('duplicate')} onclick={() => onDuplicate?.()}>D</button>
        <button class="icon-btn danger delete-btn" title={tr('delete')} onclick={() => onDelete?.()}>×</button>
      </div>
    </div>

    <!-- ═══ COMPACT BODY: only param pills ═══ -->
    {#if actionParams.length > 0 || targetParams.length > 0 || targetHasCoords}
      <div class="compact-params-sentence">
        {#each actionParams as p, i}
          <span class="param-pill">
            <span class="pill-label">{p.label}</span>
            <input class="pill-input" type="number" value={getActionParamValue(p.index)} onchange={(e) => setActionParamValue(p.index, parseInt(e.currentTarget.value) || 0)} />
          </span>
          {#if i < actionParams.length - 1 || targetParams.length > 0 || targetHasCoords}<span class="pill-sep">·</span>{/if}
        {/each}
        {#each targetParams as p, i}
          <span class="param-pill">
            <span class="pill-label">{p.label}</span>
            <input class="pill-input" type="number" value={getTargetParamValue(p.index)} onchange={(e) => setTargetParamValue(p.index, parseInt(e.currentTarget.value) || 0)} />
          </span>
          {#if i < targetParams.length - 1 || targetHasCoords}<span class="pill-sep">·</span>{/if}
        {/each}
        {#if targetHasCoords}
          <span class="param-pill"><span class="pill-label">X</span><input class="pill-input" type="number" step="0.01" bind:value={row.target_x} /></span>
          <span class="pill-sep">·</span>
          <span class="param-pill"><span class="pill-label">Y</span><input class="pill-input" type="number" step="0.01" bind:value={row.target_y} /></span>
          <span class="pill-sep">·</span>
          <span class="param-pill"><span class="pill-label">Z</span><input class="pill-input" type="number" step="0.01" bind:value={row.target_z} /></span>
          <span class="pill-sep">·</span>
          <span class="param-pill"><span class="pill-label">O</span><input class="pill-input" type="number" step="0.01" bind:value={row.target_o} /></span>
        {/if}
      </div>
    {/if}

  {:else}
    <!-- ═══ CLASSIC HEADER ═══ -->
    <div class="card-header">
      <span class="header-id">[#{row.id}]</span>
      <span class="header-link">LINK: <input type="number" min="0" bind:value={row.link} /></span>
      <span class="header-sep">|</span>
      <span class="header-action" title={actionTooltip}>{getActionLabel(row.action_type)}</span>
      <span class="header-arrow">➔</span>
      <span class="header-target" title={targetTooltip}>{getTargetLabel(row.target_type)}</span>
      <div class="card-actions">
        <button class="icon-btn" title={tr('duplicate')} onclick={() => onDuplicate?.()}>D</button>
        <button class="icon-btn danger delete-btn" title={tr('delete')} onclick={() => onDelete?.()}>×</button>
      </div>
    </div>

    <!-- ═══ CLASSIC BODY ═══ -->
    <div class="card-body">
      <div class="type-row">
        <SearchableSelect value={row.action_type} options={SMART_ACTIONS.map(a => ({ value: a.value, label: a.label, title: getActionTooltip(a.value) ?? '' }))} title={actionTooltip} onselect={(val) => row.action_type = val} />
        <SearchableSelect value={row.target_type} options={SMART_TARGETS.map(t2 => ({ value: t2.value, label: t2.label, title: getTargetTooltip(t2.value) ?? '' }))} title={targetTooltip} onselect={(val) => row.target_type = val} />
      </div>
      {#if actionTooltip || targetTooltip}
        <p class="type-tooltip">
          {#if actionTooltip}{actionTooltip}{/if}
          {#if actionTooltip && targetTooltip} → {/if}
          {#if targetTooltip}{targetTooltip}{/if}
        </p>
      {/if}
      <div class="params-row">
        <div class="params-col">
          {#if actionParams.length > 0}
            <div class="params-grid">
              {#each actionParams as p}
                <label><span class="param-label">{p.label}</span><input type="number" value={getActionParamValue(p.index)} onchange={(e) => setActionParamValue(p.index, parseInt(e.currentTarget.value) || 0)} /></label>
              {/each}
            </div>
          {:else}
            <p class="no-params">{tr('noActionParams')}</p>
          {/if}
        </div>
        <div class="params-col">
          {#if targetParams.length > 0}
            <div class="params-grid">
              {#each targetParams as p}
                <label><span class="param-label">{p.label}</span><input type="number" value={getTargetParamValue(p.index)} onchange={(e) => setTargetParamValue(p.index, parseInt(e.currentTarget.value) || 0)} /></label>
              {/each}
            </div>
          {:else if !targetHasCoords}
            <p class="no-params">{tr('noTargetParams')}</p>
          {/if}
          {#if targetHasCoords}
            <div class="coords-grid">
              <label><span class="param-label">X</span><input type="number" step="0.01" bind:value={row.target_x} /></label>
              <label><span class="param-label">Y</span><input type="number" step="0.01" bind:value={row.target_y} /></label>
              <label><span class="param-label">Z</span><input type="number" step="0.01" bind:value={row.target_z} /></label>
              <label><span class="param-label">O</span><input type="number" step="0.01" bind:value={row.target_o} /></label>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  {#if saveMode === 'auto'}
    <div class="auto-save-indicator">✓ Auto-saved</div>
  {/if}

  {#if saveMode === 'manual'}
    <button class="save-button" onclick={() => onSave?.()}>💾 {tr('save')}</button>
  {/if}
</div>

<style>
  .action-card {
    padding: 6px 8px;
    margin-bottom: 4px;
    border-left: 2px solid rgba(188, 140, 255, 0.25);
  }

  .action-card:hover {
    border-left-color: rgba(188, 140, 255, 0.45);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
    font-size: 13px;
  }

  .header-id {
    font-weight: 700;
    color: var(--text-muted);
    font-size: 12px;
  }

  .header-link {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 12px;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .header-link input {
    width: 50px;
    padding: 2px 4px;
    font-size: 12px;
  }

  .header-sep {
    color: var(--text-muted);
    opacity: 0.4;
  }

  .header-action {
    font-weight: 600;
    color: var(--accent-purple);
    font-size: 13px;
  }

  .header-arrow {
    color: var(--text-muted);
    font-size: 12px;
  }

  .header-target {
    font-weight: 500;
    color: var(--accent-green);
    font-size: 13px;
  }

  .card-actions {
    margin-left: auto;
    display: flex;
    gap: 3px;
  }

  .icon-btn {
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-secondary);
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    transition: var(--transition);
  }

  .icon-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .icon-btn.danger:hover {
    color: var(--accent-red);
    background: rgba(248, 81, 73, 0.1);
  }

  .auto-save-indicator {
    font-size: 10px;
    color: var(--accent-green);
    text-align: right;
    padding: 2px 8px;
    opacity: 0.7;
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

  .delete-btn {
    padding: 1px 5px;
    font-size: 14px;
    line-height: 1;
    color: var(--text-muted);
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .type-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .type-tooltip {
    font-size: 12px;
    color: var(--text-secondary);
    margin: 0;
    padding: 4px 8px;
    background: rgba(88, 166, 255, 0.04);
    border-left: 2px solid rgba(88, 166, 255, 0.2);
    border-radius: 3px;
    line-height: 1.4;
  }

  .params-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .params-col {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .params-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 4px;
  }

  .params-grid label {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .coords-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 4px;
  }

  .coords-grid label {
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

  .no-params {
    font-size: 12px;
    color: var(--text-muted);
    font-style: italic;
    padding: 2px 0;
  }

  input {
    padding: 4px 8px;
    font-size: 13px;
  }

  .action-card.compact {
    padding: 3px 6px;
    margin-bottom: 2px;
  }

  .compact-header {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
    min-height: 28px;
  }

  .compact-arrow {
    color: var(--accent-blue);
    font-size: 12px;
    opacity: 0.6;
    flex-shrink: 0;
  }

  .compact-params-sentence {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    padding: 3px 0;
  }

  .param-pill {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: rgba(188, 140, 255, 0.06);
    border: 1px solid rgba(188, 140, 255, 0.15);
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

  .pill-sep {
    color: var(--text-muted);
    font-size: 11px;
    opacity: 0.5;
  }

  .info-icon {
    font-size: 13px;
    color: var(--accent-blue);
    cursor: help;
    opacity: 0.7;
    flex-shrink: 0;
  }

  .info-icon:hover { opacity: 1; }
</style>
