/**
 * oh-pi Auto Session Name Extension
 *
 * Automatically names sessions based on the first user message.
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

export default function (pi: ExtensionAPI) {
  let named = false;

  pi.on("session_start", async (_event, ctx) => {
    named = !!pi.getSessionName();
  });

  pi.on("agent_end", async (event) => {
    if (named) return;
    const userMsg = event.messages.find((m) => m.role === "user");
    if (!userMsg) return;
    const text = typeof userMsg.content === "string"
      ? userMsg.content
      : userMsg.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join(" ");
    if (!text) return;
    const name = text.slice(0, 60).replace(/\n/g, " ").trim();
    if (name) {
      try {
        const sessionPath = pi.getSessionPath?.();
        if (sessionPath) {
          const dir = dirname(sessionPath);
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
          }
        }
      } catch {
        // Silently continue if directory creation fails
      }
      pi.setSessionName(name);
      named = true;
    }
  });
}
