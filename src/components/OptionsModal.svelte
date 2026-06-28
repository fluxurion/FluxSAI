<script lang="ts">
  import { t, type Lang, type TranslationKey } from '../lib/i18n';

  let {
    onClose,
    lang = 'en' as Lang,
    onLangChange,
    saveMode = $bindable('auto' as 'manual' | 'auto'),
    uiStyle = $bindable('compact' as 'classic' | 'compact'),
    theme = 'dark' as 'dark' | 'light',
    onThemeChange,
  } = $props();

  function tr(key: TranslationKey): string {
    return t(lang, key);
  }
</script>

<div class="modal-overlay" role="presentation" onclick={onClose} onkeydown={(e) => e.key === 'Escape' && onClose?.()}>
  <div class="modal glass-card" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
    <div class="modal-header">
      <div class="modal-title">
        <span class="badge badge-purple">⚙</span>
        <span>{tr('options')}</span>
      </div>
      <button class="icon-btn" onclick={onClose}>X</button>
    </div>

    <div class="modal-body">
      <div class="options-section">
        <div class="option-label">{tr('saveMode')}</div>
        <div class="toggle-group">
          <button class="toggle-btn" class:active={saveMode === 'manual'} onclick={() => { saveMode = 'manual'; localStorage.setItem('fluxsai_save_mode', 'manual'); }}>{tr('manual')}</button>
          <button class="toggle-btn" class:active={saveMode === 'auto'} onclick={() => { saveMode = 'auto'; localStorage.setItem('fluxsai_save_mode', 'auto'); }}>{tr('auto')}</button>
        </div>
      </div>

      <div class="options-section">
        <div class="option-label">{tr('uiStyle')}</div>
        <div class="toggle-group">
          <button class="toggle-btn" class:active={uiStyle === 'compact'} onclick={() => { uiStyle = 'compact'; localStorage.setItem('fluxsai_ui_style', 'compact'); }}>{tr('compact')}</button>
          <button class="toggle-btn" class:active={uiStyle === 'classic'} onclick={() => { uiStyle = 'classic'; localStorage.setItem('fluxsai_ui_style', 'classic'); }}>{tr('classic')}</button>
        </div>
      </div>

      <div class="options-section">
        <div class="option-label">{tr('theme')}</div>
        <div class="toggle-group">
          <button class="toggle-btn" class:active={theme === 'dark'} onclick={() => onThemeChange?.('dark')}>{tr('dark')}</button>
          <button class="toggle-btn" class:active={theme === 'light'} onclick={() => onThemeChange?.('light')}>{tr('light')}</button>
        </div>
      </div>

      <div class="options-section">
        <div class="option-label">{tr('language')}</div>
        <div class="toggle-group">
          <button class="toggle-btn" class:active={lang === 'en'} onclick={() => onLangChange?.('en')}>EN</button>
          <button class="toggle-btn" class:active={lang === 'hu'} onclick={() => onLangChange?.('hu')}>HU</button>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn-primary" onclick={onClose}>{tr('close')}</button>
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
    width: 420px;
    max-width: 90vw;
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

  .icon-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

  .modal-body {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .options-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .option-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
    font-weight: 600;
  }

  .toggle-group {
    display: flex;
    gap: 4px;
    background: rgba(10, 14, 20, 0.6);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 3px;
  }

  .toggle-btn {
    flex: 1;
    background: transparent;
    color: var(--text-muted);
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 4px;
    transition: var(--transition);
  }

  .toggle-btn.active {
    background: rgba(88, 166, 255, 0.15);
    color: var(--accent-blue);
  }

  .toggle-btn:hover:not(.active) {
    color: var(--text-primary);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 18px;
    border-top: 1px solid var(--border-color);
  }
</style>
