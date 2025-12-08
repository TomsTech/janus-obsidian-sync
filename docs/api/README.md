# API Reference

## Settings Interface

JANUS exposes configuration through Obsidian's settings panel.

### GHSyncSettings

```typescript
interface GHSyncSettings {
  remoteURL: string;
  gitLocation: string;
  gitDirectory: string;
  syncinterval: number;
  isSyncOnLoad: boolean;
  checkStatusOnLoad: boolean;
  commitMessageTemplate: string;
  branch: string;
  disableGpgSigning: boolean;
}
```

### Settings Reference

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `remoteURL` | string | `""` | GitHub repository URL (HTTPS or SSH format). Auto-populated from `.git/config` if available. |
| `branch` | string | `"main"` | Branch to sync with. Auto-populated from current git branch if available. |
| `gitDirectory` | string | `""` | Optional subdirectory within the vault where the .git folder is located. |
| `gitLocation` | string | `""` | Optional path to Git binary directory |
| `syncinterval` | number | `0` | Auto-sync interval in minutes (0 = disabled) |
| `isSyncOnLoad` | boolean | `false` | Automatically sync on startup if behind remote |
| `checkStatusOnLoad` | boolean | `true` | Check remote status when Obsidian opens |
| `commitMessageTemplate` | string | `"{{hostname}} {{date}} {{time}}"` | Template for commit messages |
| `disableGpgSigning` | boolean | `false` | Disable GPG commit signing for plugin commits |

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

### Auto-Detection

If your vault is already a Git repository with a configured remote, the plugin will automatically read the remote URL from `.git/config` on first load.

---

## Branch Configuration

The plugin allows you to specify which branch to sync with.

### Default Behaviour

- Defaults to `main` if no branch is configured
- Auto-detects the current branch from your git repository on first load
- Supports any branch name (main, master, develop, feature branches, etc.)

### Branch Selection in Settings

The Branch setting in the plugin settings provides:
- A text input for typing a branch name
- A dropdown list of available local branches
- A "Refresh" button to reload the branch list

### Switching Branches

When changing branches:
1. The plugin checks for uncommitted changes
2. If clean, it switches to the new branch with `git checkout`
3. Updates the setting to remember the branch

> **Warning:** You cannot switch branches with uncommitted changes. Commit or stash your changes first.

---

## Git Directory Configuration

By default, the plugin assumes your vault root is the git repository root. If your git repository is in a subdirectory of your vault, you can specify the path.

### Use Cases

- **Monorepo setups**: Your vault is part of a larger repository
- **Nested structure**: Only a specific folder in your vault is versioned
- **Submodule**: Your notes are in a git submodule

### Configuration

Enter the relative path from your vault root to the directory containing the `.git` folder:

| Vault Structure | Git Directory Setting |
|-----------------|----------------------|
| `vault/.git/` (root) | *(leave empty)* |
| `vault/notes/.git/` | `notes` |
| `vault/subfolder/repo/.git/` | `subfolder/repo` |

> **Note:** Use forward slashes (`/`) for path separators on all platforms.

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

## GPG Signing

If you have GPG commit signing enabled in your git configuration, the plugin may fail with errors like "cannot run gpg: No such file or directory".

### Solution

Enable the "Disable GPG signing" toggle in the plugin settings. This will:
- Skip GPG signing for commits made by the plugin
- Not affect your global git configuration
- Allow commits to succeed without GPG

### Why This Happens

Obsidian's Electron environment may not have access to your GPG binary or keychain. The plugin provides this option to work around this limitation while keeping your global git config intact.

---

## Commit Message Template

Customise how commit messages are formatted using template variables.

### Available Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{hostname}}` | Computer hostname | `DESKTOP-ABC123` |
| `{{date}}` | Date in YYYY-MM-DD format | `2024-03-15` |
| `{{time}}` | Time in HH:MM:SS format | `14:30:45` |
| `{{datetime}}` | Combined date and time | `2024-03-15 14:30:45` |
| `{{iso8601}}` | ISO 8601 timestamp | `2024-03-15T14:30:45.000Z` |
| `{{year}}` | Four-digit year | `2024` |
| `{{month}}` | Two-digit month | `03` |
| `{{day}}` | Two-digit day | `15` |

### Example Templates

| Template | Result |
|----------|--------|
| `{{hostname}} {{date}} {{time}}` | `DESKTOP-ABC123 2024-03-15 14:30:45` |
| `Obsidian sync - {{datetime}}` | `Obsidian sync - 2024-03-15 14:30:45` |
| `vault backup {{iso8601}}` | `vault backup 2024-03-15T14:30:45.000Z` |
| `{{date}} notes update` | `2024-03-15 notes update` |

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
| "GitHub Sync: Updated remote origin URL" | Remote URL changed |
| "GitHub Sync: Added remote origin URL" | New remote configured |
| "GitHub Sync: Pulled X changes" | Changes pulled from remote |
| "GitHub Sync: Pushed on [commit message]" | Changes pushed successfully |
| "GitHub Sync: X commits behind remote..." | Local is behind (on startup check) |
| "GitHub Sync: up to date with remote." | Local matches remote |
| "GitHub Sync: Merge conflicts in: [files]" | Conflicts detected during pull |
| "GitHub Sync: Switched to branch '[name]'" | Branch successfully changed |
| "Found X local branches" | Branch list refreshed |

### Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "No remote URL configured" | Settings not configured | Set repository URL in settings |
| "Vault is not a Git repository" | No `.git` folder | Run `git init` in vault folder |
| "Git binary not found" | Git not installed or not in PATH | Install Git or set binary location |
| "Invalid remote URL or network error" | Bad URL or no internet | Check URL and network connection |
| "Commit failed" | Git commit error | Check git status manually |
| "Commit failed due to GPG signing" | GPG not available | Enable "Disable GPG signing" in settings |
| "Pull failed" | Git pull error | Check for conflicts or network issues |
| "Cannot switch branches with uncommitted changes" | Dirty working tree | Commit or stash changes first |
| "Failed to switch branch" | Git checkout error | Check branch exists and permissions |

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
  "gitDirectory": "",
  "syncinterval": 30,
  "isSyncOnLoad": true,
  "checkStatusOnLoad": true,
  "commitMessageTemplate": "{{hostname}} {{date}} {{time}}",
  "branch": "main",
  "disableGpgSigning": false
}
```
