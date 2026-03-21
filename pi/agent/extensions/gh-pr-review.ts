import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { readFileSync } from "node:fs";
import { join } from "node:path";


const REVIEWER_INSTRUCTIONS = (() => {
  try {
    return readFileSync(join(process.env.HOME!, ".pi/agents/code-reviewer.md"), "utf8");
  } catch {
    return null;
  }
})();

/**
 * GitHub PR Review Extension
 *
 * Adds `/review-pr <pr-url-or-number>` command.
 *
 * For each PR the agent will:
 *   1. Create a git worktree so the main working tree is untouched.
 *   2. Fetch full PR metadata (title, body, author, base branch, labels).
 *   3. Fetch existing review comments for context.
 *   4. Compute the merge-base diff inside the worktree.
 *   5. Review the PR using the code-reviewer instructions.
 *   6. Delete the worktree when done.
 *
 * Usage:
 *   /review-pr 123
 *   /review-pr https://github.com/owner/repo/pull/123
 */

interface PRInfo {
  owner: string;
  repo: string;
  prNumber: number;
  url: string;
}

function parsePRUrl(input: string): PRInfo {
  const trimmed = input.trim();

  // Plain number — requires a git remote to derive owner/repo at runtime
  const plainNum = parseInt(trimmed, 10);
  if (!isNaN(plainNum) && plainNum > 0 && String(plainNum) === trimmed) {
    return { owner: "", repo: "", prNumber: plainNum, url: "" };
  }

  let urlStr = trimmed;
  if (!urlStr.includes("://")) urlStr = `https://${urlStr}`;

  let url: URL;
  try {
    url = new URL(urlStr);
  } catch {
    throw new Error(
      "Invalid PR URL. Use: https://github.com/owner/repo/pull/N  or just a PR number."
    );
  }

  const match = url.pathname.match(/\/([^/]+)\/([^/]+)\/pull\/(\d+)\/?$/);
  if (!match) {
    throw new Error(
      "Could not parse PR from URL. Expected: https://github.com/owner/repo/pull/N"
    );
  }

  const [, owner, repo, prNumber] = match;
  return {
    owner,
    repo,
    prNumber: parseInt(prNumber, 10),
    url: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
  };
}

