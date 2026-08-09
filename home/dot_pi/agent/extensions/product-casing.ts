/**
 * product-casing
 *
 * Rewrites the product name to a preferred casing in the system prompt's PROSE
 * only, every turn, on whatever prompt PI actually built. This replaces the old
 * approach of forking the entire built-in prompt into ~/.pi/agent/SYSTEM.md just
 * to change one word's casing — a fork that silently went stale on every upgrade
 * and lost the dynamically-injected `Available tools:` list.
 *
 * Casing is significant outside prose, so identifiers are left alone. Two guards:
 *
 *  1. Boundary guard. A match is prose only when neither neighbour is a character
 *     that appears in paths, packages, URLs, members, or env vars. This is why a
 *     naive /\bpi\b/ is wrong: `-` and `.` are non-word characters, so \b happily
 *     matches inside `pi-coding-agent` and `~/.pi/agent` and corrupts both.
 *  2. Code guard. Fenced blocks and inline spans are split out and passed through
 *     untouched, so `pi run --headless` survives even mid-span.
 *
 * Drift detection: if a run finds zero occurrences, upstream probably reworded the
 * prompt. That is reported once per session instead of failing silently.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/** Characters that mark a neighbouring token as an identifier rather than prose. */
const IDENTIFIER_CHARACTERS = "A-Za-z0-9_/\\\\.\\-@`~$:";

/** Fenced blocks and inline code spans, captured so `split` keeps them as segments. */
const CODE_SEGMENT = /(```[\s\S]*?```|`[^`\n]*`)/g;

type CasingRule = {
  /** Spellings to rewrite, matched case-insensitively as whole prose words. */
  readonly aliases: readonly string[];
  /** Replacement text. */
  readonly canonical: string;
};

const RULES: readonly CasingRule[] = [{ aliases: ["pi"], canonical: "PI" }];

const escapeForRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildProseMatcher = (aliases: readonly string[]): RegExp => {
  const alternatives = aliases.map(escapeForRegex).join("|");
  return new RegExp(`(?<![${IDENTIFIER_CHARACTERS}])(?:${alternatives})(?![${IDENTIFIER_CHARACTERS}])`, "gi");
};

/**
 * Applies every rule to prose segments, leaving code segments byte-identical.
 *
 * `matches` counts every prose occurrence found, including ones already in the
 * canonical casing. `replacements` counts only the ones actually changed. The
 * distinction matters for drift detection: an already-canonical prompt yields
 * matches > 0 with replacements === 0, which is healthy, whereas a reworded
 * prompt yields matches === 0, which is not.
 */
export const applyProseCasing = (
  text: string,
  rules: readonly CasingRule[] = RULES,
): { text: string; matches: number; replacements: number } => {
  const matchers = rules.map((rule) => ({ matcher: buildProseMatcher(rule.aliases), canonical: rule.canonical }));
  let matches = 0;
  let replacements = 0;

  const rewritten = text
    .split(CODE_SEGMENT)
    .map((segment, index) => {
      const isCodeSegment = index % 2 === 1;
      if (isCodeSegment) {
        return segment;
      }
      return matchers.reduce(
        (prose, { matcher, canonical }) =>
          prose.replace(matcher, (match) => {
            matches += 1;
            if (match === canonical) {
              return match;
            }
            replacements += 1;
            return canonical;
          }),
        segment,
      );
    })
    .join("");

  return { text: rewritten, matches, replacements };
};

export default function (pi: ExtensionAPI) {
  let hasReportedDrift = false;

  pi.on("before_agent_start", async (event) => {
    const { text, matches } = applyProseCasing(event.systemPrompt);

    if (matches === 0 && !hasReportedDrift) {
      hasReportedDrift = true;
      return {
        systemPrompt: text,
        message: {
          customType: "product-casing",
          content:
            "product-casing found no product-name occurrences in the system prompt. Upstream PI may have reworded it — verify extensions/product-casing.ts still matches.",
          display: true,
        },
      };
    }

    return { systemPrompt: text };
  });
}
