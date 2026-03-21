import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { spawnSync } from "node:child_process";

const DARK_THEME = "rose-pine";
const LIGHT_THEME = "rose-pine-dawn";

function isMacOsDarkMode(): boolean {
  if (process.platform !== "darwin") {
    throw new Error("auto-system-rose-pine-theme supports macOS only");
  }

  const result = spawnSync("defaults", ["read", "-g", "AppleInterfaceStyle"], {
    encoding: "utf8",
  });

  if (result.status === 0) {
    return result.stdout.trim() === "Dark";
  }

  const lightModeDetected =
    result.status === 1 &&
    (result.stderr.includes("does not exist") || result.stderr.includes("not found"));

  if (lightModeDetected) {
    return false;
  }

  throw new Error(
    `failed to detect system appearance (status=${result.status} stderr=${result.stderr.trim()})`,
  );
}

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    const availableThemeNames = new Set(ctx.ui.getAllThemes().map((theme) => theme.name));

    if (!availableThemeNames.has(DARK_THEME)) {
      throw new Error(`missing theme: ${DARK_THEME}`);
    }

    if (!availableThemeNames.has(LIGHT_THEME)) {
      throw new Error(`missing theme: ${LIGHT_THEME}`);
    }

    const useDarkTheme = isMacOsDarkMode();
    const selectedTheme = useDarkTheme ? DARK_THEME : LIGHT_THEME;

    ctx.ui.setTheme(selectedTheme);
    ctx.ui.notify(`theme: ${selectedTheme} (system=${useDarkTheme ? "dark" : "light"})`, "info");
  });
}
