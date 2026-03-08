/**
 * Rose Pine Sub-Bar Theme Extension
 *
 * Configures pi-sub-bar widget to use rose-pine theme colors
 * with proper contrast and color consistency.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import * as fs from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export default function (pi: ExtensionAPI) {
	pi.on("session_start", async (_event, ctx) => {
		const settingsPath = join(homedir(), ".pi", "agent", "pi-sub-bar-settings.json");

		try {
			let settings: any = {};

			// Read existing settings if present
			if (fs.existsSync(settingsPath)) {
				const content = fs.readFileSync(settingsPath, "utf-8");
				settings = JSON.parse(content);
			}

			// Apply rose-pine dark theme to display settings
			if (!settings.display) {
				settings.display = {};
			}

			// Use darkest backgrounds from rose-pine theme
			settings.display.backgroundColor = "customMessageBg"; // surfaceDark1 (#171521)

			// Use rose-pine text colors instead of white
			// Valid values: accent, border, borderAccent, borderMuted, success, error, warning, 
			//              muted, dim, text, selectedBg, userMessageBg, customMessageBg, 
			//              toolPendingBg, toolSuccessBg, toolErrorBg
			settings.display.baseTextColor = "accent"; // iris (#c4a7e7) - subtle purple accent

			// Color scheme and divider settings using theme colors
			settings.display.colorScheme = "usage"; // Color bars by usage level
			settings.display.dividerColor = "dim"; // subtleDark1 (#6e698f)
			settings.display.dividerCharacter = "─";
			settings.display.showBottomDivider = true;
			settings.display.showTopDivider = false;
			settings.display.paddingLeft = 1;
			settings.display.paddingRight = 1;

			// Additional display settings for consistency
			settings.display.showProviderName = true;
			settings.display.showUsageLabels = true;

			// Keybinding to avoid conflict with pi-extension
			if (!settings.keybindings) {
				settings.keybindings = {};
			}
			settings.keybindings.cycleProvider = "ctrl+alt+n"; // Changed from ctrl+alt+p

			// Save updated settings
			fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

			ctx.ui.notify("✓ pi-sub-bar configured with rose-pine colors (accent text, dark bg)", "info");
		} catch (err) {
			ctx.ui.notify(`⚠ Error configuring pi-sub-bar: ${err instanceof Error ? err.message : "unknown"}`, "warning");
		}
	});
}
