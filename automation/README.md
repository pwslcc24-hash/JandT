# Wedding site automation

Slack edits run through **Cursor Automations** (cloud). This folder holds docs and helper scripts only — no bot to host.

## Slack (Jay)

See [`AUTOMATION.md`](./AUTOMATION.md) and [`AGENT-INSTRUCTIONS.md`](./AGENT-INSTRUCTIONS.md).

## Manual edits (Porter)

**Setup once:**

```bash
chmod +x automation/setup.sh
./automation/setup.sh
```

**From terminal:**

```bash
cd automation
npm run edit -- "Make the hero text bigger on mobile"
```

**From phone:** GitHub → Actions → **Site edit** → Run workflow.

**Sync live copy manually:**

```bash
cd automation && npm run publish-sync
```

(GitHub Actions runs this automatically after content pushes to `main`.)
