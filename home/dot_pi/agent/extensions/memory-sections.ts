/**
 * memory-sections
 *
 * Makes @amaster.ai/pi-memory's snapshot reach the model under pi-claude-bridge.
 *
 * pi-memory appends its snapshot by returning `systemPrompt` from
 * `before_agent_start`. The bridge drops that route and forwards only structured
 * prompt parts, so the memory never arrives. This extension republishes the same
 * snapshot as a `memory` prompt section, which the bridge forwards.
 *
 * It reuses pi-memory's own snapshot entry instead of reading the files, so the
 * text stays sanitized by pi-memory's threat scanner, frozen per session (cache
 * stable), refreshed after compaction, and branch-aware.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/** Custom entry type pi-memory writes at session start and after compaction. */
const SNAPSHOT_ENTRY = "pi-memory:system-prompt-snapshot";

const SECTION = "memory";

const GUIDANCE =
  "Persistent memory from pi-memory, frozen for this session. Save durable facts and user preferences with memory_add, fix them with memory_replace or memory_remove, and read live state with memory_read.";

type SessionEntry = { readonly type: string; readonly customType?: string; readonly data?: unknown };

/** Parses a pi-memory snapshot entry; anything else yields undefined. */
const parseSnapshot = (entry: SessionEntry): string | undefined => {
  if (entry.type !== "custom" || entry.customType !== SNAPSHOT_ENTRY) return undefined;
  const data = entry.data;
  if (typeof data !== "object" || data === null || !("snapshot" in data)) return undefined;
  const snapshot = (data as { snapshot: unknown }).snapshot;
  return typeof snapshot === "string" && snapshot.trim() !== "" ? snapshot : undefined;
};

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", (event, ctx) => {
    const branch = ctx.sessionManager.getBranch() as readonly SessionEntry[];
    const snapshot = branch.map(parseSnapshot).findLast((text) => text !== undefined);
    if (snapshot === undefined) {
      delete event.systemPromptOptions.sections[SECTION];
      return;
    }
    event.systemPromptOptions.sections[SECTION] = `${GUIDANCE}\n\n${snapshot}`;
  });
}
