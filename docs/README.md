# JANUS: Obsidian GitHub Sync Plugin

A lightweight Obsidian plugin for syncing your vault to a GitHub repository, enabling seamless cross-device synchronisation.

## Overview

JANUS provides a simple, reliable way to backup and sync your Obsidian vault using Git and GitHub. Unlike complex Git integrations, this plugin focuses on one thing: keeping your notes synchronised across devices with minimal configuration.

## Key Features

- **One-Click Sync**: Ribbon icon and command palette integration for instant syncing
- **Auto-Sync on Startup**: Optionally sync when Obsidian opens if changes are detected
- **Interval-Based Auto-Sync**: Configure automatic syncing at regular intervals
- **Conflict Detection**: Identifies merge conflicts and opens affected files for resolution
- **SSH & HTTPS Support**: Works with both authentication methods

## Quick Start

1. Install the plugin from Obsidian Community Plugins
2. Configure your GitHub repository URL in settings
3. Click the GitHub ribbon icon to sync

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture Overview](architecture/README.md) | System design and component structure |
| [API Reference](api/README.md) | Settings interface and configuration options |
| [Troubleshooting Runbook](runbooks/RB-001-troubleshooting.md) | Common issues and solutions |

## Architecture Decision Records

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](architecture/adr/ADR-001-simple-git.md) | Use simple-git for Git operations | Accepted |

## Requirements

- Obsidian v0.15.0 or later
- Git installed and accessible via PATH (or configured binary location)
- GitHub repository (public or private)

## Tech Stack

- **Language**: TypeScript
- **Build Tool**: esbuild
- **Git Library**: simple-git
- **Platform**: Obsidian Plugin API
