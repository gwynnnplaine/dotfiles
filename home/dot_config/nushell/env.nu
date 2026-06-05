# env.nu — runs before config.nu on every shell start (managed by chezmoi)
# Sets environment variables and generates tool integrations.

# ── fzf (fuzzy finder) ────────────────────────────────────────────────────────
# Integration auto-loads from vendor/autoload/fzf.nu (install.sh generates it).
# Use fd for the file walker and bat for previews, matching the old zsh setup.
$env.FZF_DEFAULT_COMMAND = "fd --type f --strip-cwd-prefix --hidden --exclude .git"
$env.FZF_CTRL_T_COMMAND = $env.FZF_DEFAULT_COMMAND
$env.FZF_CTRL_T_OPTS = "--preview 'bat -n --color=always {}'"

# ── Carapace completions ──────────────────────────────────────────────────────
if (which carapace | is-not-empty) {
    $env.CARAPACE_BRIDGES = 'zsh,fish,bash,inshellisense'
    mkdir $"($nu.cache-dir)"
    carapace _carapace nushell | save --force $"($nu.cache-dir)/carapace.nu"
}
