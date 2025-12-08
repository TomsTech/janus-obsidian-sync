# ADR-001: Use simple-git for Git Operations

## Status

Accepted

## Date

2024-01-01

## Context

JANUS needs to perform Git operations (status, add, commit, fetch, pull, push) from within an Obsidian plugin running in an Electron environment.

Options considered:

1. **simple-git** - Node.js wrapper around the Git CLI
2. **isomorphic-git** - Pure JavaScript Git implementation
3. **nodegit** - Native libgit2 bindings
4. **Direct child_process** - Spawn Git commands manually

## Decision

We chose **simple-git** as the Git operations library.

## Rationale

### Why simple-git

- **Simplicity**: Clean, promise-based API that wraps familiar Git CLI commands
- **Reliability**: Uses the actual Git binary, ensuring 100% compatibility with Git behaviour
- **Minimal footprint**: Small dependency with no native compilation required
- **Active maintenance**: Well-maintained with regular updates
- **Error handling**: Provides clear error messages from Git itself

### Why not alternatives

| Alternative | Reason for Rejection |
|-------------|---------------------|
| isomorphic-git | Limited support for some Git features; would need to handle edge cases ourselves |
| nodegit | Native bindings cause Electron compatibility issues; complex build requirements |
| Direct child_process | More code to maintain; would need to parse Git output manually |

## Consequences

### Positive

- Users get exact Git behaviour they expect
- Easy to debug since operations map directly to Git commands
- Git's own authentication (SSH, credential helpers) works out of the box
- Small bundle size impact

### Negative

- Requires Git to be installed on the user's system
- Need to handle cases where Git isn't in PATH (mitigated by `gitLocation` setting)
- Dependent on external process spawning (works fine in Electron)

### Risks

- Git must be installed - users without Git will see errors (documented in README)
- Different Git versions may have slight behavioural differences (minimal risk in practice)

## References

- [simple-git npm](https://www.npmjs.com/package/simple-git)
- [simple-git GitHub](https://github.com/steveukx/git-js)
