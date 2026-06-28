<script lang="ts">
  import type { SmartScriptRow, ConditionRow } from '../lib/api';
  import { invoke } from '@tauri-apps/api/core';
  import { open } from '@tauri-apps/plugin-dialog';
  import { readTextFile } from '@tauri-apps/plugin-fs';
  import { t, type TranslationKey } from '../lib/i18n';

  let { onImport, onClose, connected = false, lang = 'en' } = $props();

  let sqlInput = $state('');
  let parsedScripts = $state<SmartScriptRow[]>([]);
  let parsedConditions = $state<ConditionRow[]>([]);
  let existingScripts = $state<SmartScriptRow[]>([]);
  let existingConditions = $state<ConditionRow[]>([]);
  let comparing = $state(false);
  let importing = $state(false);
  let message = $state('');
  let success = $state(false);
  let showComparison = $state(false);

  function tr(key: TranslationKey): string {
    return t(lang, key);
  }

  async function handleFileBrowse() {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'SQL', extensions: ['sql'] }]
      });
      if (!selected) return;
      const filePath = typeof selected === 'string' ? selected : (selected as any).path;
      if (filePath) {
        const content = await readTextFile(filePath);
        sqlInput = content;
        await parseSQL();
      }
    } catch (e: any) {
      message = String(e);
      success = false;
    }
  }

  async function parseSQL() {
    if (!sqlInput.trim()) {
      message = 'Please enter SQL or select a file';
      success = false;
      return;
    }

    try {
      const result = await invoke<{ scripts: SmartScriptRow[]; conditions: ConditionRow[] }>('parse_sql', { sql: sqlInput });
      parsedScripts = result.scripts;
      parsedConditions = result.conditions;
      message = `Parsed ${parsedScripts.length} scripts and ${parsedConditions.length} conditions`;
      success = true;
    } catch (e: any) {
      message = String(e);
      success = false;
      parsedScripts = [];
      parsedConditions = [];
    }
  }

  async function handleCompare() {
    if (parsedScripts.length === 0) {
      message = 'No scripts to compare';
      success = false;
      return;
    }

    const entry = parsedScripts[0].entryorguid;
    const sourceType = parsedScripts[0].source_type;

    if (!connected) {
      message = 'Not connected to database';
      success = false;
      return;
    }

    comparing = true;
    message = '';
    try {
      existingScripts = await invoke('fetch_script_by_entry', { entryorguid: entry, sourceType });
      if (existingScripts.length > 0) {
        existingConditions = await invoke('fetch_all_conditions_for_entry', { sourceEntry: entry });
        message = `Found ${existingScripts.length} existing scripts and ${existingConditions.length} conditions`;
        success = true;
        showComparison = true;
      } else {
        message = 'No existing scripts found - this is a new entry';
        success = true;
        showComparison = false;
      }
    } catch (e: any) {
      message = String(e);
      success = false;
      showComparison = false;
    }
    comparing = false;
  }

  async function handleImport() {
    if (parsedScripts.length === 0) {
      message = 'No scripts to import';
      success = false;
      return;
    }

    importing = true;
    message = '';
    try {
      await onImport?.(parsedScripts, parsedConditions);
      message = 'Import successful';
      success = true;
      setTimeout(() => onClose?.(), 1000);
    } catch (e: any) {
      message = String(e);
      success = false;
    }
    importing = false;
  }

  function getScriptCount(scripts: SmartScriptRow[]) {
    const events = new Set(scripts.map(s => s.id));
    return `${scripts.length} rows (${events.size} events)`;
  }
</script>

