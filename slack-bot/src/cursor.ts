import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Agent, CursorAgentError, type RunResult } from "@cursor/sdk";
import { cursorConfig as config } from "./cursor-config.js";

const execFileAsync = promisify(execFile);
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

let cachedSystemPrompt: string | null = null;

function loadSystemPrompt(): string {
  if (cachedSystemPrompt) return cachedSystemPrompt;
  const path = resolve(dirname(fileURLToPath(import.meta.url)), "agent-prompt.txt");
  cachedSystemPrompt = readFileSync(path, "utf8").trim();
  return cachedSystemPrompt;
}

export interface EditResult {
  agentId: string;
  runId: string;
  status: RunResult["status"];
  summary: string;
  prUrl?: string;
  branch?: string;
  publishedLive?: boolean;
}

function buildPrompt(userRequest: string, slackUser: string): string {
  return [
    loadSystemPrompt(),
    "",
    "---",
    `Slack user: ${slackUser}`,
    `User request: ${userRequest}`,
  ].join("\n");
}

function extractGitLinks(result: RunResult): { prUrl?: string; branch?: string } {
  const git = result.git as
    | { branches?: Array<{ branch?: string; prUrl?: string }> }
    | undefined;
  const first = git?.branches?.[0];
  return { prUrl: first?.prUrl, branch: first?.branch };
}

function lastAssistantText(result: RunResult): string {
  const text = result.result?.trim();
  if (text) return text.slice(0, 1200);
  return "Agent finished.";
}

async function runPublishSync(onProgress?: (line: string) => void): Promise<boolean> {
  try {
    onProgress?.("Syncing live content to Base44…");
    await execFileAsync("npx", ["tsx", "scripts/publish-sync.ts"], {
      cwd: repoRoot,
      timeout: 120_000,
    });
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    onProgress?.(`publish-sync failed: ${msg.slice(0, 200)}`);
    return false;
  }
}

export async function runSiteEdit(
  userRequest: string,
  slackUser: string,
  onProgress?: (line: string) => void
): Promise<EditResult> {
  const pushToMain = config.gitMode === "main";

  await using agent = await Agent.create({
    apiKey: config.apiKey,
    model: { id: "composer-2.5" },
    cloud: {
      repos: [{ url: config.githubRepoUrl, startingRef: config.githubBranch }],
      workOnCurrentBranch: pushToMain,
      autoCreatePR: !pushToMain,
      skipReviewerRequest: true,
    },
  });

  onProgress?.(`Agent started (\`${agent.agentId}\`)…`);

  const run = await agent.send(buildPrompt(userRequest, slackUser));
  onProgress?.(`Run \`${run.id}\` in progress…`);

  for await (const event of run.stream()) {
    if (event.type !== "assistant") continue;
    for (const block of event.message.content) {
      if (block.type === "text" && block.text.trim()) {
        const line = block.text.trim().split("\n").pop() ?? "";
        if (line.length > 20) onProgress?.(line.slice(0, 280));
      }
    }
  }

  const result = await run.wait();

  if (result.status === "error") {
    throw new Error(`Agent run failed (${result.id}). Check Cursor dashboard for logs.`);
  }

  const publishedLive = await runPublishSync(onProgress);
  const { prUrl, branch } = extractGitLinks(result);

  return {
    agentId: agent.agentId,
    runId: result.id,
    status: result.status,
    summary: lastAssistantText(result),
    prUrl,
    branch,
    publishedLive,
  };
}

export function formatCursorError(err: unknown): string {
  if (err instanceof CursorAgentError) {
    return `Cursor error: ${err.message}${err.isRetryable ? " (retryable)" : ""}`;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}
