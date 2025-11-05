# Custom Claude Code Node for n8n

A simplified, maintainable n8n community node for integrating Claude Code into workflows.

## Features

- Query Claude Code with custom prompts
- Choose between Sonnet (fast) and Opus (powerful) models
- Configurable timeout and max turns
- Multiple output formats (text, messages, full)
- Uses your existing Claude Code authentication

## Prerequisites

- Claude Code CLI installed: `npm install -g @anthropic-ai/claude-code`
- Claude Code authenticated with Claude App (not Console)
- n8n instance running

## Installation

### Method 1: Install from Local Directory (Development)

```bash
# In your n8n container
cd /home/node/.n8n/nodes
npm install /path/to/n8n-nodes-claudecode-custom
```

### Method 2: Install from GitHub (After pushing)

```bash
# In n8n UI: Settings → Community Nodes
# Enter: https://github.com/YOUR_USERNAME/n8n-nodes-claudecode-custom
```

### Method 3: Install from npm (If published)

```bash
npm install @xand/n8n-nodes-claudecode
```

## Usage in n8n

### Basic Query

1. Add "Claude Code (Custom)" node to workflow
2. Set Operation: Query
3. Enter your prompt
4. Choose model (Sonnet recommended for speed)
5. Execute!

### Example: Terry Troubleshooting

```javascript
// Prompt
You are Terry, troubleshooting a website outage.

Website: http://localhost:8090
Error: {{ $('Check Website').item.json.error.message }}

Docker Status:
{{ $('List Containers').item.json.stdout }}

Container Logs:
{{ $('Get Logs').item.json.stdout }}

Analyze and provide:
1. Root cause
2. Fix steps
3. Prevention tips
```

## Configuration

### Node Parameters

- **Operation**: Query (more operations can be added)
- **Prompt**: The text prompt to send to Claude Code
- **Model**: sonnet (fast) or opus (powerful)
- **Max Turns**: Number of conversation turns (1 for simple queries)
- **Timeout**: Maximum seconds to wait (60 default)
- **Output Format**:
  - `text`: Just the result text
  - `messages`: Result + message stream
  - `full`: Complete response details

### Output Structure

**Text Format**:
```json
{
  "result": "Claude's response text...",
  "duration": 23456,
  "model": "sonnet"
}
```

**Full Format**:
```json
{
  "result": "Response text...",
  "messages": [...],
  "duration": 23456,
  "model": "sonnet",
  "prompt": "Original prompt",
  "maxTurns": 1
}
```

## Authentication

This node uses your Claude Code CLI authentication. Ensure:

1. Claude Code is authenticated: `claude doctor`
2. Using Claude App (not Console) to avoid API charges
3. Credentials mounted in n8n container: `~/.claude:/home/node/.claude:ro`

## Customization

Since you own this code, you can:

### Add New Operations

Edit `ClaudeCode.node.js`:

```javascript
options: [
    {
        name: 'Query',
        value: 'query',
    },
    {
        name: 'Your New Operation',
        value: 'newOp',
    },
],
```

### Change Default Values

```javascript
{
    displayName: 'Timeout (seconds)',
    name: 'timeout',
    type: 'number',
    default: 120,  // Change from 60 to 120
}
```

### Add New Parameters

```javascript
{
    displayName: 'Project Path',
    name: 'projectPath',
    type: 'string',
    default: '',
    description: 'Working directory for Claude Code',
},
```

## Development

### Local Testing

```bash
# Install dependencies
npm install

# Copy to n8n
docker cp . n8nlab_n8n:/home/node/.n8n/nodes/@xand/n8n-nodes-claudecode/

# Fix permissions
docker exec n8nlab_n8n chown -R node:node /home/node/.n8n/nodes/

# Restart n8n
docker restart n8nlab_n8n
```

### Publishing to GitHub

```bash
# Initialize git
git init
git add .
git commit -m "Initial custom Claude Code node"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/n8n-nodes-claudecode-custom.git
git branch -M main
git push -u origin main
```

### Installing from GitHub

In n8n UI:
- Settings → Community Nodes → Install
- Enter: `https://github.com/YOUR_USERNAME/n8n-nodes-claudecode-custom`

Or via npm:
```bash
npm install git+https://github.com/YOUR_USERNAME/n8n-nodes-claudecode-custom.git
```

## Troubleshooting

### Node not appearing in n8n

1. Check installation:
   ```bash
   docker exec n8nlab_n8n ls -la /home/node/.n8n/nodes/
   ```

2. Check permissions:
   ```bash
   docker exec n8nlab_n8n chown -R node:node /home/node/.n8n/nodes/
   ```

3. Check n8n logs:
   ```bash
   docker logs n8nlab_n8n | grep -i error
   ```

4. Restart n8n:
   ```bash
   docker restart n8nlab_n8n
   ```

### "Unrecognized node type" error

- Ensure package.json "n8n.nodes" path matches actual file location
- Verify node name in ClaudeCode.node.js matches
- Check that index.js exports the node class

### Authentication errors

- Run `claude doctor` to verify authentication
- Ensure ~/.claude is mounted in docker-compose.yml
- Verify using Claude App (not Console) authentication

## Cost

Using Claude App authentication means:
- No per-query API charges
- Included in your $200/month Claude Pro subscription
- Subject to Pro plan rate limits (~100 queries/day)

## License

MIT - Modify and use as you wish!

## Support

This is your custom node - you have full control to:
- Fix bugs
- Add features
- Customize behavior
- Optimize performance

No external dependencies on upstream package updates!
