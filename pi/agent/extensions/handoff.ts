/**
 * Structured Handoff Extension
 *
 * Provides a `/handoff` command that prompts the agent to produce a structured
 * handoff report for a given scope of work, following the structured-handoff skill.
 *
 * Supports the same scope selectors as /review:
 * - Uncommitted changes
 * - Base branch diff
 * - Specific commit
 * - GitHub pull request (checks out locally)
 * - Folder/files snapshot
 * - Custom instructions
 *
 * Usage:
 * - `/handoff` - show interactive selector
 * - `/handoff uncommitted` - scope: current uncommitted changes
 * - `/handoff branch main` - scope: diff against main
 * - `/handoff commit abc123` - scope: specific commit
 * - `/handoff pr 123` - scope: PR #123 (checks out locally)
 * - `/handoff folder src` - scope: folder/files snapshot
 * - `/handoff custom "describe the work"` - custom scope description
 *
 * The generated report is saved to .pi/handoff/ with a timestamped filename.
 */

import type { ExtensionAPI, ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { DynamicBorder } from "@mariozechner/pi-coding-agent";
import {
  Container,
  fuzzyFilter,
  getEditorKeybindings,
  Input,
  type SelectItem,
  SelectList,
  Spacer,
  Text,
} from "@mariozechner/pi-tui";

// ---------------------------------------------------------------------------
// Git helpers (same patterns as review.ts)
// ---------------------------------------------------------------------------

async function getLocalBranches(pi: ExtensionAPI): Promise<string[]> {
  const { stdout, code } = await pi.exec("git", ["branch", "--format=%(refname:short)"]);
  if (code !== 0) return [];
  return stdout
    .trim()
    .split("\n")
    .filter((b) => b.trim());
}

async function getRecentCommits(
  pi: ExtensionAPI,
  limit = 20,
): Promise<Array<{ sha: string; title: string }>> {
  const { stdout, code } = await pi.exec("git", ["log", "--oneline", `-n`, `${limit}`]);
  if (code !== 0) return [];
  return stdout
    .trim()
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => {
      const [sha, ...rest] = line.trim().split(" ");
      return { sha, title: rest.join(" ") };
    });
}

async function getCurrentBranch(pi: ExtensionAPI): Promise<string | null> {
  const { stdout, code } = await pi.exec("git", ["branch", "--show-current"]);
  return code === 0 && stdout.trim() ? stdout.trim() : null;
}

async function getDefaultBranch(pi: ExtensionAPI): Promise<string> {
  const { stdout, code } = await pi.exec("git", ["symbolic-ref", "refs/remotes/origin/HEAD", "--short"]);
  if (code === 0 && stdout.trim()) return stdout.trim().replace("origin/", "");
  const branches = await getLocalBranches(pi);
  if (branches.includes("main")) return "main";
  if (branches.includes("master")) return "master";
  return "main";
}

async function hasUncommittedChanges(pi: ExtensionAPI): Promise<boolean> {
  const { stdout, code } = await pi.exec("git", ["status", "--porcelain"]);
  return code === 0 && stdout.trim().length > 0;
}

async function hasPendingTrackedChanges(pi: ExtensionAPI): Promise<boolean> {
  const { stdout, code } = await pi.exec("git", ["status", "--porcelain"]);
  if (code !== 0) return false;
  return stdout
    .trim()
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("??")).length > 0;
}

async function getMergeBase(pi: ExtensionAPI, branch: string): Promise<string | null> {
  try {
    const { stdout: upstream, code: upstreamCode } = await pi.exec("git", [
      "rev-parse", "--abbrev-ref", `${branch}@{upstream}`,
    ]);
    if (upstreamCode === 0 && upstream.trim()) {
      const { stdout: mb, code } = await pi.exec("git", ["merge-base", "HEAD", upstream.trim()]);
      if (code === 0 && mb.trim()) return mb.trim();
    }
    const { stdout: mb, code } = await pi.exec("git", ["merge-base", "HEAD", branch]);
    return code === 0 && mb.trim() ? mb.trim() : null;
  } catch {
    return null;
  }
}

