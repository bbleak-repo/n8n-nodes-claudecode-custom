# GitHub Repository Setup

**Current Issue**: Git remote has double slash (//n8n instead of /n8n)

## Fix Remote & Push to GitHub

### Step 1: Remove Bad Remote

```bash
cd /Users/xand/Documents/Projects/n8n-nodes-claudecode-custom

# Remove the incorrect remote
git remote remove origin

# Verify it's gone
git remote -v
# Should show nothing
```

### Step 2: Create GitHub Repository

**Via GitHub Web Interface**:

1. Go to: https://github.com/new
2. Fill in:
   - **Repository name**: `n8n-nodes-claudecode-custom`
   - **Description**: "Custom Claude Code node for n8n - simplified and maintained"
   - **Visibility**: **Private** (recommended for security)
   - **DO NOT** initialize with README, .gitignore, or license (you already have these)
3. Click **"Create repository"**

### Step 3: Add Correct Remote

GitHub will show you commands, but here's the exact syntax:

```bash
# Add the correct remote (single slash!)
git remote add origin https://github.com/YOUR_USERNAME/n8n-nodes-claudecode-custom.git

# Verify it's correct
git remote -v
# Should show:
# origin  https://github.com/YOUR_USERNAME/n8n-nodes-claudecode-custom.git (fetch)
# origin  https://github.com/YOUR_USERNAME/n8n-nodes-claudecode-custom.git (push)
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

### Step 4: Push to GitHub

```bash
# Push your code
git branch -M main
git push -u origin main

# You'll be prompted for GitHub credentials
# Use a Personal Access Token (not password) if asked
```

### Step 5: Verify

Go to: `https://github.com/YOUR_USERNAME/n8n-nodes-claudecode-custom`

You should see:
- ✅ 7 files
- ✅ 3 commits
- ✅ README.md displayed
- ✅ All your code

---

## Alternative: Use SSH Instead of HTTPS

If you prefer SSH authentication:

```bash
# Remove HTTPS remote
git remote remove origin

# Add SSH remote
git remote add origin git@github.com:YOUR_USERNAME/n8n-nodes-claudecode-custom.git

# Push
git push -u origin main
```

**Requires**: SSH key configured on GitHub

---

## Future Syncing

### Push Changes to GitHub:

```bash
# After making changes
git add .
git commit -m "Description of changes"
git push
```

### Pull Changes from GitHub:

```bash
# On another machine or after changes on GitHub
git pull
```

---

## Troubleshooting

### Error: "remote origin already exists"

```bash
git remote remove origin
# Then add the correct one again
```

### Error: "support for password authentication was removed"

GitHub no longer accepts passwords. Use a **Personal Access Token**:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "n8n-claude-code-node"
4. Scopes: Select `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. Use this token instead of password when prompted

### Error: "repository not found"

- Check the URL is correct
- Ensure repository exists on GitHub
- Verify you have access (if private)

---

## Security: Private vs Public

### Private Repository (Recommended)

**Pros**:
- ✅ Code not publicly visible
- ✅ Your custom workflow patterns hidden
- ✅ No maintenance obligations to others
- ✅ Can change freely

**Cons**:
- Limited collaborators (unless you pay)
- Can't share easily with others

### Public Repository

**Pros**:
- Free unlimited collaborators
- Others can use/fork it
- Good for resume/portfolio

**Cons**:
- ❌ Exposes your code
- ❌ Exposes your patterns
- ❌ Creates expectations
- ❌ Others might copy sensitive info

**Recommendation**: Keep it **PRIVATE** ✅

---

## Quick Reference

```bash
# Navigate to project
cd /Users/xand/Documents/Projects/n8n-nodes-claudecode-custom

# Check status
git status

# Check remotes
git remote -v

# View commits
git log --oneline

# Add and commit changes
git add .
git commit -m "Your message"

# Push to GitHub
git push

# Pull from GitHub
git pull
```

---

## Installation from GitHub

Once pushed, you can install on other n8n instances:

### Method 1: Direct npm install

```bash
# In n8n container
cd /home/node/.n8n/nodes
npm install git+https://github.com/YOUR_USERNAME/n8n-nodes-claudecode-custom.git
```

### Method 2: Clone then install

```bash
# Clone repo
git clone https://github.com/YOUR_USERNAME/n8n-nodes-claudecode-custom.git

# Copy to n8n
docker cp n8n-nodes-claudecode-custom n8nlab_n8n:/tmp/

# Install
docker exec -w /home/node/.n8n/nodes n8nlab_n8n npm install /tmp/n8n-nodes-claudecode-custom

# Restart
docker restart n8nlab_n8n
```

### Method 3: n8n UI (After GitHub push)

This should work after you push to GitHub:

1. Settings → Community Nodes
2. Enter: `https://github.com/YOUR_USERNAME/n8n-nodes-claudecode-custom`
3. Click Install

**Note**: This might still fail with private repos. Use Methods 1 or 2 for reliability.

---

## Summary

**Fix the double slash issue**:
```bash
cd /Users/xand/Documents/Projects/n8n-nodes-claudecode-custom
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/n8n-nodes-claudecode-custom.git
git push -u origin main
```

**Keep it private** for security!
