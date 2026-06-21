<script lang="ts">
  import type { DbConfig } from '../lib/api';
  import { testConnection, connectDb } from '../lib/api';
  import { t, type TranslationKey } from '../lib/i18n';

  let { onConnect, onClose, lang = 'en' } = $props();

  let config = $state<DbConfig>({
    host: '127.0.0.1',
    port: 3306,
    user: 'trinity',
    password: 'trinity',
    database: 'world',
  });

  let testing = $state(false);
  let connecting = $state(false);
  let message = $state('');
  let success = $state(false);

  const DB_CONFIG_KEY = 'fluxsai_db_config';

  function loadSavedConfig(): DbConfig {
    try {
      const raw = localStorage.getItem(DB_CONFIG_KEY);
      if (raw) return { ...config, ...JSON.parse(raw) };
    } catch {}
    return config;
  }

  function saveConfig() {
    try {
      localStorage.setItem(DB_CONFIG_KEY, JSON.stringify(config));
    } catch {}
  }

  config = loadSavedConfig();

  function tr(key: TranslationKey): string {
    return t(lang, key);
  }

  async function handleTest() {
    testing = true;
    message = '';
    try {
      const result = await testConnection(config);
      message = result;
      success = true;
    } catch (e: any) {
      message = String(e);
      success = false;
    }
    testing = false;
  }

  async function handleConnect() {
    connecting = true;
    message = '';
    try {
      const result = await connectDb(config);
      message = result;
      success = true;
      saveConfig();
      onConnect?.(config);
    } catch (e: any) {
      message = String(e);
      success = false;
    }
    connecting = false;
  }
</script>

<div class="modal-overlay" role="presentation" onclick={onClose} onkeydown={(e) => e.key === 'Escape' && onClose?.()}>
  <div class="modal glass-card" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
    <div class="modal-header">
      <div class="modal-title">
        <span class="badge badge-blue">DB</span>
        <span>{tr('dbConnection')}</span>
      </div>
      <button class="icon-btn" onclick={onClose}>X</button>
    </div>

    <div class="modal-body">
      <div class="form-grid">
        <label>
          <span class="param-label">{tr('host')}</span>
          <input type="text" bind:value={config.host} />
        </label>
        <label>
          <span class="param-label">{tr('port')}</span>
          <input type="number" bind:value={config.port} />
        </label>
        <label>
          <span class="param-label">{tr('user')}</span>
          <input type="text" bind:value={config.user} />
        </label>
        <label>
          <span class="param-label">{tr('password')}</span>
          <input type="password" bind:value={config.password} />
        </label>
        <label class="full-width">
          <span class="param-label">{tr('dbName')}</span>
          <input type="text" bind:value={config.database} />
        </label>
      </div>

      {#if message}
        <div class="message" class:success class:error={!success}>
          {message}
        </div>
      {/if}
    </div>

    <div class="modal-footer">
      <button class="btn-ghost" onclick={onClose}>{tr('cancel')}</button>
      <button class="btn-ghost" onclick={handleTest} disabled={testing}>
        {testing ? '...' : 'Test'}
      </button>
      <button class="btn-primary" onclick={handleConnect} disabled={connecting}>
        {connecting ? '...' : tr('connect')}
      </button>
    </div>
  </div>
</div>

<style>
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
    width: 480px;
    max-width: 90vw;
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
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .form-grid label {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .form-grid label.full-width {
    grid-column: 1 / -1;
  }

  .param-label {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .message {
    margin-top: 14px;
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
</style>
