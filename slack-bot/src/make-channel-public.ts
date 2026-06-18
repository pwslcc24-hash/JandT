import "dotenv/config";
import { WebClient } from "@slack/web-api";

const client = new WebClient(process.env.SLACK_BOT_TOKEN);
const channelId = process.env.SLACK_EDIT_CHANNEL_ID?.trim();
const channelName = (process.env.SLACK_EDIT_CHANNEL || "jandt-edits").replace(/^#/, "");

async function findChannelId(): Promise<string> {
  if (channelId) return channelId;
  let cursor: string | undefined;
  do {
    const res = await client.conversations.list({
      types: "public_channel,private_channel",
      limit: 200,
      cursor,
    });
    const match = res.channels?.find((ch) => ch.name === channelName);
    if (match?.id) return match.id;
    cursor = res.response_metadata?.next_cursor;
  } while (cursor);
  throw new Error(`Channel #${channelName} not found.`);
}

const id = await findChannelId();
const info = await client.conversations.info({ channel: id });

if (info.channel?.is_private) {
  try {
    await client.apiCall("conversations.convertToPublic", { channel: id });
    console.log(`#${channelName} is now public.`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("not_allowed_token_type") || msg.includes("missing_scope")) {
      console.error(
        "Bot tokens cannot make channels public. In Slack:\n" +
          `  #${channelName} → channel name → Settings → Change to a public channel`
      );
      process.exit(1);
    }
    throw err;
  }
} else {
  console.log(`#${channelName} is already public.`);
}

console.log(`Channel ID: ${id}`);
