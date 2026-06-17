import { App } from "@slack/bolt";
import { config } from "./config.js";
import { formatCursorError, runSiteEdit } from "./cursor.js";

const app = new App({
  token: config.slackBotToken,
  appToken: config.slackAppToken,
  signingSecret: config.slackSigningSecret,
  socketMode: true,
});

const busyChannels = new Set<string>();

function isAllowed(userId: string | undefined): boolean {
  return Boolean(userId && config.allowedUserIds.has(userId));
}

function stripBotMention(text: string): string {
  return text.replace(/<@[A-Z0-9]+>/g, "").trim();
}

async function handleEditRequest({
  userId,
  channel,
  threadTs,
  text,
  say,
}: {
  userId: string;
  channel: string;
  threadTs?: string;
  text: string;
  say: (args: { text: string; thread_ts?: string }) => Promise<unknown>;
}) {
  const request = stripBotMention(text);
  if (!request) {
    await say({
      text: "Tell me what to change, e.g. _“Make the hero countdown say days until forever”_",
      thread_ts: threadTs,
    });
    return;
  }

  const lockKey = `${channel}:${threadTs ?? "root"}`;
  if (busyChannels.has(lockKey)) {
    await say({
      text: "Still working on the previous edit in this thread. I'll reply when it's done.",
      thread_ts: threadTs,
    });
    return;
  }

  busyChannels.add(lockKey);

  const replyTs = threadTs;
  await say({
    text: `On it — running a Cursor agent on \`${config.githubRepoUrl}\`…`,
    thread_ts: replyTs,
  });

  let lastProgress = "";
  const progress = async (line: string) => {
    if (line === lastProgress) return;
    lastProgress = line;
    await say({ text: `_${line}_`, thread_ts: replyTs });
  };

  try {
    const result = await runSiteEdit(request, userId, progress);

    const lines = [
      "Done.",
      `Agent: \`${result.agentId}\``,
      `Run: \`${result.runId}\``,
    ];

    if (result.prUrl) {
      lines.push(`PR: ${result.prUrl}`);
    } else if (config.gitMode === "main") {
      lines.push(`Pushed to \`${config.githubBranch}\` on GitHub.`);
      lines.push("Publish on Base44.com to update the live site.");
    } else if (result.branch) {
      lines.push(`Branch: \`${result.branch}\``);
    }

    lines.push("", result.summary);

    await say({ text: lines.join("\n"), thread_ts: replyTs });
  } catch (err) {
    await say({
      text: `Failed: ${formatCursorError(err)}`,
      thread_ts: replyTs,
    });
  } finally {
    busyChannels.delete(lockKey);
  }
}

app.event("app_mention", async ({ event, say }) => {
  if (!event.user || !isAllowed(event.user)) {
    await say({
      text: "You're not authorized to run site edits.",
      thread_ts: event.ts,
    });
    return;
  }

  await handleEditRequest({
    userId: event.user,
    channel: event.channel,
    threadTs: event.ts,
    text: event.text,
    say,
  });
});

app.message(async ({ message, say }) => {
  if (message.subtype || !("user" in message) || !message.user) return;
  if (message.channel_type !== "im") return;
  if (!isAllowed(message.user)) {
    await say({ text: "You're not authorized to run site edits." });
    return;
  }

  const text = "text" in message ? message.text ?? "" : "";
  await handleEditRequest({
    userId: message.user,
    channel: message.channel,
    threadTs: "thread_ts" in message ? message.thread_ts : undefined,
    text,
    say,
  });
});

app.command("/site-edit", async ({ command, ack }) => {
  await ack();

  if (!isAllowed(command.user_id)) {
    await app.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: "You're not authorized to run site edits.",
    });
    return;
  }

  const request = command.text.trim();
  if (!request) {
    await app.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: "Usage: `/site-edit Make the banner text larger`",
    });
    return;
  }

  await app.client.chat.postMessage({
    channel: command.channel_id,
    text: `Starting edit: _${request}_`,
  });

  await handleEditRequest({
    userId: command.user_id,
    channel: command.channel_id,
    text: request,
    say: async ({ text, thread_ts }) => {
      await app.client.chat.postMessage({
        channel: command.channel_id,
        thread_ts,
        text,
      });
    },
  });
});

await app.start();
console.log("JandT Slack bot is running (Socket Mode).");
console.log(`Repo: ${config.githubRepoUrl} → ${config.gitMode === "main" ? config.githubBranch : "PR"}`);
