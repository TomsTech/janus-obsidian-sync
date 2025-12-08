# JANUS Backlog

Feature requests and improvements sourced from [upstream issues](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues).

## Priority Levels

- **P0**: Critical bugs affecting core functionality
- **P1**: High-value features with strong user demand
- **P2**: Quality of life improvements
- **P3**: Nice-to-have features

---

## Completed

### ✅ Fix Upstream Branch Reset Issue
**Source**: [#30](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/30)
**Status**: **COMPLETED**

**Problem**: After syncing with the plugin, CLI git operations fail with `fatal: The current branch main has no upstream branch`.

**Solution**: Changed from `removeRemote`/`addRemote` to `git remote set-url` which preserves upstream tracking. Also only updates remote when URL actually changes.

---

### ✅ Fix Conflict Files Not Displayed
**Source**: [#13](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/13)
**Status**: **COMPLETED**

**Problem**: When merge conflicts occur, the notice shows "Merge conflicts in:" but doesn't list the actual filenames.

**Solution**: Improved conflict detection with proper null checking and better error handling. Files now display with bullet points and longer notice duration (15 seconds).

---

### ✅ Custom Commit Messages
**Source**: [#21](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/21)
**Status**: **COMPLETED**

**Request**: Allow users to customise the commit message format.

**Solution**: Added `commitMessageTemplate` setting with support for variables:
- `{{hostname}}`, `{{date}}`, `{{time}}`, `{{datetime}}`, `{{iso8601}}`
- `{{year}}`, `{{month}}`, `{{day}}`
- Default: `{{hostname}} {{date}} {{time}}`

---

### ✅ Respect .git/config Settings
**Source**: [#20](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/20)
**Status**: **COMPLETED**

**Request**: Don't overwrite existing git configuration.

**Solution**:
- Plugin now reads existing remote URL from `.git/config` on first load
- Auto-populates the Remote URL setting field
- Only updates remote when URL actually changes (preserves custom configs)

---

### ✅ Capitalise "URL" in Messages
**Source**: [#29](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/29)
**Status**: **COMPLETED**

**Solution**: Changed "url" to "URL" for consistency.

---

### ✅ Better Error Messages
**Source**: [#2](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/2), [#32](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/32)
**Status**: **COMPLETED**

**Problem**: "Vault is not a Git repo or git binary cannot be found" is too vague.

**Solution**: Separate, specific error messages:
- "No remote URL configured" - with settings guidance
- "Vault is not a Git repository" - with `git init` instructions
- "Git binary not found at [path]" - with install/settings guidance
- "Git error - [actual error]" - for other issues

---

### ✅ Branch Switching Support
**Source**: [#31](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/31)
**Status**: **COMPLETED**

**Request**: Ability to switch branches within the plugin for team/enterprise use cases.

**Solution**:
- Added `branch` setting with text input and datalist dropdown
- Auto-detects current branch from git on first load
- Syncs to any branch (not just `main`)
- Refresh button to reload branch list
- Warning when switching with uncommitted changes
- Helper methods: `getCurrentBranch()`, `getLocalBranches()`, `switchBranch()`

---

### ✅ Git Directory Selection
**Source**: [#27](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/27)
**Status**: **COMPLETED**

**Request**: Allow syncing a subdirectory instead of the entire vault.

**Solution**:
- Added `gitDirectory` setting to specify a subdirectory containing the `.git` folder
- All git operations now use the configured directory (or vault root if empty)
- Useful for monorepo setups, nested structures, and submodules
- Helper method `getGitBasePath()` centralises path resolution

---

## P2 - Quality of Life (Remaining)

### ✅ GPG Commit Signing Support
**Source**: [#7](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/7)
**Status**: **COMPLETED**

**Problem**: Plugin fails when user has GPG signing enabled. Error: `cannot run gpg: No such file or directory`

**Solution**:
- Added `disableGpgSigning` toggle setting
- When enabled, commits use `-c commit.gpgsign=false` to skip signing
- Helpful error message when GPG signing fails, directing users to the setting
- Does not modify global git configuration

---

### PATH Environment Variable Support
**Source**: [#28](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/28)
**Status**: Open

**Problem**: Git LFS and other git extensions fail silently because their binaries aren't in PATH.

**Proposed Implementation**:
- Add setting to specify additional PATH directories
- Or inherit system PATH properly in Electron environment

**Complexity**: Medium
**Impact**: Medium

---

### Collaborator Authentication
**Source**: [#6](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/6)
**Status**: Open

**Problem**: When plugin sets remote URL with embedded credentials, collaborators can't authenticate.

**Proposed Implementation**:
- Use credential helper instead of embedded credentials
- Document SSH key setup for collaborators

**Complexity**: Medium
**Impact**: Medium

---

## P3 - Future Considerations

### Mobile Support
**Source**: [#12](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/12), [#23](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/23)
**Status**: Multiple requests

**Challenge**: Mobile Obsidian doesn't have access to git binary. Would require:
- isomorphic-git (pure JS git implementation) instead of simple-git
- Significant architectural changes

**Recommendation**: Out of scope for current architecture. Consider as separate plugin or major version.

---

## Rejected / Won't Fix

- **#26** - Closed by user
- **#25** - Duplicate of mobile support
- **#22** - User environment issue
- **#18** - Linux is already supported

---

## Summary

| Priority | Total | Completed | Remaining |
|----------|-------|-----------|-----------|
| P0 | 2 | 2 | 0 |
| P1 | 4 | 4 | 0 |
| P2 | 5 | 3 | 2 |
| P3 | 1 | 0 | 1 |
| **Total** | **12** | **9** | **3** |

### What's New in This Release

1. **Branch switching support** - Sync to any branch, not just main
2. **Git directory selection** - Sync a subdirectory instead of the entire vault
3. **GPG signing workaround** - Option to disable GPG signing for plugin commits
4. **Custom commit messages** - Configure your own commit message format with variables
5. **Preserved upstream tracking** - CLI git commands work correctly after sync
6. **Auto-detect remote URL** - Plugin reads existing git config on first load
7. **Auto-detect branch** - Plugin reads current branch on first load
8. **Better conflict display** - Conflicted files now shown with bullet points
9. **Improved error messages** - Specific, actionable error messages for each failure type
10. **Consistent messaging** - "URL" properly capitalised throughout
