<script lang="ts">
  import { SMART_SCRIPT_TYPES } from '../lib/types';
  import { t, type Lang, type TranslationKey } from '../lib/i18n';

  let { entryorguid = $bindable(0), sourceType = $bindable(0), onSearch, onNameSearch, onNew, connected = false, onConnectClick, lang = 'en' as Lang, onOptions } = $props();

  let searchEntry = $state('');
  let searchName = $state('');
  let searchType = $state(0);
  let searchMode = $state<'entry' | 'name'>('entry');

  const NAME_SEARCH_TYPES = SMART_SCRIPT_TYPES.filter(t2 => t2.value === 0 || t2.value === 1);

  const DB_CONFIG_KEY = 'fluxsai_db_config';

  let hasDbConfig = $derived(() => {
    if (typeof localStorage === 'undefined') return false;
    try {
      const raw = localStorage.getItem(DB_CONFIG_KEY);
      return raw !== null && raw.length > 0;
    } catch {
      return false;
    }
  });

  function tr(key: TranslationKey): string {
    return t(lang, key);
  }

  function handleSearch() {
    if (searchMode === 'name') {
      if (searchName.trim()) {
        if (searchType > 1) searchType = 0;
        sourceType = searchType;
        onNameSearch?.(searchName.trim(), searchType);
      }
      return;
    }
    const entry = parseInt(searchEntry);
    if (!isNaN(entry)) {
      entryorguid = entry;
      sourceType = searchType;
      onSearch?.(entry, searchType);
    }
  }
</script>

<div class="sidebar glass">
  <div class="sidebar-header">
    <div class="logo">
      <span class="logo-icon">FluxSAI</span>
    </div>
    <button class="options-btn" onclick={onOptions} title={tr('options')}>
      ⚙
    </button>
  </div>

  <div class="sidebar-section">
    <div class="section-title">{tr('database')}</div>
    <div class="db-controls">
      <button class="db-status-btn" class:connected onclick={onConnectClick} disabled={!hasDbConfig && !connected}>
        <span class="db-dot" class:connected></span>
        {connected ? tr('connected') : tr('disconnected')}
      </button>
      {#if !connected}
        <button class="connect-btn" onclick={onConnectClick} disabled={!hasDbConfig}>
          {tr('connect')}
        </button>
      {/if}
    </div>
  </div>

  <div class="sidebar-section">
    <div class="section-title">{tr('searchScripts')}</div>
    <div class="save-mode-switcher">
      <button class="save-mode-btn" class:active={searchMode === 'entry'} onclick={() => searchMode = 'entry'}>{tr('entryGuid')}</button>
      <button class="save-mode-btn" class:active={searchMode === 'name'} onclick={() => searchMode = 'name'}>{tr('searchByName')}</button>
    </div>
    {#if searchMode === 'entry'}
      <div class="search-row">
        <input
          type="text"
          placeholder={tr('entryGuid')}
          bind:value={searchEntry}
          onkeydown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>
      <div class="search-row">
        <select bind:value={searchType}>
          {#each SMART_SCRIPT_TYPES as t2}
            <option value={t2.value}>{t2.label}</option>
          {/each}
        </select>
      </div>
    {:else}
      <div class="search-row">
        <input
          type="text"
          placeholder={tr('namePlaceholder')}
          bind:value={searchName}
          onkeydown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>
      <div class="search-row">
        <select bind:value={searchType}>
          {#each NAME_SEARCH_TYPES as t2}
            <option value={t2.value}>{t2.label}</option>
          {/each}
        </select>
      </div>
    {/if}
    <button class="btn-primary sidebar-btn" onclick={handleSearch}>
      {tr('search')}
    </button>
    <button class="btn-new-script sidebar-btn" onclick={onNew}>
      + {tr('newScript')}
    </button>
  </div>

  <div class="sidebar-footer">
    <div class="footer-text">{tr('trinityCoreEditor')}</div>
  </div>
</div>

<style>
  .sidebar {
    width: 240px;
    min-width: 240px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border-color);
    padding: 16px 12px;
    gap: 20px;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 700;
  }

  .logo-icon {
    font-size: 20px;
    font-weight: 800;
    color: var(--accent-purple);
    filter: drop-shadow(0 0 6px rgba(188, 140, 255, 0.5));
  }

  .options-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    font-size: 16px;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
  }

  .options-btn:hover {
    border-color: var(--accent-blue);
    color: var(--accent-blue);
  }

  .sidebar-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
    font-weight: 600;
  }

  .db-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .db-status-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    font-size: 13px;
    transition: var(--transition);
  }

  .db-status-btn:hover {
    border-color: var(--accent-blue);
    color: var(--text-primary);
  }

  .db-status-btn.connected {
    border-color: rgba(63, 185, 80, 0.3);
    color: var(--accent-green);
  }

  .db-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-red);
    transition: var(--transition);
  }

  .db-dot.connected {
    background: var(--accent-green);
    box-shadow: 0 0 8px rgba(63, 185, 80, 0.5);
  }

  .connect-btn {
    width: 100%;
    padding: 8px 12px;
    background: linear-gradient(135deg, rgba(88, 166, 255, 0.2), rgba(188, 140, 255, 0.2));
    border: 1px solid rgba(88, 166, 255, 0.3);
    border-radius: var(--radius-sm);
    color: var(--accent-blue);
    font-size: 13px;
    font-weight: 600;
    transition: var(--transition);
  }

  .connect-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(88, 166, 255, 0.3), rgba(188, 140, 255, 0.3));
    border-color: var(--accent-blue);
    box-shadow: 0 0 12px rgba(88, 166, 255, 0.3);
  }

  .connect-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .search-row {
    display: flex;
  }

  .search-row input,
  .search-row select {
    width: 100%;
  }

  .sidebar-btn {
    width: 100%;
    text-align: center;
  }

  .btn-new-script {
    background: linear-gradient(135deg, rgba(88, 166, 255, 0.25), rgba(188, 140, 255, 0.25));
    border: 1px solid rgba(88, 166, 255, 0.4);
    color: var(--text-primary);
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 700;
    box-shadow: 0 0 12px rgba(88, 166, 255, 0.2);
  }

  .btn-new-script:hover {
    background: linear-gradient(135deg, rgba(88, 166, 255, 0.4), rgba(188, 140, 255, 0.4));
    border-color: var(--accent-blue);
    box-shadow: 0 0 20px rgba(88, 166, 255, 0.5);
    transform: translateY(-1px);
  }

  .save-mode-switcher {
    display: flex;
    gap: 4px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 3px;
  }

  .save-mode-btn {
    flex: 1;
    background: transparent;
    color: var(--text-muted);
    padding: 5px 10px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 4px;
    transition: var(--transition);
  }

  .save-mode-btn.active {
    background: rgba(88, 166, 255, 0.15);
    color: var(--accent-blue);
  }

  .save-mode-btn:hover:not(.active) {
    color: var(--text-primary);
  }

  .sidebar-footer {
    padding-top: 12px;
    border-top: 1px solid var(--border-color);
  }

  .footer-text {
    font-size: 10px;
    color: var(--text-muted);
    text-align: center;
  }
</style>
