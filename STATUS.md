# Custom Claude Code Node - Installation Status

**Date**: 2025-11-05
**Current Status**: ❌ NOT WORKING
**Issue**: n8n UI shows "Install this node to use it" - node not recognized

---

## Problem Summary

Created a custom n8n node for Claude Code integration, but n8n's Community Packages system prevents it from loading because:
- Package is not published to npm
- n8n validates community packages against npm registry
- Catch-22: Can't use as community package (not on npm) OR as custom node (workflow references it as packaged node)

---

## What We Tried

### Attempt 1: Install from GitHub as Community Package
**Method**: `npm install git+https://github.com/bbleak-repo/n8n-nodes-claudecode-custom.git`

**Result**: ❌ Failed
**Error**: "Error loading package '@xand/n8n-nodes-claudecode': Package version does not exist"

**Why it failed**: n8n's Community Packages system checks npm registry on every startup. Our package isn't published to npm, so validation fails.

**Files**:
- Installed to: `/home/node/.n8n/nodes/node_modules/@xand/n8n-nodes-claudecode/`
- Package registered in: `/home/node/.n8n/nodes/package.json`

---

### Attempt 2: Register in n8n Database
**Method**: Manually insert records into PostgreSQL `installed_packages` and `installed_nodes` tables

**Result**: ❌ Failed
**Error**: Same validation error

**Why it failed**: Registering in database triggers n8n to validate package against npm on every startup.

**SQL Commands**:
```sql
-- Added records to:
INSERT INTO installed_packages (packageName, installedVersion, authorName, authorEmail)
VALUES ('@xand/n8n-nodes-claudecode', '1.0.0', 'Xand', 'your-email@example.com');

INSERT INTO installed_nodes (name, type, latestVersion, package)
VALUES ('@xand/n8n-nodes-claudecode.claudeCodeCustom', '@xand/n8n-nodes-claudecode.claudeCodeCustom', 1, '@xand/n8n-nodes-claudecode');

-- Later removed:
DELETE FROM installed_packages WHERE packageName = '@xand/n8n-nodes-claudecode';
```

---

### Attempt 3: Copy to Custom Nodes Directory
**Method**: Copy node files to `/home/node/.n8n/custom/`

**Result**: ❌ Failed
**Error**: "This node is not currently installed. It is either from a newer version of n8n, a custom node, or has an invalid structure"

**Why it failed**: Workflow JSON references node as `@xand/n8n-nodes-claudecode.claudeCodeCustom` (packaged node), triggering Community Packages validation. Custom nodes should NOT have package name prefix.

**Files Copied**:
```
/home/node/.n8n/custom/
├── package.json
├── index.js
├── nodes/
│   └── ClaudeCode/
│       └── ClaudeCode.node.js
└── node_modules/
    └── @anthropic-ai/
        └── claude-code/
```

---

### Attempt 4: Update Node Type and Workflow
**Method**:
1. Changed node type from `claudeCodeCustom` to `claudeCode`
2. Updated workflow JSON to use `claudeCode` instead of `@xand/n8n-nodes-claudecode.claudeCodeCustom`

**Result**: ❌ Failed
**Error**: "Unrecognized node type: claudeCode.undefined" during import, then same install error in UI

**Why it failed**: n8n doesn't appear to scan `/home/node/.n8n/custom/` for custom nodes, OR the file structure doesn't match expectations.

**Changes Made**:
```javascript
// Node definition (ClaudeCode.node.js)
name: 'claudeCode'  // Changed from 'claudeCodeCustom'

// Workflow JSON
"type": "claudeCode"  // Changed from "@xand/n8n-nodes-claudecode.claudeCodeCustom"
```

---

## Technical Details

