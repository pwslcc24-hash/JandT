import "dotenv/config";
import { formatCursorError, runSiteEdit } from "./cursor.js";

const prompt = process.argv.slice(2).join(" ").trim();

if (!prompt) {
  console.error('Usage: npm run edit -- "Make the hero countdown say days until forever"');
  process.exit(1);
}

console.log(`Editing ${process.env.GITHUB_REPO_URL ?? "https://github.com/pwslcc24-hash/JandT"}…`);
console.log(`Request: ${prompt}\n`);

try {
  const result = await runSiteEdit(prompt, "cli", (line) => {
    console.log(`… ${line}`);
  });

  console.log("\nDone.");
  console.log(`Agent: ${result.agentId}`);
  console.log(`Run:   ${result.runId}`);
  if (result.prUrl) console.log(`PR:    ${result.prUrl}`);
  else console.log(`Pushed to main. Publish on Base44.com for live site.`);
  console.log(`\n${result.summary}`);
} catch (err) {
  console.error(`\nFailed: ${formatCursorError(err)}`);
  process.exit(1);
}
