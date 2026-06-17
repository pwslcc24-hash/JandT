## Run 24/7 (not on your laptop)

The bot uses **Slack Socket Mode** — it must stay connected. Deploy to **Fly.io** (~$5/mo, always on, auto-restarts).

### One-time deploy

```bash
cd slack-bot
./deploy-fly.sh
```

First run opens Fly.io login in your browser. Secrets upload from `.env` automatically.

### Useful commands

```bash
fly logs          # live logs
fly status        # is it running?
fly machine restart  # manual restart
```

### Stop the local copy

If `npm start` is still running in Terminal, quit it — otherwise edits may run twice.

### Billing

Fly.io needs a card on file for always-on machines. ~$5/month for the smallest VM.
