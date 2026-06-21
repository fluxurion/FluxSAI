<script lang="ts">
  import type { ConditionRow } from '../lib/api';
  import { CONDITION_TYPES, type EnumOption, generateConditionDescription } from '../lib/types';
  import { getConditionTooltip } from '../lib/tooltips';
  import { getConditionMeta } from '../lib/conditionMeta';
  import { t, type TranslationKey, type Lang } from '../lib/i18n';
  import SearchableSelect from './SearchableSelect.svelte';

  let {
    cond = $bindable(),
    onDelete,
    onSave,
    lang = 'en' as Lang,
    saveMode = 'manual' as 'manual' | 'auto',
    connected = false,
  } = $props();

  let meta = $derived(getConditionMeta(cond.ConditionTypeOrReference));
  let tooltip = $derived(getConditionTooltip(cond.ConditionTypeOrReference) ?? '');

  function tr(key: TranslationKey): string {
    return t(lang, key);
  }

  function findLabel(opts: EnumOption[], val: number): string {
    return opts.find(o => o.value === val)?.label ?? `#${val}`;
  }

  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    if (saveMode === 'auto' && connected) {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        onSave?.(cond);
      }, 500);
    }
    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  });

  function fieldLabel(m: { label: string; labelHu: string } | undefined, fallback: string): string {
    if (!m) return fallback;
    return lang === 'hu' ? m.labelHu : m.label;
  }

  function clearZero(e: FocusEvent) {
    const target = e.target as HTMLInputElement;
    if (target.value === '0') target.value = '';
  }

  function restoreZero(e: FocusEvent) {
    const target = e.target as HTMLInputElement;
    if (target.value === '') target.value = '0';
  }

  $effect(() => {
    cond.ScriptName = `SAI Entry ${cond.SourceEntry} Event ${cond.SourceId} - ${generateConditionDescription(cond)}`;
  });
</script>

<div class="cond-card glass-action fade-in">
  <div class="card-header">
    <span class="badge badge-orange" title={tr('elseGroup')}>G:{cond.ElseGroup}</span>
    <span class="cond-type-label" title={tooltip}>{findLabel(CONDITION_TYPES, cond.ConditionTypeOrReference)}</span>
    {#if cond.NegativeCondition}
      <span class="badge badge-red">NOT</span>
    {/if}
    {#if cond.ConditionTarget > 0}
      <span class="badge badge-blue">T:{cond.ConditionTarget}</span>
    {/if}
    <div class="card-actions">
      <button class="icon-btn danger delete-btn" title={tr('delete')} onclick={() => onDelete?.()}>×</button>
    </div>
  </div>

  <div class="card-body">
    <div class="type-row">
      <SearchableSelect
        value={cond.ConditionTypeOrReference}
        options={CONDITION_TYPES.map(ct => ({ value: ct.value, label: ct.label, title: getConditionTooltip(ct.value) ?? '' }))}
        title={tooltip}
        onselect={(val) => cond.ConditionTypeOrReference = val}
      />
    </div>

    {#if tooltip}
      <p class="type-tooltip">{tooltip}</p>
    {/if}

    <div class="params-grid">
      {#if meta.hasTarget}
        <label>
          <span class="param-label">{tr('conditionTarget')}</span>
          <SearchableSelect
            value={cond.ConditionTarget}
            options={[
              { value: 0, label: '0 – Actor (self)', title: 'The creature or gameobject running the SmartAI script' },
              { value: 1, label: '1 – Invoker', title: 'The unit or player that triggered the event' },
              { value: 2, label: '2 – Extra target', title: 'Third target slot, rarely used in SmartAI' },
            ]}
            onselect={(val) => cond.ConditionTarget = val}
          />
        </label>
      {/if}
      {#if meta.hasValue1}
        <label>
          <span class="param-label">{fieldLabel(meta.value1, 'Value 1')}</span>
          <input type="number" bind:value={cond.ConditionValue1} onfocus={clearZero} onblur={restoreZero} />
        </label>
      {/if}
      {#if meta.hasValue2}
        <label>
          <span class="param-label">{fieldLabel(meta.value2, 'Value 2')}</span>
          <input type="number" bind:value={cond.ConditionValue2} onfocus={clearZero} onblur={restoreZero} />
        </label>
      {/if}
      {#if meta.hasValue3}
        <label>
          <span class="param-label">{fieldLabel(meta.value3, 'Value 3')}</span>
          <input type="number" bind:value={cond.ConditionValue3} onfocus={clearZero} onblur={restoreZero} />
        </label>
      {/if}
      <label>
        <span class="param-label">{tr('elseGroup')}</span>
        <input type="number" min="0" bind:value={cond.ElseGroup} onfocus={clearZero} onblur={restoreZero} />
      </label>
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={cond.NegativeCondition} />
        <span>{tr('negativeCondition')}</span>
      </label>
    </div>
  </div>

  {#if saveMode === 'auto'}
    <div class="auto-save-indicator">✓ Auto-saved</div>
  {/if}

  {#if saveMode === 'manual'}
    <button class="save-button" onclick={() => onSave?.(cond)}>💾 {tr('save')}</button>
  {/if}
</div>

<style>
  .cond-card {
    padding: 8px 12px;
    margin-bottom: 6px;
    z-index: 2;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .cond-type-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-actions {
    display: flex;
    gap: 4px;
    margin-left: auto;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .icon-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
  .icon-btn.danger:hover { color: var(--accent-red); }

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

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .type-row {
    display: flex;
    gap: 6px;
  }

  .type-tooltip {
    font-size: 11px;
    color: var(--text-secondary);
    margin: 0;
    padding: 4px 8px;
    background: rgba(88, 166, 255, 0.06);
    border-left: 2px solid rgba(88, 166, 255, 0.3);
    border-radius: 4px;
    line-height: 1.4;
  }

  .params-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 6px;
  }

  .params-grid label {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .checkbox-label {
    flex-direction: row !important;
    align-items: center;
    gap: 6px;
  }

  .checkbox-label input[type="checkbox"] {
    width: 14px;
    height: 14px;
    accent-color: var(--accent-blue);
  }

  .param-label {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .params-grid input {
    padding: 3px 6px;
    font-size: 12px;
  }
</style>
