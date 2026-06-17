import "dotenv/config";
import { WebClient } from "@slack/web-api";
import { config } from "./config.js";

const client = new WebClient(config.slackBotToken);

async function findChannelId(name: string): Promise<string | undefined> {
  let cursor: string | undefined;
  do {
    const res = await client.conversations.list({
      types: "public_channel",
      limit: 200,
      cursor,
    });
    const match = res.channels?.find((ch) => ch.name === name);
    if (match?.id) return match.id;
    cursor = res.response_metadata?.next_cursor;
  } while (cursor);
  return undefined;
}

async function lookupUserByEmail(email: string): Promise<string | undefined> {
  try {
    const res = await client.users.lookupByEmail({ email });
    return res.user?.id;
  } catch {
    return undefined;
  }
}

async function main() {
  const channelName = config.editChannelName;
  console.log(`Setting up #${channelName}…`);

  let channelId = await findChannelId(channelName);

  if (!channelId) {
    const created = await client.conversations.create({
      name: channelName,
      is_private: false,
    });
    channelId = created.channel?.id;
    if (!channelId) throw new Error("Failed to create channel.");
    console.log(`Created #${channelName} (${channelId})`);
  } else {
    console.log(`Found #${channelName} (${channelId})`);
  }

  await client.conversations.join({ channel: channelId });

  const inviteIds: string[] = [];
  for (const userId of config.allowedUserIds) {
    inviteIds.push(userId);
  }

  const jayId = await lookupUserByEmail(config.inviteEmail);
  if (jayId) {
    inviteIds.push(jayId);
    console.log(`Found ${config.inviteEmail} → ${jayId}`);
  } else {
    console.log(
      `\n⚠️  ${config.inviteEmail} is not in this Slack workspace yet.`
    );
    console.log("   Slack → Invite people → add that email, then run:");
    console.log("   npm run provision\n");
  }

  const unique = [...new Set(inviteIds)];
  if (unique.length) {
    try {
      await client.conversations.invite({ channel: channelId, users: unique.join(",") });
      console.log(`Invited ${unique.length} member(s) to the channel.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("already_in_channel")) throw err;
      console.log("Members already in the channel.");
    }
  }

  await client.chat.postMessage({
    channel: channelId,
    text: [
      "👋 *JandT site edits*",
      "",
      "Post a change request here (plain text — no @ needed). Example:",
      "_Make the hero countdown say days until forever_",
      "",
      "Changes run on Porter's Cursor + GitHub and push to `main`.",
      "Then publish on Base44.com for the live site.",
    ].join("\n"),
  });

  console.log(`\nDone. Channel ID: ${channelId}`);
  console.log(`Add to .env: SLACK_EDIT_CHANNEL_ID=${channelId}`);
  console.log(`\nStart the bot: npm start`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
