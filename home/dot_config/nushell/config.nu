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

# Per-project Node auto-switch is intentionally disabled. fnm provides the
# default Node only; run `fnm use` manually when a project needs another version.

# ── Editor ────────────────────────────────────────────────────────────────────
$env.EDITOR = "nvim"

# ── Aliases ───────────────────────────────────────────────────────────────────
alias ..  = cd ..
alias ... = cd ../..

# git
alias g   = git
alias gs  = git status
alias ga  = git add
alias gp  = git push
alias gl  = git pull
alias gco = git checkout
alias gd  = git diff
alias gb  = git branch
alias lg  = lazygit

# listing — bare `ls` stays Nu's builtin (structured output); eza powers these
alias ll  = eza -lh --icons --group-directories-first
alias la  = eza -lah --icons --group-directories-first
alias lt  = eza --tree --icons --level=2

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

# ── Starship prompt, zoxide & fzf ─────────────────────────────────────────────
# Activated via $nu.data-dir/vendor/autoload/{starship,zoxide,fzf}.nu, which
# Nushell auto-loads on every start. install.sh regenerates them on a new
# machine. fzf binds Ctrl-T (files), Ctrl-R (history), Alt-C (cd).
