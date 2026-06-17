const SKIP_PATTERN =
  /^(ok|okay|thanks|thank you|yes|no|yep|nope|cool|got it|sounds good|lol|nice|👍|✅)[\s!.?]*$/i;

export function stripBotMention(text: string): string {
  return text.replace(/<@[A-Z0-9]+>/g, "").trim();
}

export function looksLikeEditRequest(text: string): boolean {
  const cleaned = stripBotMention(text);
  if (!cleaned || cleaned.length < 8) return false;
  if (SKIP_PATTERN.test(cleaned)) return false;
  return true;
}
