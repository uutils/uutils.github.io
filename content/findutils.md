+++

title = "findutils"
template = "project.html"

[extra]
playground = "find . -name '*.md'"
status = "beta"

+++

Rust implementation of GNU findutils: `xargs`, `find`, `locate` and `updatedb`.

This project aims to be a drop-in replacement of the original commands.

# Goals

This project aims to be a drop-in replacement for the GNU findutils. Differences with GNU are treated as bugs.

[![BFS test results](https://raw.githubusercontent.com/uutils/findutils-tracking/refs/heads/main/bfs-results.svg)](https://github.com/uutils/findutils-tracking)

# Beyond GNU

GNU reports every error as a single line on stderr, which says *what* went wrong but not *where*. A `find` expression is a small language, so when it fails to parse at a terminal, uutils find echoes it back and points a caret at the part that is at fault, the way a compiler does. [Try it in the playground](/playground?cmd=find%20.%20-name%20%27%2A.md%27%20-o%20-nmae%20%27%2A.txt%27).

Scripts and pipes still get the plain GNU one-line message. See [Pointing at the error](/blog/2026-08-error-diagnostics/) for how it works.

# Contributing

To contribute to uutils findutils, please see [CONTRIBUTING](https://github.com/uutils/findutils/blob/main/CONTRIBUTING.md).

# License

uutils findutils is licensed under the MIT License - see the [LICENSE](https://github.com/uutils/findutils/blob/main/LICENSE) file for details.

GNU findutils is licensed under the GPL 3.0 or later.
