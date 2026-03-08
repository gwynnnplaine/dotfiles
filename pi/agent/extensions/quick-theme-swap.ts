import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.registerCommand("theme", {
    description: "Quick theme swap",
    handler: async (_args, ctx) => {
      const availableThemes = ctx.ui.getAllThemes();
      const themeNames = availableThemes.map((t) => t.name);
      
      if (themeNames.length === 0) {
        ctx.ui.notify("No themes available", "warning");
        return;
      }
      
      const selected = await ctx.ui.select("Select Theme", themeNames);
      if (selected) {
        ctx.ui.setTheme(selected);
        ctx.ui.notify(`Theme set to ${selected}`, "success");
      }
    },
  });
}