### Package Structure
```
@xand/n8n-nodes-claudecode/
├── package.json
│   └── n8n.nodes: ["nodes/ClaudeCode/ClaudeCode.node.js"]
├── index.js
│   └── exports: { ClaudeCode }
├── nodes/
│   └── ClaudeCode/
│       └── ClaudeCode.node.js
│           ├── class ClaudeCode
│           ├── name: 'claudeCode'
│           ├── displayName: 'Claude Code'
│           └── execute() method using Claude CLI
└── dependencies:
    └── @anthropic-ai/claude-code: ^2.0.0
```

### Implementation Change History

**Original Design** (Failed):
- Used `require('@anthropic-ai/claude-code')` to import SDK
- Called `query()` function directly

**Problem Found**: `@anthropic-ai/claude-code` is CLI-only, no programmatic SDK

**Current Design**:
- Uses `child_process.spawn()` to call `claude` CLI
- Passes prompt via stdin
- Collects output from stdout

**Implementation**:
```javascript
const claudePath = path.join(__dirname, '../../node_modules/.bin/claude');
const claude = spawn(claudePath, args, { env: process.env, shell: false });
claude.stdin.write(prompt + '\n');
// Collect stdout...
```

### Workflow Details
- **Workflow ID**: `1pulyFlFzgLZ4k9U`
- **Name**: "Terry Stage 4 - Custom Claude Code"
- **Node ID**: `claude-code-analysis`
- **Current Type**: `claudeCode` (after update)
- **Original Type**: `@xand/n8n-nodes-claudecode.claudeCodeCustom`

---

## Root Cause Analysis

### Why This Is So Difficult

1. **Community Packages System**: n8n tracks installed community packages in PostgreSQL and validates them against npm
2. **Workflow References**: Existing workflow references the node as a community package (`@packageName.nodeType`)
3. **No Hybrid Mode**: n8n doesn't support "unverified community packages" - it's either:
   - Published to npm (verified)
   - OR a local custom node (no package prefix)
4. **Custom Node Discovery**: Unclear if/how n8n scans `/home/node/.n8n/custom/` directory

### The Catch-22

**Option A: Community Package**
- ✅ Can use workflow as-is
- ❌ Must be published to npm
- ❌ We don't want to publish publicly

**Option B: Custom Node**
- ✅ No npm required
- ❌ Must update workflow to remove package prefix
- ❌ n8n may not be scanning custom directory
- ❌ May need specific file structure we don't know

---

## Current Installation State

### In Container
```bash
# Community package (not working)
/home/node/.n8n/nodes/node_modules/@xand/n8n-nodes-claudecode/
├── Installed via: npm install git+https://github.com/...
├── Status: Installed but triggers validation error
└── Database: Not registered (removed from installed_packages)

# Custom node (not working)
/home/node/.n8n/custom/
├── Status: Files copied, permissions fixed
├── Ownership: node:node
└── Discovery: Unknown if n8n scans this directory
```

### On GitHub
```bash
Repository: https://github.com/bbleak-repo/n8n-nodes-claudecode-custom
Status: Public
Commits: 5
- Initial commit
- Security analysis
- GitHub setup
- Fix: Use Claude CLI instead of SDK
- Fix: Use full path to claude CLI binary
```

### In Local Development
```bash
Path: /Users/xand/Documents/Projects/n8n-nodes-claudecode-custom/
Files: All source files updated with CLI implementation
```

---

## Known Issues

### Issue 1: Claude CLI Authentication
**Problem**: `.claude` directory not mounted in n8n container
**Impact**: Even if node works, Claude CLI won't be authenticated
**Fix Needed**: Add volume mount: `/Users/xand/.claude:/root/.claude:ro`

### Issue 2: Missing SDK
**Problem**: `@anthropic-ai/claude-code` package doesn't export programmatic SDK
**Status**: ✅ FIXED - Rewrote to use CLI instead
**Commits**:
- b614d7c: "Fix: Use Claude CLI instead of non-existent SDK"
- 76fb664: "Fix: Use full path to claude CLI binary"

### Issue 3: n8n Custom Node Discovery
**Problem**: n8n doesn't recognize node in `/home/node/.n8n/custom/`
**Status**: ❌ UNSOLVED
**Possible Causes**:
- Wrong directory structure
- Missing configuration
- n8n Docker image doesn't support custom directory
- Needs environment variable

