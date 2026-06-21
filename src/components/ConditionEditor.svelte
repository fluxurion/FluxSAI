<script lang="ts">
  import type { ConditionRow } from '../lib/api';
  import { CONDITION_TYPES, type EnumOption } from '../lib/types';
  import { generateConditionInsertSQL, createEmptyConditionRow } from '../lib/types';
  import { t, type TranslationKey, type Lang } from '../lib/i18n';
  import { getConditionTooltip } from '../lib/tooltips';
  import { getConditionMeta } from '../lib/conditionMeta';
  import * as api from '../lib/api';

  let {
    conditions = $bindable([]),
    sourceEntry = 0,
    sourceId = 0,
    scriptLabel = '',
    onClose,
    lang = 'en' as Lang,
    connected = false,
  } = $props();

  function tr(key: TranslationKey): string {
    return t(lang, key);
  }

  function findLabel(opts: EnumOption[], val: number): string {
    return opts.find(o => o.value === val)?.label ?? `#${val}`;
  }

  function fieldLabel(meta: { label: string; labelHu: string } | undefined, fallback: string): string {
    if (!meta) return fallback;
    return lang === 'hu' ? meta.labelHu : meta.label;
  }

  function addCondition() {
    const c = createEmptyConditionRow();
    c.SourceEntry = sourceEntry;
    c.SourceId = sourceId;
    c.SourceGroup = conditions.length + 1;
    c.ScriptName = scriptLabel || `SAI entry ${sourceEntry} event ${sourceId}`;
    conditions = [...conditions, c];
  }

  function removeCondition(idx: number) {
    conditions = conditions.filter((_, i) => i !== idx);
  }

  async function saveConditionToDb(cond: ConditionRow) {
    if (!connected) return;
    try {
      await api.insertCondition(cond);
      showStatus(tr('conditionsSaved'), 'success');
    } catch (e: any) {
      showStatus(String(e), 'error');
    }
  }

  async function deleteConditionFromDb(cond: ConditionRow, idx: number) {
    if (connected) {
      try {
        await api.deleteConditionsForSmartEvent(cond.SourceEntry, cond.SourceId);
      } catch (e: any) {
        showStatus(String(e), 'error');
      }
    }
    removeCondition(idx);
    if (connected) showStatus(tr('conditionDeleted'), 'info');
  }

  let statusMsg = $state('');
  let statusType = $state('');

  function showStatus(msg: string, type: string) {
    statusMsg = msg;
    statusType = type;
    setTimeout(() => { statusMsg = ''; }, 3000);
  }
</script>

