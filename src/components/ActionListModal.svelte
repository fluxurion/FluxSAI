<script lang="ts">
  import type { SmartScriptRow } from '../lib/api';
  import * as api from '../lib/api';
  import { createEmptyScriptRow } from '../lib/types';
  import { generateScriptComment } from '../lib/paramMeta';
  import { t, type Lang, type TranslationKey } from '../lib/i18n';
  import ActionCard from './ActionCard.svelte';

  let {
    actionListId,
    onClose,
    lang = 'en' as Lang,
    saveMode = 'manual' as 'manual' | 'auto',
    uiStyle = 'compact' as 'classic' | 'compact',
    connected = false,
  } = $props();

  let scripts = $state<SmartScriptRow[]>([]);
  let loading = $state(false);
  let error = $state('');

  function tr(key: TranslationKey): string {
    return t(lang, key);
  }

  function nextId(): number {
    return scripts.length > 0 ? Math.max(...scripts.map(s => s.id)) + 1 : 0;
  }

  async function loadScripts() {
    loading = true;
    error = '';
    try {
      const rows = await api.fetchScripts(actionListId, 9);
      scripts = rows;
    } catch (e: any) {
      error = String(e);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (actionListId > 0 && connected) {
      loadScripts();
    }
  });

  function handleAddAction() {
    const row = createEmptyScriptRow(actionListId, 9);
    row.id = nextId();
    row.event_type = 0;
    row.event_chance = 100;
    row.comment = generateScriptComment(row);
    scripts = [...scripts, row];
  }

  async function handleDeleteAction(_group: any, rowIdx: number) {
    const row = scripts[rowIdx];
    if (connected && row) {
      try {
        await api.deleteScript(row.entryorguid, row.source_type, row.id);
      } catch (e: any) {
        error = String(e);
        return;
      }
    }
    scripts = scripts.filter((_, i) => i !== rowIdx);
  }

  function handleDuplicateAction(_group: any, rowIdx: number) {
    const orig = scripts[rowIdx];
    const copy = { ...orig, id: nextId() };
    scripts = [...scripts.slice(0, rowIdx + 1), copy, ...scripts.slice(rowIdx + 1)];
  }

  async function handleActionSave(row: SmartScriptRow) {
    try {
      if (connected) {
        await api.insertScript(row);
      }
    } catch (e: any) {
      error = String(e);
    }
  }

  async function handleSaveAll() {
    if (!connected) return;
    try {
      for (const row of scripts) {
        await api.insertScript(row);
      }
    } catch (e: any) {
      error = String(e);
    }
  }
</script>

<div class="modal-overlay" role="presentation" onclick={onClose} onkeydown={(e) => e.key === 'Escape' && onClose?.()}>
  <div class="modal glass-card" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
    <div class="modal-header">
      <div class="modal-title">
        <span class="badge badge-purple">⚙</span>
        <span>{tr('timedActionlist')} #{actionListId}</span>
      </div>
      <button class="icon-btn" onclick={onClose}>X</button>
    </div>

    <div class="modal-body">
      {#if loading}
        <div class="loading-text">Loading...</div>
      {:else if error}
        <div class="error-text">{error}</div>
      {:else if scripts.length === 0}
        <div class="empty-text">{tr('noActionsInList')}</div>
      {:else}
        <div class="actions-list">
          {#each scripts as _row, idx (idx)}
            <ActionCard
              bind:row={scripts[idx]}
              onDelete={() => handleDeleteAction(null, idx)}
              onDuplicate={() => handleDuplicateAction(null, idx)}
              onSave={() => handleActionSave(scripts[idx])}
              {lang}
              {saveMode}
              {uiStyle}
              {connected}
            />
          {/each}
        </div>
      {/if}
    </div>

    <div class="modal-footer">
      <button class="btn-ghost" onclick={handleAddAction} disabled={!connected}>
        + {tr('addAction')}
      </button>
      {#if connected && scripts.length > 0}
        <button class="btn-primary" onclick={handleSaveAll}>
          {tr('saveAll')}
        </button>
      {/if}
      <button class="btn-ghost" onclick={onClose}>{tr('close')}</button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--overlay-bg);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fadeIn 0.2s ease-out;
  }

  .modal {
    width: 800px;
    max-width: 95vw;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
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

  .icon-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .modal-body {
    padding: 18px;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .actions-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .loading-text,
  .empty-text,
  .error-text {
    text-align: center;
    padding: 24px;
    color: var(--text-muted);
    font-size: 13px;
  }

  .error-text {
    color: var(--accent-red);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 18px;
    border-top: 1px solid var(--border-color);
  }
</style>
