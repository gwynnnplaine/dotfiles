# AGENTS.md — dotfiles workflow & best practices

How to work in this repo (for both humans and coding agents). These are the
conventions this repo is set up around; follow them so `chezmoi status` stays
meaningful and machines stay in sync.

## What this repo is

chezmoi-managed dotfiles. The source state lives under `home/`
(`.chezmoiroot` points there). chezmoi renders `home/` into the home directory.

- **Canonical source dir**: `~/.local/share/chezmoi` (set up via `chezmoi init`).
- **Remote**: `github.com/gwynnnplaine/dotfiles`.
- Edit the source under `home/`, never the rendered files in `$HOME` directly.

### Source naming (chezmoi attributes)

Files in `home/` use chezmoi prefixes, not literal names:

- `dot_foo` → `~/.foo`
- `executable_foo` → `~/foo` with mode `0755`
- `literal_run_foo` → `~/run_foo` (the `literal_` guard stops `run_` being
  treated as a script). Attributes combine in order, e.g.
  `executable_literal_run_loop.py`.

## Source of truth boundaries

- This repo manages: `~/.config/{ghostty,nvim,lazygit,nushell}/**`,
  `~/.zshrc`, `~/.zprofile`.
- This repo does **not** manage `~/.pi`. That path is owned solely by the
  `i-love-this-shitty-agent` repo (`link-to-pi.sh`). It is listed in
  `home/.chezmoiignore`. Never add anything under `.pi` here.

## Shell & PATH

The daily shell is **Nushell**. zsh is a thin POSIX login bootstrap that sets
the environment, then hands off to Nu:

- `~/.zprofile` — login: `brew shellenv` (Homebrew PATH/MANPATH/INFOPATH).
- `~/.zshrc` — sets PATH/secrets/locale, then `exec nu` for interactive use.
  Escape to plain zsh: just type `zsh` (`NU_LAUNCHED` is already set, so it
  won't bounce back); return with `nu` or `exit`.
- `~/.config/nushell/{env.nu,config.nu}` — the real interactive config (PATH,
  aliases, prompt, completions). On macOS Nu reads
  `~/Library/Application Support/nushell`, which `install.sh` symlinks to
  `~/.config/nushell`.

### Adding to PATH

- **For Nushell (the daily shell)** — edit the `$env.PATH` block in `config.nu`:
  ```nu
  $env.PATH ++= ["~/some/bin"]                     # append
  $env.PATH = ($env.PATH | prepend "~/some/bin")   # prepend (takes priority)
  ```
- **For zsh (login / escape hatch; also inherited by Nu)** — add to `~/.zshrc`:
  ```sh
  export PATH="$HOME/some/bin:$PATH"
  ```
  Use zsh only for things that must exist before Nu starts; otherwise prefer
  `config.nu`. Aliases go in the `config.nu` aliases block (e.g.
  `alias lg = lazygit`).

Edit via `chezmoi edit ~/.config/nushell/config.nu`, then `chezmoi apply`.

## Daily workflow (canonical source — no `-S` flag)

```bash
chezmoi update            # git pull in source + apply  ← routine sync
chezmoi diff              # preview pending changes
chezmoi apply             # apply (prompts before clobbering a local edit)
chezmoi edit <file>       # edit the source for a target, e.g. ~/.config/ghostty/config
chezmoi cd                # cd into the source repo to git commit / push
```

Rules:

- Routine sync is `chezmoi update`. Don't hand-edit rendered files in `$HOME`.
- Keep the **interactive prompt** (default) as the safety net; only use
  `--force` in non-interactive/scripted runs.
- After editing source, run `chezmoi diff` before `chezmoi apply`.

## Best practices (enforced conventions)

1. **Executable bit via `executable_`, never a chmod script.** chezmoi ignores
   git's exec bit, so use the `executable_` source prefix
   (`chezmoi chattr +executable <target>` renames the source correctly, even
   with existing attributes). Do **not** reintroduce a `run_after` chmod script —
   it makes those files perpetually show as `MM` in `chezmoi status`.
2. **`chezmoi status` must be clean** when nothing is pending. A dirty status
   should mean a real, intentional change.
3. **Identical config across machines.** Both MacBooks run the same config.
   Only templatize a value (`.tmpl` + per-machine `chezmoi.toml`) when it
   genuinely must differ — don't pre-template speculatively.
4. **Minimal, related changes.** Don't churn unrelated files. Commit with
   Conventional Commits (`feat`, `fix`, `refactor`, `chore`, …).

## Node (single source of truth)

- **fnm is the only Node version manager.** It works in Nushell (wired in
  `dot_config/nushell/config.nu` via `fnm env`) and auto-switches per project
  from `.node-version` / `.nvmrc` (PWD hook; fnm's `--use-on-cd` flag freezes
  Nushell, so a hook with `--install-if-missing` is used instead).
- **Global CLIs (e.g. `pi`) live in the fnm default version.** Each fnm Node
  version has isolated global packages, so on upgrade:
  `fnm install <new> --reinstall-packages-from=default && fnm default <new>`.
- **Homebrew `node` is kept only as a dependency** for brew formulae
  (`opencode`, `mongosh`, `mongodb-community`); never used directly. fnm's Node
  wins on PATH in interactive shells.
- **nvm is not used** (bash-only, redundant). Do not reintroduce it.
- **Pi**: `@earendil-works/pi-coding-agent` (moved from `@mariozechner` on
  2026-05-07). Install: `npm install -g --ignore-scripts @earendil-works/pi-coding-agent`.

## New machine setup

```bash
chezmoi init --apply gwynnnplaine/dotfiles
```

Clones into `~/.local/share/chezmoi` and applies. `install.sh` is an optional
bootstrap that also runs `brew bundle`, symlinks the macOS App Support paths
(Lazygit, Nushell) to `~/.config`, and generates Nushell's starship/zoxide/fzf
autoload scripts. (Ghostty/cmux read `~/.config/ghostty/config` directly.)

## Adding a new managed file

```bash
chezmoi add ~/.config/foo/bar          # import existing file into source
chezmoi add --template ~/.config/...   # import as a template
chezmoi chattr +executable ~/path      # mark a script executable
```

Then `chezmoi cd`, commit, and push so the other machine gets it via
`chezmoi update`.
