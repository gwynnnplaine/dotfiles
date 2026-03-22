/**
 * Syncs pi theme with macOS system appearance (dark/light mode).
 * Configure which themes to use in ~/.pi/agent/system-theme.json:
 *   { "dark": "rose-pine", "light": "rose-pine-dawn" }
 */

import { exec } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const execAsync = promisify(exec);

const CONFIG_PATH = join(homedir(), ".pi", "agent", "system-theme.json");
const DEFAULTS = { dark: "dark", light: "light" };

function readConfig(): { dark: string; light: string } {
	try {
		return { ...DEFAULTS, ...JSON.parse(readFileSync(CONFIG_PATH, "utf8")) };
	} catch {
		return DEFAULTS;
	}
}

async function isDarkMode(): Promise<boolean> {
	try {
		const { stdout } = await execAsync(
			"osascript -e 'tell application \"System Events\" to tell appearance preferences to return dark mode'",
		);
		return stdout.trim() === "true";
	} catch {
		return false;
	}
}

export default function (pi: ExtensionAPI) {
	let intervalId: ReturnType<typeof setInterval> | null = null;

	pi.on("session_start", async (_event, ctx) => {
		const config = readConfig();
		let currentTheme = (await isDarkMode()) ? config.dark : config.light;
		ctx.ui.setTheme(currentTheme);

		intervalId = setInterval(async () => {
			const cfg = readConfig();
			const newTheme = (await isDarkMode()) ? cfg.dark : cfg.light;
			if (newTheme !== currentTheme) {
				currentTheme = newTheme;
				ctx.ui.setTheme(currentTheme);
			}
		}, 2000);
	});

	pi.on("session_shutdown", () => {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	});
}
