# Installation Guide

## Current Status

✅ **Installed**: Package is already installed in your n8n instance
✅ **Working**: Terry Stage 4 workflow is using it successfully

---

## Why the n8n UI Error Occurred

When you tried installing via **Settings → Community Nodes**, you saw:
```
Error: Package version does not exist
```

**Why**: n8n's UI installer expects packages from:
1. **npm registry** (e.g., `@xand/n8n-nodes-claudecode` published to npmjs.com)
2. **Public GitHub** (e.g., `https://github.com/username/repo`)

Your package is currently:
- ✅ Created locally
- ✅ Installed via filesystem
- ❌ **NOT on npm**
- ❌ **NOT on GitHub** (yet)

---

## Installation Methods

### Method 1: Current (Already Done) ✅

**Status**: WORKING

Package installed via filesystem:
```bash
# Already completed
docker cp /Users/xand/Documents/Projects/n8n-nodes-claudecode-custom n8nlab_n8n:/tmp/
docker exec -w /home/node/.n8n/nodes n8nlab_n8n npm install /tmp/claudecode-custom
docker exec n8nlab_n8n chown -R node:node /home/node/.n8n/nodes/
docker restart n8nlab_n8n
```

**Pros**:
- Works immediately
- No external dependencies
- Full control

**Cons**:
- Manual process
- Need to repeat on other n8n instances
- Can't use n8n UI installer

---

### Method 2: Private GitHub (Recommended)

**Steps**:

1. **Create Private GitHub Repository**:
   - Go to https://github.com/new
   - Name: `n8n-nodes-claudecode-custom`
   - Visibility: **Private** (keep it yours!)
   - Don't initialize with README (you already have one)

2. **Push Your Code**:
   ```bash
   cd /Users/xand/Documents/Projects/n8n-nodes-claudecode-custom

   # Add remote
   git remote add origin https://github.com/YOUR_USERNAME/n8n-nodes-claudecode-custom.git

   # Push
   git branch -M main
   git push -u origin main
   ```

3. **Install in n8n** (any instance):

   **Via npm**:
   ```bash
   cd /home/node/.n8n/nodes
   npm install git+https://github.com/YOUR_USERNAME/n8n-nodes-claudecode-custom.git
   ```

   **Or via n8n UI**:
   - Settings → Community Nodes
   - Enter: `https://github.com/YOUR_USERNAME/n8n-nodes-claudecode-custom`
   - Click Install
   - Restart n8n

**Pros**:
- Easy to share across your instances
- Version controlled
- Can use GitHub security features
- Easy updates (git pull)