<div class="modal-overlay" role="presentation" onclick={onClose} onkeydown={(e) => e.key === 'Escape' && onClose?.()}>
  <div class="modal glass-card" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
    <div class="modal-header">
      <div class="modal-title">
        <span class="badge badge-cyan">COND</span>
        <span>{tr('conditionEditor')}: {sourceEntry} / {sourceId}</span>
      </div>
      <button class="icon-btn" onclick={onClose}>×</button>
    </div>

    {#if statusMsg}
      <div class="cond-status" class:success={statusType === 'success'} class:error={statusType === 'error'} class:info={statusType === 'info'}>
        {statusMsg}
      </div>
    {/if}

    <div class="modal-body">
      {#if conditions.length === 0}
        <div class="empty-state">
          <p>{tr('noConditions')}</p>
          <p class="hint">{tr('conditionHint')}</p>
        </div>
      {:else}
        <div class="conditions-list">
          {#each conditions as cond, idx}
            {@const meta = getConditionMeta(cond.ConditionTypeOrReference)}
            <div class="condition-row glass-card fade-in">
              <div class="cond-header">
                <span class="badge badge-orange">{tr('elseGroup')} {cond.ElseGroup}</span>
                <span class="cond-type-label" title={getConditionTooltip(cond.ConditionTypeOrReference) ?? ''}>{findLabel(CONDITION_TYPES, cond.ConditionTypeOrReference)}</span>
                {#if cond.NegativeCondition}
                  <span class="badge badge-red">NOT</span>
                {/if}
                <button class="icon-btn danger" onclick={() => deleteConditionFromDb(cond, idx)}>×</button>
              </div>
              <div class="cond-body">
                <label class="cond-type-select">
                  <span class="param-label">{tr('conditionType')}</span>
                  <select bind:value={cond.ConditionTypeOrReference} title={getConditionTooltip(cond.ConditionTypeOrReference) ?? ''}>
                    {#each CONDITION_TYPES as ct}
                      <option value={ct.value} title={getConditionTooltip(ct.value) ?? ''}>{ct.value}: {ct.label}</option>
                    {/each}
                  </select>
                </label>
                {#if getConditionTooltip(cond.ConditionTypeOrReference)}
                  <p class="cond-tooltip">{getConditionTooltip(cond.ConditionTypeOrReference)}</p>
                {/if}
                {#if meta.hasTarget}
                  <label>
                    <span class="param-label">{tr('conditionTarget')}</span>
                    <input type="number" min="0" max="2" bind:value={cond.ConditionTarget} />
                  </label>
                {/if}
                {#if meta.hasValue1}
                  <label>
                    <span class="param-label">{fieldLabel(meta.value1, 'Value 1')}</span>
                    <input type="number" bind:value={cond.ConditionValue1} />
                  </label>
                {/if}
                {#if meta.hasValue2}
                  <label>
                    <span class="param-label">{fieldLabel(meta.value2, 'Value 2')}</span>
                    <input type="number" bind:value={cond.ConditionValue2} />
                  </label>
                {/if}
                {#if meta.hasValue3}
                  <label>
                    <span class="param-label">{fieldLabel(meta.value3, 'Value 3')}</span>
                    <input type="number" bind:value={cond.ConditionValue3} />
                  </label>
                {/if}
                <label>
                  <span class="param-label">{tr('elseGroup')}</span>
                  <input type="number" min="0" bind:value={cond.ElseGroup} />
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" bind:checked={cond.NegativeCondition} />
                  <span>{tr('negativeCondition')}</span>
                </label>
              </div>
              <details>
                <summary>SQL</summary>
                <pre class="sql-snippet"><code>{generateConditionInsertSQL(cond)}</code></pre>
              </details>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="modal-footer">
      <button class="btn-ghost" onclick={onClose}>{tr('close')}</button>
      <button class="btn-primary" onclick={addCondition}>+ {tr('addCondition')}</button>
      <button class="btn-secondary" onclick={addCondition}>+ {tr('addAnotherCondition')}</button>
    </div>
  </div>
</div>

<style>
  .cond-tooltip {
    font-size: 11px;
    color: var(--text-secondary);
    margin: 4px 0 8px;
    padding: 6px 10px;
    background: rgba(88, 166, 255, 0.06);
    border-left: 2px solid rgba(88, 166, 255, 0.3);
    border-radius: 4px;
    line-height: 1.4;
    grid-column: 1 / -1;
  }

  .cond-status {
    padding: 6px 14px;
    font-size: 12px;
    border-bottom: 1px solid var(--border-color);
  }

  .cond-status.success { color: var(--accent-green); }
  .cond-status.error { color: var(--accent-red); }
  .cond-status.info { color: var(--accent-blue); }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fadeIn 0.2s ease-out;
  }

  .modal {
    width: 720px;
    max-width: 90vw;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-pop);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border-color);
  }

  .modal-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 16px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .icon-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
  .icon-btn.danger:hover { color: var(--accent-red); }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 14px 18px;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-muted);
  }

  .empty-state .hint {
    font-size: 12px;
    margin-top: 8px;
  }

  .conditions-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .condition-row {
    padding: 10px 12px;
  }

  .cond-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .cond-type-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .cond-body {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 6px;
  }

  .cond-type-select {
    grid-column: 1 / -1;
  }

  .cond-body label {
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
    width: 16px;
    height: 16px;
    accent-color: var(--accent-blue);
  }

  .param-label {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .cond-body select,
  .cond-body input {
    padding: 4px 8px;
    font-size: 12px;
  }

  .sql-snippet {
    background: rgba(10, 14, 20, 0.8);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--accent-green);
    overflow-x: auto;
    margin-top: 6px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 18px;
    border-top: 1px solid var(--border-color);
  }

  .btn-secondary {
    background: rgba(88, 196, 248, 0.12);
    border: 1px solid rgba(88, 196, 248, 0.3);
    color: var(--accent-cyan, #58c4f8);
    padding: 6px 14px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
  }

  .btn-secondary:hover {
    background: rgba(88, 196, 248, 0.2);
    border-color: rgba(88, 196, 248, 0.5);
  }

</style>
