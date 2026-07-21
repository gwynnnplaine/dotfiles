/**
 * standards-guard
 *
 * Deterministic post-edit gate. After the built-in `edit`/`write` tools touch a
 * `.ts`/`.tsx` file inside an AGENTS.md project, it scans ONLY the text the agent
 * just wrote and appends a `standards-guard` report to that tool result, so the
 * model reads its own AGENTS.md violations inline and fixes them before moving on.
 *
 * Two tiers:
 *  - Violations (provable from the text): banned comments, banned casts.
 *  - Smells (judgment, may be intentional): boolean blindness, vague/ill-prefixed names.
 *
 * The scan is diff-scoped (just-written text only), so the oxlint baseline of
 * grandfathered legacy code never leaks in as noise. Advisory only: `isError`
 * stays false — the write did happen.
 */

import type { ExtensionAPI, ExtensionContext, ToolResultEvent, ToolResultEventResult } from "@earendil-works/pi-coding-agent";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export type StandardsTier = "violation" | "smell";
export type StandardsRule = "comment" | "cast" | "boolean" | "naming";

export interface StandardsFinding {
	readonly tier: StandardsTier;
	readonly rule: StandardsRule;
	readonly lineText: string;
	readonly hint: string;
}

const COMMENT_HINT = "Express intent in code or delete. Only `// SAFETY:` above a cast or JSDoc on exports is allowed.";
const CAST_HINT = "Type it, narrow it, or parse it. Never bridge with a cast.";
const BOOL_HINT_FLAG = "Flag arg or contradictory field? Prefer a union so the call site reads.";
const BOOL_HINT_UNPREFIXED = "Boolean without is/has/can/should — and a bare boolean is often a union in disguise.";