---

## Possible Solutions (Untested)

### Solution 1: Build Custom n8n Docker Image
**Approach**: Create Dockerfile that pre-installs node

```dockerfile
FROM n8nio/n8n:latest
COPY n8n-nodes-claudecode-custom /tmp/custom-node
RUN cd /tmp/custom-node && npm install && npm run build
RUN cd /usr/local/lib/node_modules/n8n && npm install /tmp/custom-node
```

**Pros**:
- Official approach per n8n docs
- Node baked into image

**Cons**:
- Must rebuild image for updates
- More complex deployment

---

### Solution 2: Use Execute Command Node Instead
**Approach**: Skip custom node entirely, call Claude CLI directly from workflow

```javascript
// Execute Command node
Command: /home/node/.n8n/nodes/node_modules/.bin/claude --model sonnet
Stdin: {{ $json.prompt }}
```

**Pros**:
- No custom node needed
- Works immediately

**Cons**:
- Less elegant
- Harder to configure
- No parameter validation

---

### Solution 3: Publish to Private npm Registry
**Approach**: Set up private npm registry (Verdaccio) or use GitHub Packages

**Pros**:
- Works with n8n Community Packages system
- Can keep private

**Cons**:
- Requires infrastructure
- GitHub Packages requires authentication
- Overkill for single node

---

### Solution 4: Fork n8n-nodes-base
**Approach**: Add node to n8n-nodes-base and build custom n8n

**Pros**:
- Native integration

**Cons**:
- Extremely complex
- Hard to maintain

---

## Next Steps (Recommended)

### Immediate: Try Execute Command Workaround
1. Create new workflow node
2. Use Execute Command to call Claude CLI
3. Test if it works
4. Compare complexity vs custom node

### Short-term: Custom Docker Image
1. Create Dockerfile based on n8n docs
2. Build image with node pre-installed
3. Test installation
4. Document process

### Long-term: Publish to npm
1. Make repository public (already done)
2. Publish to npm as public package
3. Install via n8n UI
4. Monitor for security/maintenance issues

---

## References

### Documentation
- n8n Custom Nodes: https://docs.n8n.io/integrations/creating-nodes/
- n8n Private Nodes: https://docs.n8n.io/integrations/creating-nodes/deploy/install-private-nodes/
- n8n Starter: https://github.com/n8n-io/n8n-nodes-starter

### Our Resources
- GitHub: https://github.com/bbleak-repo/n8n-nodes-claudecode-custom
- Package: `@xand/n8n-nodes-claudecode`
- Workflow: Terry Stage 4 (ID: 1pulyFlFzgLZ4k9U)

### Related Files
- SECURITY-ANALYSIS.md - Security audit
- FEATURE-COMPARISON.md - Original vs custom comparison
- INSTALLATION-GUIDE.md - Installation methods
- GITHUB-SETUP.md - GitHub setup instructions

---

## Environment Details

**n8n Version**: 1.118.1
**Node.js Version**: 22.21.0
**Docker Container**: n8nlab_n8n
**Database**: PostgreSQL (n8nlab_postgres)
**OS**: macOS (host), Alpine Linux (container)

---

## Commit History

```
76fb664 - Fix: Use full path to claude CLI binary
b614d7c - Fix: Use Claude CLI instead of non-existent SDK
692745e - Fix: Update Claude Code SDK dependency to v2.0.0
[3 earlier commits] - Initial implementation, docs
```

---

## Questions to Answer

1. Does n8n actually scan `/home/node/.n8n/custom/` in Docker containers?
2. What is the EXACT file structure needed for custom nodes?
3. Do custom nodes need to be "built" (TypeScript → JavaScript)?
4. Is there an environment variable to enable custom node loading?
5. Should custom nodes have package.json or just .node.js files?

---

**Last Updated**: 2025-11-05 18:00 PST
**Status**: Blocked - awaiting solution decision
