<script lang="ts">
  import type { SmartScriptRow } from '../lib/api';
  import {
    SMART_EVENTS, SMART_ACTIONS, SMART_TARGETS, SMART_EVENT_FLAGS,
    type EnumOption,
  } from '../lib/types';
  import { generateInsertSQL, generateDeleteSQL } from '../lib/types';

  let {
    row = $bindable(),
    index,
    onDelete,
    onDuplicate,
    onConditions,
    hasConditions = false,
  } = $props();

  let expanded = $state(true);

  function findEnum(opts: EnumOption[], val: number): EnumOption | undefined {
    return opts.find(o => o.value === val);
  }

  function getEventLabel(): string {
    return findEnum(SMART_EVENTS, row.event_type)?.label ?? `#${row.event_type}`;
  }

  function getActionLabel(): string {
    return findEnum(SMART_ACTIONS, row.action_type)?.label ?? `#${row.action_type}`;
  }

  function getTargetLabel(): string {
    return findEnum(SMART_TARGETS, row.target_type)?.label ?? `#${row.target_type}`;
  }

  function getEventComment(): string {
    return findEnum(SMART_EVENTS, row.event_type)?.comment ?? '';
  }

  function getActionComment(): string {
    return findEnum(SMART_ACTIONS, row.action_type)?.comment ?? '';
  }

  function getTargetComment(): string {
    return findEnum(SMART_TARGETS, row.target_type)?.comment ?? '';
  }

  function toggleFlag(flag: number) {
    row.event_flags = row.event_flags ^ flag;
  }

  function hasFlag(flag: number): boolean {
    return (row.event_flags & flag) !== 0;
  }
</script>