**Cons**:
- Requires GitHub account
- Private repo (can't share publicly without exposing your setup)

---

### Method 3: Public npm Package (Not Recommended)

**Why NOT recommended**:
- Exposes your custom code publicly
- Requires npm account
- Publishing process
- Ongoing maintenance expectations
- Security implications of public package

**If you really want this**:
1. Create npm account
2. Update package.json name to unique name
3. `npm publish`
4. Others can install: `npm install @yourusername/n8n-nodes-claudecode`

---

## Recommended Setup

### For Your Personal Use:

**Option A: Keep Local** (Current Setup)
- ✅ Simplest
- ✅ Most secure
- ✅ Already working
- Use for single n8n instance

**Option B: Private GitHub**
- ✅ Version control
- ✅ Easy deployment to multiple instances
- ✅ Backup in cloud
- Use for multiple n8n instances

### For Each n8n Instance:

#### macOS (Current):
```bash
# Already installed ✅
# Located at: /Users/xand/Documents/Projects/n8n-nodes-claudecode-custom
```

#### Windows Instance:
```bash
# Copy from macOS
scp -r /Users/xand/Documents/Projects/n8n-nodes-claudecode-custom user@windows-machine:~/

# Or clone from GitHub (after pushing)
git clone https://github.com/YOUR_USERNAME/n8n-nodes-claudecode-custom.git

# Install
docker cp n8n-nodes-claudecode-custom n8n_container:/tmp/
docker exec -w /home/node/.n8n/nodes n8n_container npm install /tmp/n8n-nodes-claudecode-custom
```

#### Linux Server:
```bash
# Same as Windows
# Or use GitHub if pushed
```

---

## Update Process

### Local Installation:

1. **Make changes** to code
2. **Copy to container**:
   ```bash
   docker cp /Users/xand/Documents/Projects/n8n-nodes-claudecode-custom/nodes n8nlab_n8n:/home/node/.n8n/nodes/@xand/n8n-nodes-claudecode/
   ```
3. **Restart n8n**:
   ```bash
   docker restart n8nlab_n8n
   ```

### GitHub Installation:

1. **Make changes** to code
2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push
   ```
3. **Update in n8n**:
   ```bash
   cd /home/node/.n8n/nodes/@xand/n8n-nodes-claudecode
   git pull
   ```
4. **Restart n8n**:
   ```bash
   docker restart n8nlab_n8n
   ```

---

## Verification

### Check Installation:

```bash
# List installed packages
docker exec n8nlab_n8n ls -la /home/node/.n8n/nodes/

# Should see:
# @xand/n8n-nodes-claudecode (or similar)
```

### Check Node Available:

```bash
# List workflows using it
docker exec n8nlab_n8n n8n list:workflow | grep "Custom Claude Code"

# Should see:
# 1pulyFlFzgLZ4k9U|Terry Stage 4 - Custom Claude Code
```

### Test Execution:

1. Open workflow: http://localhost:5678/workflow/1pulyFlFzgLZ4k9U
2. Click "Execute Workflow"
3. Verify "Claude Code (Custom)" node executes
4. Check output for results

---

## Troubleshooting

### "Package version does not exist" in UI

**Cause**: Package not on npm or public GitHub
**Solution**: Use Method 1 (filesystem) or Method 2 (GitHub)

### "Unrecognized node type"

**Cause**: Package not loaded by n8n
**Solution**:
```bash
# Check installation
docker exec n8nlab_n8n ls -la /home/node/.n8n/nodes/@xand/

# Fix permissions
docker exec n8nlab_n8n chown -R node:node /home/node/.n8n/nodes/

# Restart n8n
docker restart n8nlab_n8n
```

### Node doesn't appear in palette

**Cause**: n8n didn't load the node
**Solution**:
1. Check package.json "n8n.nodes" path is correct
2. Check node file exists at that path
3. Restart n8n
4. Check n8n logs for errors

### Changes not reflected

**Cause**: n8n cached old version
**Solution**:
```bash
# Clear n8n cache
docker restart n8nlab_n8n

# Or reinstall
cd /home/node/.n8n/nodes
npm uninstall @xand/n8n-nodes-claudecode
npm install /tmp/n8n-nodes-claudecode-custom
```

---

## Security Reminder

Before installing on any instance:

1. ✅ Review SECURITY-ANALYSIS.md
2. ✅ Verify code hasn't changed unexpectedly
3. ✅ Check dependencies for updates
4. ✅ Test in development first
5. ✅ Backup workflows before updating

---

## Summary

**Current Status**: ✅ Working perfectly via filesystem installation

**Recommended Next Step**:
- **For single instance**: Keep as-is (no action needed)
- **For multiple instances**: Push to private GitHub

**DO NOT**: Publish to public npm (security risk)

---

## Quick Reference

### Installation Locations:

| Location | Path |
|----------|------|
| Source Code | `/Users/xand/Documents/Projects/n8n-nodes-claudecode-custom/` |
| n8n Install | `/home/node/.n8n/nodes/@xand/n8n-nodes-claudecode/` |
| Workflow | http://localhost:5678/workflow/1pulyFlFzgLZ4k9U |

### Key Commands:

```bash
# Reinstall
docker cp /Users/xand/Documents/Projects/n8n-nodes-claudecode-custom n8nlab_n8n:/tmp/custom
docker exec -w /home/node/.n8n/nodes n8nlab_n8n npm install /tmp/custom

# Restart
docker restart n8nlab_n8n

# Verify
docker exec n8nlab_n8n ls -la /home/node/.n8n/nodes/@xand/
```

---

**Status**: ✅ INSTALLED AND WORKING
**No further action needed** unless deploying to additional instances
