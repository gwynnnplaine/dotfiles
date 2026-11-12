/**
 * hide-memory-status
 *
 * Hides @amaster.ai/pi-memory's "memory: loaded" / "memory: empty" footer
 * status. pi-memory has no setting for it. Failures ("memory: unavailable")
 * stay visible.
 *
 * Load order between this extension and pi-memory is not guaranteed, so this
 * both filters future setStatus calls on the shared UI context (when it runs
 * first) and clears the status directly (when it runs after).
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

/** Status key pi-memory uses in ctx.ui.setStatus. */
const STATUS_KEY = "pi-memory";

const HIDDEN = new Set(["memory: loaded", "memory: empty"]);

const patched = new WeakSet<object>();

const hide = (ctx: ExtensionContext): void => {
  const ui = ctx.ui;
  if (!patched.has(ui)) {
    patched.add(ui);
    const setStatus = ui.setStatus.bind(ui);
    ui.setStatus = (key, text) => {
      if (key === STATUS_KEY && text !== undefined && HIDDEN.has(text)) return setStatus(key, undefined);
      return setStatus(key, text);
    };
  }
  ui.setStatus(STATUS_KEY, undefined);
};

export default function (pi: ExtensionAPI) {
  pi.on("session_start", (_event, ctx) => hide(ctx));
  pi.on("session_compact", (_event, ctx) => hide(ctx));
  pi.on("session_tree", (_event, ctx) => hide(ctx));
}