<div class="script-row glass-card fade-in" class:expanded>
  <div class="row-header" onclick={() => expanded = !expanded}>
    <div class="row-id">
      <span class="badge badge-blue">#{row.id}</span>
      {#if row.link > 0}
        <span class="badge badge-purple">→{row.link}</span>
      {/if}
    </div>
    <div class="row-titles">
      <span class="row-event">
        <span class="row-label">EVENT</span>
        <span class="row-value">{getEventLabel()}</span>
      </span>
      <span class="row-arrow">→</span>
      <span class="row-action">
        <span class="row-label">ACTION</span>
        <span class="row-value">{getActionLabel()}</span>
      </span>
      <span class="row-arrow">→</span>
      <span class="row-target">
        <span class="row-label">TARGET</span>
        <span class="row-value">{getTargetLabel()}</span>
      </span>
    </div>
    <div class="row-actions">
      {#if hasConditions}
        <span class="badge badge-cyan" title="Has conditions">COND</span>
      {/if}
      <span class="badge badge-green" title="Chance">{row.event_chance}%</span>
      <button class="icon-btn" title="Conditions" onclick={(e) => { e.stopPropagation(); onConditions?.(row); }}>⚙</button>
      <button class="icon-btn" title="Duplicate" onclick={(e) => { e.stopPropagation(); onDuplicate?.(index); }}>⧉</button>
      <button class="icon-btn danger" title="Delete" onclick={(e) => { e.stopPropagation(); onDelete?.(index); }}>✕</button>
      <span class="expand-icon" class:rotated={expanded}>▼</span>
    </div>
  </div>

  {#if expanded}
    <div class="row-body slide-in">
      <div class="section-grid">
        <div class="section-block">
          <div class="block-header">
            <span class="badge badge-blue">EVENT</span>
            <span class="block-comment">{getEventComment()}</span>
          </div>
          <div class="param-grid">
            <label>
              <span class="param-label">Type</span>
              <select bind:value={row.event_type}>
                {#each SMART_EVENTS as e}
                  <option value={e.value}>{e.value}: {e.label}</option>
                {/each}
              </select>
            </label>
            <label>
              <span class="param-label">Phase Mask</span>
              <input type="number" min="0" max="12" bind:value={row.event_phase_mask} />
            </label>
            <label>
              <span class="param-label">Chance</span>
              <input type="number" min="0" max="100" bind:value={row.event_chance} />
            </label>
            <label>
              <span class="param-label">Param 1</span>
              <input type="number" bind:value={row.event_param1} />
            </label>
            <label>
              <span class="param-label">Param 2</span>
              <input type="number" bind:value={row.event_param2} />
            </label>
            <label>
              <span class="param-label">Param 3</span>
              <input type="number" bind:value={row.event_param3} />
            </label>
            <label>
              <span class="param-label">Param 4</span>
              <input type="number" bind:value={row.event_param4} />
            </label>
            <label>
              <span class="param-label">Param 5</span>
              <input type="number" bind:value={row.event_param5} />
            </label>
            <label class="full-width">
              <span class="param-label">Param String</span>
              <input type="text" bind:value={row.event_param_string} placeholder="(optional)" />
            </label>
          </div>
          <div class="flags-row">
            <span class="flags-label">Flags:</span>
            {#each SMART_EVENT_FLAGS as f}
              <button
                class="flag-chip"
                class:active={hasFlag(f.value)}
                onclick={() => toggleFlag(f.value)}
                title={f.comment}
              >
                {f.label}
              </button>
            {/each}
          </div>
        </div>

        <div class="section-block">
          <div class="block-header">
            <span class="badge badge-purple">ACTION</span>
            <span class="block-comment">{getActionComment()}</span>
          </div>
          <div class="param-grid">
            <label class="full-width">
              <span class="param-label">Type</span>
              <select bind:value={row.action_type}>
                {#each SMART_ACTIONS as a}
                  <option value={a.value}>{a.value}: {a.label}</option>
                {/each}
              </select>
            </label>
            <label>
              <span class="param-label">Param 1</span>
              <input type="number" bind:value={row.action_param1} />
            </label>
            <label>
              <span class="param-label">Param 2</span>
              <input type="number" bind:value={row.action_param2} />
            </label>
            <label>
              <span class="param-label">Param 3</span>
              <input type="number" bind:value={row.action_param3} />
            </label>
            <label>
              <span class="param-label">Param 4</span>
              <input type="number" bind:value={row.action_param4} />
            </label>
            <label>
              <span class="param-label">Param 5</span>
              <input type="number" bind:value={row.action_param5} />
            </label>
            <label>
              <span class="param-label">Param 6</span>
              <input type="number" bind:value={row.action_param6} />
            </label>
          </div>
        </div>

        <div class="section-block">
          <div class="block-header">
            <span class="badge badge-green">TARGET</span>
            <span class="block-comment">{getTargetComment()}</span>
          </div>
          <div class="param-grid">
            <label class="full-width">
              <span class="param-label">Type</span>
              <select bind:value={row.target_type}>
                {#each SMART_TARGETS as t}
                  <option value={t.value}>{t.value}: {t.label}</option>
                {/each}
              </select>
            </label>
            <label>
              <span class="param-label">Param 1</span>
              <input type="number" bind:value={row.target_param1} />
            </label>
            <label>
              <span class="param-label">Param 2</span>
              <input type="number" bind:value={row.target_param2} />
            </label>
            <label>
              <span class="param-label">Param 3</span>
              <input type="number" bind:value={row.target_param3} />
            </label>
            <label>
              <span class="param-label">X</span>
              <input type="number" step="0.01" bind:value={row.target_x} />
            </label>
            <label>
              <span class="param-label">Y</span>
              <input type="number" step="0.01" bind:value={row.target_y} />
            </label>
            <label>
              <span class="param-label">Z</span>
              <input type="number" step="0.01" bind:value={row.target_z} />
            </label>
            <label>
              <span class="param-label">O</span>
              <input type="number" step="0.01" bind:value={row.target_o} />
            </label>
          </div>
        </div>
      </div>

      <div class="sql-preview-row">
        <details>
          <summary>SQL Preview</summary>
          <pre class="sql-snippet"><code>{generateInsertSQL(row)}</code></pre>
        </details>
      </div>
    </div>
  {/if}
</div>

<style>
  .script-row {
    margin-bottom: 8px;
    overflow: hidden;
    transition: var(--transition);
  }

  .script-row:hover {
    border-color: rgba(88, 166, 255, 0.2);
  }

  .row-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    cursor: pointer;
    transition: var(--transition);
  }

  .row-header:hover {
    background: rgba(88, 166, 255, 0.05);
  }

  .row-id {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 60px;
  }

  .row-titles {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }

  .row-event, .row-action, .row-target {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .row-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
  }

  .row-value {
    color: var(--text-primary);
    font-weight: 500;
  }

  .row-arrow {
    color: var(--text-muted);
    font-size: 14px;
  }

  .row-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .icon-btn {
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-secondary);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
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

  .expand-icon {
    font-size: 10px;
    color: var(--text-muted);
    transition: transform 0.2s ease;
  }

  .expand-icon.rotated {
    transform: rotate(180deg);
  }

  .row-body {
    padding: 12px 14px;
    border-top: 1px solid var(--border-color);
  }

  .section-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
  }

  .section-block {
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 10px;
  }

  .block-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .block-comment {
    font-size: 10px;
    color: var(--text-muted);
    font-style: italic;
  }

  .param-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .param-grid label {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .param-grid label.full-width {
    grid-column: 1 / -1;
  }

  .param-label {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .param-grid input,
  .param-grid select {
    padding: 4px 8px;
    font-size: 12px;
  }

  .flags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
    align-items: center;
  }

  .flags-label {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-right: 4px;
  }

  .flag-chip {
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    color: var(--text-muted);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    transition: var(--transition);
  }

  .flag-chip.active {
    background: rgba(88, 166, 255, 0.15);
    border-color: rgba(88, 166, 255, 0.3);
    color: var(--accent-blue);
  }

  .flag-chip:hover {
    border-color: var(--accent-blue);
  }

  .sql-preview-row {
    margin-top: 10px;
  }

  .sql-preview-row summary {
    cursor: pointer;
    font-size: 11px;
    color: var(--text-muted);
    padding: 4px 0;
  }

  .sql-snippet {
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--accent-green);
    overflow-x: auto;
    margin-top: 6px;
  }

  @media (max-width: 1100px) {
    .section-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
