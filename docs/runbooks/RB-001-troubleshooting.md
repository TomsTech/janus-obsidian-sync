# RB-001: Troubleshooting Guide

## Overview

This runbook covers common issues with JANUS and their solutions.

---

## Issue: "Vault is not a Git repo or git binary cannot be found"

### Symptoms
- Error notice appears when clicking sync
- Sync operation fails immediately

### Diagnosis

1. **Check if vault is a Git repository:**
   ```bash
   cd /path/to/your/vault
   git status
   ```
   If you see "fatal: not a git repository", the vault hasn't been initialised.

2. **Check if Git is installed:**
   ```bash
   git --version
   ```
   If command not found, Git is not installed or not in PATH.

### Resolution

**If vault is not a Git repo:**
```bash
cd /path/to/your/vault
git init
git remote add origin <your-github-url>
```

**If Git is not in PATH:**
1. Install Git from [git-scm.com](https://git-scm.com/)
2. Or specify the Git binary location in plugin settings

---

## Issue: "Invalid remote URL"

### Symptoms
- Sync fails after "Syncing to GitHub remote" notice
- Error mentions invalid remote URL

### Diagnosis

Verify the remote URL format:
- **HTTPS:** `https://github.com/username/repo.git`
- **SSH:** `git@github.com:username/repo.git`

### Resolution

1. Open plugin settings
2. Correct the Remote URL
3. Ensure no trailing/leading spaces
4. Verify repository exists on GitHub

---

## Issue: Merge Conflicts

### Symptoms
- Notice shows "Merge conflicts in: [files]"
- Affected files open automatically

### Diagnosis

Conflicts occur when both local and remote have changes to the same file sections.

### Resolution

1. Review opened conflict files
2. Look for conflict markers:
   ```
   <<<<<<< HEAD
   Your local changes
   =======
   Remote changes
   >>>>>>> origin/main
   ```
3. Edit to keep desired content, remove markers
4. Save files
5. Click sync button again to push resolved conflicts

---

## Issue: Authentication Failures (HTTPS)

### Symptoms
- Sync hangs or fails on push/pull
- Git credential prompt doesn't appear

### Diagnosis

GitHub no longer accepts password authentication. Personal Access Tokens (PAT) are required.

### Resolution

1. Create a PAT at GitHub > Settings > Developer settings > Personal access tokens
2. Grant `repo` scope
3. When prompted for password, use the PAT instead
4. Consider using SSH instead (see below)

---

## Issue: Authentication Failures (SSH)

### Symptoms
- "Permission denied (publickey)" error
- SSH connection fails

### Diagnosis

```bash
ssh -T git@github.com
```

Should respond: "Hi username! You've successfully authenticated..."

### Resolution

1. **Generate SSH key (if needed):**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Add to SSH agent:**
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```

3. **Add public key to GitHub:**
   - Copy contents of `~/.ssh/id_ed25519.pub`
   - GitHub > Settings > SSH and GPG keys > New SSH key

---

## Issue: Auto-Sync Not Working

### Symptoms
- Interval sync doesn't trigger
- No "Auto sync enabled" notice on startup

### Diagnosis

Check settings:
- `syncinterval` must be a positive integer (1 or greater)
- Restart Obsidian after changing interval

### Resolution

1. Open plugin settings
2. Set "Auto sync at interval" to desired minutes (e.g., `30`)
3. Restart Obsidian
4. Verify "Auto sync enabled" notice appears

---

## Issue: Git Not Found on macOS

### Symptoms
- Git commands fail despite Git being installed
- Common with Homebrew installations

### Diagnosis

Obsidian may not inherit shell PATH. Check Git location:
```bash
which git
```

### Resolution

Add Git binary location to plugin settings:
- Homebrew (Apple Silicon): `/opt/homebrew/bin/`
- Homebrew (Intel): `/usr/local/bin/`
- Xcode Command Line Tools: `/usr/bin/`

---

## Issue: Git Not Found on Windows

### Symptoms
- Git commands fail
- "git binary cannot be found" error

### Diagnosis

Check if Git is in PATH:
```cmd
where git
```

### Resolution

Add Git binary location to plugin settings:
- Default install: `C:\Program Files\Git\bin\`
- Portable Git: `[install-path]\bin\`

---

## Issue: Changes Not Pushing

### Symptoms
- Sync completes but changes don't appear on GitHub
- "Working branch clean" when changes exist

### Diagnosis

1. Check Git status in terminal:
   ```bash
   cd /path/to/vault
   git status
   ```

2. Check if files are ignored:
   ```bash
   git check-ignore -v [filename]
   ```

### Resolution

- Ensure `.gitignore` isn't excluding your files
- Verify file changes are saved before syncing
- Check for hidden characters in filenames

---

## Escalation

If issues persist:

1. Check [GitHub Issues](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues) for known problems
2. Enable Obsidian Developer Console (Ctrl/Cmd + Shift + I) to view detailed errors
3. Open a new issue with:
   - Obsidian version
   - Plugin version
   - Operating system
   - Error messages from console
   - Steps to reproduce
