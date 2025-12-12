# JANUS: GitHub Sync for Obsidian

A feature-rich Obsidian plugin for syncing your vault to GitHub with a visual source control interface, diff views, and seamless cross-device synchronisation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.0.0-green.svg)

## Features

### Core Sync
- **One-click sync** - Pull from remote and push local changes with a single click
- **Auto-sync** - Configure automatic synchronisation at your preferred interval
- **Custom commit messages** - Template-based commit messages with variables

### Source Control Panel
- **Visual file status** - See all changed, staged, and untracked files
- **Individual file staging** - Stage or unstage specific files
- **Discard changes** - Revert unwanted changes with confirmation
- **Commit from panel** - Write commit messages and commit directly

### Status Bar
- **Branch indicator** - Always see which branch you're on
- **Quick access** - Click to open the Source Control panel

### Additional Features
- **Branch switching** - Work with any branch, not just main
- **Git directory support** - Sync a subdirectory instead of the entire vault
- **GPG signing toggle** - Disable GPG signing if it causes issues
- **Custom PATH support** - Add directories for Git LFS and other extensions

## Installation

### From Obsidian Community Plugins
1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "JANUS"
4. Install and enable the plugin

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Create a folder called `janus-sync` in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into this folder
4. Enable the plugin in Obsidian's Community Plugins settings

## Setup

### Prerequisites
- Your vault must be initialised as a Git repository (`git init`)
- Git must be installed and accessible from your system PATH
- A GitHub repository to sync with (public or private)

### Configuration
1. Go to Settings > JANUS
2. Paste your GitHub repository URL (HTTPS or SSH format)
3. (Optional) Configure branch, commit message template, and other settings

### First Sync
Click the JANUS icon in the left ribbon or use the command palette (`Ctrl/Cmd + P` > "Sync with Remote").

If prompted, authenticate with GitHub:
- **HTTPS**: Enter credentials when prompted (or use a credential manager)
- **SSH**: Ensure your SSH key is configured with GitHub

## Commands

| Command | Description |
|---------|-------------|
| `Sync with Remote` | Pull changes and push local commits |
| `Open Source Control Panel` | Open the source control sidebar |
| `Stage All Changes` | Stage all modified files |
| `Commit Staged Changes` | Commit with a custom message |

## Settings

| Setting | Description |
|---------|-------------|
| **Remote URL** | Your GitHub repository URL |
| **Branch** | Branch to sync with (default: main) |
| **Git Directory** | Subdirectory containing .git folder |
| **Git Binary Location** | Path to Git if not in system PATH |
| **Additional PATH** | Extra directories for Git extensions |
| **Check Status on Startup** | Check remote status when Obsidian opens |
| **Auto Sync on Startup** | Automatically sync if behind remote |
| **Auto Sync Interval** | Minutes between automatic syncs (0 = disabled) |
| **Commit Message Template** | Custom format with variables |
| **Disable GPG Signing** | Skip GPG signing for plugin commits |

### Commit Message Variables

| Variable | Example |
|----------|---------|
| `{{hostname}}` | DESKTOP-ABC123 |
| `{{date}}` | 2024-03-15 |
| `{{time}}` | 14:30:45 |
| `{{datetime}}` | 2024-03-15 14:30:45 |
| `{{iso8601}}` | 2024-03-15T14:30:45.000Z |
| `{{year}}` | 2024 |
| `{{month}}` | 03 |
| `{{day}}` | 15 |

## Troubleshooting

### "Vault is not a Git repository"
Run `git init` in your vault folder to initialise it as a Git repository.

### "Git binary not found"
- Install Git from [git-scm.com](https://git-scm.com/)
- Or set the Git binary location in plugin settings

### "GPG signing failed"
Enable "Disable GPG signing" in plugin settings if you don't need signed commits.

### Merge Conflicts
When conflicts occur, the plugin will list the conflicted files. Open them, resolve the conflicts (look for `<<<<<<<`, `=======`, `>>>>>>>` markers), save, and sync again.

## Development

```bash
# Install dependencies
npm install

# Build for development (watch mode)
npm run dev

# Build for production
npm run build
```

## Credits

JANUS is a fork of [Obsidian-GitHub-Sync](https://github.com/kevinmkchin/Obsidian-GitHub-Sync) by Kevin Chin, enhanced with additional features inspired by the Obsidian community.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- [Report Issues](https://github.com/TomsTech/janus-obsidian-sync/issues)
- [Feature Requests](https://github.com/TomsTech/janus-obsidian-sync/issues/new)

---

## Part of Life OS

JANUS is a core component of the [Life OS](https://github.com/TomsTech/life-os) productivity stack, providing the sync layer between Obsidian and GitHub.

```
🗃️ Obsidian Vault → 🔱 JANUS → 🐙 GitHub → ⚙️ n8n Webhooks
```

### How it fits

| Component | Role |
|-----------|------|
| **Obsidian** | Source of truth for notes & tasks |
| **JANUS** | Syncs vault to private GitHub repo |
| **GitHub Webhooks** | Triggers n8n automation on push |
| **n8n** | Parses tasks, syncs to Todoist/Google Calendar |

See the full architecture: [Life OS System Diagram](https://github.com/TomsTech/life-os/blob/main/docs/architecture/system-diagram.md)

### Related Projects

- [Life OS](https://github.com/TomsTech/life-os) - Full productivity stack documentation
- [TimeTree Exporter](https://github.com/TomsTech/timetree-calendar-exporter) - Family calendar sync

---

Made with care by [TomsTech](https://github.com/TomsTech)
