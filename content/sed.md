+++

title = "sed"
template = "project.html"

[extra]
playground = "sed -e 's/banana/🍌/g' -e 's/date/🌴/g' fruits.txt"
wip = true
status = "alpha"

+++

uutils sed is a work-in-progress Rust reimplementation of GNU sed, the stream editor for filtering and transforming text.

This project aims to be a drop-in replacement for GNU sed, supporting the full range of sed scripts and command-line options.

[![GNU test results](https://raw.githubusercontent.com/uutils/sed-tracking/refs/heads/main/gnu-results.svg)](https://github.com/uutils/sed-tracking)

> **Note:** This project is still in early development. Many features are not yet implemented and behavior may differ from GNU sed.

# Goals

Implement a cross-platform, memory-safe sed that is compatible with GNU sed scripts and command-line interface.

# Beyond GNU

GNU reports every error as a single line on stderr, which says *what* went wrong but not *where*. A sed script is a small language, so when it fails to parse at a terminal, uutils sed echoes it back and points a caret at the part that is at fault, the way a compiler does. [Try it in the playground](/playground?cmd=sed%20-e%20%27s%2Fapple%2F%F0%9F%8D%8E%2F%27%20-e%20%27s%2Fbanana%2F%F0%9F%8D%8C%2Fgx%27%20fruits.txt).

Scripts and pipes still get the plain GNU one-line message. See [Pointing at the error](/blog/2026-08-error-diagnostics/) for how it works.

# Contributing

To contribute to uutils sed, please see [CONTRIBUTING](https://github.com/uutils/sed/blob/main/CONTRIBUTING.md).

# License

uutils sed is licensed under the MIT License - see the [LICENSE](https://github.com/uutils/sed/blob/main/LICENSE) file for details.

GNU sed is licensed under the GPL 3.0 or later.
