import { App } from "@slack/bolt";
import { config } from "./config.js";
import { formatCursorError, runSiteEdit } from "./cursor.js";
import { looksLikeEditRequest, stripBotMention } from "./message-utils.js";

const app = new App({
  token: config.slackBotToken,
  appToken: config.slackAppToken,
  signingSecret: config.slackSigningSecret,
  socketMode: true,
});

const busyThreads = new Set<string>();
let editChannelId = process.env.SLACK_EDIT_CHANNEL_ID?.trim() ?? "";

async function resolveEditChannelId(): Promise<string> {
  if (editChannelId) return editChannelId;

  const res = await app.client.conversations.list({
    types: "public_channel",
    limit: 200,
  });
  const match = res.channels?.find((ch) => ch.name === config.editChannelName);
  if (!match?.id) {
    throw new Error(
      `Channel #${config.editChannelName} not found. Run: npm run provision`
    );
  }
  editChannelId = match.id;
  return editChannelId;
}

function isAllowed(userId: string | undefined): boolean {
  return Boolean(userId && config.allowedUserIds.has(userId));
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
  if (!looksLikeEditRequest(request)) {
    if (!threadTs) {
      await say({
        text: "Post a site change here, e.g. _Make the hero countdown say days until forever_",
        thread_ts: threadTs,
      });
    }
    return;
  }

  const lockKey = `${channel}:${threadTs ?? "root"}`;
  if (busyThreads.has(lockKey)) {
    await say({
      text: "Still working on the previous edit in this thread.",
      thread_ts: threadTs,
    });
    return;
  }

  busyThreads.add(lockKey);
  const replyTs = threadTs;

  await say({
    text: `On it — editing \`${config.githubRepoUrl}\` with Porter's Cursor…`,
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

    const lines = ["✅ Done."];
    if (result.prUrl) {
      lines.push(`PR: ${result.prUrl}`);
    } else {
      lines.push(`Pushed to \`${config.githubBranch}\` on GitHub.`);
      lines.push("_Publish on Base44.com to update the live site._");
    }
    lines.push("", result.summary);

    await say({ text: lines.join("\n"), thread_ts: replyTs });
  } catch (err) {
    await say({
      text: `❌ Failed: ${formatCursorError(err)}`,
      thread_ts: replyTs,
    });
  } finally {
    busyThreads.delete(lockKey);
  }
}

app.message(async ({ message, say }) => {
  if (message.subtype || !("user" in message) || !message.user) return;
  if ("bot_id" in message && message.bot_id) return;

  const channelId = await resolveEditChannelId();

  if (message.channel === channelId) {
    if (!isAllowed(message.user)) return;

    const text = "text" in message ? message.text ?? "" : "";
    await handleEditRequest({
      userId: message.user,
      channel: message.channel,
      threadTs: "thread_ts" in message ? message.thread_ts : undefined,
      text,
      say,
    });
    return;
  }

  if (message.channel_type === "im" && isAllowed(message.user)) {
    const text = "text" in message ? message.text ?? "" : "";
    await handleEditRequest({
      userId: message.user,
      channel: message.channel,
      threadTs: "thread_ts" in message ? message.thread_ts : undefined,
      text,
      say,
    });
  }
});

const channelId = await resolveEditChannelId();
await app.start();

console.log(`JandT site bot running on #${config.editChannelName} (${channelId})`);
console.log(`Repo: ${config.githubRepoUrl} → ${config.gitMode === "main" ? config.githubBranch : "PR"}`);
console.log(`Allowed users: ${[...config.allowedUserIds].join(", ")}`);
