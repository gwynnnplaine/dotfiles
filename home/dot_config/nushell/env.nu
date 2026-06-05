# env.nu — runs before config.nu on every shell start (managed by chezmoi)
# Sets environment variables and generates tool integrations.

# ── Carapace completions ──────────────────────────────────────────────────────
if (which carapace | is-not-empty) {
    $env.CARAPACE_BRIDGES = 'zsh,fish,bash,inshellisense'
    mkdir $"($nu.cache-dir)"
    carapace _carapace nushell | save --force $"($nu.cache-dir)/carapace.nu"
}
