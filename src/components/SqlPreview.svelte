<script lang="ts">
  import type { SmartScriptRow, ConditionRow } from '../lib/api';
  import { generateInsertSQL, generateDeleteSQL, generateConditionInsertSQL } from '../lib/types';

  let { rows = $bindable([]), conditions = [] as ConditionRow[], onExport } = $props();

  let copied = $state(false);

  let fullSql = $derived(
    rows.map(r => generateInsertSQL(r)).join('\n\n') +
    (conditions.length > 0
      ? '\n\n-- Conditions\n' + conditions.map(c => generateConditionInsertSQL(c)).join('\n\n')
      : '')
  );

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(fullSql);
      copied = true;
      setTimeout(() => copied = false, 2000);
    } catch {
      // fallback
    }
  }

  function highlightSql(sql: string): string {
    return sql
      .replace(/\b(INSERT|INTO|DELETE|FROM|WHERE|VALUES|UPDATE|SET|SELECT|ORDER|BY|LIMIT)\b/gi, '<span class="kw">$1</span>')
      .replace(/`([^`]+)`/g, '<span class="col">`$1`</span>')
      .replace(/'([^']*)'/g, '<span class="str">\'$1\'</span>')
      .replace(/\b(\d+)\b/g, '<span class="num">$1</span>')
      .replace(/(--[^\n]*)/g, '<span class="cmt">$1</span>');
  }
</script>

<div class="sql-panel glass-card">
  <div class="sql-header">
    <div class="sql-title">
      <span class="badge badge-green">SQL</span>
      <span class="sql-count">{rows.length} rows{conditions.length > 0 ? ` + ${conditions.length} conditions` : ''}</span>
    </div>
    <div class="sql-actions">
      <button class="btn-ghost" onclick={copyToClipboard}>
        {copied ? '✓ Copied' : '📋 Copy'}
      </button>
      <button class="btn-primary" onclick={onExport}>💾 Export .sql</button>
    </div>
  </div>
  <div class="sql-content">
    {#if rows.length === 0}
      <div class="empty-sql">
        <p>No scripts loaded.</p>
        <p class="hint">Search for an entry or create a new script to see SQL preview.</p>
      </div>
    {:else}
      <pre class="sql-code">{@html highlightSql(fullSql)}</pre>
    {/if}
  </div>
</div>

<style>
  .sql-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .sql-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid var(--border-color);
  }

  .sql-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sql-count {
    font-size: 11px;
    color: var(--text-muted);
  }

  .sql-actions {
    display: flex;
    gap: 6px;
  }

  .sql-content {
    flex: 1;
    overflow: auto;
    padding: 12px 14px;
  }

  .empty-sql {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-muted);
  }

  .empty-sql .hint {
    font-size: 12px;
    margin-top: 6px;
  }

  .sql-code {
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .sql-code :global(.kw) {
    color: var(--accent-blue);
    font-weight: 600;
  }

  .sql-code :global(.col) {
    color: var(--accent-purple);
  }

  .sql-code :global(.str) {
    color: var(--accent-green);
  }

  .sql-code :global(.num) {
    color: var(--accent-orange);
  }

  .sql-code :global(.cmt) {
    color: var(--text-muted);
    font-style: italic;
  }
</style>
