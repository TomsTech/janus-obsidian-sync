# Architecture Overview

## System Design

JANUS is a deliberately simple, single-file Obsidian plugin (~200 SLOC) that handles Git synchronisation without over-engineering.

```
┌─────────────────────────────────────────────────────────┐
│                    Obsidian App                         │
├─────────────────────────────────────────────────────────┤
│                  JANUS Plugin (main.ts)                 │
│  ┌──────────────┬──────────────┬──────────────────────┐ │
│  │ GHSyncPlugin │ Settings Tab │ UI (Ribbon/Command)  │ │
│  └──────┬───────┴──────────────┴──────────────────────┘ │
│         │                                               │
│         ▼                                               │
│  ┌─────────────────────────────────────────────────────┐│
│  │              simple-git Library                     ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Git Binary (CLI)    │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   GitHub Remote       │
              └───────────────────────┘
```

## Components

### GHSyncPlugin (main.ts:26-223)

The main plugin class extending Obsidian's `Plugin` base class.

**Responsibilities:**
- Plugin lifecycle management (`onload`, `onunload`)
- Settings persistence (`loadSettings`, `saveSettings`)
- Core sync orchestration (`SyncNotes`)
- Startup status checking (`CheckStatusOnStart`)
- UI registration (ribbon icon, command palette)

### GHSyncSettingTab (main.ts:225-301)

Settings UI component extending `PluginSettingTab`.

**Responsibilities:**
- Render settings interface
- Handle user input for configuration
- Persist settings changes

### Core Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `SyncNotes()` | main.ts:30-129 | Main sync workflow: add, commit, fetch, pull, push |
| `CheckStatusOnStart()` | main.ts:131-168 | Check if local is behind remote on startup |
| `onload()` | main.ts:170-210 | Plugin initialisation and UI setup |

## Data Flow

### Sync Operation Flow

```
User Trigger (Ribbon/Command/Auto)
         │
         ▼
┌─────────────────────┐
│ Check working tree  │
│ status (git status) │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    │ Dirty?    │
    └─────┬─────┘
          │
    Yes   │   No
    ▼     │   │
┌─────────┴───│───────┐
│ git add .   │       │
│ git commit  │       │
└─────────────│───────┘
              │
              ▼
    ┌───────────────────┐
    │ Configure remote  │
    │ (remove/add)      │
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────┐
    │ git fetch         │
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────┐
    │ git pull origin   │
    │ main --no-rebase  │
    └─────────┬─────────┘
              │
        ┌─────┴─────┐
        │ Conflicts?│
        └─────┬─────┘
              │
        Yes   │   No
        ▼     │   │
┌─────────────│───│───────┐
│ Open files  │   │       │
│ Show notice │   │       │
│ Return      │   │       │
└─────────────│───│───────┘
              │   │
              │   ▼
              │ ┌───────────────────┐
              │ │ git push origin   │
              │ │ main -u           │
              │ └───────────────────┘
              │
              ▼
           Done
```

## Settings Schema

```typescript
interface GHSyncSettings {
  remoteURL: string;        // GitHub repo URL (HTTPS or SSH)
  gitLocation: string;      // Optional path to git binary
  syncinterval: number;     // Auto-sync interval in minutes (0 = disabled)
  isSyncOnLoad: boolean;    // Auto-sync on startup when behind
  checkStatusOnLoad: boolean; // Check remote status on startup
}
```

## Design Decisions

See [Architecture Decision Records](adr/) for detailed rationale on key design choices.

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| obsidian | latest | Obsidian Plugin API |
| simple-git | ^3.22.0 | Git operations wrapper |
| set-interval-async | ^3.0.3 | Async interval handling |
