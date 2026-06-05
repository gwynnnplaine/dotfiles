# config.nu — main Nushell configuration (managed by chezmoi)

# ── PATH ──────────────────────────────────────────────────────────────────────
$env.PATH ++= [
    "~/.local/bin"
    "~/.local/share/bob/nvim-bin"
    "/opt/homebrew/bin"
    "/opt/homebrew/sbin"
    "/Applications/cmux.app/Contents/Resources/bin"
    $"($env.HOME)/Library/pnpm"
]

# ── fnm (Node Version Manager) ────────────────────────────────────────────────
# nvm is bash-only; fnm is the nushell-compatible alternative.
if (which fnm | is-not-empty) {
    load-env (fnm env --shell bash | lines
        | str replace 'export ' ''
        | str replace -a '"' ''
        | split column '='
        | rename name value
        | where name != "FNM_ARCH" and name != "PATH"
        | reduce -f {} {|it, acc| $acc | upsert $it.name $it.value })
    $env.PATH = ($env.PATH | prepend $"($env.FNM_MULTISHELL_PATH)/bin")
}

# ── Editor ────────────────────────────────────────────────────────────────────
$env.EDITOR = "nvim"

# ── Aliases ───────────────────────────────────────────────────────────────────
alias ll  = ls -la
alias la  = ls -a
alias ..  = cd ..
alias ... = cd ../..
alias g   = git
alias lg  = lazygit

# ── Nu settings ───────────────────────────────────────────────────────────────
$env.config = {
    show_banner: false
    history: {
        max_size: 10_000
        sync_on_enter: true
        file_format: "sqlite"
    }
    completions: {
        case_sensitive: false
        quick: true
        algorithm: "fuzzy"
    }
}

# ── Carapace completions ──────────────────────────────────────────────────────
# env.nu generates carapace.nu into the cache dir; source it if present.
let carapace_cache = $"($nu.cache-dir)/carapace.nu"
if ($carapace_cache | path exists) {
    source $"($nu.cache-dir)/carapace.nu"
}

# ── Starship prompt & zoxide ──────────────────────────────────────────────────
# Activated via $nu.data-dir/vendor/autoload/{starship,zoxide}.nu, which Nushell
# auto-loads on every start. install.sh regenerates them on a new machine.
