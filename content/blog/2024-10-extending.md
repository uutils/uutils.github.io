+++
title = "Extending the Coreutils project - Rewriting base tools in Rust"
draft = true
date = 2024-10-01
authors = ["Sylvestre Ledru", "Terts Diepraam"]
+++

Over the last four years, we have been working on reimplementing some of the key Linux tools in Rust. We started with the [Coreutils](https://github.com/uutils/coreutils) and [findutils](https://github.com/uutils/findutils).

As we approach feature parity with the GNU Coreutils implementation, and as its adoption in production environments continues to expand, we have been thinking about what is next.

Given the overwhelming positive feedback around this initiative, we are going to extend our efforts to rewrite other parts of the modern Linux/Unix/Mac stack in Rust (still with Windows support in mind when relevant).
We also noticed a lot of contributions on these projects coming from a diverse group of hackers (475 different contributors on Coreutils alone!). With the growing enthusiasm for Rust and the eagerness to learn it, now is the best time to push this project forward. Rewriting in Rust will help with the long-term maintenance of the ecosystem, ensuring it stays robust, safe, and welcoming for new generations of contributors.

### Next Steps

For the next phase of the project, we are adopting the same approach: a drop-in replacement of the GNU C implementations. Here's what's coming next:

- **[diffutils](https://github.com/uutils/diffutils)** (transferred by Michael Howell) - Almost ready.
- **[procps](https://github.com/uutils/procps)** - Five programs started.
- **[acl](https://github.com/uutils/acl)** - Three programs started.
- **[util-linux](https://github.com/uutils/util-linux)** - A few programs started.
- **[bsdutils](https://github.com/uutils/bsdutils)** - One program started.
- **[login](https://github.com/uutils/login/)** - Skeleton started.
- **[hostname](https://github.com/uutils/hostname/)** - Almost empty.

These packages are part of the essential list for Debian and Ubuntu, and we're excited to push their Rust reimplementation further.

### GSoC 2024 Participation

This year, we had the privilege of mentoring three students during Google Summer of Code (GSoC) 2024, who contributed to the project in remarkable ways:

1. **Sreehari Prasad TM** worked on improving the support of Rust-based coreutils in Debian. His focus was on making uutils compatible with the GNU coreutils test suite. Sreehari resolved most of the failing tests for the `cp`, `mv`, and `ls` utilities and significantly enhanced compatibility with Debian.

2. **Hanbings** tackled the implementation of key GNU `findutils` utilities like `xargs`, `find`, `locate`, and `updatedb` in Rust. His work focused on improving compatibility with the GNU suite while enhancing performance, resulting in major progress on missing features and test code.

3. **[Third GSoC Student]** worked on implementing the `procps` suite, which includes utilities like `slabtop`, `top`, `pgrep`, `pidof`, `ps`, `pidwait`, and `snice`. This project involved cross-platform support and optimization of performance, focusing first on Linux implementations with plans to extend to other Unix systems in the future.

These students made significant contributions to the Rust coreutils project, pushing forward both feature parity and overall performance improvements.

### FAQ

**How long is it going to take?**

Some programs, like `diff`, `acl`, or `hostname`, should be completed quickly, while others will take years to finish.

**Do you hate the GNU project?**

Not at all. We often contribute to the upstream implementations when we identify issues, add missing tests, and so on.

**Why the MIT License?**

For consistency purposes. We're not interested in a license debate and will continue to use the MIT license, as we did with Coreutils.

**The binaries are too big. Does it really matter?**

Yes, Rust binaries are generally bigger than GNU's, but we don't think it's a blocker, even for embedded devices.

**Is it really safer?**

While Rust is better than C/C++ for security, these programs are often already very safe. Security is not the key argument for us in this rewrite.

**What about performance?**

Although we haven't started optimizing yet, Rust's design facilitates performance improvements naturally. We are confident that, in time, these tools will match or exceed the performance of their GNU counterparts.
