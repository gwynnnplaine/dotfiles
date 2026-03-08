# Brew Setup

Quickly install all Homebrew packages on any machine.

## Installation

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install all packages from Brewfile
brew bundle install --file=./Brewfile

# Or with verbose output
brew bundle install --file=./Brewfile --verbose
```

## Update

```bash
# Update all packages
brew bundle install --file=./Brewfile
```

## Export Current State

```bash
# Update Brewfile with currently installed packages
brew bundle dump --file=./Brewfile --force
```

## Common Commands

```bash
# Check for outdated packages
brew outdated

# Clean up
brew cleanup

# Link formula if needed
brew link <formula>
```