<div class="modal-overlay" role="presentation" onclick={onClose} onkeydown={(e) => e.key === 'Escape' && onClose?.()}>
  <div class="modal glass-card" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
    <div class="modal-header">
      <div class="modal-title">
        <span class="badge badge-blue">Import</span>
        <span>Import SQL Script</span>
      </div>
      <button class="icon-btn" onclick={onClose}>X</button>
    </div>

    <div class="modal-body">
      <div class="import-section">
        <label class="full-width">
          <span class="param-label">SQL Input</span>
          <div class="sql-input-wrapper">
            <textarea 
              class="sql-textarea" 
              bind:value={sqlInput} 
              placeholder="Paste your SQL script here or browse for a file..."
              rows="10"
            ></textarea>
            <button class="browse-btn" onclick={handleFileBrowse}>📁 Browse</button>
          </div>
        </label>
        
        <div class="button-row">
          <button class="btn-ghost" onclick={parseSQL} disabled={!sqlInput.trim()}>
            Parse SQL
          </button>
          {#if parsedScripts.length > 0 && connected}
            <button class="btn-ghost" onclick={handleCompare} disabled={comparing}>
              {comparing ? '...' : 'Compare with Existing'}
            </button>
          {/if}
        </div>
      </div>

      {#if message}
        <div class="message" class:success class:error={!success}>
          {message}
        </div>
      {/if}

      {#if parsedScripts.length > 0}
        <div class="parsed-info" class:with-comparison={showComparison}>
          <div class="info-section">
            <h4>Parsed Scripts</h4>
            <p>{getScriptCount(parsedScripts)}</p>
            <p>{parsedConditions.length} conditions</p>
            <p>Entry: {parsedScripts[0].entryorguid}</p>
            <p>Type: {parsedScripts[0].source_type}</p>
          </div>

          {#if showComparison && existingScripts.length > 0}
            <div class="info-section comparison">
              <h4>Existing Scripts</h4>
              <p>{getScriptCount(existingScripts)}</p>
              <p>{existingConditions.length} conditions</p>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <div class="modal-footer">
      <button class="btn-ghost" onclick={onClose}>Cancel</button>
      {#if parsedScripts.length > 0}
        <button class="btn-primary" onclick={handleImport} disabled={importing}>
          {importing ? '...' : 'Import'}
        </button>
      {/if}
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
    width: 700px;
    max-width: 95vw;
    max-height: 90vh;
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

  .modal-body {
    padding: 18px;
    overflow-y: auto;
  }

  .import-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sql-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sql-textarea {
    width: 100%;
    padding: 10px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-family: 'Courier New', monospace;
    font-size: 12px;
    resize: vertical;
    outline: none;
  }

  .sql-textarea:focus {
    border-color: var(--accent-blue);
  }

  .browse-btn {
    align-self: flex-start;
    padding: 6px 12px;
    background: rgba(88, 166, 255, 0.1);
    border: 1px solid rgba(88, 166, 255, 0.2);
    color: var(--accent-blue);
    border-radius: var(--radius-sm);
    font-size: 12px;
    cursor: pointer;
    transition: var(--transition);
  }

  .browse-btn:hover {
    background: rgba(88, 166, 255, 0.2);
  }

  .button-row {
    display: flex;
    gap: 8px;
  }

  .message {
    margin-top: 12px;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    font-size: 13px;
  }

  .message.success {
    background: rgba(63, 185, 80, 0.1);
    border: 1px solid rgba(63, 185, 80, 0.3);
    color: var(--accent-green);
  }

  .message.error {
    background: rgba(248, 81, 73, 0.1);
    border: 1px solid rgba(248, 81, 73, 0.3);
    color: var(--accent-red);
  }

  .parsed-info {
    margin-top: 16px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .parsed-info.with-comparison {
    grid-template-columns: 1fr 1fr;
  }

  .info-section {
    padding: 12px;
    background: rgba(88, 166, 255, 0.05);
    border: 1px solid rgba(88, 166, 255, 0.15);
    border-radius: var(--radius-sm);
  }

  .info-section.comparison {
    background: rgba(188, 140, 255, 0.05);
    border-color: rgba(188, 140, 255, 0.15);
  }

  .info-section h4 {
    margin: 0 0 8px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .info-section p {
    margin: 4px 0;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 18px;
    border-top: 1px solid var(--border-color);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .param-label {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 4px;
    display: block;
  }

  .full-width {
    width: 100%;
  }
</style>
