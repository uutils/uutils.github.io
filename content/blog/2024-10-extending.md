+++
title = "Extending the Coreutils project - Rewriting base tools in Rust"
draft = true
date = 2024-10-01
authors = ["Sylvestre Ledru"]
+++

Over the last four years, we have been working on reimplementing some of the key Linux tools in Rust. We started with the [Coreutils](https://github.com/uutils/coreutils) and [findutils](https://github.com/uutils/findutils).

As we approach feature parity with the GNU Coreutils implementation, and as its adoption in production environments continues to expand, we have been thinking about what is next.

Given the overwhelming positive feedback around this initiative, we are going to extend our efforts to rewrite other parts of the modern Linux/Unix/Mac stack in Rust (still with Windows support in mind when relevant). These efforts will be managed under the [uutils umbrella](https://github.com/uutils/), which will allow us to maintain a cohesive and unified approach across various utilities.

We also noticed a lot of contributions on these projects coming from a diverse group of hackers (503 different contributors on Coreutils alone!). With the growing enthusiasm for Rust and the eagerness to learn it, now is the best time to push this project forward. Rewriting in Rust will help with the long-term maintenance of the ecosystem, ensuring it stays robust, safe, and welcoming for new generations of contributors.

### Vision for the Future

As we expand the scope of the project, we envision a future where Rust becomes the backbone of essential Linux, Unix, and macOS system tools. Our focus will be on improving security, ensuring long-term maintainability, and optimizing performance for both modern and legacy systems. Through the uutils umbrella, we aim to create a more secure, efficient, and scalable alternative to the traditional GNU tools.

### Specific Benefits of Rust

Rust offers several advantages over C/C++, particularly in terms of memory safety, concurrency, and performance. By eliminating common security issues such as null pointer dereferences and buffer overflows, Rust allows us to build tools that are inherently safer. Its modern compiler tooling also enables us to optimize performance without sacrificing code safety, ensuring that our utilities can handle the demands of modern computing environments while remaining easy to maintain.

### Challenges and Opportunities

As with any large-scale reimplementation, there are challenges to overcome. Porting complex utilities from C to Rust requires careful consideration of edge cases and platform-specific behaviors. Additionally, ensuring full compatibility across Linux, Unix, and potentially macOS environments presents unique challenges. However, these challenges also offer opportunities for growth and innovation, allowing us to rethink and refine core system utilities for modern needs. Rust's modern design gives us the chance to improve both security and performance while maintaining cross-platform compatibility.

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

### GSoC 2024 Participation: Proof of Our Commitment

This year, as part of our ongoing commitment to enhancing and expanding Rust-based tools, we had the privilege of mentoring three students during Google Summer of Code (GSoC) 2024. Their work exemplifies the project's momentum and showcases the contributions of the next generation of developers:

1. **Sreehari Prasad TM** worked on improving the support of Rust-based coreutils in Debian. His focus was on making uutils compatible with the GNU coreutils test suite. Sreehari resolved most of the failing tests for the `cp`, `mv`, and `ls` utilities and significantly enhanced compatibility with Debian.

2. **Hanbings** tackled the implementation of key GNU `findutils` utilities like `xargs`, `find`, `locate`, and `updatedb` in Rust. His work focused on improving compatibility with the GNU suite while enhancing performance, resulting in major progress on missing features and test code.

3. **Krysztal Huang** worked on implementing the `procps` suite, which includes utilities like `slabtop`, `top`, `pgrep`, `pidof`, `ps`, `pidwait`, and `snice`. This project involved cross-platform support and optimization of performance, focusing first on Linux implementations with plans to extend to other Unix systems in the future.

These students made significant contributions to the Rust coreutils project, demonstrating our continued dedication to open-source development and our belief in Rust as the foundation for the future of system tools. The GSoC projects are a testament to our vision of building a sustainable, high-performance toolchain for the Linux/Unix world, ensuring its evolution and security for years to come.

### Call to Action for Contributors

We are always looking for contributors who are passionate about system-level programming and Rust. Whether you're experienced with GNU utilities or just learning Rust, your contributions will be invaluable to this project. You can get involved by picking up good-first issues, reviewing code, or even helping us test new features across various platforms. The [uutils GitHub organization](https://github.com/uutils) has all the information you need to get started. You can also sponsor the project through [GitHub Sponsors](https://github.com/sponsors/uutils).

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
