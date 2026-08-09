# dotfiles

Managed with [chezmoi](https://www.chezmoi.io/) for reproducible, idempotent setup.

## Install (new machine)

```bash
chezmoi init --apply gwynnnplaine/dotfiles
```

Clones into `~/.local/share/chezmoi` and applies. Optionally run `./install.sh`
for `brew bundle` + macOS App Support symlinks (Lazygit, Nushell) + Nushell
autoload generation.

## Layout

- `home/` — chezmoi source state (`.chezmoiroot` points here)

## Daily workflow

```bash
chezmoi update   # pull + apply (routine sync)
chezmoi diff     # preview pending changes
chezmoi apply    # apply
```

## Homebrew

Packages live in [`Brewfile`](./Brewfile). `install.sh` runs `brew bundle`.
Manually: `brew bundle install --file=./Brewfile`. Re-dump current state:
`brew bundle dump --file=./Brewfile --force`.

## Config directories (where apps actually read from)

| Tool | Effective config path |
|---|---|
| Ghostty / cmux | `~/.config/ghostty/config` (cmux renders terminals via libghostty and reads this) |
| Neovim | `~/.config/nvim` |
| Lazygit | `~/Library/Application Support/lazygit/config.yml` (symlinked to `~/.config` by `install.sh`) |
| Nushell | `~/.config/nushell/{config,env}.nu` (App Support symlinked by `install.sh`) |
| zsh | `~/.zprofile` (login env), `~/.zshrc` (bootstrap → `exec nu`) |

Font: `Iosevka Nerd Font Mono`, size 20.

Daily shell is **Nushell**; zsh just bootstraps the env and hands off. PATH and
aliases live in the `$env.PATH` and alias blocks of
`home/dot_config/nushell/config.nu`.

## Node

**fnm is the only Node version manager** (works in Nushell). Per-project
auto-switch is intentionally off: `config.nu` calls `fnm env` without
`--use-on-cd`, so fnm supplies the default Node only — run `fnm use` manually
when a project needs another version. Global CLIs like `pi` live in the fnm
default version, and each version has its own globals, so upgrading means
`fnm install <new> --reinstall-packages-from=default && fnm default <new>`.

Homebrew `node` is kept only as a dependency for brew formulae (`opencode`,
`mongosh`, `mongodb`). **nvm is not used.** Pi installs as
`@earendil-works/pi-coding-agent`.

## What's managed via chezmoi

- `~/.config/ghostty/config`
- `~/.config/nvim/**`
- `~/.config/lazygit/config.yml`
- `~/.config/nushell/{config,env}.nu`
- `~/.zshrc`, `~/.zprofile`
- `~/.pi/agent/SYSTEM.md`, `extensions/`, and `settings.json` (via
  `modify_settings.json`; Pi's own volatile fields are left alone)

Machine-local Pi state — `auth.json`, `trust.json`, `sessions/`, `npm/`, `git/`,
caches and logs — is ignored via `home/.chezmoiignore`. Agent skills are
declared under `skills:` in `home/.chezmoidata/packages.yaml` and installed into
`~/.agents/skills`; the list is authoritative, so anything undeclared there is
removed on `chezmoi apply`.
