+++

title = "grep"
template = "project.html"

[extra]
playground = "grep -ri banana ."
status = "beta"

+++

Rust implementation of GNU grep: `grep`, `egrep` and `fgrep`.

This project aims to be a drop-in replacement of the original commands.

[![GNU test results](https://raw.githubusercontent.com/uutils/grep-tracking/refs/heads/main/gnu-results.svg)](https://github.com/uutils/grep-tracking)

# Goals

This project aims to be a drop-in replacement for GNU grep. Differences with GNU are treated as bugs.

# Installation

## Homebrew (macOS, Linux)

```bash
brew install uutils-grep
```

The command is installed as `uu-grep`. To use it under its normal name, add the `uubin` directory to your `PATH`:

```bash
export PATH="$(brew --prefix)/opt/uutils-grep/libexec/uubin:$PATH"
```

See the [Homebrew formula](https://formulae.brew.sh/formula/uutils-grep).

## Debian

Available in Debian unstable:

```bash
sudo apt install rust-grep
```

The command is installed as `rust-grep`; the unprefixed binary is available at `/usr/lib/cargo/bin/grep/grep`.

See the [Debian package tracker](https://tracker.debian.org/pkg/rust-uu-grep).

# Contributing

To contribute to uutils grep, please see [CONTRIBUTING](https://github.com/uutils/grep/blob/main/CONTRIBUTING.md).

# License

uutils grep is licensed under the MIT License - see the [LICENSE](https://github.com/uutils/grep/blob/main/LICENSE) file for details.

GNU grep is licensed under the GPL 3.0 or later.