const VAGUE_NAMES = new Set(["data", "info", "temp", "tmp", "stuff", "thing", "foo", "bar", "baz"]);
const VAGUE_FUNCTIONS = new Set(["handle", "process"]);
const BOOLEAN_PREFIX = /^(is|has|can|should|will|are|was|did|does)/;
const LINT_DIRECTIVE = /^(eslint\b|oxlint\b|prettier\b|biome\b|@ts-|v8 ignore|c8 ignore|istanbul|deno-lint|dprint|#?region|#?endregion|<reference)/i;

function detectComment(trimmed: string): StandardsFinding | undefined {
	if (trimmed.startsWith("//")) {
		const body = trimmed.slice(2).trimStart();
		if (body.startsWith("SAFETY:")) return undefined;
		if (LINT_DIRECTIVE.test(body)) return undefined;
		return { tier: "violation", rule: "comment", lineText: trimmed, hint: COMMENT_HINT };
	}
	if (trimmed.startsWith("/*") && !trimmed.startsWith("/**")) {
		return { tier: "violation", rule: "comment", lineText: trimmed, hint: COMMENT_HINT };
	}
	return undefined;
}

function detectCasts(line: string, trimmed: string): StandardsFinding[] {
	const out: StandardsFinding[] = [];
	if (/\bas\s+(any|unknown|never)\b/.test(line)) {
		out.push({ tier: "violation", rule: "cast", lineText: trimmed, hint: CAST_HINT });
	}
	if (/@ts-(ignore|expect-error|nocheck)\b/.test(line)) {
		out.push({ tier: "violation", rule: "cast", lineText: trimmed, hint: CAST_HINT });
	}
	return out;
}

function detectBooleanSmells(line: string, trimmed: string): StandardsFinding[] {
	const out: StandardsFinding[] = [];
	for (const match of line.matchAll(/([A-Za-z_$][\w$]*)\s*\??\s*:\s*boolean\b/g)) {
		const before = line.slice(0, match.index ?? 0).trimEnd();
		if (before.endsWith(")")) continue;
		const name = match[1] ?? "";
		const hint = BOOLEAN_PREFIX.test(name) ? BOOL_HINT_FLAG : BOOL_HINT_UNPREFIXED;
		out.push({ tier: "smell", rule: "boolean", lineText: trimmed, hint });
	}
	return out;
}

function detectNamingSmells(line: string, trimmed: string): StandardsFinding[] {
	const out: StandardsFinding[] = [];
	for (const match of line.matchAll(/\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) {
		const name = match[1] ?? "";
		if (VAGUE_NAMES.has(name)) {
			out.push({ tier: "smell", rule: "naming", lineText: trimmed, hint: `"${name}" says nothing — name what it holds.` });
		} else if (VAGUE_FUNCTIONS.has(name)) {
			out.push({ tier: "smell", rule: "naming", lineText: trimmed, hint: `"${name}" is a vague verb — name the action.` });
		}
	}
	const boolAssign = line.match(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::\s*[^=]+)?=\s*(?:true|false)\b/);
	if (boolAssign) {
		const name = boolAssign[1] ?? "";
		if (!BOOLEAN_PREFIX.test(name)) {
			out.push({ tier: "smell", rule: "naming", lineText: trimmed, hint: `boolean "${name}" needs an is/has/can/should prefix.` });
		}
	}
	return out;
}

export function scanStandards(text: string): StandardsFinding[] {
	const findings: StandardsFinding[] = [];
	const seen = new Set<string>();
	for (const raw of text.split("\n")) {
		const trimmed = raw.trim();
		if (trimmed.length === 0) continue;
		const candidates: StandardsFinding[] = [];
		const comment = detectComment(trimmed);
		if (comment) candidates.push(comment);
		candidates.push(...detectCasts(raw, trimmed));
		candidates.push(...detectBooleanSmells(raw, trimmed));
		candidates.push(...detectNamingSmells(raw, trimmed));
		for (const finding of candidates) {
			const key = `${finding.rule}::${finding.lineText}::${finding.hint}`;
			if (seen.has(key)) continue;
			seen.add(key);
			findings.push(finding);
		}
	}
	return findings;
}

export interface LocatedFinding extends StandardsFinding {
	readonly lineNo: number | undefined;
}

function locate(absPath: string, findings: readonly StandardsFinding[]): LocatedFinding[] {
	const firstLineByTrim = new Map<string, number>();
	try {
		const fileLines = readFileSync(absPath, "utf8").split("\n");
		fileLines.forEach((fileLine, index) => {
			const key = fileLine.trim();
			if (!firstLineByTrim.has(key)) firstLineByTrim.set(key, index + 1);
		});
	} catch {
		return findings.map((finding) => ({ ...finding, lineNo: undefined }));
	}
	return findings.map((finding) => ({ ...finding, lineNo: firstLineByTrim.get(finding.lineText) }));
}

export function formatReport(relPath: string, located: readonly LocatedFinding[]): string {
	const violations = located.filter((finding) => finding.tier === "violation");
	const smells = located.filter((finding) => finding.tier === "smell");
	const lines: string[] = [];
	const verb = violations.length > 0 ? "Fix before continuing." : "Consider before continuing.";
	lines.push(`⚠ standards-guard — you just wrote code that trips AGENTS.md. ${verb}`);
	const renderGroup = (title: string, group: readonly LocatedFinding[]) => {
		if (group.length === 0) return;
		lines.push("");
		lines.push(title);
		for (const finding of group) {
			const at = finding.lineNo === undefined ? relPath : `${relPath}:${finding.lineNo}`;
			lines.push(`  ${at}  ${finding.rule}  →  ${finding.lineText}`);
			lines.push(`     ${finding.hint}`);
		}
	};
	renderGroup("Violations (provable):", violations);
	renderGroup("Smells (judgment — say why if you keep them):", smells);
	return lines.join("\n");
}

function pickString(record: Record<string, unknown>, keys: readonly string[]): string | undefined {
	for (const key of keys) {
		const value = record[key];
		if (typeof value === "string" && value.length > 0) return value;
	}
	return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function extractWrittenText(input: Record<string, unknown>): string {
	const parts: string[] = [];
	const content = input.content;
	if (typeof content === "string") parts.push(content);
	const edits = input.edits;
	if (Array.isArray(edits)) {
		for (const edit of edits) {
			if (isRecord(edit) && typeof edit.newText === "string") parts.push(edit.newText);
		}
	}
	return parts.join("\n");
}

function isSupportedFile(absPath: string): boolean {
	if (absPath.endsWith(".d.ts")) return false;
	return absPath.endsWith(".ts") || absPath.endsWith(".tsx");
}

function isGuardedProject(absPath: string): boolean {
	let dir = path.dirname(absPath);
	while (true) {
		if (existsSync(path.join(dir, "AGENTS.md"))) return true;
		if (existsSync(path.join(dir, ".oxlintrc.jsonc"))) return true;
		if (existsSync(path.join(dir, ".oxlintrc.json"))) return true;
		const parent = path.dirname(dir);
		if (parent === dir) return false;
		dir = parent;
	}
}

export default function standardsGuard(pi: ExtensionAPI): void {
	pi.on("tool_result", (event: ToolResultEvent, ctx: ExtensionContext): ToolResultEventResult | undefined => {
		try {
			if (event.toolName !== "edit" && event.toolName !== "write") return undefined;
			if (event.isError) return undefined;
			const rawPath = pickString(event.input, ["path", "filePath", "file_path"]);
			if (!rawPath) return undefined;
			const absPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(ctx.cwd, rawPath);
			if (!isSupportedFile(absPath)) return undefined;
			if (!isGuardedProject(absPath)) return undefined;
			const written = extractWrittenText(event.input);
			if (written.length === 0) return undefined;
			const findings = scanStandards(written);
			if (findings.length === 0) return undefined;
			const relPath = path.relative(ctx.cwd, absPath) || absPath;
			const report = formatReport(relPath, locate(absPath, findings));
			return { content: [...event.content, { type: "text", text: report }] };
		} catch {
			return undefined;
		}
	});
}
