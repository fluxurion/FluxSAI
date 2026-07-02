<script lang="ts">
  interface Option {
    value: number;
    label: string;
    title?: string;
  }

  let {
    value = $bindable(),
    options = [] as Option[],
    title = '',
    onselect,
  }: {
    value: number;
    options: Option[];
    title?: string;
    onselect?: (val: number) => void;
  } = $props();

  let open = $state(false);
  let search = $state('');
  let highlightIdx = $state(0);

  let selectedLabel = $derived(options.find(o => o.value === value)?.label ?? String(value));

  let filtered = $derived(
    search.trim() === ''
      ? options
      : options.filter(o =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          String(o.value).includes(search)
        )
  );

  function toggle() {
    open = !open;
    if (open) {
      search = '';
      highlightIdx = filtered.findIndex(o => o.value === value);
      if (highlightIdx < 0) highlightIdx = 0;
      updateDropdownPosition();
      requestAnimationFrame(() => searchEl?.focus());
    }
  }

  function close() {
    open = false;
    search = '';
  }

  function selectOption(opt: Option) {
    value = opt.value;
    onselect?.(opt.value);
    close();
  }

  function onKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightIdx = Math.min(highlightIdx + 1, filtered.length - 1);
      scrollIntoView();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightIdx = Math.max(highlightIdx - 1, 0);
      scrollIntoView();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightIdx]) selectOption(filtered[highlightIdx]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  }

  let listEl = $state<HTMLDivElement | null>(null);
  let searchEl = $state<HTMLInputElement | null>(null);
  let triggerEl = $state<HTMLButtonElement | null>(null);
  let dropdownEl = $state<HTMLDivElement | null>(null);

  function portal(node: HTMLElement) {
    document.body.appendChild(node);
    return {
      destroy() {
        node.remove();
      }
    };
  }

  let dropdownTop = $state(0);
  let dropdownLeft = $state(0);
  let dropdownWidth = $state(0);

  function updateDropdownPosition() {
    if (!triggerEl) return;
    const rect = triggerEl.getBoundingClientRect();
    dropdownTop = rect.bottom + 2;
    dropdownLeft = rect.left;
    dropdownWidth = Math.max(rect.width, 200);
  }

  function scrollIntoView() {
    requestAnimationFrame(() => {
      if (!listEl) return;
      const el = listEl.children[highlightIdx] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'nearest' });
    });
  }

  function handleClickOutside(e: MouseEvent) {
    if (open && containerEl && !containerEl.contains(e.target as Node) && !dropdownEl?.contains(e.target as Node)) {
      close();
    }
  }

  let containerEl: HTMLDivElement | null = null;

  $effect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });
</script>

<div class="ss-container" bind:this={containerEl}>
  <button
    class="ss-trigger"
    onclick={toggle}
    {title}
    type="button"
    bind:this={triggerEl}
  >
    <span class="ss-value">{value}: {selectedLabel}</span>
    <span class="ss-arrow" class:open>▾</span>
  </button>

  {#if open}
    <div class="ss-dropdown" style="top: {dropdownTop}px; left: {dropdownLeft}px; width: {dropdownWidth}px;" role="listbox" bind:this={dropdownEl} use:portal>
      <input
        class="ss-search"
        type="text"
        placeholder="Search..."
        bind:value={search}
        bind:this={searchEl}
        onkeydown={onKeydown}
      />
      <div class="ss-list" bind:this={listEl}>
        {#each filtered as opt, idx}
          <div
            class="ss-option"
            class:selected={opt.value === value}
            class:highlighted={idx === highlightIdx}
            onclick={() => selectOption(opt)}
            onkeydown={(e) => e.key === 'Enter' && selectOption(opt)}
            onmouseenter={() => highlightIdx = idx}
            role="option"
            tabindex="0"
            aria-selected={opt.value === value}
            title={opt.title}
          >
            {opt.value}: {opt.label}
          </div>
        {/each}
        {#if filtered.length === 0}
          <div class="ss-empty">No results</div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .ss-container {
    position: relative;
    width: 100%;
  }

  .ss-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    font-size: 13px;
    font-family: var(--font-family);
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    cursor: pointer;
    transition: var(--transition);
    outline: none;
    text-align: left;
  }

  .ss-trigger:hover {
    border-color: var(--accent-blue);
  }

  .ss-trigger:focus {
    border-color: var(--accent-blue);
    box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.15);
  }

  .ss-value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .ss-arrow {
    font-size: 10px;
    color: var(--text-muted);
    transition: transform 0.2s ease;
    margin-left: 6px;
    flex-shrink: 0;
  }

  .ss-arrow.open {
    transform: rotate(180deg);
  }

  .ss-dropdown {
    position: fixed;
    z-index: 9999;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-pop);
    overflow: hidden;
  }

  .ss-search {
    width: 100%;
    padding: 6px 10px;
    font-size: 13px;
    background: var(--bg-input);
    border: none;
    border-bottom: 1px solid var(--border-color);
    border-radius: 0;
    color: var(--text-primary);
    outline: none;
  }

  .ss-search:focus {
    border-bottom-color: var(--accent-blue);
  }

  .ss-list {
    max-height: 240px;
    overflow-y: auto;
    scrollbar-width: thin;
  }

  .ss-list::-webkit-scrollbar {
    width: 6px;
  }

  .ss-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .ss-list::-webkit-scrollbar-thumb {
    background: rgba(88, 166, 255, 0.2);
    border-radius: 3px;
  }

  .ss-option {
    padding: 5px 10px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: background 0.1s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ss-option:hover,
  .ss-option.highlighted {
    background: rgba(88, 166, 255, 0.1);
    color: var(--text-primary);
  }

  .ss-option.selected {
    color: var(--accent-blue);
    font-weight: 600;
  }

  .ss-empty {
    padding: 10px;
    font-size: 12px;
    color: var(--text-muted);
    text-align: center;
    font-style: italic;
  }
</style>
