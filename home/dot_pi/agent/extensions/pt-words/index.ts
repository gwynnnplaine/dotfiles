/**
 * pt-words
 *
 * Passive European Portuguese vocabulary. One word sits in a widget under the
 * editor; after each agent reply it moves on. Words come from a fixed
 * high-frequency list, at most NEW_WORDS_PER_DAY new ones per day, and each
 * word returns on a spaced schedule (10 min, 1 d, 3 d, 7 d, 21 d) until it is
 * retired as learned. No model involvement: replies stay clean.
 *
 * Progress lives in ~/.pi/agent/pt-words.json, outside any session, and is
 * re-read before every update so parallel Pi sessions do not clobber it badly.
 *
 * Commands: /pt (stats), /pt skip (I know this word), /pt off, /pt on.
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import {
	dayKeyOf,
	emptyProgress,
	expose,
	NEW_WORDS_PER_DAY,
	parseProgress,
	pickNext,
	type Progress,
	serializeProgress,
	skipCurrent,
	statsOf,
} from "./core.ts";
import { hintOf } from "./hints.ts";
import { WORDS } from "./words.ts";

const STATE_PATH = path.join(homedir(), ".pi", "agent", "pt-words.json");
const WIDGET_KEY = "pt-words";

type Loaded =
	| { readonly kind: "loaded"; readonly progress: Progress }
	| { readonly kind: "corrupt"; readonly error: string; readonly backupPath: string };

function load(): Loaded {
	if (!existsSync(STATE_PATH)) {
		return { kind: "loaded", progress: emptyProgress };
	}
	const parsed = ((): ReturnType<typeof parseProgress> => {
		try {
			return parseProgress(JSON.parse(readFileSync(STATE_PATH, "utf8")));
		} catch (error) {
			return { ok: false, error: error instanceof Error ? error.message : String(error) };
		}
	})();
	if (parsed.ok) {
		return { kind: "loaded", progress: parsed.value };
	}
	const backupPath = `${STATE_PATH}.corrupt-${Date.now()}`;
	renameSync(STATE_PATH, backupPath);
	return { kind: "corrupt", error: parsed.error, backupPath };
}

function save(progress: Progress): void {
	const tmpPath = `${STATE_PATH}.${process.pid}.tmp`;
	writeFileSync(tmpPath, serializeProgress(progress));
	renameSync(tmpPath, STATE_PATH);
}

function loadOrReport(ctx: ExtensionContext): Progress {
	const loaded = load();
	if (loaded.kind === "corrupt") {
		ctx.ui.notify(`pt-words: progress file was invalid (${loaded.error}); moved to ${loaded.backupPath}, starting fresh.`, "warning");
		return emptyProgress;
	}
	return loaded.progress;
}

function render(ctx: ExtensionContext, progress: Progress): void {
	const word = WORDS.find((candidate) => candidate.id === progress.current);
	if (progress.display === "off" || word === undefined) {
		ctx.ui.setWidget(WIDGET_KEY, undefined);
		return;
	}
	const { theme } = ctx.ui;
	const gap = "  ";
	const sounds = [word.ipa, `[${word.say}]`].filter((part) => part !== undefined).join(gap);
	const hint = hintOf(word);
	const parts = [theme.fg("dim", "PT"), theme.fg("accent", word.id), theme.fg("dim", sounds), theme.fg("muted", `—${gap}${word.uk}`)];
	const line = [...parts, ...(hint === undefined ? [] : [theme.fg("dim", `·${gap}${hint}`)])].join(gap);
	ctx.ui.setWidget(
		WIDGET_KEY,
		() => ({
			render: (width: number): string[] => [truncateToWidth(` ${line}`, width)],
			invalidate: (): void => {},
		}),
		{ placement: "aboveEditor" },
	);
}

function advance(progress: Progress): Progress {
	const now = new Date();
	const today = dayKeyOf(now);
	return expose(progress, pickNext(WORDS, progress, now.getTime(), today), now.getTime(), today);
}

function update(ctx: ExtensionContext, change: (progress: Progress) => Progress): Progress {
	const progress = change(loadOrReport(ctx));
	save(progress);
	render(ctx, progress);
	return progress;
}

const isActive = (ctx: ExtensionContext): boolean => ctx.mode === "tui" && ctx.hasUI;

export default function (pi: ExtensionAPI) {
	pi.on("session_start", async (_event, ctx) => {
		if (!isActive(ctx)) {
			return;
		}
		update(ctx, (progress) => (progress.current === undefined ? advance(progress) : progress));
	});

	pi.on("agent_end", async (_event, ctx) => {
		if (!isActive(ctx)) {
			return;
		}
		update(ctx, (progress) => (progress.display === "off" ? progress : advance(progress)));
	});

	pi.registerCommand("pt", {
		description: "Portuguese words: stats, skip (I know it), on, off",
		getArgumentCompletions: (prefix) =>
			["skip", "on", "off"].filter((option) => option.startsWith(prefix)).map((option) => ({ value: option, label: option })),
		handler: async (args, ctx) => {
			const command = args.trim();
			switch (command) {
				case "": {
					const progress = loadOrReport(ctx);
					const stats = statsOf(WORDS, progress, dayKeyOf(new Date()));
					ctx.ui.notify(
						`pt-words: ${stats.learning} learning, ${stats.learned} learned, ${stats.skipped} skipped, ${stats.unseen} unseen; new today ${stats.newToday}/${NEW_WORDS_PER_DAY}.`,
						"info",
					);
					return;
				}
				case "skip":
					update(ctx, (progress) => advance(skipCurrent(progress)));
					return;
				case "on":
				case "off":
					update(ctx, (progress) => {
						const toggled: Progress = { ...progress, display: command };
						return command === "on" && toggled.current === undefined ? advance(toggled) : toggled;
					});
					return;
				default:
					ctx.ui.notify(`pt-words: unknown argument "${command}". Use: /pt, /pt skip, /pt on, /pt off.`, "warning");
			}
		},
	});
}