async function getRepoSlug(pi: ExtensionAPI): Promise<{ owner: string; repo: string } | null> {
  const { stdout, code } = await pi.exec("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
  if (code !== 0 || !stdout.trim()) return null;
  const [owner, repo] = stdout.trim().split("/");
  return owner && repo ? { owner, repo } : null;
}

interface PRDetails {
  title: string;
  body: string;
  author: string;
  baseBranch: string;
  headBranch: string;
  labels: string[];
  url: string;
}

async function fetchPRDetails(pi: ExtensionAPI, prInfo: PRInfo): Promise<PRDetails> {
  const repoFlag = prInfo.owner ? ["--repo", `${prInfo.owner}/${prInfo.repo}`] : [];

  const { stdout, code, stderr } = await pi.exec("gh", [
    "pr", "view", String(prInfo.prNumber),
    ...repoFlag,
    "--json", "title,body,author,baseRefName,headRefName,labels,url",
  ]);

  if (code !== 0) throw new Error(stderr || stdout || "Failed to fetch PR details");

  const data = JSON.parse(stdout);
  return {
    title: data.title ?? "",
    body: data.body ?? "",
    author: data.author?.login ?? "unknown",
    baseBranch: data.baseRefName ?? "main",
    headBranch: data.headRefName ?? "",
    labels: (data.labels ?? []).map((l: any) => l.name as string),
    url: data.url ?? prInfo.url,
  };
}

async function fetchPRComments(pi: ExtensionAPI, prInfo: PRInfo): Promise<string> {
  const repoFlag = prInfo.owner ? ["--repo", `${prInfo.owner}/${prInfo.repo}`] : [];

  const { stdout, code } = await pi.exec("gh", [
    "pr", "view", String(prInfo.prNumber),
    ...repoFlag,
    "--comments",
  ]);

  if (code !== 0 || !stdout.trim()) return "";
  return stdout.trim();
}

async function getMergeBase(pi: ExtensionAPI, _cwd: string, baseBranch: string): Promise<string | null> {
  const { stdout, code } = await pi.exec("git", ["merge-base", "HEAD", `origin/${baseBranch}`]);
  if (code === 0 && stdout.trim()) return stdout.trim();

  const { stdout: mb2, code: c2 } = await pi.exec("git", ["merge-base", "HEAD", baseBranch]);
  if (c2 === 0 && mb2.trim()) return mb2.trim();

  return null;
}

async function getCurrentBranch(pi: ExtensionAPI): Promise<string> {
  const { stdout, code } = await pi.exec("git", ["branch", "--show-current"]);
  if (code === 0 && stdout.trim()) return stdout.trim();
  // detached HEAD fallback
  const { stdout: sha } = await pi.exec("git", ["rev-parse", "HEAD"]);
  return sha.trim();
}

async function checkoutPR(
  pi: ExtensionAPI,
  prInfo: PRInfo,
): Promise<{ tempBranch: string }> {
  const repoFlag = prInfo.owner ? ["--repo", `${prInfo.owner}/${prInfo.repo}`] : [];
  const tempBranch = `pi-review-pr-${prInfo.prNumber}`;

  const { code, stderr, stdout } = await pi.exec("gh", [
    "pr", "checkout", String(prInfo.prNumber),
    ...repoFlag,
    "-b", tempBranch,
  ]);

  if (code !== 0) {
    throw new Error(`gh pr checkout failed: ${stderr || stdout}`);
  }

  return { tempBranch };
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("review-pr", {
    description: "Review a GitHub PR: creates a worktree, gathers full context, reviews, then cleans up",
    handler: async (args, ctx) => {
      if (!args?.trim()) {
        ctx.ui.notify("Usage: /review-pr <url or PR number>", "error");
        return;
      }

      try {
        ctx.ui.setStatus("pr-review", "Parsing PR reference...");

        let prInfo = parsePRUrl(args.trim());

        // If plain number with no owner/repo, resolve from current repo
        if (!prInfo.owner) {
          const slug = await getRepoSlug(pi);
          if (!slug) {
            ctx.ui.notify("Could not determine repo — run inside a GitHub repo or provide a full URL.", "error");
            return;
          }
          prInfo = { ...prInfo, owner: slug.owner, repo: slug.repo, url: `https://github.com/${slug.owner}/${slug.repo}/pull/${prInfo.prNumber}` };
        }

        ctx.ui.setStatus("pr-review", `Fetching PR #${prInfo.prNumber} details...`);
        const details = await fetchPRDetails(pi, prInfo);

        ctx.ui.setStatus("pr-review", "Fetching PR review comments...");
        const comments = await fetchPRComments(pi, prInfo);

        ctx.ui.setStatus("pr-review", "Saving current branch...");
        const originalBranch = await getCurrentBranch(pi);

        ctx.ui.setStatus("pr-review", "Checking out PR branch...");
        const { tempBranch } = await checkoutPR(pi, prInfo);

        ctx.ui.setStatus("pr-review", "Computing merge base...");
        const mergeBase = await getMergeBase(pi, ctx.cwd, details.baseBranch);

        ctx.ui.setStatus("pr-review", "");

        const sections: string[] = [];

        if (REVIEWER_INSTRUCTIONS) {
          sections.push(REVIEWER_INSTRUCTIONS);
          sections.push("---");
        }

        sections.push(`## PR to Review`);
        sections.push(`**URL:** ${details.url}`);
        sections.push(`**Title:** ${details.title}`);
        sections.push(`**Author:** ${details.author}`);
        sections.push(`**Base branch:** ${details.baseBranch}`);
        if (details.labels.length > 0) {
          sections.push(`**Labels:** ${details.labels.join(", ")}`);
        }
        if (details.body.trim()) {
          sections.push(`\n### PR Description\n${details.body.trim()}`);
        }
        if (comments.trim()) {
          sections.push(`\n### Existing Review Comments\n${comments}`);
        }

        sections.push(`\n## Branch`);
        sections.push(`PR head is checked out as \`${tempBranch}\` (current branch).`);
        if (mergeBase) {
          sections.push(`Merge base: \`${mergeBase}\`. Run \`git diff ${mergeBase}\` to see the full diff.`);
        } else {
          sections.push(`Run \`git diff origin/${details.baseBranch}...HEAD\` to see the diff.`);
        }

        sections.push(`\n## Your Task`);
        sections.push(
          `Review this PR thoroughly:\n` +
          `1. Run the diff command above to understand what changed.\n` +
          `2. Read the full context of changed files to understand impact.\n` +
          `3. Use the review guidelines above to produce prioritized findings.\n` +
          `4. **When done**, switch back and delete the temp branch:\n` +
          `   \`git checkout ${originalBranch} && git branch -D ${tempBranch}\``
        );

        pi.sendUserMessage(sections.join("\n\n"), { deliverAs: "followUp" });

        ctx.ui.notify(
          `PR #${prInfo.prNumber} checked out as '${tempBranch}' — will return to '${originalBranch}' after review`,
          "success"
        );
      } catch (error) {
        ctx.ui.setStatus("pr-review", "");
        const message = error instanceof Error ? error.message : String(error);
        ctx.ui.notify(`PR review failed: ${message}`, "error");
      }
    },
  });
}
