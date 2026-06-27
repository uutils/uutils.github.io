+++

title = "shadow"
template = "project.html"
aliases = ["/shadow-rs"]

[extra]
wip = true

+++

Memory-safe Rust reimplementation of Linux shadow-utils: `useradd`, `userdel`, `usermod`, `passwd`, `pwck`, `chpasswd`, `chage`, `groupadd`, `groupdel`, `groupmod`, `grpck`, `chfn`, `chsh`, and `newgrp`.

This project aims to be a drop-in replacement for the original commands, with the same flags, exit codes, and output format as GNU shadow-utils.

# Goals

This project aims to be a drop-in replacement for the GNU shadow-utils, with a focus on:

- **Drop-in compatibility** - same flags, same exit codes, same output format as GNU shadow-utils.
- **Memory safety** - eliminating buffer overflows and use-after-free vulnerabilities through Rust's type system.
- **Security hardening** - Landlock sandboxing and privilege dropping.
- **Comprehensive testing** - unit tests, property-based tests, integration tests, and fuzz targets.

# Contributing

To contribute to uutils shadow, please see [CONTRIBUTING](https://github.com/uutils/shadow/blob/main/CONTRIBUTING.md).

# License

uutils shadow is licensed under the MIT License - see the [LICENSE](https://github.com/uutils/shadow/blob/main/LICENSE) file for details.

GNU shadow-utils is licensed under the BSD 3-Clause License.
