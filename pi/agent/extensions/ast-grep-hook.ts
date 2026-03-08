/**
 * AST-Grep Hook - Redirect grep to ast-grep for structural code search
 *
 * Blocks grep tool calls and guides the agent to use ast-grep instead.
 * ast-grep is superior for code search because it understands syntax,
 * avoiding false positives in strings/comments and enabling precise
 * structural queries across multiple files.
 *
 * Usage:
 * - Agent attempts grep → blocked with suggestion to use ast-grep
 * - Agent learns to use bash tool with: ast-grep --lang <lang> -p '<pattern>'
 * - Supports all languages: js, ts, python, rust, go, java, c, cpp, etc.
 *
 * Examples:
 * - Find function calls: ast-grep --lang js -p 'console.log(...)'
 * - Find variable assignments: ast-grep --lang ts -p 'const $VAR = $_'
 * - Complex patterns: ast-grep --lang python -p 'def $FUNC($ARGS): ...'
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName !== "grep") return;

		const input = event.input as any;
		const pattern = input.pattern || "";
		const directory = input.directory || input.paths?.[0] || ".";

		// Infer language from directory/file context
		const langMap: Record<string, string> = {
			".js": "js",
			".jsx": "js",
			".ts": "ts",
			".tsx": "ts",
			".py": "python",
			".rs": "rust",
			".go": "go",
			".java": "java",
			".c": "c",
			".cpp": "cpp",
			".cc": "cpp",
			".h": "c",
			".hpp": "cpp",
			".rb": "ruby",
			".php": "php",
			".swift": "swift",
			".kt": "kotlin",
		};

		let detectedLang = "unknown";
		for (const [ext, lang] of Object.entries(langMap)) {
			if (directory.includes(ext)) {
				detectedLang = lang;
				break;
			}
		}

		// Block grep and send guidance
		pi.sendUserMessage(
			[
				{
					type: "text",
					text: `**ast-grep is preferred over grep for code search.** grep was blocked to encourage structural queries.

Instead of \`grep "${pattern}" ${directory}\`, use:

\`\`\`bash
ast-grep --lang ${detectedLang} -p '${pattern}'
\`\`\`

**Why ast-grep?**
- Understands syntax, ignores matches in strings/comments
- Captures semantic intent (function names, variable assignments, etc.)
- Returns precise matches without false positives
- Supports named capture groups for complex queries

**Supported languages:** js, ts, python, rust, go, java, c, cpp, ruby, php, swift, kotlin, etc.

**Examples:**
- Find function calls: \`ast-grep --lang js -p 'console.log(...)'\`
- Find assignments: \`ast-grep --lang ts -p 'const $VAR = $_'\`
- Find class methods: \`ast-grep --lang python -p 'def $FUNC($ARGS): ...'\`

Adjust language if you meant a different file type.`,
				},
			],
			{ deliverAs: "steer" },
		);

		return { block: true, reason: "Use ast-grep for code search instead" };
	});
}
