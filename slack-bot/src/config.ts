import "dotenv/config";
import { cursorConfig } from "./cursor-config.js";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

export const config = {
  slackBotToken: required("SLACK_BOT_TOKEN"),
  slackAppToken: required("SLACK_APP_TOKEN"),
  slackSigningSecret: required("SLACK_SIGNING_SECRET"),
  allowedUserIds: new Set(
    required("ALLOWED_SLACK_USER_IDS")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  ),
  editChannelName: optional("SLACK_EDIT_CHANNEL", "jandt-edits").replace(/^#/, ""),
  inviteEmail: optional("SLACK_INVITE_EMAIL", "holdsjay@gmail.com"),
  ...cursorConfig,
};
