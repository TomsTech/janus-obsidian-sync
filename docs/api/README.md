# API Reference

## Settings Interface

JANUS exposes configuration through Obsidian's settings panel.

### GHSyncSettings

```typescript
interface GHSyncSettings {
  remoteURL: string;
  gitLocation: string;
  syncinterval: number;
  isSyncOnLoad: boolean;
  checkStatusOnLoad: boolean;
}
```

### Settings Reference

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `remoteURL` | string | `""` | GitHub repository URL (HTTPS or SSH format) |
| `gitLocation` | string | `""` | Optional path to Git binary directory |
| `syncinterval` | number | `0` | Auto-sync interval in minutes (0 = disabled) |
| `isSyncOnLoad` | boolean | `false` | Automatically sync on startup if behind remote |
| `checkStatusOnLoad` | boolean | `true` | Check remote status when Obsidian opens |

---

## Remote URL Configuration

### HTTPS Format

```
https://github.com/username/repository.git
```

Authentication will be prompted on first sync via Git credential manager.

### SSH Format

```
git@github.com:username/repository.git
```

Requires SSH key to be configured with GitHub.

---

## Git Binary Location

If Git is not in your system PATH, specify the directory containing the Git binary.

### Examples

**Windows:**
```
C:\Program Files\Git\bin\
```

**macOS (Homebrew):**
```
/opt/homebrew/bin/
```

**Linux:**
```
/usr/bin/
```

> **Note:** Include the trailing slash. The plugin appends `git` to this path.

---

## Commands

### Sync with Remote

- **Command ID:** `github-sync-command`
- **Name:** Sync with Remote
- **Hotkey:** Not assigned by default

Access via Command Palette (Ctrl/Cmd + P) and search for "Sync with Remote".

---

## UI Elements

### Ribbon Icon

A GitHub icon appears in the left ribbon. Click to trigger a sync operation.

- **Icon:** `github`
- **Tooltip:** "Sync with Remote"
- **CSS Class:** `gh-sync-ribbon`

---

## Notifications

The plugin communicates status through Obsidian notices:

| Notice | Condition |
|--------|-----------|
| "Syncing to GitHub remote" | Sync operation started |
| "Working branch clean" | No local changes to commit |
| "GitHub Sync: Successfully set remote origin url" | Remote configured |
| "GitHub Sync: Pulled X changes" | Changes pulled from remote |
| "GitHub Sync: Pushed on [hostname] [timestamp]" | Changes pushed successfully |
| "GitHub Sync: X commits behind remote..." | Local is behind (on startup check) |
| "GitHub Sync: up to date with remote." | Local matches remote |
| "Merge conflicts in: [files]" | Conflicts detected during pull |
| "Vault is not a Git repo or git binary cannot be found." | Git/repo error |

---

## Commit Message Format

Automatic commits use the following format:

```
[hostname] YYYY-M-D:H:M:S
```

**Example:**
```
DESKTOP-ABC123 2024-3-15:14:30:45
```

---

## Storage

Settings are stored in:
```
[vault]/.obsidian/plugins/github-sync/data.json
```

Example `data.json`:
```json
{
  "remoteURL": "git@github.com:user/vault.git",
  "gitLocation": "",
  "syncinterval": 30,
  "isSyncOnLoad": true,
  "checkStatusOnLoad": true
}
```