function parsePrReference(ref: string): number | null {
  const trimmed = ref.trim();
  const num = parseInt(trimmed, 10);
  if (!isNaN(num) && num > 0) return num;
  const m = trimmed.match(/github\.com\/[^/]+\/[^/]+\/pull\/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

async function getPrInfo(
  pi: ExtensionAPI,
  prNumber: number,
): Promise<{ baseBranch: string; title: string; headBranch: string } | null> {
  const { stdout, code } = await pi.exec("gh", [
    "pr", "view", String(prNumber),
    "--json", "baseRefName,title,headRefName",
  ]);
  if (code !== 0) return null;
  try {
    const d = JSON.parse(stdout);
    return { baseBranch: d.baseRefName, title: d.title, headBranch: d.headRefName };
  } catch {
    return null;
  }
}

async function checkoutPr(
  pi: ExtensionAPI,
  prNumber: number,
): Promise<{ success: boolean; error?: string }> {
  const { stdout, stderr, code } = await pi.exec("gh", ["pr", "checkout", String(prNumber)]);
  return code === 0 ? { success: true } : { success: false, error: stderr || stdout || "Failed to checkout PR" };
}

// ---------------------------------------------------------------------------
// Handoff target types
// ---------------------------------------------------------------------------

type HandoffTarget =
  | { type: "uncommitted" }
  | { type: "baseBranch"; branch: string }
  | { type: "commit"; sha: string; title?: string }
  | { type: "pullRequest"; prNumber: number; baseBranch: string; title: string }
  | { type: "folder"; paths: string[] }
  | { type: "custom"; instructions: string };

// ---------------------------------------------------------------------------
// Prompt building
// ---------------------------------------------------------------------------

const HANDOFF_RUBRIC = `# Structured Handoff Guidelines

DO NOT ask any questions. DO NOT ask for clarification. Inspect the code/changes NOW using the git commands below and produce the report immediately.

You are producing a structured handoff report for work that was just completed.
The report must have ALL 5 sections below — never omit one, never leave one empty.
If a section genuinely has no content, say so explicitly and briefly explain why.

## Mandatory Report Structure

\`\`\`
# Structured Handoff: [TASK/LAYER/COMPONENT NAME]

## 1. Final implementation results
- What was built/changed
- Key files, functions, behavior
- How to verify it works
- Links to commits/code if applicable

## 2. Potentially identified RISKS
- Security, performance, compatibility issues
- Edge cases not handled
- Dependencies on external state
- What could break this

## 3. What CANNOT be changed (invariants)
- Design decisions that are locked in
- Why they're locked (constraints, dependencies, requirements)
- Assumptions baked into the code
- What future changes must preserve

## 4. Open questions and issues postponed
- Ambiguities or unknowns encountered
- Deferred implementation details
- Performance/scale concerns not yet addressed
- Things that need user/stakeholder input

## 5. Recommendations for using this layer by other agents
- How to integrate this into other work
- Common use patterns
- What not to do
- Suggested next steps
\`\`\`

## Section quality guidelines

**Section 1 (Results):** Be specific. "Fixed auth bug" → "Fixed JWT token refresh logic in \`/auth/refresh.ts:42-58\`. Tokens now valid for 24h instead of 1h."

**Section 2 (Risks):** Name the actual risk. "Risky code" → "Token refresh race condition under 100+ concurrent requests; tested up to 50."

**Section 3 (Invariants):** What's decided and why. "Database schema now requires user_id FK. Can't change without migration + client updates."

**Section 4 (Open questions):** Concise, actionable. "How should deleted users' posts be handled? Currently cascade-delete, unclear if desired."

**Section 5 (Recommendations):** Practical. "Integrate via \`getUser(id)\` export. Cache token in localStorage max 24h."

Each section must have 2–5 bullet points minimum. Use context from the actual work — never fabricate sections.

## Output rules

NEVER write the report content in the chat response.
Save the report to \`.pi/handoff/\` with a descriptive timestamped filename:
\`.pi/handoff/[task-name]-[YYYY-MM-DD_HH-MM-SS].md\`

Use \`mkdir -p .pi/handoff\` then write the file with the bash tool.
Example: \`.pi/handoff/jwt-token-refresh-2026-03-08_22-30-45.md\`

In the chat response write only a short confirmation, e.g.: \"Handoff saved to .pi/handoff/jwt-token-refresh-2026-03-08_22-30-45.md\"`;

async function buildHandoffPrompt(pi: ExtensionAPI, target: HandoffTarget): Promise<string> {
  switch (target.type) {
    case "uncommitted":
      return `${HANDOFF_RUBRIC}

---

Run \`git status --porcelain\`, \`git diff\`, \`git diff --staged\`, and \`git ls-files --others --exclude-standard\` now. Then produce the structured handoff report immediately.`;

    case "baseBranch": {
      const mergeBase = await getMergeBase(pi, target.branch);
      const diffInstruction = mergeBase
        ? `Run \`git diff ${mergeBase}\` to inspect the changes introduced against \`${target.branch}\` (merge base: ${mergeBase}).`
        : `Find the merge base between HEAD and \`${target.branch}\` then run \`git diff\` against it.`;
      return `${HANDOFF_RUBRIC}

---

${diffInstruction} Then produce the structured handoff report immediately for the changes against \`${target.branch}\`.`;
    }

    case "commit": {
      const ref = target.title ? `commit ${target.sha.slice(0, 7)} ("${target.title}")` : `commit ${target.sha.slice(0, 7)}`;
      return `${HANDOFF_RUBRIC}

---

Run \`git show ${target.sha}\` now. Then produce the structured handoff report immediately for ${ref}.`;
    }

    case "pullRequest": {
      const mergeBase = await getMergeBase(pi, target.baseBranch);
      const diffInstruction = mergeBase
        ? `Run \`git diff ${mergeBase}\` to inspect the changes (merge base against \`${target.baseBranch}\`: ${mergeBase}).`
        : `Find the merge base between HEAD and \`${target.baseBranch}\` then run \`git diff\` against it.`;
      return `${HANDOFF_RUBRIC}

---

${diffInstruction} Then produce the structured handoff report immediately for PR #${target.prNumber} ("${target.title}") targeting \`${target.baseBranch}\`.`;
    }

    case "folder":
      return `${HANDOFF_RUBRIC}

---

Read the files in these paths now: ${target.paths.join(", ")}. Then produce the structured handoff report immediately.`;

    case "custom":
      return `${HANDOFF_RUBRIC}

---

${target.instructions}

Produce the structured handoff report immediately. Do not ask questions.`;
  }
}

function getUserFacingHint(target: HandoffTarget): string {
  switch (target.type) {
    case "uncommitted": return "uncommitted changes";
    case "baseBranch": return `changes against '${target.branch}'`;
    case "commit": {
      const short = target.sha.slice(0, 7);
      return target.title ? `commit ${short}: ${target.title}` : `commit ${short}`;
    }
    case "pullRequest": {
      const t = target.title.length > 30 ? target.title.slice(0, 27) + "..." : target.title;
      return `PR #${target.prNumber}: ${t}`;
    }
    case "folder": {
      const j = target.paths.join(", ");
      return j.length > 40 ? `folders: ${j.slice(0, 37)}...` : `folders: ${j}`;
    }
    case "custom":
      return target.instructions.length > 40 ? target.instructions.slice(0, 37) + "..." : target.instructions;
  }
}

// ---------------------------------------------------------------------------
// Selector UI helpers (reuse the same patterns as review.ts)
// ---------------------------------------------------------------------------

const HANDOFF_PRESETS = [
  { value: "uncommitted", label: "Uncommitted changes", description: "" },
  { value: "baseBranch",  label: "Diff against a base branch", description: "(local)" },
  { value: "commit",      label: "A specific commit", description: "" },
  { value: "pullRequest", label: "A pull request", description: "(GitHub PR)" },
  { value: "folder",      label: "A folder (or more)", description: "(snapshot)" },
  { value: "custom",      label: "Custom scope description", description: "" },
] as const;

type HandoffPresetValue = (typeof HANDOFF_PRESETS)[number]["value"];

// ---------------------------------------------------------------------------
// Extension entry point
// ---------------------------------------------------------------------------

export default function handoffExtension(pi: ExtensionAPI) {

  async function getSmartDefault(): Promise<HandoffPresetValue> {
    if (await hasUncommittedChanges(pi)) return "uncommitted";
    const current = await getCurrentBranch(pi);
    const def = await getDefaultBranch(pi);
    if (current && current !== def) return "baseBranch";
    return "commit";
  }

  // ---- sub-selectors --------------------------------------------------------

  async function showBranchSelector(ctx: ExtensionCommandContext): Promise<HandoffTarget | null> {
    const branches = await getLocalBranches(pi);
    const current = await getCurrentBranch(pi);
    const def = await getDefaultBranch(pi);
    const candidates = current ? branches.filter((b) => b !== current) : branches;
    if (candidates.length === 0) {
      ctx.ui.notify("No other branches found", "error");
      return null;
    }
    const sorted = candidates.sort((a, b) => (a === def ? -1 : b === def ? 1 : a.localeCompare(b)));
    const items: SelectItem[] = sorted.map((b) => ({
      value: b, label: b, description: b === def ? "(default)" : "",
    }));

    const result = await ctx.ui.custom<string | null>((tui, theme, _kb, done) => {
      const container = new Container();
      container.addChild(new DynamicBorder((s) => theme.fg("accent", s)));
      container.addChild(new Text(theme.fg("accent", theme.bold("Select base branch"))));
      const searchInput = new Input();
      container.addChild(searchInput);
      container.addChild(new Spacer(1));
      const listContainer = new Container();
      container.addChild(listContainer);
      container.addChild(new Text(theme.fg("dim", "Type to filter • enter to select • esc to cancel")));
      container.addChild(new DynamicBorder((s) => theme.fg("accent", s)));

      let filteredItems = items;
      let selectList: SelectList | null = null;

      const updateList = () => {
        listContainer.clear();
        if (filteredItems.length === 0) {
          listContainer.addChild(new Text(theme.fg("warning", "  No matching branches")));
          selectList = null;
          return;
        }
        selectList = new SelectList(filteredItems, Math.min(filteredItems.length, 10), {
          selectedPrefix: (s) => theme.fg("accent", s),
          selectedText: (s) => theme.fg("accent", s),
          description: (s) => theme.fg("muted", s),
          scrollInfo: (s) => theme.fg("dim", s),
          noMatch: (s) => theme.fg("warning", s),
        });
        selectList.onSelect = (item) => done(item.value);
        selectList.onCancel = () => done(null);
        listContainer.addChild(selectList);
      };

      const applyFilter = () => {
        const q = searchInput.getValue();
        filteredItems = q ? fuzzyFilter(items, q, (i) => `${i.label} ${i.value}`) : items;
        updateList();
      };

      applyFilter();

      return {
        render: (w) => container.render(w),
        invalidate: () => container.invalidate(),
        handleInput(data: string) {
          const kb = getEditorKeybindings();
          if (kb.matches(data, "selectUp") || kb.matches(data, "selectDown") ||
              kb.matches(data, "selectConfirm") || kb.matches(data, "selectCancel")) {
            if (selectList) selectList.handleInput(data);
            else if (kb.matches(data, "selectCancel")) done(null);
            tui.requestRender();
            return;
          }
          searchInput.handleInput(data);
          applyFilter();
          tui.requestRender();
        },
      };
    });

    return result ? { type: "baseBranch", branch: result } : null;
  }

  async function showCommitSelector(ctx: ExtensionCommandContext): Promise<HandoffTarget | null> {
    const commits = await getRecentCommits(pi, 20);
    if (commits.length === 0) { ctx.ui.notify("No commits found", "error"); return null; }

    const items: SelectItem[] = commits.map((c) => ({
      value: c.sha, label: `${c.sha.slice(0, 7)} ${c.title}`, description: "",
    }));

    const result = await ctx.ui.custom<{ sha: string; title: string } | null>((tui, theme, _kb, done) => {
      const container = new Container();
      container.addChild(new DynamicBorder((s) => theme.fg("accent", s)));
      container.addChild(new Text(theme.fg("accent", theme.bold("Select commit"))));
      const searchInput = new Input();
      container.addChild(searchInput);
      container.addChild(new Spacer(1));
      const listContainer = new Container();
      container.addChild(listContainer);
      container.addChild(new Text(theme.fg("dim", "Type to filter • enter to select • esc to cancel")));
      container.addChild(new DynamicBorder((s) => theme.fg("accent", s)));

      let filteredItems = items;
      let selectList: SelectList | null = null;

      const updateList = () => {
        listContainer.clear();
        if (filteredItems.length === 0) {
          listContainer.addChild(new Text(theme.fg("warning", "  No matching commits")));
          selectList = null;
          return;
        }
        selectList = new SelectList(filteredItems, Math.min(filteredItems.length, 10), {
          selectedPrefix: (s) => theme.fg("accent", s),
          selectedText: (s) => theme.fg("accent", s),
          description: (s) => theme.fg("muted", s),
          scrollInfo: (s) => theme.fg("dim", s),
          noMatch: (s) => theme.fg("warning", s),
        });
        selectList.onSelect = (item) => {
          const c = commits.find((x) => x.sha === item.value);
          done(c ?? null);
        };
        selectList.onCancel = () => done(null);
        listContainer.addChild(selectList);
      };

      const applyFilter = () => {
        const q = searchInput.getValue();
        filteredItems = q ? fuzzyFilter(items, q, (i) => `${i.label} ${i.value}`) : items;
        updateList();
      };

      applyFilter();

      return {
        render: (w) => container.render(w),
        invalidate: () => container.invalidate(),
        handleInput(data: string) {
          const kb = getEditorKeybindings();
          if (kb.matches(data, "selectUp") || kb.matches(data, "selectDown") ||
              kb.matches(data, "selectConfirm") || kb.matches(data, "selectCancel")) {
            if (selectList) selectList.handleInput(data);
            else if (kb.matches(data, "selectCancel")) done(null);
            tui.requestRender();
            return;
          }
          searchInput.handleInput(data);
          applyFilter();
          tui.requestRender();
        },
      };
    });

    return result ? { type: "commit", sha: result.sha, title: result.title } : null;
  }

  async function showFolderInput(ctx: ExtensionCommandContext): Promise<HandoffTarget | null> {
    const result = await ctx.ui.editor("Enter folders/files (space-separated or one per line):", ".");
    if (!result?.trim()) return null;
    const paths = result.trim().split(/[\s\n]+/).filter((p) => p.length > 0);
    return paths.length > 0 ? { type: "folder", paths } : null;
  }

  async function showCustomInput(ctx: ExtensionCommandContext): Promise<HandoffTarget | null> {
    const result = await ctx.ui.editor("Describe the work to hand off:", "");
    return result?.trim() ? { type: "custom", instructions: result.trim() } : null;
  }

  async function showPrInput(ctx: ExtensionCommandContext): Promise<HandoffTarget | null> {
    if (await hasPendingTrackedChanges(pi)) {
      ctx.ui.notify("Cannot checkout PR: uncommitted changes. Commit or stash them first.", "error");
      return null;
    }
    const prRef = await ctx.ui.editor("Enter PR number or URL:", "");
    if (!prRef?.trim()) return null;

    const prNumber = parsePrReference(prRef);
    if (!prNumber) { ctx.ui.notify("Invalid PR reference.", "error"); return null; }

    ctx.ui.notify(`Fetching PR #${prNumber}...`, "info");
    const prInfo = await getPrInfo(pi, prNumber);
    if (!prInfo) { ctx.ui.notify(`PR #${prNumber} not found. Check gh auth.`, "error"); return null; }

    if (await hasPendingTrackedChanges(pi)) {
      ctx.ui.notify("Cannot checkout PR: uncommitted changes.", "error");
      return null;
    }

    ctx.ui.notify(`Checking out PR #${prNumber}...`, "info");
    const checkout = await checkoutPr(pi, prNumber);
    if (!checkout.success) { ctx.ui.notify(`Checkout failed: ${checkout.error}`, "error"); return null; }

    ctx.ui.notify(`Checked out PR #${prNumber} (${prInfo.headBranch})`, "info");
    return { type: "pullRequest", prNumber, baseBranch: prInfo.baseBranch, title: prInfo.title };
  }

  // ---- main selector --------------------------------------------------------

  async function showHandoffSelector(ctx: ExtensionCommandContext): Promise<HandoffTarget | null> {
    const smartDefault = await getSmartDefault();
    const items: SelectItem[] = HANDOFF_PRESETS.map((p) => ({
      value: p.value, label: p.label, description: p.description,
    }));
    const defaultIndex = items.findIndex((i) => i.value === smartDefault);

    while (true) {
      const result = await ctx.ui.custom<HandoffPresetValue | null>((tui, theme, _kb, done) => {
        const container = new Container();
        container.addChild(new DynamicBorder((s) => theme.fg("accent", s)));
        container.addChild(new Text(theme.fg("accent", theme.bold("Select handoff scope"))));

        const selectList = new SelectList(items, Math.min(items.length, 10), {
          selectedPrefix: (s) => theme.fg("accent", s),
          selectedText: (s) => theme.fg("accent", s),
          description: (s) => theme.fg("muted", s),
          scrollInfo: (s) => theme.fg("dim", s),
          noMatch: (s) => theme.fg("warning", s),
        });

        if (defaultIndex >= 0) selectList.setSelectedIndex(defaultIndex);
        selectList.onSelect = (item) => done(item.value as HandoffPresetValue);
        selectList.onCancel = () => done(null);

        container.addChild(selectList);
        container.addChild(new Text(theme.fg("dim", "Press enter to confirm or esc to cancel")));
        container.addChild(new DynamicBorder((s) => theme.fg("accent", s)));

        return {
          render: (w) => container.render(w),
          invalidate: () => container.invalidate(),
          handleInput(data: string) {
            selectList.handleInput(data);
            tui.requestRender();
          },
        };
      });

      if (!result) return null;

      switch (result) {
        case "uncommitted": return { type: "uncommitted" };
        case "baseBranch": { const t = await showBranchSelector(ctx); if (t) return t; break; }
        case "commit": { const t = await showCommitSelector(ctx); if (t) return t; break; }
        case "pullRequest": { const t = await showPrInput(ctx); if (t) return t; break; }
        case "folder": { const t = await showFolderInput(ctx); if (t) return t; break; }
        case "custom": { const t = await showCustomInput(ctx); if (t) return t; break; }
        default: return null;
      }
    }
  }

  // ---- arg parser -----------------------------------------------------------

  function parseArgs(args: string | undefined): HandoffTarget | { type: "pr"; ref: string } | null {
    if (!args?.trim()) return null;
    const parts = args.trim().split(/\s+/);
    switch (parts[0]?.toLowerCase()) {
      case "uncommitted": return { type: "uncommitted" };
      case "branch": return parts[1] ? { type: "baseBranch", branch: parts[1] } : null;
      case "commit": return parts[1] ? { type: "commit", sha: parts[1], title: parts.slice(2).join(" ") || undefined } : null;
      case "pr": return parts[1] ? { type: "pr", ref: parts[1] } : null;
      case "folder": {
        const paths = parts.slice(1).filter((p) => p.length > 0);
        return paths.length > 0 ? { type: "folder", paths } : null;
      }
      case "custom": {
        const instructions = parts.slice(1).join(" ");
        return instructions ? { type: "custom", instructions } : null;
      }
      default: return null;
    }
  }

  // ---- execute --------------------------------------------------------------

  async function executeHandoff(ctx: ExtensionCommandContext, target: HandoffTarget): Promise<void> {
    const hint = getUserFacingHint(target);
    ctx.ui.notify(`Generating structured handoff: ${hint}`, "info");
    const prompt = await buildHandoffPrompt(pi, target);
    pi.sendUserMessage(prompt);
  }

  // ---- command registration -------------------------------------------------

  pi.registerCommand("handoff", {
    description: "Generate a structured handoff report for completed work",
    handler: async (args, ctx) => {
      if (!ctx.hasUI) {
        ctx.ui.notify("Handoff requires interactive mode", "error");
        return;
      }

      const { code } = await pi.exec("git", ["rev-parse", "--git-dir"]);
      if (code !== 0) {
        ctx.ui.notify("Not a git repository", "error");
        return;
      }

      let target: HandoffTarget | null = null;
      const parsed = parseArgs(args);

      if (parsed) {
        if (parsed.type === "pr") {
          target = await showPrInput(ctx);
        } else {
          target = parsed;
        }
      }

      if (!target) {
        target = await showHandoffSelector(ctx);
      }

      if (!target) {
        ctx.ui.notify("Handoff cancelled", "info");
        return;
      }

      await executeHandoff(ctx, target);
    },
  });
}
