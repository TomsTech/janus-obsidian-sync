# JANUS Backlog

Feature requests and improvements sourced from [upstream issues](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues).

## Priority Levels

- **P0**: Critical bugs affecting core functionality
- **P1**: High-value features with strong user demand
- **P2**: Quality of life improvements
- **P3**: Nice-to-have features

---

## P0 - Critical

### Fix Upstream Branch Reset Issue
**Source**: [#30](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/30)
**Status**: Open

**Problem**: After syncing with the plugin, CLI git operations fail with `fatal: The current branch main has no upstream branch`. Users must manually run `git push --set-upstream origin main` after each plugin sync.

**Root Cause**: The plugin removes and re-adds the remote on every sync (`git.removeRemote('origin')` then `git.addRemote('origin', remote)`), which breaks the upstream tracking configuration.

**Proposed Fix**:
- Only update remote URL if it has changed
- Or preserve upstream tracking after remote operations
- Or use `git remote set-url origin <url>` instead of remove/add

**Complexity**: Low
**Impact**: High - breaks CLI workflow for all users

---

### Fix Conflict Files Not Displayed
**Source**: [#13](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/13)
**Status**: Open

**Problem**: When merge conflicts occur, the notice shows "Merge conflicts in:" but doesn't list the actual filenames.

**Root Cause**: The `conflictStatus.conflicted` array may be empty or the loop isn't iterating correctly.

**Location**: `main.ts:104-108`

**Proposed Fix**: Debug the conflict detection logic and ensure filenames are properly extracted from git status.

**Complexity**: Low
**Impact**: High - users can't identify which files have conflicts

---

## P1 - High Priority Features

### Custom Commit Messages
**Source**: [#21](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/21)
**Status**: Open (4 comments)

**Request**: Allow users to customise the commit message format instead of the default `hostname YYYY-M-D:H:M:S`.

**Proposed Implementation**:
- Add setting for commit message template
- Support variables: `{{hostname}}`, `{{date}}`, `{{time}}`, `{{datetime}}`, `{{iso8601}}`
- Example: `"Obsidian sync - {{datetime}}"` or `"vault backup {{iso8601}}"`
- Keep current format as default

**Complexity**: Low
**Impact**: Medium - frequently requested feature

---

### Branch Switching Support
**Source**: [#31](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/31)
**Status**: Open

**Request**: Ability to switch branches within the plugin for team/enterprise use cases where direct pushes to main aren't allowed.

**Use Case**: Teams using Obsidian for documentation need to work on feature branches before merging to main via PR.

**Proposed Implementation**:
- Add branch selector dropdown in settings or ribbon menu
- Show current branch in status
- Commands: "Switch Branch", "Create Branch"
- Warning when switching with uncommitted changes

**Complexity**: Medium
**Impact**: High for team use cases

---

### Respect .git/config Settings
**Source**: [#20](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/20)
**Status**: Open

**Request**: Don't overwrite existing git configuration. Respect settings like custom SSH commands and existing remote URLs.

**Problems**:
1. Remote URL field overwrites existing config on new install
2. Custom `core.sshCommand` in `.git/config` is not respected
3. Plugin removes/re-adds remote breaking custom configs

**Proposed Implementation**:
- Read existing remote URL on first load, populate setting field
- Don't modify remote if URL matches existing config
- Ensure simple-git respects local git config

**Complexity**: Medium
**Impact**: High for users with custom git setups

---

### Git Directory Selection
**Source**: [#27](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/27)
**Status**: Open (has implementation PR ready)

**Request**: Allow syncing a subdirectory instead of the entire vault.

**Use Case**: Users with blog setups who only want to commit published posts, not drafts.

**Proposed Implementation**:
- Dropdown to select subdirectory within vault
- Default to vault root
- Save selection in settings

**Note**: [Feature branch exists](https://github.com/socra167/Obsidian-GitHub-Sync/tree/feat/select-git-directory) - consider merging

**Complexity**: Low (mostly done)
**Impact**: Medium

---

## P2 - Quality of Life

### GPG Commit Signing Support
**Source**: [#7](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/7)
**Status**: Open (2 comments)

**Problem**: Plugin fails when user has GPG signing enabled in git config. Error: `cannot run gpg: No such file or directory`

**Proposed Implementation**:
- Add setting for GPG binary location (similar to git binary setting)
- Or add option to disable signing for plugin commits
- Or detect and skip signing gracefully

**Complexity**: Medium
**Impact**: Medium - affects security-conscious users

---

### PATH Environment Variable Support
**Source**: [#28](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/28)
**Status**: Open

**Problem**: Git LFS and other git extensions fail silently because their binaries aren't in PATH.

**Proposed Implementation**:
- Add setting to specify additional PATH directories
- Or inherit system PATH properly in Electron environment
- Add verbose logging option to debug binary resolution issues

**Complexity**: Medium
**Impact**: Medium - affects Git LFS users

---

### Capitalise "URL" in Messages
**Source**: [#29](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/29)
**Status**: Open

**Request**: Change "Successfully set remote origin url" to "Successfully set remote origin URL" for consistency.

**Location**: `main.ts:90`

**Complexity**: Trivial
**Impact**: Low - cosmetic

---

### Better Error Messages
**Source**: [#2](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/2), [#32](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/32)
**Status**: Multiple issues

**Problem**: "Vault is not a Git repo or git binary cannot be found" is too vague. Users can't diagnose whether it's a git binary issue, missing .git folder, or permission problem.

**Proposed Implementation**:
- Separate error messages for each failure mode:
  - "Git binary not found at [path]. Check git binary location setting."
  - "No .git folder found. Run 'git init' in your vault first."
  - "Git command failed: [actual error]"
- Add troubleshooting link to error messages

**Complexity**: Low
**Impact**: High - reduces support burden

---

### Collaborator Authentication
**Source**: [#6](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/6)
**Status**: Open (5 comments)

**Problem**: When plugin sets remote URL with embedded credentials, collaborators can't authenticate.

**Root Cause**: URL format `https://Username.gitKey@github.com/Owner/Name.git` only works for the repo owner.

**Proposed Implementation**:
- Use credential helper instead of embedded credentials
- Or support per-user credential configuration
- Document SSH key setup for collaborators

**Complexity**: Medium
**Impact**: Medium - affects shared vaults

---

## P3 - Future Considerations

### Mobile Support
**Source**: [#12](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/12), [#23](https://github.com/kevinmkchin/Obsidian-GitHub-Sync/issues/23)
**Status**: Multiple requests

**Request**: Support for iOS and Android.

**Challenge**: Mobile Obsidian doesn't have access to git binary. Would require:
- isomorphic-git (pure JS git implementation) instead of simple-git
- Or integration with mobile git apps (Working Copy, etc.)
- Significant architectural changes

**Complexity**: High
**Impact**: High - frequently requested but major undertaking

**Recommendation**: Out of scope for current architecture. Consider as separate plugin or major version.

---

## Rejected / Won't Fix

### Issue #26 - NEVER MIND
Closed by user.

### Issue #25 - Support Phone ANDROID
Duplicate of mobile support request.

### Issue #22 - Plugin Taking Long to Load
Closed - likely user environment issue.

### Issue #18 - Run Linux
Closed - Linux is already supported.

---

## Implementation Notes

### Quick Wins (can ship immediately)
1. Capitalise "URL" in message (#29)
2. Better error messages (#2, #32)
3. Fix conflict file display (#13)

### Medium Effort (1-2 days)
1. Custom commit messages (#21)
2. Fix upstream branch reset (#30)
3. Respect .git/config (#20)
4. Merge git directory selection PR (#27)

### Larger Features (needs design)
1. Branch switching (#31)
2. GPG signing support (#7)
3. PATH environment support (#28)
4. Collaborator authentication (#6)

### Out of Scope
1. Mobile support - requires architectural rewrite
