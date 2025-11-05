# Publishing to npm - Quick Steps

## 1. Login to npm (if not already logged in)

```bash
npm login
```

You'll need:
- npm username
- npm password
- email address
- 2FA code (if enabled)

## 2. Publish the Package

From the project directory:

```bash
cd /Users/xand/Documents/Projects/n8n-nodes-claudecode-custom
npm publish --access public
```

The `--access public` flag is required for scoped packages (@xandrennus/...).

## 3. Verify Publication

```bash
npm view @xandrennus/n8n-nodes-claudecode
```

You should see your package details.

## 4. Install in n8n

After publishing, I'll install it in n8n using:

```bash
docker exec n8nlab_n8n n8n community package install @xandrennus/n8n-nodes-claudecode
```

## Notes

- If you don't have an npm account, create one at: https://www.npmjs.com/signup
- The package will be publicly visible on npm
- You can unpublish within 72 hours if needed: `npm unpublish @xandrennus/n8n-nodes-claudecode`

---

Once published, the Terry Stage 4 workflow will work automatically!