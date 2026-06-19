function optional(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

export function getCursorApiKey(): string {
  const value = process.env.CURSOR_API_KEY?.trim();
  if (!value) {
    throw new Error(
      "Missing CURSOR_API_KEY. Get one at https://cursor.com/dashboard/integrations then run: ./automation/setup.sh"
    );
  }
  return value;
}

export const cursorConfig = {
  get apiKey() {
    return getCursorApiKey();
  },
  githubRepoUrl: optional("GITHUB_REPO_URL", "https://github.com/pwslcc24-hash/JandT"),
  githubBranch: optional("GITHUB_BRANCH", "main"),
  gitMode: optional("GIT_MODE", "main") as "main" | "pr",
};
