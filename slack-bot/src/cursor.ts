import { Agent, CursorAgentError, type RunResult } from "@cursor/sdk";
import { cursorConfig as config } from "./cursor-config.js";

export interface EditResult {
  agentId: string;
  runId: string;
  status: RunResult["status"];
  summary: string;
  prUrl?: string;
  branch?: string;
}

function buildPrompt(userRequest: string, slackUser: string): string {
  const pushInstructions =
    config.gitMode === "pr"
      ? "Push your changes to a new branch. A pull request will be opened automatically when you finish."
      : `Commit your changes with a clear message and push directly to the \`${config.githubBranch}\` branch.`;

  return [
    "You are editing the Holdsworth wedding website repository (React + Vite + Base44).",
    "",
    "Key paths:",
    "- CMS / editor: src/cms/",
    "- Pages: src/pages/",
    "- Styles: src/index.css, src/styles/editor.css",
    "- Live content is published via Base44 SiteContent entity",
    "",
    `Slack user: ${slackUser}`,
    `User request: ${userRequest}`,
    "",
    "Instructions:",
    "1. Make the smallest correct change that fulfills the request.",
    "2. Match existing code style and conventions.",
    "3. Run `npm run build` and fix any errors before finishing.",
    "4. Do not commit secrets or .env files.",
    `5. ${pushInstructions}`,
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

  const { prUrl, branch } = extractGitLinks(result);

  return {
    agentId: agent.agentId,
    runId: result.id,
    status: result.status,
    summary: lastAssistantText(result),
    prUrl,
    branch,
  };
}

export function formatCursorError(err: unknown): string {
  if (err instanceof CursorAgentError) {
    return `Cursor error: ${err.message}${err.isRetryable ? " (retryable)" : ""}`;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}
