# FluxSAI

A desktop application for editing TrinityCore SmartAI / SmartScripts, built with Tauri 2, Svelte 5, and TypeScript.

## Features

- **Visual SmartAI Editor** — Create and edit SmartScripts with an intuitive card-based UI
- **UI Style Switcher** — Toggle between **Classic** (detailed database view) and **Compact** (streamlined sentence view) layouts, persisted in localStorage
- **Compact Mode** — Inline pill-based parameter editing, collapsible advanced section (chance/phase/flags), merged action→target header, tooltip icons instead of description boxes, on-demand condition panel
- **Event Grouping** — Scripts are automatically grouped by event type and parameters
- **Searchable Dropdowns** — Filter through 82 event types, ~140 action types, and ~30 target types with keyboard navigation
- **Database Integration** — Connect to a MySQL/TrinityCore database to fetch, save, and delete scripts directly
- **SQL Export** — Export scripts to `.sql` files with native file save dialog
- **Conditions Editor** — Manage conditions per smart event with type-aware field metadata, ConditionTarget dropdown (Actor/Invoker/Extra), and negative condition toggle
- **Auto-Save** — Automatic file-based saving with debounced state tracking; cache updates on every change so reloads preserve edits
- **Recent Scripts** — Quick access to recently edited scripts with metadata (event type, action type, counts)
- **Offline Caching** — Scripts are cached in localStorage for offline editing; current edits are preserved on re-search
- **Bilingual UI** — English and Hungarian localization
- **Animated Welcome Screen** — Immersive animated background with floating gradient blobs, particles, runes, and scanline effects

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Svelte 5 + TypeScript + Vite 6 |
| Backend | Rust + Tauri 2 |
| Database | sqlx (MySQL) |
| Plugins | tauri-plugin-dialog, tauri-plugin-fs |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- [Tauri 2 prerequisites](https://tauri.app/start/prerequisites/) (WebView2 on Windows)

## Getting Started

### Development

```bash
npm install
npm run tauri dev
```

### Build

#### Using build.bat (Windows)

Double-click `build.bat` or run it from a terminal:

```bat
build.bat
```

This will:
1. Install frontend dependencies
2. Build the Tauri app in release mode
3. Copy the resulting `FluxSAI.exe` to your Desktop

#### Manual build

```bash
npm install
npm run tauri build
```

The executable will be at `src-tauri/target/release/fluxsai.exe`.

## Usage

1. **Connect to Database** — Click the database icon in the sidebar and enter your TrinityCore MySQL credentials
2. **Search Scripts** — Enter a creature/GO entry GUID and select the source type, then click Search
3. **New Script** — Click "New Script" to create a new SmartAI script from scratch
4. **Edit Events & Actions** — Each event group can contain multiple actions. Use the searchable dropdowns to select event/action/target types
5. **Add Actions** — Click the `+` button on an event group to add a new action
6. **Delete** — Use the `×` button on action cards or event groups to delete (deletes from DB if connected)
7. **Save to DB** — Click "Save to DB" to persist all changes to the database
8. **Export SQL** — Click "Export" to save scripts as a `.sql` file (filename format: `world_YYYY_MM_DD_HH_sourcetype_sourceid.sql`)
9. **Cancel** — Click "Cancel" to return to the welcome screen without saving

## Source Types

| Icon | Type | Value |
|------|------|-------|
| 🐺 | Creature | 0 |
| 📦 | GameObject | 1 |
| 📍 | AreaTrigger | 2 |
| 🎉 | Event | 3 |
| 💬 | Gossip | 4 |
| ❗ | Quest | 5 |
| ✨ | Spell | 6 |
| 🚢 | Transport | 7 |
| 🏰 | Instance | 8 |
| ⏱️ | Timed Actionlist | 9 |
| 🎬 | Scene | 10 |

## Project Structure

```
FluxSAI/
├── src/                    # Frontend (Svelte)
│   ├── App.svelte          # Main app component, state management, auto-save
│   ├── components/         # UI components
│   │   ├── ActionCard.svelte
│   │   ├── ConditionCard.svelte
│   │   ├── DbModal.svelte
│   │   ├── EventGroup.svelte
│   │   ├── SearchableSelect.svelte
│   │   ├── Sidebar.svelte
│   │   └── SqlPreview.svelte
│   └── lib/                # Shared logic
│       ├── api.ts          # Tauri invoke wrappers
│       ├── conditionMeta.ts # Condition type field metadata
│       ├── i18n.ts         # Internationalization (EN/HU)
│       ├── paramMeta.ts    # Event/action/target parameter metadata
│       ├── tooltips.ts     # Tooltip text for enums
│       └── types.ts        # SmartAI enums & interfaces
├── src-tauri/              # Backend (Rust)
│   ├── src/
│   │   ├── lib.rs          # Tauri builder & command handlers
│   │   ├── db.rs           # Database commands (connect, fetch, insert, delete)
│   │   └── sql_gen.rs      # SQL export generation
│   ├── Cargo.toml
│   └── tauri.conf.json
├── build.bat               # One-click build script (Windows)
└── package.json
```

## Database Tables

- **smart_scripts** (29 columns) — Main SmartAI script storage
- **conditions** (14 columns) — Condition definitions (source type 22 = `CONDITION_SOURCE_TYPE_SMART_EVENT`)

## License

This project is licensed under GPL-2.0 (compatible with TrinityCore).
